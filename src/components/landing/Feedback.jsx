import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  MessageCircleHeart,
  Send,
  Star,
} from "lucide-react";
import { sectionClass } from "../../constants/styles.js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";

const RATE_LIMIT_KEY = "zenlove-review-last-submission";
const PAGE_SIZE = 4;

function RatingStars({ value, onChange, interactive = false, size = 18 }) {
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
          <Star fill="currentColor" size={size} />
        </button>
      ))}
    </div>
  );
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Feedback() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const visibleReviews = reviews.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );
  const goToPage = (direction) =>
    setPage((current) => (current + direction + pageCount) % pageCount);

  useEffect(() => {
    if (pageCount <= 1) return undefined;
    const timer = window.setInterval(() => goToPage(1), 5000);
    return () => window.clearInterval(timer);
  }, [pageCount]);

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
    setPage(0);
    setName("");
    setContent("");
    setRating(5);
    setMessage("Cảm ơn bạn! Đánh giá đã được hiển thị trên website.");
  };

  return (
    <section className={`${sectionClass} bg-[#f7f7f6]`} id="feedback">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="mx-auto block h-0.5 w-28 bg-red-900" />
          <p className="mt-5 font-serif text-3xl font-semibold uppercase tracking-[0.035em] text-[#ff6148] sm:text-4xl">
            Đánh giá khách hàng
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Những chia sẻ chân thật từ các cặp đôi đã chọn ZenLove Wedding
          </p>
        </div>

        {reviews.length ? (
          <div className="relative mt-9 px-7 sm:px-10">
            <button
              aria-label="Xem đánh giá trước"
              className="absolute left-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={pageCount === 1}
              onClick={() => goToPage(-1)}
              type="button"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {visibleReviews.map((review, index) => (
                <article
                  className="flex min-h-[330px] flex-col rounded-xl border border-slate-300 bg-white px-5 py-5 shadow-[0_2px_3px_rgba(15,23,42,0.02)]"
                  key={review.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Flag
                      className="fill-red-900 text-red-900"
                      size={35}
                      strokeWidth={1.8}
                    />
                    <RatingStars size={20} value={review.rating} />
                  </div>
                  <p className="mt-6 line-clamp-6 text-[15px] leading-6 text-slate-800">
                    {review.content}
                  </p>
                  <div className="mt-auto border-t border-slate-400 pt-5">
                    <div className="flex items-center gap-4">
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${["bg-rose-400", "bg-amber-400", "bg-violet-400", "bg-sky-500"][index % 4]}`}
                      >
                        {initials(review.display_name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-slate-950">
                         Khách hàng: {review.display_name}
                        </p>
                      
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button
              aria-label="Xem đánh giá tiếp theo"
              className="absolute right-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-30"
              disabled={pageCount === 1}
              onClick={() => goToPage(1)}
              type="button"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        ) : (
          <div className="mt-9 grid min-h-56 place-items-center rounded-xl border border-dashed border-rose-200 bg-white p-6 text-center">
            <div>
              <MessageCircleHeart className="mx-auto text-rose-400" size={32} />
              <p className="mt-3 font-extrabold text-slate-700">
                Hãy là người đầu tiên chia sẻ trải nghiệm.
              </p>
            </div>
          </div>
        )}

        <div className="mt-[5px] text-center">
          <button
            className="cursor-pointer text-sm font-extrabold text-rose-600 underline decoration-rose-300 underline-offset-4 transition hover:text-rose-800"
            onClick={() => setIsFormOpen((current) => !current)}
            type="button"
          >
            {isFormOpen ? "Ẩn form đánh giá" : "Đánh giá tại đây"}
          </button>
        </div>

        {isFormOpen ? (
          <form
            className="mx-auto mt-[5px] max-w-2xl rounded-2xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(229,65,83,0.06)] sm:p-7"
            onSubmit={submit}
          >
            <h3 className="text-center text-xl font-extrabold text-slate-900">
              Gửi đánh giá của bạn
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-700">
                Tên hiển thị
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-rose-50/30 px-3 outline-none focus:border-rose-400"
                  maxLength="80"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tên của bạn"
                  required
                  value={name}
                />
              </label>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Mức độ hài lòng
                </p>
                <div className="mt-3">
                  <RatingStars
                    interactive
                    onChange={setRating}
                    size={25}
                    value={rating}
                  />
                </div>
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
              className="mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-extrabold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              <Send size={16} /> {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            {message ? (
              <p
                className={`mt-3 rounded-xl p-3 text-sm font-bold ${message.startsWith("Cảm ơn") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}
              >
                {message}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </section>
  );
}

export default Feedback;
