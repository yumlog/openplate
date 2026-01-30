# OpenPlate

## 1. 프로젝트 개요

OpenPlate는 데이터 시각화 및 분석을 위한 웹 애플리케이션입니다. 지도, 타임라인, 커버리지 기능을 통해 데이터를 효과적으로 탐색하고 분석할 수 있습니다.

## 2. 프로젝트 구조

```
src/
├── components/
│   ├── layout/
│   │   ├── Aside.tsx        # 사이드바 네비게이션
│   │   ├── Header.tsx       # 헤더 (Breadcrumb, Avatar)
│   │   ├── Layout.tsx       # 메인 레이아웃
│   │   └── index.ts
│   └── ui/
│       ├── avatar.tsx       # Avatar 컴포넌트
│       ├── button.tsx       # Button 컴포넌트
│       └── tooltip.tsx      # Tooltip 컴포넌트
├── lib/
│   └── utils.ts             # 유틸리티 함수 (cn)
├── pages/
│   ├── HomePage.tsx         # 홈 페이지
│   ├── MapPage.tsx          # 지도 페이지
│   ├── TimelinePage.tsx     # 타임라인 페이지
│   ├── CoveragePage.tsx     # 커버리지 페이지
│   └── index.ts
├── App.tsx                  # 앱 엔트리 (라우팅)
├── main.tsx                 # React 엔트리포인트
└── index.css                # 글로벌 스타일 및 테마
```

## 3. 빠른 시작

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 빌드 미리보기
yarn preview
```

## 4. 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Routing | React Router v7 |
| Font | Pretendard |

## 5. 개발 환경

### 요구사항

- Node.js 18+
- Yarn 1.22+

### 스크립트

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | 개발 서버 실행 (기본: http://localhost:5173) |
| `yarn build` | TypeScript 컴파일 및 프로덕션 빌드 |
| `yarn preview` | 빌드된 결과물 미리보기 |
| `yarn lint` | ESLint 코드 검사 |

### 테마 컬러

- **Primary**: `#A4FF04` (연두색)
- **Grayscale**: Neutral 컬러 시스템
