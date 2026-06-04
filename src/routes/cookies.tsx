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
        <h1 className="text-4xl font-extrabold tracking-tight">StructNova Cookie Policy</h1>
        <p className="mt-4 text-muted-foreground">StructNova Designs uses cookies to enhance your browsing experience.</p>

        <h2 className="mt-8 text-xl font-bold">1. What Are Cookies?</h2>
        <p className="mt-2 text-muted-foreground">Cookies are small text files stored on your device when you visit our website.</p>

        <h2 className="mt-6 text-xl font-bold">2. How We Use Cookies</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>To remember your preferences and settings.</li>
          <li>To improve site performance and functionality.</li>
          <li>To analyze traffic and usage patterns.</li>
          <li>To support secure transactions in our shop.</li>
        </ul>

        <h2 className="mt-6 text-xl font-bold">3. Managing Cookies</h2>
        <p className="mt-2 text-muted-foreground">You can control or disable cookies through your browser settings. Please note that disabling cookies may affect site functionality.</p>

        <h2 className="mt-8 text-xl font-bold">Contact Us</h2>
        <p className="mt-2 text-muted-foreground">If you have questions about this Cookie Policy, please contact us at: <a className="text-primary hover:underline" href="mailto:support@structnovadesigns.com">support@structnovadesigns.com</a></p>
      </main>
      <Footer />
    </div>
  );
}
