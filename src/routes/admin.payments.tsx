import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsAdmin });

function PaymentsAdmin() {
  const settings = useStore((s) => s.settings);
  const [s, setS] = useState(settings);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Gateways</h1>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Manual Crypto Payments</h2>
          <Switch checked={s.payments.crypto.enabled} onCheckedChange={(v) => setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, enabled: v } } })} />
        </div>
        <div className="space-y-2">
          {s.payments.crypto.networks.map((n, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end">
              <div><Label className="text-xs">Coin</Label><Input value={n.name} onChange={(e) => { const arr = [...s.payments.crypto.networks]; arr[i] = { ...n, name: e.target.value }; setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, networks: arr } } }); }} /></div>
              <div><Label className="text-xs">Chain</Label><Input value={n.chain} onChange={(e) => { const arr = [...s.payments.crypto.networks]; arr[i] = { ...n, chain: e.target.value }; setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, networks: arr } } }); }} /></div>
              <div><Label className="text-xs">Wallet address</Label><Input value={n.address} onChange={(e) => { const arr = [...s.payments.crypto.networks]; arr[i] = { ...n, address: e.target.value }; setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, networks: arr } } }); }} /></div>
              <Button size="icon" variant="ghost" onClick={() => setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, networks: s.payments.crypto.networks.filter((_, x) => x !== i) } } })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setS({ ...s, payments: { ...s.payments, crypto: { ...s.payments.crypto, networks: [...s.payments.crypto.networks, { id: "n-" + Math.random().toString(36).slice(2, 6), name: "", chain: "", address: "" }] } } })}><Plus className="h-4 w-4 mr-1" />Add network</Button>
      </Card>

      <Button onClick={async () => { try { await admin.saveSettings(s); toast.success("Saved"); } catch (e: any) { toast.error(e.message); } }}>Save all payment settings</Button>
    </div>
  );
}
