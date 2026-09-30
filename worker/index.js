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

// A directory requested without its trailing slash (/es) is redirected to /es/.
export function directoryRedirect(pathname) {
  if (pathname.endsWith('/')) return null;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return last.includes('.') ? null : pathname + '/';
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

    for (const path of candidates(url.pathname)) {
      const res = await env.ASSETS.fetch(new URL(path, url), request);
      if (res.status !== 404) return res;
    }

    const dir = directoryRedirect(url.pathname);
    if (dir) {
      const index = await env.ASSETS.fetch(new URL(dir + 'index.html', url), { method: 'HEAD' });
      if (index.ok) return Response.redirect(new URL(dir + url.search, url).toString(), 301);
    }

    const page = await env.ASSETS.fetch(new URL('/404.html', url));
    return new Response(request.method === 'HEAD' ? null : page.body, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
