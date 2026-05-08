"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiJson, getApiUrl } from "@/utils";
import type { SiteSettings } from "./settingsTab.shared";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState("");

  useEffect(() => {
    apiFetch(`${getApiUrl()}/settings`)
      .then((res) => apiJson<SiteSettings>(res))
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Settings load failed", error);
        setLoading(false);
      });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings((current) => (current ? { ...current, [event.target.name]: event.target.value } : current));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SiteSettings) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await apiFetch(`${getApiUrl()}/upload/image`, { method: "POST", body: formData });
      const data = await apiJson<{ url: string }>(response);
      setSettings((prev) => (prev ? { ...prev, [fieldName]: data.url } : null));
    } catch (error) {
      console.error("Upload error", error);
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleHeroFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCropperImageSrc(URL.createObjectURL(file));
      setCropperOpen(true);
    }
    event.target.value = "";
  };

  const handleSaveCrops = async (desktopBlob: Blob, mobileBlob: Blob) => {
    try {
      const desktopForm = new FormData();
      desktopForm.append("file", desktopBlob, "homepage_hero_desktop.webp");
      const desktopResponse = await apiFetch(`${getApiUrl()}/upload/image`, { method: "POST", body: desktopForm });
      const desktopData = await apiJson<{ url: string }>(desktopResponse);

      const mobileForm = new FormData();
      mobileForm.append("file", mobileBlob, "homepage_hero_mobile.webp");
      const mobileResponse = await apiFetch(`${getApiUrl()}/upload/image`, { method: "POST", body: mobileForm });
      const mobileData = await apiJson<{ url: string }>(mobileResponse);

      setSettings((prev) => (prev ? { ...prev, main_bg_desktop_url: desktopData.url, main_bg_mobile_url: mobileData.url } : null));
      setCropperOpen(false);
      URL.revokeObjectURL(cropperImageSrc);
      setCropperImageSrc("");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await apiFetch(`${getApiUrl()}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      await apiJson<SiteSettings>(response);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Save error", error);
      alert(error instanceof Error ? error.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
