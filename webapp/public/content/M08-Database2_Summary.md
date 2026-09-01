# 모듈 8: 데이터베이스 작업 처리

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [테이블 설계](#2-테이블-설계)
3. [테이블 작업](#3-테이블-작업)
4. [항목 로드](#4-항목-로드)
5. [항목 읽기](#5-항목-읽기)
6. [항목 업데이트와 삭제](#6-항목-업데이트와-삭제)
7. [보다 상위 수준의 인터페이스](#7-보다-상위-수준의-인터페이스)
8. [DynamoDB 캐싱](#8-dynamodb-캐싱)
9. [교재 대비 변경 사항](#9-교재-대비-변경-사항)
10. [지식 확인 및 핵심 정리](#10-지식-확인-및-핵심-정리)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [9장](#9-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 완료하면 다음을 할 수 있습니다.

- AWS SDK를 사용하여 Amazon DynamoDB와 상호 작용하는 프로그램 개발
- CRUD 작업을 수행하여 테이블, 인덱스, 데이터에 액세스
- DynamoDB에 액세스할 때 개발자 모범 사례 설명
- 성능을 향상하는 DynamoDB 캐싱 옵션 검토

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 모듈 7 | 데이터베이스 시작하기 — Amazon DynamoDB 기본 개념 |
| **모듈 8** | **데이터베이스 작업 처리** — 테이블 설계, 제어 영역·데이터 영역 작업, 상위 수준 인터페이스, DynamoDB 캐싱 |
| 실습 3 | Amazon DynamoDB를 사용한 솔루션 개발 |

### 이 모듈에서 다루는 것

교재는 테이블 수명 주기를 4단계로 나눠 설명합니다. 이 문서도 같은 순서를 따릅니다.

| 단계 | 내용 | 이 문서 |
|---|---|---|
| 1단계 계획 | 액세스 패턴 파악, 파티션 키·인덱스 설계, 초기 처리량 선택 | [2장](#2-테이블-설계) |
| 2단계 테이블 생성 | Create / Update / List / Delete | [3장](#3-테이블-작업) |
| 3단계 데이터 로드 | 단일 항목(`PutItem`), 배치 작업(`BatchWriteItem`) | [4장](#4-항목-로드) |
| 4단계 데이터 처리 | 읽기(`Query`·`Scan`), 업데이트, 삭제, 상위 수준 인터페이스 | [5장](#5-항목-읽기) · [6장](#6-항목-업데이트와-삭제) · [7장](#7-보다-상위-수준의-인터페이스) |

예제 애플리케이션은 `Notes` 테이블을 다룹니다. 파티션 키는 `UserId`, 정렬 키는 `NoteId`이고 `Notes`·`Favorite` 같은 키가 아닌 속성이 붙습니다.

### 1.1 제어 영역 작업과 데이터 영역 작업 🆕

제어 영역 작업으로 DynamoDB 테이블을 생성하고 관리하며, 인덱스·스트림 등 테이블에 종속된 객체도 다룹니다. 데이터 영역 작업으로 테이블 데이터에 대한 CRUD를 수행하고, 일부 데이터 영역 작업으로 보조 인덱스에서 데이터를 읽을 수도 있습니다.

| 구분 | 작업 |
|---|---|
| 제어 영역 | `CreateTable`, `DescribeTable`, `ListTables`, `UpdateTable`, `DeleteTable` |
| 데이터 영역 — 클래식 API | 생성: `PutItem`, `BatchWriteItem`(최대 25개) / 읽기: `GetItem`, `BatchGetItem`(최대 100개), `Query`, `Scan` / 업데이트: `UpdateItem` / 삭제: `DeleteItem`, `BatchWriteItem` |
| 데이터 영역 — PartiQL 🆕 | `ExecuteStatement`, `BatchExecuteStatement` |
| 트랜잭션 🆕 | `TransactWriteItems`, `TransactGetItems`, `ExecuteTransaction`(PartiQL) |
| DynamoDB Streams | `ListStreams`, `DescribeStream`, `GetShardIterator`, `GetRecords` |

교재 슬라이드 4의 제어 영역 다섯 작업 목록은 현재 문서와 일치합니다. 달라진 것은 데이터 영역의 폭입니다. 교재는 클래식 API만 제시하지만, 현재 문서는 같은 CRUD를 **PartiQL로도** 수행할 수 있고 **트랜잭션**이 별도 범주로 존재한다고 기술합니다. PartiQL과 트랜잭션은 [7.5절](#75-교재에-없는-두-가지-인터페이스-partiql과-트랜잭션)에서 다룹니다.

> — 출처: [DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.API.html)

---

## 2. 테이블 설계

### 2.1 테이블 설계는 계획에서 시작

테이블 설계는 계획에서 시작됩니다. 애플리케이션 요구를 파악하는 데 도움이 되는 질문을 하고, 그 요구를 이해한 다음 데이터를 효율적으로 로드하고 사용할 수 있는 데이터베이스를 설계합니다.

### 2.2 NoSQL 설계 주요 개념

DynamoDB는 NoSQL 데이터베이스입니다. 개발자는 스키마를 정의하며 프로세스를 시작하지 않습니다. 대신 답해야 하는 질문을 파악하는 것으로 시작하고, 지원해야 하는 작업에 필요한 애플리케이션의 액세스 패턴을 먼저 확인합니다.

교재가 제시하는 세 속성(**크기, 형태, 속도**)은 다음과 같습니다.

| 속성 | 내용 |
|---|---|
| 데이터 크기 | 한 번에 얼마나 많은 데이터가 저장되고 요청되는지 파악하면 데이터를 분할하는 가장 효과적인 방법을 결정하는 데 도움이 됩니다 |
| 데이터 형태 | NoSQL 데이터베이스는 RDBMS와 달리 쿼리를 처리할 때 데이터 형태를 변경하지 않습니다. 대신 데이터베이스 내의 데이터 형태가 쿼리되는 데이터와 일치하도록 데이터를 구성합니다. 데이터 형태는 속도 및 확장성 증가에 핵심 요소입니다 |
| 데이터 속도 | DynamoDB는 쿼리를 처리하는 데 쓸 수 있는 물리적 파티션 수를 늘리고 데이터를 이 파티션에 효율적으로 분산하여 확장합니다. 최대 쿼리 로드를 미리 파악하면 읽기·쓰기 용량을 최대한 활용하도록 데이터를 분할하는 방법을 정할 수 있습니다 |

개발자는 **모든 액세스 패턴을 식별할 때까지 테이블 생성을 시작하면 안 됩니다.** 데이터가 액세스되는 방식을 이해하는 것이 테이블 설계의 관건입니다.

Notes 애플리케이션의 일반적인 쿼리 세 가지:

- 특정 사용자의 모든 노트 나열
- 특정 사용자의 특정 노트 가져오기
- 모든 사용자의 즐겨찾기 플래그가 지정된 노트 나열

### 2.3 파티션 키 디자인 🆕

기본 키는 DynamoDB 테이블에서 각 항목을 고유하게 식별합니다. DynamoDB는 두 가지 유형의 기본 키를 지원합니다.

| 유형 | 내용 |
|---|---|
| 파티션 키 (단순 기본 키) | 하나의 속성으로 구성됩니다. **hash attribute**라고도 부릅니다. DynamoDB가 파티션 키 값을 내부 해시 함수의 입력으로 써서 항목이 저장될 파티션을 결정합니다. 파티션 키만 있는 테이블에서는 두 항목이 같은 파티션 키 값을 가질 수 없습니다 |
| 파티션 키 + 정렬 키 (복합 기본 키) | 두 속성으로 구성됩니다. 정렬 키는 **range attribute**라고도 부릅니다. 파티션 키 값이 같은 항목은 정렬 키 값 순서로 함께 저장됩니다. 파티션 키 값이 같은 항목이 여러 개 있을 수 있지만 정렬 키 값은 달라야 합니다 |

🆕 교재가 다루지 않는 제약: **기본 키 속성은 스칼라여야 하고 허용되는 데이터 유형은 문자열·숫자·이진뿐입니다.** 키가 아닌 속성에는 이런 제약이 없습니다. 기본 키 외의 속성은 미리 정의할 필요가 없어 테이블이 스키마리스이며, 중첩 속성은 최대 32단계까지 지원합니다.

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

키 선택 기준(교재 슬라이드 8): 일반적인 액세스 패턴 / 높은 카디널리티 / 애플리케이션에 대표적인 값.

같은 데이터를 두 가지로 설계한 교재 예제:

| 설계 | 파티션 키 | 정렬 키 | "StudentC의 모든 노트 가져오기" |
|---|---|---|---|
| 표 1 | `NoteId` | 없음 | 전체 테이블 **스캔**. 고유하지만 액세스 패턴을 지원하지 못하고 잠재적으로 비용이 큼 |
| 표 2 | `UserId` | `NoteId` | 같은 데이터에 대한 효율적인 **쿼리** |

파티션 키는 **일반적인 액세스 패턴**과 테이블 내 항목 간 파티션 키 값의 **고유성(높은 카디널리티)** 을 중심으로 설계합니다.

### 2.4 인덱스 설계와 보조 인덱스 할당량 🆕

교재 슬라이드 9의 네 원칙:

| 원칙 | 내용 |
|---|---|
| 보조 인덱스를 사용 | 기본 테이블이 지원할 수 있는 것보다 다양한 쿼리가 가능해지고, 이러한 쿼리도 여전히 빠르고 상대적으로 저렴합니다 |
| 관련 데이터를 함께 유지 | 쿼리에 대한 시기적절한 응답을 보장하는 데 가장 중요한 요소로 간주됩니다 |
| 정렬 순서를 사용 | 핵심 설계가 함께 정렬할 것을 요구하면 관련 항목을 그룹으로 묶어 효율적으로 쿼리할 수 있습니다 |
| 쿼리를 분산 | 많은 볼륨의 쿼리가 데이터베이스의 특정 부분에 몰리면 I/O 용량을 초과할 수 있습니다. 트래픽을 여러 파티션으로 분산시켜 핫 스팟이 방지되도록 데이터 키를 설계합니다 |

🆕 교재는 보조 인덱스를 다루면서 **두 종류의 차이와 테이블당 개수 할당량은 말하지 않습니다.**

| 항목 | 글로벌 보조 인덱스(GSI) | 로컬 보조 인덱스(LSI) |
|---|---|---|
| 파티션 키 | 테이블과 **다를 수 있음** | 테이블과 **같아야 함** |
| 정렬 키 | 테이블과 다를 수 있음 | 테이블과 달라야 함 |
| 기본 키 값의 고유성 | 고유하지 않아도 됨 | — |
| 테이블당 개수 | **기본 할당량 20개**(조정 가능) | **최대 5개** |
| 읽기 일관성 | **최종 일관성만** 지원 | 강력한 일관성 지원 |
| 크기 제한 | 제약 없음 | 파티션 키 값당 **10GB** |

프로젝션 속성에도 한도가 있습니다. 사용자가 지정해 프로젝션하는 속성은 테이블의 모든 LSI·GSI를 합쳐 **최대 100개**이며, 이 한도는 `ProjectionType`이 `INCLUDE`인 경우에만 적용되고 `KEYS_ONLY`·`ALL`에는 적용되지 않습니다.

> — 출처: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

### 2.5 초기 처리량 선택 🔄

테이블의 초기 처리 능력을 선택할 때 고려할 입력(교재 슬라이드 10): 항목 크기 / 예상되는 테이블 읽기·쓰기 속도 / 읽기 일관성 요구 사항.

#### 용량 단위 계산 🔄

교재는 "단일 응답 항목을 반환한 쿼리는 크기가 2KB이고 이 작업에 **1 RCU**가 부과된다. 같은 테이블이 쓰기에 사용되면 **2 WCU**가 부과된다"고 기재합니다. 쓰기 쪽은 맞지만 읽기 쪽은 **읽기 일관성 모델이 빠져 있습니다.**

| 읽기 유형 | 4KB 이하 항목 1건 |
|---|---|
| 강력한 일관성 읽기 | **1 RCU** |
| 최종 일관성 읽기 (`GetItem`·`Query`·`Scan`의 **기본값**) | **0.5 RCU** |
| 트랜잭션 읽기 | **2 RCU** |

| 쓰기 유형 | 1KB 이하 항목 1건 |
|---|---|
| 일반 쓰기 | **1 WCU** |
| 트랜잭션 쓰기 | **2 WCU** |

- 읽기의 항목 크기는 **4KB 배수로 올림**됩니다. 3,500바이트 항목을 읽으면 4KB 항목을 읽은 것과 같은 처리량을 씁니다.
- 쓰기의 항목 크기는 **1KB 배수로 올림**됩니다. 500바이트 항목을 쓰면 1KB 항목을 쓴 것과 같습니다.
- 따라서 2KB 항목 하나를 읽으면 강력한 일관성에서는 1 RCU, **기본값인 최종 일관성에서는 0.5 RCU**입니다. 2KB 쓰기는 2 WCU로 교재와 같습니다.
- 🆕 **존재하지 않는 항목을 읽어도 읽기 처리량은 소비됩니다.** `Query`·`Scan`은 데이터가 없어도 읽기 일관성과 검색한 파티션 수에 따라 추가 처리량이 부과됩니다.

> — 출처: [DynamoDB read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html)

#### 용량 모드 🔄

교재는 프로비저닝 모드를 먼저 제시하고 온디맨드를 "알 수 없는 워크로드" 대안으로 서술합니다. **현재 문서의 서열은 반대입니다.**

| 모드 | 교재 서술 | 현재 문서 |
|---|---|---|
| 온디맨드 | 알 수 없는 워크로드 / 예측 불가능한 트래픽. "용량 계획 없이 초당 수천 개의 요청을 처리하는 유연한 과금 옵션" | **기본이자 권장(default and recommended) 처리량 옵션.** 서버리스 처리량 옵션으로 용량 계획·모니터링·스케일링 정책 구성이 필요 없고 요청 단위로 과금 |
| 프로비저닝 | 예측 가능한 트래픽 / 알려진 워크로드 / 사용 가능한 예약 용량 | 초당 읽기·쓰기 수를 지정. **예측 가능한 성장세를 가진 안정적 워크로드**에 적합. 실제 소비량이 아니라 프로비저닝한 시간당 용량으로 과금되어 비용 예측 가능성을 얻음 |

온디맨드에 대해 교재가 다루지 않는 사실: 🆕

- 온디맨드 테이블도 프로비저닝과 **동일한 한 자릿수 밀리초 지연 시간, SLA, 보안**을 제공합니다.
- 새 온디맨드 테이블은 초당 **쓰기 4,000건·읽기 12,000건**까지 즉시 처리하고, 직전 최고 트래픽의 **두 배**까지 즉시 수용합니다.
- 온디맨드 테이블·GSI에는 **최대 처리량(maximum throughput)** 을 선택적으로 설정해 비용을 제한할 수 있습니다.
- 직전 최고치의 두 배를 30분 안에 초과하면 스로틀링이 발생할 수 있으므로, 사전 워밍(warm throughput)이나 30분에 걸친 점진적 증가를 권장합니다.

> — 출처: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

#### 용량 모드 전환 한도 🔄

교재 강사 노트는 두 가지를 기재합니다. 둘 다 현재와 다릅니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| "AWS CLI 또는 AWS SDK를 사용하여 테이블을 생성할 때 테이블의 용량을 프로비저닝해야 합니다" | `CreateTable`의 `BillingMode`는 **필수가 아닙니다.** 유효값은 `PROVISIONED`와 `PAY_PER_REQUEST`이고, `PAY_PER_REQUEST`를 선택하면 `ProvisionedThroughput`을 **지정할 수 없습니다.** 문서는 대부분의 워크로드에 `PAY_PER_REQUEST`를 권장합니다 |
| "24시간마다 한 번씩 읽기 및 쓰기 용량 모드를 전환할 수 있습니다" | 프로비저닝 → 온디맨드는 **24시간 롤링 윈도 안에서 최대 4번**, 온디맨드 → 프로비저닝은 **언제든** 전환할 수 있습니다 |

전환 시 알아 둘 점: 🆕

- 프로비저닝 → 온디맨드 전환에는 몇 분이 걸릴 수 있고, 전환 중에는 이전에 프로비저닝된 용량과 일치하는 처리량이 제공됩니다.
- 콘솔로 전환하면 Auto Scaling 설정이 **삭제**되고, AWS CLI·SDK로 전환하면 **보존**됩니다.
- 온디맨드 → 프로비저닝으로 돌아가면 온디맨드 기간의 직전 최고치와 일치하는 처리량이 제공됩니다.

> — 출처: [Considerations when switching capacity modes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-switching-capacity-modes.html)

#### 버스트 용량과 적응형 용량 🆕

교재 강사 노트는 "버스트 및 적응형 용량을 활용하여 애플리케이션 용량을 미세 조정할 수 있습니다"라고만 적습니다. 구체적인 값은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 버스트 용량 | 사용하지 않은 읽기·쓰기 용량을 **최대 5분(300초)** 까지 보유합니다. DynamoDB가 사전 통지 없이 백그라운드 유지 관리에 소비할 수도 있습니다 |
| 적응형 용량 | 모든 테이블에 **자동으로 활성화**되고 추가 비용이 없으며 명시적으로 켜거나 끌 필요가 없습니다 |
| 파티션 한계 | 단일 파티션이 **읽기 3,000회 또는 쓰기 1,000회**를 초과하면 스로틀링이 발생합니다. 적응형 용량은 트래픽이 많은 파티션의 처리량을 자동·즉시 늘립니다 |
| 자주 액세스되는 항목 | 같은 파티션에 있지 않도록 재조정합니다. 다만 테이블에 **LSI가 있으면** 항목 컬렉션을 여러 파티션으로 분할하지 않습니다 |

> — 출처: [DynamoDB burst and adaptive capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html)

### 2.6 그 밖의 테이블 할당량 🆕

교재 슬라이드 21은 서비스 할당량 문서를 링크만 하고 값을 제시하지 않습니다.

| 항목 | 값 |
|---|---|
| 크기 단위 | DynamoDB의 모든 크기 측정은 **이진 단위**입니다(1KB = 1024바이트, 1MB = 1024KB) |
| 테이블 크기 | 실질적인 상한이 없고 항목 수·바이트 수에 제약이 없습니다 |
| 계정·리전당 테이블 수 | 초기 할당량 **2,500개**. 그 이상은 AWS 계정 팀을 통해 최대 10,000개까지, 10,000개를 넘으면 계정을 여러 개 두는 것이 권장 모범 사례 |
| 테이블당 처리량 | 온디맨드·프로비저닝 모두 읽기 40,000단위·쓰기 40,000단위 |
| 계정당 처리량 | 프로비저닝 읽기 80,000단위·쓰기 80,000단위. **온디맨드 테이블에는 계정 수준 할당량이 적용되지 않습니다** |
| 테이블·GSI 최소 처리량 | 읽기 1단위·쓰기 1단위 |

> — 출처: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

---

## 3. 테이블 작업

### 3.1 테이블 생성: Java 하위 수준 인터페이스 🔄

교재 슬라이드 13~14는 키 스키마와 속성 정의를 만든 뒤 `CreateTableRequest`를 빌드합니다. 요청을 만드는 부분은 AWS SDK for Java 2.x 문법이지만 **응답을 받는 마지막 줄이 1.x 클래스 이름**입니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| `CreateTableResult result = ddb.createTable(request);` | 2.x의 반환 형식은 **`CreateTableResponse`** 이고 `tableDescription()` 메서드로 테이블 속성을 반환합니다. `CreateTableResult`는 1.x 클래스 이름입니다 |

```java
// 요청에 사용할 키 속성 및 값 설정
List<KeySchemaElement> keySchema = new ArrayList<>();
keySchema.add(KeySchemaElement.builder()
        .attributeName("UserId").keyType(KeyType.HASH).build());   // 파티션 키
keySchema.add(KeySchemaElement.builder()
        .attributeName("NoteId").keyType(KeyType.RANGE).build());  // 정렬 키

// 요청에 사용할 속성 정의 설정
// NoteId 는 N(숫자)으로 정의한다. 교재는 슬라이드마다 S 와 N 이 엇갈리지만
// 슬라이드 25 이후의 모든 CLI 예제가 {"NoteId":{"N":"42"}} 를 쓴다.
List<AttributeDefinition> attributeDefinitions = new ArrayList<>();
attributeDefinitions.add(AttributeDefinition.builder()
        .attributeName("UserId").attributeType(ScalarAttributeType.S).build());
attributeDefinitions.add(AttributeDefinition.builder()
        .attributeName("NoteId").attributeType(ScalarAttributeType.N).build());

// 요청에 사용할 테이블 처리량 설정 (5 WCU / 5 RCU)
ProvisionedThroughput provisionedThroughput = ProvisionedThroughput.builder()
        .writeCapacityUnits(5L)
        .readCapacityUnits(5L)
        .build();

// CreateTable 요청 빌드
CreateTableRequest request = CreateTableRequest.builder()
        .attributeDefinitions(attributeDefinitions)
        .keySchema(keySchema)
        .billingMode(BillingMode.PROVISIONED)   // ProvisionedThroughput 을 쓰므로 명시한다
        .provisionedThroughput(provisionedThroughput)
        .tableName("Notes")
        .build();

// AWS SDK for Java 2.x 의 반환 형식은 CreateTableResponse 다
CreateTableResponse response = ddb.createTable(request);
System.out.println(response.tableDescription().tableStatus());   // CREATING
```

`KeyType`은 `HASH`(파티션 키)와 `RANGE`(정렬 키) 두 값이며, 복합 기본 키는 `HASH`·`RANGE` 순서로 **정확히 두 요소**를 제공해야 합니다.

> — 출처: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html), [CreateTableResponse (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/dynamodb/model/CreateTableResponse.html)

#### `NoteId`의 속성 유형: 교재 안의 모순 🔄

| 위치 | `NoteId` 유형 |
|---|---|
| 슬라이드 13 코드 | `ScalarAttributeType.S` |
| 슬라이드 13 강사 노트 | "primarykey(UserId)와 sortKey(NoteId)는 **모두 문자열(S)**" |
| 슬라이드 14 강사 노트 | "primarykey(UserId)는 문자열(S)로 설정되고 sortKey(NoteId)는 **숫자(N)**" |
| 슬라이드 15 .NET 예제 | `ScalarAttributeType.N` |
| 슬라이드 25 이후 모든 CLI 예제 | `{"NoteId":{"N":"..."}}` |

`AttributeType` 유효값은 `S`·`N`·`B`이고 기본 키 속성의 데이터 유형은 문자열·숫자·이진 중 하나여야 하므로 둘 다 문법적으로는 가능합니다. 그러나 하나의 `Notes` 테이블에 두 정의가 공존할 수는 없습니다. 이 문서는 **다수 예제와 일치하는 `N`으로 통일**했습니다.

> — 출처: [AttributeDefinition](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html)

### 3.2 테이블 생성 후 상태 확인 🆕

`CreateTable`은 **비동기 작업**입니다.

| 단계 | 내용 |
|---|---|
| 요청 직후 | `TableStatus`가 **`CREATING`** 인 응답을 즉시 반환 |
| 생성 완료 후 | DynamoDB가 `TableStatus`를 **`ACTIVE`** 로 설정 |
| 읽기·쓰기 가능 시점 | **`ACTIVE` 테이블에서만** 수행 가능 |
| 상태 확인 방법 | `DescribeTable` |

응답은 `TableDescription` 객체를 담고 있으며 `BillingModeSummary`, `CreationDateTime`, `GlobalSecondaryIndexes`, `TableStatus` 등을 포함합니다. 이 부분은 교재 슬라이드 16 강사 노트와 일치합니다.

🆕 교재가 다루지 않는 제약: 테이블 이름은 **리전 안에서 고유**해야 하고(리전이 다르면 같은 이름을 쓸 수 있음), 보조 인덱스가 있는 테이블은 **한 번에 하나만** `CREATING` 상태일 수 있습니다.

> — 출처: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)

### 3.3 테이블 생성: .NET 하위 수준 인터페이스 🔄

교재 슬라이드 15~16 예제에는 세 가지 문제가 있습니다.

| 교재 | 문제 | 교정 |
|---|---|---|
| `AttributeName = "NoteId",I` | 잉여 문자 `I` | `AttributeName = "NoteId",` |
| `},,` | 쉼표 중복 | `},` |
| `var response = client.CreateTable(request);` | 현재 공식 .NET(v4) 예제는 비동기 호출을 사용 | `await client.CreateTableAsync(request)` |

앞의 두 개는 교재 자체의 오타여서 AWS 문서로 검증할 성질이 아니고, 마지막 하나는 공식 코드 예제와의 차이입니다.

```csharp
AmazonDynamoDBClient client = new AmazonDynamoDBClient();
string tableName = "Notes";
var request = new CreateTableRequest
{
    TableName = tableName,
    AttributeDefinitions = new List<AttributeDefinition>()
    {
        new AttributeDefinition { AttributeName = "UserId", AttributeType = ScalarAttributeType.S },
        new AttributeDefinition { AttributeName = "NoteId", AttributeType = ScalarAttributeType.N }
    },
    KeySchema = new List<KeySchemaElement>()
    {
        new KeySchemaElement { AttributeName = "UserId", KeyType = KeyType.HASH },   // 파티션 키
        new KeySchemaElement { AttributeName = "NoteId", KeyType = KeyType.RANGE }   // 정렬 키
    },
    // 온디맨드로 만들면 ProvisionedThroughput 을 지정할 수 없다.
    // 프로비저닝을 쓰려면 BillingMode.PROVISIONED 와 함께 ProvisionedThroughput 을 지정한다.
    BillingMode = BillingMode.PAY_PER_REQUEST
};

// 현재 공식 예제는 비동기 메서드를 사용한다
var response = await client.CreateTableAsync(request);

// 테이블 상태가 ACTIVE 가 될 때까지 폴링한다
var describeRequest = new DescribeTableRequest
{
    TableName = response.TableDescription.TableName
};
TableStatus status;
do
{
    Thread.Sleep(2000);
    var describeResponse = await client.DescribeTableAsync(describeRequest);
    status = describeResponse.Table.TableStatus;
}
while (status != TableStatus.ACTIVE);
```

테이블이 이미 있으면 `ResourceInUseException`이 발생합니다.

> — 출처: [Use CreateTable with an AWS SDK or CLI](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_CreateTable_section.html)

### 3.4 CLI로 인덱스가 포함된 테이블 생성

교재 슬라이드 17은 기본 테이블 키 `(UserId, NoteId)`와 인덱스 키 `(UserId, Is_Incomplete)`를 그림으로 보여 줍니다. 속성 유형은 다음 값으로 설정합니다.

| 값 | 의미 |
|---|---|
| `S` | 문자열 형식 속성 |
| `N` | 숫자 형식 속성 |
| `B` | 이진 형식 속성 |

```bash
aws dynamodb create-table \
  --table-name Notes \
  --attribute-definitions \
      AttributeName=UserId,AttributeType=S \
      AttributeName=NoteId,AttributeType=N \
      AttributeName=Is_Incomplete,AttributeType=S \
  --key-schema \
      AttributeName=UserId,KeyType=HASH \
      AttributeName=NoteId,KeyType=RANGE \
  --local-secondary-indexes \
      '[{"IndexName":"IsIncompleteIndex",
         "KeySchema":[{"AttributeName":"UserId","KeyType":"HASH"},
                      {"AttributeName":"Is_Incomplete","KeyType":"RANGE"}],
         "Projection":{"ProjectionType":"ALL"}}]' \
  --billing-mode PAY_PER_REQUEST
```

교재 강사 노트의 참고: 설계에 따라 개발자는 DynamoDB 테이블에 **키가 아닌 속성을 선언할 필요가 없습니다.** DynamoDB는 `--key-schema`를 제외하고 스키마가 없습니다. 이 서술은 현재 문서의 "기본 키 외에는 속성도 데이터 유형도 미리 정의할 필요가 없다"와 일치합니다.

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.5 Waiter 사용 🔄

Java용 AWS SDK는 리소스가 원하는 상태로 전환될 때까지 대기하는 waiter 기능을 제공합니다. waiter를 쓰지 않으면 상태를 반복 검사하는 폴링 코드를 직접 써야 합니다.

교재 슬라이드 18 코드에는 두 곳의 문제가 있습니다.

| 교재 | 문제 |
|---|---|
| `CreateTableResponse response = ddb.createTable("Notes");` | 슬라이드 주석과 강사 노트는 "`CreateTableRequest` 객체의 정보를 사용하여 테이블을 생성"한다고 하는데 코드는 문자열 리터럴을 넘깁니다. `DynamoDbClient.createTable`은 **요청 객체 또는 빌더 `Consumer`** 를 받는 오버로드만 있습니다 |
| `dbWaiter.waitUntilTableExists("Notes");` | 공식 예제는 **`DescribeTableRequest`를 구성하는 빌더**를 넘깁니다 |

```java
// 표준 클라이언트를 waiter 에 넘겨 같은 리전을 쓰도록 한다.
// DynamoDbWaiter 는 AutoCloseable 이므로 try-with-resources 로 닫는다.
try (DynamoDbWaiter dbWaiter = DynamoDbWaiter.builder().client(ddb).build()) {

    // 요청 객체를 사용하여 테이블 생성
    CreateTableResponse response = ddb.createTable(request);

    // Amazon DynamoDB 테이블이 생성될 때까지 대기.
    // 인자는 문자열이 아니라 DescribeTableRequest 를 구성하는 빌더다.
    ResponseOrException<DescribeTableResponse> waiterResponse = dbWaiter
            .waitUntilTableExists(b -> b.tableName("Notes").build())
            .matched();

    DescribeTableResponse tableDescription = waiterResponse.response().orElseThrow(
            () -> new RuntimeException("Notes table was not created."));
    System.out.println(tableDescription.table().tableStatus());   // ACTIVE
}
```

`DynamoDbWaiter`는 `software.amazon.awssdk.services.dynamodb.waiters` 패키지에 있고 `waitUntilTableExists`와 `waitUntilTableNotExists`를 제공합니다.

> — 출처: [Create a DynamoDB table if needed (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html)

### 3.6 테이블 업데이트·리스트·삭제 (Java) 🔄

교재 슬라이드 19~20의 Java 예제는 **AWS SDK for Java 1.x Document API 문법**입니다.

| 교재 코드 | 버전 |
|---|---|
| `Table table = dynamoDB.getTable("Notes");` | 1.x |
| `new ProvisionedThroughput().withReadCapacityUnits(15L)` | 1.x |
| `TableCollection<ListTablesResult> tables = dynamoDB.listTables();` | 1.x |

AWS SDK for Java 1.x는 **2025년 12월 31일 지원이 종료**되었습니다(2024년 1월 12일 발표, 2024년 7월 31일 유지 관리 모드 진입). 같은 모듈의 슬라이드 13~14·18·41~42는 2.x 문법이어서 교재 안에서 버전이 섞여 있습니다. 패키지 이름도 다릅니다. 1.x는 `com.amazonaws`, 2.x는 `software.amazon.awssdk`입니다.

```java
// 업데이트 — AWS SDK for Java 2.x
UpdateTableRequest updateRequest = UpdateTableRequest.builder()
        .tableName("Notes")
        .provisionedThroughput(ProvisionedThroughput.builder()
                .readCapacityUnits(15L)
                .writeCapacityUnits(15L)
                .build())
        .build();
ddb.updateTable(updateRequest);

// 삭제
ddb.deleteTable(DeleteTableRequest.builder().tableName("Notes").build());

// 리스트 — 출력은 페이지당 최대 100개로 페이지 매김된다.
// 페이지네이터를 쓰면 SDK 가 다음 페이지 호출을 대신 처리한다.
ddb.listTablesPaginator(ListTablesRequest.builder().build())
        .tableNames()
        .forEach(System.out::println);
```

> — 출처: [Programming DynamoDB with the AWS SDK for Java 2.x](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 3.7 테이블 업데이트·리스트·삭제 (.NET)

교재 슬라이드 21~22 예제입니다. 동기 메서드를 비동기로 바꾼 것 외에는 교재와 같습니다([3.3절](#33-테이블-생성-net-하위-수준-인터페이스) 참조).

```csharp
// 업데이트
string tableName = "Notes";
var request = new UpdateTableRequest()
{
    TableName = tableName,
    ProvisionedThroughput = new ProvisionedThroughput()
    {   // 새 값을 제공합니다.
        ReadCapacityUnits = 20,
        WriteCapacityUnits = 10
    }
};
var response = await client.UpdateTableAsync(request);

// 삭제
var deleteRequest = new DeleteTableRequest { TableName = tableName };
var deleteResponse = await client.DeleteTableAsync(deleteRequest);

// 리스트 — 요청 객체를 생성하여 선택 사항 파라미터를 지정합니다.
var listRequest = new ListTablesRequest
{
    Limit = 10,  // 페이지 크기 (1~100, 미지정 시 100)
    ExclusiveStartTableName = lastEvaluatedTableName
};
var listResponse = await client.ListTablesAsync(listRequest);
foreach (string name in listResponse.TableNames)
    Console.WriteLine(name);
```

### 3.8 처리량 증가·감소 한도 🔄

교재 슬라이드 21 강사 노트의 네 문장 중 세 문장은 지금도 맞고 한 문장이 다릅니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| `ReadCapacityUnits` 또는 `WriteCapacityUnits`를 **필요한 만큼 자주 늘릴 수 있다** | 맞습니다 |
| 단일 호출에서 테이블, 그 테이블의 GSI, 또는 둘의 조합에 대해 늘릴 수 있다 | 맞습니다 |
| 새 설정은 `UpdateTable` 작업이 완료될 때까지 효과를 발휘하지 않는다 | 맞습니다 |
| **"언제든 하루에 최대 4번 줄일 수 있습니다"** | 다릅니다. 아래 표 참조 |

현재 감소 한도는 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 하루의 정의 | **UTC 기준** |
| 하루 시작 시 | 사용 가능한 감소 횟수 **4회** |
| 보충 | 매시간 **1회** 추가. 동시에 보유할 수 있는 최대치는 4회 |
| 24시간 합계 | 최대 **27회**(첫 시간 4회 + 남은 23시간에 각 1회) |
| 테이블과 GSI | 감소 한도가 **분리**되어 있습니다. 다만 한 요청이 테이블과 GSI를 함께 줄이면서 어느 한쪽이 한도를 넘으면 **요청 전체가 거부**되고 부분 처리되지 않습니다 |

> — 출처: [Quotas in Amazon DynamoDB — Increasing or decreasing throughput](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

### 3.9 `ListTables`는 페이지 매김된다 🔄

교재는 슬라이드 19~20·22에서 "`ListTables` 작업은 파라미터가 필요하지 않습니다"라고 반복합니다. 이 문장은 지금도 맞습니다. 다만 교재 Java 리스트 예제는 전체 테이블을 한 번에 순회하는 것처럼 보입니다.

| 항목 | 내용 |
|---|---|
| 출력 | **페이지 매김**되며 한 페이지에 최대 **100개**의 테이블 이름을 반환 |
| `Limit` | 선택 사항. 미지정 시 한도는 **100**, 유효 범위 **1~100** |
| `ExclusiveStartTableName` | 선택 사항. 이전 응답의 `LastEvaluatedTableName` 값을 넘김 |
| 종료 조건 | 응답에 `LastEvaluatedTableName`이 **없으면** 더 가져올 테이블 이름이 없음 |

```bash
# 첫 페이지
aws dynamodb list-tables --limit 3
# {
#     "TableNames": ["Forum", "Reply", "Thread"],
#     "LastEvaluatedTableName": "Thread"
# }

# 다음 페이지
aws dynamodb list-tables --limit 3 --exclusive-start-table-name Thread
```

> — 출처: [ListTables API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ListTables.html)

---

## 4. 항목 로드

데이터 영역 작업으로 테이블 데이터에 대한 CRUD를 수행합니다. 데이터를 생성하는 API는 `PutItem`과 `BatchWriteItem`입니다.

### 4.1 항목 생성: `PutItem` 🔄

`PutItem`은 새 항목을 만들거나 **기존 항목을 새 항목으로 완전히 교체**합니다. 같은 기본 키를 가진 항목이 이미 있으면 새 항목이 기존 항목을 완전히 대체합니다.

```bash
aws dynamodb put-item \
  --table-name Notes \
  --item '{"UserId":{"S":"StudentD"}, "NoteId":{"N":"42"}, "Notes":{"S":"Test note"}}'
```

| 항목 | 내용 |
|---|---|
| 기본 동작 | **비조건부**입니다 |
| 필수 속성 | 항목을 추가할 때 **기본 키 속성만** 필수입니다 |
| `ReturnValues` | 같은 작업에서 항목의 속성 값을 반환할 수 있습니다. 덮어쓰기 여부를 판별하려면 `ALL_OLD`로 설정하고 응답에 `Attributes` 요소가 있는지 확인합니다 🆕 |
| 조건부 PUT | 지정된 기본 키가 있는 항목이 존재하지 않을 때만 추가하거나, 특정 속성 값을 가질 때만 기존 항목을 교체 |

교재 강사 노트는 "속성 값은 `null`일 수 없습니다"라고만 적습니다. 현재 문서는 더 정확합니다. 🔄

| 값 | 허용 여부 |
|---|---|
| 키가 아닌 속성의 **빈 문자열·빈 이진 값** | **허용** |
| 테이블·인덱스의 **키 속성**으로 쓰이는 문자열·이진 값 | 길이가 **0보다 커야 함** |
| 세트 유형 속성 | 비어 있을 수 없음 |
| 빈 값이 든 잘못된 요청 | `ValidationException`으로 거부 |

덮어쓰기를 방지하려면 테이블의 파티션 키 속성 이름과 함께 `attribute_not_exists` 함수를 쓴 조건 표현식을 사용합니다. 모든 레코드가 그 속성을 포함해야 하므로 `attribute_not_exists`는 일치 항목이 없을 때만 성공합니다.

```bash
aws dynamodb put-item \
  --table-name Notes \
  --item '{"UserId":{"S":"StudentD"}, "NoteId":{"N":"42"}, "Notes":{"S":"Test note"}}' \
  --condition-expression "attribute_not_exists(UserId)"
```

조건이 충족되지 않으면 `ConditionalCheckFailedException`(HTTP 400, 메시지 `The conditional request failed`)이 반환됩니다.

> — 출처: [PutItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

### 4.2 여러 항목 Put 또는 Delete: `BatchWriteItem` 🔄

```bash
aws dynamodb batch-write-item --request-items file://request-items.json
```

요청은 테이블 이름 하나 이상의 맵과 각 테이블에 수행할 작업 목록(`DeleteRequest` 또는 `PutRequest`)으로 구성됩니다.

```json
{
  "Notes": [
    { "PutRequest": { "Item": { "UserId": {"S": "StudentE"}, "NoteId": {"N": "55"}, "Notes": {"S": "Batch note"} } } },
    { "DeleteRequest": { "Key": { "UserId": {"S": "StudentB"}, "NoteId": {"N": "23"} } } }
  ]
}
```

교재가 제시하는 한도는 지금도 맞습니다.

| 작업 | 항목 수 | 데이터 크기 |
|---|---|---|
| `BatchWriteItem` | 최대 **25개** put 또는 delete | 최대 **16MB** |
| `BatchGetItem` | 최대 **100개** 항목 읽기 | 최대 **16MB** |
| 개별 항목 최대 크기 | **400KB** | — |

교재가 다루지 않는 동작: 🆕

| 항목 | 내용 |
|---|---|
| 항목 크기의 두 가지 의미 | 개별 항목은 **저장된 후** 최대 400KB일 수 있지만, API 호출 시 DynamoDB JSON 형식으로 전송되는 **표현**은 400KB보다 클 수 있습니다 |
| 원자성 | 개별 `PutItem`·`DeleteItem`은 원자적이지만 **`BatchWriteItem` 전체는 원자적이지 않습니다** |
| 실패 처리 | 실패한 작업은 `UnprocessedItems` 응답 파라미터로 반환됩니다. 루프를 돌며 재시도하되 **지수 백오프**를 강력히 권장합니다 |
| 개별 조건 지정 | **불가.** 개별 put·delete 요청에 조건을 지정할 수 없고, 삭제된 항목을 응답으로 반환하지 않습니다 |
| 병렬 처리 | `BatchWriteItem`은 지정한 put·delete를 병렬로 수행합니다. 병렬 처리는 지연 시간을 줄이지만 **소비하는 쓰기 용량 단위는 병렬 여부와 무관**합니다. 존재하지 않는 항목에 대한 삭제도 쓰기 용량 단위 1개를 소비합니다 |
| 배치 전체 거부 조건 | 요청 25개 초과 / 개별 항목 400KB 초과 / 총 요청 16MB 초과 / 같은 항목에 여러 작업 / 동일 해시·레인지 키 항목 2개 이상 / 존재하지 않는 테이블 / 기본 키 스키마 불일치 |
| 키 길이 상한 | 파티션 키 **2,048바이트**, 정렬 키 **1,024바이트** |
| 업데이트 | **`BatchWriteItem`은 항목을 업데이트할 수 없습니다.** 기존 항목에 수행하면 값이 덮어써져 업데이트된 것처럼 보이므로, 항목을 업데이트하려면 `UpdateItem`을 쓰도록 권장합니다 |

> — 출처: [BatchWriteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html)

`BatchGetItem`도 교재보다 세부가 많습니다. 🆕

| 항목 | 내용 |
|---|---|
| 100개 초과 요청 | `Too many items requested for the BatchGetItem call` 메시지와 함께 **`ValidationException`** |
| 부분 결과 | 응답 크기 한도 초과, 프로비저닝된 처리량 초과, **파티션당 1MB 초과 요청**, 내부 처리 실패 시 부분 결과와 함께 `UnprocessedKeys`를 반환 |
| 예시 | 100개를 요청했지만 각 항목이 300KB이면 16MB를 넘지 않도록 **52개**만 반환하고 `UnprocessedKeys`를 함께 반환 |
| 읽기 일관성 | 기본은 **최종 일관성**. 테이블별로 `ConsistentRead`를 `true`로 설정 가능 |
| 순서 | DynamoDB는 **특정한 순서로 항목을 반환하지 않습니다.** 응답을 항목별로 파싱하려면 `ProjectionExpression`에 기본 키 값을 포함하도록 권장 |
| 같은 키 중복 지정 | `ValidationException` |

> — 출처: [BatchGetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html)

---

## 5. 항목 읽기

### 5.1 항목 읽기: `GetItem`

```bash
aws dynamodb get-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentA"}, "NoteId": {"N": "11"}}'
```

```json
{
  "Item": {
    "Note": { "S": "Hello World\n" },
    "NoteId": { "N": "11" },
    "UserId": { "S": "StudentA" }
  }
}
```

| 항목 | 내용 |
|---|---|
| 반환 | 지정한 기본 키를 가진 항목의 속성 집합 |
| 일치 항목이 없을 때 | 데이터를 반환하지 않고 응답에 **`Item` 요소가 없음** |
| 읽기 일관성 기본값 | **최종 일관성** |
| 강력한 일관성 | `ConsistentRead`를 `true`로 설정. 최종 일관성 읽기보다 시간이 더 걸릴 수 있으나 **항상 마지막으로 업데이트된 값**을 반환 |
| 기본 키 | 모든 속성을 제공해야 합니다. 복합 기본 키에서는 파티션 키와 정렬 키 값을 **모두** 제공 |

🆕 `AttributesToGet`은 레거시 파라미터이고 `ProjectionExpression`을 대신 사용합니다([5.7절](#57-레거시-조건-파라미터) 참조).

> — 출처: [GetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html)

### 5.2 데이터 쿼리: `Query` 🔄

`Query`는 파티션 키 속성 이름과 그 속성의 **단일 값**을 제공해야 하며 해당 파티션 키 값을 가진 모든 항목을 반환합니다.

```bash
aws dynamodb query \
  --table-name Notes \
  --key-condition-expression "UserId = :userid" \
  --expression-attribute-values '{":userid":{"S":"StudentA"}}'
```

> 교재 슬라이드 30의 CLI 예제는 `'{":userid":{"S":"StudentA"}'` 로 **닫는 중괄호가 하나 빠져** 있어 JSON 파싱에 실패합니다. 위 예제에서 교정했습니다.

#### 정렬 키 조건 연산자 🔄

교재 슬라이드 본문은 `=, <, >, <=, >=, AND, BETWEEN 또는 begins_with`를 나열하고, 같은 슬라이드의 강사 노트 목록에는 `BETWEEN`이 빠져 있습니다. 정확한 목록은 다음과 같습니다.

| 형태 | 의미 |
|---|---|
| `sortKeyName = :val` | 정렬 키 값이 `:val`과 같음 |
| `sortKeyName < :val` | 작음 |
| `sortKeyName <= :val` | 작거나 같음 |
| `sortKeyName > :val` | 큼 |
| `sortKeyName >= :val` | 크거나 같음 |
| `sortKeyName BETWEEN :v1 AND :v2` | `:v1` 이상 `:v2` 이하 |
| `begins_with(sortKeyName, :val)` | 특정 하위 문자열로 시작. **숫자 유형 정렬 키에는 쓸 수 없음.** 함수 이름은 대소문자 구분 |

`AND`는 독립된 비교 연산자가 아니라 `BETWEEN :v1 AND :v2` 구문의 일부입니다.

#### 필터 표현식은 읽는 양을 줄이지 않는다 🔄

교재 강사 노트는 "필터 표현식을 결합하고 결과를 제한할 수 있습니다. 둘을 결합하면 **필요한 것보다 많은 항목을 읽지 않고도** 구체화된 데이터 세트를 얻을 수 있습니다"라고 기재합니다. 이 부분은 오해를 낳습니다.

| 항목 | 확인된 내용 |
|---|---|
| 용량 계산 기준 | DynamoDB는 애플리케이션에 반환된 데이터 양이 아니라 **항목 크기**를 기준으로 소비 읽기 용량 단위를 계산합니다 |
| 프로젝션의 영향 | 모든 속성을 요청하든 `ProjectionExpression`으로 일부만 요청하든 소비 용량은 **같습니다** |
| 필터의 영향 | **`FilterExpression`을 쓰든 쓰지 않든 소비 용량은 같습니다** |
| 적용 시점 | `FilterExpression`은 `Query`가 끝난 뒤 결과가 반환되기 전에 적용됩니다 |
| 제약 | `Query`의 `FilterExpression`에는 **파티션 키·정렬 키 속성을 포함할 수 없습니다.** 그것은 `KeyConditionExpression`에 지정합니다 |

정리하면 **읽는 양을 줄이는 것은 `KeyConditionExpression`, `Limit`, 보조 인덱스**이고 필터는 반환 결과만 걸러 냅니다.

#### 그 밖의 `Query` 동작 🆕

| 항목 | 내용 |
|---|---|
| 페이지 한도 | 단일 `Query`는 `Limit`으로 설정한 최대 항목 수 또는 **최대 1MB**까지 읽고 그다음 필터를 적용 |
| `Limit`의 의미 | **평가할** 최대 항목 수이며 일치 항목 수가 아닙니다 |
| 정렬 | 결과는 **항상 정렬 키 값 순서**. 숫자면 숫자 순, 그 외는 UTF-8 바이트 순. 기본은 오름차순이고 `ScanIndexForward=false`로 역순 |
| 빈 결과 | 일치 항목이 없어도 결과 세트를 반환하고, 결과가 없는 쿼리도 **해당 읽기 유형의 최소 읽기 용량 단위를 소비** |
| 필터로 전부 걸러진 페이지 | 빈 결과 세트와 `LastEvaluatedKey`를 **함께** 반환할 수 있습니다 |
| GSI 읽기 일관성 | GSI는 **최종 일관성만** 지원합니다. GSI 쿼리에 `ConsistentRead=true`를 지정하면 `ValidationException` |

> — 출처: [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)

### 5.3 결과 페이지 매김 🔄

DynamoDB는 `Query` 결과에 페이지 매김을 하며 결과는 **1MB 이하**의 페이지로 나뉩니다. 애플리케이션은 첫 페이지를 처리한 다음 두 번째 페이지를 처리하는 식으로 계속합니다.

```json
{
  "Count": 8,
  "Items": [
    {"UserId": {"S": "StudentA"}},
    {"UserId": {"S": "StudentB"}},
    {"UserId": {"S": "StudentC"}},
    {"UserId": {"S": "StudentD"}},
    {"UserId": {"S": "StudentE"}},
    {"UserId": {"S": "StudentF"}},
    {"UserId": {"S": "StudentG"}},
    {"UserId": {"S": "StudentH"}}
  ],
  "LastEvaluatedKey": {
    "UserId": {"S": "StudentH"},
    "NoteId": {"N": "88"}
  },
  "ScannedCount": 8
}
```

절차는 교재와 같습니다. ① 결과에 `LastEvaluatedKey`가 있는지 확인 ② 있으면 같은 `KeyConditionExpression`으로 새 `Query`를 구성하고 그 값을 `ExclusiveStartKey`로 사용 ③ 실행 ④ 반복.

교재가 기재하지 않은 중요한 단서가 하나 있습니다. 🔄

| 교재 기재 | 확인된 내용 |
|---|---|
| "쿼리에 `LastEvaluatedKey` 요소가 있고 값이 `null`이 아닌 경우" 다음 페이지를 요청한다 | 비어 있지 않은 `LastEvaluatedKey`는 이전 `Query`가 **페이지 경계(1MB 페이지 크기 한도 또는 `Limit` 값)에서 멈췄다**는 뜻일 뿐이며 일치하는 항목이 더 남아 있다는 **보장이 아닙니다.** 특히 `FilterExpression`을 쓰면 필터 적용 **전에** 읽은 항목에 1MB·`Limit` 상한이 적용되므로, 한 페이지가 일치 항목 0개를 반환하면서도 `LastEvaluatedKey`를 포함할 수 있습니다. 결과 세트의 끝을 아는 유일한 방법은 `LastEvaluatedKey`가 비는 것입니다 |

🆕 AWS CLI 버전 1·2 모두 **자동 페이지 매김이 기본 동작**입니다. 직접 페이지를 넘기려면 `--no-paginate`를 씁니다. 참고로 `--max-items`는 `NextToken`을, `--limit`은 `LastEvaluatedKey`를 반환합니다.

> — 출처: [Paginating table query results in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html)

### 5.4 데이터 스캔: `Scan` 🔄

`Scan`은 테이블 또는 보조 인덱스의 **모든 항목**을 읽습니다. 기본적으로 모든 항목의 모든 데이터 속성을 반환하고 `ProjectionExpression`으로 일부만 반환할 수 있습니다.

```bash
aws dynamodb scan \
  --table-name Notes \
  --filter-expression "contains(Text, :word)" \
  --expression-attribute-values '{":word":{"S":"covid"}}'
```

| 항목 | 내용 |
|---|---|
| 페이지 한도 | 단일 `Scan` 요청은 최대 **1MB**의 데이터를 검색. 이 한도는 **필터 표현식 평가 전에** 적용 |
| 필터 적용 시점 | `Scan`이 끝난 뒤 결과가 반환되기 전 (교재와 일치) |
| 소비 용량 | **필터 표현식이 있든 없든 `Scan`이 소비하는 읽기 용량은 같습니다** 🔄 |
| 필터에 쓸 수 있는 속성 | `Query`와 달리 **파티션 키·정렬 키를 포함해 어떤 속성이든** 지정할 수 있습니다 🆕 |
| `Limit` | 필터 표현식 평가 **전에** 반환할 최대 항목 수를 지정. `Limit=6`에 필터를 붙이면 6개를 읽고 그중 일치하는 것만 남으므로 최종 결과는 6개 **이하** |
| 읽기 일관성 | 기본은 **최종 일관성**. `ConsistentRead=true`면 `Scan` 시작 시점 기준 강력한 일관성 |
| 반환 순서 | 파티션 키 값은 **정렬되지 않은 임의 순서**, 같은 파티션 키 값 안에서는 정렬 키 오름차순 🆕 |
| `ReturnConsumedCapacity` 기본값 | `NONE` 🆕 |

응답의 두 카운터를 구분해야 합니다. 🆕

| 필드 | 의미 |
|---|---|
| `ScannedCount` | 필터 적용 **전에** 평가된 항목 수 |
| `Count` | 필터 적용 **후** 남은 항목 수 |

필터를 쓰지 않으면 두 값이 같습니다. **`ScannedCount`가 높고 `Count`가 낮으면 비효율적인 `Scan`** 이라는 신호입니다.

용량을 소비하는 대상도 다릅니다. 🆕

| 스캔 대상 | 소비하는 읽기 용량 |
|---|---|
| 테이블 | 테이블의 프로비저닝된 읽기 용량 |
| 글로벌 보조 인덱스 | **인덱스의** 프로비저닝된 읽기 용량 |
| 로컬 보조 인덱스 | **기본 테이블의** 프로비저닝된 읽기 용량 |

`contains(path, operand)`는 문자열 부분 문자열, 세트 원소, 리스트 원소 포함 여부를 판정합니다. `path`와 `operand`가 같으면 오류입니다.

> — 출처: [Scanning tables in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)

### 5.5 쿼리 또는 스캔 선택

| 구분 | 내용 |
|---|---|
| 쿼리 | 기본 키 값을 기반으로 항목을 찾습니다 |
| 스캔 | 테이블 또는 보조 인덱스의 **모든 항목**을 읽습니다 |

교재 강조: 스캔은 쿼리보다 효율이 떨어지지만 유일한 솔루션인 경우가 자주 있습니다. 강사 노트의 지침도 그대로 유효합니다. **대규모 테이블에서 많은 결과를 제거하는 필터가 포함된 스캔 작업을 사용하지 마십시오.** 테이블 크기가 늘어나면 스캔이 느려지고 더 많은 용량을 사용합니다.

[5.4절](#54-데이터-스캔-scan)의 소비 용량 규칙이 왜 그런지를 설명해 줍니다. 필터가 많은 결과를 걸러 낸다는 것은 **읽기 용량은 이미 다 썼는데 돌려받는 항목만 적다**는 뜻입니다.

### 5.6 병렬 스캔 🆕

기본적으로 `Scan`은 데이터를 순차적으로 처리하고 DynamoDB는 1MB 단위로 데이터를 반환합니다. 순차 `Scan`은 프로비저닝된 읽기 처리 능력을 완전히 사용하지 못할 수 있습니다. DynamoDB가 대규모 테이블 데이터를 여러 물리적 파티션에 분산하더라도 **`Scan`은 한 번에 한 파티션만 읽을 수 있어** 처리량이 단일 파티션의 최대 처리량으로 제한되기 때문입니다.

병렬 스캔은 테이블 또는 보조 인덱스를 논리적으로 여러 **세그먼트**로 나누고 여러 작업자가 병렬로 세그먼트를 스캔합니다. 각 작업자는 스레드이거나 운영 체제 프로세스일 수 있습니다.

| 파라미터 | 내용 |
|---|---|
| `Segment` | 특정 작업자가 스캔할 세그먼트. 작업자마다 다른 값을 써야 하고 **0부터 시작**합니다 |
| `TotalSegments` | 병렬 스캔의 총 세그먼트 수. 애플리케이션이 사용할 **작업자 수와 같아야** 합니다 |

교재 슬라이드 34의 예: 애플리케이션이 세 개의 스레드를 스폰하고 각 스레드에 번호를 할당합니다. 각 스레드는 `Segment`를 지정된 번호로, `TotalSegments`를 3으로 설정해 스캔 요청을 실행하고, 지정된 세그먼트를 한 번에 1MB씩 스캔해 주 스레드에 데이터를 반환합니다.

교재가 다루지 않는 세그먼트 할당 방식: 🆕

- DynamoDB는 각 항목의 **파티션 키에 해시 함수를 적용해** 세그먼트를 할당합니다. 주어진 `TotalSegments` 값에서 **같은 파티션 키를 가진 항목은 항상 같은 `Segment`** 에 할당됩니다. 정렬 키 값이나 항목 컬렉션 크기와는 무관합니다.
- 세그먼트 할당이 파티션 키 해시만을 기준으로 하므로 **세그먼트 분포가 고르지 않을 수 있습니다.** 어떤 세그먼트에는 항목이 하나도 없고 어떤 세그먼트에는 큰 항목 컬렉션을 가진 파티션 키가 여럿 몰릴 수 있습니다.
- 따라서 **세그먼트 수를 늘려도 스캔 성능이 빨라진다고 보장할 수 없습니다.** 파티션 키가 키 공간에 고르게 분포하지 않으면 특히 그렇습니다.

교재 강사 노트의 주의 사항은 지금도 유효합니다. 작업자가 많은 병렬 스캔은 스캔 대상 테이블·인덱스의 프로비저닝된 처리량을 모두 소비하기 쉬우므로, 다른 애플리케이션이 같은 테이블에 읽기·쓰기가 많으면 실행하지 마십시오. 요청당 반환 데이터 양을 제어하려면 `Limit` 파라미터를 씁니다.

> — 출처: [Scanning tables in DynamoDB — Parallel scan](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)

### 5.7 레거시 조건 파라미터 🆕

교재의 모든 예제는 표현식 기반 파라미터를 씁니다. 이는 현재 권장 사항과 일치합니다. 다만 API에는 레거시 파라미터가 남아 있어 오래된 코드를 유지 보수할 때 만나게 됩니다.

| API 작업 | 레거시 파라미터 | 대신 사용할 표현식 파라미터 |
|---|---|---|
| `BatchGetItem`, `GetItem`, `Query`, `Scan` | `AttributesToGet` | `ProjectionExpression` |
| `DeleteItem`, `PutItem`, `UpdateItem` | `Expected` | `ConditionExpression` |
| `Query` | `KeyConditions` | `KeyConditionExpression` |
| `Query` | `QueryFilter` | `FilterExpression` |
| `Scan` | `ScanFilter` | `FilterExpression` |
| `UpdateItem` | `AttributeUpdates` | `UpdateExpression` |
| `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan` | `ConditionalOperator` | `ConditionExpression` / `FilterExpression` |

**한 호출에서 레거시 파라미터와 표현식 파라미터를 섞어 쓸 수 없습니다.** 예를 들어 `Query`를 `AttributesToGet`과 `ConditionExpression`으로 함께 호출하면 오류가 발생합니다.

> — 출처: [Legacy DynamoDB conditional parameters](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html)

---

## 6. 항목 업데이트와 삭제

### 6.1 항목 업데이트: `UpdateItem`

`UpdateItem`은 **전달된 속성만** 업데이트합니다. 기본 동작은 **비조건부**입니다.

```bash
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentC"}, "NoteId": {"N": "12"}}' \
  --update-expression "SET Notes = :newnote" \
  --expression-attribute-values '{":newnote":{"S":"To be reviewed"}}' \
  --return-values ALL_NEW
```

| 항목 | 내용 |
|---|---|
| 할 수 있는 일 | 기존 속성 값 업데이트, 새 속성 추가, 기존 항목의 속성 삭제 |
| 할 수 없는 일 | **기본 키 속성 업데이트** |
| 항목이 없을 때 | **새 항목을 생성**합니다(upsert) |
| `ReturnValues` | 같은 작업에서 항목의 속성 값을 반환. `ALL_NEW`는 업데이트 후 전체 항목 |
| 소비 용량 | DynamoDB는 업데이트 **전후의 항목 크기**를 고려하고 소비된 처리량은 두 크기 중 **더 큰 수치**를 반영합니다. 속성의 하위 집합만 업데이트해도 속성 전체에 해당하는 처리량을 소비합니다 |

이 소비 규칙은 현재 문서와 일치합니다. 🆕 `AttributeUpdates`는 레거시 파라미터이고 `UpdateExpression`을 대신 사용합니다.

> — 출처: [UpdateItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html)

### 6.2 조건부 쓰기 작업 🔄

기본적으로 DynamoDB 쓰기 작업(`PutItem`, `UpdateItem`, `DeleteItem`)은 **비조건부**입니다. 조건부 쓰기는 항목 속성이 하나 이상의 예상된 조건을 충족하는 경우에만 성공합니다.

교재 슬라이드 37의 의도는 "노트에 즐겨찾기 플래그가 지정되지 않은 경우에만 업데이트를 허용"하는 것입니다. 그런데 CLI 예제의 조건 표현식이 유효한 구문이 아닙니다.

| 교재 기재 | 문제 |
|---|---|
| `--condition-expression "Favorite NOT yes"` | `NOT`은 **조건 하나를 부정하는 논리 연산자**여서 `operand NOT operand` 형태의 이항 비교로 쓸 수 없습니다. 또 `yes` 같은 값은 리터럴로 쓸 수 없고 **표현식 속성 값(`:val`)** 으로 넘겨야 합니다 |
| `expression-attribute-values.json`에 `:newnote`만 있음 | 조건 표현식에 등장하는 자리표시자 값이 빠져 있습니다 |

조건 표현식의 문법은 다음과 같습니다.

```text
condition-expression ::=
      operand comparator operand
    | operand BETWEEN operand AND operand
    | operand IN ( operand (',' operand (, ...) ))
    | function
    | condition AND condition
    | condition OR condition
    | NOT condition
    | ( condition )

comparator ::= = | <> | < | <= | > | >=

function ::=
      attribute_exists (path)
    | attribute_not_exists (path)
    | attribute_type (path, type)
    | begins_with (path, substr)
    | contains (path, operand)
    | size (path)
```

`IN` 목록에는 최대 100개 값을 넣을 수 있습니다. 함수 이름은 **대소문자를 구분**합니다. Boolean 속성은 속성 자체를 조건으로 참조할 수 없고 표현식 속성 값으로 Boolean 값을 넘겨 `=` 또는 `<>`로 비교해야 합니다.

교재의 의도를 문법에 맞게 다시 쓰면 이렇게 됩니다.

```bash
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentD"}, "NoteId": {"N": "42"}}' \
  --update-expression "SET Notes = :newnote" \
  --condition-expression "attribute_not_exists(Favorite) OR Favorite <> :fav" \
  --expression-attribute-values file://expression-attribute-values.json
```

```json
{
  ":newnote": { "S": "Amazon DynamoDB is a ..." },
  ":fav": { "S": "yes" }
}
```

`Favorite` 속성이 아예 없거나 값이 `yes`가 아닐 때만 업데이트가 진행됩니다.

> — 출처: [Condition and filter expressions, operators, and functions in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html), [DynamoDB condition expression CLI example](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)

#### 조건이 실패해도 쓰기 용량은 소비된다 🔄

교재 강사 노트는 소비량을 두 경우로 나눠 기재합니다. 현재 문서의 서술은 한 가지 규칙입니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| "항목이 현재 테이블에 존재하지 않는 경우 DynamoDB는 쓰기 용량 단위 **1개**를 소비합니다" | 문서는 **'1개'라는 고정값을 제시하지 않습니다.** 조건이 `false`로 평가되어도 쓰기 용량 단위를 소비하며, 소비량은 **기존 항목 또는 생성·업데이트를 시도한 새 항목의 크기**에 따라 달라집니다 |
| "항목이 존재하는 경우 소비되는 쓰기 용량 단위 수는 항목 크기에 따라 달라집니다" | 맞습니다. 문서 예시: 기존 항목이 300KB이고 생성·업데이트를 시도한 새 항목이 310KB이면 소비되는 쓰기 용량은 **새 항목 310KB 기준**입니다 |

실패한 조건부 쓰기는 `ConditionalCheckFailedException`(HTTP 400)을 반환합니다. 이 경우 응답에서 소비된 쓰기 용량 정보를 받지 못하지만, Amazon CloudWatch에서 테이블의 `ConsumedWriteCapacityUnits` 지표를 확인할 수 있습니다. 🆕 예외에는 예외를 유발한 항목(`Item`)이 함께 담길 수 있고, `ReturnValuesOnConditionCheckFailure` 파라미터로 반환 방식을 제어합니다.

> — 출처: [DynamoDB read and write operations](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html), [PutItem API — Errors](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

### 6.3 항목 삭제: `DeleteItem`

```bash
aws dynamodb delete-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}'
```

| 항목 | 내용 |
|---|---|
| 동작 | 기본 키로 테이블의 **단일 항목**을 삭제 |
| 기본 동작 | **비조건부** |
| 멱등성 | **조건을 지정하지 않는 한 멱등적**입니다. 같은 항목이나 속성에 여러 번 실행해도 오류 응답이 발생하지 않습니다 |
| `ReturnValues` | 삭제하면서 같은 작업에서 항목의 속성 값을 반환할 수 있습니다 |
| 조건부 삭제 | 항목이 존재하거나 항목에 예상 속성 값이 있을 때만 삭제. 조건이 충족되면 삭제하고 그렇지 않으면 삭제하지 않습니다 |

교재 슬라이드 39의 모범 사례("조건부 작업은 항목 삭제 시 추가 보호 수준을 제공합니다")는 현재 문서와 일치합니다.

```bash
# 즐겨찾기가 아닌 노트만 삭제한다
aws dynamodb delete-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}' \
  --condition-expression "attribute_not_exists(Favorite)"
```

> — 출처: [DeleteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html)

---

## 7. 보다 상위 수준의 인터페이스

### 7.1 Java 2.x의 세 인터페이스 🆕

교재는 Java 상위 수준 인터페이스로 확장 클라이언트만 제시합니다. AWS SDK for Java 2.x는 추상화 수준에 따라 **세 가지** 인터페이스를 지원합니다.

| 인터페이스 | 내용 |
|---|---|
| 하위 수준 | 서비스 API와 일대일 매핑. 모든 DynamoDB API를 쓸 수 있지만 `.s()`·`.n()` 같은 함수로 값을 감싸야 해 장황합니다 |
| 상위 수준 (**DynamoDB 확장 클라이언트**) | 클라이언트 측 데이터 클래스와 테이블을 매핑. 주 클래스는 `DynamoDbEnhancedClient`이며 별도 패키지·Maven 아티팩트 `software.amazon.awssdk.enhanced.dynamodb`에 있습니다. 1.x의 상위 수준 인터페이스는 주 클래스 이름 `DynamoDBMapper`로 불렸습니다 |
| Document | 데이터 유형 설명자를 지정할 필요가 없고 데이터의 의미로 유형이 결정됩니다. `EnhancedDocument`를 사용하고 `fromJson(String)`·`toJson()` 유틸리티 메서드를 제공합니다 |

이 표가 교재 슬라이드 41 강사 노트의 "DynamoDB 확장 클라이언트 API는 Java v1.x용 SDK의 `DynamoDBMapper` 클래스의 후속 버전"을 뒷받침합니다.

🆕 확장 클라이언트는 `@DynamoDbBean` 대신 **`@DynamoDbImmutable`** 을 쓰면 불변 데이터 클래스도 매핑할 수 있습니다. 불변 클래스는 getter만 있고 SDK가 인스턴스를 만들 빌더 클래스를 요구하며, Project Lombok 같은 라이브러리로 보일러플레이트를 줄일 수 있습니다.

> — 출처: [Programming DynamoDB with the AWS SDK for Java 2.x — Supported interfaces](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 7.2 Java: DynamoDB 확장 클라이언트 데이터 클래스 🔄

교재 슬라이드 41 예제에는 네 가지 문제가 있습니다.

| 교재 | 문제 | 교정 |
|---|---|---|
| `@DynamoDbPartition` | 공식 주석 목록에 **그런 이름이 없습니다.** 같은 슬라이드의 강사 노트는 `@DynamoDbPartitionKey`로 올바르게 적었습니다 | `@DynamoDbPartitionKey` |
| `public void setNoteId(Integer noteId)` | 필드는 `private String noteId`, getter는 `String`을 반환하는데 setter만 `Integer`라서 컴파일되지 않습니다 | `setNoteId(String noteId)` |
| 클래스 이름 `Note` vs 강사 노트의 `NotesItems`·`NotesItem` | 세 이름이 섞여 있습니다 | `Note`로 통일 |
| `@DynamoDbAttribute` 위치 | 속성 수준 주석은 getter 또는 setter 중 **한쪽에만** 붙일 수 있습니다. 공식 가이드는 getter에 붙입니다 | getter에만 |

현재 공식 주석 목록의 주요 항목은 다음과 같습니다.

| 주석 | 적용 대상 | 역할 |
|---|---|---|
| `@DynamoDbBean` | 클래스 | 데이터 클래스를 테이블 스키마에 매핑 가능하다고 표시 |
| `@DynamoDbImmutable` | 클래스 | 불변 데이터 클래스를 매핑 가능하다고 표시 |
| `@DynamoDbPartitionKey` | 속성 | 테이블의 기본 파티션 키(해시 키)로 표시 |
| `@DynamoDbSortKey` | 속성 | 선택적 기본 정렬 키(레인지 키)로 표시 |
| `@DynamoDbAttribute` | 속성 | 매핑되는 테이블 속성을 정의하거나 이름을 변경 |
| `@DynamoDbIgnore` | 속성 | 매핑하지 않음 |
| `@DynamoDbSecondaryPartitionKey` | 속성 | GSI의 파티션 키로 표시 |
| `@DynamoDbSecondarySortKey` | 속성 | GSI 또는 LSI의 선택적 정렬 키로 표시 |
| `@DynamoDbAtomicCounter` | 속성 | 레코드를 쓸 때마다 숫자 속성을 증가 |
| `@DynamoDbAutoGeneratedTimestampAttribute` | 속성 | 쓰기 성공 시 현재 타임스탬프로 갱신 |
| `@DynamoDbAutoGeneratedUuid` | 속성 | 새 레코드를 쓸 때 UUID 생성 |
| `@DynamoDbVersionAttribute` | 속성 | 항목 버전 번호를 증가 |
| `@DynamoDbUpdateBehavior` | 속성 | `UpdateItem` 같은 업데이트 시 동작 지정 |
| `@DynamoDbFlatten` | 속성 | 별도 데이터 클래스의 속성을 최상위 속성으로 평탄화 |

```java
@DynamoDbBean // 클래스 수준 주석
public static class Note {    // Notes 테이블의 열에 해당하는 데이터 멤버를 설정
    private String userId;
    private String noteId;
    private String notes;

    @DynamoDbPartitionKey // 파티션 키에 대한 속성 수준 주석 (@DynamoDbPartition 이 아니다)
    @DynamoDbAttribute("UserId")
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @DynamoDbSortKey // 정렬 키에 대한 속성 수준 주석
    @DynamoDbAttribute("NoteId")
    public String getNoteId() { return this.noteId; }
    // 필드·getter 와 타입을 맞춘다. 교재의 setNoteId(Integer) 는 컴파일되지 않는다.
    public void setNoteId(String noteId) { this.noteId = noteId; }

    @DynamoDbAttribute("Notes")
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @Override
    public String toString() {
        return "Notes [UserId=" + userId + ", NoteId=" + noteId + ", Notes=" + notes + "]";
    }
}
```

🆕 `@DynamoDbAttribute("UserId")`가 필요한 이유가 있습니다. 데이터 클래스로부터 테이블을 생성하면 **테이블 속성 이름이 소문자로 시작**하므로, 대문자로 시작하게 하려면 `@DynamoDbAttribute(NAME)`로 이름을 지정해야 합니다.

> — 출처: [Data class annotations (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html)

### 7.3 Java: 확장 클라이언트로 항목 작업 🔄

`DynamoDbEnhancedClient`의 `table` 메서드에 테이블 이름과 테이블 스키마를 넘겨 `DynamoDbTable` 객체를 인스턴스화합니다. 이 객체로 테이블 작업(`createTable()`, `deleteTable()`, `describeTable()`)과 CRUD 작업(scan, query, getItem, putItem, updateItem 등)을 모두 수행할 수 있습니다.

교재 슬라이드 42는 `note.setNodeId("9")`를 호출합니다. 슬라이드 41의 클래스에는 `setNodeId`가 없고 `setNoteId`만 있으므로 오타입니다.

```java
// 확장 클라이언트 인스턴스화
static final DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.create();

// Notes 테이블 인스턴스화
static final DynamoDbTable<Note> notesTable = enhancedClient
        .table("Notes", TableSchema.fromBean(Note.class));

// 새 노트
Note note = new Note();
note.setUserId("UserA");
note.setNoteId("9");        // 교재의 setNodeId 는 오타
note.setNotes("This is a note");

// 항목 넣기
notesTable.putItem(note);

// 항목 가져오기
Note found = notesTable.getItem(
        Key.builder().partitionValue("UserA").sortValue("9").build());
```

🆕 확장 클라이언트로 테이블을 만들 때 빌더를 생략하고 `notesTable.createTable()`만 호출하면 프로비저닝된 처리량 값이 설정되지 않고 테이블의 **청구 모드가 온디맨드로** 설정됩니다. 이는 [2.5절](#25-초기-처리량-선택)의 "온디맨드가 기본이자 권장"과 같은 방향입니다.

> — 출처: [Create a DynamoDB table if needed (AWS SDK for Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html)

### 7.4 .NET: 객체 지속성 모델과 문서 모델 🔄

AWS SDK for .NET은 두 가지 상위 수준 모델을 제공합니다.

| 모델 | 네임스페이스 | 주요 클래스 | 테이블 생성·업데이트·삭제 |
|---|---|---|---|
| 객체 지속성 모델 | `Amazon.DynamoDBv2.DataModel` | `DynamoDBContext` | **불가** 🔄 |
| 문서 모델 | `Amazon.DynamoDBv2.DocumentModel` | `Table`, `Document` | **불가** |

교재는 "테이블을 생성·업데이트·삭제할 수 없다"는 제약을 문서 모델(슬라이드 44)에만 붙였습니다. 현재 문서는 **객체 지속성 모델에도 같은 제약이 있다**고 기술합니다. 두 모델 모두 데이터 작업만 제공하며 테이블 생성·업데이트·삭제에는 하위 수준 API를 써야 합니다. 🔄

#### 객체 지속성 모델

각 객체 인스턴스가 테이블의 항목에 매핑됩니다. 진입점은 `DynamoDBContext` 클래스로 DynamoDB에 대한 연결을 제공하고 테이블 액세스, CRUD 작업, 쿼리 실행을 가능하게 합니다.

| 매핑 방식 | 내용 |
|---|---|
| 명시적 매핑 | 기본 키에는 `DynamoDBHashKey`·`DynamoDBRangeKey` 속성을 **반드시** 사용합니다. 기본 키가 아닌 속성은 클래스 속성 이름과 테이블 속성 이름이 다를 때 `DynamoDBProperty`로 매핑을 정의합니다 |
| 기본 매핑 | 클래스 속성을 테이블에서 **이름이 같은** 속성에 매핑합니다 |
| 제외 | `DynamoDBIgnore`를 붙인 클래스 속성은 매핑되지 않고 저장·조회에 포함되지 않습니다 |
| 테이블 매핑 | `DynamoDBTable` 속성으로 클래스를 테이블에 매핑합니다 |

```csharp
[DynamoDBTable("Notes")]
public class NotesItems
{
    [DynamoDBHashKey]                 // 파티션 키
    public string UserId { get; set; }

    [DynamoDBRangeKey]                // 정렬 키
    public int NoteId { get; set; }

    [DynamoDBProperty("Tags")]        // 클래스 속성명과 테이블 속성명이 다를 때
    public List<string> NotesTags { get; set; }

    public string Notes { get; set; } // 기본 매핑: 같은 이름의 테이블 속성에 매핑

    [DynamoDBIgnore]                  // 매핑하지 않음
    public string NotesData { get; set; }
}
```

🆕 교재가 다루지 않는 두 가지: 객체 지속성 모델은 **낙관적 잠금(optimistic locking)** 을 지원해 업데이트 시 최신 사본을 갖고 있는지 확인할 수 있습니다. 그리고 데이터 유형 매핑은 다음과 같습니다.

| .NET 유형 | DynamoDB 유형 |
|---|---|
| 모든 숫자 유형 | `N` |
| 모든 문자열 유형 | `S` |
| `MemoryStream`, `byte[]` | `B` |
| `bool` | `N` (0 = false, 1 = true) |
| `DateTime` | `S` (ISO-8601 형식 문자열) |
| 컬렉션 유형 | `BS`, `SS`, `NS` |

#### 문서 모델

`Table` 클래스는 `PutItem`, `GetItem`, `DeleteItem` 같은 데이터 작업 메서드와 `Query`·`Scan` 메서드를 제공하고, `Document` 클래스는 테이블의 단일 항목을 나타냅니다.

```csharp
// GetItem 예제
Table table = Table.LoadTable(client, "Notes");
GetItemOperationConfig config = new GetItemOperationConfig()
{
    AttributesToGet = new List<string>() { "UserId", "Notes" },
    ConsistentRead = true
};
Document doc = await table.GetItemAsync("StudentA", config);
```

교재 슬라이드 44의 `UpdateItem` 예제는 `note["Favorite"] = null;`로 기존 속성을 삭제한다고 주석을 달았습니다. 🔄 현재 문서는 DynamoDB의 null 유형에 **`DynamoDBNull`** 을 쓰도록 기술하고, 문자열 유형의 빈 문자열 값과 List·Map 안의 빈 문자열 값은 **쓰기 요청에서 제거된다**고 설명합니다. 속성을 실제로 제거하려면 하위 수준 `UpdateExpression`의 `REMOVE` 절이 명확합니다.

```csharp
Table table = Table.LoadTable(client, "Notes");
var note = new Document();
// 업데이트하려는 속성을 설정합니다.
note["UserId"] = "StudentB"; // 기본 키
note["Notes"] = "Updated";
await table.UpdateItemAsync(note);
```

```bash
# 속성 자체를 제거하려면 하위 수준 UpdateExpression 의 REMOVE 절을 쓴다
aws dynamodb update-item \
  --table-name Notes \
  --key '{"UserId": {"S": "StudentB"}, "NoteId": {"N": "23"}}' \
  --update-expression "REMOVE Favorite"
```

문서 모델은 DynamoDB의 Boolean·null·list·map 유형을 각각 `DynamoDBBool`, `DynamoDBNull`, `DynamoDBList`, `Document`로 매핑합니다.

> — 출처: [Working with the .NET object persistence model and DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html), [Working with the .NET document model in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html)

### 7.5 교재에 없는 두 가지 인터페이스: PartiQL과 트랜잭션 🆕

#### PartiQL

Amazon DynamoDB는 SQL 호환 쿼리 언어인 **PartiQL**을 지원해 데이터를 select, insert, update, delete 할 수 있습니다.

| 항목 | 내용 |
|---|---|
| 실행 경로 | DynamoDB 콘솔, NoSQL Workbench, AWS CLI, DynamoDB API |
| API | `ExecuteStatement`, `BatchExecuteStatement`, `ExecuteTransaction` |
| 성능 | PartiQL 작업은 다른 DynamoDB 데이터 영역 작업과 **동일한 가용성·지연 시간·성능**을 제공합니다 |
| 제약 | DynamoDB는 PartiQL 쿼리 언어의 **하위 집합만** 지원하고 Amazon Ion 데이터 형식·Ion 리터럴은 지원하지 않습니다 |

```sql
SELECT UserId, Notes FROM Notes WHERE UserId = 'StudentA'
```

PartiQL이 SQL처럼 보이더라도 파티션 키를 지정하지 않으면 내부적으로 전체 스캔이 되는 성질은 변하지 않습니다. [2.2절](#22-nosql-설계-주요-개념)의 액세스 패턴 설계가 여전히 먼저입니다.

> — 출처: [PartiQL - a SQL-compatible query language for Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html)

#### 트랜잭션

조건부 쓰기([6.2절](#62-조건부-쓰기-작업))는 **항목 하나**에 대한 원자성만 보장합니다. 여러 항목이나 여러 테이블에 걸친 all-or-nothing이 필요하면 트랜잭션을 씁니다.

| 항목 | `TransactWriteItems` | `TransactGetItems` |
|---|---|---|
| 성격 | 동기·멱등 쓰기 | 동기 읽기 |
| 액션 수 | 최대 **100개** | 최대 **100개** |
| 대상 항목 | 같은 계정·같은 리전의 하나 이상의 테이블에서 최대 100개의 **서로 다른** 항목 | 같음 |
| 총 크기 | **4MB** 이하 | **4MB** 이하 |
| 액션 종류 | `Put`, `Update`, `Delete`, `ConditionCheck` | `Get` |

| 제약 | 내용 |
|---|---|
| `BatchWriteItem`과의 차이 | `BatchWriteItem`은 일부만 성공할 수 있지만 트랜잭션은 **전부 성공하거나 아무 변경도 없습니다** |
| 인덱스 | **트랜잭션은 인덱스를 대상으로 수행할 수 없습니다** |
| 같은 항목 중복 | 같은 트랜잭션 안에서 같은 항목을 여러 액션의 대상으로 삼을 수 없습니다 |
| 멱등성 | 클라이언트 토큰을 넣어 확보할 수 있고 토큰은 요청 완료 후 **10분간** 유효합니다 |
| 실패 | 조건이 충족되지 않거나 동시 트랜잭션과 충돌하면 `TransactionCanceledException` |
| 격리 수준 | 트랜잭션 작업과 표준 읽기·쓰기 작업 사이에는 **직렬화 가능(SERIALIZABLE)** 격리가 적용됩니다 |
| 용량 | 트랜잭션 쓰기는 준비와 커밋 두 번의 기본 쓰기를 수행하므로 1KB 이하 항목당 **2 WCU**를 소비하고, 조건 검사 실패로 취소되어도 소비됩니다 |

> — 출처: [Amazon DynamoDB Transactions: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)

### 7.6 Python 상위 수준 인터페이스는 어떻게 되나 🆕

교재는 상위 수준 인터페이스로 Java와 .NET만 다루고 Python을 다루지 않습니다. Python에서 상위 수준 인터페이스를 찾으면 boto3 **리소스 인터페이스**(`boto3.resource('dynamodb').Table(...)`)가 먼저 눈에 띕니다. 다만 방향이 정해져 있습니다.

| 항목 | 내용 |
|---|---|
| 신규 기능 | AWS Python SDK 팀은 boto3 리소스 인터페이스에 **새 기능을 추가할 계획이 없습니다** |
| 기존 코드 | 기존 인터페이스는 boto3 수명 주기 동안 계속 동작합니다 |
| 최신 기능 접근 | **클라이언트 인터페이스**를 통해 제공됩니다 |
| 스레드 안전성 | 리소스 인스턴스는 **스레드 안전하지 않습니다.** 스레드·프로세스 간에 공유하지 말고 각각 새로 만들어야 합니다 |
| Waiter | 리소스에도 waiter가 있어 원하는 상태에 도달할 때까지 폴링합니다 |

신규 코드는 `boto3.client('dynamodb')` 기준으로 작성합니다.

```python
import boto3

ddb = boto3.client('dynamodb')

# 항목 넣기 — 클라이언트 인터페이스는 DynamoDB JSON 형식을 그대로 쓴다
ddb.put_item(
    TableName='Notes',
    Item={
        'UserId': {'S': 'StudentD'},
        'NoteId': {'N': '42'},
        'Notes': {'S': 'Test note'},
    },
    # 덮어쓰기 방지
    ConditionExpression='attribute_not_exists(UserId)',
)

# 쿼리 — 페이지네이터를 쓰면 1MB 페이지 경계를 SDK 가 대신 넘긴다
paginator = ddb.get_paginator('query')
for page in paginator.paginate(
        TableName='Notes',
        KeyConditionExpression='UserId = :userid',
        ExpressionAttributeValues={':userid': {'S': 'StudentA'}}):
    for item in page['Items']:
        print(item)
```

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

---

## 8. DynamoDB 캐싱

### 8.1 DynamoDB 캐싱 옵션 🔄

Amazon DynamoDB는 규모와 성능을 고려하여 설계되었습니다. **대부분의 경우 DynamoDB 응답 시간은 한 자릿수 밀리초** 단위로 측정됩니다. 하지만 일부 사용 사례는 **마이크로초** 단위의 응답 시간이 필요합니다. 이런 경우 DAX가 최종적으로 일관된 데이터에 액세스할 때 빠른 응답 시간을 제공합니다.

교재는 캐싱 옵션으로 DAX와 Amazon ElastiCache 두 가지를 제시합니다. ElastiCache 쪽 서술이 현재와 다릅니다.

| 교재 기재 | 확인된 내용 |
|---|---|
| "**Memcached 또는 Redis** 프로토콜을 준수하는 서버 노드를 배포 및 실행하는 웹 서비스" | ElastiCache는 **Valkey, Memcached, Redis OSS** 세 엔진과 함께 작동합니다 |
| 노드 기반 클러스터만 전제 | **서버리스 캐시**와 노드 기반 클러스터 두 형식으로 운영할 수 있습니다 |

| 형식 | 내용 |
|---|---|
| 서버리스 캐시 | 1분 이내에 고가용성 캐시를 만들 수 있고 인스턴스 프로비저닝이나 노드·클러스터 구성이 필요하지 않습니다. Valkey 7.2 이상, Memcached 1.6.22 이상, Redis OSS 7.1과 호환됩니다 |
| 노드 기반 클러스터 | 노드 유형, 노드 수, 가용 영역별 노드 배치를 직접 선택하고 클러스터 모드 사용 여부를 고릅니다. 노드 기반 Valkey 클러스터에서는 분산 멀티 AZ 트랜잭션 로그에 데이터를 유지하는 durability를 활성화할 수 있습니다 |

교재와 같이 이 강의는 DAX에 초점을 맞춥니다.

> — 출처: [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

### 8.2 Amazon DynamoDB Accelerator(DAX) 🆕

DAX는 까다로운 애플리케이션에서 빠른 인 메모리 성능을 활용할 수 있는 **DynamoDB 호환 캐싱 서비스**입니다. 교재가 제시하는 세 가지 핵심 시나리오는 현재 문서와 일치합니다.

| # | 시나리오 |
|---|---|
| 1 | 인 메모리 캐시로서 최종 읽기 일관성 워크로드의 응답 시간을 한 자릿수 밀리초에서 마이크로초로 **자릿수 단위로** 줄입니다 |
| 2 | DynamoDB와 **API 호환**인 관리형 서비스를 제공해 운영·애플리케이션 복잡성을 줄입니다. 기존 애플리케이션에 최소한의 기능 변경만 필요합니다 |
| 3 | 읽기 중심·버스트 워크로드에서 **읽기 용량 단위 오버 프로비저닝** 필요를 줄여 처리량을 높이고 운영 비용을 절감합니다 |

DAX 적합·부적합 사용 사례입니다. 교재 목록에 근거와 이유를 보충했습니다.

| 적합 | 이유 |
|---|---|
| 읽기에서 가장 빠른 응답 시간을 요구하는 애플리케이션 | 실시간 입찰, 소셜 게이밍, 트레이딩 등 |
| 소수의 항목을 다른 항목보다 더 자주 읽는 애플리케이션 | 핫 키와 불균등 트래픽 분포의 영향을 완화 |
| 읽기 집약적이면서 비용에 민감한 애플리케이션 | 읽기 활동을 DAX로 옮겨 구매해야 하는 RCU 수를 줄임 |
| 대규모 데이터 집합에 반복적인 읽기가 필요한 애플리케이션 | 다른 애플리케이션의 읽기 용량을 잠식하는 것을 방지 |

| 부적합 | 이유 |
|---|---|
| 강력한 읽기 일관성이 필요한 애플리케이션 | DAX는 **최종 일관성** 데이터에 대한 액세스를 제공합니다 |
| 읽기에 마이크로초 응답 시간이 필요하지 않은 애플리케이션 | 반복 읽기를 테이블에서 덜어낼 필요가 없다면 이득이 없습니다 |
| 쓰기 집약적인 애플리케이션 | 🆕 쓰기가 많으면 **클러스터 내 DAX 노드 간 복제가 늘어** 리소스 소비와 가용성 위험이 커집니다 |
| 반복 읽기가 많지 않은 애플리케이션 | 🆕 DAX는 **캐시 적중률이 90%를 넘을 때** 가장 잘 작동합니다. 적중률이 낮으면 캐시 미스가 늘어 클러스터 리소스를 더 씁니다 |

교재가 다루지 않는 DAX 특성: 🆕

| 항목 | 내용 |
|---|---|
| 처리 규모 | 멀티 AZ DAX 클러스터는 **초당 수백만 건**의 요청을 처리할 수 있습니다 |
| 암호화 | **저장 중 암호화**(프라이머리 → 읽기 복제본 전파 시 디스크에 기록되는 데이터)와 **전송 중 암호화**(TLS, 클러스터 x509 인증서 검증) 모두 지원 |
| 지원 언어 | Go, Java, Node.js, Python, .NET |
| 플랫폼 | **EC2-VPC 전용** |
| IAM | 클러스터 서비스 역할 정책이 **`dynamodb:DescribeTable`** 을 허용해야 합니다 |
| 주의 | DAX 클러스터는 저장한 항목의 **최상위 속성 이름 메타데이터를 무기한 유지**합니다. 타임스탬프·UUID·세션 ID를 속성 **이름**으로 쓰면 시간이 지나며 클러스터 메모리가 소진될 수 있습니다(속성 **값**은 문제 없음) |

> — 출처: [In-memory acceleration with DynamoDB Accelerator (DAX)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html)

### 8.3 DAX가 처리하는 요청 🔄

교재 슬라이드 48이 제시하는 읽기 작업 네 개는 현재 문서와 일치합니다. 쓰기 작업 목록에는 하나가 빠져 있습니다.

| 구분 | 교재 기재 | 확인된 내용 |
|---|---|---|
| 읽기 | `GetItem`, `BatchGetItem`, `Query`, `Scan` | 동일 |
| 쓰기 (write-through) | `BatchWriteItem`, `UpdateItem`, `DeleteItem`, `PutItem` | 이 네 개 **+ `TransactWriteItems`** |

읽기 요청의 처리 흐름:

| 요청 유형 | 동작 |
|---|---|
| 최종 일관성 읽기 (기본) — 캐시 적중 | DynamoDB에 접근하지 않고 캐시에서 반환 |
| 최종 일관성 읽기 (기본) — 캐시 미스 | DynamoDB로 요청을 전달하고 결과를 반환하면서 **프라이머리 노드 캐시에 기록** |
| **강력한 일관성 읽기** | DynamoDB로 요청을 통과시키고 **그 결과를 캐시하지 않습니다** 🆕 |

쓰기 요청의 처리 흐름(write-through):

1. DAX가 요청을 DynamoDB로 보냅니다.
2. DynamoDB가 쓰기 성공을 확인합니다.
3. DAX가 항목 캐시에 기록합니다.
4. DAX가 요청자에게 성공을 반환합니다.

즉 작업은 **테이블과 DAX 양쪽에 성공적으로 기록되었을 때만** 성공합니다. 🆕 스로틀링을 포함해 어떤 이유로든 DynamoDB 쓰기가 실패하면 항목은 DAX에 캐시되지 않고 예외가 요청자에게 반환됩니다. `TransactWriteItems`는 조금 다릅니다. DynamoDB가 트랜잭션 완료를 확인하면 DAX가 곧바로 성공을 반환하고, 백그라운드에서 각 항목에 대해 `TransactGetItems`를 호출해 항목 캐시를 채웁니다(직렬화 가능 격리를 보장하기 위해).

🆕 교재가 다루지 않는 중요한 제약: **DAX는 `CreateTable`, `UpdateTable` 같은 테이블 관리 작업을 인식하지 않습니다.** 애플리케이션이 이런 작업을 수행해야 하면 DAX가 아니라 DynamoDB에 직접 액세스해야 합니다.

노드 용량을 초과하는 요청에는 `ThrottlingException`을 반환합니다. CloudWatch의 `ThrottledRequestCount` 지표로 모니터링하고, 자주 발생하면 클러스터를 확장하도록 권장합니다.

> — 출처: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html), [DAX and DynamoDB consistency models](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.consistency.html)

### 8.4 DAX의 두 캐시 🆕

모든 DAX 클러스터에는 **항목 캐시**와 **쿼리 캐시**가 따로 있습니다. 두 캐시는 목적이 다르고 서로 독립적으로 동작합니다.

| 캐시 | 저장 대상 | 키 |
|---|---|---|
| 항목 캐시 | `GetItem`·`BatchGetItem` 결과 | 항목의 기본 키 값 |
| 쿼리 캐시 | `Query`·`Scan` 결과 세트 | 요청 **파라미터 값** |

| 항목 | 내용 |
|---|---|
| 항목 캐시 TTL | 기본 **5분**. 클러스터를 만들 때 지정할 수 있습니다 |
| TTL을 0으로 지정하면 | 항목 캐시는 LRU 축출 또는 write-through 작업으로만 갱신되고, 쿼리 캐시는 응답을 캐시하지 않습니다 |
| 축출 | 두 캐시 모두 LRU 목록을 유지하고 캐시가 차면 만료되지 않은 항목도 축출합니다. LRU는 항상 활성화되며 사용자가 구성할 수 없습니다 |
| 캐시 간 영향 | **항목 캐시에 대한 쓰기는 쿼리 캐시에 영향을 주지 않습니다.** `Scan`으로 항목 캐시를 예열할 수 없습니다 |
| 노드 간 일관성 | 프라이머리 노드의 변경은 다른 노드로 복제되며 이 복제는 **최종 일관성**이고 보통 1초 이내에 완료됩니다. 따라서 두 클라이언트가 같은 키를 같은 클러스터에서 읽어도 접근한 노드에 따라 다른 값을 받을 수 있습니다 |
| DAX를 우회한 변경 | 애플리케이션이 DAX를 우회해 DynamoDB 테이블을 직접 수정하면, TTL이 만료될 때까지 DAX와 DynamoDB가 같은 키에 대해 서로 다른 값을 갖습니다 |

DAX를 쓰는 애플리케이션은 **최종 일관성 데이터를 허용하도록 설계**해야 합니다.

> — 출처: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html)

### 8.5 DAX 클러스터 구성 🆕

교재는 DAX를 개념 수준으로만 다룹니다. 실제로 클러스터를 만들 때 필요한 값은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 노드 | 클러스터의 최소 구성 단위. 각 노드가 DAX 소프트웨어 인스턴스를 실행하고 캐시된 데이터의 복제본 하나를 유지합니다 |
| 확장 방법 | ① 노드를 추가해 전체 읽기 처리량을 늘립니다 ② 더 큰 노드 유형을 씁니다(새 클러스터를 만들어야 함) |
| 노드 유형 | 클러스터 내 **모든 노드는 같은 노드 유형**입니다 |
| 프라이머리 노드 | 캐시된 데이터 요청 처리, **DynamoDB 쓰기 처리**, 축출 정책에 따른 캐시 축출 |
| 읽기 복제본 | 캐시된 데이터 요청 처리와 캐시 축출. **DynamoDB에 쓰지 않습니다** |
| 클러스터 최대 노드 수 | **11개** (프라이머리 1개 + 읽기 복제본 최대 10개) |
| 프로덕션 권장 | 서로 다른 가용 영역에 배치한 **최소 3개 노드.** 3개가 내결함성의 요건입니다 |
| 1~2개 노드 클러스터 | 개발·테스트용. **내결함성이 없습니다.** 소프트웨어·하드웨어 오류 시 클러스터가 사용 불가가 되거나 캐시 데이터를 잃을 수 있습니다 |
| 클러스터당 테이블 수 | 최대 **500개**. 초과하면 가용성·성능이 저하될 수 있습니다 |
| 리전 | 리전 내 DAX 클러스터는 **같은 리전의** DynamoDB 테이블만 상호 작용합니다. 다른 리전에 테이블이 있으면 그 리전에도 클러스터를 띄워야 합니다 |
| 네트워크 | VPC에서 실행되며 보안 그룹 인그레스 규칙에 **TCP 포트 8111**을 열어야 합니다 |
| 페일오버 | 프라이머리 노드 장애 시 DAX가 읽기 복제본으로 자동 페일오버하고 새 프라이머리로 지정합니다 |
| 런타임 설정 | 캐시 TTL 정책 등은 **파라미터 그룹**으로 관리해 클러스터 내 모든 노드를 동일하게 구성합니다 |

클러스터 엔드포인트를 쓰면 애플리케이션이 개별 노드의 호스트 이름과 포트를 알 필요가 없습니다.

```text
# 전송 중 암호화를 쓰지 않는 클러스터 엔드포인트
dax://my-cluster.l6fzcv.dax-clusters.us-east-1.amazonaws.com

# 전송 중 암호화를 쓰는 클러스터 엔드포인트
daxs://my-encrypted-cluster.l6fzcv.dax-clusters.us-east-1.amazonaws.com
```

> — 출처: [DAX cluster components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.cluster.html)

### 8.6 DAX 노드 유형 🆕

DAX는 두 계열의 인스턴스를 제공합니다.

| 계열 | 예 | 특성 |
|---|---|---|
| 고정 성능 | R4, R5, R7 | 지속적으로 높은 CPU 성능이 필요한 데이터베이스에 권장 |
| 버스트 가능 성능 | T2, T3 | 기준 CPU 성능을 제공하고 필요할 때 기준을 넘어 버스트. 기준 성능과 버스트 능력은 **CPU 크레딧**으로 관리 |

| 구분 | DAX T2 | DAX T3 |
|---|---|---|
| 모드 | **표준(standard) 모드** | **무제한(unlimited) 모드** |
| 크레딧 소진 후 | CPU 사용률이 기준 수준으로 점차 낮아집니다 | 크레딧 잔액이 0이어도 기준을 넘어 버스트할 수 있습니다(추가 요금) |
| 용도 | 가격 예측 가능성이 필요한 테스트·개발 워크로드 | 중간 정도 CPU 사용에 일시적 급증이 있는 워크로드 |

예를 들어 `dax.t3.small`은 시간당 24 CPU 크레딧을 받아 CPU 코어의 **20%** 에 해당하는 기준 성능을 제공하고 최대 **576 CPU 크레딧**까지 적립합니다. CPU 크레딧 1개는 풀 CPU 코어 1분의 성능에 해당합니다.

> — 출처: [DAX T3/T2 burstable instances](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.Burstable.html)

### 8.7 DAX 클라이언트

애플리케이션에서 DAX를 쓰려면 사용하는 프로그래밍 언어의 **DAX 클라이언트**를 씁니다. 교재 강사 노트의 "DAX를 사용하려면 Amazon DynamoDB Accelerator(DAX) SDK가 필요합니다"가 이것입니다. DAX 클라이언트는 기존 DynamoDB 애플리케이션에 미치는 영향을 최소화하도록 설계되어 **몇 가지 간단한 코드 수정만** 필요합니다.

애플리케이션은 EC2 인스턴스에 DAX 클라이언트와 함께 배포하고, 런타임에 DAX 클라이언트가 모든 DynamoDB API 요청을 DAX 클러스터로 보냅니다. DAX가 직접 처리할 수 있으면 처리하고, 그렇지 않으면 DynamoDB로 통과시킵니다.

> — 출처: [Developing with the DynamoDB Accelerator (DAX) client](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.client.html)

---

## 9. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 9.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| RCU 예제 (슬라이드 10) | "2KB 항목을 반환한 쿼리는 1 RCU가 부과됩니다" | 1 RCU는 **강력한 일관성** 읽기 기준입니다. `GetItem`·`Query`·`Scan`의 기본값인 **최종 일관성 읽기에서는 0.5 RCU**, 트랜잭션 읽기는 2 RCU입니다. 같은 예제의 쓰기 2 WCU는 맞습니다 | [읽기·쓰기 작업](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html) |
| 정렬 키 연산자 목록 (슬라이드 30) | 본문은 `=, <, >, <=, >=, AND, BETWEEN 또는 begins_with`, 강사 노트는 `BETWEEN` 없이 6개 | `AND`는 독립 연산자가 아니라 `BETWEEN :v1 AND :v2` 구문의 일부입니다. 정확한 목록은 `=`, `<`, `<=`, `>`, `>=`, `BETWEEN :v1 AND :v2`, `begins_with(sortKeyName, :val)`이고 `begins_with`는 숫자 정렬 키에 쓸 수 없습니다. 본문과 강사 노트가 서로 다릅니다 | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| 필터 표현식의 효과 (슬라이드 30) | "둘을 결합하면 필요한 것보다 많은 항목을 읽지 않고도 구체화된 데이터 세트를 얻을 수 있습니다" | DynamoDB는 반환 데이터 양이 아니라 **항목 크기**를 기준으로 용량을 계산하며 `FilterExpression` 사용 여부와 무관하게 소비 용량이 같습니다. `Scan`도 동일합니다. 읽는 양은 `KeyConditionExpression`·`Limit`·보조 인덱스로 줄입니다 | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| 조건 표현식 구문 (슬라이드 37) | `--condition-expression "Favorite NOT yes"` | 조건 표현식 문법에서 `NOT`은 **조건 하나를 부정하는 논리 연산자**이므로 이항 비교로 쓸 수 없고, `yes` 같은 값은 리터럴로 쓸 수 없어 표현식 속성 값으로 넘겨야 합니다. 또 교재의 값 파일에는 조건에 필요한 값이 없습니다 | [조건·필터 표현식 연산자와 함수](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html) |
| `@DynamoDbPartition` (슬라이드 41) | 코드의 파티션 키 주석 | 공식 데이터 클래스 주석 목록에 그런 이름은 없습니다. 정확한 이름은 **`@DynamoDbPartitionKey`** 이며 같은 슬라이드의 강사 노트는 올바르게 적었습니다 | [데이터 클래스 주석](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html) |
| `ddb.createTable("Notes")` (슬라이드 18) | 문자열 리터럴을 전달 | 슬라이드 주석·강사 노트는 "`CreateTableRequest` 객체의 정보를 사용"한다고 서술하지만 코드가 다릅니다. `DynamoDbClient.createTable`은 요청 객체 또는 빌더 `Consumer`를 받는 오버로드만 있습니다 | [테이블 생성 예제 (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| `waitUntilTableExists("Notes")` (슬라이드 18) | 문자열 리터럴을 전달 | 공식 예제는 `waiter.waitUntilTableExists(b -> b.tableName("Notes").build())` 처럼 `DescribeTableRequest`를 구성하는 빌더를 넘깁니다 | [테이블 생성 예제 (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| `NoteId` 속성 유형 (슬라이드 13·14) | 슬라이드 13 코드·노트는 `S`, 슬라이드 14 노트는 `N` | `AttributeType` 유효값은 `S`·`N`·`B`이므로 둘 다 문법적으로 가능하지만 하나의 `Notes` 테이블에 두 정의가 공존할 수는 없습니다. 슬라이드 15의 .NET 예제와 슬라이드 25 이후 모든 CLI 예제가 `N`이므로 이 문서는 `N`으로 통일했습니다 | [AttributeDefinition](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html) |
| .NET 코드 오타 (슬라이드 16) | `AttributeName = "NoteId",I` 와 `},,` | 잉여 문자와 쉼표 중복으로 컴파일되지 않습니다. 교재 자체의 오타이므로 AWS 문서 근거 없이 코드만 교정했습니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| query CLI JSON (슬라이드 30) | `'{":userid":{"S":"StudentA"}'` | 닫는 중괄호가 하나 빠져 JSON 파싱에 실패합니다. 교재 자체의 표기 오류입니다 | — ([9.5절](#95-검증하지-못한-항목)) |
| 확장 클라이언트 예제 (슬라이드 41·42) | 클래스 이름 `Note` / 강사 노트 `NotesItems`·`NotesItem`, `setNoteId(Integer)`, `note.setNodeId("9")` | 세 이름이 섞여 있고, 필드·getter는 `String`인데 setter만 `Integer`라서 컴파일되지 않고, `setNodeId`는 존재하지 않는 메서드입니다. 교재 내부 불일치입니다 | — ([9.5절](#95-검증하지-못한-항목)) |

### 9.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 프로비저닝 처리량 감소 횟수 | "언제든 하루에 최대 4번 줄일 수 있습니다" | 하루(UTC)를 4회로 시작하고 **매시간 1회 보충**, 동시 보유 최대 4회, 24시간 합계 최대 **27회**. 테이블과 GSI 한도는 분리되지만 한 요청이 둘을 함께 줄이며 어느 한쪽이 한도를 넘으면 요청 전체가 거부 | [DynamoDB 할당량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| 용량 모드 전환 | "24시간마다 한 번씩 읽기 및 쓰기 용량 모드를 전환할 수 있습니다" | 프로비저닝 → 온디맨드는 **24시간 롤링 윈도 내 최대 4회**, 온디맨드 → 프로비저닝은 **언제든** | [용량 모드 전환 고려 사항](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-switching-capacity-modes.html) |
| 테이블 생성 시 용량 | "AWS CLI 또는 AWS SDK를 사용하여 테이블을 생성할 때 테이블의 용량을 프로비저닝해야 합니다" | `CreateTable`의 `BillingMode`는 필수가 아니고 `PAY_PER_REQUEST`를 쓰면 `ProvisionedThroughput`을 지정할 수 없습니다. 문서는 온디맨드를 **기본이자 권장 처리량 옵션**으로 기술하고, 확장 클라이언트에서 빌더 없이 `createTable()`을 호출하면 청구 모드가 온디맨드로 설정됩니다 | [온디맨드 용량 모드](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| 용량 모드 제시 순서 | 프로비저닝을 먼저, 온디맨드를 "알 수 없는 워크로드" 대안으로 | 온디맨드가 **대부분의 워크로드에 대한 기본·권장** 옵션. 프로비저닝은 예측 가능한 성장세의 안정적 워크로드용 | [온디맨드 용량 모드](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| 실패한 조건부 쓰기의 용량 | "항목이 현재 테이블에 존재하지 않는 경우 쓰기 용량 단위 **1개**를 소비합니다" | 문서는 '1개'라는 고정값을 제시하지 않고 **기존 항목 또는 생성·업데이트를 시도한 새 항목의 크기**를 기준으로 소비된다고 기술합니다(예: 기존 300KB, 새 항목 310KB → 310KB 기준) | [읽기·쓰기 작업](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html) |
| `LastEvaluatedKey`의 의미 | "값이 `null`이 아닌 경우" 다음 페이지를 요청 | 비어 있지 않은 `LastEvaluatedKey`는 페이지 경계(1MB 또는 `Limit`)에서 멈췄다는 뜻일 뿐이며 **일치 항목이 더 남아 있다는 보장이 아닙니다.** 필터를 쓰면 일치 항목 0개 페이지도 키를 포함할 수 있습니다 | [쿼리 결과 페이지 매김](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html) |
| 속성 값과 `null` | "속성 값은 `null`일 수 없습니다" | 키가 아닌 속성에는 **빈 문자열·빈 이진 값이 허용**되고, 테이블·인덱스의 키 속성으로 쓰이는 문자열·이진 값만 길이가 0보다 커야 합니다. 세트 유형은 비어 있을 수 없습니다 | [PutItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html) |
| `CreateTableResult` | `CreateTableResult result = ddb.createTable(request);` | AWS SDK for Java 2.x의 반환 형식은 **`CreateTableResponse`** 이고 `tableDescription()`으로 테이블 속성을 반환합니다. `CreateTableResult`는 1.x 클래스 이름입니다 | [CreateTableResponse (Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/dynamodb/model/CreateTableResponse.html) |
| .NET 동기 메서드 | `client.CreateTable` / `UpdateTable` / `DeleteTable` / `ListTables` | 현재 공식 .NET(v4) DynamoDB 코드 예제는 **비동기 메서드**(`CreateTableAsync` 등)를 사용하고 `BillingMode.PAY_PER_REQUEST`를 지정합니다 | [CreateTable 코드 예제](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_CreateTable_section.html) |
| .NET 객체 지속성 모델의 제약 | 테이블 생성·삭제 불가 제약을 문서 모델에만 붙임 | **객체 지속성 모델에도 같은 제약**이 있습니다. 두 모델 모두 데이터 작업만 제공하며 테이블 생성·업데이트·삭제에는 하위 수준 API를 써야 합니다 | [.NET 객체 지속성 모델](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html) |
| 문서 모델의 `null` 대입 | `note["Favorite"] = null;` 로 속성 삭제 | 문서는 DynamoDB null 유형에 **`DynamoDBNull`** 을 쓰도록 기술하고, 문자열 유형의 빈 문자열 값과 List·Map 안의 빈 문자열 값은 쓰기 요청에서 제거된다고 설명합니다. 속성 제거는 `UpdateExpression`의 `REMOVE`가 명확합니다 | [.NET 문서 모델](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html) |
| DAX 지원 쓰기 작업 | `BatchWriteItem`, `UpdateItem`, `DeleteItem`, `PutItem` 네 개 | 이 네 개 **+ `TransactWriteItems`.** `TransactWriteItems`는 DynamoDB 완료 확인 후 성공을 반환하고 백그라운드에서 `TransactGetItems`로 캐시를 채웁니다 | [DAX 일관성 모델](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.consistency.html) |
| ElastiCache 엔진 | "Memcached 또는 Redis 프로토콜을 준수하는 서버 노드" | **Valkey, Memcached, Redis OSS** 세 엔진. 노드 기반 클러스터 외에 **서버리스 캐시** 형식도 있습니다 | [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html) |
| `ListTables` 결과 | "파라미터가 필요하지 않습니다"(맞음)만 서술 | 출력은 **페이지당 최대 100개**로 페이지 매김되며 `Limit` 미지정 시 한도 100(범위 1~100). 전체를 얻으려면 `LastEvaluatedTableName` → `ExclusiveStartTableName` 루프가 필요합니다 | [ListTables API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ListTables.html) |

### 9.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS SDK for Java 1.x (슬라이드 19~20 Java 예제) | **2025년 12월 31일 지원 종료**(2024년 1월 12일 발표, 2024년 7월 31일 유지 관리 모드) | AWS SDK for Java 2.x(`software.amazon.awssdk`). 테이블 작업은 `DynamoDbClient`, 매핑은 `DynamoDbEnhancedClient`, 데이터 유형 설명자를 피하려면 `EnhancedDocument` | [Java 2.x로 DynamoDB 프로그래밍](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html) |
| 레거시 조건 파라미터 (`AttributesToGet`·`Expected`·`KeyConditions`·`QueryFilter`·`ScanFilter`·`AttributeUpdates`·`ConditionalOperator`) | 비권장. 표현식 파라미터와 **혼용 불가** | `ProjectionExpression`·`ConditionExpression`·`KeyConditionExpression`·`FilterExpression`·`UpdateExpression`. 교재는 이미 표현식 기반만 쓰므로 현재 권장과 일치합니다 | [레거시 조건 파라미터](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html) |
| boto3 리소스 인터페이스 (교재에 없음. Python 상위 수준을 찾을 때 마주치는 경로) | 신규 기능 추가 계획 없음. 기존 인터페이스는 계속 동작 | `boto3.client('dynamodb')`. 리소스 인스턴스는 스레드 안전하지 않아 스레드마다 새로 만들어야 합니다 | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

### 9.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| PartiQL | SQL 호환 쿼리 언어. `ExecuteStatement`·`BatchExecuteStatement`·`ExecuteTransaction`. 콘솔·NoSQL Workbench·CLI·API로 실행. DynamoDB는 하위 집합만 지원하고 Amazon Ion은 미지원 | [PartiQL for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html) |
| 트랜잭션 | `TransactWriteItems`(최대 100 액션, 서로 다른 100 항목, 4MB), `TransactGetItems`(동일). 액션은 `Put`·`Update`·`Delete`·`ConditionCheck`. 인덱스 대상 불가, 같은 항목 중복 불가, 클라이언트 토큰 10분, `TransactionCanceledException`, SERIALIZABLE 격리 | [DynamoDB 트랜잭션](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html) |
| 보조 인덱스 할당량 | LSI 테이블당 최대 5개, GSI 테이블당 기본 할당량 20개(조정 가능). 프로젝션 속성은 모든 인덱스 합쳐 100개(`INCLUDE`에만 적용). LSI는 파티션 키 값당 10GB | [DynamoDB 할당량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| GSI·LSI의 일관성 차이 | GSI는 최종 일관성 읽기만 지원하며 `ConsistentRead=true`를 지정하면 `ValidationException` | [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html) |
| 기타 테이블 할당량 | 이진 단위(1KB=1024B), 테이블 크기 상한 없음, 계정·리전당 테이블 초기 할당량 2,500개, 테이블당 처리량 40,000/40,000, 계정당 프로비저닝 80,000/80,000 | [DynamoDB 할당량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| 버스트·적응형 용량의 값 | 버스트는 미사용 용량 최대 5분(300초) 보유. 적응형 용량은 자동·무료. 파티션 한계는 읽기 3,000회·쓰기 1,000회. LSI가 있으면 항목 컬렉션을 분할하지 않음 | [버스트·적응형 용량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html) |
| 온디맨드 초기 처리량 | 새 온디맨드 테이블은 초당 쓰기 4,000·읽기 12,000까지 즉시 처리. 직전 최고치의 두 배까지 즉시 수용. 최대 처리량 설정으로 비용 제한 가능 | [온디맨드 용량 모드](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| `CreateTable` 비동기 동작 | `CREATING` → `ACTIVE`, `ACTIVE`에서만 읽기·쓰기. 테이블 이름은 리전 내 고유, 보조 인덱스가 있는 테이블은 한 번에 하나만 `CREATING` | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| `BatchWriteItem` 세부 동작 | 저장 후 400KB와 JSON 전송 표현 크기의 차이, `UnprocessedItems` + 지수 백오프, 개별 조건 지정 불가, 키 길이 상한(파티션 2,048B·정렬 1,024B) | [BatchWriteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html) |
| `BatchGetItem` 세부 동작 | 100개 초과 시 `ValidationException`, 파티션당 1MB 초과 요청 시 부분 결과, `UnprocessedKeys`, 반환 순서 보장 없음, 같은 키 중복 시 `ValidationException` | [BatchGetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchGetItem.html) |
| `Scan`의 `ScannedCount`·`Count` | `ScannedCount`는 필터 전 평가 항목 수, `Count`는 필터 후 남은 수. 전자가 크고 후자가 작으면 비효율. LSI 스캔은 기본 테이블 용량을, GSI 스캔은 인덱스 용량을 소비 | [Scan 문서](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html) |
| 병렬 스캔 세그먼트 할당 | 파티션 키 해시로 세그먼트를 할당하므로 같은 파티션 키는 항상 같은 세그먼트. 분포가 고르지 않을 수 있어 세그먼트 수를 늘려도 성능 향상이 보장되지 않음 | [Scan 문서 — Parallel scan](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html) |
| Java 2.x의 세 인터페이스 | 하위 수준 / 확장 클라이언트 / Document(`EnhancedDocument`, `fromJson`·`toJson`). `@DynamoDbImmutable`로 불변 클래스 매핑. `queryPaginator`·`scanPaginator` 자동 페이지 매김 | [Java 2.x로 DynamoDB 프로그래밍](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html) |
| 확장 클라이언트 주석 목록 | `@DynamoDbAtomicCounter`, `@DynamoDbAutoGeneratedTimestampAttribute`, `@DynamoDbAutoGeneratedUuid`, `@DynamoDbVersionAttribute`, `@DynamoDbUpdateBehavior`, `@DynamoDbFlatten` 등. 속성 주석은 getter 또는 setter 한쪽에만 | [데이터 클래스 주석](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-anno-index.html) |
| 확장 클라이언트 속성 이름 규칙 | 데이터 클래스로부터 테이블을 만들면 속성 이름이 소문자로 시작. 대문자로 시작하려면 `@DynamoDbAttribute(NAME)` | [테이블 생성 예제 (Java 2.x)](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/ddb-en-client-gs-ddbtable.html) |
| .NET 객체 지속성 모델의 낙관적 잠금 | 업데이트 시 최신 사본을 갖고 있는지 확인하는 optimistic locking 지원 | [.NET 객체 지속성 모델](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html) |
| DAX 강력한 일관성 읽기 처리 | 강력한 일관성 읽기는 DynamoDB로 통과하고 **캐시되지 않습니다.** DAX는 테이블 관리 작업을 인식하지 않습니다 | [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html) |
| DAX의 두 캐시 | 항목 캐시(TTL 기본 5분)와 쿼리 캐시가 분리되어 독립 동작. 항목 캐시 쓰기는 쿼리 캐시에 영향 없음. LRU는 항상 활성 | [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html) |
| DAX 클러스터 구성 | 클러스터당 최대 11개 노드(프라이머리 1 + 복제본 10), 프로덕션 최소 3개 노드·다중 AZ, 클러스터당 테이블 500개, TCP 포트 8111, `dax://`·`daxs://` 엔드포인트, 파라미터 그룹 | [DAX 클러스터 구성 요소](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.cluster.html) |
| DAX 노드 유형 | 고정 성능(R4·R5·R7)과 버스트 가능(T2 표준 모드·T3 무제한 모드). `dax.t3.small`은 시간당 24 크레딧, 기준 20%, 최대 576 크레딧 | [DAX T3/T2 버스트 인스턴스](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.Burstable.html) |
| DAX 운영 제약 | EC2-VPC 전용, 캐시 적중률 90% 초과 시 최적, 최상위 속성 이름 메타데이터를 무기한 유지, 저장 중·전송 중 암호화 지원, Go·Java·Node.js·Python·.NET 지원 | [DAX 개요](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html) |

### 9.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| `CreateTable`에서 `BillingMode`를 생략했을 때 적용되는 값 | 확인한 것은 두 가지입니다. `BillingMode`가 `CreateTable`의 필수 파라미터가 아니라는 점(CreateTable API 문서), 그리고 온디맨드가 "기본이자 권장 처리량 옵션"이라는 서술(온디맨드 용량 모드 문서)입니다. 다만 **API 호출에서 `BillingMode`를 아예 생략했을 때 어떤 값이 적용된다고 명시한 문장은 찾지 못했습니다.** 확장 클라이언트에서 빌더 없이 `createTable()`을 호출하면 온디맨드가 된다는 것은 Java 개발자 안내서로 확인했지만, 이는 SDK 상위 수준 동작이므로 API 기본값과 같다고 단정할 수 없습니다. 실무에서는 `BillingMode`를 **명시**하는 것이 안전합니다 |
| DAX 노드 유형 전체 목록과 사양 | 고정 성능 계열(R4·R5·R7)과 버스트 가능 계열(T2·T3)의 존재, 두 계열의 모드 차이, `dax.t3.small`의 크레딧 수치는 DAX T3/T2 문서로 확인했습니다. **사용 가능한 노드 유형의 전체 목록은 문서가 요금 페이지를 가리키고 있어 이 문서에서는 조회하지 않았습니다.** 클러스터 사이징이 필요하면 요금 페이지를 직접 확인하세요 |
| DAX 클라이언트 배포 사이트 | DAX 문서는 여러 언어용 클라이언트를 별도 배포 사이트에서 제공한다고 안내합니다. 그 사이트는 HTTP 전용 주소이고 이 프로젝트의 인용 가능 도메인 목록에 없어 **조회하지 않았습니다.** 문서에 링크가 있다는 사실만 확인했습니다 |
| 슬라이드 16 .NET 코드 오타 (`,I`, `},,`) | 컴파일되지 않는 표기 오류입니다. AWS 문서로 확인할 성질의 사실이 아니라 교재 자체의 오타이므로 코드만 교정하고 근거 인용은 붙이지 않았습니다 |
| 슬라이드 30 query CLI의 닫는 중괄호 누락 | 같은 이유로 문서 검증 대상이 아닙니다. JSON 파싱이 실패하는 표기 오류이며 중괄호만 보완했습니다 |
| 슬라이드 41~42 확장 클라이언트 예제의 이름·타입 불일치 | 클래스 이름 세 가지 혼용, `setNoteId(Integer)` 타입 불일치, `setNodeId` 오타는 모두 교재 내부 불일치입니다. 외부 문서로 검증할 대상이 아니므로 이름과 타입만 맞췄습니다 |
| `NoteId`를 `S`와 `N` 중 무엇으로 정의해야 하는가 | `AttributeType` 유효값이 `S`·`N`·`B`이고 기본 키 속성이 문자열·숫자·이진 중 하나여야 한다는 것은 확인했습니다. **어느 쪽이 이 애플리케이션의 '올바른' 설계인지는 AWS 문서로 판별할 수 없습니다.** 이 문서는 슬라이드 15의 .NET 예제와 슬라이드 25 이후 모든 CLI 예제가 `N`을 쓴다는 다수 근거로 `N`을 택했습니다 |
| .NET 문서 모델의 동기 메서드 지원 여부 | 이 문서의 .NET 예제는 공식 .NET(v4) DynamoDB 코드 예제가 비동기를 쓰는 것에 맞춰 `GetItemAsync`·`UpdateItemAsync`로 적었습니다. **문서 모델의 `Table` 클래스가 동기 `GetItem`·`Update`를 여전히 노출하는지는 별도로 확인하지 않았습니다.** 문서 모델 문서는 제공 메서드 이름을 `PutItem`·`GetItem`·`DeleteItem`으로 표기합니다 |
| 실습 3 워크플로 (슬라이드 51~52) | 원본 덱에 다이어그램만 있고 텍스트가 없습니다. 요약할 원문이 없어 이 문서에서는 다루지 않았습니다 |

---

## 10. 지식 확인 및 핵심 정리

### 지식 확인 문제 (참/거짓)

교재 슬라이드 50의 문제를 그대로 싣습니다.

**문제 1**: NoSQL DB의 주요 설계 개념에는 크기, 모양 및 속도가 포함됩니다.

- ✅ **정답: 참**

**문제 2**: 일반적인 액세스 패턴과 테이블 내 항목의 고유성 수준을 중심으로 파티션 키를 디자인합니다.

- ✅ **정답: 참**

**문제 3**: 개발자는 트래픽이 일관되지 않을 것으로 예상하는 경우 테이블의 용량 모드를 프로비저닝으로 설정해야 합니다.

- ❌ **정답: 거짓** — 온디맨드 모드는 일관되지 않은 트래픽에 가장 적합합니다.

**문제 4**: 기본값으로 DynamoDB 쓰기 작업(PutItem, UpdateItem, DeleteItem)은 조건부입니다.

- ❌ **정답: 거짓** — 기본값으로 DynamoDB 쓰기 작업(PutItem, UpdateItem, DeleteItem)은 비조건부입니다.

**문제 5**: BatchWriteItem은 항목을 업데이트할 수 없습니다. 항목을 업데이트하려면 UpdateItem 작업을 사용합니다.

- ✅ **정답: 참** — 기존 항목에 `BatchWriteItem`을 수행하면 값이 덮어써져 업데이트된 것처럼 보이지만, 문서는 항목을 업데이트하려면 `UpdateItem`을 쓰도록 권장합니다.

**문제 6**: 설계에 따라 테이블 스캔이 쿼리보다 효율적입니다.

- ❌ **정답: 거짓** — 테이블 스캔은 쿼리보다 효율이 떨어지므로 최소한으로 사용해야 합니다.

> — 출처: [BatchWriteItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html)

### 🆕 보충 문제 (최신화 내용 확인)

**문제 7**: 읽기 및 쓰기 용량 모드는 24시간마다 한 번씩 전환할 수 있습니다.

- ❌ **정답: 거짓** — 프로비저닝에서 온디맨드로는 **24시간 롤링 윈도 안에서 최대 4번**, 온디맨드에서 프로비저닝으로는 **언제든** 전환할 수 있습니다. ([2.5절](#25-초기-처리량-선택))

> — 출처: [용량 모드 전환 고려 사항](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-switching-capacity-modes.html)

**문제 8**: 프로비저닝된 처리량은 하루에 최대 4번까지만 줄일 수 있습니다.

- ❌ **정답: 거짓** — 하루(UTC 기준)를 4회의 감소 횟수로 시작하고 **매시간 1회가 추가**되므로 24시간 전체로는 최대 **27회**까지 줄일 수 있습니다. 동시에 보유할 수 있는 최대치가 4회입니다. 증가는 필요한 만큼 자주 할 수 있습니다. ([3.8절](#38-처리량-증가감소-한도))

> — 출처: [DynamoDB 할당량 — 처리량 증가·감소](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html)

**문제 9**: AWS CLI 또는 SDK로 테이블을 만들 때는 반드시 읽기·쓰기 용량을 프로비저닝해야 합니다.

- ❌ **정답: 거짓** — `CreateTable`의 `BillingMode`는 필수가 아니고 `PAY_PER_REQUEST`(온디맨드)를 선택하면 `ProvisionedThroughput`을 **지정할 수 없습니다.** 문서는 온디맨드를 기본이자 권장 처리량 옵션으로 기술합니다. 다만 실무에서는 `BillingMode`를 명시하는 것이 안전합니다([9.5절](#95-검증하지-못한-항목)). ([2.5절](#25-초기-처리량-선택))

> — 출처: [온디맨드 용량 모드](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

**문제 10**: 2KB 항목 하나를 반환하는 쿼리는 1 RCU를 소비합니다.

- ❌ **정답: 거짓** — 1 RCU는 **강력한 일관성** 읽기 기준입니다. `Query`·`GetItem`·`Scan`의 기본값인 **최종 일관성 읽기에서는 0.5 RCU**, 트랜잭션 읽기는 2 RCU입니다. 읽기의 항목 크기는 4KB 배수로 올림됩니다. ([2.5절](#25-초기-처리량-선택))

> — 출처: [DynamoDB 읽기·쓰기 작업](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html)

**문제 11**: 필터 표현식을 쓰면 `Query`가 읽는 항목이 줄어들어 소비하는 읽기 용량도 줄어듭니다.

- ❌ **정답: 거짓** — DynamoDB는 반환 데이터 양이 아니라 **항목 크기**를 기준으로 용량을 계산하며, `FilterExpression` 사용 여부와 무관하게 **소비 용량은 같습니다.** `Scan`도 동일합니다. 읽는 양을 줄이는 것은 `KeyConditionExpression`, `Limit`, 보조 인덱스입니다. ([5.2절](#52-데이터-쿼리-query))

> — 출처: [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)

**문제 12**: 응답에 `LastEvaluatedKey`가 있으면 조건에 일치하는 항목이 더 남아 있다는 뜻입니다.

- ❌ **정답: 거짓** — 비어 있지 않은 `LastEvaluatedKey`는 이전 요청이 **페이지 경계(1MB 또는 `Limit`)에서 멈췄다**는 뜻일 뿐입니다. 필터를 쓰면 일치 항목이 0개인 페이지도 `LastEvaluatedKey`를 포함할 수 있습니다. 끝을 아는 유일한 방법은 `LastEvaluatedKey`가 비는 것입니다. ([5.3절](#53-결과-페이지-매김))

> — 출처: [쿼리 결과 페이지 매김](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html)

**문제 13**: `--condition-expression "Favorite NOT yes"` 는 "`Favorite`가 `yes`가 아닐 때"를 뜻하는 유효한 조건 표현식입니다.

- ❌ **정답: 거짓** — `NOT`은 **조건 하나를 부정하는 논리 연산자**여서 이항 비교로 쓸 수 없고, `yes` 같은 값은 리터럴로 쓸 수 없어 표현식 속성 값으로 넘겨야 합니다. 올바른 형태는 `"attribute_not_exists(Favorite) OR Favorite <> :fav"` 이고 `:fav` 값을 `--expression-attribute-values`로 전달합니다. ([6.2절](#62-조건부-쓰기-작업))

> — 출처: [조건·필터 표현식 연산자와 함수](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)

**문제 14**: 조건부 쓰기가 조건 불충족으로 실패하면 쓰기 용량은 소비되지 않습니다.

- ❌ **정답: 거짓** — 조건이 `false`로 평가되어도 DynamoDB는 **쓰기 용량 단위를 소비합니다.** 소비량은 기존 항목 또는 생성·업데이트를 시도한 새 항목의 크기에 따라 달라집니다. 실패한 조건부 쓰기는 `ConditionalCheckFailedException`을 반환하고 응답에는 소비 용량 정보가 없으므로 CloudWatch의 `ConsumedWriteCapacityUnits` 지표로 확인합니다. ([6.2절](#62-조건부-쓰기-작업))

> — 출처: [DynamoDB 읽기·쓰기 작업](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/read-write-operations.html)

**문제 15**: 병렬 스캔의 `TotalSegments`를 늘리면 스캔이 항상 빨라집니다.

- ❌ **정답: 거짓** — DynamoDB는 **파티션 키 해시**로 세그먼트를 할당하므로 같은 파티션 키를 가진 항목은 항상 같은 세그먼트로 갑니다. 세그먼트 분포가 고르지 않을 수 있어 세그먼트 수를 늘려도 성능 향상이 **보장되지 않습니다.** 작업자가 많으면 프로비저닝된 처리량을 모두 소비하기도 쉽습니다. ([5.6절](#56-병렬-스캔))

> — 출처: [Scan 문서 — Parallel scan](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html)

**문제 16**: 글로벌 보조 인덱스도 `ConsistentRead=true`로 강력한 일관성 읽기를 할 수 있습니다.

- ❌ **정답: 거짓** — GSI는 **최종 일관성 읽기만** 지원합니다. GSI를 쿼리하면서 `ConsistentRead=true`를 지정하면 `ValidationException`이 발생합니다. 테이블과 LSI는 강력한 일관성 읽기가 가능합니다. 테이블당 LSI는 최대 5개, GSI는 기본 할당량 20개입니다. ([2.4절](#24-인덱스-설계와-보조-인덱스-할당량))

> — 출처: [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html)

**문제 17**: `PutItem`으로 항목을 넣을 때 속성 값에 빈 문자열은 쓸 수 없습니다.

- ❌ **정답: 거짓** — 키가 아닌 속성에는 **빈 문자열과 빈 이진 값이 허용됩니다.** 테이블·인덱스의 키 속성으로 쓰이는 문자열·이진 값만 길이가 0보다 커야 합니다. 세트 유형 속성은 비어 있을 수 없습니다. ([4.1절](#41-항목-생성-putitem))

> — 출처: [PutItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html)

**문제 18**: `ListTables`는 파라미터가 필요하지 않으므로 한 번 호출하면 계정의 모든 테이블 이름을 받습니다.

- ❌ **정답: 거짓** — 파라미터가 필요하지 않다는 것은 맞지만 출력은 **페이지당 최대 100개**로 페이지 매김됩니다. 전체를 얻으려면 응답의 `LastEvaluatedTableName`을 다음 요청의 `ExclusiveStartTableName`으로 넘기거나 SDK 페이지네이터를 씁니다. ([3.9절](#39-listtables는-페이지-매김된다))

> — 출처: [ListTables API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ListTables.html)

**문제 19**: 여러 항목에 걸친 all-or-nothing 쓰기가 필요하면 `BatchWriteItem`을 씁니다.

- ❌ **정답: 거짓** — `BatchWriteItem`은 **일부만 성공할 수 있습니다.** 실패한 작업은 `UnprocessedItems`로 반환되고 지수 백오프로 재시도해야 합니다. all-or-nothing이 필요하면 **`TransactWriteItems`** 를 씁니다(최대 100 액션, 서로 다른 100 항목, 총 4MB). 단 트랜잭션은 인덱스를 대상으로 수행할 수 없습니다. ([7.5절](#75-교재에-없는-두-가지-인터페이스-partiql과-트랜잭션))

> — 출처: [DynamoDB 트랜잭션](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)

**문제 20**: 파티션 키 속성에는 리스트나 맵 같은 문서 유형도 쓸 수 있습니다.

- ❌ **정답: 거짓** — 기본 키 속성은 **스칼라**여야 하고 허용되는 데이터 유형은 **문자열·숫자·이진**뿐입니다. 키가 아닌 속성에는 이런 제약이 없습니다. ([2.3절](#23-파티션-키-디자인))

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

**문제 21**: DAX 클러스터에 강력한 일관성 읽기를 요청하면 DAX가 결과를 캐시해 두었다가 다음 요청에 씁니다.

- ❌ **정답: 거짓** — 강력한 일관성 읽기는 DAX가 DynamoDB로 **통과시키고 그 결과를 캐시하지 않습니다.** DAX는 최종 일관성 데이터에 대한 액세스를 가속하는 용도이며, DAX가 이상적이지 않은 첫 번째 사례가 강력한 일관성이 필요한 애플리케이션입니다. ([8.3절](#83-dax가-처리하는-요청))

> — 출처: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html)

**문제 22**: DAX 클라이언트로 `CreateTable`을 호출해 테이블을 만들 수 있습니다.

- ❌ **정답: 거짓** — **DAX는 `CreateTable`·`UpdateTable` 같은 테이블 관리 작업을 인식하지 않습니다.** 이런 작업이 필요하면 DAX가 아니라 DynamoDB에 직접 액세스해야 합니다. ([8.3절](#83-dax가-처리하는-요청))

> — 출처: [DAX: How it works](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.html)

**문제 23**: 프로덕션 DAX 클러스터는 노드 하나로도 내결함성을 갖습니다.

- ❌ **정답: 거짓** — 프로덕션에는 서로 다른 가용 영역에 배치한 **최소 3개 노드**를 강력히 권장하며 3개가 내결함성의 요건입니다. 1~2개 노드 클러스터는 개발·테스트용이고 내결함성이 없습니다. 클러스터는 최대 11개 노드(프라이머리 1 + 읽기 복제본 10)를 지원합니다. ([8.5절](#85-dax-클러스터-구성))

> — 출처: [DAX 클러스터 구성 요소](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.concepts.cluster.html)

**문제 24**: Amazon ElastiCache는 Memcached와 Redis 두 엔진만 지원합니다.

- ❌ **정답: 거짓** — ElastiCache는 **Valkey, Memcached, Redis OSS** 세 엔진과 함께 작동하고, 노드 기반 클러스터 외에 **서버리스 캐시** 형식도 제공합니다. ([8.1절](#81-dynamodb-캐싱-옵션))

> — 출처: [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

### 모듈 학습 목표 달성 확인

이 모듈을 완료하면 다음을 수행할 수 있습니다.

- ✅ AWS SDK를 사용하여 Amazon DynamoDB와 상호 작용하는 프로그램 개발
- ✅ CRUD 작업을 수행하여 테이블, 인덱스, 데이터에 액세스
- ✅ DynamoDB에 액세스할 때 개발자 모범 사례 설명
- ✅ 성능을 향상하는 DynamoDB 캐싱 옵션 검토

### 한 장 요약

| 주제 | 기억할 것 |
|---|---|
| 설계 | 액세스 패턴을 모두 식별할 때까지 테이블을 만들지 않습니다. 파티션 키는 높은 카디널리티 + 일반적인 액세스 패턴 |
| 키 | 기본 키 속성은 스칼라이며 문자열·숫자·이진만 가능. LSI 5개 / GSI 기본 20개, GSI는 최종 일관성만 |
| 용량 | 온디맨드가 기본·권장. 강력한 일관성 읽기 1 RCU, 최종 일관성 0.5 RCU, 쓰기 1KB당 1 WCU. 감소는 24시간 최대 27회 |
| 쓰기 | 쓰기 작업은 기본 비조건부. `PutItem`은 완전 교체, `UpdateItem`은 upsert이며 전후 크기 중 큰 값으로 과금. 조건 실패도 용량 소비 |
| 읽기 | `Query`는 파티션 키 단일 값 필수, `Scan`은 전체 읽기. 둘 다 페이지 1MB. **필터는 소비 용량을 줄이지 않습니다** |
| 배치·트랜잭션 | `BatchWriteItem` 25개/16MB(업데이트 불가, 부분 실패 가능), `BatchGetItem` 100개/16MB, `TransactWriteItems` 100액션/4MB(all-or-nothing, 인덱스 불가) |
| 상위 수준 | Java는 확장 클라이언트(`@DynamoDbBean`·`@DynamoDbPartitionKey`·`@DynamoDbSortKey`), .NET은 객체 지속성·문서 모델(둘 다 테이블 생성 불가), Python은 클라이언트 인터페이스 |
| 캐싱 | DAX는 최종 일관성 읽기 가속. write-through 5개 작업, 강력한 일관성 읽기는 통과·미캐시, 테이블 관리 작업 미인식. 프로덕션 3노드 이상 |
