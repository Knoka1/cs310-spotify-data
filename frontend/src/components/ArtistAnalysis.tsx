import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ArtistResult {
  artistName: string;
  popularity: number;
  topTracks: string[];
  audioFeatures: {
    instrumentalness: number;
    liveness: number;
    loudness: number;
    speechiness: number;
    danceability: number;
  };
  styleProfile: string;
}

export function ArtistAnalysis() {
  const [artistId, setArtistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArtistResult | null>(null);
  const [error, setError] = useState('');

  const suggestedArtists = [
    { 
      name: 'Taylor Swift', 
      id: '06HL4z0CvFAxyc27GXpf02',
      genre: 'Pop',
      image: 'https://images.unsplash.com/photo-1692796226663-dd49d738f43c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUYXlsb3IlMjBTd2lmdCUyMGNvbmNlcnR8ZW58MXx8fHwxNzcyOTA4NjA1fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'The Weeknd', 
      id: '1Xyo4u8uXC1ZmMpatF05PJ',
      genre: 'R&B',
      image: 'https://images.unsplash.com/photo-1766471870102-dcb1fe88e8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUaGUlMjBXZWVrbmQlMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzcyOTA4NjA2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'Drake', 
      id: '3TVXtAsR1Inumwj472S9r4',
      genre: 'Hip Hop',
      image: 'https://images.unsplash.com/photo-1509847950535-14e861e5191b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEcmFrZSUyMHJhcHBlcnxlbnwxfHx8fDE3NzI5MDg2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'Billie Eilish', 
      id: '6qqNVTkY8uBg9cP3Jd7DAH',
      genre: 'Alternative',
      image: 'https://images.unsplash.com/photo-1693835843843-82f691094f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGZlbWFsZSUyMHNpbmdlcnxlbnwxfHx8fDE3NzI5MDg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'Bad Bunny', 
      id: '4q3ewBCX7sLwd24euuV69X',
      genre: 'Reggaeton',
      image: 'https://images.unsplash.com/photo-1649359075483-f11404a1d952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYWQlMjBCdW5ueSUyMHJlZ2dhZXRvbnxlbnwxfHx8fDE3NzI5MDg2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    { 
      name: 'Dua Lipa', 
      id: '6M2wZ9GZgrQXHCFfjv46we',
      genre: 'Pop',
      image: 'https://images.unsplash.com/photo-1730875651456-9c9cde899602?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBtdXNpYyUyMHBlcmZvcm1lcnxlbnwxfHx8fDE3NzI5MDg2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
  ];

  const handleAnalyze = async () => {
    if (!artistId.trim()) {
      setError('Please enter an artist ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with your AWS API Gateway endpoint
      const response = await fetch('YOUR_API_GATEWAY_URL/analyze-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId: artistId.trim() }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze artist. Please check the ID and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="artist-id" className="block text-sm font-medium text-gray-700 mb-2">
          Artist ID
        </label>
        <input
          id="artist-id"
          type="text"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          placeholder="0TnOYISbd1XYRBk9myaseg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-3">Try these artists:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {suggestedArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => setArtistId(artist.id)}
              className="group relative overflow-hidden rounded-lg bg-gray-100 hover:shadow-md transition-all"
            >
              <ImageWithFallback
                src={artist.image}
                alt={artist.name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                <p className="text-white font-medium text-sm">{artist.name}</p>
                <p className="text-white/80 text-xs">{artist.genre}</p>
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
          'Analyze Artist'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 pt-4">
          {/* Artist Info */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.artistName}</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span className="text-sm text-gray-600">Popularity Score:</span>
              <span className="text-lg font-semibold text-gray-900">{result.popularity}/100</span>
            </div>
          </div>

          {/* Style Profile */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Style Profile</h3>
            <p className="text-gray-700">{result.styleProfile}</p>
          </div>

          {/* Top Tracks */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Tracks</h3>
            <ol className="space-y-2">
              {result.topTracks.map((track, index) => (
                <li
                  key={track}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium text-gray-500 min-w-[20px]">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{track}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Audio Features Distribution */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Audio Features</h3>
            <div className="space-y-3">
              {[
                { name: 'Instrumentalness', value: result.audioFeatures.instrumentalness },
                { name: 'Liveness', value: result.audioFeatures.liveness },
                { name: 'Loudness', value: result.audioFeatures.loudness },
                { name: 'Speechiness', value: result.audioFeatures.speechiness },
                { name: 'Danceability', value: result.audioFeatures.danceability },
              ].map((feature) => (
                <div key={feature.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{feature.name}</span>
                    <span className="text-gray-500">
                      {feature.name === 'Loudness' 
                        ? `${feature.value.toFixed(1)} dB`
                        : `${Math.round(feature.value * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full"
                      style={{ 
                        width: feature.name === 'Loudness'
                          ? `${Math.min(100, ((feature.value + 60) / 60) * 100)}%`
                          : `${feature.value * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
