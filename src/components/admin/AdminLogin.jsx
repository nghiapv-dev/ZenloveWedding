import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

function AdminLogin({ onLogin }) {
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
    <main className="min-h-screen bg-[#fffafa] px-4 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          className="w-full rounded-3xl border border-rose-100 bg-white p-6 shadow-[0_18px_50px_rgba(229,65,83,0.12)]"
          onSubmit={submit}
        >
          <div className="grid size-14 place-items-center rounded-2xl bg-[#E54153] text-white">
            <Lock size={26} />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#E54153]">
            Zenlove Wedding Admin
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">Đăng nhập quản trị</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Quản lý toàn bộ thư viện và sản phẩm của Zenlove Wedding.
          </p>
          <input
            className="mt-6 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-[#E54153]"
            placeholder="Email admin"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="mt-3 h-12 w-full rounded-xl border border-rose-100 bg-[#fffafa] px-4 text-sm font-bold outline-none focus:border-[#E54153]"
            placeholder="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {message ? (
            <p className="mt-3 text-sm font-bold text-[#E54153]">{message}</p>
          ) : null}
          <button
            className="mt-5 h-12 w-full rounded-xl bg-[#E54153] text-sm font-extrabold text-white transition hover:bg-[#c93345]"
            type="submit"
          >
            Vào dashboard
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
