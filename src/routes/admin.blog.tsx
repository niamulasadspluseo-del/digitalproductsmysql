import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin, type BlogPost } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({ component: BlogAdmin });

const empty: BlogPost = { id: "", slug: "", title: "", excerpt: "", content: "", cover: "", author: "Admin", publishedAt: Date.now() };

function BlogAdmin() {
  const posts = useStore((s) => s.blog);
  const [edit, setEdit] = useState<BlogPost | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        <Button onClick={() => { setEdit({ ...empty, publishedAt: Date.now() }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />New post</Button>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <Card key={p.id} className="p-3 flex gap-3 items-center">
            <img src={p.cover} alt="" className="h-14 w-20 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(p.publishedAt).toLocaleDateString()}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEdit({ ...p }); setOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={async () => { try { await admin.deleteBlog(p.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} post</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div><Label>Cover image URL</Label><Input value={edit.cover} onChange={(e) => setEdit({ ...edit, cover: e.target.value })} /></div>
              <div><Label>Excerpt</Label><Textarea value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} /></div>
              <div><Label>Content</Label><Textarea rows={10} value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} /></div>
              <div><Label>Author</Label><Input value={edit.author} onChange={(e) => setEdit({ ...edit, author: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={async () => { try { await admin.saveBlog(edit); setOpen(false); } catch (e: any) { toast.error(e.message); } }}>Save</Button><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
