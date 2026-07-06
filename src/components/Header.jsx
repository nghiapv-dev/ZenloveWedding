import { pillButton } from "../constants/styles.js";

function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-rose-100/80 bg-white/90 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-12">
      <a className="inline-flex min-w-0 items-center gap-2.5" href="#top" aria-label="Zenlove wedding">
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200/70 sm:size-11">
          <span className="absolute -right-3 -top-3 size-8 rounded-full bg-white/18" />
          <span className="absolute -bottom-4 -left-4 size-10 rounded-full bg-rose-700/18" />
          <span className="relative text-[24px] font-black italic leading-none tracking-[-0.12em] sm:text-[26px]">
            Z
          </span>
          <span className="absolute left-2.5 right-2.5 top-1/2 h-1 -translate-y-1/2 -rotate-12 rounded-full bg-white/75" />
        </span>
        <span className="min-w-0">
          <b className="block truncate text-base leading-none text-slate-950 sm:text-xl">
            Zenlove wedding
          </b>
          <small className="hidden text-[10px] uppercase tracking-wide text-slate-500 sm:block">
            Wedding Digital Studio
          </small>
        </span>
      </a>

      <nav className="hidden gap-7 font-bold text-slate-600 xl:flex" aria-label="Điều hướng chính">
        <a className="hover:text-rose-500" href="#services">Dịch vụ</a>
        <a className="hover:text-rose-500" href="#demo">Kho mẫu</a>
        <a className="hover:text-rose-500" href="#pricing">Bảng giá</a>
        <a className="hover:text-rose-500" href="#order">Đặt hàng</a>
      </nav>

      <a
        className={`${pillButton} min-h-10 shrink-0 bg-rose-500 px-3 text-sm text-white shadow-lg shadow-rose-200/80 hover:bg-rose-600 sm:px-6`}
        href="https://zalo.me/0335652868"
        target="_blank"
        rel="noreferrer"
      >
        Đặt ngay qua Zalo
      </a>
    </header>
  );
}

export default Header;
