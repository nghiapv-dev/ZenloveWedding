import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Image,
  Music,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const statusLabels = {
  new: "Mới nhận",
  working: "Đang làm",
  review: "Chờ khách duyệt",
  completed: "Hoàn thành",
};

const services = [
  { id: "wedding", label: "Thiệp cưới", note: "Thiệp online", icon: Image, tone: "blue" },
  { id: "slide", label: "Slide cưới", note: "Video / slideshow", icon: Video, tone: "violet" },
  { id: "background", label: "Màn sao băng", note: "Hiệu ứng màn hình", icon: Sparkles, tone: "amber" },
  { id: "music", label: "Nhạc cưới", note: "Danh sách bài hát", icon: Music, tone: "rose" },
];

const emptyForm = {
  bride_name: "",
  groom_name: "",
  wedding_date: "",
  selected_services: [],
  wedding_template_name: "",
  slide_template_name: "",
  slide_photo_count: "",
  background_template_name: "",
  expected_delivery_date: "",
  total_amount: "",
  deposit_amount: "",
  status: "new",
  note: "",
};

function Field({ children, label, required = false }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}{required ? <span className="text-blue-600"> *</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const inputClass = "h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const selectedServices = form.selected_services;
  const remaining = Math.max(Number(form.total_amount || 0) - Number(form.deposit_amount || 0), 0);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setOrders(data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleService = (serviceId) => {
    setForm((current) => ({
      ...current,
      selected_services: current.selected_services.includes(serviceId)
        ? current.selected_services.filter((item) => item !== serviceId)
        : [...current.selected_services, serviceId],
    }));
  };

  const createOrder = async (event) => {
    event.preventDefault();
    if (!form.bride_name || !form.groom_name || !form.wedding_date || !form.selected_services.length) {
      setMessage("Hãy nhập tên cô dâu, chú rể, ngày cưới và chọn ít nhất một dịch vụ.");
      return;
    }

    const serviceNames = services
      .filter((service) => form.selected_services.includes(service.id))
      .map((service) => service.label);
    const payload = {
      ...form,
      package_name: serviceNames.join(", "),
      template_name: form.wedding_template_name || form.slide_template_name || form.background_template_name || null,
      slide_photo_count: form.slide_photo_count ? Number(form.slide_photo_count) : null,
      total_amount: Number(form.total_amount || 0),
      deposit_amount: Number(form.deposit_amount || 0),
    };
    const { error } = await supabase.from("customer_orders").insert(payload);
    if (error) {
      setMessage(`${error.message}. Hãy chạy file migration thêm chi tiết đơn hàng trong Supabase.`);
      return;
    }

    setForm(emptyForm);
    setShowForm(false);
    setMessage("");
    await loadOrders();
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("customer_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setMessage(error.message);
    else loadOrders();
  };

  const visibleOrders = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  const selected = (serviceId) => selectedServices.includes(serviceId);
  const templateInput = (field, placeholder) => (
    <input className={inputClass} placeholder={placeholder} value={form[field]} onChange={(event) => update(field, event.target.value)} />
  );

  return (
    <main className="admin-ui min-h-screen p-4 text-slate-800 sm:p-6">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><ClipboardList size={24} /></span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600">Khách hàng</p>
              <h1 className="mt-1 text-2xl font-extrabold">Quản lý đơn khách</h1>
              <p className="mt-1 text-sm text-slate-500">Tạo và quản lý đơn hàng thiệp cưới, slide, màn sao băng và nhạc cưới.</p>
            </div>
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700" onClick={() => setShowForm((value) => !value)} type="button">
            <Plus size={17} />{showForm ? "Đóng form" : "Tạo đơn mới"}
          </button>
        </header>

        {showForm ? (
          <form className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7" onSubmit={createOrder}>
            <section>
              <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><ClipboardList size={18} className="text-blue-600" /> THÔNG TIN KHÁCH HÀNG</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Tên cô dâu" required><input className={inputClass} placeholder="Nhập tên cô dâu" value={form.bride_name} onChange={(event) => update("bride_name", event.target.value)} /></Field>
                <Field label="Tên chú rể" required><input className={inputClass} placeholder="Nhập tên chú rể" value={form.groom_name} onChange={(event) => update("groom_name", event.target.value)} /></Field>
                <Field label="Ngày cưới" required><input className={inputClass} type="date" value={form.wedding_date} onChange={(event) => update("wedding_date", event.target.value)} /></Field>
              </div>
            </section>

            <section className="mt-7">
              <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><Sparkles size={18} className="text-blue-600" /> DỊCH VỤ KHÁCH ĐẶT</p>
              <p className="mt-1 text-xs text-slate-500">Chọn các dịch vụ khách hàng yêu cầu.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {services.map(({ id, label, note, icon: Icon, tone }) => (
                  <button className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition ${selected(id) ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`} key={id} onClick={() => toggleService(id)} type="button">
                    <span className={`grid size-10 place-items-center rounded-xl ${tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "rose" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-600"}`}><Icon size={20} /></span>
                    <span><strong className="block text-sm">{label}</strong><small className="mt-0.5 block text-xs text-slate-500">{note}</small></span>
                    {selected(id) ? <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-md bg-blue-600 text-white"><Check size={13} /></span> : null}
                  </button>
                ))}
              </div>
              {selected("wedding") ? <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4"><Field label="Mẫu thiệp đã chọn">{templateInput("wedding_template_name", "Ví dụ: Mẫu 36")}</Field></div> : null}
              {selected("slide") ? <div className="mt-4 grid gap-4 rounded-2xl border border-violet-100 bg-violet-50/30 p-4 md:grid-cols-2"><Field label="Mẫu slide đã chọn">{templateInput("slide_template_name", "Ví dụ: Mẫu 03")}</Field><Field label="Số lượng ảnh dự kiến"><input className={inputClass} min="0" placeholder="Ví dụ: 25" type="number" value={form.slide_photo_count} onChange={(event) => update("slide_photo_count", event.target.value)} /></Field></div> : null}
              {selected("background") ? <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-4"><Field label="Mẫu màn sao băng đã chọn">{templateInput("background_template_name", "Ví dụ: Mẫu 05")}</Field></div> : null}
            </section>

            <section className="mt-7">
              <p className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><CalendarDays size={18} className="text-blue-600" /> THÔNG TIN ĐƠN HÀNG</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Ngày bàn giao dự kiến"><input className={inputClass} type="date" value={form.expected_delivery_date} onChange={(event) => update("expected_delivery_date", event.target.value)} /></Field>
                <Field label="Tổng tiền (VNĐ)"><input className={inputClass} min="0" placeholder="0" type="number" value={form.total_amount} onChange={(event) => update("total_amount", event.target.value)} /></Field>
                <Field label="Đã cọc (VNĐ)"><input className={inputClass} min="0" placeholder="0" type="number" value={form.deposit_amount} onChange={(event) => update("deposit_amount", event.target.value)} /></Field>
                <Field label="Còn lại (VNĐ)"><input className={`${inputClass} border-emerald-200 bg-emerald-50 text-emerald-700`} readOnly value={remaining.toLocaleString("vi-VN")} /></Field>
                <Field label="Trạng thái đơn hàng"><select className={inputClass} value={form.status} onChange={(event) => update("status", event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                <Field label="Ghi chú nội bộ"><textarea className="min-h-11 w-full rounded-xl border border-blue-100 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-3" placeholder="Ghi chú thêm cho đơn hàng..." value={form.note} onChange={(event) => update("note", event.target.value)} /></Field>
              </div>
            </section>

            <button className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-extrabold text-white transition hover:bg-blue-700" type="submit"><Plus size={17} />Tạo đơn khách</button>
          </form>
        ) : null}

        <nav className="mt-6 flex flex-wrap gap-2">
          {[["all", "Tất cả"], ...Object.entries(statusLabels)].map(([value, label]) => <button className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === value ? "bg-blue-600 text-white" : "bg-blue-50 text-slate-600 hover:bg-blue-100"}`} key={value} onClick={() => setFilter(value)} type="button">{label}</button>)}
        </nav>

        <section className="mt-4 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          {visibleOrders.map((order) => {
            const orderServices = Array.isArray(order.selected_services) && order.selected_services.length ? order.selected_services : [];
            const serviceNames = orderServices.length ? services.filter((service) => orderServices.includes(service.id)).map((service) => service.label).join(" · ") : order.package_name || "Chưa chọn dịch vụ";
            return <article className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-[1fr_auto]" key={order.id}><div><h2 className="font-extrabold text-slate-900">{order.bride_name || "Cô dâu"} & {order.groom_name || "Chú rể"}</h2><p className="mt-1 text-sm font-medium text-blue-600">{serviceNames}</p><p className="mt-2 text-xs text-slate-500">Ngày cưới: {order.wedding_date || "Chưa có"}{order.expected_delivery_date ? ` · Bàn giao: ${order.expected_delivery_date}` : ""}</p>{order.total_amount ? <p className="mt-1 text-xs text-slate-500">Tổng tiền: {Number(order.total_amount).toLocaleString("vi-VN")}đ · Đã cọc: {Number(order.deposit_amount || 0).toLocaleString("vi-VN")}đ</p> : null}{order.note ? <p className="mt-2 text-sm text-slate-600">{order.note}</p> : null}</div><select className="h-10 rounded-xl border border-blue-100 px-3 text-sm font-bold text-slate-700" onChange={(event) => updateStatus(order.id, event.target.value)} value={order.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></article>;
          })}
          {!visibleOrders.length ? <p className="p-10 text-center text-sm font-bold text-slate-500">Chưa có đơn khách nào.</p> : null}
        </section>
        {message ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{message}</p> : null}
      </section>
    </main>
  );
}

export default AdminOrders;
