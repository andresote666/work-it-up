/**
 * Exercise Image Utility
 * Uses static mapping for reliable image loading
 * Falls back to wger.de API search for unmapped exercises
 */

import { getExerciseImageByName, getExerciseImageUrl } from "./exerciseImages";

// Cache for exercise images
const imageCache = new Map<string, string>();

/**
 * Fetch image URL for an exercise
 * First checks static mapping, then tries API fallback
 */
export async function fetchExerciseGif(
    exerciseName: string,
    muscle: string // kept for API compatibility
): Promise<string | null> {
    // Check cache first
    const cacheKey = exerciseName;
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey) || null;
    }

    // Try static mapping first (by name)
    let imageUrl = getExerciseImageByName(exerciseName);

    if (imageUrl) {
        imageCache.set(cacheKey, imageUrl);
        return imageUrl;
    }

    // Try API fallback for unmapped exercises
    try {
        const searchTerm = exerciseName.toLowerCase().replace(/_/g, " ").split(" ").slice(0, 2).join(" ");

        const response = await fetch(
            `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(searchTerm)}&language=2`
        );

        if (response.ok) {
            const data = await response.json();

            if (data.suggestions && data.suggestions.length > 0) {
                // Find first result with image
                const withImage = data.suggestions.find(
                    (s: { data: { image: string | null } }) => s.data.image
                );

                if (withImage?.data.image) {
                    const foundUrl = withImage.data.image.startsWith("http")
                        ? withImage.data.image
                        : `https://wger.de${withImage.data.image}`;
                    imageCache.set(cacheKey, foundUrl);
                    return foundUrl;
                }
            }
        }
    } catch (error) {
        console.warn("API fallback failed:", error);
    }

    return null;
}

/**
 * Fetch image URL by exercise ID (direct lookup)
 */
export function fetchExerciseGifById(exerciseId: string): string | null {
    // Check cache first
    if (imageCache.has(exerciseId)) {
        return imageCache.get(exerciseId) || null;
    }

    // Check static mapping
    const imageUrl = getExerciseImageUrl(exerciseId);

    if (imageUrl) {
        imageCache.set(exerciseId, imageUrl);
        return imageUrl;
    }

    return null;
}

/**
 * Batch fetch image URLs for multiple exercises
 */
export async function fetchExerciseGifs(
    exercises: Array<{ id: string; name: string; muscle: string }>
): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const ex of exercises) {
        // Try by ID first (faster, no API call)
        let imageUrl = fetchExerciseGifById(ex.id);

        // Fallback to name-based lookup
        if (!imageUrl) {
            imageUrl = await fetchExerciseGif(ex.name, ex.muscle);
        }

        if (imageUrl) {
            results.set(ex.id, imageUrl);
        }
    }

    return results;
}

/**
 * Get a cached image URL (sync)
 */
export function getCachedGif(exerciseName: string, muscle: string): string | null {
    return imageCache.get(exerciseName) || null;
}
