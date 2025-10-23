
---

## 목차

1. 프로젝트 개요
2. 학습 목표
3. 사전 준비물(환경)
4. 프로젝트 구조(권장)
5. 빠른 시작(설치 및 실행)
6. 코드 스타일 / 규칙
7. Emotion (CSS-in-JS) 설정 및 사용 가이드
8. Firebase 설정 요약 (Auth, Firestore, Storage)
9. 공통 컴포넌트 설계 가이드
10. 폼 처리: Controlled vs Uncontrolled, Validation
11. 인증 흐름 및 AuthGuard 설계
12. 전역 상태관리: Context API vs Recoil
13. 최적화 핵심 포인트

    * Critical Rendering Path (CRP)
    * 트리쉐이킹
    * 번들 분석 및 분할
    * Main thread 병목 제거
    * Layout Shift (CLS) 처리
    * 우선순위 렌더링
14. 카드 신청(프로세스) 설계 포인트 및 예외처리
15. 애니메이션과 UX 고려사항
16. 배포 (Vercel) 및 운영 체크리스트
17. 디버깅/프로파일링 툴 체크리스트
18. FAQ & 트러블슈팅
19. 참고 자료 / 링크

---

# 1. 프로젝트 개요

MCard 프로젝트는 카드(상품) 목록, 상세, 카드신청, 회원가입/로그인, 내정보 등으로 구성된 **모바일·웹 하이브리드 SPA**입니다. 본 과정은 다음 항목을 중점으로 학습합니다:

* 컴포넌트 재사용성/확장성 설계
* 공통 컴포넌트 (Input, Button, Text, Loading, Error 등)
* CSS-in-JS(Emotion)
* 폼 처리(Controlled / Uncontrolled)
* 인증(Firebase Auth) 및 데이터 저장(Firestore)
* 전역 상태관리(선택: Recoil)
* 성능 최적화(트리쉐이킹, 번들분석, Layout Shift 개선 등)
* 배포(Vercel)

# 2. 학습 목표

* 재사용 가능한 컴포넌트 설계 능력 향상
* React 애플리케이션 최적화 포인트 이해 및 적용
* 폼, 인증, 비동기 데이터 흐름(캐싱 포함) 설계 능력
* 프로덕션 배포 과정 이해

# 3. 사전 준비물(환경)

* Node.js (권장 LTS 버전)
* Yarn (Yarn Berry 권장)
* CRA 또는 Vite + TypeScript 기반 보일러플레이트
* ESLint + Prettier
* Emotion (@emotion/react, @emotion/styled)
* Firebase 프로젝트 (Auth, Firestore, Storage)
* 번들 분석 도구: `webpack-bundle-analyzer` 또는 Vite의 분석 플러그인

> 시스템 예시
>
> * Node 18+ (LTS 권장)
> * yarn v3 (berry)

# 4. 프로젝트 구조(권장)

```
src/
├─ api/                # Firebase, HTTP 유틸
├─ assets/             # 이미지, 아이콘
├─ components/         # 공통 컴포넌트(Button, Input, Text 등)
│  ├─ Button/
│  ├─ Input/
│  └─ Loading/
├─ hooks/              # 커스텀 훅(useAuth, useDebounce 등)
├─ pages/              # 라우트 단위 페이지
│  ├─ Home/
│  ├─ CardList/
│  ├─ CardDetail/
│  ├─ Signup/
│  └─ Login/
├─ routes/             # 라우터 설정 및 AuthGuard
├─ store/              # Recoil atom, selector (선택)
├─ styles/             # 전역 스타일, theme
├─ utils/              # 유틸함수 (date, validation, analytics)
└─ index.tsx
```

# 5. 빠른 시작(설치 및 실행)

1. 레포 복제

```bash
git clone <repo-url>
cd repo
```

2. 의존성 설치 (Yarn Berry 권장)

```bash
yarn set version berry
yarn install
```

3. 환경변수 설정

* `.env.local`에 Firebase 설정 및 API 키 등 추가

4. 개발 서버 실행

```bash
yarn dev
# or
yarn start
```

5. 빌드

```bash
yarn build
```

# 6. 코드 스타일 / 규칙

* ESLint + Prettier 사용
* 파일 네이밍: `kebab-case` 또는 `PascalCase` 컴포넌트
* 컴포넌트는 작은 단위로, 하나의 책임만 갖도록 분리
* 스타일은 Emotion 활용, theme 기반으로 색상/타이포 규칙 관리

# 7. Emotion (CSS-in-JS)

## 설치

```bash
yarn add @emotion/react @emotion/styled
yarn add -D @emotion/babel-plugin @babel/preset-react
```

## 사용 가이드

* `ThemeProvider`로 전역 theme 등록
* `styled` 혹은 `css` 유틸을 사용해 컴포넌트별 스타일 작성
* props 기반 동적 스타일링 권장

예시 (패턴 설명):

```tsx
import styled from '@emotion/styled';

const Button = styled.button<{ primary?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;

  background: ${props => (props.primary ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.primary ? 'white' : props.theme.colors.text)};
`;
```

> 팁: Emotion 사용 시 Babel 플러그인을 설정하면 클래스명 축약 등 빌드 최적화에 도움이 됩니다.

# 8. Firebase 설정 요약

* 서비스: Auth (이메일/비밀번호, OAuth), Firestore(문서 DB), Storage
* Firebase SDK 초기화 코드를 `src/api/firebase.ts` 등으로 분리
* 인증 상태는 `useAuth` 훅으로 캡슐화하여 애플리케이션 전역에서 재사용

간단한 초기화 예시(개념):

```ts
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

# 9. 공통 컴포넌트 설계 가이드

공통 컴포넌트는 프로젝트 전반에 재사용되므로 다음 원칙을 지킨다:

* **단일 책임 원칙(SRP)**: 컴포넌트는 한가지 역할만 담당
* **흔한 props**: `className`, `style`, `id`, `data-*` 속성은 전달 가능
* **스타일/테마 의존성 최소화**: theme 기반으로 색상/간격 지정
* **접근성(ARIA)**: 버튼, input 등 기본 aria 속성 제공
* **로딩/오류 상태 처리 포함**: Loading 컴포넌트, ErrorBoundary 활용

권장 컴포넌트

* `Button` — size, variant, disabled, loading props
* `Input` — label, helperText, error, type, value/onChange (controlled 지원)
* `Text` — typographic scale (h1, h2, body, caption 등)
* `Card` — thumbnail, title, description, action area
* `Modal` — 포커스 트랩, ESC로 닫기
* `Loading` / `Spinner`

# 10. 폼 처리: Controlled vs Uncontrolled, Validation

* **Controlled**: React state에서 값 관리 (`value` + `onChange`). 유효성 검사/실시간 피드백에 적합.
* **Uncontrolled**: DOM ref(`ref.current.value`)로 접근. 초기값만 필요하거나 성능 최적화가 필요할 때 사용.

회원가입(예시 플로우):

1. 입력값 검증(클라이언트) — 이메일 형식, 비밀번호 정책
2. 중복 체크(서버/Firestore) — 이메일/아이디 중복
3. Firebase Auth 가입 호출
4. 가입 성공 시 기본 프로필(Firestore)에 사용자 데이터 저장

유효성 처리 권장사항

* 입력 즉시 UI 피드백(유효/불가)
* 서버 요청 전 클라이언트 검사로 불필요한 요청 차단
* debounce(입력 지연 처리)로 불필요한 API 호출 방지

# 11. 인증 흐름 및 AuthGuard 설계

* 로그인한 상태는 전역 상태(토큰 또는 Firebase currentUser)로 관리
* 페이지 접근 제어: `AuthGuard` 컴포넌트를 만들어 인증된 사용자만 접근 허용
* 비동기 인증 체크가 필요하므로 로딩 상태 처리 필요

예시 구조

```
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route element={<AuthGuard />}>
    <Route path="/cards" element={<CardList />} />
    <Route path="/card/:id" element={<CardDetail />} />
  </Route>
</Routes>
```

# 12. 전역 상태관리: Context API vs Recoil

**Context API**

* 장점: React 내장, 간단한 공유 데이터에 적합
* 단점: 성능 최적화(불필요한 리렌더 제어)를 직접 관리해야 함

**Recoil**

* 장점: atom/selector 기반으로 부분 리렌더링이 쉬움, 비동기 selector로 데이터 패칭/캐싱/컴포지션 간단
* 단점: 외부 라이브러리 도입 비용

권장 사용

* 소규모: Context
* 복잡한 비동기 상태, 캐싱, 파생 상태가 많은 경우: Recoil 권장

# 13. 최적화 핵심 포인트

이 섹션은 강의의 핵심인 **최적화** 를 정리한 부분입니다. 각 항목은 원리 → 문제 증상 → 해결책 → 실습 방법 순으로 구성했습니다.

## 13.1 Critical Rendering Path (CRP)

* 브라우저가 콘텐츠를 화면에 렌더링하기 위해 HTML, CSS, JS를 파싱하고 실행하는 과정
* 중요 포인트: 렌더링에 필수적이지 않은 JS/CSS를 차단시키지 않도록 로딩 우선순위를 조정

해결책

* CSS는 가능한 `head`에 인라인 혹은 빠르게 로드
* JS 번들(특히 큰 라이브러리)은 `defer`나 `async`, 코드 분할 적용
* 초기 화면에 불필요한 JS 연산을 연기(lazy load / dynamic import)

## 13.2 트리쉐이킹

* 사용하지 않는 모듈/코드를 번들에서 제거하여 번들 크기 축소
* ESM 사용을 권장(정적 분석 가능)
* Webpack, Rollup, Vite 등 빌드 도구가 지원

실습

* `webpack-bundle-analyzer`로 번들 시각화
* 의존성에서 사용하지 않는 함수/라이브러리 제거

## 13.3 번들 분석 및 분할

* 번들 분석기를 사용하여 어떤 모듈이 용량을 차지하는지 확인
* 대형 라이브러리는 CDN 로드, 혹은 dynamic import로 분리
* React 앱에서 `React.lazy` + `Suspense`로 Route/Heavy component code-splitting 진행

## 13.4 메인 스레드 병목 코드(Heavy JS)

* 문제: 단일 스레드에서 무거운 연산이 실행되면 UI 응답성이 떨어짐
* 원인: 대량의 동기 연산, 무거운 라이브러리 초기화, 반복적 계산

해결책

* Web Worker로 무거운 계산 분리
* 연산 최적화 (memoization, debouncing, throttling)
* 리렌더링 최소화 (React.memo, useMemo, useCallback 적용)

## 13.5 Layout Shift (CLS) 처리

* 예시: 이미지 로딩 전 치우침, 폰트 변경으로 인한 치우침, 동적으로 삽입되는 콘텐츠

해결책

* 이미지에 width/height 혹은 `aspect-ratio` CSS를 설정
* 광고/비동적 컨텐츠는 컨테이너 영역 예약
* 폰트 FOUT/FOIT 방지: `font-display` 설정

## 13.6 우선순위 렌더링

* 사용자에게 중요한(above-the-fold) 요소를 우선적으로 렌더
* Lazy-load 비가시성 컴포넌트
* placeholder, skeleton UI로 perceived performance 향상

# 14. 카드 신청(프로세스) 설계 포인트 및 예외처리

카드 신청은 다음 흐름을 따릅니다:

1. 사용자 입력 (약관 동의 → 기본 정보 → 카드정보)
2. 중간 저장 (localStorage 또는 Firestore draft) — 사용 도중 이탈 대비
3. 실제 신청 트랜잭션 제출 (원자적 처리 필요)
4. 상태 폴링(예: 2초 간격)으로 신청 진행 상태 확인 (준비/진행중/완료/거절)
5. 완료/거절 시 안내/리다이렉트

예외 처리

* 네트워크 오류: 재시도 로직(횟수 제한, 백오프)
* 중복 제출: 요청 토큰으로 차단
* 입력 불일치: 상세한 에러 메시지 제공

# 15. 애니메이션과 UX 고려사항

* 애니메이션은 성능 영향이 적은 속성(transform, opacity)으로 구현
* 레이아웃(예: width, height) 변경을 최소화
* 애니메이션은 사용자의 흐름을 방해하지 않도록 절제
* 접근성: reduced-motion 사용자 설정 반영

# 16. 배포 (Vercel) 및 운영 체크리스트

1. 환경변수 정리(`NEXT_PUBLIC_*` 또는 `REACT_APP_*` 접두사 사용)
2. 빌드 최적화 (`NODE_ENV=production`, minification 등)
3. Sentry 혹은 로그 시스템 연동(에러 모니터링)
4. 성능 모니터링(Analytics, Core Web Vitals)
5. 캐시 전략(CDN, cache headers)

Vercel 배포 기본

* `vercel`에 깃허브 연동, 브랜치별 배포 자동화
* Production에만 중요한 환경변수 적용

# 17. 디버깅/프로파일링 툴 체크리스트

* Chrome DevTools Performance / Memory
* Lighthouse (Core Web Vitals)
* React DevTools Profiler
* webpack-bundle-analyzer
* Firebase Console (Auth logs, Firestore indexing)

# 18. FAQ & 트러블슈팅

Q. 초기 로딩 속도가 느리다

* 불필요한 라이브러리 제거, 코드 분할, 이미지 최적화

Q. 번들 용량이 너무 크다

* 사용하지 않는 플러그인/함수 제거, 트리쉐이킹 활성화

Q. Layout Shift가 심하다

* 이미지나 외부 광고 영역에 고정 크기 확보, font-display 설정

Q. Recoil 도입 후 특정 컴포넌트가 자주 리렌더된다

* selector/atom 분리, selector의 의존성 최소화

# 19. 참고 자료 / 링크

* Emotion: [https://emotion.sh/docs/introduction](https://emotion.sh/docs/introduction)
* Firebase: [https://firebase.google.com/docs](https://firebase.google.com/docs)
* webpack-bundle-analyzer: [https://www.npmjs.com/package/webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
* Vercel: [https://vercel.com/](https://vercel.com/)
* Lighthouse / Core Web Vitals: [https://web.dev/vitals/](https://web.dev/vitals/)

---

## 부록: 실무 팁 모음 (강의 내 팁 요약)

* **Skeleton UI** 를 적극 사용하라: perceived performance는 실제 측정보다 사용자 만족에 더 큰 영향을 준다.
* **로컬 저장**: 긴 폼 입력의 경우 중간중간 draft를 localStorage에 저장해 이탈 대비.
* **Error Boundary** 를 필수로 적용해 예기치 못한 런타임 에러가 전체 앱을 붕괴시키지 않도록 함.
* **이미지 최적화**: WebP/AVIF 사용 고려, `srcset`으로 반응형 이미지 제공.
* **번들 시각화** 을 주기적으로 수행해 라이브러리 추가 시 용량 폭증을 사전에 확인.
* **성능 예산(Performance Budget)**을 설정하여 번들 크기·LCP·CLS 목표를 관리.


---
---
## React 학습하기

1. React 기본 이론 
2. 프로젝트 개요
3. 개발 환경 세팅 (Craco, ESLint, Yarn Berry 포함)
4. Emotion & Theme 구성
5. Firebase 연동
6. 공통 컴포넌트 설계
7. 카드 목록 / 상세 / 신청 구현
8. 애니메이션 및 UX 최적화
9. React 렌더링 최적화
10. 빌드 및 번들링 최적화 (트리쉐이킹, Layout Shift 등)
11. 배포 및 운영 자동화
12. 트러블슈팅 & FAQ

# 🧩 1. React 기초 이론 (React Fundamentals)

> 이 장에서는 React의 핵심 개념을 처음부터 차근차근 배웁니다.
> React는 단순한 UI 라이브러리가 아니라 **“사용자 인터페이스를 효율적으로 구성하는 사고방식”** 을 제시하는 도구입니다.

---

## 🔹 1.1 React의 등장 배경과 특징

### ✨ 배경

과거 웹은 서버에서 HTML을 생성해 보내는 **정적 페이지 중심 구조** 였습니다.
그러나 사용자 인터랙션이 많아지면서 다음과 같은 문제가 생겼습니다.

* 페이지 전환마다 새로고침이 일어남
* DOM 조작(jQuery 등)이 복잡하고 비효율적
* 코드 재사용성이 낮고 유지보수가 어려움

이를 해결하기 위해 **Facebook(현 Meta)** 이 개발한 ** React** 가 등장했습니다.

---

### ⚙️ React의 주요 특징

| 특징                                | 설명                                            |
| --------------------------------- | --------------------------------------------- |
| **Component 기반 구조**               | UI를 작고 독립적인 컴포넌트 단위로 나누어 재사용 가능               |
| **Virtual DOM**                   | 실제 DOM 대신 가상의 DOM을 메모리에 두고, 변경 사항만 효율적으로 업데이트 |
| **선언형 프로그래밍**                     | “어떻게” 그릴지보다 “무엇을” 보여줄지를 선언적으로 작성              |
| **단방향 데이터 흐름(One-way Data Flow)** | 데이터가 부모 → 자식 방향으로만 전달되어 예측 가능한 상태 관리 가능       |
| **Rich Ecosystem**                | Hooks, Context, Router, Redux 등 다양한 확장 생태계 지원 |

---

## 🔹 1.2 Virtual DOM이란?

* **DOM(Document Object Model)** 은 HTML 구조를 객체 형태로 표현한 것입니다.
* DOM은 조작할 때마다 렌더링이 발생하므로, 조작이 많을수록 느려집니다.

React는 이를 개선하기 위해 **Virtual DOM (가상 DOM)** 을 사용합니다.

```
[렌더링 과정 요약]
1️⃣ 컴포넌트의 상태(state)가 변경되면
2️⃣ Virtual DOM이 새로운 UI 트리를 계산하고
3️⃣ 이전 Virtual DOM과 비교(diffing)
4️⃣ 변경된 부분만 실제 DOM에 반영(patching)
```

✅ **결과:** 브라우저의 리렌더링 비용을 줄이고, 빠른 UI 업데이트가 가능해집니다.

---

## 🔹 1.3 JSX 문법

JSX(JavaScript XML)는 JavaScript 안에서 HTML 태그를 작성할 수 있게 해주는 React 문법입니다.

```jsx
function Hello() {
  return <h1>Hello, React!</h1>;
}
```

> JSX는 브라우저가 직접 이해하지 못하므로 Babel이 이를 `React.createElement()` 형태의 JS 코드로 변환합니다.

### JSX 규칙 정리

| 규칙                       | 예시                                 |
| ------------------------ | ---------------------------------- |
| 반드시 **하나의 부모 요소** 로 감싸야 함 | `<div>...</div>`                   |
| **중괄호 `{}`** 로 JS 표현식 삽입 | `<p>{name}</p>`                    |
| **class → className**    | `<div className=\"box\" />`        |
| **style은 객체 형태로 작성**     | `<div style={{ color: 'red' }} />` |

---

## 🔹 1.4 Props / State / Component Lifecycle

### 🧱 Props (Properties)

* 부모 컴포넌트가 자식 컴포넌트로 전달하는 **읽기 전용 데이터**
* 컴포넌트의 “입력값” 역할

```jsx
function Welcome({ name }) {
  return <h2>안녕하세요, {name}님!</h2>;
}

<Welcome name=\"경덕\" />;
```

> props는 변경할 수 없으며, 동일한 props가 전달되면 동일한 UI가 렌더링됩니다.

---

### ⚡ State (상태)

* 컴포넌트 내부에서 관리되는 **동적인 데이터**
* 변경될 때마다 자동으로 리렌더링이 발생

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

> `useState()`는 React Hook 중 하나로, 상태와 상태를 변경하는 함수를 반환합니다.

---

### 🔄 Component Lifecycle (컴포넌트 생명주기)

| 단계         | 설명                       |
| ---------- | ------------------------ |
| Mounting   | 컴포넌트가 처음 화면에 렌더링됨        |
| Updating   | state나 props가 변경되어 리렌더링됨 |
| Unmounting | 컴포넌트가 화면에서 제거됨           |

함수형 컴포넌트에서는 `useEffect` Hook을 사용하여 라이프사이클을 제어합니다.

```jsx
useEffect(() => {
  console.log('컴포넌트가 마운트됨');
  return () => console.log('언마운트됨');
}, []);
```

---

## 🔹 1.5 함수형 컴포넌트 vs 클래스형 컴포넌트

| 구분      | 함수형 컴포넌트                      | 클래스형 컴포넌트                              |
| ------- | ----------------------------- | -------------------------------------- |
| 문법      | `function MyComp()`           | `class MyComp extends React.Component` |
| 상태관리    | Hook(`useState`, `useEffect`) | `this.state`, `this.setState()`        |
| this 사용 | ❌ 없음                          | ✅ 필요                                   |
| 성능      | 가볍고 빠름                        | 상대적으로 무거움                              |
| 권장      | ✅ (React 16.8+ 이후 표준)         | ⚠️ 신규 개발에서는 비추천                        |

> 현재 대부분의 React 프로젝트는 **함수형 컴포넌트 + Hooks 조합**을 사용합니다.

---

## 🔹 1.6 React Hooks 개요

Hooks는 클래스형 컴포넌트의 한계를 극복하기 위해 도입된 **함수형 컴포넌트용 기능 확장 도구** 입니다.

### 주요 Hooks 요약

| Hook          | 설명                  | 예시                                          |
| ------------- | ------------------- | ------------------------------------------- |
| `useState`    | 상태(state)를 관리       | `const [count, setCount] = useState(0);`    |
| `useEffect`   | 라이프사이클 제어           | `useEffect(() => {...}, []);`               |
| `useRef`      | DOM 접근 또는 값 저장      | `const inputRef = useRef(null);`            |
| `useMemo`     | 계산 비용이 큰 연산을 메모이제이션 | `useMemo(() => heavyCalc(data), [data]);`   |
| `useCallback` | 함수 재생성을 방지(성능 최적화)  | `useCallback(() => handleClick(), [deps]);` |

---

## 🔹 1.7 렌더링 최적화 원리

React는 **상태(state)나 props가 변경될 때** 자동으로 컴포넌트를 다시 렌더링합니다.
하지만 불필요한 렌더링은 성능 저하의 원인이 될 수 있습니다.

### 1️⃣ `React.memo`

* 같은 props가 전달되면 렌더링을 건너뜀

```jsx
const Button = React.memo(({ label }) => {
  console.log('렌더링됨');
  return <button>{label}</button>;
});
```

---

### 2️⃣ `key`의 역할

* 리스트 렌더링 시 각 항목을 식별하기 위해 필요
* key가 없으면 React가 변경점을 정확히 파악하지 못해 성능이 저하됨

```jsx
{list.map(item => <li key={item.id}>{item.name}</li>)}
```

---

### 3️⃣ Reconciliation (조화 과정)

React가 Virtual DOM을 비교(diffing)하여 변경된 부분만 실제 DOM에 반영하는 과정입니다.

> 핵심 규칙:
> 동일한 컴포넌트 타입이면 비교(diffing) → 다르면 새로 생성.
> key가 다르면 새로 생성되어 상태가 초기화될 수 있음.

---

## ✅ 요약 정리

| 개념       | 핵심 키워드                               |
| -------- | ------------------------------------ |
| React 특징 | Virtual DOM, Component, 선언형 UI       |
| JSX      | HTML + JS 결합 문법                      |
| Props    | 부모 → 자식 데이터 전달                       |
| State    | 컴포넌트 내부 동적 데이터                       |
| Hooks    | 상태/라이프사이클 관리 도구                      |
| 최적화      | React.memo, key, useMemo/useCallback |

---

좋습니다 👏
이제 **초보자용 React 프로젝트 환경 설정(Part 2)** 섹션을 아주 자세하고 친절하게 작성해드리겠습니다.
FastCampus 교재의 흐름을 기반으로, 실제 실습 시 바로 따라 할 수 있도록
**설치 명령어 → 설정 코드 → 작동 원리 → 주의점**까지 모두 포함한 README.md 예시입니다.

---

# ⚙️ 2. 프로젝트 환경 설정 상세 (React 환경 세팅 완벽 가이드)

> 이 장에서는 React 개발을 시작하기 위한 **기본 환경 구축 단계** 를 자세히 설명합니다.
> 초보자라도 따라 하면 바로 개발 가능한 수준으로 환경을 구성합니다.
> ✅ 핵심 목표: “내 컴퓨터에서 React 앱을 문제없이 실행하고, 깔끔한 코드 스타일을 유지하는 것”

---

## 🧩 2.1 Create React App (CRA) + Yarn Berry 세팅 과정

### 🔹 1단계: Node.js 설치

React 개발은 Node.js 환경에서 동작합니다.

* [Node.js 공식 홈페이지](https://nodejs.org/ko) 에서 **LTS (장기지원)** 버전 설치
  (예: `v18.x` 또는 `v20.x` 권장)
* 설치 후 버전 확인:

```bash
node -v
npm -v
```

---

### 🔹 2단계: Yarn 설치 (Yarn Berry 버전)

**Yarn** 은 npm보다 빠르고, 의존성 관리가 쉬운 패키지 매니저입니다.
특히 **Yarn Berry (v2 이상)** 는 “Zero Install”과 “Plug’n’Play” 기능을 제공하여,
CI/CD 환경에서도 빠르고 안정적인 빌드를 제공합니다.

#### ✅ 설치 명령어

```bash
npm install -g yarn
```

#### ✅ 버전 확인

```bash
yarn -v
```

#### ✅ Yarn Berry로 업그레이드

프로젝트 루트에서 아래 명령어 실행:

```bash
yarn set version berry
```

📁 프로젝트 안에 `.yarn/` 폴더와 `.yarnrc.yml` 파일이 생기면 성공입니다.

---

### 🔹 3단계: CRA(Create React App)로 프로젝트 생성

```bash
yarn create react-app my-react-app --template typescript
```

* `my-react-app`: 프로젝트 폴더명
* `--template typescript`: TypeScript 기반 프로젝트 생성 (JS로 하려면 생략 가능)

생성 후 진입:

```bash
cd my-react-app
yarn start
```

✅ 브라우저에서 자동으로 `http://localhost:3000` 실행되면 성공입니다!

---

## 🧩 2.2 Craco 설정 및 alias 사용법

CRA 기본 설정은 Webpack/Eslint 등을 직접 수정할 수 없습니다.
이를 해결하기 위해 **Craco(Create React App Configuration Override)** 를 사용합니다.

### 🔹 Craco 설치

```bash
yarn add @craco/craco
```

### 🔹 package.json 수정

`react-scripts` 대신 `craco`로 실행하도록 변경합니다.

```json
"scripts": {
  "start": "craco start",
  "build": "craco build",
  "test": "craco test",
  "eject": "react-scripts eject"
}
```

---

### 🔹 Craco 설정 파일 생성

`craco.config.js` 파일을 루트 디렉토리에 생성합니다.

```js
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@hooks': path.resolve(__dirname, 'src/hooks/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
    },
  },
};
```

이제 import 문을 깔끔하게 작성할 수 있습니다 👇

```tsx
// Before
import Button from '../../../components/common/Button';

// After
import Button from '@components/common/Button';
```

✅ **alias 설정 장점**

* 경로 오류 감소
* import 구조 가독성 향상
* 리팩토링 시 유지보수 용이

---

## 🧩 2.3 ESLint + Prettier + Zero Install 구성법

React 프로젝트를 협업 환경에서도 깔끔하게 유지하려면
**코드 품질 도구 (ESLint + Prettier)** 설정이 필수입니다.

---

### 🔹 1단계: ESLint 설치

```bash
yarn add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 🔹 2단계: Prettier 설치

```bash
yarn add -D prettier eslint-config-prettier eslint-plugin-prettier
```

---

### 🔹 3단계: 설정 파일 생성

#### 📄 `.eslintrc.json`

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "react-app",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": ["react", "@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto",
        "semi": true,
        "singleQuote": true,
        "printWidth": 100,
        "trailingComma": "es5"
      }
    ],
    "no-unused-vars": "warn",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### 📄 `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

---

### 🔹 4단계: VSCode 자동 정렬 설정

📄 `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

이제 저장할 때마다 코드가 자동으로 정리됩니다 ✨

---

### 🔹 5단계: Yarn Berry Zero Install 설정

Yarn Berry는 `.yarn/cache` 디렉토리에 모든 패키지를 저장하므로
협업 시에도 `yarn install` 없이 즉시 실행이 가능합니다.

**필수 파일**

* `.yarnrc.yml`
* `.yarn/releases/`
* `.yarn/cache/`

💡 **주의:** `.yarn/cache`는 용량이 크므로 GitHub 업로드 시 제외해야 합니다.

---

## 🧩 2.4 .gitignore 예시

GitHub에 불필요한 파일이 업로드되지 않도록 `.gitignore`를 설정합니다.

```bash
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# build output
/build
/dist

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor
.vscode/
.idea/

# env files
.env
.env.local
.env.development.local
.env.production.local
.env.test.local
```

---

## 🧩 2.5 TypeScript 설정 요약

CRA로 프로젝트를 생성하면 자동으로 `tsconfig.json`이 생성됩니다.
여기서 중요한 옵션만 간략히 짚어봅니다 👇

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

✅ **핵심 포인트**

* `strict: true` : 타입 검사 강화 (권장)
* `jsx: react-jsx` : React 17+ 문법 지원
* `baseUrl: src` : import 절대경로 사용 가능 (alias와 함께 사용)

---

## ✅ 정리: 환경 설정 완료 체크리스트

| 항목                | 상태 | 설명                   |
| ----------------- | -- | -------------------- |
| Node.js 설치        | ✅  | 최신 LTS 버전 설치         |
| Yarn Berry 적용     | ✅  | Zero Install 환경 구성   |
| CRA 프로젝트 생성       | ✅  | TypeScript 템플릿 사용    |
| Craco 설정          | ✅  | alias로 import 경로 단순화 |
| ESLint + Prettier | ✅  | 코드 품질 자동 관리          |
| .gitignore        | ✅  | 불필요한 파일 제외           |
| TypeScript 옵션     | ✅  | 안정적 타입 검사            |

---

# 🎨 3. Emotion & Theme System

> React에서 스타일을 작성할 때, 전통적인 CSS 파일을 사용하는 대신
> **CSS-in-JS** 방식을 통해 컴포넌트 단위로 스타일을 관리합니다.
> 그중에서도 가장 널리 쓰이는 라이브러리 중 하나가 **Emotion** 입니다.

---

## 🧩 3.1 CSS-in-JS란?

### 🔹 개념 요약

CSS-in-JS는 **CSS를 자바스크립트 코드 내부에서 작성** 하는 방법입니다.
즉, JS 파일 안에서 직접 스타일을 정의하고, 이를 컴포넌트 단위로 연결합니다.

```jsx
import styled from '@emotion/styled';

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
`;
```

> 이처럼 Emotion은 각 컴포넌트의 스타일을 **고유한 클래스 이름** 으로 컴파일해
> CSS 충돌을 방지하고 유지보수를 쉽게 만듭니다.

---

## 💡 3.2 CSS-in-JS의 장점과 단점

| 구분          | 장점                                     | 단점                                  |
| ----------- | -------------------------------------- | ----------------------------------- |
| **관리성**     | 각 컴포넌트에 스타일이 포함되어 있어 **컴포넌트 재사용성이 높음** | CSS 분리 관리가 어렵다고 느껴질 수 있음            |
| **스코프 격리**  | 클래스명 충돌 없이 **자동으로 고유 클래스 생성**          | 기존 CSS 지식이 부족하면 진입장벽이 있음            |
| **동적 스타일링** | JS 변수를 사용해 **조건부 스타일링이 쉬움**            | 런타임 시 계산되는 스타일은 성능에 영향              |
| **테마 지원**   | ThemeProvider를 이용해 **일관된 색상/폰트 관리 가능** | 빌드 시 SSR 최적화 추가 설정이 필요함 (Next.js 등) |

---

## ⚙️ 3.3 Emotion 설치 및 기본 설정

프로젝트 루트에서 다음 명령어를 실행합니다:

```bash
yarn add @emotion/react @emotion/styled
```

CRA(Create React App) 또는 Vite 환경에서 자동 설정됩니다.
만약 Babel 환경을 직접 구성했다면 아래 플러그인 추가가 필요합니다:

```bash
yarn add -D @emotion/babel-plugin
```

📄 `babel.config.json` 또는 `.babelrc`에 다음을 추가합니다.

```json
{
  "plugins": ["@emotion"]
}
```

---

## 🧱 3.4 styled-components와의 비교 (참고)

| 구분        | Emotion                                | styled-components                        |
| --------- | -------------------------------------- | ---------------------------------------- |
| 설치 크기     | 가벼움                                    | 다소 무거움                                   |
| 빌드 속도     | 빠름                                     | 느림                                       |
| 테마 설정     | 지원                                     | 지원                                       |
| 타입스크립트 지원 | 매우 우수                                  | 우수                                       |
| 사용 예      | `import styled from '@emotion/styled'` | `import styled from 'styled-components'` |

> 두 라이브러리 모두 목적은 같지만, Emotion은 React 공식 문서에서도 자주 언급되며
> **성능과 타입 지원 측면에서 한 단계 더 가볍습니다.**

---

## 🌈 3.5 ThemeProvider 활용 (colors, typography)

Emotion은 전역 Theme를 설정하여
**색상, 폰트, 간격 등 디자인 시스템을 일관되게 유지**할 수 있습니다.

### 🔹 1단계: theme 객체 생성

📄 `src/styles/theme.ts`

```ts
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    background: '#f8f9fa',
    text: '#212529',
  },
  typography: {
    fontFamily: '"Noto Sans KR", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    body: { fontSize: '1rem', fontWeight: 400 },
  },
  spacing: (factor: number) => `${factor * 8}px`, // 8px 단위 간격 시스템
};

export default theme;
```

---

### 🔹 2단계: ThemeProvider로 전역 적용

📄 `src/index.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import App from './App';
import theme from './styles/theme';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

---

### 🔹 3단계: styled 컴포넌트에서 theme 사용하기

```tsx
import styled from '@emotion/styled';

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export default function Header() {
  return <Title>Emotion Theme Example</Title>;
}
```

💡 **Tip:**
`theme`은 자동으로 타입 추론이 되지만, TypeScript에서는 `Theme` 인터페이스를 명시해도 좋습니다.

---

## 🧭 3.6 전역 스타일(Global Styles) 구성

Emotion은 전역 스타일(Global CSS)을 적용할 때
`Global` 컴포넌트를 사용합니다.

### 🔹 전역 스타일 파일 만들기

📄 `src/styles/global.tsx`

```tsx
/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    height: 100%;
    font-family: 'Noto Sans KR', sans-serif;
    background-color: #f8f9fa;
    color: #212529;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }
`;

export default function GlobalStyle() {
  return <Global styles={globalStyles} />;
}
```

---

### 🔹 App.tsx에서 전역 스타일 적용

📄 `src/App.tsx`

```tsx
import React from 'react';
import GlobalStyle from './styles/global';
import { ThemeProvider } from '@emotion/react';
import theme from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <h1>React + Emotion 시작하기 🚀</h1>
    </ThemeProvider>
  );
}

export default App;
```

✅ 결과:
모든 페이지에 기본 스타일과 공통 폰트, 색상이 일관되게 적용됩니다.

---

## 🎨 3.7 동적 스타일링 (조건부 스타일링)

Emotion은 **props를 기반으로 조건부 스타일을 쉽게 적용** 할 수 있습니다.

```tsx
import styled from '@emotion/styled';

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${({ primary, theme }) =>
    primary ? theme.colors.primary : theme.colors.secondary};
  color: white;
  padding: ${({ theme }) => theme.spacing(2)};
  border: none;
  border-radius: 6px;

  &:hover {
    opacity: 0.9;
  }
`;

export default function App() {
  return (
    <>
      <Button primary>확인</Button>
      <Button>취소</Button>
    </>
  );
}
```

> props 값에 따라 색상이나 간격을 쉽게 바꿀 수 있으므로
> “버튼, 배너, 알림창”처럼 상태별 디자인이 다른 UI 구현에 유용합니다.

---

## 🚀 3.8 Emotion 사용 시 주의사항 및 팁

| 항목            | 설명                                              |
| ------------- | ----------------------------------------------- |
| **빌드 최적화**    | Babel 플러그인 `@emotion/babel-plugin`을 사용해 클래스명 축약 |
| **성능 최적화**    | JS 계산이 많은 스타일은 `useMemo`로 감싸거나 최소화              |
| **테마 관리**     | 색상·폰트 등은 theme 객체에 모두 정의하여 중복 방지                |
| **CSS Reset** | 전역 스타일에 Normalize.css나 reset.css를 포함하면 좋음       |

---

## ✅ 3.9 요약

| 항목            | 핵심 포인트                |
| ------------- | --------------------- |
| CSS-in-JS     | JS 안에서 스타일을 작성하는 방식   |
| Emotion 장점    | 충돌 없는 스타일, 컴포넌트 단위 관리 |
| ThemeProvider | 색상·폰트 등 디자인 시스템 통합 관리 |
| GlobalStyle   | 프로젝트 전체 공통 스타일 적용     |
| 동적 스타일링       | props 기반 조건부 디자인 가능   |


---

# 📦 4. Firebase 실습 세부 내용

> React 앱은 단순히 화면만 보여주는 도구가 아니라,
> 사용자 데이터(회원정보, 카드 신청 내역 등)를 **실시간으로 저장·조회·동기화**할 수 있습니다.
> 이때 가장 쉽게 백엔드를 구현할 수 있는 서비스가 **Firebase** 입니다.

---

## 🚀 4.1 Firebase란?

**Firebase** 는 Google에서 제공하는 클라우드 기반 백엔드 서비스(BaaS: Backend as a Service)입니다.
React 앱에 서버 없이도 다음 기능을 손쉽게 추가할 수 있습니다:

| 기능                     | 설명                   |
| ---------------------- | -------------------- |
| **Authentication**     | 이메일·SNS 로그인 등 사용자 인증 |
| **Firestore Database** | 실시간 NoSQL 데이터베이스     |
| **Storage**            | 이미지, 파일 업로드 저장소      |
| **Hosting**            | 정적 웹앱 배포             |
| **Analytics**          | 사용자 행동 분석            |

> 이번 프로젝트에서는 **Auth + Firestore + Storage** 세 가지 핵심 기능을 중심으로 실습합니다.

---

## 🧩 4.2 Firebase 프로젝트 생성 절차

### 🔹 1단계: Firebase Console 접속

👉 [https://console.firebase.google.com](https://console.firebase.google.com) 접속
→ “프로젝트 추가” 버튼 클릭

### 🔹 2단계: 프로젝트 생성

1. 프로젝트 이름 입력 → 예: `mcard-app`
2. Google Analytics는 선택사항 (처음엔 비활성화해도 괜찮습니다)
3. “프로젝트 생성” 클릭
   → 약 30초 후 새 Firebase 프로젝트가 생성됩니다.

### 🔹 3단계: Web 앱 등록

1. “웹 앱 추가” 클릭
2. 앱 이름 입력 → 예: `mcard-react`
3. Firebase SDK 설정 코드가 표시됩니다.

```js
// 예시 SDK 구성 (환경변수로 관리 추천)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mcard-app.firebaseapp.com",
  projectId: "mcard-app",
  storageBucket: "mcard-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};
```

📄 `.env.local` 파일에 아래처럼 추가해둡니다:

```
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=mcard-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mcard-app
REACT_APP_FIREBASE_STORAGE_BUCKET=mcard-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1234567890
REACT_APP_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

> ⚠️ 주의: 이 파일은 **절대 GitHub에 업로드하지 않도록 `.gitignore`에 반드시 추가!**

---

## 🧱 4.3 Firebase SDK 설치 및 초기화

프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
yarn add firebase
```

📄 `src/firebase/firebaseConfig.ts` 파일을 생성합니다.

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

이제 React 앱 어디서든 `auth`, `db`, `storage`를 import해 사용할 수 있습니다 ✅

---

## 🔐 4.4 Firebase Authentication (회원가입 / 로그인)

### 1️⃣ 이메일 회원가입

📄 `src/api/auth.ts`

```ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export async function signup(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}
```

### 2️⃣ 로그인 상태 확인

Firebase는 인증 상태를 자동으로 감시할 수 있습니다.

```ts
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('로그인 상태:', user.email);
  } else {
    console.log('로그아웃됨');
  }
});
```

### 💡 팁: 커스텀 Hook으로 관리하기

📄 `src/hooks/useAuth.ts`

```ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return { user };
}
```

> 이제 `const { user } = useAuth();` 형태로 로그인 상태를 전역에서 활용할 수 있습니다.

---

## 🗄️ 4.5 Firestore Database (데이터 저장 / 조회)

Firestore는 **문서(Document)** 기반의 NoSQL 데이터베이스입니다.
데이터는 다음 구조로 저장됩니다.

```
컬렉션(collection)
 └─ 문서(document)
     └─ 필드(field)
```

예: 카드 신청 내역을 `applications` 컬렉션에 저장한다고 가정합니다.

### 1️⃣ 데이터 추가 (Create)

```ts
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function addApplication(data: any) {
  const docRef = await addDoc(collection(db, 'applications'), data);
  console.log('신청 완료! ID:', docRef.id);
}
```

---

### 2️⃣ 데이터 조회 (Read)

```ts
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function getApplications() {
  const snapshot = await getDocs(collection(db, 'applications'));
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
}
```

---

### 3️⃣ 데이터 수정 (Update)

```ts
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function updateApplication(id: string, status: string) {
  const docRef = doc(db, 'applications', id);
  await updateDoc(docRef, { status });
}
```

---

### 4️⃣ 데이터 삭제 (Delete)

```ts
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export async function deleteApplication(id: string) {
  await deleteDoc(doc(db, 'applications', id));
}
```

---

## 🔄 4.6 Firestore 실시간 동기화 (onSnapshot)

Firestore의 가장 큰 장점은 **데이터 변경을 실시간으로 감지** 할 수 있다는 점입니다.

```ts
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export function subscribeApplications(callback: (data: any[]) => void) {
  const q = collection(db, 'applications');
  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(apps);
  });
}
```

React 컴포넌트에서 사용 예시 👇

```tsx
import { useEffect, useState } from 'react';
import { subscribeApplications } from '../api/firestore';

function ApplicationList() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeApplications(setApps);
    return unsubscribe;
  }, []);

  return (
    <ul>
      {apps.map((app) => (
        <li key={app.id}>{app.userName} - {app.status}</li>
      ))}
    </ul>
  );
}
```

✅ 변경이 발생하면 자동으로 화면이 업데이트됩니다.
(별도의 새로고침 없이 실시간 동기화!)

---

## 🔒 4.7 Firestore 보안 규칙 설정

Firestore는 기본적으로 “모두 접근 가능” 상태이므로,
실제 프로젝트에서는 반드시 **보안 규칙(Security Rules)** 을 설정해야 합니다.

Firebase Console → Firestore Database → “규칙(Rules)” 탭에서 아래 설정을 적용합니다:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 읽기/쓰기 가능
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> ⚠️ 테스트 단계에서는 `allow read, write: if true;`로 설정할 수 있지만,
> 반드시 배포 전에는 인증 기반 규칙으로 수정해야 합니다.

---

## 🖼️ 4.8 Firebase Storage (이미지 / 파일 업로드)

이미지나 첨부 파일을 저장하려면 Storage를 사용합니다.

### 1️⃣ 업로드

```ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';

export async function uploadImage(file: File) {
  const storageRef = ref(storage, `images/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}
```

---

### 2️⃣ React 컴포넌트에서 사용 예시

```tsx
import { useState } from 'react';
import { uploadImage } from '../api/storage';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    const uploadedUrl = await uploadImage(file);
    setUrl(uploadedUrl);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>업로드</button>
      {url && <img src={url} alt="uploaded" width="200" />}
    </div>
  );
}
```

✅ 파일이 업로드되면 Firebase Storage에 저장되고,
`getDownloadURL()`로 접근 가능한 이미지 URL을 받을 수 있습니다.

---

## ✅ 4.9 요약 정리

| 기능            | 사용 목적         | 주요 메서드                                                 |
| ------------- | ------------- | ------------------------------------------------------ |
| **Auth**      | 회원가입 / 로그인 관리 | `createUserWithEmailAndPassword`, `onAuthStateChanged` |
| **Firestore** | 실시간 데이터 저장소   | `addDoc`, `onSnapshot`, `updateDoc`                    |
| **Storage**   | 이미지·파일 업로드    | `uploadBytes`, `getDownloadURL`                        |
| **보안 규칙**     | 데이터 접근 제어     | `request.auth != null`                                 |
| **실시간 동기화**   | 변경사항 자동 반영    | `onSnapshot`                                           |

---

# 🧱 5. React 컴포넌트 설계 심화

> 이 챕터의 목적은 **재사용성·유지보수·성능·접근성**을 모두 고려한 컴포넌트 설계 방법을 배우는 것입니다.
> 교재에서 강조한 공통 컴포넌트(버튼, 입력, 텍스트 라벨, 레이아웃 등)를 **일관된 규칙** 으로 만들면 프로젝트 전체 품질이 올라갑니다.

---

## 5.1 Atomic Design(원자 디자인) 소개 — 개념과 적용

### 핵심 아이디어

* UI를 **작은 단위부터 큰 단위 순** 으로 계층화해서 설계합니다.

  * **Atom**: 더 이상 나눌 수 없는 기본 단위 (버튼, 텍스트, input)
  * **Molecule**: Atom을 조합한 작은 컴포넌트 (검색창: input + 버튼)
  * **Organism**: 여러 Molecule/Atom이 모인 복합 컴포넌트 (헤더, 카드 리스트)
  * **Template/Page**: Organism을 배치한 페이지 레이아웃

### 장점

* 재사용성 증가
* 테스트가 쉬움 (작은 단위부터 검증)
* 팀 간 역할 분리(디자인 ↔ 개발) 용이

### 프로젝트 구조 예시

```
src/
├─ components/
│  ├─ atoms/
│  │  ├─ Button/
│  │  ├─ Input/
│  │  └─ Text/
│  ├─ molecules/
│  │  ├─ SearchBar/
│  │  └─ FormRow/
│  ├─ organisms/
│  │  ├─ Header/
│  │  └─ CardList/
│  └─ templates/
│     └─ MainLayout/
```

---

## 5.2 컴포넌트 설계 원칙 (작을수록 좋다)

1. **단일 책임 원칙(SRP)**: 컴포넌트는 가능한 한 한 가지 책임만 갖는다.
2. **프레젠테이셔널(순수) 컴포넌트 vs 컨테이너 컴포넌트 분리**

   * Presentational: UI만 담당, props로 데이터/콜백 전달
   * Container: 데이터/비즈니스 로직 담당 (API 호출, state 관리)
3. **스타일/로직 분리**: 스타일은 `styled`(Emotion) 또는 css 모듈로 분리
4. **명확한 Props 인터페이스**: 필요한 prop만 최소한으로 노출
5. **Accessibility(접근성) 고려**: keyboard focus, aria 속성 등 포함

---

## 5.3 Props Drilling(프로퍼티 전달 지옥) 방지 전략

### 문제

깊은 컴포넌트 트리에서 상위컴포넌트의 데이터를 자식-자식-자식으로 계속 전달해야 하는 상황.

### 해결책(우선순위)

1. **State Colocation(상태의 근접 배치)**: 상태를 실제로 사용하는 가장 가까운 공통 조상으로 끌어올림.
2. **React Context**: 전역에 가깝게 공유해야 할 설정(테마, 인증정보, locale 등)에 사용.
3. **Custom Hooks**: 상태/로직을 훅으로 추출하면 여러 컴포넌트에서 재사용 가능.
4. **전역 상태관리 도구**: Recoil / Redux / Zustand — 복잡한 앱에서 사용.
5. **컴포지션(Composition)**: props 대신 children/렌더 프로프(RP)로 전달.

### 간단 예시 — Context 사용

```tsx
// AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

---

## 5.4 접근성(Accessibility) 고려 설계 (ARIA 포함)

### 기본 원칙

* 시맨틱 HTML을 우선 사용 (`<button>`, `<label>`, `<input>`, `<nav>`, `<main>`)
* 키보드 조작(탭 포커스, Enter/Space 작동) 확인
* 스크린리더용 레이블 제공(aria-label, aria-labelledby)
* 컬러 대비 고려(텍스트와 배경) — WCAG 준수 권장

### 자주 쓰는 ARIA 속성

* `aria-label` : 시각적으로 표시되지 않는 라벨 제공
* `aria-labelledby` : 라벨을 참조할 때 사용
* `aria-hidden="true"` : 보조기술에서 숨길 때
* `role` : 비시맨틱 엘리먼트의 역할 지정 (예: `role="dialog"`)

### 예: 접근성 좋은 버튼

```tsx
<button
  onClick={onClick}
  aria-pressed={isActive}
  aria-label={ariaLabel} // 스크린리더용 레이블
>
  {children}
</button>
```

---

## 5.5 실용 예제: Button, Input, TextLabel, FlexBox (TypeScript + Emotion)

> 아래 예제는 **실무 스타일 가이드** 를 반영한 기본형 공통 컴포넌트입니다.
> 각 컴포넌트는 **작고 재사용 가능** 하도록 설계되어 있으며, 접근성·테스트·스타일 옵션을 포함합니다.

### 공통 타입(유틸)

```ts
// src/components/atoms/types.ts
export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'ghost';
```

---

### 1) Button (Atom)

```tsx
// src/components/atoms/Button/Button.tsx
import React from 'react';
import styled from '@emotion/styled';
import { Size, Variant } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const StyledButton = styled.button<{ variant: Variant; size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  padding: ${({ size }) => (size === 'sm' ? '6px 10px' : size === 'lg' ? '14px 20px' : '10px 14px')};
  font-size: ${({ size }) => (size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px')};
  cursor: pointer;
  background: ${({ variant, theme }) =>
    variant === 'primary' ? theme.colors.primary : variant === 'secondary' ? theme.colors.secondary : 'transparent'};
  color: ${({ variant }) => (variant === 'ghost' ? '#333' : '#fff')};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, children, ...rest }) => {
  return (
    <StyledButton variant={variant} size={size} aria-busy={loading} {...rest}>
      {loading ? '로딩중...' : children}
    </StyledButton>
  );
};
```

**포인트**

* `aria-busy`로 스크린리더에게 로딩 상태 알림
* `loading` 상태로 내부 텍스트/스피너 대체 가능
* 테스트가 쉬운 텍스트 기반 렌더링

---

### 2) Input + TextLabel (Atom + Molecule)

```tsx
// src/components/atoms/TextLabel/TextLabel.tsx
import styled from '@emotion/styled';

export const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
`;

// src/components/atoms/Input/Input.tsx
import React from 'react';
import styled from '@emotion/styled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
}

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${({ hasError }) => (hasError ? '#dc3545' : '#ddd')};
  outline: none;
  &:focus {
    border-color: #2684ff;
    box-shadow: 0 0 0 4px rgba(38,132,255,0.12);
  }
`;

export const Input: React.FC<InputProps> = ({ label, error, id, ...rest }) => {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <StyledInput id={id} hasError={!!error} aria-invalid={!!error} {...rest} />
      {error && <div role="alert" style={{ color: '#dc3545', marginTop: 6 }}>{error}</div>}
    </div>
  );
};
```

**포인트**

* `Label`은 `htmlFor`로 input과 연결 (접근성 향상)
* `aria-invalid`, `role="alert"`로 에러를 보조기술에 알림

---

### 3) FlexBox (Layout Atom)

```tsx
// src/components/atoms/FlexBox/FlexBox.tsx
import styled from '@emotion/styled';

interface FlexProps {
  gap?: string;
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
  justify?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around';
  direction?: 'row' | 'column';
}

export const FlexBox = styled.div<FlexProps>`
  display: flex;
  gap: ${({ gap }) => gap || '0'};
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  flex-direction: ${({ direction }) => direction || 'row'};
`;
```

**포인트**

* 재사용 가능한 layout helper
* CSS 속성들을 prop으로 제어해 다양한 레이아웃에서 사용

---

## 5.6 컴포넌트 합성(Composition) 패턴

### Slot(Children) 패턴 — 복잡한 레이아웃을 단순화

```tsx
// Card.tsx
type CardProps = { title: string; children: React.ReactNode };

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
);

// 사용
<Card title="프로필">
  <ProfileSummary />
  <ProfileActions />
</Card>
```

### Render Props 패턴 — 동작/표현 분리

```tsx
<DataFetcher url="/api/data">
  {({ data, loading }) => (loading ? <Spinner /> : <List data={data} />)}
</DataFetcher>
```

---

## 5.7 성능 고려: 메모이제이션과 불필요 렌더링 방지

* `React.memo` 로 Props 변경이 없을 때 재렌더링 방지
* `useCallback` 으로 자식으로 전달하는 함수의 재생성 방지
* `useMemo` 로 값 계산 결과 캐싱

```tsx
const MemoButton = React.memo(Button);

const Parent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return <MemoButton onClick={handleClick}>증가</MemoButton>;
};
```

주의: 과도한 memo는 오히려 복잡도/메모리 증가를 초래하므로 프로파일링 후 적용.

---

## 5.8 테스트 및 문서화 권장

* **단위 테스트**: Jest + React Testing Library로 atom/molecule 테스트 (렌더링/aria 등)
* **스토리북(Storybook)**: 각 컴포넌트의 상태(variant, size, disabled 등)를 문서화
* **디자인 시스템 문서화**: colors, spacing, typography를 README 또는 Storybook에 정리

---

## 5.9 체크리스트 (컴포넌트 설계 시 확인할 것)

* [ ] 단일 책임 원칙을 지켰는가?
* [ ] props가 최소인가? (불필요한 props 제거)
* [ ] 외부 스타일 의존성이 적은가? (theme 사용 권장)
* [ ] 접근성(라벨, role, keyboard)이 고려되었는가?
* [ ] 테스트(렌더/인터랙션)가 가능한가?
* [ ] Prop drilling이 발생하면 state colocate/Context/Hook으로 해결했는가?
* [ ] 성능(불필요 렌더링) 검토: React.memo/useCallback/useMemo 적용 여부

---

### 마무리 노트

* **작은 컴포넌트(Atom)를 잘 만들면 프로젝트 전체가 편해집니다.**
* 처음엔 단순하게 시작하고, 필요해질 때 구조(Atomic 계층)와 최적화(메모이제이션, 전역 상태)를 적용하세요.
* 접근성은 부가 기능이 아니라 필수입니다 — 초기에 포함하면 비용이 적습니다.

---

# 🧭 6. 카드 상세 페이지 & 애니메이션

> 이 장에서는 React 앱의 카드 상세 화면을 구성하면서
> 자연스러운 **전환 애니메이션** 과 **UX 개선 요소(Skeleton UI)** 를 함께 구현합니다.
> 화려함보다는 “부드럽고 쾌적한 사용자 경험”이 목표입니다.

---

## 🎯 6.1 카드 상세 페이지의 역할

**카드 상세 페이지(CardDetail Page)** 는 사용자가 목록에서 카드를 클릭했을 때
선택한 카드의 정보(혜택, 연회비, 신청버튼 등)를 보여주는 화면입니다.

### 기본 구성 예시

```
카드 목록 (CardList)
 └─ 카드 상세 페이지 (CardDetail)
     ├─ 카드 이미지
     ├─ 카드 이름 / 브랜드 / 연회비
     ├─ 혜택 목록 (포인트 적립, 할인 등)
     ├─ 신청하기 버튼
```

> 교재에서는 단순한 정보 나열이 아닌,
> “카드 클릭 → 상세화면 슬라이드 → 로딩 애니메이션 → 정보 표시”
> 형태로 **전환 애니메이션** 을 구현하는 것이 포인트입니다.

---

## 🌀 6.2 애니메이션 적용 시 성능 고려점

### ❗ DOM 애니메이션의 비용

애니메이션은 잘못 적용하면 **Reflow(레이아웃 재계산)** 를 유발해 성능 저하의 원인이 됩니다.
다음 표는 CSS 속성별 성능 영향을 정리한 것입니다.

| 속성                              | 영향           | 설명                                     |
| ------------------------------- | ------------ | -------------------------------------- |
| **transform**                   | ✅ 매우 효율적     | GPU 가속 가능 (translate, scale, rotate 등) |
| **opacity**                     | ✅ 효율적        | 페인트만 변경 (레이아웃 영향 없음)                   |
| **width / height / top / left** | ⚠️ 비효율적      | Layout 재계산 발생                          |
| **box-shadow / border-radius**  | ⚠️ 경우에 따라 느림 | Paint 과정 증가                            |

> **정리:** React에서 애니메이션을 적용할 때는
> `transform`과 `opacity` 중심으로 처리하는 것이 가장 안전합니다.

---

## ⚙️ 6.3 React TransitionGroup 개요

**React Transition Group** 은 React 컴포넌트의 **등장·퇴장 시점**을 제어하기 위한 공식 라이브러리입니다.

```bash
yarn add react-transition-group
```

### 기본 개념

| 컴포넌트                | 역할                   |
| ------------------- | -------------------- |
| `<CSSTransition>`   | CSS 클래스 기반 애니메이션 제어  |
| `<TransitionGroup>` | 여러 개의 자식 컴포넌트를 전환 관리 |

---

### 예시: 카드 상세 모달 진입 애니메이션

```tsx
import { CSSTransition } from 'react-transition-group';
import './CardDetail.css';

function CardDetail({ show, onClose }) {
  return (
    <CSSTransition in={show} timeout={300} classNames="detail" unmountOnExit>
      <div className="card-detail">
        <button onClick={onClose}>닫기</button>
        <img src="/card.png" alt="카드 이미지" />
        <h2>프리미엄 카드</h2>
        <p>혜택: 3% 적립 / 연회비 10,000원</p>
      </div>
    </CSSTransition>
  );
}
```

📄 `CardDetail.css`

```css
.detail-enter {
  opacity: 0;
  transform: translateY(30px);
}
.detail-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-in-out;
}
.detail-exit {
  opacity: 1;
}
.detail-exit-active {
  opacity: 0;
  transform: translateY(30px);
  transition: all 300ms ease-in-out;
}
```

✅ 결과

* 카드 상세창이 부드럽게 아래에서 올라옴
* 닫을 때도 자연스럽게 사라짐

> `TransitionGroup`은 여러 카드 상세 컴포넌트를 동시에 관리할 때 사용합니다.
> (예: 카드 목록에서 여러 항목이 동시에 변경될 때)

---

## 💫 6.4 Framer Motion 활용 개요

**Framer Motion** 은 React용 고급 애니메이션 라이브러리입니다.
TransitionGroup보다 간결하고,
**물리 기반(스프링) 모션, 드래그, 제스처** 등도 지원합니다.

```bash
yarn add framer-motion
```

### 간단한 Fade-In 예시

```tsx
import { motion } from 'framer-motion';

export default function CardDetail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <img src="/card.png" alt="카드 이미지" />
      <h2>프리미엄 카드</h2>
      <p>혜택: 스타벅스 3% 적립</p>
    </motion.div>
  );
}
```

### 모션 컨테이너를 통한 페이지 전환

```tsx
import { AnimatePresence, motion } from 'framer-motion';

function AppRouter({ currentPage }) {
  return (
    <AnimatePresence mode="wait">
      {currentPage === 'detail' && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4 }}
        >
          <CardDetail />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

✅ 효과

* 페이지 간 자연스러운 슬라이드 전환
* 상태 기반 라우팅 애니메이션이 가능
* 모션 곡선, duration, easing 등을 쉽게 조절

---

## 🧠 6.5 Skeleton UI로 UX 개선

### Skeleton UI란?

> 콘텐츠가 로드되기 전, 화면의 **“자리만 표시하는 회색 블록”** 을 보여주는 기법입니다.
> 사용자에게 **“지연이 아니라 준비 중”** 이라는 인상을 주어 체감 속도를 높입니다.

---

### 1️⃣ 기본 형태

```tsx
import styled from '@emotion/styled';

const SkeletonBox = styled.div`
  background-color: #eee;
  border-radius: 8px;
  height: ${({ height }: { height?: string }) => height || '20px'};
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

export const CardSkeleton = () => (
  <div>
    <SkeletonBox height="180px" />
    <SkeletonBox height="20px" style={{ marginTop: 10, width: '60%' }} />
    <SkeletonBox height="20px" style={{ marginTop: 6, width: '40%' }} />
  </div>
);
```

📍 사용 예시

```tsx
function CardList({ cards, loading }) {
  if (loading) {
    return (
      <div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <ul>
      {cards.map((card) => (
        <li key={card.id}>{card.name}</li>
      ))}
    </ul>
  );
}
```

✅ 장점

* 로딩 중에도 “비어있는 느낌”이 줄어듦
* 사용자는 콘텐츠가 곧 표시될 것을 직관적으로 인식

---

## ⚡ 6.6 성능 최적화 체크리스트 (애니메이션 포함)

| 항목                    | 설명                                              | 권장 |
| --------------------- | ----------------------------------------------- | -- |
| GPU 사용                | `transform`, `opacity` 중심                       | ✅  |
| CSS Transition vs JS  | CSS로 처리 가능하면 CSS 우선                             | ✅  |
| requestAnimationFrame | JS 애니메이션 시 필수                                   | ⚙️ |
| Reflow 최소화            | DOM 크기 변경 대신 transform 사용                       | ✅  |
| 이미지 최적화               | WebP, lazy-loading                              | ✅  |
| Skeleton UI           | 로딩 UX 향상                                        | ✅  |
| 애니메이션 제한              | reduced motion 환경 지원 (`prefers-reduced-motion`) | ♿  |

### 접근성 대응 예시

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

> 모션이 불편한 사용자에게 애니메이션을 자동 비활성화합니다.

---

## 🪄 6.7 정리

| 기능                      | 핵심 포인트                        |
| ----------------------- | ----------------------------- |
| **TransitionGroup**     | 컴포넌트의 마운트/언마운트 시 애니메이션 적용     |
| **Framer Motion**       | 자연스러운 스프링 기반 모션 / 페이지 전환 지원   |
| **transform + opacity** | GPU 가속을 통한 성능 최적화             |
| **Skeleton UI**         | 로딩 중 사용자 만족도 향상               |
| **접근성 고려**              | `prefers-reduced-motion` 등 지원 |

---

### 💬 실무 팁

* 애니메이션은 **의미 있는 피드백** 에만 사용하자.
  (버튼 클릭, 화면 전환 등 사용자 행동과 직접 연결된 경우)
* 시각적 효과보다 **일관된 속도와 부드러움** 이 중요하다.
* 초당 60fps를 목표로, 브라우저 DevTools의 Performance 탭에서
  **Recalculate Style / Layout / Paint / Composite** 시간을 꼭 확인해보세요.

---

# 🧰 7. React 최적화 심화

> 이 장에서는 **React 애플리케이션의 성능 병목을 찾고 개선하는 방법** 을 배웁니다.
> 빠른 로딩 속도, 부드러운 인터랙션, 안정적인 렌더링은 사용자 만족도의 핵심 요소입니다.
> 코드 성능뿐 아니라 **UX 성능(보이는 속도)** 도 함께 고려합니다.

---

## ⚙️ 7.1 SPA vs MPA — 렌더링 구조 이해하기

React로 만든 웹앱은 일반적으로 **SPA(Single Page Application)** 방식입니다.
이 구조를 먼저 이해해야 최적화 포인트를 정확히 잡을 수 있습니다.

| 구분    | MPA (Multi Page App) | SPA (Single Page App) |
| ----- | -------------------- | --------------------- |
| 구성    | 페이지마다 HTML 개별 요청     | 하나의 HTML + JS로 라우팅 제어 |
| 로딩 방식 | 새 페이지마다 전체 리로드       | 최초 1회 로드 후 라우터로 전환    |
| 장점    | SEO 친화적, 초기 로드 빠름    | 부드러운 전환, 상태 유지        |
| 단점    | 잦은 리로딩, 중복 리소스       | 초기 JS 번들 크기 큼         |
| 대표 예시 | 네이버, 다음 등 전통 포털      | React, Vue 기반 SPA     |

✅ **핵심 포인트:**
SPA의 최대 약점은 “초기 로딩 속도(First Load JS)”입니다.
→ 번들 분할, 코드 스플리팅, 캐싱 전략으로 보완합니다.

---

## 🧩 7.2 트리쉐이킹(Tree Shaking) 이론 및 Webpack 설정

### 💡 개념

Tree Shaking은 **사용하지 않는 코드(dead code)** 를 자동으로 제거하여
JS 번들을 작게 만드는 기술입니다.

```ts
// example.ts
export const used = () => console.log('사용 중');
export const unused = () => console.log('미사용');

// index.ts
import { used } from './example';
used(); // unused()는 번들에서 제거됨
```

Webpack, Rollup, Vite 등 대부분의 빌드 도구는 **ES Module(ESM)** 기반에서 트리쉐이킹을 지원합니다.

---

### ⚙️ Webpack 설정 예시

📄 `webpack.config.js`

```js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true, // 트리쉐이킹 활성화
    minimize: true, // 코드 난독화 및 압축
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
```

**Tips**

* `import * as` 대신 개별 import (`import { Button }`) 사용
* dynamic import(`import()`) 로 코드 분할
* CommonJS(`require`) 문법은 트리쉐이킹 불가

---

### 📊 실습 방법: 번들 분석

```bash
yarn add -D webpack-bundle-analyzer
```

📄 `package.json`

```json
"scripts": {
  "analyze": "webpack --profile --json > stats.json && webpack-bundle-analyzer stats.json"
}
```

실행하면 라이브러리별 번들 크기를 시각적으로 확인할 수 있습니다.

> React, Firebase, Lodash 등 불필요하게 큰 패키지를 바로 확인 가능!

---

## 🧱 7.3 Layout Shift (CLS: Cumulative Layout Shift)

### ❗ 개념

**Layout Shift** 는 화면의 요소가 로딩 중에 **밀리거나 흔들리는 현상** 입니다.
Google의 Core Web Vitals 지표 중 하나로, 시각적 안정성을 평가합니다.

예시:

* 이미지 크기가 미리 지정되지 않아 화면이 아래로 밀림
* 웹폰트 로드 시 글자가 깜빡이며 변경
* 광고 배너 삽입으로 콘텐츠가 이동

---

### 💥 나쁜 예시

```html
<img src="card.png" />
```

화면이 렌더링된 후 이미지가 늦게 로드되면,
해당 요소가 차지할 공간을 몰라 다른 콘텐츠가 밀려납니다.

---

### ✅ 해결 코드

```html
<!-- 이미지 크기를 미리 지정 -->
<img src="card.png" width="300" height="200" />

<!-- 혹은 CSS aspect-ratio 사용 -->
<div class="img-wrapper">
  <img src="card.png" />
</div>

<style>
.img-wrapper {
  aspect-ratio: 3 / 2;
  width: 100%;
  overflow: hidden;
}
</style>
```

📌 **추가 팁**

* 폰트 로딩: `font-display: swap;`
* 광고/외부 콘텐츠: 미리 고정된 공간 확보
* Skeleton UI로 자리 예약

---

## 🧠 7.4 병목 코드 제거 — Performance Tab 활용법

### 🪛 병목이란?

React는 단일 스레드(JavaScript 메인 스레드) 위에서 동작합니다.
즉, 무거운 계산이 있으면 브라우저 렌더링이 **잠시 멈추는 현상(Freeze)** 이 발생합니다.

---

### 1️⃣ Chrome DevTools → Performance 탭

* **Record 버튼** 클릭 후 사용자 동작(스크롤, 클릭 등) 실행
* 완료 후 **Main Thread** 타임라인에서 ** 빨간 블록(오래 걸린 함수)** 확인
* `Recalculate Style`, `Layout`, `Paint` 구간이 긴 경우 → 렌더링 병목

---

### 2️⃣ React DevTools → Profiler

* React 컴포넌트별 렌더링 시간 확인
* 자주 리렌더링되는 컴포넌트를 찾아 `React.memo` 또는 `useMemo`로 감싸기

---

### 3️⃣ 개선 방법 예시

```tsx
// ❌ 비효율적인 예시
const List = ({ items }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{heavyCalc(item)}</li>
    ))}
  </ul>
);

// ✅ 개선 (useMemo로 캐싱)
const List = ({ items }) => {
  const renderedItems = useMemo(
    () => items.map((item) => <li key={item.id}>{heavyCalc(item)}</li>),
    [items]
  );
  return <ul>{renderedItems}</ul>;
};
```

> 연산 비용이 높은 함수(정렬, 필터링, 변환 등)는 `useMemo`,
> 이벤트 핸들러는 `useCallback`,
> 리렌더링 빈도 높은 UI는 `React.memo`를 사용하세요.

---

## 🚦 7.5 우선순위 렌더링 (Rendering Priority)

### 💡 개념

모든 콘텐츠를 한꺼번에 렌더링하지 않고,
사용자에게 **중요한 영역(above the fold)** 을 먼저 렌더링하는 기법입니다.

---

### 예시: Lazy Loading (지연 로드)

```tsx
import React, { Suspense, lazy } from 'react';
const CardDetail = lazy(() => import('./CardDetail'));

export default function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <CardDetail />
    </Suspense>
  );
}
```

✅ 효과

* 초기 번들 크기 감소
* 사용자가 실제 보는 부분만 즉시 렌더링
* 뒤쪽 컴포넌트는 네트워크 여유 시 비동기로 로드

---

### 예시: 이미지 지연 로드

```html
<img src="card.jpg" loading="lazy" alt="카드 이미지" />
```

* `loading="lazy"` 속성으로 화면에 보이기 전까지 이미지 로딩 지연
* 특히 카드 목록처럼 이미지가 많은 페이지에서 효과적

---

## 📊 7.6 성능 측정 핵심 지표 (Core Web Vitals)

| 지표                                 | 의미                | 목표 값    |
| ---------------------------------- | ----------------- | ------- |
| **LCP (Largest Contentful Paint)** | 메인 콘텐츠 표시까지 걸린 시간 | ≤ 2.5초  |
| **FID (First Input Delay)**        | 첫 사용자 입력 반응 지연    | ≤ 100ms |
| **CLS (Cumulative Layout Shift)**  | 시각적 안정성           | ≤ 0.1   |
| **TTI (Time To Interactive)**      | 전체 페이지 반응 가능 시점   | ≤ 5초    |

👉 [Lighthouse](https://web.dev/measure) 또는 Chrome DevTools Audits 탭에서 측정 가능

---

## 🧩 7.7 React 앱 최적화 체크리스트

| 구분           | 점검 항목          | 해결 방법                                  |
| ------------ | -------------- | -------------------------------------- |
| **렌더링**      | 컴포넌트 불필요한 재렌더링 | `React.memo`, `useCallback`, `useMemo` |
| **상태관리**     | 전역 상태 남용       | 필요한 곳에만 Context/Hook 사용                |
| **코드 크기**    | 번들 크기 과도       | 코드 스플리팅, dynamic import, 트리쉐이킹         |
| **이미지/폰트**   | 용량 큼           | WebP, preload, font-display: swap      |
| **레이아웃 안정성** | CLS 발생         | 이미지 크기 지정, aspect-ratio                |
| **UX 로딩**    | 느린 체감속도        | Skeleton UI, Suspense fallback         |
| **성능 측정**    | 주관적 판단         | Lighthouse, Performance Tab 활용         |

---

## 🚀 7.8 정리

| 개념           | 핵심 포인트                                      |
| ------------ | ------------------------------------------- |
| SPA vs MPA   | SPA는 부드럽지만 초기 JS 번들 최적화 필요                  |
| 트리쉐이킹        | 불필요한 코드 제거로 번들 최소화                          |
| Layout Shift | 이미지·폰트 공간 확보로 시각 안정성 향상                     |
| 병목 제거        | useMemo/useCallback, React.memo             |
| 우선 렌더링       | Lazy Loading, Suspense, Loading Placeholder |

---

### 💬 실무 팁

* “빠르다”의 기준은 **사용자 눈에 보이는 속도** 입니다.
  즉, 실제 로딩 시간보다 **지각된 속도(perceived performance)** 를 개선하세요.
* 초기 화면은 최소한의 구성(above-the-fold)만 빠르게 보여주고,
  나머지는 **지연 로드(lazy loading)** 로 천천히 불러옵니다.
* 정적 자원은 CDN 캐싱을 적극 활용하세요.

---

# 🚀 8. 배포 & 운영 자동화 (Deployment & CI/CD)

> 이 장에서는 **Vercel** 을 주 배포 대상(교재 기준)으로 삼고, CLI·Git 연동·GitHub Actions 자동 배포 예시와 함께 **환경변수 관리**, **Firebase Hosting과의 차이**, 그리고 **배포 후 Lighthouse로 성능 측정** 까지 실무 팁을 담았습니다.
> 따라 하기 쉬운 명령어, 설정 스냅샷, 체크리스트를 포함합니다.

---

## 📦 8.1 Vercel 개요 (간단 요약)

* Vercel은 정적 사이트와 프레임워크(Next.js 등)에 최적화된 플랫폼으로 **자동 빌드·배포(브랜치별 Preview)**, 글로벌 엣지 CDN, 서버리스 함수(Edge Functions)를 제공합니다.
* GitHub/GitLab/Bitbucket 연동으로 PR마다 Preview 배포가 자동 생성됩니다.
* 무료 티어로도 빠른 시작 가능하나 트래픽·빌드 제한이 있으니 운영 규모에 따라 요금제 검토 필요.

---

## ⚙️ 8.2 Vercel — 빠른 시작(웹 UI)

1. Vercel 계정 생성(또는 GitHub 연동)
2. “New Project” → Git 리포지토리 선택(권한 허용)
3. Framework 자동 인식(React CRA / Vite / Next 등)
4. 빌드 설정 확인

   * Build Command: `yarn build` 또는 `npm run build`
   * Output Directory: `build` (CRA), `dist` (Vite), `.next` (Next.js)
5. Deploy 클릭 → Preview URL 생성, Production 배포 지정 브랜치(main/master) 설정

> 장점: UI로 매우 간단. PR 열자마자 Preview가 생기므로 협업에 유리.

---

## 🧰 8.3 Vercel CLI로 배포 (단계별)

### 1) Vercel CLI 설치

```bash
# npm
npm i -g vercel

# or yarn
yarn global add vercel
```

### 2) 로그인

```bash
vercel login
# 이메일을 입력하면 확인 메일 또는 OAuth 흐름으로 로그인
```

### 3) 초기 설정 (프로젝트 연결)

프로젝트 루트에서:

```bash
vercel
```

* 처음 실행시 프로젝트 이름, 팀, scope, 프로젝트 설정(프레임워크/빌드 출력 경로)을 물어봅니다.
* 한 번 설정하면 `.vercel` 디렉터리에 설정이 저장됩니다.

### 4) 로컬에서 임시(Preview) 배포

```bash
vercel --prod=false
# 또는 그냥 vercel (기본은 Preview)
```

### 5) 프로덕션 배포

```bash
vercel --prod
```

### 6) 환경변수(Secrets) 설정(로컬 대신 Vercel에 저장)

```bash
# 환경변수 저장 (예시)
vercel env add REACT_APP_API_URL production
# prompt에 따라 값 입력
```

> CLI로 배포하면 로그가 터미널에 나오므로 문제 원인 추적이 쉽습니다.

---

## 🔐 8.4 Vercel 환경변수 설정 (UI & CLI 핵심)

### 로컬 개발용

* `.env.local`에 개발환경 변수를 넣고 `.gitignore`에 추가
* CRA: 변수명은 `REACT_APP_` 접두사 필요 (`REACT_APP_API_URL=...`)
* Vite: `VITE_` 접두사 사용 (`VITE_API_URL=...`)
* Next.js: `NEXT_PUBLIC_` 접두사(클라이언트 노출용)

### Vercel (UI)

* Project → Settings → Environment Variables → 추가
* Environment: `Preview` / `Production` 구분해서 등록
* 민감한 값(토큰, 키)은 절대 리포지토리에 커밋하지 말 것

### Vercel (CLI)

* `vercel env add NAME production` 등으로 추가
* `vercel env pull .env.local` 로 Vercel에 저장된 env를 로컬로 받아올 수 있음 (주의: 보안)

---

## 🤖 8.5 CI/CD → GitHub Actions 자동 배포 예시

> 방법 A: Vercel의 GitHub 연동(가장 간단) — 리포 push/PR 시 자동 배포
> 방법 B: GitHub Actions로 명시적 배포 제어(빌드·테스트→vercel --prod) — 아래 예시

### 1) Vercel Token 생성

* Vercel Dashboard → Settings → Tokens → New Token
* 이 토큰을 GitHub Secrets에 `VERCEL_TOKEN`으로 저장

### 2) GitHub Secrets 추가

* `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` (Vercel에서 확인 가능)
* 또는 `VERCEL_TOKEN` 과 `VERCEL_PROJECT`(name)만으로도 가능

### 3) `.github/workflows/deploy.yml` 예시

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Build
        run: yarn build
      - name: Vercel Action
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

> 사용 가능한 Vercel 액션은 여러 가지가 있으니 조직 정책에 맞춰 선택하세요.

---

## 🔁 8.6 Preview(프리뷰) 배포 & 롤백

* **Preview Deployments**: PR마다 고유 URL이 생기므로 QA/디자이너가 바로 확인 가능
* **Rollback**: Vercel Dashboard에서 이전 배포로 롤백 가능(또는 Git revert → 배포)
* **Promotion**: Preview → Production 승격 워크플로는 수동 또는 CI에 의해 가능

---

## 🆚 8.7 Firebase Hosting과 비교 (언제 어떤 걸 선택할까?)

| 항목               | Vercel                                      | Firebase Hosting                 |
| ---------------- | ------------------------------------------- | -------------------------------- |
| 배포 대상            | 정적 + 서버리스(Functions/Edge) · SSR(Next.js) 우수 | 정적 호스팅 + Firebase Functions      |
| CDN              | 글로벌 엣지 CDN 자동                               | 글로벌 CDN 제공                       |
| Preview & Branch | PR마다 Preview 자동                             | GitHub 연동 통한 Preview 가능          |
| Functions        | Edge Functions / Serverless                 | Cloud Functions (Node)           |
| SPA rewrite      | 자동/설정 가능                                    | `rewrites`로 index.html로 포워딩 필요   |
| 무료 티어            | 제공(빌드제한 있음)                                 | 제공(쿼터/요금제 상이)                    |
| 운영 편의성           | 프레임워크 최적화(Next.js)                          | Firebase 생태계(Realtime, Auth)와 밀접 |

**요약**

* **Vercel**: 프레임워크(특히 Next.js) 기반 프로젝트, 간단한 배포·Preview·Edge가 필요할 때 우수
* **Firebase Hosting**: Firebase 서비스(Functions, Firestore 등) 중심의 앱, 단순 정적 호스팅 + 서버리스가 필요할 때 적합

---

## 🔎 8.8 SPA 배포 시 주의: Rewrite 설정 (Firebase 예시)

**Firebase (firebase.json)**: SPA는 모든 경로를 `index.html`로 rewrite 해야 라우팅이 정상 동작합니다.

```json
{
  "hosting": {
    "public": "build",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Vercel은 프레임워크에 따라 자동으로 리다이렉트/rewrites를 처리하거나 `vercel.json`로 커스터마이즈 할 수 있습니다.

---

## 📈 8.9 배포 후 성능 측정 — Lighthouse 사용법

### 방법 A: Chrome DevTools (가장 쉬움)

1. Chrome에서 배포된 Production URL 열기
2. 개발자 도구 → `Lighthouse` 탭 선택
3. Device: Mobile/Desktop 선택 → Generate report
4. **주요 항목 확인**: Performance, Accessibility, Best Practices, SEO, PWA

### 방법 B: Lighthouse CLI (자동화 가능)

```bash
# 설치
npm i -g lighthouse

# 실행 (예: mobile)
lighthouse https://your-site.vercel.app --preset=mobile --output html --output-path ./report.html
```

### 핵심 지표 (우선순위)

* **LCP (Largest Contentful Paint)** — 메인 콘텐츠 렌더링 시간 (≤ 2.5s 목표)
* **CLS (Cumulative Layout Shift)** — 레이아웃 안정성 (≤ 0.1 목표)
* **INP / FID** — 입력 지연 (≤ 100ms 목표)
* **Performance Score** — 종합 점수(개선 포인트 항목 확인)

### 개선할 점이 나왔을 때

* 큰 JS 번들 → 코드 스플리팅 / 트리쉐이킹
* 느린 이미지 → WebP/AVIF, `loading="lazy"`, CDN 최적화
* 폰트 지연 → `font-display: swap`, 폰트 프리로드(preload)
* CLS → 이미지에 width/height, aspect-ratio, skeleton 적용

---

## ✅ 8.10 배포 전/후 체크리스트 (실무용)

### 배포 전

* [ ] `yarn build` 성공 및 warnings 확인
* [ ] `.env.production`(또는 Vercel env) 정상 설정
* [ ] Sentry / 모니터링 DSN 등록(운영용)
* [ ] robots.txt / sitemap.xml 설정 (SEO)
* [ ] Caching 헤더 및 CSP(Content Security Policy) 검토

### 배포 후

* [ ] Preview URL에서 UI / 폼 / 인증 흐름 점검
* [ ] Production 배포 후 Lighthouse 스캔 (성능 리포트 저장)
* [ ] 로그(서버리스 함수, Sentry) 확인 — 에러 존재 여부
* [ ] 모니터링(Analytics) 정상 수집 여부 확인
* [ ] 캐시 무효화 필요 시(정적 자원 변경) CDN 캐시 정책 확인

---

## 🔄 8.11 운영 자동화 확장 아이디어

* **Performance Budgets**: PR 빌드 시 번들 용량 제한(예: 200KB) 초과하면 실패시키기
* **Pre-deploy tests**: Cypress / Playwright end-to-end 테스트를 CI에서 자동 실행
* **Canary / Blue-Green** 배포 전략: 대형 서비스에서 고가용성 확보
* **Auto rollback**: 심각 에러 감지 시 자동 롤백 스크립트(모니터링 연동)

---

## 마무리 노트

* **Vercel** 은 빠르게 배포하고 Preview를 통해 협업 검증하기 좋습니다.
* **환경변수는 절대 코드 저장소에 평문 커밋하지 말고**, Vercel Secrets/GitHub Secrets 등 보안된 저장소를 사용하세요.
* **배포 후에는 항상 Lighthouse로 성능을 측정** 하고, Core Web Vitals를 개선하는 작업을 루틴화하세요.

---

