import { useTranslation } from 'react-i18next';

/**
 * Enhanced translation hook with intelligent fallbacks
 * Handles missing translations gracefully by falling back to English
 */
export function useSmartTranslation() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  /**
   * Smart translation function with multiple fallback strategies
   * @param key - Translation key (e.g., 'blog.title')
   * @param options - Translation options (interpolation, fallback text, etc.)
   * @returns Translated text with intelligent fallbacks
   */
  const st = (key: string, options?: {
    defaultValue?: string;
    fallbackToKey?: boolean;
    interpolation?: Record<string, any>;
  }) => {
    const { defaultValue, fallbackToKey = true, interpolation } = options || {};

    try {
      // Try to get translation in current language
      let result = t(key, interpolation);
      
      // If result is the same as key, translation is missing
      if (result === key || result === '') {
        // Try English fallback if not already English
        if (currentLanguage !== 'en') {
          const englishResult = t(key, { lng: 'en', ...interpolation });
          if (englishResult !== key && englishResult !== '') {
            return englishResult;
          }
        }
        
        // Use provided default value
        if (defaultValue) {
          return defaultValue;
        }
        
        // As last resort, return formatted key if fallbackToKey is true
        if (fallbackToKey) {
          // Convert key like 'blog.title' to 'Blog Title'
          const lastPart = key.split('.').pop() || key;
          return lastPart
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
        }
        
        return key;
      }
      
      return result;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return defaultValue || (fallbackToKey ? key : '');
    }
  };

  /**
   * Check if a translation exists
   * @param key - Translation key to check
   * @returns boolean indicating if translation exists
   */
  const exists = (key: string): boolean => {
    try {
      const result = t(key);
      return result !== key && result !== '';
    } catch {
      return false;
    }
  };

  /**
   * Get current language with fallback
   * @returns Current language code (always returns valid language)
   */
  const getCurrentLanguage = (): string => {
    return ['en', 'es', 'fr', 'de'].includes(currentLanguage) ? currentLanguage : 'en';
  };

  /**
   * Smart translation for dynamic content with object fallback
   * Useful for API responses that might not have all translations
   * @param obj - Object with potential translations
   * @param key - Key to look for in object
   * @param fallback - Fallback value
   * @returns Best available translation
   */
  const translateDynamic = (obj: any, key: string, fallback?: string): string => {
    if (!obj) return fallback || '';
    
    const currentLang = getCurrentLanguage();
    
    // Try current language first
    if (obj[key] && typeof obj[key] === 'string') {
      return obj[key];
    }
    
    // Try English fallback
    if (currentLang !== 'en' && obj[key + '_en']) {
      return obj[key + '_en'];
    }
    
    // Try without language suffix
    if (obj[key.replace(/_(en|es|fr|de)$/, '')]) {
      return obj[key.replace(/_(en|es|fr|de)$/, '')];
    }
    
    return fallback || key;
  };

  return {
    t: st,
    exists,
    getCurrentLanguage,
    translateDynamic,
    originalT: t,
    i18n,
    language: getCurrentLanguage()
  };
}