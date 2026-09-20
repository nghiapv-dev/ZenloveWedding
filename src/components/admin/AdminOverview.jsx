import { useMemo, useState } from "react";
import { Bell, CalendarDays, ChevronDown, ClipboardList, Eye, LayoutDashboard, Music2, Search, Sparkles, Ticket, Video } from "lucide-react";

const SERVICES = [
  { key: "wedding", label: "Thiệp cưới", short: "Thiệp", color: "#f43f8f", tone: "pink", icon: Ticket },
  { key: "slide", label: "Slide cưới", short: "Slide", color: "#7c5ce5", tone: "violet", icon: Video },
  { key: "background", label: "Màn sao băng", short: "Màn sao", color: "#18bf87", tone: "green", icon: Sparkles },
  { key: "music", label: "Nhạc cưới", short: "Nhạc", color: "#f79a2e", tone: "orange", icon: Music2 },
];

const statusText = { new: "Mới nhận", working: "Đang làm", review: "Chờ duyệt", completed: "Hoàn thành" };
const statusClass = { new: "bg-blue-50 text-blue-600", working: "bg-orange-50 text-orange-600", review: "bg-violet-50 text-violet-600", completed: "bg-emerald-50 text-emerald-600" };
const money = (value) => `${Math.round(Number(value || 0)).toLocaleString("vi-VN")}đ`;
const serviceNames = (order) => Array.isArray(order.selected_services) && order.selected_services.length ? order.selected_services : order.package_name ? [order.package_name] : [];
const sourceName = (source) => source === "studio" ? "Studio" : source === "collaborator" ? "CTV" : "Khách hàng";

function AdminOverview({ orders, session, onNavigate, onOpenMenu }) {
  const [query, setQuery] = useState("");
  const [revenueMode, setRevenueMode] = useState("month");
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const availableYears = [...new Set([now.getFullYear(), ...orders.map((order) => order.created_at ? new Date(order.created_at).getFullYear() : null).filter(Boolean)])].sort((a, b) => b - a);
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Quản trị viên";
  const initial = userName.trim().slice(0, 2).toUpperCase();

  const data = useMemo(() => {
    const byService = Object.fromEntries(SERVICES.map((service) => [service.key, { count: 0, revenue: 0 }]));
    const months = Array.from({ length: 12 }, (_, index) => ({ label: `Tháng ${index + 1}`, values: Object.fromEntries(SERVICES.map((service) => [service.key, 0])) }));
    orders.forEach((order) => {
      const services = serviceNames(order).filter((service) => byService[service]);
      const selected = services.length ? services : [];
      const share = selected.length ? Number(order.total_amount || 0) / selected.length : 0;
      selected.forEach((service) => { byService[service].count += 1; byService[service].revenue += share; });
      const created = order.created_at ? new Date(order.created_at) : null;
      if (created && created.getFullYear() === selectedYear) selected.forEach((service) => { months[created.getMonth()].values[service] += 1; });
    });
    const totalRevenue = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
    return { byService, months, totalRevenue };
  }, [orders, selectedYear]);

  const summaryCards = [
    { label: "Tổng số đơn", value: orders.length, icon: ClipboardList, tone: "blue" },
    ...SERVICES.map((service) => ({ label: service.label, value: data.byService[service.key].count, icon: service.icon, tone: service.tone })),
    { label: "Tổng doanh thu", value: money(data.totalRevenue), icon: LayoutDashboard, tone: "blue", money: true },
  ];
  const latestOrders = orders.filter((order) => `${order.bride_name || ""} ${order.groom_name || ""} ${order.partner_name || ""}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const maxMonth = Math.max(...data.months.flatMap((item) => Object.values(item.values)), 1);
  const revenueOrders = orders.filter((order) => {
    const created = order.created_at ? new Date(order.created_at) : null;
    if (!created || created.getFullYear() !== selectedYear) return false;
    return revenueMode === "year" || created.getMonth() === selectedMonth;
  });
  const revenueByService = SERVICES.map((service) => ({
    ...service,
    value: Math.round(revenueOrders.reduce((total, order) => {
      const selected = serviceNames(order).filter((item) => SERVICES.some((candidate) => candidate.key === item));
      return selected.includes(service.key)
        ? total + Number(order.total_amount || 0) / selected.length
        : total;
    }, 0)),
  }));
  const revenueTotal = revenueByService.reduce((total, item) => total + item.value, 0);
  const donut = revenueByService.reduce((result, item) => { const start = result.total; const end = start + (revenueTotal ? (item.value / revenueTotal) * 100 : 0); return { total: end, css: [...result.css, `${item.color} ${start}% ${end}%`] }; }, { total: 0, css: [] }).css.join(", ") || "#dbeafe 0 100%";

  return <div className="admin-overview">
    <header className="admin-topbar">
      <button className="admin-menu-trigger lg:hidden" onClick={onOpenMenu} type="button">Menu</button>
      <label className="admin-search"><Search size={17} /><input onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm đơn hàng, khách hàng..." value={query} /><kbd>Ctrl K</kbd></label>
      <div className="admin-topbar__right"><span className="admin-date"><CalendarDays size={15} /> {revenueMode === "month" ? `Tháng ${selectedMonth + 1}, ${selectedYear}` : `Năm ${selectedYear}`}</span><button aria-label="Thông báo" className="admin-notification"><Bell size={20} /><i /></button><span className="admin-avatar">{initial}</span><div className="hidden xl:block"><strong>{userName}</strong><small>Quản trị viên</small></div><ChevronDown className="hidden xl:block" size={16} /></div>
    </header>

    <div className="admin-welcome"><div><h1>Tổng quan</h1><p>Chào mừng bạn trở lại! Cùng Zenlove tạo nên những khoảnh khắc đáng nhớ 💙</p></div><em>“Mỗi đơn hàng là một câu chuyện tình yêu.”</em></div>

    <section className="admin-summary-grid">{summaryCards.map((item) => { const Icon = item.icon; return <article className={`admin-summary-card admin-summary-card--${item.tone}`} key={item.label}><span className="admin-summary-icon"><Icon size={22} /></span><div><p>{item.label}</p><strong className={item.money ? "admin-money" : ""}>{item.value}</strong><small>Đơn hàng hiện có</small></div></article>; })}</section>

    <section className="admin-chart-grid">
      <article className="admin-panel admin-order-chart"><div className="admin-panel__heading"><span className="admin-panel-icon"><ClipboardList size={19} /></span><div><h2>Số lượng đơn theo tháng</h2><p>So sánh số lượng đơn theo từng dịch vụ</p></div><div className="admin-legend">{SERVICES.map((service) => <span key={service.key}><i style={{ background: service.color }} />{service.label}</span>)}</div></div><div className="admin-bars-chart">{data.months.map((item) => <div className="admin-month-group" key={item.label}><div className="admin-bars">{SERVICES.map((service) => <i key={service.key} style={{ background: service.color, height: `${Math.max((item.values[service.key] / maxMonth) * 116, item.values[service.key] ? 5 : 2)}px` }} title={`${service.label}: ${item.values[service.key]} đơn`} />)}</div><span>{item.label}</span></div>)}</div></article>
      <article className="admin-panel admin-revenue-chart"><div className="admin-panel__heading"><span className="admin-panel-icon"><LayoutDashboard size={19} /></span><div><h2>Doanh thu theo dịch vụ</h2><p>Tổng doanh thu từ các dịch vụ</p></div><select aria-label="Chọn năm" className="admin-period-select" onChange={(event) => setSelectedYear(Number(event.target.value))} value={selectedYear}>{availableYears.map((year) => <option key={year} value={year}>Năm {year}</option>)}</select>{revenueMode === "month" ? <select aria-label="Chọn tháng" className="admin-period-select" onChange={(event) => setSelectedMonth(Number(event.target.value))} value={selectedMonth}>{Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>Tháng {index + 1}</option>)}</select> : null}<div className="admin-toggle"><button className={revenueMode === "month" ? "is-active" : ""} onClick={() => setRevenueMode("month")} type="button">Tháng</button><button className={revenueMode === "year" ? "is-active" : ""} onClick={() => setRevenueMode("year")} type="button">Năm</button></div></div><div className="admin-revenue-total"><span>Doanh thu {revenueMode === "month" ? `tháng ${selectedMonth + 1}/${selectedYear}` : `năm ${selectedYear}`}</span><strong>{money(revenueTotal)}</strong></div><div className="admin-revenue-wave"><svg viewBox="0 0 500 160" preserveAspectRatio="none"><defs><linearGradient id="overview-revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#2563eb" stopOpacity=".32" /><stop offset="1" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs><path d="M0 129 C35 88 56 116 86 99 S138 111 168 71 S224 59 254 76 S310 64 340 100 S390 44 418 62 S466 83 500 70 L500 160 L0 160Z" fill="url(#overview-revenue-fill)" /><path d="M0 129 C35 88 56 116 86 99 S138 111 168 71 S224 59 254 76 S310 64 340 100 S390 44 418 62 S466 83 500 70" fill="none" stroke="#1565f5" strokeWidth="3" /></svg></div></article>
    </section>

    <section className="admin-service-revenue">{revenueByService.map((service) => { const Icon = service.icon; return <article key={service.key}><span className={`admin-service-icon admin-service-icon--${service.tone}`}><Icon size={21} /></span><div><p>Doanh thu {service.label}</p><strong>{money(service.value)}</strong></div><div className="ml-auto text-right"><b className="text-emerald-500">Phân bổ theo đơn</b><small>{revenueMode === "month" ? `Tháng ${selectedMonth + 1}/${selectedYear}` : `Năm ${selectedYear}`}</small></div></article>; })}</section>

    <section className="admin-bottom-grid">
      <article className="admin-panel admin-recent-orders"><div className="admin-panel__heading"><span className="admin-panel-icon"><CalendarDays size={19} /></span><div><h2>Đơn hàng gần đây</h2></div><button onClick={() => onNavigate?.("/admin/orders/customer")} type="button">Xem tất cả →</button></div><div className="admin-table-scroll"><table><thead><tr><th>#</th><th>Khách hàng</th><th>Dịch vụ</th><th>Ngày đặt</th><th>Giá trị</th><th>Trạng thái</th><th /></tr></thead><tbody>{latestOrders.map((order, index) => <tr key={order.id}><td>#{orders.length - index}</td><td>{order.bride_name || "Cô dâu"} &amp; {order.groom_name || "Chú rể"}</td><td>{serviceNames(order).map((service) => SERVICES.find((item) => item.key === service)?.short || service).join(" · ") || "—"}</td><td>{order.created_at ? new Intl.DateTimeFormat("vi-VN").format(new Date(order.created_at)) : "—"}</td><td>{money(order.total_amount)}</td><td><span className={`admin-status ${statusClass[order.status] || statusClass.new}`}>{statusText[order.status] || statusText.new}</span></td><td><button aria-label="Xem đơn" onClick={() => onNavigate?.(`/admin/orders/${order.order_source === "studio" ? "studio" : order.order_source === "collaborator" ? "collaborator" : "customer"}?order=${order.id}`)} type="button"><Eye size={16} /></button></td></tr>)}</tbody></table>{!latestOrders.length ? <p className="admin-empty">Không tìm thấy đơn hàng phù hợp.</p> : null}</div></article>
      <article className="admin-panel admin-revenue-share"><div className="admin-panel__heading"><span className="admin-panel-icon"><LayoutDashboard size={19} /></span><div><h2>Cơ cấu doanh thu theo dịch vụ</h2><p>{revenueMode === "month" ? `Tháng ${selectedMonth + 1}/${selectedYear}` : `Năm ${selectedYear}`}</p></div></div><div className="admin-donut-wrap"><div className="admin-donut" style={{ background: `conic-gradient(${donut})` }}><div><strong>{money(revenueTotal)}</strong><small>Tổng doanh thu</small></div></div><div className="admin-donut-list">{revenueByService.map((service) => <div key={service.key}><i style={{ background: service.color }} /><span>{service.label}</span><strong>{money(service.value)}</strong><b>{revenueTotal ? `${((service.value / revenueTotal) * 100).toFixed(1)}%` : "0%"}</b></div>)}</div></div></article>
    </section>
  </div>;
}

export default AdminOverview;
