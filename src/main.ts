import './style.css'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { MODES, getSteamArtUrls, getFileNames } from './utils/steam'
import { SteamGame } from './types'
import { AutocompleteInput } from './components/AutocompleteInput/AutocompleteInput'

// Global state for the current mode
let currentMode: 'vertical' | 'horizontal' = 'vertical'
let hasSearched = false

/**
 * Toggles between vertical and horizontal display modes
 */
function toggleMode(): void {
  const toggle = document.getElementById('toggleMode') as HTMLInputElement | null
  if (!toggle) return

  const toggleLabel = document.getElementById('toggleLabel')
  if (!toggleLabel) return

  currentMode = toggle.checked ? 'horizontal' : 'vertical'
  toggleLabel.innerText = toggle.checked ? 'Horizontal' : 'Vertical'

  // Update the image titles
  const img1Title = document.getElementById('img1Title')
  const img2Title = document.getElementById('img2Title')
  const img3Title = document.getElementById('img3Title')

  if (img1Title && img2Title && img3Title) {
    if (currentMode === 'vertical') {
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

function createMainAppHTML(): void {
  const container = document.querySelector('.container')
  if (!container) return

  container.innerHTML = `
    <div class="search-section">
      <h1>Steam Game Art Downloader</h1>
      <p>Search for a game to view its art</p>
      <div id="autocomplete-container"></div>
      <div class="controls">
        <div class="toggle-container">
          <label class="switch">
            <input type="checkbox" id="toggleMode" />
            <span class="slider"></span>
          </label>
          <span id="toggleLabel">Vertical</span>
        </div>
        <button class="zip-button">Download All as ZIP</button>
      </div>
    </div>
    <div class="preview" id="previewArea">
      <div class="preview-item">
        <div class="image-container">
          <img id="img1" src="" alt="Image 1" onerror="this.src=''" />
          <div class="overlay">
            <h3 id="img1Title">Game Cover</h3>
            <a id="img1Download" class="download-button" href="#" download>
              <span class="icon">⬇️</span>
              <span class="text">Download</span>
            </a>
          </div>
        </div>
      </div>
      <div class="preview-item">
        <div class="image-container">
          <img id="img2" src="" alt="Image 2" onerror="this.src=''" />
          <div class="overlay">
            <h3 id="img2Title">Game Page Background</h3>
            <a id="img2Download" class="download-button" href="#" download>
              <span class="icon">⬇️</span>
              <span class="text">Download</span>
            </a>
          </div>
        </div>
      </div>
      <div class="preview-item">
        <div class="image-container">
          <img id="img3" src="" alt="Image 3" onerror="this.src=''" />
          <div class="overlay">
            <h3 id="img3Title">Game Logo</h3>
            <a id="img3Download" class="download-button" href="#" download>
              <span class="icon">⬇️</span>
              <span class="text">Download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
}

function setupEventListeners(): void {
  const toggleMode = document.getElementById('toggleMode') as HTMLInputElement
  const zipButton = document.querySelector('.zip-button')
  const autocompleteContainer = document.getElementById('autocomplete-container')

  if (!toggleMode || !zipButton || !autocompleteContainer) return

  toggleMode.addEventListener('change', toggleMode)
  zipButton.addEventListener('click', downloadZip)

  // Initialize AutocompleteInput
  const autocompleteInput = new AutocompleteInput({
    onSelect: (game: SteamGame) => {
      updateImages()
    }
  })

  autocompleteContainer.appendChild(autocompleteInput)
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  createMainAppHTML()
  setupEventListeners()
  document.body.classList.remove('loading')
})
