'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { type Language, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/lib/i18n';

const LANGUAGES: Language[] = ['en', 'pt', 'es', 'zh', 'fr'];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 flex-shrink-0" />
        <span className="flex items-center gap-1.5">
          <span>{LANGUAGE_FLAGS[language]}</span>
          <span>{LANGUAGE_NAMES[language]}</span>
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors text-left ${
                lang === language
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_NAMES[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
