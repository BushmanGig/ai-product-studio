export const SCENE_PRESETS = [
  {
    id: 'minimalist-studio',
    name: 'Minimalist Studio',
    category: 'Studio',
    description: 'Clean monochrome podium with soft studio lighting and subtle gradient background.',
    badge: 'Popular',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    bgColor: '#1e293b',
    podiumStyle: 'circle',
    prompt: 'Professional product photography of item placed on a sleek matte podium, soft studio lighting, ultra-clean aesthetic, high resolution, 8k',
    lighting: { brightness: 105, contrast: 100, warm: 0, shadow: 40, blur: 8 }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    category: 'Creative',
    description: 'Vibrant neon blue and violet reflective surface with glowing atmospheric lights.',
    badge: 'Trending',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #09090b 50%, #0284c7 100%)',
    bgColor: '#18181b',
    podiumStyle: 'neon-square',
    prompt: 'Product shot on glossy reflective glass with glowing purple and cyan neon accent lines, dark sci-fi aesthetic, dramatic edge lighting',
    lighting: { brightness: 115, contrast: 120, warm: -20, shadow: 70, blur: 12 }
  },
  {
    id: 'luxury-marble',
    name: 'Luxury Marble',
    category: 'Luxury',
    description: 'Polished Italian Carrara marble surface with gold metal accents and warm ambient sunlight.',
    badge: 'Premium',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    bgColor: '#334155',
    podiumStyle: 'marble-hex',
    prompt: 'Luxury product photography on elegant white and gold veins marble countertop, soft warm sunlight, depth of field, high end editorial',
    lighting: { brightness: 110, contrast: 105, warm: 25, shadow: 50, blur: 10 }
  },
  {
    id: 'tropical-sun',
    name: 'Tropical Sun',
    category: 'Nature',
    description: 'Palm leaf shadow casting across warm terracotta sand and golden hour lighting.',
    badge: 'Organic',
    gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #1e293b 100%)',
    bgColor: '#451a03',
    podiumStyle: 'stone',
    prompt: 'Product photography outdoors in golden hour sun with organic palm tree leaves casting shadows on terracotta stone, summer vibe',
    lighting: { brightness: 120, contrast: 110, warm: 40, shadow: 60, blur: 6 }
  },
  {
    id: 'cozy-wood',
    name: 'Cozy Rustic Wood',
    category: 'Nature',
    description: 'Natural oak wood grain background with soft bokeh coffee shop ambiance.',
    badge: 'Warm',
    gradient: 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)',
    bgColor: '#27272a',
    podiumStyle: 'wood-plank',
    prompt: 'Cosy product photo set on rustic reclaimed oak table, warm ambient indoor lamps, soft background blur, handcrafted feel',
    lighting: { brightness: 100, contrast: 95, warm: 30, shadow: 45, blur: 15 }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    category: 'Creative',
    description: 'Soft pastel gradient background with smooth geometric 3D shapes.',
    badge: 'Modern',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #831843 50%, #0f172a 100%)',
    bgColor: '#312e81',
    podiumStyle: 'rounded-cube',
    prompt: 'Modern aesthetic product photography featuring soft pastel geometric props, studio shadow, play of light, commercial ad quality',
    lighting: { brightness: 110, contrast: 90, warm: 10, shadow: 30, blur: 5 }
  }
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'perfume',
    name: 'Luxury Fragrance Bottle',
    category: 'Beauty & Cosmetics',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
    description: 'Crystal glass bottle with gold cap'
  },
  {
    id: 'headphones',
    name: 'Wireless ANC Headphones',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'Matte black audio headphones'
  },
  {
    id: 'sneaker',
    name: 'Cyberpunk Runner Sneaker',
    category: 'Fashion & Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    description: 'Red athletic sneaker'
  },
  {
    id: 'watch',
    name: 'Chronograph Smartwatch',
    category: 'Jewelry & Watches',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'Sleek silver metal watch'
  }
];

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square 1:1', width: 1000, height: 1000, desc: 'Instagram Post, E-commerce' },
  { id: '4:5', label: 'Portrait 4:5', width: 1000, height: 1250, desc: 'Social Media Feed' },
  { id: '16:9', label: 'Landscape 16:9', width: 1280, height: 720, desc: 'Website Banner & Ads' },
  { id: '9:16', label: 'Story 9:16', width: 720, height: 1280, desc: 'TikTok, Reels, Shorts' }
];

export const EXPORT_PRESETS = [
  { id: 'shopify', name: 'Shopify Standard', dims: '2048 x 2048 px', format: 'PNG', transparent: true },
  { id: 'amazon', name: 'Amazon Product Main', dims: '2000 x 2000 px', format: 'JPG (Pure White)', transparent: false },
  { id: 'instagram', name: 'Instagram High-Res', dims: '1080 x 1350 px', format: 'PNG', transparent: false },
  { id: 'web-webp', name: 'Web Optimized WebP', dims: '1200 x 1200 px', format: 'WEBP', transparent: true }
];
