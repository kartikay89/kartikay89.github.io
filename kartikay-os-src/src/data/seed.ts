import type { Task, LifeArea, Note, PomodoroSession, AppSettings, UserProfile } from "@/types";

export const SEED_USER: UserProfile = {
  id: "local-user",
  fullName: "Kartikay Singh",
  email: "kartikays89@gmail.com",
  createdAt: "2026-07-01T00:00:00.000Z",
};

export const DEFAULT_SETTINGS: AppSettings = {
  userId: "local-user",
  displayName: "Kartikay Singh",
  timezone: "Asia/Kolkata",
  firstDayOfWeek: 1,
  use24Hour: false,
  defaultLandingPage: "today",
  pomodoroDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsBeforeLongBreak: 4,
  autoStartBreak: false,
  autoStartNextSession: false,
  notificationSound: true,
  defaultPriority: "normal",
  defaultPomodoroGoal: 2,
  defaultAreaId: "area-work",
  colorMode: "light",
  accentColor: "#1463ff",
};

export const SEED_AREAS: LifeArea[] = [
  { id: "area-work", userId: "local-user", name: "Work / Office", icon: "Briefcase", color: "blue", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-business", userId: "local-user", name: "Business", icon: "TrendingUp", color: "violet", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-learning", userId: "local-user", name: "Learning", icon: "GraduationCap", color: "amber", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-health", userId: "local-user", name: "Health", icon: "Heart", color: "green", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-personal", userId: "local-user", name: "Personal", icon: "User", color: "cyan", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-finance", userId: "local-user", name: "Finance", icon: "CircleDollarSign", color: "emerald", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-projects", userId: "local-user", name: "Projects", icon: "FolderOpen", color: "orange", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
  { id: "area-inbox", userId: "local-user", name: "Inbox", icon: "Inbox", color: "gray", archived: false, createdAt: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-01T00:00:00.000Z", version: 1, syncStatus: "synced" },
];

export const SEED_TASKS: Task[] = [
  {
    id: "task-1", userId: "local-user", title: "Build life management app", description: "Create a complete productivity OS with tasks, notes, and focus tracking", areaId: "area-work", tags: ["Deep Work", "Dev"], status: "in_progress", priority: "urgent", scheduledDate: "2026-07-21", plannedStart: "09:00", plannedEnd: "11:00", pomodoroGoal: 4, completedPomodoros: 2, focusedSeconds: 3000, notes: "Define core features, plan user flows, and set up project structure.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-21T09:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-2", userId: "local-user", title: "System design study", description: "Review distributed systems concepts and practice design questions", areaId: "area-learning", tags: ["Study"], status: "todo", priority: "important", scheduledDate: "2026-07-25", plannedStart: "14:00", plannedEnd: "15:00", pomodoroGoal: 3, completedPomodoros: 0, focusedSeconds: 0, notes: "Focus on CAP theorem, consistent hashing, and load balancing patterns.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-3", userId: "local-user", title: "Lunch break", description: "Take a proper break and eat well", areaId: "area-health", tags: [], status: "todo", priority: "normal", scheduledDate: "2026-07-21", plannedStart: "13:00", plannedEnd: "13:45", pomodoroGoal: 0, completedPomodoros: 0, focusedSeconds: 0, notes: "", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-4", userId: "local-user", title: "Data Engineering project", description: "Build a batch data pipeline for analytics platform", areaId: "area-business", tags: ["Deep Work"], status: "todo", priority: "important", scheduledDate: "2026-07-24", plannedStart: "10:00", plannedEnd: "12:00", pomodoroGoal: 4, completedPomodoros: 2, focusedSeconds: 3000, notes: "Focus on Spark transformations and output to data warehouse.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-5", userId: "local-user", title: "Exercise / Gym", description: "Strength training and cardio", areaId: "area-health", tags: [], status: "todo", priority: "normal", scheduledDate: "2026-07-22", plannedStart: "07:00", plannedEnd: "08:15", pomodoroGoal: 0, completedPomodoros: 0, focusedSeconds: 0, notes: "Legs day + 20 min cardio.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-6", userId: "local-user", title: "Read a book", description: "Continue reading Atomic Habits", areaId: "area-personal", tags: [], status: "todo", priority: "low", scheduledDate: "2026-07-26", plannedStart: "21:00", plannedEnd: "21:45", pomodoroGoal: 2, completedPomodoros: 0, focusedSeconds: 0, notes: "Resume from chapter 11.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-7", userId: "local-user", title: "Team Standup Meeting", description: "Daily sync with the team", areaId: "area-work", tags: ["Deep Work"], status: "todo", priority: "normal", scheduledDate: "2026-07-21", plannedStart: "09:00", plannedEnd: "10:00", pomodoroGoal: 1, completedPomodoros: 1, focusedSeconds: 1500, notes: "", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-8", userId: "local-user", title: "Client Call", description: "Product demo and roadmap discussion", areaId: "area-business", tags: ["Business"], status: "todo", priority: "normal", scheduledDate: "2026-07-22", plannedStart: "11:00", plannedEnd: "11:30", pomodoroGoal: 1, completedPomodoros: 1, focusedSeconds: 1800, notes: "", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-9", userId: "local-user", title: "Gym Session", description: "Full-body workout", areaId: "area-health", tags: ["Health"], status: "todo", priority: "normal", scheduledDate: "2026-07-23", plannedStart: "07:00", plannedEnd: "08:15", pomodoroGoal: 1, completedPomodoros: 1, focusedSeconds: 2700, notes: "", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "task-10", userId: "local-user", title: "Review Q3 finances", description: "Check expenses, savings, and investment returns", areaId: "area-finance", tags: [], status: "todo", priority: "important", scheduledDate: undefined, pomodoroGoal: 2, completedPomodoros: 0, focusedSeconds: 0, notes: "Pull reports from bank and Zerodha.", createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
];

export const SEED_NOTES: Note[] = [
  {
    id: "note-1", userId: "local-user", title: "Python Data Processor", type: "code", language: "python", content: `def process_data(df, threshold=0.85):
    """
    Process DataFrame: filter by threshold, add computed columns.

    Args:
        df: Input pandas DataFrame
        threshold: Minimum score threshold (default 0.85)

    Returns:
        Processed DataFrame with new columns
    """
    # Filter rows meeting threshold
    filtered = df[df['score'] >= threshold].copy()

    # Add computed columns
    filtered['category'] = filtered['score'].apply(
        lambda x: 'high' if x >= 0.95 else 'medium'
    )
    filtered['rank'] = filtered['score'].rank(ascending=False)

    return filtered.sort_values('rank')


# Example usage
if __name__ == "__main__":
    import pandas as pd

    sample_data = {
        'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
        'score': [0.92, 0.78, 0.88, 0.96]
    }
    df = pd.DataFrame(sample_data)
    result = process_data(df)
    print(result)`, tags: ["python", "data", "pandas"], folder: "code", archived: false, createdAt: "2026-07-18T08:00:00.000Z", updatedAt: "2026-07-20T10:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "note-2", userId: "local-user", title: "Daily Active Users SQL", type: "code", language: "sql", content: `-- Daily Active Users with 7-day rolling average
WITH daily_users AS (
    SELECT
        DATE(created_at) AS date,
        COUNT(DISTINCT user_id) AS dau
    FROM user_events
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND event_type = 'session_start'
    GROUP BY 1
),
rolling_avg AS (
    SELECT
        date,
        dau,
        AVG(dau) OVER (
            ORDER BY date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS rolling_7d_avg
    FROM daily_users
)
SELECT
    date,
    dau,
    ROUND(rolling_7d_avg, 1) AS rolling_7d_avg
FROM rolling_avg
ORDER BY date DESC;`, tags: ["sql", "analytics", "metrics"], folder: "code", archived: false, createdAt: "2026-07-17T09:00:00.000Z", updatedAt: "2026-07-19T11:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "note-3", userId: "local-user", title: "React Custom Hook Pattern", type: "code", language: "typescript", content: `import { useState, useCallback, useRef, useEffect } from "react";

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: false, error: null });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFn();
      if (mountedRef.current) {
        setState({ data, loading: false, error: null });
        options.onSuccess?.(data);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });
        options.onError?.(error);
      }
    }
  }, [asyncFn, options]);

  useEffect(() => {
    if (options.immediate) execute();
  }, [execute, options.immediate]);

  return { ...state, execute };
}`, tags: ["react", "typescript", "hooks"], folder: "code", archived: false, createdAt: "2026-07-16T10:00:00.000Z", updatedAt: "2026-07-18T08:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "note-4", userId: "local-user", title: "Product Ideas — KartikayOS", type: "text", content: `# Product Ideas for Kartikay OS

## Short-term features
- Habit tracker integrated with daily tasks
- Pomodoro statistics with streak counter
- Smart scheduling: suggest best time for deep work based on past patterns
- Tag-based filtering across tasks and notes
- Keyboard shortcuts for power users

## Medium-term
- Supabase sync for multi-device access
- Google Calendar two-way sync
- AI-powered weekly review summary
- Custom dashboards with widgets

## Long-term vision
- Mobile app (React Native or Capacitor)
- Team workspace for small teams
- Integration with GitHub/Jira for dev tasks
- Voice capture for quick notes`, tags: ["product", "ideas", "roadmap"], folder: "ideas", archived: false, createdAt: "2026-07-15T07:00:00.000Z", updatedAt: "2026-07-21T07:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "note-5", userId: "local-user", title: "Daily Reflection — July 21", type: "text", content: `## Morning Intentions
- Complete the Kartikay OS foundation today
- Stay focused on one thing at a time
- Take real breaks — no phone scrolling

## What I'm grateful for
- Good sleep last night
- Coffee ☕
- Interesting technical challenges to solve

## End of day review
Today was productive. Got the core architecture in place. The Dexie setup works well and the timer persistence logic is solid.

Tomorrow: Polish the UI and start on the analytics page.

**Energy level:** 8/10
**Focus:** 7/10
**Mood:** Positive`, tags: ["journal", "reflection"], folder: "journal", archived: false, createdAt: "2026-07-21T06:30:00.000Z", updatedAt: "2026-07-21T21:00:00.000Z", version: 1, syncStatus: "synced",
  },
  {
    id: "note-6", userId: "local-user", title: "Shell Automation Scripts", type: "code", language: "shell", content: `#!/bin/bash
# Deploy Kartikay OS to GitHub Pages

set -euo pipefail

PROJECT_DIR="kartikay-os-src"
BUILD_DIR="kartikay-os"

echo "Building $PROJECT_DIR..."
cd "$PROJECT_DIR"
npm run build
cd ..

echo "Staging build artifacts..."
git add "$BUILD_DIR"

echo "Committing..."
git commit -m "deploy: update kartikay-os build"

echo "Pushing to master..."
git push origin master

echo "Deployed! Live at: https://kartikay89.github.io/kartikay-os/"`, tags: ["bash", "deploy", "automation"], folder: "code", archived: false, createdAt: "2026-07-19T15:00:00.000Z", updatedAt: "2026-07-20T09:00:00.000Z", version: 1, syncStatus: "synced",
  },
];

export const SEED_POMODORO_SESSIONS: PomodoroSession[] = [
  { id: "pomo-1", userId: "local-user", taskId: "task-1", startedAt: "2026-07-21T09:00:00.000Z", endedAt: "2026-07-21T09:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-21T09:00:00.000Z", updatedAt: "2026-07-21T09:25:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-2", userId: "local-user", taskId: "task-1", startedAt: "2026-07-21T09:30:00.000Z", endedAt: "2026-07-21T09:55:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-21T09:30:00.000Z", updatedAt: "2026-07-21T09:55:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-3", userId: "local-user", taskId: "task-7", startedAt: "2026-07-21T09:00:00.000Z", endedAt: "2026-07-21T09:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-21T09:00:00.000Z", updatedAt: "2026-07-21T09:25:00.000Z", version: 1, syncStatus: "synced" },
  // Monday
  { id: "pomo-mon-1", userId: "local-user", taskId: "task-2", startedAt: "2026-07-21T08:00:00.000Z", endedAt: "2026-07-21T08:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-21T08:00:00.000Z", updatedAt: "2026-07-21T08:25:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-mon-2", userId: "local-user", taskId: "task-2", startedAt: "2026-07-21T08:30:00.000Z", endedAt: "2026-07-21T08:55:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-21T08:30:00.000Z", updatedAt: "2026-07-21T08:55:00.000Z", version: 1, syncStatus: "synced" },
  // Tue - more focused (today)
  { id: "pomo-tue-1", userId: "local-user", taskId: "task-1", startedAt: "2026-07-22T09:00:00.000Z", endedAt: "2026-07-22T09:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-22T09:00:00.000Z", updatedAt: "2026-07-22T09:25:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-tue-2", userId: "local-user", taskId: "task-1", startedAt: "2026-07-22T09:30:00.000Z", endedAt: "2026-07-22T09:55:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-22T09:30:00.000Z", updatedAt: "2026-07-22T09:55:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-tue-3", userId: "local-user", taskId: "task-4", startedAt: "2026-07-22T10:30:00.000Z", endedAt: "2026-07-22T10:55:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-22T10:30:00.000Z", updatedAt: "2026-07-22T10:55:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-tue-4", userId: "local-user", taskId: "task-4", startedAt: "2026-07-22T11:00:00.000Z", endedAt: "2026-07-22T11:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 1500, status: "completed", createdAt: "2026-07-22T11:00:00.000Z", updatedAt: "2026-07-22T11:25:00.000Z", version: 1, syncStatus: "synced" },
  { id: "pomo-tue-5", userId: "local-user", taskId: "task-4", startedAt: "2026-07-22T14:00:00.000Z", endedAt: "2026-07-22T14:25:00.000Z", durationSeconds: 1500, actualFocusedSeconds: 900, status: "completed", createdAt: "2026-07-22T14:00:00.000Z", updatedAt: "2026-07-22T14:25:00.000Z", version: 1, syncStatus: "synced" },
];
