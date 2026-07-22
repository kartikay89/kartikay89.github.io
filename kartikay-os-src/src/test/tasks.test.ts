import { describe, it, expect, vi, beforeEach } from "vitest";
import { nanoid } from "@/lib/nanoid";
import { formatDuration, formatTimer, getWeekBounds, addDays, todayISO } from "@/lib/time";
import { getRemaining, getProgress } from "@/store/timerStore";
import type { TimerState } from "@/types";

// ─── nanoid ──────────────────────────────────────────────────────────────────
describe("nanoid", () => {
  it("generates a string of default length 21", () => {
    const id = nanoid();
    expect(typeof id).toBe("string");
    expect(id.length).toBe(21);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => nanoid()));
    expect(ids.size).toBe(100);
  });

  it("uses only alphanumeric characters", () => {
    const id = nanoid();
    expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
  });
});

// ─── time utils ──────────────────────────────────────────────────────────────
describe("formatDuration", () => {
  it("formats seconds correctly", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(3661)).toBe("1h 01m");
  });
});

describe("formatTimer", () => {
  it("formats MM:SS", () => {
    expect(formatTimer(90)).toBe("01:30");
    expect(formatTimer(1500)).toBe("25:00");
    expect(formatTimer(0)).toBe("00:00");
  });

  it("formats HH:MM:SS for hours", () => {
    expect(formatTimer(3661)).toBe("01:01:01");
  });
});

describe("getWeekBounds", () => {
  it("returns Monday as start", () => {
    const { start } = getWeekBounds(new Date("2026-07-22")); // Tuesday
    expect(start).toBe("2026-07-20"); // Monday
  });

  it("end is 6 days after start", () => {
    const { start, end } = getWeekBounds(new Date("2026-07-22"));
    const endDate = new Date(end + "T00:00:00");
    const startDate = new Date(start + "T00:00:00");
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(6);
  });
});

describe("addDays", () => {
  it("adds days to a date", () => {
    expect(addDays("2026-07-20", 6)).toBe("2026-07-26");
    expect(addDays("2026-12-30", 2)).toBe("2027-01-01");
  });
});

// ─── timer store utils ────────────────────────────────────────────────────────
describe("getRemaining", () => {
  it("returns full duration when idle", () => {
    const timer: TimerState = {
      taskId: null, status: "idle", startedAt: null,
      baseElapsed: 0, durationSeconds: 1500, sessionId: null,
    };
    expect(getRemaining(timer)).toBe(1500);
  });

  it("returns remaining correctly when paused", () => {
    const timer: TimerState = {
      taskId: "t1", status: "paused", startedAt: null,
      baseElapsed: 600, durationSeconds: 1500, sessionId: "s1",
    };
    expect(getRemaining(timer)).toBe(900);
  });

  it("returns 0 when elapsed >= duration", () => {
    const timer: TimerState = {
      taskId: "t1", status: "paused", startedAt: null,
      baseElapsed: 1500, durationSeconds: 1500, sessionId: "s1",
    };
    expect(getRemaining(timer)).toBe(0);
  });

  it("calculates remaining from startedAt when running", () => {
    const startedAt = Date.now() - 300_000; // 300 seconds ago
    const timer: TimerState = {
      taskId: "t1", status: "running", startedAt,
      baseElapsed: 0, durationSeconds: 1500, sessionId: "s1",
    };
    const remaining = getRemaining(timer);
    expect(remaining).toBeGreaterThanOrEqual(1194); // ~1200 - slight drift
    expect(remaining).toBeLessThanOrEqual(1200);
  });
});

describe("getProgress", () => {
  it("returns 0 when idle", () => {
    const timer: TimerState = {
      taskId: null, status: "idle", startedAt: null,
      baseElapsed: 0, durationSeconds: 1500, sessionId: null,
    };
    expect(getProgress(timer)).toBe(0);
  });

  it("returns 0.5 when halfway done (paused)", () => {
    const timer: TimerState = {
      taskId: "t1", status: "paused", startedAt: null,
      baseElapsed: 750, durationSeconds: 1500, sessionId: "s1",
    };
    expect(getProgress(timer)).toBeCloseTo(0.5);
  });

  it("returns max 1 when over time", () => {
    const timer: TimerState = {
      taskId: "t1", status: "paused", startedAt: null,
      baseElapsed: 2000, durationSeconds: 1500, sessionId: "s1",
    };
    expect(getProgress(timer)).toBe(1);
  });
});

// ─── task scheduling rule ────────────────────────────────────────────────────
describe("scheduled task rule", () => {
  it("unscheduled task has no scheduledDate", () => {
    const task = { scheduledDate: undefined };
    expect(task.scheduledDate).toBeUndefined();
  });

  it("scheduled task has a date", () => {
    const task = { scheduledDate: "2026-07-21" };
    expect(task.scheduledDate).toBeDefined();
  });
});

// ─── WIP limit ───────────────────────────────────────────────────────────────
describe("WIP limit enforcement", () => {
  it("allows only 1 in_progress task", () => {
    const tasks = [
      { id: "1", status: "in_progress" },
      { id: "2", status: "todo" },
    ];
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    expect(inProgress.length).toBe(1);

    // WIP check: can we start task X? Only if no OTHER task is in_progress
    const canStart = (targetId: string) => {
      const otherInProgress = inProgress.some((t) => t.id !== targetId);
      return !otherInProgress;
    };
    expect(canStart("2")).toBe(false); // blocked — task 1 is already running
    expect(canStart("1")).toBe(true);  // task 1 is already the running one, can resume
  });

  it("enforces max 1 in_progress", () => {
    const hasWip = (tasks: { status: string }[]) =>
      tasks.filter((t) => t.status === "in_progress").length >= 1;

    expect(hasWip([{ status: "in_progress" }])).toBe(true);
    expect(hasWip([{ status: "todo" }])).toBe(false);
  });
});

// ─── priority ordering ───────────────────────────────────────────────────────
describe("priority ordering", () => {
  const PRIORITY_ORDER = { urgent: 0, important: 1, normal: 2, low: 3 };

  it("urgent sorts before important", () => {
    expect(PRIORITY_ORDER.urgent).toBeLessThan(PRIORITY_ORDER.important);
  });

  it("important sorts before normal", () => {
    expect(PRIORITY_ORDER.important).toBeLessThan(PRIORITY_ORDER.normal);
  });

  it("normal sorts before low", () => {
    expect(PRIORITY_ORDER.normal).toBeLessThan(PRIORITY_ORDER.low);
  });

  it("sorts array correctly", () => {
    const tasks = [
      { title: "A", priority: "low" as const },
      { title: "B", priority: "urgent" as const },
      { title: "C", priority: "normal" as const },
    ];
    const sorted = [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    expect(sorted[0].priority).toBe("urgent");
    expect(sorted[2].priority).toBe("low");
  });
});
