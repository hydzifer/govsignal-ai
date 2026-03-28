import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const FREE_LIMIT = 3;
const PAID_LIMIT = 20;

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = request.nextUrl.searchParams.get("topic");

  if (!topic) {
    return NextResponse.json({ error: "Topic required" }, { status: 400 });
  }

  // Check subscription status
  const { data: prefs } = await supabaseServer
    .from("user_preferences")
    .select("subscription_status")
    .eq("clerk_user_id", userId)
    .single();

  const isSubscribed =
    prefs?.subscription_status === "active" ||
    prefs?.subscription_status === "trial";

  const limit = isSubscribed ? PAID_LIMIT : FREE_LIMIT;

  const since = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseServer
    .from("articles")
    .select("*, sources(name)")
    .contains("topics", [topic])
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const articles = (data || []).map((a) => ({
    ...a,
    source_name: (a.sources as { name: string } | null)?.name || undefined,
    sources: undefined,
  }));

  return NextResponse.json({ articles, limited: !isSubscribed });
}
