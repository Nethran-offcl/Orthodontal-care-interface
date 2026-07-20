/** Strips PostgREST or()-filter syntax characters so a free-text search term can't alter the query shape. */
export function sanitizeSearchTerm(query: string): string {
  return query.replace(/[,()%]/g, ' ').trim()
}
