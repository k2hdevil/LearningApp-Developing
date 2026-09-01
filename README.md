# Developing on AWS 정리 자료

AWS 공인 과정 **Developing on AWS** 를 들으면서 만든 학습 자료를 웹에서 읽을 수 있게 한
것입니다. 한국어와 영어 두 로케일을 제공합니다.

교재는 2023년 기준입니다. 이 과정을 지금 듣는 사람은 교재를 배우는 동시에 **그중 무엇이 지금과
다른지** 알아내야 합니다. 이 자료는 그 두 번째 일을 대신합니다. 검증 가능한 사실에는 실제로
조회한 AWS 공식 문서 링크가 붙어 있고, 확인하지 못한 것은 확인하지 못했다고 적혀 있습니다.

> 이 자료는 **교재를 대체하지 않습니다.** 교재와 나란히 보는 대조표입니다.
> 라이선스는 아래 [라이선스와 사용](#라이선스와-사용) 을 읽어 주세요.

---

## 교재와 다른 점을 따로 모았습니다

모든 모듈에 **`N. 교재 대비 변경 사항`** 장이 있습니다. 교재를 조용히 고치지 않습니다.
"책에는 Cloud9이 있는데요?"라는 질문에 답할 수 있어야 하기 때문입니다.

| 절 | 내용 |
|---|---|
| N.1 | 교재 기술이 사실과 다른 항목 (교재 기재 / 확인된 내용 / 근거) |
| N.2 | 동작·기본값이 변경된 항목 |
| N.3 | 비권장·지원 종료된 항목 (상태 / 대체 / 근거) |
| N.4 | 교재 이후 추가된 항목 |
| N.5 | 검증하지 못한 항목 |

**모듈 16** 은 교재에 없는 모듈입니다. 15개 모듈에서 모인 변경 사항 344건을 주제별로 다시
묶은 종합 문서입니다.

| 항목 | 값 |
|---|---|
| 모듈 | 16개 (한국어 + 영어, 로케일 간 장 구조 동일) |
| 콘텐츠 | 47,216줄 |
| 출처 인용 | 로케일별 932건 (두 로케일의 인용 URL 집합이 동일) |
| 교재 대비 변경 사항 | 344건 (교재 오류 154 · 변경 125 · 비권장 39 · 지원 종료 26) |
| 검증일 | 2026년 8월 25일 |

---

## 모듈

| ID | 한국어 | English |
|---|---|---|
| M01 | 모듈 1: 과정 개요 | Module 1: Course Overview |
| M02 | 모듈 2: AWS에 웹 애플리케이션 구축 | Module 2: Building a Web Application on AWS |
| M03 | 모듈 3: AWS에서 개발 시작하기 | Module 3: Getting Started with Development on AWS |
| M04 | 모듈 4: 권한 부여 시작하기 | Module 4: Getting Started with Permissions |
| M05 | 모듈 5: 스토리지 시작하기 | Module 5: Getting Started with Storage |
| M06 | 모듈 6: 스토리지 작업 처리 | Module 6: Processing Your Storage Operations |
| M07 | 모듈 7: 데이터베이스 시작하기 | Module 7: Getting Started with Databases |
| M08 | 모듈 8: 데이터베이스 작업 처리 | Module 8: Processing Your Database Operations |
| M09 | 모듈 9: 애플리케이션 로직 처리 | Module 9: Processing Your Application Logic |
| M10 | 모듈 10: API 관리 | Module 10: Managing the APIs |
| M11 | 모듈 11: 모던 애플리케이션 구축 | Module 11: Building a Modern Application |
| M12 | 모듈 12: 내 애플리케이션의 사용자에게 액세스 권한 부여하기 | Module 12: Granting Access to Your Application Users |
| M13 | 모듈 13: 애플리케이션 배포 | Module 13: Deploying Your Application |
| M14 | 모듈 14: 애플리케이션 관찰 | Module 14: Observing Your Application |
| M15 | 모듈 15: 과정 마무리 | Module 15: Course Wrap-up |
| M16 | 모듈 16: 교재 이후 신규 기능 🆕 | Module 16: What Changed Since the Courseware 🆕 |

---

## 사실 확인 방법

콘텐츠는 세 단계로 만들었습니다. 요약과 최신화를 같은 작업에서 섞지 않았습니다. 섞으면 오래된
강사 노트를 근거로 현재 사실을 추측하게 됩니다.

| 단계 | 규칙 |
|---|---|
| 1. 요약 | 원문(슬라이드 본문 + 강사 노트)에 **없는 사실은 한 줄도 추가하지 않습니다** |
| 2. 최신화 | **실제로 조회한 AWS 공식 문서만** 근거로 삼습니다. 조회하지 못한 항목은 추가하지 않고 `N.5 검증하지 못한 항목` 에 적습니다 |
| 3. 번역 | 사실을 **추가하거나 바꾸지 않습니다.** 인용 URL 을 동일하게 유지하고 장 구조와 표를 1:1 로 맞춥니다 |

근거로 쓴 도메인은 **AWS 가 직접 운영하고 저작권을 보유한 곳**뿐입니다. `docs.aws.amazon.com`
을 1순위로 두고, 그곳에 없는 사실은 AWS 가 운영하는 다른 공식 도메인(`aws.amazon.com`,
`boto3.amazonaws.com`, `awscli.amazonaws.com` 등)에서 확인했습니다. 커뮤니티 콘텐츠
(`repost.aws`, Stack Overflow, 블로그 플랫폼)는 AWS 가 운영하더라도 작성자가 AWS 가 아닐 수
있으므로 근거로 쓰지 않았습니다.

각 문서의 출처는 본문에 인용문으로 달려 있습니다.

```text
> — 출처: [문서 제목](https://docs.aws.amazon.com/...)
```

### 이 저장소에 없는 것

이 저장소는 **읽을 수 있는 자료와 그것을 띄우는 앱**만 담고 있습니다. 다음은 공개하지
않았습니다.

| 항목 | 이유 |
|---|---|
| 원본 강사용 덱(`.pptx`) 과 그 추출본 | 인증 강사에게 라이선스된 자료입니다 |
| 사실 검증 파이프라인과 근거 기록 파일 | 교재 문구를 직접 인용한 항목이 많습니다 |

따라서 사실 검증 과정을 이 저장소만으로 그대로 재실행할 수는 없습니다. 대신 **각 문장의 근거
링크가 본문에 그대로 있으므로** 원문을 열어 직접 확인할 수 있습니다.

---

## 실행

```bash
cd webapp
npm ci
npm run dev      # 개발 서버 (기본 http://localhost:5173)
npm run build    # dist/ 생성 + Cloudscape 토큰 검사
```

`npm run build` 는 `vite build` 뒤에 `scripts/check-tokens.mjs` 를 돌립니다. Cloudscape 토큰을
쓰지 않고 색을 하드코딩한 곳이 있으면 빌드가 실패합니다. 다크 모드에서 안 보이는 요소가 생기지
않게 하려는 것입니다.

---

## 배포 (AWS Amplify Hosting)

저장소 루트의 두 파일이 배포 설정입니다.

| 파일 | 역할 |
|---|---|
| `amplify.yml` | 빌드 설정. `appRoot: webapp`, `npm ci` → `npm run build`, 산출물 `dist/` |
| `customHttp.yml` | 응답 헤더. HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP |

커스텀 헤더는 `amplify.yml` 이 아니라 **저장소 루트의 `customHttp.yml`** 에 넣습니다. monorepo
는 `appRoot` 별로 선언하는 형식이고, 이 파일이 콘솔의 Custom headers 설정을 덮어씁니다.

### 앱을 처음 만들 때

앱이 저장소 루트가 아니라 `webapp/` 에 있으므로 monorepo 로 설정해야 합니다.

1. Amplify 콘솔에서 **Create new app** → Git 공급자와 저장소·브랜치 선택
2. **My app is a monorepo** 를 선택하고 경로에 `webapp` 입력
3. 이때 콘솔이 `AMPLIFY_MONOREPO_APP_ROOT=webapp` 환경 변수를 자동으로 넣습니다
4. **Save and deploy**

이 환경 변수는 `amplify.yml` 의 `appRoot` 와 **값이 같아야 합니다.** 이미 만들어진 앱이거나
CloudFormation 으로 배포했다면 Hosting → Environment variables 에서 직접 넣습니다.

### 알아 둘 점

- **Node 버전을 `amplify.yml` 에서 고정합니다.** Vite 7 은 Node 20.19+ 또는 22.12+ 를
  요구합니다. AL2023 빌드 이미지의 기본값은 Node 22 이지만, 이미지 기본값이 바뀌거나 live
  package updates 로 다른 버전이 지정될 수 있으므로 `nvm use 22` 를 `preBuild` 에 둡니다.
  `preBuild` 는 live package updates 다음에 실행되므로 이 값이 이깁니다.
- **SPA 리라이트 규칙이 필요하지 않습니다.** 이 앱은 해시 라우팅(`/#M04-Permissions_Summary`)
  을 쓰므로 모든 요청 경로가 `/` 입니다. 콘텐츠 마크다운은 같은 오리진에서 `fetch` 합니다.
- **CSP 는 실제로 검증한 값입니다.** 빌드된 `dist/` 를 그 헤더와 함께 서빙하고 헤드리스
  브라우저로 확인했습니다. 위반 0건, Google Fonts 스타일시트 로드, `Noto Sans Mono` 실제 로드,
  코드 블록의 구문 하이라이팅 색 8종 정상 적용입니다.
- **CSP 는 Amplify 에서만 적용되고 로컬 개발 서버에는 걸리지 않습니다.** 헤더를 조일 때는
  배포 후 브라우저 콘솔을 확인하세요.

---

## 구조

```text
.
├── amplify.yml                 Amplify 빌드 설정
├── customHttp.yml              Amplify 응답 헤더 (CSP 등)
│
└── webapp/
    ├── public/content/
    │   ├── MNN-*.md            한국어 (기본)
    │   └── en/MNN-*.md         영어 (파일 이름 동일)
    ├── src/
    │   ├── App.jsx             AppLayout + TopNavigation
    │   ├── components/         MarkdownRenderer · CodeBlockWrapper · TreeNavigation 등
    │   ├── contexts/           DarkModeContext · LocaleContext
    │   ├── data/navigationTree.js  내비게이션 구조
    │   ├── designTokens.js     --doa-* 토큰 정의
    │   └── i18n/strings.js     UI 문자열
    ├── scripts/check-tokens.mjs  Cloudscape 토큰 검사 (빌드가 호출)
    ├── index.html
    ├── package.json
    └── vite.config.js
```

로케일 구성 원칙이 하나 있습니다. **파일 이름은 로케일과 무관하게 하나**이고
`navigationTree.js` 의 `contentFile` 이 그 이름입니다. UI 문자열은 콘텐츠가 아니라
`src/i18n/strings.js` 에, 모듈 제목은 `navigationTree.js` 의 `title: { ko, en }` 에 둡니다.

영어 문서는 헤딩이 영어이므로 **앵커 슬러그도 영어**입니다. 슬러그 규칙은 소문자화 → 유니코드
문자·숫자·공백·하이픈만 남김 → 공백을 하이픈으로 → **앞뒤 하이픈 제거** 입니다. 마지막 단계
때문에 헤딩이 `### 3.7 기본 암호화 🔄` 처럼 이모지로 끝나면 앵커는 `#37-기본-암호화` 이고
`#37-기본-암호화-` 가 **아닙니다.**

---

## 기술 스택

| 항목 | 버전 | 비고 |
|---|---|---|
| Vite | 7.3.6 | |
| React | 18.3.1 | TypeScript 대신 **JSX** |
| Cloudscape Components | 3.0.1352 | AWS 디자인 시스템 |
| Cloudscape Code View | 3.0.171 | 코드 블록 |
| react-markdown | 9.1.0 | + `remark-gfm` 4.0.1, `rehype-raw` 7.0.0 |
| react-syntax-highlighter | 16.1.1 | 15.x 는 prismjs CVE 3건이 있어 채택하지 않았습니다 |

구문 하이라이팅은 `prism-light` 에 언어 11개만 등록해 씁니다 (618KB → 55KB). 새 언어를
콘텐츠에 쓰려면 `webapp/src/components/CodeBlockWrapper.jsx` 의 `LANGUAGES` 에 먼저 추가해야
합니다. 색상은 하드코딩하지 않고 `--doa-*` CSS 변수를 통해 Cloudscape 토큰으로만 씁니다.

---

## 라이선스와 사용

이 저장소의 **마크다운 콘텐츠와 앱 코드**는 AWS 공식 문서를 근거로 새로 작성한 것입니다. 다만
각 모듈의 `교재 대비 변경 사항` 장은 목적상 **교재 문구를 인용해 현재 사실과 대조합니다.**
원본 강사용 덱은 이 저장소에 포함되어 있지 않습니다.

AWS 서비스 이름, 문서 내용, 인용한 문구의 저작권은 Amazon Web Services, Inc. 에 있습니다.
`Developing on AWS` 과정 교재는 인증 강사에게 라이선스된 자료입니다. 이 저장소는 AWS 와
제휴하거나 AWS 가 보증한 자료가 아닙니다.

---

## 알아 둘 점

- **검증일은 2026년 8월 25일입니다.** 특히 SDK 수명 주기, Lambda 런타임 일정, 자격증 라인업은
  자주 바뀝니다. 모듈 16 의 `10.3 값을 직접 확인해야 하는 것` 에 원문 링크를 모아 두었습니다.
- **확인하지 못한 것은 확인하지 못했다고 적었습니다.** 각 모듈의 `N.5 검증하지 못한 항목` 절이
  그 목록이고, 단정하지 않은 이유도 함께 적혀 있습니다.
- **예시 액세스 키 ID 는 5~8번째 글자를 `#` 로 가렸습니다.** `AKIA####ODNN7EXAMPLE` 형태입니다.
  자격 증명 스캐너가 실제 키로 오인하는 것을 막기 위한 것이고, AWS 문서의 원래 예시값은 이
  자리에 영숫자가 들어갑니다. 접두사 4자(`AKIA`·`ASIA`)는 구분이 학습 내용이라 그대로 두었습니다.
