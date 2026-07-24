import React, { useState } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const TimelineGeoView: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { nodes, flyToNode, selectNode } = useVault();
  const [activeMode, setActiveMode] = useState<'timeline' | 'geo'>('timeline');

  if (!isOpen) return null;

  const sortedNodes = [...nodes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed bottom-6 left-6 right-6 z-40 p-4 rounded-3xl bg-slate-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'timeline' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Timeline Scrubber
          </button>
          <button
            onClick={() => setActiveMode('geo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'geo' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Geo Map Clusters
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {activeMode === 'timeline' && (
        <div className="flex items-center gap-4 overflow-x-auto py-2">
          {sortedNodes.map((node) => (
            <div
              key={node.id}
              onClick={() => {
                selectNode(node);
                flyToNode(node.id);
              }}
              className="flex-shrink-0 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-400 cursor-pointer transition-all w-48 space-y-1.5 group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span>{node.date}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">{node.title}</h5>
              <p className="text-[11px] text-slate-400 truncate">{node.branches.length} memory assets</p>
            </div>
          ))}
        </div>
      )}

      {activeMode === 'geo' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2">
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => {
                selectNode(node);
                flyToNode(node.id);
              }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-400 cursor-pointer transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{node.category}</span>
              </div>
              <p className="text-xs font-bold text-white truncate">{node.title}</p>
              <p className="text-[10px] text-slate-400 font-mono">Coordinates: [{(node.position[0]*10).toFixed(2)}°, {(node.position[1]*10).toFixed(2)}°]</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
