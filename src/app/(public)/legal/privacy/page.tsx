import { formatDateLong } from "@/lib/date";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {formatDateLong(new Date())}
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8 text-center">
          <p className="font-medium text-foreground">This is a placeholder page.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Replace this content with your actual Privacy Policy before going live.
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none flex flex-col gap-6 text-muted-foreground">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed">
              We collect information you provide directly, such as your name and email address when
              you create an account, as well as usage data and technical information about your
              device.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="text-sm leading-relaxed">
              We use your information to provide and improve the service, communicate with you, and
              ensure the security of your account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">3. Data Sharing</h2>
            <p className="text-sm leading-relaxed">
              We do not sell your personal information. We may share data with third-party service
              providers who assist in operating the service, subject to confidentiality obligations.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">4. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your information for as long as your account is active or as needed to
              provide the service. You may request deletion of your account at any time.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at your support
              email address.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
