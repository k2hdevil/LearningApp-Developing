# 모듈 7: 데이터베이스 시작하기

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [AWS 데이터베이스 옵션](#2-aws-데이터베이스-옵션)
3. [DynamoDB 주요 개념](#3-dynamodb-주요-개념)
4. [개발자를 위한 DynamoDB 액세스 옵션](#4-개발자를-위한-dynamodb-액세스-옵션)
5. [DynamoDB를 사용한 프로그래밍](#5-dynamodb를-사용한-프로그래밍)
6. [DynamoDB 종속성](#6-dynamodb-종속성)
7. [DynamoDB 서비스 참조](#7-dynamodb-서비스-참조)
8. [요청 및 응답](#8-요청-및-응답)
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

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- DynamoDB의 주요 구성 요소 설명
- DynamoDB에 연결하는 여러 방법 탐색
- 코드의 SDK 종속성 및 설정 정의
- 요청 및 응답 객체 사용

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| **모듈 7** | **데이터베이스 시작하기** — AWS 데이터베이스 옵션 비교, DynamoDB 주요 개념, 액세스 방법, SDK 종속성, 요청·응답 |
| 모듈 8 | 데이터베이스 작업 처리 |
| 실습 3 | Amazon DynamoDB를 사용한 솔루션 개발 |
| 모듈 9 | 애플리케이션 로직 처리 |

교재 슬라이드 2의 도해는 이 모듈에서 다루는 대상을 AWS 클라우드 / Amazon DynamoDB / Notes 테이블 및 글로벌 보조 인덱스 / 데이터 쿼리 및 액세스로 표시합니다.

### 1일 차에서 다룬 내용

| 영역 | 관련 모듈 |
|---|---|
| 애플리케이션 | 모듈 1–2 |
| 개발자 도구(IDE, SDK, API) | 모듈 3 |
| 권한 | 모듈 4 |
| 애플리케이션 저장 및 호스팅 | 모듈 5–6 |

이 모듈부터는 애플리케이션의 데이터 계층을 다룹니다. 애플리케이션 사용자는 하루에 여러 번 노트를 읽고, 추가하고, 업데이트하고, 삭제합니다. DynamoDB는 이러한 상호 작용을 저장할 수 있는 실행 가능한 솔루션을 제공합니다.

---

## 2. AWS 데이터베이스 옵션

### 2.1 AWS 데이터베이스 서비스 비교 🔄

교재 슬라이드 6의 표는 4개 행으로 구성되어 있고, 표 자체에 "이 표는 AWS 데이터베이스 서비스의 전체 목록이 아닙니다"라는 각주가 붙어 있습니다.

| 데이터베이스 유형 | 사용 사례 | 교재가 기재한 AWS 서비스 |
|---|---|---|
| 관계형 | 기존 애플리케이션, ERP, CRM, 전자 상거래 | Amazon RDS, Amazon Redshift |
| 키 값 | 트래픽이 많은 웹 애플리케이션, 전자 상거래 시스템, 게임 애플리케이션 | Amazon DynamoDB |
| 그래프 | 데이터 분석, 사기 행위 탐지, 소셜 네트워킹, 추천 엔진 | Amazon Neptune |
| 인 메모리 캐싱 | 캐싱, 세션 관리, 게임 순위표 | Amazon ElastiCache |

현재 AWS 데이터베이스 결정 안내서는 **15개 이상의 데이터베이스 옵션**을 소개하고, 데이터 모델을 관계형·키 값·문서·인 메모리·그래프·시계열·벡터·와이드 컬럼으로 분류합니다. 교재 표와 달라진 지점이 세 곳 있습니다.

| 구분 | 데이터 모델 | 서비스 |
|---|---|---|
| 관계형(OLTP) | 관계형 | Aurora 계열(Aurora PostgreSQL 호환 에디션, Aurora MySQL 호환 에디션, Aurora DSQL) + Amazon RDS 엔진 6종(PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, Db2) = **9개 엔진** |
| 비관계형 | 키 값 | Amazon DynamoDB |
| 비관계형 | 문서 | Amazon DocumentDB(MongoDB 호환) |
| 비관계형 | 캐싱·인 메모리 | Amazon ElastiCache, Amazon MemoryDB |
| 비관계형 | 그래프 | Amazon Neptune |
| 비관계형 | 시계열 | Amazon Timestream |
| 비관계형 | 와이드 컬럼 | Amazon Keyspaces(Apache Cassandra용) |

- **Amazon Aurora는 RDS가 지원하는 엔진 중 하나가 아니라 별도 계열**로 분류됩니다. 교재 강사 노트는 Aurora를 RDS 엔진 목록에 넣습니다.
- **Db2**가 RDS 엔진 목록에 추가되었습니다. 교재에는 없습니다.
- **Amazon Redshift는 OLAP(데이터 웨어하우징) 서비스**로, 이 OLTP 표에 포함되지 않습니다. 교재는 Redshift를 관계형 행에 RDS와 함께 넣습니다.
- Amazon MemoryDB, Aurora DSQL, Aurora PostgreSQL Limitless Database, 벡터 데이터 모델은 교재에 없습니다.

이 결정 안내서는 2026년 6월 2일에 갱신되었습니다.

#### ElastiCache 지원 엔진 🔄

| 구분 | 내용 |
|---|---|
| 교재 기재 | 완전관리형 **Redis 또는 Memcached** 엔진을 지원하는 인 메모리 데이터 캐시 |
| 현재 | **Valkey, Memcached, Redis OSS** 세 엔진을 지원. 서버리스와 노드 기반 배포 옵션 제공 |
| 성능 | 마이크로초 읽기와 1밀리초 미만 쓰기를 지원하는 임시(ephemeral) 캐시로 최적화 |
| 구분선 | 완전한 데이터 지속성과 1밀리초 미만 읽기 지연이 함께 필요하면 **Amazon MemoryDB** |

> — 출처: [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html)

### 2.2 관계형 데이터베이스와 비관계형 데이터베이스 🔄

교재 슬라이드 7의 비교 표입니다.

| 관점 | 관계형 | NoSQL(비관계형) |
|---|---|---|
| 데이터 스토리지 | 행 및 열 | 키 값, 문서, 와이드 컬럼, 그래프 |
| 스키마 | 고정 | 동적 |
| 쿼리 | SQL 사용 | 문서 수집에 집중 |
| 확장성 | 수직적 | 수평적 |
| 트랜잭션 | 지원 | 지원 여부가 유동적임 |
| 일관성 | 강력 | 최종 및 강력 |

| 특성 | 관계형 | NoSQL(비관계형) |
|---|---|---|
| 데이터 관계 | 기본 키/외래 키 관계로 연관된 테이블. 복잡한 쿼리와 조인 지원 | 고정 스키마 없음. 레코드마다 다른 속성을 가질 수 있음 |
| 스키마 변경 | 스키마를 처음에 정의. 변경 시 이전 스키마 데이터를 새 스키마로 마이그레이션 | 사전 정의된 스키마의 제약을 받지 않음 |
| 확장 방식 | 수직적. 단일 서버의 성능을 향상 | 수평적. 비용이 더 적게 드는 서버 여러 대에 데이터를 분할·분산 |
| 트랜잭션 | ACID(원자성, 일관성, 격리, 내구성) 지원 | 데이터베이스에 따라 다름 |
| 일관성 | ACID 속성 때문에 자동으로 강력한 일관성 | 일반적으로 최종 일관성. 필요하면 강력한 일관성으로 설정 |

수평적 확장의 예: 한 테이블에 100,000명의 사용자 정보를 저장할 때 10,000명씩 하위 집합으로 분할해 각 서버에 저장합니다.

#### DynamoDB와 관계형 데이터베이스의 차이 🆕

DynamoDB는 **JOIN 연산자를 지원하지 않습니다.** 그래서 공식 문서는 관계형 설계와 반대로 **데이터 모델을 비정규화**하도록 권장합니다. 교재 표의 "쿼리 — 문서 수집에 집중" 항목이 실제 설계에서 의미하는 바가 이것입니다.

> — 출처: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

#### DynamoDB의 ACID 지원 🆕

교재 강사 노트는 "DynamoDB는 DynamoDB 트랜잭션을 통해 ACID를 지원합니다"라고만 언급합니다. 확인된 내용은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 보장 범위 | 여러 테이블 내부와 테이블 간에 조정된 all-or-nothing 변경. ACID 보장 |
| `TransactWriteItems` | 최대 **100개**의 쓰기 작업을 하나의 all-or-nothing 연산으로 묶음 |
| `TransactGetItems` | 최대 **100개**의 Get 작업을 묶음 |
| 크기 한도 | 트랜잭션 하나의 항목 합계 크기는 **4MB** 초과 불가 |
| 비용 | 트랜잭션 활성화에 추가 비용 없음. 읽기·쓰기 비용만 지불. 단 DynamoDB가 항목마다 **준비와 커밋 두 번**의 읽기·쓰기를 수행 |
| 제약 | 트랜잭션은 **인덱스로는 수행할 수 없음** |

> — 출처: [Managing complex workflows with DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html)

### 2.3 같은 데이터를 SQL과 NoSQL로 표현하기

교재 슬라이드 8은 같은 Notes 데이터를 행·열과 JSON 문서로 나란히 보여줍니다.

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | HelloWorld! | No |
| StudentB | 23 | Amazon DynamoDB… | Yes |
| StudentC | 12 | Thanks for all… | No |

```json
{ "UserId": "StudentA", "NoteId": "11", "Note": "HelloWorld!" }
{ "UserId": "StudentB", "NoteId": "23", "Note": "Amazon DynamoDB…", "Favorite": "Yes" }
{ "UserId": "StudentC", "NoteId": "12", "Note": "Thanks for all…" }
```

관계형 표현에서는 `Favorite` 열이 모든 행에 존재하고 값이 없으면 `No`로 채워집니다. NoSQL 표현에서는 **`Favorite` 속성이 필요한 항목에만 존재**합니다. 이것이 "동적 스키마"의 실제 모습입니다.

### 2.4 애플리케이션 아키텍처에서의 위치

교재 슬라이드 9의 도해는 실습 애플리케이션의 구성 요소를 다음과 같이 배치합니다.

| 계층 | 구성 요소 |
|---|---|
| 클라이언트 | 최종 사용자, 웹 사이트 호스팅, MP3 호스팅 |
| API | Amazon API Gateway, 애플리케이션 API 호출(List / Search / Delete / Create·Update) |
| 인증·권한 | AWS Identity and Access Management(IAM), Amazon Cognito |
| 데이터 | **Amazon DynamoDB** |
| 부가 서비스 | Amazon Polly, Dictate |
| 운영 | AWS X-Ray, Amazon CloudWatch, AWS SAM |

### 2.5 애플리케이션 개발에 DynamoDB를 선택하는 이유 🔄

교재 슬라이드 10이 제시하는 이점은 6개 레이블(규모에 따른 성능 / 서버리스 / 기업 환경 지원 / 완전관리형 / 지연 시간이 짧은 쿼리 / 세분화된 액세스 제어)입니다.

| 이점 | 내용 |
|---|---|
| 규모에 따른 성능 | 완전관리형 NoSQL 데이터베이스 서비스로 원활한 확장성과 함께 빠르고 예측 가능한 성능을 제공. 애플리케이션의 변화하는 용량 요구 사항을 충족 |
| 서버리스 | 소프트웨어를 설치하거나 유지 관리할 필요가 없음 |
| 기업 환경 지원 | 문서 모델과 키 값 스토어 모델을 모두 지원하는 완전관리형 클라우드 데이터베이스 |
| 완전관리형 | 테이블을 생성하고 오토 스케일링 목표 사용률을 설정하면 나머지는 서비스가 처리. 하드웨어·소프트웨어 프로비저닝, 설정, 패칭, 분산 클러스터 오케스트레이션, 데이터 파티셔닝을 대신 수행 |
| 지연 시간이 짧은 쿼리 | 🔄 규모와 관계없이 **한 자리 밀리초(single-digit millisecond)** 성능 |
| 세분화된 액세스 제어 | IAM과 통합되어 조직 내 사용자의 액세스를 세부적으로 제어. 사용자별 고유 보안 인증 정보 할당 |
| 유연성 | 문서의 저장·쿼리·업데이트를 지원. AWS SDK로 JSON 문서를 테이블에 바로 저장할 수 있어 코드량이 줄어듦 |

#### 지연 시간 표기 🔄

| 구분 | 표현 |
|---|---|
| 교재 기재 | "규모와 관계없이 **10밀리초 미만**의 대기 시간", "평균 서비스 지연 시간은 보통 10밀리초 미만" |
| 현재 공식 표현 | 규모와 관계없이 **한 자리 밀리초** 성능 |

교재의 '10밀리초 미만'이라는 수치가 과거 공식 표현이었는지는 확인하지 못했습니다([9.5절](#95-검증하지-못한-항목) 참조). 강의에서는 현재 표현을 쓰는 것이 안전합니다.

#### 복원력과 백업 🆕

교재는 완전관리형 항목에서 "모든 테이블에 대해 시점 복구, 백업 및 복원을 제공"이라고만 기재합니다. 확인된 내용은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 복제 | 기본적으로 데이터를 **3개의 가용 영역**에 자동 복제 |
| 가용성 SLA | **99.99%**. 글로벌 테이블은 **99.999%** |
| 연속 백업(continuous backups) | **초 단위** 세분성 |
| 시점 복구(PITR) | 최근 **35일** 이내의 임의 시점(초 단위)으로 테이블 복원. 복구 기간은 **1일~35일** 사이로 설정 가능 |
| 성능 영향 | 연속 백업과 시점 복원은 프로비저닝된 용량을 사용하지 않고 애플리케이션 성능·가용성에 영향을 주지 않음 |
| 온디맨드 백업 | 장기 보존·아카이브용 전체 백업. **AWS Backup**과 통합 |

> — 출처: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

---

## 3. DynamoDB 주요 개념

### 3.1 테이블, 항목, 속성

| DynamoDB 용어 | 관계형 데이터베이스의 대응 개념 |
|---|---|
| 테이블(table) | 테이블 |
| 항목(item) | 행 또는 튜플 |
| 속성(attribute) | 열 |

교재 슬라이드 12의 Notes 테이블 예입니다. `UserId`가 파티션 키(필수), `NoteId`가 정렬 키(선택 사항)입니다.

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | Hello… | |
| StudentB | 23 | Amazon… | yes |
| StudentC | 12 | Thanks… | |
| StudentD | 33 | Test… | |
| StudentD | 42 | Run… | yes |

테이블에 저장할 수 있는 **항목 수에는 제한이 없습니다.**

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html), [Working with tables and data in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithTables.html)

### 3.2 파티션과 데이터 분산 🆕

DynamoDB는 데이터를 **파티션**에 저장하고, 테이블의 항목을 파티션 키 값에 따라 여러 파티션으로 나눕니다.

| 항목 | 내용 |
|---|---|
| 파티션의 실체 | **SSD로 백업되는 테이블용 스토리지 할당** |
| 복제 | 하나의 AWS 리전 내 **여러 가용 영역에 자동 복제** |
| 관리 주체 | 전적으로 DynamoDB. 사용자가 직접 관리하지 않음 |
| 테이블 생성 시 | 초기 상태는 `CREATING`. 이 단계에서 프로비저닝된 처리량 요구를 처리할 만큼의 파티션을 할당. 상태가 `ACTIVE`로 바뀐 뒤 읽기·쓰기 가능 |
| 파티션 추가 할당 조건 | 프로비저닝된 처리량을 기존 파티션이 지원하지 못할 만큼 늘렸을 때, 또는 기존 파티션이 가득 찼을 때 |
| 글로벌 보조 인덱스 | GSI도 파티션으로 구성되며 **인덱스 데이터는 기본 테이블과 별도로 저장** |

교재 슬라이드 10은 "데이터 볼륨과 성능 요구가 증가하면 자동 파티셔닝 및 SSD 기술을 사용해 처리량 요구를 충족한다"고 서술합니다. 문서가 실제로 기술하는 파티션 추가 할당 조건은 위 표의 두 가지입니다.

> — 출처: [Partitions and data distribution in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html)

#### Hash 속성과 Range 속성 🆕

| 별칭 | 대상 | 유래 |
|---|---|---|
| 해시 속성(hash attribute) | 파티션 키 | DynamoDB가 **내부 해시 함수**로 파티션 키 값에 따라 항목을 파티션에 균등 분산하는 방식에서 유래 |
| 범위 속성(range attribute) | 정렬 키 | 파티션 키가 같은 항목을 **정렬 키 값 순서로 물리적으로 가까이** 저장하는 방식에서 유래 |

기본 키 속성에는 다음 제약이 있습니다. 교재에는 없는 내용입니다.

- 모든 기본 키 속성은 **스칼라**여야 하고, 허용되는 데이터 형식은 **문자열, 숫자, 이진**뿐입니다.
- 키가 아닌 속성에는 이 제약이 없습니다.
- DynamoDB는 중첩 속성을 **32단계**까지 지원합니다.

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.3 항목 및 속성 유형 🔄

항목은 속성 모음입니다. 각 속성에는 이름, 데이터 형식, 값이 있습니다. DynamoDB는 사전에 정의된 스키마의 제약을 받지 않습니다.

교재 슬라이드 13의 JSON 예제입니다. 원문에는 `"Tags"` 뒤에 쉼표가 없어 유효한 JSON이 아니므로 여기서는 쉼표를 넣어 실었습니다([9.1절](#91-교재-기술이-사실과-다른-항목) 참조).

```json
{
  "UserId": "StudentA",
  "NoteId": 13,
  "Note": "Hello everyone",
  "Favorite": "yes",
  "Active": true,
  "Tags": ["DynamoDB", "NoSQL"],
  "Meta": { "color": "green", "pinned": true }
}
```

위 예제의 형식 대응: 문자열(`Note`, `Favorite`) / 부울(`Active`) / 목록(`Tags`) / 맵(`Meta`).

#### 데이터 형식 세 범주 🔄

| 범주 | 형식 | 비고 |
|---|---|---|
| 스칼라 형식 | 숫자, 문자열, 이진, 부울, Null | 단일 값 |
| 문서 형식 | 목록(list), 맵(map) | 중첩 속성을 가진 복잡한 구조를 **32단계**까지 표현. 맵은 JSON 형식 문서를 저장하는 데 적합 |
| **세트 형식** | 문자열 세트, 숫자 세트, 이진 세트 | 한 세트의 모든 요소는 **같은 형식**이어야 하고 값은 **고유**해야 하며 **순서는 보존되지 않음** |

🔄 교재는 세 번째 범주를 "다중 값 형식"이라고 표기합니다. 공식 문서의 범주 이름은 **세트 형식(Set Types)** 입니다.

#### 데이터 형식 설명자 🆕

하위 수준 API 프로토콜은 데이터 형식 설명자를 요구합니다. 전체 목록입니다.

| 설명자 | 형식 | 설명자 | 형식 |
|---|---|---|---|
| `S` | 문자열 | `M` | 맵 |
| `N` | 숫자 | `L` | 목록 |
| `B` | 이진 | `SS` | 문자열 세트 |
| `BOOL` | 부울 | `NS` | 숫자 세트 |
| `NULL` | Null | `BS` | 이진 세트 |

- **숫자는 정밀도 보존을 위해 네트워크 전송 시 문자열로 표현됩니다.** 그래서 [8.2절](#82-요청-형식-getitem)의 요청 예제에서도 `"NoteId": {"N": "1"}`처럼 숫자 값이 따옴표 안에 들어갑니다.
- **빈 세트는 허용되지 않지만 빈 목록과 빈 맵은 허용됩니다.**

> — 출처: [Supported data types and naming rules in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html)

### 3.4 크기와 이름 제약 🆕

교재는 "항목 크기는 속성 이름 길이와 값의 길이를 더하여 결정되며, 항목의 최대 크기는 400KB"라고 기재합니다. 확인된 제약 전체는 다음과 같습니다.

| 대상 | 제약 |
|---|---|
| 항목 최대 크기 | **400KB**. 속성 **이름의 이진 길이(UTF-8)** 와 속성 **값의 이진 길이**를 모두 포함 |
| 목록·맵·세트의 값 개수 | 제한 없음. 항목이 400KB 한도에 들어가기만 하면 됨 |
| 크기 단위 | 모든 크기 측정은 이진 단위. **1KB = 1024바이트** |
| 테이블 크기 | 실질적인 제한 없음 |
| 속성 이름 | 최소 1자, **64KB** 초과 불가 |
| 보조 인덱스의 키·프로젝션 속성 이름 | 보조 인덱스의 파티션 키 이름, 정렬 키 이름, 사용자가 지정한 프로젝션 속성 이름(LSI에만 해당)은 **255자** 초과 불가. UTF-8 인코딩 총 크기도 **255바이트** 초과 불가 |
| 테이블·보조 인덱스 이름 | 3자 이상 255자 이하. `A-Z`, `a-z`, `0-9`, 밑줄(`_`), 하이픈(`-`), 마침표(`.`)만 사용 |
| 인코딩 | 모든 이름은 UTF-8로 인코딩되고 **대소문자를 구분** |
| 파티션 키 값 | 최소 1바이트, 최대 **2048바이트** |
| 정렬 키 값 | 최소 1바이트, 최대 **1024바이트** |
| 고유 키 값 개수 | 테이블·보조 인덱스의 고유한 파티션 키 값 개수에 실질적 제한 없음. 파티션 키 값당 고유한 정렬 키 값 개수도 일반적으로 제한 없음 |

크기 계산 예: 이름이 `shirt-color` 값이 `R`인 속성과 이름이 `shirt-size` 값이 `M`인 속성 두 개를 가진 항목의 총 크기는 **23바이트**입니다.

속성 이름은 읽기 요청 단위 소비와 스토리지·처리량 사용량 측정에 포함되므로 **가능한 짧게 유지하는 것이 모범 사례**입니다.

> — 출처: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.5 기본 키

테이블에는 각 항목을 고유하게 식별하는 기본 키가 있습니다. 유형은 두 가지입니다.

| 유형 | 구성 | 고유성 판정 | 교재가 기재한 인덱스 생성 |
|---|---|---|---|
| 파티션 기본 키(단순 기본 키) | 파티션 키 속성 1개 | 파티션 키 값으로 고유 식별. 두 항목이 같은 파티션 키 값을 가질 수 없음 | 파티션 키 속성 기반 **정렬되지 않은(unordered) 인덱스** |
| 파티션 및 정렬 기본 키(복합 기본 키) | 파티션 키 + 정렬 키 | 두 값의 **조합**으로 고유 식별. 여러 항목이 같은 파티션 키 값을 가질 수 있지만 정렬 키 값은 달라야 함 | 파티션 키는 정렬되지 않은 인덱스, 정렬 키는 **정렬된 인덱스** |

- 파티션 키만 있는 테이블에서 DynamoDB는 파티션 키 값을 **내부 해시 함수의 입력**으로 사용해 항목이 저장될 파티션을 결정합니다.
- 복합 기본 키 테이블에서는 파티션 키 값이 같은 모든 항목이 **정렬 키 값 순서로 함께 저장**됩니다.

교재 슬라이드 14의 예제는 `UserId`가 파티션 키, `NoteId`가 정렬 키인 Notes 테이블입니다. 각 `UserId`에 여러 노트가 있을 수 있으므로 **특정 사용자와 관련된 모든 메모를 쿼리**할 수 있습니다.

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | Hello… | |
| StudentB | 23 | Amazon… | Yes |
| StudentC | 12 | Thanks… | |
| StudentD | 42 | Test… | |
| StudentD | 33 | Run… | Yes |

DynamoDB를 키 값 스토어와 문서 스토어로 모두 사용할 수 있습니다. **기본 키 값(파티션 키와 정렬 키(있는 경우))이 키이고 나머지 속성이 값을 구성합니다.**

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.6 읽기 및 쓰기 용량 단위 🆕

교재 슬라이드 15는 온디맨드 모드의 단위(RRU·WRU)를, 슬라이드 16은 프로비저닝 모드의 단위(RCU·WCU)를 설명합니다. 네 단위의 정의를 한 표로 정리하면 다음과 같습니다.

| 모드 | 단위 | 정의 |
|---|---|---|
| 프로비저닝 | 1 RCU | 최대 4KB 항목에 대한 **초당 강력한 일관성 읽기 1회** 또는 **초당 최종 일관성 읽기 2회** |
| 프로비저닝 | 1 WCU | 최대 1KB 항목에 대한 **초당 쓰기 1회** |
| 온디맨드 | 1 RRU | 최대 4KB 항목에 대한 **초당 강력한 일관성 읽기 1회** 또는 **초당 최종 일관성 읽기 2회** |
| 온디맨드 | 1 WRU | 최대 1KB 항목에 대한 **초당 쓰기 1회** |

교재 슬라이드 15의 "최종적으로 일관된 읽기를 위해서는 0.5RRU가 필요합니다"는 위 표의 "1 단위로 읽기 2회"와 같은 말입니다.

트랜잭션 요청은 **단위를 2배 소비**합니다. 교재에는 없는 내용입니다.

| 요청 | 소비 단위 |
|---|---|
| 트랜잭션 읽기 | 최대 4KB 항목에 대해 초당 1회 읽기에 **2 단위** |
| 트랜잭션 쓰기 | 최대 1KB 항목에 대해 초당 1회 쓰기에 **2 단위** |

> — 출처: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.7 용량 모드(요금 옵션) 🔄

교재 슬라이드 16의 비교입니다.

| 온디맨드 | 프로비저닝 |
|---|---|
| 오토 스케일링 | 초당 읽기 및 쓰기 횟수 지정 |
| 요청당 지불 | 프로비저닝된 용량에 대한 비용 지불 |
| 용량 관리 불필요 | 예측 가능한 비용 |
| RRU / WRU | RCU / WCU |

#### 온디맨드 용량 모드 🆕

**온디맨드 모드가 기본값이자 권장 처리량 옵션**입니다. 교재도 여기까지는 맞게 기재합니다. 확인된 스케일링 동작은 다음과 같습니다.

| 항목 | 내용 |
|---|---|
| 확장 범위 | 소규모로 시작해 **초당 수백만 개**의 요청까지 확장 |
| 신규 테이블 초기 처리량 | **초당 4,000회 쓰기**와 **초당 12,000회 읽기**까지 지속 가능 |
| 즉시 수용 범위 | 테이블의 **이전 최대 트래픽의 두 배**까지 즉시 수용 |
| 스로틀링 조건 | 이전 최대치의 두 배를 **30분 안에** 초과하면 스로틀링 발생 가능 |
| 과금 | 요청당 과금. **트래픽이 없으면 처리량 요금이 부과되지 않음** |
| 품질 | 프로비저닝 모드와 동일한 한 자리 밀리초 지연 시간, SLA, 보안 |

> — 출처: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

#### 프로비저닝된 용량 모드와 Auto Scaling 🆕

| 항목 | 내용 |
|---|---|
| 과금 기준 | 실제 소비량이 아니라 **시간당 프로비저닝한** 읽기·쓰기 용량 |
| Auto Scaling 구현 | **Application Auto Scaling**의 조정 정책을 사용 |
| 설정 항목 | 최소·최대 읽기·쓰기 용량과 **목표 사용률(target utilization)** |
| 동작 | Application Auto Scaling이 CloudWatch 경보를 만들어 관리. 소비 용량이 목표 사용률을 **2분 연속** 초과하면 조정이 트리거됨 |
| 기본 활성화 | AWS Management Console로 테이블이나 GSI를 만들면 Auto Scaling이 **기본으로 활성화** |
| 권장값 | AWS는 목표 사용률을 **70%** 로 설정하도록 권장 |

> — 출처: [DynamoDB provisioned capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html)

#### 처리량 기본 할당량과 모드 전환 🆕

| 항목 | 값 |
|---|---|
| 온디맨드 테이블당 | 40,000 RRU, 40,000 WRU (조정 가능) |
| 프로비저닝 테이블당 | 40,000 RCU, 40,000 WCU (조정 가능) |
| 계정 수준 할당량 | **프로비저닝 모드에만 적용.** 80,000 RCU, 80,000 WCU. 온디맨드 테이블에는 계정 수준 처리량 할당량이 적용되지 않음 |
| 프로비저닝 최소 처리량 | 테이블·GSI당 1 RCU, 1 WCU |
| 프로비저닝 용량 감소 횟수 | 하루 4회로 시작해 매시간 1회 추가(최대 동시 보유 4회), 24시간 동안 최대 **27회** |
| 계정·리전당 테이블 수 | 기본 **2,500개** |
| 프로비저닝 → 온디맨드 전환 | 24시간 롤링 윈도우 안에서 **최대 4회** |
| 온디맨드 → 프로비저닝 전환 | **언제든** 가능 |

> — 출처: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

#### 교재의 자체 모순 하나 🔄

교재 슬라이드 16 강사 노트의 마지막 문장은 "온디맨드 모드의 RRU와 WRU는 사용된 용량을 나타내는 반면 **온디맨드 모드의 RCU와 WCU는 예약 용량**을 나타낸다"입니다. RCU·WCU는 프로비저닝된 용량 모드의 단위이므로 두 번째 '온디맨드'는 '프로비저닝'의 오기입니다. 같은 노트의 앞부분은 "프로비저닝 모드의 처리량은 RCU 및 WCU로 지정됩니다"라고 올바르게 기재합니다.

| 구분 | 올바른 서술 |
|---|---|
| 온디맨드 모드의 RRU·WRU | **사용된** 용량 |
| 프로비저닝된 용량 모드의 RCU·WCU | **예약(프로비저닝)된** 용량 |

교재가 인용한 온디맨드 요금 링크 `https://aws.amazon.com/dynamodb/pricing/on-demand/` 은 현재 통합 요금 페이지로 리디렉션됩니다.

> — 출처: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html), [Amazon DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/)

### 3.8 온디맨드 테이블의 최대 처리량 🆕

교재에 없는 기능입니다. 온디맨드 테이블에서 **개별 테이블과 그에 연결된 GSI에 대해 초당 최대 읽기·쓰기 처리량을 선택적으로 지정**할 수 있습니다. 예측하지 못한 트래픽 급증으로 비용이 튀는 것을 막는 안전장치입니다.

| 항목 | 내용 |
|---|---|
| 기본 상태 | 최대 처리량 설정이 **적용되지 않음**. 계정의 모든 테이블에 대한 40,000 테이블 수준 읽기·쓰기 처리량 서비스 할당량으로만 제한 |
| 초과 시 동작 | 요청이 스로틀링되고 **`ThrottlingException`** 반환 |
| 지정 가능 최소값 | 초당 **1 요청 단위** |
| 지정 가능 최대값 | 해당 테이블 또는 GSI에 사용 가능한 기본 처리량 할당량보다 **작아야** 함 |
| 적용 방식 | **최선 노력(best-effort)** 기준. 버스트 용량 때문에 일시적으로 초과할 수 있음 |
| 모니터링 | CloudWatch 지표 `OnDemandMaxReadRequestUnits`, `OnDemandMaxWriteRequestUnits` |

> — 출처: [DynamoDB maximum throughput for on-demand tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode-max-throughput.html)

### 3.9 읽기 일관성 🆕

교재 비교 표는 NoSQL의 일관성을 "최종 및 강력"으로만 기재합니다. DynamoDB에서의 실제 규칙은 다음과 같습니다.

| 대상 | 지원 일관성 |
|---|---|
| 테이블 | 최종 일관성, 강력한 일관성 중 선택 |
| 로컬 보조 인덱스(LSI) | 최종 일관성, 강력한 일관성 중 선택 |
| 글로벌 보조 인덱스(GSI) | **최종 일관성만** |
| DynamoDB 스트림 | **최종 일관성만** |

- **최종 일관성이 모든 읽기 작업의 기본값**입니다.
- `GetItem`, `Query`, `Scan`은 선택적 `ConsistentRead` 파라미터를 제공하며 `true`로 설정하면 강력한 일관성 읽기가 됩니다.
- GSI나 스트림에서는 강력한 일관성 읽기가 **지원되지 않습니다.**
- 최종 일관성 읽기는 강력한 일관성 읽기의 **절반 비용**입니다([3.6절](#36-읽기-및-쓰기-용량-단위) 참조).
- DynamoDB는 **read-committed 격리**를 제공해 읽기 작업이 항상 커밋된 값을 반환합니다.

> — 출처: [DynamoDB read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)

### 3.10 보조 인덱스

기본이 아닌 키 속성을 기반으로 데이터를 쿼리할 수 있게 하는 구조입니다.

| 구성 요소 | 필수 여부 |
|---|---|
| 대체 키 속성(파티션 키, 정렬 키) | 필수 |
| 기본 키 속성 | DynamoDB가 최소한 기본 테이블의 키 속성을 인덱스로 프로젝션 |
| 기본 테이블의 기타 속성(프로젝션된 속성) | 선택. 인덱스를 생성할 때 복사·프로젝션할 속성을 지정 |

보조 인덱스를 쓰는 이유: 키가 아닌 속성으로 조회해야 하는 액세스 패턴을 쿼리로 처리하려면 전체 테이블을 스캔해야 합니다. 키가 아닌 속성에 보조 인덱스를 지정하면 그 쿼리가 프로비저닝된 읽기 처리량을 많이 소비하지 않습니다.

DynamoDB는 테이블의 기본 키에 근거하여 인덱스를 자동으로 생성하고, 테이블이 변경될 때마다 모든 인덱스를 자동으로 업데이트합니다.

#### 인덱스 할당량 🆕

| 항목 | 값 |
|---|---|
| 테이블당 로컬 보조 인덱스 | 최대 **5개** |
| 테이블당 글로벌 보조 인덱스 | 기본 할당량 **20개** |
| 프로젝션 속성 합산 | 테이블의 LSI·GSI 전체에 대해 사용자가 지정한 프로젝션 속성은 합산 **100개**까지. `ProjectionType`이 `INCLUDE`인 경우에만 적용되고 `KEYS_ONLY`·`ALL`에는 적용되지 않음. 같은 속성 이름을 두 인덱스에 프로젝션하면 2개로 계산 |

🔄 교재가 인용한 할당량 문서 `Limits.html` 은 현재 `ServiceQuotas.html` 로 리디렉션되며, 문서가 두 페이지로 나뉘었습니다. 조정 가능한 서비스 할당량은 **ServiceQuotas.html**, 항목 크기·키 길이·데이터 형식 같은 고정 제약은 **Constraints.html** 에 있습니다.

> — 출처: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.11 로컬 보조 인덱스 예 🔄

교재 슬라이드 18은 Notes 테이블에 `NotesByFavorites` 로컬 보조 인덱스를 만든 예를 보여줍니다. 슬라이드 레이블: "읽기 및 쓰기 용량 단위는 기본 테이블에서 상속됩니다."

기본 테이블:

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentC | 11 | Thanks… | Yes |
| StudentD | 23 | Test… | |
| StudentD | 12 | Run… | Yes |

`NotesByFavorites` 로컬 보조 인덱스:

| UserId | Favorite | Note |
|---|---|---|
| StudentC | Yes | Thanks… |
| StudentD | Yes | Run… |

로컬 보조 인덱스가 '로컬'인 이유는 **지정된 파티션 키 값이 있는 항목과 동일한 테이블 파티션에 인덱스가 놓이기** 때문입니다. 그래서 쿼리의 파티션 키 값으로 지정된 **단일 파티션에 있는 데이터만** 쿼리할 수 있습니다.

#### 정렬 키 제약 🔄

| 구분 | 내용 |
|---|---|
| 교재 기재 | "이 정렬 키는 **스칼라 속성**이 될 수 있습니다" |
| 확인된 내용 | LSI의 정렬 키는 **문자열·숫자·이진 형식의 키가 아닌(non-key) 기본 테이블 속성**이어야 합니다 |
| 추가 제약 | LSI의 기본 키는 **반드시 복합**(파티션 키 + 정렬 키)이어야 합니다 |
| 추가 제약 | 인덱스 키 스키마의 모든 속성은 **최상위 속성**이어야 하고 **문서·세트 형식은 허용되지 않습니다** |

#### 항목 컬렉션 10GB 한도 🔄

항목 컬렉션은 파티션 키 속성 값이 같은 항목들의 집합입니다. 교재는 "항목 컬렉션의 총 크기는 10GB를 초과할 수 없습니다"라고 조건 없이 기재하지만, 이 제약은 **로컬 보조 인덱스가 하나 이상 있는 테이블에만** 적용됩니다.

| 조건 | 동작 |
|---|---|
| LSI가 하나 이상 있는 테이블 | 항목 컬렉션이 **10GB를 초과할 수 없음**. 여기에는 파티션 키 값이 같은 모든 기본 테이블 항목과 프로젝션된 LSI 뷰가 모두 포함됨. 10GB는 파티션의 최대 크기 |
| LSI가 없는 테이블 | DynamoDB가 항목 컬렉션을 필요한 만큼 **여러 파티션에 자동 분할** |
| 한도 초과 시 | `ItemCollectionSizeLimitExceededException`(HTTP 400, 재시도 가능) 반환 |
| 항목 단위 400KB 한도 | LSI가 있는 테이블에서는 테이블 항목 데이터 크기와 **모든 LSI의 해당 항목 크기(키 값과 프로젝션 속성 포함)의 합**에 400KB 한도가 적용됨 |

이 제약이 LSI에만 생기는 이유는 지역성입니다. GSI의 항목 컬렉션은 기본 테이블과 독립적이지만, LSI는 인덱싱된 뷰가 테이블 항목과 **같은 파티션에 함께 배치**되고 같은 파티션 키 속성을 공유합니다. 그래서 테이블에 LSI가 하나라도 있으면 항목 컬렉션을 여러 파티션에 분산할 수 없습니다.

> — 출처: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.12 글로벌 보조 인덱스 예

교재 슬라이드 19는 Notes 테이블에 `NotesByUserId` 글로벌 보조 인덱스를 만든 예를 보여줍니다. 기본 테이블과 인덱스가 **각각 RCU·WCU를 따로** 갖는 것으로 표시됩니다.

기본 테이블:

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentC | 12 | Thanks… | Yes |
| StudentD | 42 | Test… | |
| StudentD | 33 | Run… | Yes |

`NotesByUserId` 글로벌 보조 인덱스:

| NoteId | UserId | Note |
|---|---|---|
| 12 | StudentC | Thanks… |
| 42 | StudentD | Test… |
| 33 | StudentD | Run… |

글로벌 보조 인덱스가 '글로벌'인 이유는 이 인덱스에 대한 쿼리가 **모든 파티션에 있는 테이블의 모든 데이터를 포괄**할 수 있기 때문입니다. 키 값이 고유할 필요는 없습니다. 최종 일관성이 애플리케이션에 적합하다면 글로벌 보조 인덱스를 사용하는 것이 좋습니다.

### 3.13 LSI와 GSI 비교 🆕

교재는 슬라이드 18·19에서 두 인덱스의 특성을 각각 7개 항목으로 나열합니다. 공식 문서의 비교 항목으로 정리하면 다음과 같습니다.

| 비교 항목 | 글로벌 보조 인덱스(GSI) | 로컬 보조 인덱스(LSI) |
|---|---|---|
| 키 스키마 | 단순(파티션 키) 또는 복합(파티션 키 + 정렬 키) 모두 가능 | **반드시 복합** |
| 키 속성 | 인덱스 파티션 키와 정렬 키는 문자열·숫자·이진 형식의 **임의의** 기본 테이블 속성 | 파티션 키는 기본 테이블의 파티션 키와 **같은 속성**. 정렬 키는 문자열·숫자·이진 형식의 **키가 아닌** 기본 테이블 속성 |
| 파티션 키 값당 크기 제약 | 없음 | 파티션 키 값마다 인덱싱된 모든 항목의 총 크기 **10GB 이하** |
| 생성·삭제 | 테이블 생성 시 함께, **기존 테이블에 추가 가능**, **삭제 가능** | **테이블 생성 시에만** 생성. 추가·삭제 **불가** |
| 쿼리 범위 | 모든 파티션에 걸쳐 **전체 테이블** | 쿼리의 파티션 키 값으로 지정된 **단일 파티션** |
| 읽기 일관성 | **최종 일관성만** | 최종 일관성과 강력한 일관성 중 선택 |
| 프로비저닝된 처리량 | 읽기·쓰기에 대한 **자체** 설정을 가짐. 쿼리·스캔이 인덱스의 용량 단위를 소비 | 쿼리·스캔이 **기본 테이블**의 읽기 용량 단위를 소비. 테이블 쓰기 시 LSI 갱신도 기본 테이블의 쓰기 용량 단위를 소비 |
| 프로젝션 속성 | 인덱스에 **프로젝션된 속성만** 요청 가능. DynamoDB가 테이블에서 속성을 가져오지 않음 | 프로젝션되지 않은 속성도 요청 가능. DynamoDB가 테이블에서 **자동으로 가져옴** |

공통 사항입니다.

- 인덱스 키 스키마의 모든 속성은 **String, Number, Binary 형식의 최상위 속성**이어야 하며 문서·세트 형식은 허용되지 않습니다.
- 각 보조 인덱스는 기본 테이블과 **같은 테이블 클래스와 용량 모드**를 사용합니다.
- 테이블을 삭제하면 연결된 **모든 인덱스도 삭제**됩니다.
- 보조 인덱스가 있는 테이블을 여러 개 만들 때는 **순차적으로** 만들어야 합니다. 동시에 만들면 `LimitExceededException`이 반환됩니다.

> — 출처: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

### 3.14 벡터 인덱스 🆕

교재에 없는 인덱스 계열입니다. 현재 DynamoDB는 두 계열의 인덱스를 지원합니다.

| 계열 | 목적 | 읽기 작업 |
|---|---|---|
| 보조 인덱스 | 기본 테이블 기본 키 외의 **대체 키**로 쿼리 | `Query`, `Scan` |
| 벡터 인덱스 | 항목에 저장된 **벡터 임베딩에 대한 유사도 검색**. 대체 키가 아님 | **`SearchVectors`** |

| 벡터 인덱스 할당량 | 값 |
|---|---|
| 테이블당 벡터 인덱스 | 5개 (조정 가능) |
| 벡터 인덱스당 최대 차원 | 4,096 |
| `SearchVectors` 요청당 최대 TopK | 100 |
| 벡터 인덱스당 최대 파티션 키(`HASH`) | 1개 |
| 파티션 키당 벡터 검색 속도 | 1GBps |
| 파티션 키당 벡터 인덱스 쓰기 속도 | 10MBps |

> — 출처: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

---

## 4. 개발자를 위한 DynamoDB 액세스 옵션

### 4.1 DynamoDB 액세스 방법

교재 슬라이드 21이 나열하는 액세스 경로입니다.

| 경로 | 용도 |
|---|---|
| AWS Management Console | 콘솔에서 직접 테이블·항목 조작 |
| NoSQL Workbench | 데이터 모델 설계·시각화·쿼리 개발 ([4.2절](#42-nosql-workbench)) |
| DynamoDB Local | 웹 서비스 없이 로컬에서 개발·테스트 ([4.3절](#43-dynamodb-local)) |
| PartiQL | SQL 호환 쿼리 ([4.4절](#44-partiql)) |
| AWS CLI | 명령줄·스크립트 자동화 ([4.5절](#45-aws-cli)) |
| SDK | 하위 수준 인터페이스 / 문서 인터페이스 / 상위 수준 인터페이스 ([5.2절](#52-프로그래밍-인터페이스-비교)) |

### 4.2 NoSQL Workbench 🔄

| 항목 | 내용 |
|---|---|
| 형태 | 플랫폼 간(cross-platform) **클라이언트 측 GUI 애플리케이션**. Windows, macOS, Linux용 제공 |
| 지원 데이터베이스 | Amazon DynamoDB, Amazon Keyspaces(Apache Cassandra용) |
| 기능 | DynamoDB 데이터 모델 설계, 액세스 패턴을 실제 DynamoDB 작업으로 정의, 샘플 데이터로 검증, 데이터 모델을 프로젝트로 구성 |
| 🆕 DynamoDB local 포함 | NoSQL Workbench에 **DynamoDB local이 포함**되어 있어 데이터 모델을 클라우드에 커밋하기 전에 테이블과 인덱스를 테스트할 수 있음 |
| PartiQL | 지원 |

#### 도구 구성 🔄

| 구분 | 도구 |
|---|---|
| 교재 기재 | 데이터 모델러 / **시각화 프로그램(visualizer)** / 작업 빌더 — **3개** |
| 현재 DynamoDB 문서 | 데이터 모델러(Data modeler) / 작업 빌더(Operation builder) — **2개** |

현재 문서는 시각화를 별도 도구로 두지 않고 데이터 모델러가 샘플 데이터 구성과 액세스 패턴 검증까지 담당합니다.

| 도구 | 역할 |
|---|---|
| 데이터 모델러 | 테이블과 글로벌 보조 인덱스 설계, 속성 정의, 샘플 데이터 구성. 액세스 패턴을 `PutItem`·`UpdateItem`·`Query` 같은 실제 DynamoDB 작업으로 시각화·실행해 검증. DynamoDB local 또는 AWS 계정에 모델 커밋. 데이터 모델 가져오기·내보내기 |
| 작업 빌더 | 라이브 데이터 세트 보기·탐색·쿼리. 프로젝션 표현식과 조건 표현식 지원. 여러 언어로 샘플 코드 생성 |

다른 리전의 AWS 계정 간, 또는 DynamoDB local과 AWS 계정 간에 **테이블을 직접 복제**할 수 있습니다.

Amazon Keyspaces 쪽 문서에는 여전히 시각화 항목이 있습니다. Keyspaces에서는 키스페이스·테이블·열을 정의해 데이터 모델을 만들거나 기존 모델을 가져와 수정하고, 데이터 모델을 Amazon Keyspaces 또는 Apache Cassandra에 커밋해 키스페이스와 테이블을 자동으로 만들 수 있습니다. 데이터 모델을 시각화해 애플리케이션의 쿼리와 액세스 패턴을 지원하는지 확인할 수 있습니다.

> — 출처: [NoSQL Workbench for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html), [Using NoSQL Workbench with Amazon Keyspaces](https://docs.aws.amazon.com/keyspaces/latest/devguide/workbench.html)

#### 릴리스 기록에서 확인할 지점 🆕

| 버전 | 날짜 | 내용 |
|---|---|---|
| 3.20.2 | 2026년 4월 6일 | DynamoDB local 시작 실패·취소 시 오류 처리 개선, DynamoDB 액세스 패턴용 데이터 모델러 수정 |
| 3.20.1 | 2026년 2월 17일 | 유지 관리 릴리스 |
| 3.20.0 | 2026년 2월 16일 | DynamoDB용 데이터 모델러의 사용자 경험 갱신, **액세스 패턴 지원** |
| 3.13.5 | 2025년 2월 24일 | 기본 테이블 설정의 용량 모드가 **온디맨드로 변경**. 기본 설정으로 테이블을 만들면 프로비저닝된 용량 모드가 아니라 온디맨드 용량 모드 테이블이 생성됨 |
| 3.13.0 | 2024년 4월 24일 | 다크 모드 네이티브 지원, 작업 빌더 개선 |

3.13.5의 기본값 변경은 실습에서 바로 체감됩니다. 예전 화면 캡처와 달리 기본 설정으로 만든 테이블이 온디맨드 모드가 됩니다.

> — 출처: [Release history for NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkbenchDocumentHistory.html)

### 4.3 DynamoDB Local 🆕

| 항목 | 내용 |
|---|---|
| 목적 | DynamoDB 웹 서비스에 액세스하지 않고 애플리케이션을 개발·테스트. 데이터베이스가 컴퓨터에서 **독립적(self-contained)** |
| 절감 효과 | 처리량, 데이터 스토리지, 데이터 전송 요금을 절약. 개발 중 인터넷 연결 불필요 |
| 프로덕션 전환 | 코드에서 로컬 엔드포인트를 제거하면 애플리케이션이 DynamoDB 웹 서비스를 가리킴 |
| 배포 형태 | **다운로드(JRE 필요)**, **Apache Maven 종속성**, **도커 이미지** |
| SDK 지원 | AWS SDK for Java 1.x와 2.x를 모두 지원 |
| 용도 제한 | **개발·테스트 목적 전용** |

#### 로컬 엔드포인트 지정

AWS SDK와 도구는 기본적으로 DynamoDB 웹 서비스 엔드포인트를 사용합니다. DynamoDB local을 쓰려면 로컬 엔드포인트 `http://localhost:8000` 을 명시해야 합니다.

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

```json
{ "TableNames": ["Notes"] }
```

- **AWS CLI는 DynamoDB local을 기본 엔드포인트로 사용할 수 없으므로 모든 명령에 `--endpoint-url` 을 지정해야 합니다.**
- 기본 포트는 8000이며 `-port` 옵션으로 변경할 수 있습니다.

| 주요 명령줄 옵션 | 역할 |
|---|---|
| `-sharedDb` | 단일 데이터베이스 파일 사용 |
| `-inMemory` | 파일을 쓰지 않고 메모리에만 저장 |
| `-dbPath` | 데이터베이스 파일 경로 지정 |
| `-cors` | CORS 허용 설정 |
| `-delayTransientStatuses` | 일시적 상태 전환에 지연을 넣어 실제 서비스 동작에 가깝게 재현 |
| `-disableTelemetry` | 텔레메트리 비활성화 |

#### 웹 서비스와의 차이 🆕

교재는 로컬 엔드포인트와 절감 효과만 기재합니다. 아래 차이는 교재에 없습니다.

| 항목 | DynamoDB local의 동작 |
|---|---|
| 시점 복구(PITR) | **지원하지 않음** |
| `billingModeSummary` | 항상 `null` 반환 |
| 프로비저닝된 처리량 설정 | **무시됨** |
| 병렬 스캔 | 지원하지 않음 |
| 읽기 일관성 | 최종 일관성이지만 속도 때문에 대부분 강력한 일관성처럼 보임 |
| 항목 컬렉션 지표·크기 | 추적되지 않음 |

> — 출처: [Setting up DynamoDB local (downloadable version)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html), [Usage notes for DynamoDB local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)

### 4.4 PartiQL 🔄

PartiQL은 DynamoDB의 데이터를 선택·삽입·업데이트·삭제하는 데 사용되는 **SQL 호환 쿼리 언어**입니다. 임시(ad hoc) 쿼리를 실행할 수 있습니다.

| 사용할 수 있는 곳 | 비고 |
|---|---|
| AWS Management Console | 교재 기재와 일치 |
| NoSQL Workbench | 교재 기재와 일치 |
| AWS Command Line Interface | 교재 기재와 일치 |
| PartiQL용 DynamoDB API | 교재는 "DynamoDB API"로 기재 |

PartiQL 작업은 다른 DynamoDB 데이터 영역 작업과 **동일한 가용성, 지연 시간, 성능**을 제공합니다.

교재 슬라이드 24의 Python 예제입니다.

```python
import boto3

dynamodb = boto3.client("dynamodb")
# 파라미터화된 PartiQL 문을 실행합니다. ? 자리에 Parameters 값이 순서대로 들어갑니다.
resp = dynamodb.execute_statement(
    Statement="SELECT * FROM Books WHERE Author = ? AND Title = ?",
    Parameters=[{"S": "John Grisham"}, {"S": "The Rainmaker"}],
)
print(resp["Items"])
```

#### 교재에 없는 제약 🆕

- DynamoDB는 PartiQL 쿼리 언어의 **하위 집합(subset)만** 지원합니다.
- **Amazon Ion 데이터 형식과 Ion 리터럴은 지원하지 않습니다.**

교재 강사 노트는 PartiQL 프로젝트 사이트 `https://partiql.org/` 도 함께 인용합니다. 이 자료의 사실 근거는 AWS 공식 문서 쪽입니다.

> — 출처: [PartiQL - a SQL-compatible query language for Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html)

### 4.5 AWS CLI

AWS CLI로 DynamoDB와 상호 작용하면 명령줄에서 스크립트로 자동화할 수 있습니다. 테이블 생성, 새 항목 추가 등 임시 작업에 사용합니다.

교재 슬라이드 25의 명령입니다. 하위 수준 API를 그대로 노출하므로 **항목의 각 속성에 데이터 형식 설명자가 붙는다**는 점을 확인하기 좋습니다.

```bash
aws dynamodb put-item --table-name Notes --item '{"UserId":{"S":"StudentA"},"NoteId":{"N":"11"},"Note":{"S":"HelloWorld!"}}'
```

🔄 이 명령 실행 결과를 보여주는 슬라이드 25의 표는 헤더가 `UserId | NoteId | Notes | Favorite`로 표기되어 있습니다. 같은 덱의 다른 모든 슬라이드(8, 12, 13, 14, 18, 19)와 위 `put-item` 명령의 항목 JSON은 속성 이름을 모두 `Note`로 씁니다. `Notes`는 **테이블 이름과 혼동된 오기**입니다.

이 자료에서는 위 `put-item` 명령을 교재 기재 그대로 남겨 두었습니다. 명령 자체를 AWS CLI 문서로 조회해 확인하지는 않았습니다([9.5절](#95-검증하지-못한-항목) 참조). 문서로 확인한 CLI 사용 패턴은 [4.3절](#43-dynamodb-local)의 `list-tables` 예제입니다.

> — 출처: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 4.6 데모: NoSQL Workbench

교재 슬라이드 26–27은 NoSQL Workbench 시연 구간입니다. 강의에서는 [4.2절](#42-nosql-workbench)의 두 도구(데이터 모델러, 작업 빌더)를 화면으로 확인합니다. 3.13.5 이후 기본 용량 모드가 온디맨드이므로 시연 화면과 예전 캡처가 다를 수 있습니다.

---

## 5. DynamoDB를 사용한 프로그래밍

### 5.1 AWS SDK 요청 처리 흐름

교재 슬라이드 29–30의 도해는 애플리케이션 → AWS SDK(객체 지속성 인터페이스 / 문서 인터페이스 / 하위 수준 인터페이스) → DynamoDB AWS REST API → AWS 클라우드의 DynamoDB 순서로 요청·응답이 양방향으로 흐르는 구조를 보여줍니다.

| 단계 | 내용 |
|---|---|
| 1 | 프로그래밍 언어에 맞는 AWS SDK로 애플리케이션을 작성합니다 |
| 2 | 각 AWS SDK는 DynamoDB 작업을 위한 하나 이상의 프로그래밍 인터페이스를 제공합니다. 사용 가능한 인터페이스는 언어와 SDK에 따라 다릅니다. 옵션은 하위 수준 인터페이스, 문서 인터페이스, 객체 지속성 인터페이스, 상위 수준 인터페이스입니다 |
| 3 | AWS SDK가 하위 수준 DynamoDB API용 **HTTP(S) 요청을 구성**합니다 |
| 4 | AWS SDK가 요청을 **DynamoDB 엔드포인트로 전송**합니다 |
| 5 | DynamoDB가 요청을 실행합니다. 성공하면 **HTTP 200 응답 코드(OK)**, 실패하면 HTTP 오류 코드와 오류 메시지를 반환합니다 |
| 6 | AWS SDK가 응답을 처리해 애플리케이션에 전파합니다 |

각 AWS SDK가 대신 처리하므로 **직접 코드를 작성할 필요가 없는** 작업입니다.

- HTTP(S) 요청 서식 지정 및 요청 파라미터 직렬화
- 각 요청에 대한 암호 서명 생성
- DynamoDB 엔드포인트로 요청 전달 및 응답 수신
- 응답에서 결과 추출
- 오류 발생 시 기본 재시도 로직 구현

> — 출처: [Overview of AWS SDK support for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html)

### 5.2 프로그래밍 인터페이스 비교 🔄

교재 슬라이드 31의 표입니다.

| 인터페이스 | 데이터 형식 설명자 | 교재가 기재한 지원 언어 | 특징 |
|---|---|---|---|
| 객체 지속성 인터페이스 | 매핑된 데이터 형식 | Java, .NET | 객체 중심 코드 |
| 문서 인터페이스 | 데이터 형식 설명자가 내포됨 | Java, .NET, Node.js, **AWS SDK for JavaScript in the Browser** | 기본 제공 JSON 도구 |
| 하위 수준 인터페이스 | 데이터 형식 설명자가 식별되어야 함 | 모든 AWS SDK를 지원 | — |

확인된 내용입니다.

| 인터페이스 | 동작 | 제공 SDK |
|---|---|---|
| 하위 수준 인터페이스 | 하위 수준 DynamoDB API 요청과 **거의 같은 메서드**를 가짐. 경우에 따라 `S`(문자열), `N`(숫자) 같은 데이터 형식 설명자로 속성의 데이터 형식을 식별해야 함 | **모든** 언어별 AWS SDK |
| 문서 인터페이스 | 테이블·인덱스에서 데이터 영역 작업(생성·읽기·업데이트·삭제)을 수행. 데이터 형식 설명자를 지정할 필요가 없고 데이터 형식이 데이터 자체의 의미 체계에 내포됨. JSON 문서를 네이티브 DynamoDB 데이터 형식으로 상호 변환하는 방법도 제공 | Java, .NET, Node.js, **JavaScript SDK** |
| 객체 지속성 인터페이스 | 데이터 영역 작업을 직접 수행하지 않고, 테이블·인덱스의 항목을 나타내는 **객체를 만들어 그 객체만** 다룸. 데이터베이스 중심이 아닌 **객체 중심 코드**를 작성 | Java, .NET |

🔄 교재는 문서 인터페이스 지원 대상을 "AWS SDK for JavaScript in the Browser"로 기재합니다. 현재 문서는 **JavaScript SDK**로 표기하며 AWS SDK for JavaScript v3 문서를 가리킵니다.

#### 상위 수준 인터페이스의 실체 🔄

| 언어 | 상위 수준 인터페이스 |
|---|---|
| Java 1.x | `DynamoDBMapper` |
| **Java 2.x** | **DynamoDB Enhanced Client** |
| .NET | 문서 모델, 객체 지속성 모델 |

상위 수준 인터페이스로 프로그램의 객체와 그 데이터를 저장하는 데이터베이스 테이블 사이의 관계를 정의하면, `save`·`load`·`delete` 같은 단순한 객체 메서드 호출로 하위 수준 DynamoDB 작업이 자동으로 실행됩니다.

> — 출처: [Programmatic interfaces that work with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKs.Interfaces.html), [Higher-level programming interfaces for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HigherLevelInterfaces.html)

### 5.3 계정 기반 엔드포인트 🆕

교재에 없는 변경입니다. AWS는 DynamoDB용 **AWS 계정 기반 엔드포인트**에 대한 SDK 지원을 배포하고 있으며, AWS SDK for Java V1부터 **2024년 9월 4일**에 시작했습니다.

| 항목 | 내용 |
|---|---|
| 엔드포인트 형식 | `https://(account-id).ddb.(region).amazonaws.com` |
| 적용 | 갱신된 SDK는 새 엔드포인트를 **자동으로** 사용 |
| 주의 | 하나의 SDK 클라이언트 인스턴스로 여러 계정에 요청을 보내면 **연결 재사용 기회가 줄어듦**. SDK 클라이언트 인스턴스당 연결 계정 수를 줄이도록 권장 |
| 대안 | `ACCOUNT_ID_ENDPOINT_MODE` 설정으로 리전 엔드포인트를 계속 사용 |

> — 출처: [Overview of AWS SDK support for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html)

---

## 6. DynamoDB 종속성

### 6.1 교재의 SDK 종속성 표 🔄

교재 슬라이드 33의 표 원문입니다.

| API | Python | .NET | Java |
|---|---|---|---|
| 하위 수준 | `boto3.dynamodb.conditions`<br>`boto3.dynamodb.types` | `Amazon.DynamoDBv2.Model` | `com.amazonaws.services.dynamodbv2.AmazonDynamoDB` |
| 상위 수준 | *(빈 칸)* | `Amazon.DynamoDBv2.DataModel` | `com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper` |

이 표에는 확인이 필요한 지점이 세 개 있고, 세 개 모두 현재와 다릅니다. 아래 절에서 언어별로 나눠 정리합니다.

### 6.2 Java 종속성 🔄

교재 표의 Java 항목은 둘 다 **AWS SDK for Java 1.x 네임스페이스**(`com.amazonaws.services.dynamodbv2.*`)이고, 1.x는 **2025년 12월 31일 지원이 종료**되었습니다. AWS는 새 기능, 가용성 개선, 보안 업데이트를 계속 받으려면 **AWS SDK for Java 2.x로 마이그레이션**할 것을 권장합니다.

| 계층 | 2.x 네임스페이스 |
|---|---|
| 하위 수준 클라이언트 | `software.amazon.awssdk.services.dynamodb.DynamoDbClient` |
| 하위 수준 모델 | `software.amazon.awssdk.services.dynamodb.model.GetItemRequest`<br>`software.amazon.awssdk.services.dynamodb.model.AttributeValue`<br>`software.amazon.awssdk.services.dynamodb.model.DynamoDbException` |
| 리전 | `software.amazon.awssdk.regions.Region` |
| 상위 수준(객체 지속성) | `software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient`<br>`software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable`<br>`software.amazon.awssdk.enhanced.dynamodb.Key`<br>`software.amazon.awssdk.enhanced.dynamodb.TableSchema`<br>`software.amazon.awssdk.enhanced.dynamodb.model.GetItemEnhancedRequest` |

Enhanced Client는 하위 수준 클라이언트를 감싸서 만듭니다.

```java
// 하위 수준 클라이언트를 먼저 만들고 그것을 Enhanced Client 에 넘깁니다.
DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
    .dynamoDbClient(ddb)
    .build();
```

공식 예제는 항목을 가져올 때 **Enhanced Client 사용이 더 나은 방식**이라고 안내합니다.

교재 안에서 SDK 세대가 섞여 있다는 점도 짚어 둘 만합니다. 슬라이드 33의 종속성 표는 1.x 네임스페이스인데, [7.1절](#71-java-예제-서비스-클라이언트-생성)에서 볼 슬라이드 35의 예제 코드는 이미 2.x의 `DynamoDbClient.builder()` 문법을 씁니다.

> — 출처: [Programmatic interfaces that work with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKs.Interfaces.html), [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

### 6.3 Python(boto3) 종속성 🔄

교재 표의 Python 상위 수준 칸은 비어 있고, `boto3.dynamodb.conditions`·`boto3.dynamodb.types`가 하위 수준 칸에 들어 있습니다. 공식 문서는 이 두 모듈을 **`Table` 리소스(`dynamodb.Table`)와 함께 쓰는 DynamoDB 커스터마이제이션**으로 설명합니다.

| 모듈·클래스 | 용도 |
|---|---|
| `boto3.dynamodb.types.Binary` | DynamoDB의 Binary(`B`) 형식을 표현하는 클래스 |
| `boto3.dynamodb.conditions.Key` | 항목의 **키**에 대한 조건. `Table.query()` 의 `KeyConditionExpression` 에 전달 |
| `boto3.dynamodb.conditions.Attr` | 항목의 **속성**에 대한 조건. `Table.scan()` 의 `FilterExpression` 에 전달 |

```python
# Key 와 Attr 은 conditions 모듈에서 가져옵니다.
from boto3.dynamodb.conditions import Key, Attr

# 조건은 논리 연산자로 연결합니다. & 는 and, | 는 or, ~ 는 not 입니다.
response = table.query(
    KeyConditionExpression=Key("UserId").eq("StudentA") & Key("NoteId").gt(10),
    FilterExpression=Attr("Favorite").eq("yes"),
)
```

Python 형식과 DynamoDB 형식의 매핑입니다.

| Python 형식 | DynamoDB 형식 |
|---|---|
| `string` | `S` |
| `integer`, `decimal.Decimal` | `N` |
| `boto3.dynamodb.types.Binary` | `B` |
| `boolean` | `BOOL` |
| `None` | `NULL` |
| string set | `SS` |
| `integer`·`decimal.Decimal` set | `NS` |
| `Binary` set | `BS` |
| `list` | `L` |
| `dict` | `M` |

#### 상위 수준 칸이 비어 있는 이유 🔄

boto3에서 상위 수준에 해당하는 것은 **리소스(resources) 인터페이스**(`boto3.resource('dynamodb')` 와 `dynamodb.Table`)입니다. 그런데 AWS Python SDK 팀은 이 인터페이스에 **새 기능을 추가할 계획이 없습니다.**

| 항목 | 내용 |
|---|---|
| 상태 | 신규 기능 추가 계획 없음. 기존 인터페이스는 **boto3의 수명 주기 동안 계속 동작** |
| 최신 기능 경로 | **클라이언트(client) 인터페이스** |
| 리소스의 성격 | 서비스 클라이언트의 원시 하위 수준 호출보다 높은 수준의 추상화를 제공하는 **객체 지향 인터페이스**. `Session` 의 `resource()` 메서드에 서비스 이름을 넘겨 사용 |
| 스레드 안전성 | 리소스 인스턴스는 **스레드 안전하지 않음**. 스레드·프로세스 간에 공유하지 말고 스레드·프로세스마다 새로 만들어야 함 |

> — 출처: [Boto3 DynamoDB customizations](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/customizations/dynamodb.html), [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 6.4 .NET 종속성 🔄

교재 표는 .NET을 두 줄로만 기재하고 **문서 인터페이스에 해당하는 네임스페이스를 누락**합니다.

| 계층 | 네임스페이스 | 주요 요소 |
|---|---|---|
| 하위 수준 | `Amazon.DynamoDBv2`<br>`Amazon.DynamoDBv2.Model` | `AmazonDynamoDBClient` 인스턴스와 `PutItemRequest`·`GetItemRequest` 같은 요청 객체 |
| 🆕 문서 모델 | `Amazon.DynamoDBv2.DocumentModel` | `Table`, `Document`. 테이블을 생성·업데이트·삭제할 수는 없지만 대부분의 일반적인 데이터 작업을 지원 |
| 상위 수준(객체 지속성) | `Amazon.DynamoDBv2.DataModel` | 클라이언트 측 클래스를 테이블에 매핑 |

```csharp
// 계층별로 필요한 네임스페이스가 다릅니다.
using Amazon.DynamoDBv2;                // 하위 수준 클라이언트
using Amazon.DynamoDBv2.Model;          // 하위 수준 요청·응답 모델
using Amazon.DynamoDBv2.DocumentModel;  // 문서 모델 (Table, Document)
using Amazon.DynamoDBv2.DataModel;      // 객체 지속성 모델
```

#### 객체 지속성 모델과 `DynamoDBContext`

교재는 `DynamoDBContext`가 DynamoDB에 대한 진입점이라고 맞게 기재합니다.

| 항목 | 내용 |
|---|---|
| 매핑 단위 | 각 **객체 인스턴스가 테이블의 항목**에 매핑됨 |
| `DynamoDBContext` | DynamoDB에 대한 **진입점**. 연결을 제공해 테이블에 액세스하고 CRUD 작업과 쿼리를 수행 |
| 🆕 제약 | 객체 지속성 모델은 **테이블을 생성·업데이트·삭제하는 API를 제공하지 않음**. 데이터 작업만 제공하므로 테이블 생성·업데이트·삭제는 .NET 하위 수준 API를 써야 함 |
| 필수 속성(attribute) | `DynamoDBTable`, `DynamoDBHashKey` 두 개뿐 |
| 동시성 | **낙관적 잠금(optimistic locking)** 지원 |

> — 출처: [Working with the .NET document model in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html), [Working with the .NET object persistence model and DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html)

---

## 7. DynamoDB 서비스 참조

### 7.1 Java 예제: 서비스 클라이언트 생성

AWS 서비스에 요청을 보내려면 먼저 **서비스 클라이언트 객체를 생성**해야 합니다. 정적 팩토리 메서드 `builder()` 로 인스턴스화합니다.

교재 슬라이드 35의 "클라이언트 빌더 가져오기" 예제입니다.

```java
DynamoDbClient client = DynamoDbClient.builder()
    .region(Region.US_WEST_2)
    .credentialsProvider(ProfileCredentialsProvider.builder()
        .profileName("myProfile")
        .build())
    .build();
```

"로컬 설치용 클라이언트 빌더 가져오기" 예제입니다. [4.3절](#43-dynamodb-local)의 로컬 엔드포인트를 코드에서 지정하는 방법입니다.

```java
DynamoDbClient client = DynamoDbClient.builder()
    .endpointOverride(URI.create("http://localhost:8000"))
    // 리전은 로컬 DynamoDB 에는 의미가 없지만 클라이언트 빌더 검증에 필요합니다.
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("dummy-key", "dummy-secret")))
    .build();
```

"기본 클라이언트 생성" 예제입니다.

```java
DynamoDbClient client = DynamoDbClient.create();
```

#### 빌더와 `create()` 의 차이

| 메서드 | 동작 |
|---|---|
| `builder()` | 클라이언트를 커스터마이징할 수 있는 **빌더 객체**를 반환. 플루언트 세터 메서드가 빌더 객체를 반환하므로 메서드 호출을 연결할 수 있고, 원하는 속성을 구성한 뒤 `build()` 를 호출 |
| `create()` | **기본 구성**으로 클라이언트를 생성. 기본 공급자 체인으로 자격 증명을, 기본 AWS 리전 공급자 체인으로 리전을 로드. 환경에서 자격 증명이나 리전을 확인할 수 없으면 **호출이 실패** |

#### 클라이언트 수명 관리 🆕

교재에 없는 내용이지만 실무에서 바로 문제가 되는 부분입니다.

| 항목 | 내용 |
|---|---|
| 스레드 안전성 | SDK의 서비스 클라이언트는 **스레드 안전**하며 성능을 위해 **오래 사는 객체**로 취급해야 함 |
| 연결 풀 | 각 클라이언트는 **자체 연결 풀 리소스**를 가지며 가비지 컬렉션될 때 해제됨 |
| 불변성 | 서비스 클라이언트 객체는 **불변**. 요청할 서비스마다, 또는 같은 서비스에 다른 구성을 쓰려면 새 클라이언트를 만들어야 함 |
| 리전 지정 | 모든 AWS 서비스에 필수는 아니지만 애플리케이션에서 리전을 설정하는 것이 **모범 사례** |
| 정리 | 클라이언트가 더 필요하지 않으면 `close()` 를 호출해 리소스를 해제. 서비스 클라이언트는 `Autoclosable` 을 구현하므로 **try-with-resources** 문에서 자동으로 닫힘 |

#### 평문 키에 대한 교재의 경고

교재 슬라이드 35에는 `StaticCredentialsProvider` 예제와 함께 경고가 붙어 있습니다. 원문에 오기가 있어("이 유형이 코드를") 뜻을 옮기면 다음과 같습니다. 일반적인 애플리케이션에서는 이런 유형의 코드를 사용하지 말고, 포함해야 한다면 평문 키가 코드·네트워크·컴퓨터 메모리에 노출되지 않도록 주의해야 합니다.

#### 문서 경로 🔄

| 구분 | 내용 |
|---|---|
| 교재가 인용한 URL | `sdk-for-java/latest/developer-guide/using.html` — 현재는 "Using the AWS SDK for Java 2.x" **챕터 목차 페이지** |
| 실제 내용 위치 | 하위 페이지 `work-witih-clients.html` 의 "Create a service client" 절 |

> — 출처: [Making AWS service requests using the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/work-witih-clients.html), [Using the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/using.html)

### 7.2 Python 예제: 서비스 클라이언트 생성 🔄

교재 슬라이드 36의 코드입니다. 원문 주석은 `boto3.client('dynamodb')` 위에 "서비스 리소스 가져오기"라고 적혀 있는데, boto3에서 `client()` 와 `resource()` 는 **별개의 인터페이스**이므로 이 주석은 잘못되었습니다. 여기서는 주석을 교정해 실었습니다.

```python
import boto3

# 하위 수준 클라이언트 생성 (리소스 인터페이스는 boto3.resource('dynamodb'))
dynamodb = boto3.client('dynamodb')

# DynamoDB 테이블 생성
table = dynamodb.create_table(
    TableName='Notes',
    KeySchema=[...],
    AttributeDefinitions=[...],
    BillingMode='PAY_PER_REQUEST'
)
```

| 인터페이스 | 생성 방법 | 비고 |
|---|---|---|
| 클라이언트 | `boto3.client('dynamodb')` | 하위 수준. 최신 서비스 기능이 여기로 제공됨 |
| 리소스 | `boto3.resource('dynamodb')` | 상위 수준 추상화. 신규 기능 추가 계획 없음 ([6.3절](#63-pythonboto3-종속성) 참조) |

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 7.3 `create_table` 의 `BillingMode` 🆕

교재 예제가 쓰는 `BillingMode='PAY_PER_REQUEST'` 는 현재도 유효하고 **권장 값**입니다.

| 값 | 의미 | 권장 대상 |
|---|---|---|
| `PAY_PER_REQUEST` | **온디맨드 용량 모드**. AWS는 대부분의 DynamoDB 워크로드에 이 값을 권장 | 대부분의 워크로드 |
| `PROVISIONED` | **프로비저닝된 용량 모드** | 용량 요구를 안정적으로 예측할 수 있는 꾸준한 워크로드 |

- `BillingMode` 는 읽기·쓰기 처리량 과금 방식과 용량 관리 방식을 제어하고 **나중에 변경할 수 있습니다**([3.7절](#37-용량-모드요금-옵션)의 전환 횟수 제한 참조).
- `PROVISIONED` 로 설정하면 `ProvisionedThroughput` 을 **지정해야 하고**, `PAY_PER_REQUEST` 로 설정하면 **지정할 수 없습니다.**

#### `CreateTable` 파라미터에서 확인할 지점 🆕

| 항목 | 내용 |
|---|---|
| 필수 파라미터 | **`TableName` 하나** |
| `KeySchema` 의 `KeyType` | `HASH`(파티션 키) 또는 `RANGE`(정렬 키) |
| 단순 기본 키 | `HASH` 요소 **하나** |
| 복합 기본 키 | `HASH` 다음 `RANGE` 순으로 **정확히 두 요소** |
| 비동기 동작 | `CreateTable` 은 비동기 작업. 즉시 `TableStatus` **`CREATING`** 을 반환하고 생성이 끝나면 **`ACTIVE`** 가 됨. 읽기·쓰기는 `ACTIVE` 테이블에서만 가능 |
| 이름 고유성 | AWS 계정 안에서 테이블 이름은 **리전별로 고유**. 리전이 다르면 같은 이름의 테이블 두 개를 만들 수 있음 |
| 인덱스 | 생성 시 GSI 최대 20개, LSI 최대 5개 정의 가능. 각 GSI는 최대 4개의 파티션 키와 최대 4개의 정렬 키 지원 |
| 교재에 없는 파라미터 | `DeletionProtectionEnabled`, `OnDemandThroughput`(`MaxReadRequestUnits`·`MaxWriteRequestUnits`), `WarmThroughput`, `ResourcePolicy`, `SSESpecification`, `StreamSpecification`, `TableClass`, `Tags`, `VectorIndexes` |

`OnDemandThroughput` 이 [3.8절](#38-온디맨드-테이블의-최대-처리량)의 최대 처리량 설정이고, `VectorIndexes` 가 [3.14절](#314-벡터-인덱스)의 벡터 인덱스입니다.

> — 출처: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)

---

## 8. 요청 및 응답

### 8.1 하위 수준 API

Amazon DynamoDB 하위 수준 API는 DynamoDB의 **프로토콜 수준 인터페이스**입니다. 이 수준에서 모든 HTTP(S) 요청은 올바른 형식이어야 하며 **유효한 디지털 서명**이 있어야 합니다. AWS SDK가 사용자를 대신하여 하위 수준 요청을 구성하고 응답을 처리하므로 애플리케이션 로직에 집중할 수 있습니다.

| 항목 | 내용 |
|---|---|
| HTTP 메서드 | 하위 수준 API는 **HTTP(S) POST 요청만** 입력으로 받음 |
| 와이어 프로토콜 | **JSON** |
| 스토리지 형식 | DynamoDB는 JSON을 **전송 프로토콜로만** 쓰고 스토리지 형식으로는 쓰지 않음 |

> — 출처: [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.2 요청 형식: GetItem

교재 슬라이드 39의 요청 예제입니다.

```http
POST / HTTP/1.1
Host: dynamodb.<region>.<domain>;
Accept-Encoding: identity
Content-Length: <PayloadSizeBytes>
User-Agent: <UserAgentString>
Content-Type: application/x-amz-json-1.0
Authorization: AWS4-HMAC-SHA256 Credential=<Credential>, SignedHeaders=<Headers>, Signature=<Signature>
X-Amz-Date: <Date>
X-Amz-Target: DynamoDB_20120810.GetItem

{
  "TableName": "Notes",
  "Key": {
    "UserId": {"S": "StudentA"},
    "NoteId": {"N": "1"}
  }
}
```

| 요소 | 역할 |
|---|---|
| `Authorization` | DynamoDB가 요청을 **인증**하는 데 필요한 정보 |
| `X-Amz-Target` | DynamoDB **작업 이름**(`GetItem`)과 하위 수준 **API 버전**(`20120810`) |
| `Content-Type` | `application/x-amz-json-1.0` |
| 페이로드(본문) | JSON 형식으로 작업의 파라미터. `GetItem` 의 파라미터는 `TableName` 과 `Key` |

값이 `{"N": "1"}` 처럼 숫자를 문자열로 감싸는 이유는 [3.3절](#33-항목-및-속성-유형)의 데이터 형식 설명자 규칙 때문입니다.

#### GetItem 작업에서 확인할 지점 🆕

| 항목 | 내용 |
|---|---|
| 반환값 | 지정된 기본 키를 가진 항목의 속성 집합. 일치하는 항목이 없으면 데이터를 반환하지 않고 **응답에 `Item` 요소가 없음** |
| 기본 일관성 | 🆕 **기본적으로 최종 일관성 읽기**. 강력한 일관성이 필요하면 `ConsistentRead` 를 `true` 로 설정. 강력한 일관성 읽기는 시간이 더 걸릴 수 있지만 항상 마지막으로 갱신된 값을 반환 |
| 필수 파라미터 | `Key`, `TableName` |
| 기본 키 제공 방식 | 모든 속성을 제공해야 함. 단순 기본 키는 파티션 키 값만, 복합 기본 키는 파티션 키와 정렬 키 값을 모두 |
| 레거시 파라미터 | `AttributesToGet` 은 레거시. **`ProjectionExpression`** 을 사용해야 함 |
| `ReturnConsumedCapacity` | 유효 값은 `INDEXES`, `TOTAL`, `NONE` |

> — 출처: [GetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html), [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.3 응답 형식

교재 슬라이드 40의 응답 예제입니다.

```http
HTTP/1.1 200 OK
x-amzn-RequestId: <RequestId>
x-amz-crc32: <Checksum>
Content-Type: application/x-amz-json-1.0
Content-Length: <PayloadSizeBytes>
Date: <Date>

{
  "Item": {
    "UserId": {"S": "StudentA"},
    "NoteId": {"N": "1"},
    "Note": {"S": "HelloWorld!"}
  }
}
```

| 요소 | 역할 |
|---|---|
| 상태 줄 | `HTTP/1.1 200 OK` — 작업 성공 |
| `x-amzn-RequestId` | 요청 ID. 문제 진단 시 AWS Support에 전달 |
| `x-amz-crc32` | 페이로드 체크섬 |
| 페이로드 | JSON 형식의 작업 결과 |

DynamoDB가 요청을 처리할 수 없으면 HTTP 오류 코드와 메시지를 반환하고, **AWS SDK가 이를 예외 형태로 애플리케이션에 전파**합니다.

> — 출처: [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.4 DescribeTable 요청과 응답 🆕

교재는 `GetItem` 만 예로 듭니다. 같은 형식이 다른 작업에도 그대로 적용된다는 것을 보이기 위해 `DescribeTable` 을 함께 둡니다. `X-Amz-Target` 의 작업 이름만 바뀝니다.

```http
POST / HTTP/1.1
Content-Type: application/x-amz-json-1.0
X-Amz-Target: DynamoDB_20120810.DescribeTable

{"TableName":"Thread"}
```

| 항목 | 내용 |
|---|---|
| 반환값 | 테이블의 **현재 상태, 생성 시점, 기본 키 스키마, 테이블의 모든 인덱스 정보** |
| 필수 파라미터 | `TableName` 하나 |
| 응답 구조 | `HTTP/1.1 200 OK` 와 `x-amzn-RequestId`·`x-amz-crc32`·`Content-Type: application/x-amz-json-1.0` 헤더, 그리고 `TableDescription` 객체를 담은 `Table` 요소 |
| 응답 필드 | `AttributeDefinitions`, `BillingModeSummary`, `CreationDateTime`, `DeletionProtectionEnabled`, `GlobalSecondaryIndexes`, `ItemCount`, `KeySchema`, `LocalSecondaryIndexes`, `OnDemandThroughput`, `ProvisionedThroughput`, `Replicas`, `SSEDescription`, `StreamSpecification`, `TableArn`, `TableClassSummary`, `TableId`, `TableName`, `TableSizeBytes`, `TableStatus`, `VectorIndexes`, `WarmThroughput` 등 |
| 오류 | `InternalServerError`(HTTP 500), `ResourceNotFoundException`(HTTP 400) |

두 가지 함정이 있습니다.

- **`CreateTable` 직후 `DescribeTable` 을 호출하면 `ResourceNotFoundException` 이 반환될 수 있습니다.** `DescribeTable` 이 최종 일관성 쿼리를 사용하므로 그 시점에 테이블 메타데이터를 아직 사용할 수 없기 때문입니다. 몇 초 기다린 뒤 다시 요청해야 합니다.
- `DescribeTable` 이 반환하는 각 보조 인덱스의 **스토리지 크기와 항목 수는 실시간으로 갱신되지 않고 약 6시간마다** 새로 고쳐집니다.

> — 출처: [DescribeTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html)

### 8.5 응답 오류 코드 🔄

요청이 실패하면 DynamoDB가 세 가지 구성 요소로 응답합니다.

| 구성 요소 | 예 |
|---|---|
| HTTP 상태 코드 | `400` |
| 예외 이름 | `ResourceNotFoundException` |
| 오류 메시지 | `Requested resource not found: Table: tablename not found` |

교재 슬라이드 41의 응답 예제입니다.

```http
HTTP/1.1 400 Bad Request
x-amzn-RequestId: LDM6CJP8RMQ1FHKSC1RBVJFPNVV4KQNSO5AEMF66Q9ASUAAJG
Content-Type: application/x-amz-json-1.0
Content-Length: 240
Date: Thu, 15 Mar 2012 23:56:23 GMT

{
  "__type": "com.amazonaws.dynamodb.v20120810#ResourceNotFoundException",
  "message": "Requested resource not found: Table: UserNote not found"
}
```

🔄 교재 예시 메시지의 `Table: UserNote not found` 는 공식 문서 예시에서 `Table: tablename not found` 로 표기됩니다. 내용상 같은 오류이고 테이블 이름만 다릅니다.

AWS SDK가 오류를 애플리케이션에 전파하므로 **try-catch 로직으로 처리**할 수 있습니다.

#### HTTP 400 — 요청 문제

인증 실패, 필수 파라미터 누락, 테이블의 프로비저닝된 처리량 초과와 같은 요청 문제를 나타냅니다. **요청을 다시 제출하기 전에 애플리케이션에서 문제를 해결해야 합니다.** 교재에 없는 전체 예외 목록입니다.

| 예외 |
|---|
| `AccessDeniedException` |
| `ConditionalCheckFailedException` |
| `IncompleteSignatureException` |
| `ItemCollectionSizeLimitExceededException` |
| `LimitExceededException` |
| `MissingAuthenticationTokenException` |
| `ProvisionedThroughputExceededException` |
| `ReplicatedWriteConflictException` |
| `RequestLimitExceeded` |
| `ResourceInUseException` |
| `ResourceNotFoundException` |
| `ThrottlingException` |
| `UnrecognizedClientException` |
| `ValidationException` |

각 예외의 **재시도 가능 여부가 다릅니다.** `ResourceNotFoundException` 은 **재시도 불가**이며, 예시는 요청된 테이블이 존재하지 않거나 `CREATING` 상태로 너무 이른 경우입니다.

#### HTTP 5xx — AWS 측 문제

AWS에서 해결해야 하는 문제를 나타냅니다. 일시적인 오류일 수 있어 **성공할 때까지 재시도**할 수 있습니다.

| 예외 | 코드 | 재시도 |
|---|---|---|
| `InternalServerError` | HTTP 500 | 가능 |
| `ServiceUnavailable` (`DynamoDB is currently unavailable`) | HTTP 503 | 가능 |

#### 재시도 전략 🆕

| 항목 | 내용 |
|---|---|
| SDK 사용 시 | 각 AWS SDK가 **재시도 로직과 지수 백오프 알고리즘을 자동으로 구현** |
| SDK를 쓰지 않는 경우 | 서버 오류(5xx)는 재시도하고, 클라이언트 오류(4xx)는 `ThrottlingException`·`ProvisionedThroughputExceededException` 을 제외하면 **요청 자체를 수정**해야 함 |
| 스로틀링 원인 파악 | `ProvisionedThroughputExceededException`·`RequestLimitExceeded`·`ThrottlingException` 에는 스로틀링 원인을 알려주는 **`ThrottlingReason`** 필드 목록이 포함됨 |
| 요청 ID | 응답에 문제 진단 시 AWS Support에 전달할 수 있는 **Request ID** 가 포함됨 |

> — 출처: [Error handling with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html)

---

## 9. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 9.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| RCU·WCU의 소속 모드 (슬라이드 16 강사 노트 마지막 문단) | "온디맨드 모드의 RRU와 WRU는 사용된 용량을 나타내는 반면 **온디맨드 모드의 RCU와 WCU**는 예약 용량을 나타낸다" | RCU·WCU는 **프로비저닝된 용량 모드**의 단위입니다. 두 번째 '온디맨드'는 '프로비저닝'의 오기이고, 같은 노트 앞부분·슬라이드 본문과 자체 모순입니다 | [DynamoDB 제약](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| 항목 컬렉션 10GB 한도 (슬라이드 18) | "항목 컬렉션의 총 크기는 10GB를 초과할 수 없습니다" — 조건 없이 기재 | **LSI가 하나 이상 있는 테이블에만** 적용되는 제약입니다. LSI가 없으면 DynamoDB가 항목 컬렉션을 여러 파티션에 자동 분할합니다. 10GB는 파티션의 최대 크기입니다 | [DynamoDB 제약](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| LSI 정렬 키 제약 (슬라이드 18) | "이 정렬 키는 스칼라 속성이 될 수 있습니다" | **문자열·숫자·이진 형식의 키가 아닌 기본 테이블 최상위 속성**이어야 합니다. LSI 기본 키는 반드시 복합이고, 인덱스 키 스키마에 문서·세트 형식은 쓸 수 없습니다 | [보조 인덱스](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html) |
| Python 예제의 주석 (슬라이드 36) | `dynamodb = boto3.client('dynamodb')` 바로 위에 "서비스 리소스 가져오기" 주석 | boto3에서 `client()` 와 `resource()` 는 **별개의 인터페이스**입니다. 리소스는 `boto3.resource('dynamodb')` 로 가져옵니다 | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| 결과 표의 열 이름 (슬라이드 25) | 헤더가 `UserId \| NoteId \| Notes \| Favorite` | 속성 이름은 `Note` 입니다. 같은 덱의 슬라이드 8·12·13·14·18·19와 `put-item` 명령의 항목 JSON이 모두 `Note` 를 씁니다. `Notes` 는 **테이블 이름과 혼동된 오기**입니다 | [DynamoDB 주요 구성 요소](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html) |
| JSON 예제 문법 (슬라이드 13) | `"Tags": ["DynamoDB", "NoSQL"]` 뒤에 쉼표가 없어 다음 `"Meta"` 항목과 이어지지 않음. 원문 그대로는 유효한 JSON이 아님 | 이 자료에서는 쉼표를 넣어 유효한 JSON으로 고쳐 실었습니다 ([3.3절](#33-항목-및-속성-유형)) | [데이터 형식과 명명 규칙](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html) |

### 9.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 지연 시간 표기 | "규모와 관계없이 10밀리초 미만의 대기 시간", "평균 서비스 지연 시간은 보통 10밀리초 미만" | 규모와 관계없이 **한 자리 밀리초(single-digit millisecond)** 성능 | [DynamoDB 소개](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| ElastiCache 지원 엔진 | "완전관리형 Redis 또는 Memcached 엔진" | **Valkey, Memcached, Redis OSS** 세 엔진. 서버리스와 노드 기반 배포 옵션 | [AWS 데이터베이스 선택 안내서](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html) |
| AWS 데이터베이스 서비스 비교 표 | 관계형 행에 RDS와 Redshift를 함께 넣고, Aurora를 RDS가 지원하는 엔진 중 하나로 기재 | OLTP 관계형은 **Aurora 계열 + RDS 엔진 6종 = 9개 엔진**이고 Aurora는 별도 계열입니다. **Db2**가 추가되었고 **Redshift는 OLAP** 로 분리됩니다. MemoryDB·Aurora DSQL·Aurora PostgreSQL Limitless Database·벡터 데이터 모델은 교재에 없습니다 | [AWS 데이터베이스 선택 안내서](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html) |
| NoSQL Workbench 도구 구성 | 데이터 모델러 / 시각화 프로그램 / 작업 빌더 **3개** | DynamoDB 문서는 **데이터 모델러와 작업 빌더 2개**만 나열하고 시각화를 별도 도구로 두지 않습니다. 데이터 모델러가 샘플 데이터 구성과 액세스 패턴 검증까지 담당하며, 현재 NoSQL Workbench에는 **DynamoDB local이 포함**됩니다. Amazon Keyspaces 쪽 문서에는 여전히 시각화 항목이 있습니다 | [NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html) |
| 할당량 문서 경로 | 슬라이드 17이 인용한 `developerguide/Limits.html` | `ServiceQuotas.html` 로 리디렉션되고, 문서가 둘로 나뉘었습니다. 조정 가능한 할당량은 **ServiceQuotas.html**, 항목 크기·키 길이·데이터 형식 같은 고정 제약은 **Constraints.html** | [DynamoDB 할당량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| Java SDK 문서 경로 | 슬라이드 35가 인용한 `sdk-for-java/latest/developer-guide/using.html` 을 '서비스 클라이언트 생성' 항목으로 직접 인용 | 해당 URL은 **챕터 목차 페이지**입니다. 내용은 하위 페이지 `work-witih-clients.html` 의 "Create a service client" 절에 있습니다 | [Java SDK 서비스 요청](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/work-witih-clients.html) |
| 온디맨드 요금 페이지 경로 | 슬라이드 15가 인용한 `aws.amazon.com/dynamodb/pricing/on-demand/` | 통합 요금 페이지 `aws.amazon.com/dynamodb/pricing/` 으로 리디렉션됩니다 | [DynamoDB 요금](https://aws.amazon.com/dynamodb/pricing/on-demand/) |

### 9.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| 슬라이드 33 Java 열의 `com.amazonaws.services.dynamodbv2.*` 네임스페이스 (AWS SDK for Java 1.x) | **2025년 12월 31일 지원 종료** | 하위 수준은 `software.amazon.awssdk.services.dynamodb.DynamoDbClient` 와 `software.amazon.awssdk.services.dynamodb.model.*`, 상위 수준은 `software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient`(DynamoDB Enhanced Client) | [Java SDK 1.x 지원 종료](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| boto3 리소스 인터페이스 (`boto3.resource('dynamodb')`, `dynamodb.Table`) | 신규 기능 추가 계획 없음. 기존 인터페이스는 boto3 수명 주기 동안 계속 동작 | 클라이언트 인터페이스 `boto3.client('dynamodb')` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

교재 슬라이드 33의 Python 상위 수준 칸이 비어 있는 이유를 설명할 때 이 두 번째 항목을 함께 알려야 합니다. boto3에서 상위 수준에 해당하는 것이 바로 이 리소스 인터페이스입니다.

### 9.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| 온디맨드 테이블의 최대 처리량 | 개별 테이블과 GSI에 초당 최대 읽기·쓰기 처리량을 지정. 초과 시 `ThrottlingException`. 기본적으로 미적용 | [온디맨드 최대 처리량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode-max-throughput.html) |
| 벡터 인덱스 | 벡터 임베딩 유사도 검색용 인덱스 계열. `Query`·`Scan` 이 아니라 `SearchVectors` 로 읽음. 테이블당 5개(조정 가능), 최대 차원 4,096 | [보조 인덱스](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html) |
| 용량 모드 전환 횟수 규칙 | 프로비저닝 → 온디맨드는 24시간 롤링 윈도우 안에서 최대 4회, 온디맨드 → 프로비저닝은 언제든 | [DynamoDB 제약](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| AWS 계정 기반 엔드포인트 | `https://(account-id).ddb.(region).amazonaws.com`. Java V1부터 2024년 9월 4일 배포 시작. 갱신된 SDK가 자동 사용 | [SDK 지원 개요](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html) |
| Java 2.x DynamoDB Enhanced Client | 2.x의 상위 수준 인터페이스. 1.x의 `DynamoDBMapper` 를 대체 | [상위 수준 프로그래밍 인터페이스](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HigherLevelInterfaces.html) |
| .NET 문서 모델 네임스페이스 | 교재가 누락한 `Amazon.DynamoDBv2.DocumentModel`(`Table`, `Document`) | [.NET 문서 모델](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html) |
| `CreateTable` 신규 파라미터 | `DeletionProtectionEnabled`, `OnDemandThroughput`, `WarmThroughput`, `ResourcePolicy`, `TableClass`, `Tags`, `VectorIndexes`. GSI의 다중 파티션 키·정렬 키 지원 | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| 트랜잭션 세부 한도 | `TransactWriteItems`·`TransactGetItems` 각 최대 100개 작업, 트랜잭션당 항목 합계 4MB, 항목마다 준비·커밋 두 번의 읽기·쓰기 소비, 인덱스에는 사용 불가 | [DynamoDB 트랜잭션](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html) |
| PITR 보존 기간 | 최근 35일 이내 임의 시점(초 단위) 복원. 복구 기간 1~35일 설정 가능. 3 AZ 복제, 99.99% 가용성 SLA(글로벌 테이블 99.999%) | [DynamoDB 소개](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| 프로젝션 속성 합산 한도 | 테이블의 LSI·GSI 전체에 대해 사용자 지정 프로젝션 속성 합산 100개. `ProjectionType`이 `INCLUDE`인 경우에만 적용 | [DynamoDB 할당량](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| DynamoDB local 제약 목록 | PITR 미지원, `billingModeSummary` 는 항상 `null`, 프로비저닝된 처리량 설정 무시, 병렬 스캔 미지원, 항목 컬렉션 지표·크기 미추적 | [DynamoDB local 사용 참고](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html) |
| NoSQL Workbench 기본 용량 모드 변경 | 3.13.5(2025년 2월 24일)부터 기본 테이블 설정의 용량 모드가 온디맨드. 기본 설정으로 만들면 온디맨드 테이블이 생성됨 | [NoSQL Workbench 릴리스 기록](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkbenchDocumentHistory.html) |
| `DescribeTable` 의 최종 일관성 함정 | `CreateTable` 직후 호출하면 `ResourceNotFoundException` 이 반환될 수 있음. 인덱스 크기·항목 수는 약 6시간마다 갱신 | [DescribeTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html) |
| `ThrottlingReason` 필드 | 스로틀링 계열 예외에 원인을 알려주는 필드 목록이 포함됨 | [오류 처리](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) |

### 9.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| Amazon Timestream 하위 제품 구성 | AWS 데이터베이스 선택 안내서는 시계열 서비스를 'Amazon Timestream'으로 표기하면서 서버리스 목록에서는 'Amazon Timestream for LiveAnalytics'로 표기합니다. 하위 제품 구성(LiveAnalytics / InfluxDB)과 각각의 현재 상태를 Timestream 문서로 직접 확인하지 못했습니다. 이 자료에서는 서비스명과 데이터 모델(시계열)만 남겼습니다 |
| 교재의 '10밀리초 미만' 수치 | 이 수치가 과거의 공식 표현이었는지 확인하지 못했습니다. 현재 공식 표현이 '한 자리 밀리초'라는 것만 확인했습니다. 따라서 "10밀리초 미만이 과거에는 맞았다"고는 쓰지 않았습니다 |
| 시각화 프로그램이 통합된 시점 | 현재 DynamoDB NoSQL Workbench 문서가 도구를 두 개로만 소개하는 것은 확인했습니다. 그러나 시각화 프로그램이 **어느 릴리스에서** 데이터 모델러로 통합되었는지는 릴리스 기록을 일부만 조회해 확정하지 못했습니다 |
| "데이터 볼륨과 성능 요구가 증가하면 자동 파티셔닝으로 처리량 요구를 충족한다"는 인과 서술 | 파티션이 SSD 기반이고 DynamoDB가 파티션을 자동 관리·추가 할당한다는 것은 확인했습니다. 그러나 교재의 인과 서술을 그대로 뒷받침하는 문서 서술은 찾지 못해, 본문에는 문서가 실제로 기술한 추가 할당 조건만 실었습니다 ([3.2절](#32-파티션과-데이터-분산)) |
| 슬라이드 25의 `put-item` 명령 | 이 명령 자체를 AWS CLI 문서로 조회해 확인하지 않았습니다. 교재 기재 표시와 함께 남겼고, 문서로 확인한 CLI 사용 패턴은 DynamoDB local 문서의 `list-tables` 예제입니다 ([4.5절](#45-aws-cli)) |

---

## 10. 지식 확인 및 핵심 정리

### 지식 확인 문제 (참/거짓)

교재 슬라이드 42–43의 문제와 정답을 그대로 옮깁니다.

**문제 1**: 관계형 데이터베이스에는 고정된 스키마가 없습니다. 다양한 레코드가 다양한 속성을 가집니다.

- ❌ **정답: 거짓** — **비관계형** 데이터베이스에 고정된 스키마가 없습니다. 관계형 데이터베이스는 스키마를 처음에 정의합니다.

**문제 2**: Amazon DynamoDB는 데이터를 행에 저장하고 테이블의 항목을 파티션 키 값에 따라 여러 파티션으로 나눕니다.

- ❌ **정답: 거짓** — DynamoDB는 데이터를 **파티션**에 저장하고, 테이블의 항목을 파티션 키 값에 따라 여러 파티션으로 나눕니다.

**문제 3**: 각 DynamoDB 속성에는 이름, 데이터 형식 및 값이 있습니다. 총 크기가 400KB 미만인 항목은 속성 개수에 제한이 없을 수 있습니다.

- ✅ **정답: 참**

**문제 4**: 읽기 용량 단위(RCU)는 최대 4KB 객체에 대해 초당 강력한 읽기 일관성을 수행할 수 있는 횟수입니다.

- ✅ **정답: 참**

**문제 5**: Amazon DynamoDB를 사용하여 개발하려면 반드시 DynamoDB 웹 서비스에 액세스하여 애플리케이션을 테스트해야 합니다.

- ❌ **정답: 거짓** — 다운로드 가능한 버전(DynamoDB local)으로 DynamoDB 웹 서비스에 액세스하지 않고 개발·테스트할 수 있습니다.

**문제 6**: DynamoDB용 AWS SDK 문서 인터페이스를 사용하면 데이터 형식 설명자를 지정할 필요가 없습니다.

- ✅ **정답: 참** — 데이터 형식이 데이터 자체의 의미 체계에 내포됩니다.

### 🆕 보충 문제 (최신화 내용 확인)

**문제 7**: 새로 만든 DynamoDB 테이블에서 `GetItem` 을 호출하면 기본적으로 강력한 일관성 읽기가 수행됩니다.

- ❌ **정답: 거짓** — **최종 일관성이 모든 읽기 작업의 기본값**입니다. 강력한 일관성이 필요하면 `ConsistentRead` 를 `true` 로 설정합니다. 글로벌 보조 인덱스와 스트림에서는 강력한 일관성 읽기를 쓸 수 없습니다. ([3.9절](#39-읽기-일관성))

> — 출처: [DynamoDB read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)

**문제 8**: 어떤 DynamoDB 테이블이든 파티션 키 값이 같은 항목들의 총 크기는 10GB를 초과할 수 없습니다.

- ❌ **정답: 거짓** — 이 제약은 **로컬 보조 인덱스가 하나 이상 있는 테이블**에만 적용됩니다. LSI가 없으면 DynamoDB가 항목 컬렉션을 여러 파티션에 자동 분할합니다. ([3.11절](#311-로컬-보조-인덱스-예))

> — 출처: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

**문제 9**: 글로벌 보조 인덱스는 테이블을 만든 뒤에도 추가하거나 삭제할 수 있지만, 로컬 보조 인덱스는 테이블 생성 시에만 만들 수 있습니다.

- ✅ **정답: 참** — GSI는 기존 테이블에 추가·삭제할 수 있고, LSI는 테이블 생성 시에만 만들 수 있으며 추가·삭제가 불가능합니다. ([3.13절](#313-lsi와-gsi-비교))

> — 출처: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

**문제 10**: 새로 만든 온디맨드 테이블은 트래픽이 늘어나면 즉시 초당 수백만 요청까지 처리합니다.

- ❌ **정답: 거짓** — 신규 온디맨드 테이블은 **초당 4,000회 쓰기와 12,000회 읽기**까지 지속할 수 있고, 그 뒤에는 **이전 최대 트래픽의 두 배까지 즉시** 수용합니다. 이전 최대치의 두 배를 30분 안에 초과하면 스로틀링이 발생할 수 있습니다. ([3.7절](#37-용량-모드요금-옵션))

> — 출처: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

**문제 11**: 교재 슬라이드 33의 Java 종속성(`com.amazonaws.services.dynamodbv2.*`)을 그대로 사용하면 됩니다.

- ❌ **정답: 거짓** — 이 네임스페이스는 AWS SDK for Java 1.x이고 **2025년 12월 31일 지원이 종료**되었습니다. 2.x의 `software.amazon.awssdk.*` 를 사용하고, 상위 수준은 DynamoDB Enhanced Client를 씁니다. ([6.2절](#62-java-종속성))

> — 출처: [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

**문제 12**: `boto3.client('dynamodb')` 와 `boto3.resource('dynamodb')` 는 같은 인터페이스를 반환합니다.

- ❌ **정답: 거짓** — 서로 **다른 인터페이스**입니다. 리소스 인터페이스에는 신규 기능이 추가되지 않고 최신 서비스 기능은 클라이언트 인터페이스로 제공됩니다. 리소스 인스턴스는 스레드 안전하지 않습니다. ([6.3절](#63-pythonboto3-종속성), [7.2절](#72-python-예제-서비스-클라이언트-생성)) 교재 슬라이드 36의 주석이 이 둘을 혼동시킵니다.

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 핵심 정리

교재 슬라이드 45의 '모듈 요약' 항목입니다. 슬라이드 3의 모듈 목표(4개)와 항목이 다르므로 둘을 함께 둡니다.

| 슬라이드 3 모듈 목표 | 슬라이드 45 모듈 요약 |
|---|---|
| DynamoDB의 주요 구성 요소 설명 | DynamoDB의 주요 구성 요소 설명 |
| DynamoDB에 연결하는 여러 방법 탐색 | DynamoDB에 연결하는 방법 설명 |
| 코드의 SDK 종속성 및 설정 정의 | 코드의 SDK 종속성을 정의 |
| 요청 및 응답 객체 사용 | 요청 객체를 정의하는 방법 설명 / 응답 객체를 읽는 방법 설명 |
| — | 주요 테이블 작업을 수행하는 방법 설명 |
| — | 가장 일반적인 예외에 대한 문제 해결을 나열 |

### 모듈 학습 목표 달성 확인

이 모듈을 완료하면 다음을 수행할 수 있습니다.

- ✅ DynamoDB의 주요 구성 요소 설명 — 테이블·항목·속성, 파티션, 기본 키, 보조 인덱스, 용량 단위
- ✅ DynamoDB에 연결하는 여러 방법 탐색 — 콘솔, NoSQL Workbench, DynamoDB local, PartiQL, AWS CLI, SDK
- ✅ 코드의 SDK 종속성 및 설정 정의 — Java 2.x, Python(boto3), .NET 네임스페이스와 클라이언트 생성
- ✅ 요청 및 응답 객체 사용 — 하위 수준 API의 요청·응답 형식과 오류 3구성 요소
