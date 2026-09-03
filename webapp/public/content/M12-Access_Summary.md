# 모듈 12: 내 애플리케이션의 사용자에게 액세스 권한 부여하기

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [인증과 권한 부여](#2-인증과-권한-부여)
3. [Amazon Cognito](#3-amazon-cognito)
4. [사용자 풀 만들기](#4-사용자-풀-만들기)
5. [속성, 그룹, 범위](#5-속성-그룹-범위)
6. [토큰](#6-토큰)
7. [자격 증명 풀](#7-자격-증명-풀)
8. [API 액세스 보안](#8-api-액세스-보안)
9. [구현 모범 사례](#9-구현-모범-사례)
10. [애플리케이션과 실습 6](#10-애플리케이션과-실습-6)
11. [교재 대비 변경 사항](#11-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [11장](#11-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 9월 1일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.
> - 용어를 하나로 통일했습니다. `authorization` 은 **권한 부여**, `identity pool` 은 **자격 증명 풀**, `issue` 는 **발급**입니다. 토큰을 나열할 때는 항상 **ID → Access → Refresh** 순서를 씁니다. 교재는 같은 대상을 여러 이름으로 부르는 곳이 있습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- Amazon Cognito를 사용한 인증 프로세스 탐색
- 사용자 액세스 관리 및 서버리스 API 권한 부여
- Amazon Cognito 구현 모범 사례 관찰
- Amazon Cognito 통합을 시연하고 JWT 토큰 검토

교재는 이 네 항목을 슬라이드 3(모듈 목표)과 슬라이드 34(모듈 요약)에 똑같이 싣습니다. 그런데 **세 번째 항목에 대응하는 슬라이드가 덱에 없습니다.** 모범 사례를 제목으로 하는 슬라이드도, 강사 노트에서 모범 사례를 열거하는 대목도 없습니다. 이 문서는 그 자리를 [9장](#9-구현-모범-사례)에 공식 문서로 확인한 모범 사례로 채웠습니다.

### 이 모듈의 위치

교재는 3일차 두 번째 모듈로 이 모듈을 배치합니다. 앞의 모듈에서 만든 API와 애플리케이션에 사용자를 붙이는 자리이고, 그대로 실습 6(캡스톤)으로 이어집니다.

| 구분 | 내용 |
|---|---|
| 모듈 11 | 현대적 애플리케이션 구축 — 마이크로서비스와 서버리스 운영 모델 |
| **모듈 12** | **애플리케이션 사용자에게 액세스 권한 부여** — Amazon Cognito가 AWS 리소스 액세스를 제어하는 방법 검토 |
| 모듈 13 | 애플리케이션 배포 |
| 실습 6 | 캡스톤 - 애플리케이션 구축 완료 (Amazon Cognito를 통한 사용자 인증) |

### 이 모듈에서 다루는 것

교재는 36장의 슬라이드를 열 개 섹션으로 나눕니다. 이 문서도 같은 순서를 따릅니다.

| 교재 섹션 | 슬라이드 | 이 문서 |
|---|---|---|
| 표지 · 어젠다 · 모듈 목표 | 1~3 | [1장](#1-모듈-개요) |
| 인증 및 권한 부여의 복잡성 | 4~7 | [2장](#2-인증과-권한-부여) |
| Amazon Cognito | 8~12 | [3장](#3-amazon-cognito) |
| 사용자 액세스 관리 | 13~15 | [4장](#4-사용자-풀-만들기) · [5장](#5-속성-그룹-범위) |
| 사용자 풀을 통해 애플리케이션에 대한 액세스 권한 부여 | 16~19 | [6장](#6-토큰) |
| 자격 증명 풀을 통해 애플리케이션에 대한 액세스 권한 부여 | 20~21 | [7장](#7-자격-증명-풀) |
| API 액세스 보안 | 22~25 | [8장](#8-api-액세스-보안) |
| 데모 | 26~27 | [10.4절](#104-데모-노트) |
| 학습 내용 확인 | 28~29 | (이 문서에서 다루지 않음) |
| 실습 6: 캡스톤 - 애플리케이션 구축 완료 | 30~32 | [10장](#10-애플리케이션과-실습-6) |
| 요약 | 33~36 | [2.4절](#24-용어-정리) |

이 덱은 **다이어그램 중심**입니다. 36장 중 코드가 등장하는 슬라이드는 슬라이드 18(JWT ID 토큰 예시) 하나뿐이고, CLI·SDK 호출 예제가 전혀 없습니다. 실질적인 본문은 슬라이드 15·18·23·25의 강사 노트에 몰려 있습니다. 이 문서는 그 강사 노트를 본문으로 끌어올린 뒤, 교재가 아예 다루지 않는 영역(인증 흐름 이름, 기능 요금제, 토큰 폐기, JWT 검증, 할당량)을 공식 문서로 채웠습니다.

### 1.1 이 모듈에서 가장 크게 달라진 것 🆕

교재가 쓰인 뒤 Amazon Cognito에 추가·변경된 것이 많습니다. 강의에서 가장 먼저 마주칠 여섯 가지를 미리 짚어 둡니다. 각 항목의 근거는 해당 절에 있습니다.

| 달라진 것 | 교재 | 현재 |
|---|---|---|
| 기능 요금제 | 개념 자체가 없음 | 사용자 풀마다 **Lite · Essentials · Plus** 요금제가 있고 신규 사용자 풀의 기본값은 **Essentials** 입니다. 패스키·이메일 MFA·암호 이력·위협 보호·액세스 토큰 사용자 지정이 요금제에 따라 갈립니다 ([3.5절](#35-기능-요금제-lite-essentials-plus)) |
| 로그인 화면 이름 | "호스트된 UI" | **managed login**(최신)과 **hosted UI (classic)**(선행 버전) 두 브랜딩 버전 ([3.4절](#34-로그인-화면-managed-login-과-hosted-ui-classic)) |
| 고급 보안 기능 | "고급 보안 기능으로 사용자를 보호합니다" | **위협 보호(threat protection)** 로 이름이 바뀌었고 **Plus 요금제** 전용입니다 ([3.8절](#38-위협-보호)) |
| 인증 흐름 | "인증 흐름 지원" 한 줄. 흐름 이름을 하나도 제시하지 않음 | 앱 클라이언트의 `ExplicitAuthFlows` 로 허용 흐름을 골라야 하고, 교재 이후 추가된 **선택 기반 로그인(`USER_AUTH`)** 이 암호 없는 로그인·패스키의 유일한 진입 흐름입니다 ([4.7절](#47-인증-흐름)) |
| JWT 페이로드 | "암호화된 정보" (세 곳) | ID·액세스 토큰의 페이로드는 **암호화되지 않고 base64url 로 인코딩되어 서명**만 붙습니다. 암호화되는 것은 refresh 토큰입니다. 슬라이드 29 문제 4의 정답을 **거짓으로 교정**했습니다 ([6.3절](#63-jwt-구조와-교재-예시-교정)) |
| 자격 증명 풀 흐름 | `GetOpenIdToken` + `AssumeRoleWithWebIdentity` | 그 두 API는 **basic(classic) 흐름**입니다. 문서는 **enhanced 흐름**(`GetId` → `GetCredentialsForIdentity`)을 가장 안전하고 노력이 적은 선택으로 권장합니다 ([7.4절](#74-enhanced-흐름과-basic-classic-흐름)) |

> — 출처: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

> — 출처: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

> — 출처: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

---

## 2. 인증과 권한 부여

### 2.1 인증과 권한 부여의 구분

교재 슬라이드 5는 두 개념을 나란히 놓습니다. 슬라이드 제목은 `authorization` 을 "승인"으로 번역하지만 본문 상자와 이후 모든 슬라이드는 "권한 부여"를 쓰므로, 이 문서는 **권한 부여**로 통일합니다.

| 구분 | 무엇을 하는가 | 교재가 제시하는 수단 |
|---|---|---|
| 인증(authentication) | 사용자의 신원 확인 | HTTP 인증 / 로그인 프롬프트 / 사용자 지정 방법 |
| 권한 부여(authorization) | 원하는 작업을 사용자가 수행할 수 있는지 확인 | 액세스 제어 / 권한 도구 / 데이터 및 운영 보호 |

교재는 권한 부여의 예시 동작으로 노트 게시 · 노트 편집 · 노트 삭제를 듭니다. 이 세 동작이 그대로 [10장](#10-애플리케이션과-실습-6)의 Pollynotes API가 됩니다.

강사 노트는 이렇게 정리합니다. "사용자는 자신의 자격 증명을 증명해야 원하는 작업을 수행할 수 있습니다. 사용자 자격 증명은 애플리케이션에 통합됩니다."

공식 문서의 용어 정의도 같은 방향입니다. 인증은 정보 시스템 액세스를 목적으로 진정한 자격 증명을 확립하는 과정이고, 권한 부여는 리소스에 권한을 부여하는 과정입니다.

> — 출처: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

### 2.2 모던 애플리케이션에서 다뤄야 하는 세 가지

슬라이드 6은 개발자가 직접 떠안아야 하는 세 영역을 제시합니다. 강사 노트는 각 영역을 질문 형태로 되돌려 줍니다.

| 영역 | 교재가 나열하는 것 | 강사 노트의 질문 |
|---|---|---|
| 사용자 자격 증명 | 내 애플리케이션에 한정됨 / 사용자 / 게스트 | 사용자가 애플리케이션에서 로컬로 생성되는가, 다른 소스에서 페더레이션되는가? 애플리케이션은 게스트 액세스를 어떻게 처리하는가? |
| 인증 체계 | 통합 인증(SSO) / 여러 공급자 통합 / 2FA·MFA / 페더레이션 사용자 | 애플리케이션을 지원할 수 있는 적절한 서비스를 선택하고 구성합니다 |
| 프레임워크 | SAML 2.0 / OAuth 2.0 / OpenID Connect(OIDC) / 토큰(예: JWT) | 사용자 보안 솔루션을 구현하려면 서비스는 어떤 프로토콜과 방법을 사용해야 하는가? |

강사 노트는 "이것은 솔루션을 구현할 때 개발자가 직면해야 하는 보안 책임 및 당면 과제입니다. 개발자로서 이들의 책임과 당면 과제를 떠맡을 수 있는지 자문해 보십시오"로 마무리하고, 슬라이드 7에서 답을 내놓습니다. "Amazon Cognito는 애플리케이션의 인증 및 권한 부여를 해결하는 솔루션입니다."

세 영역이 이 문서의 어디로 이어지는지는 다음과 같습니다.

| 영역 | 이 문서 |
|---|---|
| 사용자 자격 증명 | [4장](#4-사용자-풀-만들기)(로컬 사용자) · [4.12절](#412-서드-파티-idp-페더레이션)(페더레이션) · [7.3절](#73-게스트-액세스)(게스트) |
| 인증 체계 | [4.5절](#45-다중-인증-mfa) · [4.7절](#47-인증-흐름) · [4.8절](#48-암호-없는-로그인과-패스키) |
| 프레임워크 | [2.3절](#23-세-표준에서-amazon-cognito-가-맡는-역할) · [5.5절](#55-oauth-20-그랜트-세-가지) · [6장](#6-토큰) |

### 2.3 세 표준에서 Amazon Cognito 가 맡는 역할 🆕

교재는 SAML 2.0 · OAuth 2.0 · OIDC를 **나열만** 하고 사용자 풀과 자격 증명 풀이 각 표준에서 무슨 역할을 하는지 구분하지 않습니다. 공식 문서는 역할을 명시합니다. 이 구분을 놓치면 "왜 사용자 풀은 토큰을 발급하는데 자격 증명 풀은 자격 증명을 발급하는가"가 계속 흐려집니다.

| 구성 요소 | 표준상의 역할 | 무엇을 받고 무엇을 발급하는가 |
|---|---|---|
| 사용자 풀 | 외부 IdP에 대해 **서비스 공급자(SP)·신뢰 당사자(RP)**, 앱에 대해 **OIDC 자격 증명 공급자이자 OAuth 2.0 권한 부여 서버** | SAML 어설션 / OIDC ID 토큰 / 소셜 공급자 토큰을 받고, 자체 ID · Access · Refresh 토큰을 발급 |
| 자격 증명 풀 | AWS STS 앞의 **토큰 교환 계층** | SAML 2.0 어설션, OIDC ID 토큰, OAuth 2.0 소셜 공급자의 신뢰된 클레임을 받고, 임시 AWS 자격 증명을 발급 |

사용자 풀 기능 표가 제시하는 다섯 가지 역할은 다음과 같습니다.

| 역할 | 내용 |
|---|---|
| OIDC 자격 증명 공급자 | 사용자 인증용 ID 토큰 발급 |
| 권한 부여 서버 | API 액세스 권한 부여용 액세스 토큰 발급 |
| SAML 2.0 서비스 공급자 | SAML 어설션을 ID · Access 토큰으로 변환 |
| OIDC 신뢰 당사자 | OIDC 토큰을 ID · Access 토큰으로 변환 |
| 소셜 공급자 신뢰 당사자 | Apple · Facebook · Amazon · Google의 ID 토큰을 자체 ID · Access 토큰으로 변환 |

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 2.4 용어 정리 🔄

교재 슬라이드 36(용어)은 OAuth2 · OIDC · JWT 세 용어를 정의합니다. 두 곳을 교정했습니다.

| 용어 | 교재 슬라이드 36 | 공식 문서 |
|---|---|---|
| OAuth 2.0 | "OAuth2" 로 표기. 웹사이트나 애플리케이션이 암호를 공유하지 않고도 다른 웹 사이트나 애플리케이션을 통해 정보에 액세스할 수 있게 함 | 표기는 **OAuth 2.0**. OAuth 2.0(소셜) 공급자는 JWT 액세스·refresh 토큰을 제공하는 IdP |
| OpenID Connect(OIDC) | OAuth2 위에 있는 자격 증명 계층 / SSO 시나리오 활성화 / 토큰 사용: ID, 액세스, 새로 고침 | OIDC 공급자는 **ID 토큰을 제공하기 위해 OAuth 명세를 확장하는** IdP. 교재 서술과 같은 방향 |
| JSON 웹 토큰(JWT) | "보안 정보 **고유**를 위한 JSON 객체를 정의합니다" | **인증된 사용자에 관한 클레임을 담은 JSON 형식 문서.** ID 토큰이 사용자를 인증하고, 액세스 토큰이 사용자에게 권한을 부여하고, refresh 토큰이 자격 증명을 갱신 |

JWT 정의의 "고유"는 오타로 보입니다. 슬라이드 18 강사 노트는 같은 대상을 "보안 암호 **공유**를 위한 JSON 객체"라고 씁니다. 또 같은 슬라이드가 클레임을 "암호화된 사용자 정보가 있는 페이로드"로 설명하는데, 이 서술은 [6.3절](#63-jwt-구조와-교재-예시-교정)에서 교정합니다.

그 밖에 이 모듈에서 자주 쓰는 용어를 문서 정의로 정리합니다.

| 용어 | 정의 |
|---|---|
| 권한 부여 서버 | JWT를 생성하는 OAuth 또는 OIDC 시스템 |
| 서비스 공급자(SP) · 신뢰 당사자(RP) | 사용자가 신뢰할 수 있다고 IdP가 주장해 주는 것에 의존하는 애플리케이션. Amazon Cognito는 외부 IdP에 대해 SP로, 앱 기반 SP에 대해 IdP로 동작 |
| UUID | 객체에 적용되는 128비트 레이블. Amazon Cognito UUID는 사용자 풀 또는 자격 증명 풀 단위로 고유하지만 **특정 UUID 형식(RFC UUID 포함)을 따르지 않으므로 형식을 엄격히 검증해서는 안 됨** |
| identity | 앱 사용자와 그 사용자 자격 증명을 자격 증명 풀과 신뢰 관계가 있는 외부 사용자 디렉터리의 프로필에 연결하는 UUID |

> — 출처: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

---

## 3. Amazon Cognito

### 3.1 Amazon Cognito 란 무엇인가 🔄

교재 슬라이드 9의 본문은 한 줄입니다. "웹 및 모바일 앱에 대한 인증, 권한 부여 및 사용자 관리를 제공합니다." 현재 문서는 이를 조금 더 정확하게 규정합니다. Amazon Cognito는 웹·모바일 앱을 위한 **자격 증명 플랫폼(identity platform)** 이며, 사용자 디렉터리이자 인증 서버이고 OAuth 2.0 액세스 토큰과 AWS 자격 증명에 대한 권한 부여 서비스입니다.

| 항목 | 내용 |
|---|---|
| 무엇인가 | 웹·모바일 앱용 자격 증명 플랫폼. 사용자 디렉터리 + 인증 서버 + 권한 부여 서비스 |
| 누구를 인증하는가 | 기본 제공 사용자 디렉터리의 사용자, 엔터프라이즈 디렉터리의 사용자, Google·Facebook 같은 소비자 자격 증명 공급자의 사용자 |
| 구성 요소 | 사용자 풀과 자격 증명 풀. 사용자 액세스 요구에 따라 **독립적으로 또는 함께** 동작 |

교재 슬라이드 9 강사 노트가 대표 기능으로 제시하는 세 가지는 다음과 같습니다. 세 항목 자체는 현재 문서와 방향이 같고, 규정 준수 목록과 "고급 보안 기능"이라는 이름만 교정이 필요합니다([3.7절](#37-규정-준수) · [3.8절](#38-위협-보호)).

| 기능 | 교재 강사 노트 |
|---|---|
| 자격 증명 스토어 | 모든 앱과 사용자를 위한 자격 증명 스토어. 소셜 자격 증명 공급자와 SAML 2.0 엔터프라이즈 자격 증명 공급자로 로그인 가능 |
| 액세스 제어 | 자격 증명 풀로 사용자에게 AWS 리소스에 대한 액세스 권한을 부여하는 메서드를 만들 수 있음 |
| 규정 준수 | 여러 규정 준수 프로그램 지원. 고급 보안 기능으로 사용자를 보호 |

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.2 두 구성 요소: 사용자 풀과 자격 증명 풀 🔄

교재는 이 내용을 슬라이드 10·11·12 세 장에 걸쳐 제시합니다. 그중 **슬라이드 11과 12의 본문은 글자 단위로 같고**, 슬라이드 12에만 "둘을 함께 사용할 수 있음" 상자가 추가됩니다. 애니메이션 단계를 두 슬라이드로 쪼갠 것으로 보이므로 이 문서는 한 절로 합쳤습니다.

교재 슬라이드 10은 질문으로 두 구성 요소를 가릅니다. 이 접근은 지금도 유효합니다.

| 질문 | 구성 요소 | 역할 |
|---|---|---|
| 사용자의 신원을 확인해야 하는가? | **사용자 풀** | 인증: 가입·로그인 |
| 사용자에게 **임시 AWS 자격 증명**을 발급해야 하는가? | **자격 증명 풀** | 권한 부여: 사용자에게 다른 AWS 서비스에 대한 액세스 권한 부여 |

> 교재 슬라이드 10 본문은 두 번째 질문을 "사용자에게 **AWS 액세스 키**를 부여해야 하는가?"로 씁니다. 문서가 기술하는 것은 **임시 AWS 자격 증명(temporary AWS credentials)** 이고 같은 덱의 슬라이드 10 강사 노트·슬라이드 21도 "임시 보안 인증 정보"로 씁니다. "액세스 키"는 IAM 사용자의 장기 액세스 키와 혼동될 수 있어 이 문서는 표현을 바꿨습니다.

두 구성 요소의 기능을 문서의 비교 표 기준으로 정리하면 이렇습니다. 체크되는 쪽이 갈리는 지점이 곧 설계 판단 지점입니다.

| 기능 | 사용자 풀 | 자격 증명 풀 |
|---|---|---|
| 사용자 디렉터리 — 인증용 사용자 프로필 저장 | ✅ | — |
| OIDC 자격 증명 공급자 | ✅ | — |
| API 액세스 권한 부여 | ✅ | — |
| 토큰 사용자 지정 | ✅ | — |
| IAM 웹 자격 증명 권한 부여 | — | ✅ |
| 인증되지 않은(게스트) 액세스 | — | ✅ |
| 역할 기반 액세스 제어(RBAC) | — | ✅ |
| 속성 기반 액세스 제어(ABAC) | — | ✅ |

교재 슬라이드 11·12가 본문에 적는 특징 세 개씩도 문서 서술과 대응합니다.

| 구성 요소 | 교재 본문 | 문서 기준으로 읽으면 |
|---|---|---|
| 사용자 풀 | 사용자 디렉터리 관리 / 호스트된 UI / 표준 토큰 | 로컬·페더레이션 사용자의 프로필을 담는 디렉터리 / **managed login 또는 hosted UI (classic)**([3.4절](#34-로그인-화면-managed-login-과-hosted-ui-classic)) / OIDC 표준을 근거로 발급하는 **ID · Access · Refresh 토큰**([6.2절](#62-토큰-세-가지-비교)) |
| 자격 증명 풀 | AWS 보안 인증 정보 / 페더레이션 자격 증명 / 인증되지 않은 게스트 | AWS STS의 임시 자격 증명 / 외부 IdP에 연결된 사용자 식별자의 저장소 / 게스트 액세스([7.3절](#73-게스트-액세스)) |

중요한 단서가 하나 있습니다. **사용자 풀은 자격 증명 풀과의 통합을 요구하지 않고, 자격 증명 풀도 사용자 풀과의 통합을 요구하지 않습니다.** 사용자 풀만으로 앱·웹 서버·API에 쓸 JWT를 직접 발급할 수 있습니다. AWS 서비스를 클라이언트에서 직접 호출할 필요가 없다면 자격 증명 풀을 만들지 않아도 됩니다.

> — 출처: [Amazon Cognito user pools and identity pools comparison](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.3 둘을 함께 쓰는 흐름 🆕

교재 슬라이드 12는 "둘을 함께 사용할 수 있음"이라고만 적고, 슬라이드 17 4단계는 "임시 AWS 보안 인증 정보로 교환"이라고만 적습니다. **어떤 토큰을 어떤 API에 넘기는지가 빠져 있습니다.** 문서 기준으로 채우면 세 단계입니다.

| 단계 | 내용 |
|---|---|
| 1 | 앱 사용자가 사용자 풀로 로그인해 OAuth 2.0 토큰(ID · Access · Refresh)을 받습니다 |
| 2 | 앱이 **사용자 풀 ID 토큰**을 자격 증명 풀에 제시해 임시 AWS 자격 증명으로 교환합니다. enhanced 흐름에서는 `GetId` 로 identity ID를 받고, identity ID와 같은 ID 토큰을 `GetCredentialsForIdentity` 에 결합해 보냅니다 |
| 3 | 앱이 그 자격 증명 세션을 사용자에게 할당해 Amazon S3 · Amazon DynamoDB 같은 AWS 서비스에 권한 있는 액세스를 제공합니다. 이 자격 증명은 **1시간 유효**합니다 |

자격 증명 풀이 공급자별로 받는 인증 아티팩트는 다음과 같습니다. 사용자 풀에서 넘기는 것은 **액세스 토큰이 아니라 ID 토큰**입니다.

| 공급자 | 자격 증명 풀이 받는 것 |
|---|---|
| Amazon Cognito 사용자 풀 | ID 토큰 |
| OIDC 공급자 | ID 토큰 |
| SAML 2.0 공급자 | SAML 어설션 |
| 소셜 공급자 | 액세스 토큰 |

> — 출처: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

### 3.4 로그인 화면: managed login 과 hosted UI classic 🔄

교재 슬라이드 11·12는 사용자 풀의 특징을 "호스트된 UI"로 적습니다. 현재 문서에는 브랜딩 버전이 **두 개** 있습니다.

| 항목 | managed login | hosted UI (classic) |
|---|---|---|
| 위치 | 최신 버전 | managed login의 더 얇고 덜 사용자 지정 가능한 선행 버전 |
| 지원 범위 | 가입 · 로그인 · 암호 관리(MFA 완료와 WebAuthn 인증자 등록 포함) | 동일 |
| 사용자 자체 서비스 프로필 관리 | **지원하지 않음.** 속성 변경·MFA 기본 설정은 애플리케이션 코드로 직접 구현 | 동일 |
| TLS 요구 | 사용자 지정 도메인과 접두사 도메인 **모두 TLS 1.2 요구** | 사용자 지정 도메인에 TLS 1.2를 요구하지 않음 |
| CORS | 사용자 지정 CORS 오리진 정책 미지원. 프런트 엔드에서 구현 | 동일 |
| 브랜딩 스타일 생성 | 콘솔에서 앱 클라이언트를 만들면 자동 할당. `CreateUserPoolClient` 로 만들면 **`CreateManagedLoginBranding` 요청을 보낼 때까지 쓸 수 없음** | 해당 없음 |

알아 둘 동작이 셋 있습니다.

- 사용자가 로그인 페이지나 서드 파티 공급자로 로그인하면 Amazon Cognito가 브라우저에 **쿠키를 설정하고 같은 인증 방법으로 1시간 동안 다시 로그인**할 수 있습니다. 쿠키로 재로그인해도 쿠키 기간이 1시간 더 연장되지는 않습니다. 그래서 액세스·ID 토큰의 기간을 1시간보다 짧게 두는 것은 의미가 크지 않습니다([6.6절](#66-토큰-유효-기간)).
- 브랜딩 버전을 managed login과 hosted UI (classic) 사이에서 바꾸면 **사용자 세션이 유지되지 않습니다.** 사용자는 새 인터페이스로 다시 로그인해야 합니다.
- managed login은 **5분 안에 완료되지 않은 인증 요청을 취소**합니다.

소셜 IdP를 쓰거나 페더레이션 로그인을 하려면 사용자 풀에 **도메인을 선택해 managed login 페이지를 설정**해야 합니다. 도메인 없이는 소셜·OIDC·SAML 로그인을 쓸 수 없습니다([4.12절](#412-서드-파티-idp-페더레이션)).

> — 출처: [Things to know about managed login and the hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

### 3.5 기능 요금제 Lite Essentials Plus 🆕

교재에 이 개념이 전혀 없습니다. 그런데 이 모듈에서 다루는 기능 중 **여러 개가 요금제에 따라 쓸 수 있는지 갈립니다.** 사용자 풀을 만들기 전에 알아야 하는 선택입니다.

| 요금제 | 포함 범위 |
|---|---|
| Lite | 로그인 기능과 classic hosted UI. 액세스 토큰 사용자 지정·패스키 인증 같은 최신 기능은 포함하지 않음 |
| **Essentials**(신규 사용자 풀 기본값) | 최신 사용자 풀 인증 기능 전체. 선택 기반 로그인(choice-based sign-in)과 이메일 MFA 같은 고급 인증 기능 포함 |
| Plus | Essentials의 모든 것 + **위협 보호** |

요금제는 **사용자 풀 단위**로 적용되며 사용자 풀 안의 앱 클라이언트별로 다르게 둘 수 없습니다. `CreateUserPool` · `UpdateUserPool` 의 `UserPoolTier` 파라미터로 설정하고, 값을 지정하지 않으면 Essentials가 기본값입니다. AWS CLI에서는 `--user-pool-tier` 인자입니다.

```bash
# 사용자 풀의 기능 요금제를 Plus 로 올립니다. 위협 보호를 켜려면 Plus 가 필요합니다.
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_example \
  --user-pool-tier PLUS

# 새 사용자 풀을 만들 때 요금제를 명시합니다. 생략하면 ESSENTIALS 가 기본값입니다.
aws cognito-idp create-user-pool \
  --pool-name pollynotes-users \
  --user-pool-tier ESSENTIALS
```

이 모듈에서 요금제에 의존하는 항목을 모아 두면 다음과 같습니다.

| 기능 | 필요한 요금제 | 이 문서 |
|---|---|---|
| 패스키(WebAuthn) 인증 | **Lite 제외** 전 요금제 | [4.8절](#48-암호-없는-로그인과-패스키) |
| 이메일 MFA · 이메일 OTP | Essentials 이상 | [4.5절](#45-다중-인증-mfa) · [4.10절](#410-sms-와-이메일-전송) |
| 암호 이력(`PasswordHistorySize`) | Essentials 이상 | [4.4절](#44-암호-정책) |
| 액세스 토큰 사용자 지정 | Lite 아닌 요금제 + 트리거 이벤트 버전 2 | [6.10절](#610-토큰-사용자-지정) |
| 위협 보호(threat protection) | **Plus** | [3.8절](#38-위협-보호) |
| 액세스 토큰에 범위를 런타임 추가 | Essentials 또는 Plus | [6.10절](#610-토큰-사용자-지정) |

문서는 예전에 일부 사용자 풀 기능이 `advanced security features` 요금 구조에 포함되어 있었고, 그 기능들이 지금은 Essentials 또는 Plus 요금제로 편입되었다고 알립니다. 교재의 "고급 보안 기능"이라는 표현이 여기서 나옵니다.

> — 출처: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

### 3.6 저장 중 전송 중 암호화 🔄

교재 슬라이드 9는 "데이터는 저장 중과 전송 중에 암호화된다", 슬라이드 14는 "모든 데이터 서버 측 암호화"라고 적습니다. 방향은 맞지만 **키 종류와 TLS 요구 사항**이 빠져 있습니다.

| 대상 | 저장 중 암호화 |
|---|---|
| 자격 증명 풀 | **AWS 소유 키**로 암호화. 이 동작은 변경할 수 없음 |
| 사용자 풀 | 기본은 AWS 소유 키. **고객 관리 키(customer managed key)** 로 암호화하도록 구성 가능. 암호화 설정을 전혀 하지 않아도 모든 고객 데이터는 저장 중 암호화됨 |

사용자 풀에 고객 관리 키를 쓸 때의 제약은 다음과 같습니다.

| 제약 | 내용 |
|---|---|
| 키 종류 | 사용자 풀과 **같은 리전의 대칭 KMS 키**만 지원. 비대칭 키로는 구성 불가 |
| 지정 방법 | **KMS 키 ARN 으로만** 구성 가능. 별칭으로는 불가 |

문서는 사용자 속성 검색에서 PII의 기밀성·무결성·가용성을 **검색 가능 암호화(searchable encryption)** 로 지원한다고 기술합니다. 사용자 풀을 암호화하는 KMS 키로 HMAC 값을 계산해 `sub` · `email` · `phone_number` · `given_name` · `family_name` · `name` · `username` · `preferred_username` · `cognito:user_status` 속성의 평문과 암호문을 매핑합니다.

전송 중 암호화의 요구 사항은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| TLS | **TLS 1.2 요구, TLS 1.3 권장.** AWS 서비스 엔드포인트는 최소 TLS 1.2 를 요구 |
| 암호 그룹 | DHE · ECDHE 같은 **완전 순방향 비밀성(PFS)** 을 갖춘 암호 그룹 요구 |
| API 네임스페이스 | 사용자 풀은 `cognito-idp`, 자격 증명 풀은 `cognito-identity` |
| 로그인 화면 | managed login과 classic hosted UI는 서비스 소유 Amazon CloudFront 배포에서 제공되는 웹 도메인에 호스팅되며 Amazon Cognito가 전송 중 암호화 설정을 관리 |

> — 출처: [Data protection in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html)

### 3.7 규정 준수 🔄

교재 슬라이드 9 강사 노트는 규정 준수 표준을 `PCI DSS / SOC / ISO 9001 / 표준 기반 인증(OAuth 2.0, SAML 2.0, OIDC) / MFA` 로 나열합니다. 두 가지를 교정해야 합니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| ISO 9001 | Amazon Cognito 문서가 명시하는 ISO 표준은 **ISO 27001**(정보 보안 관리 체계)입니다. ISO 9001은 품질 경영 시스템이고 Cognito 문서에는 나오지 않습니다 |
| 표준 기반 인증과 MFA를 규정 준수 목록에 포함 | 이 둘은 규정 준수 프로그램이 아니라 **서비스 기능**입니다. 교재는 서로 다른 범주를 한 목록에 섞어 놓았습니다 |

공동 책임 모델 관점으로 정리하면 다음과 같습니다. **"클라우드의 보안"과 "클라우드에서의 보안"이 갈리는 항목이 하나 있습니다.**

| 구분 | 준수 범위 |
|---|---|
| 클라우드의 보안 (AWS의 의무) | SOC 1-3, PCI DSS, ISO 27001을 준수하고 **HIPAA-BAA 대상** |
| 클라우드에서의 보안 (고객이 설계) | SOC 1-3, ISO 27001, HIPAA-BAA 로는 준수하도록 설계할 수 있지만 **PCI DSS 로는 그럴 수 없습니다** |

규정 준수 검증 페이지가 나열하는 프로그램은 **SOC · PCI · FedRAMP · HIPAA 와 그 밖의 것들**입니다. 특정 프로그램의 범위에 포함되는 서비스 목록은 `AWS services in scope by compliance program` 페이지에서 확인하고, 서드 파티 감사 보고서는 AWS Artifact로 내려받습니다. 이 문서는 그 서비스 범위 페이지를 조회하지 않았으므로 **Cognito가 ISO 9001 범위에 들어가는지 여부 자체는 판정하지 않았습니다**([11.5절](#115-검증하지-못한-항목)).

> — 출처: [Compliance validation for Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/compliance-validation.html)

> — 출처: [What is Amazon Cognito? (shared responsibility model)](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.8 위협 보호 🔄

교재 슬라이드 9 강사 노트의 "고급 보안 기능으로 사용자를 보호합니다"가 이 기능입니다. 문서는 이 기능을 **위협 보호(threat protection)** 로 부르며 "이전에 고급 보안 기능(advanced security features)이라고 불렸다"고 명시합니다. **Plus 기능 요금제 전용**입니다.

| 구성 요소 | 내용 |
|---|---|
| 침해된 자격 증명(Compromised credentials) | 공개 유출된 사용자 이름·암호 데이터를 모아 사용자 자격 증명과 대조하고 흔히 추측되는 암호도 확인. 로그인·가입·암호 변경 이벤트에 대해 **로그인 차단 또는 허용**을 선택 |
| 적응형 인증(Adaptive authentication) | 로그인 요청의 위치·디바이스 정보를 검토해 **위험 점수**를 부여하고 MFA 요구·로그인 차단·활동 기록 중 자동 응답을 지정. 의심스러운 활동을 알리는 이메일 자동 발송 가능 |
| IP 주소 허용·차단 목록 | Full function 모드에서 **CIDR 형식**으로 Always block · Always allow 예외를 만듦 |
| 로그 내보내기 | 위협 평가·사용자 정보·위치·디바이스 같은 세션 메타데이터를 **Amazon S3 · CloudWatch Logs · Amazon Data Firehose** 로 내보냄 |

모드가 두 가지입니다. **감사(audit) 모드**는 보안 완화를 적용하지 않고 감지된 위험 지표만 CloudWatch에 게시하고, **Full function 모드**는 구성한 자동 응답을 실제로 적용합니다.

제약이 셋 있습니다. 실습에서 바로 부딪히는 지점입니다.

| 제약 | 내용 |
|---|---|
| 인증 흐름 | `USER_PASSWORD_AUTH` · `ADMIN_USER_PASSWORD_AUTH` 에서는 적응형 인증과 침해된 자격 증명 감지를 **모두** 지원하지만, `USER_SRP_AUTH` 에서는 **적응형 인증만** 켤 수 있음 |
| 페더레이션 | **페더레이션 로그인에는 위협 보호를 쓸 수 없음** |
| 속도 제한 | 위협 보호는 요청 속도 제한을 적용하지 않으므로 대량 트래픽 공격 방어에는 **AWS WAF 웹 ACL** 을 함께 써야 함 |

> — 출처: [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html)

### 3.9 서비스 할당량과 과금 단위 🆕

교재 슬라이드 14는 "수백만 사용자 수준으로 확장 가능"이라고만 적습니다. 실제 기준값과 조정 가능 여부를 확인했습니다. 할당량은 **계정·리전 단위**로 적용됩니다.

| 할당량 | 기본값 | 조정 |
|---|---|---|
| 사용자 풀당 사용자 수 | 40,000,000 | 조정 가능. 그 이상은 계정 팀에 문의 |
| 리전당 사용자 풀 | 1,000 | 최대 10,000 |
| 사용자 풀당 앱 클라이언트 | 1,000 | 최대 10,000 |
| 사용자 풀당 자격 증명 공급자 | 300 | 최대 1,000 |
| 사용자 풀당 리소스 서버 | 25 | 최대 300 |
| 사용자 풀당 사용자 지정 속성 | 50 | **조정 불가** |
| 사용자 풀당 그룹 | 10,000 | **조정 불가** |
| 사용자 풀당 managed login 브랜딩 스타일 | 20 | **조정 불가** |
| 자격 증명 풀당 Amazon Cognito 사용자 풀 공급자 | 50 | 최대 1,000 |
| AWS 계정당 하루 이메일 메시지 | 50 | **조정 불가**([4.10절](#410-sms-와-이메일-전송)) |

API 요청 속도 할당량은 적용 단위가 두 구성 요소에서 다릅니다.

| 구성 요소 | 적용 단위 |
|---|---|
| 사용자 풀 | `UserAuthentication` · `UserCreation` 같은 **사용 사례 범주별로 묶어** 적용. 예를 들어 `UserCreation` 범주는 `SignUp` · `ConfirmSignUp` · `AdminCreateUser` · `AdminConfirmSignUp` 네 작업에 합산 50 RPS. `RespondToAuthChallenge` · `AdminRespondToAuthChallenge` 는 `UserAuthentication` 범주 한도의 **3배** 라는 별도 할당량 |
| 자격 증명 풀 | **작업 단위**로 적용 |

과금 단위는 **월간 활성 사용자(MAU)** 입니다. 한 달 안에 사용자와 관련된 자격 증명 작업이 있으면 그 사용자가 MAU로 계산됩니다.

| MAU에 기여하는 작업 | MAU에 기여하지 않는 작업 |
|---|---|
| 가입·관리자 생성 / 계정 확인·속성 확인 / 로그인·챌린지 응답 / 로그아웃·토큰 폐기 / 암호 자체 재설정과 관리자의 암호 설정 / 속성·그룹 멤버십 변경 / 관리자로서 사용자 상세 속성 조회(`AdminGetUser`) | CSV 사용자 가져오기 / `AdminResetUserPassword` |

기능 요금제를 바꾼 달의 청구는 사용자가 활성이었던 시점의 **가장 높은 가격 티어**를 그 사용자에게 할당해 Lite · Essentials · Plus MAU 합으로 계산합니다. 이 문서는 요금 페이지를 조회하지 않았으므로 **단가 수치는 적지 않았습니다**([11.5절](#115-검증하지-못한-항목)).

> — 출처: [Quotas in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html)

### 3.10 Amazon Cognito Sync 🆕

교재 M12에는 등장하지 않습니다. 그런데 자격 증명 풀 콘솔의 Identity browser 탭과 데이터 세트 기능이 여전히 존재하고, 오래된 자료가 자격 증명 풀과 함께 이 서비스를 소개하므로 상태를 명시해 둡니다.

| 항목 | 내용 |
|---|---|
| 상태 | **더 이상 신규 고객에게 제공되지 않습니다**(no longer open to new customers) |
| 기존 고객 | 워크로드에 중단이 없고 계속 쓸 수 있지만 **새 기능 개발이 없습니다** |
| 권장 대안 | **AWS AppSync**(GraphQL API로 디바이스 간 실시간 데이터 동기화) 또는 **Amazon DynamoDB**(프로필·환경 설정·설정 같은 단순 키-값 사용자 데이터 저장) |
| 마이그레이션 | 데이터 스키마 갱신, 기존 스토어에서 대안 서비스로의 데이터 이전, 클라이언트 애플리케이션의 API 변경이 필요 |

**신규 프로젝트에서는 쓸 수 없습니다.** 실습에서 사용자별 데이터를 저장해야 한다면 DynamoDB를 씁니다.

> — 출처: [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html)

---

## 4. 사용자 풀 만들기

### 4.1 사용자 흐름과 보안 요구 사항

교재 슬라이드 14는 사용자 풀을 만들 때 정하는 것을 두 열로 나눕니다.

| 사용자 흐름 정의 | 보안 요구 사항 지정 |
|---|---|
| 등록 / 이메일·전화번호 확인 / 보안 로그인 / 암호 분실 / 암호 변경 / 로그아웃 | 보안 암호 처리 / 다중 인증 / 암호 정책 적용 / 모든 데이터 서버 측 암호화 / 인증 흐름 지원 / 수백만 사용자 수준으로 확장 가능 |

오른쪽 열의 여섯 항목 중 **세 항목은 교재가 이름만 적고 내용을 제시하지 않습니다.** 이 문서는 다음 절들에서 채웁니다.

| 교재 항목 | 채운 곳 |
|---|---|
| 암호 정책 적용 | [4.4절](#44-암호-정책) — 기본값·범위·Essentials 이상에서만 되는 것 |
| 다중 인증 | [4.5절](#45-다중-인증-mfa) — 두 번째 요소 세 가지 |
| 인증 흐름 지원 | [4.7절](#47-인증-흐름) — `ExplicitAuthFlows` 값과 선택 기반 로그인 |
| 모든 데이터 서버 측 암호화 | [3.6절](#36-저장-중-전송-중-암호화) |
| 수백만 사용자 수준으로 확장 가능 | [3.9절](#39-서비스-할당량과-과금-단위) — 사용자 풀당 4천만 명 |

### 4.2 사용자 풀로 할 수 있는 일 아홉 가지

교재 슬라이드 14의 강사 노트가 제시하는 아홉 항목입니다. 교재 서술을 그대로 싣고 오른쪽에 이 문서의 해당 절을 붙였습니다.

| # | 교재 강사 노트 | 이 문서 |
|---|---|---|
| 1 | 사용자가 로그인하는 방법을 선택합니다(예: 이메일, 전화번호 또는 사용자 이름 확인) | [5.2절](#52-필수-속성과-확인-가능한-속성) |
| 2 | 사용자 프로필 이메일, 생일, 사진, 사용자 지정 속성 같은 가입 및 사용자 프로필 생성에 필요한 속성을 요구합니다 | [5.1절](#51-속성) |
| 3 | 정책(암호 강도, 관리자에게 가입 요청, 임시 암호 만료 기간 설정 등)을 지정합니다 | [4.4절](#44-암호-정책) |
| 4 | 다중 인증(MFA)과 사용자 디바이스 기억을 활성화합니다 | [4.5절](#45-다중-인증-mfa) · [4.6절](#46-디바이스-기억) |
| 5 | 사용자 계정 복구 옵션을 설정합니다 | [4.5절](#45-다중-인증-mfa) — MFA와 계정 복구 채널이 겹칠 수 없음 |
| 6 | 단문 메시지 서비스(SMS)와 사용자 지정 이메일 전송 옵션을 설정합니다 | [4.10절](#410-sms-와-이메일-전송) |
| 7 | 사용자 풀을 분류하고 관리할 수 있도록 태그를 추가합니다 | 교재 서술 그대로 |
| 8 | 사용자 풀에 액세스할 수 있는 애플리케이션 클라이언트를 지정합니다. 앱 클라이언트는 사용자 풀에 액세스할 수 있는 고유 ID와 선택적 비밀 키를 수신합니다 | [4.9절](#49-앱-클라이언트-퍼블릭과-기밀) |
| 9 | 트리거를 이용하여 사용자 지정 워크플로를 설정합니다. 특정 이벤트(사전 가입, 후 인증 등)와 함께 실행할 AWS Lambda 함수를 선택할 수 있습니다 | [4.11절](#411-lambda-트리거) |

### 4.3 콘솔 생성 흐름 🔄

교재 슬라이드 27 데모는 "사용자 풀 및 앱 클라이언트 ID 생성"을 콘솔 조작으로 전제합니다. 현재 콘솔의 사용자 풀 생성은 **애플리케이션 중심 흐름**으로 바뀌었습니다.

| 단계 | 내용 |
|---|---|
| 1 | 콘솔의 User pools 메뉴에서 **Create user pool** 또는 `Get started for free in less than five minutes` 선택 |
| 2 | **Define your application** — 만들려는 시나리오에 맞는 **Application type** 선택 |
| 3 | **Name your application** — 이름 입력 |
| 4 | **Configure options** — **사용자 풀 생성 후 변경할 수 없는** 기본 선택. `Options for sign-in identifiers`(사용자 이름·이메일 주소·전화번호 또는 조합)와 `Required attributes for sign-up` |
| 5 | **Add a return URL** — 인증 완료 후 리디렉션 경로 입력 |
| 6 | **Create your application** 선택 |

Amazon Cognito가 애플리케이션 유형의 기본 설정으로 **사용자 풀과 앱 클라이언트를 함께** 만듭니다. 외부 자격 증명 공급자·MFA 같은 추가 옵션은 리소스를 만든 뒤에 구성합니다. 사용자 풀 생성에는 `AmazonCognitoPowerUser` 정책이 충분합니다.

이 과정에서 **되돌릴 수 없는 기본 구성**이 생깁니다. 문서가 표로 제시하는 항목은 셋입니다.

| 항목 | 바꾸려면 |
|---|---|
| 클라이언트 보안 암호 | `Traditional web application` 또는 `Machine-to-machine application` 프로필로 **새 앱 클라이언트를 만들어야** 합니다 |
| `preferred_username` 별칭 미허용 | SDK로 프로그래밍 방식 생성이 필요합니다 |
| 사용자 이름 대소문자 구분 없음 | SDK로 프로그래밍 방식 생성이 필요합니다 |

여기에 4단계의 두 선택(로그인 식별자, 가입 필수 속성)도 **사용자 풀을 만든 뒤 바꿀 수 없습니다**([5.2절](#52-필수-속성과-확인-가능한-속성)). 문서는 콘솔 과정으로 테스트 환경을 만든 뒤 완성된 설계를 **AWS CloudFormation · AWS CDK 같은 자동화 도구로 프로덕션에 배포**하도록 권장합니다.

> 현재 빠른 시작 문서의 생성 단계에는 **기능 요금제를 고르는 지점이 없습니다.** 요금제는 사용자 풀을 만든 뒤 `Settings → Feature plans` 또는 API의 `UserPoolTier` 로 지정합니다. 이 문서가 확인한 것은 "생성 단계에 없다"까지입니다([11.5절](#115-검증하지-못한-항목)).

> — 출처: [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html)

### 4.4 암호 정책 🆕

교재는 "정책(암호 강도, 관리자에게 가입 요청, 임시 암호 만료 기간 설정 등)을 지정합니다"라고만 적고 **구체적인 값을 하나도 제시하지 않습니다.** 콘솔의 `Authentication methods` 메뉴 `Password policy` 에서 설정하고, 모드는 권장 최소 설정을 적용하는 `Cognito defaults` 와 `Custom` 두 가지입니다.

| 파라미터 | 기본값 | 유효 범위 | 비고 |
|---|---|---|---|
| `MinimumLength` | — | **6~99** | 6 미만일 수 없습니다. 사용자는 최대 256자까지 암호를 설정할 수 있습니다 |
| `RequireLowercase` · `RequireNumbers` · `RequireSymbols` · `RequireUppercase` | — | Boolean | 요구할 문자 유형을 숫자·특수 문자·대문자·소문자 중에서 고릅니다 |
| `TemporaryPasswordValidityDays` | **7일** | 0~365 | 0을 제출하면 Amazon Cognito가 null로 취급해 기본값을 설정합니다 |
| `PasswordHistorySize` | 미적용 | 0~24 | 이전 암호 재사용을 막는 개수. **Essentials 요금제 이상** 필요. 0이거나 제공하지 않으면 적용되지 않고 `DescribeUserPool` 응답에도 표시되지 않습니다 |

허용되는 특수 문자는 `^ $ * . [ ] { } ( ) ? " ! @ # % & / \ , > < ' : ; | _ ~ ` = + -` 와 **선행·후행이 아닌 공백**입니다. 문서는 복잡한 암호를 최소 8자 이상에 대문자·숫자·특수 문자를 섞은 것으로 기술합니다.

```bash
# 사용자 풀의 암호 정책을 지정합니다. PasswordHistorySize 는 Essentials 이상에서만 동작합니다.
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_example \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 12,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true,
      "TemporaryPasswordValidityDays": 3,
      "PasswordHistorySize": 5
    }
  }'
```

알아 둘 동작이 둘 있습니다.

- **Amazon Cognito 사용자 풀의 로컬 사용자 암호는 자동으로 만료되지 않습니다.** 문서는 모범 사례로 암호 재설정 시각·날짜·메타데이터를 외부 시스템에 기록하고, 애플리케이션이나 Lambda 트리거가 암호 사용 기간을 조회해 일정 기간 후 재설정을 요구하도록 안내합니다. 만료 정책이 필요하면 **직접 구현해야 합니다.**
- 임시 암호 만료 기간이 지나면 새 사용자는 로그인해 새 암호를 설정할 수 없습니다. 복구 방법은 `AdminCreateUser` 에 `MessageAction=RESEND` 를 넣어 새 임시 암호를 보내거나, 사용자 프로필을 삭제·재생성하거나, `AdminResetUserPassword` 로 새 확인 코드를 생성하는 것입니다.

> 오래된 템플릿에서 `UnusedAccountValidityDays` 를 만날 수 있습니다. 사용자 풀에 `TemporaryPasswordValidityDays` 를 설정하면 그 사용자 풀에서 **레거시 파라미터 `UnusedAccountValidityDays` 에는 더 이상 값을 설정할 수 없습니다**([11.3절](#113-비권장지원-종료된-항목)).

> — 출처: [Adding user pool password requirements](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-users-passwords.html)

> — 출처: [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html)

### 4.5 다중 인증 MFA 🔄

교재는 "다중 인증(MFA)과 사용자 디바이스 기억을 활성화합니다"라고만 적고 **두 번째 요소의 종류를 구분하지 않습니다.** MFA는 보통 사용자 이름·암호인 최초의 "아는 것(something you know)" 요소에 "가진 것(something you have)" 요소를 추가합니다.

| 두 번째 요소 | 비고 |
|---|---|
| SMS 문자 메시지 | 전화번호 필요. SMS MFA를 켜면 사용자는 전화번호를 제공해야 합니다 |
| 이메일 메시지 | **Essentials 요금제 이상 + Amazon SES 이메일 구성** 필요 |
| 시간 기반 일회용 암호(TOTP) | 인증자 앱 |

알아 둘 점이 여섯 있습니다. 실습 설계에 직접 영향을 줍니다.

| 항목 | 내용 |
|---|---|
| 페더레이션 사용자 | Amazon Cognito가 모든 인증 프로세스를 **IdP에 위임**하므로 페더레이션 사용자에게는 추가 인증 요소를 제공하지 않습니다 |
| required 설정 | 모든 사용자가 로그인할 때 MFA를 완료해야 하고 각 사용자가 최소 하나의 MFA 요소를 설정해야 하므로 **사용자 온보딩에 MFA 설정을 포함**해야 합니다 |
| managed login | MFA가 **필수일 때만** 사용자에게 MFA 설정을 안내합니다. optional일 때는 안내하지 않으므로 앱에서 직접 인터페이스를 만들어야 합니다 |
| 첫 로그인 | 새 사용자가 앱에 처음 로그인할 때는 사용자 풀이 MFA를 요구해도 Amazon Cognito가 OAuth 2.0 토큰을 발급합니다. 첫 로그인의 두 번째 인증 요소는 **Amazon Cognito가 보낸 확인 메시지에 대한 확인**입니다 |
| 암호 없는 로그인과의 배타성 | MFA가 필수인 사용자 풀에서는 **OTP 로그인을 지원할 수 없고** `AllowedFirstAuthFactors` 에 `EMAIL_OTP` · `SMS_OTP` 를 추가할 수 없습니다. WebAuthn은 `FactorConfiguration` 이 `MULTI_FACTOR_WITH_USER_VERIFICATION` 일 때 추가할 수 있습니다 |
| 계정 복구 채널 | 사용자는 MFA와 암호 재설정 코드를 **같은 이메일 주소·전화번호로 받을 수 없습니다.** 이메일 OTP를 MFA로 쓰면 계정 복구는 SMS로, SMS OTP를 MFA로 쓰면 계정 복구는 이메일로 해야 합니다 |

MFA 코드를 **다섯 번** 잘못 제시하면 지수 백오프 방식의 잠금 프로세스가 시작됩니다. 위험 수준 상승에 따라 추가 인증 요소를 요구하는 **적응형 인증**은 위협 보호를 구성해야 합니다([3.8절](#38-위협-보호)).

> — 출처: [Adding MFA to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)

### 4.6 디바이스 기억 🔄

교재는 "사용자 디바이스 기억"을 이름만 적습니다. 콘솔의 `Sign-in` 메뉴 `Device tracking` 에서 설정하고 옵션이 **세 개**입니다.

| 옵션 | 동작 |
|---|---|
| Don't remember | 로그인 시 디바이스 기억을 안내하지 않습니다 |
| Always remember | 앱이 사용자 디바이스를 확인하면 항상 디바이스를 기억하고, **이후 성공적인 디바이스 로그인에 MFA 챌린지를 반환하지 않습니다** |
| User opt-in | 앱이 디바이스를 확인해도 MFA 챌린지를 자동으로 억제하지 않으므로 **사용자에게 기억 여부를 물어야** 합니다 |

`Always remember` 또는 `User opt-in` 을 선택하면 식별되지 않은 디바이스에서 사용자가 로그인할 때마다 Amazon Cognito가 디바이스 식별자 키와 보안 암호를 생성합니다. 디바이스 키의 형식은 `Region_UUID` 이고, Amazon Cognito는 디바이스 정보가 없는 로그인 응답에 디바이스 키를 포함합니다.

알아 둘 제약이 셋 있습니다.

| 제약 | 내용 |
|---|---|
| MFA 대체 조건 | 기억된 디바이스는 **MFA가 활성화된 사용자 풀에서만** MFA를 대체할 수 있습니다 |
| 추가 디바이스 인증 | 기억된 디바이스로 로그인할 때는 인증 흐름에서 추가 디바이스 인증을 수행해야 하며 **디바이스 키, SRP 라이브러리, 디바이스 인증을 허용하는 사용자 풀**이 필요합니다 |
| 신뢰 기간 만료 | Amazon Cognito가 관리하지 않습니다. 신뢰 기간이 끝나면 **애플리케이션이 디바이스 상태를 `not remembered` 로 바꾸고** 사용자가 다시 MFA로 로그인하게 해야 하며, 만료 날짜는 사용자 지정 속성에 저장하는 방식으로 직접 구현합니다 |

관련 API는 `ListDevices` · `AdminListDevices`, `GetDevice` · `AdminGetDevice`, `UpdateDeviceStatus` · `AdminUpdateDeviceStatus`, `ForgetDevice` · `AdminForgetDevice` 이고, API 구성은 `CreateUserPool` · `UpdateUserPool` 의 `DeviceConfiguration` 속성으로 합니다. 디바이스별 활동 로그 연결은 위협 보호와 이어집니다.

> — 출처: [Working with user devices in your user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html)

### 4.7 인증 흐름 🆕

교재는 슬라이드 14 보안 요구 사항 목록에 "인증 흐름 지원"이라고만 적고 **흐름 이름을 하나도 제시하지 않습니다.** 실제로는 앱 클라이언트에서 허용할 흐름을 명시적으로 골라야 합니다.

사용자 풀 인증은 사용자가 최초 선택을 하고 자격 증명을 제출하고 추가 챌린지에 응답하는 흐름입니다. managed login을 쓰면 Amazon Cognito가 프롬프트와 챌린지의 흐름을 관리하고, AWS SDK로 백엔드에 흐름을 구현하면 요청 로직을 직접 만들고 챌린지에 응답해야 합니다.

문서가 제시하는 로그인 방식은 다음과 같습니다.

| 로그인 방식 | 내용 |
|---|---|
| 서드 파티 IdP 로그인(페더레이션 로그인) | 소셜·OIDC·SAML IdP를 통한 로그인 |
| 지속 암호 로그인 | 사용자 이름·암호 |
| 보안 페이로드를 쓰는 지속 암호 로그인(SRP) | 암호 해시와 솔트로 **암호를 아는 증거만** 보내므로 요청에 읽을 수 있는 비밀 정보가 없음 |
| 일회용 암호(OTP)를 쓰는 암호 없는 로그인 | [4.8절](#48-암호-없는-로그인과-패스키) |
| WebAuthn 패스키를 쓰는 암호 없는 로그인 | [4.8절](#48-암호-없는-로그인과-패스키) |
| 로그인 후 MFA | [4.5절](#45-다중-인증-mfa) |
| refresh 토큰 | [6.7절](#67-refresh-토큰-교체) |
| 사용자 지정 인증 | `CUSTOM_AUTH`. Lambda 트리거 세 개로 제어 |
| 사용자 마이그레이션 인증 흐름 | `Migrate user` 트리거 |

앱 클라이언트의 `ExplicitAuthFlows` 에 지정하는 값은 넷입니다.

| `ExplicitAuthFlows` 값 | 의미 |
|---|---|
| `ALLOW_USER_PASSWORD_AUTH` | 사용자 이름·암호로 로그인 |
| `ALLOW_ADMIN_USER_PASSWORD_AUTH` | 서버 측 관리 자격 증명으로 로그인 |
| `ALLOW_USER_SRP_AUTH` | SRP로 로그인 |
| `ALLOW_USER_AUTH` | **선택 기반 로그인.** 교재 이후 추가 |

`InitiateAuth` · `AdminInitiateAuth` 의 `AuthFlow` 값으로는 `USER_AUTH`(선택 기반), `USER_SRP_AUTH`, `CUSTOM_AUTH`, `REFRESH_TOKEN_AUTH` 를 씁니다.

```bash
# 앱 클라이언트가 허용할 인증 흐름을 명시합니다.
# SRP 와 선택 기반 로그인만 허용하고 평문 암호 흐름은 켜지 않습니다.
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_example \
  --client-id xxxxxxxxxxxxexample \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_USER_AUTH ALLOW_REFRESH_TOKEN_AUTH
```

**선택 기반 로그인(`USER_AUTH`)** 의 동작은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 1차 요소 구성 | 사용자 풀의 `SignInPolicy.AllowedFirstAuthFactors` 에 `PASSWORD` · `EMAIL_OTP` · `SMS_OTP` · `WEB_AUTHN` 을 지정 |
| 진행 방식 | 요청에 `PREFERRED_CHALLENGE` 를 넣거나, 생략해 `AvailableChallenges` 목록을 받은 뒤 `SELECT_CHALLENGE` 로 진행 |
| `PASSWORD` 값의 범위 | **평문 암호와 SRP 두 변형을 모두 포함** |

`CUSTOM_AUTH` 는 `DefineAuthChallenge` · `CreateAuthChallenge` · `VerifyAuthChallengeResponse` 세 Lambda 트리거로 챌린지와 응답 검증을 제어합니다. 사용자 마이그레이션에는 `USER_PASSWORD_AUTH` 를 쓰되, **마이그레이션을 마치면 네트워크로 암호를 보내지 않는 더 안전한 SRP 흐름으로 전환**하도록 문서가 안내합니다.

> — 출처: [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html)

### 4.8 암호 없는 로그인과 패스키 🆕

교재에 전혀 없습니다. 슬라이드 14는 보안 요구 사항으로 "보안 암호 처리 / 다중 인증 / 암호 정책 적용"만 제시합니다. 두 기능 모두 교재 이후 추가되었고 **선택 기반 로그인(`USER_AUTH`) 흐름을 통해서만** 쓸 수 있습니다.

**일회용 암호(OTP) 로그인**

| 항목 | 내용 |
|---|---|
| 동작 | 애플리케이션이 사용자에게 사용자 이름·이메일 주소·전화번호를 입력하게 하고 Amazon Cognito가 OTP를 생성해 확인하게 합니다 |
| 부수 효과 | 사용자가 SMS·이메일로 받은 코드를 올바르게 입력하면 인증과 함께 **확인되지 않은 이메일 주소·전화번호 속성이 확인됨으로 표시**되고 사용자 상태가 `UNCONFIRMED` 에서 `CONFIRMED` 로 바뀝니다 |
| 제약 | 사용자 풀에서 **MFA가 필수인 경우와 호환되지 않습니다** |

**패스키(WebAuthn) 인증**

| 항목 | 내용 |
|---|---|
| 표준 | W3C와 FIDO Alliance가 초안한 **WebAuthn · CTAP2** 표준 기반. 인증자가 공개-프라이빗 키 페어를 만들고 애플리케이션 백엔드가 저장한 공개 키로 서명을 검증 |
| 요금제 | **Lite를 제외한 모든 기능 요금제**에서 쓸 수 있는 **옵트인** 기능 |
| 진입 흐름 | 선택 기반 인증 흐름(`USER_AUTH`)에서만 제공 |
| 알고리즘 | **ES256(-7)** 과 **RS256(-257)** 두 비대칭 알고리즘으로 만든 패스키를 인식. **현재 attestation 강제는 지원하지 않음** |
| 사용자 확인 | `preferred` 또는 `required` 로 구성. 값을 주지 않은 API 요청과 콘솔의 기본값은 **`preferred`** |
| 등록 한도 | 사용자당 최대 **20개**. **사용자 풀에 최소 한 번 로그인한 뒤에만** 등록 가능 |
| relying party(RP) ID | **퍼블릭 서픽스 목록(PSL)에 없는 도메인**이어야 합니다. RP ID를 바꾸면 사용자가 새 RP ID로 다시 등록해야 하므로 **공개 전에 값을 정하는 것이 모범 사례** |
| MFA와의 관계 | `FactorConfiguration` 을 `MULTI_FACTOR_WITH_USER_VERIFICATION` 으로 설정하면 사용자 확인을 수반한 패스키 인증이 MFA 요구를 충족합니다. **패스키는 암호 로그인의 두 번째 요소로는 쓸 수 없습니다** |

> — 출처: [Passwordless sign-in with WebAuthn passkeys](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html)

### 4.9 앱 클라이언트 퍼블릭과 기밀 🔄

교재 슬라이드 14 강사 노트 8번은 "앱 클라이언트는 사용자 풀에 액세스할 수 있는 고유 ID와 **선택적 비밀 키**를 수신합니다"라고 적습니다. 이 서술 자체는 문서의 클라이언트 ID + 선택적 클라이언트 보안 암호와 일치합니다. 빠져 있는 것은 **클라이언트 유형 구분**입니다.

| 유형 | 실행 위치 | 클라이언트 보안 암호 |
|---|---|---|
| 퍼블릭 클라이언트(public client) | 브라우저나 모바일 디바이스. 신뢰할 수 있는 서버 측 리소스가 없음 | **갖지 않습니다**(does not have a client secret) |
| 기밀 클라이언트(confidential client) | 백엔드 서버의 데몬이나 셸 스크립트 등. 보안 암호를 맡길 서버 측 리소스가 있음 | 가집니다 |

클라이언트 보안 암호의 동작은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 용도 | 앱이 그 앱 클라이언트로 보내는 **모든 API 요청에 써야 하는 고정 문자열** |
| 필수 조건 | `client_credentials` 그랜트를 수행하려면 앱 클라이언트에 클라이언트 보안 암호가 **있어야** 합니다 |
| 개수 | 각 앱 클라이언트는 한 번에 **최대 두 개**를 가질 수 있어 다운타임 없이 교체할 수 있습니다 |
| 변경 | 앱을 만든 뒤 보안 암호를 **변경할 수 없습니다.** `AddUserPoolClientSecret` 로 두 번째 보안 암호를 추가하고 `DeleteUserPoolClientSecret` 로 삭제합니다. **앱 클라이언트의 유일한 보안 암호는 삭제할 수 없습니다** |
| 생성 방법 | 콘솔에서 `Traditional web application` 또는 `Machine-to-machine application` 을 선택하면 보안 암호가 있는 앱 클라이언트가 만들어집니다. 프로그래밍 방식으로는 `CreateUserPoolClient` 에서 `GenerateSecret` 을 `true` 로 설정합니다 |

문서가 명시하는 **퍼블릭 클라이언트 앱의 보안 모범 사례**는 두 가지입니다.

- **권한 부여 코드 그랜트 OAuth 흐름만 활성화**합니다([5.5절](#55-oauth-20-그랜트-세-가지)).
- **PKCE를 구현**해 토큰 교환을 제한합니다([5.6절](#56-pkce)).

속성 권한에도 함정이 있습니다. 앱 클라이언트를 만들고 속성 읽기·쓰기 권한을 사용자 지정하지 않으면 **모든 사용자 풀 속성에 읽기·쓰기 권한이 부여됩니다.** 필요한 최소 집합으로 제한하는 것이 모범 사례이고, `email_verified` · `phone_number_verified` 에는 앱 클라이언트 쓰기 권한을 줄 수 없습니다.

> — 출처: [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)

### 4.10 SMS 와 이메일 전송 🔄

교재는 "SMS와 사용자 지정 이메일 전송 옵션을 설정합니다"라고만 적습니다. 실습에서 사용자를 여러 명 만들면 바로 부딪히는 한도가 있습니다.

**이메일**

| 구성 | 내용 |
|---|---|
| Amazon Cognito 기본 이메일 구성 | Amazon Cognito가 사용자 풀당 하루에 보내는 이메일 수를 제한합니다. **AWS 계정당 하루 50개(조정 불가).** 문서는 일반적인 프로덕션 환경에서는 기본 한도가 필요한 전송량보다 낮다고 명시합니다 |
| 자체 Amazon SES 구성 | 더 많은 전송량이 필요하면 이쪽을 씁니다. 사용자 풀을 만든 뒤 전송 옵션을 바꿀 수 있습니다 |

기본 구성에는 주의할 점이 하나 더 있습니다. AWS가 관리하는 Amazon SES 리소스를 쓰므로 **하드 바운스가 발생한 이메일 주소가 계정 수준 또는 전역 억제 목록에 추가되며, 기본 구성을 쓰는 동안에는 그 주소를 억제 목록에서 제거할 수 없고 무기한 남을 수 있습니다.**

| 항목 | 값 |
|---|---|
| 기본 FROM 주소 | `no-reply@verificationemail.com` 또는 Amazon SES로 확인한 사용자 지정 주소 |
| 이메일 제목 | 최대 140자 |
| 이메일 본문 | 최대 20,000자 |
| 이메일 MFA 메시지 | 요청자 IP 주소당 한 이메일 주소에 **시간당 5~20개** |

이메일이 생성되는 이벤트는 암호 분실(`ForgotPassword` · `AdminResetUserPassword`), 초대(`AdminCreateUser`), 자체 등록(`SignUp` · `ResendConfirmationCode`), 이메일·전화번호 확인, MFA, 일회용 암호 인증입니다. **이메일 MFA와 이메일 OTP는 Essentials 기능 요금제 이상과 Amazon SES 이메일 구성을 요구합니다.**

**SMS**

문서는 **2024년 11월에 AWS가 Amazon SNS SMS 메시징을 AWS End User Messaging SMS로 대체했다**고 명시합니다. 현재 경로는 두 갈래이고 **상호 배타적**입니다. 한쪽을 설정하면 다른 쪽이 지워집니다.

| 경로 | 호출 방식 | 필요한 권한 |
|---|---|---|
| Amazon SNS 경로 | Amazon Cognito가 Amazon SNS를 호출하고 Amazon SNS가 AWS End User Messaging SMS로 라우팅 | `sns:Publish` |
| AWS End User Messaging SMS 직접 경로 | Amazon Cognito가 `SendTextMessage` 를 직접 호출 | `sms-voice:SendTextMessage` |

처음 문자 메시지를 보내면 AWS End User Messaging SMS가 계정을 **샌드박스 환경**에 두므로 확인된 목적지 전화번호로만 보낼 수 있습니다.

> — 출처: [SMS message settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html)

> — 출처: [Email settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)

### 4.11 Lambda 트리거 🔄

교재 슬라이드 14 강사 노트 9번은 트리거의 예로 "**사전 가입, 후 인증**" 두 개만 듭니다. 실제 목록은 훨씬 깁니다. 사용자 풀을 구성해 최초 가입 전, 인증 완료 후, 그 사이 여러 단계에서 Lambda 함수를 자동 호출할 수 있습니다.

| 흐름 | 트리거 | 용도 |
|---|---|---|
| 사용자 지정 인증 | Define Auth Challenge | 다음 챌린지 결정 |
| 사용자 지정 인증 | Create Auth Challenge | 챌린지 생성 |
| 사용자 지정 인증 | Verify Auth Challenge Response | 응답 정확성 판정 |
| 인증 이벤트 | Pre authentication | 로그인 요청 수락·거부 사용자 지정 검증 |
| 인증 이벤트 | Post authentication | 사용자 지정 분석용 이벤트 기록 |
| 인증 이벤트 · 토큰 생성 | **Pre token generation** | 토큰 클레임 보강·억제. ID·액세스 토큰의 속성 추가·제거 |
| 페더레이션 | Inbound federation | 사용자 풀에 사용자 생성·업데이트 전 페더레이션 사용자 속성 변환 |
| 가입 | **Pre sign-up** | 가입 요청 수락·거부 검증 (교재의 "사전 가입") |
| 가입 | Post confirmation | 환영 메시지·이벤트 기록 |
| 가입 | Migrate user | 기존 사용자 디렉터리에서 사용자 풀로 마이그레이션 |
| 메시지 | Custom message | 메시지 고급 사용자 지정·현지화 |
| 이메일·SMS 서드 파티 공급자 | Custom sender | 서드 파티 공급자로 SMS·이메일 전송 |

> 교재가 예로 든 "후 인증"은 위 표의 `Post authentication` 입니다.

알아 둘 제약이 넷 있습니다.

| 제약 | 내용 |
|---|---|
| 동기 호출과 5초 | `Custom sender` 트리거를 제외하면 Amazon Cognito는 Lambda 함수를 **동기적으로 호출하고 함수는 5초 안에 응답해야 하며 이 5초 시간 초과 값은 변경할 수 없습니다** |
| 액세스 토큰 사용자 지정 | `Pre token generation` 트리거에서 액세스 토큰을 사용자 지정하려면 사용자 풀 기능 요금제가 **Lite가 아니어야** 하고 트리거 구성을 **이벤트 버전 2** 로 갱신해야 합니다 |
| 함수 버전 | Lambda 트리거 구성에서 함수 버전을 선언할 수 없어 기본적으로 최신 버전이 호출됩니다. 함수 버전을 별칭에 연결하고 트리거 `LambdaArn` 을 별칭 ARN으로 두면 되지만 **이 옵션은 콘솔에 없습니다** |
| 실패 처리 | Lambda 함수가 요청·응답 파라미터를 반환하지 않거나 오류를 반환하면 **인증 이벤트가 성공하지 않습니다** |

`custom SMS` · `custom email sender` 트리거는 콘솔에 없고 `CreateUserPool` · `UpdateUserPool` 의 `LambdaConfig` 속성으로만 설정합니다.

> — 출처: [Customizing user pool workflows with Lambda triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)

### 4.12 서드 파티 IdP 페더레이션 🆕

교재 슬라이드 19 강사 노트는 "사용자 풀은 Facebook, Google, Login with Amazon, Sign in with Apple을 통한 소셜 가입에서 반환된 토큰의 처리 작업을 관리합니다"와 "OIDC와 SAML IdP에서 보내는 토큰 처리도 관리합니다"로 적습니다. 이 서술은 문서와 일치합니다. 빠져 있는 것은 **그 결과 무엇이 생기는가**입니다.

| 단계 | 내용 |
|---|---|
| 1 | IdP가 OIDC ID 토큰이나 SAML 어설션을 Amazon Cognito에 전달합니다 |
| 2 | Amazon Cognito가 그 토큰·어설션의 사용자 클레임을 읽어 사용자 풀 디렉터리의 **새 사용자 프로필에 매핑**합니다 |
| 3 | Amazon Cognito가 자체 디렉터리에 **페더레이션 사용자의 프로필을 만들고**, IdP의 클레임과 (OIDC·소셜 IdP의 경우) IdP가 운영하는 퍼블릭 `userinfo` 엔드포인트를 근거로 속성을 추가합니다 |
| 4 | Amazon Cognito가 역할을 바꿔 앱(이제 SP)에 대한 IdP로 자신을 제시하며 **OIDC와 OAuth 2.0을 겸하는 IdP** 로서 ID · Access · Refresh 토큰을 발급합니다 |

매핑된 IdP 속성이 바뀌면 사용자 풀의 사용자 속성도 바뀝니다. 백엔드 시스템은 **하나의 사용자 풀 토큰 집합으로 표준화**할 수 있습니다.

알아 둘 점이 넷 있습니다.

| 항목 | 내용 |
|---|---|
| 도메인 필요 | 페더레이션 공급자로 로그인하게 하려면 **도메인을 선택해 managed login 페이지를 설정**해야 합니다 |
| API 로그인 불가 | `InitiateAuth` · `AdminInitiateAuth` 같은 API 작업으로는 **페더레이션 사용자를 로그인시킬 수 없습니다.** Login 엔드포인트나 Authorize 엔드포인트로만 로그인할 수 있습니다 |
| username 형식 | 페더레이션 사용자 프로필의 `username` 은 고정 식별자와 IdP 이름의 조합입니다(예: `MyIDP_bob@example.com`) |
| IdP별 그룹 자동 생성 | 사용자 풀에 추가하는 OIDC·SAML·소셜 IdP마다 **`[사용자 풀 ID]_[IdP 이름]`** 형식의 사용자 그룹이 만들어지고 자동 생성된 IdP 사용자 프로필이 그 그룹에 자동 추가됩니다 |

페더레이션 사용자의 자격 증명 정보는 **`identities` 라는 속성과 ID 토큰 클레임**에 기록되며 이 속성은 직접 변경할 수 없습니다.

소셜 IdP를 쓰려면 준비가 하나 더 필요합니다. **소셜 IdP를 만들기 전에 그 소셜 IdP에 애플리케이션을 등록해 클라이언트 ID와 클라이언트 보안 암호를 받아야** 합니다. 문서가 쓰는 공급자 이름은 `Facebook`, `Login with Amazon`, `Google`, `Sign in with Apple` 입니다.

> 교재 슬라이드 10 강사 노트는 이 공급자를 "Login **for** Amazon"으로 씁니다. 공식 이름은 **Login with Amazon** 이고 같은 덱의 슬라이드 9·19·24 강사 노트는 올바르게 표기합니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

사용자 풀당 자격 증명 공급자 할당량은 300개(최대 1,000)입니다([3.9절](#39-서비스-할당량과-과금-단위)).

> — 출처: [User pool sign-in with third party identity providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html)

> — 출처: [Using social identity providers with a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)

---

## 5. 속성, 그룹, 범위

교재 슬라이드 15입니다. **슬라이드 제목은 "속성, 범위 및 그룹" 순서인데 본문 열 배치와 강사 노트 서술은 모두 속성 → 그룹 → 범위 순서입니다.** 교재 안에서 순서가 어긋나므로 이 문서는 본문·강사 노트의 순서를 따릅니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

이 세 가지가 하는 일을 한 줄로 구분하면 이렇습니다.

| 대상 | 무엇을 정하는가 | 어디에 나타나는가 |
|---|---|---|
| 속성(attributes) | 사용자에 관해 **무엇을 저장할지** | ID 토큰의 클레임 |
| 그룹(groups) | 사용자를 **어떻게 묶고 어떤 IAM 역할을 줄지** | `cognito:groups` · `cognito:roles` · `cognito:preferred_role` 클레임 |
| 범위(scopes) | 액세스 토큰이 **어떤 API를 호출할 수 있는지** | 액세스 토큰의 `scope` 클레임 |

### 5.1 속성

Amazon Cognito는 OpenID Connect 명세를 근거로 모든 사용자에게 **표준 속성** 집합을 할당합니다. 기본적으로 표준·사용자 지정 속성 값은 최대 **2048자 문자열**이며 일부 속성에는 형식 제약이 있습니다.

표준 속성은 다음 **18개**입니다.

| 분류 | 속성 |
|---|---|
| 이름 | `name` · `family_name` · `given_name` · `middle_name` · `nickname` · `preferred_username` |
| 프로필 | `profile` · `picture` · `website` · `gender` · `birthdate` · `zoneinfo` · `locale` · `updated_at` |
| 연락처 | `address` · `email` · `phone_number` |
| 식별자 | `sub` |

🔄 **교재가 사용자 지정 속성의 예로 든 것이 실제로는 표준 속성입니다.** 슬라이드 15 본문은 속성 열을 `표준 속성(이메일, 이름) / 사용자 지정(닉네임, 그림)` 으로 적습니다. 그런데 `nickname` 과 `picture` 는 위 18개 표준 속성에 포함되어 있으므로 사용자 지정 속성이 아닙니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

사용자 지정 속성의 제약은 실습에서 되돌릴 수 없는 결정을 만들기 때문에 중요합니다.

| 항목 | 내용 |
|---|---|
| 개수 | 사용자 풀에 최대 **50개**. 이 한도는 **조정할 수 없습니다** ([3.9절](#39-서비스-할당량과-과금-단위)) |
| 길이 | 최대 **2048자**를 넘을 수 없습니다 |
| 이름 | 코드와 역할 기반 액세스 제어 규칙에서 표준 속성과 구분하기 위해 **`custom:` 접두사**가 붙습니다 |
| 타입 | `string` · `number` · `boolean` · `DateTime` 으로 정의할 수 있지만 **ID 토큰에는 타입과 무관하게 항상 문자열로 기록**됩니다 |
| 콘솔 제약 | 콘솔에서는 `string` 과 `number` 만 추가할 수 있습니다. `boolean` 과 `DateTime` 은 `CreateUserPool` · `UpdateUserPool` 의 `SchemaAttributes` 로만 정의합니다 |
| 필수 | 사용자 지정 속성은 **사용자에게 값 제공을 요구할 수 없습니다** |
| 변경 | 사용자 풀에 추가한 뒤 **제거하거나 변경할 수 없습니다** |
| 변경 가능성 | `mutable` 또는 `immutable` 로 만들 수 있고 `immutable` 속성은 **사용자를 만들 때만** 값을 쓸 수 있습니다 |

`username` 은 `name` 속성과 **별개 속성**입니다. 사용자 풀 안에서 고유해야 하고 사용자를 만든 뒤 값을 바꿀 수 없습니다.

> — 출처: [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

🔄 **앱 클라이언트별 속성 권한을 좁히는 것이 모범 사례입니다.** 새 앱 클라이언트를 만들면 기본적으로 **모든 표준·사용자 지정 속성에 읽기·쓰기 권한이 부여**되므로 필요한 최소 집합으로 제한해야 합니다. `email_verified` 와 `phone_number_verified` 에는 앱 클라이언트 쓰기 권한을 줄 수 없습니다([9장](#9-구현-모범-사례)).

🔄 **`dev:` 접두사를 쓰는 개발자 속성(developer attributes)은 레거시 기능입니다.** 교재는 속성을 표준과 사용자 지정 둘로만 나누는데, 문서는 `CreateUserPool` 의 `SchemaAttributes` 로 `dev:` 속성도 추가할 수 있지만 이것이 **앱 클라이언트 읽기·쓰기 권한으로 대체된 레거시 기능**이라고 명시합니다. 개발자 속성은 AWS 자격 증명으로만 수정할 수 있습니다([11.3절](#113-비권장지원-종료된-항목)).

### 5.2 필수 속성과 확인 가능한 속성

교재 슬라이드 17의 1단계 강사 노트는 "어떤 속성이 필수이고 확인이 필요한지 정의할 수 있습니다"라고만 적습니다. 여기에 **사용자 풀을 만든 뒤에는 되돌릴 수 없는 결정**이 세 개 숨어 있습니다.

| 결정 | 내용 | 생성 후 변경 |
|---|---|---|
| 필수 속성 | 표준 속성 옆의 `Required` 확인란을 선택하면 사용자가 값을 제공하지 않으면 등록할 수 없습니다 | **불가** |
| 사용자 이름 속성(username attributes) | 이메일 주소나 전화번호를 사용자 이름으로 씁니다 | **불가** |
| 별칭 속성(alias attributes) | 사용자 이름 · 선호 사용자 이름 · 이메일 주소 · 전화번호 중에서 고르게 합니다 | **불가** |

두 방식의 차이는 확인 요구입니다. **별칭 속성은 사용자가 그 속성으로 로그인하기 전에 이메일 주소나 전화번호를 확인해야 하지만 사용자 이름 속성은 그렇지 않습니다.** 별칭 값은 사용자 풀 안에서 고유해야 하고 확인된 상태는 한 계정에만 존재할 수 있습니다.

확인(verify)할 수 있는 속성은 **`email` 과 `phone_number` 둘뿐**입니다. 적절한 권한을 가진 관리자는 `AdminUpdateUserAttributes` API 또는 `admin-update-user-attributes` CLI 명령으로 사용자의 이메일·전화번호를 바꾸고 `email_verified` · `phone_number_verified` 를 `true` 로 설정해 확인됨으로 표시할 수 있습니다.

SMS 다중 인증이 활성화되어 있으면 사용자는 전화번호를 제공해야 합니다([4.5절](#45-다중-인증-mfa)).

일부 속성에는 형식 제약이 있습니다.

| 속성 | 형식 |
|---|---|
| `birthdate` | `YYYY-MM-DD` 형식의 유효한 **10자** 날짜 |
| `phone_number` | **플러스(`+`) 기호로 시작해 국가 코드가 바로 붙어야** 하고 `+` 와 숫자만 포함할 수 있습니다(예: `+14325551212`) |

> — 출처: [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

### 5.3 그룹

교재 슬라이드 15의 그룹 설명은 현재 문서와 일치합니다. 그룹으로 사용자 모음을 만들어 권한을 관리하거나 여러 유형의 사용자를 나타낼 수 있고, **그룹에 IAM 역할을 할당해 그룹 멤버의 권한을 정의**할 수 있습니다.

사용자는 여러 그룹에 속할 수 있고 토큰에 다음 클레임이 담깁니다.

| 클레임 | 내용 | 담기는 토큰 |
|---|---|---|
| `cognito:groups` | 사용자가 속한 **모든 그룹 목록** | 액세스 토큰 · ID 토큰 |
| `cognito:roles` | 그 그룹에 대응하는 **역할 목록** | 액세스 토큰 · ID 토큰 |
| `cognito:preferred_role` | 우선순위가 가장 높은 그룹의 **IAM 역할 하나** | ID 토큰 |

우선순위(precedence)는 사용자 풀에서 사용자가 속한 다른 그룹과 비교한 상대 우선순위를 지정하는 **음수가 아닌 수**입니다.

| 규칙 | 내용 |
|---|---|
| 방향 | **0이 최고 우선순위 값**입니다. 값이 작은 그룹이 더 크거나 `null` 인 그룹보다 우선합니다 |
| 선택 | 사용자가 둘 이상의 그룹에 속하면 **우선순위 값이 가장 작은 그룹의 IAM 역할**이 ID 토큰의 `cognito:preferred_role` 에 적용됩니다 |
| 동률 | 두 그룹이 같은 우선순위 값을 가질 수 있고 이때는 어느 쪽도 우선하지 않습니다 |
| 동률 + 같은 역할 | 같은 우선순위의 두 그룹이 **같은 역할 ARN** 을 가지면 그 역할이 `cognito:preferred_role` 에 쓰입니다 |
| 동률 + 다른 역할 | 역할 ARN이 다르면 **`cognito:preferred_role` 클레임이 설정되지 않습니다** |

마지막 두 줄이 교재에 없습니다. 우선순위를 같게 두면 역할이 조용히 사라질 수 있으므로 강의에서 짚을 가치가 있습니다.

🆕 **IdP마다 그룹이 자동으로 만들어집니다.** Amazon Cognito는 사용자 풀에 추가하는 OIDC · SAML · 소셜 IdP마다 사용자 그룹을 만들고 이름 형식은 **`[사용자 풀 ID]_[IdP 이름]`** 입니다. 자동 생성된 IdP 사용자 프로필이 그 그룹에 자동 추가됩니다([4.12절](#412-서드-파티-idp-페더레이션)).

🆕 **그룹의 제한 사항**도 교재에 없습니다.

| 제한 |
|---|
| 그룹 수가 서비스 할당량에 제한됩니다(사용자 풀당 **10,000개**, 조정 불가) |
| 그룹을 **중첩할 수 없습니다** |
| 그룹 **안의 사용자를 검색할 수 없습니다** |
| 그룹을 **이름으로 검색할 수 없습니다**(목록 조회는 가능) |

사용자 풀 안에서 그룹을 쓰는 데 **추가 비용은 없습니다.**

> — 출처: [Adding groups to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)

### 5.4 리소스 서버와 범위

교재 슬라이드 15의 강사 노트는 "자체 OAuth 2.0 리소스 서버를 만들고 서버에서 사용자 지정 범위를 정의할 수 있다"고 적습니다. 맞는 서술이지만 **전제 조건 하나와 제약 하나가 빠져 있습니다.**

먼저 전제입니다. **사용자 풀에 도메인을 구성해야** Amazon Cognito가 OAuth 2.0 권한 부여 서버와 가입·로그인 페이지를 프로비저닝합니다. 도메인이 없으면 리소스 서버를 만들 수 없습니다([3.4절](#34-로그인-화면-managed-login-과-hosted-ui-classic)).

**리소스 서버**는 OAuth 2.0 API 서버입니다. 액세스 보호 리소스를 지키기 위해 사용자 풀의 액세스 토큰이 요청된 메서드·경로를 승인하는 범위를 담고 있는지 검증합니다. 검증의 세 축은 이렇습니다.

| 무엇으로 | 무엇을 확인하는가 |
|---|---|
| 토큰 서명 | 발급자 |
| 만료 시각 | 유효성 |
| 토큰 클레임의 범위 | 액세스 수준 |

🆕 사용자 풀이 발급하는 범위는 **세 종류**입니다. 교재는 사용자 지정 범위만 다룹니다.

| 종류 | 값 | 무엇을 승인하는가 |
|---|---|---|
| 사용자 풀 예약 API 범위 | `aws.cognito.signin.user.admin` | 현재 사용자의 **자체 서비스 작업**(`GetUser` · `UpdateUserAttributes` 등) |
| 사용자 지정 범위 | `식별자/범위이름` | 리소스 서버가 보호하는 **외부 API** 요청 |
| OIDC 범위 | `openid` · `profile` · `email` · `phone` | **userInfo 엔드포인트**에서 사용자 정보를 읽을 권한 |

범위 표기의 권장 형식은 **`리소스서버식별자/범위이름`** 입니다. 예를 들어 `scope=solar-system-data/asteroids.add` 처럼 요청합니다.

🆕 **여기에 실습에서 바로 부딪히는 제약이 있습니다.** Amazon Cognito 사용자 풀 API 로그인(`InitiateAuth` · `AdminInitiateAuth`)으로 받은 액세스 토큰에는 **`aws.cognito.signin.user.admin` 범위만 담깁니다.** 이 두 작업은 사람이 상호 작용하는 인증용이기 때문입니다. 따라서 **API 로그인으로 받은 토큰으로는 사용자 지정 범위 기반 API 권한 부여를 할 수 없습니다.** 사용자 지정 범위가 담긴 액세스 토큰이 필요하면 토큰 엔드포인트를 거치는 OAuth 흐름을 써야 합니다. API Gateway 권한 부여자에 범위를 걸 때 직접 부딪히는 지점입니다([8장](#8-api-액세스-보안)).

범위 관리에서 알아 둘 점이 둘 더 있습니다.

| 항목 | 내용 |
|---|---|
| 삭제 | 리소스 서버에서 범위를 삭제해도 모든 클라이언트와의 연결이 삭제되지 않고 **비활성(inactive)** 으로 표시됩니다. 비활성 범위는 액세스 토큰에 추가되지 않습니다 |
| 미연결 범위 요청 | 앱 클라이언트에 연결하지 않은 범위를 요청하면 **인증이 실패**합니다 |

콘솔에서 리소스 서버는 `Branding` 아래 `Domain` 메뉴에서 만들고, 사용자 지정 범위는 앱 클라이언트의 `Login pages` 에서 활성화합니다. 사용자 풀당 리소스 서버 할당량은 25개(최대 300)입니다([3.9절](#39-서비스-할당량과-과금-단위)).

> — 출처: [Scopes, M2M, and resource servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html)

### 5.5 OAuth 2.0 그랜트 세 가지 🔄

교재 슬라이드 15의 강사 노트는 범위를 요청할 수 있는 흐름으로 "OAuth2.0 권한 부여 코드 부여 흐름, 암묵적 흐름과 클라이언트 보안 인증 정보 흐름"을 **아무런 우열 없이 나란히** 제시합니다. 현재 문서는 이 세 가지를 동급으로 다루지 않습니다.

| 그랜트 | `response_type` | 발급되는 토큰 | 문서의 평가 |
|---|---|---|---|
| **권한 부여 코드**(authorization code) | `code` | ID · Access · Refresh **세 가지 모두** | **가장 안전한 형태의 권한 부여 그랜트** |
| **암묵적**(implicit) | `token` | ID · Access **둘만** | **레거시 권한 부여 그랜트** |
| **클라이언트 자격 증명**(client credentials) | — | Access | 머신 대 머신 액세스용 **권한 부여 전용** |

권한 부여 코드 그랜트는 코드를 토큰 엔드포인트에서 토큰으로 교환하므로 **토큰 내용을 사용자에게 직접 보여 주지 않습니다.** 문서는 이 그랜트가 Amazon Cognito에서 권한 부여 서버로부터 **세 토큰 유형을 모두 받는 유일한 방법**이라고 명시합니다.

암묵적 그랜트는 콜백 URL에 `access_token` 과 `id_token` 을 붙여 반환하고 토큰 엔드포인트와의 추가 상호 작용이 없습니다. 문서는 이 그랜트를 레거시로 명시하고, **권한 부여 코드 그랜트와 달리 사용자가 토큰을 가로채 검사할 수 있으므로 암묵적 그랜트를 통한 토큰 전달을 막으려면 앱 클라이언트가 권한 부여 코드 그랜트만 지원하도록 구성하라**고 안내합니다([11.3절](#113-비권장지원-종료된-항목)).

클라이언트 자격 증명 그랜트에는 제약이 셋 있습니다.

| 제약 |
|---|
| 앱 클라이언트에 **클라이언트 보안 암호가 있어야** 합니다 ([4.9절](#49-앱-클라이언트-퍼블릭과-기밀)) |
| **클라이언트 자격 증명 그랜트만** 지원해야 합니다. 암묵적 또는 권한 부여 코드 그랜트와 **같은 앱 클라이언트에서 함께 활성화할 수 없습니다** |
| AWS 청구서에 **비용을 추가**합니다 |

> — 출처: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

### 5.6 PKCE 🆕

교재에 PKCE가 전혀 없습니다. **PKCE(Proof Key for Code Exchange)** 는 퍼블릭 클라이언트를 위한 OAuth 2.0 권한 부여 코드 그랜트의 확장이며 **가로채인 권한 부여 코드가 토큰으로 교환되는 것을 막습니다.** 브라우저·모바일 앱에서 권한 부여 코드 그랜트를 쓸 때 표준 보강 수단입니다.

동작은 네 단계입니다.

| 단계 | 내용 |
|---|---|
| 1 | 애플리케이션이 고유 문자열 **`code_verifier`** 를 생성합니다 |
| 2 | 그 문자열에 **SHA256 해시**를 적용해 **base64 로 인코딩**한 결과를 Authorize 엔드포인트 요청의 **`code_challenge`** 파라미터로 넘깁니다(`code_challenge_method=S256`) |
| 3 | 권한 부여 코드를 토큰으로 교환할 때 `code_verifier` 문자열을 **평문**으로 Token 엔드포인트의 `code_verifier` 파라미터에 넣습니다 |
| 4 | Amazon Cognito가 **같은 해시·인코딩 연산을 수행**해 권한 부여 요청에서 받은 `code_challenge` 와 같은 결과가 나올 때만 ID · Access · Refresh 토큰을 반환합니다 |

구현에는 사용자 풀에 **도메인**과 **퍼블릭 앱 클라이언트**가 필요합니다.

> — 출처: [Using PKCE in authorization code grants](https://docs.aws.amazon.com/cognito/latest/developerguide/using-pkce-in-authorization-code.html)

---

## 6. 토큰

교재 슬라이드 17~19입니다. 이 모듈의 핵심이고, 교재에서 **교정할 것이 가장 많이 몰려 있는 자리**이기도 합니다.

### 6.1 사용자 풀 로그인 흐름

교재 슬라이드 17이 제시하는 네 단계입니다. 강사 노트의 서술을 그대로 옮깁니다.

| 단계 | 내용 |
|---|---|
| 1 | 사용자 풀을 만들고 앱 클라이언트를 등록합니다. 어떤 속성이 필수이고 확인이 필요한지 정의합니다 ([5.2절](#52-필수-속성과-확인-가능한-속성)) |
| 2 | 사용자가 앱에 로그인 정보를 제출합니다 |
| 3 | Amazon Cognito가 로그인 정보를 확인합니다 |
| 4 | 성공하면 **세션을 만들어** 인증된 사용자를 위해 **ID · Access · Refresh 토큰을 반환**합니다 |

4단계 뒤에 앱이 할 수 있는 일이 둘입니다. 이것이 이 모듈의 나머지 절반을 가릅니다.

| 경로 | 내용 | 이 문서 |
|---|---|---|
| 토큰을 그대로 쓴다 | Amazon API Gateway 같은 다운스트림 리소스·API에 액세스 권한을 부여합니다 | [8장](#8-api-액세스-보안) |
| 토큰을 교환한다 | 다른 AWS 서비스에 액세스할 **임시 AWS 자격 증명**으로 교환합니다 | [7장](#7-자격-증명-풀) |

문서도 같은 두 갈래를 제시합니다. 사용자 풀 토큰은 **OIDC 인증의 증거이자 리소스 액세스 요청 수단**이며 **토큰의 클레임이 사용자 정보**입니다.

> — 출처: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.2 토큰 세 가지 비교

| 항목 | ID 토큰 | Access 토큰 | Refresh 토큰 |
|---|---|---|---|
| 무엇을 담는가 | 사용자 **자격 증명에 관한 클레임**(이름·성·이메일 주소) | 인증된 사용자에 관한 클레임, **그룹 목록, 범위 목록** | 불투명(opaque) |
| 무엇에 쓰는가 | 사용자를 **인증**합니다. 리소스 서버나 서버 애플리케이션에 사용자를 인증하는 데도 씁니다 | API 작업에 **권한을 부여**합니다 | 새 토큰을 얻거나 기존 토큰을 **폐기**합니다 |
| 형식 | JWT. **base64url 에서 평문 JSON 으로 디코딩 가능** | JWT. 디코딩 가능 | **암호화되어 있음.** 사용자 풀만 읽을 수 있고 사용자·관리자에게 불투명 |
| `token_use` 값 | `id` | `access` | — |
| 유효 기간 | 5분~1일 | 5분~1일 | 기본 30일(60분~10년) |
| 서명 키 | RSA 키 페어 A | **RSA 키 페어 B** (ID 토큰과 다름) | — |

두 가지를 함께 기억해야 합니다.

- `cognito:groups` 클레임은 **액세스 토큰과 ID 토큰 양쪽에** 들어갑니다. 교재는 이 클레임을 Access 토큰 전용으로 제시합니다([11.1절](#111-교재-기술이-사실과-다른-항목)).
- 사용자 이름 클레임의 **이름이 두 토큰에서 다릅니다.** ID 토큰은 `cognito:username`, 액세스 토큰은 `username` 입니다. 교재가 이 부분은 정확히 구분했습니다.

> — 출처: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.3 JWT 구조와 교재 예시 교정 🔄

JWT는 점(`.`)으로 구분된 **헤더 · 페이로드 · 서명** 세 섹션입니다. 교재 슬라이드 18이 ID 토큰 예시로 이 세 섹션을 보여 주는데, **교정할 것이 다섯 개** 있습니다.

| 교정한 것 | 교재 | 이 문서 |
|---|---|---|
| 헤더의 닫는 인용부호 | `"1234example=“` — 닫는 인용부호가 곧은 인용부호(`"`)가 아니라 **왼쪽 큰따옴표**(`“`) | 곧은 인용부호로 교정 |
| 헤더의 쉼표 | `kid` 줄 끝의 쉼표가 보이지 않고 마지막 `alg` 줄 뒤에는 **후행 쉼표**가 남아 있어 유효한 JSON이 아님 | 파싱 가능한 JSON으로 교정 |
| 서명 알고리즘 | 헤더는 `alg: RS256` 인데 서명 줄은 **`HMACSHA256(..., {secret})`** | `RS256`(RSA + SHA-256)으로 통일 |
| 클레임 이름 표기 | 강사 노트가 `Sub` · `Aud` · `Jti` · `Scope` 로 **첫 글자를 대문자**로 표기 | 모두 소문자 |
| `token_use` 값 표기 | 강사 노트가 값을 `ID` · `액세스` 로 표기 | `id` · `access` (소문자 문자열) |

교정한 헤더입니다.

```json
{
  "kid": "1234example=",
  "alg": "RS256"
}
```

`kid` 는 토큰의 JSON Web Signature(JWS)를 보호하는 데 쓴 키를 가리키며 **2048비트 RSA 프라이빗 서명 키에 대한 잘린 참조**입니다. `jwks_uri` 엔드포인트에서 사용자 풀의 서명 키 ID를 볼 수 있습니다([6.8절](#68-jwt-검증)).

🔄 **서명 알고리즘은 `RS256` 입니다.** 사용자 풀은 **SHA-256을 쓰는 RSA 서명**을 사용합니다. `HMACSHA256` 은 공유 비밀 키를 쓰는 **대칭 HMAC** 이고 `RS256` 은 **비대칭 서명**이므로 교재는 같은 슬라이드 안에서 두 알고리즘을 섞어 놓았습니다. 검증은 공유 비밀이 아니라 사용자 풀의 **공개 JWKS** 로 합니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html)

교재의 페이로드 예시는 그대로 유효합니다. 계정처럼 보이는 값만 문서 예시 형태로 두었습니다.

```json
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "aud": "xxxxxxxxxxxxexample",
  "email_verified": true,
  "token_use": "id",
  "auth_time": 1500009400,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example",
  "cognito:username": "StudentA",
  "exp": 1500013000,
  "given_name": "StudentA",
  "iat": 1500009400,
  "email": "StudentA@example.com",
  "jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "origin_jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
}
```

🔄 **페이로드는 암호화되지 않습니다.** 이것이 이 모듈에서 가장 중요한 교정입니다.

교재는 **세 곳**에서 페이로드를 암호화된 정보라고 기술합니다. 슬라이드 18 강사 노트의 "키의 클레임에 대한 **암호화된** 정보", 슬라이드 29 지식 확인 문제 4의 정답 "참", 슬라이드 36 용어의 "클레임: **암호화된** 사용자 정보가 있는 페이로드"입니다.

문서 기준으로는 이렇습니다.

| 대상 | 실제 |
|---|---|
| ID 토큰 · Access 토큰 | Amazon Cognito가 **base64url 로 인코딩한 문자열**로 발급하고, **base64url 에서 평문 JSON 으로 디코딩할 수 있습니다** |
| Refresh 토큰 | **암호화되어 있고** 사용자 풀 사용자·관리자에게 불투명하며 **사용자 풀만 읽을 수 있습니다** |

위에 실은 페이로드 예시 자체가 평문 JSON이므로 **슬라이드 18은 슬라이드 자신의 서술과도 어긋납니다.** 실무에서 이 차이가 만드는 결과는 분명합니다.

- **페이로드에 비밀을 담아서는 안 됩니다.** 누구든 디코딩해 읽을 수 있습니다.
- 무결성은 암호화가 아니라 **서명 검증**으로 보장합니다([6.8절](#68-jwt-검증)).
- 문서는 토큰이 개인 식별 정보와 보안 모델 정보를 담을 수 있으므로 **전송 중·저장 중 모든 토큰을 보호**하는 것을 모범 사례로 제시합니다.

이 교정에 따라 **슬라이드 29 문제 4의 정답을 거짓으로 바꿨습니다**.

> — 출처: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.4 ID 토큰의 클레임

ID 토큰의 기본 페이로드 클레임입니다. 교재가 다루는 것과 다루지 않는 것을 표시했습니다.

| 클레임 | 내용 | 교재 |
|---|---|---|
| `sub` | 인증된 사용자의 **고유 식별자(UUID)** | 있음 |
| `aud` | 사용자를 인증한 **사용자 풀 앱 클라이언트**. Amazon Cognito는 액세스 토큰의 `client_id` 에 **같은 값**을 넣습니다 | 있음 |
| `iss` | 토큰을 생성한 사용자 풀. 형식은 `https://cognito-idp.<Region>.amazonaws.com/<사용자 풀 ID>` | 있음 |
| `token_use` | 토큰의 의도된 목적. ID 토큰에서는 값이 **`id`** | 있음 |
| `auth_time` | 사용자가 **인증을 완료한** Unix 시간 | 있음 |
| `exp` · `iat` | 만료 시각 · 발급 시각 | 부분 |
| `jti` | JWT의 고유 식별자 | 있음 |
| `origin_jti` | **토큰 폐기 식별자.** refresh 토큰과 연결됩니다 | 🔄 "인증이 발생한 지점을 표시하는 JWT 식별자"로만 설명 |
| `cognito:username` | 사용자 풀 안의 사용자 이름 | 있음 |
| `email` · `email_verified` | 이메일 주소와 확인 여부 | 있음 |
| `cognito:groups` | 사용자가 속한 **그룹 목록** | 🆕 없음(Access 토큰 전용으로 제시) |
| `cognito:roles` | 허용된 **역할 ARN 집합** | 🆕 없음 |
| `cognito:preferred_role` | 우선순위가 가장 높은 그룹의 **역할 ARN** | 🆕 없음 |
| `identities` | **페더레이션 사용자**의 자격 증명 정보 | 🆕 없음 |
| `nonce` · `event_id` · `middle_name` | — | 🆕 없음 |

`sub` 를 다룰 때 주의할 점이 있습니다. **사용자 이름은 사용자 풀에서 고유하지 않을 수 있으므로 `sub` 가 사용자를 식별하는 가장 좋은 방법**입니다. 다만 Amazon Cognito는 특정 UUID 형식(RFC UUID 포함)을 따르지 않는 자체 형식으로 `sub` 를 생성하므로 **형식을 엄격히 검증해서는 안 됩니다.**

애플리케이션은 `iss` 값이 **예상 발급자 URL과 일치하는지 검증**해야 합니다.

ID 토큰에는 OIDC 표준 클레임과 사용자 풀에 정의한 사용자 지정 속성이 들어갈 수 있습니다. 사용자 지정 속성 값은 **속성 타입과 무관하게 항상 문자열**로 기록되고 이름에는 항상 **`custom:` 접두사**가 붙습니다([5.1절](#51-속성)).

> — 출처: [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html)

### 6.5 액세스 토큰의 클레임

액세스 토큰의 헤더 구조는 ID 토큰과 같습니다. **그런데 서명 키가 다릅니다.**

🆕 **Amazon Cognito는 사용자 풀마다 RSA 키 페어를 두 쌍 만들어 액세스 토큰과 ID 토큰을 각각 다른 프라이빗 키로 서명합니다.** 따라서 같은 사용자 세션의 두 토큰에서 **`kid` 값이 일치하지 않고, 앱 코드에서 두 토큰을 독립적으로 검증해야 합니다.** 교재에 이 사실이 없습니다.

| 클레임 | 내용 | 교재 |
|---|---|---|
| `sub` | 인증된 사용자의 고유 식별자(UUID) | 있음 |
| `client_id` | 사용자를 인증한 **사용자 풀 앱 클라이언트**. ID 토큰의 `aud` 와 **같은 값** | 🆕 없음 |
| `aud` | 액세스 토큰이 권한을 부여하려는 **API의 URL**. 애플리케이션이 권한 부여 서버에 **리소스 바인딩을 요청한 경우에만** 존재 | 🆕 없음 |
| `token_use` | 값이 **`access`** | 있음 |
| `scope` | 로그인한 사용자에게 발급된 **OAuth 2.0 범위 목록** | 있음 |
| `cognito:groups` | 사용자가 속한 그룹 목록 | 있음 |
| `username` | 사용자 풀 안의 사용자 이름 | 있음 |
| `iss` · `auth_time` · `origin_jti` · `jti` | ID 토큰과 같은 의미 | 있음 |
| `device_key` · `version` · `event_id` · `exp` · `iat` | — | 🆕 없음 |

범위에 관한 제약은 [5.4절](#54-리소스-서버와-범위)과 같습니다. 토큰 엔드포인트에서 온 토큰은 앱 클라이언트가 지원하는 어떤 범위든 담을 수 있지만 **Amazon Cognito API 로그인에서 온 토큰은 `aws.cognito.signin.user.admin` 범위만** 담습니다.

🔄 **액세스 토큰의 목적을 교재보다 넓게 봐야 합니다.** 교재는 "사용자 풀에 있는 사용자의 API 작업에 권한을 부여한다"로 좁게 적습니다. 문서는 사용자 풀 자체 서비스 작업(속성 추가·변경·삭제 등)과 함께 **외부 API 권한 부여**를 제시하고, Amazon API Gateway가 Amazon Cognito 액세스 토큰으로 권한 부여를 지원한다고 명시합니다([8장](#8-api-액세스-보안)).

Essentials 또는 Plus 기능 요금제에서는 **pre token generation Lambda 트리거로 런타임에 액세스 토큰에 범위를 추가**할 수 있습니다([6.10절](#610-토큰-사용자-지정)).

> — 출처: [Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html)

### 6.6 토큰 유효 기간

교재 슬라이드 18이 제시하는 범위는 **현재 문서와 일치합니다.**

| 토큰 | 기본값 | 설정 범위 | 설정 단위 |
|---|---|---|---|
| ID 토큰 | — | **5분 ~ 1일** | 앱 클라이언트별 |
| Access 토큰 | — | **5분 ~ 1일** | 앱 클라이언트별 |
| Refresh 토큰 | **30일** | **60분 ~ 10년** | 앱 클라이언트별 |

🔄 **기준점 하나가 틀렸습니다.** 교재는 refresh 토큰 기본 만료를 "애플리케이션 사용자가 사용자 풀에 **가입**한 후 30일"이라고 적습니다. 문서 표현은 "사용자가 사용자 풀에 **로그인한 후**(signs into your user pool) 30일"이므로 기준은 가입이 아니라 로그인입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

🆕 **managed login 을 쓰면 1시간 미만 설정이 의미가 없습니다.** 문서는 managed login을 쓰는 경우 액세스·ID 토큰의 최소 기간을 1시간보다 짧게 지정하지 말라고 권고합니다. **managed login이 브라우저에 1시간 유효한 쿠키를 설정**하므로, 토큰 기간을 1시간 미만으로 두어도 쿠키 유효 기간과 사용자가 추가 자격 증명 없이 재인증할 수 있는 1시간에는 영향을 주지 않기 때문입니다([3.4절](#34-로그인-화면-managed-login-과-hosted-ui-classic)).

> — 출처: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 6.7 refresh 토큰 교체 🆕

교재는 refresh 토큰을 "새 ID와 Access 토큰을 검색할 수 있다"로만 설명합니다. 문서는 **refresh 토큰 교체(rotation)를 보안 모범 사례로 권장**합니다.

| 항목 | 교체 켬 | 교체 끔 |
|---|---|---|
| 갱신 시 원래 토큰 | **무효화**하고 새 refresh 토큰을 발급 | 계속 유효 |
| 갱신 응답 | ID · Access · **Refresh** 토큰을 함께 반환 | Access · ID 토큰만 반환 |
| 새 토큰의 기간 | 원래 refresh 토큰의 **남은 기간** | — |
| 유예 기간 | 재시도를 위해 원래 토큰에 **최대 60초** | — |
| JWT 크기 | `origin_jti` 와 `jti` 가 액세스·ID 토큰에 추가되어 **커집니다** | — |

🆕 **여기에 함정이 있습니다.** 교체는 **`REFRESH_TOKEN_AUTH` 인증 흐름과 호환되지 않습니다.** 따라서 앱 클라이언트에서 이 흐름을 비활성화하고 **`GetTokensFromRefreshToken` API 작업**으로 갱신 요청을 보내도록 애플리케이션을 설계해야 합니다([4.7절](#47-인증-흐름)).

토큰 갱신 경로는 세 가지입니다.

| 경로 | 교체와의 호환 |
|---|---|
| `GetTokensFromRefreshToken` API | 호환 |
| `InitiateAuth` · `AdminInitiateAuth` 의 `REFRESH_TOKEN_AUTH` 흐름 | **비호환** |
| OAuth 토큰 엔드포인트의 `refresh_token` 그랜트 | — |

> — 출처: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 6.8 JWT 검증 🆕

교재에는 검증 절차가 전혀 없습니다. 슬라이드 18 강사 노트의 "서명 - 토큰의 헤더와 페이로드를 바탕으로 계산됩니다"와 "키 원본과 키 원본의 변조 여부를 확인합니다"가 서명에 관한 서술의 전부입니다.

문서는 검증이 필요한 이유를 분명히 말합니다. **JWT는 쉽게 디코딩·읽기·수정할 수 있습니다.**

| 무엇이 수정되면 | 어떤 위험 |
|---|---|
| 액세스 토큰 | **권한 상승** |
| ID 토큰 | **신원 위장** |

그래서 **OIDC 인증에서 온 JWT를 처리하는 애플리케이션은 로그인마다 검증을 수행해야** 합니다. 절차는 세 단계입니다.

| 단계 | 내용 |
|---|---|
| 1. 토큰 디코딩 | base64url로 인코딩된 JWT가 `[JSON 헤더].[JSON 페이로드].[서명]` 형식이 아니면 **유효한 Amazon Cognito 토큰이 아니므로 버릴 수 있습니다** |
| 2. `kid` 비교 | 사용자 풀의 공개 JWK를 **JWKS로 내려받아 저장**하고 로컬 `kid` 를 공개 `kid` 와 비교합니다 |
| 3. 클레임 검증 | `exp` · `aud`(또는 `client_id`) · `iss` · `token_use` 를 확인합니다 |

`jwks_uri` 형식과 JWK 필드입니다.

```text
https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json
```

JWK의 필드는 `kid` · `alg` · `kty` · `e` · `n` · `use` 입니다.

3단계에서 확인할 클레임을 정리하면 이렇습니다.

| 클레임 | 확인할 것 |
|---|---|
| `exp` | 만료되지 않았는지 |
| `aud`(ID 토큰) / `client_id`(액세스 토큰) | 사용자 풀에서 만든 **앱 클라이언트 ID와 일치**하는지 |
| `iss` | 사용자 풀과 일치하는지(`https://cognito-idp.<Region>.amazonaws.com/<userpoolID>`) |
| `token_use` | 액세스 토큰만 받으면 `access`, ID 토큰만 쓰면 `id`, 둘 다 쓰면 `id` 또는 `access` |

🆕 **키 교체에 대비해야 합니다.** Amazon Cognito가 사용자 풀의 서명 키를 교체할 수 있으므로, 모범 사례는 **`kid` 를 캐시 키로 삼아 공개 키를 앱에 캐시하고 주기적으로 갱신**하는 것입니다. **발급자는 맞는데 `kid` 가 다른 토큰**을 받으면 서명 키가 교체된 것일 수 있으므로 `jwks_uri` 에서 캐시를 갱신합니다.

Node.js 앱에서는 AWS가 **`aws-jwt-verify`** 라이브러리를 권장합니다.

```javascript
// aws-jwt-verify 로 액세스 토큰을 검증합니다.
// tokenUse 를 명시하면 라이브러리가 token_use 클레임까지 확인합니다.
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-1_example',
  clientId: 'xxxxxxxxxxxxexample',
  tokenUse: 'access', // ID 토큰을 검증할 때는 'id'
});

try {
  // 검증에 성공하면 디코딩된 페이로드를 돌려줍니다.
  // 라이브러리가 jwks_uri 에서 공개 키를 가져와 캐시하고 kid 교체도 처리합니다.
  const payload = await verifier.verify(accessToken);
  console.log('검증 성공. 사용자:', payload.sub);
} catch (err) {
  // 서명 불일치·만료·aud 불일치·token_use 불일치는 모두 여기로 옵니다.
  console.error('토큰이 유효하지 않습니다:', err);
}
```

> — 출처: [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

### 6.9 토큰 폐기 🆕

교재는 토큰 폐기를 전혀 다루지 않고 `origin_jti` 를 "인증이 발생한 지점을 표시하는 JWT 식별자"로만 설명합니다. **`origin_jti` 는 토큰 폐기 식별자**입니다.

refresh 토큰을 폐기하면 **그 refresh 토큰이 이전에 발급한 모든 액세스 토큰이 무효**가 되고, 사용자에게 발급된 **다른 refresh 토큰은 영향을 받지 않습니다.** Amazon Cognito는 토큰을 폐기할 때 같은 `origin_jti` 값을 가진 액세스·ID 토큰을 무효로 처리합니다.

폐기 방법은 네 가지입니다.

| 방법 | 무엇을 폐기하는가 | 누가 호출하는가 |
|---|---|---|
| `RevokeToken` | 주어진 refresh 토큰의 모든 액세스 토큰(대화형 로그인의 최초 액세스 토큰 포함) | 앱 |
| Revoke 엔드포인트(`/oauth2/revoke`) | 주어진 refresh 토큰과 그것이 생성한 모든 ID·액세스 토큰. **사용자 풀에 도메인을 추가한 뒤** 쓸 수 있습니다 | 앱 |
| `GlobalSignOut` | 요청 사용자의 **모든** refresh·ID·액세스 토큰 | 사용자가 **자신의 액세스 토큰**으로 권한 부여하는 자체 서비스 작업 |
| `AdminUserGlobalSignOut` | 대상 사용자의 **모든** refresh·ID·액세스 토큰 | 관리자가 **IAM 자격 증명**으로 권한 부여하는 서버 측 작업 |

🆕 **여기가 API 권한 부여 설계에 직접 영향을 주는 지점입니다.** 사용자 풀 JWT는 생성 시점에 할당된 서명과 만료 시각을 담은 **자기 완결형(self-contained) 토큰**입니다. 따라서 **폐기된 토큰은 토큰을 요구하는 Amazon Cognito API 호출에는 쓸 수 없지만, 서명과 만료만 검증하는 JWT 라이브러리로 검증하면 여전히 유효하게 보입니다.**

즉 "로그아웃하면 그 토큰은 못 쓴다"가 자동으로 성립하지 않습니다. 폐기를 실제 접근 차단으로 만들려면 검증 측에서 추가 확인이 필요합니다.

구성에 관해 알아 둘 점이 셋입니다.

| 항목 | 내용 |
|---|---|
| 기본값 | 새 사용자 풀 클라이언트를 만들면 토큰 폐기가 **기본적으로 활성화**됩니다(콘솔·CLI·API 모두) |
| JWT 크기 | 폐기를 활성화하면 액세스·ID 토큰에 `origin_jti` 와 `jti` 클레임이 추가되어 **토큰 크기가 커집니다** |
| 되돌리기 | 폐기를 활성화했던 앱 클라이언트에서 폐기를 비활성화해도 **이미 폐기된 토큰이 다시 활성화되지는 않습니다** |

> — 출처: [Ending user sessions with token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)

### 6.10 토큰 사용자 지정 🆕

교재 슬라이드 18은 ID·액세스 토큰의 클레임을 **고정된 목록**으로만 제시합니다. 실제로는 앱에 전달되는 토큰을 사용자 지정할 수 있습니다.

| 항목 | 내용 |
|---|---|
| 어디서 | **Pre token generation Lambda 트리거** ([4.11절](#411-lambda-트리거)) |
| 무엇을 | 토큰 클레임을 **추가·수정·억제** |
| 트리거가 받는 것 | OAuth 2.0 범위, 사용자 풀 그룹 멤버십, 사용자 속성 등 **기본 클레임 집합** |
| 트리거가 하는 것 | 런타임에 변경한 클레임을 Amazon Cognito에 돌려줍니다 |
| 요금제 조건 | **액세스 토큰** 사용자 지정은 요금제가 **Lite가 아니어야** 하고 트리거 구성을 **이벤트 버전 2** 로 갱신해야 합니다 ([3.5절](#35-기능-요금제-lite-essentials-plus)) |
| 비용 | version 2 이벤트를 쓰는 액세스 토큰 사용자 지정에는 **추가 비용이 발생**합니다 |

> — 출처: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

---

## 7. 자격 증명 풀

교재 슬라이드 21입니다. 사용자 풀이 "누구인지"를 다루는 곳이라면 자격 증명 풀은 **"AWS 리소스에 무엇을 할 수 있는지"** 를 다루는 곳입니다.

### 7.1 자격 증명 풀이 하는 일

자격 증명 풀은 사용자나 게스트에게 할당해 **임시 AWS 자격 증명**을 받도록 권한을 부여하는 **고유 식별자(identity)의 모음**입니다. 문서가 제시하는 네 가지 일입니다.

| 하는 일 | 내용 |
|---|---|
| 자격 증명 발급 | 앱이 사용자에게 리소스를 제공하도록 **AWS 자격 증명을 발급**합니다 |
| 사용자 인증 | 사용자 풀이나 SAML 2.0 서비스 같은 **신뢰된 자격 증명 공급자**로 사용자를 인증합니다 |
| 게스트 | 게스트 사용자용 자격 증명도 **선택적으로** 발급합니다 |
| 권한 관리 | **역할 기반**·**속성 기반** 액세스 제어로 권한을 관리합니다 |

🔄 **교재의 "AWS 액세스 키"는 임시 AWS 자격 증명입니다.** 슬라이드 10 본문은 자격 증명 풀을 선택하는 질문을 "사용자에게 **AWS 액세스 키**를 부여해야 하는가?"로 씁니다. 문서는 자격 증명 풀이 **임시 AWS 자격 증명(temporary AWS credentials)** 을 발급한다고 기술하며, 같은 덱의 슬라이드 10 강사 노트와 슬라이드 21도 "임시 보안 인증 정보"로 씁니다. "액세스 키"라는 표현은 IAM 사용자의 **장기 액세스 키**와 혼동될 수 있습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

자격 증명 풀은 **사용자 풀과의 통합을 요구하지 않습니다.** 사용자 풀도 자격 증명 풀 없이 앱·웹 서버·API로 인증된 JWT를 직접 발급할 수 있습니다. 두 요소를 함께 쓰는 세 단계 흐름은 [3.3절](#33-둘을-함께-쓰는-흐름)에 있습니다.

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.2 사용자 프로필을 저장하지 않는다

교재 슬라이드 21 강사 노트의 "자격 증명 풀은 어떤 사용자 프로필도 저장하지 않습니다"는 **맞는 서술**입니다. 문서의 비교 표에서 `User directory — Store user profiles for authentication` 은 **사용자 풀에만** 체크되고 자격 증명 풀에는 체크되지 않습니다.

자격 증명 풀이 저장하는 것은 **identity** 입니다. identity는 앱 사용자와 그 사용자 자격 증명을 **자격 증명 풀과 신뢰 관계가 있는 외부 사용자 디렉터리의 프로필에 연결하는 UUID** 입니다.

교재 슬라이드 21 강사 노트가 짚는 특성도 문서와 일치합니다. "두 가지 애플리케이션에 대해 서로 다른 두 가지 자격 증명 풀을 사용하는 경우 동일한 최종 사용자는 각 자격 증명 풀에서 다른 고유 식별자를 가집니다." 문서 표현으로는 **Amazon Cognito UUID가 사용자 풀 또는 자격 증명 풀 단위로 고유**합니다.

🆕 교재에 없는 주의가 셋 있습니다.

| 항목 | 내용 |
|---|---|
| 형식 검증 | Amazon Cognito UUID는 **특정 UUID 형식(RFC UUID 포함)을 따르지 않으므로 형식을 엄격히 검증해서는 안 됩니다.** 문서 예시의 identity ID는 `us-east-1:12345678-1234-1234-1234-123456790ab` 처럼 리전 접두사와 UUID를 콜론으로 이은 형태입니다 |
| IdP의 `sub` 와 다름 | 신뢰 정책의 `cognito-identity.amazonaws.com:sub` 조건 키가 쓰는 UUID는 **자격 증명 풀의 identity ID이고 원래 자격 증명 공급자의 `sub` 값이 아닙니다** ([7.6절](#76-신뢰-정책-조건-키)) |
| 삭제 | 자격 증명을 삭제하면 Amazon Cognito가 저장한 식별 정보가 제거되고, 사용자가 다시 자격 증명을 요청하면 그 IdP를 여전히 신뢰하는 경우 **새 identity ID를 받습니다** |

> — 출처: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

### 7.3 게스트 액세스

교재 슬라이드 10 강사 노트의 "인증되지 않은 사용자인 경우 기본값으로 IAM 역할/정책을 따른다"와 슬라이드 11의 "인증되지 않은 게스트"는 맞는 서술입니다. 슬라이드 29 문제 6(자격 증명 풀은 미인증 사용자에게 AWS 보안 인증 정보를 제공할 수 있다 — 참)도 문서와 일치합니다.

자격 증명 풀은 **두 유형의 자격 증명**을 지원합니다.

| 유형 | 누구인가 | 역할 |
|---|---|---|
| 인증된 자격 증명 | 지원되는 **자격 증명 공급자가 인증한** 사용자 | 인증된 사용자용 기본 역할 |
| 인증되지 않은 자격 증명 | 보통 **게스트 사용자** | 게스트용 제한 권한 역할 |

Amazon Cognito는 요청을 받으면 **자격 증명 유형을 판별해 그 유형에 할당된 역할과 역할에 연결된 정책으로 응답**합니다.

🆕 **게스트 액세스는 별도로 활성화해야 합니다.** 교재는 이 선택을 다루지 않습니다.

| 항목 | 내용 |
|---|---|
| 기본 상태 | 게스트 액세스를 지원하지 않는 자격 증명 풀에서 콘솔의 `Guest access` 상태는 **`Inactive`** 입니다 |
| 활성화 조건 | 게스트 사용자용 **기본 IAM 역할을 지정**해야 합니다 |
| 콘솔 선택 | 자격 증명 풀을 만들 때 `Authenticated access`, `Guest access` 또는 **둘 다**를 선택합니다 |
| 기존 역할 사용 | 역할 신뢰 정책에 **`cognito-identity.amazonaws.com`** 을 포함해야 합니다 ([7.6절](#76-신뢰-정책-조건-키)) |
| identity ID 획득 | 게스트 액세스가 활성화되어 있으면 사용자는 **`GetId` API로 언제든 새 identity ID를 요청**할 수 있고, 애플리케이션이 이 identity ID를 **캐시해 이후 호출에 쓰는 것이 기대**됩니다 |

> — 출처: [Identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)

### 7.4 enhanced 흐름과 basic (classic) 흐름 🆕

교재는 이 구분 자체를 다루지 않습니다. 그런데 슬라이드 25 강사 노트가 제시하는 API가 **둘 중 비권장 쪽**입니다.

자격 증명 풀은 퍼블릭 공급자 인증에 **두 흐름**을 제공합니다.

| 항목 | enhanced(단순화) 흐름 | basic(classic) 흐름 |
|---|---|---|
| 작업 순서 | `GetId` → **`GetCredentialsForIdentity`** (2단계) | `GetId` → **`GetOpenIdToken`** → **`AssumeRoleWithWebIdentity`** (3단계) |
| 역할을 누가 고르는가 | **자격 증명 풀 구성**이 IAM 역할 선택과 자격 증명 검색 로직을 관리 | **애플리케이션**이 사용자가 맡을 IAM 역할을 직접 선택 |
| 자격 증명을 누가 반환 | 자격 증명 풀 | **AWS STS** |
| 자격 증명 유효 기간 | **1시간** | 사용자 지정 역할 세션 기간을 요청할 수 있습니다 |
| 역할 매핑 | 기본 역할 선택, ABAC, RBAC를 구성할 수 있습니다 | 클라이언트에 역할 선택 로직 구현 |
| 계정 경계 | IAM 역할이 자격 증명 풀과 **같은 AWS 계정**에 있어야 합니다 | 애플리케이션이 **다른 계정**의 역할을 요청할 수 있습니다 |
| 문서의 평가 | **개발자 노력이 가장 적은 가장 안전한 선택** | 배포하는 자격 증명을 더 세밀하게 제어 |

`GetCredentialsForIdentity` 는 기능적으로 **`GetOpenIdToken` 다음에 `AssumeRoleWithWebIdentity` 를 호출하는 것과 같습니다.**

자격 증명 풀이 공급자로부터 받는 **인증 아티팩트**는 공급자마다 다릅니다.

| 공급자 | 아티팩트 |
|---|---|
| Amazon Cognito 사용자 풀 | **ID 토큰** |
| OIDC | ID 토큰 |
| SAML 2.0 | **SAML 어설션** |
| 소셜 공급자 | **액세스 토큰** |

🔄 **교재 슬라이드 25가 설명하는 흐름과 참조하는 문서가 어긋납니다.** 강사 노트 3단계는 사용자가 `GetOpenIdToken` 과 `AssumeRoleWithWebIdentity` 요청을 발행한다고 서술하면서, 참조 링크로 [Understanding Amazon Cognito Authentication Part 4: Enhanced Flow](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication-part-4-enhanced-flow/) 블로그를 제시합니다. 두 API는 **basic(classic) 흐름**의 API이므로 설명하는 흐름과 참조하는 문서가 서로 다른 흐름입니다. 참조 URL 자체는 살아 있으나 이 문서는 흐름에 관한 사실을 개발자 안내서에서 확인했습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

🔄 **basic 흐름은 비권장입니다.** 문서는 **새 자격 증명 풀을 만들 때 basic(classic) 인증을 기본으로 활성화하지 않는 것**을 모범 사례로 제시합니다. basic 흐름을 쓰려면 먼저 웹 자격 증명용 IAM 역할의 신뢰 관계를 평가하고 **역할 선택 로직을 클라이언트에 구현한 뒤 클라이언트가 사용자에 의해 변조되지 않도록 보호**해야 합니다([11.3절](#113-비권장지원-종료된-항목)).

두 흐름이 충돌하는 지점도 있습니다. **역할 매핑(`RoleMappings`)이 있는 자격 증명 풀에서 `GetOpenIdToken` 을 시도하면 오류가 발생합니다.**

```text
Basic (classic) flow is not supported with RoleMappings, please use enhanced flow.
```

basic 흐름에서 `GetOpenIdToken` 이 반환하는 것은 **자격 증명 풀이 발급한 새 OAuth 2.0 토큰**입니다. 앱은 이 토큰을 `AssumeRoleWithWebIdentity` 요청의 **`WebIdentityToken`** 파라미터로 제시합니다. 문서는 **OpenID 토큰을 제출하기 전에 앱에서 검증**하라고 안내하며 SDK의 OIDC 라이브러리나 `aws-jwt-verify` 같은 라이브러리를 쓸 수 있다고 기술합니다([6.8절](#68-jwt-검증)).

두 흐름의 권한 범위 차이도 알아 둘 가치가 있습니다. **basic 흐름의 `AssumeRoleWithWebIdentity` 요청은 충분한 신뢰 정책을 구성한 어떤 IAM 역할에 대해서도 자격 증명을 요청할 수 있는 더 큰 능력을 앱에 주는 반면, enhanced 흐름의 `GetCredentialsForIdentity` 요청은 토큰 내용에 근거해 역할을 요청합니다.**

> — 출처: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

### 7.5 역할 선택 네 갈래 🆕

교재는 자격 증명 풀의 역할 선택을 "인증된 사용자면 사용자 풀·서드 파티 페더레이션으로 권한을 부여하고 인증되지 않은 사용자면 기본값으로 IAM 역할/정책을 따른다"로만 서술합니다. 실제로는 **네 갈래**입니다.

| 방식 | 무엇을 근거로 | 어디에 구성 |
|---|---|---|
| 기본 역할 | 자격 증명 유형(인증/게스트) | 자격 증명 풀 설정 |
| 토큰 기반 | ID 토큰의 **`cognito:preferred_role`** · **`cognito:roles`** 클레임 | 사용자 풀 그룹의 IAM 역할 ([5.3절](#53-그룹)) |
| 규칙 기반 매핑 | IdP 토큰의 **클레임** | 자격 증명 풀의 역할 매핑 |
| 속성 기반(ABAC) | 토큰·어설션의 속성을 **프린시펄 태그**로 매핑 | 액세스 제어용 속성 |

역할이 여러 개일 때 자격 증명 풀이 고르는 **순서**가 정해져 있습니다.

| 순위 | 조건 | 결과 |
|---|---|---|
| 1 | `GetCredentialsForIdentity` 의 **`CustomRoleArn`** 이 설정되어 있고 `cognito:roles` 클레임의 역할과 **일치** | 그 역할을 사용 |
| 1 | `CustomRoleArn` 이 설정되어 있으나 **일치하지 않음** | **액세스를 거부** |
| 2 | **`cognito:preferred_role`** 클레임이 설정되어 있음 | 그 역할을 사용 |
| 3 | `preferred_role` 은 없고 `cognito:roles` 만 있고 `CustomRoleArn` 도 없음 | 콘솔의 `Role resolution` 설정 또는 API의 **`AmbiguousRoleResolution`** 필드로 결정 |

**규칙 기반 매핑**은 IdP 토큰의 클레임을 IAM 역할에 매핑합니다. 각 규칙은 **토큰 클레임 · 일치 유형 · 값 · IAM 역할**을 지정합니다.

| 항목 | 내용 |
|---|---|
| 일치 유형 | `Equals` · `NotEqual` · `StartsWith` · `Contains` |
| 평가 순서 | 규칙은 **순서대로 평가**되고 **첫 일치 규칙**의 역할이 쓰입니다 |
| 사용자 지정 속성 | 규칙 설정에서 표준 속성과 구분하기 위해 **`custom:` 접두사**가 필요합니다 |
| 일치 없음 | `Role resolution` 설정에 따라 기본 인증된 역할을 쓰거나 **요청을 거부**합니다 |

🆕 **`iam:PassRole` 이 필요한 경우가 있습니다.** 자신의 기존 권한을 넘는 권한을 가진 역할을 자격 증명 풀에 설정하게 하려면 **`iam:PassRole` 권한을 부여**해야 합니다.

> — 출처: [Using role-based access control](https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html)

🆕 **속성 기반 액세스 제어(ABAC)** 는 자격 증명 풀에서 "액세스 제어용 속성(attributes for access control)"이라고 불립니다. 소셜·기업 자격 증명 공급자의 액세스·ID 토큰이나 SAML 어설션 안의 속성을 **IAM 권한 정책에서 참조할 수 있는 태그에 매핑**합니다.

| 항목 | 내용 |
|---|---|
| 매핑 | 콘솔의 `Attribute names` 가 `Tag key for principal` 에 매핑됩니다. 데이터 소스로 설정한 `Claim` 이 선택한 태그 키의 값을 정합니다 |
| 정책에서 쓰기 | IAM 정책은 **`${aws:PrincipalTag/tagkey}`** 조건으로 액세스를 평가합니다 |
| 필요한 권한 | 역할 신뢰 정책이 `AssumeRoleWithWebIdentity` 를 허용하고, **사용자 세션에 프린시펄 태그를 적용할 권한**도 함께 부여해야 합니다 |
| 콘솔 옵션 | IdP별로 `Inactive`, `Use default mappings`(`sub`·`aud` 클레임 기반), `Use custom mappings` 중에서 구성합니다 |
| 이점 | 여러 직무별 정책을 만들지 않고 **사용자 속성을 쓰는 기본 정책 하나**로 권한을 관리할 수 있고, 리소스나 사용자를 추가·제거할 때마다 정책을 갱신하지 않아도 됩니다 |

> — 출처: [Using attributes for access control](https://docs.aws.amazon.com/cognito/latest/developerguide/attributes-for-access-control.html)

### 7.6 신뢰 정책 조건 키 🆕

교재 슬라이드 21은 "자격 증명 풀은 IAM 역할과 결합된 AWS 보안 인증 정보를 반환한다"로만 적고 **그 역할이 어떤 신뢰 정책을 가져야 하는지** 다루지 않습니다. 여기에 **빠뜨리면 IAM이 저장을 거부하는 필수 조건**이 있습니다.

AWS STS에 제시되는 토큰은 자격 증명 풀이 생성하며, 사용자 풀·소셜·OIDC 공급자 토큰이나 SAML 어설션을 자격 증명 풀 자체 토큰으로 변환한 것입니다. **이 토큰의 `aud` 클레임이 자격 증명 풀 ID입니다.**

신뢰 정책의 `Principal` 이 `cognito-identity.amazonaws.com` 같은 자격 증명 풀 서비스 프린시펄인 경우, **아무 자격 증명 풀이나 역할을 맡을 수 있게 만들 수 없습니다.** 자기 자격 증명 풀만 `AssumeRoleWithWebIdentity` 를 수행하도록 요구하는 `Condition` 이 있어야 하고, **`aud` 조건은 필수입니다. 이 유형의 조건 없이 역할 신뢰 정책을 저장하려 하면 IAM이 오류를 반환합니다.**

쓸 수 있는 OIDC 페더레이션 조건 키는 **세 개**입니다.

| 조건 키 | 무엇을 제한하는가 | 필수 |
|---|---|---|
| `cognito-identity.amazonaws.com:aud` | 역할을 **하나 이상의 자격 증명 풀**에서 온 작업으로 제한 | **필수** |
| `cognito-identity.amazonaws.com:amr` | 역할을 **`authenticated`** 또는 **`unauthenticated`**(게스트) 사용자로 제한 | 선택 |
| `cognito-identity.amazonaws.com:sub` | 역할을 **하나 이상의 사용자(UUID)** 로 제한 | 선택 |

`amr` 에는 공급자 정보도 들어갑니다. Amazon Cognito는 토큰을 만들 때 `amr` 을 `unauthenticated` 또는 `authenticated` 로 설정하고, **`authenticated` 이면 인증에 쓴 공급자도 토큰에 포함**합니다. 따라서 `amr` 조건을 `graph.facebook.com` 처럼 두어 **특정 공급자로 로그인한 사용자만 신뢰하는 역할**을 만들 수 있습니다.

인증된 사용자용 신뢰 정책의 형태입니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "cognito-identity.amazonaws.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "us-east-1:12345678-1234-1234-1234-123456790ab"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

🆕 **enhanced 흐름 역할에 `aws:SourceIp` 를 넣으면 안 됩니다.** enhanced 흐름이 **애플리케이션을 대신해** `AssumeRoleWithWebIdentity` 요청을 생성하므로 요청의 소스 IP가 애플리케이션 클라이언트의 IP가 아니어서 **조건이 절대 충족되지 않습니다**([7.4절](#74-enhanced-흐름과-basic-classic-흐름)).

신뢰 관계가 잘못 구성되면 다음 예외가 발생합니다.

```text
AccessDenied -- Not authorized to perform sts:AssumeRoleWithWebIdentity
```

> — 출처: [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html)

### 7.7 개발자 인증 자격 증명 🆕

교재는 자격 증명 풀의 페더레이션을 소셜·SAML·OIDC IdP 기반으로만 다룹니다. **자체 백엔드 인증 시스템을 쓰면서 자격 증명 풀로 AWS 자격 증명을 발급하는 경로**가 따로 있습니다.

| 항목 | 내용 |
|---|---|
| 무엇을 할 수 있나 | **기존 자체 인증 프로세스로 사용자를 등록·인증**하면서도 Amazon Cognito로 사용자 데이터를 동기화하고 AWS 리소스에 액세스합니다 |
| 시작 API | **`GetOpenIdTokenForDeveloperIdentity`**. enhanced 와 basic 인증 **양쪽 모두**의 개발자 인증을 시작하며 **관리 자격 증명으로 요청을 인증**합니다 |
| `Logins` 맵 | `login.mydevprovider` 같은 **개발자 공급자 이름**과 사용자 지정 식별자의 쌍입니다 |
| enhanced 조합 | `GetOpenIdTokenForDeveloperIdentity` → `GetCredentialsForIdentity` |
| basic 조합 | `GetOpenIdTokenForDeveloperIdentity` → `AssumeRoleWithWebIdentity` |
| 콘솔 | `Custom developer provider` 를 추가합니다. **개발자 공급자 이름은 추가한 뒤 변경·삭제할 수 없습니다** |

enhanced 인증에서 주의할 점이 있습니다. `GetOpenIdTokenForDeveloperIdentity` 가 반환한 토큰의 **발급자를 키, 토큰 자체를 값**으로 하는 `Logins` 맵으로 `GetCredentialsForIdentity` 를 호출하는데, **`Logins` 맵 키가 토큰의 `iss` 클레임과 정확히 일치해야 하고 일치하지 않으면 `NotAuthorizedException`** 이 발생합니다. 이 경로로 호출한 `GetCredentialsForIdentity` 는 자격 증명 풀의 **기본 인증된 역할**에 대한 임시 자격 증명을 반환합니다.

문서가 붙이는 경고를 그대로 옮깁니다. **개발자 인증은 자격 증명 공급자 인증 검증을 우회하는 지름길이며, Amazon Cognito가 요청 내용을 추가 검증하지 않고 요청을 승인하는 AWS 자격 증명을 신뢰하므로, 개발자 인증을 승인하는 비밀을 사용자 접근으로부터 보호해야 합니다.**

> — 출처: [Developer-authenticated identities](https://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html)

---

## 8. API 액세스 보안

교재 슬라이드 23~25입니다. 앞에서 만든 토큰과 자격 증명을 **실제로 API 앞에 세우는** 자리입니다.

### 8.1 REST API 사용자 풀 권한 부여자

교재 슬라이드 23의 5단계는 현재 문서와 일치합니다.

| 단계 | 내용 |
|---|---|
| 1 | 사용자 풀을 만듭니다 |
| 2 | **사용자 풀 ID · 클라이언트 ID**, 필요하면 관련 **클라이언트 보안 암호**를 확보합니다 |
| 3 | REST API와 사용자 풀을 통합합니다. **`COGNITO_USER_POOLS`** 유형의 권한 부여자를 만듭니다 |
| 4 | API 메서드가 그 권한 부여자를 쓰도록 구성합니다 |
| 5 | API를 배포하고 토큰으로 호출을 테스트합니다 |

호출 시점의 동작은 이렇습니다. 클라이언트는 사용자를 사용자 풀에 로그인시켜 ID 토큰 또는 액세스 토큰을 얻고, 보통 요청의 **HTTP `Authorization` 헤더**에 그 토큰을 넣어 API 메서드를 호출합니다. **필요한 토큰이 제공되고 유효할 때만 호출이 성공합니다.**

🔄 **헤더 이름이 교재 번역에서 흐려집니다.** 강사 노트가 "토큰 소스에서 권한 부여를 헤더 이름으로 사용하여"로 번역되어 있는데, 문서가 명시하는 헤더는 **`Authorization`** 입니다.

🔄 **ID 토큰과 액세스 토큰의 용도가 다릅니다.** 교재는 "자격 증명이나 액세스 토큰"으로 뭉갭니다. 문서는 구분합니다.

| 토큰 | 무엇을 기준으로 승인하는가 |
|---|---|
| ID 토큰 | 로그인한 사용자의 **자격 증명 클레임** |
| 액세스 토큰 | 액세스 보호 리소스의 **사용자 지정 범위** ([5.4절](#54-리소스-서버와-범위)) |

**다른 AWS 계정이 소유한 사용자 풀**도 쓸 수 있습니다. API 개발자는 클라이언트 개발자에게 사용자 풀 ID, 클라이언트 ID, 필요하면 클라이언트 보안 암호를 제공해야 합니다.

Amazon Cognito 자격 증명으로 로그인하면서 **IAM 역할 권한을 쓰는 임시 자격 증명**도 얻으려면 자격 증명 풀을 쓰고 각 메서드의 권한 부여 유형을 **`AWS_IAM`** 으로 설정합니다([8.3절](#83-iam-권한-부여) · [7장](#7-자격-증명-풀)).

> — 출처: [Control access to REST APIs using Amazon Cognito user pools as an authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)

### 8.2 HTTP API JWT 권한 부여자 🆕

교재 슬라이드 23은 **REST API와의 통합만** 제시합니다. HTTP API에서는 `COGNITO_USER_POOLS` 권한 부여자가 아니라 **JWT 권한 부여자**로 Amazon Cognito를 씁니다. 모듈 2·10에서 확인한 "REST는 Cognito를 직접 지원하고 HTTP는 JWT 권한 부여자를 통해 쓴다"는 서술의 구현 수준 근거입니다.

권한 부여 워크플로는 네 단계입니다.

| 단계 | 내용 |
|---|---|
| 1. 토큰 확인 | `identitySource` 에서 토큰을 확인합니다(토큰만 또는 **`Bearer` 접두사**가 붙은 토큰) |
| 2. 디코딩 | 토큰을 디코딩합니다 |
| 3. 서명 확인 | 발급자의 `jwks_uri` 에서 가져온 공개 키로 알고리즘과 서명을 확인합니다. **현재 RSA 기반 알고리즘만 지원**합니다 |
| 4. 클레임 검증 | 아래 표의 클레임을 확인합니다 |

3단계에 운영상 중요한 점이 있습니다. **API Gateway가 공개 키를 2시간 캐시할 수 있으므로, 키 교체 시 이전 키와 새 키가 모두 유효한 유예 기간을 두는 것이 모범 사례입니다.**

| 클레임 | 확인할 것 |
|---|---|
| `kid` | `jwks_uri` 의 키와 일치해야 합니다 |
| `iss` | 권한 부여자에 구성한 `issuer` 와 일치해야 합니다 |
| `aud` 또는 `client_id` | 구성한 `audience` 중 하나와 일치해야 합니다. **`aud` 가 없을 때만 `client_id` 를 검증하고 둘 다 있으면 `aud` 를 평가**합니다 |
| `exp` | 현재 UTC **이후** |
| `nbf` · `iat` | 현재 UTC **이전** |
| `scope` 또는 `scp` | 라우트의 `authorizationScopes` 중 **최소 하나**를 포함해야 합니다 |

어느 단계라도 실패하면 API Gateway가 요청을 거부합니다. 검증 후 API Gateway는 토큰의 클레임을 라우트의 통합에 전달하고, Lambda 통합에서는 다음 경로로 접근합니다.

```text
$event.requestContext.authorizer.jwt.claims.<클레임>
```

Amazon Cognito를 자격 증명 공급자로 쓸 때 `IssuerUrl` 형식입니다.

```text
https://cognito-idp.<리전>.amazonaws.com/<사용자 풀 ID>
```

🆕 **범위를 요구하는 것이 권장됩니다.** **JWT 액세스 토큰과 OIDC ID 토큰 같은 다른 JWT를 구분하는 표준 메커니즘이 없으므로**, API 권한 부여에 ID 토큰이 필요하지 않다면 라우트에 권한 부여 범위를 요구하도록 구성하는 것이 권장됩니다. 이때 [5.4절](#54-리소스-서버와-범위)의 제약과 만납니다. `InitiateAuth` 로 받은 액세스 토큰에는 `aws.cognito.signin.user.admin` 범위만 담기므로 사용자 지정 범위를 요구하는 라우트를 통과하지 못합니다.

> — 출처: [Control access to HTTP APIs with JWT authorizers in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html)

### 8.3 IAM 권한 부여 🆕

교재 슬라이드 25 강사 노트의 "IAM 자격 증명 기반 정책용 인증 워크플로" 5단계는 "API Gateway는 사용자가 요청한 API Gateway 리소스에 대해 자격 증명 관리 정책을 평가하고 요청을 허용하거나 거부합니다"라고만 적습니다. **여기에 빠뜨리면 API가 열려 버리는 설정이 있습니다.**

IAM 권한 부여를 활성화하면 클라이언트는 AWS 자격 증명으로 요청에 서명해야 하며 **Signature Version 4(SigV4)** 또는 **SigV4a** 를 씁니다.

정책의 형태입니다.

| 요소 | 형식 |
|---|---|
| `Action` | `execute-api:<action>`. 값은 `*`(모든 작업) · **`Invoke`**(클라이언트 요청으로 API 호출) · `InvalidateCache`(API 캐시 무효화) |
| `Resource` | `arn:aws:execute-api:<region>:<account-id>:<api-id>/<stage-name>/<HTTP-VERB>/<resource-path-specifier>` |
| `HTTP-VERB` | `GET` · `POST` · `PUT` · `DELETE` · `PATCH` 중 하나 |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "execute-api:Invoke",
      "Resource": "arn:aws:execute-api:us-east-1:123456789012:abcd1234ex/prod/GET/notes"
    }
  ]
}
```

🆕 **가장 중요한 한 줄입니다.** IAM 정책이 효력을 갖게 하려면 API 메서드의 **`authorizationType` 속성을 `AWS_IAM` 으로 설정해 IAM 인증을 활성화해야** 합니다. **그렇게 하지 않으면 해당 API 메서드가 퍼블릭으로 액세스 가능해집니다.** 정책만 써 두고 메서드 설정을 빠뜨리면 정책이 아무 일도 하지 않는 채로 API가 열립니다.

프라이빗 API에는 **API Gateway 리소스 정책과 VPC 엔드포인트 정책**을 조합해 씁니다.

> — 출처: [Control access for invoking an API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html)

### 8.4 Lambda 권한 부여자 🔄

교재 슬라이드 25 강사 노트의 5단계 워크플로는 문서와 **정확히 일치합니다.**

| 단계 | 내용 |
|---|---|
| 1 | 클라이언트가 **전달자 토큰 또는 요청 파라미터**를 넘겨 메서드를 호출합니다 |
| 2 | API Gateway가 메서드 요청에 Lambda 권한 부여자가 구성되어 있는지 확인하고 구성되어 있으면 함수를 호출합니다 |
| 3 | 함수가 호출자를 인증합니다(OAuth 공급자 호출 · SAML 어설션 획득 · 요청 파라미터 기반 IAM 정책 생성 · 데이터베이스 자격 증명 조회 중 한 방법) |
| 4 | 함수가 **IAM 정책과 프린시펄 식별자**를 반환합니다. **반환하지 않으면 호출이 실패**합니다 |
| 5 | API Gateway가 IAM 정책을 평가해 거부면 **`403 ACCESS_DENIED`** 같은 상태 코드를 반환하고 허용이면 메서드를 호출합니다 |

권한 부여 캐싱을 켜면 정책이 캐시되어 권한 부여자 함수가 다시 호출되지 않습니다.

🔄 **유형 이름과 권장 사항을 교정합니다.** 교재는 두 유형을 "토큰 기반(토큰 권한 부여자)"과 "요청 파라미터 기반(요청 권한 부여자)"으로 부르고 **어느 쪽이 권장인지 밝히지 않습니다.**

| 유형 | 자격 증명 소스 | 캐싱 동작 |
|---|---|---|
| **`REQUEST`** (권장) | 헤더 · 쿼리 문자열 파라미터 · `stageVariables` · `$context` 변수 **조합** | 지정된 자격 증명 소스가 모두 있는지 확인하고 없거나 `null` 이거나 비어 있으면 **함수를 호출하지 않고 `401 Unauthorized`** 를 반환 |
| `TOKEN` | JWT · OAuth 토큰 같은 **전달자 토큰** | 토큰 소스에 지정한 헤더 이름이 **캐시 키**가 됩니다. 정규식(`IdentityValidationExpression`, `TOKEN` 전용)으로 토큰을 미리 검증할 수 있습니다 |

문서는 **여러 자격 증명 소스를 쓸 수 있고 캐시 키를 분리할 수 있다는 이유로 `REQUEST` 권한 부여자를 권장**합니다. 또 Lambda 권한 부여자의 이전 명칭이 **사용자 지정 권한 부여자(custom authorizer)** 라는 사실도 교재에 없습니다([11.3절](#113-비권장지원-종료된-항목)).

> — 출처: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

### 8.5 네 가지 방식 비교

교재 슬라이드 23과 25를 합치면 API 앞에 세울 수 있는 선택이 네 개입니다.

| 방식 | API 유형 | 클라이언트가 보내는 것 | 무엇을 근거로 승인 | 설정 위치 |
|---|---|---|---|---|
| 사용자 풀 권한 부여자 | **REST** | ID 또는 액세스 토큰(`Authorization` 헤더) | 자격 증명 클레임 또는 사용자 지정 범위 | `COGNITO_USER_POOLS` 권한 부여자 |
| JWT 권한 부여자 | **HTTP** | JWT(`Bearer` 접두사 가능) | `issuer` · `audience` · 라우트별 `authorizationScopes` | JWT 권한 부여자 |
| `AWS_IAM` | REST · HTTP | **SigV4로 서명한 요청** | IAM 정책의 `execute-api:Invoke` | 메서드의 `authorizationType` |
| Lambda 권한 부여자 | REST · HTTP | 전달자 토큰 또는 요청 파라미터 | **함수가 반환한 IAM 정책** | `REQUEST` 또는 `TOKEN` 권한 부여자 |

교재 슬라이드 23의 강사 노트는 애플리케이션에 Amazon Cognito를 통합하는 방법으로 SDK 사용을 안내하며 [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html) 를 인용합니다. 이 링크는 현재도 유효하고, 문서는 Amazon Cognito 구현이 **콘솔·SDK 관리 도구와 애플리케이션의 SDK 라이브러리의 조합**이라고 설명합니다. 가장 노력이 적은 통합은 **managed login** 이며 이때 OIDC 라이브러리로 호스팅 로그인 페이지로 사용자를 보내야 한다고 기술합니다([10.3절](#103-애플리케이션에-통합하는-방법)).

> — 출처: [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html)

---

## 9. 구현 모범 사례 🆕

교재 슬라이드 3과 34는 모듈 목표 세 번째 항목으로 **"Amazon Cognito 구현 모범 사례 관찰"** 을 제시합니다. 그런데 **덱에 이 목표에 대응하는 슬라이드가 없습니다.** 모범 사례를 제목으로 하는 슬라이드도, 강사 노트에서 모범 사례를 열거하는 대목도 없습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

이 장은 그 자리를 공식 문서에서 **명시적으로 모범 사례·권장으로 기술된 항목**만 모아 채운 것입니다. 각 항목의 자세한 내용은 해당 절에 있습니다.

### 9.1 인증과 토큰 발급

| 모범 사례 | 내용 | 절 |
|---|---|---|
| 퍼블릭 클라이언트는 **권한 부여 코드 그랜트만** | 문서는 암묵적 그랜트를 **레거시**로 명시하고, 암묵적 그랜트를 통한 토큰 전달을 막으려면 앱 클라이언트가 권한 부여 코드 그랜트만 지원하도록 구성하라고 안내합니다 | [5.5절](#55-oauth-20-그랜트-세-가지) |
| **PKCE** 구현 | 퍼블릭 클라이언트 앱의 보안 모범 사례로 문서가 명시합니다. 가로채인 권한 부여 코드가 토큰으로 교환되는 것을 막습니다 | [5.6절](#56-pkce) |
| 퍼블릭 클라이언트에 **클라이언트 보안 암호 없음** | 브라우저나 모바일 디바이스에서 실행되고 신뢰할 수 있는 서버 측 리소스가 없으므로 보안 암호를 갖지 않습니다 | [4.9절](#49-앱-클라이언트-퍼블릭과-기밀) |
| **SRP 흐름** 사용 | SRP는 암호 해시와 솔트로 암호를 아는 증거만 보내므로 요청에 읽을 수 있는 비밀 정보가 없습니다. 사용자 마이그레이션에는 `USER_PASSWORD_AUTH` 를 쓰되 마이그레이션을 마치면 **네트워크로 암호를 보내지 않는 SRP 흐름으로 전환**하도록 문서가 안내합니다 | [4.7절](#47-인증-흐름) |
| **refresh 토큰 교체** 활성화 | 문서가 보안 모범 사례로 권장합니다. `REFRESH_TOKEN_AUTH` 와 비호환이므로 `GetTokensFromRefreshToken` 을 쓰도록 설계합니다 | [6.7절](#67-refresh-토큰-교체) |

> — 출처: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

> — 출처: [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)

> — 출처: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 9.2 토큰 취급

| 모범 사례 | 내용 | 절 |
|---|---|---|
| **로그인마다 JWT 검증** | JWT는 쉽게 디코딩·읽기·수정할 수 있습니다. OIDC 인증에서 온 JWT를 처리하는 애플리케이션은 로그인마다 검증을 수행해야 합니다 | [6.8절](#68-jwt-검증) |
| 공개 키를 **`kid` 로 캐시**하고 주기적으로 갱신 | Amazon Cognito가 서명 키를 교체할 수 있으므로 문서가 모범 사례로 제시합니다 | [6.8절](#68-jwt-검증) |
| **두 토큰을 독립적으로 검증** | 액세스 토큰과 ID 토큰이 서로 다른 RSA 키로 서명되어 `kid` 가 다릅니다 | [6.5절](#65-액세스-토큰의-클레임) |
| **전송 중·저장 중 토큰 보호** | 토큰이 개인 식별 정보와 보안 모델 정보를 담을 수 있으므로 문서가 모범 사례로 제시합니다 | [6.3절](#63-jwt-구조와-교재-예시-교정) |
| 페이로드에 **비밀을 담지 않기** | ID·액세스 토큰의 페이로드는 암호화되지 않고 누구든 디코딩해 읽을 수 있습니다 | [6.3절](#63-jwt-구조와-교재-예시-교정) |

> — 출처: [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

### 9.3 권한 부여와 IAM

| 모범 사례 | 내용 | 절 |
|---|---|---|
| 자격 증명 풀은 **enhanced 흐름** | 문서가 개발자 노력이 가장 적은 가장 안전한 선택으로 명시하고, 새 풀에서 basic(classic) 인증을 기본 활성화하지 않도록 권고합니다 | [7.4절](#74-enhanced-흐름과-basic-classic-흐름) |
| 신뢰 정책에 **`aud` 조건 필수** | 이 조건 없이 역할 신뢰 정책을 저장하려 하면 IAM이 오류를 반환합니다 | [7.6절](#76-신뢰-정책-조건-키) |
| enhanced 흐름 역할에 **`aws:SourceIp` 금지** | enhanced 흐름이 애플리케이션을 대신해 요청을 생성하므로 조건이 절대 충족되지 않습니다 | [7.6절](#76-신뢰-정책-조건-키) |
| 앱 클라이언트 **최소 속성 권한** | 새 앱 클라이언트는 기본적으로 모든 속성에 읽기·쓰기 권한을 갖습니다. 필요한 최소 집합으로 제한하는 것이 모범 사례입니다 | [5.1절](#51-속성) |
| **`authorizationType` 을 반드시 설정** | API Gateway 메서드에 IAM 인증을 활성화하지 않으면 IAM 정책이 효력을 갖지 못하고 **메서드가 퍼블릭으로 열립니다** | [8.3절](#83-iam-권한-부여) |
| Lambda 권한 부여자는 **`REQUEST` 유형** | 여러 자격 증명 소스를 쓸 수 있고 캐시 키를 분리할 수 있다는 이유로 문서가 권장합니다 | [8.4절](#84-lambda-권한-부여자) |
| HTTP API 라우트에 **범위 요구** | ID 토큰과 액세스 토큰을 구분하는 표준이 없으므로 API 권한 부여에 ID 토큰이 필요하지 않다면 범위를 요구하도록 구성하는 것이 권장됩니다 | [8.2절](#82-http-api-jwt-권한-부여자) |

> — 출처: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

> — 출처: [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html)

### 9.4 운영

| 모범 사례 | 내용 | 절 |
|---|---|---|
| 프로덕션 이메일은 **Amazon SES 구성** | 기본 이메일 구성은 AWS 계정당 하루 50통(조정 불가)이고, 문서는 일반적인 프로덕션 환경에서 기본 한도가 필요한 전송량보다 낮다고 명시합니다 | [4.10절](#410-sms-와-이메일-전송) |
| 콘솔로 테스트하고 **IaC로 배포** | 문서는 콘솔 과정으로 테스트 환경을 만든 뒤 완성된 설계를 **AWS CloudFormation · AWS CDK** 같은 자동화 도구로 프로덕션에 배포하도록 권장합니다 | [4.3절](#43-콘솔-생성-흐름) |
| 대량 트래픽 방어는 **AWS WAF** | 위협 보호는 요청 속도 제한을 적용하지 않으므로 대량 트래픽 공격 방어에는 AWS WAF 웹 ACL을 함께 써야 합니다 | [3.8절](#38-위협-보호) |
| 암호 만료는 **직접 구현** | Amazon Cognito 사용자 풀의 로컬 사용자 암호는 자동으로 만료되지 않습니다. 문서는 암호 재설정 메타데이터를 외부에 기록하고 애플리케이션이나 Lambda 트리거가 사용 기간을 조회해 재설정을 요구하도록 안내합니다 | [4.4절](#44-암호-정책) |
| 디바이스 신뢰 기간 만료도 **직접 구현** | 신뢰 기간이 끝나면 애플리케이션이 디바이스 상태를 `not remembered` 로 바꾸고 사용자가 다시 MFA로 로그인하게 해야 합니다 | [4.6절](#46-디바이스-기억) |
| **패스키 RP ID는 공개 전에 확정** | RP ID를 바꾸면 사용자가 새 RP ID로 다시 등록해야 하므로 문서가 공개 전에 값을 정하는 것을 모범 사례로 제시합니다 | [4.8절](#48-암호-없는-로그인과-패스키) |

> — 출처: [Email settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)

> — 출처: [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html)

> — 출처: [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html)

---

## 10. 애플리케이션과 실습 6

교재 슬라이드 24와 30~32입니다. 이 모듈이 과정 전체의 마지막 조각을 끼우는 자리이고, 그대로 캡스톤 실습으로 이어집니다.

### 10.1 애플리케이션 아키텍처

교재 슬라이드 24가 제시하는 요청 경로입니다.

| 순서 | 구성 요소 | 역할 |
|---|---|---|
| 1 | 사용자 | 웹 애플리케이션에 로그인 |
| 2 | **Amazon Cognito** | 사용자 인증, 토큰 발급 |
| 3 | **Amazon API Gateway** | 토큰 검증 후 요청 라우팅 |
| 4 | **AWS Lambda** | 노트 처리 로직 |
| 5 | **Amazon DynamoDB** | 노트 테이블 |

API 경로 표입니다.

| 기능 | 메서드 | 경로 |
|---|---|---|
| 나열 | `GET` | `/notes` |
| 검색 | `GET` | `/notes/search` |
| 생성·업데이트 | `POST` | `/notes` |
| 삭제 | `DELETE` | **`/notes/{id}`** |

🔄 **교재의 경로 파라미터 표기가 틀렸습니다.** 슬라이드 24와 31의 API 경로 표는 삭제·업데이트 경로를 **`/notes/(id)`** 처럼 **소괄호**로 표기합니다. API Gateway 경로 파라미터 표기는 **중괄호**입니다. 문서의 PetStore 샘플 API에서 개별 리소스 경로는 `/pets/{petId}` 이고 `get-resources` 응답의 `pathPart` 도 `{petId}` 입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [Set up a method request in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-settings-method-request.html)

🔄 **같은 위치를 두 슬라이드가 다르게 표기합니다.** 슬라이드 24는 데이터 저장소를 `DynamoDB` 로 표기하고 슬라이드 31은 같은 위치를 **"노트"** 로 표기합니다. 두 슬라이드의 API 경로 표는 동일합니다. 이 문서는 **서비스 이름은 Amazon DynamoDB, 그 안의 대상은 노트 테이블**로 구분해 표기합니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

### 10.2 실습 6: 캡스톤

교재 슬라이드 31~32입니다. 실습 6은 **Amazon Cognito를 통한 사용자 인증**을 붙여 애플리케이션 구축을 완료합니다.

🔄 **슬라이드 32의 강사 노트 목록이 불완전합니다.** 캡스톤 슬라이드인데 앞선 모듈의 주제를 다섯 개만 나열합니다.

| 강사 노트가 나열한 것 | 빠진 것 |
|---|---|
| IDE 설정 / 애플리케이션 호스팅 / 데이터베이스 솔루션 / Lambda를 사용한 컴퓨팅 / Amazon API Gateway | **이 모듈의 주제인 Amazon Cognito**, 그리고 **모듈 11(모던 애플리케이션)** |

교재 자체의 누락이므로 외부 문서로 검증할 대상이 아닙니다([11.1절](#111-교재-기술이-사실과-다른-항목)). 실습에서 학습한 것을 정리할 때 이 두 항목을 함께 넣어야 캡스톤이 실제로 덮은 범위와 맞습니다.

실습 6이 전제하는 기능 요금제는 확인하지 못했습니다. 실습 가이드가 이 덱에 없습니다([11.5절](#115-검증하지-못한-항목)).

### 10.3 애플리케이션에 통합하는 방법

교재 슬라이드 23 강사 노트는 "선택한 프로그래밍 언어에 맞는 AWS SDK를 사용하여 Amazon Cognito API를 애플리케이션에 바로 통합하십시오"라고 안내합니다. 문서는 선택을 세 갈래로 제시합니다.

| 방법 | 내용 | 노력 |
|---|---|---|
| **managed login** | Amazon Cognito가 호스팅하는 로그인 페이지로 사용자를 보냅니다. OIDC 라이브러리가 필요합니다 | **가장 적음** |
| **AWS Amplify** | 백엔드에 Amazon Cognito 인증을 두고 풀스택 애플리케이션을 만드는 AWS 서비스입니다. **`Authenticator`** 같은 연결된 UI 구성 요소를 제공합니다 | 중간 |
| **AWS SDK** | 앱에 SDK를 추가해 인증 인터페이스를 직접 만들고 API 작업을 호출합니다 | 가장 많음 |

🆕 **AWS Amplify가 교재에 없습니다.** 슬라이드 23의 표현 "클라이언트별 프레임워크를 사용하여 배포된 API Gateway API를 호출"이 무엇을 가리키는지 모호한데, 문서는 그 자리에 Amplify와 AWS SDK를 명시합니다.

두 가지 제약도 알아 둘 가치가 있습니다.

| 제약 | 내용 |
|---|---|
| 자격 증명 풀 | **사용자 풀과 같은 관리형 인증 옵션이 없습니다.** 애플리케이션에서 AWS 자격 증명을 얻으려면 가져온 SDK 모듈로 자격 증명 풀 작업을 직접 구현해야 합니다 |
| API 전용 설정 | 일부 구성 요소는 **API로만** 설정할 수 있습니다. 예로 사용자 풀의 custom SMS·email sender Lambda 트리거는 `CreateUserPool` · `UpdateUserPool` 의 `LambdaConfig` 속성으로만 설정합니다 ([4.11절](#411-lambda-트리거)) |

> — 출처: [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html)

### 10.4 데모 노트

교재 슬라이드 26~27의 데모입니다. 강사가 콘솔에서 보여 주는 항목입니다.

| 데모 항목 | 이 문서에서 다룬 곳 |
|---|---|
| Cognito UI 설명 — 사용자 풀과 자격 증명 풀 표시 | [3.2절](#32-두-구성-요소-사용자-풀과-자격-증명-풀) |
| 사용자 풀 및 앱 클라이언트 ID 생성 | [4.3절](#43-콘솔-생성-흐름) · [4.9절](#49-앱-클라이언트-퍼블릭과-기밀) |
| JWT 토큰 검토 | [6.3절](#63-jwt-구조와-교재-예시-교정) ~ [6.5절](#65-액세스-토큰의-클레임) |

🔄 **데모가 전제하는 콘솔 화면이 현재와 다릅니다.** 현재 콘솔의 사용자 풀 생성은 **애플리케이션 중심 흐름**으로 바뀌었고 생성 과정에서 되돌릴 수 없는 기본 구성이 생깁니다([4.3절](#43-콘솔-생성-흐름)). 또 **기능 요금제 선택이 생성 마법사에 없습니다.** 요금제는 생성 후 `Settings → Feature plans` 또는 API의 `UserPoolTier` 로 지정합니다([11.5절](#115-검증하지-못한-항목)).

교재 슬라이드 27의 데모 노트는 샘플 앱 참조로 [Amazon Cognito 개발자 리소스](https://aws.amazon.com/cognito/dev-resources/) 를 제시합니다. 이 링크는 현재도 유효합니다.

---

## 11. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 11.1 교재 기술이 사실과 다른 항목

앞의 열 항목은 외부 문서로 확인한 것이고, 뒤의 열 항목은 **교재 안에서 본문과 강사 노트가 어긋나거나 추출 과정에서 표기가 깨진 내부 불일치**여서 외부 문서로 검증할 대상이 아닙니다. 후자에는 근거 칸에 `—` 를 두었습니다.

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| JWT 서명 알고리즘 (슬라이드 18) | 헤더에 `alg: RS256` 을 적으면서 서명 줄은 `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), {secret})` | `HMACSHA256` 은 공유 비밀 키를 쓰는 **대칭 HMAC**, `RS256` 은 SHA-256을 쓰는 **RSA 비대칭 서명**입니다. 한 슬라이드 안에서 두 알고리즘이 섞여 있습니다. 문서는 사용자 풀이 **`RS256`** 을 사용한다고 명시하며, Amazon Cognito는 사용자 풀마다 RSA 키 페어를 **두 쌍** 만들어 액세스 토큰과 ID 토큰을 각각 다른 프라이빗 키로 서명합니다. 검증은 공유 비밀이 아니라 **공개 JWKS** 로 합니다 ([6.3절](#63-jwt-구조와-교재-예시-교정)) | [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html) |
| JWT 페이로드를 "암호화된 정보"로 기술 | 슬라이드 18 강사 노트("키의 클레임에 대한 암호화된 정보"), 슬라이드 29 문제 4 정답 "참", 슬라이드 36 용어("클레임: 암호화된 사용자 정보가 있는 페이로드") — **세 곳** | Amazon Cognito는 토큰을 **base64url 로 인코딩한 문자열**로 발급하며 ID·액세스 토큰은 **평문 JSON 으로 디코딩할 수 있습니다.** 암호화되는 것은 **refresh 토큰**이며 사용자 풀만 읽을 수 있습니다. 슬라이드 18 자체가 페이로드를 평문 JSON으로 보여 주므로 교재 안에서도 어긋납니다. **슬라이드 29 문제 4의 정답을 "거짓"으로 교정**했습니다 ([6.3절](#63-jwt-구조와-교재-예시-교정)) | [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) |
| 규정 준수 표준 (슬라이드 9) | `PCI DSS / SOC / ISO 9001 / 표준 기반 인증(OAuth 2.0, SAML 2.0, OIDC) / 다중 인증(MFA)` | Amazon Cognito 문서가 명시하는 ISO 표준은 **ISO 27001**(정보 보안 관리 체계)이며 ISO 9001(품질 경영)이 아닙니다. 공동 책임 모델의 "클라우드의 보안"은 SOC 1-3 · PCI DSS · ISO 27001 을 준수하고 HIPAA-BAA 대상이며, 고객이 설계하는 "클라우드에서의 보안"은 SOC 1-3 · ISO 27001 · HIPAA-BAA 로는 설계할 수 있으나 **PCI DSS 로는 그럴 수 없습니다.** 또 표준 기반 인증과 MFA는 규정 준수 프로그램이 아니라 **서비스 기능**이므로 교재는 서로 다른 범주를 한 목록에 섞었습니다 ([3.7절](#37-규정-준수)) | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| 소셜 IdP 이름 (슬라이드 10) | `Login for Amazon` | 공식 이름은 **`Login with Amazon`** 입니다. 같은 덱의 슬라이드 9·19·24 강사 노트는 올바르게 표기하므로 교재 안에서도 표기가 갈립니다 ([4.12절](#412-서드-파티-idp-페더레이션)) | [Using social identity providers with a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html) |
| API 경로 파라미터 표기 (슬라이드 24·31) | `/notes/(id)` — **소괄호** | API Gateway 경로 파라미터 표기는 **중괄호**입니다. 문서의 PetStore 샘플 API에서 개별 리소스 경로는 `/pets/{petId}` 이고 `get-resources` 응답의 `pathPart` 도 `{petId}` 입니다 ([10.1절](#101-애플리케이션-아키텍처)) | [Set up a method request in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-settings-method-request.html) |
| 클레임 이름 표기 (슬라이드 18) | 강사 노트가 `Sub` · `Aud` · `Jti` · `Scope` 로 **첫 글자를 대문자**로 표기 | JWT 클레임 이름은 **대소문자를 구분**하고 문서 표기는 모두 소문자(`sub` · `aud` · `jti` · `scope`)입니다. 같은 노트의 다른 줄과 슬라이드 본문 코드 예시는 소문자를 쓰므로 교재 안에서도 갈립니다 ([6.4절](#64-id-토큰의-클레임)) | [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html) |
| refresh 토큰 기본 만료의 기준점 (슬라이드 18) | "애플리케이션 사용자가 사용자 풀에 **가입**한 후 30일 후에 만료" | 문서 표현은 "사용자가 사용자 풀에 **로그인한 후**(signs into your user pool) 30일"이므로 기준은 가입이 아니라 **로그인**입니다. 설정 범위 60분~10년은 교재 서술과 일치합니다 ([6.6절](#66-토큰-유효-기간)) | [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html) |
| 사용자 지정 속성의 예 (슬라이드 15) | `표준 속성(이메일, 이름) / 사용자 지정(닉네임, 그림)` | `nickname` 과 `picture` 는 OpenID Connect 명세에 근거한 **표준 속성 18개에 포함**되므로 사용자 지정 속성이 아닙니다. 실제 사용자 지정 속성은 이름에 **`custom:` 접두사**가 붙고 사용자 풀당 최대 **50개**이며 추가 후 제거·변경할 수 없습니다 ([5.1절](#51-속성)) | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| 자격 증명 풀 흐름과 참조 문서의 불일치 (슬라이드 25) | 강사 노트 3단계가 `GetOpenIdToken` + `AssumeRoleWithWebIdentity` 를 제시하면서 참조 링크로 **Enhanced Flow** 블로그를 제시 | 두 API는 **basic(classic) 흐름**의 API이고 enhanced 흐름은 `GetId` → `GetCredentialsForIdentity` 두 단계입니다. 설명하는 흐름과 참조하는 문서가 서로 다른 흐름입니다. 참조 URL 자체는 살아 있으나 이 문서는 흐름에 관한 사실을 개발자 안내서에서 확인했습니다 ([7.4절](#74-enhanced-흐름과-basic-classic-흐름)) | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| 자격 증명 풀이 발급하는 것 (슬라이드 10) | "사용자에게 **AWS 액세스 키**를 부여해야 하는가?" | 문서는 자격 증명 풀이 **임시 AWS 자격 증명(temporary AWS credentials)** 을 발급한다고 기술하며, 같은 덱의 슬라이드 10 강사 노트와 슬라이드 21도 "임시 보안 인증 정보"로 씁니다. "액세스 키"는 IAM 사용자의 **장기 액세스 키**와 혼동될 수 있습니다 ([7.1절](#71-자격-증명-풀이-하는-일)) | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| ID 토큰 헤더의 닫는 인용부호 (슬라이드 18) | `{ "kid" : "1234example=“, "alg" : "RS256" }` — 닫는 인용부호가 **왼쪽 큰따옴표**(`“`) | 그대로는 JSON으로 파싱되지 않습니다. 슬라이드 본문의 헤더 코드 블록도 `kid` 줄 끝의 쉼표가 보이지 않고 마지막 `alg` 줄 뒤에는 후행 쉼표가 남아 유효한 JSON이 아닙니다. 이 문서는 **파싱 가능한 JSON으로 교정**했습니다 ([6.3절](#63-jwt-구조와-교재-예시-교정)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 슬라이드 11과 12의 본문이 글자 단위로 동일 | 두 슬라이드의 본문 텍스트가 같고 슬라이드 12에만 "둘을 함께 사용할 수 있음" 상자가 추가됨 | 애니메이션 단계를 두 슬라이드로 쪼갠 것으로 보입니다. 이 문서는 **한 절로 합치고** "함께 사용" 부분만 별도로 다뤘습니다 ([3.2절](#32-두-구성-요소-사용자-풀과-자격-증명-풀) · [3.3절](#33-둘을-함께-쓰는-흐름)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 슬라이드 제목과 본문의 항목 순서 (슬라이드 15) | 제목은 "속성, **범위** 및 **그룹**" 순서인데 본문 열 배치와 강사 노트 서술은 모두 속성 → **그룹** → **범위** 순서 | 이 문서는 본문·강사 노트의 순서를 따라 **속성 → 그룹 → 범위**로 정리하고 장 제목도 그 순서로 맞췄습니다 ([5장](#5-속성-그룹-범위)) | — ([11.5절](#115-검증하지-못한-항목)) |
| JWT 정의의 오타 (슬라이드 36) | "보안 정보 **고유**를 위한 JSON 객체를 정의합니다" | 슬라이드 18 강사 노트는 같은 대상을 "보안 암호 **공유**를 위한 JSON 객체"라고 쓰므로 "고유"는 "공유"의 오타로 보입니다. 같은 슬라이드에서 OAuth 표기도 `OAuth2` 와 `OAuth 2.0` 으로 갈립니다(슬라이드 6·15는 `OAuth 2.0`). 이 문서는 JWT 정의를 공식 문서 서술로 교체하고 표기를 `OAuth 2.0` 으로 통일했습니다 ([2.4절](#24-용어-정리)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 모듈 목표 3번에 대응하는 슬라이드가 없음 (슬라이드 3·34) | 두 슬라이드가 모두 "Amazon Cognito 구현 모범 사례 관찰"을 제시 | 덱에 모범 사례를 제목으로 하는 슬라이드가 없고 강사 노트에서 모범 사례를 열거하는 대목도 없습니다. 슬라이드 34는 슬라이드 3의 네 항목을 그대로 반복합니다. 이 문서는 그 자리를 **공식 문서에서 명시적으로 모범 사례·권장으로 기술된 항목**으로 채웠습니다 ([9장](#9-구현-모범-사례)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 캡스톤 강사 노트의 주제 목록이 불완전 (슬라이드 32) | IDE 설정 / 애플리케이션 호스팅 / 데이터베이스 솔루션 / Lambda를 사용한 컴퓨팅 / Amazon API Gateway **다섯 개만** | 캡스톤 슬라이드인데 **이 모듈의 주제인 Amazon Cognito 와 모듈 11(모던 애플리케이션)** 이 빠져 있습니다 ([10.2절](#102-실습-6-캡스톤)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 용어 번역이 갈림 (슬라이드 5 등) | 슬라이드 5 제목은 `authorization` 을 "승인"으로, 본문과 이후 모든 슬라이드는 "권한 부여"로 번역 | 같은 유형의 분기가 덱 전체에 있습니다. 슬라이드 21 다이어그램은 "아이덴티티 풀", 슬라이드 10~12는 "자격 증명 풀"입니다. 슬라이드 17 본문은 토큰을 "발행"한다고 하는데 강사 노트는 "발급"한다고 합니다. 토큰 3종 나열 순서도 슬라이드 17("ID, Access 및 Refresh")과 슬라이드 19("Refresh, Access 및 ID")에서 뒤바뀝니다. 이 문서는 **권한 부여 · 자격 증명 풀 · 발급**으로 통일하고 토큰 순서를 **ID → Access → Refresh** 로 고정했습니다 | — ([11.5절](#115-검증하지-못한-항목)) |
| 다이어그램 레이블의 공백 누락 | 슬라이드 14 `Amazon Cognito사용자 풀`, 17 `Amazon Cognito토큰`, 24·32 `Amazon APIGateway`·`애플리케이션API 호출`, 25 `서버 측리소스`, 36 `OpenID Connect(OIDC)사용자의` | 원본 슬라이드에서 줄바꿈이나 별개 텍스트 조각으로 나뉘어 있던 것이 합쳐진 결과로 보입니다. 정확한 서비스 이름은 **Amazon Cognito 사용자 풀**, **Amazon API Gateway** 입니다 | — ([11.5절](#115-검증하지-못한-항목)) |
| `token_use` 값 표기 (슬라이드 18) | 강사 노트가 값을 `ID`(ID 토큰)·`액세스`(Access 토큰)로 표기 | 같은 슬라이드 본문의 코드 블록은 `"token_use": "id"` 로 올바르게 표기합니다. `token_use` 는 **문자열 값을 대소문자 구분해 비교**하는 클레임이므로 값 자체를 한글이나 대문자로 적으면 수강생이 그대로 코드에 옮길 위험이 있습니다. 값은 **`id`** 와 **`access`** 입니다 ([6.2절](#62-토큰-세-가지-비교)) | — ([11.5절](#115-검증하지-못한-항목)) |
| 같은 위치의 데이터 저장소를 다르게 표기 (슬라이드 24·31) | 슬라이드 24는 `DynamoDB`, 슬라이드 31은 같은 위치를 `노트` | 두 슬라이드의 API 경로 표는 동일합니다. 이 문서는 **서비스 이름은 Amazon DynamoDB, 그 안의 대상은 노트 테이블**로 구분해 표기했습니다 ([10.1절](#101-애플리케이션-아키텍처)) | — ([11.5절](#115-검증하지-못한-항목)) |

### 11.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 고급 보안 기능 | 슬라이드 9 강사 노트 "**고급 보안 기능**으로 사용자를 보호합니다" | **위협 보호(threat protection)** 로 이름이 바뀌었고 문서가 "이전에 advanced security features 라고 불렸다"고 명시합니다. **Plus 기능 요금제**에서 제공되며 구성 요소는 침해된 자격 증명 감지 · 적응형 인증 · IP 허용·차단 목록 · 로그 내보내기입니다. 예전 advanced security features 요금 구조의 기능들은 **Essentials 또는 Plus 로 편입**되었습니다. `USER_SRP_AUTH` 에서는 적응형 인증만 켤 수 있고 **페더레이션 로그인에는 쓸 수 없습니다** ([3.8절](#38-위협-보호)) | [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html) |
| 로그인 화면 | 슬라이드 11·12 본문 "**호스트된 UI**" | 브랜딩 버전이 **managed login** 과 **hosted UI (classic)** 두 개이고, 문서는 classic을 managed login의 "더 얇고 덜 사용자 지정 가능한 선행 버전"으로 기술합니다. **managed login은 자체 서비스 프로필 관리를 지원하지 않아** 그 부분은 앱 코드로 구현합니다. 두 버전 모두 사용자 지정 CORS 오리진 정책을 지원하지 않고, managed login은 사용자 지정 도메인과 접두사 도메인 모두에 **TLS 1.2** 를 요구합니다. 브랜딩 버전을 바꾸면 사용자 세션이 유지되지 않습니다 ([3.4절](#34-로그인-화면-managed-login-과-hosted-ui-classic)) | [Managed login and the hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| 기능 요금제 | 슬라이드 9~12가 Amazon Cognito를 **사용자 풀·자격 증명 풀 두 구성 요소로만** 소개하고 요금제 개념이 없음 | 사용자 풀에 **Lite · Essentials · Plus** 기능 요금제가 있고 신규 사용자 풀의 기본값은 **Essentials** 입니다. 요금제는 **사용자 풀 단위**로 적용되며 앱 클라이언트별로 다르게 둘 수 없습니다. `CreateUserPool` · `UpdateUserPool` 의 **`UserPoolTier`**(CLI는 `--user-pool-tier`)로 설정하고, `AdvancedSecurityMode` 를 `AUDIT` 또는 `ENFORCED` 로 두면 요금제가 `PLUS` 여야 합니다. 여러 기능이 요금제로 갈립니다: 패스키(Lite 제외), 이메일 MFA·이메일 OTP 와 암호 이력(Essentials 이상), 위협 보호(Plus), 액세스 토큰 사용자 지정(Lite 아닌 요금제 + 이벤트 버전 2) ([3.5절](#35-기능-요금제-lite-essentials-plus)) | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| SMS 전송 경로 | 슬라이드 14 강사 노트 6번 "단문 메시지 서비스(SMS)와 사용자 지정 이메일 전송 옵션을 설정합니다" | 문서는 **2024년 11월에 AWS가 Amazon SNS SMS 메시징을 AWS End User Messaging SMS 로 대체**했다고 명시하고 현재 구성 경로가 **두 갈래**라고 기술합니다. Amazon SNS 경로는 `sns:Publish` 권한이 필요하고, AWS End User Messaging SMS 직접 경로는 `sms-voice:SendTextMessage` 권한이 필요합니다. **두 구성은 상호 배타적**이어서 한쪽을 설정하면 다른 쪽이 지워집니다. 처음 문자 메시지를 보내면 계정이 **샌드박스 환경**에 놓입니다 ([4.10절](#410-sms-와-이메일-전송)) | [SMS message settings](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html) |
| 콘솔 사용자 풀 생성 흐름 | 슬라이드 27 데모가 "Cognito UI 설명", "사용자 풀 및 앱 클라이언트 ID 생성"을 콘솔 조작으로 전제 | 현재 콘솔은 **애플리케이션 중심 흐름**입니다. `Define your application`(애플리케이션 유형 선택) → 이름 입력 → `Configure options`(로그인 식별자와 가입 필수 속성) → 반환 URL 입력 → `Create your application` 이고, Amazon Cognito가 해당 유형의 기본 설정으로 **사용자 풀과 앱 클라이언트를 함께** 만듭니다. 외부 IdP·MFA 같은 옵션은 생성 후 구성합니다. 이 과정에서 **되돌릴 수 없는 기본 구성 세 가지**가 생깁니다: 클라이언트 보안 암호, `preferred_username` 별칭 미허용, 사용자 이름 대소문자 구분 없음 ([4.3절](#43-콘솔-생성-흐름)) | [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html) |
| 인증 흐름 | 슬라이드 14 본문 "**인증 흐름 지원**" 한 줄. 흐름 이름을 하나도 제시하지 않음 | 앱 클라이언트의 **`ExplicitAuthFlows`** 에 허용할 흐름을 명시적으로 골라야 하고 값은 `ALLOW_USER_PASSWORD_AUTH` · `ALLOW_ADMIN_USER_PASSWORD_AUTH` · `ALLOW_USER_SRP_AUTH` · **`ALLOW_USER_AUTH`** 입니다. 교재 이후 추가된 **선택 기반 로그인(`USER_AUTH`)** 은 사용자 풀의 `SignInPolicy.AllowedFirstAuthFactors` 에 `PASSWORD` · `EMAIL_OTP` · `SMS_OTP` · `WEB_AUTHN` 을 지정해 사용자가 로그인 방법을 고르게 하며, **암호 없는 로그인(OTP)과 패스키(WebAuthn)는 이 흐름을 통해서만** 쓸 수 있습니다 ([4.7절](#47-인증-흐름) · [4.8절](#48-암호-없는-로그인과-패스키)) | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |

### 11.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| 암묵적 흐름(implicit grant) | **비권장.** 문서가 "레거시 권한 부여 그랜트(a legacy authorization grant)"로 명시 | **권한 부여 코드 그랜트 + PKCE.** 사용자가 토큰을 가로채 검사할 수 있으므로 문서는 앱 클라이언트가 권한 부여 코드 그랜트만 지원하도록 구성하라고 안내합니다. 암묵적 그랜트는 refresh 토큰을 발급하지 않고 PKCE와 호환되지 않습니다 ([5.5절](#55-oauth-20-그랜트-세-가지) · [5.6절](#56-pkce)) | [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html) |
| 자격 증명 풀 basic(classic) 흐름 | **비권장.** 문서가 새 자격 증명 풀에서 기본 활성화하지 않도록 권고 | **enhanced 흐름**(`GetId` → `GetCredentialsForIdentity`). 자격 증명은 1시간 유효합니다. basic 흐름을 쓰려면 IAM 역할 신뢰 관계를 평가하고 역할 선택 로직을 클라이언트에 구현한 뒤 **클라이언트가 변조되지 않도록 보호**해야 합니다. `RoleMappings` 가 있으면 `GetOpenIdToken` 이 오류를 반환합니다 ([7.4절](#74-enhanced-흐름과-basic-classic-흐름)) | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| `UnusedAccountValidityDays` | **레거시 파라미터** | **`TemporaryPasswordValidityDays`**(기본 7일, 유효 범위 0~365). 문서는 사용자 풀에 `TemporaryPasswordValidityDays` 를 설정하면 그 사용자 풀에서 `UnusedAccountValidityDays` 에 **더 이상 값을 설정할 수 없다**고 명시합니다. 오래된 템플릿에서 만나면 새 파라미터로 바꿔야 합니다 ([4.4절](#44-암호-정책)) | [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html) |
| 개발자 속성(`dev:` 접두사) | **레거시 기능** | **앱 클라이언트별 속성 읽기·쓰기 권한**(`ReadAttributes` / `WriteAttributes`). 개발자 속성은 AWS 자격 증명으로만 수정할 수 있습니다 ([5.1절](#51-속성)) | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| Lambda 권한 부여자 `TOKEN` 유형 | **비권장.** 문서가 `REQUEST` 를 권장 | **`REQUEST` 권한 부여자.** 여러 자격 증명 소스를 쓸 수 있고 캐시 키를 분리할 수 있습니다. `TOKEN` 은 전달자 토큰 하나만 쓰는 경우에 한정합니다. Lambda 권한 부여자의 이전 명칭은 **사용자 지정 권한 부여자(custom authorizer)** 입니다 ([8.4절](#84-lambda-권한-부여자)) | [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) |
| Amazon Cognito Sync | **지원 종료.** 더 이상 신규 고객에게 제공되지 않습니다(no longer open to new customers) | **AWS AppSync**(GraphQL 기반 실시간 동기화) 또는 **Amazon DynamoDB**(단순 키-값 사용자 데이터). 기존 고객의 워크로드에는 중단이 없고 계속 쓸 수 있지만 **새 기능 개발이 없습니다.** 교재 M12에는 등장하지 않지만 자격 증명 풀 콘솔의 `Identity browser` 탭과 데이터 세트 기능이 여전히 존재하고 오래된 자료가 자격 증명 풀과 함께 소개하므로 상태를 명시해 둡니다. 신규 프로젝트에서는 쓸 수 없습니다 ([3.10절](#310-amazon-cognito-sync)) | [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html) |

### 11.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| 기능 요금제 | Lite · Essentials(신규 기본값) · Plus. `UserPoolTier` 파라미터로 설정. 사용자 풀 단위 적용이며 앱 클라이언트별로 다르게 둘 수 없음 | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| 선택 기반 로그인(`USER_AUTH`) | `SignInPolicy.AllowedFirstAuthFactors` 에 `PASSWORD` · `EMAIL_OTP` · `SMS_OTP` · `WEB_AUTHN` 지정. `PREFERRED_CHALLENGE` 를 넣거나 생략해 `AvailableChallenges` 목록을 받은 뒤 `SELECT_CHALLENGE` 로 진행. `PASSWORD` 값은 평문 암호와 SRP 두 변형을 모두 포함 | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |
| 암호 없는 로그인과 패스키 | OTP 로그인은 인증과 동시에 이메일·전화번호 속성을 확인됨으로 표시하고 사용자 상태를 `UNCONFIRMED` 에서 `CONFIRMED` 로 바꿈. **MFA 필수와 상호 배타.** 패스키는 W3C·FIDO Alliance 의 WebAuthn·CTAP2 기반, Lite 제외 요금제, `ES256`(-7)·`RS256`(-257) 인식, attestation 강제 미지원, 사용자당 최대 20개, RP ID는 퍼블릭 서픽스 목록에 없는 도메인이어야 하고 변경 시 재등록 필요 | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |
| 토큰 폐기 | `RevokeToken` / `/oauth2/revoke` / `GlobalSignOut` / `AdminUserGlobalSignOut` 네 가지. `origin_jti` 가 폐기 식별자. 새 앱 클라이언트는 **기본 활성화.** **폐기된 토큰도 서명·만료만 검증하는 라이브러리에는 유효하게 보임** | [Ending user sessions with token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html) |
| refresh 토큰 교체 | 문서가 보안 모범 사례로 권장. 갱신마다 원래 토큰 무효화, 새 토큰은 원래 토큰의 남은 기간 동안 유효, 유예 기간 최대 60초. **`REFRESH_TOKEN_AUTH` 와 비호환**이므로 `GetTokensFromRefreshToken` 사용 | [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html) |
| JWKS 기반 JWT 검증 | `jwks_uri` 는 `https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`. JWK 필드는 `kid` · `alg` · `kty` · `e` · `n` · `use`. `exp` · `aud`/`client_id` · `iss` · `token_use` 확인. `kid` 를 캐시 키로 삼아 공개 키 캐시·갱신. Node.js는 `aws-jwt-verify` 권장 | [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html) |
| 액세스 토큰과 ID 토큰의 서명 키가 다름 | 사용자 풀마다 RSA 키 페어를 두 쌍 만들어 각각 다른 프라이빗 키로 서명. 같은 세션의 두 토큰에서 `kid` 가 일치하지 않으므로 **독립적으로 검증** | [Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html) |
| 토큰 클레임 사용자 지정 | Pre token generation Lambda 트리거로 클레임 추가·수정·억제. 액세스 토큰 사용자 지정은 Lite 아닌 요금제 + 이벤트 버전 2 필요, **추가 비용 발생** | [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) |
| PKCE | `code_verifier` → SHA256 → base64 → `code_challenge`(`code_challenge_method=S256`). 토큰 교환 시 `code_verifier` 를 평문으로 전송. 도메인과 퍼블릭 앱 클라이언트 필요 | [Using PKCE in authorization code grants](https://docs.aws.amazon.com/cognito/latest/developerguide/using-pkce-in-authorization-code.html) |
| 퍼블릭 클라이언트와 기밀 클라이언트 | 퍼블릭 클라이언트는 **클라이언트 보안 암호를 갖지 않음.** 앱 클라이언트당 보안 암호 최대 2개로 무중단 교체(`AddUserPoolClientSecret` / `DeleteUserPoolClientSecret`), 유일한 보안 암호는 삭제 불가 | [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) |
| 암호 정책의 구체적 값 | 최소 길이 6~99(사용자는 최대 256자), `TemporaryPasswordValidityDays` 기본 7일·범위 0~365, `PasswordHistorySize` 0~24(**Essentials 이상**). Amazon Cognito 로컬 사용자 암호는 **자동으로 만료되지 않음** | [Adding user pool password requirements](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-users-passwords.html) |
| MFA 두 번째 요소 세 가지 | SMS · **이메일** · TOTP. **페더레이션 사용자에게는 제공되지 않고** IdP에 위임. MFA 코드 5회 오류 시 지수 백오프 잠금. MFA와 계정 복구를 같은 채널로 받을 수 없음 | [Adding MFA to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html) |
| 디바이스 기억 세 옵션 | `Don't remember` / `Always remember` / `User opt-in`. 기억된 디바이스는 **MFA가 활성화된 사용자 풀에서만** MFA를 대체. 디바이스 키 형식은 `Region_UUID`. **신뢰 기간 만료는 애플리케이션이 직접 구현** | [Working with user devices in your user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html) |
| Lambda 트리거 전체 | 사용자 지정 인증 3종(Define/Create/Verify Auth Challenge), 인증 이벤트 3종(Pre/Post authentication, Pre token generation), 인바운드 페더레이션, 가입 3종(Pre sign-up, Post confirmation, Migrate user), Custom message, Custom sender. **Custom sender 를 제외하면 동기 호출이며 5초 안에 응답해야 하고 이 값은 변경 불가** | [Customizing user pool workflows with Lambda triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html) |
| 표준 속성 18개와 사용자 지정 속성 제약 | 표준 18개, 확인 가능한 것은 `email`·`phone_number` 둘뿐. 사용자 지정 속성 최대 50개·2048자·추가 후 변경 불가·필수 불가·`custom:` 접두사·ID 토큰에는 문자열로만 기록. 필수 속성과 별칭·사용자 이름 속성은 **사용자 풀 생성 후 변경 불가** | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| 그룹 우선순위 동률 처리와 제한 | 같은 우선순위에 역할 ARN이 다르면 **`cognito:preferred_role` 이 설정되지 않음.** IdP별 자동 생성 그룹 `[사용자 풀 ID]_[IdP 이름]`. 중첩 불가, 그룹 내 사용자 검색 불가, 이름으로 그룹 검색 불가. 추가 비용 없음 | [Adding groups to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html) |
| 범위 세 종류와 리소스 서버 | 예약 `aws.cognito.signin.user.admin` / 사용자 지정(`식별자/범위이름`) / OIDC(`openid`·`profile`·`email`·`phone`). 리소스 서버는 **도메인 필요.** **`InitiateAuth` 로 받은 액세스 토큰에는 예약 범위만 담기므로 사용자 지정 범위 기반 API 권한 부여를 못 함.** 삭제한 범위는 비활성으로 남음 | [Scopes, M2M, and resource servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html) |
| enhanced 흐름과 basic 흐름의 구분 | enhanced는 `GetId` → `GetCredentialsForIdentity`(자격 증명 1시간), basic은 `GetId` → `GetOpenIdToken` → `AssumeRoleWithWebIdentity`. 공급자별 아티팩트(사용자 풀·OIDC는 ID 토큰, SAML은 어설션, 소셜은 액세스 토큰). enhanced는 같은 계정 역할만, basic은 다른 계정 역할도 가능 | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| 자격 증명 풀 역할 선택 네 갈래 | 기본 역할 / 토큰(`cognito:preferred_role`·`cognito:roles`) / 규칙 기반 매핑(`Equals`·`NotEqual`·`StartsWith`·`Contains`, 첫 일치 규칙 적용) / ABAC. `GetCredentialsForIdentity` 의 **`CustomRoleArn` 이 최우선**이고 `cognito:roles` 와 일치하지 않으면 액세스 거부. `iam:PassRole` 이 필요한 경우 있음 | [Using role-based access control](https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html) |
| 속성 기반 액세스 제어(ABAC) | 토큰·어설션의 속성을 프린시펄 태그로 매핑하고 IAM 정책에서 `${aws:PrincipalTag/tagkey}` 조건으로 평가. 콘솔 옵션은 `Inactive` / `Use default mappings`(`sub`·`aud`) / `Use custom mappings` | [Using attributes for access control](https://docs.aws.amazon.com/cognito/latest/developerguide/attributes-for-access-control.html) |
| 신뢰 정책 조건 키 | `cognito-identity.amazonaws.com:aud` **필수**(없으면 IAM이 저장 거부), `amr`(`authenticated`/`unauthenticated`/공급자), `sub`(identity ID, IdP의 `sub` 아님). **enhanced 흐름 역할에 `aws:SourceIp` 를 넣으면 절대 충족되지 않음** | [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) |
| 개발자 인증 자격 증명 | `GetOpenIdTokenForDeveloperIdentity` 로 시작하고 관리 자격 증명으로 요청을 인증. `Logins` 맵 키가 토큰의 `iss` 와 정확히 일치해야 하며 불일치 시 `NotAuthorizedException`. **개발자 공급자 이름은 추가 후 변경·삭제 불가** | [Developer-authenticated identities](https://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html) |
| 게스트 액세스 활성화 | 게스트 액세스를 지원하지 않으면 콘솔 상태가 `Inactive`. 활성화에는 게스트용 **기본 IAM 역할 지정**이 필요하고 기존 역할을 쓰려면 신뢰 정책에 `cognito-identity.amazonaws.com` 포함. `GetId` 로 받은 identity ID를 앱이 캐시하는 것이 기대됨 | [Identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html) |
| HTTP API JWT 권한 부여자 | **RSA 기반 알고리즘만 지원**, 공개 키 2시간 캐시(키 교체 시 유예 기간 권장), `aud` 우선(없을 때만 `client_id`), `nbf`·`iat` 는 현재 UTC 이전, 라우트별 `authorizationScopes`. Lambda 통합에서 `$event.requestContext.authorizer.jwt.claims.<클레임>` 으로 접근 | [Control access to HTTP APIs with JWT authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html) |
| API Gateway `AWS_IAM` 권한 부여 | SigV4·SigV4a 서명. `Action` 은 `execute-api:Invoke`(그 밖에 `*`·`InvalidateCache`), `Resource` 는 `api-id/스테이지/HTTP동사/경로` 형식 ARN. **`authorizationType` 을 `AWS_IAM` 으로 설정하지 않으면 그 메서드가 퍼블릭으로 열림** | [Control access for invoking an API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html) |
| 서비스 할당량과 과금 단위 | 사용자 풀당 사용자 **40,000,000명**(조정 가능), 리전당 사용자 풀 1,000(최대 10,000), 사용자 풀당 앱 클라이언트 1,000(최대 10,000)·자격 증명 공급자 300(최대 1,000)·리소스 서버 25(최대 300)·사용자 지정 속성 **50(조정 불가)**·그룹 **10,000(조정 불가)**. 기본 이메일 **AWS 계정당 하루 50통(조정 불가)**. 과금은 **MAU** 기준이며 `AdminGetUser` 도 MAU에 기여, CSV 가져오기와 `AdminResetUserPassword` 는 기여하지 않음 | [Quotas in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html) |
| 저장 중·전송 중 암호화의 세부 | 자격 증명 풀은 **AWS 소유 키 고정**(변경 불가), 사용자 풀은 기본 AWS 소유 키에 **고객 관리 키 선택 가능**(같은 리전 대칭 KMS 키만, ARN으로만 구성). 검색 가능 암호화로 `sub`·`email`·`phone_number` 등의 평문과 암호문을 매핑. **TLS 1.2 요구·1.3 권장**, PFS 암호 그룹 요구 | [Data protection in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html) |
| AWS Amplify 통합 경로 | 백엔드에 Amazon Cognito 인증을 두고 풀스택 애플리케이션을 만드는 AWS 서비스. **`Authenticator`** 같은 연결된 UI 구성 요소 제공. 자격 증명 풀에는 사용자 풀과 같은 관리형 인증 옵션이 없어 SDK로 직접 구현 필요 | [Integrating Amazon Cognito with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html) |
| 페더레이션 사용자 프로필 생성 | 사용자 풀 디렉터리에 페더레이션 사용자의 **프로필이 실제로 만들어지고** IdP 클레임과 퍼블릭 userinfo 엔드포인트를 근거로 속성이 채워짐. 매핑된 IdP 속성이 바뀌면 사용자 속성도 바뀜. `username` 은 `MyIDP_bob@example.com` 형태. **`InitiateAuth` 로는 페더레이션 사용자를 로그인시킬 수 없고** Login·Authorize 엔드포인트만 가능 | [User pool sign-in with third party identity providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html) |

### 11.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 콘솔 사용자 풀 생성 마법사에서 기능 요금제를 고르는 지점 | 현재 콘솔 빠른 시작 문서에 **요금제 선택 단계가 없습니다.** 요금제는 생성 후 `Settings → Feature plans` 탭 또는 API의 `UserPoolTier` 로 지정합니다. 즉 "생성 단계에 없다"까지만 확인했고, 콘솔의 다른 경로에서 생성 중 선택이 가능한지는 확인하지 못했습니다 |
| Amazon Cognito가 ISO 9001 범위에 포함되는지 **여부 자체** | 판정에는 `AWS services in scope by compliance program` 페이지 조회가 필요한데 **조회하지 않았습니다.** 확인한 것은 Amazon Cognito 문서가 명시하는 ISO 표준이 **ISO 27001** 이라는 점과 규정 준수 검증 페이지가 SOC · PCI · FedRAMP · HIPAA 를 나열한다는 점까지입니다. 교재의 ISO 9001 표기가 다른 근거를 가진 것인지는 판정하지 못했습니다 |
| 요금 수치 | 과금 단위가 **월간 활성 사용자(MAU)** 라는 사실과 어떤 작업이 MAU에 기여하는지는 확인했습니다. **MAU 단가와 M2M 앱 클라이언트·토큰 요청 단가는 조회하지 않았습니다.** 수치가 필요하면 Amazon Cognito 요금 페이지를 직접 확인하세요 |
| 실습 6(캡스톤)이 전제하는 기능 요금제 | **실습 가이드가 이 덱에 없습니다.** 실습이 패스키·이메일 MFA·위협 보호처럼 요금제에 따라 갈리는 기능을 쓰는지 확인할 수 없었습니다 |
| 슬라이드 18의 `iss` 예시 값이 사용자 풀 ID 형식 규칙에 맞는지 | 교재 예시는 `us-east-1_example` 이고 문서 예시는 `us-west-2_example` · `us-east-1_EXAMPLE` 형태입니다. **사용자 풀 ID의 형식 자체를 규정한 페이지를 찾지 못했습니다.** `sub` 에 대해서는 "형식을 엄격히 검증하지 말라"는 지침이 있으나 사용자 풀 ID 규칙은 미확인입니다 |
| 교재 자체의 표기 오류 열 건 | 슬라이드 18의 왼쪽 큰따옴표와 `token_use` 값 한글 표기, 슬라이드 11·12 본문 중복, 슬라이드 15 제목 순서, 슬라이드 36 JWT 정의 오타, 모듈 목표 3번 대응 슬라이드 부재, 슬라이드 32 목록 누락, 용어 번역 분기, 다이어그램 레이블 공백 누락, 슬라이드 24·31 데이터 저장소 레이블은 모두 **교재 안에서 본문과 강사 노트가 어긋나거나 추출 과정에서 표기가 깨진 것**입니다. AWS 문서로 확인할 성질의 사실이 아니므로 근거 인용을 붙이지 않고 표기만 교정했습니다 |
