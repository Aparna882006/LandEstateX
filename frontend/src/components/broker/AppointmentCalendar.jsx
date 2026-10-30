
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getMyAppointments,
  updateAppointmentStatus,
} from "../../services/appointment.service";

const STATUS_OPTIONS = [
  "all",
  "upcoming",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const AppointmentCalendar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("view") || "all";

  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(searchParams.get("view") || "all");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        // Completed ko API se filter karo.
        // Upcoming ko date aur status ke basis par client-side filter karenge.
        const params =
          status === "all" || status === "upcoming"
            ? {}
            : { status };

        const { data } = await getMyAppointments(params);
        const results = data?.data?.appointments || [];

        if (!cancelled) {
          setAppointments(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to load appointments."
          );
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleFilterChange = (nextStatus) => {
    setStatus(nextStatus);

    const nextParams = new URLSearchParams(searchParams);

    if (nextStatus === "all") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", nextStatus);
    }

    setSearchParams(nextParams);
  };

  const handleStatusChange = async (appointmentId, nextStatus) => {
    try {
      setUpdatingId(appointmentId);
      setError("");

      await updateAppointmentStatus(appointmentId, nextStatus);

      // Refresh so the appointment disappears from the current
      // filtered list if it no longer matches the selected category.
      const params =
        status === "all" || status === "upcoming"
          ? {}
          : { status };

      const { data } = await getMyAppointments(params);
      setAppointments(data?.data?.appointments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update appointment."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getAvailableActions = (appointmentStatus) => {
    if (appointmentStatus === "pending") {
      return [
        { label: "Confirm", status: "confirmed" },
        { label: "Cancel", status: "cancelled" },
      ];
    }

    if (appointmentStatus === "confirmed") {
      return [
        { label: "Complete", status: "completed" },
        { label: "Cancel", status: "cancelled" },
      ];
    }

    return [];
  };

  const visibleAppointments =
    status === "upcoming"
      ? appointments.filter((appointment) => {
          const appointmentDate = new Date(
            appointment.scheduled_at
          ).getTime();

          return (
            ["pending", "confirmed"].includes(appointment.status) &&
            Number.isFinite(appointmentDate) &&
            appointmentDate >= Date.now()
          );
        })
      : appointments;

  const pageTitle =
    status === "upcoming"
      ? "Upcoming Appointments"
      : status === "all"
        ? "Appointments"
        : `${status.charAt(0).toUpperCase()}${status.slice(1)} Appointments`;

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">
          Loading appointments...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {pageTitle}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your property appointments and buyer requests.
          </p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            handleFilterChange(event.target.value)
          }
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-primary-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all"
                ? "All Appointments"
                : option === "upcoming"
                  ? "Upcoming Appointments"
                  : option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-600/10 p-4 text-sm text-danger-600">
          {error}
        </div>
      )}

      {visibleAppointments.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center shadow-sm">
          <h3 className="text-base font-semibold text-neutral-900">
            {status === "upcoming"
              ? "No upcoming appointments"
              : status === "all"
                ? "No appointments found"
                : `No ${status} appointments`}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {status === "upcoming"
              ? "You have no future pending or confirmed appointments."
              : "There are no appointments matching this category."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAppointments.map((appointment) => {
            const actions = getAvailableActions(appointment.status);
            const buyer = appointment.buyer_id;
            const property = appointment.property_id;

            return (
              <div
                key={appointment._id}
                className="rounded-lg bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900">
                      {property?.title || "Property unavailable"}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Scheduled: {formatDateTime(appointment.scheduled_at)}
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-700">
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Buyer
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-800">
                      {buyer?.full_name || "—"}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {buyer?.email || "—"}
                    </p>
                    {buyer?.phone_number && (
                      <p className="text-sm text-neutral-500">
                        {buyer.phone_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Property
                    </p>
                    <p className="mt-1 text-sm text-neutral-800">
                      {property?.property_type || "—"}
                    </p>
                    {property?.location?.city && (
                      <p className="text-sm text-neutral-500">
                        {property.location.city}
                        {property.location.locality
                          ? `, ${property.location.locality}`
                          : ""}
                      </p>
                    )}
                    {property?.price !== undefined && (
                      <p className="text-sm text-neutral-500">
                        ₹{Number(property.price).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 rounded-md bg-neutral-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Notes
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {actions.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          handleStatusChange(
                            appointment._id,
                            action.status
                          )
                        }
                        className="rounded-md bg-primary-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
