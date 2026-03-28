"use client";

import UpgradeButton from "@/components/UpgradeButton";

interface SubscriptionGateProps {
  children: React.ReactNode;
  featureName: string;
  isSubscribed: boolean;
}

export default function SubscriptionGate({
  children,
  featureName,
  isSubscribed,
}: SubscriptionGateProps) {
  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-gray-900">
        Unlock {featureName}
      </h3>
      <p className="text-sm text-gray-500 mt-2 mb-4">
        Upgrade to Pro to access {featureName.toLowerCase()} and all premium
        features. 14-day free trial included.
      </p>
      <UpgradeButton />
    </div>
  );
}
