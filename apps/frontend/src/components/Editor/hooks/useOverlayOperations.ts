import { useCallback } from "react";
import type { Overlay } from "../types";

export function useOverlayOperations(
  setOverlays: React.Dispatch<React.SetStateAction<Overlay[]>>
) {
  const handleDeleteOverlay = useCallback((overlayId: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== overlayId));
  }, [setOverlays]);

  const handleUpdateOverlay = useCallback((overlayId: string, updates: Partial<Overlay>) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === overlayId ? { ...o, ...updates } : o))
    );
  }, [setOverlays]);

  const handleAddOverlay = useCallback((overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
  }, [setOverlays]);

  return {
    handleDeleteOverlay,
    handleUpdateOverlay,
    handleAddOverlay,
  };
}
