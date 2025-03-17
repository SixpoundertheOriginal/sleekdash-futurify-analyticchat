
import { useState, useCallback } from "react";

export interface UseDragAndDropReturn {
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  handleDrag: (e: React.DragEvent) => void;
  resetDragState: () => void;
}

export function useDragAndDrop(): UseDragAndDropReturn {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const resetDragState = useCallback(() => {
    setDragActive(false);
  }, []);

  return {
    dragActive,
    setDragActive,
    handleDrag,
    resetDragState
  };
}
