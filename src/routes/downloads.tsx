import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFilePdf, faFileCode, faDraftingCompass, faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import type { Plan } from "@/types/plan";

type Row = {
  id: string;
  created_at: string;
  file_type: "pdf" | "cad_pdf";
  include_architectural: boolean;
  plan: Pick<Plan, "id" | "name" | "plan_number" | "image_url">;
};

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "My Downloads — StructNova Designs" }] }),
  component: Downloads,
});

function Downloads() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) { setBusy(false); return; }
    (async () => {
      const { data } = await supabase
        .from("downloads")
        .select("id, created_at, file_type, include_architectural, plan:plans(id,name,plan_number,image_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data as unknown as Row[]) ?? []);
      setBusy(false);
    })();
  }, [user]);

  const onDownload = (r: Row) => {
    toast.success(`Preparing ${r.plan.name} (${r.file_type === "cad_pdf" ? "CAD + PDF" : "PDF"})…`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My Downloads</h1>
            <p className="mt-1 text-sm text-muted-foreground">All your purchased plans, available anytime.</p>
          </div>
          <FontAwesomeIcon icon={faCloudArrowDown} className="hidden text-4xl text-primary/30 sm:block" />
        </div>

        {loading || busy ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary" />)}
          </div>
        ) : !user ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-semibold">Sign in to view your downloads</p>
            <Link to="/auth" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            You haven't purchased any plans yet. <Link to="/" className="font-semibold text-primary hover:underline">Browse plans →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="relative aspect-[5/3] w-full overflow-hidden bg-secondary">
                  {r.plan.image_url && <img src={r.plan.image_url} alt={r.plan.name} className="h-full w-full object-cover" />}
                </div>
                <div className="p-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{r.plan.plan_number}</div>
                  <div className="mt-0.5 text-base font-bold">{r.plan.name}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                      <FontAwesomeIcon icon={r.file_type === "cad_pdf" ? faFileCode : faFilePdf} />
                      {r.file_type === "cad_pdf" ? "CAD + PDF" : "PDF"}
                    </span>
                    {r.include_architectural && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                        <FontAwesomeIcon icon={faDraftingCompass} /> Architectural
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDownload(r)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
                  >
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
