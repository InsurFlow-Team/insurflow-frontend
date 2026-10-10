// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import I18nProvider from "./I18nProvider";
import { useTranslation } from "./context";
import { pluralSuffix } from "./plurals";

function Probe() {
  const { locale, dir, setLocale, t, tp } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="label">{t("metric.overdue")}</span>
      <span data-testid="plural-en">{tp("sla.remaining", 1)}</span>
      <span data-testid="days">{tp("sla.remaining", 3)}</span>
      <button type="button" onClick={() => setLocale("ar")}>
        switch
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

describe("I18nProvider", () => {
  it("works without a provider through the English fallback", () => {
    render(<Probe />);

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("dir").textContent).toBe("ltr");
    expect(screen.getByTestId("label").textContent).toBe("Stale (3+ days old)");
  });

  it("switches language, direction and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    await user.click(screen.getByText("switch"));

    expect(screen.getByTestId("locale").textContent).toBe("ar");
    expect(screen.getByTestId("dir").textContent).toBe("rtl");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(screen.getByTestId("label").textContent).toBe("متقادمة (3 أيام فأكثر)");
    expect(window.localStorage.getItem("sawn.locale")).toBe("ar");
  });

  it("interpolates day counts through the plural key (English)", () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

    // English: 1 → one, 3 → other.
    expect(screen.getByTestId("plural-en").textContent).toBe(
      "1 day to threshold",
    );
    expect(screen.getByTestId("days").textContent).toBe("3 days to threshold");
  });

  it("picks the CLDR plural category per locale", () => {
    expect(pluralSuffix("en", 1)).toBe("one");
    expect(pluralSuffix("en", 5)).toBe("other");
    expect(pluralSuffix("ar", 1)).toBe("one");
    expect(pluralSuffix("ar", 2)).toBe("two");
    expect(pluralSuffix("ar", 4)).toBe("few");
    expect(pluralSuffix("ar", 11)).toBe("many");
  });
});

it("restores a persisted Arabic locale on mount", () => {
  window.localStorage.setItem("sawn.locale", "ar");

  render(
    <I18nProvider>
      <Probe />
    </I18nProvider>,
  );

  expect(screen.getByTestId("locale").textContent).toBe("ar");
  expect(document.documentElement.dir).toBe("rtl");

  window.localStorage.removeItem("sawn.locale");
});
