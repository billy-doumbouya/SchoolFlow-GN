import {
  getStudent,
  updateStudent,
  deleteStudent,
} from "@/services/studentService";
import { updateStudentSchema } from "@/schemas";
import { successResponse, errorResponse } from "@/lib/api";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET(request, { params }) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");

    if (!hasPermission(role, PERMISSIONS.STUDENT_READ)) {
      return errorResponse("Forbidden", 403);
    }

    const student = await getStudent(tenantId, params.id);
    return successResponse(student);
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");

    if (!hasPermission(role, PERMISSIONS.STUDENT_UPDATE)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const data = await updateStudentSchema.validate(body, {
      abortEarly: false,
    });
    const student = await updateStudent(tenantId, params.id, data);
    return successResponse(student);
  } catch (err) {
    if (err.name === "ValidationError")
      return errorResponse("Validation failed", 422, err.errors);
    return errorResponse(err.message, err.statusCode || 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const role = request.headers.get("x-user-role");

    if (!hasPermission(role, PERMISSIONS.STUDENT_DELETE)) {
      return errorResponse("Forbidden", 403);
    }

    const result = await deleteStudent(tenantId, params.id);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err.message, err.statusCode || 500);
  }
}
