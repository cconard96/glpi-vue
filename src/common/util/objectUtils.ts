export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const merged = { ...target, ...source };
    for (const key in target) {
        if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key]) && source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            merged[key] = deepMerge(target[key], source[key]);
        }
    }
    return merged;
}