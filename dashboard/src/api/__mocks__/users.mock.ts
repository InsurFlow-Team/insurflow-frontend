import type { User, FieldAdjuster } from "../../types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ahmed Ali",
    employeeCode: "ADM-001",
    role: "ADMIN",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Sara Mohammed",
    employeeCode: "CO-001",
    role: "CLAIMS_OFFICER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Aya Hassan",
    employeeCode: "FA-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Omar Ibrahim",
    employeeCode: "FA-002",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
];

export const mockFieldAdjusters: FieldAdjuster[] = [
  {
    id: "3",
    name: "Aya Hassan",
    employeeCode: "FA-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
    availability: "AVAILABLE",
    activeTasksCount: 2,
  },
  {
    id: "4",
    name: "Omar Ibrahim",
    employeeCode: "FA-002",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
    availability: "AVAILABLE",
    activeTasksCount: 1,
  },
];
