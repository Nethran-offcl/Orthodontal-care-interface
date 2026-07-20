/**
 * Shared service contract. Every domain service in `src/services` implements this
 * shape (plus its own domain-specific extras). Methods are async on purpose: the
 * mock implementations resolve immediately, but the signature is exactly what a
 * real backend (e.g. Supabase) call would look like, so swapping the body of a
 * service later never requires touching any UI component.
 */
export interface CrudService<T, TCreate = Omit<T, 'id'>, TUpdate = Partial<T>> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(input: TCreate): Promise<T>
  update(id: string, patch: TUpdate): Promise<T>
  delete(id: string): Promise<void>
  search(query: string): Promise<T[]>
}

let idCounter = 9000
export function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

/**
 * Builds a CrudService backed by an in-memory array seeded from `mocks/`.
 * The seed is cloned so the original mock module is never mutated.
 */
export function createCrudService<T extends { id: string }, TCreate = Omit<T, 'id'>, TUpdate = Partial<T>>(
  seed: T[],
  idPrefix: string,
  matchesSearch: (item: T, query: string) => boolean = () => true,
): CrudService<T, TCreate, TUpdate> & { _all: () => T[]; _set: (records: T[]) => void } {
  let records: T[] = seed.map((r) => ({ ...r }))

  async function getAll(): Promise<T[]> {
    return [...records]
  }

  async function getById(id: string): Promise<T | undefined> {
    return records.find((r) => r.id === id)
  }

  async function create(input: TCreate): Promise<T> {
    const record = { ...(input as object), id: nextId(idPrefix) } as T
    records = [record, ...records]
    return record
  }

  async function update(id: string, patch: TUpdate): Promise<T> {
    let updated: T | undefined
    records = records.map((r) => {
      if (r.id !== id) return r
      updated = { ...r, ...(patch as object) }
      return updated
    })
    if (!updated) throw new Error(`Record not found: ${id}`)
    return updated
  }

  async function remove(id: string): Promise<void> {
    records = records.filter((r) => r.id !== id)
  }

  async function search(query: string): Promise<T[]> {
    const q = query.trim().toLowerCase()
    if (!q) return [...records]
    return records.filter((r) => matchesSearch(r, q))
  }

  return {
    getAll,
    getById,
    create,
    update,
    delete: remove,
    search,
    _all: () => records,
    _set: (next: T[]) => {
      records = next
    },
  }
}
