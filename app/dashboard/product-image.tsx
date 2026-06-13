"use client";

import { useState } from "react";

type ProductImageProps = {
  alt: string;
  src?: string | null;
};

export function ProductImage({ alt, src }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const supportedSrc = getSupportedImageUrl(src);

  if (!supportedSrc || hasError) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded border border-[#e3d8c5] bg-[#f0ebe0] px-1 text-center text-xs text-[#68756e]">
        No image
      </div>
    );
  }

  return (
    <img
      src={supportedSrc}
      alt={alt}
      width={64}
      height={64}
      className="h-16 w-16 rounded border border-[#e3d8c5] object-cover"
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
