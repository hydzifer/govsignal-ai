import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendDailyDigest } from "@/lib/email/send";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const summary = { sent: 0, failed: 0, errors: [] as string[] };

  try {
    // Fetch users with digest enabled
    const { data: users, error: usersError } = await supabaseServer
      .from("user_preferences")
      .select("clerk_user_id, product_category")
      .eq("daily_digest_enabled", true);

    if (usersError || !users) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    for (const userPref of users) {
      try {
        // Get user info from Clerk
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(
          userPref.clerk_user_id
        );
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) continue;

        const firstName = clerkUser.firstName || "there";

        // Fetch articles relevant to user's product category
        const { data: articles } = await supabaseServer
          .from("articles")
          .select("*, sources(name)")
          .contains("product_categories", [userPref.product_category])
          .gte("published_at", since)
          .order("impact_level", { ascending: true })
          .order("published_at", { ascending: false })
          .limit(10);

        const normalized = (articles || []).map((a) => ({
          ...a,
          source_name:
            (a.sources as { name: string } | null)?.name || undefined,
          sources: undefined,
        }));

        if (normalized.length === 0) continue;

        // Get watchlist activity
        const { data: watchlists } = await supabaseServer
          .from("watchlists")
          .select("topic")
          .eq("clerk_user_id", userPref.clerk_user_id);

        const watchlistActivity: { topic: string; count: number }[] = [];

        if (watchlists) {
          for (const wl of watchlists) {
            const { count } = await supabaseServer
              .from("articles")
              .select("id", { count: "exact", head: true })
              .contains("topics", [wl.topic])
              .gte("published_at", since);

            if (count && count > 0) {
              watchlistActivity.push({ topic: wl.topic, count });
            }
          }
        }

        const success = await sendDailyDigest(
          {
            clerk_user_id: userPref.clerk_user_id,
            email,
            firstName,
            productCategory: userPref.product_category,
          },
          normalized,
          watchlistActivity
        );

        if (success) {
          summary.sent++;
        } else {
          summary.failed++;
          summary.errors.push(`Failed for ${email}`);
        }
      } catch (err) {
        summary.failed++;
        summary.errors.push(
          `Error for ${userPref.clerk_user_id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Digest send failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
