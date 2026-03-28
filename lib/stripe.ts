import Stripe from "stripe";
import { SubscriptionStatus } from "@/types/database";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_govsignal_pro_monthly";

export async function createCheckoutSession(
  userId: string,
  email: string,
  customerId?: string
) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    metadata: { clerk_user_id: userId },
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_email = email;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings`,
  });

  return session.url;
}

export async function getSubscriptionStatus(
  customerId: string
): Promise<SubscriptionStatus> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });

  if (subscriptions.data.length === 0) return "expired";

  const sub = subscriptions.data[0];

  switch (sub.status) {
    case "active":
      return "active";
    case "trialing":
      return "trial";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "expired";
  }
}
