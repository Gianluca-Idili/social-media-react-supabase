import { useState } from "react";
import { PublicListCard } from "./PublicListCard";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PublicList } from "./types";
import { ChevronLeftIcon, ChevronRightIcon } from "../../svgs/Svgs";
import { Link } from "react-router-dom";
import { EyeIcon } from "../../svgs/Svgs";
import { useMediaQuery } from "react-responsive";

interface FeaturedGridCarouselProps {
  queryKey: string;
  queryFn: () => Promise<PublicList[]>;
  isMirrored?: boolean;
}

// Compact card component for small grid items
const CompactListCard = ({ list }: { list: PublicList }) => {
  const profilesArray = Array.isArray(list.profiles)
    ? list.profiles
    : [list.profiles || { username: "Anonimo", id: "unknown" }];

  const profile = profilesArray[0];
  const tasks = list.tasks || [];
  const completedTasks = tasks.filter((task) => task.is_completed).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Link to={`/detail/profile/${list.user_id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="h-full bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
      >
        {/* Header compatto */}
        <div className="p-3 bg-gradient-to-r from-gray-700/50 to-purple-500/10 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                {profile.username}
              </p>
              <p className="text-xs text-purple-400 capitalize">
                {list.type}
              </p>
            </div>
          </div>
        </div>

        {/* Contenuto */}
        <div className="flex-grow p-3 space-y-3">
          <h4 className="text-sm font-bold text-gray-100 line-clamp-2">
            {list.title}
          </h4>

          {/* Progress bar compatto */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Progresso</span>
              <span className="text-xs font-mono bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Tasks preview */}
          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Tasks ({tasks.length})
              </p>
              <div className="space-y-1">
                {tasks.slice(0, 2).map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                        task.is_completed ? "bg-green-500" : "bg-gray-600"
                      }`}
                    />
                    <p
                      className={`text-xs transition-colors truncate ${
                        task.is_completed
                          ? "text-gray-400 line-through"
                          : "text-gray-300"
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>
                ))}
              </div>
              {tasks.length > 2 && (
                <p className="text-xs text-gray-500 pl-3">
                  +{tasks.length - 2} altri...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer compatto */}
        <div className="px-3 py-2 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <EyeIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{list.view_count ?? 0}</span>
          </div>
          <span>{tasks.length} task</span>
        </div>
      </motion.div>
    </Link>
  );
};

export const FeaturedGridCarousel = ({
  queryKey,
  queryFn,
  isMirrored = false,
}: FeaturedGridCarouselProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 1023 }); // lg breakpoint

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Large card skeleton */}
        <div className="lg:col-span-1 h-96 bg-gray-800 rounded-xl animate-pulse" />
        
        {/* Small grid skeleton */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <div
              key={i}
              className="w-full h-40 bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-gray-400 py-6">No lists found</div>;
  }

  const itemsPerPage = isMobile ? 5 : 9;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIdx = currentIndex * itemsPerPage;
  const visibleItems = data.slice(startIdx, startIdx + itemsPerPage);

  // Ensure we have enough items, pad with first items if needed
  while (visibleItems.length < itemsPerPage && data.length < itemsPerPage) {
    visibleItems.push(...data.slice(0, itemsPerPage - visibleItems.length));
  }

  const featuredItem = visibleItems[0];
  const smallItemsCount = isMobile ? 4 : 8;
  const smallItems = visibleItems.slice(1, smallItemsCount + 1);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Main Grid Layout */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
        >
          {/* Featured Large Card */}
          <motion.div
            className={`lg:col-span-1 ${isMirrored ? "lg:order-2" : "lg:order-1"}`}
            initial={{ x: isMirrored ? 50 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-full">
              <PublicListCard list={featuredItem} userId={user?.id} />
            </div>
          </motion.div>

          {/* Small Cards Grid */}
          <motion.div
            className={`lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-max h-fit ${isMirrored ? "lg:order-1" : "lg:order-2"}`}
            initial={{ x: isMirrored ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {smallItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                className="h-full"
              >
                <CompactListCard list={item} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Pagination Dots - Mobile */}
        <div className="lg:hidden flex justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 w-6"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="lg:hidden flex justify-between items-center mt-4">
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-all"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </motion.button>
          <span className="text-gray-400 text-sm">
            {currentIndex + 1} / {totalPages}
          </span>
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-all"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
