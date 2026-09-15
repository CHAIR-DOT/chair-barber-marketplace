"use client";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { ArrowLeft, Heart, Search, Star, X } from "lucide-react";
import { useMock } from "./provider";
import type { Favorite } from "@/lib/types";
export function Badge({
  children,
  tone = "",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Rating({
  value,
  count,
  showCount = true,
}: {
  value: number;
  count?: number;
  showCount?: boolean;
}) {
  return (
    <span className="rating">
      <Star size={14} fill="currentColor" />
      <strong>{value ? value.toFixed(1) : "New"}</strong>
      {showCount && count !== undefined && <span>({count})</span>}
    </span>
  );
}
export function FavoriteButton({
  type,
  id,
  label,
}: {
  type: Favorite["type"];
  id: string;
  label: string;
}) {
  const { favorite, isFavorite } = useMock();
  const saved = isFavorite(type, id);
  return (
    <button
      type="button"
      className={`icon-button favorite-button ${saved ? "saved" : ""}`}
      aria-label={`${saved ? "Unsave" : "Save"} ${label}`}
      aria-pressed={saved}
      onClick={() => favorite(type, id)}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
export function EmptyState({
  title,
  text,
  action,
  href,
  onAction,
}: {
  title: string;
  text: string;
  action?: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Search size={26} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action &&
        (href ? (
          <Link href={href} className="button button-dark">
            {action}
          </Link>
        ) : (
          <button className="button button-dark" onClick={onAction}>
            {action}
          </button>
        ))}
    </div>
  );
}
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-label="Loading">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
        dialog.close();
      };
    }
    dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h3 id={id}>{title}</h3>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>
          {title}
          <span className="accent">.</span>
        </h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function BackLink({
  href = "/discover",
  children = "Back to discovery",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link className="back-link" href={href}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
