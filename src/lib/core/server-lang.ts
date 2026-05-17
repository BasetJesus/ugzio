import { cookies } from "next/headers";
import { t as translate } from "@/context/translations";
import type { Lang } from "@/context/translations";

export async function getServerLang(): Promise<Lang> {
  try {
    const store = await cookies();
    const v = store.get("ugzio_lang")?.value;
    if (v === "ar" || v === "fr" || v === "en") return v;
  } catch {}
  return "fr";
}

export function st(lang: Lang, key: string): string {
  return translate(key, lang);
}
