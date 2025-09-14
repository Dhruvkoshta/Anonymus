import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import { db } from "@/lib/dbConnect";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    // db is initialized in lib/dbConnect; no explicit connect call needed
    const { username, email } = await request.json();

    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (user.length === 0) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const now = new Date();
        const isCodeNotExpired = !!user[0].verifyCodeExpiry && new Date(user[0].verifyCodeExpiry) > now;
        if (isCodeNotExpired) {
            return Response.json(
                {
                    success: true,
                    message: `Your code is not expired yet, use this code ${user[0].verifyCode}`,
                },
                { status: 200 }
            );
        }

        if (user[0].verified) {
            return Response.json(
                {
                    success: true,
                    message: `You are already verified`,
                },
                { status: 200 }
            );
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await db.update(users).set({
            verifyCode: verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
        }).where(eq(users.username, username));

        const result = await sendVerificationEmail(email, username, verifyCode);

        if (!result.success) {
            return Response.json(
                {
                    success: false,
                    message: 'Error while sending the verification code',
                },
                { status: 502 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Verification code sent successfully',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error Sending Code:', error);
        return Response.json(
            { success: false, message: 'Error Sending code' },
            { status: 500 }
        );
    }
}