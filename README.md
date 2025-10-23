# soopnote

감성 식물 저널 **soopnote**의 랜딩 페이지입니다. Next.js(App Router)와 Tailwind CSS를 사용하여 브랜드 가이드에 맞춘 숲 감성의 메인 화면을 구성했습니다.

## 개발 환경

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS 3
- lucide-react 아이콘

## 주요 섹션

- 헤더 & 내비게이션: 브랜드 로고, 카테고리 링크, 글쓰기 버튼
- 히어로 영역: 핵심 메시지와 CTA, 추천 포스트 카드
- 오늘의 메모 & 소셜 미리보기: 수목 진단 노트와 SNS 티저
- 카테고리 소개: 네 가지 콘텐츠 카테고리 카드
- 최근 게시물: 카드형 포스트 목록
- 뉴스레터 섹션: 숲의 향기를 전하는 구독 폼
- 푸터: 브랜드 정보와 연락처, 저작권 문구

## 사용 방법

```bash
npm install
npm run dev
```

`npm run dev` 명령 실행 후 [http://localhost:3000](http://localhost:3000)에서 페이지를 확인할 수 있습니다.

## GitHub에 업로드하기

이미 저장소가 초기화되어 있다면 아래 단계만 따라 하면 원격 저장소로 올릴 수 있습니다.

1. GitHub에서 빈 저장소를 생성합니다. (예: `https://github.com/username/soopnote`)
2. 로컬에서 Git 원격을 추가합니다.
   ```bash
   git remote add origin https://github.com/username/soopnote.git
   ```
3. 현재 브랜치의 내용을 GitHub로 푸시합니다.
   ```bash
   git push -u origin HEAD
   ```

이미 원격이 설정되어 있다면 3단계만 실행하면 됩니다. 푸시가 끝나면 GitHub에서 `Clone` 버튼을 통해 다른 PC에서 `git clone`으로 내려받을 수 있습니다.

## 라이선스

CC BY-NC 4.0
