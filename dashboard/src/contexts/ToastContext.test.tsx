// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import type { ReactNode } from "react";
import {
  ToastProvider,
  toast as globalToast,
  useToast,
} from "./ToastContext";
import Toaster from "../components/ui/Toaster";

function Probe({ kind }: { kind: "success" | "error" | "info" }) {
  const { notify } = useToast();
  return (
    <button type="button" onClick={() => notify(kind, `${kind} message`)}>
      fire-{kind}
    </button>
  );
}

function renderWithToaster(ui: ReactNode) {
  return render(
    <ToastProvider>
      {ui}
      <Toaster />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("ToastProvider", () => {
  it("renders success toasts with a status role", () => {
    renderWithToaster(<Probe kind="success" />);

    fireEvent.click(screen.getByRole("button", { name: "fire-success" }));
    expect(screen.getByText("success message")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("renders error toasts with an alert role", () => {
    renderWithToaster(<Probe kind="error" />);

    fireEvent.click(screen.getByRole("button", { name: "fire-error" }));
    expect(screen.getByText("error message")).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("auto-dismisses a toast after the interval", () => {
    renderWithToaster(<Probe kind="info" />);

    fireEvent.click(screen.getByRole("button", { name: "fire-info" }));
    expect(screen.getByText("info message")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText("info message")).toBeNull();
  });

  it("dismisses immediately when the close button is clicked", () => {
    renderWithToaster(<Probe kind="info" />);

    fireEvent.click(screen.getByRole("button", { name: "fire-info" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText("info message")).toBeNull();
  });

  it("supports the imperative toast() outside React", () => {
    renderWithToaster(null);

    act(() => {
      globalToast("success", "imperative message");
    });

    expect(screen.getByText("imperative message")).toBeTruthy();
  });
});