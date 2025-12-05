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
 * Note: For services not supported by Songlink (Qobuz, Bandcamp), these may be search URLs
 * rather than direct track links, but they're formatted identically for a seamless user experience.
 * 
 * @param links - Links to various music services (direct links or search URLs)
 * @param originalService - The service from the original link (to exclude)
 * @returns Formatted Slack message with markdown links
 */
export function formatMusicLinksMessage(
  links: CrossPlatformLinks,
  originalService: MusicService
): string {
  // Direct streaming services (from Songlink)
  const directServices: ServiceInfo[] = [
    { name: 'Apple Music', url: links.appleMusic },
    { name: 'Spotify', url: links.spotify },
    { name: 'Tidal', url: links.tidal },
    { name: 'YouTube Music', url: links.youtubeMusic },
  ];

  // Search services (generated search URLs)
  const searchServices: ServiceInfo[] = [
    { name: 'Bandcamp', url: links.bandcamp },
    { name: 'Qobuz', url: links.qobuz },
  ];

  // Filter out the original service and services without links
  const availableDirectLinks = directServices.filter(
    service => service.url && service.name !== originalService
  );

  const availableSearchLinks = searchServices.filter(
    service => service.url && service.name !== originalService
  );

  // Build the message
  if (availableDirectLinks.length === 0 && availableSearchLinks.length === 0) {
    return 'Could not find this track on other streaming services.';
  }

  let message = '';

  // Add direct links
  if (availableDirectLinks.length > 0) {
    const linkParts = availableDirectLinks.map(
      service => `<${service.url}|${service.name}>`
    );
    message = `Also stream this on: ${linkParts.join(' | ')}`;
  }

  // Add search links
  if (availableSearchLinks.length > 0) {
    const searchParts = availableSearchLinks.map(
      service => `<${service.url}|${service.name}>`
    );
    if (message) {
      message += `\n\nSearch: ${searchParts.join(' | ')}`;
    } else {
      message = `Search: ${searchParts.join(' | ')}`;
    }
  }

  // Add "not found" message for direct streaming services that are missing
  const missingDirectServices = directServices.filter(
    service => !service.url && service.name !== originalService
  );
  
  if (missingDirectServices.length > 0) {
    const missingNames = missingDirectServices.map(s => s.name).join(', ');
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

