import type {
  Appointment,
  Availability,
  Barber,
  BarberShop,
  Customer,
  HaircutStyle,
  PortfolioItem,
  Review,
  Service,
} from "./types";
import { addDays, today } from "./dates";
function workingDate(date: string, direction = -1) {
  let d = date;
  while ([0, 1].includes(new Date(`${d}T12:00:00Z`).getUTCDay()))
    d = addDays(direction, d);
  return d;
}
export const nextWorkingDate = workingDate(addDays(1), 1);

export const styles: HaircutStyle[] = [
  ["skin-fade", "Skin Fade", "Sharp sides. A seamless finish."],
  ["low-fade", "Low Fade", "Understated, with a clean edge."],
  ["mid-fade", "Mid Fade", "The perfect middle ground."],
  ["taper-fade", "Taper Fade", "A fresh take on a timeless cut."],
  ["buzz-cut", "Buzz Cut", "Less length. More character."],
  ["french-crop", "French Crop", "A distinctive fringe, made easy."],
  ["textured-crop", "Textured Crop", "Movement with a little attitude."],
  ["pompadour", "Pompadour", "Volume, shape, and confidence."],
  ["classic-scissor-cut", "Classic Scissor Cut", "Good style never gets old."],
  ["curly-hair", "Curly Hair", "Let your natural texture lead."],
  ["long-hair", "Long Hair", "Keep the length. Find the shape."],
  ["beard-styles", "Beard Styles", "The details make the difference."],
].map(([slug, name, description], i) => ({
  id: slug,
  slug,
  name,
  description,
  image: `/images/cut-${[5, 2, 12, 8, 9, 10, 3, 1, 7, 6, 11, 4][i]}.jpg`,
}));

const shopRows = [
  [
    "Gentleman's Corner",
    "gentlemans-corner",
    "Vake",
    "24 Irakli Abashidze St",
    "A neighborhood institution with a modern point of view. Come for a considered cut, stay for the conversation and a very good espresso.",
  ],
  [
    "The Old School",
    "the-old-school",
    "Vera",
    "12 Petre Melikishvili St",
    "Traditional craft, independent spirit. Our team brings classic barbering into the present with careful scissor work and a warm welcome.",
  ],
  [
    "Blade & Bourbon",
    "blade-and-bourbon",
    "Saburtalo",
    "38 Pekini Avenue",
    "A relaxed space for sharp cuts. Discover a team known for thoughtful consultations, precise fades, and exceptional beard work.",
  ],
  [
    "District 01",
    "district-01",
    "Old Tbilisi",
    "9 Lado Asatiani St",
    "Creative cuts in the heart of the old city. A small studio for texture, individuality, and finding a style that feels like you.",
  ],
  [
    "Vera Social Club",
    "vera-social-club",
    "Vera",
    "18 Barnovi St",
    "An unhurried neighborhood studio where good conversation meets great hair. Specialists in natural texture and classic silhouettes.",
  ],
  [
    "Forma Studio",
    "forma-studio",
    "Vake",
    "61 Chavchavadze Avenue",
    "A contemporary approach to grooming. Clean design, precise techniques, and personal service from the first consultation to the finish.",
  ],
  [
    "Northside Barber",
    "northside-barber",
    "Saburtalo",
    "16 Kazbegi Avenue",
    "Your new local for straightforward service and an outstanding cut. Fades, beard shaping, and easy everyday styles.",
  ],
  [
    "Sololaki Grooming",
    "sololaki-grooming",
    "Old Tbilisi",
    "7 Galaktion Tabidze St",
    "Tucked into a historic courtyard, our intimate studio celebrates the ritual of a proper haircut. Thoughtful details, every time.",
  ],
];
export const shops: BarberShop[] = shopRows.map(
  ([name, slug, neighborhood, address, description], i) => ({
    id: `shop-${i + 1}`,
    name,
    slug,
    neighborhood,
    city: "Tbilisi",
    address,
    description,
    image: `/images/shop-${[1, 2, 3, 4, 2, 4, 3, 1][i]}.jpg`,
    gallery: [
      `/images/shop-${[1, 2, 3, 4, 2, 4, 3, 1][i]}.jpg`,
      `/images/cut-${((i + 2) % 8) + 1}.jpg`,
      `/images/cut-${(i % 8) + 1}.jpg`,
    ],
    openingTime: "10:00",
    closingTime: "20:00",
    closedDays: i === 7 ? [0, 1] : [0],
    distance: [0.8, 1.2, 2.4, 3.1, 1.8, 1.5, 3.8, 4.2][i],
    featured: i < 3,
  }),
);
export const services: Service[] = [
  {
    id: "haircut",
    name: "Signature haircut",
    duration: 45,
    price: 35,
    description: "Consultation, a tailored cut, wash, and styling.",
  },
  {
    id: "skin-fade",
    name: "Skin fade",
    duration: 50,
    price: 40,
    description: "A seamless fade with a clean, detailed finish.",
  },
  {
    id: "haircut-beard",
    name: "Haircut & beard",
    duration: 60,
    price: 55,
    description: "The complete refresh. A cut and a sculpted beard.",
  },
  {
    id: "beard-trim",
    name: "Beard sculpting",
    duration: 25,
    price: 20,
    description: "Shape, line-up, and conditioning for your beard.",
  },
  {
    id: "scissor-cut",
    name: "Scissor cut",
    duration: 60,
    price: 45,
    description: "Precision scissor work for texture and longer styles.",
  },
];
const names = [
  "Giorgi Kapanadze",
  "Luka Maisuradze",
  "Sandro Gelashvili",
  "Nika Beridze",
  "Dato Khutsishvili",
  "Irakli Tsereteli",
  "Levan Dolidze",
  "Beka Chikovani",
  "Guga Lomidze",
  "Tornike Japaridze",
  "Saba Abashidze",
  "Vako Kalandadze",
  "Giorgi Tsiklauri",
  "Dachi Shengelia",
  "Mate Danelia",
  "Ilia Kereselidze",
];
const specialtySets = [
  ["skin-fade", "taper-fade", "textured-crop", "beard-styles"],
  ["classic-scissor-cut", "pompadour", "long-hair"],
  ["low-fade", "curly-hair", "beard-styles"],
  ["mid-fade", "buzz-cut", "french-crop"],
  ["taper-fade", "textured-crop", "long-hair"],
  ["curly-hair", "classic-scissor-cut", "low-fade"],
  ["skin-fade", "buzz-cut", "beard-styles"],
  ["pompadour", "french-crop", "mid-fade"],
];
export const barbers: Barber[] = names.map((name, i) => ({
  id: `barber-${i + 1}`,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  name,
  role:
    i === 15
      ? "Emerging barber"
      : i % 3 === 0
        ? "Senior barber"
        : "Barber & stylist",
  shopId: `shop-${Math.floor(i / 2) + 1}`,
  image: `/images/barber-${(i % 8) + 1}.jpg`,
  bio: [
    "A great haircut starts with listening. I specialize in clean fades and natural texture, taking the time to understand your hair, your routine, and what makes you feel your best.",
    "I believe the best haircut looks as good three weeks later as it does when you leave the chair. My approach combines traditional scissor techniques with modern, wearable shapes.",
    "Details matter. From the first consultation to the final line-up, I bring a careful eye and a relaxed approach to every appointment. Let's find your next signature look.",
    "Hair is personal. I love working with natural texture and finding small changes that make a big difference. Expect an honest conversation and a cut made for you.",
  ][i % 4],
  experience: [6, 8, 5, 4, 7, 9, 3, 6, 5, 10, 4, 8, 3, 5, 2, 1][i],
  styleIds: specialtySets[i % 8],
  serviceIds: i === 15 ? ["haircut", "beard-trim"] : services.map((s) => s.id),
  servicePrices: Object.fromEntries(
    services.map((s) => [s.id, s.price + [0, 5, -5, 0, 10, 5, -5, 0][i % 8]]),
  ),
  verified: i !== 15,
  completedCuts: i === 15 ? 12 : 280 + i * 127,
  availableToday: i % 4 !== 3,
  nextTime: ["16:00", "17:45", "14:30", "10:00"][i % 4],
  featured: i < 4,
}));
export const customer: Customer = {
  id: "customer-1",
  name: "Alex Chikovani",
  email: "alex@example.test",
  role: "customer",
  phone: "+995 555 010 010",
};
const customerNames = [
  "Alex Chikovani",
  "Nika Gvazava",
  "Lasha Mchedlishvili",
  "Davit Kordzaia",
  "Saba Kvirkvelia",
  "Giga Metreveli",
  "Andria Lomidze",
  "Levan Kajaia",
  "Tato Vashakidze",
  "Beka Kobalia",
  "Luka Shanidze",
  "Giorgi Mikeladze",
  "Irakli Bakradze",
  "Sandro Kvirtia",
  "Dato Svanidze",
  "Vako Rukhadze",
];
export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `customer-${i + 1}`,
  name,
  email: `customer${i + 1}@example.test`,
  role: "customer",
}));
const reviewCopy = [
  "Exactly the fade I asked for. Giorgi took time to understand the shape I wanted, and the detail around the ears is perfect.",
  "A proper consultation and a cut that still looks good weeks later. I have already booked my next visit.",
  "The whole experience felt easy and unhurried. Great attention to detail and a really welcoming studio.",
  "Finally found someone who knows how to work with my curls. Great shape without taking too much length off.",
  "Clean lines, a natural finish, and useful styling advice. The appointment started right on time.",
  "Really happy with the beard shaping. Careful work and a comfortable atmosphere from start to finish.",
  "Brought a reference photo and we talked through what would work for my hair. The result was even better.",
  "My new regular. A lovely space, good conversation, and a consistently excellent cut.",
  "The cut was great and the consultation was helpful. We started a little late, but I would happily return.",
  "The scissor work is excellent. It feels personal, and never like you are being rushed out of the chair.",
  "A noticeable step up from my usual haircut. The blend is clean and it grows out naturally.",
  "Listened to what I wanted and explained each suggestion. Left feeling like myself, just a little sharper.",
];
export const reviews: Review[] = Array.from({ length: 45 }, (_, i) => ({
  id: `review-${i + 1}`,
  customerId: `customer-${(i % 16) + 1}`,
  barberId: `barber-${(i % 15) + 1}`,
  appointmentId: `history-${i + 1}`,
  date: workingDate(addDays(-3 - i)),
  rating: i % 7 === 6 ? 4 : 5,
  text: (
    reviewCopy[i % reviewCopy.length] +
    [
      " I appreciated the advice on keeping the shape between visits.",
      " The team made my first visit feel comfortable.",
      " The finish is easy to style at home.",
      " I came in before a special occasion and left feeling confident.",
    ][Math.floor(i / reviewCopy.length)]
  ).replace("Giorgi", names[i % 15].split(" ")[0]),
  dimensions: {
    quality: 5,
    detail: i % 5 === 0 ? 4 : 5,
    communication: 5,
    punctuality: i % 4 === 0 ? 4 : 5,
  },
}));
export const appointments: Appointment[] = [
  ...reviews.map((r, i): Appointment => ({
    id: r.appointmentId,
    customerId: r.customerId,
    barberId: r.barberId,
    shopId: barbers[i % 15].shopId,
    serviceId: i % 3 === 0 ? "skin-fade" : "haircut",
    date: r.date,
    time: "14:30",
    duration: i % 3 === 0 ? 50 : 45,
    price: barbers[i % 15].servicePrices[i % 3 === 0 ? "skin-fade" : "haircut"],
    status: "completed",
    createdAt: r.date,
  })),
  {
    id: "appointment-upcoming",
    customerId: customer.id,
    barberId: "barber-1",
    shopId: "shop-1",
    serviceId: "skin-fade",
    date: nextWorkingDate,
    time: "16:00",
    duration: 50,
    price: 40,
    status: "upcoming",
    createdAt: today(),
  },
  {
    id: "appointment-unreviewed",
    customerId: customer.id,
    barberId: "barber-3",
    shopId: "shop-2",
    serviceId: "haircut",
    date: workingDate(addDays(-2)),
    time: "13:00",
    duration: 45,
    price: 30,
    status: "completed",
    createdAt: addDays(-4),
  },
  {
    id: "appointment-cancelled",
    customerId: customer.id,
    barberId: "barber-2",
    shopId: "shop-1",
    serviceId: "haircut-beard",
    date: workingDate(addDays(-8)),
    time: "11:30",
    duration: 60,
    price: 60,
    status: "cancelled",
    createdAt: addDays(-10),
  },
  {
    id: "appointment-blocker",
    customerId: "customer-2",
    barberId: "barber-1",
    shopId: "shop-1",
    serviceId: "haircut",
    date: nextWorkingDate,
    time: "11:30",
    duration: 45,
    price: 35,
    status: "upcoming",
    createdAt: today(),
  },
];
export const portfolio: PortfolioItem[] = barbers
  .filter((b) => b.id !== "barber-16")
  .flatMap((b, bi) =>
    Array.from({ length: b.styleIds.length }, (_, i) => ({
      id: `portfolio-${bi + 1}-${i + 1}`,
      barberId: b.id,
      styleIds: [b.styleIds[i % b.styleIds.length]],
      image: styles.find((s) => s.id === b.styleIds[i % b.styleIds.length])!
        .image,
      title: styles.find((s) => s.id === b.styleIds[i % b.styleIds.length])!
        .name,
      description: [
        "A clean silhouette with a soft, natural finish.",
        "Careful blending, considered proportions.",
        "Texture up top. Precision around the edges.",
        "A fresh shape, tailored to the individual.",
      ][i],
    })),
  );
export const availability: Availability[] = barbers.map((b) => ({
  barberId: b.id,
  workingDays: [1, 2, 3, 4, 5, 6],
  start: "10:00",
  end: "20:00",
  blockedDates: [],
  blockedSlots: ["13:00"],
}));
export const SLOT_TIMES = [
  "10:00",
  "10:45",
  "11:30",
  "13:00",
  "14:30",
  "16:00",
  "17:45",
];
export const neighborhoods = ["Vake", "Vera", "Saburtalo", "Old Tbilisi"];
