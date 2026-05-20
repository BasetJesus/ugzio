import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import StoreSetupWizard from "./StoreSetupWizard";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return <StoreSetupWizard />;
}
