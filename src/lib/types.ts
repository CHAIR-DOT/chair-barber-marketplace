export type ID = string;
export type Role = "customer" | "barber";
export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
}
export interface Customer extends User {
  role: "customer";
  phone?: string;
}
export interface BarberShop {
  id: ID;
  slug: string;
  name: string;
  neighborhood: string;
  city: string;
  address: string;
  image: string;
  gallery: string[];
  description: string;
  openingTime: string;
  closingTime: string;
  closedDays: number[];
  distance: number;
  featured?: boolean;
}
export interface Service {
  id: ID;
  name: string;
  duration: number;
  price: number;
  description: string;
}
export interface Barber {
  id: ID;
  slug: string;
  name: string;
  role: string;
  shopId: ID;
  image: string;
  bio: string;
  experience: number;
  styleIds: ID[];
  serviceIds: ID[];
  servicePrices: Record<ID, number>;
  verified: boolean;
  completedCuts: number;
  availableToday: boolean;
  nextTime: string;
  featured?: boolean;
}
export interface HaircutStyle {
  id: ID;
  slug: string;
  name: string;
  image: string;
  description: string;
}
export interface PortfolioItem {
  id: ID;
  barberId: ID;
  styleIds: ID[];
  image: string;
  title: string;
  description: string;
}
export interface Appointment {
  id: ID;
  customerId: ID;
  barberId: ID;
  shopId: ID;
  serviceId: ID;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}
export interface Review {
  id: ID;
  customerId: ID;
  barberId: ID;
  appointmentId: ID;
  date: string;
  rating: number;
  text: string;
  dimensions?: {
    quality?: number;
    detail?: number;
    communication?: number;
    punctuality?: number;
  };
}
export interface Favorite {
  entityId: ID;
  type: "barber" | "shop" | "style";
}
export interface Availability {
  barberId: ID;
  workingDays: number[];
  start: string;
  end: string;
  blockedDates: string[];
  blockedSlots: string[];
}
export interface MockState {
  favorites: Favorite[];
  appointments: Appointment[];
  reviews: Review[];
  barbers: Barber[];
  services: Service[];
  portfolio: PortfolioItem[];
  availability: Availability[];
  user: User | null;
}
