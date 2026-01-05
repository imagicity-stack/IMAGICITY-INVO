import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RequireAuth } from "@/components/layout/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-gradient-to-br from-white via-brand-yellow/10 to-brand-red/5">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 lg:px-8">
            <div className="grid gap-6">{children}</div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
