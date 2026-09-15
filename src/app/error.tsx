"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container not-found" role="alert">
      <div className="eyebrow">A LITTLE SNAG</div>
      <h1>Let’s take another look.</h1>
      <p>
        Something interrupted this page. Your saved demo data is still in this
        browser.
      </p>
      <div className="inline-actions">
        <button className="button button-dark" onClick={reset}>
          Try again
        </button>
        <Link className="button button-outline" href="/">
          Back home
        </Link>
      </div>
    </div>
  );
}
