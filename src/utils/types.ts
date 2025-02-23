
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
  errorDetails?: string;
  timestamp?: Date;
}

export interface SystemLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  component: string;
}

export interface ServiceConfig {
  name: string;
  enabled: boolean;
  port: number;
  protocols: string[];
  settings: Record<string, any>;
}
