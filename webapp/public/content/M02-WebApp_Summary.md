# 모듈 2: AWS에 웹 애플리케이션 구축

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [Pollynotes 아키텍처](#2-pollynotes-아키텍처)
3. [애플리케이션이 하는 일](#3-애플리케이션이-하는-일)
4. [개발자 도구](#4-개발자-도구)
5. [저장과 호스팅: Amazon S3](#5-저장과-호스팅-amazon-s3)
6. [데이터 관리와 처리: DynamoDB와 Lambda](#6-데이터-관리와-처리-dynamodb와-lambda)
7. [연결과 액세스: API Gateway와 Amazon Cognito](#7-연결과-액세스-api-gateway와-amazon-cognito)
8. [관측 가능성: CloudWatch와 X-Ray](#8-관측-가능성-cloudwatch와-x-ray)
9. [교재 대비 변경 사항](#9-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 강의에서 다루지 않은 내용. AWS 공식 문서로 확인해 더한 항목입니다.
> - 🔄 강의 당시와 달라져 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [9장](#9-교재-대비-변경-사항)에 모아 두었습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

이 모듈은 **아키텍처 워크스루**입니다. 과정 내내 만들 애플리케이션 Pollynotes의 전체 그림을 한 번 펼쳐 놓고, 그림을 이루는 각 AWS 서비스가 무엇을 맡는지 소개합니다. 깊은 기술 상세는 여기서 다루지 않고, 각 서비스는 이후 모듈에서 하나씩 깊이 들어갑니다.

### 이 모듈로 할 수 있게 되는 것

- 이 과정에서 구축할 애플리케이션의 아키텍처를 설명한다
- 웹 애플리케이션 구축에 필요한 AWS 서비스를 나열한다
- 웹 애플리케이션을 저장·관리·호스팅하는 방법을 파악한다

### 각 서비스를 어느 모듈에서 깊이 다루는가

이 모듈은 전체 그림만 잡고, 상세는 아래 모듈로 넘어갑니다.

| 영역 | 서비스 | 깊이 다루는 모듈 |
|---|---|---|
| 저장·호스팅 | Amazon S3 | 모듈 5·6 |
| 데이터베이스 | Amazon DynamoDB | 모듈 7·8 |
| 컴퓨팅 | AWS Lambda | 모듈 9 |
| API | Amazon API Gateway | 모듈 10 |
| 사용자 액세스 | Amazon Cognito | 모듈 12 |
| 관측 | Amazon CloudWatch · AWS X-Ray | 모듈 14 |

---

## 2. Pollynotes 아키텍처

Pollynotes는 인증된 사용자가 텍스트 노트를 만들고, 저장하고, 검색하고, 삭제하는 웹 애플리케이션입니다. 선택한 노트를 음성으로 변환해 재생하는 기능이 특징입니다. 전체 흐름은 다음과 같습니다.

```text
                          ┌─────────────────────── AWS 클라우드 ───────────────────────┐
                          │                                                            │
                          │   ┌──────────────┐                                         │
      ┌──────────┐  인증  │   │ Amazon        │                                         │
      │          │───────────▶│ Cognito       │ 사용자 풀 + 자격 증명 풀                 │
      │  최종     │        │   └──────────────┘                                         │
      │  사용자   │        │                                                            │
      │          │  웹 UI │   ┌──────────────┐   정적 웹 사이트 + MP3                    │
      │          │───────────▶│ Amazon S3     │◀──────────────┐                         │
      └────┬─────┘        │   └──────────────┘               │                         │
           │              │                                   │ MP3 저장                │
           │ API 호출     │   ┌──────────────┐   ┌────────────┴───┐                     │
           └──────────────────▶│ Amazon        │──▶│ AWS Lambda      │                    │
                          │   │ API Gateway   │   │ (List/Search/   │                    │
                          │   └──────────────┘   │  Delete/Create/ │                    │
                          │                       │  Update/Dictate)│                    │
                          │                       └───┬────────┬────┘                    │
                          │                           │        │                         │
                          │              노트 CRUD ┌───▼────┐  ┌▼──────────┐              │
                          │                        │DynamoDB│  │Amazon Polly│ 텍스트→음성  │
                          │                        └────────┘  └───────────┘              │
                          │                                                            │
                          │   ┌───────────────────────────────┐                        │
                          │   │ Amazon CloudWatch · AWS X-Ray  │ 모니터링·추적           │
                          │   └───────────────────────────────┘                        │
                          │                                                            │
                          │   IAM · AWS STS 로 모든 접근 제어 / AWS SAM 으로 배포          │
                          └────────────────────────────────────────────────────────────┘
```

### 2.1 각 요소가 맡는 일

| 다이어그램 요소 | 담당 서비스 | 상세 모듈 |
|---|---|---|
| 웹 사이트 호스팅 | Amazon S3 | 모듈 6 |
| MP3 호스팅 | Amazon S3 | 모듈 6 |
| 나열 / 검색 / 삭제 / 생성·업데이트 (비즈니스 로직) | AWS Lambda | 모듈 9 |
| 사용자 노트 및 상호 작용 저장 | Amazon DynamoDB | 모듈 7·8 |
| 애플리케이션 API 호출 | Amazon API Gateway | 모듈 10 |
| 사용자 인증 | Amazon Cognito | 모듈 12 |
| 명령(Dictate) → 음성 변환 | Amazon Polly | — |
| 오류·성능 저하 감지, 데이터 추적 | Amazon CloudWatch · AWS X-Ray | 모듈 14 |
| 안전한 액세스 관리 | IAM | 모듈 4 |
| 배포 | AWS SAM | 모듈 13 |

이 그림은 과정 전체에 걸쳐 계속 돌아옵니다. 각 모듈은 이 그림의 한 조각을 실제로 만드는 일이라고 보면 됩니다.

---

## 3. 애플리케이션이 하는 일

### 3.1 무엇을 만드는가

완전히 작동하는 웹 애플리케이션을 만듭니다. Amazon Cognito로 인증된 사용자가 텍스트 노트를 추가하고, 그 노트를 Amazon Polly로 음성으로 변환할 수 있습니다. 사용자는 웹 포털에 로그인해 오디오 노트를 검색·나열·삭제합니다. 이런 문자 음성 변환(TTS) 애플리케이션을 만들려면 코드가 AWS 환경에 어떻게 연결되는지 이해해야 합니다.

### 3.2 어떤 방식으로 만드는가

- 모든 것을 AWS 클라우드에서 진행하는 **클라우드 네이티브** 애플리케이션입니다.
- Amazon API Gateway·AWS Lambda·Amazon DynamoDB 같은 **서버리스** 서비스를 중심으로 만듭니다.
- AWS Management Console만 쓰지 않고 **AWS SDK와 개발 도구**로 개발합니다. 애플리케이션을 만들어 가면서 추가 도구를 활용합니다.

### 3.3 서버리스 핵심 서비스 조합 🆕

AWS 서버리스 개발자 안내서는 서버리스 솔루션의 핵심 서비스로 네 가지를 제시합니다. Pollynotes가 쓰는 조합과 그대로 겹칩니다.

| 서비스 | 안내서가 부여한 역할 |
|---|---|
| AWS Identity and Access Management | AWS에서 리소스에 안전하게 액세스 |
| AWS Lambda | 서버리스 컴퓨팅 기능 |
| Amazon API Gateway | `HTTP`·`HTTPS` 요청을 서비스와 통합해 요청 처리 |
| Amazon DynamoDB | 데이터 저장·검색 |

안내서는 서버리스 개발을 "**프로비저닝된 Amazon EC2 인스턴스 같은 장기 실행 서버를 관리하지 않고** 애플리케이션을 구축하는 것"으로 정의합니다. AWS 서버리스 기술은 종량 과금이고, 애플리케이션 요구에 따라 확장·축소하며, 복원력을 위해 여러 AWS 리전에 걸쳐 확장되도록 만들어졌습니다. 안내서가 인용하는 Serverless Patterns Workshop의 첫 아키텍처는 클라이언트 → REST API(API Gateway) → Lambda 함수 → DynamoDB 테이블 흐름으로, Pollynotes의 경로와 같습니다.

> — 출처: [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html)

### 3.4 이 아키텍처를 계속 따라간다

이 모듈에서는 애플리케이션 아키텍처와 개별 구성 요소를 소개했습니다. 과정 전체에 걸쳐 개발을 진행하면서 이 그림을 계속 따라가고, 다음 모듈부터는 이 애플리케이션을 만드는 데 필요한 **개발자 도구**로 개발 여정을 시작합니다.

---

## 4. 개발자 도구

개발자는 IDE에서 AWS SDK와 도구 키트를 사용해 AWS 리소스와 상호 작용합니다. 적절한 IAM 권한으로 IDE를 구성해 두면, AWS Management Console을 거치지 않고도 코드로 AWS 서비스를 호출할 수 있습니다.

### 4.1 IAM으로 안전한 액세스 관리

IAM은 AWS 리소스에 대한 액세스를 안전하게 제어하도록 돕는 웹 서비스입니다. 누가 인증(로그인)되고 무엇에 권한이 부여되었는지를 제어합니다. 개발 과정에서는 IDE에 부여할 IAM 권한과, 애플리케이션 개발 수명 주기에 필요한 보안 프로파일을 구성하게 됩니다.

IAM, AWS IAM Identity Center, AWS STS는 AWS 계정의 기능으로 **추가 비용 없이** 제공됩니다. IAM 사용자나 STS 임시 자격 증명으로 다른 서비스에 액세스할 때만 그 서비스 요금이 부과됩니다.

> — 출처: [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

### 4.2 콘솔 없이 도구로 개발하기 🔄

AWS Management Console을 열지 않고도 애플리케이션을 만들 수 있습니다. 그 근거는 **AWS CLI가 콘솔과 동등한 기능을 터미널에서 제공**한다는 데 있습니다.

| 항목 | 현재 문서의 서술 |
|---|---|
| 동등성의 방향 | 콘솔의 모든 **IaaS(infrastructure as a service)** 관리·운영·액세스 기능이 AWS API·AWS CLI에서 제공된다 |
| 범위 | IaaS 기능. 콘솔이 모든 기능의 상위 집합이라고 서술하지는 않는다 |
| 새 기능 도달 | 새 AWS IaaS 기능·서비스는 **출시 시점 또는 출시 후 180일 안에** API·CLI에서 완전한 콘솔 기능을 제공 |
| CLI의 위치 | 최소한의 구성으로 브라우저 기반 콘솔이 제공하는 기능과 동등한 기능을 터미널에서 실행 |

> — 출처: [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)

### 4.3 AWS SDK와 도구 키트 🆕

개발에 쓰는 SDK와 도구 키트가 현재 문서에서 어떻게 제공되는지 정리했습니다.

| 구분 | 현재 제공 형태 |
|---|---|
| AWS SDK | C++, Go, Java, JavaScript, Kotlin, .NET, PHP, Python(Boto3), Ruby, Rust, Swift용 SDK. AWS CLI와 AWS Tools for Windows PowerShell도 같은 기준 문서를 공유 |
| 도구 키트 | IDE별 **AWS Toolkit**. AWS Toolkit for JetBrains, AWS Toolkit for Visual Studio, AWS Toolkit for Visual Studio Code, AWS Toolkit for Azure DevOps |

여러 SDK와 도구가 공유하는 것(공유 `config`·`credentials` 파일 또는 환경 변수를 통한 전역 구성, 인증과 액세스, 표준화된 설정 레퍼런스, AWS Common Runtime(CRT) 라이브러리, 유지 관리 정책과 버전 관리)은 `AWS SDKs and Tools Reference Guide`에 모여 있습니다. 특정 SDK·도구의 전용 안내서는 이 문서와 **함께** 봐야 합니다.

> — 출처: [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html)

### 4.4 배포 도구: AWS SAM 🆕

AWS SAM은 코드형 인프라(IaC)로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크입니다. 언제 다른 IaC 도구 대신 SAM을 쓰는지 문서가 명시합니다.

| 비교 대상 | 문서의 안내 |
|---|---|
| CloudFormation | 템플릿 호환성을 유지하면서 서버리스 리소스 정의를 단순화하려면 CloudFormation 대신 SAM |
| AWS CDK | 인프라를 프로그래밍 방식이 아니라 **선언적으로** 기술하고 싶으면 CDK 대신 SAM |
| AWS CDK와 병행 | SAM CLI의 로컬 테스트 기능으로 CDK 애플리케이션을 보완해 둘을 함께 쓸 수도 있음 |

주요 기능으로 리소스 간 권한을 정의하는 **AWS SAM 커넥터**, 로컬 변경을 클라우드에 계속 동기화하는 **`sam sync`**, Terraform 서버리스 애플리케이션의 로컬 디버깅·테스트 지원이 있습니다.

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

---

## 5. 저장과 호스팅: Amazon S3

Pollynotes에서 Amazon S3는 두 가지 일을 합니다. 하나는 애플리케이션의 프런트엔드로 작동하는 **정적 웹 사이트 호스팅**이고, 다른 하나는 Amazon Polly가 만든 **MP3 파일 저장**입니다. 이 스토리지는 노트의 CRUD 작업을 구동하는 컴퓨팅([6장](#6-데이터-관리와-처리-dynamodb와-lambda)의 Lambda)과도 잘 맞물립니다.

### 5.1 Amazon S3의 두 용도

Amazon S3는 확장성·데이터 가용성·보안·성능을 제공하는 객체 스토리지 서비스이고, 사용 사례 목록에 웹 사이트와 모바일 애플리케이션이 모두 들어 있습니다. 따라서 "호스팅 + 파일 스토리지"라는 두 용도가 그대로 성립합니다. 기본적으로 S3 버킷과 그 안의 객체는 프라이빗이며, 사용자가 만든 리소스에만 액세스할 수 있습니다.

> — 출처: [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 5.2 프런트엔드 호스팅의 권장 경로 🔄

정적 웹 사이트를 호스팅하는 방법은 여럿이고, 현재 1순위 권장은 S3 버킷 직접 호스팅이 아닙니다.

| 방식 | 현재 위치 |
|---|---|
| **AWS Amplify Hosting** | 정적 웹 사이트 콘텐츠 호스팅의 **1순위 권장.** Amazon CloudFront 기반 전역 CDN에 배포하는 완전 관리형 서비스로, 범용 버킷 내 객체 위치를 선택해 관리형 CDN에 배포하고 **공개 HTTPS URL을 생성** |
| CloudFront + OAC | 버킷이 **SSE-KMS로 암호화된 경우 필수**(SSE-KMS는 익명 사용자를 지원하지 않음). 오리진 보호에는 OAI가 아니라 **OAC(origin access control)** 를 사용 |
| S3 웹 사이트 엔드포인트 | 가장 단순한 방식이지만 HTTPS를 지원하지 않는 등 제약이 있음 |

세 경로와 웹 사이트 엔드포인트의 제약은 모듈 6이 자세히 다룹니다. 여기서는 권장 경로가 Amplify Hosting으로 옮겨 갔다는 것만 알아 두면 됩니다.

> — 출처: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

### 5.3 MP3를 만드는 쪽: Amazon Polly 🔄

Amazon Polly는 텍스트를 사람 같은 음성으로 변환합니다. 음성 엔진은 네 가지입니다.

| 음성 엔진 | 비고 |
|---|---|
| Generative | 최근 추가 |
| Long-form | 최근 추가 |
| Neural | 뉴스 내레이션용 Newscaster 말하기 스타일 지원 |
| Standard | |

음성을 쓰려면 엔진과 음성 합성 API 작업을 고르고, 합성할 입력 텍스트를 제공하고, 오디오 출력 형식을 선택합니다. 요금은 **합성한 텍스트에만** 부과되고, 생성된 음성을 캐시해 다시 재생하는 데는 추가 비용이 없습니다. MP3를 S3에 저장해 재생하는 이 아키텍처와 방향이 맞습니다.

> — 출처: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

> — 출처: [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)

---

## 6. 데이터 관리와 처리: DynamoDB와 Lambda

사용자가 노트를 추가·읽기·업데이트·삭제할 때, 그 상호 작용을 저장하는 것이 **Amazon DynamoDB**이고, 그 CRUD 작업을 실제로 구동하는 것이 **AWS Lambda** 함수들입니다. 둘 다 서버를 설치·유지 관리할 필요가 없는 서버리스 서비스입니다.

### 6.1 Amazon DynamoDB

DynamoDB는 **어떤 규모에서도 한 자릿수 밀리초 성능을 내는 서버리스 완전 관리형 분산 NoSQL 데이터베이스**입니다. 서버리스인 근거는 다음과 같습니다.

| 특성 | 내용 |
|---|---|
| 서버·소프트웨어 | 서버를 프로비저닝하거나 소프트웨어를 패치·관리·설치·유지 관리·운영할 필요가 없음 |
| 유지 관리 | **다운타임 없는 유지 관리.** 버전(주·부·패치)이 없고 유지 관리 기간도 없음 |
| 축소 | 온디맨드에서 트래픽이 없으면 **0까지 축소**되어 처리량 비용이 발생하지 않고 **콜드 스타트도 없음** |
| 완전 관리형 | 설정, 구성, 유지 관리, 고가용성, 하드웨어 프로비저닝, 보안, 백업, 모니터링을 서비스가 처리 |
| NoSQL | 키-값과 문서 데이터 모델 지원. **JOIN 연산자 미지원**(데이터 모델 비정규화 권장). 강력한 읽기 일관성과 ACID 트랜잭션 제공 |

> — 출처: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

### 6.2 용량 모드의 기본값 🔄

DynamoDB 테이블의 처리량은 용량 모드로 정합니다. **온디맨드가 기본이자 권장 옵션**입니다.

| 항목 | 온디맨드 |
|---|---|
| 위치 | **기본이자 권장(default and recommended) 처리량 옵션** |
| 과금 | 읽기·쓰기 요청당 지불. 트래픽이 0이면 처리량 요금 없음 |
| 확장 | 이미 도달한 트래픽 수준으로는 즉시 대응, 새 최고치에서는 자동 확장 |
| 품질 | 프로비저닝 모드와 같은 한 자릿수 밀리초 지연 시간, SLA, 보안 |
| 모드 전환 | 프로비저닝 → 온디맨드는 24시간 롤링 윈도우에서 최대 4회, 온디맨드 → 프로비저닝은 언제든 |

실습에서 바로 체감됩니다. **기본 설정으로 테이블을 만들면 온디맨드 모드가 됩니다.** 용량 단위(RCU·WCU·RRU·WRU)와 Auto Scaling은 모듈 7·8에서 다룹니다.

> — 출처: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

### 6.3 AWS Lambda

애플리케이션의 CRUD 작업은 여러 Lambda 함수가 구동합니다. Lambda는 워크로드 패턴에 따라 설계된 **두 가지 컴퓨팅 프리미티브**를 제공합니다.

| 항목 | Lambda Functions | Lambda MicroVMs |
|---|---|---|
| 용도 | 요청·응답 또는 이벤트 구동 워크로드(API, 데이터 처리, 자동화) | 사용자 또는 AI가 만든 신뢰할 수 없는 코드를 실행하는 영구 환경 |
| 프로그래밍 모델 | 지원 런타임에서 호출되는 핸들러 함수 | 임의 애플리케이션. 자체 바이너리 실행, 포트 수신, Linux OS 기능 사용 |
| 실행 시간 | 호출당 최대 15분. Lambda Durable Functions로 최대 1년까지 걸치는 다단계 워크플로 | 세션당 최대 8시간. 세션 간 일시 중단·재개 |
| 확장 | **자동.** Lambda가 트래픽에 따라 실행 환경을 만들고 없앰 | 개발자 제어. API로 생성·일시 중단·재개·종료 |
| 과금 | 요청당 + 실행 시간 GB-초 | 실행 중 컴퓨팅 초당 + 일시 중단 중 스냅샷 스토리지 |

두 프리미티브는 서버 관리 불필요, 사용량 기반 과금, 관리형 네트워킹, Firecracker 가상화라는 공통 기반을 공유합니다. **이 과정의 실습은 Lambda Functions 경로입니다.** 트리거로 API Gateway·Amazon S3·Amazon SQS·EventBridge 등 200개 이상의 AWS 서비스를 연결할 수 있습니다.

> — 출처: [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

### 6.4 컴퓨팅 선택은 워크로드로 정합니다 🔄

이 과정이 CRUD 워크로드에 Lambda를 쓰는 근거는 **요청·이벤트 구동이라는 워크로드 특성**입니다. "Lambda가 언제나 더 저렴하고 간단하다"가 아닙니다. 컴퓨팅 서비스 선택 결정 안내서는 컴퓨팅 선택을 열 가지 요소의 균형 문제로 제시합니다(워크로드 유형, 성능, 확장성, 관리 오버헤드, 비용 최적화, 지연 시간과 처리량, 컴플라이언스와 보안, 통합, 안정성과 가용성, 개발·배포 경험).

| 관점 | 결정 안내서의 서술 |
|---|---|
| EC2 관리 부담 | 서버 **설정·확장·패치·보안**에 대한 책임을 포함하고 전담 운영 팀을 요구할 수 있음 |
| 그 부담의 평가 | 컴퓨팅 환경에 대한 **세밀한 제어가 필요한 사용 사례에서는 그 오버헤드가 정당화되는 경우가 많다** |
| Lambda의 이점 | 서버를 관리할 필요 없이 이벤트에 응답해 코드를 실행해 **운영 부담을 줄임** |
| 비용 최적화 경로 | **인스턴스 선택**(750종 이상, AWS Graviton 기반이 비교 대상 대비 최대 40% 더 나은 가격 대비 성능), **구매 플랜**(Savings Plans 최대 72% 절감, Spot Instances 최대 90% 할인), **적정 크기 조정**(EC2 Auto Scaling, Compute Optimizer 최대 25% 절감, AWS Trusted Advisor) |
| 선택의 성격 | **단일 워크로드에서 여러 유형의 컴퓨팅 솔루션을 함께 사용할 수 있음** |

관리형 컨테이너 서비스는 제어와 편의 사이의 중간 지점을 제공합니다. 컴퓨팅 서비스 비교는 모듈 9가 자세히 다룹니다.

> — 출처: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html)

---

## 7. 연결과 액세스: API Gateway와 Amazon Cognito

**Amazon API Gateway**는 앞의 서비스들을 하나로 묶어 사용자와 백엔드 사이의 요청을 전달합니다. **Amazon Cognito**는 그 앞에 서서 사용자를 인증합니다.

### 7.1 Amazon API Gateway가 하는 일

API Gateway는 사용자와 컴퓨팅·데이터베이스·스토리지 서비스 사이에서 이벤트 기반 요청을 전달하고, 특정 태스크에 적합한 API를 생성·게시·유지 관리·모니터링·보호하는 과정을 간소화합니다. 요청 흐름은 다음과 같습니다.

```text
  사용자가 요청 ──▶ API Gateway 가 AWS 리소스로 라우팅 ──▶ 응답을 사용자에게 다시 전송
```

### 7.2 만들 수 있는 API는 세 가지 🔄

API Gateway는 어떤 규모에서도 **REST·HTTP·WebSocket** 세 가지 API를 생성·게시·유지 관리·모니터링·보호합니다.

| API 유형 | 성격 |
|---|---|
| REST | 무상태. HTTP 기반이고 `GET`·`POST`·`PUT`·`PATCH`·`DELETE` 같은 표준 HTTP 메서드 구현 |
| HTTP | 무상태. RESTful API 제품이며 **더 낮은 가격으로 제공하기 위해 최소 기능으로 설계** |
| WebSocket | **상태 저장.** WebSocket 프로토콜을 따라 양방향 통신을 가능하게 하고 메시지 내용에 따라 라우팅 |

한쪽을 일률적으로 권장하지 않고 **기능·가격 기준으로** 고릅니다.

| 필요한 기능 | 선택 |
|---|---|
| API 키, 클라이언트별 스로틀링, 요청 검증, AWS WAF 통합, 프라이빗 API 엔드포인트 | **REST API** |
| 위 기능이 필요 없음 | **HTTP API**(더 저렴) |

주요 차이를 몇 개 더 보면, 엔드포인트 유형에서 REST는 edge-optimized·regional·private을 모두 지원하고 HTTP는 regional만 지원합니다. 권한 부여에서 REST는 Amazon Cognito를 직접 지원하고 HTTP는 JWT 권한 부여자를 통해 Cognito를 씁니다. 테스트 호출·캐싱·요청 검증·카나리 릴리스 배포·개발자 포털은 REST만, 자동 배포는 HTTP만 지원합니다. **이 과정이 REST API를 쓰는 것은 적절한 선택입니다.** API 유형과 통합 방식은 모듈 10이 자세히 다룹니다.

> — 출처: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 7.3 API Gateway의 역할과 로깅 🆕

API Gateway는 애플리케이션이 백엔드 서비스(Amazon EC2에서 실행되는 워크로드, AWS Lambda에서 실행되는 코드, 웹 애플리케이션, 실시간 통신 애플리케이션)의 데이터·비즈니스 로직·기능에 액세스하는 **'프런트 도어(front door)'** 역할을 합니다. 트래픽 관리, 권한 부여와 액세스 제어, 모니터링, API 버전 관리를 포함해 초당 수십만 건의 동시 API 호출을 처리합니다.

로깅은 **CloudWatch 액세스 로깅·실행 로깅**(경보 설정 포함)과 **CloudTrail 로깅**으로 이뤄집니다. 그 밖의 기능으로 IAM 정책·Lambda 권한 부여자 함수·Amazon Cognito 사용자 풀을 쓰는 인증, 카나리 릴리스 배포, CloudFormation 템플릿으로 API 생성, 사용자 지정 도메인 이름, **AWS WAF 통합**, 성능 지연 파악·분류를 위한 **AWS X-Ray 통합**이 있습니다. API Gateway는 AWS Lambda와 함께 **AWS 서버리스 인프라의 앱 대면 부분**을 이룹니다.

> — 출처: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 7.4 Amazon Cognito의 두 구성 요소

Amazon Cognito는 웹·모바일 앱을 위한 자격 증명 플랫폼입니다. 사용자 디렉터리, 인증 서버, OAuth 2.0 액세스 토큰과 AWS 자격 증명에 대한 권한 부여 서비스로 이뤄집니다. 두 구성 요소는 서로 독립적으로도, 함께도 쓸 수 있습니다.

| 구성 요소 | 언제 만드는가 | 무엇을 하는가 | 독립성 |
|---|---|---|---|
| 사용자 풀(user pool) | 앱이나 API에 대해 사용자를 **인증·권한 부여**할 때 | 사용자 디렉터리. 자체 서비스 및 관리자 주도 사용자 생성·관리·인증. 앱·웹 서버·API로 인증된 JWT를 직접 발급 | 자격 증명 풀과의 통합을 **요구하지 않음** |
| 자격 증명 풀(identity pool) | 인증된 사용자 또는 익명 사용자에게 **AWS 리소스 액세스**를 허용할 때 | AWS 자격 증명을 발급. 역할 기반·속성 기반 액세스 제어로 권한 관리. 게스트 사용자용 자격 증명도 선택적으로 발급 | 사용자 풀과의 통합을 **요구하지 않음** |

두 요소를 함께 쓰면 Pollynotes의 인증 흐름이 됩니다.

```text
  1) 사용자 풀 로그인 ──▶ OAuth 2.0 토큰 발급
  2) 그 토큰을 자격 증명 풀에서 임시 AWS 자격 증명으로 교환
  3) 그 자격 증명으로 Amazon S3 · Amazon DynamoDB 등에 권한 있는 액세스
```

Pollynotes의 사용자 → Cognito → API Gateway → Lambda → DynamoDB·S3 경로가 이 흐름입니다.

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.5 로그인 화면과 요금제 🔄

사용자 풀이 가입·로그인 화면을 제공한다는 점은 그대로이고, 실습에서 콘솔 화면이 달라 보일 지점이 두 곳 있습니다.

**로그인 화면.** 브랜딩 버전이 두 개입니다.

| 버전 | 서술 |
|---|---|
| **managed login** | 최신 버전. 브랜딩 편집기로 사용자 지정 |
| hosted UI (classic) | managed login의 **"더 얇고 덜 사용자 지정 가능한 선행 버전"** |

둘 다 가입·로그인·암호 관리를 지원하고, 여기에는 다중 인증(MFA) 완료와 webAuthn 인증자 등록이 포함됩니다. 알아 둘 제약이 몇 가지 있습니다.

| 항목 | 내용 |
|---|---|
| 프로필 관리 | managed login은 속성 변경·MFA 기본 설정 같은 **사용자 자기 서비스 프로필 관리를 지원하지 않음.** 애플리케이션 코드로 직접 구현해야 함 |
| 세션 쿠키 | 로그인하면 브라우저에 쿠키가 설정되고 같은 인증 방법으로 **한 시간** 동안 다시 로그인 가능. 쿠키로 재로그인해도 쿠키 기간은 연장되지 않음 |
| TLS | managed login은 사용자 지정 도메인과 접두사 도메인 **모두 TLS 1.2 요구.** classic hosted UI는 사용자 지정 도메인에 요구하지 않음 |
| CORS | 두 버전 모두 사용자 지정 CORS 오리진 정책을 **지원하지 않음.** CORS 정책은 애플리케이션 프런트 엔드에 구현 |
| 브랜딩 스타일 자동 할당 | 콘솔에서 앱 클라이언트를 만들면 자동 할당. `CreateUserPoolClient`로 만들면 `CreateManagedLoginBranding`을 호출할 때까지 managed login을 쓸 수 없음 |

> — 출처: [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

**기능 요금제.** 사용자 풀마다 기능 요금제를 고릅니다.

| 요금제 | 포함 |
|---|---|
| Lite | 월 활성 사용자가 적은 사용자 풀용 저비용 요금제. 로그인 기능과 **classic hosted UI** 포함. 액세스 토큰 사용자 지정·패스키 인증 같은 최신 기능은 미포함 |
| **Essentials** | **신규 사용자 풀의 기본값.** 최신 사용자 풀 인증 기능 전체. 선택 기반 로그인(choice-based sign-in), 이메일 MFA 같은 고급 인증 기능 |
| Plus | Essentials의 모든 것 + 위협 보호. 로그인·가입·암호 관리 요청에서 침해 지표를 모니터링(예상치 못한 위치에서의 로그인, 공개 유출된 암호 감지) |

| 항목 | 내용 |
|---|---|
| 적용 단위 | **사용자 풀 하나.** 같은 계정의 다른 사용자 풀은 다른 요금제를 가질 수 있지만 사용자 풀 안의 앱 클라이언트별로 다르게 둘 수는 없음 |
| API·CLI | `CreateUserPool`·`UpdateUserPool`의 `UserPoolTier` 파라미터. 값을 지정하지 않으면 `Essentials`. AWS CLI는 `--user-pool-tier` 인자 |
| 전환 | 언제든 요금제를 바꿀 수 있음. 일부 전환은 활성 기능을 먼저 꺼야 함 |

> — 출처: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

---

## 8. 관측 가능성: CloudWatch와 X-Ray

애플리케이션에는 문제를 찾아 고치기 위한 모니터링·문제 해결이 필요합니다. **Amazon CloudWatch**가 실행 가능한 인사이트를 제공하고, **AWS X-Ray**가 분산 애플리케이션의 분석과 디버깅을 돕습니다.

### 8.1 추적은 CloudWatch 안으로 들어왔습니다 🔄

추적(tracing)은 이제 CloudWatch 관찰 가능성의 일부로 다뤄집니다.

| CloudWatch 항목 | 추적이 등장하는 지점 |
|---|---|
| CloudWatch 에이전트 | Amazon EC2 플릿에서 **지표·로그·추적**을 함께 수집 |
| 교차 계정 관찰 가능성 | 중앙 모니터링 계정에서 소스 계정의 **지표·로그·추적**을 조회 |
| OpenTelemetry 지원 | 네이티브 OTLP 엔드포인트로 **지표·로그·추적**을 OpenTelemetry 표준으로 수집. PromQL 쿼리 지원 |

관측 영역에 추가된 기능도 있습니다.

| 항목 | 내용 |
|---|---|
| Application Signals | 수동 계측이나 코드 변경 없이 지연 시간·오류율·요청률 같은 핵심 성능 지표를 자동 감지·모니터링. 큐레이션된 대시보드 제공 |
| CloudWatch Synthetics | canary라는 구성 가능한 스크립트로 엔드포인트·API를 사전 모니터링 |
| CloudWatch RUM | 실제 사용자 세션에서 성능 데이터 수집 |
| 서비스 수준 목표(SLO) | 신뢰성 목표를 정의·추적·경보. 오류 예산 설정과 SLO 준수 모니터링 |
| Lambda Insights | Lambda 함수의 메모리·CPU 사용률과 **콜드 스타트 감지·분석** |

> — 출처: [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

### 8.2 X-Ray 콘솔의 현재 상태 🔄

X-Ray 서비스는 종료되지 않았습니다. 달라진 것은 **화면 경로**입니다. 문서는 **"AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"** 고 명시합니다.

| 항목 | 현재 상태 |
|---|---|
| 사용 가능한 콘솔 | Amazon CloudWatch 콘솔 **또는** X-Ray 콘솔 |
| 개발 상태 | X-Ray 콘솔은 **더 이상 개발되지 않음.** CloudWatch 콘솔에 X-Ray 콘솔에서 다시 설계한 새 X-Ray 기능이 포함됨 |
| Service map | X-Ray Service map과 CloudWatch ServiceLens map이 CloudWatch 콘솔의 **X-Ray trace map**으로 통합. 왼쪽 탐색 창의 `X-Ray traces` → `Trace Map` |
| Insights | X-Ray Insights도 CloudWatch 콘솔의 `Insights`에 포함 |
| 서비스 단위 관찰 | CloudWatch **Application Signals.** SLO 기반 상태 지표에서 상관된 X-Ray 추적으로 내려가 문제 해결 |
| 함께 보기 | CloudWatch 콘솔에서 CloudWatch 로그·지표와 X-Ray 추적 데이터를 한 화면에서 조회 |

실습 7(모듈 14)의 화면 경로가 달라지는 지점입니다.

> — 출처: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 9. 교재 대비 변경 사항

수강생이 공식 교재를 함께 볼 수 있으므로, 이 자료가 교재와 어디서 갈라지는지 한곳에 모았습니다. 앞 장에서 신규·교정으로 표시한 항목의 근거가 여기 있습니다.

M02는 개요 모듈이라 기술적 오류보다 **프레이밍 교정과 콘솔·문서 위치 이동**이 많습니다. 이 모듈에서 **지원이 종료된 항목은 없습니다.**

### 9.1 교재와 다른 점

| 항목 | 교재의 서술 | 지금 확인된 내용 | 근거 |
|---|---|---|---|
| API 유형 | `REST API` 하나만 제시 | **REST·HTTP·WebSocket** 세 가지가 있고 기능·가격 기준으로 고릅니다. API 키·클라이언트별 스로틀링·요청 검증·AWS WAF 통합·프라이빗 엔드포인트가 필요하면 REST, 필요 없으면 더 저렴한 HTTP입니다. 이 과정이 REST를 쓰는 것 자체는 적절합니다 | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| 콘솔의 기능 범위 | 콘솔이 필요한 **모든 기능**을 지원한다 | 동등성은 **IaaS** 관리·운영·액세스 기능으로 한정되고 방향도 반대입니다. "콘솔의 모든 IaaS 기능이 AWS API·AWS CLI에서 제공되고, 새 IaaS 기능은 출시 시점 또는 **180일** 안에 도달한다"입니다. 콘솔이 모든 기능의 상위 집합은 아닙니다 | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |
| DynamoDB 정의 | `완전관리형 NoSQL 데이터베이스 서비스로서 원활한 확장성과 함께 빠르고 예측 가능한 성능` | 현재 정의는 **"어떤 규모에서도 한 자릿수 밀리초 성능을 내는 서버리스 완전 관리형 분산 NoSQL 데이터베이스"** 입니다. 성능 서술이 구체화되고 `서버리스`·`분산`이 정의에 들어왔습니다 | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| DynamoDB 용량 모드 | 용량 모드 구분 없이 `용량 크기 조정`이라고만 제시 | **온디맨드 모드가 기본이자 권장 처리량 옵션**입니다. 기본 설정으로 테이블을 만들면 온디맨드가 되므로 실습 화면이 예전 캡처와 다를 수 있습니다 | [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| AWS Lambda의 범위 | Lambda를 함수 하나의 개념으로 제시 | **Lambda Functions**와 **Lambda MicroVMs** 두 컴퓨팅 프리미티브가 있습니다. 이 과정의 실습은 Lambda Functions 경로입니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| EC2와 Lambda의 대비 | EC2는 유지 관리가 필요하고 Lambda로 옮기면 비용을 절감한다 | 유지 관리 부분은 방향이 같지만, 컴퓨팅 선택은 **열 가지 요소의 균형** 문제이고 "세밀한 제어가 필요한 사용 사례에서는 그 오버헤드가 **정당화되는 경우가 많다**"고 봅니다. 비용도 Lambda 이전이 아니라 인스턴스 선택·구매 플랜·적정 크기 조정으로 접근하며, **단일 워크로드에 여러 컴퓨팅을 함께 쓸 수 있습니다.** Lambda 선택의 근거는 비용이 아니라 요청·이벤트 구동 워크로드라는 특성입니다 | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html) |
| 프런트엔드 호스팅 방식 | S3 버킷에 직접 정적 웹 사이트 호스팅 | 1순위 권장은 **AWS Amplify Hosting**(CloudFront 기반 전역 CDN, 공개 HTTPS URL 생성)입니다. 버킷이 **SSE-KMS로 암호화된 경우 CloudFront + OAC가 필수**입니다 | [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| Cognito 로그인 화면 | `기본 제공 가입 및 로그인 옵션` | 브랜딩 버전이 **managed login**과 **hosted UI (classic)** 두 개이고, classic은 managed login의 "더 얇고 덜 사용자 지정 가능한 선행 버전"입니다. managed login은 자기 서비스 프로필 관리를 지원하지 않아 그 부분은 앱 코드로 구현합니다 | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| 관찰과 추적의 분리 | 관찰은 CloudWatch, 추적은 X-Ray로 서비스 단위 배정 | CloudWatch가 추적을 관찰 가능성의 일부로 다룹니다(에이전트가 지표·로그·추적을 함께 수집, 교차 계정 관찰에서 추적 조회, OTLP 엔드포인트로 추적 수집) | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| AWS X-Ray 콘솔 | X-Ray를 독립 콘솔로 제시 | X-Ray 콘솔은 **비권장**입니다("AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"). X-Ray 서비스 자체는 종료되지 않았고, 화면은 **CloudWatch 콘솔**의 `X-Ray traces` → `Trace Map`으로 옮겨졌습니다 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

### 9.2 이 자료에서 더한 점

각 항목은 개요 이해에 필요해서 더했습니다. 상세는 표에 적은 담당 모듈에서 다룹니다.

| 더한 항목 | 왜 더했는가 | 근거 |
|---|---|---|
| 서버리스 핵심 서비스 조합 | 교재가 세 서비스를 "서버리스"로 묶기만 하므로, IAM을 더한 네 가지가 서버리스 솔루션의 핵심이라는 안내서 관점을 더해 Pollynotes 구성의 근거를 보였습니다 | [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html) |
| API Gateway HTTP·WebSocket API | REST 하나만 알면 API 유형 선택지가 있다는 것을 놓치므로, 무상태 HTTP(최소 기능·저가)와 상태 저장 WebSocket을 함께 정리했습니다 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| API Gateway의 AWS WAF·X-Ray 통합 | 실무에서 API 앞단 방어와 지연 분석에 바로 쓰이는 통합이라, 카나리 배포·CloudFormation 생성과 함께 더했습니다 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| Cognito 기능 요금제(Lite·Essentials·Plus) | 사용자 풀을 만들 때 반드시 만나는 선택이고 기본값이 Essentials이므로, 실습 화면과 요금을 이해하도록 더했습니다 | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Cognito managed login과 브랜딩 편집기 | 로그인 화면 이름과 사용자 지정 방식이 바뀌어 실습 콘솔이 달라 보이므로, 선택 기반 로그인·이메일 MFA·패스키와 함께 더했습니다 | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| CloudWatch Application Signals·Synthetics·RUM·SLO | 관측을 지표·로그·추적으로만 이해하면 현재 APM 도구를 놓치므로, 수동 계측 없는 관측 도구들을 더했습니다. Lambda Insights는 콜드 스타트 분석을 제공합니다 | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| CloudWatch OpenTelemetry 지원 | 표준 계측으로 CloudWatch와 서드파티에 함께 보낼 수 있어 실무 관측 설계에 중요하므로 더했습니다 | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| AWS SAM의 IaC 도구 비교 | 배포 레이블만으로는 SAM을 언제 쓰는지 알 수 없으므로, CloudFormation·CDK와의 선택 기준과 커넥터·`sam sync`·Terraform 지원을 더했습니다 | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| Lambda MicroVMs와 Durable Functions | Lambda의 범위가 함수 하나보다 넓어졌음을 보이기 위해 더했습니다. MicroVMs는 최대 8시간 상태 유지, Durable Functions는 최대 1년 워크플로입니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| IDE별 AWS Toolkit | `도구 키트`가 실제로 어떤 제품인지 보이도록 IDE별 Toolkit과 공유 기준 문서를 더했습니다 | [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html) |

### 9.3 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 아키텍처 그림의 정확한 화살표 방향 | [2장](#2-pollynotes-아키텍처)의 요소–서비스 대응은 각 서비스의 역할이 명시하는 범위까지만 정리했습니다. 어떤 화살표가 정확히 어디로 향하는지는 실습 아키텍처를 직접 확인하세요 |
| EC2 관리 부담을 줄이는 관리형 옵션 | 결정 안내서에서 확인한 것은 EC2 관리 책임의 범위(설정·확장·패치·보안)와 그 오버헤드가 정당화될 수 있다는 서술, Elastic Beanstalk이 관리형 업데이트를 제공한다는 언급까지입니다. **AWS Systems Manager Patch Manager 같은 패치 자동화가 유지 관리 부담을 얼마나 완화하는지는 확인하지 않았습니다** |
| Lambda MicroVMs·Durable Functions의 세부 동작 | 두 기능의 존재와 상위 특성(최대 8시간 세션, 최대 1년 워크플로, 과금 단위)은 Lambda 개요 문서로 확인했습니다. **각 기능의 전용 안내서는 조회하지 않았습니다.** 이 개요 모듈의 범위를 넘어서므로 존재와 위치만 남겼습니다. M09도 같은 항목을 같은 이유로 남겼습니다 |
| API Gateway 통합 유형과 Pollynotes가 실제로 쓰는 구성 | 확인한 것은 API 유형 세 가지와 그 기능 차이입니다. **이 과정의 API가 실제로 어떤 통합 유형(Lambda 프록시·비프록시 등)과 스테이지 구성을 쓰는지는 이 모듈의 범위 밖입니다.** 모듈 10과 실습 5의 대상입니다 |
| Cognito 요금제 선택이 이 과정 실습에 미치는 영향 | 신규 사용자 풀 기본값이 Essentials라는 것과 요금제별 기능 차이는 확인했습니다. **이 과정의 실습 6(캡스톤)이 어느 요금제를 전제하는지는 실습 가이드를 확인해야 합니다** |
| 각 서비스의 할당량·요금 수치 | 이 모듈은 개요 모듈이라 서비스별 할당량과 요금을 다루지 않습니다. 스토리지는 모듈 5·6, 데이터베이스는 모듈 7·8, 컴퓨팅은 모듈 9의 해당 절을 보세요 |
