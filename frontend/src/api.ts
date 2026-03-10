const BASE_URL = import.meta.env.VITE_API_URL;

export async function searchArtist(query: string) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function fetchArtist(artistId: string) {
  const res = await fetch(`${BASE_URL}/artists/${artistId}`);
  if (!res.ok) throw new Error("Failed to fetch artist");
  return res.json();
}

export async function fetchArtistAlbums(artistId: string) {
  const res = await fetch(`${BASE_URL}/artists/${artistId}/albums`);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

export async function fetchArtistEras(artistId: string) {
  const res = await fetch(`${BASE_URL}/artists/${artistId}/eras`);
  if (!res.ok) throw new Error("Failed to fetch eras");
  return res.json();
}

export async function fetchAlbum(albumId: string) {
  const res = await fetch(`${BASE_URL}/albums/${albumId}`);
  if (!res.ok) throw new Error("Failed to fetch album");
  return res.json();
}

export async function fetchTrack(trackId: string) {
  const res = await fetch(`${BASE_URL}/tracks/${trackId}`);
  if (!res.ok) throw new Error("Failed to fetch track");
  return res.json();
}