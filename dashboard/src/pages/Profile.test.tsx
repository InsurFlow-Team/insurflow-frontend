// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";

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
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => auth,
}));

import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Profile />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe("Profile", () => {
  it("shows the signed-in user's account information", () => {
    renderProfile();

    expect(screen.getByRole("heading", { name: "Profile" })).toBeTruthy();
    expect(screen.getByText("Sara")).toBeTruthy();
    expect(screen.getByText("AD-001")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
    expect(screen.getByText("InsurFlow")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("gives the user the change-password card", () => {
    renderProfile();

    expect(screen.getByRole("heading", { name: "Password" })).toBeTruthy();
    expect(
      screen.getByText("Change the password used to sign in to your own account."),
    ).toBeTruthy();
  });
});