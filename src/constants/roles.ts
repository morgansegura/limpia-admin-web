export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BRANCH_MANAGER: "BRANCH_MANAGER",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  SALES_AGENT: "SALES_AGENT",
  MARKETER: "MARKETER",
  TRAINER: "TRAINER",
  TEAM_MANAGER: "TEAM_MANAGER",
  FIELD_WORKER: "FIELD_WORKER",
} as const;

export type TRole = (typeof ROLES)[keyof typeof ROLES];

export const EMPLOYMENT_TYPE = {
  W2: "W2",
  CONTRACTOR: "CONTRACTOR",
};

export type TEmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];
