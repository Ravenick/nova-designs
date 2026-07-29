import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFilePdf,
  faFileCode,
  faCloudArrowDown,
  faLock,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import JSZip from "jszip";
import { listFolderFiles } from "@/lib/storage";
import type { Plan, DrawingSetType, PlanDrawingSet } from "@/types/plan";
import { DRAWING_SET_LABELS, DRAWING_SET_ORDER } from "@/types/plan";

type Row = {
  id: string;
  order_id: string | null;
  created_at: string;
  file_type: "pdf" | "cad_pdf";
  include_architectural: boolean;
  set_type: DrawingSetType | null;
  downloads_remaining: number;
  downloads_used: number;
  plan_id: string;
  plan: Pick<Plan, "id" | "name" | "plan_number" | "image_url"> & {
    pdf_file_path: string | null;
    cad_file_path: string | null;
  };
};

type PlanGroup = {
  key: string;
  plan: Row["plan"];
  rows: Row[];
  remaining: number; // min remaining across rows
};

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "My Downloads — StructNova Designs" }] }),
  component: Downloads,
});

function safeName(s: string) {
  return s.replace(/[/\\?%*:|"<>]/g, "-").trim();
}

function Downloads() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const load = async () => {
    if (!user) { setBusy(false); return; }
    const { data } = await supabase
      .from("downloads")
      .select(
        "id, order_id, created_at, file_type, include_architectural, set_type, downloads_remaining, downloads_used, plan_id, plan:plans(id,name,plan_number,image_url,pdf_file_path,cad_file_path)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data as unknown as Row[]) ?? []);
    setBusy(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  // Group by order + plan so we can build one master ZIP per house plan purchase.
  const groups = useMemo<PlanGroup[]>(() => {
    const map = new Map<string, PlanGroup>();
    for (const r of rows) {
      const key = `${r.order_id ?? r.id}::${r.plan_id}`;
      const g = map.get(key);
      if (g) {
        g.rows.push(r);
        g.remaining = Math.min(g.remaining, r.downloads_remaining);
      } else {
        map.set(key, { key, plan: r.plan, rows: [r], remaining: r.downloads_remaining });
      }
    }
    return [...map.values()];
  }, [rows]);

  const consumeAll = async (rs: Row[]) => {
    // Decrement counters row-by-row. If any is exhausted, block.
    for (const r of rs) if (r.downloads_remaining <= 0) return false;
    const updates = rs.map((r) =>
      supabase
        .from("downloads")
        .update({ downloads_remaining: r.downloads_remaining - 1, downloads_used: r.downloads_used + 1 })
        .eq("id", r.id)
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error);
    if (err?.error) { toast.error(err.error.message); return false; }
    return true;
  };

  const buildMasterZip = async (g: PlanGroup) => {
    // Fetch all drawing sets for this plan to know each set's storage folders.
    const { data: setsData, error } = await supabase
      .from("plan_drawing_sets")
      .select("*")
      .eq("plan_id", g.plan.id);
    if (error) throw error;
    const sets = (setsData as unknown as PlanDrawingSet[]) ?? [];
    const bySet = new Map<DrawingSetType, PlanDrawingSet>();
    sets.forEach((s) => bySet.set(s.set_type, s));

    const master = new JSZip();
    let added = 0;

    // Preserve a stable order of drawing sets in the master zip.
    const ordered = [...g.rows].sort(
      (a, b) => DRAWING_SET_ORDER.indexOf((a.set_type ?? "architectural") as DrawingSetType) -
                 DRAWING_SET_ORDER.indexOf((b.set_type ?? "architectural") as DrawingSetType)
    );

    const addFolder = async (prefix: string, zipFolder: JSZip) => {
      const files = await listFolderFiles(prefix);
      for (const path of files) {
        const { data, error: dErr } = await supabase.storage.from("plan-files").download(path);
        if (dErr) throw dErr;
        const rel = path.slice(prefix.replace(/\/+$/, "").length + 1);
        zipFolder.file(rel, await data.arrayBuffer());
        added++;
      }
      return files.length;
    };

    for (const r of ordered) {
      const st = r.set_type;
      if (!st || !bySet.has(st)) continue;
      const s = bySet.get(st)!;
      const label = DRAWING_SET_LABELS[st];
      const wantsCad = r.file_type === "cad_pdf";

      // Each purchased drawing set becomes a real folder inside the master ZIP.
      const setFolder = master.folder(safeName(label))!;
      if (s.pdf_folder_path) await addFolder(s.pdf_folder_path, setFolder.folder("PDF")!);
      if (wantsCad && s.cad_folder_path) await addFolder(s.cad_folder_path, setFolder.folder("CAD")!);
    }

    if (added === 0) throw new Error("No files are available for this plan yet. Please contact support.");

    return master.generateAsync({ type: "blob" });
  };

  const onDownloadGroup = async (g: PlanGroup) => {
    if (g.remaining <= 0) {
      toast.error("You've used all downloads for this purchase. Please repurchase to download again.");
      return;
    }
    setWorking(g.key);
    try {
      const blob = await buildMasterZip(g);
      const ok = await consumeAll(g.rows);
      if (!ok) { setWorking(null); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName(g.plan.name || "House Plan")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success(`${g.plan.name} — download ready.`);
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
            <p className="mt-1 text-sm text-muted-foreground">Each purchase allows up to <strong>3 downloads</strong> total. You receive one clean ZIP per house plan.</p>
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
        ) : groups.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            You haven't purchased any plans yet. <Link to="/" className="font-semibold text-primary hover:underline">Browse plans →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => {
              const exhausted = g.remaining <= 0;
              return (
                <div key={g.key} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="relative aspect-[5/3] w-full overflow-hidden bg-secondary">
                    {g.plan.image_url && <img src={g.plan.image_url} alt={g.plan.name} className="h-full w-full object-cover" />}
                    <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${exhausted ? "bg-red-500 text-white" : "bg-white/95 text-primary"}`}>
                      {g.remaining}/3 left
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{g.plan.plan_number}</div>
                    <div className="mt-0.5 text-base font-bold">{g.plan.name}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {g.rows.map((r) => (
                        <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                          <FontAwesomeIcon icon={r.file_type === "cad_pdf" ? faFileCode : faFilePdf} />
                          {r.set_type ? DRAWING_SET_LABELS[r.set_type] : "Plan"} · {r.file_type === "cad_pdf" ? "PDF+CAD" : "PDF"}
                        </span>
                      ))}
                    </div>
                    {exhausted ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                          <FontAwesomeIcon icon={faLock} />
                          All downloads used. Repurchase to download again.
                        </div>
                        <Link
                          to="/"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
                        >
                          Repurchase plan
                        </Link>
                      </div>
                    ) : (
                      <button
                        disabled={working === g.key}
                        onClick={() => onDownloadGroup(g)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon={working === g.key ? faLayerGroup : faDownload} spin={working === g.key} />
                        {working === g.key ? "Building ZIP…" : `Download ${safeName(g.plan.name)}.zip`}
                      </button>
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
