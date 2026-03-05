/**
 * Centralized utility for image fallback URLs and handling.
 */

export const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&h=400&fit=crop&q=80';

export const CATEGORY_FALLBACKS: { [key: string]: string } = {
    'Children': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop&q=80',
    'Old Age': 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=600&h=400&fit=crop&q=80',
    'Disabled': 'https://images.unsplash.com/photo-1533038590840-27931885f6bd?w=600&h=400&fit=crop&q=80',
    'Food': 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=600&h=400&fit=crop&q=80',
    'Needs': 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=600&h=400&fit=crop&q=80',
    'Education': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop&q=80',
    'Health': 'https://images.unsplash.com/photo-1505751172107-c73d72970ad1?w=600&h=400&fit=crop&q=80'
};

/**
 * Returns a fallback image URL based on the provided category.
 * @param category The category string to match for a specific fallback image.
 * @returns A fallback Unsplash image URL.
 */
export function getImageFallback(category: string = ''): string {
    const matchedKey = Object.keys(CATEGORY_FALLBACKS).find(key =>
        category.toLowerCase().includes(key.toLowerCase())
    );

    return matchedKey ? CATEGORY_FALLBACKS[matchedKey] : DEFAULT_FALLBACK;
}

/**
 * Standard onImageError handler for template (error) events.
 * @param event The ErrorEvent from the img tag.
 * @param category Optional category for more relevant fallback.
 */
export function handleImageError(event: any, category: string = ''): void {
    const fallback = getImageFallback(category);

    if (event.target && event.target.src !== fallback) {
        event.target.src = fallback;
        event.target.style.objectFit = 'cover';
    }
}
