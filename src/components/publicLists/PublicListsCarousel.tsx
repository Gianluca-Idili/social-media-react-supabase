import { useRef, useState } from 'react';
import { PublicListCard } from './PublicListCard';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PublicList } from './types';
import { ChevronLeftIcon, ChevronRightIcon } from '../../svgs/Svgs';

interface CarouselProps {
  queryKey: string;
  queryFn: () => Promise<PublicList[]>;
}

export const Carousel = ({ queryKey, queryFn }: CarouselProps) => {
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn,
  });

  const handleArrowLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ 
        left: -300, 
        behavior: 'smooth' 
      });
    }
  };

  const handleArrowRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ 
        left: 300, 
        behavior: 'smooth' 
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // Moltiplicatore per maggiore sensibilità
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="flex space-x-6 overflow-x-auto py-4 scrollbar-hide">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-72 h-96 bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-gray-400 py-6">No lists found</div>;
  }

  return (
    <div className="relative group">
      {/* Desktop Navigation Arrows */}
      <div className="hidden md:block">
        <button
          onClick={handleArrowLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleArrowRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className={`flex space-x-6 py-4 overflow-x-auto scrollbar-hide ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {data.map((list) => (
          <motion.div
            key={list.id}
            className="flex-shrink-0 w-72"
            whileHover={{ scale: isDragging ? 1 : 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <PublicListCard list={list} userId={user?.id} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};