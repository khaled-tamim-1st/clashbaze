import React, { useRef, useEffect, useState, useCallback } from "react";

interface TouchMarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function TouchMarquee({
  children,
  speed = 0.85,
  className = "",
  pauseOnHover = true,
}: TouchMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animFrameRef = useRef<number | undefined>(undefined);

  // Resume auto-scroll after inactivity
  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setIsDragging(false);
      isDraggingRef.current = false;
    }, 1800);
  }, []);

  // Seamless wrap-around check
  const checkWrap = useCallback(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;

    const halfWidth = content.scrollWidth / 2;
    if (halfWidth <= 0) return;

    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += halfWidth;
    }
  }, []);

  // Continuous auto-scroll loop
  useEffect(() => {
    const step = () => {
      const el = containerRef.current;
      if (el && !isInteracting && !isHovered && !isDraggingRef.current) {
        el.scrollLeft += speed;
        checkWrap();
      }
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [isInteracting, isHovered, speed, checkWrap]);

  // Touch handlers for mobile
  const handleTouchStart = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    scheduleResume();
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsInteracting(true);
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    startScrollLeftRef.current = containerRef.current.scrollLeft;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.2;
    dragDistanceRef.current += Math.abs(walk);
    containerRef.current.scrollLeft = startScrollLeftRef.current - walk;
    checkWrap();
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    scheduleResume();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleWheel = () => {
    setIsInteracting(true);
    checkWrap();
    scheduleResume();
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
      }}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => {
        if (pauseOnHover) setIsHovered(false);
        if (isDraggingRef.current) handleMouseUp();
      }}
    >
      <div
        ref={containerRef}
        className={`w-full overflow-x-auto flex no-scrollbar ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          direction: "ltr",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClickCapture={handleClickCapture}
        onWheel={handleWheel}
        onScroll={checkWrap}
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