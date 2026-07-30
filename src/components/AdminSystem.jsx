import { useEffect, useState } from "react";
import { ArrowLeft, History, Lock, LogOut, Save, Settings, Users } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";

const defaults = { siteName: "Zenlove Wedding", hotline: "0335652868", zalo: "0335652868", tiktok: "https://www.tiktok.com/@zenlovewedding" };

function AdminSystem({ page }) {
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("zenlove-admin-settings");
    if (stored) setSettings({ ...defaults, ...JSON.parse(stored) });
    const activity = JSON.parse(localStorage.getItem("zenlove-admin-activity") || "[]");
    const next = [{ title: "Mở " + (page === "settings" ? "Cài đặt" : page === "users" ? "Người dùng" : "Nhật ký hoạt động"), time: new Date().toLocaleString("vi-VN") }, ...activity].slice(0, 20);
    localStorage.setItem("zenlove-admin-activity", JSON.stringify(next));
  }, [page]);

  if (!isSupabaseConfigured || !session) return <main className="grid min-h-screen place-items-center bg-[#fbfafb] p-4"><div className="rounded-3xl bg-white p-6 text-center shadow-sm"><Lock className="mx-auto text-[#E54153]" /><p className="mt-3 font-extrabold">Hãy đăng nhập dashboard trước.</p><a className="mt-4 inline-flex rounded-xl bg-[#E54153] px-4 py-2 text-sm font-bold text-white" href="/admin/dashboard">Về dashboard</a></div></main>;

  const title = page === "settings" ? "Cài đặt hệ thống" : page === "users" ? "Người dùng" : "Nhật ký hoạt động";
  const Icon = page === "settings" ? Settings : page === "users" ? Users : History;
  const activity = JSON.parse(localStorage.getItem("zenlove-admin-activity") || "[]");
  const save = (event) => { event.preventDefault(); localStorage.setItem("zenlove-admin-settings", JSON.stringify(settings)); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return <main className="min-h-screen bg-[#fbfafb] p-4 text-slate-800 sm:p-6"><section className="mx-auto max-w-4xl"><header className="flex items-center justify-between border-b border-rose-100 pb-5"><a className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-[#E54153]" href="/admin/dashboard"><ArrowLeft size={17} />Dashboard</a><button className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-2 text-sm font-bold" onClick={() => supabase.auth.signOut()} type="button"><LogOut size={16} />Thoát</button></header><div className="mt-7 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(229,65,83,0.07)] sm:p-7"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#E54153]"><Icon size={24} /></span><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">Zenlove Wedding</p><h1 className="mt-1 text-2xl font-extrabold">{title}</h1></div></div>{page === "settings" ? <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={save}>{Object.entries(settings).map(([key, value]) => <label className="block text-sm font-extrabold" key={key}>{key === "siteName" ? "Tên website" : key === "hotline" ? "Hotline" : key === "zalo" ? "Số Zalo" : "Link TikTok"}<input className="mt-2 h-11 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-3 text-sm font-medium outline-none focus:border-[#E54153]" value={value} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} /></label>)}<div className="sm:col-span-2"><button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#E54153] px-5 text-sm font-extrabold text-white" type="submit"><Save size={16} />{saved ? "Đã lưu trên thiết bị" : "Lưu cài đặt"}</button></div></form> : page === "users" ? <div className="mt-7 rounded-2xl border border-rose-100 bg-[#fffafa] p-5"><p className="text-sm font-extrabold">Tài khoản quản trị hiện tại</p><p className="mt-2 text-sm text-slate-600">{session.user.email}</p><p className="mt-1 text-xs text-slate-500">Quyền: Quản trị viên</p></div> : <div className="mt-7 grid gap-3">{activity.length ? activity.map((item, index) => <div className="flex items-center justify-between rounded-2xl border border-rose-100 p-4" key={index}><p className="text-sm font-extrabold">{item.title}</p><p className="text-xs text-slate-500">{item.time}</p></div>) : <p className="text-sm text-slate-500">Chưa có hoạt động nào.</p>}</div>}</div></section></main>;
}

export default AdminSystem;