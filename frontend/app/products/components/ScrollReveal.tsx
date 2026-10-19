"use client";

import React, { ElementType, useEffect, useRef, useState } from "react";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  yOffset?: number;
  threshold?: number;
  rootMargin?: string;
  as?: ElementType;
}

export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  durationMs = 700,
  yOffset = 24,
  threshold = 0.08,
  rootMargin = "0px 0px -30px 0px",
  as: Component = "div",
  style,
  ...restProps
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Component
      ref={ref}
      className={`scroll-reveal ${isRevealed ? "is-revealed" : ""} ${className}`}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        transform: isRevealed ? "translateY(0)" : `translateY(${yOffset}px)`,
        opacity: isRevealed ? 1 : 0,
        ...style,
      }}
      {...restProps}
    >
      {children}
    </Component>
  );
}
