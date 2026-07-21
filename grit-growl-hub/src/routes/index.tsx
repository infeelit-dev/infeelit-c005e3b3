import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PrimaryButton } from "@/components/PageShell";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageShell
      title="Grit & Growl"
      subtitle="An evening of intention. One conversation at a time."
      cta={
        <Link to="/checkin">
          <PrimaryButton>Join the community</PrimaryButton>
        </Link>
      }
    />
  );
}