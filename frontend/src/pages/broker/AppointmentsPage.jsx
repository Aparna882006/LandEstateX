import { useEffect, useState } from "react";
import { CalendarClock, MapPin, User } from "lucide-react";
import StatusPill from "../../components/broker/StatusPill";
import {
  getMyAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
} from "../../services/broker.service";

const FILTERS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Requested", value: "requested" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");

  const fetchAppointments = () => {
    setLoading(true);
    const params = filter === "upcoming" ? { from: new Date().toISOString() } : { status: filter };
    getMyAppointments(params)
      .then((res) => setAppointments(res.data.data.appointments))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleAction = async (action, id, ...args) => {
    await action(id, ...args).catch(() => {});
    fetchAppointments();
    setRescheduleId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.value
                ? "bg-primary-900 text-white border-primary-900"
                : "bg-neutral-0 text-neutral-700 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <CalendarClock className="mx-auto text-neutral-500 mb-2" size={28} />
          <p className="text-sm font-medium text-neutral-900">No appointments here</p>
          <p className="text-sm text-neutral-500 mt-1">They'll show up once buyers request a visit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-neutral-0 border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-neutral-900 truncate">{appt.property?.title}</h3>
                  <StatusPill status={appt.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} />
                    {new Date(appt.scheduledAt).toLocaleString(undefined, {
                      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} /> {appt.buyer?.name}
                  </span>
                  {appt.location && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin size={12} /> {appt.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {appt.status === "requested" && (
                  <button
                    onClick={() => handleAction(confirmAppointment, appt._id)}
                    className="px-3 py-1.5 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-700"
                  >
                    Confirm
                  </button>
                )}
                {["requested", "confirmed"].includes(appt.status) && (
                  <>
                    <button
                      onClick={() => setRescheduleId(rescheduleId === appt._id ? null : appt._id)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleAction(cancelAppointment, appt._id, "Broker unavailable")}
                      className="px-3 py-1.5 rounded-lg border border-danger-200 text-xs font-medium text-danger-600 hover:bg-danger-100/50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {appt.status === "confirmed" && new Date(appt.scheduledAt) < new Date() && (
                  <button
                    onClick={() => handleAction(completeAppointment, appt._id, "")}
                    className="px-3 py-1.5 rounded-lg bg-success-600 text-white text-xs font-medium hover:opacity-90"
                  >
                    Mark complete
                  </button>
                )}
              </div>

              {rescheduleId === appt._id && (
                <div className="w-full flex items-center gap-2 pt-2 border-t border-neutral-200 sm:col-span-2">
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    onClick={() => handleAction(rescheduleAppointment, appt._id, new Date(newDate).toISOString())}
                    disabled={!newDate}
                    className="px-3 py-2 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
