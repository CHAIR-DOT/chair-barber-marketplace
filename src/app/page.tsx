"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  MapPin,
  Scissors,
  Search,
  Star,
} from "lucide-react";
import { shops, styles } from "@/lib/data";
import { today } from "@/lib/dates";
import { useMock } from "@/components/provider";
import { BarberCard, ShopCard, StyleCard } from "@/components/cards";
export default function Home() {
  const { state } = useMock();
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="small-line" /> GOOD HAIR. GOOD COMPANY.
          </div>
          <h1>
            Find the barber
            <br />
            who gets <em>your style.</em>
          </h1>
          <p>
            Great hair starts with the right person. Discover Tbilisi’s talented
            barbers, explore their work, and make the chair yours.
          </p>
          <div className="hero-proof">
            <div className="avatar-stack">
              {state.barbers.slice(0, 3).map((b) => (
                <img src={b.image} alt="" key={b.id} />
              ))}
            </div>
            <div>
              <span className="proof-stars">★★★★★</span>
              <span>A good connection. An even better cut.</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/hero.jpg"
            alt="A barber carefully finishing a customer's beard"
            fetchPriority="high"
          />
          <span className="image-caption">CRAFT. CHARACTER. CONNECTION.</span>
          <div className="hero-note">
            <Scissors size={18} />
            <div>
              <strong>Your next good hair day.</strong>
              <span>It starts in the right chair.</span>
            </div>
            <ArrowUpRight size={20} />
          </div>
        </div>
        <form action="/discover" className="hero-search">
          <label>
            <MapPin size={20} />
            <span>
              <small>WHERE</small>
              <select name="location" aria-label="Location">
                <option value="">Tbilisi, Georgia</option>
                <option>Vake</option>
                <option>Vera</option>
                <option>Saburtalo</option>
                <option>Old Tbilisi</option>
              </select>
            </span>
          </label>
          <label>
            <Scissors size={20} />
            <span>
              <small>WHAT</small>
              <select name="service" aria-label="Service">
                <option value="">Any service</option>
                <option value="haircut">Haircut</option>
                <option value="skin-fade">Skin fade</option>
                <option value="haircut-beard">Haircut & beard</option>
              </select>
            </span>
          </label>
          <label className="search-date">
            <CalendarDays size={20} />
            <span>
              <small>WHEN</small>
              <input
                type="date"
                name="date"
                min={today()}
                aria-label="Appointment date"
              />
            </span>
          </label>
          <button className="button button-dark">
            <Search size={18} /> Find a barber
          </button>
        </form>
      </section>
      <div className="container quick-discovery">
        <span>A little inspiration?</span>
        {[
          ["Skin fades", "skin-fade"],
          ["Beard styling", "beard-styles"],
          ["Classic cuts", "classic-scissor-cut"],
        ].map(([name, id]) => (
          <Link href={`/styles/${id}`} key={id}>
            {name}
            <ArrowUpRight size={12} />
          </Link>
        ))}
        <Link href="/discover?availability=today" className="available-quick">
          <span />
          Available today
        </Link>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE NEIGHBORHOOD EDIT</span>
            <h2>
              Popular near you<span className="accent">.</span>
            </h2>
            <p>Good spaces. Great people. Your new regular.</p>
          </div>
          <Link href="/shops" className="text-link">
            Explore all shops <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="shop-grid">
          {shops.slice(0, 3).map((s) => (
            <ShopCard shop={s} key={s.id} />
          ))}
        </div>
      </section>
      <section className="style-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR LOOK</span>
              <h2>
                A style that feels like you<span className="accent">.</span>
              </h2>
              <p>See the cut. Find the person who can make it yours.</p>
            </div>
            <Link href="/styles" className="text-link">
              Browse by style <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="style-grid">
            {[
              styles[0],
              styles[3],
              styles[6],
              styles[8],
              styles[9],
              styles[11],
            ].map((s) => (
              <StyleCard style={s} key={s.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="container section top-barbers">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PEOPLE BEHIND THE CRAFT</span>
            <h2>
              Top barbers. Your next regular<span className="accent">.</span>
            </h2>
            <p>
              Independent style. Personal attention. Work that speaks for
              itself.
            </p>
          </div>
          <Link href="/barbers" className="text-link">
            Meet all barbers <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="barber-grid">
          {[
            state.barbers[0],
            state.barbers[2],
            state.barbers[4],
            state.barbers[6],
          ].map((b) => (
            <BarberCard barber={b} key={b.id} />
          ))}
        </div>
      </section>
      <section className="how-section container" id="how-it-works">
        <div className="how-intro">
          <div className="eyebrow">LESS GUESSWORK. MORE YOU.</div>
          <h2>
            Your next great cut,
            <br />
            <em>in a few simple steps.</em>
          </h2>
          <Link href="/discover" className="button button-dark">
            Find your chair <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="how-steps">
          {[
            [
              "01",
              "Find your person",
              "Explore portfolios, compare specialties, and find a barber who speaks your style.",
            ],
            [
              "02",
              "Make it a date",
              "Choose a service and a time that works for you. Clear prices, before you book.",
            ],
            [
              "03",
              "Make yourself at home",
              "Take a seat. Get a great cut. Share your experience and save your new regular.",
            ],
          ].map(([n, title, text]) => (
            <div key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="barber-invite container">
        <div>
          <span className="eyebrow">YOUR CRAFT DESERVES AN AUDIENCE</span>
          <h2>
            Great with a pair of scissors?
            <br />
            Let’s find your people.
          </h2>
        </div>
        <Link href="/register?role=barber" className="button button-light">
          Join as a barber <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
