import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — StructNova Designs" }, { name: "description", content: "Terms and Conditions for StructNova Designs." }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2 className="mt-8 text-xl font-bold">1. Agreement</h2>
        <p className="mt-2 text-muted-foreground">By creating an account or purchasing a plan on StructNova Designs, you agree to these Terms.</p>

        <h2 className="mt-6 text-xl font-bold">2. License & Use of Plans</h2>
        <p className="mt-2 text-muted-foreground">Each purchased plan grants the buyer a single-build, non-transferable license. You may construct one home from the plan. Re-selling, redistributing, or sharing the digital files is strictly prohibited.</p>

        <h2 className="mt-6 text-xl font-bold">3. Download Limit</h2>
        <p className="mt-2 text-muted-foreground">Each purchase entitles you to a maximum of <strong>3 downloads</strong> (combined direct download and email delivery). Once exhausted, you must purchase the plan again to receive additional copies.</p>

        <h2 className="mt-6 text-xl font-bold">4. Payments & Refunds</h2>
        <p className="mt-2 text-muted-foreground">All payments are processed in USD. Because plans are delivered as instant digital downloads, all sales are final and non-refundable except where required by law.</p>

        <h2 className="mt-6 text-xl font-bold">5. Modifications</h2>
        <p className="mt-2 text-muted-foreground">Customer-requested modifications (foundation changes, mirrored layouts, square-footage edits) are billed separately. Contact <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a> for a quote.</p>

        <h2 className="mt-6 text-xl font-bold">6. Local Codes & Engineering</h2>
        <p className="mt-2 text-muted-foreground">Plans are prepared to general construction standards but must be reviewed by a licensed engineer or architect to comply with local building codes, seismic, wind, and snow-load requirements in your jurisdiction.</p>

        <h2 className="mt-6 text-xl font-bold">7. Liability</h2>
        <p className="mt-2 text-muted-foreground">StructNova Designs is not liable for construction defects, code violations, or any loss arising from the use of the plans. Maximum liability is limited to the amount paid for the plan.</p>

        <h2 className="mt-6 text-xl font-bold">8. Account Termination</h2>
        <p className="mt-2 text-muted-foreground">We may suspend or terminate accounts that violate these Terms, including unauthorized sharing of plans.</p>

        <h2 className="mt-6 text-xl font-bold">9. Contact</h2>
        <p className="mt-2 text-muted-foreground">For questions, contact <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a>.</p>
      </main>
      <Footer />
    </div>
  );
}
