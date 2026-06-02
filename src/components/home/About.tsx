import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCartShopping, faCloudArrowDown, faHammer } from "@fortawesome/free-solid-svg-icons";

const steps = [
  { icon: faMagnifyingGlass, title: "Browse", desc: "Filter by sqft, beds, stories and style to find your perfect plan." },
  { icon: faCartShopping, title: "Customize", desc: "Choose PDF or CAD + PDF and add the full architectural drawing set." },
  { icon: faCloudArrowDown, title: "Download", desc: "Instant access after checkout — files appear in your Downloads." },
  { icon: faHammer, title: "Build", desc: "Hand the plans to your builder and start construction with confidence." },
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">From dream to keys, in four steps.</h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            StructNova Designs delivers production-ready house plans for U.S. homeowners, builders, and architects. Every plan is reviewed for code compliance and constructibility.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <div key={i} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:shadow-hover">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground">
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <div className="mt-4 text-base font-bold">{s.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
