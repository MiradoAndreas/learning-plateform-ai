"use client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BellRing, Palette, Receipt, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navSettingsLinks = [
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/settings/profile",
  },
  {
    title: "Account",
    icon: Shield,
    href: "/dashboard/settings/account",
  },
  {
    title: "Billing",
    icon: Receipt,
    href: "/dashboard/settings/billing",
  },
  {
    title: "Appearance",
    icon: Palette,
    href: "/dashboard/settings/appearance",
  },
  {
    title: "Notification",
    icon: BellRing,
    href: "/dashboard/settings/notification",
  },
];

export const LinkSettingSection = () => {
  const pathname = usePathname();
  return (
    <section className="w-full lg:w-1/4">
      <Card className="w-full overflow-hidden p-2">
        <CardContent className="p-0">
          <div className="flex flex-col gap-y-1.5">
            {navSettingsLinks.map((navLink) => {
              const isActive = navLink.href === pathname;
              return (
                <Link
                  href={navLink.href}
                  key={navLink.title}
                  className={cn(
                    "flex items-center gap-x-2 rounded-xl p-2",
                    isActive && "bg-primary-foreground",
                  )}
                >
                  <navLink.icon className="size-4" />
                  <p>{navLink.title}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
