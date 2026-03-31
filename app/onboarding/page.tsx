import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPreference } from "@/lib/user-preferences";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { data: existing, error } = await getUserPreference(userId);

  if (error) {
    throw new Error("Failed to load onboarding state");
  }

  if (existing) {
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
