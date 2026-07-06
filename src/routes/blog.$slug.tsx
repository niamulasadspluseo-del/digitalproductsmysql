import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({ component: Post });

function Post() {
  const { slug } = Route.useParams();
  const ready = useStore((s) => s.ready);
  const post = useStore((s) => s.blog.find((b) => b.slug === slug));
  const all = useStore((s) => s.blog);
  if (!ready) return null;
  if (!post) throw notFound();

  const related = all.filter((b) => b.id !== post.id).slice(0, 3);

  return (
    <SiteLayout>
      <article className="animate-fade-in">
        {/* Hero */}
        <header className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/30">
          <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight leading-tight">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
              <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4">
          <img
            src={post.cover}
            alt={post.title}
            className="mt-[-2rem] md:mt-[-3rem] aspect-[16/9] w-full rounded-xl object-cover shadow-lg"
          />

          {post.excerpt && (
            <p className="mt-10 text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}

          <div className="prose prose-lg mt-8 max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
            {post.content}
          </div>

          <div className="mt-12 pt-8 border-t flex items-center justify-between">
            <Link to="/blog">
              <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> All posts</Button>
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 bg-muted/30 border-t">
            <div className="container mx-auto max-w-6xl px-4 py-16">
              <h2 className="text-2xl font-bold mb-8">Keep reading</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((b) => (
                  <Link key={b.id} to="/blog/$slug" params={{ slug: b.slug }} className="group block">
                    <div className="overflow-hidden rounded-xl bg-background border hover:shadow-md transition-all">
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        <img src={b.cover} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">{b.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
