/** @public */
export interface BasicTask {
  id: string;
  title: string;
  text?: string;
  completed: boolean;
  dueDate?: string;
  assigneeEntityRefs: string[];
  targetsEntityRefs: string[];
  createdAt: string;
  createdByEntityRef: string;
  updateByEntityRef?: string;
}

/** @public */
export interface Task extends BasicTask {
  subTasks: BasicTask[];
}
