# Module 2: Building a Web Application on AWS

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [The Pollynotes Architecture](#2-the-pollynotes-architecture)
3. [What the Application Does](#3-what-the-application-does)
4. [Developer Tools](#4-developer-tools)
5. [Storage and Hosting: Amazon S3](#5-storage-and-hosting-amazon-s3)
6. [Data Management and Processing: DynamoDB and Lambda](#6-data-management-and-processing-dynamodb-and-lambda)
7. [Connection and Access: API Gateway and Amazon Cognito](#7-connection-and-access-api-gateway-and-amazon-cognito)
8. [Observability: CloudWatch and X-Ray](#8-observability-cloudwatch-and-x-ray)
9. [Changes from the Courseware](#9-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Section 9](#9-changes-from-the-courseware) for what changed and how.
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

This module is an **architecture walkthrough**. It lays out the full picture of Pollynotes, the application you build throughout the course, and introduces what each AWS service in that picture is responsible for. It does not go into deep technical detail; each service is covered in depth in a later module.

### What This Module Lets You Do

- Describe the architecture of the application you build in this course
- List the AWS services needed to build the web application
- Understand how to store, manage, and host the web application

### Which Module Covers Each Service in Depth

This module just sets the whole picture; the detail moves to the modules below.

| Area | Service | Module that covers it in depth |
|---|---|---|
| Storage and hosting | Amazon S3 | Modules 5 and 6 |
| Database | Amazon DynamoDB | Modules 7 and 8 |
| Compute | AWS Lambda | Module 9 |
| API | Amazon API Gateway | Module 10 |
| User access | Amazon Cognito | Module 12 |
| Observability | Amazon CloudWatch and AWS X-Ray | Module 14 |

---

## 2. The Pollynotes Architecture

Pollynotes is a web application where authenticated users create, store, search, and delete text notes. Its signature feature is converting a selected note into speech and playing it back. The overall flow is as follows.

```text
                          ┌─────────────────────── AWS Cloud ──────────────────────────┐
                          │                                                            │
                          │   ┌──────────────┐                                         │
      ┌──────────┐  auth  │   │ Amazon        │                                         │
      │          │───────────▶│ Cognito       │ user pool + identity pool               │
      │  End      │        │   └──────────────┘                                         │
      │  user     │        │                                                            │
      │          │  web UI│   ┌──────────────┐   static website + MP3                   │
      │          │───────────▶│ Amazon S3     │◀──────────────┐                         │
      └────┬─────┘        │   └──────────────┘               │                         │
           │              │                                   │ store MP3               │
           │ API call     │   ┌──────────────┐   ┌────────────┴───┐                     │
           └──────────────────▶│ Amazon        │──▶│ AWS Lambda      │                    │
                          │   │ API Gateway   │   │ (List/Search/   │                    │
                          │   └──────────────┘   │  Delete/Create/ │                    │
                          │                       │  Update/Dictate)│                    │
                          │                       └───┬────────┬────┘                    │
                          │                           │        │                         │
                          │             note CRUD ┌───▼────┐  ┌▼──────────┐              │
                          │                        │DynamoDB│  │Amazon Polly│ text→speech │
                          │                        └────────┘  └───────────┘              │
                          │                                                            │
                          │   ┌───────────────────────────────┐                        │
                          │   │ Amazon CloudWatch · AWS X-Ray  │ monitoring · tracing    │
                          │   └───────────────────────────────┘                        │
                          │                                                            │
                          │   IAM · AWS STS control all access / AWS SAM deploys         │
                          └────────────────────────────────────────────────────────────┘
```

### 2.1 What Each Element Is Responsible For

| Diagram element | Service | Detail module |
|---|---|---|
| Website hosting | Amazon S3 | Module 6 |
| MP3 hosting | Amazon S3 | Module 6 |
| List / Search / Delete / Create-Update (business logic) | AWS Lambda | Module 9 |
| Storing user notes and interactions | Amazon DynamoDB | Modules 7 and 8 |
| Application API calls | Amazon API Gateway | Module 10 |
| User authentication | Amazon Cognito | Module 12 |
| Dictate → speech conversion | Amazon Polly | — |
| Detecting errors and degradation, tracing data | Amazon CloudWatch and AWS X-Ray | Module 14 |
| Secure access management | IAM | Module 4 |
| Deployment | AWS SAM | Module 13 |

This picture keeps coming back throughout the course. Each module is essentially the work of actually building one piece of it.

---

## 3. What the Application Does

### 3.1 What You Build

You build a fully working web application. A user authenticated through Amazon Cognito can add text notes and convert those notes to speech with Amazon Polly. Users sign in to a web portal to search, list, and delete their audio notes. To build this kind of text-to-speech (TTS) application, you need to understand how your code connects to the AWS environment.

### 3.2 How You Build It

- It is a **cloud-native** application, with everything running in the AWS Cloud.
- You build it around **serverless** services such as Amazon API Gateway, AWS Lambda, and Amazon DynamoDB.
- You develop with the **AWS SDKs and developer tools**, not only the AWS Management Console, and add more tools as you build the application.

### 3.3 The Serverless Core Service Combination 🆕

The AWS serverless developer guide presents four services as the core of a serverless solution. They overlap exactly with the combination Pollynotes uses.

| Service | Role the guide assigns |
|---|---|
| AWS Identity and Access Management | Access resources securely on AWS |
| AWS Lambda | Serverless compute capability |
| Amazon API Gateway | Handle requests by integrating `HTTP` and `HTTPS` requests with services |
| Amazon DynamoDB | Store and retrieve data |

The guide defines serverless development as "building applications **without managing long-running servers such as provisioned Amazon EC2 instances**." AWS serverless technologies are pay-as-you-go, scale up and down with application demand, and are built to scale across multiple AWS Regions for resilience. The first architecture in the Serverless Patterns Workshop that the guide cites is a client → REST API (API Gateway) → Lambda function → DynamoDB table flow, which is the same path as Pollynotes.

> — Source: [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html)

### 3.4 You Keep Following This Architecture

This module introduced the application architecture and its individual components. You keep following this picture as you develop throughout the course, and starting with the next module you begin the development journey with the **developer tools** needed to build this application.

---

## 4. Developer Tools

Developers use an IDE together with the AWS SDKs and toolkits to interact with AWS resources. Once the IDE is configured with the right IAM permissions, you can call AWS services from code without going through the AWS Management Console.

### 4.1 Managing Secure Access with IAM

IAM is a web service that helps you securely control access to AWS resources. It controls who is authenticated (signed in) and what they are authorized to do. During development you configure the IAM permissions granted to the IDE and the security profiles needed across the application development lifecycle.

IAM, AWS IAM Identity Center, and AWS STS are features of your AWS account offered at **no additional charge**. You are charged only when you access other services using an IAM user or STS temporary credentials.

> — Source: [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

### 4.2 Developing with Tools Instead of the Console 🔄

You can build the application without opening the AWS Management Console. The basis for that is that **the AWS CLI provides functionality equivalent to the console** from the terminal.

| Item | What the current documentation says |
|---|---|
| Direction of equivalence | All of the console's **IaaS (infrastructure as a service)** management, operational, and access functionality is available in the AWS API and AWS CLI |
| Scope | IaaS functionality. It does not state that the console is a superset of all functionality |
| When new features arrive | New AWS IaaS features and services provide full console functionality in the API and CLI **at launch, or within 180 days of launch** |
| Where the CLI sits | With minimal configuration, it runs functionality equivalent to the browser-based console from the terminal |

> — Source: [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)

### 4.3 The AWS SDKs and Toolkits 🆕

Here is how the SDKs and toolkits you develop with are provided in the current documentation.

| Category | How it is provided now |
|---|---|
| AWS SDKs | SDKs for C++, Go, Java, JavaScript, Kotlin, .NET, PHP, Python (Boto3), Ruby, Rust, and Swift. The AWS CLI and AWS Tools for Windows PowerShell share the same reference documentation |
| Toolkits | The **AWS Toolkit** per IDE: AWS Toolkit for JetBrains, AWS Toolkit for Visual Studio, AWS Toolkit for Visual Studio Code, AWS Toolkit for Azure DevOps |

What the many SDKs and tools share (global configuration through a shared `config`/`credentials` file or environment variables, authentication and access, a standardized settings reference, the AWS Common Runtime (CRT) libraries, and maintenance policy and versioning) is collected in the `AWS SDKs and Tools Reference Guide`. A specific SDK or tool's dedicated guide should be read **together with** this one.

> — Source: [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html)

### 4.4 The Deployment Tool: AWS SAM 🆕

AWS SAM is an open-source framework for building serverless applications with infrastructure as code (IaC). The documentation states when to use SAM instead of another IaC tool.

| Compared with | What the documentation advises |
|---|---|
| CloudFormation | Use SAM instead of CloudFormation to simplify defining serverless resources while keeping template compatibility |
| AWS CDK | Use SAM instead of the CDK when you want to describe infrastructure **declaratively** rather than programmatically |
| Alongside AWS CDK | You can also use the two together, complementing a CDK application with the SAM CLI's local testing |

Key features include **AWS SAM connectors** for defining permissions between resources, **`sam sync`** for continuously syncing local changes to the cloud, and support for local debugging and testing of Terraform serverless applications.

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

---

## 5. Storage and Hosting: Amazon S3

In Pollynotes, Amazon S3 does two things. One is **hosting the static website** that serves as the application's front end, and the other is **storing the MP3 files** that Amazon Polly generates. This storage also integrates well with the compute that drives the notes' CRUD operations (the Lambda in [Section 6](#6-data-management-and-processing-dynamodb-and-lambda)).

### 5.1 The Two Uses of Amazon S3

Amazon S3 is an object storage service offering scalability, data availability, security, and performance, and its use-case list includes both websites and mobile applications. So the two uses, "hosting + file storage," both hold. By default, an S3 bucket and the objects in it are private, and you can access only the resources you create.

> — Source: [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 5.2 The Recommended Path for Front-End Hosting 🔄

There are several ways to host a static website, and the current first recommendation is not to host directly from an S3 bucket.

| Method | Where it stands now |
|---|---|
| **AWS Amplify Hosting** | The **first recommendation** for hosting static website content. A fully managed service that deploys to a global CDN built on Amazon CloudFront: you select an object location in a general purpose bucket, deploy to the managed CDN, and it **generates a public HTTPS URL** |
| CloudFront + OAC | **Required when the bucket is encrypted with SSE-KMS** (SSE-KMS does not support anonymous users). Use **OAC (origin access control)**, not OAI, to protect the origin |
| S3 website endpoint | The simplest method, but with constraints such as no HTTPS support |

Module 6 covers these three paths and the constraints of the website endpoint in detail. Here it is enough to know that the recommended path has moved to Amplify Hosting.

> — Source: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

### 5.3 The Side That Creates the MP3: Amazon Polly 🔄

Amazon Polly turns text into lifelike speech. There are four voice engines.

| Voice engine | Note |
|---|---|
| Generative | Added recently |
| Long-form | Added recently |
| Neural | Supports the Newscaster speaking style for news narration |
| Standard | |

To use a voice you choose an engine and a speech synthesis API operation, provide the input text to synthesize, and select an audio output format. You are charged **only for the text you synthesize**, and there is no additional cost to cache and replay the generated speech. That matches this architecture of storing MP3s in S3 for playback.

> — Source: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

> — Source: [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)

---

## 6. Data Management and Processing: DynamoDB and Lambda

When a user adds, reads, updates, or deletes a note, **Amazon DynamoDB** stores that interaction, and several **AWS Lambda** functions actually drive those CRUD operations. Both are serverless services that require no servers to install or maintain.

### 6.1 Amazon DynamoDB

DynamoDB is a **serverless, fully managed, distributed NoSQL database that delivers single-digit-millisecond performance at any scale**. Its basis for being serverless is as follows.

| Characteristic | Detail |
|---|---|
| Servers and software | No servers to provision and no software to patch, manage, install, maintain, or operate |
| Maintenance | **Zero-downtime maintenance.** No versions (major, minor, or patch) and no maintenance windows |
| Scaling down | On demand, with no traffic it **scales to zero**, so there is no throughput cost and **no cold starts** |
| Fully managed | The service handles setup, configuration, maintenance, high availability, hardware provisioning, security, backups, and monitoring |
| NoSQL | Supports key-value and document data models. **No JOIN operator** (data model denormalization recommended). Provides strongly consistent reads and ACID transactions |

> — Source: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

### 6.2 The Default Capacity Mode 🔄

A DynamoDB table's throughput is set with a capacity mode. **On-demand is the default and recommended option.**

| Item | On-demand |
|---|---|
| Where it stands | The **default and recommended throughput option** |
| Billing | Pay per read and write request. With zero traffic there is no throughput charge |
| Scaling | Responds instantly up to traffic levels already reached, and auto-scales at new peaks |
| Quality | Same single-digit-millisecond latency, SLA, and security as provisioned mode |
| Mode switch | Provisioned → on-demand up to 4 times in a 24-hour rolling window; on-demand → provisioned any time |

You feel this directly in the labs. **Creating a table with default settings gives you on-demand mode.** Capacity units (RCU, WCU, RRU, WRU) and Auto Scaling are covered in modules 7 and 8.

> — Source: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

### 6.3 AWS Lambda

Several Lambda functions drive the application's CRUD operations. Lambda offers **two compute primitives** designed for different workload patterns.

| Item | Lambda Functions | Lambda MicroVMs |
|---|---|---|
| Use | Request-response or event-driven workloads (APIs, data processing, automation) | A persistent environment for running untrusted code created by users or AI |
| Programming model | A handler function invoked on a supported runtime | Arbitrary applications. Run your own binaries, listen on ports, use Linux OS capabilities |
| Execution time | Up to 15 minutes per invocation. With Lambda Durable Functions, multi-step workflows spanning up to a year | Up to 8 hours per session. Suspend and resume between sessions |
| Scaling | **Automatic.** Lambda creates and removes execution environments with traffic | Developer-controlled. Create, suspend, resume, and terminate via API |
| Billing | Per request + GB-seconds of execution time | Per second of compute while running + snapshot storage while suspended |

The two primitives share a common foundation: no server management, usage-based billing, managed networking, and Firecracker virtualization. **The labs in this course use the Lambda Functions path.** Triggers can connect over 200 AWS services such as API Gateway, Amazon S3, Amazon SQS, and EventBridge.

> — Source: [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

### 6.4 Compute Choice Is Decided by the Workload 🔄

The basis for this course using Lambda for the CRUD workload is the **request-driven, event-driven nature of the workload**, not that "Lambda is always cheaper and simpler." The compute service decision guide presents choosing compute as a balance of ten factors (workload type, performance, scalability, management overhead, cost optimization, latency and throughput, compliance and security, integration, reliability and availability, and development and deployment experience).

| Perspective | What the decision guide says |
|---|---|
| EC2 management burden | Includes responsibility for server **setup, scaling, patching, and security**, and can require a dedicated operations team |
| Assessing that burden | For use cases that **need fine-grained control** of the compute environment, that overhead is often justified |
| Lambda's benefit | Runs code in response to events without managing servers, which **reduces the operational burden** |
| Cost optimization path | **Instance selection** (over 750 types; AWS Graviton-based offers up to 40% better price performance than comparable options), **purchase plans** (Savings Plans up to 72%, Spot Instances up to 90% off), and **right-sizing** (EC2 Auto Scaling, Compute Optimizer up to 25% savings, AWS Trusted Advisor) |
| Nature of the choice | **You can use several types of compute together in a single workload** |

Managed container services provide a middle ground between control and convenience. Module 9 covers the compute service comparison in detail.

> — Source: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html)

---

## 7. Connection and Access: API Gateway and Amazon Cognito

**Amazon API Gateway** ties the preceding services together and routes requests between users and the back end. **Amazon Cognito** stands in front of it and authenticates users.

### 7.1 What Amazon API Gateway Does

API Gateway routes event-driven requests between users and the compute, database, and storage services, and it streamlines creating, publishing, maintaining, monitoring, and securing an API suited to a specific task. The request flow is as follows.

```text
  user makes a request ──▶ API Gateway routes to AWS resources ──▶ response sent back to the user
```

### 7.2 There Are Three Kinds of API 🔄

API Gateway creates, publishes, maintains, monitors, and secures **REST, HTTP, and WebSocket** APIs at any scale.

| API type | Nature |
|---|---|
| REST | Stateless. HTTP-based, implementing standard HTTP methods such as `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` |
| HTTP | Stateless. A RESTful API product **designed with minimal features to be offered at a lower price** |
| WebSocket | **Stateful.** Follows the WebSocket protocol to enable two-way communication and routes based on message content |

Neither is recommended across the board; you choose **by feature and price**.

| Feature you need | Choice |
|---|---|
| API keys, per-client throttling, request validation, AWS WAF integration, private API endpoints | **REST API** |
| None of the above | **HTTP API** (cheaper) |

A few more differences: for endpoint type, REST supports edge-optimized, regional, and private, while HTTP supports regional only. For authorization, REST supports Amazon Cognito directly, while HTTP uses Cognito through a JWT authorizer. Test invocations, caching, request validation, canary release deployments, and a developer portal are REST only, while automatic deployment is HTTP only. **This course using a REST API is an appropriate choice.** Module 10 covers API types and integration methods in detail.

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 7.3 API Gateway's Role and Logging 🆕

API Gateway acts as the **"front door"** through which an application accesses the data, business logic, and functionality of back-end services (workloads running on Amazon EC2, code running on AWS Lambda, web applications, and real-time communication applications). It handles accepting and processing hundreds of thousands of concurrent API calls, including traffic management, authorization and access control, monitoring, and API version management.

Logging is done through **CloudWatch access logging and execution logging** (including alarm setup) and **CloudTrail logging**. Other features include authentication using IAM policies, a Lambda authorizer function, and Amazon Cognito user pools; canary release deployments; creating APIs from CloudFormation templates; custom domain names; **AWS WAF integration**; and **AWS X-Ray integration** for identifying and triaging performance latency. Together with AWS Lambda, API Gateway forms the **app-facing part of the AWS serverless infrastructure**.

> — Source: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 7.4 The Two Components of Amazon Cognito

Amazon Cognito is an identity platform for web and mobile apps. It consists of a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens and AWS credentials. The two components can be used independently or together.

| Component | When you create it | What it does | Independence |
|---|---|---|---|
| User pool | When you **authenticate and authorize** users for an app or API | A user directory. Self-service and administrator-driven user creation, management, and authentication. Issues authenticated JWTs directly to apps, web servers, and APIs | **Does not require** integration with an identity pool |
| Identity pool | When you grant authenticated or anonymous users **access to AWS resources** | Issues AWS credentials. Manages permissions with role-based and attribute-based access control. Optionally issues credentials for guest users too | **Does not require** integration with a user pool |

Using the two together produces the Pollynotes authentication flow.

```text
  1) sign in to the user pool ──▶ receive an OAuth 2.0 token
  2) exchange that token at the identity pool for temporary AWS credentials
  3) use those credentials for authorized access to Amazon S3, Amazon DynamoDB, and more
```

The Pollynotes path of user → Cognito → API Gateway → Lambda → DynamoDB/S3 is this flow.

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.5 The Login Screen and Feature Plans 🔄

The fact that a user pool provides sign-up and sign-in screens is unchanged, and there are two places where the console screen looks different in the labs.

**The login screen.** There are two branding versions.

| Version | Description |
|---|---|
| **managed login** | The latest version. Customized with the branding designer |
| hosted UI (classic) | The **"thinner, less customizable predecessor"** of managed login |

Both support sign-up, sign-in, and password management, including completing multi-factor authentication (MFA) and registering a webAuthn authenticator. There are a few constraints to know.

| Item | Detail |
|---|---|
| Profile management | managed login **does not support user self-service profile management** such as changing attributes or MFA preferences. You must implement that in application code |
| Session cookie | Signing in sets a cookie in the browser, allowing you to sign in again with the same authentication method for **one hour**. Re-signing in with the cookie does not extend the cookie's lifetime |
| TLS | managed login **requires TLS 1.2 for both custom and prefix domains.** classic hosted UI does not require it for custom domains |
| CORS | Neither version **supports a custom CORS origin policy.** Implement the CORS policy in the application front end |
| Automatic branding-style assignment | Creating an app client in the console assigns it automatically. If you create it with `CreateUserPoolClient`, you cannot use managed login until you call `CreateManagedLoginBranding` |

> — Source: [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

**Feature plans.** You choose a feature plan per user pool.

| Plan | Includes |
|---|---|
| Lite | A low-cost plan for user pools with few monthly active users. Includes login functionality and the **classic hosted UI**. Does not include the latest features such as access token customization and passkey authentication |
| **Essentials** | **The default for new user pools.** All of the latest user pool authentication features. Advanced authentication features such as choice-based sign-in and email MFA |
| Plus | Everything in Essentials plus threat protection. Monitors for compromise indicators on sign-in, sign-up, and password-management requests (sign-ins from unexpected locations, detection of publicly leaked passwords) |

| Item | Detail |
|---|---|
| Unit of application | **One user pool.** Other user pools in the same account can have different plans, but you cannot set it per app client within a user pool |
| API/CLI | The `UserPoolTier` parameter of `CreateUserPool` and `UpdateUserPool`. If you do not specify a value, it is `Essentials`. The AWS CLI uses the `--user-pool-tier` argument |
| Switching | You can change the plan any time. Some switches require turning off active features first |

> — Source: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

---

## 8. Observability: CloudWatch and X-Ray

An application needs monitoring and troubleshooting to find and fix problems. **Amazon CloudWatch** provides actionable insights, and **AWS X-Ray** helps analyze and debug distributed applications.

### 8.1 Tracing Has Moved into CloudWatch 🔄

Tracing is now treated as part of CloudWatch observability.

| CloudWatch item | Where tracing appears |
|---|---|
| CloudWatch agent | Collects **metrics, logs, and traces** together from an Amazon EC2 fleet |
| Cross-account observability | Views **metrics, logs, and traces** from source accounts in a central monitoring account |
| OpenTelemetry support | Collects **metrics, logs, and traces** in the OpenTelemetry standard through a native OTLP endpoint. Supports PromQL queries |

Some features have also been added to the observability area.

| Item | Detail |
|---|---|
| Application Signals | Automatically detects and monitors key performance indicators such as latency, error rate, and request rate with no manual instrumentation or code changes. Provides curated dashboards |
| CloudWatch Synthetics | Proactively monitors endpoints and APIs with configurable scripts called canaries |
| CloudWatch RUM | Collects performance data from real user sessions |
| Service level objectives (SLOs) | Define, track, and alarm on reliability goals. Set error budgets and monitor SLO compliance |
| Lambda Insights | Memory and CPU utilization of Lambda functions and **cold-start detection and analysis** |

> — Source: [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)

### 8.2 The Current State of the X-Ray Console 🔄

The X-Ray service has not been discontinued. What changed is the **screen path**. The documentation states that **"AWS is no longer developing the X-Ray console."**

| Item | Current state |
|---|---|
| Available consoles | The Amazon CloudWatch console **or** the X-Ray console |
| Development status | The X-Ray console is **no longer developed.** The CloudWatch console includes new X-Ray features redesigned from the X-Ray console |
| Service map | The X-Ray Service map and the CloudWatch ServiceLens map are combined into the **X-Ray trace map** in the CloudWatch console. Under `X-Ray traces` → `Trace Map` in the left navigation pane |
| Insights | X-Ray Insights is also included under `Insights` in the CloudWatch console |
| Service-level observability | CloudWatch **Application Signals.** Drill from SLO-based health metrics down to correlated X-Ray traces to troubleshoot |
| Viewing together | View CloudWatch logs and metrics alongside X-Ray trace data on one screen in the CloudWatch console |

This is where the screen path for lab 7 (module 14) differs.

> — Source: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 9. Changes from the Courseware

Since learners may have the official courseware in front of them, this section gathers in one place where this material diverges from it. The evidence behind every item marked new or corrected in the sections above is here.

M02 is an overview module, so it has more **framing corrections and console/documentation relocations** than technical errors. There are **no end-of-support items in this module.**

### 9.1 Differences from the Courseware

| Item | What the courseware says | What is confirmed now | Source |
|---|---|---|---|
| API types | Presents only `REST API` | There are **REST, HTTP, and WebSocket**, and you choose by feature and price. Use REST if you need API keys, per-client throttling, request validation, AWS WAF integration, or private endpoints; otherwise use the cheaper HTTP. This course using REST is itself appropriate | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| Scope of console functionality | The console supports **all** the functionality you need | Equivalence is limited to **IaaS** management, operational, and access functionality, and the direction is reversed: "all of the console's IaaS functionality is available in the AWS API and AWS CLI, and new IaaS features arrive at launch or within **180 days**." The console is not a superset of all functionality | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |
| DynamoDB definition | `A fully managed NoSQL database service that delivers fast and predictable performance with seamless scalability` | The current definition is **"a serverless, fully managed, distributed NoSQL database that delivers single-digit-millisecond performance at any scale."** The performance wording is more specific, and `serverless` and `distributed` have entered the definition | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| DynamoDB capacity mode | Presents only `capacity sizing` with no mode distinction | **On-demand is the default and recommended throughput option.** Creating a table with default settings gives you on-demand, so the lab screen may differ from older captures | [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html) |
| Scope of AWS Lambda | Presents Lambda as the concept of a single function | There are two compute primitives, **Lambda Functions** and **Lambda MicroVMs**. The labs in this course use the Lambda Functions path | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| Contrasting EC2 and Lambda | EC2 needs maintenance, and moving to Lambda cuts cost | The maintenance point holds in direction, but compute choice is a **balance of ten factors**, and for use cases that need fine-grained control "that overhead is **often justified**." Cost, too, is approached through instance selection, purchase plans, and right-sizing rather than moving to Lambda, and **you can use several kinds of compute together in a single workload.** The basis for choosing Lambda is the request-driven, event-driven nature of the workload, not cost | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/choosing-aws-compute-service.html) |
| Front-end hosting method | Host a static website directly from an S3 bucket | The first recommendation is **AWS Amplify Hosting** (global CDN on CloudFront, generates a public HTTPS URL). **CloudFront + OAC is required when the bucket is encrypted with SSE-KMS** | [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| Cognito login screen | `Built-in sign-up and sign-in options` | There are two branding versions, **managed login** and **hosted UI (classic)**, where classic is managed login's "thinner, less customizable predecessor." managed login does not support self-service profile management, so that part is implemented in app code | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| Separation of observability and tracing | Assigns observability to CloudWatch and tracing to X-Ray, per service | CloudWatch treats tracing as part of observability (the agent collects metrics, logs, and traces together; cross-account observability views traces; the OTLP endpoint collects traces) | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| The AWS X-Ray console | Presents X-Ray as a standalone console | The X-Ray console is **discouraged** ("AWS is no longer developing the X-Ray console"). The X-Ray service itself is not discontinued, and the screen has moved to the **CloudWatch console** under `X-Ray traces` → `Trace Map` | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

### 9.2 What This Material Adds

Each item was added because it is needed to understand the overview. The detail is covered in the module noted in the table.

| Added item | Why it was added | Source |
|---|---|---|
| The serverless core service combination | Because the courseware only groups three services as "serverless," we added the guide's view that those plus IAM are the core of a serverless solution, showing the basis for the Pollynotes composition | [What is serverless development?](https://docs.aws.amazon.com/serverless/latest/devguide/welcome.html) |
| API Gateway HTTP and WebSocket APIs | Knowing only REST misses that there is a choice of API type, so we laid out the stateless HTTP (minimal features, lower price) and the stateful WebSocket alongside it | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| API Gateway's AWS WAF and X-Ray integration | These integrations are used directly in practice for front-line API defense and latency analysis, so we added them along with canary deployments and CloudFormation creation | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| Cognito feature plans (Lite, Essentials, Plus) | This is a choice you always meet when creating a user pool, and the default is Essentials, so we added it to help you understand the lab screen and pricing | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Cognito managed login and the branding designer | The login screen's name and customization method changed, making the lab console look different, so we added it along with choice-based sign-in, email MFA, and passkeys | [User pool managed login](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| CloudWatch Application Signals, Synthetics, RUM, SLO | Understanding observability as only metrics, logs, and traces misses the current APM tools, so we added the observability tools that need no manual instrumentation. Lambda Insights provides cold-start analysis | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| CloudWatch OpenTelemetry support | It matters for real-world observability design because you can send to CloudWatch and third parties with the same instrumentation, so we added it | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| The IaC tool comparison for AWS SAM | A deployment label alone does not tell you when to use SAM, so we added the choice criteria against CloudFormation and the CDK, plus connectors, `sam sync`, and Terraform support | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| Lambda MicroVMs and Durable Functions | Added to show that Lambda's scope is now broader than a single function. MicroVMs keep state for up to 8 hours, and Durable Functions run workflows up to a year | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| The AWS Toolkit per IDE | Added the per-IDE Toolkit and shared reference documentation so you can see what the `toolkits` label actually is | [What is covered in the AWS SDKs and Tools Reference Guide](https://docs.aws.amazon.com/sdkref/latest/guide/overview.html) |

### 9.3 Items We Could Not Verify

We leave these here honestly. Confirm them before stating anything definitive in class.

| Item | Status |
|---|---|
| The exact arrow directions in the architecture diagram | The element-to-service mapping in [Section 2](#2-the-pollynotes-architecture) is organized only to the extent each service's role makes explicit. Confirm exactly which arrow goes where against the actual lab architecture |
| Managed options that reduce the EC2 management burden | What we confirmed in the decision guide is the scope of EC2 management responsibility (setup, scaling, patching, security), the statement that the overhead can be justified, and the mention that Elastic Beanstalk provides managed updates. **We did not verify how much patch automation such as AWS Systems Manager Patch Manager eases the maintenance burden** |
| The detailed behavior of Lambda MicroVMs and Durable Functions | We confirmed the existence and top-level characteristics of both (up to 8-hour sessions, up to one-year workflows, billing units) from the Lambda overview documentation. **We did not consult each feature's dedicated guide.** It is beyond this overview module, so we left only their existence and location. M09 leaves the same item for the same reason |
| API Gateway integration types and what Pollynotes actually uses | What we confirmed is the three API types and their feature differences. **What integration type (Lambda proxy, non-proxy, etc.) and stage configuration this course's API actually uses is beyond this module.** That is the subject of module 10 and lab 5 |
| How the Cognito plan choice affects this course's labs | We confirmed that the default for new user pools is Essentials and the feature differences between plans. **Which plan lab 6 (the capstone) assumes needs to be checked in the lab guide** |
| Per-service quotas and pricing figures | This is an overview module, so it does not cover per-service quotas and pricing. See the relevant sections of modules 5 and 6 for storage, modules 7 and 8 for databases, and module 9 for compute |
