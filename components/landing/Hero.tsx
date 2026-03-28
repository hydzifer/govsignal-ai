import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight sm:text-6xl">
          Track AI policy before it hits your business
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Monitor EU and US AI regulation, infrastructure moves, and policy
          shifts — with instant, role-specific briefings.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button href="/sign-up" size="lg">
            Start Free Trial
          </Button>
          <Button href="#features" variant="outline" size="lg">
            View Demo
          </Button>
        </div>

        {/* Dashboard mockup placeholder */}
        <div className="mt-16 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-500 ml-2">
              app.govsignal.ai/dashboard
            </span>
          </div>
          <div className="p-8 bg-gray-50 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-400">
                Dashboard Preview
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Screenshot coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
