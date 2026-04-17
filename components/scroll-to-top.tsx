"use client";
import React, { useState, useEffect } from "react";
import { HiOutlineArrowUp } from "react-icons/hi2";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    const start = window.scrollY;
    const duration = 600; // Optimized for a quick yet smooth transition
    const startTime = performance.now();

    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutQuad(progress);

      window.scrollTo(0, start * (1 - ease));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isMounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 z-[999] p-3.5 rounded-full shadow-2xl hover:shadow-ui-blue/40 transition-all duration-500 ease-in-out transform hover:scale-110 sm:right-10 group gradient-primary
        ${
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-20 pointer-events-none"
        }
        bottom-8 sm:bottom-12`} 
      aria-label="Scroll to top"
    >
      <HiOutlineArrowUp className="text-white text-[22px] transition-transform duration-300 group-hover:animate-bounce cursor-pointer" />
    </button>
  );
};

export default ScrollToTop;

