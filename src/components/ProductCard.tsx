import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const price = product.salePrice ?? product.price;
  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
          <div className="absolute top-2 left-2 flex gap-1">
            {product.newRelease && <Badge variant="default">New</Badge>}
            {product.bestSeller && <Badge variant="secondary">Best Seller</Badge>}
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</div>
          <h3 className="mt-1 font-semibold leading-snug line-clamp-2">{product.title}</h3>
          <div className="mt-auto pt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold">${price}</span>
            {product.salePrice && <span className="text-sm text-muted-foreground line-through">${product.price}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
