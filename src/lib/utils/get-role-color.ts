import { TUserRoles } from "@/types/user.types"; // adjust path if needed

export function getRoleColor(role?: TUserRoles): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-purple-900 text-white";
    case "BRANCH_MANAGER":
      return "bg-blue-700 text-white";
    case "SALES_AGENT":
      return "bg-emerald-600 text-white";
    case "MARKETER":
      return "bg-emerald-600 text-white";
    case "TRAINER":
      return "bg-orange-600 text-white";
    case "TEAM_MANAGER":
      return "bg-orange-600 text-white";
    case "SUPPORT_AGENT":
      return "bg-sky-500 text-white";
    case "FIELD_WORKER":
      return "bg-sky-500 text-white";
    default:
      return "bg-muted text-foreground";
  }
}

/**
 * 1. SUPER_ADMIN: emerald
 * 2. BRANCH_MANAGER: blue
 * 3. SUPPORT_AGENT: lime
 * 4. SALES_AGENT: lime
 * 5. MARKETER: purple
 * 5. TRAINER: orange
 * 6. TEAM_MANAGER: orange
 * 7. FIELD_WORKER: sky
 */
