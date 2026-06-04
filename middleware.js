import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "schoolflow-super-secret-key-change-in-production",
);

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/webhooks/guinepay",
  "/_next",
  "/favicon.ico",
];

// Role → allowed dashboard prefix
const ROLE_HOME = {
  SUPER_ADMIN: "/dashboard/admin",
  SCHOOL_ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/student",
};

// Routes restricted by role
const ROLE_RESTRICTED = {
  "/dashboard/admin": ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  "/dashboard/teacher": ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
  "/dashboard/student": ["SUPER_ADMIN", "SCHOOL_ADMIN", "STUDENT", "PARENT"],
};

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/"; // exact match uniquement
    return pathname.startsWith(route);
  });
}

function getTokenFromCookies(request) {
  const cookie = request.cookies.get("sf_token");
  return cookie?.value || null;
}

async function verifyJwt(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get token
  const token = getTokenFromCookies(request);
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  const payload = await verifyJwt(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("sf_token");
    return response;
  }

  // ── Profile & Notifications — accessible to all authenticated roles ─────────
  if (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/notifications") ||
    pathname.startsWith("/api/school") ||
    pathname.startsWith("/api/upload")
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-tenant-id", payload.tenantId);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── RBAC check: is the user allowed on this path? ──────────────────────────
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_RESTRICTED)) {
    if (
      pathname.startsWith(routePrefix) &&
      !allowedRoles.includes(payload.role)
    ) {
      // Redirect to their home
      const home = ROLE_HOME[payload.role] || "/login";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  // ── Inject user context into API route headers ────────────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-tenant-id", payload.tenantId);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
