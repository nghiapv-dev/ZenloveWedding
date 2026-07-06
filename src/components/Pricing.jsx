import { Check } from "lucide-react";
import { packages } from "../data/siteData.jsx";
import { pillButton, sectionClass } from "../constants/styles.js";
import SectionHeading from "./SectionHeading.jsx";

function Pricing() {
  return (
    <section className={`${sectionClass} bg-white`} id="pricing">
      <SectionHeading
        eyebrow="Bảng giá"
        title="Chọn gói phù hợp với nhu cầu của bạn"
        desc="Các gói rõ ràng, dễ so sánh và dễ đặt nhanh qua Zalo."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-3">
        {packages.map((item) => {
          const isPopular = item.popular;

          return (
            <article
              className={`relative flex min-h-[260px] flex-col rounded-2xl border bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#E54153]/50 hover:shadow-[0_18px_52px_rgba(229,65,83,0.14)] sm:p-6 ${
                isPopular
                  ? "border-[#E54153]/40 bg-[#fff7f8] ring-1 ring-[#E54153]/15"
                  : "border-[#E54153]/18"
              }`}
              key={item.name}
            >
              {isPopular ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#E54153] px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                  Nên chọn
                </span>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <h3 className="pr-24 text-2xl font-extrabold leading-tight text-slate-950 lg:pr-0">
                    {item.name}
                  </h3>

                  <strong className="mt-4 block text-4xl font-black leading-none tracking-tight text-[#E54153]">
                    {item.price}
                  </strong>

                  <p className="mt-4 text-sm leading-6 text-slate-500">{item.fit}</p>
                </div>

                <ul className="grid content-start gap-2.5">
                  {item.features.map((feature) => (
                    <li className="flex gap-2.5 text-sm leading-6 text-slate-700" key={feature}>
                      <Check className="mt-1 size-4 shrink-0 text-[#E54153]" strokeWidth={2.7} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                className={`${pillButton} mt-auto w-full bg-[#E54153] text-white shadow-[0_10px_24px_rgba(229,65,83,0.22)] hover:bg-[#d73548]`}
                href="#order"
              >
                Đặt gói {item.name}
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Pricing;
