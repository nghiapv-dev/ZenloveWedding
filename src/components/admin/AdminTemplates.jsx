import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  ImagePlus,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  isSupabaseConfigured,
  supabase,
  templatesBucket,
} from "../../lib/supabase.js";

function safeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

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
    <main className="min-h-screen bg-[#fff7f8] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]"
          onSubmit={submit}
        >
          <Lock className="text-rose-500" size={30} />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
            Zenlove Wedding Admin
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Quản lý mẫu thiệp</h1>
          <input
            className="mt-6 h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-sm font-bold outline-none"
            placeholder="Email admin"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="mt-3 h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-sm font-bold outline-none"
            placeholder="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {message ? (
            <p className="mt-3 text-sm font-bold text-rose-500">{message}</p>
          ) : null}
          <button
            className="mt-5 h-12 w-full rounded-full bg-rose-500 text-sm font-extrabold text-white"
            type="submit"
          >
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}

function SetupNotice() {
  return (
    <main className="min-h-screen bg-[#fff7f8] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <div className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]">
          <Lock className="mb-5 text-rose-500" size={30} />
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
            Cần cấu hình Supabase
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Kho mẫu chưa được kết nối
          </h1>
          <pre className="mt-5 rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-white">
            VITE_SUPABASE_URL=...{"\n"}VITE_SUPABASE_ANON_KEY=...{"\n"}
            VITE_SUPABASE_TEMPLATE_BUCKET=wedding-templates
          </pre>
        </div>
      </section>
    </main>
  );
}

function SchemaMissing() {
  return (
    <main className="min-h-screen bg-[#fffafa] px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center">
        <div className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)] sm:p-8">
          <div className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
            <Database size={28} />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#E54153]">
            Cần thiết lập một lần
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Kho mẫu thiệp chưa được tạo
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Supabase chưa có bảng{" "}
            <code className="rounded bg-rose-50 px-1.5 py-0.5 font-bold text-[#E54153]">
              wedding_templates
            </code>
            . Hãy chạy file SQL thiết lập rồi tải lại trang này.
          </p>
          <div className="mt-5 rounded-2xl border border-rose-100 bg-[#fffafa] p-4">
            <p className="text-sm font-extrabold">Trong Supabase SQL Editor</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-600">
              <li>Mở SQL Editor.</li>
              <li>
                Mở file <code>supabase-templates-setup.sql</code> trong dự án.
              </li>
              <li>Dán toàn bộ nội dung, bấm Run, sau đó refresh trang.</li>
            </ol>
          </div>
          <a
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-extrabold text-slate-700 transition hover:border-[#E54153] hover:text-[#E54153]"
            href="/admin/dashboard"
          >
            <ArrowLeft size={17} />
            Về dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
function AdminTemplates() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("visible");
  const [page, setPage] = useState(1);
  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("wedding_templates")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (
        error.code === "PGRST205" ||
        error.message?.includes("wedding_templates")
      ) {
        setSchemaMissing(true);
        return;
      }
      setMessage(error.message);
      return;
    }
    setTemplates(data || []);
  };
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setIsCheckingSession(false);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!isCheckingSession && !session) window.location.replace("/admin");
  }, [isCheckingSession, session]);
  useEffect(() => {
    if (session) loadTemplates();
  }, [session]);
  const addTemplate = async (event) => {
    event.preventDefault();
    if (!image || !url.trim() || !session?.user)
      return setMessage("Hãy chọn ảnh và dán link mẫu thiệp.");
    setLoading(true);
    setMessage("");
    let path = "";
    try {
      path =
        session.user.id + "/" + Date.now() + "-" + safeFileName(image.name);
      const { error: uploadError } = await supabase.storage
        .from(templatesBucket)
        .upload(path, image, {
          cacheControl: "31536000",
          contentType: image.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage
        .from(templatesBucket)
        .getPublicUrl(path);
      const { error: insertError } = await supabase
        .from("wedding_templates")
        .insert({
          owner_id: session.user.id,
          title: title.trim() || "Mẫu " + (templates.length + 36),
          url: url.trim(),
          image_path: path,
          image_url: publicData.publicUrl,
          sort_order: templates.length + 1,
          is_visible: true,
        });
      if (insertError) throw insertError;
      event.target.reset();
      setImage(null);
      setTitle("");
      setUrl("");
      setMessage("Đã thêm mẫu thiệp.");
      setShowAddForm(false);
      await loadTemplates();
    } catch (error) {
      if (path) await supabase.storage.from(templatesBucket).remove([path]);
      setMessage(error.message || "Không thể thêm mẫu.");
    } finally {
      setLoading(false);
    }
  };
  const deleteTemplate = async (item) => {
    if (!window.confirm("Xóa " + item.title + "?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("wedding_templates")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      if (item.image_path)
        await supabase.storage.from(templatesBucket).remove([item.image_path]);
      setMessage("Đã xóa mẫu.");
      await loadTemplates();
    } catch (error) {
      setMessage(error.message || "Không thể xóa mẫu.");
    } finally {
      setLoading(false);
    }
  };
  const toggleTemplateVisibility = async (item) => {
    const nextVisibility = item.is_visible === false;
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("wedding_templates")
        .update({ is_visible: nextVisibility })
        .eq("id", item.id);
      if (error) throw error;
      setTemplates((current) =>
        current.map((template) =>
          template.id === item.id
            ? { ...template, is_visible: nextVisibility }
            : template,
        ),
      );
      setMessage(
        nextVisibility
          ? "Đã hiển thị lại mẫu thiệp."
          : "Đã ẩn mẫu khỏi trang người dùng.",
      );
    } catch (error) {
      setMessage(
        error.message?.includes("is_visible")
          ? "Hãy chạy migration supabase-template-visibility-migration.sql trước."
          : error.message || "Không thể đổi trạng thái mẫu.",
      );
    } finally {
      setLoading(false);
    }
  };
  const normalizedQuery = query.trim().toLowerCase();
  const templatePositions = new Map(
    templates.map((item, index) => [item.id, index + 1]),
  );
  let visiblePosition = 0;
  const publicTemplateNumbers = new Map(
    templates.map((item) => [
      item.id,
      item.is_visible !== false ? ++visiblePosition : null,
    ]),
  );
  const filteredTemplates = templates.filter((item) => {
    const isVisible = item.is_visible !== false;
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && isVisible) ||
      (visibilityFilter === "hidden" && !isVisible);
    const templateNumber = publicTemplateNumbers.get(item.id);
    const matchesQuery =
      !normalizedQuery ||
      item.title?.toLowerCase().includes(normalizedQuery) ||
      (templateNumber && `mẫu ${templateNumber}`.includes(normalizedQuery)) ||
      (templateNumber && `mau ${templateNumber}`.includes(normalizedQuery));
    return matchesVisibility && matchesQuery;
  });
  const visibleCount = templates.filter((item) => item.is_visible !== false).length;
  const hiddenCount = templates.length - visibleCount;
  const templatesPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / templatesPerPage));
  const visibleTemplates = filteredTemplates.slice((Math.min(page, totalPages) - 1) * templatesPerPage, Math.min(page, totalPages) * templatesPerPage);
  const syncZenLoveTemplates = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/zenlove/templates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không thể đồng bộ ZenLove.");
      setMessage(`Đã đồng bộ ${result.synced} mẫu từ ZenLove.`);
      await loadTemplates();
    } catch (error) {
      setMessage(error.message || "Không thể đồng bộ ZenLove.");
    } finally {
      setLoading(false);
    }
  };
  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session) return null;
  if (schemaMissing) return <SchemaMissing />;
  return (
    <main className="admin-ui min-h-screen px-4 py-6 text-slate-950 sm:px-6">
      <section className="mx-auto w-full max-w-none">
        <a
          className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 transition hover:text-[#E54153]"
          href="/admin/dashboard"
        >
          <ArrowLeft size={17} />
          Dashboard
        </a>
        <header className="mb-5 flex items-center justify-between gap-3 rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_32px_rgba(229,65,83,0.08)]">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-500 text-white">
              <ImagePlus size={23} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Mẫu thiệp Zenlove</h1>
              <p className="mt-1 text-xs text-slate-500">
                {templates.length} mẫu · {visibleCount} đang hiển thị · {hiddenCount} đã ẩn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-sm font-bold text-slate-700"
              type="button"
              onClick={() => setShowAddForm((current) => !current)}
            >
              <Plus size={16} />
              {showAddForm ? "Đóng form" : "Thêm mẫu"}
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full bg-rose-500 px-4 text-sm font-bold text-white disabled:opacity-60"
              type="button"
              disabled={loading}
              onClick={syncZenLoveTemplates}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
              Đồng bộ ZenLove
            </button>
          </div>
        </header>
        <div className={`grid gap-4 ${showAddForm ? "lg:grid-cols-[370px_1fr]" : ""}`}>
          <form
            className={`h-fit rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_32px_rgba(229,65,83,0.08)] ${showAddForm ? "" : "hidden"}`}
            onSubmit={addTemplate}
          >
            <h2 className="text-lg font-extrabold">Thêm mẫu mới</h2>
            <label className="mt-4 block text-sm font-bold">Tên mẫu</label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-rose-50/50 px-3 text-sm outline-none"
              placeholder={"Mẫu " + (templates.length + 36)}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label className="mt-4 block text-sm font-bold">
              Link thiệp Zenlove
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-rose-50/50 px-3 text-sm outline-none"
              placeholder="https://zenlove.me/template-preview/..."
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-4 text-center">
              <Upload className="mb-2 text-rose-500" size={28} />
              <span className="text-sm font-extrabold">Chọn ảnh đại diện</span>
              <span className="mt-1 text-xs text-slate-500">
                WebP, JPG hoặc PNG
              </span>
              <input
                className="hidden"
                accept="image/webp,image/jpeg,image/png"
                type="file"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
            </label>
            {image ? (
              <p className="mt-2 truncate text-xs font-bold text-rose-500">
                {image.name}
              </p>
            ) : null}
            <button
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-extrabold text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              <Plus size={17} />
              {loading ? "Đang lưu..." : "Thêm mẫu thiệp"}
            </button>
          </form>
          <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_32px_rgba(229,65,83,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Danh sách mẫu</h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {[
                    ["all", "Tất cả"],
                    ["visible", "Đang hiện"],
                    ["hidden", "Đã ẩn"],
                  ].map(([value, label]) => (
                    <button
                      className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                        visibilityFilter === value
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      key={value}
                      onClick={() => {
                        setVisibilityFilter(value);
                        setPage(1);
                      }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="relative">
                  <input
                    className="h-10 w-48 rounded-xl border border-rose-100 bg-rose-50/50 px-3 text-sm outline-none sm:w-56"
                    placeholder="Tìm tên hoặc Mẫu 1..."
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                  />
                </label>
              </div>
            </div>
            {message ? (
              <p className="mb-4 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700">
                {message}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleTemplates.map((item) => {
                const templateNumber = publicTemplateNumbers.get(item.id);
                const templatePosition = templatePositions.get(item.id);
                const isVisible = item.is_visible !== false;
                return (
                <article
                  className={`group overflow-hidden rounded-2xl border bg-white transition ${
                    isVisible
                      ? "border-rose-100"
                      : "border-slate-200 opacity-75"
                  }`}
                  key={item.id}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-rose-50">
                    <img
                      className={`template-preview-image ${isVisible ? "" : "grayscale-[35%]"}`}
                      src={item.image_url}
                      alt={isVisible ? `Mẫu ${templateNumber}` : item.title}
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-blue-600 shadow-sm">
                      {isVisible ? `Mẫu ${templateNumber}` : `Vị trí ${templatePosition}`}
                    </span>
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm ${
                        isVisible
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {isVisible ? "Đang hiển thị" : "Đã ẩn"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <div className="min-w-0">
                      <a
                        className="block text-sm font-extrabold text-slate-900 hover:text-rose-500"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {isVisible ? `Mẫu ${templateNumber}` : "Mẫu đã ẩn"}
                      </a>
                      <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-500" title={item.title}>
                        {item.title}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        className={`grid size-8 place-items-center rounded-full transition ${
                          isVisible
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        type="button"
                        disabled={loading}
                        onClick={() => toggleTemplateVisibility(item)}
                        aria-label={isVisible ? "Ẩn mẫu" : "Hiển thị mẫu"}
                        title={isVisible ? "Ẩn khỏi trang người dùng" : "Hiển thị trên trang người dùng"}
                      >
                        {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <a
                        className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-500"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Mở mẫu"
                      >
                        <ExternalLink size={15} />
                      </a>
                      {item.source !== "zenlove" ? (
                        <button
                          className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-500"
                          type="button"
                          onClick={() => deleteTemplate(item)}
                          aria-label="Xóa mẫu"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
            {filteredTemplates.length > templatesPerPage ? (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button className="h-9 rounded-lg border border-rose-100 px-3 text-sm font-bold disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">←</button>
                <span className="text-sm font-bold text-slate-500">{Math.min(page, totalPages)} / {totalPages}</span>
                <button className="h-9 rounded-lg border border-rose-100 px-3 text-sm font-bold disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} type="button">→</button>
              </div>
            ) : null}
            {!filteredTemplates.length ? (
              <div className="rounded-2xl bg-rose-50 p-8 text-center text-sm font-bold text-slate-500">
                {query || visibilityFilter !== "all" ? "Không tìm thấy mẫu phù hợp." : "Chưa có mẫu cloud. Các mẫu hiện có trên web vẫn được giữ nguyên."}
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminTemplates;
