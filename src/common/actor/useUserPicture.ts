import { useApi } from "@/common/api/useApi";

const FAILURE_RETRY_MS = 5 * 60 * 1000;
const MAX_CACHE_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 250;

interface CacheEntry {
    picture?: string,
    url: Promise<string | null>,
    size: number,
    refs: number,
}

const cache = new Map<number, CacheEntry>();
let total_size = 0;

function isNoPicture(picture?: string | null): picture is null {
    return picture === null || !!picture?.endsWith('picture.png');
}

function matches(entry: CacheEntry, picture?: string) {
    return picture === undefined || entry.picture === undefined || entry.picture === picture;
}

function revoke(url: Promise<string | null>) {
    url.then((u) => u && URL.revokeObjectURL(u));
}

function removeEntry(user_id: number, entry: CacheEntry) {
    revoke(entry.url);
    total_size -= entry.size;
    cache.delete(user_id);
}

function evict() {
    for (const [user_id, entry] of cache) {
        if (total_size <= MAX_CACHE_BYTES) {
            return;
        }
        if (entry.refs === 0 && entry.size > 0) {
            removeEntry(user_id, entry);
        }
    }
}

async function shrink(blob: Blob): Promise<Blob> {
    try {
        const bitmap = await createImageBitmap(blob);
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        // Browsers without WebP encoding support (Safari) fall back to PNG
        const converted = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
        return converted.size < blob.size ? converted : blob;
    } catch {
        return blob;
    }
}

/**
 * Get an object URL for the user's picture. Each call must be paired with {@link releaseUserPicture} once the
 * picture is no longer displayed so that it can be evicted from the cache.
 */
export function getUserPicture(user_id: number, picture?: string | null): Promise<string | null> {
    if (isNoPicture(picture)) {
        return Promise.resolve(null);
    }
    const cached = cache.get(user_id);
    if (cached) {
        if (matches(cached, picture)) {
            cached.picture ??= picture;
            cached.refs++;
            cache.delete(user_id);
            cache.set(user_id, cached);
            return cached.url;
        }
        removeEntry(user_id, cached);
    }

    const entry: CacheEntry = { picture, url: Promise.resolve(null), size: 0, refs: 1 };
    entry.url = useApi().doApiRequest(`/Administration/User/${user_id}/Picture?thumbnail=1`, {
        method: 'GET',
        responseType: 'blob',
    }).then(async (response) => {
        const blob = await shrink(response.data);
        if (cache.get(user_id) === entry) {
            entry.size = blob.size;
            total_size += blob.size;
            evict();
        }
        return URL.createObjectURL(blob);
    }, () => {
        setTimeout(() => {
            if (cache.get(user_id) === entry) {
                cache.delete(user_id);
            }
        }, FAILURE_RETRY_MS);
        return null;
    });
    cache.set(user_id, entry);
    return entry.url;
}

export function releaseUserPicture(user_id: number, picture?: string | null) {
    const entry = cache.get(user_id);
    if (entry && !isNoPicture(picture) && matches(entry, picture) && entry.refs > 0) {
        entry.refs--;
        if (entry.refs === 0) {
            evict();
        }
    }
}

export function clearUserPictureCache() {
    cache.forEach((entry) => revoke(entry.url));
    cache.clear();
    total_size = 0;
}
