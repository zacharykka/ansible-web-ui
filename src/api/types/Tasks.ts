import { BasicRespData } from "./index";
import { Playbook } from "./Playbook";
import { Adhoc } from "./Adhoc";
import { Host } from "./Inventory";

// define the status of the task
enum TaskStatus {
  "started" = 1,
  "success" = 2,
  "failed" = 3,
  "skipped" = 4,
  "unreachable" = 5,
  "running" = 6,
  "canceled" = 7,
}

// define the task type 
type TaskType = "adhoc" | "playbook";

// define the structure of the Task interface
export interface Task {
  id: string; // task id
  type: TaskType; // task type
  playbook: Playbook; // playbook task information
  adhoc: Adhoc; // adhoc task information
  hosts: Host[]; // list of hosts that the task is executed on
  status: TaskStatus; // task status
  start_time: string; // start time
  end_time: string; // end time
  update_time: string; // last update time
  duration: number; // the duration of the task
  stdout_log: string; // stdout
  stderr_log: string; // stderr
  stdout_log_file: string; // stdout file path
  stderr_log_file: string; // stderr file path
}

// define the structure of the TaskResponse interface
export interface TaskResponse extends BasicRespData {
  data: Task[];
}
