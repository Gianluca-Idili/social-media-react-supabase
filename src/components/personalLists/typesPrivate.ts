export interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  created_at: string;
}

export interface Props {
  profileId: string;
}

export interface Task {
  id: string;
  list_id: string;
  description: string;
  is_completed: boolean;
  created_at?: string;
}

export interface ListWithTasks {
  id: string;
  user_id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  is_completed: boolean;
  is_public: boolean;
  reward?: string | null;
  punishment?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  tasks: Task[];
}