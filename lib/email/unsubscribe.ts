import { createHmac } from "crypto";

const SECRET = process.env.CLERK_SECRET_KEY || "govsignal-unsubscribe-secret";

export type EmailType = "digest" | "alerts";

export function generateUnsubscribeToken(
  userId: string,
  emailType: EmailType
): string {
  const payload = `${userId}:${emailType}`;
  const hmac = createHmac("sha256", SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64url");
  return token;
}

export function verifyUnsubscribeToken(
  token: string
): { userId: string; emailType: EmailType } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");

    if (parts.length !== 3) return null;

    const [userId, emailType, signature] = parts;

    if (emailType !== "digest" && emailType !== "alerts") return null;

    const expected = createHmac("sha256", SECRET)
      .update(`${userId}:${emailType}`)
      .digest("hex");

    if (signature !== expected) return null;

    return { userId, emailType: emailType as EmailType };
  } catch {
    return null;
  }
}
