# Module 2: Building a Web Application on AWS

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [The Recurring Architecture Diagram](#2-the-recurring-architecture-diagram)
3. [Application Overview](#3-application-overview)
4. [Developer Tools](#4-developer-tools)
5. [Storage and Hosting: Amazon S3](#5-storage-and-hosting-amazon-s3)
6. [Managing and Processing Data: DynamoDB and Lambda](#6-managing-and-processing-data-dynamodb-and-lambda)
7. [Connection and Access: API Gateway and Amazon Cognito](#7-connection-and-access-api-gateway-and-amazon-cognito)
8. [Observability: CloudWatch and X-Ray](#8-observability-cloudwatch-and-x-ray)
9. [Changes from the Courseware](#9-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 9](#9-changes-from-the-courseware) for what changed and how.
> - Items where the courseware contradicts itself are not something AWS documentation can settle. Those are flagged in the body without 🆕 or 🔄 and collected in [Section 9.1](#91-courseware-statements-that-do-not-match-the-facts).
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

This module is an **architecture walkthrough**. It lays out the full picture of the application you build across the course (Pollynotes), then highlights one piece of that picture per slide and introduces the AWS service behind it. There is no deep technical detail here. Storage belongs to Modules 5 and 6, databases to Modules 7 and 8, compute to Module 9, APIs to Module 10, user access to Module 12, and observability to Module 14. This document stays at the same overview depth rather than reaching into theirs.

### Module Objectives

Courseware slide 3, carried over as written.

| # | Objective |
|---|---|
| 1 | Describe the architecture of the application you build during this course |
| 2 | List the AWS services needed to build a web application |
| 3 | Identify how to store, manage, and host a web application |

### How This Document Maps to the Deck

| Slide | Title | What it highlights | This document |
|---|---|---|---|
| 2 | (no title) | Day 1 morning agenda boxes and the lab environment diagram | Section 1 |
| 3 | Module objectives | (no diagram) | Section 1 |
| 4·5 | Building the application (1/2)(2/2) | The full architecture | [Section 3](#3-application-overview) |
| 6 | Developer tools | IDE · developer · AWS SDK · toolkits · IAM | [Section 4](#4-developer-tools) |
| 7 | Storing and hosting the application | Amazon S3 | [Section 5](#5-storage-and-hosting-amazon-s3) |
| 8 | Managing user-stored data | DynamoDB | [Section 6](#6-managing-and-processing-data-dynamodb-and-lambda) |
| 9 | Processing user-stored data | AWS Lambda | [Section 6](#6-managing-and-processing-data-dynamodb-and-lambda) |
| 10 | Connecting all the services | Amazon API Gateway | [Section 7](#7-connection-and-access-api-gateway-and-amazon-cognito) |
| 11 | User access | Amazon Cognito | [Section 7](#7-connection-and-access-api-gateway-and-amazon-cognito) |
| 12 | Making the application observable | Amazon CloudWatch · AWS X-Ray | [Section 8](#8-observability-cloudwatch-and-x-ray) |
| 13 | The application | The full architecture (wrap-up) | [Section 3](#3-application-overview) |
| 1·14 | Title, Thank you | (layout only, no source content) | — |

### What This Deck Does Not Have

| Item | Detail |
|---|---|
| Knowledge check questions | This deck has no true/false question slide |
| Code | There is not a single line of source content to carry into a code block. This document has no code either |
| Per-service detail | Each service gets one or two lines of overview. The detail moves to its own module |

### Slide 2: Agenda and Lab Environment

Slide 2 has **no title.** The layout is a title slide but the title text is empty, so the extraction ledger shows only `Slide 2` ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)). The content is the Day 1 morning agenda and the lab environment diagram.

| Item | Title on the box |
|---|---|
| Module 1 | Course overview |
| Module 2 | Build a web application on AWS |
| Module 3 | Getting started with development on AWS |
| Module 4 | Getting started with permissions |
| Lab 1 | Configuring a development environment |

**Two module names disagree in the Korean courseware.** Both cases are visible only in the Korean wording, so the Korean strings are quoted directly. For Module 2, the slide 1 subtitle reads `모듈 2: AWS에 웹 애플리케이션 구축` while this box reads `AWS에 웹 애플리케이션 빌드` — one English phrase rendered two ways inside one deck. For Module 4, this box reads `권한 시작하기` while the M04 deck cover reads `모듈 4: 권한 부여 시작하기` (permissions versus authorization). The Module 1 agenda (M01 slide 7) matches this box on both items, so **the two agendas agree with each other and only the module deck covers differ.** Module 3 matches between the agenda and its deck cover ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

The diagram elements are as follows.

| Category | Text |
|---|---|
| Actor | You |
| Connection method | `Connect using:` Guacamole / SSH / Remote Desktop |
| Boundary | AWS Cloud |
| EC2 instance contents | IDE, AWS tools and SDKs, AWS CLI |
| Other labels | Amazon Simple Storage Service (Amazon S3), AWS Identity and Access Management (AWS IAM), IAM role, AWS STS, AWS CloudFormation |

Three connection methods are listed here (Guacamole / SSH / Remote Desktop), but the same box on M01 slide 7 lists two (`Guacamole or Remote Desktop`) and that slide's instructor notes list a third set (`Guacamole, Remote Desktop, or a browser-based option`). All three places differ, and `SSH` appears nowhere in M01. This is lab-environment logistics, so this document cannot settle it ([Section 9.5](#95-items-that-could-not-be-verified)).

The spelling `AWS Identity and Access Management (AWS IAM)` appears only on this slide. The documented abbreviation is `IAM`, and the same deck's slide 6 instructor notes and slide 13 diagram write `(IAM)` correctly ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

---

## 2. The Recurring Architecture Diagram

**Slides 4 through 13 are all the same picture.** Each slide simply highlights a different element. So this document lays the picture out once here, and later sections cover only what each slide highlights.

### 2.1 Elements in the Picture

| Category | Element |
|---|---|
| Actor | End user |
| Paths | Website hosting / MP3 hosting / Application API call |
| Note operations | List / Search / Delete / Create/Update |
| Voice | Dictate |
| Boundary | AWS Cloud |
| Service labels | DynamoDB, IAM, Amazon Cognito, Amazon APIGateway, Amazon Polly, AWS X-Ray, AWS SAM, Amazon CloudWatch |

**Label languages are mixed across slides.** In the Korean deck the note operation and voice labels are English on slides 4, 5, 9, 11, and 13 (`List` / `Search` / `Delete` / `Create/Update` / `Dictate`) and Korean on slides 6, 7, 8, 10, and 12. `애플리케이션API 호출` (slides 4, 5, 13) and `애플리케이션 API 호출` (slides 6–12) also differ by one space. The table above uses one consistent set of labels ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

The service label `Amazon APIGateway` is missing a space. The correct name is `Amazon API Gateway`, and the same deck's slide 10 body and instructor notes write it correctly. **M01 recorded the same item** ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

### 2.2 Which Service Owns Which Element

The courseware scatters this mapping across slides 4 to 13. Collected into one table:

| Diagram element | Service | Introduced on slide | Detail module |
|---|---|---|---|
| Website hosting | Amazon S3 | 7 | Module 6 |
| MP3 hosting | Amazon S3 | 7 | Module 6 |
| List / Search / Delete / Create-Update (business logic) | AWS Lambda | 9 | Module 9 |
| Storing user notes and interactions | Amazon DynamoDB | 8 | Modules 7 and 8 |
| Application API call | Amazon API Gateway | 10 | Module 10 |
| User authentication | Amazon Cognito | 11 | Module 12 |
| Dictate to speech | Amazon Polly | 4 | — |
| Detecting errors and degradation, tracing data | Amazon CloudWatch, AWS X-Ray | 12 | Module 14 |
| Managing secure access | IAM | 6 | Module 4 |
| Deployment | AWS SAM | (label only) | Module 13 |

`AWS SAM` appears only as a diagram label; this deck's instructor notes never explain it. Its current position in the documentation is in [Section 4.3](#43-current-names-for-the-aws-sdks-and-toolkits).

---

## 3. Application Overview

Slides 4 and 5, plus the wrap-up slide 13. All three use the same full picture and differ only in emphasis.

### 3.1 What You Build (Slide 4)

| Slide body | What the instructor notes confirm |
|---|---|
| A fully functional web application | Users authenticated with Amazon Cognito can add custom notes converted to speech using Amazon Polly |
| User authentication | Users authenticate to a web portal where they can search, list, and delete audio notes |
| CRUD operations | To build a text-to-speech (TTS) application you need to understand how to connect to the AWS environment |

After this slide the instructor notes move on to "review the full architecture view that shows how AWS services interoperate." That full view is the picture in [Section 2](#2-the-recurring-architecture-diagram).

### 3.2 How You Build It (Slide 5)

| Slide body | What the instructor notes confirm |
|---|---|
| Everything runs in the AWS Cloud | You are building a cloud-native application |
| Microservice-centered | The application uses serverless services such as Amazon API Gateway, AWS Lambda, and Amazon DynamoDB |
| AWS development tools | You do not use only the AWS Management Console. You learn to use AWS development tools such as the AWS SDKs, and pick up additional tools as you build |

### 3.3 The Serverless Core Service Set 🆕

The three services the courseware groups as "serverless" (API Gateway, Lambda, DynamoDB) overlap exactly with the core service set the current AWS Serverless Developer Guide presents. The guide adds IAM, making four core services for implementing serverless solutions.

| Service | Role assigned by the guide |
|---|---|
| AWS Identity and Access Management | Securely accessing resources on AWS |
| AWS Lambda | Serverless compute functionality |
| Amazon API Gateway | Integrating `HTTP` and `HTTPS` requests with services to handle the requests |
| Amazon DynamoDB | Data storage and retrieval |

The guide defines serverless development as building applications **without managing long-running servers, such as a provisioned Amazon EC2 instance**, and describes AWS serverless technologies as pay-as-you-go, able to scale up and down as application needs change, and built to expand across AWS Regions for resiliency. The first module of the Serverless Patterns Workshop that the guide cites has this architecture: client → REST API (API Gateway) → Lambda function → DynamoDB table. That is the Pollynotes path.

> — Source: [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html)

### 3.4 You Keep Following This Architecture (Slide 13)

The wrap-up slide. No body items, just the picture, with only the IAM label spelled out as `AWS Identity and Access Management (IAM)`. The instructor notes make three points.

| # | Point |
|---|---|
| 1 | This module introduced the application architecture and its individual components |
| 2 | You **keep following this architecture diagram** as you work through the development process across the course |
| 3 | Next you begin the development journey with the **developer tools** needed to build this application |

Point 3 is the subject of Module 3.

---

## 4. Developer Tools

Slide 6. The diagram adds the developer-side elements: integrated development environment (IDE), developer, AWS software development kit (AWS SDK), toolkits, and IAM.

### 4.1 What the Slide Says

| Slide body | What the instructor notes confirm |
|---|---|
| Use an IDE with the AWS SDKs and toolkits to interact with AWS resources | You learn to set up an IDE configured with the right IAM permissions. Once that environment configuration is in place, you can call AWS services through the AWS SDKs and toolkits |
| Use IAM to manage secure access to AWS resources | IAM lets you securely manage access to AWS resources. You also learn to configure IAM account permissions and the security profiles needed across the application development lifecycle |

The instructor notes say there are "many ways to build applications on AWS," note that developers may prefer to interact with the AWS Cloud through a specific coding language or tool, and close with "developers can use these tools to build applications without using the AWS Management Console interface."

The description of IAM itself matches current documentation. IAM is a web service that helps you securely control access to AWS resources, and you use it to control who is authenticated (signed in) and authorized (has permissions). Worth noting: IAM, AWS IAM Identity Center, and AWS STS are features of your AWS account offered at **no additional charge**, and you are charged only when you access other AWS services using IAM users or AWS STS temporary credentials.

> — Source: [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

### 4.2 The Claim That the Console Supports Everything 🔄

The first paragraph of the instructor notes puts the console at the center: `The AWS Management Console supports all the functionality needed to obtain access and manage your application.` The documentation's parity statement has a **different scope and a different direction.**

| Aspect | Courseware | Current documentation |
|---|---|---|
| Reference point | AWS Management Console | AWS API and AWS CLI |
| Direction of the claim | The console supports everything you need | **All of the console's IaaS administration, management, and access functions are available in the API and CLI** |
| Scope | Unbounded | **IaaS** (infrastructure as a service) functions |
| New features | Not mentioned | New AWS IaaS features and services provide full console functionality through the API and CLI at launch or **within 180 days** of launch |

So the documentation does not say the console is a superset of everything. It says the CLI lets you, with minimal configuration, run functionality equivalent to the browser-based console from your terminal. The instructor notes' conclusion (you can build without the console) points the same way as the documentation, so what changes is the scope of the supporting sentence.

> — Source: [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)

### 4.3 Current Names for the AWS SDKs and Toolkits 🆕

The courseware puts only two labels on the diagram: `AWS software development kit (AWS SDK)` and `toolkits`. Here is how those two appear in current documentation.

| Courseware label | Current documentation |
|---|---|
| AWS software development kit (AWS SDK) | AWS SDKs for C++, Go, Java, JavaScript, Kotlin, .NET, PHP, Python (Boto3), Ruby, Rust, and Swift. The AWS CLI and AWS Tools for Windows PowerShell share the same reference guide |
| Toolkits | Per-IDE **AWS Toolkits**: AWS Toolkit for JetBrains, AWS Toolkit for Visual Studio, AWS Toolkit for Visual Studio Code, AWS Toolkit for Azure DevOps |

What many SDKs and tools share — global configuration through the shared `config` and `credentials` files or environment variables, authentication and access, the standardized settings reference, the AWS Common Runtime (CRT) libraries, and the maintenance policy and versioning — is collected in the `AWS SDKs and Tools Reference Guide`. The specific guide for the SDK or tool you use should be read **in addition to** that one.

> — Source: [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html)

**Where AWS SAM sits now.** The courseware puts an `AWS SAM` label on the diagram and never explains it. Current documentation describes AWS SAM as an open-source framework for building serverless applications using infrastructure as code (IaC), and it **explicitly compares SAM with other IaC tools**. That comparison is not in the courseware.

| Compared with | What the documentation advises |
|---|---|
| CloudFormation | Use SAM instead of CloudFormation to simplify serverless resource definitions while maintaining template compatibility |
| AWS CDK | Use SAM instead of AWS CDK if you prefer a **declarative** approach to describing infrastructure rather than a programmatic one |
| Alongside AWS CDK | Combine SAM with CDK by using the SAM CLI's local testing features to enhance your CDK applications |

Key features absent from the courseware include **AWS SAM connectors** for defining permissions between resources, **`sam sync`** for continuously syncing local changes to the cloud, and support for local debugging and testing of Terraform serverless applications.

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

---

## 5. Storage and Hosting: Amazon S3

Slide 7. The diagram highlights two boxes, `Website hosting` and `MP3 hosting`, plus `basic website user interface`.

### 5.1 What the Slide Says

| Slide body | What the instructor notes confirm |
|---|---|
| Amazon S3 | AWS has several practical storage solutions, and among them Amazon S3 offers a simplified solution that meets two main requirements: **hosting and file storage** |
| Frontend hosting | Pollynotes uses an S3 bucket to host the website that acts as the application's frontend |
| User file storage | It stores the MP3 files generated by Amazon Polly the same way |

The instructor notes add that "the application's storage solution also integrates well with AWS compute solutions for create, read, update, and delete (CRUD) operations." That compute solution is the Lambda of [Section 6](#6-managing-and-processing-data-dynamodb-and-lambda).

### 5.2 Both Use Cases Still Hold

Amazon S3 is an object storage service offering scalability, data availability, security, and performance, and the use case list in the documentation includes **both websites and mobile applications**. So the courseware's "hosting plus file storage" framing still holds. By default, S3 buckets and the objects in them are private, and you have access only to the S3 resources you create.

> — Source: [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 5.3 The Recommended Path for Frontend Hosting 🔄

What changed is **how** you host. The courseware presents only hosting a static website directly out of an S3 bucket; the current documentation's first recommendation is different.

| Approach | Where current documentation places it |
|---|---|
| **AWS Amplify Hosting** | **First recommendation** for hosting static website content stored on S3. A fully managed service that deploys to a global CDN powered by Amazon CloudFront, letting you select the location of your objects within a general purpose bucket, deploy to a managed CDN, and **generate a public HTTPS URL** |
| CloudFront + OAC | **Required when the bucket is encrypted with SSE-KMS** (SSE-KMS does not support anonymous users). Secure the origin with **OAC (origin access control)**, not OAI |
| S3 website endpoint | The approach the courseware presents |

Module 6 covers these three paths and the website endpoint's constraints (no HTTPS, and so on) in detail. This document records only the overview-level fact that the recommended path changed.

> — Source: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

### 5.4 The Side That Produces the MP3: Amazon Polly 🔄

The courseware introduces Polly only as "text-to-speech (TTS)" and offers no voice choices. Current documentation names **four voice engines**.

| Voice engine | Note |
|---|---|
| Generative | Added after the courseware |
| Long-form | Added after the courseware |
| Neural | Supports the Newscaster speaking style for news narration |
| Standard | |

To use a voice you select an engine and a speech synthesis API operation, provide the input text to synthesize, and select an audio output format. You pay only for the **text you synthesize**, and caching and replaying generated speech costs nothing extra. That points the same way as this architecture, which stores MP3s in S3 for playback.

> — Source: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

> — Source: [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)

---

## 6. Managing and Processing Data: DynamoDB and Lambda

Slides 8 and 9. Both slides carry the identical body items `Serverless` and `Capacity sizing`, so they are covered side by side.

### 6.1 What the Slides Say

| Slide | Service | Emphasis | What the instructor notes confirm |
|---|---|---|---|
| 8 | Amazon DynamoDB | Serverless / Capacity sizing | The application needs a database to store the interactions when users add, read, update, and delete notes. Its scalability meets the application's functional capacity requirements. It is a serverless solution with no software to install or maintain |
| 9 | AWS Lambda | Serverless / Capacity sizing | You create several Lambda functions to drive the application's CRUD operations. These functions provide a workload-aware sizing solution you can configure and maintain from your development environment |

The slide 8 diagram highlights `user notes and interactions stored in a DynamoDB table`; slide 9 highlights the `business logic` box and the four CRUD operations plus `Dictate` inside it.

### 6.2 The Current Sentence Describing DynamoDB 🔄

The courseware instructor notes describe DynamoDB as a `fully managed NoSQL database service that delivers fast and predictable performance with seamless scalability`. The first sentence of current documentation is different.

| Aspect | Courseware | Current documentation |
|---|---|---|
| Definition | Fully managed NoSQL database service | **Serverless, fully managed, distributed** NoSQL database |
| Performance | Fast and predictable performance with seamless scalability | **Single-digit millisecond performance** at any scale |

This is not a reversal of meaning. But a learner who goes to the documentation will see a different sentence, so it is worth flagging. Here is what the documentation gives as the basis for "serverless."

| Characteristic | What the documentation says |
|---|---|
| Servers and software | No servers to provision, and no software to patch, manage, install, maintain, or operate |
| Maintenance | **Zero downtime maintenance.** No versions (major, minor, or patch) and no maintenance windows |
| Scaling down | With on-demand, it **scales down to zero** so there is no throughput charge when the table has no traffic, and **no cold starts** |
| Fully managed | The service handles setup, configurations, maintenance, high availability, hardware provisioning, security, backups, and monitoring |
| NoSQL | Supports both key-value and document data models. **No JOIN operator** (denormalizing the data model is recommended). Provides strong read consistency and ACID transactions |

> — Source: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

### 6.3 The Current Default Behind Capacity Sizing 🔄

The courseware writes only `Capacity sizing` and does not distinguish capacity modes. Current documentation states that **on-demand mode is the default and recommended throughput option.**

| Aspect | On-demand |
|---|---|
| Position in the documentation | **The default and recommended throughput option** |
| Billing | Per read or write request. No throughput charge when traffic is zero |
| Scaling | Instantly accommodates any previously reached traffic level; automatically scales for a new peak |
| Quality | Same single-digit millisecond latency, SLA, and security as provisioned mode |
| Mode switching | Provisioned to on-demand up to four times in a 24-hour rolling window; on-demand to provisioned at any time |

You feel this directly in the labs: **a table created with default settings is in on-demand mode**, so the screen may differ from older captures. Capacity units (RCU, WCU, RRU, WRU) and Auto Scaling belong to Modules 7 and 8.

> — Source: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

### 6.4 The Scope of Lambda 🔄

The courseware treats Lambda as a single concept: the function. Current documentation presents **two compute primitives** designed for different workload patterns.

| Aspect | Lambda Functions | Lambda MicroVMs |
|---|---|---|
| Best for | Request-response or event-driven workloads (APIs, data processing, automation) | Persistent environments running user- or AI-produced untrusted code |
| Programming model | A handler function invoked in a supported runtime | Any application: run your own binaries, listen on ports, use Linux OS capabilities |
| Duration | Up to 15 minutes per invocation; multi-step workflows lasting up to a year with Lambda Durable Functions | Up to 8 hours per session; suspend and resume across sessions |
| Scaling | **Automatic.** Lambda creates and destroys execution environments in response to traffic | Developer-controlled. You create, suspend, resume, and terminate through the API |
| Pricing | Per request plus GB-seconds of execution time | Per second of compute while running plus snapshot storage while suspended |

Both primitives share a common foundation: no server management, pay-per-use billing, managed networking, and Firecracker virtualization. **The labs in this course take the Lambda Functions path.** The courseware's "workload-aware sizing" appears in the documentation as scaling horizontally to match demand, and triggers can come from API Gateway, Amazon S3, Amazon SQS, EventBridge, and 200-plus other AWS services.

> — Source: [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

### 6.5 The Way the Deck Contrasts EC2 and Lambda 🔄

The slide 9 instructor notes open like this:

> Amazon Elastic Compute Cloud (Amazon EC2) instances address your application's compute requirements but require continuous monitoring and maintenance. To simplify application development while reducing cost, you create several AWS Lambda functions to drive the application's CRUD operations.

**The maintenance half points the same way as current guidance, but the documentation does not frame cost the way the deck does.** The current compute service decision guide presents the choice as a balance across ten factors: workload type and requirements, performance needs, scalability, management overhead, cost optimization, latency and throughput, compliance and security, integration, reliability and availability, and development and deployment experience.

| Angle | Courseware | Decision guide |
|---|---|---|
| EC2 management burden | Requires continuous monitoring and maintenance | Managing EC2 instances involves responsibility for **setup, scaling, patching, and securing** servers, and can require a dedicated operations team |
| How that burden is judged | Presented as something to avoid | For use cases where **granular control over the compute environment is necessary, the overhead is often justified** |
| The benefit of Lambda | Cost savings plus simpler development | Runs code in response to events without the need to manage servers, **reducing the operational burden** |
| The route to lower cost | Move to Lambda | **Instance selection** (more than 750 instance types; Graviton-based instances deliver up to 40 percent better price performance than comparable non-Graviton instances), **purchase plans** (Savings Plans up to 72 percent, Spot Instances up to 90 percent), and **right sizing** (EC2 Auto Scaling, Compute Optimizer up to 25 percent, AWS Trusted Advisor) |
| Nature of the choice | Either/or | **You can use multiple types of compute solutions in a single workload** |

In short, the documentation does not support the conclusion that Lambda is always cheaper and simpler. **The judgment that Lambda fits this course's CRUD workload still holds; the basis is not cost but the request- and event-driven nature of the workload.** The guide also notes that managed container services provide a middle ground between control and convenience. Module 9 covers the compute service comparison in detail.

> — Source: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html)

---

## 7. Connection and Access: API Gateway and Amazon Cognito

Slides 10 and 11. The layer that ties the preceding services together, and the user authentication layer that sits in front of it.

### 7.1 What the Slides Say

| Slide | Service | Body | What the instructor notes confirm |
|---|---|---|---|
| 10 | Amazon API Gateway | Routes event-driven requests / Logs API calls | It connects all of the application's services together. It relays event-driven requests between users and compute, database, and storage services. It simplifies the process of creating, publishing, maintaining, monitoring, and securing APIs suited to the application's specific tasks |
| 11 | Amazon Cognito | User pools (sign-up, sign-in) / Identity pools (granting access) | Users need secure authentication and authorization. A user pool is a user directory that creates built-in sign-up and sign-in options. Use an identity pool to grant users access to other AWS services. The two can be used separately or together |

The slide 10 diagram draws the request flow as three boxes: `user makes a request` → `REST API / API Gateway routes the request to AWS resources` → `API Gateway sends the response back to the user`.

### 7.2 API Gateway Creates Three Kinds of API 🔄

The courseware diagram names only `REST API`. Current documentation describes Amazon API Gateway as the AWS service for creating, publishing, maintaining, monitoring, and securing **REST, HTTP, and WebSocket APIs** at any scale.

| API type | How the documentation characterizes it |
|---|---|
| REST | Stateless. HTTP-based and implements standard HTTP methods such as `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` |
| HTTP | Stateless. Also a RESTful API product, **designed with minimal features so it can be offered at a lower price** |
| WebSocket | **Stateful.** Adheres to the WebSocket protocol for full-duplex communication and routes incoming messages based on message content |

AWS does not blanket-recommend one over another. It tells you to **choose on features and price.**

| What you need | Choice |
|---|---|
| API keys, per-client throttling, request validation, AWS WAF integration, private API endpoints | **REST API** |
| None of the above | **HTTP API** (lower price) |

A few more differences: for endpoint types, REST supports edge-optimized, regional, and private while HTTP supports regional only. For authorization, REST supports Amazon Cognito directly while HTTP uses Cognito through a JWT authorizer. Test invocations, caching, request validation, canary release deployments, and the developer portal are REST-only; automatic deployments are HTTP-only. **Using a REST API in this course is not a wrong choice.** What the courseware omits is that the choice exists at all. Module 10 covers API types and integrations in detail.

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 7.3 The Basis for "Connects All the Services" and "Logs API Calls" 🆕

Here is how the courseware's two statements appear in current documentation.

| Courseware statement | Current documentation |
|---|---|
| Connects all the services together | API Gateway acts as a **"front door"** for applications to access data, business logic, or functionality from backend services such as workloads running on Amazon EC2, code running on AWS Lambda, any web application, or real-time communication applications |
| Logs API calls | The feature list includes **CloudWatch access logging and execution logging** (with the ability to set alarms) and **CloudTrail logging** and monitoring of API usage and API changes |
| Routes event-driven requests | It handles all the tasks involved in accepting and processing up to hundreds of thousands of concurrent API calls, including traffic management, authorization and access control, monitoring, and API version management |

Features absent from the courseware include authentication mechanisms using IAM policies, Lambda authorizer functions, and Amazon Cognito user pools; canary release deployments; API creation from CloudFormation templates; custom domain names; **AWS WAF integration**; and **AWS X-Ray integration** for understanding and triaging performance latencies. The documentation states that together with AWS Lambda, API Gateway forms the **app-facing part of the AWS serverless infrastructure.**

> — Source: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 7.4 The Two Components of Amazon Cognito Are Unchanged

The split on slide 11 matches current documentation **exactly.** Amazon Cognito is an identity platform for web and mobile apps: a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens and AWS credentials.

| Component | When you create it | What it does | Independence |
|---|---|---|---|
| User pool | When you want to **authenticate and authorize** users to your app or API | A user directory with both self-service and administrator-driven user creation, management, and authentication. Issues authenticated JWTs directly to an app, a web server, or an API | **Does not require** integration with an identity pool |
| Identity pool | When you want to authorize authenticated or anonymous users to access your **AWS resources** | Issues AWS credentials. Uses both role-based and attribute-based access control to manage authorization. Can optionally issue credentials for guest users | **Does not require** integration with a user pool |

The flow when the two are used together is as follows. This is what the courseware's "used separately or together" refers to.

| Step | Detail |
|---|---|
| 1 | Your app user signs in through the **user pool** and receives OAuth 2.0 tokens |
| 2 | Your app exchanges a user pool token with the **identity pool** for temporary AWS credentials |
| 3 | Your app assigns the credentials session to the user and delivers authorized access to AWS services like Amazon S3 and Amazon DynamoDB |

The Pollynotes path — user → Cognito → API Gateway → Lambda → DynamoDB and S3 — is that flow.

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.5 The Sign-Up/Sign-In Pages and the Feature Plans Have Changed 🔄

That a user pool provides sign-up and sign-in pages is unchanged. What changed is **the name of those pages and the choice you face when creating a user pool.** This is where the console will look different from the courseware in the labs.

**The login pages.** Current documentation has two branding versions.

| Version | What the documentation says |
|---|---|
| **managed login** | The newer version. Customized through the branding editor |
| hosted UI (classic) | **"A slimmer, less-customizable predecessor to managed login"** |

Both support sign-up, sign-in, and password management, including completing sign-in with multi-factor authentication (MFA) and registration of webAuthn authenticators. A few constraints are worth knowing.

| Aspect | Detail |
|---|---|
| Profile management | managed login **does not support user self-service profile management** such as attribute changes and setting MFA preference. You must implement that in your own application code |
| Session cookie | Signing in sets a browser cookie that lets users sign in again with the same authentication method for **one hour.** Signing in with the cookie does not extend the cookie duration |
| TLS | managed login **requires TLS 1.2** for both custom and prefix domains. The classic hosted UI does not require it for custom domains |
| CORS | Neither version supports custom CORS origin policies. Implement the CORS policy in your application front end |
| Default branding style | Creating an app client in the console assigns a style automatically. Creating one with `CreateUserPoolClient` means managed login is unavailable until you send a `CreateManagedLoginBranding` request |

> — Source: [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

**Feature plans.** A concept absent from the courseware. Each user pool now selects a feature plan.

| Plan | Includes |
|---|---|
| Lite | A low-cost plan for user pools with lower numbers of monthly active users. Includes sign-in features and the **classic hosted UI.** Newer features like access-token customization and passkey authentication are not included |
| **Essentials** | **The default for new user pools.** All of the latest user pool authentication features, with advanced authentication features like choice-based sign-in and email MFA |
| Plus | Everything in Essentials plus threat protection. Monitors sign-in, sign-up, and password-management requests for indicators of compromise (signing in from an unexpected location, using a password from a public breach) |

| Aspect | Detail |
|---|---|
| Unit of application | **One user pool.** Different user pools in the same account can have different plans, but you cannot apply separate plans to app clients within a user pool |
| API and CLI | The `UserPoolTier` parameter of `CreateUserPool` and `UpdateUserPool`. Omitting it defaults to `Essentials`. In the AWS CLI it is the `--user-pool-tier` argument |
| Previous structure | Features that were in the former `advanced security features` pricing structure are now under either Essentials or Plus |
| Switching | You can switch plans at any time. Some changes require turning off active features first |

> — Source: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

---

## 8. Observability: CloudWatch and X-Ray

Slide 12. The diagram adds the boxes `errors or degraded performance`, `how do we improve it?`, `trace data`, and `application analysis`.

### 8.1 What the Slide Says

| Slide body | What the instructor notes confirm |
|---|---|
| Amazon CloudWatch / Observability | The application needs monitoring and troubleshooting services to fix problems that could interfere with user interactions or future development updates. Amazon CloudWatch provides actionable insights |
| AWS X-Ray / Tracing | The application also uses AWS X-Ray to support analysis and debugging of distributed applications |

### 8.2 Tracing Has Moved Inside the CloudWatch Story 🔄

The courseware assigns observability to CloudWatch and tracing to X-Ray, **splitting them by service.** Current CloudWatch documentation treats tracing as part of the CloudWatch observability story.

| CloudWatch topic | Where tracing appears |
|---|---|
| CloudWatch agent | Collects **metrics, logs, and traces** together from Amazon EC2 fleets |
| Cross-account observability | From a central monitoring account, view **metrics, logs, and traces** from source accounts |
| OpenTelemetry support | Native OTLP endpoints ingest **metrics, logs, and traces** using the OpenTelemetry standard. PromQL querying supported |

Some topics are absent from the courseware entirely.

| Item | Detail |
|---|---|
| Application Signals | Automatically detects and monitors key performance indicators like latency, error rates, and request rates without manual instrumentation or code changes. Provides curated dashboards |
| CloudWatch Synthetics | Proactively monitors endpoints and APIs through configurable scripts called canaries |
| CloudWatch RUM | Gathers performance data from real user sessions |
| Service Level Objectives (SLOs) | Define, track, and alert on reliability targets, with error budgets and SLO compliance monitoring |
| Lambda Insights | System-level metrics for Lambda functions, including memory and CPU utilization and **cold start detection and analysis** |

> — Source: [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

### 8.3 The Current State of the X-Ray Console 🔄

The X-Ray service has not been discontinued. What changed is **the screen you go to.** The documentation states plainly that **"AWS is no longer developing the X-Ray console."**

| Aspect | Current state |
|---|---|
| Available consoles | The Amazon CloudWatch console **or** the X-Ray console |
| Development status | The X-Ray console is **no longer being developed.** The CloudWatch console includes new X-Ray functionality redesigned from the X-Ray console |
| Service map | The X-Ray Service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map** in the CloudWatch console. `X-Ray traces` → `Trace Map` in the left navigation pane |
| Insights | X-Ray Insights is included under `Insights` in the CloudWatch console |
| Service-level observation | CloudWatch **Application Signals.** Drill down from SLO-based health metrics to correlated X-Ray traces |
| Viewing together | In the CloudWatch console you can view CloudWatch logs and metrics alongside X-Ray trace data |

This is where the screen path for Lab 7 (Module 14) may differ from the courseware. **M01 recorded the same item against the same source.**

> — Source: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 9. Changes from the Courseware

Items in the courseware (instructor deck) that differ from current facts. Learners have the official courseware in hand, so this record lets them check what was changed and why.

M02 is an overview module, so this section holds more **reframing and relocation of consoles and documentation** than technical errors. Verification found **no items with ended support in this module.** Five items where the courseware contradicts itself are listed with an empty evidence column and carried to [Section 9.5](#95-items-that-could-not-be-verified), because AWS documentation cannot settle them.

### 9.1 Courseware Statements That Do Not Match the Facts

| Item | As written in the courseware | What was verified | Source |
|---|---|---|---|
| API type (slide 10 diagram) | Only `REST API` | Current documentation presents **REST, HTTP, and WebSocket** and tells you to choose on features and price. REST if you need API keys, per-client throttling, request validation, AWS WAF integration, or private endpoints; the cheaper HTTP if you do not. Using REST in this course is still valid | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| Console capability claim (slide 6 instructor notes) | `The AWS Management Console supports all the functionality needed to obtain access and manage your application` | The documentation's parity statement is scoped to **IaaS** administration, management, and access functions, and runs in the opposite direction: all of the console's IaaS functions are available in the AWS API and AWS CLI, and new IaaS features arrive there at launch or within **180 days**. The documentation does not say the console is a superset of everything | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |
| `Amazon APIGateway` (slides 4, 5, 6, 7, 8, 9, 11, 12, 13 diagrams) | Written as one word with no space | The correct documented name is **`Amazon API Gateway`**. The same deck's slide 10 body and instructor notes write it correctly. **M01 recorded the same item** | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| IAM abbreviation (slide 2 diagram) | `AWS Identity and Access Management (AWS IAM)` | The documented abbreviation is **`IAM`**. The same deck writes `IAM` on the slide 4–12 diagrams, `AWS Identity and Access Management (IAM)` on slide 13, and `(IAM)` in the slide 6 instructor notes, so only slide 2 differs. **M01 recorded the same item on its slide 7 instructor notes** | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| Module 4 title (slide 2 agenda) | `권한 시작하기` (getting started with permissions) | The M04 deck cover reads `모듈 4: 권한 부여 시작하기` (getting started with authorization). The M01 slide 7 agenda also reads `권한 시작하기`, so **the two agendas agree with each other and only the module deck cover differs.** Module 3 matches between the agenda and its deck cover. This document treats each module deck cover as authoritative. Note that the English edition of Module 4 in this series renders its title as `Getting Started with Permissions`, so the difference is not visible in the English locale | — ([Section 9.5](#95-items-that-could-not-be-verified)) |
| This module's title (slide 1 vs slide 2) | Slide 1 subtitle `모듈 2: AWS에 웹 애플리케이션 구축` vs slide 2 agenda `AWS에 웹 애플리케이션 빌드` | One English phrase rendered two different ways inside one deck in the Korean courseware. It looks like a translation inconsistency. This document follows the slide 1 subtitle | — ([Section 9.5](#95-items-that-could-not-be-verified)) |
| Slide 2 title | None (the layout is a title slide but the title text is empty) | The content is the Day 1 morning agenda and the lab environment diagram. In M01 the equivalent slide carries a title such as `Day 1 morning` | — ([Section 9.5](#95-items-that-could-not-be-verified)) |
| Lab environment connection methods (slide 2) | Three: `Guacamole` / `SSH` / `Remote Desktop` | The M01 slide 7 box lists two (`Guacamole or Remote Desktop`) and that slide's instructor notes list a different three (`Guacamole, Remote Desktop, or a browser-based option`). All three places differ, and `SSH` appears nowhere in M01. This is lab-environment logistics and cannot be settled here | — ([Section 9.5](#95-items-that-could-not-be-verified)) |
| Diagram label languages (slides 4–13) | English on slides 4, 5, 9, 11, 13 (`List`/`Search`/`Delete`/`Create/Update`/`Dictate`); Korean on slides 6, 7, 8, 10, 12 | The same diagram has different translation coverage per slide. `애플리케이션API 호출` and `애플리케이션 API 호출` also differ by one space. This document uses one consistent set of labels | — ([Section 9.5](#95-items-that-could-not-be-verified)) |

### 9.2 Behavior and Defaults That Changed

| Item | As written in the courseware | Current state | Source |
|---|---|---|---|
| The EC2-versus-Lambda contrast (slide 9 instructor notes) | EC2 `requires continuous monitoring and maintenance`; Lambda `simplifies application development while reducing cost` | The maintenance half points the same way, but the decision guide presents compute choice as a balance across **ten factors** and adds that where granular control is necessary "the overhead is **often justified**." Cost is approached through instance selection, purchase plans, and right sizing rather than by moving to Lambda, and the guide notes that **multiple compute solutions can be used in a single workload.** The basis for choosing Lambda is the request- and event-driven workload, not cost | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html) |
| DynamoDB definition (slide 8 instructor notes) | `Fully managed NoSQL database service that delivers fast and predictable performance with seamless scalability` | The first sentence of current documentation is **"a serverless, fully managed, distributed NoSQL database with single-digit millisecond performance at any scale."** The performance claim is now specific and `serverless` and `distributed` are part of the definition | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| DynamoDB `Capacity sizing` (slide 8) | Written as `Capacity sizing` with no distinction between capacity modes | **On-demand mode is the default and recommended throughput option.** A table created with default settings is in on-demand mode, so the lab screen may differ from older captures | [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| The scope of AWS Lambda (slide 9) | Lambda presented as a single concept, the function | The documentation presents **Lambda Functions** and **Lambda MicroVMs** as two compute primitives. The labs in this course take the Lambda Functions path | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| Frontend hosting approach (slide 7) | Host a static website directly out of an S3 bucket | The documentation's first recommendation is **AWS Amplify Hosting** (a CloudFront-powered global CDN that generates a public HTTPS URL). When the bucket is **encrypted with SSE-KMS, CloudFront plus OAC is required** | [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| Cognito sign-up/sign-in pages (slide 11) | `Built-in sign-up and sign-in options` | There are two branding versions, **managed login** and **hosted UI (classic)**, and the documentation describes the classic one as a "slimmer, less-customizable predecessor to managed login." managed login does not support self-service profile management, so that part goes in your application code | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| Cognito composition (slide 11) | Only the two components, user pools and identity pools | User pools have feature plans (**Lite / Essentials / Plus**) and the **default for new user pools is Essentials.** Plans apply per user pool and cannot differ per app client | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Splitting observability from tracing (slide 12) | Observability assigned to CloudWatch, tracing to X-Ray, by service | CloudWatch documentation treats tracing as part of the observability story: the agent collects metrics, logs, and traces together, cross-account observability views traces, and OTLP endpoints ingest traces | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| Speech conversion (slide 4 instructor notes) | Amazon Polly presented only as a text-to-speech service | There are four voice engines: **Generative, Long-form, Neural, and Standard.** Generative and Long-form were added after the courseware. **M01 recorded the same item against the same source** | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |

### 9.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The AWS X-Ray console (slide 12, slides 4–13 diagrams) | **Discouraged.** The documentation states that "AWS is no longer developing the X-Ray console." The X-Ray service itself has not been discontinued | The **Amazon CloudWatch console**: `X-Ray traces` → `Trace Map`. For service-level observation, CloudWatch **Application Signals**. X-Ray Insights is also included under Insights in the CloudWatch console | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

There are no items with **ended** support in this module.

### 9.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| API Gateway HTTP APIs and WebSocket APIs | Beyond the courseware's REST API there are stateless HTTP APIs (minimal features, lower price) and stateful WebSocket APIs. HTTP APIs support automatic deployments and JWT authorizers; WebSocket APIs route on message content | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| API Gateway integration with AWS WAF and X-Ray | The feature list includes AWS WAF integration for protection against common web exploits and AWS X-Ray integration for understanding and triaging performance latencies. Canary release deployments and CloudFormation-based API creation are also included | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| Amazon Cognito feature plans | Three plans: Lite, Essentials, and Plus. The default for new user pools is Essentials, and features from the former `advanced security features` pricing structure now live under Essentials or Plus. Plus detects sign-ins from unexpected locations and passwords from public breaches | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Cognito managed login and the branding editor | The newer customizable login pages and the branding editor. Choice-based sign-in, email MFA, and passkey (webAuthn) authentication are presented alongside them | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| CloudWatch Application Signals, Synthetics, RUM, and SLOs | APM without manual instrumentation (Application Signals), proactive canary-based monitoring (Synthetics), real user session data (RUM), and service level objectives with error budgets. Lambda Insights adds cold start detection and analysis | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| CloudWatch OpenTelemetry support | Native OTLP endpoints ingest metrics, logs, and traces, with PromQL querying. The same instrumentation can send to CloudWatch and to third-party destinations | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| The AWS SAM IaC tool comparison | The documentation now spells out when to use SAM instead of CloudFormation, when to use it instead of AWS CDK, and when to combine the two. Connectors, `sam sync`, and Terraform support are listed as key features | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| Lambda MicroVMs and Durable Functions | MicroVMs are isolated environments with near-instant startup and state retention for up to 8 hours. Lambda Durable Functions support multi-step workflows lasting up to a year | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| The Serverless Developer Guide | A separate guide presents the three services the courseware groups as "serverless," plus IAM, as the core services for serverless solutions. It also points to the Serverless Patterns Workshop | [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html) |
| Per-IDE AWS Toolkits | The courseware's `toolkits` label appears in current documentation as AWS Toolkit for JetBrains, Visual Studio, Visual Studio Code, and Azure DevOps. Shared configuration, authentication, CRT libraries, and the maintenance policy are collected in one reference guide | [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html) |

### 9.5 Items That Could Not Be Verified

Recorded honestly. Check these before stating them with certainty in class.

| Item | Status |
|---|---|
| Five internal courseware inconsistencies | The missing slide 2 title, the two renderings of the Module 2 title, the two renderings of the Module 4 title, the connection-method counts (two, three, and three, all different), and the mixed English/Korean diagram labels. All are **internal courseware issues, not something external documentation can settle.** [Section 9.1](#91-courseware-statements-that-do-not-match-the-facts) records only which side this document followed |
| Lab environment connection methods (the `SSH` on slide 2) | Only slide 2 lists `SSH` as a connection method; it appears in neither the box nor the instructor notes in M01. This is lab-environment logistics, and Apache Guacamole is not covered by documentation on an AWS-operated domain, so **the current connection method could not be determined.** Follow the lab environment instructions for the actual method |
| Arrow directions and exact layout in the diagram | The extraction ledger preserves text box contents but not the shape connections. The element-to-service mapping in [Section 2.2](#22-which-service-owns-which-element) covers only what the slide titles, bodies, and instructor notes state explicitly. **For which arrow points where, you need the original courseware** |
| Managed options that reduce the EC2 management burden | What was verified in the decision guide is the scope of EC2 management responsibility (setup, scaling, patching, securing), the statement that the overhead can be justified, and the mention that Elastic Beanstalk provides managed updates. **Whether patch automation such as AWS Systems Manager Patch Manager softens the courseware's "continuous maintenance" claim was not verified** |
| The detailed behavior of Lambda MicroVMs and Durable Functions | The existence of both features and their high-level characteristics (up to 8-hour sessions, workflows up to a year, billing units) were verified from the Lambda overview page. **Their dedicated guides were not retrieved.** That exceeds the scope of this overview module, so only their existence and location are recorded. M09 left the same item for the same reason |
| API Gateway integration types and the configuration Pollynotes actually uses | What was verified is the three API types and their feature differences. **Which integration type (Lambda proxy, non-proxy, and so on) and stage configuration this course's API actually uses is not in this deck.** That belongs to Module 10 and Lab 5 |
| How the Cognito feature plan choice affects this course's labs | The Essentials default for new user pools and the per-plan feature differences were verified. **Which plan Lab 6 (the capstone) assumes is not in this deck.** Check the lab guide |
| Per-service quotas and pricing figures | This is an overview module and does not cover per-service quotas or pricing, so this document does not carry them either. See the relevant sections of Modules 5 and 6 for storage, Modules 7 and 8 for databases, and Module 9 for compute |
