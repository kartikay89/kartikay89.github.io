// Supabase database type definitions
// These match the SQL schema in supabase/migrations/

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Partial<DbProfile> & { id: string };
        Update: Partial<DbProfile>;
        Relationships: [];
      };
      life_areas: {
        Row: DbLifeArea;
        Insert: Partial<DbLifeArea> & { id: string; user_id: string; name: string };
        Update: Partial<DbLifeArea>;
        Relationships: [];
      };
      tasks: {
        Row: DbTask;
        Insert: Partial<DbTask> & { id: string; user_id: string; title: string };
        Update: Partial<DbTask>;
        Relationships: [];
      };
      notes: {
        Row: DbNote;
        Insert: Partial<DbNote> & { id: string; user_id: string; title: string };
        Update: Partial<DbNote>;
        Relationships: [];
      };
      pomodoro_sessions: {
        Row: DbPomodoroSession;
        Insert: Partial<DbPomodoroSession> & { id: string; user_id: string; task_id: string };
        Update: Partial<DbPomodoroSession>;
        Relationships: [];
      };
      user_settings: {
        Row: DbUserSettings;
        Insert: Partial<DbUserSettings> & { user_id: string };
        Update: Partial<DbUserSettings>;
        Relationships: [];
      };
    };
  };
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLifeArea {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
}

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  area_id: string | null;
  tags: string[];
  status: string;
  priority: string;
  scheduled_date: string | null;
  planned_start: string | null;
  planned_end: string | null;
  pomodoro_goal: number;
  completed_pomodoros: number;
  focused_seconds: number;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  completed_at: string | null;
  version: number;
}

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  type: string;
  language: string | null;
  content: string;
  tags: string[];
  folder: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
}

export interface DbPomodoroSession {
  id: string;
  user_id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  actual_focused_seconds: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  display_name: string | null;
  timezone: string | null;
  first_day_of_week: number;
  use_24_hour: boolean;
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
  auto_start_break: boolean;
  notification_sound: boolean;
  default_priority: string;
  default_pomodoro_goal: number;
  color_mode: string;
  created_at: string;
  updated_at: string;
  version: number;
}
