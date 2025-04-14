import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { CommentSection } from "./CommentSection";
import { Post } from "./PostList";
import { LikeButton } from "./LikeButton";

interface Props {
  postId: number;
}

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data as Post;
};

export const PostDetail = ({ postId }: Props) => {
  const { data, error, isLoading } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });

  if (isLoading) {
    return <div> Loading posts... </div>;
  }

  if (error) {
    return <div> Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent break-words overflow-hidden">
        {data?.title}
      </h2>

      {data?.image_url && (
        <div className="flex justify-center bg-black rounded-lg overflow-hidden shadow-xl">
          <img
            src={data.image_url}
            alt={data.title}
            className="max-h-[70vh] w-auto object-contain"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
      )}

      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300">{data?.content}</p>
      </div>

      <div className="flex justify-between items-center text-gray-400">
        <p className="text-sm">
          Posted on: {new Date(data!.created_at).toLocaleDateString()}
        </p>
        {/* Aggiungi qui eventuali informazioni sull'autore */}
      </div>

      <LikeButton postId={postId} />
      <CommentSection postId={postId} />
    </div>
  );
};
