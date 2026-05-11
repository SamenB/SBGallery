"use client";

import { getImageUrl } from "@/utils";

import ImageCropperModal from "./ImageCropperModal";
import {
  FieldGroup,
  PhotoUploadSlot,
  SectionCard,
  settingsInputClass,
} from "./settingsTab.shared";
import { useSiteSettings } from "./useSiteSettings";

export default function SettingsTab() {
  const {
    settings,
    setSettings,
    loading,
    saving,
    saved,
    cropperOpen,
    setCropperOpen,
    cropperImageSrc,
    handleChange,
    handleFileUpload,
    handleHeroFileSelect,
    handleSaveCrops,
    handleSave,
  } = useSiteSettings();

  if (loading || !settings) {
    return (
      <div className="flex items-center gap-3 py-10">
        <div className="w-5 h-5 border-2 border-[#31323E]/20 border-t-[#31323E] rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#31323E]/50 uppercase tracking-wider">
          Loading settings...
        </span>
      </div>
    );
  }

  const hasHeroPhoto = Boolean(
    settings.main_bg_desktop_url || settings.main_bg_mobile_url,
  );

  return (
    <div className="space-y-8 max-w-3xl pb-12">
      <div className="flex justify-between items-start pb-6 border-b border-[#31323E]/8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#31323E] mb-1">
            Global Settings
          </h2>
          <p className="text-sm text-[#31323E]/50 font-medium">
            Core configuration, artist profile, and homepage appearance
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-[#31323E] text-white hover:bg-[#434455]"
          }`}
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save Settings"}
        </button>
      </div>

      <SectionCard
        title="Artist Profile"
        desc="Text and contact info used across the site"
      >
        <FieldGroup label="Homepage Artist Heading">
          <input
            type="text"
            name="artist_home_heading"
            value={settings.artist_home_heading || ""}
            onChange={handleChange}
            className={settingsInputClass}
            placeholder="The Artist"
          />
        </FieldGroup>
        <FieldGroup label="Homepage Artist Quote">
          <textarea
            name="artist_home_quote"
            value={settings.artist_home_quote || ""}
            onChange={handleChange}
            rows={3}
            className={`${settingsInputClass} resize-y leading-relaxed`}
            placeholder="I paint not what I see, but what I feel when I look."
          />
        </FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="About Page Eyebrow">
            <input
              type="text"
              name="about_page_eyebrow"
              value={settings.about_page_eyebrow || ""}
              onChange={handleChange}
              className={settingsInputClass}
              placeholder="About the Artist"
            />
          </FieldGroup>
          <FieldGroup label="About Page Main Title">
            <input
              type="text"
              name="about_page_title"
              value={settings.about_page_title || ""}
              onChange={handleChange}
              className={settingsInputClass}
              placeholder="A Dialogue with Canvas and Light"
            />
          </FieldGroup>
        </div>
        <FieldGroup label="About Section Title">
          <input
            type="text"
            name="about_section_title"
            value={settings.about_section_title || ""}
            onChange={handleChange}
            className={settingsInputClass}
            placeholder="The Journey"
          />
        </FieldGroup>
        <FieldGroup label="About the Artist">
          <textarea
            name="about_text"
            value={settings.about_text || ""}
            onChange={handleChange}
            rows={5}
            className={`${settingsInputClass} resize-y leading-relaxed`}
            placeholder="Enter short bio..."
          />
        </FieldGroup>
        <FieldGroup label="About Secondary Text">
          <textarea
            name="about_secondary_text"
            value={settings.about_secondary_text || ""}
            onChange={handleChange}
            rows={4}
            className={`${settingsInputClass} resize-y leading-relaxed`}
            placeholder="Optional second paragraph for the About page..."
          />
        </FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Philosophy Title">
            <input
              type="text"
              name="about_philosophy_title"
              value={settings.about_philosophy_title || ""}
              onChange={handleChange}
              className={settingsInputClass}
              placeholder="Philosophy"
            />
          </FieldGroup>
          <FieldGroup label="Exhibitions Title">
            <input
              type="text"
              name="about_exhibitions_title"
              value={settings.about_exhibitions_title || ""}
              onChange={handleChange}
              className={settingsInputClass}
              placeholder="Selected Exhibitions"
            />
          </FieldGroup>
        </div>
        <FieldGroup label="Philosophy Text">
          <textarea
            name="about_philosophy_text"
            value={settings.about_philosophy_text || ""}
            onChange={handleChange}
            rows={4}
            className={`${settingsInputClass} resize-y leading-relaxed`}
            placeholder="Artist philosophy shown on the About page..."
          />
        </FieldGroup>
        <FieldGroup label="Exhibitions Text">
          <textarea
            name="about_exhibitions_text"
            value={settings.about_exhibitions_text || ""}
            onChange={handleChange}
            rows={4}
            className={`${settingsInputClass} resize-y leading-relaxed`}
            placeholder={"One exhibition per line. Leave empty to hide the block."}
          />
        </FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Contact Email">
            <input
              type="email"
              name="contact_email"
              value={settings.contact_email || ""}
              onChange={handleChange}
              className={settingsInputClass}
              placeholder="artist@example.com"
            />
          </FieldGroup>
          <div className="md:col-span-2">
            <FieldGroup label="Studio Address">
              <textarea
                name="studio_address"
                value={settings.studio_address || ""}
                onChange={handleChange}
                rows={2}
                className={`${settingsInputClass} resize-none`}
                placeholder={"Kiev, Ukraine\nBy appointment only"}
              />
            </FieldGroup>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Artist Photos"
        desc="Appears on Homepage and About page"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhotoUploadSlot
            label="Homepage Photo"
            url={settings.artist_home_photo_url}
            onUpload={(event) =>
              handleFileUpload(event, "artist_home_photo_url")
            }
            onRemove={() =>
              setSettings((prev) =>
                prev ? { ...prev, artist_home_photo_url: null } : null,
              )
            }
          />
          <PhotoUploadSlot
            label="About Page Photo"
            url={settings.artist_about_photo_url}
            onUpload={(event) =>
              handleFileUpload(event, "artist_about_photo_url")
            }
            onRemove={() =>
              setSettings((prev) =>
                prev ? { ...prev, artist_about_photo_url: null } : null,
              )
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Homepage Hero Photo"
        desc="One static image for the homepage hero, cropped for desktop and mobile."
      >
        <div className="border border-[#31323E]/10 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-b border-[#31323E]/8">
            <span className="text-xs font-bold text-[#31323E] uppercase tracking-wider">
              Main hero image{!hasHeroPhoto ? " (Required)" : ""}
            </span>
            {hasHeroPhoto ? (
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          main_bg_desktop_url: null,
                          main_bg_mobile_url: null,
                        }
                      : null,
                  )
                }
                className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Remove
              </button>
            ) : null}
          </div>
          <div className="p-4">
            {hasHeroPhoto ? (
              <div className="flex gap-3 mb-4">
                <div className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#31323E]/40">
                    Desktop
                  </span>
                  {settings.main_bg_desktop_url ? (
                    <img
                      src={getImageUrl(settings.main_bg_desktop_url)}
                      alt=""
                      className="h-24 w-full object-cover rounded-lg border border-[#31323E]/10"
                    />
                  ) : (
                    <div className="h-24 w-full bg-[#31323E]/5 rounded-lg flex items-center justify-center text-[#31323E]/20 text-xs">
                      No desktop crop
                    </div>
                  )}
                </div>
                <div className="w-20 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#31323E]/40">
                    Mobile
                  </span>
                  {settings.main_bg_mobile_url ? (
                    <img
                      src={getImageUrl(settings.main_bg_mobile_url)}
                      alt=""
                      className="h-24 w-14 object-cover rounded-lg border border-[#31323E]/10"
                    />
                  ) : (
                    <div className="h-24 w-14 bg-[#31323E]/5 rounded-lg flex items-center justify-center text-[#31323E]/20 text-xs">
                      -
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-28 mb-4 border border-dashed border-[#31323E]/15 rounded-lg flex flex-col items-center justify-center text-[#31323E]/25 bg-[#31323E]/2">
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  No hero photo
                </span>
              </div>
            )}
            <label className="cursor-pointer flex items-center justify-center w-full bg-[#31323E] hover:bg-[#434455] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors shadow-sm">
              {hasHeroPhoto ? "Replace Photo" : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </SectionCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-colors shadow-md disabled:opacity-50 ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-[#31323E] text-white hover:bg-[#434455]"
        }`}
      >
        {saving
          ? "Saving Changes..."
          : saved
            ? "Settings Saved"
            : "Save All Settings"}
      </button>

      {cropperOpen ? (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          onClose={() => setCropperOpen(false)}
          onSaveCrops={handleSaveCrops}
        />
      ) : null}
    </div>
  );
}
