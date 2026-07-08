# ExamHub Tanzania 🇹🇿

Tanzania's national digital exam preparation platform — NECTA past papers from Standard 4 to Form 6, live online exams, AI tutoring, and real-time leaderboards.

## Audit Fixes Applied (v1.1)
- ✅ All Git merge conflicts resolved (24 files)
- ✅ Anthropic API key moved server-side (Edge Function only — never exposed to browser)
- ✅ AuthGuard on all private routes with role hierarchy enforcement
- ✅ Lazy-loaded routes (code splitting — faster initial load)
- ✅ Rate limiting table + check_rate_limit() RPC (007 migration)
- ✅ Anti-cheat: tab-switch detection hook + exam_integrity_events table
- ✅ Audit log table for all sensitive actions
- ✅ Auto-save exam progress (localStorage, 4h expiry)
- ✅ Session stored in sessionStorage (cleared on tab close)
- ✅ Clean TypeScript types for all entities
- ✅ useAuth, useExam, useRealtime custom hooks

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Routing | React Router DOM v6 (lazy-loaded) |
| Styling | Tailwind CSS v3 + CSS Variables |
| Charts | Recharts |
| State | Zustand + sessionStorage |
| Backend | Supabase (Auth + PostgreSQL + Realtime + Storage + Edge Functions) |
| AI | Anthropic Claude Sonnet 4.6 (server-side Edge Function only) |
| Animation | Framer Motion |

## Quick Start
```bash
git clone https://github.com/MbazaCodes/Exams-Hub.git
cd Exams-Hub
npm install
cp .env.example .env   # add your Supabase keys
npm run dev            # http://localhost:3000
```

## Supabase Setup (run in SQL Editor — in order)
```
001_init_schema.sql   → Tables, indexes, triggers
002_rls_policies.sql  → Row Level Security
003_seed_data.sql     → Subjects, badges, demo school, BIO2024 exam
004_storage.sql       → 5 storage buckets
005_functions_rpc.sql → 8 RPC functions
006_realtime.sql      → Realtime publications
007_rate_limiting.sql → Rate limits + audit logs
```

## Deploy Edge Functions
```bash
supabase link --project-ref klmmmkxanuvabcixnjrl
supabase functions deploy ai-tutor           # ← Anthropic key lives here
supabase functions deploy ai-revision-plan
supabase functions deploy create-student
supabase functions deploy create-teacher
supabase functions deploy join-online-exam
supabase functions deploy submit-exam
supabase functions deploy send-notification

# Set server-side secret (never in .env — this is the Supabase Vault)
supabase secrets set ANTHROPIC_KEY=sk-ant-your-key
```

## Routes
| Route | Auth | Role |
|---|---|---|
| `/` | ❌ Public | — |
| `/leaderboard` | ❌ Public | — |
| `/online-exam` | ❌ Public | — |
| `/dashboard` | ✅ Required | Student+ |
| `/papers` | ✅ Required | Student+ |
| `/exam` | ✅ Required | Student+ |
| `/results` | ✅ Required | Student+ |
| `/analytics` | ✅ Required | Student+ |
| `/activities` | ✅ Required | Student+ |
| `/teacher` | ✅ Required | Teacher+ |
| `/school` | ✅ Required | School Admin+ |
| `/superadmin` | ✅ Required | Super Admin |

## Security Architecture
```
Browser
  ↓ (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY only)
Supabase Auth + RLS
  ↓ (service role key — server only)
Supabase Edge Functions
  ↓ (ANTHROPIC_KEY — Supabase Vault)
Anthropic Claude API
```
The browser NEVER holds the Anthropic key or Supabase service role key.

## Demo
- Join code **BIO2024** → live online Biology exam (10 questions)
- Public leaderboard: `/leaderboard`

## Developer
David Mbazza — [@MbazaCodes](https://github.com/MbazaCodes)
