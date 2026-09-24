import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./client", () => ({
  default: { get: vi.fn() },
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));

vi.mock("../utils/download", () => ({
  downloadBlob: vi.fn(),
}));

import apiClient from "./client";
import { downloadBlob } from "../utils/download";
import { canExportClaimReport, downloadClaimReport } from "./claims.service";

const mockedGet = vi.mocked(apiClient.get);
const mockedDownload = vi.mocked(downloadBlob);

describe("canExportClaimReport", () => {
  it("allows only final-decision statuses", () => {
    expect(canExportClaimReport("APPROVED")).toBe(true);
    expect(canExportClaimReport("REJECTED")).toBe(true);
    expect(canExportClaimReport("CLOSED")).toBe(true);
  });

  it("rejects every other status so the 409 precondition never fires", () => {
    expect(canExportClaimReport("NEW")).toBe(false);
    expect(canExportClaimReport("ASSIGNED")).toBe(false);
    expect(canExportClaimReport("IN_PROGRESS")).toBe(false);
    expect(canExportClaimReport("SUBMITTED")).toBe(false);
    expect(canExportClaimReport("UNDER_REVIEW")).toBe(false);
    expect(canExportClaimReport("CORRECTION_REQUIRED")).toBe(false);
    expect(canExportClaimReport("")).toBe(false);
  });
});

describe("downloadClaimReport", () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedDownload.mockReset();
  });

  it("GETs the report as a blob and downloads it with the claim number", async () => {
    mockedGet.mockResolvedValue({
      data: new Blob(["%PDF-1.4"]),
      headers: { "content-type": "application/pdf" },
    } as never);

    await downloadClaimReport("clm-1", "CLM-DEMO-INS-0042");

    expect(mockedGet).toHaveBeenCalledWith("/claims/clm-1/report", {
      responseType: "blob",
    });
    expect(mockedDownload).toHaveBeenCalledWith(
      expect.any(Blob),
      "CLM-DEMO-INS-0042_report.pdf",
    );
  });

  it("surfaces a backend 409 (JSON inside the blob) without downloading", async () => {
    const errorBody = JSON.stringify({
      success: false,
      message:
        "Report is only available for claims with a final decision (APPROVED, REJECTED, or CLOSED).",
      errors: [{ code: "INVALID_STATUS_TRANSITION" }],
    });

    mockedGet.mockRejectedValue({
      response: { data: new Blob([errorBody]) },
    });

    await expect(
      downloadClaimReport("clm-1", "CLM-DEMO-INS-0042"),
    ).rejects.toThrow(/only available for claims with a final decision/);
    expect(mockedDownload).not.toHaveBeenCalled();
  });

  it("refuses to download when a 2xx response is not a PDF", async () => {
    mockedGet.mockResolvedValue({
      data: new Blob([JSON.stringify({ message: "unexpected" })]),
      headers: { "content-type": "text/html" },
    } as never);

    await expect(downloadClaimReport("clm-1", "CLM-1")).rejects.toThrow(
      "unexpected",
    );
    expect(mockedDownload).not.toHaveBeenCalled();
  });

  it("falls back to getApiErrorMessage for non-blob errors", async () => {
    mockedGet.mockRejectedValue(new Error("Network Error"));

    await expect(downloadClaimReport("clm-1", "CLM-1")).rejects.toThrow(
      "Network Error",
    );
    expect(mockedDownload).not.toHaveBeenCalled();
  });
});