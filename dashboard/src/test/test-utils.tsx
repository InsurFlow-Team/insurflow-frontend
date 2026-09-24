// @vitest-environment jsdom
import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

// Re-export for convenience
export { screen, fireEvent };

// jsdom does no layout, so userEvent's default pointer hit-testing can hang;
// delay:null skips the per-key timer and keeps DOM tests fast.
export function setupUserEvent() {
  return userEvent.setup({ pointerEventsCheck: 0, delay: null });
}

// Fills every required field of the Create New Claim form. Shared by
// AddClaimModal and ClaimsList tests so both exercise identical input.
// Customer/vehicle data is verified-policy read-only (never filled here).
// Incident location is text-only since 2026-09-24 (no coordinates in the
// intake form).
export async function fillClaimForm(container: HTMLElement) {
  const user = setupUserEvent();

  const incidentType = container.querySelector(
    'select[name="incidentType"]',
  ) as HTMLSelectElement;
  if (!incidentType) {
    throw new Error("Incident type select not found in the form");
  }
  await user.selectOptions(incidentType, "COLLISION");
  await user.type(
    screen.getByPlaceholderText("مثال: شارع الملك فهد، بالقرب من..."),
    "Riyadh - King Fahd Road",
  );

  fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, {
    target: { value: "2026-09-01" },
  });
}