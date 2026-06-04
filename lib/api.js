import { NextResponse } from "next/server";

// ─── Standard API Responses ───────────────────────────────────────────────────

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message, status = 400, details = null) {
  return NextResponse.json(
    { success: false, error: message, ...(details && { details }) },
    { status },
  );
}

export function paginatedResponse(data, pagination) {
  return NextResponse.json({
    success: true,
    data,
    pagination,
  });
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export function getPagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

// ─── Error classes ────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// ─── Route handler wrapper ────────────────────────────────────────────────────
// Catches errors and returns proper responses

export function withErrorHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (
        err.name === "AppError" ||
        err.name === "AuthError" ||
        err.name === "ForbiddenError" ||
        err.name === "NotFoundError"
      ) {
        return errorResponse(err.message, err.statusCode);
      }
      console.error("[API Error]", err);
      return errorResponse("Internal server error", 500);
    }
  };
}
