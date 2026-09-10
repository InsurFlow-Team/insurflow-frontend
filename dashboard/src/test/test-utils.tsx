// @vitest-environment jsdom
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const PLATE_PLACEHOLDER = "ABC-1234 or ١٢٣٤ أ ب ج";

// jsdom does no layout, so userEvent's default pointer hit-testing can hang;
// delay:null skips the per-key timer and keeps DOM tests fast.
export function setupUserEvent() {
  return userEvent.setup({ pointerEventsCheck: 0, delay: null });
}

// Fills every required field of the Create New Claim form. Shared by
// AddClaimModal and ClaimsList tests so both exercise identical input.
export async function fillClaimForm(
  container: HTMLElement,
  options: { includePlate?: boolean } = {},
) {
  const user = setupUserEvent();

  await user.type(screen.getByPlaceholderText("e.g., Ahmed Ibrahim"), "Ahmed Ibrahim");
  await user.type(screen.getByPlaceholderText("05XXXXXXXX"), "0512345678");
  if (options.includePlate !== false) {
    await user.type(screen.getByPlaceholderText(PLATE_PLACEHOLDER), "abc-1234");
  }

  await user.selectOptions(
    screen.getByDisplayValue("Select incident type"),
    "COLLISION",
  );
  await user.type(
    screen.getByPlaceholderText("e.g., Riyadh - King Fahd Road"),
    "Riyadh - King Fahd Road",
  );

  fireEvent.change(container.querySelector('input[type="date"]') as HTMLInputElement, {
    target: { value: "2026-09-01" },
  });
  fireEvent.change(container.querySelector('input[type="time"]') as HTMLInputElement, {
    target: { value: "14:30" },
  });

  await user.type(
    screen.getByPlaceholderText(/Provide a detailed description/),
    "Rear collision while waiting at a red light on the highway.",
  );
  await user.type(
    screen.getByPlaceholderText(/Describe visible damage/),
    "Bumper cracked and trunk lid is misaligned.",
  );
}