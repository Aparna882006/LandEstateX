/**
 * AdminDashboardPage.jsx
 * Interactive admin dashboard with category-specific navigation.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/admin/StatCard";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await adminService.getDashboardStats();

        if (mounted) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load dashboard stats"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const userCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      path: "/admin/users",
    },
    {
      label: "Buyers",
      value: stats?.totalBuyers ?? 0,
      path: "/admin/users?role=buyer",
    },
    {
      label: "Brokers",
      value: stats?.totalBrokers ?? 0,
      path: "/admin/users?role=broker",
    },
    {
      label: "Verified Users",
      value: stats?.verifiedUsers ?? 0,
      path: "/admin/users?verified=true",
    },
    {
      label: "Unverified Users",
      value: stats?.unverifiedUsers ?? 0,
      path: "/admin/users?verified=false",
      accent: true,
    },
    {
      label: "New This Week",
      value: stats?.newUsersThisWeek ?? 0,
      path: "/admin/users?period=week",
      accent: true,
    },
  ];

  const propertyCards = [
    {
      label: "Total Properties",
      value: stats?.totalProperties ?? 0,
      path: "/admin/properties",
    },
    {
      label: "Pending Properties",
      value: stats?.pendingProperties ?? 0,
      path: "/admin/properties?status=pending",
      accent: true,
    },
    {
      label: "Approved Properties",
      value: stats?.approvedProperties ?? 0,
      path: "/admin/properties?status=approved",
    },
    {
      label: "Rejected Properties",
      value: stats?.rejectedProperties ?? 0,
      path: "/admin/properties?status=rejected",
    },
    {
      label: "Sold Properties",
      value: stats?.soldProperties ?? 0,
      path: "/admin/properties?status=sold",
    },
    {
      label: "Flagged Properties",
      value: stats?.flaggedProperties ?? 0,
      path: "/admin/properties?status=flagged",
      accent: true,
    },
  ];

  const renderStatCards = (items) =>
    items.map((card) => (
      <button
        key={card.label}
        type="button"
        onClick={() => navigate(card.path)}
        aria-label={`Open ${card.label}: ${card.value} records`}
        className="block w-full rounded-xl text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
      >
        <StatCard
          label={card.label}
          value={card.value}
          accent={card.accent}
        />
      </button>
    ));

  return (
    <DashboardLayout
      title="Admin Dashboard"
      links={ADMIN_NAV_LINKS}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Platform Overview
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Monitor users, listings, verification and platform activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="self-start rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          {loading ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-neutral-200"
            />
          ))}
        </div>
      )}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600"
        >
          {error}
          <button
            type="button"
            onClick={loadStats}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <section aria-labelledby="user-overview-heading">
            <h3
              id="user-overview-heading"
              className="mb-3 text-base font-semibold text-neutral-800"
            >
              User Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {renderStatCards(userCards)}
            </div>
          </section>
 
          <section
            aria-labelledby="property-overview-heading"
            className="mt-8"
          >
            <h3
              id="property-overview-heading"
              className="mb-3 text-base font-semibold text-neutral-800"
            >
              Property Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {renderStatCards(propertyCards)}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="mb-3 text-base font-semibold text-neutral-800">
              Quick Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-900"
              >
                Manage Users →
              </Link>

              <Link
                to="/admin/brokers"
                className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Manage Brokers →
              </Link>

              <Link
                to="/admin/properties"
                className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Manage Properties →
              </Link>

              <Link
                to="/admin/fraud"
                className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Review Fraud Flags →
              </Link>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
