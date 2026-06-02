import type { Plan } from "@/types/plan";
import { SpecGrid } from "./SpecGrid";
import { usd } from "@/lib/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEye } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

export function PlanCard({ plan, onOpen }: { plan: Plan; onOpen: (p: Plan) => void }) {
  return (
    <motion.button
      onClick={() => onOpen(plan)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card transition-shadow hover:shadow-hover"
    >
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-secondary">
        {plan.image_url && (
          <img
            src={plan.image_url}
            alt={plan.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-card">
          <FontAwesomeIcon icon={faHeart} />
        </div>
        {plan.featured && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            Featured
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{plan.plan_number}</div>
            <div className="mt-0.5 text-lg font-bold leading-tight text-foreground">{plan.name}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-medium text-muted-foreground">Starting at</div>
            <div className="text-lg font-extrabold text-primary">{usd(Number(plan.base_price))}</div>
          </div>
        </div>
        <SpecGrid plan={plan} />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{plan.style}</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
            <FontAwesomeIcon icon={faEye} /> View Plan
          </span>
        </div>
      </div>
    </motion.button>
  );
}
