You are a senior product designer, UX engineer, and full-stack web developer.

I want you to DESIGN AND BUILD a polished frontend prototype for a modern barber marketplace and booking platform.

For now, the application must run entirely on localhost and use MOCK DATA only.

Do NOT build a real backend or database yet.

However, structure the frontend professionally so that authentication, database storage, real bookings, reviews, payments, and barber dashboards can be integrated later without rebuilding the UI architecture.

## PRODUCT CONCEPT

The platform is a marketplace where customers can:

- Discover barber shops
- Discover individual barbers
- Browse barber portfolios
- See what haircut styles each barber specializes in
- Compare ratings and reviews
- View prices
- View available appointment times
- Select a service
- Select a barber
- Book an appointment
- Save favorite barbers and shops
- Rate a barber after a haircut
- Write a review
- Eventually register either as a customer or as a barber

The experience should make choosing a BARBER just as important as choosing a BARBER SHOP.

A barber's personal reputation, portfolio, specialties, rating, price, and availability should be major parts of the platform.

---

# 1. TECHNOLOGY

Create the application using a modern, maintainable stack.

Preferred stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui or similarly polished reusable components
- Lucide icons
- Local mock JSON/TypeScript data

Use the current stable versions that are compatible with each other.

The project must:

- Run locally
- Be responsive
- Have clean reusable components
- Have a logical folder structure
- Avoid unnecessary dependencies
- Avoid overengineering
- Be easy to connect to a backend later

Provide clear instructions for running the project locally.

---

# 2. DESIGN DIRECTION

The product should look like a REAL premium startup, not a generic template or student project.

Visual direction:

Premium barber culture combined with a modern marketplace/product interface.

Think:

- sophisticated
- minimal
- editorial
- masculine without being aggressive
- photography-driven
- elegant typography
- premium spacing
- subtle interactions
- strong visual hierarchy

Avoid excessive gradients.

Avoid making every section look like a rounded floating card.

Use cards only where they make sense.

Use whitespace, typography, photography, subtle borders, shadows, and hierarchy instead.

Suggested palette:

- warm off-white / cream background
- charcoal / near-black text
- dark surfaces
- subtle warm brown / bronze / muted gold accent
- neutral gray secondary text

Create a consistent design system.

Define:

- typography
- spacing
- border radius
- shadows
- buttons
- inputs
- cards
- badges
- rating components
- navigation
- responsive behavior

Add subtle hover states and tasteful micro-interactions.

Accessibility and readability are important.

---

# 3. HOMEPAGE

Build an impressive marketplace homepage.

HEADER

Include:

Logo / brand placeholder

Navigation:
- Discover
- Barber Shops
- Barbers
- How It Works

Actions:
- Sign In
- Join as Barber
- Book Appointment

The header should become compact/sticky when appropriate.

---

# 4. HERO SECTION

Create a strong visual hero.

Example headline:

"Find the barber who gets your style."

Supporting copy should explain that users can discover talented barbers, explore their work, compare reviews, and book appointments.

Create a prominent search experience.

Search fields:

Location
Service
Date

CTA:

"Find a Barber"

Include a high-quality barber-related visual composition.

The hero should immediately communicate that this is a barber discovery and booking marketplace.

---

# 5. DISCOVERY

Create a "Popular near you" section.

Use realistic mock data.

Each shop card should contain:

- shop photo
- shop name
- neighborhood/location
- average rating
- number of reviews
- starting price
- open/closed indicator
- next available appointment
- favorite button
- featured barber previews

Example:

Gentleman's Corner
4.9 ★
328 reviews
From ₾30
Next available: Today, 18:30

Make the cards visually polished and clickable.

---

# 6. BARBER DISCOVERY

Create a section called:

"Top Barbers"

Individual barbers should have independent profiles and ratings.

Each barber card:

- profile photo
- name
- shop
- rating
- number of completed cuts or reviews
- years of experience
- specialties
- starting price
- next available time

Specialty examples:

Skin Fade
Low Fade
Taper Fade
Classic Cut
Buzz Cut
Textured Crop
Beard Styling
Long Hair
Curly Hair

Allow users to understand immediately what each barber is best at.

---

# 7. BARBER SHOP PROFILE PAGE

Create a detailed route such as:

/shops/[slug]

The shop profile should include:

- cover image
- shop name
- rating
- review count
- location
- working hours
- description
- gallery
- services
- prices
- team/barbers
- reviews
- booking CTA

SERVICES

Example:

Haircut — ₾35 — 45 min
Skin Fade — ₾40 — 50 min
Haircut + Beard — ₾55 — 60 min
Beard Trim — ₾20 — 25 min

Each service should have a booking action.

---

# 8. BARBER PROFILE PAGE

This is one of the MOST IMPORTANT pages.

Route:

/barbers/[slug]

Create a premium personal profile for each barber.

Include:

- profile photo
- barber name
- shop
- overall rating
- total reviews
- experience
- short biography
- specialties
- service prices
- availability
- portfolio
- customer reviews
- booking CTA

Example:

Giorgi K.
Senior Barber
4.9 ★
187 reviews
6 years experience

Specialties:
Skin Fade
Taper
Textured Crop
Beard Styling

---

# 9. BARBER PORTFOLIO

A major differentiating feature of the product is showing what each barber can actually do.

Create a visual portfolio/gallery.

Each portfolio item represents a haircut performed by that barber.

Include categories/tags such as:

Skin Fade
Low Fade
Mid Fade
Taper
Buzz Cut
Textured Crop
Classic
Curly Hair
Beard

Clicking an image should open a larger gallery/lightbox view.

Optional mock metadata:

Haircut:
Skin Fade + Textured Top

Barber:
Giorgi K.

Customer rating:
5.0 ★

Add filtering by haircut style.

The goal is for a customer to think:

"I want THIS haircut, and I can see that THIS barber knows how to do it."

---

# 10. HAIRCUT STYLE DISCOVERY

Create a page or section:

"Browse by Style"

Show visual categories:

Skin Fade
Low Fade
Mid Fade
Taper Fade
Buzz Cut
French Crop
Textured Crop
Pompadour
Classic Scissor Cut
Curly Hair
Long Hair
Beard Styles

Clicking a style should display barbers who specialize in that haircut.

For example:

/styles/skin-fade

The page should show:

"Best barbers for Skin Fades"

with relevant barber cards.

This should be an important discovery mechanism.

---

# 11. SEARCH / DISCOVER PAGE

Create:

/discover

The page should allow users to search and filter barbers and shops.

Filters:

Location
Distance
Service
Haircut style
Price range
Rating
Availability
Experience

Sorting:

Recommended
Highest Rated
Most Reviewed
Lowest Price
Earliest Available

Provide a polished desktop filter sidebar and an appropriate mobile filter interface.

Use mock results.

---

# 12. BOOKING FLOW

Create a realistic multi-step booking experience.

STEP 1
Choose barber shop

STEP 2
Choose barber

Allow:
"Any available barber"

STEP 3
Choose service

STEP 4
Choose date

STEP 5
Choose available time

Example slots:

10:00
10:45
11:30
13:00
14:30
16:00
17:45

STEP 6
Review appointment

Display:

Barber
Shop
Service
Date
Time
Duration
Price

STEP 7
Booking confirmation

Create a polished success screen.

Because this is frontend-only, booking confirmation should be simulated locally.

Store temporary booking state in frontend state/localStorage if useful.

---

# 13. AUTHENTICATION UI

Create frontend-only authentication pages.

Users must eventually be able to register as:

CUSTOMER

or

BARBER

Create:

/login
/register

Registration should begin with:

"How will you use the platform?"

Options:

"I'm looking for a barber"

"I am a barber"

No real authentication is needed yet.

Create UI and mock behavior only.

---

# 14. CUSTOMER PROFILE

Create a prototype customer dashboard.

Sections:

Upcoming appointments
Past appointments
Favorite barbers
Favorite shops
My reviews
Profile settings

Example appointment:

Tomorrow, 16:30
Giorgi K.
Skin Fade
Gentleman's Corner
₾40

Actions:

View appointment
Cancel
Reschedule

These actions can use mock behavior.

---

# 15. BARBER DASHBOARD

Create a frontend prototype for barbers.

Route:

/barber/dashboard

Dashboard should show:

Today's appointments
Upcoming appointments
Average rating
Total reviews
Profile views
Bookings this month
Revenue placeholder
Portfolio
Services
Schedule

Create a professional dashboard experience.

Example metrics:

4.9 Average Rating
187 Reviews
46 Bookings This Month
1,240 Profile Views

---

# 16. BARBER PROFILE MANAGEMENT

Create UI where barbers could eventually manage:

Profile photo
Bio
Experience
Specialties
Services
Prices
Working hours
Availability
Portfolio images

Allow mock actions such as:

Add service
Edit price
Add portfolio image
Remove portfolio image
Change availability

No backend persistence is required yet.

---

# 17. REVIEW SYSTEM

Create a realistic review UI.

After a completed appointment, the customer should eventually be able to rate the BARBER who performed the haircut.

Rating:

1–5 stars

Include separate optional dimensions:

Haircut Quality
Attention to Detail
Communication
Punctuality

Then:

Overall Rating

Allow a written review.

Example:

★★★★★
"Exactly the fade I asked for. Great attention to detail."

Display:

Customer name
Date
Service
Barber
Rating
Review

IMPORTANT:

Only customers with a completed booking should eventually be allowed to leave a verified review.

For now, simulate this concept visually.

Add a:

"Verified Appointment"

badge to relevant reviews.

---

# 18. BARBER RATING BREAKDOWN

On barber profiles show:

Overall Rating
4.9

Haircut Quality: 4.9
Attention to Detail: 4.8
Communication: 4.9
Punctuality: 4.7

Also show rating distribution:

5 stars
4 stars
3 stars
2 stars
1 star

Use visual progress bars.

---

# 19. FAVORITES

Users should be able to save:

Barbers
Barber shops
Haircut styles

Implement mock favorite functionality locally.

Heart icons should update immediately.

---

# 20. COMPARISON FEATURE

Create a useful comparison experience.

Allow users to compare 2–3 barbers.

Compare:

Rating
Experience
Price
Specialties
Location
Next available appointment

This can initially be frontend-only.

---

# 21. SMART UX FEATURES

Add these product concepts where appropriate:

"Available Today"

"Top Rated"

"Popular"

"New Barber"

"Verified Barber"

"Fast Booking"

"Repeat Booking"

If a user previously booked a barber, create a mock:

"Book Again"

action.

---

# 22. TRUST

Create trust signals throughout the product.

Examples:

Verified reviews
Verified barber profiles
Completed appointment count
Real portfolio work
Transparent pricing
Cancellation policy
Secure booking messaging

Do NOT make fake claims about actual verification or security.

These are visual/product concepts for a prototype.

---

# 23. EMPTY / LOADING / ERROR STATES

Do not design only the happy path.

Create polished examples of:

Loading skeletons
No search results
No reviews yet
No upcoming appointments
Portfolio empty state
Booking slot unavailable
Generic error state

---

# 24. MOBILE EXPERIENCE

The website must be excellent on mobile.

On mobile:

- use compact cards
- make filters easy to access
- make booking actions obvious
- consider a sticky bottom booking CTA on barber profiles
- make date/time selection touch-friendly

Test layouts conceptually at:

375px
768px
1024px
1440px

Avoid horizontal overflow.

---

# 25. MOCK DATA

Create realistic mock data for:

At least 8 barber shops
At least 15 barbers
At least 30 reviews
Multiple services
Multiple haircut styles
Multiple portfolio entries
Available booking slots

Use Georgian-style names and realistic local pricing in GEL (₾).

Example cities/neighborhoods can include:

Tbilisi
Vake
Saburtalo
Vera
Old Tbilisi

The interface copy can initially be English, but architecture should support future Georgian localization.

Do NOT duplicate the same content everywhere.

---

# 26. IMPORTANT DATA MODEL PREPARATION

Even though there is no database yet, structure mock data similarly to future backend entities.

Prepare interfaces/types for:

User
Customer
Barber
BarberShop
Service
Appointment
Review
PortfolioItem
HaircutStyle
Favorite
Availability

Use stable IDs and relationships between mock entities.

For example:

A barber belongs to a shop.

A barber can provide multiple services.

A barber can specialize in multiple haircut styles.

A review belongs to:

customer
barber
appointment

A portfolio item belongs to a barber and can have multiple style tags.

This structure will make database integration easier later.

---

# 27. ROUTES

At minimum implement:

/
 /discover
 /shops
 /shops/[slug]
 /barbers
 /barbers/[slug]
 /styles/[slug]
 /booking
 /login
 /register
 /account
 /account/appointments
 /account/favorites
 /account/reviews
 /barber/dashboard
 /barber/profile
 /barber/portfolio
 /barber/services
 /barber/schedule

Use a logical routing structure if you believe improvements are needed.

---

# 28. COMPONENT ARCHITECTURE

Create reusable components rather than repeating UI.

Examples:

Navbar
Footer
SearchBar
ShopCard
BarberCard
RatingStars
RatingBreakdown
ReviewCard
PortfolioGallery
ServiceCard
AvailabilityPicker
DatePicker
BookingSummary
FilterSidebar
FavoriteButton
Badge
EmptyState
SkeletonCard
DashboardSidebar

Keep components clean and reasonably sized.

---

# 29. PRODUCT DETAILS

Add small details that make the prototype feel like a real product.

Examples:

"Next available today at 18:30"

"127 verified appointments"

"Usually responds quickly"

"Booked 18 times this week"

"Popular for Skin Fades"

"Returning customers: 72%"

"Last available slot today"

These are MOCK prototype values and must not be represented as real platform statistics.

---

# 30. DO NOT BUILD YET

Do NOT implement:

Real database
Real authentication
Real payments
Real SMS
Real email
Real production API
Real review persistence
Real appointment backend
Real analytics

Use mock data and frontend interactions.

However, organize the architecture so these can be added later.

---

# 31. FUTURE BACKEND PREPARATION

Add a short document such as:

BACKEND_PLAN.md

Explain how this frontend could later connect to:

PostgreSQL
Supabase or another backend
Authentication
Object/image storage
Booking persistence
Review persistence
Role-based permissions
Payments
Notifications

Do not implement these yet.

---

# 32. QUALITY REQUIREMENTS

The final result must feel production-quality visually.

Do not create a basic demo.

Pay close attention to:

Spacing
Typography
Visual hierarchy
Photography
Responsive behavior
Interactions
Navigation
Empty states
Loading states
Consistency

Avoid excessive text.

Prefer visual discovery.

The strongest parts of the application should be:

1. Homepage
2. Discover/search experience
3. Barber profile
4. Barber portfolio
5. Booking flow
6. Reviews
7. Mobile experience

---

# 33. DEVELOPMENT PROCESS

Work autonomously.

First inspect the existing project/files if there are any.

Then:

1. Plan the architecture.
2. Create the data models.
3. Create realistic mock data.
4. Build the global design system.
5. Build shared components.
6. Build the homepage.
7. Build discovery/search.
8. Build shop pages.
9. Build barber pages.
10. Build booking flow.
11. Build customer dashboard.
12. Build barber dashboard.
13. Add responsive behavior.
14. Add loading/empty/error states.
15. Polish the entire UI.
16. Run the project.
17. Fix TypeScript/build/runtime errors.
18. Test important navigation and interactions.

Do not stop after creating a scaffold.

Continue until the frontend prototype is functional and visually polished.

When making implementation decisions, make reasonable product decisions yourself rather than repeatedly asking me questions.

---

# 34. FINAL VERIFICATION

Before considering the project complete:

- Run the application.
- Run the build.
- Fix all compilation errors.
- Fix obvious console/runtime errors.
- Check that navigation works.
- Check dynamic barber/shop pages.
- Check booking interactions.
- Check favorites.
- Check responsive layouts.
- Check that mock data is displayed correctly.

Finally provide:

1. A short explanation of the architecture.
2. Exact commands to run the application locally.
3. Main routes.
4. Important files/folders.
5. What is currently mocked.
6. Recommended next steps for backend/database implementation.

Do not merely describe what the website should look like.

Actually create the files and implement the complete frontend prototype in the working directory.