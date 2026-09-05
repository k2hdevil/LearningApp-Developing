# 모듈 15: 과정 마무리

## Developing on AWS (한국어)

---

## 목차

1. [과정 목표](#1-과정-목표)
2. [이 과정이 다룬 것](#2-이-과정이-다룬-것)
3. [추가 리소스](#3-추가-리소스)
4. [AWS Skill Builder](#4-aws-skill-builder)
5. [AWS Certification](#5-aws-certification)
6. [이 과정과 직결되는 자격증](#6-이-과정과-직결되는-자격증)
7. [시험 준비 4단계](#7-시험-준비-4단계)
8. [시험 등록과 응시](#8-시험-등록과-응시)
9. [교재 대비 변경 사항](#9-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 강의에서 다루지 않은 내용. AWS 공식 문서로 확인해 더한 항목입니다.
> - 🔄 강의 당시와 달라져 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [9장](#9-교재-대비-변경-사항)에 모아 두었습니다.
> - 검증일: 2026년 8월 25일. 교육·자격증 프로그램은 기술 문서보다 자주 바뀝니다. **시험 등록 전에는 반드시 링크된 원문에서 일정을 다시 확인하세요.**
> - 이 모듈은 기술 내용이 아니라 **교육 프로그램 안내**입니다. 그래서 근거가 대부분 `docs.aws.amazon.com` 이 아니라 `aws.amazon.com` 에 있습니다. 이 프로젝트는 AWS 가 직접 운영하는 도메인만 근거로 씁니다.
> - **가장 중요한 사실 하나를 앞에 둡니다.** 이 과정에 대응하는 자격증 시험 **AWS Certified Developer – Associate 가 DVA-C03 으로 개정됩니다.** 현재 버전 DVA-C02 의 마지막 응시일은 **2026년 11월 30일**이고, DVA-C03 은 2026년 12월 1일부터 제공됩니다([6.3절](#63-시험-개정-일정)).
> - 이 과정과 관련된 URL 여러 개가 리디렉션되거나 옮겨졌습니다. 어느 것이 어디로 갔는지는 [9.2절](#92-변경된-url-과-이름)에 표로 정리했습니다.

---

## 1. 과정 목표

### 이 과정에서 배운 것

이 과정의 세 가지 목표입니다.

- 개발 환경을 지원하도록 IAM 권한 구성
- AWS SDK를 사용한 클라우드 네이티브 애플리케이션 설계, 다이어그램, 구축, 배포
- AWS 리소스를 사용하여 애플리케이션 모니터링 및 유지 관리

### 이 세 줄로는 부족합니다

세 줄은 14개 모듈과 7개 실습을 대표하기에 너무 짧습니다. 수강생이 "그래서 내가 무엇을 할 수
있게 되었나"를 설명해야 할 때 쓸 수 있는 지도를 [2장](#2-이-과정이-다룬-것)에 붙였습니다.

---

## 2. 이 과정이 다룬 것

과정의 세 목표를 모듈 단위로 펼친 것입니다. 각 모듈의 상세는 이 사이트의 해당 모듈 문서에
있습니다.

### 기초와 환경 (모듈 1~3)

| 모듈 | 무엇을 할 수 있게 되었나 |
|---|---|
| 1. 과정 개요 | 이 과정이 다루는 범위와 실습 애플리케이션 구조를 파악합니다 |
| 2. AWS에서 웹 애플리케이션 구축 | 클라우드 네이티브 애플리케이션의 구성 요소와 요청 흐름을 설명합니다 |
| 3. 개발 환경 시작하기 | SDK와 개발 도구를 설치하고 자격 증명을 안전하게 설정합니다 |

### 권한 (모듈 4)

| 모듈 | 무엇을 할 수 있게 되었나 |
|---|---|
| 4. 권한 부여 시작하기 | IAM 정책·역할을 읽고 쓰며, 최소 권한으로 개발 환경을 구성합니다 |

이것이 과정 목표 1번(개발 환경을 지원하도록 IAM 권한 구성)에 대응합니다.

### 스토리지와 데이터베이스 (모듈 5~8)

| 모듈 | 무엇을 할 수 있게 되었나 |
|---|---|
| 5. 스토리지 시작하기 | Amazon S3의 버킷·객체 모델과 기본 작업을 다룹니다 |
| 6. 스토리지 애플리케이션 처리 | SDK로 S3를 다루고 사전 서명 URL·암호화·수명 주기를 적용합니다 |
| 7. 데이터베이스 시작하기 | Amazon DynamoDB의 키 설계와 기본 작업을 다룹니다 |
| 8. 데이터베이스 애플리케이션 처리 | SDK로 DynamoDB를 다루고 쿼리·스캔·인덱스·트랜잭션을 적용합니다 |

### 컴퓨팅과 API (모듈 9~11)

| 모듈 | 무엇을 할 수 있게 되었나 |
|---|---|
| 9. 컴퓨팅 서비스 처리 | AWS Lambda 함수를 만들고 이벤트·권한·구성을 다룹니다 |
| 10. API Gateway로 리팩터링 | REST API를 만들고 Lambda와 연결하며 스테이지를 관리합니다 |
| 11. 마이크로서비스 아키텍처 | 서비스를 분리하고 비동기·이벤트 기반으로 결합도를 낮춥니다 |

### 액세스, 배포, 관찰 (모듈 12~14)

| 모듈 | 무엇을 할 수 있게 되었나 |
|---|---|
| 12. 사용자에게 액세스 권한 부여 | Amazon Cognito로 인증·인가를 구성하고 토큰을 검증합니다 |
| 13. 애플리케이션 배포 | AWS SAM 템플릿을 쓰고 빌드·배포·배포 전략을 적용합니다 |
| 14. 애플리케이션 관찰 | CloudWatch와 X-Ray로 지표·로그·트레이스를 수집하고 문제를 찾습니다 |

모듈 13이 과정 목표 2번의 "배포"에, 모듈 14가 목표 3번(모니터링 및 유지 관리)에 대응합니다.

### 그리고 이 자료가 덧붙인 것

이 사이트의 각 모듈 문서에는 **`N. 교재 대비 변경 사항`** 장이 있습니다. 원본 교육 자료가
2023년 기준이라 지금과 다른 부분이 모듈마다 20~40건씩 있어, 공식 교재를 함께 볼 때 대조할 수
있게 모았습니다.

---

## 3. 추가 리소스

### 읽을 것

| 자료 | 링크 |
|---|---|
| Serverless Architectures with AWS Lambda (백서) | [PDF](https://d1.awsstatic.com/whitepapers/serverless-architectures-with-aws-lambda.pdf) |
| How AWS Pricing Works (백서) 🔄 | [문서](https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/) |
| Back to Basics (동영상 시리즈) | [페이지](https://aws.amazon.com/architecture/back-to-basics/) |
| AWS Support | [페이지](https://aws.amazon.com/premiumsupport/) |
| AWS 램프업 가이드 | [페이지](https://aws.amazon.com/training/ramp-up-guides/) |
| Tech Talks 🔄 | [페이지](https://aws.amazon.com/events/online-tech-talks/) |

요금제 백서의 예전 URL은 `welcome.html` 로 끝나는데 현재는 디렉터리 경로로
리디렉션됩니다. Tech Talks 도 `/on-demand` 가 아니라 상위 경로가 현재 위치입니다
([9.2절](#92-변경된-url-과-이름)).

> — 출처: [How AWS Pricing Works](https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/)

> — 출처: [Back to Basics](https://aws.amazon.com/architecture/back-to-basics/)

### 다음 단계 (후속 과정)

이 과정을 마친 뒤의 후속 과정 네 가지입니다. 등록 경로가 모두 AWS Skill Builder 로 옮겨졌습니다
([9.2절](#92-변경된-url-과-이름)).

| 과정 | 성격 | 현재 경로 |
|---|---|---|
| Advanced Developing on AWS | 강의식 | [aws.amazon.com/training/classroom/advanced-developing-on-aws](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/) |
| Developing Serverless Solutions on AWS | 강의식 | [aws.amazon.com/training/classroom/developing-serverless-solutions-on-aws](https://aws.amazon.com/training/classroom/developing-serverless-solutions-on-aws/) |
| Getting Started with DevOps on AWS | 디지털 | 이전 경로는 `www.aws.training/Details/eLearning?id=66768` 입니다 |
| AWS Cloud Development Kit Primer | 디지털 | 이전 경로는 `www.aws.training/Details/Curriculum?id=64511` 입니다 |

두 강의식 과정의 이전 `www.aws.training/SessionSearch?...` URL 은 위 경로로 대체되고,
그 경로가 다시 Skill Builder 로 리디렉션됩니다. 디지털 과정 두 개는 `www.aws.training` 경로가
아직 응답하지만, 이 프로젝트의 근거 도메인 규칙상 인용 대상이 아니어서 코드로만 적었습니다.
현재 위치는 [AWS Skill Builder](https://aws.amazon.com/training/digital/)에서 과정 이름으로
검색하는 것이 가장 확실합니다.

> — 출처: [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/)

### 새로 생긴 후속 과정 🆕

이 과정을 마친 개발자에게 지금 새로 생긴 갈래가 있습니다.

| 과정 | 내용 |
|---|---|
| Advanced Generative AI Development on AWS | 파운데이션 모델 구현, Amazon Bedrock Knowledge Bases 를 사용한 검색 증강, Bedrock AgentCore 를 사용한 에이전틱 AI 개발, 엔터프라이즈 통합 패턴. **3일 실습 형식** |

이 과정은 뒤에 나오는 `AWS Certified Generative AI Developer – Professional` 자격증과
짝을 이룹니다([5.4절](#54-이후-추가된-자격증)).

> — 출처: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

---

## 4. AWS Skill Builder

### 4.1 무엇인가

AWS 의 온라인 학습 센터입니다. 예전에는 "600여 개의 디지털 과정"으로 소개됐지만 지금은 규모가
달라졌습니다.

| 항목 | 이전 값 | 확인된 현재 값 |
|---|---|---|
| 무료 자습형 디지털 과정 | 600개 이상 | **900개가 넘습니다** |
| 무료 학습 리소스 전체 | (언급 없음) | **1,000개가 넘습니다** |

> — 출처: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

### 4.2 학습 방식 세 갈래 🔄

예전에는 "무료 디지털 교육"과 "강의식 교육" 두 갈래였지만 현재는 셋입니다.

| 방식 | 내용 | 제공 조건 |
|---|---|---|
| Digital Courses (자습형) | AWS 서비스와 기술 수준 전반을 다루는 900개 이상의 무료 자습형 과정. 지식 평가 포함 | 무료 |
| Digital Classroom (자습형) | 강사가 진행한 영상, 실습, 이해도 점검, 과정 평가로 특정 주제를 깊게 다룹니다 | **Individual Annual 또는 Team 구독** |
| AWS Classroom Training (라이브) | AWS 인증 강사가 발표·토론·실습으로 진행합니다. 질문하고 실시간으로 해법을 함께 만들며 개별 피드백을 받습니다. 대면 또는 가상, 공개 세션 또는 팀 전용 세션 | 유료 |

몰입형 학습 경험 전체를 쓰려면 **Skill Builder Individual 또는 Team 구독**으로 업그레이드해야
합니다.

> — 출처: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

### 4.3 실습과 성과 표시 🆕

| 기능 | 내용 |
|---|---|
| 실습 환경 | 실제 AWS 시나리오를 재현한 실습과 몰입형 환경에서 연습합니다 |
| Skills Profile | 자격증, 배지, 실습 성과를 하나의 프로필에 모아 공개합니다. LinkedIn 으로 확장할 수 있습니다 |

**AWS Builder Labs** 의 페이지는 현재
`aws.amazon.com/training/digital/immersive-learning/` 로 리디렉션됩니다
([9.2절](#92-변경된-url-과-이름)).

> — 출처: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

> — 출처: [Immersive learning](https://aws.amazon.com/training/digital/immersive-learning/)

---

## 5. AWS Certification

### 5.1 네 레벨

AWS Certification 의 네 레벨입니다.

| 레벨 | 성격 | 권장 경험 |
|---|---|---|
| Foundational | 지식 기반. AWS Cloud 기본 사항 | 기초 AWS 클라우드 경험 및 업계 지식 6개월. **이전 경험은 필요하지 않습니다** |
| Associate | 역할 기반. 지식과 기술을 보여 줍니다 | AWS 클라우드를 통한 문제 해결 및 솔루션 구현 경험 1년 |
| Professional | 직무 기반. 고급 기술과 지식을 검증합니다 | AWS 클라우드를 통한 솔루션 설계·운영·문제 해결 경험 2년 |
| Specialty | 구체적인 주제에 중점 | 시험 가이드에 지정된 도메인에서의 기술 경험. 권장 수준은 다양합니다 |

문서로 확인한 실제 값과 대조하면 이 레벨 설명은 맞습니다.

| 자격증 | 확인된 권장 경험 |
|---|---|
| AWS Certified Cloud Practitioner (Foundational) | AWS 클라우드 노출 경험 **6개월까지**를 가정하지만 **필수는 아닙니다.** IT 배경이 없을 수 있는 입문자와 영업·마케팅·제품·프로젝트 관리 같은 현업 직무를 대상으로 합니다 |
| AWS Certified Developer – Associate | AWS 서비스로 애플리케이션을 개발·유지 관리한 실무 경험 **1년 이상** |
| AWS Certified DevOps Engineer – Professional | AWS 환경을 프로비저닝·운영·관리한 경험 **2년 이상**. 소프트웨어 개발 수명 주기와 프로그래밍 또는 스크립팅 경험도 권장 |

> — 출처: [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/)

> — 출처: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

> — 출처: [AWS Certified DevOps Engineer – Professional](https://aws.amazon.com/certification/certified-devops-engineer-professional/)

### 5.2 시험 범위를 확인하는 방법

AWS 가 밝힌 중요한 원칙이 있습니다.

> AWS는 자격증 시험에서 다루는 모든 서비스 또는 기능의 목록을 게시하지 않습니다. 그러나 각
> 시험의 시험 가이드에는 시험에서 다루는 현재 주제 영역 및 목표가 나열되어 있습니다.

그래서 **시험 가이드가 유일한 공식 범위 문서**입니다. "이 서비스가 시험에 나오나요"라는 질문에
대한 답은 시험 가이드에 있는 도메인과 태스크 문장입니다.

AWS 는 이렇게도 안내합니다.

> 시험은 자주 업데이트되며 제공되는 시험과 각 시험의 테스트 항목에 관한 세부 정보는 변경될
> 수 있습니다.

**이 안내대로 되었습니다.** 이후 자격증 목록이 여러 번 바뀌었습니다
([5.3절](#53-이후-종료된-자격증), [5.4절](#54-이후-추가된-자격증)).

### 5.3 이후 종료된 자격증 🔄

예전 목록은 지금과 다릅니다.

| 자격증 | 마지막 응시일 | 대체 경로 |
|---|---|---|
| AWS Certified Data Analytics – Specialty | 2024년 4월 8일 | AWS Certified Data Engineer – Associate |
| AWS Certified Database – Specialty | 2024년 4월 29일 | — |
| AWS Certified: SAP on AWS – Specialty | 2024년 4월 29일 | — |
| AWS Certified Machine Learning – Specialty | **2026년 3월 31일** | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional |

AWS 가 밝힌 이유는 **Specialty 자격증 수를 줄이고 Foundational · Associate · Professional
레벨의 제공을 강화**하는 것입니다.

세 가지를 알아 두어야 합니다.

- **이미 취득한 자격증은 유지됩니다.** 취득일로부터 3년간 활성 상태로 남고 Credly 디지털 배지도
  계속 표시할 수 있습니다.
- **재인증은 불가능합니다.** 종료일 이후에는 시험을 제공하지 않기 때문입니다.
- **시험 준비 자료도 함께 종료되었습니다.** Official Practice Question Sets, Official Practice
  Exams, Exam Prep 과정이 모두 포함됩니다.

> — 출처: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

> — 출처: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

### 5.4 이후 추가된 자격증 🆕

| 자격증 | 레벨 | 내용 |
|---|---|---|
| AWS Certified Data Engineer – Associate | Associate | 2024년 3월 12일부터 예약·응시 가능. 핵심 데이터 관련 AWS 서비스의 기술과 지식을 검증합니다 |
| AWS Certified AI Practitioner | Foundational | ML Specialty 종료 안내에서 대체 경로로 제시됩니다 |
| AWS Certified Machine Learning Engineer – Associate | Associate | ML 워크로드를 프로덕션에 구현하고 운영화하는 기술을 검증합니다. **MLA-C02 로 개정 중**입니다 |
| AWS Certified Generative AI Developer – Professional | Professional | **개발자에게 가장 직접적인 다음 단계입니다.** 파운데이션 모델을 애플리케이션과 비즈니스 워크플로에 통합하는 능력을 검증합니다 |

**AWS Certified Generative AI Developer – Professional** 의 시험 정보입니다.

| 항목 | 값 |
|---|---|
| 범주 | Professional |
| 시험 시간 | 180분 |
| 문항 | 75개 (선택형 또는 복수 응답) |
| 응시료 | 300 USD |
| 응시 방식 | Pearson VUE 시험 센터 또는 온라인 감독 시험 |
| 제공 언어 | 영어, 일본어, **한국어**, 중국어 간체 |

권장 경험은 AWS 또는 오픈 소스 기술로 프로덕션급 애플리케이션을 만든 경험 2년 이상, 일반적인
AI/ML 또는 데이터 엔지니어링 경험, 그리고 생성형 AI 솔루션 구현 실무 경험 1년입니다. 베타
버전의 마지막 응시일은 2026년 3월 31일이었고 표준 버전 등록이 열려 있습니다.

> — 출처: [AWS Certified Generative AI Developer – Professional](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)

> — 출처: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

> — 출처: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

### 5.5 마이크로크리덴셜 🆕

예전에는 검증 수단이 자격증뿐이었지만 지금은 하나 더 있습니다.

| 구분 | 무엇을 검증하는가 |
|---|---|
| Certification | 폭넓은 **기술 지식과 이해** |
| 마이크로크리덴셜 | AWS 환경에서 문제를 **식별·해결하고 솔루션을 구현하는 능력** |

마이크로크리덴셜은 **라이브 AWS 환경에서 실시간 평가**로 실무 기술을 검증합니다. 현재 주제는
서버리스, 에이전틱 AI, 애플리케이션 네트워킹, 인시던트 대응이고 주제가 더 추가될 예정입니다.
**AWS Skill Builder 구독이 필요하지 않습니다.**

둘을 함께 취득하면 "아는 것"과 "할 수 있는 것"을 모두 검증합니다.

개발자와 관련이 깊은 것은 **AWS Agentic AI Demonstrated** 마이크로크리덴셜입니다. 프로비저닝된
AWS 환경에서 다음을 평가합니다.

- AWS 서비스로 AI 솔루션을 구현하는 능력
- 실제 시나리오에서 문제를 식별하고 해결하는 능력
- 프로덕션 환경에서 AI 워크로드를 배포하고 관리하는 능력

> — 출처: [AWS Certification](https://aws.amazon.com/certification/)

> — 출처: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

---

## 6. 이 과정과 직결되는 자격증

자격증 레벨만으로는 **어느 시험을 봐야 하는지** 알 수 없습니다. 수강생이 가장 먼저 묻는
질문이라 여기서 답합니다.

### 6.1 AWS Certified Developer – Associate 🆕

이 과정에 대응하는 자격증입니다.

| 항목 | 내용 |
|---|---|
| 권장 경험 | 시험 가이드 기준으로 AWS 서비스를 사용해 애플리케이션을 개발·유지 관리한 실무 경험 **1년 이상** |
| 누구에게 맞나 | IT 또는 클라우드 개발자 직무에 있는 사람에게 **AWS Certification 여정의 이상적인 출발점** |
| IT 경험이 없다면 | AWS Certified Cloud Practitioner 를 먼저 취득해 기초 지식을 얻는 것이 도움이 됩니다 |
| 얻는 것 | 업계에서 인정받는 자격증으로 기술 동료·고객에 대한 신뢰도가 올라갑니다. Professional·Specialty 범주의 추가 자격증으로 가는 출발점이 됩니다 |

**다음 단계로 다른 사람들이 취득한 자격증**입니다.

| 자격증 | 어떤 역할로 가는가 |
|---|---|
| AWS Certified SysOps Administrator – Associate | 클라우드 DevOps 엔지니어, 소프트웨어 개발 엔지니어 |
| AWS Certified DevOps Engineer – Professional | 같은 방향. **이것을 취득하면 Developer – Associate 가 자동으로 재인증됩니다** |
| AWS Certified Data Engineer – Associate | 머신 러닝 엔지니어 방향 |

> — 출처: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

### 6.2 유효 기간과 재인증 🆕

**취득 후 가장 중요한 내용입니다.** 모르면 만료됩니다.

| 항목 | 내용 |
|---|---|
| 유효 기간 | **3년** |
| 갱신 방법 1 | 최신 버전 시험에 합격합니다 |
| 갱신 방법 2 | **AWS Certified DevOps Engineer – Professional 을 취득하면** 이 Associate 자격증이 자동으로 재인증됩니다 |

재인증 방식은 두 가지로 나뉘고 **연장 기간이 다릅니다.**

| 방식 | 연장 | 기준 시점 |
|---|---|---|
| 갱신 (renewal) | **3년** | 시험을 완료한 날 |
| 유지 (maintenance) | **1년** | 유지 활동을 완료한 날 |

유지 방식을 쓰려면 **만료 90일 이내인 활성 자격증**과 **활성 AWS Skill Builder 구독**(Monthly,
Annual 또는 Team)이 필요합니다.

참고로 Cloud Practitioner 는 재인증 경로가 하나 더 있습니다. `AWS Cloud Quest: Recertify
Cloud Practitioner` 게임 기반 학습을 완료하면 됩니다. 만료 6개월 이내에 자격이 생기고 완료하면
유효 기간이 3년 연장됩니다.

> — 출처: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

> — 출처: [AWS Recertification](https://aws.amazon.com/certification/recertification/)

> — 출처: [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/)

### 6.3 시험 개정 일정 🆕

**시험은 코드로 개정됩니다.** 준비한 범위와 실제로 보는 시험이 어긋나지 않게 일정을 알아야
합니다.

| 날짜 | 무슨 일 |
|---|---|
| 2026년 10월 27일 | DVA-C03 **등록 시작** (모든 언어) |
| 2026년 11월 30일 | DVA-C02 **마지막 응시일** |
| 2026년 12월 1일 | DVA-C03 **GA 제공 시작** |

**DVA-C03 시험 정보**입니다.

| 항목 | 값 |
|---|---|
| 시험 시간 | 130분 |
| 문항 | 65개 (채점 50개, **비채점 15개**) |
| 응시료 | 150 USD |
| 합격 점수 | 1,000점 만점에 **720점** |
| 제공 언어 | 출시 시점에 현재 지원되는 모든 언어 |
| 응시 방식 | Pearson VUE (시험 센터 또는 온라인 감독) |

**어느 쪽을 볼지 정하는 기준**입니다.

| 선택 | 언제 |
|---|---|
| DVA-C02 (2026년 11월 30일까지) | 이미 준비가 되어 지금 자격증을 얻고 싶을 때. 취득한 자격증은 원래 만료일까지 유효합니다 |
| DVA-C03 (등록 2026년 10월 27일부터) | AI 지원 개발 기술과 AI 서비스의 최신 보안 관행까지 검증하고 싶을 때 |

> — 출처: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

### 6.4 DVA-C03 에서 무엇이 바뀌나 🆕

이 과정을 막 마친 사람에게 특히 중요합니다. **도메인 구조는 그대로**이고 안에 들어가는 내용이
바뀝니다.

| 도메인 | 비중 |
|---|---|
| AWS 서비스를 사용한 개발 | 30% |
| 보안 | 26% |
| 테스트와 배포 | 22% |
| 문제 해결과 최적화 | 22% |

**추가되는 것**입니다.

| 항목 | 내용 |
|---|---|
| 새 태스크 2.3 — AI 보안 (5개 스킬) | AI 서비스 액세스 관리, 데이터 프라이버시 제어(VPC 엔드포인트, 입출력이 AI 모델 학습에 쓰이지 않도록 보장), 콘텐츠 필터링과 프롬프트 인젝션 방어, AI 에이전트 상호 작용 보안(도구 사용 권한 부여, 세션 격리, 사람 개입 승인 흐름), 모니터링 로그의 민감 콘텐츠 보호 |
| AI 지원 개발 (모든 도메인) | 코드 생성과 자동 검토(도메인 1), 테스트 자동화와 회귀 테스트(도메인 3), 자동 배포 승인을 포함한 CI/CD 워크플로 지원(도메인 3), 오류 분석과 문제 해결 제안(도메인 4), 성능 최적화 권장(도메인 4) |
| 컨테이너 관리 | Amazon ECR 로 컨테이너 이미지를 빌드·관리하고 Amazon ECS · Amazon EKS · AWS Fargate 로 컨테이너 애플리케이션을 배포 |
| 새로 범위에 들어오는 서비스 | Amazon Bedrock, Amazon Bedrock AgentCore, Amazon Q, Kiro, Amazon Data Firehose, AWS PrivateLink |

AWS 의 표현은 명확합니다. **AI 지원 개발은 선택 사항이 아니라 핵심 역량이 되었습니다.**

**통합되는 것**입니다. 이 과정에서 배운 주제가 여기에 들어 있습니다.

| 주제 | 통합 |
|---|---|
| DynamoDB | 4개 스킬 → **1개** |
| 보안 (암호화와 민감 데이터) | 2개 태스크의 13개 스킬 → 1개 태스크의 **7개** |
| 테스트 | 2개 태스크의 11개 스킬 → 1개 태스크의 **5개** |
| 관측가능성 | 8개 → **5개** |
| 최적화 | 9개 → **6개** |

**범위 밖**인 항목도 명시되어 있습니다. 프롬프트 엔지니어링, RAG 설계, AI 모델 선택,
Amazon SageMaker AI, AI 거버넌스 프레임워크 설계입니다. AI 가 들어왔다고 해서 AI 자체를
설계하는 능력을 묻지는 않습니다.

**권장 경험**도 바뀝니다.

- AWS 서비스를 사용해 애플리케이션을 개발·유지 관리한 실무 경험 1년 이상
- 고급 프로그래밍 언어 하나 이상에 능숙함
- **AI 지원 개발 도구와 워크플로 사용 경험**
- 애플리케이션 수명 주기 관리와 CI/CD 파이프라인 이해

> — 출처: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

### 6.5 시험 응시료 할인 🆕

**AWS Certification 하나를 취득하면 다음 AWS Certification 시험에 50% 할인**을 받습니다.
할인은 AWS Certification 계정에서 확인합니다.

> — 출처: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

---

## 7. 시험 준비 4단계

### 7.1 기본 4단계

| 단계 | 내용 |
|---|---|
| 1단계 | 시험 및 시험 유형의 문제에 대해 알아봅니다 |
| 2단계 | AWS Skill Builder에서 시험 주제에 대해 알아봅니다 |
| 3단계 | AWS Skill Builder에서 시험 준비 자료로 학습합니다 |
| 4단계 | 공식 연습 시험으로 실전 시험 준비 상태를 확인합니다 |

각 단계의 세부입니다.

**1단계 — 시험의 중점 영역과 문제 스타일을 익힙니다.**

| # | 내용 |
|---|---|
| 1 | 시험 가이드를 복습합니다 |
| 2 | AWS Skill Builder 에 가입합니다 |
| 3 | 등록하고 AWS Certification 공식 연습 문제 모음을 풀어봅니다 |

연습 세트의 문제는 실제 시험에 나올 수 있는 문제와 **동일한 프로세스**에 따라 생성되고, 자세한
피드백과 권장 리소스가 포함되어 있습니다.

**2단계 — AWS Skill Builder 교육을 사용합니다.**

| # | 내용 |
|---|---|
| 1 | 시험 주제 지식에서 부족한 측면을 파악합니다 |
| 2 | 학습해야 하는 자습형 디지털 과정에 등록합니다 |
| 3 | AWS Builder Lab 에 액세스해 AWS Management Console 에서 기술을 적용합니다 |

**3단계 — Skill Builder 에서 시험 준비 자료로 학습합니다.**

| # | 내용 |
|---|---|
| 1 | Skill Builder 는 모든 도메인에 걸쳐 과정을 제공합니다 |
| 2 | AWS Builder Lab 에는 수백 개의 자습형 실습(SPL)이 포함되어 있습니다 |
| 3 | AWS Cloud Quest 의 게임 방식 학습으로 시험을 준비합니다 |

**4단계 — 실전 시험 준비 상태를 확인합니다.** 공식 연습 시험의 특징입니다.

| 항목 | 내용 |
|---|---|
| 문제 수 | 실제 시험과 **동일한 수** |
| 난이도 | 자격증 시험과 동일한 문제 스타일·난이도, 같은 수준의 엄격함 |
| 채점 | 시험 방식의 채점과 통과·실패 판정 |
| 피드백 | 각 문제의 선택 답안에 대한 피드백과 권장 리소스 |
| 응시 방식 | 제한 시간이 있고 끝난 뒤에만 정답이 공개되는 모의시험, 제한 시간 없는 시험, 또는 문제마다 답을 제출할 때 정답이 공개되는 시험 |

일부 자료에는 **AWS Skill Builder 구독이 필요합니다.**

### 7.2 현재의 Exam Prep Plan 🔄

단계 수는 넷 그대로인데 **단계 이름과 쓰는 도구가 달라졌습니다.**

| 단계 | 현재 내용 | 예전과의 차이 |
|---|---|---|
| 1 | 시험 스타일 문제로 시험을 파악합니다 | 같습니다 |
| 2 | 부족한 부분에 맞는 디지털 과정에 등록하고 **AWS Builder Labs · AWS Cloud Quest · AWS Jam** 으로 연습합니다 | **예전에는 AWS Jam 이 없었습니다** |
| 3 | 시험 범위와 도메인별 주제를 검토하고, 강사의 문제 풀이와 응시 전략을 따라가며 **AWS SimuLearn** 으로 계속 연습합니다 | **예전에는 AWS SimuLearn 이 없었습니다** |
| 4 | **AWS Certification Official Pretest** 로 준비 상태를 평가합니다 | 예전에는 "공식 연습 시험(Official Practice Exam)"이었습니다 |

Official Exam Prep 전체 구성도 넓어졌습니다. **question sets, pretests, exam prep courses,
Escape Room, SimuLearn, practice exams** 입니다. 예전에는 "공식 연습 문제 모음"과 "공식 연습
시험" 두 가지뿐이었습니다.

> — 출처: [AWS Certified Generative AI Developer – Professional](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)

> — 출처: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

---

## 8. 시험 등록과 응시

시험 등록과 응시 방법입니다.

### 8.1 온라인 감독 시험 🆕

| 항목 | 내용 |
|---|---|
| 무엇인가 | 집이나 사무실 같은 **사적인 공간**에서 자기 컴퓨터로 응시합니다 |
| 어떻게 감독하나 | 감독관이 **화면 공유 애플리케이션과 웹캠**으로 원격 감독합니다 |
| 언제 가능한가 | 대부분의 시험 예약은 **주 7일 24시간** 가능합니다 |
| 제공 업체 | **Pearson VUE.** 모든 AWS Certification 시험에서 이용할 수 있습니다 |
| 필수 조건 | 감독관과의 **의사 소통**이 필요합니다 |

### 8.2 감독 언어와 가능 시간 🆕

| 언어 | 가능 시간 |
|---|---|
| 영어 | 24시간 주 7일 |
| 일본어 | 월~토, 현지 시각(JST) 오전 9시 ~ 오후 4시 |
| 스페인어 (라틴 아메리카) | 월~금, EST 오전 10시 ~ 오후 5시 45분 |
| 중국어 만다린 (중국 본토 고객) | 월~금, 현지 시각(CST) 오전 8시 ~ 오후 5시 |

**현지화된 시험에 등록해도 영어로 볼 수 있습니다.** 시험 중 토글 기능으로 문제를 영어로
전환할 수 있습니다. 한국어로 시험을 볼 때 용어가 어색해 헷갈리면 이 기능으로 원문을 확인하세요.

> — 출처: [Schedule an AWS Certification Exam](https://aws.amazon.com/certification/certification-prep/testing/)

### 8.3 과정 피드백

과정 평가를 남기는 절차입니다.

| 단계 | 내용 |
|---|---|
| 1 | `https://www.aws.training` 에 로그인합니다 |
| 2 | My Account 를 선택하고 Transcript 를 선택합니다 |
| 3 | Archived 탭을 선택합니다 |
| 4 | 완료한 과정을 선택하고 Evaluate 를 선택합니다 |

> **원본 자료의 오류.** 4번 단계는 원문에서 "완료한 **Architecting on AWS** 교육 과정을
> 선택하고"라고 합니다. 이 과정은 **Developing on AWS** 인데 원문은 Architecting on AWS 를
> 가리켜, 다른 과정 자료에서 옮겨 온 것으로 보입니다. 위 표에서는 과정 이름을 뺐습니다
> ([9.1절](#91-교재-기술이-사실과-다른-항목)).

이 절차는 AWS 내부·프리랜서 강사에게만 적용되고, AWS 교육 파트너는 자기 학습
관리 시스템의 정보로 바꿔 안내합니다. **지금 이 과정을 어디서 들었는지에 따라 피드백 경로가
다릅니다.** 교육 파트너를 통해 수강했다면 그 파트너의 안내를 따르세요.

---

## 9. 교재 대비 변경 사항

이 모듈은 기술 내용이 아니라 교육 프로그램 안내이므로, 변경 사항이 대부분 **URL 과 프로그램
구성**입니다. 총 24건이며 유형별로 교재 기술 오류 7건, 변경 12건, 비권장 1건, 제공 종료 4건입니다.

### 9.1 교재 기술이 사실과 다른 항목

| 교재 기재 | 확인된 내용 | 근거 |
|---|---|---|
| "600여 개의 디지털 과정" / "600개가 넘는 온디맨드 디지털 과정" | 현재 900개가 넘는 무료 자습형 디지털 과정, 온라인 학습 센터 전체로는 1,000개가 넘는 무료 학습 리소스 | [AWS Skill Builder](https://aws.amazon.com/training/digital/) |
| 소개된 "현재 제공되는 AWS Certification 목록" | 이후 Specialty 네 개가 종료되고 네 개가 새로 추가되었습니다([5.3절](#53-이후-종료된-자격증), [5.4절](#54-이후-추가된-자격증)) | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |

교재 안에서 어긋나는 항목입니다. 외부 문서와의 불일치가 아니므로 🆕 · 🔄 표기를 붙이지
않았습니다.

| 어긋나는 지점 | 내용 | 이 문서의 처리 |
|---|---|---|
| 과정 이름 | 과정 평가 절차의 4번 단계가 "완료한 **Architecting on AWS** 교육 과정을 선택하고"라고 합니다. 이 과정은 Developing on AWS 입니다 | 과정 이름을 빼고 절차만 실었습니다([8.3절](#83-과정-피드백)) |
| 제목 누락 | 레벨 소개 화면은 제목 자리가 비어 있고 본문 텍스트 박스에 "AWS Certification 레벨"이라고만 적혀 있습니다 | 그 문구를 절 제목으로 썼습니다([5.1절](#51-네-레벨)) |
| 문장 중복 | 원본 노트가 "시험은 자주 업데이트되며 …" 문장을 "그러나"로 이어 **두 번** 반복합니다 | 한 번만 실었습니다([5.2절](#52-시험-범위를-확인하는-방법)) |
| 주의사항 중복 | 원본 노트가 구독 필요 안내를 표현만 바꿔 **두 번** 적습니다 | 한 번만 실었습니다([7.1절](#71-기본-4단계)) |
| 링크 라벨 누락 | 후속 과정 안내의 "다음 단계"에서 `Advanced Developing on AWS` 뒤에 URL 두 개가 연달아 나오고 두 번째(`courseId=53785`)에 과정 이름이 없습니다 | 본문 목록과 대조해 `Developing Serverless Solutions on AWS` 로 판단하고 그렇게 실었습니다([3장](#3-추가-리소스)) |

### 9.2 변경된 URL 과 이름

교재의 URL 중 여러 개가 옮겨졌습니다. 리디렉션되므로 눌러도 도착은 하지만, 인쇄물에서 손으로
옮겨 적을 때 틀리기 쉽습니다.

| 대상 | 교재 URL | 현재 위치 |
|---|---|---|
| 시험 목록 페이지 | `aws.amazon.com/certification/exams` | `aws.amazon.com/certification/` (별도 목록 페이지가 아닙니다) |
| AWS Builder Labs | `aws.amazon.com/training/digital/aws-builder-labs` | `aws.amazon.com/training/digital/immersive-learning/` |
| Tech Talks | `aws.amazon.com/events/online-tech-talks/on-demand` | `aws.amazon.com/events/online-tech-talks/` |
| 요금제 백서 | `docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/welcome.html` | 같은 경로의 디렉터리 (`welcome.html` 없이) |
| Skill Builder 학습 페이지 | `explore.skillbuilder.aws/learn` | Skill Builder 최상위 도메인으로 리디렉션. AWS 소유 진입점은 `aws.amazon.com/training/digital/` |
| AWS Workshops | `workshops.aws` | AWS Builder Center 의 워크숍 경로로 리디렉션 |
| 후속 과정 등록 | `www.aws.training/SessionSearch?...&courseId=...` | `aws.amazon.com/training/classroom/<과정-이름>/` (다시 Skill Builder 로 리디렉션) |

> — 출처: [AWS Certification](https://aws.amazon.com/certification/)

> — 출처: [Immersive learning](https://aws.amazon.com/training/digital/immersive-learning/)

> — 출처: [Online Tech Talks](https://aws.amazon.com/events/online-tech-talks/)

프로그램 구성이 바뀐 항목입니다.

| 항목 | 교재 | 확인된 현재 내용 |
|---|---|---|
| Skill Builder 학습 방식 | 무료 디지털 교육과 강의식 교육 두 갈래 | 자습형 Digital Courses, 자습형 Digital Classroom, 라이브 AWS Classroom Training 세 갈래([4.2절](#42-학습-방식-세-갈래)) |
| 시험 준비 4단계 | 4단계가 "공식 연습 시험(Official Practice Exam)" | 4단계가 **AWS Certification Official Pretest**([7.2절](#72-현재의-exam-prep-plan)) |
| 시험 준비 도구 | 공식 연습 문제 모음, 자습형 디지털 과정, AWS Builder Lab, AWS Cloud Quest, 공식 연습 시험 | **AWS Jam** 과 **AWS SimuLearn** 이 추가되고 Official Exam Prep 구성이 question sets, pretests, exam prep courses, Escape Room, SimuLearn, practice exams 로 넓어짐 |
| Developer – Associate 시험 | 시험 코드와 개정 일정을 다루지 않음 | **DVA-C03 으로 개정.** DVA-C02 마지막 응시일 2026년 11월 30일([6.3절](#63-시험-개정-일정)) |
| Security – Specialty | 이름만 언급 | **SCS-C03 으로 개정.** 생성형 AI 와 ML 보안을 별도로 다루고 탐지와 인시던트 대응을 각각 별개 섹션으로 재구성. SCS-C02 응시 기한은 2025년 12월 1일이었습니다 |

> — 출처: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

> — 출처: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

### 9.3 비권장 및 지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| `www.aws.training` 포털 | 비권장 — AWS 가 안내하는 현재 학습 진입점은 AWS Skill Builder 입니다. 이 과정 자료가 제시한 강의식 과정 경로는 Skill Builder 로 리디렉션됩니다. `www.aws.training` 자체는 아직 응답하지만 이 프로젝트의 근거 도메인 허용 목록에 없어 인용 대상이 아닙니다 | [AWS Skill Builder](https://aws.amazon.com/training/digital/) | [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/) |
| AWS Certified Machine Learning – Specialty | **제공 종료** — 마지막 응시일 2026년 3월 31일 | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional | [AWS expands AI certification portfolio](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/) |
| AWS Certified Data Analytics – Specialty | **제공 종료** — 마지막 응시일 2024년 4월 8일 | AWS Certified Data Engineer – Associate | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |
| AWS Certified Database – Specialty | **제공 종료** — 마지막 응시일 2024년 4월 29일 | — | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |
| AWS Certified: SAP on AWS – Specialty | **제공 종료** — 마지막 응시일 2024년 4월 29일 | — | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |

종료된 자격증에 대해 세 가지를 다시 강조합니다. **보유한 자격증은 3년간 유효하고 Credly 배지도
계속 표시됩니다. 다만 재인증은 불가능하고, Skill Builder 의 시험 준비 자료도 함께 종료되었습니다.**

### 9.4 교재 이후 추가된 항목

| 항목 | 이 문서의 위치 |
|---|---|
| 이 과정에 대응하는 자격증이 무엇인지 | [6.1절](#61-aws-certified-developer-associate) |
| 자격증 유효 기간 3년과 재인증 두 방식(갱신 3년 / 유지 1년) | [6.2절](#62-유효-기간과-재인증) |
| DVA-C03 개정 일정, 시험 정보, 바뀌는 내용 | [6.3절](#63-시험-개정-일정) · [6.4절](#64-dva-c03-에서-무엇이-바뀌나) |
| 자격증 취득 후 다음 시험 50% 할인 | [6.5절](#65-시험-응시료-할인) |
| 마이크로크리덴셜과 AWS Agentic AI Demonstrated | [5.5절](#55-마이크로크리덴셜) |
| 이후 추가된 자격증 네 개 | [5.4절](#54-이후-추가된-자격증) |
| 온라인 감독 시험의 실제 조건과 언어별 가능 시간 | [8.1절](#81-온라인-감독-시험) · [8.2절](#82-감독-언어와-가능-시간) |
| 현지화된 시험에서 영어로 문제를 볼 수 있는 토글 | [8.2절](#82-감독-언어와-가능-시간) |
| Skills Profile | [4.3절](#43-실습과-성과-표시) |
| Advanced Generative AI Development on AWS 과정 | [3장](#3-추가-리소스) |
| 이 과정 14개 모듈의 지도 | [2장](#2-이-과정이-다룬-것) |

### 9.5 검증하지 못한 항목

| 항목 | 왜 확인하지 못했는가 |
|---|---|
| 과정 목표 세 항목이 현재 과정 설명 페이지의 목표와 일치하는지 | Developing on AWS 과정 페이지가 Skill Builder 로 리디렉션되고, Skill Builder 는 이 프로젝트의 근거 도메인 허용 목록에 없어 목표 문구를 인용할 수 없습니다. 교재 문구를 그대로 실었습니다 |
| Getting Started with DevOps on AWS 와 AWS Cloud Development Kit Primer 의 현재 위치 | 교재가 제시한 `www.aws.training` 경로는 응답하지만 허용 목록 밖이고, `aws.amazon.com` 쪽 대응 경로를 확인하지 못했습니다. Skill Builder 에서 과정 이름으로 검색하는 것을 권합니다([3장](#3-추가-리소스)) |
| 현재 제공되는 AWS Certification **전체** 목록 | 자격증 페이지가 동적으로 렌더링되어 전체 목록을 그대로 가져오지 못했습니다. 개별 자격증 페이지와 AWS Training and Certification 블로그로 확인한 범위만 실었습니다([5.3절](#53-이후-종료된-자격증) · [5.4절](#54-이후-추가된-자격증)) |
| DVA-C02 의 현재 시험 시간·문항 수·응시료 | 개별 자격증 페이지에서 시험 개요 표를 가져오지 못했습니다. DVA-C03 의 값은 2026년 9월 블로그로 확인했습니다([6.3절](#63-시험-개정-일정)) |
| 시험 센터 응시(오프라인)의 조건 | 확인한 문서는 온라인 감독 시험을 설명합니다. 시험 센터 응시 조건은 확인하지 못했습니다([8.1절](#81-온라인-감독-시험)) |
| AWS Jam, AWS SimuLearn, Escape Room 각각의 상세 구성 | Exam Prep Plan 설명에서 이름과 역할만 확인했고 각 도구의 상세는 확인하지 못했습니다([7.2절](#72-현재의-exam-prep-plan)) |

---

수고하셨습니다.
