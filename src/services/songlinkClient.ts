/**
 * Songlink/Odesli API Client
 * Fetches cross-platform music links using the Songlink API
 */

import axios from 'axios';

const SONGLINK_API_URL = 'https://api.song.link/v1-alpha.1/links';

export interface SonglinkPlatformLink {
  url: string;
  nativeAppUriMobile?: string;
  nativeAppUriDesktop?: string;
}

export interface SonglinkResponse {
  linksByPlatform: {
    spotify?: SonglinkPlatformLink;
    appleMusic?: SonglinkPlatformLink;
    tidal?: SonglinkPlatformLink;
    qobuz?: SonglinkPlatformLink;
    youtube?: SonglinkPlatformLink;
    youtubeMusic?: SonglinkPlatformLink;
    deezer?: SonglinkPlatformLink;
    bandcamp?: SonglinkPlatformLink;
  };
  entitiesByUniqueId?: Record<string, any>;
  pageUrl: string;
}

export interface CrossPlatformLinks {
  spotify?: string;
  appleMusic?: string;
  tidal?: string;
  qobuz?: string;
  youtubeMusic?: string;
  bandcamp?: string;
}

export interface TrackMetadata {
  artist?: string;
  title?: string;
  isrc?: string;
  album?: string;
}

export interface CrossPlatformResult {
  links: CrossPlatformLinks;
  metadata: TrackMetadata;
}

/**
 * Fetches cross-platform links for a given music URL
 * @param musicUrl - The original music service URL
 * @returns Object containing links and metadata about the track
 */
export async function getCrossPlatformLinks(
  musicUrl: string
): Promise<CrossPlatformResult> {
  try {
    const response = await axios.get<SonglinkResponse>(SONGLINK_API_URL, {
      params: {
        url: musicUrl,
        userCountry: 'US', // Can be made configurable
      },
      timeout: 15000, // 15 second timeout
    });

    const { linksByPlatform, entitiesByUniqueId } = response.data;

    // Extract just the URLs we care about
    const links: CrossPlatformLinks = {
      spotify: linksByPlatform.spotify?.url,
      appleMusic: linksByPlatform.appleMusic?.url,
      tidal: linksByPlatform.tidal?.url,
      qobuz: linksByPlatform.qobuz?.url,
      youtubeMusic: linksByPlatform.youtubeMusic?.url,
      bandcamp: linksByPlatform.bandcamp?.url,
    };

    // Extract metadata from the first available entity
    const metadata: TrackMetadata = {};
    if (entitiesByUniqueId) {
      const firstEntity = Object.values(entitiesByUniqueId)[0] as any;
      if (firstEntity) {
        metadata.title = firstEntity.title;
        metadata.artist = firstEntity.artistName;
        metadata.isrc = firstEntity.isrc;
        metadata.album = firstEntity.albumName;
      }
    }

    return {
      links,
      metadata,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error('Songlink: Music not found', { musicUrl });
        return { links: {}, metadata: {} }; // No matches found
      }
      if (error.response?.status === 429) {
        console.error('Songlink: Rate limit exceeded');
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      console.error('Songlink API error:', {
        status: error.response?.status,
        message: error.message,
      });
    } else {
      console.error('Unexpected error fetching cross-platform links:', error);
    }
    throw error;
  }
}

/**
 * Checks if Songlink API is healthy
 * @returns True if API is responding
 */
export async function checkSonglinkHealth(): Promise<boolean> {
  try {
    // Use a known working Spotify URL as a health check
    await axios.get(SONGLINK_API_URL, {
      params: {
        url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp', // Mr. Brightside by The Killers
      },
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

