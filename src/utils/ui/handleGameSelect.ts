import { SteamGame } from '@/types'
import updateImages from './updateImages'

/**
 * Handles the selection of a game from the autocomplete
 */
function handleGameSelect(game: SteamGame): void {
  const appIdInput = document.querySelector<HTMLInputElement>('#appIdInput')
  if (!appIdInput) return
  appIdInput.value = game.appid.toString()

  updateImages()
}

export default handleGameSelect
