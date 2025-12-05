import React from 'react';
import { AppStep, Language } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  lang: Language;
}

const getLabels = (lang: Language) => {
  const labels = {
    en: ['Upload', 'Visual Engine', 'Copywriter', 'Soug Analyst', 'Auto Design'],
    fr: ['Télécharger', 'Moteur Visuel', 'Rédacteur', 'Analyste Soug', 'Auto Design'],
    ar: ['رفع الصورة', 'المحرك المرئي', 'كاتب الإعلانات', 'تحليل السوق', 'التصميم الآلي']
  };
  return labels[lang] || labels.en;
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, setStep, lang }) => {
  const labels = getLabels(lang);
  const steps = labels.map((label, index) => ({ id: index, label }));

  return (
    <div className="w-full py-4 md:py-8">
      {/* Scroll container for mobile, centered flex for desktop */}
      <div className="overflow-x-auto scrollbar-hide px-2">
        <div className="flex justify-between items-start relative z-10 min-w-[320px] md:min-w-full pb-2">
          {/* Progress Line Background */}
          <div className="absolute top-3 md:top-5 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
          
          {/* Active Progress Line */}
          <div className="absolute top-3 md:top-5 left-0 w-full h-1 -z-10 rounded-full overflow-hidden">
             <div 
              className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${lang === 'ar' ? 'origin-right' : 'origin-left'}`}
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center justify-start flex-1 cursor-pointer min-w-[60px]" 
                onClick={() => isCompleted ? setStep(step.id) : null}
              >
                <div 
                  className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm transition-all duration-300 border-2 z-20 bg-slate-900
                    ${isActive ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' : 
                      isCompleted ? 'bg-slate-700 border-emerald-500 text-emerald-500' : 'bg-slate-800 border-slate-600 text-slate-500'}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-3 h-3 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={`mt-2 text-[9px] md:text-xs font-bold uppercase tracking-wider text-center px-1 transition-colors duration-300
                    ${isActive ? 'text-emerald-400' : isCompleted ? 'text-emerald-600/70' : 'text-slate-600'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
