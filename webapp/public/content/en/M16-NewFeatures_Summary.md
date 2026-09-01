# Module 16: What Changed Since the Courseware

## Developing on AWS

---

## Contents

1. [What This Document Is](#1-what-this-document-is)
2. [At a Glance](#2-at-a-glance)
3. [What Reached End of Support](#3-what-reached-end-of-support)
4. [What Is No Longer Recommended](#4-what-is-no-longer-recommended)
5. [What Was Renamed](#5-what-was-renamed)
6. [What Defaults Changed](#6-what-defaults-changed)
7. [What Numbers and Limits Changed](#7-what-numbers-and-limits-changed)
8. [What Arrived Since the Courseware](#8-what-arrived-since-the-courseware)
9. [What Documentation Paths Moved](#9-what-documentation-paths-moved)
10. [If You Are Writing Code Now](#10-if-you-are-writing-code-now)
11. [Index by Module](#11-index-by-module)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against AWS official documentation.
> - 🔄 Content where the original instructor deck differs from current fact and has been corrected.
> - Verified on: August 25, 2026.
> - **There is no original instructor deck for this module.** The courseware ends at module 15. This document consolidates the **344 `Changes from the Courseware` items** gathered while writing modules 1 through 15. No new facts were added, and the sourcing recorded in each module was carried forward.
> - Three pages were **re-read and updated** while writing this document: the AWS SDK version lifecycle table, the Lambda runtimes table, and the AWS CLI v1 maintenance announcement. Their values change over time.
> - A marker like `[M07]` at the end of an item names the module that covers it in detail. The sourcing and the courseware location are in that module's `Changes from the Courseware` chapter.

---

## 1. What This Document Is

### Why It Exists

The courseware is based on 2023. Anyone taking this course now has to do two things at once: learn
what the courseware teaches, and work out which parts of it no longer hold. The second task is
scattered across the per-module documents, which makes it hard to survey.

This document gathers those scattered items so you can **scan the whole set on one screen**. It is
for answering "so what actually changed" once, at the end of the course.

### How It Was Built

| Step | Content |
|---|---|
| Input | `pipeline/facts/deprecations/M01.yaml` through `M15.yaml` (15 files, 344 items) |
| Classification | Regrouped by each item's state (`incorrect` / `changed` / `discouraged` / `ended`) and by topic |
| Sourcing | Carried forward the AWS official documentation pages actually fetched during each module's work |
| Re-check | Confirmed that the 38 source URLs returned HTTP 200 on August 25, 2026. The three pages whose values change over time were re-read and updated |

**No newly discovered facts were added.** Everything here was already verified and recorded in one
of the modules. Three pages did change when re-read, and those parts are updated to this document's
values and marked ([Section 3.1](#31-aws-sdk-major-versions),
[Section 3.2](#32-lambda-runtimes), [Section 4.1](#41-aws-cli-v1)).

### What It Is Not

| What this is not | Where to look instead |
|---|---|
| A summary of the courseware content | Each module document |
| A detailed explanation of each item | The `Changes from the Courseware` chapter of each module |
| A general survey of new AWS services | This document covers only what changed **within the scope of this course** |
| Exam scope guidance | The certification chapters of [module 15](#11-index-by-module) |

---

## 2. At a Glance

### 2.1 Counts by Module

| Module | Total | Courseware errors | Changed | Discouraged | End of support |
|---|---|---|---|---|---|
| M01 Course Overview | 13 | 8 | 4 | 1 | 0 |
| M02 Building a Web Application | 18 | 9 | 8 | 1 | 0 |
| M03 Development Environment | 16 | 4 | 2 | 5 | 5 |
| M04 Permissions | 23 | 7 | 10 | 3 | 3 |
| M05 Getting Started with Storage | 8 | 2 | 3 | 2 | 1 |
| M06 Storage Application | 26 | 10 | 11 | 4 | 1 |
| M07 Getting Started with Databases | 15 | 6 | 7 | 1 | 1 |
| M08 Database Application | 25 | 10 | 12 | 2 | 1 |
| M09 Compute | 27 | 4 | 15 | 3 | 5 |
| M10 API Gateway | 25 | 12 | 8 | 5 | 0 |
| M11 Microservices | 15 | 8 | 5 | 1 | 1 |
| M12 Granting Access | 32 | 20 | 6 | 5 | 1 |
| M13 Deploying | 40 | 26 | 10 | 2 | 2 |
| M14 Observing | 37 | 21 | 12 | 3 | 1 |
| M15 Course Wrap-up | 24 | 7 | 12 | 1 | 4 |
| **Total** | **344** | **154** | **125** | **39** | **26** |

### 2.2 Where to Look First

A high count does not mean high importance. Sorted by **what actually blocks you in a lab or in
production**, the order is this.

| Priority | Item | Why it is urgent | Section |
|---|---|---|---|
| 1 | Lambda runtime end of support | Function creation is blocked for the runtimes the courseware uses | [3.2](#32-lambda-runtimes) |
| 2 | AWS SDK major versions | The courseware's Java, .NET, and JavaScript examples use end-of-support syntax | [3.1](#31-aws-sdk-major-versions) |
| 3 | X-Ray SDK and console | Both the instrumentation path and the console path moved | [3.3](#33-the-aws-x-ray-sdk-and-daemon) and [5.1](#51-screens-and-console-paths) |
| 4 | IAM long-term access keys | The courseware's default procedure runs opposite to current best practice | [4.2](#42-credentials) |
| 5 | S3 ACLs disabled by default | The courseware's example fails with a 400 error | [6.1](#61-s3) |
| 6 | DynamoDB on-demand is the default | The lab screen differs from the courseware screenshot | [6.2](#62-dynamodb) |
| 7 | AWS Cloud9 | Not available to new customers. The premise of the Lab 1 procedure collapses | [3.4](#34-development-tools) |
| 8 | AWS CLI v1 | In maintenance mode since July 15, 2026 | [4.1](#41-aws-cli-v1) |

### 2.3 What Are the 154 Courseware Errors

The largest category, and most of it is **not something AWS changed but a problem in the courseware
itself.**

| Nature | Content |
|---|---|
| Internal contradictions | The same fact stated differently on different slides. Module titles, the three-pillars list, objective wording, step counts, language lists |
| Typographical errors | `Amazon APIGateway` (missing space), `code-start` (typo for cold start), `combination` for fault, double spaces |
| Code errors | Examples that do not compile, references to undefined variables, a variable declared under one name and used under another, mixed SDK generations |
| Commands that will not run | Missing required parameters, wrong dimensions, a CLI command split across two lines |
| Broken links | Documentation URLs that return HTTP 404 |

**The last three categories are what actually get in the way of learning AWS.** Follow the code and
commands verbatim and they fail. Each module document carries a corrected version with a table
stating what was corrected.

---

## 3. What Reached End of Support

### 3.1 AWS SDK Major Versions

**This is one of the tables re-read while writing this document.** The values differ from what they
were during M03's work.

Entries currently in the `End-of-Support` phase in the AWS SDKs and Tools version lifecycle table.

| SDK | Major versions at end of support | Replacement |
|---|---|---|
| SDK for Java | **1.x** | 2.x (`software.amazon.awssdk`) |
| SDK for JavaScript | **1.x, 2.x** | v3 |
| SDK for .NET | **1.x, 2.x, 3.x** 🔄 | 4.x |
| SDK for Go | **1.x** | V2 |
| SDK for PHP | 2.x | Latest major version |
| SDK for Python (Boto2) | 1.x | Boto3 |
| SDK for Ruby | 1.x, 2.x | Latest major version |
| Tools for PowerShell | 2.x, 3.x, **4.x** 🔄 | Latest major version |

> **🔄 What was updated.** At the time of M03's work, `.NET 3.x` was at end of support and `4.x` was
> generally available, and `Tools for PowerShell 4.x` was not marked end of support in the table.
> Re-reading the table for this document, both entries now show `End-of-Support`. **This table
> changes over time, so check the original before adopting anything.**

Why this matters for the courseware.

| Courseware location | Problem | Module |
|---|---|---|
| Many Java examples | The `com.amazonaws` package, `AmazonDynamoDB`, `DynamoDBMapper`, the Document API (`dynamoDB.getTable`), and waiters (`client.waiters()`) are all 1.x syntax | [M03] [M05] [M06] [M07] [M08] |
| Many .NET examples | Synchronous method calls (`client.PutBucket`, `client.CreateTable`). Targeting .NET Core or .NET Standard supports async only | [M06] [M08] |
| JavaScript API reference link | `AWSJavaScriptSDK/latest` is the v2 path | [M03] |
| Two SDK install links | HTTP 404 | [M03] |

**Mixed generations within the same courseware is the bigger problem.** In M06, slides 8, 12, 27,
and 35 use 2.x syntax while slides 11, 21, and 33 use 1.x. M08 has 2.x on slides 13–14, 18, and
41–42 and 1.x on 19–20. The courseware does not tell you which to follow.

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

> — Source: [AWS SDK for Java 1.x](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html)

> — Source: [Migrating to the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html)

> — Source: [AWS SDK for Go V1](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html)

> — Source: [Programming with DynamoDB and the AWS SDK for Java](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 3.2 Lambda Runtimes

**This table was re-read as well.** The runtimes the courseware uses and their status.

| Runtime the courseware uses | Courseware location | Deprecation date | Block create | Block update | Module |
|---|---|---|---|---|---|
| `nodejs12.x` | M03 slide 21 `create-function` example | 2023-03-31 | 2023-03-31 | 2023-04-30 | [M03] |
| `python3.8` | M09 slide 34, M13 slides 14, 15, 22 | 2024-10-14 | 2027-02-01 | 2027-03-03 | [M09] [M13] |
| `python3.9` | M13 slide 21 `sam build` output | 2025-12-15 | 2027-02-01 | 2027-03-03 | [M13] |
| `.NET Core` family | M09 slides 10 and 48 | dotnetcore3.1 on 2023-04-03, earlier versions before that | — | — | [M09] |
| `go1.x` | M09 slide 10 | 2024-01-08 | 2024-02-08 | — | [M09] |

**`nodejs12.x` already has function creation blocked.** Run the `create-function` example from M03
slide 21 as printed and it fails.

**`python3.8` and `python3.9` are deprecated but function creation is not yet blocked** (scheduled
for February 1, 2027). So M13's SAM templates and `sam init --runtime python3.8` work today but put
you on a deprecated runtime.

The current managed runtimes.

| Language | Identifier | Scheduled deprecation |
|---|---|---|
| Node.js 26 | `nodejs26.x` | Not scheduled |
| Node.js 24 | `nodejs24.x` | 2028-04-30 |
| Node.js 22 | `nodejs22.x` | 2027-04-30 |
| Python 3.15 | `python3.15` | Not scheduled |
| Python 3.14 | `python3.14` | 2029-06-30 |
| Python 3.13 | `python3.13` | 2029-06-30 |
| Python 3.12 | `python3.12` | 2028-10-31 |
| Python 3.11 | `python3.11` | 2027-06-30 |
| Python 3.10 | `python3.10` | 2026-10-31 |

> **🆕 More runtimes reached end of support since M09's work.** `nodejs20.x` was deprecated on
> April 30, 2026 and `nodejs18.x` on September 1, 2025. `python3.10` is scheduled for October 31,
> 2026. **The dates in the table are for planning purposes and are subject to change, so check the
> original before adopting one.**

Go and Rust run on the **OS-only runtime `provided.al2023`** rather than a managed runtime. Lambda
still supports Go; only the execution path changed.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.3 The AWS X-Ray SDK and Daemon

The tooling for this course's final lab (Lab 7).

| Phase | Period | Support provided |
|---|---|---|
| General availability | through February 25, 2026 | Fully supported, with regular releases including bug and security fixes |
| Maintenance mode | February 25, 2026 onward | **Security-fix releases only.** No new feature enhancements |

No end-of-support date has been announced, so **the SDKs have not stopped working.** The
instrumentation code on courseware slides 26, 33, and 34 still runs. It just receives no new
capability, and AWS guides you to move to OpenTelemetry
([Section 4.4](#44-instrumentation-and-tracing)). [M14]

> — Source: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

### 3.4 Development Tools

| Item | Status | Replacement | Module |
|---|---|---|---|
| **AWS Cloud9** | No longer available to new customers. Existing customers can continue using it | AWS IDE toolkits (VS Code, JetBrains, Visual Studio) or AWS CloudShell | [M03] [M04] |
| **AWS Toolkit for Eclipse** | No separate user guide is provided any more. The whole `toolkit-for-eclipse/v1/user-guide/` path redirects to the JetBrains toolkit documentation | AWS Toolkit for JetBrains, Visual Studio, or VS Code | [M04] [M09] |
| **AWS Step Functions Local** and the data flow simulator | The official documentation states that they do not provide feature parity and are **unsupported**. They do not support optimized service integrations, cross-account access, or distributed map | The `TestState` API or Test State in the console. Workflow Studio in the AWS Toolkit for VS Code | [M11] |

**AWS Cloud9 has a large effect on the labs.** The courseware introduces Lab 1 as "configure and
test IAM permissions in a development environment using AWS Cloud9", and the instructor notes state
that the Python lab is still deployed on Cloud9. **An environment already deployed in a training
account may work, but a student cannot create a new Cloud9 environment in their own account.**

> — Source: [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)

> — Source: [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

> — Source: [Tools to develop, deploy, and manage Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

> — Source: [Testing and debugging in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/test-and-debug.html)

### 3.5 Services and Features

| Item | Status | Replacement | Module |
|---|---|---|---|
| **Amazon Cognito Sync** | No longer available to new customers. Existing customer workloads continue without interruption but receive no new feature development | AWS AppSync (GraphQL-based real-time sync) or Amazon DynamoDB | [M12] |
| **AWS Certified Machine Learning – Specialty** | No longer delivered. Last day March 31, 2026 | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional | [M15] |
| **AWS Certified Data Analytics – Specialty** | No longer delivered. Last day April 8, 2024 | AWS Certified Data Engineer – Associate | [M15] |
| **AWS Certified Database – Specialty** | No longer delivered. Last day April 29, 2024 | — | [M15] |
| **AWS Certified: SAP on AWS – Specialty** | No longer delivered. Last day April 29, 2024 | — | [M15] |

Cognito Sync does not appear in courseware M12. It is recorded here because the related features
remain in the identity pool console and older material introduces it alongside identity pools.
**It cannot be used for new projects.**

> — Source: [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html)

> — Source: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

---

## 4. What Is No Longer Recommended

Different from end of support. **These still work, but AWS recommends a different path.** In many
cases the courseware is not wrong; the recommended order changed.

### 4.1 AWS CLI v1

**This item was also re-read and its status changed.**

| Phase | Period | Support level |
|---|---|---|
| General availability | 2015-11-19 to 2026-07-14 | Fully supported |
| **Maintenance mode** | **2026-07-15 to 2027-07-14** | Critical bug fixes and security issues only. No API updates for new or existing services, and no new Region support |
| End of support | 2027-07-15 onward | No updates or releases. Previously published releases remain available via package managers and the code stays on GitHub |

> **🔄 What was updated.** At the time of M03's work, entry into maintenance mode was **scheduled**.
> As of the verification date of August 25, 2026, **it has already entered maintenance mode.**

The courseware describes the AWS CLI on slides 19 and 20 as a single product with no version
distinction. So a student cannot tell which version to install. [M03]

Features in v2 that were not backported to v1.

| Feature |
|---|
| High-level DynamoDB commands |
| EC2 Instance Connect with an SSH client |
| The interactive mode for CloudWatch Logs Live Tail |

The other characteristics of v2 are an embedded Python (independent of your system Python),
server-side command completion, auto-prompt and wizards, simplified developer access through
`aws login`, IAM Identity Center authentication, and new `aws configure` subcommands for managing
profiles and credentials.

> — Source: [AWS CLI v1 maintenance mode announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/)

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

### 4.2 Credentials

**The courseware's default procedure runs in the opposite direction from current best practice.**
This is the most important item here.

| Courseware | Current recommendation | Module |
|---|---|---|
| Presents creating an IAM user and storing access keys in `~/.aws/credentials` with `aws configure` as the **default procedure** for setting up a development environment | Human users use **temporary credentials through federation** with an identity provider. For centralized access management, **AWS IAM Identity Center** is recommended. Workloads use the temporary credentials of an **IAM role** | [M03] [M04] |

The AWS CLI credential recommendation order. **IAM user long-term credentials are classified as
"not recommended."**

| Rank | Method |
|---|---|
| 1 | Console-credential-based short-term credentials (`aws login`) |
| 2 | IAM Identity Center |
| 3 | IAM short-term credentials |
| 4 | EC2 instance metadata |
| 5 | Assume role |

Long-term access keys are **limited to exception use cases such as workloads that cannot use IAM
roles**. The JetBrains toolkit documentation also states plainly not to authenticate as an IAM user
when developing purposeful software or handling real data.

**Root user access keys are strongly discouraged.** The root user has complete access to every
service and resource in the account, including billing information. The courseware puts the root
user in its principal list and role example diagram but never covers protecting it. Every account
type (standalone, management, member) must configure MFA on the root user, and without MFA it must
be registered **within 35 days** of the first console sign-in attempt. [M04]

> — Source: [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)

> — Source: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

> — Source: [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### 4.3 How the SDKs Are Used

| Item | Why it is discouraged | Replacement | Module |
|---|---|---|---|
| **The boto3 resources interface** | The AWS Python SDK team has **no plans to add new features** to the resources interface. The existing interface keeps working through boto3's lifecycle, but new service features arrive on the client interface. Resource instances are **not thread safe** and must be created per thread or process | `boto3.client(...)` | [M03] [M05] [M06] [M07] [M08] [M09] |
| **SDK retry `legacy` mode** | This is each SDK's behavior from before `standard` mode. **It has no standard retry quota, so it keeps retrying at full speed even during a service outage.** Retry counts, backoff timing, which errors are retried, and throttling behavior all vary by language | `standard` mode (`retry_mode=standard` / `AWS_RETRY_MODE=standard`) | [M04] |

**The boto3 resources interface is the most widespread discouraged item in this course.** Python
examples in six modules use it. In M03 the courseware even recommends using the higher-level API
for its simplicity.

M07 has a particularly confusing point. The reason the Python **higher-level** cell on courseware
slide 33 is empty is exactly this: boto3's higher-level DynamoDB interface *is* the resources
interface (`boto3.resource('dynamodb')` and `dynamodb.Table`). Slide 36 of the same courseware
creates a `boto3.client('dynamodb')` while the comment right above it says "get the service
resource", conflating the two interfaces.

`legacy` retry mode exists only in Java, Python, Ruby, PHP, C++, and the CLI, and not in .NET, Go,
Kotlin, Rust, Swift, or JavaScript.

> — Source: [Boto3 resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

> — Source: [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 4.4 Instrumentation and Tracing

| Item | Why it is discouraged | Replacement | Module |
|---|---|---|---|
| **The X-Ray SDK** | X-Ray is transitioning its primary instrumentation standard to OpenTelemetry and AWS recommends adopting it | AWS Distro for OpenTelemetry (ADOT), CloudWatch Application Signals, CloudWatch OTel endpoint | [M14] |
| **The X-Ray daemon** | It follows the same maintenance timeline as the SDKs and the documentation guides migration | The CloudWatch agent or the OpenTelemetry Collector | [M14] |
| **Local JSON sampling rules in code** | Each instance samples independently so the overall rate rises, and changing a rule requires a redeploy | Sampling rules defined in the X-Ray service | [M14] |
| **The X-Ray console** | AWS is no longer developing it. The console path moved into CloudWatch | Trace Map under X-Ray traces in the CloudWatch console | [M01] [M02] [M14] |

> — Source: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — Source: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 4.5 Storage and Databases

| Item | Why it is discouraged | Replacement | Module |
|---|---|---|---|
| **Path-style S3 requests** (`addressing_style = path`) | They still work in all Regions but are **scheduled to be discontinued**. For website content accessed from a browser they can conflict with the same-origin security model | Virtual-hosted-style URLs (the SDK default). For web content, an S3 website endpoint or CloudFront | [M05] |
| **S3 Object Lambda** | Since November 7, 2025 it is available only to **existing customers already using it and a select set of partners**. AWS stated it will continue security and availability improvements but **has no plans to introduce new features** | The Dynamic Image Transformation for Amazon CloudFront solution, invoking Lambda directly through CloudFront, API Gateway, or Lambda function URLs, or processing in the client | [M06] |
| **`get_paginator('list_objects')`** | This is the paginator for the v1 operation. The S3 API documentation recommends `ListObjectsV2` for application development | `client.get_paginator('list_objects_v2')` | [M06] |
| **Reduced Redundancy Storage (RRS)** | AWS does not recommend RRS and states that **S3 Standard is more cost effective**. RRS objects are designed for an average annual expected loss of 0.01%, and requesting a lost object returns a 405 error | Stay on S3 Standard, or move to Standard-IA or the Glacier classes | [M06] |
| **DynamoDB legacy conditional parameters** | AWS recommends the expression parameters, and mixing legacy and expression parameters in one call produces an error | `AttributesToGet`→`ProjectionExpression`, `Expected`→`ConditionExpression`, `KeyConditions`→`KeyConditionExpression`, `QueryFilter` and `ScanFilter`→`FilterExpression`, `AttributeUpdates`→`UpdateExpression` | [M08] |

**The courseware introduces S3 Object Lambda as a general feature anyone can start using.** Keep it
for conceptual explanation, but **do not present it as the recommended path for a new design.**

DynamoDB legacy conditional parameters **do not appear in the courseware.** Its examples are all
expression-based, which matches current guidance. They are recorded here because you meet them when
maintaining older code.

> — Source: [Virtual hosting of buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

> — Source: [S3 Object Lambda availability change](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html)

> — Source: [ListObjects](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html)

> — Source: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

> — Source: [Legacy conditional parameters](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/LegacyConditionalParameters.html)

### 4.6 API Gateway

What the courseware explains across five slides sits last in the current recommended order.

| Item | Courseware | Current recommendation | Module |
|---|---|---|---|
| **Data transformation** | Explains request and response handling around mapping templates across five slides | ① Proxy integration → ② parameter mapping (no VTL) → ③ mapping template transformation. The documentation recommends using proxy integration for REST APIs whenever possible | [M10] |
| **API keys** | Presented as a developer feature, with "set `API Key Required` to true so that an API key is required to call the method" | Best practice states **not to use API keys for authentication and authorization that controls API access.** Access control belongs to IAM roles, Lambda authorizers, and Cognito user pools. API keys are for client identification and usage plan association | [M10] |
| **Usage plan quotas** | "Customers can access these APIs based on an agreed request rate and quota" | Throttles and quotas are applied **best-effort, not as hard limits**, so clients can exceed them. Do not rely on them for cost control or blocking access. Use AWS Budgets for cost and AWS WAF for requests | [M10] |
| **Stage variables** | Lists "pass configuration to a Lambda function" as a use case | Stage variables are **not intended for sensitive data such as credentials.** If an integration needs sensitive data, use the output of a Lambda authorizer | [M10] |
| **Data tracing** | On the canary stage, "enable logging with CloudWatch" with no level distinction | Data tracing is **not recommended for production APIs because sensitive data may be logged.** Use `ERROR` or `INFO` for execution logging | [M10] |
| **Lambda authorizer `TOKEN` type** | Presents token-based and request-parameter-based with no preference | The documentation **recommends the `REQUEST` authorizer** because it can use multiple identity sources and separate cache keys | [M12] |

**The reason not to use API keys for access control is concrete.** If a usage plan contains several
APIs, a user with a valid API key for one of them **can access every API in that plan.**

> — Source: [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)

> — Source: [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)

> — Source: [Stage variables](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)

> — Source: [Set up CloudWatch logging](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

> — Source: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

### 4.7 Authentication and Authorization

| Item | Why it is discouraged | Replacement | Module |
|---|---|---|---|
| **The implicit grant** | The official documentation names it a **legacy authorization grant**. Users can intercept and inspect the token, it issues no refresh token, and it is not compatible with PKCE | The authorization code grant with PKCE. For public clients, enable only the authorization code grant | [M12] |
| **The identity pool basic (classic) flow** | The documentation states that **the enhanced flow is the most secure choice with the least developer effort**, and presents not enabling basic authentication by default on new identity pools as a best practice | The enhanced flow (`GetId` → `GetCredentialsForIdentity`) | [M12] |
| **`UnusedAccountValidityDays`** | A legacy parameter. Once you set `TemporaryPasswordValidityDays` on a user pool, you can no longer set a value for it | `TemporaryPasswordValidityDays` (default 7 days, range 0–365) | [M12] |
| **Developer attributes (`dev:` prefix)** | A **legacy feature that Amazon Cognito replaced** with app client read and write permissions | Per-app-client attribute read and write permissions (`ReadAttributes` / `WriteAttributes`) | [M12] |
| **The Map state `Iterator` and `Parameters` fields** | Both fields are **deprecated**. The documentation says existing definitions keep working but strongly recommends switching to the new fields | `Iterator` → `ItemProcessor`, `Parameters` inside Map → `ItemSelector` | [M11] |

The courseware presents the three OAuth grants with no preference. **The security best practice for
a public client app is to enable only the authorization code grant and implement PKCE.**

> — Source: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

> — Source: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

> — Source: [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html)

> — Source: [User pool attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

> — Source: [Map state (inline)](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-inline.html)

### 4.8 Deployment and Compute

| Item | Courseware | Current | Module |
|---|---|---|---|
| **`sam package` as a separate step** | Build artifacts with `sam package` before deploying and pass the S3 bucket name directly | `sam deploy` **implicitly performs what `sam package` does.** To have the bucket created automatically use `--resolve-s3`; specifying it together with `--s3-bucket` produces an error | [M13] |
| **A broad managed policy on a function** | Attaches `AmazonDynamoDBReadOnlyAccess` to the list function, granting read access to **every** DynamoDB table in the account | A SAM policy template (`DynamoDBReadPolicy` with `TableName`) or `AWS::Serverless::Connector` to scope it to the target resource | [M13] |
| **DLQ as the async best practice** | "The best practice for asynchronous invocation is to create and use a DLQ" | The documentation presents a DLQ as an **alternative to an on-failure destination.** On-failure destinations support more targets, include function response details in the invocation record, and can be configured per function, version, or alias | [M09] |
| **Relying on the runtime's bundled SDK** | "The Python and Node.js runtimes include the SDK, so you do not need to bundle them" | The documentation recommends **always including the SDK modules your code uses, and their dependencies, in the deployment package or a Lambda layer** to fully control dependencies and maximize backward compatibility during automatic runtime updates | [M09] |
| **The `www.aws.training` portal** | Sign in and find courses through `SessionSearch` and `Details` paths | The current learning entry point is **AWS Skill Builder** | [M15] |

**There is a hidden trap in the bundled-SDK item.** Recursive loop detection requires a minimum SDK
version, so if the runtime's bundled version is lower, detection does not work. The documentation
says to use the runtime's bundled SDK only when you cannot include extra packages in the deployment
(the Lambda console code editor, CloudFormation inline code).

> — Source: [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html)

> — Source: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

> — Source: [Retaining records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

> — Source: [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/)

### 4.9 AI Coding Tools

| Item | Status | Replacement | Module |
|---|---|---|---|
| **Amazon Q Developer IDE plugins** | AWS will end support on **April 30, 2027** and directs you to look at Kiro for similar capabilities (agentic coding, chat, MCP support) | Kiro (IDE, CLI, autonomous web agent) | [M03] |

The instructor notes on courseware M03 slide 34 mention "traces of a previous AI assistant in API
and extension naming". A student may ask what that was, so the status is recorded here.

> — Source: [Amazon Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html)

---

## 5. What Was Renamed

The capability is the same but the name changed. **Search the documentation for the old name and you
either find nothing or land on an old page.**

### 5.1 Screens and Console Paths

| Courseware term | Current | Module |
|---|---|---|
| X-Ray **Service map** | The **X-Ray Trace Map** in the CloudWatch console. The X-Ray service map and the CloudWatch ServiceLens map were combined | [M01] [M02] [M14] |
| X-Ray **Insights** (a separate screen) | Included under **Insights** in the CloudWatch console | [M14] |
| API Gateway: choose TEST in the **Client** box of the **Method Execution** pane | Choose the method in the Resources pane → the **Test** tab → Test | [M10] |
| API Gateway **Stage Editor** pane | **Stages** → the stage → Edit under **Stage details** or **Logs and tracing** | [M10] |
| Cognito **hosted UI** | **managed login** (the recommended branding version) and **hosted UI (classic)**. The documentation calls classic a thinner, less customizable predecessor of managed login | [M02] |
| The **AWS Builder Labs** landing page | An entry within AWS Skill Builder's **immersive learning** page | [M01] [M15] |

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

### 5.2 Service and Feature Names

| Courseware term | Current | Module |
|---|---|---|
| **Amazon CloudWatch Events** | **Amazon EventBridge.** The API is the same and existing rules still appear, but **new features are not added to CloudWatch Events** | [M11] [M14] |
| **Swagger** / `swagger: "2.0"` | **OpenAPI.** The documentation is titled "Develop REST APIs using OpenAPI in API Gateway" and supports v2.0 (equivalent to Swagger 2.0) and v3.0. The URL path still contains `swagger-extensions` | [M10] |
| **Custom authorizer** | **Lambda authorizer.** The documentation writes "Lambda authorizer (formerly known as a custom authorizer)". The method authorization type value is still `CUSTOM` | [M10] [M12] |
| **Web identity federation** (listing Amazon, Facebook, Google) | **OIDC federation.** Described for OIDC-compatible IdPs generally, with GitHub Actions as the leading example | [M04] |
| **Burst concurrency** | **Concurrency scaling rate** and **concurrency scaling limit**. The figure (1,000 execution environments per 10 seconds) is unchanged | [M09] |
| `Iterator` (Map state) | `ItemProcessor` | [M11] |
| `Parameters` (inside Map state) | `ItemSelector` | [M11] |
| `UnusedAccountValidityDays` | `TemporaryPasswordValidityDays` | [M12] |
| **.NET Core** (Lambda runtime) | **.NET** (`dotnet8`, `dotnet9` container-only, `dotnet10`) | [M09] |
| `CreateTableResult` (Java) | `CreateTableResponse` | [M08] |

### 5.3 Wording That Became More Specific

Cases where the wording changed to state the same fact more precisely.

| Courseware | Current | Module |
|---|---|---|
| DynamoDB "**fast and predictable** performance" and "under 10 milliseconds" | "**Single-digit millisecond** performance at any scale". The definition sentence gained "serverless" and "distributed" | [M02] [M07] |
| S3 "read-after-**create** consistency" | **Strong read-after-write consistency** for object PUT and DELETE in all Regions. Bucket configurations still follow an eventual consistency model | [M05] |
| SigV4 "the exact request expiration period varies by service" | **In most cases the request must reach AWS within 5 minutes** of the timestamp. Multi-Region requests use **SigV4a** (asymmetric signing) | [M03] [M04] |
| SnapStart "improves startup performance by up to **10x**" | "**As low as sub-second** startup performance". The multiplier wording is gone from the documentation | [M09] |
| ElastiCache "**Redis or Memcached**" | **Valkey, Memcached, and Redis OSS**, three engines, with serverless and node-based deployment options | [M07] [M08] |
| JVM DNS TTL "**60 seconds** or less" | **5 seconds.** Also, `networkaddress.cache.ttl` is a **security property**, not a system property, so it cannot be set with a `-D` flag | [M04] |

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

---

## 6. What Defaults Changed

**This is the category that trips people up most quietly.** If you followed the courseware and the
screen looks different or a command fails, the cause is usually here.

### 6.1 S3

| Item | Courseware | Current default | Result | Module |
|---|---|---|---|---|
| **Object Ownership** | Labels ACLs only as "legacy" | **Bucket owner enforced.** **All ACLs are disabled** on new buckets | ACL set and update requests **fail**. Access is evaluated by policies only | [M05] |
| **Creating a bucket with a public ACL** | An example that creates a bucket with `CannedACL = S3CannedACL.PublicRead` | ACLs disabled by default | A PUT specifying a public ACL fails with **400 `AccessControlListNotSupported`**. With account-level `BlockPublicAcls` on, the `PUT Bucket` request itself fails | [M06] |
| **Public access** | Presents only a public-read bucket plus a website endpoint | New buckets, access points, and objects **do not allow public access.** AWS recommends turning on all four block-public-access settings on the account and the bucket | The courseware procedure does not make a static site public | [M06] |
| **Recommended static hosting path** | The S3 website endpoint | **AWS Amplify Hosting** is recommended first. If the bucket is encrypted with SSE-KMS, **CloudFront with OAC is required** | The website endpoint supports neither HTTPS nor access points | [M02] [M06] |
| **CORS configuration format** | "Create a CORS configuration **XML file**" | The console requires **JSON.** XML remains valid on the REST API and SDK paths | You cannot paste the courseware XML into the console | [M06] |
| **`ListBuckets` pagination** | Described as if it returns the whole list at once | AWS **strongly recommends using only paginated requests.** Non-paginated requests are supported only for accounts with the default quota of 10,000, and are **rejected entirely** for accounts with an approved quota above 10,000 | The courseware code fails on large accounts | [M06] |
| **Presigned URL signature version** | `AWSAccessKeyId` / `Signature` / `Expires` (signature version 2 form) | Every URL that `aws s3 presign` creates uses **SigV4**. The query parameters are `X-Amz-Algorithm`, `X-Amz-Credential`, `X-Amz-Date`, `X-Amz-Expires`, `X-Amz-SignedHeaders`, and `X-Amz-Signature` | You have to configure the Region explicitly. `--expires-in` defaults to 3600 seconds with a maximum of 604800 (7 days) | [M06] |

> — Source: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

> — Source: [Virtual hosting of buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

### 6.2 DynamoDB

| Item | Courseware | Current default | Module |
|---|---|---|---|
| **Capacity mode** | Says only "capacity sizing" without distinguishing modes, and "you must provision the table's capacity when you create a table with the AWS CLI or an AWS SDK" | **On-demand mode is the default and recommended throughput option.** `BillingMode` is not required, and choosing `PAY_PER_REQUEST` means you cannot specify `ProvisionedThroughput` | [M02] [M07] [M08] |
| **What follows from that** | — | Create a table with default settings and you get on-demand, so **the lab screen differs from older screenshots.** On-demand incurs no throughput charge when traffic is zero | [M02] |
| **Empty attribute values** | "Attribute values cannot be **null**" | **Empty string and empty binary values are allowed for non-key attributes.** Only string and binary values used as keys must have length greater than zero. Set types cannot be empty, and a request containing an empty value is rejected with `ValidationException` | [M08] |
| **Removing an attribute in the document model** | Comments that `note["Favorite"] = null;` deletes it | Use `DynamoDBNull` for the null type. To actually remove the attribute, the `REMOVE` clause of a low-level `UpdateExpression` is clearer | [M08] |
| **`.NET` synchronous methods** | Synchronous calls such as `client.CreateTable(request)` | Targeting .NET Core or .NET Standard supports **async only**. The current official example is `await ...CreateTableAsync(...)` with `BillingMode.PAY_PER_REQUEST` | [M06] [M08] |

> — Source: [Programming with DynamoDB and the AWS SDK for Java](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProgrammingWithJava.html)

### 6.3 Lambda

| Item | Courseware | Current | Module |
|---|---|---|---|
| **Handling recursive loops** | Guides only "set the concurrent runtime limit to 0" | **Recursive loop detection is the default behavior.** It tracks the request chain with X-Ray tracing headers, stops the next invocation after roughly **16** calls in the same chain, and notifies you through the Health Dashboard and email. It works without active tracing and is free | [M09] [M14] |
| **Limits of detection** | — | Detection covers loops between the function itself and **Amazon SQS, S3, and SNS**, plus loops made only of Lambda functions. **It cannot detect a loop that includes another service such as DynamoDB.** In that case the courseware's manual measure (reserved concurrency of 0) still applies | [M09] |
| **Where code is stored** | "Lambda stores your code in **Amazon S3** and encrypts it at rest" | **Lambda-managed storage** (300 GB per account per Region, uncompressed) is the default, with self-managed S3 code storage in your own bucket as an option. Encryption at rest is provided in both cases | [M09] |
| **`invoke --payload`** | Passes a JSON string directly | AWS CLI v2 requires `--cli-binary-format raw-in-base64-out`. To make it the default, `aws configure set cli-binary-format raw-in-base64-out` | [M09] |
| **`/tmp` storage of 10 GB** | Presented as a fixed value | It is a setting **configurable from 512 MB to 10,240 MB in 1 MB increments.** There is no extra cost up to 512 MB and GB-seconds charges above that. SnapStart does not support ephemeral storage above 512 MB | [M09] |

> — Source: [Retaining records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

### 6.4 API Gateway and Step Functions

| Item | Courseware | Current | Module |
|---|---|---|---|
| **Integration passthrough conditions** | Lists **two** conditions | It is a setting with **three choices**: `WHEN_NO_MATCH` (courseware ①), `WHEN_NO_TEMPLATES` (courseware ②, **the documented recommendation**), and `NEVER` (do not pass through and reject unmapped content types with HTTP 415). With no `Content-Type` header, API Gateway defaults to `application/json` | [M10] |
| **Promoting a canary** | "You can promote the canary version and send 100% of traffic to this API version" (result only) | The promotion mechanism is ① resetting the stage's `deploymentId` to the canary's ② copying canary stage variables to the stage variables ③ lowering the canary traffic percentage to 0.0%. **Promotion alone does not disable the canary.** To go back you must remove `canarySettings` | [M10] |
| **Private integrations** | Defines `HTTP` and `HTTP_PROXY` as "integration with an HTTP endpoint, including a private HTTP endpoint in a VPC" | Both types are **backend HTTP endpoint integrations**, and a private integration is a **separate configuration**: `HTTP_PROXY` plus `connectionType=VPC_LINK` plus the `connectionId` of a VPC link V2. VPC link V2 can target **an ALB** as well as an NLB | [M10] |
| **Data passing and transformation language** | Explains it only with JSONPath fields and `$` notation | **JSONata** is supported and **recommended for new state machines**. Choosing JSONata reduces five JSONPath fields to `Arguments` and `Output`, and you no longer use `.$` in JSON key names. **Variables (`Assign`)** let you reference data stored in one step from any later step | [M11] |

> — Source: [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)

### 6.5 IAM

| Item | Courseware | Current | Module |
|---|---|---|---|
| **Number of policy types** | "The **two** most common policy types are identity-based policies and resource-based policies" | **Nine** are supported: identity-based, resource-based, VPC endpoint policies, permissions boundaries, SCPs, RCPs, ACLs, AWS RAM resource shares, and session policies. **The ones that grant permissions** are identity-based, resource-based, ACLs, and RAM shares; the rest only set a ceiling | [M04] |
| **"Root credentials are always allowed"** | Stated flatly | True within a single account. But **an AWS Organizations SCP restricts principals including the root user of a member account**, and an RCP also affects the effective permissions of identities including the root user. The root credentials of a member account can even be removed | [M04] |
| **What `PowerUserAccess` excludes** | "All services except IAM and AWS Organizations" | Default version v12 also excludes `account:*`, and in exchange **allows 9 exception actions** such as `account:GetAccountInformation` | [M04] |
| **AWS CLI output formats** | `json`, `yaml`, `text` — **three** | `json` (default), `yaml`, `yaml-stream`, `text`, `table`, `off` — **six**. Note that `--output text` paginates **before** `--query` is applied and runs the query per page, so output can be longer than expected | [M04] |
| **Credential precedence** | Gives two different lists on two slides and puts the instance profile last | It **separates two concepts**: the setting lookup precedence (code → JVM system properties → environment variables → shared credentials → shared config → SDK defaults, six levels) and the credential provider chain (access keys → web identity and OIDC → login providers → IAM Identity Center → assume role → container → process → IMDS) | [M04] |

> — Source: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

> — Source: [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

---

## 7. What Numbers and Limits Changed

Values that are easy to get wrong on an exam and in production alike.

### 7.1 What Got Bigger

| Item | Courseware | Current | Module |
|---|---|---|---|
| S3 multipart upload maximum object size | **5 TB** | The multipart upload limits page states **48.8 TiB** and the object upload page states **up to 50 TB** (a 5 MB to 50 TB range). The single PUT limit of **5 GB** is unchanged | [M06] |
| S3 Batch Operations supported operations | **7** | **11.** Checksum calculation, deleting all object tags, updating object encryption, and replicating existing objects (Batch Replication) were added. Manifest specification methods grew from 2 to **4** | [M06] |
| DynamoDB provisioned throughput decreases | Up to **4 per day** | It **starts with 4 per day** (UTC), **1 is replenished each hour**, and the maximum held concurrently is 4, so across 24 hours the total can reach **27** | [M08] |
| DAX write-through operations | **4** | **5.** `TransactWriteItems` was added | [M08] |
| Lambda async invocation record destinations | **4** | **5.** An Amazon S3 bucket (on failure only) was added | [M09] |
| Skill Builder free digital courses | **600+** | **900+.** Over **1,000** free learning resources overall | [M15] |

### 7.2 What Got Smaller or Gained Conditions

| Item | Courseware | Current | Module |
|---|---|---|---|
| Lambda async invocation payload | **256 KB** | **1 MB.** Synchronous request and response are 6 MB each (same as the courseware) and a streaming response is 200 MB | [M09] |
| Recommended JVM DNS TTL | **60 seconds** or less | **5 seconds** | [M04] |
| SnapStart "at no additional cost" | Stated unconditionally | **Limited to the Java managed runtimes.** For others, each published function version with SnapStart enabled incurs snapshot caching charges (billed for a minimum of 3 hours) and a restoration charge per restore, both varying with the memory allocated | [M09] |
| SnapStart supported runtimes | Java 11 and Java 17 | **Java 11 or later, Python 3.12 or later, .NET 8 or later.** Other managed runtimes, OS-only runtimes, and container images are not supported | [M09] |
| Lambda concurrent execution limit of 1,000 | Presented as a fixed limit | It is a default quota and **can be raised** (into the tens of thousands). Note that **new AWS accounts start at a reduced value** and are raised automatically based on usage | [M09] |
| Capacity mode switching | "Once every 24 hours" | Provisioned to on-demand is **up to 4 times within a 24-hour rolling window**; on-demand to provisioned is **any time** (DynamoDB item) | [M08] |
| Consumption of a failed conditional write | "**1** write capacity unit" | It is **based on item size.** Capacity is consumed even when the condition evaluates false, and the amount depends on the size of the existing item or the new item you attempted (documentation example: 300 KB and 310 KB means 310 KB) | [M08] |
| What `ListTables` returns | Says only that no parameters are required | Output is **paginated** with a maximum of **100** per page. To get everything you need a `LastEvaluatedTableName` → `ExclusiveStartTableName` loop | [M08] |
| API Gateway throttling types | **Two** | **Four.** AWS throttle limits (not customer-changeable) → per-account limits → per-API and per-stage limits → per-client limits. They apply in reverse order and are **all best-effort** | [M10] |
| Deployment package "3 MB for inline console editing" | Listed in the table | **This entry is not in the current quotas table.** The condition for using the console code editor is an interpreted-language runtime (Python, Node.js, Ruby) and **under 50 MB uncompressed**. Container image functions cannot be edited in the console | [M09] |

### 7.3 What Changed in Meaning

The number is the same but it means something different.

| Item | The courseware's reading | Actual | Module |
|---|---|---|---|
| DynamoDB `LastEvaluatedKey` | "If present, there are more items to read" | It **only means the previous Query stopped at a page boundary** (1 MB or `Limit`), not that more matching items remain. With a `FilterExpression`, a page can return zero matching items and still include a `LastEvaluatedKey` | [M08] |
| CloudWatch alarm "three consecutive periods" | Only consecutive breaches alarm | The real behavior is **M out of N**. When `Datapoints to Alarm` (M) is smaller than `Evaluation Periods` (N), the alarm fires without consecutive breaches | [M14] |
| S3 event notification triggers | "In response to Amazon S3 operations such as PUT, POST, COPY, or DELETE" | There are non-API triggers too (lifecycle expiration and transition, Intelligent-Tiering tier moves, replication metrics, restore initiated and completed). Conversely, **automatic deletion by lifecycle does not notify through `ObjectRemoved`**, so you need `s3:LifecycleExpiration:*` | [M06] |
| Lambda event source list | Includes Amazon Alexa and AWS CloudTrail | Neither appears in the current "services that can invoke Lambda functions" table (28 entries). **Absence from the table does not mean invocation is impossible, so we do not assert that.** The courseware's "Amazon CloudWatch" became **Amazon CloudWatch Logs** in the table | [M09] |

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 8. What Arrived Since the Courseware

New capabilities that anyone learning this course now **should at least know about**. Only items
within the scope of this course are included.

### 8.1 Compute

| Item | Content | Module |
|---|---|---|
| **Two Lambda compute primitives** | The documentation presents two primitives designed for different workload patterns. **Lambda Functions** (respond to events and API calls, each invocation runs independently, scales horizontally with demand) and **Lambda MicroVMs** (start almost instantly and hold state for up to 8 hours in an isolated compute environment). Both share no server management, usage-based billing, managed networking, and Firecracker virtualization. **This course's labs are on the Lambda Functions path**, so the lab content does not change, but you need to know the two are distinguished when you go to the documentation | [M01] [M02] |
| **Lambda recursive loop detection** | On by default, free, no X-Ray active tracing required | [M09] [M14] |
| **The OS-only runtime `provided.al2023`** | The path for running Go, Rust, and others | [M09] |

### 8.2 Observability

The courseware covers only CloudWatch and X-Ray. Here is what is in this space now.

| Item | Content | Module |
|---|---|---|
| **CloudWatch Application Signals** | Automatically collects metrics and traces from EC2, ECS, and Lambda applications and displays call volume, availability, latency, faults, and errors without writing code. Create and track **SLOs and SLIs**, and see an automatically discovered application topology map. Supports Java, Python, Node.js, and .NET | [M02] [M14] |
| **Transaction Search** | Ingests **100% of transaction spans** as structured logs in CloudWatch. You can view traces containing up to **10,000** spans, stored in the `aws/spans` log group | [M14] |
| **CloudWatch Logs Insights** | Three query languages (Logs Insights QL, OpenSearch PPL, OpenSearch SQL), field indexes, pattern analysis, natural language query generation. **Charged by the volume of uncompressed log data scanned** | [M14] |
| **Embedded metric format (EMF)** | Generates custom metrics asynchronously in the form of logs. Needs only `logs:PutLogEvents`, not `cloudwatch:PutMetricData` | [M14] |
| **CloudWatch cross-account observability** | View source-account metrics, logs, and traces from a monitoring account. Multiple accounts' metrics in one graph, multiple accounts' log groups in one query | [M02] [M14] |
| **OpenTelemetry metrics in CloudWatch** | Ingested over OTLP and queried with **PromQL**. A metric-name-plus-labels model (up to 150 labels), handled in CloudWatch Query Studio. **OpenTelemetry is recommended for new implementations** | [M14] |
| **More kinds of CloudWatch alarm** | Beyond metric alarms: **PromQL alarms, log alarms, and composite alarms** | [M14] |
| **CloudWatch Logs log classes** | **Standard** and **Infrequent Access**. Log group **deletion protection** was added too | [M14] |
| **Lambda advanced logging controls** | Set log format (text or JSON), log level (`FATAL` through `TRACE`), and destination log group **in the function configuration**. Destinations now include **S3 and Firehose** besides CloudWatch Logs | [M14] |
| **Trace collection by the CloudWatch agent** | Version 1.300025.0 and later collects OpenTelemetry and X-Ray SDK traces and sends them to X-Ray. **No separate daemon is needed** | [M02] [M14] |

### 8.3 Authentication and Authorization

| Item | Content | Module |
|---|---|---|
| **Cognito user pool feature plans** | **Lite** (sign-in features and the classic hosted UI), **Essentials** (the full set of current authentication features including choice-based sign-in and email MFA, **the default for new user pools**), **Plus** (Essentials plus threat protection). A plan applies **per user pool** and cannot differ per app client | [M02] |
| **managed login** | The successor branding version to hosted UI (classic). Note that it **does not support user self-service profile management** such as attribute changes and MFA preferences, so the application must implement that part | [M02] |
| **More IAM policy types** | Nine. RCPs (resource control policies) postdate the courseware | [M04] |
| **SigV4a** | **Asymmetric signing** for multi-Region requests | [M03] [M04] |

### 8.4 Data and Storage

| Item | Content | Module |
|---|---|---|
| **Aurora DSQL** | The decision guide puts **Aurora DSQL** in the OLTP relational family alongside Aurora PostgreSQL-Compatible and Aurora MySQL-Compatible | [M07] |
| **The ElastiCache Valkey engine and serverless** | Valkey, Memcached, and Redis OSS as three engines, with serverless and node-based deployment. Serverless is compatible with Valkey 7.2 or later, Memcached 1.6.22 or later, and Redis OSS 7.1 | [M07] [M08] |
| **DynamoDB `EnhancedDocument`** | For avoiding data type descriptors in Java 2.x | [M08] |
| **S3 Batch Replication** | A batch operation that replicates existing objects | [M06] |

### 8.5 Tools and Languages

| Item | Content | Module |
|---|---|---|
| **Kiro** | The documentation directs you here as the replacement for the Amazon Q Developer IDE plugins. It comes as an IDE, a CLI, and an autonomous web agent, with agentic coding, chat, and MCP support | [M03] |
| **Step Functions JSONata and variables** | JSONata is recommended for new state machines. Three fields (`Arguments`, `Output`, `Assign`) simplify the model | [M11] |
| **The `TestState` API** | The path for testing an individual state, replacing Step Functions Local | [M11] |
| **VPC link V2** | Can target an ALB and lets you pass `connectionId` as a stage variable | [M10] |
| **AWS SAM connectors** | With `AWS::Serverless::Connector` you declare only the Read/Write intent between resources and SAM generates the permissions | [M13] |
| **Four Amazon Polly voice engines** | Generative, Long-form, Neural, Standard. The first two postdate the courseware | [M01] |
| **AWS Skill Builder immersive learning** | AWS Builder Labs (over 200 guided interactive labs), AWS Cloud Quest, AWS Jam, AWS SimuLearn, and an **AI-powered Learning Assistant** inside the lab context | [M01] [M15] |
| **Microcredentials** | Validate hands-on ability through real-time assessment in a live AWS environment. Serverless, agentic AI, application networking, incident response. **No Skill Builder subscription required** | [M15] |
| **AWS Certified Generative AI Developer – Professional** | The most direct next certification for a developer. Offered in Korean as well | [M15] |
| **DVA-C03** | The revised version of this course's matching exam. **AI-assisted development and AI security are added** and container management comes in. The last day for DVA-C02 is November 30, 2026 | [M15] |

---

## 9. What Documentation Paths Moved

Cases where a courseware link lands on a different page or returns a 404. **This matters most when
copying by hand from printed material.**

### 9.1 Returns 404

| Courseware URL | Module |
|---|---|
| `AWSSdkDocsNET/latest/V3/DeveloperGuide/net-dg-install-assemblies.html` | [M03] |
| `docs.aws.amazon.com/pt_br/cli/latest/...` (an SDK install link) | [M03] |
| `docs.aws.amazon.com/AWSToolkitEclipse/latest/GettingStartedGuide/lambda.html` | [M09] |
| `aws.amazon.com/certification/certification-paths/` | [M15] |

### 9.2 Redirects Elsewhere

| Target | Courseware path | Current location | Module |
|---|---|---|---|
| S3 developer guide | `/AmazonS3/latest/dev/` | `/AmazonS3/latest/userguide/` | [M05] [M06] |
| S3 changing storage class | `ChgStoClsOfObj.html` | `storage-class-intro.html` (the separate page was merged in) | [M06] |
| DynamoDB quotas | `Limits.html` | Split into **two pages**: `ServiceQuotas.html` (adjustable quotas) and `Constraints.html` (fixed constraints) | [M07] |
| Java SDK client creation | `sdk-for-java/latest/developer-guide/using.html` | The "Create a service client" section of `work-witih-clients.html` | [M07] |
| DynamoDB on-demand pricing | `aws.amazon.com/dynamodb/pricing/on-demand/` | `aws.amazon.com/dynamodb/pricing/` (consolidated) | [M07] |
| Lambda quotas | `/lambda/latest/dg/limits.html` | `/lambda/latest/dg/gettingstarted-limits.html` | [M09] |
| Lambda permissions | `/lambda/latest/dg/intro-permission-model.html` | `/lambda/latest/dg/lambda-permissions.html` | [M09] |
| Lambda API reference | `/lambda/latest/dg/API_*.html` | `/lambda/latest/api/API_*.html` | [M09] |
| IAM evaluation logic | `AccessPolicyLanguage_EvaluationLogic.html` | `reference_policies_evaluation-logic.html` | [M04] |
| IAM getting started | `getting-started_create-admin-group.html` | `getting-started-account-iam.html` | [M04] |
| CLI profiles | `cli-configure-profiles.html` | `cli-configure-files.html` | [M04] |
| CLI configure | `cli-configure-quickstart.html` | `cli-chap-configure.html` | [M04] |
| Boto3 credentials | `boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html` | `docs.aws.amazon.com/boto3/latest/guide/credentials.html` | [M04] |
| CloudWatch alarms | `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` | `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html` | [M14] |
| Eclipse toolkit | `toolkit-for-eclipse/v1/user-guide/` | `toolkit-for-jetbrains/latest/userguide/welcome.html` | [M04] [M09] |
| AWS pricing whitepaper | `.../how-aws-pricing-works/welcome.html` | `.../how-aws-pricing-works/` | [M15] |
| Exam list | `aws.amazon.com/certification/exams` | `aws.amazon.com/certification/` | [M15] |
| AWS Builder Labs | `/training/digital/aws-builder-labs` | `/training/digital/immersive-learning/` | [M15] |
| Tech Talks | `/events/online-tech-talks/on-demand` | `/events/online-tech-talks/` | [M15] |
| Skill Builder learn | `explore.skillbuilder.aws/learn` | The Skill Builder root domain | [M15] |
| AWS Workshops | `workshops.aws` | The workshops path on AWS Builder Center | [M15] |
| Follow-on course registration | `www.aws.training/SessionSearch?...` | `aws.amazon.com/training/classroom/<course>/` (then on to Skill Builder) | [M01] [M15] |
| Lambda Visual Studio toolkit | `/lambda/latest/dg/csharp-package-toolkit.html` | Redirects to the Lambda developer guide root. **Not the topic it originally covered** | [M09] |

> — Source: [Tools to develop, deploy, and manage Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

> — Source: [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

### 9.3 The URL Lives but the Content Is Different

The hardest type to notice. **The response is 200 and the page opens, but the content is a different
generation.**

| Target | What the courseware expects | Actual | Module |
|---|---|---|---|
| `sdk-for-java/latest/developer-guide/metrics.html` | Enabling metrics with 1.x system properties | Serves **2.x content**, where enabling is done by choosing a `MetricPublisher` implementation (`CloudWatchMetricPublisher` and others) | [M03] |
| `sdk-for-java/v1/developer-guide/jvm-ttl-dns.html` | The latest JVM TTL guidance | Redirects within the v1 path but is **still the v1 guide** | [M04] |
| The ".NET advanced configuration" link | The latest .NET guidance | Still the **v3 path** | [M03] |
| `AWSJavaScriptSDK/latest/` | The latest JavaScript SDK API reference | The **v2 API reference path**. The URL itself responds | [M03] |

> — Source: [AWS SDK for Java 1.x](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

> — Source: [Migrating to the AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html)

---

## 10. If You Are Writing Code Now

What to check, in order, when moving a courseware example into production code. **Follow this table
and you avoid most of the traps in this document.**

### 10.1 Pre-Start Checklist

| # | Check | Section |
|---|---|---|
| 1 | Is the **SDK major version** a supported one? Java 2.x (`software.amazon.awssdk`), .NET 4.x, JavaScript v3, Go V2 | [3.1](#31-aws-sdk-major-versions) |
| 2 | Is the **Lambda runtime** in the current supported table? The courseware's `python3.8`, `python3.9`, `nodejs12.x`, `go1.x`, and `.NET Core` are all at end of support | [3.2](#32-lambda-runtimes) |
| 3 | Are you using **AWS CLI v2**? | [4.1](#41-aws-cli-v1) |
| 4 | Are your **credentials** something other than long-term access keys? IAM Identity Center or an IAM role | [4.2](#42-credentials) |
| 5 | In Python, are you using **`boto3.client()`** rather than `boto3.resource()`? | [4.3](#43-how-the-sdks-are-used) |
| 6 | For tracing, are you on the **OpenTelemetry** path rather than the X-Ray SDK? | [4.4](#44-instrumentation-and-tracing) |
| 7 | In .NET, are you using the **async methods** (`*Async`)? | [6.1](#61-s3) and [6.2](#62-dynamodb) |
| 8 | Is the **retry mode** `standard`? | [4.3](#43-how-the-sdks-are-used) |

### 10.2 Common Snags by Service

| Service | Where people get stuck | What to do |
|---|---|---|
| **S3** | Trying to grant access with an ACL | ACLs are disabled on new buckets. Grant with a **bucket policy and IAM policy** |
| **S3** | Publishing a static site through a public-read bucket | **Amplify Hosting** is recommended first. With an SSE-KMS bucket, **CloudFront with OAC is required** |
| **S3** | Calling `ListBuckets` in one shot | **Paginate.** Non-paginated requests are rejected on large accounts |
| **S3** | Pasting CORS XML into the console | The console accepts **JSON only** |
| **DynamoDB** | Provisioning capacity when creating a table | `BillingMode=PAY_PER_REQUEST` (on-demand) is **the default and the recommendation** |
| **DynamoDB** | Assuming items remain when `LastEvaluatedKey` is present | **Loop until it is empty.** Its presence does not mean matching items remain |
| **DynamoDB** | Using legacy conditional parameters | Use the **expression-based** ones. Mixing them is an error |
| **Lambda** | Assuming an async payload of 256 KB | It is **1 MB** |
| **Lambda** | Relying on the runtime's bundled SDK | **Include it explicitly** in the deployment package or a layer |
| **Lambda** | Using a DLQ for async failure handling | An **on-failure destination** supports more targets and includes response details |
| **Lambda** | Passing raw JSON to `invoke --payload` | CLI v2 needs `--cli-binary-format raw-in-base64-out` |
| **API Gateway** | Starting with mapping templates | Evaluate **proxy integration → parameter mapping → mapping template** in that order |
| **API Gateway** | Using API keys for access control | Access control is **IAM, Lambda authorizers, and Cognito.** API keys are for client identification |
| **API Gateway** | Using usage plan quotas for cost control | They are best-effort. Use **AWS Budgets** for cost and **AWS WAF** for blocking |
| **API Gateway** | Turning on Data tracing in production | Sensitive data gets logged. **Only temporarily, while troubleshooting** |
| **Cognito** | Using the implicit grant | **Authorization code grant with PKCE** |
| **Cognito** | Using the basic (classic) flow | The **enhanced flow** (`GetId` → `GetCredentialsForIdentity`) |
| **Step Functions** | Using `Iterator` and `Parameters` | `ItemProcessor` and `ItemSelector` |
| **Step Functions** | Using JSONPath in a new state machine | **JSONata** is recommended |
| **SAM** | Running `sam package` separately | `sam deploy` does it implicitly. For automatic bucket creation, `--resolve-s3` |
| **SAM** | A broad managed policy on a function | Scope it to the target resource with a **policy template** or a **connector** |
| **X-Ray** | Looking for the service map in the X-Ray console | **CloudWatch console → X-Ray traces → Trace Map** |
| **X-Ray** | No Lambda traces appearing | Set `Tracing` to **`Active`**. The default is `PassThrough` and it does not send automatically |

### 10.3 Values You Must Check Yourself

The figures in this document that **change over time.** Look at the original before adopting them.

| Item | Original |
|---|---|
| SDK major version lifecycle | [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Lambda runtime support and deprecation schedule | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS CLI v1 phase | [AWS CLI v1 maintenance mode announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/) |
| X-Ray SDK and daemon timeline | [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html) |
| Certification lineup and exam revision schedule | [AWS Certification](https://aws.amazon.com/certification/) |

**The documentation states that the dates in the runtime table are for planning purposes and are
subject to change.** Do not build a long-term plan on the dates written here.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html)

---

## 11. Index by Module

The **courseware location and the sourcing** for each item are in that module's
`Changes from the Courseware` chapter. This document regroups them by topic, so go back to the module
for the detail.

| Module | Main items covered here |
|---|---|
| **M01** Course Overview | The X-Ray console, four Polly voice engines, two Lambda primitives, classroom course paths, AWS Builder Labs |
| **M02** Building a Web Application | The X-Ray console, CloudWatch's observability scope, Cognito managed login and feature plans, the recommended S3 frontend hosting path, the DynamoDB definition and capacity mode, Lambda primitives |
| **M03** Development Environment | Five SDK major versions, `nodejs12.x`, AWS CLI v1, Cloud9, boto3 resources, Amazon Q Developer IDE plugins, long-term access keys, the SigV4 5-minute window |
| **M04** Permissions | Cloud9, the Eclipse toolkit, Java 1.x, long-term access keys, root access keys, retry legacy mode, nine policy types, `PowerUserAccess` v12, six CLI output formats, JVM TTL of 5 seconds, many documentation paths |
| **M05** Getting Started with Storage | Java 1.x, boto3 resources, path-style requests, ACLs disabled by default, strong read-after-write consistency |
| **M06** Storage Application | Java 1.x, S3 Object Lambda, boto3 resources, the `list_objects` paginator, RRS, the multipart limit, public ACLs, .NET synchronous methods, CORS JSON, `ListBuckets` pagination, presigned URL SigV4, 11 batch operations |
| **M07** Getting Started with Databases | Java 1.x DynamoDB namespaces, boto3 resources, single-digit milliseconds, three ElastiCache engines, the database service taxonomy, two NoSQL Workbench tools, documentation paths |
| **M08** Database Application | Java 1.x Document API, boto3 resources, legacy conditional parameters, `CreateTableResponse`, 27 throughput decreases, capacity mode switching, conditional write consumption, `LastEvaluatedKey`, empty strings allowed, five DAX operations, `ListTables` pagination |
| **M09** Compute | `python3.8`, `.NET Core`, `go1.x`, the Eclipse toolkit, boto3 resources, DLQ, the runtime's bundled SDK, the 1 MB async payload, `/tmp` configuration, concurrency scaling rate, SnapStart conditions, recursive loop detection, code storage location, `--cli-binary-format`, documentation paths |
| **M10** API Gateway | Mapping template ordering, API keys, usage plans, stage variables, Data tracing, OpenAPI, Lambda authorizers, four throttling tiers, console paths, three passthrough choices, canary promotion, private integrations |
| **M11** Microservices | Step Functions Local, `Iterator` and `Parameters`, JSONata and variables, CloudWatch Events to EventBridge |
| **M12** Granting Access | Cognito Sync, the implicit grant, the basic (classic) flow, `UnusedAccountValidityDays`, developer attributes, the `TOKEN` authorizer |
| **M13** Deploying | `python3.8` and `python3.9`, `sam package`, a broad managed policy |
| **M14** Observing | X-Ray SDK and daemon GA end, X-Ray SDK, daemon and local sampling discouraged, the X-Ray console, service map to trace map, CloudWatch Events to EventBridge, alarm M out of N, Logs Insights, EMF, Application Signals, Transaction Search, Lambda advanced logging, CloudWatch agent traces |
| **M15** Course Wrap-up | Four Specialty certifications ended, `www.aws.training`, Skill Builder scale and structure, the four exam prep steps, DVA-C03, microcredentials, many documentation paths |

### When You Come Back to This Document

- **Right after the class**: read only the eight priorities in
  [Section 2.2](#22-where-to-look-first).
- **When stuck in a lab**: find your service in
  [Section 10.2](#102-common-snags-by-service).
- **When writing production code**: work through
  [Section 10.1](#101-pre-start-checklist) in order.
- **When something in the courseware looks doubtful**: find the module in
  [Chapter 11](#11-index-by-module) and go to its `Changes from the Courseware` chapter.

The verification date is **August 25, 2026**. For the figures here that concern lifecycles and
schedules, re-check the originals in [Section 10.3](#103-values-you-must-check-yourself).
