import { useEffect, useRef, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "../../services/broker.service";

export default function BrokerTopbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    getUnreadCount()
      .then((res) => setUnreadCount(res.data.data.unreadCount))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const res = await getMyNotifications({ limit: 6 });
        setNotifications(res.data.data.notifications);
      } catch {
        /* fail silently, bell just stays empty */
      }
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-neutral-0/90 backdrop-blur border-b border-neutral-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-500 hover:bg-neutral-50"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={ref}>
          <button
            onClick={toggleOpen}
            className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-danger-600 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-neutral-0 border border-neutral-200 rounded-xl shadow-lg">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                <span className="text-sm font-semibold text-neutral-900">Notifications</span>
                <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-700 hover:text-primary-900">
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-neutral-500">You're all caught up.</p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 border-b border-neutral-200 last:border-0 cursor-pointer hover:bg-neutral-50 ${
                        !n.isRead ? "bg-primary-100/40" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-neutral-900">{n.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-900">
            {user?.name?.charAt(0)?.toUpperCase() || "B"}
          </div>
          <span className="hidden sm:block text-sm font-medium text-neutral-900">{user?.name || "Broker"}</span>
        </div>
      </div>
    </header>
  );
}
