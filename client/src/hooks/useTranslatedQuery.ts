import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Helper function to append language parameter to URLs
function appendLanguageParam(url: string, language: string): string {
  if (language === 'en') return url; // Don't add param for English
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lang=${language}`;
}

// Custom hook that includes language parameter in queries
export function useTranslatedQuery<TQueryFnData = unknown, TError = Error>(
  queryKey: string,
  options?: Omit<UseQueryOptions<TQueryFnData, TError>, 'queryKey' | 'queryFn'>
) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  return useQuery({
    queryKey: [queryKey, currentLanguage], // Include language in query key for proper caching
    queryFn: async () => {
      const urlWithLang = appendLanguageParam(queryKey, currentLanguage);
      const response = await fetch(urlWithLang, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    ...options,
  });
}