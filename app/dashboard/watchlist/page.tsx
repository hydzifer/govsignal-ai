"use client";

import { useState, useEffect, useCallback } from "react";
import { TOPICS } from "@/lib/constants/topics";
import ArticleCard from "@/components/ArticleCard";
import AddTopicDropdown from "@/components/AddTopicDropdown";
import { Article } from "@/types/database";

interface WatchlistEntry {
  id: string;
  topic: string;
  created_at: string;
}

interface TopicSection {
  topic: string;
  label: string;
  articles: (Article & { source_name?: string })[];
  limited: boolean;
}

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<WatchlistEntry[]>([]);
  const [sections, setSections] = useState<TopicSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch watchlists
      const wlRes = await fetch("/api/watchlist");
      if (!wlRes.ok) throw new Error("Failed to fetch watchlists");
      const wlData: WatchlistEntry[] = await wlRes.json();
      setWatchlists(wlData);

      // Fetch articles for each topic
      const topicSections: TopicSection[] = [];
      for (const wl of wlData) {
        const label =
          TOPICS.find((t) => t.id === wl.topic)?.label || wl.topic;

        const res = await fetch(
          `/api/watchlist/articles?topic=${encodeURIComponent(wl.topic)}`
        );
        const data = res.ok
          ? await res.json()
          : { articles: [], limited: false };

        topicSections.push({
          topic: wl.topic,
          label,
          articles: data.articles || [],
          limited: data.limited || false,
        });
      }
      setSections(topicSections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddTopic(topic: string) {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to add topic");
    }

    await fetchData();
  }

  async function handleRemoveTopic(topic: string) {
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });

    if (res.ok) {
      await fetchData();
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Watchlist</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track specific topics and see relevant articles.
        </p>
      </div>

      {/* Add Topic Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Add Topic to Watchlist
        </h2>
        <AddTopicDropdown
          watchedTopics={watchlists.map((w) => w.topic)}
          onAdd={handleAddTopic}
        />
      </div>

      {/* Watchlist Sections */}
      {sections.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            You&apos;re not watching any topics yet.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Add a topic above to start tracking regulatory updates.
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.topic} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.label}
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5 font-medium">
                  {section.articles.length} new this week
                </span>
              </div>
              <button
                onClick={() => handleRemoveTopic(section.topic)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>

            {section.articles.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">
                No articles for this topic in the last 7 days.
              </p>
            ) : (
              <div className="space-y-3">
                {section.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
                {section.limited && (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600">
                      Upgrade to Pro to see all articles for this topic.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
