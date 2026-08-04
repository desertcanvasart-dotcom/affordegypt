import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Globe } from 'lucide-react';
import { setLanguage } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const handleLanguageChange = (languageCode: string) => {
    // Switches i18next, persists the choice, and syncs <html lang>. This is the
    // only place a language preference is recorded — see client/src/i18n/index.ts.
    setLanguage(languageCode);

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