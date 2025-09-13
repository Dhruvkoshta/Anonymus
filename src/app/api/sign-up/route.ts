import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { db } from "@/lib/dbConnect";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserVerifiedByUsername.length > 0) {
      if (existingUserVerifiedByUsername[0].verified) {
        return Response.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        await db
          .update(users)
          .set({
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
          })
          .where(eq(users.username, username));
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

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
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
