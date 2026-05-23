import CreateMakersForm from "@/components/auth/create-makers-form";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

async function AdminCreateMakersPage() {
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
          <SidebarTrigger className="cursor-pointer md:hidden" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
              Team Onboarding
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
              Provision New System Makers and Administrators
            </p>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-8">
        <div className="max-w-md bg-card border border-border rounded-md p-8 shadow-none">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Create New Maker</h2>
            <p className="text-xs text-muted-foreground mt-1">Provision a new identity with Maker privileges.</p>
          </div>
          <CreateMakersForm />
        </div>
      </main>
    </div>
  );
}

export default AdminCreateMakersPage;
