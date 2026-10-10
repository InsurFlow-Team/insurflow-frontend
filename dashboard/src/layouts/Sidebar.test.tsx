// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { auth } = vi.hoisted(() => ({
  auth: {
    user: {
      name: "Sara",
      role: "CLAIMS_OFFICER",
    },
    logout: vi.fn(),
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => auth,
}));

import I18nProvider from "../i18n/I18nProvider";
import Sidebar from "./Sidebar";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

function renderSidebar(locale: "en" | "ar") {
  window.localStorage.setItem("sawn.locale", locale);
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Sidebar />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("Sidebar responsive direction", () => {
  it("anchors its closed mobile drawer at the logical start in RTL", () => {
    renderSidebar("ar");

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("start-0");
    expect(sidebar.className).toContain("translate-x-full");
    expect(sidebar.className).not.toContain("-translate-x-full");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("keeps the closed mobile drawer off-canvas toward the left in LTR", () => {
    renderSidebar("en");

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("start-0");
    expect(sidebar.className).toContain("-translate-x-full");
    expect(document.documentElement.dir).toBe("ltr");
  });
});
