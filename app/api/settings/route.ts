import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserPreference } from "@/lib/user-preferences";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getUserPreference(userId);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Preferences not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = [
    "product_category",
    "daily_digest_enabled",
    "watchlist_alerts_enabled",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await supabaseServer
    .from("user_preferences")
    .update(updates)
    .eq("clerk_user_id", userId)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data, error: fetchError } = await getUserPreference(userId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Preferences not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
