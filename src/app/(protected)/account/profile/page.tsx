import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ProfileSection } from "../_components/profile-section";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <ProfileSection
      name={session.user.name}
      email={session.user.email}
      emailVerified={session.user.emailVerified}
    />
  );
}
