import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const type = request.nextUrl.searchParams.get("type");

  if (!token || !type) {
    return new NextResponse(renderPage("Invalid Link", "The unsubscribe link is invalid or expired."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const result = verifyUnsubscribeToken(token);

  if (!result) {
    return new NextResponse(renderPage("Invalid Link", "The unsubscribe link is invalid or expired."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const updateField =
    result.emailType === "digest"
      ? "daily_digest_enabled"
      : "watchlist_alerts_enabled";

  const { error } = await supabaseServer
    .from("user_preferences")
    .update({
      [updateField]: false,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", result.userId);

  if (error) {
    return new NextResponse(renderPage("Error", "Something went wrong. Please try again."), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }

  const label = result.emailType === "digest" ? "daily digest" : "watchlist alerts";

  return new NextResponse(
    renderPage(
      "Unsubscribed",
      `You&rsquo;ve been unsubscribed from ${label} emails. You can re-enable them anytime from your settings.`
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function renderPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} — GovSignal AI</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
  <div style="text-align: center; max-width: 400px; padding: 32px;">
    <h1 style="font-size: 24px; color: #111827; margin-bottom: 12px;">${title}</h1>
    <p style="font-size: 15px; color: #6b7280; line-height: 1.5;">${message}</p>
    <a href="/" style="display: inline-block; margin-top: 24px; color: #2563eb; font-size: 14px; text-decoration: none;">Back to GovSignal AI</a>
  </div>
</body>
</html>`;
}
