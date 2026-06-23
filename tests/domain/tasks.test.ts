import { describe, it, expect } from "vitest";
import {
  tasksByStatus,
  moveTask,
  nextStatus,
  prevStatus,
  advanceTask,
  retreatTask,
  countByStatus,
  countByPriority,
  completionRate,
  projects,
  filterByProject,
  type Task,
} from "@/lib/domain/tasks";

const t = (id: string, status: Task["status"], priority: Task["priority"], project = "P"): Task => ({
  id,
  title: id,
  status,
  priority,
  project,
});

const board: Task[] = [
  t("1", "todo", "high", "Lanzamiento"),
  t("2", "doing", "med", "Lanzamiento"),
  t("3", "done", "low", "Marketing"),
  t("4", "todo", "high", "Marketing"),
];

describe("tasksByStatus", () => {
  it("should return only tasks in the column", () => {
    expect(tasksByStatus(board, "todo").map((x) => x.id)).toEqual(["1", "4"]);
    expect(tasksByStatus(board, "done").map((x) => x.id)).toEqual(["3"]);
  });
});

describe("moveTask", () => {
  it("should change a task's status immutably", () => {
    const next = moveTask(board, "1", "done");
    expect(next.find((x) => x.id === "1")?.status).toBe("done");
    expect(board.find((x) => x.id === "1")?.status).toBe("todo"); // original unchanged
  });
  it("should be a no-op for an unknown id", () => {
    expect(moveTask(board, "999", "done")).toEqual(board);
  });
});

describe("nextStatus / prevStatus", () => {
  it("should walk the column order", () => {
    expect(nextStatus("todo")).toBe("doing");
    expect(nextStatus("doing")).toBe("done");
    expect(nextStatus("done")).toBeNull();
    expect(prevStatus("done")).toBe("doing");
    expect(prevStatus("todo")).toBeNull();
  });
});

describe("advanceTask / retreatTask", () => {
  it("should advance a task one column", () => {
    const next = advanceTask(board, "1");
    expect(next.find((x) => x.id === "1")?.status).toBe("doing");
  });
  it("should not advance past done", () => {
    const next = advanceTask(board, "3");
    expect(next.find((x) => x.id === "3")?.status).toBe("done");
  });
  it("should retreat a task one column", () => {
    const next = retreatTask(board, "2");
    expect(next.find((x) => x.id === "2")?.status).toBe("todo");
  });
  it("should not retreat before todo", () => {
    const next = retreatTask(board, "1");
    expect(next.find((x) => x.id === "1")?.status).toBe("todo");
  });
  it("should return a copy for an unknown id", () => {
    const next = advanceTask(board, "999");
    expect(next).toEqual(board);
    expect(next).not.toBe(board);
  });
});

describe("counts", () => {
  it("should count by status", () => {
    expect(countByStatus(board)).toEqual({ todo: 2, doing: 1, done: 1 });
  });
  it("should count by priority", () => {
    expect(countByPriority(board)).toEqual({ high: 2, med: 1, low: 1 });
  });
});

describe("completionRate", () => {
  it("should be done / total", () => {
    expect(completionRate(board)).toBeCloseTo(0.25);
  });
  it("should be 0 for an empty board", () => {
    expect(completionRate([])).toBe(0);
  });
});

describe("projects / filterByProject", () => {
  it("should list distinct projects in first-seen order", () => {
    expect(projects(board)).toEqual(["Lanzamiento", "Marketing"]);
  });
  it("should filter by a project", () => {
    expect(filterByProject(board, "Marketing").map((x) => x.id)).toEqual(["3", "4"]);
  });
  it("should return all when project is null", () => {
    expect(filterByProject(board, null)).toHaveLength(4);
  });
});
