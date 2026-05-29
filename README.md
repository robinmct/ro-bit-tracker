# Ro-bit &mdash; Habit Tracker

A beautifully designed, interactive habit tracker built to help you build better routines. Track daily habits, visualize progress on a calendar, and stay motivated with streaks and stats &mdash; all wrapped in a polished dark amethyst theme.

---

## Features

### Habit Tracking
- **Binary habits** &mdash; mark as done (check) or missed (cross) each day
- **Numeric habits** &mdash; set a target goal and log values (steps, minutes, pages, etc.)
- **Reorder habits** via drag handles or arrow buttons

### Calendar View
- Monthly calendar grid with color-coded day statuses
- Today&rsquo;s cell highlighted with a glowing purple ring
- Smooth animated transitions when changing months
- Quick month/year picker for navigation

### Stats & Insights
- Completion count, missed count, best streak, current streak, and success rate
- Percentage progress bars per habit for the viewed month
- Animated number counters for a polished finish

### Keyboard Power User
- **Command Palette** (`Cmd+K` / `Ctrl+K`) &mdash; switch habits, jump months, add/edit habits, sign out, all from the keyboard
- **Theme toggle** &mdash; press `D` to swap between dark and light modes

### Auth & Cloud Sync
- Email/password and Google OAuth sign-in via Firebase Auth
- Real-time Firestore synchronization across devices
- Automatic sync with `onSnapshot` listeners; local state serves as instant UI cache

### Design
- Dark amethyst/purple glassmorphism theme
- Animated micro-interactions throughout (Framer Motion)
- Fully responsive &mdash; desktop sidebar collapses to a mobile sheet
- Ambient floating background blobs
- Custom favicon and polished UI details

---

## Tech Stack

| Layer             | Technology                                                    |
| ----------------- | ------------------------------------------------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/) (App Router)                |
| **UI**            | [React 19](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/) |
| **Styling**       | [Tailwind CSS v4](https://tailwindcss.com/)                   |
| **Animations**    | [Framer Motion](https://www.framer.com/motion/)               |
| **State**         | [Zustand](https://docs.pmnd.rs/zustand/)                      |
| **Auth**          | [Firebase Auth](https://firebase.google.com/products/auth)    |
| **Database**      | [Firebase Firestore](https://firebase.google.com/products/firestore) |
| **Command Menu**  | [cmdk](https://cmdk.paco.me/)                                 |
| **Number Flow**   | [@number-flow/react](https://number-flow.barvian.me/)         |
| **Icons**         | [Lucide](https://lucide.dev/)                                 |
| **Toasts**        | [Sonner](https://sonner.emilkowal.ski/)                       |
| **Theming**       | [next-themes](https://github.com/pacocoursey/next-themes)     |
| **Dates**         | [date-fns](https://date-fns.org/)                             |
| **Language**      | TypeScript                                                    |
| **Deployment**    | [Vercel](https://vercel.com/)                                 |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) (comes with Node)
- A [Firebase](https://firebase.google.com/) project with **Authentication** (Email/Password + Google) and **Firestore Database** enabled

### Installation

```bash
git clone https://github.com/robinmct/ro-bit-tracker.git
cd ro-bit-tracker
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project-id>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project-id>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<measurement-id>
```

You can find these values in your Firebase project settings under **Project settings > General > Your apps**.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
ro-bit-tracker/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Global styles, theme variables, animations
│   ├── layout.tsx                # Root layout (providers, toaster, background)
│   ├── page.tsx                  # Home page (auth guard → HabitTracker)
│   ├── login/page.tsx            # Sign-in page (email + Google OAuth)
│   └── register/page.tsx         # Registration page
├── components/
│   ├── habit-tracker.tsx         # Main orchestrator: header, sidebar, calendar, stats, dialogs
│   ├── habit-sidebar.tsx         # Sidebar habit list with progress bars
│   ├── calendar-grid.tsx         # Monthly calendar with day statuses
│   ├── stats-panel.tsx           # Stats cards with animated counters
│   ├── habit-dialog.tsx          # Add/Edit habit modal
│   ├── month-picker.tsx          # Month/year navigation picker
│   ├── progress-dialog.tsx       # Numeric entry for step/time habits
│   ├── command-menu.tsx          # Cmd+K command palette
│   ├── confirm-dialog.tsx        # Generic confirmation dialog
│   ├── theme-provider.tsx        # Theme provider + keyboard toggle
│   └── ui/                       # shadcn/ui primitives
├── store/
│   └── habit-store.ts            # Zustand store (habits, marks, sync, view state)
├── hooks/
│   └── use-auth.ts               # Firebase auth state listener
├── lib/
│   ├── firebase.ts               # Firebase init, auth + Firestore helpers
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── public/
│   └── favicon.svg               # Custom purple gradient favicon
├── _legacy/                      # Previous vanilla JS version (preserved for reference)
├── package.json
├── tsconfig.json
├── next.config.ts
└── components.json               # shadcn/ui configuration
```

---

## Available Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start the development server       |
| `npm run build`      | Create a production build          |
| `npm start`          | Start the production server        |
| `npm run lint`       | Run ESLint                         |
| `npm run format`     | Format code with Prettier          |
| `npm run typecheck`  | Run TypeScript type checking       |

---

## Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com/) and click **Add New Project**
3. Import the repository
4. Add the Firebase environment variables in **Settings > Environment Variables**
5. Deploy

Vercel auto-detects Next.js and applies the correct build settings.

### Firebase Firestore Rules

Set up your Firestore security rules to ensure users can only read/write their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Auth Setup

In your Firebase console, enable the following sign-in methods under **Authentication > Sign-in method**:

- **Email/Password**
- **Google**

---

## Data Model

### Firestore Structure

```
users/{uid}/
  └── habits/{habitId}            # Habit metadata
  │     ├── name: string
  │     ├── type: "binary" | "number"
  │     ├── goal: number (optional)
  │     ├── color: string
  │     ├── icon: string
  │     └── order: number
  │
  └── habits/{habitId}/months/{YYYY-MM}/   # Daily marks
        └── marks: {
              1: "done" | "miss" | number,   # Day → value
              ...
            }
```

### State Architecture

- **Zustand store** is the single source of truth
- `remoteData` is populated in real-time via Firestore `onSnapshot` listeners
- UI reads from `remoteData` first, falls back to local `habitData`
- Mark updates write locally first (instant UI), then sync to Firestore asynchronously
- View year/month is persisted to `localStorage`

---

## License

TBD
