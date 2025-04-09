import { SteamAppList } from '@/types'

// fetch the Steam app list from the public directory
async function fetchSteamAppList(): Promise<SteamAppList> {
  const res = await fetch('/steamAppList.json')
  if (!res.ok) {
    throw new Error('Failed to fetch Steam app list')
  }

  return res.json()
}

export default fetchSteamAppList
