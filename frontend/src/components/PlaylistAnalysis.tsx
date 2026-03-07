import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AnalysisResult {
  topGenres: { genre: string; percentage: number }[];
  topArtists: { name: string; count: number }[];
  audioFeatures: {
    energy: number;
    danceability: number;
    valence: number;
    tempo: number;
  };
  profile: string;
}

export function PlaylistAnalysis() {
  const [playlistId, setPlaylistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const suggestedPlaylists = [
    {
      name: 'Peaceful Piano',
      id: '37i9dQZF1DX4sWSpwq3LiO',
      description: 'Relaxing piano pieces',
      image: 'https://images.unsplash.com/photo-1771616504939-1187e5b82226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxheGluZyUyMGFjb3VzdGljJTIwbXVzaWN8ZW58MXx8fHwxNzcyOTA5MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Workout Beats',
      id: '37i9dQZF1DX76Wlfdnj7AP',
      description: 'High energy motivation',
      image: 'https://images.unsplash.com/photo-1666979290238-2d862b573345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmVyZ2V0aWMlMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc3MjkwOTI2Mnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      name: 'Indie Mix',
      id: '37i9dQZF1DX2Nc3B70tvx0',
      description: 'Alternative indie vibes',
      image: 'https://images.unsplash.com/photo-1760160741895-eade1f12d01e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGFsdGVybmF0aXZlJTIwY29uY2VydHxlbnwxfHx8fDE3NzI5MDkyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
  ];

  const handleAnalyze = async () => {
    if (!playlistId.trim()) {
      setError('Please enter a playlist ID or URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with your AWS API Gateway endpoint
      const response = await fetch('YOUR_API_GATEWAY_URL/analyze-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId: playlistId.trim() }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze playlist. Please check the ID and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="playlist-id" className="block text-sm font-medium text-gray-700 mb-2">
          Playlist ID or URL
        </label>
        <input
          id="playlist-id"
          type="text"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          placeholder="37i9dQZF1DXcBWIGoYBM5M or spotify:playlist:..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-3">Try these playlists:</p>
        <div className="grid grid-cols-3 gap-3">
          {suggestedPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setPlaylistId(playlist.id)}
              className="group relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-md transition-all"
            >
              <ImageWithFallback
                src={playlist.image}
                alt={playlist.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                <p className="text-white font-medium text-sm">{playlist.name}</p>
                <p className="text-white/80 text-xs">{playlist.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Playlist'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 pt-4">
          {/* Profile */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Music Taste Profile</h3>
            <p className="text-gray-700">{result.profile}</p>
          </div>

          {/* Top Genres */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Genres</h3>
            <div className="space-y-2">
              {result.topGenres.map((genre) => (
                <div key={genre.genre} className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full"
                      style={{ width: `${genre.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 min-w-[60px]">
                    {genre.genre}
                  </span>
                  <span className="text-sm text-gray-500 min-w-[40px] text-right">
                    {genre.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Artists</h3>
            <div className="grid grid-cols-2 gap-2">
              {result.topArtists.map((artist, index) => (
                <div
                  key={artist.name}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">{artist.name}</span>
                  <span className="text-xs text-gray-500">{artist.count} tracks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Audio Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.round(result.audioFeatures.energy * 100)}%
                </div>
                <div className="text-sm text-gray-600">Energy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.round(result.audioFeatures.danceability * 100)}%
                </div>
                <div className="text-sm text-gray-600">Danceability</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.round(result.audioFeatures.valence * 100)}%
                </div>
                <div className="text-sm text-gray-600">Positivity</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-semibold text-gray-900">
                  {Math.round(result.audioFeatures.tempo)}
                </div>
                <div className="text-sm text-gray-600">BPM</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
