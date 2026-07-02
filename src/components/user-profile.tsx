"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { Preloaded } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

export const UserProfile = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  return (
    <div className="flex items-center space-x-2">
      {user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-medium text-orange-600 dark:bg-orange-900 dark:text-orange-200">
          {user?.name?.[0].toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-medium">{user?.name}</h1>
        <p className="text-sm text-neutral-500">{user?.email}</p>
      </div>
    </div>
  );
};

export const Header = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) => {
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await authClient.revokeSessions();
          router.push("/sign-in");
        },
      },
    });
  };
  return (
    <header className="mx-auto flex max-w-2xl items-center justify-between">
      <UserProfile preloadedUserQuery={preloadedUserQuery} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings">
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </div>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut size={16} className="mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  );
};
