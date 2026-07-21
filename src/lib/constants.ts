import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Palette,
  Library,
  ListChecks,
  MessagesSquare,
  ShieldCheck,
  Rocket,
  Settings,
  Package,
  type LucideIcon,
} from "lucide-react";

export type Stage =
  | "Idea"
  | "Discovery"
  | "PRD"
  | "Design DNA"
  | "Build Pack"
  | "Engineering"
  | "QA"
  | "Launch"
  | "Growth";

export const STAGES: Stage[] = [
  "Idea",
  "Discovery",
  "PRD",
  "Design DNA",
  "Build Pack",
  "Engineering",
  "QA",
  "Launch",
  "Growth",
];

export type Priority = "Low" | "Medium" | "High" | "Critical";

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

export type ProjectStatus = "Active" | "Paused" | "Archived";

export const PROJECT_STATUSES: ProjectStatus[] = ["Active", "Paused", "Archived"];

export type BuildTaskStatus = "Backlog" | "Ready" | "In Progress" | "Review" | "Done";

export const BUILD_TASK_STATUSES: BuildTaskStatus[] = [
  "Backlog",
  "Ready",
  "In Progress",
  "Review",
  "Done",
];

export type PromptCategory =
  | "Discovery"
  | "PRD"
  | "Design DNA"
  | "Build Pack"
  | "QA"
  | "Launch";

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Discovery",
  "PRD",
  "Design DNA",
  "Build Pack",
  "QA",
  "Launch",
];

export const GENERATION_PROMPT_CATEGORIES = [
  "Discovery",
  "PRD",
  "Design DNA",
  "Build Pack",
  "QA",
  "Launch",
] as const;

export type DesignInspirationCategory =
  | "layout"
  | "typography"
  | "colour"
  | "components"
  | "motion"
  | "branding";

export const DESIGN_INSPIRATION_CATEGORIES: DesignInspirationCategory[] = [
  "layout",
  "typography",
  "colour",
  "components",
  "motion",
  "branding",
];

export const PLATFORMS = [
  "Web app",
  "Mobile app",
  "Desktop app",
  "API / backend",
  "Multi-platform",
] as const;

export const BUSINESS_MODELS = [
  "Subscription",
  "One-time purchase",
  "Freemium",
  "Marketplace",
  "Internal tool",
  "Advertising",
  "Other",
] as const;

export const LAUNCH_STATUSES = ["Planned", "In Progress", "Done", "Blocked"] as const;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Your studio at a glance",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    description: "Every idea in motion",
  },
  {
    label: "Product Blueprint",
    href: "/blueprint",
    icon: FileText,
    description: "PRDs and product specs",
  },
  {
    label: "Design DNA",
    href: "/design-dna",
    icon: Palette,
    description: "Brand, tokens and UI kit",
  },
  {
    label: "Build Pack",
    href: "/build-pack",
    icon: Package,
    description: "Stack, milestones, agent prompts",
  },
  {
    label: "Prompt Library",
    href: "/prompt-library",
    icon: Library,
    description: "Reusable AI prompts",
  },
  {
    label: "Build Queue",
    href: "/build-queue",
    icon: ListChecks,
    description: "Sprint and delivery",
  },
  {
    label: "Review Centre",
    href: "/review-centre",
    icon: MessagesSquare,
    description: "Feedback and approvals",
  },
  {
    label: "QA Checklist",
    href: "/qa-checklist",
    icon: ShieldCheck,
    description: "Ship with confidence",
  },
  {
    label: "Launch Plan",
    href: "/launch-plan",
    icon: Rocket,
    description: "Go-to-market steps",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Studio preferences",
  },
];

export function stageProgress(stage: string): number {
  const index = STAGES.indexOf(stage as Stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / STAGES.length) * 100);
}

export function priorityRank(priority: string): number {
  return PRIORITIES.indexOf(priority as Priority);
}
