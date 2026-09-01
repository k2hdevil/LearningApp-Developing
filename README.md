# Developing on AWS 정리 자료

AWS 공인 과정 **Developing on AWS** 의 강사용 덱을 검증된 마크다운 학습 자료로 옮기고, 웹에서
읽을 수 있게 만든 프로젝트입니다. 한국어와 영어 두 로케일을 제공합니다.

수강생이 **공식 교재를 손에 들고 이 자료를 함께 봅니다.** 그래서 이 프로젝트의 제1 원칙은
"틀린 내용을 쓰는 것이 빠뜨리는 것보다 훨씬 나쁘다" 입니다. 검증 가능한 모든 사실에는 실제로
조회한 AWS 공식 문서 링크가 붙어 있고, 확인하지 못한 것은 확인하지 못했다고 적혀 있습니다.

---

## 이 자료가 교재와 다른 점

교재는 2023년 기준입니다. 지금 이 과정을 듣는 사람은 교재를 배우는 동시에 **그중 무엇이 지금과
다른지** 알아내야 합니다. 이 자료는 그 두 번째 일을 대신합니다.

모든 모듈에 **`N. 교재 대비 변경 사항`** 장이 있습니다. 구성은 다음과 같습니다.

| 절 | 내용 |
|---|---|
| N.1 | 교재 기술이 사실과 다른 항목 (교재 기재 / 확인된 내용 / 근거) |
| N.2 | 동작·기본값이 변경된 항목 |
| N.3 | 비권장·지원 종료된 항목 (상태 / 대체 / 근거) |
| N.4 | 교재 이후 추가된 항목 |
| N.5 | 검증하지 못한 항목 |

교재를 조용히 고치지 않습니다. "책에는 Cloud9이 있는데요?"라는 질문에 답할 수 있어야 하기
때문입니다. 그리고 **모듈 16** 은 그렇게 모인 344건을 주제별로 다시 묶은 종합 문서입니다.

현재 규모입니다.

| 항목 | 값 |
|---|---|
| 모듈 | 16개 (한국어 + 영어, 각 로케일 동일 구조) |
| 콘텐츠 | 47,000줄 이상 |
| 출처 인용 | 본문 1,864건 (로케일별 932건, 두 로케일의 인용 URL 집합이 동일) |
| 근거 기록 | `facts/citations/*.json` 742건 |
| 교재 대비 변경 사항 | `facts/deprecations/*.yaml` 344건 (교재 오류 154 · 변경 125 · 비권장 39 · 지원 종료 26) |
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

M16 은 교재에 없는 모듈입니다. 원본 덱이 없고, M01~M15 의 변경 사항을 종합해 만들었습니다.

---

## 원본 덱은 이 저장소에 없습니다

`.gitignore` 가 세 경로를 제외합니다.

| 경로 | 내용 | 왜 제외하나 |
|---|---|---|
| `Contents/` | 원본 `.pptx` 강사용 덱 15개 | 인증 강사에게 라이선스된 자료입니다 |
| `pipeline/extracted/` | 덱 전문 추출본 (슬라이드 본문 + 강사 노트 전문) | 원문과 사실상 같습니다 |
| `pipeline/drafts/` | 1단계 요약 | 규칙상 원문에 없는 사실을 넣지 않으므로 원문에 가장 가까운 파생물입니다 |

한 번 커밋하면 파일을 나중에 지워도 히스토리에는 남고, 히스토리 재작성은 이 프로젝트 규칙상
금지입니다. 그래서 **처음부터 넣지 않았습니다.** 이 저장소의 히스토리에는 세 경로가 한 번도
등장한 적이 없습니다.

**재현성은 `pipeline/facts/citations/*.json` 이 담당합니다.** 어떤 공식 문서를 무슨 도구로 언제
확인했는지가 기록되어 있어, 원본 덱 없이도 사실 검증을 다시 밟을 수 있습니다.

---

## 3단계 파이프라인

요약과 최신화를 **절대 같은 작업에서 섞지 않습니다.** 섞으면 오래된 강사 노트를 근거로 현재
사실을 추측하게 됩니다.

| 단계 | 입력 | 출력 | 규칙 |
|---|---|---|---|
| 1. 요약 | `pipeline/extracted/MNN.txt` | `pipeline/drafts/MNN.stage1.md` | 원문에 **없는 사실은 한 줄도 추가하지 않습니다.** 검증이 필요한 지점은 `<!-- VERIFY:id -->` 마커로 남깁니다 |
| 2. 최신화 | 1단계 산출물 + AWS 공식 문서 | `webapp/public/content/MNN-*.md` | **실제로 조회한 문서만** 근거로 삼습니다. 조회하지 못한 항목은 추가하지 않고 `N.5 검증하지 못한 항목`에 적습니다 |
| 3. 번역 | 한국어 최종본 | `webapp/public/content/en/MNN-*.md` | 사실을 **추가하거나 바꾸지 않습니다.** 인용 URL 은 동일하게 유지하고 장 구조와 표를 1:1 로 맞춥니다 |

### 어떤 도메인을 공식 문서로 보는가

판단 기준은 **AWS 가 직접 운영하고 저작권을 보유한 도메인**입니다. 목록은 코드가 아니라
데이터로 관리합니다. `pipeline/facts/source-domains.yaml` 입니다.

| 계층 | 내용 | 조회 도구 |
|---|---|---|
| `tier1` | `docs.aws.amazon.com`. **1순위** | AWS Documentation MCP |
| `tier2` | AWS 가 운영하는 그 외 공식 도메인 (`aws.amazon.com`, `boto3.amazonaws.com`, `awscli.amazonaws.com`, `d1.awsstatic.com` 등) | `web_fetch` |
| `informational` | AWS 소유가 아니지만 본문 참고 링크로만 쓸 수 있는 곳 | `web_fetch` |

커뮤니티 콘텐츠(`repost.aws`, Stack Overflow, 블로그 플랫폼)는 AWS 가 운영하더라도 답변
작성자가 AWS 가 아닐 수 있으므로 **근거로 쓰지 않습니다.**

### 근거 기록 형식

`pipeline/facts/citations/MNN.json` 의 각 항목입니다.

| 필드 | 내용 |
|---|---|
| `id` | 본문에서 이 근거를 가리키는 식별자 |
| `claim` | 문서에서 확인한 내용 |
| `url` | 조회한 페이지 |
| `fetched_with` | `mcp` / `web_fetch` / `link_check` 중 하나 |
| `section` | 페이지 내 섹션 |
| `corrects_courseware` | 교재와 다른 점 (해당하는 경우) |

`link_check` 는 **URL 이 살아 있는지만 확인했고 내용은 읽지 않았다**는 뜻입니다. "이 URL 이
유효하다" 자체가 주장인 경우에만 쓸 수 있고, 페이지 내용에 근거한 주장에는 쓸 수 없습니다.
이 필드를 남기는 이유는 재검증입니다. 나중에 사실이 바뀌었는지 볼 때 같은 경로로 다시
확인해야 하기 때문입니다.

---

## 게시 전 게이트

`webapp/public/content/` 에 파일을 넣거나 고친 뒤에는 **반드시** 실행합니다. 통과하지 못한
콘텐츠는 게시하지 않습니다.

```bash
python3 pipeline/validate.py                       # 모든 로케일 전체 (ko + en/)
python3 pipeline/validate.py M14-Observability_Summary   # 같은 이름 파일을 로케일별로 모두
python3 pipeline/validate.py --skip-links          # 오프라인
```

| # | 검사 | 위반 시 |
|---|---|---|
| 1 | `<!-- VERIFY:... -->` 마커 잔존 (2단계 미완료 상태로 게시 차단) | 실패 |
| 2 | 모든 인라인 앵커가 실제 헤딩과 일치하는지 | 실패 |
| 3 | 본문 링크가 HTTP 200 으로 응답하는지 | 실패 |
| 4 | 코드 블록 언어 태그 누락 / 닫히지 않은 펜스 | 실패 |
| 5 | 🆕 · 🔄 섹션의 출처 누락 | 실패 |
| 6 | 출처 인용 도메인이 `source-domains.yaml` 의 tier1·tier2 인지 | 실패 |
| 7 | `facts/citations/*.json` 의 모든 항목에 `fetched_with` 가 있고 url 도메인이 허용 목록인지 | 실패 |
| 8 | 그 밖의 본문 링크가 허용 목록 밖 도메인인지 | 경고 |
| 9 | `facts/deprecations/*.yaml` 의 `ended` 항목이 본문에 등장하는지 | 경고 |

현재 상태는 **32개 대상 통과 32 · 실패 0** 입니다 (16 모듈 × 2 로케일). 9번 경고 101건은 모두
지원 종료 항목을 **설명·비교 목적으로** 언급한 것이고, 특히 모듈 16 이 그 항목들을 다루는
문서라 의도된 결과입니다.

게이트는 마크다운 텍스트만 봅니다. 실제로 화면에 제대로 그려지는지는 별도로 확인합니다.

```bash
cd webapp && npm run dev     # 먼저 개발 서버를 띄웁니다
npm run check:render         # Chrome DevTools Protocol 로 실제 클릭·렌더 검증
```

`webapp/scripts/render-check.mjs` 가 모듈마다 사이드바 링크를 **실제로 클릭**해서 렌더한 뒤
헤딩·표·코드 블록·출처·앵커를 세고, 다크 모드 전환, 로케일 전환, 딥링크, 뒤로 가기, 본문 앵커가
모듈 해시를 덮어쓰지 않는지까지 확인합니다. 검사 대상은 `navigationTree.js` 를 직접 불러와
정하므로 모듈을 추가하면 자동으로 들어갑니다.

---

## 실행

### 웹앱

```bash
cd webapp
npm install
npm run dev          # 개발 서버 (기본 http://localhost:5173)
npm run build        # dist/ 생성 + Cloudscape 토큰 검사
npm run validate     # 콘텐츠 게이트
npm run check:render # 실제 렌더 검증 (개발 서버가 떠 있어야 합니다)
```

### 파이프라인

```bash
python3 pipeline/extract.py          # PPT 덱 전부 -> extracted/*.json
python3 pipeline/extract.py m14      # m14 로 시작하는 덱만
python3 pipeline/dump.py M14         # JSON -> 사람이 읽는 평문 대장 .txt
python3 pipeline/validate.py         # 게이트
python3 pipeline/fix_yaml_quotes.py  # deprecations/*.yaml 인용부호 보강
```

`fix_yaml_quotes.py` 는 `courseware_location: 슬라이드 16 "객체 업로드: PUT" 강사 노트` 처럼
값에 `: ` 가 들어가 파서가 죽는 줄을 찾아 인용부호를 씌웁니다. 게이트는 모든 모듈의
`deprecations/*.yaml` 을 한 번에 읽으므로, **한 모듈의 YAML 문법 오류 하나가 전체 게이트를 파싱
단계에서 죽입니다.** 다른 모듈이 멀쩡한데 게이트가 통째로 죽으면 이걸 먼저 의심하세요.

### 처음 클론했다면

이 저장소에는 원본 덱이 없습니다. 자신의 덱으로 파이프라인을 돌리려면 이렇게 합니다.

```bash
mkdir -p Contents/PPT
# 자신의 .pptx 덱을 Contents/PPT/ 에 둡니다
python3 pipeline/extract.py
python3 pipeline/dump.py M01
```

콘텐츠를 읽고 웹앱을 띄우는 것만이라면 덱이 필요하지 않습니다. `webapp/public/content/` 의
마크다운이 이미 완성되어 있습니다.

---

## 구조

```text
.
├── pipeline/
│   ├── extract.py              PPT -> JSON
│   ├── dump.py                 JSON -> 평문 대장
│   ├── validate.py             게시 전 게이트 (9개 검사)
│   ├── fix_yaml_quotes.py      YAML 인용부호 보강
│   └── facts/
│       ├── source-domains.yaml 인용 가능한 도메인 목록 (공용, 읽기 전용)
│       ├── citations/MNN.json  조회한 근거 (742건)
│       └── deprecations/MNN.yaml 교재 대비 변경 사항 (344건)
│
├── webapp/
│   ├── public/content/
│   │   ├── MNN-*.md            한국어 (기본)
│   │   └── en/MNN-*.md         영어 (파일 이름 동일)
│   ├── src/
│   │   ├── App.jsx             AppLayout + TopNavigation
│   │   ├── components/         MarkdownRenderer · CodeBlockWrapper · TreeNavigation 등
│   │   ├── contexts/           DarkModeContext
│   │   ├── data/navigationTree.js  내비게이션 구조 (검사 대상의 단일 출처)
│   │   └── i18n/strings.js     UI 문자열
│   └── scripts/
│       ├── check-tokens.mjs    Cloudscape 토큰 검사
│       └── render-check.mjs    실제 렌더 검증 (CDP)
│
├── .kiro/steering/content-rules.md  콘텐츠 작성 규칙 (이 프로젝트의 헌법)
└── .gitignore                  라이선스 자료 제외
```

로케일 구성 원칙이 하나 있습니다. **파일 이름은 로케일과 무관하게 하나**이고
`navigationTree.js` 의 `contentFile` 이 그 이름입니다. UI 문자열은 콘텐츠가 아니라
`src/i18n/strings.js` 에 두고, 모듈 제목은 `navigationTree.js` 의 `title: { ko, en }` 에 둡니다.
`id` 는 `contentFile` 에서 `.md` 를 뺀 문자열과 같게 유지합니다.

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
| Python | 3.x | 파이프라인. 표준 라이브러리 + PyYAML |

구문 하이라이팅은 `prism-light` 에 언어 11개만 등록해 씁니다 (618KB → 55KB). 새 언어를 콘텐츠에
쓰려면 `webapp/src/components/CodeBlockWrapper.jsx` 의 `LANGUAGES` 에 먼저 추가해야 합니다.

색상은 하드코딩하지 않고 `--doa-*` CSS 변수를 통해 Cloudscape 토큰으로만 씁니다. 다크 모드에서
안 보이는 요소가 생기지 않게 하려는 것이고, `npm run build` 가 이를 검사합니다.

---

## 새 모듈을 추가할 때

1. `python3 pipeline/dump.py MNN` 으로 원문 대장을 만들고 **전부 정독**합니다
2. 1단계 초안을 `pipeline/drafts/MNN.stage1.md` 에 씁니다. VERIFY 마커를 남깁니다
3. VERIFY 항목을 AWS 공식 문서로 하나씩 확인하고 `facts/citations/MNN.json` ·
   `facts/deprecations/MNN.yaml` 을 씁니다. 각 근거에 `fetched_with` 를 반드시 넣습니다
4. `webapp/public/content/MNN-*.md` 에 한국어 최종본을 씁니다
5. `webapp/public/content/en/MNN-*.md` 에 영어본을 씁니다. **앵커는 영어 슬러그로 다시
   맞춥니다.** 한국어본 링크를 그대로 복사하면 전부 깨집니다
6. `webapp/src/data/navigationTree.js` 의 해당 항목에 `contentFile` 과 `tags` 를 채웁니다
7. `python3 pipeline/validate.py` 를 통과시킵니다. 로케일 두 개가 모두 통과해야 합니다
8. `cd webapp && npm run build`
9. `npm run check:render`

앵커 슬러그 규칙에서 자주 틀리는 지점이 있습니다. 소문자화 → 유니코드 문자·숫자·공백·하이픈만
남김 → 공백을 하이픈으로 → **앞뒤 하이픈 제거** 입니다. 마지막 단계 때문에 헤딩이
`### 3.7 기본 암호화 🔄` 처럼 이모지로 끝나면 앵커는 `#37-기본-암호화` 이고
`#37-기본-암호화-` 가 **아닙니다.** 가운뎃점(`·`)과 밑줄(`_`)도 제거되므로 헤딩에 쓰면 앵커가
읽기 어려워집니다.

구현이 두 곳에 있고 **동작이 일치해야** 합니다. 한쪽만 바꾸면 링크가 조용히 깨집니다.

- `webapp/src/components/MarkdownRenderer.jsx` → `slugify()`
- `pipeline/validate.py` → `slugify()`

자세한 규칙은 `.kiro/steering/content-rules.md` 에 있습니다.

---

## 라이선스와 사용

이 저장소의 **마크다운 콘텐츠와 도구 코드**는 AWS 공식 문서를 근거로 새로 작성한 것입니다. 다만
`교재 대비 변경 사항` 장은 목적상 **교재 문구를 인용해 현재 사실과 대조합니다.** 원본 강사용 덱
자체는 이 저장소에 포함되어 있지 않습니다.

AWS 서비스 이름, 문서 내용, 인용한 문구의 저작권은 Amazon Web Services, Inc. 에 있습니다.
`Developing on AWS` 과정 교재는 인증 강사에게 라이선스된 자료입니다.

이 자료는 **교재를 대체하지 않습니다.** 교재와 나란히 보는 대조표입니다.

---

## 알아 둘 점

- **검증일은 2026년 8월 25일입니다.** 특히 SDK 수명 주기, Lambda 런타임 일정, 자격증 라인업은
  자주 바뀝니다. 모듈 16 의 `10.3 값을 직접 확인해야 하는 것` 에 원문 링크를 모아 두었습니다.
- **확인하지 못한 것은 확인하지 못했다고 적었습니다.** 각 모듈의 `N.5 검증하지 못한 항목` 절이
  그 목록입니다. 단정하지 않은 이유도 함께 적혀 있습니다.
- **`text` 언어 태그는 `CodeBlockWrapper.jsx` 의 `LANGUAGES` 에 없습니다.** 하이라이팅 없이
  그대로 표시되며 게이트와 렌더 검사는 통과합니다. 실행하면 안 되는 원문 예시를 실을 때 씁니다.
