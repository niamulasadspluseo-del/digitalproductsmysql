import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, MailOpen, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({ component: MessagesAdmin });

function MessagesAdmin() {
  const messages = useStore((s) => s.contactMessages ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = messages.find((m) => m.id === selectedId);
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">No messages yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Messages submitted through the contact form will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[360px_1fr] gap-4">
          <div className="space-y-2 md:max-h-[70vh] md:overflow-y-auto pr-1">
            {messages.map((m) => (
              <Card
                key={m.id}
                onClick={async () => { setSelectedId(m.id); if (!m.read) try { await admin.markMessageRead(m.id, true); } catch {} }}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${selectedId === m.id ? "border-primary" : ""} ${!m.read ? "bg-accent/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{m.name}</span>
                      {!m.read && <Badge variant="default" className="h-4 px-1.5 text-[10px]">NEW</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.message}</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>

          <div>
            {selected ? (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />{selected.email}
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={async () => { try { await admin.markMessageRead(selected.id, !selected.read); } catch (e: any) { toast.error(e.message); } }}>
                      <MailOpen className="h-4 w-4 mr-1" />{selected.read ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => { try { await admin.deleteMessage(selected.id); setSelectedId(null); } catch (e: any) { toast.error(e.message); } }}>
                      <Trash2 className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.message}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <a href={`mailto:${selected.email}?subject=Re: Your message&body=Hi ${selected.name},%0D%0A%0D%0A`}>
                    <Button><Mail className="h-4 w-4 mr-1" />Reply via email</Button>
                  </a>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center text-muted-foreground">
                Select a message to read
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
