// Per-domain link thumbnails.
// Rewrites og:image / twitter:image based on which domain was requested.
// Wrapped in try/catch so a failure here can NEVER take the site down.

const THUMBNAIL = {
  "lateblooom.com": "unlocking-the-son-web.jpg",
  "lateblo0om.com": "afromantic-antisocialite-web.jpg",
  "l8blo0om.com":   "vexxxed-web.jpg",
  "l8blo0om.org":   "center-balance-vol-2-web.jpg",
};

export default async (request, context) => {
  try {
    const host = new URL(request.url).hostname.replace(/^www\./, "");
    const img = THUMBNAIL[host];
    if (!img) return;                       // undefined = pass through untouched

    const res = await context.next();
    const type = res.headers.get("content-type") || "";
    if (!type.includes("text/html")) return res;

    const body = await res.text();
    if (!body || body.indexOf("og:image") === -1) return new Response(body, res);

    const url = `https://${host}/${img}`;
    const html = body
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${url}$2`);

    const headers = new Headers(res.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");

    return new Response(html, { status: res.status, headers });
  } catch (_) {
    return;                                 // any error = serve the site normally
  }
};

export const config = { path: "/*" };
