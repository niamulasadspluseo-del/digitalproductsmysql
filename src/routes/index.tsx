import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, ArrowRight, Zap, Shield, Download } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const testimonials = useStore((s) => s.testimonials);
  const blog = useStore((s) => s.blog);
  const faqs = useStore((s) => s.faqs);
  const hero = useStore((s) => s.settings.hero);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newReleases = products.filter((p) => p.newRelease).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
        <div className="container mx-auto max-w-7xl px-4 py-24 md:py-32 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="h-3 w-3" /> {hero.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">{hero.title}</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{hero.subtitle}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/shop"><Button size="lg" className="gap-2 hover-scale">{hero.ctaText} <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/blog"><Button size="lg" variant="outline" className="hover-scale">Read the blog</Button></Link>
          </div>
          <div className="mt-12 grid grid-cols-3 max-w-xl mx-auto gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1"><Download className="h-5 w-5" />Instant delivery</div>
            <div className="flex flex-col items-center gap-1"><Shield className="h-5 w-5" />Secure checkout</div>
            <div className="flex flex-col items-center gap-1"><Star className="h-5 w-5" />Loved by creators</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Browse categories</h2>
          <Link to="/shop" className="text-sm font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((c, idx) => (
            <Link key={c.id} to="/shop" className="group animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <Card className="p-6 text-center hover-scale hover:shadow-md transition-shadow">
                <div className="font-semibold">{c.name}</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Featured Products" products={featured} />
      <Section title="New Releases" products={newReleases} />
      <Section title="Best Sellers" products={bestSellers} />

      {/* Testimonials */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What customers say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.id} className="p-6">
                <div className="flex gap-1 mb-3">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
                <p className="text-sm">"{t.text}"</p>
                <div className="mt-4 text-sm"><strong>{t.name}</strong><span className="text-muted-foreground"> · {t.role}</span></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">From the blog</h2>
          <Link to="/blog" className="text-sm font-medium hover:underline">All posts →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {blog.slice(0, 2).map((b) => (
            <Link key={b.id} to="/blog/$slug" params={{ slug: b.slug }}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow p-0">
                <div className="aspect-[16/9] bg-muted"><img src={b.cover} alt={b.title} className="h-full w-full object-cover" loading="lazy" /></div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.excerpt}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id}>
              <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
              <AccordionContent>{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}

import type { Product } from "@/lib/store";
function Section({ title, products }: { title: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <Link to="/shop" className="text-sm font-medium hover:underline">View all →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p, idx) => (
          <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${idx * 70}ms` }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
