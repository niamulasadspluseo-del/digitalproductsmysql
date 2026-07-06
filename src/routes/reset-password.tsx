import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, string>) => ({ token: s.token || "" }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const nav = useNavigate();

  if (!token) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold">Invalid Reset Link</h2>
            <p className="text-sm text-muted-foreground">No reset token found. Please request a new password reset.</p>
            <Button className="w-full" onClick={() => nav({ to: "/auth" })}>Go to Login</Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold">Password Reset Complete</h2>
            <p className="text-sm text-muted-foreground">Your password has been updated successfully.</p>
            <Button className="w-full" onClick={() => nav({ to: "/auth" })}>Go to Login</Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-center">Reset Your Password</h2>
          <form className="mt-6 space-y-3" onSubmit={async (e) => {
            e.preventDefault(); setLoading(true);
            try {
              await auth.resetPassword(token, password);
              setDone(true);
              toast.success("Password updated successfully!");
            } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
          }}>
            <div>
              <Label>New Password</Label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </Card>
      </div>
    </SiteLayout>
  );
}
