/**
 * 내비게이션 구조 정의
 *
 * 모듈 번호는 공식 교재와 1:1로 맞춥니다. 수강생이 교재와 대조하기 때문입니다.
 * contentFile 이 없는 항목은 아직 콘텐츠가 준비되지 않은 상태이며
 * TreeNavigation 이 "(준비 중)"으로 표시합니다.
 *
 * id 는 contentFile 에서 확장자를 뺀 문자열과 같게 유지합니다.
 * 아직 콘텐츠가 없는 모듈도 확정된 파일 이름을 미리 id 로 씁니다.
 * 이렇게 두면 콘텐츠를 붙일 때 contentFile 한 줄만 추가하면 됩니다.
 *
 * title 은 { ko, en } 형태입니다. 콘텐츠 파일 이름은 로케일과 무관하게 하나이고,
 * 영어 콘텐츠는 public/content/en/<contentFile> 에 둡니다.
 *
 * tags[].category: 'service' | 'sdk' | 'concept' | 'tool'
 */

export const navigationTree = [
  {
    id: 'series-developing-on-aws',
    title: { ko: 'Developing on AWS (한국어)', en: 'Developing on AWS' },
    type: 'series',
    children: [
      {
        id: 'M01-Intro_Summary',
        title: { ko: '모듈 1: 과정 개요', en: 'Module 1: Course Overview' },
        type: 'item',
        contentFile: 'M01-Intro_Summary.md',
        tags: [{ label: 'Pollynotes', category: 'concept' }],
      },
      {
        id: 'M02-WebApp_Summary',
        title: {
          ko: '모듈 2: AWS에 웹 애플리케이션 구축',
          en: 'Module 2: Building a Web Application on AWS',
        },
        type: 'item',
        contentFile: 'M02-WebApp_Summary.md',
        tags: [
          { label: 'Pollynotes', category: 'concept' },
          { label: 'Architecture', category: 'concept' },
          { label: 'Serverless', category: 'concept' },
        ],
      },
      {
        id: 'M03-Environment_Summary',
        title: {
          ko: '모듈 3: AWS에서 개발 시작하기',
          en: 'Module 3: Getting Started with Development on AWS',
        },
        type: 'item',
        contentFile: 'M03-Environment_Summary.md',
        tags: [
          { label: 'AWS CLI', category: 'tool' },
          { label: 'AWS SDK', category: 'sdk' },
        ],
      },
      {
        id: 'M04-Permissions_Summary',
        title: {
          ko: '모듈 4: 권한 부여 시작하기',
          en: 'Module 4: Getting Started with Permissions',
        },
        type: 'item',
        contentFile: 'M04-Permissions_Summary.md',
        tags: [
          { label: 'IAM', category: 'service' },
          { label: 'AWS STS', category: 'service' },
        ],
      },
      {
        id: 'M05-Storage1_Summary',
        title: {
          ko: '모듈 5: 스토리지 시작하기',
          en: 'Module 5: Getting Started with Storage',
        },
        type: 'item',
        contentFile: 'M05-Storage1_Summary.md',
        tags: [
          { label: 'Amazon S3', category: 'service' },
          { label: 'AWS SDK', category: 'sdk' },
        ],
      },
      {
        id: 'M06-Storage2_Summary',
        title: {
          ko: '모듈 6: 스토리지 작업 처리',
          en: 'Module 6: Processing Your Storage Operations',
        },
        type: 'item',
        contentFile: 'M06-Storage2_Summary.md',
        tags: [
          { label: 'Amazon S3', category: 'service' },
          { label: 'AWS CLI', category: 'tool' },
          { label: 'CORS', category: 'concept' },
        ],
      },
      {
        id: 'M07-Database1_Summary',
        title: {
          ko: '모듈 7: 데이터베이스 시작하기',
          en: 'Module 7: Getting Started with Databases',
        },
        type: 'item',
        contentFile: 'M07-Database1_Summary.md',
        tags: [
          { label: 'DynamoDB', category: 'service' },
          { label: 'NoSQL', category: 'concept' },
        ],
      },
      {
        id: 'M08-Database2_Summary',
        title: {
          ko: '모듈 8: 데이터베이스 작업 처리',
          en: 'Module 8: Processing Your Database Operations',
        },
        type: 'item',
        contentFile: 'M08-Database2_Summary.md',
        tags: [
          { label: 'DynamoDB', category: 'service' },
          { label: 'DAX', category: 'service' },
          { label: 'PartiQL', category: 'concept' },
        ],
      },
      {
        id: 'M09-Compute_Summary',
        title: {
          ko: '모듈 9: 애플리케이션 로직 처리',
          en: 'Module 9: Processing Your Application Logic',
        },
        type: 'item',
        contentFile: 'M09-Compute_Summary.md',
        tags: [
          { label: 'AWS Lambda', category: 'service' },
          { label: 'AWS SAM', category: 'tool' },
          { label: 'Serverless', category: 'concept' },
        ],
      },
      {
        id: 'M10-Gateway_Summary',
        title: { ko: '모듈 10: API 관리', en: 'Module 10: Managing the APIs' },
        type: 'item',
        contentFile: 'M10-Gateway_Summary.md',
        tags: [
          { label: 'API Gateway', category: 'service' },
          { label: 'OpenAPI', category: 'tool' },
          { label: 'REST', category: 'concept' },
        ],
      },
      {
        id: 'M11-Microservices_Summary',
        title: {
          ko: '모듈 11: 모던 애플리케이션(Modern Application) 구축',
          en: 'Module 11: Building a Modern Application',
        },
        type: 'item',
        contentFile: 'M11-Microservices_Summary.md',
        tags: [
          { label: 'Step Functions', category: 'service' },
          { label: 'Microservices', category: 'concept' },
          { label: 'Serverless', category: 'concept' },
        ],
      },
      {
        id: 'M12-Access_Summary',
        title: {
          ko: '모듈 12: 내 애플리케이션의 사용자에게 액세스 권한 부여하기',
          en: 'Module 12: Granting Access to Your Application Users',
        },
        type: 'item',
        contentFile: 'M12-Access_Summary.md',
        tags: [
          { label: 'Amazon Cognito', category: 'service' },
          { label: 'JWT', category: 'concept' },
          { label: 'OAuth 2.0', category: 'concept' },
        ],
      },
      {
        id: 'M13-DevOps_Summary',
        title: {
          ko: '모듈 13: 애플리케이션 배포',
          en: 'Module 13: Deploying Your Application',
        },
        type: 'item',
        tags: [{ label: 'AWS SAM', category: 'tool' }],
      },
      {
        id: 'M14-Observability_Summary',
        title: {
          ko: '모듈 14: 애플리케이션 관찰',
          en: 'Module 14: Observing Your Application',
        },
        type: 'item',
        tags: [
          { label: 'CloudWatch', category: 'service' },
          { label: 'AWS X-Ray', category: 'service' },
        ],
      },
      {
        id: 'M15-WrapUp_Summary',
        title: { ko: '모듈 15: 과정 마무리', en: 'Module 15: Course Wrap-up' },
        type: 'item',
      },
      {
        id: 'M16-NewFeatures_Summary',
        title: {
          ko: '모듈 16: 교재 이후 신규 기능',
          en: 'Module 16: What Changed Since the Courseware',
        },
        type: 'item',
        tags: [{ label: 'Updates', category: 'concept' }],
      },
    ],
  },
];

/** 로케일에 맞는 제목을 꺼냅니다. 번역이 없으면 한국어로 대체합니다. */
export function nodeTitle(node, locale) {
  if (!node) return '';
  return node.title?.[locale] ?? node.title?.ko ?? '';
}

/** 트리에서 id로 노드를 찾습니다. */
export function findNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** 콘텐츠가 준비된 첫 항목의 id를 반환합니다. 초기 화면 결정에 사용합니다. */
export function firstAvailableId(nodes) {
  for (const node of nodes) {
    if (node.contentFile) return node.id;
    if (node.children) {
      const found = firstAvailableId(node.children);
      if (found) return found;
    }
  }
  return null;
}

/** 홈부터 대상 노드까지의 경로를 브레드크럼 항목으로 만듭니다. */
export function breadcrumbPath(nodes, id, locale) {
  function walk(list, trail) {
    for (const node of list) {
      const next = [...trail, { text: nodeTitle(node, locale), href: node.id }];
      if (node.id === id) return next;
      if (node.children) {
        const found = walk(node.children, next);
        if (found) return found;
      }
    }
    return null;
  }
  const home = [{ text: '🏠', href: 'home' }];
  return walk(nodes, home) || home;
}
