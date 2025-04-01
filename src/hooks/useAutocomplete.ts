import { useState, useCallback, useEffect } from 'react'
import { SteamGame } from '../types'
import { SteamService } from '../services/steamService'

export const useAutocomplete = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SteamGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null)

  const steamService = SteamService.getInstance()

  const searchGames = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const games = await steamService.searchGames(searchQuery)
      setResults(games)
    } catch (err) {
      setError('Failed to fetch games. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimeout = window.setTimeout(() => {
      searchGames(query)
    }, 300)

    return () => window.clearTimeout(debounceTimeout)
  }, [query, searchGames])

  const handleSelect = useCallback((game: SteamGame) => {
    setSelectedGame(game)
    setQuery(game.name)
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectedGame,
    handleSelect,
  }
} 