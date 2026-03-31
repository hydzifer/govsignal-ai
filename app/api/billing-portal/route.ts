import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserPreference } from "@/lib/user-preferences";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: prefs, error } = await getUserPreference(userId, [
      "stripe_customer_id",
    ]);

    if (error) {
      throw new Error(error);
    }

    if (!prefs?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const url = await createCustomerPortalSession(prefs.stripe_customer_id);
    return NextResponse.json({ url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Portal failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
