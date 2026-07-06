import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User as UserIcon, Search, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { auth, useStore, cartDrawer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const cartCount = useStore((s) => s.cart.items.reduce((a, b) => a + b.qty, 0));
  const session = useStore((s) => s.sessionUserId);
  const user = useStore((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
  const brand = useStore((s) => s.settings.brand);
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} className="h-8 w-auto object-contain" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">
              {brand.name?.charAt(0) ?? "P"}
            </div>
          )}
          <span className="text-lg font-bold tracking-tight">{brand.name}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/shop" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Shop</Link>
          <Link to="/blog" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Blog</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">About</Link>
          <Link to="/contact" activeProps={{ className: "text-foreground" }} className="text-muted-foreground hover:text-foreground">Contact</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => nav({ to: "/shop" })} aria-label="Search"><Search className="h-5 w-5" /></Button>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart" onClick={() => cartDrawer.open()}><ShoppingCart className="h-5 w-5" /></Button>
            {cartCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-[10px] pointer-events-none">{cartCount}</Badge>}
          </div>
          {session && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account"><UserIcon className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav({ to: "/account" })}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem>
                {user.role === "admin" && <DropdownMenuItem onClick={() => nav({ to: "/admin" })}><Shield className="mr-2 h-4 w-4" />Admin</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { auth.logout(); nav({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => nav({ to: "/auth" })} size="sm">Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}
