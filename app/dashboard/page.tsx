import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { formatFullDate } from "@/lib/utils/date";
import ArticleCard from "@/components/ArticleCard";
import SubscriptionGate from "@/components/SubscriptionGate";
import DashboardFilters from "@/components/DashboardFilters";
import Badge from "@/components/ui/Badge";

const FREE_ARTICLE_LIMIT = 5;

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user preferences
  const { data: prefs } = await supabaseServer
    .from("user_preferences")
    .select("product_category, subscription_status")
    .eq("clerk_user_id", userId)
    .single();

  if (!prefs) {
    redirect("/onboarding");
  }

  const isSubscribed =
    prefs.subscription_status === "active" ||
    prefs.subscription_status === "trial";

  // Fetch articles from last 24 hours with source name
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: articles } = await supabaseServer
    .from("articles")
    .select("*, sources(name)")
    .gte("published_at", since)
    .order("impact_level", { ascending: true })
    .order("published_at", { ascending: false });

  // Normalize and sort: high > medium > low > null
  const impactOrder: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const sortedArticles = (articles || [])
    .map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name || undefined,
      sources: undefined,
    }))
    .sort((a, b) => {
      const aOrder = a.impact_level ? impactOrder[a.impact_level] ?? 3 : 3;
      const bOrder = b.impact_level ? impactOrder[b.impact_level] ?? 3 : 3;
      return aOrder - bOrder;
    });

  // Separate: user's category first, then others
  const userCategory = prefs.product_category;
  const relevant = sortedArticles.filter((a) =>
    a.product_categories?.includes(userCategory)
  );
  const other = sortedArticles.filter(
    (a) => !a.product_categories?.includes(userCategory)
  );
  const displayArticles = [...relevant, ...other];

  const today = formatFullDate(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Today&apos;s Digest
          </h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
        <Badge>
          {displayArticles.length}{" "}
          {displayArticles.length === 1 ? "article" : "articles"}
        </Badge>
      </div>

      {displayArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No articles today yet.</p>
          <p className="text-gray-400 text-sm mt-2">
            New articles are fetched periodically. Check back later.
          </p>
        </div>
      ) : (
        <DashboardFilters articles={displayArticles}>
          {(filtered) => {
            const free = filtered.slice(0, FREE_ARTICLE_LIMIT);
            const premium = filtered.slice(FREE_ARTICLE_LIMIT);
            return (
              <div className="space-y-4">
                {free.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}

                {premium.length > 0 && (
                  <SubscriptionGate
                    featureName={`${premium.length} More Articles`}
                    isSubscribed={isSubscribed}
                  >
                    {premium.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </SubscriptionGate>
                )}
              </div>
            );
          }}
        </DashboardFilters>
      )}
    </div>
  );
}
