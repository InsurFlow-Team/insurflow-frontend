// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Unauthorized from "../pages/Unauthorized";
import RoleGuard from "./RoleGuard";

const { auth } = vi.hoisted(() => ({
  auth: {
    user: {
      id: "u-1",
      name: "Omar",
      employeeCode: "CO-001",
      role: "CLAIMS_OFFICER",
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

afterEach(() => {
  cleanup();
});

describe("RoleGuard", () => {
  it("renders children when the role is allowed", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["ADMIN", "CLAIMS_OFFICER"]} />}>
            <Route path="/settings" element={<div>Settings Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Settings Panel")).toBeTruthy();
  });

  it("redirects to /unauthorized when the role is not allowed", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
            <Route path="/settings" element={<div>Settings Panel</div>} />
          </Route>
          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeTruthy();
  });
});