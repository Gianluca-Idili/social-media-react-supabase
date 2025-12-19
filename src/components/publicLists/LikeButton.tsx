import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/AuthContext";
import { notifyUser } from "../../utils/notifications";
import { FakeIcon, RealIcon } from "../../svgs/Svgs";

interface Props {
  listId: string;
}

interface Vote {
  id: number;
  list_id?: string;
  user_id?: string;
  vote: number;
}

interface VoteAction {
  action: "added" | "removed" | "updated";
  vote: number;
  listOwnerId?: string;
  listTitle?: string;
}

const vote = async (voteValue: number, listId: string, userId: string): Promise<VoteAction> => {
  if (!userId) throw new Error("User ID is required");

  const { data: existingVote, error: fetchError } = await supabase
    .from("votes")
    .select("*")
    .eq("list_id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  // Ottieni le info della lista (proprietario e titolo)
  const { data: listData } = await supabase
    .from("lists")
    .select("user_id, title")
    .eq("id", listId)
    .single();

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
      return { action: "removed", vote: voteValue, listOwnerId: listData?.user_id, listTitle: listData?.title };
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);
      if (error) throw new Error(error.message);
      return { action: "updated", vote: voteValue, listOwnerId: listData?.user_id, listTitle: listData?.title };
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ list_id: listId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
    return { action: "added", vote: voteValue, listOwnerId: listData?.user_id, listTitle: listData?.title };
  }
};

const fetchVotes = async (listId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("id, user_id, vote")
    .eq("list_id", listId);

  if (error) throw new Error(error.message);
  return data || [];
};

export const LikeButton = ({ listId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate } = useMutation<VoteAction, Error, number, { previousVotes?: Vote[] }>({
    mutationFn: (voteValue: number) => {
      if (!user?.id) throw new Error("You must be logged in to vote!");
      return vote(voteValue, listId, user.id);
    },
    onMutate: async (voteValue) => {
      await queryClient.cancelQueries({ queryKey: ["votes", listId] });
      
      const previousVotes = queryClient.getQueryData<Vote[]>(["votes", listId]);
      
      queryClient.setQueryData(["votes", listId], (old: Vote[] | undefined) => {
        const existingVoteIndex = old?.findIndex(v => v.user_id === user?.id) ?? -1;
        
        if (existingVoteIndex >= 0) {
          if (old?.[existingVoteIndex].vote === voteValue) {
            return old?.filter(v => v.user_id !== user?.id) || [];
          } else {
            return old?.map(v => 
              v.user_id === user?.id ? { ...v, vote: voteValue } : v
            ) || [];
          }
        } else {
          return [
            ...(old || []), 
            {
              id: Date.now(),
              list_id: listId,
              user_id: user?.id,
              vote: voteValue
            }
          ];
        }
      });
      
      return { previousVotes };
    },
    onSuccess: async (result) => {
      // Invia notifica al proprietario della lista se è un nuovo voto o cambia voto
      if ((result.action === "added" || result.action === "updated") && result.listOwnerId && result.listOwnerId !== user?.id && result.listTitle) {
        const userName = user?.user_metadata?.user_name || user?.user_metadata?.name || "Qualcuno";
        
        if (result.vote === 1) {
          await notifyUser.realVote(result.listOwnerId, userName, result.listTitle);
        } else {
          await notifyUser.fakeVote(result.listOwnerId, userName, result.listTitle);
        }
      }
    },
    onError: (_err, _voteValue, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(["votes", listId], context.previousVotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", listId] });
    }
  });

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

  const { data: votes, isLoading, error } = useQuery<Vote[], Error>({
    queryKey: ["votes", listId],
    queryFn: () => fetchVotes(listId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="text-gray-400 py-2">Loading votes...</div>;
  if (error) return <div className="text-red-500 py-2">Error loading votes</div>;

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