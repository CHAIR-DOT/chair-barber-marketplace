"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_STYLE_SELECTION,
  STYLE_SELECTION_STORAGE_KEY,
  isHairStyleId,
  parseStyleSelection,
  serializeStyleSelection,
  type StyleSelection,
} from "@/lib/style-selection";

type ContextValue = {
  selection: StyleSelection;
  setHairStyle: (id: string) => void;
  clearSelection: () => void;
};

const Context = createContext<ContextValue | null>(null);

export function StyleSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selection, setSelection] = useState<StyleSelection>({
    ...DEFAULT_STYLE_SELECTION,
  });
  const current = useRef(selection);
  const changedBeforeHydration = useRef(false);

  useEffect(() => {
    if (changedBeforeHydration.current) return;
    try {
      const saved = parseStyleSelection(
        sessionStorage.getItem(STYLE_SELECTION_STORAGE_KEY),
      );
      current.current = saved;
      setSelection(saved);
    } catch {
      // In-memory choices and the existing booking flow remain fully usable.
    }
  }, []);

  const update = useCallback((next: StyleSelection) => {
    changedBeforeHydration.current = true;
    current.current = next;
    setSelection(next);
    try {
      // Preserve the existing brief across discovery changes and navigation.
      sessionStorage.setItem(
        STYLE_SELECTION_STORAGE_KEY,
        serializeStyleSelection(next),
      );
    } catch {
      // Session storage is optional; the provider retains choices during navigation.
    }
  }, []);

  const setHairStyle = useCallback(
    (id: string) => {
      if (isHairStyleId(id)) update({ ...current.current, hairStyleId: id });
    },
    [update],
  );
  const clearSelection = useCallback(() => {
    update({ ...DEFAULT_STYLE_SELECTION });
  }, [update]);

  const value = useMemo(
    () => ({
      selection,
      setHairStyle,
      clearSelection,
    }),
    [selection, setHairStyle, clearSelection],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useStyleSelection() {
  const value = useContext(Context);
  if (!value)
    throw new Error(
      "useStyleSelection must be used inside StyleSelectionProvider",
    );
  return value;
}
