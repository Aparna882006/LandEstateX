import { ShieldCheck } from "lucide-react";

const badgeStyles = {
  platinum: "bg-indigo-100 text-indigo-700 border-indigo-200",
  gold: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-neutral-200 text-neutral-700 border-neutral-300",
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
  unranked: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export default function TrustBadge({ tier = "unranked", score, size = "md" }) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium capitalize ${sizeClasses} ${
        badgeStyles[tier] || badgeStyles.unranked
      }`}
    >
      <ShieldCheck size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
      {tier}
      {typeof score === "number" && <span className="opacity-70">· {score}/100</span>}
    </span>
  );
}
