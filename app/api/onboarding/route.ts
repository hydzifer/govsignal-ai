import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserPreference } from "@/lib/user-preferences";

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
  const { userId } = await auth();

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

    const { data: existing, error: existingError } = await getUserPreference(
      userId
    );

    if (existingError) {
      console.error("[api/onboarding] Failed to load preferences", {
        userId,
        error: existingError,
      });

      return NextResponse.json(
        { error: "Failed to load existing preferences" },
        { status: 500 }
      );
    }

    if (existing) {
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

      if (error?.code === "23505") {
        const { error: updateError } = await supabaseServer
          .from("user_preferences")
          .update({
            product_category,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", userId);

        if (!updateError) {
          return NextResponse.json({ success: true });
        }

        return NextResponse.json(
          { error: "Failed to update preferences" },
          { status: 500 }
        );
      }

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
