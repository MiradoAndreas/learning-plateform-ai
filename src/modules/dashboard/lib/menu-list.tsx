import {
  Users,
  Settings,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Bell,
  TrendingUp,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Learning AI",
      menus: [
        {
          href: "/dashboard/ai",
          label: "Create With AI",
          icon: SquarePen,
          submenus: [
            {
              href: "/dashboard/ai/roadmap",
              label: "Roadmap",
            },
            {
              href: "/dashboard/ai/advice",
              label: "Advice",
            },
            {
              href: "/dashboard/ai/quiz",
              label: "Quiz",
            },
          ],
        },
        {
          href: "/dashboard/notification",
          label: "Notification",
          icon: Bell,
        },
        {
          href: "/dashboard/team",
          label: "Team",
          icon: Users,
        },
      ],
    },
    {
      groupLabel: "My Learning",
      menus: [
        {
          href: "/dashboard/ai/library",
          label: "Plan",
          icon: SquarePen,
          submenus: [
            {
              href: "/dashboard/ai/library/plans",
              label: "Plans",
            },
            {
              href: "/dashboard/ai/library/roadmap",
              label: "Roadmap",
            },
            {
              href: "/dashboard/ai/library/guides",
              label: "Guides",
            },
            {
              href: "/dashboard/ai/library/quizzes",
              label: "Quizzes",
            },
            {
              href: "/dashboard/ai/library/courses",
              label: "Courses",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/progession",
          label: "Progression",
          icon: TrendingUp,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/dashboard/settings/profile",
          label: "Environments",
          icon: Settings,
        },
      ],
    },
  ];
}
