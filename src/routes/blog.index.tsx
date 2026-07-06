import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, User } from "lucide-react";

export const Route = createFileRoute("/blog/")({ component: Blog });

function Blog() {
  const posts = useStore((s) => s.blog);
  const [featured, ...rest] = posts;

  return (
    <SiteLayout>
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-24 text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Blog
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">Stories, guides & insights</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Practical tips for creators selling digital products.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="block group animate-fade-in"
          >
            <Card className="overflow-hidden p-0 md:grid md:grid-cols-2 hover:shadow-lg transition-all">
              <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Featured</span>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.publishedAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{featured.author}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Card>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((b, idx) => (
              <Link
                key={b.id}
                to="/blog/$slug"
                params={{ slug: b.slug }}
                className="block group animate-fade-in"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <Card className="overflow-hidden p-0 h-full flex flex-col hover:shadow-md transition-all hover-scale">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={b.cover}
                      alt={b.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.publishedAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{b.author}</span>
                    </div>
                    <h2 className="mt-2 font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                      {b.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{b.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read more <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">No posts yet. Check back soon.</div>
        )}
      </div>
    </SiteLayout>
  );
}
