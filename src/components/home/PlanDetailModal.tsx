import { useEffect, useState } from "react";
import type { Plan, FileType } from "@/types/plan";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SpecGrid } from "./SpecGrid";
import { computePrice, useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { usd } from "@/lib/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faFilePdf, faFileCode, faDraftingCompass, faCheck } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

export function PlanDetailModal({ plan, open, onOpenChange }: { plan: Plan | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [arch, setArch] = useState(false);
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFileType("pdf");
    setArch(false);
  }, [plan?.id]);

  if (!plan) return null;
  const price = computePrice(plan, fileType, arch);

  const handleAdd = async () => {
    if (!user) {
      toast.info("Please sign in to add plans to your cart.");
      navigate({ to: "/auth" });
      return;
    }
    try {
      await add(plan, fileType, arch);
      toast.success("Added to cart");
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
          <div className="relative aspect-[4/3] w-full bg-secondary md:aspect-auto md:min-h-[480px]">
            {plan.image_url && <img src={plan.image_url} alt={plan.name} className="h-full w-full object-cover" />}
            {plan.featured && (
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Featured
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{plan.plan_number}</div>
              <h3 className="mt-1 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">{plan.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
            </div>

            <SpecGrid plan={plan} />

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary/70">File Format</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([
                  { id: "pdf", label: "PDF Only", icon: faFilePdf, add: 0 },
                  { id: "cad_pdf", label: "CAD + PDF", icon: faFileCode, add: Number(plan.cad_addon_price) },
                ] as const).map((opt) => {
                  const active = fileType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFileType(opt.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl border-2 p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={opt.icon} className={active ? "text-primary" : "text-muted-foreground"} />
                        <div>
                          <div className="text-sm font-semibold">{opt.label}</div>
                          <div className="text-[11px] text-muted-foreground">{opt.add > 0 ? `+${usd(opt.add)}` : "Included"}</div>
                        </div>
                      </div>
                      {active && <FontAwesomeIcon icon={faCheck} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setArch((v) => !v)}
              className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition ${arch ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faDraftingCompass} className={arch ? "text-primary" : "text-muted-foreground"} />
                <div>
                  <div className="text-sm font-semibold">Architectural Drawing Set</div>
                  <div className="text-[11px] text-muted-foreground">Foundation, framing, elevations & details · +{usd(Number(plan.architectural_addon_price))}</div>
                </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${arch ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                {arch && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
              </div>
            </button>

            <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-5">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Total</div>
                <div className="text-3xl font-extrabold text-primary">{usd(price)}</div>
              </div>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-dark"
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
