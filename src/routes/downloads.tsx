import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFilePdf, faFileCode, faDraftingCompass, faCloudArrowDown, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import type { Plan } from "@/types/plan";

type Row = {
  id: string;
  created_at: string;
  file_type: "pdf" | "cad_pdf";
  include_architectural: boolean;
  downloads_remaining: number;
  downloads_used: number;
  plan_id: string;
  plan: Pick<Plan, "id" | "name" | "plan_number" | "image_url"> & {
    pdf_file_path: string | null;
    cad_file_path: string | null;
  };
};

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "My Downloads — StructNova Designs" }] }),
  component: Downloads,
});

function Downloads() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = async () => {
    if (!user) { setBusy(false); return; }
    const { data } = await supabase
      .from("downloads")
      .select("id, created_at, file_type, include_architectural, downloads_remaining, downloads_used, plan_id, plan:plans(id,name,plan_number,image_url,pdf_file_path,cad_file_path)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data as unknown as Row[]) ?? []);
    setBusy(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const consume = async (r: Row): Promise<boolean> => {
    if (r.downloads_remaining <= 0) {
      toast.error("You've used all 3 downloads for this purchase. Please repurchase the plan to download again.");
      return false;
    }
    const { error } = await supabase
      .from("downloads")
      .update({ downloads_remaining: r.downloads_remaining - 1, downloads_used: r.downloads_used + 1 })
      .eq("id", r.id);
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const getSignedUrls = async (r: Row): Promise<{ url: string; filename: string }[]> => {
    const out: { url: string; filename: string }[] = [];
    const wantsCad = r.file_type === "cad_pdf";
    const paths: { path: string | null; tag: string }[] = [
      { path: r.plan.pdf_file_path, tag: "PDF" },
      ...(wantsCad ? [{ path: r.plan.cad_file_path, tag: "CAD" }] : []),
    ];
    for (const p of paths) {
      if (!p.path) continue;
      const { data, error } = await supabase.storage.from("plan-files").createSignedUrl(p.path, 60 * 60, {
        download: `${r.plan.plan_number}-${r.plan.name.replace(/\s+/g, "_")}-${p.tag}.${p.path.split(".").pop()}`,
      });
      if (error) throw error;
      out.push({ url: data.signedUrl, filename: p.path.split("/").pop() ?? p.tag });
    }
    return out;
  };

  const onDownload = async (r: Row) => {
    setWorking(r.id);
    try {
      const links = await getSignedUrls(r);
      if (links.length === 0) {
        toast.error("Files aren't available yet. Please contact support.");
        setWorking(null);
        return;
      }
      const ok = await consume(r);
      if (!ok) { setWorking(null); return; }
      // Trigger downloads — small delay between files
      for (const l of links) {
        const a = document.createElement("a");
        a.href = l.url;
        a.download = l.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        await new Promise((res) => setTimeout(res, 400));
      }
      toast.success(`${r.plan.name} download started.`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setWorking(null);
  };

  const onEmail = async (r: Row) => {
    setWorking(r.id);
    try {
      const links = await getSignedUrls(r);
      if (links.length === 0) {
        toast.error("Files aren't available yet. Please contact support.");
        setWorking(null);
        return;
      }
      const ok = await consume(r);
      if (!ok) { setWorking(null); return; }
      const subject = encodeURIComponent(`Your StructNova plan: ${r.plan.name} (#${r.plan.plan_number})`);
      const body = encodeURIComponent(
        `Hi,\n\nHere are your secure download links for "${r.plan.name}" (Plan #${r.plan.plan_number}).\nLinks expire in 1 hour.\n\n` +
        links.map((l, i) => `${i + 1}. ${l.url}`).join("\n\n") +
        `\n\n— StructNova Designs`
      );
      window.location.href = `mailto:${user?.email}?subject=${subject}&body=${body}`;
      toast.success(`Email draft opened for ${user?.email}.`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setWorking(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">My Downloads</h1>
            <p className="mt-1 text-sm text-muted-foreground">Each purchase allows up to <strong>3 downloads</strong> total (direct + email).</p>
          </div>
          <FontAwesomeIcon icon={faCloudArrowDown} className="hidden text-4xl text-primary/30 sm:block" />
        </div>

        {loading || busy ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary" />)}
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
            {rows.map((r) => {
              const exhausted = r.downloads_remaining <= 0;
              return (
                <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="relative aspect-[5/3] w-full overflow-hidden bg-secondary">
                    {r.plan.image_url && <img src={r.plan.image_url} alt={r.plan.name} className="h-full w-full object-cover" />}
                    <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${exhausted ? "bg-red-500 text-white" : "bg-white/95 text-primary"}`}>
                      {r.downloads_remaining}/3 left
                    </div>
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
                    {exhausted ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                          <FontAwesomeIcon icon={faLock} />
                          All 3 downloads used. Repurchase to download again.
                        </div>
                        <Link
                          to="/"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
                        >
                          Repurchase plan
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          disabled={working === r.id}
                          onClick={() => onDownload(r)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={faDownload} /> Download
                        </button>
                        <button
                          disabled={working === r.id}
                          onClick={() => onEmail(r)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={faEnvelope} /> Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
