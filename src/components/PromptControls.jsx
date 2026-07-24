import React from 'react';
import { ASPECT_RATIOS } from '../data/presets';
import { Sparkles, Crop as AspectIcon, FileText, Ban, Tag, Zap } from 'lucide-react';

export default function PromptControls({
  prompt,
  onChangePrompt,
  negativePrompt,
  onChangeNegativePrompt,
  selectedAspect,
  onSelectAspect,
  onGenerate,
  isGenerating
}) {
  const STYLE_TAGS = [
    'Cinematic 8K',
    'Softbox Studio',
    'Editorial Vogue',
    'Minimalist Luxury',
    'Raytraced Reflections',
    'Golden Hour Sun'
  ];

  const handleAddTag = (tag) => {
    if (!prompt.includes(tag)) {
      onChangePrompt(`${prompt}, ${tag}`);
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider font-heading">
            AI Prompt Engineering
          </h3>
          <p className="text-[11px] text-slate-400">Customize scene description & aspects</p>
        </div>
      </div>

      {/* Main Prompt Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-400" /> Scene Prompt Description
          </span>
          <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
            Gemini Vision Ready
          </span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          rows={3}
          className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 resize-none transition-all placeholder:text-slate-600 font-main leading-relaxed shadow-inner"
          placeholder="Describe the studio setting, lighting, background props..."
        />

        {/* Quick Style Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {STYLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleAddTag(tag)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-purple-950/60 border border-white/10 hover:border-purple-500/40 text-slate-400 hover:text-purple-300 transition-all font-mono flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-purple-400" />
              <span>+{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex flex-col gap-2 pt-1">
        <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
          <AspectIcon className="w-3.5 h-3.5 text-cyan-400" /> Canvas Aspect Ratio
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedAspect.id === ratio.id;
            return (
              <button
                key={ratio.id}
                onClick={() => onSelectAspect(ratio)}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/50 text-slate-100 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50'
                    : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{ratio.label}</span>
                  <span className="text-[10px] font-mono text-purple-300">{ratio.id}</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">{ratio.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Negative Prompt */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
          <Ban className="w-3.5 h-3.5 text-rose-400" /> Exclude (Negative Filters)
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onChangeNegativePrompt(e.target.value)}
          className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500/60 transition-all placeholder:text-slate-600 font-mono shadow-inner"
          placeholder="low quality, blur, noise, text, watermark..."
        />
      </div>

      {/* Generate Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="btn-primary w-full py-3.5 justify-center text-sm font-bold mt-2 shadow-xl shadow-purple-600/40 disabled:opacity-50"
      >
        <Zap className="w-4 h-4 fill-white animate-pulse" />
        <span>{isGenerating ? 'Synthesizing Studio Shot...' : 'Generate AI Studio Photography'}</span>
      </button>
    </div>
  );
}
