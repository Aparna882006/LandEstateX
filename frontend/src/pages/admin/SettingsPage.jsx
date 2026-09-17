/**
 * SettingsPage.jsx
 * /admin/settings — edit the global Settings document (toggles + thresholds).
 */

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const TOGGLES = [
  { key: "maintenanceMode", label: "Maintenance mode" },
  { key: "allowNewRegistrations", label: "Allow new registrations" },
  { key: "requireEmailVerification", label: "Require email verification" },
  { key: "listingApprovalRequired", label: "Require admin approval for new listings" },
];

const NUMBERS = [
  { key: "maxPropertyImages", label: "Max images per listing" },
  { key: "fraudFlagPriceDeviationPercent", label: "Fraud flag: price deviation %" },
  { key: "fraudFlagMaxListingsPerDay", label: "Fraud flag: max listings/day" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await adminService.getSettings();
        if (mounted) setSettings(data);
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || "Failed to load settings");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      setSavedAt(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Settings" links={ADMIN_NAV_LINKS}>
      {loading && <p className="text-sm text-neutral-500">Loading settings...</p>}

      {!loading && error && (
        <div className="rounded-md border border-danger-600/30 bg-danger-600/5 px-4 py-3 text-sm text-danger-600 mb-4">
          {error}
        </div>
      )}

      {!loading && settings && (
        <div className="max-w-xl space-y-8">
          <div>
            <p className="text-sm font-medium text-primary-900 mb-3">
              Feature toggles
            </p>
            <div className="space-y-3">
              {TOGGLES.map((t) => (
                <label
                  key={t.key}
                  className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-0 px-4 py-3"
                >
                  <span className="text-sm text-neutral-500">{t.label}</span>
                  <input
                    type="checkbox"
                    checked={!!settings[t.key]}
                    onChange={() => handleToggle(t.key)}
                    className="h-4 w-4 accent-primary-700"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-primary-900 mb-3">
              Thresholds
            </p>
            <div className="space-y-3">
              {NUMBERS.map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-0 px-4 py-3"
                >
                  <span className="text-sm text-neutral-500">{n.label}</span>
                  <input
                    type="number"
                    value={settings[n.key] ?? 0}
                    onChange={(e) => handleNumberChange(n.key, e.target.value)}
                    className="w-24 rounded-md border border-neutral-200 px-2 py-1 text-sm text-right"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-neutral-0 hover:bg-primary-900 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {savedAt && !saving && (
              <span className="text-xs text-success-600">
                Saved {savedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
