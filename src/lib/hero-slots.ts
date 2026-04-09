import type { HomeCustomRow } from "@/lib/db";

export type HeroSlotPaths = [string | null, string | null, string | null, string | null];

export type HeroSlotView = {
  imagePath: string | null;
  subtitle: string;
  linkUrl: string;
  /** índice fixo 0–3 nas quatro posições */
  slotIndex: number;
};

function parseJsonStringArray(raw: string | null | undefined, len: number): string[] {
  if (raw == null || raw === "") {
    return Array(len).fill("");
  }
  try {
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return Array(len).fill("");
    return Array.from({ length: len }, (_, i) => (typeof a[i] === "string" ? a[i] : String(a[i] ?? "")));
  } catch {
    return Array(len).fill("");
  }
}

export function getHeroSlotPaths(row: HomeCustomRow | null): HeroSlotPaths {
  if (!row) return [null, null, null, null];
  return [
    row.hero_image_path ?? null,
    row.hero_image_path_2 ?? null,
    row.hero_image_path_3 ?? null,
    row.hero_image_path_4 ?? null,
  ];
}

export function getHeroSlotsView(row: HomeCustomRow | null): HeroSlotView[] {
  const paths = getHeroSlotPaths(row);
  const subs = parseJsonStringArray(row?.slot_subtitles_json, 4);
  const links = parseJsonStringArray(row?.slot_links_json, 4);
  return paths.map((imagePath, i) => ({
    imagePath,
    subtitle: (subs[i] ?? "").trim(),
    linkUrl: (links[i] ?? "").trim(),
    slotIndex: i,
  }));
}

export function getExtraImagePaths(row: HomeCustomRow | null): string[] {
  try {
    const a = JSON.parse(row?.extra_images_json ?? "[]") as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}
