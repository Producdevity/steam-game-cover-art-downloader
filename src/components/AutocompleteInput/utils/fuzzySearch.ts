import calculateScore from '@/components/AutocompleteInput/utils/calculateScore'
import { FuzzySearchOptions, FuzzySearchResult } from './types'

/**
 * Performs a fuzzy search on a list of items
 *
 * @param list The list of items to search through
 * @param query The search query
 * @param accessor Function that returns the string to search within an item
 * @param options Search options
 * @returns Array of results with scores and matches
 */
function fuzzySearch<T>(
  list: T[],
  query: string,
  accessor: (item: T) => string,
  options: FuzzySearchOptions = {},
): FuzzySearchResult<T>[] {
  const { threshold = 0.6, limit = 5, includeMatches = false, caseSensitive = false } = options

  if (!query || query.length === 0) {
    return []
  }

  const results: FuzzySearchResult<T>[] = []
  const searchQuery = caseSensitive ? query : query.toLowerCase()

  for (const item of list) {
    const str = accessor(item)
    const searchIn = caseSensitive ? str : str.toLowerCase()

    const { score, matches } = calculateScore(searchIn, searchQuery)

    if (score >= threshold) {
      results.push({
        item,
        score,
        matches: includeMatches ? matches : [],
      })
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score)

  // Apply limit
  return results.slice(0, limit)
}

export default fuzzySearch
