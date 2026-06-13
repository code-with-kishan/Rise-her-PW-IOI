import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function resolveModelUrl(modelUrl: string): string {
  if (!modelUrl) {
    return modelUrl;
  }

  if (/^https?:\/\//i.test(modelUrl)) {
    return modelUrl;
  }

  // Uploaded models live on backend storage; resolve them to backend origin in production.
  if (modelUrl.startsWith('/models/uploads/')) {
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
    if (/^https?:\/\//i.test(apiBase)) {
      const backendOrigin = apiBase.replace(/\/api\/?$/, '');
      return `${backendOrigin}${modelUrl}`;
    }
  }

  return modelUrl;
}
 
