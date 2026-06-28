import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PrimaryButton } from "@/components/PageShell";

export const Route = createFileRoute("/gratitude")({
  component: () => (
    <PageShell
      title="Leave a note"
      subtitle="A short thank-you for the person you just met."
      cta={
        <Link to="/recap">
          <PrimaryButton>Send</PrimaryButton>
        </Link>
      }
    >
      <textarea
        placeholder="Thank you for…"
        rows={5}
        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-6 text-[15px] font-light text-[var(--text-primary)] placeholder:text-[var(--text-hint)] focus:outline-none focus:border-[var(--accent-color)] resize-none"
      />
    </PageShell>
  ),
});