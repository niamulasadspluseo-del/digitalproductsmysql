import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useStore, useCartDrawer, totals, cart, cartDrawer } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CartDrawer() {
  const [open, setOpen] = useCartDrawer();
  const items = useStore((s) => s.cart.items);
  const couponCode = useStore((s) => s.cart.couponCode);
  const products = useStore((s) => s.products);
  const t = totals();
  const [code, setCode] = useState("");
  const nav = useNavigate();

  const go = (to: "/cart" | "/checkout") => { cartDrawer.close(); nav({ to }); };
  const apply = () => {
    if (!code.trim()) return;
    try { cart.applyCoupon(code.trim()); setCode(""); toast.success("Coupon applied"); }
    catch (e: any) { toast.error(e.message ?? "Invalid coupon"); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your cart ({items.reduce((a, b) => a + b.qty, 0)})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-16">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button onClick={() => go("/cart")} variant="outline">Continue shopping</Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {t.items.map((it) => {
                const p = products.find((x) => x.id === it.product.id);
                if (!p) return null;
                return (
                  <li key={p.id + (it.variation?.id ?? "")} className="flex gap-3 animate-fade-in">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                      {it.variation && <div className="text-xs text-muted-foreground">{it.variation.name}</div>}
                      <div className="mt-1 text-sm font-semibold">${it.unit.toFixed(2)}</div>
                      <div className="mt-2 flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" aria-label="Decrease quantity" onClick={() => cart.setQty(p.id, it.variation?.id, it.qty - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{it.qty}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" aria-label="Increase quantity" onClick={() => cart.setQty(p.id, it.variation?.id, it.qty + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-muted-foreground" aria-label="Remove item" onClick={() => cart.remove(p.id, it.variation?.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t p-6 flex-col gap-3 sm:flex-col">
            {/* Coupon */}
            <div className="w-full">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-medium"><Tag className="h-4 w-4 text-primary" />{couponCode}</span>
                  <button onClick={() => { cart.removeCoupon(); toast.success("Coupon removed"); }} className="text-muted-foreground hover:text-foreground" aria-label="Remove coupon">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") apply(); }} />
                  <Button variant="outline" onClick={apply}>Apply</Button>
                </div>
              )}
            </div>

            <div className="w-full space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${t.subtotal.toFixed(2)}</span></div>
              {t.discount > 0 && (
                <div className="flex justify-between text-primary"><span>Discount</span><span>−${t.discount.toFixed(2)}</span></div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
              <p className="text-xs text-muted-foreground">Taxes calculated at checkout.</p>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("/checkout")}>Checkout</Button>
            <Button className="w-full" size="lg" variant="outline" onClick={() => go("/cart")}>View cart</Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
