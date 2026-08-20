import { useEffect, useState } from "react";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";
import { packages, faqs, feedbacks } from "../../data/siteData.jsx";

const defaults = {
  contact: { heroTitle: "Thiệp cưới Online & Dịch vụ cưới hiện đại", heroDescription: "", hotline: "0335652868", zalo: "0335652868" },
  packages,
  faqs,
  feedbacks,
};

function AdminContentManager() {
  const [data, setData] = useState(defaults);
  const [tab, setTab] = useState("contact");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from("site_content").select("value").eq("id", "website").maybeSingle().then(({ data: row, error }) => {
      if (!error && row?.value && Object.keys(row.value).length) setData({ ...defaults, ...row.value });
    });
  }, []);
  const save = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("site_content").upsert({ id: "website", value: data, updated_at: new Date().toISOString(), updated_by: auth.user?.id });
    if (error) return setMessage(error.message);
    setSaved(true); setMessage(""); setTimeout(() => setSaved(false), 2000);
  };
  const updateContact = (key, value) => setData((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));
  const updateJson = (key, value) => { try { setData((current) => ({ ...current, [key]: JSON.parse(value) })); setMessage(""); } catch { setMessage("JSON chưa đúng định dạng."); } };
  const active = tab === "contact" ? <div className="grid gap-4 sm:grid-cols-2">{[["heroTitle", "Tiêu đề banner"], ["heroDescription", "Mô tả banner"], ["hotline", "Hotline"], ["zalo", "Số Zalo"]].map(([key, label]) => <label className="text-sm font-bold" key={key}>{label}<input className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-3 outline-none" value={data.contact[key] || ""} onChange={(event) => updateContact(key, event.target.value)} /></label>)}</div> : <label className="block text-sm font-bold">{tab === "packages" ? "Bảng giá" : tab === "faqs" ? "Câu hỏi thường gặp" : "Danh sách feedback"}<textarea className="mt-2 min-h-80 w-full rounded-2xl border border-rose-100 bg-[#fffafa] p-4 font-mono text-xs outline-none" defaultValue={JSON.stringify(data[tab], null, 2)} onChange={(event) => updateJson(tab, event.target.value)} /><span className="mt-2 block text-xs font-medium text-slate-500">Sửa dữ liệu theo cấu trúc JSON. Feedback hỗ trợ thay đổi title, source và image.</span></label>;
  return <main className="admin-ui min-h-screen p-4 text-slate-800 sm:p-6"><section className="mx-auto max-w-5xl"><a className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-[#E54153]" href="/admin/dashboard"><ArrowLeft size={17} />Dashboard</a><header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#E54153]"><Settings size={24} /></span><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">Nội dung website</p><h1 className="mt-1 text-2xl font-extrabold">Quản lý trang chủ</h1></div></div><button className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#E54153] px-4 text-sm font-extrabold text-white" onClick={save} type="button"><Save size={16} />{saved ? "Đã lưu" : "Lưu thay đổi"}</button></header><div className="mt-5 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"><nav className="mb-6 flex flex-wrap gap-2">{[["contact", "Banner & liên hệ"], ["packages", "Bảng giá"], ["faqs", "FAQ"], ["feedbacks", "Feedback"]].map(([key, label]) => <button className={`rounded-xl px-4 py-2 text-sm font-extrabold ${tab === key ? "bg-[#E54153] text-white" : "bg-rose-50 text-slate-600"}`} onClick={() => setTab(key)} type="button" key={key}>{label}</button>)}</nav>{active}{message ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-[#E54153]">{message}</p> : null}</div></section></main>;
}
export default AdminContentManager;
