# Ro-bit Habit Tracker — Overhaul Plan

## Goal
Complete visual overhaul of the habit tracker to a **dark amethyst / purple** theme with a punchy, premium feel. Rename the app to **"Ro-bit"**. Prepare for **Vercel deployment**.

---

## 1. Design Direction

**Tone:** Refined dark luxury with visible purple accents. Deep amethyst backgrounds, vibrant violet glows on interaction, emerald/rose for success/error states.

---

## 2. Color Palette

| CSS Variable | Hex Value | Usage |
|---|---|---|
| `--bg-deep` | `#0a0612` | Page background (bottom layer) |
| `--bg-base` | `#110a1a` | Secondary background, sidebar |
| `--surface` | `#1a1225` | Cards, panels, day cells |
| `--surface-elevated` | `#221830` | Hover states, elevated cards |
| `--border` | `rgba(139, 92, 246, 0.15)` | Subtle purple-tinted borders |
| `--border-hover` | `rgba(167, 139, 250, 0.35)` | Hover/active borders |
| `--text-primary` | `#f0e6ff` | Headings, primary text |
| `--text-secondary` | `#9b8cb3` | Muted labels, secondary text |
| `--accent` | `#a78bfa` | Primary accent (buttons, highlights) |
| `--accent-bright` | `#8b5cf6` | Punchy accent (rings, active states) |
| `--accent-glow` | `rgba(139, 92, 246, 0.20)` | Soft hover glows |
| `--success` | `#34d399` | Done / completed days (emerald) |
| `--success-dim` | `rgba(52, 211, 153, 0.12)` | Done background tint |
| `--error` | `#fb7185` | Missed days (soft rose) |
| `--error-dim` | `rgba(251, 113, 133, 0.12)` | Miss background tint |

---

## 3. Typography

- **Font:** Replace `Quicksand` with **Onest** (Google Fonts)
- **Weights:** 300–700
- **Import:** `https://fonts.googleapis.com/css2?family=Onest:wght@300..700&display=swap`
- **Why:** Modern geometric sans-serif, more character, pairs beautifully with dark themes, gives a polished premium feel.

---

## 4. Files to Modify

### `styles.css` — Full Theme Overhaul
- Replace all color variable definitions with new amethyst palette
- Update `body` background to a deep purple gradient: `linear-gradient(180deg, #0a0612 0%, #110a1a 50%, #0a0612 100%)`
- Update all card/surface backgrounds (`#1a1225`, `#221830`)
- Update all borders to use purple tint (`rgba(139, 92, 246, 0.15)`)
- Update button hover glows to purple (`rgba(139, 92, 246, .20)`)
- Update `.day.done` background/border to emerald tints
- Update `.day.miss` background/border to rose tints
- Update `.today` ring to `--accent-bright` (`#8b5cf6`)
- Update `.habit.selected` border and shadow to purple
- Update modal, picker, toast, sidebar, menu backgrounds and borders
- Update login/register card styles
- Update all text/link colors to new palette
- Ensure `--green` and `--red` variables are removed or repurposed

### `index.html` — Root Entry Point
- Update `<title>` to: `Ro-bit`
- Replace Google Font import: `Quicksand` → `Onest`
- Update the `<style>` block inside `<head>`:
  - Replace font import line
  - Replace `:root` color variables with new palette
  - Update `body` background gradient
  - Update all hardcoded colors (buttons, cards, borders, text) to new palette
- Update `header .title` text to `Ro-bit`
- Update success/error day tints in the `<style>` block

### `index/index.html` — `/index/` Route
- Same exact changes as `index.html`
- Ensure all inline styles, title, and font imports are updated identically

### `login/index.html` & `login.html` — Auth Pages
- Update `<title>` to: `Sign In • Ro-bit`
- Replace Google Font import: `Quicksand` → `Onest`
- Update the `<style>` block:
  - Replace `:root` color variables
  - Update `body` background to purple gradient
  - Update `.login-card` background, border, shadow to new palette
  - Update input/button styles to new palette
  - Update link color from `#93c5fd` to `#a78bfa`
  - Update focus ring shadow to purple

### `register/index.html` & `register.html` — Registration Pages
- Update `<title>` to: `Create Account • Ro-bit`
- Same style changes as login pages

### `sw.js` — Service Worker
- Bump cache name: `habit-cache-v1` → `robit-cache-v1`
- This busts the old blue-themed styles for returning users

### `README.md`
- Update title to: `# Ro-bit`
- Replace Netlify URL with Vercel URL once deployed
- Update description to reflect new branding

---

## 5. New Files to Create

### `vercel.json` — Vercel Configuration
```json
{
  "cleanUrls": true,
  "rewrites": [
    { "source": "/login", "destination": "/login/index.html" },
    { "source": "/register", "destination": "/register/index.html" },
    { "source": "/index", "destination": "/index/index.html" }
  ]
}
```
- Enables clean URLs (`/login/` instead of `/login/index.html`)
- Vercel auto-handles the trailing-slash SPA routing for static sites

---

## 6. Vercel Deployment Steps

1. **Commit and push all changes** to the `main` branch of `robinmct/rob-habit-tracker`
2. Go to [vercel.com](https://vercel.com) dashboard
3. Click **"Add New Project"**
4. Import `robinmct/rob-habit-tracker` from GitHub
5. Vercel auto-detects a static site — no build settings needed
6. Click **Deploy**
7. The auto-generated URL will be `rob-habit-tracker.vercel.app`
8. **To get `ro-bit.vercel.app`:**
   - Either rename the GitHub repo to `ro-bit` and re-import, **or**
   - Go to Project Settings → Domains in Vercel and add `ro-bit.vercel.app` (if available)

---

## 7. Verification Checklist

- [ ] All pages display "Ro-bit" in the browser tab
- [ ] Background is deep purple, not blue
- [ ] Buttons glow purple on hover, not blue
- [ ] Calendar "done" days are emerald-tinted, "miss" days are rose-tinted
- [ ] Today ring is bright purple (`#8b5cf6`)
- [ ] Sidebar habit items have purple accent on select
- [ ] Login and register pages use the new palette
- [ ] Font is Onest, not Quicksand
- [ ] Modals, pickers, toasts all use purple borders
- [ ] Mobile layout looks good (bottom sheet for sidebar)
- [ ] Service worker cache is busted (`robit-cache-v1`)
- [ ] `vercel.json` is present and correct
- [ ] App deploys to Vercel without errors

---

## 8. Notes for Future Sessions

- The app uses **vanilla JS with ES modules** (no build step required)
- Firebase auth and Firestore are loaded via CDN scripts (not affected by theme changes)
- All state logic in `state.js`, `firebase.js`, `index.js`, `ui/render.js`, `ui/modals.js` is **logic-only** and does not need color changes
- The only visual changes needed are in **CSS, HTML `<style>` blocks, and HTML titles**
- If you want to tweak colors further, edit the CSS variables in `styles.css` and the `:root` blocks in each HTML file's `<style>` tag
