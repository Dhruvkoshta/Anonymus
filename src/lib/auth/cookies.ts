import { cookies } from 'next/headers';

const AUTH_COOKIE = 'auth_token';
interface CookieOpts { httpOnly: boolean; secure: boolean; sameSite: 'lax' | 'strict' | 'none'; path: string }
const COOKIE_OPTIONS: CookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export function setAuthCookie(token: string) {
  cookies().set(AUTH_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
}

export function clearAuthCookie() {
  cookies().delete(AUTH_COOKIE);
}

export function getAuthCookie(): string | undefined {
  return cookies().get(AUTH_COOKIE)?.value;
}
