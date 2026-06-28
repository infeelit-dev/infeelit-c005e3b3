import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PrimaryButton } from "@/components/PageShell";

export const Route = createFileRoute("/recap")({
  component: () => (
    <PageShell
      title="That's a wrap"
      subtitle="Your evening, in summary."
      cta={
        <Link to="/">
          <PrimaryButton>Done</PrimaryButton>
        </Link>
      }
    />
  ),
});