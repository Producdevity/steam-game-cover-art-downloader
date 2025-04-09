export class LocalStorageCache {
  private static instance: LocalStorageCache
  private readonly expirationKey = '_expires_at'

  private constructor() {}

  public static getInstance(): LocalStorageCache {
    if (!LocalStorageCache.instance) {
      LocalStorageCache.instance = new LocalStorageCache()
    }
    return LocalStorageCache.instance
  }

  public set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): void {
    const expires = Date.now() + ttl
    const item = {
      value,
      [this.expirationKey]: expires,
    }

    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('Error setting localStorage item:', error)
    }
  }

  public get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsedItem = JSON.parse(item)
      const now = Date.now()

      // Check if the item has expired
      if (parsedItem[this.expirationKey] && parsedItem[this.expirationKey] < now) {
        this.remove(key)
        return null
      }

      return parsedItem.value as T
    } catch (error) {
      console.error('Error getting localStorage item:', error)
      return null
    }
  }

  public remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing localStorage item:', error)
    }
  }

  public clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
