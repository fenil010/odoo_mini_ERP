"use client";

import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ProductImageProps = {
  alt: string;
  src?: string | null;
  className?: string;
};

export function ProductImage({ alt, src, className }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const supportedSrc = getSupportedImageUrl(src);

  if (!supportedSrc || hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-[#f0ebe0] text-center text-[10px] font-bold text-[#68756e]",
          className || "h-full w-full"
        )}
      >
        No image
      </div>
    );
  }

  return (
    <img
      src={supportedSrc}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}

function getSupportedImageUrl(src?: string | null) {
  if (!src) {
    return null;
  }

  const trimmedSrc = src.trim();
  if (!trimmedSrc) {
    return null;
  }

  // Allow standard web protocols or local paths
  if (
    trimmedSrc.startsWith("http://") ||
    trimmedSrc.startsWith("https://") ||
    trimmedSrc.startsWith("/") ||
    trimmedSrc.startsWith("data:")
  ) {
    return trimmedSrc;
  }

  return null;
}
