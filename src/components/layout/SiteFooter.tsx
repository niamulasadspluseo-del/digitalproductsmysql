import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export function SiteFooter() {
  const brand = useStore((s) => s.settings.brand);
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            {brand.logo ? <img src={brand.logo} alt={brand.name} className="h-8 w-auto" /> : <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">{brand.name.charAt(0)}</div>}
            <span className="text-lg font-bold">{brand.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{brand.metaDesc}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop">Categories</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <span>Design By Niamul.</span>
        </div>
      </div>
    </footer>
  );
}
