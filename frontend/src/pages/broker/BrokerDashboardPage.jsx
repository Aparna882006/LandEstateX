
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyBrokerDashboard } from "../../services/broker.service";
import DashboardLayout from "../../components/layout/DashboardLayout";

const BROKER_LINKS = [
  { to: "/broker/dashboard", label: "Dashboard" },
  { to: "/broker/properties", label: "My Properties" },
  { to: "/broker/appointments", label: "Appointments" },
  { to: "/broker/leads", label: "Leads" },
];

export default function BrokerDashboardPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");
        const { data } = await getMyBrokerDashboard();
        setDashboard(data?.data ?? {});
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load broker dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Properties",
      value: dashboard?.total_properties ?? 0,
      path: "/broker/properties",
    },
    {
      title: "Active Properties",
      value: dashboard?.active_properties ?? 0,
      path: "/broker/properties",
    },
    {
      title: "Total Leads",
      value: dashboard?.total_leads ?? 0,
      path: "/broker/leads",
    },
    {
      title: "New Leads",
      value: dashboard?.new_leads ?? 0,
      path: "/broker/leads?status=new",
    },
    {
      title: "Contacted Leads",
      value: dashboard?.contacted_leads ?? 0,
      path: "/broker/leads?status=contacted",
    },
    {
      title: "Qualified Leads",
      value: dashboard?.qualified_leads ?? 0,
      path: "/broker/leads?status=qualified",
    },
    {
      title: "Converted Leads",
      value: dashboard?.converted_leads ?? 0,
      path: "/broker/leads?status=converted",
    },
    {
      title: "Lost Leads",
      value: dashboard?.lost_leads ?? 0,
      path: "/broker/leads?status=lost",
    },
    {
      title: "Conversion Rate",
      value: `${dashboard?.conversion_rate ?? 0}%`,
      path: "/broker/leads",
    },
    {
      title: "Upcoming Appointments",
      value: dashboard?.upcoming_appointments ?? 0,
      path: "/broker/appointments?view=upcoming",
    },
    {
      title: "Completed Appointments",
      value: dashboard?.completed_appointments ?? 0,
      path: "/broker/appointments?view=completed",
    },
    {
      title: "Average Rating",
      value: dashboard?.average_rating ?? 0,
      path: null,
    },
    {
      title: "Trust Score",
      value: dashboard?.trust_score ?? 0,
      path: null,
    },
  ];

  return (
    <DashboardLayout title="Broker" links={BROKER_LINKS}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Broker Dashboard
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage your properties, leads, appointments and broker performance.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">
            Loading broker dashboard...
          </p>
        ) : error ? (
          <div className="rounded-lg bg-danger-600/10 p-4 text-sm text-danger-600">
            {error}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                disabled={!card.path}
                onClick={() => {
                  if (card.path) navigate(card.path);
                }}
                className={`rounded-lg bg-white p-5 text-left shadow-sm transition-shadow ${
                  card.path
                    ? "cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    : "cursor-default"
                }`}
              >
                <p className="text-sm text-neutral-500">
                  {card.title}
                </p>

                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                  {card.value}
                </p>

                {card.path && (
                  <p className="mt-2 text-xs text-primary-700">
                    Click to view
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
