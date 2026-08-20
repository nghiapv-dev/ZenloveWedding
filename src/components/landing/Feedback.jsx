import { useState } from "react";
import { ChevronDown, ChevronUp, Image, Star } from "lucide-react";
import { feedbacks } from "../../data/siteData.jsx";
import { sectionClass } from "../../constants/styles.js";
import ImageModal from "../shared/ImageModal.jsx";
import SectionHeading from "../shared/SectionHeading.jsx";

function Feedback() {
  const [previewImage, setPreviewImage] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visibleFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 4);

  return (
    <section className={`${sectionClass} bg-gradient-to-b from-white to-rose-50/45`}>
      <SectionHeading title="Ảnh feedback thật từ khách hàng" />

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {visibleFeedbacks.map((item) => (
          <button
            className="group overflow-hidden rounded-2xl border border-rose-100 bg-white p-1.5 text-left shadow-[0_10px_26px_rgba(229,65,83,0.08)] transition hover:-translate-y-1 hover:border-rose-300 sm:p-2"
            key={item.title}
            onClick={() => setPreviewImage({ src: item.image, alt: `${item.title} ${item.source}` })}
            type="button"
          >
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-rose-50">
              <img
                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                src={item.image}
                alt={`${item.title} ${item.source}`}
                loading="lazy"
                decoding="async"
              />
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-rose-500 shadow-sm">
                <Star size={11} fill="currentColor" /> {item.source}
              </span>
              <span className="absolute bottom-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-sm transition group-hover:scale-110">
                <Image size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {feedbacks.length > 4 ? (
        <div className="mt-6 flex justify-center">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-200 bg-white px-5 text-sm font-extrabold text-rose-500 shadow-sm transition hover:border-rose-400 hover:bg-rose-50"
            onClick={() => setShowAll((current) => !current)}
            type="button"
          >
            {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {showAll ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      ) : null}

      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </section>
  );
}

export default Feedback;
