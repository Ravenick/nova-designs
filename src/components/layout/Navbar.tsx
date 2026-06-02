import { Link, useRouter } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faDownload, faRightToBracket, faRightFromBracket, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Plans", to: "/#plans" },
    { label: "About", to: "/#about" },
    { label: "Testimonials", to: "/#testimonials" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="StructNova Designs" className="h-10 w-auto" />
          <span className="hidden text-lg font-bold tracking-tight sm:inline-block">
            <span className="text-foreground">Struct</span><span className="text-primary">Nova</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((n) => (
            <a key={n.to} href={n.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/downloads" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-primary sm:inline-flex">
            <FontAwesomeIcon icon={faDownload} />
            Downloads
          </Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-medium text-primary-dark transition hover:bg-accent">
            <FontAwesomeIcon icon={faCartShopping} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                router.navigate({ to: "/" });
              }}
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-dark sm:inline-flex"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-dark sm:inline-flex"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              Sign in
            </Link>
          )}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <FontAwesomeIcon icon={open ? faXmark : faBars} />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map((n) => (
              <a key={n.to} href={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
                {n.label}
              </a>
            ))}
            <Link to="/downloads" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
              Downloads
            </Link>
            {user ? (
              <button onClick={() => { signOut(); setOpen(false); }} className="rounded-lg bg-primary px-3 py-2 text-left text-sm font-semibold text-primary-foreground">
                Sign out
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
