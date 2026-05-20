import UsersList from "@/components/auth/users-list";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

async function AdminViewUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* 🏙️ PREMIUM ADMIN HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-[64px] items-center gap-4 px-8">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
              Registry Audit
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
              Monitor and Manage Active Team Credentials
            </p>
          </div>
        </div>
      </header>

      <main className="p-8">
        <UsersList />
      </main>
    </div>
  );
}

export default AdminViewUsersPage;
