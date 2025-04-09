export interface FuzzySearchOptions {
  threshold?: number;
  limit?: number;
  includeMatches?: boolean;
  caseSensitive?: boolean;
}

export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  matches: number[];
}
