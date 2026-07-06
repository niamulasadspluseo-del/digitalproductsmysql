import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, cart, totals } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const items = useStore((s) => s.cart.items);
  const couponCode = useStore((s) => s.cart.couponCode);
  const t = totals();
  const [code, setCode] = useState("");
  const nav = useNavigate();

  if (!items.length) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Discover great digital products in the shop.</p>
          <Link to="/shop"><Button className="mt-6">Browse shop</Button></Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <h1 className="text-3xl font-bold mb-4">Your cart</h1>
          {t.items.map((i) => (
            <Card key={i.product.id + (i.variation?.id ?? "")} className="p-4 flex gap-4 items-center">
              <img src={i.product.image} alt={i.product.title} className="h-20 w-20 rounded object-cover" />
              <div className="flex-1">
                <div className="font-semibold">{i.product.title}</div>
                {i.variation && <div className="text-xs text-muted-foreground">{i.variation.name}</div>}
                <div className="mt-1 text-sm">${i.unit} × <input type="number" min={1} value={i.qty} aria-label="Cart item quantity" onChange={(e) => cart.setQty(i.product.id, i.variation?.id, +e.target.value)} className="w-16 rounded border px-2 py-1" /></div>
              </div>
              <div className="font-semibold">${i.line.toFixed(2)}</div>
              <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => cart.remove(i.product.id, i.variation?.id)}><Trash2 className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
        <Card className="p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${t.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>−${t.discount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
          </div>
          <div className="mt-4">
            {couponCode ? (
              <div className="flex justify-between items-center rounded-md bg-muted px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><Tag className="h-4 w-4" />{couponCode}</span>
                <button className="text-xs underline" onClick={() => cart.removeCoupon()}>Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Button variant="outline" onClick={() => { try { cart.applyCoupon(code); setCode(""); toast.success("Coupon applied"); } catch (e: any) { toast.error(e.message); } }}>Apply</Button>
              </div>
            )}
          </div>
          <Button className="w-full mt-4" onClick={() => nav({ to: "/checkout" })}>Checkout</Button>
        </Card>
      </div>
    </SiteLayout>
  );
}
