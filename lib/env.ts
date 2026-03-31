function getEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function hasClerkEnv(): boolean {
  return Boolean(
    getEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") &&
      getEnv("CLERK_SECRET_KEY")
  );
}

export function hasAnthropicEnv(): boolean {
  return Boolean(getEnv("ANTHROPIC_API_KEY"));
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    getEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      (getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
        getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
  );
}

export function hasStripeEnv(): boolean {
  return Boolean(getEnv("STRIPE_SECRET_KEY"));
}

export function hasResendEnv(): boolean {
  return Boolean(getEnv("RESEND_API_KEY"));
}

export function getRequiredEnv(name: string): string {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

function withProtocol(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export function getAppUrl(): string {
  const url =
    getEnv("NEXT_PUBLIC_APP_URL") ||
    getEnv("VERCEL_PROJECT_PRODUCTION_URL") ||
    getEnv("VERCEL_URL");

  return url ? withProtocol(url) : "http://localhost:3000";
}
