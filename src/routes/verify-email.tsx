import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth, useStore } from "@/lib/store";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, string>) => ({ token: s.token || "" }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const user = useStore((s) => s.users.find((u) => u.id === s.sessionUserId));
  const alreadyVerified = user?.verified;

  if (!token) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold">Invalid Link</h2>
            <p className="text-sm text-muted-foreground">No verification token found.</p>
            <Button className="w-full" onClick={() => nav({ to: "/" })}>Go Home</Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  if (alreadyVerified) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16">
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-lg font-semibold">Already Verified</h2>
            <p className="text-sm text-muted-foreground">Your email is already verified.</p>
            <Button className="w-full" onClick={() => nav({ to: "/account" })}>Go to Account</Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  if (done) {
    nav({ to: "/account" });
    return null;
  }

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="p-6 text-center space-y-4">
          <h2 className="text-lg font-semibold">Verify Your Email</h2>
          {error ? (
            <>
              <p className="text-sm text-red-600">{error}</p>
              <Button className="w-full" variant="outline" onClick={() => nav({ to: "/" })}>Go Home</Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Click the button below to verify your email address.</p>
              <Button className="w-full" disabled={loading} onClick={async () => {
                setLoading(true);
                try {
                  await auth.verifyEmail(token);
                  setDone(true);
                  toast.success("Email verified!");
                } catch (err: any) { setError(err.message); } finally { setLoading(false); }
              }}>
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </SiteLayout>
  );
}
