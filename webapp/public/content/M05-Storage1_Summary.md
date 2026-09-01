# 모듈 5: 스토리지 시작하기

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [AWS 클라우드의 스토리지 유형](#2-aws-클라우드의-스토리지-유형)
3. [Amazon S3 기본 개념](#3-amazon-s3-기본-개념)
4. [데이터 보호와 액세스 제어](#4-데이터-보호와-액세스-제어)
5. [S3 서비스 엔드포인트](#5-s3-서비스-엔드포인트)
6. [AWS CLI로 Amazon S3 사용](#6-aws-cli로-amazon-s3-사용)
7. [AWS SDK로 Amazon S3 사용](#7-aws-sdk로-amazon-s3-사용)
8. [교재 대비 변경 사항](#8-교재-대비-변경-사항)
9. [지식 확인 및 핵심 정리](#9-지식-확인-및-핵심-정리)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [8장](#8-교재-대비-변경-사항)에 정리했습니다.
> - 예시 액세스 키 ID 는 `AKIA####ODNN7EXAMPLE` 처럼 **5~8번째 글자를 `#` 로 가렸습니다.** 자격 증명 스캐너가 실제 키로 오인하는 것을 막기 위한 것이고, AWS 문서의 원래 예시값은 이 자리에 영숫자가 들어갑니다.
> - 검증일: 2026년 8월 25일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- Amazon Simple Storage Service(Amazon S3)의 기본 개념을 설명
- Amazon S3를 사용하여 데이터를 보호하는 옵션을 나열
- 코드의 SDK 종속성을 정의
- Amazon S3 서비스에 연결하는 방법을 설명
- 요청 및 응답 객체를 설명

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 모듈 4 | 권한 부여 시작하기 |
| **모듈 5** | **스토리지 시작하기** — AWS 스토리지 솔루션의 기능 세트 및 사용 사례 비교, Amazon S3 기본 개념 |
| 모듈 6 | 스토리지 작업 처리 — 프로그래밍 방식으로 Amazon S3 사용, 정적 웹 사이트 배포 |
| 실습 2 | Amazon S3를 사용한 솔루션 개발 |

이 모듈은 Amazon S3와 그 기본 구성 요소를 다룹니다. S3 사용 사례를 검토하고, 그 사용 사례에서 개발 중인 애플리케이션이 어떻게 지원되는지 살펴봅니다. 이어서 AWS SDK와 AWS CLI로 S3에서 작업하기 위한 개발 환경 구성 방법을 알아봅니다.

---

## 2. AWS 클라우드의 스토리지 유형

AWS 스토리지 솔루션은 데이터를 저장, 액세스, 관리, 분석하는 서비스 포트폴리오로 구성됩니다.

| 유형 | 데이터 구성 방식 | 액세스 | 대표 서비스 |
|---|---|---|---|
| **블록 스토리지** | 원시 스토리지. 서로 관련 없는 블록의 어레이. 호스트 파일 시스템이 디스크에 데이터를 배치 | 블록 디바이스 | Amazon EBS |
| **파일 스토리지** | 파일 시스템이 데이터 블록을 관리. 네이티브 파일 시스템이 디스크에 데이터를 배치 | 파일 시스템 마운트 | Amazon EFS, Amazon FSx |
| **객체 스토리지** | 데이터, 데이터 속성, 메타데이터, 객체 ID를 캡슐화하는 가상 컨테이너 | API | Amazon S3 |

- 블록 스토리지 비유: 하드 디스크, 스토리지 영역 네트워크(SAN), 스토리지 어레이
- 파일 스토리지 비유: 네트워크 연결 스토리지(NAS) 어플라이언스, Windows 파일 서버
- 객체 스토리지 비유: Ceph, OpenStack Swift

Amazon EBS 볼륨 유형: 범용 SSD, 프로비저닝된 IOPS SSD, 처리량 최적화 HDD, 콜드 HDD

### 2.1 Amazon S3 스토리지 클래스 🔄

객체마다 스토리지 클래스가 연결됩니다. 지정하지 않으면 **S3 Standard**가 적용됩니다. 모든 클래스가 동일한 내구성(99.999999999%)을 목표로 설계되었지만, **가용성과 가용 영역(AZ) 수는 클래스마다 다릅니다.**

| 스토리지 클래스 | 설계 대상 | 가용성(설계 기준) | AZ 수 | 최소 보관 기간 | 최소 과금 크기 |
|---|---|---|---|---|---|
| S3 Standard (`STANDARD`) | 월 1회 이상 액세스, 밀리초 액세스 | 99.99% | ≥3 | 없음 | 없음 |
| S3 Intelligent-Tiering (`INTELLIGENT_TIERING`) | 액세스 패턴이 불명확·가변적인 데이터 | 99.9% | ≥3 | 없음 | 없음 |
| S3 Standard-IA (`STANDARD_IA`) | 장기 보관, 월 1회 액세스, 밀리초 액세스 | 99.9% | ≥3 | 30일 | 128KB |
| S3 One Zone-IA (`ONEZONE_IA`) | 재생성 가능한 저빈도 액세스 데이터 | 99.5% | 1 | 30일 | 128KB |
| 🆕 S3 Express One Zone (`EXPRESS_ONEZONE`) | 지연에 민감한 애플리케이션, 단일 AZ 내 한 자리 밀리초 액세스 | 99.95% | 1 | 없음 | 없음 |
| 🆕 S3 Glacier Instant Retrieval (`GLACIER_IR`) | 분기 1회 액세스 아카이브, 밀리초 액세스 | 99.9% | ≥3 | 90일 | 128KB |
| S3 Glacier Flexible Retrieval (`GLACIER`) | 연 1회 액세스 아카이브, 분~시간 단위 검색 | 99.99% (복원 후) | ≥3 | 90일 | — |
| S3 Glacier Deep Archive (`DEEP_ARCHIVE`) | 연 1회 미만 액세스, 시간 단위 검색 | 99.99% (복원 후) | ≥3 | 180일 | — |

- S3 Express One Zone은 **디렉터리 버킷(directory bucket)** 전용 클래스입니다.
- Reduced Redundancy Storage(`REDUCED_REDUNDANCY`)도 존재하지만 AWS는 **사용을 권장하지 않습니다**. S3 Standard가 더 비용 효율적입니다.
- S3 Standard-IA와 S3 One Zone-IA는 128KB보다 작은 객체에도 128KB로 과금되고, 30일 이전에 삭제·전환하면 남은 기간만큼 비례 과금됩니다.
- S3 Intelligent-Tiering은 128KB 미만 객체를 모니터링하지 않고 항상 Frequent Access 계층에 둡니다.

> — 출처: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

---

## 3. Amazon S3 기본 개념

### 3.1 Amazon S3 개요

Amazon S3는 개발자와 IT 팀에 안전하고 안정적이며 확장 가능한 객체 스토리지를 제공합니다.

| 특성 | 내용 |
|---|---|
| 내구성 | 99.999999999%를 제공하도록 설계 |
| 가용성 | 스토리지 클래스별로 다름 ([2.1절](#21-amazon-s3-스토리지-클래스) 참조) 🔄 |
| 확장성 | 무제한 스토리지, 배치 작업 |
| 성능 | 병렬 요청, 전송 가속화, 멀티파트 업로드, **강력한 읽기 후 쓰기 일관성** 🔄 |
| 관리 용이성 | REST API, AWS SDK, 접두사(prefix)/태그, 이벤트 알림, 스토리지 클래스, 수명 주기 관리 |
| 보안 | 퍼블릭 액세스 차단, **기본 암호화(SSE-S3 자동 적용)** 🔄, 세분화된 제어, 규정 준수, 저장 시·전송 중 보호 |

사용 사례: 콘텐츠 저장 및 배포, 정적 웹 사이트 호스팅, 백업 및 아카이빙, 빅 데이터 분석, 재해 복구

### 3.2 데이터 일관성 모델 🔄

교재는 성능 항목에 "생성 후 읽기의 일관성"으로만 표기하지만, 현재 Amazon S3의 보장 수준은 더 강합니다.

| 대상 | 일관성 |
|---|---|
| 객체 PUT (신규 생성 및 덮어쓰기), DELETE | **강력한 읽기 후 쓰기 일관성** (모든 AWS 리전) |
| S3 Select, ACL, 객체 태그, 객체 메타데이터(HEAD) 읽기 | 강력한 일관성 |
| 단일 키에 대한 업데이트 | 원자적. 동시 PUT/GET 시 이전 데이터 또는 새 데이터만 반환되고 부분·손상 데이터는 반환되지 않음 |
| 버킷 구성(bucket configuration) | **최종 일관성** |

강력한 일관성이 의미하는 것:

- 새 객체를 쓴 직후 버킷 키를 나열하면 그 객체가 목록에 나타납니다.
- 기존 객체를 교체한 직후 읽으면 새 데이터가 반환됩니다.
- 객체를 삭제한 직후 읽으면 데이터가 반환되지 않고, 나열해도 목록에 없습니다.

주의할 점:

- S3는 **동시 쓰기에 대한 객체 잠금을 지원하지 않습니다.** 동일 키에 PUT이 동시에 들어오면 타임스탬프가 가장 늦은 요청이 이깁니다(last-writer-wins). 이것이 문제가 되면 애플리케이션에 잠금 메커니즘을 직접 구현해야 합니다. 또는 [3.8절 조건부 요청](#38-조건부-요청)을 사용합니다.
- 업데이트는 키 단위입니다. 여러 키에 걸친 원자적 업데이트는 불가능합니다.
- 버킷을 삭제한 직후 전체 버킷을 나열하면 삭제된 버킷이 아직 보일 수 있습니다.
- 버전 관리를 처음 활성화한 경우 전파에 시간이 걸립니다. AWS는 활성화 후 **15분** 대기한 뒤 객체 쓰기 작업을 하도록 권장합니다.

> — 출처: [Amazon S3 data consistency model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 3.3 Amazon S3 구성 요소

#### 객체 요소

| 요소 | 설명 |
|---|---|
| 키(Key) | 경로와 파일 이름의 조합 같은 고유 식별자. 객체를 참조하는 방법 |
| 데이터(Data) | 저장된 파일. 텍스트, 동영상, 이미지, 바이너리 등 모든 형식 |
| 메타데이터(Metadata) | 생성 날짜·버전 ID·크기 등 시스템 메타데이터 또는 사용자 정의 메타데이터 |

#### S3 버킷

- 리전 리소스이지만 이름은 전역 네임스페이스에서 관리됩니다.
- 데이터 저장을 위한 **플랫 구조** (디렉터리 계층이 없음)
- 객체를 고유한 키 값으로 저장
- 버킷을 만든 후에는 **이름과 리전을 변경할 수 없습니다.**

버킷에서 웹 사이트를 호스트할 때는 버킷 이름을 도메인 이름과 동일하게 지정하는 것이 좋습니다. 그러면 도메인 공급자(예: Amazon Route 53)의 DNS 확인으로 별칭을 실제 버킷 이름에 매핑할 수 있습니다.

#### 버킷 이름의 고유성 범위 🔄

교재는 "Amazon S3 전체에서 고유"라고 기재하지만, 정확히는 **파티션 단위**입니다. 버킷 이름은 한 파티션 내 모든 AWS 계정의 모든 리전에서 고유해야 합니다. AWS 파티션은 현재 4개입니다.

| 파티션 | 대상 |
|---|---|
| `aws` | 표준 리전 |
| `aws-cn` | 중국 리전 |
| `aws-us-gov` | AWS GovCloud (US) |
| 🆕 `aws-eusc` | European Sovereign Cloud |

전역 네임스페이스에서 버킷을 삭제하면 그 이름이 다시 사용 가능해질 수 있습니다. 이때 같은 파티션의 **다른 AWS 계정이 같은 이름으로 버킷을 만들어 삭제된 버킷을 향한 요청을 받을 수 있습니다.** 이를 막으려면 버킷을 삭제하지 말고 객체만 비운 뒤 유지하는 것이 좋습니다.

#### 🆕 계정 리전 네임스페이스 (account regional namespace)

전역 네임스페이스의 예약된 하위 구획으로, **해당 계정만** 이 네임스페이스에 범용 버킷을 만들 수 있습니다. 버킷 이름 소유권을 계정에 고정하고 싶을 때 사용하며, AWS는 이 네임스페이스 사용을 권장합니다.

- 이름은 `-an` 접미사로 끝납니다. 예: `amzn-s3-demo-bucket-012345678910-us-west-2-an`
- REST API에서는 `x-amz-bucket-namespace: account-regional` 헤더로 지정합니다.

> — 출처: [Namespaces for general purpose buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html), [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

#### 버킷 명명 규칙 🔄

교재는 "소문자, 숫자, 하이픈(-)만"이라고 기재하지만 **마침표(.)도 허용됩니다.** 현재 범용 버킷 규칙 전체는 다음과 같습니다.

- 3자 이상 63자 이하
- 소문자, 숫자, 마침표(`.`), 하이픈(`-`)만 사용
- 문자 또는 숫자로 시작하고 끝나야 함
- 인접한 두 마침표(`..`) 금지
- IP 주소 형식(예: `192.168.5.4`) 금지
- 금지 접두사: `xn--`, `sthree-`, `amzn-s3-demo-`
- 예약 접미사: `-s3alias`(액세스 포인트 별칭), `--ol-s3`(Object Lambda 액세스 포인트), `.mrap`(다중 리전 액세스 포인트), `--x-s3`(디렉터리 버킷), `--table-s3`(S3 Tables 버킷), `-an`(계정 리전 네임스페이스)
- Transfer Acceleration을 사용하는 버킷은 이름에 마침표를 쓸 수 없음
- 버킷 이름에 민감한 정보를 넣지 말 것 (객체를 가리키는 URL에 노출됨)

실무 권장: 마침표가 허용되더라도 **피하는 것이 좋습니다.** SSL 와일드카드 인증서가 마침표를 포함한 버킷 이름과 매칭되지 않아 HTTPS 액세스 시 인증 오류가 발생할 수 있고, Transfer Acceleration에서도 쓸 수 없습니다.

> — 출처: [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)

#### 가상 호스팅 스타일 URL 구조

```text
https://notes-bucket.s3.us-west-2.amazonaws.com/awsservice/notes.txt
        └─────┬─────┘                          └────┬────┘ └───┬───┘
         S3 버킷 이름                            접두사      이름
                                                └───────┬───────┘
                                                      키(Key)
```

### 3.4 접두사와 구분 기호로 객체 구성하기

S3 버킷은 객체 스토리지이므로 디렉터리 구조가 없습니다. 논리적 구조가 필요하면 접두사(prefix)와 구분자(delimiter)를 사용합니다.

- **접두사**는 디렉터리 이름과 유사합니다. 접두사를 기준으로 객체를 그룹화합니다.
- **구분자**는 `/` 또는 `_` 같은 문자열로, 객체 계층을 탐색할 때 추가 제어를 제공합니다.

접두사와 구분자로 키를 구성하면 특정 기준에 맞는 키 하위 집합만 조회할 수 있습니다. 애플리케이션이 데이터를 분류·인덱싱하는 메커니즘이며, 보안 설정을 세밀하게 조정할 때도 사용됩니다.

#### 예시: 버킷 `notes-bucket`

저장된 전체 키:

```text
dev/awsservice/dynamodb/notes.txt
dev/awsservice/polly/sam.mp3
dev/awsservice/polly/john.mp3
dev/awsservice/summary.txt
readMe.txt
```

| 조회 조건 | 반환 결과 |
|---|---|
| 접두사 `dev/` | `dev/awsservice/summary.txt`<br>`dev/awsservice/dynamodb/notes.txt`<br>`dev/awsservice/polly/sam.mp3`<br>`dev/awsservice/polly/john.mp3` |
| 접두사 `dev/awsservice/` + 구분자 `/` | `dev/awsservice/summary.txt`<br>`dev/awsservice/dynamodb/` (공통 접두사)<br>`dev/awsservice/polly/` (공통 접두사) |

두 번째 경우 `dev/awsservice/summary.txt`가 키로 반환되는 이유는, 이 키가 접두사 `dev/awsservice/`를 포함하면서 그 뒤에 구분자 `/`를 더 포함하지 않기 때문입니다. 나머지는 공통 접두사(common prefix) 목록으로 묶여 표시됩니다.

> — 출처: [Organizing objects using prefixes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-prefixes.html)

### 3.5 Amazon S3 이벤트 알림 🔄

S3 버킷에서 특정 이벤트가 발생할 때 알림을 받을 수 있습니다. 게시 대상은 다음과 같습니다.

| 대상 | 동작 |
|---|---|
| Amazon SNS 주제 | 메시지 게시 |
| Amazon SQS 대기열 | 메시지 게시 |
| AWS Lambda 함수 | 함수 호출 |
| Amazon EventBridge | 이벤트 버스로 전송 |

교재는 이벤트 유형을 4종(객체 생성·제거·복원·복제)으로 소개하지만, SQS·SNS·Lambda 대상으로 게시할 수 있는 유형은 더 많습니다.

| 이벤트 유형 | 설명 |
|---|---|
| `s3:TestEvent` | 알림을 활성화할 때 게시되는 테스트 알림. 대상이 존재하고 버킷 소유자에게 게시 권한이 있는지 확인 |
| `s3:ObjectCreated:*`<br>`:Put` `:Post` `:Copy` `:CompleteMultipartUpload` | 객체 생성. 특정 API로 생성된 경우만 알림받거나 `*`로 전체를 받을 수 있음 |
| `s3:ObjectRemoved:*`<br>`:Delete` `:DeleteMarkerCreated` | 객체 제거. 삭제 또는 버전 객체의 영구 삭제(`:Delete`), 삭제 마커 생성(`:DeleteMarkerCreated`) |
| `s3:ObjectRestore:*`<br>`:Post` `:Completed` `:Delete` | Glacier 계열·Intelligent-Tiering 아카이브 계층에서 복원 시작·완료, 복원본 만료 |
| `s3:ReducedRedundancyLostObject` | RRS 클래스 객체 손실 감지 |
| `s3:Replication:*` (4종) | 복제 실패, S3 RTC 15분 임계값 초과·초과 후 복제, 복제 메트릭 추적 중단 |
| 🆕 `s3:LifecycleExpiration:*`<br>`:Delete` `:DeleteMarkerCreated` | 수명 주기 구성에 의한 객체 삭제 |
| 🆕 `s3:LifecycleTransition` | 수명 주기 구성에 의한 스토리지 클래스 전환 |
| 🆕 `s3:IntelligentTiering` | Intelligent-Tiering 객체가 Archive Access 또는 Deep Archive Access 계층으로 이동 |
| 🆕 `s3:ObjectTagging:*`<br>`:Put` `:Delete` | 객체 태그 추가·갱신·삭제 |
| 🆕 `s3:ObjectAnnotation:*`<br>`:Put` `:Delete` | 객체 주석(annotation) 생성·갱신·삭제 |
| 🆕 `s3:ObjectAcl:Put` | 객체 ACL이 PUT되거나 기존 ACL이 변경됨 (변경이 없으면 이벤트가 생성되지 않음) |

주의: `ObjectRemoved` 이벤트는 **수명 주기 구성에 의한 자동 삭제나 실패한 작업에 대해서는 알림을 보내지 않습니다.** 수명 주기 삭제를 감지해야 하면 `s3:LifecycleExpiration:*`을 사용합니다.

> — 출처: [Supported event types for SQS, SNS, and Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html)

### 3.6 객체 태그

태그는 AWS 리소스에 메타데이터로 연결되는 키-값 페어입니다. 객체 수명 동안 언제든 생성, 업데이트, 삭제, 복사, 교체할 수 있습니다.

| 사용 사례 | 설명 |
|---|---|
| 객체 그룹화 | 비즈니스·규정 준수·프로젝트 식별자로 리소스에 태깅 |
| 비용 할당 | 비용 센터별 태그를 사용하고 AWS 태그 기반 보고서로 실제 비용 확인 |
| 자동화 | 백업·복제 같은 자동화 절차 대상 표시 |
| 액세스 제어 | 태그를 조건으로 액세스 제한 |
| 운영 지원/모니터링 | 주요 시스템 식별 |

🆕 버킷 자체에도 생성 시점에 태그를 지정할 수 있습니다. 범용 버킷은 `s3:TagResource` 권한이 필요하고, 태그 기반 조건(`aws:ResourceTag`, `s3:BucketTag`)은 해당 버킷에서 ABAC를 활성화한 뒤에만 적용됩니다.

> — 출처: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html), [AWS 태깅 모범 사례](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-best-practices.html)

### 3.7 기본 암호화 🔄

교재는 보안 특성에 "기본 암호화"만 나열하지만, 현재는 **자동으로 적용됩니다.**

- Amazon S3는 모든 버킷에 SSE-S3(Amazon S3 관리형 키를 사용한 서버 측 암호화)를 기본 암호화 수준으로 적용합니다.
- **2023년 1월 5일부터** S3에 업로드되는 모든 신규 객체가 추가 비용 없이, 성능 영향 없이 자동 암호화됩니다.
- 알고리즘은 256비트 AES(AES-256)입니다.
- 모든 신규 버킷과, 기본 암호화가 구성되지 않은 기존 버킷에 자동 적용됩니다.
- 이미 SSE-S3 또는 SSE-KMS를 구성한 기존 버킷의 설정은 변경되지 않습니다.
- **주의**: 기존 미암호화 버킷에 이미 들어 있던 객체는 자동으로 암호화되지 않습니다.

암호화 상태는 CloudTrail 로그(`"SSEApplied":"Default_SSE_S3"`), S3 Inventory, S3 Storage Lens, S3 콘솔, AWS CLI·SDK의 응답 헤더로 확인할 수 있습니다.

> — 출처: [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)

### 3.8 🆕 조건부 요청

S3 작업에 전제 조건(precondition)을 붙여, 조건이 충족되지 않으면 작업을 실패시킬 수 있습니다. [3.2절](#32-데이터-일관성-모델)의 last-writer-wins 문제를 애플리케이션 코드 없이 다루는 방법입니다.

| 구분 | 대상 API | 용도 |
|---|---|---|
| 조건부 읽기 | `GET`, `HEAD`, `COPY` | ETag 또는 마지막 수정 날짜를 기준으로 반환·복사. 지정 날짜 이후 갱신된 객체만, 또는 특정 ETag(특정 버전)만 대상으로 제한 |
| 조건부 쓰기 | `PutObject`, `CompleteMultipartUpload`, `CopyObject` | 같은 키의 기존 객체가 없을 때만 쓰기(덮어쓰기 방지). 또는 객체 ETag가 변경되지 않았을 때만 갱신(의도치 않은 덮어쓰기 방지) |
| 조건부 삭제 | `DeleteObject`, `DeleteObjects` | 객체가 존재하는지, 변경되지 않았는지 확인한 뒤 삭제. 범용 버킷과 디렉터리 버킷 모두 지원 |

조건부 읽기·쓰기·삭제에 **추가 요금은 없습니다.** 기존 요청 요율만 적용되며 실패한 요청도 동일하게 과금됩니다.

> — 출처: [Add preconditions to S3 operations with conditional requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html)

---

## 4. 데이터 보호와 액세스 제어

### 4.1 객체 버전 관리

- 객체의 버전 ID는 시스템 정의 메타데이터의 일부입니다.
- **기본값으로 버전 관리는 비활성화**되어 있습니다.
- 버전 관리가 비활성화된 버킷의 객체는 버전 ID가 `null`입니다.
- 버전 관리가 활성화되면 객체의 버전별로 고유한 버전 ID가 부여됩니다.
- 버전 ID 예시: `3/L4kqtJlcpXroDTDmJ+rmSpXd3dIbrHY+MTRCxf3vjVBH40Nr8X8gdRQBpUMLUo`
- 데이터가 변경·덮어쓰기·삭제되지 않게 하려면 **S3 객체 잠금(Object Lock)** 을 구성합니다.

버전 관리를 처음 활성화한 뒤에는 전파에 시간이 걸리므로, AWS는 15분 대기 후 객체 쓰기 작업을 권장합니다([3.2절](#32-데이터-일관성-모델)).

### 4.2 객체 버전 삭제

| 요청 | 동작 |
|---|---|
| `DELETE` | 버킷에 **삭제 마커(delete marker)** 를 삽입하고 이를 객체의 현재 버전으로 설정. 이전 버전은 남아 있음 |
| `DELETE Object versionId` | 특정 객체 버전을 **영구 삭제** |

```http
DELETE /photo.gif?versionId=121212 HTTP/1.1
Host: bucket.s3.amazonaws.com
Date: Wed, 26 Oct 2021 17:50:00 GMT
Authorization: AWS AKIA####ODNN7EXAMPLE:xQE0diMbLRepdf3YB+FIEXAMPLE=
Content-Type: text/plain
Content-Length: 0
```

### 4.3 액세스 제어

기본값으로 S3 버킷 설정은 버킷과 객체에 대한 퍼블릭 액세스를 차단합니다. 즉 리소스 소유자만 액세스할 수 있습니다. **퍼블릭 액세스 차단 설정은 버킷 정책과 객체 권한을 재정의합니다.**

S3는 자격 증명 기반과 리소스 기반 액세스 제어를 모두 지원합니다.

| 메커니즘 | 유형 | 연결 대상 | 설명 |
|---|---|---|---|
| IAM 정책 | 자격 증명 기반 | IAM 사용자·그룹·역할 | 자격 증명이 버킷·객체에 대해 갖는 권한 정의 |
| 버킷 정책 | 리소스 기반 | S3 버킷 (버킷당 1개) | 버킷과 콘텐츠에 대한 액세스 지정. 계정 간 액세스 부여, 조건 기반 허용·거부 |
| ACL | 리소스 기반 (레거시) | S3 버킷 또는 객체 | AWS 계정·그룹에 부여된 액세스 유형 정의. **신규 버킷에서 기본 비활성화** 🔄 |

권장: **IAM 정책과 S3 버킷 정책**으로 액세스 제어를 관리합니다.

### 4.4 S3 Object Ownership과 ACL 기본 비활성화 🔄

교재는 ACL을 "레거시"로만 표기하지만, 현재는 기본 설정 자체가 ACL을 끕니다.

S3 Object Ownership은 **버킷 수준 설정**으로, 업로드된 객체의 소유권을 제어하고 ACL을 활성화·비활성화합니다.

| 설정 | ACL | 적용 대상 | 객체 소유권 |
|---|---|---|---|
| **버킷 소유자 적용 (Bucket owner enforced) — 기본값** | 비활성화 | 모든 신규·기존 객체 | 버킷 소유자가 모든 객체를 소유하고 완전한 제어권을 가짐. 액세스는 정책으로만 평가 |
| 버킷 소유자 선호 (Bucket owner preferred) | 활성화 | — | 다른 계정이 `bucket-owner-full-control` canned ACL로 쓴 신규 객체를 버킷 소유자가 소유 |
| 객체 작성자 (Object writer) | 활성화 | — | 객체를 업로드한 AWS 계정이 소유하고 ACL로 다른 사용자에게 액세스 부여 가능 |

ACL을 비활성화한 뒤의 동작:

- ACL 설정·업데이트 요청은 **실패**합니다. ACL 읽기 요청은 지원됩니다.
- ACL을 지정하지 않은 `PUT`, 또는 `bucket-owner-full-control` canned ACL을 지정한 `PUT`만 허용됩니다.
- 그 외 ACL(예: 특정 계정에 대한 커스텀 권한 부여)을 포함한 `PUT`은 **HTTP 400 `AccessControlListNotSupported`** 오류로 실패합니다.
- 기존 버킷은 ACL을 비활성화한 뒤에도 언제든 다시 활성화할 수 있고, 기존 ACL이 복원됩니다.

AWS 권장: **개별 객체 단위로 액세스를 제어해야 하는 경우를 제외하면 ACL을 비활성화 상태로 유지합니다.** 대부분의 최신 S3 사용 사례는 ACL을 필요로 하지 않습니다.

> — 출처: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

### 4.5 예제: S3 버킷 정책

익명 사용자에게 읽기 전용 권한을 부여하는 버킷 정책입니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::notes-bucket/*",
      "Principal": "*"
    }
  ]
}
```

> **주의**: 이 정책은 버킷 콘텐츠를 인터넷에 공개합니다. 실제 적용 시에는 퍼블릭 액세스 차단 설정과의 관계를 반드시 확인하세요. 정적 웹 사이트 호스팅에는 버킷을 공개하는 대신 CloudFront + OAC(Origin Access Control) 또는 AWS Amplify Hosting을 사용하는 편이 안전합니다([5.3절](#53-웹-사이트-엔드포인트) 참조).

버킷 정책의 주요 요소:

| 요소 | 설명 |
|---|---|
| `Version` | 정책이 준수하는 IAM 정책 언어 버전. 변경하면 정책 동작이 깨질 수 있으므로 `2012-10-17`을 유지 |
| `Resource` | 권한을 허용·거부할 리소스의 ARN |
| `Action` | 각 리소스에서 허용·거부되는 작업 |
| `Effect` | `Allow` 또는 `Deny` |
| `Condition` | (선택) 참이어야 정책이 적용되는 조건 |
| `Principal` | 정책이 적용되는 대상 |

정책을 버킷에 추가해 다른 AWS 계정이나 IAM 사용자에게 버킷과 그 객체에 대한 액세스를 부여할 수 있습니다. 객체 권한은 해당 버킷 소유자가 생성하는 객체에만 적용됩니다.

### 4.6 Amazon S3 액세스 포인트 🔄

Amazon S3 액세스 포인트는 데이터 소스에 **연결(attached)되는** 명명된 네트워크 엔드포인트입니다.

> 교재 강사 노트 첫 문단에는 "버킷에 연결되지 않습니다"라는 서술이 있지만, 같은 노트 뒷부분과 지식 확인 6번 정답(참)은 연결된다고 기재해 자체 모순입니다. 공식 문서 기준으로 **연결됩니다.**

🆕 연결 대상이 버킷에 한정되지 않고 확장되었습니다.

| 연결 대상 |
|---|
| Amazon S3 버킷 |
| Amazon FSx for NetApp ONTAP 볼륨 |
| Amazon FSx for OpenZFS 볼륨 |
| AWS Backup의 Amazon S3 복구 지점(특정 시점의 버킷 콘텐츠) |

동작 방식:

- 각 액세스 포인트는 고유한 권한과 네트워크 제어를 가지며, S3가 그 액세스 포인트를 통한 모든 요청에 적용합니다.
- 액세스 포인트 정책은 리소스·사용자·기타 조건으로 사용을 제어합니다. 버킷에 연결된 경우 **기본 버킷 정책과 함께 동작합니다.**
- VPC에서 오는 요청만 허용하도록 구성해 데이터 액세스를 프라이빗 네트워크로 제한할 수 있습니다.
- 액세스 포인트별로 퍼블릭 액세스 차단 설정을 따로 구성할 수 있습니다.

🆕 제약: 액세스 포인트로는 `GetObject`, `PutObject` 같은 **객체 작업만** 수행할 수 있습니다. 버킷 삭제나 S3 복제 구성 같은 다른 S3 작업에는 사용할 수 없습니다.

| 사용 사례 | 설명 |
|---|---|
| 분산형 팀 | 각 그룹이 맞춤 권한을 가진 자체 액세스 포인트를 보유 |
| 데이터 레이크 | 데이터 레이크에 접근하는 팀별 세분화된 제어 |
| 교차 계정 데이터 교환 | 외부 사용자나 다른 계정 사용자에게 객체 액세스 부여 |
| 중앙 집중식 제어 | 액세스 포인트가 많아도 단일 정책 집합으로 스토리지 관리 |

구성 예시:

| 액세스 포인트 | 접근 가능 데이터 |
|---|---|
| `support` | `/support/object1`, `/support/object2`, … |
| `developers` | `/developers/object1`, `/developers/object2`, … |
| `qa` | `/qa/object1`, `/qa/object2`, … |

> — 출처: [Managing access to shared datasets with access points](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html)

---

## 5. S3 서비스 엔드포인트

서비스 엔드포인트는 AWS 서비스에 대한 진입점 URL입니다. 프로그래밍 방식으로 S3에 연결할 때 사용합니다.

### 5.1 가상 호스팅 스타일 URL (권장)

```text
https://bucket-name.s3.region-code.amazonaws.com/key-name
```

예: `https://amzn-s3-demo-bucket1.s3.us-west-2.amazonaws.com/puppy.png`

버킷 이름이 도메인 이름의 일부가 됩니다. 버킷 이름을 등록된 도메인 이름으로 지정하고 DNS 별칭을 만들면 `http://my.bucket-name.com/` 같은 형태로 URL을 완전히 커스터마이징할 수 있습니다. 버킷의 "루트 디렉터리"에 게시할 수도 있어서, `favicon.ico`, `robots.txt`, `crossdomain.xml`처럼 표준 위치를 찾는 애플리케이션과 호환됩니다.

> **주의**: SSL과 함께 사용할 때 SSL 와일드카드 인증서는 **마침표(.)를 포함하지 않는 버킷 이름만** 매칭합니다.

### 5.2 경로 스타일 URL 🔄

```text
https://s3.region-code.amazonaws.com/bucket-name/key-name
```

현재 모든 AWS 리전에서 계속 동작하지만 **향후 중단될 예정입니다.** 2020년 9월 23일 업데이트로 폐기 시점이 연기되었습니다.

브라우저에서 접근하는 웹사이트 콘텐츠를 호스팅할 때는 경로 스타일 URL이 브라우저 동일 출처 보안 모델과 충돌할 수 있으므로 사용을 피하고, S3 웹사이트 엔드포인트나 CloudFront 배포를 사용하도록 권장됩니다.

교재의 `~/.aws/config` 예시에는 `addressing_style = path`가 포함되어 있습니다. 신규 코드에서는 SDK 기본값(가상 호스팅 스타일)을 사용하세요.

> — 출처: [Virtual hosting of general purpose buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

### 5.3 웹 사이트 엔드포인트 🔄

버킷을 정적 웹 사이트로 구성하면 리전별 웹사이트 엔드포인트에서 사이트를 제공합니다. 이 엔드포인트는 **REST API 요청을 보내는 엔드포인트와 다릅니다.**

교재는 하이픈 형식만 기재하지만 리전에 따라 두 형식 중 하나를 따릅니다.

| 형식 | 표기 |
|---|---|
| 하이픈(-) 리전 | `http://bucket-name.s3-website-Region.amazonaws.com` |
| 마침표(.) 리전 | `http://bucket-name.s3-website.Region.amazonaws.com` |

🆕 중요한 제약:

- S3 웹사이트 엔드포인트는 **HTTPS를 지원하지 않고 액세스 포인트도 지원하지 않습니다.** HTTPS가 필요하면 다음을 사용합니다.
  - (권장) **AWS Amplify Hosting** — S3에 저장한 정적 콘텐츠를 CloudFront 기반 CDN에 배포하고 공개 HTTPS URL을 생성하는 완전 관리형 서비스
  - **Amazon CloudFront** — S3에 호스팅된 정적 웹 사이트를 제공. 커스텀 도메인 HTTPS는 Route 53과 함께 구성
- 웹사이트를 공개하려면 콘텐츠를 퍼블릭으로 읽을 수 있게 해야 합니다.
- **Requester Pays 버킷은 웹사이트 엔드포인트로 접근할 수 없고 403 Access Denied를 반환합니다.**
- 보안을 위해 S3 웹사이트 엔드포인트 도메인은 [Public Suffix List](https://publicsuffix.org/)에 등록되어 있습니다. 민감한 쿠키를 설정해야 한다면 `__Host-` 접두사 쿠키를 사용해 CSRF를 방어하는 것이 좋습니다.

> — 출처: [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)

### 5.4 추가 엔드포인트 형식 (교재 기재)

| 유형 | 표기법 |
|---|---|
| S3 이중 스택 엔드포인트 (IPv4·IPv6 지원) | `https://bucket-name.s3.dualstack.Region.amazonaws.com` |
| S3 액세스 포인트 | `https://AccessPointName-AccountId.s3-accesspoint.Region.amazonaws.com` |

AWS SDK와 AWS CLI는 선택한 서비스와 지정된 리전을 기준으로 기본 엔드포인트를 자동으로 결정합니다. Amazon VPC 내 엔드포인트처럼 대체 엔드포인트를 지정할 수도 있습니다.

일부 도구는 버킷 접근에 다른 구문을 사용합니다. 예: `s3://bucket-name/key`

---

## 6. AWS CLI로 Amazon S3 사용

AWS CLI에는 S3용 명령 집합이 두 개 있습니다.

| 구분 | 상위 수준 (`aws s3`) | 하위 수준 (`aws s3api`) |
|---|---|---|
| 성격 | 사용자 친화적 인터페이스 | S3 API와 일대일 매핑 |
| 특징 | 일반적인 작업을 단순화, 직관적 명령 구조. 기본 API 호출을 추상화하고 편리한 기본값 제공 | API 파라미터를 낮은 수준에서 세밀하게 제어 |
| 트레이드오프 | 내부적으로 여러 `s3api` 호출이 발생할 수 있음. 더 빠르지만 제어 항목이 적음 | 특정 API 호출을 정확히 수행. 고급 사용 사례에 유연 |
| 명령 예 | `cp`, `sync`, `ls`, `mb` | `copy-object`, `create-multipart-upload`, `complete-multipart-upload`, `abort-multipart-upload`, `list-buckets`, `get-bucket-location` |

두 집합은 서로 바꾸어 쓸 수 있습니다. 로컬에서 S3로 여러 파일을 업로드하려면 `aws s3 cp` 또는 `aws s3 sync`를 사용하는 편이 좋습니다. 대용량 파일 복사와 디렉터리 동기화를 처리해 줍니다.

### 예시: 터미널 세션

```console
$ aws configure get region
us-east-2

$ aws s3 ls
2021-04-20 10:41:08 notes-bucket

$ aws s3 mb s3://lab-bucket --region us-west-1
make_bucket: lab-bucket

$ aws s3api list-buckets --query 'Buckets[].Name'
[
    "lab-bucket",
    "notes-bucket"
]

$ aws s3api get-bucket-location --bucket lab-bucket
{  "LocationConstraint": "us-west-1"  }

$ aws s3api get-bucket-location --bucket notes-bucket
{  "LocationConstraint": null  }
```

이 예제가 보여주는 흐름:

1. 리전 설정 확인 — `us-east-2`
2. 버킷 전체 나열 — 버킷 하나
3. `us-west-1`에 버킷 생성
4. `s3api`로 이름만 추출해 나열 — 출력 형식은 구성에 지정된 형식(json, yaml, text)
5. 버킷별 위치 조회

버킷을 만들 때 리전을 지정하지 않으면 기본 리전에 생성됩니다. **`LocationConstraint`를 지정하지 않으면 버킷은 US East(N. Virginia) 리전(`us-east-1`)에 생성됩니다.** 위 출력에서 `notes-bucket`의 `LocationConstraint`가 `null`인 것은 교재가 이를 `us-east-1`로 설명하는 근거입니다.

> — 출처: [CreateBucket API – LocationConstraint](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

---

## 7. AWS SDK로 Amazon S3 사용

AWS SDK로 S3에서 작업하는 5단계입니다.

1. SDK에 대한 S3 설정을 구성합니다.
2. 종속성을 정의합니다.
3. S3 클라이언트(서비스 참조)를 생성해 서비스 요청을 수행합니다.
4. 작업을 수행합니다.
5. S3 클라이언트 연결을 닫습니다.

> 용어: AWS 설명서에서 S3 서비스 참조는 일반적으로 **서비스 클라이언트**라고 합니다.

### 7.1 1단계: 서비스 구성

SDK와 CLI가 엔드포인트를 해석하고 API와 상호 작용하려면 두 종류의 정보가 필요합니다.

| 구분 | 포함 내용 |
|---|---|
| 구성 세부 정보 | 사용된 API 버전, 요청의 기본 리전, 응답 형식, 서비스별 설정 |
| 보안 인증 정보 | 요청 서명에 사용되는 액세스 키·비밀 키 등 민감 정보 |

#### 자격 증명 공급자 체인 🔄

교재는 4단계(작업별 파라미터 → 환경 변수 → 공유 자격 증명 파일 → 구성 파일)로 제시하지만, 이는 **설정 값을 지정하는 방법의 우선순위**에 가깝습니다. 실제 자격 증명 공급자 체인은 더 넓습니다.

모든 SDK는 유효한 자격 증명을 찾기 위해 정해진 순서로 소스를 확인하고, 찾으면 탐색을 멈춥니다. 체인은 SDK마다 다르지만 일반적으로 다음을 포함합니다.

| 공급자 | 설명 |
|---|---|
| AWS 액세스 키 | IAM 사용자의 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| 웹 자격 증명·OpenID Connect 페더레이션 | 외부 IdP로 로그인하고 STS의 JWT로 IAM 역할 수임 |
| 로그인 자격 증명 공급자 | 로그인한 콘솔 세션의 자격 증명 사용 |
| 🆕 IAM Identity Center 자격 증명 공급자 | AWS IAM Identity Center에서 자격 증명 획득 |
| 역할 수임 자격 증명 공급자 | IAM 역할의 임시 자격 증명을 받아 사용 |
| 🆕 컨테이너 자격 증명 공급자 | Amazon ECS·Amazon EKS의 컨테이너 애플리케이션용 자격 증명 |
| 프로세스 자격 증명 공급자 | 외부 소스·프로세스에서 자격 증명 획득 (IAM Roles Anywhere 포함) |
| 🆕 IMDS 자격 증명 공급자 | Amazon EC2 인스턴스 프로파일. 인스턴스 메타데이터 서비스로 임시 자격 증명 전달 |

설정 값을 지정하는 방법의 우선순위: **코드에서 지정한 값이 항상 우선**하고, 그 밖에 환경 변수와 공유 `config`·`credentials` 파일이 있습니다.

표준화된 자격 증명 공급자를 사용하면 **SDK가 만료 시 자격 증명을 자동으로 갱신합니다.** 추가 코드는 필요하지 않습니다.

교재 기재 환경 변수:

- 보안 인증: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (권장)
- 리전: `AWS_REGION`

> 실무 권장: 장기 액세스 키 대신 IAM Identity Center(로컬 개발) 또는 IAM 역할(EC2·ECS·EKS·Lambda)을 사용하세요. 액세스 키를 코드나 환경 변수에 두는 방식은 유출 위험이 있습니다.

> — 출처: [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html)

#### 파일 위치

| 파일 | Linux · macOS · Unix | Windows |
|---|---|---|
| 보안 인증 (민감 정보) | `~/.aws/credentials` | `C:\Users\USERNAME\.aws\credentials` |
| 구성 (리전 등 프로파일 설정) | `~/.aws/config` | `C:\Users\USERNAME\.aws\config` |

#### 예시: `~/.aws/config`

```ini
[default]
region = us-east-2
output = json

[profile Beta]
region = us-west-2
output = json
s3 =
    max_concurrent_requests = 20
    max_queue_size = 10000
    multipart_threshold = 64MB
    multipart_chunksize = 16MB
    max_bandwidth = 50MB/s
```

객체 수가 많으면 스레드 수(`max_concurrent_requests`)나 청크 크기(`multipart_chunksize`)를 늘려 복사 속도를 높일 수 있습니다.

> 🔄 교재 예시에는 `addressing_style = path`가 포함되어 있으나 [5.2절](#52-경로-스타일-url)의 이유로 제외했습니다. SDK 기본값인 가상 호스팅 스타일을 사용하세요.

### 7.2 2단계: 종속성 정의

각 AWS 서비스에는 API의 각 작업에 대응하는 메서드를 가진 서비스 인터페이스가 있습니다.

- Python: 모든 서비스를 다루는 Boto3를 가져옵니다.
- Java·.NET: 애플리케이션에 필요한 특정 서비스 패키지만 가져옵니다 (종속성 오버로드 방지).

#### Java 패키지 (AWS SDK for Java 2.x)

| 패키지 | 용도 |
|---|---|
| `software.amazon.awssdk.services.s3` | S3 클라이언트 생성, 버킷·객체 작업 API |
| `software.amazon.awssdk.services.s3.model` | 요청 생성·응답 처리용 클래스 |
| `software.amazon.awssdk.services.s3.S3Client` | 동기 S3 클라이언트 |
| `software.amazon.awssdk.services.s3.S3AsyncClient` | 비동기 S3 클라이언트 |

#### .NET 네임스페이스

| 네임스페이스 | 용도 |
|---|---|
| `Amazon.S3` | S3 REST API에 대한 하위 수준 구현 |
| `Amazon.S3.Model` | 요청 생성·처리용 클래스 |
| `Amazon.S3.Transfer` | 데이터 전송용 상위 수준 API |
| `Amazon.S3.Encryption` | 암호화 클라이언트 |

#### Python 패키지

| 패키지 | 용도 |
|---|---|
| `boto3.s3` | S3의 하위 수준 클라이언트 표현. 클라이언트 API와 리소스 API를 정의 |
| `boto3.s3.transfer` | 파일 전송용 |

### 7.3 3단계: S3 클라이언트 생성

API로 서비스를 호출하려면 먼저 S3 API를 참조하는 클라이언트를 만들어야 합니다. 클라이언트는 생성 전에 구성할 수 있지만 **생성된 후에는 변경할 수 없습니다(불변).**

#### Python (Boto3) 🔄

Boto3는 하위 수준 **클라이언트(client)** API와 상위 수준 **리소스(resource)** API를 제공합니다.

> **중요**: AWS Python SDK 팀은 **리소스 인터페이스에 새 기능을 추가할 계획이 없습니다.** 기존 인터페이스는 boto3의 수명 주기 동안 계속 동작하지만, 최신 서비스 기능은 클라이언트 인터페이스로 제공됩니다. 신규 코드는 **클라이언트 인터페이스**를 기준으로 작성하세요.
>
> — 출처: [Boto3 – Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

```python
import boto3

# 권장: 클라이언트 인터페이스
s3client = boto3.client('s3')

# 리소스 인터페이스 - 동작하지만 신규 기능이 추가되지 않음
s3resource = boto3.resource('s3')
```

클라이언트로 버킷을 만들면 응답으로 사전(dict)이 반환되고, 리소스 API로 만들면 버킷 인스턴스를 받습니다.

#### 예제: 프로파일 기반 구성 + 버킷 생성 (Python, 클라이언트 인터페이스) 🔄

```python
import boto3

# ─── 1단계: 프로파일 기반 세션 생성 ───
# 세션은 구성 상태를 담는 객체입니다. 리전을 코드에 하드코딩하지 않고
# 프로파일에서 가져오기 위해 세션을 사용합니다.
session = boto3.session.Session(profile_name='staging')

# ─── 2단계: 세션에서 리전 확인 ───
# 프로파일에 설정된 리전을 읽어옵니다. CreateBucketConfiguration에 사용합니다.
current_region = session.region_name

# ─── 3단계: 세션에서 S3 클라이언트 생성 ───
# 클라이언트는 생성 후 변경할 수 없습니다(불변).
s3client = session.client('s3')

# ─── 4단계: 버킷 생성 ───
# LocationConstraint를 지정하지 않으면 버킷은 us-east-1에 생성됩니다.
# us-east-1 이외의 리전에 만들려면 반드시 지정해야 합니다.
s3client.create_bucket(
    Bucket='notes-bucket',
    CreateBucketConfiguration={
        'LocationConstraint': current_region
    }
)
```

#### 예제: 클라이언트 구성 및 버킷 생성 (Java 2.x) 🔄

> 교재 예제는 v1과 v2 문법을 혼용하고 변수명 오류가 있어 v2 문법으로 교정했습니다. 자세한 내용은 [8장](#8-교재-대비-변경-사항)을 참조하세요.

```java
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;

// 리전 구성
Region region = Region.US_WEST_2;

// S3 클라이언트를 빌더로 구성하고 생성합니다.
// 보안 인증 공급자는 AWS 구성 프로파일을 기반으로 합니다.
S3Client s3Client = S3Client.builder()
        .region(region)
        .credentialsProvider(ProfileCredentialsProvider.create("profile_name"))
        .build();

// 버킷 생성 - v2에서는 요청 객체도 빌더로 만듭니다.
s3Client.createBucket(CreateBucketRequest.builder()
        .bucket(bucketName)
        .build());
```

#### 예제: 클라이언트 구성 및 버킷 나열 (.NET)

```csharp
CredentialProfile basicProfile;
AWSCredentials awsCredentials;
var sharedFile = new SharedCredentialsFile();

if (sharedFile.TryGetProfile("basic_profile", out basicProfile) &&
    AWSCredentialsFactory.TryGetAWSCredentials(basicProfile, sharedFile, out awsCredentials))
{
    // 프로파일에서 읽은 자격 증명으로 S3 클라이언트를 만들고 버킷을 세어 나열합니다.
    using (var client = new AmazonS3Client(awsCredentials, basicProfile.Region))
    {
        var response = await client.ListBucketsAsync();
        Console.WriteLine($"Number of buckets: {response.Buckets.Count}");
    }
}
```

> **보안 주의**: 액세스 키와 비밀 키를 코드에서 파라미터로 전달하는 방식은 보안 위험이 있어 권장되지 않습니다. 위 예제는 공유 프로파일에서 자격 증명을 읽어오지만, 프로덕션에서는 IAM 역할이나 IAM Identity Center를 사용하세요.

### 7.4 4단계: 작업 수행

SDK는 API 호출의 세부 정보를 대부분 감추지만, 요청·응답이 담는 정보의 종류를 이해하는 것이 중요합니다. 헤더가 메타데이터를 요청·응답에 연결합니다.

#### 요청: `my-image.jpg`를 `notes-bucket`에 저장하는 PutObject

```http
PUT /my-image.jpg HTTP/1.1
Host: notes-bucket.s3.<Region>.amazonaws.com
Date: Wed, 12 Oct 2020 17:50:00 GMT
Authorization: authorization string
Content-Type: text/plain
Content-Length: 11434
x-amz-meta-author: Janet
Expect: 100-continue

[11434 bytes of object data]
```

- 작업: `PUT` / 리소스 경로: `/my-image.jpg`
- `Host`: 가상 호스팅 스타일 URL
- `x-amz-meta-author`: 사용자 정의 메타데이터
- `Expect: 100-continue`: 서버 확인이 오기 전에는 요청 본문을 보내지 않음

#### 응답: 버전 관리가 활성화된 버킷의 PutObject 응답

```http
HTTP/1.1 100 Continue
HTTP/1.1 200 OK
x-amz-id-2: LriYPLdmOdA...
x-amz-request-id: 0A49CE4060975EAC
x-amz-version-id: 43jfkodU8...
Date: Wed, 12 Oct 2020 17:50:00 GMT
ETag: "fbac..."
Content-Length: 0
Connection: close
Server: AmazonS3
```

#### 주요 응답 헤더

| 헤더 | 용도 |
|---|---|
| `ETag` | 업로드된 객체의 체크섬이 원본과 일치하는지 확인. 멀티파트 업로드를 완료할 때는 각 파트 번호와 ETag를 최종 요청에 포함해야 하며, 이는 파트 업로드와 별개의 API 호출입니다 |
| `x-amz-request-id`, `x-amz-id-2` | S3가 처리하는 모든 요청에 대해 생성. 문제 해결 시 AWS Support에 전달하면 유용 |
| `x-amz-version-id` | 버전 관리가 활성화된 버킷에 업로드된 객체의 버전 ID |
| `Connection` | 연결이 닫히는지 여부 |

> — 출처: [Common Request Headers](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html), [Common Response Headers](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html)

### 7.5 5단계: S3 클라이언트 연결 닫기

`close()`는 클라이언트 객체를 닫고 연결 풀 리소스를 해제합니다. 모범 사례로 따르는 것이 좋습니다.

다만 대부분의 경우 SDK가 연결 풀에서 클라이언트를 자동으로 정리·종료·제거하므로 명시적인 `close()` 호출이 반드시 필요하지는 않습니다.

---

## 8. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 8.1 교재 기술이 사실과 다른 항목

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| 버킷 이름 허용 문자 | "소문자, 숫자, 하이픈(-)만 사용해야 합니다" | 마침표(`.`)도 허용됩니다. 다만 SSL 와일드카드 인증서 매칭과 Transfer Acceleration 제약 때문에 실무에서는 회피 권장 | [버킷 명명 규칙](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| 액세스 포인트 연결 | 강사 노트 첫 문단 "버킷에 연결되지 않습니다" (같은 노트 뒷부분 및 지식 확인 6번 정답과 모순) | 액세스 포인트는 데이터 소스에 **연결(attached)됩니다** | [액세스 포인트](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html) |
| Java 예제 코드 | `S3Client s3 = S3Client.builder()...` 로 선언한 뒤 `s3Client.createBucket(new CreateBucketRequest(bucketName))` 호출. 변수명 불일치이고 v2 빌더와 v1 요청 생성 문법이 섞여 있음 | v2 문법으로 교정. 요청 객체도 빌더로 생성 (`CreateBucketRequest.builder().bucket(...).build()`) | [Java SDK 1.x 지원 종료](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| 문서 링크 경로 | `/AmazonS3/latest/dev/BucketRestrictions.html` (구버전 경로) | 현재 경로는 `/AmazonS3/latest/userguide/` | [버킷 명명 규칙](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| 가용성 수치 | S3 전체를 "99.99% 가용성"으로 단일 표기 | 스토리지 클래스별로 다름 (99.5% ~ 99.99%). 내구성만 전 클래스 공통 99.999999999% | [스토리지 클래스 비교](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 8.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 일관성 모델 | "생성 후 읽기의 일관성" | 객체 PUT·DELETE에 **강력한 읽기 후 쓰기 일관성** (전 리전). 버킷 구성은 최종 일관성 | [일관성 모델](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| ACL | "레거시 리소스 기반 정책" | S3 Object Ownership 기본값이 **버킷 소유자 적용**이며 신규 버킷에서 **ACL 전부 비활성화**. ACL 설정 요청은 실패 | [Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html) |
| 기본 암호화 | 보안 특성으로 "기본 암호화"만 나열 | 2023년 1월 5일부터 **모든 신규 객체에 SSE-S3(AES-256) 자동 적용**. 추가 비용·성능 영향 없음 | [기본 암호화 FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html) |
| 버킷 이름 고유성 | "Amazon S3 전체에서 고유" | **파티션 단위** 고유. 파티션은 `aws`, `aws-cn`, `aws-us-gov`, `aws-eusc` 4개 | [범용 버킷 네임스페이스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html) |
| 자격 증명 제공 | 4단계 우선순위만 제시 | 자격 증명 공급자 체인에 IAM Identity Center, 컨테이너(ECS·EKS), IMDS(EC2 인스턴스 프로파일) 등 포함 | [표준 자격 증명 공급자](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) |
| 웹사이트 엔드포인트 | 하이픈 형식만 기재 | 리전에 따라 하이픈·마침표 두 형식. **HTTPS·액세스 포인트 미지원** | [웹사이트 엔드포인트](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |

### 8.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS SDK for Java 1.x | **2025년 12월 31일 지원 종료** | AWS SDK for Java 2.x (`software.amazon.awssdk`) | [Java SDK 1.x 지원 종료](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| boto3 리소스 인터페이스 (`boto3.resource`) | 신규 기능 추가 계획 없음. 기존 인터페이스는 계속 동작 | 클라이언트 인터페이스 (`boto3.client`) | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| 경로 스타일 URL (`addressing_style = path`) | 현재 동작하지만 향후 중단 예정. 웹 콘텐츠에는 사용 회피 권장 | 가상 호스팅 스타일 (SDK 기본값) | [가상 호스팅](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html) |
| Reduced Redundancy Storage | 사용 비권장 | S3 Standard (더 비용 효율적) | [스토리지 클래스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 8.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| S3 Glacier Instant Retrieval | 분기 1회 액세스 아카이브를 밀리초 검색으로 제공하는 클래스 | [스토리지 클래스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| S3 Express One Zone | 단일 AZ, 한 자리 밀리초 지연. 디렉터리 버킷 전용 | [스토리지 클래스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| 계정 리전 네임스페이스 | 내 계정만 버킷을 만들 수 있는 예약 네임스페이스. `-an` 접미사 | [범용 버킷 네임스페이스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html) |
| 조건부 요청 | 조건부 읽기·쓰기·삭제로 덮어쓰기·경합 제어. 추가 요금 없음 | [조건부 요청](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html) |
| 이벤트 알림 유형 확장 | 수명 주기, Intelligent-Tiering, 객체 태그·주석·ACL 관련 이벤트 추가 | [이벤트 유형](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html) |
| 액세스 포인트 연결 대상 확장 | 버킷 외 FSx for NetApp ONTAP·OpenZFS 볼륨, AWS Backup의 S3 복구 지점 | [액세스 포인트](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html) |
| 버킷 생성 시 태그 지정 | `CreateBucketConfiguration`의 `Tags`. `s3:TagResource` 권한 필요, 태그 조건은 ABAC 활성화 후 적용 | [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) |

### 8.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 파일 스토리지 세부 목록 | 교재 슬라이드 5의 목록(EFS Standard·EFS Infrequent Access·FSx for Lustre·FSx for NetApp ONTAP·FSx for OpenZFS)과 같은 슬라이드 다이어그램 레이블(EFS·FSx for Windows File Server·FSx for Lustre)이 서로 불일치합니다. 이 문서에서는 서비스명만 남기고 세부 목록은 제외했습니다. EFS·FSx 문서로 별도 검증이 필요합니다 |
| `get-bucket-location`이 `us-east-1`에서 `null`을 반환하는 동작 | `LocationConstraint`를 지정하지 않으면 `us-east-1`에 생성된다는 것은 CreateBucket API 문서로 확인했습니다. 다만 `get-bucket-location`의 응답이 `null`로 오는 동작 자체는 문서로 확인하지 못했습니다. 실행 검증이 필요합니다 |

---

## 9. 지식 확인 및 핵심 정리

### 지식 확인 문제 (참/거짓)

**문제 1**: 데이터는 S3 버킷에 객체로 저장됩니다. 텍스트, 동영상, 이미지, 다른 바이너리 형식 등 어떤 종류의 파일도 객체가 될 수 있습니다.

- ✅ **정답: 참**

**문제 2**: S3 버킷은 전역적으로 생성되며 하나의 AWS 리전에 대한 종속성이 없습니다.

- ❌ **정답: 거짓** — 버킷 **이름**은 전역(정확히는 파티션) 네임스페이스에서 관리되지만, 버킷 자체는 특정 AWS 리전에 생성됩니다. 생성 후 리전은 변경할 수 없습니다.

**문제 3**: AWS SDK는 기본 AWS REST API 작업에 해당하는 Amazon S3용 API에 매핑됩니다.

- ✅ **정답: 참**

**문제 4**: 웹 사이트 호스팅을 위해 S3 버킷을 활성화하면 기존의 엔드포인트가 변경됩니다.

- ❌ **정답: 거짓** — 웹 사이트 엔드포인트가 **추가**될 뿐이고 기존 REST API 엔드포인트는 변경되지 않습니다. 두 엔드포인트는 용도가 다릅니다.

**문제 5**: 모든 객체와 버킷은 기본적으로 프라이빗(비공개)입니다.

- ✅ **정답: 참** — 기본 설정이 퍼블릭 액세스를 차단하며, 퍼블릭 액세스 차단 설정은 버킷 정책과 객체 권한을 재정의합니다.

**문제 6**: Amazon S3 액세스 포인트는 S3 버킷에 연결되고 사용 사례별 액세스 정책으로 구성된 고유한 호스트 이름입니다.

- ✅ **정답: 참** — 🆕 현재는 버킷 외에 FSx for NetApp ONTAP·OpenZFS 볼륨, AWS Backup의 S3 복구 지점에도 연결할 수 있습니다.

### 🆕 보충 문제 (최신화 내용 확인)

**문제 7**: 새로 만든 S3 버킷에 객체를 업로드할 때, 암호화를 설정하지 않으면 객체는 암호화되지 않은 상태로 저장됩니다.

- ❌ **정답: 거짓** — 2023년 1월 5일부터 모든 신규 객체 업로드에 SSE-S3(AES-256)가 자동 적용됩니다. ([3.7절](#37-기본-암호화))

> — 출처: [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)

**문제 8**: 새로 만든 S3 버킷에서 객체 ACL을 설정하려고 하면 성공합니다.

- ❌ **정답: 거짓** — Object Ownership 기본값이 '버킷 소유자 적용'이라 ACL이 비활성화되어 있습니다. ACL 설정 요청은 HTTP 400 `AccessControlListNotSupported`로 실패합니다. ([4.4절](#44-s3-object-ownership과-acl-기본-비활성화))

> — 출처: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

**문제 9**: 같은 키에 두 클라이언트가 동시에 PUT을 보내면 S3가 자동으로 잠금을 걸어 한쪽을 대기시킵니다.

- ❌ **정답: 거짓** — S3는 동시 쓰기에 대한 객체 잠금을 지원하지 않고, 타임스탬프가 가장 늦은 요청이 이깁니다(last-writer-wins). 필요하면 조건부 쓰기를 사용하거나 애플리케이션에 잠금을 구현합니다. ([3.2절](#32-데이터-일관성-모델), [3.8절](#38-조건부-요청))

> — 출처: [Amazon S3 data consistency model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 모듈 학습 목표 달성 확인

이 모듈을 완료하면 다음을 수행할 수 있습니다.

- ✅ Amazon Simple Storage Service(Amazon S3)의 기본 개념을 설명
- ✅ Amazon S3를 사용하여 데이터를 보호하는 옵션을 나열
- ✅ 코드의 SDK 종속성을 정의
- ✅ Amazon S3 서비스에 연결하는 방법을 설명
- ✅ 요청 및 응답 객체를 설명
