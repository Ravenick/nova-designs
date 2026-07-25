// Supabase client (browser)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Configure with your Supabase project's URL + anon key.
// These are safe to expose (public keys). RLS enforces security.
export const SUPABASE_URL = "https://tqifoihcmnyeobazefkt.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaWZvaWhjbW55ZW9iYXplZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDAyMDYsImV4cCI6MjA5NjMxNjIwNn0.W5s7vb4Q6CoLj3DqliCWPg0GoQVBu1nN-O6L0Bc_GMs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Helpers
export const usd = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));

export function toast(msg, type = "info") {
  let root = document.querySelector(".toast-container");
  if (!root) {
    root = document.createElement("div");
    root.className = "toast-container";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 3200);
  setTimeout(() => el.remove(), 3600);
}

export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
