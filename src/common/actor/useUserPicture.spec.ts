import { afterEach, expect, test, vi } from 'vitest';

const doApiRequest = vi.fn();
vi.mock('@/common/api/useApi', () => ({
    useApi: () => ({ doApiRequest }),
}));

const { getUserPicture, releaseUserPicture, clearUserPictureCache } = await import('./useUserPicture');

afterEach(() => {
    clearUserPictureCache();
    doApiRequest.mockReset();
});

async function makeImage(width: number, height: number): Promise<Blob> {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    for (let x = 0; x < width; x += 10) {
        ctx.fillStyle = `hsl(${x % 360} 80% 50%)`;
        ctx.fillRect(x, 0, 10, height);
    }
    return canvas.convertToBlob({ type: 'image/png' });
}

test('skips request for missing or default picture', async () => {
    expect(await getUserPicture(1, null)).toBeNull();
    expect(await getUserPicture(1, '/pics/picture.png')).toBeNull();
    expect(doApiRequest).not.toHaveBeenCalled();
});

test('fetches when picture is unknown and reuses it once known', async () => {
    doApiRequest.mockResolvedValue({ data: new Blob(['a']) });
    const a = await getUserPicture(6, undefined);
    const b = await getUserPicture(6, 'x.jpg');
    const c = await getUserPicture(6, undefined);
    expect(a).toMatch(/^blob:/);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(doApiRequest).toHaveBeenCalledTimes(1);

    await getUserPicture(6, 'y.jpg');
    expect(doApiRequest).toHaveBeenCalledTimes(2);
});

test('releases pictures acquired while unknown', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    doApiRequest.mockImplementation(() => Promise.resolve({ data: new Blob([new Uint8Array(1100 * 1024)]) }));
    const a = await getUserPicture(7, undefined);
    await getUserPicture(7, 'x.jpg');
    releaseUserPicture(7, undefined);
    releaseUserPicture(7, 'x.jpg');
    await getUserPicture(8, 'y.jpg');
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledWith(a);
    revoke.mockRestore();
});

test('fetches each picture once', async () => {
    doApiRequest.mockResolvedValue({ data: new Blob(['a']) });
    const [a, b] = await Promise.all([getUserPicture(2, 'x.jpg'), getUserPicture(2, 'x.jpg')]);
    const c = await getUserPicture(2, 'x.jpg');
    expect(a).toMatch(/^blob:/);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(doApiRequest).toHaveBeenCalledTimes(1);
    expect(doApiRequest).toHaveBeenCalledWith('/Administration/User/2/Picture?thumbnail=1', { method: 'GET', responseType: 'blob' });
});

test('refetches and revokes when picture changes', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    doApiRequest.mockResolvedValue({ data: new Blob(['a']) });
    const first = await getUserPicture(3, 'x.jpg');
    const second = await getUserPicture(3, 'y.jpg');
    await Promise.resolve();
    expect(second).not.toBe(first);
    expect(revoke).toHaveBeenCalledWith(first);
    expect(doApiRequest).toHaveBeenCalledTimes(2);
    revoke.mockRestore();
});

test('caches failures', async () => {
    doApiRequest.mockRejectedValue(new Error('403'));
    expect(await getUserPicture(4, 'x.jpg')).toBeNull();
    expect(await getUserPicture(4, 'x.jpg')).toBeNull();
    expect(doApiRequest).toHaveBeenCalledTimes(1);
});

test('converts to webp limited to 250px', async () => {
    doApiRequest.mockResolvedValue({ data: await makeImage(1000, 500) });
    const url = (await getUserPicture(5, 'x.jpg'))!;
    const blob = await (await fetch(url)).blob();
    const bitmap = await createImageBitmap(blob);
    expect(blob.type).toBe('image/webp');
    expect([bitmap.width, bitmap.height]).toEqual([250, 125]);
});

test('evicts least recently used unreferenced pictures over budget', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    doApiRequest.mockImplementation(() => Promise.resolve({ data: new Blob([new Uint8Array(800 * 1024)]) }));

    const a = await getUserPicture(10, 'a.jpg');
    const b = await getUserPicture(11, 'b.jpg');
    releaseUserPicture(10, 'a.jpg');
    releaseUserPicture(11, 'b.jpg');
    // touch 10 so 11 becomes least recently used
    await getUserPicture(10, 'a.jpg');
    releaseUserPicture(10, 'a.jpg');

    await getUserPicture(12, 'c.jpg');
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledWith(b);
    expect(revoke).not.toHaveBeenCalledWith(a);

    await getUserPicture(10, 'a.jpg');
    await getUserPicture(11, 'b.jpg');
    expect(doApiRequest).toHaveBeenCalledTimes(4);
    revoke.mockRestore();
});

test('does not evict pictures in use', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    doApiRequest.mockImplementation(() => Promise.resolve({ data: new Blob([new Uint8Array(800 * 1024)]) }));

    await getUserPicture(20, 'a.jpg');
    await getUserPicture(21, 'b.jpg');
    await getUserPicture(22, 'c.jpg');
    await Promise.resolve();
    expect(revoke).not.toHaveBeenCalled();

    releaseUserPicture(20, 'a.jpg');
    await Promise.resolve();
    expect(revoke).toHaveBeenCalledTimes(1);
    revoke.mockRestore();
});
