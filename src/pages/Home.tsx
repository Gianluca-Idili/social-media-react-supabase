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
        profiles:user_id(id, username, avatar_url),
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

  const fetchMostLikedLists = async (): Promise<PublicList[]> => {
    const { data, error } = await supabase
      .rpc("get_lists_with_likes")
      .order("likes", { ascending: false })
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
        profiles:user_id!inner(id, username, avatar_url),
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

      {/* How it Works Section */}
      <motion.section 
        className="mb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Come Funziona?</h2>
          <p className="text-gray-400">Inizia la tua scalata verso il successo in 5 semplici passi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { step: 1, title: "Scegli", desc: "Seleziona tra sfida Daily, Weekly o Monthly", icon: "📅", color: "from-blue-500 to-cyan-500" },
            { step: 2, title: "Crea", desc: "Definisci il tuo obiettivo e i task necessari", icon: "✍️", color: "from-purple-500 to-pink-500" },
            { step: 3, title: "Scommetti", desc: "Imposta premi o punizioni per motivarti", icon: "🎲", color: "from-orange-500 to-red-500" },
            { step: 4, title: "Dimostra", desc: "Condividi la lista e ricevi voti dalla community", icon: "📢", color: "from-green-500 to-emerald-500" },
            { step: 5, title: "Scala", desc: "Completa i task, ottieni punti e sali in classifica", icon: "🏆", color: "from-yellow-500 to-orange-500" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              className="relative p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm group"
            >
              <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-sm font-black text-white shadow-lg`}>
                {item.step}
              </div>
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Carousels Section */}
      <div className="space-y-24 md:space-y-32">
        {/* Most Viewed Carousel */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  ⭐ Liste Più Visualizzate
                </h2>
                <p className="text-sm text-gray-400 mt-1">Le preferite della comunità</p>
              </div>
            </div>
            <Link 
              to="/lists?sort=views"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm md:text-base flex items-center gap-1 group"
            >
              Vedi tutto
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative px-0">
            <FeaturedGridCarousel queryKey="mostViewed" queryFn={fetchMostViewedLists} isMirrored={true} />
          </div>
        </motion.section>

        {/* Most Liked Carousel */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  👍 Più "Real"
                </h2>
                <p className="text-sm text-gray-400 mt-1">Le prove più convincenti</p>
              </div>
            </div>
            <Link 
              to="/lists?sort=real"
              className="text-green-400 hover:text-green-300 font-medium transition-colors text-sm md:text-base flex items-center gap-1 group"
            >
              Vedi tutto
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative px-0">
            <FeaturedGridCarousel queryKey="mostLiked" queryFn={fetchMostLikedLists} />
          </div>
        </motion.section>

        {/* Most Recent Carousel - MIRRORED */}
        <motion.section 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  🆕 Aggiunte di Recente
                </h2>
                <p className="text-sm text-gray-400 mt-1">Le ultime liste pubblicate</p>
              </div>
            </div>
            <Link 
              to="/lists?sort=recent"
              className="text-pink-400 hover:text-pink-300 font-medium transition-colors text-sm md:text-base flex items-center gap-1 group"
            >
              Vedi tutto
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
          <div className="mb-6 md:mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-yellow-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  🔥 Più Controverse
                </h2>
                <p className="text-sm text-gray-400 mt-1">Le più discusse</p>
              </div>
            </div>
            {/* Disclaimer: ora puntiamo al filtro 'fake' dedicato */}
            <Link 
              to="/lists?sort=fake"
              className="text-red-400 hover:text-red-300 font-medium transition-colors text-sm md:text-base flex items-center gap-1 group"
            >
              Vedi tutto
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
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
