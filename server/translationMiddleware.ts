import { Request, Response, NextFunction } from "express";
import { detectLanguageFromHeader, applyTranslationsToResponse } from "./translationUtils";

// Extend Request type to include language property
declare global {
  namespace Express {
    interface Request {
      language?: string;
    }
  }
}

// Middleware to detect language from request headers
export function detectLanguage(req: Request, res: Response, next: NextFunction) {
  const acceptLanguage = req.headers['accept-language'] || "";
  const queryLanguage = req.query.lang as string;
  
  // Priority: query parameter > Accept-Language header > default to English
  req.language = queryLanguage || detectLanguageFromHeader(acceptLanguage);
  
  next();
}

// Middleware to apply translations to API responses
export function applyTranslations(tableType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to apply translations
    res.json = function(data: any) {
      if (req.language && req.language !== "en") {
        const translatedData = applyTranslationsToResponse(data, req.language, tableType);
        return originalJson.call(this, translatedData);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Helper function to create translation-aware routes
export function createTranslatedRoute(
  routeHandler: (req: Request, res: Response, next: NextFunction) => void,
  tableType: string
) {
  return [
    detectLanguage,
    applyTranslations(tableType),
    routeHandler
  ];
}