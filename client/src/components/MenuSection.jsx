import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../store/slices/menuSlice';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const MenuSection = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.menu);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const INITIAL_ITEMS_COUNT = 8; // Show 8 items initially

  useEffect(() => {
    dispatch(fetchMenuItems());
  }, [dispatch]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set((items || []).map(item => item.category?.name || 'Menu'))];
    return cats;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items || [];
    return (items || []).filter(item => (item.category?.name || 'Menu') === activeCategory);
  }, [items, activeCategory]);

  // Reset showAll when category changes
  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  // Determine which items to display
  const displayedItems = useMemo(() => {
    if (showAll || filteredItems.length <= INITIAL_ITEMS_COUNT) {
      return filteredItems;
    }
    return filteredItems.slice(0, INITIAL_ITEMS_COUNT);
  }, [filteredItems, showAll]);

  const hasMoreItems = filteredItems.length > INITIAL_ITEMS_COUNT;

  if (loading) return (
    <div className="flex justify-center py-20 bg-slate-50">
      <div className="h-8 w-8 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center py-20 bg-slate-50">
      <span className="text-red-500">{error}</span>
    </div>
  );

  return (
    <section id="menu" className="bg-[#0A2F46] py-8 sm:py-16 md:py-20 px-4 sm:px-6 font-sans text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm text-[#D32B36] font-semibold">Experience</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mt-3 sm:mt-4 mb-4 sm:mb-6 italic text-[#F1A722] px-2">Our Menu</h2>
          <div className="w-16 sm:w-20 md:w-24 h-[2px] bg-[#FF9800] mx-auto mb-6 sm:mb-8"></div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs sm:text-sm md:text-base transition-all duration-300 rounded-lg px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 font-semibold ${
                  activeCategory === cat
                    ? 'bg-[#F1A722] text-[#0A2F46] shadow-lg scale-105'
                    : 'bg-[#14AAAB] text-white hover:bg-[#F1A722] hover:text-[#0A2F46]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-6 sm:gap-y-5 md:gap-y-4 mt-8 sm:mt-10 md:mt-12">
          {filteredItems.length > 0 ? (
            displayedItems.map((item) => (
              <div key={item._id} className="group cursor-default px-2 sm:px-0 animate-fadeIn">
                <div className="flex justify-between items-baseline gap-2 sm:gap-3 md:gap-4">
                  <h3 className="text-base sm:text-lg font-serif font-medium text-white group-hover:text-[#F1A722] transition-colors">
                    {item.name}
                  </h3>
                  {/* Price Leader Dots */}
                  <div className="flex-1 border-b border-dotted border-[#14AAAB] relative top-[-4px] min-w-[20px]"></div>
                  <span className="text-base sm:text-lg font-sans text-[#F1A722] whitespace-nowrap">
                    ₹{Number(item.price).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-white/80 text-xs sm:text-sm mt-2 italic max-w-[95%] sm:max-w-[85%] leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-stone-400 italic text-sm sm:text-base">No items found in this category.</p>
          )}
        </div>

        {/* View More / View Less Button */}
        {hasMoreItems && (
          <div className="flex justify-center mt-10 sm:mt-12 md:mt-16">
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-[#F1A722] hover:bg-[#14AAAB] text-[#0A2F46] hover:text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 border-2 border-[#F1A722] hover:border-[#14AAAB]"
            >
              <span className="text-sm sm:text-base uppercase tracking-wider">
                {showAll ? 'Show Less' : `View Full Menu (${filteredItems.length - INITIAL_ITEMS_COUNT} more)`}
              </span>
              {showAll ? (
                <ChevronUpIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-y-1" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-y-1" />
              )}
              
              {/* Decorative pulse effect */}
              {!showAll && (
                <span className="absolute inset-0 rounded-full bg-[#F1A722] opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>
              )}
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 sm:mt-16 md:mt-20 text-center">
          {/* <p className="text-stone-400 text-sm italic">
            * Please inform your server of any food allergies.
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;