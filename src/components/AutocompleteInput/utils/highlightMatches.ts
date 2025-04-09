import { Match } from './types'

/**
 * Highlights matched parts of text with HTML span elements
 *
 * @param text The original text
 * @param matchData Match information
 * @returns HTML string with highlighted matches
 */
function highlightMatches(text: string, matchData: Match[] | undefined): string {
  if (!matchData || matchData.length === 0) {
    return text
  }

  // Sort matches by start position
  const sortedMatches = [...matchData].sort((a, b) => a.start - b.start)

  let result = ''
  let lastIndex = 0

  for (const match of sortedMatches) {
    // Add text before match
    if (match.start > lastIndex) {
      result += text.substring(lastIndex, match.start)
    }

    // Add highlighted match
    const matchText = text.substring(match.start, match.end)
    result += `<span class="highlight">${matchText}</span>`

    lastIndex = match.end
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result += text.substring(lastIndex)
  }

  return result
}

export default highlightMatches
