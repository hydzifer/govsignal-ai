import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getRequiredEnv } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getRequiredEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[Stripe Webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerk_user_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (clerkUserId && customerId) {
          await supabaseServer
            .from("user_preferences")
            .update({
              stripe_customer_id: customerId,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_user_id", clerkUserId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        let status: string;
        switch (subscription.status) {
          case "active":
            status = "active";
            break;
          case "trialing":
            status = "trial";
            break;
          case "canceled":
          case "unpaid":
            status = "canceled";
            break;
          default:
            status = "expired";
        }

        await supabaseServer
          .from("user_preferences")
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await supabaseServer
          .from("user_preferences")
          .update({
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error);
  }

  return NextResponse.json({ received: true });
}
