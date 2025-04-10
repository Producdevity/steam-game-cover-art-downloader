import './style.css'
import { MODES, getState } from './state/store'
import { AutocompleteInput } from './components/AutocompleteInput/AutocompleteInput'
import { inject } from '@vercel/analytics'
import updateImages from './utils/ui/updateImages'
import toggleMode from './utils/ui/toggleMode'
import downloadZip from './utils/ui/downloadZip'
import handleGameSelect from './utils/ui/handleGameSelect'

document.addEventListener('DOMContentLoaded', () => {
  inject()
  document.body.classList.remove('loading')

  const toggleModeSwitch = document.getElementById('toggleMode') as HTMLInputElement | null
  const zipButton = document.querySelector<HTMLButtonElement>('.zip-button')
  const showArtButton = document.querySelector<HTMLButtonElement>('.show-art-button')
  const appIdInput = document.querySelector<HTMLInputElement>('#appIdInput')
  const inputGroupContainer = document.querySelector<HTMLDivElement>('.input-group-container')

  if (!toggleModeSwitch || !zipButton || !showArtButton || !appIdInput || !inputGroupContainer) {
    console.error('Required DOM elements not found')
    return
  }

  const autocomplete = new AutocompleteInput(handleGameSelect, 'Search for a Steam game...')
  const autocompleteElement = autocomplete.getElement()

  inputGroupContainer.appendChild(autocompleteElement)

  // TODO: Replace with form subsission
  // Add Enter key support (replace with Form submission later)
  appIdInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      updateImages()
    }
  })

  toggleModeSwitch.addEventListener('change', toggleMode)
  zipButton.addEventListener('click', downloadZip)
  showArtButton.addEventListener('click', updateImages)

  // Initialize with default values (read initial state)
  // updateImages() // This might trigger prematurely if appIdInput is empty initially
  // Instead, perhaps initialize the UI based on initial state without triggering a full update
  // For example, set the toggle state based on initial getState().currentMode
  const initialMode = getState().currentMode
  const toggle = document.getElementById('toggleMode') as HTMLInputElement | null
  const toggleLabel = document.getElementById('toggleLabel')
  if (toggle && toggleLabel) {
    toggle.checked = initialMode === MODES.HORIZONTAL
    toggleLabel.innerText = initialMode === MODES.HORIZONTAL ? 'Horizontal' : 'Vertical'
    // Update titles based on initial mode
    toggleMode() // Call toggleMode once to set initial titles based on the state
  }
})
