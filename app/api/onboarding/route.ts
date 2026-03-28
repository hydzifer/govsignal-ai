import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const VALID_CATEGORIES = [
  "llm_api",
  "computer_vision",
  "chatbot",
  "rag_system",
  "agent_platform",
  "data_analytics",
  "other",
];

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { product_category } = body;

    if (!product_category || !VALID_CATEGORIES.includes(product_category)) {
      return NextResponse.json(
        { error: "Invalid product category" },
        { status: 400 }
      );
    }

    // Check if user already has preferences
    const { data: existing } = await supabaseServer
      .from("user_preferences")
      .select("id")
      .eq("clerk_user_id", userId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing
      const { error } = await supabaseServer
        .from("user_preferences")
        .update({
          product_category,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to update preferences" },
          { status: 500 }
        );
      }
    } else {
      // Insert new
      const { error } = await supabaseServer
        .from("user_preferences")
        .insert({
          clerk_user_id: userId,
          product_category,
          daily_digest_enabled: true,
          watchlist_alerts_enabled: true,
        });

      if (error) {
        return NextResponse.json(
          { error: "Failed to save preferences" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
