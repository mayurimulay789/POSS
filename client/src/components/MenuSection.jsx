import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../store/slices/menuSlice';

const MenuSection = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.menu);
  const [activeCategory, setActiveCategory] = useState('All');

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
    <section id="menu" className="bg-gradient-to-br from-[#0A3D4D] via-[#134A5C] to-[#0A3D4D] pt-4 pb-0 md:py-4 px-4 font-sans text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-4">
          <span className="uppercase tracking-[0.3em] text-sm text-[#FF9800] font-semibold">Experience</span>
          <h2 className="text-5xl md:text-6xl font-serif mt-4 mb-6 italic text-white">Our Menu</h2>
          <div className="w-24 h-[2px] bg-[#FF9800] mx-auto mb-8"></div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm md:text-base transition-all duration-200 rounded-full px-4 py-2 border ${
                  activeCategory === cat
                    ? 'bg-[#FF9800] text-white border-[#FF9800] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#FF9800] hover:text-[#FF9800]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="group cursor-default">
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="text-lg font-serif font-medium text-white group-hover:text-[#FF9800] transition-colors">
                    {item.name}
                  </h3>
                  {/* Price Leader Dots */}
                  <div className="flex-1 border-b border-dotted border-gray-500 relative top-[-4px]"></div>
                  <span className="text-lg font-serif text-white">
                    ₹{Number(item.price).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-slate-300 text-sm mt-2 italic max-w-[85%] leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-stone-400 italic">No items found in this category.</p>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center">
          {/* <p className="text-stone-400 text-sm italic">
            * Please inform your server of any food allergies.
          </p> */}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;