import { ArrowRight, Camera, MessageCircle, Palette } from "lucide-react";
import { sectionClass } from "../../constants/styles.js";
import SectionHeading from "../shared/SectionHeading.jsx";

const processItems = [
  {
    title: "Chọn mẫu & gửi thông tin",
    desc: "Chọn mẫu bạn yêu thích, sau đó gửi tên, ngày cưới và nội dung cần hiển thị.",
    time: "Chỉ vài phút",
    icon: MessageCircle,
  },
  {
    title: "ZenLove thiết kế & chỉnh sửa",
    desc: "ZenLove lên bản demo, gửi bạn xem và chỉnh sửa đến khi sản phẩm thật sự ưng ý.",
    time: "Có bản demo",
    icon: Palette,
  },
  {
    title: "Nhận link hoặc video gửi khách",
    desc: "Nhận sản phẩm hoàn chỉnh để gửi khách mời, đăng Facebook hoặc lưu làm kỷ niệm.",
    time: "Dễ chia sẻ",
    icon: Camera,
  },
];

function Process() {
  return (
    <section className={`${sectionClass} bg-white`}>
      <SectionHeading
        eyebrow="Quy trình đặt"
        title="Chỉ 3 bước để có sản phẩm cưới sẵn sàng gửi khách"
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-3 lg:grid-cols-3">
          {processItems.map(({ title, desc, time, icon: Icon }, index) => (
            <article
              className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(229,65,83,0.08)] transition hover:-translate-y-1 hover:border-rose-300 sm:p-6"
              key={title}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-rose-100/70 transition group-hover:scale-125" />
              <div className="relative flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200/80">
                  <Icon size={21} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-500">Bước {index + 1}</span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{time}</span>
                  </div>
                  <h3 className="mt-3 text-base font-extrabold leading-tight text-slate-950 sm:text-lg">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white shadow-[0_16px_36px_rgba(229,65,83,0.20)] sm:mt-5 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-100">Bắt đầu rất nhanh</p>
            <h3 className="mt-1 text-lg font-extrabold sm:text-xl">Gửi mẫu bạn thích, ZenLove tư vấn gói phù hợp ngay.</h3>
          </div>
          <a className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-rose-600 shadow-sm transition hover:-translate-y-0.5 sm:mt-0 sm:w-auto" href="https://zalo.me/0335652868" rel="noreferrer" target="_blank">Nhắn Zalo ngay <ArrowRight size={17} /></a>
        </div>
      </div>
    </section>
  );
}

export default Process;
