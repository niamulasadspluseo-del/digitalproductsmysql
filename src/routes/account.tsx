import { createFileRoute, Outlet, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export const Route = createFileRoute("/account")({ component: AccountLayout });

function AccountLayout() {
  const session = useStore((s) => s.sessionUserId);
  const ready = useStore((s) => s.ready);
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { if (ready && !session) nav({ to: "/auth" }); }, [session, nav, ready]);
  if (!ready || !session) return null;
  return (
    <SiteLayout>
      <div className="container mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block">
          <nav className="space-y-1 text-sm">
            <SideLink to="/account">Dashboard</SideLink>
            <SideLink to="/account/orders">My Orders</SideLink>
            <SideLink to="/account/settings">Account Settings</SideLink>
          </nav>
        </aside>
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-accent"><Menu className="h-5 w-5" /></button>
            <h2 className="font-semibold text-sm">Account Menu</h2>
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
            <nav className="space-y-1 text-sm">
              <SideLink to="/account" onNav={() => setMenuOpen(false)}>Dashboard</SideLink>
              <SideLink to="/account/orders" onNav={() => setMenuOpen(false)}>My Orders</SideLink>
              <SideLink to="/account/settings" onNav={() => setMenuOpen(false)}>Account Settings</SideLink>
            </nav>
          </aside>
        </div>
      )}
    </SiteLayout>
  );
}

function SideLink({ to, children, onNav }: { to: string; children: React.ReactNode; onNav?: () => void }) {
  return <Link to={to} onClick={onNav} activeOptions={{ exact: to === "/account" }} activeProps={{ className: "bg-accent text-accent-foreground" }} className="block rounded-md px-3 py-2 hover:bg-accent">{children}</Link>;
}
