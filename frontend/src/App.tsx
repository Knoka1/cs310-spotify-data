import { useState } from 'react';
import { Music2, TrendingUp, Users } from 'lucide-react';
import { PlaylistAnalysis } from './components/PlaylistAnalysis';
import { ArtistAnalysis } from './components/ArtistAnalysis';
import { PlaylistComparison } from './components/PlaylistComparison';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playlist' | 'artist' | 'compare'>('playlist');

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Music2 className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">MusicMood</h1>
          </div>
          <p className="text-gray-600 ml-11">Analyze playlists and artists with detailed insights</p>
          <hr className="mt-6" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'playlist'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Music2 className="w-5 h-5" />
            Playlist Analysis
          </button>
          <button
            onClick={() => setActiveTab('artist')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'artist'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Artist Analysis
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'compare'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Comparison
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {activeTab === 'playlist' && <PlaylistAnalysis />}
          {activeTab === 'artist' && <ArtistAnalysis />}
          {activeTab === 'compare' && <PlaylistComparison />}
        </div>
      </div>
    </div>
  );
}