"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/constants/topics";

interface AddTopicDropdownProps {
  watchedTopics: string[];
  onAdd: (topic: string) => Promise<void>;
}

export default function AddTopicDropdown({
  watchedTopics,
  onAdd,
}: AddTopicDropdownProps) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const available = TOPICS.filter(
    (t) =>
      !watchedTopics.includes(t.id) &&
      (t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const allWatched = TOPICS.every((t) => watchedTopics.includes(t.id));

  async function handleAdd() {
    if (!selected) return;
    setLoading(true);
    try {
      await onAdd(selected);
      setSelected("");
      setSearch("");
    } finally {
      setLoading(false);
    }
  }

  if (allWatched) {
    return (
      <p className="text-sm text-gray-500">
        You&apos;re watching all available topics.
      </p>
    );
  }

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 space-y-2">
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">Select a topic...</option>
          {available.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.description}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={!selected || loading}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Adding..." : "Add Topic"}
      </button>
    </div>
  );
}
