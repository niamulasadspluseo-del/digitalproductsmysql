import { createFileRoute, notFound } from "@tanstack/react-router";
import { useStore, type OrderStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Check, CreditCard, Wallet, Hash, Network, User, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/account/orders/$id")({ component: OrderDetail });

const FLOW: OrderStatus[] = ["Pending", "Payment Received", "In Progress", "Ready For Delivery", "Delivered"];
const TERMINAL: OrderStatus[] = ["Payment Not Received", "Refunded", "Cancel"];

function OrderDetail() {
  const { id } = Route.useParams();
  const ready = useStore((s) => s.ready);
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  if (!ready) return null;
  if (!order) throw notFound();
  const stepIdx = FLOW.indexOf(order.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant={order.status === "Delivered" ? "default" : TERMINAL.includes(order.status) ? "destructive" : "secondary"} className="px-4 py-1 text-sm">{order.status}</Badge>
      </div>

      {!TERMINAL.includes(order.status) && (
        <Card className="p-6">
          <h2 className="font-semibold mb-5">Order status</h2>
          <div className="flex items-center gap-0">
            {FLOW.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center text-center relative">
                <div className={`h-9 w-9 rounded-full grid place-items-center text-sm ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < stepIdx ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
                </div>
                <div className={`mt-2 text-xs font-medium ${i <= stepIdx ? "text-foreground" : "text-muted-foreground"}`}>{s}</div>
                {i < FLOW.length - 1 && <div className={`absolute top-4 left-[calc(50%+18px)] right-[calc(50%+18px)] h-0.5 ${i < stepIdx ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </Card>
      )}
      {TERMINAL.includes(order.status) && (
        <Card className="p-6 border-destructive/50">
          <h2 className="font-semibold mb-1">Order {order.status}</h2>
          <p className="text-sm text-muted-foreground">This order has been marked as <strong>{order.status}</strong>.</p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="divide-y">
          {order.items.map((it, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1 pr-4">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground">{it.variationName ? it.variationName + " · " : ""}qty {it.qty} × ${it.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${(it.price * it.qty).toFixed(2)}</span>
                {order.status === "Delivered" && (
                  <a href={it.fileUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Download Your File</Button></a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-green-600">−${order.discount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Payment &amp; Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-4 w-4" /><span>Method</span></div>
            <div className="font-medium ml-6">Cryptocurrency</div>
            {order.payment.cardLast4 && <div className="ml-6">Card ending in <span className="font-mono">•••• {order.payment.cardLast4}</span></div>}
            {order.payment.network && <><div className="flex items-center gap-2 text-muted-foreground mt-3"><Network className="h-4 w-4" /><span>Network</span></div><div className="font-medium ml-6">{order.payment.network}</div></>}
            {order.payment.txid && <><div className="flex items-center gap-2 text-muted-foreground mt-3"><Hash className="h-4 w-4" /><span>TXID</span></div><div className="ml-6 break-all font-mono text-xs">{order.payment.txid}</div></>}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /><span>Contact info</span></div>
            <div className="ml-6 font-medium">{order.userName}</div>
            <div className="ml-6 text-muted-foreground">{order.userEmail}</div>
            {order.telegram && <div className="ml-6">Telegram: {order.telegram}</div>}
            {order.whatsapp && <div className="ml-6">WhatsApp: {order.whatsapp}</div>}
          </div>
        </div>
      </Card>
    </div>
  );
}
