import {
  CalendarHeart,
  CircleDollarSign,
  ClipboardList,
  Home,
  Music,
  Settings,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";

const orderLinks = [
  ["/admin/orders/customer", "Đơn khách hàng", "orders-customer", ClipboardList],
  ["/admin/orders/studio", "Đơn Studio", "orders-studio", ClipboardList],
  ["/admin/orders/collaborator", "Đơn CTV", "orders-collaborator", ClipboardList],
  ["/admin/orders/completed", "Đơn đã hoàn thành", "orders-completed", ClipboardList],
];

const contentLinks = [
  ["/admin/templates", "Thiệp cưới", "templates", CalendarHeart],
  ["/admin/slides", "Slide cưới", "slides", Video],
  ["/admin/music", "Nhạc cưới", "music", Music],
  ["/admin/backgrounds", "Màn sao băng", "backgrounds", Sparkles],
];

const systemLinks = [
  ["/admin/settings", "Cài đặt", "settings", Settings],
  ["/admin/users", "Người dùng", "users", Users],
];

function AdminSidebar({ activeView, isOpen, onClose, onNavigate }) {
  const navigate = (event, href) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(href);
    onClose();
  };
  const linkClass = (view, size = "h-9") =>
    `flex ${size} items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${activeView === view ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`;

  const renderLinks = (links) =>
    links.map(([href, label, view, Icon]) => (
      <a
        aria-current={activeView === view ? "page" : undefined}
        className={linkClass(view)}
        href={href}
        key={href}
        onClick={(event) => navigate(event, href)}
      >
        <Icon size={15} />
        {label}
      </a>
    ));

  return (
    <>
      {isOpen ? (
        <button
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[290px] max-w-[86vw] overflow-y-auto border border-blue-100 bg-white px-4 py-6 shadow-[0_12px_34px_rgba(37,99,235,0.16)] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-auto lg:max-w-none lg:translate-x-0 lg:rounded-[26px] lg:px-5 lg:shadow-[0_12px_34px_rgba(37,99,235,0.07)]`}
      >
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white">
              <CalendarHeart size={23} />
            </div>
            <div>
              <p className="font-serif text-xl font-bold tracking-wide text-blue-600">ZENLOVE</p>
              <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">WEDDING</p>
            </div>
          </div>
          <button aria-label="Đóng menu" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mt-9">
          <p className="px-3 text-[10px] font-extrabold tracking-wide text-slate-400">TRANG CHỦ</p>
          <a aria-current={activeView === "dashboard" ? "page" : undefined} className={`mt-2 flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-extrabold transition ${activeView === "dashboard" ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`} href="/admin/dashboard" onClick={(event) => navigate(event, "/admin/dashboard")}>
            <Home size={16} /> Tổng quan
          </a>
        </div>

        <nav className="mt-6">
          <p className="px-3 text-[10px] font-extrabold tracking-wide text-slate-400">QUẢN LÝ ĐƠN HÀNG</p>
          <div className="mt-2 grid gap-1">{renderLinks(orderLinks)}</div>
        </nav>

        <nav className="mt-5 border-t border-slate-100 pt-5">
          <p className="px-3 text-[10px] font-extrabold tracking-wide text-slate-400">NỘI DUNG</p>
          <div className="mt-2 grid gap-1">{renderLinks(contentLinks)}</div>
        </nav>

        <nav className="mt-5 border-t border-slate-100 pt-5">
          <p className="px-3 text-[10px] font-extrabold tracking-wide text-slate-400">HỆ THỐNG</p>
          <div className="mt-2 grid gap-1">{renderLinks(systemLinks)}</div>
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;
