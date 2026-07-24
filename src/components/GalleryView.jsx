import React from 'react';
import { History, Download, Copy, Trash2, Check } from 'lucide-react';

export default function GalleryView({ gallery, onClearGallery, onSelectFromGallery }) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopyPrompt = (id, promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item) => {
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `ai-studio-${item.presetName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Studio Generation History ({gallery.length})
          </h3>
        </div>
        <button
          onClick={onClearGallery}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/40 flex flex-col"
          >
            {/* Image Preview Container */}
            <div 
              className="relative w-full aspect-square overflow-hidden cursor-pointer"
              onClick={() => onSelectFromGallery(item)}
              style={{ background: item.presetGradient }}
            >
              <img
                src={item.productImage}
                alt={item.presetName}
                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Actions Bar */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                  className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 shadow-md"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyPrompt(item.id, item.prompt); }}
                  className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-md"
                  title="Copy Prompt"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Info Footer */}
            <div className="p-2 text-[11px] bg-slate-950/80 border-t border-white/5">
              <span className="font-semibold text-slate-200 block truncate">{item.presetName}</span>
              <span className="text-slate-500 text-[10px]">{item.aspectRatio}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
