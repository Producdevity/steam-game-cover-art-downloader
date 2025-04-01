import React, { useState, useCallback, useEffect, useRef } from 'react'
import { SteamGame } from '../../types'
import { useAutocomplete } from '../../hooks/useAutocomplete'
import './AutocompleteInput.css'

interface AutocompleteInputProps {
  onSelect: (game: SteamGame) => void
  placeholder?: string
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  onSelect,
  placeholder = 'Search for a game...',
}) => {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    handleSelect,
  } = useAutocomplete()

  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleGameSelect = useCallback(
    (game: SteamGame) => {
      handleSelect(game)
      onSelect(game)
      setIsOpen(false)
    },
    [handleSelect, onSelect],
  )

  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow click events on results
    window.setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && results.length > 0) {
        handleGameSelect(results[0])
      }
    },
    [results, handleGameSelect],
  )

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as globalThis.Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="autocomplete-container" ref={inputRef}>
      <div className="input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="autocomplete-input"
        />
        {isLoading && <div className="loading-spinner" />}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isOpen && results.length > 0 && (
        <ul className="results-list">
          {results.map((game) => (
            <li
              key={game.appid}
              onClick={() => handleGameSelect(game)}
              className="result-item"
            >
              {game.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 