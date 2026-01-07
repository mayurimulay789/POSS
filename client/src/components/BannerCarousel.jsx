import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelImages } from '../store/slices/hotelImageSlice';
import { Link } from 'react-router-dom';


const AutoDots = ({ count, activeIndex, onJump }) => (
  <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 z-20">
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
      'absolute top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 md:p-4 text-white/50 hover:text-white transition-all duration-300 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm ' +
      (dir === 'prev' ? 'left-2 sm:left-4' : 'right-2 sm:right-4')
    }
    aria-label={dir === 'prev' ? 'Previous slide' : 'Next slide'}
  >
    {dir === 'prev' ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 sm:size-8 md:size-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 sm:size-8 md:size-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    )}
  </button>
);

const BannerCarousel = ({ autoPlayMs = 6000, heightClass = 'h-[60vh] sm:h-[70vh] md:h-[85vh] lg:h-[90vh]' }) => {
  const dispatch = useDispatch();
  const { items: images = [], loading } = useSelector(state => state.hotelImage);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const hasImages = images && images.length > 0;

  useEffect(() => {
    dispatch(fetchHotelImages());
  }, [dispatch]);

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

  const scrollToMenu = (event) => {
  
    event.preventDefault();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.href = '/#menu';
  };

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
              <div className="text-center px-4 sm:px-6 max-w-5xl">
                {/* Thin, Decent Heading */}
                <h2 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-wide mb-6 sm:mb-8 md:mb-10 leading-[1.3] drop-shadow-lg px-2">
                  {s.title}
                </h2>

                {/* Elegant, minimalist button */}
                <Link
                  to="/#menu"
                  onClick={scrollToMenu}
                  className="inline-block bg-amber-400 hover:bg-amber-500 border-2 border-amber-400 hover:border-amber-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-[0.15em] rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
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