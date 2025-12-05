import React, { useState, useRef } from 'react';
import { StepIndicator } from './components/StepIndicator';
import { CanvasEditor } from './components/CanvasEditor';
import { 
  fileToGenericBase64, 
  analyzeProductImage, 
  hallucinateScene, 
  generateDerjaCaption, 
  analyzeMarket,
  generateHighQualityReference 
} from './services/geminiService';
import { AppStep, ProductInfo, MarketData, ImageAspectRatio, ImageSize, Language } from './types';

// Icons
const IconMagic = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconAnalyze = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconEdit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;

const VIBE_PRESETS = [
  { id: 'algiers_street', label: 'Algiers Street', prompt: 'on a sunny street in Algiers, Casbah architecture background, urban lighting' },
  { id: 'neon_studio', label: 'Neon Studio', prompt: 'on a glossy podium in a dark studio with neon pink and blue lighting, cyberpunk aesthetic' },
  { id: 'sahara_dunes', label: 'Sahara Dunes', prompt: 'on golden sand dunes in the Sahara desert during sunset, warm lighting' },
  { id: 'marble_luxury', label: 'Marble Luxury', prompt: 'on a white marble table with blurred luxury interior background, bright soft lighting' },
  { id: 'minimalist', label: 'Minimalist', prompt: 'on a solid pastel color geometric stand, studio lighting, minimal shadows' }
];

const CAPTION_LANGUAGES = [
  { id: 'Darija (Arabic Script)', label: 'Darija (Arabic Script)' },
  { id: 'Darija (Latin/Francos)', label: 'Darija (Latin/Francos)' },
  { id: 'Arabic (MSA)', label: 'Arabic (Classical)' },
  { id: 'French', label: 'French' },
  { id: 'English', label: 'English' }
];

const TRANSLATIONS = {
  en: {
    upload_title: "Upload Product Photo",
    upload_desc: "Take a photo of your product, we'll fix the rest.",
    gen_asset: "Generate Stock Asset",
    gen_asset_desc: "Create professional product shots from scratch using Nano Banana 2.5",
    prompt_placeholder: "A futuristic running shoe on a mars surface...",
    generate_btn: "Generate with Nano Banana 2.5",
    hallucinate_btn: "Hallucinate Scene",
    write_copy_btn: "Next: Write Copy",
    analyzing: "Uploading & Analyzing Product...",
    scene_gen: "Improving the product scene...",
    hq_gen: "Generating with Nano Banana 2.5...",
    copy_gen: "Thinking about Strategy...",
    market_gen: "Scraping Market Data (Gemini 3 Pro + Search)...",
    copywriter_title: "Derja Copywriter",
    market_title: "Soug Analysis Report",
    final_polish: "Final Polish",
    final_desc: "Your AI-generated asset is ready for Instagram.",
    custom_prompt: "Custom Prompt (Optional)",
    detected_tags: "Detected Product Tags",
    regenerate: "Regenerate",
    next_market: "Next: Analyze Market",
    avg_price: "Average Market Price",
    ai_rec: "AI Recommendation",
    details: "Details",
    sources: "Sources (Grounding)",
    go_auto_design: "Go to Auto Design Studio",
    generated_caption: "Your Generated Caption",
    copy_clipboard: "Copy to Clipboard",
    no_data: "No data available",
    select_caption_lang: "Caption Language",
    market_subtitle: "Real-time market data & AI Analysis",
    thinking_mode: "Thinking Mode"
  },
  fr: {
    upload_title: "Télécharger la photo",
    upload_desc: "Prenez une photo, nous nous occupons du reste.",
    gen_asset: "Générer un Asset Stock",
    gen_asset_desc: "Créez des photos professionnelles avec Nano Banana 2.5",
    prompt_placeholder: "Une chaussure de course futuriste sur Mars...",
    generate_btn: "Générer avec Nano Banana 2.5",
    hallucinate_btn: "Halluciner la Scène",
    write_copy_btn: "Suivant : Rédiger le texte",
    analyzing: "Analyse du produit...",
    scene_gen: "Amélioration de la scène...",
    hq_gen: "Génération en cours...",
    copy_gen: "Réflexion stratégique...",
    market_gen: "Analyse du marché (Gemini 3 Pro)...",
    copywriter_title: "Rédacteur Derja",
    market_title: "Rapport Soug",
    final_polish: "Finition",
    final_desc: "Votre publicité est prête pour Instagram.",
    custom_prompt: "Prompt Personnalisé (Optionnel)",
    detected_tags: "Tags Détectés",
    regenerate: "Régénérer",
    next_market: "Suivant : Analyse du Marché",
    avg_price: "Prix Moyen du Marché",
    ai_rec: "Recommandation IA",
    details: "Détails",
    sources: "Sources",
    go_auto_design: "Aller au Studio Auto Design",
    generated_caption: "Votre Légende Générée",
    copy_clipboard: "Copier",
    no_data: "Pas de données disponibles",
    select_caption_lang: "Langue de la Légende",
    market_subtitle: "Données du marché en temps réel & Analyse IA",
    thinking_mode: "Mode Réflexion"
  },
  ar: {
    upload_title: "ارفع صورة المنتج",
    upload_desc: "صور منتجك، وحنا نتكلفو بالباقي.",
    gen_asset: "توليد صورة احترافية",
    gen_asset_desc: "اصنع صور احترافية من الصفر باستخدام Nano Banana 2.5",
    prompt_placeholder: "حذاء رياضي مستقبلي...",
    generate_btn: "توليد بـ Nano Banana 2.5",
    hallucinate_btn: "تخيل المشهد",
    write_copy_btn: "التالي: كتابة الإعلان",
    analyzing: "تحليل المنتج...",
    scene_gen: "تحسين المشهد...",
    hq_gen: "جاري التوليد...",
    copy_gen: "تفكير في الاستراتيجية...",
    market_gen: "تحليل السوق...",
    copywriter_title: "كاتب الإعلانات (الدارجة)",
    market_title: "تقرير السوق",
    final_polish: "اللمسات الأخيرة",
    final_desc: "إعلانك واجد لإنستغرام.",
    custom_prompt: "وصف مخصص (اختياري)",
    detected_tags: "الوسوم المكتشفة",
    regenerate: "إعادة التوليد",
    next_market: "التالي: تحليل السوق",
    avg_price: "متوسط سعر السوق",
    ai_rec: "توصية الذكاء الاصطناعي",
    details: "التفاصيل",
    sources: "المصادر",
    go_auto_design: "الذهاب لتصميم الإعلان",
    generated_caption: "الإعلان المولد",
    copy_clipboard: "نسخ النص",
    no_data: "لا توجد بيانات",
    select_caption_lang: "لغة الإعلان",
    market_subtitle: "بيانات السوق الحية وتحليل الذكاء الاصطناعي",
    thinking_mode: "وضع التفكير"
  }
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [lang, setLang] = useState<Language>('en');

  // Data State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [caption, setCaption] = useState("");
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  // Input State
  const [selectedVibe, setSelectedVibe] = useState(VIBE_PRESETS[1]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [captionLang, setCaptionLang] = useState(CAPTION_LANGUAGES[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High Quality Gen State (Extra Feature)
  const [hqMode, setHqMode] = useState(false);
  const [hqAspectRatio, setHqAspectRatio] = useState<ImageAspectRatio>(ImageAspectRatio.SQUARE);

  const t = (key: keyof typeof TRANSLATIONS['en']) => TRANSLATIONS[lang][key];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      setLoadingMsg(t('analyzing'));
      try {
        const base64 = await fileToGenericBase64(e.target.files[0]);
        setOriginalImage(`data:image/jpeg;base64,${base64}`);
        
        // Immediate Analysis
        const info = await analyzeProductImage(base64);
        setProductInfo(info);
        
        setStep(AppStep.VISUAL_ENGINE);
      } catch (err) {
        alert("Error analyzing image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSceneGeneration = async () => {
    if (!originalImage) return;
    setIsLoading(true);
    setLoadingMsg(t('scene_gen'));
    
    try {
      const rawBase64 = originalImage.split(',')[1];
      const prompt = customPrompt || selectedVibe.prompt;
      
      const result = await hallucinateScene(rawBase64, prompt);
      setProcessedImage(result);
    } catch (err) {
      alert("Failed to generate scene.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHqGeneration = async () => {
    setIsLoading(true);
    setLoadingMsg(t('hq_gen'));
    try {
       const prompt = customPrompt || `${selectedVibe.prompt}. Product photography. High quality.`;
       const result = await generateHighQualityReference(prompt, hqAspectRatio);
       setProcessedImage(result);
       setProductInfo({ name: "Generated Concept", category: "Concept", tags: ["AI", "Art"] });
       setOriginalImage(result);
       setStep(AppStep.VISUAL_ENGINE);
    } catch (err) {
      alert("Failed to generate HQ image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopywriting = async () => {
    if (!productInfo) return;
    setIsLoading(true);
    setLoadingMsg(t('copy_gen'));
    
    try {
      const result = await generateDerjaCaption(productInfo, selectedVibe.label, captionLang);
      setCaption(result);
      setStep(AppStep.DERJA_COPYWRITER);
    } catch (err) {
      alert("Failed to write copy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketAnalysis = async () => {
    if (!productInfo) return;
    setIsLoading(true);
    setLoadingMsg(t('market_gen'));
    
    try {
      // Pass the APP language for the report output
      const result = await analyzeMarket(productInfo.name, lang);
      setMarketData(result);
      setStep(AppStep.SOUG_ANALYST);
    } catch (err) {
      alert("Failed to analyze market.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get price string safely
  const getSafePrice = () => {
     if (!marketData?.averagePrice) return "0000";
     
     // If it's short and likely a number/simple price
     const raw = marketData.averagePrice.trim();
     if (raw.length < 15) return raw.replace(/[^0-9]/g, '');

     // If it's a long sentence, return default so user can edit it manually
     return "0000";
  }

  return (
    <div className={`min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-emerald-500 selection:text-white ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
              Tijara-Flow
            </h1>
          </div>
          
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg overflow-hidden">
             {(['en', 'fr', 'ar'] as Language[]).map((l) => (
                <button
                   key={l}
                   onClick={() => setLang(l)}
                   className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded ${lang === l ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                   {l.toUpperCase()}
                </button>
             ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <StepIndicator currentStep={step} setStep={setStep} lang={lang} />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="relative w-16 h-16 md:w-24 md:h-24 mb-6">
              <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-lg md:text-xl font-medium text-emerald-400 animate-pulse">{loadingMsg}</p>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === AppStep.UPLOAD && (
          <div className="mt-6 md:mt-10 max-w-2xl mx-auto">
             <div className="flex bg-slate-800 p-1 rounded-lg mb-8">
                <button 
                  onClick={() => setHqMode(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${!hqMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  {t('upload_title')}
                </button>
                <button 
                  onClick={() => setHqMode(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${hqMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  {t('gen_asset')}
                </button>
             </div>

            {!hqMode ? (
              <div 
                className="border-2 border-dashed border-slate-700 bg-slate-800/50 rounded-2xl p-8 md:p-16 text-center hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-700 rounded-full mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{t('upload_title')}</h3>
                <p className="text-slate-400 text-sm md:text-base">{t('upload_desc')}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            ) : (
               <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-6">{t('gen_asset_desc')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Prompt</label>
                      <textarea 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                        placeholder={t('prompt_placeholder')}
                        rows={3}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">Aspect Ratio</label>
                        <select 
                          value={hqAspectRatio}
                          onChange={(e) => setHqAspectRatio(e.target.value as ImageAspectRatio)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          {Object.values(ImageAspectRatio).map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleHqGeneration}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                    >
                      {t('generate_btn')}
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* STEP 2: VISUAL ENGINE */}
        {step === AppStep.VISUAL_ENGINE && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                {processedImage ? (
                  <img src={processedImage} alt="Processed" className="max-w-full h-auto" />
                ) : originalImage ? (
                  <img src={originalImage} alt="Original" className="max-w-full h-auto opacity-50" />
                ) : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <IconMagic />
                  Scene Vibe
                </h3>
                
                <div className="space-y-2 mb-6">
                  {VIBE_PRESETS.map((vibe) => (
                    <button
                      key={vibe.id}
                      onClick={() => setSelectedVibe(vibe)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedVibe.id === vibe.id 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {vibe.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                   <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">{t('custom_prompt')}</label>
                   <input 
                      type="text" 
                      placeholder="e.g. On a cyberpunk street..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                   />
                </div>

                <button 
                  onClick={handleSceneGeneration}
                  className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-emerald-50 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {t('hallucinate_btn')}
                </button>
              </div>

              {processedImage && (
                <button 
                  onClick={handleCopywriting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 transition flex items-center justify-center gap-2"
                >
                  <span>{t('write_copy_btn')}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: DERJA COPYWRITER */}
        {step === AppStep.DERJA_COPYWRITER && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
               <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                 <img src={processedImage || originalImage || ""} alt="Final Visual" className="w-full h-auto" />
               </div>
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">{t('detected_tags')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {productInfo?.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md">{tag}</span>
                    ))}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <IconEdit />
                    {t('copywriter_title')}
                  </h3>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30 whitespace-nowrap">{t('thinking_mode')}</span>
                </div>
                
                <div className="mb-4">
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">{t('select_caption_lang')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {CAPTION_LANGUAGES.map((cl) => (
                      <button 
                        key={cl.id}
                        onClick={() => setCaptionLang(cl.id)}
                        className={`text-sm px-3 py-2 rounded-lg border transition-all text-left ${captionLang === cl.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {cl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea 
                  className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 text-lg leading-relaxed focus:border-emerald-500 outline-none resize-none font-medium min-h-[200px]"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  dir="auto"
                />

                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={handleCopywriting}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition"
                  >
                    {t('regenerate')}
                  </button>
                  <button 
                    onClick={handleMarketAnalysis}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg shadow-lg hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    {t('next_market')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SOUG ANALYST */}
        {step === AppStep.SOUG_ANALYST && (
          <div className="max-w-4xl mx-auto mt-10 space-y-8">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <IconAnalyze />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">{t('market_title')}</h2>
                </div>
                <p className="text-slate-400 text-sm md:ml-11">{t('market_subtitle')}</p>
              </div>

              {marketData ? (
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('avg_price')}</h4>
                        <div className="text-3xl md:text-4xl font-black text-white">{marketData.averagePrice}</div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t('ai_rec')}</h4>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 leading-relaxed text-sm">
                          {marketData.recommendation}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t('details')}</h4>
                         <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{marketData.details}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{t('sources')}</h4>
                        <ul className="space-y-2">
                          {marketData.sources.length > 0 ? marketData.sources.map((source, i) => (
                            <li key={i}>
                              <a href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition group">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:bg-blue-300"></span>
                                <span className="truncate max-w-[200px] md:max-w-[250px]">{source.title}</span>
                              </a>
                            </li>
                          )) : <li className="text-slate-500 text-xs italic">Internal Knowledge Base (No direct web links found)</li>}
                        </ul>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">{t('no_data')}</div>
              )}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => setStep(AppStep.AUTO_DESIGN)}
                className="px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition transform"
              >
                {t('go_auto_design')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AUTO DESIGN */}
        {step === AppStep.AUTO_DESIGN && processedImage && (
          <div className="mt-10 max-w-5xl mx-auto">
             <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">{t('final_polish')}</h2>
               <p className="text-slate-400">{t('final_desc')}</p>
             </div>
             
             <CanvasEditor 
                imageSrc={processedImage} 
                price={getSafePrice()} 
                onDownload={() => {}}
             />

             <div className="mt-12 bg-slate-800 p-6 rounded-xl border border-slate-700">
               <h3 className="text-lg font-bold text-white mb-4">{t('generated_caption')}</h3>
               <div className="bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-sm whitespace-pre-wrap selection:bg-emerald-500 selection:text-white text-left" dir="auto">
                 {caption}
               </div>
               <button 
                 onClick={() => navigator.clipboard.writeText(caption)}
                 className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                 {t('copy_clipboard')}
               </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
