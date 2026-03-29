import { BookMarked } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppDefinition = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
};

export const ALL_APPS: AppDefinition[] = [
  {
    id: "saved",
    name: "Saved",
    description: "Нотатки, посилання, файли",
    href: "/dashboard/saved",
    icon: BookMarked,
    gradient: "from-violet-500 to-blue-500",
    glow: "shadow-violet-500/20"
  }
];
