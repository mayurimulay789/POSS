import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const MenuSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/menu/items`);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Unable to load menu.');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(items.map(item => item.category?.name || 'Menu'))];
    return cats;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter(item => (item.category?.name || 'Menu') === activeCategory);
  }, [items, activeCategory]);

  if (loading) return (
    <div className="flex justify-center py-20 bg-[#fafaf9]">
      <div className="h-8 w-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <section id="menu" className="bg-[#fafaf9] pt-12 pb-6 md:py-16 px-4 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="uppercase tracking-[0.3em] text-sm text-amber-500 font-medium">Experience</span>
          <h2 className="text-5xl md:text-6xl font-serif mt-4 mb-6 italic text-amber-700">Our Menu</h2>
          <div className="w-24 h-px bg-stone-300 mx-auto mb-8"></div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm md:text-base transition-all duration-300 relative pb-1 ${
                  activeCategory === cat ? 'text-amber-700' : 'text-stone-400 hover:text-amber-700'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-px bg-stone-900 animate-in fade-in slide-in-from-left-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="group cursor-default">
                <div className="flex justify-between items-baseline gap-4">
                  <h3 className="text-lg font-serif font-medium text-stone-800 group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>
                  {/* Price Leader Dots */}
                  <div className="flex-1 border-b border-dotted border-stone-300 relative top-[-4px]"></div>
                  <span className="text-lg font-serif text-stone-900">
                    ₹{Number(item.price).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-stone-500 text-sm mt-2 italic max-w-[85%] leading-relaxed">
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