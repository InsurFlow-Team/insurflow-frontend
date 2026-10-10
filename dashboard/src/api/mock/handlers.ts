import type { MockClaim, MockUser } from "./seed";
import { MOCK_ORGANIZATION } from "./seed";
import { readMockDb, writeMockDb } from "./store";
import type { MockDb } from "./store";

// Route handlers for the local mock backend. Each handler mirrors the live
// endpoint's envelope, status codes and error codes so client-side error
// handling (getApiErrorMessage, the 401 interceptor) behaves identically.

export class MockApiError extends Error {
  status: number;
  errors?: Array<{ code?: string; details?: string }>;

  constructor(
    status: number,
    message: string,
    errors?: Array<{ code?: string; details?: string }>,
  ) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface MockRequest {
  method: string;
  path: string;
  params: Record<string, unknown>;
  body: Record<string, unknown> | undefined;
}

export interface MockResponse {
  status: number;
  message: string;
  data: unknown;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function requireAuth(db: MockDb): MockUser {
  const token = asString(window.localStorage.getItem("insurflow_access_token"));

  const user = db.users.find(
    (candidate) => token === `mock-token-${candidate._id}`,
  );

  if (!user) {
    throw new MockApiError(401, "Authentication required", [
      { code: "UNAUTHORIZED" },
    ]);
  }

  return user;
}

function toSummary(claim: MockClaim) {
  return {
    _id: claim._id,
    id: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    customerName: claim.customerName,
    initialPlateNumber: claim.initialPlateNumber,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
    incidentCoordinates: claim.incidentCoordinates,
    assignedTo: claim.assignedTo,
    lastDecline: claim.lastDecline,
  };
}

const ACTIVE_CLAIM_STATUSES = new Set(["ASSIGNED", "IN_PROGRESS"]);

export function activeTasksFor(db: MockDb, adjusterId: string): number {
  return db.claims.filter(
    (claim) =>
      claim.assignedTo?._id === adjusterId && ACTIVE_CLAIM_STATUSES.has(claim.status),
  ).length;
}

function handleLogin(db: MockDb, request: MockRequest): MockResponse {
  const body = request.body ?? {};
  const organizationCode = asString(body.organizationCode);
  const employeeCode = asString(body.employeeCode);
  const password = asString(body.password);

  if (organizationCode !== MOCK_ORGANIZATION.code) {
    throw new MockApiError(401, "Invalid credentials", [
      { code: "INVALID_CREDENTIALS" },
    ]);
  }

  const user = db.users.find((candidate) => candidate.employeeCode === employeeCode);

  if (!user || user.password !== password) {
    throw new MockApiError(401, "Invalid credentials", [
      { code: "INVALID_CREDENTIALS" },
    ]);
  }

  return {
    status: 200,
    message: "Login successful",
    data: {
      accessToken: `mock-token-${user._id}`,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        employeeCode: user.employeeCode,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        status: user.status,
      },
    },
  };
}

function handleChangePassword(db: MockDb, request: MockRequest): MockResponse {
  const current = requireAuth(db);
  const currentPassword = asString(request.body?.currentPassword);
  const newPassword = asString(request.body?.newPassword);

  if (currentPassword !== current.password) {
    // Must be INVALID_CREDENTIALS: the 401 interceptor uses this code to keep
    // the session alive when only the CURRENT password was wrong.
    throw new MockApiError(401, "Current password is incorrect", [
      { code: "INVALID_CREDENTIALS" },
    ]);
  }

  if (newPassword.length < 8) {
    throw new MockApiError(400, "New password is too short", [
      { code: "PASSWORD_TOO_SHORT", details: "Minimum 8 characters" },
    ]);
  }

  current.password = newPassword;
  writeMockDb(db);

  return { status: 200, message: "Password changed successfully", data: {} };
}

function handleGetClaims(db: MockDb, request: MockRequest): MockResponse {
  requireAuth(db);

  const allowed = new Set(["status"]);

  for (const key of Object.keys(request.params)) {
    if (!allowed.has(key)) {
      throw new MockApiError(400, `Unsupported query parameter: ${key}`, [
        { code: "INVALID_QUERY_PARAMETER", details: key },
      ]);
    }
  }

  const status = asString(request.params.status);
  const rows = status
    ? db.claims.filter((claim) => claim.status === status)
    : db.claims;

  return {
    status: 200,
    message: "Claims retrieved successfully",
    data: rows.map(toSummary),
  };
}

function handleGetClaimById(db: MockDb, claimId: string): MockResponse {
  requireAuth(db);

  const claim = db.claims.find((candidate) => candidate._id === claimId);

  if (!claim) {
    throw new MockApiError(404, "Claim not found", [{ code: "CLAIM_NOT_FOUND" }]);
  }

  return { status: 200, message: "Claim retrieved successfully", data: claim };
}

function handleCreateClaim(db: MockDb, request: MockRequest): MockResponse {
  const actor = requireAuth(db);
  const body = request.body ?? {};

  const policyId = asString(body.policyId);
  const plateNumber = asString(body.plateNumber);

  if (!policyId || !plateNumber) {
    throw new MockApiError(400, "policyId and plateNumber are required", [
      { code: "VALIDATION_ERROR" },
    ]);
  }

  const latitude = typeof body.latitude === "number" ? body.latitude : null;
  const longitude = typeof body.longitude === "number" ? body.longitude : null;

  if (latitude === null || longitude === null) {
    throw new MockApiError(400, "Incident coordinates are required", [
      { code: "VALIDATION_ERROR" },
    ]);
  }

  const now = new Date().toISOString();
  const sequence = db.claims.length + 1;
  const id = `clm-mock-${String(sequence).padStart(4, "0")}`;

  const claim: MockClaim = {
    _id: id,
    id,
    claimNumber: `CLM-2026-${String(sequence).padStart(4, "0")}`,
    status: "NEW",
    customerName: "عميل تجريبي",
    initialPlateNumber: plateNumber,
    createdAt: now,
    updatedAt: now,
    incidentType: asString(body.incidentType),
    incidentLocation: asString(body.incidentLocation),
    incidentCoordinates: { latitude, longitude, capturedAt: now },
    assignedTo: null,
    lastDecline: null,
    customer: { name: "عميل تجريبي", phone: "0599000000" },
    vehicle: {
      plateNumber,
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      color: "أبيض",
    },
    policy: {
      id: policyId,
      policyNumber: "POL-MOCK",
      status: "ACTIVE",
      startDate: "2026-01-01",
      expiryDate: "2027-01-01",
    },
    assignment: {
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      priority: null,
      assignmentNotes: null,
    },
    accident: null,
    location: {
      latitude,
      longitude,
      address: asString(body.incidentLocation),
      capturedAt: now,
    },
    evidence: [],
    signature: null,
    decisionNotes: null,
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [
      {
        action: "CREATED",
        previousStatus: null,
        newStatus: "NEW",
        notes: "تم إنشاء المطالبة (بيانات تجريبية)",
        performedBy: { _id: actor._id, name: actor.name },
        role: actor.role,
        timestamp: now,
      },
    ],
    createdBy: { _id: actor._id, name: actor.name },
  };

  db.claims.unshift(claim);
  writeMockDb(db);

  return { status: 201, message: "Claim created successfully", data: claim };
}

function handleAssignClaim(
  db: MockDb,
  claimId: string,
  request: MockRequest,
): MockResponse {
  const actor = requireAuth(db);
  const body = request.body ?? {};

  const claim = db.claims.find((candidate) => candidate._id === claimId);

  if (!claim) {
    throw new MockApiError(404, "Claim not found", [{ code: "CLAIM_NOT_FOUND" }]);
  }

  const adjuster = db.users.find(
    (candidate) => candidate._id === asString(body.adjusterId),
  );

  if (!adjuster || adjuster.role !== "FIELD_ADJUSTER") {
    throw new MockApiError(404, "Field adjuster not found", [
      { code: "ADJUSTER_NOT_FOUND" },
    ]);
  }

  const priority = asString(body.priority) as MockClaim["assignment"]["priority"];
  const now = new Date().toISOString();

  const capacity = adjuster.capacityLimit;
  const active = activeTasksFor(db, adjuster._id);
  const overrideCapacity = body.overrideCapacity === true;

  if (capacity !== null && active >= capacity && !overrideCapacity) {
    throw new MockApiError(409, "Adjuster is at capacity", [
      { code: "ADJUSTER_AT_CAPACITY", details: `${active}/${capacity}` },
    ]);
  }

  claim.status = "PENDING_ACCEPTANCE";
  claim.updatedAt = now;
  claim.assignedTo = {
    _id: adjuster._id,
    name: adjuster.name,
    employeeCode: adjuster.employeeCode,
    role: adjuster.role,
  };
  claim.assignment = {
    assignedTo: { _id: adjuster._id, name: adjuster.name },
    assignedBy: { _id: actor._id, name: actor.name },
    assignedAt: now,
    priority,
    assignmentNotes: asString(body.notes) || null,
  };
  claim.timeline.push({
    action: "Assignment Pending Acceptance",
    previousStatus: "NEW",
    newStatus: "PENDING_ACCEPTANCE",
    notes: claim.assignment.assignmentNotes,
    performedBy: { _id: actor._id, name: actor.name },
    role: actor.role,
    timestamp: now,
  });

  writeMockDb(db);

  return {
    status: 200,
    message: "Claim assigned successfully",
    data: {
      id: claim.id,
      claimNumber: claim.claimNumber,
      status: claim.status,
      priority: priority ?? "MEDIUM",
      assignedTo: adjuster._id,
      assignedBy: actor._id,
      assignedAt: now,
    },
  };
}

function handleDecision(
  db: MockDb,
  claimId: string,
  request: MockRequest,
): MockResponse {
  const actor = requireAuth(db);
  const body = request.body ?? {};

  const claim = db.claims.find((candidate) => candidate._id === claimId);

  if (!claim) {
    throw new MockApiError(404, "Claim not found", [{ code: "CLAIM_NOT_FOUND" }]);
  }

  const decision = asString(body.decision);

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new MockApiError(400, "decision must be APPROVED or REJECTED", [
      { code: "INVALID_DECISION" },
    ]);
  }

  const now = new Date().toISOString();
  const previous = claim.status;

  claim.status = decision;
  claim.updatedAt = now;
  claim.decisionNotes = asString(body.notes) || null;
  claim.timeline.push({
    action: "DECIDED",
    previousStatus: previous,
    newStatus: decision,
    notes: claim.decisionNotes,
    performedBy: { _id: actor._id, name: actor.name },
    role: actor.role,
    timestamp: now,
  });

  writeMockDb(db);

  return {
    status: 200,
    message: "Claim decision recorded",
    data: { status: claim.status },
  };
}

function handleGetUsers(db: MockDb): MockResponse {
  requireAuth(db);

  return {
    status: 200,
    message: "Users retrieved successfully",
    data: db.users.map((user) => ({
      _id: user._id,
      id: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      status: user.status,
    })),
  };
}

function handleCreateUser(db: MockDb, request: MockRequest): MockResponse {
  requireAuth(db);
  const body = request.body ?? {};

  const name = asString(body.name);
  const employeeCode = asString(body.employeeCode);
  const password = asString(body.password);
  const role = asString(body.role);

  if (!name || !employeeCode || !password) {
    throw new MockApiError(400, "name, employeeCode and password are required", [
      { code: "VALIDATION_ERROR" },
    ]);
  }

  if (role !== "CLAIMS_OFFICER" && role !== "FIELD_ADJUSTER") {
    throw new MockApiError(400, "role must be CLAIMS_OFFICER or FIELD_ADJUSTER", [
      { code: "INVALID_ROLE" },
    ]);
  }

  if (db.users.some((candidate) => candidate.employeeCode === employeeCode)) {
    throw new MockApiError(409, "Employee code is already taken", [
      { code: "EMPLOYEE_CODE_TAKEN" },
    ]);
  }

  const user: MockUser = {
    _id: `usr-mock-${db.users.length + 1}`,
    name,
    employeeCode,
    password,
    role,
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "AVAILABLE",
    capacityLimit: role === "FIELD_ADJUSTER" ? 5 : null,
    location: null,
  };

  db.users.push(user);
  writeMockDb(db);

  return {
    status: 201,
    message: "User created successfully",
    data: {
      _id: user._id,
      id: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      status: user.status,
    },
  };
}

function handleGetAdjusters(db: MockDb, request: MockRequest): MockResponse {
  requireAuth(db);

  const claimId = asString(request.params.claimId);
  const reference = claimId
    ? db.claims.find((candidate) => candidate._id === claimId)
    : undefined;

  const adjusters = db.users.filter((user) => user.role === "FIELD_ADJUSTER");

  return {
    status: 200,
    message: "Field adjusters retrieved successfully",
    data: adjusters.map((user) => ({
      _id: user._id,
      id: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organizationName,
      status: user.status,
      availability: user.availability,
      capacityLimit: user.capacityLimit,
      activeTasksCount: activeTasksFor(db, user._id),
      location: user.location,
      distanceKm: reference?.incidentCoordinates ? 0 : null,
    })),
  };
}

function handleUpdateUserStatus(
  db: MockDb,
  userId: string,
  request: MockRequest,
): MockResponse {
  requireAuth(db);

  const user = db.users.find((candidate) => candidate._id === userId);

  if (!user) {
    throw new MockApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);
  }

  const status = asString(request.body?.status);

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    throw new MockApiError(400, "status must be ACTIVE or INACTIVE", [
      { code: "INVALID_STATUS" },
    ]);
  }

  user.status = status;
  writeMockDb(db);

  return { status: 200, message: "User status updated", data: {} };
}

function handleResetPassword(
  db: MockDb,
  userId: string,
  request: MockRequest,
): MockResponse {
  requireAuth(db);

  const user = db.users.find((candidate) => candidate._id === userId);

  if (!user) {
    throw new MockApiError(404, "User not found", [{ code: "USER_NOT_FOUND" }]);
  }

  const newPassword = asString(request.body?.newPassword);

  if (newPassword.length < 8) {
    throw new MockApiError(400, "New password is too short", [
      { code: "PASSWORD_TOO_SHORT", details: "Minimum 8 characters" },
    ]);
  }

  user.password = newPassword;
  writeMockDb(db);

  return { status: 200, message: "Password reset successfully", data: {} };
}

export function routeMockRequest(request: MockRequest): MockResponse {
  const db = readMockDb();
  const { method, path } = request;

  if (method === "POST" && path === "/auth/login") {
    return handleLogin(db, request);
  }

  if (method === "PUT" && path === "/auth/change-password") {
    return handleChangePassword(db, request);
  }

  if (method === "GET" && path === "/claims") {
    return handleGetClaims(db, request);
  }

  if (method === "POST" && path === "/claims") {
    return handleCreateClaim(db, request);
  }

  if (method === "GET" && path === "/users/adjusters") {
    return handleGetAdjusters(db, request);
  }

  if (method === "GET" && path === "/users") {
    return handleGetUsers(db);
  }

  if (method === "POST" && path === "/users") {
    return handleCreateUser(db, request);
  }

  const assignMatch = /^\/claims\/([^/]+)\/assign$/.exec(path);

  if (method === "POST" && assignMatch) {
    return handleAssignClaim(db, assignMatch[1], request);
  }

  const decisionMatch = /^\/claims\/([^/]+)\/decision$/.exec(path);

  if (method === "POST" && decisionMatch) {
    return handleDecision(db, decisionMatch[1], request);
  }

  const statusMatch = /^\/users\/([^/]+)\/status$/.exec(path);

  if (method === "PATCH" && statusMatch) {
    return handleUpdateUserStatus(db, statusMatch[1], request);
  }

  const passwordMatch = /^\/users\/([^/]+)\/reset-password$/.exec(path);

  if (method === "PATCH" && passwordMatch) {
    return handleResetPassword(db, passwordMatch[1], request);
  }

  const claimMatch = /^\/claims\/([^/]+)$/.exec(path);

  if (method === "GET" && claimMatch) {
    return handleGetClaimById(db, claimMatch[1]);
  }

  throw new MockApiError(
    404,
    `MOCK: no handler for ${method} ${path}. Only auth, claims and users are mocked — this request would hit the real backend.`,
    [{ code: "MOCK_ROUTE_NOT_FOUND" }],
  );
}