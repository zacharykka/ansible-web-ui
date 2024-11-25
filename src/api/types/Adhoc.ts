import { Host } from "./Inventory";

// define the structure of the Adhoc interface
export interface Adhoc {
  id: string; // adhoc id
  module: string; // module name
  args: Record<string, any>; // arguments for the module
  hosts: Host[]; // hosts to execute the module on
}
