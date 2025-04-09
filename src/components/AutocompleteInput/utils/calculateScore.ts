import { Match } from './types'

/**
 * Calculates the score and finds matches between a string and a query
 */
function calculateScore(str: string, query: string): { score: number; matches: Match[] } {
  let score = 0
  let currentIndex = 0
  const matches: Match[] = []
  const indices: number[] = []
  let currentMatchStart: number | null = null

  // Loop through each character in the query
  for (let i = 0; i < query.length; i++) {
    const queryChar = query[i]
    let found = false

    // Look for the character in the remaining part of the string
    for (let j = currentIndex; j < str.length; j++) {
      if (str[j] === queryChar) {
        // Matches at the beginning are boosted
        if (j === 0 || str[j - 1] === ' ') {
          score += 0.7
        }

        // Consecutive matches are boosted
        if (j === currentIndex) {
          score += 0.3

          // If this is part of a sequence, extend the current match
          if (currentMatchStart !== null) {
            indices.push(j)
          } else {
            currentMatchStart = j
            indices.push(j)
          }
        } else {
          // If we had a sequence, close it
          if (currentMatchStart !== null) {
            matches.push({
              start: currentMatchStart,
              end: indices[indices.length - 1] + 1,
              indices: [...indices],
            })
            currentMatchStart = j
            indices.length = 0
            indices.push(j)
          } else {
            currentMatchStart = j
            indices.push(j)
          }
        }

        // Basic score for finding a match
        score += 0.1
        currentIndex = j + 1
        found = true
        break
      }
    }

    // If we couldn't find the character, penalize the score
    if (!found) {
      score -= 0.1
      // If we had an open match sequence, close it
      if (currentMatchStart !== null) {
        matches.push({
          start: currentMatchStart,
          end: indices[indices.length - 1] + 1,
          indices: [...indices],
        })
        currentMatchStart = null
        indices.length = 0
      }
    }
  }

  // Close any remaining match
  if (currentMatchStart !== null) {
    matches.push({
      start: currentMatchStart,
      end: indices[indices.length - 1] + 1,
      indices: [...indices],
    })
  }

  // Normalize score between 0-1
  // The maximum theoretical score is approximately:
  // 0.1 (base match) + 0.7 (start boost) + 0.3 (consecutive) per character
  const maxPossibleScore = query.length * 1.1
  score = Math.max(0, Math.min(1, score / maxPossibleScore))

  return { score, matches }
}

export default calculateScore
