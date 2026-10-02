import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "./client";

function makeError(status: number, data: unknown) {
  return new AxiosError(
    undefined,
    undefined,
    undefined,
    undefined,
    { status, data } as never,
  );
}

describe("getApiErrorMessage", () => {
  it("returns the backend 403 message (or the permission fallback) for forbidden actions", () => {
    const withMessage = makeError(403, {
      success: false,
      message: "Forbidden resource",
    });
    expect(getApiErrorMessage(withMessage)).toBe("Forbidden resource");

    const withoutMessage = makeError(403, { success: false });
    expect(getApiErrorMessage(withoutMessage)).toBe(
      "You do not have permission to perform this action.",
    );
  });

  it("joins backend field errors with the summary for 400 responses", () => {
    const err = makeError(400, {
      success: false,
      message: "Validation failed",
      errors: [
        { code: "INVALID_PLATE", details: "Invalid plate number" },
        { code: "MISSING_CUSTOMER" },
      ],
    });
    expect(getApiErrorMessage(err)).toBe(
      "Validation failed: Invalid plate number | MISSING_CUSTOMER",
    );
  });

  it("does not duplicate the message when 409 repeats the same text in errors", () => {
    const err = makeError(409, {
      success: false,
      message: "An employee with this code already exists in your organization",
      errors: [
        {
          code: "EMPLOYEE_CODE_TAKEN",
          details: "An employee with this code already exists in your organization",
        },
      ],
    });
    expect(getApiErrorMessage(err)).toBe(
      "An employee with this code already exists in your organization",
    );
  });

  it("falls back to the generic message when the response is missing", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});