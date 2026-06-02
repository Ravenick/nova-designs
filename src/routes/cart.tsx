import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usd } from "@/lib/format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowRight, faFilePdf, faFileCode, faDraftingCompass, faCartShopping } from "@fortawesome/free-solid-svg-icons";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — StructNova Designs" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, remove } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your Cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} {items.length === 1 ? "plan" : "plans"} ready for download after checkout.</p>

        {!user ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FontAwesomeIcon icon={faCartShopping} className="text-3xl text-primary/60" />
            <p className="mt-3 font-semibold">Sign in to view your cart</p>
            <Link to="/auth" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Your cart is empty. <Link to="/" className="font-semibold text-primary hover:underline">Browse plans →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <img src={it.plan.image_url ?? ""} alt={it.plan.name} className="h-24 w-32 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #{it.plan.plan_number}</div>
                    <div className="text-base font-bold">{it.plan.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                        <FontAwesomeIcon icon={it.file_type === "cad_pdf" ? faFileCode : faFilePdf} /> {it.file_type === "cad_pdf" ? "CAD + PDF" : "PDF Only"}
                      </span>
                      {it.include_architectural && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                          <FontAwesomeIcon icon={faDraftingCompass} /> Architectural Set
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-lg font-extrabold text-primary">{usd(Number(it.unit_price))}</div>
                      <button onClick={() => remove(it.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                        <FontAwesomeIcon icon={faTrash} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-bold">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={usd(total)} />
                <Row label="Tax" value="Calculated at checkout" muted />
                <div className="my-3 h-px bg-border" />
                <Row label="Total" value={usd(total)} bold />
              </div>
              <button onClick={() => navigate({ to: "/checkout" })} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark">
                Checkout <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">Secure payment · Instant downloads</p>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-extrabold" : ""} ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
