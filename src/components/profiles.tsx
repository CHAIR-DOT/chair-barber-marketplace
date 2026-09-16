"use client";
import { publicPath } from "@/lib/public-path";
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
import { useI18n } from "@/i18n/provider";
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
  const { t, money, serviceName, serviceDescription } = useI18n();
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
              <h3>{serviceName(s)}</h3>
              <p>{serviceDescription(s)}</p>
              <span>
                <Clock3 size={12} />
                {t("profiles.minutes", { count: s.duration })}
              </span>
            </div>
            <div className="service-price">
              <strong>
                {!barber && <small>{t("profiles.from")}</small>}
                {money(price)}
              </strong>
              <Link
                href={`/booking?shop=${shopId}${barberId ? `&barber=${barberId}` : ""}&service=${s.id}`}
                className="button button-outline"
              >
                {t("profiles.book")}
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
  const { t, money, relativeDate, serviceName } = useI18n();
  const { state } = useMock(),
    barber =
      state.barbers.find((b) => b.id === barberId) ??
      state.barbers.find((b) => b.shopId === shopId)!,
    [serviceId, setService] = useState("haircut"),
    service = state.services.find((s) => s.id === serviceId)!,
    next = nextAvailable(state, barber.id, serviceId);
  return (
    <aside className="booking-panel">
      <div className="eyebrow">{t("profiles.bookingEyebrow")}</div>
      <h3>{t("profiles.bookingTitle")}</h3>
      <p>{t("profiles.bookingDescription")}</p>
      <label className="field">
        {t("profiles.yourService")}
        <select value={serviceId} onChange={(e) => setService(e.target.value)}>
          {state.services
            .filter((s) => barber.serviceIds.includes(s.id))
            .map((s) => (
              <option value={s.id} key={s.id}>
                {serviceName(s)}
              </option>
            ))}
        </select>
      </label>
      <div className="booking-panel-price">
        <strong>{money(getPrice(barber, serviceId, state))}</strong>
        <span>
          {t("profiles.minutes", { count: service.duration })}{" "}
          {!barberId &&
            t("profiles.withBarber", { name: barber.name.split(" ")[0] })}
        </span>
      </div>
      <div className="next-availability">
        <Clock3 size={17} />
        <div>
          <span>{t("profiles.nextAvailable")}</span>
          <strong>
            {next
              ? t("profiles.dateTime", {
                  date: relativeDate(next.date),
                  time: next.time,
                })
              : t("profiles.checkService")}
          </strong>
        </div>
      </div>
      <Link
        className="button button-dark button-full"
        href={`/booking?shop=${shopId}${barberId ? `&barber=${barberId}` : ""}&service=${serviceId}`}
      >
        {t("profiles.bookAppointment")} <ArrowUpRight size={16} />
      </Link>
      <div className="booking-reassurance">
        <span>
          <Check size={13} />
          {t("profiles.clearPrices")}
        </span>
        <span>
          <Check size={13} />
          {t("profiles.noPayment")}
        </span>
      </div>
      <p className="cancellation-policy">{t("profiles.cancellationPolicy")}</p>
    </aside>
  );
}
export function BarberProfile({ id }: { id: string }) {
  const { t, money, label, styleName, barberTitle, barberBio } = useI18n();
  const { state, compare, toggleCompare } = useMock(),
    barber = state.barbers.find((b) => b.id === id)!,
    shop = shops.find((s) => s.id === barber.shopId)!,
    reviews = state.reviews.filter((r) => r.barberId === id),
    rating = ratingFor(id, state.reviews),
    portfolio = state.portfolio.filter((p) => p.barberId === id);
  return (
    <div className="container page-section">
      <BackLink href="/barbers">{t("profiles.allBarbers")}</BackLink>
      <div className="barber-profile-hero">
        <div className="profile-portrait">
          <img
            src={publicPath(barber.image)}
            alt={t("profiles.barberPortrait", { name: barber.name })}
          />
        </div>
        <div className="profile-identity">
          <div className="inline-actions">
            <Badge tone="copper">{barberTitle(barber)}</Badge>
            {barber.verified && (
              <Badge tone="green">
                <BadgeCheck size={12} />
                {t("profiles.verifiedBarber")}
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
            {shop.name} · {label(shop.neighborhood)}
            <ArrowUpRight size={14} />
          </Link>
          <div className="profile-stats">
            <Rating value={rating.value} count={rating.count} />
            <span>
              {t("profiles.experience", { count: barber.experience })}
            </span>
            <span>
              {t("profiles.sampleCuts", {
                count: barber.completedCuts,
              })}
            </span>
          </div>
          <div className="tags">
            {barber.styleIds.map((id) => (
              <Link href={`/styles/${id}`} className="tag" key={id}>
                {(() => {
                  const style = styles.find((s) => s.id === id);
                  return style ? styleName(style) : "";
                })()}
              </Link>
            ))}
          </div>
          <div className="profile-intro">
            “{barberBio(barber).split(". ")[0]}.”
          </div>
        </div>
        <div className="profile-tools">
          <div className="relative">
            <FavoriteButton type="barber" id={barber.id} label={barber.name} />
          </div>
          <button
            className="button button-outline"
            onClick={() => toggleCompare(id)}
          >
            {compare.includes(id)
              ? t("profiles.addedCompare")
              : t("profiles.compareBarber")}
          </button>
        </div>
      </div>
      <div className="profile-layout">
        <div>
          <nav
            className="profile-tabs"
            aria-label={t("profiles.barberSections")}
          >
            <a href="#portfolio">{t("profiles.portfolio")}</a>
            <a href="#services">{t("profiles.services")}</a>
            <a href="#about">
              {t("profiles.meet", { name: barber.name.split(" ")[0] })}
            </a>
            <a href="#reviews">
              {t("profiles.reviewsCount", { count: reviews.length })}
            </a>
          </nav>
          <section className="profile-section" id="portfolio">
            <div className="section-heading">
              <div>
                <div className="eyebrow">{t("profiles.portfolioEyebrow")}</div>
                <h2>{t("profiles.portfolioTitle")}</h2>
              </div>
              <Badge>{t("profiles.looks", { count: portfolio.length })}</Badge>
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
                <div className="eyebrow">{t("profiles.menu")}</div>
                <h2>{t("profiles.servicesTitle")}</h2>
              </div>
            </div>
            <ServiceList barberId={id} shopId={shop.id} />
          </section>
          <section className="profile-section" id="about">
            <div className="eyebrow">{t("profiles.aboutBarberEyebrow")}</div>
            <h2>{t("profiles.meet", { name: barber.name.split(" ")[0] })}.</h2>
            <p className="bio-copy">{barberBio(barber)}</p>
            <div className="about-shop">
              <img src={publicPath(shop.image)} alt={shop.name} />
              <div>
                <span className="eyebrow">{t("profiles.findMeAt")}</span>
                <h3>{shop.name}</h3>
                <p>
                  {shop.address}, {label(shop.neighborhood)}
                </p>
                <Link className="text-link" href={`/shops/${shop.slug}`}>
                  {t("profiles.exploreShop")} <ArrowUpRight size={15} />
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
          <strong>
            {t("profiles.priceFrom", {
              price: money(getPrice(barber, "haircut", state)),
            })}
          </strong>
          <span>
            {t("profiles.mobileWith", { name: barber.name.split(" ")[0] })}
          </span>
        </div>
        <Link
          href={`/booking?shop=${shop.id}&barber=${id}`}
          className="button button-dark"
        >
          {t("profiles.bookYourChair")} <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
export function ShopProfile({ id }: { id: string }) {
  const { t, label, shopDescription } = useI18n();
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
      <BackLink href="/shops">{t("profiles.allShops")}</BackLink>
      <div className="shop-cover">
        <img
          src={publicPath(shop.image)}
          alt={t("profiles.shopImage", { name: shop.name })}
        />
        <div className="shop-cover-label">
          <span className="eyebrow">{t("profiles.shopEyebrow")}</span>
          <h1>
            {shop.name}
            <span className="accent">.</span>
          </h1>
          <span>
            <MapPin size={16} />
            {t("cards.location", { neighborhood: label(shop.neighborhood) })}
          </span>
        </div>
        <FavoriteButton type="shop" id={id} label={shop.name} />
      </div>
      <div className="shop-summary">
        <Rating value={rating} count={reviews.length} />
        <span>{shop.address}</span>
        <span>
          <Clock3 size={15} />
          {shop.closedDays.includes(1)
            ? t("profiles.tueSat")
            : t("profiles.monSat")}
          , {shop.openingTime}–{shop.closingTime}
        </span>
      </div>
      <div className="profile-layout">
        <div>
          <nav className="profile-tabs" aria-label={t("profiles.shopSections")}>
            <a href="#about">{t("profiles.space")}</a>
            <a href="#team">{t("profiles.team")}</a>
            <a href="#services">{t("profiles.services")}</a>
            <a href="#reviews">{t("profiles.reviews")}</a>
          </nav>
          <section className="profile-section" id="about">
            <div className="eyebrow">{t("profiles.aboutShopEyebrow")}</div>
            <h2>{t("profiles.aboutShopTitle")}</h2>
            <p className="bio-copy">{shopDescription(shop)}</p>
            <div className="shop-gallery">
              {shop.gallery.map((image, i) => (
                <img
                  src={publicPath(image)}
                  alt={t("profiles.shopGalleryAlt", {
                    name: shop.name,
                    count: i + 1,
                  })}
                  key={image}
                />
              ))}
            </div>
            <p className="gallery-disclaimer">{t("profiles.shopDisclosure")}</p>
          </section>
          <section className="profile-section" id="team">
            <div className="section-heading">
              <div>
                <div className="eyebrow">{t("profiles.teamEyebrow")}</div>
                <h2>{t("profiles.teamTitle")}</h2>
              </div>
              <Badge>{t("profiles.barberCount", { count: team.length })}</Badge>
            </div>
            <div className="profile-team-grid">
              {team.map((b) => (
                <BarberCard barber={b} key={b.id} />
              ))}
            </div>
          </section>
          <section className="profile-section" id="services">
            <div className="eyebrow">{t("profiles.menu")}</div>
            <h2>{t("profiles.shopServicesTitle")}</h2>
            <ServiceList shopId={id} />
          </section>
          <ReviewsSection reviews={reviews} />
        </div>
        <BookingPanel key={id} shopId={id} />
      </div>
      <div className="mobile-booking-bar">
        <div>
          <strong>{shop.name}</strong>
          <span>{t("profiles.mobileShopDescription")}</span>
        </div>
        <Link href={`/booking?shop=${id}`} className="button button-dark">
          {t("profiles.bookChair")}
        </Link>
      </div>
    </div>
  );
}
