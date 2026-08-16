import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Lock,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";
import { serviceDemoSections } from "../data/siteData.jsx";

const bucket = "wedding-showcase";
const safeName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-");

function AdminShowcase({ type }) {
  const isSlide = type === "slide";
  const label = isSlide ? "Slide cưới" : "Màn sao băng";
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const builtIn = (
    isSlide ? serviceDemoSections.video : serviceDemoSections.background
  ).groups
    .flatMap((group) => group.items)
    .map((item) => ({ ...item, source: "website" }));
  const displayedItems = [
    ...builtIn,
    ...items.map((item) => ({ ...item, source: "cloud" })),
  ];

  const load = async () => {
    const { data, error } = await supabase
      .from("showcase_templates")
      .select("*")
      .eq("type", type)
      .order("sort_order")
      .order("created_at");
    if (error) setMessage(error.message);
    else setItems(data || []);
  };
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (session) load();
  }, [session]);

  const add = async (event) => {
    event.preventDefault();
    if (!image || !url || !session)
      return setMessage("Chọn ảnh và dán link demo trước khi lưu.");
    setLoading(true);
    let path = "";
    try {
      path = `${session.user.id}/${type}/${Date.now()}-${safeName(image.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, image, {
          contentType: image.type,
          cacheControl: "31536000",
        });
      if (uploadError) throw uploadError;
      const { data: imageData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      const { error } = await supabase
        .from("showcase_templates")
        .insert({
          owner_id: session.user.id,
          type,
          title: title || `Mẫu ${displayedItems.length + 1}`,
          url,
          image_path: path,
          image_url: imageData.publicUrl,
          sort_order: items.length + 1,
        });
      if (error) throw error;
      event.target.reset();
      setTitle("");
      setUrl("");
      setImage(null);
      setShowAddForm(false);
      setMessage("Đã thêm mẫu.");
      await load();
    } catch (error) {
      if (path) await supabase.storage.from(bucket).remove([path]);
      setMessage(error.message || "Không thể thêm mẫu.");
    } finally {
      setLoading(false);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Xóa ${item.title}?`)) return;
    const { error } = await supabase
      .from("showcase_templates")
      .delete()
      .eq("id", item.id);
    if (error) return setMessage(error.message);
    await supabase.storage.from(bucket).remove([item.image_path]);
    await load();
  };

  if (!isSupabaseConfigured || !session)
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfafb] p-4">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <Lock className="mx-auto text-[#E54153]" />
          <p className="mt-3 font-extrabold">Hãy đăng nhập dashboard trước.</p>
        </div>
      </main>
    );
  return (
    <main className="admin-ui min-h-screen p-4 text-slate-800 sm:p-6">
      <section className="mx-auto max-w-6xl">
        <a
          className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-[#E54153]"
          href="/admin/dashboard"
        >
          <ArrowLeft size={17} />
          Dashboard
        </a>
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#E54153]">
              <ImagePlus size={24} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">
                Quản lý thư viện
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">{label}</h1>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#E54153] px-4 text-sm font-extrabold text-white"
            onClick={() => setShowAddForm((current) => !current)}
            type="button"
          >
            {showAddForm ? <X size={17} /> : <Plus size={17} />}
            {showAddForm ? "Đóng form" : "Thêm mẫu"}
          </button>
        </header>
        <div
          className={`mt-5 grid gap-5 ${showAddForm ? "lg:grid-cols-[340px_1fr]" : ""}`}
        >
          {showAddForm ? (
            <form
              className="h-fit rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
              onSubmit={add}
            >
              <h2 className="text-lg font-extrabold">Thêm mẫu mới</h2>
              <label className="mt-4 block text-sm font-bold">
                Tên mẫu
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-3 text-sm outline-none"
                  placeholder={`Mẫu ${displayedItems.length + 1}`}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="mt-4 block text-sm font-bold">
                Link demo
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-3 text-sm outline-none"
                  placeholder="https://drive.google.com/..."
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              </label>
              <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-[#fffafa] p-4 text-center">
                <Upload className="mb-2 text-[#E54153]" size={28} />
                <span className="text-sm font-extrabold">
                  Chọn ảnh đại diện
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  WebP, JPG hoặc PNG
                </span>
                <input
                  className="hidden"
                  accept="image/webp,image/jpeg,image/png"
                  type="file"
                  onChange={(event) =>
                    setImage(event.target.files?.[0] || null)
                  }
                />
              </label>
              {image ? (
                <p className="mt-2 truncate text-xs font-bold text-[#E54153]">
                  {image.name}
                </p>
              ) : null}
              {message ? (
                <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-[#E54153]">
                  {message}
                </p>
              ) : null}
              <button
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#E54153] text-sm font-extrabold text-white disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                <Plus size={16} />
                {loading ? "Đang lưu..." : "Thêm mẫu"}
              </button>
            </form>
          ) : null}
          <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Danh sách mẫu</h2>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-[#E54153]">
                {displayedItems.length} mẫu
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {displayedItems.map((item, index) => (
                <article
                  className="overflow-hidden rounded-2xl border border-rose-100"
                  key={item.id || `website-${index}`}
                >
                  <div className="relative">
                    <img
                      className="aspect-video w-full object-cover"
                      src={item.image_url || item.image}
                      alt={item.title}
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-[#E54153]">
                      {item.source === "website" ? "Đang hiển thị" : "Cloud"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <a
                      className="min-w-0 truncate text-sm font-extrabold hover:text-[#E54153]"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.title}
                    </a>
                    <div className="flex gap-1">
                      <a
                        className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#E54153]"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                      {item.source === "cloud" ? (
                        <button
                          className="grid size-8 place-items-center rounded-full bg-rose-50 text-[#E54153]"
                          onClick={() => remove(item)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminShowcase;
