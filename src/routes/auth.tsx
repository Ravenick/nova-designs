import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — StructNova Designs" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset link sent.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    try {
      const result = (await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })) as { error?: { message?: string } | string; redirected?: boolean };
      if (result.error) {
        const msg = typeof result.error === "string" ? result.error : result.error.message ?? "Sign-in failed";
        throw new Error(msg);
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="hidden flex-1 pr-12 lg:block">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Members</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Your home library, one click away.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">Sign in to save favorites, manage downloads, and access your purchased plans anytime — from any device.</p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start building your home library." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to continue."}
          </p>

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={onGoogle}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3 text-sm font-semibold transition hover:bg-secondary disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faGoogle} className="text-primary" />
                Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <Field icon={faUser} type="text" placeholder="Full name" value={name} onChange={setName} />
            )}
            <Field icon={faEnvelope} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
            {mode !== "forgot" && <Field icon={faLock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />}

            <button
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-dark disabled:opacity-60"
            >
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs">
            {mode === "signin" ? (
              <>
                <button onClick={() => setMode("forgot")} className="font-semibold text-primary hover:underline">Forgot password?</button>
                <button onClick={() => setMode("signup")} className="text-muted-foreground">New here? <span className="font-semibold text-primary">Sign up</span></button>
              </>
            ) : mode === "signup" ? (
              <button onClick={() => setMode("signin")} className="ml-auto text-muted-foreground">Have an account? <span className="font-semibold text-primary">Sign in</span></button>
            ) : (
              <button onClick={() => setMode("signin")} className="ml-auto text-muted-foreground">Back to <span className="font-semibold text-primary">Sign in</span></button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  icon, type, placeholder, value, onChange, required, minLength,
}: {
  icon: typeof faUser; type: string; placeholder: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
  return (
    <div className="relative">
      <FontAwesomeIcon icon={icon} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
