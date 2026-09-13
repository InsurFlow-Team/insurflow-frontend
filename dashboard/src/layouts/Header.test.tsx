// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

import { MemoryRouter, Route, Routes } from "react-router-dom";
import Header from "./Header";

function renderHeader() {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={["/claims"]}>
      <Routes>
        <Route path="/claims" element={<Header />} />
        <Route
          path="/profile"
          element={<div data-testid="profile-route" />}
        />
      </Routes>
    </MemoryRouter>,
  );
  return { user, ...utils };
}

afterEach(() => {
  cleanup();
});

describe("Header", () => {
  it("shows the page title and the employee code in the header", () => {
    renderHeader();

    expect(screen.getByRole("heading", { name: "Claims Queue" })).toBeTruthy();
    expect(screen.getByText("Sara")).toBeTruthy();
    expect(screen.getByText("ADMIN")).toBeTruthy();
    expect(screen.getByText("InsurFlow")).toBeTruthy();
    expect(screen.getByText("AD-001")).toBeTruthy();
  });

  it("opens the user menu and shows the full profile", async () => {
    const { user } = renderHeader();

    await user.click(
      screen.getByRole("button", { name: /Sara/ }),
    );

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByText(/Role:/)).toBeTruthy();
    expect(screen.getByText(/Org: InsurFlow/)).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Profile/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Sign Out/ })).toBeTruthy();
  });

  it("navigates to /profile from the user menu", async () => {
    const { user } = renderHeader();

    await user.click(screen.getByRole("button", { name: /Sara/ }));
    await user.click(screen.getByRole("menuitem", { name: /Profile/ }));

    expect(screen.getByTestId("profile-route")).toBeTruthy();
  });

  it("supports keyboard navigation: arrows move, Escape closes", async () => {
    const { user } = renderHeader();

    await user.click(screen.getByRole("button", { name: /Sara/ }));
    const profileItem = screen.getByRole("menuitem", { name: /Profile/ });

    await user.tab();
    expect(document.activeElement).toBe(profileItem);

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: /Sign Out/ }),
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes the menu when clicking outside", async () => {
    const { user } = renderHeader();

    await user.click(screen.getByRole("button", { name: /Sara/ }));
    expect(screen.getByRole("menu")).toBeTruthy();

    await user.click(screen.getByRole("heading", { name: "Claims Queue" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("logs out and navigates to /login on Sign Out", async () => {
    const { user } = renderHeader();

    await user.click(screen.getByRole("button", { name: /Sara/ }));
    await user.click(screen.getByRole("menuitem", { name: /Sign Out/ }));

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});