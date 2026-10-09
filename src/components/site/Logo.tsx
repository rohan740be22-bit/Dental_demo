import { CLINIC } from "@/lib/clinic";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10.5 9.5c2-1 3.6-.4 5.5.5 1.9-.9 3.5-1.5 5.5-.5 2.3 1.2 2.4 4.4 1.5 7.2-.8 2.6-1.4 6.8-3 6.8-1.4 0-1.5-4.5-4-4.5s-2.6 4.5-4 4.5c-1.6 0-2.2-4.2-3-6.8-.9-2.8-.8-6 1.5-7.2Z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <>
      <LogoMark />
      <span className="font-display text-[15px] font-semibold tracking-tight">{CLINIC.name}</span>
    </>
  );
}
