import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { PublicListCard } from "./PublicListCard";
import { useEffect, useState } from "react";

interface PublicList {
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
  }[];
  tasks: {
    description: string;
    is_completed: boolean;
  }[];
}

const fetchPublicLists = async (): Promise<PublicList[]> => {
  const { data, error } = await supabase
    .from("lists")
    .select(
      `
        id,
        title,
        type,
        reward,
        punishment,
        completed_at,
        is_completed,
        view_count,
        user_id,
        profiles:user_id!inner(username),
        tasks:tasks(description, is_completed)
      `
    )
    .eq("is_public", true)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    ...item,
    profiles: item.profiles || [],
    tasks: item.tasks || [],
  }));
};

export const PublicListsContainer = () => {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    fetchUser();
  }, []);
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicLists"],
    queryFn: fetchPublicLists,
  });

  if (isLoading) return <div> loading....</div>;

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-3">🏆</p>
          <h4 className="text-lg font-medium text-gray-200">
            Nessuna lista pubblica trovata
          </h4>
          <p className="text-gray-400 mt-1">
            Sii il primo a completare e condividere una lista!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((list) => (
        <PublicListCard key={list.id} list={list} userId={userId} />
      ))}
    </div>
  );
};
