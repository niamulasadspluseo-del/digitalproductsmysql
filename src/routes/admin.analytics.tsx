import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

function Analytics() {
  const orders = useStore((s) => s.orders);
  const users = useStore((s) => s.users.filter((u) => u.role === "customer"));
  const products = useStore((s) => s.products);

  // Revenue by day (last 14)
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i)); d.setHours(0, 0, 0, 0);
    const key = d.toLocaleDateString();
    const rev = orders.filter((o) => new Date(o.createdAt).toLocaleDateString() === key && o.status !== "Refunded" && o.status !== "Cancel" && o.status !== "Payment Not Received").reduce((s, o) => s + o.total, 0);
    return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: +rev.toFixed(2) };
  });

  const counts: Record<string, number> = {};
  orders.forEach((o) => o.items.forEach((i) => { counts[i.productId] = (counts[i.productId] ?? 0) + i.qty; }));
  const productData = products.map((p) => ({ name: p.title.slice(0, 16), sold: counts[p.id] ?? 0 })).sort((a, b) => b.sold - a.sold).slice(0, 6);

  const customerGrowth = days.map((d, idx) => ({ day: d.day, customers: users.filter((u) => u.createdAt <= Date.now() - (13 - idx) * 86400000).length }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Revenue (last 14 days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Top products</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="sold" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Customer growth</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={customerGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
