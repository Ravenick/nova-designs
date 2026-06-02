import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faStar, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const reviews = [
  { name: "Marcus & Allison T.", role: "Built in Charleston, SC", quote: "The plan was incredibly detailed and our builder breezed through permits. The house is exactly what we dreamed of.", avatar: "https://i.pravatar.cc/120?img=12" },
  { name: "Priya Ramanathan", role: "Architect, Austin TX", quote: "StructNova plans are some of the cleanest construction documents I've worked with. Highly recommended.", avatar: "https://i.pravatar.cc/120?img=47" },
  { name: "James Carter", role: "Built in Boulder, CO", quote: "Loved the modern farmhouse plan. The CAD files saved us thousands in redraws and helped customize the kitchen.", avatar: "https://i.pravatar.cc/120?img=33" },
  { name: "Lauren Hayes", role: "Real Estate Developer", quote: "Used three different plans across our spec homes. Buyers keep falling in love with the layouts.", avatar: "https://i.pravatar.cc/120?img=44" },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const prev = () => setI((p) => (p - 1 + reviews.length) % reviews.length);
  const next = () => setI((p) => (p + 1) % reviews.length);
  const r = reviews[i];
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Stories</div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Trusted by builders & homeowners</h2>
      </div>
      <div className="relative mx-auto mt-10 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12"
          >
            <FontAwesomeIcon icon={faQuoteLeft} className="absolute right-6 top-6 text-5xl text-primary/10" />
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, k) => (<FontAwesomeIcon key={k} icon={faStar} />))}
            </div>
            <p className="mt-5 text-lg font-medium leading-relaxed text-foreground sm:text-xl">"{r.quote}"</p>
            <div className="mt-6 flex items-center gap-3">
              <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/30" />
              <div>
                <div className="text-sm font-bold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={prev} aria-label="Previous" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary-dark hover:bg-accent">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, k) => (
              <button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-primary" : "w-4 bg-border"}`} aria-label={`Go to ${k + 1}`} />
            ))}
          </div>
          <button onClick={next} aria-label="Next" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary-dark hover:bg-accent">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </section>
  );
}
