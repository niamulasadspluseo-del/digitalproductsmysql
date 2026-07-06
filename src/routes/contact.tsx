import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useStore, submitContactMessage } from "@/lib/store";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const c = useStore((s) => s.pages.contact);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) { toast.error("Please fill out all fields"); return; }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("Input too long"); return;
    }
    setSubmitting(true);
    try {
      await submitContactMessage(name, email, message);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="prose whitespace-pre-wrap text-foreground mb-8">{c}</div>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input required maxLength={100} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required type="email" maxLength={255} placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea required maxLength={2000} placeholder="Your message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send message"}</Button>
        </form>
      </div>
    </SiteLayout>
  );
}
