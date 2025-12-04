/**
 * Music Link Detector Service
 * Detects and identifies music streaming service URLs from message text
 */

export enum MusicService {
  SPOTIFY = 'Spotify',
  APPLE_MUSIC = 'Apple Music',
  TIDAL = 'Tidal',
  QOBUZ = 'Qobuz',
  YOUTUBE_MUSIC = 'YouTube Music',
  BANDCAMP = 'Bandcamp',
  UNKNOWN = 'Unknown'
}

/**
 * Regex patterns for detecting music service URLs
 */
const MUSIC_URL_PATTERNS = {
  [MusicService.SPOTIFY]: /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+/i,
  [MusicService.APPLE_MUSIC]: /https?:\/\/music\.apple\.com\/[a-z]{2}\/(album|playlist|song)\/[^?\s]+/i,
  [MusicService.TIDAL]: /https?:\/\/(listen\.)?tidal\.com\/(browse\/)?(track|album|playlist)\/[a-zA-Z0-9-]+/i,
  [MusicService.QOBUZ]: /https?:\/\/(open|play)\.qobuz\.com\/[a-z]+\/[^?\s]+/i,
  [MusicService.YOUTUBE_MUSIC]: /https?:\/\/music\.youtube\.com\/(watch|playlist|browse)\/[^?\s]+/i,
  [MusicService.BANDCAMP]: /https?:\/\/[a-zA-Z0-9-]+\.bandcamp\.com\/(track|album)\/[^?\s]+/i,
};

/**
 * Extracts the first music service URL from a message
 * @param messageText - The Slack message text
 * @returns The first music URL found, or null if none found
 */
export function extractMusicLink(messageText: string): string | null {
  if (!messageText) return null;

  // Try each pattern
  for (const pattern of Object.values(MUSIC_URL_PATTERNS)) {
    const match = messageText.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Identifies which music service a URL belongs to
 * @param url - The music URL to identify
 * @returns The music service enum value
 */
export function identifyMusicService(url: string): MusicService {
  if (!url) return MusicService.UNKNOWN;

  for (const [service, pattern] of Object.entries(MUSIC_URL_PATTERNS)) {
    if (pattern.test(url)) {
      return service as MusicService;
    }
  }

  return MusicService.UNKNOWN;
}

/**
 * Checks if a message contains any music service links
 * @param messageText - The message text to check
 * @returns True if message contains a music link
 */
export function hasMusicLink(messageText: string): boolean {
  return extractMusicLink(messageText) !== null;
}

