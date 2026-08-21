const TIME_ZONE = "Asia/Ho_Chi_Minh";

function vietnamToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function vietnamDate(isoDate) {
  if (!isoDate) return "Chưa đặt";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`Supabase returned ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

async function getAdminEmails() {
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!response.ok) throw new Error(`Supabase Auth returned ${response.status}: ${await response.text()}`);
  const result = await response.json();

  // The project currently grants admin access to authenticated Supabase users.
  // If customer accounts are added later, replace this with a dedicated admin-role filter.
  return [...new Set((result.users || []).map((user) => user.email).filter(Boolean))];
}

function orderRow(order, reminder) {
  const services = Array.isArray(order.selected_services) && order.selected_services.length
    ? order.selected_services.join(", ")
    : order.package_name || "Chưa chọn dịch vụ";
  return `<tr><td>${order.bride_name || "Cô dâu"} &amp; ${order.groom_name || "Chú rể"}</td><td>${services}</td><td>${vietnamDate(order.expected_delivery_date)}</td><td>${reminder.label}</td></tr>`;
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Only GET is supported." });
  }

  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return response.status(401).json({ error: "Unauthorized cron request." });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY || !process.env.ZENLOVE_EMAIL_FROM) {
    return response.status(500).json({ error: "Missing reminder environment variables." });
  }

  try {
    const today = vietnamToday();
    const reminders = [
      { type: "seven_days", label: "Còn 7 ngày", date: addDays(today, 7) },
      { type: "three_days", label: "Còn 3 ngày", date: addDays(today, 3) },
    ];
    const allOrders = (await Promise.all(reminders.map((reminder) => supabaseRequest(
      `customer_orders?select=id,bride_name,groom_name,package_name,selected_services,expected_delivery_date,status&expected_delivery_date=eq.${reminder.date}&status=not.in.(completed)`,
    )))).flat();
    const orderIds = [...new Set(allOrders.map((order) => order.id))];
    if (!orderIds.length) return response.status(200).json({ sent: 0, message: "No upcoming deadlines." });

    const recorded = await supabaseRequest(
      `order_deadline_reminders?select=order_id,reminder_type&order_id=in.(${orderIds.join(",")})`,
    );
    const sentKeys = new Set(recorded.map((item) => `${item.order_id}:${item.reminder_type}`));
    const pending = reminders.flatMap((reminder) => allOrders
      .filter((order) => order.expected_delivery_date === reminder.date && !sentKeys.has(`${order.id}:${reminder.type}`))
      .map((order) => ({ order, reminder })));
    if (!pending.length) return response.status(200).json({ sent: 0, message: "Reminders already sent." });

    const adminEmails = await getAdminEmails();
    if (!adminEmails.length) throw new Error("No Supabase admin email was found.");

    const email = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ZENLOVE_EMAIL_FROM,
        to: adminEmails,
        subject: `[ZenLove] ${pending.length} đơn sắp đến hạn`,
        html: `<h2>Đơn sắp đến hạn bàn giao</h2><p>Danh sách cần xử lý hôm nay:</p><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#dbeafe"><thead><tr><th>Khách hàng</th><th>Dịch vụ</th><th>Deadline</th><th>Nhắc hạn</th></tr></thead><tbody>${pending.map(({ order, reminder }) => orderRow(order, reminder)).join("")}</tbody></table><p>Mở Admin ZenLove để cập nhật tiến độ.</p>`,
      }),
    });
    if (!email.ok) throw new Error(`Resend returned ${email.status}: ${await email.text()}`);

    await supabaseRequest("order_deadline_reminders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(pending.map(({ order, reminder }) => ({ order_id: order.id, reminder_type: reminder.type }))),
    });
    return response.status(200).json({ sent: pending.length, recipients: adminEmails.length });
  } catch (error) {
    console.error("Deadline reminder failed", error);
    return response.status(500).json({ error: error.message });
  }
}
