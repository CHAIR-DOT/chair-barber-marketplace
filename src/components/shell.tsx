"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Menu, Scissors, X } from "lucide-react";
import { useMock } from "./provider";
export function Navbar() {
  const path = usePathname(),
    { state } = useMock(),
    [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const links = [
    ["Discover", "/discover"],
    ["Barber shops", "/shops"],
    ["Barbers", "/barbers"],
    ["How it works", "/#how-it-works"],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="demo-strip">
        A local preview of a better hair day.{" "}
        <span>All profiles, ratings, and bookings are fictional.</span>
      </div>
      <header className="navbar">
        <div className="container nav-inner">
          <Link href="/" className="logo" aria-label="CHAIR home">
            CHAIR<span>.</span>
          </Link>
          <nav aria-label="Main navigation">
            {links.map(([name, href]) => (
              <Link
                className={path.startsWith(href) ? "active" : ""}
                key={href}
                href={href}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link
              href={
                state.user
                  ? state.user.role === "barber"
                    ? "/barber/dashboard"
                    : "/account"
                  : "/login"
              }
            >
              {state.user ? "My account" : "Sign in"}
            </Link>
            <Link href="/register?role=barber" className="join-link">
              For barbers <ArrowUpRight size={13} />
            </Link>
            <Link href="/booking" className="button button-dark header-book">
              Book a chair <ArrowUpRight size={15} />
            </Link>
            <button
              className="icon-button mobile-menu-button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            className="mobile-nav"
            id="mobile-nav"
            aria-label="Mobile navigation"
          >
            {links.map(([name, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {name}
              </Link>
            ))}
            <Link href="/account">My account</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/register?role=barber">Join as a barber</Link>
          </nav>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" href="/">
            CHAIR<span>.</span>
          </Link>
          <p>
            Find your barber.
            <br />
            Find your people.
          </p>
          <span className="footer-city">
            TBILISI, GEORGIA <span>41.7151° N · 44.8271° E</span>
          </span>
        </div>
        <div>
          <h4>Find your chair</h4>
          <Link href="/discover">Discover</Link>
          <Link href="/shops">Barber shops</Link>
          <Link href="/barbers">Barbers</Link>
          <Link href="/styles">Haircut styles</Link>
        </div>
        <div>
          <h4>Make it yours</h4>
          <Link href="/account/appointments">My appointments</Link>
          <Link href="/account/favorites">Saved favorites</Link>
          <Link href="/register">Create an account</Link>
          <Link href="/barber/dashboard">Barber workspace</Link>
        </div>
        <div className="footer-signoff">
          <Scissors size={27} />
          <span>
            GOOD CRAFT.
            <br />
            BETTER CONNECTIONS.
          </span>
          <Link href="/booking" className="text-link">
            Your next haircut <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CHAIR. · Local prototype</span>
        <span>
          Fictional profiles & statistics. Stock photographs are illustrative.
        </span>
        <Link href="/about">About this preview</Link>
      </div>
    </footer>
  );
}
