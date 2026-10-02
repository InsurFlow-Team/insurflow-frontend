# 04 — Visual Direction

## Overall Direction

Modern corporate insurance-tech visual language:

- Clean
- Trustworthy
- Premium
- Minimal
- Product-led

Arabic-first RTL design.

## Typography

**Primary font:** Tajawal (Google Fonts)
**Fallbacks:** IBM Plex Sans Arabic, Cairo

- Strong display heading (bold, large)
- Comfortable Arabic line height (1.8–2.0 for body)
- Clear hierarchy: display → section heading → body → caption

## RTL

- `dir="rtl"` on `<html>`
- `lang="ar"` on `<html>`
- All layout uses logical properties where possible
- Tailwind CSS v4 with RTL-aware utilities

## Colors

| Role | Color | Usage |
|------|-------|-------|
| Primary brand | Deep navy `#1e2a5e` | Headings, primary buttons, brand mark |
| Primary dark | `#162048` | Hover states |
| Accent | `#d97706` (amber) | Single accent for highlights |
| Background | `#f7f8fa` | Page background |
| Surface | `#ffffff` | Cards, sections |
| Text | `#1f2937` | Body text |
| Text muted | `#6b7280` | Secondary text |
| Border | `#e5e7eb` | Card borders, dividers |
| Success | `#10b981` | Status: verified, approved |
| Warning | `#d97706` | Status: in progress, attention |
| Danger | `#dc2626` | Status: error, rejected |
| Info | `#2563eb` | Status: info, submitted |

Semantic colors only for status meaning. No decorative color usage.

## Spacing

- Section padding: `py-20` to `py-32` (80px–128px)
- Container: `max-w-7xl` with `px-4 sm:px-6 lg:px-8`
- Card padding: `p-6` to `p-8`
- Gap between sections: consistent `space-y-8` to `space-y-12`

## Screenshots

- Product screenshots are the hero visual — more important than decorative graphics
- Present in polished mockup frames (browser chrome for desktop, phone frame for mobile)
- Subtle shadow + border on mockup containers
- No generic stock photography
- No cartoon illustrations

## Animation

- Minimal, purposeful animation only
- Subtle fade-in on scroll (IntersectionObserver)
- No excessive animations
- No autoplay video
- Respect `prefers-reduced-motion`

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| 360px | Single column, stacked, readable |
| 390px | Single column, comfortable spacing |
| 768px (tablet) | 2-column grids, adjusted spacing |
| 1280px (desktop) | Full multi-column, horizontal workflows |
| 1536px+ (wide) | Max-width container, centered |

Mobile priorities:
- Single column
- Vertical workflow (not horizontal)
- Readable screenshots
- No horizontal scrolling
- Accessible navbar (hamburger menu)
- Good spacing

## Component Styling

- Cards: `rounded-xl border border-border bg-surface shadow-sm`
- Buttons: `rounded-lg font-medium transition-colors`
- Primary button: `bg-primary hover:bg-primary-dark text-white`
- Secondary button: `bg-surface border border-border hover:bg-background`
- Focus states: `focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`
- Badges: `rounded-full px-2.5 py-0.5 text-xs font-semibold border`
