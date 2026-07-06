import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin, type Coupon } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsAdmin });

function CouponsAdmin() {
  const coupons = useStore((s) => s.coupons);
  const [c, setC] = useState<Coupon>({ code: "", type: "percent", value: 10, usageLimit: 100, usedCount: 0 });
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Coupons</h1>
      <Card className="p-6">
        <h2 className="font-semibold mb-3">Create / update coupon</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Code</Label><Input value={c.code} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase() })} /></div>
          <div><Label>Type</Label>
            <Select value={c.type} onValueChange={(v: any) => setC({ ...c, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="percent">Percent (%)</SelectItem><SelectItem value="fixed">Fixed ($)</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Value</Label><Input type="number" value={c.value} onChange={(e) => setC({ ...c, value: +e.target.value })} /></div>
          <div><Label>Usage limit</Label><Input type="number" value={c.usageLimit ?? ""} onChange={(e) => setC({ ...c, usageLimit: e.target.value ? +e.target.value : undefined })} /></div>
          <div className="md:col-span-2"><Label>Expiry date</Label>
            <Input type="date" value={c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : ""} onChange={(e) => setC({ ...c, expiresAt: e.target.value ? new Date(e.target.value).getTime() : undefined })} />
          </div>
        </div>
        <Button className="mt-4" onClick={async () => { if (!c.code) return toast.error("Code required"); try { await admin.saveCoupon(c); toast.success("Saved"); setC({ code: "", type: "percent", value: 10, usageLimit: 100, usedCount: 0 }); } catch (e: any) { toast.error(e.message); } }}>Save coupon</Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">All coupons</h2>
        <div className="space-y-2">
          {coupons.map((co) => (
            <div key={co.code} className="flex items-center gap-3 border rounded-md p-3">
              <div className="font-mono font-semibold">{co.code}</div>
              <div className="text-sm text-muted-foreground">{co.type === "percent" ? `${co.value}%` : `$${co.value}`} off · used {co.usedCount}{co.usageLimit ? `/${co.usageLimit}` : ""}{co.expiresAt ? ` · expires ${new Date(co.expiresAt).toLocaleDateString()}` : ""}</div>
              <Button size="icon" variant="ghost" className="ml-auto" onClick={async () => { try { await admin.deleteCoupon(co.code); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
