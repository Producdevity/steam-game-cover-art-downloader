import { getState, updateState } from "@/state/store"
import { getSteamArtUrls } from "../steam"

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

  console.log('Updating images for', appId)
  // Get preview area
  const previewArea = document.getElementById('previewArea')
  if (!previewArea) return

  // Hide preview area before updating
  previewArea.classList.remove('visible')

  // Animate search section and update state
  const searchSection = document.querySelector('.search-section')
  if (searchSection && !getState().hasSearched) {
    searchSection.classList.add('active')
    updateState({ hasSearched: true })
  }

  // Get URLs based on the current mode from the store
  const urls = getSteamArtUrls(appId, getState().currentMode)

  // Update image sources
  const img1 = document.getElementById('img1') as HTMLImageElement | null
  const img2 = document.getElementById('img2') as HTMLImageElement | null
  const img3 = document.getElementById('img3') as HTMLImageElement | null

  if (img1) img1.src = urls.primary
  if (img2) img2.src = urls.background
  if (img3) img3.src = urls.logo
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

export default updateImages
