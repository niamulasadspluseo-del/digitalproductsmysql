import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
export const Route = createFileRoute("/privacy")({ component: () => {
  const c = useStore((s) => s.pages.privacy);
  return <SiteLayout><div className="container mx-auto max-w-3xl px-4 py-12 prose whitespace-pre-wrap text-foreground">{c}</div></SiteLayout>;
}});
