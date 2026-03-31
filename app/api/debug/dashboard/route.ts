import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getUserPreference, hasActiveSubscription } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in", step: "auth" });
    }

    // Step 1: Raw query
    const { data: raw, error: rawError } = await supabaseServer
      .from("user_preferences")
      .select("*")
      .eq("clerk_user_id", userId)
      .limit(1);

    // Step 2: getUserPreference
    let prefResult = null;
    let prefError = null;
    try {
      prefResult = await getUserPreference(userId, ["subscription_status"]);
    } catch (e) {
      prefError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      userId,
      raw_query: { data: raw, error: rawError?.message || null },
      getUserPreference: prefResult || { error: prefError },
      hasActiveSubscription: hasActiveSubscription(prefResult?.data?.subscription_status),
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
}
