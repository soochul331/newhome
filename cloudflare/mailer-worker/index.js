// 문의 알림 메일 Worker (2026-11-14 시제품)
// 외부에 주소를 열지 않고(workers_dev=false, 경로 없음) 홈페이지 Pages 함수의 서비스 연결로만 호출된다.
// Cloudflare Email Routing의 send_email 기능: 확인을 마친 받는 주소(오너 Gmail)로만 보낼 수 있고 무료다.
// 전제: churchailab.org 존이 Cloudflare에 있고 Email Routing이 켜져 있을 것(네임서버 이사 뒤).
import { EmailMessage } from 'cloudflare:email';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('method', { status: 405 });
    const body = await request.json().catch(() => null);
    if (!body || !body.data) return new Response('bad', { status: 400 });

    const { id, label, createdAt, data } = body;
    const kst = new Date(createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const lines = [
      `${label}이 도착했습니다. (${kst})`,
      '',
      ...Object.entries(data).map(([k, v]) => `[${FIELD_LABELS[k] || k}]\n${v}\n`),
      `접수 번호: ${id}`,
      '답장하면 문의한 분에게 바로 갑니다.',
    ];
    const raw = mime({
      from: env.MAIL_FROM,              // 예: forms@churchailab.org (Email Routing 켠 도메인)
      to: env.MAIL_TO,                  // 비밀값 MAIL_TO (Email Routing에서 확인 끝난 오너 주소)
      replyTo: data.email,
      subject: `[홈페이지] ${label} — ${data.name}`,
      text: lines.join('\n'),
    });
    await env.NOTIFY.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, raw));
    return new Response('ok');
  },
};

const FIELD_LABELS = {
  name: '성함', email: '이메일', message: '문의 내용',
  service: '필요한 도구', 'ministry-need': '필요를 느낀 상황', workflow: '바라는 작동 방식',
};

function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function header(value) {
  return `=?UTF-8?B?${b64(value)}?=`;
}

function mime({ from, to, replyTo, subject, text }) {
  const safeReply = /^[^\s@<>"]+@[^\s@<>"]+$/.test(replyTo) ? replyTo : from;
  const body = b64(text).replace(/.{76}/g, '$&\r\n');
  return [
    `From: ${header('Church AI Lab 홈페이지')} <${from}>`,
    `To: <${to}>`,
    `Reply-To: <${safeReply}>`,
    `Subject: ${header(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n');
}
