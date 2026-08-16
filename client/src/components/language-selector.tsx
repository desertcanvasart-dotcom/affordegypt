import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Globe } from 'lucide-react';
import { setLanguage } from '@/i18n';
import { SLUG_MAPPINGS } from '@shared/public-routes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Endonyms: each language is listed in itself, so a French speaker looking for
// their language finds "Français" rather than whatever the current locale calls
// it. Translating these would defeat the purpose of the switcher. i18n-exempt
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },   // i18n-exempt
  { code: 'es', name: 'Español', flag: '🇪🇸' },   // i18n-exempt
  { code: 'fr', name: 'Français', flag: '🇫🇷' },  // i18n-exempt
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },   // i18n-exempt
];

type Lang = keyof typeof SLUG_MAPPINGS;

/**
 * The same page's path in another language.
 *
 * Public pages are served under translated slugs — /destinations, /reiseziele,
 * /destinos, /destinations-fr and so on, all registered by
 * createMultilingualRoute. Switching language used to change only the i18next
 * state, leaving you on the previous language's URL: pick German on
 * /destinations and you stayed on /destinations, which is both the wrong
 * canonical and the reason it looked like nothing had happened.
 *
 * Returns null when the current path is not a translated public page (the
 * planner, admin, booking flows), so those stay put.
 */
function translatePath(pathname: string, target: Lang): string | null {
  const [, first, ...rest] = pathname.split('/');
  if (!first) return null;

  // Find the canonical English slug this path segment corresponds to, in any
  // language — the visitor could be switching from any locale to any other.
  let canonical: string | null = null;
  for (const mapping of Object.values(SLUG_MAPPINGS)) {
    for (const [en, translated] of Object.entries(mapping)) {
      if (translated === first) { canonical = en; break; }
    }
    if (canonical) break;
  }
  if (!canonical) return null;

  const next = (SLUG_MAPPINGS[target] as Record<string, string>)[canonical];
  if (!next || next === first) return null;
  return '/' + [next, ...rest].join('/');
}

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const handleLanguageChange = (languageCode: string) => {
    // Switches i18next, persists the choice, and syncs <html lang>. This is the
    // only place a language preference is recorded — see client/src/i18n/index.ts.
    setLanguage(languageCode);

    // Then move to that language's URL for this page, if one exists.
    const next = translatePath(location, languageCode as Lang);
    if (next) setLocation(next);

    // Clear all cached queries to force refetch with new language
    queryClient.invalidateQueries();
    
    // Force refetch of all translated queries
    setTimeout(() => {
      queryClient.refetchQueries();
    }, 100);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      {/* The visible trigger is a flag emoji, which gives screen readers an
          accessible name like "flag: Germany". aria-label supplies the real one. */}
      <SelectTrigger
        aria-label={`Language: ${currentLanguage.name}`}
        className="w-auto min-h-11 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium" aria-hidden="true">{currentLanguage.flag}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}