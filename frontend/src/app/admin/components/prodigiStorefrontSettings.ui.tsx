import type { ReactNode } from "react";

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#F7F7F5] px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#31323E]/38">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-bold text-[#31323E]">
        {value}
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#31323E]/38">
        {label}
      </span>
      {children}
    </label>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#31323E]/38">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        spellCheck={false}
        className="w-full resize-y rounded-md border border-[#31323E]/15 bg-[#FAFAF8] px-3 py-2 font-mono text-xs leading-relaxed text-[#31323E]"
      />
    </label>
  );
}

export { StatusMetric, FieldLabel, JsonField };
