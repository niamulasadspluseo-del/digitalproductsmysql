import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LayoutDashboard, Package, Folder, ShoppingBag, Users, Ticket, Star, FileText, MessageSquare, HelpCircle, FileEdit, Palette, BarChart3, CreditCard, Code2, Mail, Menu, X } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories & Tags", icon: Folder },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/pages", label: "Static Pages", icon: FileEdit },
  { to: "/admin/branding", label: "Branding", icon: Palette },
  { to: "/admin/integrations", label: "Integrations", icon: Code2 },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function SidebarNav({ onNav }: { onNav?: () => void }) {
  return (
    <nav className="space-y-1 text-sm">
      {links.map((l) => (
        <Link key={l.to} to={l.to} onClick={onNav} activeOptions={{ exact: !!(l as any).exact }} activeProps={{ className: "bg-accent text-accent-foreground font-medium" }} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
          <l.icon className="h-4 w-4" /> {l.label}
        </Link>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const user = useStore((s) => s.users.find((u) => u.id === s.sessionUserId));
  const ready = useStore((s) => s.ready);
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { if (!ready) return; if (!user) nav({ to: "/auth" }); else if (user.role !== "admin") nav({ to: "/" }); }, [user, nav, ready]);
  if (!ready) return null;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 container mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden md:block md:sticky md:top-20 h-fit">
          <SidebarNav />
        </aside>

        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-accent"><Menu className="h-5 w-5" /></button>
            <h2 className="font-semibold text-sm">Admin Menu</h2>
          </div>
          <Outlet />
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Navigation</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-md hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <SidebarNav onNav={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
