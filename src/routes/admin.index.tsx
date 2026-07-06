import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const orders = useStore((s) => s.orders);
  const users = useStore((s) => s.users.filter((u) => u.role === "customer"));
  const products = useStore((s) => s.products);
  const revenue = orders.filter((o) => o.status !== "Refunded" && o.status !== "Cancel" && o.status !== "Payment Not Received").reduce((s, o) => s + o.total, 0);
  const sales = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  const counts: Record<string, number> = {};
  orders.forEach((o) => o.items.forEach((i) => { counts[i.productId] = (counts[i.productId] ?? 0) + i.qty; }));
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, qty]) => ({ p: products.find((x) => x.id === id)!, qty }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={DollarSign} label="Revenue" value={`$${revenue.toFixed(2)}`} />
        <Stat icon={ShoppingBag} label="Orders" value={orders.length} />
        <Stat icon={Package} label="Items sold" value={sales} />
        <Stat icon={Users} label="Customers" value={users.length} />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Best selling products</h2>
        {best.length ? (
          <ul className="space-y-2">{best.map(({ p, qty }) => p && <li key={p.id} className="flex justify-between border-b last:border-0 pb-2"><span>{p.title}</span><span className="font-semibold">{qty} sold</span></li>)}</ul>
        ) : <p className="text-sm text-muted-foreground">No sales yet.</p>}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Recent orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((o) => <div key={o.id} className="flex justify-between border-b last:border-0 pb-3 text-sm"><span>{o.items.map((i) => i.title).join(", ")} · {o.userName}</span><span>${o.total.toFixed(2)} · {o.status}</span></div>)}
          {!orders.length && <div className="text-sm text-muted-foreground">No orders.</div>}
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return <Card className="p-5"><Icon className="h-5 w-5 text-muted-foreground" /><div className="mt-2 text-2xl font-bold">{value}</div><div className="text-sm text-muted-foreground">{label}</div></Card>;
}
