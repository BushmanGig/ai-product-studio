import React from 'react';
import { SAMPLE_PRODUCTS } from '../data/presets';
import { Upload, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function SampleModal({ isOpen, onClose, onSelectSample, onCustomUpload }) {
  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onCustomUpload(evt.target.result, file.name);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl p-6 relative border-purple-500/30 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Select Product Photo</h3>
              <p className="text-xs text-slate-400">Choose a sample item or upload your own transparent product PNG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom File Drag & Drop Upload Zone */}
        <label className="group relative border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 text-center">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
              Click to Upload Product Photo
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, WebP with background isolation</p>
          </div>
        </label>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10"></div>
          <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">Or Pick Sample</span>
          <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>

        {/* Sample Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => { onSelectSample(sample); onClose(); }}
              className="group p-3 rounded-xl border border-white/5 bg-slate-900/60 hover:border-purple-500/50 hover:bg-purple-950/20 flex flex-col gap-2 transition-all text-left"
            >
              <div className="w-full aspect-square rounded-lg bg-slate-950/80 p-2 overflow-hidden border border-white/5 flex items-center justify-center">
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate">
                  {sample.name}
                </h4>
                <p className="text-[10px] text-slate-400">{sample.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
