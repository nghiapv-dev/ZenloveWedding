import { MessageCircle, Phone, Video } from "lucide-react";
import { cardClass, sectionClass } from "../constants/styles.js";
import SectionHeading from "./SectionHeading.jsx";

const contactItems = [
  {
    label: "Zalo",
    value: "0335 652 868",
    href: "https://zalo.me/0335652868",
    icon: MessageCircle,
    active: true,
  },
  {
    label: "TikTok",
    value: "@zenlovewedding",
    href: "https://www.tiktok.com/@zenlovewedding",
    icon: Video,
  },
  {
    label: "Số điện thoại",
    value: "0335 652 868",
    href: "tel:0335652868",
    icon: Phone,
  },
];

function OrderContact() {
  return (
    <section className={`${sectionClass} bg-zinc-50`} id="order">
      <SectionHeading
        eyebrow="Liên hệ"
        title="Liên hệ Zenlove wedding"
        desc="Chọn kênh thuận tiện để được tư vấn mẫu, báo giá và thời gian hoàn thành."
      />

      <div className={`${cardClass} mx-auto max-w-3xl p-4 sm:p-6`} id="contact">
        <div className="grid gap-3 sm:grid-cols-3">
          {contactItems.map(({ label, value, href, icon: Icon, active }) => (
            <a
              className={`group rounded-2xl border p-4 transition hover:-translate-y-1 sm:p-5 ${
                active
                  ? "border-rose-200 bg-rose-50 text-slate-950"
                  : "border-rose-100 bg-white text-slate-700 hover:border-rose-300"
              }`}
              href={href}
              key={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
            >
              <Icon className="size-10 rounded-2xl bg-white p-2.5 text-rose-500 shadow-sm sm:size-11" />
              <h3 className="mt-3 text-base font-extrabold text-slate-950 sm:mt-4 sm:text-lg">{label}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrderContact;
