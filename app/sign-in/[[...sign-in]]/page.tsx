import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { hasClerkEnv } from "@/lib/env";

export default function SignInPage() {
  if (!hasClerkEnv()) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
