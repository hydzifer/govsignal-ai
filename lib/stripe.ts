import Stripe from "stripe";
import { getAppUrl, getRequiredEnv } from "@/lib/env";
import { SubscriptionStatus } from "@/types/database";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, property) {
    const client = getStripeClient();
    const value = client[property as keyof Stripe];

    return typeof value === "function" ? value.bind(client) : value;
  },
});

const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_govsignal_pro_monthly";
const APP_URL = getAppUrl();

export async function createCheckoutSession(
  userId: string,
  email: string,
  customerId?: string
) {
  const stripe = getStripeClient();
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${APP_URL}/pricing`,
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
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard/settings`,
  });

  return session.url;
}

export async function getSubscriptionStatus(
  customerId: string
): Promise<SubscriptionStatus> {
  const stripe = getStripeClient();
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
