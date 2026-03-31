import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserPreference } from "@/lib/user-preferences";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  try {
    // Check for existing Stripe customer ID
    const { data: prefs, error } = await getUserPreference(userId, [
      "stripe_customer_id",
    ]);

    if (error) {
      throw new Error(error);
    }

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
