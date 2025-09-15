import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { db } from "@/lib/dbConnect";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Generate code and expiry upfront
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    // 1) Email uniqueness first to avoid constraint violation
    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingByEmail.length > 0) {
      const userByEmail = existingByEmail[0];
      if (userByEmail.verified) {
        return Response.json(
          {
            success: false,
            message: "Email is already registered. Please sign in or use another email.",
          },
          { status: 409 }
        );
      }
      // If email belongs to an unverified account but username differs, avoid changing username implicitly
      if (userByEmail.username !== username) {
        return Response.json(
          {
            success: false,
            message: "This email is already used for a different username. Please use that username or verify your previous sign-up.",
          },
          { status: 409 }
        );
      }
      // Refresh code/password/expiry for the same unverified email+username
      await db
        .update(users)
        .set({
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
        })
        .where(eq(users.email, email));
    } else {
      // 2) Username uniqueness when email is free
      const existingByUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingByUsername.length > 0) {
        const userByUsername = existingByUsername[0];
        if (userByUsername.verified) {
          return Response.json(
            {
              success: false,
              message: "Username is already taken",
            },
            { status: 409 }
          );
        }
        // Update the existing unverified username row with the provided email as it's free
        await db
          .update(users)
          .set({
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
          })
          .where(eq(users.username, username));
      } else {
        // 3) No conflicts -> create new user
        await db.insert(users).values({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          verified: false,
          isAcceptingMessages: true,
          createdAt: new Date(),
        });
      }
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    // Gracefully handle unique constraint errors from Neon/Postgres
    const err = error as { code?: string; constraint?: string } | undefined;
    if (err?.code === '23505') {
      const which = err?.constraint || 'unique constraint';
      const msg = which.includes('email')
        ? 'Email is already registered.'
        : which.includes('username')
          ? 'Username is already taken.'
          : 'Account already exists.';
      return Response.json(
        { success: false, message: msg },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, message: "Error registering user" },
      { status: 500 }
    );
  }
}
