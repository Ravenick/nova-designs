import { useEffect, useMemo, useState } from "react";
import type { Plan, FileType, DrawingSetType, PlanDrawingSet } from "@/types/plan";
import { DRAWING_SET_LABELS, DRAWING_SET_ORDER } from "@/types/plan";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SpecGrid } from "./SpecGrid";
import { computeSetPrice, useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { usd } from "@/lib/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

type Selection = { enabled: boolean; file_type: FileType };

export function PlanDetailModal({ plan, open, onOpenChange }: { plan: Plan | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [sets, setSets] = useState<PlanDrawingSet[]>([]);
  const [sel, setSel] = useState<Record<DrawingSetType, Selection>>({
    architectural: { enabled: false, file_type: "pdf" },
    structural: { enabled: false, file_type: "pdf" },
    mechanical: { enabled: false, file_type: "pdf" },
    electrical: { enabled: false, file_type: "pdf" },
  });
  const [slide, setSlide] = useState(0);
  const { addSets } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const images = useMemo(() => {
    const list = [...(plan?.gallery ?? [])];
    if (plan?.image_url && !list.includes(plan.image_url)) list.unshift(plan.image_url);
    return list.filter(Boolean);
  }, [plan]);

  useEffect(() => {
    setSlide(0);
    setSel({
      architectural: { enabled: false, file_type: "pdf" },
      structural: { enabled: false, file_type: "pdf" },
      mechanical: { enabled: false, file_type: "pdf" },
      electrical: { enabled: false, file_type: "pdf" },
    });
    if (!plan?.id) { setSets([]); return; }
    (async () => {
      const { data } = await supabase
        .from("plan_drawing_sets")
        .select("*")
        .eq("plan_id", plan.id);
      setSets((data as unknown as PlanDrawingSet[]) ?? []);
    })();
  }, [plan?.id]);

  // Autoplay
  useEffect(() => {
    if (!open || images.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [open, images.length]);

  if (!plan) return null;

  const sortedSets = DRAWING_SET_ORDER
    .map((t) => sets.find((s) => s.set_type === t))
    .filter((s): s is PlanDrawingSet => Boolean(s));

  const selectedItems = sortedSets
    .filter((s) => sel[s.set_type].enabled)
    .map((s) => ({
      set_type: s.set_type,
      file_type: sel[s.set_type].file_type,
      unit_price: computeSetPrice(s, sel[s.set_type].file_type),
    }));

  const total = selectedItems.reduce((a, b) => a + b.unit_price, 0);

  const toggle = (t: DrawingSetType) => setSel((p) => ({ ...p, [t]: { ...p[t], enabled: !p[t].enabled } }));
  const setFileType = (t: DrawingSetType, ft: FileType) =>
    setSel((p) => ({ ...p, [t]: { enabled: true, file_type: ft } }));

  const handleAdd = async () => {
    if (!user) {
      toast.info("Please sign in to add plans to your cart.");
      navigate({ to: "/auth" });
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Select at least one drawing set.");
      return;
    }
    try {
      await addSets(plan, selectedItems);
      toast.success(`${selectedItems.length} drawing set(s) added to cart`);
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border p-0">
        <DialogTitle className="sr-only">{plan.name}</DialogTitle>
        <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
          {/* Slideshow */}
          <div className="relative aspect-[4/3] w-full bg-secondary md:aspect-auto md:min-h-[520px]">
            {images.length > 0 ? (
              <>
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${plan.name} — view ${i + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 md:object-contain md:p-3 ${i === slide ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={() => setSlide((s) => (s + 1) % images.length)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlide(i)}
                          aria-label={`Go to image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/60"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No preview available</div>
            )}
            {plan.featured && (
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Featured
              </div>
            )}
          </div>

          {/* Details + selection */}
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{plan.plan_number}</div>
              <h3 className="mt-1 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">{plan.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
            </div>

            <SpecGrid plan={plan} />

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/70">
                <FontAwesomeIcon icon={faLayerGroup} /> Drawing Sets
              </div>
              {sortedSets.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No drawing sets configured for this plan yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {sortedSets.map((s) => {
                    const state = sel[s.set_type];
                    const active = state.enabled;
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl border-2 p-3 transition ${active ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggle(s.set_type)}
                            className="flex items-center gap-3 text-left"
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {active && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{DRAWING_SET_LABELS[s.set_type]}</div>
                              <div className="text-[11px] text-muted-foreground">
                                PDF {usd(Number(s.pdf_price))} · PDF + CAD {usd(Number(s.cad_price))}
                              </div>
                            </div>
                          </button>
                          <div className="flex gap-1 rounded-full bg-secondary p-1">
                            {(["pdf", "cad_pdf"] as FileType[]).map((ft) => {
                              const on = state.file_type === ft;
                              return (
                                <button
                                  key={ft}
                                  type="button"
                                  onClick={() => setFileType(s.set_type, ft)}
                                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                  {ft === "pdf" ? "PDF" : "PDF + CAD"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-5">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Total</div>
                <div className="text-3xl font-extrabold text-primary">{usd(total)}</div>
                <div className="text-[10px] text-muted-foreground">{selectedItems.length} set{selectedItems.length === 1 ? "" : "s"} selected</div>
              </div>
              <button
                onClick={handleAdd}
                disabled={selectedItems.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-dark disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faCartPlus} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
