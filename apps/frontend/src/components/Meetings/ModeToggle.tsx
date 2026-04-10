type ModeToggleProps = {
  mode: "create" | "join";
  onChange: (mode: "create" | "join") => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange("create")}
        className={[
          "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
          mode === "create" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        Create
      </button>
      <button
        type="button"
        onClick={() => onChange("join")}
        className={[
          "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
          mode === "join" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        Join
      </button>
    </div>
  );
}
