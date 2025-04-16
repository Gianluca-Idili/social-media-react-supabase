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
    }; // Ora è un singolo oggetto, non un array
    tasks: {
      description: string;
      is_completed: boolean;
    }[];
    likes?: number;
    dislikes?: number;
  }