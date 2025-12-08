export type UserRole = 'sales' | 'tech' | 'pricing' | 'management' | null;
export type RFPStage = 'Discovery' | 'Tech' | 'Pricing' | 'Approval' | 'Final';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type RFPStatus = 'active' | 'completed' | 'accepted' | 'rejected';

export interface RFP {
  id: string;
  client: string;
  title: string;
  deadline: string;
  deadlineDate?: string;
  value: string;
  source: string; // New field defined in designs
  currentStage: RFPStage;
  // Which role is currently blocking progress?
  waitingOn: UserRole | 'completed';
  owner?: string;
  riskFlag?: boolean;
  salesNotes?: string; // New field for Sales Manager notes
  status?: RFPStatus; // Overall status of the RFP
}