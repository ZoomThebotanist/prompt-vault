"use client";

import { useState } from "react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  reviewerName: string;
  reviewerImage: string | null;
  helpfulCount: number;
  creatorReply: string | null;
}

interface Props {
  promptId: string;
  reviews: Review[];
  canReview: boolean;
  avgRating: number | null;
  reviewCount: number;
}

function StarRating({ rating, interactive = false, onChange }: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-xl transition-colors ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} ${
            star <= (hover || rating) ? "text-amber-400" : "text-zinc-700"
          }`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500 w-4">{star}★</span>
      <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-zinc-600 w-4">{count}</span>
    </div>
  );
}

export function ReviewSection({ promptId, reviews, canReview, avgRating, reviewCount }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, rating, title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to submit review");
      else { setSubmitted(true); setShowForm(false); }
    } catch { setError("Something went wrong."); }
    finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          Reviews {reviewCount > 0 && <span className="text-zinc-500 font-normal text-base">({reviewCount})</span>}
        </h2>
        {canReview && !submitted && (
          <button onClick={() => setShowForm(!showForm)} className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors">
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
        {submitted && (
          <span className="text-sm text-emerald-400">Review submitted! ✓</span>
        )}
      </div>

      {/* Rating summary */}
      {reviewCount > 0 && avgRating && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 flex gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-white">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} />
            <p className="text-xs text-zinc-500 mt-1">{reviewCount} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingCounts.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={reviewCount} />
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-white mb-4">Your Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Rating</label>
              <StarRating rating={rating} interactive onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Title (optional)</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summary of your experience" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Review</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="What did you like? How did you use this prompt?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">No reviews yet. Be the first to review this prompt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {review.reviewerName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{review.reviewerName}</p>
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <span className="text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.title && <p className="font-medium text-white text-sm mb-1">{review.title}</p>}
              {review.body && <p className="text-sm text-zinc-400 leading-relaxed">{review.body}</p>}

              {review.creatorReply && (
                <div className="mt-4 bg-zinc-800 rounded-lg p-4 border-l-2 border-violet-500">
                  <p className="text-xs text-violet-400 font-medium mb-1">Creator response</p>
                  <p className="text-sm text-zinc-300">{review.creatorReply}</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-3">
                <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  👍 Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
