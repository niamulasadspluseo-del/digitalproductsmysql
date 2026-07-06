import { createFileRoute } from "@tanstack/react-router";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

function ReviewsAdmin() {
  const reviews = useStore((s) => s.reviews);
  const products = useStore((s) => s.products);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>
      <div className="space-y-2">
        {reviews.map((r) => {
          const p = products.find((x) => x.id === r.productId);
          return (
            <Card key={r.id} className="p-4 flex gap-3 items-start">
              <div className="flex-1">
                <div className="font-medium">{p?.title}</div>
                <div className="text-xs text-muted-foreground">{r.userName} · {new Date(r.createdAt).toLocaleDateString()}</div>
                <div className="flex mt-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</div>
                <p className="text-sm mt-2">{r.text}</p>
              </div>
              <div className="flex gap-2">
                {!r.approved && <Button size="sm" onClick={async () => { try { await admin.saveReview({ ...r, approved: true }); } catch (e: any) { toast.error(e.message); } }}><Check className="h-4 w-4 mr-1" />Approve</Button>}
                {r.approved && <span className="text-xs px-2 py-1 bg-muted rounded">Approved</span>}
                <Button size="icon" variant="ghost" onClick={async () => { try { await admin.deleteReview(r.id); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          );
        })}
        {!reviews.length && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}
