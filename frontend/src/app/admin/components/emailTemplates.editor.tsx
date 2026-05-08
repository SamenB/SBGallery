"use client";

import { useState } from "react";
import { apiFetch, getApiUrl } from "@/utils";
import {
  emailTemplateInputClass as inp,
  type EmailTemplate,
} from "./emailTemplates.shared";

function TemplateEditor({
  template,
  onSaved,
}: {
  template: EmailTemplate;
  onSaved: (updated: EmailTemplate) => void;
}) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [isActive, setIsActive] = useState(template.is_active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty =
    subject !== template.subject ||
    body !== template.body ||
    isActive !== template.is_active;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(
        `${getApiUrl()}/email-templates/${template.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, body, is_active: isActive }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Save failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Active toggle */}
      <div className="flex items-center gap-3 p-3 bg-[#31323E]/3 rounded-lg">
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors flex-shrink-0 ${isActive ? "bg-emerald-500" : "bg-[#31323E]/20"}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-emerald-600" : "text-[#31323E]/40"}`}
          >
            {isActive ? "Active" : "Inactive"}
          </p>
          <p className="text-[11px] text-[#31323E]/40 font-medium">
            {isActive ? "Email will be sent on trigger" : "Email is suppressed"}
          </p>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#31323E]/50 mb-1.5">
          Subject Line
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inp}
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#31323E]/50 mb-1.5">
          Email Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className={`${inp} font-mono text-[12px] leading-relaxed`}
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Placeholders note */}
      {template.note && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-1.5">
            Available Placeholders
          </p>
          <p
            className="font-mono text-xs text-amber-800 leading-relaxed"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {template.note}
          </p>
        </div>
      )}

      {/* Save button */}
      {isDirty && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#31323E] text-white rounded-lg text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#434455] transition-colors shadow-sm"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
      {saved && !isDirty && (
        <p className="text-right text-xs font-bold text-emerald-600 tracking-wider">
          ✓ Saved successfully
        </p>
      )}
    </div>
  );
}

// ── Template Card ─────────────────────────────────────────────────────────────

export { TemplateEditor };
