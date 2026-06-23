"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import {
  STATUS_ORDER,
  tasksByStatus,
  advanceTask,
  retreatTask,
  nextStatus,
  prevStatus,
  completionRate,
  filterByProject,
  projects,
  type Task,
  type TaskStatus,
  type Priority,
} from "@/lib/domain/tasks";

const COLUMN_LABEL: Record<TaskStatus, string> = { todo: "Por hacer", doing: "En curso", done: "Hecho" };
const COLUMN_COLOR: Record<TaskStatus, string> = { todo: "var(--tx-3)", doing: "var(--t-gold)", done: "var(--profit)" };
const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  high: { label: "Alta", color: "var(--loss)" },
  med: { label: "Media", color: "var(--t-gold)" },
  low: { label: "Baja", color: "var(--tx-3)" },
};

export function TaskBoard({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const [project, setProject] = useState<string | null>(null);

  const projectList = useMemo(() => projects(initial), [initial]);
  const visible = useMemo(() => filterByProject(tasks, project), [tasks, project]);
  const progress = completionRate(visible);

  const options = [{ k: "__all", label: "Todos" }, ...projectList.map((p) => ({ k: p, label: p }))];

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)" }}>
          <Icon name="board" size={22} style={{ color: "var(--brand)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--brand)" }}>Tareas & Proyectos</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>Tablero Kanban</h1>
        </div>
        <Segmented options={options} value={project ?? "__all"} onChange={(k) => setProject(k === "__all" ? null : k)} size="sm" />
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: "var(--tx-2)" }}>Progreso {project ? `· ${project}` : "global"}</span>
          <span className="mono" style={{ color: "var(--profit)" }}>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--bg-4)", overflow: "hidden" }}>
          <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} style={{ height: "100%", background: "var(--profit)", borderRadius: 999 }} />
        </div>
      </div>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {STATUS_ORDER.map((status) => {
          const colTasks = tasksByStatus(visible, status);
          return (
            <div key={status} className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-2)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLUMN_COLOR[status] }} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{COLUMN_LABEL[status]}</span>
                </div>
                <span className="mono" style={{ fontSize: 12, color: "var(--tx-3)" }}>{colTasks.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="card"
                      style={{ padding: "10px 12px", background: "var(--bg-3)" }}
                    >
                      <div style={{ fontSize: 13, marginBottom: 8, color: status === "done" ? "var(--tx-3)" : "var(--tx-1)", textDecoration: status === "done" ? "line-through" : "none" }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="chip" style={{ fontSize: 10, color: PRIORITY_META[task.priority].color, borderColor: PRIORITY_META[task.priority].color }}>
                          {PRIORITY_META[task.priority].label}
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <MoveBtn
                            disabled={prevStatus(task.status) == null}
                            dir="left"
                            onClick={() => setTasks((ts) => retreatTask(ts, task.id))}
                          />
                          <MoveBtn
                            disabled={nextStatus(task.status) == null}
                            dir="right"
                            onClick={() => setTasks((ts) => advanceTask(ts, task.id))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--tx-4)", textAlign: "center", padding: "10px 0" }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoveBtn({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Retroceder" : "Avanzar"}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        display: "grid",
        placeItems: "center",
        border: "1px solid var(--line-2)",
        background: disabled ? "transparent" : "var(--bg-4)",
        color: disabled ? "var(--tx-4)" : "var(--tx-2)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={dir === "left" ? "chevR" : "chevR"} size={13} style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }} />
    </button>
  );
}
