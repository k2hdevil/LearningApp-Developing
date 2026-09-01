# 모듈 13: 애플리케이션 배포

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [DevOps](#2-devops)
3. [코드형 인프라와 배포 도구](#3-코드형-인프라와-배포-도구)
4. [AWS SAM](#4-aws-sam)
5. [SAM 템플릿](#5-sam-템플릿)
6. [SAM 리소스 유형과 커넥터](#6-sam-리소스-유형과-커넥터)
7. [API 액세스 제어](#7-api-액세스-제어)
8. [SAM CLI 설치와 로컬 테스트](#8-sam-cli-설치와-로컬-테스트)
9. [빌드와 배포](#9-빌드와-배포)
10. [배포 전략](#10-배포-전략)
11. [교재 대비 변경 사항](#11-교재-대비-변경-사항)
12. [지식 확인 및 핵심 정리](#12-지식-확인-및-핵심-정리)

> **표기 설명**
>
> - 🆕 원본 강사용 덱에 없는 내용. AWS 공식 문서로 확인한 항목입니다.
> - 🔄 원본 강사용 덱의 내용이 현재와 달라 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [11장](#11-교재-대비-변경-사항)에 정리했습니다.
> - 검증일: 2026년 9월 1일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.
> - 용어를 하나로 통일했습니다. `continuous integration` 은 **지속적 통합**, `continuous delivery` 는 **지속적 전달**, `continuous deployment` 는 **지속적 배포**로 쓰고 약어는 **CI 하나만** 씁니다. `infrastructure as code` 는 **코드형 인프라**, `change set` 은 **변경 세트**, `deployment configuration` 은 **배포 구성**입니다. 교재는 슬라이드 3과 슬라이드 32에서 모듈 목표 문구를 다르게 쓰고, 슬라이드 7과 슬라이드 9에서 프로세스 항목 수가 어긋납니다([11.1절](#111-교재-기술이-사실과-다른-항목)).
> - 교재 템플릿과 CLI 예시를 이 문서에 실을 때 **깨진 표기와 지원 종료된 런타임을 교정**했습니다. 무엇을 고쳤는지는 각 절의 교정 표에 밝혀 두었습니다.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- 기존 소프트웨어 개발 관행과 관련된 위험 파악
- DevOps가 기존 소프트웨어 개발 관행과 관련된 위험을 해결하는 방법 설명
- 서버리스 애플리케이션을 배포하기 위한 AWS Serverless Application Model(AWS SAM) 템플릿 구성
- 다양한 AWS SAM 배포 전략 설명

교재는 이 네 항목을 슬라이드 3(모듈 목표)과 슬라이드 32(모듈 요약)에 싣는데 **문구가 완전히 같지 않습니다.** 2번은 "DevOps**가** … 개발 **관행**"과 "DevOps**에서** … 개발 **방식**"으로 갈리고, 3번은 약어 표기가 다릅니다. 이 문서는 슬라이드 3의 문구를 기준으로 통일했습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

그리고 **네 번째 목표에 대응하는 내용이 덱에 없습니다.** 목표는 "다양한 **AWS SAM** 배포 전략 설명"인데, 배포 전략 섹션(슬라이드 25~26)의 본문은 `Canary` · `Linear` · `All-at-once` 세 단어이고 강사 노트 전체가 AWS CodeDeploy 설명입니다. **SAM 템플릿에서 배포 전략을 선언하는 방법이 덱 어디에도 없습니다.** 이 문서는 그 자리를 [10장](#10-배포-전략)에 공식 문서로 채웠습니다. 이 모듈에서 가장 큰 공백입니다.

### 이 모듈의 위치

교재는 3일차 마지막 모듈로 이 모듈을 배치합니다. 모듈 11에서 만든 서버리스 애플리케이션과 모듈 12에서 붙인 사용자 인증을 **실제로 배포하는** 자리입니다.

| 구분 | 내용 |
|---|---|
| 모듈 11 | 현대적 애플리케이션 구축 — 서버리스 방식을 사용한 웹 애플리케이션 구축의 이점 평가 |
| 모듈 12 | 애플리케이션 사용자에게 액세스 권한 부여 — Amazon Cognito가 AWS 리소스에 대한 사용자 액세스를 제어하는 방법 검토 |
| **모듈 13** | **애플리케이션 배포** — 웹 애플리케이션 배포에 사용되는 AWS 서비스 및 기능 파악 |
| 실습 6 | 캡스톤 - 애플리케이션 구축 완료 |

교재 슬라이드 2(어젠다)는 모듈 12를 "애플리케이션 사용자에게 액세스 권한 부여"로 표기하는데 M12 덱 표지의 부제는 "내 애플리케이션의 사용자에게 액세스 권한 부여하기"입니다. 같은 모듈 이름이 두 덱에서 다릅니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

### 이 모듈에서 다루는 것

교재는 33장의 슬라이드를 일곱 개 섹션으로 나눕니다. 이 문서도 같은 순서를 따릅니다.

| 교재 섹션 | 슬라이드 | 이 문서 |
|---|---|---|
| 표지 · 어젠다 · 모듈 목표 | 1~3 | [1장](#1-모듈-개요) |
| 배포 계획 수립 및 방식 | 4~10 | [2장](#2-devops) · [3장](#3-코드형-인프라와-배포-도구) |
| AWS Serverless Application Model(AWS SAM) | 11~17 | [4장](#4-aws-sam) · [5장](#5-sam-템플릿) · [6장](#6-sam-리소스-유형과-커넥터) · [7장](#7-api-액세스-제어) |
| AWS SAM을 이용한 배포 | 18~24 | [8장](#8-sam-cli-설치와-로컬-테스트) · [9장](#9-빌드와-배포) |
| 배포 전략 | 25~26 | [10장](#10-배포-전략) |
| 데모: AWS SAM | 27~28 | [9.9절](#99-데모-절차) |
| 학습 내용 확인 | 29~30 | [12장](#12-지식-확인-및-핵심-정리) |
| 요약 | 31~33 | [1.2절](#12-용어-정리) · [12장](#12-지식-확인-및-핵심-정리) |

이 덱은 **전반부와 후반부의 성격이 크게 다릅니다.** 슬라이드 4~10은 DevOps 개념이고 다이어그램 레이블에 긴 강사 노트가 붙습니다. 슬라이드 11~26은 AWS SAM 실무이고 YAML 템플릿과 CLI 명령이 등장합니다. 코드·CLI가 나오는 슬라이드는 14 · 15 · 20 · 21 · 22 · 23 · 24 일곱 개이고, 표는 슬라이드 17(액세스 제어 메커니즘 비교) **하나뿐**입니다.

실습(Lab)이 없는 모듈입니다. 데모(슬라이드 27~28)만 있고 **슬라이드 28에는 강사 노트가 전혀 없습니다.** 이 문서는 그 자리를 [9.9절](#99-데모-절차)에 명령 단위 절차로 채웠습니다.

### 1.1 이 모듈에서 가장 크게 달라진 것 🆕

교재가 쓰인 뒤 AWS SAM에 추가·변경된 것이 많습니다. 강의에서 가장 먼저 마주칠 아홉 가지를 미리 짚어 둡니다. 각 항목의 근거는 해당 절에 있습니다.

| 달라진 것 | 교재 | 현재 |
|---|---|---|
| SAM 배포 전략 | 모듈 목표 4번이 요구하지만 **배포 전략 섹션에 AWS SAM이 한 번도 나오지 않음** | `AWS::Serverless::Function` 의 **`AutoPublishAlias` + `DeploymentPreference`**(`Type` · `Alarms` · `Hooks`)로 선언합니다. 사전 정의 `Type` 값은 아홉 개이고 SAM 표기는 `All-at-once` 가 아니라 **`AllAtOnce`** 입니다 ([10.4절](#104-sam-템플릿에서-배포-전략-선언하기)) |
| `Transform` 값 | `AWS::serverless-2016-10-31` — **소문자 `s`** | **`AWS::Serverless-2016-10-31`**(대문자 `S`). 이 선언은 AWS SAM 템플릿 파일에 **필수**이며 CloudFormation 템플릿을 SAM 템플릿으로 식별합니다 ([5.2절](#52-transform-선언)) |
| `Globals` 섹션 | "AWS SAM 템플릿 내에서 사용할 **전역 변수**를 설정합니다" | 여러 리소스가 **공통으로 쓰는 속성**을 한 번만 선언해 상속시키는 섹션입니다. 값을 파라미터화하는 섹션은 **`Parameters`** 입니다 ([5.3절](#53-globals-섹션)) |
| `sam build --use-container` | 강사 노트 "일부 언어(예: .NET 또는 Python)에서는 사용할 수 없습니다" | 현재 `sam build` 참조 문서에는 **언어·런타임에 따라 못 쓴다는 서술이 없습니다.** 오히려 `--build-image` 설명이 Python 빌드 이미지를 `--use-container` 와 함께 쓰는 예로 듭니다. 명시된 제약은 **`--build-in-source` 와의 비호환**뿐입니다 ([9.2절](#92-sam-build-와-컨테이너-빌드)) |
| `sam package` | `sam build && sam package --s3-bucket <bucket_name>` 를 배포 전 단계로 제시 | 문서가 참고(Note)로 **`sam deploy` 가 `sam package` 의 기능을 암시적으로 수행**한다고 명시합니다. 버킷은 **`--resolve-s3`** 로 자동 생성할 수 있습니다 ([9.3절](#93-sam-package-는-이제-별도-단계가-아니다)) |
| 구성 파일 | `sam deploy --template-file deploy.yml` 에 "# 구성 파일을 사용하여 배포" 주석 | `--template-file` 은 **템플릿**을 지정하는 옵션입니다. 구성 파일은 **`--config-file`**(기본값 `samconfig.toml`)이고 `sam deploy --guided` 의 산출물입니다 ([9.4절](#94-sam-deploy-와-samconfigtoml)) |
| SAM 리소스 유형 | **6개** | **13개.** 교재 이후 `Application` · `CapacityProvider` · **`Connector`** · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector` 가 추가되었습니다 ([6.1절](#61-리소스-유형-13개)) |
| SAM CLI 명령 | **7개** | **24개.** `validate` · `sync` · `delete` · `list` · `logs` · `traces` · `publish` · `pipeline` · `remote invoke` 등이 있고 `sam local` 하위 명령도 3개가 아니라 **6개**입니다 ([8.3절](#83-cli-명령-24개)) |
| Lambda 런타임 | 슬라이드 14 · 15 · 22는 `python3.8`, 슬라이드 21은 `python3.9` | **둘 다 지원 종료되었습니다.** `python3.8` 은 2024년 10월 14일, `python3.9` 는 2025년 12월 15일입니다 ([11.3절](#113-비권장지원-종료된-항목)) |

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — 출처: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 1.2 용어 정리 🆕

**이 덱에는 용어(Terminology) 슬라이드가 없습니다.** M12는 슬라이드 36에 용어 정의가 있었지만 M13은 모듈 요약 다음에 바로 "감사합니다"로 끝납니다. DevOps · 지속적 통합 · 코드형 인프라 · 변경 세트 · 배포 구성처럼 이 모듈에서 새로 나오는 용어를 정리하는 자리가 없어, 공식 문서 정의로 용어 절을 만들었습니다.

| 용어 | 정의 |
|---|---|
| 지속적 통합(continuous integration, CI) | 팀 구성원이 버전 제어 시스템을 사용해 자신의 작업을 `main` 브랜치 같은 같은 위치에 자주 통합하는 소프트웨어 개발 방식. 각 변경이 빌드·검증되어 통합 오류를 가능한 한 빨리 감지합니다. **코드를 자동으로 빌드하고 테스트하는 데 초점**을 둡니다 |
| 지속적 전달(continuous delivery) | 릴리스 프로세스가 자동화된 소프트웨어 개발 방법론. 모든 소프트웨어 변경이 자동으로 빌드·테스트되고 프로덕션에 배포되며, 프로덕션으로의 최종 푸시 전에 **사람, 자동화된 테스트 또는 비즈니스 규칙** 중 하나가 최종 푸시 시점을 결정합니다. 지속적 통합과 달리 **프로덕션까지의 전체 릴리스 프로세스를 자동화**합니다 |
| 코드형 인프라(infrastructure as code, IaC) | 버전 제어나 지속적 통합 같은 코드·소프트웨어 개발 기법을 사용해 인프라를 프로비저닝하고 관리하는 방식. AWS SAM 문서는 AWS SAM 자체를 "코드형 인프라로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크"로 규정합니다 |
| 스택(stack) | CloudFormation 템플릿으로 프로비저닝되는 리소스 모음. 스택을 삭제하면 스택의 모든 리소스가 삭제되므로 **리소스 모음을 하나의 단위로 관리**합니다 |
| 변경 세트(change set) | 스택에 제안한 변경이 실행 중인 리소스에 어떤 영향을 줄지 미리 보여 주는 것. CloudFormation은 **사용자가 변경 세트를 실행하기로 결정할 때만** 스택을 변경합니다 |
| 배포 구성(deployment configuration) | 배포 중 CodeDeploy가 사용하는 규칙과 성공·실패 조건의 집합. EC2/온프레미스 · AWS Lambda · Amazon ECS 중 어디에 배포하는지에 따라 다릅니다 |
| 배포 유형(deployment type) | 현재 위치 배포(in-place)와 블루/그린 배포 두 가지. **AWS Lambda와 Amazon ECS 배포는 모두 블루/그린**이고 현재 위치 배포를 쓸 수 없습니다 |
| AWS SAM 프로젝트 | `sam init` 이 만드는 디렉터리. AWS SAM 템플릿, 애플리케이션 코드, 그 밖의 구성 파일을 담습니다 |

> — 출처: [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html)

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

> — 출처: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

> — 출처: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

> — 출처: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

> — 출처: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

---

## 2. DevOps

### 2.1 전통적인 소프트웨어 배포의 문제점

교재 슬라이드 5는 전통적 배포 방식이 안고 있는 문제 여섯 가지를 제시합니다. 이 목록이 이 모듈 전체의 출발점이고, 뒤에서 다루는 도구·전략은 각각 이 문제 중 하나를 겨냥합니다. 마지막 열에 이 문서의 대응 절을 적어 두었습니다.

| # | 교재가 제시한 문제 | 강사 노트의 설명 | 이 문서에서 다루는 해법 |
|---|---|---|---|
| 1 | 일관적이지 않은 패키징 | 소프트웨어가 동일한 시스템을 이용해 일관적으로 구축되지 않으면 패키징도 일관적이지 못합니다. 개발자 랩톱에서 구축했을 때 특히 그렇습니다 | [9.2절](#92-sam-build-와-컨테이너-빌드) 컨테이너 빌드 |
| 2 | 일관적이지 않은 소프트웨어 배포 | 공식 배포 메커니즘이 부실해도 일관성 문제가 생깁니다 | [9.4절](#94-sam-deploy-와-samconfigtoml) 구성 파일 기반 배포 |
| 3 | 업그레이드하기 어려움 | 위 두 요소가 업그레이드를 어렵고 까다롭게 만듭니다 | [5장](#5-sam-템플릿) 템플릿으로 선언 |
| 4 | 롤백 계획 없음 | 위 두 요소가 롤백도 어렵게 만듭니다 | [9.5절](#95-변경-세트와-롤백) · [10.8절](#108-롤백-경로-정리) |
| 5 | 인적 오류 발생 가능성 | 사람이 수동으로 실행해야 하는 모든 프로세스는 오류가 발생하기 쉽습니다 | [9.5절](#95-변경-세트와-롤백) 변경 세트 검토 |
| 6 | 수동 승인 방식 | 비자동화 승인 프로세스는 배포 속도를 낮출 수 있습니다 | [2.3절](#23-devops-프로세스-세-가지) 지속적 전달 |

교재는 이 여섯 문제를 제기하고 답을 DevOps에서 찾습니다. 다만 **4번 "롤백 계획 없음"에 대응하는 해법이 덱 어디에도 없습니다.** 롤백을 어떻게 구성하는지가 한 번도 나오지 않습니다. 이 문서는 [9.5절](#95-변경-세트와-롤백)의 CloudFormation 롤백 옵션과 [10.8절](#108-롤백-경로-정리)의 경보 기반 자동 롤백으로 그 자리를 채웠습니다.

### 2.2 DevOps 문화

교재 슬라이드 6은 DevOps 문화를 여덟 항목으로 제시합니다. **슬라이드 본문 레이블과 강사 노트 항목 제목이 세 군데에서 갈리므로**(예: 본문 "고객의 요구에 집중" vs 노트 "고객 요구 사항 중심") 이 문서는 **본문 레이블 기준**으로 통일했습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

| # | 항목 | 강사 노트의 설명 |
|---|---|---|
| 1 | 고객의 요구에 집중 | 사람·프로세스·도구를 조율하고 고객을 무엇보다 중시하는 개발을 이끕니다. **피드백 루프**로 고객과 꾸준히 접촉하며 조정합니다 |
| 2 | 고도의 협업 환경 조성 | 개발과 운영을 통합하여 **사일로를 없애고** 목표를 조정하며 공동의 목표를 달성합니다 |
| 3 | 지속적인 실험과 학습 | 최신 모범 사례를 지속적으로 적용합니다 |
| 4 | 모든 곳에 보안 적용 | 개발 프로세스를 **시작할 때부터** 보안을 통합합니다 |
| 5 | 가능한 한 자동화 | 반복 태스크를 자동화해 팀이 혁신에 집중하게 합니다 |
| 6 | 소규모 개발 | 애플리케이션 아키텍처를 **소규모의 소결합된 구성 요소**로 설계합니다 |
| 7 | 잦은 릴리스 | 고객 요구와 비즈니스 목표에 빠르게 대응할 **민첩성**을 확보합니다 |
| 8 | 지속적인 개선 | 신중하게 정의된 **지표**로 진행 상황을 모니터링하고 프로세스·도구를 평가합니다 |

교재가 강사 노트에서 참조로 제시하는 AWS 제품 페이지 'DevOps란 무엇입니까?'는 **현재도 응답하며** 페이지 제목은 `What is DevOps?` 입니다. 그 페이지의 `DevOps Cultural Philosophy` 절이 기술하는 내용은 교재의 여덟 항목 중 여러 개와 방향이 같습니다.

| 문서 서술 | 교재의 대응 항목 |
|---|---|
| 전통적으로 사일로화된 개발과 운영 두 팀 사이의 장벽을 없앤다. 두 팀이 함께 일해 개발자의 생산성과 운영의 신뢰성을 모두 최적화한다 | 2번 고도의 협업 환경 조성 |
| 자주 소통하고 효율을 높이고 고객에게 제공하는 서비스의 품질을 개선하려 노력한다 | 1번 고객의 요구에 집중 |
| 자신이 맡은 역할이나 직함의 전통적 범위를 넘어 서비스에 대한 **완전한 주인 의식**을 갖는다. 품질 보증·보안 팀도 긴밀히 통합될 수 있다 | 4번 모든 곳에 보안 적용 |
| DevOps 모델을 쓰는 조직은 조직 구조와 무관하게 **전체 개발·인프라 수명 주기**를 자기 책임의 일부로 본다 | 8번 지속적인 개선 |
| 근본적인 방식 하나는 **매우 자주 작은 업데이트를 수행**하는 것이고, 이는 각 배포의 위험을 낮추며 오류를 일으킨 마지막 배포를 식별할 수 있어 버그를 더 빠르게 해결하도록 돕는다 | 6번 소규모 개발 · 7번 잦은 릴리스 |

> — 출처: [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/)

### 2.3 DevOps 프로세스 세 가지 🔄

교재 슬라이드 7은 지속적 통합 · 지속적 전달 · 지속적 배포 세 프로세스를 제시하고 강사 노트에서 각각을 한 줄로 정의합니다. **두 가지를 교정했습니다.**

| 프로세스 | 교재 강사 노트 | 확인된 내용 |
|---|---|---|
| 지속적 통합(CI) | 소프트웨어를 구축한 다음 자동 테스트를 위해 비프로덕션 환경에 배포합니다 | 방향이 같습니다. 문서는 팀 구성원이 버전 제어 시스템으로 자신의 작업을 같은 위치에 자주 통합하고 각 변경이 빌드·검증되어 **통합 오류를 가능한 한 빨리 감지**한다고 기술하며, **코드를 자동으로 빌드하고 테스트하는 데 초점**을 둔다고 명시합니다 |
| 지속적 전달 | 프로덕션에 배포하기 **전에 수동 승인 단계를 거쳐야** 합니다 | 🔄 **수동 승인은 필수 조건이 아닙니다.** 문서는 프로덕션으로의 최종 푸시 전에 **사람, 자동화된 테스트 또는 비즈니스 규칙** 중 하나가 최종 푸시 시점을 결정한다고 기술합니다. 또 모든 성공적인 변경을 즉시 릴리스할 수 있지만 **모든 변경을 바로 릴리스해야 하는 것은 아니라고** 명시합니다 |
| 지속적 배포(CD) | 구축에서 프로덕션 배포에 이르는 완전 자동화된 파이프라인입니다 | 🔄 **이 서술은 확인하지 못했습니다.** 조회한 CodePipeline 문서는 continuous integration과 continuous delivery만 정의하고 continuous deployment를 정의하지 않습니다([11.5절](#115-검증하지-못한-항목)) |

**약어 배정도 교재 안에서 문제를 일으킵니다.** 강사 노트는 지속적 통합에 `CI`, 지속적 배포에 `CD` 를 배정하고 지속적 전달에는 약어를 주지 않습니다. 영어에서 `continuous delivery` 와 `continuous deployment` 모두 `CD` 로 줄여 쓰이므로 이 배정은 혼동을 부릅니다. **이 문서는 약어를 `CI` 하나만 쓰고 나머지 둘은 전체 용어로 적습니다.**

또 슬라이드 7은 세 프로세스를 제시하는데 [2.5절](#25-devops-방식)에서 볼 슬라이드 9의 DevOps 방식 여섯 개에는 **지속적 배포가 없습니다.** 같은 개념군을 다루면서 항목 수가 어긋납니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

두 개념의 차이를 표로 정리하면 이렇습니다.

| 구분 | 지속적 통합 | 지속적 전달 |
|---|---|---|
| 초점 | 코드를 자동으로 빌드하고 테스트 | 프로덕션까지의 **전체** 릴리스 프로세스 자동화 |
| 무엇을 자주 하는가 | 팀 구성원이 작업을 같은 위치(`main` 브랜치 등)에 자주 통합 | 모든 소프트웨어 변경이 자동으로 빌드·테스트되고 프로덕션에 배포 |
| 목적 | 통합 오류를 가능한 한 빨리 감지 | 성공적인 변경을 즉시 릴리스할 수 있는 상태 유지 |
| 최종 푸시 결정 | 해당 없음 | 사람 · 자동화된 테스트 · 비즈니스 규칙 중 하나 |

> — 출처: [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html)

### 2.4 DevOps를 도입하는 이유

교재 슬라이드 8은 DevOps의 이점 여섯 가지를 제시합니다. **이 여섯 항목은 이번 검증에서 근거를 확보하지 못했습니다.** 참조 URL은 응답했지만 가져온 본문에 이점 절이 없었습니다. 그래서 아래 표는 **교재 서술 그대로**이고 공식 문서 확인 항목이 아닙니다([11.5절](#115-검증하지-못한-항목)).

| # | 이점 | 교재 강사 노트 |
|---|---|---|
| 1 | 속도 | 고객을 위해 더 빠르게 혁신하고 시장 변화에 더 잘 적응합니다. 예를 들어 **마이크로서비스와 지속적 전달**을 사용하면 팀이 서비스를 주도적으로 운영해 업데이트를 더 빠르게 릴리스할 수 있습니다 |
| 2 | 빠른 전달 | 릴리스의 빈도와 속도를 개선합니다. **지속적 통합과 지속적 전달은 빌드에서 배포까지 릴리스 프로세스를 자동화하는 방식**입니다 |
| 3 | 신뢰성 | 애플리케이션 업데이트와 인프라 변경의 품질을 보장합니다. 지속적 통합·지속적 전달로 각 변경이 제대로 작동하며 안전한지 테스트하고, **모니터링과 로깅**으로 실시간 성능 정보를 얻습니다 |
| 4 | 확장성 | 인프라와 개발 프로세스를 대규모로 운영·관리합니다. **코드형 인프라**를 사용하면 개발·테스트·프로덕션 환경을 반복 가능하고 효율적으로 관리할 수 있습니다 |
| 5 | 협업 강화 | **주인 의식과 책임**을 강조하는 문화 모델로 효과적인 팀을 만듭니다. 개발자와 운영 팀 간 **핸드오버 기간**을 줄이거나 코드가 실행되는 환경을 고려해 코드를 작성할 수 있습니다 |
| 6 | 보안 | 제어를 유지하고 규정을 준수하면서 신속하게 진행합니다. **자동화된 규정 준수 정책, 세분화된 제어, 구성 관리 기술**을 사용하고 **코드형 인프라와 코드형 정책**으로 규모에 따라 규정 준수를 정의·추적합니다 |

여섯 항목 중 3번(모니터링과 로깅) · 4번(코드형 인프라) · 6번(구성 관리)에서 언급되는 방식은 [2.5절](#25-devops-방식)에서 다시 나옵니다. 즉 슬라이드 8은 "왜"이고 슬라이드 9는 "무엇으로"입니다.

### 2.5 DevOps 방식 🔄

교재 슬라이드 9는 DevOps 방식 여섯 가지를 제시합니다. 원문 텍스트 상자에는 `모니터링및 로깅` · `커뮤니케이션및 협업` 처럼 **"및" 앞의 공백이 빠져 있고** `코드형` 과 `인프라` 가 두 줄로 쪼개져 있습니다. 이 문서는 정상 표기로 옮겼습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

| # | 방식 | 강사 노트의 정의 |
|---|---|---|
| 1 | 지속적 통합 | 자동화된 빌드·테스트 후 개발자가 코드 변경 사항을 **중앙 리포지토리에 정기적으로 병합**하는 방식. 목표는 ① 버그를 더 빠르게 발견·해결 ② 소프트웨어 품질 향상 ③ 업데이트 검증·릴리스 시간 단축 |
| 2 | 지속적 전달 | 프로덕션에 릴리스하기 위한 코드 변경이 **자동으로 빌드·테스트·준비**되는 방식. 구축 단계 이후 모든 변경을 테스트 또는 프로덕션 환경에 배포합니다. 적절히 구현되면 표준화된 테스트 프로세스를 통과한 **빌드 아티팩트**를 항상 보유합니다 |
| 3 | 마이크로서비스 | 단일 애플리케이션을 **작은 서비스의 집합**으로 구축하는 설계 접근 방식. 각 서비스는 자체 프로세스에서 실행되고 보통 **HTTP 기반 API** 같은 경량 메커니즘으로 통신하며 범위는 **단일 목적**에 따라 결정됩니다 |
| 4 | 코드형 인프라 | **버전 제어나 지속적 통합 같은 코드·소프트웨어 개발 기법**으로 인프라를 프로비저닝·관리하는 방식. 클라우드의 **API 기반 모델**로 프로그래밍 방식으로 대규모 인프라와 상호 작용합니다 |
| 5 | 모니터링 및 로깅 | 지표와 로그를 모니터링해 애플리케이션·인프라 성능이 최종 사용자 경험에 미치는 영향을 확인합니다. **근본 원인에 대한 인사이트**를 얻고, 24시간 가동을 위해 **능동적 모니터링**이 중요합니다 |
| 6 | 커뮤니케이션 및 협업 | DevOps의 **주요 문화적 측면** 중 하나. 도구와 자동화로 개발·운영의 워크플로와 책임을 합쳐 협업이 이루어집니다. 채팅 애플리케이션, 문제 추적 시스템, 프로젝트 추적 시스템과 위키를 사용합니다 |

🔄 **문서는 여기에 하나를 더 제시합니다.** `What is DevOps?` 페이지는 인프라 자동화 방식으로 코드형 인프라와 함께 **구성 관리(configuration management)** 를 제시하며, 이 두 방식이 컴퓨팅 리소스를 **탄력적으로** 유지하도록 돕는다고 기술합니다. 교재의 여섯 개 목록에는 구성 관리가 없습니다.

문서가 확인해 주는 항목과 그렇지 않은 항목을 구분하면 이렇습니다.

| 교재 항목 | 문서에서 확인 |
|---|---|
| 지속적 통합 | 확인 |
| 지속적 전달 | 확인 |
| 마이크로서비스 | 확인. 크고 복잡한 시스템을 단순하고 독립적인 프로젝트로 분리하고 각 서비스의 범위가 **단일 목적·기능**으로 정해진다고 기술 |
| 코드형 인프라 | 확인. 단 **독립된 IaC 정의 페이지는 조회하지 않았고** `What is DevOps?` 페이지의 언급만 확인했습니다([11.5절](#115-검증하지-못한-항목)) |
| 모니터링 및 로깅 | 확인. 엔지니어가 애플리케이션·인프라 성능을 추적해 문제에 빠르게 대응하도록 돕는다고 기술 |
| 커뮤니케이션 및 협업 | 문화 철학 절의 사일로 제거·빈번한 소통 서술로 대응 |
| — | 🆕 **구성 관리** — 문서가 제시하지만 교재 목록에 없음 |

문서는 또 **마이크로서비스와 릴리스 빈도 증가의 조합**이 배포 수를 크게 늘려 운영 과제를 만들고, 지속적 통합·지속적 전달 같은 방식이 이를 해결한다고 기술합니다. 교재는 여섯 방식을 나란히 놓기만 하고 이 인과를 설명하지 않습니다.

> — 출처: [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/)

---

## 3. 코드형 인프라와 배포 도구

### 3.1 코드형 인프라

교재는 코드형 인프라를 슬라이드 9의 여섯 방식 중 하나로 설명하고, 슬라이드 30 지식 확인 2번에서 "코드형 인프라는 중요한 DevOps 방식입니다"(참)로 다시 확인합니다. 그런데 **교재는 IaC를 개념으로만 설명하고 도구와 연결하지 않습니다.** CloudFormation은 슬라이드 10의 도구 목록에 이름만 등장하고, AWS SAM이 IaC 도구라는 점은 덱 어디에도 없습니다.

문서 기준으로 이 모듈의 IaC 연결은 다음과 같습니다.

| 개념 | 문서 서술 |
|---|---|
| 코드형 인프라란 | 버전 제어나 지속적 통합 같은 코드·소프트웨어 개발 기법으로 인프라를 프로비저닝·관리하는 방식 |
| CloudFormation의 역할 | 원하는 AWS 리소스를 모두 기술한 **템플릿**을 만들면 CloudFormation이 리소스를 프로비저닝·구성합니다. 개별 리소스를 하나하나 만들고 **무엇이 무엇에 종속되는지 파악할 필요가 없습니다** |
| 왜 버전 제어와 이어지는가 | 템플릿이 텍스트 파일이므로 소스 코드의 리비전을 관리하듯 **버전 제어 시스템으로 인프라 변경을 추적**할 수 있고, 변경을 되돌려야 하면 **이전 버전의 템플릿**을 쓸 수 있습니다 |
| AWS SAM의 위치 | AWS SAM은 **코드형 인프라로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크**입니다 |

네 번째 줄이 [2.1절](#21-전통적인-소프트웨어-배포의-문제점)의 4번 문제("롤백 계획 없음")에 대한 첫 번째 답입니다. 교재 강사 노트는 CloudFormation을 소개하면서 이 점을 다루지 않습니다.

> — 출처: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 3.2 DevOps용 AWS 도구

교재 슬라이드 10은 도구 아홉 개를 나열하고 강사 노트에서 여덟 개를 한 줄로 설명합니다(아홉 번째는 "그 외 다수"). 조회한 문서로 확인한 것과 확인하지 못한 것을 구분해 표시했습니다.

| 서비스 | 교재 강사 노트 | 확인 상태 |
|---|---|---|
| AWS CodeBuild | 종량제 모델에서 지속적인 크기 조정을 통해 코드를 구축하고 테스트합니다 | **확인.** 문서는 CodeBuild를 클라우드의 **완전관리형 빌드 서비스**로 규정하고, 소스 코드를 컴파일하고 단위 테스트를 실행하고 배포할 준비가 된 아티팩트를 생성하며 **소비한 빌드 분(minutes)에 대해서만 지불**한다고 기술합니다 |
| AWS CodeArtifact | 안전하고 확장 가능하며 저렴한 소프트웨어 아티팩트 관리입니다 | **확인하지 못했습니다** ([11.5절](#115-검증하지-못한-항목)) |
| AWS CodeDeploy | 코드 배포를 자동화합니다 | **확인.** [10장](#10-배포-전략)에서 배포 유형·컴퓨팅 플랫폼·배포 구성을 자세히 다룹니다 |
| AWS CodePipeline | 지속적 전달 파이프라인을 자동화합니다 | **확인.** 문서는 CodePipeline을 소프트웨어를 릴리스하는 데 필요한 단계를 **모델링·시각화·자동화**하는 **지속적 전달 서비스**로 규정합니다 |
| AWS Config | AWS 리소스의 구성을 측정, 감사 및 평가합니다 | **확인하지 못했습니다** ([11.5절](#115-검증하지-못한-항목)) |
| AWS CloudFormation | 관련 AWS 및 서드 파티 리소스의 모음을 생성하고 순서에 따라 예측 가능한 방식으로 프로비저닝·관리하는 방법을 제공합니다 | **확인.** 템플릿·스택·종속성 자동 처리 서술과 일치합니다. 다만 현재 문서의 제목과 본문은 서비스를 접두사 없이 **`CloudFormation`** 으로 표기합니다 |
| Amazon CloudWatch | 모든 AWS 리소스에서 데이터를 수집하고, 데이터에 액세스하고, 상관 관계를 파악합니다 | **확인하지 못했습니다** ([11.5절](#115-검증하지-못한-항목)) |
| AWS X-Ray | 프로덕션 또는 분산 애플리케이션을 분석하고 디버깅합니다 | **확인하지 못했습니다** ([11.5절](#115-검증하지-못한-항목)) |
| 그 외 다수 | (설명 없음) | — |

교재 강사 노트의 CloudFormation 설명 문장에는 "손쉽게 관련 AWS 및 서드 파티 리소스의 모음을 **쉽게** 생성하고"처럼 같은 뜻의 부사가 중복됩니다. 위 표는 중복을 정리한 표기입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

CodePipeline 문서의 `DevOps pipeline example` 은 이 세 서비스가 실제로 어떻게 맞물리는지 보여 줍니다. 교재 슬라이드 30 지식 확인 3번("AWS CodePipeline은 AWS CodeBuild와 AWS CodeDeploy를 오케스트레이션할 수 있습니다" — 참)의 근거입니다.

| 스테이지 | 작업 | 문서 서술 |
|---|---|---|
| Source | GitHub 소스 작업 | 개발자가 커밋을 푸시하면 CodePipeline이 변경을 감지해 파이프라인 실행이 시작됩니다. 소스 작업의 **출력 아티팩트**가 다음 스테이지 작업의 **입력 아티팩트**가 됩니다 |
| Prod (1) | 빌드 작업 | CodeBuild에서 만든 빌드 프로젝트 |
| Prod (2) | 테스트 작업 | CodeBuild에서 만든 단위 테스트 프로젝트 |
| Prod (3) | 배포 작업 | 애플리케이션을 프로덕션 환경에 배포 |
| Prod (4) | 테스트 작업 | CodeBuild에서 만든 통합 테스트 프로젝트 |

문서는 CodeBuild를 **CodePipeline 파이프라인의 빌드 또는 테스트 스테이지에 빌드 작업 또는 테스트 작업으로 추가**할 수 있다고 명시합니다. CodeBuild는 CodeBuild 콘솔이나 CodePipeline 콘솔에서 실행할 수 있고 AWS CLI·AWS SDK로 자동화할 수도 있습니다.

> — 출처: [What is AWS CodeBuild?](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html)

> — 출처: [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)

> — 출처: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

### 3.3 IaC 도구 비교 🆕

교재는 AWS SAM과 CloudFormation의 관계를 "변환한다"로만 설명하고([4.3절](#43-작동-방식-변환)) AWS CDK는 언급하지 않습니다. 문서는 **언제 무엇을 쓰라는 안내**를 제시합니다.

| 상황 | 문서의 안내 |
|---|---|
| 템플릿 호환성을 유지하면서 **서버리스 리소스 정의를 단순화**하고 싶다 | CloudFormation 대신 **AWS SAM** |
| 인프라를 프로그래밍 방식이 아니라 **선언적으로** 기술하고 싶다 | AWS CDK 대신 **AWS SAM** |
| 이미 CDK로 애플리케이션을 만들고 있다 | **둘을 함께** 쓸 수 있습니다. AWS SAM CLI의 로컬 테스트 기능으로 CDK 애플리케이션을 보완합니다 |

세 도구의 관계를 정리하면 이렇습니다.

| 도구 | 무엇인가 | 이 모듈에서의 역할 |
|---|---|---|
| CloudFormation | 템플릿으로 AWS 리소스를 모델링·프로비저닝하는 서비스. 리소스 모음을 **스택**이라는 하나의 단위로 관리 | AWS SAM이 변환한 템플릿을 **실제로 실행하는 쪽**. 변경 세트와 롤백도 여기에 있습니다([9.5절](#95-변경-세트와-롤백)) |
| AWS SAM | 코드형 인프라로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크. **CloudFormation의 확장**이며 축약 구문을 제공 | 이 모듈의 주제 |
| AWS CDK | (문서가 비교 대상으로 제시) 인프라를 **프로그래밍 방식**으로 기술 | SAM CLI의 로컬 테스트로 보완 가능 |

문서가 제시하는 AWS SAM 사용 시나리오는 다섯 가지입니다.

| 시나리오 | 내용 |
|---|---|
| 서버리스 애플리케이션 | Lambda 함수, Lambda durable functions, API Gateway API, DynamoDB 테이블 등을 최소한의 코드로 정의 |
| CloudFormation 보강 | 기존 CloudFormation 템플릿에 서버리스 구성 요소를 더합니다. **SAM 리소스와 표준 CloudFormation 리소스가 같은 템플릿에서 함께 동작**합니다 |
| 로컬 개발·테스트 | [8장](#8-sam-cli-설치와-로컬-테스트) |
| 서버리스 CI/CD | `sam pipeline` 계열 명령이 여기에 대응합니다([8.3절](#83-cli-명령-24개)) |
| 마이그레이션 | 콘솔에서 만든 리소스를 코드형 인프라로 전환 |

두 번째와 다섯 번째 시나리오는 교재에 없습니다.

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 3.4 소스 리포지토리가 목록에 없다 🆕

교재 슬라이드 9는 지속적 통합을 "코드 변경 사항을 **중앙 리포지토리**에 정기적으로 병합"으로 정의합니다. 그런데 **슬라이드 10의 도구 목록에는 소스 리포지토리 서비스가 하나도 없습니다.** 그 중앙 리포지토리를 무엇으로 두는지 덱이 답하지 않습니다.

조회한 CodePipeline 문서의 `DevOps pipeline example` 은 소스 스테이지를 **GitHub 리포지토리**로 구성하고 GitHub 소스 작업을 씁니다. 즉 현재 문서의 예시가 제시하는 중앙 리포지토리는 GitHub입니다.

| 항목 | 상태 |
|---|---|
| 문서 예시의 소스 | GitHub 리포지토리 + GitHub 소스 작업. 커밋 푸시를 감지해 파이프라인 실행이 시작됩니다 |
| AWS CodeCommit | **확인하지 못했습니다.** 개발자 안내서·FAQ·문서 검색을 모두 시도했지만 신규 고객 제공 중단 안내를 찾지 못했습니다. 추측으로 채우지 않았습니다([11.5절](#115-검증하지-못한-항목)). 교재 슬라이드 10의 도구 목록에 CodeCommit은 **등장하지 않습니다** |

> — 출처: [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)

---

## 4. AWS SAM

### 4.1 AWS SAM이란 무엇인가

교재 슬라이드 12의 본문은 한 줄입니다. "AWS SAM은 서버리스 애플리케이션을 배포하는 데 사용하는 오픈 소스 프레임워크입니다." 문서는 이를 조금 더 좁혀 규정합니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇인가 | **코드형 인프라(IaC)로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크** |
| 어떻게 동작하는가 | AWS SAM의 **축약 구문(shorthand syntax)** 으로 CloudFormation 리소스와 특수한 서버리스 리소스를 선언하면 **배포 중에** 인프라로 변환됩니다 |
| SAM 템플릿의 성격 | 서버리스 리소스 정의를 위한 **단순화된 구문을 제공하는 CloudFormation의 확장** |
| 프로젝트란 | `sam init` 이 만드는 디렉터리. AWS SAM 템플릿, 애플리케이션 코드, 그 밖의 구성 파일을 담습니다 |

교재 본문의 "배포하는 데 사용하는"보다 문서의 "코드형 인프라로 **구축하는**"이 더 넓습니다. SAM은 배포만 하는 도구가 아니라 작성·빌드·배포·테스트·모니터링 전 주기를 다룹니다([8.3절](#83-cli-명령-24개)).

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 4.2 두 구성 요소

교재 슬라이드 12는 AWS SAM을 두 구성 요소로 나눕니다. 문서도 같은 두 가지를 제시합니다.

| 구성 요소 | 교재 강사 노트 | 문서 서술 |
|---|---|---|
| AWS SAM 템플릿 사양 | 서버리스 애플리케이션을 구성하는 **함수, API, 권한, 구성 및 이벤트**를 설명하는 효율적인 구문을 제공합니다. 배포 가능하고 버전 지정된 **단일 엔터티**로 다룹니다 | 서버리스 리소스 정의를 위한 단순화된 구문을 제공하는 **CloudFormation의 확장** |
| AWS SAM CLI | AWS SAM 템플릿에서 정의된 서버리스 애플리케이션을 구축하는 도구 | 서버리스 애플리케이션의 **개발·로컬 테스트·배포**를 돕는 명령줄 도구 |

교재 강사 노트는 CLI로 할 수 있는 일을 네 가지로 제시합니다. **첫 항목의 명령 이름이 덱 어디에도 없습니다.**

| # | 교재 강사 노트 | 해당 명령 |
|---|---|---|
| 1 | AWS SAM 템플릿 파일이 사양에 맞게 작성되었는지 확인합니다 | 🆕 **`sam validate`**. 교재는 이 명령 이름을 한 번도 제시하지 않습니다([8.5절](#85-sam-validate)) |
| 2 | Lambda 함수를 로컬로 호출합니다 | `sam local invoke` ([8.7절](#87-sam-local-invoke-와-도커)) |
| 3 | Lambda 함수 디버그 단계를 수행합니다 | `sam local` 계열 ([8.6절](#86-sam-local-하위-명령-여섯-개)) |
| 4 | 서버리스 애플리케이션을 패키지하고 AWS 클라우드로 배포합니다 | `sam deploy`. **패키징은 이제 `sam deploy` 에 포함됩니다**([9.3절](#93-sam-package-는-이제-별도-단계가-아니다)) |

문서가 제시하는 **주요 기능** 다섯 가지 중 뒤의 세 개는 교재에 없습니다.

| 주요 기능 | 교재에 있는가 |
|---|---|
| 더 적은 코드로 인프라 코드를 빠르게 정의 | 있음 |
| AWS SAM CLI로 작성·빌드·배포·테스트·모니터링 전 주기 관리 | 부분적으로 있음(모니터링 없음) |
| 🆕 **AWS SAM 커넥터**로 리소스 간 권한을 빠르게 프로비저닝 | 없음 ([6.3절](#63-커넥터)) |
| 🆕 **`sam sync`** 로 개발 중 로컬 변경을 클라우드에 계속 동기화 | 없음 ([9.6절](#96-sam-sync-로-개발-반복-줄이기)) |
| 🆕 AWS SAM CLI로 **Terraform** 서버리스 애플리케이션의 Lambda 함수·계층 로컬 디버깅·테스트 | 없음 |

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

> — 출처: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

### 4.3 작동 방식: 변환

교재 슬라이드 13은 다이어그램 한 장으로 변환 흐름을 보여 줍니다. **이 서술은 현재 문서와 일치합니다.**

| 교재 슬라이드 13 | 문서 확인 |
|---|---|
| AWS SAM은 자체 템플릿(**YAML 또는 JSON**)에 있는 리소스를 상응하는 AWS CloudFormation 템플릿으로 **변환**합니다 | 일치. 문서는 템플릿 사양의 성격 중 하나로 **변환적(Transformational)** 을 들고, AWS SAM이 템플릿을 CloudFormation을 통해 인프라를 프로비저닝하는 데 필요한 코드로 변환하는 복잡한 작업을 수행한다고 기술합니다 |
| 그런 다음 CloudFormation 템플릿을 적용하여 AWS 리소스를 만들고 업데이트합니다 | 일치 |
| 다이어그램 순서: AWS SAM 템플릿 → AWS CloudFormation 템플릿 → AWS 리소스 | 일치 |

문서가 제시하는 템플릿 사양의 네 가지 성격은 다음과 같습니다.

| 성격 | 내용 |
|---|---|
| CloudFormation 위에 구축됨 | AWS SAM 템플릿에서 **CloudFormation 구문을 직접** 쓸 수 있습니다 |
| CloudFormation의 확장 | 같은 템플릿 안에서 **CloudFormation 구문과 AWS SAM 구문을 함께** 쓸 수 있습니다 |
| 추상적인 축약 구문 | 더 적은 줄로 같은 인프라를 기술합니다 |
| 변환적 | AWS SAM이 축약 구문을 CloudFormation 구문으로 확장합니다 |

두 번째 항목이 교재 슬라이드 30 지식 확인 4번("AWS SAM 템플릿은 AWS CloudFormation 템플릿의 확장입니다" — 참)의 근거입니다.

🆕 **변환이 얼마나 늘어나는지도 문서에 있습니다.** 문서의 예시는 Lambda 함수 하나, HTTP API 하나, `SimpleTable` 하나, 커넥터 하나로 구성된 **23줄**의 AWS SAM 템플릿이며, 배포 중에 이 23줄이 **200줄이 넘는** CloudFormation 구문으로 변환된다고 기술합니다. 무엇으로 확장되는지도 명시합니다.

| AWS SAM 리소스 | 변환된 CloudFormation 리소스 |
|---|---|
| `AWS::Serverless::Function` | `AWS::Lambda::Function` + `AWS::IAM::Role`(`ManagedPolicyArns` 에 `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`) + `AWS::Lambda::Permission` |
| `HttpApi` 이벤트 | `AWS::ApiGatewayV2::Api`(논리 ID `ServerlessHttpApi`) + `AWS::ApiGatewayV2::Stage`(`$default` 스테이지, `AutoDeploy` `true`) |
| `AWS::Serverless::SimpleTable` | `AWS::DynamoDB::Table`(`id` 를 `HASH` 키로 하는 문자열 속성, `BillingMode` `PAY_PER_REQUEST`) |

SAM이 만든 리소스에는 `Metadata` 의 `SamResourceId` 와 `lambda:createdBy=SAM` 태그가 붙습니다.

🔄 **교재는 변환이 "언제" 일어나는지 명확히 하지 않습니다.** 문서는 변환이 **배포 중(during deployment)** 수행된다고 기술하며, 이것이 [5.2절](#52-transform-선언)의 `Transform` 선언이 필요한 이유입니다. 템플릿을 CloudFormation에 배포할 때 CloudFormation이 그 선언을 보고 서버리스 변환을 적용합니다.

> — 출처: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

### 4.4 언제 AWS SAM을 쓰는가 🆕

교재는 SAM을 쓰는 상황을 따로 정리하지 않습니다. [3.3절](#33-iac-도구-비교)의 비교와 함께 보면 판단 기준이 정리됩니다.

| 판단 지점 | 선택 |
|---|---|
| 서버리스 리소스를 최소한의 코드로 정의하고 싶다 | AWS SAM |
| 이미 CloudFormation 템플릿이 있고 서버리스 구성 요소만 더하고 싶다 | AWS SAM. **두 구문이 같은 템플릿에서 함께 동작**합니다 |
| 로컬에서 Lambda 함수를 호출·디버깅하고 싶다 | AWS SAM CLI ([8.7절](#87-sam-local-invoke-와-도커)) |
| 서버리스 CI/CD 파이프라인을 구성하고 싶다 | AWS SAM(`sam pipeline`) |
| 콘솔에서 만든 리소스를 코드형 인프라로 옮기고 싶다 | AWS SAM |
| 인프라를 프로그래밍 언어로 기술하고 싶다 | AWS CDK. 단 SAM CLI의 로컬 테스트로 보완 가능 |
| Terraform으로 서버리스 애플리케이션을 만들고 있다 | AWS SAM CLI로 Lambda 함수·계층을 로컬 디버깅·테스트할 수 있습니다 |

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 4.5 AWS Serverless Application Repository 🆕

교재는 이 서비스를 전혀 다루지 않습니다. SAM 애플리케이션을 공유하는 경로이고 `sam publish` 명령([8.3절](#83-cli-명령-24개))과 `AWS::Serverless::Application` 리소스 유형([6.1절](#61-리소스-유형-13개))이 여기에 연결되므로, SAM을 주제로 하는 모듈에서 짚어 둘 가치가 있습니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇인가 | 개발자와 기업이 AWS 클라우드에서 서버리스 애플리케이션을 **빠르게 찾고 배포하고 게시**할 수 있게 하는 서비스 |
| 공유 범위 | 커뮤니티 전체에 **공개**로, 또는 팀·조직 안에서 **비공개**로 공유 |
| 게시 방법 | AWS Management Console · AWS SAM CLI · AWS SDK로 코드를 업로드하며, 코드와 함께 **매니페스트 파일(AWS SAM 템플릿)** 을 업로드합니다 |
| 통합 | **AWS Lambda 콘솔과 깊이 통합**되어 있습니다 |
| 탐색 방법 | 카테고리 키워드(웹·모바일 백엔드·데이터 처리 애플리케이션·챗봇 등)로 찾아보거나 **이름·게시자·이벤트 소스**로 검색 |
| 제공 상태 | 조회 시점에 **정상 제공 중**입니다. 페이지에 신규 고객 제공 중단 안내가 없습니다 |

[5.7절](#57-sam-정책-템플릿)과도 연결됩니다. 문서는 **정책 템플릿을 쓰는 AWS Serverless Application Repository의 AWS SAM 애플리케이션은 배포할 때 특별한 고객 확인(customer acknowledgment)이 필요하지 않다**고 기술합니다.

> — 출처: [What Is the AWS Serverless Application Repository?](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html)

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

---

## 5. SAM 템플릿

### 5.1 템플릿 섹션 구성 🔄

교재 슬라이드 14는 SAM 템플릿 전문을 처음 보여 주면서 세 줄(`Transform` · `Globals` · `Resources`)에 주석을 붙입니다. **교재는 어떤 섹션이 필수인지 구분하지 않습니다.** 문서는 명시합니다.

| 섹션 | 필수 여부 | 내용 |
|---|---|---|
| `Transform` | **필수** | 이 선언이 CloudFormation 템플릿 파일을 AWS SAM 템플릿 파일로 **식별**합니다 ([5.2절](#52-transform-선언)) |
| `Globals` | 선택 | AWS SAM 고유 섹션. 여러 리소스에 공통인 속성을 한 번 선언 ([5.3절](#53-globals-섹션)) |
| `Description` | 선택 | CloudFormation 템플릿의 같은 섹션에 대응 |
| `Metadata` | 선택 | 같음 |
| `Parameters` | 선택 | 같음. 여기 선언한 객체는 `sam deploy --guided` 가 **추가 프롬프트를 표시**하게 만듭니다 |
| `Mappings` | 선택 | 같음 |
| `Conditions` | 선택 | 같음 |
| `Resources` | **필수** | CloudFormation 리소스와 AWS SAM 리소스를 **섞어 담을 수 있습니다** |
| `Outputs` | 선택 | 같음 |

문서는 **`Transform` 과 `Resources` 두 섹션만 필수**라고 명시합니다(Only the Transform and Resources sections are required). 나머지는 모두 선택이고, 그 밖의 모든 섹션은 같은 이름의 CloudFormation 템플릿 섹션에 대응합니다.

SAM 템플릿과 CloudFormation 템플릿의 차이는 딱 세 가지입니다.

| 차이 | 내용 |
|---|---|
| `Transform` 선언 | AWS SAM 템플릿에는 필수. CloudFormation 템플릿에는 없어도 됩니다 |
| `Globals` 섹션 | AWS SAM 고유. **CloudFormation 템플릿에는 대응 섹션이 없습니다** |
| `Resources` 섹션 | AWS SAM 템플릿의 `Resources` 에는 두 종류 리소스를 섞을 수 있습니다 |

섹션 순서와 우선순위에 관한 규칙도 있습니다.

| 규칙 | 내용 |
|---|---|
| 섹션 순서 | 어떤 순서로든 넣을 수 있습니다. 단 언어 확장을 쓸 때는 **`AWS::LanguageExtensions` 를 서버리스 변환(`AWS::Serverless-2016-10-31`)보다 앞에** 두어야 합니다 |
| 파라미터 값 우선순위 | `sam deploy` 의 **`--parameter-overrides`** 로 전달한 값과 **구성 파일**의 항목이 AWS SAM 템플릿 파일의 항목보다 **우선**합니다 |

교재 슬라이드 14 템플릿의 첫 줄 `AWSTemplateFormatVersion: '2010-09-09'` 는 문서의 SAM 템플릿 섹션 목록에는 없습니다. 다만 다른 SAM 문서 페이지의 템플릿 예시에 이 줄이 그대로 등장하므로 **교재 표기가 틀린 것은 아닙니다.**

교재 슬라이드 16 강사 노트가 참조로 제시한 `sam-specification-template-anatomy.html` 은 **현재도 유효하며** 페이지 제목은 `AWS SAM template anatomy` 입니다.

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

### 5.2 Transform 선언 🔄

교재 슬라이드 14의 템플릿 두 번째 줄은 이렇습니다.

```yaml
# 교재 슬라이드 14 표기 — serverless 의 첫 글자가 소문자입니다
Transform: AWS::serverless-2016-10-31
```

문서가 명시하는 값은 **대문자 `S`** 입니다.

```yaml
# 문서가 명시하는 값 — 대문자 S 이고 이 선언은 필수입니다
Transform: AWS::Serverless-2016-10-31
```

| 항목 | 교재 | 확인된 내용 |
|---|---|---|
| 값 | `AWS::serverless-2016-10-31` | **`AWS::Serverless-2016-10-31`** |
| 필수 여부 | 언급 없음 | **필수(required)** |
| 역할 | "AWS CloudFormation에 이것이 AWS SAM 템플릿이라고 알립니다" | 방향이 같습니다. 문서는 이 선언이 **CloudFormation 템플릿 파일을 AWS SAM 템플릿 파일로 식별한다**고 기술합니다 |

**교재 안에서도 표기가 갈립니다.** 같은 코드 블록의 리소스 유형은 `Type: AWS::Serverless::Function` 으로 대문자 `S` 를 씁니다. 한 블록 안에서 같은 단어의 대소문자가 다릅니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

이 오타가 실무에서 위험한 이유는 분명합니다. 변환 선언이 인식되지 않으면 `AWS::Serverless::*` 리소스가 확장되지 않고, 그러면 CloudFormation은 알 수 없는 리소스 유형을 만난 상태가 됩니다. **수강생이 교재 템플릿을 그대로 옮겨 적으면 배포가 실패합니다.**

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

### 5.3 Globals 섹션 🔄

교재 슬라이드 14의 주석 상자는 `Globals:` 를 이렇게 설명합니다. "AWS SAM 템플릿 내에서 사용할 **전역 변수**를 설정합니다."

🔄 **`Globals` 는 변수를 선언하는 섹션이 아닙니다.** 문서는 여러 리소스가 **공통으로 쓰는 속성**을 한 번만 선언해 상속시키는 섹션으로 기술합니다. 예를 들어 동일한 `Runtime` · `Memory` · `VPCConfig` · `Environment` · `Cors` 구성을 가진 `AWS::Serverless::Function` 리소스가 여럿이면, 모든 리소스에 정보를 중복하는 대신 `Globals` 에 한 번 선언하고 리소스가 상속하게 합니다.

| 구분 | `Globals` | `Parameters` |
|---|---|---|
| 무엇을 하는가 | 여러 리소스가 공통으로 쓰는 **속성**을 한 번 선언해 상속 | 템플릿의 **값을 파라미터화** |
| 배포 시 동작 | 리소스 속성으로 상속 | `sam deploy --guided` 가 추가 프롬프트 표시, `--parameter-overrides` 로 덮어쓰기 |
| CloudFormation 대응 | **없음**(AWS SAM 고유) | 있음 |

교재가 `Globals` 안에 적은 내용도 변수가 아닙니다. `Api` 의 `MethodSettings` 이므로 **리소스 속성의 공통값**입니다. 이 예시 자체는 유효합니다. `MethodSettings` 는 `Globals` 의 `Api` 에 지원되는 속성 목록에 있습니다.

```yaml
# 교재 슬라이드 14 의 Globals 블록 — 예시 자체는 유효합니다
# 이 템플릿의 모든 Api 리소스가 아래 MethodSettings 를 상속합니다
Globals:
  Api:
    MethodSettings:
      - LoggingLevel: INFO
```

🆕 **`Globals` 를 상속하는 리소스 유형은 여덟 개입니다.** 교재는 목록을 제시하지 않습니다.

| # | 리소스 유형 | 교재 슬라이드 16에 있는가 |
|---|---|---|
| 1 | `AWS::Serverless::Api` | 있음 |
| 2 | `AWS::Serverless::CapacityProvider` | **없음** |
| 3 | `AWS::Serverless::Function` | 있음 |
| 4 | `AWS::Serverless::HttpApi` | 있음 |
| 5 | `AWS::Serverless::SimpleTable` | 있음 |
| 6 | `AWS::Serverless::StateMachine` | 있음 |
| 7 | `AWS::Serverless::MicrovmImage` | **없음** |
| 8 | `AWS::Serverless::NetworkConnector` | **없음** |

목록에 없는 리소스·속성은 지원되지 않습니다. 문서는 그 이유를 두 가지로 듭니다. ① 잠재적 보안 문제를 열거나 ② 템플릿을 이해하기 어렵게 만들기 때문입니다.

`Globals` 의 `Api` 에 지원되는 속성은 다음과 같습니다.

| 속성 |
|---|
| `AccessLogSetting` · `Auth` · `BinaryMediaTypes` · `CacheClusterEnabled` · `CacheClusterSize` |
| `CanarySetting` · `Cors` · `DefinitionUri` · `Domain` · `EndpointConfiguration` |
| `EndpointAccessMode` · `GatewayResponses` · `MethodSettings` · `MinimumCompressionSize` · `Name` |
| `OpenApiVersion` · `PropagateTags` · `SecurityPolicy` · `TracingEnabled` · `Variables` |

🆕 **재정의 규칙이 데이터 유형에 따라 다릅니다.** 교재에 없는 내용이고 실무에서 자주 걸리는 지점입니다.

| 데이터 유형 | 재정의 동작 |
|---|---|
| 원시 유형(문자열 · 숫자 · 불리언) | `Resources` 섹션의 값이 `Globals` 의 값을 **대체** |
| 맵 | **병합**되며 중복 키는 `Resources` 항목이 우선 |
| 리스트 | `Globals` 의 항목이 `Resources` 의 리스트 **앞에 추가**(additive) |

가장 중요한 제약은 이것입니다. **리소스는 `Globals` 에 선언한 속성에 새 값을 줄 수는 있지만 그 속성을 제거할 수는 없습니다.** 따라서 일부 리소스만 쓰는 속성은 `Globals` 에 선언하지 말아야 합니다.

또 AWS SAM은 `Events` 섹션에 API를 선언하면 **암시적 API(implicit API)** 를 만들고, `Globals` 로 암시적 API의 모든 속성을 재정의할 수 있습니다.

> — 출처: [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html)

### 5.4 교재 슬라이드 14 템플릿 교정 🔄

교재 슬라이드 14의 템플릿을 그대로 옮기면 다음과 같습니다. **슬라이드의 텍스트 상자에는 들여쓰기가 없어 각 줄이 별개 문단으로 들어가 있으므로**, 순서를 유지하면서 YAML로 읽히도록 들여쓰기만 복원했습니다. 원문에는 계층 정보가 없습니다.

```yaml
# 교재 슬라이드 14 원문 (들여쓰기만 복원). 교정 전입니다
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::serverless-2016-10-31
Globals:
  Api:
    MethodSettings:
      - LoggingLevel: INFO
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.8
      Policies: AmazonDynamoDBReadOnlyAccess
      Events:
        listNotes:
          Type: Api
          Properties:
            Path: /notes
            Method: get
```

강사 노트는 이 템플릿을 이렇게 설명합니다. AWS Lambda에서 list 함수를 정의하고, 런타임·함수 코드 위치·핸들러를 지정하며, `AmazonDynamoDBReadOnlyAccess` IAM 정책을 연결해 함수가 Amazon DynamoDB를 쿼리할 수 있게 하고, 마지막으로 함수를 Amazon API Gateway 엔드포인트의 `/notes` 에 연결합니다.

**무엇을 고쳤는지 밝힙니다.**

| # | 교재 표기 | 교정 | 이유 |
|---|---|---|---|
| 1 | `Transform: AWS::serverless-2016-10-31` | `Transform: AWS::Serverless-2016-10-31` | 문서가 명시하는 값은 대문자 `S` ([5.2절](#52-transform-선언)) |
| 2 | `Runtime: python3.8` | `Runtime: python3.12` | `python3.8` 런타임은 **2024년 10월 14일 지원 종료** ([11.3절](#113-비권장지원-종료된-항목)) |
| 3 | `Policies: AmazonDynamoDBReadOnlyAccess` | `Policies: - DynamoDBReadPolicy: TableName: !Ref pollyNotesTable` | 관리형 정책은 **계정의 모든 테이블**에 읽기 권한을 줍니다. 정책 템플릿은 대상 테이블로 좁힙니다 ([5.7절](#57-sam-정책-템플릿)) |
| 4 | (없음) | `pollyNotesTable` 리소스 정의 추가 | 슬라이드 15가 `!Ref pollyNotesTable` 을 쓰지만 정의가 덱에 없습니다 |

교정한 템플릿입니다.

```yaml
# 교정본. Transform 대소문자, 런타임, 권한 지정 방식을 고쳤습니다
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

# 여러 Api 리소스가 공통으로 쓸 속성을 한 번만 선언합니다
Globals:
  Api:
    MethodSettings:
      - LoggingLevel: INFO

Resources:
  # 노트를 담을 테이블. 교재 템플릿이 참조하지만 정의가 없어 추가했습니다
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/          # 템플릿 위치를 기준으로 해석되는 상대 경로
      Handler: app.lambda_handler
      Runtime: python3.12              # 지원되는 런타임으로 교정
      Policies:
        # 관리형 정책 이름 대신 정책 템플릿을 써서 이 테이블로 권한을 좁힙니다
        - DynamoDBReadPolicy:
            TableName: !Ref pollyNotesTable
      Events:
        listNotes:
          Type: Api                    # 명시적 API 리소스가 없으면 암시적 API 가 만들어집니다
          Properties:
            Path: /notes
            Method: get
```

주석 상자 3번의 번역도 정리했습니다. 교재는 "참조된 관리형 IAM 정책, 런타임, 코드 정의된 핸들러를 사용하여 AWS Lambda 함수를 생성합니다"로 옮겼는데 구조가 불명확합니다. 세 항목으로 나누면 이렇습니다.

| 교재의 뭉친 표현 | 나눈 표기 |
|---|---|
| 참조된 관리형 IAM 정책 | 참조하는 IAM 정책(`Policies`) |
| 런타임 | 런타임(`Runtime`) |
| 코드 정의된 핸들러 | 코드에 정의된 핸들러(`Handler`) |

`Events` 의 `Type: Api` 에 대해 교재 주석은 "Amazon API Gateway를 생성하고 필요한 매핑과 권한을 처리합니다"라고만 적습니다. 문서 기준으로 이때 만들어지는 것은 **암시적 API** 이며, `HttpApi` 이벤트를 쓰면 `AWS::ApiGatewayV2::Api`(논리 ID `ServerlessHttpApi`)와 `$default` 스테이지가 만들어집니다([4.3절](#43-작동-방식-변환)). 명시적 API 리소스를 참조하려면 `RestApiId` 를 씁니다([7.3절](#73-auth-속성으로-선언하기)).

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 5.5 교재 슬라이드 15 템플릿 교정 🔄

교재 슬라이드 15는 Delete 함수를 정의하는 템플릿 조각을 보여 줍니다. **이 슬라이드에 문제가 가장 많이 몰려 있습니다.**

```yaml
# 교재 슬라이드 15 원문 (들여쓰기만 복원). 교정 전입니다
...
deleteFunction:
  Type: AWS::Serverless::Function
  Properties:
    Description: Delete function
    CodeUri: delete-function/
    Handler: app.lambda_handler
    Runtime: python3.8
    Role: !Sub arn:aws:iam::${AWS::AccountId}:role/DynamoDBReadRole
    Environment:
      Variables:
        TABLE_NAME: !Ref pollyNotesTable
    Events:
      listNotes:
        Type: Api
        Properties: ...
```

강사 노트는 이렇게 설명합니다. "오른쪽 섹션에는 AWS Lambda에서 **Delete 함수**를 정의하는 AWS SAM 템플릿이 나와 있습니다. 런타임, 함수 코드의 위치와 핸들러를 설정합니다. 코드 위치는 AWS SAM 템플릿이 포함된 `template.yml` 파일에 따라 달라집니다. 이 예에서 코드는 **`deleteFunction` 이라는 폴더**에 있습니다."

**무엇을 고쳤는지 밝힙니다.**

| # | 교재 표기 | 교정 | 이유 |
|---|---|---|---|
| 1 | `Role: ... DynamoDBReadRole` | `Policies: - DynamoDBCrudPolicy: TableName: !Ref pollyNotesTable` | **삭제에는 쓰기 권한이 필요합니다.** 읽기 역할로는 항목을 삭제할 수 없습니다 |
| 2 | `Runtime: python3.8` | `Runtime: python3.12` | `python3.8` 런타임 지원 종료 |
| 3 | `Events: listNotes:` | `Events: deleteNote:` | Delete 함수인데 이벤트 이름이 슬라이드 14의 `listNotes` 와 같습니다. 복사 흔적입니다 |
| 4 | 강사 노트 "`deleteFunction` 이라는 폴더" | 논리 ID는 `deleteFunction`, 코드 폴더는 `delete-function/` | `deleteFunction` 은 폴더 이름이 아니라 **논리 리소스 ID** 입니다 |
| 5 | `Properties: ...` (잘림) | `Path` · `Method` 를 채움 | 원문이 생략 부호로 끊겨 있습니다 |
| 6 | `!Ref pollyNotesTable`(정의 없음) | 테이블 리소스를 함께 표기 | 참조 대상이 덱에 없습니다 |
| 7 | 레이블 "SAM 템플릿" | "AWS SAM 템플릿" | 다른 슬라이드는 모두 "AWS SAM 템플릿"입니다 |

교정한 템플릿입니다.

```yaml
# 교정본. 권한을 쓰기 가능한 정책 템플릿으로 바꾸고 이벤트 이름을 함수 목적에 맞췄습니다
Resources:
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  deleteFunction:                      # 논리 리소스 ID (폴더 이름이 아닙니다)
    Type: AWS::Serverless::Function
    Properties:
      Description: Delete function
      CodeUri: delete-function/        # 실제 코드 폴더
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        # 삭제에는 쓰기 권한이 필요합니다. Crud 는 생성·읽기·업데이트·삭제를 포함합니다
        - DynamoDBCrudPolicy:
            TableName: !Ref pollyNotesTable
      Environment:
        Variables:
          TABLE_NAME: !Ref pollyNotesTable
      Events:
        deleteNote:                    # 함수 목적에 맞게 이름을 바꿨습니다
          Type: Api
          Properties:
            Path: /notes/{id}
            Method: delete
```

**권한 지정 방식이 슬라이드 14와 다른 이유를 덱이 설명하지 않습니다.** 슬라이드 14는 `Policies`, 슬라이드 15는 `Role` 입니다. 두 속성의 관계는 [5.6절](#56-함수-권한-policies-와-role)에서 다룹니다. 핵심만 미리 말하면, **`Role` 을 설정하면 `Policies` 가 무시됩니다.**

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

### 5.6 함수 권한 Policies 와 Role 🔄

교재는 두 슬라이드에서 서로 다른 방식으로 함수에 권한을 줍니다. 차이와 우선순위를 설명하지 않으므로 여기서 정리합니다.

| 속성 | 문서 서술 |
|---|---|
| `Policies` | 이 함수의 권한 정책이며 함수의 **기본 IAM 실행 역할에 추가**됩니다(appended to the function's default IAM execution role). 단일 값 또는 값 목록을 받습니다 |
| `Role` | 이 함수의 실행 역할로 쓸 IAM 역할의 ARN. **CloudFormation에서는 필수지만 AWS SAM에서는 필수가 아닙니다** |
| 둘 다 지정하면 | 🔄 문서가 명시합니다. **`Role` 속성을 설정하면 `Policies` 는 무시됩니다**(If you set the Role property, this property is ignored) |
| 아무것도 지정하지 않으면 | 논리 ID가 **`<함수-논리-ID>Role`** 인 역할이 자동으로 만들어집니다 |

`Role` 을 직접 지정하면 함께 못 쓰는 속성이 생깁니다.

| 속성 | 조건 |
|---|---|
| `RolePath` | 역할이 **자동 생성될 때만** 씁니다. `Role` 로 역할을 지정할 때는 쓰지 않습니다 |
| `PermissionsBoundary` | 역할이 **자동 생성될 때만** 동작합니다 |
| `Tracing` | `Active` 또는 `PassThrough` 로 지정하고 **`Role` 을 설정하지 않으면** AWS SAM이 만들어 주는 실행 역할에 `arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess` 정책을 추가합니다 |

🆕 **`Policies` 가 받는 값은 네 종류입니다.** 교재는 관리형 정책 이름 하나만 예로 듭니다.

| # | 값의 종류 | 예 |
|---|---|---|
| 1 | **AWS SAM 정책 템플릿** | `DynamoDBReadPolicy` 에 `TableName` 지정 ([5.7절](#57-sam-정책-템플릿)) |
| 2 | AWS 관리형 또는 고객 관리형 정책의 **ARN** | `arn:aws:iam::aws:policy/...` |
| 3 | 정해진 목록에 있는 AWS 관리형 정책의 **이름** | 교재의 `AmazonDynamoDBReadOnlyAccess` |
| 4 | YAML 맵으로 작성한 **인라인 IAM 정책** | 템플릿 안에 직접 작성 |

```yaml
# 세 방식의 비교. 같은 함수에 셋을 동시에 쓰라는 뜻이 아닙니다
Resources:
  # (1) 권장 — 정책 템플릿으로 대상 리소스에 한정
  functionA:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-a/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref pollyNotesTable

  # (2) 교재 슬라이드 14 방식 — 관리형 정책 이름. 계정의 모든 테이블에 열립니다
  functionB:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-b/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies: AmazonDynamoDBReadOnlyAccess

  # (3) 교재 슬라이드 15 방식 — 기존 역할 ARN.
  #     Role 을 주면 Policies 는 무시되므로 두 속성을 함께 쓰지 마세요
  functionC:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-c/
      Handler: app.lambda_handler
      Runtime: python3.12
      Role: !Sub arn:aws:iam::${AWS::AccountId}:role/MyExistingExecutionRole
```

`AWS::Serverless::Function` 의 다른 기본값도 교재에 없습니다.

| 속성 | 기본값·규칙 |
|---|---|
| `Timeout` | **3초** |
| `Architectures` | `x86_64` |
| `PackageType` | `Zip`. `Zip` 이면 `CodeUri` 또는 `InlineCode` 중 하나가 **필요**합니다 |
| `CodeUri` | 함수의 Amazon S3 URI, 함수의 **로컬 경로**(예: `hello_world/`), `FunctionCode` 객체를 받습니다 |
| `Runtime` | `PackageType` 이 `Zip` 일 때만 필요하고, 값이 `AWS::Lambda::Function` 의 `Runtime` 속성으로 **그대로 전달**됩니다 |
| `PackageType: Image` | 컨테이너 이미지로 패키징한 함수. 이때는 **`ImageUri` 만 적용되고 `Runtime` · `CodeUri` · `InlineCode` 는 무시**됩니다 |

`DeploymentPreference` 와 `AutoPublishAlias` 를 지정하면 SAM이 리소스를 자동으로 만드는데, 이 내용은 [10.4절](#104-sam-템플릿에서-배포-전략-선언하기)에서 다룹니다.

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 5.7 SAM 정책 템플릿 🆕

교재는 `Policies` 값으로 AWS 관리형 정책 이름 `AmazonDynamoDBReadOnlyAccess` 하나만 제시하고 정책 템플릿을 다루지 않습니다. 정책 템플릿은 **SAM이 권장하는 방식**입니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇인가 | AWS SAM이 Lambda 함수와 AWS Step Functions 상태 머신의 권한을 **애플리케이션이 쓰는 리소스로 좁히기** 위해 제공하는 사전 정의 정책 목록 |
| 몇 개인가 | 정책 템플릿 표에 **79행** |
| 부수 효과 | 정책 템플릿을 쓰는 AWS Serverless Application Repository의 애플리케이션은 배포할 때 **특별한 고객 확인이 필요하지 않습니다** |

**구문 규칙이 하나 있고 이걸 빠뜨리면 빌드가 실패합니다.**

| 규칙 | 내용 |
|---|---|
| 자리표시자가 필요한 템플릿 | 자리표시자 값을 담은 **객체**를 반드시 지정 |
| 자리표시자가 필요 없는 템플릿 | **빈 객체(`{}`)** 를 지정해야 합니다 |
| 빠뜨리면 | `sam build` 실행 시 `Must specify valid parameter values for policy template '<정책-템플릿-이름>'` 오류 |
| 일반 IAM 정책·관리형 정책 | CloudFormation으로 그대로 전달되므로 **빈 객체 없이** 씁니다 |
| 섞어 쓰기 | 한 `Policies` 목록에 관리형 정책과 정책 템플릿을 **함께** 쓸 수 있습니다 |

```yaml
# 정책 템플릿의 구문 규칙
Resources:
  myFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        # 관리형 정책 이름은 그대로 씁니다
        - AmazonSQSFullAccess
        # 자리표시자가 있는 정책 템플릿은 객체로 값을 줍니다
        - DynamoDBCrudPolicy:
            TableName: !Ref pollyNotesTable
        # 자리표시자가 없는 정책 템플릿은 빈 객체를 반드시 붙입니다.
        # 빠뜨리면 sam build 가 실패합니다
        - CloudWatchPutMetricPolicy: {}
```

DynamoDB 관련 정책 템플릿은 일곱 개입니다.

| 정책 템플릿 | 권한 |
|---|---|
| `DynamoDBReadPolicy` | DynamoDB 테이블에 **읽기 전용** 권한 |
| `DynamoDBWritePolicy` | 테이블에 **쓰기 전용** 권한 |
| `DynamoDBCrudPolicy` | 테이블에 **생성·읽기·업데이트·삭제** 권한 |
| `DynamoDBStreamReadPolicy` | DynamoDB 스트림·레코드 설명·읽기 권한 |
| `DynamoDBReconfigurePolicy` | 테이블 재구성 권한 |
| `DynamoDBBackupFullAccessPolicy` | 테이블의 온디맨드 백업에 읽기·쓰기 권한 |
| `DynamoDBRestoreFromBackupPolicy` | 백업에서 테이블 복원 권한 |

교재의 두 함수에 맞는 선택은 다음과 같습니다.

| 교재 함수 | 교재가 준 권한 | 맞는 정책 템플릿 |
|---|---|---|
| 슬라이드 14 `listFunction` | `AmazonDynamoDBReadOnlyAccess`(계정의 모든 테이블) | `DynamoDBReadPolicy` 에 `TableName` 지정 |
| 슬라이드 15 `deleteFunction` | `DynamoDBReadRole`(읽기 역할) | `DynamoDBCrudPolicy` 또는 `DynamoDBWritePolicy` |

새 정책 템플릿 추가를 요청하려면 AWS SAM GitHub 프로젝트의 `develop` 브랜치 `policy_templates.json` 소스 파일에 풀 리퀘스트를 제출하고 이유와 링크를 담은 이슈를 제출합니다.

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

### 5.8 템플릿 파일 이름과 상대 경로 🔄

교재 슬라이드 15 강사 노트는 SAM 템플릿 파일 이름을 `template.yml` 로 적습니다.

| 항목 | 교재 | 확인된 내용 |
|---|---|---|
| 템플릿 파일 이름 | `template.yml` 만 제시 | `sam build` 의 `--template-file`(`--template`, `-t`) 기본값은 **`template.yaml` 또는 `template.yml`** 입니다. 즉 **둘 다** 허용됩니다. `sam validate` 문서는 현재 작업 디렉터리에 이름이 **`template.yaml` · `template.yml` · `template.json`** 인 템플릿이 있으면 옵션이 필요하지 않다고 기술합니다 |
| `sam init` 이 만드는 파일 이름 | — | **확인하지 못했습니다.** CLI가 찾는 기본 이름까지만 확인했습니다([11.5절](#115-검증하지-못한-항목)) |
| `CodeUri` 상대 경로의 기준 | "코드 위치는 AWS SAM 템플릿이 포함된 `template.yml` 파일에 따라 달라집니다" | 취지가 같습니다. 문서는 기본적으로 소스 코드 폴더의 상대 경로가 **AWS SAM 템플릿의 위치를 기준으로** 해석된다고 명시합니다 |

`--base-dir`(`-s`) 옵션으로 그 기준을 바꿀 수 있고, 이 옵션이 적용되는 속성은 다섯 개입니다.

| 리소스 | 속성 |
|---|---|
| `AWS::Serverless::Function` | `CodeUri` |
| `AWS::Serverless::Function` | `Metadata` 리소스 속성 중 `DockerContext` 항목 |
| `AWS::Serverless::LayerVersion` | `ContentUri` |
| `AWS::Lambda::Function` | `Code` |
| `AWS::Lambda::LayerVersion` | `Content` |

`sam build` 문서가 밝히는 다른 기본값도 정리합니다.

| 항목 | 기본값 |
|---|---|
| `--template-file` | `template.yaml` 또는 `template.yml` |
| `--config-file` | 프로젝트 디렉터리 루트의 **`samconfig.toml`** |
| `--config-env` | `default` |
| `--cached` 의 캐시 디렉터리 | `.aws-sam/cache` |
| 빌드 아티팩트 | `.aws-sam/build`. 빌드된 템플릿은 `.aws-sam/build/template.yaml` |

교재 슬라이드 13 강사 노트의 "자체 템플릿(**YAML 또는 JSON**)"도 `sam validate` 의 `--template-file` 설명이 `template.yaml` · `template.yml` · `template.json` 을 받는다는 서술로 뒷받침됩니다.

> — 출처: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

> — 출처: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

---

## 6. SAM 리소스 유형과 커넥터

### 6.1 리소스 유형 13개 🔄

교재 슬라이드 16은 `AWS::Serverless::*` 리소스 유형 여섯 개를 제시합니다. **현재 문서가 나열하는 유형은 열세 개입니다.**

| # | 리소스 유형 | 교재에 있는가 | 무엇인가 |
|---|---|---|---|
| 1 | `AWS::Serverless::Api` | 있음 | API Gateway REST API |
| 2 | `AWS::Serverless::Application` | **없음** 🆕 | 중첩 서버리스 애플리케이션 |
| 3 | `AWS::Serverless::CapacityProvider` | **없음** 🆕 | — |
| 4 | `AWS::Serverless::Connector` | **없음** 🆕 | **두 리소스 사이의 권한을 구성** ([6.3절](#63-커넥터)) |
| 5 | `AWS::Serverless::Function` | 있음 | AWS Lambda 함수 |
| 6 | `AWS::Serverless::GraphQLApi` | **없음** 🆕 | AWS AppSync 계열 |
| 7 | `AWS::Serverless::HttpApi` | 있음 | API Gateway HTTP API |
| 8 | `AWS::Serverless::WebSocketApi` | **없음** 🆕 | — |
| 9 | `AWS::Serverless::LayerVersion` | 있음 | Lambda 계층 |
| 10 | `AWS::Serverless::MicrovmImage` | **없음** 🆕 | — |
| 11 | `AWS::Serverless::NetworkConnector` | **없음** 🆕 | — |
| 12 | `AWS::Serverless::SimpleTable` | 있음 | DynamoDB 테이블 |
| 13 | `AWS::Serverless::StateMachine` | 있음 | AWS Step Functions 상태 머신 |

**교재의 여섯 개는 모두 현재도 유효합니다.** 사라진 것은 없고 일곱 개가 추가되었습니다. 서버리스 애플리케이션 설계에 직접 영향을 주는 것은 `Connector`(리소스 간 권한) · `GraphQLApi` · `WebSocketApi` · `Application`(중첩 서버리스 애플리케이션)입니다.

교재 슬라이드 16 강사 노트의 마지막 문장도 확인했습니다. "이러한 리소스 외에도, AWS SAM 템플릿에서는 **어떤 AWS CloudFormation 리소스든지** 정의할 수 있습니다." 문서는 `AWS SAM also supports CloudFormation resource and property types` 로 같은 내용을 기술합니다. 이 리소스와 속성은 AWS SAM **축약 구문**으로 정의합니다.

> — 출처: [AWS SAM resources and properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-resources-and-properties.html)

### 6.2 리소스와 AWS 서비스 매핑 🔄

교재 슬라이드 16 강사 노트는 매핑 표를 제시하는데 **여섯 유형 중 네 개만 다룹니다.**

| 교재 강사 노트의 매핑 | AWS 서비스 |
|---|---|
| Serverless API | Amazon API Gateway |
| Serverless Function | AWS Lambda |
| Serverless SimpleTable | Amazon DynamoDB |
| Serverless StateMachine | AWS Step Functions |

🔄 **`AWS::Serverless::HttpApi` 와 `AWS::Serverless::LayerVersion` 의 대응 서비스가 없습니다.** 특히 노트가 `Api` 와 `HttpApi` 를 "Serverless API" 하나로 뭉갭니다. 이 두 유형은 [7장](#7-api-액세스-제어)에서 보듯 **지원하는 액세스 제어 메커니즘이 서로 다르므로** 구분해야 합니다. 여섯 유형 전부를 채운 표는 이렇습니다.

| SAM 리소스 유형 | 대응 |
|---|---|
| `AWS::Serverless::Api` | Amazon API Gateway REST API |
| `AWS::Serverless::HttpApi` | Amazon API Gateway **HTTP API**. 변환하면 `AWS::ApiGatewayV2::Api` 와 `AWS::ApiGatewayV2::Stage` 가 만들어집니다 |
| `AWS::Serverless::Function` | AWS Lambda 함수. 변환하면 `AWS::Lambda::Function` + `AWS::IAM::Role` + `AWS::Lambda::Permission` |
| `AWS::Serverless::LayerVersion` | AWS **Lambda 계층**. `ContentUri` 속성을 가집니다 |
| `AWS::Serverless::SimpleTable` | Amazon DynamoDB 테이블. 변환하면 `AWS::DynamoDB::Table` |
| `AWS::Serverless::StateMachine` | AWS Step Functions 상태 머신 |

🔄 **참조 링크도 슬라이드와 맞지 않습니다.** 교재 슬라이드 16 강사 노트는 링크 두 개를 제시하는데, 두 번째가 'API Gateway 리소스 정책으로 API 액세스 관리'입니다. 이 문서는 **슬라이드 17(AWS SAM으로 액세스 제어)의 주제**이고 슬라이드 16은 리소스 유형 목록을 다루는 슬라이드입니다.

| 교재 참조 링크 | 상태 | 맞는 위치 |
|---|---|---|
| AWS SAM 템플릿 구조(`sam-specification-template-anatomy.html`) | **유효.** 페이지 제목은 `AWS SAM template anatomy` | 슬라이드 14 · 16 |
| API Gateway 리소스 정책(`apigateway-resource-policies.html`) | **유효.** 페이지 제목은 `Control access to a REST API with API Gateway resource policies` | **슬라이드 17** |

두 번째 페이지의 내용도 확인했습니다. API Gateway 리소스 정책은 API에 연결해 지정된 프린시펄(보통 IAM 역할 또는 그룹)이 API를 호출할 수 있는지 제어하는 **JSON 정책 문서**이며, 특정 AWS 계정의 사용자 · 지정한 소스 IP 주소 범위나 CIDR 블록 · 지정한 VPC 또는 VPC 엔드포인트에서 API를 안전하게 호출하도록 허용하는 데 쓸 수 있습니다. API Gateway의 어떤 엔드포인트 유형에도 연결할 수 있고, 프라이빗 API에서는 리소스 정책과 VPC 엔드포인트 정책을 함께 씁니다. 리소스 정책은 IAM 자격 증명 기반 정책과 다르며 둘을 함께 쓸 수 있습니다.

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — 출처: [Control access to a REST API with API Gateway resource policies](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-resource-policies.html)

### 6.3 커넥터 🆕

교재는 함수에 권한을 주는 방법으로 `Policies`(슬라이드 14)와 `Role`(슬라이드 15) 두 가지만 제시합니다. **`AWS::Serverless::Connector` 는 교재 이후 추가된 세 번째 길이고, 슬라이드 15의 권한 불일치 같은 실수를 줄이는 수단입니다.**

| 항목 | 문서 서술 |
|---|---|
| 무엇을 하는가 | **두 리소스 사이의 권한을 구성**합니다(Configures permissions between two resources) |
| 구문 두 가지 | **임베디드 커넥터 구문**(소스 리소스 안에 `Connectors` 블록)과 **`AWS::Serverless::Connector` 리소스 구문**(독립 리소스로 선언) |
| 문서의 권장 | 대부분의 사용 사례에 **임베디드 커넥터 구문**. 소스 리소스 안에 있어 읽기·유지가 쉽습니다 |
| 독립 리소스 구문을 쓸 때 | **중첩 스택의 리소스나 공유 리소스**처럼 같은 AWS SAM 템플릿 안에 없는 소스 리소스를 참조할 때 |

속성은 세 개이고 **모두 AWS SAM 고유이며 CloudFormation에 대응 속성이 없습니다.**

| 속성 | 필수 여부 | 값 |
|---|---|---|
| `Destination` | **필수** | 연결 대상 리소스 |
| `Permissions` | **필수** | **`Read`** 또는 **`Write`** 두 개만 |
| `Source` | `AWS::Serverless::Connector` 구문을 쓸 때 필수 | 연결 출발 리소스 |
| `SourceReference` | — | 임베디드 구문에서 소스를 세부 지정 |

`Permissions` 두 값의 뜻은 이렇습니다.

| 값 | 의미 |
|---|---|
| `Read` | 리소스에서 **데이터를 읽도록** 허용하는 IAM 작업을 포함 |
| `Write` | 리소스에 **데이터를 시작·기록하도록** 허용하는 IAM 작업을 포함 |

```yaml
# 임베디드 커넥터 구문 — 문서가 대부분의 사용 사례에 권장하는 방식
Resources:
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  deleteFunction:
    Type: AWS::Serverless::Function
    Connectors:
      # "이 함수가 이 테이블에 Write 한다" 는 의도만 선언하면
      # AWS SAM 이 필요한 IAM 권한을 만들어 줍니다
      MyConn:
        Properties:
          Destination:
            Id: pollyNotesTable
          Permissions:
            - Write
    Properties:
      CodeUri: delete-function/
      Handler: app.lambda_handler
      Runtime: python3.12
```

```yaml
# AWS::Serverless::Connector 리소스 구문 —
# 중첩 스택 리소스나 공유 리소스처럼 같은 템플릿에 소스가 없을 때 씁니다
Resources:
  MyConnector:
    Type: AWS::Serverless::Connector
    Properties:
      Source:
        Id: deleteFunction
      Destination:
        Id: pollyNotesTable
      Permissions:
        - Write
```

세 가지 권한 지정 방식을 나란히 놓으면 이렇습니다.

| 방식 | 무엇을 쓰는가 | 권한 범위 | 교재에 있는가 |
|---|---|---|---|
| 관리형 정책 이름 | `Policies: AmazonDynamoDBReadOnlyAccess` | **계정의 모든 DynamoDB 테이블** | 슬라이드 14 |
| 기존 역할 ARN | `Role: !Sub arn:aws:iam::${AWS::AccountId}:role/...` | 역할에 붙은 정책이 정하는 범위. **`Policies` 는 무시됨** | 슬라이드 15 |
| 정책 템플릿 | `Policies: - DynamoDBReadPolicy: TableName: ...` | 지정한 **테이블 한정** | 없음 🆕 |
| 커넥터 | `Connectors:` 블록에 `Destination` + `Permissions` | 두 리소스 사이의 **의도(Read/Write)** 로 선언 | 없음 🆕 |

> — 출처: [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html)

### 6.4 SimpleTable 이 만드는 테이블 🆕

교재는 `AWS::Serverless::SimpleTable` 을 "Serverless SimpleTable = Amazon DynamoDB" 한 줄로만 매핑합니다. 이 리소스가 실제로 무엇을 만드는지는 다루지 않습니다.

| 항목 | 변환 결과 |
|---|---|
| 만들어지는 리소스 | `AWS::DynamoDB::Table` |
| 키 | **`id` 를 `HASH` 키로 하는 문자열 속성** |
| 과금 모드 | **`BillingMode` `PAY_PER_REQUEST`**(온디맨드) |
| 붙는 메타데이터 | `Metadata` 의 `SamResourceId`, `lambda:createdBy=SAM` 태그 |

즉 `SimpleTable` 은 이름 그대로 **단순한 키-값 테이블**입니다. 복합 키나 보조 인덱스가 필요하면 `AWS::DynamoDB::Table` 을 같은 템플릿에 직접 선언하면 됩니다([5.1절](#51-템플릿-섹션-구성)의 `Resources` 섹션 규칙).

> — 출처: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

---

## 7. API 액세스 제어

### 7.1 메커니즘 여섯 가지

교재 슬라이드 17은 이 덱의 **유일한 표**입니다. **그리고 여섯 행 전부가 현재 문서 표와 정확히 일치합니다.** 강의에서 이 점을 밝히면 유용합니다.

| 액세스 제어 메커니즘 | `AWS::Serverless::HttpApi` | `AWS::Serverless::Api` |
|---|---|---|
| Lambda 권한 부여자 | 지원 | 지원 |
| IAM 권한 | **미지원** | 지원 |
| Amazon Cognito 사용자 풀 | 지원(별표) | 지원 |
| API 키 | **미지원** | 지원 |
| 리소스 정책 | **미지원** | 지원 |
| OAuth 2.0/JWT 권한 부여자 | 지원 | **미지원** |

별표의 뜻도 교재 각주와 같습니다. **Amazon Cognito를 `AWS::Serverless::HttpApi` 리소스 유형의 JSON 웹 토큰(JWT) 발급자로 사용할 수 있습니다.**

교재 표에서 `HttpApi` 의 "IAM 권한" 칸이 비어 있는 것도 문서와 같습니다. **HTTP API는 IAM 권한 부여를 지원하지 않고 `AWS::Serverless::Api` 만 지원합니다.**

교재가 표만 제시하고 넘어간 메커니즘의 정의를 채웁니다.

| 메커니즘 | 문서의 정의 |
|---|---|
| Lambda 권한 부여자 | 이전에 **사용자 지정 권한 부여자(custom authorizer)** 로 불렸습니다. API를 호출하면 클라이언트 애플리케이션이 제공하는 **요청 컨텍스트나 권한 부여 토큰**과 함께 호출되어, 호출자가 요청한 작업을 수행할 권한이 있는지 응답합니다 |
| IAM 권한 | API 호출자가 **IAM 자격 증명으로 인증**되어야 하고, 호출자를 나타내는 IAM 사용자 · 사용자를 포함한 IAM 그룹 · 사용자가 맡는 IAM 역할에 **IAM 정책이 연결되어 있을 때만** 호출이 성공합니다 |
| 리소스 정책 | API에 연결해 지정된 프린시펄이 API를 호출할 수 있는지 제어하는 JSON 정책 문서 ([6.2절](#62-리소스와-aws-서비스-매핑)) |

교재 강사 노트가 참조로 제시한 `serverless-controlling-access-to-apis.html` 은 **현재도 유효하며** 페이지 제목은 `Control API access with your AWS SAM template` 입니다. 강사 노트에는 공백 누락이 있습니다 — "`AWS::Serverless::Api`**리**소스 유형에서"([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

### 7.2 메커니즘 선택 지침 🆕

교재는 여섯 메커니즘을 표로만 놓고 **어느 것을 언제 고르는지** 다루지 않습니다. 문서는 선택 지침을 제시합니다.

| 상황 | 문서의 안내 |
|---|---|
| 권한 부여나 액세스 제어가 없는 **그린필드 프로젝트** | **Amazon Cognito 사용자 풀**이 최선일 수 있습니다. 사용자 풀을 설정하면 **인증과 액세스 제어가 함께** 설정되기 때문입니다 |
| 애플리케이션에 **이미 인증이 설정**되어 있다 | **Lambda 권한 부여자**가 최선일 수 있습니다 |
| 사용자 풀이 지원하지 않는 **사용자 지정 인증·액세스 제어 로직**이 필요하다 | 같음. Lambda 권한 부여자 |

이 지침은 모듈 12에서 다룬 Amazon Cognito와 곧바로 이어집니다. 모듈 12가 "누가 사용자인가"를 다뤘고, 이 절은 그 결과를 **SAM 템플릿에서 API에 붙이는** 자리입니다.

> — 출처: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

### 7.3 Auth 속성으로 선언하기 🆕

교재 슬라이드 17 강사 노트는 "AWS SAM 템플릿에서 권한 부여를 활성화해야 합니다"라고만 적고 **속성 이름을 하나도 제시하지 않습니다.** 실제 속성은 `Auth` 이며 데이터 유형 이름은 `ApiAuth` 입니다.

| 위치 | 속성 |
|---|---|
| `AWS::Serverless::Api` 의 `Properties` | **`Auth`**(데이터 유형 `ApiAuth`) |
| `Auth` 아래 | **`DefaultAuthorizer`** — 기본 권한 부여자 이름 |
| `Auth` 아래 | **`Authorizers`** — 권한 부여자 정의 맵 |
| 함수의 `Api` 이벤트 | **`RestApiId`** — 명시적 API 리소스를 참조 |

```yaml
# Amazon Cognito 사용자 풀로 API 액세스를 제어하는 형태
Resources:
  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Auth:
        # 기본 권한 부여자 이름은 아래 Authorizers 의 키와 같아야 합니다
        DefaultAuthorizer: MyCognitoAuthorizer
        Authorizers:
          MyCognitoAuthorizer:
            UserPoolArn: !GetAtt MyCognitoUserPool.Arn

  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12
      Events:
        listNotes:
          Type: Api
          Properties:
            # RestApiId 로 위에서 만든 명시적 API 를 참조합니다.
            # 이 속성이 없으면 암시적 API 가 따로 만들어집니다
            RestApiId: !Ref MyApi
            Path: /notes
            Method: get
```

🔄 **교재 슬라이드 14·15의 템플릿은 `RestApiId` 없이 암시적 API를 만드는 형태입니다.** 즉 교재 템플릿에는 권한 부여를 붙일 대상 API 리소스가 없습니다. 액세스 제어를 실제로 걸려면 명시적 API 리소스를 선언하고 함수 이벤트에서 참조해야 합니다.

> — 출처: [Amazon Cognito user pool example for AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-cognito-user-pool.html)

### 7.4 오류 응답 사용자 지정 🆕

교재에 없는 내용입니다. 문서는 AWS SAM으로 **일부 API Gateway 오류 응답의 내용을 사용자 지정**할 수 있다고 기술합니다.

| 항목 | 내용 |
|---|---|
| 무엇을 할 수 있는가 | 일부 API Gateway 오류 응답의 내용을 사용자 지정 |
| 지원 리소스 유형 | **`AWS::Serverless::Api` 만** 지원합니다. `AWS::Serverless::HttpApi` 는 지원하지 않습니다 |

[7.1절](#71-메커니즘-여섯-가지)의 표에서 `Api` 와 `HttpApi` 를 갈라 놓은 이유가 하나 더 늘어난 셈입니다. 액세스 제어 메커니즘뿐 아니라 오류 응답 사용자 지정에서도 두 유형이 다릅니다.

> — 출처: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

---

## 8. SAM CLI 설치와 로컬 테스트

### 8.1 사전 요구 사항 🔄

교재 슬라이드 19는 설치 준비를 세 단계(본문)로 제시하고 강사 노트는 네 단계로 셉니다. **본문과 노트의 단계 수가 어긋납니다**([11.1절](#111-교재-기술이-사실과-다른-항목)).

| 교재 본문(3단계) | 교재 강사 노트(4단계) |
|---|---|
| — | 1. AWS 계정을 만듭니다 |
| 1. AWS 보안 인증 정보 구성 | 2. IAM 권한과 AWS 보안 인증 정보를 구성합니다 |
| 2. 도커 설치(**선택 사항**) | 3. 애플리케이션을 로컬로 테스트할 계획이라면 도커를 설치하십시오 |
| 3. AWS SAM CLI 다운로드 및 설치 | 4. AWS SAM CLI를 다운로드하고 설치합니다 |

🔄 **현재 사전 요구 사항 페이지의 단계 구성이 다릅니다.**

| 단계 | 문서 |
|---|---|
| 준비 | AWS 계정 가입 |
| 1단계 | **AWS CLI 설치** |
| 2단계 | AWS CLI로 AWS 자격 증명 구성(`aws configure` 또는 IAM Identity Center의 `aws configure sso` 마법사) |
| 3단계 | **(선택) AWS Toolkit for VS Code 설치** |

무엇이 요구 사항인지도 명시합니다.

| 항목 | 문서 서술 | 교재 |
|---|---|---|
| AWS 계정 | 필요 | 있음 |
| IAM 자격 증명, IAM **액세스 키 페어** | 필요 | "IAM 권한과 AWS 보안 인증 정보" |
| **AWS Command Line Interface(AWS CLI)** | 필요. AWS 자격 증명을 구성하는 데 씁니다 | 🔄 **교재에 없습니다** |
| 도커 | 🔄 **이 페이지에는 도커가 사전 요구 사항으로 나오지 않습니다** | "선택 사항"으로 목록에 넣음 |
| AWS Toolkit for VS Code | (선택) 3단계 | 없음 🆕 |

**그렇다면 도커는 언제 필요한가.** [8.7절](#87-sam-local-invoke-와-도커)에서 보듯 `sam local invoke` 문서는 AWS SAM CLI가 **도커를 사용해 로컬 컨테이너에서 함수를 빌드한 다음 호출**한다고 명시합니다. 즉 도커는 사전 요구 사항 목록에는 없지만 **로컬 테스트를 하려면 사실상 필수**입니다. 교재 본문이 "선택 사항"이라고만 적고 노트가 "로컬로 테스트할 계획이라면"이라는 조건을 붙인 것은 이 사정을 반쯤만 전달한 것입니다.

3단계의 AWS Toolkit for VS Code 정보도 정리합니다.

| 항목 | 내용 |
|---|---|
| 누구를 위한 것인가 | 통합 개발 환경을 선호하는 개발자 |
| 무엇을 제공하는가 | **시각적 디버깅, CodeLens 통합, 간소화된 배포 워크플로** |
| 사전 요구 사항 | **Visual Studio Code 1.73.0 이상**과 **YAML 언어 지원 확장** |

이 항목은 교재 슬라이드 30 지식 확인 5번 해설과 이어집니다. 해설이 "다양한 IDE 및 런타임 조합과 연동하는 다양한 AWS 도구 키트가 있습니다"라고 하는데 **덱에는 도구 키트를 다루는 슬라이드가 없습니다**([11.1절](#111-교재-기술이-사실과-다른-항목)). 다만 이 문서도 **AWS Toolkit for VS Code 하나만** 확인했고 IDE용 도구 키트 전체 목록은 조회하지 않았습니다([11.5절](#115-검증하지-못한-항목)).

```bash
# 설치 확인
sam --version
```

> — 출처: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

> — 출처: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

### 8.2 설치 방법의 변화 🔄

교재는 설치 방법의 세부를 다루지 않고 참조 URL만 제시합니다. **그 URL은 현재도 유효합니다.**

| 항목 | 상태 |
|---|---|
| 교재 참조 URL(`serverless-sam-cli-install.html`) | **유효.** `Install the AWS SAM CLI` 페이지 내용을 제공합니다 |
| 현재 문서 안의 정식 경로 | `install-sam-cli.html`. 사전 요구 사항 페이지와 `sam deploy` · `sam local` 페이지의 링크가 모두 이쪽을 가리킵니다 |

🔄 **설치 경로에 교재에 없는 제약이 두 개 생겼습니다.**

| 변경 | 내용 |
|---|---|
| Homebrew | **2023년 9월부터** AWS가 AWS 관리형 Homebrew 설치 관리자(`aws/tap/aws-sam-cli`)를 **더 이상 유지하지 않습니다.** 운영 체제별 첫 번째 당사자 설치 방법을 씁니다 |
| macOS 버전 | AWS SAM CLI는 **macOS 13.x보다 오래된 버전을 지원하지 않습니다** |

운영 체제별 설치 방법도 문서가 안내합니다.

| 운영 체제 | 방법 |
|---|---|
| Linux x86_64 · arm64 | 명령줄 설치 관리자 |
| macOS | 패키지 설치 관리자 |

> — 출처: [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

> — 출처: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

### 8.3 CLI 명령 24개 🔄

교재가 다루는 명령은 **일곱 개**입니다. `sam init` · `sam build` · `sam local invoke` · `sam local start-api` · `sam local generate-event` · `sam package` · `sam deploy`. **현재 명령 참조 페이지가 나열하는 명령은 스물넷입니다.**

| 명령 | 교재에 있는가 | 무엇을 하는가 |
|---|---|---|
| `sam build` | 있음 | 다음 단계(로컬 테스트·배포)를 위해 애플리케이션을 준비 ([9.2절](#92-sam-build-와-컨테이너-빌드)) |
| `sam delete` | **없음** 🆕 | 스택·아티팩트·템플릿 파일을 삭제 ([9.8절](#98-정리)) |
| `sam deploy` | 있음 | CloudFormation으로 애플리케이션을 배포 ([9.4절](#94-sam-deploy-와-samconfigtoml)) |
| `sam init` | 있음 | 새 서버리스 애플리케이션 초기화 ([8.4절](#84-sam-init)) |
| `sam list` | **없음** 🆕 | 리소스·엔드포인트·스택 출력 표시 ([9.7절](#97-배포-결과-확인)) |
| `sam local callback` | **없음** 🆕 | — |
| `sam local execution` | **없음** 🆕 | — |
| `sam local generate-event` | 있음 | 샘플 이벤트 생성 ([8.8절](#88-sam-local-generate-event)) |
| `sam local invoke` | 있음 | 함수를 로컬에서 한 번 호출 ([8.7절](#87-sam-local-invoke-와-도커)) |
| `sam local start-api` | 있음 | 로컬 HTTP 서버로 함수 실행 |
| `sam local start-lambda` | **없음** 🆕 | AWS CLI·SDK와 함께 쓸 로컬 HTTP 서버 |
| `sam logs` | **없음** 🆕 | — |
| `sam package` | 있음 | 아티팩트 패키징 ([9.3절](#93-sam-package-는-이제-별도-단계가-아니다)) |
| `sam pipeline bootstrap` | **없음** 🆕 | CI/CD 파이프라인 준비 |
| `sam pipeline init` | **없음** 🆕 | CI/CD 파이프라인 초기화 |
| `sam publish` | **없음** 🆕 | AWS Serverless Application Repository 게시 ([4.5절](#45-aws-serverless-application-repository)) |
| `sam remote callback` | **없음** 🆕 | — |
| `sam remote execution` | **없음** 🆕 | — |
| `sam remote invoke` | **없음** 🆕 | 클라우드에 배포된 리소스를 직접 호출 ([8.9절](#89-클라우드-리소스-직접-호출)) |
| `sam remote test-event` | **없음** 🆕 | — |
| `sam sync` | **없음** 🆕 | 로컬 변경을 클라우드에 동기화 ([9.6절](#96-sam-sync-로-개발-반복-줄이기)) |
| `sam traces` | **없음** 🆕 | — |
| `sam validate` | **없음** 🆕 | 템플릿 유효성 검증 ([8.5절](#85-sam-validate)) |

교재의 공백 중 특히 중요한 다섯 개를 짚어 둡니다.

| 명령 | 왜 중요한가 |
|---|---|
| `sam validate` | 슬라이드 12 강사 노트가 CLI 기능으로 "템플릿 파일이 사양에 맞게 작성되었는지 확인"을 들면서 **명령 이름을 주지 않은** 그 기능입니다 |
| `sam sync` | 개발 중 반복 주기를 줄이는 별도 경로입니다 |
| `sam delete` | 데모(슬라이드 28)가 리소스를 만들고 끝나므로 **정리 절차**가 필요합니다 |
| `sam remote invoke` | 교재는 **로컬 테스트만** 다룹니다 |
| `sam list` | 데모 항목의 "생성한 리소스 표시"를 CLI로 하는 경로입니다 |

> — 출처: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

### 8.4 sam init 🔄

교재 슬라이드 22는 `sam init` 예시 다섯 줄을 제시하고 옵션 세 개(`--runtime` · `--app-template` · `--location`)를 다룹니다. **세 옵션은 모두 현재도 존재합니다.**

```bash
# 교재 슬라이드 22 원문. python3.8 은 지원 종료된 런타임입니다
# Python 3.8 런타임을 사용하여 새 SAM 프로젝트 시작
$ sam init --runtime python3.8
# 내장 앱 템플릿을 사용하여 새 SAM 프로젝트 시작
$ sam init --runtime python3.8 --app-template hello-world
# zip 파일 형태의 사용자 지정 템플릿을 사용하여 새 SAM 프로젝트 시작
$ sam init --location /path/to/template.zip
$ sam init --location https://example.com/path/to/template.zip
# 로컬 경로의 사용자 지정 템플릿을 사용하여 새 SAM 프로젝트 시작
$ sam init --location /path/to/template/folder
```

**런타임만 교정한 예시입니다.**

```bash
# 교정본. 런타임을 지원되는 버전으로 바꿨습니다
# 지원되는 Python 런타임으로 새 SAM 프로젝트 시작
sam init --runtime python3.12
# 내장 앱 템플릿을 지정
sam init --runtime python3.12 --app-template hello-world
# 컨테이너 이미지로 패키징하는 함수 (교재에 없는 선택)
sam init --runtime python3.12 --package-type Image
# arm64 아키텍처 (교재에 없는 선택)
sam init --runtime python3.12 --architecture arm64
# 사용자 지정 템플릿 위치 — .zip 파일, HTTP/HTTPS, 로컬 경로, Git, Mercurial
sam init --location /path/to/template.zip
```

| # | 교재 표기 | 교정 | 이유 |
|---|---|---|---|
| 1 | `--runtime python3.8` | `--runtime python3.12` | `python3.8` 지원 종료. **`--runtime` 허용 값 목록에는 여전히 `python3.8` 이 있지만** 그 값으로 만든 함수는 지원 종료된 런타임을 씁니다 |
| 2 | 프롬프트 `$` | 제거 | 복사·붙여넣기를 쉽게 하기 위해 프롬프트 기호를 뺐습니다. 교재는 슬라이드 21에서 `>>`, 슬라이드 22~24에서 `$` 를 씁니다([11.1절](#111-교재-기술이-사실과-다른-항목)) |

`--runtime` 이 받는 값의 전체 목록입니다. `--package-type` 이 `Zip` 일 때만 적용됩니다.

| 계열 | 허용 값 |
|---|---|
| .NET | `dotnet8` · `dotnet6` |
| Java | `java25` · `java21` · `java17` · `java17.al2023` · `java11` · `java11.al2023` · `java8.al2023` |
| Node.js | `nodejs24.x` · `nodejs22.x` · `nodejs20.x` · `nodejs18.x` · `nodejs16.x` |
| Python | `python3.14` · `python3.13` · `python3.12` · `python3.11` · `python3.10` · `python3.9` · `python3.8` |
| Ruby | `ruby4.0` · `ruby3.4` · `ruby3.3` · `ruby3.2` |

🆕 **교재가 다루지 않는 옵션이 많습니다.**

| 옵션 | 내용 |
|---|---|
| `--app-template` | 관리형 애플리케이션 템플릿의 식별자. 확실하지 않으면 **옵션 없이 `sam init` 을 호출해 대화형 워크플로**를 쓰라고 안내합니다. `--no-interactive` 를 지정하고 `--location` 을 주지 않을 때 **필수** |
| `--location`(`-l`) | 템플릿·애플리케이션 위치. **Git, Mercurial, HTTP/HTTPS, .zip 파일, 경로**를 받습니다. Git 리포지토리는 **리포지토리 루트 위치**를 써야 하고 로컬 경로는 **.zip 파일 또는 Cookiecutter 형식**이어야 합니다 |
| `--package-type` | **`Zip`**(.zip 파일 아카이브) 또는 **`Image`**(컨테이너 이미지) |
| `--architecture`(`-a`) | `x86_64` 또는 `arm64` |
| `--dependency-manager`(`-d`) | `gradle` · `mod` · `maven` · `bundler` · `npm` · `cli-package` · `pip` |
| `--base-image` | `--package-type` 이 `Image` 일 때만. `amazon/python3.14-base` · `amazon/nodejs24.x-base` 같은 값 |
| `--name`(`-n`) | 생성될 디렉터리 이름 |
| `--output-dir`(`-o`) | 출력 디렉터리 |
| `--tracing` / `--no-tracing` | AWS X-Ray 추적 활성화 |
| `--application-insights` / `--no-application-insights` | 기본값은 **`--no-application-insights`** |
| 그 밖에 | `--no-interactive` · `--no-input` · `--extra-content` · `--config-env` · `--config-file` · `--save-params` · `--debug` |

**대화형 흐름도 교재보다 깁니다.** 교재 슬라이드 21은 첫 프롬프트에서 멈춥니다.

```text
Which template source would you like to use?
1 - AWS Quick Start Templates
2 - Custom Template Location
Choice: 1

Choose an AWS Quick Start application template
1 - Hello World Example
2 - Multi-step workflow
...

Use the most popular runtime and package type? (Python and zip) [y/N]:
Which runtime would you like to use?
...
What package type would you like to use?
1 - Zip
2 - Image

Project name [sam-app]:
```

교재가 제시한 첫 프롬프트("Which template source would you like to use? / 1 - AWS Quick Start Templates / 2 - Custom Template Location")는 **현재 문서 예시와 같습니다.** 교재 슬라이드 28 데모 항목의 "빠른 템플릿"도 이 `AWS Quick Start Templates` 를 가리킵니다(두 슬라이드의 용어가 다릅니다).

🆕 **생성 결과 요약에 `samconfig.toml` 이 포함됩니다.** 교재에는 이 파일이 전혀 없습니다([9.4절](#94-sam-deploy-와-samconfigtoml)).

| 요약 항목 | 값 |
|---|---|
| Name | 프로젝트 이름 |
| Base Image | 컨테이너 이미지 유형일 때 |
| Architectures | `x86_64` |
| Dependency Manager | `pip` |
| Output Directory | 출력 디렉터리 |
| **Configuration file** | **`sam-app/samconfig.toml`** |

다음 단계는 `sam-app/README.md` 에 있다고 안내합니다.

교재 슬라이드 21의 프로젝트 구조 그림에도 표기 문제가 있습니다.

| 교재 표기 | 교정 | 이유 |
|---|---|---|
| `_init_.py` | `__init__.py` | Python 패키지 초기화 파일은 앞뒤로 밑줄이 **두 개**입니다 |
| `Tests` | `tests` | `events` · `hello_world` 는 소문자인데 `Tests` 만 대문자로 시작합니다 |

**다만 `sam init` 이 만드는 디렉터리 구조 자체는 확인하지 못했습니다.** 생성 결과 요약까지만 확인했습니다([11.5절](#115-검증하지-못한-항목)). 위 두 항목은 교재 내부의 표기 문제를 지적한 것이고, 실제 생성물의 폴더 이름을 단정하는 것이 아닙니다.

교재 슬라이드 21 강사 노트의 Init 항목 문장도 성립하지 않습니다. "내장 애플리케이션이 템플릿이나 사용자 지정 템플릿을 선택할 수 있습니다" — "내장 애플리케이션 **템플릿**이나 사용자 지정 템플릿을 선택할 수 있습니다"의 오기로 보입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [sam init](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-init.html)

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 8.5 sam validate 🆕

교재 슬라이드 12 강사 노트는 CLI로 할 수 있는 일의 첫 항목으로 "AWS SAM 템플릿 파일이 사양에 맞게 작성되었는지 확인합니다"를 듭니다. **그 확인을 수행하는 명령 이름이 덱 어디에도 없습니다.** `sam validate` 입니다.

| 항목 | 내용 |
|---|---|
| 무엇을 하는가 | AWS SAM 템플릿 파일이 **유효한지 검증**합니다(verifies whether an AWS SAM template file is valid) |
| `--lint` | **`cfn-lint`** 로 템플릿에 린팅 검증을 수행합니다. 추가 파라미터는 `cfnlintrc` 구성 파일로 지정합니다 |
| `--template-file`(`--template`, `-t`) | 기본값은 `template.yaml` 또는 `template.yml`. 템플릿이 현재 작업 디렉터리에 있고 이름이 `template.yaml` · `template.yml` · `template.json` 이면 **이 옵션이 필요하지 않습니다.** 방금 `sam build` 를 실행했다면 역시 필요하지 않습니다 |
| `--config-file` | 기본값은 프로젝트 루트의 `samconfig.toml` |

```bash
# 템플릿이 프로젝트 루트에 있으면 옵션 없이 실행합니다
sam validate

# cfn-lint 린팅까지 수행합니다
sam validate --lint

# 템플릿 위치를 직접 지정할 때
sam validate --template-file ./template.yaml
```

`sam build` 성공 출력이 다음에 쓸 명령으로 안내하는 목록에도 `sam validate` 가 첫 번째로 들어 있습니다([9.2절](#92-sam-build-와-컨테이너-빌드)).

> — 출처: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

### 8.6 sam local 하위 명령 여섯 개 🔄

교재 슬라이드 20은 `sam local` 하위 명령 세 개를 제시합니다. **현재는 여섯 개입니다.**

| 하위 명령 | 교재에 있는가 | 무엇을 하는가 |
|---|---|---|
| `sam local generate-event` | 있음 | 로컬 테스트용 AWS 서비스 이벤트 생성 |
| `sam local invoke` | 있음 | Lambda 함수를 로컬에서 **한 번** 호출 |
| `sam local start-api` | 있음 | **로컬 HTTP 서버**로 Lambda 함수 실행 |
| `sam local start-lambda` | **없음** 🆕 | **AWS CLI·SDK와 함께 쓸** 로컬 HTTP 서버로 Lambda 함수 실행 |
| `sam local callback` | **없음** 🆕 | — |
| `sam local execution` | **없음** 🆕 | — |

교재가 제시한 세 명령의 설명은 문서와 일치합니다.

| 명령 | 교재 설명 | 확인 |
|---|---|---|
| `sam local invoke` | AWS Lambda 함수를 도커 컨테이너에서 로컬로 실행합니다 | 일치 |
| `sam local start-api` | Amazon API Gateway 엔드포인트를 로컬로 복제합니다 | 일치. 문서는 "로컬 HTTP 서버로 Lambda 함수 실행"으로 기술 |
| `sam local generate-event` | 다양한 이벤트 소스에서 샘플 페이로드를 생성합니다 | 일치 |

`start-api` 와 `start-lambda` 의 차이가 실무에서 중요합니다. `start-api` 는 **API Gateway 엔드포인트를 흉내내는 로컬 HTTP 서버**이고, `start-lambda` 는 **AWS CLI·SDK가 Lambda 서비스라고 여기고 호출할 수 있는 로컬 HTTP 서버**입니다. 즉 애플리케이션 코드가 SDK로 함수를 호출하는 구조라면 `start-lambda` 가 맞습니다.

> — 출처: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

> — 출처: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

### 8.7 sam local invoke 와 도커 🔄

문서는 `sam local invoke` 의 동작을 단계별로 기술합니다.

| 단계 | 내용 |
|---|---|
| 템플릿 찾기 | 현재 작업 디렉터리를 프로젝트 루트로 가정하고 먼저 **`.aws-sam` 하위 폴더**의 `template.yaml` 또는 `template.yml` 을, 없으면 **현재 작업 디렉터리**의 것을 찾습니다 |
| 함수 지정 | 애플리케이션에 함수가 둘 이상이면 **함수의 논리 ID** 를 줍니다 |
| 빌드·호출 | 🔄 **AWS SAM CLI가 도커를 사용해 로컬 컨테이너에서 함수를 빌드한 다음** 함수를 호출하고 응답을 출력합니다 |
| 출력 분리 | Lambda 함수 런타임 출력(로그)은 **stderr**, 함수 결과는 **stdout** 으로 나갑니다 |

```bash
# 함수가 하나면 이름 없이 실행할 수 있습니다
sam local invoke

# 함수가 둘 이상이면 논리 ID 를 줍니다
sam local invoke HelloWorldFunction

# 이벤트 파일을 전달합니다. 이벤트는 sam local generate-event 로 만들 수 있습니다
sam local invoke --event events/s3.json S3JsonLoggerFunction

# 환경 변수를 전달합니다
sam local invoke --env-vars env.json HelloWorldFunction
```

교재 슬라이드 21의 `sam local invoke "HelloWorldFunction" -e event.json` 도 **함수 논리 ID + 이벤트 파일**을 주는 현재 사용법과 같습니다.

문서의 출력 예시는 `public.ecr.aws/lambda/python:3.9-rapid-x86_64` 같은 **런타임 이미지를 내려받아** `.aws-sam/build/<함수>` 를 컨테이너 안 `/var/task` 에 마운트하는 과정을 보여 줍니다. 즉 [5.8절](#58-템플릿-파일-이름과-상대-경로)의 `.aws-sam/build` 디렉터리가 로컬 호출에서도 쓰입니다.

🆕 **문서에는 교재에 없는 주의가 하나 있습니다.** 문서는 **신뢰할 수 없는 코드에 SAM CLI의 로컬 호출 기능을 쓰지 않도록 권고**하고, 완전한 격리가 필요하면 Lambda 서비스에서 직접 실행하라고 안내합니다.

> — 출처: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

### 8.8 sam local generate-event 🔄

교재 슬라이드 20은 지원 서비스를 "**대표적인 서비스는 Amazon S3, API Gateway, Amazon SNS**"로 세 개만 제시합니다. 🔄 **실제 지원 목록은 훨씬 깁니다.**

| 항목 | 내용 |
|---|---|
| 무엇을 하는가 | 지원되는 AWS 서비스의 **이벤트 페이로드 샘플**을 생성합니다. 생성한 이벤트를 수정해 로컬 리소스 테스트에 넘길 수 있습니다 |
| 이벤트의 형태 | 실제 AWS 서비스가 만드는 이벤트와 **같은 구조**로 형식화됩니다 |
| 지원 목록 보기 | 인자 없이 `sam local generate-event` 를 실행합니다 |
| 문서 예시에 표시된 서비스 | `alb` · `alexa-skills-kit` · `alexa-smart-home` · `apigateway` · `appsync` · `batch` · `cloudformation` — 목록은 그 뒤로 계속됩니다 |

문서 출력 예시가 생략 부호로 잘려 있어 **전체 목록은 확인하지 못했습니다**([11.5절](#115-검증하지-못한-항목)). 다만 알파벳 앞부분만 봐도 교재가 든 세 개보다 여섯 개가 더 있습니다.

🆕 **인자를 두 단계로 준다는 점도 교재에 없습니다.**

```bash
# (1) 지원 서비스 목록을 봅니다
sam local generate-event

# (2) 서비스 이름을 주면 생성 가능한 이벤트 유형이 표시됩니다
sam local generate-event s3
```

```text
Commands:
  batch-invocation
  delete
  put
```

```bash
# (3) 서비스와 이벤트 유형을 함께 주면 샘플 이벤트가 출력됩니다
sam local generate-event s3 put

# 자리표시자 값을 명령줄에서 바꿉니다
sam local generate-event s3 put --bucket my-test-bucket --key sample-key

# 파일로 저장해 sam local invoke 에 넘깁니다
sam local generate-event s3 put > events/s3.json
sam local invoke --event events/s3.json S3JsonLoggerFunction
```

샘플 이벤트는 **자리표시자 값**을 담고 있으며 `--region` · `--partition` · `--bucket` · `--key` 같은 옵션으로 수정할 수 있습니다.

> — 출처: [Introduction to testing with sam local generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-generate-event.html)

### 8.9 클라우드 리소스 직접 호출 🆕

교재는 **로컬 테스트만** 다룹니다. 현재 CLI에는 클라우드에 배포된 리소스를 직접 호출하는 경로가 있습니다.

| 명령 | 무엇을 하는가 |
|---|---|
| `sam remote invoke` | 클라우드에 배포된 리소스를 직접 호출 |
| `sam remote test-event` | 원격 테스트 이벤트 관리 |
| `sam remote callback` | — |
| `sam remote execution` | — |

```bash
# 클라우드에 배포된 리소스를 직접 호출합니다
sam remote invoke
```

로컬 테스트와 원격 호출의 쓰임을 구분하면 이렇습니다.

| 상황 | 명령 |
|---|---|
| 코드를 배포하지 않고 함수 로직만 확인 | `sam local invoke` |
| API 엔드포인트 동작을 로컬에서 확인 | `sam local start-api` |
| SDK 호출 경로를 로컬에서 확인 | `sam local start-lambda` |
| **배포된 함수가 실제 환경에서 동작하는지 확인** | `sam remote invoke` |

> — 출처: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

---

## 9. 빌드와 배포

### 9.1 표준 워크플로

교재 슬라이드 21은 워크플로를 네 단계로 제시합니다. **프로덕션 경로로서 이 4단계는 여전히 유효합니다.**

| 단계 | 명령 | 교재 강사 노트 |
|---|---|---|
| 시작 | `sam init` | 새 AWS SAM 프로젝트를 초기화합니다 |
| 구축 | `sam build` | AWS SAM 애플리케이션을 구축합니다. 컨테이너 내에서 빌드를 시작할 수 있습니다 |
| 테스트 | `sam local invoke` | 테스트를 위해 애플리케이션을 로컬로 실행합니다 |
| 배포 | `sam deploy` | 애플리케이션을 배포합니다 |

```bash
# 교재가 제시하는 4단계 워크플로 (프롬프트 기호를 제거한 표기)
sam init
sam build
sam local invoke
sam deploy --guided
```

🆕 **`sam build` 성공 출력이 다음에 쓸 명령을 안내하는데, 그 목록이 교재 4단계보다 넓습니다.**

| 안내되는 명령 | 이 문서 |
|---|---|
| `sam validate` | [8.5절](#85-sam-validate) |
| `sam local invoke` | [8.7절](#87-sam-local-invoke-와-도커) |
| `sam sync --stack-name {{stack-name}} --watch` | [9.6절](#96-sam-sync-로-개발-반복-줄이기) |
| `sam deploy --guided` | [9.4절](#94-sam-deploy-와-samconfigtoml) |

교재 슬라이드 21 다이어그램의 뒷부분(AWS SAM 템플릿 → AWS CloudFormation → 스택 → AWS 클라우드)도 문서와 일치합니다. 다만 **다이어그램에는 CloudFormation과 스택 사이의 변경 세트가 빠져 있습니다**([9.5절](#95-변경-세트와-롤백)).

교재 슬라이드 21 강사 노트의 Deploy 항목은 인과가 뒤집혀 있습니다. "구성 파일을 사용할 때 대화형 프롬프트를 통해 배포하려면 `sam deploy` 명령을 실행합니다" — **대화형 배포(`--guided`)와 구성 파일 기반 배포는 서로 다른 경로**이고, 슬라이드 24가 이 둘을 별개 예시로 제시합니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.2 sam build 와 컨테이너 빌드 🔄

**이 모듈에서 가장 중요한 교정입니다.** 교재 슬라이드 23 강사 노트는 이렇게 적습니다.

> 참고: 일부 언어(예: .NET 또는 Python)에서는 `-use-container` 옵션을 사용할 수 없습니다.

🔄 **현재 `sam build` 참조 문서에는 언어·런타임에 따라 `--use-container` 를 쓸 수 없다는 서술이 없습니다.** 오히려 `--build-image` 옵션 설명이 **Python 빌드 이미지를 `--use-container` 와 함께 쓰는 예**로 다음 두 형태를 제시합니다.

```bash
# 문서가 --build-image 설명에서 제시하는 예시 두 가지.
# 둘 다 --use-container 와 함께 Python 빌드 이미지를 씁니다
sam build --use-container --build-image amazon/aws-sam-cli-build-image-python3.8
sam build --use-container --build-image Function1=amazon/aws-sam-cli-build-image-python3.8
```

문서가 명시하는 `--use-container` 관련 제약은 **하나뿐**입니다.

| 항목 | 문서 서술 |
|---|---|
| `--use-container`(`-u`) 는 무엇인가 | 함수가 **네이티브로 컴파일된 종속성**을 가진 패키지에 의존할 때 **Lambda 같은(Lambda-like) 도커 컨테이너 안에서** 함수를 빌드하는 옵션 |
| 명시된 유일한 비호환 | **`--build-in-source` 와 호환되지 않습니다** |
| `--use-container` 와 **함께만** 쓸 수 있는 옵션 | `--build-image` · `--container-env-var` · `--container-env-var-file`. `--use-container` 없이 쓰면 **오류**가 납니다 |
| `--no-use-container` | 도커 컨테이너 대신 **로컬 머신**에서 빌드를 실행 |
| 언어·런타임에 따른 제약 | **서술이 없습니다** |

`--build-in-source` 쪽에 제약이 있습니다.

| 항목 | 내용 |
|---|---|
| 지원 런타임 | `sam init --runtime` 이 지원하는 **모든 Node.js 런타임** |
| 지원 빌드 방법 | **Makefile** 과 **esbuild** |
| 비호환 | `--use-container` |

**교재 안에서도 표기가 갈립니다.** 슬라이드 본문은 `--use-container`(하이픈 두 개)로 올바르게 적는데 강사 노트는 `-use-container`(하이픈 한 개)로 적습니다. 정확한 표기는 **`--use-container`** 이고 짧은 형식은 **`-u`** 입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

```bash
# 교재 슬라이드 23 원문
# 기본 빌드 명령
$ sam build
# AWS Lambda 같은 도커 컨테이너 내 빌드 프로세스 실행
$ sam build --use-container
# 로컬에서 함수 빌드 및 실행
$ sam build && sam local invoke
```

```bash
# 교정본. 옵션 표기를 통일하고 짧은 형식을 함께 보여 줍니다
# 기본 빌드
sam build

# Lambda 같은 도커 컨테이너 안에서 빌드.
# 네이티브로 컴파일된 종속성이 있을 때 씁니다. 짧은 형식은 -u 입니다
sam build --use-container

# 로컬 머신에서 빌드 (컨테이너를 쓰지 않음)
sam build --no-use-container

# 빌드한 뒤 바로 로컬 호출
sam build && sam local invoke
```

`sam build` 의 다른 옵션도 정리합니다.

| 옵션 | 내용 |
|---|---|
| `--use-container`(`-u`) | Lambda 같은 도커 컨테이너에서 빌드 |
| `--no-use-container` | 로컬 머신에서 빌드 |
| `--build-image` | 사용할 빌드 이미지. **`--use-container` 와 함께만** |
| `--container-env-var` / `--container-env-var-file` | 컨테이너 환경 변수. **`--use-container` 와 함께만** |
| `--build-in-source` | 소스 위치에서 빌드. **`--use-container` 와 비호환** |
| `--parallel` | 병렬 빌드 |
| `--cached` | 캐시 사용. 캐시 디렉터리 기본값은 `.aws-sam/cache` |
| `--exclude`(`-x`) | 특정 리소스 제외 |
| `--base-dir`(`-s`) | 상대 경로 해석 기준 변경 ([5.8절](#58-템플릿-파일-이름과-상대-경로)) |
| `--build-dir`(`-b`) | 빌드 출력 디렉터리 |
| `--manifest`(`-m`) | 매니페스트 파일 지정 |
| `--hook-name` | 허용 값은 **`terraform`** |
| 그 밖에 | `--skip-pull-image` · `--use-buildkit` · `--mount-symlinks` · `--save-params` · `--parameter-overrides` · `--template-file` · `--config-file` |

빌드 결과 위치도 교재에 없습니다.

```text
Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml

Commands you can use next
=========================
[*] Validate SAM template: sam validate
[*] Invoke Function: sam local invoke
[*] Test Function in the Cloud: sam sync --stack-name {{stack-name}} --watch
[*] Deploy: sam deploy --guided
```

`sam deploy` 는 **`.aws-sam` 디렉터리의 빌드 아티팩트를 배포**합니다. 그래서 문서는 원본 파일을 바꾸면 배포 전에 `sam build` 로 `.aws-sam` 디렉터리를 갱신하라고 안내합니다. 교재 슬라이드 23의 `sam build && sam local invoke` 도 이 관계 위에서 동작하는데, 교재는 그 관계를 설명하지 않습니다.

> — 출처: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.3 sam package 는 이제 별도 단계가 아니다 🔄

교재 슬라이드 24는 첫 예시로 `sam build && sam package --s3-bucket <bucket_name>` 을 제시하고 강사 노트도 "`sam package` 및 `sam deploy` 명령을 사용합니다"라고 두 명령을 함께 요구합니다.

🔄 **문서는 참고(Note)로 이렇게 명시합니다.** `sam deploy` 가 이제 `sam package` 의 기능을 **암시적으로 수행**한다(sam deploy now implicitly performs the functionality of sam package). `sam deploy` 명령을 직접 써서 애플리케이션을 패키징하고 배포할 수 있습니다.

| 항목 | 교재 | 현재 |
|---|---|---|
| 패키징 단계 | `sam package --s3-bucket <bucket_name>` 를 배포 전에 실행 | `sam deploy` 가 **암시적으로 수행** |
| S3 버킷 | 이름을 직접 넘김 | **`--resolve-s3`** 로 자동 생성. 출력에 `Managed S3 bucket` 으로 표시 |
| `--s3-bucket` 과 `--resolve-s3` | — | **함께 지정하면 오류**가 납니다 |
| 컨테이너 이미지 | 다루지 않음 | Amazon ECR에 업로드하고 필요하면 **리포지토리를 만듭니다** |

`sam package` 자체는 폐기되지 않았습니다. 여전히 쓸 자리가 있습니다.

| `sam package` 의 동작 | 내용 |
|---|---|
| 무엇을 하는가 | 코드와 종속성의 **.zip 파일**을 만들어 Amazon S3에 업로드하고, 로컬 아티팩트 참조를 업로드된 Amazon S3 위치로 바꾼 **AWS SAM 템플릿 사본**을 반환합니다 |
| 암호화 | AWS SAM이 **Amazon S3에 저장되는 모든 파일에 암호화를 활성화**합니다 |
| 템플릿 탐색 순서 | 현재 작업 디렉터리를 프로젝트 루트로 가정하고, 먼저 **`.aws-sam` 하위 폴더**의 `template.yaml` 을 찾고, 없으면 현재 작업 디렉터리의 `template.yaml` 또는 `template.yml` 을 찾습니다 |
| `--template` 지정 시 | 기본 동작을 덮어써 **그 템플릿과 그것이 가리키는 로컬 리소스만** 패키징합니다 |
| `--output-template-file` | 패키징된 템플릿을 쓸 경로. 지정하지 않으면 **표준 출력**에 씁니다 |
| 크기 조건 | 아티팩트가 **51,200바이트**보다 크면 `--s3-bucket` 또는 `--resolve-s3` 중 하나가 필요합니다 |

```bash
# 교재 슬라이드 24 원문
# 빌드 및 패키징하여 배포
$ sam build && sam package --s3-bucket <bucket_name>
# 대화형 프롬프트를 사용하여 배포
$ sam deploy --guided
# 구성 파일을 사용하여 배포
$ sam deploy --template-file deploy.yml
```

```bash
# 교정본. 패키징은 sam deploy 에 포함되고, 구성 파일 옵션은 --config-file 입니다
# 첫 배포 — 대화형 흐름으로 설정을 만들고 samconfig.toml 에 저장합니다
sam build && sam deploy --guided

# 이후 배포 — samconfig.toml 의 값으로 배포합니다
sam deploy

# 패키징용 S3 버킷을 자동으로 만들게 합니다 (--s3-bucket 과 함께 쓰면 오류)
sam deploy --resolve-s3

# 구성 파일을 직접 지정할 때는 --config-file 입니다 (--template-file 이 아닙니다)
sam deploy --config-file samconfig.toml --config-env default

# 패키징 결과 템플릿을 파일로 얻어야 할 때만 sam package 를 씁니다
sam package --resolve-s3 --output-template-file packaged.yaml
```

| # | 교재 표기 | 교정 | 이유 |
|---|---|---|---|
| 1 | `sam package --s3-bucket <bucket_name>` 를 배포 전 필수 단계로 제시 | `sam deploy`(필요하면 `--resolve-s3`) | 문서 참고가 `sam deploy` 가 패키징을 암시적으로 수행한다고 명시 |
| 2 | `# 구성 파일을 사용하여 배포` + `--template-file deploy.yml` | `--config-file`(기본값 `samconfig.toml`) | `--template-file` 은 **템플릿** 옵션입니다 ([9.4절](#94-sam-deploy-와-samconfigtoml)) |
| 3 | 프롬프트 `$` | 제거 | 복사·붙여넣기 편의 |

> — 출처: [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html)

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.4 sam deploy 와 samconfig.toml 🆕

**교재는 `samconfig.toml` 을 한 번도 언급하지 않습니다.** 이 파일이 `sam deploy --guided` 의 산출물이고 이후 배포의 기준이므로 실무의 핵심입니다.

| 항목 | 문서 서술 |
|---|---|
| `sam deploy` 는 무엇을 하는가 | **AWS CloudFormation을 사용해** 애플리케이션을 AWS 클라우드에 배포합니다 |
| `--stack-name` | **필수(Required).** 기존 스택 이름을 주면 스택을 **업데이트**하고 새 이름을 주면 스택을 **만듭니다** |
| `--guided`(`-g`) | AWS SAM CLI가 **프롬프트로 배포를 안내**하게 합니다 |
| `--config-file` | 기본값은 프로젝트 디렉터리 루트의 **`samconfig.toml`** |
| `--config-env` | 기본값은 **`default`** |

🔄 **`--template-file` 과 `--config-file` 의 구분이 교재에서 뒤섞여 있습니다.**

| 옵션 | 무엇을 지정하는가 | 기본값 |
|---|---|---|
| `--template-file`(`--template`, `-t`) | AWS SAM **템플릿**의 경로와 이름 | `template.yaml` 또는 `template.yml` |
| `--config-file` | **구성 파일**의 경로와 이름 | `samconfig.toml` |
| `--config-env` | 구성 파일 안의 **환경 이름** | `default` |

`sam deploy --guided` 의 대화형 흐름이 어디서 기본값을 가져오는지도 문서에 있습니다.

| 출처 | 내용 |
|---|---|
| `~/.aws/config` | 일반 AWS 계정 설정 |
| `~/.aws/credentials` | 계정 자격 증명 |
| `<project>/samconfig.toml` | 프로젝트 구성 파일 |

대괄호(`[ ]`)가 기본값을 표시하며 **답을 비워 두면 기본값이 선택**됩니다.

```text
Configuring SAM deploy
======================

        Stack Name [sam-app]:
        AWS Region [us-east-1]:
        Confirm changes before deploy [Y/n]:
        Allow SAM CLI IAM role creation [Y/n]:
        Disable rollback [y/N]:
        HelloWorldFunction may not have authorization defined, Is this okay? [y/N]:
        Save arguments to configuration file [Y/n]:
        SAM configuration file [samconfig.toml]:
        SAM configuration environment [default]:
```

AWS SAM CLI는 이 응답을 프로젝트의 `samconfig.toml` 에 기록하고, **이후 배포에서는 `sam deploy` 만 실행해도 그 값으로 배포**합니다. 값을 다시 구성하려면 `sam deploy --guided` 를 다시 쓰거나 구성 파일을 직접 수정합니다. 구성 파일은 TOML 파일이며 `--config-env`(기본값 `default`)로 환경을 고릅니다.

배포의 주요 단계는 네 개입니다.

| 단계 | 내용 |
|---|---|
| 1 | **.zip 파일 아카이브**로 패키징된 Lambda 함수는 AWS SAM CLI가 압축해 Amazon S3 버킷에 업로드하고 필요하면 **새 버킷을 만듭니다**(출력에 `Managed S3 bucket` 으로 표시) |
| 2 | **컨테이너 이미지**로 패키징된 함수는 Amazon ECR에 업로드하고 필요하면 **새 리포지토리를 만듭니다** |
| 3 | AWS SAM CLI가 **AWS CloudFormation 변경 세트**를 만들고 애플리케이션을 CloudFormation 스택으로 배포합니다 |
| 4 | 배포된 AWS SAM 템플릿의 Lambda 함수 `CodeUri` 값을 새 값으로 수정합니다 |

문서가 제시하는 **모범 사례**는 두 가지입니다.

| 모범 사례 | 내용 |
|---|---|
| 빌드 먼저 | `sam deploy` 가 **`.aws-sam` 디렉터리의 빌드 아티팩트**를 배포하므로, 원본 파일을 바꾸면 배포 전에 `sam build` 로 그 디렉터리를 갱신합니다 |
| 첫 배포와 이후 배포 | **첫 배포에는 `sam deploy --guided`**, 이후 배포에는 **`sam deploy`** |

`--capabilities` 도 교재에 없는 필수 지식입니다.

| 값 | 언제 필요한가 |
|---|---|
| `CAPABILITY_IAM` | IAM 리소스를 만들 때 |
| `CAPABILITY_NAMED_IAM` | IAM 리소스에 **사용자 지정 이름**이 있을 때. 지정하지 않으면 **`InsufficientCapabilities` 오류**가 반환됩니다 |
| `CAPABILITY_AUTO_EXPAND` | **중첩 애플리케이션**을 포함한 애플리케이션을 배포할 때 |

그 밖의 옵션도 정리합니다.

| 옵션 | 내용 |
|---|---|
| `--parameter-overrides` | 템플릿 파라미터 값을 덮어씀. 템플릿 항목보다 **우선** |
| `--tags` | 스택 태그 |
| `--notification-arns` | 알림 ARN |
| `--kms-key-id` | 암호화 키 |
| `--image-repository`(`-ies`) · `--resolve-image-repos` | 컨테이너 이미지 리포지토리 |
| `--signing-profiles` | 코드 서명 프로필 |
| `--fail-on-empty-changeset` | 변경이 없을 때 실패 처리 |
| `--force-upload` · `--save-params` · `--use-json` · `--express` | — |
| `--role-arn` | CloudFormation이 변경 세트를 적용할 때 맡을 IAM 역할 ARN |
| 템플릿 크기 | 템플릿이 **51,200바이트**보다 크면 `--s3-bucket` 또는 `--resolve-s3` 중 하나가 필요 |
| 환경 변수 `SAM_CLI_POLL_DELAY` | CloudFormation 스택 상태 **폴링 간격** 조절 |

> — 출처: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.5 변경 세트와 롤백 🆕

**교재는 변경 세트를 전혀 다루지 않습니다.** 슬라이드 21 다이어그램은 `AWS CloudFormation → 스택` 으로 곧바로 이어지고, 슬라이드 24는 `sam deploy` 를 실행하면 배포된다고만 보여 줍니다. 그런데 [9.4절](#94-sam-deploy-와-samconfigtoml)에서 봤듯 **배포는 변경 세트를 거칩니다.** 그리고 이것이 [2.1절](#21-전통적인-소프트웨어-배포의-문제점)의 4번(롤백 계획 없음)·5번(인적 오류) 문제에 대한 답입니다.

| 항목 | 문서 서술 |
|---|---|
| 변경 세트란 | 스택에 제안한 변경이 **실행 중인 리소스에 어떤 영향을 줄지 미리 볼 수 있게** 하며, 리소스 속성과 특성에 대한 영향도 포함합니다 |
| 언제 스택이 바뀌는가 | 변경이 중요한 리소스를 삭제·교체하는지와 무관하게 CloudFormation은 **사용자가 변경 세트를 실행하기로 결정할 때만** 스택을 변경합니다 |
| 무엇을 볼 수 있는가 | **추가·수정·삭제될 리소스**와 태그 같은 속성·특성의 **전후 비교** |
| 배포 전 검증 | 변경 세트 생성 중에 **속성 구문 오류 · 리소스 이름 충돌 · 서비스 할당량 한도** 같은 일반적인 실패 원인에 대해 **배포 전 검증(pre-deployment validation)** 을 수행합니다 |
| 보장하지 않는 것 | 변경 세트가 **스택 갱신 성공을 보장하지는 않습니다.** 사용자 지정 리소스 로직이나 서비스별 제약 같은 **런타임 조건** 때문에 발생하는 실패는 실행 중에 여전히 일어날 수 있습니다 |
| 실행 후 | CloudFormation은 그 스택과 연결된 **모든 변경 세트를 제거**합니다(갱신된 스택에 적용할 수 없으므로) |

변경 세트의 절차는 네 단계입니다.

| 단계 | 내용 |
|---|---|
| 1 | 갱신하려는 스택의 변경을 제출해 변경 세트를 만듭니다. 수정한 템플릿이나 수정한 입력 파라미터 값을 제출할 수 있고, **이 시점에는 스택을 변경하지 않습니다** |
| 2 | 변경 세트를 보고 **어떤 스택 설정·리소스가 바뀔지** 확인합니다 |
| 3 | (선택) 다른 변경을 고려하려면 **추가 변경 세트**를 만듭니다 |
| 4 | 적용하려는 변경을 담은 변경 세트를 **실행**하면 CloudFormation이 스택을 갱신합니다 |

`sam deploy` 의 변경 세트 관련 옵션은 이렇습니다.

| 옵션 | 내용 |
|---|---|
| `--confirm-changeset` / `--no-confirm-changeset` | 계산된 변경 세트를 배포할지 **확인하는 프롬프트**를 띄웁니다. `sam deploy --guided` 의 `Confirm changes before deploy` 프롬프트가 바로 이 선택입니다 |
| `--no-execute-changeset` | 변경 세트를 만들고 **적용하지 않고 종료**합니다. 적용 전에 스택 변경을 볼 수 있습니다 |

**롤백 옵션도 교재에 없습니다.**

| 옵션 | 동작 |
|---|---|
| (기본값) | 배포 중 오류가 나면 CloudFormation 스택이 **마지막 안정 상태로 롤백**됩니다 |
| `--disable-rollback` | 오류 이전에 만들어지거나 갱신된 리소스가 **롤백되지 않습니다** |
| `--on-failure ROLLBACK` | 이전 정상 상태로 롤백. **기본 동작** |
| `--on-failure DELETE` | 이전 정상 상태가 있으면 롤백, 없으면 **스택 삭제** |
| `--on-failure DO_NOTHING` | `--disable-rollback` 과 같은 효과 |
| 제약 | **`--disable-rollback` 과 `--on-failure` 는 함께 쓸 수 없습니다** |

```bash
# 변경 세트만 만들고 적용하지 않습니다. 무엇이 바뀔지 먼저 봅니다
sam deploy --no-execute-changeset

# 배포 전에 변경 세트 확인 프롬프트를 띄웁니다
sam deploy --confirm-changeset

# 실패 시 동작을 지정합니다. 기본 동작은 ROLLBACK 입니다
sam deploy --on-failure DELETE

# 디버깅을 위해 실패한 리소스를 남깁니다.
# --on-failure 와 함께 쓸 수 없습니다
sam deploy --disable-rollback
```

[2.1절](#21-전통적인-소프트웨어-배포의-문제점)의 문제 목록과 맞춰 보면 이렇습니다.

| 교재가 든 문제 | 여기서의 답 |
|---|---|
| 롤백 계획 없음 | 기본 동작이 **마지막 안정 상태로 롤백**. `--on-failure` 로 제어 |
| 인적 오류 발생 가능성 | 변경 세트로 **실행 전 검토**. `--no-execute-changeset` 으로 적용 없이 확인 |
| 수동 승인 방식 | `--no-confirm-changeset` 으로 자동화 |

> — 출처: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

> — 출처: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

### 9.6 sam sync 로 개발 반복 줄이기 🆕

교재의 워크플로는 4단계이고 `sam sync` 가 없습니다. 이 명령은 **AWS SAM Accelerate** 의 일부입니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇을 하는가 | 로컬 애플리케이션 변경을 AWS 클라우드에 **빠르게 동기화**합니다 |
| 세 가지 용도 | ① 로컬 변경을 자동으로 감지해 클라우드에 동기화 ② 무엇을 동기화할지 사용자 지정 ③ 테스트·검증을 위해 클라우드의 애플리케이션을 준비 |
| AWS SAM Accelerate란 | AWS 클라우드에서 서버리스 애플리케이션을 **개발·테스트하는 경험을 빠르게** 하는 도구 모음 |
| ⚠️ 어디에 쓰는가 | 문서는 `sam sync` 를 **개발 환경용으로 권장**하고 **프로덕션 환경에는 `sam deploy` 또는 CI/CD 파이프라인 구성을 권장**합니다 |
| 확인 프롬프트 | 실행하면 **"이 명령은 개발 스택에만 써야 한다"** 는 확인 프롬프트가 나옵니다 |

`--watch` 로 실행하면 네 단계로 동작합니다.

| 단계 | 내용 |
|---|---|
| 1 | 애플리케이션을 **빌드**합니다(`sam build` 와 비슷) |
| 2 | `.aws` 사용자 폴더의 자격 증명·일반 구성과 **`samconfig.toml` 의 배포 설정**으로 CloudFormation에 배포합니다 |
| 3 | **계속 실행되며 로컬 변경을 감시**합니다 |
| 4 | 변경을 감지하면 **가장 빠른 방법으로** 동기화합니다 |

4단계의 "가장 빠른 방법"이 무엇인지도 문서가 밝힙니다. 갱신된 리소스가 **AWS 서비스 API를 지원하면 그것으로 빠르게 갱신**하고, 지원하지 않으면 **CloudFormation 배포를 수행해 애플리케이션 전체를 갱신**합니다.

```bash
# 로컬 변경을 감시하며 계속 동기화합니다. 개발 스택에만 씁니다
sam sync --stack-name my-dev-stack --watch

# Lambda 함수 코드 같은 코드 변경만 동기화합니다
sam sync --stack-name my-dev-stack --code

# 특정 함수·계층만 지정합니다
sam sync --stack-name my-dev-stack --code --resource-id HelloWorldFunction

# 자동 동기화를 끄고 sam build + sam deploy 를 묶은 일회성 배포를 수행합니다
sam sync --stack-name my-dev-stack --no-watch

# 로컬 템플릿과 배포된 템플릿을 비교해 변경이 없으면 초기 배포를 건너뜁니다
sam sync --stack-name my-dev-stack --skip-deploy-sync

# 동기화를 유발하지 않을 파일·폴더를 지정합니다
sam sync --stack-name my-dev-stack --watch --watch-exclude node_modules
```

옵션의 세부 동작을 정리합니다.

| 옵션 | 내용 |
|---|---|
| `--watch` | 로컬 변경을 감시하며 계속 동기화 |
| `--code` | **코드 변경만** 동기화 |
| `--resource-id` | 특정 함수·계층만 지정. 중첩 스택 리소스는 **`nestedStackId/resourceId`** 형식 |
| `--no-watch` | 자동 동기화를 끄고 `sam build` 와 `sam deploy` 를 묶은 **일회성 CloudFormation 배포** |
| `--skip-deploy-sync` | 로컬 템플릿과 배포된 템플릿을 비교해 변경이 없으면 초기 배포를 건너뜁니다. 단 **변경이 없어도 마지막 배포 후 7일 이상 지났거나 Lambda 코드 변경이 많으면** 배포를 수행합니다 |
| `--stack-name` | 갱신할 스택 |
| `--watch-exclude` | 동기화를 유발하지 않을 파일·폴더 |

**두 경로를 혼동하면 안 됩니다.**

| 목적 | 명령 |
|---|---|
| 개발 중 빠른 반복 | `sam sync --watch` (개발 스택 전용) |
| 프로덕션 배포 | `sam deploy` 또는 CI/CD 파이프라인 |

즉 교재의 4단계 워크플로는 **프로덕션 경로로서 여전히 맞습니다.** `sam sync` 가 그것을 대체하는 것이 아니라 개발 반복용 별도 경로를 추가한 것입니다.

> — 출처: [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html)

### 9.7 배포 결과 확인 🆕

교재 슬라이드 28 데모 항목의 "생성한 리소스 표시"는 콘솔 조작을 전제하는 것으로 보입니다. 현재 CLI에는 같은 정보를 확인하는 경로가 있습니다.

| 하위 명령 | 무엇을 표시하는가 |
|---|---|
| `sam list endpoints` | CloudFormation 스택의 **클라우드·로컬 엔드포인트** 목록 |
| `sam list resources` | 배포 시 AWS CloudFormation에 생성되는 **AWS SAM 템플릿의 리소스** |
| `sam list stack-outputs` | AWS SAM 또는 CloudFormation 템플릿에서 만들어진 **CloudFormation 스택의 출력** |

문서는 `sam list` 를 서버리스 애플리케이션의 리소스와 애플리케이션 상태에 관한 중요한 정보를 출력하는 명령으로 규정하고, 로컬·클라우드 개발을 돕기 위해 **배포 전후에** 쓴다고 기술합니다. 즉 `resources` 는 배포 전에도 볼 수 있습니다.

```bash
# 배포 전 — 이 템플릿이 무엇을 만들지 확인합니다
sam list resources

# 배포 후 — API 엔드포인트를 확인합니다
sam list endpoints

# 배포 후 — 스택 출력을 확인합니다
sam list stack-outputs --stack-name my-stack
```

> — 출처: [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html)

### 9.8 정리 🆕

**교재는 배포한 리소스를 정리하는 방법을 전혀 다루지 않습니다.** 데모가 애플리케이션을 배포하고 테스트하는 데서 끝나므로 정리 절차가 필요합니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇을 삭제하는가 | **CloudFormation 스택**, Amazon S3·Amazon ECR에 패키징·배포된 **아티팩트**, **AWS SAM 템플릿 파일** |
| 컴패니언 스택 | Amazon ECR 컴패니언 스택이 배포되어 있는지 확인하고, 있으면 **그 스택과 Amazon ECR 리포지토리 삭제 여부를 사용자에게 묻습니다** |
| `--no-prompts` | 비대화형 모드. 이때 **컴패니언 스택과 Amazon ECR 리포지토리가 기본으로 삭제되고**, `--stack-name` 옵션 또는 구성 TOML 파일로 스택 이름을 **반드시 제공**해야 합니다 |
| `--stack-name` | 삭제할 CloudFormation 스택 이름 |
| `--s3-bucket` · `--s3-prefix` | 삭제할 S3 경로 |

```bash
# 대화형으로 스택과 아티팩트를 삭제합니다
sam delete --stack-name my-stack

# 비대화형. 컴패니언 스택과 ECR 리포지토리가 기본으로 삭제되므로 주의하세요
sam delete --stack-name my-stack --no-prompts
```

[1.2절](#12-용어-정리)의 스택 정의와 이어집니다. 스택을 삭제하면 스택의 모든 리소스가 삭제되므로, 데모나 실습 뒤에는 `sam delete` 한 번으로 정리할 수 있습니다.

> — 출처: [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html)

### 9.9 데모 절차 🆕

교재 슬라이드 28은 데모 항목만 나열하고 **강사 노트가 전혀 없습니다.** 무엇을 어떤 순서로 시연하는지, 무엇을 확인하면 성공인지가 없고 참조 URL도 없습니다. 교재 항목을 명령 단위로 채웠습니다.

| 교재 데모 항목 | 세부 항목 | 명령 | 확인 지점 |
|---|---|---|---|
| AWS SAM 환경 초기화 | 가용 런타임 · 빠른 템플릿 | `sam init` | 대화형 흐름에서 `AWS Quick Start Templates` → `Hello World Example` → 런타임 → 패키지 유형 → 프로젝트 이름. **생성 결과 요약에 `samconfig.toml` 이 포함**됩니다 |
| AWS SAM 애플리케이션 구축 | 폴더 구조 · 구축 옵션(컨테이너 대 로컬) | `sam validate` → `sam build` | 빌드 성공 출력의 `Built Artifacts : .aws-sam/build` 확인. 컨테이너 빌드는 `sam build --use-container`, 로컬 빌드는 `--no-use-container` |
| AWS SAM 리소스 호출 | 로컬 테스트 | `sam local generate-event` → `sam local invoke` | 이벤트를 만들어 파일로 저장한 뒤 함수에 전달. 로그는 stderr, 결과는 stdout |
| AWS SAM 애플리케이션 배포 | 생성한 리소스 표시 · 애플리케이션 테스트 | `sam list resources` → `sam deploy --guided` → `sam list endpoints` | 배포 전 리소스 목록, 배포 중 변경 세트 확인 프롬프트, 배포 후 엔드포인트 |
| (교재에 없음) 🆕 | 정리 | `sam delete` | 스택과 아티팩트 삭제 |

```bash
# 데모 절차 전체
# 1. 초기화 — 대화형 흐름으로 프로젝트를 만듭니다
sam init

# 2. 검증과 빌드
sam validate --lint
sam build

# 3. 로컬 테스트 — 이벤트를 만들어 함수에 전달합니다
sam local generate-event apigateway aws-proxy > events/event.json
sam local invoke HelloWorldFunction --event events/event.json

# 4. 배포 전 확인 — 이 템플릿이 무엇을 만드는지 봅니다
sam list resources

# 5. 첫 배포 — 대화형 흐름으로 samconfig.toml 을 만듭니다
sam deploy --guided

# 6. 배포 결과 확인
sam list endpoints
sam list stack-outputs --stack-name sam-app

# 7. 정리 — 교재에 없는 단계입니다
sam delete --stack-name sam-app
```

교재 데모 첫 항목의 "**가용 런타임**"은 `sam init` 이 제시하는 런타임 목록을 가리키는 것으로 보입니다. `sam init --runtime` 이 받는 허용 값은 [8.4절](#84-sam-init)에 있습니다. 다만 **대화형 흐름이 화면에 제시하는 런타임 목록 자체는 확인하지 못했습니다**([11.5절](#115-검증하지-못한-항목)).

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

> — 출처: [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html)

> — 출처: [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html)

---

## 10. 배포 전략

교재의 배포 전략 섹션(슬라이드 25~26)은 본문에 `Canary` · `Linear` · `All-at-once` 세 단어만 있고 강사 노트 전체가 AWS CodeDeploy 설명입니다. **모듈 목표 4번은 "다양한 AWS SAM 배포 전략 설명"인데 이 섹션에 AWS SAM이 한 번도 나오지 않습니다.** 이 장은 교재가 다루는 CodeDeploy 쪽을 먼저 정리하고([10.1절](#101-배포-유형-두-가지)~[10.3절](#103-사전-정의-배포-구성)), 그다음 SAM 템플릿에서 이를 선언하는 방법을 채웁니다([10.4절](#104-sam-템플릿에서-배포-전략-선언하기)~[10.8절](#108-롤백-경로-정리)).

### 10.1 배포 유형 두 가지 🔄

교재 슬라이드 26 강사 노트는 CodeDeploy 배포 옵션을 두 가지로 제시합니다. **현재 위치 배포에 관한 서술은 문서와 일치합니다.**

| 배포 유형 | 교재 강사 노트 | 확인 |
|---|---|---|
| 현재 위치 배포 | 배포 그룹에 있는 각 인스턴스의 애플리케이션이 중지됩니다. 최신 애플리케이션 수정 버전이 설치되고, 애플리케이션의 새 버전이 시작 및 검증됩니다. **현재 위치 배포는 EC2/온프레미스 컴퓨팅 제품과 서비스를 사용하는 배포에서만 사용할 수 있습니다** | **일치.** 문서는 "EC2/온프레미스 컴퓨팅 플랫폼을 쓰는 배포만 현재 위치 배포를 쓸 수 있다"고 명시합니다 |
| 블루/그린 배포 | 업데이트된 애플리케이션 수정 버전을 이용해 트래픽이 현재 컴퓨팅 환경에서 새 환경으로 이동합니다 | **일치** |

🔄 **다만 교재는 두 층위를 나란히 놓아 Lambda 배포가 어느 유형인지 밝히지 않습니다.** 슬라이드 본문의 세 단어는 Lambda 컴퓨팅 플랫폼의 **배포 구성**이고, 강사 노트가 설명하는 현재 위치·블루/그린은 **배포 유형**입니다. 문서는 관계를 명시합니다.

| 문서 서술 | 의미 |
|---|---|
| **AWS Lambda와 Amazon ECS 배포는 현재 위치 배포 유형을 쓸 수 없습니다**(cannot use an in-place deployment type) | Lambda 배포에 현재 위치 선택지가 없습니다 |
| **모든 AWS Lambda와 Amazon ECS 배포는 블루/그린입니다**(All AWS Lambda and Amazon ECS deployments are blue/green) | Lambda 배포는 항상 블루/그린입니다 |
| EC2/온프레미스 배포는 현재 위치 **또는** 블루/그린일 수 있습니다 | 선택이 있는 쪽은 EC2/온프레미스뿐입니다 |

따라서 `Canary` · `Linear` · `All-at-once` 는 **Lambda 블루/그린 배포에서 트래픽을 옮기는 배포 구성**입니다.

플랫폼별로 무엇이 무엇으로 이동하는지도 다릅니다.

| 플랫폼 | 트래픽이 이동하는 대상 |
|---|---|
| AWS Lambda | 한 Lambda 함수 버전에서 **같은 함수의 새 버전**으로 |
| Amazon ECS | 서비스의 태스크 세트에서 **갱신된 대체 태스크 세트**로 |
| EC2/온프레미스 | 원래 환경의 인스턴스 집합에서 **대체 인스턴스 집합**으로 |

EC2/온프레미스 블루/그린 배포의 단계도 문서에 있습니다.

| 단계 | 내용 |
|---|---|
| 1 | 대체 환경 프로비저닝 |
| 2 | 최신 수정 버전 설치 |
| 3 | 애플리케이션 테스트·시스템 검증을 위한 **선택적 대기** |
| 4 | 대체 환경 인스턴스를 **Elastic Load Balancing 로드 밸런서에 등록**해 트래픽을 재라우팅하고 원래 환경 인스턴스를 등록 해제 |

EC2/온프레미스 플랫폼의 블루/그린 배포는 **Amazon EC2 인스턴스에서만** 동작합니다. 또 CloudFormation을 통한 블루/그린 배포에서는 CloudFormation 스택 업데이트의 일부로 트래픽이 이동하며, **현재는 ECS 블루/그린 배포만 지원**됩니다.

🆕 **블루/그린 배포가 현재 위치 배포보다 갖는 이점**도 교재에 없습니다. 특히 두 번째 항목이 [2.1절](#21-전통적인-소프트웨어-배포의-문제점)의 4번(롤백 계획 없음) 문제와 직결됩니다.

| 이점 | 내용 |
|---|---|
| 사전 검증 | 새 대체 환경에서 애플리케이션을 **설치·테스트한 뒤** 트래픽만 재라우팅해 프로덕션에 배포 |
| 롤백 | EC2/온프레미스에서는 원래 인스턴스가 종료되지 않았으면 **트래픽을 되돌리는 것만으로** 최신 버전으로 더 빠르고 안정적으로 되돌릴 수 있습니다. **현재 위치 배포는 이전 버전을 다시 배포해야 롤백**됩니다 |
| 트래픽 제어 | AWS Lambda 플랫폼에서는 원래 함수 버전에서 새 함수 버전으로 **트래픽이 이동하는 방식을 제어**할 수 있습니다 |

🆕 현재 위치 배포에 필요한 구성 요소도 교재에 없습니다. **AppSpec 파일(application specification file)** 로 CodeDeploy가 실행할 배포 작업을 정의하고, 배포 가능한 콘텐츠와 AppSpec 파일을 묶은 **애플리케이션 수정 버전(revision)** 을 Amazon S3 버킷이나 GitHub 리포지토리에 업로드한 뒤, 각 인스턴스의 **CodeDeploy 에이전트**가 CodeDeploy를 폴링해 대상 수정 버전을 가져와 배포합니다.

> — 출처: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

> — 출처: [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

### 10.2 컴퓨팅 플랫폼 세 가지 🔄

🔄 **교재는 컴퓨팅 플랫폼을 EC2/온프레미스와 Lambda 두 갈래로만 설명합니다.** 문서의 컴퓨팅 플랫폼은 **세 개**입니다.

| 플랫폼 | 무엇을 기술하는가 | 트래픽 관리 방식 |
|---|---|---|
| **EC2/On-Premises** | Amazon EC2 클라우드 인스턴스 · 온프레미스 서버 · 둘 다일 수 있는 **물리 서버 인스턴스** | 현재 위치 **또는** 블루/그린 배포 유형 |
| **AWS Lambda** | Lambda 함수의 **갱신된 버전**으로 구성된 애플리케이션 | canary · linear · all-at-once 구성 중에서 선택 |
| **Amazon ECS** | 컨테이너화된 애플리케이션을 **태스크 세트**로 배포 | CodeDeploy가 갱신된 버전을 **새 대체 태스크 세트**로 설치해 블루/그린 배포 |

교재가 Amazon ECS를 빠뜨린 것이 실무에서 중요한 이유는, 같은 세 배포 구성(canary · linear · all-at-once)이 **ECS 플랫폼에도 있기** 때문입니다. 즉 이 개념은 Lambda 전용이 아닙니다.

사용자 지정 배포 구성을 만드는 경로도 문서에 있습니다.

| 항목 | 내용 |
|---|---|
| 만드는 방법 | **CodeDeploy 콘솔 · AWS CLI · CodeDeploy API · CloudFormation 템플릿** |
| 콘솔에서 고르는 것 | 컴퓨팅 플랫폼으로 **EC2/On-premises · AWS Lambda · Amazon ECS** 중 하나 |
| 영역 구성(zonal configuration) | **Amazon EC2 인스턴스에 대한 현재 위치 배포에서만** 지원되고, **사전 정의 배포 구성으로는 쓸 수 없어** 사용자 지정 배포 구성을 만들어야 합니다 |

교재 강사 노트가 참조로 제시한 URL 두 개는 **모두 현재 유효합니다.**

| 교재 참조 URL | 상태 |
|---|---|
| `deployment-configurations-create.html` | **유효.** 페이지 제목은 `Create a deployment configuration with CodeDeploy` |
| `deployment-configurations.html#deployment-configuration-lambda` | **유효.** 페이지 제목은 `Working with deployment configurations in CodeDeploy` |

> — 출처: [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

> — 출처: [Create a deployment configuration with CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations-create.html)

### 10.3 사전 정의 배포 구성 🔄

교재 슬라이드 26은 `Canary` · `Linear` · `All-at-once` 세 단어만 제시하고 **사전 정의 구성의 이름을 하나도 주지 않습니다.** 문서는 이름이 정해진 목록을 제시합니다.

먼저 교재 강사 노트의 설명을 확인합니다.

| 구성 | 교재 강사 노트 | 확인 |
|---|---|---|
| Canary | **"트래픽이 2 증분씩 이동합니다."** 최초 증분에서 이동하는 트래픽 비율을 지정하는 사전 정의 옵션을 선택할 수 있고 간격을 분 단위로 선택할 수도 있습니다. 이 이동은 남은 트래픽이 두 번째 증분으로 이동하기 전에 완료됩니다 | 🔄 **첫 문장이 오역입니다.** 원문은 트래픽이 **두 번의 증분으로** 이동한다(shifted in two increments)는 뜻이고, "2 증분씩"은 증분 크기가 2라는 뜻으로 읽힙니다. 같은 노트의 뒤 문장은 올바르게 두 번의 증분을 전제하므로 교재 안에서도 어긋납니다 |
| Linear | 트래픽이 동일한 증분으로 이동하며 각 증분 간에 시간(분)이 동일합니다 | **일치** |
| All-at-once | 모든 트래픽이 기존 Lambda 함수에서 업데이트된 Lambda 함수 버전으로 **한 번에** 이동합니다 | **일치** |
| 사용자 지정 | 자체 사용자 지정 canary 또는 선형 배포 구성을 만들 수도 있습니다 | **일치** |

**Lambda 컴퓨팅 플랫폼용 사전 정의 배포 구성은 아홉 개입니다.**

| # | 배포 구성 이름 | 동작 |
|---|---|---|
| 1 | `CodeDeployDefault.LambdaCanary10Percent5Minutes` | 첫 증분에서 트래픽 **10%** 를 이동하고 나머지 **90%** 는 **5분** 뒤 배포 |
| 2 | `CodeDeployDefault.LambdaCanary10Percent10Minutes` | 나머지 90%를 **10분** 뒤 |
| 3 | `CodeDeployDefault.LambdaCanary10Percent15Minutes` | 나머지 90%를 **15분** 뒤 |
| 4 | `CodeDeployDefault.LambdaCanary10Percent30Minutes` | 나머지 90%를 **30분** 뒤 |
| 5 | `CodeDeployDefault.LambdaLinear10PercentEvery1Minute` | 모든 트래픽이 이동할 때까지 **1분마다 10%** 이동 |
| 6 | `CodeDeployDefault.LambdaLinear10PercentEvery2Minutes` | **2분마다 10%** |
| 7 | `CodeDeployDefault.LambdaLinear10PercentEvery3Minutes` | **3분마다 10%** |
| 8 | `CodeDeployDefault.LambdaLinear10PercentEvery10Minutes` | **10분마다 10%** |
| 9 | `CodeDeployDefault.LambdaAllAtOnce` | 모든 트래픽을 **한 번에** 갱신된 Lambda 함수로 이동 |

**EC2/온프레미스 플랫폼의 사전 정의 구성은 세 개이고 기본값이 있습니다.**

| 배포 구성 이름 | 비고 |
|---|---|
| `CodeDeployDefault.AllAtOnce` | — |
| `CodeDeployDefault.HalfAtATime` | — |
| `CodeDeployDefault.OneAtATime` | 🆕 **배포 구성을 지정하지 않으면 CodeDeploy가 이것을 씁니다.** 교재는 이 기본값을 다루지 않습니다 |

EC2/온프레미스 배포 구성이 무엇을 지정하는지도 정리합니다. 교재 강사 노트의 "최소 50%의 인스턴스가 필요하다면 이를 배포 구성에서 지정하면 됩니다"가 이것입니다.

| 값 | 내용 |
|---|---|
| minimum healthy hosts | 배포 중 언제든 **사용 가능한 상태로 남아 있어야 하는 인스턴스의 수나 비율** |
| minimum healthy hosts per zone | 선택적 값. 영역별 최소 정상 호스트 |

> — 출처: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

### 10.4 SAM 템플릿에서 배포 전략 선언하기 🆕

**여기가 교재의 가장 큰 공백입니다.** 모듈 목표 4번이 요구하는 "AWS SAM 배포 전략"의 실체는 `AWS::Serverless::Function` 의 두 속성입니다.

| 속성 | 무엇을 하는가 |
|---|---|
| **`AutoPublishAlias`** | 별칭 이름을 지정하면 AWS SAM이 Lambda 함수의 **Amazon S3 URI 변경을 근거로 새 코드 배포를 감지**하고, 최신 코드로 함수의 갱신된 **버전을 만들어 게시**하고, 지정한 이름의 **별칭을 만들어**(이미 있으면 그대로 사용) 갱신된 버전을 가리키게 합니다 |
| **`DeploymentPreference`** | 트래픽 이동 방식(`Type`), 자동 롤백 조건(`Alarms`), 검증 함수(`Hooks`)를 지정합니다 |

문서는 AWS SAM이 **CodeDeploy를 내장해** 점진적 AWS Lambda 배포를 제공하며, **몇 줄의 구성만으로** 네 가지를 해 준다고 기술합니다.

| # | 몇 줄의 구성으로 얻는 것 |
|---|---|
| 1 | Lambda 함수의 **새 버전을 배포**하고 새 버전을 가리키는 **별칭을 자동으로** 만듭니다 |
| 2 | 업데이트가 기대대로 동작한다고 확인할 때까지 **고객 트래픽을 점진적으로 이동**시킵니다. 제대로 동작하지 않으면 변경을 **롤백**할 수 있습니다 |
| 3 | 새로 배포한 코드가 올바르게 구성되었고 애플리케이션이 기대대로 동작하는지 검증하는 **사전 트래픽·사후 트래픽 테스트 함수**를 정의합니다 |
| 4 | **CloudWatch 경보가 트리거되면 배포를 자동으로 롤백**합니다 |

AWS SAM 템플릿으로 점진적 배포를 활성화하면 **CodeDeploy 리소스가 자동으로 생성되고 AWS Management Console에서 직접 볼 수 있습니다.** 무엇이 만들어지는지도 문서에 있습니다.

| 지정한 속성 | AWS SAM이 만드는 리소스 |
|---|---|
| `AutoPublishAlias` | `AWS::Lambda::Version` · `AWS::Lambda::Alias` |
| `DeploymentPreference` | `AWS::CodeDeploy::Application`(스택당 하나, 이름 **`ServerlessDeploymentApplication`**) · `AWS::CodeDeploy::DeploymentGroup`(이름 **`<함수-논리-ID>DeploymentGroup`**) · `AWS::IAM::Role`(이름 **`CodeDeployServiceRole`**) |

```yaml
# 모듈 목표 4번이 요구하는 "AWS SAM 배포 전략" 의 실체
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12

      # 코드가 바뀌면 새 버전을 게시하고 이 이름의 별칭이 그 버전을 가리킵니다
      AutoPublishAlias: live

      DeploymentPreference:
        # 사전 정의된 아홉 개 값 중 하나입니다. 이름 표기에 주의하세요
        Type: Canary10Percent10Minutes
```

⚠️ **호출 쪽에도 조건이 있습니다.** 문서는 함수 호출이 **별칭 한정자를 써야** 이 이점을 얻는다고 명시합니다. 즉 새 버전이 게시되고 별칭이 옮겨져도, 호출자가 별칭을 거치지 않으면 점진적 이동의 대상이 되지 않습니다.

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 10.5 DeploymentPreference 필드 🆕

`DeploymentPreference` 의 필드는 세 개입니다.

| 필드 | 내용 |
|---|---|
| `Type` | 트래픽 이동 방식. **`Canary`**(트래픽이 **두 번의 증분**으로 이동) · **`Linear`**(같은 크기의 증분으로 증분마다 같은 분 간격) · **`AllAtOnce`**(모든 트래픽이 한 번에) 세 갈래 |
| `Alarms` | 배포가 일으킨 오류로 트리거되는 **CloudWatch 경보 목록.** 트리거되면 **배포를 자동 롤백**합니다 |
| `Hooks` | 새 버전으로의 트래픽 이동 **시작 전(`PreTraffic`)** 과 **이동 완료 후(`PostTraffic`)** 에 실행하는 검증 함수 |

**사전 정의된 `Type` 값은 아홉 개입니다.** [10.3절](#103-사전-정의-배포-구성)의 CodeDeploy 이름과 표기가 다릅니다.

| # | SAM `Type` 값 | 대응하는 CodeDeploy 배포 구성 |
|---|---|---|
| 1 | `Canary10Percent5Minutes` | `CodeDeployDefault.LambdaCanary10Percent5Minutes` |
| 2 | `Canary10Percent10Minutes` | `CodeDeployDefault.LambdaCanary10Percent10Minutes` |
| 3 | `Canary10Percent15Minutes` | `CodeDeployDefault.LambdaCanary10Percent15Minutes` |
| 4 | `Canary10Percent30Minutes` | `CodeDeployDefault.LambdaCanary10Percent30Minutes` |
| 5 | `Linear10PercentEvery1Minute` | `CodeDeployDefault.LambdaLinear10PercentEvery1Minute` |
| 6 | `Linear10PercentEvery2Minutes` | `CodeDeployDefault.LambdaLinear10PercentEvery2Minutes` |
| 7 | `Linear10PercentEvery3Minutes` | `CodeDeployDefault.LambdaLinear10PercentEvery3Minutes` |
| 8 | `Linear10PercentEvery10Minutes` | `CodeDeployDefault.LambdaLinear10PercentEvery10Minutes` |
| 9 | **`AllAtOnce`** | `CodeDeployDefault.LambdaAllAtOnce` |

🔄 **표기에 주의하세요.** 교재 슬라이드 26 본문은 `All-at-once` 로 하이픈을 쓰지만 **SAM 템플릿에 쓰는 값은 `AllAtOnce`** 로 하이픈 없는 한 단어입니다. 교재 표기를 그대로 옮기면 템플릿이 유효하지 않습니다.

`Hooks` 의 동작 규칙도 문서에 있습니다.

| 항목 | 내용 |
|---|---|
| 언제 실행되는가 | `PreTraffic` 은 트래픽 이동 **시작 전**, `PostTraffic` 은 이동 **완료 후** |
| 무엇을 해야 하는가 | **두 함수 모두 CodeDeploy에 성공·실패를 콜백해야 합니다** |
| 실패하면 | **중단하고 CloudFormation에 실패를 보고**합니다 |

```yaml
# Alarms 와 Hooks 를 함께 쓴 형태
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery2Minutes
        # 이 경보가 트리거되면 배포가 자동으로 롤백됩니다
        Alarms:
          - !Ref AliasErrorMetricGreaterThanZeroAlarm
        # 두 후크 함수는 CodeDeploy 에 성공·실패를 콜백해야 합니다.
        # 실패하면 배포가 중단되고 CloudFormation 에 실패로 보고됩니다
        Hooks:
          PreTraffic: !Ref PreTrafficHookFunction
          PostTraffic: !Ref PostTrafficHookFunction
```

[2.1절](#21-전통적인-소프트웨어-배포의-문제점)의 4번 문제("롤백 계획 없음")에 대한 답이 바로 `Alarms` 와 `Hooks` 입니다. **교재는 이 둘을 전혀 다루지 않습니다.**

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

### 10.6 첫 점진적 배포는 두 단계 🆕

교재에 없고 실무에서 반드시 걸리는 제약입니다. **점진적 배포는 CodeDeploy가 트래픽을 옮겨 올 이전 버전을 요구하므로 첫 배포는 두 단계로 해야 합니다.**

| 단계 | 무엇을 두는가 | 결과 |
|---|---|---|
| 1단계 | **`AutoPublishAlias` 만** 두고 배포 | 별칭이 만들어집니다 |
| 2단계 | **`DeploymentPreference` 를 추가**해 배포 | 점진적 배포가 수행됩니다 |

```yaml
# 1단계 — AutoPublishAlias 만 두고 한 번 배포해 별칭을 만듭니다
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12
      AutoPublishAlias: live
```

```yaml
# 2단계 — DeploymentPreference 를 추가해 점진적 배포를 수행합니다
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent10Minutes
```

이 제약을 모르면 첫 배포에서 왜 점진적 이동이 일어나지 않는지 이해하기 어렵습니다. 옮겨 올 이전 버전이 없기 때문입니다.

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

### 10.7 별칭 가중치 라우팅 🆕

교재는 `Canary` · `Linear` · `All-at-once` 를 CodeDeploy 배포 구성으로만 설명하고 **그 구성이 실제로 무엇을 조작하는지** 다루지 않습니다. 문서는 **가중치 별칭 라우팅 구성이 롤링 배포를 구현하는 기반 기능**이라고 명시합니다.

| 항목 | 문서 서술 |
|---|---|
| 무엇인가 | **가중치 별칭(weighted alias)** 으로 같은 함수의 서로 다른 두 버전 사이에 트래픽을 분할합니다 |
| 무엇을 할 수 있는가 | 소량의 트래픽으로 새 버전을 테스트하고 필요하면 **빠르게 롤백**합니다. 이를 **카나리 배포**라고 합니다 |
| 블루/그린과의 차이 | 카나리 배포는 모든 트래픽을 한 번에 전환하는 대신 **요청의 일부에만** 새 버전을 노출합니다 |

⚠️ **제약이 여럿 있고 교재에 없습니다.**

| 제약 | 내용 |
|---|---|
| 버전 수 | 별칭은 **최대 두 개**의 함수 버전을 가리킬 수 있습니다 |
| 실행 역할 | 두 버전은 **실행 역할이 같아야** 합니다 |
| 데드 레터 큐 | 구성이 **같거나 없어야** 합니다 |
| 게시 상태 | 둘 다 **게시된 버전**이어야 합니다. **`$LATEST` 는 불가**합니다 |
| 트래픽이 적을 때 | Lambda가 두 버전 사이 트래픽 분배에 **단순한 확률 모델**을 쓰므로, 트래픽이 적을 때는 구성한 비율과 실제 비율의 **편차가 클 수 있습니다** |

```bash
# 별칭을 만들 때 라우팅 구성을 지정합니다. 버전 2 로 3% 를 보냅니다
aws lambda create-alias \
  --function-name listFunction \
  --name live \
  --function-version 1 \
  --routing-config AdditionalVersionWeights={"2"=0.03}

# 모든 트래픽을 버전 2 로 보냅니다.
# function-version 을 2 로 바꾸고 라우팅 구성을 비웁니다
aws lambda update-alias \
  --function-name listFunction \
  --name live \
  --function-version 2 \
  --routing-config AdditionalVersionWeights={}
```

콘솔에서는 추가 버전에 가중치(%)를 지정하면 **첫 버전이 나머지 가중치를 자동으로 받습니다.**

호출된 버전을 확인하는 방법도 교재에 없습니다.

| 확인 경로 | 내용 |
|---|---|
| CloudWatch Logs | **`START` 로그 항목**의 `Version: 2` |
| 동기 호출 응답 | **`x-amz-executed-version` 헤더** |
| 지표 | 별칭 호출 지표를 **`ExecutedVersion` 차원**으로 필터링 |

문서의 롤링 배포 절은 AWS SAM이 하는 일을 네 가지로 제시합니다. [10.4절](#104-sam-템플릿에서-배포-전략-선언하기)의 리소스 자동 생성과 같은 이야기를 다른 각도에서 서술한 것입니다.

| # | AWS SAM이 하는 일 |
|---|---|
| 1 | Lambda 함수를 구성하고 **별칭을 만듭니다.** 가중치 별칭 라우팅 구성이 롤링 배포를 구현하는 기반 기능입니다 |
| 2 | **CodeDeploy 애플리케이션과 배포 그룹**을 만듭니다. 배포 그룹이 롤링 배포와 필요 시 롤백을 관리합니다 |
| 3 | **새 함수 버전 생성을 감지**합니다 |
| 4 | **CodeDeploy가 새 버전 배포를 시작하도록 트리거**합니다 |

문서의 예시 SAM 템플릿도 `AutoPublishAlias` 와 `DeploymentPreference`(`Type: Linear10PercentEvery2Minutes`)를 씁니다.

> — 출처: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

### 10.8 롤백 경로 정리 🆕

교재 슬라이드 5는 "롤백 계획 없음"을 전통적 배포의 문제로 제시하지만 **덱 어디에도 롤백을 어떻게 구성하는지가 없습니다.** 이 문서에서 확인한 롤백 경로를 한자리에 모았습니다.

| 계층 | 무엇으로 롤백하는가 | 어디서 다뤘는가 |
|---|---|---|
| CloudFormation 스택 | 기본 동작이 **마지막 안정 상태로 롤백**. `--on-failure`(`ROLLBACK` / `DELETE` / `DO_NOTHING`)와 `--disable-rollback` 으로 제어 | [9.5절](#95-변경-세트와-롤백) |
| 배포 전 검토 | 변경 세트로 **적용 전에** 추가·수정·삭제될 리소스를 확인. `--no-execute-changeset` | [9.5절](#95-변경-세트와-롤백) |
| 템플릿 버전 관리 | 템플릿이 텍스트 파일이므로 **이전 버전의 템플릿**으로 되돌릴 수 있습니다 | [3.1절](#31-코드형-인프라) |
| Lambda 트래픽 | `DeploymentPreference` 의 **`Alarms`** 가 트리거되면 배포를 **자동 롤백** | [10.5절](#105-deploymentpreference-필드) |
| Lambda 검증 | `Hooks`(`PreTraffic` / `PostTraffic`)가 실패하면 **중단하고 CloudFormation에 실패를 보고** | [10.5절](#105-deploymentpreference-필드) |
| Lambda 별칭 | 가중치 별칭으로 소량 트래픽만 노출하고 **빠르게 롤백** | [10.7절](#107-별칭-가중치-라우팅) |
| 블루/그린(EC2) | 원래 인스턴스가 종료되지 않았으면 **트래픽을 되돌리는 것만으로** 롤백 | [10.1절](#101-배포-유형-두-가지) |
| 현재 위치(EC2) | **이전 버전을 다시 배포해야** 롤백됩니다 | [10.1절](#101-배포-유형-두-가지) |

교재 슬라이드 26 강사 노트의 문장 문제도 하나 짚어 둡니다. "애플리케이션의 배포를 사용자 지정하려면 **다음을 수행해야 합니다**"로 목록을 열고 AWS DevOps 도구 사용 · 타사 배포 도구 사용 · 자체 솔루션 구현 세 항목을 나열하는데, **세 항목은 택일 대안**입니다. "해야 합니다"로 묶여 셋 다 필요한 것처럼 읽힙니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — 출처: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

> — 출처: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

---

## 11. 교재 대비 변경 사항

교재(강사용 덱)에 있는 내용 중 현재와 달라진 항목입니다. 수강생이 공식 교재를 함께 보고 있으므로, 무엇을 왜 바꿨는지 확인할 수 있도록 남겨 둡니다.

### 11.1 교재 기술이 사실과 다른 항목

앞의 일곱 항목은 **외부 문서로 확인**한 것이고, 뒤의 열아홉 항목은 **교재 안에서 본문과 강사 노트가 어긋나거나 추출 과정에서 표기가 깨진 내부 불일치**여서 외부 문서로 검증할 대상이 아닙니다. 후자에는 근거 칸에 `—` 를 두었습니다.

| 항목 | 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|---|
| `Transform` 값의 대소문자 (슬라이드 14) | `Transform: AWS::serverless-2016-10-31` — **소문자 `s`** | 문서가 명시하는 값은 **`AWS::Serverless-2016-10-31`**(대문자 `S`)이며 이 선언은 AWS SAM 템플릿 파일에 **필수**입니다. 같은 코드 블록의 `Type: AWS::Serverless::Function` 은 대문자 `S` 를 쓰므로 교재 안에서도 표기가 갈립니다. 문서는 언어 확장을 쓸 때 `AWS::LanguageExtensions` 를 서버리스 변환보다 앞에 두어야 한다는 순서 규칙도 제시합니다 ([5.2절](#52-transform-선언)) | [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html) |
| `Globals` 를 "전역 변수"로 설명 (슬라이드 14) | 주석 상자 "AWS SAM 템플릿 내에서 사용할 **전역 변수**를 설정합니다" | `Globals` 는 변수를 선언하는 섹션이 아니라 **여러 리소스가 공통으로 쓰는 속성을 한 번만 선언해 상속시키는** 섹션입니다. 값을 파라미터화하는 섹션은 **`Parameters`** 입니다. 상속 리소스는 여덟 개이고 재정의 규칙이 데이터 유형별로 다르며(원시 값은 대체, 맵은 병합, 리스트는 앞에 추가), **선언한 속성을 리소스에서 제거할 수 없습니다.** 교재가 `Globals` 안에 적은 `Api` 의 `MethodSettings` 도 변수가 아니라 리소스 속성의 공통값입니다 ([5.3절](#53-globals-섹션)) | [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html) |
| `--use-container` 미지원 언어 (슬라이드 23) | 강사 노트 "일부 언어(예: .NET 또는 Python)에서는 `-use-container` 옵션을 사용할 수 없습니다" | **현재 `sam build` 참조 문서에 그런 서술이 없습니다.** 오히려 `--build-image` 설명이 `sam build --use-container --build-image amazon/aws-sam-cli-build-image-python3.8` 을 예로 듭니다. 문서가 명시하는 유일한 제약은 **`--build-in-source` 와의 비호환**이고, `--build-image` · `--container-env-var` · `--container-env-var-file` 은 반대로 `--use-container` 없이 쓰면 오류가 납니다. 또 강사 노트는 옵션을 하이픈 하나로 적는데 정확한 표기는 **`--use-container`**(짧은 형식 `-u`)입니다 ([9.2절](#92-sam-build-와-컨테이너-빌드)) | [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) |
| "구성 파일"을 `--template-file` 에 붙임 (슬라이드 24 · 21) | 주석 "# 구성 파일을 사용하여 배포" 아래에 `sam deploy --template-file deploy.yml` | `--template-file`(`--template`, `-t`)은 **AWS SAM 템플릿**의 경로·이름을 지정하는 옵션이고 기본값은 `template.yaml` 또는 `template.yml` 입니다. SAM의 구성 파일은 **`--config-file`** 로 지정하며 기본값은 프로젝트 루트의 **`samconfig.toml`** 이고 환경 이름은 `--config-env`(기본값 `default`)로 고릅니다. 슬라이드 21 강사 노트의 "구성 파일을 사용할 때 대화형 프롬프트를 통해 배포하려면"도 같은 혼동이며, 대화형 배포(`--guided`)와 구성 파일 기반 배포는 **서로 다른 경로**입니다 ([9.4절](#94-sam-deploy-와-samconfigtoml)) | [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) |
| Delete 함수에 읽기 역할 (슬라이드 15) | `Role: !Sub arn:aws:iam::${AWS::AccountId}:role/DynamoDBReadRole` | **DynamoDB 항목을 삭제하려면 쓰기 권한이 필요**하므로 이름과 목적이 어긋납니다. 또 문서는 **`Role` 을 설정하면 `Policies` 가 무시된다**고 명시하고, `Role` 을 주지 않으면 논리 ID가 `<함수-논리-ID>Role` 인 역할이 자동 생성된다고 기술합니다. `Policies` 에는 정책 템플릿·관리형 정책 ARN·관리형 정책 이름·인라인 정책을 쓸 수 있고, Delete 함수에는 `DynamoDBCrudPolicy` 나 `DynamoDBWritePolicy` 가 맞습니다 ([5.5절](#55-교재-슬라이드-15-템플릿-교정) · [5.6절](#56-함수-권한-policies-와-role)) | [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) |
| Canary 설명의 오역 (슬라이드 26) | 강사 노트 "Canary - 트래픽이 **2 증분씩** 이동합니다" | 원문은 트래픽이 **두 번의 증분으로** 이동한다(shifted in two increments)는 뜻입니다. "2 증분씩"은 증분 크기가 2라는 뜻으로 읽힙니다. 문서 설명은 첫 증분에서 비율을 이동하고 나머지를 N분 뒤 배포하는 형태이며, 예를 들어 `CodeDeployDefault.LambdaCanary10Percent10Minutes` 는 첫 증분에서 10%를 이동하고 나머지 90%를 10분 뒤 배포합니다. **같은 노트의 뒤 문장은 올바르게 두 번의 증분을 전제**하므로 교재 안에서도 어긋납니다 ([10.3절](#103-사전-정의-배포-구성)) | [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html) |
| 지속적 전달에 수동 승인이 필수라고 단정 (슬라이드 7) | 강사 노트 "지속적 전달은 프로덕션에 배포하기 **전에 수동 승인 단계를 거쳐야** 합니다" | 문서는 지속적 전달을 릴리스 프로세스가 자동화된 방법론으로 기술하고, 프로덕션으로의 최종 푸시 전에 **사람, 자동화된 테스트 또는 비즈니스 규칙**이 최종 푸시 시점을 결정한다고 명시합니다. 결정 주체가 사람일 수도 있지만 자동화된 테스트나 비즈니스 규칙일 수도 있으므로 **수동 승인은 필수가 아닙니다** ([2.3절](#23-devops-프로세스-세-가지)) | [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html) |
| 코드 폴더 이름 불일치 (슬라이드 15) | 강사 노트 "코드는 **`deleteFunction`** 이라는 폴더에 있습니다" vs 템플릿 `CodeUri: delete-function/` | `deleteFunction` 은 폴더 이름이 아니라 **논리 리소스 ID** 입니다. 이 문서는 논리 ID와 `CodeUri` 경로를 구분해 표기했습니다 ([5.5절](#55-교재-슬라이드-15-템플릿-교정)) | — |
| Delete 함수의 이벤트 이름이 `listNotes` (슬라이드 15) | `Events:` 아래 항목 이름이 `listNotes` 이고 슬라이드 14의 `listFunction` 이벤트 이름과 같음 | 슬라이드 14에서 복사한 흔적으로 보입니다. 같은 템플릿이 `!Ref pollyNotesTable` 을 참조하지만 **그 테이블 리소스의 정의가 슬라이드에 없고** 앞이 생략 부호로 잘려 있습니다. 또 슬라이드 15의 레이블은 "SAM 템플릿"인데 다른 슬라이드는 모두 "AWS SAM 템플릿"입니다. 이 문서는 이벤트 이름을 `deleteNote` 로 바꾸고 테이블 리소스를 함께 표기했습니다 ([5.5절](#55-교재-슬라이드-15-템플릿-교정)) | — |
| 터미널 예시의 표기 오류 네 가지 (슬라이드 21) | 프롬프트 `>>`, `_init_.py`, 스마트 쿼트, `Tests` 만 대문자 | ① 셸 프롬프트를 `>>` 로 쓰는데 슬라이드 22 · 23 · 24는 모두 `$` 를 씁니다. ② `_init_.py` 는 **`__init__.py`** 의 오기입니다(앞뒤로 밑줄이 두 개). ③ `sam build` 출력의 `functions` 목록 닫는 인용부호가 곧은 아포스트로피가 아니라 **오른쪽 작은따옴표**입니다. ④ 폴더 이름 `events` · `hello_world` 는 소문자인데 **`Tests` 만 대문자**로 시작합니다 ([8.4절](#84-sam-init)) | — |
| 강사 노트 문장이 성립하지 않음 (슬라이드 21) | Init "내장 애플리케이션이 템플릿이나 사용자 지정 템플릿을 선택할 수 있습니다" · Deploy "구성 파일을 사용할 때 대화형 프롬프트를 통해 배포하려면" | Init 항목은 "내장 애플리케이션 **템플릿**이나 사용자 지정 템플릿을 선택할 수 있습니다"의 오기로 보입니다. Deploy 항목은 인과가 뒤집혀 있습니다. **대화형 배포와 구성 파일 기반 배포는 서로 다른 경로**이고 슬라이드 24가 이 둘을 별개 예시로 제시합니다 ([8.4절](#84-sam-init) · [9.1절](#91-표준-워크플로)) | — |
| CI/CD 약어 배정과 항목 수 불일치 (슬라이드 7 · 9) | 강사 노트가 지속적 통합 = `CI`, 지속적 배포 = `CD` 로 배정하고 **지속적 전달에는 약어를 주지 않음** | 영어에서 `continuous delivery` 와 `continuous deployment` 모두 `CD` 로 줄여 쓰이므로 이 배정은 혼동을 부릅니다. 또 슬라이드 7은 세 프로세스를 제시하는데 **슬라이드 9의 DevOps 방식 6개에는 지속적 배포가 없습니다.** 이 문서는 약어를 **`CI` 하나만** 쓰고 나머지는 전체 용어로 적습니다 ([2.3절](#23-devops-프로세스-세-가지) · [2.5절](#25-devops-방식)) | — |
| 본문 레이블과 강사 노트 제목 불일치 (슬라이드 6) | 여덟 항목 중 세 항목의 이름이 갈림 | 본문 "고객의 요구에 집중" vs 노트 "고객 요구 사항 중심", 본문 "고도의 협업 환경 조성" vs 노트 "고도로 협력적인 환경 조성", 본문 "가능한 한 자동화" vs 노트 "가능한 경우 자동화". 이 문서는 **본문 레이블 기준**으로 통일했습니다 ([2.2절](#22-devops-문화)) | — |
| 다이어그램·강사 노트의 공백 누락 (슬라이드 9 · 17) | `모니터링및 로깅` · `커뮤니케이션및 협업` · `코드형` + `인프라` 두 줄 · `AWS::Serverless::Api리소스 유형` | 원본 슬라이드에서 줄바꿈이나 별개 텍스트 조각으로 나뉘어 있던 것이 합쳐진 결과로 보입니다. 정상 표기는 **모니터링 및 로깅 · 커뮤니케이션 및 협업 · 코드형 인프라 · `AWS::Serverless::Api` 리소스 유형**입니다. M12에서도 같은 유형의 붙어쓰기가 발견되었습니다 ([2.5절](#25-devops-방식) · [7.1절](#71-메커니즘-여섯-가지)) | — |
| 리소스 6개 중 4개만 매핑하고 참조 링크가 다른 슬라이드 주제 (슬라이드 16) | 매핑 표가 네 줄이고 두 번째 참조 링크가 API Gateway 리소스 정책 문서 | 슬라이드 본문은 리소스 유형 여섯 개를 제시하는데 매핑 표에는 **`AWS::Serverless::HttpApi` 와 `AWS::Serverless::LayerVersion` 의 대응 서비스가 없습니다.** 특히 `Api` 와 `HttpApi` 를 "Serverless API" 하나로 뭉갭니다. 또 두 번째 참조 링크의 주제는 **슬라이드 17(AWS SAM으로 액세스 제어)** 입니다. 링크 자체는 유효합니다 ([6.2절](#62-리소스와-aws-서비스-매핑)) | — |
| 모듈 목표 4번에 대응하는 SAM 내용이 없음 (슬라이드 3 · 32 · 25~26) | 목표와 요약이 모두 "다양한 **AWS SAM** 배포 전략 설명"을 제시 | 배포 전략 섹션에 **AWS SAM이 한 번도 나오지 않습니다.** 슬라이드 26 본문은 세 단어이고 강사 노트 전체가 CodeDeploy 설명이며, 본문(Lambda 전용 배포 구성)과 강사 노트(EC2/온프레미스 중심의 현재 위치·블루/그린, "최소 50%의 인스턴스" 예시)가 **다른 층위를 섞습니다.** 이 문서는 그 자리를 `AutoPublishAlias` 와 `DeploymentPreference` 로 채웠습니다 ([10장](#10-배포-전략)) | — |
| 대안을 요구 사항처럼 서술 (슬라이드 26) | 강사 노트 "애플리케이션의 배포를 사용자 지정하려면 **다음을 수행해야 합니다**" + 세 항목 | AWS DevOps 도구 사용 · 타사 배포 도구 사용 · 자체 솔루션 구현 세 항목은 **택일 대안**인데 "해야 합니다"로 묶여 셋 다 필요한 것처럼 읽힙니다. "다음 중 하나를 선택합니다"가 맞습니다 ([10.8절](#108-롤백-경로-정리)) | — |
| 본문 3단계 vs 강사 노트 4단계 (슬라이드 19) | 본문은 세 단계, 노트는 AWS 계정 생성을 별도로 세어 네 단계 | 또 본문은 도커를 "선택 사항"이라고만 적는데 노트는 "애플리케이션을 로컬로 테스트할 계획이라면"이라는 조건을 붙입니다. **도커가 실제로 필요한 시점**은 로컬 테스트와 컨테이너 빌드입니다 ([8.1절](#81-사전-요구-사항)) | — |
| 지식 확인 정답 표시 상자가 모두 비어 있음 (슬라이드 30) | 참/거짓 6문항의 정답 표시용 텍스트 상자 여섯 개가 전부 비어 있음 | 체크 표시가 애니메이션이나 그림으로만 들어가 있어 **추출 텍스트로는 어느 쪽이 정답인지 알 수 없고 강사 노트로만 판별**할 수 있습니다. M12 슬라이드 29와 같은 구조입니다. 이 문서는 문제와 정답·해설을 함께 표기했습니다 ([12장](#12-지식-확인-및-핵심-정리)) | — |
| 지식 확인 5번 해설이 덱에 없는 내용을 근거로 듦 (슬라이드 30) | 해설 "다양한 IDE 및 런타임 조합과 연동하여 로컬에서 코드를 빌드하고 디버깅하는 다양한 AWS 도구 키트가 있습니다" | **이 덱에는 AWS 도구 키트를 다루는 슬라이드가 없습니다.** 슬라이드 19도 CLI 설치만 다룹니다. 현재 AWS SAM 사전 요구 사항 페이지가 (선택) 3단계로 제시하는 도구 키트는 **AWS Toolkit for VS Code** 입니다 ([8.1절](#81-사전-요구-사항)) | — |
| 데모 슬라이드에 강사 노트가 없음 (슬라이드 28) | 항목만 나열되어 있고 강사 노트와 참조 URL이 모두 없음 | 무엇을 어떤 순서로 시연하는지, 무엇을 확인하면 성공인지가 없습니다. M12 슬라이드 27도 강사 노트가 없었지만 그쪽은 참조 URL을 하나 제공했습니다. 또 항목의 "빠른 템플릿"은 슬라이드 21의 `AWS Quick Start Templates` 를 옮긴 것으로 보이는데 두 슬라이드의 용어가 다릅니다. 이 문서는 데모를 명령 단위 절차로 채웠습니다 ([9.9절](#99-데모-절차)) | — |
| 템플릿 검증 기능의 명령 이름이 없음 (슬라이드 12) | 강사 노트가 CLI 기능으로 "AWS SAM 템플릿 파일이 사양에 맞게 작성되었는지 확인합니다"를 들면서 명령 이름을 주지 않음 | 슬라이드 20~24가 다루는 명령 목록에도 없습니다. 해당 명령은 **`sam validate`** 이고 `--lint` 옵션으로 `cfn-lint` 린팅까지 수행합니다 ([8.5절](#85-sam-validate)) | — |
| 모듈 목표와 모듈 요약의 문구 불일치 (슬라이드 3 · 32) | 네 항목 중 두 항목의 문구가 다름 | 2번은 "DevOps**가** … 개발 **관행**"(슬라이드 3)과 "DevOps**에서** … 개발 **방식**"(슬라이드 32)으로 조사와 용어가 갈립니다. 3번은 "AWS Serverless Application Model(AWS SAM)"과 "AWS SAM"으로 약어 표기만 다릅니다. 이 문서는 **슬라이드 3 기준**으로 통일했습니다 ([모듈 목표](#모듈-목표)) | — |
| 어젠다의 모듈 12 이름이 M12 덱과 다름 (슬라이드 2) | "애플리케이션 사용자에게 액세스 권한 부여" | M12 덱 슬라이드 1의 부제는 "내 애플리케이션의 사용자에게 액세스 권한 부여하기"입니다. 같은 모듈 이름이 두 덱에서 다릅니다 ([이 모듈의 위치](#이-모듈의-위치)) | — |
| 용어(Terminology) 슬라이드가 없음 (슬라이드 31~33) | 모듈 요약 다음에 바로 "감사합니다"로 끝남 | M12는 슬라이드 36에 용어 정의가 있었습니다. DevOps · 지속적 통합 · 코드형 인프라 · 스택 · 변경 세트 · 배포 구성처럼 이 모듈에서 새로 나오는 용어를 정리하는 자리가 없습니다. 이 문서는 용어 절을 신설하고 정의마다 출처를 붙였습니다 ([1.2절](#12-용어-정리)) | — |
| 강사 노트의 이중 공백과 부사 중복 (슬라이드 5 · 12 · 10) | "즉  사람이 수동으로" · "서버리스 애플리케이션을  동작시키세요" · "손쉽게 … 쉽게 생성하고" | 두 강사 노트에서 단어 사이에 공백이 두 칸 들어가 있고, 슬라이드 10의 CloudFormation 설명은 같은 뜻의 부사가 중복됩니다. 이 문서는 공백을 한 칸으로 정리하고 중복 부사를 제거했습니다 ([2.1절](#21-전통적인-소프트웨어-배포의-문제점) · [3.2절](#32-devops용-aws-도구)) | — |

### 11.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| SAM 리소스 유형 목록 | 슬라이드 16이 **6개** 제시(`Api` · `HttpApi` · `Function` · `LayerVersion` · `SimpleTable` · `StateMachine`) | **13개.** 교재의 여섯 개는 모두 현재도 유효하고 일곱 개가 추가되었습니다 — `Application`(중첩 서버리스 애플리케이션) · `CapacityProvider` · **`Connector`**(리소스 간 권한) · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector`. 이 리소스와 속성은 AWS SAM 축약 구문으로 정의하며 SAM은 CloudFormation 리소스·속성 유형도 지원합니다 ([6.1절](#61-리소스-유형-13개)) | [AWS SAM resources and properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-resources-and-properties.html) |
| 리소스 간 권한 지정 수단 | 슬라이드 14의 `Policies`(관리형 정책 이름)와 슬라이드 15의 `Role`(기존 역할 ARN) **두 가지만** | 교재 이후 **`AWS::Serverless::Connector`** 가 추가되었습니다. 소스 리소스 안에 `Connectors` 블록을 두는 **임베디드 커넥터 구문**과 독립 리소스로 선언하는 구문 두 가지가 있고, 문서는 대부분의 사용 사례에 임베디드 구문을 권장하며 **중첩 스택 리소스나 공유 리소스**처럼 같은 템플릿에 없는 소스를 참조할 때 독립 리소스 구문을 쓰라고 안내합니다. `Permissions` 의 유효 값은 **`Read` 와 `Write`** 두 개이고 SAM이 이 의도 선언을 필요한 IAM 권한으로 바꿉니다 ([6.3절](#63-커넥터)) | [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html) |
| SAM CLI 명령 목록 | 슬라이드 20~24가 **7개** 제시 | **24개.** 교재에 없는 명령 중 특히 **`sam validate`**(슬라이드 12가 이름 없이 언급한 기능) · **`sam sync`** · **`sam delete`** · **`sam remote invoke`** · `sam list` · `sam logs` · `sam traces` · `sam publish` · `sam pipeline`(bootstrap · init)이 중요합니다. `sam local` 하위 명령도 셋이 아니라 **여섯**(`callback` · `execution` · `generate-event` · `invoke` · `start-api` · `start-lambda`)입니다 ([8.3절](#83-cli-명령-24개) · [8.6절](#86-sam-local-하위-명령-여섯-개)) | [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html) |
| 워크플로 단계 | 슬라이드 21이 `sam init` → `sam build` → `sam local invoke` → `sam deploy` **4단계** | 교재 이후 **`sam sync`** 가 추가되었고 **AWS SAM Accelerate** 의 일부입니다. `--watch` 로 실행하면 빌드 후 CloudFormation에 배포하고 계속 실행되며 로컬 변경을 감시하다가, 갱신된 리소스가 AWS 서비스 API를 지원하면 그것으로 빠르게 갱신하고 지원하지 않으면 CloudFormation 배포를 수행합니다. `--code` 로 코드 변경만, `--resource-id` 로 특정 함수·계층만 동기화할 수 있습니다. **문서는 `sam sync` 를 개발 환경 전용으로 권장하고 프로덕션에는 `sam deploy` 또는 CI/CD 파이프라인을 권장**하므로 교재의 4단계 워크플로는 프로덕션 경로로서 여전히 유효합니다 ([9.6절](#96-sam-sync-로-개발-반복-줄이기)) | [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) |
| AWS SAM 배포 전략 | 슬라이드 25~26 전체가 CodeDeploy 설명이고 **SAM 템플릿에서 선언하는 방법이 없음** | `AWS::Serverless::Function` 의 **`AutoPublishAlias`**(별칭 자동 생성·버전 게시)와 **`DeploymentPreference`**(`Type` · `Alarms` · `Hooks`)로 선언합니다. 사전 정의 `Type` 값은 아홉 개이고 **SAM 표기는 `All-at-once` 가 아니라 `AllAtOnce`** 입니다. `DeploymentPreference` 를 지정하면 SAM이 스택당 하나인 CodeDeploy 애플리케이션(`ServerlessDeploymentApplication`) · 함수별 배포 그룹 · `CodeDeployServiceRole` 역할을 만듭니다. **첫 점진적 배포는 두 단계**로 해야 합니다 ([10.4절](#104-sam-템플릿에서-배포-전략-선언하기) ~ [10.6절](#106-첫-점진적-배포는-두-단계)) | [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html) |
| 배포 구성의 이름 | 슬라이드 26이 `Canary` · `Linear` · `All-at-once` **세 단어만** 제시 | Lambda 컴퓨팅 플랫폼용 사전 정의 배포 구성은 **아홉 개**이고 이름이 정해져 있습니다(`CodeDeployDefault.LambdaCanary10Percent5Minutes` 계열 네 개, `CodeDeployDefault.LambdaLinear10PercentEvery1Minute` 계열 네 개, `CodeDeployDefault.LambdaAllAtOnce`). EC2/온프레미스용은 세 개이고 **배포 구성을 지정하지 않으면 `CodeDeployDefault.OneAtATime` 이 쓰입니다.** 또 교재는 컴퓨팅 플랫폼을 두 갈래로만 설명해 **Amazon ECS** 를 빠뜨립니다 ([10.2절](#102-컴퓨팅-플랫폼-세-가지) · [10.3절](#103-사전-정의-배포-구성)) | [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html) |
| 배포 설정 구성 파일 | 교재가 `samconfig.toml` 을 **한 번도 언급하지 않음** | `sam deploy --guided` 는 대화형 흐름의 응답을 프로젝트의 **`samconfig.toml`** 에 기록하고, 이후 배포에서는 `sam deploy` 만 실행해도 그 값으로 배포합니다. 대화형 흐름의 기본값은 `~/.aws/config` · `~/.aws/credentials` · 프로젝트의 `samconfig.toml` 세 곳에서 가져오고 **대괄호가 기본값을 표시**합니다. 이 파일은 `sam build` · `sam deploy` · `sam package` · `sam validate` · `sam delete` · `sam init` 등이 `--config-file` 기본값으로 읽고 환경 이름은 `--config-env`(기본값 `default`)로 고릅니다. `sam init` 이 만드는 프로젝트에도 포함됩니다 ([8.4절](#84-sam-init) · [9.4절](#94-sam-deploy-와-samconfigtoml)) | [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html) |
| 배포가 변경 세트를 거친다는 사실 | 슬라이드 24와 슬라이드 21 다이어그램이 `sam deploy` → 스택으로 곧바로 이어짐 | `sam deploy` 는 **CloudFormation 변경 세트**를 만들어 배포합니다. `--confirm-changeset` 으로 실행 전 확인을 요구하고 `--no-execute-changeset` 으로 변경 세트만 만들고 종료할 수 있습니다. `sam deploy --guided` 의 `Confirm changes before deploy` 프롬프트가 이 선택입니다. 문서는 변경 세트가 제안한 변경의 영향을 미리 보여 주고 **사용자가 실행하기로 결정할 때만** 스택을 변경하며, 생성 중에 속성 구문 오류·리소스 이름 충돌·서비스 할당량 한도 같은 원인에 **배포 전 검증**을 수행한다고 기술합니다. 롤백 옵션도 교재에 없습니다 — 기본값은 마지막 안정 상태로 롤백이고 `--disable-rollback` 이나 `--on-failure`(`ROLLBACK` / `DELETE` / `DO_NOTHING`)로 바꿉니다 ([9.5절](#95-변경-세트와-롤백)) | [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html) |
| 설치 사전 요구 사항 | 슬라이드 19가 AWS 계정 · IAM 권한·보안 인증 정보 · **도커(선택)** · SAM CLI 설치로 제시 | 현재 사전 요구 사항 페이지는 AWS 계정과 IAM 자격 증명·액세스 키 페어, 그리고 자격 증명을 구성할 **AWS CLI** 를 요구 사항으로 명시하고, 단계를 AWS 계정 가입 → **AWS CLI 설치** → `aws configure` 로 자격 증명 구성 → **(선택) AWS Toolkit for VS Code 설치** 로 제시합니다. **이 페이지에는 도커 항목이 없습니다.** 도커는 로컬 테스트에서 필요하며 `sam local invoke` 문서가 도커로 로컬 컨테이너를 만들어 함수를 빌드·호출한다고 명시합니다. 설치 방법도 **2023년 9월부터 AWS 관리형 Homebrew 설치 관리자를 유지하지 않고** macOS 13.x보다 오래된 버전을 지원하지 않습니다 ([8.1절](#81-사전-요구-사항) · [8.2절](#82-설치-방법의-변화)) | [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) |
| `Policies` 에 쓸 수 있는 값 | 슬라이드 14가 AWS 관리형 정책 이름 **하나만** 제시 | 문서는 네 가지를 제시합니다 — **AWS SAM 정책 템플릿**, AWS 관리형·고객 관리형 정책의 **ARN**, 정해진 목록에 있는 관리형 정책의 **이름**, YAML 맵으로 작성한 **인라인 IAM 정책**. 정책 템플릿은 Lambda 함수와 Step Functions 상태 머신의 권한을 애플리케이션이 쓰는 리소스로 좁히는 사전 정의 정책이며 표에 **79행**이 있습니다. 자리표시자가 필요한 템플릿은 객체로, **필요 없는 템플릿은 빈 객체(`{}`)로 지정해야** 하고 빠뜨리면 `sam build` 에서 오류가 납니다. DynamoDB 관련 템플릿은 일곱 개입니다 ([5.7절](#57-sam-정책-템플릿)) | [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html) |

### 11.3 비권장·지원 종료된 항목

아래 네 항목 중 python3.8 런타임과 python3.9 런타임은 **지원이 종료된 항목**입니다. 교재 슬라이드 14 · 15 · 21 · 22의 예시를 그대로 재현하면 지원 종료된 런타임을 쓰게 되므로, 이 문서의 템플릿과 CLI 예시에서는 지원되는 런타임으로 교정했습니다.

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| `sam package` 를 별도 단계로 실행 | **비권장.** 문서가 참고(Note)로 "`sam deploy` 가 이제 `sam package` 의 기능을 암시적으로 수행한다"고 명시 | **`sam deploy`.** 버킷은 `--resolve-s3` 로 자동 생성하며 `--s3-bucket` 과 함께 지정하면 오류가 납니다. `sam deploy` 는 .zip 아티팩트를 압축해 S3에 업로드하고 필요하면 버킷을 만들며(출력에 `Managed S3 bucket`), 컨테이너 이미지는 Amazon ECR에 업로드하고 필요하면 리포지토리를 만듭니다. **`sam package` 자체는 폐기되지 않았으므로** 패키징된 템플릿을 파일로 얻어야 할 때(`--output-template-file`)는 여전히 유용합니다 ([9.3절](#93-sam-package-는-이제-별도-단계가-아니다)) | [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html) |
| `AmazonDynamoDBReadOnlyAccess` 관리형 정책을 함수에 부여 | **비권장.** 최소 권한 원칙과 거리가 있습니다 | **`DynamoDBReadPolicy` 정책 템플릿**(`TableName` 지정) 또는 **`AWS::Serverless::Connector`**. `Policies` 에 지정한 정책은 함수의 기본 IAM 실행 역할에 추가되므로, 관리형 정책을 쓰면 **계정의 모든 DynamoDB 테이블을 읽을 수 있는 권한**이 함수에 붙습니다. 정책 템플릿은 자리표시자로 대상 테이블을 지정해 권한을 그 테이블로 좁히고, 커넥터는 함수와 테이블 사이의 `Read` / `Write` 의도만 선언하면 SAM이 필요한 권한을 만듭니다. 실습·데모용으로는 동작합니다 ([5.7절](#57-sam-정책-템플릿) · [6.3절](#63-커넥터)) | [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html) |
| `python3.8` 런타임 (슬라이드 14 · 15 · 22) | **지원 종료.** Deprecated runtimes 표에 지원 종료일이 **2024년 10월 14일**, 함수 생성 차단이 2027년 2월 1일, 함수 업데이트 차단이 2027년 3월 3일로 기재 | **지원되는 Python 런타임**(`python3.12` 이상 권장. `python3.13` · `python3.14` 는 지원 종료 예정일 2029-06-30, `python3.12` 는 2028-10-31). `sam init --runtime` 은 여전히 이 값을 허용 목록에 두지만, 그 값으로 만든 함수는 지원 종료된 런타임을 씁니다. 현재 지원되는 Python 런타임은 `python3.15`(지원 종료 미예정) · `python3.14` · `python3.13` · `python3.12` · `python3.11` · `python3.10` 입니다 ([5.4절](#54-교재-슬라이드-14-템플릿-교정) · [8.4절](#84-sam-init)) | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| `python3.9` 런타임 (슬라이드 21) | **지원 종료.** Deprecated runtimes 표에 지원 종료일이 **2025년 12월 15일**, 함수 생성 차단이 2027년 2월 1일, 함수 업데이트 차단이 2027년 3월 3일로 기재 | 같음. 슬라이드 21의 `sam build` 출력 예시가 런타임을 이 값으로 표시합니다. **같은 덱의 슬라이드 14 · 15 · 22는 다른 런타임을 쓰므로 교재 안에서도 런타임 표기가 갈립니다** ([8.4절](#84-sam-init)) | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |

### 11.4 교재 이후 추가된 항목

| 항목 | 요약 | 근거 |
|---|---|---|
| `AWS::Serverless::Connector` | 두 리소스 사이의 권한을 구성. 임베디드 `Connectors` 블록(권장)과 독립 리소스 구문. `Permissions` 는 `Read` · `Write` 두 값. 세 속성 모두 AWS SAM 고유이며 CloudFormation 대응 속성이 없음 | [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html) |
| `AutoPublishAlias` 와 `DeploymentPreference` | 점진적 Lambda 배포. `Type` 사전 정의 값 9개, `Alarms` 로 경보 기반 자동 롤백, `Hooks` 로 `PreTraffic` · `PostTraffic` 검증. 지정하면 CodeDeploy 애플리케이션·배포 그룹·서비스 역할이 자동 생성. **첫 배포는 2단계**, 호출은 **별칭 한정자** 필요 | [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html) |
| `sam sync --watch`(AWS SAM Accelerate) | 로컬 변경을 감시해 가장 빠른 방법으로 동기화. `--code` · `--resource-id` · `--no-watch` · `--skip-deploy-sync`(변경이 없어도 마지막 배포 후 7일 이상이면 배포) · `--watch-exclude`. **개발 환경 전용**이며 실행 시 확인 프롬프트 | [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) |
| `samconfig.toml` | `sam deploy --guided` 의 산출물이자 이후 배포의 기준. `--config-file` 기본값, 환경은 `--config-env`(기본값 `default`). `sam init` 생성 결과 요약에 포함 | [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html) |
| CloudFormation 변경 세트 | 실행 전 영향 확인, 추가·수정·삭제 리소스와 속성 전후 비교, 배포 전 검증(속성 구문 오류·리소스 이름 충돌·서비스 할당량 한도). 실행 후 그 스택의 모든 변경 세트 제거. **성공을 보장하지는 않음** | [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html) |
| `sam deploy` 의 롤백·기능 옵션 | `--on-failure`(`ROLLBACK` 기본 / `DELETE` / `DO_NOTHING`), `--disable-rollback`(둘은 함께 사용 불가), `--capabilities`(`CAPABILITY_IAM` · `CAPABILITY_NAMED_IAM` · 중첩 애플리케이션에는 `CAPABILITY_AUTO_EXPAND`), `--stack-name` 필수, 템플릿이 51,200바이트 초과 시 `--s3-bucket` 또는 `--resolve-s3` 필요, `SAM_CLI_POLL_DELAY` 환경 변수 | [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) |
| `sam validate` | 템플릿 유효성 검증. `--lint` 로 `cfn-lint` 린팅(`cfnlintrc` 로 파라미터 지정). 템플릿이 현재 디렉터리에 표준 이름으로 있거나 방금 `sam build` 를 했으면 `--template-file` 불필요 | [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html) |
| `sam list` | `endpoints`(클라우드·로컬 엔드포인트) · `resources`(배포 시 만들어질 리소스) · `stack-outputs`(스택 출력). **배포 전후 모두** 사용 | [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html) |
| `sam delete` | 스택 · S3·ECR 아티팩트 · 템플릿 파일 삭제. ECR 컴패니언 스택 삭제 여부를 물음. `--no-prompts` 는 컴패니언 스택과 ECR 리포지토리를 **기본 삭제**하고 `--stack-name` 또는 구성 TOML 파일을 요구 | [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html) |
| `sam local start-lambda` 와 `sam remote invoke` | `start-lambda` 는 **AWS CLI·SDK와 함께 쓸** 로컬 HTTP 서버. `sam remote invoke` 는 **클라우드에 배포된 리소스를 직접 호출.** 교재는 로컬 테스트만 다룸 | [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html) |
| `sam init` 의 추가 옵션 | `--package-type Zip` / `Image`, `--architecture x86_64` / `arm64`, `--dependency-manager`, `--base-image`, `--name`, `--output-dir`, `--no-interactive`, `--tracing`, `--application-insights`(기본 비활성), `--extra-content`. `--location` 은 Git · Mercurial · HTTP/HTTPS · .zip · 경로를 받고 **Git은 리포지토리 루트**를 요구 | [sam init](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-init.html) |
| `sam local generate-event` 의 두 단계 인자 | 서비스 이름만 주면 이벤트 유형 목록, 서비스와 유형을 함께 주면 샘플 이벤트. `--region` · `--partition` · `--bucket` · `--key` 로 자리표시자 값 수정 | [Introduction to testing with sam local generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-generate-event.html) |
| `Auth` 속성(데이터 유형 `ApiAuth`) | `AWS::Serverless::Api` 의 `Properties` 안에 `Auth` → `DefaultAuthorizer` + `Authorizers`. 함수의 `Api` 이벤트에서 **`RestApiId`** 로 명시적 API 참조. 교재 템플릿은 `RestApiId` 없이 암시적 API를 만드는 형태 | [Amazon Cognito user pool example for AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-cognito-user-pool.html) |
| 액세스 제어 메커니즘 선택 지침과 오류 응답 사용자 지정 | 그린필드는 **Amazon Cognito 사용자 풀**, 기존 인증이 있거나 사용자 지정 로직이 필요하면 **Lambda 권한 부여자**(이전 명칭 custom authorizer). API Gateway 오류 응답 사용자 지정은 **`AWS::Serverless::Api` 만** 지원 | [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html) |
| `Globals` 의 상속 리소스·재정의 규칙 | 상속 리소스 8종, `Api` 지원 속성 20개, 재정의 규칙(원시 값 대체 / 맵 병합 / 리스트 앞에 추가), **선언한 속성 제거 불가**, 암시적 API 속성 재정의 | [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html) |
| 변환 결과의 구체적 형태 | 23줄 SAM 템플릿이 200줄 넘는 CloudFormation으로 확장. `Function` → `AWS::Lambda::Function` + `AWS::IAM::Role` + `AWS::Lambda::Permission`, `HttpApi` → `AWS::ApiGatewayV2::Api` + `Stage`, `SimpleTable` → `AWS::DynamoDB::Table`(`id` 해시 키, `PAY_PER_REQUEST`). `SamResourceId` 메타데이터와 `lambda:createdBy=SAM` 태그 | [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html) |
| Lambda 별칭 가중치 라우팅의 제약 | 별칭은 **최대 두 버전**, 두 버전의 실행 역할·데드 레터 큐 구성 일치, **`$LATEST` 불가**, 트래픽이 적을 때 **실제 비율 편차**. 호출된 버전은 `START` 로그의 `Version` · `x-amz-executed-version` 헤더 · `ExecutedVersion` 차원으로 확인 | [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html) |
| AWS Serverless Application Repository | 서버리스 애플리케이션을 찾고 배포하고 게시. 공개·비공개 공유, 매니페스트 파일(AWS SAM 템플릿) 업로드, **AWS Lambda 콘솔과 깊이 통합.** `sam publish` 와 `AWS::Serverless::Application` 이 연결됨. 조회 시점에 정상 제공 중 | [What Is the AWS Serverless Application Repository?](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html) |
| AWS Toolkit for VS Code | SAM 사전 요구 사항의 (선택) 3단계. 시각적 디버깅 · CodeLens 통합 · 간소화된 배포 워크플로. **Visual Studio Code 1.73.0 이상**과 YAML 언어 지원 확장 필요 | [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) |
| 컴퓨팅 플랫폼 세 개와 Lambda 배포의 성격 | 플랫폼은 EC2/On-Premises · AWS Lambda · **Amazon ECS**. **Lambda와 ECS 배포는 현재 위치 배포를 쓸 수 없고 모두 블루/그린**입니다. 블루/그린의 롤백 이점, AppSpec 파일과 CodeDeploy 에이전트, 영역 구성은 EC2 현재 위치 배포 전용 | [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html) |
| 로컬 호출의 주의와 도커 의존 | `sam local invoke` 는 **도커로 로컬 컨테이너를 만들어** 함수를 빌드·호출. 로그는 stderr, 결과는 stdout. `.aws-sam/build/<함수>` 를 컨테이너의 `/var/task` 에 마운트. **신뢰할 수 없는 코드에는 쓰지 말라**는 권고 | [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html) |
| DevOps 방식의 '구성 관리' | `What is DevOps?` 페이지는 인프라 자동화 방식으로 코드형 인프라와 함께 **구성 관리(configuration management)** 를 제시합니다. 교재 슬라이드 9의 6개 목록에는 없습니다 | [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/) |
| IaC 도구 비교와 SAM 사용 시나리오 | CloudFormation 대신 SAM(템플릿 호환성 + 서버리스 단순화), AWS CDK 대신 SAM(선언적), **둘을 함께** 쓰기(SAM CLI 로컬 테스트로 CDK 보완). 시나리오는 서버리스 애플리케이션 · **CloudFormation 보강** · 로컬 개발·테스트 · 서버리스 CI/CD · **마이그레이션** | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| 템플릿 필수·선택 섹션과 파라미터 우선순위 | **`Transform` 과 `Resources` 만 필수.** 섹션 순서는 자유이나 `AWS::LanguageExtensions` 는 서버리스 변환보다 앞. `--parameter-overrides` 와 구성 파일 항목이 **템플릿 항목보다 우선** | [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html) |
| `AWS::Serverless::Function` 의 기본값과 컨테이너 이미지 | `Timeout` 3초, `Architectures` `x86_64`, `PackageType` `Zip`(이때 `CodeUri` 또는 `InlineCode` 필요). `PackageType: Image` 면 **`ImageUri` 만 적용**되고 `Runtime` · `CodeUri` · `InlineCode` 는 무시. `Runtime` 에 `provided` 를 주면 사용자 지정 런타임 빌드 | [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) |
| `sam build` 의 옵션과 산출물 위치 | `--build-in-source`(Node.js 런타임 + Makefile·esbuild, `--use-container` 와 비호환) · `--parallel` · `--cached`(`.aws-sam/cache`) · `--exclude` · `--hook-name terraform` 등. 산출물은 `.aws-sam/build`, 빌드된 템플릿은 `.aws-sam/build/template.yaml`. **`sam deploy` 는 이 디렉터리를 배포** | [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) |

### 11.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| AWS CodeCommit의 신규 고객 제공 종료 여부 | 개발자 안내서 · FAQ · 문서 검색을 모두 시도했으나 **신규 고객 제공 중단 안내를 찾지 못했습니다.** 추측으로 채우지 않았습니다. 참고로 교재 슬라이드 10의 도구 목록에 CodeCommit은 **등장하지 않습니다** ([3.4절](#34-소스-리포지토리가-목록에-없다)) |
| AWS CodeArtifact · AWS Config · AWS X-Ray · Amazon CloudWatch의 현재 정의 | 슬라이드 10의 한 줄 설명을 대조할 **각 서비스 문서를 조회하지 않았습니다.** 이 문서의 [3.2절](#32-devops용-aws-도구) 표에서 이 네 항목은 교재 서술로만 실었습니다 |
| 슬라이드 8의 DevOps 이점 6개 | 참조 페이지는 응답했지만 **가져온 본문에 이점 절이 없어** 근거로 쓰지 않았습니다. [2.4절](#24-devops를-도입하는-이유)의 표는 교재 서술 그대로입니다 |
| 코드형 인프라(IaC)의 독립 정의 페이지 | `What is DevOps?` 페이지의 언급만 확인했습니다. **IaC를 단독으로 정의하는 페이지는 조회하지 않았습니다** ([3.1절](#31-코드형-인프라)) |
| `sam init` 이 생성하는 템플릿 파일의 정확한 기본 이름 | CLI가 **찾는** 기본 이름이 `template.yaml` · `template.yml` · `template.json` 이라는 것까지만 확인했습니다. `sam init` 이 **만드는** 파일 이름은 확인하지 못했습니다 ([5.8절](#58-템플릿-파일-이름과-상대-경로)) |
| `sam init` 프로젝트 디렉터리 구조 | 슬라이드 21이 제시하는 `events` / `hello_world` / `Tests` 트리를 대조할 **생성 결과의 디렉터리 구조**는 확인하지 못했습니다. 생성 결과 **요약**(Name · Architectures · Dependency Manager · Configuration file 등)만 확인했습니다 ([8.4절](#84-sam-init)) |
| SAM CLI에 필요한 최소 IAM 권한 목록 | 사전 요구 사항이 **"IAM 자격 증명과 IAM 액세스 키 페어"** 라는 것까지만 확인했습니다. 어떤 작업에 어떤 권한이 필요한지는 조회하지 않았습니다 ([8.1절](#81-사전-요구-사항)) |
| `sam local generate-event` 지원 서비스 전체 목록 | 문서 예시가 **생략 부호로 잘려 있어** 전체 목록을 확인하지 못했습니다. 확인한 것은 `alb` · `alexa-skills-kit` · `alexa-smart-home` · `apigateway` · `appsync` · `batch` · `cloudformation` 까지입니다 ([8.8절](#88-sam-local-generate-event)) |
| CloudFormation `DeletionPolicy` 와 스택 정책 | 변경 세트와 롤백 옵션은 확인했으나 **이 둘은 조회하지 않았습니다.** 리소스 단위 보호가 필요하면 직접 확인하세요 ([9.5절](#95-변경-세트와-롤백)) |
| AWS SAM · CloudFormation 서비스 할당량 | **조회하지 않았습니다.** 이 문서에서 확인한 수치는 템플릿·아티팩트의 51,200바이트 조건뿐입니다 |
| 지속적 배포(continuous deployment)의 AWS 공식 정의 | 조회한 CodePipeline 문서는 **continuous integration과 continuous delivery만 정의**하므로, 교재 슬라이드 7의 "지속적 배포(CD)는 구축에서 프로덕션 배포에 이르는 완전 자동화된 파이프라인입니다"라는 서술을 확인하지 못했습니다 ([2.3절](#23-devops-프로세스-세-가지)) |
| IDE용 AWS 도구 키트 전체 목록 | SAM 사전 요구 사항의 **AWS Toolkit for VS Code 하나만** 확인했습니다. 교재 슬라이드 30 지식 확인 5번 해설이 "다양한 AWS 도구 키트"를 근거로 들지만 그 목록은 확인하지 못했습니다 ([8.1절](#81-사전-요구-사항)) |

---

## 12. 지식 확인 및 핵심 정리

### 지식 확인 문제 (참/거짓)

교재 슬라이드 30의 문제를 **그대로** 싣습니다. **여섯 문제의 정답은 모두 교재와 같습니다.**

교재 슬라이드 본문의 답 표시용 텍스트 상자 여섯 개가 **모두 비어 있어**(체크 표시가 애니메이션이나 그림으로만 들어가 있음) 정답은 **강사 노트로 판별**했습니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

**문제 1**: 인적 오류는 기존 소프트웨어 배포와 관련된 위험입니다.

- ✅ **정답: 참** — 교재 해설은 "일부 배포 프로세스가 수동이라면 인적 오류가 발생할 수 있습니다"입니다. 이 문서에서 확인한 대응 수단은 변경 세트를 통한 **실행 전 검토**(`--no-execute-changeset`)와 배포 실패 시 **자동 롤백**입니다. ([2.1절](#21-전통적인-소프트웨어-배포의-문제점) · [9.5절](#95-변경-세트와-롤백))

**문제 2**: 코드형 인프라는 중요한 DevOps 방식입니다.

- ✅ **정답: 참** — 교재 해설은 "인프라는 코드에서 정의되고 소프트웨어로 취급되어야 합니다"입니다. `What is DevOps?` 페이지도 인프라 자동화 방식으로 코드형 인프라를 제시하고, 이 페이지는 함께 **구성 관리(configuration management)** 도 제시합니다. ([2.5절](#25-devops-방식) · [3.1절](#31-코드형-인프라))

**문제 3**: AWS CodePipeline은 AWS CodeBuild와 AWS CodeDeploy를 오케스트레이션할 수 있습니다.

- ✅ **정답: 참** — CodePipeline은 소프트웨어를 릴리스하는 데 필요한 단계를 **모델링·시각화·자동화**하는 지속적 전달 서비스입니다. 문서의 `DevOps pipeline example` 은 소스 스테이지 다음에 **CodeBuild 빌드 작업 → CodeBuild 단위 테스트 작업 → 배포 작업 → CodeBuild 통합 테스트 작업**을 배치하고, CodeBuild 문서도 CodeBuild를 파이프라인의 빌드·테스트 작업으로 추가할 수 있다고 명시합니다. 즉 CodePipeline이 다른 서비스를 스테이지 작업으로 오케스트레이션한다는 취지가 확인됩니다. ([3.2절](#32-devops용-aws-도구))

**문제 4**: AWS SAM 템플릿은 AWS CloudFormation 템플릿의 확장입니다.

- ✅ **정답: 참** — 문서는 AWS SAM 템플릿 사양의 성격 중 하나로 **`An extension of CloudFormation`** 을 명시하고, 같은 템플릿 안에서 CloudFormation 구문과 AWS SAM 구문을 함께 쓸 수 있다고 기술합니다. 교재 해설("AWS SAM은 자체 템플릿을 AWS CloudFormation 템플릿으로 변환한 다음 처리합니다")도 문서의 **변환적(Transformational)** 성격 서술과 일치합니다. ([4.3절](#43-작동-방식-변환))

**문제 5**: Node.js, Java, Python 또는 Go로 작성된 경우에만 AWS SAM을 사용하여 서버리스 애플리케이션을 구축할 수 있습니다.

- ❌ **정답: 거짓** — 교재 해설은 "AWS Lambda에서 지원하는 모든 런타임을 사용할 수 있습니다"입니다. 문서 기준으로도 맞습니다. `AWS::Serverless::Function` 의 `Runtime` 값은 **`AWS::Lambda::Function` 리소스의 `Runtime` 속성으로 그대로 전달**되므로 Lambda가 지원하는 런타임을 쓸 수 있고, `provided` 식별자를 지정하면 **사용자 지정 런타임**까지 쓸 수 있습니다.

  🆕 **두 가지를 덧붙입니다.** ① `PackageType: Image` 로 **컨테이너 이미지로 패키징한 함수**도 SAM으로 정의할 수 있어 선택의 폭이 런타임 목록보다 넓습니다. ② `sam init --runtime` 이 받는 값 목록에는 **Go 전용 식별자가 없고** Go 함수는 `provided` 계열 런타임으로 빌드하므로, 문제의 보기(Node.js · Java · Python · Go)를 **그대로 런타임 식별자로 읽으면 안 됩니다.** ([5.6절](#56-함수-권한-policies-와-role) · [8.4절](#84-sam-init))

  또 교재 해설의 뒷부분("다양한 IDE 및 런타임 조합과 연동하는 다양한 AWS 도구 키트가 있습니다")은 **덱에 대응 슬라이드가 없는 내용**입니다([11.1절](#111-교재-기술이-사실과-다른-항목)).

**문제 6**: `sam build` 명령은 필수 파라미터를 사용하여 새 AWS SAM 프로젝트를 초기화합니다.

- ❌ **정답: 거짓** — 교재 해설은 "`sam init` 명령이 새 AWS SAM 프로젝트를 시작합니다"입니다. 문서 기준으로 **`sam build` 는 로컬 테스트나 배포 같은 다음 단계를 위해 애플리케이션을 준비**하는 명령이고, **`sam init` 은 새 서버리스 애플리케이션을 초기화**하는 명령입니다. ([8.4절](#84-sam-init) · [9.2절](#92-sam-build-와-컨테이너-빌드))

> — 출처: [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)

> — 출처: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 🆕 보충 문제 (최신화 내용 확인)

**문제 7**: SAM 템플릿의 변환 선언은 `Transform: AWS::serverless-2016-10-31` 처럼 소문자로 써도 됩니다.

- ❌ **정답: 거짓** — 문서가 명시하는 값은 **`AWS::Serverless-2016-10-31`** 로 대문자 `S` 입니다. 교재 슬라이드 14는 소문자 `s` 로 적는데, 같은 코드 블록의 `Type: AWS::Serverless::Function` 은 대문자를 쓰므로 교재 안에서도 표기가 갈립니다. ([5.2절](#52-transform-선언))

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

**문제 8**: SAM 템플릿에서 필수 섹션은 `Transform` 과 `Resources` 두 개입니다.

- ✅ **정답: 참** — 문서는 **"Only the Transform and Resources sections are required"** 로 명시합니다. `Globals` · `Description` · `Metadata` · `Parameters` · `Mappings` · `Conditions` · `Outputs` 는 모두 선택입니다. 교재는 필수와 선택을 구분하지 않습니다. ([5.1절](#51-템플릿-섹션-구성))

> — 출처: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

**문제 9**: `Globals` 섹션은 템플릿에서 쓸 전역 변수를 선언하는 자리입니다.

- ❌ **정답: 거짓** — `Globals` 는 **여러 리소스가 공통으로 쓰는 속성**을 한 번만 선언해 상속시키는 섹션입니다. 값을 파라미터화하는 섹션은 **`Parameters`** 입니다. 교재 슬라이드 14의 주석이 "전역 변수"라고 설명하지만, 같은 슬라이드가 `Globals` 안에 적은 내용도 `Api` 의 `MethodSettings` 이므로 변수가 아니라 리소스 속성의 공통값입니다. ([5.3절](#53-globals-섹션))

> — 출처: [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html)

**문제 10**: `Globals` 에 선언한 속성은 개별 리소스에서 제거할 수 있습니다.

- ❌ **정답: 거짓** — 리소스는 `Globals` 에 선언한 속성에 **새 값을 줄 수는 있지만 제거할 수는 없습니다.** 그래서 문서는 일부 리소스만 쓰는 속성을 `Globals` 에 선언하지 말라고 안내합니다. 재정의 규칙도 데이터 유형별로 다릅니다 — 원시 값은 대체, 맵은 병합(중복 키는 리소스 우선), 리스트는 `Globals` 항목이 앞에 추가됩니다. ([5.3절](#53-globals-섹션))

> — 출처: [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html)

**문제 11**: .NET이나 Python으로 작성한 함수에는 `sam build --use-container` 를 쓸 수 없습니다.

- ❌ **정답: 거짓** 🔄 — **교재 슬라이드 23 강사 노트가 이렇게 적지만 현재 `sam build` 참조 문서에는 그런 서술이 없습니다.** 오히려 `--build-image` 설명이 `sam build --use-container --build-image amazon/aws-sam-cli-build-image-python3.8` 을 예로 듭니다. `--use-container` 는 함수가 **네이티브로 컴파일된 종속성**을 가진 패키지에 의존할 때 Lambda 같은 도커 컨테이너에서 빌드하는 옵션입니다. ([9.2절](#92-sam-build-와-컨테이너-빌드))

> — 출처: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

**문제 12**: `--use-container` 와 `--build-in-source` 를 함께 쓸 수 있습니다.

- ❌ **정답: 거짓** — 문서가 명시하는 `--use-container` 의 **유일한 비호환**이 바로 이것입니다. 반대로 `--build-image` · `--container-env-var` · `--container-env-var-file` 은 **`--use-container` 없이 쓰면 오류**가 납니다. `--build-in-source` 의 지원 런타임은 `sam init --runtime` 이 지원하는 모든 Node.js 런타임이고 지원 빌드 방법은 Makefile과 esbuild입니다. ([9.2절](#92-sam-build-와-컨테이너-빌드))

> — 출처: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

**문제 13**: `sam deploy` 로 배포하려면 먼저 `sam package` 로 아티팩트를 만들어야 합니다.

- ❌ **정답: 거짓** — 문서가 참고(Note)로 **`sam deploy` 가 `sam package` 의 기능을 암시적으로 수행**한다고 명시합니다. `sam deploy` 명령을 직접 써서 패키징과 배포를 할 수 있습니다. 버킷은 **`--resolve-s3`** 로 자동 생성하며 `--s3-bucket` 과 함께 지정하면 오류가 납니다. 다만 `sam package` 가 폐기된 것은 아니고, 패키징된 템플릿을 파일로 얻어야 할 때(`--output-template-file`)는 여전히 씁니다. ([9.3절](#93-sam-package-는-이제-별도-단계가-아니다))

> — 출처: [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html)

**문제 14**: `sam deploy --template-file deploy.yml` 은 구성 파일을 지정해 배포하는 명령입니다.

- ❌ **정답: 거짓** 🔄 — **교재 슬라이드 24가 이 예시에 "# 구성 파일을 사용하여 배포" 주석을 붙였지만** `--template-file`(`--template`, `-t`)은 **AWS SAM 템플릿**의 경로·이름을 지정하는 옵션입니다. 구성 파일은 **`--config-file`** 로 지정하고 기본값은 `samconfig.toml` 이며, 환경 이름은 `--config-env`(기본값 `default`)로 고릅니다. ([9.4절](#94-sam-deploy-와-samconfigtoml))

> — 출처: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

**문제 15**: `sam deploy --guided` 의 응답은 프로젝트의 `samconfig.toml` 에 기록되고 이후 배포에서 재사용됩니다.

- ✅ **정답: 참** — AWS SAM CLI는 대화형 흐름의 응답을 `samconfig.toml` 에 기록하고, **이후 배포에서는 `sam deploy` 만 실행해도 그 값으로 배포**합니다. 값을 다시 구성하려면 `sam deploy --guided` 를 다시 쓰거나 파일을 직접 수정합니다. 대화형 흐름의 기본값은 `~/.aws/config` · `~/.aws/credentials` · 프로젝트의 `samconfig.toml` 세 곳에서 가져옵니다. **교재는 이 파일을 한 번도 언급하지 않습니다.** ([9.4절](#94-sam-deploy-와-samconfigtoml))

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

**문제 16**: `sam deploy` 는 CloudFormation 스택을 직접 갱신하므로 변경 세트를 거치지 않습니다.

- ❌ **정답: 거짓** — 배포는 **CloudFormation 변경 세트를 거칩니다.** `--confirm-changeset` 으로 실행 전 확인 프롬프트를 띄우고 `--no-execute-changeset` 으로 변경 세트만 만들고 종료할 수 있습니다. `sam deploy --guided` 의 `Confirm changes before deploy` 프롬프트가 바로 이 선택입니다. **교재는 변경 세트를 전혀 다루지 않습니다.** ([9.5절](#95-변경-세트와-롤백))

> — 출처: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

**문제 17**: 변경 세트를 만들어 검토하면 스택 갱신이 성공하는 것이 보장됩니다.

- ❌ **정답: 거짓** — 문서는 변경 세트가 **스택 갱신 성공을 보장하지는 않는다**고 명시합니다. 변경 세트 생성 중에 속성 구문 오류 · 리소스 이름 충돌 · 서비스 할당량 한도 같은 일반적인 실패 원인에 **배포 전 검증**을 수행하지만, 사용자 지정 리소스 로직이나 서비스별 제약 같은 **런타임 조건** 때문에 발생하는 실패는 실행 중에 여전히 일어날 수 있습니다. ([9.5절](#95-변경-세트와-롤백))

> — 출처: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

**문제 18**: `--disable-rollback` 과 `--on-failure` 를 함께 지정하면 더 세밀하게 실패 동작을 제어할 수 있습니다.

- ❌ **정답: 거짓** — **두 옵션은 함께 쓸 수 없습니다.** 기본 동작은 배포 중 오류가 나면 스택이 **마지막 안정 상태로 롤백**되는 것이고, `--on-failure` 의 값은 `ROLLBACK`(기본) · `DELETE` · `DO_NOTHING`(`--disable-rollback` 과 같은 효과)입니다. ([9.5절](#95-변경-세트와-롤백))

> — 출처: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

**문제 19**: 함수에 `Role` 과 `Policies` 를 모두 지정하면 두 권한이 합쳐집니다.

- ❌ **정답: 거짓** — 문서가 **"`Role` 속성을 설정하면 이 속성(`Policies`)은 무시된다"** 고 명시합니다. `Role` 을 주지 않으면 논리 ID가 `<함수-논리-ID>Role` 인 역할이 자동으로 만들어지고, `RolePath` 와 `PermissionsBoundary` 도 **역할이 자동 생성될 때만** 동작합니다. 교재는 슬라이드 14에서 `Policies`, 슬라이드 15에서 `Role` 을 쓰면서 이 차이를 설명하지 않습니다. ([5.6절](#56-함수-권한-policies-와-role))

> — 출처: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

**문제 20**: 자리표시자 값이 필요 없는 SAM 정책 템플릿은 이름만 적으면 됩니다.

- ❌ **정답: 거짓** — 자리표시자가 필요 없는 정책 템플릿에도 **빈 객체(`{}`)를 반드시 지정해야** 합니다. 빠뜨리면 `sam build` 실행 시 `Must specify valid parameter values for policy template '<정책-템플릿-이름>'` 오류가 납니다. 일반 IAM 정책이나 AWS 관리형 정책은 CloudFormation으로 그대로 전달되므로 빈 객체 없이 쓸 수 있고, 한 `Policies` 목록에 둘을 섞어 쓸 수 있습니다. ([5.7절](#57-sam-정책-템플릿))

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

**문제 21**: DynamoDB 항목을 삭제하는 함수에는 `DynamoDBReadPolicy` 를 붙이면 됩니다.

- ❌ **정답: 거짓** — 삭제에는 **쓰기 권한**이 필요하므로 `DynamoDBCrudPolicy`(생성·읽기·업데이트·삭제) 또는 `DynamoDBWritePolicy`(쓰기 전용)가 맞습니다. 교재 슬라이드 15는 Delete 함수에 `DynamoDBReadRole` 이라는 **읽기 역할**을 붙여 이름과 목적이 어긋납니다. ([5.5절](#55-교재-슬라이드-15-템플릿-교정) · [5.7절](#57-sam-정책-템플릿))

> — 출처: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

**문제 22**: 현재 AWS SAM이 제공하는 `AWS::Serverless::*` 리소스 유형은 여섯 개입니다.

- ❌ **정답: 거짓** — **열세 개**입니다. 교재 슬라이드 16의 여섯 개(`Api` · `HttpApi` · `Function` · `LayerVersion` · `SimpleTable` · `StateMachine`)는 모두 현재도 유효하고, 여기에 `Application` · `CapacityProvider` · **`Connector`** · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector` 가 추가되었습니다. ([6.1절](#61-리소스-유형-13개))

> — 출처: [AWS SAM resources and properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-resources-and-properties.html)

**문제 23**: `AWS::Serverless::Connector` 의 `Permissions` 에는 임의의 IAM 작업 목록을 지정합니다.

- ❌ **정답: 거짓** — 유효 값은 **`Read` 와 `Write` 두 개**뿐입니다. `Read` 는 리소스에서 데이터를 읽도록 허용하는 IAM 작업, `Write` 는 리소스에 데이터를 시작·기록하도록 허용하는 IAM 작업을 포함합니다. 즉 **의도를 선언하면 SAM이 필요한 IAM 권한으로 바꿔 줍니다.** 문서는 대부분의 사용 사례에 **임베디드 커넥터 구문**을 권장합니다. ([6.3절](#63-커넥터))

> — 출처: [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html)

**문제 24**: `AWS::Serverless::HttpApi` 는 IAM 권한으로 API 액세스를 제어할 수 있습니다.

- ❌ **정답: 거짓** — **IAM 권한은 `AWS::Serverless::Api` 만 지원**합니다. 교재 슬라이드 17 표에서 `HttpApi` 의 IAM 권한 칸이 비어 있는 것이 맞고, 이 표의 **여섯 행 전부가 현재 문서 표와 정확히 일치**합니다. `HttpApi` 는 Lambda 권한 부여자 · Amazon Cognito 사용자 풀(JWT 발급자로) · OAuth 2.0/JWT 권한 부여자를 지원합니다. ([7.1절](#71-메커니즘-여섯-가지))

> — 출처: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

**문제 25**: SAM 템플릿에서 API 권한 부여를 선언하는 속성 이름은 `Auth` 입니다.

- ✅ **정답: 참** — `AWS::Serverless::Api` 의 `Properties` 안에 `Auth` 를 두고 그 아래 **`DefaultAuthorizer`** 와 **`Authorizers`** 를 선언합니다(데이터 유형 이름은 `ApiAuth`). 함수의 `Api` 이벤트에서는 **`RestApiId`** 로 그 API를 참조합니다. **교재 슬라이드 17은 "권한 부여를 활성화해야 합니다"라고만 적고 속성 이름을 하나도 제시하지 않습니다.** ([7.3절](#73-auth-속성으로-선언하기))

> — 출처: [Amazon Cognito user pool example for AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-cognito-user-pool.html)

**문제 26**: 도커는 AWS SAM CLI 사전 요구 사항 페이지에 요구 사항으로 올라 있습니다.

- ❌ **정답: 거짓** — **현재 사전 요구 사항 페이지에는 도커 항목이 없습니다.** 대신 (선택) **AWS Toolkit for VS Code** 설치가 3단계로 들어 있습니다. 다만 `sam local invoke` 는 **도커로 로컬 컨테이너를 만들어** 함수를 빌드·호출하므로 로컬 테스트를 하려면 도커가 사실상 필수입니다. 교재 슬라이드 19가 도커를 "선택 사항"으로 목록에 넣은 것과는 위치가 다릅니다. ([8.1절](#81-사전-요구-사항))

> — 출처: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

**문제 27**: AWS SAM CLI를 쓰려면 AWS CLI가 필요합니다.

- ✅ **정답: 참** — 문서는 AWS SAM CLI를 쓰려면 AWS 계정 · IAM 자격 증명 · IAM 액세스 키 페어와 함께 **AWS 자격 증명을 구성할 AWS Command Line Interface(AWS CLI)** 가 필요하다고 기술하고, 1단계를 AWS CLI 설치로 둡니다. **교재는 AWS CLI를 언급하지 않습니다.** ([8.1절](#81-사전-요구-사항))

> — 출처: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

**문제 28**: macOS에서는 AWS가 관리하는 Homebrew 설치 관리자로 AWS SAM CLI를 설치하는 것이 권장 경로입니다.

- ❌ **정답: 거짓** — **2023년 9월부터 AWS는 AWS 관리형 Homebrew 설치 관리자를 더 이상 유지하지 않습니다.** 운영 체제별 첫 번째 당사자 설치 방법을 씁니다. 또 AWS SAM CLI는 **macOS 13.x보다 오래된 버전을 지원하지 않습니다.** ([8.2절](#82-설치-방법의-변화))

> — 출처: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

**문제 29**: `sam local` 의 하위 명령은 `invoke` · `start-api` · `generate-event` 세 개입니다.

- ❌ **정답: 거짓** — **여섯 개**입니다. 교재의 세 개에 `start-lambda`(**AWS CLI·SDK와 함께 쓸** 로컬 HTTP 서버) · `callback` · `execution` 이 더 있습니다. CLI 전체 명령도 교재의 일곱 개가 아니라 **스물넷**입니다. ([8.3절](#83-cli-명령-24개) · [8.6절](#86-sam-local-하위-명령-여섯-개))

> — 출처: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

**문제 30**: 교재 슬라이드 12가 CLI 기능으로 언급한 "템플릿이 사양에 맞게 작성되었는지 확인"을 수행하는 명령은 `sam validate` 입니다.

- ✅ **정답: 참** — `sam validate` 는 AWS SAM 템플릿 파일이 유효한지 검증합니다. **`--lint` 옵션으로 `cfn-lint` 린팅까지** 수행하며 추가 파라미터는 `cfnlintrc` 구성 파일로 지정합니다. **교재는 이 명령 이름을 한 번도 제시하지 않습니다.** ([8.5절](#85-sam-validate))

> — 출처: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

**문제 31**: 교재 슬라이드 14 · 15 · 22가 쓰는 `python3.8` 런타임은 현재도 지원됩니다.

- ❌ **정답: 거짓** — Lambda 런타임 문서의 **Deprecated runtimes 표**에 지원 종료일이 **2024년 10월 14일**로 기재되어 있습니다(함수 생성 차단 2027년 2월 1일, 함수 업데이트 차단 2027년 3월 3일). `sam init --runtime` 은 여전히 이 값을 허용 목록에 두지만, 그 값으로 만든 함수는 지원 종료된 런타임을 쓰게 됩니다. 현재 지원되는 Python 런타임은 `python3.15` · `python3.14` · `python3.13` · `python3.12` · `python3.11` · `python3.10` 입니다. ([11.3절](#113-비권장지원-종료된-항목))

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**문제 32**: 교재 슬라이드 21의 `sam build` 출력에 나오는 `python3.9` 런타임은 현재도 지원됩니다.

- ❌ **정답: 거짓** — 같은 Deprecated runtimes 표에 지원 종료일이 **2025년 12월 15일**로 기재되어 있습니다. 같은 덱의 슬라이드 14 · 15 · 22가 다른 런타임을 쓰므로 **교재 안에서도 런타임 표기가 갈립니다.** 데모를 그대로 재현하면 지원 종료된 런타임을 쓰게 됩니다. ([11.3절](#113-비권장지원-종료된-항목))

> — 출처: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**문제 33**: AWS Lambda 컴퓨팅 플랫폼에서도 현재 위치 배포를 선택할 수 있습니다.

- ❌ **정답: 거짓** — 문서는 **"AWS Lambda와 Amazon ECS 배포는 현재 위치 배포 유형을 쓸 수 없다"** 고 명시하고, **"모든 AWS Lambda와 Amazon ECS 배포는 블루/그린이다"** 라고 기술합니다. 현재 위치 배포는 **EC2/온프레미스 컴퓨팅 플랫폼 전용**입니다(이 부분은 교재 서술이 맞습니다). 따라서 `Canary` · `Linear` · `All-at-once` 는 Lambda **블루/그린 배포에서 트래픽을 옮기는 배포 구성**입니다. ([10.1절](#101-배포-유형-두-가지))

> — 출처: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

**문제 34**: CodeDeploy의 컴퓨팅 플랫폼은 EC2/온프레미스와 AWS Lambda 두 개입니다.

- ❌ **정답: 거짓** — **세 개**입니다. EC2/On-Premises · AWS Lambda · **Amazon ECS**. 교재는 ECS를 언급하지 않습니다. `canary` · `linear` · `all-at-once` 배포 구성은 Lambda뿐 아니라 **ECS 플랫폼에도** 있습니다. ([10.2절](#102-컴퓨팅-플랫폼-세-가지))

> — 출처: [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

**문제 35**: EC2/온프레미스 배포에서 배포 구성을 지정하지 않으면 배포가 실패합니다.

- ❌ **정답: 거짓** — 배포 구성을 지정하지 않으면 CodeDeploy는 **`CodeDeployDefault.OneAtATime`** 을 씁니다. EC2/온프레미스용 사전 정의 구성은 `CodeDeployDefault.AllAtOnce` · `HalfAtATime` · `OneAtATime` 세 개이고, 이 플랫폼의 배포 구성은 **minimum healthy hosts**(와 선택적 minimum healthy hosts per zone)로 배포 중 사용 가능한 상태로 남아야 하는 인스턴스 수나 비율을 지정합니다. **교재는 이 기본값을 다루지 않습니다.** ([10.3절](#103-사전-정의-배포-구성))

> — 출처: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

**문제 36**: Canary 배포 구성은 트래픽을 2%씩 나눠 이동시킵니다.

- ❌ **정답: 거짓** 🔄 — **교재 강사 노트의 "트래픽이 2 증분씩 이동합니다"는 오역입니다.** 원문은 트래픽이 **두 번의 증분으로** 이동한다는 뜻입니다. 예를 들어 `CodeDeployDefault.LambdaCanary10Percent10Minutes` 는 **첫 증분에서 10%를 이동하고 나머지 90%를 10분 뒤** 배포합니다. 같은 강사 노트의 뒤 문장은 올바르게 두 번의 증분을 전제합니다. ([10.3절](#103-사전-정의-배포-구성))

> — 출처: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

**문제 37**: SAM 템플릿의 `DeploymentPreference.Type` 에 `All-at-once` 라고 적으면 됩니다.

- ❌ **정답: 거짓** — SAM 표기는 **`AllAtOnce`** 로 하이픈 없는 한 단어입니다. 교재 슬라이드 26 본문은 `All-at-once` 로 적으므로 그대로 옮기면 유효하지 않습니다. 사전 정의 `Type` 값은 아홉 개(`Canary10Percent5Minutes` · `Canary10Percent10Minutes` · `Canary10Percent15Minutes` · `Canary10Percent30Minutes` · `Linear10PercentEvery1Minute` · `Linear10PercentEvery2Minutes` · `Linear10PercentEvery3Minutes` · `Linear10PercentEvery10Minutes` · `AllAtOnce`)입니다. ([10.5절](#105-deploymentpreference-필드))

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

**문제 38**: 새 함수에 `AutoPublishAlias` 와 `DeploymentPreference` 를 함께 넣고 한 번 배포하면 첫 배포부터 점진적 이동이 일어납니다.

- ❌ **정답: 거짓** — 점진적 배포는 **CodeDeploy가 트래픽을 옮겨 올 이전 버전을 요구**하므로 첫 배포는 두 단계로 해야 합니다. **1단계는 `AutoPublishAlias` 만** 두고 배포해 별칭을 만들고, **2단계에서 `DeploymentPreference` 를 추가**해 점진적 배포를 수행합니다. **교재에는 이 제약이 없습니다.** ([10.6절](#106-첫-점진적-배포는-두-단계))

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

**문제 39**: `DeploymentPreference` 에 CloudWatch 경보를 지정하면 경보가 트리거될 때 배포가 자동으로 롤백됩니다.

- ✅ **정답: 참** — `Alarms` 는 배포가 일으킨 오류로 트리거되는 CloudWatch 경보 목록이며 **트리거되면 배포를 자동 롤백**합니다. 함께 쓰는 `Hooks` 는 트래픽 이동 시작 전(`PreTraffic`)과 완료 후(`PostTraffic`)에 실행하는 검증 함수이고, **두 함수 모두 CodeDeploy에 성공·실패를 콜백해야** 하며 실패하면 중단하고 CloudFormation에 실패를 보고합니다. 교재 슬라이드 5가 문제로 든 "롤백 계획 없음"의 답이 바로 이 둘입니다. ([10.5절](#105-deploymentpreference-필드))

> — 출처: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

**문제 40**: Lambda 별칭은 세 개 이상의 함수 버전에 트래픽을 나눠 보낼 수 있습니다.

- ❌ **정답: 거짓** — 별칭은 **최대 두 개**의 함수 버전을 가리킬 수 있습니다. 두 버전은 실행 역할이 같아야 하고 데드 레터 큐 구성이 같거나 없어야 하며, **둘 다 게시된 버전이어야 하고 `$LATEST` 는 쓸 수 없습니다.** 또 Lambda가 트래픽 분배에 **단순한 확률 모델**을 쓰므로 트래픽이 적을 때는 구성한 비율과 실제 비율의 편차가 클 수 있습니다. ([10.7절](#107-별칭-가중치-라우팅))

> — 출처: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

**문제 41**: `sam sync --watch` 는 프로덕션 배포를 빠르게 하기 위한 명령입니다.

- ❌ **정답: 거짓** — 문서는 `sam sync` 를 **개발 환경용으로 권장**하고 **프로덕션 환경에는 `sam deploy` 또는 CI/CD 파이프라인 구성을 권장**합니다. 실행하면 "이 명령은 개발 스택에만 써야 한다"는 확인 프롬프트가 나옵니다. 즉 교재의 4단계 워크플로는 프로덕션 경로로서 여전히 유효하고, `sam sync` 는 개발 반복용 별도 경로입니다. ([9.6절](#96-sam-sync-로-개발-반복-줄이기))

> — 출처: [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html)

**문제 42**: 지속적 전달은 프로덕션 배포 전에 반드시 사람의 수동 승인을 거쳐야 합니다.

- ❌ **정답: 거짓** 🔄 — **교재 슬라이드 7 강사 노트가 이렇게 단정하지만** 문서는 프로덕션으로의 최종 푸시 전에 **사람, 자동화된 테스트 또는 비즈니스 규칙** 중 하나가 최종 푸시 시점을 결정한다고 기술합니다. 즉 수동 승인은 필수가 아닙니다. 또 문서는 모든 성공적인 변경을 즉시 릴리스할 수 있지만 **모든 변경을 바로 릴리스해야 하는 것은 아니라고** 명시합니다. ([2.3절](#23-devops-프로세스-세-가지))

> — 출처: [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html)

**문제 43**: 배포한 실습·데모 리소스를 정리하려면 콘솔에서 스택을 찾아 삭제해야 합니다.

- ❌ **정답: 거짓** — **`sam delete`** 가 CloudFormation 스택, Amazon S3·Amazon ECR에 패키징·배포된 아티팩트, AWS SAM 템플릿 파일을 삭제합니다. ECR 컴패니언 스택이 있으면 삭제 여부를 묻고, `--no-prompts` 를 주면 **컴패니언 스택과 ECR 리포지토리가 기본으로 삭제되며** `--stack-name` 또는 구성 TOML 파일로 스택 이름을 반드시 제공해야 합니다. **교재는 정리 절차를 전혀 다루지 않습니다.** ([9.8절](#98-정리))

> — 출처: [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html)

**문제 44**: 배포 결과로 만들어진 리소스와 엔드포인트는 콘솔에서만 확인할 수 있습니다.

- ❌ **정답: 거짓** — **`sam list`** 의 세 하위 명령으로 확인합니다. `resources`(배포 시 만들어질 리소스) · `endpoints`(클라우드·로컬 엔드포인트) · `stack-outputs`(스택 출력). 문서는 이 명령을 **배포 전후 모두** 쓴다고 기술하므로 배포 전에 무엇이 만들어질지 미리 볼 수도 있습니다. ([9.7절](#97-배포-결과-확인))

> — 출처: [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html)

**문제 45**: AWS SAM은 서버리스 리소스만 정의할 수 있으므로 기존 CloudFormation 템플릿과 함께 쓸 수 없습니다.

- ❌ **정답: 거짓** — 문서는 SAM 템플릿 사양을 **`CloudFormation의 확장`** 으로 규정하고 같은 템플릿 안에서 두 구문을 함께 쓸 수 있다고 기술합니다. `Resources` 섹션에 **CloudFormation 리소스와 AWS SAM 리소스를 섞어 담을 수 있고**, 사용 시나리오 중 하나가 **기존 CloudFormation 템플릿에 서버리스 구성 요소를 더하는 "CloudFormation 보강"** 입니다. 교재 슬라이드 16 강사 노트도 "어떤 AWS CloudFormation 리소스든지 정의할 수 있습니다"로 같은 취지를 적습니다. ([3.3절](#33-iac-도구-비교) · [5.1절](#51-템플릿-섹션-구성))

> — 출처: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

**문제 46**: `sam deploy` 는 소스 파일을 직접 읽어 배포하므로 `sam build` 를 건너뛰어도 최신 코드가 배포됩니다.

- ❌ **정답: 거짓** — `sam deploy` 는 **`.aws-sam` 디렉터리의 빌드 아티팩트**를 배포합니다. 그래서 문서는 원본 파일을 바꾸면 **배포 전에 `sam build` 로 `.aws-sam` 디렉터리를 갱신**하라고 모범 사례로 안내합니다. 빌드 산출물은 `.aws-sam/build`, 빌드된 템플릿은 `.aws-sam/build/template.yaml` 입니다. ([9.2절](#92-sam-build-와-컨테이너-빌드) · [9.4절](#94-sam-deploy-와-samconfigtoml))

> — 출처: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

**문제 47**: SAM 템플릿의 변환은 AWS SAM CLI가 로컬에서 수행합니다.

- ❌ **정답: 거짓** — 문서는 변환이 **배포 중(during deployment)** 수행된다고 기술합니다. 템플릿을 CloudFormation에 배포하면 CloudFormation이 `Transform` 선언을 보고 서버리스 변환을 적용하며, 이것이 그 선언이 필요한 이유입니다. 문서의 예시는 **23줄 SAM 템플릿이 200줄이 넘는 CloudFormation 구문**으로 확장된다고 기술합니다. ([4.3절](#43-작동-방식-변환) · [5.2절](#52-transform-선언))

> — 출처: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

**문제 48**: `AWS::Serverless::SimpleTable` 로 만든 DynamoDB 테이블은 프로비저닝된 용량 모드를 씁니다.

- ❌ **정답: 거짓** — 변환 결과는 **`id` 를 `HASH` 키로 하는 문자열 속성**과 **`BillingMode` `PAY_PER_REQUEST`**(온디맨드)를 가진 `AWS::DynamoDB::Table` 입니다. 복합 키나 보조 인덱스가 필요하면 `AWS::DynamoDB::Table` 을 같은 템플릿에 직접 선언합니다. ([6.4절](#64-simpletable-이-만드는-테이블))

> — 출처: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

**문제 49**: `sam local generate-event` 가 지원하는 서비스는 Amazon S3 · API Gateway · Amazon SNS 세 개입니다.

- ❌ **정답: 거짓** — 교재 슬라이드 20이 "대표적인 서비스"로 세 개를 들지만 실제 목록은 훨씬 깁니다. 문서 출력 예시에 표시된 것만 해도 `alb` · `alexa-skills-kit` · `alexa-smart-home` · `apigateway` · `appsync` · `batch` · `cloudformation` 이고 목록은 그 뒤로 계속됩니다. **다만 문서 예시가 생략 부호로 잘려 있어 전체 목록은 확인하지 못했습니다**([11.5절](#115-검증하지-못한-항목)). 또 서비스 이름을 주면 이벤트 유형 목록이, 서비스와 유형을 함께 주면 샘플 이벤트가 나옵니다. ([8.8절](#88-sam-local-generate-event))

> — 출처: [Introduction to testing with sam local generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-generate-event.html)

**문제 50**: SAM 애플리케이션을 팀 안에서만 공유하려면 별도 인프라를 직접 만들어야 합니다.

- ❌ **정답: 거짓** — **AWS Serverless Application Repository** 가 서버리스 애플리케이션을 커뮤니티 전체에 **공개**로, 또는 팀·조직 안에서 **비공개**로 공유하게 해 줍니다. 게시할 때 코드와 함께 **매니페스트 파일(AWS SAM 템플릿)** 을 업로드하고, `sam publish` 명령과 `AWS::Serverless::Application` 리소스 유형이 여기에 연결됩니다. **교재는 이 서비스를 전혀 다루지 않습니다.** ([4.5절](#45-aws-serverless-application-repository))

> — 출처: [What Is the AWS Serverless Application Repository?](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html)

### 모듈 학습 목표 달성 확인

이 모듈을 마치면 다음을 수행할 수 있습니다.

- ✅ 기존 소프트웨어 개발 관행과 관련된 위험 파악 — [2.1절](#21-전통적인-소프트웨어-배포의-문제점)
- ✅ DevOps가 기존 소프트웨어 개발 관행과 관련된 위험을 해결하는 방법 설명 — [2장](#2-devops) · [3장](#3-코드형-인프라와-배포-도구)
- ✅ 서버리스 애플리케이션을 배포하기 위한 AWS SAM 템플릿 구성 — [5장](#5-sam-템플릿) · [6장](#6-sam-리소스-유형과-커넥터) · [7장](#7-api-액세스-제어)
- ✅ 다양한 AWS SAM 배포 전략 설명 — **교재의 배포 전략 섹션에 AWS SAM이 없어 [10장](#10-배포-전략)에 공식 문서로 채웠습니다**

### 한 장 요약

| 주제 | 기억할 것 |
|---|---|
| DevOps 세 프로세스 | **지속적 통합**은 코드를 자동으로 빌드·테스트, **지속적 전달**은 프로덕션까지의 전체 릴리스 프로세스 자동화. 최종 푸시는 **사람·자동화된 테스트·비즈니스 규칙** 중 하나가 결정하므로 **수동 승인은 필수가 아닙니다.** 약어는 `CI` 하나만 씁니다 |
| DevOps 방식 | 지속적 통합 · 지속적 전달 · 마이크로서비스 · 코드형 인프라 · 모니터링 및 로깅 · 커뮤니케이션 및 협업. 문서는 여기에 **구성 관리**를 더 제시합니다 |
| AWS SAM이란 | **코드형 인프라로 서버리스 애플리케이션을 구축하는 오픈 소스 프레임워크.** 구성 요소는 **템플릿 사양 + CLI** 두 개 |
| 변환 | SAM 템플릿은 **CloudFormation의 확장**이고 변환은 **배포 중** 일어납니다. 23줄이 200줄 넘는 CloudFormation으로 확장 |
| 필수 섹션 | **`Transform` 과 `Resources` 만 필수.** 값은 **`AWS::Serverless-2016-10-31`**(대문자 `S`) |
| `Globals` | **여러 리소스가 공통으로 쓰는 속성**을 한 번 선언해 상속. 변수 선언이 아닙니다. 선언한 속성은 **리소스에서 제거할 수 없습니다.** 값 파라미터화는 `Parameters` |
| 함수 권한 | **`Role` 을 주면 `Policies` 가 무시됩니다.** `Policies` 는 정책 템플릿 · 관리형 정책 ARN · 관리형 정책 이름 · 인라인 정책을 받고, **자리표시자 없는 템플릿은 `{}` 필수** |
| 권한을 좁히는 두 길 | **정책 템플릿**(`DynamoDBReadPolicy` 에 `TableName`)과 **커넥터**(`Connectors` 블록에 `Read` / `Write`). 관리형 정책 이름은 계정의 모든 테이블에 열립니다 |
| 리소스 유형 | **13개.** 교재 6개 + `Application` · `CapacityProvider` · `Connector` · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector` |
| API 액세스 제어 | 교재 슬라이드 17 표 **6행 전부가 현재와 일치**합니다. **IAM 권한·API 키·리소스 정책은 `Api` 만**, OAuth 2.0/JWT는 `HttpApi` 만. 선언 속성은 **`Auth`**(`DefaultAuthorizer` + `Authorizers`) |
| CLI 명령 | **24개.** 교재 7개 + `validate` · `sync` · `delete` · `list` · `logs` · `traces` · `publish` · `pipeline` · `remote` 계열. `sam local` 하위 명령은 **6개** |
| 설치 사전 요구 사항 | **AWS CLI 필수.** 도커는 사전 요구 사항 목록에 **없지만** 로컬 테스트에는 사실상 필수. (선택) AWS Toolkit for VS Code. **Homebrew 관리형 설치는 2023-09 중단**, macOS 13.x 미만 미지원 |
| 빌드 | `--use-container`(`-u`)의 **유일한 명시 제약은 `--build-in-source` 비호환.** 언어별 미지원 서술은 **없습니다.** 산출물은 `.aws-sam/build` |
| 배포 | **`sam deploy` 가 패키징을 암시적으로 수행**합니다. `--stack-name` 필수, 버킷은 `--resolve-s3` 로 자동 생성. **구성 파일은 `--config-file`**(기본 `samconfig.toml`) |
| 안전장치 | 배포는 **변경 세트**를 거칩니다. `--no-execute-changeset` 으로 적용 없이 확인, `--confirm-changeset` 으로 프롬프트. 롤백은 기본 동작이고 `--on-failure`(`ROLLBACK`/`DELETE`/`DO_NOTHING`)로 제어. **`--disable-rollback` 과 `--on-failure` 는 함께 못 씁니다** |
| 개발 반복 | **`sam sync --watch`(AWS SAM Accelerate)는 개발 환경 전용.** 프로덕션은 `sam deploy` 또는 CI/CD |
| 배포 유형 | **Lambda와 ECS 배포는 모두 블루/그린**이고 현재 위치 배포를 쓸 수 없습니다. 현재 위치는 **EC2/온프레미스 전용** |
| 컴퓨팅 플랫폼 | **세 개** — EC2/On-Premises · AWS Lambda · **Amazon ECS** |
| 배포 구성 | Lambda용 사전 정의 **9개**(`CodeDeployDefault.Lambda*`). EC2/온프레미스는 3개이고 기본값은 **`CodeDeployDefault.OneAtATime`**. Canary는 **두 번의 증분**으로 이동 |
| SAM 배포 전략 | **`AutoPublishAlias` + `DeploymentPreference`**(`Type` · `Alarms` · `Hooks`). SAM 표기는 **`AllAtOnce`**. **첫 점진적 배포는 2단계**, 호출은 **별칭 한정자** 필요 |
| 롤백 경로 | 스택은 `--on-failure`, Lambda 트래픽은 **`Alarms` 로 자동 롤백**, 검증은 `Hooks`, 트래픽은 **가중치 별칭**(최대 두 버전, `$LATEST` 불가) |
| 정리 | **`sam delete`** 로 스택·아티팩트·템플릿 파일 삭제. `sam list` 로 리소스·엔드포인트·스택 출력 확인 |
| 지원 종료 런타임 | **`python3.8` 은 2024-10-14**, **`python3.9` 는 2025-12-15.** 교재 템플릿을 그대로 재현하면 지원 종료된 런타임을 씁니다 |
