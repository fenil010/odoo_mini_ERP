import { FolderOpen } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ded4c3] bg-[#fbfaf6] p-8 text-center sm:p-12">
      <div className="flex size-12 items-center justify-center rounded-lg border border-[#c9dbd5] bg-[#eef7f3] text-[#176b5d]">
        <FolderOpen className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#18231f]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#53645c]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
