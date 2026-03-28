import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  try {
    // Check for existing Stripe customer ID
    const { data: prefs } = await supabaseServer
      .from("user_preferences")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .single();

    const session = await createCheckoutSession(
      userId,
      email,
      prefs?.stripe_customer_id || undefined
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
