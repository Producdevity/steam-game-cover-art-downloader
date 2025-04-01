interface CacheItem<T> {
  data: T
  timestamp: number
}

export class LocalStorageCache {
  private static instance: LocalStorageCache
  private cache: Map<string, CacheItem<unknown>>
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours

  private constructor() {
    this.cache = new Map()
  }

  public static getInstance(): LocalStorageCache {
    if (!LocalStorageCache.instance) {
      LocalStorageCache.instance = new LocalStorageCache()
    }
    return LocalStorageCache.instance
  }

  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(item))
    }
    this.cache.set(key, item)
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key) || this.getItemFromStorage(key)
    if (!item) return null

    if (this.isExpired(item.timestamp)) {
      this.remove(key)
      return null
    }

    return item.data as T
  }

  public remove(key: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    this.cache.delete(key)
  }

  private getItemFromStorage(key: string): CacheItem<unknown> | null {
    if (typeof window === 'undefined') return null

    const item = window.localStorage.getItem(key)
    if (!item) return null

    try {
      const parsed = JSON.parse(item) as CacheItem<unknown>
      this.cache.set(key, parsed)
      return parsed
    } catch {
      return null
    }
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.DEFAULT_TTL
  }
} 