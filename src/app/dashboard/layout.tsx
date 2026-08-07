import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import Navbar from "@/components/Navbar";
import FloatingNav from "@/components/FloatingNav";

export const dynamic = 'force-dynamic';
export const metadata = { title: "لوحة التحكم | حِرَفي" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/login");
  if (!user.role) redirect("/choose-role");
  if (user.role === "ARTISAN" && !session.role) redirect("/complete-profile");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0A0806", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div className="dashboard-container" style={{ flex: 1, display: "flex" }}>
        <Sidebar role={user.role} name={user.name} />
        <main className="dashboard-main" style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative", background: "#0D0905" }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse 70% 40% at 100% 0%, rgba(201,168,76,0.05) 0%, transparent 60%)",
          }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
      <FloatingNav role={user.role} />
    </div>
  );
}
