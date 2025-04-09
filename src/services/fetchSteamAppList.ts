import { SteamAppList } from '@/types'


// fetch the Steam app list from the public directory
async function fetchSteamAppList(): Promise<SteamAppList> {
  const response = await fetch('/steamAppList.json')
  if (!response.ok) {
    throw new Error('Failed to fetch Steam app list')
  }

  const data = response.json()
  console.log('Fetched Steam app list:', data)
  return data
}


export default fetchSteamAppList
