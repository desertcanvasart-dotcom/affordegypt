import { queryClient } from './queryClient';

// Force refresh of route data and clear cache
export const refreshRouteData = () => {
  // Invalidate all route-related queries
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && 
             (queryKey[0] === '/api/routes' || 
              queryKey.some(key => typeof key === 'string' && key.includes('/api/routes')));
    }
  });
  
  // Also clear any related city data
  queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
  
  console.log('Route data cache cleared and refresh triggered');
};

// Clear all cached data
export const clearAllCache = () => {
  queryClient.clear();
  console.log('All cache cleared');
};