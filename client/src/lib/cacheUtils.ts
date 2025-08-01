import { queryClient } from './queryClient';

// Enhanced cache invalidation for both standard and language-aware queries
export const refreshRouteData = () => {
  // Invalidate standard route queries (used by routes admin page)
  queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
  
  // Invalidate all language variants of route data (used by translated components)
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
  
  // Clear cities cache as well (standard and language variants)
  queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.invalidateQueries({ queryKey: ['/api/cities', lang] });
  });
  
  console.log('Route data cache cleared for all query patterns and refresh triggered');
};

// Clear all cached data
export const clearAllCache = () => {
  queryClient.clear();
  console.log('All cache cleared');
};