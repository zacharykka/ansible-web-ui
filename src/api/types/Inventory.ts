import { BasicInventory, BasicRespData } from ".";

// define the structure of the HostGroup interface
export interface HostGroup extends BasicInventory {
  tags: string[];
}

// define the structure of the Hosts interface
export interface Host extends BasicInventory {
  ip: string;
  hostGroups: HostGroup[];
}

// define the structure of the HostListResp interface
export interface HostListResp extends BasicRespData {
  data: Host[];
}

// define the structure of the HostGroupListResp interface
export interface HostGroupListResp extends BasicRespData {
  data: HostGroup[];
}