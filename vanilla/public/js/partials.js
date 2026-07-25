// Loads shared nav + footer HTML partials into placeholders.
import { supabase, currentUser } from "./supabase.js";

async function inject(id, url) {
  const slot = document.getElementById(id);
  if (!slot) return;
  const res = await fetch(url);
  slot.innerHTML = await res.text();
}

export async function loadPartials() {
  await Promise.all([
    inject("site-nav", "/partials/nav.html"),
    inject("site-footer", "/partials/footer.html"),
  ]);
  await hydrateNav();
  wireMobileNav();
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
}

async function hydrateNav() {
  const user = await currentUser();
  const authSlot = document.getElementById("nav-auth");
  if (!authSlot) return;
  if (user) {
    const initial = (user.user_metadata?.full_name || user.email || "?").trim().charAt(0).toUpperCase();
    authSlot.innerHTML = `
      <div class="relative" id="user-menu">
        <button id="user-avatar" class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-card hover:opacity-90" title="${user.email}">${initial}</button>
        <div id="user-drop" class="hidden absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-hover p-2 z-40">
          <div class="px-3 py-2 text-xs text-muted-foreground truncate">${user.email}</div>
          <a href="/favorites.html" class="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Favorites</a>
          <a href="/downloads.html" class="block rounded-md px-3 py-2 text-sm hover:bg-secondary">My Downloads</a>
          <a href="/cart.html" class="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Cart</a>
          <button id="btn-signout" class="mt-1 w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary">Sign out</button>
        </div>
      </div>`;
    document.getElementById("user-avatar").addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("user-drop").classList.toggle("hidden");
    });
    document.addEventListener("click", () => document.getElementById("user-drop")?.classList.add("hidden"));
    document.getElementById("btn-signout").addEventListener("click", async () => {
      await supabase.auth.signOut();
      location.href = "/";
    });
  } else {
    authSlot.innerHTML = `<a href="/auth.html" class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:bg-primary-dark">Sign in</a>`;
  }
}

function wireMobileNav() {
  const btn = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");
  if (btn && menu) btn.addEventListener("click", () => menu.classList.toggle("hidden"));
}

// Auto-run
loadPartials();
