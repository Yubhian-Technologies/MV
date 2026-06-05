import Link from "next/link";
import type { InvitationTemplate } from "@/types";
import { TemplateThumbnail } from "./TemplatePreviewRenderer";

interface Props {
  template: InvitationTemplate;
  /** If provided, show an "Apply" button instead of navigating to the detail page */
  onApply?: (templateId: string) => void;
  applied?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  traditional: "Traditional",
  floral: "Floral",
  royal: "Royal",
  modern: "Modern",
  festive: "Festive",
};

export function TemplateCard({ template, onApply, applied }: Props) {
  const content = (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        applied ? "border-rose-400 ring-2 ring-rose-300" : "border-slate-100"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <TemplateThumbnail template={template} />
        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {template.isPremium && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              PRO
            </span>
          )}
          {!template.isPremium && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              FREE
            </span>
          )}
        </div>
        {applied && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Applied
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-900 leading-tight">{template.name}</p>
          <span className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {CATEGORY_LABELS[template.category] ?? template.category}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {template.description}
        </p>

        {onApply && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onApply(template.templateId);
            }}
            className={`mt-auto w-full rounded-xl py-2 text-sm font-medium transition-all ${
              applied
                ? "bg-rose-100 text-rose-700 cursor-default"
                : "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
            }`}
          >
            {applied ? "Currently Applied" : "Apply Template"}
          </button>
        )}
      </div>
    </div>
  );

  if (onApply) return content;

  return (
    <Link href={`/templates/${template.templateId}`} className="block">
      {content}
    </Link>
  );
}
