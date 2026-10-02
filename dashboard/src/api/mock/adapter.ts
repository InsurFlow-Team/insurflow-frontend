import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { MockApiError, routeMockRequest } from "./handlers";

// A custom axios adapter is what lets the mock cover the whole API without
// touching a single service file: every apiClient call is routed here instead of
// the network. It returns real AxiosResponse/AxiosError objects, so interceptors
// and getApiErrorMessage behave exactly as they do against the live backend.

const MOCK_LATENCY_MS = 120;

function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MOCK_LATENCY_MS);
  });
}

function buildResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return {
    data: { success: true, message: "", data },
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
  };
}

function buildError(
  config: InternalAxiosRequestConfig,
  error: MockApiError,
): AxiosError {
  const data = {
    success: false,
    message: error.message,
    ...(error.errors ? { errors: error.errors } : {}),
  };

  const response: AxiosResponse = {
    data,
    status: error.status,
    statusText: String(error.status),
    headers: {},
    config,
  };

  return new AxiosError(
    error.message,
    `ERR_${error.status}`,
    config,
    undefined,
    response,
  );
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();

  const method = (config.method ?? "get").toUpperCase();
  const path = (config.url ?? "").split("?")[0];

  let body: Record<string, unknown> | undefined;

  if (typeof config.data === "string" && config.data.length > 0) {
    try {
      body = JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      body = undefined;
    }
  } else if (config.data && typeof config.data === "object") {
    body = config.data as Record<string, unknown>;
  }

  try {
    const result = routeMockRequest({
      method,
      path,
      params: (config.params ?? {}) as Record<string, unknown>,
      body,
    });

    const response = buildResponse(config, result.status, result.data);
    response.data.message = result.message;

    return response;
  } catch (caught) {
    if (caught instanceof MockApiError) {
      throw buildError(config, caught);
    }

    throw caught;
  }
};