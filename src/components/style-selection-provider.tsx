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
  isBeardStyleId,
  isHairStyleId,
  parseStyleSelection,
  serializeStyleSelection,
  type BeardStyleId,
  type StyleSelection,
} from "@/lib/style-selection";

type ContextValue = {
  selection: StyleSelection;
  setHairStyle: (id: string) => void;
  setBeardStyle: (id: BeardStyleId) => void;
  submitSelection: () => void;
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
      // Write synchronously before the CTA navigates, including normal form navigation.
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
  const setBeardStyle = useCallback(
    (id: BeardStyleId) => {
      if (isBeardStyleId(id)) update({ ...current.current, beardStyleId: id });
    },
    [update],
  );
  const submitSelection = useCallback(() => {
    update({ ...current.current, submitted: true });
  }, [update]);
  const clearSelection = useCallback(() => {
    update({ ...DEFAULT_STYLE_SELECTION });
  }, [update]);

  const value = useMemo(
    () => ({
      selection,
      setHairStyle,
      setBeardStyle,
      submitSelection,
      clearSelection,
    }),
    [selection, setHairStyle, setBeardStyle, submitSelection, clearSelection],
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
