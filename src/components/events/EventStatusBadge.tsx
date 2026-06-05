import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/types";

const config: Record<
  EventStatus,
  { label: string; className: string }
> = {
  draft:     { label: "Draft",     className: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
  active:    { label: "Active",    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  archived:  { label: "Archived",  className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, className } = config[status] ?? config.draft;
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
