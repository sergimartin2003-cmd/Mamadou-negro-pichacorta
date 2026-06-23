/**
 * Kanban task board — pure board operations for the Tasks/Projects module.
 * State transitions return new arrays (never mutate). Every function is
 * individually unit-tested.
 */

export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "low" | "med" | "high";

export const STATUS_ORDER: readonly TaskStatus[] = ["todo", "doing", "done"];
export const PRIORITY_ORDER: readonly Priority[] = ["high", "med", "low"];

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  project: string;
}

/** Tasks currently in a given column. Order is preserved. */
export function tasksByStatus(tasks: readonly Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

/** Move one task to a new status, returning a new array. No-op if id is absent. */
export function moveTask(tasks: readonly Task[], id: string, status: TaskStatus): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, status } : t));
}

/** The next column to the right, or null when already in the last column. */
export function nextStatus(status: TaskStatus): TaskStatus | null {
  const i = STATUS_ORDER.indexOf(status);
  return i >= 0 && i < STATUS_ORDER.length - 1 ? STATUS_ORDER[i + 1] : null;
}

/** The previous column to the left, or null when already in the first column. */
export function prevStatus(status: TaskStatus): TaskStatus | null {
  const i = STATUS_ORDER.indexOf(status);
  return i > 0 ? STATUS_ORDER[i - 1] : null;
}

/** Advance/retreat a task by one column. No-op at the ends. */
export function advanceTask(tasks: readonly Task[], id: string): Task[] {
  const task = tasks.find((t) => t.id === id);
  if (!task) return tasks.slice();
  const next = nextStatus(task.status);
  return next ? moveTask(tasks, id, next) : tasks.slice();
}

export function retreatTask(tasks: readonly Task[], id: string): Task[] {
  const task = tasks.find((t) => t.id === id);
  if (!task) return tasks.slice();
  const prev = prevStatus(task.status);
  return prev ? moveTask(tasks, id, prev) : tasks.slice();
}

/** Count of tasks in each status column. */
export function countByStatus(tasks: readonly Task[]): Record<TaskStatus, number> {
  const counts: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 };
  for (const t of tasks) counts[t.status] += 1;
  return counts;
}

/** Count of tasks at each priority. */
export function countByPriority(tasks: readonly Task[]): Record<Priority, number> {
  const counts: Record<Priority, number> = { high: 0, med: 0, low: 0 };
  for (const t of tasks) counts[t.priority] += 1;
  return counts;
}

/** Completion rate (0–1): done tasks over total. 0 for an empty board. */
export function completionRate(tasks: readonly Task[]): number {
  if (tasks.length === 0) return 0;
  return countByStatus(tasks).done / tasks.length;
}

/** Distinct project names present on the board, in first-seen order. */
export function projects(tasks: readonly Task[]): string[] {
  const seen: string[] = [];
  for (const t of tasks) if (!seen.includes(t.project)) seen.push(t.project);
  return seen;
}

/** Filter to a single project, or return all when project is null. */
export function filterByProject(tasks: readonly Task[], project: string | null): Task[] {
  return project == null ? tasks.slice() : tasks.filter((t) => t.project === project);
}
