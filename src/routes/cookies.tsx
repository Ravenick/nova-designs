import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Cookie Policy — StructNova Designs" }, { name: "description", content: "Cookie Policy for StructNova Designs." }] }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2 className="mt-8 text-xl font-bold">1. What Are Cookies?</h2>
        <p className="mt-2 text-muted-foreground">Cookies are small text files placed on your device when you visit a website. They help us remember your preferences, keep you signed in, and understand how visitors use our site.</p>

        <h2 className="mt-6 text-xl font-bold">2. Types of Cookies We Use</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li><strong>Essential cookies</strong> — required for sign-in, cart, and checkout.</li>
          <li><strong>Analytics cookies</strong> — anonymous usage data so we can improve the site.</li>
          <li><strong>Preference cookies</strong> — remember your settings (e.g. saved favorites).</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Managing Cookies</h2>
        <p className="mt-2 text-muted-foreground">You can disable cookies in your browser settings, but parts of the site (sign-in, cart, downloads) may stop working.</p>

        <h2 className="mt-6 text-xl font-bold">4. Third-Party Cookies</h2>
        <p className="mt-2 text-muted-foreground">Some pages embed services (payment processors, analytics) that set their own cookies. They are governed by those providers' own policies.</p>

        <h2 className="mt-6 text-xl font-bold">5. Contact</h2>
        <p className="mt-2 text-muted-foreground">Questions? Email <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a>.</p>
      </main>
      <Footer />
    </div>
  );
}
