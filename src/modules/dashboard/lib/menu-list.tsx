import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Bell,
  User,
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
              href: "/ai/roadmap",
              label: "Roadmap",
            },
            {
              href: "/ai/advice",
              label: "Advice",
            },
            {
              href: "/ai/quiz",
              label: "Quiz",
            },
          ],
        },
        {
          href: "/notification",
          label: "Notification",
          icon: Bell,
        },
        {
          href: "/team",
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
              href: "/ai/library/plans",
              label: "Plans",
            },
            {
              href: "/ai/library/roadmap",
              label: "Roadmap",
            },
            {
              href: "/ai/library/guides",
              label: "Guides",
            },
            {
              href: "/ai/library/quizzes",
              label: "Quizzes",
            },
            {
              href: "/ai/library/courses",
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
          href: "/user",
          label: "Users",
          icon: User,
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings,
        },
      ],
    },
  ];
}
