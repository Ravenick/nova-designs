import { supabase, usd, toast, currentUser } from "./supabase.js";

// ---------- Hero slideshow ----------
const slides = [
  { image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80", eyebrow: "Modern Farmhouse", title: "Designed for the way you live.", sub: "Light-filled great rooms, chef-grade kitchens, and craftsman details — ready to build." },
  { image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80", eyebrow: "Desert Modern", title: "Bold lines. Quiet luxury.", sub: "Award-winning architectural plans engineered for U.S. building codes." },
  { image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80", eyebrow: "Mountain Contemporary", title: "From blueprint to home.", sub: "PDF + CAD file packages, full architectural sets, and instant downloads." },
];
let heroI = 0;
function renderHero() {
  const s = slides[heroI];
  document.getElementById("hero-slides").innerHTML = `
    <div class="absolute inset-0 fade-up">
      <img src="${s.image}" alt="" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-tr from-primary-dark/85 via-primary/45 to-transparent"></div>
    </div>`;
  document.getElementById("hero-content").innerHTML = `
    <span class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
      <span class="h-1.5 w-1.5 rounded-full bg-primary-foreground"></span>${s.eyebrow}
    </span>
    <h1 class="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">${s.title}</h1>
    <p class="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">${s.sub}</p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="#plans" class="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary shadow-card hover:shadow-hover">Browse Plans →</a>
      <a href="#about" class="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/15">How it works</a>
    </div>`;
  document.getElementById("hero-dots").innerHTML = slides.map((_, k) =>
    `<button data-i="${k}" class="h-1.5 rounded-full transition-all ${k === heroI ? "w-10 bg-primary-foreground" : "w-5 bg-primary-foreground/40"}"></button>`
  ).join("");
  document.querySelectorAll("#hero-dots button").forEach((b) =>
    b.addEventListener("click", () => { heroI = Number(b.dataset.i); renderHero(); })
  );
}
renderHero();
setInterval(() => { heroI = (heroI + 1) % slides.length; renderHero(); }, 6000);

// ---------- Plans ----------
let plans = [];
let favIds = new Set();

async function loadFavorites() {
  const user = await currentUser();
  if (!user) { favIds = new Set(); return; }
  const { data } = await supabase.from("favorites").select("plan_id").eq("user_id", user.id);
  favIds = new Set((data ?? []).map((r) => r.plan_id));
}

async function toggleFav(planId) {
  const user = await currentUser();
  if (!user) { toast("Please sign in to save favorites.", "error"); return; }
  if (favIds.has(planId)) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("plan_id", planId);
    favIds.delete(planId);
    toast("Removed from favorites", "info");
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, plan_id: planId });
    favIds.add(planId);
    toast("Added to favorites", "success");
  }
  render();
}

function specGrid(p) {
  return `<div class="grid grid-cols-4 gap-2 text-xs">
    ${cell(p.beds, "Beds")}${cell(p.baths, "Baths")}${cell((p.sqft||0).toLocaleString(), "Sq Ft")}${cell(p.cars, "Cars")}
  </div>`;
}
function cell(v, label) {
  return `<div class="rounded-lg bg-secondary/70 px-2 py-2 text-center">
    <div class="font-bold text-primary-dark">${v ?? "—"}</div>
    <div class="text-[10px] uppercase tracking-widest text-muted-foreground">${label}</div>
  </div>`;
}

function planCard(p) {
  const fav = favIds.has(p.id);
  return `
  <a href="/plan.html?id=${p.id}" class="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card hover:shadow-hover transition-transform hover:-translate-y-1">
    <div class="relative aspect-[5/3] w-full overflow-hidden bg-secondary">
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />` : ""}
      <button data-fav="${p.id}" aria-label="Favorite"
        class="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-card ${fav ? "text-red-500" : "text-primary hover:text-red-500"}">
        ${fav ? "♥" : "♡"}
      </button>
      ${p.featured ? `<div class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Featured</div>` : ""}
    </div>
    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-widest text-primary/70">Plan #${p.plan_number}</div>
          <div class="mt-0.5 text-lg font-bold leading-tight">${p.name}</div>
        </div>
        <div class="text-right">
          <div class="text-[11px] font-medium text-muted-foreground">Starting at</div>
          <div class="text-lg font-extrabold text-primary">${usd(p.base_price)}</div>
        </div>
      </div>
      ${specGrid(p)}
      <div class="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>${p.style || ""}</span>
        <span class="font-semibold text-primary">View Plan →</span>
      </div>
    </div>
  </a>`;
}

function applyFilters() {
  const q = document.getElementById("f-q").value.trim().toLowerCase();
  const style = document.getElementById("f-style").value;
  const beds = document.getElementById("f-beds").value;
  const stories = document.getElementById("f-stories").value;
  const sort = document.getElementById("f-sort").value;
  let list = plans.filter((p) => {
    if (q && !`${p.name} ${p.plan_number} ${p.style || ""}`.toLowerCase().includes(q)) return false;
    if (style !== "All" && p.style !== style) return false;
    if (beds !== "Any" && p.beds < parseInt(beds)) return false;
    if (stories !== "Any") {
      if (stories === "3+" ? p.stories < 3 : p.stories !== parseInt(stories)) return false;
    }
    return true;
  });
  list.sort((a, b) => {
    switch (sort) {
      case "price-asc": return Number(a.base_price) - Number(b.base_price);
      case "price-desc": return Number(b.base_price) - Number(a.base_price);
      case "sqft-desc": return b.sqft - a.sqft;
      default: return Number(b.featured) - Number(a.featured);
    }
  });
  return list;
}

function render() {
  const filtered = applyFilters();
  document.getElementById("plan-count").textContent = filtered.length;
  const grid = document.getElementById("plans-grid");
  grid.innerHTML = filtered.length
    ? filtered.map(planCard).join("")
    : `<div class="col-span-full rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">No plans match your filters.</div>`;
  grid.querySelectorAll("[data-fav]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggleFav(btn.dataset.fav); });
  });
}

async function init() {
  await loadFavorites();
  const { data } = await supabase.from("plans").select("*").order("featured", { ascending: false });
  plans = data ?? [];
  const styles = ["All", ...Array.from(new Set(plans.map((p) => p.style).filter(Boolean)))];
  document.getElementById("f-style").innerHTML = styles.map((s) => `<option>${s}</option>`).join("");
  ["f-q", "f-style", "f-beds", "f-stories", "f-sort"].forEach((id) =>
    document.getElementById(id).addEventListener("input", render)
  );
  render();
}
init();
