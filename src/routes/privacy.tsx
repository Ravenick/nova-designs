import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — StructNova Designs" }, { name: "description", content: "Privacy Policy for StructNova Designs." }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 prose prose-slate">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2 className="mt-8 text-xl font-bold">1. Information We Collect</h2>
        <p className="mt-2 text-muted-foreground">When you create an account or purchase a plan, we collect your name, email address, billing information, and details about the plans you download. We may also collect device and usage data through cookies (see our Cookie Policy).</p>

        <h2 className="mt-6 text-xl font-bold">2. How We Use Your Information</h2>
        <p className="mt-2 text-muted-foreground">We use your information to deliver purchased plans, manage your account, process payments, send transactional emails, and improve our services. We do not sell your personal information.</p>

        <h2 className="mt-6 text-xl font-bold">3. Data Sharing</h2>
        <p className="mt-2 text-muted-foreground">We share data only with trusted processors required to run the service (payment providers, email delivery, hosting). Each processor is bound by confidentiality and data-protection obligations.</p>

        <h2 className="mt-6 text-xl font-bold">4. Data Retention</h2>
        <p className="mt-2 text-muted-foreground">We retain account and purchase records for as long as your account is active and as required to comply with legal obligations.</p>

        <h2 className="mt-6 text-xl font-bold">5. Your Rights</h2>
        <p className="mt-2 text-muted-foreground">You may request access to, correction of, or deletion of your personal data at any time by emailing <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a>.</p>

        <h2 className="mt-6 text-xl font-bold">6. Security</h2>
        <p className="mt-2 text-muted-foreground">We use industry-standard safeguards to protect your data. However, no method of transmission over the internet is 100% secure.</p>

        <h2 className="mt-6 text-xl font-bold">7. Contact</h2>
        <p className="mt-2 text-muted-foreground">Questions about this policy? Email <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a>.</p>
      </main>
      <Footer />
    </div>
  );
}
