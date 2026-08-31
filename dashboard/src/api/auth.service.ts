import apiClient from "./client";
import type { ApiResponse } from "./client";
import type { User } from "../types";

export interface LoginCredentials {
  organizationCode: string;
  employeeCode: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: User;
}

export async function login(credentials: LoginCredentials) {
  const response = await apiClient.post<ApiResponse<LoginResult>>(
    "/auth/login",
    credentials,
  );

  return response.data.data;
}
