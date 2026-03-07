import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ComparisonResult {
  similarityScore: number;
  sharedGenres: string[];
  uniqueGenres1: string[];
  uniqueGenres2: string[];
  keyDifferences: string[];
}

export function PlaylistComparison() {
  const [playlistId1, setPlaylistId1] = useState('');
  const [playlistId2, setPlaylistId2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!playlistId1.trim() || !playlistId2.trim()) {
      setError('Please enter both playlist IDs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with your AWS API Gateway endpoint
      const response = await fetch('YOUR_API_GATEWAY_URL/compare-playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          playlistId1: playlistId1.trim(),
          playlistId2: playlistId2.trim() 
        }),
      });

      if (!response.ok) throw new Error('Comparison failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to compare playlists. Please check the IDs and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="playlist-1" className="block text-sm font-medium text-gray-700 mb-2">
          First Playlist ID
        </label>
        <input
          id="playlist-1"
          type="text"
          value={playlistId1}
          onChange={(e) => setPlaylistId1(e.target.value)}
          placeholder="37i9dQZF1DXcBWIGoYBM5M"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="playlist-2" className="block text-sm font-medium text-gray-700 mb-2">
          Second Playlist ID
        </label>
        <input
          id="playlist-2"
          type="text"
          value={playlistId2}
          onChange={(e) => setPlaylistId2(e.target.value)}
          placeholder="37i9dQZF1DX0XUsuxWHRQd"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Comparing...
          </>
        ) : (
          'Compare Playlists'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 pt-4">
          {/* Similarity Score */}
          <div className="text-center pb-4 border-b border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {result.similarityScore}%
            </div>
            <p className="text-gray-600">Similarity Score</p>
          </div>

          {/* Shared Genres */}
          {result.sharedGenres.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Shared Genres</h3>
              <div className="flex flex-wrap gap-2">
                {result.sharedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unique to Each Playlist */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Unique to Playlist 1</h3>
              <div className="space-y-1">
                {result.uniqueGenres1.length > 0 ? (
                  result.uniqueGenres1.map((genre) => (
                    <div
                      key={genre}
                      className="px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded"
                    >
                      {genre}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Unique to Playlist 2</h3>
              <div className="space-y-1">
                {result.uniqueGenres2.length > 0 ? (
                  result.uniqueGenres2.map((genre) => (
                    <div
                      key={genre}
                      className="px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded"
                    >
                      {genre}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None</p>
                )}
              </div>
            </div>
          </div>

          {/* Key Differences */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Differences</h3>
            <ul className="space-y-2">
              {result.keyDifferences.map((diff, index) => (
                <li
                  key={index}
                  className="flex gap-2 px-3 py-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-700">{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
