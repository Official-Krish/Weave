export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex gap-4">
      <div className="h-11 w-11 rounded-2xl bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-2.5 w-24 rounded bg-white/[0.06]" />
        <div className="h-3.5 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
      </div>
      </div>
    </div>
  );
}