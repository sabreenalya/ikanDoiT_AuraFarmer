<h1 align="center">ikanDoiT</h1>

<p align="center">
  Smart Aquaculture Management System
</p>

<p align="center">
  <em>Empowering Smarter Aquaculture Through Vision.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VITE-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/REACT-Library-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TAILWIND-CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/SHADCN%2FUI-Components-black?style=for-the-badge&logo=radixui&logoColor=white" />
  <img src="https://img.shields.io/badge/SUPABASE-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black" />
  <img src="https://img.shields.io/badge/RECHARTS-Charts-FF6384?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GEMINI_AI-Google-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

## 📖 About ikanDoiT
ikanDoiT is a smart aquaculture management platform designed to help fish farmers optimize feeding, monitor water quality, and estimate biomass efficiently using AI and IoT technologies.

By combining computer vision (YOLO), real-time sensor data, and AI-driven insights, ikanDoiT eliminates guesswork and enables data-driven decision-making for modern fish farming.

## ✨ Features

### 💧 Real-Time Water Quality Monitoring
- Tracks key parameters:
    - Dissolved Oxygen (DO)
    - pH
    - Temperature
    - Ammonia (NH₃)
    - Nitrate (NO₃)
    - Salinity
- Continuous monitoring via IoT sensors (ESP32)
- Alerts for abnormal conditions

### 🐟 Biomass Estimation via Computer Vision
- Upload pond videos to estimate fish size and biomass
- YOLO-based fish detection and measurement
- Automatic calculation of:
    - Average fish length
    - Estimated weight  
    - Total biomass
- Tracks actual vs predicted fish weight progression to support planning and decision-making.
- Displays latest biomass logs in Recent Records

### 🍽️ Feeding Optimization
- Automatic feed calculation based on biomass
- Smart feeding schedules
- Feeding history tracking and analytics
- Monthly feed cost estimation

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

## 📁 Project Structure

```text
project-root/
├── public/
├── src/
│   ├── assets/              # Images, videos
│   ├── components/          # Shared components + shadcn/ui primitives
│   ├── hooks/               # App hooks
│   ├── lib/                 # Utilities (e.g. cn / class merge)
│   ├── pages/               # App pages (Dashboard, Water, Biomass, Feeding, Shop)
│   │   └── feeding/         # Feeding module (hooks, components, utils, types)
│   ├── shared/              # aquaCore (Supabase client + shared UI helpers)
│   ├── App.tsx              # Router setup
│   └── main.tsx             # React bootstrap
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
- Improve the trained YOLO model for more accurate fish shape detection and length estimation. 
- Notifications (email/SMS/WhatsApp) for critical pond alerts

## 🤝 Contributing
1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License
No license file is included yet. If you plan to open-source this repository, add a `LICENSE` (e.g., MIT) before publishing.
