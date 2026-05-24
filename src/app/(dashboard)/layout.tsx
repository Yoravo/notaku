import { auth } from "@/lib/auth"
  import { headers } from "next/headers"
  import { redirect } from "next/navigation"
  import { Sidebar } from "@/app/components/sidebar"

  export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      redirect("/login")
    }

    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={session.user} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    )
  }