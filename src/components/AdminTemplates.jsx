import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Database,
  ExternalLink,
  ImagePlus,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  isSupabaseConfigured,
  supabase,
  templatesBucket,
} from "../lib/supabase.js";

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
        });
      if (insertError) throw insertError;
      event.target.reset();
      setImage(null);
      setTitle("");
      setUrl("");
      setMessage("Đã thêm mẫu thiệp.");
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
  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session) return null;
  if (schemaMissing) return <SchemaMissing />;
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_45%,#fff7f8_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <section className="mx-auto max-w-6xl">
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
                {templates.length} mẫu cloud đang hiển thị trên website
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-100 px-4 text-sm font-bold text-slate-600"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut size={16} />
            Thoát
          </button>
        </header>
        <div className="grid gap-4 lg:grid-cols-[370px_1fr]">
          <form
            className="h-fit rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_32px_rgba(229,65,83,0.08)]"
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
            {message ? (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">
                {message}
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
            <h2 className="mb-4 text-lg font-extrabold">Danh sách mẫu</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {templates.map((item) => (
                <article
                  className="overflow-hidden rounded-2xl border border-rose-100"
                  key={item.id}
                >
                  <img
                    className="aspect-[3/4] w-full object-cover"
                    src={item.image_url}
                    alt={item.title}
                  />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <a
                      className="min-w-0 truncate text-sm font-extrabold text-slate-900 hover:text-rose-500"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.title}
                    </a>
                    <div className="flex shrink-0 gap-1">
                      <a
                        className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-500"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Mở mẫu"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-500"
                        type="button"
                        onClick={() => deleteTemplate(item)}
                        aria-label="Xóa mẫu"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!templates.length ? (
              <div className="rounded-2xl bg-rose-50 p-8 text-center text-sm font-bold text-slate-500">
                Chưa có mẫu cloud. Các mẫu hiện có trên web vẫn được giữ nguyên.
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminTemplates;
