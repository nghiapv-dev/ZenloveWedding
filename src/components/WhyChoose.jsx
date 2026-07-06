import { whyItems } from "../data/siteData.jsx";
import { cardClass, sectionClass } from "../constants/styles.js";
import SectionHeading from "./SectionHeading.jsx";

function WhyChoose() {
  return (
    <section className={`${sectionClass} bg-zinc-50`} id="why">
      <SectionHeading
        eyebrow="Vì sao chọn Zenlove wedding"
        title="Đồng hành cùng bạn trong từng khoảnh khắc"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {whyItems.map(([title, Icon]) => (
          <article className={`${cardClass} grid justify-items-center gap-2 p-4 text-center sm:gap-3 sm:p-6`} key={title}>
            <Icon className="size-10 rounded-2xl bg-rose-50 p-2.5 text-rose-500 sm:size-12 sm:p-3" />
            <b className="text-sm uppercase leading-snug text-slate-950 sm:text-base">{title}</b>
            <p className="hidden text-sm text-slate-500 sm:block">
              Mỗi sản phẩm được hoàn thiện cẩn thận, dễ chia sẻ và phù hợp với phong cách cưới của bạn.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WhyChoose;
