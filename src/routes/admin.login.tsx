import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash, faArrowRight, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin sign in — StructNova" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  useEffect(() => {
    if (user && !adminLoading && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, adminLoading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // verify admin role
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!role) {
          await supabase.auth.signOut();
          throw new Error("This account does not have admin access.");
        }
        toast.success("Welcome, architect.");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Architect Portal</h1>
            <p className="text-xs text-muted-foreground">Restricted access</p>
          </div>
        </div>

        <h2 className="mt-7 text-2xl font-extrabold">
          {mode === "signin" ? "Sign in" : "Reset password"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin" ? "Manage plans, orders & downloads." : "We'll email you a reset link."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <FontAwesomeIcon icon={faEnvelope} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {mode === "signin" && (
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-primary"
              >
                <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Send reset link"}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs">
          {mode === "signin" ? (
            <button onClick={() => setMode("forgot")} className="font-semibold text-primary hover:underline">
              Forgot password?
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="font-semibold text-primary hover:underline">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
