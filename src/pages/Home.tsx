import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { PublicListCard } from "../components/publicLists/PublicListCard";
import { Carousel } from "../components/publicLists/Carousel";
import { PublicList } from "../components/publicLists/types";

export const Home = () => {
  const { user } = useAuth();

  // Query for top liked lists
  const { data: topLikedLists } = useQuery<PublicList[]>({
    queryKey: ["topLikedLists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_lists_with_likes")
        .order("likes", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as PublicList[];
    },
  });

  // Query functions for carousels
  const fetchMostViewedLists = async (): Promise<PublicList[]> => {
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
      .order("view_count", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map((item) => {
      // Gestione sicura dei profili
      let profile = { username: "Anonymous" };
      if (item.profiles) {
        if (Array.isArray(item.profiles)) {
          profile = item.profiles[0] || profile;
        } else {
          profile = item.profiles;
        }
      }

      return {
        ...item,
        profiles: profile,
        tasks: item.tasks || [],
      };
    });
  };

  const fetchMostDislikedLists = async (): Promise<PublicList[]> => {
    const { data, error } = await supabase
      .rpc("get_lists_with_dislikes")
      .order("dislikes", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as PublicList[];
  };

  const fetchMostRecentLists = async (): Promise<PublicList[]> => {
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
      .order("completed_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data.map((item) => {
      const profile = item.profiles
        ? Array.isArray(item.profiles)
          ? item.profiles[0] || { username: "Anonymous" }
          : item.profiles
        : { username: "Anonymous" };

      return {
        ...item,
        profiles: profile,
        tasks: item.tasks || [],
      } as PublicList;
    });
  };

  return (
    <div className="pt-10 relative pb-10">
      {/* Create button */}
      <div className="absolute top-0 right-0">
        <Link
          to={user ? "/list/create" : ""}
          onClick={
            !user
              ? (e) => {
                  e.preventDefault();
                  alert("Per favore accedi per creare una lista");
                }
              : undefined
          }
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-xl">+</span>
            <span>{user ? "Crea nuovo" : "Accedi per creare"}</span>
          </motion.div>
        </Link>
      </div>

      {/* Main title */}
      <h2 className="text-6xl pt-5 pb-10 font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Explore Lists
      </h2>

      {/* Top liked lists (desktop only) */}
      <div className="hidden lg:block mb-12">
        <h3 className="text-2xl font-bold text-gray-200 mb-6 px-4">
          Top Community Picks
        </h3>
        {topLikedLists && topLikedLists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {topLikedLists.map((list) => (
              <PublicListCard key={list.id} list={list} userId={user?.id} />
            ))}
          </div>
        )}
      </div>

     {/* Carousels */}
     <div className="space-y-6 md:space-y-12">
        {/* Most Viewed */}
        <div className="px-4 relative">
        <h3 className="text-xl md:text-2xl font-bold text-gray-200 mb-3 md:mb-6">
      Most Viewed
    </h3>
          <Carousel queryKey="mostViewed" queryFn={fetchMostViewedLists} />
        </div>

        {/* Most Disliked */}
        <div className="px-4 relative">
          <h3 className="text-2xl font-bold text-gray-200 mb-6">Most Controversial</h3>
          <Carousel queryKey="mostDisliked" queryFn={fetchMostDislikedLists} />
        </div>

        {/* Most Recent */}
        <div className="px-4 relative">
          <h3 className="text-2xl font-bold text-gray-200 mb-6">Recently Added</h3>
          <Carousel queryKey="mostRecent" queryFn={fetchMostRecentLists} />
        </div>
      </div>
    </div>
  );
};
