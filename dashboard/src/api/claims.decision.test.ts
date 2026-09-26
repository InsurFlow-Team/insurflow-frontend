import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: { post: vi.fn() },
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));

import apiClient from "./client";
import { decideClaim } from "./claims.service";

const mockedPost = vi.mocked(apiClient.post);

describe("decideClaim", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("POSTs the decision to /claims/:id/decision with decision only when no notes are given", async () => {
    mockedPost.mockResolvedValue({
      data: { success: true, message: "ok", data: { status: "APPROVED" } },
    } as never);

    await decideClaim("clm-1", "APPROVED");

    expect(mockedPost).toHaveBeenCalledWith("/claims/clm-1/decision", {
      decision: "APPROVED",
    });
  });

  it("includes notes only when provided", async () => {
    mockedPost.mockResolvedValue({
      data: { success: true, message: "ok", data: { status: "REJECTED" } },
    } as never);

    await decideClaim("clm-1", "REJECTED", "Missing inspection report");

    expect(mockedPost).toHaveBeenCalledWith("/claims/clm-1/decision", {
      decision: "REJECTED",
      notes: "Missing inspection report",
    });
  });

  it("rejects when the backend returns an error", async () => {
    mockedPost.mockRejectedValue(new Error("Claim is not in UNDER_REVIEW status"));

    await expect(decideClaim("clm-1", "APPROVED")).rejects.toThrow();
  });
});