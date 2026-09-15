import { SkeletonCard } from "@/components/ui";
export default function Loading() {
  return (
    <div className="container page-section" role="status" aria-live="polite">
      <div className="page-heading">
        <h1>Finding your chair.</h1>
      </div>
      <div className="barber-grid">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="sr-only">Loading the page</span>
    </div>
  );
}
