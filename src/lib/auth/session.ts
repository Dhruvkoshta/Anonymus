import { getAuthCookie } from './cookies';
import { verifyAuthToken, JwtPayload } from './jwt';

export function getCurrentUser(): JwtPayload | null {
  const token = getAuthCookie();
  if (!token) return null;
  return verifyAuthToken(token);
}
