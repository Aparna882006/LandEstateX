const STATUS_STYLES = {
  // Lead statuses
  new: "bg-info-100 text-info-600 border-info-200",
  contacted: "bg-neutral-100 text-neutral-700 border-neutral-200",
  qualified: "bg-primary-100 text-primary-700 border-primary-200",
  negotiating: "bg-amber-100 text-amber-700 border-amber-200",
  won: "bg-success-100 text-success-600 border-success-200",
  lost: "bg-danger-100 text-danger-600 border-danger-200",

  // Property statuses
  active: "bg-success-100 text-success-600 border-success-200",
  inactive: "bg-neutral-100 text-neutral-500 border-neutral-200",
  sold: "bg-primary-100 text-primary-700 border-primary-200",
  rented: "bg-primary-100 text-primary-700 border-primary-200",
  pending_review: "bg-amber-100 text-amber-700 border-amber-200",

  // Appointment statuses
  requested: "bg-info-100 text-info-600 border-info-200",
  confirmed: "bg-success-100 text-success-600 border-success-200",
  rescheduled: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-primary-100 text-primary-700 border-primary-200",
  cancelled: "bg-danger-100 text-danger-600 border-danger-200",
  no_show: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

const LABELS = {
  pending_review: "Pending review",
  no_show: "No show",
};

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-500 border-neutral-200";
  const label = LABELS[status] || status?.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
