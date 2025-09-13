import bcrypt from 'bcryptjs';
import { db } from '@/lib/dbConnect';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { signAuthToken } from '@/lib/auth/jwt';
import { setAuthCookie, clearAuthCookie } from '@/lib/auth/cookies';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    if (!identifier || !password) {
      return Response.json({ success: false, message: 'Missing credentials' }, { status: 400 });
    }

    const found = await db.select().from(users).where(or(eq(users.email, identifier), eq(users.username, identifier))).limit(1);
    if (!found.length) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    const user = found[0];

    if (!user.verified) {
      return Response.json({ success: false, message: 'Please verify your account before logging in' }, { status: 403 });
    }
    if (!user.password) {
      return Response.json({ success: false, message: 'Password not set' }, { status: 500 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email!,
      username: user.username,
      isVerified: user.verified,
      isAcceptingMessages: user.isAcceptingMessages,
    });

    setAuthCookie(token);

    return Response.json({ success: true, message: 'Logged in', user: { id: user.id, username: user.username, email: user.email } });
  } catch (e) {
    console.error('Login error', e);
    return Response.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() { // logout
  clearAuthCookie();
  return Response.json({ success: true, message: 'Logged out' });
}
