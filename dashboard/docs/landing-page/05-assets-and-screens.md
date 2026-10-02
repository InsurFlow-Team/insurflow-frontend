# 05 — Assets and Screens

## Screenshots Required

The landing page needs the following product visuals:

| Section | Visual | Source |
|---------|--------|--------|
| Hero | Dashboard + Mobile mockup | Product screenshot or tasteful mockup |
| Policy Verification | Verification form + result | Product screenshot or mockup |
| Claims Officer | Dashboard/Claims UI | Product screenshot or mockup |
| Dispatch Map | Map with pins | Product screenshot or mockup |
| Field Adjuster | 2–3 mobile screens | Product screenshots or mockups |
| Evidence & Traceability | Timeline visual | Component-built timeline |
| Review & Decision | Flow diagram | Component-built diagram |
| Product Gallery | 4 screenshots | Product screenshots or mockups |

## Preferred Sources

1. **Search the repository for existing assets** — no screenshots found in the current repository.
2. **Inspect Dashboard** — `src/pages/Dashboard.tsx` and related components.
3. **Inspect Claim Details** — `src/pages/ClaimDetails.tsx` and related components.
4. **Inspect Dispatch Map** — `src/pages/MapPage.tsx` and related components.
5. **Inspect mobile UI** — referenced in types but no mobile app code in this repo.
6. **Reuse existing branding** — navy primary color, ShieldCheck icon pattern.

## Privacy Rules

Do NOT expose:
- Real phone numbers
- Private customer names
- Private addresses
- Tokens
- API keys
- Internal secrets

Use approved demo data only. The repository contains demo data in `src/utils/demo.ts` with clearly-labeled demo points (رام الله، نابلس، بيت لحم، جنين، الخليل).

## Fallback if Screenshot Unavailable

Since no screenshots exist in the repository, create **tasteful presentation mockups** that:

- Are clearly demo-oriented
- Do not pretend to be production data
- Use the existing design system (navy primary, clean cards, proper typography)
- Show realistic but fictional data (e.g., "CLM-2026-0001", "Ahmed Ibrahim", "ABC-1234")
- Are built as React components with the same visual language as the actual product

### Mockup Approach

Each mockup is a React component that renders a simplified, static version of the actual UI:

- **Dashboard mockup**: stat cards row + recent claims table
- **Mobile mockup**: phone frame with simplified claim list / inspection form
- **Map mockup**: stylized map area with pins (no Leaflet dependency)
- **Verification mockup**: form fields + success state
- **Timeline mockup**: vertical timeline with status dots

All mockups use the same CSS classes and design tokens as the real product.

## Asset Optimization

- No external images to optimize (all mockups are CSS/React)
- Lazy load below-the-fold sections with `loading="lazy"` on any future images
- Keep the hero lightweight (no heavy assets above the fold)
- No autoplay video
