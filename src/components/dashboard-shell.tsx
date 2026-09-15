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
const customerLinks = [
  ["Overview", "/account", LayoutDashboard],
  ["Appointments", "/account/appointments", CalendarDays],
  ["Favorites", "/account/favorites", Heart],
  ["My reviews", "/account/reviews", MessageSquare],
  ["Profile settings", "/account/settings", Settings2],
] as const;
const barberLinks = [
  ["Overview", "/barber/dashboard", LayoutDashboard],
  ["My profile", "/barber/profile", UserRound],
  ["Portfolio", "/barber/portfolio", Image],
  ["Services & prices", "/barber/services", Scissors],
  ["Schedule", "/barber/schedule", Clock3],
] as const;
export function DashboardShell({
  barber = false,
  children,
}: {
  barber?: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    { state } = useMock();
  return (
    <div className="container dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="workspace-label">
          {barber ? "YOUR BARBER WORKSPACE" : "YOUR PERSONAL CORNER"}
        </div>
        <div className="dashboard-person">
          {barber ? (
            <img src={state.barbers[0].image} alt="Giorgi Kapanadze" />
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
            <span>{barber ? "Senior barber" : "A good hair day regular"}</span>
          </div>
        </div>
        <nav aria-label={barber ? "Barber workspace" : "Customer account"}>
          {(barber ? barberLinks : customerLinks).map(([label, href, Icon]) => (
            <Link
              key={href}
              className={path === href ? "active" : ""}
              href={href}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="workspace-note">
          <span className="badge green">Local demo</span>
          <p>
            {barber
              ? "Your craft, your space. Edits stay in this browser."
              : "All appointments and activity here are simulated."}
          </p>
          <Link
            href={barber ? `/barbers/${state.barbers[0].slug}` : "/discover"}
            className="text-link"
          >
            {barber ? "View public profile" : "Find your next barber"}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="dashboard-main">{children}</div>
    </div>
  );
}
