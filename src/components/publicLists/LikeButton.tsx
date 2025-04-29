import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/AuthContext";
import { FakeIcon, RealIcon } from "../../svgs/Svgs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Props {
  listId: string;
}

interface Vote {
  id: number;
  list_id: string;
  user_id: string;
  vote: number;
}

const vote = async (voteValue: number, listId: string, userId: string) => {
  if (!userId) throw new Error("User ID is required");

  const { data: existingVote, error: fetchError } = await supabase
    .from("votes")
    .select("*")
    .eq("list_id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
      toast.success(`Vote removed!`);
      return { action: "removed", vote: voteValue };
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
      toast.success(`Vote updated to ${voteValue === 1 ? "Real" : "Fake"}!`);
      return { action: "updated", vote: voteValue };
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ list_id: listId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
    toast.success(`Voted ${voteValue === 1 ? "Real" : "Fake"}!`);
    return { action: "added", vote: voteValue };
  }
};

const fetchVotes = async (listId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("id, user_id, vote, list_id")
    .eq("list_id", listId);

  if (error) throw new Error(error.message);
  return data || []; // Restituisce array vuoto se data è null
};

export const LikeButton = ({ listId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Sottoscrizione realtime
  useEffect(() => {
    const channel = supabase
      .channel(`votes:${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `list_id=eq.${listId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["votes", listId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId, queryClient]);

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", listId],
    queryFn: () => fetchVotes(listId),
    retry: 2,
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user?.id) {
        toast.error("Please login to vote!");
        throw new Error("You must be logged in to vote!");
      }
      return vote(voteValue, listId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", listId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading)
    return <div className="text-gray-400 py-2">Loading votes...</div>;
  if (error)
    return <div className="text-red-500 py-2">Error loading votes</div>;

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote || 0;

  return (
    <div className="flex items-center space-x-4 my-4">
      <button
        onClick={() => mutate(1)}
        disabled={!user}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
          userVote === 1
            ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/20"
            : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
        }`}
        aria-label="Vote Real"
      >
        <RealIcon className="w-5 h-5 mr-2" />
        Real {likes > 0 && <span className="ml-1">({likes})</span>}
      </button>

      <button
        onClick={() => mutate(-1)}
        disabled={!user}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
          userVote === -1
            ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/20"
            : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
        }`}
        aria-label="Vote Fake"
      >
        <FakeIcon className="w-5 h-5 mr-2" />
        Fake {dislikes > 0 && <span className="ml-1">({dislikes})</span>}
      </button>
    </div>
  );
};
