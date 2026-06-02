import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — StructNova Designs" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-extrabold">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Set a new password to finish resetting your account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark disabled:opacity-60">
              Update password
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
