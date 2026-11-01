-- NextHire PostgreSQL schema for Supabase.
-- Apply in Supabase SQL Editor or with: supabase db push
-- Authentication secrets belong in Supabase Auth, never in public.users.

create extension if not exists pgcrypto;

create table public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table public.interview_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  role text not null,
  interview_type text not null check (interview_type in ('hr', 'behavioral', 'technical')),
  language text not null default 'en' check (language in ('en', 'ms')),
  persona text not null default 'neutral' check (persona in ('neutral', 'friendly', 'strict')),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  current_question_no integer not null default 0 check (current_question_no >= 0),
  total_questions integer not null default 5 check (total_questions > 0),
  average_score numeric(5,2),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.session_progress (
  progress_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  session_id uuid not null unique references public.interview_sessions(session_id) on delete cascade,
  average_score numeric(5,2), filler_rate numeric(8,2), nervous_percent numeric(5,2), improvement_score numeric(5,2),
  recorded_at timestamptz not null default now()
);

create table public.session_reports (
  report_id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.interview_sessions(session_id) on delete cascade,
  average_score numeric(5,2) not null, answered_count integer not null default 0, question_count integer not null default 0,
  strengths_summary text, weaknesses_summary text, suggestions_summary text, report_summary text, pdf_path text,
  generated_at timestamptz not null default now()
);

create table public.interview_questions (
  question_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(session_id) on delete cascade,
  question_no integer not null check (question_no > 0), question_text text not null, question_type text not null,
  generated_by text not null default 'ai' check (generated_by in ('ai', 'template_fallback')),
  is_follow_up boolean not null default false,
  parent_question_id uuid references public.interview_questions(question_id),
  created_at timestamptz not null default now(), unique(session_id, question_no)
);

create table public.interview_answers (
  answer_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(session_id) on delete cascade,
  question_id uuid not null references public.interview_questions(question_id) on delete cascade,
  answer_text text, answer_method text not null default 'text' check (answer_method in ('text', 'audio', 'video')),
  audio_file_path text, duration_seconds numeric(10,2) default 0, is_selected_answer boolean not null default true,
  submitted_at timestamptz not null default now()
);

create table public.answer_evaluations (
  evaluation_id uuid primary key default gen_random_uuid(), answer_id uuid not null unique references public.interview_answers(answer_id) on delete cascade,
  relevance_score numeric(5,2) not null, clarity_score numeric(5,2) not null, specificity_score numeric(5,2) not null,
  technical_accuracy_score numeric(5,2) not null, overall_score numeric(5,2) not null,
  strengths text, weaknesses text, improvements text, example_answer text, summary text,
  evaluation_source text not null default 'ai' check (evaluation_source in ('ai', 'rule_based_fallback')),
  created_at timestamptz not null default now()
);

create table public.audio_analyses (
  audio_analysis_id uuid primary key default gen_random_uuid(), answer_id uuid not null unique references public.interview_answers(answer_id) on delete cascade,
  transcript text, word_count integer default 0, duration_seconds numeric(10,2) default 0, speaking_rate_wpm numeric(8,2),
  filler_total integer default 0, filler_rate_per_100_words numeric(8,2) default 0, silence_count integer default 0,
  silence_data jsonb, measured boolean not null default false, created_at timestamptz not null default now()
);

create table public.facial_analyses (
  facial_analysis_id uuid primary key default gen_random_uuid(), answer_id uuid not null unique references public.interview_answers(answer_id) on delete cascade,
  dominant_expression text, nervous_percent numeric(5,2), confidence_score numeric(5,2), eye_contact_score numeric(5,2),
  raw_metrics jsonb, created_at timestamptz not null default now()
);

create table public.answer_attempts (
  attempt_id uuid primary key default gen_random_uuid(), question_id uuid not null references public.interview_questions(question_id) on delete cascade,
  answer_id uuid not null references public.interview_answers(answer_id) on delete cascade, attempt_no integer not null check (attempt_no > 0),
  previous_score numeric(5,2), new_score numeric(5,2), score_difference numeric(5,2), is_best_attempt boolean not null default false,
  attempted_at timestamptz not null default now(), unique(question_id, attempt_no)
);

create table public.follow_up_questions (
  follow_up_id uuid primary key default gen_random_uuid(), question_id uuid not null references public.interview_questions(question_id) on delete cascade,
  answer_id uuid not null references public.interview_answers(answer_id) on delete cascade, follow_up_text text not null,
  generated_by text not null default 'ai' check (generated_by in ('ai', 'template_fallback')), created_at timestamptz not null default now()
);

create index idx_sessions_user on public.interview_sessions(user_id);
create index idx_questions_session on public.interview_questions(session_id);
create index idx_answers_session on public.interview_answers(session_id);
create index idx_answers_question on public.interview_answers(question_id);
create index idx_attempts_question on public.answer_attempts(question_id);
create index idx_followups_question on public.follow_up_questions(question_id);

-- Each user can only access rows belonging to their own interview sessions.
alter table public.users enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.session_progress enable row level security;
alter table public.session_reports enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.answer_evaluations enable row level security;
alter table public.audio_analyses enable row level security;
alter table public.facial_analyses enable row level security;
alter table public.answer_attempts enable row level security;
alter table public.follow_up_questions enable row level security;

create policy "users manage own profile" on public.users for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own sessions" on public.interview_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own progress" on public.session_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users read own reports" on public.session_reports for select using (exists (select 1 from public.interview_sessions s where s.session_id = session_reports.session_id and s.user_id = auth.uid()));
create policy "users manage own questions" on public.interview_questions for all using (exists (select 1 from public.interview_sessions s where s.session_id = interview_questions.session_id and s.user_id = auth.uid())) with check (exists (select 1 from public.interview_sessions s where s.session_id = interview_questions.session_id and s.user_id = auth.uid()));
create policy "users manage own answers" on public.interview_answers for all using (exists (select 1 from public.interview_sessions s where s.session_id = interview_answers.session_id and s.user_id = auth.uid())) with check (exists (select 1 from public.interview_sessions s where s.session_id = interview_answers.session_id and s.user_id = auth.uid()));
create policy "users read own evaluations" on public.answer_evaluations for select using (exists (select 1 from public.interview_answers a join public.interview_sessions s on s.session_id = a.session_id where a.answer_id = answer_evaluations.answer_id and s.user_id = auth.uid()));
create policy "users read own audio analyses" on public.audio_analyses for select using (exists (select 1 from public.interview_answers a join public.interview_sessions s on s.session_id = a.session_id where a.answer_id = audio_analyses.answer_id and s.user_id = auth.uid()));
create policy "users read own facial analyses" on public.facial_analyses for select using (exists (select 1 from public.interview_answers a join public.interview_sessions s on s.session_id = a.session_id where a.answer_id = facial_analyses.answer_id and s.user_id = auth.uid()));
create policy "users manage own attempts" on public.answer_attempts for all using (exists (select 1 from public.interview_questions q join public.interview_sessions s on s.session_id = q.session_id where q.question_id = answer_attempts.question_id and s.user_id = auth.uid())) with check (exists (select 1 from public.interview_questions q join public.interview_sessions s on s.session_id = q.session_id where q.question_id = answer_attempts.question_id and s.user_id = auth.uid()));
create policy "users read own followups" on public.follow_up_questions for select using (exists (select 1 from public.interview_questions q join public.interview_sessions s on s.session_id = q.session_id where q.question_id = follow_up_questions.question_id and s.user_id = auth.uid()));

-- Automatically create the public profile when a Supabase Auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (user_id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
