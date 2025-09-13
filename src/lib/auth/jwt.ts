import { createHmac } from 'crypto';

const JWT_SECRET = (process.env.JWT_SECRET || '').trim();
if (!JWT_SECRET) console.warn('JWT_SECRET missing');

export interface JwtPayload { id: number; email: string; username?: string | null; isVerified: boolean | null; isAcceptingMessages: boolean | null; exp?: number }

function b64url(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

export function signAuthToken(payload: JwtPayload, expiresIn: string = '7d') {
  if (!JWT_SECRET) throw new Error('JWT_SECRET missing');
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Date.now() + parseExpiry(expiresIn);
  const full = { ...payload, exp };
  const headerPart = b64url(JSON.stringify(header));
  const payloadPart = b64url(JSON.stringify(full));
  const data = `${headerPart}.${payloadPart}`;
  const sig = b64url(createHmac('sha256', JWT_SECRET).update(data).digest());
  return `${data}.${sig}`;
}

function parseExpiry(expr: string): number { // crude parser (d,h,m)
  const match = expr.match(/^(\d+)([dhm])$/);
  if (!match) return 7*24*60*60*1000;
  const val = parseInt(match[1]);
  const unit = match[2];
  if (unit==='d') return val*24*60*60*1000;
  if (unit==='h') return val*60*60*1000;
  if (unit==='m') return val*60*1000;
  return 7*24*60*60*1000;
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    if (!JWT_SECRET) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerPart, payloadPart, sig] = parts;
    const data = `${headerPart}.${payloadPart}`;
    const expected = b64url(createHmac('sha256', JWT_SECRET).update(data).digest());
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    // Constant-time compare
    let diff = 0;
    for (let i = 0; i < sigBuf.length; i++) {
      diff |= sigBuf[i] ^ expBuf[i];
    }
    if (diff !== 0) return null;
    const json = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
    if (json.exp && Date.now() > json.exp) return null;
    return json as JwtPayload;
  } catch {
    return null;
  }
}
