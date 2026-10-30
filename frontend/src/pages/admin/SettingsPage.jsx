import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import adminService from "../../services/admin.service";
import { ADMIN_NAV_LINKS } from "./adminNavLinks";

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  listingApprovalRequired: true,

  maxPropertyImages: 15,
  fraudFlagPriceDeviationPercent: 60,
  fraudFlagMaxListingsPerDay: 10,
};

const TOGGLE_SETTINGS = [
  {
    key: "maintenanceMode",
    title: "Maintenance mode",
    description:
      "Temporarily restrict access to the platform while maintenance is in progress.",
    category: "Platform",
  },
  {
    key: "allowNewRegistrations",
    title: "Allow new registrations",
    description:
      "Allow new users to create accounts on LandEstateX.",
    category: "Platform",
  },
  {
    key: "requireEmailVerification",
    title: "Require email verification",
    description:
      "Users must verify their email address before accessing restricted features.",
    category: "Security",
  },
  {
    key: "listingApprovalRequired",
    title: "Require listing approval",
    description:
      "New property listings must be reviewed by an admin before being published.",
    category: "Marketplace",
  },
];

const NUMBER_SETTINGS = [
  {
    key: "maxPropertyImages",
    title: "Maximum images per listing",
    description:
      "Maximum number of images a user can upload for one property.",
    min: 1,
    max: 50,
    step: 1,
    suffix: "images",
  },
  {
    key: "fraudFlagPriceDeviationPercent",
    title: "Price deviation threshold",
    description:
      "Flag a property when its price differs from the AI predicted price by more than this percentage.",
    min: 0,
    max: 1000,
    step: 1,
    suffix: "%",
  },
  {
    key: "fraudFlagMaxListingsPerDay",
    title: "Daily listing limit",
    description:
      "Flag accounts that create more than this number of property listings in one day.",
    min: 1,
    max: 500,
    step: 1,
    suffix: "listings/day",
  },
];

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
        ${
          checked
            ? "bg-blue-600"
            : "bg-neutral-300"
        }
        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
          ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
      />
    </button>
  );
}

function SettingCard({ children }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setInitialLoading(true);
    setError("");

    try {
      const response = await adminService.getSettings();

      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...(response || {}),
      };

      setSettings(loadedSettings);
      setHasChanges(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load settings. Please try again."
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setHasChanges(true);
    setSuccess("");
    setError("");
  };

  const handleNumberChange = (key, value) => {
    if (value === "") {
      updateSetting(key, "");
      return;
    }

    updateSetting(key, Number(value));
  };

  const validateSettings = () => {
    for (const item of NUMBER_SETTINGS) {
      const value = Number(settings[item.key]);

      if (!Number.isFinite(value)) {
        return `${item.title} must be a valid number.`;
      }

      if (value < item.min || value > item.max) {
        return `${item.title} must be between ${item.min} and ${item.max}.`;
      }

      if (
        item.step === 1 &&
        !Number.isInteger(value)
      ) {
        return `${item.title} must be a whole number.`;
      }
    }

    return "";
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const validationError = validateSettings();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        maintenanceMode: Boolean(settings.maintenanceMode),
        allowNewRegistrations: Boolean(
          settings.allowNewRegistrations
        ),
        requireEmailVerification: Boolean(
          settings.requireEmailVerification
        ),
        listingApprovalRequired: Boolean(
          settings.listingApprovalRequired
        ),

        maxPropertyImages: Number(
          settings.maxPropertyImages
        ),

        fraudFlagPriceDeviationPercent: Number(
          settings.fraudFlagPriceDeviationPercent
        ),

        fraudFlagMaxListingsPerDay: Number(
          settings.fraudFlagMaxListingsPerDay
        ),
      };

      const updatedSettings =
        await adminService.updateSettings(payload);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(updatedSettings || payload),
      });

      setHasChanges(false);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setSuccess("");
  };

  if (initialLoading) {
    return (
      <DashboardLayout
        title="Settings"
        links={ADMIN_NAV_LINKS}
      >
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-neutral-500">
              Loading settings...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      links={ADMIN_NAV_LINKS}
    >
      <form
        onSubmit={handleSave}
        className="mx-auto max-w-5xl space-y-6"
      >
        {/* Page heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Platform settings
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage platform behavior, marketplace rules,
              security, and fraud detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                hasChanges
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {hasChanges
                ? "Unsaved changes"
                : "All changes saved"}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Platform controls */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              Platform controls
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Control registrations and platform availability.
            </p>
          </div>

          <SettingCard>
            {TOGGLE_SETTINGS
              .filter(
                (item) => item.category === "Platform"
              )
              .map((item, index, array) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    index !== array.length - 1
                      ? "border-b border-neutral-100"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {item.description}
                    </p>
                  </div>

                  <ToggleSwitch
                    checked={Boolean(settings[item.key])}
                    disabled={saving}
                    onChange={(value) =>
                      updateSetting(item.key, value)
                    }
                  />
                </div>
              ))}
          </SettingCard>
        </section>

        {/* Security */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              Security
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Configure account verification requirements.
            </p>
          </div>

          <SettingCard>
            {TOGGLE_SETTINGS
              .filter(
                (item) => item.category === "Security"
              )
              .map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {item.description}
                    </p>
                  </div>

                  <ToggleSwitch
                    checked={Boolean(settings[item.key])}
                    disabled={saving}
                    onChange={(value) =>
                      updateSetting(item.key, value)
                    }
                  />
                </div>
              ))}
          </SettingCard>
        </section>

        {/* Marketplace */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              Marketplace
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Set rules for property listings.
            </p>
          </div>

          <SettingCard>
            {TOGGLE_SETTINGS
              .filter(
                (item) =>
                  item.category === "Marketplace"
              )
              .map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {item.description}
                    </p>
                  </div>

                  <ToggleSwitch
                    checked={Boolean(settings[item.key])}
                    disabled={saving}
                    onChange={(value) =>
                      updateSetting(item.key, value)
                    }
                  />
                </div>
              ))}

            {NUMBER_SETTINGS
              .filter(
                (item) =>
                  item.key === "maxPropertyImages"
              )
              .map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={settings[item.key]}
                      disabled={saving}
                      onChange={(event) =>
                        handleNumberChange(
                          item.key,
                          event.target.value
                        )
                      }
                      className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-right text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-neutral-100"
                    />

                    <span className="text-xs text-neutral-500">
                      {item.suffix}
                    </span>
                  </div>
                </div>
              ))}
          </SettingCard>
        </section>

        {/* Fraud detection */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              Fraud detection
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Configure automated risk signals for suspicious
              property listings and user activity.
            </p>
          </div>

          <SettingCard>
            {NUMBER_SETTINGS
              .filter(
                (item) =>
                  item.key !== "maxPropertyImages"
              )
              .map((item, index, array) => (
                <div
                  key={item.key}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    index !== array.length - 1
                      ? "border-b border-neutral-100"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">
                      {item.title}
                    </p>

                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      type="number"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={settings[item.key]}
                      disabled={saving}
                      onChange={(event) =>
                        handleNumberChange(
                          item.key,
                          event.target.value
                        )
                      }
                      className="w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-right text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-neutral-100"
                    />

                    <span className="text-xs text-neutral-500">
                      {item.suffix}
                    </span>
                  </div>
                </div>
              ))}
          </SettingCard>

          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-900">
              Fraud detection note
            </p>

            <p className="mt-1 text-sm text-blue-800">
              These thresholds generate review flags. A flag
              indicates suspicious activity and is not proof
              of fraud.
            </p>
          </div>
        </section>

        {/* Save area */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              {hasChanges
                ? "You have changes that have not been saved."
                : "Your settings are up to date."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || !hasChanges}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}