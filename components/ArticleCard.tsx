"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Article } from "@/types/database";
import Badge from "@/components/ui/Badge";
import WatchlistButton from "@/components/WatchlistButton";
import { formatRelativeTime } from "@/lib/utils/date";

interface ArticleCardProps {
  article: Article & { source_name?: string };
}

const impactVariant: Record<string, "high" | "medium" | "low"> = {
  high: "high",
  medium: "medium",
  low: "low",
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    const text = `# ${article.title}\n\n${article.impact_note || "No analysis available."}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {article.title}
          </a>

          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            {article.source_name && <span>{article.source_name}</span>}
            {article.source_name && <span>&middot;</span>}
            <span>{formatRelativeTime(article.published_at)}</span>
          </div>
        </div>

        {article.impact_level && (
          <Badge variant={impactVariant[article.impact_level]}>
            {article.impact_level.toUpperCase()}
          </Badge>
        )}
      </div>

      {article.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.topics.map((topic) => (
            <Badge key={topic}>{topic.replace(/_/g, " ")}</Badge>
          ))}
        </div>
      )}

      {article.impact_note && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {expanded ? "Hide analysis" : "Show analysis"}
          </button>

          {expanded && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4 prose prose-sm max-w-none">
              <ReactMarkdown>{article.impact_note}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <WatchlistButton article={article} />
        <button
          onClick={copyToClipboard}
          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {copied ? "Copied!" : "Export"}
        </button>
      </div>
    </div>
  );
}
