/**
 * Spotify API client for the frontend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchApi(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Search
export const search = (query, type = 'track', limit = 20) =>
  fetchApi('/search', { q: query, type, limit });

// Artists
export const getArtist = (id) => fetchApi(`/artists/${id}`);
export const getArtistAlbums = (id, limit = 20) =>
  fetchApi(`/artists/${id}/albums`, { limit });
export const getArtistTopTracks = (id, market = 'US') =>
  fetchApi(`/artists/${id}/top-tracks`, { market });

// Albums
export const getAlbum = (id) => fetchApi(`/albums/${id}`);
export const getAlbumTracks = (id, limit = 50) =>
  fetchApi(`/albums/${id}/tracks`, { limit });

// Tracks
export const getTrack = (id) => fetchApi(`/tracks/${id}`);
export const getTrackAudioFeatures = (id) =>
  fetchApi(`/tracks/${id}/audio-features`);

// Playlists
export const getPlaylist = (id) => fetchApi(`/playlists/${id}`);
export const getPlaylistTracks = (id, limit = 100) =>
  fetchApi(`/playlists/${id}/tracks`, { limit });
