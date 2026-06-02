import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary-dark text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="StructNova Designs" className="h-12 w-auto" />
            <div className="text-xl font-bold tracking-tight">StructNova Designs</div>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/75">
            Premium American house plans — modern farmhouse, craftsman, contemporary and more. Buy once, build for life.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="/#plans" className="hover:underline">House Plans</a></li>
            <li><a href="/#testimonials" className="hover:underline">Testimonials</a></li>
            <li><a href="/downloads" className="hover:underline">My Downloads</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">Support</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="mailto:hello@structnova.com" className="hover:underline">hello@structnova.com</a></li>
            <li>Mon–Fri, 9am – 6pm EST</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} StructNova Designs. All rights reserved.
      </div>
    </footer>
  );
}
