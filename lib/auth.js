import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "schoolflow-super-secret-key-change-in-production",
);
const JWT_EXPIRES_IN = "7d";

// ─── Token Operations ────────────────────────────────────────────────────────

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ─── Password Operations ─────────────────────────────────────────────────────

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ─── Cookie Token ────────────────────────────────────────────────────────────

export function getTokenFromRequest(request) {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fall back to cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, v.join("=")];
      }),
    );
    return cookies["sf_token"] || null;
  }
  return null;
}

// ─── Build token payload ─────────────────────────────────────────────────────

export function buildTokenPayload(user) {
  return {
    sub: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`,
  };
}
