import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "../data/siteData.jsx";
import { sectionClass } from "../constants/styles.js";
import SectionHeading from "./SectionHeading.jsx";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className={`${sectionClass} bg-white`}>
      <SectionHeading eyebrow="FAQ" title="Câu hỏi thường gặp" />

      <div className="faq-font mx-auto max-w-4xl divide-y divide-rose-100 border-y border-rose-100 bg-white">
        {faqs.map(([question, answer], index) => {
          const isOpen = openIndex === index;

          return (
            <article key={question}>
              <button
                className="flex min-h-[68px] w-full items-center justify-between gap-4 py-4 text-left sm:min-h-[70px]"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span className="text-[15px] font-[800] leading-snug text-slate-950 sm:text-[17px]">
                  {question}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 sm:size-9">
                  <ChevronDown
                    className={`transition duration-300 ${isOpen ? "rotate-180" : ""}`}
                    size={17}
                  />
                </span>
              </button>

              {isOpen ? (
                <div className="pb-5 pr-11 sm:pr-14">
                  <p className="max-w-3xl text-[14px] font-medium leading-7 text-slate-500 sm:text-[15px]">
                    {answer}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FAQ;
