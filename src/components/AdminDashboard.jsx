import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  Users,
  CalendarHeart,
  ClipboardList,
  LayoutDashboard,
  Lock,
  LogOut,
  Music,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";
import {
  serviceDemoSections,
  weddingTemplateGroups,
} from "../data/siteData.jsx";
import AdminTemplates from "./AdminTemplates.jsx";
import AdminMusic from "./AdminMusic.jsx";
import AdminShowcase from "./AdminShowcase.jsx";
import AdminSystem from "./AdminSystem.jsx";
import AdminContentManager from "./AdminContentManager.jsx";
import AdminOrders from "./AdminOrders.jsx";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setMessage("Email hoặc mật khẩu chưa đúng.");
    onLogin(data.session);
  };

  return (
    <main className="min-h-screen bg-[#fffafa] px-4 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]"
          onSubmit={submit}
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-[#E54153] text-white">
            <Lock size={26} />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#E54153]">
            Zenlove Wedding Admin
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Quản lý toàn bộ thư viện và sản phẩm của Zenlove Wedding.
          </p>
          <input
            className="mt-6 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-[#E54153]"
            placeholder="Email admin"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="mt-3 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-[#E54153]"
            placeholder="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {message ? (
            <p className="mt-3 text-sm font-bold text-[#E54153]">{message}</p>
          ) : null}
          <button
            className="mt-5 h-12 w-full rounded-xl bg-[#E54153] text-sm font-extrabold text-white transition hover:bg-[#c93345]"
            type="submit"
          >
            Vào dashboard
          </button>
        </form>
      </section>
    </main>
  );
}

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
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const builtInTemplateCount = weddingTemplateGroups.flatMap(
    (group) => group.items,
  ).length;
  const builtInBackgroundCount = serviceDemoSections.background.groups.flatMap(
    (group) => group.items,
  ).length;
  const builtInSlideCount = serviceDemoSections.video.groups.flatMap(
    (group) => group.items,
  ).length;
  const templateLibraryCount = templateCount || builtInTemplateCount;
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

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => setSession(currentSession),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

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
  if (!session) return <Login onLogin={setSession} />;
  const handleSidebarNavigation = (event) => {
    const link = event.target.closest("a[href^='/admin']");
    if (!link || !onNavigate) return;
    event.preventDefault();
    onNavigate(link.getAttribute("href"));
  };
  const workspace = {
    templates: <AdminTemplates />,
    orders: <AdminOrders />,
    music: <AdminMusic />,
    backgrounds: <AdminShowcase type="background" />,
    slides: <AdminShowcase type="slide" />,
    settings: <AdminContentManager />,
    users: <AdminSystem page="users" />,
  }[activeView];

  return (
    <main className="admin-ui min-h-screen p-3 text-slate-800 sm:p-5">
      <div className="mx-auto grid max-w-[1720px] gap-5 lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside
          onClick={handleSidebarNavigation}
          className="rounded-[26px] border border-rose-100 bg-white px-4 py-6 shadow-[0_12px_34px_rgba(229,65,83,0.07)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:px-5"
        >
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#E54153] text-white">
              <CalendarHeart size={23} />
            </div>
            <div>
              <p className="font-serif text-xl font-bold tracking-wide text-[#d83d50]">
                ZENLOVE
              </p>
              <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                WEDDING
              </p>
            </div>
          </div>
          <div className="mt-8">
            <p className="px-3 text-[11px] font-extrabold tracking-wide text-slate-400">
              TRANG CHỦ
            </p>
            <a
              className="mt-2 flex h-12 items-center gap-3 rounded-xl bg-[#E54153] px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(229,65,83,0.23)]"
              href="/admin/dashboard"
            >
              <Home size={18} />
              Tổng quan
            </a>
          </div>
          <div className="mt-7">
            <p className="px-3 text-[11px] font-extrabold tracking-wide text-slate-400">
              QUẢN TRỊ NỘI DUNG
            </p>
            <nav className="mt-2 grid gap-1">
              <a
                className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/templates"
              >
                <span className="flex items-center gap-3">
                  <CalendarHeart size={18} />
                  Thiệp cưới
                </span>
                <ChevronRight size={16} />
              </a>
              <a className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]" href="/admin/orders"><span className="flex items-center gap-3"><ClipboardList size={18} />Quản lý đơn khách</span><ChevronRight size={16} /></a>
              <a
                className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/music"
              >
                <span className="flex items-center gap-3">
                  <Music size={18} />
                  Nhạc cưới
                </span>
                <ChevronRight size={16} />
              </a>
              <a
                className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/backgrounds"
              >
                <span className="flex items-center gap-3">
                  <Sparkles size={18} />
                  Màn sao băng
                </span>
                <ChevronRight size={16} />
              </a>
              <a
                className="flex h-11 items-center justify-between rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/slides"
              >
                <span className="flex items-center gap-3">
                  <Video size={18} />
                  Slide cưới
                </span>
                <ChevronRight size={16} />
              </a>
            </nav>
          </div>
          <div className="mt-7 border-t border-rose-100 pt-5">
            <p className="px-3 text-[11px] font-extrabold tracking-wide text-slate-400">
              HỆ THỐNG
            </p>
            <div className="mt-2 grid gap-1">
              <a
                className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/settings"
              >
                <Settings size={17} />
                Cài đặt
              </a>
              <a
                className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/users"
              >
                <Users size={17} />
                Người dùng
              </a>
            </div>
          </div>
        </aside>

        <section className="min-w-0 py-2 sm:py-4">
          {activeView !== "dashboard" ? (
            <div className="admin-workspace">{workspace}</div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Xin chào, Admin <span className="text-base">👋</span>
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Chào mừng bạn trở lại với Zenlove Wedding
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-rose-100 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                    <CalendarDays className="text-[#E54153]" size={18} />
                    {formattedDate}
                  </div>
                  <button
                    className="relative grid size-11 place-items-center rounded-2xl border border-rose-100 bg-white text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                    type="button"
                    aria-label="Thông báo"
                  >
                    <Bell size={19} />
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#E54153] text-[9px] font-extrabold text-white">
                      3
                    </span>
                  </button>
                </div>
              </header>
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
                    <p className="text-xs text-slate-400">Mẫu đang hiển thị</p>
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
                    <p className="mt-1 text-2xl font-extrabold">{musicCount}</p>
                    <p className="text-xs text-slate-400">Bài nhạc đã lưu</p>
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
                        const [x, y] = chartPoints.split(" ")[index].split(",");
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
                    Biểu đồ lượt nhấp bắt đầu ghi nhận sau khi tính năng được
                    bật.
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
