"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function MarqueeText({ children, className, containerClassName }: MarqueeTextProps) {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [offset, setOffset] = useState("0px");

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const diff = inner.scrollWidth - outer.clientWidth;
      if (diff > 0) {
        setOverflows(true);
        setOffset(`-${diff}px`);
      } else {
        setOverflows(false);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [children]);

  return (
    <span
      ref={outerRef}
      className={cn(
        "relative block min-w-0 overflow-hidden whitespace-nowrap",
        overflows && "marquee-container",
        containerClassName
      )}
    >
      <span
        ref={innerRef}
        className={cn(
          "inline-block whitespace-nowrap",
          overflows && "marquee-content",
          className
        )}
        style={
          overflows
            ? ({ "--marquee-offset": offset } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </span>
    </span>
  );
}
