export interface Contact {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  department?: string;
  lastActive?: string | Date;
  status?: 'online' | 'offline' | 'away' | 'busy';
} 