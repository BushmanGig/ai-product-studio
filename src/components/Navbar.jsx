import React from 'react';
import { Sparkles, Download, Code2, RefreshCw, Layers, Zap, ExternalLink } from 'lucide-react';

export default function Navbar({ onOpenExport, onResetCanvas, onOpenSampleModal }) {
  return (
    <header className="w-full glass-panel sticky top-4 z-40 px-6 py-4 mb-8 flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-2xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative w-11 h-11 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent font-heading tracking-tight">
              AI Product Studio
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/40 rounded-full font-mono uppercase">
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" /> PRO STUDIO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Commercial E-Commerce Photography Engine</p>
        </div>
      </div>

      {/* Center Live Sync & Status Indicator */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/90 border border-purple-500/30 text-xs shadow-inner">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold">Vite Live:</span>
          <span className="text-slate-300 font-mono">http://localhost:5173</span>
        </div>
        <div className="w-[1px] h-3.5 bg-white/10"></div>
        <a 
          href="https://github.com/BushmanGig/ai-product-studio" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-purple-300 text-slate-400 flex items-center gap-1.5 transition-colors font-mono"
        >
          <span>BushmanGig/ai-product-studio</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSampleModal}
          className="btn-secondary text-xs px-4 py-2.5 hover:border-purple-500/50"
          title="Choose a sample product to test studio photography"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Product Samples</span>
        </button>

        <button
          onClick={onResetCanvas}
          className="btn-secondary text-xs px-3.5 py-2.5 hover:border-slate-600"
          title="Reset canvas positioning & lighting"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Reset Stage</span>
        </button>

        <button
          onClick={onOpenExport}
          className="btn-primary text-xs px-5 py-2.5"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K Photo</span>
        </button>
      </div>
    </header>
  );
}
