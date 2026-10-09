import { Link } from "@tanstack/react-router";
import { CLINIC } from "@/lib/clinic";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5"><Logo /></div>
          <p className="text-sm text-muted-foreground">Personalised dental care in a calm, modern space.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/dentists" className="hover:text-foreground">Dentists</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Visit us</Link></li>
            <li><Link to="/book" className="hover:text-foreground">Book appointment</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Opening hours</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CLINIC.hours.map((h) => (
              <li key={h.days}><span className="text-foreground">{h.days}</span><br />{h.time}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{CLINIC.address}</li>
            <li><a href={CLINIC.phoneHref} className="hover:text-foreground">{CLINIC.phone}</a></li>
            <li><a href={`mailto:${CLINIC.email}`} className="hover:text-foreground">{CLINIC.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {CLINIC.name}. Demo clinic details — replace before launch.</p>
          <p>Privacy policy · Terms · Accessibility</p>
        </div>
      </div>
    </footer>
  );
}
