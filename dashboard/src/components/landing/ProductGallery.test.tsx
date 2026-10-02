// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";

import ProductGallery from "./ProductGallery";

afterEach(cleanup);

function renderGallery() {
  const utils = render(<ProductGallery />);
  const images = Array.from(document.querySelectorAll("img"));
  return { ...utils, images };
}

const TITLES = [
  "لوحة المطالبات",
  "خريطة التوزيع",
  "تفاصيل المطالبة",
  "المعاينة الميدانية",
];

describe("ProductGallery", () => {
  it("renders every screenshot with its title and caption", () => {
    renderGallery();

    TITLES.forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    });

    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("gives every image intrinsic width and height so the browser reserves the right box", () => {
    const { images } = renderGallery();

    expect(images).toHaveLength(4);

    images.forEach((img) => {
      const width = img.getAttribute("width");
      const height = img.getAttribute("height");

      expect(width).not.toBeNull();
      expect(height).not.toBeNull();
      expect(Number(width)).toBeGreaterThan(0);
      expect(Number(height)).toBeGreaterThan(0);
      expect(img.getAttribute("alt")).toBeTruthy();
    });
  });

  it("sizes each landscape frame to its own image ratio so nothing is letterboxed", () => {
    const { images } = renderGallery();

    const desktopImages = images.filter(
      (img) => !img.getAttribute("src")?.includes("gallery-mobile"),
    );

    expect(desktopImages).toHaveLength(3);

    desktopImages.forEach((img) => {
      const frame = img.parentElement as HTMLElement;
      const declared = `${img.getAttribute("width")} / ${img.getAttribute(
        "height",
      )}`;

      expect(frame.style.aspectRatio).toBe(declared);
    });
  });

  it("keeps the portrait phone screenshot inside a fixed-height stage, not a 16:9 box", () => {
    const { images } = renderGallery();

    const mobile = images.find((img) =>
      img.getAttribute("src")?.includes("gallery-mobile"),
    );

    expect(mobile).toBeDefined();

    const stage = mobile!.parentElement as HTMLElement;

    expect(stage.style.aspectRatio).toBe("");
    expect(stage.className).toContain("h-[360px]");
    expect(mobile!.className).toContain("w-auto");
  });

  it("keeps the source list free of duplicate image paths", () => {
    const { images } = renderGallery();
    const sources = images.map((img) => img.getAttribute("src"));

    expect(new Set(sources).size).toBe(sources.length);
  });
});