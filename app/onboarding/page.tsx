import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user already has preferences set
  const { data: existing } = await supabaseServer
    .from("user_preferences")
    .select("id")
    .eq("clerk_user_id", userId)
    .limit(1);

  if (existing && existing.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            What best describes your AI product?
          </h1>
          <p className="mt-2 text-gray-600">
            We&apos;ll tailor your regulatory briefings to your product category.
          </p>
        </div>
        <div className="flex justify-center">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
