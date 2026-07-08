# ExamHub Tanzania — Supabase Setup

## Project
- **URL:** https://klmmmkxanuvabcixnjrl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/klmmmkxanuvabcixnjrl/sql/new

---

## Step 1 — Run Migrations (SQL Editor)

Open each file and paste into:
https://supabase.com/dashboard/project/klmmmkxanuvabcixnjrl/sql/new

Run **in order**:

| # | File | Contents |
|---|---|---|
| 1 | `001_init_schema.sql` | All 14 tables, indexes, triggers |
| 2 | `002_rls_policies.sql` | Row Level Security (40+ policies) |
| 3 | `003_seed_data.sql` | Subjects, badges, demo schools, BIO2024 exam |
| 4 | `004_storage.sql` | 5 storage buckets |
| 5 | `005_functions_rpc.sql` | 8 RPC functions |
| 6 | `006_realtime.sql` | Realtime publications |
| 7 | `007_rate_limiting.sql` | Rate limits + audit logs |

---

## Step 2 — Deploy Edge Functions

```bash
# Install Supabase CLI first (if not installed)
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref klmmmkxanuvabcixnjrl

# Set the Anthropic secret (server-side only — never in .env)
supabase secrets set ANTHROPIC_KEY=sk-ant-your-key-here

# Deploy all functions
supabase functions deploy create-student
supabase functions deploy create-teacher
supabase functions deploy join-online-exam
supabase functions deploy submit-exam
supabase functions deploy send-notification
supabase functions deploy ai-tutor
supabase functions deploy ai-revision-plan
```

### Why each function is self-contained
Supabase bundles each Edge Function in an isolated temp directory.
Relative imports like `"../_shared/supabase.ts"` fail because
the `_shared` folder doesn't exist in that temp context.

Each function imports directly from esm.sh CDN:
```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
```

---

## Step 3 — Verify

Run this in SQL Editor to confirm everything is set up:
```sql
SELECT
  (SELECT COUNT(*) FROM subjects)     AS subjects,
  (SELECT COUNT(*) FROM badges)       AS badges,
  (SELECT COUNT(*) FROM schools)      AS schools,
  (SELECT COUNT(*) FROM online_exams) AS online_exams;
-- Expected: 16, 15, 5, 1
```

---

## Edge Function Endpoints

| Function | Method | Auth | Use |
|---|---|---|---|
| `create-student` | POST | None | Student registration |
| `create-teacher` | POST | school_admin+ | Teacher creation |
| `join-online-exam` | POST | None | Join exam by code |
| `submit-exam` | POST | None | Submit answers |
| `send-notification` | POST | teacher+ | Push notifications |
| `ai-tutor` | POST | authenticated | Question explanation |
| `ai-revision-plan` | POST | authenticated | Study plan |

---

## RPC Functions (call from frontend)

```ts
// Student dashboard
const { data } = await supabase.rpc('get_student_dashboard', { p_student_id: userId });

// Join online exam (also works without auth for guests)
const { data } = await supabase.rpc('join_online_exam', {
  p_join_code:    'BIO2024',
  p_guest_name:   'Amina Hassan',
  p_guest_school: 'Nyerere SS',
  p_guest_region: 'Dar es Salaam',
});

// Live leaderboard (public — no auth needed)
const { data } = await supabase.rpc('get_online_exam_leaderboard', { p_exam_code: 'BIO2024' });

// Submit past paper
const { data } = await supabase.rpc('submit_exam_session', {
  p_student_id: userId,
  p_exam_id:    examId,
  p_answers:    { "q1": 2, "q2": true, "q3": "photosynthesis" },
  p_time_secs:  3420,
});

// Public leaderboard
const { data } = await supabase.rpc('get_public_leaderboard', { p_limit: 50 });
```

---

## Demo
- Join code **BIO2024** → live Biology exam, 10 questions
- Public leaderboard: `/leaderboard`

## Storage Buckets
| Bucket | Public | Max Size | For |
|---|---|---|---|
| `exam-papers` | No | 25MB | PDF past papers |
| `avatars` | Yes | 2MB | Profile photos |
| `homework-files` | No | 10MB | Teacher/student files |
| `school-assets` | Yes | 5MB | School logos |
| `question-images` | Yes | 3MB | Question images |
