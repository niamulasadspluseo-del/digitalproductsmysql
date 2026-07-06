import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, cart, addReview, auth } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const ready = useStore((s) => s.ready);
  const product = useStore((s) => s.products.find((p) => p.slug === slug));
  const reviews = useStore((s) => s.reviews.filter((r) => r.productId === product?.id && r.approved));
  const session = useStore((s) => s.sessionUserId);
  const nav = useNavigate();
  const [variation, setVariation] = useState<string | undefined>(product?.variations[0]?.id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  if (!ready) return null;
  if (!product) throw notFound();
  const price = product.variations.find((v) => v.id === variation)?.price ?? product.salePrice ?? product.price;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-10">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">{product.category}</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">{product.title}</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(avg) ? "fill-primary text-primary" : "text-muted"}`} />)}</div>
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">${price}</span>
            {product.salePrice && !variation && <span className="text-lg text-muted-foreground line-through">${product.price}</span>}
          </div>
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">{product.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>

          {product.variations.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Choose a version:</div>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button key={v.id} onClick={() => setVariation(v.id)} className={`rounded-md border px-4 py-2 text-sm ${variation === v.id ? "border-primary bg-primary/5" : ""}`}>
                    {v.name} · ${v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Button size="lg" className="gap-2" onClick={() => { cart.add(product.id, variation); toast.success("Added to cart"); }}>
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>
            <Button size="lg" variant="outline" onClick={() => { cart.add(product.id, variation, 1, false); nav({ to: "/checkout" }); }}>Buy now</Button>
          </div>


        </div>
      </div>

      {/* Reviews */}
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex justify-between">
                <div className="font-medium">{r.userName}</div>
                <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </Card>
          ))}
          {!reviews.length && <p className="text-muted-foreground text-sm">No reviews yet.</p>}
        </div>

        {session ? (
          <Card className="mt-8 p-6">
            <h3 className="font-semibold">Write a review</h3>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)}>
                  <Star className={`h-5 w-5 ${i < rating ? "fill-primary text-primary" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <Textarea className="mt-3" placeholder="Share your experience..." value={text} onChange={(e) => setText(e.target.value)} />
            <Button className="mt-3" onClick={() => {
              if (!text.trim()) return toast.error("Please write something");
              addReview(product.id, rating, text.trim());
              setText(""); toast.success("Review submitted (awaiting approval)");
            }}>Submit review</Button>
          </Card>
        ) : (
          <Card className="mt-8 p-6 text-center">
            <p className="text-sm text-muted-foreground">Sign in to write a review.</p>
            <Button className="mt-3" onClick={() => nav({ to: "/auth" })}>Sign in</Button>
          </Card>
        )}
      </div>
    </SiteLayout>
  );
}
