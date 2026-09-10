import apiClient from "./client";
import type { ApiResponse } from "./client";
import type {
  Availability,
  CreateUserRequest,
  FieldAdjuster,
  User,
  UserStatus,
} from "../types";

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>("/users");

  return response.data.data;
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>("/users", userData);

  return response.data.data;
}

export async function getFieldAdjusters(): Promise<FieldAdjuster[]> {
  const response = await apiClient.get<
    ApiResponse<Array<Record<string, unknown>>>
  >("/users/adjusters");

  return response.data.data.map((adjuster) => ({
    id:
      typeof adjuster.id === "string"
        ? adjuster.id
        : typeof adjuster._id === "string"
          ? adjuster._id
          : "",
    name: typeof adjuster.name === "string" ? adjuster.name : "",
    employeeCode:
      typeof adjuster.employeeCode === "string" ? adjuster.employeeCode : "",
    role: adjuster.role as FieldAdjuster["role"],
    organizationId:
      typeof adjuster.organizationId === "string"
        ? adjuster.organizationId
        : "",
    organizationName:
      typeof adjuster.organizationName === "string"
        ? adjuster.organizationName
        : "",
    status: (adjuster.status as UserStatus) ?? "ACTIVE",
    availability: (adjuster.availability as Availability) ?? "AVAILABLE",
    activeTasksCount:
      typeof adjuster.activeTasksCount === "number"
        ? adjuster.activeTasksCount
        : 0,
  }));
}