// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import LandingPage from "./LandingPage";

afterEach(cleanup);

const STORY_ORDER = [
  "hero",
  "audience",
  "problem",
  "journey",
  "platform",
  "outcomes",
  "about",
  "demo",
];

describe("LandingPage", () => {
  it("answers who SAWN is for, what it does and what to do next", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "المطالبة ما لازم تضيع",
    );
    expect(
      screen.getByRole("heading", { name: /صَوْن مصممة لشركات التأمين/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "من البلاغ إلى إغلاق المطالبة." }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "كل خطوة في رحلة المطالبة، في مكانها.",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /لا تضيف خطوة جديدة/ }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: /احجز عرضًا توضيحيًا/ }).length,
    ).toBeGreaterThan(0);
  });

  it("keeps every in-page link pointed at a section that exists", () => {
    const { container } = render(<LandingPage />);

    const ids = new Set(
      Array.from(container.querySelectorAll("[id]")).map((node) => node.id),
    );
    const hashes = Array.from(
      container.querySelectorAll('a[href^="#"]'),
    ).map((link) => link.getAttribute("href") ?? "");

    expect(hashes.length).toBeGreaterThan(0);
    for (const hash of hashes) {
      expect(ids.has(hash.slice(1))).toBe(true);
    }
  });

  it("presents the sections in the intended story order", () => {
    const { container } = render(<LandingPage />);

    const order = Array.from(container.querySelectorAll("section[id]")).map(
      (section) => section.id,
    );

    expect(order).toEqual(STORY_ORDER);
  });

  it("offers a back-to-top control that stays hidden until the page is scrolled", () => {
    render(<LandingPage />);

    const button = screen.getByRole("button", {
      name: "العودة إلى أعلى الصفحة",
    });
    expect((button.parentElement as HTMLElement).className).toContain(
      "invisible",
    );
  });
});
