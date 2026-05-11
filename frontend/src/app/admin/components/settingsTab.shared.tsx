"use client";

import { getImageUrl } from "@/utils";

export interface SiteSettings {
  about_text: string | null;
  artist_home_heading: string | null;
  artist_home_quote: string | null;
  about_page_eyebrow: string | null;
  about_page_title: string | null;
  about_section_title: string | null;
  about_secondary_text: string | null;
  about_philosophy_title: string | null;
  about_philosophy_text: string | null;
  about_exhibitions_title: string | null;
  about_exhibitions_text: string | null;
  contact_email: string | null;
  artist_home_photo_url: string | null;
  artist_about_photo_url: string | null;
  main_bg_desktop_url: string | null;
  main_bg_mobile_url: string | null;
  studio_address: string | null;
}

export const settingsInputClass =
  "w-full bg-white border border-[#31323E]/15 rounded-lg px-4 py-3 text-sm font-medium text-[#31323E] focus:border-[#31323E]/50 focus:ring-2 focus:ring-[#31323E]/10 focus:outline-none placeholder-[#31323E]/30 transition-all shadow-sm";

export const settingsLabelClass = "block text-[10px] font-bold uppercase tracking-[0.18em] text-[#31323E]/50 mb-1.5";

export function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#31323E]/10 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#31323E]/8 bg-[#FAFAF9]">
        <h3 className="font-bold text-sm tracking-wide text-[#31323E]">{title}</h3>
        {desc ? <p className="text-xs text-[#31323E]/40 font-medium mt-0.5">{desc}</p> : null}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={settingsLabelClass}>{label}</label>
      {children}
    </div>
  );
}

export function PhotoUploadSlot({ label, url, onUpload, onRemove }: { label: string; url: string | null; onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void }) {
  return (
    <div>
      <label className={settingsLabelClass}>{label}</label>
      <div className="border border-dashed border-[#31323E]/20 rounded-xl p-4 text-center relative group transition-all hover:border-[#31323E]/40 bg-[#FAFAF9]">
        {url ? (
          <button type="button" onClick={onRemove} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-1 transition-all z-10 shadow-sm">
            Remove
          </button>
        ) : null}
        {url ? (
          <img src={getImageUrl(url)} alt={label} className="mx-auto mb-3 h-28 w-auto object-contain rounded-lg" />
        ) : (
          <div className="h-28 mb-3 flex flex-col items-center justify-center text-[#31323E]/30 rounded-lg">
            <span className="text-xs font-semibold uppercase tracking-wider">No image</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onUpload} className="text-[11px] font-medium text-[#31323E]/50 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#31323E] file:text-white hover:file:bg-[#434455] file:transition-colors file:uppercase file:tracking-wider cursor-pointer" />
      </div>
    </div>
  );
}
