import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendWatchlistAlert } from "@/lib/email/send";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const summary = { sent: 0, failed: 0, errors: [] as string[] };

  try {
    const { articleIds } = await request.json();

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: "articleIds required" },
        { status: 400 }
      );
    }

    // Fetch the articles
    const { data: articles } = await supabaseServer
      .from("articles")
      .select("*, sources(name)")
      .in("id", articleIds);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: "No articles found" }, { status: 404 });
    }

    for (const article of articles) {
      const normalized = {
        ...article,
        source_name:
          (article.sources as { name: string } | null)?.name || undefined,
        sources: undefined,
      };

      // For each topic on the article, find users watching it
      for (const topic of article.topics || []) {
        const { data: watchers } = await supabaseServer
          .from("watchlists")
          .select("clerk_user_id")
          .eq("topic", topic);

        if (!watchers || watchers.length === 0) continue;

        // Get users with alerts enabled
        const watcherIds = watchers.map((w) => w.clerk_user_id);

        const { data: enabledUsers } = await supabaseServer
          .from("user_preferences")
          .select("clerk_user_id")
          .in("clerk_user_id", watcherIds)
          .eq("watchlist_alerts_enabled", true);

        if (!enabledUsers) continue;

        for (const userPref of enabledUsers) {
          try {
            const clerkUser = await clerkClient.users.getUser(
              userPref.clerk_user_id
            );
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            if (!email) continue;

            const firstName = clerkUser.firstName || "there";

            const success = await sendWatchlistAlert(
              { clerk_user_id: userPref.clerk_user_id, email, firstName },
              normalized,
              topic
            );

            if (success) {
              summary.sent++;
            } else {
              summary.failed++;
            }
          } catch (err) {
            summary.failed++;
            summary.errors.push(
              `Alert failed for ${userPref.clerk_user_id}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Alert send failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
