// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductShowcase from "./ProductShowcase";

afterEach(cleanup);

function renderedImages() {
  return Array.from(document.querySelectorAll("img"));
}

describe("ProductShowcase", () => {
  it("opens on the claims tab and shows its copy", () => {
    render(<ProductShowcase />);

    const claimsTab = screen.getByRole("tab", { name: "إدارة المطالبات" });
    expect(claimsTab.getAttribute("aria-selected")).toBe("true");
    expect(
      screen.getByRole("heading", { name: "رؤية أوضح لكل مطالبة." }),
    ).toBeTruthy();
    expect(
      screen.getByRole("tab", { name: "الإسناد" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("switches panels when another tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductShowcase />);

    await user.click(screen.getByRole("tab", { name: "المعاينة الميدانية" }));

    expect(
      screen.getByRole("heading", { name: "المعاينة تبدأ من الميدان." }),
    ).toBeTruthy();
    expect(screen.queryByText("رؤية أوضح لكل مطالبة.")).toBeNull();
    expect(
      screen
        .getByRole("tab", { name: "المعاينة الميدانية" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ProductShowcase />);

    screen.getByRole("tab", { name: "إدارة المطالبات" }).focus();
    await user.keyboard("{ArrowLeft}");

    expect(
      screen.getByRole("tab", { name: "الإسناد" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(document.activeElement?.textContent).toContain("الإسناد");
  });

  it("gives every rendered image intrinsic size and a real alt", () => {
    render(<ProductShowcase />);

    const images = renderedImages();
    expect(images.length).toBeGreaterThan(0);

    for (const image of images) {
      expect(image.getAttribute("alt")).toBeTruthy();
      expect(Number(image.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(image.getAttribute("height"))).toBeGreaterThan(0);
    }
  });

  it("loads screenshots lazily so the landing page stays light", () => {
    render(<ProductShowcase />);

    for (const image of renderedImages()) {
      expect(image.getAttribute("loading")).toBe("lazy");
    }
  });
});
