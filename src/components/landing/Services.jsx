import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { services } from "../../data/siteData.jsx";
import { sectionClass } from "../../constants/styles.js";

const demoCategories = ["wedding", "album", "video", "background"];

function promotionTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const remaining = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function Services({ activeDemoCategory, onSelectDemoCategory }) {
  const [timeLeft, setTimeLeft] = useState(promotionTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTimeLeft(promotionTimeLeft()),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const scrollToDemo = () => {
    window.requestAnimationFrame(() => {
      document.getElementById("demo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const scrollToOrder = () => {
    document.getElementById("order")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className={sectionClass} id="services">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 text-center sm:mb-7">
      
          <h2 className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl lg:text-3xl">
            Chọn dịch vụ bạn muốn tìm hiểu
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {services.map(
            (
              {
                title,
                price,
                originalPrice,
                discount,
                cta,
                icon: Icon,
                featured,
              },
              index,
            ) => {
              const demoCategory = demoCategories[index];
              const isActive = activeDemoCategory === demoCategory;

              return (
                <button
                  className={`group flex h-full flex-col justify-between gap-3 rounded-2xl border bg-white p-3 text-left shadow-[0_12px_30px_rgba(229,65,83,0.08)] transition hover:-translate-y-1 hover:border-rose-300 sm:gap-4 sm:p-5 ${
                    featured
                      ? "border-rose-200 bg-gradient-to-b from-rose-50 to-white"
                      : "border-rose-100"
                  } ${isActive ? "border-rose-400 ring-2 ring-rose-100" : ""}`}
                  key={title}
                  onClick={() => {
                    if (index === 0) {
                      window.location.assign("/templates");
                      return;
                    }

                    if (demoCategory) {
                      onSelectDemoCategory(demoCategory);
                      scrollToDemo();
                      return;
                    }

                    scrollToOrder();
                  }}
                  type="button"
                >
                  <Icon className="size-10 rounded-2xl bg-rose-50 p-2.5 text-rose-500 sm:size-11" />
                  <h2 className="min-h-11 text-base font-extrabold leading-tight text-slate-950 sm:min-h-14 sm:text-xl">
                    {title}
                  </h2>
                 
                  <div className="flex min-h-1 flex-wrap items-end gap-2">
                    <strong className="text-2xl leading-none text-blue-600 sm:text-3xl">
                      {price}
                    </strong>
                    {discount ? (
                      <span className="rounded-full bg-rose-500 px-2 py-1 text-[13px] font-extrabold text-white sm:text-sx">
                        {discount}
                      </span>
                    ) : null}
                  </div>
                  
                  {originalPrice ? (
                    <del className="block text-lg font-semibold text-slate-400">
                      {originalPrice}
                    </del>
                  ) : (
                    <span className="block h-5" />
                  )}
                   {originalPrice ? (
                    <p className="whitespace-nowrap text-[11px] font-medium text-orange-600 sm:text-sm">
                      ⏰ Ưu đãi kết thúc sau{" "}
                      <span className="font-semibold tabular-nums">
                        {timeLeft}
                      </span>
                    </p>
                  ) : (
                    <span className="block h-5" />
                  )}
                  <span className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 text-base font-extrabold text-white shadow-[0_9px_20px_rgba(229,65,83,0.20)] transition group-hover:bg-rose-600 sm:min-h-12">
                    {cta}{" "}
                    {/* <ChevronRight
                      className="transition group-hover:translate-x-1"
                      size={16}
                    /> */}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

export default Services;
