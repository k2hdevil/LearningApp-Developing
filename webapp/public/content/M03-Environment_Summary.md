# 모듈 3: AWS에서 개발 시작하기

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [AWS 서비스에 프로그래밍 방식으로 액세스](#2-aws-서비스에-프로그래밍-방식으로-액세스)
3. [AWS SDK](#3-aws-sdk)
4. [AWS Command Line Interface](#4-aws-command-line-interface)
5. [AWS SDK 프로그래밍 패턴](#5-aws-sdk-프로그래밍-패턴)
6. [통합 개발 환경](#6-통합-개발-환경)
7. [개발 환경 설정](#7-개발-환경-설정)
8. [교재 대비 변경 사항](#8-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [8장](#8-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 8월 25일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- AWS 서비스에 프로그래밍 방식으로 액세스하는 방법 설명
- AWS SDK 내의 프로그래밍 패턴 나열

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 모듈 2 | AWS에 웹 애플리케이션 빌드 |
| **모듈 3** | **AWS에서 개발 시작하기** — AWS 리소스를 사용한 개발을 시작하는 데 필요한 기초 지식. 간략한 AWS CLI 시연 포함 |
| 실습 1 | 개발 환경 구성 |
| 모듈 4 | 권한 시작하기 |

실습 환경 구성(1일 차 어젠다 다이어그램): 수강생 본인이 Guacamole, SSH 또는 원격 데스크톱으로 AWS 클라우드의 EC2 인스턴스에 있는 IDE에 접속하고, 그 IDE에서 AWS IAM과 Amazon S3를 사용합니다.

### 모듈 섹션 구성

| 교재 슬라이드 | 섹션 | 이 문서의 장 |
|---|---|---|
| 4–17 | AWS 서비스에 프로그래밍 방식으로 액세스 | 2장, 3장 |
| 18–21 | AWS Command Line Interface(AWS CLI) | 4장 |
| 22–23 | 데모 | 4장 |
| 24–31 | AWS SDK 및 프로그래밍 패턴 | 5장 |
| 32–37 | 통합 개발 환경(IDE) | 6장 |
| 38–39 | 학습 내용 확인 | 9장 |
| 40–43 | 요약 | 7장, 9장 |

---

## 2. AWS 서비스에 프로그래밍 방식으로 액세스

### 2.1 AWS REST API와 서비스 엔드포인트

모든 AWS 서비스는 전용 애플리케이션 프로그램 인터페이스(API)를 지원하여 기능을 제공합니다. AWS 서비스에 프로그래밍 방식으로 연결하려면 **AWS 서비스 엔드포인트**를 사용합니다. 엔드포인트는 AWS 제품 및 서비스의 진입점 URL로서, 여기서 API가 제공됩니다.

```text
클라이언트 애플리케이션  ──── 요청 ────▶  AWS REST API  ──▶  인스턴스 실행
                        ◀─── 응답 ────                   ──▶  S3 파일 업로드 / 버킷 생성
                                                          ──▶  데이터베이스 항목 업데이트
       전송 계층: HTTP(S) · SigV4 · IAM 액세스 키(ID, secret)
```

### 2.2 요청 서명과 SigV4 🔄

보안을 위해 대부분의 AWS 요청은 서명해야 합니다. AWS는 HTTP가 전송한 AWS 요청에 인증 정보를 추가하는 프로세스로 **서명 버전 4(SigV4)** 를 지원하며, SigV4는 현재 대부분의 AWS 서비스 작업에 대한 기본 서명 방식입니다.

서명이 하는 일:

| 목적 | 동작 |
|---|---|
| 요청자 신원 확인 | 액세스 키(액세스 키 ID, secret 액세스 키)로 서명을 생성합니다. 🆕 **임시 보안 인증**을 사용하는 경우 서명 계산에 **보안 토큰(security token)** 도 필요합니다 |
| 전송 중 데이터 보호 | 요청 요소 일부로 해시(다이제스트)를 계산해 요청에 포함합니다. 서비스가 같은 정보로 해시를 다시 계산해 값이 다르면 요청을 거부합니다 |
| 재전송 공격 방어 | 타임스탬프를 사용합니다. 🔄 기준은 **대부분의 경우 요청이 요청에 포함된 타임스탬프로부터 5분 이내에 AWS에 도달해야 한다**는 것입니다. 그렇지 않으면 AWS가 요청을 거부합니다 |

- SigV4는 **HTTP `Authorization` 헤더** 또는 **URL 쿼리 문자열**로 표현할 수 있습니다.
- 직접 코드를 작성해 API 요청을 보낼 때는 서명 코드를 포함해야 합니다. AWS SDK와 AWS CLI를 사용하면 제공된 액세스 키로 요청을 **자동으로 인증**합니다.
- 🆕 **SigV4a** 는 ECDSA 기반 비대칭 서명으로, 다중 리전 API 요청(예: Amazon S3 다중 리전 액세스 포인트)에 필요합니다. SDK가 글로벌 엔드포인트 호출에 자동으로 사용합니다. AWS는 공개 키만 저장하며, 공개 키로는 요청을 서명할 수 없습니다.

> — 출처: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 2.3 예제: HTTP 요청/응답(S3 API)

API는 표준 통신 방법을 제공합니다. 요청 메시지와 응답 메시지의 구조는 비슷합니다. 각각 **시작 줄**이 있고, 선택 사항인 **헤더**와 **본문** 섹션이 있습니다.

요청 — 기본 AWS 리전의 `pollynotes`라는 버킷에 대한 CreateBucket 요청 (교재 기재)

```http
PUT / HTTP/1.1
Host: pollynotes.s3.<Region>.amazonaws.com
Content-Length: 0
Date: Wed, 01 Mar 2006 12:00:00 GMT
Authorization: authorization string
```

응답 — CreateBucket 요청에 대한 응답

```http
HTTP/1.1 200 OK
x-amz-id-2: yyyyy/xxxxxxx
x-amz-request-id: 236A8905248E5A01
Date: Wed, 01 Mar 2006 12:00:00 GMT
Location: /pollynotes
Content-Length: 0
Connection: close
Server: AmazonS3
```

#### 시작 줄

| 메시지 | 시작 줄이 나타내는 것 |
|---|---|
| 요청 | 서버에서 수행될 **작업**과 웹 서버에 있는 **리소스의 경로**. 리소스 경로에는 값이 있어야 하고, 값이 지정되지 않으면 서버 루트를 나타내는 슬래시(`/`)로 표시합니다 |
| 응답 | 요청의 **성공 또는 실패 여부** |

#### 헤더

헤더에는 API 요청 및 응답에 연결된 메타데이터가 있습니다. 서버의 도메인을 나타내는 `Host` 같은 일부 헤더는 잘 정의되어 있고, 헤더는 사용자 지정할 수도 있습니다. 헤더 다음에는 헤더 필드의 끝을 나타내는 **빈 줄**이 옵니다. 형식은 `<헤더 필드> ":" <필드-값>` 입니다.

| 헤더 유형 | 적용 대상 | 예제 |
|---|---|---|
| 일반 | 요청과 응답에 모두 해당 | `Date: Wed, 01 Mar 2006 12:00:00 GMT` |
| 클라이언트 요청 | 요청 메시지에 해당 | `Host: pollynotes.s3.<Region>.amazonaws.com` |
| 서버 응답 | 응답 메시지에 해당 | `x-amz-request-id: 236A8905248E5A01` |
| 리소스 | 본문 또는 요청에서 식별된 리소스에 대한 메타데이터를 포함 | `Content-Type: text/plain` |

페이로드라고도 하는 **본문**에는 서버와 클라이언트 간에 전송될 콘텐츠가 포함되어 있습니다.

> — 출처: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

### 2.4 HTTP 상태 코드 🔄

서비스가 요청에 응답하면 **응답의 시작 줄**에 상태 코드와 상태 메시지가 포함됩니다.

> 🔄 교재 강사 노트는 "요청 헤더에 상태 및 상태 메시지가 포함됩니다"라고 서술하지만, 상태 코드는 요청 헤더가 아니라 응답의 시작 줄에 옵니다. 같은 덱의 슬라이드 6 노트는 "응답의 시작 줄에는 요청의 성공 또는 실패 여부가 표시됩니다"로 올바르게 기재해 자체 모순입니다. 슬라이드 7의 예제 코드도 첫 줄이 `HTTP/1.1 200 OK` 로 응답 시작 줄입니다.

| 클래스 | 명칭 | 의미 |
|---|---|---|
| 1xx | Informational | 지금까지 모든 것이 정상임을 나타내는 정보 응답 |
| 2xx | Success | 서버가 성공적으로 요청을 수신하고 처리 |
| 3xx | Redirection | 요청을 완료하려면 추가 작업이 필요함 |
| 4xx | Client error | 클라이언트 오류. 잘못된 구문 또는 요청 이행을 막는 다른 사용자 오류 |
| 5xx | Server error | 유효한 요청으로 보이는 것이 이행되지 못하도록 한 서버 오류 |

DynamoDB 쿼리 응답 예 (교재 기재):

```http
HTTP/1.1 200 OK
x-amzn-RequestId: <RequestId>
x-amz-crc32: <Checksum>
Content-Type: application/x-amz-json-1.0
Content-Length: <PayloadSizeBytes>
Date: <Date>

{
  "Count": 2,
  "ScannedCount": 2
}
```

> — 출처: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 2.5 AWS 서비스에 액세스하는 네 가지 방법

여러 가지 방법으로 AWS 서비스 및 기능에 액세스할 수 있습니다. **네 가지 방법 모두 AWS 서비스의 REST API에 기반**하며, **모든 액세스 모드를 서로 바꿔 사용할 수 있습니다.**

| 방법 | 설명 |
|---|---|
| **API** | 모든 AWS 서비스는 서비스 기능을 제공하는 전용 API를 지원하며 직접 사용할 수 있습니다. 하지만 요청 형식 지정·해석·직접 응답은 서비스마다 자체 세부 정보가 있어 상당한 작업이 될 수 있습니다 |
| **SDK** | AWS는 프로그래밍 방식 API 사용을 간소화하기 위해 SDK를 만들었습니다. SDK로 요청하면 요청에 자동으로 서명되고, 재시도와 오류도 처리되므로 해당 로직을 직접 작성하지 않아도 됩니다 |
| **AWS Management Console** | AWS가 제공하는 기능 대부분에 대한 풍부한 그래픽 인터페이스를 제공합니다. 다만 콘솔 대신 프로그래밍 방식으로 작업하는 것이 더 효율적인 경우가 많습니다 |
| **AWS CLI** | Linux/macOS 또는 Windows의 명령 프로그램에서 직접 AWS 서비스를 관리합니다. 일관되게 스크립트를 만들어 필요할 때 실행할 수 있습니다 |

관리 콘솔과 AWS CLI는 모두 SDK를 기준으로 만들어졌습니다(교재 슬라이드 11의 다이어그램 화살표 방향).

> 🔄 교재는 슬라이드 11에서 "AWS CLI는 Python SDK를 사용합니다"라고, 슬라이드 20에서 "AWS CLI는 Botocore라는 Python 라이브러리를 사용합니다. AWS Python SDK Boto3 라이브러리는 Botocore를 기반으로 합니다"라고 서로 다르게 기재합니다. 뒤쪽 표현이 더 정확합니다. AWS CLI는 Boto3의 재시도 방법론과 로깅을 사용합니다.

> — 출처: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 2.6 SDK와 서비스 API로 다루는 일반적인 패턴

AWS API를 사용할 때 다음과 같은 일반적인 사용 패턴을 만납니다.

- 애플리케이션에 대한 액세스 권한 부여
- 제한된 대역폭으로 인해 계정에 대한 제한 조정
- 여러 서비스 통합

교재 슬라이드 12 다이어그램에 표시된 패턴 레이블: 사용자 인증 / 기존 버킷 확인 / 스로틀링 조정 / 페이지 매김(Pagination) / 비동기식 호출의 상태 확인 / 데이터 따라가기 / 서비스 통합

**AWS SDK는 이러한 패턴 일부를 포괄하며 간소화합니다.**

다이어그램에 등장하는 서비스: Amazon API Gateway, DynamoDB, Amazon Polly, AWS X-Ray, AWS SAM, Amazon CloudWatch, IAM, Amazon Cognito

---

## 3. AWS SDK

AWS SDK를 통해 애플리케이션에서 선호하는 프로그래밍 언어로 AWS 서비스를 사용할 수 있습니다. 예를 들어 음악 공유 애플리케이션이 사용자의 음악 파일을 S3 버킷에 업로드해야 한다면, AWS SDK를 사용해 프로그래밍 방식으로 업로드할 수 있습니다.

### 3.1 AWS SDK를 사용하는 이유

| 이점 | 설명 |
|---|---|
| 언어 바인딩 | 익숙한 언어의 클래스·메서드로 AWS API를 호출 |
| HTTP 요청 서명 | 서명을 자동으로 계산 |
| 기본 탑재된 복원력 | 재시도·오류·시간 제한 로직 |
| 페이지 매김 지원 | 코드 한 줄로 paginator 사용. 계속 토큰, 루프, 여러 API 호출 로직을 직접 작성하지 않아도 됨 |

요약하면 **익숙한 도구 + 효율성 + 일관성** 입니다. 요청 구문 분석 로직을 작성하거나 API를 직접 사용할 때와 같은 방식으로 재시도 로직을 작성할 필요가 없습니다.

### 3.2 언어별 AWS SDK와 지원 상태 🔄

교재는 SDK 지원 언어를 두 곳에서 서로 다르게 나열하고, 버전별 지원 상태는 다루지 않습니다. 아래는 AWS SDK 및 도구 수명 주기 문서에 등재된 현재 상태입니다.

| SDK | 지원 중인 메이저 버전 | 지원 종료된 메이저 버전 |
|---|---|---|
| SDK for C++ | 1.x | — |
| SDK for Go | V2 1.x | 🔄 1.x |
| SDK for Java | 2.x | 🔄 1.x |
| SDK for JavaScript | 3.x | 🔄 1.x, 2.x |
| SDK for Kotlin | 1.x | — |
| SDK for .NET | 4.x | 🔄 1.x, 2.x, 3.x |
| SDK for PHP | 3.x | 2.x |
| SDK for Python (Boto3 / Botocore) | 1.x | Boto2 1.x |
| SDK for Ruby | 3.x | 1.x, 2.x |
| SDK for Rust | 1.x | — |
| SDK for Swift | 1.x | — |
| AWS CLI | 2.x | 🔄 1.x는 Maintenance Announcement 단계 ([4.2절](#42-aws-cli-v1과-v2)) |
| Tools for PowerShell | 5.x | 2.x, 3.x, 4.x |

교재 목록과 다른 점:

- 교재 강사 노트는 `Android`, `iOS`, `Node.js`를 SDK 언어로 나열합니다. **Node.js는 별도 SDK가 아니라 JavaScript SDK로 지원**되고, Android·iOS는 이 수명 주기 문서 범위(Mobile SDK 제외)에 없습니다.
- 교재 슬라이드 그래픽 목록(Python, .NET, Java, C++, Ruby, JavaScript, Go, Node.js, PHP, Rust, Kotlin, Swift)은 강사 노트 목록과 일치하지 않습니다.
- 교재는 Java·Go·JavaScript·.NET에 대해 **지원이 종료된 버전의 문서**를 인용합니다([8.3절](#83-비권장지원-종료된-항목)).

> — 출처: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html), [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html), [Migrate to v3 of the AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html), [What is the AWS SDK for Go](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html)

#### 현재 유효한 SDK 문서 링크 🔄

교재 강사 노트의 링크 목록 중 일부는 끊어져 있거나 지원 종료 버전을 가리킵니다. 아래가 확인된 현재 경로입니다.

| 언어 | 현재 문서 | 교재 링크 상태 |
|---|---|---|
| Python (Boto3) | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) | 🔄 `boto3.readthedocs.org`(AWS 소유 아님)에서 리디렉션 |
| .NET | [Install AWSSDK packages with NuGet (v4)](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) | 🔄 교재 V3 경로는 **HTTP 404** |
| Java | [AWS SDK for Java 2.x 개발자 안내서](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/) · [API 참조](https://docs.aws.amazon.com/java/api/latest/) | 🔄 교재 API 참조는 1.x javadoc |
| JavaScript | [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html) | 🔄 교재는 v2 API 참조 |
| Go | [AWS SDK for Go V2](https://docs.aws.amazon.com/sdk-for-go/v2/developer-guide/welcome.html) | 🔄 교재는 V1 안내서 |
| PHP | [AWS SDK for PHP v3](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/welcome.html) | 유효 |
| AWS CLI 명령 참조 | [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/) | 🔄 교재의 `pt_br` 로케일 고정 경로는 **HTTP 404** |

> — 출처: [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/), [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html)

### 3.3 SDK 메이저 버전 수명 주기 🆕

교재는 버전 지원 개념을 다루지 않습니다. AWS SDK와 도구의 메이저 버전은 5단계를 거칩니다. 어떤 SDK 버전을 골라야 할지 판단하는 기준이 됩니다.

| 단계 | 이름 | 지원 수준 | 기간 |
|---|---|---|---|
| Phase 0 | Developer Preview | 지원되지 않음. 프로덕션 사용 금지. 조기 액세스·피드백 용도 | — |
| Phase 1 | General Availability (GA) | 완전 지원. 신규 서비스, 기존 서비스 API 업데이트, 버그·보안 수정 정기 릴리스 | **최소 24개월** |
| Phase 2 | Maintenance Announcement | 유지 관리 모드 진입을 **최소 6개월 전**에 공개 발표. 이 기간에도 완전 지원 | — |
| Phase 3 | Maintenance | 중요 버그 수정과 보안 문제만. 신규·기존 서비스 API 업데이트와 신규 리전 미지원 | **기본 12개월** |
| Phase 4 | End-of-Support | 업데이트·릴리스 중단. 기존 릴리스는 패키지 관리자에 계속 제공되고 코드는 GitHub에 남되 리포지토리는 아카이브될 수 있음 | — |

종속성(OS, 언어 런타임, 서드 파티 라이브러리)은 커뮤니티·벤더가 지원을 종료한 뒤 **최소 6개월** 더 지원합니다. 단, AWS는 메이저 버전을 올리지 않고 종속성 지원을 중단할 권리를 보유합니다.

> — 출처: [AWS SDKs and Tools maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html)

### 3.4 하위 수준 API와 상위 수준 API 🔄

| 구분 | 특징 | Python에서의 이름 |
|---|---|---|
| **하위 수준 API** | 서비스 작업당 메서드가 1개. AWS 서비스 API의 직접 매핑. 요청을 완벽하게 제어하고 호출의 동작·성능을 엄격하게 제어 | 서비스 클라이언트 API (`boto3.client`) |
| **상위 수준 API** | 개념적 리소스당 1개의 클래스. 서비스 리소스와 개별 리소스를 정의. 하위 수준 호출보다 높은 추상화 | 리소스 API (`boto3.resource`) |

상위 수준 API의 클래스는 리소스에 대한 데이터 검색, 리소스에서 수행할 수 있는 작업 호출, 다른 관련 리소스에 대한 링크 검색 메서드를 제공합니다. 예를 들어 S3 버킷에 파일을 업로드할 때 상위 수준 API는 파일 크기를 보고 단일 작업으로 업로드할지 여러 부분으로 나눌지 결정합니다.

> **🔄 중요**: 교재는 "일반적으로 상위 수준 API가 작업 수행에 필요한 메서드를 제공하는 경우 간편성 때문에 상위 수준 API를 사용하는 것이 좋습니다"라고 권장하고 예제도 리소스 API를 씁니다. 그러나 **AWS Python SDK 팀은 boto3 리소스 인터페이스에 새 기능을 추가할 계획이 없습니다.** 기존 인터페이스는 boto3 수명 주기 동안 계속 동작하지만, 최신 서비스 기능은 **클라이언트 인터페이스**로 제공됩니다. 신규 코드는 클라이언트 인터페이스를 기준으로 작성하세요.
>
> 🆕 추가 제약: **리소스 인스턴스는 스레드 안전하지 않습니다.** 스레드·프로세스 간에 공유하면 안 되고, 스레드마다 새 세션과 리소스를 만들어야 합니다.
>
> — 출처: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.5 예제: API를 사용하여 서비스에 연결(Python)

하위 수준 API(권장) — 버킷의 객체 나열

```python
# 반환 유형은 dict 입니다. 객체 자체를 가져오려면 추가 API 호출이 필요합니다.
def listClient():
    s3client = boto3.client('s3')
    response = s3client.list_objects_v2(Bucket='mybucket')
    for content in response['Contents']:
        print(content['Key'], content['LastModified'])
```

상위 수준 API — 버킷의 객체 나열 🔄

```python
# 리소스는 AWS에 대한 객체 지향 인터페이스를 나타냅니다. 서비스 클라이언트가
# 호출하는 원시, 하위 수준 호출보다 높은 수준의 추상화를 제공합니다.
# 주의: 리소스 인터페이스에는 새 기능이 추가되지 않습니다. 3.4절을 참조하세요.
def listResource():
    s3resource = boto3.resource('s3')
    bucket = s3resource.Bucket('mybucket')
    for object in bucket.objects.all():
        print(object.key, object.last_modified)
```

> — 출처: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.6 API 버전 잠금

AWS 서비스에는 버전이 지정된 API가 있고, SDK 수준 또는 서비스 수준에서 잠글 수 있습니다. API는 변경될 수 있으므로, 코드가 특정 API 버전에 의존한다면 사용 중인 버전 번호로 서비스를 고정하는 것이 좋습니다. SDK 버전으로 고정할 수도 있지만, 애플리케이션을 최적화하려면 전체 SDK 대신 필요한 구성 요소만 끌어오십시오.

교재 구성 예 (교재 기재):

```ini
[profile development]
aws_access_key_id=foo
aws_secret_access_key=bar
api_versions =
    ec2 = 2015-03-01
    cloudfront = 2015-09-17
```

교재 노트: 이 슬라이드는 .NET 또는 Java에 적용되지 않으므로 강사용 덱에서 숨겨져 있습니다.

> **검증 상태**: 위 `api_versions` 설정을 현재 Boto3 구성 안내서와 AWS CLI 구성·자격 증명 파일 설정 문서에서 **확인하지 못했습니다**([8.5절](#85-검증하지-못한-항목)). 확인된 것은 Boto3의 구성 조회 순서가 **Config 객체 → 환경 변수 → `~/.aws/config`** 라는 점과, `Config` 객체의 `signature_version` 기본값이 Signature Version 4라는 점입니다.

```python
import boto3
from botocore.config import Config

# 클라이언트별 구성은 Config 객체로 전달합니다. 이 값이 환경 변수·config 파일보다 우선합니다.
my_config = Config(
    region_name='us-west-2',
    signature_version='v4',
    retries={
        'max_attempts': 10,
        'mode': 'standard'
    }
)

client = boto3.client('kinesis', config=my_config)
```

> — 출처: [Boto3 Configuration](https://docs.aws.amazon.com/boto3/latest/guide/configuration.html)

---

## 4. AWS Command Line Interface

### 4.1 AWS CLI 실행 위치

터미널 프로그램에서 AWS CLI를 실행하여 AWS 서비스를 사용할 수 있습니다. AWS CLI는 Linux, Windows, macOS에서 사용할 수 있고 Linux·Windows EC2 인스턴스에도 설치할 수 있습니다.

| 구분 | 실행 위치 | 설명 |
|---|---|---|
| 로컬 | Linux 셸 | Linux 또는 macOS에서 bash, zsh, tcsh 같은 일반적 셸 프로그램 |
| 로컬 | Windows 명령줄 | Windows 명령 프롬프트 또는 PowerShell |
| 로컬 | macOS | 터미널 |
| 원격 | SSH/PuTTY를 통해 EC2 | EC2 인스턴스에서 PuTTY 또는 SSH 같은 원격 터미널 프로그램 |
| 원격 | AWS CloudShell | 🆕 브라우저 기반 **사전 인증(pre-authenticated)** 셸. AWS Management Console에서 바로 실행하며, 장기 액세스 키 대안으로 권장됩니다 |
| 원격 | AWS Systems Manager 세션 | Systems Manager를 사용하여 명령 실행 |

AWS CLI는 [AWS Command Line Interface 웹 페이지](https://aws.amazon.com/cli/)에서 다운로드할 수 있습니다.

> — 출처: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 4.2 AWS CLI v1과 v2 🆕

교재는 AWS CLI를 단일 제품으로만 다루고 버전을 구분하지 않습니다. **어느 버전을 설치하는지가 중요합니다.**

| 항목 | AWS CLI v1 | AWS CLI v2 |
|---|---|---|
| 수명 주기 단계 | **Maintenance Announcement** | General Availability (2020년 2월 10일) |
| 유지 관리 모드 진입 | **2026년 7월 15일** | — |
| 지원 종료 | **2027년 7월 15일** | — |
| Python | 시스템 Python 필요 | **Python 내장.** 시스템 전역 Python을 요구하지 않고 상호 작용하지도 않음 |
| 기본 재시도 모드 | `legacy` | `standard` |
| IAM Identity Center 인증 | — | 지원 |
| 대화형 기능 | — | 위저드, 자동 프롬프트(auto-prompt), 서버 측 명령 완성 |
| 출력 | — | 클라이언트 측 페이저 기본 활성화, `yaml`·`yaml-stream` 형식 |
| 자격 증명 관리 | — | `aws login`, `aws configure import`, `aws configure list-profiles` |
| 그 밖의 v2 전용 | — | Docker 이미지, DynamoDB 고수준 `ddb put`·`ddb select`, `aws logs tail`, `s3` 명령의 `--copy-props`, SDK 호환 `AWS_REGION` 환경 변수 |

유지 관리 모드 기간(2026-07-15 ~ 2027-07-14)에는 **중요 버그 수정과 보안 업데이트만** 제공됩니다. AWS CLI v1 자체 변경, 신규 서비스, 기존 서비스 API 업데이트, 리전·엔드포인트 확장은 추가되지 않습니다.

v1으로 백포트되지 않은 v2 기능: 고수준 DynamoDB 명령, SSH 클라이언트를 사용하는 EC2 Instance Connect, CloudWatch Logs Live Tail 대화형 모드

> — 출처: [CLI v1 Maintenance Mode Announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/), [New features and changes in the AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html)

### 4.3 명령 구조 🔄

AWS CLI 명령은 다음 순서의 다중 파트 구조를 **반드시 이 순서로** 지정해야 합니다.

```bash
aws <command> <subcommand> [options and parameters]
```

| 순서 | 구성 요소 | 설명 |
|---|---|---|
| 1 | 기본 호출 | `aws` 프로그램 |
| 2 | **command** | 최상위 명령. 일반적으로 AWS CLI가 지원하는 AWS 서비스에 대응 (예: `s3`, `ec2`, `cloudwatch`) |
| 3 | **subcommand** | 수행할 작업 (예: `ls`, `cp`, `run-instances`, `put-metric-data`) |
| 4 | **options and parameters** | 일반 AWS CLI 옵션 또는 작업에 필요한 파라미터. 앞의 세 부분 뒤에 오는 한 순서는 자유롭고, 배타적 파라미터가 여러 번 지정되면 **마지막 값**이 적용됩니다. 인수 이름 앞에는 대시 2개(`--`)가 붙습니다 |

🔄 교재 슬라이드 20은 `aws s3 ls s3://mybucket --recursive` 에서 `s3://mybucket` 에도 "하위 명령" 레이블을 붙이고, 강사 노트도 "하위 명령은 `s3://mybuket`이 대상인 `ls`"라고 서술합니다. 올바른 분해는 다음과 같습니다.

| 부분 | 값 |
|---|---|
| 기본 호출 | `aws` |
| command(서비스) | `s3` |
| subcommand | `ls` |
| 파라미터 | `s3://mybucket`, `--recursive` |

```bash
# 버킷의 모든 콘텐츠를 재귀적으로 나열
aws s3 ls s3://mybucket --recursive

# 로컬 파일을 버킷으로 복사
aws s3 cp myFile.txt s3://mybucket

# 여러 수준에서 도움 보기
aws help
aws s3 help
aws s3 ls help
```

🆕 `wait` 명령은 구조가 하나 더 깁니다. 모든 서비스가 `wait` 명령을 지원하지는 않습니다.

```bash
aws <command> wait <subcommand> [options and parameters]
```

지원되는 서비스 목록은 [AWS CLI 명령 참조](https://docs.aws.amazon.com/cli/latest/reference/)에서 확인합니다.

> — 출처: [Command structure in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html)

### 4.4 aws configure와 보안 인증 정보 🔄

모든 AWS CLI 명령의 기본값을 설정하려면 AWS CLI를 호스팅하는 머신에서 `aws configure` 명령을 실행합니다. 기본 AWS 리전도 지정할 수 있습니다.

🔄 교재는 "기본적으로 액세스 키 ID와 secret 액세스 키는 AWS 리소스에 액세스하는 데 사용하는 IAM 계정에 연결됩니다"라고만 설명합니다. 현재 AWS CLI 문서는 자격 증명 방법을 **권장 순서**로 제시하며, IAM 사용자 장기 자격 증명은 **권장하지 않습니다.**

| 순위 | 인증 유형 | 용도 |
|---|---|---|
| 1 | **AWS Management Console 자격 증명** (권장) | 콘솔 자격 증명으로 AWS CLI에 로그인해 단기 자격 증명 사용. 루트·IAM 사용자·IAM 페더레이션으로 계정에 접근하는 경우 권장 |
| 2 | IAM Identity Center 워크포스 사용자 단기 자격 증명 | 단기 자격 증명 + 사용자 디렉터리(내장 IAM Identity Center 디렉터리 또는 Active Directory). AWS Organizations와 함께 쓰는 것이 보안 모범 사례 |
| 3 | IAM 사용자 단기 자격 증명 | 장기 자격 증명보다 안전. 유출되어도 만료까지 사용 시간이 제한됨 |
| 4 | EC2 인스턴스 메타데이터 | 인스턴스에 할당된 역할의 임시 자격 증명을 조회 |
| 5 | 역할 수임 | 다른 자격 증명 방법과 짝지어 임시로 다른 권한 획득 |
| 6 | IAM 사용자 **장기** 자격 증명 | **(권장하지 않음)** 만료가 없음 |
| 7 | 외부 저장소 | **(권장하지 않음)** 외부 위치의 보안 수준에 종속 |

🆕 자격 증명·구성 설정의 우선순위(먼저 찾은 값이 이깁니다):

1. 명령줄 옵션 (`--region`, `--output`, `--profile`)
2. 환경 변수
3. 역할 수임
4. 웹 자격 증명 역할 수임
5. AWS IAM Identity Center
6. `credentials` 파일
7. 사용자 지정 프로세스
8. `config` 파일
9. 컨테이너 자격 증명 (Amazon ECS 작업 IAM 역할)
10. Amazon EC2 인스턴스 프로파일 자격 증명

🆕 액세스 키 ID 접두사로 종류를 구분할 수 있습니다.

| 접두사 | 의미 |
|---|---|
| `AKIA` | IAM 사용자 또는 루트 사용자의 **장기** 액세스 키 |
| `ASIA` | AWS STS 작업으로 생성한 **임시** 자격 증명 액세스 키. 만료 시점을 나타내는 보안 토큰을 함께 포함 |

> — 출처: [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

#### 🆕 aws configure 계열 명령

교재는 `aws configure` 한 가지만 소개합니다. 실제로는 하위 명령이 여러 개 있습니다.

| 명령 | 용도 |
|---|---|
| `aws configure` | 대화형으로 액세스 키·리전·출력 형식 설정 |
| `aws configure set` | 개별 설정 값 지정 (`aws configure set region us-west-2 --profile integ`) |
| `aws configure get` | 개별 설정 값 조회 |
| `aws configure list` | 프로파일·액세스 키·리전과 각 값의 **출처(TYPE, LOCATION)** 표시 |
| `aws configure list-profiles` | 프로파일 이름 전체 나열 |
| `aws configure import` | IAM 웹 콘솔에서 생성한 CSV 자격 증명 가져오기. IAM Identity Center용은 아님 |
| `aws configure mfa-login` | MFA와 IAM 사용자 자격 증명으로 임시 자격 증명 프로파일 생성 |
| `aws configure sso` | IAM Identity Center 프로파일 구성 |
| `aws configure sso-session` | `sso-session` 섹션만 구성 |
| `aws configure export-credentials` | 현재 설정된 자격 증명을 지정 형식으로 내보내기 (기본 `process` 형식) |

#### 구성 파일 구조와 캐시

`config`·`credentials` 파일은 세 가지 섹션 유형으로 구성됩니다.

| 섹션 유형 | 형식 | 용도 |
|---|---|---|
| `profile` | config 파일 `[default]`·`[profile user1]` / credentials 파일 `[default]`·`[user1]` | 자격 증명, 리전, 출력 형식. **credentials 파일에는 `profile` 키워드를 쓰지 않습니다** |
| 🆕 `sso-session` | `[sso-session my-sso]` | IAM Identity Center 시작 URL, 리전, 등록 범위 |
| 🆕 `services` | `[services my-services]` | 서비스별 사용자 지정 엔드포인트 |

```ini
[default]
region = us-east-2
output = json

[profile dev]
services = my-services

[sso-session my-sso]
sso_region = us-east-1
sso_start_url = https://my-sso-portal.awsapps.com/start
sso_registration_scopes = sso:account:access

[services my-services]
dynamodb =
  endpoint_url = http://localhost:8000
```

- 공유 프로파일이 IAM 역할을 지정하면 AWS CLI가 AWS STS `AssumeRole`을 호출해 임시 자격 증명을 받고 `~/.aws/cli/cache`에 캐시하며, 만료 시 **자동으로 갱신**합니다.
- IAM Identity Center 인증 토큰은 `~/.aws/sso/cache`에 캐시됩니다.
- 파일 위치는 `AWS_CONFIG_FILE`·`AWS_SHARED_CREDENTIALS_FILE` 환경 변수로 바꿀 수 있습니다.

> — 출처: [Configuration and credential file settings in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

### 4.5 예제: AWS CLI로 Lambda 함수 생성 🔄

교재 예제는 `--runtime nodejs12.x` 를 사용합니다. 이 런타임은 **2023년 3월 31일 지원이 중단되고 같은 날부터 함수 생성이 차단**되었으므로, 예제를 그대로 실행하면 실패합니다.

```bash
# 교재 예제를 현재 지원되는 Node.js 런타임으로 교정한 것입니다.
aws lambda create-function --function-name ProcessDynamoDBRecords \
  --zip-file fileb://function.zip --handler index.handler --runtime nodejs22.x \
  --role arn:aws:iam::123456789012:role/lambda-dynamodb-role
```

| Node.js 런타임 | 식별자 | 상태 |
|---|---|---|
| Node.js 26 | `nodejs26.x` | 지원. 지원 중단 예정 없음 |
| Node.js 24 | `nodejs24.x` | 지원. 2028년 4월 30일 지원 중단 예정 |
| Node.js 22 | `nodejs22.x` | 지원. 2027년 4월 30일 지원 중단 예정 |
| Node.js 20 | `nodejs20.x` | 2026년 4월 30일 지원 중단 |
| Node.js 18 | `nodejs18.x` | 2025년 9월 1일 지원 중단 |
| **Node.js 12** | **`nodejs12.x`** | **2023년 3월 31일 지원 중단. 함수 생성 차단 2023년 3월 31일, 업데이트 차단 2023년 4월 30일** |

AWS는 런타임의 주요 구성 요소가 커뮤니티 장기 지원을 종료해 보안 업데이트를 받을 수 없게 되면 해당 런타임을 지원 중단합니다. 교재 강사 노트의 "헤더의 사용과 보안에 유의하십시오"라는 당부는 여전히 유효합니다. 예제의 `lambda-dynamodb-role`은 권한이 넓으므로 실무에서는 최소 권한으로 좁히세요.

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 4.6 제품 시연: AWS CLI

명령줄 인터페이스에서 AWS 서비스와 연동합니다. 강사 참고 사항: 로컬 터미널, AWS CloudShell 또는 IDE를 사용합니다. 실습 환경에 관한 사항은 [6.3절](#63-aws-cloud9)을 참조하세요.

---

## 5. AWS SDK 프로그래밍 패턴

### 5.1 동기식 작업과 비동기식 작업

| 구분 | 동작 |
|---|---|
| **동기식 / Blocking** | 클라이언트가 요청을 하고 명령이 완료되기를 기다립니다. 서비스에서 응답을 받을 때까지 클라이언트가 프로그램을 계속하는 것을 차단합니다 |
| **비동기식 / Non-Blocking** | 클라이언트가 요청을 하지만 완료를 기다리지 않습니다. 서비스가 응답을 반환하기 전에 클라이언트에 컨트롤을 반환하므로 대기 시간이 긴 작업에 효과적입니다 |

비동기식 호출에서 애플리케이션은 **요청이 수신되었음**을 나타내는 응답을 받고, 요청이 성공할지는 곧바로 알지 못합니다. 따라서 응답이 준비되면 응답을 가져오거나 요청 실패 여부를 확인하는 방법이 필요합니다. 또한 오류와 재시도를 처리하는 복원력이 클라이언트 측에 구축되어 있다고 가정합니다.

교재가 든 예:

| 서비스·작업 | 호출 방식 |
|---|---|
| AWS Lambda | 동기식 또는 비동기식 |
| Amazon S3 → Lambda | 🆕 확인됨. Amazon S3는 객체 세부 정보를 담은 이벤트로 함수를 **비동기식으로** 호출합니다. 버킷에 알림 설정을 구성하고 함수의 리소스 기반 정책에서 S3에 호출 권한을 부여합니다 |
| DynamoDB `CreateTable` | 🆕 확인됨. **비동기 작업**입니다. 요청을 받으면 `TableStatus`가 `CREATING`인 응답을 즉시 반환하고, 생성이 끝나면 `ACTIVE`로 설정합니다. 읽기·쓰기는 `ACTIVE` 상태에서만 가능하고 상태는 `DescribeTable`로 확인합니다 |

> 🆕 주의: Lambda 함수가 자신을 트리거하는 버킷에 객체를 업로드하면 루프가 발생할 수 있습니다. 버킷을 두 개 쓰거나 수신 객체용 접두사에만 트리거를 적용하세요.
>
> 🆕 보조 인덱스를 가진 테이블은 한 번에 하나만 `CREATING` 상태일 수 있으므로, 여러 개를 만들 때는 순차적으로 만들어야 합니다.

요청·응답 예 (DynamoDB `create-table`):

```bash
aws dynamodb create-table --table-name Notes ...
```

```json
{
  "TableDescription": {
    "AttributeDefinitions": [],
    "TableName": "Notes",
    "KeySchema": [],
    "TableStatus": "CREATING",
    "CreationDateTime": "2021-05-19T02:24:56.545000-04:00",
    "ProvisionedThroughput": {},
    "TableSizeBytes": 0,
    "ItemCount": 0,
    "TableArn": "arn:aws:dynamodb:us-east-2:xxx:table/Music",
    "TableId": "dd4d6498-37b3-4d6c-9383-9781196a933b"
  }
}
```

> — 출처: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html), [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 5.2 waiter로 상태 폴링

**waiter** 는 원하는 상태에 도달하거나 그 상태에 도달할 수 없다고 오류에 나타낼 때까지 리소스를 폴링하기 위한 추상화입니다.

비동기식 프로그래밍에서는 서비스 상태를 확인하기 위한 폴링이 필요한 경우가 있습니다. 인프라를 사용하기 전에 준비 여부를 확인해야 하기 때문입니다. waiter 유틸리티는 폴링 태스크를 처리하는 API를 제공하므로, 각 AWS 리소스의 폴링 로직과 특정 폴링 API, 성공 상태를 직접 작성할 필요가 없습니다. 최대 시도 횟수와 각 시도 사이의 백오프 전략으로 waiter를 구성할 수 있습니다.

| 패턴 | 명령 |
|---|---|
| 상태를 가져오기 위해 폴링 | `aws dynamodb describe-table --table-name Notes --query "Table.TableStatus"` |
| ACTIVE가 될 때까지 대기 | `aws dynamodb wait table-exists --table-name Notes` |
| 취소 | `aws cloudformation cancel-update-stack --stack-name myteststack` |

### 5.3 예제: 테이블 상태 확인(.NET)

`CreateTable` 응답에는 초기 테이블 정보를 제공하는 `TableDescription` 속성이 포함되어 있습니다. 언제든지 클라이언트의 `DescribeTable` 메서드를 호출해 최신 테이블 정보를 가져올 수도 있습니다. 아래 예제는 DynamoDB가 테이블 상태를 `ACTIVE`로 설정할 때까지 폴링합니다.

```csharp
// 테이블 이름과 같은 '요청' 정보를 사용하여 테이블 생성
var response = client.CreateTable(request);
var tableDescription = response.TableDescription;

// 테이블의 초기 상태
var status = tableDescription.TableStatus;

while (status != "ACTIVE")
{
    // 테이블이 생성된 후 테이블 상태는 ACTIVE로 설정됨
    System.Threading.Thread.Sleep(5000); // 5초 동안 대기합니다.

    // 최신 테이블 정보를 가져옴
    var describeResponse = client.DescribeTable(new DescribeTableRequest
    {
        TableName = tableName
    });
    Console.WriteLine("Table name: {0}, status: {1}",
        describeResponse.Table.TableName, describeResponse.Table.TableStatus);
    status = describeResponse.Table.TableStatus;
}
```

> 🔄 교재 예제는 같은 블록에서 `var response`를 두 번 선언해 컴파일되지 않습니다. 위 코드는 두 번째 변수를 `describeResponse`로 바꾸고 `status` 선언을 추가한 것입니다. 로직은 교재와 같습니다.
>
> 교재는 예제 출처로 DynamoDB 개발자 안내서의 '.NET에서 DynamoDB 테이블 작업'을 인용하지만, 그 페이지는 현재 [DynamoDB 코드 예제 모음](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html)으로 리디렉션됩니다.
>
> — 출처: [Code examples for DynamoDB using AWS SDKs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html)

### 5.4 예제: Waiter(Python)

```python
# 테이블을 생성하고 준비될 때까지 대기
# 서비스 리소스 가져오기 (리소스 인터페이스는 3.4절의 제약을 참조하세요)
dynamodb = boto3.resource('dynamodb')

# DynamoDB 테이블 생성
table = dynamodb.create_table(
    TableName='Notes',
    # ...
)

# 테이블이 존재할 때까지 대기
table.meta.client.get_waiter('table_exists').wait(TableName='Notes')

# 테이블에 대한 일부 데이터 출력
print(table.item_count)
```

교재가 인용한 Boto3 DynamoDB 안내서는 현재 [docs.aws.amazon.com/boto3/latest/guide/dynamodb.html](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html) 경로입니다.

> — 출처: [Boto3 Amazon DynamoDB guide](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html)

### 5.5 예제: waiter를 사용하여 폴링(Java) 🔄

교재 예제는 AWS SDK for Java **1.x 문법**입니다. 1.x는 2025년 12월 31일 지원이 종료되었습니다. 아래는 2.x 대응 문법입니다.

```java
// AWS SDK for Java 2.x — 동기 waiter
// 1.x 의 client.waiters() 가 아니라 client.waiter() 입니다.
DynamoDbClient client = DynamoDbClient.create();
DynamoDbWaiter waiter = client.waiter();

// 테이블이 존재할 때까지 대기. 요청은 람다(consumer builder)로 지정합니다.
WaiterResponse<DescribeTableResponse> waiterResponse =
        waiter.waitUntilTableExists(r -> r.tableName("myTable"));

waiterResponse.matched().response()
        .ifPresent(System.out::println);
```

```java
// 폴링 구성 — 최대 시도 횟수와 고정 지연 백오프
FixedDelayBackoffStrategy fixedDelayBackoffStrategy =
        FixedDelayBackoffStrategy.create(Duration.ofSeconds(3));

waiter.waitUntilTableExists(r -> r.tableName(tableName),
        c -> c.maxAttempts(10)
              .backoffStrategy(fixedDelayBackoffStrategy));
```

v1과 v2의 대응 관계:

| 항목 | v1 (지원 종료) | v2 |
|---|---|---|
| 패키지 | `com.amazonaws.services.dynamodbv2.waiters` | `software.amazon.awssdk.services.dynamodb.waiters` |
| 클래스 | `AmazonDynamoDBWaiters` | 동기 `DynamoDbWaiter`, 비동기 `DynamoDbAsyncWaiter` |
| 생성 | `client.waiters()` | `client.waiter()` (비동기는 `asyncClient.waiter()`) |
| 대기 | `waiter.tableExists().run(new WaiterParameters<>(new DescribeTableRequest(tableName)))` | `waiter.waitUntilTableExists(r -> r.tableName("myTable"))` |
| 폴링 구성 | `PollingStrategy(MaxAttemptsRetryStrategy, FixedDelayStrategy)` | `c -> c.maxAttempts(10).backoffStrategy(...)` |

waiter 클래스는 서비스와 같은 Maven 아티팩트에 포함되므로 별도 종속성이 필요하지 않습니다.

> 🔄 교재 예제의 `waiter.run(new WaiterParameters<>(new DescribeTableRequest(tableName));` 줄은 닫는 괄호도 하나 빠져 있습니다.
>
> — 출처: [Changes in Waiters from version 1 to version 2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html), [Using waiters in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/waiters.html)

### 5.6 예외 및 오류 처리 🔄

오류가 발생하면 AWS 서비스는 오류 처리 방법을 결정하는 데 사용할 수 있는 **오류 코드**를 반환합니다.

| 오류 클래스 | 대응 |
|---|---|
| 400 시리즈 | **애플리케이션에서 오류를 처리합니다.** 예를 들어 액세스하려는 버킷이 없으면 Amazon S3가 404를 반환하므로, 애플리케이션은 먼저 버킷을 생성한 뒤 작업을 수행합니다 |
| 500 시리즈 | **작업을 재시도합니다.** 내부 서버 오류를 나타냅니다 |

#### AWS SDK for Java 예외 🔄

교재는 예외 클래스명을 `com.amazonaws.AmazonServiceException` / `com.amazonaws.AmazonClientException` 으로 기재하면서 인용 링크는 **2.x 개발자 안내서**를 가리켜 자체 불일치입니다. `com.amazonaws.*` 는 지원이 종료된 1.x 패키지입니다.

| 2.x 예외 | 의미 | 제공하는 정보 |
|---|---|---|
| `AwsServiceException` (`SdkServiceException`의 하위 클래스) | 요청은 서비스에 성공적으로 전달되었으나 처리되지 못하고 오류 응답이 반환됨 | 반환된 HTTP 상태 코드, AWS 오류 코드, `AwsErrorDetails`에 담긴 상세 오류 메시지, 실패한 요청의 AWS 요청 ID |
| 서비스별 하위 클래스 (`S3Exception`, `DynamoDbException`, `SqsException` 등) | 대부분의 경우 이 하위 클래스가 발생하므로 catch 블록에서 세분화된 처리가 가능 | `AwsErrorDetails#errorCode()` 로 서비스 API 참조의 오류 코드 목록을 조회 |
| `SdkClientException` | 요청 전송 또는 응답 파싱 중 Java 클라이언트 코드 내부에서 발생한 문제. 예: 네트워크 연결 없음 | `SdkServiceException`보다 일반적으로 더 심각하며 서비스 호출 자체를 막는 문제를 나타냄 |

Java SDK는 확인된(checked) 예외 대신 **런타임(unchecked) 예외**를 사용합니다. 개발자가 처리하려는 오류만 세밀하게 다룰 수 있게 하고, 대규모 애플리케이션에서 확인된 예외가 유발하는 확장성 문제를 피하기 위한 선택입니다.

> — 출처: [Handling errors in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html)

#### AWS SDK for .NET 예외

.NET용 AWS SDK는 Java와 유사하게 `Amazon.Runtime.AmazonServiceException` 및 `Amazon.Runtime.AmazonClientException`을 발생시킵니다(교재 기재).

#### Boto3 예외 🆕

Boto3에서 만나는 예외는 두 곳에서 옵니다.

| 출처 | 설명 |
|---|---|
| **botocore** | botocore 패키지에 정적으로 정의된 예외. 클라이언트 측 동작·구성·검증 문제와 관련됩니다. 예: `ClientError`, `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, `WaiterError` |
| **AWS 서비스** | 하위 botocore 예외인 **`ClientError`** 로 잡습니다. 잡은 뒤 응답을 파싱해 서비스별 예외를 포함한 세부 정보를 확인합니다 |

교재는 "Boto3 SDK는 오류 발생 시 `botocore.exceptions.ClientError`를 throw합니다"라고만 기재합니다. 자격 증명·파라미터 검증 같은 **botocore 자체 예외가 별도로 존재**한다는 점이 빠져 있습니다.

교재가 인용한 DynamoDB 오류 처리 문서는 현재 [Error handling with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) 경로입니다.

> — 출처: [Boto3 Error handling](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html)

### 5.7 자동 재시도 동작 🆕

교재는 "각 AWS SDK는 자동 재시도 로직을 구현합니다. 최대 재시도 횟수를 구성할 수 있습니다"와 지식 확인 3번 해설의 "지수 백오프와 함께"까지만 기재합니다. 실제로는 **재시도 모드가 세 가지**이고 기본값이 버전마다 다릅니다.

| 모드 | 기본값인 곳 | 최대 시도 | 재시도 대상 | 백오프 |
|---|---|---|---|---|
| **`standard`** | AWS CLI v2 | 재시도 2회 = **총 3회 호출** | 전송 오류(`RequestTimeout`, `ConnectionError`, `HTTPClientError` 등), 서비스 측 스로틀링·한도 예외(`ThrottlingException`, `ProvisionedThroughputExceededException`, `SlowDown` 등), HTTP 500·502·503·504 | 지수 백오프 기본 계수 2, **최대 20초** |
| **`legacy`** | AWS CLI v1 | 재시도 4회 = 총 5회 호출. **DynamoDB는 재시도 9회 = 총 10회** | 소켓·연결 오류와 스로틀링 예외의 **제한된 목록**. HTTP 429·500·502·503·504·509 | 지수 백오프 기본 계수 2 |
| **`adaptive`** | (기본값 아님) | standard와 동일 | standard와 동일 | standard의 모든 기능 + **토큰 버킷 기반 클라이언트 측 속도 제한**. 응답에 따라 속도 제한 변수를 동적으로 갱신 |

> ⚠️ `adaptive`는 **실험적 모드**이며 기능과 동작이 변경될 수 있습니다.

구성 방법:

```ini
# ~/.aws/config
[default]
retry_mode = standard
max_attempts = 6
```

```bash
# 환경 변수로도 지정할 수 있습니다.
export AWS_RETRY_MODE=standard
export AWS_MAX_ATTEMPTS=6
```

`--debug` 옵션으로 재시도 로그를 확인할 수 있습니다. `legacy` 모드는 `botocore.retryhandler`가, `standard`·`adaptive` 모드는 `botocore.retries.standard`가 메시지를 생성합니다.

> — 출처: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 5.8 애플리케이션 파악(관찰 가능성)

시스템을 관찰 가능하게 만드십시오. SDK 또는 서비스의 지표와 로그를 활성화할 수 있습니다.

| 구분 | 내용 |
|---|---|
| SDK 기본 제공 지표 | 4xx/5xx 오류, API 요청 수, 재시도, 제한, 기간, 대기 시간 |
| 로깅 프레임워크 지원 | Log4j, NLog, Log4net |
| Amazon CloudWatch | 대시보드, 로그, 지표, 경보, 이벤트. CPU·메모리·디스크·네트워크 데이터 같은 컴퓨팅 사용률 정보와 진단 정보를 수집·집계·요약 |
| AWS X-Ray | 트레이스, 분석, 서비스 맵. 애플리케이션에 보낸 요청의 엔드투엔드 교차 서비스 뷰를 제공. 개별 서비스에서 수집한 데이터를 **트레이스**(요청이 각 서비스·계층을 통과하는 경로)라는 단일 단위로 집계하고 서비스 맵을 생성 |

🔄 AWS SDK for Java의 지표 활성화 방식이 바뀌었습니다. 교재가 인용한 링크는 현재 **2.x 내용**을 제공하며, 활성화는 시스템 속성이 아니라 **`MetricPublisher` 구현 선택**으로 이루어집니다.

- `CloudWatchMetricPublisher` 는 지표를 CloudWatch로 직접 전송합니다. 데이터 손실 가능성 때문에 **수명이 짧은 Lambda 함수에는 적합하지 않습니다.**
- 지표는 **특정 요청 단위** 또는 **특정 서비스 클라이언트 단위**로 활성화할 수 있고, `cloudwatch-metric-publisher` 아티팩트 종속성이 필요합니다.
- 콘솔로 지표를 출력하는 로깅 퍼블리셔도 있습니다.

교재가 인용한 '.NET 고급 구성' 링크는 아직 [v3 경로](https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/net-dg-advanced-config.html)입니다. .NET SDK 3.x는 지원이 종료되었으므로 v4 안내서를 함께 확인하세요.

> — 출처: [Monitor application performance with SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html)

---

## 6. 통합 개발 환경

### 6.1 IDE를 사용하는 이유

통합 개발 환경(IDE)을 사용하면 애플리케이션용 코드를 작성, 실행, 디버깅할 수 있습니다. 단일 애플리케이션 안에서 필요한 개발자 도구에 액세스할 수 있으므로 생산성이 향상됩니다. 구문 강조 표시, 구문 자동 완성·힌트로 코드 가독성이 높아지고, 컴파일러 또는 인터프리터 및 디버깅 기능으로 코드에 대한 이해를 높일 수 있습니다.

IDE는 로컬에 설치하거나 클라우드 기반일 수 있습니다. 클라우드 기반 IDE의 이점:

- 어떤 컴퓨터나 OS에서도 웹 브라우저를 통해 IDE에 액세스할 수 있습니다.
- 로컬 머신보다 강력한 컴퓨팅 파워로 지원됩니다.
- 새 프로젝트를 위해 또는 신규 개발자 학습을 위해 미리 구성된 개발 환경을 빠르게 가져올 수 있습니다.
- 동일한 코드에서 여러 개발자와 동시에 작업하는 코드 협업이 가능합니다.
- 플랫폼별 SDK를 사용합니다.

### 6.2 AWS IDE 도구 키트 🔄

AWS Toolkit은 여러 IDE에 사용할 수 있으며, AWS를 사용해 애플리케이션의 생성·디버깅·배포를 쉽게 합니다.

🔄 교재 슬라이드 33 그래픽에는 Eclipse, Rider, WebStorm, Visual Studio, PyCharm, IntelliJ, Visual Studio Code, Azure DevOps 레이블이 있습니다. 공식 문서의 "그 밖의 AWS IDE 도구 키트" 안내는 **세 가지**만 나열합니다.

| 도구 키트 | 대상 |
|---|---|
| AWS Toolkit for JetBrains | JetBrains IDE 계열 (JetBrains Marketplace에서 설치) |
| AWS Toolkit for Visual Studio Code | Visual Studio Code. AWS를 사용하는 서버리스 애플리케이션의 개발·로컬 디버깅·배포용 오픈 소스 확장 |
| Toolkit for Visual Studio | Visual Studio |

🆕 JetBrains 도구 키트가 포함하는 개별 도구 키트는 다음과 같습니다. 교재 그래픽은 이 중 세 개(Rider, WebStorm, PyCharm)와 IntelliJ만 표시합니다.

| IDE | 대상 언어·용도 |
|---|---|
| CLion | C · C++ |
| GoLand | Go |
| IntelliJ | Java |
| WebStorm | Node.js |
| Rider | .NET |
| PhpStorm | PHP |
| PyCharm | Python |
| RubyMine | Ruby |
| DataGrip | 데이터베이스 관리 |

도구 키트로 AWS Lambda 함수, AWS CloudFormation 스택, Amazon ECS 클러스터를 다룰 수 있고, AWS 자격 증명 관리와 리전 관리 기능을 제공합니다.

> Eclipse와 Azure DevOps 도구 키트의 현재 상태는 확인하지 못했습니다([8.5절](#85-검증하지-못한-항목)).
>
> — 출처: [Additional IDE Toolkits from AWS](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/downloads.html), [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html), [AWS Toolkit for Visual Studio Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)

### 6.3 AWS Cloud9 🔄

교재 슬라이드 23 강사 노트는 "현재 실습 버전(2026년 9월 24일 기준)에서는 여전히 Python 실습이 Cloud9에 배포되어 있습니다"라고 기재합니다. 이 내용을 그대로 설명하기 전에 알아야 할 점이 있습니다.

**AWS Cloud9은 신규 고객에게 더 이상 제공되지 않습니다.** 기존 AWS Cloud9 고객은 서비스를 계속 정상적으로 사용할 수 있습니다.

| 구분 | 상태 |
|---|---|
| 기존 고객 | 계속 사용 가능. 교육 계정에 이미 배포된 실습 환경은 동작할 수 있습니다 |
| 신규 고객 | **사용할 수 없습니다.** 수강생이 자기 계정에서 Cloud9 환경을 새로 만들 수는 없습니다 |
| AWS가 안내하는 대안 | AWS IDE 도구 키트([6.2절](#62-aws-ide-도구-키트)) 또는 **AWS CloudShell** |

강의에서는 "실습 환경에서는 Cloud9을 쓰지만, 여러분의 계정에서는 만들 수 없습니다"라고 짚어 주는 것이 정확합니다.

> — 출처: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)

### 6.4 Amazon Q Developer와 IDE 플러그인 지원 종료 🆕

교재 슬라이드 34 강사 노트는 "API 및 확장 프로그램 이름 지정에서 이전 AI 어시스턴트의 흔적을 볼 수 있다는 점에 유의하십시오"라고만 언급합니다. 그 '이전 AI 어시스턴트'가 무엇이고 지금 어떤 상태인지 밝혀 두면 수강생 질문에 답할 수 있습니다.

**AWS는 2027년 4월 30일 Amazon Q Developer IDE 플러그인 지원을 중단합니다.** 유사 기능(에이전틱 코딩, 채팅, MCP 지원을 포함한 최신 모델과 기능)을 위해서는 Kiro를 살펴보도록 안내합니다. IDE에서 Amazon Q Developer를 사용해 왔다면 인라인 제안, 채팅, 코드 생성 등 지금 의존하는 기능이 모두 Kiro에서 제공됩니다.

지원 종료 전까지 Amazon Q Developer가 지원하는 IDE와 기능:

| 기능 | VS Code | JetBrains | Eclipse | Visual Studio |
|---|---|---|---|---|
| 채팅 | O | O | O | O |
| 에이전틱 코딩 | O | O | O | O |
| MCP 서버 | O | O | O | O |
| 채팅 컨텍스트 | O | O | O | O |
| 워크스페이스 컨텍스트 | O | O | O | O |
| 인라인 제안 | O | O | O | O |
| 인라인 채팅 | O | O | O | **X** |
| 변환(Transformations) | O | O | **X** | O |

> — 출처: [Amazon Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html), [Using Amazon Q Developer in the IDE](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html)

### 6.5 Kiro: 스펙 기반 개발을 통한 AI 기반 IDE 🔄

이 섹션은 소프트웨어 개발을 가속화하기 위해 설계된 에이전틱 IDE인 Kiro를 다룹니다. Kiro는 개발 워크플로에 지능형 지원을 직접 제공해 더 빠르고, 스마트하고, 효율적인 코딩이 가능하게 합니다.

#### 코딩 어시스턴트에서 개발 오케스트레이터로

교재 슬라이드 35의 정의:

- Code OSS를 기반으로 구축된 AI 기반의 통합 개발 환경
- 스펙 기반 개발 방법론
- 단순 코드 생성이 아닌 완전한 프로젝트 오케스트레이션

개별 프롬프트에 반응하는 사후 대응적인 기존 코딩 어시스턴트와 달리, Kiro는 전체 소프트웨어 개발 프로젝트를 사전 대응적으로 오케스트레이션합니다. 요구 사항 수집부터 배포까지 전체 프로젝트 수명 주기를 관리합니다.

🔄 AWS 공식 문서의 정의는 범위가 더 넓습니다. Kiro는 **AWS의 에이전틱 개발 시스템(agentic development system)** 으로, 의도(intent)를 관리하고 대규모 코드베이스에서 장시간 실행되는 작업을 완료하며, 모든 세션에서 학습하는 고급 에이전트로 코드 정확성을 검증합니다. 개발자와 팀이 AI 코딩에서 엔지니어링으로 넘어가는 격차를 메우는 것이 목표입니다.

🆕 교재는 IDE 형태만 소개하지만, Kiro는 **세 가지 형태**로 제공됩니다.

| 형태 | 설명 |
|---|---|
| IDE | 교재가 다루는 형태 |
| 🆕 CLI | 명령줄 인터페이스 |
| 🆕 자율 웹 에이전트 | autonomous web agent |

> — 출처: [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html)

#### 스펙 기반 개발

개념적 제품 요구 사항과 기술 구현 세부 사항을 연결합니다. 3가지 파일 기반은 AI 에이전트가 사후 대응적인 방식이 아닌, 지능적인 방식으로 작업을 수행하도록 지원하는 계층적 이해력을 형성합니다.

| 파일 | 답하는 질문 | 역할 |
|---|---|---|
| `requirements.md` | 목표 대상 및 **이유(Why)** | 구조화된 구문으로 비즈니스 목표와 성공 기준을 명확히 함 |
| `design.md` | **방법(How)** | AI 에이전트가 체계적으로 준수하며 구현 결정을 내릴 수 있는 기술 아키텍처 청사진 |
| `tasks.md` | **언제, 어떤 순서로(When)** | 비효율적이거나 모순적인 접근을 막는 명확한 구현 경로 |

이 구조는 에이전틱 AI의 핵심 원칙을 나타냅니다. 자율 시스템이 지능적인 결정을 내리려면 명확한 프레임워크와 종합적인 컨텍스트가 필요합니다. '살아 있는 설명서' 같은 특성은 최신 AI가 계획과 구현의 일관성을 유지하는 방법을 보여줍니다.

🆕 AWS Well-Architected Agentic AI Lens는 Kiro 같은 스펙 기반 개발 도구를 권장하며 그 이유를 다음과 같이 설명합니다.

- 사양(specification)은 **에이전트의 동작을 작성자로부터 분리**합니다. 원래 개발자가 떠나도 다음 담당자가 리버스 엔지니어링이 아니라 사양을 통해 시스템을 파악합니다.
- 사양이 사후 작업이 아니라 **출발점**이 되면 문서는 개발의 부산물로 생성됩니다.
- 사양 작성에 들인 초기 투자는 **코드 검토·테스트·이후 진화 과정에서 회수**됩니다. 모든 후속 변경이 명확한 기준선에 대해 이루어지기 때문입니다.

> — 출처: [AGENTSUS03-BP03 (AWS Well-Architected Agentic AI Lens)](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html)

#### 핵심 기능

| 기능 | 설명 |
|---|---|
| 에이전트 스티어링 | 동작 및 의사 결정을 안내하는 구성 파일로 프로젝트별 인텔리전스를 생성해, 특정 분야에 맞게 AI 에이전트를 사용자 지정합니다. 에이전틱 AI는 고정된 동작이 아니라 컨텍스트와 요구 사항에 맞게 조정할 수 있어야 한다는 개념을 나타냅니다 |
| 이중 작동 모드 | **Autopilot(자율)** — AI 에이전트가 전체 기능을 스스로 완료 / **Supervised(사람의 감독)** — 중요한 결정을 사람이 제어. 자율성과 사람의 감독이 균형을 이루어야 함을 보여줍니다 |
| Model Context Protocol(MCP) | 특수 모듈을 통해 기능을 확장하는 방법 |
| 멀티모달 컨텍스트 처리 | 파일, 터미널 출력, 문서를 아우르는 컨텍스트 처리로 코드베이스에 대한 더 풍부하고 완전한 시각을 제공 |

#### Model Context Protocol(MCP) 🔄

교재는 MCP를 "AI 모델을 외부 데이터 소스, 도구 및 시스템에 안전하게 연결할 수 있는 범용 플러그 앤 플레이 방식을 제공하는 오픈 소스 표준"으로 설명합니다. 방향은 맞지만 다음이 빠져 있습니다.

- MCP는 **Anthropic이 도입한 오픈 프로토콜**입니다. AWS가 만든 표준이 아닙니다.
- LLM 애플리케이션과 외부 데이터 소스·도구를 통합해 실시간 정보에 액세스하게 합니다.

🆕 MCP의 세 가지 핵심 프리미티브:

| 프리미티브 | 역할 |
|---|---|
| Resources | 파일·데이터베이스·API 같은 데이터와 콘텐츠를 AI 애플리케이션에 노출 |
| Tools | 티켓 생성, 쿼리 실행, API 호출 같은 작업을 LLM이 실행하게 함 |
| Prompts | 동적 컨텍스트를 담은 재사용 가능한 프롬프트 템플릿 |

🆕 MCP의 이점: 표준화(연결마다 커스텀 통합을 만들 필요 없음), 검색 가능성(수동 구성 없이 사용 가능한 기능을 자동 발견), 보안(프로토콜 수준의 중앙 집중식 인증·인가), 유지 관리성(통합 로직을 한 번 업데이트하면 연결된 모든 AI 애플리케이션이 혜택), 확장성(AI 애플리케이션을 수정하지 않고 새 데이터 소스·도구 추가)

> — 출처: [What is the Model Context Protocol (MCP)?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html)

---

## 7. 개발 환경 설정

### 7.1 AWS SDK 시작하기

AWS SDK를 사용할 수 있도록 개발 환경을 설정하는 단계입니다.

| 단계 | 내용 |
|---|---|
| 1 | 개발 환경 설치 (Java, Python(Boto3), .NET 등) |
| 2 | 특정 언어용 AWS SDK 설치 |
| 3 | AWS 보안 인증 정보 설정 |

AWS SDK로 AWS에 액세스하려면 AWS 계정과 AWS 보안 인증 정보가 필요합니다.

### 7.2 보안 인증 정보 설정 🔄

교재는 "AWS 계정의 보안을 강화하려면 IAM 사용자를 사용하여 액세스 보안 인증 정보를 제공하는 것이 좋습니다. AWS 계정 루트 사용자 보안 인증 정보 대신 IAM 사용자를 사용하십시오"라고 기재합니다.

**루트 사용자보다 IAM 사용자가 낫다는 점은 맞습니다.** 하지만 현재 권장은 IAM 사용자의 **장기 액세스 키**가 아니라 **단기(임시) 자격 증명**입니다. AWS 문서는 IAM 사용자 장기 자격 증명을 "권장하지 않음"으로 분류합니다.

| 방식 | 권장도 |
|---|---|
| 콘솔 자격 증명을 임시 자격 증명으로 사용 | **권장** |
| IAM Identity Center 워크포스 자격 증명의 임시 자격 증명 | 권장 |
| IAM 임시 자격 증명 (AWS STS) | 권장 |
| IAM 사용자 장기 자격 증명 | **권장하지 않음** |

🆕 장기 액세스 키의 대안:

| 대안 | 설명 |
|---|---|
| AWS Secrets Manager 등 시크릿 관리 솔루션 | 애플리케이션 코드나 코드 리포지토리에 장기 액세스 키·secret 키를 넣지 말고, 필요할 때 시크릿을 조회합니다 |
| IAM 역할로 임시 보안 인증 발급 | 가능하면 항상 임시 보안 인증을 발급하는 메커니즘을 사용합니다. 임시 보안 인증은 사용자와 함께 저장되지 않고 요청 시 동적으로 생성되며 수명이 제한되어 관리·갱신이 필요 없습니다 |
| AWS IAM Roles Anywhere | AWS 외부에서 실행되는 머신용 |
| `aws login` (AWS CLI v2) | 콘솔 자격 증명으로 단기 자격 증명을 생성해 AWS CLI 명령을 실행합니다 |
| AWS CloudShell | 브라우저 기반 **사전 인증** 셸. AWS Management Console에서 바로 실행합니다 |

교재 기재 환경 변수는 그대로 유효합니다: 보안 인증은 `AWS_ACCESS_KEY_ID`·`AWS_SECRET_ACCESS_KEY`, 리전은 `AWS_REGION`(🆕 AWS CLI v2에서 SDK 호환 변수로 추가되었고 AWS CLI 전용 `AWS_DEFAULT_REGION`을 재정의합니다).

> — 출처: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)

---

## 8. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 8.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| 상태 코드의 위치 | 슬라이드 7 강사 노트 "서비스가 요청에 응답하면 **요청 헤더**에 상태 및 상태 메시지가 포함됩니다" | 상태 코드와 상태 메시지는 **응답의 시작 줄(status line)** 에 옵니다. 같은 덱 슬라이드 6 노트는 올바르게 기재해 자체 모순이며, 슬라이드 7 예제도 첫 줄이 `HTTP/1.1 200 OK` 입니다 | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| CLI 명령 구조 레이블 | `aws s3 ls s3://mybucket --recursive` 에서 `s3://mybucket` 에도 "하위 명령" 레이블. 노트는 "하위 명령은 `s3://mybuket`이 대상인 `ls`" | 구조는 `aws <command> <subcommand> [options and parameters]`. 하위 명령은 `ls` 하나이고 `s3://mybucket`은 파라미터입니다 | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| SDK 지원 언어 목록 | 강사 노트(Android, iOS, Go, Java, JavaScript, .NET, Node.js, PHP, Python, Ruby)와 슬라이드 그래픽(Python, .NET, Java, C++, Ruby, JavaScript, Go, Node.js, PHP, Rust, Kotlin, Swift)이 불일치 | Node.js는 별도 SDK가 아니라 JavaScript SDK로 지원되고, Android·iOS는 SDK 수명 주기 문서 범위(Mobile SDK 제외)에 없습니다 | [SDK 수명 주기](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| CLI가 사용하는 라이브러리 | 슬라이드 11 "AWS CLI는 Python SDK를 사용합니다" / 슬라이드 20 "Botocore라는 Python 라이브러리를 사용합니다" (서로 다름) | 뒤쪽 표현이 정확합니다. AWS CLI는 Boto3의 재시도 방법론과 로깅을 사용합니다 | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| Java 예외 클래스명과 인용 링크 | 슬라이드 30이 `com.amazonaws.AmazonServiceException`·`com.amazonaws.AmazonClientException`(1.x 패키지)을 기재하면서 링크는 2.x 개발자 안내서 | 2.x 계층은 `AwsServiceException`(`SdkServiceException`의 하위 클래스)과 `SdkClientException` 입니다 | [Java 2.x 오류 처리](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html) |
| .NET 예제 코드 | 슬라이드 27이 같은 블록에서 `var response`를 두 번 선언 | 컴파일되지 않습니다. 두 번째를 `describeResponse`로 바꾸고 `status` 선언을 추가해 교정했습니다 | [DynamoDB 코드 예제](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html) |
| Java waiter 예제 코드 | 슬라이드 29의 `waiter.run(new WaiterParameters<>(new DescribeTableRequest(tableName));` | 닫는 괄호가 하나 빠져 있고, 전체가 지원 종료된 1.x 문법입니다 | [Waiters v1→v2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html) |
| 끊어진 문서 링크 | `AWSSdkDocsNET/latest/V3/DeveloperGuide/net-dg-install-assemblies.html`, `docs.aws.amazon.com/pt_br/cli/latest/index.html` | 두 URL 모두 **HTTP 404** 입니다. 후자는 로케일이 `pt_br`로 고정되어 있습니다 | [CLI 명령 참조](https://docs.aws.amazon.com/cli/latest/reference/), [.NET v4 설치](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) |
| AWS 소유가 아닌 도메인 인용 | Boto3 빠른 시작으로 `boto3.readthedocs.org` 인용 | Boto3 문서는 `docs.aws.amazon.com/boto3/latest/`로 이전되었습니다 | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) |

### 8.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 재전송 공격 방어 기준 | "타임스탬프를 사용하여 도착까지 걸리는 시간이 너무 긴 이벤트를 만료" | 대부분의 경우 요청이 **타임스탬프로부터 5분 이내**에 AWS에 도달해야 합니다. 임시 자격 증명을 쓰면 서명 계산에 보안 토큰이 추가로 필요합니다 | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| 자동 재시도 동작 | "각 AWS SDK는 자동 재시도 로직을 구현합니다" + "지수 백오프와 함께" | 재시도 모드가 `standard`·`legacy`·`adaptive` 세 가지. AWS CLI v2 기본은 `standard`(총 3회 호출, 최대 백오프 20초), v1 기본은 `legacy`(총 5회, DynamoDB 10회) | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| 자격 증명 제공 방식 | "IAM 사용자를 사용하여 액세스 보안 인증 정보를 제공하는 것이 좋습니다" | 권장 순서는 콘솔 자격 증명 기반 단기 자격 증명 → IAM Identity Center → IAM 단기 자격 증명 → EC2 인스턴스 메타데이터 → 역할 수임. **IAM 사용자 장기 자격 증명은 "권장하지 않음"** | [CLI 인증](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [프로그래밍 방식 액세스](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| `aws configure` | 단일 명령으로만 소개 | `set`·`get`·`import`·`list`·`list-profiles`·`mfa-login`·`sso`·`sso-session`·`export-credentials` 하위 명령이 있고, 구성 파일에 `sso-session`·`services` 섹션 유형이 추가되었습니다 | [구성·자격 증명 파일 설정](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| Java SDK 지표 활성화 | 슬라이드 31 링크로 안내 | 링크는 유효하지만 현재 2.x 내용을 제공하며, 활성화 방식이 `MetricPublisher` 구현 선택(`CloudWatchMetricPublisher` 등)으로 바뀌었습니다 | [SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html) |
| 문서 경로 이전 | `boto3.amazonaws.com/v1/documentation/api/latest/...`, `ErrorHandling.html#APIRetries`, `LowLevelDotNetWorkingWithTables.html` | 각각 `docs.aws.amazon.com/boto3/latest/`, `Programming.Errors.html`, `service_code_examples.html`로 리디렉션됩니다 | [Boto3 DynamoDB](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html), [DynamoDB 오류 처리](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) |
| Kiro의 제공 형태 | "Code OSS를 기반으로 구축된 AI 기반의 통합 개발 환경" | AWS의 에이전틱 개발 시스템이며 **IDE, CLI, 자율 웹 에이전트** 세 형태로 제공됩니다 | [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html) |
| MCP의 출처 | "오픈 소스 표준" | **Anthropic이 도입한 오픈 프로토콜**입니다. 세 가지 프리미티브(Resources·Tools·Prompts)로 구성됩니다 | [MCP란?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |

### 8.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS SDK for Java 1.x | **2025년 12월 31일 지원 종료** | AWS SDK for Java 2.x (`software.amazon.awssdk`) | [Java 1.x 지원 종료](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html) |
| AWS SDK for JavaScript v2 | **지원 종료** (1.x·2.x 모두) | AWS SDK for JavaScript v3 | [v3 마이그레이션](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html) |
| AWS SDK for Go V1 | **지원 종료** | AWS SDK for Go V2 | [Go V1 지원 종료](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html) |
| AWS SDK for .NET 3.x | **지원 종료** (1.x·2.x·3.x 모두). 4.x가 2025년 4월 28일 GA | AWS SDK for .NET 4.x | [SDK 수명 주기](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Lambda 런타임 `nodejs12.x` | **2023년 3월 31일 지원 중단.** 같은 날부터 함수 생성 차단, 2023년 4월 30일부터 업데이트 차단 | `nodejs22.x` / `nodejs24.x` / `nodejs26.x` | [Lambda 런타임](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS CLI v1 | Maintenance Announcement 단계. **2026년 7월 15일 유지 관리 모드, 2027년 7월 15일 지원 종료** | AWS CLI v2 | [CLI v1 유지 관리 모드 공지](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/) |
| AWS Cloud9 | **신규 고객에게 제공 중단.** 기존 고객은 계속 사용 가능 | AWS IDE 도구 키트 또는 AWS CloudShell | [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| boto3 리소스 인터페이스 (`boto3.resource`) | 신규 기능 추가 계획 없음. 기존 인터페이스는 계속 동작. 스레드 안전하지 않음 | 클라이언트 인터페이스 (`boto3.client`) | [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html) |
| Amazon Q Developer IDE 플러그인 | **2027년 4월 30일 지원 중단 예정** | Kiro | [Q Developer IDE 플러그인 지원 종료](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html) |
| IAM 사용자 장기 액세스 키 | 권장하지 않음 | 콘솔 자격 증명 기반 단기 자격 증명(`aws login`), IAM Identity Center, IAM 역할·인스턴스 프로파일, IAM Roles Anywhere, AWS CloudShell | [프로그래밍 방식 액세스](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |

### 8.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| SDK 메이저 버전 수명 주기 5단계 | Developer Preview → GA(최소 24개월) → Maintenance Announcement(최소 6개월 전 발표) → Maintenance(기본 12개월) → End-of-Support. 종속성은 벤더 지원 종료 후 최소 6개월 | [SDK 유지 관리 정책](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html) |
| SigV4a | ECDSA 기반 비대칭 서명. 다중 리전 API 요청(예: S3 다중 리전 액세스 포인트)에 필요하며 SDK가 글로벌 엔드포인트 호출에 자동 사용 | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| AWS CLI v2 전용 기능 | Python 내장, 위저드, 자동 프롬프트, IAM Identity Center 인증, 클라이언트 측 페이저, `yaml`·`yaml-stream` 출력, `ddb put`·`ddb select`, `aws logs tail`, `--copy-props`, SDK 호환 `AWS_REGION` | [CLI v2 신규 기능](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html) |
| 액세스 키 접두사 구분 | `AKIA`는 장기 액세스 키, `ASIA`는 STS로 생성한 임시 자격 증명 액세스 키 | [프로그래밍 방식 액세스](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| `aws wait` 명령 구조 | `aws <command> wait <subcommand> [options and parameters]`. 모든 서비스가 지원하지는 않음 | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| 자격 증명 캐시 위치 | 역할 수임 임시 자격 증명은 `~/.aws/cli/cache`, IAM Identity Center 토큰은 `~/.aws/sso/cache`. 만료 시 자동 갱신 | [구성·자격 증명 파일 설정](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| JetBrains 도구 키트의 개별 IDE 목록 | CLion, GoLand, IntelliJ, WebStorm, Rider, PhpStorm, PyCharm, RubyMine, DataGrip | [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| Amazon Q Developer 지원 IDE 매트릭스 | VS Code·JetBrains·Eclipse·Visual Studio. 인라인 채팅은 Visual Studio 미지원, 변환은 Eclipse 미지원 | [IDE의 Amazon Q Developer](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html) |
| 스펙 기반 개발의 근거 | 사양이 에이전트 동작을 작성자로부터 분리하고, 문서가 개발의 부산물로 생성되며, 초기 투자는 코드 검토·테스트·진화 과정에서 회수됨 | [Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html) |
| MCP 프리미티브와 이점 | Resources·Tools·Prompts 세 프리미티브. 표준화·검색 가능성·보안·유지 관리성·확장성 | [MCP란?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |
| botocore 자체 예외 | `ClientError` 외에 `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, `WaiterError` 등 클라이언트 측 예외가 정적으로 정의됨 | [Boto3 오류 처리](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html) |
| DynamoDB `CreateTable` 제약 | 보조 인덱스를 가진 테이블은 한 번에 하나만 `CREATING` 상태일 수 있어 순차 생성 필요 | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| S3 → Lambda 루프 주의 | 함수가 자신을 트리거하는 버킷에 객체를 업로드하면 루프가 발생. 버킷 두 개 또는 접두사 제한 사용 | [S3 이벤트 알림 처리](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html) |

### 8.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| `api_versions` 공유 구성 설정 | 교재 슬라이드 17의 `api_versions` 항목(`ec2 = 2015-03-01` 형태)을 현재 Boto3 구성 안내서와 AWS CLI 구성·자격 증명 파일 설정 문서에서 **찾지 못했습니다.** 검색에서 확인된 API 버전 잠금 문서는 AWS SDK for JavaScript v2의 페이지였고 그 버전은 지원이 종료되었습니다. 본문에는 교재 기재로만 남겼습니다 |
| Eclipse·Azure DevOps 도구 키트 상태 | 교재 슬라이드 33 그래픽의 Eclipse와 Azure DevOps 도구 키트 상태를 확인하지 못했습니다. 공식 "그 밖의 AWS IDE 도구 키트" 안내는 JetBrains·VS Code·Visual Studio 세 가지만 나열하지만, Eclipse 또는 Azure DevOps 도구 키트의 명시적 지원 종료 발표는 찾지 못했습니다. Eclipse가 Amazon Q Developer 지원 IDE 목록에 포함된다는 점은 확인했습니다 |
| CreateBucket HTTP 요청 예제 | 교재 슬라이드 6의 예제(`Date` 헤더와 `Authorization: authorization string`)가 현재 Amazon S3 API 참조의 요청 예제와 일치하는지 확인하지 못했습니다. CreateBucket API 참조를 읽었으나 대조할 수 있는 동일 형태의 예제 블록을 찾지 못했습니다. 교재 예제를 그대로 유지했습니다 |
| DynamoDB 쿼리 응답 예제 | 교재 슬라이드 7의 응답 예제(`x-amzn-RequestId`, `x-amz-crc32`, `Content-Type: application/x-amz-json-1.0`)를 공식 문서로 대조하지 못했습니다. 교재 예제를 그대로 유지했습니다 |
