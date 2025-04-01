import './style.css'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { MODES, getSteamArtUrls, getFileNames } from './utils/steam'

// Global state for the current mode
let currentMode = MODES.VERTICAL
let hasSearched = false

/**
 * Toggles between vertical and horizontal display modes
 */
function toggleMode(): void {
  const toggle = document.getElementById('toggleMode') as HTMLInputElement | null
  if (!toggle) return

  const toggleLabel = document.getElementById('toggleLabel')
  if (!toggleLabel) return

  currentMode = toggle.checked ? MODES.HORIZONTAL : MODES.VERTICAL
  toggleLabel.innerText = toggle.checked ? 'Horizontal' : 'Vertical'

  // Update the image titles
  const img1Title = document.getElementById('img1Title')
  const img2Title = document.getElementById('img2Title')
  const img3Title = document.getElementById('img3Title')

  if (img1Title && img2Title && img3Title) {
    if (currentMode === MODES.VERTICAL) {
      img1Title.innerText = 'Game Cover'
      img2Title.innerText = 'Game Page Background'
      img3Title.innerText = 'Game Logo'
    } else {
      img1Title.innerText = 'Capsule 616x353'
      img2Title.innerText = 'Capsule 231x87'
      img3Title.innerText = 'Header'
    }
  }

  if (hasSearched) {
    updateImages()
  }
}

/**
 * Updates the images displayed on the page
 */
function updateImages(): void {
  const appIdInput = document.querySelector<HTMLInputElement>('#appIdInput')
  if (!appIdInput) return

  const appId = appIdInput.value.trim()
  if (!appId) {
    alert('Please enter a valid Steam APP_ID.')
    return
  }

  // Get preview area
  const previewArea = document.getElementById('previewArea')
  if (!previewArea) return

  // Hide preview area before updating
  previewArea.classList.remove('visible')

  // Animate search section
  const searchSection = document.querySelector('.search-section')
  if (searchSection && !hasSearched) {
    searchSection.classList.add('active')
    hasSearched = true
  }

  // Get URLs based on the current mode
  const urls = getSteamArtUrls(appId, currentMode)

  // Update image sources
  const img1 = document.getElementById('img1') as HTMLImageElement | null
  const img2 = document.getElementById('img2') as HTMLImageElement | null
  const img3 = document.getElementById('img3') as HTMLImageElement | null

  // Create an array of promises for image loading
  const imagePromises = [img1, img2, img3].map((img, index) => {
    if (!img) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve() // Resolve even on error to continue
      img.src = [urls.primary, urls.background, urls.logo][index]
    })
  })

  // Update download links
  const img1Download = document.getElementById('img1Download') as HTMLAnchorElement | null
  const img2Download = document.getElementById('img2Download') as HTMLAnchorElement | null
  const img3Download = document.getElementById('img3Download') as HTMLAnchorElement | null

  if (img1Download) img1Download.href = urls.primary
  if (img2Download) img2Download.href = urls.background
  if (img3Download) img3Download.href = urls.logo

  // Wait for all images to load before showing the preview
  Promise.all(imagePromises).then(() => {
    previewArea.classList.add('visible')
  })
}

/**
 * Downloads all images as a ZIP file
 */
async function downloadZip(): Promise<void> {
  const appIdInput = document.getElementById('appIdInput') as HTMLInputElement | null
  if (!appIdInput) return

  const appId = appIdInput.value.trim()
  if (!appId) {
    alert('Please enter a valid Steam APP_ID.')
    return
  }

  // Get URLs and file names based on current mode
  const urls = getSteamArtUrls(appId, currentMode)
  const fileNames = getFileNames(currentMode)

  try {
    const zip = new JSZip()
    const folder = zip.folder(appId)
    if (!folder) {
      console.error('Could not create folder in zip')
      return
    }

    // Fetch each image and add it to the zip
    const entries = [
      { url: urls.primary, fileName: fileNames.primary },
      { url: urls.background, fileName: fileNames.background },
      { url: urls.logo, fileName: fileNames.logo },
    ]

    for (const { url, fileName } of entries) {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch ${url}`)
        const blob = await response.blob()
        folder.file(fileName, blob)
      } catch (error) {
        console.error(`Error fetching ${url}:`, error)
        // Continue with other images even if one fails
      }
    }

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${appId}.zip`)
  } catch (error) {
    console.error('Error creating zip:', error)
    alert(`Error creating zip file: ${error}`)
  }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Remove loading class from body
  document.body.classList.remove('loading')

  const toggleModeSwitch = document.getElementById('toggleMode') as HTMLInputElement | null
  const zipButton = document.querySelector<HTMLButtonElement>('.zip-button')
  const showArtButton = document.querySelector<HTMLButtonElement>('.show-art-button')
  const appIdInput = document.querySelector<HTMLInputElement>('#appIdInput')

  if (!toggleModeSwitch || !zipButton || !showArtButton || !appIdInput) {
    console.error('Required DOM elements not found')
    return
  }

  // Add Enter key support
  appIdInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      updateImages()
    }
  })

  toggleModeSwitch.addEventListener('change', toggleMode)
  zipButton.addEventListener('click', downloadZip)
  showArtButton.addEventListener('click', updateImages)
})
