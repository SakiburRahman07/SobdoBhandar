import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  LayoutDashboard,
  Lightbulb,
  ListPlus,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keyword?: string[];
}

export const workspaceNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Today's mission, streak, and learning overview",
    icon: LayoutDashboard,
    keyword: ["home", "mission", "overview"],
  },
  {
    href: "/learn",
    label: "Learn Session",
    description: "Due card review, active recall, and focus mode",
    icon: BookOpenCheck,
    keyword: ["review", "cards", "study"],
  },
  {
    href: "/words",
    label: "Word Library",
    description: "Search, filter, edit, and manage vocabulary",
    icon: ListPlus,
    keyword: ["dictionary", "library", "manage"],
  },
  {
    href: "/progress",
    label: "Progress",
    description: "Mastery, consistency, charts, and insights",
    icon: BarChart3,
    keyword: ["analytics", "stats", "charts"],
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "Friendly competition and community momentum",
    icon: Trophy,
    keyword: ["rank", "social", "competition"],
  },
  {
    href: "/suggest",
    label: "Feedback",
    description: "Feature ideas, bug reports, and product feedback",
    icon: Lightbulb,
    keyword: ["feedback", "suggestion", "idea"],
  },
  {
    href: "/profile",
    label: "Profile",
    description: "Learning identity, goals, and settings",
    icon: UserRound,
    keyword: ["settings", "account", "goals"],
  },
];

export const workspaceQuickActions: NavigationItem[] = [
  {
    href: "/words/add",
    label: "Add a new word",
    description: "Create a vocabulary entry with full metadata",
    icon: Sparkles,
    keyword: ["add", "new", "create"],
  },
  {
    href: "/learn",
    label: "Start today's review",
    description: "Jump into the next due study session",
    icon: BrainCircuit,
    keyword: ["today", "due", "mission"],
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    href: "/admin",
    label: "Admin Console",
    description: "Suggestions, moderation, and operations",
    icon: Shield,
    keyword: ["moderation", "ops", "console"],
  },
];
