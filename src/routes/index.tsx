import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { Ticker } from "@/components/home/Ticker";
import { PlansSection } from "@/components/home/PlansSection";
import { About } from "@/components/home/About";
import { Testimonials } from "@/components/home/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StructNova Designs — Premium American House Plans" },
      { name: "description", content: "Architect-approved house plans with instant PDF & CAD downloads. Browse modern farmhouse, craftsman, contemporary and more." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSlideshow />
        <Ticker />
        <PlansSection />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
