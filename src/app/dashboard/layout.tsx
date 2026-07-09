import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import Navbar from "@/components/Navbar";

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
    <div dir="rtl" style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar role={user.role} name={user.name} />
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative" }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse 80% 40% at 0% 0%, rgba(181,83,26,0.06) 0%, transparent 50%)",
          }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
