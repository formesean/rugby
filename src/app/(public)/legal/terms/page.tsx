import { formatDateLong } from "@/lib/date";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {formatDateLong(new Date())}
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-6 py-8 text-center">
          <p className="font-medium text-foreground">This is a placeholder page.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Replace this content with your actual Terms of Service before going live.
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none flex flex-col gap-6 text-muted-foreground">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using this service, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">2. Use of the Service</h2>
            <p className="text-sm leading-relaxed">
              You agree to use the service only for lawful purposes and in a manner that does not
              infringe the rights of others or restrict their use of the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">3. Accounts</h2>
            <p className="text-sm leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">4. Termination</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to suspend or terminate your access to the service at our
              discretion, without notice, for conduct that we believe violates these Terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">5. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We may update these Terms from time to time. Continued use of the service after
              changes constitutes acceptance of the new Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
