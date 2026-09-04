# 모듈 4: 권한 부여 시작하기

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [IAM 복습](#2-iam-복습)
3. [정책과 권한](#3-정책과-권한)
4. [IAM 역할과 임시 보안 인증 정보](#4-iam-역할과-임시-보안-인증-정보)
5. [IAM 정책 평가 로직](#5-iam-정책-평가-로직)
6. [권한 테스트](#6-권한-테스트)
7. [개발 환경과 IDE 구성](#7-개발-환경과-ide-구성)
8. [교재 대비 변경 사항](#8-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 강의에서 다루지 않은 내용. AWS 공식 문서로 확인해 더한 항목입니다.
> - 🔄 강의 당시와 달라져 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [8장](#8-교재-대비-변경-사항)에 모아 두었습니다.
> - 예시 액세스 키 ID 는 `AKIA####ODNN7EXAMPLE` 처럼 **5~8번째 글자를 `#` 로 가렸습니다.** 자격 증명 스캐너가 실제 키로 오인하는 것을 막기 위한 것입니다. 접두사 4자(`AKIA`·`ASIA`)는 구분이 학습 내용이므로 그대로 두었습니다.
> - 검증일: 2026년 8월 25일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

이 모듈은 개발 환경을 지원하도록 AWS 권한을 구성하는 방법을 다룹니다. 두 부분으로 나뉩니다. 앞부분(2~6장)은 IAM의 인증·권한 부여 모델을 살펴보고 권한이 실제로 어떻게 평가되는지 확인합니다. 뒷부분(7장)은 그 권한을 개발 환경에 연결하는 방법, 즉 보안 인증 정보 구성과 IDE·SDK 설정을 다룹니다.

### 이 모듈로 할 수 있게 되는 것

- AWS Identity and Access Management(AWS IAM)의 특성과 구성 요소를 식별한다
- 개발 환경을 지원하도록 권한을 구성한다
- IAM 권한을 테스트하는 방법을 시연한다
- 개발 환경을 지원하도록 IDE와 SDK를 구성한다
- SDK를 사용해 AWS 서비스에 액세스하는 것을 시연한다

실습에서는 EC2 인스턴스에서 IDE·AWS 도구 및 SDK·AWS CLI를 실행하고, AWS CloudFormation이 환경을 프로비저닝하며, AWS IAM(IAM 역할, AWS STS)이 Amazon S3 액세스를 통제하는 흐름으로 개발 환경을 구성합니다.

---

## 2. IAM 복습

### 2.1 IAM이란

AWS Identity and Access Management(IAM)는 AWS 리소스에 대한 사용자의 액세스를 안전하게 제어하는 웹 서비스입니다.

| 용도 | 내용 |
|---|---|
| 인증(authentication) | AWS 리소스를 사용할 수 있는 **사용자**를 제어 |
| 권한 부여(authorization) | 사용자가 AWS 리소스를 사용할 수 있는 **방법**을 제어 |

- 애플리케이션은 사용자, 사용자의 개발 환경, AWS 리소스에 대한 권한이 필요합니다.
- 자신에게 액세스 권한을 부여하면 자신뿐 아니라 애플리케이션에 대한 개발·관리 액세스 권한이 필요한 다른 팀원에게도 부여됩니다.
- IAM을 사용하면 여러 AWS 계정에 효율적으로 액세스하도록 개발 환경을 구성할 수 있습니다.
- IAM 보안 인증 정보는 내 AWS 계정 또는 다른 AWS 계정의 리소스에 대한 액세스 권한을 제공합니다.

### 2.2 IAM 용어 및 개념

애플리케이션에 대한 액세스 권한이 **누구와 무엇에** 필요한지 먼저 정리한 다음 IAM 구성을 결정합니다.

| 용어 | 설명 | 예시 |
|---|---|---|
| 사용자(User) | 액세스 권한을 사용해 AWS와 상호 작용하는 사람 또는 애플리케이션을 나타내기 위해 AWS에서 생성하는 엔터티 | Mary, Mateo |
| 사용자 그룹(Group) | 흔히 직무를 기준으로 구성되는 IAM 사용자의 모음. 여러 사용자의 권한을 한 번에 지정할 수 있음 | 관리자, 개발자, DevOps |
| 정책 및 권한(Policy) | 작업을 수행하는 방법에 상관없이 작업에 대한 권한을 정의. 고객 관리형 정책 또는 AWS 관리형 정책을 연결 | AdministratorAccess, DatabaseAdministrator, Billing |
| 역할(Role) | IAM 사용자와 비슷하게 권한 정책이 있는 신뢰할 수 있는 엔터티. **장기 보안 인증 정보가 연결되어 있지 않음.** IAM 사용자는 역할 세션을 위한 임시 보안 인증 정보로 역할을 수임 | AWS 서비스 역할, EC2 인스턴스, 외부 사용자 |

정책은 관리 방식에 따라 다시 나뉩니다.

| 구분 | 설명 |
|---|---|
| AWS 관리형 정책 | AWS가 만들고 관리하는 관리형 정책 |
| 고객 관리형 정책 | 내 AWS 계정에서 만들고 관리하는 관리형 정책. AWS 관리형 정책보다 정밀한 제어 가능 |
| 인라인 정책 | 단일 사용자·그룹·역할에 직접 추가하는 정책. 정책과 자격 증명이 1:1로 묶이고, 자격 증명을 삭제하면 함께 삭제됨 |

리소스 기반 정책은 **인라인만 존재합니다.** 관리형 리소스 기반 정책은 없습니다.

> — 출처: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 2.3 IAM의 작동 방식

IAM은 서비스에 대한 인증 및 권한 부여를 제어하는 데 필요한 인프라를 제공합니다. 요청은 다음 단계를 거칩니다.

```text
  보안 주체(Principal) ── 로그인 ──▶ 인증 ──▶ 요청(Request) ──▶ 권한 부여(Authorization)
   루트/IAM 사용자/역할/                                          │  적용 정책으로 허용·거부 판단
   페더레이션 사용자                                              │  (3a: 리소스 기반 정책으로 교차 계정)
                                                                 ▼
                                              액션/작업 승인 ──▶ 리소스에서 수행
                                              (예: s3:CreateBucket)   (예: S3 버킷)
```

요청에 포함되는 정보:

| 항목 | 내용 |
|---|---|
| 액션/작업 | 보안 주체가 수행하려는 액션/작업 |
| 리소스 | 액션/작업이 수행되는 AWS 리소스 객체 |
| 보안 주체 | 엔터티(사용자 또는 역할)를 사용해 요청을 보낸 사람 또는 애플리케이션 |
| 환경 데이터 | IP 주소, 사용자 에이전트, SSL 활성화 상태, 하루 중 시간대 |
| 리소스 데이터 | 요청되는 리소스와 관련된 데이터 |

AWS는 이 정보를 **요청 컨텍스트(request context)** 로 수집한 뒤 평가합니다.

🆕 인증 단계가 항상 필요한 것은 아닙니다. Amazon S3처럼 익명 사용자의 요청을 일부 허용하는 서비스에서는 인증 단계를 건너뜁니다.

> — 출처: [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 2.4 IAM 사용자와 장기 액세스 키 🔄

IAM 사용자에 자격 증명 기반 정책을 연결하고, API 인증에 액세스 키·비밀 키를 쓰는 것은 개념적으로 유효한 경로입니다. 다만 **현재 AWS가 권장하는 기본 경로는 IAM 사용자와 장기 액세스 키가 아닙니다.**

| 대상 | 현재 권장 |
|---|---|
| 사람(human user, 개발자 포함) | 자격 증명 공급자와의 **페더레이션**으로 임시 보안 인증 정보 사용. 중앙 집중식 액세스 관리에는 **AWS IAM Identity Center** 권장 |
| 워크로드(애플리케이션·백엔드) | **IAM 역할**의 임시 보안 인증 정보 사용. EC2·Lambda 같은 AWS 컴퓨팅에서는 AWS가 역할의 임시 자격 증명을 리소스에 전달하므로 장기 자격 증명을 배포할 필요가 없음 |
| AWS 외부에서 실행되는 워크로드 | IAM Roles Anywhere(X.509 인증서), `AssumeRoleWithSAML`, `AssumeRoleWithWebIdentity`, AWS IoT Core의 mTLS |
| IAM 사용자·루트 사용자가 반드시 필요한 경우 | **MFA를 요구.** 가능하면 패스키·보안 키 같은 피싱 저항 MFA 사용 |

장기 액세스 키가 여전히 필요한 사용 사례는 존재합니다. IAM 역할을 쓸 수 없는 워크로드(예: WordPress 플러그인), IAM Identity Center를 지원하지 않는 서드 파티 AWS 클라이언트, CodeCommit 접근, Amazon Keyspaces 접근 등입니다. 이 경우 **마지막 사용 정보(last used information)** 를 근거로 키를 안전하게 갱신·삭제하도록 권장합니다.

🆕 액세스 키 ID의 접두사로 종류를 구분할 수 있습니다.

| 접두사 | 의미 |
|---|---|
| `AKIA` | IAM 사용자 또는 AWS 계정 루트 사용자의 **장기** 액세스 키 |
| `ASIA` | AWS STS 작업으로 만든 **임시** 보안 인증 정보의 액세스 키 |

비밀 액세스 키는 **생성 시점에만 다운로드할 수 있습니다.** 잃어버리면 새로 만들어야 합니다.

🆕 로컬 개발용 대안:

- **`aws login`** — AWS CLI 버전 2에서 콘솔 자격 증명으로 단기 자격 증명을 발급받아 CLI 명령을 실행합니다.
- **AWS CloudShell** — 콘솔에서 바로 실행하는 브라우저 기반 **사전 인증** 셸입니다. 콘솔에 로그인할 때 쓴 AWS 자격 증명이 새 셸 세션에서 자동으로 사용되므로, AWS CLI 버전 2로 AWS 서비스를 다룰 때 자격 증명을 구성할 필요가 없습니다. 리전당 1GB의 영구 스토리지가 홈 디렉터리에 제공됩니다.

> — 출처: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)

### 2.5 루트 사용자 MFA 의무화 🆕

루트 사용자는 보호가 필요합니다. 현재는 다음이 적용됩니다.

| 항목 | 내용 |
|---|---|
| MFA 구성 | **모든 AWS 계정 유형(독립 실행형·관리 계정·멤버 계정)이 루트 사용자에 MFA를 구성해야 합니다.** MFA가 이미 활성화되어 있지 않으면, 사용자는 AWS Management Console에 접근하려는 **첫 로그인 시도로부터 35일 이내에** MFA를 등록해야 합니다 |
| MFA 디바이스 수 | 루트 사용자에 최대 **8개**의 MFA 디바이스를 조합해 등록할 수 있습니다. AWS는 복원력을 위해 여러 개 등록을 권장합니다 |
| MFA 유형 | FIDO 인증 하드웨어 보안 키, 하드웨어 TOTP 토큰, 가상 MFA 애플리케이션 |
| 루트 액세스 키 | **만들지 않는 것이 강력히 권장됩니다.** 루트 사용자는 청구 정보를 포함해 계정의 모든 서비스·리소스에 대한 완전한 액세스 권한을 갖기 때문입니다. 프로그래밍 방식 액세스가 필요하면 루트 자격 증명으로 `aws login`을 사용합니다 |
| 멤버 계정 | AWS Organizations로 관리하는 여러 계정에서는 **멤버 계정의 루트 자격 증명을 제거**하도록 권장합니다. 루트 암호·액세스 키·서명 인증서를 제거하고 MFA를 비활성화·삭제할 수 있으며, 이후 멤버 계정은 루트로 로그인하거나 루트 암호를 복구할 수 없습니다 |

> — 출처: [Root user best practices for your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### 2.6 인증 및 권한 부여 결정하기

액세스 관리는 리소스 보호를 위해 사용자와 그룹을 설정하는 것으로 시작합니다. 외부 사용자에게 AWS 리소스 액세스를 부여하기 위해 다른 자격 증명 서비스에 연결하는 것도 포함됩니다. 안전한 애플리케이션 액세스를 설계할 때 던져야 하는 질문입니다.

- 애플리케이션 빌드·관리·상호 작용을 위해 액세스 권한이 필요한 사용자 또는 서비스는?
- 애플리케이션 환경에 필요한 액세스 수준(정책 및 권한)은?
- 애플리케이션에 사용하기 좋은 역할은?
- 모든 사용자에게 모든 서비스에 대한 완전한 액세스 권한이 항상 필요한가? IAM 보안 주체를 어떻게 관리할 것인가?

직무 예시: 개발자, 지원, DB 관리자, 품질 관리, DevOps.

---

## 3. 정책과 권한

### 3.1 정책 유형 🔄

AWS가 지원하는 정책 유형은 **9가지**입니다. 사용 빈도가 높은 순서입니다.

| 정책 유형 | 연결 대상 | 권한을 부여하는가 | 역할 |
|---|---|---|---|
| 자격 증명 기반 정책 | IAM 사용자·그룹·역할 | ✅ 부여 | 자격 증명이 무엇을 할 수 있는지 정의. 관리형 또는 인라인 |
| 리소스 기반 정책 | 리소스 (S3 버킷, IAM 역할 신뢰 정책 등) | ✅ 부여 | 정책에 지정된 보안 주체에 권한 부여. 인라인만 존재 |
| 🆕 VPC 엔드포인트 정책 | VPC 엔드포인트 | ❌ 제한 | 엔드포인트를 사용할 수 있는 보안 주체와 접근 가능한 리소스를 제어. 엔드포인트를 통과하는 트래픽에만 적용되는 추가 경계 |
| 권한 경계 | IAM 엔터티(사용자·역할) | ❌ 제한 | 자격 증명 기반 정책이 엔터티에 부여할 수 있는 **최대 권한** 설정 |
| 🆕 서비스 제어 정책(SCP) | AWS Organizations 루트·OU·계정 | ❌ 제한 | 조직 내 계정의 **IAM 사용자·역할**에 대한 최대 권한 정의 |
| 🆕 리소스 제어 정책(RCP) | AWS Organizations 루트·OU·계정 | ❌ 제한 | 조직 내 계정의 **리소스**에 대한 최대 권한 정의 |
| 액세스 제어 목록(ACL) | 리소스 (S3, AWS WAF, Amazon VPC 등) | ✅ 부여 | 다른 계정의 보안 주체에게 액세스 부여. **JSON 형식을 쓰지 않는 유일한 정책 유형.** 같은 계정 내 보안 주체 제어에는 사용할 수 없음 |
| 🆕 AWS RAM 리소스 공유 | 공유 리소스 | ✅ 부여 | 리소스마다 리소스 기반 정책을 쓰지 않고 계정·OU·조직 단위로 리소스를 공유 |
| 🆕 세션 정책 | 역할 세션·페더레이션 사용자 세션 | ❌ 제한 | 역할 수임 또는 페더레이션 시점에 전달. 해당 세션의 권한을 제한 |

정리하면, **권한을 부여하는 정책**은 자격 증명 기반·리소스 기반·ACL·RAM 공유이고, 나머지는 **이미 부여된 권한의 상한을 깎는** 정책입니다. 상한 정책만 붙여 두고 권한이 생길 것으로 기대하면 안 됩니다.

> — 출처: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

### 3.2 자격 증명 기반 정책

IAM 사용자에게 AWS 서비스 액세스 권한을 부여하는 방법은 IAM 사용자를 만들 때 자격 증명 기반 정책을 직접 연결하거나, 적절한 권한 정책이 연결된 **사용자 그룹의 구성원으로 만드는 것**입니다. 그룹 구성원으로 만드는 편이 권한을 한곳에서 관리하기 좋습니다.

다음 예제는 특정 S3 버킷의 객체에 대한 읽기·쓰기 액세스를 허용합니다.

```json
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Sid": "ListObjectsInBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::notes"
    },
    {
      "Sid": "AllObjectActions",
      "Effect": "Allow",
      "Action": "s3:*Object",
      "Resource": ["arn:aws:s3:::notes/*"]
    }
  ]
}
```

두 문장이 나뉜 이유를 짚어 둘 만합니다. `s3:ListBucket`은 **버킷**에 대한 작업이므로 리소스가 `arn:aws:s3:::notes`이고, `s3:*Object`는 **객체**에 대한 작업이므로 리소스가 `arn:aws:s3:::notes/*`입니다. ARN을 하나로 합치면 동작하지 않습니다.

### 3.3 리소스 기반 정책

리소스 기반 정책은 Amazon S3 버킷 같은 AWS 리소스에 연결됩니다. 해당 리소스에서 특정 작업을 수행할 권한을 **지정된 보안 주체에 부여하고** 이러한 권한이 적용되는 조건을 정의합니다.

다음 예제는 요청이 지정된 IP 주소 범위에서 시작되지 않는 한, 지정된 S3 버킷의 객체에서 Amazon S3 작업을 수행할 권한을 거부합니다.

```json
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Sid": "IPAllow",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::notes",
        "arn:aws:s3:::notes/*"
      ],
      "Condition": {
        "NotIpAddress": {"aws:SourceIp": "54.240.143.0/24"}
      }
    }
  ]
}
```

🆕 IAM 서비스가 지원하는 리소스 기반 정책은 **역할 신뢰 정책(trust policy)** 한 가지뿐입니다. IAM 역할은 자격 증명이면서 동시에 리소스 기반 정책을 지원하는 리소스이기 때문에, 역할에는 **신뢰 정책과 자격 증명 기반 정책을 모두** 연결해야 합니다. 신뢰 정책은 어떤 보안 주체가 역할을 수임할 수 있는지 정의합니다.

🆕 용어 구분: **리소스 기반(resource-based) 정책**과 **리소스 수준(resource-level) 권한**은 다릅니다. 앞의 것은 리소스에 직접 연결하는 정책이고, 뒤의 것은 정책에서 ARN으로 개별 리소스를 지정할 수 있는 능력입니다.

> — 출처: [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 3.4 권한 경계

권한 경계는 고급 IAM 기능입니다.

- 자격 증명 기반 정책이 사용자나 역할 같은 IAM 엔터티에 부여할 수 있는 **최대 권한**을 설정합니다.
- 엔터티는 **자격 증명 기반 정책과 권한 경계 모두에서 허용되는 작업만** 수행할 수 있습니다. 즉 두 정책의 **교집합**이 유효 권한입니다.
- 권한 경계는 **그 자체로 권한을 부여하지 않습니다.** 권한 정책을 반드시 별도로 연결해야 합니다.
- AWS 관리형 정책 또는 고객 관리형 정책을 경계로 사용할 수 있습니다.

예를 들어 개발자 그룹에 `PowerUserAccess`를 부여하면 그 구성원은 다이어그램의 여러 서비스에 액세스할 수 있지만, 같은 그룹의 새 구성원에게 CloudWatch만 허용하는 권한 경계를 붙이면 그 사용자는 Amazon S3에서 작업을 **수행할 수 없습니다.** 권한 경계를 벗어나기 때문입니다. 그 경계는 다음과 같습니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

🆕 실무 용도: AWS는 권한 경계를 **계정 내 권한 관리 위임** 수단으로 권장합니다. 예를 들어 개발자가 자기 워크로드용 역할을 직접 만들고 관리하게 하면서, 위임하는 권한의 상한을 경계로 고정하는 방식입니다.

🆕 주의: 권한 경계가 연결된 IAM 사용자·역할에 대해서는 리소스 기반 정책에서 `NotPrincipal` + `Deny` 조합을 쓰지 마세요. `NotPrincipal` 값에 무엇을 넣었는지와 무관하게 **권한 경계가 연결된 모든 IAM 보안 주체가 거부됩니다.** 대신 `ArnNotEquals` 조건 연산자와 `aws:PrincipalArn` 컨텍스트 키를 쓰세요.

> — 출처: [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### 3.5 PowerUserAccess 관리형 정책 🔄

`PowerUserAccess`는 `NotAction` 요소로 일부 서비스를 제외한 모든 AWS 서비스·리소스에 대한 작업을 허용하는 AWS 관리형 정책입니다. 현재 정의(기본 버전 v12)의 제외 대상과 예외 허용 목록은 다음과 같습니다.

| 항목 | 현재 (기본 버전 v12) |
|---|---|
| `NotAction` 제외 대상 | `iam:*`, `organizations:*`, `account:*` |
| 예외적으로 허용되는 작업 | `iam:CreateServiceLinkedRole`, `iam:DeleteServiceLinkedRole`, `iam:ListRoles`, `organizations:DescribeEffectivePolicy`, `organizations:DescribeOrganization`, `account:GetAccountInformation`, `account:GetGovCloudAccountInformation`, `account:GetPrimaryEmail`, `account:ListRegions` |
| 설명 | "AWS 서비스와 리소스에 대한 완전한 액세스를 제공하지만 사용자·그룹 관리는 허용하지 않음" |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "account:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "account:GetAccountInformation",
        "account:GetGovCloudAccountInformation",
        "account:GetPrimaryEmail",
        "account:ListRegions",
        "iam:CreateServiceLinkedRole",
        "iam:DeleteServiceLinkedRole",
        "iam:ListRoles",
        "organizations:DescribeEffectivePolicy",
        "organizations:DescribeOrganization"
      ],
      "Resource": "*"
    }
  ]
}
```

`PowerUserAccess`는 직무용 AWS 관리형 정책 중 **개발자 고급 사용자(Developer power user)** 직무에 해당합니다.

> AWS 관리형 정책은 모든 고객이 쓰도록 만들어졌기 때문에 **최소 권한을 부여하지 않습니다.** 시작점으로 쓰고, 실제 사용 권한을 파악한 뒤 고객 관리형 정책으로 좁히는 것이 권장 경로입니다.

> — 출처: [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html), [AWS managed policies for job functions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html)

### 3.6 서비스 제어 정책과 리소스 제어 정책 🆕

AWS Organizations로 여러 계정을 관리할 때는 조직 차원의 가드레일이 두 종류 있습니다. 권한 경계가 계정 안에서 상한을 정하는 것과 달리, 이 둘은 조직 단위로 동작합니다.

| 구분 | 서비스 제어 정책(SCP) | 리소스 제어 정책(RCP) |
|---|---|---|
| 제한 대상 | 계정 내 **보안 주체**(IAM 사용자·역할) | 계정 내 **리소스** |
| 연결 지점 | 조직 루트, OU, 계정 | 조직 루트, OU, 계정 |
| 권한 부여 | ❌ 하지 않음 | ❌ 하지 않음 |
| 루트 사용자 | **멤버 계정의 루트 사용자를 포함해** 모든 보안 주체의 요청을 제한 | 리소스에 대한 유효 권한에 영향을 주며, 조직 소속 여부와 무관하게 **루트 사용자를 포함한** 자격 증명에 영향 |
| 전제 조건 | 조직에서 모든 기능(all features) 활성화 | 조직에서 모든 기능 활성화 |

AWS 권장: 여러 계정으로 워크로드를 분리하고, SCP로 보안 주체 가드레일, RCP로 리소스 가드레일을 설정합니다. **다만 SCP와 RCP만으로는 권한이 부여되지 않습니다.** 권한을 부여하려면 자격 증명 기반 정책 또는 리소스 기반 정책을 반드시 연결해야 합니다.

🆕 RCP를 활성화하면 `RCPFullAWSAccess`라는 AWS 관리형 정책이 조직의 모든 엔터티(루트, 각 OU, 각 계정)에 자동으로 생성·연결되고 **분리할 수 없습니다.** 따라서 RCP 계층에는 항상 `Allow` 문장이 하나 존재합니다.

> — 출처: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## 4. IAM 역할과 임시 보안 인증 정보

### 4.1 IAM 사용자 계정이 항상 필요한가?

다음 상황이면 **역할을 사용합니다.**

- 기존 IAM 사용자에게 임시로 특별 권한이 필요하다면?
- 자격 증명이 AWS 외부(회사 사용자 디렉터리 또는 웹 ID 공급자)에 존재한다면?
- 사용자 또는 애플리케이션에 임시 액세스 권한을 할당해야 한다면?
- 모든 사용자에게 IAM의 영구 자격 증명이 꼭 필요하지는 않다면?

AWS 리소스에 대한 액세스 권한이 없는 사용자나 서비스에 임시로 액세스 권한을 위임해야 하는 경우가 있습니다. 한 AWS 계정의 사용자가 다른 계정의 리소스에 액세스해야 할 수 있고, 모바일 앱이 AWS 리소스를 사용할 수도 있습니다. 하지만 **교체하기 어렵고 사용자가 추출할 가능성이 있는 AWS 키를 애플리케이션에 저장하는 것은 바람직하지 않습니다.**

### 4.2 역할 예제 1: 같은 계정 내 역할 수임

- 사용자는 역할을 수임하고 해당 역할에 연결된 다른 권한을 **임시로** 가질 수 있습니다.
- **역할에는 연결된 보안 인증 정보(암호 또는 액세스 키)가 없습니다.**
- 역할은 한 사람에 고유하게 연결되는 대신 **필요한 사람은 누구나 수임할 수 있도록** 만들어졌습니다.
- 예: 개발자 그룹의 사용자가 데이터베이스 관리자 역할을 수임해, 그룹 정책에 없는 DynamoDB 테이블 쓰기 권한을 얻습니다.

🆕 같은 계정에서 사용자가 역할을 수임하게 하는 방법은 두 가지이며, **둘 중 하나만 하면 됩니다.**

| 방법 | 내용 |
|---|---|
| 자격 증명 기반 정책 | 사용자에게 `sts:AssumeRole` 호출을 허용하는 정책 연결 (역할의 신뢰 정책이 해당 계정을 신뢰하는 한) |
| 역할 신뢰 정책 | 역할의 신뢰 정책에 사용자를 보안 주체로 직접 추가 |

역할 신뢰 정책이 IAM 리소스 기반 정책으로 동작하기 때문입니다. 리소스 기반 정책이 **같은 계정**의 보안 주체에 액세스를 부여하면 추가 자격 증명 기반 정책은 필요하지 않습니다.

> — 출처: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.3 역할 예제 2: 교차 계정 액세스

IAM 역할은 교차 계정 액세스도 허용합니다.

- 개발 환경과 프로덕션 환경을 격리하기 위해 조직에 여러 AWS 계정이 있을 수 있습니다.
- 한 그룹에 연결된 사용자에게 개발 계정 내에서 역할을 전환하여 프로덕션 계정의 역할에 대한 액세스를 요청할 권한이 부여됩니다.
- 사용자는 역할을 **전환(콘솔)** 하거나 **수임(AWS CLI)** 하고 임시 보안 인증 정보를 얻어 프로덕션 환경을 변경합니다.

흐름 (개발 계정 사용자 → 프로덕션 계정의 역할):

```text
  1) 사용자 자격 증명
  2) 역할에 대한 액세스를 요청
  3) 임시 보안 인증 정보가 부여되고 반환됨
  4) 역할 자격 증명으로 프로덕션 계정의 S3 버킷을 업데이트
```

🆕 교차 계정에서는 **한쪽만 허용해도 되는 게 아닙니다.** 실제 요구 조건은 다음과 같습니다.

| 계정 | 역할 | 필요한 것 |
|---|---|---|
| 신뢰받는(trusted) 계정 A — 보안 주체가 있는 쪽 | 요청자 | **자격 증명 기반 정책**이 계정 B의 리소스에 대한 요청을 허용해야 함 |
| 신뢰하는(trusting) 계정 B — 리소스가 있는 쪽 | 리소스 소유자 | **리소스 기반 정책**이 계정 A의 보안 주체를 지정해 액세스를 허용해야 함 |

AWS는 교차 계정 요청에 대해 **두 번 평가**하고, **두 평가 모두 `Allow`일 때만** 요청을 허용합니다.

역할을 쓰는 방식은 다른 리소스 기반 정책과 다릅니다. 역할을 수임한 보안 주체는 결과로 받은 임시 자격 증명으로 그 계정의 **여러 리소스**에 접근할 수 있고, 그 범위는 역할의 자격 증명 기반 권한 정책이 결정합니다.

> — 출처: [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)

### 4.4 역할 예제 3: 서비스 역할

- AWS Lambda 함수 같은 서비스가 사용자 대신 DynamoDB 테이블에서 작업을 수행할 수 있는 역할을 수임할 수 있습니다.
- 이를 **서비스 역할(service role)** 이라고 합니다.
- 세션 소요 시간을 사용자 지정할 수 있습니다([4.6절](#46-역할-세션-지속-시간)).

### 4.5 임시 보안 인증 정보와 AWS STS

IAM 사용자 또는 ID 페더레이션으로 인증한 사용자를 위한 **제한된 권한의 임시 보안 인증 정보**를 요청하려면 **AWS Security Token Service(AWS STS)** 를 사용합니다.

| 특성 | 내용 |
|---|---|
| 짧은 기간 사용됨 | 만료 간격을 지정할 수 있음. 만료된 보안 인증 정보로 보낸 서비스 요청은 실패하므로 새 세트를 요청해야 함 |
| 역할의 기반 | 임시 보안 인증 정보는 역할의 기반 |
| 요청자 측에 저장되지 않음 | 사용자와 함께 저장되지 않고, 요청 시에만 동적으로 생성되어 제공됨 |
| 재사용 불가 | 만료된 후 다시 사용할 수 없음 |
| 페더레이션 지원 | 외부 자격 증명 공급자로 로그인한 사용자에게 발급 가능 |

임시 보안 인증 정보의 이점:

- 애플리케이션 내에 장기 AWS 보안 인증 정보를 배포하거나 포함할 필요가 없습니다.
- 사용자의 AWS 자격 증명을 정의하지 않고도 AWS 리소스 액세스를 제공할 수 있습니다.
- 만료된 후 다시 사용할 수 없으므로 **교체하거나 명시적으로 취소할 필요가 없습니다.**

🆕 임시 보안 인증 정보 세트의 구성 요소:

| 필드 | 내용 |
|---|---|
| `AccessKeyId` | 액세스 키 ID. 임시 자격 증명은 `ASIA`로 시작 |
| `SecretAccessKey` | 비밀 액세스 키 |
| `SessionToken` | 세션 토큰. **크기가 고정되어 있지 않습니다.** 일반적으로 4,096바이트 미만이지만 최대 크기를 가정하지 말라고 명시되어 있습니다 |
| `Expiration` | 만료 시각 |

`AssumeRole` 응답에는 이 `Credentials` 외에 `AssumedRoleUser`(수임된 역할 세션의 ARN과 ID), `PackedPolicySize`, `SourceIdentity`도 포함됩니다.

🆕 AWS STS API는 **글로벌 엔드포인트 또는 리전 엔드포인트**로 호출할 수 있습니다. 가까운 엔드포인트를 선택하면 지연이 줄고, 원래 엔드포인트와 통신할 수 없을 때 다른 리전 엔드포인트로 호출을 돌릴 수 있습니다. AWS SDK를 쓰면 SDK의 리전 지정 방식을 따르고, HTTP 요청을 직접 만들면 올바른 엔드포인트로 직접 보내야 합니다.

> — 출처: [Request temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html), [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.6 역할 세션 지속 시간 🆕

역할 세션의 지속 시간은 다음과 같이 정합니다.

| 항목 | 값 |
|---|---|
| `DurationSeconds` 유효 범위 | 900초(15분) ~ 43200초(12시간) |
| 기본값 | **3600초(1시간)** |
| 역할의 최대 세션 지속 시간 설정 | 1시간 ~ 12시간 사이에서 관리자가 지정 |
| 지정 값이 상한을 넘으면 | 작업이 **실패**합니다. 예: 12시간을 요청했지만 관리자가 6시간으로 설정했다면 실패 |
| 역할 체이닝(role chaining) | AWS CLI·AWS API 역할 세션이 **최대 1시간**으로 제한됩니다. 역할 체이닝 상태에서 1시간을 넘는 `DurationSeconds`를 주면 작업이 실패합니다 |

🆕 세션 정책으로 세션 권한을 더 좁힐 수 있습니다. 인라인 세션 정책 하나 또는 관리형 정책 ARN 최대 10개를 전달할 수 있고, 두 경우 모두 평문 길이는 2,048자를 넘을 수 없습니다. 결과 세션의 권한은 **역할의 자격 증명 기반 정책과 세션 정책의 교집합**이며, **세션 정책으로 역할이 허용하는 것보다 많은 권한을 줄 수는 없습니다.**

🆕 `AssumeRole`로 만든 임시 자격 증명으로는 AWS STS의 `GetFederationToken`과 `GetSessionToken`을 호출할 수 없습니다.

> — 출처: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.7 OIDC 페더레이션 🔄

외부 자격 증명 공급자로 인증하는 기능은 현재 **OIDC 페더레이션(OIDC federation)** 으로 부르고, 특정 소셜 공급자를 나열하는 대신 **OIDC 호환 IdP 전반**을 대상으로 설명합니다.

| 항목 | 내용 |
|---|---|
| 명칭 | OIDC 페더레이션 |
| 지원 대상 | GitHub Actions 등 OIDC 호환 IdP 전반 |
| 동작 | IdP로 인증해 JSON 웹 토큰(JWT)을 받고, 이를 AWS의 임시 보안 인증 정보로 교환. 자격 증명은 필요한 작업만 수행할 수 있는 IAM 역할에 매핑됩니다 |
| 지원 시나리오 | 머신 대 머신 인증(CI/CD 파이프라인, 자동화 스크립트, 서버리스 애플리케이션)과 사람 사용자 인증 모두 |
| 사람 사용자 시나리오 권장 | 가입·로그인·사용자 프로필을 관리해야 하면 **Amazon Cognito를 자격 증명 브로커로** 사용하는 것을 검토 |
| 시계 오차 허용 | JWT의 `exp` 클레임 만료 시각 이후에도 IAM은 시계 오차를 감안해 **5분**의 여유 창을 둡니다 |

사용자 정의 로그인 코드를 작성하거나 자체 사용자 자격 증명을 관리하지 않고 외부 IdP로 인증한다는 취지는 그대로 유효합니다.

> — 출처: [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html)

---

## 5. IAM 정책 평가 로직

### 5.1 모범 사례

- 그룹에 정책을 적용합니다.
- 최소 권한의 원칙을 사용합니다.
- 정책은 **JSON 형식이므로 버전 제어 시스템에서 사용할 수 있습니다.**
- 각 사용자·그룹·역할에 최소한의 액세스 권한을 정의한 뒤, 권한 부여 정책으로 특정 리소스에 대한 액세스를 사용자 정의합니다.

### 5.2 평가 규칙

| # | 규칙 |
|---|---|
| 1 | 기본적으로 모든 요청을 거부합니다 (암시적 거부, implicit deny) |
| 2 | 명시적 허용(explicit allow)은 이 기본 설정을 무시합니다 |
| 3 | 명시적 거부(explicit deny)는 모든 허용을 무시합니다 |

### 5.3 평가 로직 다이어그램

```text
적용 가능한 모든 정책을 평가합니다.
        │
        ▼
  명시적 거부인가? ──── 예 ──▶ 거부(명시적 거부)
        │
       아니요
        │
        ▼
  명시적 허용인가? ──── 예 ──▶ 허용
        │
       아니요
        │
        ▼
      거부(암시적 거부)
```

- IAM 엔터티에 적용된 모든 정책이 평가됩니다.
- **정책이 평가되는 순서는 평가 결과에 영향을 주지 않습니다.**
- 명시적 거부 문이 있으면 최종 결정은 거부입니다.
- 허용 문이 있으면 최종 결정은 허용입니다.
- 허용 문이 없으면 최종 결정은 거부입니다.
- 명시적으로 허용하지 않은 작업은 모두 거부되고, 명시적으로 거부한 작업은 항상 거부됩니다.

> 🔄 "충돌이 있는 경우 가장 제한적인 정책이 적용된다"는 식으로 요약되기도 하지만, 정확한 규칙은 "**명시적 거부가 우선한다**"입니다. 두 허용 정책의 범위를 비교해 좁은 쪽을 고르는 것이 아니라, 어느 계층에든 `Deny`가 하나라도 있으면 그 시점에 최종 결정이 거부로 확정됩니다. 자세한 순서는 [5.4절](#54-aws-집행-코드의-평가-순서)을 참조하세요.

### 5.4 AWS 집행 코드의 평가 순서 🆕

위 2단 다이어그램은 결론을 정확히 요약하지만, 실제 집행 코드(enforcement code)는 정책 유형별로 정해진 순서를 따릅니다. 순서 자체가 결과에 영향을 줍니다.

| 단계 | 계층 | 통과 조건 | 불통과 시 |
|---|---|---|---|
| 0 | 기본값 | — | 모든 요청은 **암시적으로 거부**됩니다. 단 **AWS 계정 루트 사용자는 예외로 완전한 액세스**를 갖습니다 |
| 1 | 거부 평가 | 적용 가능한 모든 정책(SCP, RCP, 리소스 기반, 자격 증명 기반, 권한 경계, 세션 정책)에서 `Deny` 문장을 찾습니다 | `Deny`가 **하나라도** 적용되면 즉시 **Deny** 확정 |
| 2 | AWS Organizations RCP | RCP에 적용 가능한 `Allow` 문장이 있어야 함 | 없으면 **Deny** |
| 3 | AWS Organizations SCP | SCP에 적용 가능한 `Allow` 문장이 있어야 함 | 없으면 **Deny** |
| 4 | 리소스 기반 정책 | 보안 주체 유형에 따라 다름. 대부분의 리소스는 자격 증명 기반 또는 리소스 기반 정책 **한쪽에만** 명시적 `Allow`가 있으면 됩니다 | 계속 진행 |
| 5 | 자격 증명 기반 정책 | 요청 작업을 허용하는 문장이 있어야 함 | 없으면 암시적 거부 → **Deny** |
| 6 | 권한 경계 | 경계 정책이 요청 작업을 허용해야 함 | 허용하지 않으면 암시적 거부 → **Deny** |
| 7 | 세션 정책 | 보안 주체가 세션 보안 주체가 아니면 여기서 **Allow**. 세션 보안 주체이고 세션 정책이 없으면 기본 세션 정책이 만들어지고 **Allow** | 세션 정책이 있고 작업을 허용하지 않으면 **Deny** |

주의할 예외:

- **IAM 역할 신뢰 정책과 AWS KMS 키 정책은 예외**입니다. 이들은 보안 주체에 대해 **명시적으로 액세스를 허용해야** 합니다. IAM·AWS KMS 외의 서비스도 같은 계정 내에서 명시적 `Allow`를 요구할 수 있으므로 해당 서비스 문서를 확인하세요.
- 같은 계정에서 리소스 기반 정책이 **IAM 사용자 ARN** 또는 **세션 보안 주체**(역할 세션, AWS STS 페더레이션 사용자)에 직접 권한을 부여하면, 자격 증명 기반 정책·권한 경계·세션 정책의 **암시적 거부에 제한받지 않습니다.**
- 반면 리소스 기반 정책이 **역할 ARN**(`arn:aws:iam::111122223333:role/examplerole`)에 권한을 부여하면 권한 경계·세션 정책의 암시적 거부에 제한됩니다. 역할을 수임하고 요청하면 실제 보안 주체는 역할 자체가 아니라 **역할 세션 ARN**(`arn:aws:sts::111122223333:assumed-role/examplerole/examplerolesessionname`)입니다.

계층별 조합 결과를 정리하면 다음과 같습니다.

| 조합 | 결과 |
|---|---|
| 자격 증명 기반 + 리소스 기반 (같은 계정) | **합집합.** 어느 한쪽이 허용하면 허용 |
| 자격 증명 기반 + 권한 경계 | **교집합** |
| 자격 증명 기반 + SCP/RCP (리소스 기반 정책이 없는 리소스) | **세 정책 유형 모두가 허용해야** 함 |
| 모든 조합 | 어느 한쪽의 **명시적 거부가 허용을 무시** |

> — 출처: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 5.5 루트 사용자는 항상 허용되는가 🔄

단일 계정 관점에서는 루트 자격 증명으로 그 계정의 리소스를 요청하면 항상 허용됩니다. 현재 문서도 기본 암시적 거부의 예외로 "**AWS 계정 루트 사용자는 완전한 액세스를 갖는다**"고 명시합니다.

다만 **AWS Organizations 안에서는 그렇지 않습니다.**

| 정책 | 루트 사용자에 대한 영향 |
|---|---|
| 서비스 제어 정책(SCP) | 멤버 계정의 보안 주체에 대한 권한을 제한하며, **각 AWS 계정 루트 사용자를 포함합니다** |
| 리소스 제어 정책(RCP) | 멤버 계정 리소스의 권한을 제한하며, 조직 소속 여부와 무관하게 **루트 사용자를 포함한** 자격 증명의 유효 권한에 영향을 줄 수 있습니다 |

또한 AWS Organizations로 관리하는 멤버 계정에서는 루트 자격 증명 자체를 제거할 수 있습니다. 제거하면 그 멤버 계정은 루트로 로그인하거나 루트 암호를 복구할 수 없습니다([2.5절](#25-루트-사용자-mfa-의무화)).

정리하면 루트 사용자의 완전한 액세스는 **단일 계정에서는 참, 조직 안에서는 거짓**입니다.

> — 출처: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html)

---

## 6. 권한 테스트

### 6.1 데모: 권한 경계 테스트 (AWS CLI)

이 데모는 권한 경계가 그룹 정책을 어떻게 깎는지 CLI로 확인합니다. `userwithpermissionboundary`는 개발자 그룹의 구성원이고, 이 그룹은 `PowerUserAccess`를 통해 S3 버킷 생성을 허용합니다. 하지만 이 사용자에게는 Amazon S3 액세스를 지원하지 않는 권한 경계가 연결되어 있습니다.

전제 조건 — AWS CLI가 여러 프로파일로 설정되어 있어야 합니다.

| 구분 | 값 |
|---|---|
| 사용자 | `userwithpermissionboundary`, `userwithiamaccess` |
| 그룹: 개발자 | 권한 정책 = `PowerUserAccess` / 구성원 = `userwithpermissionboundary` |
| 그룹: 관리자 | 권한 정책 = `AdministratorAccess` / 구성원 = `userwithiamaccess` |
| 권한 경계 | `userwithpermissionboundary` = `S3restricted` |

`S3elevated` (S3 액세스를 포함하는 경계):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudwatch:*",
        "ec2:*"
      ],
      "Resource": "*"
    }
  ]
}
```

`S3restricted` (S3 액세스를 뺀 경계):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*",
        "ec2:*"
      ],
      "Resource": "*"
    }
  ]
}
```

데모 절차:

```bash
# 1) userwithpermissionboundary 프로파일로 버킷 생성 시도 → 실패
#    그룹 정책은 허용하지만 권한 경계가 s3 를 허용하지 않기 때문입니다.
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary

# 2) 사용자에게 연결된 권한 경계를 확인
#    → arn:aws:iam::111122223333:policy/S3restricted
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 3) 그 경계가 허용하는 최대 액세스 수준을 확인
aws iam get-policy-version \
  --policy-arn arn:aws:iam::111122223333:policy/S3restricted \
  --version-id v1

# 4) 상승된 권한을 가진 다른 사용자로 경계를 S3elevated 로 교체
aws iam put-user-permissions-boundary \
  --permissions-boundary arn:aws:iam::111122223333:policy/S3elevated \
  --user-name userwithpermissionboundary \
  --profile userwithiamaccess

# 5) 경계가 바뀌었는지 확인
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 6) 같은 사용자로 버킷 생성 재시도 → 성공
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary
```

🆕 `PutUserPermissionsBoundary` API의 파라미터는 `PermissionsBoundary`(관리형 정책 ARN, 20~2048자)와 `UserName`(ARN이 아닌 친숙한 이름, 1~64자)이고 **둘 다 필수**입니다. 이 API 문서도 "권한 경계로 사용되는 정책은 권한을 제공하지 않으므로 **권한 정책을 반드시 별도로 연결해야 한다**"고 명시합니다. 데모에서 `PowerUserAccess`가 그룹에 붙어 있는 것이 그 권한 정책 역할을 합니다.

> 데모의 계정 ID는 문서 예시용 `111122223333`으로 통일했습니다. AWS 계정 ID는 12자리입니다.

> — 출처: [PutUserPermissionsBoundary](https://docs.aws.amazon.com/IAM/latest/APIReference/API_PutUserPermissionsBoundary.html), [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html)

### 6.2 데모: 역할 수임 테스트 (AWS Management Console) 🔄

이 데모는 AWS CloudShell 액세스 권한만 부여된 계약자 사용자로 콘솔에 로그인해, 역할을 수임하기 전과 후의 결과 차이를 보여 줍니다. 같은 조직 내 역할 사용 예시입니다.

| 구분 | 값 |
|---|---|
| 사용자 | 계약자(Contractor) / 연결된 정책 = 없음 |
| 그룹 | 계약자 / 연결된 정책 = `ContractorAccess` |
| 역할 | 연결된 정책 = `ContractorS3access` |

`ContractorAccess` (그룹 정책):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "cloudshell:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::111122223333:role/S3access"
    }
  ]
}
```

`ContractorS3access` (역할의 권한 정책):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

데모 절차:

```bash
# 1) 콘솔에 Contractor 로 로그인하고 CloudShell 을 실행한 뒤 버킷 생성 시도 → 실패
#    CloudShell 은 사전 인증되어 있으므로 자격 증명을 따로 구성하지 않습니다.
aws s3 mb s3://devonawstest-bucket

# 2) 현재 어떤 자격 증명으로 호출되는지 확인
#    권한이 없어도 호출할 수 있습니다.
aws sts get-caller-identity

# 3) 역할을 수임해 임시 보안 인증 정보를 받습니다.
aws sts assume-role \
  --role-arn "arn:aws:iam::111122223333:role/S3access" \
  --role-session-name DevOnAWS

# 4) 응답의 Credentials 값을 환경 변수로 내보냅니다.
#    임시 액세스 키 ID 는 ASIA 로 시작합니다.
export AWS_ACCESS_KEY_ID=ASIA####ODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=<SessionToken>

# 5) 역할을 수임했는지 확인
#    Arn 이 arn:aws:sts::111122223333:assumed-role/S3access/DevOnAWS 로 바뀝니다.
aws sts get-caller-identity

# 6) 수임된 역할로 버킷 생성 재시도 → 성공
aws s3 mb s3://devonawstest-bucket
```

이 데모에서 실행 가능하도록 맞춘 값들:

| 항목 | 맞춘 값 | 이유 |
|---|---|---|
| 버킷 이름 | `devonawstest-bucket` | 범용 버킷 이름은 **소문자, 숫자, 마침표(`.`), 하이픈(`-`)** 만 쓸 수 있습니다. 대문자와 밑줄이 들어가면 권한과 무관하게 실패합니다 |
| 역할 이름 | `S3access` | 정책의 `Resource`가 가리키는 역할 이름과 명령의 `--role-arn`을 일치시켰습니다 |
| 임시 액세스 키 | `ASIA` 접두사 | `assume-role`이 반환하는 임시 키는 `ASIA`로 시작합니다(`AKIA`는 장기 키) |
| 계정 ID | `111122223333` | 정책의 `Resource`와 명령의 `--role-arn`이 같은 계정을 가리켜야 `sts:AssumeRole` 허용이 매칭됩니다 |

🆕 `GetCallerIdentity`에는 **권한이 필요하지 않습니다.** 관리자가 `sts:GetCallerIdentity`를 명시적으로 거부하는 정책을 연결해도 이 작업은 여전히 수행할 수 있습니다. 액세스가 거부될 때도 같은 정보가 반환되기 때문입니다. 응답 필드는 세 개입니다.

| 필드 | 내용 |
|---|---|
| `Account` | 호출 엔터티를 소유·포함하는 AWS 계정 ID |
| `Arn` | 호출 엔터티의 ARN. IAM 사용자는 `arn:aws:iam::111122223333:user/Alice`, 수임된 역할은 `arn:aws:sts::111122223333:assumed-role/my-role-name/my-role-session-name` |
| `UserId` | 호출 엔터티의 고유 식별자 |

권한 문제를 디버깅할 때 첫 명령으로 두기 좋은 이유가 여기 있습니다. 권한이 없어도 실행되고, 역할 수임 성공 여부를 `Arn`의 형태로 바로 확인할 수 있습니다.

> — 출처: [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html), [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 6.3 호출 없이 권한을 검증하는 도구 🆕

실제 API를 호출해 실패를 보고 원인을 역추적하는 대신, 프로덕션에서는 호출하지 않고 검증하는 편이 안전합니다.

#### IAM 정책 시뮬레이터

정책 시뮬레이터는 자격 증명 기반 정책, IAM 권한 경계, 서비스 제어 정책(SCP), 그리고 직접 제공한 리소스 기반 정책을 테스트합니다. **어떤 AWS 서비스에도 실제 요청을 보내지 않고** AWS가 요청을 어떻게 평가할지 시뮬레이션합니다. 각 작업·리소스에 대해 허용 또는 거부라는 이진 결과를 돌려주고, 허용이나 명시적 거부인 경우 **어느 정책이 그 결과를 만들었는지**까지 보여 줍니다.

| 모드 | 용도 |
|---|---|
| 보안 주체(Principal) 모드 | 기존 IAM 사용자·역할·그룹에 **이미 연결된** 정책을 테스트. 커스텀 자격 증명 정책이나 권한 경계를 시뮬레이션에만 포함·제외할 수 있고 계정은 변경되지 않음 |
| 커스텀(Custom) 모드 | 아직 연결하지 않은, 직접 작성하거나 붙여 넣은 정책을 테스트. 계정에 저장되지 않음 |

한계를 알고 써야 합니다.

- 시뮬레이터 결과는 **실제 AWS 환경과 다를 수 있습니다.** AWS는 시뮬레이터로 테스트한 뒤 실제 환경에서 확인하도록 권장합니다.
- 프로덕션의 실제 컨텍스트 키 값을 사용하지 않고, 작업을 실제로 실행하지 않으므로 서비스 응답도 없습니다.
- 권한 경계는 **한 번에 하나만** 시뮬레이션할 수 있습니다.
- SCP는 허용·거부 여부는 알려 주지만, 보안상 다른 정책 유형처럼 **매칭된 문장을 노출하지 않습니다.**
- 콘솔을 제외하면 리소스의 정책을 대신 가져와 주지 않습니다. 리소스 기반 정책을 포함하려면 리소스와 함께 정책을 직접 제공해야 합니다.

#### IAM Access Analyzer

| 기능 | 내용 |
|---|---|
| 외부 액세스 분석기 | 조직·계정의 리소스가 외부 엔터티와 공유되고 있는지 식별. 리소스 기반 정책을 논리 기반 추론으로 분석하고 인스턴스별로 결과(finding) 생성 |
| 내부 액세스 분석기 | 선택한 리소스에 대한 내부 액세스를 식별 |
| 미사용 액세스 분석기 | 조직·계정에서 사용되지 않는 액세스를 식별 |
| 정책 검증 | IAM 정책을 정책 문법과 AWS 모범 사례에 대해 검증. **100개가 넘는 정책 검사**와 실행 가능한 권고를 제공하며, 콘솔에서 정책을 작성·편집하는 중에 권고가 표시됩니다 |
| 커스텀 정책 검사 | 지정한 보안 표준에 대해 정책을 검증 |
| 정책 생성 | AWS CloudTrail 로그에 기록된 액세스 활동을 기반으로 세분화된 정책을 생성 |

운영 특성:

- 분석기를 켤 때 조직 또는 계정을 **신뢰 영역(zone of trust)** 으로 지정합니다. 신뢰 영역 안의 보안 주체가 하는 액세스는 신뢰된 것으로 봅니다.
- 정책을 추가·변경하면 약 **30분** 안에 분석합니다. 알림이 누락되면 다음 주기 검사(24시간 이내)에 분석합니다.
- **외부 액세스는 분석기를 켠 리전의 리소스만 분석합니다.** 모든 리소스를 보려면 사용하는 리전마다 외부 액세스 분석기를 만들어야 합니다. 미사용 액세스는 리전 무관이므로 리전마다 만들 필요가 없습니다.

#### 마지막 액세스 정보 (last accessed information)

과도하게 부여된 권한을 찾아 제거하는 데 씁니다. IAM 또는 AWS Organizations에 존재하는 자격 증명·정책에 대해 조회할 수 있습니다.

| 항목 | 내용 |
|---|---|
| 정보 유형 | 허용된 **AWS 서비스** 정보와 허용된 **작업** 정보. AWS API 접근 시도 날짜·시각을 포함 |
| 콘솔 반영 시간 | 최근 활동은 **4시간** 안에 IAM 콘솔에 표시 |
| 추적 기간 | 서비스 정보는 **최소 400일**. 작업 정보 추적 시작일은 Amazon S3 2020년 4월 12일, Amazon EC2·IAM·Lambda 2021년 4월 7일, 그 외 모든 서비스 2023년 5월 23일 |
| 기록되는 시도 | **성공한 시도만이 아니라 모든 시도**를 포함합니다. 콘솔·SDK·CLI 경로 전부 해당합니다. 예상 못한 항목이 보인다고 계정이 침해된 것은 아닙니다(요청이 거부됐을 수 있음). 성공·거부 여부의 권위 있는 출처는 CloudTrail 로그입니다 |
| 제외 항목 | `iam:PassRole`은 추적되지 않습니다. 데이터 플레인 이벤트에 대한 작업 정보도 제공되지 않습니다 |
| AWS Organizations | 관리 계정 자격 증명으로 로그인하면 조직 루트·OU·계정 단위로 SCP가 허용하는 서비스에 대한 정보를 볼 수 있습니다 |

미사용 액세스 분석기로 이 정보를 **지속적으로 모니터링**할 수 있습니다.

> — 출처: [IAM policy testing with the IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html), [Using AWS Identity and Access Management Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html), [Refine permissions in AWS using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html)

---

## 7. 개발 환경과 IDE 구성

### 7.1 개발 환경 설정

애플리케이션 개발 태스크를 수행하는 개발자는 요구 사항에 맞게 도구를 구성해야 합니다. 구성은 자격 증명(우선순위 순서), 프로파일, 환경 변수, 임시 자격 증명 순으로 다룹니다.

**명명된 프로파일**은 AWS CLI 명령에 적용할 수 있는 설정 및 자격 증명의 모음입니다. 명령을 실행할 프로파일을 지정하면 해당 명령 실행에 그 설정과 자격 증명이 사용됩니다.

### 7.2 보안 인증 정보 설정 🔄

기본 절차는 다음과 같습니다.

1. 터미널에서 `aws configure`를 실행합니다.
2. AWS 액세스 키 ID를 붙여넣은 다음 AWS 비밀 액세스 키를 붙여넣습니다.
3. 기본 리전 이름을 입력합니다.
4. 기본 출력 형식을 선택합니다.

```bash
$ aws configure
AWS Access Key ID [None]: AKIA####ODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json

$ aws configure --profile user1
AWS Access Key ID [None]: AKIA####H8DHBEXAMPLE
AWS Secret Access Key [None]: PsdaswtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

결과로 만들어지는 파일:

```ini
# ~/.aws/config
[default]
region=us-west-2
output=json

[profile user1]
region=us-east-1
output=json
```

```ini
# ~/.aws/credentials
[default]
aws_access_key_id=AKIA####ODNN7EXAMPLE
aws_secret_access_key=…PxRfiCYEXAMPLEKEY

[user1]
aws_access_key_id=AKIA####H8DHBEXAMPLE
aws_secret_access_key=…Co8nbEXAMPLEKEY
```

파일 위치:

| 플랫폼 | 보안 인증 정보 | 구성 |
|---|---|---|
| Linux, macOS, Unix | `~/.aws/credentials` | `~/.aws/config` |
| Windows | `%USERPROFILE%\.aws\credentials` | `%USERPROFILE%\.aws\config` |

#### 출력 형식 🔄

현재 AWS CLI가 지원하는 형식은 **6가지**입니다.

| 형식 | 내용 |
|---|---|
| `json` | JSON 문자열. **AWS CLI의 기본값** |
| `yaml` | YAML 문자열 |
| 🆕 `yaml-stream` | YAML을 스트리밍으로 출력. 큰 데이터를 더 빠르게 처리 |
| `text` | 탭으로 구분된 여러 줄. `grep`, `sed`, `awk` 로 넘기기 좋음 |
| 🆕 `table` | `+|-` 문자로 셀 경계를 만드는 표. 사람이 읽기 쉽지만 프로그램 처리에는 부적합 |
| 🆕 `off` | stdout 출력을 전부 억제. 종료 코드만 확인하면 되는 자동화 스크립트·CI/CD 파이프라인에 유용 |

형식을 지정하는 방법은 세 가지이고, 아래로 갈수록 우선합니다. `config` 파일의 `output` 키 → `AWS_DEFAULT_OUTPUT` 환경 변수 → 명령줄 `--output` 옵션.

🆕 출력 형식은 `--query` 동작을 바꿉니다. `--output text`는 `--query` **적용 전에** 페이지를 나누고 페이지마다 쿼리를 실행하므로, 페이지별 첫 매칭 요소가 모두 포함되어 예상 밖의 출력이 늘어날 수 있습니다. `json`·`yaml`·`yaml-stream`은 전체를 하나의 구조로 처리한 뒤 쿼리를 **한 번만** 실행합니다.

> `aws configure`로 장기 액세스 키를 파일에 저장하는 것은 기본 절차이지만, 현재 권장 경로는 [2.4절](#24-iam-사용자와-장기-액세스-키)을 참조하세요. 로컬 개발이라면 `aws login` 또는 IAM Identity Center를 먼저 검토합니다.

> — 출처: [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html)

### 7.3 명명된 프로파일로 여러 계정 전환

- AWS CLI로 명명된 여러 프로파일을 설정·자격 증명의 모음으로 구성할 수 있습니다.
- 명명된 프로파일로 **계정, 사용자, 역할, 리전 간 전환**이 가능합니다.
- VS Code, Eclipse, Visual Studio, JetBrains 같은 IDE가 명명된 프로파일을 지원합니다.
- AWS CLI와 IDE는 프로파일을 바꾸지 않는 한 기본 사용자를 사용합니다.
- 프로파일을 추가하려면 `aws configure --profile <이름>`을 실행합니다.

두 계정에 S3 버킷을 만드는 예:

```bash
# 계정 111122223333 (기본 프로파일)
aws s3 mb s3://mybucket

# 계정 444455556666 (user1 프로파일)
aws s3 mb s3://mybucket --profile user1
```

### 7.4 IDE에서 프로파일 전환 🔄

프로파일 전환은 AWS Toolkit와 함께 IDE에서도 지원됩니다. 개발자는 IDE 안에서 프로파일을 바꿔 여러 계정에 Lambda 함수를 배포할 수 있습니다.

현재 JetBrains 툴킷의 자격 증명 설정 경로는 **AWS Connection Settings → Set up authentication → Authenticate with IAM → AWS Toolkit: Setup Authentication 대화 상자**입니다. 여기에 프로파일 이름·액세스 키 ID·비밀 액세스 키를 입력하면 프로파일이 config 파일에 추가되고 연결됩니다.

🆕 JetBrains 툴킷 문서가 명시하는 주의 사항:

- AWS CLI 등 다른 경로로 IAM 자격 증명을 이미 설정했다면 툴킷이 **자동으로 감지**해 사용합니다.
- AWS는 **IAM Identity Center 인증을 권장**합니다.
- 보안 위험을 피하기 위해, 목적이 있는 소프트웨어를 개발하거나 실제 데이터를 다룰 때는 **IAM 사용자로 인증하지 말고** IAM Identity Center 같은 자격 증명 공급자와의 페더레이션을 사용하세요.

🔄 **Eclipse용 AWS Toolkit은 더 이상 별도 문서가 제공되지 않습니다.** `toolkit-for-eclipse/v1/user-guide/` 경로 전체가 현재 JetBrains 툴킷 문서로 리다이렉트됩니다.

| IDE | 현재 문서 |
|---|---|
| JetBrains | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| Visual Studio | [Credentials — Toolkit for Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/keys-profiles-credentials.html) |
| Visual Studio Code | [Setup credentials — Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/setup-credentials.html) |
| Eclipse | 별도 문서 없음. 링크는 JetBrains 툴킷 문서로 리다이렉트됩니다 |

> — 출처: [AWS IAM credentials — AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html)

### 7.5 설정 및 환경 변수

- 구성 파일과 보안 인증 정보 파일에는 운영 체제의 환경 변수에 저장할 수 있는 추가 설정이 포함됩니다.
- 한 번에 하나의 환경 변수 세트만 적용할 수 있지만, 프로그램이 실행되고 요구 사항이 변경됨에 따라 환경 변수는 동적으로 수정됩니다.
- **전역 설정은 모든 서비스에 영향을 미칩니다.** 환경 변수는 AWS SDK와 도구에만 영향을 줍니다.
- 구성 파일에 Amazon S3 관련 설정을 저장할 수도 있습니다.

```ini
# ~/.aws/config
[default]
region=us-west-2
output=json

[profile dev]
region=us-east-1
output=json
retry_mode=standard
max_attempts=4
s3 =
    max_concurrent_requests = 20
    max_queue_size = 10000
    multipart_threshold = 64MB
```

🆕 `retry_mode`와 `max_attempts`는 현재도 유효한 공유 `config` 파일 키입니다. 대응 환경 변수는 각각 `AWS_RETRY_MODE`와 `AWS_MAX_ATTEMPTS`이고, 기본값은 `standard`와 `3`입니다. `max_attempts`는 **초기 요청을 포함한 총 시도 횟수**이므로 `3`은 초기 요청 1회 + 재시도 2회를 뜻하고, `1`로 두면 재시도가 비활성화됩니다.

> — 출처: [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.6 보안 인증 정보 우선 순위와 자격 증명 공급자 체인 🔄

설정 값을 어디서 읽는지(설정 값 조회 우선순위)와, 자격 증명을 어디서 찾는지(자격 증명 공급자 체인)는 **서로 다른 개념**입니다.

#### 설정 값 조회 우선순위 (precedence of settings)

전역 설정 값을 어디서 읽어 오는지의 순서입니다. 위가 우선합니다.

| 순위 | 소스 |
|---|---|
| 1 | 코드 또는 서비스 클라이언트에 **명시적으로 설정한 값.** CLI·PowerShell에서는 명령줄의 작업별 파라미터 |
| 2 | 🆕 **Java·Kotlin 전용**: 해당 설정의 JVM 시스템 속성 |
| 3 | 환경 변수 |
| 4 | 공유 `credentials` 파일 |
| 5 | 공유 `config` 파일. `AWS_PROFILE` 환경 변수 또는 `aws.profile` JVM 시스템 속성으로 로드할 프로파일을 지정 |
| 6 | 🆕 SDK 소스 코드에 내장된 **기본값** |

인스턴스 프로파일은 이 목록에 들어가지 않습니다. 설정 값 소스가 아니라 **자격 증명 공급자**이기 때문입니다.

#### 자격 증명 공급자 체인 (credential provider chain)

SDK가 유효한 자격 증명을 찾기 위해 순서대로 확인하는 소스들입니다. **유효한 자격 증명을 찾으면 탐색을 멈춥니다.** 체인은 SDK마다 다르지만 일반적으로 다음을 포함합니다.

| 공급자 | 설명 |
|---|---|
| AWS 액세스 키 | IAM 사용자의 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| 웹 자격 증명·OpenID Connect 페더레이션 | 외부 IdP로 로그인하고 AWS STS의 JWT로 IAM 역할 수임 |
| 🆕 로그인 자격 증명 공급자 | 로그인한 콘솔 세션(신규 또는 기존)의 자격 증명 사용 |
| 🆕 IAM Identity Center 자격 증명 공급자 | AWS IAM Identity Center에서 자격 증명 획득 |
| 역할 수임 자격 증명 공급자 | IAM 역할의 임시 자격 증명을 받아 사용 |
| 🆕 컨테이너 자격 증명 공급자 | Amazon ECS·Amazon EKS 컨테이너 애플리케이션용 자격 증명 |
| 프로세스 자격 증명 공급자 | 외부 소스·프로세스에서 자격 증명 획득. IAM Roles Anywhere 포함 |
| IMDS 자격 증명 공급자 | **EC2 인스턴스 프로파일.** 인스턴스 메타데이터 서비스로 역할의 임시 자격 증명 전달 |

🆕 표준화된 자격 증명 공급자를 사용하면 **SDK가 만료 시 자격 증명을 자동으로 갱신합니다.** 추가 코드는 필요하지 않습니다. 임시 자격 증명이 만료되면 새 세트를 요청해야 하는 부분을 SDK가 대신 처리해 준다는 뜻입니다.

언어별 자격 증명 공급자 체인의 상세 동작은 각 SDK 문서를 참조하세요.

| 언어 | 문서 |
|---|---|
| Java | [AWS SDK for Java 2.x 자격 증명 공급자 체인](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html) |
| .NET | [AWS SDK for .NET 자격 증명 할당](https://docs.aws.amazon.com/sdk-for-net/latest/developer-guide/creds-assign.html) |
| Python (Boto3) | [Boto3 자격 증명](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html) |

> — 출처: [AWS SDKs and tools settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html), [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html)

### 7.7 요청 서명 SigV4

**서명 버전 4(SigV4)** 는 AWS API 요청에 인증 정보를 추가하는 AWS 서명 프로토콜입니다. 액세스 키는 액세스 키 ID와 비밀 액세스 키로 구성됩니다.

#### 왜 서명하는가

| 목적 | 내용 |
|---|---|
| 요청자의 자격 증명 확인 | 유효한 액세스 키 ID와 비밀 액세스 키가 있는 주체가 요청을 발행했는지 확인. 임시 보안 인증 정보를 쓰면 서명 계산에 **보안 토큰도 필요**합니다 |
| 전송 데이터 보호 | 일부 요청 요소로 해시(다이제스트)를 계산해 요청에 포함하고, AWS가 같은 정보로 해시를 다시 계산해 대조합니다. 값이 다르면 요청을 거부합니다 |
| 재전송 공격 방어 | **대부분의 경우 요청이 타임스탬프로부터 5분 안에 AWS에 도달해야 합니다.** 🔄 |

#### 어떻게 서명하는가

🆕 SigV4 서명 절차는 세 단계입니다.

1. 요청 세부 정보를 기반으로 **정규 요청(canonical request)** 을 만듭니다.
2. AWS 자격 증명으로 **서명**을 계산합니다.
3. 이 서명을 `Authorization` 헤더로 요청에 추가합니다. (쿼리 문자열로도 추가할 수 있습니다.)

**비밀 액세스 키를 요청 서명에 직접 사용하지는 않습니다.** SigV4 서명 프로세스를 거칩니다. 사용자가 생성한 보안 인증 정보로 **SDK가 모든 요청에 자동으로 서명**합니다.

#### 🆕 SigV4a — 비대칭 서명

대칭 SigV4는 **하나의 서비스, 하나의 리전, 특정 하루**로 범위가 지정된 키를 파생합니다. 그래서 서명이 리전마다 달라지고, 서명 대상 리전을 알아야 합니다.

**비대칭 서명 버전 4(SigV4a)** 는 **둘 이상의 AWS 리전에서 검증 가능한 서명**을 만드는 확장입니다.

| 항목 | 내용 |
|---|---|
| 알고리즘 | 공개키·비밀키 암호화. 기존 AWS 비밀 액세스 키에서 ECDSA 키 페어를 파생 |
| 키 파생 | 날짜·서비스·리전별로 별도의 서명 키를 파생하지 않고 **같은 키로 모든 요청에 서명** |
| 검증 | AWS는 키 페어의 **공개키만** 저장해 서명을 검증합니다. 공개키는 비밀이 아니며 서명에 사용할 수 없습니다 |
| 필요한 경우 | Amazon S3 다중 리전 액세스 포인트처럼 다중 리전 API 요청에는 비대칭 서명이 **필수**입니다 |
| 전환 | 다중 리전 서명이 필요한 기능을 AWS SDK·AWS CLI로 호출하면 **추가 구성 없이 자동으로 SigV4a로 전환**됩니다 |

추가적인 보안을 위해 HTTPS로 요청을 전송합니다. **AWS SDK, AWS CLI 또는 서비스별 CLI를 사용할 때는 요청에 명시적으로 서명할 필요가 없습니다.** 직접 서명 코드를 써야 하는 경우는 AWS SDK가 없는 언어를 쓰거나 요청 전송을 완전히 제어해야 할 때입니다.

> — 출처: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 7.8 IDE 고려 사항 🔄

#### JVM TTL 설정 (Java) 🔄

JVM은 DNS 이름 조회를 캐싱합니다. 호스트명을 IP 주소로 확인하면 그 IP를 일정 기간(TTL) 캐시합니다. AWS 리소스는 때때로 바뀌는 DNS 이름 항목을 사용하므로 TTL을 짧게 유지해야 합니다.

| 항목 | 현재 (AWS SDK for Java 2.x) |
|---|---|
| 권장 TTL | **5초** |
| 설정 대상 | `networkaddress.cache.ttl` **보안 속성**(security property). 시스템 속성이 아니므로 `-D` 플래그로 설정할 수 없습니다 |

일부 Java 구성에서는 JVM 기본 TTL이 **JVM을 재시작할 때까지 DNS 항목을 절대 갱신하지 않도록** 설정되어 있습니다. 이 상태에서 AWS 리소스의 IP가 바뀌면 애플리케이션은 JVM을 수동으로 재시작할 때까지 그 리소스를 사용할 수 없습니다.

설정 방법 세 가지:

```java
// 옵션 1: 애플리케이션에서 프로그래밍 방식으로 설정 (권장)
// SDK 클라이언트를 만들기 전, 네트워크 요청 전에 애플리케이션 시작 초기에 호출합니다.
import java.security.Security;

public class MyApplication {
    public static void main(String[] args) {
        Security.setProperty("networkaddress.cache.ttl", "5");

        // ... 이후 SDK 클라이언트 생성 및 애플리케이션 실행
    }
}
```

```ini
# 옵션 2: java.security 파일에 설정
# Java 8:  $JAVA_HOME/jre/lib/security/java.security
# Java 11+: $JAVA_HOME/conf/security/java.security
# 음수는 영구 캐시, 양수는 캐시할 초, 0은 캐시하지 않음
networkaddress.cache.ttl=5
```

```bash
# 옵션 3: JDK 시스템 속성 대체 경로 (보안 속성이 없을 때만 적용되는 폴백)
# JDK 내부 속성이며 "향후 릴리스에서 지원되지 않을 수 있음"으로 문서화되어 있습니다.
# 가능하면 옵션 1~2를 사용하세요.
java -Dsun.net.inetaddr.ttl=5 -Dsun.net.inetaddr.negative.ttl=1 -jar myapp.jar
```

#### 오류 재시도 및 지수 백오프 🔄

DNS 서버, 스위치, 로드 밸런서 같은 네트워크 구성 요소는 요청 수명 중 어디에서나 오류를 만들 수 있습니다. 이런 오류를 다루는 방법은 클라이언트 애플리케이션에 재시도를 구현하는 것이고, 각 AWS SDK는 흐름 제어를 위해 **지수 백오프** 알고리즘을 구현합니다. 연속 오류 응답에 대해 재시도 간 대기 시간을 점진적으로 늘립니다.

🆕 현재는 재시도 모드가 세 가지로 표준화되어 있습니다.

| 항목 | Standard | Adaptive | Legacy |
|---|---|---|---|
| 재시도 할당량(retry quota) | ✅ | ✅ | SDK마다 다름 |
| 초기 요청을 지연시킬 수 있는가 | ❌ | ✅ | ❌ |
| 오류 유형별 백오프 | ✅ | ✅ | SDK마다 다름 |
| SDK 간 표준화 | ✅ | ✅ | ❌ |
| 권장 용도 | **모든 워크로드의 기본값** | 단일 리소스 대상, 스로틀링이 잦고 지연에 관대한 경우 | 이전 버전 호환 목적만 |

- **Standard 모드**(기본값)는 지터를 포함한 지수 백오프로 재시도하며, 일시적 오류(네트워크 타임아웃)에는 짧은 지연, 스로틀링 오류(`ThrottlingException`)에는 긴 지연을 씁니다. **재시도 할당량**은 토큰 버킷으로, 재시도마다 토큰을 차감하고 요청이 성공하면 보충합니다. 토큰이 소진되면 재시도하지 않고 오류를 반환해 애플리케이션이 빠르게 실패합니다.
- **Adaptive 모드**는 Standard에 **클라이언트 측 속도 제한기**를 더합니다. 스로틀링 응답을 추적해 요청 전송 속도를 조절하고, 초기 요청까지 지연·차단할 수 있습니다. 속도 제한기는 SDK 클라이언트 인스턴스 단위로 동작하므로, 여러 리소스나 여러 테넌트를 담당하는 클라이언트에는 권장되지 않습니다.
- **Legacy 모드**는 Standard 도입 전 각 SDK의 동작이며, 재시도 횟수·백오프 타이밍·재시도 대상 오류가 언어마다 다릅니다. 현재 Legacy를 쓰고 있다면 Standard로 전환하도록 권장됩니다.

🆕 문서에 기술된 재시도 동작은 기본값이 되기 전까지 **옵트인이 필요합니다.** 환경에 `AWS_NEW_RETRIES_2026=true`를 설정합니다. 설정하지 않으면 2026년 이전 동작이 적용되며, 백오프 타이밍·재시도 할당량 비용·서비스별 기본값이 다릅니다.

> — 출처: [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html), [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.9 실습 환경과 AWS Cloud9 🔄

실습은 샌드박스 환경에 연결해, 적절한 도구가 설치되고 AWS 서비스에 액세스하도록 구성되어 있는지 확인하는 것으로 시작합니다. 특정 IDE를 살펴보고, AWS Toolkit이 작동하는 방식을 배우고, AWS IAM으로 권한이 작동하는 방식을 이해합니다.

실습 환경이 AWS Cloud9을 개발 환경으로 쓸 수 있는데, 알아 둘 점이 있습니다. **AWS Cloud9은 신규 고객에게 더 이상 제공되지 않습니다.** 기존 AWS Cloud9 고객은 서비스를 그대로 계속 사용할 수 있고, AWS는 마이그레이션 경로로 **AWS IDE 툴킷 또는 AWS CloudShell** 을 안내합니다.

실무 함의:

- Cloud9을 쓰지 않는 계정에서는 Cloud9 기반 절차를 그대로 따를 수 없습니다. 실습 환경이 기존 고객 계정으로 제공되는지 확인이 필요합니다.
- CLI만 필요한 실습이라면 AWS CloudShell로 대체할 수 있습니다. 콘솔에서 바로 실행되고 사전 인증되어 있으므로 자격 증명 구성 단계가 사라집니다([2.4절](#24-iam-사용자와-장기-액세스-키)).
- IDE 경험이 필요하다면 VS Code·JetBrains·Visual Studio용 AWS Toolkit을 로컬에 설치하는 경로가 남습니다([7.4절](#74-ide에서-프로파일-전환)).

> — 출처: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html), [How to migrate from AWS Cloud9 to AWS IDE Toolkits or AWS CloudShell](https://aws.amazon.com/blogs/devops/how-to-migrate-from-aws-cloud9-to-aws-ide-toolkits-or-aws-cloudshell/)

---

## 8. 교재 대비 변경 사항

수강생이 공식 교재를 함께 볼 수 있으므로, 이 자료가 교재와 어디서 갈라지는지 한곳에 모았습니다. 앞 장에서 신규·교정으로 표시한 항목의 근거가 여기 있습니다.

### 8.1 교재와 다른 점

| 항목 | 교재의 서술 | 지금 확인된 내용 | 근거 |
|---|---|---|---|
| 데모 버킷 이름 | `aws s3 mb s3://DevonAWStest_bucket` | 범용 버킷 이름은 소문자·숫자·마침표·하이픈만 쓸 수 있습니다. 대문자와 밑줄이 있어 권한과 무관하게 실패합니다 | [버킷 명명 규칙](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| 데모 역할 이름 | 같은 데모에서 `ContractorAccess`, `Contractors3access`, `S3access` 혼용 | 정책의 `Resource`가 가리키는 `role/S3access`로 통일해야 `sts:AssumeRole` 허용이 매칭됩니다 | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| 데모 계정 ID | `111122223333`, `1234567891011`(13자리), `444455556666`, `112233445566` 혼용. 정책의 계정과 명령의 `--role-arn` 계정이 불일치 | 문서 예시용 12자리 계정 ID로 통일해야 정책과 명령이 맞습니다 | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| 임시 액세스 키 예시 | `export AWS_ACCESS_KEY_ID=AKIA####ODNN7EXAMPLE` | `AKIA`는 장기 액세스 키 접두사입니다. `assume-role`이 반환하는 임시 키는 `ASIA`로 시작합니다 | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| JetBrains 툴킷 설정 경로 | "JetBrains용 AWS Toolkit는 Eclipse 기본 설정 창을 통해 프로세스를 간소화합니다" | 서로 다른 IDE를 섞은 서술입니다. 현재 경로는 AWS Connection Settings → Set up authentication → Authenticate with IAM | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| 우선순위 목록의 인스턴스 프로파일 | 설정 값 우선순위 목록의 마지막 항목으로 "인스턴스 프로파일" 기재 | 인스턴스 프로파일은 설정 값 소스가 아니라 **자격 증명 공급자**입니다. 두 개념이 분리되어 있습니다 | [Settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html) |
| "가장 제한적인 정책이 적용됩니다" | 충돌 시 가장 제한적인 정책이 적용된다고 서술 | 결과는 같지만 정확한 규칙은 "명시적 거부가 우선한다"입니다. 정책 범위를 비교하는 것이 아니라, 어느 계층에든 `Deny`가 있으면 그 시점에 거부가 확정됩니다 | [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| SigV4 재전송 방어 기간 | "요청 타임스탬프로부터 n분이며 정확한 기간은 서비스마다 다릅니다" | 대부분의 경우 요청은 타임스탬프로부터 **5분** 안에 AWS에 도달해야 합니다 | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |

### 8.2 동작·기본값이 변경된 항목

| 항목 | 교재의 서술 | 현재 | 근거 |
|---|---|---|---|
| 정책 유형 수 | "가장 일반적인 두 가지 정책 유형은 자격 증명 기반과 리소스 기반" | **9가지**: 자격 증명 기반, 리소스 기반, VPC 엔드포인트 정책, 권한 경계, SCP, RCP, ACL, AWS RAM 리소스 공유, 세션 정책 | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| 평가 로직 | 명시적 거부 → 명시적 허용 → 거부 2단 판정 | 계층별 순서가 정해져 있습니다. 거부 평가 → RCP → SCP → 리소스 기반 → 자격 증명 기반 → 권한 경계 → 세션 정책 | [How AWS enforcement code logic evaluates requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| 루트 사용자 요청 | "루트 보안 인증 정보로 해당 계정의 리소스를 요청하는 경우는 항상 허용됩니다" | 단일 계정에서는 참이지만, AWS Organizations의 SCP·RCP는 **멤버 계정 루트 사용자를 포함해** 권한을 제한합니다 | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| IAM 사용자 생성 경로 | IAM 사용자를 만들고 정책을 연결하는 것이 기본 경로 | 사람 사용자는 자격 증명 공급자 페더레이션(IAM Identity Center 권장), 워크로드는 IAM 역할이 권장 경로. IAM 사용자·장기 키는 예외적 사용 사례로 한정 | [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) |
| `PowerUserAccess` 정의 | `NotAction`으로 IAM·Organizations 제외, 서비스 연결 역할 생성 권한만 예외 | 기본 버전 v12에서 `account:*`가 제외 대상에 추가되고, 예외 허용 작업이 9개로 늘었습니다 | [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html) |
| 웹 ID 페더레이션 | "Amazon, Facebook, Google 및 OIDC 호환 공급자" | **OIDC 페더레이션**으로 명칭이 바뀌었고, 특정 소셜 공급자 대신 OIDC 호환 IdP 전반을 대상으로 설명합니다. 사람 사용자 시나리오에는 Amazon Cognito를 브로커로 검토 | [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html) |
| AWS CLI 출력 형식 | json, yaml, text | json(기본), yaml, yaml-stream, text, table, off의 **6가지** | [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html) |
| 자격 증명 공급자 | 작업별 파라미터 → 환경 변수 → 공유 파일 → 인스턴스 프로파일 | 설정 값 우선순위(6단, Java·Kotlin은 JVM 시스템 속성 포함)와 자격 증명 공급자 체인(IAM Identity Center·컨테이너·IMDS 등)이 분리되어 있습니다 | [Standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) |
| JVM DNS TTL 권장값 | 60초 이하 | **5초.** `networkaddress.cache.ttl`은 보안 속성이므로 `-D` 플래그로 설정할 수 없습니다 | [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html) |
| 재시도 동작 | 지수 백오프를 구현한다는 개념 설명만 | standard(기본)·adaptive·legacy 세 모드로 표준화. `max_attempts` 기본값 3(초기 요청 포함). 2026 동작은 `AWS_NEW_RETRIES_2026=true` 옵트인 필요 | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS Cloud9 | **신규 고객에게 제공 종료.** 기존 고객은 계속 사용 가능 | AWS IDE 툴킷 또는 AWS CloudShell | [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| AWS Toolkit for Eclipse | 별도 문서가 제공되지 않습니다. `toolkit-for-eclipse/v1/user-guide/` 경로 전체가 JetBrains 툴킷 문서로 리다이렉트됩니다 | JetBrains·Visual Studio·VS Code용 AWS Toolkit | [AWS Toolkit for JetBrains 사용 설명서](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| AWS SDK for Java 1.x | **2025년 12월 31일 지원 종료** | AWS SDK for Java 2.x | [AWS SDK for Java 1.x getting started](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| IAM 사용자 장기 액세스 키를 개발 기본 경로로 사용 | 동작하지만 비권장. 예외 사용 사례로만 한정 | IAM Identity Center, IAM 역할, `aws login`, AWS CloudShell | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| 루트 사용자 액세스 키 생성 | 강력히 비권장 | 루트 작업은 콘솔에서 수행. 프로그래밍 방식은 루트 자격 증명으로 `aws login` | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| SDK 재시도 legacy 모드 | 이전 버전 호환 목적만. SDK 간 동작이 일관되지 않고 표준 재시도 할당량이 없습니다 | standard 모드 | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.4 이 자료에서 더한 점

각 항목은 IAM 권한을 실무 수준으로 이해하는 데 필요해서 더했습니다.

| 더한 항목 | 왜 더했는가 | 근거 |
|---|---|---|
| 서비스 제어 정책(SCP)·리소스 제어 정책(RCP) | 권한 경계만으로는 여러 계정 환경의 가드레일을 설명할 수 없어서 더했습니다. 조직 단위로 보안 주체·리소스의 최대 권한을 설정하며, 권한을 부여하지는 않고 멤버 계정 루트에도 적용됩니다 | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| VPC 엔드포인트 정책·세션 정책·AWS RAM 리소스 공유 | 평가에 참여하는 정책 유형을 두 가지로만 알면 실제 평가 결과를 예측할 수 없어서 더했습니다. 세션 정책은 역할 수임 시점에 전달해 세션 권한을 좁힙니다 | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| 역할 세션 지속 시간 수치 | "사용자 지정할 수 있다"만으로는 실무에서 값을 정할 수 없어서 더했습니다. 900~43200초, 기본값 3600초, 역할 체이닝 시 최대 1시간 | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| 교차 계정 이중 평가 | 한쪽 정책만 있으면 교차 계정 액세스가 왜 실패하는지 설명하려고 더했습니다. 양쪽 모두 Allow일 때만 허용됩니다 | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| 루트 사용자 MFA 의무화 | 루트 보호가 이제 의무이고 실습 계정에도 영향을 주므로 더했습니다. 첫 콘솔 로그인 시도로부터 35일 이내 등록, 최대 8개 | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| IAM 정책 시뮬레이터 | 실제 호출로 실패를 보고 역추적하는 방식보다 안전한 검증 수단이라 더했습니다. 실제 요청을 보내지 않고 정책을 평가합니다 | [IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html) |
| IAM Access Analyzer | 부여한 권한이 실제로 안전한지 지속 점검하는 실무 도구라 더했습니다. 외부·내부·미사용 액세스 분석과 100개 이상 정책 검사 | [Using IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html) |
| 마지막 액세스 정보 | 과도한 권한을 찾아 최소 권한으로 좁히는 근거 데이터라 더했습니다. 콘솔 반영 4시간, 서비스 정보 추적 최소 400일 | [Refine permissions using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html) |
| SigV4a 비대칭 서명 | 다중 리전 요청에서 만나는 서명 방식이라 더했습니다. S3 다중 리전 액세스 포인트에 필수이며 SDK·CLI가 자동 전환 | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| `aws login`·AWS CloudShell 사전 인증 | 장기 키를 파일에 저장하지 않는 현재 권장 로컬 개발 경로라 더했습니다. CloudShell은 콘솔 로그인 자격 증명을 자동 사용하고 리전당 1GB 스토리지를 제공합니다 | [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html) |
| 액세스 키 접두사 구분 | 자격 증명이 장기인지 임시인지 한눈에 구분하는 실무 지식이라 더했습니다. `AKIA`는 장기, `ASIA`는 AWS STS 임시 | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| 권한 경계와 `NotPrincipal` 주의 | 실무에서 흔히 걸리는 함정이라 더했습니다. 권한 경계가 붙은 보안 주체에는 `NotPrincipal` + `Deny`가 항상 거부로 작동하므로 `ArnNotEquals` + `aws:PrincipalArn`을 씁니다 | [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) |

### 8.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 데모의 실제 재현 가능성 | 데모 절차의 각 명령과 정책 형식은 API 문서로 확인했지만, 순서대로 실행해 같은 성공·실패 결과가 나오는지는 실행 검증하지 않았습니다. 계정 ID·역할 이름 불일치를 고친 뒤에도 신뢰 정책 설정 등 기술되지 않은 전제가 필요할 수 있습니다 |
| 실습 1의 현재 배포 형태 | 실습 환경에 여전히 Python 실습이 Cloud9에 배포되어 있는지는 확인할 수 없었습니다. Cloud9이 신규 고객에게 제공되지 않는다는 것은 확인했지만, 실습 환경이 어떤 계정으로 제공되고 실제로 Cloud9이 열리는지는 강의 전에 직접 확인하세요 |
| 실습 인프라 구성 | 어젠다 다이어그램이 전제하는 Guacamole·SSH·원격 데스크톱 연결과 CloudFormation 프로비저닝은 AWS 공식 문서의 검증 대상이 아니므로 그대로 옮겼습니다 |
| `api_versions` 설정 | `~/.aws/config` 예시의 `api_versions`(`ec2 = 2015-03-01`, `cloudfront = 2015-09-17`) 항목은 현재 문서에서 확인하지 못했습니다. `retry_mode`·`max_attempts`·`s3` 하위 설정은 확인했습니다 |
| AWS IDE 툴킷 제품군의 변화 | 툴킷 제품군의 구성·명칭 변화가 진행 중일 수 있습니다. 이 문서는 인용한 툴킷 문서 URL의 현재 유효성만 확인했고, 제품 전략 변화는 검증 범위에 넣지 않았습니다 |
