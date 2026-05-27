"use client";

import { useEffect } from "react";

import { getApiUrl } from "@/utils";

type ClientErrorPayload = {
  kind: "error" | "unhandledrejection";
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  url: string;
  path: string;
  user_agent: string;
};

type ErrorLike = {
  message?: unknown;
  stack?: unknown;
};

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SOURCE_LENGTH = 500;
const MAX_STACK_LENGTH = 6000;
const MAX_URL_LENGTH = 1000;
const DUPLICATE_WINDOW_MS = 1000;

let lastSignature = "";
let lastReportedAt = 0;

function trimText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const text = value.trim();
  if (!text) {
    return undefined;
  }
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function stringifyReason(reason: unknown): { message: string; stack?: string } {
  if (reason instanceof Error) {
    return {
      message: trimText(reason.message, MAX_MESSAGE_LENGTH) ?? reason.name,
      stack: trimText(reason.stack, MAX_STACK_LENGTH),
    };
  }

  if (typeof reason === "string") {
    return {
      message: trimText(reason, MAX_MESSAGE_LENGTH) ?? "Unhandled rejection",
    };
  }

  if (reason && typeof reason === "object") {
    const errorLike = reason as ErrorLike;
    const message = trimText(errorLike.message, MAX_MESSAGE_LENGTH);
    const stack = trimText(errorLike.stack, MAX_STACK_LENGTH);
    if (message || stack) {
      return { message: message ?? "Client error", stack };
    }
    try {
      return {
        message:
          trimText(JSON.stringify(reason), MAX_MESSAGE_LENGTH) ??
          "Unhandled rejection",
      };
    } catch {
      return { message: "Unhandled rejection" };
    }
  }

  return { message: String(reason ?? "Client error") };
}

function sendClientError(payload: ClientErrorPayload) {
  const endpoint = `${getApiUrl()}/client-errors`;
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) {
      return;
    }
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "include",
    keepalive: true,
  }).catch(() => {});
}

export function reportClientError(
  payload: Omit<ClientErrorPayload, "url" | "path" | "user_agent">,
) {
  const fullPayload: ClientErrorPayload = {
    ...payload,
    url: trimText(window.location.href, MAX_URL_LENGTH) ?? window.location.href,
    path:
      trimText(
        `${window.location.pathname}${window.location.search}`,
        MAX_SOURCE_LENGTH,
      ) ?? window.location.pathname,
    user_agent:
      trimText(navigator.userAgent, MAX_SOURCE_LENGTH) ?? navigator.userAgent,
  };
  const signature = `${fullPayload.kind}:${fullPayload.path}:${fullPayload.message}`;
  const now = Date.now();
  if (signature === lastSignature && now - lastReportedAt < DUPLICATE_WINDOW_MS) {
    return;
  }
  lastSignature = signature;
  lastReportedAt = now;
  sendClientError(fullPayload);
}

export default function ClientErrorReporter() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportClientError({
        kind: "error",
        message:
          trimText(event.message, MAX_MESSAGE_LENGTH) ??
          "Client-side error",
        source: trimText(event.filename, MAX_SOURCE_LENGTH),
        lineno: event.lineno || undefined,
        colno: event.colno || undefined,
        stack: trimText(event.error?.stack, MAX_STACK_LENGTH),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = stringifyReason(event.reason);
      reportClientError({
        kind: "unhandledrejection",
        message: reason.message,
        stack: reason.stack,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
