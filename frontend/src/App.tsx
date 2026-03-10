import { useState } from 'react';
import { Music2, TrendingUp, Users } from 'lucide-react';
import { ArtistAnalysis } from '@/components/ArtistAnalysis';
import { ArtistComparison } from '@/components/ArtistComparison';
import { Button } from '@/components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = useState<'artist' | 'compare'>('artist');

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Music2 className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">MusicMood</h1>
          </div>
          <p className="text-gray-600 ml-11">
            Analyze artists and compare their catalog evolution
          </p>
          <hr className="mt-6" />
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('artist')}
            className={`rounded-none border-b-2 ${
              activeTab === 'artist'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
          >
            <Users className="w-5 h-5" />
            Artist Analysis
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab('compare')}
            className={`rounded-none border-b-2 ${
              activeTab === 'compare'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Artist Comparison
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {activeTab === 'artist' && <ArtistAnalysis />}
          {activeTab === 'compare' && <ArtistComparison />}
        </div>
      </div>
    </div>
  );
}