// @vitest-environment jsdom
import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

// Re-export for convenience
export { screen, fireEvent };

export const PLATE_PLACEHOLDER = "ABC-1234 or ١٢٣٤ أ ب ج";

// jsdom does no layout, so userEvent's default pointer hit-testing can hang;
// delay:null skips the per-key timer and keeps DOM tests fast.
export function setupUserEvent() {
  return userEvent.setup({ pointerEventsCheck: 0, delay: null });
}

// Fills every required field of the Create New Claim form. Shared by
// AddClaimModal and ClaimsList tests so both exercise identical input.
// Coordinates are required since 2026-09-20 (claims must be placeable on the
// dispatch map), so they are filled by default.
export async function fillClaimForm(
  container: HTMLElement,
  options: { includePlate?: boolean; includeCoordinates?: boolean } = {},
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

  const descTextarea = screen.getByPlaceholderText(/Provide a detailed description/);
  const damageTextarea = screen.getByPlaceholderText(/Describe visible damage/);
  fireEvent.change(descTextarea, {
    target: { value: "Rear collision while waiting at a red light on the highway." },
  });
  fireEvent.change(damageTextarea, {
    target: { value: "Bumper cracked and trunk lid is misaligned." },
  });

  if (options.includeCoordinates !== false) {
    const latInput = container.querySelector('input[name="latitude"]');
    const lngInput = container.querySelector('input[name="longitude"]');
    if (latInput) fireEvent.change(latInput, { target: { value: "24.7136" } });
    if (lngInput) fireEvent.change(lngInput, { target: { value: "46.6753" } });
  }
}