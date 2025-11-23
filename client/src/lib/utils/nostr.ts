import { type Event } from 'nostr-tools';

export const KJVONLY_PUBKEY = `${import.meta.env.VITE_NOSTR_KJVONLY_PUBKEY}`;
export const KJVONLY_REALY_URL = `${import.meta.env.VITE_NOSTR_RELAY_URL}`;



export function getTags(event: Event, tagName: string): string[] {
  return event.tags
    .filter(tag => tag[0] === tagName)
    .map(tag => tag[1]) || [];
}


