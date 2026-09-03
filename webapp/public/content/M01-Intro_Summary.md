# 모듈 1: 과정 개요

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [수강 전 권장 사항](#2-수강-전-권장-사항)
3. [과정에서 만드는 애플리케이션: Pollynotes](#3-과정에서-만드는-애플리케이션-pollynotes)
4. [3일 어젠다](#4-3일-어젠다)
5. [강의 진행 안내](#5-강의-진행-안내)
6. [실습 및 가이드 액세스](#6-실습-및-가이드-액세스)
7. [실습 요구 사항](#7-실습-요구-사항)
8. [교재 대비 변경 사항](#8-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 강의에서 다루지 않은 내용. AWS 공식 문서로 확인해 더한 항목입니다.
> - 🔄 강의 당시와 달라져 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [8장](#8-교재-대비-변경-사항)에 모아 두었습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

이 모듈은 기술 모듈이 아니라 **과정 운영 모듈**입니다. 무엇을 배우는지(과정 목표), 무엇을 알고 와야 하는지(수강 전 권장 사항), 3일 동안 어떤 순서로 진행하는지(어젠다), 실습 환경과 가이드에 어떻게 접근하는지를 다룹니다. 기술 서비스를 직접 다루지 않으므로 이 문서도 짧습니다.

### 과정 목표

이 과정을 마치면 다음 세 가지를 할 수 있게 됩니다.

| # | 목표 |
|---|---|
| 1 | 개발 환경을 지원하도록 IAM 권한 구성 |
| 2 | AWS SDK를 사용한 클라우드 네이티브 애플리케이션 설계, 다이어그램, 구축, 배포 |
| 3 | AWS 리소스를 사용하여 애플리케이션 모니터링 및 유지 관리 |

이 세 가지는 3일에 걸쳐 나뉘어 나옵니다. 1번은 모듈 4, 2번은 모듈 5~13, 3번은 모듈 14가 각각 담당합니다.

### 교재 슬라이드와 이 문서의 대응

교재를 함께 펴 놓고 보실 때 참고하세요.

| 슬라이드 | 내용 | 이 문서 |
|---|---|---|
| 4 | 과정 목표 | 1장 |
| 5 | 수강 전 권장 사항 | [2장](#2-수강-전-권장-사항) |
| 6 | 과정 개요 — Pollynotes 아키텍처 | [3장](#3-과정에서-만드는-애플리케이션-pollynotes) |
| 7~12 | 1~3일 차 어젠다(오전·오후) | [4장](#4-3일-어젠다) |
| 13~15 | 안내 사항, 가상 수업 안내 사항, 자기 소개 | [5장](#5-강의-진행-안내) |
| 16~19 | 과정 실습 및 가이드에 액세스하는 방법 | [6장](#6-실습-및-가이드-액세스) |
| 20 | 실습 요구 사항 | [7장](#7-실습-요구-사항) |
| 1~3, 21 | 표지, 강사 소개, 감사합니다 | (레이아웃만. 옮길 원문 없음) |

---

## 2. 수강 전 권장 사항

이 과정은 다음을 알고 있다고 가정하고 진행됩니다.

| 구분 | 내용 |
|---|---|
| 선수 과정 | AWS Cloud Practitioner Essentials 이수 |
| 선수 과정 | AWS Technical Essentials 이수 |
| 언어 | 최상위 프로그래밍 언어에 대한 기본 지식 — Python, .NET, Java |

실습에서 쓸 언어는 **Python · .NET(C#) · Java** 중에서 고릅니다. 이 선택이 실습 IDE와 SDK를 결정하므로 첫날 오전에 정해 두는 편이 좋습니다. 교재는 두 곳에서 `.NET` 과 `C#` 을 섞어 적는데, `.NET` 은 플랫폼이고 `C#` 은 그 플랫폼의 언어입니다([8.1절](#81-교재-기술이-사실과-다른-항목)).

### 2.1 두 선수 과정의 현재 이름과 위치 🔄

두 과정은 지금도 같은 이름으로 존재합니다. 달라진 것은 **찾아가는 경로**와 **AWS Cloud Practitioner Essentials의 구성**입니다.

| 과정 | 확인한 내용 |
|---|---|
| AWS Cloud Practitioner Essentials | 최근 개편되어 클라우드 개념 중심의 **13개 모듈**로 구성됩니다(모듈 1 Introduction to the Cloud ~ 모듈 13 Well-Architected Solutions). AI·기계 학습·데이터 분석을 다루는 새 레슨이 추가되었고, 강사가 AWS Management Console로 시연하는 실습형 학습과 'Cloud in Real Life' 세그먼트가 들어갔습니다. AWS Skill Builder에서 수강하며 Coursera·edX에서도 제공됩니다 |
| AWS Technical Essentials | 컴퓨팅·데이터베이스·스토리지·네트워킹·모니터링·보안의 기본 개념을 다룹니다. 강의실 과정은 1일 분량이고 라이브 AWS 환경에서 하는 실습 6개가 포함되며, 자습형 디지털 과정은 4시간 분량입니다. 다만 이 내용을 확인한 블로그 글은 **2021년 6월 게시물**이므로 지금 이 시점의 과정 구성을 보증하지는 않습니다 |

> — 출처: [Step into the cloud: The new AWS Cloud Practitioner Essentials is here!](https://aws.amazon.com/blogs/training-and-certification/new-aws-cloud-practitioner-essentials/)

> — 출처: [Propel your technical career with AWS Technical Essentials course](https://aws.amazon.com/blogs/training-and-certification/propel-your-technical-career-with-aws-technical-essentials-course/)

**과정 페이지 위치.** `aws.amazon.com` 의 강의실 과정 페이지는 지금 **AWS Skill Builder로 이동합니다.** [AWS Cloud Practitioner Essentials](https://aws.amazon.com/training/classroom/aws-cloud-practitioner-essentials/) · [AWS Technical Essentials](https://aws.amazon.com/training/classroom/aws-technical-essentials/) · [Developing on AWS](https://aws.amazon.com/training/classroom/developing-on-aws/) 세 주소 모두 HTTP 200으로 응답하지만 요청이 Skill Builder의 과정 페이지로 리다이렉트됩니다. 확인한 것은 응답 코드와 리다이렉트 대상까지이며, 이 페이지들은 클라이언트 렌더링이라 본문은 읽지 못했습니다([8.5절](#85-검증하지-못한-항목)).

---

## 3. 과정에서 만드는 애플리케이션: Pollynotes

### 3.1 애플리케이션 개요

3일 동안 실습으로 완성해 나가는 애플리케이션입니다.

| 항목 | 내용 |
|---|---|
| 이름 | **Pollynotes** |
| 성격 | 완전히 작동하는 웹 애플리케이션. 여러 AWS 서비스를 사용해 **인증된 사용자**가 텍스트 노트를 만들고 저장하고 관리한다 |
| 특징 기능 | 선택한 노트의 **음성 버전**을 선택한 음성 모드로 재생한다 |
| 개발 방식 | 개발자로서 **통합 개발 환경(IDE)에서 AWS SDK**를 사용해 개발한다 |
| 배우는 것 | 정적 웹 사이트 호스팅, 비즈니스 로직 구현, API 관리, 애플리케이션 액세스 제어, 사용자 데이터 저장·처리 |

### 3.2 아키텍처를 구성하는 요소

전체 아키텍처 다이어그램에 등장하는 요소입니다. 과정 첫날과 마지막날 같은 그림을 다시 보게 됩니다.

| 구분 | 요소 |
|---|---|
| 행위자 | 최종 사용자 |
| 경로 | 웹 사이트 호스팅 / MP3 호스팅 / 애플리케이션 API 호출 |
| 노트 작업 | List / Search / Delete / Create/Update |
| 음성 | Dictate |
| 경계 | AWS 클라우드 |
| 서비스 레이블 | DynamoDB, AWS Identity and Access Management(IAM), Amazon Cognito, Amazon APIGateway, Amazon Polly, AWS X-Ray, AWS Serverless Application Model(AWS SAM), Amazon CloudWatch |

### 3.3 각 서비스가 지금 하는 일 🆕

위에 나온 서비스를 현재 공식 문서 기준으로 한 줄씩 정리했습니다. 이후 모듈에서 하나씩 깊이 다루므로, 여기서는 전체 그림에서 각자 어떤 자리를 맡는지만 잡아 두시면 됩니다. 세 서비스는 강의 당시와 화면 경로나 범위가 달라졌습니다(→ [3.4절](#34-지금은-달라진-세-지점)).

| 서비스 | 현재 문서의 설명 | 근거 |
|---|---|---|
| Amazon Simple Storage Service(Amazon S3) | 확장성·데이터 가용성·보안·성능을 제공하는 객체 스토리지 서비스. 사용 사례별 스토리지 클래스를 제공 | [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| Amazon DynamoDB | 어떤 규모에서도 한 자릿수 밀리초 성능을 내는 **서버리스 완전 관리형 분산 NoSQL** 데이터베이스 | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| AWS Identity and Access Management(IAM) | AWS 리소스 액세스를 안전하게 제어하는 웹 서비스. 문서상 약어는 `IAM` | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| AWS Security Token Service(AWS STS) | 액세스 키 쌍과 세션 토큰이 포함된 **임시 보안 자격 증명**으로 새 세션을 만든다. 세션 권한은 역할 정책과 세션 정책의 교집합 | [Request temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html) |
| Amazon Cognito | 웹·모바일 앱을 위한 **자격 증명 플랫폼**. 사용자 풀(인증·권한 부여)과 자격 증명 풀(AWS 리소스 액세스용 임시 자격 증명)로 구성되고 서로 독립적으로도 동작 | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| Amazon API Gateway | 어떤 규모에서도 **REST·HTTP·WebSocket API**를 생성·게시·유지 관리·모니터링·보호하는 서비스 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| AWS Lambda | 서버 프로비저닝·관리 없이 코드를 실행하는 서버리스 컴퓨팅 서비스. 문서는 **Lambda Functions**와 **Lambda MicroVMs** 두 컴퓨팅 프리미티브를 제시 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| Amazon Polly | 텍스트를 사람 같은 음성으로 변환하는 클라우드 서비스. 합성한 텍스트에만 요금이 붙고 생성된 음성을 캐시·재생하는 데는 추가 비용이 없음 | [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html) |
| AWS X-Ray | 요청 추적. 콘솔은 **Amazon CloudWatch 콘솔** 또는 X-Ray 콘솔이며, 문서는 X-Ray 콘솔을 더 이상 개발하지 않는다고 명시 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Amazon CloudWatch | AWS 리소스와 애플리케이션을 실시간 모니터링. 지표·경보·대시보드, APM, 인프라 모니터링, 로그, OpenTelemetry 지원 | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| AWS Serverless Application Model(AWS SAM) | IaC로 서버리스 애플리케이션을 만드는 **오픈 소스 프레임워크**. AWS SAM CLI와 CloudFormation을 확장한 AWS SAM 템플릿으로 구성 | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| AWS CloudFormation | 템플릿으로 AWS 리소스를 모델링·프로비저닝. 문서 본문 표기는 접두사 없는 `CloudFormation` | [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |
| AWS Command Line Interface(AWS CLI) | 명령줄에서 AWS 서비스와 상호 작용하는 **오픈 소스 도구**. 버전 2가 최신 주요 버전이며 버전 1에 백포트되지 않는 기능이 있음 | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |

> — 출처: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.4 지금은 달라진 세 지점 🔄

실습을 다시 해 보거나 실무에 옮길 때 걸리는 지점입니다.

| 항목 | 강의 당시 | 지금 | 근거 |
|---|---|---|---|
| 음성 모드 | 슬라이드 6 강사 노트는 "선택한 음성 모드"라고만 적고 선택지를 제시하지 않음 | Amazon Polly의 음성 엔진은 **Generative · Long-form · Neural · Standard** 네 가지입니다. Generative와 Long-form은 교재 이후 추가되었습니다. 엔진과 음성 합성 API 작업을 고르고 입력 텍스트와 오디오 출력 형식을 제공합니다 | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |
| AWS X-Ray 콘솔 | 슬라이드 6·12는 X-Ray와 CloudWatch를 나란히 놓인 별개 서비스로 제시 | 문서는 **"AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"** 고 명시합니다. X-Ray Service map과 CloudWatch ServiceLens map은 CloudWatch 콘솔 안의 **X-Ray trace map**으로 통합되었고, X-Ray Insights도 CloudWatch 콘솔의 Insights에 포함됩니다. 서비스 단위 관찰에는 CloudWatch **Application Signals**가 추가되었습니다. X-Ray 자체가 종료된 것은 아니고 **화면 경로가 달라진 것**입니다 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| AWS Lambda의 범위 | 슬라이드 9~11은 Lambda를 함수 하나의 개념으로만 다룸 | 문서는 워크로드 패턴에 따른 두 컴퓨팅 프리미티브를 제시합니다. **Lambda Functions**(이벤트·API 호출에 응답, 호출마다 독립 실행)와 **Lambda MicroVMs**(거의 즉시 시작, 최대 8시간 상태 유지). 이 과정의 실습은 Lambda Functions 경로입니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |

> — 출처: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

---

## 4. 3일 어젠다

3일 동안의 모듈·실습 순서입니다. 반나절마다 아키텍처의 한 조각씩 쌓아 올리는 구성이라, 각 반나절에 어느 조각을 다루는지 함께 적었습니다.

### 4.1 1일 차 오전

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 모듈 1 | 과정 개요 | 과정 소개 |
| 모듈 2 | AWS에 웹 애플리케이션 빌드 | 완전한 클라우드 네이티브 애플리케이션 생성에 사용되는 AWS 아키텍처의 세부 정보 검토 |
| 모듈 3 | AWS에서 개발 시작하기 | 애플리케이션 빌드 시 AWS 소프트웨어 개발 키트(AWS SDK)의 이점 탐색 |
| 모듈 4 | 권한 시작하기 | AWS Identity and Access Management(IAM) 권한을 지원하는 개발 환경 구성 |
| 실습 1 | 개발 환경 구성 | 개발 환경에서 IAM 권한을 구성하고 테스트 |

다이어그램 조각: 본인 → AWS 클라우드 안의 EC2 인스턴스 콘텐츠(통합 개발 환경(IDE), AWS 도구 및 SDK, AWS Command Line Interface(AWS CLI)), Amazon Simple Storage Service(Amazon S3), IAM, IAM 역할, AWS Security Token Service(AWS STS), AWS CloudFormation.

**실습 환경과 IDE.** 실습에는 **IDE 세 가지**가 준비되어 있고 선호도나 프로그래밍 언어에 따라 고를 수 있습니다. 환경 접속은 Guacamole·원격 데스크톱·브라우저 기반 옵션이 쓰입니다. 어느 IDE인지와 접속 경로는 강의 운영에 따라 달라지므로 이 문서에서 확정하지 않았습니다([8.5절](#85-검증하지-못한-항목)).

### 4.2 1일 차 오후

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 모듈 5 | 스토리지 시작하기 | 사용 가능한 AWS 스토리지 솔루션의 기능 세트 및 사용 사례 비교 |
| 모듈 6 | 스토리지 작업 처리 | Amazon Simple Storage Service(Amazon S3)에 정적 웹 사이트 배포 |
| 실습 2 | Amazon S3를 사용한 솔루션 개발 | (노트는 "빅 데이터 애플리케이션 워크로드에 적합한 AWS 솔루션 파악" 이라고 적어 상자 제목과 어긋남) |

다이어그램 조각: 개발자 → AWS 소프트웨어 개발 키트(AWS SDK) → AWS 클라우드 안의 Amazon S3(두 개, Notes).

실습 2는 교재가 제목과 설명에서 서로 다른 실습을 가리킵니다. 다이어그램의 개발자 → AWS SDK → Amazon S3 흐름으로 보아 **제목 쪽**이 이 반나절의 실습입니다([8.1절](#81-교재-기술이-사실과-다른-항목)).

### 4.3 2일 차 오전

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 모듈 7 | 데이터베이스 시작하기 | 사용 가능한 AWS 데이터베이스 옵션의 기능 세트 및 사용 사례 비교, 웹 애플리케이션의 데이터를 저장하도록 Amazon DynamoDB 데이터베이스 구성 |
| 모듈 8 | 데이터베이스 작업 처리 | DynamoDB SDK로 생성·읽기·업데이트·삭제(CRUD) 작업을 수행하고 데이터베이스 캐싱 옵션 탐색 |
| 실습 3 | Amazon DynamoDB를 사용한 솔루션 개발 | 웹 애플리케이션의 데이터를 저장하도록 DynamoDB 데이터베이스 구성 |
| 모듈 9 | 애플리케이션 로직 처리 | 사용 가능한 AWS 컴퓨팅 솔루션의 기능 세트 및 사용 사례 비교. AWS Lambda 함수를 구축하여 DynamoDB에 웹 애플리케이션의 데이터 저장 |

다이어그램 조각: AWS 클라우드 안의 DynamoDB — Notes 테이블 및 글로벌 보조 인덱스, 데이터 쿼리 및 액세스.

### 4.4 2일 차 오후

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 실습 4 | AWS Lambda를 사용한 솔루션 개발 | AWS Lambda 함수를 구축하여 DynamoDB에 웹 애플리케이션의 데이터 저장 |
| 모듈 10 | API 관리 | Amazon API Gateway가 AWS 리소스에 연결하는 데 사용할 수 있는 방법 탐색 |
| 실습 5 | Amazon API Gateway를 사용한 솔루션 개발 | Amazon API Gateway를 사용하여 Lambda 및 DynamoDB에 연결 |

다이어그램 조각: 개발자 → Amazon Polly, Amazon S3(두 개) / 개발자 → API Gateway → AWS Lambda → DynamoDB table.

### 4.5 3일 차 오전

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 모듈 11 | 현대적 애플리케이션 구축 | 서버리스 방식을 사용한 웹 애플리케이션 구축의 이점 평가 |
| 모듈 12 | 애플리케이션 사용자에게 액세스 권한 부여 | Amazon Cognito가 AWS 리소스에 대한 사용자 액세스를 제어하는 방법 검토 |
| 실습 6 | 캡스톤: 애플리케이션 구축 완료 | 사용자에게 웹 애플리케이션에 대한 액세스 권한을 제공하는 Amazon Cognito 솔루션 생성 |
| 모듈 13 | 애플리케이션 배포 | 애플리케이션 배포 |

다이어그램 조각: 사용자 → Amazon Cognito → AWS 클라우드 안의 API Gateway → Lambda 함수 → DynamoDB, S3 버킷, 개발자.

여기 적힌 모듈 11·12의 제목은 각 모듈 표지의 제목과 조금씩 다릅니다. 같은 모듈이니 혼동하지 마세요([8.1절](#81-교재-기술이-사실과-다른-항목)).

### 4.6 3일 차 오후 🔄

| 항목 | 제목 | 학습 목표 |
|---|---|---|
| 모듈 14 | 애플리케이션 관찰 | 웹 애플리케이션 모니터링을 지원하는 AWS 서비스 파악 |
| 실습 7 | AWS X-Ray를 사용하여 애플리케이션 관찰 | AWS 리소스를 사용하여 웹 애플리케이션 배포, 모니터링, 유지 관리 |
| 모듈 15 | 과정 마무리 | 과정 요약 |

다이어그램 조각: 3장에서 본 Pollynotes 전체 아키텍처와 같은 레이블 집합입니다. 마지막 반나절에 처음의 그림으로 돌아옵니다.

**실습 7은 이제 CloudWatch 콘솔에서 진행합니다.** 🔄 AWS는 X-Ray 콘솔을 더 이상 개발하지 않으며, X-Ray Service map과 CloudWatch ServiceLens map이 **Amazon CloudWatch 콘솔의 X-Ray trace map**으로 통합되었습니다. CloudWatch 콘솔 왼쪽 탐색 창의 `X-Ray traces` → `Trace Map` 에서 엽니다. 자세한 내용은 [3.4절](#34-지금은-달라진-세-지점)에 있습니다.

> — 출처: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 5. 강의 진행 안내

강의 운영에 관한 안내입니다.

### 5.1 대면 강의 안내 사항

| 구분 | 항목 |
|---|---|
| 시설 | 비상구 / 화재 경보 프로토콜 / 보안 |
| 일정 | 휴식 및 점심 시간 |
| 그 외 | 음식 / 휴대전화 |

### 5.2 가상 수업 안내 사항

| 구분 | 항목 |
|---|---|
| 일정 | 휴식 및 점심 시간 |
| 소통 | 채팅 / 음소거·음소거 해제 / 카메라 |

### 5.3 자기 소개

수강생의 숙련도와 각자 기대하는 바를 파악하기 위한 순서입니다.

| # | 질문 |
|---|---|
| 1 | 이름 |
| 2 | 어떤 일을 하고 있습니까? |
| 3 | 이 수업을 통해 무엇을 얻고 싶습니까? |
| 4 | AWS 숙련도는 어떻게 됩니까? |
| 5 | Java, Python, C# 중 어떤 언어를 선택하시겠습니까? |
| 6 | Amazon.com에서 가장 최근 구매한 것은 무엇입니까? |

5번 질문이 실습 IDE와 SDK 선택으로 이어집니다([2장](#2-수강-전-권장-사항) 참조).

---

## 6. 실습 및 가이드 액세스

실습 환경과 가이드는 **AWS Builder Labs**를 통해 제공됩니다. 등록 정보는 강사가 보낸 환영 이메일에 있습니다.

### 6.1 등록

수강생이 하는 일입니다.

| 단계 | 내용 |
|---|---|
| 1 | 받은 편지함에서 강사가 보낸 **환영 이메일**을 확인한다 |
| 2 | 이메일에서 이 강의의 **고유한 수강생 등록 URL**을 찾는다 |
| 3 | 그 URL로 계정을 생성하거나 기존 AWS Builder Labs 계정에 로그인한다 |
| 4 | AWS Builder Labs에서 실습 환경, 실습 가이드, 수강생 가이드에 액세스한다 |

강사가 미리 준비하는 일입니다. 등록이 막히면 이 중 어디가 빠졌는지 확인하면 됩니다.

| 항목 | 내용 |
|---|---|
| 환영 이메일 | 강사는 강의 시작 전에 환영 이메일을 보내고, 그 안에 AWS Builder Labs에서 생성한 강의의 고유한 수강생 등록 URL을 포함해야 한다 |
| 계정 생성 권장 | 수강생이 **Amazon Retail 또는 Partner Central 로그인**으로 AWS Builder Labs 계정을 만들면 라이선스 코드가 자동 적용된다. 이 방법이 적극 권장된다 |
| 라이선스 코드 | 고유한 수강생 등록 링크로 AWS Builder Labs 대시보드를 통해 Bookshelf 계정에 액세스하면 **Gilmore에서 라이선스 코드를 구매할 필요가 없다** |
| FAQ·동시 실습 한도 | AWS Skill Builder의 `Instructor Enablement: AWS Builder Labs` 가이드 FAQ 및 리소스 섹션을 참조하라고 안내한다. 교재에 적힌 주소는 `https://explore.skillbuilder.aws/learn/course/internal/view/elearning/12814/instructor-enablement-aws-builder-labs` 이다 |

위 표의 Skill Builder 주소는 **강사 전용 내부 경로**여서 이 문서에서는 내용을 확인하지 못했습니다([8.5절](#85-검증하지-못한-항목)).

### 6.2 가이드 위치

| 항목 | 내용 |
|---|---|
| 강사 시연 | AWS Builder Labs 강의 세부 정보 페이지의 **강사 관리 보기**에 로그인한 뒤 **Student View**로 전환해 가이드 액세스 방법을 시연한다 |
| 사전 로드 | 수강생용 실습을 **미리 로드하지 않으면 실습을 사용할 수 없다고 표시**된다 |
| 버튼 위치 | 실습 가이드·수강생 가이드 버튼은 AWS Builder Labs 대시보드의 **오른쪽 상단**에 있고, 강좌 시작 전에는 회색으로 비활성화되어 있다 |
| 가이드 저장소 | 가이드는 **eVantage Bookshelf(VitalSource)** 에 있다. 링크를 클릭하면 기존 계정에 로그인하거나 `Create an account` 를 선택하라는 메시지가 표시된다 |
| 사용 방식 | 온라인으로 액세스하거나 다운로드할 수 있다 |

### 6.3 가이드 배포처

| 항목 | 내용 |
|---|---|
| 배포 경로 | 교육 과정 참가자 가이드는 **eVantage Bookshelf(VitalSource)** 애플리케이션을 통해 제공된다 |
| 절차 | eVantage Bookshelf(VitalSource)로 이동 → 계정 생성 또는 기존 계정 로그인 → 강사가 제공한 코드로 강의용 가이드에 액세스 |
| 주소 | 참가자 가이드는 `https://evantage.gilmoreglobal.com/` 에서 받고, 접근 코드는 강사에게 요청한다 |
| 가이드 구성 | 실습이 없는 강의는 수강생 가이드만, 실습이 있는 강의는 수강생 가이드와 실습 가이드가 있다 |

**주의.** 이 경로는 실습이 없는 강의이거나, AWS Builder Labs 포털의 고유 URL을 쓰지 않고 기존 eVantage Bookshelf(VitalSource) 계정으로 로그인하는 경우에만 적용됩니다. **실습이 포함된 이 과정은 환영 이메일의 등록 URL을 쓰는 편이 낫습니다.**

eVantage Bookshelf(VitalSource)와 Gilmore Global은 AWS가 운영하는 도메인이 아니라서, 위 내용은 교재에 적힌 대로만 옮기고 출처를 붙이지 않았습니다([8.5절](#85-검증하지-못한-항목)).

### 6.4 AWS Builder Labs의 현재 위치 🔄

실습에 접근하는 경로(환영 이메일의 고유 등록 URL → AWS Builder Labs 대시보드)는 강의 때와 같습니다. 달라진 것은 **AWS가 AWS Builder Labs를 소개하는 자리**이고, 과정이 끝난 뒤에도 계속 쓸 수 있는 무료 실습이 생겼습니다.

| 항목 | 확인한 내용 |
|---|---|
| 소개 위치 | AWS Builder Labs는 AWS Skill Builder의 **몰입형 학습(immersive learning)** 경험 중 하나로 제시됩니다. `aws.amazon.com/training/digital/aws-builder-labs/` 로 들어가면 몰입형 학습 페이지로 이동합니다 |
| 규모 | AWS 콘솔 환경에서 단계별 지침으로 AWS 서비스를 배우는 **200개 이상**의 가이드형 대화식 실습 |
| 교재에 없는 기능 | 실습 문맥 안에서 질문에 답하고 코드를 설명해 주는 **AI 기반 Learning Assistant** |
| 같은 페이지의 다른 경험 | AWS Cloud Quest, AWS SimuLearn, AWS Industry Quest, Lab Maker, AWS Jam, Microcredentials |
| 무료 학습 계획 | `Introduction to AWS Cloud – AWS Builder Labs` 학습 계획에서 기초 수준 실습 10개가 무료로 제공됩니다(Amazon VPC, Amazon S3, Amazon EC2, AWS IAM, AWS KMS, 환경 기본 감사, Amazon DynamoDB, Amazon CloudFront, AWS Lambda, Amazon API Gateway) |

> — 출처: [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/)

> — 출처: [Begin your AWS journey with new free AWS Builder Labs learning plan on AWS Skill Builder](https://aws.amazon.com/blogs/training-and-certification/begin-your-aws-journey-with-new-free-aws-builder-labs-learning-plan-on-aws-skill-builder/)

---

## 7. 실습 요구 사항

실습 환경에 접속하기 위한 조건입니다.

| 구분 | 요구 사항 |
|---|---|
| 운영 체제 | Windows / macOS / Linux: Ubuntu, SUSE 또는 Red Hat |
| 권장 웹 브라우저 | Google Chrome / Mozilla Firefox / Microsoft Edge |
| 네트워크 | HTTPS를 사용하여 인터넷을 탐색할 수 있는 안정적인 인터넷 연결 |
| AWS Builder Labs 등록 | 광고 및 스크립트 차단 비활성화 |

특정 AWS 서비스의 지원 목록이 아니라 실습 환경 접속 조건이라서 AWS 공식 문서로 검증할 성질의 사실이 아닙니다. 그대로 옮기고 출처를 붙이지 않았습니다([8.5절](#85-검증하지-못한-항목)).

---

## 8. 교재 대비 변경 사항

교재를 함께 보다가 "책에는 이렇게 적혀 있는데" 싶은 지점이 생기면 이 장에서 확인하세요. 앞 장에서 신규·교정으로 표시한 항목의 근거를 모아 둔 곳입니다.

M01은 과정 운영 모듈이라 이 장이 얇습니다. 확인 결과 **이 모듈에서 지원이 종료된 항목은 없었습니다.** 대신 교재 내부에서 표기가 어긋나는 항목이 여섯 개 있고, 이들은 AWS 문서로 판별할 대상이 아니어서 근거 열을 비우고 [8.5절](#85-검증하지-못한-항목)로 넘겼습니다.

### 8.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| `Amazon APIGateway` (슬라이드 6·12 다이어그램) | 공백 없이 한 단어로 표기 | 문서상 정확한 이름은 **`Amazon API Gateway`** 입니다. 같은 교재의 슬라이드 10·11 다이어그램과 강사 노트는 올바르게 적고 있어 교재 안에서 표기가 엇갈립니다 | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| IAM 약어 (슬라이드 7 강사 노트) | `AWS Identity and Access Management(AWS IAM)` | 문서상 약어는 **`IAM`** 입니다. 슬라이드 6·7 다이어그램은 `(IAM)` 으로 올바르게 적고 슬라이드 7 강사 노트만 `(AWS IAM)` 으로 적습니다 | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| 모듈 이름 | 슬라이드 2 부제 `모듈 1: 과정 개요` vs 슬라이드 7 강사 노트 `모듈 1 - 과정 소개` | 어느 쪽이 맞는지는 문서로 판별할 대상이 아닌 교재 내부 불일치입니다. 이 문서는 슬라이드 2를 따랐습니다 | — ([8.5절](#85-검증하지-못한-항목)) |
| 실습 1 설명 (슬라이드 7 강사 노트) | 한국어 노트 중 이 한 줄만 영어 (`Configure and test IAM permissions in a development environment.`) | 번역 누락으로 보입니다. [4.1절](#41-1일-차-오전) 표에는 한국어로 옮겨 적었습니다 | — ([8.5절](#85-검증하지-못한-항목)) |
| 실습 2 (슬라이드 8) | 상자 제목은 `Amazon S3를 사용한 솔루션 개발`, 같은 슬라이드 강사 노트는 `빅 데이터 애플리케이션 워크로드에 적합한 AWS 솔루션 파악` | 하나의 실습을 서로 다르게 가리킵니다. 같은 슬라이드 다이어그램이 개발자 → AWS SDK → Amazon S3 흐름을 그려 **상자 제목 쪽**과 맞습니다. 다른 실습(3·4·6)은 제목과 노트가 대응합니다 | — ([8.5절](#85-검증하지-못한-항목)) |
| 어젠다 모듈 제목 (슬라이드 11) | `현대적 애플리케이션 구축` / `애플리케이션 사용자에게 액세스 권한 부여` | 개별 덱 표지는 `모던 애플리케이션(Modern Application) 구축` / `내 애플리케이션의 사용자에게 액세스 권한 부여하기` 입니다. 어젠다와 모듈 표지를 대조하면 드러나는 교재 내부 불일치입니다 | — ([8.5절](#85-검증하지-못한-항목)) |
| 실습 환경 접속 방법 (슬라이드 7) | 상자는 `Guacamole 또는 원격 데스크톱` 두 가지, 강사 노트는 `Guacamole, 원격 데스크톱 또는 브라우저 기반 옵션` 세 가지 | 같은 슬라이드 안에서 개수가 다릅니다. 실습 환경 운영 사항이고 Apache Guacamole은 AWS 운영 도메인의 문서 대상이 아니어서 어느 쪽이 현재 방법인지 확정할 수 없습니다 | — ([8.5절](#85-검증하지-못한-항목)) |
| 언어 목록 | 슬라이드 5는 `Python / .NET / Java`, 슬라이드 15는 `Java, Python, C#` | `.NET` 은 플랫폼, `C#` 은 그 플랫폼의 언어라서 표기 축이 다릅니다. 실습 IDE·SDK 선택과 직결되는 항목입니다 | — ([8.5절](#85-검증하지-못한-항목)) |

### 8.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 음성 모드 | "선택한 노트의 음성 버전을 선택한 음성 모드로 재생" (선택지 없음) | Amazon Polly의 음성 엔진은 **Generative · Long-form · Neural · Standard** 네 가지. Generative와 Long-form은 교재 이후 추가 | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |
| AWS Lambda의 범위 | Lambda를 함수 하나의 개념으로 제시 | 문서는 **Lambda Functions**와 **Lambda MicroVMs** 두 컴퓨팅 프리미티브를 제시. 이 과정의 실습은 Lambda Functions 경로 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| 선수 과정 페이지 위치 | 과정 이름만 제시 | `aws.amazon.com/training/classroom/<과정>/` 은 HTTP 200으로 응답하되 **AWS Skill Builder로 리다이렉트**됩니다. AWS Cloud Practitioner Essentials는 **13개 모듈**로 개편되었고 AWS Skill Builder·Coursera·edX에서 제공됩니다 | [Step into the cloud: The new AWS Cloud Practitioner Essentials is here!](https://aws.amazon.com/blogs/training-and-certification/new-aws-cloud-practitioner-essentials/) |
| AWS Builder Labs 소개 위치 | 강의 실습 포털로만 제시 | AWS Skill Builder의 **몰입형 학습** 경험 중 하나로 제시되며 200개 이상의 실습과 **AI 기반 Learning Assistant**가 함께 안내됩니다. 강의 실습 접근 경로 자체는 교재와 같습니다 | [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/) |
| AWS CloudFormation 표기 | `AWS CloudFormation` | 현재 문서의 제목과 본문은 접두사 없는 **`CloudFormation`** 을 씁니다. 두 표기 모두 통용되지만 문서 본문 표기는 이쪽입니다 | [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |

### 8.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS X-Ray 콘솔 (슬라이드 6·12 다이어그램, 실습 7) | **비권장.** 문서는 "AWS는 X-Ray 콘솔을 더 이상 개발하지 않는다"고 명시합니다. X-Ray 서비스 자체는 종료되지 않았습니다 | **Amazon CloudWatch 콘솔**의 `X-Ray traces` → `Trace Map`. 서비스 단위 관찰은 CloudWatch **Application Signals**. X-Ray Insights도 CloudWatch 콘솔의 Insights에 포함됩니다 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

지원이 **종료**된 항목은 이 모듈에 없습니다.

### 8.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| Amazon Polly의 Generative·Long-form 엔진 | 교재의 "음성 모드"가 가리키는 선택지가 네 가지(Generative·Long-form·Neural·Standard)로 늘었습니다. Neural TTS는 뉴스 내레이션용 Newscaster 말하기 스타일도 지원합니다 | [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html) |
| CloudWatch Application Signals | 애플리케이션 서비스·클라이언트·Synthetics canary·서비스 종속성을 검색·모니터링하고, SLO 기반 상태 지표에서 상관된 X-Ray 추적으로 내려갈 수 있습니다 | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Lambda MicroVMs | 거의 즉시 시작하고 최대 8시간까지 상태를 유지하는 격리된 컴퓨팅 환경. 개별 사용자·작업마다 전용 컴퓨팅 환경이 필요한 워크로드용입니다 | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| AWS SAM 커넥터·`sam sync` | AWS SAM 템플릿에서 리소스 간 권한을 정의하는 커넥터, 로컬 변경을 클라우드에 계속 동기화하는 `sam sync`, Terraform 서버리스 애플리케이션 지원 | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| AWS Builder Labs의 Learning Assistant | 실습 문맥 안에서 질문에 답하고 코드를 설명하는 AI 기반 도우미. 같은 페이지에 Lab Maker, AWS SimuLearn, AWS Jam, Microcredentials 등도 함께 제시됩니다 | [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/) |
| AWS Builder Labs 무료 학습 계획 | `Introduction to AWS Cloud – AWS Builder Labs` 학습 계획에서 기초 수준 실습 10개를 무료로 제공합니다. 구독하면 200개 Builder Labs, 200개 SimuLearn, 17개 Jam Journey 전체 카탈로그를 이용할 수 있습니다 | [Begin your AWS journey with new free AWS Builder Labs learning plan on AWS Skill Builder](https://aws.amazon.com/blogs/training-and-certification/begin-your-aws-journey-with-new-free-aws-builder-labs-learning-plan-on-aws-skill-builder/) |

### 8.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 강의실 과정 페이지의 본문 내용 | 세 과정 페이지(`developing-on-aws`, `aws-technical-essentials`, `aws-cloud-practitioner-essentials`)가 HTTP 200으로 응답하고 AWS Skill Builder로 리다이렉트된다는 것까지 확인했습니다. **페이지 본문은 클라이언트 렌더링이라 이 프로젝트의 조회 도구로 읽지 못했습니다.** 따라서 과정 일수·모듈 구성·현재 선수 과정 목록 같은 페이지 안의 값은 인용하지 않았습니다 |
| AWS Technical Essentials의 현재 구성 | 1일 강의실 과정·실습 6개·4시간 디지털 과정은 **2021년 6월 블로그 글**로 확인한 값입니다. 그 뒤 구성이 바뀌었는지는 확인하지 못했습니다. 과정 페이지가 살아 있다는 것만 별도로 확인했습니다 |
| `explore.skillbuilder.aws` 강사 가이드 (슬라이드 17 강사 노트) | 교재가 적어 둔 주소는 **강사 전용 내부 경로**입니다. 요청하면 응답은 오지만 Skill Builder가 해당 경로를 찾지 못했다는 표시와 함께 검색 페이지로 넘깁니다. 게다가 Skill Builder 도메인은 이 프로젝트의 인용 가능 도메인 목록에 없어 **근거로 쓸 수 없습니다.** FAQ와 동시 실습 한도는 강사가 직접 확인해야 합니다 |
| eVantage Bookshelf(VitalSource)·Gilmore Global (슬라이드 18~19) | 가이드 배포처는 AWS가 아닌 제3자가 운영합니다. 인용 가능 도메인이 아니어서 **교재가 기재한 대로만** 옮겼고 절차·주소가 현재도 같은지는 확인하지 못했습니다 |
| Apache Guacamole·원격 데스크톱·브라우저 기반 접속 (슬라이드 7) | 실습 환경 접속 방법은 강의 운영 사항이고 Guacamole도 AWS 운영 도메인의 문서 대상이 아닙니다. 슬라이드 상자(2가지)와 강사 노트(3가지)의 차이를 어느 쪽으로 정리해야 하는지 **확인하지 못했습니다** |
| 실습에 제공되는 세 가지 IDE (슬라이드 7 강사 노트) | 노트는 "실습에는 세 가지 IDE가 있으며 수강생은 선호도 또는 프로그래밍 언어에 따라 IDE를 선택할 수 있습니다"라고만 적고 **IDE 이름을 적지 않습니다.** 원문에 없는 이름을 이 문서에서 추측해 넣지 않았습니다 |
| 실습 요구 사항의 운영 체제·브라우저 목록 (슬라이드 20) | 특정 AWS 서비스의 지원 목록이 아니라 **실습 환경 접속 조건**입니다. AWS 공식 문서로 검증할 성질의 사실이 아니어서 그대로 옮겼습니다 |
| 교재 내부 표기 불일치 6건 | 모듈 이름, 실습 1 설명의 영어 한 줄, 실습 2 제목과 설명, 어젠다 모듈 제목, 접속 방법 개수, 언어 목록 축. 모두 **외부 문서로 검증할 대상이 아닌 교재 내부 문제**입니다. 어느 쪽을 따랐는지만 [8.1절](#81-교재-기술이-사실과-다른-항목)에 밝혔습니다 |
| 실습 1~7의 실제 절차 | 이 덱에는 실습 제목과 한 줄 목표만 있습니다. 절차는 실습 가이드에 있고 이 문서의 대상이 아닙니다 |
