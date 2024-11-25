import { BasicRespData } from ".";
// define the structure of the Playbook interface
export interface Playbook {
  id: string;
  name: string;
  description: string;
  content: string;
}

// define the structure of the PlaybookListResp interface
export interface PlaybookListResp extends BasicRespData {
  data: Playbook[];
}