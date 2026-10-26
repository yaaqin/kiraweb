import { API_URL } from "./config";
import type { CatalogItem } from "./types";

/** Public, uncached read so price changes in the dashboard show up immediately. */
export async function getPublicCatalog(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(`${API_URL}/catalog`);
    return res.ok ? ((await res.json()) as CatalogItem[]) : [];
  } catch {
    return [];
  }
}
