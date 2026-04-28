import { useEffect } from "react";

export function useHotkeys(actions: any) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.defaultPrevented || isTypingTarget) return;

      if (e.key === " ") actions.toggle();
      if (e.key === "k") actions.toggle();
      if (e.key === "ArrowRight") actions.seek(5);
      if (e.key === "ArrowLeft") actions.seek(-5);
      if (e.key === "m") actions.toggleMute();
      if (e.key === "f") actions.fullscreen();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}