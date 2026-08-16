const ZENLOVE_API_URL = "https://api.zenlove.me/v1/templates";
const ZENLOVE_CDN_URL = "https://cdn-resource.zenlove.me";
const ZENLOVE_WEBSITE_URL = "https://zenlove.me";
const DEFAULT_WEDDING_CATEGORY_ID = "e5a1eb86-bbde-4d17-b9f3-22a55ef0bcf2";

function sendJson(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json").json(body);
}

function requiredEnvironment() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Thiếu cấu hình Supabase trên server.");
  }
  return { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };
}

async function requireAuthenticatedUser(request, supabaseUrl, anonKey) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

async function getAllZenLoveTemplates(categoryId) {
  const templates = [];
  let page = 1;
  let totalPages = 1;

  do {
    const parameters = new URLSearchParams({
      page: String(page),
      limit: "24",
      categoryId,
      isActive: "true",
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
    const response = await fetch(`${ZENLOVE_API_URL}?${parameters}`);
    if (!response.ok) throw new Error(`ZenLove API trả về lỗi ${response.status}.`);

    const result = await response.json();
    const items = result.data?.items ?? result.items ?? [];
    templates.push(...items);
    const meta = result.data?.meta ?? result.meta;
    totalPages = meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return templates;
}

function normalizeTemplate(template, index, syncedAt) {
  const thumbnailKey = template.longThumbnailKey || template.thumbnailKey;
  if (!template.id || !template.slug || !thumbnailKey) return null;

  return {
    zenlove_id: template.id,
    title: template.name || `Mẫu ${index + 1}`,
    slug: template.slug,
    url: `${ZENLOVE_WEBSITE_URL}/templates/${template.slug}`,
    image_url: `${ZENLOVE_CDN_URL}/${thumbnailKey.replace(/^\//, "")}`,
    thumbnail_key: template.thumbnailKey || null,
    long_thumbnail_key: template.longThumbnailKey || null,
    template_type: template.templateType || null,
    category_id: template.categoryId || null,
    source: "zenlove",
    sort_order: index + 1,
    synced_at: syncedAt,
    updated_at: syncedAt,
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Chỉ hỗ trợ POST." });
  }

  try {
    const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = requiredEnvironment();
    const authenticated = await requireAuthenticatedUser(request, SUPABASE_URL, SUPABASE_ANON_KEY);
    if (!authenticated) return sendJson(response, 401, { error: "Bạn cần đăng nhập để đồng bộ." });

    const categoryId = request.body?.categoryId || process.env.ZENLOVE_WEDDING_CATEGORY_ID || DEFAULT_WEDDING_CATEGORY_ID;
    const zenLoveTemplates = await getAllZenLoveTemplates(categoryId);
    const syncedAt = new Date().toISOString();
    const rows = zenLoveTemplates
      .map((template, index) => normalizeTemplate(template, index, syncedAt))
      .filter(Boolean);

    const upsertResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/wedding_templates?on_conflict=zenlove_id`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(rows),
      },
    );
    if (!upsertResponse.ok) {
      const details = await upsertResponse.text();
      throw new Error(`Không thể lưu dữ liệu ZenLove: ${details}`);
    }

    return sendJson(response, 200, { success: true, synced: rows.length, categoryId, syncedAt });
  } catch (error) {
    console.error("ZenLove sync failed", error);
    return sendJson(response, 500, { error: error.message || "Đồng bộ ZenLove thất bại." });
  }
}
