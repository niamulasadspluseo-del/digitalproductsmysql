import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

// Read hash at module level (before Supabase processes it during hydration)
let _pendingRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");

function AuthPage() {
  const nav = useNavigate();
  const session = useStore((s) => s.sessionUserId);
  const [resetMode, setResetMode] = useState(
    () => { const v = _pendingRecovery; _pendingRecovery = false; return v; }
  );
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setResetMode(true);
  }, []);
  useEffect(() => {
    if (session && !resetMode) nav({ to: "/account" });
  }, [session, resetMode, nav]);

  if (resetMode) return <ResetPasswordForm onDone={() => setResetMode(false)} />;

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>
            <TabsContent value="login" forceMount className="[&:not([data-state=active])]:hidden"><LoginForm /></TabsContent>
            <TabsContent value="signup" forceMount className="[&:not([data-state=active])]:hidden"><SignupForm /></TabsContent>
            <TabsContent value="forgot" forceMount className="[&:not([data-state=active])]:hidden"><ForgotForm /></TabsContent>
          </Tabs>

        </Card>
      </div>
    </SiteLayout>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  return (
    <form className="mt-6 space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true);
      try { const u = await auth.login(email, password); toast.success("Welcome back!"); nav({ to: u.role === "admin" ? "/admin" : "/account" }); }
      catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
    }}>
      <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div><Label>Password</Label><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
    </form>
  );
}
function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState("");
  const nav = useNavigate();
  return (
    <div>
      <form className="mt-6 space-y-3" onSubmit={async (e) => {
        e.preventDefault(); setLoading(true);
        try {
          const link = await auth.signup(form.name, form.email, form.password);
          if (link) setDevLink(link);
          else { toast.success("Account created! You can now login."); nav({ to: "/auth" }); }
        }
        catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
      }}>
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div><Label>Password</Label><PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</Button>
      </form>
      {devLink && (
        <div className="text-center space-y-2 py-4">
          <p className="text-green-600 font-medium text-sm">Account created! Verify your email:</p>
          <a href={devLink} className="text-sm text-primary underline break-all">{devLink}</a>
          <p className="text-xs text-muted-foreground">Also sent to terminal (dev mode).</p>
        </div>
      )}
    </div>
  );
}
function ResetPasswordForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const user = auth.current();
  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-center">Reset Your Password</h2>
          {user ? (
            <form className="mt-6 space-y-3" onSubmit={async (e) => {
              e.preventDefault(); setLoading(true);
              try {
                await auth.updatePassword(user.id, password);
                await auth.logout();
                onDone();
                toast.success("Password updated! Please login.");
                nav({ to: "/auth" });
              } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
            }}>
              <div><Label>New Password</Label><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
            </form>
          ) : (
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Password reset requires a valid session. Please request a new reset link.</p>
              <Button variant="outline" className="w-full" onClick={() => nav({ to: "/auth" })}>Back to Login</Button>
            </div>
          )}
        </Card>
      </div>
    </SiteLayout>
  );
}

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState("");
  return (
    <form className="mt-6 space-y-3" onSubmit={async (e) => {
      e.preventDefault(); setLoading(true);
      try { const link = await auth.forgot(email); setSent(true); setDevLink(link || ""); if (link) toast.success("Dev link copied to clipboard!"); else toast.success("Reset link sent! Check your email."); }
      catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
    }}>
      {!sent ? (
        <>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
        </>
      ) : (
        <div className="text-center space-y-3 py-4">
          <p className="text-green-600 font-medium">Reset link sent!</p>
          {devLink ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Dev mode — click to open:</p>
              <a href={devLink} className="text-sm text-primary underline break-all">{devLink}</a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Check your email inbox and click the link to reset your password.</p>
          )}
          <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(""); setDevLink(""); }}>Send again</Button>
        </div>
      )}
    </form>
  );
}
