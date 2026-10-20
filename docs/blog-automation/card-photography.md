# 최근 글 카드 표지와 레이아웃 — 2026-10-20

사용자 요청으로 A4 고정 높이를 해제하고 제목 전체, 요약 최대 4줄, 자연 높이 카드를 적용했습니다. 작은 화면에서도 요약을 숨기지 않습니다. 이미지 영역은 3:2이며 이미지 원본도 3:2입니다.

`src/_data/blogCovers.json`은 글 ID별 직접 제작 표지의 원본입니다. RSS 동기화는 이 파일의 유효한 로컬 표지를 우선하며 자동 다운로드로 덮어쓰지 않습니다. 매칭되지 않는 글은 기존 RSS 대표 이미지를 사용합니다. 기사 사진을 그대로 재사용하지 않고 이번 6장은 모두 built-in image_gen으로 제작했습니다. 실제 사건·교회·인물 사진이 아니며 카드에는 ‘AI 생성 이미지’를 표시합니다. 원본 PNG는 Codex generated_images에 보관하고 사이트용 JPEG는 src/media/blog-covers/에 저장했습니다.

## 생성 프롬프트

첫 이미지:

> Generate a photorealistic editorial photograph for a Korean church AI article card about limiting AI agent permissions. Wide landscape 3:2 composition, no text, no letters, no logos. A quiet modern church administration desk with a laptop showing only abstract unfocused shapes, a notebook, and a small physical key beside the laptop; soft natural window light, realistic materials, restrained deep navy and off-white, calm trustworthy atmosphere. The key and laptop are central within a wide safe crop. This is an illustrative conceptual photo, not evidence of an actual event. Save the image for use as a web thumbnail.

나머지 5장은 다음 앞뒤 문장 사이에 각 장면 문장을 넣어 각각 생성했습니다.

> Create one photorealistic editorial photograph, landscape 3:2, for a Korean church AI article thumbnail.

- translation-arrival: A quiet welcoming Korean church entrance in daylight, a visitor's hand holding a smartphone with an entirely blurred nonlegible map, doorway and walkway in the background. Theme: translation connected to finding one's destination.
- registration-testing: Close editorial photograph of a laptop and a person's hands checking a simple website form beside a notebook on a church office desk. Screen softly out of focus, no readable interface. Theme: carefully testing a church event registration tool.
- teacher-conversation: A Korean adult teacher and teenager seen from behind at a bright classroom table, discussing a smartphone together, warm attentive body language, neutral screen with no visible content. Theme: dialogue about AI-generated short videos, no fear or violence.
- sustained-reading: Open Bible with unreadable softly blurred pages on a wooden classroom table, a pencil and notebook, a softly out-of-focus tablet set aside. Theme: sustained reading rather than AI summaries.
- transparent-ai: A small diverse group of adult church staff at a bright meeting table reviewing printed pages and a laptop, side-view candid editorial composition, all screens and writing unreadable. Theme: responsibility and transparency about using AI.

> Soft natural light, realistic human anatomy and materials, understated off-white and navy surroundings, calm respectful mood, main subjects centered for a wide crop. No text, no letters, no logos, no diagrams, no watermark. Illustrative staged image, not documentation of an actual event.
