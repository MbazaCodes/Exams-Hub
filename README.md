# ExamHub Tanzania 🇹🇿

A modern digital exam preparation platform for Tanzanian students — covering NECTA past papers for Standard 4 through Form 6.

## Features
- 📝 Real past papers (NECTA, Mock, Regional, District)
- ⚡ Instant marking with grade & division
- 🤖 AI Tutor powered by Claude (Anthropic)
- 📊 Performance analytics & weak topic detection
- 🏆 Gamification — XP, badges, leaderboard
- 📱 Mobile-first, PWA-ready

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 + CSS Variables |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| AI | Anthropic Claude API |
| State | Zustand |
| Animation | Framer Motion |

## Project Structure
```
src/
├── pages/
│   ├── Phase1-Landing-Auth.jsx      Landing page + registration + login
│   ├── Phase2-Dashboard.jsx         Student dashboard with charts
│   ├── Phase3-PapersBrowser.jsx     Browse & filter past papers
│   ├── Phase4-ExamEngine.jsx        Full digital exam (timer, MCQ, T/F)
│   ├── Phase5-Results.jsx           Results + AI Tutor explanations
│   ├── Phase6-Analytics.jsx         Analytics (radar, pie, area charts)
│   ├── Phase7-Gamification.jsx      Flashcards, daily quiz, leaderboard
│   └── Phase8-AdminPortals.jsx      Teacher, School & Super Admin
├── components/
│   ├── ui/                          Button, Input, Card, Modal, Badge...
│   ├── layout/                      Sidebar, TopBar, PageShell
│   └── shared/                      ScoreRing, ExamTimer, SubjectIcon
├── lib/
│   ├── supabase.ts                  Supabase client + DB types
│   └── anthropic.ts                 AI Tutor helper
├── store/
│   └── authStore.ts                 Zustand auth store
├── styles/
│   └── index.css                    Global CSS + design tokens
├── types/index.ts                   TypeScript interfaces
└── utils/helpers.ts                 formatTime, getGrade, getDivision...
```

## Quick Start

```bash
# 1. Clone
git clone https://github.com/MbazaCodes/Exams-Hub.git
cd Exams-Hub

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Edit .env — add your Supabase + Anthropic keys

# 4. Run
npm run dev
# Opens http://localhost:3000
```

## Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_KEY=sk-ant-your-key
```

## Routes
| Route | Page |
|---|---|
| `/` | Landing + Auth |
| `/dashboard` | Student Dashboard |
| `/papers` | Past Papers Browser |
| `/exam` | Digital Exam Engine |
| `/results` | Results + AI Review |
| `/analytics` | Analytics Dashboard |
| `/activities` | Gamification + Activities |
| `/admin` | Teacher & Admin Portals |

## Developed by
David Mbazza — [@MbazaCodes](https://github.com/MbazaCodes)
Built with Claude (Anthropic) 🤖
