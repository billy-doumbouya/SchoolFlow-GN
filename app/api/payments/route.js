// app/api/payments/route.js
import { listPayments, createPaymentIntent } from "@/services/paymentService";
import { createPaymentSchema } from "@/schemas";
import { successResponse, paginatedResponse, errorResponse } from "@/lib/api";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET(request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");
    if (!hasPermission(role, PERMISSIONS.PAYMENT_READ))
      return errorResponse("Forbidden", 403);

    const { payments, pagination } = await listPayments(
      tenantId,
      request.nextUrl.searchParams,
    );
    return paginatedResponse(payments, pagination);
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500);
  }
}

export async function POST(request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");

    const allowedRoles = [
      PERMISSIONS.PAYMENT_CREATE,
      PERMISSIONS.PAYMENT_MANAGE,
    ];
    if (!allowedRoles.some((p) => hasPermission(role, p))) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const data = await createPaymentSchema.validate(body, {
      abortEarly: false,
    });
    const result = await createPaymentIntent(tenantId, data);
    return successResponse(result, 201);
  } catch (err) {
    if (err.name === "ValidationError")
      return errorResponse("Validation failed", 422, err.errors);
    return errorResponse(err.message, err.statusCode || 500);
  }
}
