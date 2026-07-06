import { Heart, MessageCircle } from "lucide-react";
import { stats } from "../data/siteData.jsx";
import { pillButton } from "../constants/styles.js";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_72%)] px-4 py-7 sm:px-6 sm:py-10 lg:px-12 lg:py-12">
      <div className="pointer-events-none absolute -left-24 top-4 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-pink-100/70 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-rose-100 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-500 shadow-sm">
            Zenlove wedding
          </p>

          <h1 className="max-w-3xl text-2xl font-extrabold leading-[1.15] tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Thiệp cưới Online & Dịch vụ cưới hiện đại
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Tạo thiệp cưới online, album nhạc, slide cưới, background LED và logo cô dâu chú rể.
            Xem mẫu nhanh, chọn gói dễ dàng và đặt qua Zalo chỉ trong vài phút.
          </p>

          <div className="mt-5 grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-3">
            <a
              className={`${pillButton} w-full bg-rose-500 text-white shadow-lg shadow-rose-200/80 hover:bg-rose-600 sm:w-auto`}
              href="#demo"
            >
              <Heart size={17} /> Xem mẫu
            </a>
            <a
              className={`${pillButton} w-full border border-rose-100 bg-white text-slate-950 shadow-sm hover:border-rose-200 hover:text-rose-500 sm:w-auto`}
              href="https://zalo.me/0335652868"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={17} /> Đặt qua Zalo
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white/90 p-3 shadow-[0_14px_36px_rgba(229,65,83,0.10)] sm:p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-500">
            Số liệu nhanh
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {stats.map(([value, label, Icon]) => (
              <div
                className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/60 p-2.5 sm:gap-3 sm:p-3"
                key={value}
              >
                <Icon className="size-9 rounded-xl bg-white p-2 text-rose-500 sm:size-10 sm:p-2.5" />
                <div>
                  <strong className="block text-lg leading-none text-slate-950 sm:text-xl">
                    {value}
                  </strong>
                  <span className="mt-1 block text-xs font-medium text-slate-500">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
