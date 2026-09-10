import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import apiClient from "./client";
import { assignClaim } from "./claims.service";

const mockedPost = vi.mocked(apiClient.post);

describe("assignClaim", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("POSTs exactly { adjusterId, priority, notes } to /claims/:id/assign", async () => {
    mockedPost.mockResolvedValue({
      data: {
        success: true,
        message: "Claim assigned",
        data: { status: "ASSIGNED" },
      },
    });

    await assignClaim("clm-1", {
      adjusterId: "6a919f4ee62778a597174335",
      priority: "HIGH",
      notes: "Please inspect this as soon as possible",
    });

    expect(mockedPost).toHaveBeenCalledWith("/claims/clm-1/assign", {
      adjusterId: "6a919f4ee62778a597174335",
      priority: "HIGH",
      notes: "Please inspect this as soon as possible",
    });
  });

  it("supports MEDIUM and LOW priorities", async () => {
    mockedPost.mockResolvedValue({ data: { success: true, data: null } });

    await assignClaim("clm-2", {
      adjusterId: "adj-2",
      priority: "MEDIUM",
      notes: "",
    });
    await assignClaim("clm-3", {
      adjusterId: "adj-3",
      priority: "LOW",
      notes: "",
    });

    expect(mockedPost).toHaveBeenNthCalledWith(1, "/claims/clm-2/assign", {
      adjusterId: "adj-2",
      priority: "MEDIUM",
      notes: "",
    });
    expect(mockedPost).toHaveBeenNthCalledWith(2, "/claims/clm-3/assign", {
      adjusterId: "adj-3",
      priority: "LOW",
      notes: "",
    });
  });

  it("rejects when the backend returns an error", async () => {
    mockedPost.mockRejectedValue(new Error("Request failed"));

    await expect(
      assignClaim("clm-1", {
        adjusterId: "adj-1",
        priority: "HIGH",
        notes: "",
      }),
    ).rejects.toThrow();
  });
});