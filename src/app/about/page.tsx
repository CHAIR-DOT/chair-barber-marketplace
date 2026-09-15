import Link from "next/link";
import { ResetDemo } from "@/components/reset-demo";
export const metadata = { title: "About this preview" };
export default function Page() {
  return (
    <div className="container about-preview">
      <div className="eyebrow">A LOOK AT WHAT’S POSSIBLE</div>
      <h1>Welcome to the preview.</h1>
      <p>
        CHAIR. is a local, interactive concept for discovering and booking
        independent barbers in Tbilisi.
      </p>
      <h2>A note about the people and pictures.</h2>
      <p>
        All shops, barber profiles, prices, reviews, verification badges,
        business metrics, and booking activity are fictional demo data. Stock
        photographs are illustrative; the pictured people and places are not
        associated with these profiles. Portfolio images do not represent work
        by the fictional barbers.
      </p>
      <h2>Make yourself at home.</h2>
      <p>
        Explore, save favorites, compare barbers, and try booking an
        appointment. Changes are kept in your browser. The customer account
        previews Alex Chikovani’s activity, and the barber workspace previews
        Giorgi Kapanadze’s business.
      </p>
      <h2>Nothing leaves your chair.</h2>
      <p>
        No real authentication, booking service, payments, notifications,
        analytics, or database is connected. No appointment, payment, review,
        email, or SMS is sent to an external service. Use made-up credentials in
        the sign-in preview.
      </p>
      <div className="inline-actions">
        <Link href="/discover" className="button button-dark">
          Explore the marketplace
        </Link>
        <Link href="/barber/dashboard" className="button button-outline">
          Visit the barber workspace
        </Link>
        <ResetDemo />
      </div>
    </div>
  );
}
