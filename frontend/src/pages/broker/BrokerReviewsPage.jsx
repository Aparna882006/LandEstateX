import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { getMyReviews, replyToReview } from "../../services/broker.service";

export default function BrokerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    getMyReviews({ limit: 50 })
      .then((res) => setReviews(res.data.data.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = async (reviewId) => {
    const text = replyDrafts[reviewId];
    if (!text?.trim()) return;
    const res = await replyToReview(reviewId, text).catch(() => null);
    if (res) {
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? res.data.data : r)));
      setActiveReplyId(null);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-5 flex items-center gap-6">
        <div>
          <p className="text-3xl font-semibold text-neutral-900">{avgRating}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="text-accent-600">
          {"★".repeat(Math.round(reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0))}
          {"☆".repeat(5 - Math.round(reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <Star className="mx-auto text-neutral-500 mb-2" size={28} />
          <p className="text-sm font-medium text-neutral-900">No reviews yet</p>
          <p className="text-sm text-neutral-500 mt-1">Reviews from buyers you've worked with will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="bg-neutral-0 border border-neutral-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{review.reviewer?.name}</span>
                    {review.isVerifiedDeal && (
                      <span className="text-[10px] font-medium text-success-600 bg-success-100 px-1.5 py-0.5 rounded-full">Verified deal</span>
                    )}
                  </div>
                  <span className="text-accent-600 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </div>
                <span className="text-xs text-neutral-500">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>

              {review.title && <p className="text-sm font-medium text-neutral-900 mt-2">{review.title}</p>}
              {review.comment && <p className="text-sm text-neutral-700 mt-1">{review.comment}</p>}

              {review.brokerReply?.text ? (
                <div className="mt-3 pl-3 border-l-2 border-primary-200 bg-primary-100/30 rounded-r-lg p-3">
                  <p className="text-xs font-semibold text-primary-900">Your reply</p>
                  <p className="text-sm text-neutral-700 mt-0.5">{review.brokerReply.text}</p>
                </div>
              ) : activeReplyId === review._id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyDrafts[review._id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review._id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    onClick={() => handleReply(review._id)}
                    className="px-3 py-2 rounded-lg bg-primary-900 text-white text-xs font-medium hover:bg-primary-700"
                  >
                    Post
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveReplyId(review._id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-900"
                >
                  <MessageSquare size={13} /> Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
