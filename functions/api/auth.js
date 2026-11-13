// Decap CMS GitHub 로그인 중계 1단계 (Netlify 인증 대행 대체 시제품, 2026-11-14)
// GET /api/auth → GitHub 승인 화면으로 보낸다.
// 필요한 비밀값(Pages 설정 → 환경 변수, 암호화): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// 선택: ALLOWED_GITHUB_USERS="soochul331" (쉼표로 여러 명)

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) return new Response('GITHUB_CLIENT_ID가 설정되지 않았습니다.', { status: 500 });
  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${origin}/api/callback`);
  // newhome 저장소는 공개 저장소라 public_repo 권한이면 충분하다(비공개로 바꾸면 repo).
  authorize.searchParams.set('scope', env.GITHUB_SCOPE || 'public_repo');
  authorize.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      'set-cookie': `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'cache-control': 'no-store',
    },
  });
}
