"use client";

import { useState } from "react";
import { Article } from "@/types/database";
import { TOPICS } from "@/lib/constants/topics";

interface DashboardFiltersProps {
  children: (filtered: (Article & { source_name?: string })[]) => React.ReactNode;
  articles: (Article & { source_name?: string })[];
}

export default function DashboardFilters({
  children,
  articles,
}: DashboardFiltersProps) {
  const [search, setSearch] = useState("");
  const [impactFilter, setImpactFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");

  const filtered = articles.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      const matchesTitle = a.title.toLowerCase().includes(q);
      const matchesSource = a.source_name?.toLowerCase().includes(q);
      const matchesNote = a.impact_note?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesSource && !matchesNote) return false;
    }

    if (impactFilter && a.impact_level !== impactFilter) return false;

    if (topicFilter && !a.topics?.includes(topicFilter)) return false;

    return true;
  });

  const activeTopicIds = [...new Set(articles.flatMap((a) => a.topics || []))];
  const activeTopics = TOPICS.filter((t) => activeTopicIds.includes(t.id));

  const hasFilters = search || impactFilter || topicFilter;

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1.5">
          {[
            { value: "", label: "All" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setImpactFilter(impactFilter === opt.value ? "" : opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                impactFilter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeTopics.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {activeTopics.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopicFilter(topicFilter === t.id ? "" : t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  topicFilter === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setImpactFilter("");
              setTopicFilter("");
            }}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count when filtering */}
      {hasFilters && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} of {articles.length} articles
        </p>
      )}

      {children(filtered)}
    </div>
  );
}
