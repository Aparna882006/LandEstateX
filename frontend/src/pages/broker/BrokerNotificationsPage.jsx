import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../../services/broker.service";

export default function BrokerNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = () => {
    setLoading(true);
    getMyNotifications({ limit: 50, unreadOnly: filter === "unread" ? "true" : undefined })
      .then((res) => setNotifications(res.data.data.notifications))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
                filter === f
                  ? "bg-primary-900 text-white border-primary-900"
                  : "bg-neutral-0 text-neutral-700 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-700 hover:text-primary-900">
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <Bell className="mx-auto text-neutral-500 mb-2" size={28} />
          <p className="text-sm font-medium text-neutral-900">You're all caught up</p>
        </div>
      ) : (
        <ul className="bg-neutral-0 border border-neutral-200 rounded-xl divide-y divide-neutral-200">
          {notifications.map((n) => (
            <li key={n._id} className={`flex items-start gap-3 p-4 ${!n.isRead ? "bg-primary-100/30" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-accent-600" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{n.title}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-neutral-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-50" title="Mark read">
                    <Check size={15} />
                  </button>
                )}
                <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg text-neutral-500 hover:bg-danger-100/50 hover:text-danger-600" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
