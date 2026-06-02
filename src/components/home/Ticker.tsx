import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faBolt, faRulerCombined, faFileLines, faMedal, faHeadset, faGlobe } from "@fortawesome/free-solid-svg-icons";

const items = [
  { icon: faShieldHalved, text: "U.S. Code Compliant" },
  { icon: faBolt, text: "Instant Downloads" },
  { icon: faRulerCombined, text: "Engineered Drawings" },
  { icon: faFileLines, text: "PDF + CAD Files" },
  { icon: faMedal, text: "Architect-Approved" },
  { icon: faHeadset, text: "Expert Plan Support" },
  { icon: faGlobe, text: "Built in 50 States" },
];

export function Ticker() {
  const row = (
    <div className="flex items-center gap-14 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/90">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 whitespace-nowrap">
          <FontAwesomeIcon icon={it.icon} className="text-primary-foreground/70" />
          {it.text}
        </div>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-primary-dark/40 bg-primary-dark py-4">
      <div className="ticker-track flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
