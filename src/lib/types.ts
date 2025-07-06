import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface Profile {
  id: string;
  name: string;
  birthdate: string;
  description: string;
  photoUrl: string;
  categoryId: string;
}
