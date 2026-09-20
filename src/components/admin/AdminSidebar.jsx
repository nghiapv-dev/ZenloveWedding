import {
  BarChart3,
  CalendarHeart,
  ClipboardList,
  Home,
  Music,
  Settings,
  Sparkles,
  Star,
  Users,
  Video,
  X,
} from "lucide-react";

const orderLinks = [
  [
    "/admin/orders/customer",
    "Đơn khách hàng",
    "orders-customer",
    ClipboardList,
  ],
  ["/admin/orders/studio", "Đơn Studio", "orders-studio", CalendarHeart],
  [
    "/admin/orders/collaborator",
    "Đơn CTV",
    "orders-collaborator",
    ClipboardList,
  ],
  [
    "/admin/orders/completed",
    "Đơn đã hoàn thành",
    "orders-completed",
    ClipboardList,
  ],
];
const contentLinks = [
  ["/admin/templates", "Thiệp cưới", "templates", CalendarHeart],
  ["/admin/slides", "Slide cưới", "slides", Video],
  ["/admin/music", "Nhạc cưới", "music", Music],
  ["/admin/backgrounds", "Màn sao băng", "backgrounds", Sparkles],
];
const systemLinks = [
  ["/admin/reviews", "Đánh giá khách hàng", "reviews", Star],
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
  const renderLinks = (links) =>
    links.map(([href, label, view, Icon]) => (
      <a
        aria-current={activeView === view ? "page" : undefined}
        className={`admin-sidebar-link ${activeView === view ? "is-active" : ""}`}
        href={href}
        key={href}
        onClick={(event) => navigate(event, href)}
      >
        <Icon size={16} />
        <span>{label}</span>
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
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-[250px] max-w-[86vw] overflow-y-auto bg-white transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0`}
      >
        <div className="admin-sidebar-brand">
          <span>
            <CalendarHeart size={21} />
          </span>
          <div>
            <strong>ZENLOVE</strong>
            <small>WEDDING</small>
          </div>
          <button
            aria-label="Đóng menu"
            className="ml-auto lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          <p>Trang chủ</p>
          <a
            aria-current={activeView === "dashboard" ? "page" : undefined}
            className={`admin-sidebar-link admin-sidebar-home ${activeView === "dashboard" ? "is-active" : ""}`}
            href="/admin/dashboard"
            onClick={(event) => navigate(event, "/admin/dashboard")}
          >
            <Home size={17} />
            <span>Tổng quan</span>
          </a>
          <p>Quản lý đơn hàng</p>
          <div>{renderLinks(orderLinks)}</div>
          <p>Quản lý nội dung</p>
          <div>{renderLinks(contentLinks)}</div>
          <p>Thống kê</p>
          <a className="admin-sidebar-link" href="/admin/dashboard">
            <BarChart3 size={16} />
            <span>Báo cáo doanh thu</span>
          </a>
          <p>Hệ thống</p>
          <div>{renderLinks(systemLinks)}</div>
        </nav>
        <div className="admin-sidebar-footer">
          <em>
            Create
            <br />
            Beautiful Moments
          </em>
          <span>♥</span>
          <small>© 2026 Zenlove Wedding</small>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
