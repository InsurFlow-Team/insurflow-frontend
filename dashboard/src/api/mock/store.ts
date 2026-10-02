import type { MockClaim, MockUser } from "./seed";
import { MOCK_SEED_CLAIMS, MOCK_SEED_USERS } from "./seed";

// Persists the mock database in localStorage so a page reload keeps whatever
// the user created/assigned/decided, which is the whole point of not hitting the
// dead tunnel. A single versioned key means the seed can be regenerated whenever
// its shape changes, and RESET_MOCK_DATA clears it from the console.

const STORAGE_KEY = "insurflow_mock_db_v1";

export interface MockDb {
  users: MockUser[];
  claims: MockClaim[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedDb(): MockDb {
  return {
    users: clone(MOCK_SEED_USERS),
    claims: clone(MOCK_SEED_CLAIMS),
  };
}

export function readMockDb(): MockDb {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as MockDb;

      if (Array.isArray(parsed.users) && Array.isArray(parsed.claims)) {
        return parsed;
      }
    }
  } catch {
    // Corrupted or unavailable storage falls through to a fresh seed.
  }

  const fresh = seedDb();
  writeMockDb(fresh);

  return fresh;
}

export function writeMockDb(db: MockDb): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Private-mode / quota failures degrade to in-memory only for this page.
  }
}

export function resetMockDb(): MockDb {
  const fresh = seedDb();
  writeMockDb(fresh);

  return fresh;
}

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).RESET_MOCK_DATA = resetMockDb;
}