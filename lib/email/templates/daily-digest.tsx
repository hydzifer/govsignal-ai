import { Article } from "@/types/database";

interface DigestData {
  firstName: string;
  productCategory: string;
  articles: (Article & { source_name?: string })[];
  watchlistActivity: { topic: string; count: number }[];
  dashboardUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function renderDailyDigest(data: DigestData): string {
  const truncate = (text: string, sentences: number) => {
    const parts = text.split(/[.!?]\s/);
    return parts.slice(0, sentences).join(". ") + (parts.length > sentences ? "." : "");
  };

  const impactColor: Record<string, string> = {
    high: "#dc2626",
    medium: "#d97706",
    low: "#6b7280",
  };

  const articleRows = data.articles
    .slice(0, 10)
    .map(
      (a) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <a href="${a.url}" style="color: #1d4ed8; font-size: 16px; font-weight: 600; text-decoration: none;">
            ${a.title}
          </a>
          <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
            ${a.source_name || "Unknown source"} &middot; ${new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            ${a.impact_level ? ` &middot; <span style="color: ${impactColor[a.impact_level] || "#6b7280"}; font-weight: 600;">${a.impact_level.toUpperCase()}</span>` : ""}
          </div>
          ${a.topics.length > 0 ? `<div style="margin-top: 6px;">${a.topics.map((t) => `<span style="display: inline-block; background: #f3f4f6; color: #374151; font-size: 11px; padding: 2px 8px; border-radius: 12px; margin-right: 4px;">${t.replace(/_/g, " ")}</span>`).join("")}</div>` : ""}
          ${a.impact_note ? `<div style="margin-top: 8px; font-size: 14px; color: #4b5563; line-height: 1.5;">${truncate(a.impact_note, 2)}</div>` : ""}
          <div style="margin-top: 8px;">
            <a href="${data.dashboardUrl}" style="color: #2563eb; font-size: 13px; text-decoration: none;">Read full analysis &rarr;</a>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const watchlistSection =
    data.watchlistActivity.length > 0
      ? `
      <tr>
        <td style="padding: 24px 0 8px;">
          <h2 style="margin: 0; font-size: 18px; color: #111827;">Your Watchlist Activity</h2>
        </td>
      </tr>
      ${data.watchlistActivity.map((w) => `<tr><td style="padding: 4px 0; font-size: 14px; color: #4b5563;">&bull; <strong>${w.topic.replace(/_/g, " ")}</strong> &mdash; ${w.count} new article${w.count !== 1 ? "s" : ""} this week</td></tr>`).join("")}`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background: #1e3a5f; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">GovSignal AI</h1>
              <p style="margin: 4px 0 0; color: #93c5fd; font-size: 13px;">Daily Policy Digest</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #374151;">Hi ${data.firstName},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.5;">
                Here&rsquo;s what changed in AI policy over the last 24 hours relevant to <strong>${data.productCategory}</strong>:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleRows}
                ${watchlistSection}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                <a href="${data.preferencesUrl}" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>
                &nbsp;&middot;&nbsp;
                <a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from daily digest</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #d1d5db; text-align: center;">
                GovSignal AI &mdash; AI Policy Monitoring
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
