"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  showTooltip?: boolean;
  formatTooltip?: (value: number) => string;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  showTooltip = false,
  formatTooltip,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  const handleValueChange = (newValue: number[]) => {
    setIsDragging(true);
    onValueChange?.(newValue);
  };

  const handleValueCommit = (newValue: number[]) => {
    setIsDragging(false);
    onValueCommit?.(newValue);
  };

  const getTooltipPosition = (val: number) => {
    const percent = ((val - min) / (max - min)) * 100;
    const thumbOffset = 8 - (percent / 100) * 16;
    return `calc(${percent}% + ${thumbOffset}px)`;
  };

  return (
    <div className="relative">
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-56 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-neutral-300 relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border-3 bg-background transition-[color] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
      {showTooltip &&
        isDragging &&
        _values.map((val, index) => (
          <div
            key={index}
            className="absolute z-50 top-4.5 flex flex-col items-center"
            style={{
              left: getTooltipPosition(val),
              transform: "translateX(-50%)",
            }}
          >
            <div className="size-2.5 rotate-45 bg-primary" />
            <div className="-mt-1.25 rounded-sm bg-primary px-3 py-1.5 text-xs text-secondary font-bold">
              {formatTooltip ? formatTooltip(val) : val}
            </div>
          </div>
        ))}
    </div>
  );
}

export { Slider };
