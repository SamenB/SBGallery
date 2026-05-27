"use client";

import { useEffect } from "react";

import { reportClientError } from "@/components/ClientErrorReporter";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError({
      kind: "error",
      message: error.message || "Global client error",
      source: error.digest ? `next-digest:${error.digest}` : undefined,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] flex items-center justify-center px-6">
          <section className="max-w-md text-center">
            <h1 className="font-serif text-3xl text-[var(--color-accent)]">
              Something went wrong.
            </h1>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Please try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-none border border-[var(--color-border)] px-5 py-2 text-sm uppercase hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
