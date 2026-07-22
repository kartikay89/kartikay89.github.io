import type { Task, LifeArea, Note, PomodoroSession, AppSettings, TaskStatus } from "@/types";

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | undefined>;
  getByStatus(status: TaskStatus): Promise<Task[]>;
  getScheduled(date: string): Promise<Task[]>;
  getByArea(areaId: string): Promise<Task[]>;
  create(partial: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Task>;
  update(id: string, changes: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

export interface ILifeAreaRepository {
  getAll(): Promise<LifeArea[]>;
  getById(id: string): Promise<LifeArea | undefined>;
  create(partial: Omit<LifeArea, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<LifeArea>;
  update(id: string, changes: Partial<LifeArea>): Promise<LifeArea>;
  delete(id: string): Promise<void>;
}

export interface INoteRepository {
  getAll(): Promise<Note[]>;
  getById(id: string): Promise<Note | undefined>;
  getByFolder(folder: string): Promise<Note[]>;
  create(partial: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<Note>;
  update(id: string, changes: Partial<Note>): Promise<Note>;
  delete(id: string): Promise<void>;
}

export interface IPomodoroRepository {
  getByTask(taskId: string): Promise<PomodoroSession[]>;
  getRunning(): Promise<PomodoroSession | undefined>;
  getByDateRange(startDate: string, endDate: string): Promise<PomodoroSession[]>;
  getWeeklyFocus(weekStart: string, weekEnd: string): Promise<{ date: string; seconds: number }[]>;
  create(partial: Omit<PomodoroSession, "id" | "userId" | "createdAt" | "updatedAt" | "version" | "syncStatus">): Promise<PomodoroSession>;
  update(id: string, changes: Partial<PomodoroSession>): Promise<void>;
}

export interface ISettingsRepository {
  get(): Promise<AppSettings | null>;
  save(settings: AppSettings): Promise<void>;
}
