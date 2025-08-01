import { queryClient } from './queryClient';

// Enhanced cache invalidation for both standard and language-aware queries
export const refreshRouteData = () => {
  console.log('🔄 Starting comprehensive cache invalidation...');
  
  // Invalidate standard route queries (used by routes admin page)
  queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
  console.log('✅ Invalidated standard /api/routes cache');
  
  // Invalidate all language variants of route data (used by translated components)
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.invalidateQueries({ queryKey: ['/api/routes', lang] });
    console.log(`✅ Invalidated /api/routes cache for language: ${lang}`);
  });
  
  // Invalidate any route-related queries with complex patterns or filters
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey;
      if (!Array.isArray(queryKey)) return false;
      
      // Check for any route-related cache keys
      const isRouteRelated = queryKey.some(key => 
        typeof key === 'string' && 
        (key.includes('/api/routes') || key.includes('routes'))
      );
      
      if (isRouteRelated) {
        console.log(`✅ Invalidated complex route query: ${JSON.stringify(queryKey)}`);
        return true;
      }
      
      return false;
    }
  });
  
  // Clear cities cache as well (they contain route information)
  queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.invalidateQueries({ queryKey: ['/api/cities', lang] });
  });
  
  // Force immediate refetch for critical queries
  queryClient.refetchQueries({ queryKey: ['/api/routes'] });
  ['en', 'es', 'fr', 'de'].forEach(lang => {
    queryClient.refetchQueries({ queryKey: ['/api/routes', lang] });
  });
  
  console.log('🎉 Route data cache cleared for all patterns and immediate refetch triggered');
};

// Clear all cached data
export const clearAllCache = () => {
  queryClient.clear();
  console.log('All cache cleared');
};