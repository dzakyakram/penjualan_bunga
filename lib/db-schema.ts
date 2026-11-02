// Membaca struktur tabel asli dari Supabase (sama seperti schema.js), dipakai sebagai cadangan
// bila nama kolom di database berbeda dengan yang diharapkan kode.
export type TableInfo = { columns: string[]; required: string[] }

let cache: Map<string, TableInfo> | null = null

export async function getTableInfo(table: string): Promise<TableInfo | null> {
  try {
    if (!cache) {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!base || !key) return null
      const res = await fetch(`${base}/rest/v1/`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: 'no-store',
      })
      if (!res.ok) return null
      const spec = await res.json()
      const defs = (spec.definitions ?? spec.components?.schemas ?? {}) as Record<string, any>
      cache = new Map(
        Object.entries(defs).map(([name, def]) => [
          name,
          { columns: Object.keys(def.properties ?? {}), required: (def.required ?? []) as string[] },
        ])
      )
    }
    return cache.get(table) ?? null
  } catch {
    return null
  }
}

/** Susun baris dari daftar [kemungkinan nama kolom, nilai]; hanya kolom yang benar-benar ada yang dipakai. */
export function buildRow(info: TableInfo, spec: [string[], unknown][]) {
  const row: Record<string, unknown> = {}
  for (const [candidates, value] of spec) {
    const col = candidates.find((c) => info.columns.includes(c))
    if (col) row[col] = value
  }
  return row
}
