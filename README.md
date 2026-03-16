# 🌿 HabitHarbor — Frontend

> Planora — Digital Planner & Journal. React + Vite SPA powered by Google Gemini AI.

---

## 📋 Project Overview

HabitHarbor's frontend is a **React 18 + Vite** single-page application providing a premium dark-mode-first productivity interface. Users can manage tasks, journal, track habits, goals, mood, and finances — all in one place, with AI assistance throughout.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS 3 + Custom CSS Variables (`index.css`) |
| **Routing** | React Router DOM v6 (with protected + public route guards) |
| **State** | React Context API (`AuthContext`, `ThemeContext`) |
| **HTTP Client** | Axios with JWT Bearer interceptor (`services/api.js`) |
| **Charts** | Recharts (AreaChart, BarChart, RadarChart) |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable (tasks + dashboard) |
| **Rich Text** | React Quill |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Toasts** | React Hot Toast |
| **Google OAuth** | @react-oauth/google |
| **UI Primitives** | Radix UI |
| **Dates** | date-fns |
| **Deployment** | Netlify (`public/_redirects` included) |

---

## 🖥️ Pages & Routes

From `src/App.jsx`:

| Page | Route | Type | Description |
|------|-------|------|-------------|
| `LandingPage` | `/` | Public | Hero, features, pre-login marketing |
| `LoginPage` | `/login` | Public | Email + Google OAuth login |
| `RegisterPage` | `/register` | Public | Email + Google OAuth registration |
| `ForgotPasswordPage` | `/forgot-password` | Public | Email password reset |
| `DashboardPage` | `/dashboard` | Protected | Draggable/resizable widget dashboard |
| `TasksPage` | `/tasks` | Protected | Kanban drag-and-drop board + AI suggestions |
| `JournalPage` | `/journal` | Protected | Rich text editor, mood tags, image embeds |
| `CalendarPage` | `/calendar` | Protected | Event calendar (monthly view) |
| `GoalsPage` | `/goals` | Protected | Goal tracking + milestones + progress bars |
| `HabitsPage` | `/habits` | Protected | Daily habit check-ins + streak tracking |
| `MoodPage` | `/mood` | Protected | Mood logging + 30-day trend charts + AI analysis |
| `FinancePage` | `/finance` | Protected | Income/expense transactions + analytics charts |
| `AIAssistantPage` | `/ai` | Protected | Gemini AI chat + productivity insights |
| `FocusModePage` | `/focus` | Protected | Pomodoro-style focus timer |
| `SettingsPage` | `/settings` | Protected | Profile, theme, preferences |
| `AdminPage` | `/admin` | Protected | Admin panel (admin role only) |

---

## 📁 Project Structure

```
habitharbor-frontend/
├── public/
│   └── _redirects                  # Netlify SPA redirect rule
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx          # App shell: sidebar, nav, outlet
│   ├── context/
│   │   ├── AuthContext.jsx         # Auth state: user, login, logout, googleLogin
│   │   └── ThemeContext.jsx        # Light / dark theme switching
│   ├── hooks/
│   │   ├── useLocalStorage.js      # Persistent localStorage state hook
│   │   └── useNotifications.js    # Upcoming deadline / event notifications
│   ├── pages/                      # 16 route-level page components (see Routes table)
│   ├── services/
│   │   ├── api.js                  # Axios instance — injects Bearer token on every request
│   │   └── index.js               # All service modules: auth, task, journal, goal, habit, mood, finance, ai, dashboard
│   ├── utils/
│   │   ├── helpers.js             # Shared utility functions
│   │   └── notifications.js       # Notification helper utilities
│   ├── App.jsx                     # Router + ProtectedRoute / PublicRoute guards
│   ├── main.jsx                    # Entry point — ThemeProvider, AuthProvider, GoogleOAuthProvider
│   └── index.css                  # Global CSS, design tokens, component utility classes
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Backend running locally or at a deployed URL
- Google Cloud OAuth Client ID (must match backend's `GOOGLE_CLIENT_ID`)

```bash
# 1. Clone
git clone <your-frontend-repo-url>
cd planora-frontend

# 2. Install
npm install

# 3. Configure
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

```bash
# 4. Develop
npm run dev        # http://localhost:5173

# 5. Build
npm run build      # Output: /dist
npm run preview    # Preview production build
```

---

## 🎨 Design System

Defined in `src/index.css` and extended via `tailwind.config.js`.

**Themes:**
- **Dark** (default) — Deep navy/charcoal backgrounds, violet accents
- **Light** — Off-white surfaces, matching accent palette

**Key CSS utility classes:**

| Class | Purpose |
|-------|---------|
| `.glass-card` | Frosted glass card — `border-2`, backdrop blur, shadow |
| `.neon-button` | Primary CTA with primary-color glow |
| `.stat-card` | Metric card — hover lift + shadow |
| `.input-field` | Styled input with focus ring |
| `.gradient-text` | Purple-to-accent gradient text |
| `.sidebar-item` | Nav item with hover state |
| `.sidebar-item-active` | Active nav item |

**Fonts:** Clash Display (headings), Cabinet Grotesk / Inter (body), Fira Code (mono)

---

## 🔐 Auth Flow

1. User logs in via email/password or Google OAuth
2. Backend returns JWT token
3. Token stored in `localStorage`
4. `AuthContext` provides `user`, `login`, `logout`, `googleLogin` to all components
5. `services/api.js` interceptor injects `Authorization: Bearer <token>` on every request
6. Public routes redirect logged-in users to `/dashboard`
7. Protected routes redirect guests to `/login`

---

## 🌐 Deployment

**Live App:** [https://planora-frontend-project.netlify.app](https://planora-frontend-project.netlify.app)  
**Backend API:** [https://planora-backend-f2v7.onrender.com](https://planora-backend-f2v7.onrender.com)  
**Video Walkthrough:** [Watch here](https://drive.google.com/drive/folders/1I6OhVlhrZc9t98r2kwh1ZDuT3MODVlzR?usp=sharing)

**Deploy to Netlify:**
1. Push to GitHub
2. Connect repo on [Netlify](https://app.netlify.com)
3. Build command: `npm run build` | Publish directory: `dist`
4. Add env vars: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`
5. `public/_redirects` already included (`/* /index.html 200`)

---

## 🔑 Demo Credentials

```
Email:    demo@planora.app
Password: demo1234
```

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:5173) |
| `npm run build` | Build for production (`/dist`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
