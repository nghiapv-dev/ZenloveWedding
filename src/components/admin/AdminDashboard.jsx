import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  BarChart3,
  CalendarDays,
  CircleCheckBig,
  ChevronDown,
  ChevronRight,
  CalendarHeart,
  ClipboardList,
  Clock3,
  Lock,
  ListTodo,
  Menu,
  Music,
  Plus,
  Sparkles,
  TrendingUp,
  Video,
  WalletCards,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";
import {
  clearAdminSession,
  isAdminSessionExpired,
  remainingAdminSessionMs,
  startAdminSession,
} from "../../lib/adminSession.js";
import { serviceDemoSections } from "../../data/siteData.jsx";
import AdminTemplates from "./AdminTemplates.jsx";
import AdminMusic from "./AdminMusic.jsx";
import AdminShowcase from "./AdminShowcase.jsx";
import AdminSystem from "./AdminSystem.jsx";
import AdminContentManager from "./AdminContentManager.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminLogin from "./AdminLogin.jsx";
import AdminReviews from "./AdminReviews.jsx";
import AdminOverview from "./AdminOverview.jsx";

const orderStatusLabels = {
  new: "Mới nhận",
  working: "Đang làm",
  review: "Chờ duyệt",
  completed: "Hoàn thành",
};
const orderStatusStyles = {
  new: "bg-blue-50 text-blue-600",
  working: "bg-amber-50 text-amber-600",
  review: "bg-violet-50 text-violet-600",
  completed: "bg-emerald-50 text-emerald-600",
};
const statusLabels = orderStatusLabels;
const statusStyles = orderStatusStyles;

function SetupNotice() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffafa] p-4">
      <div className="max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]">
        <Lock className="text-[#E54153]" size={30} />
        <h1 className="mt-4 text-2xl font-extrabold">Chưa kết nối Supabase</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY để bật dashboard quản
          trị.
        </p>
      </div>
    </main>
  );
}

function AdminDashboard({ activeView = "dashboard", onNavigate }) {
  const [session, setSession] = useState(null);
  const [musicCount, setMusicCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [backgroundCount, setBackgroundCount] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [clickStats, setClickStats] = useState({
    wedding: 0,
    video: 0,
    background: 0,
  });
  const [recentClicks, setRecentClicks] = useState([]);
  const [rangeDays, setRangeDays] = useState(7);
  const [periodClicks, setPeriodClicks] = useState({
    today: 0,
    week: 0,
    month: 0,
  });
  const [topTemplates, setTopTemplates] = useState([]);
  const [dashboardOrders, setDashboardOrders] = useState([]);
  const [orderTaskTab, setOrderTaskTab] = useState("all");
  const [orderTrendDays, setOrderTrendDays] = useState(7);
  const [orderTrendMetric, setOrderTrendMetric] = useState("count");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const builtInBackgroundCount = serviceDemoSections.background.groups.flatMap(
    (group) => group.items,
  ).length;
  const builtInSlideCount = serviceDemoSections.video.groups.flatMap(
    (group) => group.items,
  ).length;
  const templateLibraryCount = templateCount;
  const backgroundLibraryCount = builtInBackgroundCount + backgroundCount;
  const slideLibraryCount = builtInSlideCount + slideCount;
  const clickComparison = [
    { label: "Thiệp cưới", value: clickStats.wedding, color: "#2563eb" },
    { label: "Slide cưới", value: clickStats.video, color: "#0ea5e9" },
    { label: "Màn sao băng", value: clickStats.background, color: "#38bdf8" },
  ];
  const totalClicks = clickComparison.reduce(
    (total, item) => total + item.value,
    0,
  );
  const highestClickCount = Math.max(
    ...clickComparison.map((item) => item.value),
    1,
  );
  const contentStats = [
    { label: "Thiệp cưới", value: templateLibraryCount, color: "#2563eb" },
    { label: "Nhạc cưới", value: musicCount, color: "#0ea5e9" },
    { label: "Màn sao băng", value: backgroundLibraryCount, color: "#38bdf8" },
    { label: "Slide cưới", value: slideLibraryCount, color: "#7dd3fc" },
  ];
  const totalContent = contentStats.reduce(
    (total, item) => total + item.value,
    0,
  );
  const templateShare = totalContent
    ? (templateLibraryCount / totalContent) * 100
    : 0;
  const musicShare = totalContent ? (musicCount / totalContent) * 100 : 0;
  const backgroundShare = totalContent
    ? (backgroundLibraryCount / totalContent) * 100
    : 0;
  const chartDays = Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      value: 0,
    };
  });
  recentClicks.forEach((click) => {
    const day = chartDays.find(
      (item) => item.key === click.created_at.slice(0, 10),
    );
    if (day) day.value += 1;
  });
  const highestDailyClicks = Math.max(
    ...chartDays.map((item) => item.value),
    1,
  );
  const chartPoints = chartDays
    .map((item, index) => {
      const x = 40 + (index * 620) / Math.max(chartDays.length - 1, 1);
      const y = 170 - (item.value / highestDailyClicks) * 120;
      return `${x},${y}`;
    })
    .join(" ");
  const chartArea = `40,180 ${chartPoints} 660,180`;
  const chartLabelStep = Math.max(1, Math.ceil(chartDays.length / 7));
  const todayKey = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const threeDaysLaterKey = (() => {
    const date = new Date(`${todayKey}T00:00:00`);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString("en-CA");
  })();
  const orderSummary = dashboardOrders.reduce(
    (summary, order) => {
      const totalAmount = Number(order.total_amount || 0);
      const paidAmount = order.payment_status === "paid"
        ? totalAmount
        : Number(order.deposit_amount || 0);
      summary.total += 1;
      summary[order.status || "new"] += 1;
      summary.receivable += Math.max(totalAmount - paidAmount, 0);
      summary.totalAmount += totalAmount;
      summary.depositAmount += paidAmount;
      return summary;
    },
    { total: 0, new: 0, working: 0, review: 0, completed: 0, receivable: 0, totalAmount: 0, depositAmount: 0 },
  );
  const orderTaskTabs = [
    { id: "all", label: "Tất cả" },
    { id: "overdue", label: "Quá hạn" },
    { id: "today", label: "Hôm nay" },
    { id: "soon", label: "≤3 ngày" },
    { id: "review", label: "Chờ duyệt" },
    { id: "new", label: "Mới nhận" },
  ];
  const deadlineMeta = (deadline) => {
    if (!deadline)
      return {
        label: "Chưa đặt deadline",
        className: "bg-slate-100 text-slate-500",
        priority: 5,
      };
    const days = Math.round(
      (new Date(`${deadline}T00:00:00`).getTime() -
        new Date(`${todayKey}T00:00:00`).getTime()) /
        86400000,
    );
    if (days < 0)
      return {
        label: `Quá hạn ${Math.abs(days)} ngày`,
        className: "bg-rose-50 text-rose-600",
        priority: 0,
      };
    if (days === 0)
      return {
        label: "Hôm nay",
        className: "bg-orange-50 text-orange-600",
        priority: 1,
      };
    if (days <= 3)
      return {
        label: `Còn ${days} ngày`,
        className: "bg-amber-50 text-amber-700",
        priority: 2,
      };
    return {
      label: `Còn ${days} ngày`,
      className: "bg-blue-50 text-blue-600",
      priority: 3,
    };
  };
  const actionablePriority = (order) => {
    const deadlinePriority = deadlineMeta(
      order.expected_delivery_date,
    ).priority;
    if (deadlinePriority <= 2) return deadlinePriority;
    if (order.status === "review") return 3;
    if (order.status === "new") return 4;
    return 5;
  };
  const actionableOrders = dashboardOrders
    .filter((order) => {
      const deadline = order.expected_delivery_date;
      if (order.status === "completed") return false;
      if (orderTaskTab === "review") return order.status === "review";
      if (orderTaskTab === "new") return order.status === "new";
      if (!deadline) return orderTaskTab === "all";
      if (orderTaskTab === "overdue") return deadline < todayKey;
      if (orderTaskTab === "today") return deadline === todayKey;
      if (orderTaskTab === "soon")
        return deadline >= todayKey && deadline <= threeDaysLaterKey;
      return true;
    })
    .sort((a, b) => {
      const priorityDifference = actionablePriority(a) - actionablePriority(b);
      return (
        priorityDifference ||
        (a.expected_delivery_date || "9999").localeCompare(
          b.expected_delivery_date || "9999",
        )
      );
    })
    .slice(0, 6);
  const trendSources = [
    { label: "Khách hàng", key: "customer", color: "#2563eb", dot: "bg-blue-600" },
    { label: "Studio", key: "studio", color: "#10b981", dot: "bg-emerald-500" },
    { label: "CTV", key: "collaborator", color: "#7c3aed", dot: "bg-violet-600" },
  ];
  const orderTrend = Array.from({ length: orderTrendDays }, (_, index) => {
    const date = new Date(`${todayKey}T00:00:00`);
    date.setDate(date.getDate() - (orderTrendDays - 1 - index));
    const key = date.toLocaleDateString("en-CA");
    const ordersForDay = dashboardOrders.filter(
      (order) => order.created_at?.slice(0, 10) === key,
    );
    return {
      key,
      label: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      ...Object.fromEntries(trendSources.map((source) => [
        source.key,
        ordersForDay.filter((order) => (order.order_source || "customer") === source.key).reduce(
          (total, order) => total + (orderTrendMetric === "value" ? Number(order.total_amount || 0) : 1),
          0,
        ),
      ])),
    };
  });
  const highestOrderTrend = Math.max(...orderTrend.flatMap((item) => trendSources.map((source) => item[source.key])), 1);
  const sourceOrderCounts = trendSources.map((source) => ({
    ...source,
    value: dashboardOrders.filter(
      (order) => (order.order_source || "customer") === source.key,
    ).length,
  }));
  const sourceOrderTotal = sourceOrderCounts.reduce((total, source) => total + source.value, 0);
  const sourceOrderValue = dashboardOrders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
  const sourcePercentages = sourceOrderCounts.map((source) => ({ ...source, percent: sourceOrderTotal ? Math.round((source.value / sourceOrderTotal) * 100) : 0 }));
  const donutStops = sourcePercentages.reduce((stops, source) => {
    const start = stops.total;
    const end = start + source.percent;
    return { total: end, css: [...stops.css, `${source.color} ${start}% ${end}%`] };
  }, { total: 0, css: [] }).css.join(", ") || "#e2e8f0 0% 100%";

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setSession(null);

      if (isAdminSessionExpired()) {
        clearAdminSession();
        await supabase.auth.signOut();
        return setSession(null);
      }

      setSession(data.session);
    };

    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!currentSession) {
          clearAdminSession();
          return setSession(null);
        }

        if (event === "SIGNED_IN") startAdminSession();
        if (isAdminSessionExpired()) {
          clearAdminSession();
          await supabase.auth.signOut();
          return setSession(null);
        }

        setSession(currentSession);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return undefined;

    const logoutWhenExpired = async () => {
      clearAdminSession();
      await supabase.auth.signOut();
      setSession(null);
    };
    const timeout = window.setTimeout(
      logoutWhenExpired,
      remainingAdminSessionMs(),
    );
    const checkWhenReturning = () => {
      if (document.visibilityState === "visible" && isAdminSessionExpired())
        logoutWhenExpired();
    };

    document.addEventListener("visibilitychange", checkWhenReturning);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", checkWhenReturning);
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const loadDashboardOrders = async () => {
      const { data, error } = await supabase
        .from("customer_orders")
        .select(
          "id, bride_name, groom_name, selected_services, package_name, wedding_date, expected_delivery_date, total_amount, deposit_amount, payment_status, status, order_source, partner_name, created_at",
        )
        .order("created_at", { ascending: false });
      if (!error) setDashboardOrders(data || []);
    };
    loadDashboardOrders();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const loadCounts = async () => {
      const rangeStart = new Date();
      rangeStart.setHours(0, 0, 0, 0);
      rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 6);
      const monthStart = new Date(todayStart);
      monthStart.setDate(monthStart.getDate() - 29);
      const [
        music,
        templates,
        backgrounds,
        slides,
        clicks,
        today,
        week,
        month,
        templateEvents,
      ] = await Promise.all([
        supabase
          .from("music_tracks")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("wedding_templates")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("showcase_templates")
          .select("id", { count: "exact", head: true })
          .eq("type", "background"),
        supabase
          .from("showcase_templates")
          .select("id", { count: "exact", head: true })
          .eq("type", "slide"),
        supabase
          .from("content_clicks")
          .select("category, created_at")
          .gte("created_at", rangeStart.toISOString()),
        supabase
          .from("content_clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", todayStart.toISOString()),
        supabase
          .from("content_clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekStart.toISOString()),
        supabase
          .from("content_clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("content_clicks")
          .select("template_key, template_name, category")
          .gte("created_at", monthStart.toISOString())
          .not("template_key", "is", null),
      ]);

      if (!music.error) setMusicCount(music.count || 0);
      if (!templates.error) setTemplateCount(templates.count || 0);
      if (!backgrounds.error) setBackgroundCount(backgrounds.count || 0);
      if (!slides.error) setSlideCount(slides.count || 0);
      if (!clicks.error) {
        const events = clicks.data || [];
        const nextStats = events.reduce(
          (stats, event) => ({
            ...stats,
            [event.category]: (stats[event.category] || 0) + 1,
          }),
          { wedding: 0, video: 0, background: 0 },
        );
        setRecentClicks(events);
        setClickStats(nextStats);
      }
      if (!today.error && !week.error && !month.error)
        setPeriodClicks({
          today: today.count || 0,
          week: week.count || 0,
          month: month.count || 0,
        });
      if (!templateEvents.error) {
        const grouped = (templateEvents.data || []).reduce((result, event) => {
          const key = event.template_key;
          const current = result.get(key) || {
            key,
            name: event.template_name || "Mẫu chưa đặt tên",
            category: event.category,
            clicks: 0,
          };
          current.clicks += 1;
          result.set(key, current);
          return result;
        }, new Map());
        setTopTemplates(
          [...grouped.values()]
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 10),
        );
      }
    };

    loadCounts();
  }, [session, rangeDays]);
  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session)
    return (
      <AdminLogin
        onLogin={(nextSession) => {
          startAdminSession();
          setSession(nextSession);
        }}
      />
    );
  if (activeView === "dashboard")
    return (
      <main className="admin-ui min-h-screen text-slate-800">
        <div className="admin-shell mx-auto grid max-w-[1920px] lg:grid-cols-[246px_minmax(0,1fr)]">
          <AdminSidebar activeView={activeView} isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onNavigate={onNavigate} />
          <AdminOverview orders={dashboardOrders} session={session} onNavigate={onNavigate} onOpenMenu={() => setMobileNavOpen(true)} />
        </div>
      </main>
    );
  const workspace = {
    templates: <AdminTemplates />,
    "orders-all": <AdminOrders scope="all" />,
    "orders-customer": <AdminOrders scope="customer" />,
    "orders-studio": <AdminOrders scope="studio" />,
    "orders-collaborator": <AdminOrders scope="collaborator" />,
    "orders-completed": <AdminOrders scope="completed" />,
    music: <AdminMusic />,
    backgrounds: <AdminShowcase type="background" />,
    slides: <AdminShowcase type="slide" />,
    settings: <AdminContentManager />,
    users: <AdminSystem />,
    reviews: <AdminReviews />,
  }[activeView];

  return (
    <main className="admin-ui min-h-screen text-slate-800">
      <div className="admin-shell admin-shell--workspace mx-auto grid max-w-[1920px] lg:grid-cols-[246px_minmax(0,1fr)]">
        <AdminSidebar activeView={activeView} isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onNavigate={onNavigate} />

        <section className="admin-workspace-page min-w-0 p-3 sm:p-5 lg:p-7">
          <button
            className="mb-4 inline-flex h-11 items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <Menu size={19} />
            Menu quản trị
          </button>
          {activeView !== "dashboard" ? (
            <div className="admin-workspace">{workspace}</div>
          ) : (
            <>
              <section className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Tổng quan</h1>
                  <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200" type="button"><CalendarDays className="text-blue-600" size={15} />Hôm nay: {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())}<ChevronDown size={14} /></button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  {[
                    { label: "Tổng số đơn", value: orderSummary.total, icon: ClipboardList, tone: "bg-blue-50 text-blue-600", note: "Tổng đơn hiện có" },
                    { label: "Mới nhận", value: orderSummary.new, icon: BriefcaseBusiness, tone: "bg-emerald-50 text-emerald-600", note: "Cần bắt đầu xử lý" },
                    { label: "Đang làm", value: orderSummary.working, icon: Sparkles, tone: "bg-amber-50 text-amber-600", note: "Đang thực hiện" },
                    { label: "Chờ khách duyệt", value: orderSummary.review, icon: Clock3, tone: "bg-violet-50 text-violet-600", note: "Đang chờ phản hồi" },
                    { label: "Đã hoàn thành", value: orderSummary.completed, icon: CircleCheckBig, tone: "bg-emerald-50 text-emerald-600", note: "Đơn đã xử lý xong" },
                  ].map((item) => { const Icon = item.icon; return <article className="min-h-36 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]" key={item.label}><div className="flex items-start gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.tone}`}><Icon size={20} /></span><div><p className="text-[11px] font-bold text-slate-500">{item.label}</p><strong className="mt-1 block text-2xl font-extrabold tracking-tight text-slate-800">{item.value}</strong></div></div><p className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600"><TrendingUp size={13} />{item.note}</p></article>; })}
                  <article className="min-h-36 rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500"><WalletCards size={20} /></span><div><p className="text-[11px] font-bold text-slate-500">Còn phải thu</p><strong className="mt-1 block text-xl font-extrabold tracking-tight text-slate-800">{orderSummary.receivable.toLocaleString("vi-VN")}đ</strong></div></div><div className="mt-3 space-y-1 text-[11px] font-bold"><p className="flex justify-between text-slate-500"><span>Tổng tiền đơn</span><span>{orderSummary.totalAmount.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between text-slate-500"><span>Đã thu</span><span>{orderSummary.depositAmount.toLocaleString("vi-VN")}đ</span></p><p className="flex justify-between border-t border-rose-100 pt-1 text-rose-500"><span>Còn phải thu</span><span>{orderSummary.receivable.toLocaleString("vi-VN")}đ</span></p></div></article>
                </div>
              </section>

              <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600">
                      Cần xử lý
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      Các đơn cần theo dõi
                    </h2>
                  </div>
                  <button
                    className="text-sm font-extrabold text-blue-600 hover:text-blue-800"
                    onClick={() =>
                      onNavigate?.(`/admin/orders?task=${orderTaskTab}`)
                    }
                    type="button"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                  {orderTaskTabs.map((tab) => (
                    <button
                      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold transition ${orderTaskTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-blue-50"}`}
                      key={tab.id}
                      onClick={() => setOrderTaskTab(tab.id)}
                      type="button"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="py-3 pr-4">Cặp đôi</th>
                        <th className="px-4 py-3">Nguồn</th>
                        <th className="px-4 py-3">Dịch vụ</th>
                        <th className="px-4 py-3">Deadline</th>
                        <th className="py-3 pl-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionableOrders.map((order) => {
                        const deadline = deadlineMeta(
                          order.expected_delivery_date,
                        );
                        const orderPath =
                          order.order_source === "studio"
                            ? "/admin/orders/studio"
                            : order.order_source === "collaborator"
                              ? "/admin/orders/collaborator"
                              : "/admin/orders/customer";
                        return (
                          <tr
                            className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/60 last:border-0"
                            key={order.id}
                            onClick={() =>
                              onNavigate?.(`${orderPath}?order=${order.id}`)
                            }
                          >
                            <td className="py-4 pr-4 font-extrabold text-slate-800">
                              {order.bride_name || "Cô dâu"} &amp;{" "}
                              {order.groom_name || "Chú rể"}
                            </td>
                            <td className="px-4 py-4 text-sm font-bold text-slate-600">
                              {order.order_source === "studio"
                                ? "Studio"
                                : order.order_source === "collaborator"
                                  ? "CTV"
                                  : "Khách hàng"}
                              {order.partner_name
                                ? ` · ${order.partner_name}`
                                : ""}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">
                              {Array.isArray(order.selected_services) &&
                              order.selected_services.length
                                ? order.selected_services
                                    .map(
                                      (item) =>
                                        ({
                                          wedding: "Thiệp",
                                          slide: "Slide",
                                          background: "Màn sao",
                                          music: "Nhạc",
                                        })[item] || item,
                                    )
                                    .join(" · ")
                                : order.package_name || "—"}
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-bold text-slate-700">
                                {order.expected_delivery_date
                                  ? new Intl.DateTimeFormat("vi-VN", {
                                      dateStyle: "medium",
                                      timeZone: "UTC",
                                    }).format(
                                      new Date(
                                        `${order.expected_delivery_date}T00:00:00Z`,
                                      ),
                                    )
                                  : "Chưa đặt"}
                              </p>
                              <span
                                className={`mt-1 inline-flex rounded-md px-2 py-1 text-[11px] font-extrabold ${deadline.className}`}
                              >
                                {deadline.label}
                              </span>
                            </td>
                            <td className="py-4 pl-4">
                              <span
                                className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold ${statusStyles[order.status] || statusStyles.new}`}
                              >
                                {statusLabels[order.status] || "Mới nhận"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!actionableOrders.length ? (
                    <p className="py-10 text-center text-sm font-bold text-slate-400">
                      Không có đơn cần xử lý trong nhóm này.
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-slate-800">Xu hướng đơn hàng</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">Số lượng đơn theo thời gian và nguồn đơn</p>
                  </div>
                  <div className="flex flex-wrap gap-3"><div className="flex rounded-lg bg-slate-50 p-1">
                    {[7, 30].map((days) => (
                      <button
                        className={`rounded-md px-3 py-1.5 text-xs font-extrabold ${orderTrendDays === days ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "text-slate-500"}`}
                        key={days}
                        onClick={() => setOrderTrendDays(days)}
                        type="button"
                      >
                        {days} ngày
                      </button>
                    ))}
                  </div><div className="flex rounded-lg bg-slate-50 p-1">{[["count", "Số lượng đơn"], ["value", "Giá trị đơn"]].map(([value, label]) => <button className={`rounded-md px-3 py-1.5 text-xs font-extrabold ${orderTrendMetric === value ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "text-slate-500"}`} key={value} onClick={() => setOrderTrendMetric(value)} type="button">{label}</button>)}</div></div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500">{trendSources.map((source) => <span className="inline-flex items-center gap-1.5" key={source.key}><i className={`size-2 rounded-full ${source.dot}`} />{source.label}</span>)}</div>
                <div className="mt-2 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]"><div className="min-w-0 overflow-x-auto"><svg aria-label="Biểu đồ xu hướng đơn hàng" className="h-56 min-w-[620px] w-full" role="img" viewBox="0 0 620 220"><g stroke="#e2e8f0" strokeWidth="1">{[30, 70, 110, 150, 190].map((y) => <line key={y} x1="40" x2="605" y1={y} y2={y} />)}</g>{[0, 1, 2, 3, 4].map((tick) => <text fill="#94a3b8" fontSize="10" key={tick} textAnchor="end" x="31" y={193 - tick * 40}>{Math.round((highestOrderTrend / 4) * tick)}</text>)}{trendSources.map((source) => { const points = orderTrend.map((item, index) => { const x = 42 + (index * 560) / Math.max(orderTrend.length - 1, 1); const y = 190 - (item[source.key] / highestOrderTrend) * 155; return `${x},${y}`; }).join(" "); return <g key={source.key}><polyline fill="none" points={points} stroke={source.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />{orderTrend.map((item, index) => { const x = 42 + (index * 560) / Math.max(orderTrend.length - 1, 1); const y = 190 - (item[source.key] / highestOrderTrend) * 155; return <g key={`${source.key}-${item.key}`}><circle cx={x} cy={y} fill="white" r="3" stroke={source.color} strokeWidth="2" />{item[source.key] ? <text fill={source.color} fontSize="10" fontWeight="700" textAnchor="middle" x={x} y={y - 9}>{orderTrendMetric === "value" ? `${Math.round(item[source.key] / 1000)}k` : item[source.key]}</text> : null}</g>; })}</g>; })}{orderTrend.map((item, index) => <text fill="#64748b" fontSize="10" fontWeight="600" key={item.key} textAnchor="middle" x={42 + (index * 560) / Math.max(orderTrend.length - 1, 1)} y="212">{item.label}</text>)}</svg></div><aside className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center gap-4"><div className="relative grid size-17 place-items-center rounded-full" style={{ background: `conic-gradient(${donutStops})` }}><span className="grid size-11 place-items-center rounded-full bg-white text-xs font-extrabold text-slate-700">{sourceOrderTotal}</span></div><div><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Tổng {orderTrendDays} ngày qua</p><p className="mt-1 text-sm font-extrabold text-slate-800">Phân bổ nguồn đơn</p></div></div><div className="mt-4 space-y-3">{sourcePercentages.map((source) => <div className="flex items-center justify-between text-xs" key={source.key}><span className="flex items-center gap-2 font-bold text-slate-600"><i className={`size-2 rounded-full ${source.dot}`} />{source.label}</span><span className="font-extrabold text-slate-800">{source.value} <span className="font-medium text-slate-400">đơn</span> <b className="ml-2 text-blue-600">{source.percent}%</b></span></div>)}</div><div className="mt-4 grid grid-cols-2 border-t border-slate-200 pt-3 text-xs"><div><p className="font-medium text-slate-400">Tổng số đơn</p><strong className="mt-1 block text-base text-slate-800">{sourceOrderTotal} đơn</strong></div><div className="border-l border-slate-200 pl-4"><p className="font-medium text-slate-400">Tổng giá trị đơn</p><strong className="mt-1 block text-base text-slate-800">{sourceOrderValue.toLocaleString("vi-VN")}đ</strong></div></div></aside></div>
              </section>
              {false ? (
                <>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                      <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                        <CalendarHeart size={26} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Thiệp cưới
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                          {templateLibraryCount}
                        </p>
                        <p className="text-xs text-slate-400">
                          Mẫu đang hiển thị
                        </p>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                      <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                        <Music size={26} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Nhạc cưới
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                          {musicCount}
                        </p>
                        <p className="text-xs text-slate-400">
                          Bài nhạc đã lưu
                        </p>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                      <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                        <Sparkles size={26} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Màn sao băng
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                          {backgroundLibraryCount}
                        </p>
                        <p className="text-xs text-slate-400">Mẫu background</p>
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                      <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                        <Video size={26} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Slide cưới
                        </p>
                        <p className="mt-1 text-2xl font-extrabold">
                          {slideLibraryCount}
                        </p>
                        <p className="text-xs text-slate-400">Mẫu slide</p>
                      </div>
                    </div>
                  </div>
                  <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.55fr)]">
                    <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                            Tương tác khách hàng
                          </p>
                          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                            Lượt nhấp xem mẫu
                          </h2>
                        </div>
                        <label className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-slate-600">
                          <CalendarDays className="text-[#E54153]" size={15} />
                          <select
                            className="appearance-none border-0 bg-transparent p-0 pr-4 text-xs font-extrabold outline-none"
                            value={rangeDays}
                            onChange={(event) =>
                              setRangeDays(Number(event.target.value))
                            }
                          >
                            <option value={7}>7 ngày qua</option>
                            <option value={30}>30 ngày qua</option>
                            <option value={90}>90 ngày qua</option>
                          </select>
                          <ChevronDown
                            className="-ml-5 pointer-events-none"
                            size={14}
                          />
                        </label>
                      </div>
                      <div className="mt-5 overflow-x-auto">
                        <svg
                          className="h-60 min-w-[620px] w-full"
                          viewBox="0 0 700 220"
                          role="img"
                          aria-label="Biểu đồ lượt nhấp 7 ngày qua"
                        >
                          {[50, 90, 130, 170].map((y) => (
                            <line
                              key={y}
                              x1="40"
                              x2="660"
                              y1={y}
                              y2={y}
                              stroke="#e6eff8"
                              strokeWidth="1"
                            />
                          ))}
                          <polygon points={chartArea} fill="url(#click-fill)" />
                          <polyline
                            points={chartPoints}
                            fill="none"
                            stroke="#2563eb"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="4"
                          />
                          {chartDays.map((item, index) => {
                            const [x, y] = chartPoints
                              .split(" ")
                              [index].split(",");
                            const showLabel =
                              index === 0 ||
                              index === chartDays.length - 1 ||
                              index % chartLabelStep === 0;
                            return (
                              <g key={item.key}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  fill="#fff"
                                  r="6"
                                  stroke="#2563eb"
                                  strokeWidth="3"
                                />
                                {showLabel ? (
                                  <text
                                    x={x}
                                    y="207"
                                    textAnchor="middle"
                                    fill="#71839a"
                                    fontSize="11"
                                    fontWeight="700"
                                  >
                                    {item.label}
                                  </text>
                                ) : null}
                              </g>
                            );
                          })}
                          <defs>
                            <linearGradient
                              id="click-fill"
                              x1="0"
                              x2="0"
                              y1="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#2563eb"
                                stopOpacity="0.22"
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563eb"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="mt-2 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50/70 p-3">
                        {clickComparison.map((item) => (
                          <div className="px-3" key={item.label}>
                            <p className="text-xs font-bold text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-1 text-xl font-extrabold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <aside className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                        Phân bổ nội dung
                      </p>
                      <div className="mt-5 flex items-center gap-5">
                        <div
                          className="grid size-28 shrink-0 place-items-center rounded-full"
                          style={{
                            background: `conic-gradient(#2563eb 0 ${templateShare}%, #0ea5e9 ${templateShare}% ${templateShare + musicShare}%, #38bdf8 ${templateShare + musicShare}% ${templateShare + musicShare + backgroundShare}%, #7dd3fc ${templateShare + musicShare + backgroundShare}% 100%)`,
                          }}
                        >
                          <div className="grid size-20 place-items-center rounded-full bg-white text-center">
                            <strong className="text-xl text-slate-900">
                              {totalContent}
                            </strong>
                            <span className="-mt-2 text-[10px] font-bold text-slate-400">
                              TỔNG
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-2 text-xs font-bold text-slate-600">
                          {contentStats.map((item) => (
                            <div
                              className="flex items-center gap-2"
                              key={item.label}
                            >
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                        Biểu đồ lượt nhấp bắt đầu ghi nhận sau khi tính năng
                        được bật.
                      </p>
                    </aside>
                  </section>
                  <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                        So sánh lượt xem
                      </p>
                      <div className="mt-5 grid gap-3">
                        {[
                          { label: "Hôm nay", value: periodClicks.today },
                          { label: "7 ngày qua", value: periodClicks.week },
                          { label: "30 ngày qua", value: periodClicks.month },
                        ].map((item) => (
                          <div
                            className="flex items-center justify-between rounded-2xl bg-rose-50/50 px-4 py-3"
                            key={item.label}
                          >
                            <span className="text-sm font-bold text-slate-600">
                              {item.label}
                            </span>
                            <strong className="text-2xl text-slate-900">
                              {item.value}
                            </strong>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-xs leading-5 text-slate-500">
                        Lượt nhấp được tính từ khách mở mẫu trên website.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                            Top mẫu được xem
                          </p>
                          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                            Top 10 trong 30 ngày
                          </h2>
                        </div>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-[#E54153]">
                          {topTemplates.length} mẫu
                        </span>
                      </div>
                      {topTemplates.length ? (
                        <ol className="mt-4 grid divide-y divide-slate-100">
                          {topTemplates.map((item, index) => (
                            <li
                              className="flex items-center gap-3 py-3"
                              key={item.key}
                            >
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-sm font-extrabold text-[#E54153]">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-extrabold text-slate-800">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {item.category === "wedding"
                                    ? "Thiệp cưới"
                                    : item.category === "video"
                                      ? "Slide cưới"
                                      : "Màn sao băng"}
                                </p>
                              </div>
                              <strong className="text-sm text-slate-900">
                                {item.clicks} lượt
                              </strong>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-rose-50/50 p-6 text-center text-sm font-bold text-slate-500">
                          Chưa có lượt xem theo từng mẫu.
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="mt-5 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                          Thao tác nhanh
                        </p>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                          Cập nhật thư viện
                        </h2>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Thêm thiệp cưới",
                          href: "/admin/templates",
                          icon: CalendarHeart,
                        },
                        {
                          label: "Thêm nhạc cưới",
                          href: "/admin/music",
                          icon: Music,
                        },
                        {
                          label: "Thêm màn sao băng",
                          href: "/admin/backgrounds",
                          icon: Sparkles,
                        },
                        {
                          label: "Thêm slide cưới",
                          href: "/admin/slides",
                          icon: Video,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            className="group flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 transition hover:-translate-y-0.5 hover:border-rose-300"
                            href={item.href}
                            key={item.href}
                          >
                            <span className="grid size-10 place-items-center rounded-xl bg-white text-[#E54153] shadow-sm">
                              <Icon size={20} />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-extrabold text-slate-800">
                              {item.label}
                            </span>
                            <Plus
                              className="text-[#E54153] transition group-hover:rotate-90"
                              size={18}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </section>
                </>
              ) : null}
              <footer className="py-7 text-center text-xs font-medium text-slate-400">
                © 2026 Zenlove Wedding. All rights reserved.
              </footer>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
