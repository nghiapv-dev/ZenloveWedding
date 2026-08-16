import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase.js";

export function useSiteContent(fallback) {
  const [content, setContent] = useState(fallback);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from("site_content").select("value").eq("id", "website").maybeSingle().then(({ data }) => {
      if (data?.value && Object.keys(data.value).length) setContent((current) => ({ ...current, ...data.value }));
    });
  }, []);
  return content;
}
