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
    <section id="AboutUs" className="relative overflow-hidden bg-[#0A2F46] py-20 md:py-24 text-white">

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif mt-4 mb-6 italic text-[#F1A722]">{data.mainTitle}</h2>
          <div className="w-24 h-[2px] bg-[#F1A722] mx-auto mb-4"></div>
          <p className="text-white/90 text-base md:text-lg max-w-3xl mx-auto">
            {data.mainDescription}
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border-2 border-[#14AAAB] bg-white/5 p-8 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/50 px-4 py-3">
                  <CheckCircleIcon className="h-5 w-5 text-[#F1A722]" />
                  <p className="text-sm text-white/90 leading-relaxed">{value.text || value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-2xl border-2 border-[#14AAAB] bg-[#0A2F46]/20 px-4 py-3">
                    <div className="text-2xl">{highlight.icon}</div>
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
      </div>
    </section>
  );
};

export default AboutUs;