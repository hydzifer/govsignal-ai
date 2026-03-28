import Button from "@/components/ui/Button";

interface PricingCardProps {
  highlighted?: boolean;
}

const features = [
  "Unlimited articles & briefings",
  "Daily digest emails",
  "Watchlist alerts",
  "AI impact analysis",
  "Export tools (Markdown, PDF)",
  "Priority support",
];

export default function PricingCard({ highlighted = true }: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl p-8 max-w-md mx-auto ${
        highlighted
          ? "border-2 border-blue-600 bg-white shadow-xl"
          : "border border-gray-200 bg-white"
      }`}
    >
      {highlighted && (
        <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 mb-4">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">$20</span>
        <span className="text-gray-500">/month</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">14-day free trial included</p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
            <svg
              className="h-5 w-5 shrink-0 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button href="/sign-up" size="lg" className="w-full">
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}
