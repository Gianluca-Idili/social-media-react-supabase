import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../context/AuthContext";
import { FakeIcon, RealIcon,  } from "../../svgs/Svgs";

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
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("list_id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    // Liked -> 0, Like -> -1
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ list_id: listId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
  }
};

const fetchVotes = async (listId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("list_id", listId);

  if (error) throw new Error(error.message);
  return data as Vote[];
};

export const LikeButton = ({ listId }: Props) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", listId],
    queryFn: () => fetchVotes(listId),
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("You must be logged in to Vote!");
      return vote(voteValue, listId, user.id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", listId] });
    },
  });

  if (isLoading) {
    return <div> Loading votes...</div>;
  }

  if (error) {
    return <div> Error: {error.message}</div>;
  }

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  return (
    <div className="flex items-center space-x-4 my-4">
      <button
        onClick={() => mutate(1)}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
          userVote === 1
            ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/20"
            : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
        }`}
      >
        <RealIcon className="w-5 h-5 mr-2" />
        Real {likes}
      </button>
      <button
        onClick={() => mutate(-1)}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
          userVote === -1
            ? "bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/20"
            : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
        }`}
      >
        <FakeIcon className="w-5 h-5 mr-2" />
        Fake {dislikes}
      </button>
    </div>
  );
};