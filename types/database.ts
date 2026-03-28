export type SubscriptionStatus = "trial" | "active" | "canceled" | "expired";

export interface UserPreference {
  id: string;
  clerk_user_id: string;
  product_category: string;
  daily_digest_enabled: boolean;
  watchlist_alerts_enabled: boolean;
  stripe_customer_id?: string;
  subscription_status?: SubscriptionStatus;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  source_type: "rss" | "api" | "manual";
  active: boolean;
  last_fetched: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  source_id: string | null;
  title: string;
  url: string;
  published_at: string;
  raw_content: string | null;
  topics: string[];
  product_categories: string[];
  impact_level: "high" | "medium" | "low" | null;
  impact_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  clerk_user_id: string;
  topic: string;
  created_at: string;
}

export interface Digest {
  id: string;
  digest_date: string;
  article_ids: string[];
  created_at: string;
}

export interface UserDigestView {
  id: string;
  clerk_user_id: string;
  digest_id: string;
  viewed_at: string;
}

export interface Classification {
  topics: string[];
  product_categories: string[];
  impact_level: "high" | "medium" | "low";
  reasoning: string;
}
