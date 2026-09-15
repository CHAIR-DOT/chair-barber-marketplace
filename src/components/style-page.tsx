"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMock } from "./provider";
import { BarberCard, StyleCard } from "./cards";
import { BackLink, FavoriteButton, PageHeader } from "./ui";
import { styles } from "@/lib/data";
export function StylePage({ id }: { id?: string }) {
  const { state } = useMock(),
    style = styles.find((s) => s.id === id);
  if (!style)
    return (
      <div className="container page-section">
        <PageHeader
          eyebrow="START WITH THE LOOK"
          title="Find your signature style"
          description="A little inspiration goes a long way. Explore the cuts, then meet the people behind the craft."
        />
        <div className="all-styles-grid">
          {styles.map((s) => (
            <StyleCard style={s} key={s.id} />
          ))}
        </div>
      </div>
    );
  const barbers = state.barbers.filter((b) => b.styleIds.includes(style.id));
  return (
    <div className="container page-section">
      <BackLink href="/styles">All haircut styles</BackLink>
      <div className="style-detail-hero">
        <div>
          <div className="eyebrow">THE STYLE GUIDE</div>
          <h1>
            {style.name}
            <span className="accent">.</span>
          </h1>
          <p>
            {style.description} Explore specialists who know this look inside
            out.
          </p>
          <div className="inline-actions">
            <Link
              href={`/discover?style=${style.id}`}
              className="button button-dark"
            >
              Find your specialist <ArrowUpRight size={17} />
            </Link>
            <div className="relative">
              <FavoriteButton type="style" id={style.id} label={style.name} />
            </div>
          </div>
        </div>
        <img src={style.image} alt={`${style.name} haircut inspiration`} />
      </div>
      <div className="section-heading">
        <div>
          <h2>Best barbers for {style.name}</h2>
          <p>{barbers.length} specialists · Tbilisi, Georgia</p>
        </div>
      </div>
      <div className="barber-grid">
        {barbers.map((b) => (
          <BarberCard key={b.id} barber={b} />
        ))}
      </div>
    </div>
  );
}
