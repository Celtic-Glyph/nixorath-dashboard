export default function RatingStars({
  rating,
  reviewCount,
}: {
  rating: number | null;
  reviewCount: number;
}) {
  if (rating === null) {
    return <span className="text-sm text-muted">No reviews yet</span>;
  }

  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className="text-gold" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-border">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-muted">
        {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
      </span>
    </span>
  );
}
