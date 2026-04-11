import { cn } from "@/lib/utils";

type HoverArrowButtonProps = {
  href: string;
  label: string;
  className?: string;
};

export function HoverArrowButton({ href, label, className }: HoverArrowButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "group/button relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-black py-2 pl-11 pr-4 tracking-tight text-white",
        className
      )}
    >
      <ArrowIcon />

      <div className="absolute -inset-px rounded-lg bg-white/20 transition-[clip-path] duration-300 ease-out [clip-path:inset(0_100%_0_0)] group-hover/button:[clip-path:inset(0_0%_0_0)]" />

      <span className="relative z-10 inline-block text-white transition-transform duration-300 group-hover/button:-translate-x-8">
        {label}
      </span>
    </a>
  );
}

function ArrowIcon() {
  return (
    <div className="absolute inset-y-0 left-1 z-40 my-auto flex size-8 flex-col items-center justify-center gap-px rounded-md bg-yellow-500 transition-all duration-300 ease-out group-hover/button:left-[calc(100%-2.3rem)] group-hover/button:rotate-180 group-hover/button:transform">
      <div className="flex flex-col gap-px">
        <DotRow pattern={[0, 0, 1, 0, 0]} />
        <DotRow pattern={[0, 0, 0, 1, 0]} />
        <DotRow pattern={[1, 1, 1, 1, 1]} />
        <DotRow pattern={[0, 0, 0, 1, 0]} />
        <DotRow pattern={[0, 0, 1, 0, 0]} />
      </div>
    </div>
  );
}

function DotRow({ pattern }: { pattern: Array<0 | 1> }) {
  return (
    <div className="flex gap-px">
      {pattern.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className={cn(
            "inline-block size-0.75 shrink-0 rounded-full",
            value ? "animate-pulse bg-white duration-200 ease-linear" : "bg-white/25"
          )}
        />
      ))}
    </div>
  );
}