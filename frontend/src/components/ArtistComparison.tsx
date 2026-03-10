import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = 'http://127.0.0.1:8000';

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

export function ArtistComparison() {
  const [artist1Name, setArtist1Name] = useState('');
  const [artist2Name, setArtist2Name] = useState('');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDecimal = (value: number | null | undefined, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(0)}%`;
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

  const handleCompare = async () => {
    setError('');
    setComparison(null);

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
        throw new Error(
          err?.detail ? JSON.stringify(err.detail) : 'Failed to compare artists.'
        );
      }

      const data: ComparisonResponse = await response.json();
      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const getMostRecentAlbum = (albums: AlbumSummary[]) => {
    if (!albums?.length) return null;
    return [...albums].sort((a, b) =>
      (a.release_date || '').localeCompare(b.release_date || '')
    )[albums.length - 1];
  };

  const getRecentShareOfCatalog = (artist: ArtistMetrics) => {
    const total = artist.catalog_depth.total_albums;
    const recent = artist.career_momentum.albums_last_3_years;

    if (!total || total <= 0) return null;
    return recent / total;
  };

  const renderMetricRow = (
    label: string,
    artist1Value: string | number,
    artist2Value: string | number
  ) => {
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-b-0">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-sm text-gray-900">{artist1Value}</div>
        <div className="text-sm text-gray-900">{artist2Value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-black">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Comparison</h2>
        <p className="text-gray-600">
          Compare two artists by timeline, catalog size, and recent activity.
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
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
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
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
          />
        </div>

        <Button
          onClick={handleCompare}
          disabled={loading}
          className="bg-black text-white hover:bg-gray-800"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Comparing...
            </>
          ) : (
            'Compare Artists'
          )}
        </Button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {comparison && (
        <div className="space-y-8">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[comparison.artist_1, comparison.artist_2].map((artistData) => {
              const imageUrl = artistData.artist.images?.[0]?.url;
              return (
                <div
                  key={artistData.artist.id}
                  className="border rounded-xl p-6 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={artistData.artist.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200" />
                    )}

                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {artistData.artist.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Release history and catalog comparison
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-3 gap-4 px-1">
            <div />
            <div className="text-sm font-semibold text-gray-900">
              {comparison.artist_1.artist.name}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {comparison.artist_2.artist.name}
            </div>
          </div>

          {/* A. Timeline comparison */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Timeline Comparison
            </h3>

            {renderMetricRow(
              'First release',
              comparison.artist_1.career_momentum.first_release_date ?? 'N/A',
              comparison.artist_2.career_momentum.first_release_date ?? 'N/A'
            )}

            {renderMetricRow(
              'Latest release',
              comparison.artist_1.career_momentum.latest_release_date ?? 'N/A',
              comparison.artist_2.career_momentum.latest_release_date ?? 'N/A'
            )}

            {renderMetricRow(
              'Career span',
              comparison.artist_1.career_momentum.career_span !== null
                ? `${comparison.artist_1.career_momentum.career_span} years`
                : 'N/A',
              comparison.artist_2.career_momentum.career_span !== null
                ? `${comparison.artist_2.career_momentum.career_span} years`
                : 'N/A'
            )}

            {renderMetricRow(
              'Average years between releases',
              formatDecimal(
                comparison.artist_1.career_momentum.average_years_between_releases,
                ' years'
              ),
              formatDecimal(
                comparison.artist_2.career_momentum.average_years_between_releases,
                ' years'
              )
            )}

            {renderMetricRow(
              'Albums per year',
              formatDecimal(
                comparison.artist_1.career_momentum.release_frequency,
                ' albums/year'
              ),
              formatDecimal(
                comparison.artist_2.career_momentum.release_frequency,
                ' albums/year'
              )
            )}
          </div>

          {/* B. Catalog comparison */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Catalog Comparison
            </h3>

            {renderMetricRow(
              'Total albums',
              comparison.artist_1.catalog_depth.total_albums,
              comparison.artist_2.catalog_depth.total_albums
            )}

            {renderMetricRow(
              'Total tracks',
              comparison.artist_1.catalog_depth.total_tracks,
              comparison.artist_2.catalog_depth.total_tracks
            )}

            {renderMetricRow(
              'Average tracks per album',
              formatDecimal(
                comparison.artist_1.catalog_depth.average_tracks_per_album,
                ' tracks'
              ),
              formatDecimal(
                comparison.artist_2.catalog_depth.average_tracks_per_album,
                ' tracks'
              )
            )}

            {renderMetricRow(
              'Longest album',
              comparison.artist_1.catalog_depth.longest_album
                ? `${comparison.artist_1.catalog_depth.longest_album.name} (${comparison.artist_1.catalog_depth.longest_album.total_tracks})`
                : 'N/A',
              comparison.artist_2.catalog_depth.longest_album
                ? `${comparison.artist_2.catalog_depth.longest_album.name} (${comparison.artist_2.catalog_depth.longest_album.total_tracks})`
                : 'N/A'
            )}

            {renderMetricRow(
              'Shortest album',
              comparison.artist_1.catalog_depth.shortest_album
                ? `${comparison.artist_1.catalog_depth.shortest_album.name} (${comparison.artist_1.catalog_depth.shortest_album.total_tracks})`
                : 'N/A',
              comparison.artist_2.catalog_depth.shortest_album
                ? `${comparison.artist_2.catalog_depth.shortest_album.name} (${comparison.artist_2.catalog_depth.shortest_album.total_tracks})`
                : 'N/A'
            )}
          </div>

          {/* C. Recent activity comparison */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity Comparison
            </h3>

            {renderMetricRow(
              'Albums in last 3 years',
              comparison.artist_1.career_momentum.albums_last_3_years,
              comparison.artist_2.career_momentum.albums_last_3_years
            )}

            {renderMetricRow(
              'Recent release date',
              getMostRecentAlbum(comparison.artist_1.albums)?.release_date ??
                comparison.artist_1.career_momentum.latest_release_date ??
                'N/A',
              getMostRecentAlbum(comparison.artist_2.albums)?.release_date ??
                comparison.artist_2.career_momentum.latest_release_date ??
                'N/A'
            )}

            {renderMetricRow(
              'Release frequency',
              formatDecimal(
                comparison.artist_1.career_momentum.release_frequency,
                ' albums/year'
              ),
              formatDecimal(
                comparison.artist_2.career_momentum.release_frequency,
                ' albums/year'
              )
            )}

            {renderMetricRow(
              'Recent share of catalog',
              formatPercent(getRecentShareOfCatalog(comparison.artist_1)),
              formatPercent(getRecentShareOfCatalog(comparison.artist_2))
            )}
          </div>
        </div>
      )}
    </div>
  );
}