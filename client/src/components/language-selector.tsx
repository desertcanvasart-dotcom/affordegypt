import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Globe } from 'lucide-react';
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
    // Change language
    i18n.changeLanguage(languageCode);
    
    // Store the language preference
    localStorage.setItem('language', languageCode);
    
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
      <SelectTrigger className="w-auto border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLanguage.flag}</span>
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