/**
 * Message Formatter Utility
 * Formats cross-platform music links into Slack-friendly messages
 */

import { MusicService } from '../services/musicLinkDetector';
import { CrossPlatformLinks } from '../services/songlinkClient';

interface ServiceInfo {
  name: string;
  url?: string;
}

/**
 * Formats cross-platform links into a Slack message
 * Excludes the original service and formats as: "Also stream this on: [Service](url) | [Service](url)"
 * 
 * @param links - Links to various music services
 * @param originalService - The service from the original link (to exclude)
 * @returns Formatted Slack message with markdown links
 */
export function formatMusicLinksMessage(
  links: CrossPlatformLinks,
  originalService: MusicService
): string {
  // Map service names to their links
  const allServices: ServiceInfo[] = [
    { name: 'Apple Music', url: links.appleMusic },
    { name: 'Bandcamp', url: links.bandcamp },
    { name: 'Qobuz', url: links.qobuz },
    { name: 'Spotify', url: links.spotify },
    { name: 'Tidal', url: links.tidal },
    { name: 'YouTube Music', url: links.youtubeMusic },
  ];

  // Filter out the original service and services without links
  const availableServices = allServices.filter(
    service => service.url && service.name !== originalService
  );

  // Services we wanted to find but couldn't
  const missingServices = allServices.filter(
    service => !service.url && service.name !== originalService
  );

  // Build the main message
  if (availableServices.length === 0) {
    return 'Could not find this track on other streaming services.';
  }

  // Format as: [Service Name](url) | [Service Name](url)
  const linkParts = availableServices.map(
    service => `<${service.url}|${service.name}>`
  );

  let message = `Also stream this on: ${linkParts.join(' | ')}`;

  // Add "not found" message if some services are missing
  if (missingServices.length > 0) {
    const missingNames = missingServices.map(s => s.name).join(', ');
    message += `\n\n_Could not find this on: ${missingNames}_`;
  }

  return message;
}

/**
 * Creates a simple error message for posting to Slack
 * @param error - The error that occurred
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: any): string {
  if (error.message?.includes('Rate limit')) {
    return '_Unable to fetch links due to rate limiting. Please try again in a moment._';
  }
  
  return '_Sorry, I encountered an error fetching links for this track._';
}

