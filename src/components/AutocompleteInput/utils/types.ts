export interface FuzzySearchOptions {
  threshold?: number
  limit?: number
  includeMatches?: boolean
  caseSensitive?: boolean
}

export interface Match {
  start: number
  end: number
  indices: number[]
}

export interface FuzzySearchResult<T> {
  item: T
  score: number
  matches?: Match[]
}
