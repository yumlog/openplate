# OpenPlate 퍼블리싱 가이드

이 문서는 OpenPlate 프로젝트의 퍼블리싱 규칙을 정의합니다.

## 1. 색상 시스템

### 시맨틱 컬러 사용 원칙

Tailwind의 neutral 컬러 대신 **시맨틱 컬러**를 사용합니다.

| 용도 | 사용할 클래스 | 실제 값 (Light) |
|------|--------------|-----------------|
| 주요 텍스트 | `text-foreground` | `#0a0a0a` (neutral-950) |
| 보조 텍스트 | `text-muted-foreground` | `#737373` (neutral-500) |
| 배경색 (흰색) | `bg-background` | `#ffffff` (white) |
| 호버/컨테이너 배경 | `bg-accent` | `#f5f5f5` (neutral-100) |
| 테두리 | `border` (기본) | `#e5e5e5` (neutral-200) |
| Primary (버튼/텍스트) | `text-primary`, `bg-primary` | `#262626` |
| Primary Foreground | `text-primary-foreground` | `#fafafa` |
| Secondary 강조색 | `text-secondary`, `bg-secondary` | `#a4ff04` |
| Secondary Foreground | `text-secondary-foreground` | `#a3a3a3` |

### 사용 금지 클래스

```
text-neutral-900, text-neutral-950  →  text-foreground
text-neutral-400, text-neutral-500, text-neutral-600  →  text-muted-foreground
bg-white  →  bg-background
bg-neutral-100  →  bg-accent
border-neutral-200  →  border (기본값)
```

### 테마 변수

`src/index.css`에 정의된 CSS 변수:

```css
:root {
  --background: 0 0% 100%;        /* #ffffff */
  --foreground: 0 0% 3.9%;        /* #0a0a0a */
  --muted-foreground: 0 0% 45.1%; /* #737373 */
  --accent: 0 0% 96.1%;           /* #f5f5f5 */
  --border: 0 0% 89.8%;           /* #e5e5e5 */
  --primary: 0 0% 15%;            /* #262626 */
  --primary-foreground: 0 0% 98%; /* #fafafa */
  --secondary: 82 100% 51%;       /* #a4ff04 */
  --secondary-foreground: 0 0% 64%; /* #a3a3a3 */
}
```

## 2. 타이포그래피

### 폰트

- **기본 폰트**: Pretendard (CDN)
- **폰트 스택**: `"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, ...`

### 텍스트 스타일

| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-2xl font-bold text-foreground` |
| 섹션 제목 | `font-semibold text-foreground` |
| 본문 | `text-foreground` |
| 설명/보조 텍스트 | `text-muted-foreground` |
| 작은 텍스트 | `text-sm text-muted-foreground` |

## 3. 레이아웃

### 기본 구조

```
┌────────┬─────────────────────────────┐
│        │ Header (Breadcrumb + Avatar)│
│ Aside  ├─────────────────────────────│
│ (w-16) │ Main Container (스크롤 영역) │
│        │                             │
└────────┴─────────────────────────────┘
```

### 크기 규칙

| 요소 | 크기 |
|------|------|
| Header 높이 | `h-15` (60px) |
| Aside 로고 영역 높이 | `h-15` (60px) |
| Aside 너비 | `w-16` (64px) |
| 펼친 메뉴 모달 너비 | `w-56` (224px) |

### 스크롤

- 스크롤은 `main` 컨테이너 내부에서만 발생
- `overflow-hidden`을 상위에, `overflow-auto`를 main에 적용

## 4. 컴포넌트

### Button

| Variant | 설명 |
|---------|------|
| `default` | Primary 배경 |
| `outline` | 테두리만 |
| `ghost` | 배경 없음, 호버 시 accent |
| `secondary` | Secondary 배경 |
| `destructive` | 위험 액션 |
| `link` | 링크 스타일 |

| Size | 크기 |
|------|------|
| `default` | `h-9 px-4` |
| `xs` | `h-6 px-2` |
| `sm` | `h-8 px-3` |
| `lg` | `h-10 px-6` |
| `icon` | `size-9` |
| `icon-xs` | `size-6` |
| `icon-sm` | `size-8` |
| `icon-lg` | `size-10` |

### 아이콘

- **라이브러리**: Lucide React
- **기본 크기**: `size-5` (20px) 또는 `size-4` (16px)
- **색상**: 부모 요소의 `text-*` 클래스 상속

```tsx
import { Map, Clock, User } from "lucide-react"

<Map className="size-5" />
<Clock className="size-4 text-muted-foreground" />
```

### 카드/박스

```tsx
<div className="p-6 bg-background rounded-lg border">
  <h3 className="font-semibold text-foreground">제목</h3>
  <p className="text-sm text-muted-foreground mt-1">설명</p>
</div>
```

## 5. 간격 (Spacing)

| 용도 | 클래스 |
|------|--------|
| 페이지 패딩 | `p-6` |
| 섹션 간격 | `space-y-4` |
| 그리드 간격 | `gap-4` |
| 메뉴 아이템 간격 | `gap-6` |
| 인라인 요소 간격 | `gap-2` 또는 `gap-2.5` |

## 6. 네비게이션

### Aside 메뉴

| 상태 | 스타일 |
|------|--------|
| 기본 | `text-muted-foreground` |
| 호버 | `hover:bg-accent hover:text-foreground` |
| 활성 | `text-foreground` |

### Breadcrumb

```tsx
<nav className="flex items-center gap-2.5 text-sm">
  <Link to="/" className="text-muted-foreground">홈</Link>
  <ChevronRight className="size-4 text-muted-foreground" />
  <span className="text-foreground font-medium">현재 페이지</span>
</nav>
```

## 7. 파일 구조

```
src/
├── components/
│   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── Aside.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── index.ts
│   └── ui/              # shadcn/ui 기반 컴포넌트
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── date-picker.tsx
│       ├── dialog.tsx
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── popover.tsx
│       ├── checkbox.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── slider.tsx
│       └── tooltip.tsx
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── MapPage.tsx
│   ├── TimelinePage.tsx
│   ├── CoveragePage.tsx
│   ├── RoiLabelingPage.tsx
│   ├── RoiEditorPage.tsx
│   ├── SpotEditorPage.tsx
│   ├── ReferenceBuilderPage.tsx
│   └── index.ts
├── lib/
│   └── utils.ts         # cn() 유틸리티
├── App.tsx              # 라우팅 설정
├── main.tsx             # 엔트리포인트
└── index.css            # 글로벌 스타일, 테마 변수
```

## 8. 코드 스타일

### Import 순서

1. React/외부 라이브러리
2. 컴포넌트 (`@/components/...`)
3. 유틸리티 (`@/lib/...`)
4. 타입

```tsx
import { useState } from "react";
import { Map, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### 컴포넌트 작성

```tsx
interface ComponentProps {
  children: React.ReactNode;
}

export function Component({ children }: ComponentProps) {
  return <div>{children}</div>;
}
```
