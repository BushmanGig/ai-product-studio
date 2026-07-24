import React, { useState } from 'react';
import { SCENE_PRESETS } from '../data/presets';
import { Sparkles, Check, Wand2, Layers } from 'lucide-react';

export default function ScenePresets({ selectedPreset, onSelectPreset }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Studio', 'Creative', 'Luxury', 'Nature'];

  const filteredPresets = activeCategory === 'All'
    ? SCENE_PRESETS
    : SCENE_PRESETS.filter(p => p.category === activeCategory);

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider font-heading">
              Studio Environments
            </h3>
            <p className="text-[11px] text-slate-400">Select lighting & backdrop preset</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/30 font-semibold">
          {filteredPresets.length} Presets
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/50'
                : 'bg-slate-900/80 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group relative text-left p-3 rounded-2xl border transition-all flex flex-col gap-2.5 overflow-hidden ${
                isSelected
                  ? 'border-purple-500 bg-purple-950/40 ring-2 ring-purple-500/40 shadow-xl shadow-purple-950/60'
                  : 'border-white/5 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/90'
              }`}
            >
              {/* Preview Thumbnail Gradient */}
              <div 
                className="w-full h-18 rounded-xl relative overflow-hidden flex items-end p-2.5 border border-white/10 shadow-inner group-hover:scale-[1.02] transition-transform duration-300"
                style={{ background: preset.gradient }}
              >
                {preset.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/90 text-purple-300 border border-purple-500/40 font-mono uppercase">
                    {preset.badge}
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
