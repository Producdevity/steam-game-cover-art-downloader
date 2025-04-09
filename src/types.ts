export type DisplayMode = 'vertical' | 'horizontal'

export interface GameArtUrls {
  primary: string
  background: string
  logo: string
}

export interface GameArtFileNames {
  primary: string
  background: string
  logo: string
}

export interface SteamGame {
  appid: number
  name: string
}

export interface SteamAppList {
  applist: {
    apps: SteamGame[]
  }
}

