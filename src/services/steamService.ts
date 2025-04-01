import { SteamGame } from '../types'
import { LocalStorageCache } from '../utils/cache/localStorage'

const CACHE_KEY = 'steam_games_list'
const STEAM_API_URL =
  'https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json&callback=steamCallback'

export class SteamService {
  private static instance: SteamService
  private cache: LocalStorageCache

  private constructor() {
    this.cache = LocalStorageCache.getInstance()
  }

  public static getInstance(): SteamService {
    if (!SteamService.instance) {
      SteamService.instance = new SteamService()
    }
    return SteamService.instance
  }

  public async getAllGames(): Promise<SteamGame[]> {
    // Try to get from cache first
    const cachedGames = this.cache.get<SteamGame[]>(CACHE_KEY)
    if (cachedGames) {
      return cachedGames
    }

    try {
      return new Promise((resolve, reject) => {
        // Create a global callback function
        window.steamCallback = (data: { applist: { apps: SteamGame[] } }) => {
          const games = data.applist.apps
          this.cache.set(CACHE_KEY, games)
          resolve(games)
        }

        // Create and append script tag
        const script = document.createElement('script')
        script.src = STEAM_API_URL
        script.onerror = (error) => {
          console.error('Error fetching Steam games:', error)
          reject(error)
        }
        document.head.appendChild(script)
      })
    } catch (error) {
      console.error('Error fetching Steam games:', error)
      throw error
    }
  }

  public async searchGames(query: string): Promise<SteamGame[]> {
    const games = await this.getAllGames()
    const lowercaseQuery = query.toLowerCase()

    return games.filter((game) => game.name.toLowerCase().includes(lowercaseQuery)).slice(0, 10) // Limit results to 10 games
  }
}

// Add type declaration for the global callback
declare global {
  interface Window {
    steamCallback: (data: { applist: { apps: SteamGame[] } }) => void
  }
}
