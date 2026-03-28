import Link from "next/link";
import PricingCard from "@/components/landing/PricingCard";
import Button from "@/components/ui/Button";

const billingFaqs = [
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. All payments are processed securely.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your Settings page at any time. You'll retain access until the end of your current billing period.",
  },
  {
    q: "What happens after the 14-day trial?",
    a: "You'll be automatically charged $20/month unless you cancel before the trial ends. We'll send a reminder 3 days before.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Not yet, but annual plans with a discount are coming soon. Sign up for monthly now and we'll migrate you when it's available.",
  },
  {
    q: "Can I get a refund?",
    a: "If you're not satisfied within the first 30 days of your paid subscription, contact us for a full refund.",
  },
  {
    q: "Do you offer team pricing?",
    a: "Team plans are coming soon. For now, each user needs their own Pro subscription. Contact us for volume discounts.",
  },
];

const comparisonFeatures = [
  { feature: "Daily digest emails", free: false, pro: true },
  { feature: "Articles per day", free: "5", pro: "Unlimited" },
  { feature: "AI impact analysis", free: false, pro: true },
  { feature: "Watchlist topics", free: "1", pro: "Unlimited" },
  { feature: "Export tools", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
  { feature: "API access", free: false, pro: "Coming soon" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            GovSignal AI
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Button href="/sign-up" size="sm">
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          One plan. Everything included. 14-day free trial.
        </p>
      </section>

      {/* Pricing Card */}
      <section className="pb-20 px-4">
        <PricingCard />
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Feature comparison
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                    Feature
                  </th>
                  <th className="text-center text-sm font-medium text-gray-500 px-6 py-3">
                    Free
                  </th>
                  <th className="text-center text-sm font-medium text-gray-500 px-6 py-3">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="text-sm text-gray-900 px-6 py-3">
                      {row.feature}
                    </td>
                    <td className="text-center text-sm px-6 py-3">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <span className="text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-gray-300">&#10005;</span>
                        )
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center text-sm px-6 py-3">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <span className="text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-gray-300">&#10005;</span>
                        )
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {row.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Billing questions
          </h2>
          <div className="space-y-4">
            {billingFaqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            GovSignal AI
          </Link>
          <div className="flex gap-6">
            <Link
              href="/sign-in"
              className="hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
