# 모듈 14: 애플리케이션 관찰

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [관측가능성과 모니터링](#2-관측가능성과-모니터링)
3. [관측가능성의 3대 요소](#3-관측가능성의-3대-요소)
4. [Amazon CloudWatch](#4-amazon-cloudwatch)
5. [지표와 측정 기준](#5-지표와-측정-기준)
6. [경보](#6-경보)
7. [CloudWatch Logs](#7-cloudwatch-logs)
8. [애플리케이션 계측](#8-애플리케이션-계측)
9. [CloudWatch Application Insights](#9-cloudwatch-application-insights)
10. [AWS X-Ray](#10-aws-x-ray)
11. [X-Ray 주요 개념](#11-x-ray-주요-개념)
12. [트레이싱 활성화하기](#12-트레이싱-활성화하기)
13. [교재 대비 변경 사항](#13-교재-대비-변경-사항)
14. [지식 확인 및 핵심 정리](#14-지식-확인-및-핵심-정리)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [13장](#13-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 8월 25일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.
> - **이 모듈은 교재 이후 바뀐 것이 가장 많은 모듈입니다.** X-Ray SDK 와 데몬은 2026년 2월 25일 유지 관리 모드에 들어갔고, X-Ray 콘솔은 더 이상 개발되지 않으며, 서비스 맵은 CloudWatch 콘솔의 트레이스 맵으로 통합되었습니다. 덱의 계측 코드를 그대로 따라가면 지금 권장되지 않는 경로를 배우게 됩니다([13.3절](#133-비권장-및-지원-종료된-항목)).
> - 용어를 하나로 통일했습니다. `observability` 는 **관측가능성**, `metric` 은 **지표**, `dimension` 은 **측정 기준**, `alarm` 은 **경보**, `trace` 는 **트레이스**, `segment` 는 **세그먼트**, `subsegment` 는 **하위 세그먼트**, `sampling` 은 **샘플링**, `span` 은 **스팬**으로 씁니다. 교재가 같은 것을 서로 다르게 부르는 곳은 [13.1절](#131-교재-기술이-사실과-다른-항목)에 밝혔습니다.
> - 교재의 CLI 예시와 C# 예시는 **그대로 실을 수 없는 오류가 있어 교정해 실었습니다.** 무엇을 고쳤는지는 해당 절의 교정 표에 적었습니다.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- 모니터링과 관측가능성 구별
- 현대적 개발과 주요 구성 요소에 관측가능성이 필요한 이유 평가
- 관측가능성 구성에서 Amazon CloudWatch의 역할 이해
- CloudWatch Application Insights를 사용한 애플리케이션 모니터링 설명
- AWS X-Ray를 사용한 애플리케이션 디버깅 설명

슬라이드 3(모듈 목표)과 슬라이드 42(모듈 요약)가 같은 다섯 항목을 싣는데 첫 항목의 표기가
다릅니다. 이 문서는 슬라이드 3을 기준으로 통일했습니다([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 이 모듈에서 덱이 다루지 않는 것

두 번째 목표는 "**현대적** 개발"을 말하는데, 덱이 드는 도구는 CloudWatch와 X-Ray 둘뿐이고
그 안에서도 다루는 범위가 좁습니다. 강의에서 반드시 나오는 질문이 덱에 답이 없습니다.

| 덱에 없는 것 | 왜 문제인가 | 이 문서에서 다룬 위치 |
|---|---|---|
| 로그를 **조회·분석하는 방법** | 덱은 로그를 CloudWatch로 보내는 것까지만 다룹니다. 모아 놓고 읽는 방법이 없으면 관측가능성이 성립하지 않습니다 | [7.4절](#74-cloudwatch-logs-insights) |
| 로그 **보존 기간** | 로그 그룹이 "같은 보존 기간을 공유한다"고만 하고 기본값을 밝히지 않습니다. 기본값은 무기한이라 방치하면 계속 과금됩니다 | [7.3절](#73-보존-기간과-로그-클래스) |
| X-Ray **샘플링** | 트레이싱 비용과 부하를 좌우하는 핵심인데 덱에 한 줄도 없습니다 | [11.4절](#114-샘플링) |
| 트레이싱을 **켜는 설정** | 덱은 SDK 코드만 보여 주고, Lambda·API Gateway에서 트레이싱을 켜는 설정을 다루지 않습니다 | [12.1절](#121-트레이싱을-켜는-설정) |
| 사용자 지정 지표 **게시 방법** | 슬라이드 12에 "사용자 지정 데이터"가 나오지만 `PutMetricData` 언급이 없습니다 | [5.4절](#54-사용자-지정-지표-게시) |
| **대시보드** | 슬라이드 20 노트에 "CloudWatch 대시보드를 자동으로 생성"이라고만 나오고 대시보드 자체 설명이 없습니다 | [4.3절](#43-대시보드와-크로스-계정-관측가능성) |
| **현재 권장되는 계측 방법** | 덱은 X-Ray SDK를 유일한 경로로 제시합니다. 지금은 OpenTelemetry가 권장 경로입니다 | [12.3절](#123-opentelemetry-로의-전환) |

### 이 모듈의 위치

어젠다는 모듈 14 → 실습 7 → 모듈 15 순서입니다.

| 항목 | 내용 |
|---|---|
| 모듈 14 | 웹 애플리케이션 모니터링을 지원하는 AWS 서비스 파악 |
| 실습 7 | AWS 리소스를 사용하여 웹 애플리케이션 배포, 모니터링, 유지 관리 |
| 모듈 15 | 과정 요약 |

실습 애플리케이션은 이전 모듈과 같은 구성입니다. Amazon S3(웹 사이트 호스팅, MP3 호스팅),
Amazon API Gateway, AWS Lambda(List / Search / Delete / Create-Update / Dictate),
Amazon DynamoDB, Amazon Cognito, IAM, Amazon Polly, AWS SAM에 이번 모듈에서
Amazon CloudWatch와 AWS X-Ray가 더해집니다.

---

## 2. 관측가능성과 모니터링

### 2.1 무엇이 다른가

교재가 이 모듈에서 가장 강조하는 한 문장입니다.

> 모니터링을 사용하면 **문제의 존재**를 확인할 수 있습니다.
> 관측가능성을 사용하면 **문제의 이유**를 확인할 수 있습니다.

| 개념 | 정의 |
|---|---|
| 관측가능성 | 데이터를 관찰, 이해, 사용할 수 있도록 하는 **기능** |
| 모니터링 | 데이터를 표시하여 실시간으로 관찰할 수 있게 하는 **실제 작업** |

즉 모니터링은 관측가능성을 구성하는 활동 중 하나입니다. 모니터링을 어떻게 설정했는지에 따라
관찰 가능한 환경을 확보했는지가 결정됩니다. 가동 시간 보고서만으로 현대적 애플리케이션의
모든 서비스를 추적할 수는 없습니다.

### 2.2 네 가지 활동

| 활동 | 설명 |
|---|---|
| 수집 | 모든 AWS 리소스, 애플리케이션, 서비스의 지표와 로그를 수집합니다 |
| 모니터링 | 데이터를 표시하여 실시간으로 관찰할 수 있게 합니다 |
| 분석 | 시스템 상태를 이해하여 모니터링에 도움이 되는 컨텍스트를 제공합니다 |
| 조치 | 운영 변경 사항에 대한 응답을 자동화합니다 |

수집 → 모니터링 → 분석 → 조치가 강사 노트의 서술 순서입니다. 슬라이드 본문의 배치 순서는
조치와 분석이 뒤바뀌어 있습니다.

### 2.3 관측가능성 계획

계획에 포함할 요소를 교재는 네 가지로 정리합니다. 슬라이드 6과 7이 같은 본문을 반복하므로
여기서는 한 절로 합쳤습니다([13.1절](#131-교재-기술이-사실과-다른-항목)).

| 요소 | 설명 |
|---|---|
| 가시성 | 애플리케이션과 리소스가 작업을 수행하는 방법에 대한 가시성 |
| 실시간 문제 해결 | 코드 배포에서 진행 중인 일에 관한 인사이트를 주는 지표. 변경 사항의 영향을 확인하고 문제를 실시간으로 해결 |
| 고객 경험 | 고객에게 영향을 주기 전에 문제를 찾아 디버그 |
| 성능 | 애플리케이션 성능과 가동 시간은 비즈니스 수익과 직결 |

그리고 계획을 세우는 순환을 "지식 주기"로 그립니다.

| 입력 | 산출 |
|---|---|
| 인력 (요구 사항) | 데이터 |
| 시스템 아키텍처 (배경지식) | 정보 |
| 원격 측정 | 지식 |
| 인사이트 | 인사이트 |
| 작업 | 작업 |

정보에 근거하여 무엇을 어떻게 모니터링할지 결정하고, 모니터링 계획에서 작업과 인사이트를
캡처하고, 반복합니다.

> **주의.** 이 "지식 주기" 도식은 교재 고유의 그림입니다. AWS 공식 문서에서 같은 도식을
> 찾지 못했으므로 이 문서는 교재 내용을 옮기는 데 그치고, 공식 문서에 있는 것처럼
> 서술하지 않습니다([13.5절](#135-검증하지-못한-항목)).

### 2.4 관측가능성이 필요한 이유

잘 정의된 모니터링·관측가능성 전략이 있으면 다음을 할 수 있습니다.

- 시스템 전반의 성능 변화에 대응
- 리소스 활용도 최적화
- 운영 상태에 대한 통합 보기 확보

관찰 가능한 환경에서는 위험이 줄어들고 민첩성과 고객 경험은 개선됩니다.

---

## 3. 관측가능성의 3대 요소

### 3.1 세 요소와 담당 서비스

| 요소 | 정의 | 담당 |
|---|---|---|
| 지표(Metrics) | 시스템의 전반적인 성능과 동작을 분석하는 데 사용하는, 수치로 표현한 데이터 | CloudWatch 지표 |
| 로그(Logs) | 애플리케이션 내 이벤트의 레코드 | CloudWatch Logs |
| 트레이스(Traces) | 요청의 경로를 추적하여 병목 현상을 식별하고 성능 개선 | AWS X-Ray |

관측가능성은 세 가지를 각각 수집하는 데 그치지 않고 **서로 상관 관계를 파악**해야 성립합니다.
어떤 지표가 튀었을 때 같은 시각의 로그와 트레이스로 곧바로 넘어갈 수 있어야 원인을 찾습니다.

> **교재 내부 불일치.** 슬라이드 8과 9는 3대 요소를 `로깅 / 지표 / 트레이싱` 으로 쓰는데,
> 슬라이드 25(AWS X-Ray란?)의 같은 다이어그램은 `로깅 / 모니터링 / 트레이싱` 으로 씁니다.
> 슬라이드 38 지식 확인 2번의 정답 해설이 "지표, 트레이스 및 로그"라고 못박으므로
> 슬라이드 25가 틀린 쪽입니다([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 3.2 세 요소가 실제로 어떻게 이어지는가 🆕

교재는 세 요소를 별개 서비스에 1:1로 배정하고 끝냅니다. 현재 구조는 그렇게 나뉘어 있지
않습니다. 아래는 실제로 확인한 연결 지점입니다.

| 연결 | 무엇이 이어지는가 |
|---|---|
| 로그 → 지표 | 임베디드 지표 형식(EMF)으로 로그에 지표를 심으면 CloudWatch가 지표를 자동 추출합니다. 지표 필터로 로그에서 지표를 뽑을 수도 있습니다 |
| 로그 → 경보 | 로그 경보는 일정에 따라 실행되는 Logs Insights 쿼리 결과를 임계값과 비교합니다. 지표 필터를 만들지 않고도 로그에서 바로 경보를 걸 수 있습니다 |
| 트레이스 → 로그 | Transaction Search를 켜면 X-Ray로 보낸 스팬이 `aws/spans` 로그 그룹에 구조화된 로그로 들어갑니다 |
| 트레이스 → 지표 | X-Ray 그룹의 필터 표현식에 맞는 트레이스 수 지표가 1분마다 CloudWatch에 게시됩니다 |
| 셋 다 → 한 화면 | CloudWatch 콘솔에서 X-Ray 트레이스와 CloudWatch 로그·지표를 함께 봅니다 |

> — 출처: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

> — 출처: [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

> — 출처: [Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search.html)

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 4. Amazon CloudWatch

### 4.1 CloudWatch란

교재의 한 줄 정의는 **"CloudWatch는 데이터 포인트 리포지토리입니다"** 입니다. 지표를 받아
저장하고, 저장한 지표로 통계를 계산해 소비자에게 내주는 구조입니다.

| 구성 | 내용 |
|---|---|
| 생산자 | CloudWatch를 사용하는 AWS 리소스 + 사용자 지정 데이터 |
| 저장 | 지표 리포지토리 |
| 소비자 | AWS Management Console(그래프), CloudWatch 경보 → Auto Scaling · SNS 이메일 알림 |

Amazon EC2 같은 AWS 서비스가 지표를 리포지토리에 저장하고, 사용자는 그 지표를 기준으로
통계를 검색합니다. 사용자 지정 지표를 저장하면 그 지표에 대한 통계도 같은 방식으로 검색합니다.

### 4.2 경보로 할 수 있는 조치 🔄

교재는 조치 대상을 EC2 인스턴스 중지·시작·종료, EC2 Auto Scaling, Amazon SNS로 적습니다.
현재 목록은 더 넓고, **"시작"은 목록에 없습니다.**

| 대상 | ARN 형태 |
|---|---|
| EC2 작업 | `arn:aws:automate:region:ec2:stop` · `:terminate` · `:reboot` · `:recover` |
| Auto Scaling | 조정 정책 ARN |
| Lambda | 함수 ARN (최신 버전 · 특정 버전 · 별칭) |
| SNS 알림 | 주제 ARN |
| Systems Manager | OpsItem ARN · 대응 계획 ARN |
| Amazon Q Developer | 운영 조사 그룹 ARN |

경보 작업 배열은 최대 5개까지 지정할 수 있습니다. **EC2 인스턴스 "시작"은 유효 값이
아닙니다.** 중지된 인스턴스를 되살리는 작업은 `recover`(복구)이고 이는 하드웨어 장애 시
동일 인스턴스를 새 호스트로 복구하는 것으로, 교재가 말하는 "시작"과 다릅니다.

> — 출처: [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html)

### 4.3 대시보드와 크로스 계정 관측가능성 🆕

교재는 대시보드를 "Application Insights가 자동으로 만들어 준다"는 문맥에서 한 번 언급하고
넘어갑니다. 대시보드는 독립적인 기능입니다.

| 기능 | 내용 |
|---|---|
| 자동 대시보드 | CloudWatch가 사전 구축된 대시보드를 제공합니다 |
| 사용자 지정 대시보드 | 콘솔, AWS CLI, `PutDashboard` API로 만듭니다 |
| 여러 리전 | 서로 다른 리전에 흩어진 리소스를 한 화면에서 봅니다 |
| 필요 권한 | `cloudwatch:GetDashboard` · `ListDashboards`(보기), `PutDashboard`(생성·수정), `DeleteDashboards`(삭제) |

교재는 "지표는 생성된 리전에만 존재한다"까지만 말합니다. 그 제약을 넘는 방법이 있습니다.

**크로스 계정 관측가능성**을 설정하면 모니터링 계정에서 다음을 할 수 있습니다.

- 소스 계정의 지표를 검색·조회하고 그래프로 그립니다. 한 그래프에 여러 계정의 지표를 넣습니다
- 모니터링 계정에서 소스 계정의 지표를 감시하는 경보를 만듭니다
- 소스 계정 로그 그룹의 로그 이벤트를 보고 Logs Insights 쿼리를 실행합니다. 한 쿼리로 여러
  계정의 여러 로그 그룹을 동시에 조회합니다
- X-Ray 트레이스 맵에서 소스 계정의 노드를 봅니다

모니터링 계정에 로그인하면 이 기능을 지원하는 모든 페이지 오른쪽 위에 파란
**Monitoring account** 배지가 표시됩니다.

> — 출처: [Using Amazon CloudWatch dashboards](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)

---

## 5. 지표와 측정 기준

### 5.1 지표

| 항목 | 내용 |
|---|---|
| 정의 | CloudWatch에 게시된 시간 순서별 데이터 포인트 집합 |
| 고유 식별 | 이름 + 네임스페이스 + 0개 이상의 측정 기준 |
| 리전 범위 | 지표는 **생성된 리전에만** 존재합니다 |
| 삭제 | 지표는 삭제할 수 없습니다. 새 데이터가 게시되지 않으면 15개월 후 자동 만료됩니다 |
| 데이터 포인트 | 각 데이터 포인트에 타임스탬프가 있고 측정 단위는 선택 사항입니다 |

지표는 "모니터링할 변수", 데이터 포인트는 "시간에 따른 그 변수의 값"으로 생각하면 됩니다.

**타임스탬프 제약** 🆕 — 데이터 포인트의 타임스탬프는 최대 2주 과거, 최대 2시간 미래까지
허용됩니다. 타임스탬프를 주지 않으면 CloudWatch가 수신 시각으로 만듭니다. 경보는 현재 UTC
시각을 기준으로 지표를 확인하므로, 현재 UTC와 다른 타임스탬프로 사용자 지정 지표를 보내면
경보가 `INSUFFICIENT_DATA` 로 표시되거나 지연될 수 있습니다.

> — 출처: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.2 보존 기간과 해상도 🆕

덱에 없는 내용인데 실무에서 가장 먼저 부딪히는 지점입니다. 지표 보존 기간은 **기간(period)마다
다릅니다.**

| 데이터 포인트의 기간 | 보존 |
|---|---|
| 60초 미만 (고해상도 사용자 지정 지표) | 3시간 |
| 60초 (1분) | 15일 |
| 300초 (5분) | 63일 |
| 3600초 (1시간) | 455일 (15개월) |

짧은 기간으로 수집한 데이터는 장기 보관을 위해 집계됩니다. 1분 단위로 모은 데이터는 15일간
1분 해상도로 남고, 그 뒤에는 5분 해상도로만 조회할 수 있으며, 63일 뒤에는 1시간 해상도가
됩니다. **원본 해상도가 영구히 남지 않습니다.**

| 해상도 | 세분성 | 비고 |
|---|---|---|
| 표준 | 1분 | AWS 서비스 지표의 기본값 |
| 고해상도 | 1초 | 사용자 지정 지표에서 선택. `PutMetricData` 호출마다 과금되므로 비용이 올라갑니다 |

고해상도 지표에 경보를 걸면 기간을 10초 또는 30초로 지정할 수 있고, 이 경우 요금이 더 높습니다.

기간(period)의 유효 값은 1, 5, 10, 30 또는 60의 배수이고 기본값은 60초입니다.

> — 출처: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.3 네임스페이스와 측정 기준

지표는 **먼저 네임스페이스별로** 묶이고, 그다음 각 네임스페이스 안에서 **측정 기준 조합별로**
묶입니다. 교재는 DynamoDB 지표가 `Table Metrics` 와 `GlobalSecondaryIndex` 로 나뉘는 예를 듭니다.

| 항목 | 내용 |
|---|---|
| 네임스페이스 | CloudWatch 지표의 컨테이너. 서로 다른 네임스페이스의 지표는 격리됩니다 |
| 기본값 | **없습니다.** 게시하는 데이터 포인트마다 지정해야 합니다 |
| 이름 규칙 | 유효한 ASCII 문자 255자 이내. 영숫자와 `.` `-` `_` `/` `#` `:` 공백 |
| AWS 규칙 | `AWS/service` 형태. Amazon EC2 는 `AWS/EC2`, DynamoDB 는 `AWS/DynamoDB` |
| 측정 기준 | 지표 자격 증명의 일부인 이름/값 쌍. **지표당 최대 30개** |

**측정 기준 조합이 곧 별개의 지표입니다.** CloudWatch는 측정 기준의 고유한 조합 각각을 다른
지표로 취급합니다. 이름이 같아도 조합이 다르면 다른 지표입니다. 그래서 통계를 조회할 때는
**게시할 때 쓴 조합 그대로** 지정해야 합니다.

예를 들어 `DataCenterMetric` 네임스페이스에 `ServerStats` 를 다음 네 조합으로 게시했다면,

```text
Server=Prod, Domain=Frankfurt
Server=Beta, Domain=Frankfurt
Server=Prod, Domain=Rio
Server=Beta, Domain=Rio
```

이 네 조합으로만 통계를 조회할 수 있습니다. `Server=Prod` 만으로도, `Domain=Rio` 만으로도,
측정 기준 없이도 조회할 수 없습니다. 다만 지표 math 의 `SEARCH` 함수는 예외입니다.

Amazon EC2 같은 일부 AWS 서비스 지표에 대해서는 CloudWatch가 측정 기준을 넘어 데이터를
집계해 줍니다. **사용자 지정 지표에는 이 집계를 해 주지 않습니다.**

> — 출처: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.4 사용자 지정 지표 게시 🆕

슬라이드 12에 "사용자 지정 데이터"가 화살표로 등장하지만 게시 방법이 덱에 없습니다.

```bash
# 단일 데이터 포인트 게시
aws cloudwatch put-metric-data \
  --metric-name PageViewCount \
  --namespace MyService \
  --value 2 \
  --timestamp 2026-08-25T12:00:00.000Z

# 측정 기준을 붙여 게시 (put-metric-data 는 Name=Value 형식)
aws cloudwatch put-metric-data \
  --metric-name Buffers \
  --namespace MyNameSpace \
  --unit Bytes \
  --value 231434333 \
  --dimensions InstanceId=1-23456789,InstanceType=m1.small
```

**측정 기준 표기 형식이 명령마다 다릅니다.** 이 차이를 모르면 반드시 한 번 걸립니다.

| 명령 | 형식 | 여러 개일 때 |
|---|---|---|
| `put-metric-data` | `Name=Value` | 쉼표로 구분 |
| `get-metric-statistics` · `put-metric-alarm` | `Name=MyName,Value=MyValue` | 공백으로 구분 |

```bash
# get-metric-statistics 는 Name=...,Value=... 형식이고 측정 기준 사이는 공백
aws cloudwatch get-metric-statistics \
  --metric-name Buffers \
  --namespace MyNameSpace \
  --dimensions Name=InstanceId,Value=1-23456789 Name=InstanceType,Value=m1.small \
  --start-time 2026-08-24T04:00:00Z \
  --end-time 2026-08-25T07:00:00Z \
  --statistics Average \
  --period 60
```

**호출 횟수를 줄이려면 통계 세트로 집계해 보냅니다.** 3초 안에 데이터 포인트 3개가 생기면
세 번 호출하지 않고 한 번에 보냅니다.

```bash
# 통계 세트로 집계 게시
aws cloudwatch put-metric-data \
  --metric-name PageViewCount \
  --namespace MyService \
  --statistic-values Sum=11,Minimum=2,Maximum=5,SampleCount=3 \
  --timestamp 2026-08-25T12:00:00.000Z
```

다만 통계 세트로 게시하면 **백분위수 통계를 조회할 수 없습니다.** CloudWatch가 백분위수를
계산하려면 원시 데이터 포인트가 필요하기 때문입니다. 예외는 `SampleCount` 가 1인 경우와
`Minimum` 과 `Maximum` 이 같은 경우입니다.

주의할 지연이 있습니다.

| 동작 | 지연 |
|---|---|
| `get-metric-statistics` 로 통계 조회 가능 | 최대 2분 |
| `list-metrics` 목록에 등장 | 최대 15분 |

데이터가 없는 기간에 값 `0` 을 보낼지 아무것도 보내지 않을지는 선택입니다. `PutMetricData`
주기 호출로 애플리케이션 상태를 감시한다면 **0을 보내는 편이 낫습니다.** 그러면 "5분마다
지표를 게시하지 못하면 알린다"는 경보를 걸 수 있습니다.

> — 출처: [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)

### 5.5 OpenTelemetry 지표 🆕

CloudWatch는 OTLP로 전송된 OpenTelemetry 지표를 지원합니다. **기존 CloudWatch 지표와 데이터
모델이 다릅니다.** 교재는 이 모델을 다루지 않습니다.

| 개념 | 기존 CloudWatch 지표 | OpenTelemetry 지표 |
|---|---|---|
| 식별 | 네임스페이스 + 지표 이름 + 측정 기준 최대 30개 | 지표 이름 + 레이블 최대 150개 |
| 지표 유형 | 단일 값, 통계 세트 | gauge, sum, histogram, exponential histogram |
| 수집 | `PutMetricData` API 또는 AWS CLI | OpenTelemetry Protocol (OTLP) |
| 쿼리 | `GetMetricStatistics`, Metrics Insights | Prometheus Query Language (PromQL) |
| 경보 | 표준 CloudWatch 경보 | PromQL 기반 CloudWatch 경보 |
| 콘솔 | CloudWatch Metrics 콘솔 | CloudWatch Query Studio |
| 보존 | 최대 15개월 (자동 롤업) | 최대 15개월 |

**새로 구현하는 사용자 지정 지표에는 OpenTelemetry 사용이 권장됩니다.** `PutMetricData`
문서가 직접 그렇게 안내합니다.

> — 출처: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

> — 출처: [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)

---

## 6. 경보

### 6.1 교재의 경보 시나리오

교재는 임계값 3, 최소 위반 3개 기간인 경보를 그림으로 설명합니다.

| 기간 | 값 | 상태 |
|---|---|---|
| 1~2 | 임계값 이내 | `OK` |
| 3~5 | 연속 3개 기간 위반 | `ALARM` — 작업 호출 |
| 6 | 임계값 아래로 복귀 | `OK` |
| 9 | 다시 위반하지만 1개 기간뿐 | `OK` 유지 |

슬라이드 라벨로 정리하면 "기간 하나만 임계값을 초과했습니다. 작업이 호출되지 않습니다."와
"3개 기간이 임계값을 초과하여 작업이 호출되었습니다."입니다.

### 6.2 실제 평가 방식은 M out of N 입니다 🔄

교재는 "**연속** 기간 3개"라고만 설명합니다. 실제 동작은 그것보다 유연하고, 이 차이를 모르면
경보를 잘못 설계합니다.

| 파라미터 | 의미 |
|---|---|
| Evaluation Periods (N) | 임계값과 비교하는 기간의 수 |
| Datapoints to Alarm (M) | 경보를 발생시키기 위해 위반해야 하는 데이터 포인트 수 |

M이 N보다 작으면 **"N개 중 M개" 경보**가 되고, 위반이 연속이 아니어도 경보가 발생합니다.
교재의 시나리오는 M과 N이 모두 3인 특수한 경우일 뿐입니다.

여기에 두 가지가 더 있습니다.

**첫째, 평가 범위가 N보다 넓습니다.** 경보가 상태를 평가할 때 CloudWatch는 N보다 많은
데이터 포인트를 가져오려 시도합니다. 이 범위를 **평가 범위(evaluation range)** 라고 합니다.
누락 데이터가 있을 때를 대비해 더 과거 데이터를 확보하는 것입니다. 실제 데이터 포인트가
N개 이상 확보되면 **누락 데이터 처리 설정은 무시됩니다.**

**둘째, 조급한 경보 전환을 막는 논리가 있습니다.** 최근 데이터가 `- - - - X` (누락 4개 뒤
위반 1개)라면, 다음 데이터가 정상일 수 있으므로 곧바로 `ALARM` 으로 가지 않습니다. 반대로
`- - X - -` 처럼 **가장 오래된 위반 데이터 포인트가 M 값만큼 오래되었고 그보다 최근이 모두
위반 또는 누락**이면, 확보한 데이터 포인트 수가 M보다 적어도 `ALARM` 으로 갑니다.

> — 출처: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

### 6.3 누락 데이터 처리 🆕

경보는 항상 `OK`, `ALARM`, `INSUFFICIENT_DATA` 세 상태 중 하나입니다. 그리고 각 데이터
포인트는 임계값 이내, 위반, 누락 셋 중 하나로 분류됩니다.

| 옵션 | 누락 데이터를 어떻게 보는가 |
|---|---|
| `notBreaching` | 정상으로 봅니다 (임계값 이내) |
| `breaching` | 위반으로 봅니다 |
| `ignore` | 현재 경보 상태를 유지합니다 |
| `missing` | 평가 범위의 데이터가 모두 누락이면 `INSUFFICIENT_DATA` 로 갑니다 |

**기본 동작은 `missing` 입니다.** 교재의 CLI 예시가 `--treat-missing-data missing` 을 명시하는데,
이는 기본값이므로 생략해도 동작이 같습니다.

선택 기준은 지표의 성질입니다.

- 데이터를 계속 보고하는 지표로 배포 롤백 경보를 만든다면 → 누락은 이상 신호이므로 `breaching`
- 오류가 있을 때만 데이터가 생기는 지표(예: DynamoDB `ThrottledRequests`) → `notBreaching`

두 가지 예외를 알아 둘 만합니다.

- **`AWS/DynamoDB` 네임스페이스** 지표를 평가하는 경보는 누락 데이터를 `ignore` 로 처리하는 것이
  기본입니다. 다른 값을 선택해 덮어쓸 수 있습니다.
- **EC2 지표 경보**는 인스턴스가 정상인데도 지표 보고가 끊겨 드물게 `INSUFFICIENT_DATA` 로
  갈 수 있습니다. stop·terminate·reboot·recover 작업을 하는 EC2 경보는 누락 데이터를
  `missing` 으로 처리하고 `ALARM` 상태에서만 작업하도록 구성하는 것이 권장됩니다.

> — 출처: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

### 6.4 경보의 종류 🔄

교재는 "경보는 지정된 기간 동안 **단일 지표**를 관찰한다"고 씁니다(슬라이드 13, 슬라이드 38
지식 확인 5번). 현재는 종류가 넷입니다.

| 종류 | 감시 대상 |
|---|---|
| 지표 경보 | 단일 CloudWatch 지표 **또는 지표 math 표현식의 결과** |
| PromQL 경보 | CloudWatch OTLP 엔드포인트로 수집한 지표에 대한 PromQL 인스턴트 쿼리 |
| 로그 경보 | 일정에 따라 실행되는 CloudWatch Logs Insights 쿼리 결과 |
| 복합 경보 | 다른 경보들의 상태를 조합하는 규칙 표현식 |

**복합 경보**는 알람 노이즈를 줄이는 데 씁니다. 지표 경보를 여러 개 만들고 복합 경보 하나에만
알림을 붙이면, 모든 하위 경보가 `ALARM` 일 때만 사람을 부릅니다. 다만 복합 경보는
**EC2 작업과 Auto Scaling 작업을 할 수 없습니다.** SNS 알림, 조사 생성, Systems Manager
OpsItem·인시던트 생성은 됩니다.

**로그 경보**는 지표 필터를 만들지 않고도 로그 데이터에서 직접 패턴·오류·임계값 위반을 잡습니다.
최근 쿼리 실행 결과에 M out of N 평가를 적용합니다.

몇 가지 운영상 사실도 알아 둘 만합니다.

| 항목 | 내용 |
|---|---|
| 경보 개수 | 계정에서 만들 수 있는 경보 수에 **제한이 없습니다** |
| 경보 이력 | 30일간 보존됩니다 |
| 작업 호출 시점 | 경보는 **상태가 바뀔 때만** 작업을 호출합니다. 예외는 Auto Scaling 작업으로, 새 상태를 유지하는 동안 1분에 한 번씩 계속 호출합니다 |
| 최대 평가 기간 | 기간이 1시간(3600초) 이상인 경보는 7일, 그보다 짧으면 1일 |
| 평가 창 | 슬라이딩 창(기본)과 월 클럭 창을 선택할 수 있습니다 |

**슬라이딩 창과 월 클럭 창** 🆕 — 슬라이딩 창은 경보를 평가할 때마다 앞으로 밀리는 롤링
시간 창입니다. 월 클럭 창은 정시나 하루 시작 같은 고정 경계에 정렬되고, 더 과거 데이터를
추가로 조회하지 않습니다(즉 6.2절의 넓은 평가 범위가 적용되지 않습니다).

> — 출처: [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

> **교재의 참고 링크가 깨졌습니다.** 슬라이드 15 강사 노트는
> `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` 을 제시하는데,
> 현재 경로는 `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html` 입니다
> ([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 6.5 CLI로 경보 만들기 🔄

교재 슬라이드 17~19에 실린 `put-metric-alarm` 예시는 **그대로 실행할 수 없습니다.** 이 문서는
교정한 명령을 싣고, 무엇을 고쳤는지 아래 표에 밝힙니다.

먼저 교재가 실은 명령입니다(원문 그대로, 실행하지 마세요).

```text
>> aws cloudwatch put-metric-alarm --alarm-name NotesWriteCapacityUnitsLimit
   --metric-name ConsumedReadCapacityUnits --namespace AWS/DynamoDB --statistic Sum
   --period 60 --treat-missing-data missing --datapoints-to-alarm 5
   --alarm-actions arn:aws:cloudwatch:us-east-2:111122223333:alarm:Notes-WriteCapacityUnitsLimit-BasicAlarm
--dimensions "Name=InstanceId,Value=i-12345678"
```

| # | 교재 | 확인된 내용 |
|---|---|---|
| 1 | 경보 이름은 `WriteCapacityUnits` 인데 지표는 `ConsumedReadCapacityUnits`(읽기) | 쓰기 용량 경보라면 지표는 `ConsumedWriteCapacityUnits` 입니다. 두 지표는 별개로 존재합니다 |
| 2 | 네임스페이스는 `AWS/DynamoDB` 인데 측정 기준은 `Name=InstanceId,...` | DynamoDB 측정 기준은 `TableName`, `GlobalSecondaryIndexName`, `Operation`, `OperationType`, `Verb`, `ReceivingRegion`, `Source`, `StreamLabel`, `DelegatedOperation` 입니다. `InstanceId` 는 없습니다 |
| 3 | `--alarm-actions` 값이 CloudWatch **경보** ARN | 유효 값은 EC2 작업, Auto Scaling 정책, Lambda 함수, SNS 주제, Systems Manager OpsItem·대응 계획, Amazon Q Developer 운영 조사 ARN 입니다. 경보 ARN 은 유효 값이 아닙니다 |
| 4 | `--datapoints-to-alarm 5` 만 있고 `--evaluation-periods` 가 없음 | M만 주고 N을 주지 않으면 평가 동작이 정의되지 않습니다 |
| 5 | `--threshold` 와 `--comparison-operator` 가 없음 | 무엇을 위반으로 볼지 정의되지 않습니다 |
| 6 | `--dimensions` 절이 별도 줄에 있고 줄 연결 문자가 없음 | 그대로 붙여 넣으면 두 개의 명령으로 실행되어 측정 기준이 유실됩니다 |

교정한 명령입니다.

```bash
# Notes 테이블의 쓰기 용량 소비가 5분 연속 임계값을 넘으면 SNS 주제로 알립니다.
# --datapoints-to-alarm(M)과 --evaluation-periods(N)가 같으므로 5개 연속 위반이 조건입니다.
aws cloudwatch put-metric-alarm \
  --alarm-name Notes-WriteCapacityUnitsLimit \
  --alarm-description "Notes 테이블 쓰기 용량 소비 임계값 초과" \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=Notes \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 5 \
  --datapoints-to-alarm 5 \
  --threshold 240 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:us-east-2:111122223333:notes-ops-alerts
```

`--threshold 240` 은 예시 값입니다. 실제 값은 프로비저닝한 쓰기 용량 단위와 `--period` 에 맞춰
정해야 합니다. `Sum` 통계로 60초 기간을 쓰면 임계값은 "60초 동안 소비한 총 쓰기 용량 단위"가
됩니다.

`--treat-missing-data` 를 `notBreaching` 으로 바꾼 이유는 6.3절에 있습니다. `AWS/DynamoDB`
지표는 트래픽이 없으면 데이터가 생기지 않을 수 있어서, 누락을 위반으로 보면 안 됩니다.

| 파라미터 | API 스펙상 필수 여부 |
|---|---|
| `AlarmName` | **필수** |
| `MetricName` / `Metrics` 배열 / `EvaluationCriteria` | **셋 중 하나는 반드시** 지정 |
| `ComparisonOperator`, `EvaluationPeriods`, `Threshold`, `DatapointsToAlarm` | 스펙상 `Required: No` 이지만, 지표 경보를 의미 있게 만들려면 실질적으로 필요 |

`ComparisonOperator` 의 유효 값은 `GreaterThanOrEqualToThreshold`, `GreaterThanThreshold`,
`LessThanThreshold`, `LessThanOrEqualToThreshold` 이고, 이상 탐지 모델 기반 경보에는
`LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`,
`GreaterThanUpperThreshold` 를 씁니다.

경보를 새로 만들면 상태가 즉시 `INSUFFICIENT_DATA` 로 설정되고(PromQL 경보는 `OK`) 그다음
평가되어 상태가 정해집니다. **기존 경보를 업데이트하면 상태는 유지되지만 구성은 전체가
덮어써집니다.** 일부만 바꾸는 것이 아닙니다.

> — 출처: [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html)

> — 출처: [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html)

---

## 7. CloudWatch Logs

### 7.1 핵심 개념

| 개념 | 내용 |
|---|---|
| 로그 이벤트 | 애플리케이션이나 리소스가 기록한 활동 레코드. 발생 시각 타임스탬프와 원시 메시지 두 속성으로 이루어집니다. 메시지는 UTF-8 이어야 합니다 |
| 로그 스트림 | 같은 소스에서 나온 로그 이벤트의 시퀀스. 보통 애플리케이션 인스턴스 하나나 리소스 하나에 대응합니다 |
| 로그 그룹 | 같은 **보존 기간, 모니터링, 액세스 제어 설정**을 공유하는 로그 스트림의 그룹 |
| 지표 필터 | 수집된 이벤트에서 지표 관측값을 추출해 CloudWatch 지표의 데이터 포인트로 변환합니다. 로그 그룹에 할당되고 그 그룹의 모든 스트림에 적용됩니다 |

각 로그 스트림은 **하나의 로그 그룹에 속해야** 합니다. 호스트별 Apache 액세스 로그 스트림을
`MyWebsite.com/Apache/access_log` 라는 하나의 로그 그룹으로 묶는 식입니다.
**하나의 로그 그룹에 속할 수 있는 로그 스트림의 수에는 제한이 없습니다.**

> — 출처: [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

### 7.2 로그를 보내는 방법

| 방법 | 내용 |
|---|---|
| 자동 수집 | CloudWatch Logs는 여러 AWS 서비스에서 로그 이벤트를 자동으로 받습니다 |
| CloudWatch 에이전트 | 통합 에이전트가 지표와 로그를 함께 보냅니다 |
| AWS CLI | `aws logs put-log-events` 로 로그 이벤트 배치를 업로드합니다 |
| API | `PutLogEvents` API 로 프로그래밍 방식으로 배치를 업로드합니다 |

**정형 로그와 비정형 로그 모두 지원됩니다.** 교재가 드는 예시입니다.

비정형:

```text
ERROR 2026-08-25 05:40:16 - Error processing notification
```

정형(JSON):

```json
{
  "level": "Error",
  "message": "Error processing notification",
  "timestamp": "1591940416",
  "context": {
    "userId": "StudentA",
    "type": "Lambda.Handler",
    "env": "dev",
    "component": "api",
    "correlationId": "41e556-9e5-4c37-856e-3b623be",
    "threadId": 16,
    "member": "ProcessNotification",
    "sourceFile": "Lambda/Handler.cs",
    "exception": "<exception details>"
  }
}
```

**정형 로그를 쓰는 실질적 이유가 있습니다.** CloudWatch Logs Insights는 JSON 으로 로그
이벤트를 내보내는 애플리케이션·사용자 지정 로그에서 **로그 필드를 자동으로 검색**합니다.
비정형 로그는 이 혜택을 받지 못합니다. `correlationId` 같은 필드를 넣어 두면 나중에 한
요청에 얽힌 로그를 전부 모아 볼 수 있습니다.

> — 출처: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

> — 출처: [Analyzing log data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

> **용어 교정.** 슬라이드 16은 log4net, Log4j, NLog, Serilog 를 "지원되는 로깅 **프로토콜**"이라
> 적습니다. 이들은 프로토콜이 아니라 로깅 프레임워크·라이브러리입니다
> ([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 7.3 보존 기간과 로그 클래스 🆕

교재는 로그 그룹이 "같은 보존 기간을 공유한다"고만 말하고 기본값을 밝히지 않습니다. **기본값은
무기한(Never Expire)입니다.** 방치하면 로그가 계속 쌓이고 계속 과금됩니다. 실습 계정에서
가장 흔한 비용 누수 지점입니다.

| 항목 | 내용 |
|---|---|
| 기본 보존 | 무기한. 로그 그룹별로 설정하고 언제든 변경할 수 있습니다 |
| 삭제 지연 | 보존 기간에 도달해도 즉시 삭제되지 않습니다. 보통 **최대 72시간**, 드물게 더 걸립니다 |
| 삭제 표시 | 보존 기간에 도달한 이벤트는 삭제 표시되고, 그 시점부터 보관 스토리지 비용이 발생하지 않습니다. `storedBytes` 에도 포함되지 않습니다 |

보존 기간을 **늘리는** 경우 함정이 하나 있습니다. 만료일이 지났지만 아직 실제로 삭제되지 않은
이벤트가 있는 로그 그룹의 보존 기간을 늘리면, 그 이벤트들은 **새 만료일에 도달한 뒤 다시 최대
72시간**이 지나서야 삭제됩니다. 데이터를 확실히 지우려면 이전 보존 기간이 끝난 뒤 72시간이
지날 때까지 낮은 보존 설정을 유지하거나, 오래된 이벤트가 삭제된 것을 확인해야 합니다.

**로그 클래스**가 두 가지 있습니다.

| 클래스 | 용도 |
|---|---|
| Standard | 실시간 모니터링이 필요하거나 자주 조회하는 로그. 완전 기능 |
| Infrequent Access | 조회 빈도가 낮은 로그. 저비용이지만 **Standard 기능의 일부만** 지원 |

**삭제 보호**도 걸 수 있습니다. 로그 그룹에 삭제 보호를 켜면 명시적으로 해제할 때까지 모든
삭제 작업이 차단됩니다. 기본적으로 켜져 있지 않습니다. 감사 데이터나 프로덕션 애플리케이션
로그처럼 잃으면 안 되는 로그 그룹에 씁니다.

> — 출처: [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

> — 출처: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

### 7.4 CloudWatch Logs Insights 🆕

**덱에서 가장 큰 공백입니다.** 교재는 로그를 CloudWatch로 보내는 것까지만 다루고, 모아 놓은
로그를 조회·분석하는 방법을 한 줄도 다루지 않습니다. 로그를 읽지 못하면 관측가능성의 세 요소
중 하나가 비어 있는 것과 같습니다.

**쿼리 언어가 세 가지입니다.**

| 언어 | 특징 |
|---|---|
| Logs Insights QL | 전용 언어. 명령 수는 적지만 강력합니다 |
| OpenSearch Service PPL | 파이프(`\|`)로 명령을 이어 붙입니다. 필터·집계와 수학·문자열·날짜·조건 함수를 지원합니다 |
| OpenSearch Service SQL | `SELECT` / `FROM` / `WHERE` / `GROUP BY` / `HAVING` 등. 로그 그룹 간 `JOIN`, 하위 쿼리로 상관 분석이 가능합니다 |

SQL·PPL 을 쓸 때는 영숫자가 아닌 문자가 든 필드를 백틱으로 감싸야 합니다. `@message`,
`Operation.Export`, `Test::Field` 는 감싸야 하고 순수 영문 이름은 감싸지 않아도 됩니다.

**주요 기능**입니다.

| 기능 | 내용 |
|---|---|
| 필드 자동 검색 | Route 53, Lambda, CloudTrail, VPC 같은 AWS 서비스 로그와 JSON 으로 이벤트를 내보내는 모든 로그에서 필드를 자동 인식합니다 |
| 필드 인덱스 | 자주 쓰는 필드를 인덱싱하면 그 필드가 없는 이벤트를 건너뛰어 스캔량과 비용이 줄어듭니다. `filterIndex` 명령은 Logs Insights QL 에서만 됩니다 |
| 패턴 분석 | 반복되는 텍스트 구조를 찾아 **Patterns** 탭에 보여 줍니다 |
| 자연어 쿼리 생성 | 찾고 싶은 것을 말로 설명하면 쿼리를 만들고 줄 단위로 설명해 줍니다 |
| 주변 로그 보기 | 특정 레코드 전후 5·10·20·50·100줄을 보고 그 안에서 키워드를 검색합니다 |
| 쿼리 저장·이력 | 저장, 재실행, 파라미터화된 저장 쿼리를 지원합니다 |
| 대시보드 추가 | 쿼리를 대시보드에 붙일 수 있습니다 |
| 결과 암호화 | AWS KMS 로 쿼리 결과를 암호화합니다 |
| 비교 쿼리 | 이전 기간의 로그 이벤트와 비교합니다. Logs Insights QL 에서만 됩니다 |

**제약**을 알아 두어야 합니다.

| 항목 | 값 |
|---|---|
| 동시 쿼리 (Logs Insights QL) | 계정당 100개. 대시보드에 붙인 쿼리도 포함됩니다 |
| 동시 쿼리 (OpenSearch PPL / SQL) | 15개 |
| 쿼리 시간 초과 | 60분 |
| 결과 보존 | 7일 |
| 검색 가능 시점 | 2018년 11월 5일 이후 CloudWatch Logs 에 전송된 데이터 |
| 로그 그룹 생성 시각 | 로그 그룹 생성 시각보다 이전 타임스탬프의 이벤트는 접근할 수 없습니다 |
| 과금 | 쿼리 언어와 무관하게 **스캔한 비압축 로그 데이터 양**에 따라 과금됩니다 |

과금이 스캔량 기준이라는 점이 중요합니다. 필드 인덱스와 좁은 시간 범위가 비용을 직접 줄입니다.

웹 소켓이 차단된 환경에서는 콘솔의 Logs Insights 화면에 접근할 수 없습니다. 이 경우
`StartQuery` API 로 같은 기능을 씁니다.

> — 출처: [Analyzing log data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

### 7.5 로그에서 지표 만들기: EMF 🆕

교재는 정형 JSON 로그 예시를 싣지만, 그 로그를 **지표로 바꾸는 방법**은 다루지 않습니다.
CloudWatch **임베디드 지표 형식(EMF, embedded metric format)** 이 그 일을 합니다.

| 항목 | 내용 |
|---|---|
| 무엇을 하는가 | CloudWatch Logs 에 기록되는 로그 형태로 사용자 지정 지표를 **비동기** 생성합니다. CloudWatch가 지표를 자동 추출해 시각화·경보에 쓸 수 있게 합니다 |
| 왜 유용한가 | Lambda 함수나 컨테이너처럼 **임시(ephemeral) 리소스**에서 별도 계측 코드를 유지하지 않고 사용자 지정 지표를 만들 수 있습니다 |
| 설정 | 필요 없습니다. EMF 규격에 맞게 로그를 구조화하거나 클라이언트 라이브러리로 생성해 `PutLogEvents` 또는 CloudWatch 에이전트로 보냅니다 |
| 필요 권한 | `logs:PutLogEvents` 만 있으면 됩니다. `cloudwatch:PutMetricData` 는 **필요하지 않습니다** |
| 부가 이점 | 추출된 지표에 연결된 상세 로그 이벤트를 Logs Insights 로 조회해 원인까지 파고들 수 있습니다 |
| 과금 | 로그 수집·보관 요금과 생성된 사용자 지정 지표 요금이 함께 발생합니다 |
| 전달 보장 | 최소 한 번(at least once) 전달을 보장합니다. 지표 값이 간헐적으로 중복될 수 있습니다 |

**카디널리티 함정을 반드시 알아야 합니다.** EMF는 설계상 **고유한 측정 기준 조합마다 사용자
지정 지표를 하나씩 만듭니다.** `requestId` 처럼 값이 거의 매번 다른 필드를 측정 기준으로
넣으면 지표가 요청 수만큼 생성되어 청구서가 폭발합니다. 측정 기준으로 넣을 필드는 값의 종류가
제한된 것만 골라야 합니다.

> — 출처: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

### 7.6 애플리케이션 로그를 보내는 .NET 패키지

교재 슬라이드 16 강사 노트가 드는 NuGet 패키지입니다. 대기열에 있는 로깅 메시지를 일괄
처리하고 백그라운드 스레드로 CloudWatch Logs 에 보냅니다.

| 패키지 | 용도 |
|---|---|
| `AWSSDK.CloudWatchLogs` | CloudWatch Logs SDK |
| `AWS.Logger.Core` | 공통 코어 |
| `AWS.Logger.NLog` | NLog 연동 |
| `AWS.Logger.Log4net` | log4net 연동 |
| `AWS.Logger.SeriLog` | Serilog 연동 |
| `AWS.Logger.AspNetCore` | ASP.NET Core 연동 |
| `Amazon.Lambda.Logging.AspNetCore` | Lambda 용 |

> **Lambda 에서는 백그라운드 스레드 로깅을 쓰지 마세요.** 교재가 남긴 이 경고에는 근거가
> 있습니다. Lambda 는 런타임과 모든 확장이 완료되고 대기 중인 이벤트가 없으면
> **실행 환경을 동결(freeze)** 합니다. 백그라운드 스레드도 함께 멈추므로 큐에 남은 로그가
> 전달되지 않습니다. 다음 이벤트가 한동안 오지 않으면 동결이 풀리지 않습니다.
> 교재의 권장은 `ILambdaContext.Logger.LogLine` 이나 `Amazon.Lambda.Logging.AspNetCore` 입니다.
>
> — 출처: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 7.7 Lambda 로깅은 이제 설정으로 합니다 🔄

교재는 정형 로그를 애플리케이션이 직접 만들어야 하는 것으로 다룹니다. 지금은 **함수 설정으로**
형식과 수준을 정할 수 있습니다.

| 설정 | 값 |
|---|---|
| 로그 형식 | 일반 텍스트 또는 **구조화된 JSON** |
| 로그 수준 | JSON 구조화 로그에서 `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` |
| 로그 그룹 | 함수가 로그를 보낼 CloudWatch 로그 그룹을 선택 |

**로그 대상도 늘었습니다.** 교재는 CloudWatch Logs 하나만 전제합니다.

| 대상 | 언제 쓰는가 |
|---|---|
| CloudWatch Logs (기본) | 실시간 조회·처리·알림. Logs Insights 와 Live Tail 이 기본 통합됩니다 |
| Amazon S3 | 장기 보관에 가장 경제적입니다. Athena 등으로 분석합니다. 지연 시간은 보통 더 깁니다 |
| Firehose | OpenSearch Service, Redshift Data API 나 Datadog · New Relic · Splunk 같은 외부 플랫폼으로의 스트리밍을 사전 통합으로 단순화합니다. 사용자 지정 HTTP 엔드포인트로도 보냅니다 |

Firehose 비용은 스트리밍 서비스 요금과 전송 대상 비용이 함께 듭니다.

> — 출처: [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html)

---

## 8. 애플리케이션 계측

슬라이드 17·18·19는 같은 내용을 애니메이션으로 3장에 나눈 것이고 강사 노트가 없습니다. 이
문서는 한 절로 합쳤습니다([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 8.1 계측 경로

| 경로 | 대상 |
|---|---|
| SDK | 애플리케이션 코드에서 직접 호출 |
| CloudWatch 에이전트 | 서버·컨테이너에 설치 |
| AWS CLI | 터미널·스크립트에서 호출 |

교재가 드는 SDK 목록은 Python(Boto3), .NET, Ruby, JavaScript, Go, Java, Node.js, C++, PHP
아홉 개입니다.

### 8.2 CloudWatch 에이전트 🔄

교재는 에이전트의 대상을 Amazon EC2 와 온프레미스 서버 두 가지로 적고, 용도를 지표·로그로
한정합니다. 현재는 범위가 넓습니다.

| 항목 | 내용 |
|---|---|
| 수집 대상 | 지표, 로그, **트레이스** |
| 실행 위치 | Amazon EC2 인스턴스, 온프레미스 서버, **컨테이너화된 애플리케이션** |
| OS 수준 지표 | EC2 인스턴스의 게스트 내부 지표까지 수집합니다 |
| 사용자 지정 지표 | `StatsD`(Linux · Windows Server)와 `collectd`(Linux 만) 프로토콜로 가져옵니다 |
| 기본 네임스페이스 | `CWAgent`. 다른 네임스페이스를 지정할 수 있습니다 |
| 과금 | 에이전트가 수집한 지표는 **사용자 지정 지표**로 과금됩니다 |
| 지표 대상 | CloudWatch, Amazon Managed Service for Prometheus 또는 양쪽 모두. 구성 파일의 `metrics_destinations` 에 `cloudwatch`, `amp` 또는 둘 다 지정합니다 |
| 라이선스 | MIT 라이선스 오픈 소스입니다 |

**트레이스 수집이 중요한 변화입니다.** 버전 1.300025.0 이상은 OpenTelemetry 또는 X-Ray
클라이언트 SDK 에서 트레이스를 수집해 X-Ray 로 보냅니다. **별도의 트레이스 수집 데몬을 실행할
필요가 없어서** 관리할 에이전트 수가 줄어듭니다. 즉 CloudWatch 에이전트가 X-Ray 데몬의 역할을
대신합니다([12.3절](#123-opentelemetry-로의-전환)).

버전 1.300031.0 이상은 CloudWatch Application Signals 를 켜는 데 쓸 수 있습니다.

설치 흐름은 다음 네 단계입니다.

1. 에이전트가 서버에서 지표를 수집하고 필요하면 AWS Systems Manager 와 통합할 수 있게 IAM
   역할 또는 사용자를 만듭니다
2. 에이전트 패키지를 내려받습니다
3. 구성 파일을 수정해 수집할 지표를 지정합니다
4. 서버에 에이전트를 설치하고 시작합니다

> — 출처: [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)

---

## 9. CloudWatch Application Insights

### 9.1 무엇을 하는가

| 기능 | 내용 |
|---|---|
| 애플리케이션 검색 | 애플리케이션을 추가하면 안의 리소스를 **스캔**합니다 |
| 지능형 문제 감지 | 이력 데이터로 지표 패턴을 분석해 이상을 감지하고, 애플리케이션·운영체제·인프라 로그에서 오류와 예외를 지속적으로 탐지합니다 |
| 알림 및 작업 | 관찰 결과를 상관 분석해 **자동 대시보드**를 만들고 문제 심각도를 보여 줍니다 |

스캔 후에는 애플리케이션 구성 요소에 대한 CloudWatch 지표와 로그를 **추천하고 구성**합니다.
구성 요소의 예로 문서는 SQL Server 백엔드 데이터베이스와 Microsoft IIS · 웹 계층을 듭니다.

관찰 결과를 상관 분석하는 데 분류 알고리즘과 기본 제공 규칙을 함께 씁니다. SageMaker 등
AWS 기술로 구동됩니다.

**MTTR 을 줄이는 것이 목적입니다.** 문서가 직접 이렇게 표현합니다. Application Insights 가
제공하는 애플리케이션 상태 가시성은 문제 해결의 **평균 수리 시간(MTTR, mean time to repair)**
을 줄이는 데 도움이 됩니다.

AWS Systems Manager OpsCenter 와 기본 통합되어, 감지된 문제에 대해 관련 Systems Manager
Automation 문서를 실행해 해결할 수 있습니다.

> — 출처: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

### 9.2 흔한 문제 목록은 교재와 다릅니다 🔄

교재 슬라이드 21은 흔한 결함 패턴으로 네 항목만 적고 설명이 없습니다.

| 교재가 드는 항목 |
|---|
| 무한 루프 |
| 다운스트림 속도 저하 |
| 잘못된 API 버전 |
| 트리거 확인 |

문서가 "추가 인사이트로 근본 원인 후보와 해결 단계를 제시한다"고 드는 문제는 다음입니다.
**교재 목록과 겹치지 않습니다.**

| 확인된 항목 | 스택 |
|---|---|
| 애플리케이션 지연 시간 | .NET · SQL |
| SQL Server 백업 실패 | SQL |
| 메모리 누수 | .NET |
| 대용량 HTTP 요청 | .NET |
| 취소된 I/O 작업 | .NET |

> — 출처: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

### 9.3 무한 루프는 이제 Lambda 가 막아 줍니다 🆕

슬라이드 21의 다이어그램은 S3 버킷 → 이미지 크기 조정 Lambda → 같은 버킷에 로그 업로드 →
다시 트리거되는 순환을 그립니다. 교재는 이것을 "흔한 결함 패턴"으로 제시하고 방어 장치를
다루지 않습니다. **지금은 Lambda 에 기본 방어 장치가 있습니다.**

| 항목 | 내용 |
|---|---|
| 기본 동작 | Lambda 가 재귀 루프를 감지하면 **함수 호출을 중단하고 알립니다** |
| 감지 기준 | 같은 요청 체인(chain of requests)에서 함수가 약 **16번** 호출되면 다음 호출을 중단합니다 |
| 켜는 방법 | 모든 고객에게 **기본으로 켜져 있고 요금이 없습니다** |
| X-Ray 필요 여부 | X-Ray 액티브 트레이싱을 켤 필요가 **없습니다** |
| 동작 원리 | X-Ray **트레이싱 헤더**를 씁니다. 지원 서비스가 Lambda 에 이벤트를 보내면 메타데이터가 자동 주석 처리되고, 함수가 지원 SDK 버전으로 다른 지원 서비스에 이벤트를 쓸 때 이 메타데이터가 갱신됩니다. 메타데이터에는 이벤트가 함수를 호출한 횟수가 담깁니다 |

**감지 범위에 한계가 있습니다.** 감지되는 것은 Lambda 함수, Amazon SQS, Amazon S3,
Amazon SNS 사이의 루프와 Lambda 함수만으로 이루어진 루프입니다. **DynamoDB 처럼 다른 서비스가
루프에 끼면 감지하지 못합니다.** 그래서 문서는 CloudWatch 경보로 Lambda 동시성·호출 급증 같은
비정상 사용 패턴을 알리도록 구성하고, 청구 경보나 AWS Cost Anomaly Detection 을 함께 쓸 것을
권장합니다.

의도적으로 재귀 패턴을 쓴다면 동작을 바꿀 수 있습니다. SAM 템플릿에서는 함수의
`RecursiveLoop` 속성을 씁니다.

```yaml
Resources:
  ResizeImageFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: python3.13
      # Terminate: 재귀 루프를 감지하면 호출을 중단하고 알립니다 (기본 동작)
      # Allow: 감지해도 아무 조치를 하지 않습니다. 의도한 재귀 패턴일 때만 씁니다
      RecursiveLoop: Terminate
```

> — 출처: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 9.4 데모에서 무엇을 보는가

슬라이드 23의 데모 노트입니다.

| 단계 | 내용 |
|---|---|
| 준비 | AWS Docs 에서 샘플 애플리케이션 확보 |
| 1 | 애플리케이션 관련 서비스의 리소스 그룹화 |
| 2 | CloudWatch Application Insights 실행 |
| 3 | 일부 오류 유발 |
| 4 | CloudWatch 에서 대시보드, 경보, 지표, 인사이트 확인 |

---

## 10. AWS X-Ray

### 10.1 X-Ray란

| 기능 | 내용 |
|---|---|
| 요청 데이터 수집 | 애플리케이션이 처리하는 요청에 대한 데이터를 수집합니다 |
| 확인·필터링 도구 제공 | 데이터를 보고 필터링하고 인사이트를 얻어 문제와 최적화 기회를 찾습니다 |
| 요청 트레이싱 | 트레이싱된 요청의 요청·응답 세부 정보와, 애플리케이션이 다운스트림 AWS 리소스·마이크로서비스·데이터베이스·웹 API 에 실행한 호출 세부 정보를 봅니다 |

교재가 드는 사용 사례입니다.

- 분산 애플리케이션 분석 및 디버그
- 성능 문제 및 오류의 근본 원인 파악 및 해결
- 애플리케이션 트레이싱 시작 및 종료
- 타사 또는 외부 서비스

X-Ray 는 애플리케이션이 보낸 트레이스와, 이미 X-Ray 와 통합된 AWS 서비스가 보낸 트레이스를
함께 받습니다. 계측 시나리오 대부분은 **구성 변경만으로** 됩니다. 예를 들어 Java
애플리케이션의 모든 수신 HTTP 요청과 AWS 서비스로의 다운스트림 호출을 계측할 수 있습니다.

> — 출처: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

### 10.2 작동 방식

교재가 그리는 경로는 `클라이언트 → X-Ray 데몬 → X-Ray API → X-Ray 콘솔` 이고, `AWS CLI` 와
`SDK` 가 API 로 이어집니다. 문서로 확인한 세부는 다음과 같습니다.

| 단계 | 내용 |
|---|---|
| SDK → 데몬 | 각 클라이언트 SDK 는 X-Ray 로 직접 보내지 않고, **UDP 트래픽을 수신하는 데몬 프로세스**에 JSON 세그먼트 문서를 보냅니다 |
| 데몬 → X-Ray | 데몬이 세그먼트를 큐에 **버퍼링**했다가 **배치로** 업로드합니다 |
| 데몬 제공 범위 | Linux, Windows, macOS 용으로 제공되고 AWS Elastic Beanstalk 와 AWS Lambda 플랫폼에 포함되어 있습니다 |
| 통합 서비스 | X-Ray 와 통합된 AWS 서비스는 수신 요청에 트레이싱 헤더를 추가하거나, 트레이스 데이터를 X-Ray 로 보내거나, X-Ray 데몬을 실행합니다 |

> — 출처: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

> **X-Ray 데몬은 지금 권장 경로가 아닙니다.** 데몬은 X-Ray SDK 와 같은 유지 관리 일정을
> 따르고, 문서는 CloudWatch 에이전트 또는 OpenTelemetry Collector 로 마이그레이션할 것을
> 안내합니다([12.3절](#123-opentelemetry-로의-전환)).

### 10.3 트레이스 맵 🔄

교재는 이 도식을 일관되게 **서비스 맵**이라 부릅니다. 현재 문서는 **트레이스 맵(trace map)** 을
씁니다. 그리고 이름만 바뀐 것이 아니라 **위치가 바뀌었습니다.**

| 항목 | 확인된 내용 |
|---|---|
| 이름 | X-Ray 개요 문서가 이 도식을 트레이스 맵이라 부릅니다 |
| 통합 | X-Ray 서비스 맵과 CloudWatch ServiceLens 맵이 **CloudWatch 콘솔의 X-Ray 트레이스 맵으로 통합**되었습니다 |
| 여는 경로 | CloudWatch 콘솔 왼쪽 탐색 창의 **X-Ray traces** 아래 **Trace Map** |

트레이스 맵은 클라이언트, 프런트엔드 서비스, 그리고 프런트엔드가 요청을 처리하고 데이터를
유지하기 위해 호출하는 백엔드 서비스를 보여 줍니다. 성능을 개선하려면 이 맵으로 병목 현상,
대기 시간 스파이크, 그 밖의 문제를 파악합니다.

**서비스 그래프와 서비스 맵의 관계**를 정리하면 이렇습니다. 서비스 그래프는 애플리케이션을
구성하는 서비스와 리소스 정보를 담은 **JSON 문서**이고, 콘솔이 그것을 시각화한 것이 맵입니다.
서비스 그래프 데이터는 **30일간** 보존됩니다.

분산 애플리케이션에서는 같은 트레이스 ID 로 요청을 처리한 모든 서비스의 노드를 하나의 서비스
그래프로 합칩니다.

> — 출처: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 10.4 노드 색상과 오류 분류

교재는 색상을 네 가지로 정리합니다.

| 색상 | 교재의 표기 |
|---|---|
| 녹색 | 성공적인 호출 |
| 빨간색 | 서버 장애 (500 시리즈 오류) |
| 노란색 | 클라이언트 오류 (400 시리즈 오류) |
| 보라색 | 제한 오류 (429 요청 과다) |

X-Ray 문서의 오류 분류는 다음과 같습니다. 교재의 색상 대응은 이 분류와 일치합니다.

| 분류 | 내용 |
|---|---|
| `Error` | 클라이언트 오류 (400 시리즈) |
| `Fault` | 서버 결함 (500 시리즈) |
| `Throttle` | 제한 오류 (429 Too Many Requests) |

예외가 발생하면 X-Ray SDK 가 스택 트레이스를 포함한 예외 세부 정보를 기록합니다.

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> **표기 오류.** 슬라이드 30 강사 노트는 "성공한 호출과 오류 및 **결합**의 비율"이라고 씁니다.
> 문맥상 **결함(fault)** 의 오타입니다([13.1절](#131-교재-기술이-사실과-다른-항목)).

### 10.5 X-Ray 콘솔은 더 이상 개발되지 않습니다 🔄

이 모듈에서 가장 중요한 변화입니다. 교재는 슬라이드 26과 슬라이드 36에서 X-Ray 콘솔을 트레이스
확인 창구로 제시합니다.

문서의 서술은 명확합니다. **AWS 는 X-Ray 콘솔을 더 이상 개발하지 않습니다.** CloudWatch 콘솔에
X-Ray 콘솔에서 재설계된 새 X-Ray 기능이 들어 있고, X-Ray 콘솔의 **모든 기능을 포함**합니다.

| 콘솔 | 상태와 특징 |
|---|---|
| Amazon CloudWatch 콘솔 | 재설계된 X-Ray 기능 + X-Ray 트레이스와 CloudWatch 로그·지표를 **한 화면에서** 봅니다. 네트워크·인프라 모니터링과 X-Ray 콘솔의 모든 기능 포함 |
| X-Ray 콘솔 | 더 단순한 경험을 원하거나 애플리케이션 코드를 바꾸고 싶지 않을 때 여전히 쓸 수 있습니다. **다만 더 이상 개발되지 않습니다** |

X-Ray Insights(애플리케이션 성능 이상을 자동 감지하고 근본 원인을 찾는 기능)는 CloudWatch
콘솔의 **Insights** 에 포함됩니다.

그리고 CloudWatch 에는 **Application Signals** 가 추가되어 서비스, 클라이언트, Synthetics
카나리, 서비스 종속성을 검색·모니터링합니다. SLO 기반 상태 지표를 보고, 상관된 X-Ray 트레이스로
드릴다운할 수 있습니다.

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

### 10.6 CloudWatch 로 넓어진 관측가능성 기능 🆕

교재의 도구 목록은 CloudWatch 와 X-Ray 둘뿐입니다. 모듈 목표 2가 "현대적 개발"을 말하므로,
현재 이 영역에 무엇이 있는지 확인한 범위에서 정리합니다.

**Application Signals**

| 항목 | 내용 |
|---|---|
| 무엇을 하는가 | EC2, ECS, Lambda 등에서 실행되는 애플리케이션의 지표와 트레이스를 자동 수집하고, 호출량·가용성·지연 시간·결함·오류 같은 핵심 지표를 **코드 작성이나 대시보드 구성 없이** 표시합니다 |
| SLO / SLI | 서비스 수준 목표(SLO)를 만들고 서비스 수준 지표(SLI) 상태를 서비스 목록과 토폴로지 맵에서 추적합니다. SLO 를 감시하는 경보도 만듭니다 |
| 애플리케이션 맵 | 자동으로 발견한 애플리케이션 토폴로지를 시각화해 애플리케이션·종속성·연결 관계를 보여 줍니다 |
| 지원 언어 | Java, Python, Node.js, .NET |
| 지원 플랫폼 | Amazon EKS, Amazon ECS, Amazon EC2 에서 지원·테스트됩니다. EKS 클러스터에서는 서비스·클러스터 이름을 자동 발견하고, 다른 아키텍처에서는 이름을 직접 지정해야 합니다 |
| 지원 리전 | Canada West(Calgary)를 제외한 모든 상용 리전 |
| 연동 | CloudWatch RUM, CloudWatch Synthetics 카나리, AWS Service Catalog AppRegistry, Amazon EC2 Auto Scaling |

**Transaction Search**

| 항목 | 내용 |
|---|---|
| 무엇을 하는가 | 애플리케이션 트랜잭션 **스팬**을 완전히 볼 수 있게 하는 대화식 분석 기능입니다 |
| 스팬이란 | 분산 트레이스의 기본 단위. 시작·종료 시각, 지속 시간, 그리고 고객 ID·주문 ID 같은 비즈니스 속성을 포함할 수 있는 메타데이터를 기록합니다. 스팬은 상위-하위 계층으로 배열되어 전체 트레이스를 이룹니다 |
| 스팬 100% 수집 | 스팬 전부를 구조화된 로그로 CloudWatch 에 수집해 트레이스가 끊기는 것을 막고, 최대 **10,000개** 스팬을 포함하는 큰 트레이스를 볼 수 있습니다 |
| 저장 위치 | X-Ray 로 보낸 스팬이 `aws/spans` 라는 로그 그룹에 수집됩니다. X-Ray 트레이스는 저장 전에 시맨틱 컨벤션 형식으로 자동 변환됩니다 |
| 인덱싱 | 스팬의 일부는 X-Ray 에서 **트레이스 요약**으로 인덱싱되어 종단 간 트레이스 검색과 분석에 쓰입니다 |
| CloudWatch Logs 기능 활용 | 지표 필터로 사용자 지정 지표를 뽑고, 구독 필터로 데이터를 전달하고, 데이터 마스킹으로 개인 식별 정보를 보호합니다 |

Transaction Search 를 켜면 CloudWatch 가 그 스팬으로 Application Signals 에서 애플리케이션
성능 모니터링(APM) 경험을 만들어 줍니다. X-Ray 로 트레이스를 보내고 있다면 콘솔이나 API 로
켜면 되고, 보내고 있지 않다면 Application Signals 가 제공하는 사전 구성된 OpenTelemetry
설정(ADOT, CloudWatch 에이전트)이나 OpenTelemetry 를 직접 씁니다.

> — 출처: [Application Signals](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Monitoring-Sections.html)

> — 출처: [Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search.html)

---

## 11. X-Ray 주요 개념

### 11.1 트레이스, 세그먼트, 하위 세그먼트

교재는 `listFunction` 의 트레이스를 예로 구조를 보여 줍니다.

```text
최종 사용자
  └─ API/PROD                     세그먼트  (Stage: Prod  GET  invoke: listFunction)
       └─ AWS::Lambda
            └─ listFunction       세그먼트  (초기화 / 호출)
                 └─ List          하위 세그먼트
                      └─ Notes 테이블   쿼리: Notes
```

| 개념 | 정의 |
|---|---|
| 트레이스 | 단일 요청이 생성한 **모든 세그먼트를 수집**합니다. 이 요청은 대부분 로드 밸런서를 통과하는 HTTP GET 또는 POST 요청입니다 |
| 세그먼트 | 애플리케이션 로직을 실행하는 컴퓨팅 리소스가 작업 데이터를 보낸 것. 리소스 이름, 요청 세부 정보, 수행한 작업 세부 정보를 제공합니다 |
| 하위 세그먼트 | 애플리케이션이 원래 요청을 이행하기 위해 만든 **다운스트림 호출**의 더 세분화된 타이밍 정보와 세부 정보 |

세그먼트가 기록할 수 있는 데이터입니다.

| 항목 | 내용 |
|---|---|
| 호스트 | 호스트 이름, 별명 또는 IP 주소 |
| 요청 | 메서드, 클라이언트 주소, 경로, 사용자 에이전트 |
| 응답 | 상태, 콘텐츠 |
| 수행한 작업 | 시작 및 종료 시간, 하위 세그먼트 |
| 발생한 문제 | 예외 스택 자동 캡처를 포함한 오류, 결함, 예외 |

하위 세그먼트에는 AWS 서비스, 외부 HTTP API, SQL 데이터베이스 호출 정보가 담길 수 있고,
**임의의 하위 세그먼트**를 정의해 특정 함수나 코드 줄을 계측할 수도 있습니다.

**세그먼트 문서는 최대 64 kB 입니다.** 🆕 트레이스 데이터는 **30일간** 보존됩니다.

**전달된 요청의 클라이언트 IP** 🆕 — 로드 밸런서나 다른 중개자가 요청을 전달하면 X-Ray 는
IP 패킷의 소스 IP 대신 `X-Forwarded-For` 헤더의 클라이언트 IP 를 기록합니다. 이 값은
**위조될 수 있으므로 신뢰해서는 안 됩니다.**

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.2 추론된 세그먼트 🆕

교재의 다이어그램에는 DynamoDB `Notes 테이블` 노드가 있습니다. 그런데 **DynamoDB 는 자체
세그먼트를 보내지 않습니다.** 그 노드가 어떻게 생기는지 교재는 설명하지 않습니다.

| 상황 | 무엇이 생기는가 |
|---|---|
| 다운스트림이 트레이싱을 지원하지 않음 (예: DynamoDB) | X-Ray 가 상위의 하위 세그먼트로 **추론된 세그먼트(inferred segment)** 와 트레이스 맵의 다운스트림 노드를 만듭니다 |
| 다운스트림도 계측되어 있음 | 그 서비스가 보낸 세그먼트가 추론된 세그먼트를 **대체**합니다 |

노드는 항상 그 서비스 자신의 세그먼트 정보를 쓰고(있는 경우), 두 노드 사이의 **엣지**는 상위
서비스의 하위 세그먼트 정보를 씁니다. 두 관점이 모두 유용합니다. 다운스트림 서비스는 요청
처리를 언제 시작하고 끝냈는지 정확히 기록하고, 상위 서비스는 두 서비스 사이를 이동한 시간까지
포함한 왕복 지연 시간을 기록합니다.

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.3 Annotations 와 메타데이터

교재가 싣는 예시입니다.

```json
{
  "annotations": {
    "UserId": "student"
  }
}
```

```json
{
  "metadata": {
    "default": {
      "extended_request_id": "FZplbGUGiYcFvyA=",
      "request_id": "49ab-45ad-40cd-acd-1b5526"
    }
  }
}
```

| 항목 | 인덱싱 | 용도 |
|---|---|---|
| Annotations | **됩니다** | 필터 표현식에 씁니다. 콘솔에서 트레이스를 그룹화할 때나 `GetTraceSummaries` API 를 호출할 때 쓸 데이터를 기록합니다 |
| 메타데이터 | 안 됩니다 | 객체와 목록을 포함한 임의 타입의 값을 담을 수 있습니다. 트레이스에 저장하되 **검색에는 쓰지 않을** 데이터를 기록합니다 |

**X-Ray 는 트레이스당 최대 50개의 주석을 인덱싱합니다.** 교재의 이 수치는 현재도 맞습니다.

주석과 메타데이터는 트레이스 수준에서 집계되고, 어떤 세그먼트나 하위 세그먼트에도 붙일 수
있습니다. **CloudWatch 콘솔**의 트레이스 세부 정보 페이지에서 세그먼트·하위 세그먼트 세부 정보
창에서 봅니다.

**필터 표현식과 그룹** 🆕 — 샘플링을 해도 복잡한 애플리케이션은 데이터가 많습니다. 필터
표현식으로 특정 경로나 사용자에 관련된 트레이스를 찾습니다. 필터 표현식으로 **그룹**을 정의하면
그룹별 서비스 그래프, 트레이스 요약, CloudWatch 지표를 만들 수 있고, 조건에 맞는 트레이스 수
지표가 **1분마다** CloudWatch 에 게시됩니다.

그룹에는 주의점이 두 가지 있습니다.

- 그룹의 필터 표현식을 수정해도 **이미 기록된 데이터는 바뀌지 않습니다.** 이후 트레이스에만
  적용되므로 새 표현식과 옛 표현식이 섞인 그래프가 나올 수 있습니다. 피하려면 그룹을 지우고
  새로 만듭니다.
- 그룹은 필터 표현식에 일치해 **조회된 트레이스 수**로 과금됩니다.

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.4 샘플링 🆕

**덱에 한 줄도 없는데 트레이싱 비용과 부하를 좌우하는 핵심입니다.**

X-Ray SDK 는 샘플링 알고리즘으로 어떤 요청을 트레이싱할지 결정합니다. 기본값은 다음과 같습니다.

| 항목 | 기본값 | 의미 |
|---|---|---|
| 예비량(reservoir) | 초당 1건 | 고정 비율을 적용하기 전에 **초당 계측할 일치 요청 수**. 서비스가 요청을 받는 동안 최소 한 개의 트레이스가 기록되도록 보장합니다 |
| 비율(rate) | 5% | 예비량이 소진된 뒤 계측할 일치 요청의 비율 |

시작 단계에서 요금이 발생하지 않도록 기본 샘플링 비율은 보수적으로 잡혀 있습니다. 기본 규칙을
수정하고 서비스·요청의 속성에 따라 적용되는 추가 규칙을 만들 수 있습니다. 예를 들어 상태를
변경하거나 사용자·트랜잭션을 다루는 호출은 샘플링을 끄고 전부 트레이싱하고, 백그라운드 폴링·
상태 확인·연결 유지 같은 대량 읽기 전용 호출은 낮은 비율로 샘플링합니다.

**규칙 옵션**입니다. 문자열 값에는 와일드카드 `?`(한 문자)와 `*`(0개 이상)를 쓸 수 있습니다.

| 옵션 | 내용 |
|---|---|
| 규칙 이름 | 고유한 이름 |
| 우선순위 | 1~9999. 서비스는 우선순위 **오름차순**으로 규칙을 평가하고 **처음 일치한 규칙**으로 샘플링 결정을 내립니다 |
| 예비량 | 음이 아닌 정수. 규칙을 쓰는 모든 서비스에 **집합적으로** 적용됩니다 |
| 비율 | 콘솔에서는 0~100 의 백분율, 클라이언트 SDK 의 JSON 문서에서는 0~1 의 값 |
| 서비스 이름 | 트레이스 맵에 나타나는 계측된 서비스 이름. API Gateway 는 `api-name/stage` |
| 서비스 유형 | `AWS::EC2::Instance`, `AWS::ECS::Container`, `AWS::EKS::Container`, `AWS::ElasticBeanstalk::Environment`, `AWS::APIGateway::Stage`, `AWS::AppSync::GraphQLAPI`, `AWS::StepFunctions::StateMachine` 등 |

**샘플링은 상위 기반(parent-based)입니다.** 이 성질을 모르면 규칙을 만들어도 적용되지 않는
이유를 알 수 없습니다.

- 샘플링 결정은 보통 요청을 처음 처리하는 X-Ray 활성 서비스(루트 서비스)가 **한 번만** 내립니다
- 다운스트림 서비스는 상위에서 내려온 결정이 있으면 **자기 규칙이 일치해도 그 결정을 따릅니다**
- 따라서 사용자 규칙은 아직 샘플링 결정이 내려지지 않은 서비스에서만 효력이 있습니다. 보통
  애플리케이션 진입점(API Gateway, 로드 밸런서, 첫 계측 마이크로서비스)이나 새 트레이스를
  시작하는 비동기 프로세스·워커입니다
- **흔한 함정**: "서비스 B"에 엄격한 규칙을 만들어도 서비스 B가 항상 서비스 A에게 호출된다면
  그 규칙은 거의 적용되지 않습니다. 서비스 A의 결정을 따를 뿐입니다. 이 워크플로의 샘플링을
  바꾸려면 **루트 서비스(A)** 에 규칙을 걸어야 합니다

**규칙을 어디에 두는지가 중요합니다.**

| 위치 | 문제점 또는 이점 |
|---|---|
| 코드에 포함한 JSON 문서 (로컬) | 서비스 인스턴스마다 **독립적으로** 샘플링합니다. 인스턴스별 예비량이 합산되어 전체 샘플링 비율이 올라갑니다. 규칙을 바꾸려면 코드를 **재배포**해야 합니다 |
| X-Ray 서비스에 정의 | 서비스가 규칙별 예비량을 관리하고 실행 중인 인스턴스 수에 따라 **할당량을 균등 분배**합니다. 배포 없이 규칙을 관리합니다 |

샘플링 규칙은 **CloudWatch 콘솔**에서도 구성합니다. Settings → Setup 아래 → X-Ray traces
섹션의 Sampling rules → View settings 입니다.

샘플링을 구성할 수 있는 대상은 API Gateway 진입점, AWS AppSync, AWS Step Functions, 그리고
EC2·ECS·Elastic Beanstalk 같은 컴퓨팅 플랫폼에 ADOT 또는 X-Ray SDK 로 계측한 애플리케이션입니다.

X-Ray 는 샘플링 규칙 적용에 최선 노력(best-effort) 방식을 쓰므로 실제 샘플링 비율이 설정과
정확히 일치하지 않을 수 있습니다. 다만 시간이 지나면 설정한 비율에 가까워집니다.

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> — 출처: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 11.5 트레이싱 헤더 🆕

샘플링 결정과 트레이스 ID 는 `X-Amzn-Trace-Id` 헤더로 HTTP 요청에 실려 전파됩니다. 요청이 처음
도달한 X-Ray 통합 서비스가 이 헤더를 추가합니다.

```http
X-Amzn-Trace-Id: Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1
```

| 필드 | 의미 |
|---|---|
| `Root` | 트레이스 ID |
| `Parent` | 상위 세그먼트 ID. 계측된 애플리케이션에서 온 요청이면 담깁니다 |
| `Sampled` | 샘플링 결정 |
| `Lineage` | Lambda 등 AWS 서비스가 처리 과정에서 덧붙일 수 있습니다. **직접 사용하지 않습니다** |

**보안 주의사항이 있습니다.** 트레이싱 헤더는 X-Ray SDK, AWS 서비스, **클라이언트 요청**
어디에서든 올 수 있습니다. 사용자가 트레이스 ID 나 샘플링 결정을 임의로 넣는 문제를 막으려면
애플리케이션이 수신 요청에서 `X-Amzn-Trace-Id` 를 제거할 수 있습니다.

> — 출처: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.6 Lambda 의 세그먼트 구조 🔄

교재 슬라이드 27은 Lambda 콜드 스타트를 `code-start 컨테이너 다운로드 → 런타임 부트스트랩 →
코드 실행` 으로 적습니다. `code-start` 는 **cold start 의 오타**이고, 단계 구분도 문서와
다릅니다.

**Lambda 는 트레이스당 세그먼트 2개를 기록합니다.**

| 세그먼트 | 담는 내용 |
|---|---|
| `AWS::Lambda` | 실행 환경 준비 전 과정. MicroVM 스케줄링, 실행 환경 생성 또는 **동결 해제**, **함수 코드와 모든 레이어 다운로드** |
| `AWS::Lambda::Function` | 함수가 수행한 작업 |

**오류가 어느 쪽에 있는지로 책임 소재를 가릅니다.** 트레이스에 이름이 같은 세그먼트 2개가
보이는데 `origin` 이 다릅니다. `AWS::Lambda` 세그먼트에 오류가 보이면 **Lambda 서비스 쪽**
문제이고, `AWS::Lambda::Function` 세그먼트에 오류가 보이면 **함수 쪽** 문제입니다.

**하위 세그먼트 구조가 전환 중입니다.** AWS 가 Lambda 서비스를 변경하고 있어서 계정 안에서
두 형식이 섞여 보일 수 있습니다.

| 형식 | 하위 세그먼트 |
|---|---|
| 기존 | `Initialization`, `Invocation`, `Overhead` (SnapStart 는 `Restore` 추가) |
| 새 형식 | **`Invocation` 세그먼트가 없습니다.** `Init` 하위 세그먼트만 남고 사용자 하위 세그먼트가 `AWS::Lambda::Function` 세그먼트에 직접 붙습니다 |

기존 형식의 각 하위 세그먼트가 뜻하는 것입니다.

| 하위 세그먼트 | 구간 |
|---|---|
| `Initialization` | 실행 환경 수명 주기의 Init 단계. 확장 초기화, 런타임 초기화, 함수 초기화 코드 실행 |
| `Invocation` | 함수 핸들러를 호출하는 Invoke 단계. 런타임·확장 등록에서 시작해 런타임이 응답을 보낼 준비가 될 때 끝납니다 |
| `Overhead` | 런타임이 응답을 보낸 뒤 다음 호출 신호까지. 런타임이 호출 관련 작업을 마치고 샌드박스 동결을 준비하는 구간 |
| `Restore` | (SnapStart 만) 스냅샷 복원, 런타임 로드, after-restore 런타임 후크 실행 시간 |

새 형식에서는 `AWS::Lambda::Function` 세그먼트가 다음 지표를 **주석으로** 담습니다.

| 주석 | 의미 |
|---|---|
| `aws.responseLatency` | 함수 실행에 걸린 시간 |
| `aws.responseDuration` | 응답을 고객에게 전송하는 데 걸린 시간 |
| `aws.runtimeOverhead` | 런타임이 마무리하는 데 추가로 필요한 시간 |
| `aws.extensionOverhead` | 확장이 마무리하는 데 추가로 필요한 시간 |

**Lambda 실행 환경 수명 주기**를 문서 기준으로 정리하면 다음과 같습니다. 교재의 세 단계와
비교해 보세요.

| 단계 | 내용 |
|---|---|
| `Init` | 세 작업을 합니다. 모든 확장 시작(`Extension init`), 런타임 부트스트랩(`Runtime init`), 함수의 정적 코드 실행(`Function init`) |
| `Invoke` | 함수 핸들러를 호출합니다 |
| `Shutdown` | 정리 |

`Init` 단계는 **10초로 제한**됩니다. 세 작업이 10초 안에 끝나지 않으면 Lambda 가 첫 호출
시점에 구성된 함수 타임아웃으로 `Init` 단계를 재시도합니다. 프로비저닝된 동시성, SnapStart,
Lambda Managed Instances 를 쓰면 이 10초 제한이 적용되지 않습니다.

**교재의 "컨테이너 다운로드"는 `Init` 단계의 세 작업 목록에 없습니다.** 함수 코드와 레이어
다운로드는 `AWS::Lambda` 세그먼트가 담는 실행 환경 준비 과정에 포함됩니다.

**X-Ray SDK 로 확장할 수 있는 범위에 제한이 있습니다.** `Invocation` 하위 세그먼트를 다운스트림
호출·주석·메타데이터로 확장할 수 있지만, **함수 세그먼트에 직접 접근하거나 핸들러 호출 범위
밖에서 수행한 작업을 기록할 수는 없습니다.**

또 초기화와 호출 단계 사이에 큰 공백이 보일 수 있습니다. 프로비저닝된 동시성을 쓰면 Lambda 가
호출보다 훨씬 앞서 인스턴스를 초기화하기 때문이고, 온디맨드 동시성에서도 Lambda 가 호출 없이
인스턴스를 선제적으로 초기화할 수 있습니다.

> — 출처: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

> — 출처: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 11.7 운영 지표 약어

슬라이드 29는 본문 없이 강사 노트로만 다음을 소개합니다.

| 약어 | 풀이 |
|---|---|
| MTTD | 평균 감지 시간 (Mean Time to Detect) |
| MTTI | 평균 식별 시간 (Mean Time to Identification) |
| MTTR | 평균 수리 시간 (Mean Time to Repair) |
| MTBF | 평균 장애 간격 (Mean Time Between Failure) |

그리고 공식 하나입니다.

```text
가용성 = MTBF / (MTBF + MTTR)
```

관측가능성이 이 지표들에 영향을 주는 방식은 단순합니다. 감지·식별이 빨라지면(MTTD, MTTI)
수리가 빨라지고(MTTR), 가용성 공식의 분모가 줄어 가용성이 올라갑니다.

MTTR 은 AWS 문서에서도 쓰입니다. Application Insights 문서는 이 기능이 제공하는 애플리케이션
상태 가시성이 문제 해결의 **평균 수리 시간(MTTR)** 을 줄이는 데 도움이 된다고 서술합니다.

> — 출처: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

> **확인하지 못한 부분.** MTTD · MTTI · MTBF 와 가용성 공식이 AWS 공식 문서에 이 형태로
> 정의되어 있는지는 확인하지 못했습니다. 이 절은 교재 내용을 옮긴 것이고, MTTR 만 공식 문서에서
> 쓰이는 것을 확인했습니다([13.5절](#135-검증하지-못한-항목)).

---

## 12. 트레이싱 활성화하기

### 12.1 트레이싱을 켜는 설정 🆕

교재 슬라이드 33·34는 SDK 코드만 보여 주고, **Lambda 와 API Gateway 에서 트레이싱을 켜는
설정**을 다루지 않습니다. 코드를 아무리 계측해도 이 설정을 켜지 않으면 트레이스가 오지 않습니다.

**Lambda 의 트레이싱 모드**

| 모드 | 동작 |
|---|---|
| `Active` | Lambda 가 함수 호출에 대한 트레이스 세그먼트를 **자동 생성해 X-Ray 로 보냅니다** |
| `PassThrough` | 트레이싱 컨텍스트만 다운스트림으로 전파합니다. 트레이스는 자동으로 보내지 않습니다 |

**`Active` 를 켜지 않으면 기본값은 `PassThrough` 입니다.** `PassThrough` 모드에서는 트레이싱
헤더에 샘플링 결정이 담겨 있어도 트레이스를 자동으로 보내지 않습니다. 업스트림이 헤더를 주지
않으면 Lambda 가 헤더를 만들고 샘플링하지 않는 결정을 내립니다. 다만 함수 코드에서 트레이싱
라이브러리를 직접 호출해 자기 트레이스를 보낼 수는 있습니다.

콘솔 경로는 다음과 같습니다.

1. Lambda 콘솔의 **Functions** 페이지에서 함수 선택
2. **Configuration** → **Monitoring and operations tools**
3. **Additional monitoring tools** 에서 **Edit**
4. **CloudWatch Application Signals and AWS X-Ray** 에서 **Lambda service traces** 를 **Enable**
5. **Save**

**SAM 템플릿으로 켜는 방법**입니다. 실습 애플리케이션은 SAM 으로 배포하므로 이 방법이 실제로
쓰이는 경로입니다.

```yaml
Resources:
  ListFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.list_handler
      Runtime: python3.13
      # Active: X-Ray 트레이싱을 켭니다
      # Disabled: X-Ray 를 끕니다
      # PassThrough: 트레이싱을 켜지만 샘플링 결정을 다운스트림에 위임합니다
      Tracing: Active
      Events:
        ListApi:
          Type: Api
          Properties:
            Path: /notes
            Method: get
```

`Tracing` 을 `Active` 또는 `PassThrough` 로 지정하고 `Role` 속성을 설정하지 않으면, AWS SAM 이
만들어 주는 실행 역할에 `arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess` 정책을 추가합니다.

**권한**을 직접 다뤄야 하는 경우도 있습니다. 함수가 트레이스 데이터를 X-Ray 에 업로드하려면
실행 역할에 권한이 필요합니다. 콘솔에서 트레이싱을 켜면 Lambda 가 필요한 권한을 추가하고,
그렇지 않으면 `AWSXRayDaemonWriteAccess` 정책을 실행 역할에 붙입니다. 필요한 API 는
`xray:PutTraceSegments` 와 `xray:PutTelemetryRecords` 입니다.

**Lambda 의 샘플링 비율은 고정입니다.** 초당 1건과 추가 요청의 5%이며 **사용자가 구성할 수
없습니다.** 11.4절의 샘플링 규칙은 Lambda 함수 자체에는 적용되지 않습니다.

**지원되지 않는 조합**이 있습니다. Amazon MSK, 자체 관리형 Apache Kafka, ActiveMQ·RabbitMQ 를
쓰는 Amazon MQ, Amazon DocumentDB 이벤트 소스 매핑을 사용하는 Lambda 함수에는 X-Ray 트레이싱이
지원되지 않습니다.

**API Gateway 의 트레이싱**

| 항목 | 내용 |
|---|---|
| 지원 범위 | REST API 엔드포인트 유형 **전체**(리전, 엣지 최적화, 프라이빗) |
| 리전 | X-Ray 를 사용할 수 있는 모든 AWS 리전 |
| 켜는 단위 | **API 스테이지** 단위. 콘솔, API, CLI 로 켭니다 |
| 통과 동작 | 이미 트레이싱되고 있는 서비스에서 API Gateway API 를 호출하면, **해당 API 에 트레이싱이 켜져 있지 않아도** API Gateway 가 트레이스를 통과시킵니다 |

> — 출처: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

> — 출처: [Trace user requests to REST APIs using X-Ray in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html)

### 12.2 Lambda 는 이제 트레이스를 자동으로 보내지 않습니다 🔄

교재는 트레이싱 모드를 다루지 않기 때문에 이 변경을 알 수 없습니다. **실습에서 트레이스가 안
보이는 가장 흔한 원인입니다.**

| 시점 | 동작 |
|---|---|
| 이전 | Amazon API Gateway 같은 업스트림 서비스가 트레이싱 헤더를 추가하면 Lambda 가 트레이스를 **자동으로 보냈습니다** |
| 현재 | 자동으로 보내지 **않습니다.** 중요한 함수만 트레이싱하도록 제어권을 사용자에게 넘긴 것입니다 |

이 수동 트레이싱 동작에 의존하는 구성이라면 `Active` 트레이싱으로 전환해야 합니다.

> — 출처: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

### 12.3 OpenTelemetry 로의 전환 🔄

**이 모듈에서 가장 크게 바뀐 부분입니다.** 교재 슬라이드 33·34는 X-Ray SDK 로 계측하는 방법만
제시합니다. 그 경로는 지금 권장되지 않습니다.

**지원 일정**

| 단계 | 기간 | 제공되는 지원 |
|---|---|---|
| 일반 제공(GA) | ~ 2026년 2월 25일 | X-Ray SDK 와 데몬이 완전히 지원되었습니다. 버그·보안 수정을 포함한 정기 릴리스 |
| 유지 관리 모드 | 2026년 2월 25일 ~ | **보안 문제 해결 릴리스만** 제공됩니다. 새 기능 개선은 없습니다 |

종료(end of support) 일자는 공지되지 않았으므로 **SDK 가 작동을 멈춘 것은 아닙니다.** 다만 새
기능이 들어오지 않습니다.

**왜 OpenTelemetry 인가**

X-Ray 는 애플리케이션 트레이싱과 관측가능성의 기본 계측 표준을 OpenTelemetry 로 전환하고
있습니다. OpenTelemetry 가 업계에 널리 채택되어 있어서, X-Ray 와 직접 통합되지 않은 AWS 외부
시스템까지 포함한 요청을 추적할 수 있습니다.

마이그레이션으로 얻는 것입니다.

- 프레임워크·라이브러리 계측 지원 확대
- 지원 프로그래밍 언어 추가
- 자동 계측(auto-instrumentation) 기능
- 유연한 샘플링 구성
- 지표·로그·트레이스의 통합 수집

**AWS 가 제공하는 세 가지 경로**

| 경로 | 내용 |
|---|---|
| AWS Distro for OpenTelemetry (ADOT) | OpenTelemetry 트레이스를 세그먼트로 X-Ray 에 내보냅니다 |
| CloudWatch Application Signals | 맞춤 OpenTelemetry 트레이스·지표로 애플리케이션 상태를 모니터링합니다 |
| CloudWatch OTel 엔드포인트 | 네이티브 OpenTelemetry 계측으로 HTTP OTel 엔드포인트를 통해 X-Ray 에 트레이스를 보냅니다 |

**개념 대응표**입니다. X-Ray 로 배운 개념을 OpenTelemetry 로 옮길 때 필요합니다.

| X-Ray 개념 | OpenTelemetry 개념 |
|---|---|
| X-Ray Recorder | Tracer Provider 와 Tracers |
| 세그먼트 | (Server) Span |
| 하위 세그먼트 | (non-Server) Span |
| Annotations / 메타데이터 | Attributes |
| Service Plugins | Resource Detector |
| X-Ray 샘플링 규칙 | OpenTelemetry Sampling (사용자 정의 가능) |
| X-Ray Emitter | Span Exporter (사용자 정의 가능) |
| X-Ray Trace Context | Span Context |
| X-Ray 트레이스 컨텍스트 전파 | W3C Trace Context 전파 |
| X-Ray 데몬 | OpenTelemetry Collector |
| (없음) | Span Processing |
| (없음) | Baggage |

**콘솔 경험은 그대로 유지됩니다.** OpenTelemetry 로 마이그레이션하면 스팬이 X-Ray 세그먼트
또는 하위 세그먼트로 **자동 변환**되므로 기존 CloudWatch 콘솔 화면이 달라지지 않습니다.

**주석은 별도 처리가 필요합니다.** OpenTelemetry 스팬 속성은 기본적으로 X-Ray 원시 데이터에서
**메타데이터**로 변환됩니다. 특정 속성을 **주석**으로 바꾸려면 그 키를 `aws.xray.annotations`
속성 목록에 추가해야 합니다. 인덱싱 여부가 달라지므로 필터 표현식으로 검색할 속성은 반드시
이 목록에 넣어야 합니다.

**데몬 마이그레이션**은 CloudWatch 에이전트 또는 OpenTelemetry Collector 로 갑니다. OpenTelemetry
Collector 는 X-Ray 데몬보다 데이터 수집 형식과 내보내기 대상 선택지가 많습니다.

**샘플링 전략이 늘어납니다.**

| 전략 | 내용 |
|---|---|
| Parent-based Sampling | 상위 스팬의 샘플링 결정을 존중한 뒤 추가 전략을 적용합니다 |
| Trace ID Ratio Based Sampling | 지정한 비율의 스팬을 무작위로 샘플링합니다 |
| Tail sampling | OpenTelemetry Collector 에서 **완성된 트레이스**에 샘플링 규칙을 적용합니다 |
| Custom samplers | 샘플링 인터페이스를 구현해 직접 만듭니다 |
| X-Ray Remote Sampler | 일부 SDK 언어에서 X-Ray 샘플링 규칙을 OpenTelemetry 와 함께 씁니다 |

**컨텍스트 전파 형식**도 선택할 수 있습니다. OpenTelemetry 는 W3C Trace Context(기본),
X-Ray 트레이스 헤더, 그 밖의 사용자 지정 형식을 지원하고 여러 형식을 동시에 쓸 수 있습니다.
API Gateway 엔드포인트처럼 X-Ray 트레이싱을 지원하는 AWS 서비스로 컨텍스트를 전파하려면
**X-Ray Propagator** 를 구성합니다.

> — 출처: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — 출처: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

### 12.4 교재의 언어별 X-Ray SDK 구성

교재 슬라이드 33이 드는 내용입니다. **12.3절의 유지 관리 모드 안내를 먼저 읽고 보세요.**
기존 코드를 이해하는 데는 여전히 필요합니다.

| 언어 | 교재 내용 |
|---|---|
| .NET | 클라이언트를 만들기 전에 `AWSSDKHandler.RegisterXRayForAllServices()` 를 호출해 모든 AWS SDK for .NET 클라이언트를 설정합니다. 특정 서비스만 지정하려면 `AWSSDKHandler.RegisterXRay<IAmazonDynamoDB>()` |
| Java | DynamoDB 클라이언트를 설정하고 Trace Handler 를 `AmazonDynamoDBClientBuilder` 로 전달합니다 |
| Python | Python 용 X-Ray SDK 에는 전역 레코더를 제공하는 `xray_recorder` 클래스가 있습니다 |

> **Java 항목의 주의.** 교재가 드는 `AmazonDynamoDBClientBuilder` 는 **AWS SDK for Java 1.x**
> API 입니다. AWS SDK for Java 1.x 는 다른 모듈에서 다룬 대로 지원이 종료되었습니다. 2.x 에서
> 같은 일을 하는 X-Ray 계측 방법은 확인하지 못했으므로 이 문서는 단정하지 않습니다
> ([13.5절](#135-검증하지-못한-항목)). 새로 만드는 애플리케이션에는 12.3절의 OpenTelemetry
> 경로를 쓰세요.

### 12.5 교재의 C# 예시 🔄

슬라이드 34의 코드에는 **컴파일되지 않는 부분**이 있습니다. 교정해 싣고 무엇을 고쳤는지
밝힙니다.

| # | 교재 | 확인된 내용 |
|---|---|---|
| 1 | `public void RunSqlQuery(...)` 안에서 `await` 를 사용 | `void` 메서드에서는 `await` 를 쓸 수 없습니다. `async Task` 로 선언해야 컴파일됩니다 |
| 2 | `IHostingEnvironment env` | 오래된 인터페이스 이름입니다. 대체 이름은 ASP.NET Core 문서 소관이고 AWS 공식 문서 범위에서 확인할 수 없어 단정하지 않습니다([13.5절](#135-검증하지-못한-항목)) |

교정한 코드입니다. 매개변수 `env` 는 교재 원문에 있으나 본문에서 쓰이지 않으므로 그대로
두었습니다.

```csharp
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.SqlServer;

public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // AWS 서비스 호출 캡처: 모든 AWS SDK for .NET 클라이언트를 X-Ray 에 등록합니다
    AWSSDKHandler.RegisterXRayForAllServices();

    // 수신 API 호출 캡처: 세그먼트 이름으로 쓸 앱 이름을 지정합니다
    app.UseXRay("SampleApp");

    // 나머지 앱 구성
}

// 교정: void 에서 async Task 로 바꿨습니다. 본문에서 await 를 쓰기 때문입니다.
public async Task RunSqlQueryAsync(string connectionString)
{
    using (var connection = new SqlConnection(connectionString))
    {
        var query = "SELECT * FROM Products FOR XML AUTO, ELEMENTS";

        // SQL 쿼리 캡처: SqlCommand 대신 TraceableSqlCommand 를 씁니다
        var command = new TraceableSqlCommand(query, connection);
        command.Connection.Open();
        await command.ExecuteXmlReaderAsync();
    }
}
```

슬라이드가 코드의 어느 부분을 가리키는지 표시한 라벨입니다.

| 라벨 | 대응 코드 |
|---|---|
| AWS 서비스 호출 캡처 | `AWSSDKHandler.RegisterXRayForAllServices();` |
| 수신 API 호출 캡처 | `app.UseXRay("SampleApp");` |
| SQL 쿼리 캡처 | `TraceableSqlCommand` |

### 12.6 데모에서 무엇을 보는가

슬라이드 36의 데모 노트입니다.

| 항목 | 내용 |
|---|---|
| 대상 | 실습 7이나 원하는 실습을 선택 |
| 1 | 로깅을 위해 Lambda / API Gateway 를 활성화하는 방법 |
| 2 | X-Ray 콘솔 |
| 3 | 서비스 맵 |
| 4 | 트레이스 / 오류 |

> **현재 기준으로 옮기면.** 2번은 **CloudWatch 콘솔**, 3번은 **트레이스 맵**으로 보는 것이
> 현재 경로입니다([10.5절](#105-x-ray-콘솔은-더-이상-개발되지-않습니다)).

### 12.7 실습 7

제목은 "AWS X-Ray를 사용하여 애플리케이션 관찰"입니다. 슬라이드 40은 어젠다와 같은 애플리케이션
아키텍처 다이어그램만 싣고 본문 설명과 강사 노트가 없습니다.

실습에서 트레이스가 보이지 않으면 다음 순서로 확인하세요. 덱에는 이 체크리스트가 없습니다.

| 순서 | 확인할 것 | 근거 |
|---|---|---|
| 1 | Lambda 함수의 `Tracing` 이 `Active` 인가 | [12.1절](#121-트레이싱을-켜는-설정) |
| 2 | 실행 역할에 `xray:PutTraceSegments` · `xray:PutTelemetryRecords` 권한이 있는가 | [12.1절](#121-트레이싱을-켜는-설정) |
| 3 | API Gateway **스테이지**에 트레이싱을 켰는가 | [12.1절](#121-트레이싱을-켜는-설정) |
| 4 | 샘플링에 걸러진 것은 아닌가 (기본은 초당 1건 + 5%) | [11.4절](#114-샘플링) |
| 5 | X-Ray 콘솔이 아니라 CloudWatch 콘솔의 Trace Map 을 보고 있는가 | [10.5절](#105-x-ray-콘솔은-더-이상-개발되지-않습니다) |

---

## 13. 교재 대비 변경 사항

수강생이 교재와 이 문서를 나란히 놓고 볼 때 "책에는 이렇게 나오는데요?"에 답할 수 있도록
정리한 장입니다. 총 37건이며 유형별로 교재 기술 오류 21건, 동작·이름 변경 12건, 비권장 3건,
지원 종료 1건입니다.

### 13.1 교재 기술이 사실과 다른 항목

#### 조회 대상이 틀린 것

| 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|
| 슬라이드 15 노트의 참고 링크가 `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` | 현재 경로는 `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html` 입니다. `DeveloperGuide` 경로는 유효하지 않습니다 | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |

#### CLI 예시의 오류 (슬라이드 17·18·19)

교정한 명령은 [6.5절](#65-cli로-경보-만들기)에 있습니다.

| # | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| 1 | `--alarm-name NotesWriteCapacityUnitsLimit` 인데 `--metric-name ConsumedReadCapacityUnits` | 쓰기 용량 경보라면 지표는 `ConsumedWriteCapacityUnits` 입니다 | [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html) |
| 2 | `--namespace AWS/DynamoDB` 와 `--dimensions "Name=InstanceId,Value=i-12345678"` 을 함께 사용 | DynamoDB 측정 기준에 `InstanceId` 는 없습니다. `TableName`, `GlobalSecondaryIndexName`, `Operation`, `OperationType`, `Verb`, `ReceivingRegion`, `Source`, `StreamLabel`, `DelegatedOperation` 입니다 | [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html) |
| 3 | `--alarm-actions` 에 CloudWatch **경보** ARN 지정 | 유효 값은 EC2 작업, Auto Scaling 정책, Lambda 함수, SNS 주제, Systems Manager OpsItem·대응 계획, Amazon Q Developer 운영 조사 ARN 입니다 | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 4 | `--datapoints-to-alarm 5` 만 있고 `--evaluation-periods` 가 없음 | `DatapointsToAlarm` 은 M out of N 의 M 이고 `EvaluationPeriods` 가 N 입니다. N 없이 M 만 주면 평가 동작이 정의되지 않습니다 | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 5 | `--threshold` 와 `--comparison-operator` 가 없음 | 무엇을 위반으로 볼지 정의되지 않습니다 | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 6 | `--dimensions` 절이 별도 줄에 있고 줄 연결 문자가 없음 | 그대로 붙여 넣으면 두 개의 명령으로 실행되어 측정 기준이 유실됩니다 | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |

#### 개념 설명이 부정확한 것

| 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|
| 슬라이드 15 노트: "임계값이 **연속 기간 3개**에 대해 위반된 경우에만 경보가 작업을 호출합니다" | 실제 동작은 M out of N 입니다. M이 N보다 작으면 연속이 아니어도 경보가 발생합니다. 또 평가 범위가 N보다 넓어 누락 데이터가 있으면 더 과거 데이터를 끌어와 평가합니다 | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| 슬라이드 13 본문·슬라이드 38 지식 확인 5번: "경보는 지정된 기간 동안 **단일 지표**를 관찰하고" | 지표 경보는 단일 지표 **또는 지표 math 표현식의 결과**를 감시합니다. 그 밖에 PromQL 경보, 로그 경보, 다른 경보의 상태를 조합하는 복합 경보가 있습니다 | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |
| 슬라이드 16 본문: "지원되는 로깅 **프로토콜** — Apache log4net, Apache Log4j, Nlog, Serilog" | 이들은 프로토콜이 아니라 로깅 프레임워크·라이브러리입니다. 문서가 로그를 보내는 방법으로 드는 것은 CloudWatch 에이전트, `put-log-events` CLI, `PutLogEvents` API 입니다 | [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html) |
| 슬라이드 21 본문: 흔한 결함 패턴으로 "무한 루프 / 다운스트림 속도 저하 / 잘못된 API 버전 / 트리거 확인" | Application Insights 문서가 드는 목록은 .NET·SQL 스택의 애플리케이션 지연 시간, SQL Server 백업 실패, 메모리 누수, 대용량 HTTP 요청, 취소된 I/O 작업입니다. 교재 목록과 겹치지 않습니다 | [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html) |

#### 오타

| 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|
| 슬라이드 27 다이어그램: `code-start 컨테이너 다운로드` | `cold start` 의 오타입니다. `Init` 단계의 세 작업은 확장 시작, 런타임 부트스트랩, 함수 정적 코드 실행이고, 코드·레이어 다운로드는 `AWS::Lambda` 세그먼트가 담습니다 | [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| 슬라이드 30 노트: "성공한 호출과 오류 및 **결합**의 비율" | 문맥상 **결함(fault)** 의 오타입니다. X-Ray 는 오류를 `Error`(400), `Fault`(500), `Throttle`(429)로 분류합니다 | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |

#### 교재 안에서 서로 어긋나는 것

이 항목들은 외부 문서와의 불일치가 아니라 **교재 내부의 모순**입니다. 그래서 🆕 · 🔄 표기를
붙이지 않았습니다.

| 어긋나는 지점 | 내용 | 이 문서의 처리 |
|---|---|---|
| 3대 요소 표기 | 슬라이드 8·9 는 `로깅 / 지표 / 트레이싱`, 슬라이드 25 는 `로깅 / 모니터링 / 트레이싱`. 슬라이드 38 지식 확인 2번 해설이 "지표, 트레이스 및 로그"라고 못박음 | 슬라이드 25 를 틀린 쪽으로 보고 `지표 / 로그 / 트레이스` 로 통일 |
| CloudWatch 의 역할 | 슬라이드 11 노트는 CloudWatch 기능으로 "지표 수집 및 **트레이싱**"을 들고, 슬라이드 9 는 트레이싱을 X-Ray 에 배정 | 두 슬라이드의 역할 배분이 어긋남을 밝히고, 실제 구조(X-Ray 트레이스를 CloudWatch 콘솔에서 봄)를 [10.5절](#105-x-ray-콘솔은-더-이상-개발되지-않습니다)에 정리 |
| 모듈 목표 문구 | 슬라이드 3 은 `관측가능성(Observability)구별`(공백 없음), 슬라이드 42 는 `관측가능성(Observability) 구별` | 슬라이드 3 기준으로 통일 |
| 슬라이드 6·7 | 본문이 동일하고 다이어그램만 단계적으로 늘어남. 그런데 노트에 서로 없는 문장이 각각 있음 | [2.3절](#23-관측가능성-계획) 한 절로 합치고 두 노트를 모두 반영 |
| 슬라이드 17·18·19 | 본문과 터미널 예시가 완전히 동일. 세 장 모두 강사 노트가 없음 | [8장](#8-애플리케이션-계측) 한 절로 합침 |
| 슬라이드 29 노트 | 슬라이드 27 의 트레이스 ID·트레이스 정의를 같은 문장으로 반복한 뒤 운영 지표 약어를 소개 | 고유 내용(약어와 가용성 공식)만 [11.7절](#117-운영-지표-약어)에 남김 |
| 슬라이드 34 코드 | `public void RunSqlQuery(...)` 안에서 `await` 사용. `void` 메서드에서는 `await` 를 쓸 수 없음 | [12.5절](#125-교재의-c-예시)에서 `async Task` 로 교정하고 밝힘 |
| 슬라이드 34 코드 | `IHostingEnvironment` 는 오래된 인터페이스 이름 | "오래된 이름"이라는 사실만 밝히고 대체 이름은 단정하지 않음([13.5절](#135-검증하지-못한-항목)) |

### 13.2 동작과 기본값이 변경된 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| X-Ray 콘솔의 위치 | 슬라이드 26·36 이 X-Ray 콘솔을 트레이스 확인 창구로 제시 | **AWS 는 X-Ray 콘솔을 더 이상 개발하지 않습니다.** CloudWatch 콘솔에 재설계된 X-Ray 기능이 있고 X-Ray 콘솔의 모든 기능을 포함합니다 | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| 서비스 맵 → 트레이스 맵 | 슬라이드 26·30·31·36 이 "서비스 맵" | X-Ray 서비스 맵과 CloudWatch ServiceLens 맵이 CloudWatch 콘솔의 **X-Ray 트레이스 맵**으로 통합되었습니다 | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| CloudWatch Events 의 이름 | 슬라이드 20 노트: "CloudWatch Events를 생성하여 향후 이벤트를 알림" | EventBridge 는 이전에 CloudWatch Events 라 불렸습니다. API 는 동일하고 기존 규칙도 그대로 보이지만, **EventBridge 에 추가되는 새 기능은 CloudWatch Events 에 추가되지 않습니다** | [EventBridge is the evolution of Amazon CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) |
| Lambda 의 트레이스 자동 전송 | 트레이싱 모드를 다루지 않아 API Gateway → Lambda 트레이스가 자연히 수집되는 것으로 전제 | 이전에는 업스트림이 트레이싱 헤더를 추가하면 Lambda 가 자동으로 보냈습니다. **지금은 보내지 않으며 `Active` 트레이싱을 명시적으로 켜야 합니다.** 켜지 않으면 기본값은 `PassThrough` 입니다 | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| Lambda X-Ray 세그먼트 구조 | 슬라이드 27 이 `초기화 / 호출` 하위 세그먼트 구조로 그림 | 기존 형식은 `Initialization` · `Invocation` · `Overhead` 였습니다. 새 형식에는 `Invocation` 세그먼트가 없고 `Init` 만 남으며 사용자 하위 세그먼트가 함수 세그먼트에 직접 붙습니다. AWS 가 전환 중이라 계정 안에서 두 형식이 섞여 보일 수 있습니다 | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| CloudWatch 에이전트의 범위 | 슬라이드 17~19 가 대상을 EC2 · 온프레미스 서버로 한정하고 용도를 지표·로그로 한정 | 에이전트는 EC2 · 온프레미스 · **컨테이너화된 애플리케이션**에서 지표 · 로그 · **트레이스**를 수집합니다. 버전 1.300025.0 이상은 트레이스를 X-Ray 로 보내 별도 데몬이 필요하지 않습니다 | [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) |
| CloudWatch 지표 모델 | 슬라이드 13·14 가 네임스페이스와 측정 기준으로만 설명 | CloudWatch 는 OTLP 로 전송된 OpenTelemetry 지표를 지원합니다. 지표 이름과 레이블(최대 150개)을 쓰고 PromQL 로 조회하며 Query Studio 에서 다룹니다 | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| 사용자 지정 지표 게시 권장 | 슬라이드 12 가 "사용자 지정 데이터"를 화살표로만 표시 | **새로 구현하는 경우 OpenTelemetry 사용이 권장됩니다** | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |
| Lambda 로그 대상 | 슬라이드 16 이 CloudWatch Logs 하나만 전제 | CloudWatch Logs 가 기본이고 Amazon S3 또는 Firehose 를 대상으로 구성할 수 있습니다 | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| Lambda 로그 형식 | 슬라이드 16 이 정형 로그를 애플리케이션이 직접 만드는 것으로 제시 | 고급 로깅 제어로 로그 형식(텍스트/JSON), 로그 수준(`FATAL`~`TRACE`), 대상 로그 그룹을 **함수 설정으로** 지정합니다 | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| 로그 그룹의 성질 | 슬라이드 13 노트가 보존·모니터링·액세스 제어 설정 공유 단위로만 설명 | 로그 그룹 클래스가 Standard 와 Infrequent Access 두 가지 있고, 삭제 보호도 걸 수 있습니다 | [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) |
| 경보 평가 창 | 슬라이드 15 가 고정 경계 그림으로만 설명 | 슬라이딩 창(기본)과 월 클럭 창을 선택할 수 있습니다. 월 클럭 창은 고정 경계에 정렬되고 더 과거 데이터를 추가 조회하지 않습니다 | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| 경보 작업 대상 | 슬라이드 12 노트가 EC2 중지·**시작**·종료, EC2 Auto Scaling, SNS 를 제시 | 현재 목록은 EC2 작업(stop · terminate · reboot · recover), Auto Scaling 정책, **Lambda 함수**, SNS 주제, Systems Manager OpsItem·대응 계획, **Amazon Q Developer 운영 조사**입니다. 교재가 드는 "시작"은 EC2 작업 목록에 없습니다 | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |

### 13.3 비권장 및 지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| **X-Ray SDK · 데몬의 일반 제공** | **종료** — 2026년 2월 25일에 GA 가 끝나고 같은 날 유지 관리 모드로 들어갔습니다. 보안 문제 해결 릴리스만 제공되고 새 기능 개선은 없습니다. 종료(end of support) 일자는 공지되지 않았으므로 작동을 멈춘 것은 아닙니다 | OpenTelemetry 기반 계측 (ADOT 또는 CloudWatch Application Signals) | [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html) |
| 계측 수단으로서의 **X-Ray SDK** | 비권장 — X-Ray 가 기본 계측 표준을 OpenTelemetry 로 전환하고 있고, AWS 는 OpenTelemetry 채택을 권장합니다 | AWS Distro for OpenTelemetry, CloudWatch Application Signals, CloudWatch OTel 엔드포인트 | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| **X-Ray 데몬** | 비권장 — SDK 와 같은 유지 관리 일정을 따르고, 문서가 마이그레이션을 안내합니다 | CloudWatch 에이전트 또는 OpenTelemetry Collector | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| 코드에 포함한 **JSON 로컬 샘플링 규칙** | 비권장 — 인스턴스마다 독립 샘플링해 전체 비율이 올라가고, 규칙 변경에 재배포가 필요합니다 | X-Ray 서비스에 정의한 샘플링 규칙 (CloudWatch 콘솔 → Settings → X-Ray traces → Sampling rules) | [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html) |

> **이 표가 이 모듈에서 가장 중요합니다.** 교재 슬라이드 26·33·34 는 X-Ray SDK 와 데몬을
> 계측의 유일한 경로로 제시합니다. 그 경로를 그대로 따라가면 지금 권장되지 않는 방법을
> 배우게 됩니다. 기존 코드를 읽기 위해서는 여전히 알아야 하지만, 새로 만들 때는
> [12.3절](#123-opentelemetry-로의-전환)의 OpenTelemetry 경로를 쓰세요.

> — 출처: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

> — 출처: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — 출처: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 13.4 교재 이후 추가된 항목

교재에 없고 이 문서에서 공식 문서로 채운 항목입니다.

| 항목 | 이 문서의 위치 |
|---|---|
| 지표 보존 기간이 기간별로 다르고 오래된 데이터가 집계되어 원본 해상도가 사라진다는 사실 | [5.2절](#52-보존-기간과-해상도) |
| 지표 타임스탬프 제약(과거 2주 · 미래 2시간)과 그로 인한 경보 오작동 | [5.1절](#51-지표) |
| `PutMetricData` 로 사용자 지정 지표를 게시하는 방법, 통계 세트 집계, 값 0 게시 | [5.4절](#54-사용자-지정-지표-게시) |
| CloudWatch 의 OpenTelemetry 지표 모델 | [5.5절](#55-opentelemetry-지표) |
| 누락 데이터 처리 네 가지 옵션과 기본값 `missing` | [6.3절](#63-누락-데이터-처리) |
| M out of N 평가, 평가 범위, 조급한 경보 전환 방지 논리 | [6.2절](#62-실제-평가-방식은-m-out-of-n-입니다) |
| 복합 경보 · PromQL 경보 · 로그 경보 | [6.4절](#64-경보의-종류) |
| 로그 보존 기간 기본값이 무기한이라는 사실과 72시간 삭제 지연 | [7.3절](#73-보존-기간과-로그-클래스) |
| CloudWatch Logs Insights 전체 (세 가지 쿼리 언어, 필드 인덱스, 제약, 스캔량 과금) | [7.4절](#74-cloudwatch-logs-insights) |
| 임베디드 지표 형식(EMF)과 카디널리티 함정 | [7.5절](#75-로그에서-지표-만들기-emf) |
| 대시보드와 크로스 계정 관측가능성 | [4.3절](#43-대시보드와-크로스-계정-관측가능성) |
| Lambda 재귀 루프 감지 (약 16회, 기본 활성, 감지 범위 한계) | [9.3절](#93-무한-루프는-이제-lambda-가-막아-줍니다) |
| 추론된 세그먼트와 엣지가 어느 쪽 정보를 쓰는지 | [11.2절](#112-추론된-세그먼트) |
| X-Ray 샘플링 전체 (예비량·비율, 상위 기반 성질, 규칙 위치의 차이) | [11.4절](#114-샘플링) |
| 트레이싱 헤더 구조와 위조 방어 | [11.5절](#115-트레이싱-헤더) |
| 트레이싱을 실제로 켜는 방법 (콘솔 경로, SAM `Tracing` 속성, 필요 권한) | [12.1절](#121-트레이싱을-켜는-설정) |
| OpenTelemetry 전환 (개념 대응표, 세 가지 경로, 샘플링 전략, 주석 처리) | [12.3절](#123-opentelemetry-로의-전환) |
| CloudWatch Application Signals 와 Transaction Search | [10.6절](#106-cloudwatch-로-넓어진-관측가능성-기능) |
| 세그먼트 문서 64 kB 한도, 트레이스·서비스 그래프 30일 보존 | [11.1절](#111-트레이스-세그먼트-하위-세그먼트) · [10.3절](#103-트레이스-맵) |
| 실습에서 트레이스가 보이지 않을 때의 확인 순서 | [12.7절](#127-실습-7) |

### 13.5 검증하지 못한 항목

문서로 확인하지 못한 것은 확인하지 못했다고 적습니다. 단정하지 않습니다.

| 항목 | 왜 확인하지 못했는가 |
|---|---|
| 교재의 "지식 주기" 도식(인력 → 데이터 → 정보 → 지식 → 인사이트 → 작업) | AWS 공식 문서에서 같은 도식을 찾지 못했습니다. 교재 고유의 그림으로 보입니다. 이 문서는 교재 내용을 옮기는 데 그쳤습니다([2.3절](#23-관측가능성-계획)) |
| MTTD · MTTI · MTBF 의 정의와 `가용성 = MTBF / (MTBF + MTTR)` 공식 | AWS 공식 문서에서 이 형태의 정의와 공식을 확인하지 못했습니다. MTTR 만 Application Insights 문서에서 쓰이는 것을 확인했습니다([11.7절](#117-운영-지표-약어)) |
| `IHostingEnvironment` 의 대체 인터페이스 이름 | ASP.NET Core 문서 소관이고 AWS 소유 도메인이 아니어서 이 프로젝트의 근거 규칙상 인용할 수 없습니다. "오래된 이름"이라는 사실만 적었습니다([12.5절](#125-교재의-c-예시)) |
| AWS SDK for Java 2.x 에서의 X-Ray 계측 방법 | 교재가 드는 `AmazonDynamoDBClientBuilder` 는 1.x API 입니다. 2.x 의 대응 방법을 이번 검증 범위에서 확인하지 못했습니다. 새 애플리케이션에는 OpenTelemetry 경로를 쓰세요([12.4절](#124-교재의-언어별-x-ray-sdk-구성)) |
| 교재가 드는 `AWS.Logger.*` NuGet 패키지들의 현재 유지 상태 | 패키지 저장소는 AWS 소유 도메인이 아니어서 근거로 쓸 수 없고, AWS 공식 문서에서 이 목록을 확인하지 못했습니다. 교재 목록을 그대로 옮겼습니다([7.6절](#76-애플리케이션-로그를-보내는-net-패키지)) |
| CloudWatch Application Insights 가 지원하는 애플리케이션 유형 전체 목록 | 개요 문서에서 SQL Server 백엔드와 IIS·웹 계층, SAP(ASE · HANA · NetWeaver) 튜토리얼의 존재는 확인했지만 전체 목록은 확인하지 못했습니다([9.1절](#91-무엇을-하는가)) |
| HTTP API(API Gateway v2)의 X-Ray 지원 여부 | 확인한 문서는 **REST API** 를 대상으로 합니다. HTTP API 의 지원 여부는 확인하지 못했으므로 이 문서는 REST API 범위로만 서술했습니다([12.1절](#121-트레이싱을-켜는-설정)) |

---

## 14. 지식 확인 및 핵심 정리

### 14.1 교재 문제

교재 슬라이드 38의 문제를 그대로 싣습니다. 참 또는 거짓으로 답하세요.

| # | 문항 |
|---|---|
| 1 | CloudWatch Logs를 사용하여 모든 시스템, 애플리케이션과 AWS 서비스의 로그를 중앙 집중화합니다 |
| 2 | 관측가능성의 3대 요소는 로그, 트레이스 및 가용성입니다 |
| 3 | 트레이스는 요청에서 생성한 단일 하위 세그먼트만 표시합니다 |
| 4 | 트레이스는 시스템의 전반적인 성능과 동작을 분석하는 데 사용하는, 수치로 표현한 데이터입니다 |
| 5 | 경보는 지정된 기간 동안 단일 지표를 관찰하고 시간 경과에 따른 임계값을 기준으로 지표 값을 기반으로 하나 이상의 지정된 작업을 수행합니다 |
| 6 | 하위 세그먼트는 애플리케이션이 원래 요청을 이행하기 위해 생성한 다운스트림 호출에 대해 보다 세분화된 타이밍 정보 및 세부 정보를 제공합니다 |

정답과 해설입니다.

| # | 정답 | 해설 |
|---|---|---|
| 1 | **참** | — |
| 2 | **거짓** | 3대 요소는 **지표, 트레이스, 로그**입니다. 가용성은 요소가 아닙니다 |
| 3 | **거짓** | 트레이스는 단일 요청으로 생성된 **모든 세그먼트를 수집**합니다 |
| 4 | **거짓** | 수치로 표현한 데이터는 **지표**입니다. 트레이스가 아닙니다 |
| 5 | **참** (단, 지금은 부분적으로만 맞습니다) | 지표 경보에 한해서는 맞지만, 현재는 지표 math 표현식 결과를 감시하는 경보와 복합 경보·PromQL 경보·로그 경보가 있습니다([6.4절](#64-경보의-종류)) |
| 6 | **참** | — |

### 14.2 보충 문제 🆕

최신화 내용을 확인하는 문제입니다. 교재에는 없습니다.

**1. Lambda 함수에 X-Ray SDK 로 계측 코드를 넣고 배포했는데 트레이스가 하나도 보이지 않습니다.
가장 먼저 확인할 것은 무엇입니까?**

함수의 트레이싱 모드가 `Active` 인지 확인합니다. 켜지 않으면 기본값은 `PassThrough` 이고,
이 모드에서는 트레이싱 헤더에 샘플링 결정이 담겨 있어도 Lambda 가 트레이스를 자동으로 보내지
않습니다. 예전에는 API Gateway 같은 업스트림이 헤더를 추가하면 자동으로 보냈지만 지금은
그렇지 않습니다.

> — 출처: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

**2. 새 애플리케이션을 만들면서 X-Ray 트레이싱을 넣으려 합니다. X-Ray SDK 를 쓰는 것이
적절합니까?**

적절하지 않습니다. X-Ray SDK 와 데몬은 2026년 2월 25일부터 유지 관리 모드이고 보안 문제 해결
릴리스만 제공됩니다. X-Ray 는 기본 계측 표준을 OpenTelemetry 로 전환하고 있으며, AWS 는
OpenTelemetry 채택을 권장합니다. 선택지는 AWS Distro for OpenTelemetry, CloudWatch Application
Signals, CloudWatch OTel 엔드포인트입니다.

> — 출처: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

> — 출처: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

**3. 교재를 보고 X-Ray 콘솔에서 서비스 맵을 찾으려 합니다. 지금은 어디서 봅니까?**

CloudWatch 콘솔 왼쪽 탐색 창의 **X-Ray traces** 아래 **Trace Map** 입니다. X-Ray 서비스 맵과
CloudWatch ServiceLens 맵이 CloudWatch 콘솔의 X-Ray 트레이스 맵으로 통합되었습니다. X-Ray
콘솔도 아직 쓸 수 있지만 AWS 는 더 이상 개발하지 않습니다.

> — 출처: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

**4. `Datapoints to Alarm` 을 2, `Evaluation Periods` 를 3 으로 설정한 경보는 어떻게
동작합니까?**

"3개 중 2개" 경보입니다. 최근 3개 기간 중 2개가 위반하면 `ALARM` 이 되고, **위반이 연속일
필요가 없습니다.** 교재가 설명하는 "연속 기간 3개"는 M과 N이 모두 3인 특수한 경우입니다.

> — 출처: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

**5. 실습 계정에서 로그 그룹을 만들고 아무 설정도 하지 않았습니다. 로그는 언제 삭제됩니까?**

삭제되지 않습니다. 기본 보존 설정은 **무기한(Never Expire)** 입니다. 로그 그룹별로 보존 기간을
설정해야 합니다. 보존 기간을 설정한 뒤에도 즉시 삭제되지 않고 보통 최대 72시간이 걸립니다.

> — 출처: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

**6. Lambda 함수에서 사용자 지정 지표를 만들려 합니다. `PutMetricData` 를 직접 호출하는 것과
EMF 를 쓰는 것의 차이는 무엇입니까?**

EMF 는 CloudWatch Logs 에 기록되는 로그 형태로 지표를 **비동기** 생성하고 CloudWatch 가 지표를
자동 추출합니다. 필요한 권한은 `logs:PutLogEvents` 뿐이고 `cloudwatch:PutMetricData` 는
필요하지 않습니다. Lambda 나 컨테이너처럼 임시 리소스에서 별도 계측 코드를 유지하지 않고 지표를
만들 수 있고, 추출된 지표에 연결된 상세 로그를 Logs Insights 로 조회할 수 있습니다. 다만
고유한 측정 기준 조합마다 지표가 하나씩 생기므로 `requestId` 같은 고카디널리티 필드를 측정
기준으로 넣으면 안 됩니다.

> — 출처: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

**7. 서비스 A → 서비스 B 순서로 호출되는 구조에서 서비스 B 에만 엄격한 샘플링 규칙을 걸었습니다.
어떻게 됩니까?**

거의 적용되지 않습니다. X-Ray 샘플링은 **상위 기반(parent-based)** 이어서 샘플링 결정은 요청을
처음 처리하는 루트 서비스(A)가 한 번만 내리고, B 는 자기 규칙이 일치해도 A 의 결정을 따릅니다.
이 워크플로의 샘플링을 바꾸려면 **루트 서비스 A** 에 규칙을 걸어야 합니다.

> — 출처: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

**8. S3 이벤트로 트리거된 Lambda 함수가 같은 버킷에 결과를 쓰는 구조를 만들었습니다. 무한
루프가 계속 돌면서 요금이 누적됩니까?**

Lambda 가 막아 줍니다. 같은 요청 체인에서 함수가 약 16번 호출되면 다음 호출을 자동으로 중단하고
알립니다. 모든 고객에게 기본으로 켜져 있고 요금이 없으며 X-Ray 액티브 트레이싱을 켤 필요도
없습니다. 다만 감지 범위는 Lambda · SQS · S3 · SNS 사이의 루프뿐이고, **DynamoDB 처럼 다른
서비스가 루프에 끼면 감지하지 못합니다.** 그래서 CloudWatch 경보로 동시성·호출 급증을 감시하는
것이 함께 권장됩니다.

> — 출처: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

**9. 지표를 1분 기간으로 수집하고 있습니다. 6개월 전 데이터를 1분 해상도로 볼 수 있습니까?**

없습니다. 1분 기간 데이터 포인트는 15일간만 그 해상도로 남습니다. 이후에는 5분 해상도로
집계되어 63일까지, 그다음 1시간 해상도로 455일(15개월)까지 남습니다. **원본 해상도가 영구히
보존되지 않습니다.**

> — 출처: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

**10. 교재는 CloudWatch 에이전트를 EC2 와 온프레미스 서버에 지표·로그를 수집하는 용도로
설명합니다. 지금은 무엇이 더 있습니까?**

컨테이너화된 애플리케이션도 대상이고, 지표·로그에 더해 **트레이스**를 수집합니다. 버전
1.300025.0 이상은 OpenTelemetry 또는 X-Ray 클라이언트 SDK 의 트레이스를 X-Ray 로 보내므로
**별도의 트레이스 수집 데몬(X-Ray 데몬)이 필요하지 않습니다.** 지표를 Amazon Managed Service
for Prometheus 로 보낼 수도 있습니다.

> — 출처: [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)

### 14.3 핵심 정리

이 모듈을 마치면 다음을 수행할 수 있습니다.

- 모니터링과 관측가능성 구별
- 현대적 개발과 주요 구성 요소에 관측가능성이 필요한 이유 평가
- 관측가능성 구성에서 Amazon CloudWatch의 역할 이해
- CloudWatch Application Insights를 사용한 애플리케이션 모니터링 설명
- AWS X-Ray를 사용한 애플리케이션 디버깅 설명

한 문장으로 압축하면 다음과 같습니다.

| 주제 | 요점 |
|---|---|
| 관측가능성 대 모니터링 | 모니터링은 문제의 **존재**를, 관측가능성은 문제의 **이유**를 알려 줍니다 |
| 3대 요소 | 지표 · 로그 · 트레이스. 각각 CloudWatch 지표 · CloudWatch Logs · X-Ray 가 담당하지만 지금은 서로 섞여 있습니다 |
| 지표 | 이름 + 네임스페이스 + 측정 기준(최대 30개)으로 고유. 리전 범위이고 보존 기간이 기간별로 다릅니다 |
| 경보 | M out of N 평가. 누락 데이터 처리 기본값은 `missing`. 종류는 지표 · PromQL · 로그 · 복합 |
| 로그 | 로그 그룹이 보존 설정 단위이고 **기본 보존은 무기한**. 조회는 Logs Insights, 지표 변환은 EMF |
| 트레이스 | 트레이스가 세그먼트를 모으고, 세그먼트가 하위 세그먼트로 쪼개집니다. 주석은 인덱싱되고 메타데이터는 안 됩니다 |
| 샘플링 | 기본 초당 1건 + 5%. 상위 기반이므로 **루트 서비스**에 규칙을 걸어야 합니다 |
| 계측 | X-Ray SDK 는 유지 관리 모드. 새로 만들 때는 **OpenTelemetry** |
| 콘솔 | X-Ray 콘솔은 더 이상 개발되지 않습니다. **CloudWatch 콘솔의 Trace Map** 을 씁니다 |

가장 실용적인 조언 하나를 남깁니다. **트레이싱을 켰는데 트레이스가 안 보이면
[12.7절](#127-실습-7)의 확인 순서를 따르세요.** 이 모듈에서 가장 많이 막히는 지점이고,
원인 다섯 개 중 셋은 교재에 설명이 없습니다.
