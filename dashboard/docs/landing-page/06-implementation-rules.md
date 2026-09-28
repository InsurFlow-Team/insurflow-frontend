# 06 — Implementation Rules

## Scope

This task implements the **public landing page** only.

### In Scope
- Landing page route (public, no auth required)
- Landing page components
- Landing page styles
- Documentation files

### Out of Scope (DO NOT MODIFY)
- Backend
- APIs
- Database
- Authentication
- Claim state machine
- Assignment logic
- Policy verification logic
- Mobile workflow
- Existing dashboard business logic
- Do not add backend endpoints

## Routing

The existing app uses react-router-dom v7 with these routes:

```
/ → redirect to /login
/login → Login page
/dashboard → Dashboard (protected)
/claims → Claims list (protected)
/claims/:claimId → Claim details (protected)
/adjusters → Adjusters directory (protected)
/adjusters/:adjusterId → Adjuster details (protected)
/map → Dispatch map (protected)
/profile → Profile (protected)
/settings → Settings (admin only)
/settings/users → User management (admin only)
/unauthorized → Access denied
```

### Landing Page Route

Add a **public** landing page at `/` (replacing the redirect to `/login`):

```
/ → LandingPage (public, no auth)
/login → Login page (unchanged)
...all other routes unchanged
```

The landing page must NOT break:
- Dashboard routes
- Claims routes
- Claim details routes
- Authentication flow
- Role guards

## Architecture

### Component Structure

```
src/pages/
  LandingPage.tsx          — Main landing page composition

src/components/landing/
  LandingNavbar.tsx        — Sticky navbar with brand + nav + CTA
  HeroSection.tsx          — Headline, text, CTAs, product mockup
  ProblemSection.tsx       — Problem statement + 4 cards
  ClaimJourney.tsx         — 8-step workflow visualization
  PolicyVerificationSection.tsx — Verification form + result mockup
  ClaimsOfficerSection.tsx — Dashboard mockup with highlights
  DispatchSection.tsx      — Map mockup with pins
  FieldAdjusterSection.tsx — Mobile mockups
  TraceabilitySection.tsx  — Timeline visualization
  ReviewDecisionSection.tsx — Review flow diagram
  BusinessValueSection.tsx — 4 value blocks
  AudienceSection.tsx      — Who is it for cards
  ProductGallery.tsx       — 4 screenshots with captions
  CompleteJourneySection.tsx — 8-step journey summary
  AboutSection.tsx         — Mission statement
  FinalCTA.tsx             — Final call to action
  LandingFooter.tsx        — Footer with brand + nav
  mockups/
    DashboardMockup.tsx     — Static dashboard visual
    MobileMockup.tsx       — Static mobile visual
    MapMockup.tsx          — Static map visual
    VerificationMockup.tsx — Static verification form
```

### File Organization

- Each section is a self-contained component
- Mockups are separate components in `mockups/` subdirectory
- All landing page styles in `src/index.css` (Tailwind v4 `@theme` + custom classes)
- No external CSS files needed

## Accessibility

- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`
- Correct heading hierarchy: h1 (hero) → h2 (sections) → h3 (cards)
- Keyboard navigation: all interactive elements focusable
- Visible focus states: `focus-visible:ring-2 focus-visible:ring-primary/40`
- Useful alt text on all images
- Sufficient contrast: navy on white, white on navy
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables animations
- Accessible buttons and links: proper `aria-label` where text is insufficient
- RTL: `dir="rtl"` on html, logical properties for spacing

## Performance

- No external images (all mockups are CSS/React)
- Lazy load below-the-fold sections with IntersectionObserver
- No unnecessary libraries (no animation libraries)
- No heavy animation
- No autoplay video
- Keep the hero lightweight
- Tailwind CSS v4 (already in use, tree-shaken)

## Testing

After implementation, run:

```bash
npm test
npm run build
npm run lint
```

### Manual Verification Checklist

- [ ] RTL layout correct
- [ ] Mobile (360px, 390px) — single column, no horizontal scroll
- [ ] Tablet (768px) — readable, adjusted spacing
- [ ] Desktop (1280px) — full layout, horizontal workflows
- [ ] Wide desktop (1536px+) — centered container
- [ ] No horizontal overflow
- [ ] No console errors
- [ ] All mockups render
- [ ] All buttons work (navigation)
- [ ] All navigation links work
- [ ] CTA buttons work
- [ ] Screenshots/mockups are readable
- [ ] No broken routes
- [ ] Existing routes still work (/login, /dashboard, /claims, etc.)

## Things That Must NOT Be Changed

1. **Existing routes** — do not modify /login, /dashboard, /claims, /claims/:id, /adjusters, /map, /profile, /settings
2. **Auth flow** — do not modify AuthContext, login, logout, token handling
3. **Role guards** — do not modify ProtectedRoute, RoleGuard
4. **API layer** — do not modify api/ files
5. **Types** — do not modify types/ files
6. **Existing components** — do not modify components/ files (only add new ones)
7. **Vite config** — do not modify vite.config.ts
8. **Package.json** — do not add dependencies
9. **Backend** — no backend changes
10. **Claim state machine** — no changes to claim status logic

## Brand Rules

- Product name: **صون** (Soun)
- Do NOT use old names: Masar, InsurFlow
- Arabic-first RTL design
- Descriptor: منصة لإدارة مطالبات تأمين المركبات
- English descriptor (if needed): Soun — Motor Insurance Claims Management
- Tagline: من لحظة الحادث إلى إغلاق المطالبة. كل شيء في مسار واحد.
