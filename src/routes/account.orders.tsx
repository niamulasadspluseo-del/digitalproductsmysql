import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/account/orders")({ component: Orders });

function statusColor(s: string): string {
  const map: Record<string, string> = {
    "Pending": "bg-amber-600 text-white border-amber-600",
    "Payment Received": "bg-blue-600 text-white border-blue-600",
    "Payment Not Received": "bg-red-600 text-white border-red-600",
    "In Progress": "bg-cyan-600 text-white border-cyan-600",
    "Ready For Delivery": "bg-purple-600 text-white border-purple-600",
    "Delivered": "bg-emerald-600 text-white border-emerald-600",
    "Refunded": "bg-orange-600 text-white border-orange-600",
    "Cancel": "bg-gray-500 text-white border-gray-500",
  };
  return map[s] ?? "bg-secondary text-secondary-foreground";
}

function Orders() {
  const userId = useStore((s) => s.sessionUserId)!;
  const orders = useStore((s) => s.orders.filter((o) => o.userId === userId));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders ({orders.length})</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id} className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-md transition-shadow">
            <Link to="/account/orders/$id" params={{ id: o.id }} className="min-w-0 flex-1">
              <div className="font-medium truncate">{o.items.map((i) => i.title).join(", ")}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span>{o.items.length} item{o.items.length > 1 ? "s" : ""}</span>
                {o.payment.txid && <span className="font-mono text-xs">TXID: {o.payment.txid}</span>}
              </div>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold text-lg">${o.total.toFixed(2)}</span>
              <Badge variant="outline" className={"px-3 py-1 border " + statusColor(o.status)}>{o.status}</Badge>
              {o.status === "Delivered" && o.items[0]?.fileUrl && (
                <a href={o.items[0].fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="default"><Download className="h-4 w-4 mr-1" />Download Your File</Button>
                </a>
              )}
            </div>
          </Card>
        ))}
        {!orders.length && <Card className="p-8 text-center text-sm text-muted-foreground">No orders yet.</Card>}
      </div>
    </div>
  );
}
