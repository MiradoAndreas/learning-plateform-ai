import { preloadAuthQuery } from "@/lib/auth-server";
import { ProfileView } from "@/modules/account-settings/ui/views/profile-view";
import { api } from "../../../../../convex/_generated/api";

const Page = async () => {
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <div className="w-full lg:w-[671px]">
      <ProfileView preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
};

export default Page;
