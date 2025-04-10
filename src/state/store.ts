import { DisplayMode } from '../types' // Import DisplayMode from types instead of utils/steam

// Define MODES locally or import if needed elsewhere, for now define locally
export const MODES = {
  VERTICAL: 'vertical' as DisplayMode,
  HORIZONTAL: 'horizontal' as DisplayMode,
}


interface AppState {
  currentMode: DisplayMode
  hasSearched: boolean
  // Add other state properties as needed
}

type Listener = (state: AppState) => void

let state: AppState = {
  currentMode: MODES.VERTICAL,
  hasSearched: false,
}

const listeners: Set<Listener> = new Set() // Use Set for easier listener management

function notifyListeners(): void {
  // Create a frozen copy to pass to listeners
  const frozenState = Object.freeze({ ...state })
  listeners.forEach((listener) => listener(frozenState))
}

export function getState(): Readonly<AppState> {
  return Object.freeze({ ...state }) // Return a frozen copy
}

export function updateState(newState: Partial<AppState>): void {
  // Check if the state actually changed
  const changed = Object.keys(newState).some(
    (key) => state[key as keyof AppState] !== newState[key as keyof AppState]
  )

  if (changed) {
    state = { ...state, ...newState }
    notifyListeners()
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  // Provide an unsubscribe function
  return () => {
    listeners.delete(listener)
  }
} 