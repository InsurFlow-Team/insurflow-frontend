import axios from "axios";

export const TOKEN_STORAGE_KEY = "insurflow_access_token";
export const USER_STORAGE_KEY = "insurflow_user";

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    code?: string;
    details?: string;
  }>;
}

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on the change-password endpoint with INVALID_CREDENTIALS means the
    // CURRENT password was wrong (per the backend contract) — the session is
    // still valid and must NOT be destroyed. Every other 401 destroys it.
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isInvalidCurrentPassword =
        url.includes("/auth/change-password") &&
        (error.response.data?.errors ?? []).some(
          (entry: { code?: string }) => entry.code === "INVALID_CREDENTIALS",
        );

      if (!isInvalidCurrentPassword) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.status === 403) {
      return (
        error.response.data?.message ??
        "You do not have permission to perform this action."
      );
    }

    const data = error.response?.data;
    const details = (data?.errors ?? [])
      .map((e) => e.details ?? e.code)
      .filter((detail): detail is string => Boolean(detail));

    if (details.length) {
      return data?.message
        ? `${data.message}: ${details.join(" | ")}`
        : details.join(" | ");
    }

    return (
      data?.message ?? "Unable to connect to the server. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}

export function getApiErrorCode(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.errors?.[0]?.code ?? null;
  }

  return null;
}

export default apiClient;
