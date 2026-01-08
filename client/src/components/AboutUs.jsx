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

  const data = aboutUs?.data || defaultData;
  const highlights = data.highlights || [];
  const values = data.values || [];
  const stats = data.stats || [];

  return (
    <section id="AboutUs" className="relative overflow-hidden bg-[#0A2F46] py-8 sm:py-14 md:py-20 lg:py-24 text-white">

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:gap-3 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mt-2 sm:mt-3 mb-2 sm:mb-4 italic text-[#F1A722] px-2">{data.mainTitle}</h2>
          <div className="w-12 sm:w-16 md:w-20 h-[2px] bg-[#F1A722] mx-auto mb-2 sm:mb-3"></div>
          <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 leading-relaxed">
            {data.mainDescription}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 md:mt-10 space-y-5 sm:space-y-6">
          
          {/* MOBILE: Highlights First - Desktop: Right Column */}
          <div className="lg:hidden">
            <div className="rounded-xl sm:rounded-2xl border-2 border-[#14AAAB] bg-white/5 p-3 sm:p-4 backdrop-blur">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#F1A722] font-semibold mb-3">What Makes Us Special</p>
              <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex flex-col items-center text-center gap-1.5 rounded-lg border-2 border-[#14AAAB] bg-[#0A2F46]/20 px-2 py-2.5">
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
              <div key={index} className="rounded-lg sm:rounded-xl border-2 border-[#14AAAB] bg-gradient-to-br from-[#0A2F46]/40 to-[#0A2F46]/20 p-2.5 sm:p-3 text-center shadow-lg">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-[#14AAAB] font-bold leading-tight">{stat.label}</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-xl font-serif font-bold text-[#F1A722]">{stat.value}</p>
                <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/70 leading-tight">{stat.detail}</p>
              </div>
            ))}
          </div>

          {/* DESKTOP: Two Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="space-y-6">
              <div className="rounded-3xl border-2 border-[#14AAAB] bg-white/5 p-8 backdrop-blur self-start">
                <div className="grid gap-4 md:grid-cols-2">
                  {values.map((value, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/50 px-4 py-3">
                      <CheckCircleIcon className="h-5 w-5 text-[#F1A722] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/90 leading-relaxed">{value.text || value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3">
                {stats.map((stat, index) => (
                  <div key={index} className="rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/30 p-4 text-center shadow-lg">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#14AAAB] font-bold">{stat.label}</p>
                    <p className="mt-2 text-3xl font-serif font-bold text-[#F1A722]">{stat.value}</p>
                    <p className="mt-1 text-sm text-white/70">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#14AAAB] bg-[#134A5C]/40 p-7 backdrop-blur shadow-2xl shadow-black/25">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,167,34,0.05),transparent_32%)]" />
                <div className="relative space-y-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#F1A722] font-semibold">House rhythm</p>
                  <h3 className="text-2xl font-semibold text-white">{data.rhythmTitle}</h3>
                  <p className="text-white/80 leading-relaxed text-base">
                    {data.rhythmDescription}
                  </p>
                  <div className="rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/40 px-4 py-3 text-sm text-[#F1A722] italic font-medium">
                    {data.rhythmQuote}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border-2 border-[#14AAAB] bg-white/5 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-[#F1A722] font-semibold">Highlights</p>
                <div className="mt-5 grid gap-4 grid-cols-2">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/20 px-4 py-3">
                      <div className="text-2xl flex-shrink-0">{highlight.icon}</div>
                      <div>
                        <p className="text-base font-semibold text-white">{highlight.title}</p>
                        <p className="text-sm text-white/75 leading-relaxed">{highlight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE: House Rhythm */}
          <div className="lg:hidden relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#14AAAB] bg-[#134A5C]/40 p-3.5 sm:p-4 backdrop-blur shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(241,167,34,0.05),transparent_32%)]" />
            <div className="relative space-y-2 sm:space-y-2.5">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#F1A722] font-semibold">House Rhythm</p>
              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">{data.rhythmTitle}</h3>
              <p className="text-white/80 leading-relaxed text-xs sm:text-sm">
                {data.rhythmDescription}
              </p>
              <div className="rounded-lg sm:rounded-xl border-2 border-[#14AAAB] bg-[#0A2F46]/40 px-2.5 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs text-[#F1A722] italic font-medium leading-snug">
                {data.rhythmQuote}
              </div>
            </div>
          </div>

          {/* MOBILE: Values - Compact 2 Column */}
          <div className="lg:hidden rounded-xl sm:rounded-2xl border-2 border-[#14AAAB] bg-white/5 p-3 sm:p-4 backdrop-blur">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#F1A722] font-semibold mb-2.5 sm:mb-3">Our Values</p>
            <div className="grid gap-2 sm:gap-2.5 grid-cols-2">
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border-2 border-[#14AAAB] bg-[#0A2F46]/50 px-2 py-1.5 sm:px-2.5 sm:py-2">
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