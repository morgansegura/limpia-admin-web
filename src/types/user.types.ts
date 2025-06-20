import { Role } from "@/constants/roles";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: string;
  avatarUrl?: string;
}
