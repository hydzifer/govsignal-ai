import { Article } from "@/types/database";

interface AlertData {
  firstName: string;
  topic: string;
  article: Article & { source_name?: string };
  dashboardUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function renderWatchlistAlert(data: AlertData): string {
  const { article, topic } = data;

  const impactColor: Record<string, string> = {
    high: "#dc2626",
    medium: "#d97706",
    low: "#6b7280",
  };

  const borderColor = article.impact_level === "high" ? "#dc2626" : "#2563eb";

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
              <p style="margin: 4px 0 0; color: #fbbf24; font-size: 13px; font-weight: 600;">Watchlist Alert</p>
            </td>
          </tr>
          <!-- Alert Box -->
          <tr>
            <td style="padding: 32px;">
              <div style="border-left: 4px solid ${borderColor}; padding: 16px; background: #eff6ff; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">
                  New article on <strong>${topic.replace(/_/g, " ")}</strong> you&rsquo;re watching
                </p>
              </div>

              <p style="margin: 0 0 16px; font-size: 15px; color: #374151;">Hi ${data.firstName},</p>

              <!-- Article -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <a href="${article.url}" style="color: #1d4ed8; font-size: 18px; font-weight: 600; text-decoration: none; line-height: 1.4;">
                      ${article.title}
                    </a>
                    <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">
                      ${article.source_name || "Unknown"} &middot; ${new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      ${article.impact_level ? ` &middot; <span style="color: ${impactColor[article.impact_level] || "#6b7280"}; font-weight: 600;">${article.impact_level.toUpperCase()}</span>` : ""}
                    </div>
                    ${article.impact_note ? `<div style="margin-top: 16px; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${article.impact_note}</div>` : ""}
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #2563eb; border-radius: 8px;">
                    <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">
                      View in dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                <a href="${data.preferencesUrl}" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>
                &nbsp;&middot;&nbsp;
                <a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from alerts</a>
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
