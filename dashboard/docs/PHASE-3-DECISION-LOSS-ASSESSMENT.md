# Phase 3: Decision & Loss Assessment - Implementation Report

## Overview
Enhanced the claim decision workflow with comprehensive loss assessment and financial calculation capabilities. The UI is complete and ready to submit loss assessment data to the Backend when the API is updated.

**Status:** ✅ Complete (UI Ready - Backend API Update Pending)

---

## What Was Built

### 1. Enhanced Decision API Service
**File:** `src/api/claims.decision.ts`

**Changes:**
- Added `DecideClaimPayload` interface to support loss assessment data
- Updated `decideClaim()` function with dual signature (backwards compatible)
- Supports both legacy format `(claimId, decision, notes?)` and new format `(claimId, payload)`

**New Payload Structure:**
```typescript
interface DecideClaimPayload {
  decision: "APPROVED" | "REJECTED";
  notes?: string;
  lossAssessment?: {
    estimatedPartsCost: number;
    laborCost: number;
    deductibleApplied: number;
    deductibleOverrideReason?: string;
  };
}
```

---

### 2. DecisionDialog Component
**File:** `src/components/claim-details/DecisionDialog.tsx`

**Features:**
- **Modal-based decision form** replacing simple confirmation dialogs
- **Loss Assessment Form** (approval only):
  - Estimated parts cost input
  - Labor cost input
  - Deductible amount input (pre-filled from coverage snapshot)
  - Deductible override reason (conditional - appears when deductible is changed)
- **Real-time calculation preview:**
  - Total damage = Parts + Labor
  - Amount after deductible = Total - Deductible
  - All amounts formatted in Arabic with currency (ريال)
- **Form validation:**
  - Required fields for approval: parts cost, labor cost, deductible
  - Conditional requirement: override reason when deductible is modified
  - Recommended (but not required): rejection notes
- **Visual feedback:**
  - Icons for each field (Wrench, DollarSign, MinusCircle, AlertTriangle)
  - Warning banner for rejections
  - Calculation preview panel with color-coded totals
  - Override warning when deductible differs from policy

**UX Flow:**
1. Admin clicks "Approve" or "Reject"
2. Dialog opens with appropriate form
3. For approval: fill in loss assessment + optional notes
4. For rejection: add rejection notes (recommended)
5. Preview calculations before submitting
6. Confirm → API call → Success toast → Refresh claim

---

### 3. Enhanced DecisionSection (Read-Only Display)
**File:** `src/components/claim-details/sections/DecisionSection.tsx`

**Changes:**
- Added display for approved claims with loss assessment
- Shows financial breakdown:
  - Parts cost
  - Labor cost
  - Total damage
  - Deductible applied
  - Final payable amount
- Highlights deductible overrides with warning banner
- Icons for visual clarity (same as DecisionDialog for consistency)
- RTL-friendly layout

**Display Logic:**
- If `status === "APPROVED"` and `lossAssessment` exists → show financial breakdown
- If `status === "REJECTED"` → show rejection with notes
- If no decision yet → show action buttons (if `canDecide === true`)

---

### 4. ClaimDetails Page Update
**File:** `src/pages/ClaimDetails.tsx`

**Changes:**
- Replaced simple `ConfirmDialog` with `DecisionDialog`
- Updated `handleDecide()` to accept `DecideClaimPayload` instead of simple decision string
- Passes full `claim` object to DecisionDialog for coverage snapshot access

---

## Technical Details

### Backwards Compatibility
✅ **100% backwards compatible**
- Old API calls `decideClaim(id, "APPROVED", "notes")` still work
- New API calls `decideClaim(id, { decision: "APPROVED", lossAssessment: {...} })` supported
- Backend can ignore `lossAssessment` field until ready
- Frontend conditionally renders loss assessment display (only if data exists)

### Form Validation Rules

| Field | Rule | Message |
|-------|------|---------|
| estimatedPartsCost | Required for approval, >= 0 | "يجب إدخال تكلفة القطع" |
| laborCost | Required for approval, >= 0 | "يجب إدخال تكلفة العمالة" |
| deductibleApplied | Required for approval, >= 0 | "يجب إدخال التحمل" |
| deductibleOverrideReason | Required IF deductible ≠ policy default | "يجب توضيح سبب تغيير التحمل" |
| notes (rejection) | Recommended (warning, not error) | "يُفضّل كتابة سبب الرفض" |

### Calculation Logic
```typescript
totalDamage = estimatedPartsCost + laborCost
amountAfterDeductible = Math.max(0, totalDamage - deductibleApplied)

isDeductibleOverridden = 
  deductibleApplied !== coverageSnapshot.deductibleAmount
  && coverageSnapshot.deductibleAmount > 0
```

### Pre-fill Behavior
- When dialog opens for **approval** and `claim.coverageSnapshot` exists:
  - Deductible input is pre-filled with `coverageSnapshot.deductibleAmount`
  - User can modify it (triggers override reason requirement)

---

## What Backend Needs to Implement

### 1. Update Decision Endpoint
**Endpoint:** `POST /api/v1/claims/:claimId/decision`

**Current Request:**
```json
{
  "decision": "APPROVED",
  "notes": "Optional notes"
}
```

**Enhanced Request (NEW):**
```json
{
  "decision": "APPROVED",
  "notes": "Optional notes",
  "lossAssessment": {
    "estimatedPartsCost": 5000.00,
    "laborCost": 2000.00,
    "deductibleApplied": 500.00,
    "deductibleOverrideReason": "Reason if deductible was modified"
  }
}
```

**Validation Rules (Backend):**
- If `decision === "APPROVED"` → `lossAssessment` should be **required** (or warning)
- If `decision === "REJECTED"` → `lossAssessment` should be **ignored**
- All financial values must be >= 0
- If `deductibleApplied` differs from policy's `deductibleAmount`:
  - `deductibleOverrideReason` must be present
  - Log the override for audit trail

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "APPROVED",
    "lossAssessment": {
      "estimatedPartsCost": 5000.00,
      "laborCost": 2000.00,
      "deductibleApplied": 500.00,
      "deductibleOverrideReason": "VIP customer discount",
      "totalDamage": 7000.00,
      "payableAmount": 6500.00
    }
  }
}
```

### 2. Include Loss Assessment in Claim Details
**Endpoint:** `GET /api/v1/claims/:claimId`

**Enhanced Response:**
```json
{
  "id": "clm-123",
  "claimNumber": "CLM-2026-0001",
  "status": "APPROVED",
  ...
  "lossAssessment": {
    "estimatedPartsCost": 5000.00,
    "laborCost": 2000.00,
    "deductibleApplied": 500.00,
    "deductibleOverrideReason": "VIP customer discount"
  }
}
```

**Rules:**
- Only include `lossAssessment` for **approved** claims
- Should be `null` or omitted for rejected/pending claims

---

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `src/api/claims.decision.ts` | Enhanced API with loss assessment support | ~50 |
| `src/api/claims.service.ts` | Export `DecideClaimPayload` type | 1 |
| `src/components/claim-details/DecisionDialog.tsx` | **NEW** - Full decision form with loss assessment | ~320 |
| `src/components/claim-details/sections/DecisionSection.tsx` | Display loss assessment for approved claims | ~80 |
| `src/pages/ClaimDetails.tsx` | Use DecisionDialog instead of ConfirmDialog | ~10 |

**Total:** ~460 lines added/modified

---

## Testing Checklist

### Manual Testing (When Backend is Ready)

#### Approval Flow:
- [ ] Open claim in UNDER_REVIEW status as Admin
- [ ] Click "Approve" button
- [ ] Verify DecisionDialog opens with loss assessment form
- [ ] Check deductible is pre-filled from coverage snapshot
- [ ] Try submitting with empty fields → validation errors appear
- [ ] Fill in parts cost, labor cost, keep default deductible
- [ ] Verify calculation preview updates in real-time
- [ ] Add optional notes
- [ ] Submit → claim status changes to APPROVED
- [ ] Refresh page → verify loss assessment displays in DecisionSection

#### Deductible Override Flow:
- [ ] Open approval dialog
- [ ] Change deductible from default (e.g., 500 → 300)
- [ ] Verify "Override Reason" field appears
- [ ] Try submitting without reason → validation error
- [ ] Add override reason → submit succeeds
- [ ] Verify override warning shows in DecisionSection

#### Rejection Flow:
- [ ] Open claim in UNDER_REVIEW status as Admin
- [ ] Click "Reject" button
- [ ] Verify DecisionDialog shows warning banner
- [ ] Verify loss assessment form is hidden
- [ ] Leave notes empty → warning (not error) appears
- [ ] Add rejection notes → submit succeeds
- [ ] Verify claim status changes to REJECTED
- [ ] Verify no loss assessment displays (because rejected)

#### Edge Cases:
- [ ] Claim without coverage snapshot → approval still works (deductible not pre-filled)
- [ ] Very large amounts (9999999.99) → formats correctly
- [ ] Zero deductible → no override warning
- [ ] Arabic text in notes → displays correctly (RTL)
- [ ] Cancel dialog → form resets when reopened

---

## Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Types | ✅ Complete | `LossAssessment` interface defined |
| API Service | ✅ Complete | Backwards compatible, ready for new payload |
| Decision Form | ✅ Complete | Full validation, calculation preview |
| Display Section | ✅ Complete | Shows financial breakdown when data exists |
| Backend Endpoint | ⏳ Pending | Needs to accept `lossAssessment` in decision payload |
| Backend Storage | ⏳ Pending | Needs to persist `lossAssessment` in database |
| Backend Response | ⏳ Pending | Needs to return `lossAssessment` in GET /claims/:id |

---

## Demo Screenshots (Expected Behavior)

### Approval Dialog:
```
╔═══════════════════════════════════════╗
║ ✓ قبول المطالبة                       ║
╠═══════════════════════════════════════╣
║ $ تقييم الخسارة المالية               ║
║                                       ║
║ 🔧 تكلفة القطع المقدّرة (ريال) *      ║
║ [5000.00__________________]           ║
║                                       ║
║ $ تكلفة العمالة (ريال) *              ║
║ [2000.00__________________]           ║
║                                       ║
║ ⊖ التحمّل المطبّق (ريال) *            ║
║ [500.00___________________]           ║
║ التحمل الافتراضي من البوليصة: 500.00  ║
║                                       ║
║ ┌─────────────────────────────┐       ║
║ │ معاينة الحساب               │       ║
║ │ تكلفة القطع:     5000.00 ريال│       ║
║ │ تكلفة العمالة:   2000.00 ريال│       ║
║ │ ─────────────────────────   │       ║
║ │ إجمالي الضرر:    7000.00 ريال│       ║
║ │ التحمل:        - 500.00 ريال │       ║
║ │ ═════════════════════════   │       ║
║ │ المبلغ المستحق:  6500.00 ريال│       ║
║ └─────────────────────────────┘       ║
║                                       ║
║ ملاحظات القرار                        ║
║ [____________________________]        ║
║                                       ║
║           [إلغاء]  [قبول المطالبة]    ║
╚═══════════════════════════════════════╝
```

### Approved Claim Display:
```
╔═══════════════════════════════════════╗
║ Decision / Closing                    ║
╠═══════════════════════════════════════╣
║ ✓ تم قبول المطالبة.                   ║
║                                       ║
║ $ تقييم الخسارة المالية               ║
║ 🔧 تكلفة القطع:        5000.00 ريال   ║
║ $ تكلفة العمالة:       2000.00 ريال   ║
║ ─────────────────────────────────     ║
║ إجمالي الضرر:          7000.00 ريال   ║
║ ⊖ التحمل:            - 500.00 ريال    ║
║ ═════════════════════════════════     ║
║ المبلغ المستحق:        6500.00 ريال   ║
╚═══════════════════════════════════════╝
```

---

## Next Steps

1. **Backend Team:**
   - Update `POST /claims/:id/decision` to accept `lossAssessment`
   - Store `lossAssessment` in database for approved claims
   - Return `lossAssessment` in `GET /claims/:id` response
   - Add validation: require loss assessment for approvals

2. **Testing:**
   - Once Backend is deployed, test all flows in this document
   - Verify backwards compatibility (old decision calls still work)
   - Test edge cases (very large amounts, zero deductible, etc.)

3. **Phase 4:**
   - Build public tracking page (customer self-service)
   - Use `trackingToken` and `trackingUrl` from claim response

---

## Summary

Phase 3 is **complete and ready**. The UI provides:
- ✅ Professional decision form with financial assessment
- ✅ Real-time calculation preview
- ✅ Comprehensive validation
- ✅ Deductible override tracking
- ✅ Beautiful, RTL-friendly design
- ✅ Backwards compatible with existing API

**The frontend is waiting for the Backend to accept and store loss assessment data.**

Once the Backend endpoint is updated, the feature will work end-to-end without any additional frontend changes! 🚀
