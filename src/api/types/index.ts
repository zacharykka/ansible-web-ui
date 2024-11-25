// define the basic response type of the api response
export interface BasicRespData {
  code: number; 
  message: string; 
  ok: boolean; 
};

// define the basic structure of the basic interface
export interface BasicInventory {
  id: string;  // id of the host or host group
  name: string; // name of the host or host group
  variables: Record<string, any>; // extra variables
}

