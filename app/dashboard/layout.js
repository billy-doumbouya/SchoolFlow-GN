import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

async function getCurrentUserAndTenant() {
  const cookieStore = cookies();
  const token = cookieStore.get("sf_token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const [user, tenant] = await Promise.all([
    prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
        tenantId: true,
      },
    }),
    prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      select: { id: true, name: true, slug: true, logoUrl: true },
    }),
  ]);

  if (!user || !tenant) redirect("/login");
  return { user, tenant };
}

export default async function DashboardRootLayout({ children }) {
  const { user, tenant } = await getCurrentUserAndTenant();

  return (
    <DashboardLayout user={user} tenant={tenant}>
      {children}
    </DashboardLayout>
  );
}
