// todo: remove mock functionality
import type { Sprint, Task, TeamMember, BurndownPoint, VelocityData, RetroItem } from "./types";

export const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", initials: "AC", capacity: 40, allocated: 32 },
  { id: "2", name: "Sarah Miller", initials: "SM", capacity: 40, allocated: 24 },
  { id: "3", name: "James Wilson", initials: "JW", capacity: 32, allocated: 28 },
  { id: "4", name: "Emily Davis", initials: "ED", capacity: 40, allocated: 36 },
  { id: "5", name: "Michael Brown", initials: "MB", capacity: 24, allocated: 16 },
];

export const mockTasks: Task[] = [
  { id: "1", title: "User authentication flow", description: "Implement OAuth2 login with Google and GitHub providers", status: "done", priority: "high", storyPoints: 8, assigneeId: "1", tags: ["auth", "security"], sprintId: "1" },
  { id: "2", title: "Dashboard analytics API", description: "Create endpoints for dashboard metrics", status: "in_review", priority: "high", storyPoints: 5, assigneeId: "2", tags: ["api", "backend"], sprintId: "1" },
  { id: "3", title: "Notification system", description: "Real-time notifications using WebSocket", status: "in_progress", priority: "medium", storyPoints: 8, assigneeId: "3", tags: ["realtime", "frontend"], sprintId: "1" },
  { id: "4", title: "Profile settings page", description: "User can update profile and preferences", status: "in_progress", priority: "low", storyPoints: 3, assigneeId: "4", tags: ["frontend", "ux"], sprintId: "1" },
  { id: "5", title: "Data export feature", description: "Export user data as CSV/JSON", status: "todo", priority: "medium", storyPoints: 5, assigneeId: "5", tags: ["feature"], sprintId: "1" },
  { id: "6", title: "Performance optimization", description: "Lazy loading and code splitting", status: "todo", priority: "high", storyPoints: 8, tags: ["performance"], sprintId: "1" },
  { id: "7", title: "Mobile responsive design", status: "backlog", priority: "medium", storyPoints: 5, tags: ["mobile", "css"], sprintId: undefined },
  { id: "8", title: "API rate limiting", status: "backlog", priority: "high", storyPoints: 3, tags: ["security", "api"], sprintId: undefined },
  { id: "9", title: "Search functionality", status: "backlog", priority: "medium", storyPoints: 8, tags: ["feature", "search"], sprintId: undefined },
  { id: "10", title: "Unit test coverage", status: "backlog", priority: "low", storyPoints: 13, tags: ["testing", "quality"], sprintId: undefined },
];

export const mockSprints: Sprint[] = [
  {
    id: "1",
    name: "Sprint 14",
    goal: "Complete user management features and dashboard analytics",
    startDate: "2024-01-15",
    endDate: "2024-01-29",
    status: "active",
    tasks: mockTasks.filter(t => t.sprintId === "1"),
  },
  {
    id: "2",
    name: "Sprint 13",
    goal: "API infrastructure and authentication",
    startDate: "2024-01-01",
    endDate: "2024-01-14",
    status: "completed",
    tasks: [],
  },
  {
    id: "3",
    name: "Sprint 12",
    goal: "Core platform setup",
    startDate: "2023-12-18",
    endDate: "2023-12-31",
    status: "completed",
    tasks: [],
  },
];

export const mockBurndownData: BurndownPoint[] = [
  { day: 1, date: "Jan 15", ideal: 37, actual: 37 },
  { day: 2, date: "Jan 16", ideal: 34, actual: 35 },
  { day: 3, date: "Jan 17", ideal: 31, actual: 32 },
  { day: 4, date: "Jan 18", ideal: 28, actual: 30 },
  { day: 5, date: "Jan 19", ideal: 25, actual: 28 },
  { day: 6, date: "Jan 20", ideal: 22, actual: 25 },
  { day: 7, date: "Jan 21", ideal: 19, actual: 21 },
  { day: 8, date: "Jan 22", ideal: 16, actual: 16 },
  { day: 9, date: "Jan 23", ideal: 13, actual: 13 },
  { day: 10, date: "Jan 24", ideal: 10, actual: 10 },
];

export const mockVelocityData: VelocityData[] = [
  { sprintName: "Sprint 10", completed: 28, committed: 32 },
  { sprintName: "Sprint 11", completed: 34, committed: 34 },
  { sprintName: "Sprint 12", completed: 31, committed: 35 },
  { sprintName: "Sprint 13", completed: 38, committed: 38 },
  { sprintName: "Sprint 14", completed: 13, committed: 37 },
];

export const mockRetroItems: RetroItem[] = [
  { id: "r1", type: "went_well", content: "Great collaboration on the auth feature", sprintId: "2" },
  { id: "r2", type: "went_well", content: "Met all sprint commitments", sprintId: "2" },
  { id: "r3", type: "improve", content: "Need better estimation on complex tasks", sprintId: "2" },
  { id: "r4", type: "improve", content: "More frequent code reviews", sprintId: "2" },
  { id: "r5", type: "action", content: "Add estimation poker to planning sessions", sprintId: "2" },
];
