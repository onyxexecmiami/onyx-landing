// Serves the built site (dist/) with the same URLs GitHub Pages used:
// /faq.html stays /faq.html (Cloudflare's default would redirect it to /faq),
// / and /es/ serve index.html, /es redirects to /es/, /faq serves faq.html,
// www and plain http redirect to https://onyxexecmiami.com.

const HOST = 'onyxexecmiami.com';

// Candidate asset paths for a request path, in the order they are tried.
export function candidates(pathname) {
  if (pathname.endsWith('/')) return [pathname + 'index.html'];
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (last.includes('.')) return [pathname];
  return [pathname + '.html'];
}

// Browser cache lifetime per file type. HTML is always revalidated so edits show at once;
// /_astro/ files carry a content hash in their name, so they can be cached for a year.
export function cacheControl(pathname) {
  if (pathname.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
  if (/\.(avif|webp|jpe?g|png|svg|gif|ico|woff2?)$/i.test(pathname)) return 'public, max-age=2592000, stale-while-revalidate=86400';
  if (/\.(css|js)$/i.test(pathname)) return 'public, max-age=3600, stale-while-revalidate=86400';
  return null;
}

// Content type for files Cloudflare would otherwise serve with a generic one (the AI text files).
export function contentType(pathname) {
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') return 'text/plain; charset=utf-8';
  return null;
}

function withCache(res, pathname) {
  const value = res.ok ? cacheControl(pathname) : null;
  const type = res.ok ? contentType(pathname) : null;
  if (!value && !type) return res;
  const out = new Response(res.body, res);
  if (value) out.headers.set('Cache-Control', value);
  if (type) out.headers.set('Content-Type', type);
  return out;
}

// Missing pages under /es/ and /ru/ get the 404 page in that language.
export function notFoundPage(pathname) {
  const m = pathname.match(/^\/(es|ru)(\/|$)/);
  return m ? `/${m[1]}/404.html` : '/404.html';
}

// A directory requested without its trailing slash (/es) is redirected to /es/.
export function directoryRedirect(pathname) {
  if (pathname.endsWith('/')) return null;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return last.includes('.') ? null : pathname + '/';
}

// A person opening /sitemap.xml in a browser gets the readable page at /sitemap.html; search engines, which do not
// send Sec-Fetch-Dest: document, and ?format=xml always get the XML.
export function wantsSitemapPage(pathname, search, headers) {
  return pathname === '/sitemap.xml' && !search.includes('format=xml') && headers.get('sec-fetch-dest') === 'document';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'www.' + HOST || (url.protocol === 'http:' && url.hostname === HOST)) {
      url.protocol = 'https:';
      url.hostname = HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    if (wantsSitemapPage(url.pathname, url.search, request.headers)) {
      const page = await env.ASSETS.fetch(new URL('/sitemap.html', url));
      if (page.ok) {
        const out = new Response(request.method === 'HEAD' ? null : page.body, page);
        out.headers.set('Vary', 'Sec-Fetch-Dest');
        out.headers.set('Cache-Control', 'no-cache');
        return out;
      }
    }

    for (const path of candidates(url.pathname)) {
      const res = await env.ASSETS.fetch(new URL(path, url), request);
      if (res.status !== 404) return withCache(res, path);
    }

    const dir = directoryRedirect(url.pathname);
    if (dir) {
      const index = await env.ASSETS.fetch(new URL(dir + 'index.html', url), { method: 'HEAD' });
      if (index.ok) return Response.redirect(new URL(dir + url.search, url).toString(), 301);
    }

    const page = await env.ASSETS.fetch(new URL(notFoundPage(url.pathname), url));
    return new Response(request.method === 'HEAD' ? null : page.body, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
