// Barrel: claim list filter primitives live in utils/claims.ts. Keep this file
// as the single import seam for components so consumer imports stay stable.

export {
  STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  ROWS_PER_PAGE_OPTIONS,
  getDateCutoff,
} from "../../utils/claims";

import type {
  ClaimStatusFilter,
  DateRangeFilter,
} from "../../utils/claims";

export type { ClaimStatusFilter, DateRangeFilter };

export interface StatusOption {
  label: string;
  value: ClaimStatusFilter;
}

export interface DateRangeOption {
  label: string;
  value: DateRangeFilter;
}