import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/modules/user-onboarding/ui/views/onboarding-wizard";
const OnboardingPage = async () => {
  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (!user) {
    console.warn("Vous n'êtes pas connecté");
    redirect("/sign-in");
  }

  const userId = user.userId;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard userId={userId} />
    </div>
  );
};

export default OnboardingPage;
