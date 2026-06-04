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
        <h1 className="text-4xl font-extrabold tracking-tight">StructNova Terms and Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: May 22, 2026</p>

        <h2 className="mt-8 text-xl font-bold">1. Introduction</h2>
        <p className="mt-2 text-muted-foreground">Welcome to StructNova Designs. By accessing or purchasing from our website, you agree to be bound by these Terms and Conditions. These Terms govern your use of our services and products. Please read them carefully.</p>

        <h2 className="mt-6 text-xl font-bold">2. Intellectual Property</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>All architectural plans, designs, images, and related content available on StructNova are the exclusive property of StructNova.</li>
          <li>Plans are licensed to you for personal or professional use as specified at the time of purchase.</li>
          <li>Redistribution, resale, or reproduction of our plans without written consent is strictly prohibited.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Use of Plans</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Plans are provided "as is" and may require adaptation to meet local building codes, regulations, or site conditions.</li>
          <li>You are responsible for ensuring compliance with applicable laws, permits, and construction standards in your jurisdiction.</li>
          <li>StructNova is not responsible for any changes made by third parties.</li>
          <li>If you require specific modifications adaptable to your own lot size, you may contact our support team at <a className="text-primary hover:underline" href="mailto:structnovadesigns.support@gmail.com">structnovadesigns.support@gmail.com</a>. Please include the name of the purchased design and proof of payment (receipt).</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">4. Purchases and Payments</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>All prices are listed in United States Dollars ($).</li>
          <li>Payment must be completed before access to downloadable plans is granted.</li>
          <li>Customers outside the United States may purchase plans, but all transactions must be made in U.S. Dollars through the payment methods provided on our website.</li>
          <li>If you experience issues completing payment, please contact <a className="text-primary hover:underline" href="mailto:structnovadesigns.support@gmail.com">structnovadesigns.support@gmail.com</a> for assistance.</li>
          <li>Discounts, promotions, or sales are applied at checkout and cannot be retroactively added.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">5. Refunds and Exchanges</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Due to the digital nature of our products, all sales are final.</li>
          <li>Refunds are only issued in cases of duplicate transactions or technical errors.</li>
          <li>Please review product details carefully before purchase.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">6. Limitation of Liability</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>StructNova provides plans for informational and design purposes only.</li>
          <li>We do not guarantee construction outcomes, cost estimates, or suitability for specific projects.</li>
          <li>StructNova shall not be held liable for damages, losses, or disputes arising from the use of our plans.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">7. User Conduct</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>You agree not to misuse our website, including attempts to hack, copy, or disrupt services.</li>
          <li>Accounts found violating these terms may be suspended or terminated.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">8. Governing Law and Jurisdiction</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>These Terms and Conditions are governed by the laws of the United States of America.</li>
          <li>Any disputes shall be resolved in a reputable court located in the State of Texas, USA.</li>
          <li>Customers outside the United States acknowledge that purchases are made under U.S. law and agree to submit to the jurisdiction of Texas courts for dispute resolution.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">9. Changes to Terms</h2>
        <p className="mt-2 text-muted-foreground">StructNova reserves the right to update or modify these Terms at any time. Updates will be posted on this page, and continued use of the site constitutes acceptance of the revised Terms.</p>

        <h2 className="mt-6 text-xl font-bold">10. Contact Us</h2>
        <p className="mt-2 text-muted-foreground">For questions regarding these Terms and Conditions, please contact us at: <a className="text-primary hover:underline" href="mailto:structnovadesigns.support@gmail.com">structnovadesigns.support@gmail.com</a></p>
      </main>
      <Footer />
    </div>
  );
}
