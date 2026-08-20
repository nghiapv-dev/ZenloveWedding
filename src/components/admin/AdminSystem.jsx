import { useEffect, useState } from "react";
import { ArrowLeft, Lock, LogOut, Users } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";

function AdminSystem() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfafb] p-4">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <Lock className="mx-auto text-[#E54153]" />
          <p className="mt-3 font-extrabold">Hãy đăng nhập dashboard trước.</p>
          <a className="mt-4 inline-flex rounded-xl bg-[#E54153] px-4 py-2 text-sm font-bold text-white" href="/admin/dashboard">
            Về dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfafb] p-4 text-slate-800 sm:p-6">
      <section className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-rose-100 pb-5">
          <a className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-[#E54153]" href="/admin/dashboard">
            <ArrowLeft size={17} />Dashboard
          </a>
          <button className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-2 text-sm font-bold" onClick={() => supabase.auth.signOut()} type="button">
            <LogOut size={16} />Thoát
          </button>
        </header>
        <div className="mt-7 rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_30px_rgba(229,65,83,0.07)] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#E54153]"><Users size={24} /></span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#E54153]">Zenlove Wedding</p>
              <h1 className="mt-1 text-2xl font-extrabold">Người dùng</h1>
            </div>
          </div>
          <div className="mt-7 rounded-2xl border border-rose-100 bg-[#fffafa] p-5">
            <p className="text-sm font-extrabold">Tài khoản quản trị hiện tại</p>
            <p className="mt-2 text-sm text-slate-600">{session.user.email}</p>
            <p className="mt-1 text-xs text-slate-500">Quyền: Quản trị viên</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminSystem;
