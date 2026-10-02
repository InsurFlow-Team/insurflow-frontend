import { getClaimById, getClaims } from "./claims.read";
import {
  MAX_HISTORY_DETAIL_FETCHES,
  selectCompletedClaims,
  toWorkHistoryEntry,
} from "../utils/adjusterHistory";
import type { AdjusterWorkHistory } from "../types";

// The backend has no per-adjuster claims endpoint (GET /claims only accepts
// `status`), so the work history is derived from the claim list: filter to this
// adjuster's finished claims, then hydrate the timeline of the most recent ones
// to read the inspection count and the completion time.
export async function getAdjusterWorkHistory(
  adjusterId: string,
): Promise<AdjusterWorkHistory> {
  const claims = await getClaims();
  const completed = selectCompletedClaims(claims, adjusterId);
  const hydrated = completed.slice(0, MAX_HISTORY_DETAIL_FETCHES);

  const details = await Promise.all(
    hydrated.map((claim) => getClaimById(claim.id).catch(() => null)),
  );

  return {
    entries: hydrated.map((claim, index) =>
      toWorkHistoryEntry(claim, details[index], adjusterId),
    ),
    totalCompleted: completed.length,
    truncated: completed.length > hydrated.length,
  };
}
