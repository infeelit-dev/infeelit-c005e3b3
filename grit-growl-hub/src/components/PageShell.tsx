import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";

export function PageShell({
  title,
  subtitle,
  children,
  cta,
  backTo,
  step,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  cta?: ReactNode;
  backTo?: string;
  step?: { current: number; total: number };
}) {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top bar: back or logo (left), step (right) */}
      <header className="flex items-center justify-between px-12 pt-12">
        <div>
          {backTo ? (
            <Link
              to={backTo}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Logo className="!mx-0" />
          )}
        </div>
        {step && (
          <div className="text-[13px] font-light text-[var(--text-hint)] tracking-wide">
            step {step.current} / {step.total}
          </div>
        )}
      </header>

      {/* Centered content */}
      <section className="flex-1 flex flex-col items-center justify-center px-12 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-[32px] font-medium leading-tight tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-[15px] font-light text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-12">{children}</div>}
        </div>
      </section>

      {/* CTA pinned bottom */}
      {cta && (
        <footer className="px-12 pb-12">
          <div className="w-full max-w-md mx-auto">{cta}</div>
        </footer>
      )}
    </main>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[52px] rounded-[12px] bg-[var(--accent-color)] text-white text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[52px] rounded-[12px] bg-transparent border border-[var(--border)] text-[var(--text-primary)] text-[15px] font-medium transition-colors hover:bg-[var(--bg-surface)]"
    >
      {children}
    </button>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-6 text-left">
      {children}
    </div>
  );
}