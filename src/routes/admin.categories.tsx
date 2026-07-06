import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: CatsAdmin });

function CatsAdmin() {
  const categories = useStore((s) => s.categories);
  const tags = useStore((s) => s.tags);
  const [name, setName] = useState(""); const [icon, setIcon] = useState("");
  const [tag, setTag] = useState("");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Categories & Tags</h1>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Categories</h2>
        <div className="space-y-2 mb-4">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 border rounded-md px-3 py-2">
              <span className="text-xl">{c.icon}</span>
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.slug}</span>
              <Button size="icon" variant="ghost" onClick={async () => { try { await admin.deleteCategory(c.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Icon (emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={async () => { if (!name) return; try { await admin.saveCategory({ id: "", name, slug: "", icon }); setName(""); setIcon(""); toast.success("Added"); } catch (e: any) { toast.error(e.message); } }}><Plus className="h-4 w-4" /></Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Tags</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => <Badge key={t} variant="secondary" className="gap-1">{t}<button onClick={async () => { try { await admin.saveTags(tags.filter((x) => x !== t)); } catch (e: any) { toast.error(e.message); } }}>×</button></Badge>)}
        </div>
        <div className="flex gap-2">
          <Input placeholder="New tag" value={tag} onChange={(e) => setTag(e.target.value)} />
          <Button onClick={async () => { if (!tag) return; try { await admin.saveTags([...tags, tag]); setTag(""); } catch (e: any) { toast.error(e.message); } }}><Plus className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
