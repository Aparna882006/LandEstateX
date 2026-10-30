
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyLeads, updateLead } from "../../services/lead.service";

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

const BROKER_LINKS = [
  { to: "/broker/dashboard", label: "Dashboard" },
  { to: "/broker/properties", label: "My Properties" },
  { to: "/broker/appointments", label: "Appointments" },
  { to: "/broker/leads", label: "Leads" },
];

const formatPrice = (price) => {
  if (price == null || price === "") return "Price not available";

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) return "Price not available";

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawStatus = searchParams.get("status") || "";
  const statusFromUrl = STATUSES.includes(rawStatus) ? rawStatus : "";

  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);
  const [notesDrafts, setNotesDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatusFilter(statusFromUrl);
  }, [statusFromUrl]);

  // Debounce search to avoid an API request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await getMyLeads(params);
      const fetchedLeads = response.data?.data?.leads;

      if (!Array.isArray(fetchedLeads)) {
        throw new Error("Unexpected response received from the server.");
      }

      setLeads(fetchedLeads);

      setNotesDrafts((previous) => {
        const next = { ...previous };

        fetchedLeads.forEach((lead) => {
          if (!(lead._id in next)) {
            next[lead._id] = lead.notes || "";
          }
        });

        return next;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load leads."
      );
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setMessage("");
    setError("");

    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set("status", value);
    } else {
      nextParams.delete("status");
    }

    setSearchParams(nextParams);
  };

  const handleStatusChange = async (lead, nextStatus) => {
    if (nextStatus === lead.status || savingId) return;

    setSavingId(lead._id);
    setError("");
    setMessage("");

    try {
      await updateLead(lead._id, { status: nextStatus });
      setMessage("Lead status updated successfully.");

      // The update succeeded. Refresh errors are handled separately.
      await loadLeads();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update lead status."
      );
    } finally {
      setSavingId("");
    }
  };

  const handleSaveNotes = async (lead) => {
    if (savingId) return;

    const notes = notesDrafts[lead._id] ?? lead.notes ?? "";

    if (notes.length > 2000) {
      setError("Notes must be at most 2000 characters.");
      return;
    }

    setSavingId(lead._id);
    setError("");
    setMessage("");

    try {
      await updateLead(lead._id, { notes });
      setMessage("Notes saved successfully.");

      // Keep the saved draft; reload the list without overwriting it.
      await loadLeads();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save notes."
      );
    } finally {
      setSavingId("");
    }
  };

  const pageTitle = statusFilter
    ? `${capitalize(statusFilter)} Leads`
    : "Manage Leads";

  const emptyTitle = statusFilter
    ? `No ${statusFilter} leads found`
    : "No leads found";

  const emptyDescription = statusFilter
    ? `There are currently no ${statusFilter} leads matching your search.`
    : "Leads will appear here when buyers request property visits.";

  return (
    <DashboardLayout title="Broker" links={BROKER_LINKS}>
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            {pageTitle}
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage buyers interested in your properties.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search buyer or property..."
            aria-label="Search leads by buyer or property"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(event) => handleFilterChange(event.target.value)}
            aria-label="Filter leads by status"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
          >
            <option value="">All statuses</option>

            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {capitalize(status)}
              </option>
            ))}
          </select>
        </section>

        {message && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={loadLeads}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-600">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <h2 className="font-semibold text-gray-800">
              {emptyTitle}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              {emptyDescription}
            </p>

            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {leads.length} lead{leads.length !== 1 ? "s" : ""} found
            </p>

            <section className="grid gap-5 lg:grid-cols-2">
              {leads.map((lead) => {
                const buyer =
                  lead.buyer_id && typeof lead.buyer_id === "object"
                    ? lead.buyer_id
                    : {};

                const property =
                  lead.property_id && typeof lead.property_id === "object"
                    ? lead.property_id
                    : {};

                const isSaving = savingId === lead._id;

                return (
                  <article
                    key={lead._id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {buyer.full_name || "Buyer"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                          {buyer.email || "Email unavailable"}
                        </p>

                        {buyer.phone_number && (
                          <p className="mt-1 text-sm text-gray-600">
                            {buyer.phone_number}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {lead.status}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Property
                      </p>

                      <h3 className="mt-1 font-semibold text-gray-900">
                        {property.title || "Property unavailable"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatPrice(property.price)}
                      </p>

                      {property.location?.city && (
                        <p className="mt-1 text-sm text-gray-600">
                          {[
                            property.location.locality,
                            property.location.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Lead created: {formatDate(lead.created_at)}
                    </p>

                    <label
                      htmlFor={`status-${lead._id}`}
                      className="mt-4 block text-sm font-medium text-gray-700"
                    >
                      Update status
                    </label>

                    <select
                      id={`status-${lead._id}`}
                      value={lead.status}
                      disabled={isSaving}
                      onChange={(event) =>
                        handleStatusChange(lead, event.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:opacity-60"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {capitalize(status)}
                        </option>
                      ))}
                    </select>

                    <label
                      htmlFor={`notes-${lead._id}`}
                      className="mt-4 block text-sm font-medium text-gray-700"
                    >
                      Broker notes
                    </label>

                    <textarea
                      id={`notes-${lead._id}`}
                      rows={3}
                      maxLength={2000}
                      value={notesDrafts[lead._id] ?? lead.notes ?? ""}
                      disabled={isSaving}
                      onChange={(event) =>
                        setNotesDrafts((current) => ({
                          ...current,
                          [lead._id]: event.target.value,
                        }))
                      }
                      placeholder="Write follow-up notes..."
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                    />

                    <div className="mt-1 text-right text-xs text-gray-500">
                      {(notesDrafts[lead._id] ?? lead.notes ?? "").length}/2000
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveNotes(lead)}
                      className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save notes"}
                    </button>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>
    </DashboardLayout>
  );
}
