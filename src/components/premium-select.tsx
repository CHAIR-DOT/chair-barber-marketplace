"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import "./premium-filters.css";

export interface PremiumSelectOption {
  value: string;
  label: string;
}

/** A select-only combobox. Focus stays on its trigger while the list is open. */
export function PremiumSelect({
  label,
  value,
  options,
  onChange,
  name,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  options: PremiumSelectOption[];
  onChange: (value: string) => void;
  name?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState({
    above: false,
    height: 288,
    left: 0,
    edge: 0,
    width: 0,
  });
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  function show(index = Math.max(0, selectedIndex)) {
    if (!options.length) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // A fixed portal escapes scrolling/clipping ancestors. Keep it within
      // the visible viewport, including zoom and an on-screen keyboard.
      const viewport = window.visualViewport;
      const left = (viewport?.offsetLeft ?? 0) + 8;
      const top = (viewport?.offsetTop ?? 0) + 8;
      const right = left + (viewport?.width ?? window.innerWidth) - 16;
      const bottom = top + (viewport?.height ?? window.innerHeight) - 16;
      const below = bottom - rect.bottom - 7;
      const above = rect.top - top - 7;
      const useAbove = below < 224 && above > below;
      const width = Math.min(rect.width, Math.max(0, right - left));
      setPlacement({
        above: useAbove,
        height: Math.max(0, Math.min(288, useAbove ? above : below)),
        left: Math.max(left, Math.min(rect.left, right - width)),
        edge: useAbove ? window.innerHeight - rect.top + 7 : rect.bottom + 7,
        width,
      });
    }
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      )
        setOpen(false);
    }
    function close() {
      setOpen(false);
    }
    function onScroll(event: Event) {
      // Scrolling the options must stay usable; moving their trigger dismisses
      // the floating list instead of leaving it detached from the control.
      if (
        !(event.target instanceof Node) ||
        !listRef.current?.contains(event.target)
      )
        close();
    }
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    window.visualViewport?.addEventListener("resize", close);
    window.visualViewport?.addEventListener("scroll", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("resize", close);
      window.visualViewport?.removeEventListener("scroll", close);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    // Scroll only the options list, never the surrounding page or filter sheet.
    const list = listRef.current;
    const option = list?.children[active] as HTMLElement | undefined;
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    if (
      option.offsetTop + option.offsetHeight >
      list.scrollTop + list.clientHeight
    )
      list.scrollTop =
        option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) show();
      else
        setActive((current) =>
          Math.max(
            0,
            Math.min(
              options.length - 1,
              current + (event.key === "ArrowDown" ? 1 : -1),
            ),
          ),
        );
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : options.length - 1;
      if (!open) show(index);
      else setActive(index);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(active);
      else show();
      return;
    }
    if (
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault();
      const now = Date.now();
      const previous =
        now - searchRef.current.time < 700 ? searchRef.current.text : "";
      const text = (previous + event.key).toLocaleLowerCase();
      searchRef.current = { text, time: now };
      const repeated = [...text].every((character) => character === text[0]);
      const prefix = repeated ? text[0] : text;
      const start = repeated ? (open ? active : selectedIndex) + 1 : 0;
      const indices = options.map(
        (_, index) => (index + Math.max(0, start)) % options.length,
      );
      const match = indices.find((index) =>
        options[index].label.toLocaleLowerCase().startsWith(prefix),
      );
      if (match !== undefined) {
        if (!open) show(match);
        else setActive(match);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`premium-select ${open ? "is-open" : ""} ${className}`}
    >
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        className="premium-select-trigger"
        disabled={!options.length}
        onKeyDown={onKeyDown}
        onClick={() => (open ? setOpen(false) : show())}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        {icon && (
          <span className="premium-select-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="premium-select-copy">
          <span id={`${id}-label`} className="premium-select-label">
            {label}
          </span>
          <span id={`${id}-value`} className="premium-select-value">
            {selected?.label ?? value}
          </span>
        </span>
        <ChevronDown
          className="premium-select-chevron"
          size={15}
          aria-hidden="true"
        />
      </button>
      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={`${id}-options`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className="premium-select-options"
            style={{
              maxHeight: placement.height,
              width: placement.width,
              left: placement.left,
              top: placement.above ? undefined : placement.edge,
              bottom: placement.above ? placement.edge : undefined,
            }}
          >
            {options.map((option, index) => (
              <li
                id={`${id}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={active === index ? "is-active" : ""}
                onPointerMove={(event) => {
                  if (event.pointerType === "mouse") setActive(index);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check size={15} aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>,
          // Dialog descendants remain in the modal top layer and accessible;
          // portaling to body from a modal would make the options inert.
          rootRef.current?.closest("dialog") ?? document.body,
        )}
    </div>
  );
}
