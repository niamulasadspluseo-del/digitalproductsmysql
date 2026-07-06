import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/branding")({ component: BrandingAdmin });

function BrandingAdmin() {
  const settings = useStore((s) => s.settings);
  const [s, setS] = useState(settings);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Branding & Homepage</h1>
      <div className="space-y-6">
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Brand</h2>
          <div><Label>Brand name</Label><Input value={s.brand.name} onChange={(e) => setS({ ...s, brand: { ...s.brand, name: e.target.value } })} /></div>
          <div><Label>Logo URL</Label><Input value={s.brand.logo ?? ""} onChange={(e) => setS({ ...s, brand: { ...s.brand, logo: e.target.value } })} /></div>
          <div><Label>Favicon URL</Label><Input value={s.brand.favicon ?? ""} onChange={(e) => setS({ ...s, brand: { ...s.brand, favicon: e.target.value } })} /></div>
          <div><Label>Meta title</Label><Input value={s.brand.metaTitle} onChange={(e) => setS({ ...s, brand: { ...s.brand, metaTitle: e.target.value } })} /></div>
          <div><Label>Meta description</Label><Textarea value={s.brand.metaDesc} onChange={(e) => setS({ ...s, brand: { ...s.brand, metaDesc: e.target.value } })} /></div>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Homepage hero</h2>
          <div><Label>Eyebrow</Label><Input value={s.hero.eyebrow} onChange={(e) => setS({ ...s, hero: { ...s.hero, eyebrow: e.target.value } })} /></div>
          <div><Label>Title</Label><Input value={s.hero.title} onChange={(e) => setS({ ...s, hero: { ...s.hero, title: e.target.value } })} /></div>
          <div><Label>Subtitle</Label><Textarea value={s.hero.subtitle} onChange={(e) => setS({ ...s, hero: { ...s.hero, subtitle: e.target.value } })} /></div>
          <div><Label>CTA text</Label><Input value={s.hero.ctaText} onChange={(e) => setS({ ...s, hero: { ...s.hero, ctaText: e.target.value } })} /></div>
        </Card>

        <Button onClick={async () => { try { await admin.saveSettings(s); toast.success("Saved"); } catch (e: any) { toast.error(e.message); } }}>Save all</Button>
      </div>
    </div>
  );
}
