import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPlay } from "@fortawesome/free-solid-svg-icons";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80",
    eyebrow: "Modern Farmhouse",
    title: "Designed for the way you live.",
    sub: "Light-filled great rooms, chef-grade kitchens, and craftsman details — ready to build.",
  },
  {
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80",
    eyebrow: "Desert Modern",
    title: "Bold lines. Quiet luxury.",
    sub: "Award-winning architectural plans engineered for U.S. building codes.",
  },
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80",
    eyebrow: "Mountain Contemporary",
    title: "From blueprint to home.",
    sub: "PDF + CAD file packages, full architectural sets, and instant downloads.",
  },
];

export function HeroSlideshow() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);
  const slide = slides[i];

  return (
    <section className="relative isolate h-[640px] w-full overflow-hidden md:h-[720px]">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark/85 via-primary/45 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-primary-foreground"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              {slide.eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              {slide.sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="group inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary shadow-card transition hover:shadow-hover">
                Browse Plans
                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#about" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/15">
                <FontAwesomeIcon icon={faPlay} />
                How it works
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-4 z-10 flex gap-2 sm:left-6 lg:left-8">
          {slides.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Slide ${k + 1}`}
              className={`h-1.5 rounded-full transition-all ${k === i ? "w-10 bg-primary-foreground" : "w-5 bg-primary-foreground/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
