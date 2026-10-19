import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  GripVertical,
  Plus,
  Save,
  Search,
  Star,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { zenLoveTemplatePreviewUrl } from "../../lib/zenloveTemplateUrl.js";

const MAX_FEATURED_TEMPLATES = 5;

function AdminFeaturedTemplates({ session, onNavigate }) {
  const [templates, setTemplates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [message, setMessage] = useState("");
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      const [templatesResult, featuredResult] = await Promise.all([
        supabase
          .from("wedding_templates")
          .select("id, title, slug, url, image_url, is_visible, sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("featured_wedding_templates")
          .select("template_id, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

      if (!mounted) return;
      setIsLoading(false);

      if (featuredResult.error) {
        const missingTable =
          ["PGRST205", "42P01"].includes(featuredResult.error.code) ||
          /does not exist|schema cache/i.test(featuredResult.error.message || "");
        setSetupNeeded(missingTable);
        setMessage(
          missingTable
            ? "Cần chạy migration mẫu thiệp nổi bật trong Supabase SQL Editor."
            : featuredResult.error.message,
        );
        return;
      }
      if (templatesResult.error) {
        setMessage(templatesResult.error.message);
        return;
      }

      const ids = (featuredResult.data || []).map((item) => item.template_id);
      setTemplates(templatesResult.data || []);
      setSelectedIds(ids);
      setSavedIds(ids);
      setMessage("");
    };

    load();
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  const templateById = new Map(templates.map((item) => [item.id, item]));
  const templateNumbers = new Map();
  let visibleNumber = 0;
  templates.forEach((item) => {
    if (item.is_visible !== false) {
      visibleNumber += 1;
      templateNumbers.set(item.id, visibleNumber);
    }
  });

  const selectedTemplates = selectedIds
    .map((id) => templateById.get(id))
    .filter(Boolean);
  const hasHiddenSelection = selectedTemplates.some(
    (item) => item.is_visible === false,
  );
  const hasChanges = selectedIds.join(",") !== savedIds.join(",");
  const search = query.trim().toLocaleLowerCase("vi-VN");
  const availableTemplates = templates.filter((item) => {
    if (item.is_visible === false) return false;
    const number = templateNumbers.get(item.id);
    return (
      !search ||
      item.title?.toLocaleLowerCase("vi-VN").includes(search) ||
      `mẫu ${number}`.includes(search) ||
      `mau ${number}`.includes(search)
    );
  });

  const toggle = (id) => {
    setMessage("");
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_FEATURED_TEMPLATES) return current;
      return [...current, id];
    });
  };

  const move = (id, targetIndex) => {
    setSelectedIds((current) => {
      const fromIndex = current.indexOf(id);
      if (
        fromIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= current.length ||
        fromIndex === targetIndex
      ) {
        return current;
      }
      const next = [...current];
      next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, id);
      return next;
    });
  };

  const save = async () => {
    if (!hasChanges || hasHiddenSelection || isSaving) return;
    setIsSaving(true);
    setMessage("");
    const { error } = await supabase.rpc("set_featured_wedding_templates", {
      selected_ids: selectedIds,
    });
    setIsSaving(false);
    if (error) {
      setMessage(
        error.code === "PGRST202"
          ? "Chưa có hàm lưu danh sách. Hãy chạy migration mẫu thiệp nổi bật trong Supabase SQL Editor."
          : error.message,
      );
      return;
    }
    setSavedIds([...selectedIds]);
    setMessage("Đã cập nhật danh sách mẫu thiệp nổi bật trên trang chủ.");
  };

  const goToAllTemplates = () => onNavigate?.("/admin/templates");

  return (
    <main className="admin-ui min-h-screen p-4 text-slate-800 sm:p-6">
      <section className="mx-auto w-full max-w-none">
        <button
          className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-blue-600"
          onClick={goToAllTemplates}
          type="button"
        >
          <ArrowLeft size={17} />
          Quản lý thiệp cưới
        </button>

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Star size={24} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">Mẫu thiệp nổi bật</h1>
              <p className="mt-1 text-sm text-slate-500">
                Chọn tối đa {MAX_FEATURED_TEMPLATES} mẫu từ kho thiệp để hiển thị trên trang chủ.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-100 px-4 text-sm font-bold text-blue-700 hover:bg-blue-50"
              onClick={goToAllTemplates}
              type="button"
            >
              <Plus size={16} />
              Thêm thiệp vào kho
            </button>
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasChanges || hasHiddenSelection || isSaving || setupNeeded}
              onClick={save}
              type="button"
            >
              <Save size={16} />
              {isSaving ? "Đang lưu..." : "Lưu danh sách"}
            </button>
          </div>
        </header>

        {message ? (
          <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${setupNeeded || hasHiddenSelection ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"}`} role="status">
            {message}
          </p>
        ) : null}

        {setupNeeded ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-white p-5 text-sm text-slate-700">
            Chạy file <code>supabase/migrations/supabase-featured-wedding-templates-setup.sql</code> trong Supabase SQL Editor, rồi tải lại trang này.
          </div>
        ) : isLoading ? (
          <p className="mt-5 rounded-2xl bg-white p-6 text-sm text-slate-500">Đang tải mẫu thiệp...</p>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
            <section className="h-fit rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold">Đã chọn</h2>
                <span className="text-sm font-bold text-blue-600">{selectedIds.length}/{MAX_FEATURED_TEMPLATES}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Kéo thả hoặc dùng mũi tên để đổi vị trí.</p>
              {hasHiddenSelection ? (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
                  Có mẫu đã ẩn trong danh sách. Hãy bỏ mẫu đó trước khi lưu.
                </p>
              ) : null}
              {selectedTemplates.length ? (
                <ol className="mt-4 space-y-2">
                  {selectedTemplates.map((item, index) => (
                    <li
                      className={`flex items-center gap-2 rounded-xl border p-2 ${draggedId === item.id ? "border-blue-400 bg-blue-50" : "border-slate-200"}`}
                      draggable
                      key={item.id}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", item.id);
                        setDraggedId(item.id);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
                        if (sourceId) move(sourceId, index);
                        setDraggedId(null);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <GripVertical className="shrink-0 cursor-grab text-slate-400" size={16} />
                      <span className="w-5 shrink-0 text-sm font-extrabold text-blue-600">{index + 1}</span>
                      <img className="size-12 shrink-0 rounded-lg object-cover object-top" src={item.image_url} alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold">{item.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.is_visible === false ? "Đã ẩn" : `Mẫu ${templateNumbers.get(item.id)}`}
                        </p>
                      </div>
                      <button aria-label="Đưa mẫu lên" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" disabled={index === 0} onClick={() => move(item.id, index - 1)} type="button"><ArrowUp size={16} /></button>
                      <button aria-label="Đưa mẫu xuống" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30" disabled={index === selectedIds.length - 1} onClick={() => move(item.id, index + 1)} type="button"><ArrowDown size={16} /></button>
                      <button aria-label="Bỏ mẫu khỏi danh sách" className="rounded-lg p-1 text-rose-500 hover:bg-rose-50" onClick={() => toggle(item.id)} type="button"><X size={16} /></button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-blue-200 p-6 text-center text-sm text-slate-500">Chưa chọn mẫu nào.</p>
              )}
            </section>

            <section className="min-w-0 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold">Chọn từ kho mẫu thiệp</h2>
                  <p className="mt-1 text-xs text-slate-500">Chỉ hiển thị mẫu đang bật ngoài trang người dùng.</p>
                </div>
                <label className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    className="h-10 w-full rounded-xl border border-blue-100 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-300"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm tên hoặc Mẫu 1..."
                    value={query}
                  />
                </label>
              </div>
              {availableTemplates.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  {availableTemplates.map((item) => {
                    const order = selectedIds.indexOf(item.id);
                    const isSelected = order !== -1;
                    return (
                      <article className={`min-w-0 overflow-hidden rounded-xl border ${isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`} key={item.id}>
                        <button
                          aria-pressed={isSelected}
                          className="block w-full text-left"
                          onClick={() => toggle(item.id)}
                          type="button"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                            <img className="h-full w-full object-cover object-top" src={item.image_url} alt={`Mẫu ${templateNumbers.get(item.id)}`} loading="lazy" />
                            <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-extrabold ${isSelected ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
                              {isSelected ? `Đã chọn · ${order + 1}` : `Mẫu ${templateNumbers.get(item.id)}`}
                            </span>
                          </div>
                          <span className="block truncate px-2 pt-2 text-xs font-bold" title={item.title}>{item.title}</span>
                          <span className="block px-2 pb-2 text-[11px] font-bold text-blue-600">{isSelected ? "Bỏ chọn" : "Chọn mẫu"}</span>
                        </button>
                        <a className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-blue-600" href={zenLoveTemplatePreviewUrl(item.url, item.slug)} rel="noreferrer" target="_blank"><ExternalLink size={13} /> Xem thiệp</a>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-blue-100 p-8 text-center text-sm text-slate-500">
                  {query ? "Không tìm thấy mẫu phù hợp." : "Kho mẫu đang trống. Hãy thêm mẫu ở trang quản lý thiệp cưới."}
                </p>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminFeaturedTemplates;
