import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { usd } from "@/lib/format";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStripe, faCcVisa } from "@fortawesome/free-brands-svg-icons";
import { faCreditCard, faMoneyBill, faLock, faCheck } from "@fortawesome/free-solid-svg-icons";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — StructNova Designs" }] }),
  component: Checkout,
});

const methods = [
  { id: "stripe", label: "Stripe", desc: "Credit & debit cards", icon: faStripe, brand: true },
  { id: "card", label: "Bank Card", desc: "Direct card payment", icon: faCcVisa, brand: true },
  { id: "flutterwave", label: "Flutterwave", desc: "Cards, mobile money & bank", icon: faCreditCard },
  { id: "paystack", label: "Paystack", desc: "African card networks", icon: faMoneyBill },
] as const;

function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("stripe");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onPay = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (items.length === 0) return;
    setBusy(true);
    try {
      // Create order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total, payment_provider: method, status: "completed" })
        .select("id")
        .single();
      if (error) throw error;

      // Insert order items + downloads
      const orderItems = items.map((i) => ({
        order_id: order.id,
        plan_id: i.plan_id,
        file_type: i.file_type,
        include_architectural: i.include_architectural,
        unit_price: i.unit_price,
      }));
      const downloads = items.map((i) => ({
        user_id: user.id,
        order_id: order.id,
        plan_id: i.plan_id,
        file_type: i.file_type,
        include_architectural: i.include_architectural,
      }));
      await supabase.from("order_items").insert(orderItems);
      await supabase.from("downloads").insert(downloads);
      await clear();
      toast.success("Payment successful! Your plans are ready.");
      navigate({ to: "/downloads" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you'd like to pay. All transactions are secure.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Your cart is empty. <Link to="/" className="font-semibold text-primary hover:underline">Browse plans →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="text-xs font-bold uppercase tracking-widest text-primary/70">Payment Method</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {methods.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <FontAwesomeIcon icon={m.icon} className={`text-2xl ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="text-sm font-bold">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.desc}</div>
                      </div>
                      {active && <FontAwesomeIcon icon={faCheck} className="mt-1 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                <FontAwesomeIcon icon={faLock} className="mt-0.5 text-primary" />
                <p>This demo records the order in your account. Connect your payment provider keys to enable live processing. Stripe can be enabled instantly via Lovable; Flutterwave & Paystack require API keys.</p>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-bold">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between gap-3">
                    <span className="truncate">{i.plan.name}</span>
                    <span className="font-semibold">{usd(Number(i.unit_price))}</span>
                  </div>
                ))}
                <div className="my-3 h-px bg-border" />
                <div className="flex items-center justify-between text-base font-extrabold">
                  <span>Total</span><span>{usd(total)}</span>
                </div>
              </div>
              <button
                onClick={onPay}
                disabled={busy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark disabled:opacity-60"
              >
                <FontAwesomeIcon icon={faLock} />
                {busy ? "Processing..." : `Pay ${usd(total)}`}
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
