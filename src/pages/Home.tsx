import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
// import { PublicListCard } from "../components/publicLists/PublicListCard";
import { FeaturedGridCarousel } from "../components/publicLists/FeaturedGridCarousel";
import { PublicList } from "../components/publicLists/types";
import { checkListsExpiringWithin6Hours } from "../utils/listHelpers";

export const Home = () => {
  const { user } = useAuth();

  // Check for lists expiring within 6 hours when user logs in
  useEffect(() => {
    if (user) {
      checkListsExpiringWithin6Hours(user.id).catch(console.error);
    }
  }, [user]);
  // const { data: topLikedLists } = useQuery<PublicList[]>({
  //   queryKey: ["topLikedLists"],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .rpc("get_lists_with_likes")
  //       .order("likes", { ascending: false })
  //       .limit(4);
  //     if (error) throw error;
  //     return data as PublicList[];
  //   },
  // });

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
        profiles:user_id(id, username),
        tasks:tasks(description, is_completed)
      `
      )
      .eq("is_public", true)
      .order("view_count", { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map((item) => {
      // Gestione sicura dei profili
      const profile = {
        id: item.user_id, // Usiamo user_id come fallback
        username: "Anonymous",
        ...(item.profiles 
          ? Array.isArray(item.profiles) 
            ? item.profiles[0] 
            : item.profiles
          : {})
      };

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
        profiles:user_id!inner(id, username),
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
    <div className="pt-6 relative pb-16 min-h-screen">
      {/* Header Section */}
      <div className="mb-16 md:mb-20">
        {/* Main Title with Action Button */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Lists
          </motion.h1>
          
          {/* Create Button */}
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
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
            >
              <span className="text-xl font-bold">+</span>
              <span className="font-semibold">{user ? "Crea Nuovo" : "Accedi"}</span>
            </motion.div>
          </Link>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-gray-400 text-center md:text-left">
          Scopri le liste più popolari, controverse e recenti della comunità
        </p>
      </div>

      {/* Carousels Section */}
      <div className="space-y-24 md:space-y-32">
        {/* Most Viewed Carousel */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6 md:mb-8 flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                ⭐ Liste Più Visualizzate
              </h2>
              <p className="text-sm text-gray-400 mt-1">Le preferite della comunità</p>
            </div>
          </div>
          <div className="relative px-0">
            <FeaturedGridCarousel queryKey="mostViewed" queryFn={fetchMostViewedLists} />
          </div>
        </motion.section>

        {/* Most Recent Carousel - MIRRORED */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6 md:mb-8 flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                🆕 Aggiunte di Recente
              </h2>
              <p className="text-sm text-gray-400 mt-1">Le ultime liste pubblicate</p>
            </div>
          </div>
          <div className="relative px-0">
            <FeaturedGridCarousel queryKey="mostRecent" queryFn={fetchMostRecentLists} isMirrored={true} />
          </div>
        </motion.section>

        {/* Most Controversial Carousel */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6 md:mb-8 flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-yellow-500 rounded-full"></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                🔥 Più Controverse
              </h2>
              <p className="text-sm text-gray-400 mt-1">Le più discusse</p>
            </div>
          </div>
          <div className="relative px-0">
            <FeaturedGridCarousel queryKey="mostDisliked" queryFn={fetchMostDislikedLists} />
          </div>
        </motion.section>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};
