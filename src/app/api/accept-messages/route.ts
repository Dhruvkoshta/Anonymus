import { getCurrentUser } from '@/lib/auth/session';
import { db } from "@/lib/dbConnect";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
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
  const { acceptMessages } = await request.json();

  try {
    await db
      .update(users)
      .set({ isAcceptingMessages: acceptMessages })
      .where(eq(users.id, Number(userId)));

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message acceptance status", error);
    return Response.json(
      {
        success: false,
        message: "Error updating message acceptance status",
      },
      { status: 500 }
    );
  }
}

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
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    if (foundUser.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser[0].isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status", error);
    return Response.json(
      {
        success: false,
        message: "Error retrieving message acceptance status",
      },
      { status: 500 }
    );
  }
}