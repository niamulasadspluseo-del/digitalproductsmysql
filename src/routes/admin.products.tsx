import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin, type Product, type Variation } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

const empty: Product = { id: "", slug: "", title: "", description: "", price: 0, category: "templates", tags: [], image: "", fileUrl: "", variations: [], createdAt: Date.now() };

function ProductsAdmin() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [edit, setEdit] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  function openNew() { setEdit({ ...empty, id: "", createdAt: Date.now() }); setOpen(true); }
  function openEdit(p: Product) { setEdit({ ...p, variations: [...p.variations] }); setOpen(true); }
  async function save() {
    if (!edit) return;
    if (!edit.title || !edit.price) return toast.error("Title and price required");
    try { await admin.saveProduct(edit); setOpen(false); toast.success("Saved"); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add product</Button>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <Card key={p.id} className="p-3 flex items-center gap-3">
            <img src={p.image} alt={p.title} className="h-14 w-14 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.category} · ${p.salePrice ?? p.price} · {p.variations.length} variations</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit2 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={async () => { if (!confirm("Delete?")) return; try { await admin.deleteProduct(p.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "Add"} product</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} /></div>
                <div><Label>Sale price</Label><Input type="number" value={edit.salePrice ?? ""} onChange={(e) => setEdit({ ...edit, salePrice: e.target.value ? +e.target.value : undefined })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Category</Label>
                  <Select value={edit.category} onValueChange={(v) => setEdit({ ...edit, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Tags (comma)</Label><Input value={edit.tags.join(",")} onChange={(e) => setEdit({ ...edit, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
              </div>
              <div><Label>Image URL</Label><Input value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} placeholder="https://..." /></div>
              <div>
                <Label className="flex items-center gap-2"><Upload className="h-4 w-4" />Download file URL</Label>
                <Input value={edit.fileUrl} onChange={(e) => setEdit({ ...edit, fileUrl: e.target.value })} placeholder="https://.../file.zip" />
                <p className="text-xs text-muted-foreground mt-1">Or paste a data URL for small files.</p>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!edit.featured} onCheckedChange={(v) => setEdit({ ...edit, featured: v })} />Featured</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!edit.newRelease} onCheckedChange={(v) => setEdit({ ...edit, newRelease: v })} />New release</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={!!edit.bestSeller} onCheckedChange={(v) => setEdit({ ...edit, bestSeller: v })} />Best seller</label>
              </div>

              <div>
                <Label>Variations</Label>
                <div className="space-y-2 mt-2">
                  {edit.variations.map((v, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Name" value={v.name} onChange={(e) => { const arr = [...edit.variations]; arr[i] = { ...v, name: e.target.value }; setEdit({ ...edit, variations: arr }); }} />
                      <Input type="number" placeholder="Price" value={v.price} onChange={(e) => { const arr = [...edit.variations]; arr[i] = { ...v, price: +e.target.value }; setEdit({ ...edit, variations: arr }); }} />
                      <Button size="icon" variant="ghost" onClick={() => setEdit({ ...edit, variations: edit.variations.filter((_, x) => x !== i) })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setEdit({ ...edit, variations: [...edit.variations, { id: "v-" + Math.random().toString(36).slice(2, 6), name: "", price: 0 }] })}>Add variation</Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={save}>Save</Button>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
