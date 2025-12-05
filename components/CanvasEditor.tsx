import React, { useEffect, useRef, useState } from 'react';

interface CanvasEditorProps {
  imageSrc: string;
  price: string;
  onDownload: () => void;
}

type BadgeShape = 'circle' | 'square' | 'star' | 'none';
type BadgePosition = 'tr' | 'tl' | 'br' | 'bl';
type FontFamily = 'Inter' | 'Playfair Display' | 'Oswald';
type PresetType = 'modern' | 'luxury' | 'sale' | 'street';

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ imageSrc, price, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // -- STATE MANAGEMENT --
  const [activeTab, setActiveTab] = useState<'templates' | 'content' | 'style'>('templates');
  
  // Content
  const [headline, setHeadline] = useState("LIVRAISON GRATUITE");
  const [subHeadline, setSubHeadline] = useState("58 Wilayas");
  const [displayPrice, setDisplayPrice] = useState(price);
  
  // Style & Layout
  const [fontFamily, setFontFamily] = useState<FontFamily>('Inter');
  const [badgeShape, setBadgeShape] = useState<BadgeShape>('circle');
  const [badgePosition, setBadgePosition] = useState<BadgePosition>('br');
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState("#fbbf24"); // Amber (Badge)
  const [secondaryColor, setSecondaryColor] = useState("#ffffff"); // Text
  const [accentColor, setAccentColor] = useState("#000000"); // Overlay/Shadow
  
  // Adjustments
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [isTopGradient, setIsTopGradient] = useState(false);

  // Sync prop price
  useEffect(() => {
    if (price && price !== "0000") {
      setDisplayPrice(price);
    }
  }, [price]);

  // -- PRESETS --
  const applyPreset = (preset: PresetType) => {
    switch (preset) {
      case 'modern':
        setFontFamily('Inter');
        setBadgeShape('circle');
        setBadgePosition('br');
        setPrimaryColor('#10b981'); // Emerald
        setSecondaryColor('#ffffff');
        setAccentColor('#000000');
        setOverlayOpacity(0.7);
        setIsTopGradient(false);
        setHeadline("NOUVELLE COLLECTION");
        break;
      case 'luxury':
        setFontFamily('Playfair Display');
        setBadgeShape('none'); // Minimalist
        setBadgePosition('bl');
        setPrimaryColor('#c0a062'); // Gold
        setSecondaryColor('#ffffff');
        setAccentColor('#1a1a1a');
        setOverlayOpacity(0.4);
        setIsTopGradient(false);
        setHeadline("Premium Quality");
        break;
      case 'sale':
        setFontFamily('Oswald');
        setBadgeShape('star');
        setBadgePosition('tr');
        setPrimaryColor('#ef4444'); // Red
        setSecondaryColor('#ffffff');
        setAccentColor('#000000');
        setOverlayOpacity(0.3);
        setIsTopGradient(true);
        setHeadline("PROMO -50%");
        break;
      case 'street':
        setFontFamily('Inter');
        setBadgeShape('square');
        setBadgePosition('tl');
        setPrimaryColor('#ec4899'); // Pink
        setSecondaryColor('#000000'); // Black Text
        setAccentColor('#ffffff'); // White Overlay
        setOverlayOpacity(0.1);
        setIsTopGradient(true);
        setHeadline("LIMITED DROP");
        break;
    }
  };

  // -- DRAWING LOGIC --
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.min(w, h) / 1000;

      // 1. Draw Image
      ctx.drawImage(img, 0, 0);

      // 2. Draw Overlay Gradient
      ctx.save();
      const gradH = 400 * scale;
      let gradient;
      
      if (isTopGradient) {
        gradient = ctx.createLinearGradient(0, 0, 0, gradH);
        gradient.addColorStop(0, accentColor === '#ffffff' ? `rgba(255,255,255,${overlayOpacity})` : `rgba(0,0,0,${overlayOpacity})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, gradH);
      } else {
        gradient = ctx.createLinearGradient(0, h - gradH, 0, h);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, accentColor === '#ffffff' ? `rgba(255,255,255,${overlayOpacity})` : `rgba(0,0,0,${overlayOpacity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h - gradH, w, gradH);
      }
      ctx.restore();

      // 3. Draw Text (Headline & Subhead)
      ctx.save();
      ctx.textAlign = "center";
      
      // Font Loading (Basic heuristic)
      const baseFont = fontFamily;
      
      // Position Text
      const textY = isTopGradient ? 100 * scale : h - (150 * scale);
      
      // Headline
      ctx.font = `bold ${60 * scale}px "${baseFont}", sans-serif`;
      ctx.fillStyle = secondaryColor;
      // Add text shadow for legibility
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText(headline.toUpperCase(), w / 2, textY);

      // Subheadline
      if (subHeadline) {
        ctx.font = `${40 * scale}px "${baseFont}", sans-serif`;
        ctx.fillText(subHeadline, w / 2, textY + (60 * scale));
      }
      ctx.restore();

      // 4. Draw Price Badge
      if (displayPrice && badgeShape !== 'none') {
        ctx.save();
        
        // Calculate Position
        const padding = 80 * scale;
        let bx = 0, by = 0;

        switch(badgePosition) {
          case 'tl': bx = padding; by = padding; break;
          case 'tr': bx = w - padding; by = padding; break;
          case 'bl': bx = padding; by = h - padding; break;
          case 'br': bx = w - padding; by = h - padding; break;
        }

        // Draw Badge Shape
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 15;

        const size = 140 * scale;

        if (badgeShape === 'circle') {
          ctx.beginPath();
          ctx.arc(bx, by, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (badgeShape === 'square') {
          ctx.translate(bx, by);
          ctx.rotate(-10 * Math.PI / 180); // Slight tilt
          ctx.fillRect(-size, -size, size * 2, size * 2);
          ctx.rotate(10 * Math.PI / 180); // Reset for text
          ctx.translate(-bx, -by);
        } else if (badgeShape === 'star') {
          drawStar(ctx, bx, by, 12, size * 1.2, size * 0.9);
        }

        // Draw Price Text
        ctx.fillStyle = (badgeShape === 'square' && primaryColor === '#ec4899') ? '#ffffff' : '#000000'; // Contrast fix for specific presets
        if (badgeShape === 'square') ctx.fillStyle = '#ffffff'; // General rule for solid bright blocks usually needing white text
        if (primaryColor === '#fbbf24') ctx.fillStyle = '#000000'; // Amber needs black

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Price Number
        ctx.font = `bold ${50 * scale}px "${baseFont}", sans-serif`;
        // Handle rotation for square
        if (badgeShape === 'square') {
           ctx.translate(bx, by);
           ctx.rotate(-10 * Math.PI / 180);
           ctx.translate(-bx, -by);
        }
        
        ctx.fillText(displayPrice, bx, by - (15 * scale));
        
        // Currency
        ctx.font = `bold ${30 * scale}px "${baseFont}", sans-serif`;
        ctx.fillText("DA", bx, by + (35 * scale));

        ctx.restore();
      } else if (displayPrice && badgeShape === 'none') {
        // Minimalist Text Only Price
         ctx.save();
         const padding = 60 * scale;
         let bx = 0, by = 0;
         switch(badgePosition) {
            case 'tl': bx = padding; by = padding; break;
            case 'tr': bx = w - padding; by = padding; break;
            case 'bl': bx = padding; by = h - padding; break;
            case 'br': bx = w - padding; by = h - padding; break;
          }
         ctx.fillStyle = primaryColor;
         ctx.textAlign = badgePosition.includes('l') ? "left" : "right";
         ctx.font = `bold ${60 * scale}px "${baseFont}", sans-serif`;
         ctx.shadowColor = "rgba(0,0,0,0.8)";
         ctx.shadowBlur = 4;
         ctx.fillText(`${displayPrice} DA`, bx, by);
         ctx.restore();
      }
    };
  };

  useEffect(() => {
    drawCanvas();
  }, [
    imageSrc, headline, subHeadline, displayPrice,
    fontFamily, badgeShape, badgePosition,
    primaryColor, secondaryColor, accentColor,
    overlayOpacity, isTopGradient
  ]);

  const handleDownloadClick = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `tijara-design-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onDownload();
      } catch (e) {
        console.error("Download failed", e);
        alert("Could not download image.");
      }
    }
  };

  // -- UI COMPONENTS --

  const ColorPicker = ({ label, color, setColor }: { label: string, color: string, setColor: (c: string) => void }) => (
    <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg">
      <span className="text-xs text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 font-mono">{color}</span>
        <input 
          type="color" 
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-6 h-6 rounded overflow-hidden cursor-pointer border-0 p-0"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* LEFT: CANVAS AREA */}
      <div className="flex-1 bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-center backdrop-blur-sm">
        <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-lg" />
      </div>

      {/* RIGHT: CONTROLS */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
          
          {/* TABS HEADER */}
          <div className="flex border-b border-slate-700">
            {(['templates', 'content', 'style'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide space-y-6">
            
            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'modern', label: 'Modern', color: 'from-emerald-500 to-teal-600' },
                  { id: 'luxury', label: 'Luxury', color: 'from-amber-200 to-amber-500' },
                  { id: 'sale', label: 'Sale', color: 'from-red-500 to-orange-500' },
                  { id: 'street', label: 'Street', color: 'from-pink-500 to-purple-600' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id as PresetType)}
                    className="group relative overflow-hidden rounded-xl aspect-square flex items-end p-4 transition-transform hover:scale-105"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-80 group-hover:opacity-100`}></div>
                    <span className="relative text-white font-bold text-lg drop-shadow-md">{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Headline</label>
                    <input 
                      type="text" 
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sub-Headline</label>
                    <input 
                      type="text" 
                      value={subHeadline}
                      onChange={(e) => setSubHeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Price (DA)</label>
                    <input 
                      type="text" 
                      value={displayPrice}
                      onChange={(e) => setDisplayPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                    />
                 </div>
              </div>
            )}

            {/* STYLE TAB */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                
                {/* Colors */}
                <div className="space-y-2">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Palette</h4>
                   <ColorPicker label="Badge Color" color={primaryColor} setColor={setPrimaryColor} />
                   <ColorPicker label="Text Color" color={secondaryColor} setColor={setSecondaryColor} />
                   <ColorPicker label="Overlay Color" color={accentColor} setColor={setAccentColor} />
                </div>

                {/* Fonts */}
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Typography</h4>
                   <div className="flex bg-slate-900 p-1 rounded-lg">
                      {['Inter', 'Playfair Display', 'Oswald'].map(font => (
                        <button 
                          key={font}
                          onClick={() => setFontFamily(font as FontFamily)}
                          className={`flex-1 py-2 rounded text-xs transition ${fontFamily === font ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                          {font.split(' ')[0]}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Badge Shape */}
                <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Badge Shape</h4>
                   <div className="grid grid-cols-4 gap-2">
                      {(['circle', 'square', 'star', 'none'] as const).map(shape => (
                        <button 
                          key={shape}
                          onClick={() => setBadgeShape(shape)}
                          className={`py-2 rounded border text-xs capitalize ${badgeShape === shape ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        >
                          {shape}
                        </button>
                      ))}
                   </div>
                </div>

                 {/* Position */}
                 <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Badge Position</h4>
                   <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2 rounded-lg w-24 mx-auto">
                      <button onClick={() => setBadgePosition('tl')} className={`w-8 h-8 rounded ${badgePosition === 'tl' ? 'bg-emerald-500' : 'bg-slate-700'}`}></button>
                      <button onClick={() => setBadgePosition('tr')} className={`w-8 h-8 rounded ${badgePosition === 'tr' ? 'bg-emerald-500' : 'bg-slate-700'}`}></button>
                      <button onClick={() => setBadgePosition('bl')} className={`w-8 h-8 rounded ${badgePosition === 'bl' ? 'bg-emerald-500' : 'bg-slate-700'}`}></button>
                      <button onClick={() => setBadgePosition('br')} className={`w-8 h-8 rounded ${badgePosition === 'br' ? 'bg-emerald-500' : 'bg-slate-700'}`}></button>
                   </div>
                </div>

                {/* Sliders */}
                <div>
                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Overlay Opacity</span>
                      <span>{Math.round(overlayOpacity * 100)}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" max="1" step="0.1" 
                     value={overlayOpacity} 
                     onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                     className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
                </div>
                
                 <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                    <span className="text-xs text-slate-300">Top Gradient</span>
                    <button 
                      onClick={() => setIsTopGradient(!isTopGradient)} 
                      className={`w-10 h-5 rounded-full relative transition-colors ${isTopGradient ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isTopGradient ? 'left-6' : 'left-1'}`}></div>
                    </button>
                 </div>

              </div>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
             <button 
                onClick={handleDownloadClick}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
                <span>Download .PNG</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
