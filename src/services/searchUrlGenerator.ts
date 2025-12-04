/**
 * Search URL Generator Service
 * Generates search URLs for music services that aren't supported by Songlink API
 */

export interface TrackMetadata {
  artist?: string;
  title?: string;
  isrc?: string;
  album?: string;
}

/**
 * Generates a Qobuz search URL based on track metadata
 * @param metadata - Track metadata (artist, title, ISRC)
 * @returns Qobuz search URL or null if insufficient metadata
 */
export function generateQobuzSearchUrl(metadata: TrackMetadata): string | null {
  // Prefer ISRC search if available
  if (metadata.isrc) {
    const encodedIsrc = encodeURIComponent(metadata.isrc);
    return `https://www.qobuz.com/us-en/search?q=${encodedIsrc}`;
  }

  // Fall back to artist + title search
  if (metadata.artist && metadata.title) {
    const searchQuery = `${metadata.artist} ${metadata.title}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.qobuz.com/us-en/search?q=${encodedQuery}`;
  }

  // Not enough metadata to construct a search
  return null;
}

/**
 * Generates a Bandcamp search URL based on track metadata
 * @param metadata - Track metadata (artist, title)
 * @returns Bandcamp search URL or null if insufficient metadata
 */
export function generateBandcampSearchUrl(metadata: TrackMetadata): string | null {
  // Bandcamp search works best with artist + title or album
  if (metadata.artist && metadata.title) {
    const searchQuery = `${metadata.artist} ${metadata.title}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://bandcamp.com/search?q=${encodedQuery}`;
  }

  // Try artist + album if title not available
  if (metadata.artist && metadata.album) {
    const searchQuery = `${metadata.artist} ${metadata.album}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://bandcamp.com/search?q=${encodedQuery}`;
  }

  // Not enough metadata to construct a search
  return null;
}

/**
 * Generates search URLs for both Qobuz and Bandcamp
 * @param metadata - Track metadata
 * @returns Object with qobuz and bandcamp search URLs
 */
export function generateSearchUrls(metadata: TrackMetadata): {
  qobuz?: string;
  bandcamp?: string;
} {
  return {
    qobuz: generateQobuzSearchUrl(metadata) || undefined,
    bandcamp: generateBandcampSearchUrl(metadata) || undefined,
  };
}

/**
 * Sanitizes metadata strings to remove special characters that might break URLs
 * @param metadata - Raw metadata
 * @returns Sanitized metadata
 */
export function sanitizeMetadata(metadata: TrackMetadata): TrackMetadata {
  const sanitizeString = (str?: string): string | undefined => {
    if (!str) return undefined;
    // Remove excessive whitespace and trim
    return str.replace(/\s+/g, ' ').trim();
  };

  return {
    artist: sanitizeString(metadata.artist),
    title: sanitizeString(metadata.title),
    isrc: metadata.isrc, // ISRCs are already standardized
    album: sanitizeString(metadata.album),
  };
}

