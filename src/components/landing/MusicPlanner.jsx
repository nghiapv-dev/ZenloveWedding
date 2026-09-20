import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CakeSlice, Check, ClipboardList, Download, GripVertical, Heart, Music2, PartyPopper, Plus, RefreshCw, Sparkles, Trophy, UserRound, UsersRound } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";
import { sectionClass } from "../../constants/styles.js";

const moments = [
  { id: "welcome", label: "Nhạc đón khách", desc: "Tạo không khí ấm cúng ngay từ đầu", category: "Nhạc đón khách", icon: UsersRound },
  { id: "mc", label: "Nhạc MC giới thiệu", desc: "Trang trọng, cuốn hút", category: "Nhạc MC giới thiệu", icon: Music2 },
  { id: "couple", label: "Cô dâu chú rể lên sân khấu", desc: "Khoảnh khắc đáng nhớ", category: "Nhạc cô dâu chú rể lên sk", icon: Heart },
  { id: "rings", label: "Trao nhẫn", desc: "Lãng mạn, cảm xúc", category: "Nhạc trao nhẫn", icon: Trophy },
  { id: "cake", label: "Cắt bánh & rót rượu", desc: "Vui tươi, rộn ràng", category: "Nhạc cắt bánh & rót rượu", icon: CakeSlice },
  { id: "toast", label: "Dâng rượu ba mẹ", desc: "Trang trọng, ý nghĩa", category: "Dâng rượu ba mẹ", icon: UserRound },
  { id: "opening", label: "Khai tiệc", desc: "Sôi động, vui vẻ", category: "Nhạc khai tiệc", icon: PartyPopper },
  { id: "groom", label: "Chú rể lên sân khấu", desc: "Tự tin, nổi bật", category: "Nhạc chú rể lên sk", icon: Sparkles },
];
const defaultMomentIds = ["welcome", "couple", "rings", "cake", "opening"];

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function hasSongForMoment(song, moment) {
  if (!moment.category) return true;
  const category = normalize(song.category || "");
  const expected = normalize(moment.category);
  if (moment.id === "groom" && category.includes("co dau")) return false;
  return category === expected || category.includes(expected.replace("nhac ", ""));
}

function MusicPlanner() {
  const [songs, setSongs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(defaultMomentIds);
  const [playlist, setPlaylist] = useState(null);
  const [status, setStatus] = useState("loading");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [customMoments, setCustomMoments] = useState([]);
  const [customMomentName, setCustomMomentName] = useState("");
  const [addingMoment, setAddingMoment] = useState(false);
  const [draggingMomentId, setDraggingMomentId] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("unavailable");
      return undefined;
    }
    let alive = true;
    supabase.rpc("get_music_suggestions").then(({ data, error }) => {
      if (!alive) return;
      if (error) return setStatus("unavailable");
      setSongs(data || []);
      setStatus("ready");
    });
    return () => { alive = false; };
  }, []);

  const allMoments = useMemo(() => [...moments, ...customMoments], [customMoments]);
  const selectedMoments = useMemo(() => allMoments.filter((moment) => selectedIds.includes(moment.id)), [allMoments, selectedIds]);
  const orderedMoments = useMemo(() => [...selectedMoments, ...allMoments.filter((moment) => !selectedIds.includes(moment.id))], [allMoments, selectedIds, selectedMoments]);
  const toggleMoment = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setPlaylist(null);
    setCopied(false);
    setStep(1);
  };
  const addCustomMoment = () => {
    const label = customMomentName.trim();
    if (!label) return;
    const id = `custom-${Date.now()}`;
    setCustomMoments((current) => [...current, { id, label, desc: "ZenLove gợi ý từ toàn bộ kho nhạc", category: "", icon: Sparkles }]);
    setSelectedIds((current) => [...current, id]);
    setCustomMomentName("");
    setAddingMoment(false);
    setStep(1);
  };
  const moveMoment = (targetId) => {
    if (!draggingMomentId || draggingMomentId === targetId) return;
    setSelectedIds((current) => {
      const from = current.indexOf(draggingMomentId);
      const to = current.indexOf(targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      next.splice(from, 1);
      next.splice(to, 0, draggingMomentId);
      return next;
    });
    setDraggingMomentId(null);
    setPlaylist(null);
    setStep(1);
  };
  const createPlaylist = () => {
    const next = selectedMoments.flatMap((moment) => songs.filter((song) => hasSongForMoment(song, moment)).slice(0, 3).map((song) => ({ ...song, moment: moment.label })));
    setPlaylist(next);
    setCopied(false);
    setStep(2);
  };
  const reset = () => { setSelectedIds(defaultMomentIds); setPlaylist(null); setCopied(false); setCustomMoments([]); setCustomMomentName(""); setAddingMoment(false); setStep(1); };
  const copyPlaylist = async () => {
    if (!playlist?.length) return;
    await navigator.clipboard.writeText(playlist.map((song, index) => `${index + 1}. ${song.title} — ${song.moment}`).join("\n"));
    setCopied(true);
    setStep(3);
  };

  return <section className={`${sectionClass} music-planner-redesign`} id="music-planner">
    <div className="mx-auto max-w-[1450px]">
      <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.35em] text-rose-500">Music for a better love story</p><h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#281c1d] sm:text-4xl lg:text-5xl">Tạo playlist nhạc cưới chỉ trong vài phút</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Chọn những khoảnh khắc quan trọng, Zenlove sẽ gợi ý những bài hát phù hợp nhất để ngày cưới của bạn thêm trọn vẹn.</p><span className="music-planner-heart">♡</span></div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.28fr_1fr]">
        <div className="music-planner-card overflow-hidden">
          <div className="music-planner-steps"><div className={step >= 1 ? "is-active" : ""}><b>1</b><span><strong>Chọn khoảnh khắc</strong><small>Chọn các hạng mục bạn cần</small></span></div><i>→</i><div className={step >= 2 ? "is-active" : ""}><b>2</b><span><strong>Gợi ý bài hát</strong><small>Zenlove đề xuất phù hợp</small></span></div><i>→</i><div className={step >= 3 ? "is-active" : ""}><b>3</b><span><strong>Lưu playlist</strong><small>Tải về hoặc chỉnh sửa</small></span></div></div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="music-planner-section-icon"><Music2 size={21} /></span><div><h3>Các khoảnh khắc trong lễ cưới</h3><p>Chọn những khoảnh khắc bạn muốn, chúng tôi sẽ gợi ý nhạc phù hợp</p></div></div><span className="hidden rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-500 sm:inline">Chọn nhanh</span></div>
            <p className="mt-4 text-xs font-semibold text-slate-400">Kéo thả các khoảnh khắc đã chọn để sắp xếp thứ tự playlist.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{orderedMoments.map((moment) => { const Icon = moment.icon; const checked = selectedIds.includes(moment.id); return <button className={`music-moment ${checked ? "is-selected" : ""} ${draggingMomentId === moment.id ? "is-dragging" : ""}`} draggable={checked} key={moment.id} onClick={() => toggleMoment(moment.id)} onDragEnd={() => setDraggingMomentId(null)} onDragOver={(event) => { if (checked && draggingMomentId) event.preventDefault(); }} onDragStart={() => setDraggingMomentId(moment.id)} onDrop={(event) => { event.preventDefault(); moveMoment(moment.id); }} type="button"><span className="music-moment-check">{checked ? <Check size={14} /> : null}</span>{checked ? <GripVertical className="music-moment-grip" size={16} /> : null}<Icon size={27} /><strong>{moment.label}</strong><small>{moment.desc}</small></button>; })}</div>
            {addingMoment ? <div className="mt-3 flex gap-2"><input autoFocus className="h-10 min-w-0 flex-1 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold outline-none focus:border-rose-400" onChange={(event) => setCustomMomentName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCustomMoment(); }} placeholder="Ví dụ: Cô dâu và ba lên sân khấu" value={customMomentName} /><button className="rounded-xl bg-rose-500 px-4 text-sm font-extrabold text-white" onClick={addCustomMoment} type="button">Thêm</button></div> : <button className="music-add-moment" onClick={() => setAddingMoment(true)} type="button"><Plus size={16} />Thêm khoảnh khắc khác</button>}
            <div className="mt-6 border-t border-rose-100 pt-5"><div className="flex items-center gap-3"><span className="music-planner-section-icon"><BadgeCheck size={20} /></span><div><h3>Tùy chỉnh phong cách nhạc</h3><p>Zenlove sẽ ưu tiên các bài phù hợp với không khí buổi tiệc</p></div></div><div className="mt-4 flex flex-wrap gap-2">{["Pop", "Ballad", "Acoustic", "EDM", "R&B", "Không lời", "Nhạc Việt", "Nhạc Quốc Tế"].map((style, index) => <span className={`music-style ${index === 0 ? "is-active" : ""}`} key={style}>{index === 0 ? "✓ " : ""}{style}</span>)}</div></div>
            <div className="mt-6 flex flex-wrap gap-3"><button className="music-create-button" disabled={!selectedIds.length || status !== "ready"} onClick={createPlaylist} type="button"><Sparkles size={18} />Gợi ý danh sách nhạc ngay <span>→</span></button><button className="music-reset-button" onClick={reset} type="button"><RefreshCw size={17} />Làm mới</button>{status === "loading" ? <span className="self-center text-xs font-semibold text-slate-500">Đang tải kho nhạc...</span> : null}</div>
            {status === "unavailable" ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Kho nhạc đang chưa sẵn sàng. Vui lòng thử lại sau.</p> : null}
          </div>
        </div>

        <aside className="music-planner-card p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="music-planner-section-icon"><ClipboardList size={21} /></span><div><h3>Playlist của bạn{playlist ? ` (${playlist.length} bài)` : ""}</h3><p>Danh sách nhạc được gợi ý dựa trên lựa chọn của bạn</p></div></div>{playlist?.length ? <button className="music-save-button" onClick={copyPlaylist} type="button"><Download size={16} />{copied ? "Đã sao chép" : "Lưu playlist"}</button> : null}</div>
          {playlist ? <ol className="music-playlist">{playlist.map((song, index) => <li key={`${song.id}-${index}`}><span className="music-track-number">{index + 1}</span><span className="music-track-cover"><Music2 size={18} /></span><div><strong>{song.title}</strong><small>{song.category || song.moment}</small></div><em>{song.moment}</em></li>)}</ol> : <div className="music-playlist-empty"><Music2 size={35} /><strong>Chưa có danh sách bài hát</strong><p>Chọn các khoảnh khắc bên trái, sau đó nhấn nút gợi ý để tạo playlist từ kho nhạc ZenLove.</p></div>}
        </aside>
      </div>
    </div>
  </section>;
}

export default MusicPlanner;
