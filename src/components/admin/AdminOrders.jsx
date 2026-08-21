import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Eye,
  Image,
  MoreVertical,
  Music,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const statusLabels = {
  new: "Mới nhận",
  working: "Đang làm",
  review: "Chờ khách duyệt",
  completed: "Hoàn thành",
};
const statusStyles = {
  new: "bg-blue-50 text-blue-600",
  working: "bg-amber-50 text-amber-600",
  review: "bg-violet-50 text-violet-600",
  completed: "bg-emerald-50 text-emerald-600",
};
const services = [
  {
    id: "wedding",
    label: "Thiệp cưới",
    note: "Thiệp online",
    icon: Image,
    tone: "blue",
  },
  {
    id: "slide",
    label: "Slide cưới",
    note: "Video / slideshow",
    icon: Video,
    tone: "violet",
  },
  {
    id: "background",
    label: "Màn sao băng",
    note: "Hiệu ứng màn hình",
    icon: Sparkles,
    tone: "amber",
  },
  {
    id: "music",
    label: "Nhạc cưới",
    note: "Danh sách bài hát",
    icon: Music,
    tone: "rose",
  },
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
      {label}
      {required ? <span className="text-blue-600"> *</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ServicePill({ serviceId }) {
  const service = services.find((item) => item.id === serviceId);
  const tones = {
    wedding: "bg-blue-50 text-blue-600",
    slide: "bg-violet-50 text-violet-600",
    background: "bg-amber-50 text-amber-600",
    music: "bg-rose-50 text-rose-600",
  };

  return <span className={`whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold ${tones[serviceId] || "bg-slate-100 text-slate-600"}`}>{service?.label || serviceId}</span>;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    query: "",
    service: "all",
    status: "all",
  });

  const inputClass =
    "h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const remaining = Math.max(
    Number(form.total_amount || 0) - Number(form.deposit_amount || 0),
    0,
  );

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

  const updateForm = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const selected = (serviceId) => form.selected_services.includes(serviceId);
  const toggleService = (serviceId) =>
    updateForm(
      "selected_services",
      selected(serviceId)
        ? form.selected_services.filter((item) => item !== serviceId)
        : [...form.selected_services, serviceId],
    );
  const serviceIds = (order) =>
    Array.isArray(order.selected_services) ? order.selected_services : [];
  const serviceNames = (order) => {
    const ids = serviceIds(order);
    return ids.length
      ? services
          .filter((service) => ids.includes(service.id))
          .map((service) => service.label)
          .join(" · ")
      : order.package_name || "Chưa chọn dịch vụ";
  };
  const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;
  const formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(`${value}T00:00:00Z`))
      : "—";

  const openCreate = () => {
    setEditingOrder(null);
    setForm(emptyForm);
    setShowForm(true);
    setActiveMenu(null);
  };
  const openEdit = (order) => {
    setEditingOrder(order);
    setForm({
      ...emptyForm,
      ...order,
      selected_services: serviceIds(order),
      slide_photo_count: order.slide_photo_count || "",
      total_amount: order.total_amount || "",
      deposit_amount: order.deposit_amount || "",
    });
    setShowForm(true);
    setActiveMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingOrder(null);
    setForm(emptyForm);
  };

  const saveOrder = async (event) => {
    event.preventDefault();
    if (
      !form.bride_name ||
      !form.groom_name ||
      !form.wedding_date ||
      !form.selected_services.length
    )
      return setMessage(
        "Hãy nhập tên cô dâu, chú rể, ngày cưới và chọn ít nhất một dịch vụ.",
      );
    const serviceNamesForForm = services
      .filter((service) => form.selected_services.includes(service.id))
      .map((service) => service.label);
    const payload = {
      ...form,
      package_name: serviceNamesForForm.join(", "),
      template_name:
        form.wedding_template_name ||
        form.slide_template_name ||
        form.background_template_name ||
        null,
      slide_photo_count: form.slide_photo_count
        ? Number(form.slide_photo_count)
        : null,
      total_amount: Number(form.total_amount || 0),
      deposit_amount: Number(form.deposit_amount || 0),
      updated_at: new Date().toISOString(),
    };
    const result = editingOrder
      ? await supabase
          .from("customer_orders")
          .update(payload)
          .eq("id", editingOrder.id)
      : await supabase.from("customer_orders").insert(payload);
    if (result.error)
      return setMessage(
        `${result.error.message}. Hãy chạy migration chi tiết đơn hàng trong Supabase.`,
      );
    closeForm();
    setMessage("");
    await loadOrders();
  };
  const deleteOrder = async (order) => {
    setActiveMenu(null);
    if (
      !window.confirm(`Xóa đơn của ${order.bride_name} & ${order.groom_name}?`)
    )
      return;
    const { error } = await supabase
      .from("customer_orders")
      .delete()
      .eq("id", order.id);
    if (error) setMessage(error.message);
    else loadOrders();
  };

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const searchText =
          `${order.bride_name || ""} ${order.groom_name || ""}`.toLowerCase();
        const ids = serviceIds(order);
        return (
          (!filters.query ||
            searchText.includes(filters.query.toLowerCase())) &&
          (filters.service === "all" || ids.includes(filters.service)) &&
          (filters.status === "all" || order.status === filters.status)
        );
      }),
    [orders, filters],
  );

  return (
    <main className="admin-ui min-h-screen p-4 text-slate-800 sm:p-6">
      <section className="mx-auto max-w-[1400px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold">
                Quản lý đơn khách hàng
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý tất cả đơn hàng thiệp cưới, slide cưới, màn sao băng và
                nhạc cưới.
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
            onClick={showForm ? closeForm : openCreate}
            type="button"
          >
            <Plus size={17} />
            {showForm ? "Đóng form" : "Tạo đơn mới"}
          </button>
        </header>

        {showForm ? (
          <form
            className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7"
            onSubmit={saveOrder}
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-extrabold">
                <ClipboardList size={18} className="text-blue-600" />{" "}
                {editingOrder ? "CHỈNH SỬA ĐƠN HÀNG" : "THÔNG TIN KHÁCH HÀNG"}
              </p>
              {editingOrder ? (
                <button
                  className="text-sm font-bold text-slate-500 hover:text-blue-600"
                  onClick={closeForm}
                  type="button"
                >
                  Hủy chỉnh sửa
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên cô dâu" required>
                <input
                  className={inputClass}
                  placeholder="Nhập tên cô dâu"
                  value={form.bride_name}
                  onChange={(event) =>
                    updateForm("bride_name", event.target.value)
                  }
                />
              </Field>
              <Field label="Tên chú rể" required>
                <input
                  className={inputClass}
                  placeholder="Nhập tên chú rể"
                  value={form.groom_name}
                  onChange={(event) =>
                    updateForm("groom_name", event.target.value)
                  }
                />
              </Field>
              <Field label="Ngày cưới" required>
                <input
                  className={inputClass}
                  type="date"
                  value={form.wedding_date}
                  onChange={(event) =>
                    updateForm("wedding_date", event.target.value)
                  }
                />
              </Field>
            </div>
            <section className="mt-7">
              <p className="flex items-center gap-2 text-sm font-extrabold">
                <Sparkles size={18} className="text-blue-600" /> DỊCH VỤ KHÁCH
                ĐẶT
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {services.map(({ id, label, note, icon: Icon, tone }) => (
                  <button
                    className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition ${selected(id) ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100" : "border-slate-200 hover:border-blue-200"}`}
                    key={id}
                    onClick={() => toggleService(id)}
                    type="button"
                  >
                    <span
                      className={`grid size-10 place-items-center rounded-xl ${tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "amber" ? "bg-amber-50 text-amber-500" : tone === "rose" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-600"}`}
                    >
                      <Icon size={20} />
                    </span>
                    <span>
                      <strong className="block text-sm">{label}</strong>
                      <small className="block text-xs text-slate-500">
                        {note}
                      </small>
                    </span>
                    {selected(id) ? (
                      <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-md bg-blue-600 text-white">
                        <Check size={13} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {selected("wedding") ? (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <Field label="Mẫu thiệp đã chọn">
                    <input
                      className={inputClass}
                      placeholder="Ví dụ: Mẫu 18"
                      value={form.wedding_template_name}
                      onChange={(event) =>
                        updateForm("wedding_template_name", event.target.value)
                      }
                    />
                  </Field>
                </div>
              ) : null}
              {selected("slide") ? (
                <div className="mt-4 grid gap-4 rounded-2xl border border-violet-100 bg-violet-50/30 p-4 md:grid-cols-2">
                  <Field label="Mẫu slide đã chọn">
                    <input
                      className={inputClass}
                      placeholder="Ví dụ: Mẫu 03"
                      value={form.slide_template_name}
                      onChange={(event) =>
                        updateForm("slide_template_name", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Số lượng ảnh dự kiến">
                    <input
                      className={inputClass}
                      min="0"
                      placeholder="Ví dụ: 35"
                      type="number"
                      value={form.slide_photo_count}
                      onChange={(event) =>
                        updateForm("slide_photo_count", event.target.value)
                      }
                    />
                  </Field>
                </div>
              ) : null}
              {selected("background") ? (
                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                  <Field label="Mẫu màn sao băng đã chọn">
                    <input
                      className={inputClass}
                      placeholder="Ví dụ: Mẫu 05"
                      value={form.background_template_name}
                      onChange={(event) =>
                        updateForm(
                          "background_template_name",
                          event.target.value,
                        )
                      }
                    />
                  </Field>
                </div>
              ) : null}
            </section>
            <section className="mt-7">
              <p className="flex items-center gap-2 text-sm font-extrabold">
                <CalendarDays size={18} className="text-blue-600" /> THÔNG TIN
                ĐƠN HÀNG
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Ngày bàn giao dự kiến">
                  <input
                    className={inputClass}
                    type="date"
                    value={form.expected_delivery_date}
                    onChange={(event) =>
                      updateForm("expected_delivery_date", event.target.value)
                    }
                  />
                </Field>
                <Field label="Tổng tiền (VNĐ)">
                  <input
                    className={inputClass}
                    min="0"
                    placeholder="0"
                    type="number"
                    value={form.total_amount}
                    onChange={(event) =>
                      updateForm("total_amount", event.target.value)
                    }
                  />
                </Field>
                <Field label="Đã cọc (VNĐ)">
                  <input
                    className={inputClass}
                    min="0"
                    placeholder="0"
                    type="number"
                    value={form.deposit_amount}
                    onChange={(event) =>
                      updateForm("deposit_amount", event.target.value)
                    }
                  />
                </Field>
                <Field label="Còn lại (VNĐ)">
                  <input
                    className={`${inputClass} border-emerald-200 bg-emerald-50 text-emerald-700`}
                    readOnly
                    value={remaining.toLocaleString("vi-VN")}
                  />
                </Field>
                <Field label="Trạng thái đơn hàng">
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value)
                    }
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ghi chú nội bộ">
                  <textarea
                    className="min-h-11 w-full rounded-xl border border-blue-100 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-3"
                    placeholder="Ghi chú thêm cho đơn hàng..."
                    value={form.note}
                    onChange={(event) => updateForm("note", event.target.value)}
                  />
                </Field>
              </div>
            </section>
            <button
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-extrabold text-white transition hover:bg-blue-700"
              type="submit"
            >
              <Check size={17} />
              {editingOrder ? "Lưu thay đổi" : "Tạo đơn khách"}
            </button>
          </form>
        ) : null}

        <section className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                className={`${inputClass} pl-10`}
                placeholder="Tìm kiếm tên cô dâu, chú rể..."
                value={filters.query}
                onChange={(event) =>
                  setFilters({ ...filters, query: event.target.value })
                }
              />
            </label>
            <select
              className={inputClass}
              value={filters.service}
              onChange={(event) =>
                setFilters({ ...filters, service: event.target.value })
              }
            >
              <option value="all">Tất cả dịch vụ</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.label}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-4 overflow-x-auto overflow-y-visible rounded-3xl border border-blue-100 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <table className="w-full min-w-[1380px] table-fixed text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-[5%] px-5 py-4">STT</th>
                <th className="w-[17%] px-5 py-4">Tên cô dâu & chú rể</th>
                <th className="w-[10%] px-5 py-4">Ngày cưới</th>
                <th className="w-[12%] px-5 py-4">Loại dịch vụ</th>
                <th className="w-[10%] px-5 py-4">Ngày bàn giao</th>
                <th className="w-[8%] px-5 py-4 text-right">Tiền cọc</th>
                <th className="w-[8%] px-5 py-4 text-right">Tổng tiền</th>
                <th className="w-[11%] px-5 py-4">Trạng thái</th>
                <th className="w-[14%] px-5 py-4">Ghi chú</th>
                <th className="w-[5%] px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order, index) => (
                <tr
                  className="border-b border-slate-100 last:border-0 hover:bg-blue-50/20"
                  key={order.id}
                >
                  <td className="px-5 py-5 font-extrabold text-slate-700">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-5">
                    <p className="font-extrabold text-slate-700">
                      {order.bride_name || "Cô dâu"} &{" "}
                      {order.groom_name || "Chú rể"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-5 text-sm font-medium text-slate-700">
                    {formatDate(order.wedding_date)}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {serviceIds(order).length ? (
                        serviceIds(order).map((id) => (
                          <ServicePill key={id} serviceId={id} />
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          {serviceNames(order)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-5 text-sm font-medium text-slate-700">
                    {formatDate(order.expected_delivery_date)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-5 text-right text-sm font-bold text-emerald-600">
                    {formatMoney(order.deposit_amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-5 text-right text-sm font-extrabold text-slate-900">
                    {formatMoney(order.total_amount)}
                  </td>
                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold ${statusStyles[order.status] || statusStyles.new}`}
                    >
                      <i className="size-1.5 rounded-full bg-current" />
                      {statusLabels[order.status] || "Mới nhận"}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm leading-5 text-slate-600">
                    {order.note || "—"}
                  </td>
                  <td className="relative px-5 py-5 text-center">
                    <button
                      aria-label="Thao tác đơn hàng"
                      className="inline-grid size-10 place-items-center rounded-xl border border-blue-100 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() =>
                        setActiveMenu(activeMenu === order.id ? null : order.id)
                      }
                      type="button"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === order.id ? (
                      <div className="absolute right-5 top-14 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
                          onClick={() => {
                            setViewingOrder(order);
                            setActiveMenu(null);
                          }}
                          type="button"
                        >
                          <Eye size={16} className="text-blue-600" />
                          Xem chi tiết
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
                          onClick={() => openEdit(order)}
                          type="button"
                        >
                          <Pencil size={16} className="text-amber-600" />
                          Sửa đơn
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                          onClick={() => deleteOrder(order)}
                          type="button"
                        >
                          <Trash2 size={16} />
                          Xóa đơn
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleOrders.length ? (
            <p className="p-12 text-center text-sm font-bold text-slate-500">
              Không tìm thấy đơn hàng phù hợp.
            </p>
          ) : null}
          <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            Hiển thị {visibleOrders.length} trên tổng số {orders.length} đơn
            hàng
          </p>
        </section>
        {message ? (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">
            {message}
          </p>
        ) : null}
        {viewingOrder ? (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4"
            onMouseDown={() => setViewingOrder(null)}
          >
            <article
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600">
                    Chi tiết đơn hàng
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold">
                    {viewingOrder.bride_name} & {viewingOrder.groom_name}
                  </h2>
                </div>
                <button
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  onClick={() => setViewingOrder(null)}
                  type="button"
                >
                  <X size={19} />
                </button>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-slate-500">Dịch vụ</dt>
                  <dd className="mt-1 text-sm font-bold">
                    {serviceNames(viewingOrder)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Trạng thái
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {statusLabels[viewingOrder.status]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Ngày cưới
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {formatDate(viewingOrder.wedding_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Bàn giao dự kiến
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {formatDate(viewingOrder.expected_delivery_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Tổng tiền / Đã cọc
                  </dt>
                  <dd className="mt-1 text-sm font-bold">
                    {formatMoney(viewingOrder.total_amount)} /{" "}
                    {formatMoney(viewingOrder.deposit_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-slate-500">Còn lại</dt>
                  <dd className="mt-1 text-sm font-bold text-emerald-600">
                    {formatMoney(
                      Math.max(
                        Number(viewingOrder.total_amount || 0) -
                          Number(viewingOrder.deposit_amount || 0),
                        0,
                      ),
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">
                  Ghi chú nội bộ
                </p>
                <p className="mt-1 text-sm leading-6">
                  {viewingOrder.note || "Chưa có ghi chú."}
                </p>
              </div>
              <button
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white"
                onClick={() => {
                  setViewingOrder(null);
                  openEdit(viewingOrder);
                }}
                type="button"
              >
                <Pencil size={16} />
                Sửa đơn
              </button>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default AdminOrders;
