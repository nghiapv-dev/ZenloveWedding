const ZENLOVE_ORIGIN = "https://zenlove.me";

export function zenLoveTemplatePreviewUrl(url, slug) {
  if (slug) {
    return `${ZENLOVE_ORIGIN}/template/${encodeURIComponent(slug)}/preview`;
  }
  if (!url) return url;

  try {
    const parsed = new URL(url);
    if (!["zenlove.me", "www.zenlove.me"].includes(parsed.hostname)) {
      return url;
    }

    const match = parsed.pathname.match(
      /^\/(?:template|template-preview|templates)\/([^/]+)(?:\/preview)?\/?$/,
    );
    if (!match) return url;

    parsed.pathname = `/template/${match[1]}/preview`;
    return parsed.toString();
  } catch {
    return url;
  }
}
