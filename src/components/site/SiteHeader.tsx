import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLINIC } from "@/lib/clinic";
import { Logo } from "./Logo";

const NAV = [
  { to: "/services", label: "Services" },
  { to: "/dentists", label: "Dentists" },
  { to: "/contact", label: "Visit us" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${CLINIC.name} home`}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href={CLINIC.phoneHref} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Phone className="size-4" /> {CLINIC.phone}
          </a>
          <Button asChild className="rounded-full px-5">
            <Link to="/book">Book appointment</Link>
          </Button>
        </div>
        <button
          className="rounded-md p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-base">
                {n.label}
              </Link>
            ))}
            <a href={CLINIC.phoneHref} className="flex items-center gap-2 px-2 py-3 text-base text-muted-foreground">
              <Phone className="size-4" /> {CLINIC.phone}
            </a>
            <Button asChild size="xl" className="mt-2">
              <Link to="/book" onClick={() => setOpen(false)}>Book appointment</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
