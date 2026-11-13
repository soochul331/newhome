// Decap CMS GitHub 로그인 중계 2단계 (2026-11-14 시제품)
// GET /api/callback?code=…&state=… → 토큰을 받아 관리자 창(opener)에 Decap 규약대로 넘긴다.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = (request.headers.get('cookie') || '').match(/(?:^|;\s*)decap_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return page(origin, 'error', { message: '로그인 확인값이 맞지 않습니다. 관리자 화면에서 다시 로그인해 주세요.' });
  }

  let token;
  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'user-agent': 'churchailab-decap-oauth' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const out = await res.json();
    token = out.access_token;
    if (!token) throw new Error(out.error_description || out.error || 'no token');
  } catch (err) {
    console.error('토큰 교환 실패', err);
    return page(origin, 'error', { message: 'GitHub 로그인에 실패했습니다.' });
  }

  // 허용한 GitHub 계정만 통과시킨다(설정한 경우).
  const allowed = (env.ALLOWED_GITHUB_USERS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length) {
    const me = await fetch('https://api.github.com/user', {
      headers: { authorization: `Bearer ${token}`, 'user-agent': 'churchailab-decap-oauth', accept: 'application/vnd.github+json' },
    }).then(r => r.json()).catch(() => ({}));
    if (!allowed.includes(String(me.login || '').toLowerCase())) {
      return page(origin, 'error', { message: '이 GitHub 계정은 관리자 권한이 없습니다.' });
    }
  }

  return page(origin, 'success', { token, provider: 'github' });
}

function page(origin, status, content) {
  // </script> 끼어듦을 막기 위해 < 를 이스케이프한다.
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, '\\u003c');
  const allowedOrigin = JSON.stringify(origin);
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>로그인 중</title></head><body><p>로그인 처리 중입니다. 이 창은 곧 닫힙니다.</p><script>
(function () {
  var msg = ${message};
  var allowed = ${allowedOrigin};
  if (!window.opener) { document.body.textContent = '관리자 창을 찾지 못했습니다. 관리자 화면에서 다시 로그인해 주세요.'; return; }
  window.addEventListener('message', function (e) {
    if (e.origin !== allowed) return;
    window.opener.postMessage(msg, allowed);
    setTimeout(function () { window.close(); }, 300);
  }, { once: true });
  window.opener.postMessage('authorizing:github', allowed);
})();
</script></body></html>`;
  return new Response(html, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}
