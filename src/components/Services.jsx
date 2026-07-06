import { ChevronRight } from "lucide-react";
import { services } from "../data/siteData.jsx";
import { sectionClass } from "../constants/styles.js";

const demoCategories = ["wedding", "album", "video", "background"];

function Services({ activeDemoCategory, onSelectDemoCategory }) {
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
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-500">
            Dịch vụ của Zenlove wedding
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl lg:text-3xl">
            Chọn dịch vụ bạn muốn tìm hiểu
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {services.map(({ title, price, cta, icon: Icon, featured }, index) => {
            const demoCategory = demoCategories[index];
            const isActive = activeDemoCategory === demoCategory;

            return (
              <button
                className={`group rounded-2xl border bg-white p-3 text-left shadow-[0_12px_30px_rgba(229,65,83,0.08)] transition hover:-translate-y-1 hover:border-rose-300 sm:p-5 ${
                  featured ? "border-rose-200 bg-gradient-to-b from-rose-50 to-white" : "border-rose-100"
                } ${isActive ? "border-rose-400 ring-2 ring-rose-100" : ""}`}
                key={title}
                onClick={() => {
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
                <h3 className="mt-4 min-h-11 text-base font-extrabold leading-tight text-slate-950 sm:mt-5 sm:min-h-14 sm:text-xl">
                  {title}
                </h3>
                <strong className="mt-2 block text-2xl leading-none text-rose-500 sm:mt-3 sm:text-3xl">
                  {price}
                </strong>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-rose-500 sm:mt-5">
                  {cta} <ChevronRight className="transition group-hover:translate-x-1" size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Services;
