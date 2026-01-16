import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase-client";
import { PublicListCard } from "./PublicListCard";
import { useEffect, useState, useMemo } from "react";
import { Profile } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";

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
  profiles: Profile[];
  tasks: {
    description: string;
    is_completed: boolean;
  }[];
  votes?: { vote: number }[];
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
        profiles:user_id!inner(id, username),
        tasks:tasks(description, is_completed),
        votes:votes(vote)
      `
    )
    .eq("is_public", true);

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    ...item,
    profiles: item.profiles || [],
    tasks: item.tasks || [],
    votes: item.votes || [],
  }));
};

type SortOption = "recent" | "az" | "za" | "views" | "real" | "fake";
type FilterOption = "all" | "daily" | "weekly" | "monthly";

export const PublicListsContainer = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leggi i valori iniziali dall'URL o usa i default
  const searchQuery = searchParams.get("search") || "";
  const sortBy = (searchParams.get("sort") as SortOption) || "recent";
  const filterType = (searchParams.get("filter") as FilterOption) || "all";

  const updateFilters = (updates: { search?: string; sort?: SortOption; filter?: FilterOption }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.search !== undefined) {
      if (updates.search) newParams.set("search", updates.search);
      else newParams.delete("search");
    }
    
    if (updates.sort !== undefined) {
      if (updates.sort !== "recent") newParams.set("sort", updates.sort);
      else newParams.delete("sort");
    }
    
    if (updates.filter !== undefined) {
      if (updates.filter !== "all") newParams.set("filter", updates.filter);
      else newParams.delete("filter");
    }
    
    setSearchParams(newParams);
  };

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

  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    // 1. Filtro per tipo
    if (filterType !== "all") {
      result = result.filter((list) => list.type === filterType);
    }

    // 2. Filtro per ricerca (titolo o username)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (list) =>
          list.title.toLowerCase().includes(query) ||
          list.profiles[0]?.username?.toLowerCase().includes(query)
      );
    }

    // 3. Ordinamento
    result.sort((a, b) => {
      const aReal = a.votes?.filter(v => v.vote === 1).length || 0;
      const bReal = b.votes?.filter(v => v.vote === 1).length || 0;
      const aFake = a.votes?.filter(v => v.vote === -1).length || 0;
      const bFake = b.votes?.filter(v => v.vote === -1).length || 0;

      switch (sortBy) {
        case "recent":
          return new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime();
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "views":
          return (b.view_count || 0) - (a.view_count || 0);
        case "real":
          return bReal - aReal;
        case "fake":
          return bFake - aFake;
        default:
          return 0;
      }
    });

    return result;
  }, [data, searchQuery, sortBy, filterType]);

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return <div className="text-red-500 text-center py-10">Errore: {error.message}</div>;

  const resetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm sticky top-24 z-10 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Cerca per titolo o autore..."
              value={searchQuery}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full bg-gray-800 border-none rounded-xl py-3 pl-12 pr-4 text-gray-100 focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => updateFilters({ filter: e.target.value as FilterOption })}
              className="bg-gray-800 text-gray-200 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
            >
              <option value="all">Tutti i tipi</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => updateFilters({ sort: e.target.value as SortOption })}
              className="bg-gray-800 text-gray-200 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
            >
              <option value="recent">Più recenti</option>
              <option value="views">Più visti</option>
              <option value="real">Più "Real" 👍</option>
              <option value="fake">Più "Fake" (Controverse) 🔥</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredAndSortedData.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">
            <div className="text-5xl mb-4">🔍</div>
            <h4 className="text-xl font-bold text-gray-100 mb-2">
              Nessun risultato
            </h4>
            <p className="text-gray-400">
              Non abbiamo trovato liste che corrispondano alla tua ricerca. Prova con parole diverse!
            </p>
            <button 
              onClick={resetFilters}
              className="mt-6 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Resetta tutti i filtri
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedData.map((list) => (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <PublicListCard list={list} userId={userId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
