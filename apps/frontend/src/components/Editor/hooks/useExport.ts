import { useCallback, useState } from "react";
import { editorApi } from "../api";
import type { EditorProject, ExportJob } from "../types";

export function useExport(project: EditorProject | null) {
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleExport = useCallback(async () => {
    if (!project) return;
    try {
      const job = await editorApi.exportProject(project.id);
      setExportJob(job);
      setShowExportDialog(true);
    } catch (error) {
      console.error("Failed to start export:", error);
    }
  }, [project]);

  return { exportJob, showExportDialog, setShowExportDialog, handleExport };
}
