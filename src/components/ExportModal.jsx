import React, { useState } from 'react';
import { EXPORT_PRESETS } from '../data/presets';
import { Download, X, Check, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal({ isOpen, onClose, selectedPreset, aspectRatio }) {
  const [selectedFormat, setSelectedFormat] = useState('shopify');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-6 relative border-purple-500/30 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Export Studio Photo</h3>
              <p className="text-xs text-slate-400">Select target platform & image format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {EXPORT_PRESETS.map((preset) => {
            const isSelected = selectedFormat === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedFormat(preset.id)}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500/40 text-slate-100'
                    : 'border-white/5 bg-slate-900/60 text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{preset.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-purple-300 font-mono">
                      {preset.format}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{preset.dims}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700'
                }`}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quality Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>4K Render engine active. Color profiles converted to standard sRGB for web compatibility.</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-primary py-3 justify-center text-sm font-bold shadow-lg shadow-purple-600/30"
        >
          {isSuccess ? (
            <span className="flex items-center gap-2 text-emerald-300 font-bold">
              <Check className="w-5 h-5" /> Downloaded High-Res Studio Photo!
            </span>
          ) : isExporting ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" /> Processing 4K Studio Render...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Studio Photography
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
