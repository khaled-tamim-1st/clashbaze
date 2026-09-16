import React, { useRef, useEffect, useState } from "react";

interface TouchMarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per frame, e.g. 1.0
  className?: string;
  pauseOnHover?: boolean;
}

export function TouchMarquee({
  children,
  speed = 1.0,
  className = "",
  pauseOnHover = false,
}: TouchMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollPosRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const scrollPosRef = useRef(0);

  // Sync initial scroll pos
  useEffect(() => {
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
  }, []);

  // Continuous auto-scroll animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.67, 2.5); // normalized for 60fps
      lastTime = now;

      const el = containerRef.current;
      const content = contentRef.current;

      if (el && content && !isDraggingRef.current) {
        scrollPosRef.current += speed * delta;

        const halfWidth = content.scrollWidth / 2;
        if (halfWidth > 0) {
          if (scrollPosRef.current >= halfWidth) {
            scrollPosRef.current -= halfWidth;
          } else if (scrollPosRef.current < 0) {
            scrollPosRef.current += halfWidth;
          }
        }

        el.scrollLeft = Math.round(scrollPosRef.current);
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [speed]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startScrollPosRef.current = containerRef.current.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current || !contentRef.current) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    dragDistanceRef.current += Math.abs(deltaX);
    scrollPosRef.current = startScrollPosRef.current - deltaX;

    const halfWidth = contentRef.current.scrollWidth / 2;
    if (halfWidth > 0) {
      if (scrollPosRef.current >= halfWidth) scrollPosRef.current -= halfWidth;
      else if (scrollPosRef.current < 0) scrollPosRef.current += halfWidth;
    }

    containerRef.current.scrollLeft = Math.round(scrollPosRef.current);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startScrollPosRef.current = containerRef.current.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current || !contentRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    dragDistanceRef.current += Math.abs(deltaX);
    scrollPosRef.current = startScrollPosRef.current - deltaX;

    const halfWidth = contentRef.current.scrollWidth / 2;
    if (halfWidth > 0) {
      if (scrollPosRef.current >= halfWidth) scrollPosRef.current -= halfWidth;
      else if (scrollPosRef.current < 0) scrollPosRef.current += halfWidth;
    }

    containerRef.current.scrollLeft = Math.round(scrollPosRef.current);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If user dragged more than 8px, cancel card navigation click
    if (dragDistanceRef.current > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current || !contentRef.current) return;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    scrollPosRef.current += delta;

    const halfWidth = contentRef.current.scrollWidth / 2;
    if (halfWidth > 0) {
      if (scrollPosRef.current >= halfWidth) scrollPosRef.current -= halfWidth;
      else if (scrollPosRef.current < 0) scrollPosRef.current += halfWidth;
    }

    containerRef.current.scrollLeft = Math.round(scrollPosRef.current);
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
      }}
      onMouseLeave={() => {
        if (isDraggingRef.current) handleMouseUp();
      }}
    >
      <div
        ref={containerRef}
        className={`w-full overflow-x-hidden flex no-scrollbar ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          direction: "ltr",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClickCapture={handleClickCapture}
        onWheel={handleWheel}
      >
        <div ref={contentRef} className="flex flex-nowrap shrink-0">
          <div className="flex flex-nowrap gap-6 shrink-0 px-3" style={{ direction: "rtl" }}>
            {children}
          </div>
          <div
            className="flex flex-nowrap gap-6 shrink-0 px-3"
            aria-hidden="true"
            style={{ direction: "rtl" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}