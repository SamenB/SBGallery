"use client";

import { useState, useEffect } from "react";
import { getApiUrl, apiFetch } from "@/utils";
import {
  EVENT_GROUP_LABELS,
  type EmailTemplate,
} from "./emailTemplates.shared";
import { TemplateCard } from "./emailTemplates.card";

export default function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${getApiUrl()}/email-templates`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTemplates(data))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdated = (updated: EmailTemplate) =>
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );

  const groups = Object.entries(
    templates.reduce<Record<string, EmailTemplate[]>>((acc, tpl) => {
      const group = tpl.trigger_event.split(".")[0];
      if (!acc[group]) acc[group] = [];
      acc[group].push(tpl);
      return acc;
    }, {}),
  );

  const activeCount = templates.filter((t) => t.is_active).length;
  const inactiveCount = templates.filter((t) => !t.is_active).length;

  if (loading)
    return (
      <div className="flex items-center gap-3 py-10">
        <div className="w-5 h-5 border-2 border-[#31323E]/20 border-t-[#31323E] rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#31323E]/50 uppercase tracking-wider">
          Loading email templates…
        </span>
      </div>
    );

  return (
    <div className="text-[#31323E]">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#31323E]/8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#31323E] mb-1">
            Email Templates
          </h2>
          <p className="text-sm text-[#31323E]/50 font-medium">
            Edit automated emails — changes apply immediately without deployment
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-bold text-emerald-600 leading-none">
              {activeCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 mt-1">
              Active
            </div>
          </div>
          <div className="bg-[#31323E]/5 border border-[#31323E]/10 rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-bold text-[#31323E]/40 leading-none">
              {inactiveCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#31323E]/30 mt-1">
              Inactive
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {groups.map(([group, groupTemplates]) => {
          const meta = EVENT_GROUP_LABELS[group];
          return (
            <div key={group}>
              {/* Group Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold tracking-tight text-[#31323E]">
                    {meta?.label || group}
                  </h3>
                  <div className="flex-1 h-px bg-[#31323E]/8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#31323E]/35">
                    {groupTemplates.length} template
                    {groupTemplates.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {meta?.desc && (
                  <p className="text-xs text-[#31323E]/40 font-medium ml-0">
                    {meta.desc}
                  </p>
                )}
              </div>

              {/* Template cards */}
              <div className="space-y-2">
                {groupTemplates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
