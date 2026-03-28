"use client";

import { useState, useEffect } from "react";
import { Article } from "@/types/database";

interface WatchlistButtonProps {
  article: Article;
}

export default function WatchlistButton({ article }: WatchlistButtonProps) {
  const [watchedTopics, setWatchedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWatchedTopics(data.map((w: { topic: string }) => w.topic));
        }
      })
      .catch(() => {});
  }, []);

  const articleTopics = article.topics || [];
  const isWatching = articleTopics.some((t) => watchedTopics.includes(t));
  const firstUnwatched = articleTopics.find((t) => !watchedTopics.includes(t));

  async function handleWatch() {
    if (!firstUnwatched) return;
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: firstUnwatched }),
      });

      if (res.ok) {
        setWatchedTopics((prev) => [...prev, firstUnwatched]);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (articleTopics.length === 0) return null;

  if (isWatching && !firstUnwatched) {
    return (
      <span className="text-xs px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200">
        Watching
      </span>
    );
  }

  return (
    <button
      onClick={handleWatch}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
    >
      {loading
        ? "Adding..."
        : status === "success"
          ? "Added!"
          : status === "error"
            ? "Failed"
            : `Watch ${firstUnwatched?.replace(/_/g, " ")}`}
    </button>
  );
}
