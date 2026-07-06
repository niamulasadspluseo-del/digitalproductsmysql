import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin, type Testimonial } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/testimonials")({ component: TestiAdmin });

function TestiAdmin() {
  const items = useStore((s) => s.testimonials);
  const [t, setT] = useState<Testimonial>({ id: "", name: "", role: "", text: "", rating: 5 });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Testimonials</h1>
      <Card className="p-6 space-y-3">
        <Input placeholder="Name" value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} />
        <Input placeholder="Role" value={t.role} onChange={(e) => setT({ ...t, role: e.target.value })} />
        <Textarea placeholder="Quote" value={t.text} onChange={(e) => setT({ ...t, text: e.target.value })} />
        <Input type="number" min={1} max={5} value={t.rating} onChange={(e) => setT({ ...t, rating: +e.target.value })} />
        <Button onClick={async () => { if (!t.name || !t.text) return; try { await admin.saveTestimonial(t); setT({ id: "", name: "", role: "", text: "", rating: 5 }); } catch (e: any) { toast.error(e.message); } }}>Add testimonial</Button>
      </Card>
      <div className="space-y-2">
        {items.map((x) => (
          <Card key={x.id} className="p-4 flex items-start gap-3">
            <div className="flex-1"><div className="font-medium">{x.name} · {x.role}</div><p className="text-sm text-muted-foreground mt-1">{x.text}</p></div>
            <Button size="icon" variant="ghost" onClick={async () => { try { await admin.deleteTestimonial(x.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
