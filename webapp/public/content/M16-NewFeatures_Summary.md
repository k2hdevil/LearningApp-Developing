# 모듈 16: 교재 이후 신규 기능

## Developing on AWS (한국어)

---

## 목차

1. [이 문서는 무엇인가](#1-이-문서는-무엇인가)
2. [한눈에 보기](#2-한눈에-보기)
3. [지원이 끝난 것](#3-지원이-끝난-것)
4. [권장되지 않는 것](#4-권장되지-않는-것)
5. [이름이 바뀐 것](#5-이름이-바뀐-것)
6. [기본값이 바뀐 것](#6-기본값이-바뀐-것)
7. [수치와 한도가 바뀐 것](#7-수치와-한도가-바뀐-것)
8. [교재 이후 생긴 것](#8-교재-이후-생긴-것)
9. [문서 경로가 바뀐 것](#9-문서-경로가-바뀐-것)
10. [지금 코드를 쓴다면](#10-지금-코드를-쓴다면)
11. [모듈별 색인](#11-모듈별-색인)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다.
> - 검증일: 2026년 8월 25일.
> - **이 모듈에는 원본 강사용 덱이 없습니다.** 교재는 모듈 15로 끝납니다. 이 문서는 모듈 1~15를 작성하면서 모은 `교재 대비 변경 사항` **344건을 한 곳에 종합한 것**입니다. 새 사실을 추가하지 않았고, 각 모듈에서 이미 조회해 기록한 근거를 이어받았습니다.
> - 세 페이지는 이 문서를 쓰면서 **다시 읽어 값을 갱신**했습니다. AWS SDK 수명 주기 표, Lambda 런타임 표, AWS CLI v1 유지 관리 공지입니다. 시간에 따라 값이 바뀌는 페이지이기 때문입니다.
> - 각 항목 끝의 `[M07]` 같은 표시는 그 항목을 자세히 다룬 모듈입니다. 근거와 교재 위치가 그 모듈 문서의 `교재 대비 변경 사항` 장에 있습니다.

---

## 1. 이 문서는 무엇인가

### 왜 만들었나

교재는 2023년 기준입니다. 이 과정을 지금 듣는 사람은 두 가지를 동시에 해야 합니다. 교재 내용을
배우고, 그중 무엇이 지금과 다른지 알아내는 것입니다. 두 번째 일은 모듈별 문서에 흩어져
있어서 전체를 훑기 어렵습니다.

이 문서는 그 흩어진 항목을 **한 화면에서 훑을 수 있게** 모았습니다. 강의 마지막에 "그래서 뭐가
바뀐 건가요"를 한 번에 답하는 용도입니다.

### 어떻게 만들었나

| 단계 | 내용 |
|---|---|
| 입력 | `pipeline/facts/deprecations/M01.yaml` ~ `M15.yaml` (15개 파일, 344개 항목) |
| 분류 | 각 항목의 상태(`incorrect` / `changed` / `discouraged` / `ended`)와 주제로 다시 묶음 |
| 근거 | 각 모듈 작업 중 실제로 조회한 AWS 공식 문서 페이지를 그대로 이어받음 |
| 재확인 | 근거 URL 38개가 2026년 8월 25일에 HTTP 200 으로 응답하는지 확인. 그중 시간에 따라 값이 바뀌는 세 페이지는 다시 읽어 갱신 |

**새로 발견한 사실은 넣지 않았습니다.** 이 문서에 있는 내용은 모두 어느 모듈에서 이미 확인해
기록한 것입니다. 다만 세 페이지를 다시 읽으면서 값이 바뀐 것이 있어 그 부분은 이 문서 기준으로
갱신하고 표시했습니다([3.1절](#31-aws-sdk-메이저-버전), [3.2절](#32-lambda-런타임),
[4.1절](#41-aws-cli-v1)).

### 무엇이 아닌가

| 이 문서가 아닌 것 | 대신 볼 곳 |
|---|---|
| 교재 내용의 요약 | 각 모듈 문서 |
| 항목별 상세 설명 | 각 모듈 문서의 `교재 대비 변경 사항` 장 |
| AWS 신규 서비스 소개 전반 | 이 문서는 **이 과정이 다루는 범위 안에서** 바뀐 것만 다룹니다 |
| 시험 범위 안내 | [모듈 15](#11-모듈별-색인)의 자격증 장 |

---

## 2. 한눈에 보기

### 2.1 모듈별 건수

| 모듈 | 총 | 교재 오류 | 변경 | 비권장 | 지원 종료 |
|---|---|---|---|---|---|
| M01 과정 개요 | 13 | 8 | 4 | 1 | 0 |
| M02 웹 애플리케이션 구축 | 18 | 9 | 8 | 1 | 0 |
| M03 개발 환경 | 16 | 4 | 2 | 5 | 5 |
| M04 권한 부여 | 23 | 7 | 10 | 3 | 3 |
| M05 스토리지 시작 | 8 | 2 | 3 | 2 | 1 |
| M06 스토리지 애플리케이션 | 26 | 10 | 11 | 4 | 1 |
| M07 데이터베이스 시작 | 15 | 6 | 7 | 1 | 1 |
| M08 데이터베이스 애플리케이션 | 25 | 10 | 12 | 2 | 1 |
| M09 컴퓨팅 | 27 | 4 | 15 | 3 | 5 |
| M10 API Gateway | 25 | 12 | 8 | 5 | 0 |
| M11 마이크로서비스 | 15 | 8 | 5 | 1 | 1 |
| M12 액세스 권한 부여 | 32 | 20 | 6 | 5 | 1 |
| M13 배포 | 40 | 26 | 10 | 2 | 2 |
| M14 관찰 | 37 | 21 | 12 | 3 | 1 |
| M15 과정 마무리 | 24 | 7 | 12 | 1 | 4 |
| **합계** | **344** | **154** | **125** | **39** | **26** |

### 2.2 어디를 먼저 봐야 하나

건수가 많다고 중요한 것은 아닙니다. **실습이나 실무에서 바로 막히는 것**을 기준으로 정렬하면
다음 순서입니다.

| 우선 | 항목 | 왜 급한가 | 절 |
|---|---|---|---|
| 1 | Lambda 런타임 지원 종료 | 교재 예제의 런타임으로는 함수 생성이 차단됩니다 | [3.2](#32-lambda-런타임) |
| 2 | AWS SDK 메이저 버전 | 교재 Java·.NET·JavaScript 예제가 지원 종료 버전 문법입니다 | [3.1](#31-aws-sdk-메이저-버전) |
| 3 | X-Ray SDK·콘솔 | 계측 경로와 화면 경로가 모두 바뀌었습니다 | [3.3](#33-aws-x-ray-sdk-와-데몬) · [5.1](#51-화면과-콘솔-경로) |
| 4 | IAM 장기 액세스 키 | 교재의 기본 절차가 현재 모범 사례와 반대 방향입니다 | [4.2](#42-자격-증명) |
| 5 | S3 ACL 기본 비활성화 | 교재 예제가 400 오류로 실패합니다 | [6.1](#61-s3) |
| 6 | DynamoDB 온디맨드가 기본 | 실습 화면이 교재 캡처와 다릅니다 | [6.2](#62-dynamodb) |
| 7 | AWS Cloud9 | 신규 고객에게 제공되지 않습니다. 실습 1 절차의 전제가 무너집니다 | [3.4](#34-개발-도구) |
| 8 | AWS CLI v1 | 2026년 7월 15일부터 유지 관리 모드입니다 | [4.1](#41-aws-cli-v1) |

### 2.3 교재 오류 154건은 무엇인가

가장 많은 유형인데 대부분 **AWS 가 바꾼 것이 아니라 교재 자체의 문제**입니다.

| 성격 | 내용 |
|---|---|
| 교재 내부 모순 | 같은 사실을 슬라이드마다 다르게 적습니다. 모듈 제목, 3대 요소 목록, 목표 문구, 단계 수, 언어 목록 등 |
| 표기 오류 | `Amazon APIGateway`(공백 누락), `code-start`(cold start 오타), `결합`(결함 오타), 이중 공백 |
| 코드 오류 | 컴파일되지 않는 예제, 정의되지 않은 변수 참조, 선언과 사용이 다른 변수 이름, SDK 버전 혼용 |
| 실행되지 않는 명령 | 필수 파라미터 누락, 잘못된 측정 기준, 두 줄로 잘린 CLI 명령 |
| 끊어진 링크 | HTTP 404 를 반환하는 문서 URL |

**AWS 를 배우는 데 방해가 되는 것은 마지막 세 유형입니다.** 코드와 명령을 그대로 따라 하면
실패합니다. 각 모듈 문서는 그 코드를 교정해 싣고 무엇을 고쳤는지 표로 밝혔습니다.

---

## 3. 지원이 끝난 것

### 3.1 AWS SDK 메이저 버전

**이 문서를 쓰면서 다시 읽은 표입니다.** 값이 M03 작업 시점과 달라졌습니다.

AWS SDK 및 도구 수명 주기 표에서 현재 `End-of-Support` 단계인 항목입니다.

| SDK | 지원 종료된 메이저 버전 | 대체 |
|---|---|---|
| SDK for Java | **1.x** | 2.x (`software.amazon.awssdk`) |
| SDK for JavaScript | **1.x, 2.x** | v3 |
| SDK for .NET | **1.x, 2.x, 3.x** 🔄 | 4.x |
| SDK for Go | **1.x** | V2 |
| SDK for PHP | 2.x | 최신 메이저 버전 |
| SDK for Python (Boto2) | 1.x | Boto3 |
| SDK for Ruby | 1.x, 2.x | 최신 메이저 버전 |
| Tools for PowerShell | 2.x, 3.x, **4.x** 🔄 | 최신 메이저 버전 |

> **🔄 갱신된 부분.** M03 작업 시점에는 `.NET 3.x` 가 지원 종료, `4.x` 가 일반 제공이었고
> `Tools for PowerShell 4.x` 는 표에서 지원 종료로 표시되지 않았습니다. 이 문서를 쓰면서 표를
> 다시 읽은 결과 두 항목 모두 `End-of-Support` 로 나와 있습니다. **이 표는 시간에 따라
> 바뀌므로 실제 채택 전에 원문을 다시 확인하세요.**

교재에 이것이 왜 문제인가.

| 교재 위치 | 문제 | 모듈 |
|---|---|---|
| Java 예제 다수 | `com.amazonaws` 패키지, `AmazonDynamoDB`, `DynamoDBMapper`, Document API(`dynamoDB.getTable`), waiter(`client.waiters()`) 가 모두 1.x 문법 | [M03] [M05] [M06] [M07] [M08] |
| .NET 예제 다수 | 동기 메서드(`client.PutBucket`, `client.CreateTable`) 호출. .NET Core·.NET Standard 대상에서는 비동기만 지원 | [M06] [M08] |
| JavaScript API 참조 링크 | `AWSJavaScriptSDK/latest` 는 v2 경로 | [M03] |
| SDK 설치 링크 2건 | HTTP 404 | [M03] |

**같은 교재 안에서 버전이 섞여 있는 것이 더 큰 문제입니다.** 예를 들어 M06 슬라이드 8·12·27·35
는 2.x 문법인데 슬라이드 11·21·33 은 1.x 문법입니다. M08 도 슬라이드 13~14·18·41~42 가 2.x,
19~20 이 1.x 입니다. 어느 쪽을 따라야 하는지 교재가 알려 주지 않습니다.

> — 출처: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

> — 출처: [AWS SDK for Java 1.x](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html)

> — 출처: [Migrating to the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html)

> — 출처: [AWS SDK for Go V1](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html)

> — 출처: [Programming with DynamoDB and the AWS SDK for Java](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 3.2 Lambda 런타임

**이 표도 다시 읽었습니다.** 교재가 쓰는 런타임과 그 상태입니다.

| 교재가 쓰는 런타임 | 교재 위치 | 지원 종료일 | 함수 생성 차단 | 함수 업데이트 차단 | 모듈 |
|---|---|---|---|---|---|
| `nodejs12.x` | M03 슬라이드 21 `create-function` 예제 | 2023-03-31 | 2023-03-31 | 2023-04-30 | [M03] |
| `python3.8` | M09 슬라이드 34, M13 슬라이드 14·15·22 | 2024-10-14 | 2027-02-01 | 2027-03-03 | [M09] [M13] |
| `python3.9` | M13 슬라이드 21 `sam build` 출력 | 2025-12-15 | 2027-02-01 | 2027-03-03 | [M13] |
| `.NET Core` 계열 | M09 슬라이드 10·48 | dotnetcore3.1 은 2023-04-03, 그 이전 버전은 더 앞 | — | — | [M09] |
| `go1.x` | M09 슬라이드 10 | 2024-01-08 | 2024-02-08 | — | [M09] |

**`nodejs12.x` 는 이미 함수 생성이 차단되었습니다.** M03 슬라이드 21 의 `create-function` 예제를
그대로 실행하면 실패합니다.

**`python3.8` 과 `python3.9` 는 지원 종료되었지만 함수 생성이 아직 차단되지 않았습니다**
(2027년 2월 1일 예정). 즉 M13 의 SAM 템플릿과 `sam init --runtime python3.8` 은 지금 동작하지만
지원 종료된 런타임을 쓰게 됩니다.

현재 관리형 런타임입니다.

| 언어 | 식별자 | 지원 종료 예정일 |
|---|---|---|
| Node.js 26 | `nodejs26.x` | 미예정 |
| Node.js 24 | `nodejs24.x` | 2028-04-30 |
| Node.js 22 | `nodejs22.x` | 2027-04-30 |
| Python 3.15 | `python3.15` | 미예정 |
| Python 3.14 | `python3.14` | 2029-06-30 |
| Python 3.13 | `python3.13` | 2029-06-30 |
| Python 3.12 | `python3.12` | 2028-10-31 |
| Python 3.11 | `python3.11` | 2027-06-30 |
| Python 3.10 | `python3.10` | 2026-10-31 |

> **🆕 M09 작업 이후 새로 지원 종료된 것이 있습니다.** `nodejs20.x` 는 2026년 4월 30일,
> `nodejs18.x` 는 2025년 9월 1일에 지원이 종료되었습니다. `python3.10` 도 2026년 10월 31일로
> 종료 예정입니다. **표의 예정일은 계획 목적이며 변경될 수 있으므로 채택 전에 원문을 다시
> 확인하세요.**

Go 와 Rust 는 관리형 런타임이 아니라 **OS 전용 런타임 `provided.al2023`** 으로 실행합니다. Lambda
가 Go 를 계속 지원한다는 점은 그대로이고 실행 방식만 달라졌습니다.

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.3 AWS X-Ray SDK 와 데몬

이 과정 마지막 실습(실습 7)의 도구입니다.

| 단계 | 기간 | 제공되는 지원 |
|---|---|---|
| 일반 제공(GA) | ~ 2026년 2월 25일 | 완전 지원. 버그·보안 수정 포함 정기 릴리스 |
| 유지 관리 모드 | 2026년 2월 25일 ~ | **보안 문제 해결 릴리스만.** 새 기능 개선 없음 |

종료(end of support) 일자는 공지되지 않았으므로 **SDK 가 작동을 멈춘 것은 아닙니다.** 교재
슬라이드 26·33·34 의 계측 코드는 지금도 동작합니다. 다만 새 기능이 들어오지 않고, AWS 는
OpenTelemetry 로 옮기도록 안내합니다([4.4절](#44-계측과-트레이싱)). [M14]

> — 출처: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

### 3.4 개발 도구

| 항목 | 상태 | 대체 | 모듈 |
|---|---|---|---|
| **AWS Cloud9** | 신규 고객에게 더 이상 제공되지 않습니다. 기존 고객은 계속 사용할 수 있습니다 | AWS IDE 툴킷(VS Code · JetBrains · Visual Studio) 또는 AWS CloudShell | [M03] [M04] |
| **AWS Toolkit for Eclipse** | 별도 사용 설명서가 더 이상 제공되지 않습니다. `toolkit-for-eclipse/v1/user-guide/` 경로 전체가 JetBrains 툴킷 문서로 리디렉션됩니다 | JetBrains · Visual Studio · VS Code 용 AWS Toolkit | [M04] [M09] |
| **AWS Step Functions Local** · 데이터 흐름 시뮬레이터 | 공식 문서가 기능 동등성을 제공하지 않으며 **지원되지 않는다(unsupported)** 고 명시합니다. 최적화 서비스 통합, 크로스 계정 액세스, 분산 맵을 지원하지 않습니다 | `TestState` API 또는 콘솔의 Test State. VS Code 용 AWS Toolkit 의 Workflow Studio | [M11] |

**AWS Cloud9 이 실습에 미치는 영향이 큽니다.** 교재는 실습 1 을 "AWS Cloud9 을 사용하여 개발
환경에서 IAM 권한을 구성하고 테스트합니다"로 소개하고, 강사 참고 사항은 Python 실습이 여전히
Cloud9 에 배포되어 있다고 적습니다. **교육 계정에 이미 배포된 환경은 동작할 수 있지만, 수강생이
자기 계정에서 Cloud9 환경을 새로 만들 수는 없습니다.**

> — 출처: [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)

> — 출처: [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

> — 출처: [Tools to develop, deploy, and manage Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

> — 출처: [Testing and debugging in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/test-and-debug.html)

### 3.5 서비스와 기능

| 항목 | 상태 | 대체 | 모듈 |
|---|---|---|---|
| **Amazon Cognito Sync** | 신규 고객에게 더 이상 제공되지 않습니다. 기존 고객 워크로드는 중단 없이 계속 쓸 수 있지만 새 기능 개발이 없습니다 | AWS AppSync(GraphQL 기반 실시간 동기화) 또는 Amazon DynamoDB | [M12] |
| **AWS Certified Machine Learning – Specialty** | 제공 종료. 마지막 응시일 2026년 3월 31일 | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional | [M15] |
| **AWS Certified Data Analytics – Specialty** | 제공 종료. 마지막 응시일 2024년 4월 8일 | AWS Certified Data Engineer – Associate | [M15] |
| **AWS Certified Database – Specialty** | 제공 종료. 마지막 응시일 2024년 4월 29일 | — | [M15] |
| **AWS Certified: SAP on AWS – Specialty** | 제공 종료. 마지막 응시일 2024년 4월 29일 | — | [M15] |

교재 M12 에 Cognito Sync 는 등장하지 않습니다. 다만 자격 증명 풀 콘솔에 관련 기능이 남아 있고
오래된 자료가 자격 증명 풀과 함께 소개하므로 상태를 밝혀 두었습니다. **신규 프로젝트에서는 쓸
수 없습니다.**

> — 출처: [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html)

> — 출처: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

---

## 4. 권장되지 않는 것

지원이 끝난 것과 다릅니다. **지금도 동작하지만 AWS 가 다른 경로를 권장합니다.** 교재 내용이
틀린 것이 아니라 권장 순서가 달라진 경우가 많습니다.

### 4.1 AWS CLI v1

**이 항목도 다시 읽었고 상태가 바뀌었습니다.**

| 단계 | 기간 | 지원 수준 |
|---|---|---|
| 일반 제공 | 2015-11-19 ~ 2026-07-14 | 완전 지원 |
| **유지 관리 모드** | **2026-07-15 ~ 2027-07-14** | 중요 버그 수정과 보안 업데이트만. 신규·기존 서비스의 API 업데이트와 신규 리전 미반영 |
| 지원 종료 | 2027-07-15 ~ | 업데이트·릴리스 없음. 기존 릴리스는 패키지 관리자에 계속 남고 코드는 GitHub 에 유지 |

> **🔄 갱신된 부분.** M03 작업 시점에는 유지 관리 모드 진입이 **예정**이었습니다. 검증일
> 2026년 8월 25일 기준으로 **이미 유지 관리 모드에 들어갔습니다.**

교재는 슬라이드 19·20 에서 AWS CLI 를 버전 구분 없이 단일 제품으로 설명합니다. 그래서 수강생이
어느 버전을 설치해야 하는지 알 수 없습니다. [M03]

v2 에만 있고 v1 로 백포트되지 않은 기능입니다.

| 기능 |
|---|
| 고급 DynamoDB 명령 |
| SSH 클라이언트를 사용한 EC2 Instance Connect |
| CloudWatch Logs Live Tail 의 대화식 모드 |

v2 의 그 밖의 특징은 Python 내장(시스템 Python 과 무관), 서버 측 명령 완성·자동 프롬프트·위저드,
`aws login` 을 통한 단순화된 개발자 액세스, IAM Identity Center 인증, 프로파일·자격 증명 관리를
위한 `aws configure` 하위 명령입니다.

> — 출처: [AWS CLI v1 maintenance mode announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/)

> — 출처: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

### 4.2 자격 증명

**교재의 기본 절차가 현재 모범 사례와 방향이 반대입니다.** 이 항목이 가장 중요합니다.

| 교재 | 현재 권장 | 모듈 |
|---|---|---|
| IAM 사용자를 만들고 `aws configure` 로 액세스 키를 `~/.aws/credentials` 에 저장하는 것을 개발 환경 구성의 **기본 절차**로 제시 | 사람 사용자는 자격 증명 공급자와의 **페더레이션으로 임시 보안 인증 정보**를 씁니다. 중앙 집중식 액세스 관리에는 **AWS IAM Identity Center** 를 권장합니다. 워크로드는 **IAM 역할**의 임시 자격 증명을 씁니다 | [M03] [M04] |

AWS CLI 자격 증명 권장 순서입니다. **IAM 사용자 장기 자격 증명은 "권장하지 않음"으로 분류됩니다.**

| 순위 | 방법 |
|---|---|
| 1 | 콘솔 자격 증명 기반 단기 자격 증명 (`aws login`) |
| 2 | IAM Identity Center |
| 3 | IAM 단기 자격 증명 |
| 4 | EC2 인스턴스 메타데이터 |
| 5 | 역할 수임 |

장기 액세스 키는 **IAM 역할을 쓸 수 없는 워크로드 등 예외 사용 사례로 한정**됩니다. JetBrains
툴킷 문서도 "목적이 있는 소프트웨어를 개발하거나 실제 데이터를 다룰 때는 IAM 사용자로 인증하지
말라"고 명시합니다.

**루트 사용자 액세스 키는 만들지 않도록 강력히 권장됩니다.** 루트 사용자는 청구 정보를 포함해
계정의 모든 서비스·리소스에 완전한 액세스 권한을 갖기 때문입니다. 교재는 루트 사용자를 보안
주체 목록과 역할 예시 다이어그램에 등장시키지만 보호 방법을 다루지 않습니다. 모든 계정
유형(독립 실행형·관리·멤버)이 루트 사용자에 MFA 를 구성해야 하고, MFA 가 없으면 첫 콘솔 로그인
시도로부터 **35일 이내에 등록**해야 합니다. [M04]

> — 출처: [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)

> — 출처: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

> — 출처: [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### 4.3 SDK 사용 방식

| 항목 | 왜 권장되지 않나 | 대체 | 모듈 |
|---|---|---|---|
| **boto3 리소스 인터페이스** | AWS Python SDK 팀은 리소스 인터페이스에 **새 기능을 추가할 계획이 없습니다.** 기존 인터페이스는 boto3 수명 주기 동안 계속 동작하지만 최신 서비스 기능은 클라이언트 인터페이스로 제공됩니다. 리소스 인스턴스는 **스레드 안전하지 않아** 스레드·프로세스마다 새로 만들어야 합니다 | `boto3.client(...)` | [M03] [M05] [M06] [M07] [M08] [M09] |
| **SDK 재시도 `legacy` 모드** | `standard` 모드 도입 전 각 SDK 의 동작입니다. **표준 재시도 할당량이 없어 서비스 장애 중에도 전속력으로 재시도를 계속합니다.** 재시도 횟수·백오프 타이밍·재시도 대상 오류·스로틀링 동작이 언어마다 다릅니다 | `standard` 모드 (`retry_mode=standard` / `AWS_RETRY_MODE=standard`) | [M04] |

**boto3 리소스 인터페이스는 이 과정에서 가장 널리 퍼진 비권장 항목입니다.** 여섯 모듈의 Python
예제가 이 인터페이스를 씁니다. 교재는 M03 에서 "간편성 때문에 상위 수준 API 를 사용하는 것이
좋다"고 권장하기까지 합니다.

M07 에 특히 헷갈리는 지점이 있습니다. 교재 슬라이드 33 의 Python **상위 수준** 칸이 비어 있는
이유가 바로 이것입니다. boto3 의 DynamoDB 상위 수준 인터페이스가 곧 리소스
인터페이스(`boto3.resource('dynamodb')` 와 `dynamodb.Table`)이기 때문입니다. 같은 교재 슬라이드
36 은 `boto3.client('dynamodb')` 를 만들면서 바로 위 주석에 "서비스 리소스 가져오기"라고 적어
두 인터페이스를 혼동시킵니다.

`legacy` 재시도 모드는 Java · Python · Ruby · PHP · C++ · CLI 에만 존재하고 .NET · Go · Kotlin ·
Rust · Swift · JavaScript 에는 없습니다.

> — 출처: [Boto3 resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

> — 출처: [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 4.4 계측과 트레이싱

| 항목 | 왜 권장되지 않나 | 대체 | 모듈 |
|---|---|---|---|
| **X-Ray SDK** | X-Ray 가 기본 계측 표준을 OpenTelemetry 로 전환하고 있고 AWS 가 OpenTelemetry 채택을 권장합니다 | AWS Distro for OpenTelemetry(ADOT), CloudWatch Application Signals, CloudWatch OTel 엔드포인트 | [M14] |
| **X-Ray 데몬** | SDK 와 같은 유지 관리 일정을 따르고 문서가 마이그레이션을 안내합니다 | CloudWatch 에이전트 또는 OpenTelemetry Collector | [M14] |
| **코드에 포함한 JSON 로컬 샘플링 규칙** | 인스턴스마다 독립 샘플링해 전체 비율이 올라가고, 규칙 변경에 재배포가 필요합니다 | X-Ray 서비스에 정의한 샘플링 규칙 | [M14] |
| **X-Ray 콘솔** | AWS 가 더 이상 개발하지 않습니다. 화면 경로가 CloudWatch 콘솔로 옮겨졌습니다 | CloudWatch 콘솔의 X-Ray traces → Trace Map | [M01] [M02] [M14] |

> — 출처: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — 출처: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 4.5 스토리지와 데이터베이스

| 항목 | 왜 권장되지 않나 | 대체 | 모듈 |
|---|---|---|---|
| **경로 스타일 S3 요청** (`addressing_style = path`) | 모든 리전에서 계속 동작하지만 **향후 중단될 예정**입니다. 브라우저에서 접근하는 웹사이트 콘텐츠에는 동일 출처 보안 모델과 충돌할 수 있습니다 | 가상 호스팅 스타일 URL(SDK 기본값). 웹 콘텐츠는 S3 웹사이트 엔드포인트 또는 CloudFront | [M05] |
| **S3 Object Lambda** | 2025년 11월 7일부터 **이미 사용 중인 기존 고객과 일부 선정된 파트너에게만** 제공됩니다. AWS 는 보안·가용성 개선은 계속하지만 **새 기능을 도입할 계획이 없다**고 밝혔습니다 | Dynamic Image Transformation for Amazon CloudFront 솔루션, CloudFront·API Gateway·Lambda 함수 URL 로 Lambda 직접 호출, 클라이언트에서 처리 | [M06] |
| **`get_paginator('list_objects')`** | v1 작업의 paginator 입니다. S3 API 문서는 애플리케이션 개발에 `ListObjectsV2` 를 쓰도록 권장합니다 | `client.get_paginator('list_objects_v2')` | [M06] |
| **Reduced Redundancy 스토리지(RRS)** | AWS 는 RRS 사용을 권장하지 않으며 **S3 Standard 가 더 비용 효율적**이라고 명시합니다. RRS 객체는 연간 평균 0.01% 손실을 예상하도록 설계되었고 손실된 객체를 요청하면 405 오류가 반환됩니다 | S3 Standard 유지, 또는 Standard-IA·Glacier 계열 | [M06] |
| **DynamoDB 레거시 조건 파라미터** | AWS 는 표현식 파라미터 사용을 권장하고, 한 호출에서 레거시와 표현식을 섞어 쓰면 오류가 발생합니다 | `AttributesToGet`→`ProjectionExpression`, `Expected`→`ConditionExpression`, `KeyConditions`→`KeyConditionExpression`, `QueryFilter`·`ScanFilter`→`FilterExpression`, `AttributeUpdates`→`UpdateExpression` | [M08] |

**S3 Object Lambda 는 교재가 누구나 시작할 수 있는 일반 기능으로 소개합니다.** 개념 설명 목적으로
는 유지하되 **신규 설계의 권장 경로로 제시하면 안 됩니다.**

DynamoDB 레거시 조건 파라미터는 **교재에 등장하지 않습니다.** 교재 예제는 모두 표현식 기반이고
그것이 현재 권장 사항과 일치합니다. 다만 오래된 코드를 유지 보수할 때 만나게 되므로 등재했습니다.

> — 출처: [Virtual hosting of buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

> — 출처: [S3 Object Lambda availability change](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html)

> — 출처: [ListObjects](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html)

> — 출처: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

> — 출처: [Legacy conditional parameters](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html)

### 4.6 API Gateway

교재가 다섯 슬라이드에 걸쳐 설명하는 것이 현재 권장 순서에서 마지막입니다.

| 항목 | 교재 | 현재 권장 | 모듈 |
|---|---|---|---|
| **데이터 변환** | 요청·응답 처리를 매핑 템플릿 중심으로 다섯 슬라이드에 설명 | ① 프록시 통합 → ② 파라미터 매핑(VTL 불필요) → ③ 매핑 템플릿 변환. 문서는 "가능하면 REST API 에 프록시 통합을 쓰라"고 권장 | [M10] |
| **API 키** | 개발자 기능으로 제시하고 "API 키가 메서드를 호출하게 하려면 `API Key Required` 를 true 로 설정" | 모범 사례는 **"API 액세스를 제어하는 인증·권한 부여에 API 키를 쓰지 말라"** 입니다. 액세스 제어는 IAM 역할 · Lambda 권한 부여자 · Cognito 사용자 풀. API 키는 클라이언트 식별과 사용량 계획 연결에만 | [M10] |
| **사용량 계획 할당량** | "합의된 요청 속도와 할당량을 바탕으로 API 에 액세스" | 제한과 할당량은 **하드 한도가 아니라 best-effort** 로 적용되므로 클라이언트가 초과할 수 있습니다. 비용 통제나 액세스 차단에 의존하지 말고 비용은 AWS Budgets, 요청 차단은 AWS WAF 를 쓰세요 | [M10] |
| **스테이지 변수** | 용례로 "구성을 Lambda 함수로 전달" | 스테이지 변수는 **자격 증명 같은 민감한 데이터에 쓰도록 의도된 것이 아닙니다.** 민감한 데이터가 필요하면 Lambda 권한 부여자의 출력을 쓰세요 | [M10] |
| **Data tracing** | canary 스테이지에서 "CloudWatch 를 이용한 로깅을 활성화합니다" (수준 구분 없음) | Data tracing 은 **민감한 데이터가 로깅될 수 있어 프로덕션 API 에는 쓰지 않도록 권장**됩니다. 실행 로깅은 `ERROR` 또는 `INFO` 수준으로 | [M10] |
| **Lambda 권한 부여자 `TOKEN` 유형** | 토큰 기반과 요청 파라미터 기반을 우열 없이 제시 | 문서는 여러 자격 증명 소스를 쓸 수 있고 캐시 키를 분리할 수 있다는 이유로 **`REQUEST` 권한 부여자를 권장**합니다 | [M12] |

**API 키를 액세스 제어에 쓰면 안 되는 이유가 구체적입니다.** 한 사용량 계획에 여러 API 가 있으면
그중 한 API 의 유효한 API 키를 가진 사용자가 **그 계획의 모든 API 에 액세스할 수 있기**
때문입니다.

> — 출처: [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)

> — 출처: [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)

> — 출처: [Stage variables](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)

> — 출처: [Set up CloudWatch logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

> — 출처: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

### 4.7 인증과 인가

| 항목 | 왜 권장되지 않나 | 대체 | 모듈 |
|---|---|---|---|
| **암묵적 흐름(implicit grant)** | 공식 문서가 **레거시 권한 부여 그랜트**로 명시합니다. 사용자가 토큰을 가로채 검사할 수 있고, refresh 토큰을 발급하지 않으며 PKCE 와 호환되지 않습니다 | 권한 부여 코드 그랜트 + PKCE. 퍼블릭 클라이언트에서는 권한 부여 코드 그랜트만 활성화 | [M12] |
| **자격 증명 풀 basic(classic) 흐름** | 문서는 **enhanced 흐름이 개발자 노력이 가장 적은 가장 안전한 선택**이라고 명시하고, 새 자격 증명 풀에 basic 인증을 기본으로 활성화하지 않는 것을 모범 사례로 제시합니다 | enhanced 흐름 (`GetId` → `GetCredentialsForIdentity`) | [M12] |
| **`UnusedAccountValidityDays`** | 레거시 파라미터입니다. 사용자 풀에 `TemporaryPasswordValidityDays` 를 설정하면 이 파라미터에 더 이상 값을 설정할 수 없습니다 | `TemporaryPasswordValidityDays` (기본 7일, 0~365) | [M12] |
| **개발자 속성(`dev:` 접두사)** | 앱 클라이언트 읽기·쓰기 권한으로 **Amazon Cognito 가 대체한 레거시 기능**입니다 | 앱 클라이언트별 속성 읽기·쓰기 권한(`ReadAttributes` / `WriteAttributes`) | [M12] |
| **Map 상태의 `Iterator`·`Parameters` 필드** | 두 필드 모두 **사용이 중단(deprecated)** 되었습니다. 문서는 기존 정의가 계속 동작하지만 새 필드로 바꾸도록 강력히 권장합니다 | `Iterator` → `ItemProcessor`, Map 안의 `Parameters` → `ItemSelector` | [M11] |

교재는 세 OAuth 그랜트를 아무런 우열 없이 나란히 제시합니다. **퍼블릭 클라이언트 앱의 보안
모범 사례는 권한 부여 코드 그랜트만 활성화하고 PKCE 를 구현하는 것입니다.**

> — 출처: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

> — 출처: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

> — 출처: [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html)

> — 출처: [User pool attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

> — 출처: [Map state (inline)](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-inline.html)

### 4.8 배포와 컴퓨팅

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| **`sam package` 를 별도 단계로** | 배포 전에 `sam package` 로 아티팩트를 만들고 S3 버킷 이름을 직접 넘김 | `sam deploy` 가 **`sam package` 의 기능을 암시적으로 수행**합니다. 버킷을 자동 생성하려면 `--resolve-s3` 를 쓰고 `--s3-bucket` 과 함께 지정하면 오류가 납니다 | [M13] |
| **함수에 넓은 관리형 정책** | list 함수에 `AmazonDynamoDBReadOnlyAccess` 를 붙임 → 계정의 **모든** DynamoDB 테이블 읽기 권한 | SAM 정책 템플릿(`DynamoDBReadPolicy` + `TableName`) 또는 `AWS::Serverless::Connector` 로 대상 리소스에 한정 | [M13] |
| **DLQ 를 비동기 호출 모범 사례로** | "비동기식 호출에 대한 모범 사례는 DLQ 를 생성 및 사용하는 것" | 문서는 DLQ 를 **온-실패 대상(on-failure destination)의 대안**으로 제시합니다. 온-실패 대상이 지원 대상이 더 많고 함수 응답 세부 정보를 호출 레코드에 포함하며 함수·버전·별칭 단위로 구성할 수 있습니다 | [M09] |
| **런타임 내장 SDK 에 의존** | "Python 및 Node.js용 런타임에는 SDK가 내장되어 있으므로 번들링할 필요가 없습니다" | 문서는 종속성을 완전히 제어하고 자동 런타임 업데이트 중 하위 호환성을 극대화하기 위해 **SDK 모듈과 그 종속성을 배포 패키지나 Lambda 레이어에 항상 포함**하도록 권장합니다 | [M09] |
| **`www.aws.training` 포털** | 로그인해 `SessionSearch`·`Details` 경로로 과정을 찾음 | 현재 학습 진입점은 **AWS Skill Builder** 입니다 | [M15] |

**런타임 내장 SDK 항목에 숨은 함정이 있습니다.** 재귀 루프 감지에는 최소 SDK 버전이 필요해,
런타임 내장 버전이 그보다 낮으면 감지가 동작하지 않습니다. 문서는 런타임 내장 SDK 를 배포에
추가 패키지를 포함할 수 없을 때(Lambda 콘솔 코드 편집기, CloudFormation 인라인 코드)에만 쓰라고
기술합니다.

> — 출처: [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html)

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

> — 출처: [Retaining records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

> — 출처: [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/)

### 4.9 AI 코딩 도구

| 항목 | 상태 | 대체 | 모듈 |
|---|---|---|---|
| **Amazon Q Developer IDE 플러그인** | AWS 는 **2027년 4월 30일** 지원을 중단하고, 유사 기능(에이전틱 코딩, 채팅, MCP 지원)을 위해 Kiro 를 살펴보도록 안내합니다 | Kiro (IDE · CLI · 자율 웹 에이전트) | [M03] |

교재 M03 슬라이드 34 강사 노트에 "API 및 확장 프로그램 이름 지정에서 이전 AI 어시스턴트의 흔적"
이라는 표현이 있습니다. 그것이 무엇인지 수강생이 물을 수 있으므로 상태를 명시해 두었습니다.

> — 출처: [Amazon Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html)

---

## 5. 이름이 바뀐 것

기능은 그대로인데 이름이 달라진 것들입니다. **오래된 이름으로 문서를 검색하면 찾지 못하거나
옛 페이지로 갑니다.**

### 5.1 화면과 콘솔 경로

| 교재 표기 | 현재 | 모듈 |
|---|---|---|
| X-Ray **Service map** | CloudWatch 콘솔의 **X-Ray Trace Map**. X-Ray 서비스 맵과 CloudWatch ServiceLens 맵이 통합되었습니다 | [M01] [M02] [M14] |
| X-Ray **Insights** (별도 화면) | CloudWatch 콘솔의 **Insights** 에 포함 | [M14] |
| API Gateway **Method Execution** 창의 **Client** 상자에서 TEST | Resources 창에서 메서드 선택 → **Test 탭** → Test | [M10] |
| API Gateway **Stage Editor** 창 | **Stages** → 스테이지 → **Stage details** / **Logs and tracing** 의 Edit | [M10] |
| Cognito **hosted UI** | **managed login**(권장 브랜딩 버전)과 **hosted UI (classic)** 두 버전. 문서는 classic 을 managed login 의 "더 얇고 덜 사용자 지정 가능한 선행 버전"이라 기술합니다 | [M02] |
| **AWS Builder Labs** 소개 페이지 | AWS Skill Builder 의 **몰입형 학습(immersive learning)** 페이지 안의 항목 | [M01] [M15] |

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

### 5.2 서비스와 기능 이름

| 교재 표기 | 현재 | 모듈 |
|---|---|---|
| **Amazon CloudWatch Events** | **Amazon EventBridge.** API 는 동일하고 기존 규칙도 그대로 보이지만 **새 기능은 CloudWatch Events 에 추가되지 않습니다** | [M11] [M14] |
| **Swagger** / `swagger: "2.0"` | **OpenAPI.** 문서 제목이 "Develop REST APIs using OpenAPI in API Gateway" 이고 v2.0(=Swagger 2.0)과 v3.0 두 규격을 지원합니다. URL 경로에는 여전히 `swagger-extensions` 가 남아 있습니다 | [M10] |
| **사용자 지정 권한 부여자(custom authorizer)** | **Lambda 권한 부여자.** 문서는 "Lambda authorizer (formerly known as a custom authorizer)" 로 표기합니다. 메서드 권한 부여 유형 값은 여전히 `CUSTOM` 입니다 | [M10] [M12] |
| **웹 ID 페더레이션** (Amazon · Facebook · Google 나열) | **OIDC 페더레이션.** OIDC 호환 IdP 전반을 대상으로 서술하고 GitHub Actions 를 대표 예로 듭니다 | [M04] |
| **버스트 동시성** | **동시성 조정 속도**(concurrency scaling rate) / **동시성 조정 한도**(concurrency scaling limit). 수치(10초당 실행 환경 1,000개)는 그대로입니다 | [M09] |
| `Iterator` (Map 상태) | `ItemProcessor` | [M11] |
| `Parameters` (Map 상태 안) | `ItemSelector` | [M11] |
| `UnusedAccountValidityDays` | `TemporaryPasswordValidityDays` | [M12] |
| **.NET Core** (Lambda 런타임) | **.NET** (`dotnet8` / `dotnet9` 컨테이너 전용 / `dotnet10`) | [M09] |
| `CreateTableResult` (Java) | `CreateTableResponse` | [M08] |

### 5.3 표현이 구체화된 것

같은 사실을 더 정확하게 말하도록 문구가 바뀐 경우입니다.

| 교재 | 현재 | 모듈 |
|---|---|---|
| DynamoDB "**빠르고 예측 가능한** 성능" · "10밀리초 미만" | "어떤 규모에서도 **한 자릿수 밀리초** 성능". 정의 문장에 "서버리스"와 "분산"이 들어왔습니다 | [M02] [M07] |
| S3 "**생성 후 읽기의** 일관성" | 객체 PUT·DELETE 에 대해 **강력한 읽기 후 쓰기 일관성**(모든 리전). 단 버킷 구성은 여전히 최종 일관성 | [M05] |
| SigV4 "요청 만료 기간은 서비스마다 다름" | **대부분의 경우 타임스탬프로부터 5분** 안에 도달해야 합니다. 다중 리전 요청에는 **SigV4a**(비대칭 서명) | [M03] [M04] |
| SnapStart "시작 성능을 최대 **10배** 향상" | "**최대 1초 미만**(as low as sub-second) 시작 성능". 배수 표현이 문서에서 사라졌습니다 | [M09] |
| ElastiCache "**Redis 또는 Memcached**" | **Valkey, Memcached, Redis OSS** 세 엔진. 서버리스와 노드 기반 두 배포 옵션 | [M07] [M08] |
| JVM DNS TTL "**60초** 이하" | **5초.** 또 `networkaddress.cache.ttl` 은 시스템 속성이 아니라 **보안 속성**이라 `-D` 플래그로 설정할 수 없습니다 | [M04] |

> — 출처: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

---

## 6. 기본값이 바뀐 것

**가장 조용히 사람을 넘어뜨리는 유형입니다.** 교재를 따라 했는데 화면이 다르거나 명령이
실패하면 대개 여기에 원인이 있습니다.

### 6.1 S3

| 항목 | 교재 | 현재 기본값 | 결과 | 모듈 |
|---|---|---|---|---|
| **Object Ownership** | ACL 을 "레거시"로만 표기 | **버킷 소유자 적용(Bucket owner enforced).** 신규 버킷에서 **모든 ACL 이 비활성화**됩니다 | ACL 설정·업데이트 요청이 **실패**합니다. 액세스는 정책으로만 평가됩니다 | [M05] |
| **퍼블릭 ACL 로 버킷 생성** | `CannedACL = S3CannedACL.PublicRead` 로 버킷 생성 예제 | ACL 비활성화가 기본 | 퍼블릭 ACL 을 지정한 PUT 이 **400 `AccessControlListNotSupported`** 로 실패합니다. 계정 수준 `BlockPublicAcls` 가 켜져 있으면 `PUT Bucket` 자체가 실패합니다 | [M06] |
| **퍼블릭 액세스** | 퍼블릭 읽기 버킷 + 웹 사이트 엔드포인트만 제시 | 신규 버킷·액세스 포인트·객체는 **퍼블릭 액세스를 허용하지 않습니다.** AWS 는 계정과 버킷에 퍼블릭 액세스 차단 네 설정을 모두 켜도록 권장합니다 | 교재 절차로는 정적 사이트가 공개되지 않습니다 | [M06] |
| **정적 사이트 호스팅 권장 경로** | S3 웹 사이트 엔드포인트 | **AWS Amplify Hosting**(1순위 권장). 버킷이 SSE-KMS 로 암호화되어 있으면 **CloudFront + OAC 가 필수** | 웹 사이트 엔드포인트는 HTTPS 와 액세스 포인트를 지원하지 않습니다 | [M02] [M06] |
| **CORS 구성 형식** | "CORS 구성 **XML 파일**을 생성하십시오" | 콘솔에서는 **JSON 필수.** REST API·SDK 경로에서는 XML 도 유효합니다 | 콘솔에서 교재의 XML 을 붙여 넣을 수 없습니다 | [M06] |
| **`ListBuckets` 페이지 매김** | 전체 목록을 한 번에 반환하는 것처럼 서술 | AWS 는 **페이지 매김된 요청만 사용하도록 강력히 권장**합니다. 페이지 매김되지 않은 요청은 기본 할당량 10,000 계정에서만 지원되고, 승인된 할당량이 10,000 을 넘는 계정에서는 **모두 거부**됩니다 | 대형 계정에서 교재 코드가 실패합니다 | [M06] |
| **미리 서명된 URL 서명 버전** | `AWSAccessKeyId` / `Signature` / `Expires` (서명 버전 2 형태) | `aws s3 presign` 이 만드는 모든 URL 은 **SigV4** 를 씁니다. 쿼리 파라미터는 `X-Amz-Algorithm`, `X-Amz-Credential`, `X-Amz-Date`, `X-Amz-Expires`, `X-Amz-SignedHeaders`, `X-Amz-Signature` 입니다 | 리전을 명시적으로 구성해야 합니다. `--expires-in` 기본 3600초, 최대 604800초(7일) | [M06] |

> — 출처: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

> — 출처: [Virtual hosting of buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

### 6.2 DynamoDB

| 항목 | 교재 | 현재 기본값 | 모듈 |
|---|---|---|---|
| **용량 모드** | "용량 크기 조정"이라고만 적고 모드를 구분하지 않음. "테이블을 생성할 때 테이블의 용량을 **프로비저닝해야 합니다**" | **온디맨드 모드가 기본이자 권장 처리량 옵션**입니다. `BillingMode` 는 필수가 아니고 `PAY_PER_REQUEST` 를 선택하면 `ProvisionedThroughput` 을 지정할 수 없습니다 | [M02] [M07] [M08] |
| **알아 둘 결과** | — | 기본 설정으로 테이블을 만들면 온디맨드가 되므로 **예전 화면 캡처와 실습 화면이 다릅니다.** 온디맨드는 트래픽이 0 이면 처리량 요금이 부과되지 않습니다 | [M02] |
| **속성 값에 빈 값** | "속성 값은 **null 일 수 없습니다**" | **키가 아닌 속성에는 빈 문자열·빈 이진 값이 허용**됩니다. 키로 쓰이는 문자열·이진 값만 길이가 0보다 커야 합니다. 세트 유형은 비어 있을 수 없고 빈 값이 든 요청은 `ValidationException` 으로 거부됩니다 | [M08] |
| **문서 모델에서 속성 삭제** | `note["Favorite"] = null;` 로 삭제한다고 주석 | null 유형에는 `DynamoDBNull` 을 씁니다. 속성을 실제로 제거하려면 `UpdateExpression` 의 `REMOVE` 절이 명확합니다 | [M08] |
| **`.NET` 동기 메서드** | `client.CreateTable(request)` 등 동기 호출 | .NET Core·.NET Standard 대상에서는 **비동기만 지원**합니다. 현재 공식 예제는 `await ...CreateTableAsync(...)` 이고 `BillingMode.PAY_PER_REQUEST` 를 지정합니다 | [M06] [M08] |

> — 출처: [Programming with DynamoDB and the AWS SDK for Java](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 6.3 Lambda

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| **재귀 루프 대응** | "동시 런타임 한도를 0으로 설정" 으로만 안내 | **재귀 루프 감지가 기본 동작**입니다. X-Ray 트레이싱 헤더로 요청 체인을 추적해 같은 체인에서 약 **16회** 호출되면 다음 호출을 중지하고 Health Dashboard·이메일로 알립니다. 활성 트레이싱 없이 동작하고 무료입니다 | [M09] [M14] |
| **감지 범위의 한계** | — | 감지 대상은 Lambda 함수 자신과 **Amazon SQS · S3 · SNS** 사이의 루프, 그리고 Lambda 함수만으로 된 루프입니다. **DynamoDB 처럼 다른 서비스가 끼면 감지하지 못합니다.** 그 경우 교재의 수동 조치(예약된 동시성 0)가 여전히 유효합니다 | [M09] |
| **코드 저장 위치** | "Lambda 는 **Amazon S3** 에 코드를 저장하고 저장된 데이터를 암호화합니다" | **Lambda 관리형 스토리지**(계정·리전당 300GB, 압축 해제 기준)가 기본이고 사용자 S3 버킷을 쓰는 자체 관리형 S3 코드 스토리지가 선택 옵션입니다. 저장 중 암호화는 두 경우 모두 제공됩니다 | [M09] |
| **`invoke --payload`** | JSON 문자열을 그대로 전달 | AWS CLI v2 에서는 `--cli-binary-format raw-in-base64-out` 이 필요합니다. 기본값으로 만들려면 `aws configure set cli-binary-format raw-in-base64-out` | [M09] |
| **`/tmp` 스토리지 10GB** | 고정값처럼 제시 | **512MB~10,240MB 를 1MB 단위로 구성**하는 설정입니다. 512MB 까지는 추가 비용이 없고 그 이상은 GB-초로 과금됩니다. SnapStart 는 512MB 초과 임시 스토리지를 지원하지 않습니다 | [M09] |

> — 출처: [Retaining records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

### 6.4 API Gateway 와 Step Functions

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| **통합 패스스루 조건** | 조건 **두 가지**를 나열 | **세 가지 선택지가 있는 설정**입니다. `WHEN_NO_MATCH`(교재 ①), `WHEN_NO_TEMPLATES`(교재 ②, **문서가 권장**), `NEVER`(전달하지 않고 매핑되지 않은 콘텐츠 유형은 HTTP 415 로 거부). `Content-Type` 헤더가 없으면 `application/json` 으로 기본 처리합니다 | [M10] |
| **Canary 승격** | "트래픽 100% 를 새 버전으로 보낼 수 있습니다" (결과만 서술) | 승격 메커니즘은 ① 스테이지의 `deploymentId` 를 카나리의 것으로 재설정 ② 카나리 스테이지 변수를 스테이지 변수로 복사 ③ 카나리 트래픽 비율을 0.0% 로 내리는 것입니다. **승격만으로는 카나리가 비활성화되지 않습니다.** 되돌리려면 `canarySettings` 를 제거해야 합니다 | [M10] |
| **프라이빗 통합** | `HTTP`·`HTTP_PROXY` 를 "VPC 의 프라이빗 HTTP 엔드포인트를 포함한 HTTP 엔드포인트"로 정의 | 두 유형은 **백엔드 HTTP 엔드포인트 통합**이고, 프라이빗 통합은 `HTTP_PROXY` + `connectionType=VPC_LINK` + VPC 링크 V2 의 `connectionId` 를 지정하는 **별도 설정**입니다. VPC 링크 V2 는 NLB 뿐 아니라 **ALB 도** 대상으로 삼습니다 | [M10] |
| **데이터 전달·변환 언어** | JSONPath 기반 필드와 `$` 표기법으로만 설명 | **JSONata** 를 지원하고 **새 상태 머신에는 JSONata 를 권장**합니다. JSONata 를 선택하면 다섯 개의 JSONPath 필드가 `Arguments` 와 `Output` 두 필드로 줄고 JSON 키 이름에 `.$` 를 쓰지 않습니다. **변수(`Assign`)** 로 한 단계에서 저장한 데이터를 이후 어느 단계에서든 참조할 수 있습니다 | [M11] |

> — 출처: [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)

### 6.5 IAM

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| **정책 유형 수** | "가장 일반적인 **두 가지** 정책 유형은 자격 증명 기반 정책과 리소스 기반 정책" | **9가지**를 지원합니다. 자격 증명 기반, 리소스 기반, VPC 엔드포인트 정책, 권한 경계, SCP, RCP, ACL, AWS RAM 리소스 공유, 세션 정책. **권한을 부여하는 것**은 자격 증명 기반·리소스 기반·ACL·RAM 공유이고 나머지는 **상한만** 정합니다 | [M04] |
| **"루트 자격 증명은 항상 허용"** | 단정적으로 서술 | 단일 계정에서는 참입니다. 그러나 **AWS Organizations 의 SCP 는 멤버 계정의 루트 사용자를 포함해** 보안 주체의 권한을 제한하고, RCP 도 루트 사용자를 포함한 유효 권한에 영향을 줍니다. 멤버 계정의 루트 자격 증명 자체를 제거할 수도 있습니다 | [M04] |
| **`PowerUserAccess` 의 제외 대상** | "IAM 및 AWS Organizations 를 제외한 모든 서비스" | 기본 버전 v12 는 `account:*` 도 제외하고, 그 대신 `account:GetAccountInformation` 등 **9개 예외 작업을 허용**합니다 | [M04] |
| **AWS CLI 출력 형식** | `json`, `yaml`, `text` **세 가지** | `json`(기본값), `yaml`, `yaml-stream`, `text`, `table`, `off` **여섯 가지**. `--output text` 는 `--query` 적용 **전에** 페이지를 나누고 페이지마다 쿼리를 실행하므로 예상 밖의 출력이 늘 수 있습니다 | [M04] |
| **보안 인증 정보 우선순위** | 두 슬라이드에서 서로 다른 목록을 제시하고 인스턴스 프로파일을 마지막에 둠 | **두 개념을 분리**합니다. **설정 값 조회 우선순위**(코드 → JVM 시스템 속성 → 환경 변수 → 공유 credentials → 공유 config → SDK 기본값, 6단)와 **자격 증명 공급자 체인**(액세스 키 → 웹 자격 증명·OIDC → 로그인 공급자 → IAM Identity Center → 역할 수임 → 컨테이너 → 프로세스 → IMDS) | [M04] |

> — 출처: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

> — 출처: [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

---

## 7. 수치와 한도가 바뀐 것

시험과 실무 모두에서 틀리기 쉬운 값들입니다.

### 7.1 커진 것

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| S3 멀티파트 업로드 최대 객체 크기 | **5TB** | 멀티파트 업로드 한도 페이지는 **48.8TiB**, 객체 업로드 페이지는 **최대 50TB**(5MB~50TB 범위)로 기재합니다. 단일 PUT 상한 **5GB** 는 그대로입니다 | [M06] |
| S3 배치 작업 지원 작업 | **7가지** | **11가지.** 체크섬 계산, 모든 객체 태그 삭제, 객체 암호화 업데이트, 기존 객체 복제(Batch Replication)가 추가되었습니다. 매니페스트 지정 방법도 2가지에서 **4가지**로 늘었습니다 | [M06] |
| DynamoDB 프로비저닝된 처리량 감소 횟수 | 하루 최대 **4번** | 하루(UTC 기준) **4회로 시작**하고 **매시간 1회가 보충**되며 동시 보유 최대치가 4회여서 24시간 전체로는 **최대 27회** | [M08] |
| DAX write-through 쓰기 작업 | **4개** | **5개.** `TransactWriteItems` 가 추가되었습니다 | [M08] |
| Lambda 비동기 호출 레코드 대상 | **4가지** | **5가지.** Amazon S3 버킷(실패 시에만)이 추가되었습니다 | [M09] |
| Skill Builder 무료 디지털 과정 | **600개 이상** | **900개 이상.** 무료 학습 리소스 전체로는 **1,000개 이상** | [M15] |

### 7.2 작아진 것 또는 조건이 붙은 것

| 항목 | 교재 | 현재 | 모듈 |
|---|---|---|---|
| Lambda 비동기 호출 페이로드 | **256KB** | **1MB.** 동기 요청·응답은 각각 6MB(교재와 같음), 스트리밍 응답은 200MB | [M09] |
| JVM DNS TTL 권장값 | **60초** 이하 | **5초** | [M04] |
| SnapStart "추가 비용 없이" | 조건 없이 서술 | **Java 관리형 런타임에 한정**됩니다. Python·.NET 은 스냅샷 캐싱 요금(최소 3시간 과금)과 복원 요금이 발생하고 두 요금은 메모리 양에 따라 달라집니다 | [M09] |
| SnapStart 지원 런타임 | Java 11 · Java 17 | **Java 11 이상, Python 3.12 이상, .NET 8 이상.** 그 밖의 관리형 런타임, OS 전용 런타임, 컨테이너 이미지는 미지원 | [M09] |
| Lambda 동시 실행 한도 1,000 | 고정 한도처럼 제시 | 기본 할당량이고 **증액 요청 가능**(수만 단위까지)합니다. 다만 **새 AWS 계정은 축소된 값에서 시작**해 사용량에 따라 자동 상향됩니다 | [M09] |
| Lambda 용량 모드 전환 | "24시간마다 한 번" | 프로비저닝→온디맨드는 **24시간 롤링 윈도 안에서 최대 4번**, 온디맨드→프로비저닝은 **언제든** (DynamoDB 항목) | [M08] |
| 실패한 조건부 쓰기 소비량 | "쓰기 용량 단위 **1개**" | **항목 크기 기준**입니다. 조건이 false 여도 소비하며, 기존 항목 또는 시도한 새 항목의 크기에 따라 달라집니다(문서 예시: 300KB / 310KB 면 310KB 기준) | [M08] |
| `ListTables` 반환 | 파라미터가 필요 없다고만 서술 | 출력이 **페이지 매김**되고 한 페이지에 최대 **100개**입니다. 전체를 얻으려면 `LastEvaluatedTableName` → `ExclusiveStartTableName` 루프가 필요합니다 | [M08] |
| API Gateway 제한 유형 | **두 가지** | **네 가지.** AWS 제한 한도(고객 변경 불가) → 계정별 한도 → API별·스테이지별 한도 → 클라이언트별 한도. 적용 순서는 역순이고 **모두 best-effort** 입니다 | [M10] |
| 배포 패키지 "콘솔 인라인 편집 3MB" | 표에 기재 | **현재 할당량 표에 이 항목이 없습니다.** 콘솔 코드 편집기 사용 조건은 인터프리터 언어 런타임(Python·Node.js·Ruby)과 **압축 해제 기준 50MB 미만**입니다. 컨테이너 이미지 함수는 콘솔에서 편집할 수 없습니다 | [M09] |

### 7.3 의미가 달라진 것

수치는 같은데 뜻이 달라진 것입니다.

| 항목 | 교재의 이해 | 실제 | 모듈 |
|---|---|---|---|
| DynamoDB `LastEvaluatedKey` | "있으면 읽을 항목이 더 있다" | **이전 Query 가 페이지 경계(1MB 또는 `Limit`)에서 멈췄다는 뜻일 뿐**이고 일치 항목이 더 남았다는 보장이 아닙니다. `FilterExpression` 을 쓰면 한 페이지가 일치 항목 0개를 반환하면서도 `LastEvaluatedKey` 를 포함할 수 있습니다 | [M08] |
| CloudWatch 경보 "연속 기간 3개" | 연속 위반만 경보 | 실제는 **M out of N** 입니다. `Datapoints to Alarm`(M)이 `Evaluation Periods`(N)보다 작으면 연속이 아니어도 경보가 발생합니다 | [M14] |
| S3 이벤트 알림 트리거 | "PUT, POST, COPY, DELETE 같은 작업에 대한 응답" | API 호출이 아닌 트리거도 있습니다(수명 주기 만료·전환, Intelligent-Tiering 계층 이동, 복제 메트릭, 복원 시작·완료). 반대로 **수명 주기에 의한 자동 삭제는 `ObjectRemoved` 로 알림이 오지 않아** `s3:LifecycleExpiration:*` 을 써야 합니다 | [M06] |
| Lambda 이벤트 소스 목록 | Amazon Alexa 와 AWS CloudTrail 포함 | 현재 "Lambda 함수를 호출할 수 있는 서비스" 표(28개 항목)에 두 항목이 없습니다. **표에 없다는 것이 호출 불가를 뜻하지는 않으므로 단정하지 않습니다.** 교재의 "Amazon CloudWatch" 는 표에서 **Amazon CloudWatch Logs** 로 구체화되었습니다 | [M09] |

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 8. 교재 이후 생긴 것

지금 이 과정을 배우는 사람이 **알고는 있어야 하는** 새 기능입니다. 이 과정의 범위 안에서만
골랐습니다.

### 8.1 컴퓨팅

| 항목 | 내용 | 모듈 |
|---|---|---|
| **Lambda 컴퓨팅 프리미티브 두 가지** | 문서가 워크로드 패턴에 따라 두 프리미티브를 제시합니다. **Lambda Functions**(이벤트·API 호출에 응답, 각 호출이 독립 실행, 수요에 맞춰 수평 확장)와 **Lambda MicroVMs**(시작이 거의 즉시, 최대 8시간까지 상태 유지하는 격리된 컴퓨팅 환경). 두 프리미티브는 서버 관리 불필요·사용량 기반 과금·관리형 네트워킹·Firecracker 가상화를 공유합니다. **이 과정의 실습은 Lambda Functions 경로**이므로 실습 내용이 달라지는 것은 아니지만 문서를 찾아갈 때 구분되어 있음을 알아야 합니다 | [M01] [M02] |
| **Lambda 재귀 루프 감지** | 기본 활성, 무료, X-Ray 활성 트레이싱 불필요 | [M09] [M14] |
| **OS 전용 런타임 `provided.al2023`** | Go·Rust 등을 실행하는 경로 | [M09] |

### 8.2 관찰 가능성

교재는 CloudWatch 와 X-Ray 두 서비스만 다룹니다. 현재 이 영역에 있는 것입니다.

| 항목 | 내용 | 모듈 |
|---|---|---|
| **CloudWatch Application Signals** | EC2·ECS·Lambda 애플리케이션의 지표·트레이스를 자동 수집하고 호출량·가용성·지연 시간·결함·오류를 코드 작성 없이 표시합니다. **SLO·SLI** 를 만들고 추적하며 애플리케이션 토폴로지 맵을 자동 발견합니다. Java·Python·Node.js·.NET 지원 | [M02] [M14] |
| **Transaction Search** | 트랜잭션 **스팬 100%** 를 구조화된 로그로 CloudWatch 에 수집합니다. 최대 **10,000개** 스팬을 포함하는 트레이스를 볼 수 있고 `aws/spans` 로그 그룹에 저장됩니다 | [M14] |
| **CloudWatch Logs Insights** | 쿼리 언어 세 가지(Logs Insights QL, OpenSearch PPL, OpenSearch SQL), 필드 인덱스, 패턴 분석, 자연어 쿼리 생성. **스캔한 비압축 로그 양으로 과금** | [M14] |
| **임베디드 지표 형식(EMF)** | 로그 형태로 사용자 지정 지표를 비동기 생성합니다. `logs:PutLogEvents` 만 있으면 되고 `cloudwatch:PutMetricData` 는 필요 없습니다 | [M14] |
| **CloudWatch 크로스 계정 관측가능성** | 모니터링 계정에서 소스 계정의 지표·로그·트레이스를 봅니다. 한 그래프에 여러 계정 지표, 한 쿼리로 여러 계정 로그 그룹 | [M02] [M14] |
| **CloudWatch 의 OpenTelemetry 지표** | OTLP 로 수집하고 **PromQL** 로 조회합니다. 지표 이름 + 레이블(최대 150개) 모델이며 CloudWatch Query Studio 에서 다룹니다. **새 구현에는 OpenTelemetry 를 권장**합니다 | [M14] |
| **CloudWatch 경보 종류 확대** | 지표 경보에 더해 **PromQL 경보, 로그 경보, 복합 경보** | [M14] |
| **CloudWatch Logs 로그 클래스** | **Standard** 와 **Infrequent Access**. 로그 그룹 **삭제 보호**도 추가되었습니다 | [M14] |
| **Lambda 고급 로깅 제어** | 로그 형식(텍스트/JSON), 로그 수준(`FATAL`~`TRACE`), 대상 로그 그룹을 **함수 설정으로** 지정합니다. 로그 대상도 CloudWatch Logs 외에 **S3·Firehose** 가 추가되었습니다 | [M14] |
| **CloudWatch 에이전트의 트레이스 수집** | 버전 1.300025.0 이상이 OpenTelemetry·X-Ray SDK 트레이스를 수집해 X-Ray 로 보냅니다. **별도 데몬이 필요 없습니다** | [M02] [M14] |

### 8.3 인증과 인가

| 항목 | 내용 | 모듈 |
|---|---|---|
| **Cognito 사용자 풀 기능 요금제** | **Lite**(로그인 기능과 classic hosted UI), **Essentials**(최신 인증 기능 전체, 선택 기반 로그인·이메일 MFA 포함, **신규 사용자 풀 기본값**), **Plus**(Essentials + 위협 보호). 요금제는 **사용자 풀 단위**로 적용되며 앱 클라이언트별로 다르게 둘 수 없습니다 | [M02] |
| **managed login** | hosted UI (classic) 의 후속 브랜딩 버전. 다만 **속성 변경·MFA 기본 설정 같은 사용자 자기 서비스 프로필 관리는 지원하지 않아** 그 부분은 애플리케이션이 구현해야 합니다 | [M02] |
| **IAM 정책 유형 확대** | 9가지. RCP(리소스 제어 정책)가 교재 시점 이후 항목입니다 | [M04] |
| **SigV4a** | 다중 리전 요청용 **비대칭 서명** | [M03] [M04] |

### 8.4 데이터와 스토리지

| 항목 | 내용 | 모듈 |
|---|---|---|
| **Aurora DSQL** | 결정 안내서가 OLTP 관계형 계열에 Aurora PostgreSQL 호환·Aurora MySQL 호환과 함께 **Aurora DSQL** 을 넣습니다 | [M07] |
| **ElastiCache Valkey 엔진과 서버리스** | Valkey·Memcached·Redis OSS 세 엔진, 서버리스와 노드 기반 두 배포 옵션. 서버리스는 Valkey 7.2 이상, Memcached 1.6.22 이상, Redis OSS 7.1 과 호환 | [M07] [M08] |
| **DynamoDB `EnhancedDocument`** | Java 2.x 에서 데이터 유형 설명자를 피하려는 경우 | [M08] |
| **S3 배치 복제(Batch Replication)** | 기존 객체를 복제하는 배치 작업 | [M06] |

### 8.5 도구와 언어

| 항목 | 내용 | 모듈 |
|---|---|---|
| **Kiro** | Amazon Q Developer IDE 플러그인의 대체로 문서가 안내합니다. IDE·CLI·자율 웹 에이전트 형태이고 에이전틱 코딩, 채팅, MCP 지원을 제공합니다 | [M03] |
| **Step Functions JSONata 와 변수** | 새 상태 머신에 JSONata 를 권장합니다. `Arguments`·`Output`·`Assign` 세 필드로 단순해집니다 | [M11] |
| **`TestState` API** | Step Functions Local 을 대체하는 개별 상태 테스트 경로 | [M11] |
| **VPC 링크 V2** | ALB 도 대상으로 삼을 수 있고 `connectionId` 를 스테이지 변수로 넘길 수 있습니다 | [M10] |
| **AWS SAM 커넥터** | `AWS::Serverless::Connector` 로 리소스 간 Read/Write 의도만 선언하면 SAM 이 필요한 권한을 생성합니다 | [M13] |
| **Amazon Polly 음성 엔진 네 가지** | Generative, Long-form, Neural, Standard. 앞의 두 개가 교재 이후 추가되었습니다 | [M01] |
| **AWS Skill Builder 몰입형 학습** | AWS Builder Labs(200개 이상의 가이드형 대화식 실습), AWS Cloud Quest, AWS Jam, AWS SimuLearn, 그리고 실습 문맥 안의 **AI 기반 Learning Assistant** | [M01] [M15] |
| **마이크로크리덴셜** | 라이브 AWS 환경 실시간 평가로 실무 능력을 검증합니다. 서버리스, 에이전틱 AI, 애플리케이션 네트워킹, 인시던트 대응. **Skill Builder 구독 불필요** | [M15] |
| **AWS Certified Generative AI Developer – Professional** | 개발자에게 가장 직접적인 다음 자격증. 한국어로도 제공됩니다 | [M15] |
| **DVA-C03** | 이 과정에 대응하는 시험의 개정판. **AI 지원 개발과 AI 보안이 추가**되고 컨테이너 관리가 들어옵니다. DVA-C02 마지막 응시일은 2026년 11월 30일 | [M15] |

---

## 9. 문서 경로가 바뀐 것

교재의 링크를 눌렀는데 다른 페이지가 나오거나 404 가 나는 경우입니다. **인쇄물에서 손으로 옮겨
적을 때 특히 문제가 됩니다.**

### 9.1 404 를 반환하는 것

| 교재 URL | 모듈 |
|---|---|
| `AWSSdkDocsNET/latest/V3/DeveloperGuide/net-dg-install-assemblies.html` | [M03] |
| `docs.aws.amazon.com/pt_br/cli/latest/...` (SDK 설치 링크) | [M03] |
| `docs.aws.amazon.com/AWSToolkitEclipse/latest/GettingStartedGuide/lambda.html` | [M09] |
| `aws.amazon.com/certification/certification-paths/` | [M15] |

### 9.2 다른 곳으로 리디렉션되는 것

| 대상 | 교재 경로 | 현재 위치 | 모듈 |
|---|---|---|---|
| S3 개발자 안내서 | `/AmazonS3/latest/dev/` | `/AmazonS3/latest/userguide/` | [M05] [M06] |
| S3 스토리지 클래스 변경 | `ChgStoClsOfObj.html` | `storage-class-intro.html` (별도 페이지가 합쳐졌습니다) | [M06] |
| DynamoDB 할당량 | `Limits.html` | `ServiceQuotas.html`(조정 가능한 할당량)과 `Constraints.html`(고정 제약)로 **두 페이지로 분리** | [M07] |
| Java SDK 클라이언트 생성 | `sdk-for-java/latest/developer-guide/using.html` | `work-witih-clients.html` 의 "Create a service client" 절 | [M07] |
| DynamoDB 온디맨드 요금 | `aws.amazon.com/dynamodb/pricing/on-demand/` | `aws.amazon.com/dynamodb/pricing/` (통합) | [M07] |
| Lambda 할당량 | `/lambda/latest/dg/limits.html` | `/lambda/latest/dg/gettingstarted-limits.html` | [M09] |
| Lambda 권한 | `/lambda/latest/dg/intro-permission-model.html` | `/lambda/latest/dg/lambda-permissions.html` | [M09] |
| Lambda API 참조 | `/lambda/latest/dg/API_*.html` | `/lambda/latest/api/API_*.html` | [M09] |
| IAM 평가 로직 | `AccessPolicyLanguage_EvaluationLogic.html` | `reference_policies_evaluation-logic.html` | [M04] |
| IAM 시작하기 | `getting-started_create-admin-group.html` | `getting-started-account-iam.html` | [M04] |
| CLI 프로파일 | `cli-configure-profiles.html` | `cli-configure-files.html` | [M04] |
| CLI 구성 | `cli-configure-quickstart.html` | `cli-chap-configure.html` | [M04] |
| Boto3 자격 증명 | `boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html` | `docs.aws.amazon.com/boto3/latest/guide/credentials.html` | [M04] |
| CloudWatch 경보 | `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` | `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html` | [M14] |
| Eclipse 툴킷 | `toolkit-for-eclipse/v1/user-guide/` | `toolkit-for-jetbrains/latest/userguide/welcome.html` | [M04] [M09] |
| AWS 요금제 백서 | `.../how-aws-pricing-works/welcome.html` | `.../how-aws-pricing-works/` | [M15] |
| 시험 목록 | `aws.amazon.com/certification/exams` | `aws.amazon.com/certification/` | [M15] |
| AWS Builder Labs | `/training/digital/aws-builder-labs` | `/training/digital/immersive-learning/` | [M15] |
| Tech Talks | `/events/online-tech-talks/on-demand` | `/events/online-tech-talks/` | [M15] |
| Skill Builder 학습 | `explore.skillbuilder.aws/learn` | Skill Builder 최상위 도메인 | [M15] |
| AWS Workshops | `workshops.aws` | AWS Builder Center 의 워크숍 경로 | [M15] |
| 후속 과정 등록 | `www.aws.training/SessionSearch?...` | `aws.amazon.com/training/classroom/<과정>/` (다시 Skill Builder 로) | [M01] [M15] |
| Lambda Visual Studio 툴킷 | `/lambda/latest/dg/csharp-package-toolkit.html` | Lambda 개발자 안내서 루트로 리디렉션. **원래 다루던 항목이 아닙니다** | [M09] |

> — 출처: [Tools to develop, deploy, and manage Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

> — 출처: [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

### 9.3 URL 은 살아 있지만 내용이 다른 것

가장 알아채기 어려운 유형입니다. **응답은 200 이고 페이지도 열리는데 내용이 다른 세대입니다.**

| 대상 | 교재의 기대 | 실제 | 모듈 |
|---|---|---|---|
| `sdk-for-java/latest/developer-guide/metrics.html` | 1.x 의 시스템 속성으로 지표 활성화 | **2.x 내용**을 제공하고 활성화 방식이 `MetricPublisher` 구현 선택(`CloudWatchMetricPublisher` 등)으로 바뀌었습니다 | [M03] |
| `sdk-for-java/v1/developer-guide/jvm-ttl-dns.html` | 최신 JVM TTL 권고 | v1 경로 안에서 리디렉션되지만 **여전히 v1 안내서**입니다 | [M04] |
| `.NET 고급 구성` 링크 | 최신 .NET 안내 | 여전히 **v3 경로**입니다 | [M03] |
| `AWSJavaScriptSDK/latest/` | 최신 JavaScript SDK API 참조 | **v2 API 참조 경로**입니다. URL 자체는 응답합니다 | [M03] |

> — 출처: [AWS SDK for Java 1.x](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

> — 출처: [Migrating to the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html)

---

## 10. 지금 코드를 쓴다면

교재 예제를 실무 코드로 옮길 때 확인할 것을 순서대로 정리했습니다. **이 표만 지키면 이 문서에
있는 대부분의 함정을 피합니다.**

### 10.1 착수 전 체크리스트

| # | 확인 | 근거 절 |
|---|---|---|
| 1 | **SDK 메이저 버전**이 지원되는 것인가. Java 는 2.x(`software.amazon.awssdk`), .NET 은 4.x, JavaScript 는 v3, Go 는 V2 | [3.1](#31-aws-sdk-메이저-버전) |
| 2 | **Lambda 런타임**이 현재 지원 표에 있는가. 교재의 `python3.8` · `python3.9` · `nodejs12.x` · `go1.x` · `.NET Core` 는 모두 지원 종료 | [3.2](#32-lambda-런타임) |
| 3 | **AWS CLI 는 v2** 를 쓰는가 | [4.1](#41-aws-cli-v1) |
| 4 | **자격 증명**이 장기 액세스 키가 아닌가. IAM Identity Center 또는 IAM 역할 | [4.2](#42-자격-증명) |
| 5 | Python 이라면 **`boto3.client()`** 를 쓰는가 (`boto3.resource()` 가 아니라) | [4.3](#43-sdk-사용-방식) |
| 6 | 트레이싱이라면 **OpenTelemetry** 경로인가 (X-Ray SDK 가 아니라) | [4.4](#44-계측과-트레이싱) |
| 7 | .NET 이라면 **비동기 메서드**를 쓰는가 (`*Async`) | [6.1](#61-s3) · [6.2](#62-dynamodb) |
| 8 | **재시도 모드**가 `standard` 인가 | [4.3](#43-sdk-사용-방식) |

### 10.2 서비스별로 흔히 걸리는 것

| 서비스 | 걸리는 지점 | 어떻게 |
|---|---|---|
| **S3** | ACL 로 액세스를 주려 함 | ACL 은 신규 버킷에서 비활성화되어 있습니다. **버킷 정책과 IAM 정책**으로 주세요 |
| **S3** | 정적 사이트를 퍼블릭 읽기 버킷으로 공개하려 함 | **Amplify Hosting** 이 1순위 권장입니다. SSE-KMS 버킷이면 **CloudFront + OAC 가 필수** |
| **S3** | `ListBuckets` 를 한 번에 호출 | **페이지 매김**하세요. 대형 계정에서는 페이지 매김하지 않은 요청이 거부됩니다 |
| **S3** | 콘솔에서 CORS XML 붙여 넣기 | 콘솔은 **JSON 만** 받습니다 |
| **DynamoDB** | 테이블 만들 때 용량을 프로비저닝 | `BillingMode=PAY_PER_REQUEST`(온디맨드)가 **기본이자 권장**입니다 |
| **DynamoDB** | `LastEvaluatedKey` 가 있으면 항목이 남았다고 가정 | **빌 때까지 반복**하세요. 있다고 해서 일치 항목이 남았다는 뜻이 아닙니다 |
| **DynamoDB** | 레거시 조건 파라미터 사용 | **표현식 기반**으로 쓰세요. 섞어 쓰면 오류입니다 |
| **Lambda** | 비동기 페이로드를 256KB 로 가정 | **1MB** 입니다 |
| **Lambda** | 런타임 내장 SDK 에 의존 | 배포 패키지나 레이어에 **명시적으로 포함**하세요 |
| **Lambda** | 비동기 실패 처리에 DLQ | **온-실패 대상**이 지원 대상이 더 많고 응답 세부 정보를 포함합니다 |
| **Lambda** | `invoke --payload` 에 JSON 그대로 | CLI v2 는 `--cli-binary-format raw-in-base64-out` 이 필요합니다 |
| **API Gateway** | 매핑 템플릿부터 시작 | **프록시 통합 → 파라미터 매핑 → 매핑 템플릿** 순서로 검토하세요 |
| **API Gateway** | API 키로 액세스 제어 | 액세스 제어는 **IAM · Lambda 권한 부여자 · Cognito**. API 키는 클라이언트 식별용 |
| **API Gateway** | 사용량 계획 할당량으로 비용 통제 | best-effort 입니다. 비용은 **AWS Budgets**, 차단은 **AWS WAF** |
| **API Gateway** | 프로덕션에 Data tracing 켜기 | 민감한 데이터가 로깅됩니다. **문제 해결 중에만 임시로** |
| **Cognito** | 암묵적 흐름 사용 | **권한 부여 코드 그랜트 + PKCE** |
| **Cognito** | basic(classic) 흐름 사용 | **enhanced 흐름**(`GetId` → `GetCredentialsForIdentity`) |
| **Step Functions** | `Iterator`·`Parameters` 사용 | `ItemProcessor`·`ItemSelector` |
| **Step Functions** | 새 상태 머신에 JSONPath | **JSONata** 를 권장합니다 |
| **SAM** | `sam package` 를 별도로 실행 | `sam deploy` 가 암시적으로 수행합니다. 버킷 자동 생성은 `--resolve-s3` |
| **SAM** | 함수에 넓은 관리형 정책 | **정책 템플릿** 또는 **커넥터**로 대상 리소스에 한정 |
| **X-Ray** | X-Ray 콘솔에서 서비스 맵 찾기 | **CloudWatch 콘솔 → X-Ray traces → Trace Map** |
| **X-Ray** | Lambda 트레이스가 안 보임 | `Tracing` 을 **`Active`** 로 켜세요. 기본값은 `PassThrough` 이고 자동 전송하지 않습니다 |

### 10.3 값을 직접 확인해야 하는 것

이 문서의 수치 중 **시간에 따라 바뀌는 것**입니다. 채택 전에 원문을 다시 보세요.

| 항목 | 원문 |
|---|---|
| SDK 메이저 버전 수명 주기 | [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Lambda 런타임 지원·폐기 일정 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS CLI v1 단계 | [AWS CLI v1 maintenance mode announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/) |
| X-Ray SDK·데몬 일정 | [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html) |
| 자격증 라인업과 시험 개정 일정 | [AWS Certification](https://aws.amazon.com/certification/) |

**런타임 표의 예정일은 계획 목적이며 변경될 수 있다고 문서가 명시합니다.** 이 문서에 적힌
날짜를 근거로 장기 계획을 세우지 마세요.

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

> — 출처: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

---

## 11. 모듈별 색인

각 항목의 **교재 위치와 근거**는 해당 모듈 문서의 `교재 대비 변경 사항` 장에 있습니다. 이 문서는
그것을 주제별로 다시 묶은 것이므로, 자세한 내용은 모듈로 돌아가서 보세요.

| 모듈 | 이 문서에서 다룬 주요 항목 |
|---|---|
| **M01** 과정 개요 | X-Ray 콘솔, Polly 음성 엔진 네 가지, Lambda 프리미티브 두 가지, 강의실 과정 경로, AWS Builder Labs |
| **M02** 웹 애플리케이션 구축 | X-Ray 콘솔, CloudWatch 관찰 범위, Cognito managed login·기능 요금제, S3 프런트엔드 호스팅 권장, DynamoDB 정의·용량 모드, Lambda 프리미티브 |
| **M03** 개발 환경 | SDK 메이저 버전 5건, `nodejs12.x`, AWS CLI v1, Cloud9, boto3 리소스, Amazon Q Developer IDE 플러그인, 장기 액세스 키, SigV4 5분 |
| **M04** 권한 부여 | Cloud9, Eclipse 툴킷, Java 1.x, 장기 액세스 키, 루트 액세스 키, 재시도 legacy, 정책 유형 9가지, `PowerUserAccess` v12, CLI 출력 6가지, JVM TTL 5초, 문서 경로 다수 |
| **M05** 스토리지 시작 | Java 1.x, boto3 리소스, 경로 스타일 요청, ACL 기본 비활성화, 강력한 읽기 후 쓰기 일관성 |
| **M06** 스토리지 애플리케이션 | Java 1.x, S3 Object Lambda, boto3 리소스, `list_objects` paginator, RRS, 멀티파트 상한, 퍼블릭 ACL, .NET 동기 메서드, CORS JSON, `ListBuckets` 페이지 매김, 미리 서명된 URL SigV4, 배치 작업 11가지 |
| **M07** 데이터베이스 시작 | Java 1.x DynamoDB 네임스페이스, boto3 리소스, 한 자릿수 밀리초, ElastiCache 세 엔진, 데이터베이스 서비스 분류, NoSQL Workbench 두 도구, 문서 경로 |
| **M08** 데이터베이스 애플리케이션 | Java 1.x Document API, boto3 리소스, 레거시 조건 파라미터, `CreateTableResponse`, 처리량 감소 27회, 용량 모드 전환, 조건부 쓰기 소비량, `LastEvaluatedKey`, 빈 문자열 허용, DAX 5개 작업, `ListTables` 페이지 매김 |
| **M09** 컴퓨팅 | `python3.8`, `.NET Core`, `go1.x`, Eclipse 툴킷, boto3 리소스, DLQ, 런타임 내장 SDK, 비동기 페이로드 1MB, `/tmp` 구성, 동시성 조정 속도, SnapStart 조건, 재귀 루프 감지, 코드 저장 위치, `--cli-binary-format`, 문서 경로 |
| **M10** API Gateway | 매핑 템플릿 순서, API 키, 사용량 계획, 스테이지 변수, Data tracing, OpenAPI, Lambda 권한 부여자, 제한 4단, 콘솔 경로, 패스스루 3가지, Canary 승격, 프라이빗 통합 |
| **M11** 마이크로서비스 | Step Functions Local, `Iterator`·`Parameters`, JSONata·변수, CloudWatch Events → EventBridge |
| **M12** 액세스 권한 부여 | Cognito Sync, 암묵적 흐름, basic(classic) 흐름, `UnusedAccountValidityDays`, 개발자 속성, `TOKEN` 권한 부여자 |
| **M13** 배포 | `python3.8`·`python3.9`, `sam package`, 넓은 관리형 정책 |
| **M14** 관찰 | X-Ray SDK·데몬 GA 종료, X-Ray SDK·데몬·로컬 샘플링 비권장, X-Ray 콘솔, 서비스 맵 → 트레이스 맵, CloudWatch Events → EventBridge, 경보 M out of N, Logs Insights, EMF, Application Signals, Transaction Search, Lambda 고급 로깅, CloudWatch 에이전트 트레이스 |
| **M15** 과정 마무리 | Specialty 자격증 4건 종료, `www.aws.training`, Skill Builder 규모·구성, 시험 준비 4단계, DVA-C03, 마이크로크리덴셜, 문서 경로 다수 |

### 이 문서를 다시 볼 때

- **강의 직후**: [2.2절](#22-어디를-먼저-봐야-하나)의 우선순위 8개만 보세요.
- **실습 중 막혔을 때**: [10.2절](#102-서비스별로-흔히-걸리는-것)에서 해당 서비스를 찾으세요.
- **실무 코드를 쓸 때**: [10.1절](#101-착수-전-체크리스트)을 순서대로 확인하세요.
- **교재를 읽다가 의심스러울 때**: [11장](#11-모듈별-색인)에서 모듈을 찾아 그 모듈 문서의
  `교재 대비 변경 사항` 장으로 가세요.

검증일은 **2026년 8월 25일**입니다. 이 문서의 값 중 수명 주기·일정에 관한 것은
[10.3절](#103-값을-직접-확인해야-하는-것)의 원문에서 다시 확인하세요.
