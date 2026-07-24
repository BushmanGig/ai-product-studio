import React from 'react';
import { Sun, Contrast, Flame, Moon, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

export default function LightingControls({ lighting, onChangeLighting, onResetLighting }) {
  const handleChange = (key, value) => {
    onChangeLighting({
      ...lighting,
      [key]: Number(value)
    });
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider font-heading">
              Studio Light & Shadow
            </h3>
            <p className="text-[11px] text-slate-400">Fine-tune exposure & color warmth</p>
          </div>
        </div>
        <button
          onClick={onResetLighting}
          className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-mono"
          title="Reset lighting defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="flex flex-col gap-4 text-xs text-slate-200">
        {/* Brightness */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Sun className="w-4 h-4 text-amber-400" /> Key Light Exposure
            </span>
            <span className="font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              {lighting.brightness}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="160"
            value={lighting.brightness}
            onChange={(e) => handleChange('brightness', e.target.value)}
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Contrast className="w-4 h-4 text-purple-400" /> Fill Contrast
            </span>
            <span className="font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              {lighting.contrast}%
            </span>
          </div>
          <input
            type="range"
            min="70"
            max="150"
            value={lighting.contrast}
            onChange={(e) => handleChange('contrast', e.target.value)}
          />
        </div>

        {/* Warmth */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Flame className="w-4 h-4 text-orange-400" /> Color Temperature
            </span>
            <span className="font-mono text-orange-300 font-bold bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">
              {lighting.warm > 0 ? `+${lighting.warm}K Warm` : `${lighting.warm}K Cool`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={lighting.warm}
            onChange={(e) => handleChange('warm', e.target.value)}
          />
        </div>

        {/* Shadow Opacity */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Moon className="w-4 h-4 text-cyan-400" /> Ground Shadow Intensity
            </span>
            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {lighting.shadow}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lighting.shadow}
            onChange={(e) => handleChange('shadow', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
