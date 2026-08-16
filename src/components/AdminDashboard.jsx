import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  History,
  Settings,
  Users,
  CalendarHeart,
  LayoutDashboard,
  Lock,
  LogOut,
  Music,
  Sparkles,
  Video,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";
import { serviceDemoSections, weddingTemplateGroups } from "../data/siteData.jsx";

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

const managementItems = [
  {
    title: "Quản lý thiệp",
    description: "Thêm ảnh, link và sắp xếp mẫu thiệp online.",
    icon: CalendarHeart,
    href: "/admin/templates",
    status: "Sẵn sàng",
    tone: "rose",
  },
  {
    title: "Quản lý nhạc",
    description: "Upload, phân loại và tải danh sách nhạc cưới.",
    icon: Music,
    href: "/admin/music",
    status: "Sẵn sàng",
    tone: "slate",
  },
  {
    title: "Màn sao băng",
    description: "Quản lý mẫu background sân khấu và link demo.",
    icon: Sparkles,
    href: "/admin/backgrounds",
    status: "Sẵn sàng",
    tone: "rose",
  },
  {
    title: "Slide cưới",
    description: "Quản lý ảnh đại diện và file demo slide cưới.",
    icon: Video,
    href: "/admin/slides",
    status: "Sẵn sàng",
    tone: "rose",
  },
];

function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [musicCount, setMusicCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [backgroundCount, setBackgroundCount] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const builtInTemplateCount = weddingTemplateGroups.flatMap((group) => group.items).length;
  const builtInBackgroundCount = serviceDemoSections.background.groups.flatMap((group) => group.items).length;
  const builtInSlideCount = serviceDemoSections.video.groups.flatMap((group) => group.items).length;

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
      const [music, templates, backgrounds, slides] = await Promise.all([
        supabase.from("music_tracks").select("id", { count: "exact", head: true }),
        supabase.from("wedding_templates").select("id", { count: "exact", head: true }),
        supabase.from("showcase_templates").select("id", { count: "exact", head: true }).eq("type", "background"),
        supabase.from("showcase_templates").select("id", { count: "exact", head: true }).eq("type", "slide"),
      ]);

      if (!music.error) setMusicCount(music.count || 0);
      if (!templates.error) setTemplateCount(templates.count || 0);
      if (!backgrounds.error) setBackgroundCount(backgrounds.count || 0);
      if (!slides.error) setSlideCount(slides.count || 0);
    };

    loadCounts();
  }, [session]);
  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session) return <Login onLogin={setSession} />;

  return (
    <main className="min-h-screen bg-[#fbfafb] p-3 text-slate-800 sm:p-5">
      <div className="mx-auto grid max-w-[1720px] gap-5 lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="rounded-[26px] border border-rose-100 bg-white px-4 py-6 shadow-[0_12px_34px_rgba(229,65,83,0.07)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:px-5">
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
              <a
                className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-[#E54153]"
                href="/admin/activity"
              >
                <History size={17} />
                Nhật ký hoạt động
              </a>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-rose-100 bg-[#fffafa] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white text-[#E54153] shadow-sm">
                <LayoutDashboard size={17} />
              </span>
              <div>
                <p className="text-xs font-extrabold">Tài khoản đang dùng</p>
                <p className="mt-1 max-w-[160px] truncate text-[11px] font-medium text-slate-500">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-white text-xs font-extrabold text-slate-600 transition hover:border-rose-300 hover:text-[#E54153]"
              onClick={() => supabase.auth.signOut()}
              type="button"
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </aside>

        <section className="min-w-0 py-2 sm:py-4">
          <header className="flex items-center justify-between gap-4 border-b border-rose-100 pb-5">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Xin chào, Admin <span className="text-base">👋</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Chào mừng bạn trở lại với Zenlove Wedding
              </p>
            </div>
          </header>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Tổng quan hệ thống
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi và cập nhật các sản phẩm của Zenlove Wedding.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-xl border border-rose-100 bg-white px-4 py-3 text-xs font-bold text-slate-600">
              <CalendarDays className="text-[#E54153]" size={18} />
              {formattedDate}
            </div>
          </div>
          <div className="mt-6 grid overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_10px_26px_rgba(229,65,83,0.06)] sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-4 border-b border-rose-100 p-5 sm:border-r xl:border-b-0">
              <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                <CalendarHeart size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">Thiệp cưới</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {templateCount || builtInTemplateCount}
                </p>
                <p className="text-xs text-slate-400">Mẫu đang hiển thị</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-b border-rose-100 p-5 xl:border-r xl:border-b-0">
              <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                <Music size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">Nhạc cưới</p>
                <p className="mt-1 text-2xl font-extrabold">{musicCount}</p>
                <p className="text-xs text-slate-400">Bài nhạc đã lưu</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-b border-rose-100 p-5 sm:border-r sm:border-b-0">
              <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                <Sparkles size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Màn sao băng
                </p>
                <p className="mt-1 text-2xl font-extrabold">{builtInBackgroundCount + backgroundCount}</p>
                <p className="text-xs text-slate-400">Mẫu background</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                <Video size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">Slide cưới</p>
                <p className="mt-1 text-2xl font-extrabold">{builtInSlideCount + slideCount}</p>
                <p className="text-xs text-slate-400">Mẫu slide</p>
              </div>
            </div>
          </div>
          <section className="relative mt-6 overflow-hidden rounded-3xl bg-[#E54153] p-6 text-white shadow-[0_16px_32px_rgba(229,65,83,0.18)] sm:p-8">
            <div className="relative z-10 max-w-xl">
              <p className="text-sm font-bold text-white/80">
                Trung tâm quản lý
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Mọi nội dung cưới, trong một nơi.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Chọn một khu vực bên dưới để cập nhật thư viện đang hiển thị
                trên website.
              </p>
            </div>
            <div className="relative z-10 mt-6 inline-block rounded-2xl bg-white p-5 text-slate-900 sm:absolute sm:right-8 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
              <p className="text-xs font-bold text-slate-500">
                Hạng mục sẵn sàng
              </p>
              <p className="mt-1 text-3xl font-extrabold">2 / 4</p>
              <p className="mt-1 text-xs text-slate-500">Hoàn thành 50%</p>
            </div>
            <span className="absolute -bottom-16 right-24 size-48 rounded-full border-[28px] border-white/10"></span>
            <span className="absolute right-5 top-4 text-7xl font-bold text-white/10">
              +
            </span>
          </section>
          <div className="mt-7">
            <h2 className="text-xl font-extrabold text-slate-900">
              Khu vực quản lý
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Đi vào từng thư viện để thêm và chỉnh sửa nội dung.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const available = Boolean(item.href);
                const content = (
                  <>
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
                      <Icon size={26} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-extrabold text-slate-900">
                          {item.title}
                        </h3>
                        <span
                          className={
                            available
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700"
                              : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700"
                          }
                        >
                          {available ? "Sẵn sàng" : "Đang chuẩn bị"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-extrabold text-[#E54153]">
                        Mở quản lý <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </>
                );
                return available ? (
                  <a
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition hover:border-rose-200 hover:shadow-[0_12px_24px_rgba(229,65,83,0.10)]"
                    href={item.href}
                    key={item.title}
                  >
                    {content}
                  </a>
                ) : (
                  <article
                    className="flex gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4"
                    key={item.title}
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          </div>
          <footer className="py-7 text-center text-xs font-medium text-slate-400">
            © 2025 Zenlove Wedding. All rights reserved.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
