import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlanCard } from "@/components/home/PlanCard";
import { PlanDetailModal } from "@/components/home/PlanDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import type { Plan } from "@/types/plan";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "My Favorites — StructNova Designs" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user, loading } = useAuth();
  const { ids } = useFavorites();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(true);
  const [open, setOpen] = useState<Plan | null>(null);

  useEffect(() => {
    (async () => {
      if (!user || ids.size === 0) { setPlans([]); setBusy(false); return; }
      setBusy(true);
      const { data } = await supabase.from("plans").select("*").in("id", Array.from(ids));
      setPlans((data as Plan[]) ?? []);
      setBusy(false);
    })();
  }, [user, ids]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faHeart} className="text-2xl text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My Favorites</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Plans you've saved for later.</p>

        {loading || busy ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary" />)}
          </div>
        ) : !user ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold">Sign in to view your favorites</p>
            <Link to="/auth" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
          </div>
        ) : plans.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No favorites yet. Tap the heart on any plan to save it. <Link to="/" className="font-semibold text-primary hover:underline">Browse plans →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => <PlanCard key={p.id} plan={p} onOpen={setOpen} />)}
          </div>
        )}
      </main>
      <PlanDetailModal plan={open} onClose={() => setOpen(null)} />
      <Footer />
    </div>
  );
}
