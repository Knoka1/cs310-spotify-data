import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from '@/components/ui/button';

const API_BASE = 'http://127.0.0.1:8000';

interface ArtistResult {
  artistName: string;
  firstReleaseDate: string | null;
  latestReleaseDate: string | null;
  totalAlbums: number;
  totalTracks: number;
  averageTracksPerAlbum: number | null;
  longestAlbum: {
    name: string;
    total_tracks: number;
  } | null;
  shortestAlbum: {
    name: string;
    total_tracks: number;
  } | null;
  albums: {
    id: string;
    name: string;
    release_date: string;
    total_tracks: number;
  }[];
  imageUrl?: string;
}

export function ArtistAnalysis() {
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArtistResult | null>(null);
  const [error, setError] = useState('');

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

  const analyzeArtist = async (nameToAnalyze?: string) => {
    const queryName = (nameToAnalyze ?? artistName).trim();

    if (!queryName) {
      setError('Please enter an artist name');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

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

      const analysisResponse = await fetch(
        `${API_BASE}/analyze/artist/${artistId}`
      );

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze artist');
      }

      const metrics = await analysisResponse.json();

      setResult({
        artistName: metrics.artist.name,
        firstReleaseDate: metrics.career_momentum.first_release_date,
        latestReleaseDate: metrics.career_momentum.latest_release_date,
        totalAlbums: metrics.catalog_depth.total_albums,
        totalTracks: metrics.catalog_depth.total_tracks,
        averageTracksPerAlbum: metrics.catalog_depth.average_tracks_per_album,
        longestAlbum: metrics.catalog_depth.longest_album,
        shortestAlbum: metrics.catalog_depth.shortest_album,
        albums: metrics.albums,
        imageUrl: metrics.artist.images?.[0]?.url,
      });

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
    <div className="space-y-6 text-black">
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
        <div className="space-y-6 pt-4 text-black">
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

            <div className="flex flex-wrap justify-center gap-3">
              <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-black border border-gray-200">
                Total albums: <span className="font-semibold">{result.totalAlbums}</span>
              </div>

              <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-black border border-gray-200">
                Total tracks: <span className="font-semibold">{result.totalTracks}</span>
              </div>

              <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-black border border-gray-200">
                Avg tracks / album:{' '}
                <span className="font-semibold">
                  {result.averageTracksPerAlbum?.toFixed(2) ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-black mb-2">Release Timeline</h3>

            <div className="space-y-2 text-sm text-black">
              <p>
                <span className="font-medium">First release:</span>{' '}
                {result.firstReleaseDate ?? 'N/A'}
              </p>

              <p>
                <span className="font-medium">Latest release:</span>{' '}
                {result.latestReleaseDate ?? 'N/A'}
              </p>

              <p>
                <span className="font-medium">Longest album:</span>{' '}
                {result.longestAlbum
                  ? `${result.longestAlbum.name} (${result.longestAlbum.total_tracks} tracks)`
                  : 'N/A'}
              </p>

              <p>
                <span className="font-medium">Shortest album:</span>{' '}
                {result.shortestAlbum
                  ? `${result.shortestAlbum.name} (${result.shortestAlbum.total_tracks} tracks)`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-black mb-3">Albums</h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {result.albums.map((album: any) => (
                <div
                  key={`${album.id}-${album.name}`}
                  className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-black">{album.name}</p>
                    <p className="text-xs text-gray-600">{album.release_date}</p>
                  </div>

                  <span className="text-sm text-black">
                    {album.total_tracks} tracks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}