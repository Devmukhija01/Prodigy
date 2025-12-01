export type Priority = "high" | "medium" | "low";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  capacity: number;
  allocated: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  assigneeId?: string;
  tags: string[];
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "completed";
  tasks: Task[];
}

export interface RetroItem {
  id: string;
  type: "went_well" | "improve" | "action";
  content: string;
  sprintId: string;
}

export interface BurndownPoint {
  day: number;
  date: string;
  ideal: number;
  actual: number;
}

export interface VelocityData {
  sprintName: string;
  completed: number;
  committed: number;
}
