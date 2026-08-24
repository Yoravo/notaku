import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isEmailAdmin = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(session.user.email.toLowerCase());

  const effectiveRole = dbUser?.role === "ADMIN" || isEmailAdmin ? "ADMIN" : "USER";

  return (
    <DashboardLayoutClient
      user={{
        ...session.user,
        role: effectiveRole,
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
