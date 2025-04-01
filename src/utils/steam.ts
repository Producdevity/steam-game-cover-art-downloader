import { DisplayMode, GameArtUrls, GameArtFileNames } from '../types'

export const MODES = {
  VERTICAL: 'vertical' as DisplayMode,
  HORIZONTAL: 'horizontal' as DisplayMode,
}

export function getSteamArtUrls(appId: string, mode: DisplayMode): GameArtUrls {
  if (mode === MODES.VERTICAL) {
    return {
      primary: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_600x900_2x.jpg`,
      background: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_hero.jpg`,
      logo: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/logo.png`,
    }
  } else {
    return {
      primary: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_616x353.jpg`,
      background: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/capsule_231x87.jpg`,
      logo: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`,
    }
  }
}

export function getFileNames(mode: DisplayMode): GameArtFileNames {
  if (mode === MODES.VERTICAL) {
    return {
      primary: 'game_cover.jpg',
      background: 'game_page_background.jpg',
      logo: 'game_logo.png',
    }
  } else {
    return {
      primary: 'capsule_616x353.jpg',
      background: 'capsule_231x87.jpg',
      logo: 'header.jpg',
    }
  }
}
