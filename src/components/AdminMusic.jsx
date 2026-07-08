import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Lock,
  LogOut,
  Music,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

const DB_NAME = "zenlove-wedding-music";
const STORE_NAME = "songs";
const ADMIN_PIN = "0335652868";
const categories = ["Tất cả", "Nhạc lễ cưới", "Đón khách", "Nhạc slide", "Remix", "Nhẹ nhàng"];

function openMusicDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllSongs() {
  const db = await openMusicDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function saveSong(song) {
  const db = await openMusicDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(song);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteSong(id) {
  const db = await openMusicDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

function formatSize(size) {
  if (!size) return "0 MB";
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getNameWithoutExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
}

function AdminMusic() {
  const [isUnlocked, setIsUnlocked] = useState(
    () => sessionStorage.getItem("zenlove-music-admin") === "true",
  );
  const [pin, setPin] = useState("");
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [uploadCategory, setUploadCategory] = useState("Nhạc lễ cưới");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const objectUrls = useRef([]);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      const items = await getAllSongs();
      const withUrls = items
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((song) => {
          const url = URL.createObjectURL(song.blob);
          objectUrls.current.push(url);
          return { ...song, url };
        });
      setSongs(withUrls);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) loadSongs();

    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isUnlocked]);

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return songs.filter((song) => {
      const matchCategory = category === "Tất cả" || song.category === category;
      const matchQuery =
        !normalizedQuery ||
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.fileName.toLowerCase().includes(normalizedQuery) ||
        song.category.toLowerCase().includes(normalizedQuery);
      return matchCategory && matchQuery;
    });
  }, [songs, query, category]);

  const handleLogin = (event) => {
    event.preventDefault();
    if (pin.trim() !== ADMIN_PIN) {
      setMessage("Mã PIN chưa đúng.");
      return;
    }
    sessionStorage.setItem("zenlove-music-admin", "true");
    setIsUnlocked(true);
    setMessage("");
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("audio/"));
    if (!files.length) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        await saveSong({
          id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
          title: getNameWithoutExtension(file.name),
          category: uploadCategory,
          fileName: file.name,
          type: file.type || "audio/mpeg",
          size: file.size,
          blob: file,
          createdAt: Date.now(),
        });
      }
      event.target.value = "";
      setMessage(`Đã thêm ${files.length} bài nhạc vào kho nội bộ.`);
      await loadSongs();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (song) => {
    const confirmed = window.confirm(`Xóa bài "${song.title}" khỏi kho nhạc nội bộ?`);
    if (!confirmed) return;
    await deleteSong(song.id);
    setMessage("Đã xóa bài nhạc.");
    await loadSongs();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("zenlove-music-admin");
    setIsUnlocked(false);
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-[#fff7f8] px-4 py-8 text-slate-950">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
          <form
            className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]"
            onSubmit={handleLogin}
          >
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Lock size={26} />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">
              Zenlove Wedding Admin
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Kho nhạc cưới nội bộ</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Trang này không hiển thị cho khách. Nhập mã PIN để quản lý nhạc cưới dùng riêng.
            </p>
            <input
              className="mt-6 h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-base font-bold outline-none transition focus:border-rose-400 focus:bg-white"
              inputMode="numeric"
              onChange={(event) => setPin(event.target.value)}
              placeholder="Nhập mã PIN"
              type="password"
              value={pin}
            />
            {message ? <p className="mt-3 text-sm font-bold text-rose-500">{message}</p> : null}
            <button className="mt-5 h-12 w-full rounded-full bg-rose-500 text-sm font-extrabold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600">
              Mở kho nhạc
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_45%,#fff7f8_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_32px_rgba(229,65,83,0.08)] sm:p-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
              <Music size={24} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rose-500">
                Admin nội bộ
              </p>
              <h1 className="text-xl font-extrabold sm:text-2xl">Kho nhạc cưới Zenlove</h1>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} />
            Thoát
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_32px_rgba(229,65,83,0.08)] sm:p-5">
            <h2 className="text-lg font-extrabold">Thêm nhạc mới</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chọn file MP3 từ máy. File sẽ lưu trong trình duyệt này để bạn nghe, tải và chọn nhanh khi làm sản phẩm.
            </p>
            <label className="mt-5 block text-sm font-bold text-slate-700">Danh mục</label>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-sm font-bold outline-none focus:border-rose-400"
              onChange={(event) => setUploadCategory(event.target.value)}
              value={uploadCategory}
            >
              {categories.slice(1).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 px-4 text-center transition hover:border-rose-400 hover:bg-rose-50">
              <Upload className="mb-3 text-rose-500" size={30} />
              <span className="text-sm font-extrabold text-slate-900">Bấm để upload MP3</span>
              <span className="mt-1 text-xs text-slate-500">Có thể chọn nhiều bài cùng lúc</span>
              <input accept="audio/*" className="hidden" multiple onChange={handleUpload} type="file" />
            </label>
            {message ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {message}
              </p>
            ) : null}
          </aside>

          <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_12px_32px_rgba(229,65,83,0.08)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                <input
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-rose-50/50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-rose-400 focus:bg-white"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên bài, danh mục..."
                  value={query}
                />
              </label>
              <select
                className="h-12 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 text-sm font-bold outline-none focus:border-rose-400"
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
                {filteredSongs.length} bài
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
              {filteredSongs.map((song) => (
                <article
                  className="rounded-2xl border border-rose-100 bg-white p-3 shadow-[0_8px_20px_rgba(229,65,83,0.06)] sm:p-4"
                  key={song.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-950">{song.title}</h3>
                      <p className="mt-1 text-xs font-bold text-rose-500">{song.category}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {song.fileName} • {formatSize(song.size)}
                      </p>
                    </div>
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                      onClick={() => handleDelete(song)}
                      type="button"
                      aria-label={`Xóa ${song.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <audio className="mt-3 w-full" controls preload="metadata" src={song.url} />
                  <a
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600 sm:w-auto sm:px-5"
                    download={song.fileName}
                    href={song.url}
                  >
                    <Download size={16} />
                    Tải MP3
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default AdminMusic;
