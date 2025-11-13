# Soopnote - 숲의 기록

자연 속의 관찰과 나무의사의 시선을 담은 기록 공간입니다.

## 기술 스택

- **플랫폼**: Next.js 15 (App Router, 정적 + ISR)
- **스타일링**: Tailwind CSS 3.4 + shadcn/ui
- **배포**: Vercel
- **데이터베이스**: Supabase
- **글 작성**: TinyMCE (클라우드) + Markdown 플러그인
- **언어**: TypeScript

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TinyMCE Configuration
NEXT_PUBLIC_TINYMCE_API_KEY=your_tinymce_api_key
```

#### Supabase 설정 방법

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Project Settings > API에서 다음 값을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### TinyMCE 설정 방법

1. [TinyMCE](https://www.tiny.cloud/)에서 무료 계정 생성
2. Dashboard에서 API Key 발급
3. API Key → `NEXT_PUBLIC_TINYMCE_API_KEY`

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
soopnote/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈페이지
│   ├── globals.css          # 전역 스타일
│   ├── wildflower/          # 야생화 일지
│   ├── tree-diagnose/       # 나무진단
│   └── column/              # 칼럼
├── components/              # 재사용 컴포넌트
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/                     # 유틸리티 함수
│   ├── utils.ts
│   └── supabase/            # Supabase 클라이언트
│       ├── client.ts        # 클라이언트 사이드
│       └── server.ts        # 서버 사이드
└── public/                  # 정적 파일
```

## 주요 기능

- **야생화 일지**: 야생화 관찰 기록 및 사진
- **나무진단**: 나무의사의 전문 진단 기록
- **칼럼**: 환경/자연 관련 에디토리얼

## 배포

### Vercel 배포

1. GitHub 저장소에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정 (Supabase, TinyMCE API Keys)
4. 배포 완료

```bash
# 빌드 테스트
npm run build

# 프로덕션 서버 실행
npm run start
```

## 라이선스

CC BY-NC 4.0
