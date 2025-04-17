// types.ts
export interface PublicList {
  id: string;
  title: string;
  type: string;
  reward?: string | null;
  punishment?: string | null;
  is_completed: boolean;
  completed_at: string | null;
  view_count: number;
  user_id: string;
  profiles: {
    username: string;
  };
  tasks: {
    description: string;
    is_completed: boolean;
  }[];
  likes?: number;
  dislikes?: number;
}

export interface PersonalList {
  id: string;
  user_id: string;
  title: string;
  type: string;
  is_completed: boolean;
  is_public: boolean;
  reward?: string | null;
  punishment?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  tasks: {
    id: string;
    list_id: string;
    description: string;
    is_completed: boolean;
    created_at?: string;
  }[];
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  created_at: string;
}
