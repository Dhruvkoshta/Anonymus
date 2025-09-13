import { getCurrentUser } from '@/lib/auth/session';
import { db } from "@/lib/dbConnect";
import { eq } from "drizzle-orm";
import { messages } from "@/lib/db/schema";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user.id;

  try {
    const userMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, Number(userId)));

    if (userMessages.length === 0) {
      return Response.json(
        {
          success: true,
          messages: [],
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        messages: userMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting messages", error);
    return Response.json(
      {
        success: false,
        message: "Error getting messages",
      },
      { status: 500 }
    );
  }
}
