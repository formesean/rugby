import { AccountNav } from "./_components/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10 flex flex-col gap-6 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, password, and active sessions.
        </p>
      </div>
      <AccountNav />
      {children}
    </div>
  );
}
