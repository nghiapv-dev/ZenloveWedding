import { ChevronRight, Sparkles } from "lucide-react";

function TemplatesHero() {
  return (
    <section className="relative overflow-hidden bg-[#fff7f8] px-4 py-5 sm:px-6 sm:py-6 lg:px-12 lg:py-8">
      <div className="relative mx-auto max-w-6xl text-center">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:text-base"
        >
          <a className="transition hover:text-rose-500" href="/">
            Trang chủ
          </a>
          <ChevronRight aria-hidden="true" size={16} />
          <span className="font-bold text-slate-950">Mẫu thiệp</span>
        </nav>

        <svg
          aria-hidden="true"
          className="absolute left-[3%] top-11 hidden h-7 w-20 text-violet-300 sm:block lg:left-[7%]"
          viewBox="0 0 80 28"
          fill="none"
        >
          <path
            d="M2 14c9 7 16 7 24 0 8 7 15 7 23 0 8 7 15 7 23 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
        </svg>

       <h2 className="mt-7 flex flex-wrap items-baseline justify-center gap-x-2 text-3xl font-black tracking-tight text-slate-750 sm:mt-8 sm:text-4xl lg:text-5xl">
  <span>Mẫu thiệp</span>
  <span className="template-hero-script text-4xl font-normal text-rose-600 sm:text-5xl lg:text-6xl">
    online đẹp
  </span>
</h2>

        <p className="mx-auto mt-4 max-w-4xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
          Khám phá bộ sưu tập mẫu thiệp điện tử đa dạng: cưới, sinh nhật,
          sự kiện, kỷ niệm từ ZenLove
        </p>

        <Sparkles
          aria-hidden="true"
          className="absolute bottom-0 right-[3%] hidden text-amber-300 sm:block lg:right-[7%]"
          size={34}
          strokeWidth={1.8}
        />
      </div>
    </section>
  );
}

export default TemplatesHero;
