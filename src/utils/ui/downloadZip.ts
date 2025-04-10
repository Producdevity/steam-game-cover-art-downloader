import { getState } from '@/state/store'
import { getFileNames, getSteamArtUrls } from '../steam'
import JSZip from 'jszip'
import saveAs from 'file-saver'

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

  console.log('Starting download zip for', appId)

  // Get URLs and file names based on current mode from the store
  const urls = getSteamArtUrls(appId, getState().currentMode)
  const fileNames = getFileNames(getState().currentMode)

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

export default downloadZip
