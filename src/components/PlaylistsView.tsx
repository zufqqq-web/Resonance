import React, { useState } from 'react';
import { ListMusic, Plus, Play } from 'lucide-react';
import { Track, Playlist } from '../types/music';
import { TrackList } from './TrackList';

interface PlaylistsViewProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddToQueue: (track: Track) => void;
  onPlayNext: (track: Track) => void;
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    name: 'Midnight Cruising',
    description: 'Neon drenched synthwave for late night city highway drives',
    trackIds: ['trk-1', 'trk-4', 'trk-7'],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'pl-2',
    name: 'Deep Focus & Study',
    description: 'Soothing lo-fi and ambient electronic soundscapes',
    trackIds: ['trk-2', 'trk-3', 'trk-6', 'trk-9'],
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'pl-3',
    name: 'Cosmic Horizons',
    description: 'Space drones and hypnotic atmospheric sound designs',
    trackIds: ['trk-5', 'trk-8'],
    createdAt: Date.now() - 86400000 * 12,
  },
];

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onAddToQueue,
  onPlayNext,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(DEFAULT_PLAYLISTS[0].id);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];
  const playlistTracks = tracks.filter((t) => activePlaylist.trackIds.includes(t.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: newTitle.trim(),
      description: 'Custom created playlist',
      trackIds: tracks.slice(0, 3).map((t) => t.id),
      createdAt: Date.now(),
    };
    setPlaylists([newPl, ...playlists]);
    setSelectedPlaylistId(newPl.id);
    setNewTitle('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col px-8 pt-6 pb-28 overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#C0CAF5]">Playlists</h1>
          <p className="text-[13px] text-[#565F89] mt-0.5">Your personal curated mixes and sound collections</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#24283B] hover:bg-[#292E42] text-xs font-semibold text-[#BB9AF7] border border-[#BB9AF7]/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-6 p-4 rounded-2xl bg-[#16161E]/80 border border-[#BB9AF7]/40 flex items-center gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Playlist name..."
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#24283B] text-xs text-[#C0CAF5] border border-[#414868]/40 focus:outline-none focus:border-[#BB9AF7]"
          />
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#BB9AF7] text-[#16161E] text-xs font-semibold">
            Create
          </button>
          <button type="button" onClick={() => setIsCreating(false)} className="px-3 py-1.5 rounded-lg text-xs text-[#565F89] hover:text-[#C0CAF5]">
            Cancel
          </button>
        </form>
      )}

      {/* Playlists grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {playlists.map((pl) => {
          const isSelected = pl.id === selectedPlaylistId;
          return (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`p-4 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between h-32 ${
                isSelected
                  ? 'bg-[#24283B] border-[#BB9AF7]/50 shadow-md'
                  : 'bg-[#16161E]/60 border-[#414868]/30 hover:bg-[#24283B]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#16161E] flex items-center justify-center border border-[#414868]/40">
                    <ListMusic className={`w-4 h-4 ${isSelected ? 'text-[#BB9AF7]' : 'text-[#9AA5CE]'}`} />
                  </div>
                  <span className="text-[11px] font-mono text-[#565F89]">
                    {pl.trackIds.length} tracks
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#C0CAF5] truncate">{pl.name}</h3>
                <p className="text-[11px] text-[#565F89] line-clamp-1 mt-0.5">{pl.description}</p>
              </div>

              {playlistTracks.length > 0 && isSelected && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playlistTracks[0]) onPlayTrack(playlistTracks[0]);
                    }}
                    className="w-7 h-7 rounded-full bg-[#BB9AF7] text-[#16161E] flex items-center justify-center hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Playlist Tracks Table */}
      <div className="flex flex-col">
        <h2 className="text-sm font-semibold text-[#9AA5CE] mb-3">
          {activePlaylist.name} — Tracks
        </h2>
        <TrackList
          tracks={playlistTracks}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onAddToQueue={onAddToQueue}
          onPlayNext={onPlayNext}
        />
      </div>
    </div>
  );
};
