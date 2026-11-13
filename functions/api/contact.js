// 홈페이지 문의 양식 접수 (Netlify Forms 대체 시제품, 2026-11-14)
// Cloudflare Pages Functions: POST /api/contact
// - 양식 2개(contact, tool-proposal)를 form-name으로 구분한다.
// - D1 표(submissions)에 저장하고, 메일 알림 Worker(MAILER 서비스 연결)가 있으면 알림을 보낸다.
// - 자바스크립트 없이도 동작하도록 303으로 감사 페이지에 보낸다.
// 비용: Pages Functions 무료 하루 10만 요청, D1 무료 5GB, Email Routing 무료.

const FORMS = {
  contact: {
    label: '강의·컨설팅 문의',
    thanks: '/thanks',
    fields: { name: 100, email: 254, message: 5000 },
  },
  'tool-proposal': {
    label: 'AI 도구 제작 제안',
    thanks: '/proposal-thanks',
    fields: { name: 100, email: 254, service: 5000, 'ministry-need': 5000, workflow: 5000 },
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return fail(400, '양식 내용을 읽지 못했습니다.');
  }

  const formName = String(form.get('form-name') || '');
  const spec = FORMS[formName];
  if (!spec) return fail(400, '알 수 없는 양식입니다.');

  // 함정 칸(bot-field)이 채워졌으면 자동 입력으로 보고, 저장하지 않은 채 정상 화면만 보여 준다.
  if (String(form.get('bot-field') || '').trim()) return done(spec.thanks);

  // 선택: Turnstile(무료 봇 차단)을 켠 경우에만 검사한다.
  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, form.get('cf-turnstile-response'), request);
    if (!ok) return fail(400, '자동 입력 방지 확인에 실패했습니다. 다시 시도해 주세요.');
  }

  const data = {};
  for (const [key, max] of Object.entries(spec.fields)) {
    const value = String(form.get(key) || '').trim();
    if (!value) return fail(400, '빈 칸을 모두 채워 주세요.');
    if (value.length > max) return fail(400, '입력한 글이 너무 깁니다.');
    data[key] = value;
  }
  if (!EMAIL_RE.test(data.email)) return fail(400, '이메일 주소를 확인해 주세요.');

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  let saved = false;
  let notified = false;

  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO submissions (id, form, name, email, payload, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
      ).bind(id, formName, data.name, data.email, JSON.stringify(data), createdAt).run();
      saved = true;
    } catch (err) {
      console.error('D1 저장 실패', err);
    }
  }

  if (env.MAILER) {
    try {
      const res = await env.MAILER.fetch('https://mailer/notify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, form: formName, label: spec.label, createdAt, data }),
      });
      notified = res.ok;
      if (!res.ok) console.error('알림 실패', res.status, await res.text());
    } catch (err) {
      console.error('알림 호출 실패', err);
    }
  }

  // 저장도 알림도 못 했으면 문의가 사라지므로 실패로 알린다.
  if (!saved && !notified) return fail(500, '지금은 접수할 수 없습니다. 잠시 뒤 다시 보내 주세요.');
  return done(spec.thanks);
}

export function onRequest() {
  return new Response('POST만 받습니다.', { status: 405, headers: { allow: 'POST' } });
}

function done(path) {
  return new Response(null, { status: 303, headers: { location: path } });
}

function fail(status, message) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>접수하지 못했습니다</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.7;word-break:keep-all"><h1 style="font-size:1.4rem">접수하지 못했습니다</h1><p>${message}</p><p><a href="javascript:history.back()">돌아가서 다시 보내기</a></p></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function verifyTurnstile(secret, token, request) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', String(token));
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}
