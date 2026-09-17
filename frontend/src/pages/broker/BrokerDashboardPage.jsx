import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, CalendarClock, TrendingUp, Star, ArrowRight } from "lucide-react";
import StatCard from "../../components/broker/StatCard";
import TrustBadge from "../../components/broker/TrustBadge";
import StatusPill from "../../components/broker/StatusPill";
import { getDashboardSummary } from "../../services/broker.service";
const PIPELINE_ORDER = ["new", "contacted", "qualified", "negotiating", "won", "lost"];

export default function BrokerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setData(res.data.data))
      .catch(() => setError("Couldn't load your dashboard. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-200/60 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-neutral-200/60 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-danger-600">{error}</p>;
  }

  const totalPipeline = PIPELINE_ORDER.reduce((sum, key) => sum + (data.leadPipeline[key] || 0), 0) || 1;

  return (
    <div className="space-y-6">
      {/* Trust score banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-0 border border-neutral-200 rounded-xl p-5">
        <div>
          <p className="text-sm text-neutral-500">Your trust score</p>
          <div className="flex items-center gap-3 mt-1">
            <TrustBadge tier={data.trustBadge} score={data.trustScore} />
          </div>
        </div>
        <Link
          to="/broker/trust-score"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          View breakdown <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active listings" value={data.cards.activeListings} icon={Building2} />
        <StatCard label="New leads" value={data.cards.newLeadsCount} icon={Users} accent />
        <StatCard label="Upcoming appointments" value={data.cards.upcomingAppointmentsCount} icon={CalendarClock} />
        <StatCard label="Avg. rating" value={data.stats.avgRating ? `${data.stats.avgRating.toFixed(1)} ★` : "—"} icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead pipeline */}
        <div className="lg:col-span-2 bg-neutral-0 border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Lead pipeline</h2>
            <Link to="/broker/leads" className="text-xs font-medium text-primary-700 hover:text-primary-900">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {PIPELINE_ORDER.map((key) => {
              const count = data.leadPipeline[key] || 0;
              const pct = Math.round((count / totalPipeline) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize text-neutral-700 font-medium">{key}</span>
                    <span className="text-neutral-500">{count}</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${key === "won" ? "bg-success-600" : key === "lost" ? "bg-danger-600" : "bg-primary-700"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Upcoming visits</h2>
            <Link to="/broker/appointments" className="text-xs font-medium text-primary-700 hover:text-primary-900">
              View all
            </Link>
          </div>
          {data.upcomingAppointments.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing scheduled yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingAppointments.map((appt) => (
                <li key={appt._id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{appt.property?.title}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(appt.scheduledAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusPill status={appt.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">Recent reviews</h2>
          <Link to="/broker/reviews" className="text-xs font-medium text-primary-700 hover:text-primary-900">
            View all
          </Link>
        </div>
        {data.recentReviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet. They'll show up here once buyers rate you.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.recentReviews.map((r) => (
              <div key={r._id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-neutral-900">{r.reviewer?.name}</span>
                  <span className="text-xs text-accent-600 font-medium">{"★".repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-neutral-500 line-clamp-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
