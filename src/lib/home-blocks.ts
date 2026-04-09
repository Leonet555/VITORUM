export type HomeBlock =
  | { id: string; type: "link"; label: string; url: string }
  | { id: string; type: "photo"; label: string; image_path: string }
  | { id: string; type: "date"; label: string; date: string };

export function parseHomeBlocks(json: string): HomeBlock[] {
  try {
    const a = JSON.parse(json) as unknown;
    if (!Array.isArray(a)) return [];
    return a as HomeBlock[];
  } catch {
    return [];
  }
}

export function serializeHomeBlocks(blocks: HomeBlock[]): string {
  return JSON.stringify(blocks);
}
