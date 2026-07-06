import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
export const Route = createFileRoute("/refund-policy")({ component: () => {
  const c = useStore((s) => s.pages.refund);
  return <SiteLayout><div className="container mx-auto max-w-3xl px-4 py-12 prose whitespace-pre-wrap text-foreground">{c}</div></SiteLayout>;
}});
