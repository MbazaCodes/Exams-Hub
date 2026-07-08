# ExamHub Tanzania — Supabase Setup

## Project
- **URL:** https://klmmmkxanuvabcixnjrl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/klmmmkxanuvabcixnjrl

## Run Migrations

### Option A — Supabase CLI (recommended)
```bash
supabase login
supabase link --project-ref klmmmkxanuvabcixnjrl
supabase db push
```

### Option B — SQL Editor (manual)
Paste each migration into https://supabase.com/dashboard/project/klmmmkxanuvabcixnjrl/sql/new
Run in order:

| File | Contents |
|---|---|
| `001_init_schema.sql` | All tables, indexes, triggers, auto-functions |
| `002_rls_policies.sql` | Row Level Security for every table |
| `003_seed_data.sql` | Subjects, topics, badges, demo schools, demo exam |
| `004_storage.sql` | 5 storage buckets + upload policies |
| `005_functions_rpc.sql` | RPC functions called from frontend |
| `006_realtime.sql` | Enable realtime on live exam tables |

## Deploy Edge Functions
```bash
supabase functions deploy create-student
supabase functions deploy create-teacher
supabase functions deploy join-online-exam
supabase functions deploy submit-exam
supabase functions deploy send-notification
```

## Storage Buckets (created by migration 004)
| Bucket | Public | Max Size | Use |
|---|---|---|---|
| `exam-papers` | ❌ | 25MB | PDF past papers |
| `avatars` | ✅ | 2MB | Profile photos |
| `homework-files` | ❌ | 10MB | Teacher/student homework |
| `school-assets` | ✅ | 5MB | School logos |
| `question-images` | ✅ | 3MB | Images in questions |

## Key Tables
| Table | Description |
|---|---|
| `profiles` | Extends auth.users — all user types |
| `students` | Student profile + XP/streak/gamification |
| `teachers` | Teacher profile + subjects/classes |
| `schools` | Registered schools |
| `exams` | Past papers library |
| `questions` | Exam questions |
| `exam_sessions` | Student attempts on past papers |
| `online_exams` | Live global exam sessions |
| `online_exam_participants` | Students in a live exam |
| `badges` | Achievement badge definitions |
| `student_badges` | Badges earned by students |
| `notifications` | In-app notifications |
| `ai_queries` | AI Tutor usage log |

## RPC Functions (call from frontend)
```ts
// Student dashboard
supabase.rpc('get_student_dashboard', { p_student_id: userId })

// Join online exam
supabase.rpc('join_online_exam', { p_join_code: 'BIO2024', p_guest_name: 'Amina', p_guest_school: 'MNSS', p_guest_region: 'Dar es Salaam' })

// Submit online exam
supabase.rpc('submit_online_exam', { p_participant_id, p_answers, p_time_secs })

// Submit past paper
supabase.rpc('submit_exam_session', { p_student_id, p_exam_id, p_answers, p_time_secs })

// Public leaderboard (no auth)
supabase.rpc('get_public_leaderboard', { p_limit: 50 })

// Online exam leaderboard (no auth)
supabase.rpc('get_online_exam_leaderboard', { p_exam_code: 'BIO2024' })
```

## Realtime Subscriptions
```ts
// Live exam participants (lobby + leaderboard)
supabase.channel('exam-session-ID')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'online_exam_participants', filter: `exam_session_id=eq.ID` }, handler)
  .subscribe()

// Notifications
supabase.channel('my-notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.ME` }, handler)
  .subscribe()
```

## Demo Join Code
- **BIO2024** — National Biology Challenge 2024 (live, 10 questions)
