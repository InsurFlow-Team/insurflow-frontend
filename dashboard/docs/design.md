# InsurFlow — Claims Queue Dashboard Design

## 1. Purpose

Design a professional B2B SaaS dashboard page for managing
vehicle insurance claims.

The page represents the Claims Queue / Claims Triage workflow
inside the existing InsurFlow application.

The existing product name MUST remain:

InsurFlow

Do not rename the product to ClaimCore RMS.

---

## 2. Design Direction

Style:

- Enterprise SaaS
- B2B
- Insurance / Fintech
- Professional
- Clean
- Modern
- Information-dense but organized
- Minimal decoration
- Strong visual hierarchy
- Comfortable spacing
- LTR layout

The interface should feel appropriate for a serious insurance
operations environment.

---

## 3. Sidebar

- Fixed width approximately 280px.
- White background.
- Subtle right border.
- Product header:
  - Shield icon inside dark navy rounded square.
  - Product name: "InsurFlow"
  - Subtitle: "ENTERPRISE OPERATIONS"

- Primary action:
  - "+ New Claim Entry"
  - Full-width primary button.
  - Navy background.
  - White text.
  - Rounded corners.

Navigation:

- Overview
- Claims Queue
- Field Adjusters
- Inspection Tasks
- Audit Log
- Settings

Claims Queue is the active navigation item.

Active state:

- Light blue background.
- Blue/navy text.
- Thin blue indicator on the left.
- Notification badge "12".

Below navigation:

- Divider.
- Support Desk
- Compliance Policies

Bottom system status:

- Green status dot.
- "RMS Engine v4.2"
- "US-EAST" light gray badge.

---

## 4. Top Bar

White background with subtle bottom border.

Left:

Breadcrumb:

Operations > Claims Queue

- Operations: secondary gray text.
- Claims Queue: bold dark text.

Center:

Search field:

"Search claims, VIN, policy..."

Include:

- Search icon.
- Keyboard shortcut "⌘K".

Preview State:

- Normal
- Loading
- Empty
- Error

Normal is selected.

Additional controls:

- Export Log
- Notifications icon
- Help icon

Right:

User profile:

- Avatar with "SJ"
- Sarah Jenkins
- Claims Officer
- Dropdown indicator

---

## 5. Page Header

Title:

Claims Triage & Directory

Description:

Review submitted claims, monitor assessment lifecycle,
and assign field adjusters.

Actions:

Secondary:
"View Preferences"

Primary:
"+ New Claim"

---

## 6. Statistics

Display four statistic cards.

### Total Claims

Value: 128

Badge: +4.2%

Description:
Active portfolio records

Icon:
Folder

Accent:
Blue

### Draft Claims

Value: 14

Badge:
10.9%

Description:
Awaiting customer submission

Icon:
Pen

### Submitted Claims

Value: 42

Badge:
High Triage

Description:
Ready for initial review

Icon:
Inbox

### Pending Review

Value: 19

Badge:
Escalated

Description:
Requires inspection or sign-off

Icon:
Alert/clock

Accent:
Orange

---

## 7. Filters

White filter card.

First row:

- Search:
  "Filter by Claim ID or Customer..."

- Status:
  "All Statuses"

- Date:
  "Last 30 Days"

- Result count:
  "Showing 6 of 128 claims"

- View/sort control

Second row:

Filter chip:

"Assignment: All Adjusters"

Reset action:

"Reset Filters"

---

## 8. Claims Table

Columns:

1. CLAIM NUMBER
2. CUSTOMER & POLICY ID
3. VEHICLE INFORMATION
4. STATUS
5. CREATED DATE
6. UPDATED DATE
7. ACTIONS

Rows:

### Claim 1

Claim:
CLM-2024-9104

Customer:
Arthur Pendelton

Policy:
POL-88210

Vehicle:
2022 Toyota Camry

VIN:
4T1B11HK5NU...

Status:
SUBMITTED

Created:
Oct 24, 2024

Updated:
2 hrs ago

Action:
Review Claim

---

### Claim 2

Claim:
CLM-2024-8931

Customer:
Rebecca Sterling

Policy:
POL-41902

Vehicle:
2020 Honda Accord

VIN:
1HG7CV1F4LA...

Status:
UNDER_REVIEW

Created:
Oct 22, 2024

Updated:
Oct 23, 2024

Action:
View Details

---

### Claim 3

Claim:
CLM-2024-8840

Customer:
Marcus Brody

Policy:
POL-10923

Vehicle information:

"Vehicle information unavailable"

Show this as a subtle dashed placeholder box.

Status:
SUBMITTED

Created:
Oct 21, 2024

Updated:
Oct 21, 2024

Action:
Review Claim

---

### Claim 4

Claim:
CLM-2024-8705

Customer:
Elena Rostova

Policy:
POL-33918

Vehicle:
2023 Ford F-150 Lightning

VIN:
1FT6W1EV5PW...

Status:
CLOSED

Created:
Oct 18, 2024

Updated:
Oct 20, 2024

Action:
Archive / Log

---

### Claim 5

Claim:
CLM-2024-8622

Customer:
David Vance

Policy:
POL-55012

Vehicle:
2019 Tesla Model 3

VIN:
5YJ3E1EA7KF...

Status:
UNDER_REVIEW

Created:
Oct 17, 2024

Updated:
Oct 19, 2024

Action:
View Details

---

### Claim 6

Claim:
CLM-2024-8501

Customer:
Carlos Mendez

Policy:
POL-90124

Vehicle:
2021 Chevrolet Silverado

VIN:
1GCUYDED9MZ...

Status:
CLOSED

Created:
Oct 12, 2024

Updated:
Oct 15, 2024

Action:
Archive / Log

---

## 9. Table Footer

Left:

Rows per page:
25

Showing:
1–6 of 128 claims

Right:

First page
Previous
1
2
3
...
13
Next
Last page

Current page uses the primary navy color.

---

## 10. Color System

Primary Navy:
#1E3A8A

Selected Light Blue:
#EFF6FF

Success:
#16A34A

Warning:
#D97706

Secondary Text:
#6B7280

Borders:
#E5E7EB

Page Background:
#F5F6F8

Card Background:
#FFFFFF

---

## 11. Typography

Use a modern sans-serif font:

- Inter
- SF Pro
- System UI

Hierarchy:

Page title:
Large / bold

Section titles:
Semi-bold

Body:
Regular

Secondary information:
Smaller gray text

---

## 12. Components & Styling

Cards:

- 8–12px radius
- White background
- Subtle border
- Very soft shadow

Buttons:

Primary:
- Navy background
- White text

Secondary:
- White background
- Gray border
- Dark text

Inputs:

- White/light background
- Gray border
- Navy focus state

Badges:

Use compact rounded/pill styling.

Status colors should communicate:

SUBMITTED:
Blue

UNDER_REVIEW:
Orange

CLOSED:
Neutral gray

---

## 13. Interaction

Hover states should be subtle.

Use short transitions around:

150–200ms

Buttons:

- Primary hover becomes slightly darker.
- Secondary hover gets a light gray background.

Table rows:

- Subtle hover background.

Inputs:

- Clear focus state using the primary color.

Dropdowns:

- White background.
- Subtle border.
- Soft shadow.

---

## 14. Responsive Behavior

Desktop:

Use the full enterprise table layout.

Tablet:

Allow the content area to compress/reflow.

Mobile:

The table may transform into a card/list representation
when necessary.

Statistics should move from horizontal layout into a responsive grid.

Do not sacrifice usability merely to preserve the desktop table.

---

## 15. UX Principles

The page should prioritize:

1. Fast claim scanning.
2. Clear claim status.
3. Easy filtering.
4. Clear distinction between customer/policy/vehicle data.
5. Strong primary actions.
6. Minimal visual noise.
7. Consistent enterprise UI patterns.
8. Accessibility and readable contrast.

---

## 16. Important Implementation Notes

This document describes the intended UI/UX.

It does NOT authorize inventing:

- APIs
- backend endpoints
- database fields
- authentication rules
- permissions
- business rules
- routes

When an element requires functionality that does not currently
exist in the application, implementation should first verify
what exists in the codebase and ask for clarification rather than
inventing behavior.

Existing InsurFlow components and patterns should be reused where
appropriate.

The design should be adapted to the existing InsurFlow architecture
rather than replacing the application's architecture.