import { useEffect, useMemo, useState } from "react";
import { MessageCircleHeart, Send, Star } from "lucide-react";
import { sectionClass } from "../../constants/styles.js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";

const RATE_LIMIT_KEY = "zenlove-review-last-submission";

function RatingStars({ value, onChange, interactive = false }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          aria-label={`Chọn ${star} sao`}
          className={`transition ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} ${star <= value ? "text-amber-400" : "text-slate-200"}`}
          disabled={!interactive}
          key={star}
          onClick={() => onChange?.(star)}
          type="button"
        >
          <Star fill="currentColor" size={interactive ? 26 : 16} />
        </button>
      ))}
    </div>
  );
}

function Feedback() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("customer_reviews")
      .select("id, display_name, rating, content, created_at")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(12);
    setReviews(data || []);
  };
  useEffect(() => {
    loadReviews();
  }, []);
  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0,
    [reviews],
  );

  const submit = async (event) => {
    event.preventDefault();
    if (website) return;
    if (!isSupabaseConfigured)
      return setMessage("Hệ thống đánh giá đang chưa kết nối.");
    if (name.trim().length < 2 || content.trim().length < 10)
      return setMessage("Vui lòng nhập tên và đánh giá ít nhất 10 ký tự.");
    if (Date.now() - Number(localStorage.getItem(RATE_LIMIT_KEY) || 0) < 60_000)
      return setMessage("Bạn vừa gửi đánh giá. Vui lòng thử lại sau 1 phút.");
    setSubmitting(true);
    setMessage("");
    const { data, error } = await supabase
      .from("customer_reviews")
      .insert({ display_name: name.trim(), rating, content: content.trim() })
      .select("id, display_name, rating, content, created_at")
      .single();
    setSubmitting(false);
    if (error) return setMessage("Chưa thể gửi đánh giá. Vui lòng thử lại.");
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    setReviews((current) => [data, ...current]);
    setName("");
    setContent("");
    setRating(5);
    setMessage("Cảm ơn bạn! Đánh giá đã được hiển thị trên website.");
  };

  return (
    <section
      className={`${sectionClass} bg-gradient-to-b from-white to-rose-50/45`}
      id="feedback"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
            Đánh giá khách hàng
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            Khách hàng nói gì về ZenLove Wedding?
          </h2>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div>
            {reviews.length ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <strong className="text-3xl text-slate-900">
                    {average.toFixed(1)}
                  </strong>
                  <RatingStars value={Math.round(average)} />
                  <span className="text-sm font-medium text-slate-500">
                    {reviews.length} đánh giá
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <article
                      className="rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_10px_24px_rgba(229,65,83,0.06)]"
                      key={review.id}
                    >
                      <RatingStars value={review.rating} />
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        “{review.content}”
                      </p>
                      <p className="mt-4 text-sm font-extrabold text-slate-800">
                        {review.display_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Intl.DateTimeFormat("vi-VN", {
                          month: "long",
                          year: "numeric",
                        }).format(new Date(review.created_at))}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-rose-200 bg-white p-6 text-center">
                <MessageCircleHeart className="text-rose-400" size={32} />
                <p className="mt-3 font-extrabold text-slate-700">
                  Hãy là người đầu tiên chia sẻ trải nghiệm.
                </p>
              </div>
            )}
          </div>
          <form
            className="h-fit rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(229,65,83,0.08)]"
            onSubmit={submit}
          >
            <h3 className="text-lg font-extrabold text-slate-900">
              Gửi đánh giá của bạn
            </h3>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Tên hiển thị
              <input
                className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-rose-50/30 px-3 outline-none focus:border-rose-400"
                maxLength="80"
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Minh Anh"
                required
                value={name}
              />
            </label>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-700">
                Mức độ hài lòng
              </p>
              <div className="mt-2">
                <RatingStars interactive onChange={setRating} value={rating} />
              </div>
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              Chia sẻ của bạn
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-rose-100 bg-rose-50/30 p-3 leading-6 outline-none focus:border-rose-400"
                maxLength="1000"
                minLength="10"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Bạn cảm nhận thế nào về dịch vụ của ZenLove Wedding?"
                required
                value={content}
              />
            </label>
            <input
              aria-hidden="true"
              autoComplete="off"
              className="hidden"
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex="-1"
              value={website}
            />
            <button
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              <Send size={16} />
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            {message ? (
              <p
                className={`mt-3 rounded-xl p-3 text-sm font-bold ${message.startsWith("Cảm ơn") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}
              >
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Feedback;
