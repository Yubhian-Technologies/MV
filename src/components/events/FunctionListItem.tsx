"use client";

import { useState } from "react";
import { Clock, MapPin, Shirt, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFunction } from "@/lib/firebase/events";
import { toast } from "sonner";
import type { EventFunction } from "@/types";

const FUNCTION_EMOJI: Record<string, string> = {
  Mehndi:     "💚",
  Haldi:      "💛",
  Sangeet:    "🎵",
  Engagement: "💍",
  Wedding:    "🙏",
  Reception:  "🎉",
  Custom:     "✨",
};

interface FunctionListItemProps {
  eventId: string;
  fn: EventFunction;
  onDeleted: (id: string) => void;
  onEdit: (fn: EventFunction) => void;
}

export function FunctionListItem({
  eventId,
  fn,
  onDeleted,
  onEdit,
}: FunctionListItemProps) {
  const [deleting, setDeleting] = useState(false);

  const date =
    fn.date instanceof Date ? fn.date : new Date(fn.date);

  const formattedDate = date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const displayName = fn.name === "Custom" && fn.customName ? fn.customName : fn.name;
  const emoji = FUNCTION_EMOJI[fn.name] ?? "✨";

  const handleDelete = async () => {
    if (!confirm(`Delete "${displayName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteFunction(eventId, fn.functionId);
      onDeleted(fn.functionId);
      toast.success(`"${displayName}" removed.`);
    } catch {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-100 hover:shadow-md">
      {/* Emoji icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
        {emoji}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-semibold text-slate-900">{displayName}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formattedDate}
            {fn.startTime && ` · ${fn.startTime}`}
            {fn.endTime && ` – ${fn.endTime}`}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {fn.venueName}, {fn.venueCity}
          </span>

          {fn.dressCode && (
            <span className="flex items-center gap-1">
              <Shirt className="h-3.5 w-3.5 text-slate-400" />
              {fn.dressCode}
            </span>
          )}
        </div>

        {fn.venueAddress && (
          <p className="text-xs text-slate-400">{fn.venueAddress}</p>
        )}
        {fn.notes && (
          <p className="mt-1 text-xs text-slate-400 italic">{fn.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(fn)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
