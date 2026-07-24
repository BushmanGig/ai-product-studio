import React, { useState } from 'react';
import { Sparkles, Grid, Move, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Camera, Focus } from 'lucide-react';

export default function StudioCanvas({
  selectedPreset,
  productImage,
  productName,
  aspectRatio,
  lighting,
  isGenerating,
  scale,
  setScale,
  position,
  setPosition,
  rotation,
  setRotation
}) {
  const [showGrid, setShowGrid] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Aspect Ratio Dimensions calculation
  const getAspectRatioStyle = () => {
    switch (aspectRatio.id) {
      case '4:5': return { aspectRatio: '4 / 5', maxHeight: '580px' };
      case '16:9': return { aspectRatio: '16 / 9', maxHeight: '420px' };
      case '9:16': return { aspectRatio: '9 / 16', maxHeight: '620px' };
      case '1:1':
      default: return { aspectRatio: '1 / 1', maxHeight: '520px' };
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full h-full">
      {/* Viewport Control Bar */}
      <div className="flex items-center justify-between px-3 text-xs text-slate-400 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2.5 font-mono">
          <Camera className="w-4 h-4 text-purple-400" />
          <span className="text-slate-200 font-semibold">{aspectRatio.label}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-purple-300">
            {aspectRatio.width} x {aspectRatio.height} px
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              showGrid ? 'bg-purple-950/80 border-purple-500/60 text-purple-200 shadow-md shadow-purple-950/50' : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Studio Framing Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">Grid</span>
          </button>
          
          <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 gap-1">
            <button
              onClick={() => setScale(Math.max(0.4, scale - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-300 px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(1.8, scale + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div 
        className="relative w-full mx-auto glass-panel overflow-hidden flex items-center justify-center border-white/10 shadow-2xl transition-all duration-300 touch-none group"
        style={getAspectRatioStyle()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Dynamic Preset Gradient Background */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: selectedPreset.gradient,
            filter: `brightness(${lighting.brightness}%) contrast(${lighting.contrast}%) sepia(${lighting.warm > 0 ? lighting.warm : 0}%) hue-rotate(${lighting.warm < 0 ? lighting.warm : 0}deg)`
          }}
        />

        {/* Studio Spotlight Cone Ray */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse at 50% 15%, rgba(255, 255, 255, 0.6) 0%, transparent 65%)`,
          }}
        />

        {/* Viewport Crosshair Target Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/20 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/20 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/20 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 pointer-events-none"></div>

        {/* Composition Framing Grid */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-purple-400/25">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-purple-400/15 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400/30"></div>
              </div>
            ))}
          </div>
        )}

        {/* Product Ground Shadow Shader */}
        <div 
          className="absolute bottom-12 w-3/4 h-14 rounded-full pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 75%)',
            opacity: lighting.shadow / 100,
            transform: `translate(${position.x * 0.8}px, ${position.y * 0.1}px) scale(${scale * 0.95})`,
            filter: `blur(${lighting.blur}px)`
          }}
        />

        {/* Product Image Layer */}
        {productImage ? (
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className={`relative cursor-grab active:cursor-grabbing transition-transform duration-75 select-none ${
              isDragging ? 'scale-[1.03]' : ''
            }`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              filter: `drop-shadow(0 25px 30px rgba(0,0,0,${lighting.shadow / 100}))`
            }}
          >
            <img
              src={productImage}
              alt={productName || "Product"}
              onDragStart={(e) => e.preventDefault()}
              className="max-w-[290px] max-h-[330px] object-contain pointer-events-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">No Product Loaded</p>
              <p className="text-xs text-slate-500">Upload your product photo or select a sample</p>
            </div>
          </div>
        )}

        {/* AI Generating Animation Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg flex flex-col items-center justify-center gap-4 z-20 transition-all duration-300">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 border-r-pink-500 animate-spin"></div>
              <Sparkles className="w-8 h-8 text-purple-300 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                Rendering 4K Studio Scene...
              </p>
              <p className="text-xs text-slate-400 mt-1">Raytracing softbox lighting & background reflections</p>
            </div>
          </div>
        )}
      </div>

      {/* Viewport Status & Position Reset */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-3">
        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <Move className="w-3.5 h-3.5 text-purple-400" /> Position: {position.x}px, {position.y}px
        </span>
        <button
          onClick={() => { setPosition({ x: 0, y: 0 }); setScale(1); setRotation(0); }}
          className="hover:text-purple-300 flex items-center gap-1 transition-colors text-[11px] font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Stage Center
        </button>
      </div>
    </div>
  );
}
