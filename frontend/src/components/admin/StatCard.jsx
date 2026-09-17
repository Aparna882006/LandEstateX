/**
 * StatCard.jsx — small reusable metric card for the admin dashboard.
 */
export default function StatCard({ label, value, accent = false }) {
  return (
    <div
      className={[
        "rounded-lg border p-5",
        accent
          ? "border-accent-600/30 bg-accent-100"
          : "border-neutral-200 bg-neutral-0",
      ].join(" ")}
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-primary-900">
        {value ?? "—"}
      </p>
    </div>
  );
}
