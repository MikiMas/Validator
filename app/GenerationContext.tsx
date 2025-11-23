"use client";

import { createContext, useContext, useState } from "react";

export type GenerationStatus = "idle" | "processing" | "completed" | "error";

interface GenerationContextValue {
  status: GenerationStatus;
  setStatus: (status: GenerationStatus) => void;
  lastLandingSlug: string | null;
  setLastLandingSlug: (slug: string | null) => void;
  lastAdId: string | null;
  setLastAdId: (id: string | null) => void;
}

const GenerationContext = createContext<GenerationContextValue | undefined>(undefined);

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [lastLandingSlug, setLastLandingSlug] = useState<string | null>(null);
  const [lastAdId, setLastAdId] = useState<string | null>(null);

  return (
    <GenerationContext.Provider
      value={{ status, setStatus, lastLandingSlug, setLastLandingSlug, lastAdId, setLastAdId }}
    >
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const ctx = useContext(GenerationContext);
  if (!ctx) {
    throw new Error("useGeneration must be used within GenerationProvider");
  }
  return ctx;
}
