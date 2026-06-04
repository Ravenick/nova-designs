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
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">StructNova Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">At StructNova Designs, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website structnovadesigns.com.</p>

        <h2 className="mt-8 text-xl font-bold">1. Information We Collect</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Personal details you provide (such as name, email, phone number) when contacting us or making a purchase.</li>
          <li>Technical data (such as IP address, browser type, and device information) collected automatically.</li>
          <li>Transaction details when you buy products or services from our shop.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">2. How We Use Your Information</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>To provide and improve our services.</li>
          <li>To process orders and deliver products.</li>
          <li>To communicate with you about updates, offers, or support.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Sharing of Information</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>We do not sell or rent your personal data.</li>
          <li>We may share information with trusted service providers (such as payment processors or delivery companies) to complete transactions.</li>
          <li>We may disclose information if required by law.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">4. Data Security</h2>
        <p className="mt-2 text-muted-foreground">We implement reasonable safeguards to protect your information against unauthorized access, alteration, or disclosure.</p>

        <h2 className="mt-6 text-xl font-bold">5. Your Rights</h2>
        <p className="mt-2 text-muted-foreground">You may request access, correction, or deletion of your personal data. Contact us at <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a> for assistance.</p>

        <h2 className="mt-8 text-xl font-bold">Contact Us</h2>
        <p className="mt-2 text-muted-foreground">If you have questions about this Privacy Policy, please contact us at: <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a></p>
      </main>
      <Footer />
    </div>
  );
}
