"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@clerk/nextjs";
import { PRODUCT_CATEGORIES } from "@/lib/constants/topics";
import SettingsSection from "@/components/SettingsSection";
import Toggle from "@/components/ui/Toggle";
import Select from "@/components/ui/Select";

interface Preferences {
  product_category: string;
  daily_digest_enabled: boolean;
  watchlist_alerts_enabled: boolean;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setPrefs(data);
        setCategory(data.product_category);
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function updatePrefs(updates: Partial<Preferences>) {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleCategorySave() {
    await updatePrefs({ product_category: category });
  }

  async function handleToggle(
    field: "daily_digest_enabled" | "watchlist_alerts_enabled",
    value: boolean
  ) {
    setPrefs((prev) => (prev ? { ...prev, [field]: value } : prev));
    await updatePrefs({ [field]: value });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved</span>
        )}
        {error && (
          <span className="text-sm text-red-600 font-medium">{error}</span>
        )}
      </div>

      {/* Product Category */}
      <SettingsSection
        title="Product Category"
        description="We tailor your regulatory briefings based on your AI product type."
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Select
              value={category}
              onChange={setCategory}
              options={PRODUCT_CATEGORIES.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              label="Your AI product type"
            />
          </div>
          <button
            onClick={handleCategorySave}
            disabled={saving || category === prefs?.product_category}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </SettingsSection>

      {/* Email Preferences */}
      <SettingsSection
        title="Email Preferences"
        description="Control which email notifications you receive."
      >
        <div className="space-y-4">
          <Toggle
            enabled={prefs?.daily_digest_enabled ?? true}
            onChange={(v) => handleToggle("daily_digest_enabled", v)}
            label="Daily Digest"
            description="Receive a daily email summary of new regulatory updates."
            loading={saving}
          />
          <Toggle
            enabled={prefs?.watchlist_alerts_enabled ?? true}
            onChange={(v) => handleToggle("watchlist_alerts_enabled", v)}
            label="Watchlist Alerts"
            description="Get notified when new articles match your watchlist topics."
            loading={saving}
          />
        </div>
      </SettingsSection>

      {/* Billing */}
      <SettingsSection
        title="Billing"
        description="Manage your subscription and payment details."
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Pro Plan — $20/month
            </p>
            <p className="text-sm text-gray-500">Status: Trial</p>
          </div>
          <button
            onClick={async () => {
              setBillingLoading(true);
              try {
                const res = await fetch("/api/billing-portal", {
                  method: "POST",
                });
                const data = await res.json();
                if (res.ok && data.url) {
                  window.location.href = data.url;
                } else {
                  setError(data.error || "Could not open billing portal");
                  setBillingLoading(false);
                }
              } catch {
                setError("Failed to open billing portal");
                setBillingLoading(false);
              }
            }}
            disabled={billingLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {billingLoading ? "Loading..." : "Manage Billing"}
          </button>
        </div>
      </SettingsSection>

      {/* Account */}
      <SettingsSection
        title="Account"
        description="Manage your email, password, and security settings."
      >
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 p-0",
            },
          }}
        />
      </SettingsSection>
    </div>
  );
}
