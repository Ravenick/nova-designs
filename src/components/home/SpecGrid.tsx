import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBed, faBath, faShower, faCar, faLayerGroup, faRulerHorizontal, faRulerVertical, faRulerCombined } from "@fortawesome/free-solid-svg-icons";
import type { Plan } from "@/types/plan";
import { dim, sqft } from "@/lib/format";

type Spec = { icon: IconDefinition; label: string; value: string };

export function planSpecs(p: Plan): Spec[] {
  return [
    { icon: faRulerCombined, label: "Sq Ft", value: sqft(p.sqft) },
    { icon: faBed, label: "Beds", value: String(p.beds) },
    { icon: faBath, label: "Baths", value: String(p.baths) },
    { icon: faShower, label: "½ Baths", value: String(p.half_baths) },
    { icon: faCar, label: "Cars", value: String(p.cars) },
    { icon: faLayerGroup, label: "Stories", value: String(p.stories) },
    { icon: faRulerHorizontal, label: "Width", value: dim(p.width_ft, p.width_in) },
    { icon: faRulerVertical, label: "Depth", value: dim(p.depth_ft, p.depth_in) },
  ];
}

export function SpecGrid({ plan, dense = false }: { plan: Plan; dense?: boolean }) {
  const specs = planSpecs(plan);
  return (
    <div className={`grid ${dense ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-4"} divide-x divide-y divide-border overflow-hidden rounded-xl border border-border bg-secondary/40`}>
      {specs.map((s, i) => (
        <div key={i} className="flex flex-col items-center justify-center gap-1 py-3 px-1 text-center">
          <FontAwesomeIcon icon={s.icon} className="text-primary" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">{s.label}</div>
          <div className="text-sm font-bold text-foreground">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
