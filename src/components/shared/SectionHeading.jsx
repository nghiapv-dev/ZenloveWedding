function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-7">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-500">
        {eyebrow}
      </p>
      <h2 className="text-xl font-extrabold leading-tight text-slate-950 sm:text-2xl lg:text-3xl">
        {title}
      </h2>
      {desc ? <span className="mt-2 block text-sm leading-6 text-slate-500">{desc}</span> : null}
    </div>
  );
}

export default SectionHeading;
