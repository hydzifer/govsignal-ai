import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase-server";
import type { SubscriptionStatus, UserPreference } from "@/types/database";

const REQUIRED_USER_PREFERENCE_COLUMNS = [
  "id",
  "clerk_user_id",
  "product_category",
  "daily_digest_enabled",
  "watchlist_alerts_enabled",
  "created_at",
  "updated_at",
] as const;

type OptionalUserPreferenceColumn =
  | "subscription_status"
  | "stripe_customer_id"
  | "trial_ends_at";

type UserPreferenceRecord = Pick<
  UserPreference,
  | "id"
  | "clerk_user_id"
  | "product_category"
  | "daily_digest_enabled"
  | "watchlist_alerts_enabled"
  | "created_at"
  | "updated_at"
> &
  Partial<
    Pick<
      UserPreference,
      "subscription_status" | "stripe_customer_id" | "trial_ends_at"
    >
  >;

interface UserPreferenceResult {
  data: UserPreferenceRecord | null;
  error: string | null;
  missingOptionalColumns: OptionalUserPreferenceColumn[];
}

function getMissingOptionalColumns(
  error: PostgrestError | null,
  optionalColumns: OptionalUserPreferenceColumn[]
) {
  const errorText = `${error?.message || ""} ${error?.details || ""} ${
    error?.hint || ""
  }`.toLowerCase();

  return optionalColumns.filter((column) =>
    errorText.includes(column.toLowerCase())
  );
}

async function selectFirstUserPreference(
  userId: string,
  optionalColumns: OptionalUserPreferenceColumn[]
) {
  const columns = [
    ...REQUIRED_USER_PREFERENCE_COLUMNS,
    ...optionalColumns,
  ].join(", ");

  const { data, error } = await supabaseServer
    .from("user_preferences")
    .select(columns)
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);

  return {
    data: (data?.[0] as UserPreferenceRecord | undefined) ?? null,
    error,
  };
}

export async function getUserPreference(
  userId: string,
  optionalColumns: OptionalUserPreferenceColumn[] = []
): Promise<UserPreferenceResult> {
  const initialResult = await selectFirstUserPreference(userId, optionalColumns);

  if (!initialResult.error) {
    return {
      data: initialResult.data,
      error: null,
      missingOptionalColumns: [],
    };
  }

  const missingOptionalColumns = getMissingOptionalColumns(
    initialResult.error,
    optionalColumns
  );

  if (missingOptionalColumns.length === 0) {
    console.error("[user_preferences] Failed to load preferences", {
      userId,
      error: initialResult.error.message,
    });

    return {
      data: null,
      error: initialResult.error.message,
      missingOptionalColumns: [],
    };
  }

  console.warn("[user_preferences] Optional columns missing, retrying", {
    userId,
    missingOptionalColumns,
  });

  const retryColumns = optionalColumns.filter(
    (column) => !missingOptionalColumns.includes(column)
  );

  const retryResult = await selectFirstUserPreference(userId, retryColumns);

  if (retryResult.error) {
    console.error("[user_preferences] Retry failed", {
      userId,
      error: retryResult.error.message,
    });

    return {
      data: null,
      error: retryResult.error.message,
      missingOptionalColumns,
    };
  }

  return {
    data: retryResult.data,
    error: null,
    missingOptionalColumns,
  };
}

export function hasActiveSubscription(status?: SubscriptionStatus | null) {
  return status === "active" || status === "trial";
}
