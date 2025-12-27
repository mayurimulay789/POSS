import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const AutoDots = ({ count, activeIndex, onJump }) => (
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
    {Array.from({ length: count }).map((_, i) => (
      <button
        key={i}
        aria-label={`Go to slide ${i + 1}`}
        className={
          'h-[2px] transition-all duration-500 ' +
          (activeIndex === i ? 'bg-white w-10' : 'bg-white/30 w-6 hover:bg-white/50')
        }
        onClick={() => onJump(i)}
      />
    ))}
  </div>
);

const NavButton = ({ dir = 'prev', onClick }) => (
  <button
    onClick={onClick}
    className={
      'absolute top-1/2 -translate-y-1/2 z-20 p-4 text-white/40 hover:text-white transition-all duration-300 ' +
      (dir === 'prev' ? 'left-4' : 'right-4')
    }
    aria-label={dir === 'prev' ? 'Previous slide' : 'Next slide'}
  >
    {dir === 'prev' ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.75} stroke="currentColor" className="size-10 md:size-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.75} stroke="currentColor" className="size-10 md:size-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    )}
  </button>
);

const BannerCarousel = ({ autoPlayMs = 6000, heightClass = 'h-[80vh] md:h-[90vh]' }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const hasImages = images && images.length > 0;

  useEffect(() => {
    let cancelled = false;
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/hotel-images/public`);
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : [];
          setImages(list);
        }
      } catch (e) {
        console.error('Failed to load images:', e);
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchImages();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hasImages) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [hasImages, images.length]);

  const slides = useMemo(() => {
    const bannerImages = images.filter((img) => img.isBanner);
    const finalSelection = bannerImages.length > 0 ? bannerImages : [];
    return finalSelection.map((img) => ({
      id: img._id || img.url,
      url: img.url,
      title: img.bannerHeading || img.title || 'A Ticket To A Heavenly Food Experience.',
    }));
  }, [images]);

  return (
    <section className={`relative w-full ${heightClass} bg-[#0a0a0a] overflow-hidden`}>
      {loading && <div className="absolute inset-0 bg-neutral-900 animate-pulse" />}

      <div className="absolute inset-0">
        {hasImages ? slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={s.url} alt="Banner" className="w-full h-full object-cover shadow-inner" />
            
            {/* Soft, subtle overlay - not too dark */}
            <div className="absolute inset-0 bg-black/30" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 max-w-5xl">
                {/* Thin, Decent Heading */}
                <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-light tracking-wide mb-10 leading-[1.3] drop-shadow-sm">
                  {s.title}
                </h2>

                {/* Elegant, minimalist button */}
                <Link
                  to="/menu"
                  className="inline-block border border-white/60 hover:border-white text-white px-10 py-3 text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:bg-white hover:text-black"
                >
                  Discover Menu
                </Link>
              </div>
            </div>
          </div>
        )) : null}
      </div>

      {hasImages && slides.length > 1 && (
        <>
          <NavButton dir="prev" onClick={() => setActive((active - 1 + slides.length) % slides.length)} />
          <NavButton dir="next" onClick={() => setActive((active + 1) % slides.length)} />
          <AutoDots count={slides.length} activeIndex={active} onJump={(idx) => setActive(idx)} />
        </>
      )}
    </section>
  );
};

export default BannerCarousel;