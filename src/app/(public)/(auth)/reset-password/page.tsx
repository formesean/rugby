import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8 md:py-12">
      <Suspense fallback={<AuthFormSkeleton fields={2} className="w-full max-w-md md:max-w-5xl" />}>
        <ResetPasswordForm className="w-full max-w-md md:max-w-5xl" />
      </Suspense>
    </div>
  );
}
