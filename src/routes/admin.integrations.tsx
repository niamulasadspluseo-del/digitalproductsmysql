import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/integrations")({ component: IntegrationsAdmin });

function IntegrationsAdmin() {
  const settings = useStore((s) => s.settings);
  const [s, setS] = useState(settings);
  const i = s.integrations;
  const set = (patch: Partial<typeof i>) => setS({ ...s, integrations: { ...i, ...patch } });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tracking & Integrations</h1>
      <Card className="p-6 space-y-3">
        <div><Label>GA4 Measurement ID</Label><Input placeholder="G-XXXXXXXXXX" value={i.ga4 ?? ""} onChange={(e) => set({ ga4: e.target.value })} /></div>
        <div><Label>GTM Container ID</Label><Input placeholder="GTM-XXXXXX" value={i.gtm ?? ""} onChange={(e) => set({ gtm: e.target.value })} /></div>
        <div><Label>Meta Pixel ID</Label><Input value={i.metaPixel ?? ""} onChange={(e) => set({ metaPixel: e.target.value })} /></div>
        <div><Label>Google Ads Conversion ID</Label><Input value={i.googleAdsId ?? ""} onChange={(e) => set({ googleAdsId: e.target.value })} /></div>
        <div><Label>TikTok Pixel ID</Label><Input value={i.tiktokPixel ?? ""} onChange={(e) => set({ tiktokPixel: e.target.value })} /></div>
        <div><Label>Microsoft Clarity ID</Label><Input value={i.clarityId ?? ""} onChange={(e) => set({ clarityId: e.target.value })} /></div>
        <div><Label>Custom header script (raw JS)</Label><Textarea rows={6} className="font-mono text-xs" value={i.headerScript ?? ""} onChange={(e) => set({ headerScript: e.target.value })} /></div>
        <div><Label>Custom footer script (raw JS)</Label><Textarea rows={6} className="font-mono text-xs" value={i.footerScript ?? ""} onChange={(e) => set({ footerScript: e.target.value })} /></div>
        <Button onClick={async () => { try { await admin.saveSettings(s); toast.success("Saved — reload to inject."); } catch (e: any) { toast.error(e.message); } }}>Save integrations</Button>
      </Card>
    </div>
  );
}
