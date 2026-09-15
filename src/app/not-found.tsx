import Link from "next/link";
import { Scissors } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container not-found">
      <Scissors size={35} />
      <div className="eyebrow">A SMALL DETOUR</div>
      <h1>This chair has moved.</h1>
      <p>We couldn’t find this page. Let’s get you back to a good haircut.</p>
      <Link className="button button-dark" href="/discover">
        Back to discovery
      </Link>
    </div>
  );
}
