# 01 — Product Overview

## Product

**صون** (Soun) — منصة لإدارة مطالبات تأمين المركبات.

A digital platform for organizing motor insurance claims. The core idea:

> "من لحظة الحادث إلى إغلاق المطالبة. كل شيء في مسار واحد."

صون connects the insurance company, Claims Officer, and Field Adjuster through one clear and traceable claims workflow.

## Problem

When an accident occurs, the claims journey spans the customer, the insurance company, the Claims Officer, and the Field Adjuster. Each party needs different information, and coordination between them can become complex and slow. Data is scattered, follow-ups are repeated, and tracing what happened to a claim is difficult.

## Value Proposition

صون does not sell insurance. صون does not replace insurance companies. صون does not automatically make the final compensation decision.

صون organizes the claims operation and connects people, data, evidence, and actions into one traceable workflow.

## Users

- **شركات التأمين** — manage and follow the claim lifecycle from one place.
- **موظفو المطالبات** — manage claims, assignments, and review within a clear journey.
- **المعاينون الميدانيون** — receive tasks and document inspection and evidence from the field.
- **العميل** (beneficiary) — a clearer, more organized claims journey.

## Workflow

Public-facing workflow:

```
Policy Verification → Claim Creation → Dispatch → Field Inspection → Evidence → Review → Decision → Closure
```

Internal backend workflow:

```
NEW → PENDING_ACCEPTANCE → ASSIGNED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → APPROVED → CLOSED
```

Correction flow:

```
UNDER_REVIEW → CORRECTION_REQUIRED → SUBMITTED → UNDER_REVIEW
```

Backend enum names must not be exposed on the landing page. Use human-readable Arabic wording.

## Boundaries

The landing page must NOT claim:

- automatic fraud detection
- automatic claim approval / rejection
- guaranteed savings or percentage reductions
- guaranteed customer retention
- automatic adjuster assignment
- automatic decision making
- legal compliance certification
- insurance company partnerships
- customer logos, testimonials, awards
- pricing
- unconfirmed integrations
- statistics not provided
- ROI percentages

The map is a dispatch feature, not the main product. The core value is the connected end-to-end claims workflow.

## Positioning

The landing page is a business/product story for insurance companies, Claims Officers, Field Adjusters, and product evaluators — not a technical documentation page.

The visitor should understand within a short time:

1. What is صون?
2. What problem does it solve?
3. How does the claims journey work?
4. Who uses it?
5. Why would an insurance company care?
6. What does the actual product look like?

The page tells one coherent story:

```
Problem → Soun → Claims Journey → People → Product → Business Value → Demo
```
