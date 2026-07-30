import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, ClipboardList, Music, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";
import { cardClass, sectionClass } from "../constants/styles.js";
import SectionHeading from "./SectionHeading.jsx";

const ceremonySections = [
  { id: "welcome", label: "Nhạc đón khách", category: "Nhạc đón khách" },
  { id: "mc", label: "Nhạc MC giới thiệu", category: "Nhạc MC giới thiệu" },
  { id: "groom", label: "Chú rể lên sân khấu", category: "Nhạc chú rể lên sk" },
  {
    id: "couple",
    label: "Cô dâu chú rể lên sân khấu",
    category: "Nhạc cô dâu chú rể lên sk",
  },
  { id: "parents", label: "Ba mẹ lên sân khấu", category: "Ba mẹ lên sk" },
  { id: "rings", label: "Trao nhẫn", category: "Nhạc trao nhẫn" },
  {
    id: "cake",
    label: "Cắt bánh & rót rượu",
    category: "Nhạc cắt bánh & rót rượu",
  },
  { id: "toast", label: "Dâng rượu ba mẹ", category: "Dâng rượu ba mẹ" },
  { id: "opening", label: "Khai tiệc", category: "Nhạc khai tiệc" },
];

const defaultSectionIds = [
  "welcome",
  "mc",
  "groom",
  "couple",
  "parents",
  "cake",
  "opening",
];

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const categoryKeywords = {
  welcome: ["don khach"],
  mc: ["mc", "gioi thieu"],
  groom: ["chu re"],
  couple: ["co dau chu re"],
  parents: ["ba me len"],
  rings: ["trao nhan"],
  cake: ["cat banh", "rot ruou"],
  toast: ["dang ruou"],
  opening: ["khai tiec"],
};

function belongsToSection(song, section) {
  const category = normalize(song.category || "");
  if (section.id === "groom" && category.includes("co dau")) return false;
  return category === normalize(section.category) || (categoryKeywords[section.id] || []).some((keyword) => category.includes(keyword));
}

function MusicPlanner() {
  const [songs, setSongs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(defaultSectionIds);
  const [customSections, setCustomSections] = useState([]);
  const [customSectionName, setCustomSectionName] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [addQueries, setAddQueries] = useState({});
  const [status, setStatus] = useState("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("unavailable");
      return undefined;
    }

    let mounted = true;
    supabase.rpc("get_music_suggestions").then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setStatus("unavailable");
        return;
      }
      setSongs(data || []);
      setStatus("ready");
    });

    return () => {
      mounted = false;
    };
  }, []);

  const allSections = useMemo(() => [...ceremonySections, ...customSections], [customSections]);
  const selectedSections = useMemo(() => selectedIds.map((id) => allSections.find((section) => section.id === id)).filter(Boolean), [allSections, selectedIds]);

  const toggleSection = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const addCustomSection = () => {
    const label = customSectionName.trim();
    if (!label) return;
    const id = `custom-${Date.now()}`;
    setCustomSections((current) => [...current, { id, label, category: "" }]);
    setSelectedIds((current) => [...current, id]);
    setCustomSectionName("");
    setIsAddingSection(false);
  };

  const moveSection = (id, direction) => {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const resetPlanner = () => {
    setSelectedIds(defaultSectionIds);
    setCustomSections([]);
    setCustomSectionName("");
    setIsAddingSection(false);
    setSuggestions(null);
    setAddQueries({});
    setCopied(false);
  };

  const createSuggestions = (event) => {
    event.preventDefault();

    const next = selectedSections.map((section) => {
      const matches = songs
        .filter((song) => belongsToSection(song, section))
        .sort((a, b) => a.title.localeCompare(b.title, "vi"))
        .slice(0, ["welcome", "opening"].includes(section.id) ? 8 : 3);
      return { ...section, songs: matches };
    });

    setSuggestions(next);
    setAddQueries({});
    setCopied(false);
  };

  const removeSong = (sectionId, songId) => {
    setSuggestions((current) => current?.map((section) => section.id === sectionId ? { ...section, songs: section.songs.filter((song) => song.id !== songId) } : section));
    setCopied(false);
  };

  const addSong = (sectionId, songId) => {
    const song = songs.find((item) => item.id === songId);
    if (!song) return;
    setSuggestions((current) => current?.map((section) => section.id === sectionId ? { ...section, songs: section.songs.some((item) => item.id === song.id) ? section.songs : [...section.songs, song] } : section));
    setAddQueries((current) => ({ ...current, [sectionId]: "" }));
    setCopied(false);
  };

  const copyList = async () => {
    if (!suggestions) return;
    const text = suggestions
      .map((section, index) => {
        const titles = section.songs.length
          ? section.songs.map((song) => `- ${song.title}`).join("\n")
          : "- Chưa có bài trong danh mục này";
        return `${index + 1}. ${section.label}\n${titles}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <section
      className={`${sectionClass} bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_72%)]`}
      id="music-planner"
    >
      <SectionHeading
        eyebrow="Gợi ý dành cho bạn"
        title="Tạo list nhạc cưới phù hợp"
        desc="Mô tả không khí buổi tiệc và chọn các nghi thức. Zenlove sẽ gợi ý tên bài hát phù hợp cho từng hạng mục."
      />

      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form
          className={`${cardClass} min-w-0 p-5 sm:p-6`}
          onSubmit={createSuggestions}
        >
          <fieldset>
            <legend className="text-sm font-extrabold text-slate-800">
              Các hạng mục cần có
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {allSections.map((section) => {
                const checked = selectedIds.includes(section.id);
                return (
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${checked ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-100 bg-white text-slate-600 hover:border-rose-200"}`}
                    key={section.id}
                  >
                    <input
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleSection(section.id)}
                      type="checkbox"
                    />
                    <span
                      className={`grid size-5 place-items-center rounded-full border ${checked ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300"}`}
                    >
                      {checked ? <Check size={13} /> : null}
                    </span>
                    {section.label}
                  </label>
                );
              })}
            </div>
            {isAddingSection ? (
              <div className="mt-3 flex gap-2">
                <input className="h-10 min-w-0 flex-1 rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold outline-none focus:border-rose-400" onChange={(event) => setCustomSectionName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomSection(); } }} placeholder="Ví dụ: Ba dắt cô dâu lên sân khấu" value={customSectionName} />
                <button className="h-10 rounded-xl bg-rose-500 px-3 text-sm font-extrabold text-white" onClick={addCustomSection} type="button">Thêm</button>
              </div>
            ) : (
              <button className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-rose-300 px-3 text-sm font-extrabold text-rose-500 transition hover:bg-rose-50" onClick={() => setIsAddingSection(true)} type="button"><Plus size={16} />Thêm hạng mục khác</button>
            )}
            {selectedSections.length > 1 ? (
              <div className="mt-5 border-t border-rose-100 pt-4">
                <p className="text-sm font-extrabold text-slate-800">Thứ tự list nhạc</p>
                <p className="mt-1 text-xs text-slate-500">Dùng mũi tên để sắp xếp các hạng mục theo chương trình của bạn.</p>
                <div className="mt-3 grid gap-2">
                  {selectedSections.map((section, index) => <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/40 px-3 py-2" key={section.id}><span className="min-w-0 text-sm font-bold text-slate-700"><span className="mr-2 text-rose-500">{index + 1}.</span>{section.label}</span><span className="flex shrink-0 gap-1"><button aria-label={`Đưa ${section.label} lên`} className="grid size-7 place-items-center rounded-lg text-rose-500 transition hover:bg-white disabled:opacity-30" disabled={index === 0} onClick={() => moveSection(section.id, -1)} type="button"><ChevronUp size={17} /></button><button aria-label={`Đưa ${section.label} xuống`} className="grid size-7 place-items-center rounded-lg text-rose-500 transition hover:bg-white disabled:opacity-30" disabled={index === selectedSections.length - 1} onClick={() => moveSection(section.id, 1)} type="button"><ChevronDown size={17} /></button></span></div>)}
                </div>
              </div>
            ) : null}
          </fieldset>
          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedIds.length || status !== "ready"}
              type="submit"
            >
              <Sparkles size={18} />
              Tạo gợi ý list nhạc
            </button>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-extrabold text-rose-500 transition hover:bg-rose-50" onClick={resetPlanner} type="button"><RotateCcw size={17} />Làm lại</button>
          </div>
          {status === "loading" ? (
            <p className="mt-3 text-center text-xs font-medium text-slate-500">
              Đang tải kho nhạc...
            </p>
          ) : null}
          {status === "unavailable" ? (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
              Kho nhạc đang chưa sẵn sàng. Vui lòng thử lại sau.
            </p>
          ) : null}
        </form>

        <div className={`${cardClass} min-w-0 p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                <ClipboardList size={22} />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-950">
                  Danh sách tên bài hát gợi ý
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Mỗi mục hiển thị tối đa 5 tên bài hát từ kho Zenlove.
                </p>
              </div>
            </div>
            {suggestions ? (
              <button
                className="shrink-0 rounded-xl border border-rose-200 px-3 py-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"
                onClick={copyList}
                type="button"
              >
                {copied ? "Đã sao chép" : "Sao chép list"}
              </button>
            ) : null}
          </div>
          {!suggestions ? (
            <div className="mt-6 grid min-h-72 place-items-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/35 p-6 text-center">
              <Music className="text-rose-400" size={34} />
              <div>
                <p className="mt-3 font-extrabold text-slate-800">
                  Chưa có danh sách bài hát
                </p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Điền yêu cầu ở bên trái để xem tên bài hát phù hợp cho từng
                  nghi thức.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              {suggestions.map((section, index) => (
                <article
                  className="min-w-0 rounded-2xl border border-rose-100 bg-rose-50/30 p-4"
                  key={section.id}
                >
                  <h4 className="font-extrabold text-slate-900">
                    {index + 1}. {section.label}
                  </h4>
                  {section.songs.length ? (
                    <ol className="mt-3 min-w-0 grid gap-2">
                      {section.songs.map((song) => (
                        <li
                          className="flex items-center justify-between gap-3 rounded-xl bg-white py-2 pl-3 pr-2 text-sm font-semibold text-slate-700"
                          key={song.id}
                        >
                          <span className="min-w-0 break-words">{song.title}</span>
                          <button
                            aria-label={`Remove ${song.title}`}
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                            onClick={() => removeSong(section.id, song.id)}
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Chưa có bài được phân loại cho mục này.
                    </p>
                  )}
                  <div className="mt-3 border-t border-rose-100 pt-3">
                    <label className="relative block">
                      <span className="sr-only">Tìm bài hát để thêm</span>
                      <input
                        className="h-10 w-full rounded-xl border border-rose-100 bg-white px-3 pr-10 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-400"
                        onChange={(event) => setAddQueries((current) => ({ ...current, [section.id]: event.target.value }))}
                        placeholder="Tìm tên bài hát để thêm..."
                        value={addQueries[section.id] || ""}
                      />
                      <Plus className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-rose-400" size={17} />
                    </label>
                    {addQueries[section.id]?.trim() ? (
                      <div className="mt-2 grid gap-1 rounded-xl border border-rose-100 bg-white p-1.5">
                        {songs.filter((song) => normalize(song.title).includes(normalize(addQueries[section.id])) && !section.songs.some((item) => item.id === song.id)).slice(0, 6).map((song) => (
                          <button
                            className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                            key={song.id}
                            onClick={() => addSong(section.id, song.id)}
                            type="button"
                          >
                            <span className="min-w-0 break-words">{song.title}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-rose-500"><Plus size={14} />Thêm</span>
                          </button>
                        ))}
                        {!songs.some((song) => normalize(song.title).includes(normalize(addQueries[section.id])) && !section.songs.some((item) => item.id === song.id)) ? <p className="px-2.5 py-2 text-sm text-slate-500">Không tìm thấy bài phù hợp.</p> : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MusicPlanner;
