-- ================================================================
-- ExamHub Tanzania — Migration 003: Seed Data
-- ================================================================

-- ── SUBJECTS ──────────────────────────────────────────────────
INSERT INTO subjects (name, code, icon, color, levels) VALUES
  ('Mathematics',     'MATH', '📐', '#4F46E5', ARRAY['standard_4','standard_7','form_2','form_4','form_6']::education_level[]),
  ('English',         'ENG',  '📖', '#14B8A6', ARRAY['standard_4','standard_7','form_2','form_4','form_6']::education_level[]),
  ('Kiswahili',       'KIS',  '🗣️',  '#10B981', ARRAY['standard_4','standard_7','form_2','form_4','form_6']::education_level[]),
  ('Biology',         'BIO',  '🧬', '#10B981', ARRAY['form_2','form_4','form_6']::education_level[]),
  ('Chemistry',       'CHEM', '⚗️',  '#EF4444', ARRAY['form_2','form_4','form_6']::education_level[]),
  ('Physics',         'PHY',  '⚡', '#F59E0B', ARRAY['form_2','form_4','form_6']::education_level[]),
  ('Geography',       'GEO',  '🗺️',  '#14B8A6', ARRAY['form_2','form_4']::education_level[]),
  ('History',         'HIST', '📜', '#8B5CF6', ARRAY['form_2','form_4']::education_level[]),
  ('Civics',          'CIV',  '🏛️',  '#EC4899', ARRAY['form_2','form_4']::education_level[]),
  ('Commerce',        'COM',  '💼', '#F59E0B', ARRAY['form_2','form_4']::education_level[]),
  ('Book Keeping',    'BK',   '📒', '#6366F1', ARRAY['form_2','form_4']::education_level[]),
  ('Agriculture',     'AGR',  '🌾', '#10B981', ARRAY['form_2','form_4']::education_level[]),
  ('ICT',             'ICT',  '💻', '#4F46E5', ARRAY['form_2','form_4']::education_level[]),
  ('General Studies', 'GS',   '🎓', '#8B5CF6', ARRAY['form_6']::education_level[]),
  ('Science',         'SCI',  '🔬', '#8B5CF6', ARRAY['standard_4','standard_7']::education_level[]),
  ('Social Studies',  'SS',   '🌍', '#F59E0B', ARRAY['standard_4','standard_7']::education_level[])
ON CONFLICT (name) DO NOTHING;

-- ── BIOLOGY TOPICS ────────────────────────────────────────────
INSERT INTO topics (subject_id, name, level, sort_order)
SELECT s.id, t.name, t.level::education_level, t.sort_order FROM subjects s
JOIN (VALUES
  ('Cell Biology',         'form_4', 1),
  ('Cell Transport',       'form_4', 2),
  ('Nutrition',            'form_4', 3),
  ('Respiration',          'form_4', 4),
  ('Photosynthesis',       'form_4', 5),
  ('Excretion',            'form_4', 6),
  ('Coordination',         'form_4', 7),
  ('Reproduction',         'form_4', 8),
  ('Genetics',             'form_4', 9),
  ('Evolution',            'form_4', 10),
  ('Ecology',              'form_4', 11),
  ('Immunity & Disease',   'form_4', 12),
  ('Classification',       'form_2', 1),
  ('Cell Structure',       'form_2', 2),
  ('Feeding & Digestion',  'form_2', 3),
  ('Breathing',            'form_2', 4)
) AS t(name, level, sort_order) ON s.name = 'Biology';

-- ── MATHEMATICS TOPICS ────────────────────────────────────────
INSERT INTO topics (subject_id, name, level, sort_order)
SELECT s.id, t.name, t.level::education_level, t.sort_order FROM subjects s
JOIN (VALUES
  ('Algebra',               'form_4', 1),
  ('Quadratic Equations',   'form_4', 2),
  ('Coordinate Geometry',   'form_4', 3),
  ('Trigonometry',          'form_4', 4),
  ('Statistics',            'form_4', 5),
  ('Probability',           'form_4', 6),
  ('Functions & Graphs',    'form_4', 7),
  ('Vectors',               'form_4', 8),
  ('Matrices',              'form_4', 9),
  ('Logarithms',            'form_4', 10),
  ('Sets',                  'form_2', 1),
  ('Numbers',               'form_2', 2),
  ('Fractions',             'form_2', 3),
  ('Geometry',              'form_2', 4)
) AS t(name, level, sort_order) ON s.name = 'Mathematics';

-- ── CHEMISTRY TOPICS ──────────────────────────────────────────
INSERT INTO topics (subject_id, name, level, sort_order)
SELECT s.id, t.name, t.level::education_level, t.sort_order FROM subjects s
JOIN (VALUES
  ('Atomic Structure',        'form_4', 1),
  ('Periodic Table',          'form_4', 2),
  ('Chemical Bonding',        'form_4', 3),
  ('Organic Chemistry',       'form_4', 4),
  ('Acids, Bases & Salts',    'form_4', 5),
  ('Electrochemistry',        'form_4', 6),
  ('Rates of Reaction',       'form_4', 7),
  ('Stoichiometry',           'form_4', 8),
  ('Extraction of Metals',    'form_4', 9)
) AS t(name, level, sort_order) ON s.name = 'Chemistry';

-- ── BADGES ────────────────────────────────────────────────────
INSERT INTO badges (code, name, description, icon, color, xp_reward, criteria) VALUES
  ('first_exam',      'First Step',       'Completed your first exam',              '🎯', '#4F46E5', 50,  '{"type":"exam_count","value":1}'),
  ('streak_7',        'Week Warrior',     'Maintained a 7-day study streak',        '🔥', '#F59E0B', 100, '{"type":"streak","value":7}'),
  ('streak_30',       'Monthly Master',   'Maintained a 30-day study streak',       '🔥', '#EF4444', 500, '{"type":"streak","value":30}'),
  ('perfect_score',   'Perfectionist',    'Scored 100% on any exam',                '⭐', '#F59E0B', 300, '{"type":"perfect_score"}'),
  ('grade_a',         'Grade A Student',  'Achieved Grade A on any NECTA paper',   '🏆', '#10B981', 150, '{"type":"grade","value":"A"}'),
  ('papers_10',       'Paper Champion',   'Completed 10 past papers',               '📚', '#6366F1', 100, '{"type":"exam_count","value":10}'),
  ('papers_50',       'Exam Expert',      'Completed 50 past papers',               '🎓', '#8B5CF6', 500, '{"type":"exam_count","value":50}'),
  ('speed_demon',     'Speed Solver',     'Completed an exam in under half the time','⚡', '#14B8A6', 200, '{"type":"speed"}'),
  ('top_10',          'Top Performer',    'Ranked in top 10 nationally',            '🌟', '#F59E0B', 400, '{"type":"rank","value":10}'),
  ('accuracy_90',     'Accuracy Ace',     'Scored 90%+ on 5 consecutive exams',     '🎯', '#EC4899', 250, '{"type":"accuracy","value":90,"count":5}'),
  ('ai_tutor',        'AI Student',       'Used AI Tutor to review 20 questions',   '🤖', '#4F46E5', 75,  '{"type":"ai_queries","value":20}'),
  ('online_first',    'Online Pioneer',   'Participated in first online global exam','🌐', '#14B8A6', 150, '{"type":"online_exam","value":1}'),
  ('online_top3',     'Podium Finisher',  'Finished in top 3 in a global exam',     '🥇', '#F59E0B', 600, '{"type":"online_rank","value":3}'),
  ('division_1',      'Division I',       'Achieved Division I in mock exam',        '🏅', '#10B981', 500, '{"type":"division","value":"I"}'),
  ('multi_subject',   'All Rounder',      'Practised 8 different subjects',          '📐', '#8B5CF6', 200, '{"type":"subjects","value":8}')
ON CONFLICT (code) DO NOTHING;

-- ── DEMO SCHOOL ───────────────────────────────────────────────
INSERT INTO schools (name, short_name, reg_number, region, district, type, plan, status, total_students, total_teachers) VALUES
  ('Mwalimu Julius K. Nyerere Secondary School', 'Nyerere SS', 'S.1234/2001', 'Dar es Salaam', 'Kinondoni', 'government', 'premium', 'active', 876, 42),
  ('Kilimanjaro Girls High School',              'KGHS',       'S.0089/1998', 'Kilimanjaro',   'Moshi',     'government', 'premium', 'active', 340, 28),
  ('Arusha International Academy',               'AIA',        'S.0512/2005', 'Arusha',        'Arusha',    'private',    'premium', 'active', 410, 35),
  ('Zanzibar Academy',                           'ZA',         'S.0201/2003', 'Zanzibar',      'Mjini',     'private',    'free',    'active', 195, 18),
  ('Dodoma National Secondary School',           'DNSS',       'S.0044/1995', 'Dodoma',        'Dodoma',    'government', 'premium', 'active', 520, 44)
ON CONFLICT (reg_number) DO NOTHING;

-- ── DEMO ONLINE EXAM ──────────────────────────────────────────
INSERT INTO online_exams (
  title, subject_name, level, description, join_code,
  duration_minutes, max_participants, status, scheduled_at,
  created_by, questions, settings
)
SELECT
  'National Biology Challenge 2024',
  'Biology', 'form_4',
  'A national online biology competition open to all Form 4 students across Tanzania.',
  'BIO2024', 60, 5000, 'live',
  NOW() - INTERVAL '1 hour',
  (SELECT id FROM profiles LIMIT 1),
  '[
    {"id":1,"type":"mcq","marks":2,"text":"Which organelle produces ATP in eukaryotic cells?","options":["Ribosome","Mitochondria","Golgi apparatus","Endoplasmic reticulum"],"correct":1,"topic":"Cell Biology"},
    {"id":2,"type":"mcq","marks":2,"text":"The primary function of the lymphatic system is:","options":["Blood filtration","Hormone secretion","Return excess fluid to blood","Oxygen transport"],"correct":2,"topic":"Physiology"},
    {"id":3,"type":"truefalse","marks":1,"text":"Osmosis moves solute particles from high to low concentration.","correct":false,"topic":"Cell Transport"},
    {"id":4,"type":"mcq","marks":2,"text":"Which is NOT a function of the liver?","options":["Detoxification","Bile production","Insulin secretion","Glycogen storage"],"correct":2,"topic":"Physiology"},
    {"id":5,"type":"mcq","marks":2,"text":"HIV/AIDS primarily destroys which white blood cells?","options":["Neutrophils","B-lymphocytes","T-helper cells (CD4+)","Eosinophils"],"correct":2,"topic":"Immunity & Disease"},
    {"id":6,"type":"truefalse","marks":1,"text":"Photosynthesis occurs in the mitochondria of plant cells.","correct":false,"topic":"Photosynthesis"},
    {"id":7,"type":"mcq","marks":2,"text":"During meiosis II, the chromosome number:","options":["Doubles","Remains the same","Halves","Quadruples"],"correct":1,"topic":"Genetics"},
    {"id":8,"type":"mcq","marks":2,"text":"Homeostasis refers to:","options":["Rate of metabolism","Maintenance of stable internal environment","Process of respiration","Mechanism of excretion"],"correct":1,"topic":"Coordination"},
    {"id":9,"type":"mcq","marks":2,"text":"Photosynthesis takes place in the:","options":["Nucleus","Mitochondria","Chloroplast","Ribosome"],"correct":2,"topic":"Photosynthesis"},
    {"id":10,"type":"mcq","marks":2,"text":"The theory of evolution by natural selection was proposed by:","options":["Gregor Mendel","Charles Darwin","Jean-Baptiste Lamarck","James Watson"],"correct":1,"topic":"Evolution"}
  ]'::jsonb,
  '{"shuffle_questions":false,"shuffle_options":false,"show_timer":true,"allow_flag":true,"show_live_leaderboard":true,"auto_submit_on_expire":true}'::jsonb
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1)
ON CONFLICT (join_code) DO NOTHING;

