import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ArticleCard from "@/components/ArticleCard";
import SubscriptionGate from "@/components/SubscriptionGate";
import Badge from "@/components/ui/Badge";
import { TOPICS } from "@/lib/constants/topics";

const ARTICLES_PER_PAGE = 20;

interface ArchivePageProps {
  searchParams: Promise<{
    page?: string;
    impact?: string;
    topic?: string;
  }>;
}

export default async function ArchivePage({ searchParams: searchParamsPromise }: ArchivePageProps) {
  const searchParams = await searchParamsPromise;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: prefs } = await supabaseServer
    .from("user_preferences")
    .select("subscription_status")
    .eq("clerk_user_id", userId)
    .single();

  if (!prefs) {
    redirect("/onboarding");
  }

  const isSubscribed =
    prefs.subscription_status === "active" ||
    prefs.subscription_status === "trial";

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const impactFilter = searchParams.impact || "";
  const topicFilter = searchParams.topic || "";

  // Older than 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let query = supabaseServer
    .from("articles")
    .select("*, sources(name)", { count: "exact" })
    .lt("published_at", since)
    .order("published_at", { ascending: false })
    .range((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE - 1);

  if (impactFilter && ["high", "medium", "low"].includes(impactFilter)) {
    query = query.eq("impact_level", impactFilter);
  }

  if (topicFilter) {
    query = query.contains("topics", [topicFilter]);
  }

  const { data: articles, count } = await query;

  const totalPages = Math.ceil((count || 0) / ARTICLES_PER_PAGE);

  const displayArticles = (articles || []).map((a) => ({
    ...a,
    source_name: (a.sources as { name: string } | null)?.name || undefined,
    sources: undefined,
  }));

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams();
    if (params.page && params.page !== "1") p.set("page", params.page);
    if (params.impact) p.set("impact", params.impact);
    if (params.topic) p.set("topic", params.topic);
    const qs = p.toString();
    return `/dashboard/archive${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse all past articles
          </p>
        </div>
        <Badge>{count || 0} articles</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Impact filter */}
        <div className="flex gap-1.5">
          {[
            { value: "", label: "All Impact" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ].map((opt) => (
            <a
              key={opt.value}
              href={buildUrl({
                page: "1",
                impact: opt.value,
                topic: topicFilter,
              })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                impactFilter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>

        {/* Topic filter */}
        <div className="flex gap-1.5 flex-wrap">
          <a
            href={buildUrl({ page: "1", impact: impactFilter, topic: "" })}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              !topicFilter
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Topics
          </a>
          {TOPICS.filter((t) => t.id !== "other").map((t) => (
            <a
              key={t.id}
              href={buildUrl({
                page: "1",
                impact: impactFilter,
                topic: t.id,
              })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                topicFilter === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Articles */}
      <SubscriptionGate
        featureName="Archive Access"
        isSubscribed={isSubscribed}
      >
        {displayArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({
                  page: String(page - 1),
                  impact: impactFilter,
                  topic: topicFilter,
                })}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </a>
            )}

            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <a
                href={buildUrl({
                  page: String(page + 1),
                  impact: impactFilter,
                  topic: topicFilter,
                })}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        )}
      </SubscriptionGate>
    </div>
  );
}
