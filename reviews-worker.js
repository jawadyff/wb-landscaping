// Cloudflare Worker — fetches Google reviews from SerpAPI, caches in KV for 2 weeks
// KV namespace: REVIEWS_KV
// Deploy: wrangler deploy reviews-worker.js --name wb-reviews-worker

const SERP_API_KEY = '6c8ca21b70fcb7784038ebf324a51043431a2bcba737bc70d75805c812a9b59e';
const PLACE_ID = '0x6de0a5e983a1253f:0x13a6319ca674c9fc';
const CACHE_TTL = 60 * 60 * 24 * 14; // 2 weeks in seconds

export default {
  async fetch(request, env) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    // Check KV cache first
    const cached = await env.REVIEWS_KV.get('reviews');
    if (cached) {
      return new Response(cached, { headers });
    }

    // Fetch fresh from SerpAPI
    const url = `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${PLACE_ID}&sort_by=newestFirst&api_key=${SERP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    const reviews = (data.reviews || []).map(r => ({
      name: r.user?.name || 'Anonymous',
      rating: r.rating,
      text: r.snippet || '',
      date: r.date || '',
      avatar: r.user?.thumbnail || '',
    }));

    const payload = JSON.stringify({ reviews, rating: data.place_info?.rating, total: data.place_info?.reviews });

    // Cache for 2 weeks
    await env.REVIEWS_KV.put('reviews', payload, { expirationTtl: CACHE_TTL });

    return new Response(payload, { headers });
  }
};
