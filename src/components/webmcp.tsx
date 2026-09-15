"use client";
import { useEffect, useRef } from "react";
import { shops, styles } from "@/lib/data";
import type { Favorite } from "@/lib/types";
import { useMock } from "./provider";
interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
}
interface ModelDocument extends Document {
  modelContext?: {
    registerTool: (
      tool: Tool,
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
}
// Progressive enhancement: ordinary browsers continue to use the same UI actions.
export function WebMcp() {
  const store = useMock(),
    latest = useRef(store);
  latest.current = store;
  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: Tool = {
      name: "set_saved_barber",
      description:
        "Save or unsave a fictional barber in this browser. Updates the same favorites as the heart buttons.",
      inputSchema: {
        type: "object",
        properties: {
          barberId: { type: "string" },
          saved: { type: "boolean" },
        },
        required: ["barberId", "saved"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!input || typeof input !== "object")
          throw new Error("Provide barberId and saved.");
        const value = input as Record<string, unknown>;
        if (
          typeof value.barberId !== "string" ||
          typeof value.saved !== "boolean" ||
          Object.keys(value).some((k) => !["barberId", "saved"].includes(k))
        )
          throw new Error("Invalid favorite input.");
        const id = value.barberId;
        if (!latest.current.state.barbers.some((b) => b.id === id))
          throw new Error("Unknown barber.");
        if (latest.current.isFavorite("barber", id) !== value.saved)
          latest.current.favorite("barber", id);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        return { barberId: id, saved: latest.current.isFavorite("barber", id) };
      },
    };
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* Optional browser integration; the UI remains fully available. */
    }
    return () => lifecycle.abort();
  }, []);
  return null;
}
