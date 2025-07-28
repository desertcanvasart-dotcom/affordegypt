import { queryClient } from './queryClient';

// Enhanced cache invalidation for language-aware queries
export const refreshRouteData = () => {
  // Invalidate all language variants of route data
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.invalidateQueries({ queryKey: ['/api/routes', lang] });
  });
  
  // Also invalidate any route-related queries with complex patterns
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && 
             (queryKey[0] === '/api/routes' || 
              queryKey.some(key => typeof key === 'string' && key.includes('/api/routes')));
    }
  });
  
  // Clear any related city data that might be cached with language
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.invalidateQueries({ queryKey: ['/api/cities', lang] });
  });
  
  console.log('Route data cache cleared for all languages and refresh triggered');
};

// Clear all cached data
export const clearAllCache = () => {
  queryClient.clear();
  console.log('All cache cleared');
};