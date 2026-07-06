import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let r = products;
    if (q) r = r.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));
    if (cat !== "all") r = r.filter((p) => p.category === cat);
    r = [...r];
    if (sort === "newest") r.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "price-asc") r.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sort === "price-desc") r.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    return r;
  }, [products, q, cat, sort]);

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Shop</h1>
        <p className="mt-2 text-muted-foreground">Browse {products.length} digital products.</p>

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-sm" />
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
          {(q || cat !== "all") && <Button variant="ghost" onClick={() => { setQ(""); setCat("all"); }}>Clear</Button>}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!filtered.length && <p className="mt-12 text-center text-muted-foreground">No products match your filters.</p>}
      </div>
    </SiteLayout>
  );
}
