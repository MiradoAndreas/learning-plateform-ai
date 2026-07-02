import { api } from "../../../convex/_generated/api";

import { Header } from "@/components/user-profile";

import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const Page = async () => {
  const hasToken = await isAuthenticated();
  if (!hasToken) {
    redirect("/sign-in");
  }
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <div className="min-h-screen w-full space-y-8 p-4">
      <Header preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
};

export default Page;
