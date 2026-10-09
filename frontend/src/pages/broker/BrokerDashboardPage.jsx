import { useEffect, useState } from "react";

import { getMyBrokerDashboard } from "../../services/broker.service";
import DashboardLayout from "../../components/layout/DashboardLayout";

const BROKER_LINKS = [
  {
    to: "/broker/dashboard",
    label: "Dashboard",
  },
  {
    to: "/broker/properties",
    label: "My Properties",
  },
  {
    to: "/broker/appointments",
    label: "Appointments",
  },
];

const BrokerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");

        const { data } = await getMyBrokerDashboard();

        setDashboard(data.data);
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

  const content = (() => {
    if (loading) {
      return (
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-neutral-500">
            Loading broker dashboard...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-danger-600/10 p-4 text-sm text-danger-600">
            {error}
          </div>
        </div>
      );
    }

    const cards = [
      {
        title: "Total Properties",
        value: dashboard?.total_properties ?? 0,
      },
      {
        title: "Active Properties",
        value: dashboard?.active_properties ?? 0,
      },
      {
        title: "Total Leads",
        value: dashboard?.total_leads ?? 0,
      },
      {
        title: "New Leads",
        value: dashboard?.new_leads ?? 0,
      },
      {
        title: "Upcoming Appointments",
        value: dashboard?.upcoming_appointments ?? 0,
      },
      {
        title: "Completed Appointments",
        value: dashboard?.completed_appointments ?? 0,
      },
      {
        title: "Average Rating",
        value: dashboard?.average_rating ?? 0,
      },
      {
        title: "Trust Score",
        value: dashboard?.trust_score ?? 0,
      },
    ];

    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Broker Dashboard
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage your properties, leads, appointments and broker
            performance.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-neutral-500">
                {card.title}
              </p>

              <p className="mt-2 text-2xl font-semibold text-neutral-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  })();

  return (
    <DashboardLayout
      title="Broker"
      links={BROKER_LINKS}
    >
      {content}
    </DashboardLayout>
  );
};

export default BrokerDashboardPage;