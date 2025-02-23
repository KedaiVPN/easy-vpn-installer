
export interface SystemRequirement {
  name: string;
  status: 'pending' | 'success' | 'error';
  details?: string;
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  port: number;
  protocol: string;
}

export interface UserAccount {
  username: string;
  created: Date;
  expires: Date;
  status: 'active' | 'expired';
}

export interface InstallationStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  description: string;
}
