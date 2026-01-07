import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../../store/slices/menuSlice';

const MenuManagement = () => {
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
    <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-4 pb-0 md:py-4 px-4 font-sans text-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Permission Denied Message */}
        {/* <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded-lg">
          <p className="font-semibold">View Only Access</p>
          <p className="text-sm mt-1">Only merchants and managers can add or modify food items and categories. You have view-only access.</p>
        </div> */}
        
        {/* Header */}
        <div className="text-center mb-4">
          <span className="uppercase tracking-[0.3em] text-sm text-teal-500 font-semibold">View</span>
          <h2 className="text-5xl md:text-6xl font-serif mt-4 mb-6 italic text-slate-900">Menu List</h2>
          <div className="w-24 h-[2px] bg-teal-400 mx-auto mb-8"></div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm md:text-base transition-all duration-200 rounded-full px-4 py-2 border ${
                  activeCategory === cat
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200 hover:text-teal-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 pb-20">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="group cursor-default">
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="text-lg font-serif font-medium text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.name}
                  </h3>
                  {/* Price Leader Dots */}
                  <div className="flex-1 border-b border-dotted border-slate-200 relative top-[-4px]"></div>
                  <span className="text-lg font-sans text-slate-900">
                    ₹{Number(item.price).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-slate-500 text-sm mt-2 italic max-w-[85%] leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-stone-400 italic">No items found in this category.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuManagement;
