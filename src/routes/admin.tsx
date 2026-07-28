import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faLayerGroup,
  faReceipt,
  faDownload,
  faRightFromBracket,
  faPlus,
  faPenToSquare,
  faTrash,
  faUpload,
  faXmark,
  faMagnifyingGlass,
  faImage,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Dashboard — StructNova" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "overview" | "plans" | "orders" | "downloads";

function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Verifying access…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof faGauge }[] = [
    { id: "overview", label: "Overview", icon: faGauge },
    { id: "plans", label: "Plans", icon: faLayerGroup },
    { id: "orders", label: "Orders", icon: faReceipt },
    { id: "downloads", label: "Downloads", icon: faDownload },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            <span className="text-foreground">Struct</span><span className="text-primary">Nova</span>
            <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-primary">Admin</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 font-semibold text-primary-dark hover:bg-accent"
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FontAwesomeIcon icon={t.icon} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "overview" && <Overview />}
        {tab === "plans" && <PlansAdmin />}
        {tab === "orders" && <OrdersAdmin />}
        {tab === "downloads" && <DownloadsAdmin />}
      </main>
    </div>
  );
}

/* -------------------- OVERVIEW -------------------- */
function Overview() {
  const [stats, setStats] = useState<{
    revenue: number;
    orderCount: number;
    planCount: number;
    downloadCount: number;
    customerCount: number;
    recentOrders: Array<{ id: string; total: number; created_at: string; status: string; email?: string | null }>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { count: plansCount }, { count: dlCount }, { count: profilesCount }] = await Promise.all([
        supabase.from("orders").select("id,total,created_at,status,user_id").eq("status", "paid").order("created_at", { ascending: false }),
        supabase.from("plans").select("*", { count: "exact", head: true }),
        supabase.from("downloads").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      const list = orders ?? [];
      const revenue = list.reduce((s, o) => s + Number(o.total), 0);
      // fetch emails for the recent 5
      const recent = list.slice(0, 8);
      const userIds = [...new Set(recent.map((o) => o.user_id))];
      const { data: profs } = await supabase.from("profiles").select("id,email").in("id", userIds);
      const emailMap = new Map(profs?.map((p) => [p.id, p.email]) ?? []);
      setStats({
        revenue,
        orderCount: list.length,
        planCount: plansCount ?? 0,
        downloadCount: dlCount ?? 0,
        customerCount: profilesCount ?? 0,
        recentOrders: recent.map((o) => ({ ...o, email: emailMap.get(o.user_id) ?? null })),
      });
    })();
  }, []);

  if (!stats) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const cards = [
    { label: "Revenue", value: usd(stats.revenue), icon: faReceipt, accent: "text-emerald-600" },
    { label: "Paid Orders", value: stats.orderCount.toLocaleString(), icon: faReceipt, accent: "text-primary" },
    { label: "Plans", value: stats.planCount.toLocaleString(), icon: faLayerGroup, accent: "text-amber-600" },
    { label: "Downloads", value: stats.downloadCount.toLocaleString(), icon: faDownload, accent: "text-sky-600" },
    { label: "Customers", value: stats.customerCount.toLocaleString(), icon: faGauge, accent: "text-fuchsia-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Activity across StructNova Designs.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className={`text-2xl ${c.accent}`}><FontAwesomeIcon icon={c.icon} /></div>
            <div className="mt-3 text-2xl font-extrabold">{c.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-bold">Recent paid orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No paid orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr><th className="py-2 pr-4">Order</th><th className="py-2 pr-4">Customer</th><th className="py-2 pr-4">Total</th><th className="py-2 pr-4">Date</th></tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-2 pr-4 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-2 pr-4">{o.email ?? "—"}</td>
                    <td className="py-2 pr-4 font-semibold">{usd(Number(o.total))}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- PLANS -------------------- */
type Plan = {
  id: string;
  plan_number: string;
  name: string;
  description: string | null;
  image_url: string | null;
  gallery: string[] | null;
  base_price: number;
  architectural_addon_price: number;
  cad_addon_price: number;
  sqft: number;
  beds: number;
  baths: number;
  half_baths: number;
  cars: number;
  stories: number;
  width_ft: number;
  width_in: number;
  depth_ft: number;
  depth_in: number;
  style: string | null;
  featured: boolean;
  pdf_file_path: string | null;
  cad_file_path: string | null;
};

function PlansAdmin() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plans").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPlans((data as Plan[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(
    () => plans.filter((p) => `${p.plan_number} ${p.name} ${p.style ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [plans, q]
  );

  const del = async (p: Plan) => {
    if (!confirm(`Delete plan "${p.name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("plans").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Plan deleted");
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Plans</h1>
          <p className="text-sm text-muted-foreground">Create, edit and remove house plans.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setCreating(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark"
        >
          <FontAwesomeIcon icon={faPlus} /> New plan
        </button>
      </div>

      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, plan #, style"
          className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading plans…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Plan #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">SqFt</th>
                <th className="px-4 py-3">Beds/Baths</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FontAwesomeIcon icon={faImage} /></div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{p.plan_number}</td>
                  <td className="px-4 py-2 font-semibold">{p.name}</td>
                  <td className="px-4 py-2">{usd(Number(p.base_price))}</td>
                  <td className="px-4 py-2">{p.sqft.toLocaleString()}</td>
                  <td className="px-4 py-2">{p.beds} / {p.baths}{p.half_baths ? `.${p.half_baths}` : ""}</td>
                  <td className="px-4 py-2">{p.featured ? "★" : "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => { setCreating(false); setEditing(p); }} className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary hover:bg-accent" aria-label="Edit">
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button onClick={() => del(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20" aria-label="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No plans match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <PlanFormModal
          plan={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // ~10 years

async function uploadImageAndGetUrl(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("plan-images").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from("plan-images").createSignedUrl(path, SIGNED_URL_TTL);
  if (sErr) throw sErr;
  return data.signedUrl;
}

async function uploadZipToPlanFiles(file: File, planNumber: string, setType: string, kind: "pdf" | "cad"): Promise<string> {
  if (!/\.zip$/i.test(file.name)) throw new Error("Only .zip files are accepted.");
  const path = `${planNumber || "draft"}/${setType}/${kind}-${crypto.randomUUID()}.zip`;
  const { error } = await supabase.storage.from("plan-files").upload(path, file, { upsert: true, contentType: "application/zip" });
  if (error) throw error;
  return path;
}

const DRAW_SETS = [
  { id: "architectural", label: "Architectural" },
  { id: "structural", label: "Structural" },
  { id: "mechanical", label: "Mechanical" },
  { id: "electrical", label: "Electrical" },
] as const;

type SetKey = typeof DRAW_SETS[number]["id"];

type SetForm = {
  enabled: boolean;
  pdf_price: number;
  cad_price: number;
  pdf_zip_path: string | null;
  cad_zip_path: string | null;
};

const emptySetForm = (): SetForm => ({ enabled: false, pdf_price: 0, cad_price: 0, pdf_zip_path: null, cad_zip_path: null });

function PlanFormModal({ plan, onClose, onSaved }: { plan: Plan | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !plan;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Plan>(
    plan ?? {
      id: "",
      plan_number: "",
      name: "",
      description: "",
      image_url: null,
      gallery: [],
      base_price: 0,
      architectural_addon_price: 250,
      cad_addon_price: 500,
      sqft: 0,
      beds: 0,
      baths: 0,
      half_baths: 0,
      cars: 0,
      stories: 1,
      width_ft: 0,
      width_in: 0,
      depth_ft: 0,
      depth_in: 0,
      style: "",
      featured: false,
      pdf_file_path: null,
      cad_file_path: null,
    }
  );
  const [setsForm, setSetsForm] = useState<Record<SetKey, SetForm>>({
    architectural: emptySetForm(),
    structural: emptySetForm(),
    mechanical: emptySetForm(),
    electrical: emptySetForm(),
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Load existing drawing sets when editing
  useEffect(() => {
    if (!plan?.id) return;
    (async () => {
      const { data } = await supabase.from("plan_drawing_sets").select("*").eq("plan_id", plan.id);
      if (!data) return;
      setSetsForm((prev) => {
        const next = { ...prev };
        for (const row of data as Array<{ set_type: SetKey; pdf_price: number; cad_price: number; pdf_zip_path: string | null; cad_zip_path: string | null }>) {
          next[row.set_type] = {
            enabled: true,
            pdf_price: Number(row.pdf_price),
            cad_price: Number(row.cad_price),
            pdf_zip_path: row.pdf_zip_path,
            cad_zip_path: row.cad_zip_path,
          };
        }
        return next;
      });
    })();
  }, [plan?.id]);

  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setSet = (k: SetKey, patch: Partial<SetForm>) => setSetsForm((s) => ({ ...s, [k]: { ...s[k], ...patch } }));

  const onImageChange = async (file: File) => {
    setUploading("image");
    try {
      const url = await uploadImageAndGetUrl(file);
      set("image_url", url);
      toast.success("Cover image uploaded");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(null); }
  };

  const onGalleryAdd = async (files: FileList) => {
    setUploading("gallery");
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (!/\.(jpe?g|png|webp)$/i.test(f.name)) throw new Error("Only JPG, JPEG, PNG or WebP images are accepted.");
        urls.push(await uploadImageAndGetUrl(f));
      }
      const merged = [...(form.gallery ?? []), ...urls];
      set("gallery", merged);
      if (!form.image_url && merged.length) set("image_url", merged[0]);
      toast.success(`${urls.length} image(s) added`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(null); }
  };

  const onSetZip = async (k: SetKey, kind: "pdf" | "cad", file: File) => {
    setUploading(`${k}-${kind}`);
    try {
      const path = await uploadZipToPlanFiles(file, form.plan_number, k, kind);
      setSet(k, kind === "pdf" ? { pdf_zip_path: path } : { cad_zip_path: path });
      toast.success(`${kind.toUpperCase()} ZIP uploaded`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(null); }
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.plan_number.trim()) return "Plan number is required.";
      if (!form.name.trim()) return "Plan name is required.";
    }
    if (step === 2) {
      const anyEnabled = Object.values(setsForm).some((s) => s.enabled);
      if (!anyEnabled) return "Select at least one drawing set.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return toast.error(err);
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      let planId = plan?.id;
      if (isNew) {
        const { id: _drop, drawing_sets: _ds, ...rest } = payload;
        const { data, error } = await supabase.from("plans").insert(rest as unknown as Plan).select("id").single();
        if (error) throw error;
        planId = data.id;
      } else {
        const { id, drawing_sets: _ds, ...rest } = payload;
        const { error } = await supabase.from("plans").update(rest).eq("id", id);
        if (error) throw error;
      }
      if (!planId) throw new Error("Plan id missing.");

      // Upsert drawing sets: for each enabled -> upsert row; for each disabled -> delete row
      const enabledEntries = (Object.entries(setsForm) as [SetKey, SetForm][]).filter(([, v]) => v.enabled);
      const disabledEntries = (Object.entries(setsForm) as [SetKey, SetForm][]).filter(([, v]) => !v.enabled);

      if (enabledEntries.length > 0) {
        const rows = enabledEntries.map(([k, v]) => ({
          plan_id: planId!,
          set_type: k,
          pdf_price: v.pdf_price,
          cad_price: v.cad_price,
          pdf_zip_path: v.pdf_zip_path,
          cad_zip_path: v.cad_zip_path,
        }));
        const { error } = await supabase.from("plan_drawing_sets").upsert(rows, { onConflict: "plan_id,set_type" });
        if (error) throw error;
      }
      if (disabledEntries.length > 0 && !isNew) {
        await supabase
          .from("plan_drawing_sets")
          .delete()
          .eq("plan_id", planId)
          .in("set_type", disabledEntries.map(([k]) => k));
      }

      toast.success(isNew ? "Plan created" : "Plan updated");
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = ["Basic info", "Drawing sets", "Files", "Images"];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-3xl rounded-3xl bg-card shadow-card">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-extrabold">{isNew ? "New plan" : `Edit · ${form.name}`}</h2>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
              {stepLabels.map((l, i) => {
                const active = step === i + 1;
                const done = step > i + 1;
                return (
                  <div key={l} className={`flex items-center gap-1 ${active ? "text-primary" : done ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-600 text-white" : "bg-secondary"}`}>{i + 1}</span>
                    <span className="hidden sm:inline">{l}</span>
                    {i < stepLabels.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-accent">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {step === 1 && (
            <>
              <section>
                <SectionTitle>Basic info</SectionTitle>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Plan #" value={form.plan_number} onChange={(v) => set("plan_number", v)} required />
                  <Field label="Name" value={form.name} onChange={(v) => set("name", v)} required />
                  <Field label="Style" value={form.style ?? ""} onChange={(v) => set("style", v)} />
                  <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
                    <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                    Featured on homepage
                  </label>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea
                      value={form.description ?? ""}
                      onChange={(e) => set("description", e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </section>
              <section>
                <SectionTitle>Specs</SectionTitle>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <NumField label="Sq ft" value={form.sqft} onChange={(v) => set("sqft", v)} />
                  <NumField label="Beds" value={form.beds} onChange={(v) => set("beds", v)} />
                  <NumField label="Baths" value={form.baths} onChange={(v) => set("baths", v)} />
                  <NumField label="Half baths" value={form.half_baths} onChange={(v) => set("half_baths", v)} />
                  <NumField label="Cars" value={form.cars} onChange={(v) => set("cars", v)} />
                  <NumField label="Stories" value={form.stories} onChange={(v) => set("stories", v)} />
                  <NumField label="Width (ft)" value={form.width_ft} onChange={(v) => set("width_ft", v)} />
                  <NumField label="Width (in)" value={form.width_in} onChange={(v) => set("width_in", v)} />
                  <NumField label="Depth (ft)" value={form.depth_ft} onChange={(v) => set("depth_ft", v)} />
                  <NumField label="Depth (in)" value={form.depth_in} onChange={(v) => set("depth_in", v)} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Overall pricing is set per drawing set on the next step.</p>
              </section>
            </>
          )}

          {step === 2 && (
            <section>
              <SectionTitle>Drawing sets & pricing</SectionTitle>
              <p className="mt-1 text-xs text-muted-foreground">Enable the sets available for this plan. Set the PDF-only and PDF + CAD price for each.</p>
              <div className="mt-3 space-y-3">
                {DRAW_SETS.map(({ id, label }) => {
                  const s = setsForm[id];
                  return (
                    <div key={id} className={`rounded-xl border-2 p-4 ${s.enabled ? "border-primary bg-primary/5" : "border-border"}`}>
                      <label className="flex items-center gap-3 text-sm font-semibold">
                        <input type="checkbox" checked={s.enabled} onChange={(e) => setSet(id, { enabled: e.target.checked })} />
                        {label}
                      </label>
                      {s.enabled && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <NumField label="PDF price (USD)" value={s.pdf_price} onChange={(v) => setSet(id, { pdf_price: v })} step={0.01} />
                          <NumField label="PDF + CAD price (USD)" value={s.cad_price} onChange={(v) => setSet(id, { cad_price: v })} step={0.01} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <SectionTitle>Upload ZIP files</SectionTitle>
              <p className="mt-1 text-xs text-muted-foreground">Only .zip files are accepted. Upload one ZIP for PDF and one for CAD per enabled set.</p>
              <div className="mt-3 space-y-4">
                {DRAW_SETS.filter(({ id }) => setsForm[id].enabled).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No drawing sets selected. Go back to step 2 to enable at least one.
                  </div>
                )}
                {DRAW_SETS.filter(({ id }) => setsForm[id].enabled).map(({ id, label }) => {
                  const s = setsForm[id];
                  return (
                    <div key={id} className="rounded-xl border border-border p-4">
                      <div className="text-sm font-bold">{label}</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <UploadButton
                            label={uploading === `${id}-pdf` ? "Uploading PDF ZIP…" : s.pdf_zip_path ? "Replace PDF ZIP" : "Upload PDF ZIP"}
                            accept=".zip,application/zip,application/x-zip-compressed"
                            onFile={(f) => onSetZip(id, "pdf", f)}
                            disabled={!!uploading}
                            icon={faFile}
                          />
                          {s.pdf_zip_path && <div className="mt-1 truncate text-[11px] text-emerald-600">✓ {s.pdf_zip_path.split("/").pop()}</div>}
                        </div>
                        <div>
                          <UploadButton
                            label={uploading === `${id}-cad` ? "Uploading CAD ZIP…" : s.cad_zip_path ? "Replace CAD ZIP" : "Upload CAD ZIP"}
                            accept=".zip,application/zip,application/x-zip-compressed"
                            onFile={(f) => onSetZip(id, "cad", f)}
                            disabled={!!uploading}
                            icon={faFile}
                          />
                          {s.cad_zip_path && <div className="mt-1 truncate text-[11px] text-emerald-600">✓ {s.cad_zip_path.split("/").pop()}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <SectionTitle>Preview images (slideshow)</SectionTitle>
              <p className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG or WebP. Multiple images populate the plan modal slideshow. First image becomes the cover.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(form.gallery ?? []).map((url, i) => (
                  <div key={i} className="relative h-24 w-32 overflow-hidden rounded-xl border border-border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <div className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">Cover</div>}
                    <button
                      type="button"
                      onClick={() => {
                        const next = (form.gallery ?? []).filter((_, j) => j !== i);
                        set("gallery", next);
                        if (form.image_url === url) set("image_url", next[0] ?? null);
                      }}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                      aria-label="Remove"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                ))}
                <label className={`flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary ${uploading === "gallery" ? "opacity-50" : ""}`}>
                  <FontAwesomeIcon icon={faUpload} />
                  {uploading === "gallery" ? "Uploading…" : "Add images"}
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files && onGalleryAdd(e.target.files)} />
                </label>
              </div>
            </section>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <div className="flex gap-2">
              {step > 1 && (
                <button type="button" onClick={back} className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold hover:bg-accent">
                  Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark">
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !!uploading}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark disabled:opacity-60"
                >
                  {saving ? "Saving…" : isNew ? "Create plan" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{children}</h3>;
}
function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type="number"
        step={step ?? 1}
        value={value === 0 ? "" : value}
        placeholder="0"
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
function UploadButton({ label, accept, onFile, disabled, icon }: { label: string; accept: string; onFile: (f: File) => void; disabled?: boolean; icon?: typeof faUpload }) {
  return (
    <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-semibold hover:bg-accent ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <FontAwesomeIcon icon={icon ?? faUpload} />
      {label}
      <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </label>
  );
}

/* -------------------- ORDERS -------------------- */
function OrdersAdmin() {
  const [rows, setRows] = useState<Array<{ id: string; total: number; status: string; created_at: string; user_id: string; email?: string | null; items?: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("orders").select("id,total,status,created_at,user_id").order("created_at", { ascending: false });
      const list = data ?? [];
      const ids = [...new Set(list.map((o) => o.user_id))];
      const { data: profs } = await supabase.from("profiles").select("id,email").in("id", ids);
      const map = new Map(profs?.map((p) => [p.id, p.email]) ?? []);
      const { data: items } = await supabase.from("order_items").select("order_id");
      const countMap = new Map<string, number>();
      items?.forEach((i) => countMap.set(i.order_id, (countMap.get(i.order_id) ?? 0) + 1));
      setRows(list.map((o) => ({ ...o, email: map.get(o.user_id) ?? null, items: countMap.get(o.id) ?? 0 })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Orders</h1>
        <p className="text-sm text-muted-foreground">Every order across the shop.</p>
      </div>
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{o.email ?? "—"}</td>
                  <td className="px-4 py-2">{o.items}</td>
                  <td className="px-4 py-2 font-semibold">{usd(Number(o.total))}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${o.status === "paid" ? "bg-emerald-100 text-emerald-800" : o.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-secondary text-muted-foreground"}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------------------- DOWNLOADS -------------------- */
function DownloadsAdmin() {
  const [rows, setRows] = useState<Array<{ id: string; user_id: string; plan_id: string; file_type: string; downloads_used: number; downloads_remaining: number; created_at: string; email?: string | null; plan?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("downloads").select("id,user_id,plan_id,file_type,downloads_used,downloads_remaining,created_at").order("created_at", { ascending: false });
      const list = data ?? [];
      const userIds = [...new Set(list.map((d) => d.user_id))];
      const planIds = [...new Set(list.map((d) => d.plan_id))];
      const [{ data: profs }, { data: plans }] = await Promise.all([
        supabase.from("profiles").select("id,email").in("id", userIds),
        supabase.from("plans").select("id,name,plan_number").in("id", planIds),
      ]);
      const eMap = new Map(profs?.map((p) => [p.id, p.email]) ?? []);
      const pMap = new Map(plans?.map((p) => [p.id, `${p.plan_number} · ${p.name}`]) ?? []);
      setRows(list.map((d) => ({ ...d, email: eMap.get(d.user_id) ?? null, plan: pMap.get(d.plan_id) })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Downloads</h1>
        <p className="text-sm text-muted-foreground">Customer download activity.</p>
      </div>
      {loading ? <div className="text-sm text-muted-foreground">Loading…</div> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Used / Remaining</th><th className="px-4 py-3">Granted</th></tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2">{d.email ?? "—"}</td>
                  <td className="px-4 py-2 font-semibold">{d.plan ?? d.plan_id.slice(0, 8)}</td>
                  <td className="px-4 py-2 uppercase">{d.file_type}</td>
                  <td className="px-4 py-2">{d.downloads_used} / {d.downloads_remaining}</td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No downloads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
