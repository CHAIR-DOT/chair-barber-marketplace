"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Heart,
  Image,
  LayoutDashboard,
  MessageSquare,
  Scissors,
  Settings2,
  UserRound,
} from "lucide-react";
import { useMock } from "./provider";
import { useI18n } from "@/i18n/provider";
const customerLinks = [
  ["dashboard.nav.overview", "/account", LayoutDashboard],
  ["dashboard.nav.appointments", "/account/appointments", CalendarDays],
  ["dashboard.nav.favorites", "/account/favorites", Heart],
  ["dashboard.nav.reviews", "/account/reviews", MessageSquare],
  ["dashboard.nav.settings", "/account/settings", Settings2],
] as const;
const barberLinks = [
  ["dashboard.nav.overview", "/barber/dashboard", LayoutDashboard],
  ["dashboard.nav.profile", "/barber/profile", UserRound],
  ["dashboard.nav.portfolio", "/barber/portfolio", Image],
  ["dashboard.nav.services", "/barber/services", Scissors],
  ["dashboard.nav.schedule", "/barber/schedule", Clock3],
] as const;
export function DashboardShell({
  barber = false,
  children,
}: {
  barber?: boolean;
  children: React.ReactNode;
}) {
  const { t: tr, barberTitle } = useI18n();
  const path = usePathname(),
    { state } = useMock();
  return (
    <div className="container dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="workspace-label">
          {barber
            ? tr("dashboard.workspaceLabel")
            : tr("dashboard.personalLabel")}
        </div>
        <div className="dashboard-person">
          {barber ? (
            <img src={state.barbers[0].image} alt={state.barbers[0].name} />
          ) : (
            <span className="initial-avatar">AC</span>
          )}
          <div>
            <strong>
              {barber
                ? state.barbers[0].name
                : state.user?.role === "customer"
                  ? state.user.name
                  : "Alex Chikovani"}
            </strong>
            <span>
              {barber ? barberTitle(state.barbers[0]) : tr("dashboard.regular")}
            </span>
          </div>
        </div>
        <nav
          aria-label={
            barber ? tr("dashboard.workspaceAria") : tr("dashboard.accountAria")
          }
        >
          {(barber ? barberLinks : customerLinks).map(([label, href, Icon]) => (
            <Link
              key={href}
              className={path === href ? "active" : ""}
              href={href}
            >
              <Icon size={17} />
              {tr(label)}
            </Link>
          ))}
        </nav>
        <div className="workspace-note">
          <span className="badge green">{tr("dashboard.localDemo")}</span>
          <p>
            {barber
              ? tr("dashboard.barberNotice")
              : tr("dashboard.customerNotice")}
          </p>
          <Link
            href={barber ? `/barbers/${state.barbers[0].slug}` : "/discover"}
            className="text-link"
          >
            {barber ? tr("dashboard.viewProfile") : tr("dashboard.findBarber")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
