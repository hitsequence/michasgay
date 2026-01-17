const USER_ID = process.env.LANYARD_USER_ID || '1122202569519923361';
const LANYARD_URL = `https://api.lanyard.rest/v1/users/${USER_ID}`;
const CACHE_TTL_MS = Number(process.env.LANYARD_CACHE_MS || 5 * 60 * 1000);

let cachedResponse = null;
let cachedAt = 0;

async function fetchFromLanyard() {
    const response = await fetch(LANYARD_URL);
    if (!response.ok) {
        throw new Error(`lanyard_${response.status}`);
    }
    return response.json();
}

module.exports = async function handler(req, res) {
    const now = Date.now();
    const forceRefresh = req?.query?.force === '1';
    const cacheIsFresh = cachedResponse && (now - cachedAt) < CACHE_TTL_MS;

    res.setHeader('Cache-Control', `s-maxage=${Math.floor(CACHE_TTL_MS / 1000)}, stale-while-revalidate`);

    if (!forceRefresh && cacheIsFresh) {
        return res.status(200).json(cachedResponse);
    }

    try {
        const json = await fetchFromLanyard();
        cachedResponse = json;
        cachedAt = now;
        return res.status(200).json(json);
    } catch (error) {
        if (cachedResponse) {
            return res.status(200).json(cachedResponse);
        }
        return res.status(502).json({ success: false, error: 'upstream_unavailable' });
    }
};
