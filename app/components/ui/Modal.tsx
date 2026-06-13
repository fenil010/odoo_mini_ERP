"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#18231f]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content container */}
      <div className="relative z-10 w-full max-w-lg transform rounded-xl border border-[#ded4c3] bg-[#fbfaf6] p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-[#e5dccb] pb-4">
          <h3 className="text-xl font-semibold text-[#18231f]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#18231f] transition"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
