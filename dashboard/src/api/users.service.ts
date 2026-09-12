import apiClient from "./client";
import type { ApiResponse } from "./client";
import type {
  Availability,
  CreateUserRequest,
  FieldAdjuster,
  User,
  UserStatus,
} from "../types";

// The real /users response uses `_id` (Mongo) not `id`. Every users-described
// service normalizes raw rows into the app's User shape so stable ids drive
// DataTable keys and PATCH-by-id calls.
function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id:
      typeof raw.id === "string" ? raw.id : typeof raw._id === "string" ? raw._id : "",
    name: typeof raw.name === "string" ? raw.name : "",
    employeeCode:
      typeof raw.employeeCode === "string" ? raw.employeeCode : "",
    role: raw.role as User["role"],
    organizationId:
      typeof raw.organizationId === "string" ? raw.organizationId : "",
    organizationName:
      typeof raw.organizationName === "string"
        ? raw.organizationName
        : "",
    status: (raw.status as UserStatus) ?? "ACTIVE",
  };
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<Array<Record<string, unknown>>>>(
    "/users",
  );

  return response.data.data.map(normalizeUser);
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
    "/users",
    userData,
  );

  return normalizeUser(response.data.data);
}

export async function getFieldAdjusters(): Promise<FieldAdjuster[]> {
  const response = await apiClient.get<
    ApiResponse<Array<Record<string, unknown>>>
  >("/users/adjusters");

  return response.data.data.map((adjuster) => ({
    ...normalizeUser(adjuster),
    status: (adjuster.status as UserStatus) ?? "ACTIVE",
    availability: (adjuster.availability as Availability) ?? "AVAILABLE",
    activeTasksCount:
      typeof adjuster.activeTasksCount === "number"
        ? adjuster.activeTasksCount
        : 0,
  }));
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<void> {
  await apiClient.patch(`/users/${userId}/status`, { status });
}

export async function resetUserPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  await apiClient.patch(`/users/${userId}/reset-password`, { newPassword });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}