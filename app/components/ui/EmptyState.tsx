"use client";

import { FolderOpen, Sparkles } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ded4c3] bg-gradient-to-br from-white to-[#fbfaf6] p-8 text-center sm:p-14 shadow-xs hover:border-[#1f806f]/40 transition-all duration-300">
      
      {/* Visual illustration wrapper */}
      <div className="relative flex size-20 items-center justify-center rounded-2xl border border-[#c9dbd5] bg-[#eef7f3] text-[#1f806f] shadow-xs animate-pulse">
        <FolderOpen className="size-8" />
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-[#1f806f] p-1 text-white shadow-xs">
          <Sparkles className="size-3 fill-white" />
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold text-[#18231f]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#53645c] leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f806f] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#176b5d] active:scale-95 duration-150 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
