import React, { useEffect, useRef } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { useVault } from '../../context/VaultContext';

export const AISearchBar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { searchQuery, setSearchQuery, searchResults, nodes, selectNode } = useVault();
  const inputRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : setSearchQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, setSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden shadow-cyan-950/50">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type natural language query (e.g., 'kyoto bamboo', 'aurora', 'ocr text')..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
              <p className="text-xs font-semibold text-slate-300">Semantic AI & OCR Intelligence Engine</p>
              <p className="text-[11px] text-slate-500">Search memories by location, camera models, OCR text, or sentiment</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-medium">No matching memories found for "{searchQuery}"</p>
            </div>
          ) : (
            searchResults.map(result => {
              const node = nodes.find(n => n.id === result.matchedNodeId);
              if (!node) return null;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    selectNode(node);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                      style={{ backgroundColor: node.color }}
                    >
                      {node.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {node.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400 font-semibold">{result.reason}</span>
                        <span>•</span>
                        <span>{node.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Score: {result.score}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
