import { getState, MODES, updateState } from '@/state/store'
import updateImages from './updateImages'

/**
 * Toggles between vertical and horizontal display modes
 */
function toggleMode(): void {
  const toggle = document.getElementById('toggleMode') as HTMLInputElement | null
  if (!toggle) return

  const toggleLabel = document.getElementById('toggleLabel')
  if (!toggleLabel) return

  // Update state using the store
  const newMode = toggle.checked ? MODES.HORIZONTAL : MODES.VERTICAL
  updateState({ currentMode: newMode })

  // Read state from the store
  toggleLabel.innerText = toggle.checked ? 'Horizontal' : 'Vertical'

  // Update the image titles based on the new state
  const img1Title = document.getElementById('img1Title')
  const img2Title = document.getElementById('img2Title')
  const img3Title = document.getElementById('img3Title')

  if (img1Title && img2Title && img3Title) {
    if (getState().currentMode === MODES.VERTICAL) {
      img1Title.innerText = 'Game Cover'
      img2Title.innerText = 'Game Page Background'
      img3Title.innerText = 'Game Logo'
    } else {
      img1Title.innerText = 'Capsule 616x353'
      img2Title.innerText = 'Capsule 231x87'
      img3Title.innerText = 'Header'
    }
  }

  // If a search has already been performed, update images to reflect the new mode
  if (getState().hasSearched) {
    updateImages()
  }
}

export default toggleMode
