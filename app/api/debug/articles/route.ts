import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: all, count: totalCount } = await supabaseServer
    .from("articles")
    .select("id, title, impact_level, published_at", { count: "exact" })
    .order("published_at", { ascending: false })
    .limit(20);

  const { count: unclassifiedCount } = await supabaseServer
    .from("articles")
    .select("id", { count: "exact", head: true })
    .is("impact_level", null);

  return NextResponse.json({
    total_articles: totalCount,
    unclassified: unclassifiedCount,
    recent: (all || []).map((a) => ({
      id: a.id,
      title: a.title,
      impact_level: a.impact_level,
      published_at: a.published_at,
    })),
  });
}
