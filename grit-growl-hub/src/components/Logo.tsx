import logo from "@/assets/grit-logo.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="Grit & Growl"
      className={`select-none ${className}`}
      style={{ height: "32px", width: "auto" }}
    />
  );
}