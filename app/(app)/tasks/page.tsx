import { getTasks } from "@/lib/data/queries";
import { TaskBoard } from "@/components/tasks/task-board";

export default async function TasksPage() {
  const tasks = await getTasks();
  return <TaskBoard tasks={tasks} />;
}
