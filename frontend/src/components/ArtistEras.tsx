import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchArtistEras } from '../api';

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
  average_gap_between_albums_years: number;
  longest_era: { album: string; gap_years: number } | null;
  shortest_era: { album: string; gap_years: number } | null;
}

interface ErasData {
  artist_id: string;
  summary: ErasSummary;
  timeline: TimelineItem[];
}

interface ArtistErasProps {
  artistId: string;
  artistName: string;
}

export function ArtistEras({ artistId, artistName }: ArtistErasProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ErasData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!artistId) return;
    setLoading(true);
    setError('');
    setData(null);

    fetchArtistEras(artistId)
      .then(setData)
      .catch(() => setError('Failed to load era data. Try again.'))
      .finally(() => setLoading(false));
  }, [artistId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading {artistName}'s eras...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { summary, timeline } = data;

  return (
    <div className="space-y-8">

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{artistName} — Career Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{summary.first_album_year}</div>
            <div className="text-sm text-gray-500 mt-1">First Album</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{summary.latest_album_year}</div>
            <div className="text-sm text-gray-500 mt-1">Latest Album</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900">
            {summary.career_span_years ?? (summary.latest_album_year - summary.first_album_year)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Years Active</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{summary.total_eras}</div>
            <div className="text-sm text-gray-500 mt-1">Studio Albums</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Avg. Gap Between Albums</div>
            <div className="text-xl font-semibold text-gray-900 mt-1">{summary.average_gap_between_albums_years} years</div>
          </div>
          {summary.longest_era && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Longest Wait</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{summary.longest_era.gap_years} years</div>
              <div className="text-xs text-gray-400 mt-1">before {summary.longest_era.album}</div>
            </div>
          )}
          {summary.shortest_era && (
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Shortest Wait</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{summary.shortest_era.gap_years} years</div>
              <div className="text-xs text-gray-400 mt-1">before {summary.shortest_era.album}</div>
            </div>
          )}
        </div>
      </div>

      {/* Era List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Discography by Era</h2>
        <div className="space-y-3">
          {(timeline ?? []).map((era) => (
            <div
              key={era.era_number}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all"
            >
              {/* Album Cover */}
              {era.cover_image ? (
                <img
                  src={era.cover_image}
                  alt={era.album_name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
              )}

              {/* Album Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">Era {era.era_number}</span>
                </div>
                <div className="text-base font-semibold text-gray-900 truncate">{era.album_name}</div>
                <div className="text-sm text-gray-500">{era.release_date} · {era.total_tracks} tracks</div>
              </div>

              {/* Gap Badge */}
              <div className="text-right flex-shrink-0">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {era.gap_label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Timeline */}
<div>
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Timeline</h2>
  <div className="overflow-x-auto pb-4">
    <div className="flex items-end gap-0 min-w-max px-4">
      {timeline.map((era, index) => (
        <div key={era.era_number} className="flex items-center">
          {/* Era Node */}
          <div className="flex flex-col items-center w-32">
            {/* Album Cover */}
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

            {/* Album Name */}
            <div className="mt-2 text-center w-28">
              <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{era.album_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{era.release_year}</p>
            </div>
          </div>

        {/* Connector Line + Gap Label */}
                {index < timeline.length - 1 && (
                    <div className="flex flex-col items-center mb-10"
                    style={{ width: `${Math.max((timeline[index + 1].gap_years ?? 1) * 50, 50)}px` }}
                    >
                    <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                        {timeline[index + 1].gap_years ? `${timeline[index + 1].gap_years}y` : ''}
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

        {/* Wrapped Slides only now / optional */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
        <p className="font-medium">Wrapped Slides</p>
        <p className="text-sm mt-1">Full screen swipeable slides per era — use the <code>timeline</code> array, each item has <code>cover_image</code>, <code>gap_label</code>, <code>release_year</code>, <code>total_tracks</code></p>
        </div>

    </div>
  );
}