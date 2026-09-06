import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { User, CreateUserRequest } from "../types";

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Ruba",
    employeeCode: "AD-001",
    role: "ADMIN",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },

  {
    id: "2",
    name: "Alaa",
    employeeCode: "AD-001",
    role: "CLAIMS_OFFICER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Aya",
    employeeCode: "AD-001",
    role: "FIELD_ADJUSTER",
    organizationId: "org-1",
    organizationName: "InsurFlow",
    status: "ACTIVE",
  },
];

export async function getUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  } catch {
    return MOCK_USERS; // ← fallback حتى Sprint 2
  }
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>("/users", userData);
  return response.data.data;
}
