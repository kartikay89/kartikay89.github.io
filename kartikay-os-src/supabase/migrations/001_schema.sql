-- ============================================================
-- Kartikay OS — Supabase Schema Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Life Areas ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.life_areas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'FolderOpen',
  color       TEXT NOT NULL DEFAULT 'gray',
  archived    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,
  version     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS life_areas_user_id_idx ON public.life_areas (user_id);
CREATE INDEX IF NOT EXISTS life_areas_updated_at_idx ON public.life_areas (updated_at);
CREATE INDEX IF NOT EXISTS life_areas_deleted_at_idx ON public.life_areas (deleted_at);

ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_areas_select_own" ON public.life_areas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "life_areas_insert_own" ON public.life_areas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "life_areas_update_own" ON public.life_areas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "life_areas_delete_own" ON public.life_areas
  FOR DELETE USING (auth.uid() = user_id);

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  description          TEXT,
  area_id              UUID REFERENCES public.life_areas(id) ON DELETE SET NULL,
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  status               TEXT NOT NULL DEFAULT 'todo'
                         CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority             TEXT NOT NULL DEFAULT 'normal'
                         CHECK (priority IN ('urgent', 'important', 'normal', 'low')),
  scheduled_date       DATE,
  planned_start        TIME,
  planned_end          TIME,
  pomodoro_goal        INTEGER NOT NULL DEFAULT 2,
  completed_pomodoros  INTEGER NOT NULL DEFAULT 0,
  focused_seconds      INTEGER NOT NULL DEFAULT 0,
  notes                TEXT NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  version              INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx        ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_updated_at_idx     ON public.tasks (updated_at);
CREATE INDEX IF NOT EXISTS tasks_deleted_at_idx     ON public.tasks (deleted_at);
CREATE INDEX IF NOT EXISTS tasks_scheduled_date_idx ON public.tasks (scheduled_date);
CREATE INDEX IF NOT EXISTS tasks_status_idx         ON public.tasks (status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ── Notes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'text'
                CHECK (type IN ('text', 'markdown', 'code')),
  language    TEXT,
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  folder      TEXT NOT NULL DEFAULT 'ideas'
                CHECK (folder IN ('all', 'ideas', 'journal', 'code')),
  archived    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,
  version     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx    ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON public.notes (updated_at);
CREATE INDEX IF NOT EXISTS notes_deleted_at_idx ON public.notes (deleted_at);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_own" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- ── Pomodoro Sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id                UUID NOT NULL,
  started_at             TIMESTAMPTZ NOT NULL,
  ended_at               TIMESTAMPTZ,
  duration_seconds       INTEGER NOT NULL DEFAULT 1500,
  actual_focused_seconds INTEGER NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'running'
                           CHECK (status IN ('running', 'paused', 'completed', 'cancelled')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at             TIMESTAMPTZ,
  version                INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS pomo_user_id_idx    ON public.pomodoro_sessions (user_id);
CREATE INDEX IF NOT EXISTS pomo_task_id_idx    ON public.pomodoro_sessions (task_id);
CREATE INDEX IF NOT EXISTS pomo_updated_at_idx ON public.pomodoro_sessions (updated_at);
CREATE INDEX IF NOT EXISTS pomo_deleted_at_idx ON public.pomodoro_sessions (deleted_at);

ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pomo_select_own" ON public.pomodoro_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pomo_insert_own" ON public.pomodoro_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pomo_update_own" ON public.pomodoro_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pomo_delete_own" ON public.pomodoro_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ── User Settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name                TEXT,
  timezone                    TEXT DEFAULT 'UTC',
  first_day_of_week           INTEGER NOT NULL DEFAULT 1,
  use_24_hour                 BOOLEAN NOT NULL DEFAULT false,
  pomodoro_duration           INTEGER NOT NULL DEFAULT 1500,
  short_break_duration        INTEGER NOT NULL DEFAULT 300,
  long_break_duration         INTEGER NOT NULL DEFAULT 900,
  sessions_before_long_break  INTEGER NOT NULL DEFAULT 4,
  auto_start_break            BOOLEAN NOT NULL DEFAULT false,
  notification_sound          BOOLEAN NOT NULL DEFAULT true,
  default_priority            TEXT NOT NULL DEFAULT 'normal',
  default_pomodoro_goal       INTEGER NOT NULL DEFAULT 2,
  color_mode                  TEXT NOT NULL DEFAULT 'light',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  version                     INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS settings_user_id_idx ON public.user_settings (user_id);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_own" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER life_areas_updated_at BEFORE UPDATE ON public.life_areas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pomodoro_sessions_updated_at BEFORE UPDATE ON public.pomodoro_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
