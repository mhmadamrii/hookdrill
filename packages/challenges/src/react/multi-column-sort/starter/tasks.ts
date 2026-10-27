export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: number;
  title: string;
  priority: Priority;
  /** ISO date, YYYY-MM-DD, or null when there is no due date. */
  due: string | null;
  /** null when nobody is assigned. */
  assignee: string | null;
};

export const TASKS: Task[] = [
  {
    id: 1,
    title: "Write release notes",
    priority: "Medium",
    due: "2024-03-10",
    assignee: "maya",
  },
  {
    id: 2,
    title: "fix login bug",
    priority: "High",
    due: "2024-03-05",
    assignee: "Omar",
  },
  {
    id: 3,
    title: "Update deps",
    priority: "Low",
    due: null,
    assignee: "bruno",
  },
  {
    id: 4,
    title: "Design review",
    priority: "High",
    due: null,
    assignee: null,
  },
  {
    id: 5,
    title: "add dark mode",
    priority: "Medium",
    due: "2024-02-28",
    assignee: "Aisha",
  },
  {
    id: 6,
    title: "Backup database",
    priority: "High",
    due: "2024-03-05",
    assignee: "aisha",
  },
  {
    id: 7,
    title: "Clean up CSS",
    priority: "Low",
    due: "2024-03-01",
    assignee: null,
  },
  {
    id: 8,
    title: "Onboard intern",
    priority: "Medium",
    due: null,
    assignee: "Omar",
  },
  {
    id: 9,
    title: "Refactor auth",
    priority: "High",
    due: "2024-02-20",
    assignee: "maya",
  },
  {
    id: 10,
    title: "Triage issues",
    priority: "Low",
    due: "2024-03-10",
    assignee: "Aisha",
  },
];
