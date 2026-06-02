import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/plan";
import { PlanCard } from "./PlanCard";
import { PlanDetailModal } from "./PlanDetailModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";

const bedOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
const storyOptions = ["Any", "1", "2", "3+"];

export function PlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState("");
  const [style, setStyle] = useState<string>("All");
  const [beds, setBeds] = useState("Any");
  const [stories, setStories] = useState("Any");
  const [sqftRange, setSqftRange] = useState<[number, number]>([0, 10000]);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "sqft-desc">("featured");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plans").select("*").order("featured", { ascending: false });
      setPlans((data as Plan[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const styles = useMemo(() => ["All", ...Array.from(new Set(plans.map((p) => p.style).filter(Boolean) as string[]))], [plans]);

  const filtered = useMemo(() => {
    let list = plans.filter((p) => {
      if (q && !`${p.name} ${p.plan_number} ${p.style ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (style !== "All" && p.style !== style) return false;
      if (beds !== "Any") { const n = parseInt(beds); if (p.beds < n) return false; }
      if (stories !== "Any") {
        if (stories === "3+" ? p.stories < 3 : p.stories !== parseInt(stories)) return false;
      }
      if (p.sqft < sqftRange[0] || p.sqft > sqftRange[1]) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc": return Number(a.base_price) - Number(b.base_price);
        case "price-desc": return Number(b.base_price) - Number(a.base_price);
        case "sqft-desc": return b.sqft - a.sqft;
        default: return Number(b.featured) - Number(a.featured);
      }
    });
    return list;
  }, [plans, q, style, beds, stories, sqftRange, sort]);

  const clear = () => { setQ(""); setStyle("All"); setBeds("Any"); setStories("Any"); setSqftRange([0, 10000]); };

  return (
    <section id="plans" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Catalog</div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">House Plans built to inspire</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Browse our growing collection of architect-approved plans. Click any card for full specs and to add to cart.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
          <span className="text-muted-foreground">{filtered.length} plans</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:grid-cols-12">
        <div className="relative md:col-span-4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, # or style"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select label="Style" value={style} onChange={setStyle} options={styles} className="md:col-span-2" />
        <Select label="Beds" value={beds} onChange={setBeds} options={bedOptions} className="md:col-span-2" />
        <Select label="Stories" value={stories} onChange={setStories} options={storyOptions} className="md:col-span-2" />
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[
          { v: "featured", l: "Featured" }, { v: "price-asc", l: "Price: Low → High" }, { v: "price-desc", l: "Price: High → Low" }, { v: "sqft-desc", l: "Largest first" }
        ]} className="md:col-span-2" />
        <div className="md:col-span-12">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/70">Sq ft range: {sqftRange[0].toLocaleString()} – {sqftRange[1].toLocaleString()}</label>
            <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary-dark hover:bg-accent">
              <FontAwesomeIcon icon={faXmark} /> Clear
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <input type="range" min={0} max={10000} step={100} value={sqftRange[0]} onChange={(e) => setSqftRange([Number(e.target.value), sqftRange[1]])} className="accent-primary" />
            <input type="range" min={0} max={10000} step={100} value={sqftRange[1]} onChange={(e) => setSqftRange([sqftRange[0], Number(e.target.value)])} className="accent-primary" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-secondary" />)
          : filtered.map((p) => (
              <PlanCard key={p.id} plan={p} onOpen={(pl) => { setSelected(pl); setOpen(true); }} />
            ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">No plans match your filters.</div>
        )}
      </div>

      <PlanDetailModal plan={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}

function Select<T extends string>({
  label, value, onChange, options, className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<T | { v: T; l: string }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.v;
            const l = typeof o === "string" ? o : o.l;
            return <option key={String(v)} value={v as string}>{l}</option>;
          })}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">▾</span>
      </div>
    </div>
  );
}
