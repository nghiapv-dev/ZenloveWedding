import { useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import { serviceDemoSections } from "../data/siteData.jsx";
import ImageModal from "./ImageModal.jsx";

function DemoShowcase({ activeCategory }) {
  const activeSection = activeCategory ? serviceDemoSections[activeCategory] : null;
  const [previewImage, setPreviewImage] = useState(null);
  const [activeImageKey, setActiveImageKey] = useState(null);

  return (
    <section
      className="bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_72%)] px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12"
      id="demo"
    >
      <div className="mx-auto max-w-6xl">
        {!activeSection ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white/90 p-5 text-center shadow-[0_12px_30px_rgba(229,65,83,0.07)] sm:p-6">
            <Link2 className="mx-auto size-10 rounded-2xl bg-rose-50 p-2.5 text-rose-500 sm:size-11" />
            <h2 className="mt-4 text-xl font-extrabold text-slate-950 sm:text-2xl">
              Chọn một dịch vụ để xem mẫu
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Bấm Xem mẫu hoặc Xem Demo ở phần Dịch vụ của Zenlove wedding, danh sách mẫu tương ứng sẽ hiện tại đây.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 border-b border-rose-100 pb-5 sm:mb-7">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-500">
                {activeSection.eyebrow}
              </p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl lg:text-3xl">
                    {activeSection.title}
                  </h2>
                  {activeSection.subtitle ? (
                    <p className="mt-2 text-sm text-slate-500">{activeSection.subtitle}</p>
                  ) : null}
                </div>
                <a
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-bold text-white transition hover:bg-rose-600"
                  href="https://zalo.me/0335652868"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tư vấn chọn mẫu
                </a>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {activeSection.groups.map((group) => {
                const hasImage = group.items.some((item) => item.image);
                const isLandscape = ["slide", "landscape"].includes(activeSection.variant);

                return (
                  <section
                    className={`rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_12px_30px_rgba(229,65,83,0.08)] sm:p-5 ${
                      hasImage ? "lg:col-span-2" : ""
                    }`}
                    key={group.title}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950 sm:text-xl">
                          {group.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{group.items.length} mẫu</p>
                      </div>
                    </div>

                    <div
                      className={
                        hasImage
                          ? isLandscape
                            ? "grid grid-cols-2 gap-3 lg:grid-cols-4"
                            : "grid grid-cols-2 gap-3 lg:grid-cols-5"
                          : "grid grid-cols-2 gap-2"
                      }
                    >
                      {group.items.map((item) => {
                        if (item.image) {
                          const imageKey = `${group.title}-${item.title}`;
                          const isActiveImage = activeImageKey === imageKey;
                          const shouldScrollImage = !isLandscape && Boolean(item.url);

                          return (
                            <a
                              className="group overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_10px_24px_rgba(229,65,83,0.08)] transition hover:-translate-y-0.5 hover:border-rose-300"
                              href={item.url || item.image}
                              target={item.url ? "_blank" : undefined}
                              rel={item.url ? "noreferrer" : undefined}
                              onClick={(event) => {
                                const isTouchDevice = window.matchMedia(
                                  "(hover: none), (pointer: coarse)",
                                ).matches;

                                if (isTouchDevice && !isActiveImage) {
                                  event.preventDefault();
                                  setActiveImageKey(imageKey);
                                  return;
                                }

                                if (item.url) return;

                                event.preventDefault();
                                setPreviewImage({
                                  src: item.image,
                                  alt: `${group.title} ${item.title}`,
                                });
                              }}
                              key={imageKey}
                            >
                              <div
                                className={`relative overflow-hidden bg-rose-50 ${
                                  isLandscape ? "aspect-video" : "aspect-[3/4]"
                                }`}
                              >
                                <img
                                  className={
                                    isLandscape || !shouldScrollImage
                                      ? "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                      : `template-preview-image ${isActiveImage ? "is-preview-active" : ""}`
                                  }
                                  src={item.image}
                                  alt={`${group.title} ${item.title}`}
                                  loading="lazy"
                                  decoding="async"
                                />
                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-extrabold text-rose-500 shadow-sm">
                                  {item.title}
                                </span>
                                <div className="pointer-events-none absolute inset-0 hidden bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/10 sm:block" />
                                <span
                                  className={`pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 rounded-full bg-rose-500 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-rose-200/80 transition duration-300 sm:bottom-4 sm:px-4 sm:text-sm sm:opacity-0 sm:group-hover:opacity-100 ${
                                    isActiveImage ? "opacity-100" : "opacity-0"
                                  }`}
                                >
                                  {activeSection.ctaLabel || "Xem mẫu"}
                                </span>
                              </div>
                            </a>
                          );
                        }

                        if (item.url) {
                          return (
                            <a
                              className="group flex min-h-11 items-center justify-between rounded-xl border border-rose-100 bg-rose-50/40 px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 sm:px-4 sm:py-3"
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              key={`${group.title}-${item.title}`}
                            >
                              <span>{item.title}</span>
                              <ExternalLink
                                className="text-rose-500 transition group-hover:translate-x-0.5"
                                size={16}
                              />
                            </a>
                          );
                        }

                        return (
                          <div
                            className="flex min-h-11 items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm font-bold text-slate-500 sm:px-4 sm:py-3"
                            key={`${group.title}-${item.title}`}
                          >
                            <span>{item.title}</span>
                            <span className="text-xs font-semibold text-slate-400">
                              Chưa gắn mẫu
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
      <ImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </section>
  );
}

export default DemoShowcase;




