import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchArtist } from '../api';

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface ArtistSearchProps {
  onArtistSelect: (artist: Artist) => void;
}

export function ArtistSearch({ onArtistSelect }: ArtistSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Artist[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');

    try {
      const data = await searchArtist(query);
      setResults(data.artists.items);
    } catch (err) {
      setError('Search failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for an artist..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 bg-white"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((artist) => (
            <button
              key={artist.id}
              onClick={() => {
                onArtistSelect(artist);
                setResults([]);
                setQuery('');
              }}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              {artist.images?.[0] ? (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  ?
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 truncate">{artist.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}