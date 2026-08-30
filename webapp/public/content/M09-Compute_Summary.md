# 모듈 9: 애플리케이션 로직 처리

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [컴퓨팅 서비스](#2-컴퓨팅-서비스)
3. [AWS Lambda 작동 방식](#3-aws-lambda-작동-방식)
4. [AWS Lambda 호출 모델](#4-aws-lambda-호출-모델)
5. [권한](#5-권한)
6. [개발](#6-개발)
7. [테스트](#7-테스트)
8. [배포](#8-배포)
9. [데모와 실습 4](#9-데모와-실습-4)
10. [교재 대비 변경 사항](#10-교재-대비-변경-사항)
11. [지식 확인 및 핵심 정리](#11-지식-확인-및-핵심-정리)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [10장](#10-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.
> - 이 모듈은 이 과정에서 교재와 현재 문서의 차이가 가장 큰 모듈입니다. 교재 슬라이드 50 의 할당량 표는 **"2021년 9월 현재"** 라고 명시되어 있고, 런타임 목록·SnapStart 지원 범위·비동기 페이로드 한도는 그 이후 바뀌었습니다.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- AWS Lambda 작동 방식 탐색
- SDK를 사용하여 AWS Lambda 함수 개발
- Lambda 함수를 위한 트리거 및 권한 구성
- Lambda 함수 테스트, 배포, 모니터링

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 모듈 8 | 데이터베이스 작업 처리 |
| **모듈 9** | **애플리케이션 로직 처리** — 컴퓨팅 서비스 비교, Lambda 작동 방식·호출 모델·권한·개발·테스트·배포 |
| 실습 4 | AWS Lambda를 사용한 솔루션 개발 |
| 모듈 10 | API 관리 |
| 실습 5 | Amazon API Gateway를 사용한 솔루션 개발 |

지금까지 Amazon S3로 데이터를 저장하고 웹 사이트를 호스팅했고(모듈 5·6), Amazon DynamoDB에 `userId` 기준으로 노트를 저장했습니다(모듈 7·8). 이 모듈에서는 **AWS Lambda로 애플리케이션 로직을 처리**합니다.

### 이 모듈의 섹션 구성

교재 슬라이드 순서를 그대로 따릅니다.

| 슬라이드 | 섹션 | 이 문서 |
|---|---|---|
| 4–6 | 컴퓨팅 서비스 | [2장](#2-컴퓨팅-서비스) |
| 7–10 | AWS Lambda 작동 방식 | [3장](#3-aws-lambda-작동-방식) |
| 11–17 | AWS Lambda 호출 모델 | [4장](#4-aws-lambda-호출-모델) |
| 18–21 | 권한 | [5장](#5-권한) |
| 22–38 | 개발 | [6장](#6-개발) |
| 39–45 | 테스트 | [7장](#7-테스트) |
| 46–50 | 배포 | [8장](#8-배포) |
| 51–52, 55–56 | 데모, 실습 4 | [9장](#9-데모와-실습-4) |
| 53–54, 57–59 | 학습 내용 확인, 요약 | [11장](#11-지식-확인-및-핵심-정리) |

---

## 2. 컴퓨팅 서비스

### 2.1 컴퓨팅 서비스 개요

AWS는 세 가지 유형의 컴퓨팅을 제공합니다. 교재 슬라이드 5는 왼쪽에서 오른쪽으로 **추상화 수준**이 높아지는 축을 보여 줍니다.

| 유형 | 서비스 | 슬라이드 설명 |
|---|---|---|
| 인스턴스 | Amazon EC2 | 확장 가능한 컴퓨팅 용량 |
| 컨테이너 | Amazon ECS | 완전관리형 컨테이너 오케스트레이션 |
| 컨테이너 | Amazon EKS | Kubernetes를 사용한 완전관리형 컨테이너 오케스트레이션 |
| 서버리스 | AWS Lambda | 이벤트 중심 서버리스 컴퓨팅 |

| 유형 | 교재 강사 노트 요지 |
|---|---|
| 인스턴스 | 인프라를 생각하는 전통적 방식. 사용자가 컴퓨팅 리소스를 완벽하게 제어하고 심층적 수준에서 액세스·사용자 지정이 가능합니다. Amazon EC2에서는 사용자가 물리적 서버 인스턴스를 제어하므로 트래픽 분산을 위한 로드 밸런서가 필요하고, 트래픽·수요에 따라 인스턴스를 시작·중지해야 할 수도 있습니다 |
| 컨테이너 | 컨테이너 가상화 시스템은 완전한 가상 관리 시스템보다 작고 이동성이 있으며 관리하기 더 쉽습니다. 컨테이너는 애플리케이션·코드·구성·종속성이 포함된 소프트웨어 패키지이고, 클러스터는 하나 이상의 컨테이너를 사용하는 태스크·서비스의 논리적 단위 그룹화입니다. ECS·EKS 클러스터를 EC2 인스턴스에서 실행할 수 있고, 한 컨테이너에 장애가 발생하고 감지되면 다른 컨테이너로 대체할 수 있습니다 |
| 서버리스 | 백엔드 코드를 실행하기 위해 서버를 프로비저닝할 필요도 없고 애플리케이션을 위한 인프라 모델을 걱정할 필요도 없습니다. AWS Lambda는 이벤트 기반 컴퓨팅 서비스이고, 이벤트는 시스템의 상태가 변경되었다는 신호이며, 이벤트가 Lambda 함수를 호출하여 실행합니다. Lambda는 온디맨드로 실행되며 인프라·로드 밸런싱·크기 조정을 걱정할 필요가 없습니다 |

### 2.2 현재 문서의 컴퓨팅 서비스 분류 🆕

교재의 3분류(인스턴스 / 컨테이너 / 서버리스)는 현재 결정 안내서의 분류와 부합합니다. 달라진 것은 **선택지의 폭**입니다.

| 범주 | 현재 문서가 제시하는 서비스 |
|---|---|
| Amazon EC2 계열 | Amazon EC2(Graviton4·Trn2·P5eN 인스턴스 포함), EC2 Auto Scaling, EC2 Image Builder, AWS Elastic Beanstalk, Amazon Lightsail |
| 컨테이너 | Amazon ECS, Amazon ECS Anywhere, Amazon EKS, Amazon EKS Anywhere, Amazon ECR, AWS Batch |
| 서버리스 | **AWS Fargate**, **AWS Lambda** |

🆕 교재는 서버리스 열에 Lambda만 두고 Fargate를 강사 노트에서만 언급합니다. 현재 문서는 **Fargate를 Lambda와 나란히 서버리스 컴퓨팅으로 분류**합니다. 컨테이너는 직접 관리하는 EC2 인스턴스에서 실행하거나 AWS 관리형 컴퓨팅인 Fargate에서 실행할 수 있습니다.

> — 출처: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/compute-on-aws-how-to-choose/choosing-aws-compute-service.html)

교재 강사 노트의 "AWS Fargate는 컨테이너를 서버리스 컴퓨팅 모델로 실행하는 ECS 및 EKS에서 지원됩니다"는 현재도 유효합니다. Amazon EKS 사용 설명서에도 Fargate로 Kubernetes 파드를 실행하는 항목이 있고, Fargate 프로필로 어떤 파드를 Fargate에서 시작할지 제어합니다. Fargate에서 실행되는 각 파드는 자체 컴퓨팅 경계를 가지며 커널·CPU·메모리·ENI를 다른 파드와 공유하지 않습니다.

> — 출처: [Simplify compute management with AWS Fargate (Amazon EKS)](https://docs.aws.amazon.com/eks/latest/userguide/fargate.html)

### 2.3 컴퓨팅 서비스 비교 (교재 슬라이드 6)

교재 표를 그대로 옮깁니다.

| 범주 | EC2 | ECS/EKS | Lambda |
|---|---|---|---|
| 추상화 | 하드웨어 | 운영 체제 | 런타임 |
| 패키징 | Amazon Machine Image(AMI) | 컨테이너 | 함수 코드 |
| 요금제 모델 | 인프라 소비 기반 | 인프라 소비 기반 | 요청당 지불 |
| 확장성 및 동시성 | 구성 및 크기 조정 전체를 제어 | 사용자가 인스턴스의 수와 크기를 제어 | 암묵적 크기 조정 |

교재 강사 노트:

- Lambda 요금제 모델은 호출당, 실행 시간 및 메모리 사용량에 따라 비용을 지불합니다.
- Amazon EC2 — 인스턴스를 추가로 프로비저닝하고 AMI 크기를 늘릴 수 있습니다.
- Amazon EKS·ECS — 인스턴스 크기 증가, 인스턴스 추가, 복제본 추가, 로드 밸런싱 구성, 오토 스케일링 구성.

### 2.4 Fargate와 Lambda 비교 🆕

교재는 컨테이너와 서버리스를 나란히 놓고 비교하지만, 두 **서버리스** 옵션 사이의 선택은 다루지 않습니다. 현재 결정 안내서가 제시하는 비교입니다.

| 항목 | AWS Fargate | AWS Lambda |
|---|---|---|
| 실행 모델 | 컨테이너 기반 서버리스 컴퓨팅 | 이벤트 기반 서버리스 함수(선택적 durable 오케스트레이션) |
| 지원 언어 | 컨테이너에서 실행할 수 있는 모든 언어 | Node.js, Python, Java, C#, Go, Ruby, **PowerShell** + 사용자 지정 런타임 |
| 실행 시간 제한 | 하드 제한 없음 | **호출당 15분** (durable functions는 최대 1년 워크플로) |
| 메모리 | 최대 244GiB | 최대 10GiB |
| CPU | 최대 32 vCPU | 메모리에 비례해 최대 6 vCPU |
| 상태 관리 | 실행 중 메모리 상태 유지 가능 | 설계상 스테이트리스(외부 저장소 필요) |
| 배포 전략 | 네이티브 블루/그린·카나리·선형 | **가중치 별칭** |
| 동시성 한도 | 클러스터 용량 기반 | 기본 1,000(증액 가능) |
| 패키지 크기 | 컨테이너 크기가 임시 스토리지에 종속(최대 200GiB) | 레이어 포함 압축 해제 250MB, 컨테이너 이미지 10GB |
| 콜드 스타트 완화 | SOCI 지연 로딩 | 프로비저닝된 동시성, SnapStart(Java·Python·.NET), Lambda Managed Instances |

두 서비스가 공유하는 이점: 운영 부담 감소, 사용량 기반 과금, 빠른 배포, 내장 고가용성, 단순화된 컴플라이언스, 코드 집중.

선택 기준(현재 문서): 이벤트 중심 작업·예측 불가능한 워크로드·대기가 많은 오케스트레이션이면 Lambda 함수, 안정적·예측 가능하고 EC2 요금과 특수 컴퓨팅이 유리하면 Lambda Managed Instances, 특정 리소스 요구가 있는 컨테이너 애플리케이션이나 지속 프로세스면 Fargate입니다.

> — 출처: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

### 2.5 Lambda 요금 구조 🔄

교재는 "호출당, 실행 시간 및 메모리 사용량에 따라" 라고만 서술합니다. 현재 요금 페이지의 구조는 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 과금 기준 | 처리한 **요청 수** + 코드가 실행된 **기간(GB-초)**. 메모리를 선택하면 CPU와 리소스가 비례해 주어집니다 |
| 프리 티어 | 월 100만 요청 + 400,000 GB-초 |
| 아키텍처별 요금 🆕 | **x86 가격과 Arm 가격이 따로** 있습니다. 각각 월 GB-초 사용량 구간별 계층 요금(x86은 첫 60억 / 다음 90억 / 150억 초과 GB-초, Arm은 첫 75억 / 다음 112.5억 / 187.5억 초과) |
| 임시 스토리지 🆕 | 512MB까지 추가 비용 없음. 그 이상은 GB-초로 과금 |
| 프로비저닝된 동시성 🆕 | 구성한 동시성 양과 구성 기간에 대해 별도 과금. 활성 상태에서 실행되면 요청·기간 요금도 부과 |
| SnapStart 🆕 | 스냅샷 캐싱을 함수 버전이 활성인 기간(**최소 3시간**) 동안 과금 |
| Lambda MicroVMs 🆕 | 인스턴스-초 단위 과금 |

> — 출처: [AWS Lambda pricing](https://aws.amazon.com/lambda/pricing/)

---

## 3. AWS Lambda 작동 방식

### 3.1 Lambda 사용

데이터가 애플리케이션을 통과하면 Lambda가 관찰 가능한 이벤트에 대한 응답으로 코드를 실행할 수 있습니다. Lambda는 이벤트가 트리거하면 실행됩니다.

슬라이드 다이어그램: 이벤트 소스 → 호출 → AWS Lambda(함수 코드) → 서비스 / 인터넷 / 선택적 응답.

| 이벤트 소스 유형 | 예 |
|---|---|
| 데이터 또는 리소스 상태 변경 | 로그 파일의 새로운 메시지, Amazon S3 버킷 또는 Amazon DynamoDB 테이블의 데이터 변경 |
| 엔드포인트에 대한 HTTP 요청 | Amazon API Gateway를 사용 |
| SDK를 통한 API 호출 | AWS SDK를 사용하여 생성 |

AWS Lambda가 실행하는 코드가 **Lambda 함수**입니다. Lambda 함수는 **스테이트리스(stateless)** 방식이고, 이 덕분에 수신 이벤트의 속도에 따라 빠르게 확장할 수 있습니다. 프로그래밍 모델은 스테이트리스이지만 코드에서 Amazon S3나 Amazon DynamoDB 같은 다른 웹 서비스를 호출하면 상태 기반 데이터에 액세스할 수 있습니다.

### 3.2 Lambda를 호출하는 이벤트 소스 🔄

교재 슬라이드 9는 "다음을 포함하지만 이에 국한되지 않습니다"라고 단서를 붙이고 아래 목록을 제시합니다.

| 범주 | 교재 목록 |
|---|---|
| 데이터 스토어 | Amazon S3, Amazon DynamoDB, Amazon Kinesis, Amazon Cognito |
| 엔드포인트 | Amazon API Gateway, AWS IoT, AWS Step Functions, Amazon Alexa |
| 개발 및 관리 도구 | AWS CloudFormation, AWS CloudTrail, AWS CodePipeline, Amazon CloudWatch |
| 이벤트/메시지 서비스 | Amazon EventBridge, Amazon SES, Amazon SNS |

현재 문서의 "Lambda 함수를 호출할 수 있는 서비스" 표는 **28개 항목**이고 호출 방식까지 명시합니다.

| 호출 방식 | 서비스 |
|---|---|
| 이벤트 소스 매핑 | Amazon MSK, 셀프 매니지드 Apache Kafka, Amazon DocumentDB, Amazon DynamoDB, Amazon Kinesis, Amazon MQ, Amazon SQS |
| 이벤트 기반 **동기** 호출 | Amazon API Gateway, Amazon Cognito, Amazon Connect Customer, Application Load Balancer, Amazon Data Firehose, Amazon Lex, Amazon S3 Batch, Amazon VPC Lattice |
| 이벤트 기반 **비동기** 호출 | AWS CloudFormation, Amazon CloudWatch Logs, AWS CodeCommit, AWS CodePipeline, AWS Config, AWS IoT, Amazon SES, Amazon SNS, Amazon S3, Amazon EventBridge Scheduler(시간 기반) |
| 동기 또는 비동기 | Amazon EventBridge(버스·규칙은 비동기, 파이프는 동기 또는 비동기), AWS Step Functions |

교재와 다른 점:

- 🔄 교재가 든 **Amazon Alexa**와 **AWS CloudTrail**은 현재 표에 없습니다. 표에 없다는 것이 호출이 불가능하다는 뜻은 아니므로 단정하지 않습니다(`AddPermission` API에는 여전히 "Alexa Smart Home 함수용" `EventSourceToken` 파라미터가 있습니다).
- 🔄 교재의 "Amazon CloudWatch"는 표에서 **Amazon CloudWatch Logs**로 구체화되었습니다.
- 🆕 교재 이후 표에 추가된 항목: Amazon DocumentDB, Amazon MQ, Amazon MSK, 셀프 매니지드 Apache Kafka, Application Load Balancer, Amazon EventBridge Scheduler, Amazon Data Firehose, Amazon Lex, Amazon S3 Batch, Amazon VPC Lattice, Amazon Connect Customer, AWS Config, AWS CodeCommit.
- 🆕 이벤트 기반 호출 외에 Amazon EC2, 셀프 매니지드 Apache Kafka, Kubernetes와도 Lambda를 함께 쓸 수 있습니다.
- 🆕 한 함수에 **여러 트리거**를 둘 수 있고 각 트리거는 독립적인 클라이언트처럼 동작하며, Lambda가 함수에 전달하는 각 이벤트에는 **하나의 트리거 데이터만** 담깁니다. 트리거는 Lambda가 아니라 **이벤트를 생성하는 서비스가 저장·관리**합니다.

> — 출처: [Invoking Lambda with events from other AWS services](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html)

### 3.3 Lambda 함수의 구조

교재 슬라이드 10의 도형 구성: **트리거 + 액세스 권한 + 코드(핸들러 함수, 기타) + 런타임 + 레이어 + 구성(동시성, 메모리, 시간제한)**.

| 구성 요소 | 교재 서술 |
|---|---|
| 코드 | 핸들러 함수 및 다른 코드가 포함됩니다. 핸들러 함수는 이벤트가 발생할 때마다 실행됩니다 |
| 런타임 | 언어별 환경에 대한 런타임을 지원하며 직접 사용자 지정 런타임을 생성할 수도 있습니다 |
| 레이어 | 공유 코드 또는 사용자 지정 런타임을 제공합니다 |
| 권한 | Lambda 함수에는 상호 작용할 수 있는 대상을 정의하는 권한이 필요합니다 |
| 트리거 | 함수를 호출하도록 구성된 AWS 서비스 / 스트림 또는 대기열에서 항목을 읽고 함수를 호출하는 Lambda 내의 이벤트 소스 매핑 리소스 |
| 구성 | 동시성, 메모리 할당, 시간 제한 등 |

런타임이 담당하는 작업(교재 강사 노트):

- 함수의 설정 코드 실행
- 환경 변수에서 핸들러 이름 읽기
- Lambda 런타임 API에서 호출 이벤트 읽기
- 함수 핸들러로 이벤트 데이터 전달
- 핸들러의 응답을 다시 Lambda로 게시

현재 문서도 런타임을 "호출 이벤트, 컨텍스트 정보, 응답을 Lambda와 함수 사이에서 중계하는 언어별 환경"으로 정의합니다.

### 3.4 지원 런타임 🔄

교재 슬라이드 10 강사 노트는 런타임을 **"Node.js, Java, Python, .NET Core, Go, Ruby"** 로 나열합니다. **이 목록은 현재와 다릅니다.** `.NET Core` 계열과 `go1.x`는 지원이 종료되었습니다.

각 주요 언어 릴리스마다 `nodejs24.x`, `python3.14` 같은 고유한 **런타임 식별자**가 있고, 주요 버전을 바꾸려면 식별자를 직접 변경해야 합니다(AWS는 주요 버전 간 하위 호환성을 보장할 수 없으므로 고객이 수행하는 작업입니다).

현재 지원 런타임 표(25행)입니다. **예상 폐기일은 계획 목적이며 변경될 수 있습니다.**

| 이름 | 식별자 | 운영 체제 | 예상 폐기일 |
|---|---|---|---|
| Node.js 26 (퍼블릭 프리뷰) | `nodejs26.x` | Amazon Linux 2023 | 미정 |
| Node.js 24 | `nodejs24.x` | Amazon Linux 2023 | 2028-04-30 |
| Node.js 22 | `nodejs22.x` | Amazon Linux 2023 | 2027-04-30 |
| Python 3.15 (퍼블릭 프리뷰) | `python3.15` | Amazon Linux 2023 | 미정 |
| Python 3.14 | `python3.14` | Amazon Linux 2023 | 2029-06-30 |
| Python 3.13 | `python3.13` | Amazon Linux 2023 | 2029-06-30 |
| Python 3.12 | `python3.12` | Amazon Linux 2023 | 2028-10-31 |
| Python 3.11 | `python3.11` | Amazon Linux 2 | 2027-06-30 |
| Python 3.10 | `python3.10` | Amazon Linux 2 | 2026-10-31 |
| Java 25 | `java25` | Amazon Linux 2023 | 2029-06-30 |
| Java 21 | `java21` | Amazon Linux 2023 | 2029-06-30 |
| Java 17 | `java17.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 11 | `java11.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 8 | `java8.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 17 | `java17` | Amazon Linux 2 | 2027-06-30 |
| Java 11 | `java11` | Amazon Linux 2 | 2027-06-30 |
| Java 8 | `java8.al2` | Amazon Linux 2 | 2027-06-30 |
| .NET 10 | `dotnet10` | Amazon Linux 2023 | 2028-11-14 |
| .NET 9 (컨테이너 전용) | `dotnet9` | Amazon Linux 2023 | 2026-11-10 |
| .NET 8 | `dotnet8` | Amazon Linux 2023 | 2026-11-10 |
| Ruby 4.0 | `ruby4.0` | Amazon Linux 2023 | 2029-03-31 |
| Ruby 3.4 | `ruby3.4` | Amazon Linux 2023 | 2028-03-31 |
| Ruby 3.3 | `ruby3.3` | Amazon Linux 2023 | 2027-03-31 |
| OS 전용 런타임 | `provided.al2023` | Amazon Linux 2023 | 2029-06-30 |

몇 가지 유의점:

- 🆕 **Amazon Linux 2는 2026년 6월 30일 EOL 예정**입니다. AL2 기반 런타임(`java8.al2`·`java11`·`java17`·`python3.10`·`python3.11`·`provided.al2`)은 표의 폐기일까지만 패치됩니다. AWS는 AL2023 기반 런타임으로 가능한 빨리 업그레이드할 것을 권장하고, Java 버전을 올릴 수 없는 경우를 위해 AL2023 기반 Java 8·11·17 런타임을 제공합니다.
- 🆕 **모든 지원 런타임이 x86_64와 arm64를 함께 지원**합니다([6.13절](#613-arm64graviton2-아키텍처)).
- 🆕 Go와 Rust는 **OS 전용 런타임**(`provided.al2023`)으로 실행합니다. 다른 언어는 함수 코드와 함께 또는 레이어에 사용자 지정 런타임을 배포할 수 있습니다.
- 🆕 Lambda는 언어가 **LTS 단계**에 도달한 뒤에만 관리형 런타임을 제공하고, LTS 릴리스가 예정되지 않은 버전에는 관리형 런타임을 제공하지 않습니다.

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.5 런타임 폐기 정책과 일정 🆕

교재는 런타임이 폐기된다는 사실 자체를 다루지 않습니다. 실무에서 가장 자주 부딪히는 주제이므로 정리합니다.

표준 폐기 정책은 런타임의 주요 구성 요소(대개 언어 런타임, 때로는 운영 체제)가 커뮤니티 LTS 종료에 도달해 보안 업데이트를 더 이상 받을 수 없을 때 그 런타임을 폐기하는 것입니다. 폐기 이후에도 **함수는 무기한 호출할 수 있지만** 보안 패치와 기술 지원이 중단됩니다.

| 단계 | 시점 | 무슨 일이 일어나는가 |
|---|---|---|
| 폐기 예고 | 폐기 **최소 180일 전** | 이메일·Health Dashboard 알림. Health Dashboard의 Scheduled changes 탭과 Trusted Advisor 검사에 영향받는 함수가 표시됩니다 |
| 폐기 | 폐기일 | 보안 업데이트 중단, 기술 지원 대상에서 제외. **콘솔에서는 생성·업데이트 불가**, CLI·AWS SAM·CloudFormation은 가능 |
| 함수 생성 차단 | 폐기 후 **최소 30일** | 새 함수 생성 차단. 기존 함수의 코드·구성 업데이트는 CLI·SAM·CloudFormation으로 가능 |
| 함수 업데이트 차단 | 폐기 후 **최소 60일** | 기존 함수의 코드·구성 업데이트 차단. 지원 런타임으로의 업그레이드는 가능하지만 폐기 런타임으로 되돌리는 것은 차단될 수 있습니다 |

책임 분담: Lambda는 지원되는 관리형 런타임과 컨테이너 기본 이미지의 보안 업데이트를 큐레이션·게시하고 기본적으로 자동 적용합니다. 컨테이너 이미지로 배포한 함수는 **사용자가 최신 기본 이미지로 다시 빌드해 재배포**해야 하고, 컨테이너 이미지 함수에는 **폐기 알림이 제공되지 않습니다.** 어느 경우든 함수 코드와 그 종속성 업데이트는 사용자 책임입니다.

🆕 새 리전에서는 향후 6개월 내 폐기 예정 런타임을 지원하지 않습니다.

> — 출처: [Lambda runtimes — Runtime deprecation policy](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.6 런타임에 포함된 AWS SDK 🔄

교재 슬라이드 24 강사 노트는 "Python 및 Node.js용 런타임에는 SDK가 내장되어 있으므로 이러한 SDK를 코드와 번들링할 필요가 없습니다"라고 기재합니다. **전제는 맞지만 결론이 현재 권장과 반대입니다.**

| 구분 | 내용 |
|---|---|
| 사실 | Node.js, Python, **Ruby** 런타임에 AWS SDK 버전이 포함되어 있습니다 |
| 현재 권장 🔄 | 종속성을 완전히 제어하고 자동 런타임 업데이트 중 **하위 호환성을 극대화**하기 위해, 코드가 사용하는 SDK 모듈과 그 종속성을 **배포 패키지나 Lambda 레이어에 항상 포함**하도록 권장합니다 |
| 내장 SDK를 쓸 때 | 배포에 추가 패키지를 포함할 수 없을 때만 — 예를 들어 **Lambda 콘솔 코드 편집기**로 함수를 만들거나 **CloudFormation 템플릿에 인라인 코드**를 쓰는 경우 |
| 갱신 | Lambda가 이 런타임들에 포함된 AWS SDK 버전을 주기적으로 갱신하며, 이 업데이트가 함수 동작에 미묘한 변화를 줄 수 있습니다 |

🆕 실무에서 이것이 문제가 되는 구체적 사례: **재귀 루프 감지**([6.7절](#67-재귀-루프-감지))는 최소 SDK 버전을 요구하므로(Python `boto3` 1.24.46·`botocore` 1.27.46 이상), 런타임 내장 버전이 그보다 낮으면 감지가 동작하지 않습니다.

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 4. AWS Lambda 호출 모델

### 4.1 세 가지 호출 모델

교재 슬라이드 12는 세 모델을 나란히 제시합니다.

| 모델 | 슬라이드 레이블 | 예시 소스 |
|---|---|---|
| 동기식(직접 호출) | `/order` → Amazon API Gateway → Lambda 함수 | Amazon API Gateway |
| 비동기식(푸시) | 이벤트 대기열 → Lambda 함수 → 대상 위치 | Amazon SNS, Amazon S3 |
| ESM — 이벤트 소스 매핑(폴링) | 소스 스트림·소스 배치 → 이벤트 소스 매핑 → Lambda 함수 → 대상 | Amazon DynamoDB, Amazon Kinesis |

#### 동기식 호출(직접 호출)

Lambda가 함수를 실행하고 응답을 대기합니다. 함수는 호출되는 즉시 실행됩니다. 함수가 실행을 완료하면 Lambda가 함수 코드의 응답을 추가 데이터(상태 코드, 실행된 함수 버전 등)와 함께 반환합니다. **이 호출 모델은 재시도 기능이 내장되지 않았습니다.** 콘솔, AWS CLI, AWS SDK에서 동기식 호출을 수행할 수 있고 Amazon Cognito·Amazon API Gateway 등 많은 AWS 서비스도 Lambda 함수를 동기식으로 호출합니다.

기본값이 동기식입니다. `Invoke` API의 `InvocationType` 기본값이 `RequestResponse`이고, 응답 상태 코드는 200입니다.

#### 비동기식 호출(푸시) 🔄

Lambda가 이벤트를 대기열로 전송하고, 별도의 프로세스가 대기열에서 이벤트를 읽어 함수를 실행합니다. 이벤트가 대기열에 추가되면 Lambda가 다음 중 하나를 반환합니다.

- 추가 정보 없이 성공 응답(상태 코드 **202**)
- 이벤트 대기열에 이벤트를 추가할 수 없음을 나타내는 오류

CLI·SDK로 비동기 호출하려면 `InvocationType`을 `Event`로 설정합니다.

```bash
# AWS CLI v2 에서는 --cli-binary-format 옵션이 필요하다
aws lambda invoke \
  --function-name my-function \
  --invocation-type Event \
  --cli-binary-format raw-in-base64-out \
  --payload '{ "key": "value" }' response.json
```

🔄 교재 슬라이드 44의 `invoke` 예제는 `--payload`에 JSON 문자열을 그대로 넘깁니다. **AWS CLI 버전 2에서는 `--cli-binary-format raw-in-base64-out` 옵션이 필요합니다.** 기본값으로 만들려면 `aws configure set cli-binary-format raw-in-base64-out`을 실행합니다. 출력 파일은 내용이 없지만 명령을 실행하면 생성되고, Lambda가 이벤트를 대기열에 추가할 수 없으면 오류 메시지가 명령 출력에 나타납니다.

> — 출처: [Invoking a Lambda function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html)

#### ESM — 이벤트 소스 매핑(폴링) 🆕

이벤트 소스 매핑은 스트림 및 대기열 기반 서비스에서 항목을 읽고 레코드 배치와 함께 함수를 호출하는 **Lambda 리소스**이며, 일반적으로 Lambda 함수를 직접 호출하지 않는 서비스를 위해 설계되었습니다. ESM 내부의 **이벤트 폴러(event poller)** 가 새 메시지를 폴링합니다.

ESM을 사용하는 서비스 7개는 **교재 목록과 현재 문서가 정확히 일치**합니다.

| 서비스 |
|---|
| Amazon DynamoDB |
| Amazon DocumentDB(MongoDB 호환) |
| Amazon Kinesis |
| Amazon MQ |
| Amazon Managed Streaming for Apache Kafka(Amazon MSK) |
| 셀프 매니지드 Apache Kafka |
| Amazon SQS |

🆕 교재가 다루지 않는 **배치 동작**입니다. Lambda는 다음 세 조건 중 하나가 충족될 때 함수를 호출합니다.

| 조건 | 내용 |
|---|---|
| 배치 창이 최댓값에 도달 | `MaximumBatchingWindowInSeconds`(0~300초). 기본값은 Kinesis·DynamoDB·SQS가 **0초**, MSK·셀프 매니지드 Kafka·Amazon MQ·DocumentDB가 **500ms** |
| 배치 크기 충족 | `BatchSize`. 최솟값 1이고 기본값·최댓값은 이벤트 소스에 따라 다름 |
| 페이로드가 **6MB** 도달 | 변경할 수 없음 |

🆕 ESM은 **각 이벤트를 최소 한 번(at least once) 처리**하며 중복 처리가 발생할 수 있으므로 함수 코드를 **멱등적으로** 만들 것을 강력히 권장합니다. 기본적으로 함수가 오류를 반환하면 ESM은 배치 전체를 재처리하며, 순서 보장을 위해 해당 샤드의 처리를 일시 중지합니다. 스트림 소스(DynamoDB·Kinesis)에서는 최대 재시도 횟수를 구성할 수 있고, 배치를 폐기할 때 호출 레코드를 대상으로 보내도록 구성할 수도 있습니다.

🆕 **프로비저닝 모드(provisioned mode)** — Amazon MSK, 셀프 매니지드 Kafka, Amazon SQS에서 사용할 수 있고, 전용 폴링 리소스의 최소·최대치를 지정해 처리량을 조정합니다. 이 리소스는 3배 빠르게 오토 스케일링하고 16배 높은 용량을 제공합니다. 프로비저닝 모드 사용에는 추가 비용이 발생합니다.

> — 출처: [How Lambda processes records from stream and queue-based event sources](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html)

#### DynamoDB 스트림 폴링 주기

교재 슬라이드 12 강사 노트의 "Lambda는 새 레코드에 대해 스트림을 1초에 4번 폴링"은 현재도 유효합니다. 문서는 **"기본 속도(base rate)로 초당 4회"** 라고 단서를 붙입니다.

🆕 교재가 다루지 않는 세부 사항:

- `ParallelizationFactor`(1~10, 기본 1)로 한 샤드를 여러 Lambda 호출로 동시 처리할 수 있고 항목(파티션·정렬 키) 수준의 **순서는 유지**됩니다.
- ESM 생성·업데이트 시 스트림 폴링은 **최종 일관성**이므로 시작 위치를 `LATEST`로 지정하면 생성·업데이트 중 이벤트를 놓칠 수 있습니다. 놓치지 않으려면 `TRIM_HORIZON`을 지정합니다.
- 단일 리전 테이블에서는 같은 DynamoDB Streams 샤드를 **최대 두 개**의 Lambda 함수가 동시에 읽도록 설계할 수 있고, 글로벌 테이블에서는 **하나**로 제한하는 것이 권장됩니다.

> — 출처: [Using AWS Lambda with Amazon DynamoDB](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)

### 4.2 함수 호출 및 재시도

교재 슬라이드 13 표의 세 값은 **모두 현재 문서와 일치**합니다.

| 호출 | 재시도 |
|---|---|
| 동기식 | 재시도 안 함 (서비스가 오류에 따라 재시도할 수 있음) |
| 비동기식 | 기본 제공 재시도(2회) |
| 폴링 기반 | 이벤트 소스에 따라 다름 |

보충 설명(현재 문서):

- 동기식 — 함수를 직접 호출하면 Lambda가 함수 코드 관련 오류를 자동으로 재시도하지 않으며 재시도 전략은 호출자가 결정합니다. AWS 서비스가 동기 호출하는 경우 서비스가 재시도 여부를 결정합니다. 예를 들어 Amazon S3 배치 작업은 함수가 `TemporaryFailure` 응답 코드를 반환하면 재시도하고, **API Gateway는 항상 오류 응답을 요청자에게 그대로 전달**합니다.
- 폴링 기반 — 스트림을 읽는 ESM은 항목 배치 **전체**를 재시도하며 반복 오류는 해당 샤드의 처리를 차단하므로 `IteratorAge` 지표로 정지된 샤드를 감지합니다. 대기열을 읽는 ESM은 소스 대기열의 **표시 시간 제한(visibility timeout)과 리드라이브 정책**으로 재시도 간격과 실패 이벤트 대상을 결정합니다.

### 4.3 비동기 재시도 동작과 구성 🔄

교재 슬라이드 12 강사 노트는 "재시도 횟수 및 재시도 간격은 구성 가능합니다"라고 기재합니다. **구성 가능한 것은 재시도 횟수와 이벤트 최대 수명이고, 재시도 간격 자체를 지정하는 파라미터는 문서에 없습니다.**

| 상황 | 동작 |
|---|---|
| 함수가 오류를 반환 | 기본적으로 **두 번 더 재시도**. 첫 두 시도 사이에 **1분**, 두 번째와 세 번째 시도 사이에 **2분** 대기. 함수 오류에는 함수 코드가 반환한 오류와 **시간 초과 같은 런타임 오류**가 포함됩니다 |
| 스로틀링(429)·시스템 오류(500 계열) | 이벤트를 대기열로 되돌리고 **기본 최대 6시간** 재시도. 재시도 간격은 첫 시도 후 1초에서 최대 5분까지 지수적으로 증가. 대기열에 항목이 많으면 재시도 간격을 늘리고 읽기 속도를 낮춥니다 |
| 대기열이 매우 긴 경우 | 새 이벤트가 함수로 전달되기 전에 만료될 수 있습니다. 만료되거나 모든 처리 시도에 실패한 이벤트는 **폐기**됩니다 |
| 오류가 없어도 | 대기열 자체가 **최종 일관성**이므로 같은 이벤트를 여러 번 받을 수 있습니다. 함수가 수신 이벤트를 따라가지 못하면 이벤트가 함수로 전달되지 않고 대기열에서 삭제될 수도 있습니다 |

구성 가능한 두 설정:

| 설정 | 내용 |
|---|---|
| `MaximumEventAgeInSeconds` | 비동기 이벤트 대기열에 이벤트를 보관하는 최대 시간. 콘솔에서는 "이벤트 최대 수명"이고 **최대 6시간** |
| `MaximumRetryAttempts` | 함수가 오류를 반환할 때 재시도하는 최대 횟수. 콘솔에서는 "재시도 시도"이고 **0~2** |

함수·버전·별칭 단위로 지정합니다. `put-function-event-invoke-config`는 기존 설정을 **덮어쓰므로** 일부만 바꾸려면 `update-function-event-invoke-config`를 씁니다.

```bash
# 이벤트 최대 수명 1시간, 재시도 0회
aws lambda put-function-event-invoke-config \
  --function-name error \
  --maximum-event-age-in-seconds 3600 \
  --maximum-retry-attempts 0
```

> — 출처: [How Lambda handles errors and retries with asynchronous invocation](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html)

### 4.4 호출 레코드 대상과 DLQ 🔄

교재는 호출 레코드 대상을 **네 가지**(AWS Lambda, Amazon SNS, Amazon SQS, Amazon EventBridge)로 나열하고, "비동기식 호출에 대한 모범 사례는 DLQ를 생성 및 사용하는 것"이라고 기재합니다. **둘 다 현재와 다릅니다.**

현재 대상은 **다섯 가지**입니다.

| 대상 | 필요한 실행 역할 권한 | 비고 |
|---|---|---|
| Amazon SQS 표준 대기열 | `sqs:SendMessage` | 호출 레코드를 `Message`로 전달 |
| Amazon SNS 표준 주제 | `sns:Publish` | 호출 레코드를 `Message`로 전달. SNS 메시지 크기 상한이 256KB이므로 비동기 페이로드가 1MB에 가까우면 전달 실패 가능 |
| **Amazon S3 버킷** 🆕 | `s3:PutObject`, `s3:ListBucket` | **실패 시에만.** `aws/lambda/async/<함수명>/YYYY/MM/DD/...` 규칙으로 JSON 객체 저장 |
| AWS Lambda 함수 | `lambda:InvokeFunction` | 호출 레코드를 페이로드로 전달 |
| Amazon EventBridge 이벤트 버스 | `events:PutEvents` | `detail`로 전달. `source`는 `lambda`, `detail-type`은 "Lambda Function Invocation Result - Success" 또는 "- Failure" |

성공 이벤트와 실패 이벤트에 각각 다른 대상을 구성할 수 있습니다. 온-실패(On failure)는 이벤트가 모든 처리 시도에 실패하거나 최대 수명을 초과할 때, 온-성공(On success)은 함수가 비동기 호출을 성공적으로 처리할 때 레코드를 보냅니다.

DLQ와 온-실패 대상의 관계 🔄:

| 항목 | 온-실패 대상 | DLQ |
|---|---|---|
| 현재 문서의 위치 | 기본 경로 | 온-실패 대상의 **대안** |
| 구성 단위 | 함수, 버전, 별칭 | **함수 수준만** |
| 보내는 내용 | 함수 응답 세부 정보를 포함한 호출 레코드 | **이벤트 내용만**(응답 정보 없음) |
| 지원 대상 | SQS·SNS·S3·Lambda·EventBridge | SQS 표준 대기열, SNS 표준 주제(FIFO 미지원) |

DLQ 메시지 속성은 `RequestID`, `ErrorCode`(HTTP 상태 코드), `ErrorMessage`(오류 메시지의 첫 1KB)입니다. Lambda가 DLQ에 메시지를 보낼 수 없으면 이벤트를 삭제하고 `DeadLetterErrors` 지표를 발생시킵니다.

🆕 **Amazon SQS를 이벤트 소스로 쓰는 경우에는 Lambda 함수가 아니라 Amazon SQS 대기열 자체에 DLQ를 구성**합니다.

🆕 함수 트리거를 막으려면 예약된 동시성을 0으로 설정하면 되지만, 비동기 호출 함수에 예약된 동시성 0을 설정하면 Lambda가 **재시도 없이** 새 이벤트를 DLQ 또는 온-실패 대상으로 보냅니다. 그 사이 들어온 이벤트를 처리하려면 대기열이나 대상에서 직접 소비해야 합니다.

> — 출처: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

### 4.5 실행 환경 수명 주기 🔄

교재 슬라이드 14의 다이어그램 단계: **코드 다운로드 → 환경 초기화(확장, 부트스트랩 런타임, 함수 초기화 실행) → 호출(함수 핸들러 실행) → 종료(알림 확장, 환경 제거)**. 앞의 두 단계가 **콜드 스타트**, 호출 단계가 **웜 스타트**로 표시되어 있습니다. 이 흐름은 현재 문서의 단계와 대응합니다.

현재 문서의 단계 이름과 세부 사항입니다.

| 단계 | 내용 |
|---|---|
| `Init` | 모든 확장 시작(Extension init) → 런타임 부트스트랩(Runtime init) → 함수의 정적 코드 실행(Function init) → (SnapStart만) before-checkpoint 런타임 후크. 🆕 **`Init` 단계는 10초로 제한**되며 세 작업이 10초 안에 끝나지 않으면 첫 호출 시점에 구성된 함수 시간 제한으로 `Init`을 재시도합니다(suppressed init) |
| `Restore` 🆕 | **SnapStart 전용.** 지속된 스냅샷에서 실행 환경을 재개하고 after-restore 런타임 후크를 실행합니다. 런타임 로드와 후크가 10초 안에 끝나지 않으면 `SnapStartTimeoutException`이 발생합니다 |
| `Invoke` | 함수 핸들러 실행. **함수의 시간 제한 설정이 `Invoke` 단계 전체의 길이를 제한**합니다. 예를 들어 시간 제한이 360초면 함수와 모든 확장이 360초 안에 끝나야 합니다. 독립적인 post-invoke 단계는 없습니다 |
| `Shutdown` | 확장에 알리고 환경을 제거합니다 |

🆕 각 단계는 Lambda가 런타임과 등록된 모든 확장에 보내는 이벤트로 시작하고, 런타임과 각 확장은 `Next` API 요청으로 완료를 알립니다. 모두 완료되고 대기 이벤트가 없으면 Lambda가 실행 환경을 **동결(freeze)** 합니다.

🆕 프로비저닝된 동시성, SnapStart, Lambda Managed Instances를 쓰는 함수에는 `Init` 10초 제한이 적용되지 않고 초기화 코드가 최대 15분까지 실행될 수 있습니다(제한은 **130초 또는 구성된 함수 시간 제한 중 더 큰 값**, 최대 900초).

🆕 함수가 `Invoke` 단계에서 충돌하거나 시간 초과되면 Lambda가 실행 환경을 재설정합니다. 이 재설정은 `Shutdown` 이벤트처럼 동작하며 **다음 `Init` 단계 전에 `/tmp` 내용을 지우지 않습니다.** `Init` 단계에서 충돌·시간 초과가 발생하면 `INIT_REPORT` 로그에 오류 정보가 기록됩니다.

> — 출처: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

교재 강사 노트의 코드 항목 서술 "AWS Lambda는 Amazon S3에 코드를 저장하고 저장된 데이터를 암호화합니다"는 **저장 중 암호화 부분은 맞지만 저장 위치 서술이 달라졌습니다.** 🔄 Lambda는 환경 변수, 업로드한 파일(배포 패키지와 레이어 아카이브 포함), 이벤트 소스 매핑 필터 조건 객체, durable execution 데이터에 대해 **항상 저장 중 암호화**를 제공합니다. 저장 위치는 **Lambda 관리형 스토리지**(계정·리전당 300GB, 압축 해제 기준)가 기본이고, 사용자 S3 버킷을 쓰는 **자체 관리형 S3 코드 스토리지**가 선택 옵션입니다. 자체 관리형을 쓰면 Lambda가 소스 코드 사본을 저장하지 않고 저장 중 암호화는 S3 버킷 구성으로 관리됩니다.

> — 출처: [Data encryption at rest for AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/security-encryption-at-rest.html)

### 4.6 콜드 스타트와 웜 스타트 🆕

교재는 두 용어를 정의하지만 **얼마나 자주, 얼마나 오래** 걸리는지는 말하지 않습니다.

| 항목 | 내용 |
|---|---|
| 콜드 스타트 | 코드를 다운로드하고 환경을 시작하는 두 단계. **이 시간에도 과금**되고 전체 호출 시간에 지연이 더해집니다 |
| 웜 스타트 | 호출이 끝나면 실행 환경이 동결되고 Lambda가 일정 시간 환경을 유지합니다. 그 동안 같은 함수의 다른 요청이 오면 환경을 재사용합니다 |
| 발생 빈도 🆕 | **전체 호출의 1% 미만** |
| 지속 시간 🆕 | **100ms 미만에서 1초 초과까지** 다양 |
| 어디서 흔한가 🆕 | 호출 빈도가 낮은 **개발·테스트 함수**에서 프로덕션 워크로드보다 흔합니다 |

🆕 정적 초기화(핸들러 밖 코드) 지연에 영향을 주는 요소는 함수 패키지 크기(임포트한 라이브러리·종속성·**레이어**), 코드와 초기화 작업의 양, 라이브러리·서비스의 연결 설정 성능입니다. 최적화 방법으로 문서는 필요한 라이브러리만 임포트하기, 특정 실행 경로에서만 쓰는 객체는 전역 범위에서 지연 로딩하기, 호출 하나의 수명 동안만 쓰는 전역 변수는 핸들러 지역 변수로 바꾸기를 제시합니다.

> — 출처: [Understanding the Lambda execution environment lifecycle — Cold starts and latency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 4.7 동시성 🔄

교재 슬라이드 15 강사 노트의 서술은 현재 문서와 부합합니다.

- 새로운 호출 요청은 사용 가능한 실행 환경에서 처리됩니다. 사용할 수 없거나 사용량이 많으면 새 환경이 생성되어 요청을 처리하고, **이 새로운 환경은 다른 실행 환경과 리소스를 공유하지 않습니다.**
- 런타임은 일정 시간 이벤트가 수신되지 않아 종료된 경우 사용하지 못할 수 있습니다.
- 모든 요청의 실행 시간은 **15분(900초)** 으로 제한됩니다. **기본 시간 제한은 3초**이고 1~900초 사이에서 설정할 수 있습니다. 기간은 코드가 실행을 시작한 시간부터 반환하거나 종료될 때까지 계산되며 밀리초 단위로 올림 처리됩니다.

🆕 현재 문서의 동시성 정의와 계산식:

```text
동시성 = (초당 평균 요청 수) × (평균 요청 처리 시간(초))
```

예를 들어 평균 200ms인 함수가 피크에 초당 5,000건을 받으면 동시성은 `5,000 × 0.2 = 1,000`입니다. 계정의 리전당 총 동시성 한도는 **기본 1,000**이고 증액 요청할 수 있습니다.

#### 예약된 동시성과 프로비저닝된 동시성 🔄

교재는 슬라이드 16에서 프로비저닝된 동시성만 다루고, 예약된 동시성은 슬라이드 45 강사 노트에서 "동시성 중 일부를 예약"이라고만 언급합니다. 두 제어는 **목적이 다릅니다.**

| 항목 | 예약된 동시성(reserved) | 프로비저닝된 동시성(provisioned) |
|---|---|---|
| 무엇을 설정 | 함수에 할당할 동시 인스턴스의 **최대치와 최소치를 함께** 설정 | **미리 초기화한** 실행 환경 인스턴스 수 |
| 목적 | 중요한 함수에 동시성 확보 + 다운스트림 리소스(DB 연결 등) 과부하 방지 | **콜드 스타트 지연 감소.** 두 자릿수 밀리초 응답을 목표 |
| 다른 함수 영향 | 예약한 동시성은 다른 함수가 쓸 수 없습니다. 나머지는 미예약 풀에서 공유 | 미예약 풀이 줄어듭니다(쓰지 않아도) |
| 요금 | **추가 요금 없음** | **추가 요금 발생** |
| 적용 대상 | 함수 | **`$LATEST`에는 불가.** 게시된 버전 또는 버전을 가리키는 별칭만 |
| 상한 | 계정 동시성 한도에 산입 | 미예약 계정 동시성 **− 100**(나머지 100은 예약된 동시성을 쓰지 않는 함수 몫) |

한 함수에 둘을 함께 할당할 수 있지만 **프로비저닝된 동시성이 예약된 동시성을 초과할 수 없습니다.** 프로비저닝된 동시성을 쓰면 Lambda가 할당 시점에 초기화 코드를 실행하므로 초기화를 핸들러 밖으로 최대한 옮기는 것이 좋습니다. 문서는 필요량 추정 시 통상 필요한 동시성에 **10% 버퍼**를 더할 것을 권장합니다(피크 200이면 220).

구성 API: `PutProvisionedConcurrencyConfig`, `GetProvisionedConcurrencyConfig`, `ListProvisionedConcurrencyConfigs`, `DeleteProvisionedConcurrencyConfig`.

```bash
# my-function 의 BLUE 별칭에 프로비저닝된 동시성 100 할당
aws lambda put-provisioned-concurrency-config --function-name my-function \
  --qualifier BLUE \
  --provisioned-concurrent-executions 100
```

> — 출처: [Configuring provisioned concurrency for a function](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

#### 동시성 조정 속도 🔄

교재 슬라이드 50은 이 항목을 **"버스트 동시성"** 이라 부르고 값을 "함수당 10초당 최대 1,000회 동시 실행"으로 기재합니다. **수치는 맞고 이름이 바뀌었습니다.**

| 항목 | 내용 |
|---|---|
| 현재 이름 | **동시성 조정 속도(concurrency scaling rate)**. 할당량 표에서는 동시성 조정 한도(concurrency scaling limit) |
| 값 | 각 리전에서 **각 함수마다** 10초당 실행 환경 인스턴스 1,000개(= 10초당 초당 요청 10,000건) |
| 성질 | 계정 수준 동시성 한도와 다른 **함수 수준** 한도. 함수마다 독립적으로 조정됩니다 |
| 보충 방식 | Lambda는 10초마다 한 번에 보충하는 대신 시간에 걸쳐 **연속적으로** 보충하려 시도합니다 |
| 누적 여부 | **누적되지 않습니다.** 어느 시점에서든 조정 속도는 최대 1,000이며, 앞 10초에 쓰지 않았다고 다음 10초에 2,000이 되지 않습니다 |
| 초과 시 | 요청이 조정 속도보다 빠르거나 함수가 최대 동시성에 도달하면 추가 요청은 **스로틀링 오류(429)** 로 실패합니다 |

> — 출처: [Lambda scaling behavior](https://docs.aws.amazon.com/lambda/latest/dg/scaling-behavior.html)

### 4.8 콜드 스타트 최소화하기 1/2

교재 슬라이드 16의 두 방법입니다.

| 방법 | 슬라이드 설명 |
|---|---|
| Lambda 함수 예약 | 함수를 특정 주기로 실행하기 위한 규칙 생성. 도형 레이블 "EventBridge 이벤트(시간 기반 트리거)" |
| 프로비저닝된 동시성 | 지정된 개수 만큼의 Lambda 런타임 환경을 초기화. 도형 레이블 "웜 스타트(이벤트 대기)" |

교재가 인용한 EventBridge 일정 예약 문서는 현재도 유효합니다.

> — 출처: [Tutorial: Schedule AWS Lambda functions using EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html)

프로비저닝된 동시성의 현재 정의와 제약은 [4.7절](#47-동시성)에 정리했습니다. 특히 **`$LATEST`에는 적용할 수 없다**는 제약이 실습에서 자주 걸립니다. 이벤트 소스가 있으면 그 이벤트 소스가 프로비저닝된 동시성을 구성한 별칭·버전을 가리키도록 해야 하며, 그러지 않으면 함수가 프로비저닝된 환경을 쓰지 않습니다.

### 4.9 콜드 스타트 최소화하기 2/2 — Lambda SnapStart 🔄

**교재는 슬라이드 16과 17의 제목을 둘 다 "콜드 스타트 최소화하기 1/2"로 적었습니다.** 슬라이드 17이 2/2여야 합니다. 이 문서는 두 절을 1/2·2/2로 구분했습니다.

교재 슬라이드 17 본문:

- Lambda SnapStart
- 시작 성능을 최대 10배까지 향상
- 새 버전 출시 시 기능 초기화
- 캐시된 스냅샷에서 실행 환경 재개
- Java 11 및 Java 17 관리형 런타임에 사용 가능

**동작 원리는 교재 서술과 같습니다.** 함수 버전을 게시할 때 Lambda가 함수를 초기화하고, 초기화된 실행 환경의 메모리·디스크 상태에 대한 **Firecracker MicroVM 스냅샷**을 촬영하고 암호화하고 짧은 지연 시간 액세스를 위해 캐시합니다. 처음 호출하거나 호출이 확장될 때 처음부터 초기화하는 대신 캐시된 스냅샷에서 실행 환경을 재개합니다. Lambda는 복원력을 위해 각 스냅샷의 사본 여러 개를 유지하고 최신 런타임·보안 업데이트를 자동으로 패치합니다.

세 가지가 달라졌습니다.

| 항목 | 교재 | 현재 |
|---|---|---|
| 지원 런타임 🔄 | Java 11 및 Java 17 | **Java 11 이상, Python 3.12 이상, .NET 8 이상** |
| 성능 표현 🔄 | "시작 성능을 최대 10배까지 향상" | 배수 대신 **"최대 1초 미만(as low as sub-second) 시작 성능"** |
| 요금 🔄 | "추가 비용 없이" | **Java 관리형 런타임만 추가 비용 없음.** 그 밖에는 스냅샷 캐싱 요금(최소 3시간)과 복원 요금 |

🆕 교재가 다루지 않는 제약:

- 그 밖의 관리형 런타임(예: `nodejs24.x`, `ruby4.0`), **OS 전용 런타임, 컨테이너 이미지는 지원하지 않습니다.**
- **프로비저닝된 동시성, Amazon EFS, Amazon S3 Files, 512MB를 초과하는 임시 스토리지를 지원하지 않습니다.**
- **게시된 버전과 버전을 가리키는 별칭에만** 쓸 수 있고 `$LATEST`에는 쓸 수 없습니다.
- 대규모 호출에서 가장 효과적이며 **호출 빈도가 낮은 함수는 같은 개선을 보지 못할 수 있습니다.**
- **상태의 고유성**에 의존하는 애플리케이션은 함수 코드가 스냅샷 작업에 내성이 있는지 검증해야 합니다. 초기화 코드가 고유 ID·비밀·의사 난수 엔트로피를 생성해 스냅샷에 포함되면 실행 환경 간에 고유하지 않게 됩니다. 초기화 단계에서 맺은 네트워크 연결의 상태도 보장되지 않으므로 검증하고 필요하면 다시 맺어야 합니다.
- 엄격한 콜드 스타트 지연 요구가 SnapStart로 충족되지 않으면 **프로비저닝된 동시성**을 쓰라고 안내합니다.

> — 출처: [Improving startup performance with Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

---

## 5. 권한

### 5.1 권한의 두 범주

교재 슬라이드 19의 구분입니다.

| 권한 유형 | 슬라이드 서술 |
|---|---|
| 호출 권한 | 이벤트 소스에 Lambda를 호출할 권한을 부여합니다 / Lambda 함수와 관련된 리소스 정책을 업데이트합니다 / **Lambda `AddPermission` API**를 사용합니다 |
| 실행 권한 | AWS Lambda에 스트림에서 읽을 수 있는 권한을 부여합니다 / 실행 역할을 업데이트합니다 |

교재 강사 노트:

- 호출 권한 — 이벤트 소스가 Lambda 함수와 통신하는 데 필요한 권한입니다. 호출 모델(Push 또는 Pull)에 따라 실행 역할 또는 리소스 정책(Lambda 함수와 연결된 액세스 정책)으로 부여할 수 있습니다.
- 실행 권한 — Lambda 함수가 계정 내 다른 AWS 리소스에 액세스하는 데 필요한 권한입니다. IAM 역할(**실행 역할**)을 생성하여 부여합니다.

현재 문서도 같은 두 범주로 나눕니다.

| 범주 | 현재 문서 서술 |
|---|---|
| 함수가 필요한 권한 | **실행 역할**이라는 특수한 IAM 역할로 정의합니다. **모든 Lambda 함수는 실행 역할을 가져야** 하고 최소한 CloudWatch 액세스가 필요합니다(`AWSLambdaBasicExecutionRole` 관리형 정책) |
| 다른 주체가 함수에 액세스할 권한 | **자격 증명 기반 정책**, **리소스 기반 정책**, 또는 태그를 쓰는 **ABAC**(속성 기반 액세스 제어) 🆕 |

🆕 평가 규칙: 사용자가 Lambda 리소스에 액세스하려 하면 Lambda는 **사용자의 자격 증명 기반 정책과 리소스의 리소스 기반 정책을 모두** 고려합니다. Amazon S3 같은 **AWS 서비스**가 함수를 호출하면 **리소스 기반 정책만** 고려합니다.

> — 출처: [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html)

교재가 인용한 `intro-permission-model.html` 경로는 현재 `lambda-permissions.html`로 리디렉션됩니다([10.3절](#103-비권장지원-종료된-항목)).

### 5.2 "같은 계정이면 권한이 필요 없다"는 서술 🔄

교재 슬라이드 20 강사 노트는 다음과 같이 기재합니다.

> 참고: 사용자 정의 애플리케이션과 이 애플리케이션이 호출하는 Lambda 함수가 같은 AWS 계정에 속한 경우 명시적인 권한을 부여할 필요가 없습니다.

**이 서술은 사실과 다릅니다.** 현재 문서는 계정 관계와 무관하게 호출 주체에게 권한이 필요하다고 기술합니다. 호출 문제 해결 문서의 서술입니다.

> 사용자 또는 수임하는 역할에 함수를 호출할 권한이 있어야 합니다. 이 요구 사항은 함수를 호출하는 Lambda 함수와 그 밖의 컴퓨팅 리소스에도 적용됩니다.

권한이 없으면 다음 오류가 발생합니다.

```text
User: arn:aws:iam::123456789012:user/developer is not authorized to perform:
lambda:InvokeFunction on resource: my-function
```

해결 방법은 AWS 관리형 정책 **`AWSLambdaRole`** 을 사용자에게 추가하거나, 대상 함수에 대해 `lambda:InvokeFunction`을 허용하는 사용자 지정 정책을 추가하는 것입니다. IAM 작업 이름 `lambda:InvokeFunction`은 Lambda API의 `Invoke` 작업을 가리킵니다.

정리하면 이렇습니다.

| 호출 주체 | 필요한 것 |
|---|---|
| 같은 계정의 IAM 사용자·역할 | **자격 증명 기반 정책**에 `lambda:InvokeFunction`. 리소스 기반 정책은 없어도 됩니다 |
| 다른 계정의 IAM 주체 | 양쪽 — 자격 증명 기반 정책 + 함수의 리소스 기반 정책 |
| AWS 서비스(S3·SNS 등) | 함수의 **리소스 기반 정책**(Lambda는 이 경우 리소스 기반 정책만 평가) |

교재 서술을 선의로 해석하면 "같은 계정이면 리소스 기반 정책을 별도로 추가하지 않아도 되는 경우가 있다"는 뜻으로 읽을 수 있지만, **어떤 권한도 필요 없다는 서술은 잘못되었습니다.**

> — 출처: [Troubleshoot invocation issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html)

### 5.3 푸시 또는 직접 호출 모델

교재 슬라이드 20의 다이어그램: 이벤트 소스 → (1. 이벤트를 AWS Lambda로 푸시하거나 Lambda 함수를 직접 호출) → **리소스 정책** → Lambda → (2. 이벤트를 처리) → **IAM 실행 역할** + 권한 정책 → 서비스.

| 요소 | 교재 서술 |
|---|---|
| 리소스 정책 | 다른 계정 및 AWS 서비스에 Lambda 리소스를 사용할 권한을 부여합니다 |
| IAM 실행 역할 | 함수에 AWS 서비스 및 리소스에 액세스할 권한을 부여합니다 |
| 액세스 정책 | 필요한 리소스 권한을 부여합니다 |

Amazon S3 트리거를 예로 든 현재 문서의 서술: S3가 함수를 호출하려면 함수의 **리소스 기반 정책**에서 권한이 필요하며, Lambda 콘솔에서 S3 트리거를 구성하면 콘솔이 버킷 이름과 계정 ID가 일치할 때 S3가 함수를 호출할 수 있도록 리소스 기반 정책을 수정합니다. S3에서 알림을 구성하는 경우에는 Lambda API로 정책을 업데이트합니다. 함수가 SDK로 S3 리소스를 관리한다면 **실행 역할에도 S3 권한**이 필요합니다.

🆕 트리거를 콘솔에서 만들면 Lambda가 필요한 권한을 리소스 기반 정책에 **자동으로 추가**합니다.

> — 출처: [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 5.4 리소스 기반 정책 구성 방법 🔄

교재는 호출 권한 부여 방법으로 `AddPermission` API만 제시합니다. 현재 문서는 **두 가지 방법을 제시하고 전체 JSON 정책을 권장합니다.**

| 방법 | 도구 | 특징 |
|---|---|---|
| **전체 JSON 정책** 🆕 (권장) | 콘솔, CLI `put-resource-policy`, `PutResourcePolicy` API | IAM 글로벌 조건 키 **전체**를 쓸 수 있고, 여러 프린시펄의 여러 문장과 명시적 **`Deny`** 문장을 만들 수 있습니다. 최대 크기 **20KB** |
| 개별 권한 | 콘솔, `AddPermission` API | `Allow` 문장 하나를 추가합니다. 조건 키가 `aws:SourceArn`·`aws:SourceAccount`·`aws:PrincipalOrgID`로 제한됩니다 |

리소스 기반 정책은 `Principal`(권한을 줄 대상), `Action`(허용·거부할 API 작업 목록), `Effect`(허용 또는 거부), `Resource`(대상 함수·버전·별칭)를 정의하는 JSON 문서입니다. 선택 요소로 `Sid`와 `Condition`을 쓸 수 있습니다.

🆕 **덮어쓰기 주의**: `put-resource-policy`는 기존 리소스 기반 정책 **전체를 대체**합니다. `add-permission`으로 만든 권한도 함께 사라집니다. 반대로 `add-permission`은 기존 정책에 문장을 덧붙입니다. 의도치 않은 덮어쓰기를 막으려면 `get-resource-policy`로 기존 정책과 `RevisionId`를 먼저 조회하고 `--revision-id`로 넘깁니다.

```bash
# 기존 정책과 RevisionId 조회
aws lambda get-resource-policy \
  --resource-arn arn:aws:lambda:us-east-2:123456789012:function:my-function

# 조회한 RevisionId 를 넘겨 정책 교체
aws lambda put-resource-policy \
  --resource-arn arn:aws:lambda:us-east-2:123456789012:function:my-function \
  --policy file://policy.json \
  --revision-id a1b2c3d4-5678-90ab-cdef-EXAMPLE11111
```

🆕 `AddPermission`으로 만든 기존 정책은 수정 없이 계속 동작하고 함수 코드를 바꿀 필요도 없습니다.

필요한 IAM 권한:

| API 작업 | 필요한 권한 |
|---|---|
| `PutResourcePolicy` | `lambda:PutResourcePolicy`, `lambda:AddPermission`, `lambda:RemovePermission` |
| `GetResourcePolicy` | `lambda:GetResourcePolicy`, `lambda:GetPolicy` |
| `DeleteResourcePolicy` | `lambda:DeleteResourcePolicy`, `lambda:RemovePermission` |

> — 출처: [Working with resource-based policies in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)

### 5.5 `AddPermission` API 🆕

교재는 API 이름만 언급합니다. 파라미터를 정리합니다.

| 파라미터 | 필수 | 내용 |
|---|---|---|
| `FunctionName` (URI) | 예 | 함수 이름(`my-function`), 별칭 포함(`my-function:v1`), 함수 ARN, 부분 ARN. 이름만 주면 64자 제한 |
| `Action` | 예 | 프린시펄이 쓸 수 있는 작업. 예: `lambda:InvokeFunction`, `lambda:GetFunction` |
| `Principal` | 예 | 함수를 호출하는 AWS 서비스·계정·IAM 사용자·역할. 서비스라면 `SourceArn`·`SourceAccount`로 범위를 좁힙니다 |
| `StatementId` | 예 | 같은 정책 안에서 문장을 구분하는 식별자(1~100자) |
| `Qualifier` (URI) | 아니요 | 게시된 버전 또는 별칭에 권한을 추가 |
| `SourceArn` | 아니요 | 함수를 호출하는 AWS 리소스 ARN. Lambda가 `StringLike` 연산자로 비교합니다 |
| `SourceAccount` | 아니요 | 리소스를 소유한 계정 ID. S3 버킷이 삭제되고 다른 계정이 같은 이름으로 다시 만들 수 있으므로 `SourceArn`과 함께 씁니다 |
| `PrincipalOrgID` | 아니요 | AWS Organizations 조직 ID. 조직 전체 계정에 권한 부여 |
| `FunctionUrlAuthType` / `InvokedViaFunctionUrl` 🆕 | 아니요 | 함수 URL 관련([6.14절](#614-함수-url)) |
| `EventSourceToken` | 아니요 | Alexa Smart Home 함수용 토큰 |
| `RevisionId` | 아니요 | 리비전 ID가 일치할 때만 정책을 업데이트 |

🆕 중요한 제약: **Lambda는 `$LATEST` 버전에 정책을 추가하는 것을 지원하지 않습니다.** 또 서비스 프린시펄에 소스를 지정하지 않고 권한을 주면 **다른 계정이 자기 계정의 리소스로 이 함수를 호출하도록 구성할 수 있으므로** `SourceArn`·`SourceAccount`로 반드시 제한해야 합니다.

성공하면 HTTP 201과 추가된 정책 문장을 반환합니다. 주요 오류: `PolicyLengthExceededException`(정책이 너무 큼), `PublicPolicyException`(퍼블릭 액세스를 허용하는 정책), `PreconditionFailedException`(`RevisionId` 불일치).

> — 출처: [AddPermission (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_AddPermission.html)

### 5.6 실행 역할 🆕

교재는 "IAM 역할(실행 역할)을 생성하여 권한을 부여합니다"라고만 서술합니다.

| 항목 | 내용 |
|---|---|
| 정의 | 함수에 AWS 서비스·리소스 액세스 권한을 부여하는 IAM 역할 |
| 수임 | Lambda가 함수를 호출할 때 **자동으로** 실행 역할을 수임합니다. 함수 코드에서 `sts:AssumeRole`을 직접 호출하지 않아야 합니다. 역할이 자기 자신을 수임해야 하는 경우에만 역할 자신을 신뢰 정책의 신뢰할 수 있는 주체로 넣습니다 |
| 신뢰 정책 | Lambda 서비스 프린시펄 **`lambda.amazonaws.com`** 을 신뢰할 수 있는 서비스로 지정해야 합니다 |
| 기본값 | 콘솔에서 함수를 만들면 `AWSLambdaBasicExecutionRole`(CloudWatch Logs 이벤트 로깅)이 포함된 최소 권한 실행 역할이 생성됩니다 |
| 최소 권한 | 프로덕션 게시 전에 필요한 권한만 남기도록 정책을 조정합니다. **IAM Access Analyzer**로 지정한 기간의 CloudTrail 로그를 분석해 함수가 실제로 쓴 권한만 담은 정책 템플릿을 생성할 수 있습니다 |

```bash
# 신뢰 정책과 함께 실행 역할 생성
aws iam create-role \
  --role-name lambda-ex \
  --assume-role-policy-document file://trust-policy.json

# 기본 실행 권한 부여
aws iam attach-role-policy --role-name lambda-ex \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

> — 출처: [Defining Lambda function permissions with an execution role](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)

### 5.7 ESM(폴링) 호출 모델과 관리형 정책 🆕

교재 슬라이드 21의 다이어그램: Lambda → (1. 이벤트 소스를 폴링) → 이벤트 소스 / (2. 이벤트를 처리) → 서비스. 양쪽에 **IAM 실행 역할**이 표시되어 있습니다.

교재 강사 노트의 핵심 서술 "AWS Lambda에 스트림에서 읽을 수 있는 권한을 부여해야 하며, Lambda 함수에 연결된 IAM 실행 역할을 업데이트하면 됩니다"는 현재 문서와 일치합니다. 문서는 "이벤트 소스 매핑으로 함수를 호출할 때 Lambda는 **실행 역할을 사용해 이벤트 데이터를 읽는다**"고 기술합니다.

🆕 교재가 제시하지 않는 관리형 정책 이름입니다.

| 관리형 정책 | 부여하는 권한 |
|---|---|
| `AWSLambdaDynamoDBExecutionRole` | DynamoDB 스트림 레코드 읽기 + CloudWatch Logs 쓰기 |
| `AWSLambdaKinesisExecutionRole` | Kinesis 데이터 스트림 이벤트 읽기 + CloudWatch Logs 쓰기 |
| `AWSLambdaSQSQueueExecutionRole` | SQS 메시지 읽기 + CloudWatch Logs 쓰기 |
| `AWSLambdaMSKExecutionRole` | MSK 클러스터 레코드 읽기·액세스, ENI 관리, CloudWatch Logs 쓰기 |
| `AWSLambdaBasicExecutionRole` | CloudWatch 로그 업로드 |
| `AWSLambdaVPCAccessExecutionRole` | Amazon VPC 내 ENI 관리 + CloudWatch Logs 쓰기 |
| `AWSXRayDaemonWriteAccess` | X-Ray 트레이스 데이터 업로드 |
| `CloudWatchLambdaInsightsExecutionRolePolicy` | CloudWatch Lambda Insights에 런타임 지표 쓰기 |

🆕 일부 기능에서 Lambda 콘솔이 누락된 권한을 고객 관리형 정책으로 추가하려 하고 이런 정책이 많아질 수 있으므로, **기능을 켜기 전에 관련 AWS 관리형 정책을 실행 역할에 먼저 붙이는 것**이 좋습니다. 서비스가 계정의 역할을 수임할 때는 신뢰 정책에 `aws:SourceAccount`·`aws:SourceArn` 조건 키를 넣어 예상한 리소스가 생성한 요청으로만 제한할 수 있습니다(혼동된 대리자 문제 방지).

교재가 인용한 `CreateEventSourceMapping` 문서 경로는 현재 API 참조로 리디렉션됩니다.

> — 출처: [Working with AWS managed policies in the execution role](https://docs.aws.amazon.com/lambda/latest/dg/permissions-managed-policies.html)

---

## 6. 개발

### 6.1 개발 옵션 🔄

교재 슬라이드 23은 액세스 위치를 **AWS 관리 콘솔 / AWS CLI / AWS SDK / 개발 도구**로 제시하고, 개발 도구를 다음과 같이 나열합니다.

- IDE용 AWS 도구 키트
- WYSIWYG 편집기 또는 패키징된 .zip 파일 업로드
- 서드 파티 플러그인(**Eclipse**, PyCharm, Visual Studio)

**교재가 인용한 세 링크 중 AWS Toolkit for Eclipse 사용 설명서 URL은 HTTP 404를 반환하고, `csharp-package-toolkit.html`은 개별 페이지로 남아 있지 않습니다.** `/toolkit-for-eclipse/v1/user-guide/`와 그 하위 `lambda.html`은 **AWS Toolkit for JetBrains 사용 설명서로 리디렉션**됩니다.

현재 Lambda 개발 도구 문서가 제시하는 도구입니다.

| 범주 | 내용 |
|---|---|
| 로컬 개발 | **AWS Toolkit for VS Code** — 로컬 함수 개발·디버깅·테스트와 Lambda 직접 배포 |
| IaC | **AWS SAM, AWS CDK, CloudFormation** |
| CI/CD 🆕 | **GitHub Actions** — 리포지토리에서 Lambda 배포 자동화. Deploy Lambda function 액션이 선언적 YAML 인터페이스를 제공하고 OIDC로 자격 증명을 처리 |
| 라이브러리 🆕 | **Powertools for AWS Lambda** — Python·TypeScript/Node.js·Java·.NET용 오픈 소스 개발자 툴킷. 구조화된 로깅·트레이싱·지표, 파라미터 조회, 시크릿 관리, 멱등성 패턴 |
| 워크플로·이벤트 🆕 | Lambda **durable functions**, AWS Step Functions, Amazon EventBridge |

> — 출처: [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

교재가 든 PyCharm용 툴킷은 현재 **AWS Toolkit for JetBrains**의 일부입니다. JetBrains 툴킷은 CLion(C·C++), GoLand(Go), IntelliJ(Java), WebStorm(Node.js), Rider(.NET), PhpStorm(PHP), PyCharm(Python), RubyMine(Ruby), DataGrip(데이터베이스)용 툴킷을 포함하고, Lambda 함수를 원격·로컬에서 생성·업데이트·실행·디버그할 수 있습니다.

> — 출처: [Working with the AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

### 6.2 Lambda 콘솔 코드 편집기 🔄

교재 슬라이드 14 강사 노트는 "코드를 Lambda 함수로 업로드하거나 Lambda의 코드 편집기에서 직접 코딩합니다"라고 서술하고, 슬라이드 50 할당량 표에는 배포 패키지 항목에 **"콘솔에서 인라인 편집: 3MB"** 가 있습니다.

**현재 할당량 표에 3MB 항목은 없습니다.** 코드 편집기 사용 조건은 다음 두 가지입니다.

| 조건 | 내용 |
|---|---|
| 런타임 | **인터프리터 언어 런타임**(Python, Node.js, Ruby) 중 하나를 써야 합니다 |
| 크기 | 배포 패키지가 **압축 해제 기준 50MB 미만**이어야 합니다 |

**컨테이너 이미지 배포 패키지를 쓰는 함수의 코드는 콘솔에서 직접 편집할 수 없습니다.** 콘솔은 단일 소스 파일로 함수를 만들고 스크립팅 언어에서는 파일을 편집하고 추가할 수 있습니다. 코드를 저장하면 콘솔이 .zip 파일 아카이브 배포 패키지를 만들고, 편집한 코드는 **DEPLOY** 섹션의 **Deploy**로 반영합니다.

🆕 레이어를 쓰면 배포 패키지 크기가 줄어 코드 편집기를 쓸 수 있게 되기도 합니다([6.11절](#611-레이어)).

> — 출처: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 6.3 Lambda 함수 계획 — 프로그래밍 모델

교재 슬라이드 24의 3단 구성입니다.

| 항목 | 슬라이드 본문 |
|---|---|
| 프로그래밍 모델 | 프로세스, 스레드, `/tmp`, 소켓 사용 / AWS SDK |
| 스테이트리스(stateless) | 외부 스토리지를 사용하여 데이터 유지 / 기본 인프라에 대한 선호도 또는 액세스 권한 없음 |
| 모니터링 및 로깅 | 요청, 오류, 스로틀 지표 / Amazon CloudWatch Logs에 대한 내장 로그 / AWS X-Ray 통합 |

교재 강사 노트 요지:

- AWS Lambda를 사용하면 일반 언어 및 추가 스레드·프로세스 생성 같은 운영 체제 기능을 사용할 수 있습니다.
- Lambda 함수 코드 내에서 지표를 생성·업데이트하는 대신 **AWS Lambda 지표와 CloudWatch 경보**를 사용합니다. 예상되는 Lambda 함수 런타임을 기준으로 경보를 구성할 수 있습니다.
- 로깅 라이브러리와 Lambda 지표·차원을 사용하여 애플리케이션 오류(ERR, ERROR, WARNING)를 파악합니다.

SDK 내장에 관한 서술은 현재 권장과 반대이므로 [3.6절](#36-런타임에-포함된-aws-sdk)에서 따로 다뤘습니다.

### 6.4 AWS X-Ray 통합 🆕

교재는 "AWS X-Ray 통합"이라는 항목명만 제시합니다.

| 항목 | 내용 |
|---|---|
| 트레이싱 모드 | **`Active`** — Lambda가 함수 호출의 트레이스 세그먼트를 자동으로 만들어 X-Ray로 전송. **`PassThrough`** — 트레이싱 컨텍스트만 다운스트림 서비스로 전파 |
| 권한 | 콘솔에서 트레이싱을 활성화하면 Lambda가 실행 역할에 필요한 권한을 추가합니다. 그렇지 않으면 **`AWSXRayDaemonWriteAccess`** 정책을 실행 역할에 붙입니다 |
| 샘플링 | 모든 요청을 추적하지 않습니다. 샘플링 비율은 **초당 1건 + 추가 요청의 5%** 이며 함수별로 이 비율을 구성할 수 없습니다 |
| 세그먼트 | 트레이스당 **2개 세그먼트**. `AWS::Lambda`(실행 환경 준비: MicroVM 스케줄링, 환경 생성·해동, 코드·레이어 다운로드)와 `AWS::Lambda::Function`(함수가 한 일). `AWS::Lambda` 세그먼트에 오류가 보이면 Lambda 서비스 문제, `AWS::Lambda::Function`에 오류가 보이면 함수 문제입니다 |
| 하위 세그먼트 | 함수 세그먼트 하위에 `Initialization`, `Invocation`, `Overhead`(+ SnapStart는 `Restore`). X-Ray SDK로 `Invocation` 하위 세그먼트를 확장할 수 있지만 함수 세그먼트에 직접 접근하거나 핸들러 호출 범위 밖의 작업을 기록할 수는 없습니다 |
| 미지원 | MSK, 셀프 매니지드 Apache Kafka, Amazon MQ(ActiveMQ·RabbitMQ), Amazon DocumentDB **ESM을 쓰는 함수는 현재 X-Ray 트레이싱을 지원하지 않습니다** |

> — 출처: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

### 6.5 Lambda 함수: 핸들러

교재 슬라이드 25의 도형: 핸들러 함수(호출 시 실행할 함수) / 이벤트 객체(호출 시 전송되는 데이터) / 컨텍스트 객체(현재 런타임 환경에 대한 정보를 제공).

핸들러는 사용자가 생성하여 패키지에 포함시킨 특정 코드 메서드(Java, C#) 또는 함수(Node.js, Python)입니다. Lambda 함수를 생성할 때 핸들러를 지정하며, 지원 언어마다 핸들러를 정의·참조하는 자체 요구 사항이 있습니다. 핸들러는 두 개의 인수를 사용합니다: **이벤트 객체**와 **컨텍스트 객체(선택 사항)**.

| 인수 | 교재 서술 |
|---|---|
| 이벤트 객체 | 구조와 내용이 이벤트 소스에 따라 달라집니다. API Gateway가 생성하는 이벤트에는 경로·쿼리 문자열·요청 본문이 포함되고, 새 객체 생성 시 Amazon S3가 생성하는 이벤트에는 버킷 및 새 객체 세부 정보가 포함됩니다 |
| 컨텍스트 객체 | 내용·구조가 언어 런타임에 따라 다르지만 최소한 AWS RequestId, Timeout(남은 시간), Logging(CloudWatch Logs 스트림 정보)이 포함됩니다 |

모범 사례(교재 강사 노트):

- **핵심 로직에서 Lambda 핸들러(진입점)를 분리합니다.** 함수를 보다 효과적으로 단위 테스트하도록 만들 수 있습니다.
- **재귀 코드를 사용하지 않습니다.** 재귀 코드를 사용하면 의도하지 않은 함수 호출이 증가하고 비용이 상승할 수 있습니다([6.7절](#67-재귀-루프-감지)).

### 6.6 예제: Amazon S3 이벤트

교재 슬라이드 26의 JSON은 **현재 공식 문서 예제와 필드 구성이 일치합니다**(교재는 값 일부를 `…`로 줄였습니다). 아래 예제에서 `principalId` 값만 자리표시자로 바꿨습니다. IAM 주체 고유 ID는 비밀값이 아니지만 액세스 키와 형태가 같아 비밀값 스캐너가 오탐하기 때문입니다. 나머지 값은 문서 그대로입니다.

```json
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "awsRegion": "us-east-2",
      "eventTime": "2019-09-03T19:37:27.192Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": { "principalId": "AWS:AIDA_EXAMPLE_PRINCIPAL_ID" },
      "requestParameters": { "sourceIPAddress": "205.255.255.255" },
      "responseElements": {
        "x-amz-request-id": "D82B88E5F771F645",
        "x-amz-id-2": "vlR7PnpV2Ce81l0PRw6jlUpck7Jo5ZsQjryTjKlc5aLWGVHPZLj5NeC6qMa0emYBDXOo6QBU0Wo="
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "828aa6fc-f7b5-4305-8584-487c791949c1",
        "bucket": {
          "name": "amzn-s3-demo-bucket",
          "ownerIdentity": { "principalId": "A3I5XTEXAMAI3E" },
          "arn": "arn:aws:s3:::lambda-artifacts-deafc19498e3f2df"
        },
        "object": {
          "key": "b21b84d653bb07b05b1e6b33684dc11b",
          "size": 1305107,
          "eTag": "b21b84d653bb07b05b1e6b33684dc11b",
          "sequencer": "0C0F6F405D6ED209E1"
        }
      }
    }
  ]
}
```

🆕 교재가 슬라이드 26에서 다루지 않는 주의 사항: **함수를 트리거한 것과 같은 버킷에 함수가 쓰면 무한 루프가 발생할 수 있습니다.** 버킷을 두 개 쓰거나 수신 객체용 접두사로 트리거 범위를 제한합니다. 또 `s3.object.key`는 **URL 인코딩된** 객체 키 이름이므로 그대로 텍스트로 쓰면 공백이 있는 이름(`james beswick.jpg`)에서 `NoSuchKey` 오류가 납니다.

> — 출처: [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 6.7 재귀 루프 감지 🆕

교재 슬라이드 25 강사 노트는 재귀 코드 대응을 이렇게만 안내합니다.

> 실수로 재귀 코드를 사용하게 된 경우 코드를 업데이트하는 동안 함수 동시 런타임 한도를 즉시 0으로 설정하여 해당 함수에 대한 모든 호출을 제한하십시오.

**현재 Lambda는 특정 유형의 재귀 루프를 자동으로 감지해 중지합니다.**

| 항목 | 내용 |
|---|---|
| 기본 동작 | 재귀 루프를 감지하면 **함수 호출을 중지하고 알립니다.** 의도적으로 재귀 패턴을 쓴다면 함수 구성을 바꿔 재귀 호출을 허용할 수 있습니다 |
| 감지 방식 | **AWS X-Ray 트레이싱 헤더**로 이벤트를 추적합니다. X-Ray 활성 트레이싱을 켜지 않아도 동작하고 모든 AWS 고객에게 기본 활성화되어 있으며 **무료**입니다 |
| 임계값 | 같은 트리거 이벤트로 발생한 호출 시퀀스를 **요청 체인(chain of requests)** 이라 하고, 함수가 같은 체인에서 **약 16회** 호출되면 그 체인의 다음 호출을 중지합니다. 다른 트리거에서 온 호출은 영향을 받지 않습니다 |
| 감지 범위 | 함수 자신, **Amazon SQS, Amazon S3, Amazon SNS** 사이의 루프와 **Lambda 함수만으로 구성된 루프**(동기·비동기 상호 호출). Amazon DynamoDB처럼 다른 서비스가 루프에 포함되면 **감지·중지할 수 없습니다** |
| SDK 요구 사항 | 감지에는 최소 SDK 버전이 필요합니다. Python `boto3` 1.24.46·`botocore` 1.27.46, Node.js SDK v2 2.1147.0·v3 3.105.0, Java 8·11 2.17.135, Java 17 2.20.81, Java 21 2.21.24, .NET 3.7.293.0, Ruby 3.134.0, PHP 3.232.0, Go V2 SDK 1.57.0 이상 |
| 알림 | Health Dashboard(최초 표시까지 최대 3.5시간)와 이메일. CloudWatch 지표로 중지된 재귀 호출 수를 모니터링할 수 있습니다 |
| 중지된 이벤트 | 온-실패 대상이나 DLQ를 구성했다면 중지된 호출의 이벤트를 거기로 보냅니다. 이때 함수를 호출하는 것과 **같은 리소스를 대상으로 쓰면 또 다른 루프**가 생깁니다 |

**교재의 수동 조치도 여전히 유효합니다.** DynamoDB가 포함된 루프처럼 감지되지 않는 조합이 있으므로, 예약된 동시성을 0으로 설정하는 조치와 CloudWatch 경보·청구 경보·AWS Cost Anomaly Detection을 병행하는 것이 문서의 권장입니다.

> — 출처: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

### 6.8 컨텍스트 객체 🔄

교재 슬라이드 27은 세 언어의 컨텍스트 목록을 제시하고, **같은 "남은 시간" 항목의 기본값을 Python은 3초, Java와 .NET은 15분으로 서술합니다. 교재 내부 불일치입니다.**

세 언어의 컨텍스트 문서는 모두 "**시간 초과 전에 남은 밀리초 수를 반환한다**"고만 기술하고 **기본값을 명시하지 않습니다.** 이 값은 함수에 구성된 시간 제한을 기준으로 계산되므로 언어별 기본값이 따로 있는 것이 아닙니다. 함수 시간 제한 자체의 기본값이 3초, 최대가 900초(15분)이므로 Python의 3초는 기본값을, Java·.NET의 15분은 최대값을 잘못 옮긴 것으로 보입니다.

현재 문서의 세 언어 목록입니다. **이름은 교재와 일치합니다.**

| Python | Java | .NET(C#) |
|---|---|---|
| `get_remaining_time_in_millis` (메서드) | `getRemainingTimeInMillis()` | `RemainingTime` (`TimeSpan`) |
| `function_name` | `getFunctionName()` | `FunctionName` |
| `function_version` | `getFunctionVersion()` | `FunctionVersion` |
| `invoked_function_arn` | `getInvokedFunctionArn()` | `InvokedFunctionArn` |
| `memory_limit_in_mb` | `getMemoryLimitInMB()` | `MemoryLimitInMB` |
| `aws_request_id` | `getAwsRequestId()` | `AwsRequestId` |
| `log_group_name` | `getLogGroupName()` | `LogGroupName` |
| `log_stream_name` | `getLogStreamName()` | `LogStreamName` |
| `identity` (모바일 앱) 🔄 | `getIdentity()` (모바일 앱) | `Identity` (모바일 앱) |
| `client_context` (모바일 앱) 🔄 | `getClientContext()` (모바일 앱) | `ClientContext` (모바일 앱) |
| — | `getLogger()` | `Logger` |

🔄 교재의 **Python 목록에는 `identity`와 `client_context`가 빠져 있습니다.** 현재 문서는 Python에도 이 둘이 있다고 기술하며, `identity`는 `cognito_identity_id`·`cognito_identity_pool_id`를, `client_context`는 `client.installation_id`·`client.app_title`·`client.app_version_name`·`client.app_version_code`·`client.app_package_name`·`custom`·`env`를 포함합니다.

🆕 Java 컨텍스트 객체의 인터페이스는 **`aws-lambda-java-core`** 라이브러리에 있고, 이 인터페이스를 구현해 테스트용 컨텍스트 클래스를 만들 수 있습니다. Python 컨텍스트 객체는 **Lambda 런타임 인터페이스 클라이언트**에 정의된 클래스이며, Powertools for AWS Lambda(Python)가 타입 힌트용 인터페이스 정의를 제공합니다.

```python
import time

def lambda_handler(event, context):
    # 컨텍스트 객체로 호출·환경 정보를 로그에 남긴다
    print("Lambda function ARN:", context.invoked_function_arn)
    print("CloudWatch log stream name:", context.log_stream_name)
    print("CloudWatch log group name:", context.log_group_name)
    print("Lambda Request ID:", context.aws_request_id)
    print("Lambda function memory limits in MB:", context.memory_limit_in_mb)
    # 1초 지연을 넣어 남은 시간이 줄어드는 것을 확인한다
    time.sleep(1)
    print("Lambda time remaining in MS:", context.get_remaining_time_in_millis())
```

> — 출처: [Using the Lambda context object to retrieve Python function information](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html)

> — 출처: [Using the Lambda context object to retrieve Java function information](https://docs.aws.amazon.com/lambda/latest/dg/java-context.html)

### 6.9 예제: 함수 핸들러

#### Python

교재 슬라이드 28의 구문과 예시입니다.

```python
def handler_name(event, context):
    ...
    return some_value
```

```python
def my_handler(event, context):
    # 입력 이벤트의 데이터로 메시지를 만들어 반환한다
    message = 'Hello {} {}!'.format(event['first_name'],
                                   event['last_name'])
    return {
        'message': message
    }
```

🆕 현재 문서가 명시하는 핸들러 이름 규칙: 핸들러 이름은 **핸들러 함수가 있는 파일 이름과 함수 이름**에서 파생됩니다. 파일이 `lambda_function.py`이고 함수가 `lambda_handler`면 핸들러는 **`lambda_function.lambda_handler`** 이고, 이것이 콘솔로 만든 함수의 기본 핸들러 이름입니다.

🆕 JSON → Python 타입 변환: object→`dict`, array→`list`, number→`int` 또는 `float`, string→`str`, Boolean→`bool`, null→`NoneType`.

> — 출처: [Define Lambda function handler in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

#### Java

교재 슬라이드 29의 구문과 예시입니다.

```text
MyOutput output handlerName(MyEvent event, Context context)
{
    ...
}
```

```java
package example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Hello implements RequestHandler<Integer, String> {
    // 입력은 정수, 출력은 문자열이다
    public String myHandler(int myCount, Context context) {
        return String.valueOf(myCount);
    }
}
```

이 코드와 종속성을 패키징하고 Lambda 함수를 생성할 때 **`example.Hello::myHandler`**(`package.class::method-reference`)를 핸들러로 지정합니다. 첫 번째 핸들러 파라미터는 이벤트 데이터(S3 같은 이벤트 소스가 게시)이거나 사용자가 제공하는 사용자 지정 입력일 수 있습니다.

`com.amazonaws.services.lambda.runtime` 패키지는 AWS SDK for Java v1이 아니라 **`aws-lambda-java-core`** 라이브러리이며 **현재 공식 예제도 같은 임포트를 씁니다.** 교재 코드가 낡은 것이 아닙니다.

#### C#

교재 슬라이드 30의 구문과 예시입니다.

```text
myOutput HandlerName(MyEvent event, ILambdaContext context) {
    ...
}
```

```csharp
using Amazon.Lambda.Core;

// JSON 직렬화기를 어셈블리 수준에서 지정한다
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace SimpleLambda
{
    public class Function
    {
        public string FunctionHandler(string input, ILambdaContext context)
        {
            return $"Hello {input}!";
        }
    }
}
```

클래스에서 Lambda 함수 핸들러를 인스턴스 또는 정적 메서드로 정의합니다. Lambda 컨텍스트 객체에 액세스하려면 `ILambdaContext` 형식의 파라미터를 정의합니다. 이 인터페이스로 현재 함수의 이름, 메모리 한도, 남은 런타임, 로깅 정보에 액세스할 수 있습니다.

**`DefaultLambdaJsonSerializer`(SystemTextJson)는 현재 공식 컨텍스트 문서 예제에서도 그대로 쓰입니다.** 교재가 인용한 `csharp-handler.html` 경로도 유효합니다.

> — 출처: [Define Lambda function handler in C#](https://docs.aws.amazon.com/lambda/latest/dg/csharp-handler.html)

### 6.10 예제: Lambda 함수(Python) — 실습 코드 🔄

교재 슬라이드 31의 실습 코드입니다.

```python
# 함수를 보다 효과적으로 단위 테스트할 수 있도록 핸들러 외부에서 초기화한다
dynamoDBResource = boto3.resource('dynamodb')
pollyClient = boto3.client('polly')
s3Client = boto3.client('s3')

def lambda_handler(event, context):
    # 이벤트와 환경 변수에서 사용자 파라미터를 추출한다
    userId = event['userId']
    noteId = event['noteId']
    voiceId = event['voiceId']
    mp3Bucket = os.environ['MP3_BUCKET_NAME']
    ddbTable = os.environ['Notes_Table']
    # 데이터베이스에서 노트 텍스트를 가져온다
    text = getNote(dynamoDBResource, ddbTable, userId, noteId)
    # Polly 의 출력으로 MP3 파일을 로컬에 저장한다
    filePath = createMP3File(pollyClient, text, voiceId, noteId)
    # 미리 서명된 URL 로 액세스할 S3 에 파일을 호스트한다
    signedURL = hostFileOnS3(s3Client, filePath, mp3Bucket, userId, noteId)
    return signedURL
```

슬라이드 주석: 이벤트에서 정보를 끌어옵니다 / 환경 변수에서 정보를 끌어옵니다 / 핵심 로직에서 Lambda 핸들러를 분리합니다.

**핸들러 밖 초기화는 현재도 권장 패턴입니다.** 현재 공식 Python 예제도 SDK 클라이언트와 로거를 핸들러 밖에서 초기화하고, 문서는 이것이 실행 환경 재사용의 이점을 활용해 성능을 개선한다고 설명합니다.

🔄 다만 첫 줄의 `boto3.resource('dynamodb')`는 주의가 필요합니다. Boto3 공식 문서의 Resources 페이지는 다음을 명시합니다.

> AWS Python SDK 팀은 boto3의 resources 인터페이스에 새 기능을 추가할 계획이 없습니다. 기존 인터페이스는 boto3 수명 주기 동안 계속 동작합니다. 새로운 서비스 기능은 client 인터페이스로 이용할 수 있습니다.

기존 코드는 계속 동작하므로 **실습 진행에는 문제가 없습니다.** 새로 작성하는 코드라면 `boto3.client('dynamodb')`를 쓰는 것이 안전합니다. 또 리소스 인스턴스는 **스레드 안전하지 않아** 스레드·프로세스 간에 공유하면 안 되고 스레드마다 새로 만들어야 합니다.

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 6.11 레이어

교재 슬라이드 37·38의 서술은 **현재 문서와 대부분 일치합니다.**

| 항목 | 교재 서술 | 현재 문서 |
|---|---|---|
| 형식 | 라이브러리·사용자 지정 런타임·기타 종속성이 포함된 **.zip 파일 아카이브** | 일치 |
| 용도 | 같은 함수의 여러 버전 또는 여러 함수 간에 코드 공유. 스토리지 사용량 감소, 배포 패키지가 작아져 콜드 스타트 동안 더 빠르게 다운로드 | 일치 |
| 버전 | **배포된 레이어는 변경 불가능한 버전**이며 새 레이어가 게시될 때마다 버전 번호가 증가 | 일치. 새 레이어를 만들면 버전 1이 생성되고 업데이트 게시마다 번호가 증가하며, 각 레이어 버전은 고유 ARN으로 식별되고 함수에 추가할 때 **정확한 레이어 버전을 지정**해야 합니다 |
| 개수 | **함수당 최대 5개**. 표준 Lambda 배포 크기 제한에 포함 | 일치 |
| 공유 | 빌드-배포 과정에서 압축하면 다른 함수·계정·서드 파티와 손쉽게 공유할 수 없고 변경 사항을 전파할 수 없음 | 일치 |

🆕 교재가 다루지 않는 사항:

- 레이어를 추가하면 Lambda가 실행 환경의 **`/opt` 디렉터리**로 레이어 내용을 추출합니다. 네이티브로 지원되는 모든 런타임에 `/opt` 하위 특정 디렉터리 경로가 포함되어 있습니다.
- **레이어는 .zip 파일 아카이브로 배포한 함수에만** 쓸 수 있습니다. 컨테이너 이미지로 정의한 함수는 런타임과 모든 종속성을 이미지에 패키지합니다(교재 슬라이드 49 강사 노트의 "컨테이너 이미지는 레이어를 사용하지 않습니다"와 같은 내용입니다).
- 레이어를 쓰는 다섯 번째 이유: **내장 SDK 버전 고정.** 런타임에 포함된 SDK는 예고 없이 바뀔 수 있으므로 특정 버전을 담은 레이어를 만들면 서비스의 내장 버전이 바뀌어도 함수는 레이어 버전을 씁니다.
- **Go와 Rust 함수에는 레이어를 권장하지 않습니다.** 컴파일된 실행 파일에 종속성을 함께 넣는 편이 초기화 단계의 추가 어셈블리 로드를 피해 콜드 스타트에 유리합니다.

교재 슬라이드 38의 도형은 **AWS 관리형 레이어**와 **파트너 또는 서드 파티 레이어**를 제시하지만 구체적 이름을 밝히지 않습니다. 이 문서도 확인하지 못한 이름을 추가하지 않았습니다([10.5절](#105-검증하지-못한-항목)).

> — 출처: [Managing Lambda dependencies with layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)

### 6.12 환경 변수 🔄

교재 슬라이드 32의 서술과 명령입니다.

| 항목 | 내용 |
|---|---|
| 용도 | 코드를 업데이트하지 않고 Lambda 함수의 동작을 조정 |
| 저장 | 함수의 **버전별 구성**에 저장되고 함수에 제공됨 / **저장 시 암호화** |

```bash
aws lambda update-function-configuration --function-name my-function \
  --environment "Variables={BUCKET=my-bucket,KEY=file.txt}"
```

교재 서술은 현재 문서와 일치합니다. 추가로 알아야 할 것이 있습니다.

| 항목 | 내용 |
|---|---|
| 총 크기 한도 🆕 | 모든 환경 변수를 합쳐 **4KB** |
| 키 규칙 🆕 | 문자로 시작하고 두 글자 이상. 문자·숫자·밑줄(`_`)만 사용. Lambda 예약 이름은 사용 불가 |
| 버전 잠금 | 미게시 버전에서 정의하고 버전을 게시하면 그 버전에 대해 **잠깁니다** |
| 평가 시점 🆕 | 환경 변수는 **호출 전에 평가되지 않습니다.** 정의한 값은 리터럴 문자열로 취급되므로 변수 평가는 함수 코드에서 수행합니다 |
| **덮어쓰기 주의** 🆕 | `update-function-configuration`으로 환경 변수를 적용하면 **`Variables` 구조 전체가 대체됩니다.** 새 변수를 추가할 때 기존 값을 모두 요청에 포함해야 합니다 |
| 민감 정보 🆕 | 데이터베이스 자격 증명, API 키, 인증 토큰 같은 민감 정보는 환경 변수 대신 **AWS Secrets Manager**를 쓰도록 권장합니다 |

🔄 **덮어쓰기 주의는 교재 슬라이드 35 예제에 직접 영향을 줍니다.** 슬라이드 34에서 `TABLE_NAME`을 설정하고 슬라이드 35에서 `MP3_BUCKET_NAME`·`Notes_Table`만 지정하면 `TABLE_NAME`은 **사라집니다.** 기존 값을 유지하려면 `get-function-configuration`으로 현재 값을 조회해 함께 넘기고, 조회 결과의 `RevisionId`를 `update-function-configuration`에 전달하면 읽고 쓰는 사이에 값이 바뀌는 것을 막을 수 있습니다.

저장 중 암호화의 세부 사항 🆕:

| 구분 | 내용 |
|---|---|
| 기본(서버 측) | Lambda가 **항상** AWS KMS 키로 저장 중 암호화합니다. 기본값은 **AWS 관리형 키**이며 Lambda가 계정에 생성하고 권한을 관리하며 **사용 요금이 없습니다** |
| 고객 관리형 키 | KMS 키 교체를 직접 제어하거나 조직 요구를 충족해야 할 때 선택합니다. 이 경우 **그 KMS 키에 액세스할 수 있는 계정 사용자만** 환경 변수를 보거나 관리할 수 있고 표준 AWS KMS 요금이 부과됩니다 |
| 전송 중(클라이언트 측) | 전송 중 암호화 헬퍼를 활성화하면 환경 변수를 클라이언트 측에서 암호화합니다. 함수에 `kms:Decrypt` 권한이 필요합니다 |
| 필요한 KMS 권한 | 콘솔에서 키를 보려면 `kms:ListAliases`, 함수에 고객 관리형 키를 구성하려면 `kms:CreateGrant`·`kms:Encrypt`, 암호화된 환경 변수를 보고 관리하려면 `kms:Decrypt` |

> — 출처: [Working with Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

> — 출처: [Securing Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html)

### 6.13 arm64(Graviton2) 아키텍처 🆕

교재는 명령 세트 아키텍처 선택을 다루지 않습니다. **현재는 모든 지원 런타임이 x86_64와 arm64를 함께 지원합니다.**

| 항목 | 내용 |
|---|---|
| 선택지 | **arm64**(AWS Graviton2 프로세서용 64비트 ARM), **x86_64** |
| 이점 | arm64 함수는 동등한 x86_64 함수보다 **가격·성능이 크게 좋을 수 있습니다.** 고성능 컴퓨팅, 비디오 인코딩, 시뮬레이션처럼 컴퓨팅 집약 워크로드에 적합합니다. Graviton2는 vCPU당 L2 캐시가 커서 웹·모바일 백엔드, 마이크로서비스, 데이터 처리 시스템의 지연 성능을 개선하고 암호화 성능도 좋습니다 |
| 마이그레이션 요건 | 배포 패키지가 통제 가능한 오픈 소스·자체 코드로 구성되고, 서드 파티 종속성마다 **arm64 버전**이 있어야 합니다 |
| 코드 호환성 | 콘솔 내장 코드 편집기로 코드를 넣었다면 대개 수정 없이 두 아키텍처에서 실행됩니다. 업로드한 코드는 대상 아키텍처와 호환되는 새 코드를 올려야 하고, **레이어와 확장도 각각 호환성을 확인**해야 합니다. 컨테이너 이미지는 새 이미지를 만들어야 합니다 |
| 배포 전략 | 별칭 라우팅 구성(가중치 별칭)으로 x86과 arm64 버전 사이에 트래픽을 나눠 성능·지연을 비교하는 방법을 문서가 권장합니다 |
| 기본값 | `CreateFunction`에서 `Architectures`를 지정하지 않으면 **`x86_64`** 입니다 |

> — 출처: [Selecting and configuring an instruction set architecture for your Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html)

### 6.14 함수 URL 🆕

교재는 HTTP 요청 경로로 Amazon API Gateway만 제시합니다. **현재 Lambda를 HTTP 엔드포인트로 호출하는 방법은 두 가지입니다.**

| 항목 | 내용 |
|---|---|
| 정의 | Lambda 함수 전용 HTTP(S) 엔드포인트 |
| 형식 | `https://<url-id>.lambda-url.<region>.on.aws`. 한 번 만들면 **엔드포인트가 바뀌지 않습니다** |
| 네트워크 | 듀얼 스택으로 IPv4·IPv6 지원. **퍼블릭 인터넷으로만** 액세스할 수 있고 AWS PrivateLink는 지원하지 않습니다 |
| 보안 | **리소스 기반 정책**으로 액세스를 제어하고 CORS 구성을 지원합니다. 인증 유형은 `AWS_IAM` 또는 `NONE` |
| 적용 대상 | 함수 **별칭** 또는 `$LATEST` 미게시 버전. 다른 함수 버전에는 추가할 수 없습니다 |
| 구성 | CLI `create-function-url-config`, CloudFormation `AWS::Lambda::Url` 리소스 |

```bash
# prod 별칭에 IAM 인증 함수 URL 을 추가한다
aws lambda create-function-url-config \
    --function-name my-function \
    --qualifier prod \
    --auth-type AWS_IAM
```

인증 유형을 `NONE`으로 두면 **IAM 인증을 우회해 누구나 함수를 호출할 수 있는 퍼블릭 엔드포인트**가 됩니다. 실습·데모가 아니라면 `AWS_IAM`을 쓰고, `NONE`을 쓸 때는 무엇이 공개되는지 반드시 확인하세요.

> — 출처: [Creating and managing Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)

### 6.15 응답 스트리밍 🆕

교재는 응답 스트리밍을 다루지 않습니다.

| 항목 | 내용 |
|---|---|
| 경로 | Lambda 함수 URL, `InvokeWithResponseStream` API(SDK·직접 API 호출), Amazon API Gateway 프록시 통합 |
| 페이로드 | 스트리밍 응답은 최대 **200MB**. 버퍼링 응답의 6MB 상한보다 큽니다 |
| 대역폭 | 첫 **6MB는 제한 없음**, 그 이후는 최대 **2MBps** |
| 이점 | **TTFB(첫 바이트까지의 시간)** 개선. 함수가 전체 응답을 메모리에 담지 않아도 되므로 매우 큰 응답에서는 구성 메모리를 줄일 수 있습니다 |
| 지원 런타임 | 관리형 런타임 중에는 **Node.js만** 지원합니다. Python 등 다른 언어는 사용자 지정 런타임의 Runtime API 통합 또는 Lambda Web Adapter를 씁니다 |
| 주의 | 스트리밍 응답은 요금이 발생하고 **호출 클라이언트 연결이 끊겨도 중단되지 않습니다.** 전체 함수 기간에 대해 과금되므로 긴 시간 제한을 설정할 때 주의합니다 |
| 콘솔 테스트 | 콘솔에서 테스트하면 응답이 **항상 버퍼링된 형태**로 보입니다 |
| VPC | VPC 환경에서는 함수 URL이 응답 스트리밍을 지원하지 않고, `InvokeWithResponseStream` API와 Lambda 인터페이스 VPC 엔드포인트를 써야 합니다 |

> — 출처: [Response streaming for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)

### 6.16 Lambda API 사용

교재 슬라이드 33의 네 API입니다. **네 API의 이름과 동작은 현재도 유효합니다.**

| API | 슬라이드 서술 |
|---|---|
| `CreateFunction` | 배포 패키지를 통해 Lambda 함수를 생성합니다. 패키지 유형은 **ZIP 또는 컨테이너 이미지**일 수 있습니다 |
| `UpdateFunctionCode` | Lambda 함수의 코드를 업데이트합니다. **버전을 생성한 후 이미 배포한 코드는 수정할 수 없습니다** |
| `UpdateFunctionConfiguration` | Lambda 함수의 **버전별 설정**을 수정합니다 |
| `Invoke` | Lambda 함수를 동기식 또는 비동기식으로 호출합니다 |

🆕 `CreateFunction`의 현재 세부 사항:

| 항목 | 내용 |
|---|---|
| 필수 파라미터 | `Code`, `FunctionName`, `Role` |
| 컨테이너 이미지 | `PackageType`을 `Image`로 설정하고 `Code`에 Amazon ECR 이미지 URI를 지정합니다. **`Handler`·`Runtime`은 지정할 필요가 없습니다** |
| .zip 아카이브 | `PackageType`을 `Zip`으로 설정하고 `Code`에 .zip 위치를 지정하며 **`Handler`와 `Runtime`을 반드시 지정**합니다 |
| 아키텍처 | 배포 패키지 코드가 대상 아키텍처와 호환되어야 하고 `Architectures` 미지정 시 기본값은 `x86_64` |
| 함수 상태 | 함수를 만들면 Lambda가 인스턴스와 지원 리소스를 프로비저닝합니다. VPC에 연결하면 1분 정도 걸릴 수 있고 그 동안 호출·수정할 수 없습니다. `GetFunctionConfiguration` 응답의 `State`·`StateReason`·`StateReasonCode`로 준비 여부를 확인합니다 |
| 그 밖의 파라미터 | `Environment`, `EphemeralStorage`, `Layers`, `MemorySize`, `Timeout`, `SnapStart`, `TracingConfig`, `VpcConfig`, `LoggingConfig`, `CodeSigningConfigArn`, `DurableConfig`, `CapacityProviderConfig`, `TenancyConfig` 등 |
| 코드 서명 | .zip 배포 패키지에는 코드 서명을 쓸 수 있습니다. 코드 서명 구성 ARN을 지정하면 `UpdateFunctionCode` 시 Lambda가 신뢰된 게시자의 유효한 서명을 확인합니다 |

> — 출처: [CreateFunction (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html)

### 6.17 Lambda 함수 생성(AWS CLI) 🔄

교재 슬라이드 34의 명령입니다. **두 가지 문제가 있습니다.**

```bash
# 교재 슬라이드 34 (문제가 있는 형태)
aws lambda create-function --function-name dictate-function --handler app.lambda_handler \
  --runtime python3.8 -–role arn:aws:iam::563926481938:role/lambdaPollyRole \
  --environment Variables={TABLE_NAME=$notesTable} --zip-file fileb://dictate-function.zip
```

| 문제 | 내용 |
|---|---|
| 🔄 `-–role` | 하이픈 두 개가 아니라 **하이픈 하나 + en dash(`–`)** 로 조판되어 있어 그대로 붙여 쓰면 셸이 인식하지 못합니다. 같은 슬라이드의 다른 플래그는 모두 하이픈 두 개입니다. 교재 자체의 조판 오류입니다 |
| 🔄 `python3.8` | **2024년 10월 14일 지원 종료.** 함수 생성 차단은 2027년 2월 1일, 함수 업데이트 차단은 2027년 3월 3일입니다 |

교정한 형태입니다.

```bash
# 교정: --role 을 하이픈 두 개로, 런타임을 현재 지원 버전으로
aws lambda create-function --function-name dictate-function \
  --handler app.lambda_handler \
  --runtime python3.13 \
  --role arn:aws:iam::563926481938:role/lambdaPollyRole \
  --environment Variables={TABLE_NAME=$notesTable} \
  --zip-file fileb://dictate-function.zip
```

**CLI로 .zip 함수를 만들 때 반드시 지정해야 하는 것**(현재 문서):

| 파라미터 | 내용 |
|---|---|
| `--function-name` | 함수 이름 |
| `--runtime` | 함수 런타임 |
| `--role` | 실행 역할 ARN |
| `--handler` | 함수 코드의 핸들러 메서드 이름 |
| .zip 위치 | 로컬은 `--zip-file fileb://myFunction.zip`, S3는 `--code S3Bucket=...,S3Key=...,S3ObjectVersion=...` |

AWS CLI에서 `fileb://` 문자열은 파일 데이터가 **바이너리 객체**임을 나타냅니다. 이 서술은 교재와 현재 문서가 같습니다.

🆕 **.zip 파일이 50MB 미만이면 로컬에서 업로드할 수 있고 더 크면 Amazon S3 버킷에서 업로드해야 합니다.** CLI로 S3에서 업로드하는 경우 버킷이 함수와 **같은 리전**에 있어야 합니다. 참고로 현재 공식 예제의 런타임은 `python3.14`입니다.

교재 슬라이드 34의 응답에서 `"MemorySize": 128`은 현재도 기본 메모리 값입니다. 문서는 128MB가 **가능한 최솟값이자 기본값**이며 이벤트를 변환·라우팅하는 단순한 함수에만 쓰도록 권장합니다([7.2절](#72-테스트-목표와-메모리cpu-관계)).

> — 출처: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 6.18 함수 구성 업데이트(AWS CLI)

교재 슬라이드 35의 명령입니다.

```bash
aws lambda update-function-configuration --function-name dictate-function \
  --environment Variables="{MP3_BUCKET_NAME=$apiBucket,Notes_Table=$notesTable}"
```

`update-function-configuration`으로 메모리, 시간 제한, 환경 변수 등 함수의 구성 세부 정보를 변경할 수 있습니다. 현재 문서가 이 명령으로 안내하는 항목은 최소한 다음과 같습니다.

| 대상 | 옵션 |
|---|---|
| 메모리 | `--memory-size 1024` |
| 임시 스토리지 | `--ephemeral-storage '{"Size": 1024}'` |
| 환경 변수 | `--environment "Variables={...}"` |
| 암호화 키 | `--kms-key-arn arn:aws:kms:...` |
| DLQ | `--dead-letter-config TargetArn=arn:aws:sns:...` |

**환경 변수는 구조 전체가 대체된다는 점을 다시 확인하세요**([6.12절](#612-환경-변수)).

### 6.19 버전 및 별칭 🔄

교재 슬라이드 36의 다이어그램: 버전 1 / 버전 2 / 버전 `$Latest`, 별칭 ARN 두 개(`...:dictate-function:Prod`, `...:dictate-function:Test`). API Gateway 쪽에는 `stageVariables.useAlias = Test`와 `...:dictate-function:${stageVariable.useAlias}`가 있고, 런타임 시 단계 변수 `${}`를 대체합니다.

교재 강사 노트의 서술은 현재 문서와 일치합니다.

- 새 버전을 게시하면 버전 번호가 증가하고 이전 버전이 저장됩니다. 각 버전마다 고유한 ARN이 있습니다.
- 별칭은 특정 함수 버전을 가리키는 포인터와 같고, 다른 버전을 가리키도록 업데이트할 수 있습니다.
- 별칭을 쓰면 특정 버전을 애플리케이션에 하드 코딩하지 않아도 됩니다.

```bash
# 새 버전 게시
aws lambda publish-version --function-name my-function

# 특정 버전을 가리키는 별칭 생성
aws lambda create-alias --function-name my-function --name alias-name \
  --function-version version-number --description " "
```

🔄 표기 차이: 교재는 `$Latest`로 적지만 문서 표기는 **`$LATEST`** 입니다.

🆕 버전 불변성의 정확한 범위입니다.

| 구분 | 내용 |
|---|---|
| 불변 | 게시한 버전의 **코드, 런타임, 아키텍처, 메모리, 레이어와 그 밖의 대부분 구성 설정** |
| 게시된 버전에도 구성 가능 | **트리거, 대상(destinations), 프로비저닝된 동시성, 비동기 호출 설정, 데이터베이스 연결·프록시** |
| 버전 번호 | Lambda가 **단조 증가**하는 시퀀스 번호를 부여하고 함수를 삭제하고 다시 만들어도 **번호를 재사용하지 않습니다** |
| 게시 조건 | 코드가 한 번도 게시되지 않았거나 마지막 게시 버전에서 **바뀐 경우에만** 새 버전이 게시됩니다. 바뀌지 않으면 마지막 버전에 머무릅니다 |
| ARN | **정규화 ARN**(버전 접미사 포함)과 **비정규화 ARN**(접미사 없음). 비정규화 ARN으로는 **별칭을 만들 수 없고**, 비정규화 ARN으로 호출하면 Lambda가 암시적으로 `$LATEST`를 호출합니다 |
| 버전 게시를 유발하는 변경 | 함수 코드, 환경 변수, 런타임, 핸들러, 레이어, 메모리 크기, 시간 제한, VPC 구성, DLQ 구성, IAM 역할, 설명, 아키텍처, 임시 스토리지 크기, 패키지 유형, 코드 스토리지 모드, 로깅 구성, 파일 시스템 구성, SnapStart, 트레이싱 구성. **예약된 동시성처럼 운영 설정은 새 버전 게시를 유발하지 않습니다** |

> — 출처: [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

### 6.20 가중치 별칭과 카나리 배포 🆕

교재는 별칭으로 특정 버전을 가리키는 것까지만 다룹니다. **현재는 하나의 별칭이 두 버전 사이로 트래픽을 나눌 수 있습니다.**

| 항목 | 내용 |
|---|---|
| 용도 | 새 버전을 트래픽의 일부에만 노출하고 필요하면 빠르게 롤백하는 **카나리 배포**. 블루/그린과 달리 트래픽을 한 번에 전환하지 않습니다 |
| 제약 | 별칭은 **최대 두 개**의 함수 버전을 가리킬 수 있습니다. 두 버전은 **실행 역할이 같아야** 하고, **DLQ 구성이 같거나 없어야** 하며, **둘 다 게시된 버전**이어야 합니다(`$LATEST` 불가) |
| 가중치 지정 | 콘솔에서 추가 버전에 가중치(%)를 주면 첫 버전이 나머지를 받습니다(추가 버전 10%면 첫 버전 90%) |
| 분배 방식 | Lambda가 **단순 확률 모델**로 분배하므로 트래픽이 적으면 구성한 비율과 실제 비율의 차이가 클 수 있습니다. 프로비저닝된 동시성을 쓰는 함수는 별칭 라우팅이 활성인 동안 인스턴스 수를 늘려 스필오버 호출을 피할 수 있습니다 |
| 호출된 버전 확인 | CloudWatch Logs의 `START` 로그 항목(`Version: 2`)과 동기 호출 응답의 **`x-amz-executed-version`** 헤더. 별칭 호출은 `ExecutedVersion` 차원으로 지표를 필터링합니다 |

```bash
# 버전 1 을 가리키는 별칭을 만들고 버전 2 에 3% 트래픽 배분
aws lambda create-alias \
  --name routing-alias \
  --function-name my-function \
  --function-version 1 \
  --routing-config AdditionalVersionWeights={"2"=0.03}

# 버전 2 트래픽을 5% 로 올림
aws lambda update-alias \
  --name routing-alias \
  --function-name my-function \
  --routing-config AdditionalVersionWeights={"2"=0.05}

# 전량 전환. 라우팅 구성도 초기화된다
aws lambda update-alias \
  --name routing-alias \
  --function-name my-function \
  --function-version 2 \
  --routing-config AdditionalVersionWeights={}
```

🆕 AWS CodeDeploy와 AWS SAM으로 **롤링 배포**를 자동화할 수 있습니다. AWS SAM이 별칭을 만들고(`AutoPublishAlias`), 새 코드를 감지해 버전을 게시하고, CodeDeploy가 `DeploymentPreference`(예: `Linear10PercentEvery2Minutes` — 2분마다 10%씩 이동)에 따라 트래픽을 옮기고 필요하면 롤백합니다.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  myDateTimeFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: myDateTimeFunction.handler
      Runtime: nodejs24.x
      # live 별칭을 만들고 코드 변경 시 자동으로 새 버전을 게시한다
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery2Minutes
```

> — 출처: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

---

## 7. 테스트

### 7.1 테스트 및 디버그

교재 슬라이드 40의 도형: 배포 패키지(함수 코드) + 레이어 1, 레이어 2 → 애플리케이션 테스트 및 디버그. 배포 패키지를 업로드하고 공유할 종속성을 분리해 레이어로 업로드하면 함수 코드를 보다 효과적으로 테스트할 수 있습니다.

### 7.2 테스트 목표와 메모리·CPU 관계

교재 슬라이드 41의 세 목표입니다.

- Lambda 함수의 메모리에 대한 **성능 테스트**
- Lambda 함수의 시간 초과에 대한 **로드 테스트**
- Lambda **한도**를 이해

교재 강사 노트의 "메모리 크기가 증가하면 이에 상응하여 함수에 사용할 수 있는 CPU 용량이 늘어납니다"는 **현재 문서와 일치합니다.**

| 항목 | 내용 |
|---|---|
| 비례 관계 | Lambda는 구성한 메모리에 **비례해 CPU 파워를 할당**합니다 |
| 기준값 🆕 | **1,769MB에서 함수가 1 vCPU에 상당**합니다(초당 1 vCPU-초 크레딧) |
| 범위 | 128MB~10,240MB를 **1MB 단위**로 구성 |
| 기본값 | **128MB.** 가능한 최솟값이며 이벤트를 변환·라우팅하는 단순한 함수에만 권장합니다 |
| 언제 늘리나 | 임포트한 라이브러리, Lambda 레이어, Amazon S3, Amazon EFS를 쓰는 함수는 메모리를 늘리면 성능이 개선될 수 있습니다. CPU·네트워크·메모리 병목이 있으면 성능이 크게 좋아집니다 |
| 찾는 방법 🆕 | CloudWatch로 모니터링하고 메모리 소비가 구성 최댓값에 가까워질 때 경보를 설정합니다. CPU·IO 바운드 함수는 기간(duration)도 함께 봅니다. 오픈 소스 **AWS Lambda Power Tuning**(Step Functions로 여러 메모리 값에서 동시 실행해 성능 측정)이나 **AWS Compute Optimizer**의 메모리 권장 사항(x86_64 함수만 지원)을 쓸 수 있습니다 |

함수의 메모리 사용은 각 호출별로 결정되며 CloudWatch Logs에서 볼 수 있습니다. 함수가 얼마나 오래 실행되는지 분석해 최적의 시간 초과 값을 결정하며, 이는 Lambda의 크기 조정을 따라가지 못하는 리소스에 네트워크 호출을 할 때 특히 중요합니다.

교재가 인용한 `limits.html` 경로는 현재 `gettingstarted-limits.html`로 리디렉션됩니다.

> — 출처: [Configure Lambda function memory](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html)

### 7.3 Lambda 함수 테스트 방법 🔄

교재 슬라이드 42의 네 방법입니다.

| 방법 | 교재 서술 |
|---|---|
| AWS Management Console | 이벤트 템플릿 / 사용자 지정 페이로드 / CloudWatch Logs 사용(로그 그룹 또는 로그 스트림) |
| AWS CLI | 함수 또는 특정 함수 버전을 호출 / CloudWatch Logs를 통해 모니터링 |
| AWS SDK | AWS Toolkit 및 IDE. **함수를 로컬로 또는 원격에서 실행합니다. 로컬로 실행하려면 런타임 환경을 구성해야 합니다** |
| AWS SAM | AWS SAM을 AWS Toolkit 및 디버거와 함께 사용하여 로컬로 테스트하고 디버그 / 여러 환경에서 일관되게 리소스를 프로비저닝 |

#### 콘솔 테스트 이벤트 🆕

콘솔에서 테스트를 실행하면 Lambda가 테스트 이벤트로 함수를 **동기식으로** 호출합니다. 입력이 필요 없으면 빈 문서 `{}`를 씁니다. 교재가 다루지 않는 두 종류가 있습니다.

| 종류 | 내용 |
|---|---|
| 비공개(private) | **생성자만** 쓸 수 있고 추가 권한이 필요 없습니다. 함수당 **최대 10개** 저장 |
| 공유 가능(shareable) 🆕 | **같은 AWS 계정의 다른 사용자와 공유**할 수 있고 서로의 이벤트를 편집·사용할 수 있습니다. `lambda-testevent-schemas`라는 Amazon EventBridge 스키마 레지스트리에 스키마로 저장되며, 보고 공유하고 편집하려면 EventBridge 스키마 레지스트리 API 작업 권한이 **모두** 필요합니다 |

저장하지 않고 **Test**를 누르면 세션 동안만 유지되는 미저장 테스트 이벤트가 만들어집니다. Node.js·Python·Ruby 런타임에서는 **Code** 탭의 **TEST EVENTS** 섹션에서도 테스트를 만들고 실행할 수 있습니다. AWS SAM의 `sam remote test-event`로 공유 가능 테스트 이벤트를 호출할 수 있습니다.

🆕 공유 가능 테스트 이벤트를 저장하면 그 이벤트를 **덮어씁니다.** 함수를 삭제해도 연결된 공유 가능 테스트 이벤트 스키마는 자동으로 삭제되지 않으므로 EventBridge 콘솔에서 직접 정리해야 합니다.

> — 출처: [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)

#### AWS SAM 로컬 테스트 🆕

교재는 "AWS SAM을 AWS Toolkit 및 디버거와 함께 사용하여 로컬로 테스트하고 디버그"라고만 서술합니다. `sam local`의 하위 명령은 네 개입니다.

| 하위 명령 | 용도 |
|---|---|
| `sam local generate-event` | 로컬 테스트용 AWS 서비스 이벤트 생성 |
| `sam local invoke` | Lambda 함수를 로컬에서 **한 번** 호출 |
| `sam local start-api` | 로컬 HTTP 서버로 Lambda 함수 실행 |
| `sam local start-lambda` | AWS CLI·SDK와 함께 쓸 로컬 HTTP 서버로 Lambda 함수 실행 |

`sam local`을 쓰기 전에 AWS SAM 사전 요건과 AWS SAM CLI 설치가 필요하고, `sam init`·`sam build`·`sam deploy`의 기본 이해를 권장합니다.

> — 출처: [Introduction to testing with the sam local command](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local.html)

### 7.4 Lambda 함수 호출(CLI) 🔄

교재 슬라이드 43의 CLI 구문입니다.

```text
invoke
--function-name <value>
[--invocation-type <value>]
[--log-type <value>]
[--client-context <value>]
[--payload <value>]
[--qualifier <value>]
<outfile>
```

교재의 파라미터 설명은 **현재 문서와 일치합니다.** 세부 값을 보강합니다.

| 파라미터 | 내용 |
|---|---|
| `--function-name` | 함수 이름(`my-function`), 별칭 포함(`my-function:v1`), 함수 ARN, 부분 ARN(`123456789012:function:my-function`). 이름만 주면 64자 제한 |
| `--invocation-type` | `RequestResponse`(**기본값**, 동기) / `Event`(비동기) / `DryRun`(함수를 실행하지 않고 파라미터 값 검증과 호출 권한 확인) |
| `--log-type` | `None` 또는 `Tail`. `Tail`이면 응답에 실행 로그를 포함하고 **동기식으로 호출한 함수에만 적용**됩니다. 응답 헤더 `X-Amz-Log-Result`에 **실행 로그의 마지막 4KB가 base64 인코딩**되어 담깁니다 |
| `--client-context` | 호출 클라이언트 정보. 최대 **3,583바이트의 base64 인코딩 데이터**이고 Lambda는 **동기 호출에만** 이 객체를 함수에 전달합니다 🆕 |
| `--payload` | 함수에 대한 JSON 입력. `'{ "key": "value" }'`처럼 직접 넣거나 `file://payload.json`처럼 파일 경로를 줍니다. **동기 최대 6MB, 비동기 최대 1MB** 🔄 |
| `--qualifier` | 버전 번호 또는 별칭. 최신 버전을 호출하려면 `$LATEST`로 정규화하거나 비정규화 상태로 둡니다 |
| `<outfile>` | 출력 내용을 저장할 파일 이름 |

응답 상태 코드 🆕: `RequestResponse` **200**, `Event` **202**, `DryRun` **204**.

응답 헤더:

| 헤더 | 내용 |
|---|---|
| `X-Amz-Function-Error` | 있으면 **함수 실행 중 오류가 발생**했다는 뜻이고 세부 정보는 응답 페이로드에 담깁니다 |
| `X-Amz-Log-Result` | 실행 로그의 마지막 4KB(base64) |
| `X-Amz-Executed-Version` | 실행된 함수 버전. 별칭으로 호출하면 별칭이 해석된 버전을 알려 줍니다 |

이 작업에는 **`lambda:InvokeFunction`** 권한이 필요합니다.

> — 출처: [Invoke (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html)

### 7.5 예제: 함수 호출 🔄

교재 슬라이드 44의 명령과 출력입니다.

```bash
# 교재 슬라이드 44 (AWS CLI v2 에서는 옵션이 하나 더 필요하다)
aws lambda invoke --function-name dictate-function \
  --payload '{"UserId": "newbie","NoteId": "2","VoiceId": "Joey"}' response.txt
```

```json
{
  "ExecutedVersion": "$LATEST",
  "StatusCode": 200
}
```

응답은 파일에 캡처되고 `response.txt`에 MP3 파일의 위치가 저장됩니다.

🔄 **AWS CLI 버전 2에서는 `--cli-binary-format raw-in-base64-out`이 필요합니다.**

```bash
# 교정: CLI v2 용 바이너리 형식 옵션 추가
aws lambda invoke --function-name dictate-function \
  --cli-binary-format raw-in-base64-out \
  --payload '{"UserId": "newbie","NoteId": "2","VoiceId": "Joey"}' response.txt
```

`aws configure set cli-binary-format raw-in-base64-out`으로 기본값으로 만들 수 있습니다.

> — 출처: [Invoking a Lambda function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html)

### 7.6 오류 처리 🔄

교재 슬라이드 45의 2단 구성입니다. **두 범주 구분과 헤더 이름은 현재 문서와 일치합니다.**

| 구분 | 교재 본문 |
|---|---|
| 호출 오류 | 응답 오류 코드: **400 또는 500 시리즈**. 일반적인 오류 유형 — 요청(너무 크거나 유효하지 않음) / 호출 측(권한이 없음) / 계정(최대 함수 인스턴스에 도달함, 요청이 너무 많음 — 동시 실행 한도 1,000개) |
| 함수 오류 | 응답 헤더: **`X-Amz-Function-Error`**. 함수 오류(오류 처리 전략을 결정) / 런타임 오류(시간 초과, 구문 오류) |

🆕 교재가 명시하지 않는 중요한 사실: **함수 코드나 런타임이 오류를 반환하면 Lambda 응답의 상태 코드는 200 OK입니다.** 오류가 있다는 사실은 `X-Amz-Function-Error` 헤더로만 표시됩니다. 400·500 계열 상태 코드는 **호출 오류에 예약**되어 있습니다. 즉 상태 코드 200만 보고 성공했다고 판단하면 함수 오류를 놓칩니다.

어디서 오류를 찾는가:

| 호출 방식 | 오류 확인 위치 |
|---|---|
| 직접 호출 | Lambda 응답 |
| 비동기·ESM·다른 서비스 경유 | **로그, 데드 레터 대기열, 온-실패 대상** |

🔄 동시 실행 한도 1,000개는 현재도 **기본 할당량**으로 유효하지만 두 가지가 달라졌습니다.

- **증액 요청**으로 수만 단위까지 올릴 수 있습니다.
- **신규 AWS 계정은 동시성·메모리 할당량이 축소된 상태로 시작**해 사용량에 따라 자동으로 상향됩니다.

교재 강사 노트의 "시스템이 재시도에 의존하는 경우 코드가 **멱등적**이어야 한다"는 권장은 현재도 유효하며, ESM 문서는 "각 이벤트를 최소 한 번 처리하며 중복 처리가 발생할 수 있으므로 함수 코드를 멱등적으로 만들 것을 **강력히 권장**한다"고 기술합니다.

🆕 자주 보는 호출 오류 두 가지:

| 오류 | 원인과 대응 |
|---|---|
| `Sandbox.Timedout` (Init 단계 시간 초과) | `Init` 단계가 시간 초과되면 다음 호출 요청 때 `Init`을 다시 실행합니다(suppressed init). 시간 제한이 3초처럼 짧으면 `Init`이 다시 시간 초과되거나 `Invoke` 시간이 부족해집니다. 시간 제한 연장, 메모리 증가(CPU도 비례 증가), 초기화 코드 최적화로 대응합니다 |
| `lambda:InvokeFunction not authorized` | 호출 주체에게 `lambda:InvokeFunction` 권한이 없습니다([5.2절](#52-같은-계정이면-권한이-필요-없다는-서술)) |

> — 출처: [Troubleshoot execution issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/python-exceptions.html)

---

## 8. 배포

### 8.1 패키징 고려 사항

교재 슬라이드 47의 세 원칙입니다.

- 함수의 배포 패키지에 있는 종속성을 제어합니다.
- 배포 패키지 크기를 런타임 필요에 맞춰 최소화합니다.
- 종속성의 복잡성을 최소화합니다.

Lambda는 **컨테이너 이미지**와 **.zip 파일 아카이브** 두 가지 유형의 배포 패키지를 지원합니다.

교재 강사 노트의 세부 권장:

| 원칙 | 내용 |
|---|---|
| 종속성 제어 | Lambda 런타임 환경에는 Node.js·Python 런타임용 AWS SDK 같은 라이브러리가 다수 포함되어 있습니다. Lambda가 이 라이브러리를 **주기적으로 업데이트**하며 이 업데이트가 함수 동작에 **미묘한 변화**를 줄 수 있으므로, 종속성을 완전히 제어하려면 모든 종속성을 배포 패키지에 패키지합니다 |
| 크기 최소화 | 크기를 줄이면 호출 전 다운로드·압축 해제 시간이 단축됩니다. Java·.NET 함수는 전체 AWS SDK 라이브러리를 올리지 말고 필요한 모듈(DynamoDB, Amazon S3 SDK 모듈, Lambda 코어 라이브러리)에 선택적으로 의존합니다 |
| 복잡성 최소화 | 실행 컨텍스트 시작 시 빠르게 로드되는 단순한 프레임워크를 목표로 합니다. Spring Framework보다 Dagger나 Guice 같은 단순한 Java 종속성 주입(IoC) 프레임워크를 사용합니다 |

**종속성 제어 원칙은 현재 문서의 권장과 같은 방향입니다**([3.6절](#36-런타임에-포함된-aws-sdk)). 다만 현재 문서는 이것을 예외가 아니라 기본 권장으로 제시하고, 배포 패키지 대신 **Lambda 레이어**를 쓰는 선택지도 함께 제시합니다.

### 8.2 .zip 파일 아카이브 배포

교재 슬라이드 48의 표입니다.

| 언어별 .zip 배포 | Node.js, Python, Ruby | Java | .NET Core |
|---|---|---|---|
| 대상 | 코드 및 종속성으로 구성된 ZIP 아카이브 | 모든 코드 및 종속성이 포함된 ZIP 파일 또는 독립 실행형 `.jar` | 모든 코드 또는 종속성이 포함된 ZIP 파일 또는 독립 실행형 `.dll` |
| 방법 | npm, pip 또는 기타 빌드/패키징 도구를 사용해 라이브러리 설치 | Maven, Eclipse IDE 플러그인 또는 기타 빌드/패키징 도구 사용 | Nuget, Visual Studio 플러그인 또는 기타 빌드/패키징 도구 사용 |
| 위치 | 모든 종속성은 **루트 수준**에 있어야 함 | 루트 수준에서 컴파일된 클래스 및 리소스 파일, **`/lib` 디렉터리**의 필수 jar | **루트 수준의 모든 어셈블리**(`.dll`) |

🔄 열 이름의 **".NET Core"** 는 현재 런타임 이름이 아닙니다([3.4절](#34-지원-런타임)). 지금은 `.NET 8`·`.NET 10`입니다.

교재 강사 노트의 언어별 유의점:

- **Node.js·Ruby·Python** — 코드와 종속성으로 구성된 .zip 아카이브를 만들고 적절한 보안 권한을 설정합니다. **디렉터리 자체가 아닌 디렉터리에 포함된 콘텐츠를 압축합니다.** Zip 파일의 내용은 Lambda 함수의 현재 작업 디렉터리로 사용할 수 있습니다.
- **Java** — 배포 패키지가 .zip 파일인지 독립 실행형 jar인지 결정합니다.
- **C#** — 배포 패키지는 컴파일된 어셈블리와 모든 어셈블리 종속성을 수록한 .zip 파일입니다. `proj.deps.json`(런타임에 종속성 신호 제공)과 `proj.runtimeconfig.json`(런타임 구성)도 포함됩니다. Lambda 프로젝트가 보통 클래스 라이브러리로 구성되기 때문에 `proj.runtimeconfig.json`은 기본값으로 포함되지 않으므로 publish 명령에 다음을 추가합니다.

```text
/p:GenerateRuntimeConfigurationFiles=true
```

🆕 크기에 따른 업로드 경로: **.zip 파일이 50MB 미만이면 로컬 빌드 머신에서 업로드**할 수 있고, 더 크면 **Amazon S3 버킷에서 업로드**해야 합니다. CLI로 S3에서 업로드하는 경우 버킷이 함수와 같은 리전에 있어야 합니다. CloudFormation의 인라인 코드(`Code.ZipFile`)로 만드는 .zip은 **4MB를 초과할 수 없고** 외부 종속성을 넣을 수 없어 런타임 내장 SDK를 써야 합니다.

> — 출처: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 8.3 컨테이너를 사용하여 배포

교재 슬라이드 49의 4단계: 프로젝트 및 코드 생성 → AWS의 기본 이미지를 사용하여 컨테이너 빌드(Lambda 런타임 인터페이스 클라이언트) → **컨테이너를 Amazon ECR로 업로드(10GB)** → 컨테이너 이미지를 사용하여 Lambda 함수 생성.

**교재 강사 노트의 핵심 사실은 모두 현재 문서와 일치합니다.**

| 항목 | 내용 |
|---|---|
| 매니페스트 형식 | **Docker image manifest V2 schema 2**(도커 1.10 이상), **OCI 사양 v1.0.0 이상** |
| 크기 | 모든 레이어를 포함한 **최대 비압축 이미지 크기 10GB** |
| 런타임 API | Lambda를 쓰려면 이미지가 **Lambda 런타임 API**를 구현해야 하고, AWS가 지원되는 모든 런타임에 대해 **런타임 인터페이스 클라이언트**를 제공합니다. 오픈 소스 라이선스로 커뮤니티와 공유되고 기본 패키지 관리자로 이용할 수 있습니다 |
| 레이어 | **컨테이너 이미지는 레이어를 사용하지 않습니다.** 필요한 런타임·라이브러리·종속성을 이미지에 패키지합니다 |

🆕 교재가 다루지 않는 사항:

| 항목 | 내용 |
|---|---|
| 기본 이미지 세 갈래 | **AWS 기본 이미지**(언어 런타임 + 런타임 인터페이스 클라이언트 + 로컬 테스트용 **런타임 인터페이스 에뮬레이터**가 미리 로드), **AWS OS 전용 기본 이미지**(Amazon Linux 배포 + 에뮬레이터. Go·Rust 같은 컴파일 언어나 Lambda가 기본 이미지를 제공하지 않는 버전에 사용), **AWS가 아닌 기본 이미지**(Alpine·Debian 등. 언어별 런타임 인터페이스 클라이언트를 포함해야 함) |
| 배포 패키지 유형 변경 | **기존 함수의 패키지 유형(.zip ↔ 컨테이너 이미지)은 변경할 수 없습니다.** 새 함수를 만들어야 합니다 |
| 파일 시스템 | 이미지는 **읽기 전용 파일 시스템**에서 실행할 수 있어야 하고 함수 코드는 512MB~10,240MB의 쓰기 가능한 `/tmp`에 액세스할 수 있습니다 |
| 기본 사용자 | Lambda가 최소 권한 기본 Linux 사용자를 정의하므로 Dockerfile에 `USER`를 지정할 필요가 없습니다. 이 사용자가 함수 실행에 필요한 모든 파일을 읽을 수 있어야 합니다 |
| 아키텍처 | Lambda는 다중 아키텍처 기본 이미지를 제공하지만, **함수용으로 빌드한 이미지는 한 아키텍처만 대상으로 해야** 하고 다중 아키텍처 이미지를 쓰는 함수는 지원하지 않습니다 |
| 운영 체제 | Linux 기반 이미지만 지원 |
| AL2023 전환 | Node.js 20, Python 3.12, Java 21, .NET 8, Ruby 3.3 이후 기본 이미지는 **Amazon Linux 2023 최소 컨테이너 이미지** 기반이고 그 이전은 Amazon Linux 2 기반입니다. AL2023 이미지는 `yum` 대신 `microdnf`(`dnf`로 심볼릭 링크)를 씁니다. AL2023 이미지를 AWS SAM 포함 로컬에서 실행하려면 **Docker 20.10.10 이상**이 필요합니다 |
| ECR | 리포지토리는 Lambda 함수와 **같은 리전**에 있어야 합니다. 다른 계정의 이미지로도 함수를 만들 수 있지만 이미지가 같은 리전에 있어야 합니다. Lambda는 컨테이너 이미지에 **Amazon ECR FIPS 엔드포인트를 지원하지 않습니다** |
| 매니페스트 크기 | 최적 성능을 위해 이미지 매니페스트 크기를 25,400바이트 미만으로 유지하는 것이 좋습니다(할당량 표의 컨테이너 이미지 설정 크기는 16KB) |

> — 출처: [Create a Lambda function using a container image](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)

### 8.4 Lambda 함수 할당량 🔄

**교재 슬라이드 50 표의 헤더는 "할당량(2021년 9월 현재)"입니다.** 대조표입니다.

| 리소스 | 교재 (2021년 9월) | 현재 | 판정 |
|---|---|---|---|
| 메모리 할당 | 128~10,240MB | 128MB~10,240MB, **1MB 단위**. 1,769MB에서 1 vCPU | 일치 |
| 최대 런타임(시간 제한) | 15분 | 900초(15분) | 일치 |
| 버스트 동시성 | 함수당 10초당 최대 1,000회 동시 실행 | 함수·리전당 **10초당 실행 환경 1,000개**. 이름은 **동시성 조정 한도** | 🔄 이름 변경 |
| 호출 페이로드 | 동기식 6MB / **비동기식 256KB** | 동기식 요청·응답 각각 6MB / **비동기식 1MB** / 스트리밍 응답 200MB / 요청 라인+헤더 값 합계 1MB | 🔄 **비동기 한도 변경** |
| 배포 패키지 | Zip 50MB, 비압축 250MB, **콘솔 인라인 편집 3MB**, 컨테이너 이미지 10GB | Lambda API·SDK 업로드 50MB(압축), **콘솔 업로드 50MB**, 레이어·사용자 지정 런타임 포함 압축 해제 250MB, 컨테이너 이미지 10GB | 🔄 **콘솔 항목 변경** |
| `/tmp` 스토리지 | 10GB | **512MB~10,240MB(1MB 단위)** | 🔄 **범위로 변경** |
| 동시 실행 | (슬라이드 45) 1,000개 | 기본 할당량 1,000, **수만 단위까지 증액 가능**. 신규 계정은 축소된 값에서 시작 | 🔄 |

🆕 교재 표에 없는 현재 할당량입니다.

| 리소스 | 할당량 |
|---|---|
| 환경 변수 | 함수의 모든 환경 변수 합쳐 **4KB** |
| 리소스 기반 정책 | **20KB** |
| 레이어 | **5개** (교재 슬라이드 38과 일치) |
| 스트리밍 응답 대역폭 | 첫 6MB 무제한, 이후 **2MBps** |
| 실행 환경당 네트워크 대역폭 | **625Mbps**. VPC 미연결 함수는 증액 요청 가능(승인 후 2,048MB 메모리부터 비례 증가, 10,240MB에서 최대 3,000Mbps) |
| 컨테이너 이미지 설정 크기 | **16KB** |
| 콘솔 편집기 테스트 이벤트 | **10개** |
| 파일 설명자 | **1,024** |
| 실행 프로세스·스레드 | **1,024** |
| 업로드 함수(.zip)·레이어 스토리지 | Lambda 관리형 스토리지 **300GB**(압축 해제 기준). 증액 불가이며 그 이상은 **자체 관리형 S3 코드 스토리지** |
| VPC당 ENI | **500**(수천까지 증액 가능) |

🆕 API 요청 할당량:

| 리소스 | 할당량 |
|---|---|
| 함수·리전당 호출 요청(동기) | 실행 환경 인스턴스마다 **초당 최대 10건**. 총 호출 한도는 동시성 한도의 10배 |
| 함수·리전당 호출 요청(비동기) | 인스턴스당 제한 없음. 총 호출 한도는 사용 가능한 동시성에만 의존 |
| 프로비저닝된 동시성 함수의 버전·별칭 | 초당 요청이 **할당된 프로비저닝된 동시성의 10배** |
| `GetFunction` | 초당 100건(증액 불가) |
| `GetPolicy` | 초당 15건(증액 불가) |
| 그 밖의 제어 영역 API | **전체 API를 합쳐** 초당 15건(증액 불가) |

교재 강사 노트의 "함수의 동시성은 특정 시점에 요청을 처리하는 인스턴스의 수이고, 요청된 수의 함수를 실행하는 데 필요한 인스턴스 수가 갑자기 증가하는 것을 버스트라고 합니다"는 개념적으로 유효합니다.

🆕 문서가 상기시키는 실무 함정: **서비스 간 할당량 불일치.** API Gateway의 기본 스로틀 한도는 초당 10,000건인데 Lambda의 기본 동시성은 1,000이므로, API Gateway가 Lambda가 처리할 수 있는 것보다 많은 요청을 보낼 수 있습니다. 예상 트래픽에 맞춰 Lambda 동시성 증액을 요청해 해결합니다.

교재가 인용한 `gettingstarted-limits.html` 경로는 현재도 유효합니다.

> — 출처: [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

---

## 9. 데모와 실습 4

### 9.1 데모: AWS 콘솔에서 Lambda 함수 생성 (슬라이드 52)

데모 항목:

- Lambda 환경 개요
- 전역/범위 제약 조건 사용 — 환경 변수 및 파라미터
- 버전, 별칭 및 Lambda 계층 배포
- CloudWatch를 사용하여 모니터링

### 9.2 실습 4 개요: AWS Lambda를 사용한 솔루션 개발 (슬라이드 55–56)

다이어그램 레이블: 사용자 → Delete / Dictate / Search / List / Create·update → Notes 테이블, MP3 호스팅, Amazon Polly.

실습 목표(교재 강사 노트):

- AWS Lambda 함수를 생성하고 AWS SDK 및 AWS CLI를 사용하여 프로그래밍 방식으로 상호 작용
- AWS Lambda 함수를 구성하여 환경 변수를 사용하고 다른 서비스와 통합
- AWS SDK를 사용하여 Amazon S3의 미리 서명된 URL을 생성하고 버킷 객체에 대한 액세스를 확인
- .zip 파일 아카이브를 사용하여 Lambda 함수를 배포하고 필요에 따라 테스트
- AWS Management Console 및 AWS CLI에서 여러 호출 옵션을 사용하여 Lambda 함수를 호출

### 9.3 실습에서 걸릴 수 있는 지점 🆕

실습 코드·명령이 교재 그대로일 때 부딪힐 수 있는 지점을 모았습니다. 근거는 각 절에 있습니다.

| 지점 | 내용 | 참조 |
|---|---|---|
| `python3.8` 런타임 | 2024년 10월 14일 지원 종료. 새 함수 생성은 2027년 2월 1일부터 차단됩니다 | [3.4절](#34-지원-런타임) · [6.17절](#617-lambda-함수-생성aws-cli) |
| `-–role` 표기 | en dash가 섞여 있어 그대로 붙여 쓰면 셸이 인식하지 못합니다 | [6.17절](#617-lambda-함수-생성aws-cli) |
| `--payload` | AWS CLI v2에서는 `--cli-binary-format raw-in-base64-out`이 필요합니다 | [7.5절](#75-예제-함수-호출) |
| 환경 변수 덮어쓰기 | `update-function-configuration`은 `Variables` 구조 **전체를 대체**합니다 | [6.12절](#612-환경-변수) |
| `boto3.resource` | 새 기능이 추가되지 않는 인터페이스이지만 계속 동작하므로 실습에는 문제가 없습니다 | [6.10절](#610-예제-lambda-함수python-실습-코드) |
| 호출 권한 | 같은 계정이어도 `lambda:InvokeFunction` 권한이 필요합니다 | [5.2절](#52-같은-계정이면-권한이-필요-없다는-서술) |
| 프로비저닝된 동시성 | `$LATEST`에는 적용할 수 없습니다 | [4.7절](#47-동시성) |
| 시간 초과 | 기본 3초입니다. 초기화가 무거우면 `Init` 10초 제한과 겹쳐 시간 초과가 연속 발생할 수 있습니다 | [4.5절](#45-실행-환경-수명-주기) · [7.6절](#76-오류-처리) |

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 10. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

이 모듈은 이 과정에서 delta가 가장 큰 모듈입니다. 교재 슬라이드 50의 할당량 표가 **"2021년 9월 현재"** 로 명시되어 있고, 그 이후 런타임 목록이 크게 바뀌었으며 SnapStart·함수 URL·응답 스트리밍·재귀 루프 감지처럼 교재 이후 추가된 기능이 많습니다.

### 10.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| 같은 계정의 호출 권한 (슬라이드 20 노트) | "사용자 정의 애플리케이션과 이 애플리케이션이 호출하는 Lambda 함수가 같은 AWS 계정에 속한 경우 명시적인 권한을 부여할 필요가 없습니다" | 계정 관계와 무관하게 호출 주체에게 **`lambda:InvokeFunction` 권한이 필요**합니다. 사용자가 Lambda 리소스에 액세스하면 Lambda는 자격 증명 기반 정책과 리소스 기반 정책을 **모두** 평가하고, AWS 서비스가 호출하면 리소스 기반 정책만 평가합니다. 권한이 없으면 "is not authorized to perform: lambda:InvokeFunction" 오류가 발생하며, 이 요구 사항은 함수를 호출하는 Lambda 함수와 다른 컴퓨팅 리소스에도 적용됩니다 | [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html) |
| 컨텍스트 "남은 시간" 기본값 (슬라이드 27 노트) | Python `(기본값 = 3초)`, Java·.NET `(기본값 = 15분)` | 세 언어의 컨텍스트 문서는 모두 **"시간 초과 전에 남은 밀리초 수를 반환한다"** 고만 기술하고 기본값을 명시하지 않습니다. 이 값은 함수에 구성된 시간 제한을 기준으로 계산되므로 언어별 기본값이 따로 있는 것이 아닙니다. 함수 시간 제한 자체의 기본값이 3초, 최대가 900초이므로 Python은 기본값을, Java·.NET은 최대값을 잘못 옮긴 **교재 내부 불일치**입니다 | [Python 컨텍스트 객체](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html) |
| Python 컨텍스트 목록 (슬라이드 27 노트) | `function_name`~`log_stream_name` 7개 속성만 | 현재 문서는 Python 컨텍스트에도 **`identity`(모바일 앱)와 `client_context`(모바일 앱)** 가 있다고 기술합니다. `identity`는 `cognito_identity_id`·`cognito_identity_pool_id`를, `client_context`는 `client.installation_id`·`app_title`·`app_version_name`·`app_version_code`·`app_package_name`·`custom`·`env`를 포함합니다 | [Python 컨텍스트 객체](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html) |
| CLI 플래그 `-–role` (슬라이드 34) | 하이픈 하나 + en dash(`–`) | 셸이 인식하지 못합니다. 같은 슬라이드의 다른 플래그는 모두 하이픈 두 개입니다. 같은 코드 블록의 출력 JSON에도 `"State": "Active", -n:dictate-function",` 처럼 잘린 조각이 섞여 있습니다. 교재 자체의 조판 오류이므로 AWS 문서 근거 없이 표기만 교정했습니다 | — ([10.5절](#105-검증하지-못한-항목)) |
| 슬라이드 16·17 제목 중복 | 둘 다 "콜드 스타트 최소화하기 1/2" | 슬라이드 16은 예약 트리거와 프로비저닝된 동시성, 슬라이드 17은 Lambda SnapStart를 다루므로 슬라이드 17이 **"2/2"** 여야 합니다. 이 문서는 두 절을 1/2·2/2로 구분했습니다 | — ([10.5절](#105-검증하지-못한-항목)) |

### 10.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 지원 런타임 목록 (슬라이드 10 노트) | "Node.js, Java, Python, .NET Core, Go, Ruby" | 지원 런타임 표는 Node.js(22·24·26 프리뷰), Python(3.10~3.15 프리뷰), Java(8·11·17·21·25), **.NET(8·9·10)**, Ruby(3.3·3.4·4.0), OS 전용 런타임(`provided.al2023`)입니다. `.NET Core` 계열과 `go1.x`는 지원 종료되었고 Go·Rust는 OS 전용 런타임으로 실행합니다. Fargate·Lambda 결정 안내서는 네이티브 지원 언어에 **PowerShell**도 포함합니다 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| 비동기식 호출 페이로드 (슬라이드 50) | 256KB | **1MB.** 동기식 6MB는 교재와 같고, 스트리밍 응답 200MB와 요청 라인+헤더 값 합계 1MB가 추가되었습니다 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| `/tmp` 스토리지 (슬라이드 50) | 10GB (고정값처럼 제시) | **512MB~10,240MB를 1MB 단위로 구성**하는 설정입니다. 512MB까지 추가 비용이 없고 그 이상은 GB-초로 과금되며, SnapStart는 512MB 초과를 지원하지 않습니다 | [Configure ephemeral storage](https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html) |
| 배포 패키지 "콘솔 인라인 편집 3MB" (슬라이드 50) | 3MB | 현재 할당량 표에 이 항목이 **없습니다.** 표에는 Lambda API·SDK 업로드 50MB(압축), **콘솔 업로드 50MB**, 압축 해제 250MB가 있습니다. 코드 편집기 사용 조건은 **인터프리터 언어 런타임(Python·Node.js·Ruby) + 압축 해제 50MB 미만**이고, 컨테이너 이미지 함수는 콘솔에서 편집할 수 없습니다 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| "버스트 동시성" (슬라이드 50) | 항목 이름 | 수치(함수·리전당 10초당 실행 환경 1,000개)는 같고 **이름이 바뀌었습니다.** 현재는 **동시성 조정 속도(concurrency scaling rate)** 이고 할당량 표에서는 동시성 조정 한도입니다. 쓰지 않은 조정 속도는 누적되지 않습니다 | [Lambda scaling behavior](https://docs.aws.amazon.com/lambda/latest/dg/scaling-behavior.html) |
| 동시 실행 한도 1,000 (슬라이드 45) | 고정 한도처럼 서술 | **증액 가능한 기본 할당량**입니다(수만 단위까지). **신규 AWS 계정은 동시성·메모리 할당량이 축소된 상태로 시작**해 사용량에 따라 자동 상향됩니다 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| SnapStart 지원 런타임 (슬라이드 17) | "Java 11 및 Java 17 관리형 런타임" | **Java 11 이상, Python 3.12 이상, .NET 8 이상.** 그 밖의 관리형 런타임, OS 전용 런타임, 컨테이너 이미지는 지원하지 않습니다 | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| SnapStart "추가 비용 없이" (슬라이드 17 노트) | 조건 없이 무료 | **Java 관리형 런타임만** 추가 비용이 없습니다. 그 밖에는 버전별 스냅샷 캐싱 요금(**최소 3시간** 과금)과 복원 요금이 발생하며 함수 메모리에 따라 달라집니다 | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| SnapStart "최대 10배 향상" (슬라이드 17) | 배수 표현 | 현재 문서는 배수 대신 **"최대 1초 미만(as low as sub-second) 시작 성능"** 으로 기술합니다. 대규모 호출에서 가장 효과적이고 호출 빈도가 낮은 함수는 같은 개선을 보지 못할 수 있다고 명시합니다. 10배가 틀렸다고 단정할 근거는 찾지 못했고 **현재 문서에 그 표현이 없다는 것만** 확인했습니다 | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| 비동기 호출 레코드 대상 (슬라이드 12 노트) | AWS Lambda, SNS, SQS, EventBridge 네 개 | 이 네 개 **+ Amazon S3 버킷(실패 시에만)** 총 다섯 개. 대상별로 실행 역할에 `sqs:SendMessage`·`sns:Publish`·`s3:PutObject`+`s3:ListBucket`·`lambda:InvokeFunction`·`events:PutEvents` 권한이 필요합니다 | [Capturing records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html) |
| 비동기 재시도 구성 (슬라이드 12 노트) | "재시도 횟수 및 재시도 간격은 구성 가능합니다" | 구성 가능한 것은 **재시도 횟수(`MaximumRetryAttempts`, 0~2)와 이벤트 최대 수명(`MaximumEventAgeInSeconds`, 최대 6시간)** 이며 재시도 간격 자체를 지정하는 파라미터는 없습니다. 기본 재시도 간격은 첫 두 시도 사이 1분, 두 번째와 세 번째 사이 2분입니다 | [Configuring error handling settings](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-configuring.html) |
| 런타임 내장 SDK (슬라이드 24 노트) | "Python 및 Node.js용 런타임에는 SDK가 내장되어 있으므로 번들링할 필요가 없습니다" | 내장 사실은 맞고 **Ruby도 포함**하지만 결론이 반대입니다. 현재 문서는 종속성 제어와 자동 런타임 업데이트 중 하위 호환성을 위해 SDK 모듈을 **배포 패키지나 레이어에 항상 포함**하도록 권장하고, 내장 SDK는 콘솔 코드 편집기·CloudFormation 인라인 코드처럼 추가 패키지를 넣을 수 없을 때만 쓰라고 기술합니다 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| 코드 저장 위치 (슬라이드 14 노트) | "AWS Lambda는 Amazon S3에 코드를 저장하고 저장된 데이터를 암호화합니다" | 저장 중 암호화는 맞습니다. 저장 위치는 **Lambda 관리형 스토리지**(계정·리전당 300GB, 압축 해제 기준)가 기본이고 사용자 S3 버킷을 쓰는 **자체 관리형 S3 코드 스토리지**가 선택 옵션입니다. 자체 관리형을 쓰면 Lambda가 소스 코드 사본을 저장하지 않습니다 | [Data encryption at rest](https://docs.aws.amazon.com/lambda/latest/dg/security-encryption-at-rest.html) |
| 재귀 코드 대응 (슬라이드 25 노트) | "동시 런타임 한도를 즉시 0으로 설정" | Lambda가 **재귀 루프를 자동 감지해 중지**합니다(같은 요청 체인에서 약 16회, 기본 활성·무료). 단 감지 범위는 함수 자신·SQS·S3·SNS 사이의 루프와 Lambda 함수만으로 구성된 루프이고 **DynamoDB 등이 포함되면 감지하지 못하므로** 교재의 수동 조치도 여전히 유효합니다 | [Recursive loop detection](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html) |
| `invoke --payload` (슬라이드 44) | JSON 문자열을 그대로 전달 | AWS CLI **버전 2에서는 `--cli-binary-format raw-in-base64-out`** 이 필요합니다. `aws configure set cli-binary-format raw-in-base64-out`으로 기본값으로 만들 수 있습니다 | [Invoking a function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html) |
| 이벤트 소스 목록 (슬라이드 9) | Amazon Alexa, AWS CloudTrail, Amazon CloudWatch 포함 | 현재 "Lambda 함수를 호출할 수 있는 서비스" 표(28개)에 **Amazon Alexa와 AWS CloudTrail이 없습니다**(표에 없다는 것이 불가능하다는 뜻은 아니므로 단정하지 않습니다). "Amazon CloudWatch"는 **Amazon CloudWatch Logs**로 구체화되었습니다. 교재는 "이에 국한되지 않습니다"라는 단서를 붙였으므로 목록 자체가 틀린 것은 아닙니다 | [Invoking Lambda with events from other AWS services](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html) |
| `.NET Core` 열 이름 (슬라이드 48) | ".NET Core" | 현재 런타임 이름은 `.NET 8`·`.NET 9`(컨테이너 전용)·`.NET 10`입니다. `.NET Core` 계열 런타임은 모두 지원 종료되었습니다 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| `$Latest` 표기 (슬라이드 36) | `$Latest` | 문서 표기는 **`$LATEST`** 입니다 | [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html) |
| 옛 문서 경로 (슬라이드 20·21·41 노트) | `limits.html`, `intro-permission-model.html`, `dg/API_AddPermission.html`, `dg/API_CreateEventSourceMapping.html` | 모두 **리디렉션으로 살아 있습니다.** `limits.html`→`gettingstarted-limits.html`, `intro-permission-model.html`→`lambda-permissions.html`, `dg/API_*.html`→`api/API_*.html`. API 참조가 개발자 안내서에서 별도 문서로 분리되었으므로 새 경로를 직접 인용하는 것이 정확합니다 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| 호출 권한 부여 방법 (슬라이드 19·20) | `AddPermission` API만 | 현재 문서는 **전체 JSON 정책(`PutResourcePolicy`)을 권장 경로**로 제시하고 `AddPermission`은 개별 `Allow` 문장 추가용으로 위치시킵니다. 전체 JSON 정책은 IAM 글로벌 조건 키 전체와 명시적 `Deny`를 쓸 수 있고 최대 20KB입니다. `put-resource-policy`는 기존 정책 전체를 **덮어씁니다** | [Working with resource-based policies](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html) |
| DLQ를 비동기 모범 사례로 제시 (슬라이드 12 노트) | "비동기식 호출에 대한 모범 사례는 DLQ를 생성 및 사용하는 것" | 현재 문서는 DLQ를 **온-실패 대상의 대안**으로 제시합니다. 온-실패 대상은 지원 대상이 더 많고 함수 응답 세부 정보를 호출 레코드에 포함하며 함수·버전·별칭 단위로 구성할 수 있습니다. DLQ는 함수 수준만 가능하고 이벤트 내용만 보냅니다. DLQ 자체는 여전히 지원됩니다 | [Capturing records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html) |
| 서버리스 컴퓨팅 분류 (슬라이드 5·6) | 서버리스 열에 Lambda만, Fargate는 강사 노트에만 | 현재 결정 안내서는 **Fargate를 Lambda와 나란히 서버리스 컴퓨팅으로 분류**합니다. 또 AWS Batch, Elastic Beanstalk, ECS/EKS Anywhere, Lightsail 같은 다른 컴퓨팅 선택지도 함께 제시합니다 | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/compute-on-aws-how-to-choose/choosing-aws-compute-service.html) |
| 개발 도구 (슬라이드 23, 54 노트) | 서드 파티 플러그인(Eclipse, PyCharm, Visual Studio) | 현재 개발 도구 문서는 로컬 개발 도구로 **AWS Toolkit for VS Code**를 제시하고 Eclipse 툴킷은 언급하지 않습니다. PyCharm용 툴킷은 **AWS Toolkit for JetBrains**의 일부입니다. IaC(SAM·CDK·CloudFormation), GitHub Actions, Powertools for AWS Lambda도 함께 제시합니다 | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |

### 10.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| `python3.8` 런타임 (슬라이드 34) | **2024년 10월 14일 지원 종료.** 함수 생성 차단 2027년 2월 1일, 업데이트 차단 2027년 3월 3일 | 현재 지원 런타임 표의 Python 런타임(`python3.12`·`python3.13`·`python3.14` 등). 표의 예상 폐기일은 계획 목적이므로 채택 전에 다시 확인 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| `.NET Core` 런타임 (슬라이드 10·48) | 전 계열 지원 종료. `dotnetcore3.1` 2023-04-03, `dotnetcore2.1` 2022-01-05, `dotnetcore1.0` 2019-06-27, `dotnetcore2.0` 2019-05-30 | `.NET 8`(`dotnet8`), `.NET 10`(`dotnet10`). 컨테이너 전용으로는 `dotnet9` | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| Go 1.x 런타임 (슬라이드 10 노트의 "Go") | **2024년 1월 8일 지원 종료**, 함수 생성 차단 2024년 2월 8일. Lambda는 Go 언어 자체는 계속 지원 | OS 전용 런타임(`provided.al2023`)에 Go 실행 파일 배포. 컨테이너는 AWS OS 전용 기본 이미지 | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS Toolkit for Eclipse 사용 설명서 링크 (슬라이드 23 노트) | 인용 URL이 **HTTP 404**. `/toolkit-for-eclipse/v1/user-guide/`는 AWS Toolkit for JetBrains 사용 설명서로 리디렉션. 현재 개발 도구 문서에 Eclipse 툴킷이 없습니다. 관련해 AWS SDK for Java 1.x는 2025년 12월 31일 지원 종료 | AWS Toolkit for VS Code. JetBrains IDE는 AWS Toolkit for JetBrains, Visual Studio는 AWS Toolkit for Visual Studio | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |
| `csharp-package-toolkit.html` (슬라이드 23 노트) | 개별 페이지로 남아 있지 않고 개발자 안내서 루트로 리디렉션됩니다(상태 200이지만 도착 지점이 원래 항목이 아님) | Lambda 개발 도구 문서 또는 AWS Toolkit for Visual Studio 사용 설명서 | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |
| boto3 리소스 인터페이스 (슬라이드 31) | 비권장. AWS Python SDK 팀이 **새 기능을 추가할 계획이 없고** 새 서비스 기능은 client 인터페이스로만 제공됩니다. 기존 인터페이스는 boto3 수명 주기 동안 계속 동작 | `boto3.client('dynamodb')`. 리소스 인스턴스는 스레드 안전하지 않아 스레드마다 새로 만들어야 합니다 | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

### 10.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| 런타임 폐기 정책·일정 | 폐기 예고 최소 180일 → 폐기일(콘솔 생성·업데이트 불가, CLI·SAM·CFN 가능) → 최소 30일 뒤 생성 차단 → 최소 60일 뒤 업데이트 차단. 폐기 후에도 호출은 무기한 가능. 컨테이너 이미지 함수에는 **폐기 알림이 제공되지 않습니다** | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| 함수 URL | `https://<url-id>.lambda-url.<region>.on.aws` 전용 HTTP(S) 엔드포인트. 리소스 기반 정책과 CORS, 인증 유형 `AWS_IAM`·`NONE`. 별칭 또는 `$LATEST`에만 적용. 퍼블릭 인터넷 전용(PrivateLink 미지원) | [Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) |
| 응답 스트리밍 | 함수 URL·`InvokeWithResponseStream`·API Gateway 프록시 통합으로 최대 200MB 스트리밍. 첫 6MB 무제한, 이후 2MBps. 관리형 런타임 중 Node.js만 지원. 콘솔 테스트에서는 항상 버퍼링으로 보임 | [Response streaming](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html) |
| 재귀 루프 감지 | X-Ray 트레이싱 헤더로 요청 체인 추적. 같은 체인 약 16회에서 다음 호출 중지. 기본 활성·무료. 감지 범위는 함수 자신·SQS·S3·SNS. 최소 SDK 버전 필요 | [Recursive loop detection](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html) |
| arm64(Graviton2) | 모든 지원 런타임이 x86_64·arm64를 함께 지원. 가격·성능 이점. 종속성·레이어·확장의 arm64 호환성 확인 필요. `Architectures` 미지정 시 기본 `x86_64` | [Instruction set architecture](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html) |
| 가중치 별칭 카나리 배포 | 하나의 별칭이 최대 두 버전으로 트래픽 분할. 두 버전은 실행 역할·DLQ 구성이 같고 둘 다 게시되어야 함. `x-amz-executed-version` 헤더와 `START` 로그로 확인. CodeDeploy·SAM으로 롤링 배포(`AutoPublishAlias`·`DeploymentPreference`) | [Weighted alias canary deployments](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html) |
| 예약된 동시성의 정확한 의미 | 최대치와 **최소치를 함께** 설정하는 제어. 다운스트림 과부하 방지에도 씁니다. **추가 요금 없음**. 프로비저닝된 동시성은 유료이고 `$LATEST`에 쓸 수 없으며 상한은 미예약 동시성 − 100 | [Understanding Lambda function scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html) |
| 실행 환경 `Init` 10초 제한 | `Init` 단계는 10초 제한. 초과하면 첫 호출 시점에 구성된 시간 제한으로 재시도(suppressed init). 프로비저닝된 동시성·SnapStart·Managed Instances는 130초 또는 구성된 시간 제한 중 더 큰 값(최대 900초) | [Execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| 콜드 스타트 통계 | 전체 호출의 **1% 미만**에서 발생, 지속 시간 100ms 미만~1초 초과. 호출 빈도가 낮은 개발·테스트 함수에서 더 흔함 | [Execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| ESM 배치 동작·프로비저닝 모드 | 배치 창(0~300초, Kinesis·DynamoDB·SQS 기본 0초, Kafka·MQ·DocumentDB 기본 500ms), 배치 크기, 페이로드 6MB 중 하나로 호출. 최소 한 번 처리이므로 멱등성 필수. 프로비저닝 모드는 MSK·Kafka·SQS에서 폴러 최소·최대치 지정 | [Event source mappings](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html) |
| DynamoDB ESM 세부 사항 | 초당 4회 폴링은 **기본 속도**. `ParallelizationFactor` 1~10(기본 1)으로 샤드당 동시 처리, 항목 수준 순서 유지. 시작 위치는 `TRIM_HORIZON` 권장. 단일 리전 테이블은 샤드당 최대 2개 함수, 글로벌 테이블은 1개 권장 | [Using Lambda with DynamoDB](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html) |
| 공유 가능 테스트 이벤트 | 비공개(함수당 10개)와 공유 가능 두 종류. 공유 가능은 `lambda-testevent-schemas` EventBridge 스키마 레지스트리에 저장되고 관련 API 권한이 모두 필요. `sam remote test-event`로도 호출 | [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html) |
| `sam local` 하위 명령 | `generate-event`, `invoke`, `start-api`, `start-lambda` | [Testing with sam local](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local.html) |
| 환경 변수 한도·주의 | 총 4KB, 키는 문자 시작·2자 이상·문자·숫자·`_` 만. **`update-function-configuration`은 `Variables` 구조 전체를 대체**. 민감 정보는 Secrets Manager 권장. 기본 AWS 관리형 키(무료) 또는 고객 관리형 키, 전송 중 암호화 헬퍼 | [Environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) |
| 레이어 세부 사항 | `/opt` 디렉터리로 추출. **.zip 함수에만** 사용 가능. 내장 SDK 버전 고정 용도. Go·Rust에는 비권장 | [Lambda layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html) |
| 컨테이너 이미지 기본 이미지 세 갈래 | AWS 기본 이미지(런타임 인터페이스 에뮬레이터 포함), AWS OS 전용 기본 이미지, AWS가 아닌 기본 이미지. **패키지 유형(.zip ↔ 이미지)은 기존 함수에서 변경 불가.** 다중 아키텍처 이미지 미지원. AL2023 전환 | [Container images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) |
| 버전 게시를 유발하는 변경 목록 | 코드·환경 변수·런타임·핸들러·레이어·메모리·시간 제한·VPC·DLQ·IAM 역할·설명·아키텍처·임시 스토리지·패키지 유형·코드 스토리지 모드·로깅·파일 시스템·SnapStart·트레이싱. **예약된 동시성은 유발하지 않음.** 버전 번호는 재사용되지 않음 | [Manage function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html) |
| X-Ray 세부 사항 | `Active`·`PassThrough` 모드. 샘플링 초당 1건 + 5%(구성 불가). 트레이스당 2개 세그먼트(`AWS::Lambda`, `AWS::Lambda::Function`). MSK·Kafka·MQ·DocumentDB ESM 미지원 | [Visualize invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| Lambda API 요청 할당량 | 동기 호출은 인스턴스당 초당 10건(총 호출 한도 = 동시성 × 10). `GetFunction` 초당 100, `GetPolicy` 초당 15, 그 밖의 제어 영역 API 전체 합쳐 초당 15(모두 증액 불가) | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| 그 밖의 새 할당량 | 환경 변수 4KB, 리소스 기반 정책 20KB, 스트리밍 대역폭 2MBps, 실행 환경당 네트워크 625Mbps, 컨테이너 이미지 설정 16KB, 테스트 이벤트 10개, 파일 설명자·스레드 1,024, Lambda 관리형 코드 스토리지 300GB, VPC당 ENI 500 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| 요금 구조 세분화 | x86·Arm 별도 요금 표와 GB-초 계층 요금, 프리 티어 월 100만 요청 + 400,000 GB-초, 임시 스토리지 512MB 초과분 과금, 프로비저닝된 동시성·SnapStart 별도 과금, Lambda MicroVMs 인스턴스-초 과금 | [AWS Lambda pricing](https://aws.amazon.com/lambda/pricing/) |
| Lambda durable functions | 체크포인트·재생 실행으로 **최대 1년** 실행되는 워크플로. 대기 기간에는 컴퓨팅 요금이 발생하지 않습니다. SDK는 JavaScript·TypeScript·Python·Java·C#(.NET) | [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html) |
| Lambda Managed Instances / MicroVMs | Managed Instances는 다양한 EC2 인스턴스 유형에서 함수를 실행하면서 Lambda의 운영 단순성을 유지합니다. MicroVMs는 신뢰할 수 없는 코드를 실행하는 세션 기반 격리 샌드박스로 별도 컴퓨팅 프리미티브입니다 | [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html) |
| ABAC로 함수 액세스 제어 | 함수에 태그를 붙이고 API 요청이나 IAM 주체에 같은 태그를 지정해 IAM 정책의 조건 요소로 함수 액세스를 제어 | [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html) |

### 10.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| SnapStart "최대 10배 향상" 수치 | 현재 SnapStart 문서에 **10배라는 표현이 없다는 것만** 확인했습니다. 문서는 "최대 1초 미만(as low as sub-second)"으로 기술합니다. 10배가 과거에 맞았는지, 지금 특정 조건에서 성립하는지는 **문서로 판별할 수 없었습니다.** 강의에서 배수를 말할 때는 출처가 교재라는 점을 밝히는 것이 안전합니다 |
| AWS 관리형 레이어의 구체적 이름 | 교재 슬라이드 38 도형은 "AWS 관리형 레이어"와 "파트너 또는 서드 파티 레이어"를 제시하지만 이름을 밝히지 않습니다. 레이어 문서의 개요·버전·패키징 항목은 확인했지만 **AWS가 제공하는 관리형 레이어의 목록이나 대표 예를 명시한 페이지는 조회하지 않았습니다.** 이름을 추측해 넣지 않았습니다 |
| Amazon Alexa가 현재도 Lambda를 호출할 수 있는가 | "Lambda 함수를 호출할 수 있는 서비스" 표(28개)에 Amazon Alexa와 AWS CloudTrail이 **없다는 것만** 확인했습니다. 표에 없다는 것이 호출이 불가능하다는 뜻은 아닙니다. `AddPermission` API 문서에는 여전히 "Alexa Smart Home 함수용" `EventSourceToken` 파라미터가 있어 지원이 남아 있음을 시사하지만, **Alexa Skills Kit 쪽 문서는 조회하지 않았습니다** |
| AWS Toolkit for Eclipse의 공식 지원 상태 | 확인한 것은 세 가지입니다. 교재가 인용한 URL이 404라는 점, `/toolkit-for-eclipse/v1/user-guide/`가 JetBrains 툴킷 안내서로 리디렉션된다는 점, 현재 Lambda 개발 도구 문서에 Eclipse 툴킷이 없다는 점입니다. **"AWS Toolkit for Eclipse가 공식적으로 지원 종료되었다"고 선언한 문장은 찾지 못했습니다.** 문서가 사라졌다는 사실과 지원 종료 선언은 다른 것이므로 단정하지 않았습니다 |
| 슬라이드 34 `-–role` 조판 오류 | 셸이 인식하지 못하는 표기 오류입니다. AWS 문서로 확인할 성질의 사실이 아니라 교재 자체의 조판 문제이므로 표기만 교정하고 근거 인용은 붙이지 않았습니다. 같은 코드 블록의 출력 JSON에 섞인 `"State": "Active", -n:dictate-function",` 조각도 같습니다 |
| 슬라이드 16·17 제목 중복 | 같은 이유로 문서 검증 대상이 아닙니다. 두 절을 1/2·2/2로 구분했습니다 |
| 교재 슬라이드 34 응답 JSON의 나머지 필드 | `LastUpdateStatus`·`RevisionId`·`State`·`PackageType` 같은 필드가 현재 `CreateFunction` 응답에도 있는지는 `CreateFunction` **요청** 문서까지만 확인했고 **응답 요소 전체 목록은 조회하지 않았습니다.** `State`·`StateReason`·`StateReasonCode`가 `GetFunctionConfiguration` 응답에 있다는 것은 확인했습니다 |
| Lambda MicroVMs·durable functions의 세부 동작 | 두 기능이 존재하고 각각 인스턴스-초 과금·최대 1년 실행이라는 것은 할당량 문서와 결정 안내서로 확인했습니다. **각 기능의 전용 안내서(`lambda-microvms-guide.html`, `durable-functions.html`)는 조회하지 않았습니다.** 이 모듈 범위를 넘어서므로 존재와 위치만 남겼습니다 |
| Lambda 요금의 실제 단가 | 요금 페이지의 **과금 구조**(요청 수 + GB-초, x86·Arm 분리, 계층 요금 구간, 프리 티어 100만 요청·400,000 GB-초)는 확인했습니다. **구체적인 달러 단가는 페이지가 리전 선택기로 동적 렌더링해 원문 HTML에 값이 들어 있지 않아 조회하지 못했습니다.** 단가가 필요하면 요금 페이지에서 리전을 선택해 직접 확인하세요 |
| 실습 4의 상세 절차 | 교재 슬라이드 55~56에는 아키텍처 다이어그램과 목표만 있고 절차 텍스트가 없습니다. 요약할 원문이 없어 이 문서에서는 목표와 [9.3절](#93-실습에서-걸릴-수-있는-지점)의 주의 지점만 다뤘습니다 |

---

## 11. 지식 확인 및 핵심 정리

### 지식 확인 문제 (참/거짓)

교재 슬라이드 54의 문제와 강사 노트의 정답을 그대로 싣습니다.

**문제 1**: AWS Lambda 서비스는 사용자 대신 서버, 용량 및 배포 요구 사항을 처리합니다.

- ✅ **정답: 참**

**문제 2**: AWS Lambda 함수가 계정의 다른 AWS 리소스에 액세스하려면 호출 권한이 필요합니다.

- ❌ **정답: 거짓** — AWS Lambda 함수가 계정의 다른 AWS 리소스에 액세스하려면 **실행 권한**이 필요합니다.

**문제 3**: Lambda 함수 개발 및 생성은 AWS Lambda 콘솔을 통해서만 가능합니다.

- ❌ **정답: 거짓** — AWS Lambda 콘솔 외에도 AWS CLI를 사용할 수 있습니다. AWS SDK를 사용하여 사용자 지정 코드와도 상호 작용할 수 있습니다. 또한 Eclipse 및 Visual Studio 툴키트 모두 Lambda 함수 개발을 지원합니다.
- 🔄 **해설 보충**: 결론(콘솔 외에도 가능)은 맞지만 예로 든 도구가 낡았습니다. 현재 개발 도구 문서는 로컬 개발 도구로 **AWS Toolkit for VS Code**를 제시하고 Eclipse 툴킷은 언급하지 않으며, 교재가 인용한 Eclipse 툴킷 문서 URL은 404입니다([6.1절](#61-개발-옵션)).

**문제 4**: 테이블에서 DynamoDB Streams를 활성화하면 스트림 ARN을 사용자가 작성하는 Lambda 함수와 연결할 수 있습니다.

- ✅ **정답: 참**

**문제 5**: 각 Lambda 함수는 격리된 자체 환경에서 자체 리소스와 파일 시스템 보기로 실행됩니다.

- ✅ **정답: 참**

**문제 6**: AWS Lambda의 프로그래밍 모델은 스테이트리스(stateless) 방식이지만 여전히 스테이트풀(stateful) 데이터에 액세스할 수 있습니다.

- ✅ **정답: 참** — 코드에서 Amazon S3 또는 Amazon DynamoDB 등 다른 웹 서비스를 호출하면 스테이트풀 데이터에 액세스할 수 있습니다.

> — 출처: [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html)

### 🆕 보충 문제 (최신화 내용 확인)

**문제 7**: `--runtime python3.8`로 새 Lambda 함수를 만들 수 있습니다.

- ❌ **정답: 거짓** — `python3.8`은 **2024년 10월 14일에 지원 종료**되었습니다. 함수 생성 차단은 2027년 2월 1일, 업데이트 차단은 2027년 3월 3일로 예정되어 있어 그 시점까지는 CLI·SAM·CloudFormation으로 생성이 가능하지만 **콘솔에서는 폐기일부터 생성·업데이트할 수 없습니다.** 보안 패치와 기술 지원도 중단되었습니다. ([3.4절](#34-지원-런타임))

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**문제 8**: Lambda SnapStart는 Java 관리형 런타임에서만 쓸 수 있습니다.

- ❌ **정답: 거짓** — 현재 SnapStart는 **Java 11 이상, Python 3.12 이상, .NET 8 이상**을 지원합니다. 그 밖의 관리형 런타임(`nodejs24.x`, `ruby4.0` 등), OS 전용 런타임, 컨테이너 이미지는 지원하지 않습니다. ([4.9절](#49-콜드-스타트-최소화하기-22-lambda-snapstart))

> — 출처: [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

**문제 9**: SnapStart는 어떤 런타임에서든 추가 비용이 없습니다.

- ❌ **정답: 거짓** — **Java 관리형 런타임만** 추가 비용이 없습니다. 그 밖에는 SnapStart를 켜고 게시한 함수 버전마다 스냅샷 **캐싱 요금(최소 3시간 과금)** 과 스냅샷에서 복원할 때마다 **복원 요금**이 발생하며, 두 요금은 함수 메모리에 따라 달라집니다. ([4.9절](#49-콜드-스타트-최소화하기-22-lambda-snapstart))

> — 출처: [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

**문제 10**: 비동기식 호출의 최대 페이로드 크기는 256KB입니다.

- ❌ **정답: 거짓** — 비동기식은 **1MB**입니다. 동기식은 요청·응답 각각 6MB이고, 응답 스트리밍을 쓰면 200MB까지 가능합니다. 교재 슬라이드 50 표는 "2021년 9월 현재" 값입니다. ([8.4절](#84-lambda-함수-할당량))

> — 출처: [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

**문제 11**: `/tmp` 디렉터리 스토리지는 10GB로 고정되어 있습니다.

- ❌ **정답: 거짓** — **512MB~10,240MB를 1MB 단위로 구성**하는 설정입니다. 512MB까지는 추가 비용이 없고 그 이상은 GB-초로 과금됩니다. SnapStart는 512MB를 초과하는 임시 스토리지를 지원하지 않습니다. ([8.4절](#84-lambda-함수-할당량))

> — 출처: [Configure ephemeral storage for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html)

**문제 12**: 사용자 애플리케이션과 Lambda 함수가 같은 AWS 계정에 있으면 호출에 별도 권한이 필요하지 않습니다.

- ❌ **정답: 거짓** — 계정 관계와 무관하게 호출 주체에게 **`lambda:InvokeFunction` 권한이 필요합니다.** 문서는 "사용자 또는 수임하는 역할에 함수를 호출할 권한이 있어야 하며, 이 요구 사항은 함수를 호출하는 Lambda 함수와 그 밖의 컴퓨팅 리소스에도 적용된다"고 명시합니다. 같은 계정이면 **리소스 기반 정책**을 별도로 추가하지 않아도 되는 경우가 있다는 정도가 맞습니다. ([5.2절](#52-같은-계정이면-권한이-필요-없다는-서술))

> — 출처: [Troubleshoot invocation issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html)

**문제 13**: 함수 코드에서 오류가 발생하면 `Invoke` 응답의 HTTP 상태 코드가 400 또는 500 계열이 됩니다.

- ❌ **정답: 거짓** — 함수 코드나 런타임이 오류를 반환해도 응답의 상태 코드는 **200 OK**입니다. 오류가 있다는 사실은 **`X-Amz-Function-Error` 헤더**로 표시되고 세부 정보는 응답 페이로드에 담깁니다. 400·500 계열은 **호출 오류**(권한, 할당량, 잘못된 요청 등)에 예약되어 있습니다. ([7.6절](#76-오류-처리))

> — 출처: [Troubleshoot execution issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/python-exceptions.html)

**문제 14**: 프로비저닝된 동시성은 `$LATEST` 버전에 구성할 수 있습니다.

- ❌ **정답: 거짓** — 프로비저닝된 동시성은 **게시된 버전 또는 버전을 가리키는 별칭에만** 구성할 수 있고 `$LATEST`에는 쓸 수 없습니다. 이벤트 소스가 있으면 그 이벤트 소스가 해당 별칭·버전을 가리켜야 하며, 그러지 않으면 함수가 프로비저닝된 환경을 쓰지 않습니다. 구성 가능한 최대치는 미예약 계정 동시성 **− 100**입니다. ([4.7절](#47-동시성))

> — 출처: [Configuring provisioned concurrency for a function](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

**문제 15**: 예약된 동시성은 함수가 쓸 수 있는 동시성의 **하한만** 보장합니다.

- ❌ **정답: 거짓** — 예약된 동시성은 **최대치와 최소치를 함께** 설정합니다. 예약한 동시성은 다른 함수가 쓸 수 없으므로 하한이 되는 동시에, 그 함수가 예약치를 넘어 확장하는 것도 막는 상한이 됩니다. 다운스트림 리소스(데이터베이스 연결 등) 과부하를 막는 데도 씁니다. 구성 자체에는 **추가 요금이 없습니다.** ([4.7절](#47-동시성))

> — 출처: [Understanding Lambda function scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html)

**문제 16**: 비동기 호출 레코드를 보낼 수 있는 대상은 Lambda, SNS, SQS, EventBridge 네 가지입니다.

- ❌ **정답: 거짓** — **Amazon S3 버킷(실패 시에만)** 을 포함해 **다섯 가지**입니다. 대상별로 실행 역할에 `sqs:SendMessage`, `sns:Publish`, `s3:PutObject`+`s3:ListBucket`, `lambda:InvokeFunction`, `events:PutEvents` 권한이 필요합니다. ([4.4절](#44-호출-레코드-대상과-dlq))

> — 출처: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

**문제 17**: 비동기 호출의 실패 이벤트를 보관하는 현재 권장 경로는 DLQ입니다.

- ❌ **정답: 거짓** — 현재 문서는 **온-실패 대상(on-failure destination)** 을 기본 경로로 제시하고 DLQ를 그 **대안**으로 위치시킵니다. 온-실패 대상은 지원 대상이 더 많고 **함수 응답 세부 정보**를 호출 레코드에 포함하며 함수·버전·별칭 단위로 구성할 수 있습니다. DLQ는 함수 수준에서만 구성되고 이벤트 내용만 보냅니다. DLQ 자체는 여전히 지원됩니다. ([4.4절](#44-호출-레코드-대상과-dlq))

> — 출처: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

**문제 18**: 재귀 코드로 무한 루프가 생기면 개발자가 직접 알아차려 동시성을 0으로 내리는 것이 유일한 대응입니다.

- ❌ **정답: 거짓** — Lambda는 **재귀 루프를 자동 감지해 중지**합니다. X-Ray 트레이싱 헤더로 요청 체인을 추적해 같은 체인에서 약 **16회** 호출되면 다음 호출을 중지하고 Health Dashboard·이메일로 알립니다. 기본 활성이고 무료입니다. 단 감지 범위는 함수 자신·**SQS·S3·SNS** 사이의 루프와 Lambda 함수만으로 구성된 루프이므로, **DynamoDB 등이 포함된 루프는 감지되지 않아** 교재의 수동 조치도 여전히 필요합니다. ([6.7절](#67-재귀-루프-감지))

> — 출처: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

**문제 19**: `aws lambda update-function-configuration --environment "Variables={A=1}"` 을 실행하면 기존 환경 변수 `B`는 그대로 남습니다.

- ❌ **정답: 거짓** — `update-function-configuration`으로 환경 변수를 적용하면 **`Variables` 구조 전체가 대체**되어 `B`는 사라집니다. 기존 값을 유지하려면 요청에 모두 포함해야 합니다. `get-function-configuration`으로 현재 값과 `RevisionId`를 조회해 함께 넘기면 읽고 쓰는 사이의 변경도 막을 수 있습니다. ([6.12절](#612-환경-변수))

> — 출처: [Working with Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

**문제 20**: Lambda 콘솔 코드 편집기는 배포 패키지가 3MB 미만일 때만 쓸 수 있습니다.

- ❌ **정답: 거짓** — 현재 조건은 두 가지입니다. **인터프리터 언어 런타임**(Python, Node.js, Ruby)을 쓸 것, 배포 패키지가 **압축 해제 기준 50MB 미만**일 것. 컨테이너 이미지 배포 패키지를 쓰는 함수의 코드는 콘솔에서 직접 편집할 수 없습니다. 할당량 표에 3MB 항목은 없습니다. ([6.2절](#62-lambda-콘솔-코드-편집기))

> — 출처: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

**문제 21**: 하나의 Lambda 별칭은 하나의 함수 버전만 가리킬 수 있습니다.

- ❌ **정답: 거짓** — 별칭은 **최대 두 개**의 함수 버전을 가리킬 수 있고 가중치로 트래픽을 나눌 수 있습니다(**카나리 배포**). 두 버전은 실행 역할이 같아야 하고, DLQ 구성이 같거나 없어야 하며, 둘 다 게시된 버전이어야 합니다(`$LATEST` 불가). 호출된 버전은 `x-amz-executed-version` 헤더와 CloudWatch Logs의 `START` 로그로 확인합니다. ([6.20절](#620-가중치-별칭과-카나리-배포))

> — 출처: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

**문제 22**: Lambda 함수를 HTTP로 호출하려면 Amazon API Gateway가 필요합니다.

- ❌ **정답: 거짓** — **함수 URL**로 Lambda 함수 전용 HTTP(S) 엔드포인트를 만들 수 있습니다. 형식은 `https://<url-id>.lambda-url.<region>.on.aws`이고 리소스 기반 정책과 CORS로 제어하며 인증 유형은 `AWS_IAM` 또는 `NONE`입니다. 함수 별칭 또는 `$LATEST`에만 적용할 수 있고 퍼블릭 인터넷으로만 액세스됩니다. ([6.14절](#614-함수-url))

> — 출처: [Creating and managing Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)

**문제 23**: Lambda 함수의 응답은 최대 6MB이므로 그보다 큰 데이터는 반환할 수 없습니다.

- ❌ **정답: 거짓** — **응답 스트리밍**을 쓰면 최대 **200MB**까지 반환할 수 있습니다. 경로는 함수 URL, `InvokeWithResponseStream` API, API Gateway 프록시 통합입니다. 첫 6MB는 대역폭 제한이 없고 이후는 최대 2MBps입니다. 관리형 런타임 중에는 **Node.js만** 지원하고 콘솔 테스트에서는 항상 버퍼링된 형태로 보입니다. ([6.15절](#615-응답-스트리밍))

> — 출처: [Response streaming for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)

**문제 24**: Lambda 레이어는 컨테이너 이미지로 배포한 함수에도 쓸 수 있습니다.

- ❌ **정답: 거짓** — 레이어는 **.zip 파일 아카이브로 배포한 함수에만** 쓸 수 있습니다. 컨테이너 이미지로 정의한 함수는 런타임과 모든 종속성을 이미지에 패키지합니다(교재 슬라이드 49의 "컨테이너 이미지는 레이어를 사용하지 않습니다"와 같은 내용입니다). 함수당 최대 5개이고 레이어 내용은 실행 환경의 `/opt` 디렉터리로 추출됩니다. ([6.11절](#611-레이어))

> — 출처: [Managing Lambda dependencies with layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)

**문제 25**: Python·Node.js 런타임에는 SDK가 내장되어 있으므로 SDK를 배포 패키지에 넣지 않는 것이 권장됩니다.

- ❌ **정답: 거짓** — 내장 사실은 맞습니다(Ruby도 포함). 다만 현재 문서는 종속성을 완전히 제어하고 **자동 런타임 업데이트 중 하위 호환성을 극대화**하기 위해 코드가 쓰는 SDK 모듈과 종속성을 **배포 패키지나 Lambda 레이어에 항상 포함**하도록 권장합니다. 내장 SDK는 콘솔 코드 편집기나 CloudFormation 인라인 코드처럼 추가 패키지를 넣을 수 없을 때만 씁니다. ([3.6절](#36-런타임에-포함된-aws-sdk))

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**문제 26**: 게시된 함수 버전은 어떤 설정도 바꿀 수 없습니다.

- ❌ **정답: 거짓** — 코드, 런타임, 아키텍처, 메모리, 레이어와 대부분의 구성 설정은 불변이지만 **트리거, 대상(destinations), 프로비저닝된 동시성, 비동기 호출 설정, 데이터베이스 연결·프록시**는 게시된 버전에도 구성할 수 있습니다. 또 버전 번호는 단조 증가하며 함수를 삭제하고 다시 만들어도 **재사용되지 않습니다.** ([6.19절](#619-버전-및-별칭))

> — 출처: [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

**문제 27**: Lambda 런타임은 폐기되어도 기존 함수 호출에는 영향이 없으므로 그대로 두어도 됩니다.

- ❌ **정답: 거짓(반만 맞음)** — 폐기 후에도 함수를 **무기한 호출할 수는 있습니다.** 그러나 보안 패치와 기술 지원이 중단되고, 폐기 후 **최소 30일**부터 새 함수 생성이 차단되며 **최소 60일**부터 기존 함수의 코드·구성 업데이트가 차단됩니다. 인증서 만료 같은 이유로 정상 동작이 멈출 수도 있습니다. 업데이트가 차단된 뒤에는 폐기 런타임으로 되돌리는 것도 막힐 수 있으므로 **버전과 별칭으로 안전한 배포·롤백 경로를 만들어 두고** 미리 업그레이드하는 것이 문서의 권장입니다. ([3.5절](#35-런타임-폐기-정책과-일정))

> — 출처: [Lambda runtimes — Runtime use after deprecation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**문제 28**: AWS Fargate는 컨테이너 서비스이므로 서버리스가 아닙니다.

- ❌ **정답: 거짓** — 현재 문서는 **Fargate와 Lambda를 함께 서버리스 컴퓨팅으로 분류**합니다. Fargate는 컨테이너용 서버리스 컴퓨팅 엔진이며 Amazon ECS와 Amazon EKS에서 모두 쓸 수 있습니다. 두 서비스는 운영 부담 감소, 사용량 기반 과금, 빠른 배포, 내장 고가용성이라는 이점을 공유하고, 실행 시간 제한(Fargate 무제한 vs Lambda 호출당 15분)과 상태 관리에서 갈립니다. ([2.2절](#22-현재-문서의-컴퓨팅-서비스-분류) · [2.4절](#24-fargate와-lambda-비교))

> — 출처: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

**문제 29**: Lambda 함수는 최대 15분까지만 실행할 수 있으므로 그보다 긴 워크플로에는 쓸 수 없습니다.

- ❌ **정답: 거짓** — **호출당** 최대 실행 시간이 15분인 것은 맞습니다. 다만 **durable functions**를 쓰면 체크포인트·재생 실행으로 **최대 1년** 실행되는 워크플로를 만들 수 있고, 대기 기간에는 컴퓨팅 요금이 발생하지 않습니다. 사람 승인, 예정된 지연, 외부 API 콜백처럼 대기가 대부분인 워크플로에 유리하고, 지속적인 컴퓨팅이 필요하면 Fargate가 더 적합합니다. ([2.4절](#24-fargate와-lambda-비교))

> — 출처: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

**문제 30**: 콘솔 테스트 이벤트는 만든 사람만 쓸 수 있습니다.

- ❌ **정답: 거짓** — 비공개(private) 테스트 이벤트는 생성자만 쓸 수 있고 함수당 최대 10개까지 저장되지만, **공유 가능(shareable) 테스트 이벤트**는 같은 AWS 계정의 다른 사용자와 공유하고 서로 편집할 수 있습니다. 공유 가능 이벤트는 `lambda-testevent-schemas`라는 EventBridge 스키마 레지스트리에 저장되므로 관련 API 권한이 모두 필요합니다. ([7.3절](#73-lambda-함수-테스트-방법))

> — 출처: [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)

### 모듈 학습 목표 달성 확인

이 모듈을 완료하면 다음을 수행할 수 있습니다.

- ✅ AWS Lambda 작동 방식 이해
- ✅ SDK를 사용하여 AWS Lambda 함수 개발
- ✅ Lambda 함수를 위한 트리거 및 권한 구성
- ✅ Lambda 함수 테스트, 배포, 모니터링

### 한 장 요약

| 주제 | 기억할 것 |
|---|---|
| 컴퓨팅 선택 | 추상화는 EC2(하드웨어) → ECS·EKS(운영 체제) → Lambda(런타임). 현재 문서는 **Fargate와 Lambda를 함께 서버리스**로 분류. Lambda는 호출당 15분, durable functions로 최대 1년 |
| 런타임 | `.NET Core`와 `go1.x`는 지원 종료. 현재는 Node.js·Python·Java·.NET·Ruby 관리형 런타임 + OS 전용 `provided.al2023`. 모두 x86_64·arm64 지원. **AL2는 2026-06-30 EOL** |
| 폐기 일정 | 예고 180일 → 폐기일(콘솔 차단) → +30일 생성 차단 → +60일 업데이트 차단. 폐기 후에도 호출은 가능. 컨테이너 이미지는 **알림 없음** |
| 호출 모델 | 동기(기본, 재시도 없음, 200) / 비동기(대기열, 재시도 2회·1분·2분, 202) / ESM(폴링, 최소 한 번, 배치 6MB). 비동기 페이로드는 **256KB가 아니라 1MB** |
| 재시도·대상 | 구성 가능한 것은 재시도 0~2회와 이벤트 최대 수명 6시간. 대상은 **다섯 가지**(S3는 실패 시만). **온-실패 대상이 DLQ보다 권장** |
| 동시성 | 기본 1,000(증액 가능, 신규 계정은 축소). 조정 속도는 함수당 10초당 1,000(누적 안 됨). **예약**은 최대·최소 동시 설정·무료, **프로비저닝**은 사전 초기화·유료·`$LATEST` 불가 |
| 콜드 스타트 | 전체 호출의 1% 미만, 100ms~1초 초과. `Init` 10초 제한. 완화는 예약 트리거, 프로비저닝된 동시성, **SnapStart(Java 11+·Python 3.12+·.NET 8+, Java만 무료)** |
| 권한 | 실행 역할(`lambda.amazonaws.com` 신뢰, `AWSLambdaBasicExecutionRole`) + 호출 권한. **같은 계정이어도 `lambda:InvokeFunction` 필요.** 리소스 정책은 `PutResourcePolicy`(20KB, `Deny` 가능)가 권장, `AddPermission`은 개별 문장 |
| 개발·테스트 | 콘솔 코드 편집기는 **인터프리터 런타임 + 압축 해제 50MB 미만**(3MB 아님). 테스트 이벤트는 비공개 10개 + 공유 가능. `sam local invoke`·`start-api`·`start-lambda`·`generate-event` |
| 오류 | **함수 오류는 상태 코드 200 + `X-Amz-Function-Error` 헤더.** 400·500 계열은 호출 오류. 재시도에 의존하면 코드가 멱등적이어야 함. 재귀 루프는 약 16회에서 자동 중지(SQS·S3·SNS만) |
| 배포 | .zip(50MB 압축·250MB 비압축, 50MB 초과는 S3 경유)과 컨테이너 이미지(10GB, 레이어 미사용, 유형 변경 불가). 레이어 5개·`/opt` 추출·.zip 전용 |
| 버전·별칭 | 게시하면 코드·대부분 구성이 불변(트리거·대상·프로비저닝된 동시성·비동기 설정은 예외). 별칭은 **두 버전까지 가중치 분할** 가능(카나리) |
| 환경 변수 | 총 4KB, 버전별 구성, 항상 저장 중 암호화(기본 AWS 관리형 키·무료). **`update-function-configuration`은 구조 전체를 대체.** 민감 정보는 Secrets Manager |
| 메모리·CPU | 128MB~10,240MB(1MB 단위), **1,769MB = 1 vCPU.** 기본 128MB. `/tmp`는 **512MB~10,240MB** |
