export default function StatCard({ label, value, icon: Icon, accent = false, trend }) {
  return (
    <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
        {trend && <p className="text-xs text-success-600 mt-1">{trend}</p>}
      </div>
      {Icon && (
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            accent ? "bg-accent-100 text-accent-600" : "bg-primary-100 text-primary-700"
          }`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
