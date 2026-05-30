"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

function filterEmojiChars(str: string): string {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return Array.from(segmenter.segment(str), (s) => s.segment)
    .filter((s) => /\p{Extended_Pictographic}/u.test(s))
    .join("");
}

interface EmojiInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function EmojiInput({
  value,
  onChange,
  placeholder,
  id,
  className,
}: EmojiInputProps) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [marqueeOffset, setMarqueeOffset] = useState("0px");
  const innerRef = useRef<HTMLSpanElement>(null);
  const outerRef = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();

  const displayValue = useMemo(() => filterEmojiChars(value), [value]);

  useEffect(() => {
    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;

    const measure = () => {
      const overflow = inner.scrollWidth - outer.clientWidth;
      if (overflow > 0) {
        setOverflows(true);
        setMarqueeOffset(`-${overflow}px`);
      } else {
        setOverflows(false);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [displayValue]);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      onChange(emojiData.emoji);
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            id={id}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded border border-border/50 bg-background/40 px-3 py-2 text-sm transition-all hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/15 focus:outline-none",
              !displayValue && "text-muted-foreground",
              className
            )}
          >
            <span ref={outerRef} className="min-w-0 overflow-hidden">
              <span
                ref={innerRef}
                className={cn(
                  "inline-block whitespace-nowrap",
                  overflows && "animate-marquee"
                )}
                style={
                  overflows
                    ? ({ "--marquee-offset": marqueeOffset } as React.CSSProperties)
                    : undefined
                }
              >
                {displayValue || placeholder || "Select emoji..."}
              </span>
            </span>
            {displayValue && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Clear emoji"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        )}
      />
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <EmojiPicker
          open={open}
          emojiStyle={EmojiStyle.NATIVE}
          theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
          onEmojiClick={handleEmojiClick}
          searchPlaceholder="Search emoji..."
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
          autoFocusSearch
        />
      </PopoverContent>
    </Popover>
  );
}
