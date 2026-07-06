import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, admin } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({ component: CustomersAdmin });

function CustomersAdmin() {
  const allUsers = useStore((s) => s.users.filter((u) => u.role === "customer"));
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const users = search ? allUsers.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())) : allUsers;

  async function handleResetPassword() {
    if (!resetUser || !newPassword) return;
    try {
      await admin.adminResetPassword(resetUser.id, newPassword);
      toast.success("Password reset for " + resetUser.name);
      setResetUser(null);
      setNewPassword("");
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers ({allUsers.length})</h1>
      <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="space-y-2">
        {users.map((u) => {
          const myOrders = orders.filter((o) => o.userId === u.id);
          const spent = myOrders.reduce((s, o) => s + o.total, 0);
          return (
            <Card key={u.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email} · joined {new Date(u.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">{myOrders.length} orders · ${spent.toFixed(2)} spent</div>
              </div>
              <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
              <div className="flex gap-1">
                {u.status !== "active" && <Button size="sm" variant="outline" onClick={async () => { try { await admin.setUserStatus(u.id, "active"); } catch (e: any) { toast.error(e.message); } }}>Activate</Button>}
                {u.status !== "suspended" && <Button size="sm" variant="outline" onClick={async () => { try { await admin.setUserStatus(u.id, "suspended"); } catch (e: any) { toast.error(e.message); } }}>Suspend</Button>}
                {u.status !== "banned" && <Button size="sm" variant="outline" onClick={async () => { try { await admin.setUserStatus(u.id, "banned"); } catch (e: any) { toast.error(e.message); } }}>Ban</Button>}
                <Button size="sm" variant="outline" onClick={() => { setResetUser({ id: u.id, name: u.name }); setNewPassword(""); }}>Reset Password</Button>
              </div>
            </Card>
          );
        })}
        {!users.length && <p className="text-sm text-muted-foreground">No customers yet.</p>}
      </div>

      <Dialog open={!!resetUser} onOpenChange={(o) => { if (!o) { setResetUser(null); setNewPassword(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {resetUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New temporary password</Label>
              <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" minLength={6} />
            </div>
            <Button onClick={handleResetPassword} disabled={newPassword.length < 6}>Set Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
