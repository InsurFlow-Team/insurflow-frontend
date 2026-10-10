// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "../contexts/AuthContext";
import I18nProvider from "../i18n/I18nProvider";
import Login from "./Login";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <I18nProvider>
          <Login />
        </I18nProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Login language support", () => {
  it("switches all login copy and direction between Arabic and English", async () => {
    const user = userEvent.setup();
    renderLogin();

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
    expect(screen.getByLabelText(/Organization Code/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "العربية" }));

    expect(screen.getByRole("heading", { name: "مرحبًا بعودتك" })).toBeTruthy();
    expect(screen.getByLabelText(/رمز الجهة/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "تسجيل الدخول" })).toBeTruthy();
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(screen.getByText("إدارة المطالبات")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
    expect(screen.getByLabelText(/Organization Code/)).toBeTruthy();
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });

  it("localizes required-field validation and preserves logical password controls in RTL", async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    await user.click(screen.getByRole("button", { name: "العربية" }));
    await user.click(screen.getByRole("button", { name: "تسجيل الدخول" }));

    expect(
      screen.getByText("يرجى تعبئة جميع الحقول المطلوبة."),
    ).toBeTruthy();
    expect(container.querySelector("#password")?.className).toContain("pe-11");
    expect(
      screen.getByRole("button", { name: "إظهار كلمة المرور" }).className,
    ).toContain("end-3");
  });
});
