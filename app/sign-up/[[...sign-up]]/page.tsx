import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { hasClerkEnv } from "@/lib/env";

export default function SignUpPage() {
  if (!hasClerkEnv()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp fallbackRedirectUrl="/onboarding" signInUrl="/sign-in" />
    </div>
  );
}
