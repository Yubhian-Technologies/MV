"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { TemplateCategory } from "@/types";

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | TemplateCategory>("all");

  const filtered =
    activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  const freeCount = TEMPLATES.filter((t) => !t.isPremium).length;

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invitation Templates</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {TEMPLATES.length} designs — {freeCount} free, {TEMPLATES.length - freeCount} premium
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-amber-800 font-medium">Upgrade to unlock all Pro templates</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value as "all" | TemplateCategory)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              activeCategory === value
                ? "border-rose-400 bg-rose-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"
            )}
          >
            {label}
            {value !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">
                ({TEMPLATES.filter((t) => t.category === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-500">No templates in this category yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <TemplateCard key={template.templateId} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
