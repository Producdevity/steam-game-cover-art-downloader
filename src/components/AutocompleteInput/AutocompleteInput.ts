import './AutocompleteInput.css'
import fuzzySearch from '@/components/AutocompleteInput/utils/fuzzySearch'
import highlightMatches from '@/components/AutocompleteInput/utils/highlightMatches'
import { FuzzySearchResult } from '@/components/AutocompleteInput/utils/types'
import fetchSteamAppList from '@/services/fetchSteamAppList.ts'
import { SteamAppList, SteamGame } from '@/types'

export class AutocompleteInput {
  private container!: HTMLDivElement
  private input!: HTMLInputElement
  private resultsList!: HTMLUListElement
  private loadingSpinner!: HTMLDivElement
  private errorMessage!: HTMLDivElement
  private isOpen = false
  private results: SteamGame[] = []
  private fuzzyResults: FuzzySearchResult<SteamGame>[] = []
  private isLoading = false
  private error: string | null = null
  private debounceTimeout: number | null = null
  private steamGames: SteamGame[] = []

  constructor(
    private onSelect: (game: SteamGame) => void,
    private placeholder = 'Search for a game...',
  ) {
    this.steamGames = []
    this.fetchSteamAppList()
    this.setupElements()
    this.setupEventListeners()
  }

  private fetchSteamAppList(): void {
    // Fetch the Steam app list from the public directory
    fetchSteamAppList()
      .then((data: SteamAppList) => {
        const steamGames = data.applist?.apps
        if (!steamGames) {
          throw new Error('No games found in the Steam app list')
        }
        this.steamGames = steamGames || []
      })
      .catch((error) => console.error('Error fetching Steam app list:', error))
  }

  private setupElements(): void {
    // Create container
    this.container = document.createElement('div')
    this.container.className = 'autocomplete-container'

    // Create input wrapper
    const inputWrapper = document.createElement('div')
    inputWrapper.className = 'input-wrapper'

    // Create input
    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = this.placeholder
    this.input.className = 'autocomplete-input'

    // Create loading spinner
    this.loadingSpinner = document.createElement('div')
    this.loadingSpinner.className = 'loading-spinner'
    this.loadingSpinner.style.display = 'none'

    // Create error message
    this.errorMessage = document.createElement('div')
    this.errorMessage.className = 'error-message'
    this.errorMessage.style.display = 'none'

    // Create results list
    this.resultsList = document.createElement('ul')
    this.resultsList.className = 'results-list'
    this.resultsList.style.display = 'none'

    // Assemble the component
    inputWrapper.appendChild(this.input)
    inputWrapper.appendChild(this.loadingSpinner)
    this.container.appendChild(inputWrapper)
    this.container.appendChild(this.errorMessage)
    this.container.appendChild(this.resultsList)
  }

  private setupEventListeners(): void {
    this.input.addEventListener('input', () => this.handleInput())
    this.input.addEventListener('focus', () => this.handleFocus())
    this.input.addEventListener('blur', () => this.handleBlur())
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e))

    // Click outside
    document.addEventListener('mousedown', (e) => this.handleClickOutside(e))
  }

  private async handleInput(): Promise<void> {
    const query = this.input.value.trim()

    if (this.debounceTimeout) {
      window.clearTimeout(this.debounceTimeout)
    }

    this.debounceTimeout = window.setTimeout(() => {
      if (!query) {
        this.results = []
        this.fuzzyResults = []
        this.updateResultsList()
        return
      }

      this.isLoading = true
      this.error = null
      this.updateUI()

      try {
        // Search games using fuzzy search
        this.fuzzyResults = this.searchGames(query)
        this.results = this.fuzzyResults.map((result) => result.item)
        this.updateResultsList()
      } catch (err) {
        this.error = 'Failed to search games. Please try again.'
        console.error('Search error:', err)
      } finally {
        this.isLoading = false
        this.updateUI()
      }
    }, 300)
  }

  private searchGames(query: string): FuzzySearchResult<SteamGame>[] {
    return fuzzySearch(this.steamGames, query, (game) => game.name, {
      threshold: 0.15, // Lower threshold to catch more matches
      limit: 5,
      includeMatches: true, // We need matches for highlighting
    })
  }

  private handleFocus(): void {
    this.isOpen = true
    this.updateResultsList()
  }

  private handleBlur(): void {
    // Delay closing to allow click events on results
    window.setTimeout(() => {
      this.isOpen = false
      this.updateResultsList()
    }, 200)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && this.results.length > 0) {
      this.handleGameSelect(this.results[0])
    }
  }

  private handleClickOutside(e: MouseEvent): void {
    if (!this.container.contains(e.target as Node)) {
      this.isOpen = false
      this.updateResultsList()
    }
  }

  private handleGameSelect(game: SteamGame): void {
    this.input.value = game.name
    this.results = []
    this.isOpen = false
    this.updateResultsList()
    this.onSelect(game)
  }

  private updateResultsList(): void {
    if (this.isOpen && this.fuzzyResults.length > 0) {
      this.resultsList.innerHTML = ''
      this.fuzzyResults.forEach((result) => {
        const game = result.item
        const li = document.createElement('li')
        li.className = 'result-item'

        // Create a nicer layout for each result item
        const gameInfo = document.createElement('div')
        gameInfo.className = 'game-info'

        // Game title with highlighted matches
        const title = document.createElement('div')
        title.className = 'game-title'
        title.innerHTML = highlightMatches(game.name, result.matches)

        // Game ID and score
        const id = document.createElement('div')
        id.className = 'game-id'
        id.textContent = `App ID: ${game.appid} (Score: ${result.score.toFixed(2)})`

        // Thumbnail (if available)
        const thumbnail = document.createElement('div')
        thumbnail.className = 'game-thumbnail'
        const thumbnailImg = document.createElement('img')
        thumbnailImg.src = `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/capsule_231x87.jpg`
        thumbnailImg.alt = game.name
        thumbnailImg.onerror = () => {
          // Show a placeholder if image fails to load
          thumbnail.style.display = 'none'
        }
        thumbnail.appendChild(thumbnailImg)

        // Add all elements to the result item
        gameInfo.appendChild(title)
        gameInfo.appendChild(id)
        li.appendChild(thumbnail)
        li.appendChild(gameInfo)

        // Add click event handler that calls the provided callback
        li.addEventListener('click', () => {
          this.handleGameSelect(game)
        })

        this.resultsList.appendChild(li)
      })
      this.resultsList.style.display = 'block'
    } else {
      this.resultsList.style.display = 'none'
    }
  }

  private updateUI(): void {
    this.loadingSpinner.style.display = this.isLoading ? 'block' : 'none'
    this.errorMessage.style.display = this.error ? 'block' : 'none'
    if (this.error) {
      this.errorMessage.textContent = this.error
    }
  }

  public getElement(): HTMLDivElement {
    return this.container
  }

  public destroy(): void {
    if (this.debounceTimeout) {
      window.clearTimeout(this.debounceTimeout)
    }
    document.removeEventListener('mousedown', (e) => this.handleClickOutside(e))
    this.container.remove()
  }
}
