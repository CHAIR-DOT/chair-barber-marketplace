"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/provider";
import { LanguageSelector } from "./language-selector";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Scissors, X } from "lucide-react";
import { useMock } from "./provider";
export function Navbar() {
  const { t } = useI18n();
  const path = usePathname(),
    { state } = useMock(),
    [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const accountHref = state.user
    ? state.user.role === "barber"
      ? "/barber/dashboard"
      : "/account"
    : "/login";
  const accountLabel = t(
    state.user ? "navigation.account" : "navigation.signIn",
  );
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 800px)");
    function onBreakpointChange(event: MediaQueryListEvent) {
      if (!event.matches && menuRef.current?.contains(document.activeElement))
        logoRef.current?.focus({ preventScroll: true });
      setOpen(false);
    }
    mobile.addEventListener("change", onBreakpointChange);
    return () => mobile.removeEventListener("change", onBreakpointChange);
  }, []);
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setOpen(false);
      toggleRef.current?.focus({ preventScroll: true });
    }
    function dismissOutside(event: PointerEvent | FocusEvent) {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [open]);
  const isActive = (href: string) =>
    path === href || path.startsWith(`${href}/`);
  const links = [
    [t("navigation.discover"), "/discover"],
    [t("navigation.shops"), "/shops"],
    [t("navigation.barbers"), "/barbers"],
    [t("navigation.how"), "/#how-it-works"],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        {t("navigation.skip")}
      </a>
      <div className="demo-strip">
        {t("navigation.preview")} <span>{t("navigation.fictional")} </span>
      </div>
      <header className="navbar" ref={headerRef}>
        <div className="container nav-inner">
          <Link
            ref={logoRef}
            href="/"
            className="logo"
            aria-label={t("navigation.home")}
            onClick={() => setOpen(false)}
          >
            CHAIR<span>.</span>
          </Link>
          <nav aria-label={t("navigation.main")}>
            {links.map(([name, href]) => (
              <Link
                className={isActive(href) ? "active" : ""}
                aria-current={isActive(href) ? "page" : undefined}
                key={href}
                href={href}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <LanguageSelector />
            <Link href={accountHref} onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
            <Link href="/register?role=barber" className="join-link">
              {t("navigation.forBarbers")} <ArrowUpRight size={13} />
            </Link>
            <Link
              href="/booking"
              className="button button-dark header-book"
              onClick={() => setOpen(false)}
            >
              {t("navigation.book")} <ArrowUpRight size={15} />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="icon-button mobile-menu-button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={t(
                open ? "navigation.closeMenu" : "navigation.openMenu",
              )}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            ref={menuRef}
            className="mobile-nav"
            id="mobile-nav"
            aria-label={t("navigation.mobile")}
          >
            <LanguageSelector mobile />
            {links.map(([name, href]) => (
              <Link
                key={href}
                href={href}
                className={isActive(href) ? "active" : ""}
                aria-current={isActive(href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {name}
              </Link>
            ))}
            <Link href={accountHref} onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
            <Link href="/register?role=barber" onClick={() => setOpen(false)}>
              {t("navigation.join")}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" href="/">
            CHAIR<span>.</span>
          </Link>
          <p>
            {t("footer.tagline1")}
            <br />
            {t("footer.tagline2")}
          </p>
          <span className="footer-city">
            {t("footer.city")} <span>41.7151° N · 44.8271° E</span>
          </span>
        </div>
        <div>
          <h4>{t("footer.find")} </h4>
          <Link href="/discover">{t("navigation.discover")} </Link>
          <Link href="/shops">{t("navigation.shops")} </Link>
          <Link href="/barbers">{t("navigation.barbers")} </Link>
          <Link href="/styles">{t("footer.styles")} </Link>
        </div>
        <div>
          <h4>{t("footer.yours")} </h4>
          <Link href="/account/appointments">{t("footer.appointments")} </Link>
          <Link href="/account/favorites">{t("footer.favorites")} </Link>
          <Link href="/register">{t("footer.create")} </Link>
          <Link href="/barber/dashboard">{t("footer.workspace")} </Link>
        </div>
        <div className="footer-signoff">
          <Scissors size={27} />
          <span>
            {t("footer.craft")}
            <br />
            {t("footer.connections")}
          </span>
          <Link href="/booking" className="text-link">
            {t("footer.nextCut")} <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          {t("footer.copyright", { year: String(new Date().getFullYear()) })}
        </span>
        <span>{t("footer.disclosure")}</span>
        <Link href="/about">{t("footer.about")} </Link>
      </div>
    </footer>
  );
}
