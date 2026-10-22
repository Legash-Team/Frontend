---
name: Redesign the admin dashboard to match the hospital portal
about: Presentation-only refresh of the admin dashboard using the hospital dashboard as the visual reference
title: "Redesign admin dashboard to match hospital portal style"
labels: enhancement, frontend, admin
---

## Problem

The admin dashboard (`src/pages/admin/DashboardPage.tsx`) looks and feels like a different product from the hospital dashboard (`src/pages/hospital/HospitalDashboardPage.tsx`), which is the reference for portal UI in this app. Concretely:

- The page opens on a flat crimson "System Command Center" block with no badge, no CTA and no welcome context — the hospital portal leads with a gradient welcome banner that names the user and offers a direct action.
- The header comes from `AdminLayout title="System Overview"` with no page icon, no subtitle and no quick actions, while the hospital portal leads with icon + serif title + subtitle on the left and quick-action buttons on the right.
- The three stat cards (Pending Approval / System Integrity / Portal Status) use large colored icon tiles instead of the bordered, mono-labeled card treatment used in the hospital portal.
- The verification queue header and its empty state read as generic, not like the bordered section headers (icon + title + right-aligned meta) used elsewhere.
- Heavy use of `rounded-[24px]` / `rounded-[32px]` with hover shadows makes the page feel looser than the compact `rounded-2xl border border-line-soft shadow-xs` cards the hospital dashboard uses.

The approve/rejection flow itself works — this issue is presentation only, so admins and hospitals feel like they are in the same product.

## Inspiration: hospital dashboard patterns to reuse

From `src/pages/hospital/HospitalDashboardPage.tsx`:

1. **Page header** — icon + serif title + one-line subtitle on the left, quick actions on the right, separated by a bottom border.
2. **Welcome banner** — `bg-gradient-to-r from-crimson via-crimson to-crimson-dark` rounded banner with a soft blur orb, a pill badge (`bg-white/15 backdrop-blur-md ... border border-white/20`), serif headline, supporting paragraph, and a single white CTA button.
3. **Card chrome** — `bg-white rounded-2xl border border-line-soft shadow-xs p-6`, section headers inside the card separated by `border-b border-line-soft`, serif title + icon left, mono uppercase link right.
4. **Stat/grid tiles** — compact bordered tiles with mono uppercase labels, serif numerals, and status chips (`bg-crimson/10 text-crimson` / `bg-verified/10 text-verified`) instead of big colored icon blocks.
5. **Motion** — the hospital dashboard uses CSS-only transitions; the admin dashboard pulls in `framer-motion` for list and modal animation. Prefer CSS unless the animation is doing real work.

## Scope

**In scope**

- `src/pages/admin/DashboardPage.tsx` — header, welcome banner, stat cards, queue header, card chrome, and the loading / error / empty presentational states.
- Small additive tweaks to `src/layouts/AdminLayout.tsx` if the page header needs a subtitle or quick-action slot.
- Reuse existing primitives: `LoadingState`, `ErrorState`, `Button`, and the existing stat card helper.

**Out of scope**

- Approval/rejection logic, `admin-api` calls, and any backend change.
- Other admin pages (event posting, my posts/events, stock, analytics, feedback) — they can adopt this pattern in a follow-up.
- Responsive regressions: existing breakpoints must keep working.

## Acceptance criteria

- [ ] Page header matches the hospital dashboard header structure: icon + serif title + subtitle left, quick action(s) right.
- [ ] Welcome banner uses the crimson gradient + pill badge + CTA pattern and sets the admin context.
- [ ] Stat cards use bordered cards with mono uppercase labels and status chips rather than colored icon tiles.
- [ ] Verification queue uses the shared section-header pattern and card chrome.
- [ ] Loading, error and empty states use `LoadingState` / `ErrorState` and match the hospital portal's tone.
- [ ] `npm run build` passes and `npx eslint src/pages/admin` is clean.
- [ ] No behavioral change: approve, reject-with-reason and refresh still work against the live API, and the inspection modal still opens/closes correctly.

## Notes

- Reference: `src/pages/hospital/HospitalDashboardPage.tsx`
- Target: `src/pages/admin/DashboardPage.tsx`
- Suggested branch: `feature/admin-dashboard-redesign` (already exists, currently pointing at `main` with no work on it)
- Related: the landing-page refresh landed on `main` via PR #58.