import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, totals, orders, cart } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Bitcoin, Tag, X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const session = useStore((s) => s.sessionUserId);
  const items = useStore((s) => s.cart.items);
  const couponCode = useStore((s) => s.cart.couponCode);
  const crypto = useStore((s) => s.settings.payments.crypto);
  const nav = useNavigate();
  const t = totals();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [networkId, setNetworkId] = useState(crypto.networks[0]?.id ?? "");
  const [txid, setTxid] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const applyCoupon = () => {
    if (!code.trim()) return;
    try { cart.applyCoupon(code.trim()); setCode(""); toast.success("Coupon applied"); }
    catch (e: any) { toast.error(e.message ?? "Invalid coupon"); }
  };

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Address copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!session) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Please sign in to checkout</h1>
          <Link to="/auth"><Button className="mt-4">Sign in</Button></Link>
        </div>
      </SiteLayout>
    );
  }
  if (!items.length) {
    return <SiteLayout><div className="container mx-auto max-w-md px-4 py-20 text-center">Cart is empty.</div></SiteLayout>;
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return toast.error("Name and email required");
    if (!txid.trim()) return toast.error("Submit your transaction ID");
    try {
      const contact = { name: name.trim(), email: email.trim(), telegram: telegram.trim() || undefined, whatsapp: whatsapp.trim() || undefined };
      const net = crypto.networks.find((n) => n.id === networkId);
      const o = await orders.create({ method: "crypto", txid, network: net?.name + " (" + net?.chain + ")" }, contact);
      toast.success("Order placed! Status: pending. Wait for admin approval.");
      nav({ to: "/account/orders/$id", params: { id: o.id } });
    } catch (err: any) { toast.error(err.message); }
  }

  const selectedNetwork = crypto.networks.find((n) => n.id === networkId);

  return (
    <SiteLayout>
      <form onSubmit={placeOrder} className="container mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">Checkout</h1>

          <Card className="p-6">
            <h2 className="font-semibold">Your information</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div><Label>Full name *</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email *</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Telegram Username</Label><Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" /></div>
              <div><Label>WhatsApp Number</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Your download links will be sent to this email.</p>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4" /> Payment method</h2>
            {!crypto.enabled ? (
              <p className="mt-3 text-sm text-muted-foreground">No payment methods available.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 border rounded-md p-4 bg-muted/30">
                  <Bitcoin className="h-4 w-4" /> Cryptocurrency
                </div>
                <div><Label>Network</Label>
                  <Select value={networkId} onValueChange={setNetworkId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{crypto.networks.map((n) => <SelectItem key={n.id} value={n.id}>{n.name} · {n.chain}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {selectedNetwork && (
                  <div className="rounded-md bg-muted p-4 text-sm space-y-2">
                    <div className="text-muted-foreground">Send <strong>${t.total.toFixed(2)}</strong> worth of {selectedNetwork.name} to:</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 break-all font-mono text-xs">{selectedNetwork.address}</div>
                      <Button type="button" variant="outline" size="sm" onClick={() => copyAddress(selectedNetwork.address)} className="shrink-0">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}
                <div><Label>Transaction ID *</Label><Input required value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="0x..." /></div>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 h-fit">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            {t.items.map((i) => (
              <div key={i.product.id + (i.variation?.id ?? "")} className="flex justify-between">
                <span className="truncate pr-2">{i.product.title} × {i.qty}</span>
                <span>${i.line.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-medium"><Tag className="h-4 w-4 text-primary" />{couponCode}</span>
                <button type="button" onClick={() => { cart.removeCoupon(); toast.success("Coupon removed"); }} className="text-muted-foreground hover:text-foreground" aria-label="Remove coupon">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }} />
                <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm border-t pt-3">
            <div className="flex justify-between"><span>Subtotal</span><span>${t.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>−${t.discount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
          </div>
          <Button type="submit" className="w-full mt-4" size="lg" disabled={!crypto.enabled}>
            <Lock className="mr-2 h-4 w-4" />Place order
          </Button>
        </Card>
      </form>
    </SiteLayout>
  );
}
