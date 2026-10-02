// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { setupUserEvent } from "../test/test-utils";

const { auth } = vi.hoisted(() => ({
  auth: {
    user: {
      id: "u-1",
      name: "Sara",
      employeeCode: "AD-001",
      role: "ADMIN",
      organizationId: "org-1",
      organizationName: "InsurFlow",
      status: "ACTIVE",
    },
    logout: vi.fn(),
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => auth,
}));

import Unauthorized from "./Unauthorized";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Unauthorized", () => {
  it("renders the access denied message and the signed-in user", () => {
    render(
      <MemoryRouter>
        <Unauthorized />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeTruthy();
    expect(screen.getByText(/You do not have permission to view this page/i)).toBeTruthy();
    expect(screen.getByText(/Sara \(AD-001\)/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to your page" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeTruthy();
  });

  it("logs out and navigates to /login on Sign Out", async () => {
    const user = setupUserEvent();
    render(
      <MemoryRouter initialEntries={["/unauthorized"]}>
        <Unauthorized />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Sign Out" }));

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});