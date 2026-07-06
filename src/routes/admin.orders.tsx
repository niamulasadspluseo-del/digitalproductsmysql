import { createFileRoute } from "@tanstack/react-router";
import { useStore, orders as ordersApi, type OrderStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const STATUSES: OrderStatus[] = ["Pending", "Payment Received", "Payment Not Received", "In Progress", "Ready For Delivery", "Delivered", "Refunded", "Cancel"];

function OrdersAdmin() {
  const orders = useStore((s) => s.orders);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  const deliveringOrder = orders.find((o) => o.id === deliveringId);

  function handleStatusChange(id: string, v: OrderStatus) {
    if (v === "Delivered") {
      const order = orders.find((o) => o.id === id);
      if (!order) return;
      const urls: Record<string, string> = {};
      order.items.forEach((item) => { urls[item.productId] = item.fileUrl; });
      setFileUrls(urls);
      setDeliveringId(id);
    } else {
      ordersApi.setStatus(id, v);
    }
  }

  function confirmDelivery() {
    if (!deliveringId) return;
    ordersApi.setDeliveredWithFiles(deliveringId, fileUrls);
    setDeliveringId(null);
    setFileUrls({});
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="font-medium truncate">{o.items.map((i) => i.title).join(", ")}</div>
              <div className="text-sm text-muted-foreground">{o.userName} · {o.userEmail}</div>
              <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>{o.items.length} items</span>
                <span className="capitalize">{o.payment.method}</span>
                {o.payment.network && <span>{o.payment.network}</span>}
                {o.payment.txid && <span className="font-mono">TXID: {o.payment.txid}</span>}
                {o.telegram && <span>TG: {o.telegram}</span>}
                {o.whatsapp && <span>WA: {o.whatsapp}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold">${o.total.toFixed(2)}</div>
              <Select value={o.status} onValueChange={(v: OrderStatus) => handleStatusChange(o.id, v)}>
                <SelectTrigger className="w-44 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </Card>
        ))}
        {!orders.length && <Card className="p-8 text-center text-sm text-muted-foreground">No orders yet.</Card>}
      </div>

      <Dialog open={!!deliveringId} onOpenChange={(open) => { if (!open) { setDeliveringId(null); setFileUrls({}); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Deliver Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deliveringOrder?.items.map((item) => (
              <div key={item.productId}>
                <Label className="mb-1.5 block">{item.title}{item.variationName ? ` (${item.variationName})` : ""}</Label>
                <Input
                  placeholder="https://example.com/file.pdf"
                  value={fileUrls[item.productId] ?? ""}
                  onChange={(e) => setFileUrls((prev) => ({ ...prev, [item.productId]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeliveringId(null); setFileUrls({}); }}>Cancel</Button>
            <Button onClick={confirmDelivery}>Confirm Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
