import steamAppListJson from '@/db/steamAppList.json'
import { SteamAppList } from '@/types'

const steamAppList = (steamAppListJson as SteamAppList).applist.apps

export default steamAppList
