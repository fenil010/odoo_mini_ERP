"use client";

import { useState } from "react";
import Image from "next/image";

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
    <Image
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

  try {
    const trimmedSrc = src.trim();
    const url = new URL(trimmedSrc);

    return url.protocol === "https:" && url.hostname === "images.unsplash.com"
      ? trimmedSrc
      : null;
  } catch {
    return null;
  }
}
