"use client";

import { useState } from "react";
import { TEMPLATE_META, type EmailTemplate } from "./emailTemplates.shared";
import { TemplateEditor } from "./emailTemplates.editor";

const TRIGGER_BY_STYLE = {
  auto: {
    label: "Auto",
    cls: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  admin: {
    label: "Admin",
    cls: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  customer: {
    label: "Customer",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

function TemplateCard({
  template,
  onUpdated,
}: {
  template: EmailTemplate;
  onUpdated: (t: EmailTemplate) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCustomer = template.send_to_customer;
  const meta = TEMPLATE_META[template.key];
  const isSilent = meta?.infoTags?.some((t) =>
    t.toLowerCase().includes("silent"),
  );

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${expanded ? "border-[#31323E]/20 shadow-md" : "border-[#31323E]/10 hover:border-[#31323E]/20"} ${!template.is_active && !isSilent ? "opacity-60" : ""}`}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left bg-white hover:bg-[#31323E]/2 transition-colors"
      >
        {/* Active / Silent indicator */}
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isSilent
              ? "bg-[#31323E]/15"
              : template.is_active
                ? "bg-emerald-500 shadow-sm shadow-emerald-400/50"
                : "bg-[#31323E]/20"
          }`}
        />

        {/* Key badge */}
        <code className="text-[10px] font-bold text-[#31323E] bg-[#31323E]/8 px-2.5 py-1 rounded-md flex-shrink-0 tracking-wide">
          {template.key}
        </code>

        {/* Subject preview */}
        <span
          className={`text-sm font-medium truncate flex-1 ${isSilent ? "text-[#31323E]/35 line-through" : "text-[#31323E]/70"}`}
        >
          {isSilent ? "[ No email sent — internal step ]" : template.subject}
        </span>

        {/* Recipient badge */}
        <span
          className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            isCustomer
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-purple-50 text-purple-600 border border-purple-100"
          }`}
        >
          {isCustomer ? "→ Customer" : "→ Admin"}
        </span>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#31323E]/30 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#31323E]/8 bg-[#FAFAF9]">
          {/* ── Trigger metadata block ───────────────────────── */}
          {meta && (
            <div className="mt-4 mb-5 space-y-3">
              {/* Silent warning — prominent orange banner */}
              {meta.warning && (
                <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5">
                  <span className="text-orange-500 text-lg flex-shrink-0 mt-0.5">
                    ⚠️
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-700 mb-1">
                      Email Suppressed — Silent Status
                    </p>
                    <p className="text-xs text-orange-800 font-medium leading-relaxed">
                      {meta.warning}
                    </p>
                  </div>
                </div>
              )}

              {/* Trigger description card */}
              <div className="bg-white border border-[#31323E]/10 rounded-xl p-4 space-y-3">
                {/* Who triggers it */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${TRIGGER_BY_STYLE[meta.triggeredBy].cls}`}
                    >
                      {TRIGGER_BY_STYLE[meta.triggeredBy].label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#31323E]/40 mb-0.5">
                      Triggered by
                    </p>
                    <p className="text-xs font-semibold text-[#31323E]/70">
                      {meta.triggerLabel}
                    </p>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-[#31323E]/6" />

                {/* When does it fire */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#31323E]/40 mb-1.5">
                    When this email fires
                  </p>
                  <p className="text-xs text-[#31323E]/70 font-medium leading-relaxed">
                    {meta.triggerDesc}
                  </p>
                </div>

                {/* Info tags */}
                {meta.infoTags && meta.infoTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meta.infoTags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          tag.toLowerCase().includes("silent") ||
                          tag.toLowerCase().includes("no email")
                            ? "bg-orange-50 text-orange-600 border-orange-200"
                            : tag.toLowerCase().includes("auto")
                              ? "bg-violet-50 text-violet-600 border-violet-200"
                              : tag.toLowerCase().includes("admin")
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-[#31323E]/5 text-[#31323E]/50 border-[#31323E]/10"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Technical trigger key */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#31323E]/30">
                  Backend key:
                </span>
                <code className="text-[11px] font-bold text-[#31323E]/50 bg-white px-2 py-0.5 rounded-lg border border-[#31323E]/10">
                  {template.trigger_event}
                </code>
              </div>
            </div>
          )}

          {/* ── Editor (hidden for silent templates) ──────────── */}
          {isSilent ? (
            <div className="py-4 text-center border border-dashed border-[#31323E]/10 rounded-xl bg-white">
              <p className="text-sm text-[#31323E]/30 font-medium">
                No editor — this template is never sent to customers.
              </p>
            </div>
          ) : (
            <TemplateEditor template={template} onSaved={onUpdated} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export { TemplateCard };
