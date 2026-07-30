import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Lock,
  LogOut,
  Music,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { isSupabaseConfigured, musicBucket, supabase } from "../lib/supabase.js";

const songsPerPage = 20;

const categories = [
  "Tất cả",
  "Nhạc đón khách",
  "Nhạc MC giới thiệu",
  "Nhạc chú rể lên sk",
  "Nhạc cô dâu chú rể lên sk",
  "Ba mẹ lên sk",
  "Nhạc trao nhẫn",
  "Nhạc cắt bánh & rót rượu",
  "Dâng rượu ba mẹ",
  "Nhạc khai tiệc",
];

function formatSize(size) {
  if (!size) return "0 MB";
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getNameWithoutExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
}

function safeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createSongUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(musicBucket)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

function SetupNotice() {
  return (
    <main className="min-h-screen bg-[#fff7f8] px-4 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <div className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]">
          <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Lock size={26} />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
            Cần cấu hình Supabase
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Kho nhạc cloud chưa được kết nối</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Thêm các biến môi trường dưới đây vào Vercel và file .env.local trên máy để bật upload nhạc lên cloud.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-white">
{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_MUSIC_BUCKET=wedding-music`}
          </pre>
        </div>
      </section>
    </main>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      setMessage("Email hoặc mật khẩu chưa đúng.");
      return;
    }

    onLogin(data.session);
  };

  return (
    <main className="min-h-screen bg-[#fff7f8] px-4 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]"
          onSubmit={handleSubmit}
        >
          <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Lock size={26} />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
            Zenlove Wedding Admin
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Kho nhạc cưới cloud</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Đăng nhập tài khoản admin Supabase để upload, nghe thử và tải nhạc cưới trên mọi thiết bị.
          </p>
          <input
            className="mt-6 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none transition focus:border-rose-400 focus:bg-white"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email admin"
            type="email"
            value={email}
          />
          <input
            className="mt-3 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none transition focus:border-rose-400 focus:bg-white"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu"
            type="password"
            value={password}
          />
          {message ? <p className="mt-3 text-sm font-bold text-rose-500">{message}</p> : null}
          <button className="mt-5 h-12 w-full rounded-xl bg-[#E54153] text-sm font-extrabold text-white shadow-lg shadow-rose-200 transition hover:bg-[#c93345] disabled:opacity-60" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Mở kho nhạc"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminMusic() {
  const [session, setSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadCategory, setUploadCategory] = useState(categories[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSongId, setEditingSongId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const loadSongs = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const withUrls = await Promise.all(
        (data || []).map(async (song) => ({
          ...song,
          url: await createSongUrl(song.storage_path),
        })),
      );

      setSongs(withUrls);
    } catch (error) {
      setMessage(error.message || "Không tải được danh sách nhạc.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsCheckingSession(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isCheckingSession && !session) window.location.replace("/admin");
  }, [isCheckingSession, session]);

  useEffect(() => {
    if (session) loadSongs();
  }, [session]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, category]);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return songs.filter((song) => {
      const matchCategory = category === "Tất cả" || song.category === category;
      const matchQuery =
        !normalizedQuery ||
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.file_name.toLowerCase().includes(normalizedQuery) ||
        song.category.toLowerCase().includes(normalizedQuery);
      return matchCategory && matchQuery;
    });
  }, [songs, query, category]);

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / songsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSongs = filteredSongs.slice(
    (safeCurrentPage - 1) * songsPerPage,
    safeCurrentPage * songsPerPage,
  );

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("audio/"),
    );
    if (!selectedFiles.length || !session?.user) return;

    const existingNames = new Set(songs.map((song) => song.file_name.toLowerCase()));
    const uploadNames = new Set();
    const duplicateFiles = [];
    const files = [];

    selectedFiles.forEach((file) => {
      const normalizedName = file.name.toLowerCase();
      if (existingNames.has(normalizedName) || uploadNames.has(normalizedName)) {
        duplicateFiles.push(file.name);
        return;
      }

      uploadNames.add(normalizedName);
      files.push(file);
    });

    if (!files.length) {
      event.target.value = "";
      setMessage(`Không upload: ${duplicateFiles.length} file đã trùng tên.`);
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      for (const file of files) {
        const storagePath = `${session.user.id}/${Date.now()}-${safeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(musicBucket)
          .upload(storagePath, file, {
            cacheControl: "31536000",
            contentType: file.type || "audio/mpeg",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("music_tracks").insert({
          owner_id: session.user.id,
          title: getNameWithoutExtension(file.name),
          category: uploadCategory,
          file_name: file.name,
          storage_path: storagePath,
          file_type: file.type || "audio/mpeg",
          file_size: file.size,
        });

        if (insertError) throw insertError;
      }

      event.target.value = "";
      const skippedText = duplicateFiles.length ? ` Bỏ qua ${duplicateFiles.length} file trùng tên.` : "";
      setMessage(`Đã upload ${files.length} bài nhạc lên cloud.${skippedText}`);
      await loadSongs();
    } catch (error) {
      setMessage(error.message || "Upload chưa thành công.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (song) => {
    const confirmed = window.confirm(`Xóa bài "${song.title}" khỏi kho nhạc cloud?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const { error: storageError } = await supabase.storage
        .from(musicBucket)
        .remove([song.storage_path]);
      if (storageError) throw storageError;

      const { error: tableError } = await supabase.from("music_tracks").delete().eq("id", song.id);
      if (tableError) throw tableError;

      setMessage("Đã xóa bài nhạc khỏi cloud.");
      await loadSongs();
    } catch (error) {
      setMessage(error.message || "Xóa chưa thành công.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (song) => {
    setEditingSongId(song.id);
    setDraftTitle(song.title);
    setMessage("");
  };

  const saveTitle = async (song) => {
    const title = draftTitle.trim();
    if (!title) {
      setMessage("Tên bài hát không được để trống.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("music_tracks").update({ title }).eq("id", song.id);
      if (error) throw error;
      setSongs((current) => current.map((item) => (item.id === song.id ? { ...item, title } : item)));
      setEditingSongId(null);
      setMessage("Đã cập nhật tên bài hát.");
    } catch (error) {
      setMessage(error.message || "Không thể cập nhật tên bài hát.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSongs([]);
  };

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#fffafa] px-3 py-4 text-slate-950 sm:px-6 sm:py-7 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <a className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 transition hover:text-[#E54153]" href="/admin/dashboard">
          <ArrowLeft size={17} />
          Dashboard
        </a>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_14px_36px_rgba(229,65,83,0.08)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#E54153] text-white shadow-[0_10px_22px_rgba(229,65,83,0.22)]">
              <Music size={24} />
            </div>
            <div>
          
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#E54153]">Zenlove Wedding / Admin</p><h1 className="mt-1 text-xl font-extrabold sm:text-2xl">Quản lý kho nhạc cưới</h1>
              <p className="mt-1 text-xs text-slate-500">Tài khoản: {session.user.email}</p>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} />
            Thoát
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-rose-100 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-500">Tổng bài nhạc</p><p className="mt-1 text-2xl font-extrabold">{songs.length}</p></div><div className="rounded-2xl border border-rose-100 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-500">Đang hiển thị</p><p className="mt-1 text-2xl font-extrabold">{filteredSongs.length}</p></div><div className="rounded-2xl border border-rose-100 bg-[#fff1f3] px-4 py-3"><p className="text-xs font-bold text-[#b92d3e]">Trạng thái kho</p><p className="mt-1 text-sm font-extrabold text-[#E54153]">Cloud đã kết nối</p></div></div>
        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_14px_36px_rgba(229,65,83,0.08)] sm:p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#E54153]">Thư viện âm thanh</p><h2 className="mt-1 text-lg font-extrabold">Thêm nhạc mới</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chọn file MP3 từ máy để tải lên
            </p>
            <label className="mt-5 block text-sm font-bold text-slate-700">Danh mục</label>
            <select
              className="mt-2 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-rose-400"
              onChange={(event) => setUploadCategory(event.target.value)}
              value={uploadCategory}
            >
              {categories.slice(1).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="mt-4 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-[#fffafa] px-4 text-center transition hover:border-rose-400 hover:bg-rose-50">
              <Upload className="mb-3 text-rose-500" size={30} />
              <span className="text-sm font-extrabold text-slate-900">Bấm để upload MP3 lên cloud</span>
              <span className="mt-1 text-xs text-slate-500">Có thể chọn nhiều bài cùng lúc</span>
              <input accept="audio/*" className="hidden" multiple onChange={handleUpload} type="file" />
            </label>
            {message ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {message}
              </p>
            ) : null}
          </aside>

          <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_14px_36px_rgba(229,65,83,0.08)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                <input
                  className="h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] pl-11 pr-4 text-sm font-semibold outline-none focus:border-rose-400 focus:bg-white"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên bài, danh mục..."
                  value={query}
                />
              </label>
              <select
                className="h-12 rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-rose-400"
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Danh sách nhạc</h2>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-500">
                {filteredSongs.length} bài • Trang {safeCurrentPage}/{totalPages}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {isLoading ? (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-slate-500">Đang xử lý...</div>
              ) : null}
              {!isLoading && !filteredSongs.length ? (
                <div className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/50 p-6 text-center">
                  <Plus className="mx-auto mb-3 text-rose-500" size={28} />
                  <p className="font-extrabold">Chưa có bài nhạc nào</p>
                  <p className="mt-1 text-sm text-slate-500">Upload MP3 ở khung bên trái để bắt đầu.</p>
                </div>
              ) : null}
              {paginatedSongs.map((song) => (
                <article
                  className="rounded-2xl border border-rose-100 bg-white p-3 shadow-[0_8px_20px_rgba(229,65,83,0.06)] sm:p-4"
                  key={song.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {editingSongId === song.id ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            className="h-10 min-w-0 flex-1 rounded-xl border border-rose-200 bg-rose-50/50 px-3 text-sm font-bold outline-none focus:border-rose-400"
                            onChange={(event) => setDraftTitle(event.target.value)}
                            value={draftTitle}
                          />
                          <div className="flex gap-2">
                            <button className="h-10 rounded-xl bg-rose-500 px-3 text-sm font-extrabold text-white disabled:opacity-50" disabled={isLoading} onClick={() => saveTitle(song)} type="button">Lưu</button>
                            <button className="h-10 rounded-xl border border-rose-100 px-3 text-sm font-extrabold text-slate-600" onClick={() => setEditingSongId(null)} type="button">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="break-words font-extrabold text-slate-950">{song.title}</h3>
                      )}
                      <p className="mt-1 text-xs font-bold text-rose-500">{song.category}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {song.file_name} • {formatSize(song.file_size)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {editingSongId !== song.id ? <button className="inline-flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white" onClick={() => startEditing(song)} type="button" aria-label={`Sửa tên ${song.title}`}><Pencil size={16} /></button> : null}
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                        onClick={() => handleDelete(song)}
                        type="button"
                        aria-label={`Xóa ${song.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <audio className="mt-3 w-full" controls preload="metadata" src={song.url} />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <a
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#E54153] px-5 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-[#c93345]"
                      download={song.file_name}
                      href={song.url}
                    >
                      <Download size={16} />
                      Tải MP3
                    </a>
                    <a
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 px-5 text-sm font-extrabold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                      href={song.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                      Mở link tạm
                    </a>
                  </div>
                </article>
              ))}
              {filteredSongs.length > songsPerPage ? (
                <div className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-[#fffafa] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-sm font-bold text-slate-500 sm:text-left">
                    Hiển thị {(safeCurrentPage - 1) * songsPerPage + 1}-
                    {Math.min(safeCurrentPage * songsPerPage, filteredSongs.length)} trong {filteredSongs.length} bài
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      className="h-10 rounded-xl border border-rose-100 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:border-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      Trước
                    </button>
                    <button
                      className="h-10 rounded-xl bg-[#E54153] px-4 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-[#c93345] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminMusic;






