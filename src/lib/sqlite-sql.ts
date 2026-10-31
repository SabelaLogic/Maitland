/** Turn the app's Postgres SQL into something D1 (SQLite) can run. */

export function toSqlite(sql: string): string {
  return sql
    .replace(/now\(\)\s*\+\s*interval\s+'(\d+)\s+hours'/gi, "datetime('now', '+$1 hours')")
    .replace(/default\s+now\(\)/gi, "default (datetime('now'))")
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/\btimestamptz\b/gi, "text")
    .replace(/\bboolean\b/gi, "integer")
    .replace(/::text\b/gi, "")
    .replace(/::int\b/gi, "");
}

/** `$1` placeholders become `?`, and the values follow the order they appear. */
export function toD1Query(
  sql: string,
  params: unknown[] = [],
): { sql: string; params: unknown[] } {
  const ordered: unknown[] = [];
  const text = toSqlite(sql).replace(/\$(\d+)/g, (_match, index: string) => {
    const value = params[Number(index) - 1];
    if (typeof value === "boolean") ordered.push(value ? 1 : 0);
    else if (value instanceof Date) ordered.push(value.toISOString());
    else ordered.push(value === undefined ? null : value);
    return "?";
  });
  return { sql: text, params: ordered };
}
