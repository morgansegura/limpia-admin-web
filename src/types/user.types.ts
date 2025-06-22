import { EmploymentType, Role } from "@/constants/roles";

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone: string;
  avatarUrl: string;

  // Employment Info
  type: EmploymentType;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  trainingCompleted: boolean;
  availability: string; // e.g. "Mon-Fri 8am-5pm"
  region: string; // optional region or zone
  internalNotes: string;

  organization: string;
  organizationId: string;

  createdAt: string;
  updatedAt: string;
}
