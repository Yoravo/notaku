import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "./expenses-client";

export const metadata = {
  title: "Pencatatan Pengeluaran - NotaKu",
};

const PER_PAGE = 20;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; month?: string; new?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { page, q, category, month, new: newParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const validMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  const currentMonth = month && validMonthRegex.test(month) ? month : defaultMonth;

  // Hitung awal dan akhir bulan yang dipilih (dalam WIB)
  const [yearStr, monthStr] = currentMonth.split("-");
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const firstDay = new Date(Date.UTC(year, m, 1, 0, 0, 0));
  const lastDay = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59));

  // Karena data Date disimpan di UTC, kita offset ke belakang agar batasannya aman
  firstDay.setHours(firstDay.getHours() - 7);
  lastDay.setHours(lastDay.getHours() - 7);

  const where = {
    userId: session.user.id,
    date: { gte: firstDay, lte: lastDay },
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { notes: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [expenses, total, summaryData] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.expense.count({ where }),
    // Hitung total pengeluaran bulan ini (tanpa filter query/category)
    prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: firstDay, lte: lastDay },
      },
      _sum: { amount: true },
    })
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const totalAmount = Number(summaryData._sum.amount || 0);

  // Serialisasi
  const serializedExpenses = expenses.map((ex) => ({
    ...ex,
    amount: Number(ex.amount),
    date: ex.date.toISOString(),
    createdAt: ex.createdAt.toISOString(),
    updatedAt: ex.updatedAt.toISOString(),
  }));

  // Generate opsi bulan 6 bulan ke belakang
  const monthOptions = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const label = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d);
    monthOptions.push({ value: `${y}-${mm}`, label });
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <ExpensesClient
        expenses={serializedExpenses}
        totalPages={totalPages}
        currentPage={currentPage}
        searchQuery={q || ""}
        categoryFilter={category || ""}
        currentMonth={currentMonth}
        monthOptions={monthOptions}
        totalAmount={totalAmount}
        autoOpen={newParam === "1"}
      />
    </div>
  );
}
