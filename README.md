<h1 align="center">ikanDoiT</h1>

<p align="center">
  <strong>Smart Aquaculture Management System</strong>
</p>

<p align="center">
  <em>Empowering Smarter Aquaculture Through Vision.</em>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/VITE-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/REACT-Library-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TAILWIND-CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/SHADCN%2FUI-Components-black?style=for-the-badge&logo=radixui&logoColor=white" />
  <img src="https://img.shields.io/badge/SUPABASE-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black" />
  <img src="https://img.shields.io/badge/RECHARTS-Charts-FF6384?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GEMINI_AI-Google-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

---

## 📖 About ikanDoiT

ikanDoiT is a **smart aquaculture management platform** designed to help fish farmers:

- Optimize feeding  
- Monitor water quality  
- Estimate biomass efficiently  

Using **AI and IoT technologies**, ikanDoiT eliminates guesswork and enables **data-driven decision-making** for modern fish farming.

---

## ✨ Features

### 💧 Real-Time Water Quality Monitoring
- Tracks key parameters:
  - Dissolved Oxygen (DO)
  - pH
  - Temperature
  - Ammonia (NH₃)
  - Nitrate (NO₃)
  - Salinity
- Continuous monitoring via **IoT sensors (ESP32)**
- Alerts for abnormal conditions

---

### 🐟 Biomass Estimation via Computer Vision
- Upload pond videos to estimate fish size and biomass
- **YOLO-based** fish detection and measurement
- Automatic calculation of:
  - Average fish length
  - Estimated weight  
  - Total biomass  
- Tracks **actual vs predicted growth trends**
- Displays latest biomass logs in **Recent Records**

---

### 🍽️ Feeding Optimization
- Automatic feed calculation based on biomass
- Smart feeding schedules
- Feeding history tracking and analytics
- Monthly feed cost estimation

---

### 🔐 Authentication (Supabase)
- Email/password login and signup
- Graceful demo fallback when Supabase is not configured

---

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

---

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

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ recommended  
- Bun (optional)

---

### 1) Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd ikandoit_lovable
```

---

### 2) Install dependencies

Using Bun:
```bash
bun install
```

Using npm:
```bash
npm install
```

---

### 3) Configure environment variables (optional)

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

### 4) Run the app

```bash
bun run dev
# or
npm run dev
```

Runs on: **http://localhost:8080**

---

## 🗄️ Supabase Notes (Optional)

- Uses Supabase for auth, persistence, and realtime
- Works in **demo mode** without configuration

Tables:
- `biomass_records`
- `feeding_logs`
- `feed_prices`

---

## 🔒 Security

- Secrets stored in `.env` (**gitignored**)  
- No hardcoded credentials  
- Use **Supabase RLS policies** before deployment  

---

## ✅ Testing

```bash
bun run test
# or
npm run test
```

E2E:
```bash
npx playwright install
npx playwright test
```

---

## 📸 Screenshots
Coming soon

---

## 🗺️ Future Roadmap

- Real sensor ingestion pipeline (MQTT/HTTP)  
- Improve YOLO model for better fish detection and length accuracy  
- Notifications (email/SMS/WhatsApp)  

---

## 🤝 Contributing

1. Fork the repository  
2. Create a branch  
3. Commit changes  
4. Push and open PR  

---

## 📄 License

No license yet — consider adding **MIT License** for open-source use.