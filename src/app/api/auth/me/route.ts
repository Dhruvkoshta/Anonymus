import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/dbConnect';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const jwtUser = getCurrentUser();
  if (!jwtUser) {
    return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const result = await db.select().from(users).where(eq(users.id, jwtUser.id)).limit(1);
  if (!result.length) {
    return Response.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  const u = result[0];
  return Response.json({ success: true, user: { id: u.id, email: u.email, username: u.username, isAcceptingMessages: u.isAcceptingMessages, isVerified: u.verified } });
}
