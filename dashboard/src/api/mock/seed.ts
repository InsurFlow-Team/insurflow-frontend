import type {
  Availability,
  ClaimStatus,
  Role,
  UserStatus,
} from "../../types";

// LOCAL MOCK BACKEND — development only, never production.
//
// Inert unless VITE_USE_MOCK_API=true is set in dashboard/.env (see client.ts).
// Serves auth + claims + users from localStorage so the app is usable while the
// real backend tunnel is down. The shapes below intentionally mirror the LIVE
// backend contract documented in .opencode/handoffs/backend-handoffs.md —
// including Mongo `_id` keys — so the app's normalizers are exercised for real.
//
// RISK, stated plainly: any field here that disagrees with the live backend is a
// lie the UI will believe. Re-verify against the real server before trusting
// anything built on top of this.

export interface MockUser {
  _id: string;
  name: string;
  employeeCode: string;
  password: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  status: UserStatus;
  availability: Availability;
  capacityLimit: number | null;
  location: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  } | null;
}

export interface MockTimelineItem {
  action: string;
  previousStatus: ClaimStatus | null;
  newStatus: ClaimStatus | null;
  notes: string | null;
  performedBy: { _id: string; name: string } | null;
  role: string;
  timestamp: string;
}

export interface MockClaim {
  _id: string;
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  customerName: string;
  initialPlateNumber: string;
  createdAt: string;
  updatedAt: string;
  incidentType: string;
  incidentLocation: string;
  incidentCoordinates: {
    latitude: number;
    longitude: number;
    capturedAt: string;
  } | null;
  assignedTo: {
    _id: string;
    name: string;
    employeeCode: string;
    role: string;
  } | null;
  lastDecline: {
    reason: string;
    adjusterName: string;
    declinedAt: string;
  } | null;
  customer: { name: string; phone: string };
  vehicle: {
    plateNumber: string;
    make: string;
    model: string;
    year: number;
    color: string;
  };
  policy: {
    id: string;
    policyNumber: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    startDate: string;
    expiryDate: string;
  };
  assignment: {
    assignedTo: { _id: string; name: string } | null;
    assignedBy: { _id: string; name: string } | null;
    assignedAt: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
    assignmentNotes: string | null;
  };
  accident: {
    accidentType: string;
    accidentDate: string;
    accidentTime: string;
    description: string;
    damageDescription: string | null;
  } | null;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    capturedAt: string;
  } | null;
  evidence: Array<{
    imageType: string;
    url: string;
    uploadedBy: { _id: string; name: string } | null;
    uploadedAt: string;
  }>;
  signature: {
    url: string;
    capturedBy: string;
    capturedAt: string;
  } | null;
  decisionNotes: string | null;
  closedBy: string | null;
  closedAt: string | null;
  closingNotes: string | null;
  timeline: MockTimelineItem[];
  createdBy: { _id: string; name: string } | null;
}

export const MOCK_ORGANIZATION = {
  id: "org-masar-001",
  name: "شركة المسار للتأمين",
  code: "MASAR",
};

export const MOCK_OFFICER = { _id: "usr-officer-001", name: "ليان حمدان" };

export const MOCK_SEED_USERS: MockUser[] = [
  {
    _id: "usr-admin-001",
    name: "مدير النظام",
    employeeCode: "admin",
    password: "Admin@123",
    role: "ADMIN",
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "AVAILABLE",
    capacityLimit: null,
    location: null,
  },
  {
    _id: "usr-officer-001",
    name: MOCK_OFFICER.name,
    employeeCode: "officer1",
    password: "Officer@123",
    role: "CLAIMS_OFFICER",
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "AVAILABLE",
    capacityLimit: null,
    location: null,
  },
  {
    _id: "usr-adj-001",
    name: "سامر الخطيب",
    employeeCode: "adjuster1",
    password: "Adjuster@123",
    role: "FIELD_ADJUSTER",
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "AVAILABLE",
    capacityLimit: 5,
    location: {
      latitude: 32.2211,
      longitude: 35.2544,
      updatedAt: "2026-09-28T08:15:00.000Z",
    },
  },
  {
    _id: "usr-adj-002",
    name: "أبو رائد",
    employeeCode: "adjuster2",
    password: "Adjuster@123",
    role: "FIELD_ADJUSTER",
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "AVAILABLE",
    capacityLimit: 4,
    location: {
      latitude: 31.9038,
      longitude: 35.2034,
      updatedAt: "2026-09-28T08:20:00.000Z",
    },
  },
  {
    _id: "usr-adj-003",
    name: "محمد أبو زهرة",
    employeeCode: "adjuster3",
    password: "Adjuster@123",
    role: "FIELD_ADJUSTER",
    organizationId: MOCK_ORGANIZATION.id,
    organizationName: MOCK_ORGANIZATION.name,
    status: "ACTIVE",
    availability: "UNAVAILABLE",
    capacityLimit: 3,
    location: {
      latitude: 31.5326,
      longitude: 35.095,
      updatedAt: "2026-09-28T08:05:00.000Z",
    },
  },
];

const OFFICER_REF = { _id: MOCK_OFFICER._id, name: MOCK_OFFICER.name };

export const MOCK_SEED_CLAIMS: MockClaim[] = [
  {
    _id: "clm-0001",
    id: "clm-0001",
    claimNumber: "CLM-2026-0001",
    status: "NEW",
    customerName: "أحمد سالم",
    initialPlateNumber: "1234-JY",
    createdAt: "2026-09-20T09:10:00.000Z",
    updatedAt: "2026-09-20T09:10:00.000Z",
    incidentType: "COLLISION",
    incidentLocation: "شارع الملك حسين، نابلس",
    incidentCoordinates: {
      latitude: 32.2225,
      longitude: 35.256,
      capturedAt: "2026-09-20T09:10:00.000Z",
    },
    assignedTo: null,
    lastDecline: null,
    customer: { name: "أحمد سالم", phone: "0591234567" },
    vehicle: {
      plateNumber: "1234-JY",
      make: "Toyota",
      model: "Corolla",
      year: 2021,
      color: "أبيض",
    },
    policy: {
      id: "pol-0001",
      policyNumber: "POL-2026-8891",
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
    accident: {
      accidentType: "REAR_END_COLLISION",
      accidentDate: "2026-09-20",
      accidentTime: "09:05",
      description: "اصطدام من الخلف عند إشارة المرور.",
      damageDescription: "تكسّر في الصدام الخلفي.",
    },
    location: {
      latitude: 32.2225,
      longitude: 35.256,
      address: "شارع الملك حسين، نابلس",
      capturedAt: "2026-09-20T09:10:00.000Z",
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
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-20T09:10:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
  {
    _id: "clm-0002",
    id: "clm-0002",
    claimNumber: "CLM-2026-0002",
    status: "ASSIGNED",
    customerName: "سميرة يوسف",
    initialPlateNumber: "5678-BT",
    createdAt: "2026-09-22T11:30:00.000Z",
    updatedAt: "2026-09-23T08:00:00.000Z",
    incidentType: "COLLISION",
    incidentLocation: "دوار النجمة، رام الله",
    incidentCoordinates: {
      latitude: 31.9045,
      longitude: 35.204,
      capturedAt: "2026-09-22T11:30:00.000Z",
    },
    assignedTo: {
      _id: "usr-adj-001",
      name: "سامر الخطيب",
      employeeCode: "adjuster1",
      role: "FIELD_ADJUSTER",
    },
    lastDecline: null,
    customer: { name: "سميرة يوسف", phone: "0597654321" },
    vehicle: {
      plateNumber: "5678-BT",
      make: "Hyundai",
      model: "Accent",
      year: 2019,
      color: "فضي",
    },
    policy: {
      id: "pol-0002",
      policyNumber: "POL-2026-8892",
      status: "ACTIVE",
      startDate: "2026-02-15",
      expiryDate: "2027-02-15",
    },
    assignment: {
      assignedTo: { _id: "usr-adj-001", name: "سامر الخطيب" },
      assignedBy: OFFICER_REF,
      assignedAt: "2026-09-23T08:00:00.000Z",
      priority: "MEDIUM",
      assignmentNotes: "أولوية متوسطة",
    },
    accident: {
      accidentType: "SIDE_IMPACT",
      accidentDate: "2026-09-22",
      accidentTime: "11:20",
      description: "اصطدام جانبي مع مركبة أخرى.",
      damageDescription: "ضرر في الباب الأيمن.",
    },
    location: {
      latitude: 31.9045,
      longitude: 35.204,
      address: "دوار النجمة، رام الله",
      capturedAt: "2026-09-22T11:30:00.000Z",
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
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-22T11:30:00.000Z",
      },
      {
        action: "ASSIGNED",
        previousStatus: "NEW",
        newStatus: "ASSIGNED",
        notes: "أولوية متوسطة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-23T08:00:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
  {
    _id: "clm-0003",
    id: "clm-0003",
    claimNumber: "CLM-2026-0003",
    status: "UNDER_REVIEW",
    customerName: "خالد نجار",
    initialPlateNumber: "9012-HM",
    createdAt: "2026-09-15T14:00:00.000Z",
    updatedAt: "2026-09-26T10:30:00.000Z",
    incidentType: "COLLISION",
    incidentLocation: "King Hussein Street, Bethlehem",
    incidentCoordinates: {
      latitude: 31.706,
      longitude: 35.203,
      capturedAt: "2026-09-15T14:00:00.000Z",
    },
    assignedTo: {
      _id: "usr-adj-002",
      name: "أبو رائد",
      employeeCode: "adjuster2",
      role: "FIELD_ADJUSTER",
    },
    lastDecline: null,
    customer: { name: "خالد نجار", phone: "0599112233" },
    vehicle: {
      plateNumber: "9012-HM",
      make: "Kia",
      model: "Rio",
      year: 2022,
      color: "أسود",
    },
    policy: {
      id: "pol-0003",
      policyNumber: "POL-2026-8893",
      status: "ACTIVE",
      startDate: "2026-03-01",
      expiryDate: "2027-03-01",
    },
    assignment: {
      assignedTo: { _id: "usr-adj-002", name: "أبو رائد" },
      assignedBy: OFFICER_REF,
      assignedAt: "2026-09-16T09:00:00.000Z",
      priority: "HIGH",
      assignmentNotes: "حالة عاجلة",
    },
    accident: {
      accidentType: "HEAD_ON",
      accidentDate: "2026-09-15",
      accidentTime: "13:50",
      description: "اصطدام أمامي.",
      damageDescription: "أضرار كبيرة في مقدمة السيارة.",
    },
    location: {
      latitude: 31.706,
      longitude: 35.203,
      address: "King Hussein Street, Bethlehem",
      capturedAt: "2026-09-15T14:00:00.000Z",
    },
    evidence: [
      {
        imageType: "DAMAGE_FRONT",
        url: "https://placehold.co/600x400?text=Damage+Front",
        uploadedBy: { _id: "usr-adj-002", name: "أبو رائد" },
        uploadedAt: "2026-09-24T12:00:00.000Z",
      },
      {
        imageType: "SCENE",
        url: "https://placehold.co/600x400?text=Scene",
        uploadedBy: { _id: "usr-adj-002", name: "أبو رائد" },
        uploadedAt: "2026-09-24T12:05:00.000Z",
      },
    ],
    signature: {
      url: "https://placehold.co/400x200?text=Signature",
      capturedBy: "أبو رائد",
      capturedAt: "2026-09-24T12:10:00.000Z",
    },
    decisionNotes: null,
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [
      {
        action: "CREATED",
        previousStatus: null,
        newStatus: "NEW",
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-15T14:00:00.000Z",
      },
      {
        action: "ASSIGNED",
        previousStatus: "NEW",
        newStatus: "ASSIGNED",
        notes: "حالة عاجلة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-16T09:00:00.000Z",
      },
      {
        action: "SUBMITTED",
        previousStatus: "IN_PROGRESS",
        newStatus: "UNDER_REVIEW",
        notes: "تم رفع تقرير المعاينة",
        performedBy: { _id: "usr-adj-002", name: "أبو رائد" },
        role: "FIELD_ADJUSTER",
        timestamp: "2026-09-26T10:30:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
  {
    _id: "clm-0004",
    id: "clm-0004",
    claimNumber: "CLM-2026-0004",
    status: "APPROVED",
    customerName: "منى حداد",
    initialPlateNumber: "3344-ZM",
    createdAt: "2026-09-02T08:45:00.000Z",
    updatedAt: "2026-09-25T15:00:00.000Z",
    incidentType: "THEFT",
    incidentLocation: "Jerusalem Street, Hebron",
    incidentCoordinates: {
      latitude: 31.5335,
      longitude: 35.096,
      capturedAt: "2026-09-02T08:45:00.000Z",
    },
    assignedTo: {
      _id: "usr-adj-003",
      name: "محمد أبو زهرة",
      employeeCode: "adjuster3",
      role: "FIELD_ADJUSTER",
    },
    lastDecline: null,
    customer: { name: "منى حداد", phone: "0593344556" },
    vehicle: {
      plateNumber: "3344-ZM",
      make: "Mazda",
      model: "3",
      year: 2018,
      color: "أحمر",
    },
    policy: {
      id: "pol-0004",
      policyNumber: "POL-2026-8894",
      status: "ACTIVE",
      startDate: "2026-04-10",
      expiryDate: "2027-04-10",
    },
    assignment: {
      assignedTo: { _id: "usr-adj-003", name: "محمد أبو زهرة" },
      assignedBy: OFFICER_REF,
      assignedAt: "2026-09-03T09:00:00.000Z",
      priority: "LOW",
      assignmentNotes: null,
    },
    accident: {
      accidentType: "THEFT",
      accidentDate: "2026-09-02",
      accidentTime: "08:30",
      description: "سرقة السيارة أثناء الوقوف.",
      damageDescription: null,
    },
    location: {
      latitude: 31.5335,
      longitude: 35.096,
      address: "Jerusalem Street, Hebron",
      capturedAt: "2026-09-02T08:45:00.000Z",
    },
    evidence: [],
    signature: null,
    decisionNotes: "تمت الموافقة على التعويض وفق تقرير المعاينة.",
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [
      {
        action: "CREATED",
        previousStatus: null,
        newStatus: "NEW",
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-02T08:45:00.000Z",
      },
      {
        action: "DECIDED",
        previousStatus: "UNDER_REVIEW",
        newStatus: "APPROVED",
        notes: "تمت الموافقة على التعويض",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-25T15:00:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
  {
    _id: "clm-0005",
    id: "clm-0005",
    claimNumber: "CLM-2026-0005",
    status: "REJECTED",
    customerName: "عمر شاهين",
    initialPlateNumber: "7788-ZQ",
    createdAt: "2026-08-28T13:20:00.000Z",
    updatedAt: "2026-09-19T10:00:00.000Z",
    incidentType: "THEFT",
    incidentLocation: "Nablus Street, Jenin",
    incidentCoordinates: {
      latitude: 32.4605,
      longitude: 35.3015,
      capturedAt: "2026-08-28T13:20:00.000Z",
    },
    assignedTo: {
      _id: "usr-adj-001",
      name: "سامر الخطيب",
      employeeCode: "adjuster1",
      role: "FIELD_ADJUSTER",
    },
    lastDecline: {
      reason: "السيارة مؤمَّنة ضد الحوادث فقط، والحادث كان سرقة.",
      adjusterName: "سامر الخطيب",
      declinedAt: "2026-09-10T09:00:00.000Z",
    },
    customer: { name: "عمر شاهين", phone: "0595566778" },
    vehicle: {
      plateNumber: "7788-ZQ",
      make: "Nissan",
      model: "Sunny",
      year: 2017,
      color: "رمادي",
    },
    policy: {
      id: "pol-0005",
      policyNumber: "POL-2026-8895",
      status: "ACTIVE",
      startDate: "2026-05-01",
      expiryDate: "2027-05-01",
    },
    assignment: {
      assignedTo: { _id: "usr-adj-001", name: "سامر الخطيب" },
      assignedBy: OFFICER_REF,
      assignedAt: "2026-08-29T09:00:00.000Z",
      priority: "MEDIUM",
      assignmentNotes: null,
    },
    accident: {
      accidentType: "THEFT",
      accidentDate: "2026-08-28",
      accidentTime: "13:00",
      description: "تم الإبلاغ عن سرقة.",
      damageDescription: null,
    },
    location: {
      latitude: 32.4605,
      longitude: 35.3015,
      address: "Nablus Street, Jenin",
      capturedAt: "2026-08-28T13:20:00.000Z",
    },
    evidence: [],
    signature: null,
    decisionNotes: "مرفوضة: لا يغطي هذا النوع من الحوادث.",
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [
      {
        action: "CREATED",
        previousStatus: null,
        newStatus: "NEW",
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-08-28T13:20:00.000Z",
      },
      {
        action: "DECLINED",
        previousStatus: "ASSIGNED",
        newStatus: "NEW",
        notes: "السيارة مؤمَّنة ضد الحوادث فقط",
        performedBy: { _id: "usr-adj-001", name: "سامر الخطيب" },
        role: "FIELD_ADJUSTER",
        timestamp: "2026-09-10T09:00:00.000Z",
      },
      {
        action: "DECIDED",
        previousStatus: "UNDER_REVIEW",
        newStatus: "REJECTED",
        notes: "مرفوضة: لا يغطي هذا النوع من الحوادث.",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-09-19T10:00:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
  {
    _id: "clm-0006",
    id: "clm-0006",
    claimNumber: "CLM-2026-0006",
    status: "CLOSED",
    customerName: "رانيا عبد الله",
    initialPlateNumber: "1122-AS",
    createdAt: "2026-07-14T10:00:00.000Z",
    updatedAt: "2026-08-30T16:20:00.000Z",
    incidentType: "COLLISION",
    incidentLocation: "Al-Quds Street, Ramallah",
    incidentCoordinates: {
      latitude: 31.9021,
      longitude: 35.2012,
      capturedAt: "2026-07-14T10:00:00.000Z",
    },
    assignedTo: {
      _id: "usr-adj-002",
      name: "أبو رائد",
      employeeCode: "adjuster2",
      role: "FIELD_ADJUSTER",
    },
    lastDecline: null,
    customer: { name: "رانيا عبد الله", phone: "0591122334" },
    vehicle: {
      plateNumber: "1122-AS",
      make: "Volkswagen",
      model: "Polo",
      year: 2020,
      color: "أزرق",
    },
    policy: {
      id: "pol-0006",
      policyNumber: "POL-2026-8896",
      status: "ACTIVE",
      startDate: "2026-01-20",
      expiryDate: "2027-01-20",
    },
    assignment: {
      assignedTo: { _id: "usr-adj-002", name: "أبو رائد" },
      assignedBy: OFFICER_REF,
      assignedAt: "2026-07-15T09:00:00.000Z",
      priority: "LOW",
      assignmentNotes: null,
    },
    accident: {
      accidentType: "REAR_END_COLLISION",
      accidentDate: "2026-07-14",
      accidentTime: "09:50",
      description: "اصطدام من الخلف.",
      damageDescription: "ضرر طفيف.",
    },
    location: {
      latitude: 31.9021,
      longitude: 35.2012,
      address: "Al-Quds Street, Ramallah",
      capturedAt: "2026-07-14T10:00:00.000Z",
    },
    evidence: [],
    signature: null,
    decisionNotes: "تمت الموافقة.",
    closedBy: "ليان حمدان",
    closedAt: "2026-08-30T16:20:00.000Z",
    closingNotes: "تم تسليم التعويض للعميل.",
    timeline: [
      {
        action: "CREATED",
        previousStatus: null,
        newStatus: "NEW",
        notes: "تم إنشاء المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-07-14T10:00:00.000Z",
      },
      {
        action: "CLOSED",
        previousStatus: "APPROVED",
        newStatus: "CLOSED",
        notes: "تم إغلاق المطالبة",
        performedBy: OFFICER_REF,
        role: "CLAIMS_OFFICER",
        timestamp: "2026-08-30T16:20:00.000Z",
      },
    ],
    createdBy: OFFICER_REF,
  },
];