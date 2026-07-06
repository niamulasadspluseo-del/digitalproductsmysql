import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore, auth } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/account/settings")({ component: Settings });

function Settings() {
  const user = useStore((s) => s.users.find((u) => u.id === s.sessionUserId))!;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [billing, setBilling] = useState(user.billing ?? { country: "", address: "", city: "", zip: "" });
  useEffect(() => { setName(user.name); setEmail(user.email); }, [user.id]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <Button className="mt-4" onClick={() => { auth.updateProfile({ name, email }); toast.success("Profile updated"); }}>Save profile</Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Password</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Current password</Label><PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div><Label>New password</Label><PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
        </div>
        <Button className="mt-4" onClick={async () => {
          if (!pw.current) return toast.error("Enter current password");
          if (pw.next.length < 6) return toast.error("New password too short");
          try {
            await auth.changePassword(user.id, pw.current, pw.next);
            setPw({ current: "", next: "" }); toast.success("Password changed");
          } catch (e: any) { toast.error(e.message); }
        }}>Change password</Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Billing information</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Country</Label><Input value={billing.country ?? ""} onChange={(e) => setBilling({ ...billing, country: e.target.value })} /></div>
          <div><Label>City</Label><Input value={billing.city ?? ""} onChange={(e) => setBilling({ ...billing, city: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Address</Label><Input value={billing.address ?? ""} onChange={(e) => setBilling({ ...billing, address: e.target.value })} /></div>
          <div><Label>ZIP</Label><Input value={billing.zip ?? ""} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} /></div>
        </div>
        <Button className="mt-4" onClick={() => { auth.updateProfile({ billing }); toast.success("Billing saved"); }}>Save billing</Button>
      </Card>
    </div>
  );
}
