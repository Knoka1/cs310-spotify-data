import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from '@/components/ui/button';

const API_BASE = 'https://h74l24z1q4.execute-api.us-east-1.amazonaws.com';

interface AlbumSummary {
  id: string;
  name: string;
  release_date: string;
  release_year: number | null;
  total_tracks: number;
}

interface AlbumStat {
  name: string;
  release_date: string;
  total_tracks: number;
}

interface TrackSummary {
  id?: string;
  name: string;
  track_number?: number;
  duration_ms?: number;
}

interface ArtistResult {
  artistId: string;
  artistName: string;
  imageUrl?: string;
  firstReleaseDate: string | null;
  latestReleaseDate: string | null;
  careerSpan: number | null;
  totalAlbums: number;
  totalTracks: number;
  averageTracksPerAlbum: number | null;
  longestAlbum: AlbumStat | null;
  shortestAlbum: AlbumStat | null;
  oldestAlbum: AlbumStat | null;
  mostRecentAlbum: AlbumStat | null;
  albums: AlbumSummary[];
}

interface TimelineItem {
  era_number: number;
  album_name: string;
  release_date: string;
  release_year: number;
  total_tracks: number;
  gap_years: number | null;
  gap_label: string;
  cover_image: string | null;
}

interface ErasSummary {
  first_album_year: number;
  latest_album_year: number;
  career_span_years: number;
  total_eras: number;
  average_gap_between_albums_years: number | null;
  longest_era: { album: string; gap_years: number } | null;
  shortest_era: { album: string; gap_years: number } | null;
}

interface ErasData {
  artist_id: string;
  summary: ErasSummary;
  timeline: TimelineItem[];
}

export function ArtistAnalysis() {
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArtistResult | null>(null);
  const [erasData, setErasData] = useState<ErasData | null>(null);
  const [error, setError] = useState('');

  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>(
    {}
  );
  const [albumTracks, setAlbumTracks] = useState<Record<string, TrackSummary[]>>(
    {}
  );
  const [loadingAlbums, setLoadingAlbums] = useState<Record<string, boolean>>(
    {}
  );

  const suggestedArtists = [
    {
      name: 'Taylor Swift',
      genre: 'Pop',
      image:
        'https://images.unsplash.com/photo-1692796226663-dd49d738f43c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUYXlsb3IlMjBTd2lmdCUyMGNvbmNlcnR8ZW58MXx8fHwxNzcyOTA4NjA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'The Weeknd',
      genre: 'R&B',
      image:
        'https://images.unsplash.com/photo-1766471870102-dcb1fe88e8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUaGUlMjBXZWVrbmQlMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzcyOTA4NjA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Drake',
      genre: 'Hip Hop',
      image:
        'https://images.unsplash.com/photo-1509847950535-14e861e5191b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEcmFrZSUyMHJhcHBlcnxlbnwxfHx8fDE3NzI5MDg2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Billie Eilish',
      genre: 'Alternative',
      image:
        'https://images.unsplash.com/photo-1693835843843-82f691094f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGZlbWFsZSUyMHNpbmdlcnxlbnwxfHx8fDE3NzI5MDg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Bad Bunny',
      genre: 'Reggaeton',
      image:
        'https://images.unsplash.com/photo-1649359075483-f11404a1d952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYWQlMjBCdW5ueSUyMHJlZ2dhZXRvbnxlbnwxfHx8fDE3NzI5MDg2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Dua Lipa',
      genre: 'Pop',
      image:
        'https://images.unsplash.com/photo-1730875651456-9c9cde899602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpYyUyMHBlcmZvcm1lcnxlbnwxfHx8fDE3NzI5MDg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const formatDecimal = (value: number | null | undefined, digits = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(digits);
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return '';
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  const analyzeArtist = async (nameToAnalyze?: string) => {
    const queryName = (nameToAnalyze ?? artistName).trim();

    if (!queryName) {
      setError('Please enter an artist name');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setErasData(null);
    setExpandedAlbums({});
    setAlbumTracks({});
    setLoadingAlbums({});

    try {
      const searchResponse = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(queryName)}&type=artist&limit=1`
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search for artist');
      }

      const searchData = await searchResponse.json();
      const artist = searchData?.artists?.items?.[0];

      if (!artist) {
        throw new Error('Artist not found');
      }

      const artistId = artist.id;

      const [analysisResponse, erasResponse] = await Promise.all([
        fetch(`${API_BASE}/analyze/artist/${artistId}`),
        fetch(`${API_BASE}/artists/${artistId}/eras`),
      ]);

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze artist');
      }

      if (!erasResponse.ok) {
        throw new Error('Failed to load artist timeline');
      }

      const metrics = await analysisResponse.json();
      const eras = await erasResponse.json();

      const sortedAlbums = [...(metrics.albums || [])].sort(
        (a: AlbumSummary, b: AlbumSummary) =>
          (a.release_date || '').localeCompare(b.release_date || '')
      );

      const oldestAlbum =
        sortedAlbums.length > 0
          ? {
              name: sortedAlbums[0].name,
              release_date: sortedAlbums[0].release_date,
              total_tracks: sortedAlbums[0].total_tracks,
            }
          : null;

      const mostRecentAlbum =
        sortedAlbums.length > 0
          ? {
              name: sortedAlbums[sortedAlbums.length - 1].name,
              release_date: sortedAlbums[sortedAlbums.length - 1].release_date,
              total_tracks: sortedAlbums[sortedAlbums.length - 1].total_tracks,
            }
          : null;

      setResult({
        artistId: metrics.artist.id,
        artistName: metrics.artist.name,
        firstReleaseDate: metrics.career_momentum.first_release_date,
        latestReleaseDate: metrics.career_momentum.latest_release_date,
        careerSpan: metrics.career_momentum.career_span,
        totalAlbums: metrics.catalog_depth.total_albums,
        totalTracks: metrics.catalog_depth.total_tracks,
        averageTracksPerAlbum: metrics.catalog_depth.average_tracks_per_album,
        longestAlbum: metrics.catalog_depth.longest_album,
        shortestAlbum: metrics.catalog_depth.shortest_album,
        oldestAlbum,
        mostRecentAlbum,
        albums: metrics.albums,
        imageUrl: metrics.artist.images?.[0]?.url,
      });

      setErasData(eras);
      setArtistName(metrics.artist.name);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze artist. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-black">
      <div>
        <label
          htmlFor="artist-name"
          className="block text-sm font-medium text-black mb-2"
        >
          Artist Name
        </label>

        <input
          id="artist-name"
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          placeholder="e.g. Taylor Swift"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
          onKeyDown={(e) => e.key === 'Enter' && analyzeArtist()}
        />
      </div>

      <div>
        <p className="text-sm text-black mb-3">Try these artists:</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {suggestedArtists.map((artist) => (
            <div
              key={artist.name}
              role="button"
              tabIndex={0}
              onClick={() => {
                setArtistName(artist.name);
                setError('');
                analyzeArtist(artist.name);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setArtistName(artist.name);
                  setError('');
                  analyzeArtist(artist.name);
                }
              }}
              className="relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-md transition-all cursor-pointer"
            >
              <ImageWithFallback
                src={artist.image}
                alt={artist.name}
                className="w-full h-32 object-cover pointer-events-none"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

              <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
                <p className="text-white font-medium text-sm">{artist.name}</p>
                <p className="text-white/80 text-xs">{artist.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => analyzeArtist()}
        disabled={loading}
        size="lg"
        className="w-full py-3 bg-black text-white hover:bg-gray-800"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Artist'
        )}
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 pt-4 text-black">
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-200">
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt={result.artistName}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
              />
            )}

            <h2 className="text-2xl font-bold text-black mb-2">
              {result.artistName}
            </h2>

            <p className="text-sm text-gray-600">
              Single artist deep dive across overview, timeline, albums, and catalog insights.
            </p>
          </div>

          {/* A. Overview */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Overview</h3>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total Albums</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.totalAlbums}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total Tracks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.totalTracks}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">Avg Tracks / Album</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatDecimal(result.averageTracksPerAlbum)}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">First Release</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {result.firstReleaseDate ?? 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">Latest Release</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {result.latestReleaseDate ?? 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500">Career Span</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {result.careerSpan !== null ? `${result.careerSpan} years` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* B. Era / Timeline */}
          {erasData && (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-900">Era / Timeline</h3>

              {/* Summary Card */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {result.artistName} — Career Overview
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-gray-900">
                      {erasData.summary.first_album_year}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">First Album</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-gray-900">
                      {erasData.summary.latest_album_year}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Latest Album</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-gray-900">
                      {erasData.summary.career_span_years ??
                        erasData.summary.latest_album_year -
                          erasData.summary.first_album_year}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Years Active</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-gray-900">
                      {erasData.summary.total_eras}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Studio Albums</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Avg. Gap Between Albums</div>
                    <div className="text-xl font-semibold text-gray-900 mt-1">
                      {erasData.summary.average_gap_between_albums_years ?? 'N/A'} years
                    </div>
                  </div>

                  {erasData.summary.longest_era && (
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Longest Wait</div>
                      <div className="text-xl font-semibold text-gray-900 mt-1">
                        {erasData.summary.longest_era.gap_years} years
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        before {erasData.summary.longest_era.album}
                      </div>
                    </div>
                  )}

                  {erasData.summary.shortest_era && (
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500">Shortest Wait</div>
                      <div className="text-xl font-semibold text-gray-900 mt-1">
                        {erasData.summary.shortest_era.gap_years} years
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        before {erasData.summary.shortest_era.album}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Timeline */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Timeline</h2>
                <div className="overflow-x-auto pb-4">
                  <div className="flex items-end gap-0 min-w-max px-4">
                    {erasData.timeline.map((era, index) => (
                      <div key={era.era_number} className="flex items-center">
                        <div className="flex flex-col items-center w-32">
                          <div className="relative group">
                            {era.cover_image ? (
                              <img
                                src={era.cover_image}
                                alt={era.album_name}
                                className="w-20 h-20 rounded-lg object-cover shadow-md group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-gray-200 shadow-md" />
                            )}
                          </div>

                          <div className="mt-2 text-center w-28">
                            <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
                              {era.album_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{era.release_year}</p>
                          </div>
                        </div>

                        {index < erasData.timeline.length - 1 && (
                          <div
                            className="flex flex-col items-center mb-10"
                            style={{
                              width: `${Math.max(
                                (erasData.timeline[index + 1].gap_years ?? 1) * 50,
                                50
                              )}px`,
                            }}
                          >
                            <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                              {erasData.timeline[index + 1].gap_years
                                ? `${erasData.timeline[index + 1].gap_years}y`
                                : ''}
                            </p>
                            <div className="w-full h-0.5 bg-gray-200 relative">
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Era List */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Discography by Era</h2>
                <div className="space-y-3">
                  {(erasData.timeline ?? []).map((era) => (
                    <div
                      key={era.era_number}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all"
                    >
                      {era.cover_image ? (
                        <img
                          src={era.cover_image}
                          alt={era.album_name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-400">
                            Era {era.era_number}
                          </span>
                        </div>
                        <div className="text-base font-semibold text-gray-900 truncate">
                          {era.album_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {era.release_date} · {era.total_tracks} tracks
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {era.gap_label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* C. Album Explorer */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Album Explorer</h3>

            <div className="max-h-[32rem] overflow-y-auto space-y-3">
              {result.albums.length > 0 ? (
                result.albums.map((album, index) => (
                  <div
                    key={`${album.id}-${index}`}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
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
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading songs...
                          </div>
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

          {/* D. Catalog Insights */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Catalog Insights</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Longest Album</p>
                <p className="font-semibold text-gray-900">
                  {result.longestAlbum
                    ? `${result.longestAlbum.name} (${result.longestAlbum.total_tracks} tracks)`
                    : 'N/A'}
                </p>
                {result.longestAlbum?.release_date && (
                  <p className="text-sm text-gray-500 mt-1">{result.longestAlbum.release_date}</p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Shortest Album</p>
                <p className="font-semibold text-gray-900">
                  {result.shortestAlbum
                    ? `${result.shortestAlbum.name} (${result.shortestAlbum.total_tracks} tracks)`
                    : 'N/A'}
                </p>
                {result.shortestAlbum?.release_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {result.shortestAlbum.release_date}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Oldest Album</p>
                <p className="font-semibold text-gray-900">
                  {result.oldestAlbum
                    ? `${result.oldestAlbum.name} (${result.oldestAlbum.total_tracks} tracks)`
                    : 'N/A'}
                </p>
                {result.oldestAlbum?.release_date && (
                  <p className="text-sm text-gray-500 mt-1">{result.oldestAlbum.release_date}</p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Most Recent Album</p>
                <p className="font-semibold text-gray-900">
                  {result.mostRecentAlbum
                    ? `${result.mostRecentAlbum.name} (${result.mostRecentAlbum.total_tracks} tracks)`
                    : 'N/A'}
                </p>
                {result.mostRecentAlbum?.release_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {result.mostRecentAlbum.release_date}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}