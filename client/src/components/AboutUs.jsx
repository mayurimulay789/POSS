import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAboutUs } from '../store/slices/aboutUsSlice';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const AboutUs = () => {
  const dispatch = useDispatch();
  const aboutUs = useSelector(state => state.aboutUs);

  const defaultData = {
    yearEstablished: '1985',
    mainTitle: 'About Us',
    mainDescription: 'A dining room built for long conversations, generous portions, and the kind of hospitality that remembers your order before you ask.',
    highlights: [
      { title: 'Premium ingredients', description: 'Responsible sourcing, prepared fresh every day.', icon: '🥘' },
      { title: 'Seasonal menus', description: 'Plates that follow the market and the weather.', icon: '🌿' },
      { title: 'Attentive hosts', description: 'Service paced to your table, never rushed.', icon: '🤝' },
      { title: 'Atmosphere', description: 'Soft light, warm wood, and room to linger.', icon: '✨' }
    ],
    values: [
      { text: 'Founded in 1985 with a slow-cooking ethos.' },
      { text: 'Spices roasted in-house for bright aromatics.' },
      { text: 'Breads baked on order so they arrive steaming.' },
      { text: 'Plates balanced for sharing and conversation.' },
      { text: 'Music and pacing tuned to the room, not the clock.' },
      { text: 'Your favorites remembered, your time unhurried.' }
    ],
    stats: [
      { label: 'Years perfecting', value: '39+', detail: 'Crafted since 1985' },
      { label: 'Signature plates', value: '120', detail: 'Across classic regions' },
      { label: 'Guests hosted', value: '50K+', detail: 'Stories shared at our tables' }
    ],
    rhythmTitle: 'Paced for real conversations',
    rhythmDescription: 'Courses arrive when your table is ready, not the ticket. Music stays soft, lighting stays warm, and every plate is plated to share. It is the kind of room that invites you to stay for one more tea.',
    rhythmQuote: '"We cook and host the way family does at home - attentive, never rushed, always with a little extra on the plate."'
  };

  const loading = aboutUs?.loading || false;

  useEffect(() => {
    dispatch(fetchAboutUs());
    // Refetch About Us when window regains focus (in case admin toggled active entry)
    const onFocus = () => dispatch(fetchAboutUs());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [dispatch]);

  if (loading) {
    return (
      <section id="AboutUs" className="relative overflow-hidden bg-[#0A2F46] py-20 md:py-24 text-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-[#F1A722]">Loading...</div>
        </div>
      </section>
    );
  }

  // Always show only the active About Us entry if multiple are present
  let data = aboutUs?.data || defaultData;
  if (Array.isArray(data)) {
    // Prefer the first isActive entry, fallback to first entry, fallback to default
    data = data.find((entry) => entry.isActive) || data[0] || defaultData;
  }
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  const values = Array.isArray(data.values) ? data.values : [];
  const stats = Array.isArray(data.stats) ? data.stats : [];

  return (
    <section id="AboutUs" className="relative overflow-hidden bg-[#0A2F46] py-8 sm:py-14 md:py-20 lg:py-24 text-white">

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:gap-3 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mt-2 sm:mt-3 mb-2 sm:mb-4 italic text-[#F1A722] px-2 drop-shadow-[0_2px_8px_rgba(241,167,34,0.3)]">{data.mainTitle}</h2>
          <div className="w-16 sm:w-20 md:w-24 h-[3px] bg-gradient-to-r from-transparent via-[#F1A722] to-transparent mx-auto mb-2 sm:mb-3 shadow-[0_0_10px_rgba(241,167,34,0.4)]"></div>
          <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 leading-relaxed font-light">
            {data.mainDescription}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-10 space-y-5 sm:space-y-6">
          
          {/* MOBILE: Highlights First - Desktop: Right Column */}
          <div className="lg:hidden">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#F1A722]/70 font-semibold mb-3">What Makes Us Special</p>
              <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex flex-col items-center text-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-2.5">
                    <div className="text-xl sm:text-2xl">{highlight.icon}</div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">{highlight.title}</p>
                      <p className="text-[10px] sm:text-xs text-white/75 leading-snug mt-0.5">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats - Full Width on Mobile */}
          <div className="grid gap-2.5 sm:gap-3 grid-cols-3 lg:hidden">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-center">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/50 font-bold leading-tight">{stat.label}</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-xl font-serif font-bold text-[#F1A722]">{stat.value}</p>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/70 leading-tight">{stat.detail}</p>
              </div>
            ))}
          </div>

          {/* DESKTOP: Two Column Layout */}
          <div className="hidden lg:block">
            {/* Top Row: Values and House Rhythm side by side */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Values Section */}
              <div className="group rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-[#F1A722]/30 transition-all duration-300">
                <p className="text-sm uppercase tracking-[0.2em] text-[#F1A722] font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-[#F1A722]"></span>
                  Our Values
                </p>
                <div className="grid gap-3 grid-cols-2">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/10 hover:border-[#F1A722]/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                      <CheckCircleIcon className="h-5 w-5 text-[#F1A722] flex-shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(241,167,34,0.5)]" />
                      <p className="text-xs text-white/90 leading-relaxed font-light">{value.text || value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rhythm Section */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-[#F1A722]/30 transition-all duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,167,34,0.08),transparent_50%)]" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F1A722]/5 rounded-full blur-3xl" />
                <div className="relative space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#F1A722] font-bold flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-[#F1A722]"></span>
                    House Rhythm
                  </p>
                  <h3 className="text-lg font-bold text-white leading-tight">{data.rhythmTitle}</h3>
                  <p className="text-white/85 leading-relaxed text-xs font-light">
                    {data.rhythmDescription}
                  </p>
                  <div className="relative rounded-xl border border-[#F1A722]/20 bg-gradient-to-r from-[#F1A722]/10 to-transparent px-3 py-2 text-[11px] text-[#F1A722] italic font-medium leading-relaxed shadow-inner">
                    <span className="absolute left-2 top-2 text-[#F1A722]/40 text-lg font-serif">"</span>
                    <span className="block pl-4">{data.rhythmQuote}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section - Full Width */}
            <div className="group rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-7 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-[#F1A722]/30 transition-all duration-300 mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-[#F1A722] font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-[#F1A722]"></span>
                Our Journey
              </p>
              <div className="flex gap-5 justify-between">
                {stats.map((stat, index) => (
                  <div key={index} className="flex-1 rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 text-center hover:bg-white/15 hover:border-[#F1A722]/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold mb-2">{stat.label}</p>
                    <p className="mt-2 text-3xl font-serif font-bold text-[#F1A722] drop-shadow-[0_2px_8px_rgba(241,167,34,0.4)]">{stat.value}</p>
                    <p className="mt-2 text-xs text-white/75 font-light">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights Section - Full Width */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-[#F1A722]/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-40 h-40 bg-[#F1A722]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#F1A722]/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-[3px] bg-gradient-to-r from-[#F1A722] to-transparent rounded-full"></span>
                    <p className="text-base uppercase tracking-[0.25em] text-[#F1A722] font-bold">What Makes Us Special</p>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent ml-4"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="group/item relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#0A2F46]/50 via-white/5 to-transparent p-6 hover:bg-gradient-to-br hover:from-white/15 hover:via-white/10 hover:to-transparent hover:border-[#F1A722]/40 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-2xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F1A722]/5 rounded-full blur-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#F1A722]/20 to-[#F1A722]/5 border border-[#F1A722]/20 flex items-center justify-center text-3xl transform group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-lg">
                          {highlight.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-white mb-2 group-hover/item:text-[#F1A722] transition-colors duration-300">{highlight.title}</h4>
                          <p className="text-sm text-white/75 leading-relaxed font-light">{highlight.description}</p>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F1A722]/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE: House Rhythm */}
          <div className="lg:hidden relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,167,34,0.03),transparent_32%)]" />
            <div className="relative space-y-2 sm:space-y-2.5">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#F1A722]/70 font-semibold">House Rhythm</p>
              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">{data.rhythmTitle}</h3>
              <p className="text-white/80 leading-relaxed text-xs sm:text-sm">
                {data.rhythmDescription}
              </p>
              <div className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs text-[#F1A722]/80 italic font-medium leading-snug">
                {data.rhythmQuote}
              </div>
            </div>
          </div>

          {/* MOBILE: Values - Compact 2 Column */}
          <div className="lg:hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#F1A722]/70 font-semibold mb-2.5 sm:mb-3">Our Values</p>
            <div className="grid gap-2 sm:gap-2.5 grid-cols-2">
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 sm:px-2.5 sm:py-2">
                  <CheckCircleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#F1A722] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-[11px] text-white/90 leading-snug">{value.text || value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUs;













