"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  MapPin,
  Scissors,
} from "lucide-react";
import { shops, styles } from "@/lib/data";
import { getPrice, nextAvailable, ratingFor } from "@/lib/booking";
import { money, relativeDate } from "@/lib/dates";
import { useMock } from "./provider";
import { BackLink, Badge, FavoriteButton, Rating } from "./ui";
import { BarberCard } from "./cards";
import { PortfolioGallery } from "./portfolio";
import { ReviewsSection } from "./reviews";
export function ServiceList({
  barberId,
  shopId,
}: {
  barberId?: string;
  shopId: string;
}) {
  const { state } = useMock(),
    team = state.barbers.filter((b) => b.shopId === shopId),
    barber = state.barbers.find((b) => b.id === barberId),
    services = state.services.filter((s) =>
      barber
        ? barber.serviceIds.includes(s.id)
        : team.some((b) => b.serviceIds.includes(s.id)),
    );
  return (
    <div className="service-list">
      {services.map((s) => {
        const price = barber
          ? getPrice(barber, s.id, state)
          : Math.min(
              ...team
                .filter((b) => b.serviceIds.includes(s.id))
                .map((b) => getPrice(b, s.id, state)),
            );
        return (
          <div className="service-row" key={s.id}>
            <div className="service-icon">
              <Scissors size={20} />
            </div>
            <div className="service-description">
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <span>
                <Clock3 size={12} />
                {s.duration} min
              </span>
            </div>
            <div className="service-price">
              <strong>
                {!barber && <small>from</small>}
                {money(price)}
              </strong>
              <Link
                href={`/booking?shop=${shopId}${barberId ? `&barber=${barberId}` : ""}&service=${s.id}`}
                className="button button-outline"
              >
                Book
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function BookingPanel({
  barberId,
  shopId,
}: {
  barberId?: string;
  shopId: string;
}) {
  const { state } = useMock(),
    barber =
      state.barbers.find((b) => b.id === barberId) ??
      state.barbers.find((b) => b.shopId === shopId)!,
    [serviceId, setService] = useState("haircut"),
    service = state.services.find((s) => s.id === serviceId)!,
    next = nextAvailable(state, barber.id, serviceId);
  return (
    <aside className="booking-panel">
      <div className="eyebrow">A LITTLE TIME FOR YOURSELF</div>
      <h3>Make the chair yours.</h3>
      <p>A good cut. A fresh perspective.</p>
      <label className="field">
        Your service
        <select value={serviceId} onChange={(e) => setService(e.target.value)}>
          {state.services
            .filter((s) => barber.serviceIds.includes(s.id))
            .map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
        </select>
      </label>
      <div className="booking-panel-price">
        <strong>{money(getPrice(barber, serviceId, state))}</strong>
        <span>
          {service.duration} min{" "}
          {barberId ? "" : "· with " + barber.name.split(" ")[0]}
        </span>
      </div>
      <div className="next-availability">
        <Clock3 size={17} />
        <div>
          <span>Next available</span>
          <strong>
            {next
              ? `${relativeDate(next.date)} at ${next.time}`
              : "Check another service"}
          </strong>
        </div>
      </div>
      <Link
        className="button button-dark button-full"
        href={`/booking?shop=${shopId}${barberId ? `&barber=${barberId}` : ""}&service=${serviceId}`}
      >
        Book an appointment <ArrowUpRight size={16} />
      </Link>
      <div className="booking-reassurance">
        <span>
          <Check size={13} />
          Clear prices, before you book
        </span>
        <span>
          <Check size={13} />
          No payment needed for this preview
        </span>
      </div>
      <p className="cancellation-policy">
        Plans change. You can cancel or reschedule your demo appointment in your
        account.
      </p>
    </aside>
  );
}
export function BarberProfile({ id }: { id: string }) {
  const { state, compare, toggleCompare } = useMock(),
    barber = state.barbers.find((b) => b.id === id)!,
    shop = shops.find((s) => s.id === barber.shopId)!,
    reviews = state.reviews.filter((r) => r.barberId === id),
    rating = ratingFor(id, state.reviews),
    portfolio = state.portfolio.filter((p) => p.barberId === id);
  return (
    <div className="container page-section">
      <BackLink href="/barbers">Meet the barbers</BackLink>
      <div className="barber-profile-hero">
        <div className="profile-portrait">
          <img
            src={barber.image}
            alt={`${barber.name}, illustrative portrait`}
          />
        </div>
        <div className="profile-identity">
          <div className="inline-actions">
            <Badge tone="copper">{barber.role}</Badge>
            {barber.verified && (
              <Badge tone="green">
                <BadgeCheck size={12} />
                Verified barber · demo
              </Badge>
            )}
          </div>
          <h1>
            {barber.name.split(" ")[0]}
            <br />
            {barber.name.split(" ").slice(1).join(" ")}
            <span className="accent">.</span>
          </h1>
          <Link href={`/shops/${shop.slug}`} className="profile-shop">
            <MapPin size={15} />
            {shop.name} · {shop.neighborhood}
            <ArrowUpRight size={14} />
          </Link>
          <div className="profile-stats">
            <Rating value={rating.value} count={rating.count} />
            <span>{barber.experience} years experience</span>
            <span>
              {barber.completedCuts.toLocaleString("en-GB")} sample cuts
            </span>
          </div>
          <div className="tags">
            {barber.styleIds.map((id) => (
              <Link href={`/styles/${id}`} className="tag" key={id}>
                {styles.find((s) => s.id === id)?.name}
              </Link>
            ))}
          </div>
          <div className="profile-intro">“{barber.bio.split(". ")[0]}.”</div>
        </div>
        <div className="profile-tools">
          <div className="relative">
            <FavoriteButton type="barber" id={barber.id} label={barber.name} />
          </div>
          <button
            className="button button-outline"
            onClick={() => toggleCompare(id)}
          >
            {compare.includes(id) ? "Added to compare" : "Compare barber"}
          </button>
        </div>
      </div>
      <div className="profile-layout">
        <div>
          <nav className="profile-tabs" aria-label="Barber profile sections">
            <a href="#portfolio">The work</a>
            <a href="#services">Services</a>
            <a href="#about">Meet {barber.name.split(" ")[0]}</a>
            <a href="#reviews">Reviews ({reviews.length})</a>
          </nav>
          <section className="profile-section" id="portfolio">
            <div className="section-heading">
              <div>
                <div className="eyebrow">LET THE WORK DO THE TALKING</div>
                <h2>A cut above.</h2>
              </div>
              <Badge>{portfolio.length} looks</Badge>
            </div>
            <PortfolioGallery
              key={id}
              items={portfolio}
              barberName={barber.name}
            />
          </section>
          <section className="profile-section" id="services">
            <div className="section-heading">
              <div>
                <div className="eyebrow">THE MENU</div>
                <h2>Good grooming, considered.</h2>
              </div>
            </div>
            <ServiceList barberId={id} shopId={shop.id} />
          </section>
          <section className="profile-section" id="about">
            <div className="eyebrow">THE PERSON BEHIND THE SCISSORS</div>
            <h2>Meet {barber.name.split(" ")[0]}.</h2>
            <p className="bio-copy">{barber.bio}</p>
            <div className="about-shop">
              <img src={shop.image} alt={shop.name} />
              <div>
                <span className="eyebrow">FIND ME AT</span>
                <h3>{shop.name}</h3>
                <p>
                  {shop.address}, {shop.neighborhood}
                </p>
                <Link className="text-link" href={`/shops/${shop.slug}`}>
                  Explore the shop <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </section>
          <ReviewsSection reviews={reviews} />
        </div>
        <BookingPanel key={id} barberId={id} shopId={shop.id} />
      </div>
      <div className="mobile-booking-bar">
        <div>
          <strong>From {money(getPrice(barber, "haircut", state))}</strong>
          <span>With {barber.name.split(" ")[0]}</span>
        </div>
        <Link
          href={`/booking?shop=${shop.id}&barber=${id}`}
          className="button button-dark"
        >
          Book your chair <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
export function ShopProfile({ id }: { id: string }) {
  const { state } = useMock(),
    shop = shops.find((s) => s.id === id)!,
    team = state.barbers.filter((b) => b.shopId === id),
    reviews = state.reviews.filter((r) =>
      team.some((b) => b.id === r.barberId),
    ),
    rating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  return (
    <div className="container page-section">
      <BackLink href="/shops">All barber shops</BackLink>
      <div className="shop-cover">
        <img src={shop.image} alt={`${shop.name} — illustrative interior`} />
        <div className="shop-cover-label">
          <span className="eyebrow">YOUR NEIGHBORHOOD. YOUR CHAIR.</span>
          <h1>
            {shop.name}
            <span className="accent">.</span>
          </h1>
          <span>
            <MapPin size={16} />
            {shop.neighborhood}, Tbilisi
          </span>
        </div>
        <FavoriteButton type="shop" id={id} label={shop.name} />
      </div>
      <div className="shop-summary">
        <Rating value={rating} count={reviews.length} />
        <span>{shop.address}</span>
        <span>
          <Clock3 size={15} />
          {shop.closedDays.includes(1) ? "Tue–Sat" : "Mon–Sat"},{" "}
          {shop.openingTime}–{shop.closingTime}
        </span>
      </div>
      <div className="profile-layout">
        <div>
          <nav className="profile-tabs" aria-label="Shop sections">
            <a href="#about">The space</a>
            <a href="#team">The people</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
          </nav>
          <section className="profile-section" id="about">
            <div className="eyebrow">MORE THAN A HAIRCUT</div>
            <h2>A place to feel like yourself.</h2>
            <p className="bio-copy">{shop.description}</p>
            <div className="shop-gallery">
              {shop.gallery.map((image, i) => (
                <img
                  src={image}
                  alt={`${shop.name} atmosphere, illustrative photo ${i + 1}`}
                  key={image}
                />
              ))}
            </div>
            <p className="gallery-disclaimer">
              Interior photography is illustrative. This shop is a fictional
              local listing.
            </p>
          </section>
          <section className="profile-section" id="team">
            <div className="section-heading">
              <div>
                <div className="eyebrow">GOOD PEOPLE. SERIOUS CRAFT.</div>
                <h2>Your next regular.</h2>
              </div>
              <Badge>{team.length} barbers</Badge>
            </div>
            <div className="profile-team-grid">
              {team.map((b) => (
                <BarberCard barber={b} key={b.id} />
              ))}
            </div>
          </section>
          <section className="profile-section" id="services">
            <div className="eyebrow">THE MENU</div>
            <h2>Take your pick.</h2>
            <ServiceList shopId={id} />
          </section>
          <ReviewsSection reviews={reviews} />
        </div>
        <BookingPanel key={id} shopId={id} />
      </div>
      <div className="mobile-booking-bar">
        <div>
          <strong>{shop.name}</strong>
          <span>Find your next good hair day.</span>
        </div>
        <Link href={`/booking?shop=${id}`} className="button button-dark">
          Book a chair
        </Link>
      </div>
    </div>
  );
}
