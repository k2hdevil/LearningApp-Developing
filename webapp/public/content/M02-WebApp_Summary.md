# 모듈 2: AWS에 웹 애플리케이션 구축

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [반복되는 아키텍처 다이어그램](#2-반복되는-아키텍처-다이어그램)
3. [애플리케이션 개요](#3-애플리케이션-개요)
4. [개발자 도구](#4-개발자-도구)
5. [저장과 호스팅: Amazon S3](#5-저장과-호스팅-amazon-s3)
6. [데이터 관리와 처리: DynamoDB와 Lambda](#6-데이터-관리와-처리-dynamodb와-lambda)
7. [연결과 액세스: API Gateway와 Amazon Cognito](#7-연결과-액세스-api-gateway와-amazon-cognito)
8. [관측 가능성: CloudWatch와 X-Ray](#8-관측-가능성-cloudwatch와-x-ray)
9. [교재 대비 변경 사항](#9-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [9장](#9-교재-대비-변경-사항)에 정리했습니다.
> - 교재 안에서 표기가 서로 어긋나는 항목은 AWS 문서로 판별할 대상이 아니므로 🆕·🔄 없이 본문에서 짚고 [9.1절](#91-교재-기술이-사실과-다른-항목)에 모았습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

이 모듈은 **아키텍처 워크스루**입니다. 과정 내내 만들 애플리케이션(Pollynotes)의 전체 그림을 한 번 펼쳐 놓고, 슬라이드마다 그림의 한 조각을 강조하면서 거기에 쓰이는 AWS 서비스를 소개합니다. 깊은 기술 상세는 이 모듈에 없습니다. 스토리지는 모듈 5·6, 데이터베이스는 모듈 7·8, 컴퓨팅은 모듈 9, API는 모듈 10, 사용자 액세스는 모듈 12, 관측은 모듈 14에서 다룹니다. 이 문서도 그 깊이까지 들어가지 않고 개요 수준에 머무릅니다.

### 모듈 목표

교재 슬라이드 3을 그대로 옮깁니다.

| # | 목표 |
|---|---|
| 1 | 이 과정 중에 구축할 애플리케이션의 아키텍처 설명 |
| 2 | 웹 애플리케이션 구축에 필요한 AWS 서비스 나열 |
| 3 | 웹 애플리케이션을 저장, 관리, 호스팅하는 방법 확인 |

### 이 문서의 구성

| 슬라이드 | 제목 | 강조하는 것 | 이 문서 |
|---|---|---|---|
| 2 | (제목 없음) | 1일 차 오전 어젠다 상자와 실습 환경 다이어그램 | 1장 |
| 3 | 모듈 목표 | (다이어그램 없음) | 1장 |
| 4·5 | 애플리케이션 구축(1/2)(2/2) | 전체 아키텍처 | [3장](#3-애플리케이션-개요) |
| 6 | 개발자 도구 | IDE · 개발자 · AWS SDK · 도구 키트 · IAM | [4장](#4-개발자-도구) |
| 7 | 애플리케이션 저장 및 호스팅 | Amazon S3 | [5장](#5-저장과-호스팅-amazon-s3) |
| 8 | 사용자 저장 데이터 관리 | DynamoDB | [6장](#6-데이터-관리와-처리-dynamodb와-lambda) |
| 9 | 사용자 저장 데이터 처리 | AWS Lambda | [6장](#6-데이터-관리와-처리-dynamodb와-lambda) |
| 10 | 모든 서비스 연결 | Amazon API Gateway | [7장](#7-연결과-액세스-api-gateway와-amazon-cognito) |
| 11 | 사용자 액세스 | Amazon Cognito | [7장](#7-연결과-액세스-api-gateway와-amazon-cognito) |
| 12 | 애플리케이션을 관측가능하게 설정 | Amazon CloudWatch · AWS X-Ray | [8장](#8-관측-가능성-cloudwatch와-x-ray) |
| 13 | 애플리케이션 | 전체 아키텍처 (마무리) | [3장](#3-애플리케이션-개요) |
| 1·14 | 표지, 감사합니다 | (레이아웃만. 옮길 원문 없음) | — |

### 이 덱에 없는 것

| 항목 | 내용 |
|---|---|
| 지식 확인 문제 | 이 덱에는 참/거짓 문제 슬라이드가 없습니다 |
| 코드 | 코드 블록으로 옮길 원문이 한 줄도 없습니다. 이 문서에도 코드가 없습니다 |
| 서비스별 상세 | 각 서비스가 개요 한두 줄로만 소개됩니다. 상세는 해당 모듈로 넘어갑니다 |

### 슬라이드 2: 어젠다와 실습 환경

슬라이드 2에는 **제목이 없습니다.** 레이아웃은 제목 슬라이드인데 제목 텍스트가 비어 있어 추출 대장에도 `슬라이드 2`로만 표기됩니다([9.1절](#91-교재-기술이-사실과-다른-항목)). 내용은 1일 차 오전 어젠다와 실습 환경 다이어그램입니다.

| 항목 | 상자에 적힌 제목 |
|---|---|
| 모듈 1 | 과정 개요 |
| 모듈 2 | AWS에 웹 애플리케이션 빌드 |
| 모듈 3 | AWS에서 개발 시작하기 |
| 모듈 4 | 권한 시작하기 |
| 실습 1 | 개발 환경 구성 |

**모듈 이름이 두 군데에서 어긋납니다.** 모듈 2는 슬라이드 1 부제가 `모듈 2: AWS에 웹 애플리케이션 구축`인데 이 상자는 `AWS에 웹 애플리케이션 빌드`입니다. 같은 덱 안에서 `구축`과 `빌드`가 갈립니다. 모듈 4는 이 상자가 `권한 시작하기`인데 M04 덱 표지는 `모듈 4: 권한 부여 시작하기`입니다. 모듈 1의 어젠다(M01 슬라이드 7)도 두 항목을 이 상자와 똑같이 적으므로, **어젠다 두 곳은 서로 일치하고 모듈 덱 표지만 다릅니다.** 모듈 3은 어젠다와 덱 표지가 일치합니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

다이어그램 요소는 다음과 같습니다.

| 구분 | 텍스트 |
|---|---|
| 행위자 | 본인 |
| 접속 방법 | `다음을 사용하여 연결:` Guacamole / SSH / 원격 데스크톱 |
| 경계 | AWS 클라우드 |
| EC2 인스턴스 콘텐츠 | IDE, AWS 도구 및 SDK, AWS CLI |
| 그 밖의 레이블 | Amazon Simple Storage Service(Amazon S3), AWS Identity and Access Management(AWS IAM), IAM 역할, AWS STS, AWS CloudFormation |

접속 방법이 세 가지(Guacamole / SSH / 원격 데스크톱)인데, M01 슬라이드 7의 같은 상자는 두 가지(`Guacamole 또는 원격 데스크톱`)이고 같은 슬라이드 강사 노트는 또 다른 세 가지(`Guacamole, 원격 데스크톱 또는 브라우저 기반 옵션`)입니다. 세 곳이 모두 다르고 특히 `SSH`는 M01 어디에도 없습니다. 실습 환경 운영 사항이라 이 문서에서 확정할 수 없습니다([9.5절](#95-검증하지-못한-항목)).

`AWS Identity and Access Management(AWS IAM)` 표기는 이 슬라이드에만 나옵니다. 문서상 약어는 `IAM`이고, 같은 덱의 슬라이드 6 강사 노트와 슬라이드 13 다이어그램은 `(IAM)`으로 올바르게 적습니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

---

## 2. 반복되는 아키텍처 다이어그램

**슬라이드 4부터 13까지는 모두 같은 그림입니다.** 슬라이드마다 그림의 다른 요소를 강조하는 것뿐입니다. 그래서 이 문서는 그림을 여기서 한 번만 펼쳐 놓고, 이후 장에서는 각 슬라이드가 무엇을 강조하는지만 다룹니다.

### 2.1 그림에 등장하는 요소

| 구분 | 요소 |
|---|---|
| 행위자 | 최종 사용자 |
| 경로 | 웹 사이트 호스팅 / MP3 호스팅 / 애플리케이션 API 호출 |
| 노트 작업 | 나열(List) / 검색(Search) / 삭제(Delete) / 생성·업데이트(Create/Update) |
| 음성 | 명령(Dictate) |
| 경계 | AWS 클라우드 |
| 서비스 레이블 | DynamoDB, IAM, Amazon Cognito, Amazon APIGateway, Amazon Polly, AWS X-Ray, AWS SAM, Amazon CloudWatch |

**레이블 언어가 슬라이드마다 섞입니다.** 노트 작업과 음성 레이블이 슬라이드 4·5·9·11·13에서는 영어(`List` / `Search` / `Delete` / `Create/Update` / `Dictate`)이고 슬라이드 6·7·8·10·12에서는 한국어(`나열` / `검색` / `삭제` / `생성/업데이트` / `명령`)입니다. `애플리케이션API 호출`(슬라이드 4·5·13)과 `애플리케이션 API 호출`(슬라이드 6~12)의 공백 유무도 갈립니다. 위 표는 한국어를 기준으로 정리하고 영어 원 레이블을 괄호에 함께 적었습니다([9.1절](#91-교재-기술이-사실과-다른-항목)).

서비스 레이블 `Amazon APIGateway`도 공백이 빠진 표기입니다. 정확한 이름은 `Amazon API Gateway`이고, 같은 덱의 슬라이드 10 본문과 강사 노트는 올바르게 적습니다. **M01도 같은 항목을 기록했습니다**([9.1절](#91-교재-기술이-사실과-다른-항목)).

### 2.2 요소와 서비스의 대응

교재는 이 대응을 슬라이드 4~13에 걸쳐 흩어 놓습니다. 한 표로 모으면 다음과 같습니다.

| 다이어그램 요소 | 담당 서비스 | 소개 슬라이드 | 상세 모듈 |
|---|---|---|---|
| 웹 사이트 호스팅 | Amazon S3 | 7 | 모듈 6 |
| MP3 호스팅 | Amazon S3 | 7 | 모듈 6 |
| 나열 / 검색 / 삭제 / 생성·업데이트 (비즈니스 로직) | AWS Lambda | 9 | 모듈 9 |
| 사용자 노트 및 상호 작용 저장 | Amazon DynamoDB | 8 | 모듈 7·8 |
| 애플리케이션 API 호출 | Amazon API Gateway | 10 | 모듈 10 |
| 사용자 인증 | Amazon Cognito | 11 | 모듈 12 |
| 명령(Dictate) → 음성 변환 | Amazon Polly | 4 | — |
| 오류·성능 저하 감지, 데이터 추적 | Amazon CloudWatch, AWS X-Ray | 12 | 모듈 14 |
| 안전한 액세스 관리 | IAM | 6 | 모듈 4 |
| 배포 | AWS SAM | (레이블만) | 모듈 13 |

`AWS SAM`은 다이어그램 레이블로만 나오고 이 덱의 강사 노트는 설명하지 않습니다. 현재 문서의 위치는 [4.3절](#43-aws-sdk와-도구-키트의-현재-이름)에 정리했습니다.

---

## 3. 애플리케이션 개요

슬라이드 4·5와 마무리 슬라이드 13입니다. 세 슬라이드가 같은 전체 그림을 쓰고 강조점만 다릅니다.

### 3.1 무엇을 만드는가 (슬라이드 4)

| 슬라이드 본문 | 강사 노트에서 확인되는 내용 |
|---|---|
| 완전히 작동하는 웹 애플리케이션 | Amazon Cognito로 인증된 사용자가 Amazon Polly를 사용해 음성으로 변환된 사용자 지정 노트를 추가할 수 있다 |
| 사용자 인증 | 사용자는 오디오 노트를 검색·나열·삭제할 수 있는 웹 포털에 인증한다 |
| CRUD 운영 | 문자 음성 변환(TTS) 애플리케이션을 구축하려면 AWS 환경에 연결하는 방법을 이해해야 한다 |

강사 노트는 이 슬라이드 다음에 "AWS 서비스가 상호 운용되는 방식을 보여 주는 전체 아키텍처 뷰를 검토해야 한다"로 넘어갑니다. 그 전체 뷰가 [2장](#2-반복되는-아키텍처-다이어그램)의 그림입니다.

### 3.2 어떤 방식으로 만드는가 (슬라이드 5)

| 슬라이드 본문 | 강사 노트에서 확인되는 내용 |
|---|---|
| 모든 것을 AWS 클라우드에서 진행 | 클라우드 네이티브 애플리케이션을 구축한다 |
| 마이크로서비스 중심 | Amazon API Gateway, AWS Lambda, Amazon DynamoDB 같은 서버리스 애플리케이션을 사용한다 |
| AWS 개발 도구 | AWS Management Console만 사용하지 않는다. AWS SDK 같은 AWS 개발 도구를 사용하는 방법을 배우고, 애플리케이션을 구축하면서 추가 도구를 활용한다 |

### 3.3 서버리스 핵심 서비스 조합 🆕

교재가 "서버리스 애플리케이션"으로 묶은 세 서비스(API Gateway · Lambda · DynamoDB)는 현재 AWS 서버리스 개발자 안내서가 제시하는 핵심 서비스 집합과 그대로 겹칩니다. 안내서는 여기에 IAM을 더해 네 가지를 서버리스 솔루션 구현의 핵심으로 제시합니다.

| 서비스 | 안내서가 부여한 역할 |
|---|---|
| AWS Identity and Access Management | AWS에서 리소스에 안전하게 액세스 |
| AWS Lambda | 서버리스 컴퓨팅 기능 |
| Amazon API Gateway | `HTTP`·`HTTPS` 요청을 서비스와 통합해 요청 처리 |
| Amazon DynamoDB | 데이터 저장·검색 |

안내서는 서버리스 개발을 "**프로비저닝된 Amazon EC2 인스턴스 같은 장기 실행 서버를 관리하지 않고** 애플리케이션을 구축하는 것"으로 정의하고, AWS 서버리스 기술이 종량 과금이며 애플리케이션 요구에 따라 확장·축소하고 복원력을 위해 여러 AWS 리전에 걸쳐 확장되도록 만들어졌다고 기술합니다. 안내서가 인용하는 Serverless Patterns Workshop의 첫 모듈 아키텍처는 클라이언트 → REST API(API Gateway) → Lambda 함수 → DynamoDB 테이블 흐름으로, Pollynotes의 경로와 같습니다.

> — 출처: [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html)

### 3.4 아키텍처를 계속 따라간다 (슬라이드 13)

마무리 슬라이드입니다. 본문 항목 없이 그림만 있고 IAM 레이블만 `AWS Identity and Access Management(IAM)`로 풀어 씁니다. 강사 노트의 요지는 세 가지입니다.

| # | 내용 |
|---|---|
| 1 | 이 모듈에서는 애플리케이션 아키텍처와 개별 구성 요소를 소개했다 |
| 2 | 과정 전체에 걸쳐 개발 프로세스를 진행하면서 **이 아키텍처 다이어그램을 계속 따라간다** |
| 3 | 그다음 이 애플리케이션을 구축하는 데 필요한 **개발자 도구**로 개발 여정을 시작한다 |

3번이 곧 모듈 3의 주제입니다.

---

## 4. 개발자 도구

슬라이드 6입니다. 다이어그램에 개발자 쪽 요소(통합 개발 환경(IDE), 개발자, AWS 소프트웨어 개발 키트(AWS SDK), 도구 키트, IAM)가 추가됩니다.

### 4.1 슬라이드가 말하는 것

| 슬라이드 본문 | 강사 노트에서 확인되는 내용 |
|---|---|
| AWS SDK 및 도구 키트와 함께 IDE를 사용하여 AWS 리소스와 상호 작용 | 적절한 IAM 권한으로 구성된 IDE를 설정하는 방법을 배운다. 이 환경 구성을 갖추면 AWS SDK와 툴키트를 통해 AWS 서비스를 호출할 수 있다 |
| IAM을 사용하여 AWS 리소스에 대한 안전한 액세스 관리 | IAM으로 AWS 리소스 액세스를 안전하게 관리한다. IAM 계정 권한과 애플리케이션 개발 수명 주기에서 필요한 보안 프로파일을 구성하는 방법도 배운다 |

강사 노트는 "AWS에서 애플리케이션을 구축하는 방법은 여러 가지"라며 개발자가 특정 코딩 언어나 도구를 통해 AWS 클라우드와 상호 작용하는 것을 선호할 수 있다고 적고, "개발자는 AWS Management Console 인터페이스를 사용하지 않고 이러한 도구를 사용하여 애플리케이션을 구축할 수 있다"로 마무리합니다.

IAM 자체의 설명은 현재 문서와 일치합니다. IAM은 AWS 리소스에 대한 액세스를 안전하게 제어하도록 돕는 웹 서비스이고, 누가 인증(로그인)되고 권한이 부여되었는지 제어합니다. 참고로 IAM, AWS IAM Identity Center, AWS STS는 AWS 계정의 기능으로 **추가 비용 없이** 제공되며 IAM 사용자나 STS 임시 자격 증명으로 다른 서비스에 액세스할 때만 요금이 부과됩니다.

> — 출처: [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

### 4.2 "콘솔이 모든 기능을 지원한다"는 서술 🔄

강사 노트의 첫 문단은 `AWS Management Console은 액세스 권한을 획득하고 애플리케이션을 관리하는 데 필요한 모든 기능을 지원합니다`로 콘솔을 기준점에 놓습니다. 문서의 동등성 서술은 **범위와 방향이 다릅니다.**

| 항목 | 교재 | 현재 문서 |
|---|---|---|
| 기준점 | AWS Management Console | AWS API·AWS CLI |
| 서술 방향 | 콘솔이 필요한 모든 기능을 지원한다 | **콘솔의 모든 IaaS 관리·운영·액세스 기능이 API·CLI에서 제공된다** |
| 범위 | 한정 없음 | **IaaS(infrastructure as a service)** 기능 |
| 새 기능 도달 | 언급 없음 | 새 AWS IaaS 기능·서비스는 **출시 시점 또는 출시 후 180일 안에** API·CLI에서 완전한 콘솔 기능을 제공 |

즉 문서는 콘솔이 모든 기능의 상위 집합이라고 말하지 않습니다. 대신 CLI가 "최소한의 구성으로 브라우저 기반 콘솔이 제공하는 기능과 동등한 기능을 터미널에서 실행"하게 해 준다고 기술합니다. 강사 노트의 결론(콘솔 없이도 도구로 구축할 수 있다)은 문서와 방향이 같으므로, 달라지는 것은 근거 문장의 범위입니다.

> — 출처: [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)

### 4.3 AWS SDK와 도구 키트의 현재 이름 🆕

교재는 다이어그램에 `AWS 소프트웨어 개발 키트(AWS SDK)`와 `도구 키트`라는 레이블만 둡니다. 현재 문서에서 이 두 가지가 어떻게 나타나는지 확인했습니다.

| 교재 레이블 | 현재 문서 |
|---|---|
| AWS 소프트웨어 개발 키트(AWS SDK) | C++, Go, Java, JavaScript, Kotlin, .NET, PHP, Python(Boto3), Ruby, Rust, Swift용 AWS SDK. AWS CLI와 AWS Tools for Windows PowerShell도 같은 기준 문서를 공유 |
| 도구 키트 | IDE별 **AWS Toolkit**. AWS Toolkit for JetBrains, AWS Toolkit for Visual Studio, AWS Toolkit for Visual Studio Code, AWS Toolkit for Azure DevOps |

여러 SDK와 도구가 공유하는 것(공유 `config`·`credentials` 파일 또는 환경 변수를 통한 전역 구성, 인증과 액세스, 표준화된 설정 레퍼런스, AWS Common Runtime(CRT) 라이브러리, 유지 관리 정책과 버전 관리)은 `AWS SDKs and Tools Reference Guide`에 모여 있습니다. 특정 SDK·도구의 전용 안내서는 이 문서와 **함께** 봐야 합니다.

> — 출처: [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html)

**AWS SAM의 현재 위치.** 교재는 다이어그램에 `AWS SAM` 레이블만 두고 설명하지 않습니다. 현재 문서는 AWS SAM을 코드형 인프라(IaC)로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크로 기술하고, **다른 IaC 도구와의 비교를 명시**합니다. 교재에 없는 내용입니다.

| 비교 대상 | 문서의 안내 |
|---|---|
| CloudFormation | 템플릿 호환성을 유지하면서 서버리스 리소스 정의를 단순화하려면 CloudFormation 대신 SAM |
| AWS CDK | 인프라를 프로그래밍 방식이 아니라 **선언적으로** 기술하고 싶으면 CDK 대신 SAM |
| AWS CDK와 병행 | SAM CLI의 로컬 테스트 기능으로 CDK 애플리케이션을 보완해 둘을 함께 쓸 수도 있음 |

교재에 없는 주요 기능으로 리소스 간 권한을 정의하는 **AWS SAM 커넥터**, 로컬 변경을 클라우드에 계속 동기화하는 **`sam sync`**, Terraform 서버리스 애플리케이션의 로컬 디버깅·테스트 지원이 있습니다.

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

---

## 5. 저장과 호스팅: Amazon S3

슬라이드 7입니다. 다이어그램에서 `웹 사이트 호스팅`과 `MP3 호스팅` 두 상자, 그리고 `기본 웹 사이트 사용자 인터페이스`가 강조됩니다.

### 5.1 슬라이드가 말하는 것

| 슬라이드 본문 | 강사 노트에서 확인되는 내용 |
|---|---|
| Amazon S3 | AWS에는 여러 실용적인 스토리지 솔루션이 있고, 그중 Amazon S3는 **호스팅과 파일 스토리지**라는 두 가지 주요 요구 사항을 충족하는 간소화된 솔루션이다 |
| 프런트엔드 호스팅 | Pollynotes는 S3 버킷으로 애플리케이션의 프런트 엔드로 작동하는 웹 사이트를 호스팅한다 |
| 사용자 파일 스토리지 | Amazon Polly에서 생성한 MP3 파일을 같은 방식으로 저장한다 |

강사 노트는 "애플리케이션의 스토리지 솔루션은 생성·읽기·업데이트·삭제(CRUD) 작업을 위한 AWS 컴퓨팅 솔루션과도 잘 통합된다"고 덧붙입니다. 그 컴퓨팅 솔루션이 [6장](#6-데이터-관리와-처리-dynamodb와-lambda)의 Lambda입니다.

### 5.2 두 용도는 지금도 유효합니다

Amazon S3는 확장성·데이터 가용성·보안·성능을 제공하는 객체 스토리지 서비스이고, 문서가 제시하는 사용 사례 목록에 **웹 사이트와 모바일 애플리케이션이 모두** 들어 있습니다. 즉 교재의 "호스팅 + 파일 스토리지" 프레이밍 자체는 현재도 성립합니다. 기본적으로 S3 버킷과 그 안의 객체는 프라이빗이며 사용자가 만든 리소스에만 액세스할 수 있습니다.

> — 출처: [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 5.3 프런트엔드 호스팅의 권장 경로 🔄

달라진 것은 **어떻게** 호스팅하느냐입니다. 교재는 S3 버킷에 직접 정적 웹 사이트를 호스팅하는 방식만 제시하지만, 현재 문서의 1순위 권장은 다릅니다.

| 방식 | 현재 문서의 위치 |
|---|---|
| **AWS Amplify Hosting** | S3에 저장된 정적 웹 사이트 콘텐츠 호스팅의 **1순위 권장.** Amazon CloudFront 기반 전역 CDN에 배포하는 완전 관리형 서비스로, 범용 버킷 내 객체 위치를 선택해 관리형 CDN에 배포하고 **공개 HTTPS URL을 생성** |
| CloudFront + OAC | 버킷이 **SSE-KMS로 암호화된 경우 필수**(SSE-KMS는 익명 사용자를 지원하지 않음). 오리진 보호에는 OAI가 아니라 **OAC(origin access control)** 를 사용 |
| S3 웹 사이트 엔드포인트 | 교재가 제시하는 방식 |

모듈 6이 이 세 경로와 웹 사이트 엔드포인트의 제약(HTTPS 미지원 등)을 자세히 다룹니다. 이 문서는 개요 수준에서 권장 경로가 달라졌다는 사실만 남깁니다.

> — 출처: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

### 5.4 MP3를 만드는 쪽: Amazon Polly 🔄

교재는 Polly를 "문자 음성 변환(TTS)"으로만 소개하고 음성 선택지를 제시하지 않습니다. 현재 문서는 **음성 엔진 네 가지**를 명시합니다.

| 음성 엔진 | 비고 |
|---|---|
| Generative | 교재 이후 추가 |
| Long-form | 교재 이후 추가 |
| Neural | 뉴스 내레이션용 Newscaster 말하기 스타일 지원 |
| Standard | |

음성을 쓰려면 엔진과 음성 합성 API 작업을 고르고, 합성할 입력 텍스트를 제공하고, 오디오 출력 형식을 선택합니다. 요금은 **합성한 텍스트에만** 부과되고 생성된 음성을 캐시해 다시 재생하는 데는 추가 비용이 없습니다. MP3를 S3에 저장해 재생하는 이 아키텍처와 방향이 같습니다.

> — 출처: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

> — 출처: [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)

---

## 6. 데이터 관리와 처리: DynamoDB와 Lambda

슬라이드 8과 9입니다. 두 슬라이드의 본문 항목이 똑같이 `서버리스` / `용량 크기 조정`이라 나란히 봅니다.

### 6.1 슬라이드가 말하는 것

| 슬라이드 | 서비스 | 강조 | 강사 노트에서 확인되는 내용 |
|---|---|---|---|
| 8 | Amazon DynamoDB | 서버리스 / 용량 크기 조정 | 사용자가 노트를 추가·읽기·업데이트·삭제할 때 그 상호 작용을 저장할 데이터베이스가 필요하다. 확장성으로 애플리케이션의 기능적 용량 요구 사항을 충족한다. 소프트웨어를 설치·유지 관리할 필요가 없는 서버리스 솔루션이다 |
| 9 | AWS Lambda | 서버리스 / 용량 크기 조정 | 애플리케이션의 CRUD 작업을 구동할 여러 Lambda 함수를 생성한다. 이 함수들은 개발 환경에서 구성·유지 관리할 수 있는 워크로드 인식 크기 조정 솔루션을 제공한다 |

슬라이드 8의 다이어그램은 `DynamoDB 테이블에 저장된 사용자 노트 및 상호 작용`을, 슬라이드 9는 `비즈니스 로직` 상자와 그 안의 네 CRUD 작업 + `Dictate`를 강조합니다.

### 6.2 DynamoDB 서술의 현재 문장 🔄

교재 강사 노트는 DynamoDB를 `완전관리형 NoSQL 데이터베이스 서비스로서 원활한 확장성과 함께 빠르고 예측 가능한 성능을 제공`한다고 적습니다. 현재 문서의 첫 문장은 다릅니다.

| 항목 | 교재 | 현재 문서 |
|---|---|---|
| 정의 문장 | 완전관리형 NoSQL 데이터베이스 서비스 | **서버리스, 완전 관리형, 분산** NoSQL 데이터베이스 |
| 성능 | 원활한 확장성과 함께 빠르고 예측 가능한 성능 | 어떤 규모에서도 **한 자릿수 밀리초 성능** |

의미가 뒤집히는 오류는 아닙니다. 다만 수강생이 문서를 찾아가면 문장이 달라 보이므로 짚어 둡니다. 문서가 서버리스의 근거로 제시하는 것은 다음입니다.

| 특성 | 문서 서술 |
|---|---|
| 서버·소프트웨어 | 서버를 프로비저닝하거나 소프트웨어를 패치·관리·설치·유지 관리·운영할 필요가 없음 |
| 유지 관리 | **다운타임 없는 유지 관리.** 버전(주·부·패치)이 없고 유지 관리 기간도 없음 |
| 축소 | 온디맨드에서 트래픽이 없으면 **0까지 축소**되어 처리량 비용이 발생하지 않고 **콜드 스타트도 없음** |
| 완전 관리형 | 설정, 구성, 유지 관리, 고가용성, 하드웨어 프로비저닝, 보안, 백업, 모니터링을 서비스가 처리 |
| NoSQL | 키-값과 문서 데이터 모델 지원. **JOIN 연산자 미지원**(데이터 모델 비정규화 권장). 강력한 읽기 일관성과 ACID 트랜잭션 제공 |

> — 출처: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

### 6.3 "용량 크기 조정"의 현재 기본값 🔄

교재는 `용량 크기 조정`이라고만 적고 용량 모드를 구분하지 않습니다. 현재 문서는 **온디맨드 모드가 기본이자 권장 처리량 옵션**이라고 명시합니다.

| 항목 | 온디맨드 |
|---|---|
| 문서상 위치 | **기본이자 권장(default and recommended) 처리량 옵션** |
| 과금 | 읽기·쓰기 요청당 지불. 트래픽이 0이면 처리량 요금 없음 |
| 확장 | 이미 도달한 트래픽 수준으로는 즉시 대응, 새 최고치에서는 자동 확장 |
| 품질 | 프로비저닝 모드와 같은 한 자릿수 밀리초 지연 시간, SLA, 보안 |
| 모드 전환 | 프로비저닝 → 온디맨드는 24시간 롤링 윈도우에서 최대 4회, 온디맨드 → 프로비저닝은 언제든 |

실습에서 바로 체감됩니다. **기본 설정으로 테이블을 만들면 온디맨드 모드가 되므로** 예전 화면 캡처와 다를 수 있습니다. 용량 단위(RCU·WCU·RRU·WRU)와 Auto Scaling은 모듈 7·8에서 다룹니다.

> — 출처: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

### 6.4 Lambda의 범위 🔄

교재는 Lambda를 함수 하나의 개념으로만 다룹니다. 현재 문서는 워크로드 패턴에 따라 설계된 **두 가지 컴퓨팅 프리미티브**를 제시합니다.

| 항목 | Lambda Functions | Lambda MicroVMs |
|---|---|---|
| 용도 | 요청·응답 또는 이벤트 구동 워크로드(API, 데이터 처리, 자동화) | 사용자 또는 AI가 만든 신뢰할 수 없는 코드를 실행하는 영구 환경 |
| 프로그래밍 모델 | 지원 런타임에서 호출되는 핸들러 함수 | 임의 애플리케이션. 자체 바이너리 실행, 포트 수신, Linux OS 기능 사용 |
| 실행 시간 | 호출당 최대 15분. Lambda Durable Functions로 최대 1년까지 걸치는 다단계 워크플로 | 세션당 최대 8시간. 세션 간 일시 중단·재개 |
| 확장 | **자동.** Lambda가 트래픽에 따라 실행 환경을 만들고 없앰 | 개발자 제어. API로 생성·일시 중단·재개·종료 |
| 과금 | 요청당 + 실행 시간 GB-초 | 실행 중 컴퓨팅 초당 + 일시 중단 중 스냅샷 스토리지 |

두 프리미티브는 서버 관리 불필요, 사용량 기반 과금, 관리형 네트워킹, Firecracker 가상화라는 공통 기반을 공유합니다. **이 과정의 실습은 Lambda Functions 경로입니다.** 교재의 "워크로드 인식 크기 조정"이 문서에서는 "수요에 맞춰 수평 확장"으로 나타나고, 트리거로 API Gateway·Amazon S3·Amazon SQS·EventBridge 등 200개 이상의 AWS 서비스를 연결할 수 있습니다.

> — 출처: [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

### 6.5 EC2와 Lambda를 대비시킨 서술 🔄

슬라이드 9 강사 노트는 이렇게 시작합니다.

> Amazon Elastic Compute Cloud(Amazon EC2) 인스턴스는 애플리케이션의 컴퓨팅 요구 사항을 해결하지만 지속적인 모니터링과 유지 관리가 필요합니다. 비용을 절감하면서 애플리케이션 개발을 간소화하기 위해 애플리케이션의 CRUD 작업을 구동할 여러 AWS Lambda 함수를 생성합니다.

**유지 관리 부분은 현재 지침과 방향이 같지만, 비용 부분은 문서가 그렇게 프레이밍하지 않습니다.** 현재 컴퓨팅 서비스 선택 결정 안내서는 컴퓨팅 선택을 열 가지 요소의 균형 문제로 제시합니다(워크로드 유형, 성능, 확장성, 관리 오버헤드, 비용 최적화, 지연 시간과 처리량, 컴플라이언스와 보안, 통합, 안정성과 가용성, 개발·배포 경험).

| 관점 | 교재 | 결정 안내서 |
|---|---|---|
| EC2 관리 부담 | 지속적인 모니터링과 유지 관리가 필요 | EC2 인스턴스 관리는 서버 **설정·확장·패치·보안**에 대한 책임을 포함하고 전담 운영 팀을 요구할 수 있음 |
| 그 부담의 평가 | 피해야 할 것으로 제시 | 컴퓨팅 환경에 대한 **세밀한 제어가 필요한 사용 사례에서는 그 오버헤드가 정당화되는 경우가 많다** |
| Lambda의 이점 | 비용 절감 + 개발 간소화 | 서버를 관리할 필요 없이 이벤트에 응답해 코드를 실행해 **운영 부담을 줄임** |
| 비용 절감 경로 | Lambda로 옮기는 것 | **인스턴스 선택**(750종 이상, AWS Graviton 기반이 비교 대상 대비 최대 40% 더 나은 가격 대비 성능), **구매 플랜**(Savings Plans 최대 72% 절감, Spot Instances 최대 90% 할인), **적정 크기 조정**(EC2 Auto Scaling, Compute Optimizer 최대 25% 절감, AWS Trusted Advisor) |
| 선택의 성격 | 양자택일 | **단일 워크로드에서 여러 유형의 컴퓨팅 솔루션을 함께 사용할 수 있음** |

정리하면 "Lambda가 언제나 더 저렴하고 간단하다"는 결론은 문서가 지지하지 않습니다. **이 과정의 CRUD 워크로드에 Lambda가 맞는다는 판단 자체는 유효하고, 근거는 비용이 아니라 요청·이벤트 구동이라는 워크로드 특성입니다.** 관리형 컨테이너 서비스가 제어와 편의 사이의 중간 지점을 제공한다는 서술도 있습니다. 컴퓨팅 서비스 비교는 모듈 9가 자세히 다룹니다.

> — 출처: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html)

---

## 7. 연결과 액세스: API Gateway와 Amazon Cognito

슬라이드 10과 11입니다. 앞의 서비스들을 하나로 묶는 층과, 그 앞에 서는 사용자 인증 층입니다.

### 7.1 슬라이드가 말하는 것

| 슬라이드 | 서비스 | 본문 | 강사 노트에서 확인되는 내용 |
|---|---|---|---|
| 10 | Amazon API Gateway | 이벤트 기반 요청을 라우팅 / API 호출을 로깅 | 애플리케이션의 모든 서비스를 함께 연결한다. 사용자와 컴퓨팅·데이터베이스·스토리지 서비스 간에 이벤트 기반 요청을 전달한다. 특정 태스크에 적합한 API를 생성·게시·유지 관리·모니터링·보호하는 프로세스를 간소화한다 |
| 11 | Amazon Cognito | 사용자 풀(가입·로그인) / 자격 증명 풀(액세스 권한 부여) | 사용자에게는 안전한 인증 및 권한 부여가 필요하다. 사용자 풀은 기본 제공 가입·로그인 옵션을 생성하는 사용자 디렉터리다. 자격 증명 풀로 다른 AWS 서비스에 대한 액세스 권한을 부여한다. 둘은 별도로 또는 함께 사용할 수 있다 |

슬라이드 10의 다이어그램은 요청 흐름을 세 상자로 그립니다. `사용자가 요청` → `REST API / API Gateway가 요청을 AWS 리소스로 라우팅` → `API Gateway가 응답을 사용자에게 다시 전송`.

### 7.2 API Gateway가 만드는 API는 세 가지입니다 🔄

교재 다이어그램은 API 유형을 `REST API` 하나로만 적습니다. 현재 문서는 Amazon API Gateway를 "어떤 규모에서도 **REST, HTTP, WebSocket API**를 생성·게시·유지 관리·모니터링·보호하는 AWS 서비스"로 기술합니다.

| API 유형 | 문서의 성격 서술 |
|---|---|
| REST | 무상태. HTTP 기반이고 `GET`·`POST`·`PUT`·`PATCH`·`DELETE` 같은 표준 HTTP 메서드 구현 |
| HTTP | 무상태. RESTful API 제품이며 **더 낮은 가격으로 제공하기 위해 최소 기능으로 설계** |
| WebSocket | **상태 저장.** WebSocket 프로토콜을 따라 양방향 통신을 가능하게 하고 메시지 내용에 따라 라우팅 |

AWS는 한쪽을 일률적으로 권장하지 않고 **기능·가격 기준으로 고르라고** 안내합니다.

| 필요한 기능 | 선택 |
|---|---|
| API 키, 클라이언트별 스로틀링, 요청 검증, AWS WAF 통합, 프라이빗 API 엔드포인트 | **REST API** |
| 위 기능이 필요 없음 | **HTTP API**(더 저렴) |

주요 차이를 몇 개 더 보면, 엔드포인트 유형에서 REST는 edge-optimized·regional·private을 모두 지원하고 HTTP는 regional만 지원합니다. 권한 부여에서 REST는 Amazon Cognito를 직접 지원하고 HTTP는 JWT 권한 부여자를 통해 Cognito를 씁니다. 테스트 호출·캐싱·요청 검증·카나리 릴리스 배포·개발자 포털은 REST만, 자동 배포는 HTTP만 지원합니다. **이 과정이 REST API를 쓰는 것은 잘못된 선택이 아닙니다.** 교재가 다루지 않는 것은 선택 자체가 존재한다는 사실입니다. 모듈 10이 API 유형과 통합 방식을 자세히 다룹니다.

> — 출처: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 7.3 "모든 서비스를 연결한다"와 "API 호출을 로깅"의 근거 🆕

교재의 두 서술이 현재 문서에서 어떻게 나타나는지 확인했습니다.

| 교재 서술 | 현재 문서 |
|---|---|
| 모든 서비스를 함께 연결한다 | API Gateway는 애플리케이션이 백엔드 서비스(Amazon EC2에서 실행되는 워크로드, AWS Lambda에서 실행되는 코드, 웹 애플리케이션, 실시간 통신 애플리케이션)의 데이터·비즈니스 로직·기능에 액세스하는 **'프런트 도어(front door)'** 역할을 한다 |
| API 호출을 로깅 | 기능 목록에 **CloudWatch 액세스 로깅·실행 로깅**(경보 설정 포함)과 **CloudTrail 로깅** 및 API 사용·변경 모니터링이 함께 있다 |
| 이벤트 기반 요청을 라우팅 | 트래픽 관리, 권한 부여와 액세스 제어, 모니터링, API 버전 관리를 포함해 초당 수십만 건의 동시 API 호출을 수락·처리하는 모든 작업을 처리한다 |

교재에 없는 기능으로 IAM 정책·Lambda 권한 부여자 함수·Amazon Cognito 사용자 풀을 쓰는 인증, 카나리 릴리스 배포, CloudFormation 템플릿으로 API 생성, 사용자 지정 도메인 이름, **AWS WAF 통합**, 성능 지연 파악·분류를 위한 **AWS X-Ray 통합**이 있습니다. 문서는 API Gateway가 AWS Lambda와 함께 **AWS 서버리스 인프라의 앱 대면 부분**을 이룬다고 기술합니다.

> — 출처: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 7.4 Amazon Cognito의 두 구성 요소는 그대로입니다

슬라이드 11의 이분법은 현재 문서와 **그대로 일치합니다.** Amazon Cognito는 웹·모바일 앱을 위한 자격 증명 플랫폼이며 사용자 디렉터리, 인증 서버, OAuth 2.0 액세스 토큰과 AWS 자격 증명에 대한 권한 부여 서비스입니다.

| 구성 요소 | 언제 만드는가 | 무엇을 하는가 | 독립성 |
|---|---|---|---|
| 사용자 풀(user pool) | 앱이나 API에 대해 사용자를 **인증·권한 부여**할 때 | 사용자 디렉터리. 자체 서비스 및 관리자 주도 사용자 생성·관리·인증. 앱·웹 서버·API로 인증된 JWT를 직접 발급 | 자격 증명 풀과의 통합을 **요구하지 않음** |
| 자격 증명 풀(identity pool) | 인증된 사용자 또는 익명 사용자에게 **AWS 리소스 액세스**를 허용할 때 | AWS 자격 증명을 발급. 역할 기반·속성 기반 액세스 제어로 권한 관리. 게스트 사용자용 자격 증명도 선택적으로 발급 | 사용자 풀과의 통합을 **요구하지 않음** |

두 요소를 함께 쓰는 흐름은 다음과 같습니다. 교재의 "별도로 또는 함께 사용할 수 있다"가 여기에 해당합니다.

| 단계 | 내용 |
|---|---|
| 1 | 앱 사용자가 **사용자 풀**로 로그인해 OAuth 2.0 토큰을 받는다 |
| 2 | 앱이 그 토큰을 **자격 증명 풀**에서 임시 AWS 자격 증명으로 교환한다 |
| 3 | 앱이 그 자격 증명 세션을 사용자에게 할당해 Amazon S3·Amazon DynamoDB 같은 AWS 서비스에 권한 있는 액세스를 제공한다 |

Pollynotes의 사용자 → Cognito → API Gateway → Lambda → DynamoDB·S3 경로가 이 흐름입니다.

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.5 가입·로그인 화면과 요금제가 달라졌습니다 🔄

사용자 풀이 가입·로그인 화면을 제공한다는 사실은 그대로입니다. 달라진 것은 **그 화면의 이름과 사용자 풀을 만들 때 만나는 선택**입니다. 실습에서 콘솔 화면이 교재와 다르게 보일 지점입니다.

**로그인 화면.** 현재 문서에는 브랜딩 버전이 두 개 있습니다.

| 버전 | 문서의 서술 |
|---|---|
| **managed login** | 최신 버전. 브랜딩 편집기로 사용자 지정 |
| hosted UI (classic) | managed login의 **"더 얇고 덜 사용자 지정 가능한 선행 버전"** |

둘 다 가입·로그인·암호 관리를 지원하고 여기에는 다중 인증(MFA) 완료와 webAuthn 인증자 등록이 포함됩니다. 알아 둘 제약이 몇 가지 있습니다.

| 항목 | 내용 |
|---|---|
| 프로필 관리 | managed login은 속성 변경·MFA 기본 설정 같은 **사용자 자기 서비스 프로필 관리를 지원하지 않음.** 애플리케이션 코드로 직접 구현해야 함 |
| 세션 쿠키 | 로그인하면 브라우저에 쿠키가 설정되고 같은 인증 방법으로 **한 시간** 동안 다시 로그인 가능. 쿠키로 재로그인해도 쿠키 기간은 연장되지 않음 |
| TLS | managed login은 사용자 지정 도메인과 접두사 도메인 **모두 TLS 1.2 요구.** classic hosted UI는 사용자 지정 도메인에 요구하지 않음 |
| CORS | 두 버전 모두 사용자 지정 CORS 오리진 정책을 **지원하지 않음.** CORS 정책은 애플리케이션 프런트 엔드에 구현 |
| 브랜딩 스타일 자동 할당 | 콘솔에서 앱 클라이언트를 만들면 자동 할당. `CreateUserPoolClient`로 만들면 `CreateManagedLoginBranding`을 호출할 때까지 managed login을 쓸 수 없음 |

> — 출처: [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

**기능 요금제.** 교재에 없는 개념입니다. 지금은 사용자 풀마다 기능 요금제를 고릅니다.

| 요금제 | 포함 |
|---|---|
| Lite | 월 활성 사용자가 적은 사용자 풀용 저비용 요금제. 로그인 기능과 **classic hosted UI** 포함. 액세스 토큰 사용자 지정·패스키 인증 같은 최신 기능은 미포함 |
| **Essentials** | **신규 사용자 풀의 기본값.** 최신 사용자 풀 인증 기능 전체. 선택 기반 로그인(choice-based sign-in), 이메일 MFA 같은 고급 인증 기능 |
| Plus | Essentials의 모든 것 + 위협 보호. 로그인·가입·암호 관리 요청에서 침해 지표를 모니터링(예상치 못한 위치에서의 로그인, 공개 유출된 암호 감지) |

| 항목 | 내용 |
|---|---|
| 적용 단위 | **사용자 풀 하나.** 같은 계정의 다른 사용자 풀은 다른 요금제를 가질 수 있지만 사용자 풀 안의 앱 클라이언트별로 다르게 둘 수는 없음 |
| API·CLI | `CreateUserPool`·`UpdateUserPool`의 `UserPoolTier` 파라미터. 값을 지정하지 않으면 `Essentials`. AWS CLI는 `--user-pool-tier` 인자 |
| 이전 구조 | 예전 `advanced security features` 요금 구조에 있던 기능들은 현재 Essentials 또는 Plus로 편입됨 |
| 전환 | 언제든 요금제를 바꿀 수 있음. 일부 전환은 활성 기능을 먼저 꺼야 함 |

> — 출처: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

---

## 8. 관측 가능성: CloudWatch와 X-Ray

슬라이드 12입니다. 다이어그램에 `오류 또는 성능 저하`, `개선할 방법은?`, `데이터 추적`, `애플리케이션 분석` 상자가 추가됩니다.

### 8.1 슬라이드가 말하는 것

| 슬라이드 본문 | 강사 노트에서 확인되는 내용 |
|---|---|
| Amazon CloudWatch / 관찰 기능 | 애플리케이션에는 사용자 상호 작용이나 향후 개발 업데이트에 방해가 될 수 있는 문제를 수정하기 위해 모니터링·문제 해결 서비스가 필요하다. Amazon CloudWatch는 실행 가능한 인사이트를 제공한다 |
| AWS X-Ray / 추적 | 애플리케이션은 AWS X-Ray를 사용하여 분산 애플리케이션의 분석과 디버깅도 지원한다 |

### 8.2 추적은 CloudWatch 이야기 안으로 들어왔습니다 🔄

교재는 관찰 기능을 CloudWatch에, 추적을 X-Ray에 배정해 **서비스 단위로 나눕니다.** 현재 CloudWatch 문서는 추적을 CloudWatch 관찰 가능성 이야기의 일부로 다룹니다.

| CloudWatch 항목 | 추적이 등장하는 지점 |
|---|---|
| CloudWatch 에이전트 | Amazon EC2 플릿에서 **지표·로그·추적**을 함께 수집 |
| 교차 계정 관찰 가능성 | 중앙 모니터링 계정에서 소스 계정의 **지표·로그·추적**을 조회 |
| OpenTelemetry 지원 | 네이티브 OTLP 엔드포인트로 **지표·로그·추적**을 OpenTelemetry 표준으로 수집. PromQL 쿼리 지원 |

교재에 없는 항목도 있습니다.

| 항목 | 내용 |
|---|---|
| Application Signals | 수동 계측이나 코드 변경 없이 지연 시간·오류율·요청률 같은 핵심 성능 지표를 자동 감지·모니터링. 큐레이션된 대시보드 제공 |
| CloudWatch Synthetics | canary라는 구성 가능한 스크립트로 엔드포인트·API를 사전 모니터링 |
| CloudWatch RUM | 실제 사용자 세션에서 성능 데이터 수집 |
| 서비스 수준 목표(SLO) | 신뢰성 목표를 정의·추적·경보. 오류 예산 설정과 SLO 준수 모니터링 |
| Lambda Insights | Lambda 함수의 메모리·CPU 사용률과 **콜드 스타트 감지·분석** |

> — 출처: [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

### 8.3 X-Ray 콘솔의 현재 상태 🔄

X-Ray 서비스는 종료되지 않았습니다. 달라진 것은 **화면 경로**입니다. 문서는 **"AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"** 고 명시합니다.

| 항목 | 현재 상태 |
|---|---|
| 사용 가능한 콘솔 | Amazon CloudWatch 콘솔 **또는** X-Ray 콘솔 |
| 개발 상태 | X-Ray 콘솔은 **더 이상 개발되지 않음.** CloudWatch 콘솔에 X-Ray 콘솔에서 다시 설계한 새 X-Ray 기능이 포함됨 |
| Service map | X-Ray Service map과 CloudWatch ServiceLens map이 CloudWatch 콘솔의 **X-Ray trace map**으로 통합. 왼쪽 탐색 창의 `X-Ray traces` → `Trace Map` |
| Insights | X-Ray Insights도 CloudWatch 콘솔의 `Insights`에 포함 |
| 서비스 단위 관찰 | CloudWatch **Application Signals.** SLO 기반 상태 지표에서 상관된 X-Ray 추적으로 내려가 문제 해결 |
| 함께 보기 | CloudWatch 콘솔에서 CloudWatch 로그·지표와 X-Ray 추적 데이터를 한 화면에서 조회 |

실습 7(모듈 14)의 화면 경로가 교재와 다를 수 있는 지점입니다. **M01도 같은 항목을 같은 근거로 기록했습니다.**

> — 출처: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 9. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

M02는 개요 모듈이라 이 장에 기술적 오류보다 **프레이밍 교정과 콘솔·문서 위치 이동**이 많습니다. 확인 결과 **이 모듈에서 지원이 종료된 항목은 없었습니다.** 교재 내부에서 표기가 어긋나는 항목이 다섯 개 있고, 이들은 AWS 문서로 판별할 대상이 아니어서 근거 열을 비우고 [9.5절](#95-검증하지-못한-항목)로 넘겼습니다.

### 9.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| API 유형 (슬라이드 10 다이어그램) | `REST API` 하나만 | 현재 문서는 **REST·HTTP·WebSocket** 세 가지를 제시하고 기능·가격 기준으로 고르라고 안내합니다. API 키·클라이언트별 스로틀링·요청 검증·AWS WAF 통합·프라이빗 엔드포인트가 필요하면 REST, 필요 없으면 더 저렴한 HTTP입니다. 이 과정이 REST를 쓰는 것 자체는 유효합니다 | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| 콘솔 기능 서술 (슬라이드 6 강사 노트) | `AWS Management Console은 액세스 권한을 획득하고 애플리케이션을 관리하는 데 필요한 모든 기능을 지원합니다` | 문서의 동등성 서술은 범위가 **IaaS** 관리·운영·액세스 기능으로 한정되고 방향도 반대입니다. "콘솔의 모든 IaaS 기능이 AWS API·AWS CLI에서 제공되고, 새 IaaS 기능은 출시 시점 또는 **180일** 안에 도달한다"입니다. 콘솔이 모든 기능의 상위 집합이라고 문서가 서술하지는 않습니다 | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |
| `Amazon APIGateway` (슬라이드 4·5·6·7·8·9·11·12·13 다이어그램) | 공백 없이 한 단어로 표기 | 문서상 정확한 이름은 **`Amazon API Gateway`** 입니다. 같은 덱의 슬라이드 10 본문과 강사 노트는 올바르게 적습니다. **M01도 같은 항목을 기록했습니다** | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| IAM 약어 (슬라이드 2 다이어그램) | `AWS Identity and Access Management(AWS IAM)` | 문서상 약어는 **`IAM`** 입니다. 같은 덱의 슬라이드 4~12 다이어그램은 `IAM`, 슬라이드 13은 `AWS Identity and Access Management(IAM)`, 슬라이드 6 강사 노트도 `(IAM)`으로 올바르게 적어 슬라이드 2만 다릅니다. **M01도 같은 항목을 슬라이드 7 강사 노트에서 기록했습니다** | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| 모듈 4 제목 (슬라이드 2 어젠다) | `권한 시작하기` | M04 덱 표지는 `모듈 4: 권한 부여 시작하기`입니다. M01 슬라이드 7 어젠다도 `권한 시작하기`로 적으므로 **어젠다 두 곳은 서로 일치하고 모듈 덱 표지만 다릅니다.** 모듈 3은 어젠다와 덱 표지가 일치합니다. 이 문서는 각 모듈 덱 표지를 정본으로 봅니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 이 모듈 제목 (슬라이드 1 vs 슬라이드 2) | 슬라이드 1 부제 `모듈 2: AWS에 웹 애플리케이션 구축` vs 슬라이드 2 어젠다 `AWS에 웹 애플리케이션 빌드` | 같은 덱 안에서 `구축`과 `빌드`가 갈립니다. 영어 원문 `Building a Web Application on AWS`를 다르게 옮긴 번역 불일치로 보입니다. 이 문서는 슬라이드 1 부제를 따랐습니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 슬라이드 2 제목 | 없음 (레이아웃은 제목 슬라이드인데 제목 텍스트가 비어 있음) | 내용상 1일 차 오전 어젠다와 실습 환경 다이어그램입니다. M01에서는 같은 성격의 슬라이드가 `1일 차 오전` 같은 제목을 갖습니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 실습 환경 접속 방법 (슬라이드 2) | `Guacamole` / `SSH` / `원격 데스크톱` 세 가지 | M01 슬라이드 7 상자는 두 가지(`Guacamole 또는 원격 데스크톱`), 같은 슬라이드 강사 노트는 또 다른 세 가지(`Guacamole, 원격 데스크톱 또는 브라우저 기반 옵션`)입니다. 세 곳이 모두 다르고 `SSH`는 M01 어디에도 없습니다. 실습 환경 운영 사항이라 확정할 수 없습니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 다이어그램 레이블 언어 (슬라이드 4~13) | 슬라이드 4·5·9·11·13은 영어(`List`/`Search`/`Delete`/`Create/Update`/`Dictate`), 슬라이드 6·7·8·10·12는 한국어(`나열`/`검색`/`삭제`/`생성/업데이트`/`명령`) | 같은 다이어그램인데 번역 적용 범위가 슬라이드마다 다릅니다. `애플리케이션API 호출`과 `애플리케이션 API 호출`의 공백 유무도 갈립니다. 이 문서는 한국어를 기준으로 정리하고 영어 원 레이블을 함께 적었습니다 | — ([9.5절](#95-검증하지-못한-항목)) |

### 9.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| EC2와 Lambda의 대비 (슬라이드 9 강사 노트) | EC2는 `지속적인 모니터링과 유지 관리가 필요`, Lambda는 `비용을 절감하면서 애플리케이션 개발을 간소화` | 유지 관리 부분은 방향이 같지만, 결정 안내서는 컴퓨팅 선택을 **열 가지 요소의 균형** 문제로 제시하고 "세밀한 제어가 필요한 사용 사례에서는 그 오버헤드가 **정당화되는 경우가 많다**"고 덧붙입니다. 비용도 Lambda로 옮기는 문제가 아니라 인스턴스 선택·구매 플랜·적정 크기 조정으로 접근하며, **단일 워크로드에서 여러 컴퓨팅 솔루션을 함께 쓸 수 있다**고 기술합니다. Lambda 선택의 근거는 비용이 아니라 요청·이벤트 구동 워크로드라는 특성입니다 | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html) |
| DynamoDB 정의 문장 (슬라이드 8 강사 노트) | `완전관리형 NoSQL 데이터베이스 서비스로서 원활한 확장성과 함께 빠르고 예측 가능한 성능` | 현재 문서의 첫 문장은 **"어떤 규모에서도 한 자릿수 밀리초 성능을 내는 서버리스 완전 관리형 분산 NoSQL 데이터베이스"** 입니다. 성능 서술이 구체화되고 `서버리스`·`분산`이 정의에 들어왔습니다 | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| DynamoDB `용량 크기 조정` (슬라이드 8) | 용량 모드 구분 없이 `용량 크기 조정`이라고만 기재 | **온디맨드 모드가 기본이자 권장 처리량 옵션**입니다. 기본 설정으로 테이블을 만들면 온디맨드가 되므로 실습 화면이 예전 캡처와 다를 수 있습니다 | [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| AWS Lambda의 범위 (슬라이드 9) | Lambda를 함수 하나의 개념으로 제시 | 문서는 **Lambda Functions**와 **Lambda MicroVMs** 두 컴퓨팅 프리미티브를 제시합니다. 이 과정의 실습은 Lambda Functions 경로입니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| 프런트엔드 호스팅 방식 (슬라이드 7) | S3 버킷에 직접 정적 웹 사이트 호스팅 | 문서의 1순위 권장은 **AWS Amplify Hosting**(CloudFront 기반 전역 CDN, 공개 HTTPS URL 생성)입니다. 버킷이 **SSE-KMS로 암호화된 경우 CloudFront + OAC가 필수**입니다 | [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| Cognito 가입·로그인 화면 (슬라이드 11) | `기본 제공 가입 및 로그인 옵션` | 브랜딩 버전이 **managed login**과 **hosted UI (classic)** 두 개이고, 문서는 classic을 managed login의 "더 얇고 덜 사용자 지정 가능한 선행 버전"으로 기술합니다. managed login은 자기 서비스 프로필 관리를 지원하지 않아 그 부분은 앱 코드로 구현합니다 | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| Cognito 구성 (슬라이드 11) | 사용자 풀·자격 증명 풀 두 구성 요소만 제시 | 사용자 풀에는 기능 요금제(**Lite / Essentials / Plus**)가 있고 신규 사용자 풀의 **기본값은 Essentials**입니다. 요금제는 사용자 풀 단위로 적용되며 앱 클라이언트별로 다르게 둘 수 없습니다 | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| 관찰 기능과 추적의 분리 (슬라이드 12) | 관찰 기능은 CloudWatch, 추적은 X-Ray로 서비스 단위 배정 | CloudWatch 문서가 추적을 관찰 가능성 이야기의 일부로 다룹니다(에이전트가 지표·로그·추적을 함께 수집, 교차 계정 관찰에서 추적 조회, OTLP 엔드포인트로 추적 수집) | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| 음성 변환 (슬라이드 4 강사 노트) | Amazon Polly를 문자 음성 변환 서비스로만 제시 | 음성 엔진은 **Generative · Long-form · Neural · Standard** 네 가지입니다. Generative와 Long-form은 교재 이후 추가되었습니다. **M01도 같은 항목을 같은 근거로 기록했습니다** | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |

### 9.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS X-Ray 콘솔 (슬라이드 12, 슬라이드 4~13 다이어그램) | **비권장.** 문서는 "AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"고 명시합니다. X-Ray 서비스 자체는 종료되지 않았습니다 | **Amazon CloudWatch 콘솔**의 `X-Ray traces` → `Trace Map`. 서비스 단위 관찰은 CloudWatch **Application Signals**. X-Ray Insights도 CloudWatch 콘솔의 Insights에 포함 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

지원이 **종료**된 항목은 이 모듈에 없습니다.

### 9.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| API Gateway HTTP API·WebSocket API | 교재의 REST API 외에 무상태 HTTP API(최소 기능·저가)와 상태 저장 WebSocket API가 있습니다. HTTP API는 자동 배포와 JWT 권한 부여자를 지원하고, WebSocket API는 메시지 내용에 따라 라우팅합니다 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| API Gateway의 AWS WAF·X-Ray 통합 | 일반적인 웹 공격 방어를 위한 AWS WAF 통합과 성능 지연 파악·분류를 위한 AWS X-Ray 통합이 기능 목록에 있습니다. 카나리 릴리스 배포와 CloudFormation 템플릿 기반 API 생성도 포함됩니다 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| Amazon Cognito 기능 요금제 | Lite·Essentials·Plus 세 요금제. 신규 사용자 풀 기본값은 Essentials이며 예전 `advanced security features` 요금 구조의 기능들이 Essentials·Plus로 편입되었습니다. Plus는 예상치 못한 위치에서의 로그인이나 공개 유출된 암호를 감지합니다 | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Cognito managed login과 브랜딩 편집기 | 사용자 지정 가능한 새 로그인 화면과 브랜딩 편집기. 선택 기반 로그인, 이메일 MFA, 패스키(webAuthn) 인증도 함께 제시됩니다 | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| CloudWatch Application Signals · Synthetics · RUM · SLO | 수동 계측 없는 APM(Application Signals), canary 기반 사전 모니터링(Synthetics), 실제 사용자 세션 데이터(RUM), 오류 예산이 있는 서비스 수준 목표(SLO). Lambda Insights는 콜드 스타트 감지·분석을 제공합니다 | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| CloudWatch OpenTelemetry 지원 | 네이티브 OTLP 엔드포인트로 지표·로그·추적을 수집하고 PromQL로 쿼리합니다. 같은 계측으로 CloudWatch와 서드파티 대상에 함께 보낼 수 있습니다 | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| AWS SAM의 IaC 도구 비교 절 | CloudFormation 대신 SAM을 쓸 때, AWS CDK 대신 SAM을 쓸 때, 둘을 함께 쓸 때를 문서가 명시합니다. 커넥터·`sam sync`·Terraform 지원도 주요 기능으로 제시됩니다 | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| Lambda MicroVMs와 Durable Functions | MicroVMs는 시작이 거의 즉시이고 최대 8시간까지 상태를 유지하는 격리 환경입니다. Lambda Durable Functions로 최대 1년까지 걸치는 다단계 워크플로를 만들 수 있습니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| 서버리스 개발자 안내서 | 교재가 "서버리스 애플리케이션"으로 묶은 세 서비스에 IAM을 더한 네 가지를 서버리스 솔루션의 핵심 서비스로 제시하는 별도 안내서가 있습니다. Serverless Patterns Workshop도 함께 안내합니다 | [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html) |
| IDE별 AWS Toolkit | 교재의 `도구 키트` 레이블은 현재 문서에서 AWS Toolkit for JetBrains·Visual Studio·Visual Studio Code·Azure DevOps로 나타납니다. 여러 SDK·도구가 공유하는 구성·인증·CRT 라이브러리·유지 관리 정책은 하나의 기준 문서에 모여 있습니다 | [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html) |

### 9.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 교재 내부 표기 불일치 5건 | 슬라이드 2의 제목 누락, 모듈 2 제목의 `구축`/`빌드`, 모듈 4 제목의 `권한`/`권한 부여`, 실습 환경 접속 방법 개수(2·3·3가지가 서로 다름), 다이어그램 레이블의 영어·한국어 혼용. 모두 **외부 문서로 검증할 대상이 아닌 교재 내부 문제**입니다. 어느 쪽을 따랐는지만 [9.1절](#91-교재-기술이-사실과-다른-항목)에 밝혔습니다 |
| 실습 환경 접속 방법 (슬라이드 2의 `SSH`) | 슬라이드 2만 `SSH`를 접속 방법으로 적고 M01의 상자·강사 노트에는 없습니다. 실습 환경 운영 사항이고 Apache Guacamole도 AWS가 운영하는 도메인의 문서 대상이 아니어서 **현재 접속 방법을 확정할 수 없었습니다.** 실제 방법은 실습 환경 안내를 따르세요 |
| 다이어그램의 화살표 방향과 정확한 배치 | 추출 대장에는 텍스트 상자 내용만 남고 도형의 연결 관계는 남지 않습니다. [2.2절](#22-요소와-서비스의-대응)의 요소–서비스 대응은 슬라이드 제목·본문·강사 노트가 명시한 범위까지만 정리했고, **그림에서 어떤 화살표가 어디로 향하는지는 교재 원본을 봐야 합니다** |
| EC2의 관리 부담을 줄이는 관리형 옵션 | 결정 안내서에서 확인한 것은 EC2 관리 책임의 범위(설정·확장·패치·보안)와 그 오버헤드가 정당화될 수 있다는 서술, 그리고 Elastic Beanstalk이 관리형 업데이트를 제공한다는 언급까지입니다. **AWS Systems Manager Patch Manager 같은 패치 자동화가 교재의 "지속적인 유지 관리" 서술을 얼마나 완화하는지는 확인하지 않았습니다** |
| Lambda MicroVMs·Durable Functions의 세부 동작 | 두 기능의 존재와 상위 특성(최대 8시간 세션, 최대 1년 워크플로, 과금 단위)은 Lambda 개요 문서로 확인했습니다. **각 기능의 전용 안내서는 조회하지 않았습니다.** 이 개요 모듈의 범위를 넘어서므로 존재와 위치만 남겼습니다. M09도 같은 항목을 같은 이유로 남겼습니다 |
| API Gateway 통합 유형과 Pollynotes가 실제로 쓰는 구성 | 확인한 것은 API 유형 세 가지와 그 기능 차이입니다. **이 과정의 API가 실제로 어떤 통합 유형(Lambda 프록시·비프록시 등)과 스테이지 구성을 쓰는지는 이 덱에 없습니다.** 모듈 10과 실습 5의 대상입니다 |
| Cognito 요금제 선택이 이 과정 실습에 미치는 영향 | 신규 사용자 풀 기본값이 Essentials라는 것과 요금제별 기능 차이는 확인했습니다. **이 과정의 실습 6(캡스톤)이 어느 요금제를 전제하는지는 이 덱에 없습니다.** 실습 가이드를 확인해야 합니다 |
| 각 서비스의 할당량·요금 수치 | 이 모듈은 개요 모듈이라 서비스별 할당량과 요금을 다루지 않습니다. 이 문서도 옮기지 않았습니다. 스토리지는 모듈 5·6, 데이터베이스는 모듈 7·8, 컴퓨팅은 모듈 9의 해당 절을 보세요 |
