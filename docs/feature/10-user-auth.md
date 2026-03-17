# Feature: 사용자 인증

Supabase Auth를 사용한 사용자 인증 및 프로필 관리.
비로그인 상태에서도 기본 피팅 기능은 사용 가능하며, 로그인 시 데이터 동기화/히스토리 기능이 활성화된다.

---

## Background

```gherkin
Given 사용자가 가상 피팅 웹앱에 접속한다
```

---

## 비로그인 사용

### Scenario: 비로그인 상태에서 기본 기능 사용

```gherkin
Given 사용자가 로그인하지 않았다
Then 다음 기능을 사용할 수 있다:
  | 기능             | 사용 가능 |
  | 3D 씬 렌더링     | O        |
  | 아바타 체형 조절  | O        |
  | 의류 카탈로그 조회 | O        |
  | 의류 착용/교체    | O        |
  | 색상 변경        | O        |
  | 치수 로컬 저장    | O        |
And 다음 기능은 제한된다:
  | 기능             | 사용 가능 |
  | 피팅 히스토리 동기화 | X     |
  | 다기기 치수 동기화  | X      |
  | 즐겨찾기 서버 저장  | X      |
```

---

## 회원가입

### Scenario: 이메일 회원가입

```gherkin
Given 사용자가 회원가입 폼을 열었다
When 이메일과 비밀번호를 입력하고 제출한다
Then Supabase Auth signUp API가 호출된다
And 이메일 확인 메일이 발송된다
And "이메일을 확인해주세요" 안내가 표시된다
```

### Scenario: 이메일 확인 완료

```gherkin
Given 사용자가 이메일의 확인 링크를 클릭했다
When 웹앱으로 리다이렉트된다
Then user_profiles 테이블에 프로필이 생성된다
And 로그인 상태가 된다
And "회원가입이 완료되었습니다" 메시지가 표시된다
```

### Scenario: 소셜 로그인 (Google)

```gherkin
Given 사용자가 "Google로 로그인" 버튼을 클릭한다
When Google OAuth 인증이 완료된다
Then Supabase Auth가 JWT 토큰을 발급한다
And user_profiles 테이블에 프로필이 생성된다 (최초 시)
And 로그인 상태가 된다
```

---

## 로그인

### Scenario: 이메일 로그인

```gherkin
Given 사용자가 로그인 폼을 열었다
When 올바른 이메일과 비밀번호를 입력한다
Then Supabase Auth signInWithPassword API가 호출된다
And JWT 토큰이 발급된다
And 로그인 상태가 된다
And 사용자 닉네임이 헤더에 표시된다
```

### Scenario: 잘못된 비밀번호

```gherkin
Given 사용자가 로그인 폼을 열었다
When 잘못된 비밀번호를 입력한다
Then "이메일 또는 비밀번호가 올바르지 않습니다" 오류가 표시된다
And 로그인 상태로 전환되지 않는다
```

### Scenario: 세션 복원

```gherkin
Given 사용자가 이전에 로그인한 적이 있다
And JWT 토큰이 유효하다
When 웹앱에 재접속한다
Then Supabase Auth가 세션을 자동 복원한다
And 로그인 상태가 유지된다
```

### Scenario: 세션 만료

```gherkin
Given 사용자가 로그인되어 있다
And JWT 토큰이 만료되었다
When API 요청이 발생한다
Then Supabase Auth가 refresh token으로 토큰을 갱신한다
And 갱신 실패 시 로그아웃 처리되고 로그인 안내가 표시된다
```

---

## 로그아웃

### Scenario: 로그아웃

```gherkin
Given 사용자가 로그인되어 있다
When 사용자가 "로그아웃" 버튼을 클릭한다
Then Supabase Auth signOut API가 호출된다
And JWT 토큰이 제거된다
And 비로그인 상태로 전환된다
And 로컬 데이터(치수, 즐겨찾기)는 유지된다
```

---

## 프로필 관리

### Scenario: 프로필 조회

```gherkin
Given 사용자가 로그인되어 있다
When 프로필 페이지를 열면
Then GET /api/users/profile API가 호출된다
And 이메일, 닉네임이 표시된다
```

### Scenario: 닉네임 변경

```gherkin
Given 사용자가 프로필 페이지에 있다
When 닉네임을 수정하고 저장한다
Then POST /api/users/profile API가 호출된다
And "프로필이 저장되었습니다" 확인 메시지가 표시된다
And 헤더의 닉네임이 갱신된다
```

---

## 치수 서버 동기화

### Scenario: 로그인 후 치수 서버 동기화 제안

```gherkin
Given 사용자가 로그인했다
And IndexedDB에 로컬 치수 데이터가 있다
And 서버에 저장된 치수가 없다
Then "현재 기기의 체형 데이터를 계정에 동기화하시겠습니까?" 안내가 표시된다

When 사용자가 동기화를 승인한다
Then PUT /api/users/measurements API가 호출된다
And 치수가 서버에 암호화되어 저장된다
```

### Scenario: 서버 치수 불러오기

```gherkin
Given 사용자가 새 기기에서 로그인했다
And 서버에 저장된 치수가 있다
When 치수 동기화가 실행된다
Then GET /api/users/measurements API가 호출된다
And 서버 치수가 로컬 IndexedDB에 저장된다
And 아바타가 해당 체형으로 설정된다
```

---

## 보안

### Scenario: API 인증 헤더

```gherkin
Given 사용자가 로그인되어 있다
When 인증이 필요한 API를 호출한다
Then Authorization: Bearer {JWT} 헤더가 포함된다
And 서버에서 JWT가 검증된다
```

### Scenario: CORS 제한

```gherkin
Given 외부 도메인에서 API를 호출한다
Then CORS 정책에 의해 요청이 차단된다
And 허용된 도메인에서만 API 접근이 가능하다
```

---

## 기술 사양

| 항목 | 값 |
|------|-----|
| 인증 서비스 | Supabase Auth |
| 토큰 방식 | JWT (access + refresh) |
| 소셜 로그인 | Google (추후 Apple, Kakao 확장) |
| API 보안 | Bearer token, CORS, Rate limiting |
| 입력 검증 | Zod 스키마 |

## 관련 문서

- [07-architecture-design.md — 보안 설계](../07-architecture-design.md)
