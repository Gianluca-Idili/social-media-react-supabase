import { useQuery } from "@tanstack/react-query";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";

interface Props {
  communityId: number;
}


const fetchCommunityName = async (communityId: number): Promise<string> => {
  const { data, error } = await supabase
    .from("communities")
    .select("name")
    .eq("id", communityId)
    .single();

  if (error) throw new Error(error.message);
  return data.name;
};


const fetchCommunityPosts = async (communityId: number): Promise<Post[]> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const CommunityDisplay = ({ communityId }: Props) => {
  
  const {
    data: communityName,
    isLoading: loadingName,
    error: nameError
  } = useQuery({
    queryKey: ["communityName", communityId],
    queryFn: () => fetchCommunityName(communityId)
  });

  
  const {
    data: posts,
    isLoading: loadingPosts,
    error: postsError
  } = useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: () => fetchCommunityPosts(communityId)
  });

  if (loadingName || loadingPosts) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (nameError || postsError) {
    return (
      <div className="text-center text-red-500 py-4">
        Error: {nameError?.message || postsError?.message}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {communityName} Community Posts
      </h2>

      {posts && posts.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {posts.map((post, key) => (
            <PostItem key={key} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          No posts in {communityName} yet.
        </p>
      )}
    </div>
  );
};