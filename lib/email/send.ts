import { Resend } from "resend";
import { getAppUrl, hasResendEnv, getRequiredEnv } from "@/lib/env";
import { Article } from "@/types/database";
import { renderDailyDigest } from "./templates/daily-digest";
import { renderWatchlistAlert } from "./templates/watchlist-alert";
import { generateUnsubscribeToken } from "./unsubscribe";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

const FROM_EMAIL = "GovSignal AI <digest@govsignal.ai>";
const APP_URL = getAppUrl();

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  retries = MAX_RETRIES
): Promise<boolean> {
  if (!hasResendEnv()) {
    console.error("[Email] RESEND_API_KEY is missing");
    return false;
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) throw new Error(error.message);
    return true;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return sendEmail(to, subject, html, retries - 1);
    }
    console.error(`[Email] Failed to send to ${to}:`, err);
    return false;
  }
}

export async function sendDailyDigest(
  user: {
    clerk_user_id: string;
    email: string;
    firstName: string;
    productCategory: string;
  },
  articles: (Article & { source_name?: string })[],
  watchlistActivity: { topic: string; count: number }[]
): Promise<boolean> {
  const unsubToken = generateUnsubscribeToken(user.clerk_user_id, "digest");

  const html = renderDailyDigest({
    firstName: user.firstName,
    productCategory: user.productCategory,
    articles,
    watchlistActivity,
    dashboardUrl: `${APP_URL}/dashboard`,
    preferencesUrl: `${APP_URL}/dashboard/settings`,
    unsubscribeUrl: `${APP_URL}/api/email/unsubscribe?token=${unsubToken}&type=digest`,
  });

  const articleCount = articles.length;
  const subject = `${articleCount} AI policy update${articleCount !== 1 ? "s" : ""} today - GovSignal AI`;

  return sendEmail(user.email, subject, html);
}

export async function sendWatchlistAlert(
  user: {
    clerk_user_id: string;
    email: string;
    firstName: string;
  },
  article: Article & { source_name?: string },
  topic: string
): Promise<boolean> {
  const unsubToken = generateUnsubscribeToken(user.clerk_user_id, "alerts");

  const html = renderWatchlistAlert({
    firstName: user.firstName,
    topic,
    article,
    dashboardUrl: `${APP_URL}/dashboard`,
    preferencesUrl: `${APP_URL}/dashboard/settings`,
    unsubscribeUrl: `${APP_URL}/api/email/unsubscribe?token=${unsubToken}&type=alerts`,
  });

  const topicLabel = topic.replace(/_/g, " ");
  const subject = `New update on ${topicLabel} - GovSignal AI`;

  return sendEmail(user.email, subject, html);
}
