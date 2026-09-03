# 모듈 10: API 관리

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [Amazon API Gateway란 무엇입니까?](#2-amazon-api-gateway란-무엇입니까)
3. [API Gateway 작업](#3-api-gateway-작업)
4. [요청 및 응답 처리](#4-요청-및-응답-처리)
5. [코드형 API 설계](#5-코드형-api-설계)
6. [API 테스트](#6-api-테스트)
7. [API 배포](#7-api-배포)
8. [관측 가능성: 로깅, 지표, 추적](#8-관측-가능성-로깅-지표-추적)
9. [교재 대비 변경 사항](#9-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [9장](#9-교재-대비-변경-사항)에 정리했습니다.
> - 교재 안에서 슬라이드끼리 서로 어긋나는 항목은 외부 문서로 판별할 수 없어 표기를 붙이지 않고 본문에서 지적한 뒤 [9장](#9-교재-대비-변경-사항)에 모았습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 할 수 있습니다.

- Amazon API Gateway의 주요 구성 요소 설명
- AWS 서비스와 통합할 API Gateway 리소스 개발
- 애플리케이션 엔드포인트용 API 요청 및 응답 호출 구성
- API 리소스를 테스트하고 애플리케이션 API 엔드포인트 배포
- 애플리케이션 API와 상호 작용할 API Gateway 리소스 생성 설명

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 실습 4 | AWS Lambda를 사용한 솔루션 개발 (개발자, Amazon Polly, Amazon API Gateway) |
| **모듈 10** | **API 관리** — API Gateway 구성 요소, 통합, 요청·응답 처리, 코드형 API 설계, 테스트, 배포 |
| 실습 5 | Amazon API Gateway를 사용한 솔루션 개발 (사용자, Amazon API Gateway, DynamoDB 테이블) |

앞선 모듈에서 백엔드 데이터베이스 스토리지 시스템을 구축하고 컴퓨팅 처리를 구성했습니다. 이제 사용자가 인터넷을 통해 이러한 서비스에 액세스할 수 있는 방법을 구성합니다. 교재는 이 역할을 "Amazon API Gateway는 애플리케이션의 모든 서비스를 함께 연결합니다"로 요약합니다.

### 이 모듈에서 다루는 것

교재 덱은 열 개 섹션으로 구성됩니다. 이 문서도 같은 순서를 따릅니다.

| 교재 섹션 | 슬라이드 | 이 문서 |
|---|---|---|
| Amazon API Gateway란 무엇입니까? | 5–10 | [2장](#2-amazon-api-gateway란-무엇입니까) |
| API Gateway 작업 | 11–14 | [3장](#3-api-gateway-작업) |
| 요청 및 응답 처리 | 15–20 | [4장](#4-요청-및-응답-처리) |
| 코드형 API 설계 | 21–22 | [5장](#5-코드형-api-설계) |
| API 테스트 | 23–28 | [6장](#6-api-테스트) |
| API 배포 | 29–37 | [7장](#7-api-배포) |
| 데모 / 학습 내용 확인 / 실습 5 / 요약 | 37–45 | [7.7절](#77-데모-주제) |

교재에 없는 관측 가능성(로깅, 지표, 추적)은 [8장](#8-관측-가능성-로깅-지표-추적)에 따로 모았습니다. 교재 다이어그램에는 Amazon CloudWatch와 AWS X-Ray가 애플리케이션 구성 요소로 등장하지만 본문에서 설명하지 않기 때문입니다.

예제 애플리케이션의 API 리소스와 메서드는 다음과 같습니다(교재 슬라이드 9).

| 리소스 | 메서드 | 기능 |
|---|---|---|
| `/notes` | `GET` | List |
| `/notes` | `POST` | Create |
| `/notes/search` | `GET` | Search |
| `/notes/(id)` | `DELETE` | Delete |
| `/notes/(id)` | `POST` | Update |

---

## 2. Amazon API Gateway란 무엇입니까?

### 2.1 백엔드 서비스에 액세스

Amazon API Gateway는 AWS나 다른 타사 서비스에 액세스하는 API를 생성, 게시, 유지 관리, 모니터링 및 보호하는 AWS 서비스입니다. 문서는 API Gateway를 애플리케이션이 백엔드 서비스의 데이터, 비즈니스 로직, 기능에 액세스하는 **'프런트 도어(front door)'** 로 기술합니다. 대표적인 백엔드는 Amazon EC2에서 실행되는 워크로드, AWS Lambda에서 실행되는 코드, 웹 애플리케이션, 실시간 통신 애플리케이션입니다.

API Gateway는 수천 건의 동시 API 호출을 수락하고 처리하는 데 관련된 모든 작업을 처리합니다. 여기에는 트래픽 관리, 권한 부여와 액세스 제어, 모니터링, API 버전 관리가 포함됩니다.

> — 출처: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 2.2 API Gateway가 만드는 API는 세 가지입니다 🔄

교재 슬라이드 6의 도형에는 "REST, HTTP 또는 WebSocket API"가 적혀 있고 강사 노트도 세 가지를 나열합니다. 이 부분은 현재 문서와 일치합니다. 모듈 2에서는 다이어그램이 `REST API` 하나만 표기해 교정이 필요했지만, 모듈 10은 처음부터 세 가지를 제시합니다.

| API 유형 | 문서의 성격 서술 |
|---|---|
| REST | 무상태. HTTP 기반이고 `GET`·`POST`·`PUT`·`PATCH`·`DELETE` 같은 표준 HTTP 메서드 구현 |
| HTTP | 무상태. RESTful API 제품이며 **더 낮은 가격으로 제공하기 위해 최소 기능으로 설계** |
| WebSocket | **상태 저장.** WebSocket 프로토콜을 따라 양방향 통신을 가능하게 하고 메시지 내용에 따라 라우팅 |

🔄 교정이 필요한 부분은 슬라이드 7 강사 노트입니다. 교재는 "HTTP API를 사용하여 REST API보다 **대기 시간이 짧고** 비용이 저렴한 RESTful API를 만듭니다"라고 적습니다. 두 API를 비교하는 현재 문서가 제시하는 축은 **기능 수와 가격**이며, 대기 시간은 비교 항목으로 나오지 않습니다. 비용이 더 낮다는 서술은 문서와 일치합니다("HTTP APIs are designed with minimal features so that they can be offered at a lower price"). 대기 시간 비교는 이 문서에서 확인하지 못했으므로 [9.5절](#95-검증하지-못한-항목)에 남겨 두었습니다.

> — 출처: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 2.3 REST API와 HTTP API를 고르는 기준 🆕

교재 슬라이드 7 강사 노트는 "애플리케이션은 REST API를 사용합니다"로 끝나고 선택 기준을 다루지 않습니다. 문서는 **한쪽을 일률적으로 권장하지 않고** 필요한 기능 유무로 고르라고 안내합니다.

| 필요한 기능 | 선택 |
|---|---|
| API 키, 클라이언트별 스로틀링, 요청 검증, AWS WAF 통합, 프라이빗 API 엔드포인트 | **REST API** |
| 위 기능이 필요 없음 | **HTTP API**(더 저렴) |

주요 기능 대조표입니다. 이 모듈이 다루는 기능 대부분이 REST API 전용이라는 점을 확인해 두면 좋습니다.

| 범주 | 기능 | REST API | HTTP API |
|---|---|---|---|
| 엔드포인트 유형 | 엣지 최적화 / 프라이빗 | 지원 | 미지원 |
| 엔드포인트 유형 | 리전 | 지원 | 지원 |
| 보안 | 상호 TLS 인증 | 지원 | 지원 |
| 보안 | 백엔드 인증용 인증서, AWS WAF | 지원 | 미지원 |
| 권한 부여 | IAM, Lambda 권한 부여자 | 지원 | 지원 |
| 권한 부여 | 리소스 정책 | 지원 | 미지원 |
| 권한 부여 | Amazon Cognito | 직접 지원 | JWT 권한 부여자를 통해 |
| 권한 부여 | JWT 권한 부여자 | 미지원(JWT 검증은 Lambda 권한 부여자로) | 지원 |
| API 관리 | API 키, 클라이언트별 요청 속도 제한, 클라이언트별 사용량 스로틀링, 개발자 포털 | 지원 | 미지원 |
| API 관리 | 사용자 지정 도메인 | 지원 | 지원 |
| 개발 | 테스트 호출, 캐싱, 사용자 지정 게이트웨이 응답, 카나리 릴리스 배포, 요청 검증, 요청 본문 변환 | 지원 | 미지원 |
| 개발 | 자동 배포 | 미지원 | 지원 |
| 개발 | CORS 구성, 사용자 제어 배포, 요청 파라미터 변환 | 지원 | 지원 |
| 모니터링 | CloudWatch 지표, CloudWatch Logs 액세스 로그 | 지원 | 지원 |
| 모니터링 | 실행 로그, Amazon Data Firehose 액세스 로그, AWS X-Ray 추적 | 지원 | 미지원 |
| 통합 | 퍼블릭 HTTP 엔드포인트, AWS 서비스, Lambda 함수, NLB·ALB 프라이빗 통합 | 지원 | 지원 |
| 통합 | Mock 통합, 응답 스트리밍 | 지원 | 미지원 |
| 통합 | AWS Cloud Map 프라이빗 통합 | 미지원 | 지원 |

**이 과정이 REST API를 쓰는 것은 잘못된 선택이 아닙니다.** 요청 검증, 매핑 템플릿, 캐싱, 카나리 릴리스, 사용량 계획처럼 이 모듈이 다루는 기능이 대부분 REST API에만 있기 때문입니다.

> — 출처: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 2.4 WebSocket API 작업 🔄

WebSocket API는 AWS 서비스(예: Lambda, DynamoDB)나 HTTP 엔드포인트를 위한 **상태 저장 프런트엔드**입니다. 양방향이므로 클라이언트가 명시적으로 요청하지 않아도 서비스가 데이터를 푸시할 수 있습니다. 교재는 채팅 애플리케이션, 협업 플랫폼, 멀티플레이어 게임, 금융 거래 플랫폼을 예로 듭니다.

들어오는 JSON 메시지는 구성한 경로에 따라 백엔드 통합으로 전달되고, **JSON이 아닌 메시지는 구성한 `$default` 경로로** 전달됩니다. 경로에는 경로 선택 표현식이 평가된 뒤 기대되는 값인 **경로 키(route key)** 가 포함됩니다. `routeSelectionExpression`은 **API 수준에서 정의되는 속성**이며 메시지 페이로드에 존재해야 하는 JSON 속성을 지정합니다.

| 경로 | 호출 조건 |
|---|---|
| `$connect` | 클라이언트와 WebSocket API 사이의 영구 연결이 시작될 때 |
| `$disconnect` | 클라이언트나 서버가 API와의 연결을 끊을 때 |
| 사용자 지정 경로 | 경로 선택 표현식을 메시지에 대해 평가한 뒤 일치하는 경로를 찾았을 때. 일치 여부가 어떤 통합이 호출될지 결정합니다 |
| `$default` | 경로 선택 표현식을 평가할 수 없거나 일치하는 경로가 없을 때 |

서비스는 `routeKey`가 평가된 값과 **정확히 일치**하는 경로를 사용합니다. 일치하는 것이 없고 `$default`가 있으면 그 경로를 쓰고, `$default`도 없으면 오류를 반환합니다. WebSocket 기반 API의 표현식은 `$request.body.{본문_요소_경로}` 형태여야 합니다.

🆕 교재가 다루지 않는 제약입니다.

| 항목 | 문서 내용 |
|---|---|
| 사용자 지정 경로 키 | `$` 접두사를 쓸 수 없습니다. `$`는 사전 정의 경로용으로 예약되어 있습니다 |
| 권한 부여 위치 | WebSocket 연결은 상태 저장이므로 권한 부여는 **`$connect` 경로에만** 구성할 수 있고 인증·권한 부여는 연결 시점에만 수행됩니다 |
| 권한 부여 값 | `NONE`, `AWS_IAM`, `CUSTOM`. 이 설정은 `$connect` 경로만이 아니라 **API 전체**에 적용됩니다 |
| `$connect` 실패 | 연결이 만들어지지 않고 클라이언트는 `401` 또는 `403`을 받습니다. `$connect` 통합 설정 자체는 선택 사항입니다 |
| `$disconnect` 신뢰성 | 연결이 닫힌 뒤에 실행되므로 **best-effort 이벤트**이고 API Gateway가 전달을 보장하지 않습니다 |

> — 출처: [Create routes for WebSocket APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html)
> — 출처: [Manage connected users and client apps: $connect and $disconnect routes](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html)

### 2.5 API Gateway 및 애플리케이션

REST API는 백엔드 HTTP 엔드포인트, Lambda 함수 또는 기타 AWS 서비스와 통합된 HTTP 리소스와 메서드의 모음이며 이 모음을 **하나 이상의 스테이지로 배포**할 수 있습니다. 일반적으로 API 리소스는 애플리케이션 로직에 따라 리소스 트리로 구성되고, 각 리소스는 API Gateway가 지원하는 고유 HTTP 동사를 가진 하나 이상의 메서드를 노출합니다.

교재는 예제 애플리케이션에서 `GET`·`POST`·`DELETE`로 요청을 검증하고 Lambda 함수가 반환한 응답을 변환한다고 설명합니다.

> — 출처: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 2.6 API Gateway 개발자 기능

교재 슬라이드 10은 개발자 기능 여덟 가지를 제시합니다. 각 항목이 이 문서 어디에서 자세히 다뤄지는지 함께 정리했습니다.

| 교재 기능 | 요약 | 자세히 |
|---|---|---|
| 여러 버전 호스팅 | 스테이지는 API의 스냅샷인 배포에 대한 명명된 참조입니다. 스테이지 설정으로 캐싱 활성화, 요청 제한 사용자 지정, 로깅 구성, 스테이지 변수 정의, 테스트용 canary 릴리스 첨부를 합니다 | [7.1절](#71-api-gateway-스테이지) |
| API 키 구성 | 사용량 계획과 API 키를 구성하면 고객이 합의된 요청 속도와 할당량으로 API에 액세스합니다 | [7.6절](#76-요청-제한과-사용량-계획) |
| 스로틀 제한 | 너무 많은 요청으로 API가 과부하되지 않게 제한합니다 | [7.6절](#76-요청-제한과-사용량-계획) |
| 액세스 제어 및 관리 | 표준 IAM 역할·정책, 리소스 정책, CORS, Lambda 권한 부여자 | [3.4절](#34-메서드-권한-부여-유효값) |
| 데이터 변환 | 메서드 요청은 백엔드 요구에 따라 여러 유형의 통합 요청 페이로드를 선택할 수 있고, 백엔드는 프런트엔드가 예상하는 것과 다른 통합 응답 페이로드를 반환할 수 있습니다 | [4장](#4-요청-및-응답-처리) |
| SDK 생성 | 지원 언어는 Java, JavaScript, Java for Android, Objective-C 또는 Swift for iOS, Ruby입니다. **현재 문서와 그대로 일치합니다** | [5.3절](#53-api-정의-가져오기와-내보내기) |
| Mock 통합 | 통합 백엔드 없이 API Gateway에서 바로 응답을 생성합니다 | [6.3절](#63-mock-통합) |
| 응답 캐싱 | 엔드포인트 호출 수를 줄이고 요청 대기 시간을 개선합니다 | [7.5절](#75-응답-캐싱) |

액세스 제어 항목은 교재가 네 가지만 나열합니다. 🆕 현재 문서의 목록은 더 넓습니다.

| 목적 | 메커니즘 |
|---|---|
| 인증·권한 부여 | 리소스 정책, 표준 AWS IAM 역할·정책, IAM 태그, 인터페이스 VPC 엔드포인트용 엔드포인트 정책, **Lambda 권한 부여자**, **Amazon Cognito 사용자 풀** |
| 그 밖의 액세스 제어 작업 | CORS, 클라이언트 측 SSL 인증서, **AWS WAF** |
| 부여한 액세스 추적·제한 | **사용량 계획**(API 키별로 스테이지·메서드 사용량 추적·제한) |

> — 출처: [Control and manage access to REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)
> — 출처: [Generate SDKs for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html)

### 2.7 프라이빗 REST API와 AWS WAF 🆕

교재 슬라이드 10 강사 노트는 보안 항목에서 프라이빗 REST API와 VPC 엔드포인트 정책을, 제어 항목에서 AWS WAF 통합을 한 문장씩 언급합니다. 두 서술 모두 현재 문서와 일치하며 아래 내용이 추가됩니다.

**프라이빗 REST API.** VPC 안에 만드는 엔드포인트 네트워크 인터페이스인 인터페이스 VPC 엔드포인트로 액세스하고, 인터페이스 엔드포인트는 **AWS PrivateLink** 로 동작합니다. Direct Connect로 온프레미스 네트워크를 Amazon VPC에 연결한 뒤 그 연결로 액세스할 수도 있습니다. 모든 경우에 트래픽은 퍼블릭 인터넷과 격리되며 Amazon 네트워크를 떠나지 않습니다.

| 항목 | 내용 |
|---|---|
| 모범 사례 | 여러 프라이빗 API에 VPC 엔드포인트 하나 사용 / VPC 엔드포인트를 API에 연결(Route 53 별칭 DNS 레코드가 생성됨) / VPC에 프라이빗 DNS 켜기(`Host` 또는 `x-apigw-api-id` 헤더 없이 호출 가능) / 리소스 정책에 `aws:SourceVpc`·`aws:SourceVpce` 조건 추가 |
| 주의 | 프라이빗 DNS를 켜면 **퍼블릭 API의 기본 엔드포인트에 액세스할 수 없습니다** |
| 제약 | REST API만 지원 / 프라이빗 API를 엣지 최적화로 변환 불가 / **TLS 1.2만 지원** / HTTP/2 요청은 HTTP/1.1로 강제 / IP 주소 유형은 dualstack만 |

**AWS WAF.** 웹 액세스 제어 목록(web ACL)으로 SQL 주입, 크로스 사이트 스크립팅 같은 공격을 막습니다. HTTP 헤더·메서드·쿼리 문자열·URI·요청 본문(**첫 64KB로 제한**)에서 문자열이나 정규식 패턴에 일치하는 규칙을 만들 수 있고, 속도 기반 규칙으로 이동하며 갱신되는 5분 구간의 클라이언트 IP별 허용 요청 수를 지정할 수 있습니다.

🆕 중요한 우선순위: **API에서 AWS WAF를 활성화하면 리소스 정책, IAM 정책, Lambda 권한 부여자, Amazon Cognito 권한 부여자보다 먼저 AWS WAF 규칙이 평가됩니다.** 리소스 정책이 허용하는 CIDR 블록을 AWS WAF가 차단하면 AWS WAF가 우선하고 리소스 정책은 평가되지 않습니다. 웹 ACL은 **API 스테이지에** 연결합니다.

보안은 AWS와 고객의 **공동 책임**입니다. 공동 책임 모델은 이를 '클라우드의 보안'(AWS 책임)과 '클라우드 내부의 보안'(고객 책임)으로 나눕니다.

> — 출처: [Private REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html)
> — 출처: [Use AWS WAF to protect your REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html)
> — 출처: [Security in Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html)

---

## 3. API Gateway 작업

### 3.1 애플리케이션에서의 API Gateway 작동 방식

교재 슬라이드 12의 흐름입니다. 요청 쪽에서 API Gateway가 **권한 부여, 구성, 계측, 변환, 매핑**을 수행하고, 응답 쪽에서 **구성, 변환, 맵**을 수행합니다. 슬라이드 주석은 "참고: 구성은 개발자의 책임입니다"라고 못을 박습니다.

API 메서드를 만들 때는 메서드를 백엔드 엔드포인트와 통합해야 합니다. 백엔드 엔드포인트는 **통합 엔드포인트**라고도 하며 Lambda 함수, HTTP 웹페이지 또는 AWS 서비스 작업일 수 있습니다.

| 설정 | 동반되는 작업 |
|---|---|
| 통합 요청 설정 | 모든 권한 부여의 메시지 확인 / 클라이언트가 제출한 메서드 요청을 백엔드로 전달하는 방법 구성 / 필요하면 요청 데이터를 통합 요청 데이터로 변환하는 방법 구성 / 호출할 Lambda 함수 지정 / 수신 요청을 전달할 HTTP 서버 또는 호출할 AWS 서비스 작업 지정 |
| 통합 응답 설정 (**비프록시 통합에만 해당**) | 백엔드 결과를 특정 상태 코드의 메서드 응답으로 전달하는 방법 구성 / 통합 응답 파라미터를 사전 구성한 메서드 응답 파라미터로 변환하는 방법 구성 / 통합 응답 본문을 본문 매핑 템플릿에 따라 메서드 응답 본문으로 매핑하는 방법 구성 |

"통합 응답 설정은 비프록시 통합에만 해당한다"는 교재 서술은 현재 문서와 일치합니다. 프록시 통합에서는 통합 요청도 통합 응답도 설정하지 않습니다.

> — 출처: [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html)

### 3.2 REST API의 핵심 구성 요소

REST API는 리소스와 메서드로 구성됩니다. **리소스**는 애플리케이션이 리소스 경로를 통해 액세스할 수 있는 논리적 엔터티이고, **메서드**는 클라이언트가 백엔드 리소스에 액세스하려고 API를 호출하는 클라이언트 쪽 인터페이스입니다.

**API 엔드포인트**는 특정 리전에 배포된 API의 호스트 이름이며 형식은 `{api-id}.execute-api.{region}.amazonaws.com` 입니다. 교재 슬라이드 13의 표기와 그대로 일치합니다.

```http
GET https://{api-id}.execute-api.{region}.amazonaws.com/notes
```

계층 구조는 API 엔드포인트 → 리소스 → 메서드 → 리소스 구성(요청, 응답, 통합)입니다. 대표적인 메서드는 `GET`, `POST`, `HEAD`, `DELETE`이며 `ANY`를 포함해 다른 메서드도 선택할 수 있습니다.

교재 슬라이드 13 강사 노트는 "이 예에서 API 리소스는 `/notes`, `/notes/search`와 **`/notes/list`** 로 나열됩니다"라고 적지만, 같은 슬라이드 도형에는 `/notes`와 `/notes/search` 둘만 있고 슬라이드 9의 메서드 목록에도 `/notes/list`는 없습니다. **교재 안에서 서로 어긋나는 서술**이며 어느 쪽이 이 애플리케이션의 올바른 설계인지는 AWS 문서로 판별할 수 없습니다. 이 문서는 도형과 슬라이드 9에 맞춰 두 리소스로 씁니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

> — 출처: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 3.3 엔드포인트 유형과 기본값 🔄

세 엔드포인트 유형의 이름과 특성에 대한 교재 서술은 현재 문서와 일치합니다.

| 유형 | 내용 |
|---|---|
| 엣지 최적화 (edge-optimized) | 보통 가장 가까운 CloudFront POP로 요청을 라우팅합니다. 클라이언트가 지리적으로 분산된 경우에 도움이 됩니다. HTTP 헤더 이름을 대문자로 바꾸고(예: `Cookie`), CloudFront가 오리진으로 전달하기 전에 쿠키를 이름 순으로 정렬합니다. 사용자 지정 도메인 이름은 모든 리전에 적용됩니다 |
| 리전 (Regional) | 같은 리전의 클라이언트를 위한 유형입니다. EC2 인스턴스에서 실행되는 클라이언트가 같은 리전의 API를 호출하거나 요구가 큰 소수 클라이언트를 대상으로 할 때 연결 오버헤드를 줄입니다. 사용자 지정 도메인 이름은 배포된 리전에 한정되며 Route 53과 함께 지연 시간 기반 라우팅에 쓸 수 있습니다. 헤더 이름을 그대로 전달합니다 |
| 프라이빗 (private) | VPC 안에 만든 인터페이스 VPC 엔드포인트(ENI)를 통해 사용자의 Amazon VPC에서만 액세스할 수 있습니다. 헤더 이름을 그대로 전달합니다 |

🔄 교정할 부분은 기본값입니다. 교재 슬라이드 13 강사 노트는 "엔드포인트 유형에서는 **리전 API 엔드포인트가 기본적으로 선택됩니다**"라고 기재합니다. 현재 문서는 엣지 최적화 엔드포인트를 설명하면서 **"이것이 API Gateway REST API의 기본 엔드포인트 유형"** 이라고 명시하고, 개념 문서도 엣지 최적화 엔드포인트를 "API Gateway API의 기본 호스트 이름"으로 정의합니다. 같은 리전 클라이언트가 대부분이면 리전 유형을 명시적으로 선택하세요.

> — 출처: [API endpoint types for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html)

### 3.4 메서드 권한 부여 유효값 🔄

교재 슬라이드 13 본문 주석은 "권한 부여를 통해 메서드 액세스를 제어합니다. 기본값은 none 또는 AWS_IAM으로 설정됩니다"라고 적고 강사 노트도 유효값을 두 개만 나열합니다. 🔄 `PutMethod` API 참조에서 `authorizationType`은 **필수 파라미터**이고 유효값은 네 개입니다.

| 값 | 의미 |
|---|---|
| `NONE` | 개방 액세스. 클라이언트 인증이 수행되지 않습니다 |
| `AWS_IAM` | AWS IAM 권한으로 클라이언트 액세스를 제어합니다. 클라이언트는 AccessKey와 SecretKey로 요청에 서명해야 하고 **서명 버전 4(SigV4)** 를 지원해야 합니다 |
| `CUSTOM` | 사용자 지정 권한 부여자, 즉 **Lambda 권한 부여자** |
| `COGNITO_USER_POOLS` | **Amazon Cognito 사용자 풀** 권한 부여자 |

`authorizerId`는 유형이 `CUSTOM` 또는 `COGNITO_USER_POOLS`일 때 쓸 `Authorizer` 식별자를 지정합니다. `apiKeyRequired`는 Boolean이며 교재의 "API 키가 메서드를 호출하게 하려면 API Key Required를 true로 설정하십시오"라는 안내와 일치합니다.

**Lambda 권한 부여자.** 🆕 문서는 이 기능이 **이전에 사용자 지정 권한 부여자(custom authorizer)라고 불렸다**고 명시합니다. 오래된 자료에서 그 이름을 만날 수 있습니다. 유형은 두 가지입니다.

| 유형 | 자격 증명 출처 | 특징 |
|---|---|---|
| `REQUEST` (**문서 권장**) | 헤더, 쿼리 문자열 파라미터, `stageVariables`, `$context` 변수 조합 | 여러 자격 증명 소스로 세분화된 정책을 만들 수 있고 캐시 키를 분리할 수 있습니다. 캐싱을 켜면 지정된 자격 증명 소스가 없거나 `null`이거나 비어 있으면 함수를 호출하지 않고 `401 Unauthorized`를 반환합니다 |
| `TOKEN` | JWT·OAuth 같은 전달자 토큰 | 캐싱을 켜면 토큰 소스의 헤더 이름이 캐시 키가 됩니다. `IdentityValidationExpression` 정규식으로 토큰을 미리 검증할 수 있습니다(TOKEN 전용) |

권한 부여자는 호출자의 자격 증명을 입력으로 받아 **IAM 정책과 프린시펄 식별자**를 반환합니다. 반환하지 않으면 호출이 실패합니다. 거부되면 `403 ACCESS_DENIED` 같은 상태 코드를 반환하고, 허용되면 메서드를 호출합니다.

**Amazon Cognito 사용자 풀 권한 부여자.** `COGNITO_USER_POOLS` 유형의 권한 부여자를 만들고 메서드가 그 권한 부여자를 쓰도록 구성합니다. 클라이언트는 사용자를 사용자 풀에 로그인시켜 자격 증명 토큰 또는 액세스 토큰을 얻고 보통 `Authorization` 헤더에 넣어 호출합니다. 자격 증명 토큰은 로그인한 사용자의 클레임을 기준으로, 액세스 토큰은 액세스 보호 리소스의 사용자 지정 범위를 기준으로 승인합니다. Cognito는 모듈 12에서 자세히 다룹니다.

> — 출처: [PutMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethod.html)
> — 출처: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
> — 출처: [Control access to REST APIs using Amazon Cognito user pools as an authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)

### 3.5 통합 유형 🔄

통합 유형은 작업하는 통합 엔드포인트 유형과 데이터를 주고받는 방식에 따라 고릅니다. 프로그래밍 방식으로는 `Integration` 리소스의 `type` 속성으로 지정합니다.

| 범주 | 초기 설정 | 요청·응답 구성 | 패스스루 | `type` 값 |
|---|---|---|---|---|
| 프록시 | 유연하고 다목적이며 효율적인 통합 설정 | 통합 요청도 통합 응답도 설정하지 않습니다 | 패스스루 동작을 수정하는 옵션이 없습니다 | `AWS_PROXY`, `HTTP_PROXY` |
| 비프록시 | 데이터 매핑은 사용자의 책임 | 통합 요청과 통합 응답을 모두 구성해야 합니다 | 패스스루 동작을 선택할 수 있습니다 | `AWS`, `HTTP` |
| Mock | API 테스트에 유용 | 백엔드에 요청을 보내지 않고 응답을 반환합니다 | 해당 없음(백엔드를 호출하지 않습니다) | `MOCK` |

교재 슬라이드 14의 표는 Mock 행의 '패스스루' 칸과 '통합 유형' 칸에 모두 `MOCK`을 넣어 열 의미가 어긋납니다. 위 표에서는 그 칸을 교정했습니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

유형별 정의입니다.

| `type` | 정의 |
|---|---|
| `AWS` | API가 AWS 서비스 작업을 노출합니다. 통합 요청과 통합 응답을 모두 구성하고 필요한 데이터 매핑을 설정해야 합니다. Lambda 함수 호출 작업을 쓰면 **Lambda 사용자 지정 통합**이라고 부르며, 이는 `AWS` 통합의 특수한 경우입니다 |
| `AWS_PROXY` | **Lambda 프록시 통합.** 클라이언트와 통합된 Lambda 함수 사이의 직접 상호 작용에 의존합니다. 통합 요청·응답을 설정하지 않고 API Gateway가 들어오는 요청을 그대로 함수 입력으로 전달합니다. **함수 호출 작업 외의 AWS 서비스 작업이나 다른 Lambda 작업에는 쓸 수 없습니다** |
| `HTTP` | **HTTP 사용자 지정 통합.** 백엔드 HTTP 엔드포인트를 노출하며 통합 요청과 통합 응답을 모두 구성해야 합니다 |
| `HTTP_PROXY` | **HTTP 프록시 통합.** 단일 API 메서드로 백엔드 HTTP 엔드포인트에 액세스합니다. 통합 요청·응답을 설정하지 않고 요청과 응답을 그대로 전달합니다 |
| `MOCK` | 요청을 백엔드로 보내지 않고 API Gateway가 응답을 반환합니다. 백엔드 사용 비용 없이 통합 설정을 테스트하고 협업 개발을 가능하게 합니다 |

🔄 교재와 달라지는 세 지점입니다.

| 항목 | 교재 | 현재 문서 |
|---|---|---|
| Lambda 통합 권장 | Lambda 프록시와 Lambda 사용자 지정을 대등하게 나열 | **Lambda 프록시가 "Lambda 함수를 호출하는 데 선호되는 통합 유형"** 입니다. 설정이 간소하고 기존 설정을 해체하지 않고도 백엔드와 함께 발전할 수 있습니다. Lambda 사용자 지정 통합은 입력·출력 형식 요구가 비슷한 여러 엔드포인트에서 매핑 템플릿을 재사용할 때 쓰며 더 복잡한 시나리오용입니다 |
| `HTTP`·`HTTP_PROXY` 정의 | "VPC에 있는 프라이빗 HTTP 엔드포인트를 포함한 HTTP 엔드포인트" | 두 유형은 **백엔드 HTTP 엔드포인트** 통합입니다. 프라이빗 통합은 `HTTP_PROXY` + `connectionType=VPC_LINK` + VPC 링크 V2로 구성하는 **별도 설정**입니다. VPC 링크 V2는 NLB와 ALB를 모두 대상으로 삼을 수 있고 `connectionId`를 스테이지 변수로 넘길 수 있습니다 |
| Mock 통합의 용도 | 테스트 | 테스트와 협업 개발 외에 **CORS 관련 헤더 반환**에도 씁니다. API Gateway 콘솔은 CORS 지원을 위해 `OPTIONS` 메서드를 Mock 통합으로 통합하며 게이트웨이 응답도 Mock 통합의 예입니다 |

**HTTP API가 지원하는 통합.** 🔄 교재 슬라이드 14 강사 노트는 "Lambda 프록시 / AWS 서비스 / VPC에 있는 프라이빗 리소스 / **Mock** 및 HTTP 프록시 통합"을 나열합니다. REST·HTTP 비교 문서의 통합 표는 **Mock 통합을 REST API 전용**으로 표시합니다. 나머지 항목은 맞습니다.

> — 출처: [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html)
> — 출처: [Set up a private integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html)
> — 출처: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 3.6 Lambda 프록시 통합의 입력과 출력 형식 🆕

교재는 `AWS_PROXY`를 "원 상태 그대로 전달된 클라이언트 요청을 사용하여 Lambda 함수 호출 작업과 통합"이라고만 서술합니다. 실제로는 **고정된 입력·출력 형식**이 있고 이를 지키지 않으면 호출이 실패합니다.

전달되는 요청 데이터에는 요청 헤더, 쿼리 문자열 파라미터, URL 경로 변수, 페이로드, API 구성 데이터(현재 배포 스테이지 이름, 스테이지 변수, 사용자 자격 증명, 권한 부여 컨텍스트)가 포함됩니다. **요청 파라미터의 순서는 보존되지 않습니다.**

```json
{
  "resource": "/my/path",
  "path": "/my/path",
  "httpMethod": "GET",
  "headers": { "header1": "value1" },
  "multiValueHeaders": { "header2": ["value1", "value2"] },
  "queryStringParameters": { "parameter1": "value1" },
  "multiValueQueryStringParameters": { "parameter2": ["value1", "value2"] },
  "requestContext": { "accountId": "123456789012", "stage": "prod" },
  "pathParameters": null,
  "stageVariables": null,
  "body": "Hello from Lambda!",
  "isBase64Encoded": false
}
```

함수는 다음 형식으로 반환해야 합니다. 형식이 다르면 API Gateway가 **`502 Bad Gateway`** 를 반환합니다.

```json
{
  "isBase64Encoded": false,
  "statusCode": 200,
  "headers": { "Access-Control-Allow-Origin": "*" },
  "multiValueHeaders": { "Set-Cookie": ["a=1", "b=2"] },
  "body": "..."
}
```

| 항목 | 내용 |
|---|---|
| `headers` vs `multiValueHeaders` | `headers`는 단일 값 헤더만, `multiValueHeaders`는 다중 값과 단일 값 헤더를 모두 담습니다. 둘을 함께 지정하면 병합되며 같은 키-값 쌍이 둘에 다 있으면 `multiValueHeaders` 값만 남습니다 |
| CORS | 출력 `headers`에 `Access-Control-Allow-Origin`을 넣어야 합니다 |
| 이진 데이터 | `body`가 이진 블롭이면 `isBase64Encoded`를 `true`로 하고 이진 미디어 유형을 `*/*`로 구성합니다 |
| 권한 부여 컨텍스트 | `AWS_IAM`은 `$context.identity.*`, `COGNITO_USER_POOLS`는 `$context.identity.cognito*`와 `$context.authorizer.claims.*`, `CUSTOM`은 `$context.authorizer.principalId`와 그 밖의 `$context.authorizer.*`를 전달합니다 |
| 프록시 리소스 | `{proxy+}` 템플릿 경로 변수와 catch-all `ANY` 메서드를 결합해 하나의 메서드로 경로 계층 전체를 받을 수 있습니다. `{proxy+}`는 경로 계층의 어떤 리소스든 가리키고 `{custom}`은 특정 경로 세그먼트만 가리킵니다 |

프록시 통합은 클라이언트가 백엔드 요구 사항을 더 자세히 알아야 하므로, 백엔드 개발자가 요구 사항을 명확히 전달하고 요구가 충족되지 않을 때 견고한 오류 피드백을 제공해야 합니다.

🆕 **HTTP API의 페이로드 형식 버전.** HTTP API에서 Lambda 프록시 통합을 만들 때는 `payloadFormatVersion`을 지정합니다. 콘솔은 기본으로 최신 버전을 쓰지만 **AWS CLI·CloudFormation·SDK로 만들면 반드시 지정해야** 합니다. 지원 값은 `1.0`과 `2.0`입니다.

| 차이 | `1.0` | `2.0` |
|---|---|---|
| 다중 값 필드 | `multiValueHeaders`, `multiValueQueryStringParameters` 있음 | 없음. 중복 헤더·쿼리 문자열을 쉼표로 합쳐 `headers`·`queryStringParameters`에 넣습니다 |
| 경로 | `path` | `rawPath` 추가. 사용자 지정 도메인의 API 매핑 값을 얻으려면 `1.0`과 `path`를 써야 합니다 |
| 쿠키 | 헤더로 처리 | `cookies` 필드 추가. 응답에서 각 쿠키가 `set-cookie` 헤더가 됩니다 |
| 응답 추론 | 없음. `isBase64Encoded`·`statusCode`·`headers`·`multiValueHeaders`·`body`를 반환해야 합니다 | 유효한 JSON을 반환하고 `statusCode`가 없으면 `isBase64Encoded=false`, `statusCode=200`, `content-type=application/json`, `body=함수 응답`으로 추론합니다 |

> — 출처: [Lambda proxy integrations in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html)
> — 출처: [Create AWS Lambda proxy integrations for HTTP APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html)

### 3.7 통합 패스스루 동작 🔄

메서드 요청에 페이로드가 있고 `Content-Type` 헤더에 대한 매핑 템플릿이 정의되어 있지 않으면 클라이언트가 제공한 페이로드를 변환 없이 백엔드로 전달할 수 있습니다. 이 과정을 **통합 패스스루**라고 합니다.

🔄 교재 슬라이드 14 강사 노트는 이를 "조건 두 가지"로 서술합니다. 현재 문서는 **세 가지 선택지가 있는 설정**으로 기술하고 권장 값을 표시합니다.

| 콘솔 표기 | `passthroughBehavior` | 동작 |
|---|---|---|
| When no template matches the request Content-Type header | `WHEN_NO_MATCH` | 메서드 요청 콘텐츠 유형이 매핑 템플릿에 연결된 어떤 콘텐츠 유형과도 일치하지 않을 때 본문을 변환 없이 전달합니다 (교재의 조건 ①) |
| When there are no templates defined (**recommended**) | `WHEN_NO_TEMPLATES` | 통합 요청에 매핑 템플릿이 정의되지 않았을 때만 변환 없이 전달합니다. 템플릿이 정의되어 있는데 콘텐츠 유형이 일치하지 않으면 **`415 Unsupported Media Type`** 으로 거부합니다 (교재의 조건 ②) |
| Never | `NEVER` | 매핑 템플릿이 정의되지 않아도 전달하지 않고, 매핑되지 않은 콘텐츠 유형은 `415`로 거부합니다 |

`Content-Type` 헤더가 없으면 API Gateway는 `application/json`으로 기본 처리합니다. 프록시 통합에서는 API Gateway가 전체 요청을 백엔드로 전달하고 패스스루 동작을 수정할 수 없다는 교재 서술은 맞습니다.

> — 출처: [Method request behavior for payloads without mapping templates for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/integration-passthrough-behaviors.html)

### 3.8 REST API 할당량 🆕

교재는 할당량을 다루지 않습니다. 설계 단계에서 부딪히는 값들입니다.

| 항목 | 기본 할당량 | 상향 |
|---|---|---|
| **통합 시간 초과** (모든 엔드포인트 유형, 모든 통합 유형) | **50밀리초 ~ 29초** | 리전·프라이빗 API는 29초 초과로 상향 가능하지만 계정의 리전 수준 스로틀 할당량을 낮춰야 할 수 있습니다. 엣지 최적화는 상향 불가. 50밀리초 미만으로는 설정 불가 |
| **페이로드 크기** | **10MB** | 불가 |
| 유휴 연결 시간 초과 | 310초 | 불가 |
| API당 리소스 | 300 | 가능 (`{proxy+}` 경로로 리소스 수를 줄일 수 있습니다) |
| API당 스테이지 | 10 | 가능 (API를 여러 API로 분할하는 방법도 있습니다) |
| API당 권한 부여자 (Lambda 및 Cognito) | 10 | 가능 (메서드 간에 권한 부여자를 재사용하세요) |
| API당 모델 크기 | 400KB | 불가 |
| 리전 API / 엣지 최적화 API / 프라이빗 API | 리전당 600 / 리전당 120 / 계정·리전당 600 | 불가 |
| 계정·리전당 API 키 | 10,000 | 불가 |
| API 키당 사용량 계획 | 10 | 가능 |

관리 작업 자체에도 할당량이 있고 모두 상향 불가입니다. 자동화 스크립트를 쓸 때 걸립니다.

| 작업 | 할당량 |
|---|---|
| `CreateDeployment` | 계정당 5초에 1회 |
| `CreateRestApi` / `ImportRestApi` (리전·프라이빗) | 계정당 3초에 1회 |
| `CreateRestApi` / `ImportRestApi` / `DeleteRestApi` (엣지 최적화) | 계정당 30초에 1회 |
| `CreateApiKey` / `CreateResource` / `DeleteApiKey` / `DeleteResource` | 계정당 초당 5회 |
| `PutRestApi` | 계정당 초당 1회 |
| `GetResources` | 계정당 2초에 5회 |
| `UpdateUsagePlan` | 계정당 20초에 1회 |

> — 출처: [Quotas for configuring and running a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html)
> — 출처: [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html)

---

## 4. 요청 및 응답 처리

### 4.1 요청 및 응답 처리 흐름

교재 슬라이드 16의 흐름입니다.

| 방향 | 단계 |
|---|---|
| 요청 처리 | 클라이언트 → 메서드 요청 페이로드 → **요청 유효성 검사 · 요청 모델 · 요청 매핑** → 통합 요청 → 백엔드 서비스 |
| 응답 처리 | 백엔드 서비스 → 통합 응답 → **응답 매핑 템플릿 · 응답 모델** → 메서드 응답 페이로드 → 클라이언트 |

매핑 템플릿으로 매핑하는 두 방향은 **메서드 요청 → 대응하는 통합 요청**, **통합 응답 → 대응하는 메서드 응답** 입니다. 개념 문서도 매핑 템플릿을 "요청 본문을 프런트엔드 데이터 형식에서 백엔드 데이터 형식으로, 또는 응답 본문을 백엔드에서 프런트엔드 형식으로 변환하는 VTL 스크립트"로 정의하고, 통합 요청 또는 통합 응답에 지정하며 런타임에 사용 가능한 컨텍스트·스테이지 변수를 참조할 수 있다고 기술합니다.

> — 출처: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 4.2 데이터 변환의 세 가지 선택 🆕

교재는 요청·응답 처리를 매핑 템플릿 중심으로 다섯 슬라이드에 걸쳐 설명합니다. 매핑 템플릿은 지금도 그대로 동작하고 교재 내용이 틀린 것은 아니지만, **현재 문서가 제시하는 권장 순서는 다릅니다.**

| 순위 | 방법 | 문서의 서술 |
|---|---|---|
| 1 | **프록시 통합** | 데이터 변환 절과 매핑 템플릿 절 모두 "가능하면 프록시 통합으로 데이터를 변환하라"고 권장합니다. 프록시 통합은 설정이 간소하고 기존 설정을 해체하지 않고도 백엔드와 함께 발전할 수 있습니다 |
| 2 | **파라미터 매핑** | 통합 요청의 URL 경로 파라미터, URL 쿼리 문자열 파라미터, HTTP 헤더 값을 수정합니다. **통합 요청 페이로드는 수정할 수 없습니다.** HTTP 응답 헤더 값도 수정할 수 있습니다. CORS용 정적 헤더 값을 만드는 데 씁니다. **VTL 스크립팅이 필요하지 않습니다.** 통합 요청에서는 프록시·비프록시 모두, 통합 응답에서는 비프록시 통합만 |
| 3 | **매핑 템플릿 변환** | 본문을 바꿔야 하거나 조건부 재정의·상태 코드 재정의가 필요하고 프록시 통합을 쓸 수 없을 때 씁니다 |

매핑 템플릿 변환은 API Gateway가 **해당 `Content-Type`에 대한 매핑 템플릿이 정의되어 있을 때만** 수행합니다. 정의하지 않으면 기본적으로 본문이 그대로 전달되며, 이 동작은 [3.7절](#37-통합-패스스루-동작)의 패스스루 설정으로 바꿉니다.

> — 출처: [Data transformations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)
> — 출처: [Mapping template transformations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings.html)

### 4.3 예: 요청 모델

모델은 페이로드의 데이터 구조를 정의하며 **JSON schema draft 4** 로 표현합니다. 교재 슬라이드 17의 요청 페이로드와 모델입니다.

```json
{
  "UserId": "StudentA",
  "Notes": [
    {
      "Note": "Hello World!",
      "NoteId": 11
    }
  ]
}
```

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "NotesInputModel",
  "type": "object",
  "required": ["UserId"],
  "properties": {
    "UserId": { "type": "string" },
    "Notes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["NoteId", "Note"],
        "properties": {
          "Note": { "type": "string" },
          "NoteId": { "type": "integer" }
        }
      }
    }
  }
}
```

모델의 용도 세 가지는 교재 강사 노트와 현재 문서가 일치합니다.

| 용도 | 내용 |
|---|---|
| 기본 요청 검증 | `required` 키워드로 필수 속성을 지정하고 페이로드를 검증합니다 |
| 매핑 템플릿 생성 | 데이터 변환용 매핑 템플릿의 초안을 만드는 데 편리합니다. 다만 **매핑 템플릿을 만드는 데 모델이 필수는 아닙니다** |
| 강력한 유형의 SDK 생성 | Java·Objective-C·Swift 같은 강력한 유형 언어에서 모델이 **사용자 정의 데이터 유형(UDT)** 에 대응합니다. 모델을 제공하지 않으면 API Gateway가 빈 모델로 기본 UDT를 만듭니다 |

🆕 교재가 다루지 않는 확장 기능입니다. `enum`으로 허용 값을 제한하고 `minimum`·`maximum`으로 숫자 범위를 제약할 수 있습니다. 긴 모델은 참조 프리미티브(`$ref`)로 `definitions` 안의 재사용 정의를 가리킬 수 있고, 다른 API의 모델을 `apigateway.amazonaws.com`의 모델 경로로 참조할 수도 있습니다. API당 모델 크기 상한은 400KB입니다.

> — 출처: [Data models for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings-models.html)

### 4.4 요청 검증 🔄

API Gateway를 구성해 **통합 요청을 진행하기 전에** API 요청의 기본 검증을 수행할 수 있습니다. 검증이 실패하면 API Gateway는 즉시 요청을 실패시키고 호출자에게 **`400` 오류 응답**을 반환하며 검증 결과를 CloudWatch Logs에 게시합니다. 백엔드에 대한 불필요한 호출이 줄어듭니다.

| 검증 대상 | 문서 내용 |
|---|---|
| 요청 파라미터 | URI, 쿼리 문자열, 헤더의 필수 요청 파라미터가 포함되어 있고 비어 있지 않은지 확인합니다. 🆕 **API Gateway는 파라미터의 존재만 확인하고 유형이나 형식은 확인하지 않습니다** |
| 요청 페이로드 | 주어진 콘텐츠 유형에 대해 구성된 메서드의 JSON 스키마를 따르는지 확인합니다. 일치하는 콘텐츠 유형이 없으면 검증이 수행되지 않습니다. 콘텐츠 유형과 무관하게 같은 모델을 쓰려면 데이터 모델의 콘텐츠 유형을 `$default`로 설정합니다 |

교재 슬라이드 18의 요청 검증자 구성입니다. 🔄 교재는 두 값을 문자열 `"false"`·`"true"`로 적지만 `RequestValidator` API 참조에서 두 필드는 **Boolean** 이므로 따옴표 없이 씁니다. 문자열 `"false"`는 JSON에서 참으로 취급될 수 있어 의도와 다르게 동작할 위험이 있습니다.

```json
{
  "name": "params-only",
  "validateRequestBody": false,
  "validateRequestParameters": true
}
```

교재 슬라이드 18의 요청은 필수 파라미터 `q1`이 비어 있지 않고 설정되어야 한다는 예입니다.

```http
GET /testStage/validation?q1=StudentA HTTP/1.1
Host: abcdef123.execute-api.us-east-1.amazonaws.com
Content-Type: application/json
Accept: application/json
```

같은 슬라이드의 메서드 요청 페이로드는 배열 요소 키를 `Note`가 아니라 **`Notes`** 로 씁니다. 슬라이드 17의 `NotesInputModel`은 배열 요소에 `Note`를 필수로 요구하므로 이 페이로드를 그 모델로 검증하면 `400`으로 실패합니다. **교재 안에서 서로 어긋나는 서술**이므로 이 문서는 슬라이드 17 모델에 맞춰 `Note`로 씁니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

```json
{
  "UserId": "StudentA",
  "Notes": [
    {
      "Note": "Hello World!",
      "NoteId": 11
    }
  ]
}
```

> — 출처: [Request validation for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html)
> — 출처: [RequestValidator](https://docs.aws.amazon.com/apigateway/latest/api/API_RequestValidator.html)

### 4.5 매핑 템플릿: 요청 방향 🔄

매핑 템플릿은 **VTL(Velocity Template Language)** 로 표현되고 **JSONPath 표현식**을 사용하여 `Content-Type` 헤더를 기준으로 페이로드에 적용되는 스크립트입니다. 지시자(directive)는 `#` 기호로 시작합니다.

매핑 템플릿으로 하는 일(교재 슬라이드 19 강사 노트)은 현재 문서와 일치합니다.

- 페이로드를 API 지정 형식과 일치시킵니다
- 파라미터를 일대일로 매핑합니다
- 정규 표현식으로 일치시킨 통합 응답 상태 코드군을 단일 응답 상태 코드에 매핑합니다

마지막 항목은 `x-amazon-apigateway-integration`의 `responses` 키에 `2\d{2}` 같은 정규식을 쓰는 방식으로 확인됩니다. 하위 수준 API에서는 통합 응답의 `selectionPattern`이 같은 역할을 합니다.

🔄 교재 슬라이드 19의 템플릿은 그대로 실행하면 값이 채워지지 않습니다. `#set`으로 `$inputRoot`를 선언하지만 쓰지 않고, `$elem`을 **반복 지시자 없이** 참조하기 때문입니다. 공식 예제에서 컬렉션 순회는 항상 `#foreach`로 시작하고 `#end`로 닫습니다.

교재 원문(그대로 실행하면 `Notes` 값이 비어 있습니다):

```text
#set($inputRoot = $input.path('$'))
{
  "Environment": "$stageVariables.environment",
  "Notes": [{
    "NoteId": "$elem.NoteId",
    "Note": "$elem.Note"  }]
}
```

교정한 형태(`#foreach`로 `$inputRoot.Notes`를 순회하고 `$foreach.hasNext`로 쉼표를 넣습니다):

```text
## 요청 본문의 루트를 $inputRoot 로 받는다
#set($inputRoot = $input.path('$'))
{
  "Environment": "$stageVariables.environment",
  "Notes": [
    ## Notes 배열을 순회한다. $elem 은 이 루프에서 정의된다
    #foreach($elem in $inputRoot.Notes)
    {
      "NoteId": "$elem.NoteId",
      "Note": "$util.escapeJavaScript($elem.Note)"
    }#if($foreach.hasNext),#end
    #end
  ]
}
```

같은 템플릿이 스테이지 변수 `environment` 값에 따라 다른 페이로드를 만듭니다.

```json
{
  "Environment": "prod",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

```json
{
  "Environment": "dev",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

> — 출처: [Examples using variables for mapping template transformations for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-variable-examples.html)
> — 출처: [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html)

### 4.6 매핑 템플릿: 응답 방향

교재 슬라이드 20은 응답 방향에서 JSON 페이로드를 XML로 변환하고 응답에 필요 없는 환경 정보를 제거하는 예입니다. 백엔드 페이로드는 다음과 같습니다.

```json
{
  "Environment": "prod",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

교재 원문 템플릿도 [4.5절](#45-매핑-템플릿-요청-방향)과 같은 이유로 `$elem`이 정의되지 않습니다. 교정한 형태입니다.

```text
## 통합 응답 본문의 루트를 $inputRoot 로 받는다
#set($inputRoot = $input.path('$'))
#foreach($elem in $inputRoot.Notes)
<Notes>
<NoteId>$elem.NoteId</NoteId>
<Note>$elem.Note</Note>
</Notes>
#end
```

메서드 응답 페이로드에서 `Environment`가 사라집니다.

```text
<Notes>
<NoteId>11</NoteId>
<Note>Hello World!</Note>
</Notes>
```

### 4.7 매핑 템플릿에서 쓸 수 있는 변수 🆕

교재는 `$input.path('$')`와 `$stageVariables.environment`만 씁니다. 실제로 쓸 수 있는 변수는 네 갈래입니다.

**`$input` — 메서드 요청 페이로드와 파라미터**

| 변수·함수 | 설명 |
|---|---|
| `$input.body` | 원시 요청 페이로드를 문자열로 반환합니다. `10.00` 같은 부동 소수점을 온전히 보존하는 데 쓸 수 있습니다 |
| `$input.json(x)` | JSONPath 표현식을 평가해 결과를 **JSON 문자열**로 반환합니다 |
| `$input.path(x)` | JSONPath 표현식 문자열을 받아 결과의 **JSON 객체 표현**을 반환합니다. VTL에서 페이로드 요소에 직접 접근·조작할 수 있고 리스트에 `.size()`를 호출하면 요소 수를 반환합니다 |
| `$input.params()` | 모든 요청 파라미터의 맵을 반환합니다. 주입 공격을 피하려고 `$util.escapeJavaScript`로 살균하도록 권장합니다 |
| `$input.params(x)` | **경로 → 쿼리 문자열 → 헤더 순으로 검색**해 메서드 요청 파라미터 값을 반환합니다 |

**`$context` — 요청 컨텍스트** (대소문자 구분, 표에 52개 항목)

| 변수 | 설명 |
|---|---|
| `$context.accountId` | API 소유자의 AWS 계정 ID |
| `$context.apiId` | API Gateway가 API에 할당한 식별자 |
| `$context.authorizer.claims.속성` | Cognito 사용자 풀이 반환한 클레임의 속성. **`$context.authorizer.claims` 자체를 호출하면 `null`을 반환합니다** |
| `$context.authorizer.principalId` | Lambda 권한 부여자가 반환한 프린시펄 사용자 식별 |
| `$context.authorizer.속성` | Lambda 권한 부여자 함수가 반환한 `context` 맵 값의 **문자열화된** 값. 속성 이름에 지원되는 특수 문자는 밑줄뿐입니다 |

**`$stageVariables` — 스테이지 변수.** `$stageVariables.변수이름`, `$stageVariables['변수이름']`, `${stageVariables['변수이름']}` 세 형태를 씁니다.

**`$util` — 유틸리티 함수** (기본 문자 집합 UTF-8)

| 함수 | 설명 |
|---|---|
| `$util.escapeJavaScript()` | JavaScript 문자열 규칙으로 문자를 이스케이프합니다. 홑따옴표가 `\'`로 바뀌는데 이는 JSON에서 유효하지 않으므로 JSON 속성에 쓸 때는 되돌려야 합니다 |
| `$util.parseJson()` | 문자열화된 JSON을 객체 표현으로 만듭니다 |
| `$util.urlEncode()` / `$util.urlDecode()` | `application/x-www-form-urlencoded` 형식 변환 |
| `$util.base64Encode()` / `$util.base64Decode()` | Base64 인코딩·디코딩 |

JSON 입력에 JavaScript가 파싱할 수 없는 이스케이프되지 않은 문자가 있으면 API Gateway가 `400`을 반환할 수 있으므로 `$util.escapeJavaScript()`를 적용하라고 문서가 안내합니다.

> — 출처: [Variables for data transformations for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

---

## 5. 코드형 API 설계

### 5.1 Swagger에서 OpenAPI로 🔄

교재 슬라이드 22의 제목은 "Swagger를 사용한 API 설계"이고 YAML 첫 줄이 `swagger: "2.0"`, 강사 노트의 기능 목록도 "Swagger 기능"입니다. 🔄 현재 문서는 이 기능을 **"Develop REST APIs using OpenAPI in API Gateway"** 로 부르고 **OpenAPI v2.0**(Swagger 2.0에 해당)과 **OpenAPI v3.0** 두 규격을 지원한다고 기술합니다. 확장 목록 페이지 제목도 "OpenAPI extensions for API Gateway"입니다(URL 경로에는 여전히 `swagger-extensions`가 남아 있습니다).

교재가 나열한 기능은 이름만 바뀌었고 내용은 그대로입니다.

| 교재 기능 | 현재 문서 |
|---|---|
| 코드형 API 정의 / 이동식 API 정의 | 외부 정의 파일에서 REST API를 가져오고 내보낼 수 있습니다 |
| JSON / YAML | 내보낼 때 `Accept` 헤더를 `application/json` 또는 `application/yaml`로 설정합니다 |
| API 가져오기 / 내보내기 | 가져오기는 새 정의로 덮어쓰거나 기존 API와 병합할 수 있고 `mode` 쿼리 파라미터로 선택합니다 |
| API Gateway 확장 | `x-amazon-apigateway-*` 확장. 현재 20개가 넘습니다 |
| 독립적으로 또는 AWS CloudFormation 템플릿의 일부로 | 그대로 유효합니다 |

교재 YAML 발췌를 OpenAPI 3.0 표기로 바꾸면 다음과 같습니다.

```yaml
openapi: "3.0.1"
info:
  title: "PollyNotesAPI"
paths:
  /notes/search:
    get:
      security:
        - PollyNotesPool: []
      x-amazon-apigateway-integration:
        # 통합 유형을 반드시 지정한다. Lambda 프록시는 aws_proxy
        type: "aws_proxy"
        # Lambda 함수 호출에서 httpMethod 값은 POST 여야 한다
        httpMethod: "POST"
        uri: "arn:aws:apigateway:[AWS_Region]:lambda:path/2015-03-31/functions/arn:aws:lambda:[AWS_Region]:[AWS_AccountId]:function:searchFunction/invocations"
        payloadFormatVersion: "1.0"
        responses:
          default:
            statusCode: "200"
```

교재 발췌에는 통합 유형을 정하는 `type` 속성이 없습니다. 발췌에 `...`가 있어 생략일 수도 있지만, 실제 정의에서 `type`은 통합의 성격을 결정하는 속성이므로 반드시 지정합니다.

> — 출처: [Develop REST APIs using OpenAPI in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-import-api.html)
> — 출처: [OpenAPI extensions for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions.html)

### 5.2 x-amazon-apigateway-integration 확장 🆕

교재는 확장을 항목 하나로만 제시합니다. `x-amazon-apigateway-integration`은 OpenAPI Operation 객체의 확장 속성이며 결과는 API Gateway `Integration` 객체입니다. 주요 속성입니다.

| 속성 | 내용 |
|---|---|
| `type` | `http`, `http_proxy`, `aws_proxy`, `aws`, `mock` (**소문자**) |
| `uri` | 백엔드의 엔드포인트 URI. `aws` 유형에서는 ARN 값, HTTP 통합에서는 `https`·`http` 스킴을 포함한 URL |
| `httpMethod` | 통합 요청에 사용하는 HTTP 메서드. **Lambda 함수 호출에서는 값이 `POST` 여야 합니다** |
| `credentials` | IAM 역할 기반 자격 증명의 ARN. 지정하지 않으면 리소스 기반 권한으로 기본 설정되며 수동으로 추가해야 합니다 |
| `connectionType` / `connectionId` | 프라이빗 통합의 `VPC_LINK` 또는 그 외의 `INTERNET` / VPC 링크 ID |
| `passthroughBehavior` | `when_no_templates`, `when_no_match`, `never` ([3.7절](#37-통합-패스스루-동작)) |
| `payloadFormatVersion` | 통합에 전송되는 페이로드 형식. **HTTP API에서는 필수** 이고 Lambda 프록시는 `1.0`·`2.0`, 다른 모든 통합은 `1.0`만 지원합니다 |
| `requestTemplates` / `requestParameters` | 지정된 MIME 유형 요청 페이로드용 매핑 템플릿 / 파라미터 매핑 |
| `responses` | 메서드의 응답과 통합 응답 → 메서드 응답 매핑. 키에 `2\d{2}` 같은 정규식, `302` 같은 상태 코드, `default`를 쓸 수 있습니다 |
| `timeoutInMillis` | 통합 시간 초과. **50ms ~ 29,000ms** |
| `contentHandling` | `CONVERT_TO_TEXT` 또는 `CONVERT_TO_BINARY` |
| `responseTransferMode` 🆕 | `BUFFERED`는 전체 응답 수신을 기다리고 `STREAM`은 사용 가능해지는 대로 부분 응답을 클라이언트로 보냅니다 |
| `cacheNamespace` / `cacheKeyParameters` | 캐시 파라미터 태그 그룹 / 값이 캐시될 요청 파라미터 목록 |
| `integrationSubtype` / `integrationTarget` | HTTP API의 AWS 서비스 통합 하위 유형 / VPC 링크 V2 프라이빗 통합의 ALB·NLB 리스너 |

매핑 템플릿 안의 JSON 이중 인용부호는 문자열 이스케이프해야 합니다(`\"`).

> — 출처: [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html)

### 5.3 API 정의 가져오기와 내보내기 🆕

**가져오기.** OpenAPI v2.0과 v3.0 정의 파일을 지원하며 예외 항목은 REST API 중요 참고 사항 문서에 나열되어 있습니다. `mode` 쿼리 파라미터로 덮어쓰기 또는 병합을 선택합니다.

**내보내기.** API Gateway Export API로 내보내며 API 요청에 서명해야 합니다.

| 항목 | 내용 |
|---|---|
| 요청 경로 | OpenAPI 3.0은 스테이지 경로 아래 `exports/oas30`, OpenAPI 2.0은 `exports/swagger` |
| 확장 포함 | `extensions` 쿼리 문자열에 `integration`(API Gateway 확장) 또는 `postman`(Postman 확장) |
| 형식 | `Accept` 헤더를 `application/json` 또는 `application/yaml` |
| 콘솔 | Stages 창의 Stage actions → Export 에서 API 규격 유형·형식·확장을 지정 |
| 제약 | 페이로드가 `application/json` 유형이 아닌 API는 내보낼 수 없습니다. 모델을 정의했다면 콘텐츠 유형이 `application/json`이어야 하고 모델에는 속성이 있거나 특정 JSONSchema 유형으로 정의되어 있어야 합니다 |

CLI로 내보낼 때 요청 검증자 확장을 포함시키려면 `--parameters extensions='apigateway'`를 넣어야 합니다.

```bash
# 요청 검증자 확장을 포함해 OpenAPI 2.0(swagger)으로 내보낸다
aws apigateway get-export \
    --parameters extensions='apigateway' \
    --rest-api-id abcdefg123 \
    --stage-name dev \
    --export-type swagger \
    latestswagger2.json
```

**SDK 생성.** 교재 슬라이드 10의 지원 언어 목록(Java, JavaScript, Java for Android, Objective-C 또는 Swift for iOS, Ruby)은 현재 문서와 **그대로 일치합니다.** SDK는 API를 만들고 테스트하고 스테이지에 배포한 뒤에 생성하며, 최소 한 번 배포해야 합니다. AWS CLI로도 생성할 수 있습니다.

교재가 언급하는 "도구를 사용하는 경우 풍부한 타사 리소스 제공"에 해당하는 것으로, 내보내기 문서는 Postman 확장을 지원합니다. Postman 자체는 AWS가 운영하지 않는 타사 도구이며 주소는 `www.postman.com` 입니다.

> — 출처: [Export a REST API from API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-export-api.html)
> — 출처: [Generate SDKs for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html)

---

## 6. API 테스트

### 6.1 REST API 호출

슬라이드 24의 주석부터 확인합니다. **"API URL을 호출하려면 먼저 API Gateway에 배포해야 합니다."** 배포된 API를 호출할 때 클라이언트는 API 작업을 담당하는 API Gateway 구성 요소 서비스인 **`execute-api`** 의 URL에 요청을 제출합니다.

```text
https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
```

| 부분 | 의미 |
|---|---|
| `{restapi_id}` | API 식별자 |
| `{region}` | AWS 리전 |
| `{stage_name}` | API 배포 스테이지 이름 |

REST API를 테스트하는 방법은 호출 URL, API Gateway 콘솔, Postman 같은 타사 도구입니다. API에서 익명 액세스를 허용하면 웹 브라우저 주소 표시줄에 호출 URL을 붙여 `GET` 메서드를 호출할 수 있습니다.

### 6.2 API Gateway 콘솔을 사용한 테스트 🔄

🔄 교재 슬라이드 25 강사 노트는 "Method Execution 창의 Client 상자에서 TEST를 선택합니다"라고 콘솔 경로를 적습니다. Method Execution 창과 Client 상자는 이전 콘솔의 UI입니다. 현재 절차입니다.

1. API Gateway 콘솔에 로그인합니다
2. REST API를 선택합니다
3. **Resources** 창에서 테스트할 메서드를 선택합니다
4. **Test** 탭을 선택합니다(탭이 보이지 않으면 오른쪽 화살표 버튼을 눌러 표시합니다)
5. Query strings, Headers, Request body 상자에 값을 입력합니다. 콘솔은 이 값을 기본 `application/json` 형식으로 메서드 요청에 포함합니다
6. **Test** 를 선택합니다

결과로 표시되는 항목은 Request(호출된 리소스 경로), Status(응답 HTTP 상태 코드), Latency(ms)(요청 수신부터 응답 반환까지의 시간), Response body, Response headers, Logs 입니다. 매핑에 따라 상태 코드·응답 본문·응답 헤더는 Lambda 함수나 HTTP 프록시가 보낸 것과 다를 수 있습니다.

교재 슬라이드 26의 주의는 현재 문서의 Important 문단과 문장 단위로 일치합니다. **콘솔에서의 메서드 테스트는 콘솔 외부에서 메서드를 호출하는 것과 같습니다.** 예를 들어 API 리소스를 삭제하는 메서드를 콘솔로 호출해 성공하면 그 리소스는 실제로 삭제됩니다. 되돌릴 수 없는 변경이 발생할 수 있습니다.

🆕 한 가지 덧붙일 점은 로그입니다. Test 결과의 Logs는 이 메서드를 콘솔 외부에서 호출했다면 기록되었을 CloudWatch Logs 항목을 **시뮬레이션한 것**입니다. 로그는 시뮬레이션이지만 **메서드 호출 결과는 실제**입니다.

> — 출처: [Use the API Gateway console to test a REST API method](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-test-method.html)

### 6.3 Mock 통합

Mock 통합으로 통합 백엔드 없이 API Gateway에서 바로 응답을 생성할 수 있습니다. 교재가 제시하는 세 가지 효용(완성된 백엔드 없이 테스트 / 프로덕션 배포 전에 다양한 시나리오 테스트 / API 개발 속도 향상)은 현재 문서와 일치하며, 문서는 API의 개요와 내비게이션을 제공하는 **랜딩 페이지** 프로비저닝도 용도로 듭니다.

API 개발자가 API Gateway가 Mock 통합 요청에 응답하는 방법을 결정합니다. 메서드의 통합 요청과 통합 응답을 구성해 특정 상태 코드에 응답을 연결합니다.

```text
## 통합 요청 매핑 템플릿: 200 응답을 반환한다
{"statusCode": 200}
```

```text
## 통합 요청 매핑 템플릿: 500 오류 응답을 반환한다
{"statusCode": 500}
```

조건에 따라 다른 상태 코드를 반환할 수도 있습니다.

```text
## scope 쿼리 파라미터가 internal 이면 200, 아니면 500 을 반환한다
{
  #if( $input.params('scope') == "internal" )
    "statusCode": 200
  #else
    "statusCode": 500
  #end
}
```

통합 요청 매핑 템플릿을 정의하지 않고 **기본 통합 응답**(HTTP 상태 정규식이 정의되지 않은 응답)을 반환하게 할 수도 있습니다. 이때는 패스스루 동작을 적절히 설정해야 합니다.

🆕 문서의 주의: Mock 통합은 **큰 응답 템플릿을 지원하도록 의도된 것이 아닙니다.** 그런 사용 사례에는 Lambda 통합을 고려하세요.

이것이 교재 지식 확인 3번("Mock 통합은 API 메서드용 200 상태 코드에만 응답합니다")의 정답이 '거짓'인 이유입니다.

> — 출처: [Mock integrations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html)

### 6.4 CLI를 사용하여 REST API 호출

콘솔의 Test 기능은 `TestInvokeMethod` API를 호출합니다. 이 API는 헤더·파라미터·요청 본문으로 메서드 호출을 **시뮬레이션**하며 배포된 스테이지의 호출 URL을 우회합니다. CLI로는 `test-invoke-method`를 씁니다.

```bash
# 배포 전에도 메서드 호출을 시뮬레이션할 수 있다
aws apigateway test-invoke-method \
    --rest-api-id 81jpgj2f0j \
    --resource-id Prq5yc5aq6 \
    --http-method GET \
    --path-with-query-string '/'
```

요청 파라미터 중 `--rest-api-id`, `--resource-id`, `--http-method`는 필수입니다. `--path-with-query-string`으로 경로 파라미터와 쿼리 문자열 파라미터를 지정하고, `--body`·`--headers`·`--stage-variables`로 본문·헤더·스테이지 변수를 시뮬레이션할 수 있습니다.

응답 필드는 교재 슬라이드 28의 출력과 그대로 일치합니다.

| 필드 | 유형 | 내용 |
|---|---|---|
| `status` | Integer | HTTP 상태 코드 |
| `body` | String | HTTP 응답 본문 |
| `headers` | 맵 | 응답 헤더 |
| `multiValueHeaders` | 맵 | 응답 헤더(값이 목록) |
| `log` | String | API Gateway 실행 로그 |
| `latency` | Long | 테스트 호출 요청의 실행 지연 시간(ms) |

오류는 `BadRequestException`(400), `UnauthorizedException`(401), `NotFoundException`(404), `TooManyRequestsException`(429)입니다.

> — 출처: [TestInvokeMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_TestInvokeMethod.html)

---

## 7. API 배포

### 7.1 API Gateway 스테이지

**스테이지는 API의 스냅샷인 배포에 대한 명명된 참조입니다.** 이 정의는 교재와 현재 문서가 문장 단위로 일치합니다. API를 배포하려면 **API 배포를 만들고 스테이지에 연결**해야 합니다.

| 개념 | 정의 |
|---|---|
| API 배포 | API Gateway API의 **특정 시점 스냅샷**. 클라이언트가 사용하려면 하나 이상의 스테이지에 연결되어야 합니다 |
| API 스테이지 | API 수명 주기 상태에 대한 **논리적 참조**(예: `dev`, `prod`, `beta`, `v2`). API ID와 스테이지 이름으로 식별됩니다 |

스테이지 설정으로 할 수 있는 다섯 가지도 교재와 일치합니다.

- 캐싱 활성화 ([7.5절](#75-응답-캐싱))
- 요청 제한 사용자 지정 ([7.6절](#76-요청-제한과-사용량-계획))
- 로깅 구성 ([8.1절](#81-실행-로깅과-액세스-로깅))
- 스테이지 변수 정의 ([7.2절](#72-스테이지-변수-사용))
- 테스트를 위해 canary 릴리스 첨부 ([7.3절](#73-canary-릴리스))

🔄 교재는 "배포 프로세스가 완료되면 **Stage Editor 창**이 표시됩니다"라고 하고 Stage Editor로 네 가지를 설정한다고 서술합니다. 현재 콘솔에서 스테이지 설정은 **Stages** 창에서 스테이지를 고른 뒤 두 곳으로 나뉘어 있습니다.

| 위치 | 설정 |
|---|---|
| Stage details → Edit | 캐시 설정(Provision API cache, Default method-level caching, Cache capacity, Encrypt cache data, Cache TTL), 제한 설정(Rate, Burst), 방화벽·인증서 설정(Web ACL, Client certificate) |
| Logs and tracing → Edit | CloudWatch Logs 로깅 수준, Data tracing, Detailed metrics, Custom access logging, X-Ray tracing |

호출 URL은 스테이지 상세의 **Invoke URL** 필드에 표시됩니다. 스테이지 이름은 영숫자·하이픈·밑줄만 쓸 수 있고 최대 128자입니다. 🆕 스테이지 설정을 바꾼 뒤에는 **API를 다시 배포해야** 새 설정이 적용됩니다. 다만 로그·스테이지 변수 업데이트는 재배포가 필요하지 않습니다.

> — 출처: [Set up a stage for a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html)

### 7.2 스테이지 변수 사용 🔄

스테이지 변수는 REST API의 배포 스테이지와 연결된 구성 속성으로 정의하는 **이름-값 쌍**이며 **환경 변수처럼 작동**하고 **API 설정과 매핑 템플릿에서** 쓸 수 있습니다. 교재 슬라이드 31의 서술 전부가 현재 문서와 일치합니다.

| 사용 사례 | 내용 |
|---|---|
| 다른 백엔드 엔드포인트 지정 | 프로덕션 엔드포인트를 호출하면 `example.com`을, beta 스테이지를 호출하면 `beta.example.com`을 호출하게 할 수 있습니다. 스테이지마다 다른 Lambda 함수 이름을 지정할 수도 있습니다 |
| 매핑 템플릿으로 정보 전달 | 여러 스테이지에서 같은 Lambda 함수를 재사용하면서 스테이지에 따라 다른 DynamoDB 테이블을 읽게 할 수 있습니다 |

스테이지 변수를 쓸 수 있는 위치입니다.

| 위치 | 표기 |
|---|---|
| 파라미터 매핑 표현식 | `stageVariables.변수이름` (`$`와 중괄호 **없이**, 부분 치환 불가) |
| 매핑 템플릿 | `$stageVariables.변수이름` 또는 `${stageVariables.변수이름}` |
| HTTP 통합 URI | `http://${stageVariables.변수이름}`, 서브도메인·경로·쿼리 문자열의 일부로도 가능 |
| AWS 통합 URI | `arn:aws:apigateway:<region>:<service>:${stageVariables.변수이름}` |
| Lambda 함수 이름 | `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account_id>:function:${stageVariables.함수변수}/invocations` |
| Lambda 버전·별칭 | `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account_id>:function:<함수이름>:${stageVariables.버전변수}/invocations` |
| Cognito 사용자 풀 (`COGNITO_USER_POOLS`) | `arn:aws:cognito-idp:<region>:<account_id>:userpool/${stageVariables.변수이름}` |
| AWS 통합 자격 증명 | `arn:aws:iam::<account_id>:${stageVariables.변수이름}` |

교재 슬라이드 31의 다이어그램은 `/notes`가 `list_function:PROD` 또는 `list_function:DEV`를 호출하는 예입니다. Lambda **별칭** 자리에 스테이지 변수를 쓰는 패턴입니다.

🔄 교재 강사 노트는 이를 `list_function:{$stageVariables.environment}`로 적습니다. 문서 표기는 `function:<함수이름>:${stageVariables.<버전변수>}` 이므로 중괄호가 달러 기호 **뒤에** 와야 합니다.

```text
## 교재 표기 (중괄호 위치가 어긋남)
list_function:{$stageVariables.environment}

## 문서 표기
list_function:${stageVariables.environment}
```

🆕 교재가 다루지 않는 제약입니다.

| 항목 | 내용 |
|---|---|
| 같은 계정 제약 | Lambda 함수에 스테이지 변수를 쓰려면 함수가 **API와 같은 계정**에 있어야 합니다. 스테이지 변수는 교차 계정 Lambda 함수를 지원하지 않습니다 |
| 권한 구성 | 스테이지 변수 값으로 Lambda 함수 이름을 지정하면 **Lambda 함수 권한을 직접 구성**해야 합니다 |
| 통합 유형 변경 불가 | 스테이지 변수로 통합 엔드포인트의 **종류 자체**는 바꿀 수 없습니다(한 스테이지는 HTTP 프록시, 다른 스테이지는 Lambda 프록시로 지정 불가) |
| 민감한 데이터 | 스테이지 변수는 **자격 증명 같은 민감한 데이터에 쓰도록 의도된 것이 아닙니다.** 통합에 민감한 데이터를 넘겨야 하면 Lambda 권한 부여자의 출력을 쓰세요 |
| 값 형식 | 변수 이름에는 영숫자와 밑줄을 쓸 수 있고 값은 `[A-Za-z0-9-._~:/?#&=,]+` 와 일치해야 합니다 |

```bash
# 스테이지 변수 값으로 지정한 Lambda 함수에 호출 권한을 부여한다
aws lambda add-permission \
    --function-name "arn:aws:lambda:us-east-2:123456789012:function:my-function" \
    --source-arn "arn:aws:execute-api:us-east-2:123456789012:api_id/*/HTTP_METHOD/resource" \
    --principal apigateway.amazonaws.com \
    --statement-id apigateway-access \
    --action lambda:InvokeFunction
```

> — 출처: [Use stage variables for a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)
> — 출처: [API Gateway stage variables reference for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html)

### 7.3 Canary 릴리스 🔄

Canary 릴리스는 테스트 목적으로 API의 새 버전을 배포하고 기본 버전은 **같은 스테이지에서** 정상 작업을 위한 프로덕션 릴리스로 계속 배포해 두는 소프트웨어 개발 전략입니다. 전체 API 트래픽은 미리 구성한 비율에 따라 **무작위로** 프로덕션 릴리스와 카나리 릴리스로 나뉩니다.

| 교재 항목 | 내용 |
|---|---|
| 배포 위험 감소 | 카나리 트래픽을 작게 유지하고 무작위로 선택하므로 대부분의 사용자가 새 버전의 잠재적 버그에 영향받지 않고, 어떤 사용자도 항상 영향받지는 않습니다 |
| 테스트 성능 | 카나리 트래픽 비율을 조정해 테스트 커버리지나 성능을 최적화할 수 있습니다 |
| 병렬 개발 | 갱신된 API 기능은 카나리를 통과하는 트래픽에만 보입니다 |

교재 슬라이드 32의 예제 아키텍처처럼 **카나리 버전이 트래픽의 10%** 를 받고 나머지 **90%가 안정 버전**으로 라우팅됩니다.

**구조.** 🔄 API Gateway에서 카나리 릴리스 배포는 프로덕션 릴리스가 배포된 스테이지에 **`canarySettings`를 붙이는 것**입니다. 스테이지는 최초 배포와, 카나리는 이후 배포와 연결되며 처음에는 둘이 같은 API 버전을 가리킵니다.

| `canarySettings` 필드 | 유형 | 내용 |
|---|---|---|
| `deploymentId` | String | 카나리 배포의 ID. 처음에는 스테이지에 설정된 기본 버전 배포 ID와 동일합니다 |
| `percentTraffic` | **Double** | 카나리 배포로 전환되는 API 트래픽 비율. **0.0 ~ 100.0** |
| `stageVariableOverrides` | 맵 | 카나리 릴리스에서 재정의되는 스테이지 변수. 카나리에서 새로 도입한 스테이지 변수도 포함합니다 |
| `useStageCache` | **Boolean** | 카나리 배포가 스테이지 캐시를 쓰는지 여부 |

카나리 릴리스를 활성화하면 카나리를 비활성화하고 `canarySettings`를 제거할 때까지 그 스테이지를 **다른 비카나리 배포에 연결할 수 없습니다.**

🆕 로깅도 분리됩니다. 실행 로깅을 켜면 카나리 릴리스가 모든 카나리 요청에 대해 자체 로그와 지표를 생성하고 프로덕션 스테이지 로그 그룹과 카나리 전용 로그 그룹에 모두 보고합니다. 카나리 전용 로그 그룹 이름에는 `/Canary` 접미사가 붙습니다. 액세스 로깅도 같습니다. 새 API 변경을 검증하고 승격 여부를 결정할 때 이 분리된 로그가 유용합니다.

**승격.** 🔄 교재 슬라이드 33·36은 "canary 버전을 승격하고 트래픽 100%를 이 API 버전으로 보낼 수 있습니다"라고 결과만 서술합니다. 실제 메커니즘은 세 단계입니다.

1. 스테이지의 `deploymentId`를 카나리의 `deploymentId`로 재설정합니다. 스테이지의 API 스냅샷이 카나리 스냅샷으로 갱신되어 테스트 버전이 프로덕션 릴리스가 됩니다
2. 카나리 스테이지 변수가 있으면 스테이지 변수를 그 값으로 갱신합니다. 갱신하지 않으면 새 API 버전이 예상치 못한 결과를 낼 수 있습니다
3. 카나리 트래픽 비율을 **0.0%** 로 설정합니다

**승격만으로는 카나리가 비활성화되지 않습니다.** 일반 프로덕션 배포로 되돌리려면 `canarySettings`를 제거해야 합니다.

```bash
# 카나리 승격: 배포 ID와 스테이지 변수를 복사하고 카나리 비율을 0.0 으로 내린다
aws apigateway update-stage \
    --rest-api-id a1b2c3d4e5 \
    --stage-name 'prod' \
    --patch-operations '[
      {"op": "replace", "value": "0.0", "path": "/canarySettings/percentTraffic"},
      {"op": "copy", "from": "/canarySettings/stageVariableOverrides", "path": "/variables"},
      {"op": "copy", "from": "/canarySettings/deploymentId", "path": "/deploymentId"}
    ]'
```

> — 출처: [Set up an API Gateway canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)
> — 출처: [Promote a canary release](https://docs.aws.amazon.com/apigateway/latest/developerguide/promote-canary-deployment.html)
> — 출처: [CanarySettings](https://docs.aws.amazon.com/apigateway/latest/api/API_CanarySettings.html)

### 7.4 Canary 릴리스 단계 🔄

🔄 교재 슬라이드 34~36의 단계는 카나리를 **새 스테이지**에 만드는 것으로 서술하고 다이어그램에도 "안정적 스테이지"와 "새 canary 스테이지"를 별개 스테이지로 그립니다. 문서에서 카나리는 별도 스테이지가 아니라 **같은 스테이지의 `canarySettings`** 입니다. 같은 교재 슬라이드 32 강사 노트가 "동일한 스테이지에서"라고 적고 있어 교재 안에서도 어긋납니다. 문서에 맞춘 단계입니다.

| 단계 | 교재 서술 | 문서에 맞춘 내용 |
|---|---|---|
| 1/3 | 기능 변경 수행 / **새 스테이지에 배포** / 필요하면 캐싱 활성화·스테이지 변수 설정·CloudWatch 로깅 활성화 / **새 스테이지에서 Canary 활성화** | 기능 변경 수행 / **기존 스테이지에** `canarySettings`를 추가해 카나리 활성화 / 필요하면 `useStageCache`·`stageVariableOverrides` 설정, 실행·액세스 로깅 활성화 |
| 2/3 | Canary에 대한 요청의 비율 설정 / **Canary를 활성화한 스테이지에 API를 다시 배포** | `percentTraffic`으로 비율 설정(예: 10) / 새 배포를 만들어 카나리에 연결. 이때 카나리는 새 배포, 스테이지는 기존 배포를 가리킵니다 |
| 3/3 | **Canary 승격** | 배포 ID·스테이지 변수를 스테이지로 복사하고 `percentTraffic`을 0.0으로 내립니다. 카나리를 완전히 끄려면 `canarySettings`를 제거합니다 |

교재 슬라이드 34 강사 노트의 코드 예에는 세 가지 표기 문제가 있습니다. `percentTraffic`을 `"10"`, `useStageCache`를 `"False“`, `metricsEnabled`를 `"true"`로 **모두 문자열로** 적었고, `useStageCache` 값의 닫는 따옴표가 여는 큰따옴표로 깨져 있고, 마지막 줄에 닫는 중괄호가 없습니다. 🔄 `percentTraffic`은 Double, `useStageCache`와 `metricsEnabled`는 Boolean입니다.

```json
{
  "methodSettings": {
    "*/*": {
      "metricsEnabled": true,
      "loggingLevel": "INFO",
      "throttlingRateLimit": 100,
      "throttlingBurstLimit": 50
    }
  },
  "variables": {
    "environment": "PROD"
  },
  "canarySettings": {
    "percentTraffic": 10,
    "deploymentId": "A1b2C3",
    "useStageCache": false
  }
}
```

`methodSettings`의 키는 개별 메서드 재정의는 `{리소스_경로}/{HTTP_메서드}`, 스테이지의 모든 메서드 재정의는 `*/*` 를 씁니다. `MethodSetting`에서 `cacheDataEncrypted`·`cachingEnabled`·`dataTraceEnabled`·`metricsEnabled`·`requireAuthorizationForCacheControl`은 Boolean, `cacheTtlInSeconds`·`throttlingBurstLimit`·`throttlingRateLimit`은 숫자, `loggingLevel`·`unauthorizedCacheControlHeaderStrategy`는 문자열입니다.

> — 출처: [CreateStage](https://docs.aws.amazon.com/apigateway/latest/api/API_CreateStage.html)
> — 출처: [Set up an API Gateway canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)

### 7.5 응답 캐싱 🆕

교재는 캐싱을 개발자 기능 목록의 한 항목("엔드포인트에 적용되는 호출 수를 줄이고 요청 대기 시간을 개선한다")으로만 제시합니다. 이 서술은 맞고, 실제로 설정할 값들이 뒤따릅니다. 캐싱은 **REST API 전용** 기능이며 **스테이지 단위**로 활성화합니다.

| 항목 | 값 |
|---|---|
| 기본 TTL | **300초** |
| 최대 TTL | **3600초** |
| 캐싱 비활성화 | `TTL=0` |
| 캐시 가능한 응답 최대 크기 | **1,048,576바이트**. 캐시 데이터 암호화는 캐시되는 응답 크기를 늘릴 수 있습니다 |
| 캐시 용량(`cacheClusterSize`, GB) | `0.5`, `1.6`, `6.1`, `13.5`, `28.4`, `58.2`, `118`, `237` |
| 기본 캐싱 대상 메서드 | **`GET` 메서드만.** API 안전성·가용성을 위한 기본값이며 메서드 설정 재정의로 다른 메서드에도 켤 수 있습니다 |
| 캐시 인스턴스 생성·삭제 시간 | 약 4분 |
| 과금 | 선택한 캐시 크기 기준 **시간당** 과금. AWS 프리 티어 대상이 아닙니다 |
| 상태 값(`cacheClusterStatus`) | `CREATE_IN_PROGRESS`, `AVAILABLE`, `DELETE_IN_PROGRESS`, `NOT_AVAILABLE`, `FLUSH_IN_PROGRESS` |

**주의할 점.** 캐시 용량을 바꾸면 API Gateway가 기존 캐시 인스턴스를 제거하고 새로 만들기 때문에 **기존 캐시 데이터가 모두 삭제됩니다.** 캐시 용량은 캐시 인스턴스의 CPU·메모리·네트워크 대역폭에 영향을 주므로 문서는 10분 부하 테스트로 적정 용량을 확인하고 지연 시간, 4xx, 5xx, 캐시 적중·실패 지표를 관찰하라고 권장합니다.

**캐시 키.** 메서드·통합 파라미터(사용자 지정 헤더, URL 경로, 쿼리 문자열)를 캐시 키로 쓸 수 있고 **리소스에 캐싱을 설정할 때 캐시 키는 필수**입니다. 캐시 키 값별로 응답이 따로 캐시됩니다.

**무효화와 플러시.**

| 작업 | 방법 |
|---|---|
| 스테이지 캐시 전체 플러시 | 콘솔의 Stage actions → Flush stage cache, 또는 `aws apigateway flush-stage-cache` |
| 개별 항목 무효화 | 클라이언트가 **`Cache-Control: max-age=0`** 헤더를 포함해 요청합니다. 권한이 있으면 캐시가 아니라 통합 엔드포인트에서 직접 응답을 받고 그 응답이 기존 캐시 항목을 대체합니다. **교차 계정 캐시 무효화는 지원되지 않습니다** |

캐싱은 best-effort 이며 CloudWatch의 `CacheHitCount`·`CacheMissCount` 지표로 확인합니다. CloudFront 응답의 `X-Cache` 헤더로 API Gateway 캐시 인스턴스에서 처리되었는지 판단해서는 안 됩니다.

```bash
# 스테이지에 0.5GB 캐시를 프로비저닝하고 모든 GET 메서드에 캐싱을 켠다
aws apigateway update-stage \
    --rest-api-id a1b2c3 \
    --stage-name 'prod' \
    --patch-operations '[
      {"op": "replace", "path": "/cacheClusterEnabled", "value": "true"},
      {"op": "replace", "path": "/cacheClusterSize", "value": "0.5"},
      {"op": "replace", "path": "/*/*/caching/enabled", "value": "true"}
    ]'
```

> — 출처: [Cache settings for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html)
> — 출처: [CreateStage](https://docs.aws.amazon.com/apigateway/latest/api/API_CreateStage.html)

### 7.6 요청 제한과 사용량 계획 🔄

**스로틀과 할당량은 모두 best-effort 로 적용되며 보장된 요청 상한이 아니라 목표로 이해해야 합니다.** API Gateway는 **토큰 버킷 알고리즘**으로 요청을 제한하고 토큰 하나가 요청 하나에 해당합니다. 정상 상태 요청 속도와 버스트 한도를 넘으면 클라이언트는 **`429 Too Many Requests`** 를 받을 수 있습니다.

🔄 교재 슬라이드 10 강사 노트는 제한 설정을 "두 가지 기본적인 유형"(서버 측 제한 한도, 클라이언트당 제한 한도)으로 제시합니다. 현재 문서는 **네 가지**를 제시하고 적용 순서까지 명시합니다.

| 유형 | 적용 범위 | 상향 |
|---|---|---|
| AWS 제한 한도 | 리전의 **모든 계정·클라이언트** | AWS가 설정하며 고객이 바꿀 수 없습니다 |
| 계정별 한도 | 지정된 리전의 계정 내 **모든 API** | 요청 시 상향 가능. AWS 제한 한도보다 높을 수는 없습니다 |
| API별·스테이지별 한도 | 스테이지의 **API 메서드 수준**. 모든 메서드에 같은 설정을 하거나 메서드마다 다르게 구성 | AWS 제한 한도보다 높을 수 없습니다 |
| 클라이언트별 한도 | 사용량 계획과 연결된 **API 키**를 클라이언트 식별자로 쓰는 클라이언트 | 계정별 한도보다 높을 수 없습니다 |

적용 순서는 **사용량 계획의 클라이언트별·메서드별 한도 → API 스테이지의 메서드별 한도 → 리전별 계정 수준 제한 → AWS 리전 제한** 입니다.

🆕 계정·리전별 기본 스로틀 할당량입니다.

| 항목 | 값 |
|---|---|
| 계정·리전별 스로틀 할당량 (HTTP API·REST API·WebSocket API·WebSocket 콜백 API 합계) | **초당 10,000 요청(RPS)**, 최대 버킷 용량 **5,000 요청** |
| 일부 리전의 기본값 | **2,500 RPS / 버스트 1,250 RPS** (아프리카(케이프타운), 유럽(밀라노), 아시아 태평양(자카르타), 중동(UAE), 아시아 태평양(하이데라바드), 아시아 태평양(멜버른), 유럽(스페인), 유럽(취리히), 이스라엘(텔아비브), 캐나다 서부(캘거리), 아시아 태평양(말레이시아), 아시아 태평양(태국), 멕시코(중부)) |
| 버스트 할당량 조정 | **불가.** API Gateway 서비스 팀이 계정의 리전 전체 RPS 할당량을 기준으로 정합니다 |

**사용량 계획과 API 키.** 사용량 계획은 배포된 하나 이상의 API 스테이지·메서드에 누가 액세스할 수 있는지 지정하고 선택적으로 요청 제한을 시작할 목표 요청 속도를 설정합니다. API 키로 클라이언트를 식별합니다.

| 항목 | 내용 |
|---|---|
| API 키 형식 | 이름은 최대 1,024자, 값은 **20~128자의 영숫자 문자열** |
| 값 고유성 | API 키 값은 고유해야 합니다. 이름이 달라도 값이 같으면 **같은 키로 취급됩니다** |
| 연결 관계 | 하나의 API 키를 여러 사용량 계획에, 하나의 사용량 계획을 여러 스테이지에 연결할 수 있습니다. 단 특정 API 키는 API의 **각 스테이지에 대해 하나의 사용량 계획에만** 연결됩니다 |
| 제한 한도 / 할당량 한도 | 요청 제한을 시작할 목표 지점 / 지정된 시간 간격 안에 특정 API 키로 제출할 수 있는 목표 최대 요청 수 |
| 집계 범위 | 사용량 계획 안의 **모든 API 스테이지에 걸쳐 집계된** 개별 API 키 요청에 적용됩니다 |
| 반영 시간 | 사용량 계획에 API 키를 추가한 뒤 업데이트 완료까지 몇 분이 걸릴 수 있습니다 |

🆕 문서가 명시하는 두 가지 경고는 교재에 없습니다.

| 경고 | 내용 |
|---|---|
| **API 키를 인증·권한 부여에 쓰지 마세요** | 한 사용량 계획에 여러 API가 있으면 그중 한 API의 유효한 API 키를 가진 사용자가 그 계획의 **모든 API에 액세스할 수 있습니다.** 액세스 제어에는 IAM 역할, Lambda 권한 부여자, Amazon Cognito 사용자 풀을 쓰세요. 또 API 키에 기밀 정보를 넣지 말고(클라이언트가 보통 로깅될 수 있는 헤더로 전송) API Gateway가 생성한 키를 쓰세요 |
| **비용 통제에 의존하지 마세요** | 사용량 계획의 제한과 할당량은 하드 한도가 아니라 best-effort 로 적용되므로 클라이언트가 초과할 수 있습니다. 비용 모니터링에는 **AWS Budgets**, 요청 관리에는 **AWS WAF** 를 고려하세요. 스테이지 수준 제한 설정에도 같은 경고가 붙어 있습니다 |

> — 출처: [Throttle requests to your REST APIs for better throughput in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html)
> — 출처: [Usage plans and API keys for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)
> — 출처: [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html)

### 7.7 데모 주제

교재 슬라이드 37은 자체 데모를 쓰거나 실습 5의 데모를 가져오라고 안내하고, 다룰 콘솔 속성을 나열합니다.

| 데모 항목 | 이 문서 |
|---|---|
| 리소스 생성 | [3.2절](#32-rest-api의-핵심-구성-요소) |
| 통합 | [3.5절](#35-통합-유형) |
| 검증 요청 | [4.4절](#44-요청-검증) |
| 매핑 템플릿 | [4.5절](#45-매핑-템플릿-요청-방향) · [4.6절](#46-매핑-템플릿-응답-방향) |
| 모델 | [4.3절](#43-예-요청-모델) |
| 테스트 | [6.2절](#62-api-gateway-콘솔을-사용한-테스트) |
| 배포 | [7.1절](#71-api-gateway-스테이지) |
| 호출 | [6.1절](#61-rest-api-호출) |
| 보너스: 스테이지 변수 | [7.2절](#72-스테이지-변수-사용) |
| 보너스: Canary 릴리스 | [7.3절](#73-canary-릴리스) · [7.4절](#74-canary-릴리스-단계) |

---

## 8. 관측 가능성: 로깅, 지표, 추적 🆕

교재 다이어그램(슬라이드 3·9)에는 Amazon CloudWatch와 AWS X-Ray가 애플리케이션 구성 요소로 등장하고, 슬라이드 34는 canary 단계에서 "CloudWatch를 이용한 로깅을 활성화합니다"라고 안내합니다. 다만 본문에서 이 기능을 설명하지 않으므로 이 장에 모았습니다. 이 장의 기능은 **모두 REST API 전용**이거나 REST API에서 더 넓게 지원됩니다([2.3절](#23-rest-api와-http-api를-고르는-기준)).

### 8.1 실행 로깅과 액세스 로깅 🆕

CloudWatch에는 두 종류의 API 로깅이 있고 **서로 독립적으로 켤 수 있습니다.**

| 구분 | 실행 로깅 (execution logging) | 액세스 로깅 (access logging) |
|---|---|---|
| 관리 주체 | **API Gateway** 가 로그 그룹·로그 스트림을 만들고 요청·응답을 보고합니다 | **API 개발자** 가 로그 그룹을 만들거나 기존 그룹을 고릅니다 |
| 목적 | 요청 실행 문제 디버깅 | 누가 어떻게 API에 액세스했는지 기록 |
| 기록 내용 | 오류 또는 실행 추적(요청·응답 파라미터 값 또는 페이로드), Lambda 권한 부여자가 쓰는 데이터, API 키 필요 여부, 사용량 계획 활성화 여부 | `$context` 변수로 직접 선택한 항목 |
| 로그 그룹 이름 | `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}` | 직접 지정. 대상은 CloudWatch Logs 로그 그룹 또는 Firehose 스트림 |
| HTTP API 지원 | 미지원 | 지원 |

API Gateway는 권한 부여 헤더, API 키 값과 유사한 민감한 요청 파라미터를 기록된 데이터에서 **삭제합니다.** 보안 태세를 개선하려면 실행 로깅을 **`ERROR` 또는 `INFO` 수준**으로 쓰도록 문서가 권장합니다.

콘솔의 로깅 수준은 세 단계입니다.

| 수준 | 의미 |
|---|---|
| Off | 이 스테이지에 로깅을 켜지 않습니다 |
| Errors only | 오류만 로깅합니다 |
| Errors and info logs | 모든 이벤트를 로깅합니다 |

🆕 **Data tracing** 은 문제 해결에 유용하지만 민감한 데이터가 로깅될 수 있어 문서가 **프로덕션 API에는 쓰지 않도록 권장합니다.**

액세스 로그 형식에는 최소한 `$context.requestId` 또는 `$context.extendedRequestId`가 포함되어야 하고 모범 사례는 **둘 다** 넣는 것입니다.

| 변수 | 내용 |
|---|---|
| `$context.requestId` | `x-amzn-RequestId` 헤더 값을 기록합니다. 클라이언트가 UUID 형식 값으로 재정의할 수 있고, UUID 형식이 아닌 재정의 값은 액세스 로그에서 `UUID_REPLACED_INVALID_REQUEST_ID`로 대체됩니다 |
| `$context.extendedRequestId` | API Gateway가 생성하는 고유 ID로 `x-amz-apigw-id` 응답 헤더로 반환됩니다. 호출자가 제공하거나 재정의할 수 없고 AWS Support 문제 해결에 제공해야 할 수 있습니다 |

로그 형식으로 CLF(Common Log Format), JSON, XML, CSV 예제가 콘솔과 문서에 제시됩니다. JSON 형식 예입니다.

```text
{ "requestId":"$context.requestId", "extendedRequestId":"$context.extendedRequestId","ip": "$context.identity.sourceIp", "caller":"$context.identity.caller", "user":"$context.identity.user", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod", "resourcePath":"$context.resourcePath", "status":"$context.status", "protocol":"$context.protocol", "responseLength":"$context.responseLength" }
```

**권한 설정.** CloudWatch Logs를 켜려면 `apigateway.amazonaws.com`을 신뢰할 수 있는 엔터티로 하는 IAM 역할을 만들고 `AmazonAPIGatewayPushToCloudWatchLogs` 정책을 붙여 Account의 `cloudWatchRoleArn`에 설정합니다. 이 속성은 **CloudWatch Logs를 켜려는 리전마다 따로** 설정해야 합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": { "Service": "apigateway.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

> — 출처: [Set up CloudWatch logging for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

### 8.2 CloudWatch 지표 🆕

API Gateway는 **1분마다** CloudWatch로 지표 데이터를 보냅니다. `AWS/ApiGateway` 네임스페이스의 지표입니다.

| 지표 | 내용 | 단위 |
|---|---|---|
| `4XXError` | 클라이언트 측 오류 수. 수정된 게이트웨이 응답 상태 코드도 여기 계산됩니다 | Count |
| `5XXError` | 서버 측 오류 수 | Count |
| `CacheHitCount` | API 캐시에서 처리된 요청 수 | Count |
| `CacheMissCount` | API 캐싱이 활성화된 상태에서 백엔드에서 처리된 요청 수 | Count |
| `Count` | 총 API 요청 수. `SampleCount` 통계가 이 지표를 나타냅니다 | Count |
| `IntegrationLatency` | API Gateway가 백엔드로 요청을 중계한 시점과 백엔드에서 응답을 받은 시점 사이의 시간 | Millisecond |
| `Latency` | API Gateway가 클라이언트에서 요청을 받은 시점과 응답을 반환한 시점 사이의 시간. **통합 지연 시간과 API Gateway 오버헤드를 포함합니다** | Millisecond |

오류·캐시 지표에서 `Sum` 통계는 총 건수이고 `Average` 통계는 총 건수를 기간 내 총 요청 수로 나눈 **비율**입니다. 분모는 `Count` 지표입니다.

차원은 `ApiName`, `ApiName, Method, Resource, Stage`, `ApiName, Stage` 세 가지입니다. 🆕 **메서드 수준 차원(`ApiName, Method, Resource, Stage`)의 지표는 상세 CloudWatch 지표를 명시적으로 활성화하지 않으면 전송되지 않고, 활성화하면 계정에 추가 요금이 발생합니다.** API 수준·스테이지 수준 지표에는 요금이 부과되지 않습니다.

`IntegrationLatency`와 `Latency`의 차이를 보면 지연 시간이 백엔드에서 오는지 API Gateway 계층에서 오는지 구분할 수 있습니다.

> — 출처: [Amazon API Gateway dimensions and metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html)

### 8.3 AWS X-Ray 추적 🆕

AWS X-Ray로 사용자 요청이 REST API를 거쳐 하위 서비스로 이동하는 과정을 추적·분석할 수 있습니다.

| 항목 | 내용 |
|---|---|
| 지원 범위 | REST API의 **모든 엔드포인트 유형**(리전, 엣지 최적화, 프라이빗). X-Ray를 쓸 수 있는 모든 AWS 리전 |
| 효용 | 요청 전체에 대한 엔드투엔드 뷰를 제공하므로 API와 백엔드 서비스의 지연 시간을 분석할 수 있습니다. 서비스 맵으로 요청 전체와 X-Ray와 통합된 하위 서비스의 지연 시간을 봅니다 |
| 샘플링 | 샘플링 규칙으로 어떤 요청을 어떤 비율로 기록할지 지정합니다 |
| 추적 통과 | **이미 추적 중인 서비스에서 API를 호출하면 그 API에 X-Ray 추적이 활성화되어 있지 않아도 API Gateway가 추적을 통과시킵니다** |
| 활성화 | **API 스테이지 단위**로 콘솔(Logs and tracing → X-Ray tracing)·API·CLI로 켭니다(`tracingEnabled`) |

> — 출처: [Trace user requests to REST APIs using X-Ray in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html)

### 8.4 향상된 관찰 기능 변수 🆕

교재 슬라이드 10 강사 노트가 대기 시간 항목에서 인용하는 AWS 컴퓨팅 블로그의 내용입니다. API Gateway는 요청을 **단계(phase)** 로 나누고, 애플리케이션에 구성된 기능에 따라 다음 순서로 나타납니다.

| 단계 | 나타나는 조건 | 하는 일 |
|---|---|---|
| WAF | AWS WAF 웹 ACL이 구성된 경우 | WAF 규칙을 평가하고 요청 계속·취소를 결정합니다 |
| Authenticate | IAM 권한 부여자를 쓸 때 | 서명된 요청의 자격 증명을 검증합니다 |
| Authorizer | Lambda·JWT·Amazon Cognito 권한 부여자를 쓸 때 | 권한 부여자 로직을 처리합니다 |
| Authorize | Lambda 또는 IAM 권한 부여자를 쓸 때 | 앞 두 단계 결과를 평가·적용합니다 |
| Integration | 항상 | 백엔드 통합이 요청을 처리합니다 |

각 단계는 지연 시간을 더하거나 상태를 반환하거나 오류를 낼 수 있습니다. 변수 이름은 발생 단계를 따라 `$context.단계.속성` 구조를 씁니다. 예를 들어 WAF 지연 시간은 `$context.waf.latency` 입니다. 기존 변수에도 이 규칙에 맞는 별칭이 생겼습니다(예: `$context.integrationErrorMessage`의 별칭은 `$context.integration.error`).

권한 부여자·통합 단계에는 `$context.단계.requestId`와 `$context.단계.integrationStatus`가 추가로 있습니다. Lambda 함수를 통합으로 쓸 때 두 상태 코드를 구분해야 합니다.

| 변수 | 의미 |
|---|---|
| `$context.integration.integrationStatus` | **Lambda 서비스 자체**의 상태. 서비스·권한 오류가 없으면 보통 200입니다 |
| `$context.integration.status` | **Lambda 함수 코드**의 성공·실패 상태 |

> — 출처: [Troubleshooting Amazon API Gateway with enhanced observability variables](https://aws.amazon.com/blogs/compute/troubleshooting-amazon-api-gateway-with-enhanced-observability-variables/)

---

## 9. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 9.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| 엔드포인트 유형 기본값 (슬라이드 13) | "엔드포인트 유형에서는 리전 API 엔드포인트가 기본적으로 선택됩니다" | 엔드포인트 유형 문서는 엣지 최적화를 설명하면서 **"이것이 API Gateway REST API의 기본 엔드포인트 유형"** 이라고 명시하고, 개념 문서도 엣지 최적화를 "API Gateway API의 기본 호스트 이름"으로 정의합니다. 세 유형의 이름과 특성 서술은 맞습니다 | [API endpoint types](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html) |
| 메서드 권한 부여 유효값 (슬라이드 13) | 유효값 `NONE`·`AWS_IAM` 두 개. "기본값은 none 또는 AWS_IAM으로 설정됩니다" | `authorizationType`은 **필수 파라미터**이고 유효값은 `NONE`·`AWS_IAM`·`CUSTOM`(Lambda 권한 부여자)·`COGNITO_USER_POOLS` **네 개**입니다. 두 값 중 하나가 기본값이라는 서술은 문서에 없습니다 | [PutMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethod.html) |
| HTTP API의 Mock 통합 (슬라이드 14) | HTTP API가 "Mock 및 HTTP 프록시 통합"을 지원 | 비교 문서의 통합 표는 **Mock 통합을 REST API 전용**으로 표시합니다. 나머지 항목(Lambda 프록시, AWS 서비스, VPC 프라이빗 리소스, HTTP 프록시)은 맞습니다 | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| 요청 검증자 값 유형 (슬라이드 18) | `"validateRequestBody": "false"`, `"validateRequestParameters": "true"` | 두 필드는 **Boolean** 플래그입니다. 문자열 `"false"`는 JSON에서 참으로 취급될 수 있어 의도와 다르게 동작할 위험이 있습니다 | [RequestValidator](https://docs.aws.amazon.com/apigateway/latest/api/API_RequestValidator.html) |
| 매핑 템플릿의 `$elem` (슬라이드 19·20) | `#set`으로 `$inputRoot`를 선언하지만 쓰지 않고 `$elem`을 반복 지시자 없이 참조 | 공식 예제에서 컬렉션 순회는 항상 **`#foreach` ... `#end`** 로 표현하고 `$foreach.hasNext`로 구분자를 넣습니다. 교재 템플릿을 그대로 붙여 넣으면 값이 채워지지 않습니다. 다만 AWS 문서의 매핑 템플릿 개념 페이지 예제에도 같은 표기가 있어, 문서가 이 패턴을 명시적으로 오류라고 서술한 문장은 찾지 못했습니다([9.5절](#95-검증하지-못한-항목)) | [Mapping template examples](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-variable-examples.html) |
| canary·methodSettings 값 유형 (슬라이드 34) | `"percentTraffic": "10"`, `"useStageCache": "False“`, `"metricsEnabled": "true"` | `percentTraffic`은 **Double**(0.0~100.0), `useStageCache`와 `metricsEnabled`는 **Boolean** 입니다. 교재 코드는 또 닫는 따옴표가 여는 큰따옴표로 깨져 있고 마지막 줄에 닫는 중괄호가 없습니다 | [CanarySettings](https://docs.aws.amazon.com/apigateway/latest/api/API_CanarySettings.html) |
| Canary를 새 스테이지에 만든다 (슬라이드 34~36) | "새 스테이지에 배포합니다", "새 스테이지에서 Canary를 활성화합니다". 다이어그램도 "안정적 스테이지"와 "새 canary 스테이지"를 분리 | 카나리는 별도 스테이지가 아니라 **같은 스테이지의 `canarySettings`** 입니다. 카나리를 활성화하면 비활성화하고 설정을 제거할 때까지 그 스테이지를 다른 비카나리 배포에 연결할 수 없습니다. 같은 교재 슬라이드 32 노트("동일한 스테이지에서")와도 어긋납니다 | [Canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html) |
| 스테이지 변수의 Lambda 별칭 표기 (슬라이드 31) | `list_function:{$stageVariables.environment}` | 문서 표기는 `function:<함수이름>:${stageVariables.<버전변수>}` 이므로 중괄호가 달러 기호 **뒤에** 와야 합니다. 올바른 형태는 `list_function:${stageVariables.environment}` 입니다 | [Stage variables reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html) |
| 리소스 목록의 `/notes/list` (슬라이드 13) | 강사 노트는 `/notes`, `/notes/search`, `/notes/list` 세 개 | 같은 슬라이드 도형에는 `/notes`와 `/notes/search`만 있고 슬라이드 9의 메서드 목록에도 `/notes/list`는 없습니다. 교재 내부의 자기 모순이며 어느 쪽이 옳은지는 AWS 문서로 판별할 수 없습니다. 이 문서는 도형에 맞췄습니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 슬라이드 14 표 Mock 행 | '패스스루' 칸과 '통합 유형' 칸에 모두 `MOCK` | 프록시·비프록시 행의 같은 칸에는 패스스루 동작 서술이 들어 있으므로 열 의미가 어긋납니다. 교재 자체의 표기 오류입니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 슬라이드 18 페이로드 키 | 배열 요소 키가 `Note`가 아니라 `Notes` | 슬라이드 17의 `NotesInputModel`은 배열 요소에 `Note`를 필수로 요구하므로 이 페이로드는 검증에서 `400`으로 실패합니다. 교재 내부의 자기 모순입니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 강사 노트 인용 URL | `https://docs.aws.amazon.com/ko_kr/ apigateway/...` 처럼 URL 중간에 공백 | 여러 인용문의 `ko_kr/`과 `apigateway` 사이에 공백이 들어가 그대로 복사해서는 열 수 없습니다. 공백을 제거하면 11개 링크 모두 현재도 유효한 페이지를 가리킵니다 | — ([9.5절](#95-검증하지-못한-항목)) |

### 9.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 규격 이름 | "Swagger를 사용한 API 설계", `swagger: "2.0"`, "Swagger 기능" | 문서는 **"Develop REST APIs using OpenAPI in API Gateway"** 로 부르고 **OpenAPI v2.0과 v3.0** 을 지원합니다. 확장 목록 페이지 제목도 "OpenAPI extensions for API Gateway"입니다. 내보내기 경로가 `exports/oas30`과 `exports/swagger`로 나뉩니다 | [Develop REST APIs using OpenAPI](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-import-api.html) |
| 권한 부여자 명칭 | "Lambda 권한 부여자"(현재 이름이라 맞음) | 문서는 **"Lambda authorizer (formerly known as a custom authorizer)"** 로 표기합니다. 교재는 유형 구분(`REQUEST`·`TOKEN`)과 문서가 `REQUEST`를 권장한다는 점, 메서드 권한 부여 값이 `CUSTOM`이라는 점을 다루지 않습니다 | [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) |
| 제한 설정 유형 수 | "제한에 관한 **두 가지** 기본적인 유형" | **네 가지** 입니다: AWS 제한 한도 / 계정별 한도 / API별·스테이지별 한도 / 클라이언트별 한도. 적용 순서도 명시되어 있고, 스로틀과 할당량은 하드 한도가 아니라 best-effort 목표입니다 | [Throttle requests to your REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html) |
| 통합 패스스루 | "조건 두 가지" | 세 가지 선택지가 있는 **설정**입니다: `WHEN_NO_MATCH` / `WHEN_NO_TEMPLATES`(**권장**) / `NEVER`. `NEVER`와 `WHEN_NO_TEMPLATES`는 매핑되지 않은 콘텐츠 유형을 `415 Unsupported Media Type`으로 거부합니다 | [Method request behavior for payloads without mapping templates](https://docs.aws.amazon.com/apigateway/latest/developerguide/integration-passthrough-behaviors.html) |
| 콘솔 테스트 경로 | "Method Execution 창의 Client 상자에서 TEST를 선택" | **Resources 창에서 메서드 선택 → Test 탭 → Test.** Method Execution 창과 Client 상자는 이전 콘솔 UI입니다 | [Use the API Gateway console to test a REST API method](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-test-method.html) |
| 스테이지 설정 UI | "Stage Editor 창" | **Stages → 스테이지 → Stage details / Logs and tracing** 의 Edit 두 곳으로 나뉩니다. 스테이지가 배포에 대한 명명된 참조라는 정의와 다섯 가지 설정 항목은 그대로입니다. 설정 변경 후에는 API를 다시 배포해야 적용됩니다 | [Set up a stage for a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html) |
| Canary 승격 | "canary 버전을 승격하고 트래픽 100%를 이 API 버전으로 보낼 수 있습니다"(결과만) | 메커니즘은 배포 ID 복사 + 스테이지 변수 복사 + `percentTraffic`을 **0.0** 으로 설정입니다. **승격만으로는 카나리가 비활성화되지 않으며** 일반 배포로 되돌리려면 `canarySettings`를 제거해야 합니다 | [Promote a canary release](https://docs.aws.amazon.com/apigateway/latest/developerguide/promote-canary-deployment.html) |
| `HTTP`·`HTTP_PROXY` 정의 | "VPC에 있는 프라이빗 HTTP 엔드포인트를 포함한 HTTP 엔드포인트와 통합" | 두 유형은 **백엔드 HTTP 엔드포인트** 통합입니다. 프라이빗 통합은 `HTTP_PROXY` + `connectionType=VPC_LINK` + **VPC 링크 V2** 로 구성하는 별도 설정이며 NLB와 ALB를 모두 대상으로 삼을 수 있습니다 | [Set up a private integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html) |

### 9.3 비권장·지원 종료된 항목

이 모듈에는 **지원이 종료된 항목이 없습니다.** 아래는 계속 동작하지만 현재 권장 경로가 아닌 항목입니다.

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| 데이터 변환의 주 경로로 매핑 템플릿 사용 (슬라이드 16~20) | 비권장 | 문서의 권장 순서는 **① 프록시 통합 → ② 파라미터 매핑(VTL 불필요) → ③ 매핑 템플릿 변환** 입니다. 매핑 템플릿은 본문을 바꿔야 하거나 조건부 재정의가 필요하고 프록시 통합을 쓸 수 없을 때 씁니다 | [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html) |
| API 키로 API 액세스 통제 (슬라이드 10·13) | 비권장 | 액세스 제어에는 **IAM 역할 · Lambda 권한 부여자 · Amazon Cognito 사용자 풀** 을 씁니다. 한 사용량 계획의 API 키 하나로 그 계획의 모든 API에 액세스할 수 있기 때문입니다. API 키는 클라이언트 식별과 사용량 계획 연결에만 씁니다 | [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html) |
| 사용량 계획 할당량으로 비용·액세스 통제 (슬라이드 10) | 비권장 | 제한·할당량은 하드 한도가 아니라 best-effort 목표입니다. 비용 모니터링에는 **AWS Budgets**, 요청 차단에는 **AWS WAF** 를 씁니다 | [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html) |
| 스테이지 변수로 민감한 구성 전달 (슬라이드 31) | 비권장 | 스테이지 변수는 자격 증명 같은 민감한 데이터용이 아닙니다. 민감한 데이터는 **Lambda 권한 부여자의 출력**으로 통합에 전달합니다. 민감하지 않은 구성 전달은 여전히 정당한 용도입니다 | [Use stage variables for a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html) |
| 프로덕션 스테이지에서 Data tracing 활성화 (슬라이드 34) | 비권장 | 실행 로깅은 **Errors only 또는 Errors and info logs** 수준으로 쓰고 Data tracing은 문제 해결 중에만 임시로 켭니다. 민감한 데이터가 로깅될 수 있습니다 | [Set up CloudWatch logging for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) |

### 9.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| REST API vs HTTP API 선택 기준 | 기능 수와 가격 기준으로 고릅니다. 이 모듈이 다루는 요청 검증·매핑 템플릿·캐싱·카나리·사용량 계획·테스트 호출·실행 로그·X-Ray는 대부분 **REST API 전용** 입니다. HTTP API 전용은 자동 배포, JWT 권한 부여자, AWS Cloud Map 프라이빗 통합입니다 | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| Lambda 프록시 통합 권장 | 문서는 Lambda 프록시를 "Lambda 함수를 호출하는 데 선호되는 통합 유형"으로 강력히 권장합니다. Lambda 사용자 지정 통합은 매핑 템플릿을 여러 엔드포인트에서 재사용할 때 쓰는 고급 시나리오용입니다 | [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html) |
| Lambda 프록시 입력·출력 형식 | 입력 이벤트 키(`resource`·`path`·`httpMethod`·`headers`·`multiValueHeaders`·`queryStringParameters`·`requestContext`·`body`·`isBase64Encoded` 등)와 출력 형식(`isBase64Encoded`·`statusCode`·`headers`·`multiValueHeaders`·`body`). 형식이 다르면 **`502 Bad Gateway`**. `{proxy+}` + `ANY` 조합 | [Lambda proxy integrations](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html) |
| HTTP API 페이로드 형식 버전 | `1.0`과 `2.0`. 콘솔은 최신 버전을 기본으로 쓰지만 CLI·CloudFormation·SDK로 만들면 **필수 지정**. `2.0`은 `multiValueHeaders`가 없고 `rawPath`·`cookies`가 있으며 `statusCode` 없는 유효 JSON 응답을 추론합니다 | [Create AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) |
| 파라미터 매핑 | 통합 요청·응답의 경로·쿼리 문자열·헤더 값을 **VTL 없이** 수정합니다. 본문은 수정할 수 없습니다. CORS용 정적 헤더 값에 씁니다 | [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html) |
| 매핑 템플릿 변수 전체 | `$input`(`body`·`json`·`path`·`params`), `$context`(52개 항목), `$stageVariables`(세 표기), `$util`(`escapeJavaScript`·`parseJson`·`urlEncode`·`urlDecode`·`base64Encode`·`base64Decode`) | [Variables for data transformations](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html) |
| 요청 검증의 범위 | 파라미터는 **존재만** 확인하고 유형·형식은 확인하지 않습니다. 실패 시 `400`을 반환하고 결과를 CloudWatch Logs에 게시합니다. 콘텐츠 유형과 무관하게 같은 모델을 쓰려면 `$default` | [Request validation for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html) |
| 모델의 확장 기능 | `enum`으로 허용 값 제한, `minimum`·`maximum`으로 범위 제약, 참조 프리미티브로 `definitions`·외부 모델 참조. API당 모델 크기 400KB | [Data models for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings-models.html) |
| WebSocket API의 제약 | 사용자 지정 경로 키에 `$` 접두사 사용 불가, 권한 부여는 `$connect`에만(값 `NONE`·`AWS_IAM`·`CUSTOM`, API 전체 적용), `$connect` 실패 시 `401`·`403`, `$disconnect`는 전달 보장 없는 best-effort | [Create routes for WebSocket APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html) |
| 캐싱 세부 값 | 기본 TTL 300초 / 최대 3600초 / `TTL=0`은 비활성화, 캐시 가능한 응답 최대 1,048,576바이트, 캐시 용량 8단계(0.5~237GB), **`GET`만 기본 캐싱**, 캐시 키 필수, `Cache-Control: max-age=0`으로 무효화(교차 계정 불가), 시간당 과금 | [Cache settings for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html) |
| REST API 할당량 | 통합 시간 초과 **50ms~29초**, 페이로드 **10MB**, 유휴 연결 310초, API당 리소스 300·스테이지 10·권한 부여자 10·모델 크기 400KB, 리전 API 600·엣지 최적화 120 | [Quotas for configuring and running a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html) |
| 계정 수준 스로틀 할당량 | 계정·리전당 **10,000 RPS**, 최대 버킷 용량 **5,000 요청**. 13개 리전은 2,500 RPS / 1,250 버스트. 버스트 할당량은 고객이 조정 불가 | [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html) |
| 실행 로깅과 액세스 로깅의 구분 | 실행 로깅은 API Gateway가 관리하고 로그 그룹 이름이 `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}`. 액세스 로깅은 개발자가 로그 그룹과 형식(CLF·JSON·XML·CSV)을 정하고 `$context.requestId`·`$context.extendedRequestId`를 포함해야 합니다. 두 로깅은 독립적으로 켭니다 | [Set up CloudWatch logging for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) |
| CloudWatch 지표 | `4XXError`·`5XXError`·`CacheHitCount`·`CacheMissCount`·`Count`·`IntegrationLatency`·`Latency` 일곱 개, 1분 주기. 메서드 수준 차원은 상세 지표를 켜야 전송되고 **추가 요금**이 발생합니다 | [Amazon API Gateway dimensions and metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html) |
| X-Ray 추적 | REST API의 모든 엔드포인트 유형 지원, 스테이지 단위 활성화, 샘플링 규칙, 이미 추적 중인 서비스에서 호출하면 **추적 통과** | [Trace user requests to REST APIs using X-Ray](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html) |
| 향상된 관찰 기능 변수 | WAF → Authenticate → Authorizer → Authorize → Integration 단계별 `$context.단계.속성` 변수. Lambda 통합의 `integrationStatus`(서비스 상태)와 `status`(함수 코드 상태) 구분 | [Troubleshooting Amazon API Gateway with enhanced observability variables](https://aws.amazon.com/blogs/compute/troubleshooting-amazon-api-gateway-with-enhanced-observability-variables/) |
| AWS WAF 평가 우선순위 | AWS WAF 규칙이 리소스 정책·IAM 정책·Lambda 권한 부여자·Cognito 권한 부여자보다 **먼저** 평가됩니다. 요청 본문 검사는 첫 64KB로 제한되고 웹 ACL은 API 스테이지에 연결합니다 | [Use AWS WAF to protect your REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html) |
| 프라이빗 API 세부 사항 | AWS PrivateLink 기반, Direct Connect 경유 가능, 프라이빗 DNS를 켜면 퍼블릭 API 기본 엔드포인트 액세스 불가, **TLS 1.2만 지원**, HTTP/2 요청은 HTTP/1.1로 강제 | [Private REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html) |
| `x-amazon-apigateway-integration` 속성 | `type`(소문자 `aws_proxy` 등), `payloadFormatVersion`, `timeoutInMillis`(50~29,000ms), `responseTransferMode`(`BUFFERED`·`STREAM`), `connectionType`, `passthroughBehavior`, `contentHandling` 등 | [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html) |
| Mock 통합의 다른 용도 | 랜딩 페이지 프로비저닝, CORS 헤더 반환(콘솔은 `OPTIONS` 메서드를 Mock 통합으로 구성), 게이트웨이 응답. **큰 응답 템플릿에는 부적합**하므로 그때는 Lambda 통합을 씁니다 | [Mock integrations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html) |
| 개발자 포털과 Quick create | 개발자 포털(API 제공자가 API와 문서를 공유하며 API를 제품으로 묶는 애플리케이션, REST API 전용)과 Quick create(Lambda·HTTP 통합, 기본 catch-all 경로, 자동 배포 스테이지로 HTTP API를 간단히 생성) | [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html) |

### 9.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| "HTTP API가 REST API보다 대기 시간이 짧다" (슬라이드 7) | 두 API를 비교하는 공식 문서가 제시하는 축은 **기능 수와 가격**이고 대기 시간은 비교 항목으로 나오지 않습니다. 비용이 더 낮다는 서술은 문서로 확인했습니다("designed with minimal features so that they can be offered at a lower price"). **대기 시간이 더 짧다는 서술을 뒷받침하는 문장은 이 문서에서 찾지 못했습니다.** 교재가 틀렸다고 단정하지 않고, 확인하지 못했다고만 적습니다 |
| 콘솔이 엔드포인트 유형으로 무엇을 미리 선택하는가 | 문서로 확인한 것은 **엣지 최적화가 REST API의 기본 엔드포인트 유형**이라는 서술입니다. 교재는 "콘솔의 엔드포인트 유형에서 리전이 기본적으로 선택된다"고 콘솔 UI를 말합니다. **현재 콘솔이 어느 항목을 미리 선택해 두는지는 문서에서 확인하지 못했습니다.** 실무에서는 엔드포인트 유형을 명시적으로 고르세요 |
| 매핑 템플릿의 `$elem` 표기 (슬라이드 19·20) | 공식 예제에서 컬렉션 순회가 `#foreach` ... `#end` 로 표현된다는 것은 확인했습니다. 그런데 **AWS 문서의 매핑 템플릿 개념 페이지 예제에도 `#foreach` 없이 `$elem`을 쓰는 표기가 있어**, 문서가 이 패턴을 명시적으로 오류라고 서술한 문장은 찾지 못했습니다. 이 문서는 동작하는 형태로 교정했지만 "문서가 금지한다"고 말할 근거는 없습니다 |
| 실행 로그 그룹 이름의 구분자 | 로깅 설정 문서는 `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}`(밑줄), 카나리 문서는 `API-Gateway-Execution-Logs/{rest-api-id}/{stage-name}`(슬래시)로 적어 **두 페이지의 표기가 다릅니다.** 어느 쪽이 실제 이름인지는 문서만으로 판별할 수 없어 로깅 설정 문서 표기를 본문에 실었습니다. 실제 로그 그룹 이름은 콘솔에서 확인하세요 |
| 슬라이드 13 리소스 목록의 `/notes/list` | 교재 안에서 강사 노트와 도형·슬라이드 9가 어긋납니다. 어느 쪽이 이 애플리케이션의 올바른 설계인지는 **AWS 문서로 판별할 수 없습니다.** 이 문서는 도형과 슬라이드 9의 다수 근거를 따랐습니다 |
| 슬라이드 14 표 Mock 행의 패스스루 칸 | 열 의미가 어긋난 표기 오류입니다. AWS 문서로 검증할 성질의 사실이 아니라 교재 자체의 오류이므로 칸만 교정하고 근거 인용은 붙이지 않았습니다 |
| 슬라이드 18 페이로드의 `Notes` 키 | 같은 이유로 교재 내부 불일치입니다. 슬라이드 17 모델에 맞춰 `Note`로 교정했습니다 |
| 슬라이드 34 코드 예의 깨진 따옴표와 닫히지 않은 중괄호 | 값 유형(Double·Boolean)은 API 참조로 확인했지만 따옴표 문자 깨짐과 중괄호 누락은 문서 검증 대상이 아니라 교재의 표기 오류입니다 |
| 슬라이드 8 WebSocket 강사 노트의 한국어 번역 파손 | "지속적인 지속적인 의 영구 연결", "경로을 호출합될 때"처럼 문장이 중복·파손되어 있습니다. **내용 오류가 아니라 번역 품질 문제**이므로 의미가 통하는 범위로만 요약했습니다 |
| 실습 5 워크플로 (슬라이드 41~42) | 원본 덱에 다이어그램 요소(Amazon API Gateway, AWS 클라우드, 사용자, DynamoDB table)만 있고 설명 텍스트가 없습니다. 요약할 원문이 없어 이 문서에서는 다루지 않았습니다 |
| 슬라이드 25~26의 콘솔 스크린샷 | 원본 덱에 이미지만 있고 텍스트가 없습니다. 콘솔 절차는 현재 공식 문서 기준으로 다시 썼습니다([6.2절](#62-api-gateway-콘솔을-사용한-테스트)) |
| 캐시 용량별 성능·요금 수치 | 캐시 용량 선택지 8단계와 시간당 과금·프리 티어 제외는 문서로 확인했습니다. **용량별 구체적 성능·요금은 문서가 요금 페이지를 가리키고 있어 이 문서에서는 조회하지 않았습니다** |
