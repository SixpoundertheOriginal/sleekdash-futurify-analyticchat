
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Trash2, Plus } from "lucide-react";
import { SavedThread } from "./types";

interface SavedThreadsListProps {
  threads: SavedThread[];
  threadName: string;
  currentThreadId: string;
  onNameChange: (value: string) => void;
  onSelect: (threadId: string) => void;
  onRemove: (threadId: string) => void;
  onSave: () => void;
}

export function SavedThreadsList({
  threads,
  threadName,
  currentThreadId,
  onNameChange,
  onSelect,
  onRemove,
  onSave
}: SavedThreadsListProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white text-sm">Saved Threads:</span>
        {threads.length > 0 && (
          <Badge className="bg-primary/30 text-white">{threads.length}</Badge>
        )}
      </div>
      
      {threads.length > 0 ? (
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
          {threads.map((thread) => (
            <div 
              key={thread.id} 
              className="flex items-center justify-between gap-2 p-2 bg-black/20 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{thread.name}</p>
                <p className="text-white/60 text-xs truncate">{thread.id}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-primary/20"
                  onClick={() => onSelect(thread.id)}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => onRemove(thread.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-black/20 text-white/60 text-sm rounded-md text-center">
          No saved threads. Save threads for quick access.
        </div>
      )}
      
      <div className="pt-2 flex items-center gap-2">
        <Input
          value={threadName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Thread name"
          className="bg-black/30 border-white/10 text-white"
        />
        <Button
          variant="outline"
          size="sm"
          className="whitespace-nowrap bg-primary/20 border-primary/30 hover:bg-primary/30 text-white"
          onClick={onSave}
          disabled={!currentThreadId || !threadName}
        >
          <Plus className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
