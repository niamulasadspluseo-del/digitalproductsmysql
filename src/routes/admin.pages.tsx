import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages")({ component: PagesAdmin });

function PagesAdmin() {
  const pages = useStore((s) => s.pages);
  const [draft, setDraft] = useState(pages);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Static Pages</h1>
      <Card className="p-6">
        <Tabs defaultValue="terms">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="refund">Refund</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          {(["terms", "privacy", "refund", "about", "contact"] as const).map((k) => (
            <TabsContent key={k} value={k}>
              <Textarea rows={20} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className="font-mono text-sm" />
            </TabsContent>
          ))}
        </Tabs>
        <Button className="mt-4" onClick={async () => { try { await admin.savePages(draft); toast.success("Pages saved"); } catch (e: any) { toast.error(e.message); } }}>Save all</Button>
      </Card>
    </div>
  );
}
