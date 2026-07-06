import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin, type FAQ } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/faqs")({ component: FaqAdmin });

function FaqAdmin() {
  const faqs = useStore((s) => s.faqs);
  const [f, setF] = useState<FAQ>({ id: "", question: "", answer: "" });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">FAQs</h1>
      <Card className="p-6 space-y-3">
        <Input placeholder="Question" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} />
        <Textarea placeholder="Answer" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} />
        <Button onClick={async () => { if (!f.question) return; try { await admin.saveFaq(f); setF({ id: "", question: "", answer: "" }); } catch (e: any) { toast.error(e.message); } }}>Add FAQ</Button>
      </Card>
      <div className="space-y-2">
        {faqs.map((x) => (
          <Card key={x.id} className="p-4 flex items-start gap-3">
            <div className="flex-1"><div className="font-medium">{x.question}</div><p className="text-sm text-muted-foreground mt-1">{x.answer}</p></div>
            <Button size="icon" variant="ghost" onClick={async () => { try { await admin.deleteFaq(x.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
