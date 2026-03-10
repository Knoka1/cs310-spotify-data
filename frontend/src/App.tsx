import { useState } from 'react';
import { Music2, TrendingUp, Users, Clock } from 'lucide-react';
import { PlaylistAnalysis } from '@/components/PlaylistAnalysis';
import { ArtistAnalysis } from '@/components/ArtistAnalysis';
import { PlaylistComparison } from '@/components/PlaylistComparison';
import { ArtistComparison } from '@/components/ArtistComparison';import { ArtistSearch } from '@/components/ArtistSearch';
import { ArtistEras } from '@/components/ArtistEras';
import { Button } from '@/components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = useState<'playlist' | 'artist' | 'compare' | 'eras'>('playlist');
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string; images: { url: string }[] } | null>(null);

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
          <Button
            variant="ghost"
            onClick={() => setActiveTab('playlist')}
            className={`rounded-none border-b-2 ${activeTab === 'playlist' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
          >
            <Music2 className="w-5 h-5" />
            Playlist Analysis
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('artist')}
            className={`rounded-none border-b-2 ${activeTab === 'artist' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
          >
            <Users className="w-5 h-5" />
            Artist Analysis
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('compare')}
            className={`rounded-none border-b-2 ${activeTab === 'compare' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
          >
            <TrendingUp className="w-5 h-5" />
            Comparison
          </Button>
          <Button
            variant="ghost"
            onClick={() => { setActiveTab('eras'); setSelectedArtist(null); }}
            className={`rounded-none border-b-2 ${activeTab === 'eras' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'}`}
          >
            <Clock className="w-5 h-5" />
            Artist Eras
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {activeTab === 'playlist' && <PlaylistAnalysis />}
          {activeTab === 'artist' && <ArtistAnalysis />}
          {activeTab === 'compare' && <PlaylistComparison />}
          {activeTab === 'compare' && <ArtistComparison />}
          {activeTab === 'eras' && (
            <div className="space-y-6">
              <ArtistSearch onArtistSelect={setSelectedArtist} />
              {selectedArtist && (
                <>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                    {selectedArtist.images?.[0] && (
                      <img src={selectedArtist.images[0].url} alt={selectedArtist.name} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Selected Artist</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedArtist.name}</p>
                    </div>
                  </div>
                  <ArtistEras artistId={selectedArtist.id} artistName={selectedArtist.name} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
