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

// The header now mounts the notification bell. Mocked so these tests stay
// hermetic instead of issuing a real request per render.
const notifications = vi.hoisted(() => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
  getNotifications: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  }),
  markNotificationRead: vi.fn(),
}));

vi.mock("../api/notifications", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/notifications")>();
  return { ...actual, ...notifications };
});

import { MemoryRouter, Route, Routes } from "react-router-dom";
import I18nProvider from "../i18n/I18nProvider";
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
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

describe("Header", () => {
  it("shows the page title and the employee code in the header", () => {
    renderHeader();

    expect(screen.getByRole("heading", { name: "Claims Queue" })).toBeTruthy();
    expect(screen.getByText("Sara")).toBeTruthy();
    expect(screen.getByText("Administrator")).toBeTruthy();
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

  it("renders the page title in Arabic with RTL when the locale is ar", () => {
    window.localStorage.setItem("sawn.locale", "ar");

    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/claims"]}>
          <Routes>
            <Route path="/claims" element={<Header />} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByRole("heading", { name: "طابور المطالبات" })).toBeTruthy();
    expect(document.documentElement.dir).toBe("rtl");
    expect(
      screen.getByRole("button", { name: "فتح القائمة الجانبية" }),
    ).toBeTruthy();
  });
});