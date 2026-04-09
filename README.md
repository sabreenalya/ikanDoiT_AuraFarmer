# ikanDoiT
Smart Aquaculture Management System

Vite · React · Tailwind · shadcn/ui (Radix) · Supabase · Recharts · Gemini AI (optional)

## 📖 About ikanDoiT
ikanDoiT is a web dashboard for modern fish farmers to monitor pond conditions, estimate biomass, and optimize feeding — with an optional IoT sensor kit workflow and AI-powered recommendations.

This repository contains the frontend application (Vite + React) and a demo-friendly UX that still works even when Supabase is not configured.

## ✨ Features

### 💧 Water Quality Monitoring
- Live-style dashboard with key parameters (DO, pH, temperature, NH₃, NO₃, salinity)
- Alerts with clear “warning” vs “critical” guidance
- Historical trends and parameter breakdowns
- Optional AI recommendations (Google Gemini) when `VITE_GEMINI_API_KEY` is provided

### 🐟 Biomass Estimation
- Species-aware length → weight estimation
- Video upload UX (detection flow is simulated in this repo)
- Weight-over-time chart with a short growth simulation horizon
- Recent biomass record history

### 🍽️ Feeding Management
- Auto-generated feeding schedule that adapts to biomass, weight, temperature, and logs
- Daily/monthly cost estimation (feed price per kg)
- Checklist workflow + alerts for missed feedings
- Supabase persistence + realtime updates when configured

### 📡 Device & Sensor Kit Flow (Demo)
- Product page for sensor kit selection
- Checkout + order confirmation + order tracking UX
- Device connection onboarding (Device ID format validation)

### 🔐 Authentication (Supabase)
- Email/password login and signup
- Graceful demo fallback when Supabase is not configured

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 18 + Vite |
| Language | TypeScript (mixed TS/JS files) |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Charts | Recharts |
| Data / State | TanStack Query |
| Auth / DB / Realtime (optional) | Supabase |
| AI (optional) | Google Gemini API |
| Testing | Vitest + Playwright |

## 📁 Project Structure

```text
public/
src/
	assets/              # Images, videos
	components/          # Shared components + shadcn/ui primitives
	hooks/               # App hooks
	lib/                 # Utilities (e.g. cn / class merge)
	pages/               # App pages (Dashboard, Water, Biomass, Feeding, Shop)
		feeding/           # Feeding module (hooks, components, utils, types)
	shared/              # aquaCore (Supabase client + shared UI helpers)
	App.tsx              # Router setup
	main.tsx             # React bootstrap
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ recommended
- Bun (optional) — this repo includes a `bun.lockb`

### 1) Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd ikandoit_lovable
```

### 2) Install dependencies
Using Bun:
```bash
bun install
```

Using npm:
```bash
npm install
```

### 3) Configure environment variables (optional)
This project runs in demo mode without Supabase.

1. Copy the template:
```bash
cp .env.example .env
```

2. Fill in values in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (AI recommendations)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4) Run the app
Using Bun:
```bash
bun run dev
```

Using npm:
```bash
npm run dev
```

Vite is configured to run on `http://localhost:8080`.

### Build & Preview
Using Bun:
```bash
bun run build
bun run preview
```

Using npm:
```bash
npm run build
npm run preview
```

## 🗄️ Supabase Notes (Optional)

When configured, the app uses Supabase for auth, persistence, and realtime subscriptions.

Tables referenced in the codebase:
- `biomass_records` (uses a `timestamp` column)
- `feeding_logs`
- `feed_prices`

If those tables don’t exist, the UI will still run in demo mode (mock data + local state), but persistence/realtime will not work.

## 🔒 Security
- Secrets are read only from `.env` (`.env` is gitignored).
- Do not hardcode API keys.
- Use Supabase Row Level Security (RLS) policies before deploying.

## ✅ Testing
Unit tests:
```bash
bun run test
```

Or:
```bash
npm run test
```

Playwright (end-to-end):
```bash
npx playwright install
npx playwright test
```

## 📸 Screenshots
Coming soon

## 🗺️ Future Roadmap
- Real sensor ingestion pipeline (MQTT/HTTP) and true realtime parameter streaming
- Multi-pond support (pond switching, per-pond history)
- Proper video fish detection service + model integration (replacing the simulated flow)
- Reports export (PDF/CSV) for water/feeding/biomass
- Notifications (email/SMS/WhatsApp) for critical pond alerts

## 🤝 Contributing
1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License
No license file is included yet. If you plan to open-source this repository, add a `LICENSE` (e.g., MIT) before publishing.
