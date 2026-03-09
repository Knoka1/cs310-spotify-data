import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ArtistSummary = {
  id: string;
  name: string;
};

type AlbumSummary = {
  id: string;
  name: string;
  release_date: string;
  release_year: number | null;
  total_tracks: number;
};

type TrackSummary = {
  id?: string;
  name: string;
  track_number?: number;
  duration_ms?: number;
};

type ArtistMetrics = {
  artist: {
    id: string;
    name: string;
    images: { url: string }[];
  };
  career_momentum: {
    first_album_year: number | null;
    latest_album_year: number | null;
    first_release_date: string | null;
    latest_release_date: string | null;
    total_albums: number;
    albums_last_3_years: number;
    average_years_between_releases: number | null;
    career_span: number | null;
    release_frequency: number | null;
  };
  catalog_depth: {
    total_albums: number;
    total_tracks: number;
    average_tracks_per_album: number | null;
    longest_album: {
      name: string;
      release_date: string;
      total_tracks: number;
    } | null;
    shortest_album: {
      name: string;
      release_date: string;
      total_tracks: number;
    } | null;
  };
  albums: AlbumSummary[];
};

type ComparisonResponse = {
  artist_1: ArtistMetrics;
  artist_2: ArtistMetrics;
};

const API_BASE = 'http://127.0.0.1:8000';

export function ArtistComparison() {
  const [artist1Name, setArtist1Name] = useState('');
  const [artist2Name, setArtist2Name] = useState('');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});
  const [albumTracks, setAlbumTracks] = useState<Record<string, TrackSummary[]>>({});
  const [loadingAlbums, setLoadingAlbums] = useState<Record<string, boolean>>({});

  const formatDecimal = (value: number | null | undefined, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return '';
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const searchArtist = async (name: string): Promise<ArtistSummary> => {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(name)}&type=artist&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Failed to search for artist: ${name}`);
    }

    const data = await response.json();
    const artist = data?.artists?.items?.[0];

    if (!artist) {
      throw new Error(`No artist found for "${name}"`);
    }

    return {
      id: artist.id,
      name: artist.name,
    };
  };

  const fetchAlbumTracks = async (albumId: string) => {
    if (albumTracks[albumId]) return;

    setLoadingAlbums((prev) => ({ ...prev, [albumId]: true }));

    try {
      const response = await fetch(`${API_BASE}/albums/${albumId}/tracks?limit=50`);

      if (!response.ok) {
        throw new Error('Failed to load album tracks.');
      }

      const data = await response.json();

      const tracks: TrackSummary[] = (data?.items || []).map((track: any) => ({
        id: track.id,
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
      }));

      setAlbumTracks((prev) => ({
        ...prev,
        [albumId]: tracks,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks.');
    } finally {
      setLoadingAlbums((prev) => ({ ...prev, [albumId]: false }));
    }
  };

  const toggleAlbum = async (albumId: string) => {
    const isCurrentlyExpanded = expandedAlbums[albumId];

    setExpandedAlbums((prev) => ({
      ...prev,
      [albumId]: !isCurrentlyExpanded,
    }));

    if (!isCurrentlyExpanded && !albumTracks[albumId]) {
      await fetchAlbumTracks(albumId);
    }
  };

  const handleCompare = async () => {
    setError('');
    setComparison(null);
    setExpandedAlbums({});
    setAlbumTracks({});
    setLoadingAlbums({});

    if (!artist1Name.trim() || !artist2Name.trim()) {
      setError('Please enter two artist names.');
      return;
    }

    try {
      setLoading(true);

      const [artist1, artist2] = await Promise.all([
        searchArtist(artist1Name),
        searchArtist(artist2Name),
      ]);

      const response = await fetch(
        `${API_BASE}/compare/artists?artist1_id=${artist1.id}&artist2_id=${artist2.id}`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail ? JSON.stringify(err.detail) : 'Failed to compare artists.');
      }

      const data: ComparisonResponse = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderArtistCard = (label: string, data: ArtistMetrics) => {
    const imageUrl = data.artist.images?.[0]?.url;

    return (
      <div className="border rounded-lg p-6 bg-white shadow-sm text-black">
        <div className="flex items-center gap-4 mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={data.artist.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200" />
          )}

          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{data.artist.name}</h3>
            <p className="text-sm text-gray-600">
              Comparison based on release history and catalog structure
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-900">Timeline Summary</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">First release date:</span> {data.career_momentum.first_release_date ?? 'N/A'}</p>
              <p><span className="font-medium">Latest release date:</span> {data.career_momentum.latest_release_date ?? 'N/A'}</p>
              <p><span className="font-medium">First album year:</span> {data.career_momentum.first_album_year ?? 'N/A'}</p>
              <p><span className="font-medium">Latest album year:</span> {data.career_momentum.latest_album_year ?? 'N/A'}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-900">Career Momentum</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Total albums:</span> {data.career_momentum.total_albums} albums</p>
              <p><span className="font-medium">Albums in last 3 years:</span> {data.career_momentum.albums_last_3_years} albums</p>
              <p><span className="font-medium">Average years between releases:</span> {formatDecimal(data.career_momentum.average_years_between_releases, ' years')}</p>
              <p><span className="font-medium">Career span:</span> {data.career_momentum.career_span ?? 'N/A'} years</p>
              <p><span className="font-medium">Release frequency:</span> {formatDecimal(data.career_momentum.release_frequency, ' albums/year')}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 md:col-span-2">
            <h4 className="text-lg font-semibold mb-3 text-gray-900">Catalog Depth</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <p><span className="font-medium">Total albums:</span> {data.catalog_depth.total_albums} albums</p>
                <p><span className="font-medium">Total tracks:</span> {data.catalog_depth.total_tracks} tracks</p>
                <p><span className="font-medium">Average tracks per album:</span> {formatDecimal(data.catalog_depth.average_tracks_per_album, ' tracks/album')}</p>
              </div>

              <div className="space-y-2">
                <p>
                  <span className="font-medium">Longest album:</span>{' '}
                  {data.catalog_depth.longest_album
                    ? `${data.catalog_depth.longest_album.name} (${data.catalog_depth.longest_album.total_tracks} tracks)`
                    : 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Shortest album:</span>{' '}
                  {data.catalog_depth.shortest_album
                    ? `${data.catalog_depth.shortest_album.name} (${data.catalog_depth.shortest_album.total_tracks} tracks)`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 md:col-span-2">
            <h4 className="text-lg font-semibold mb-3 text-gray-900">{label} Release Timeline</h4>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {data.albums.length > 0 ? (
                data.albums.map((album, index) => (
                  <div
                    key={`${album.id}-${index}`}
                    className="border rounded-lg p-3 bg-white cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => album.id && toggleAlbum(album.id)}
                  >
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{album.name}</p>
                        <p className="text-sm text-gray-500">
                          {album.release_date || 'Unknown date'} • {album.total_tracks} tracks
                        </p>
                      </div>

                      <div className="text-sm font-medium text-blue-600">
                        {expandedAlbums[album.id] ? 'Hide Songs' : 'Show Songs'}
                      </div>
                    </div>

                    {expandedAlbums[album.id] && (
                      <div className="mt-3 border-t pt-3">
                        {loadingAlbums[album.id] ? (
                          <p className="text-sm text-gray-500">Loading songs...</p>
                        ) : albumTracks[album.id]?.length ? (
                          <div className="space-y-2">
                            {albumTracks[album.id].map((track, trackIndex) => (
                              <div
                                key={`${track.id || track.name}-${trackIndex}`}
                                className="flex justify-between items-center text-sm text-gray-700"
                              >
                                <div>
                                  <span className="font-medium mr-2">
                                    {track.track_number ?? trackIndex + 1}.
                                  </span>
                                  {track.name}
                                </div>
                                <div className="text-gray-500">
                                  {formatDuration(track.duration_ms)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No songs found for this album.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No album data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-black">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Comparison</h2>
        <p className="text-gray-600">
          Compare two artists by career momentum, release timelines, and catalog depth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artist 1
          </label>
          <input
            type="text"
            value={artist1Name}
            onChange={(e) => setArtist1Name(e.target.value)}
            placeholder="e.g. Taylor Swift"
            className="w-full border rounded-lg px-4 py-2 text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artist 2
          </label>
          <input
            type="text"
            value={artist2Name}
            onChange={(e) => setArtist2Name(e.target.value)}
            placeholder="e.g. Drake"
            className="w-full border rounded-lg px-4 py-2 text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <Button 
          onClick={handleCompare} 
          disabled={loading}
          className="bg-black text-white hover:bg-gray-800">
          {loading ? 'Comparing...' : 'Compare Artists'}
        </Button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {comparison && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {renderArtistCard('Artist 1', comparison.artist_1)}
          {renderArtistCard('Artist 2', comparison.artist_2)}
        </div>
      )}
    </div>
  );
}