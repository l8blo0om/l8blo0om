// Per-domain link thumbnails.
// Same site, different social preview image depending on which URL was shared.
// Edit a filename below and redeploy — that's the whole change.

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
  const html = (await res.text())
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${url}$2`);

  // fresh headers — reusing the originals keeps a stale content-encoding/length
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(html, { status: res.status, headers });
};

export const config = { path: "/*" };
