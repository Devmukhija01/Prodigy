import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskDetailSheet } from "@/components/TaskDetailSheet";
import type { Task, TeamMember, TaskStatus } from "@/lib/types";

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress" },
  { status: "in_review", title: "In Review" },
  { status: "done", title: "Done" },
];

export function KanbanBoard({ tasks, teamMembers, onTaskUpdate, onAddTask }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    if (draggedTask && dropTarget && draggedTask.status !== dropTarget) {
      onTaskUpdate?.(draggedTask.id, { status: dropTarget });
    }
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleDragOver = (status: TaskStatus) => {
    setDropTarget(status);
  };

  return (
    <>
      <ScrollArea className="w-full" data-testid="kanban-board">
        <div className="flex gap-4 p-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column.status}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(column.status);
              }}
              onDrop={handleDragEnd}
              onDragLeave={() => setDropTarget(null)}
            >
              <KanbanColumn
                title={column.title}
                status={column.status}
                tasks={tasks.filter((t) => t.status === column.status)}
                teamMembers={teamMembers}
                onTaskClick={setSelectedTask}
                onAddTask={() => onAddTask?.(column.status)}
                onDragStart={handleDragStart}
                isDropTarget={dropTarget === column.status}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <TaskDetailSheet
        task={selectedTask}
        teamMembers={teamMembers}
        onClose={() => setSelectedTask(null)}
        onUpdate={(updates: Partial<Task>) => {
          if (selectedTask) {
            onTaskUpdate?.(selectedTask.id, updates);
          }
        }}
      />
    </>
  );
}
