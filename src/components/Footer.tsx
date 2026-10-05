import React from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../types';
import { MapPin, Phone, Mail, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onOpenModal: (modal: 'about' | 'services' | 'notices' | 'downloads' | 'contact' | 'accessibility' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenModal }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="w-full bg-[#0F1E36] text-slate-300 border-t-4 border-[#FF9933] mt-16 text-xs" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: MoES NCPOR Details */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                {t.department}
              </h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              {t.ministry} ({lang === 'hi' ? t.gov_india : t.gov_india_hi})
              <br />
              An autonomous research and development institution responsible for coordinating India's Antarctic, Arctic, Southern Ocean, and Himalayan geoscientific expeditions.
            </p>
            <div className="pt-2 flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
              <span>{t.footer_address}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>polar-energy@ncpor.res.in</span>
              </span>
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onOpenModal('about')} className="hover:text-white transition-colors">
                  {t.nav_about}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('services')} className="hover:text-white transition-colors">
                  {t.nav_services}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('notices')} className="hover:text-white transition-colors">
                  {t.nav_notices}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('downloads')} className="hover:text-white transition-colors">
                  {t.nav_downloads}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenModal('contact')} className="hover:text-white transition-colors">
                  {t.nav_contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research Polar Stations */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Polar Research Stations
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Bharati Station (assumed example)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Maitri Station (reference)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Himadri Base (reference)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Persistent Prototype Banner in Footer */}
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center font-medium">
          Prototype - simulated data - not an official Government of India website
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>{t.footer_copyright}</p>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onOpenModal('accessibility')} className="hover:text-white transition-colors">
              {t.footer_accessibility}
            </button>
            <span>•</span>
            <button onClick={() => onOpenModal('privacy')} className="hover:text-white transition-colors">
              {t.footer_privacy}
            </button>
            <span>•</span>
            <button onClick={() => onOpenModal('terms')} className="hover:text-white transition-colors">
              {t.footer_terms}
            </button>
            <span>•</span>
            <button onClick={() => onOpenModal('accessibility')} className="hover:text-white transition-colors">
              {t.footer_sitemap}
            </button>
          </div>

          <div className="font-mono text-slate-500">
            {t.last_updated}
          </div>
        </div>
      </div>
    </footer>
  );
};
