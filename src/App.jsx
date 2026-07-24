import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudioCanvas from './components/StudioCanvas';
import ScenePresets from './components/ScenePresets';
import LightingControls from './components/LightingControls';
import PromptControls from './components/PromptControls';
import GalleryView from './components/GalleryView';
import ExportModal from './components/ExportModal';
import SampleModal from './components/SampleModal';

import { SCENE_PRESETS, SAMPLE_PRODUCTS, ASPECT_RATIOS } from './data/presets';
import confetti from 'canvas-confetti';

export default function App() {
  // Active State
  const [selectedPreset, setSelectedPreset] = useState(SCENE_PRESETS[0]);
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0]);
  const [productImage, setProductImage] = useState(SAMPLE_PRODUCTS[0].imageUrl);
  const [productName, setProductName] = useState(SAMPLE_PRODUCTS[0].name);

  const [selectedAspect, setSelectedAspect] = useState(ASPECT_RATIOS[0]);
  const [prompt, setPrompt] = useState(SCENE_PRESETS[0].prompt);
  const [negativePrompt, setNegativePrompt] = useState('low resolution, noise, blur, distorted, text watermark');

  const [lighting, setLighting] = useState(SCENE_PRESETS[0].lighting);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState([]);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSampleOpen, setIsSampleOpen] = useState(false);

  // Preset Selection Handler
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setPrompt(preset.prompt);
    setLighting(preset.lighting);
  };

  // Sample Product Selection
  const handleSelectSample = (sample) => {
    setSelectedProduct(sample);
    setProductImage(sample.imageUrl);
    setProductName(sample.name);
  };

  // Custom Upload Handler
  const handleCustomUpload = (dataUrl, fileName) => {
    setSelectedProduct({ id: 'custom', name: fileName, category: 'Custom Upload' });
    setProductImage(dataUrl);
    setProductName(fileName);
  };

  // Reset Positioning
  const handleResetCanvas = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setLighting(selectedPreset.lighting);
  };

  // AI Photo Synthesis Generator Trigger
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      // Add to gallery history
      const newShot = {
        id: `shot-${Date.now()}`,
        productImage,
        productName,
        presetName: selectedPreset.name,
        presetGradient: selectedPreset.gradient,
        aspectRatio: selectedAspect.id,
        prompt,
        lighting,
        createdAt: new Date().toLocaleTimeString()
      };

      setGallery((prev) => [newShot, ...prev]);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center pb-12 px-4 sm:px-6">
      {/* Top Navbar */}
      <div className="w-full max-w-7xl">
        <Navbar
          onOpenExport={() => setIsExportOpen(true)}
          onResetCanvas={handleResetCanvas}
          onOpenSampleModal={() => setIsSampleOpen(true)}
        />
      </div>

      {/* Main Studio Workspace Grid */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Environments & Lighting Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          <ScenePresets
            selectedPreset={selectedPreset}
            onSelectPreset={handleSelectPreset}
          />
          <LightingControls
            lighting={lighting}
            onChangeLighting={setLighting}
            onResetLighting={() => setLighting(selectedPreset.lighting)}
          />
        </div>

        {/* Center Column: Interactive Studio Canvas Stage */}
        <div className="lg:col-span-4 flex flex-col items-center w-full">
          <div className="w-full glass-panel p-4 flex flex-col items-center gap-4">
            <StudioCanvas
              selectedPreset={selectedPreset}
              productImage={productImage}
              productName={productName}
              aspectRatio={selectedAspect}
              lighting={lighting}
              isGenerating={isGenerating}
              scale={scale}
              setScale={setScale}
              position={position}
              setPosition={setPosition}
              rotation={rotation}
              setRotation={setRotation}
            />
          </div>
        </div>

        {/* Right Column: AI Prompt & Aspect Ratio Generator */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          <PromptControls
            prompt={prompt}
            onChangePrompt={setPrompt}
            negativePrompt={negativePrompt}
            onChangeNegativePrompt={setNegativePrompt}
            selectedAspect={selectedAspect}
            onSelectAspect={setSelectedAspect}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </main>

      {/* Generation History Gallery */}
      <div className="w-full max-w-7xl">
        <GalleryView
          gallery={gallery}
          onClearGallery={() => setGallery([])}
          onSelectFromGallery={(item) => {
            setProductImage(item.productImage);
            setPrompt(item.prompt);
          }}
        />
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedPreset={selectedPreset}
        aspectRatio={selectedAspect}
      />

      <SampleModal
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
        onSelectSample={handleSelectSample}
        onCustomUpload={handleCustomUpload}
      />
    </div>
  );
}
