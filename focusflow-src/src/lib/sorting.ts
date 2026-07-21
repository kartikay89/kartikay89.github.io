import type { Task } from "../types";
import { PRIORITY_ORDER } from "./constants";

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.plannedStart.localeCompare(b.plannedStart);
  });
}
