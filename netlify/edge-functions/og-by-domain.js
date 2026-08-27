// Per-domain link thumbnails.
// Same site, different preview image depending on which URL was shared.
// Change a filename below and redeploy — that's the whole edit.

const THUMBNAIL = {
  "lateblooom.com": "unlocking-the-son-web.jpg",
  "lateblo0om.com": "afromantic-antisocialite-web.jpg",
  "l8blo0om.com":   "vexxxed-web.jpg",
};

export default async (request, context) => {
  const res = await context.next();
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;

  const host = new URL(request.url).hostname.replace(/^www\./, "");
  const img = THUMBNAIL[host];
  if (!img) return res;

  const url = `https://${host}/${img}`;
  let html = await res.text();
  html = html
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${url}$2`);

  return new Response(html, {
    status: res.status,
    headers: res.headers,
  });
};

export const config = { path: "/*" };
