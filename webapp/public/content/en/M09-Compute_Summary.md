# Module 9: Processing Your Application Logic

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Compute Services](#2-compute-services)
3. [How AWS Lambda Works](#3-how-aws-lambda-works)
4. [AWS Lambda Invocation Models](#4-aws-lambda-invocation-models)
5. [Permissions](#5-permissions)
6. [Development](#6-development)
7. [Testing](#7-testing)
8. [Deployment](#8-deployment)
9. [Demo and Lab 4](#9-demo-and-lab-4)
10. [Changes from the Courseware](#10-changes-from-the-courseware)
11. [Knowledge Check and Summary](#11-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 10](#10-changes-from-the-courseware) for what changed and how.
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.
> - This is the module with the largest gap between the courseware and current documentation in this course. The quota table on courseware slide 50 is explicitly labeled **"as of September 2021"**, and the runtime list, SnapStart coverage, and asynchronous payload limit have all changed since then.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Explore how AWS Lambda works
- Develop AWS Lambda functions using the SDKs
- Configure triggers and permissions for Lambda functions
- Test, deploy, and monitor Lambda functions

### Where This Module Sits

| Item | Content |
|---|---|
| Module 8 | Processing your database operations |
| **Module 9** | **Processing your application logic** — Compute service comparison, how Lambda works, invocation models, permissions, development, testing, deployment |
| Lab 4 | Developing a solution with AWS Lambda |
| Module 10 | API management |
| Lab 5 | Developing a solution with Amazon API Gateway |

So far you have stored data and hosted a website with Amazon S3 (Modules 5 and 6), and stored notes in Amazon DynamoDB keyed by `userId` (Modules 7 and 8). In this module you **process application logic with AWS Lambda**.

### Sections in This Module

This follows the courseware slide order exactly.

| Slides | Section | This document |
|---|---|---|
| 4–6 | Compute services | [Section 2](#2-compute-services) |
| 7–10 | How AWS Lambda works | [Section 3](#3-how-aws-lambda-works) |
| 11–17 | AWS Lambda invocation models | [Section 4](#4-aws-lambda-invocation-models) |
| 18–21 | Permissions | [Section 5](#5-permissions) |
| 22–38 | Development | [Section 6](#6-development) |
| 39–45 | Testing | [Section 7](#7-testing) |
| 46–50 | Deployment | [Section 8](#8-deployment) |
| 51–52, 55–56 | Demo, Lab 4 | [Section 9](#9-demo-and-lab-4) |
| 53–54, 57–59 | Knowledge check, summary | [Section 11](#11-knowledge-check-and-summary) |

---

## 2. Compute Services

### 2.1 Compute Services Overview

AWS offers three types of compute. Courseware slide 5 shows an axis where the **level of abstraction** increases from left to right.

| Type | Service | Slide description |
|---|---|---|
| Instances | Amazon EC2 | Scalable compute capacity |
| Containers | Amazon ECS | Fully managed container orchestration |
| Containers | Amazon EKS | Fully managed container orchestration using Kubernetes |
| Serverless | AWS Lambda | Event-driven serverless compute |

| Type | Courseware instructor notes |
|---|---|
| Instances | The traditional way of thinking about infrastructure. You have full control over compute resources with deep access and customization. With Amazon EC2 you control the physical server instances, so you need a load balancer to distribute traffic, and you might have to start or stop instances based on traffic or demand |
| Containers | A container virtualization system is smaller, more portable, and easier to manage than a full virtual management system. A container is a software package that includes the application, code, configuration, and dependencies, and a cluster is a logical grouping of tasks and services that use one or more containers. ECS and EKS clusters can run on EC2 instances, and when a container fails and the failure is detected it can be replaced with another container |
| Serverless | You don't have to provision servers to run backend code and you don't have to worry about an infrastructure model for your application. AWS Lambda is an event-driven compute service, an event is a signal that system state has changed, and events invoke and run Lambda functions. Lambda runs on demand and you don't have to worry about infrastructure, load balancing, or scaling |

### 2.2 How Current Documentation Classifies Compute Services 🆕

The courseware's three-way split (instances / containers / serverless) matches the current decision guide. What changed is the **breadth of the choices**.

| Category | Services in current documentation |
|---|---|
| Amazon EC2 family | Amazon EC2 (including Graviton4, Trn2, and P5eN instances), EC2 Auto Scaling, EC2 Image Builder, AWS Elastic Beanstalk, Amazon Lightsail |
| Containers | Amazon ECS, Amazon ECS Anywhere, Amazon EKS, Amazon EKS Anywhere, Amazon ECR, AWS Batch |
| Serverless | **AWS Fargate**, **AWS Lambda** |

🆕 The courseware puts only Lambda in the serverless column and mentions Fargate only in the instructor notes. Current documentation **classifies Fargate as serverless compute alongside Lambda**. You can run containers on EC2 instances you manage, or on Fargate, which is AWS managed compute.

> — Source: [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/compute-on-aws-how-to-choose/choosing-aws-compute-service.html)

The instructor note "AWS Fargate is supported on ECS and EKS, which run containers in a serverless compute model" is still accurate. The Amazon EKS User Guide also has a topic on running Kubernetes pods on Fargate, and Fargate profiles control which pods start on Fargate. Each pod that runs on Fargate has its own compute boundary and does not share the kernel, CPU, memory, or elastic network interface with another pod.

> — Source: [Simplify compute management with AWS Fargate (Amazon EKS)](https://docs.aws.amazon.com/eks/latest/userguide/fargate.html)

### 2.3 Compute Service Comparison (Courseware Slide 6)

The courseware table, reproduced as-is.

| Category | EC2 | ECS/EKS | Lambda |
|---|---|---|---|
| Abstraction | Hardware | Operating system | Runtime |
| Packaging | Amazon Machine Image (AMI) | Container | Function code |
| Pricing model | Based on infrastructure consumption | Based on infrastructure consumption | Pay per request |
| Scalability and concurrency | Full control over configuration and scaling | You control the number and size of instances | Implicit scaling |

Courseware instructor notes:

- The Lambda pricing model charges per invocation, execution time, and memory usage.
- Amazon EC2 — You can provision additional instances and increase AMI size.
- Amazon EKS and ECS — Increase instance size, add instances, add replicas, configure load balancing, configure auto scaling.

### 2.4 Fargate Compared with Lambda 🆕

The courseware compares containers with serverless side by side, but it does not address the choice between the two **serverless** options. Here is the comparison from the current decision guide.

| Item | AWS Fargate | AWS Lambda |
|---|---|---|
| Execution model | Container-based serverless compute | Event-driven serverless functions (with optional durable orchestration) |
| Supported languages | Any language that can run in a container | Node.js, Python, Java, C#, Go, Ruby, **PowerShell** + custom runtimes |
| Execution time limit | No hard limit | **15 minutes per invocation** (durable functions orchestrate workflows up to 1 year) |
| Memory | Up to 244 GiB | Up to 10 GiB |
| CPU | Up to 32 vCPU | Proportional to memory, up to 6 vCPU |
| State management | Can maintain in-memory state while running | Stateless by design (state must be managed externally) |
| Deployment strategies | Native blue/green, canary, and linear | **Weighted aliases** |
| Concurrency limit | Based on cluster capacity | 1,000 by default (can be increased) |
| Package size | Container size bound to configured ephemeral storage (200 GiB maximum) | 250 MB unzipped including layers, 10 GB for container images |
| Cold start mitigation | SOCI lazy loading | Provisioned concurrency, SnapStart (Java, Python, .NET), Lambda Managed Instances |

Benefits both services share: reduced operational overhead, pay-per-use pricing, faster deployment, built-in high availability, simplified compliance, and focus on code.

Selection guidance from current documentation: consider Lambda functions for event-driven tasks, unpredictable workloads, or wait-heavy orchestration workflows; consider Lambda Managed Instances for steady-state or predictable workloads that benefit from EC2 pricing and specialized compute; consider Fargate for containerized applications with specific resource needs or persistent processes.

> — Source: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

### 2.5 Lambda Pricing Structure 🔄

The courseware only says "per invocation, execution time, and memory usage." Here is the structure on the current pricing page.

| Item | Content |
|---|---|
| Billing basis | **Number of requests** served + the **duration** your code runs, measured in **GB-seconds**. You choose the memory allocated and get proportional CPU and resources |
| Free tier | 1 million requests + 400,000 GB-seconds per month |
| Per-architecture pricing 🆕 | **x86 and Arm have separate price tables.** Each applies tiered pricing by monthly GB-second usage (x86: first 6 billion / next 9 billion / over 15 billion GB-seconds; Arm: first 7.5 billion / next 11.25 billion / over 18.75 billion) |
| Ephemeral storage 🆕 | No additional cost up to 512 MB. Beyond that, billed per GB-second |
| Provisioned concurrency 🆕 | Billed separately for the amount of concurrency you configure and the period you configure it. When enabled and executed, request and duration charges also apply |
| SnapStart 🆕 | Snapshot caching is billed over the period the function version is active, for a **minimum of 3 hours** |
| Lambda MicroVMs 🆕 | Priced per instance-second |

> — Source: [AWS Lambda pricing](https://aws.amazon.com/lambda/pricing/)

---

## 3. How AWS Lambda Works

### 3.1 Using Lambda

As data flows through your application, Lambda can run code in response to observable events. Lambda runs when an event triggers it.

Slide diagram: event source → invoke → AWS Lambda (function code) → services / internet / optional response.

| Event source type | Examples |
|---|---|
| Data or resource state change | A new message in a log file, a data change in an Amazon S3 bucket or an Amazon DynamoDB table |
| HTTP request to an endpoint | Using Amazon API Gateway |
| API call through an SDK | Created using the AWS SDKs |

The code that AWS Lambda runs is a **Lambda function**. Lambda functions are **stateless**, which is what lets them scale quickly with the rate of incoming events. The programming model is stateless, but your code can access stateful data by calling other web services such as Amazon S3 or Amazon DynamoDB.

### 3.2 Event Sources That Invoke Lambda 🔄

Courseware slide 9 qualifies its list with "including but not limited to" and then presents the following.

| Category | Courseware list |
|---|---|
| Data stores | Amazon S3, Amazon DynamoDB, Amazon Kinesis, Amazon Cognito |
| Endpoints | Amazon API Gateway, AWS IoT, AWS Step Functions, Amazon Alexa |
| Development and management tools | AWS CloudFormation, AWS CloudTrail, AWS CodePipeline, Amazon CloudWatch |
| Event and message services | Amazon EventBridge, Amazon SES, Amazon SNS |

The current "Services that can invoke Lambda functions" table has **28 entries** and states the invocation method for each.

| Invocation method | Services |
|---|---|
| Event source mapping | Amazon MSK, self-managed Apache Kafka, Amazon DocumentDB, Amazon DynamoDB, Amazon Kinesis, Amazon MQ, Amazon SQS |
| Event-driven, **synchronous** | Amazon API Gateway, Amazon Cognito, Connect Customer, Application Load Balancer, Amazon Data Firehose, Amazon Lex, Amazon S3 Batch, Amazon VPC Lattice |
| Event-driven, **asynchronous** | AWS CloudFormation, Amazon CloudWatch Logs, AWS CodeCommit, AWS CodePipeline, AWS Config, AWS IoT, Amazon SES, Amazon SNS, Amazon S3, Amazon EventBridge Scheduler (time based) |
| Synchronous or asynchronous | Amazon EventBridge (asynchronous for event buses and rules, synchronous or asynchronous for pipes), AWS Step Functions |

Differences from the courseware:

- 🔄 **Amazon Alexa** and **AWS CloudTrail**, which the courseware lists, are not in the current table. Absence from the table does not mean invocation is impossible, so we do not assert that (the `AddPermission` API still has an `EventSourceToken` parameter documented "for Alexa Smart Home functions").
- 🔄 The courseware's "Amazon CloudWatch" became **Amazon CloudWatch Logs** in the table.
- 🆕 Added to the table since the courseware: Amazon DocumentDB, Amazon MQ, Amazon MSK, self-managed Apache Kafka, Application Load Balancer, Amazon EventBridge Scheduler, Amazon Data Firehose, Amazon Lex, Amazon S3 Batch, Amazon VPC Lattice, Connect Customer, AWS Config, AWS CodeCommit.
- 🆕 Beyond event-driven invocation, you can also use Lambda with Amazon EC2, self-managed Apache Kafka, and Kubernetes.
- 🆕 A function can have **multiple triggers**. Each trigger acts as an independent client, and each event Lambda passes to your function has data from **only one trigger**. Triggers are stored and managed by **the service that generates the events**, not by Lambda.

> — Source: [Invoking Lambda with events from other AWS services](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html)

### 3.3 Anatomy of a Lambda Function

Courseware slide 10 shows: **trigger + access permissions + code (handler function, other) + runtime + layers + configuration (concurrency, memory, timeout)**.

| Component | Courseware description |
|---|---|
| Code | Contains the handler function and other code. The handler function runs whenever an event occurs |
| Runtime | Lambda supports runtimes for language-specific environments, and you can also create your own custom runtime |
| Layers | Provide shared code or a custom runtime |
| Permissions | A Lambda function needs permissions that define what it can interact with |
| Trigger | An AWS service configured to invoke the function, or an event source mapping resource within Lambda that reads items from a stream or queue and invokes the function |
| Configuration | Concurrency, memory allocation, timeout, and so on |

What the runtime is responsible for (courseware instructor notes):

- Running the function's setup code
- Reading the handler name from an environment variable
- Reading invocation events from the Lambda runtime API
- Passing event data to the function handler
- Posting the handler's response back to Lambda

Current documentation also defines the runtime as "a language-specific environment that relays invocation events, context information, and responses between Lambda and the function."

### 3.4 Supported Runtimes 🔄

Courseware slide 10 instructor notes list the runtimes as **"Node.js, Java, Python, .NET Core, Go, Ruby."** **This list differs from current reality.** The `.NET Core` family and `go1.x` reached end of support.

Each major language release has a unique **runtime identifier** such as `nodejs24.x` or `python3.14`, and changing the major version means changing the identifier yourself (AWS cannot guarantee backward compatibility between major versions, so this is a customer-driven operation).

Here is the current supported runtimes table (25 rows). **The projected deprecation dates are for planning purposes and are subject to change.**

| Name | Identifier | Operating system | Projected deprecation |
|---|---|---|---|
| Node.js 26 (public preview) | `nodejs26.x` | Amazon Linux 2023 | Not scheduled |
| Node.js 24 | `nodejs24.x` | Amazon Linux 2023 | 2028-04-30 |
| Node.js 22 | `nodejs22.x` | Amazon Linux 2023 | 2027-04-30 |
| Python 3.15 (public preview) | `python3.15` | Amazon Linux 2023 | Not scheduled |
| Python 3.14 | `python3.14` | Amazon Linux 2023 | 2029-06-30 |
| Python 3.13 | `python3.13` | Amazon Linux 2023 | 2029-06-30 |
| Python 3.12 | `python3.12` | Amazon Linux 2023 | 2028-10-31 |
| Python 3.11 | `python3.11` | Amazon Linux 2 | 2027-06-30 |
| Python 3.10 | `python3.10` | Amazon Linux 2 | 2026-10-31 |
| Java 25 | `java25` | Amazon Linux 2023 | 2029-06-30 |
| Java 21 | `java21` | Amazon Linux 2023 | 2029-06-30 |
| Java 17 | `java17.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 11 | `java11.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 8 | `java8.al2023` | Amazon Linux 2023 | 2029-06-30 |
| Java 17 | `java17` | Amazon Linux 2 | 2027-06-30 |
| Java 11 | `java11` | Amazon Linux 2 | 2027-06-30 |
| Java 8 | `java8.al2` | Amazon Linux 2 | 2027-06-30 |
| .NET 10 | `dotnet10` | Amazon Linux 2023 | 2028-11-14 |
| .NET 9 (container only) | `dotnet9` | Amazon Linux 2023 | 2026-11-10 |
| .NET 8 | `dotnet8` | Amazon Linux 2023 | 2026-11-10 |
| Ruby 4.0 | `ruby4.0` | Amazon Linux 2023 | 2029-03-31 |
| Ruby 3.4 | `ruby3.4` | Amazon Linux 2023 | 2028-03-31 |
| Ruby 3.3 | `ruby3.3` | Amazon Linux 2023 | 2027-03-31 |
| OS-only runtime | `provided.al2023` | Amazon Linux 2023 | 2029-06-30 |

A few things to note:

- 🆕 **Amazon Linux 2 is scheduled for end of life on June 30, 2026.** AL2-based runtimes (`java8.al2`, `java11`, `java17`, `python3.10`, `python3.11`, `provided.al2`) are patched only until the deprecation dates in the table. AWS recommends upgrading to an AL2023-based runtime as soon as possible, and provides AL2023-based Java 8, 11, and 17 runtimes for customers who cannot change their Java version.
- 🆕 **All supported runtimes support both x86_64 and arm64** (see [Section 6.13](#613-arm64-graviton2-architecture)).
- 🆕 Go and Rust run on an **OS-only runtime** (`provided.al2023`). Other languages can deploy a custom runtime alongside function code or in a layer.
- 🆕 Lambda provides managed runtimes for a new language version only when the release reaches the **long-term support (LTS)** phase, and does not provide managed runtimes for versions that are not scheduled for LTS.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.5 Runtime Deprecation Policy and Timeline 🆕

The courseware does not cover the fact that runtimes get deprecated at all. It is one of the most frequently encountered topics in practice, so here it is.

The standard deprecation policy is to deprecate a runtime when any major component of it (usually the language runtime, sometimes the operating system) reaches the end of community LTS and security updates are no longer available. After deprecation you **can still invoke your functions indefinitely**, but security patches and technical support stop.

| Phase | When | What happens |
|---|---|---|
| Deprecation notice period | At least **180 days** before deprecation | Email and Health Dashboard notifications. Affected functions are listed in the Health Dashboard Scheduled changes tab and in the Trusted Advisor check |
| Deprecation | Deprecation date | Security updates stop and functions are no longer eligible for technical support. **You can no longer create or update functions in the console**, but the AWS CLI, AWS SAM, and CloudFormation still work |
| Block function create | At least **30 days** after deprecation | Creation of new functions is blocked. You can still update code and configuration for existing functions through the CLI, SAM, or CloudFormation |
| Block function update | At least **60 days** after deprecation | Code and configuration updates for existing functions are blocked. You can still upgrade to a supported runtime, but rolling back to the deprecated runtime may be blocked |

Shared responsibility: Lambda curates and publishes security updates for supported managed runtimes and container base images, and applies them automatically by default. For functions deployed as container images, **you are responsible for rebuilding from the latest base image and redeploying**, and **deprecation notifications are not available** for container image functions. In all cases, updating your function code and its dependencies is your responsibility.

🆕 For new Regions, Lambda does not support runtimes that are set to be deprecated within the next 6 months.

> — Source: [Lambda runtimes — Runtime deprecation policy](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 3.6 The AWS SDK Included in the Runtime 🔄

Courseware slide 24 instructor notes state: "The runtimes for Python and Node.js include the SDK, so you don't need to bundle these SDKs with your code." **The premise is correct but the conclusion is the opposite of current guidance.**

| Item | Content |
|---|---|
| Fact | The Node.js, Python, and **Ruby** runtimes include a version of the AWS SDK |
| Current guidance 🔄 | To maintain full control of your dependencies and to **maximize backward compatibility** during automatic runtime updates, documentation recommends that you **always include the SDK modules your code uses (along with any dependencies) in your deployment package or in a Lambda layer** |
| When to use the included SDK | Only when you can't include additional packages in your deployment — for example when you create your function using the **Lambda console code editor** or using **inline function code in a CloudFormation template** |
| Updates | Lambda periodically updates the versions of the AWS SDKs included in these runtimes, and these updates can cause subtle changes in function behavior |

🆕 A concrete case where this matters in practice: **recursive loop detection** (see [Section 6.7](#67-recursive-loop-detection)) requires a minimum SDK version (Python `boto3` 1.24.46 and `botocore` 1.27.46 or higher), so detection does not work if the version included in the runtime is lower.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 4. AWS Lambda Invocation Models

### 4.1 Three Invocation Models

Courseware slide 12 presents three models side by side.

| Model | Slide label | Example sources |
|---|---|---|
| Synchronous (direct invocation) | `/order` → Amazon API Gateway → Lambda function | Amazon API Gateway |
| Asynchronous (push) | Event queue → Lambda function → destination | Amazon SNS, Amazon S3 |
| ESM — event source mapping (polling) | Source stream / source batch → event source mapping → Lambda function → destination | Amazon DynamoDB, Amazon Kinesis |

#### Synchronous Invocation (Direct Invocation)

Lambda runs the function and waits for a response. The function runs as soon as it is invoked. When the function finishes, Lambda returns the response from the function's code along with additional data such as the status code and the version of the function that ran. **This invocation model has no built-in retry.** You can invoke synchronously from the console, the AWS CLI, or the AWS SDKs, and many AWS services such as Amazon Cognito and Amazon API Gateway invoke Lambda functions synchronously.

Synchronous is the default. The `Invoke` API `InvocationType` defaults to `RequestResponse` and the response status code is 200.

#### Asynchronous Invocation (Push) 🔄

Lambda places the event in a queue, and a separate process reads events from the queue and runs the function. When the event is added to the queue, Lambda returns one of the following.

- A success response with no additional information (status code **202**)
- An error indicating that the event could not be added to the event queue

To invoke asynchronously from the CLI or an SDK, set `InvocationType` to `Event`.

```bash
# AWS CLI v2 requires the --cli-binary-format option
aws lambda invoke \
  --function-name my-function \
  --invocation-type Event \
  --cli-binary-format raw-in-base64-out \
  --payload '{ "key": "value" }' response.json
```

🔄 The `invoke` example on courseware slide 44 passes a JSON string directly to `--payload`. **AWS CLI version 2 requires `--cli-binary-format raw-in-base64-out`.** To make it the default, run `aws configure set cli-binary-format raw-in-base64-out`. The output file contains no information but is still created when you run the command, and if Lambda can't add the event to the queue the error message appears in the command output.

> — Source: [Invoking a Lambda function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html)

#### ESM — Event Source Mapping (Polling) 🆕

An event source mapping is a **Lambda resource** that reads items from stream and queue-based services and invokes a function with batches of records. It is generally designed for services that do not invoke Lambda functions directly. Resources called **event pollers** inside the ESM actively poll for new messages.

The seven services that use ESM are **an exact match between the courseware list and current documentation**.

| Service |
|---|
| Amazon DynamoDB |
| Amazon DocumentDB (with MongoDB compatibility) |
| Amazon Kinesis |
| Amazon MQ |
| Amazon Managed Streaming for Apache Kafka (Amazon MSK) |
| Self-managed Apache Kafka |
| Amazon SQS |

🆕 Here is the **batching behavior** the courseware does not cover. Lambda invokes your function when one of these three criteria is met.

| Criterion | Content |
|---|---|
| The batching window reaches its maximum | `MaximumBatchingWindowInSeconds` (0–300 seconds). The default is **0 seconds** for Kinesis, DynamoDB, and SQS, and **500 ms** for MSK, self-managed Kafka, Amazon MQ, and DocumentDB |
| The batch size is met | `BatchSize`. The minimum is 1; the default and maximum depend on the event source |
| The payload size reaches **6 MB** | You cannot modify this limit |

🆕 ESM processes each event **at least once** and duplicate processing can occur, so documentation strongly recommends making your function code **idempotent**. By default, if your function returns an error the ESM reprocesses the entire batch and pauses processing for the affected shard to ensure in-order processing. For stream sources (DynamoDB and Kinesis) you can configure the maximum number of retries, and you can also configure the ESM to send an invocation record to a destination when it discards a batch.

🆕 **Provisioned mode** is available for Amazon MSK, self-managed Kafka, and Amazon SQS. It lets you define minimum and maximum limits for dedicated polling resources, which auto-scale 3 times faster and provide 16 times higher capacity. Using provisioned mode incurs additional costs.

> — Source: [How Lambda processes records from stream and queue-based event sources](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html)

#### DynamoDB Stream Polling Rate

The courseware slide 12 note "Lambda polls the stream 4 times per second for new records" is still accurate. Documentation qualifies it as **"at a base rate of 4 times per second."**

🆕 Details the courseware does not cover:

- `ParallelizationFactor` (1–10, default 1) lets you process one shard with more than one concurrent Lambda invocation, and **in-order processing is still ensured at the item (partition and sort key) level**.
- Stream polling during ESM creation and updates is **eventually consistent**, so specifying `LATEST` as the starting position could miss events during creation or updates. Specify `TRIM_HORIZON` to ensure no events are missed.
- For single-Region tables you can design for up to **two** Lambda functions to read from the same DynamoDB Streams shard at the same time; for global tables the recommendation is **one**.

> — Source: [Using AWS Lambda with Amazon DynamoDB](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)

### 4.2 Function Invocation and Retries

All three values in the courseware slide 13 table **match current documentation**.

| Invocation | Retries |
|---|---|
| Synchronous | No retries (the service may retry depending on the error) |
| Asynchronous | Built-in retries (2) |
| Poll-based | Depends on the event source |

Supplementary detail from current documentation:

- Synchronous — When you invoke a function directly, Lambda does not automatically retry errors related to your function code and you decide the retry strategy. When an AWS service invokes synchronously, that service decides whether to retry. For example, Amazon S3 batch operations retries when the function returns a `TemporaryFailure` response code, and **API Gateway always relays the error response back to the requester**.
- Poll-based — ESMs that read from streams retry the **entire batch** of items, and repeated errors block processing of the affected shard, so monitor the `IteratorAge` metric to detect stalled shards. For ESMs that read from a queue, the **visibility timeout and redrive policy on the source queue** determine the time between retries and the destination for failed events.

### 4.3 Asynchronous Retry Behavior and Configuration 🔄

Courseware slide 12 instructor notes state "the number of retries and the retry interval are configurable." **What is configurable is the number of retries and the maximum event age; there is no parameter for the retry interval itself.**

| Situation | Behavior |
|---|---|
| The function returns an error | By default Lambda **retries twice more**, waiting **one minute** between the first two attempts and **two minutes** between the second and third. Function errors include errors returned by the function's code and runtime errors **such as timeouts** |
| Throttling (429) and system errors (500-series) | Lambda returns the event to the queue and retries for up to **6 hours by default**. The retry interval increases exponentially from 1 second after the first attempt to a maximum of 5 minutes. If the queue contains many entries, Lambda increases the retry interval and reduces the rate at which it reads events |
| When the queue is very long | New events might age out before Lambda sends them to your function. Events that expire or fail all processing attempts are **discarded** |
| Even without errors | The queue itself is **eventually consistent**, so your function might receive the same event multiple times. If the function can't keep up with incoming events, events might also be deleted from the queue without being sent to the function |

The two configurable settings:

| Setting | Content |
|---|---|
| `MaximumEventAgeInSeconds` | The maximum time Lambda keeps an event in the asynchronous event queue. In the console this is "Maximum age of event," **up to 6 hours** |
| `MaximumRetryAttempts` | The maximum number of times Lambda retries when the function returns an error. In the console this is "Retry attempts," **between 0 and 2** |

You configure these on a function, version, or alias. `put-function-event-invoke-config` **overwrites** any existing configuration, so use `update-function-event-invoke-config` to change only some options.

```bash
# Maximum event age of 1 hour and no retries
aws lambda put-function-event-invoke-config \
  --function-name error \
  --maximum-event-age-in-seconds 3600 \
  --maximum-retry-attempts 0
```

> — Source: [How Lambda handles errors and retries with asynchronous invocation](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html)

### 4.4 Invocation Record Destinations and the DLQ 🔄

The courseware lists **four** invocation record destinations (AWS Lambda, Amazon SNS, Amazon SQS, Amazon EventBridge) and states that "the best practice for asynchronous invocation is to create and use a DLQ." **Both differ from current documentation.**

There are now **five** destinations.

| Destination | Required execution role permission | Notes |
|---|---|---|
| Amazon SQS standard queue | `sqs:SendMessage` | Lambda passes the invocation record as the `Message` |
| Amazon SNS standard topic | `sns:Publish` | Passed as the `Message`. Amazon SNS has a 256 KB maximum message size, so delivery can fail when an asynchronous payload approaches 1 MB |
| **Amazon S3 bucket** 🆕 | `s3:PutObject`, `s3:ListBucket` | **On failure only.** Stored as a JSON object using the naming convention `aws/lambda/async/<function-name>/YYYY/MM/DD/...` |
| AWS Lambda function | `lambda:InvokeFunction` | The invocation record is passed as the payload |
| Amazon EventBridge event bus | `events:PutEvents` | Passed as the `detail`. `source` is `lambda` and `detail-type` is either "Lambda Function Invocation Result - Success" or "- Failure" |

You can configure separate destinations for successful and failed events. On failure sends a record when the event fails all processing attempts or exceeds the maximum age; On success sends a record when the function successfully processes an asynchronous invocation.

How the DLQ relates to on-failure destinations 🔄:

| Item | On-failure destination | DLQ |
|---|---|---|
| Position in current documentation | The primary path | An **alternative** to an on-failure destination |
| Configuration scope | Function, version, alias | **Function level only** |
| What it sends | An invocation record including details about the function's response | **Only the content of the event** (no response details) |
| Supported targets | SQS, SNS, S3, Lambda, EventBridge | SQS standard queue, SNS standard topic (FIFO not supported) |

The DLQ message attributes are `RequestID`, `ErrorCode` (the HTTP status code), and `ErrorMessage` (the first 1 KB of the error message). If Lambda can't send a message to the DLQ, it deletes the event and emits the `DeadLetterErrors` metric.

🆕 **If you're using Amazon SQS as an event source, configure a dead-letter queue on the Amazon SQS queue itself and not on the Lambda function.**

🆕 To prevent a function from triggering, you can set reserved concurrency to zero, but for an asynchronously invoked function that makes Lambda send new events to the configured DLQ or on-failure destination **without any retries**. To process the events that were sent during that time, you must consume them from the queue or destination.

> — Source: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

### 4.5 Execution Environment Lifecycle 🔄

The stages in the courseware slide 14 diagram: **download code → initialize environment (extensions, bootstrap runtime, run function initialization) → invoke (run function handler) → shut down (notify extensions, remove environment)**. The first two stages are labeled **cold start** and the invoke stage **warm start**. This flow corresponds to the phases in current documentation.

Here are the current phase names and details.

| Phase | Content |
|---|---|
| `Init` | Start all extensions (Extension init) → bootstrap the runtime (Runtime init) → run the function's static code (Function init) → (SnapStart only) before-checkpoint runtime hooks. 🆕 **The `Init` phase is limited to 10 seconds**, and if all three tasks do not complete within 10 seconds Lambda retries `Init` at the time of the first invocation using the configured function timeout (a suppressed init) |
| `Restore` 🆕 | **SnapStart only.** Resumes the execution environment from the persisted snapshot and runs any after-restore runtime hooks. If the runtime load and hooks do not complete within the 10-second limit, you get a `SnapStartTimeoutException` |
| `Invoke` | Runs the function handler. **The function's timeout setting limits the duration of the entire `Invoke` phase.** For example, with a 360-second timeout the function and all extensions must complete within 360 seconds. There is no independent post-invoke phase |
| `Shutdown` | Notifies extensions and removes the environment |

🆕 Each phase starts with an event that Lambda sends to the runtime and all registered extensions, and the runtime and each extension indicate completion with a `Next` API request. When all have completed and there are no pending events, Lambda **freezes** the execution environment.

🆕 The 10-second `Init` limit does not apply to functions using provisioned concurrency, SnapStart, or Lambda Managed Instances; their initialization code can run for up to 15 minutes (the limit is **130 seconds or the configured function timeout, whichever is higher**, up to 900 seconds).

🆕 If the function crashes or times out during the `Invoke` phase, Lambda resets the execution environment. The reset behaves like a `Shutdown` event and **does not clear the `/tmp` directory content before the next `Init` phase.** If a crash or timeout occurs during `Init`, Lambda emits error information in the `INIT_REPORT` log.

> — Source: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

The instructor note "AWS Lambda stores your code in Amazon S3 and encrypts the data at rest" is **correct about encryption at rest but the storage description has changed.** 🔄 Lambda always provides at-rest encryption for environment variables, files you upload (including deployment packages and layer archives), event source mapping filter criteria objects, and durable execution data. The storage location defaults to **Lambda-managed storage** (300 GB unzipped per account per Region), with **self-managed S3 code storage** using your own S3 bucket as an option. With self-managed storage, Lambda does not store a copy of your source code and encryption at rest is managed by your S3 bucket configuration.

> — Source: [Data encryption at rest for AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/security-encryption-at-rest.html)

### 4.6 Cold Starts and Warm Starts 🆕

The courseware defines both terms but does not say **how often or how long**.

| Item | Content |
|---|---|
| Cold start | The two steps of downloading code and setting up the environment. **You are charged for this time** and it adds latency to your overall invocation duration |
| Warm start | After the invocation completes the execution environment is frozen and Lambda retains it for a period of time. During that time, another request for the same function can reuse the environment |
| Frequency 🆕 | **Under 1% of invocations** |
| Duration 🆕 | **From under 100 ms to over 1 second** |
| Where it is common 🆕 | More common in **development and test functions**, which are invoked less frequently, than in production workloads |

🆕 Factors that affect static initialization (code outside the handler) latency are the size of the function package (imported libraries, dependencies, and **layers**), the amount of code and initialization work, and the performance of libraries and services in setting up connections. Documentation suggests importing only the libraries you need, lazily loading variables in the global scope when objects are used only in certain execution paths, and moving global variables used only for the lifetime of a single invocation into handler-local scope.

> — Source: [Understanding the Lambda execution environment lifecycle — Cold starts and latency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 4.7 Concurrency 🔄

The courseware slide 15 instructor notes align with current documentation.

- New invocation requests are handled by an available execution environment. If none is available or environments are busy, a new one is created to handle the request, and **this new environment does not share resources with other execution environments.**
- A runtime may be unavailable if it was terminated after a period without events.
- Execution time for all requests is limited to **15 minutes (900 seconds)**. The **default timeout is 3 seconds** and you can set any value between 1 and 900 seconds. Duration is counted from when the code starts running until it returns or otherwise ends, rounded up to the nearest millisecond.

🆕 The current concurrency definition and formula:

```text
Concurrency = (average requests per second) * (average request duration in seconds)
```

For example, a function averaging 200 ms that receives 5,000 requests per second at peak has a concurrency of `5,000 * 0.2 = 1,000`. The total concurrency limit per Region per account is **1,000 by default** and can be increased on request.

#### Reserved Concurrency and Provisioned Concurrency 🔄

The courseware covers only provisioned concurrency on slide 16 and mentions reserved concurrency only as "reserve some of that concurrency" in the slide 45 instructor notes. **The two controls serve different purposes.**

| Item | Reserved concurrency | Provisioned concurrency |
|---|---|---|
| What it sets | **Both the maximum and minimum** number of concurrent instances allocated to the function | The number of **pre-initialized** execution environment instances |
| Purpose | Guarantee concurrency for critical functions and prevent overwhelming downstream resources such as database connections | **Reduce cold start latency.** Designed for double-digit millisecond responses |
| Effect on other functions | Reserved concurrency cannot be used by any other function. The rest is shared from the unreserved pool | Reduces the unreserved pool (even when unused) |
| Charges | **No additional charge** | **Additional charges apply** |
| Applies to | The function | **Not `$LATEST`.** Only published versions or aliases pointing to versions |
| Upper bound | Counts toward the account concurrency limit | Unreserved account concurrency **minus 100** (the remaining 100 is for functions that aren't using reserved concurrency) |

You can allocate both for the same function, but **provisioned concurrency cannot exceed reserved concurrency.** With provisioned concurrency, Lambda runs initialization code at allocation time, so move as much initialization as possible outside the handler. Documentation recommends adding a **10% buffer** on top of the concurrency your function typically needs (220 for a peak of 200).

Configuration APIs: `PutProvisionedConcurrencyConfig`, `GetProvisionedConcurrencyConfig`, `ListProvisionedConcurrencyConfigs`, `DeleteProvisionedConcurrencyConfig`.

```bash
# Allocate 100 units of provisioned concurrency to the BLUE alias of my-function
aws lambda put-provisioned-concurrency-config --function-name my-function \
  --qualifier BLUE \
  --provisioned-concurrent-executions 100
```

> — Source: [Configuring provisioned concurrency for a function](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

#### Concurrency Scaling Rate 🔄

Courseware slide 50 calls this item **"burst concurrency"** and gives the value as "up to 1,000 concurrent executions per 10 seconds per function." **The number is right; the name changed.**

| Item | Content |
|---|---|
| Current name | **Concurrency scaling rate.** In the quota table it is the concurrency scaling limit |
| Value | For **each function** in each Region, 1,000 execution environment instances every 10 seconds (equivalently, 10,000 requests per second every 10 seconds) |
| Nature | A **function-level** limit, distinct from the account-level concurrency limit. Each function scales independently |
| Refill | Lambda makes a best attempt to refill the rate **continuously over time** rather than in one refill every 10 seconds |
| Accrual | **Unused portions do not accrue.** At any instant the rate is at most 1,000; not using it in one 10-second interval does not give you 2,000 in the next |
| When exceeded | If requests come in faster than the scaling rate or the function is at maximum concurrency, additional requests fail with a **throttling error (429)** |

> — Source: [Lambda scaling behavior](https://docs.aws.amazon.com/lambda/latest/dg/scaling-behavior.html)

### 4.8 Minimizing Cold Starts 1/2

The two approaches on courseware slide 16.

| Approach | Slide description |
|---|---|
| Schedule a Lambda function | Create a rule to run the function at a specific interval. Shape label: "EventBridge event (time-based trigger)" |
| Provisioned concurrency | Initialize a specified number of Lambda runtime environments. Shape label: "warm start (waiting for events)" |

The EventBridge scheduling document the courseware cites is still valid.

> — Source: [Tutorial: Schedule AWS Lambda functions using EventBridge](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-run-lambda-schedule.html)

The current definition and constraints of provisioned concurrency are in [Section 4.7](#47-concurrency). The constraint that **it cannot be applied to `$LATEST`** trips people up most often in labs. If your function has an event source, make sure that event source points to the alias or version that has provisioned concurrency configured; otherwise your function won't use the provisioned environments.

### 4.9 Minimizing Cold Starts 2/2 — Lambda SnapStart 🔄

**The courseware titles both slide 16 and slide 17 "Minimizing cold starts 1/2."** Slide 17 should be 2/2. This document splits the two sections as 1/2 and 2/2.

Courseware slide 17 body:

- Lambda SnapStart
- Improves startup performance by up to 10x
- Initializes the function when a new version is published
- Resumes the execution environment from a cached snapshot
- Available for the Java 11 and Java 17 managed runtimes

**The mechanism matches the courseware description.** When you publish a function version, Lambda initializes the function, takes a **Firecracker MicroVM snapshot** of the memory and disk state of the initialized execution environment, encrypts it, and caches it for low-latency access. On the first invocation of the version and as invocations scale up, Lambda resumes new execution environments from the cached snapshot instead of initializing from scratch. Lambda maintains several copies of each snapshot for resiliency and automatically patches them with the latest runtime and security updates.

Three things changed.

| Item | Courseware | Current |
|---|---|---|
| Supported runtimes 🔄 | Java 11 and Java 17 | **Java 11 and later, Python 3.12 and later, .NET 8 and later** |
| Performance wording 🔄 | "improves startup performance by up to 10x" | No multiplier. **"As low as sub-second startup performance"** |
| Pricing 🔄 | "at no additional cost" | **No additional cost for Java managed runtimes only.** Otherwise, snapshot caching charges (minimum 3 hours) and restoration charges apply |

🆕 Constraints the courseware does not cover:

- Other managed runtimes (for example `nodejs24.x`, `ruby4.0`), **OS-only runtimes, and container images are not supported.**
- **Provisioned concurrency, Amazon EFS, Amazon S3 Files, and ephemeral storage greater than 512 MB are not supported.**
- You can use SnapStart **only on published function versions and aliases that point to versions**, not on `$LATEST`.
- It works best with function invocations at scale; **functions that are invoked infrequently might not experience the same improvements.**
- Applications that depend on **uniqueness of state** must verify that function code is resilient to snapshot operations. If initialization code generates unique IDs, secrets, or entropy that gets included in the snapshot, that content will not be unique across execution environments. The state of connections established during initialization is not guaranteed either, so validate and re-establish them as needed.
- If strict cold start latency requirements can't be met by SnapStart, documentation directs you to **provisioned concurrency**.

> — Source: [Improving startup performance with Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

---

## 5. Permissions

### 5.1 The Two Categories of Permissions

The distinction on courseware slide 19.

| Permission type | Slide description |
|---|---|
| Invocation permission | Grant an event source permission to invoke Lambda / Update the resource policy associated with the Lambda function / Use the Lambda **`AddPermission`** API |
| Execution permission | Grant AWS Lambda permission to read from a stream / Update the execution role |

Courseware instructor notes:

- Invocation permission — The permissions an event source needs to communicate with the Lambda function. Depending on the invocation model (push or pull), you can grant these using the execution role or a resource policy (the access policy associated with the Lambda function).
- Execution permission — The permissions a Lambda function needs to access other AWS resources in your account. You grant these by creating an IAM role (the **execution role**).

Current documentation uses the same two categories.

| Category | Current documentation |
|---|---|
| Permissions the function needs | Defined in a special IAM role called the **execution role**. **Every Lambda function must have an execution role** and at a minimum it needs CloudWatch access (the `AWSLambdaBasicExecutionRole` managed policy) |
| Permissions others need to access the function | **Identity-based policies**, **resource-based policies**, or **ABAC** (attribute-based access control) using tags 🆕 |

🆕 Evaluation rule: when a user tries to access a Lambda resource, Lambda considers **both the user's identity-based policies and the resource's resource-based policy**. When an **AWS service** such as Amazon S3 calls your function, Lambda considers **only the resource-based policy**.

> — Source: [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html)

The `intro-permission-model.html` path the courseware cites now redirects to `lambda-permissions.html` (see [Section 10.3](#103-discouraged-or-end-of-support-items)).

### 5.2 The "No Explicit Permission Needed in the Same Account" Claim 🔄

Courseware slide 20 instructor notes state:

> Note: If your custom application and the Lambda function it invokes belong to the same AWS account, you don't need to grant explicit permissions.

**This is not accurate.** Current documentation states that the caller needs permission regardless of the account relationship. From the invocation troubleshooting document:

> Your user, or the role that you assume, must have permission to invoke a function. This requirement also applies to Lambda functions and other compute resources that invoke functions.

Without the permission you get this error:

```text
User: arn:aws:iam::123456789012:user/developer is not authorized to perform:
lambda:InvokeFunction on resource: my-function
```

The fix is to add the AWS managed policy **`AWSLambdaRole`** to your user, or add a custom policy that allows the `lambda:InvokeFunction` action on the target function. The IAM action name `lambda:InvokeFunction` refers to the `Invoke` Lambda API operation.

To summarize:

| Caller | What is required |
|---|---|
| An IAM user or role in the same account | `lambda:InvokeFunction` in an **identity-based policy**. A resource-based policy is not required |
| An IAM principal in a different account | Both — an identity-based policy plus the function's resource-based policy |
| An AWS service (S3, SNS, and so on) | The function's **resource-based policy** (Lambda evaluates only the resource-based policy in this case) |

Read charitably, the courseware statement could mean "in the same account you may not need to add a separate resource-based policy," but **the claim that no permission is needed at all is wrong.**

> — Source: [Troubleshoot invocation issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html)

### 5.3 Push or Direct Invocation Model

Courseware slide 20 diagram: event source → (1. push the event to AWS Lambda or invoke the Lambda function directly) → **resource policy** → Lambda → (2. process the event) → **IAM execution role** + permissions policy → services.

| Element | Courseware description |
|---|---|
| Resource policy | Grants other accounts and AWS services permission to use Lambda resources |
| IAM execution role | Grants the function permission to access AWS services and resources |
| Access policy | Grants the required resource permissions |

Using an Amazon S3 trigger as the example, current documentation says: to invoke your function, Amazon S3 needs permission from the function's **resource-based policy**. When you configure an Amazon S3 trigger in the Lambda console, the console modifies the resource-based policy to allow Amazon S3 to invoke the function if the bucket name and account ID match. If you configure the notification in Amazon S3 instead, you use the Lambda API to update the policy. If your function uses the AWS SDK to manage Amazon S3 resources, it also needs **Amazon S3 permissions in its execution role**.

🆕 When you create a trigger in the console, Lambda **automatically adds** the required permissions to the function's resource-based policy.

> — Source: [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 5.4 Ways to Configure a Resource-Based Policy 🔄

The courseware presents only the `AddPermission` API for granting invocation permission. Current documentation presents **two methods and recommends the full JSON policy.**

| Method | Tools | Characteristics |
|---|---|---|
| **Full JSON policy** 🆕 (recommended) | Console, CLI `put-resource-policy`, `PutResourcePolicy` API | You can use the **complete range** of IAM global condition keys, add multiple statements with multiple principals, and create explicit **`Deny`** statements. Maximum size **20 KB** |
| Individual permissions | Console, `AddPermission` API | Adds a single `Allow` statement. Condition keys are limited to `aws:SourceArn`, `aws:SourceAccount`, and `aws:PrincipalOrgID` |

A resource-based policy is a JSON document that defines `Principal` (the entity you grant permissions to), `Action` (the API actions to allow or deny), `Effect` (allow or deny), and `Resource` (the function, version, or alias). Optional elements include `Sid` and `Condition`.

🆕 **Overwrite warning**: `put-resource-policy` **replaces the entire** existing resource-based policy, including permissions created with `add-permission`. Conversely, `add-permission` appends a statement to the existing policy. To avoid unintentional overwrites, retrieve the existing policy and its `RevisionId` with `get-resource-policy` first and pass it via `--revision-id`.

```bash
# Retrieve the existing policy and its RevisionId
aws lambda get-resource-policy \
  --resource-arn arn:aws:lambda:us-east-2:123456789012:function:my-function

# Replace the policy, passing the RevisionId you retrieved
aws lambda put-resource-policy \
  --resource-arn arn:aws:lambda:us-east-2:123456789012:function:my-function \
  --policy file://policy.json \
  --revision-id a1b2c3d4-5678-90ab-cdef-EXAMPLE11111
```

🆕 Existing policies created with `AddPermission` continue to work without modification, and no changes to your function code are required.

Required IAM permissions:

| API action | Required permissions |
|---|---|
| `PutResourcePolicy` | `lambda:PutResourcePolicy`, `lambda:AddPermission`, `lambda:RemovePermission` |
| `GetResourcePolicy` | `lambda:GetResourcePolicy`, `lambda:GetPolicy` |
| `DeleteResourcePolicy` | `lambda:DeleteResourcePolicy`, `lambda:RemovePermission` |

> — Source: [Working with resource-based policies in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)

### 5.5 The `AddPermission` API 🆕

The courseware only names the API. Here are the parameters.

| Parameter | Required | Content |
|---|---|---|
| `FunctionName` (URI) | Yes | Function name (`my-function`), with alias (`my-function:v1`), function ARN, or partial ARN. Limited to 64 characters if you specify only the name |
| `Action` | Yes | The action the principal can use, for example `lambda:InvokeFunction` or `lambda:GetFunction` |
| `Principal` | Yes | The AWS service, AWS account, IAM user, or IAM role that invokes the function. For a service, narrow the scope with `SourceArn` or `SourceAccount` |
| `StatementId` | Yes | A statement identifier that differentiates the statement from others in the same policy (1–100 characters) |
| `Qualifier` (URI) | No | Add permissions to a published version or alias |
| `SourceArn` | No | The ARN of the AWS resource that invokes the function. Lambda configures the comparison using the `StringLike` operator |
| `SourceAccount` | No | The ID of the account that owns the resource. An S3 bucket can be deleted by its owner and recreated by another account, so use this together with `SourceArn` |
| `PrincipalOrgID` | No | Your AWS Organizations organization ID, to grant permissions to all accounts in the organization |
| `FunctionUrlAuthType` / `InvokedViaFunctionUrl` 🆕 | No | Related to function URLs (see [Section 6.14](#614-function-urls)) |
| `EventSourceToken` | No | A token for Alexa Smart Home functions |
| `RevisionId` | No | Update the policy only if the revision ID matches |

🆕 An important constraint: **Lambda does not support adding policies to version `$LATEST`.** Also, if you grant permission to a service principal without specifying the source, **other accounts could configure resources in their account to invoke your function**, so you must restrict it with `SourceArn` or `SourceAccount`.

On success the API returns HTTP 201 and the statement that was added. Key errors: `PolicyLengthExceededException` (the policy is too large), `PublicPolicyException` (the policy would grant public access), and `PreconditionFailedException` (`RevisionId` mismatch).

> — Source: [AddPermission (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_AddPermission.html)

### 5.6 The Execution Role 🆕

The courseware only says "you grant these permissions by creating an IAM role (the execution role)."

| Item | Content |
|---|---|
| Definition | An IAM role that grants the function permission to access AWS services and resources |
| Assumption | Lambda **automatically** assumes the execution role when it invokes your function. You should avoid calling `sts:AssumeRole` in your function code. Only if the role must assume itself do you include the role itself as a trusted principal in its trust policy |
| Trust policy | Must specify the Lambda service principal **`lambda.amazonaws.com`** as a trusted service |
| Default | When you create a function in the console, Lambda creates a minimal-permission execution role that includes `AWSLambdaBasicExecutionRole` (logging events to CloudWatch Logs) |
| Least privilege | Before publishing to production, adjust the policy to include only the required permissions. **IAM Access Analyzer** reviews your CloudTrail logs over a date range you specify and generates a policy template with only the permissions the function actually used |

```bash
# Create the execution role with a trust policy
aws iam create-role \
  --role-name lambda-ex \
  --assume-role-policy-document file://trust-policy.json

# Attach basic execution permissions
aws iam attach-role-policy --role-name lambda-ex \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

> — Source: [Defining Lambda function permissions with an execution role](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)

### 5.7 The ESM (Polling) Invocation Model and Managed Policies 🆕

Courseware slide 21 diagram: Lambda → (1. poll the event source) → event source / (2. process the event) → services, with an **IAM execution role** on both sides.

The core statement in the instructor notes — "you must grant AWS Lambda permission to read from the stream, which you do by updating the IAM execution role attached to the Lambda function" — matches current documentation, which says "when you use an event source mapping to invoke your function, Lambda uses the **execution role to read event data**."

🆕 Here are the managed policy names the courseware does not provide.

| Managed policy | Permissions granted |
|---|---|
| `AWSLambdaDynamoDBExecutionRole` | Read records from a DynamoDB stream and write to CloudWatch Logs |
| `AWSLambdaKinesisExecutionRole` | Read events from a Kinesis data stream and write to CloudWatch Logs |
| `AWSLambdaSQSQueueExecutionRole` | Read a message from an SQS queue and write to CloudWatch Logs |
| `AWSLambdaMSKExecutionRole` | Read and access records from an MSK cluster, manage ENIs, and write to CloudWatch Logs |
| `AWSLambdaBasicExecutionRole` | Upload logs to CloudWatch |
| `AWSLambdaVPCAccessExecutionRole` | Manage ENIs within an Amazon VPC and write to CloudWatch Logs |
| `AWSXRayDaemonWriteAccess` | Upload trace data to X-Ray |
| `CloudWatchLambdaInsightsExecutionRolePolicy` | Write runtime metrics to CloudWatch Lambda Insights |

🆕 For some features the Lambda console attempts to add missing permissions to your execution role in a customer managed policy, and these policies can become numerous, so **attach the relevant AWS managed policies before enabling features.** When a service assumes a role in your account, you can include the `aws:SourceAccount` and `aws:SourceArn` global condition context keys in the role trust policy to limit access to requests generated by expected resources (cross-service confused deputy prevention).

The `CreateEventSourceMapping` document path the courseware cites now redirects to the API Reference.

> — Source: [Working with AWS managed policies in the execution role](https://docs.aws.amazon.com/lambda/latest/dg/permissions-managed-policies.html)

---

## 6. Development

### 6.1 Development Options 🔄

Courseware slide 23 presents access points as **AWS Management Console / AWS CLI / AWS SDKs / development tools**, and lists the development tools as follows.

- AWS toolkits for IDEs
- WYSIWYG editor or upload a packaged .zip file
- Third-party plugins (**Eclipse**, PyCharm, Visual Studio)

**Of the three links the courseware cites, the AWS Toolkit for Eclipse User Guide URL returns HTTP 404, and `csharp-package-toolkit.html` no longer exists as its own page.** `/toolkit-for-eclipse/v1/user-guide/` and its `lambda.html` **redirect to the AWS Toolkit for JetBrains User Guide**.

Here are the tools the current Lambda development tools document presents.

| Category | Content |
|---|---|
| Local development | **AWS Toolkit for VS Code** — local function development, debugging, and testing with direct deployment to Lambda |
| IaC | **AWS SAM, AWS CDK, CloudFormation** |
| CI/CD 🆕 | **GitHub Actions** — automate Lambda deployments from your repository. The Deploy Lambda function action offers a declarative YAML interface and handles credentials through OIDC |
| Libraries 🆕 | **Powertools for AWS Lambda** — an open-source developer toolkit for Python, TypeScript/Node.js, Java, and .NET. Structured logging, tracing, metrics, parameter retrieval, secrets management, and idempotency patterns |
| Workflows and events 🆕 | Lambda **durable functions**, AWS Step Functions, Amazon EventBridge |

> — Source: [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html)

The PyCharm toolkit the courseware mentions is now part of the **AWS Toolkit for JetBrains**. The JetBrains toolkit includes toolkits for CLion (C and C++), GoLand (Go), IntelliJ (Java), WebStorm (Node.js), Rider (.NET), PhpStorm (PHP), PyCharm (Python), RubyMine (Ruby), and DataGrip (database management), and lets you create, update, run, and debug Lambda functions remotely and locally.

> — Source: [Working with the AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)

### 6.2 The Lambda Console Code Editor 🔄

Courseware slide 14 instructor notes say "you upload your code as a Lambda function or code directly in the Lambda code editor," and the quota table on slide 50 lists **"inline editing in the console: 3 MB"** under deployment package.

**There is no 3 MB item in the current quota table.** The conditions for using the code editor are these two:

| Condition | Content |
|---|---|
| Runtime | The function must use one of the **interpreted language runtimes** (Python, Node.js, or Ruby) |
| Size | The deployment package must be smaller than **50 MB (unzipped)** |

**Function code for functions with container image deployment packages cannot be edited directly in the console.** The console creates a Lambda function with a single source file, and for scripting languages you can edit that file and add more files. When you save your code the console creates a .zip file archive deployment package, and you apply the edits by choosing **Deploy** in the **DEPLOY** section.

🆕 Using layers reduces your package size and can unlock usage of the code editor (see [Section 6.11](#611-layers)).

> — Source: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 6.3 Planning a Lambda Function — Programming Model

The three columns on courseware slide 24.

| Item | Slide body |
|---|---|
| Programming model | Use processes, threads, `/tmp`, sockets / AWS SDKs |
| Stateless | Use external storage to persist data / No affinity with or access to the underlying infrastructure |
| Monitoring and logging | Request, error, and throttle metrics / Built-in logs to Amazon CloudWatch Logs / AWS X-Ray integration |

Courseware instructor notes:

- With AWS Lambda you can use common languages and operating system features such as creating additional threads and processes.
- Instead of creating or updating metrics inside your Lambda function code, use **AWS Lambda metrics and CloudWatch alarms**. You can configure alarms based on the expected Lambda function runtime.
- Use logging libraries and Lambda metrics and dimensions to identify application errors (ERR, ERROR, WARNING).

The statement about the bundled SDK contradicts current guidance, so it is covered separately in [Section 3.6](#36-the-aws-sdk-included-in-the-runtime).

### 6.4 AWS X-Ray Integration 🆕

The courseware only names the item "AWS X-Ray integration."

| Item | Content |
|---|---|
| Tracing modes | **`Active`** — Lambda automatically creates trace segments for function invocations and sends them to X-Ray. **`PassThrough`** — propagates only the tracing context to downstream services |
| Permissions | When you activate tracing in the console, Lambda adds the required permissions to the execution role. Otherwise, attach the **`AWSXRayDaemonWriteAccess`** policy to the execution role |
| Sampling | X-Ray doesn't trace all requests. The sampling rate is **1 request per second plus 5 percent of additional requests**, and you can't configure it per function |
| Segments | **2 segments per trace**: `AWS::Lambda` (preparing the execution environment — scheduling the MicroVM, creating or unfreezing an environment, downloading code and layers) and `AWS::Lambda::Function` (the work done by the function). An error on the `AWS::Lambda` segment means a Lambda service issue; an error on `AWS::Lambda::Function` means a function issue |
| Subsegments | Under the function segment: `Initialization`, `Invocation`, `Overhead` (plus `Restore` for SnapStart). You can extend the `Invocation` subsegment with the X-Ray SDK, but you can't access the function segment directly or record work done outside the handler invocation scope |
| Not supported | Functions with MSK, self-managed Apache Kafka, Amazon MQ (ActiveMQ and RabbitMQ), or Amazon DocumentDB **event source mappings do not currently support X-Ray tracing** |

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

### 6.5 Lambda Function: The Handler

Courseware slide 25 shapes: handler function (the function to run on invocation) / event object (the data sent on invocation) / context object (provides information about the current runtime environment).

The handler is a specific code method (Java, C#) or function (Node.js, Python) that you create and include in your package. You specify the handler when you create the Lambda function, and each supported language has its own requirements for defining and referencing the handler. The handler takes two arguments: the **event object** and the **context object (optional)**.

| Argument | Courseware description |
|---|---|
| Event object | Structure and content vary by event source. An event generated by API Gateway includes the path, query string, and request body, while an event Amazon S3 generates when a new object is created includes bucket and new object details |
| Context object | Content and structure vary by language runtime, but at a minimum it includes AWS RequestId, Timeout (time remaining), and Logging (CloudWatch Logs stream information) |

Best practices (courseware instructor notes):

- **Separate the Lambda handler (entry point) from your core logic.** This makes the function more unit-testable.
- **Don't use recursive code.** Recursive code can lead to unintended invocation volume and escalated costs (see [Section 6.7](#67-recursive-loop-detection)).

### 6.6 Example: Amazon S3 Event

The JSON on courseware slide 26 **matches the current official documentation example in field structure** (the courseware abbreviates some values with `…`). In the example below, only the `principalId` value is replaced with a placeholder. An IAM principal unique ID is not a secret, but it has the same shape as an access key and trips secret scanners. Every other value is as documented.

```json
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventSource": "aws:s3",
      "awsRegion": "us-east-2",
      "eventTime": "2019-09-03T19:37:27.192Z",
      "eventName": "ObjectCreated:Put",
      "userIdentity": { "principalId": "AWS:AIDA_EXAMPLE_PRINCIPAL_ID" },
      "requestParameters": { "sourceIPAddress": "205.255.255.255" },
      "responseElements": {
        "x-amz-request-id": "D82B88E5F771F645",
        "x-amz-id-2": "vlR7PnpV2Ce81l0PRw6jlUpck7Jo5ZsQjryTjKlc5aLWGVHPZLj5NeC6qMa0emYBDXOo6QBU0Wo="
      },
      "s3": {
        "s3SchemaVersion": "1.0",
        "configurationId": "828aa6fc-f7b5-4305-8584-487c791949c1",
        "bucket": {
          "name": "amzn-s3-demo-bucket",
          "ownerIdentity": { "principalId": "A3I5XTEXAMAI3E" },
          "arn": "arn:aws:s3:::lambda-artifacts-deafc19498e3f2df"
        },
        "object": {
          "key": "b21b84d653bb07b05b1e6b33684dc11b",
          "size": 1305107,
          "eTag": "b21b84d653bb07b05b1e6b33684dc11b",
          "sequencer": "0C0F6F405D6ED209E1"
        }
      }
    }
  ]
}
```

🆕 A caution the courseware does not include on slide 26: **if your function writes to the same bucket that triggers it, it can run in an infinite loop.** Use two buckets, or configure the trigger to apply only to a prefix used for incoming objects. Also, `s3.object.key` contains a **URL-encoded** object key name, so processing it as plain text throws a `NoSuchKey` error for names with spaces (`james beswick.jpg`).

> — Source: [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 6.7 Recursive Loop Detection 🆕

Courseware slide 25 instructor notes give only this guidance for recursive code:

> If you do accidentally use recursive code, immediately set the function concurrent execution limit to 0 to throttle all invocations to the function while you update the code.

**Lambda now detects certain types of recursive loops and stops them automatically.**

| Item | Content |
|---|---|
| Default behavior | When Lambda detects a recursive loop, it **stops your function being invoked and notifies you.** If your design intentionally uses recursive patterns, you can change the function configuration to allow recursive invocation |
| Detection method | Uses **AWS X-Ray tracing headers** to track events. It works without turning on X-Ray active tracing, is on by default for all AWS customers, and is **free** |
| Threshold | A sequence of invocations caused by the same triggering event is a **chain of requests**. If your function is invoked approximately **16 times** in the same chain, Lambda stops the next invocation in that chain. Invocations from other triggers are unaffected |
| Detection scope | Loops between your functions and **Amazon SQS, Amazon S3, and Amazon SNS**, plus **loops comprised only of Lambda functions** (invoking each other synchronously or asynchronously). When another service such as Amazon DynamoDB forms part of the loop, Lambda **can't currently detect and stop it** |
| SDK requirement | Detection requires a minimum SDK version: Python `boto3` 1.24.46 and `botocore` 1.27.46, Node.js SDK v2 2.1147.0 and v3 3.105.0, Java 8 and 11 2.17.135, Java 17 2.20.81, Java 21 2.21.24, .NET 3.7.293.0, Ruby 3.134.0, PHP 3.232.0, Go V2 SDK 1.57.0, or higher |
| Notifications | Health Dashboard (it can take up to 3.5 hours to appear) and email. CloudWatch metrics let you monitor the number of recursive invocations Lambda stopped |
| Stopped events | If you have an on-failure destination or DLQ configured, Lambda also sends the event from the stopped invocation there. Using **the same resource that invokes your function** as the destination creates another loop |

**The courseware's manual measure is still valid.** Loops involving services like DynamoDB are not detected, so documentation recommends combining setting reserved concurrency to zero with CloudWatch alarms, billing alarms, and AWS Cost Anomaly Detection.

> — Source: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

### 6.8 The Context Object 🔄

Courseware slide 27 lists the context members for three languages and **gives the default for the same "time remaining" item as 3 seconds for Python but 15 minutes for Java and .NET. This is an internal inconsistency in the courseware.**

All three context documents say only that the method **"returns the number of milliseconds left before the execution times out"** and **do not state a default.** The value is calculated against the timeout configured for the function, so there is no per-language default. The function timeout itself defaults to 3 seconds with a maximum of 900 seconds (15 minutes), so the Python figure appears to be the default and the Java and .NET figure the maximum, both mistranscribed.

Here are the three lists from current documentation. **The names match the courseware.**

| Python | Java | .NET (C#) |
|---|---|---|
| `get_remaining_time_in_millis` (method) | `getRemainingTimeInMillis()` | `RemainingTime` (`TimeSpan`) |
| `function_name` | `getFunctionName()` | `FunctionName` |
| `function_version` | `getFunctionVersion()` | `FunctionVersion` |
| `invoked_function_arn` | `getInvokedFunctionArn()` | `InvokedFunctionArn` |
| `memory_limit_in_mb` | `getMemoryLimitInMB()` | `MemoryLimitInMB` |
| `aws_request_id` | `getAwsRequestId()` | `AwsRequestId` |
| `log_group_name` | `getLogGroupName()` | `LogGroupName` |
| `log_stream_name` | `getLogStreamName()` | `LogStreamName` |
| `identity` (mobile apps) 🔄 | `getIdentity()` (mobile apps) | `Identity` (mobile apps) |
| `client_context` (mobile apps) 🔄 | `getClientContext()` (mobile apps) | `ClientContext` (mobile apps) |
| — | `getLogger()` | `Logger` |

🔄 **The courseware's Python list omits `identity` and `client_context`.** Current documentation includes both for Python: `identity` contains `cognito_identity_id` and `cognito_identity_pool_id`, and `client_context` contains `client.installation_id`, `client.app_title`, `client.app_version_name`, `client.app_version_code`, `client.app_package_name`, `custom`, and `env`.

🆕 The Java context object interface is in the **`aws-lambda-java-core`** library, and you can implement it to create a context class for testing. The Python context object is a class defined in the **Lambda runtime interface client**, and Powertools for AWS Lambda (Python) provides an interface definition for type hints.

```python
import time

def lambda_handler(event, context):
    # Log invocation and environment information from the context object
    print("Lambda function ARN:", context.invoked_function_arn)
    print("CloudWatch log stream name:", context.log_stream_name)
    print("CloudWatch log group name:", context.log_group_name)
    print("Lambda Request ID:", context.aws_request_id)
    print("Lambda function memory limits in MB:", context.memory_limit_in_mb)
    # Add a 1 second delay so you can see the time remaining decrease
    time.sleep(1)
    print("Lambda time remaining in MS:", context.get_remaining_time_in_millis())
```

> — Source: [Using the Lambda context object to retrieve Python function information](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html)

> — Source: [Using the Lambda context object to retrieve Java function information](https://docs.aws.amazon.com/lambda/latest/dg/java-context.html)

### 6.9 Example: Function Handlers

#### Python

The syntax and example on courseware slide 28.

```python
def handler_name(event, context):
    ...
    return some_value
```

```python
def my_handler(event, context):
    # Build a message from the data in the input event and return it
    message = 'Hello {} {}!'.format(event['first_name'],
                                   event['last_name'])
    return {
        'message': message
    }
```

🆕 The handler naming rule current documentation states: the handler name is derived from **the name of the file the handler function is in and the name of the function**. If the file is `lambda_function.py` and the function is `lambda_handler`, the handler is **`lambda_function.lambda_handler`**, which is the default handler name for functions created in the console.

🆕 JSON to Python type conversion: object→`dict`, array→`list`, number→`int` or `float`, string→`str`, Boolean→`bool`, null→`NoneType`.

> — Source: [Define Lambda function handler in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)

#### Java

The syntax and example on courseware slide 29.

```text
MyOutput output handlerName(MyEvent event, Context context)
{
    ...
}
```

```java
package example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Hello implements RequestHandler<Integer, String> {
    // The input type is an integer and the output type is a string
    public String myHandler(int myCount, Context context) {
        return String.valueOf(myCount);
    }
}
```

When you package this code with its dependencies and create the Lambda function, specify **`example.Hello::myHandler`** (`package.class::method-reference`) as the handler. The first handler parameter can be event data (published by an event source such as S3) or custom input that you supply.

The `com.amazonaws.services.lambda.runtime` package is the **`aws-lambda-java-core`** library, not AWS SDK for Java v1, and **current official examples use the same imports.** The courseware code is not out of date here.

#### C#

The syntax and example on courseware slide 30.

```text
myOutput HandlerName(MyEvent event, ILambdaContext context) {
    ...
}
```

```csharp
using Amazon.Lambda.Core;

// Specify the JSON serializer at the assembly level
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace SimpleLambda
{
    public class Function
    {
        public string FunctionHandler(string input, ILambdaContext context)
        {
            return $"Hello {input}!";
        }
    }
}
```

You define the Lambda function handler as an instance or static method in a class. To access the Lambda context object, define a parameter of type `ILambdaContext`. This interface gives you access to the current function's name, memory limit, remaining runtime, and logging information.

**`DefaultLambdaJsonSerializer` (SystemTextJson) is still used in the current official context documentation example.** The `csharp-handler.html` path the courseware cites is also still valid.

> — Source: [Define Lambda function handler in C#](https://docs.aws.amazon.com/lambda/latest/dg/csharp-handler.html)

### 6.10 Example: Lambda Function (Python) — Lab Code 🔄

The lab code on courseware slide 31.

```python
# Initialize outside the handler so the function is easier to unit test
dynamoDBResource = boto3.resource('dynamodb')
pollyClient = boto3.client('polly')
s3Client = boto3.client('s3')

def lambda_handler(event, context):
    # Pull user parameters from the event and the environment
    userId = event['userId']
    noteId = event['noteId']
    voiceId = event['voiceId']
    mp3Bucket = os.environ['MP3_BUCKET_NAME']
    ddbTable = os.environ['Notes_Table']
    # Get the note text from the database
    text = getNote(dynamoDBResource, ddbTable, userId, noteId)
    # Save an MP3 file locally using the output from Polly
    filePath = createMP3File(pollyClient, text, voiceId, noteId)
    # Host the file on S3, accessed through a presigned URL
    signedURL = hostFileOnS3(s3Client, filePath, mp3Bucket, userId, noteId)
    return signedURL
```

Slide annotations: pull information from the event / pull information from environment variables / separate the Lambda handler from your core logic.

**Initializing outside the handler is still the recommended pattern.** The current official Python example also initializes the SDK client and logger outside the handler, and documentation explains that this takes advantage of execution environment reuse to improve performance.

🔄 The first line, `boto3.resource('dynamodb')`, needs a caveat. The Resources page in the Boto3 documentation states:

> The AWS Python SDK team does not intend to add new features to the resources interface in boto3. Existing interfaces will continue to operate during boto3's lifecycle. Customers can find access to newer service features through the client interface.

Existing code keeps working, so **this is not a problem for the lab.** For new code, `boto3.client('dynamodb')` is the safer choice. Also, resource instances are **not thread safe** and should not be shared across threads or processes; create a new one per thread.

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 6.11 Layers

The descriptions on courseware slides 37 and 38 **mostly match current documentation.**

| Item | Courseware description | Current documentation |
|---|---|---|
| Format | A **.zip file archive** containing code other than business logic, such as libraries, custom runtimes, and other dependencies | Matches |
| Purpose | Share code across multiple versions of the same function or across functions. Reduces storage usage and keeps deployment packages small so they download faster during a cold start | Matches |
| Versions | **A deployed layer is an immutable version** and the version number increments each time a new layer is published | Matches. Creating a new layer produces version 1 and each published update increments the number. Each layer version is identified by a unique ARN and you must **specify the exact layer version** when adding it to a function |
| Count | **Up to 5 per function**, counting toward the standard Lambda deployment size limit | Matches |
| Sharing | Zipping dependencies as part of the build-deploy process makes it hard to share them with other functions, accounts, or third parties and to propagate changes | Matches |

🆕 Items the courseware does not cover:

- When you add a layer, Lambda extracts the layer contents into the **`/opt` directory** in the execution environment. All natively supported runtimes include paths to specific directories within `/opt`.
- **Layers work only with functions deployed as a .zip file archive.** For functions defined as a container image, you package your preferred runtime and all dependencies in the image (which is the same point as the slide 49 instructor note "container images do not use layers").
- A fifth reason to use layers: **locking an embedded SDK version.** The embedded SDKs might change without notice, so a layer with a specific version means the function always uses the layer version.
- **Layers are not recommended for Go and Rust functions.** Including dependencies with the compiled executable avoids loading additional assemblies during initialization, which is better for cold starts.

The shapes on courseware slide 38 present **AWS managed layers** and **partner or third-party layers** but do not name any. This document does not add names it could not verify (see [Section 10.5](#105-items-we-could-not-verify)).

> — Source: [Managing Lambda dependencies with layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)

### 6.12 Environment Variables 🔄

The description and command on courseware slide 32.

| Item | Content |
|---|---|
| Purpose | Adjust the function's behavior without updating code |
| Storage | Stored in the function's **version-specific configuration** and made available to the function / **Encrypted at rest** |

```bash
aws lambda update-function-configuration --function-name my-function \
  --environment "Variables={BUCKET=my-bucket,KEY=file.txt}"
```

The courseware description matches current documentation. Here is what to add.

| Item | Content |
|---|---|
| Total size limit 🆕 | **4 KB** for all environment variables associated with the function, in aggregate |
| Key rules 🆕 | Start with a letter and be at least two characters. Only letters, numbers, and the underscore (`_`). Names reserved by Lambda are not allowed |
| Version locking | You define them on the unpublished version, and when you publish a version they are **locked** for that version |
| Evaluation 🆕 | Environment variables are **not evaluated before invocation.** Any value you define is treated as a literal string, so perform variable evaluation in your function code |
| **Overwrite warning** 🆕 | When you apply environment variables with `update-function-configuration`, the **entire contents of the `Variables` structure is replaced.** To retain existing variables when adding a new one, include all existing values in your request |
| Sensitive information 🆕 | For database credentials, API keys, and authorization tokens, documentation recommends **AWS Secrets Manager** instead of environment variables |

🔄 **The overwrite warning directly affects the courseware slide 35 example.** If slide 34 sets `TABLE_NAME` and slide 35 specifies only `MP3_BUCKET_NAME` and `Notes_Table`, `TABLE_NAME` **disappears.** To retain existing values, read the current configuration with `get-function-configuration` and pass them all, and pass the `RevisionId` from that output to `update-function-configuration` to ensure values don't change between when you read and when you update.

Details on encryption at rest 🆕:

| Item | Content |
|---|---|
| Default (server-side) | Lambda **always** provides at-rest encryption with an AWS KMS key. The default is an **AWS managed key** that Lambda creates in your account and manages permissions for, and **you are not charged to use it** |
| Customer managed key | Choose this to control rotation of the KMS key or to meet your organization's requirements. Then **only users in your account with access to that KMS key** can view or manage the function's environment variables, and standard AWS KMS charges apply |
| In transit (client-side) | Enabling helpers for encryption in transit encrypts environment variables client-side. The function needs the `kms:Decrypt` permission |
| Required KMS permissions | `kms:ListAliases` to view keys in the console, `kms:CreateGrant` and `kms:Encrypt` to configure a customer managed key on a function, `kms:Decrypt` to view and manage encrypted environment variables |

> — Source: [Working with Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

> — Source: [Securing Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html)

### 6.13 arm64 (Graviton2) Architecture 🆕

The courseware does not cover instruction set architecture selection. **All supported runtimes now support both x86_64 and arm64.**

| Item | Content |
|---|---|
| Choices | **arm64** (64-bit ARM for the AWS Graviton2 processor), **x86_64** |
| Benefits | arm64 functions can achieve **significantly better price and performance** than the equivalent x86_64 function. Consider it for compute-intensive workloads such as high-performance computing, video encoding, and simulation. Graviton2 provides a larger L2 cache per vCPU, which improves latency for web and mobile backends, microservices, and data processing systems, and also improves encryption performance |
| Migration requirements | The deployment package must contain only open-source components and source code you control, and each third-party library or package must provide an **arm64 version** |
| Code compatibility | Code added through the embedded code editor probably runs on either architecture without modification. Uploaded code must be replaced with code compatible with the target architecture, and you must **check each layer and extension** for compatibility. Container image functions require a new image |
| Deployment approach | Documentation recommends using alias routing configuration (weighted aliases) to split traffic between the x86 and arm64 versions and compare performance and latency |
| Default | If you don't specify `Architectures` in `CreateFunction`, the default is **`x86_64`** |

> — Source: [Selecting and configuring an instruction set architecture for your Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html)

### 6.14 Function URLs 🆕

The courseware presents only Amazon API Gateway as the HTTP request path. **There are now two ways to invoke Lambda over HTTP.**

| Item | Content |
|---|---|
| Definition | A dedicated HTTP(S) endpoint for your Lambda function |
| Format | `https://<url-id>.lambda-url.<region>.on.aws`. Once created, the **endpoint never changes** |
| Networking | Dual stack-enabled, supporting IPv4 and IPv6. Accessible **only through the public internet**; AWS PrivateLink is not supported |
| Security | Uses **resource-based policies** for access control and supports CORS. The auth type is `AWS_IAM` or `NONE` |
| Applies to | Any function **alias** or the `$LATEST` unpublished version. You can't add a function URL to any other function version |
| Configuration | CLI `create-function-url-config`, CloudFormation `AWS::Lambda::Url` resource |

```bash
# Add an IAM-authenticated function URL to the prod alias
aws lambda create-function-url-config \
    --function-name my-function \
    --qualifier prod \
    --auth-type AWS_IAM
```

Setting the auth type to `NONE` bypasses IAM authentication and creates a **public endpoint that anyone can invoke**. Unless this is a lab or demo, use `AWS_IAM`, and when you do use `NONE`, be sure you know what you are exposing.

> — Source: [Creating and managing Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)

### 6.15 Response Streaming 🆕

The courseware does not cover response streaming.

| Item | Content |
|---|---|
| Paths | Lambda function URLs, the `InvokeWithResponseStream` API (SDK or direct API calls), and the Amazon API Gateway proxy integration |
| Payload | Streaming responses can return payloads up to **200 MB**, compared to the 6 MB maximum for buffered responses |
| Bandwidth | The first **6 MB is uncapped**; beyond that, a maximum of **2 MBps** |
| Benefits | Improves **time to first byte (TTFB)**. Your function doesn't need to fit the entire response in memory, which for very large responses can reduce the memory you need to configure |
| Supported runtimes | Among managed runtimes, **Node.js only**. For other languages including Python, use a custom runtime with a custom Runtime API integration or the Lambda Web Adapter |
| Caution | Streaming responses incur cost and **are not interrupted or stopped when the invoking client connection is broken.** You are billed for the full function duration, so be careful configuring long timeouts |
| Console testing | When testing through the console you'll **always see responses as buffered** |
| VPC | In a VPC environment, function URLs do not support response streaming; use the `InvokeWithResponseStream` API with an interface VPC endpoint for Lambda |

> — Source: [Response streaming for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)

### 6.16 Using the Lambda API

The four APIs on courseware slide 33. **All four names and behaviors are still current.**

| API | Slide description |
|---|---|
| `CreateFunction` | Creates a Lambda function from a deployment package. The package type can be **ZIP or a container image** |
| `UpdateFunctionCode` | Updates the Lambda function's code. **After you create a version, you can't modify code that is already deployed** |
| `UpdateFunctionConfiguration` | Modifies the **version-specific settings** of a Lambda function |
| `Invoke` | Invokes a Lambda function synchronously or asynchronously |

🆕 Current details on `CreateFunction`:

| Item | Content |
|---|---|
| Required parameters | `Code`, `FunctionName`, `Role` |
| Container image | Set `PackageType` to `Image` and specify the Amazon ECR image URI in `Code`. **You do not need to specify `Handler` or `Runtime`** |
| .zip archive | Set `PackageType` to `Zip`, specify the .zip location in `Code`, and **you must specify `Handler` and `Runtime`** |
| Architecture | The deployment package code must be compatible with the target architecture, and if `Architectures` is omitted the default is `x86_64` |
| Function state | When you create a function, Lambda provisions an instance and supporting resources. If the function connects to a VPC this can take a minute or so, during which you can't invoke or modify it. Check `State`, `StateReason`, and `StateReasonCode` in the `GetFunctionConfiguration` response |
| Other parameters | `Environment`, `EphemeralStorage`, `Layers`, `MemorySize`, `Timeout`, `SnapStart`, `TracingConfig`, `VpcConfig`, `LoggingConfig`, `CodeSigningConfigArn`, `DurableConfig`, `CapacityProviderConfig`, `TenancyConfig`, and more |
| Code signing | You can use code signing with .zip deployment packages. If you specify a code-signing configuration ARN, Lambda checks for a valid signature from a trusted publisher on `UpdateFunctionCode` |

> — Source: [CreateFunction (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html)

### 6.17 Creating a Lambda Function (AWS CLI) 🔄

The command on courseware slide 34. **There are two problems with it.**

```bash
# Courseware slide 34 (as printed, with problems)
aws lambda create-function --function-name dictate-function --handler app.lambda_handler \
  --runtime python3.8 -–role arn:aws:iam::563926481938:role/lambdaPollyRole \
  --environment Variables={TABLE_NAME=$notesTable} --zip-file fileb://dictate-function.zip
```

| Problem | Content |
|---|---|
| 🔄 `-–role` | Typeset with a **single hyphen plus an en dash (`–`)** instead of two hyphens, so the shell won't recognize it if you copy it verbatim. Every other flag on the same slide uses two hyphens. This is a typesetting error in the courseware |
| 🔄 `python3.8` | **Reached end of support on October 14, 2024.** Function creation is blocked from February 1, 2027, and function updates from March 3, 2027 |

The corrected form:

```bash
# Corrected: --role with two hyphens and a currently supported runtime
aws lambda create-function --function-name dictate-function \
  --handler app.lambda_handler \
  --runtime python3.13 \
  --role arn:aws:iam::563926481938:role/lambdaPollyRole \
  --environment Variables={TABLE_NAME=$notesTable} \
  --zip-file fileb://dictate-function.zip
```

**What you must specify to create a .zip function with the CLI** (current documentation):

| Parameter | Content |
|---|---|
| `--function-name` | The name of your function |
| `--runtime` | Your function's runtime |
| `--role` | The ARN of your function's execution role |
| `--handler` | The name of the handler method in your function code |
| .zip location | Locally, `--zip-file fileb://myFunction.zip`; from S3, `--code S3Bucket=...,S3Key=...,S3ObjectVersion=...` |

In the AWS CLI, the string `fileb://` indicates that the file data is a **binary object**. The courseware and current documentation agree on this point.

🆕 **If your .zip file is smaller than 50 MB you can upload it from your local build machine; for larger files you must upload from an Amazon S3 bucket.** If you upload from S3 using the CLI, the bucket must be in the **same Region** as your function. For reference, the current official example uses `python3.14`.

The `"MemorySize": 128` in the courseware slide 34 response is still the default memory value. Documentation describes 128 MB as the **lowest possible and default setting**, recommended only for simple functions that transform and route events (see [Section 7.2](#72-testing-goals-and-the-memory-cpu-relationship)).

> — Source: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 6.18 Updating Function Configuration (AWS CLI)

The command on courseware slide 35.

```bash
aws lambda update-function-configuration --function-name dictate-function \
  --environment Variables="{MP3_BUCKET_NAME=$apiBucket,Notes_Table=$notesTable}"
```

With `update-function-configuration` you can change configuration details such as memory, timeout, and environment variables. Here is what current documentation covers with this command, at a minimum.

| Target | Option |
|---|---|
| Memory | `--memory-size 1024` |
| Ephemeral storage | `--ephemeral-storage '{"Size": 1024}'` |
| Environment variables | `--environment "Variables={...}"` |
| Encryption key | `--kms-key-arn arn:aws:kms:...` |
| DLQ | `--dead-letter-config TargetArn=arn:aws:sns:...` |

**Remember that the environment variable structure is replaced in its entirety** (see [Section 6.12](#612-environment-variables)).

### 6.19 Versions and Aliases 🔄

Courseware slide 36 diagram: version 1 / version 2 / version `$Latest`, and two alias ARNs (`...:dictate-function:Prod`, `...:dictate-function:Test`). On the API Gateway side there is `stageVariables.useAlias = Test` and `...:dictate-function:${stageVariable.useAlias}`, with the stage variable `${}` substituted at runtime.

The instructor notes match current documentation.

- Publishing a new version increments the version number and preserves the previous version. Each version has a unique ARN.
- An alias is like a pointer to a specific function version and can be updated to point to a different version.
- Aliases let you avoid hard-coding a specific version into your application.

```bash
# Publish a new version
aws lambda publish-version --function-name my-function

# Create an alias that points to a specific version
aws lambda create-alias --function-name my-function --name alias-name \
  --function-version version-number --description " "
```

🔄 Notation difference: the courseware writes `$Latest`, while documentation writes **`$LATEST`**.

🆕 The exact scope of version immutability:

| Item | Content |
|---|---|
| Immutable | The published version's **code, runtime, architecture, memory, layers, and most other configuration settings** |
| Configurable even on a published version | **Triggers, destinations, provisioned concurrency, asynchronous invocation settings, and database connections and proxies** |
| Version numbers | Lambda assigns **monotonically increasing** sequence numbers and **never reuses** them, even after you delete and recreate a function |
| Publishing condition | A new version is published **only if the code has never been published or has changed** from the last published version. If nothing changed, the version stays at the last published one |
| ARNs | A **qualified ARN** (with a version suffix) and an **unqualified ARN** (without). You **can't create an alias** from an unqualified ARN, and invoking with an unqualified ARN implicitly invokes `$LATEST` |
| Changes that qualify for version publication | Function code, environment variables, runtime, handler, layers, memory size, timeout, VPC configuration, DLQ configuration, IAM role, description, architecture, ephemeral storage size, package type, code storage mode, logging configuration, file system configuration, SnapStart, tracing configuration. **Operational settings such as reserved concurrency don't trigger publication** |

> — Source: [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

### 6.20 Weighted Aliases and Canary Deployments 🆕

The courseware covers only pointing an alias at a specific version. **A single alias can now split traffic between two versions.**

| Item | Content |
|---|---|
| Purpose | Expose a new version to only a portion of traffic and roll back quickly if needed — a **canary deployment**. Unlike blue/green, traffic is not switched all at once |
| Constraints | An alias can point to a **maximum of two** function versions. Both versions must have the **same execution role**, the **same DLQ configuration or none**, and **both must be published** (`$LATEST` is not allowed) |
| Setting weights | In the console, the weight (%) you give the additional version leaves the residual weight for the first version (10% for the additional version means 90% for the first) |
| Distribution | Lambda uses a **simple probabilistic model**, so at low traffic levels you might see a high variance between configured and actual percentages. Functions using provisioned concurrency can avoid spillover invocations by configuring more instances while alias routing is active |
| Determining the invoked version | The `START` log entry in CloudWatch Logs (`Version: 2`) and the **`x-amz-executed-version`** header on synchronous responses. For alias invocations, filter metrics by the `ExecutedVersion` dimension |

```bash
# Create an alias pointing to version 1 and send 3% of traffic to version 2
aws lambda create-alias \
  --name routing-alias \
  --function-name my-function \
  --function-version 1 \
  --routing-config AdditionalVersionWeights={"2"=0.03}

# Increase traffic to version 2 to 5%
aws lambda update-alias \
  --name routing-alias \
  --function-name my-function \
  --routing-config AdditionalVersionWeights={"2"=0.05}

# Shift all traffic. This also resets the routing configuration
aws lambda update-alias \
  --name routing-alias \
  --function-name my-function \
  --function-version 2 \
  --routing-config AdditionalVersionWeights={}
```

🆕 You can automate a **rolling deployment** with AWS CodeDeploy and AWS SAM. AWS SAM creates the alias (`AutoPublishAlias`), detects new code and publishes a version, and CodeDeploy shifts traffic according to `DeploymentPreference` (for example `Linear10PercentEvery2Minutes`, which shifts an additional 10 percent every 2 minutes) and rolls back if needed.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  myDateTimeFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: myDateTimeFunction.handler
      Runtime: nodejs24.x
      # Creates a live alias and automatically publishes a new version on code changes
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Linear10PercentEvery2Minutes
```

> — Source: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

---

## 7. Testing

### 7.1 Testing and Debugging

Courseware slide 40 shapes: deployment package (function code) + layer 1, layer 2 → test and debug the application. Upload the deployment package, separate the dependencies you want to share and upload them as layers, and you can test your function code more effectively.

### 7.2 Testing Goals and the Memory-CPU Relationship

The three goals on courseware slide 41.

- **Performance test** the Lambda function's memory
- **Load test** the Lambda function's timeout
- Understand Lambda **quotas**

The instructor note "as memory size increases, the CPU capacity available to the function increases correspondingly" **matches current documentation.**

| Item | Content |
|---|---|
| Proportional relationship | Lambda allocates CPU power **in proportion to the memory configured** |
| Reference point 🆕 | **At 1,769 MB a function has the equivalent of one vCPU** (one vCPU-second of credits per second) |
| Range | 128 MB to 10,240 MB in **1-MB increments** |
| Default | **128 MB.** The lowest possible setting, recommended only for simple functions that transform and route events |
| When to increase | Functions that use imported libraries, Lambda layers, Amazon S3, or Amazon EFS can perform better with more memory. If a function is CPU, network, or memory-bound, increasing memory can dramatically improve performance |
| How to find the right value 🆕 | Monitor with CloudWatch and set alarms when memory consumption approaches the configured maximum. For CPU-bound and IO-bound functions, monitor duration as well. You can also use the open-source **AWS Lambda Power Tuning** tool (which uses Step Functions to run concurrent versions at different memory allocations and measure performance) or **AWS Compute Optimizer** memory recommendations (x86_64 functions only) |

A function's memory usage is determined per invocation and visible in CloudWatch Logs. Analyze how long the function runs to determine the optimal timeout value, which matters especially when the function makes network calls to resources that may not handle Lambda's scaling.

The `limits.html` path the courseware cites now redirects to `gettingstarted-limits.html`.

> — Source: [Configure Lambda function memory](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html)

### 7.3 Ways to Test a Lambda Function 🔄

The four methods on courseware slide 42.

| Method | Courseware description |
|---|---|
| AWS Management Console | Event templates / custom payloads / use CloudWatch Logs (log group or log stream) |
| AWS CLI | Invoke a function or a specific function version / monitor through CloudWatch Logs |
| AWS SDKs | AWS Toolkits and IDEs. **Run the function locally or remotely. Running it locally requires configuring a runtime environment** |
| AWS SAM | Use AWS SAM with AWS Toolkits and a debugger to test and debug locally / provision resources consistently across environments |

#### Console Test Events 🆕

When you run a test in the console, Lambda invokes your function **synchronously** with the test event. If your function doesn't require input, use an empty document `{}`. There are two kinds the courseware does not cover.

| Kind | Content |
|---|---|
| Private | Available **only to the event creator** and requires no additional permissions. You can save up to **10 per function** |
| Shareable 🆕 | Can be **shared with other users in the same AWS account**, who can edit them and invoke your function with them. Saved as schemas in an Amazon EventBridge schema registry named `lambda-testevent-schemas`, so you need permissions for **all** the relevant EventBridge schema registry API operations |

Choosing **Test** before saving creates an unsaved test event that Lambda preserves only for the duration of the session. For the Node.js, Python, and Ruby runtimes you can also create and run tests from the **TEST EVENTS** section on the **Code** tab. AWS SAM's `sam remote test-event` can invoke shareable test events.

🆕 Saving edits to a shareable test event **overwrites** that event. Deleting a function does not delete its associated shareable test event schemas, so clean those up manually from the EventBridge console.

> — Source: [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)

#### AWS SAM Local Testing 🆕

The courseware only says "use AWS SAM with AWS Toolkits and a debugger to test and debug locally." `sam local` has four subcommands.

| Subcommand | Purpose |
|---|---|
| `sam local generate-event` | Generate AWS service events for local testing |
| `sam local invoke` | Initiate a **one-time** invocation of a Lambda function locally |
| `sam local start-api` | Run your Lambda functions using a local HTTP server |
| `sam local start-lambda` | Run your Lambda functions using a local HTTP server for use with the AWS CLI or SDKs |

Before using `sam local` you need the AWS SAM prerequisites and the AWS SAM CLI installed, and a basic understanding of `sam init`, `sam build`, and `sam deploy` is recommended.

> — Source: [Introduction to testing with the sam local command](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local.html)

### 7.4 Invoking a Lambda Function (CLI) 🔄

The CLI syntax on courseware slide 43.

```text
invoke
--function-name <value>
[--invocation-type <value>]
[--log-type <value>]
[--client-context <value>]
[--payload <value>]
[--qualifier <value>]
<outfile>
```

The courseware's parameter descriptions **match current documentation.** Here are the details filled in.

| Parameter | Content |
|---|---|
| `--function-name` | Function name (`my-function`), with alias (`my-function:v1`), function ARN, or partial ARN (`123456789012:function:my-function`). Limited to 64 characters if you specify only the name |
| `--invocation-type` | `RequestResponse` (**default**, synchronous) / `Event` (asynchronous) / `DryRun` (validates parameter values and verifies invoke permission without running the function) |
| `--log-type` | `None` or `Tail`. `Tail` includes the execution log in the response and **applies to synchronously invoked functions only.** The `X-Amz-Log-Result` response header contains the **last 4 KB of the execution log, base64-encoded** |
| `--client-context` | Information about the invoking client. Up to **3,583 bytes of base64-encoded data**, and Lambda passes the object to your function **only for synchronous invocations** 🆕 |
| `--payload` | The JSON input to your function. Enter it directly as `'{ "key": "value" }'` or give a file path as `file://payload.json`. **Maximum 6 MB synchronous, 1 MB asynchronous** 🔄 |
| `--qualifier` | A version number or alias. To invoke the latest version, qualify the ARN with `$LATEST` or leave it unqualified |
| `<outfile>` | The name of the file to save the output to |

Response status codes 🆕: `RequestResponse` **200**, `Event` **202**, `DryRun` **204**.

Response headers:

| Header | Content |
|---|---|
| `X-Amz-Function-Error` | If present, indicates that **an error occurred during function execution**, with details in the response payload |
| `X-Amz-Log-Result` | The last 4 KB of the execution log, base64-encoded |
| `X-Amz-Executed-Version` | The version of the function that executed. When you invoke with an alias, this indicates which version the alias resolved to |

This operation requires the **`lambda:InvokeFunction`** permission.

> — Source: [Invoke (Lambda API Reference)](https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html)

### 7.5 Example: Invoking a Function 🔄

The command and output on courseware slide 44.

```bash
# Courseware slide 44 (AWS CLI v2 needs one more option)
aws lambda invoke --function-name dictate-function \
  --payload '{"UserId": "newbie","NoteId": "2","VoiceId": "Joey"}' response.txt
```

```json
{
  "ExecutedVersion": "$LATEST",
  "StatusCode": 200
}
```

The response is captured in a file, and `response.txt` holds the location of the MP3 file.

🔄 **AWS CLI version 2 requires `--cli-binary-format raw-in-base64-out`.**

```bash
# Corrected: add the binary format option for CLI v2
aws lambda invoke --function-name dictate-function \
  --cli-binary-format raw-in-base64-out \
  --payload '{"UserId": "newbie","NoteId": "2","VoiceId": "Joey"}' response.txt
```

You can make it the default with `aws configure set cli-binary-format raw-in-base64-out`.

> — Source: [Invoking a Lambda function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html)

### 7.6 Error Handling 🔄

The two columns on courseware slide 45. **The two categories and the header name match current documentation.**

| Category | Courseware body |
|---|---|
| Invocation errors | Response error codes: **400 or 500 series**. Common error types — request (too large or invalid) / caller (not authorized) / account (maximum function instances reached, too many requests — concurrent execution limit of 1,000) |
| Function errors | Response header: **`X-Amz-Function-Error`**. Function error (determines your error handling strategy) / runtime error (timeout, syntax error) |

🆕 An important fact the courseware does not state: **when your function code or the Lambda runtime returns an error, the status code in the response is 200 OK.** The presence of an error is indicated only by the `X-Amz-Function-Error` header. The 400 and 500-series status codes are **reserved for invocation errors**. In other words, judging success by a 200 status code alone will miss function errors.

Where to find errors:

| Invocation method | Where errors appear |
|---|---|
| Direct invocation | In the response from Lambda |
| Asynchronous, ESM, or through another service | **Logs, a dead-letter queue, or an on-failure destination** |

🔄 The concurrent execution limit of 1,000 is still the **default quota**, but two things changed.

- You can **request an increase** to tens of thousands.
- **New AWS accounts start with reduced concurrency and memory quotas** that AWS raises automatically based on your usage.

The instructor note that **code must be idempotent** if your system relies on retries is still valid, and the ESM documentation states that event source mappings process each event at least once and duplicate processing can occur, so making function code idempotent is **strongly recommended**.

🆕 Two invocation errors you'll see often:

| Error | Cause and response |
|---|---|
| `Sandbox.Timedout` (Init phase timeout) | When the `Init` phase times out, Lambda re-runs `Init` on the next invocation request (a suppressed init). With a short timeout such as 3 seconds, `Init` can time out again or leave too little time for `Invoke`. Extend the timeout, increase memory (which increases CPU proportionally), or optimize initialization code |
| `lambda:InvokeFunction not authorized` | The caller lacks the `lambda:InvokeFunction` permission (see [Section 5.2](#52-the-no-explicit-permission-needed-in-the-same-account-claim)) |

> — Source: [Troubleshoot execution issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/python-exceptions.html)

---

## 8. Deployment

### 8.1 Packaging Considerations

The three principles on courseware slide 47.

- Control the dependencies in your function's deployment package.
- Minimize the deployment package size to its runtime necessities.
- Minimize the complexity of your dependencies.

Lambda supports two types of deployment package: **container images** and **.zip file archives**.

Details from the courseware instructor notes:

| Principle | Content |
|---|---|
| Control dependencies | The Lambda runtime environment includes a number of libraries such as the AWS SDK for the Node.js and Python runtimes. Lambda **updates these libraries periodically** and these updates can introduce **subtle changes** in function behavior, so to have full control over your dependencies, package all of them in your deployment package |
| Minimize size | Reducing size shortens the time to download and unpack the package before invocation. For functions written in Java or .NET, don't upload the entire AWS SDK library; instead selectively depend on the modules you need (DynamoDB, Amazon S3 SDK modules, Lambda core libraries) |
| Minimize complexity | Aim for simpler frameworks that load quickly on execution context startup. For example, use a simpler Java dependency injection (IoC) framework such as Dagger or Guice rather than Spring Framework |

**The dependency control principle points in the same direction as current guidance** (see [Section 3.6](#36-the-aws-sdk-included-in-the-runtime)). Current documentation presents it as the default recommendation rather than the exception, and also offers **Lambda layers** as an alternative to the deployment package.

### 8.2 Deploying .zip File Archives

The table on courseware slide 48.

| .zip deployment by language | Node.js, Python, Ruby | Java | .NET Core |
|---|---|---|---|
| Target | A ZIP archive of code and dependencies | A ZIP file with all code and dependencies, or a standalone `.jar` | A ZIP file with all code or dependencies, or a standalone `.dll` |
| How | Install libraries using npm, pip, or other build/packaging tools | Use Maven, the Eclipse IDE plugin, or other build/packaging tools | Use Nuget, the Visual Studio plugin, or other build/packaging tools |
| Location | All dependencies must be at the **root level** | Compiled classes and resource files at the root level, required jars in the **`/lib` directory** | **All assemblies (`.dll`) at the root level** |

🔄 The column name **".NET Core"** is no longer a current runtime name (see [Section 3.4](#34-supported-runtimes)). It is now `.NET 8` and `.NET 10`.

Language-specific notes from the instructor notes:

- **Node.js, Ruby, and Python** — Create a .zip archive of your code and dependencies and set appropriate security permissions. **Zip the contents of the directory, not the directory itself.** The contents of the zip file are available as your Lambda function's current working directory.
- **Java** — Decide whether the deployment package is a .zip file or a standalone jar.
- **C#** — The deployment package is a .zip file with the function's compiled assembly and all assembly dependencies. It also includes `proj.deps.json` (which signals the function's dependencies to the runtime) and `proj.runtimeconfig.json` (which configures the runtime). Because Lambda projects are typically class libraries, `proj.runtimeconfig.json` is not included by default, so add the following to the publish command.

```text
/p:GenerateRuntimeConfigurationFiles=true
```

🆕 Upload path by size: **if your .zip file is smaller than 50 MB you can upload it from your local build machine**; for larger files you must upload from an **Amazon S3 bucket**. If you upload from S3 using the CLI, the bucket must be in the same Region as your function. A .zip generated from inline code in CloudFormation (`Code.ZipFile`) **cannot exceed 4 MB** and can't include external dependencies, so it must use the runtime's included SDK.

> — Source: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

### 8.3 Deploying with Containers

The four steps on courseware slide 49: create the project and code → build the container using an AWS base image (Lambda runtime interface client) → **upload the container to Amazon ECR (10 GB)** → create the Lambda function using the container image.

**Every core fact in the instructor notes matches current documentation.**

| Item | Content |
|---|---|
| Manifest formats | **Docker image manifest V2, schema 2** (Docker 1.10 and newer) and the **OCI Specifications v1.0.0 and up** |
| Size | **Maximum uncompressed image size of 10 GB, including all layers** |
| Runtime API | To use Lambda, the image must implement the **Lambda runtime API**, and AWS provides a **runtime interface client** for all supported runtimes. The implementations use an open-source license, are shared with the community, and are available through native package managers |
| Layers | **Container images do not use layers.** You package the required runtime, libraries, and dependencies into the image |

🆕 Items the courseware does not cover:

| Item | Content |
|---|---|
| Three kinds of base image | **AWS base images** (preloaded with a language runtime, a runtime interface client, and a **runtime interface emulator** for local testing), **AWS OS-only base images** (an Amazon Linux distribution plus the emulator, commonly used for compiled languages such as Go and Rust and for versions Lambda doesn't provide a base image for), and **non-AWS base images** (Alpine, Debian, and so on, which must include a runtime interface client for your language) |
| Changing the package type | **You cannot change the deployment package type (.zip ↔ container image) for an existing function.** You must create a new function |
| File system | The image must be able to run on a **read-only file system**, and your function code can access a writable `/tmp` directory of between 512 MB and 10,240 MB |
| Default user | Lambda defines a default Linux user with least-privileged permissions, so you don't need to specify `USER` in your Dockerfile. That user must be able to read all the files required to run your function |
| Architecture | Lambda provides multi-architecture base images, but **the image you build for your function must target only one architecture**, and Lambda does not support functions that use multi-architecture container images |
| Operating system | Linux-based container images only |
| AL2023 transition | The Node.js 20, Python 3.12, Java 21, .NET 8, Ruby 3.3, and later base images are based on the **Amazon Linux 2023 minimal container image**; earlier base images use Amazon Linux 2. AL2023 images use `microdnf` (symlinked as `dnf`) instead of `yum`. To run AL2023-based images locally, including with AWS SAM, you need **Docker version 20.10.10 or later** |
| ECR | The repository must be in the **same Region** as the Lambda function. You can create a function using an image in a different account as long as the image is in the same Region. Lambda **does not support Amazon ECR FIPS endpoints** for container images |
| Manifest size | For optimal performance, keep the image manifest size under 25,400 bytes (the quota table lists container image settings size as 16 KB) |

> — Source: [Create a Lambda function using a container image](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)

### 8.4 Lambda Function Quotas 🔄

**The header of the courseware slide 50 table reads "Quota (as of September 2021)."** Here is the comparison.

| Resource | Courseware (September 2021) | Current | Verdict |
|---|---|---|---|
| Memory allocation | 128–10,240 MB | 128 MB to 10,240 MB, in **1-MB increments**. 1 vCPU at 1,769 MB | Matches |
| Maximum runtime (timeout) | 15 minutes | 900 seconds (15 minutes) | Matches |
| Burst concurrency | Up to 1,000 concurrent executions per 10 seconds per function | **1,000 execution environments every 10 seconds** per function per Region. Now called the **concurrency scaling limit** | 🔄 Name changed |
| Invocation payload | Synchronous 6 MB / **asynchronous 256 KB** | Synchronous 6 MB each for request and response / **asynchronous 1 MB** / streamed response 200 MB / 1 MB for the total combined size of request line and header values | 🔄 **Asynchronous limit changed** |
| Deployment package | Zip 50 MB, unzipped 250 MB, **console inline editing 3 MB**, container image 10 GB | 50 MB zipped through the Lambda API or SDKs, **50 MB through the console**, 250 MB unzipped including layers and custom runtimes, container image 10 GB | 🔄 **Console item changed** |
| `/tmp` storage | 10 GB | **Between 512 MB and 10,240 MB, in 1-MB increments** | 🔄 **Now a range** |
| Concurrent executions | (Slide 45) 1,000 | Default quota 1,000, **increasable to tens of thousands**. New accounts start with reduced values | 🔄 |

🆕 Current quotas that are not in the courseware table.

| Resource | Quota |
|---|---|
| Environment variables | **4 KB** for all of a function's environment variables in aggregate |
| Resource-based policy | **20 KB** |
| Layers | **5** (matches courseware slide 38) |
| Streamed response bandwidth | Uncapped for the first 6 MB, then **2 MBps** |
| Network bandwidth per execution environment | **625 Mbps.** Functions not attached to a VPC can request an increase (after approval, bandwidth scales proportionally with memory starting at 2,048 MB and reaching up to 3,000 Mbps at 10,240 MB) |
| Container image settings size | **16 KB** |
| Test events (console editor) | **10** |
| File descriptors | **1,024** |
| Execution processes/threads | **1,024** |
| Storage for uploaded functions (.zip) and layers | **300 GB (unzipped)** in Lambda-managed storage. Not increasable; use **self-managed S3 code storage** beyond that |
| Elastic network interfaces per VPC | **500** (increasable to thousands) |

🆕 API request quotas:

| Resource | Quota |
|---|---|
| Invocation requests per function per Region (synchronous) | Each execution environment instance can serve up to **10 requests per second**, so the total invocation limit is 10 times your concurrency limit |
| Invocation requests per function per Region (asynchronous) | Unlimited per instance. The total invocation limit is based only on available concurrency |
| Invocation requests per function version or alias with provisioned concurrency | **10 times the allocated provisioned concurrency** per second |
| `GetFunction` | 100 requests per second (cannot be increased) |
| `GetPolicy` | 15 requests per second (cannot be increased) |
| Remainder of control plane API requests | 15 requests per second **across all APIs** (cannot be increased) |

The instructor note "a function's concurrency is the number of instances serving requests at a given time, and a sudden increase in the number of instances needed to run the requested number of functions is called a burst" is still conceptually valid.

🆕 A practical pitfall the documentation raises: **quota mismatches between services.** API Gateway has a default throttle limit of 10,000 requests per second whereas Lambda has a default concurrency of 1,000, so API Gateway can send more requests than Lambda can handle. Resolve it by requesting a Lambda concurrency increase that matches your expected traffic.

The `gettingstarted-limits.html` path the courseware cites is still valid.

> — Source: [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

---

## 9. Demo and Lab 4

### 9.1 Demo: Creating a Lambda Function in the AWS Console (Slide 52)

Demo items:

- Overview of the Lambda environment
- Using global/scope constraints — environment variables and parameters
- Deploying versions, aliases, and Lambda layers
- Monitoring with CloudWatch

### 9.2 Lab 4 Overview: Developing a Solution with AWS Lambda (Slides 55–56)

Diagram labels: user → Delete / Dictate / Search / List / Create-update → Notes table, MP3 hosting, Amazon Polly.

Lab objectives (courseware instructor notes):

- Create AWS Lambda functions and interact with them programmatically using the AWS SDKs and the AWS CLI
- Configure AWS Lambda functions to use environment variables and integrate with other services
- Use the AWS SDK to generate an Amazon S3 presigned URL and verify access to bucket objects
- Deploy Lambda functions using a .zip file archive and test them as needed
- Invoke Lambda functions using multiple invocation options from the AWS Management Console and the AWS CLI

### 9.3 Where the Lab Can Trip You Up 🆕

Here are the points where the lab code and commands, taken verbatim from the courseware, can trip you up. The evidence for each is in the referenced section.

| Point | Content | Reference |
|---|---|---|
| `python3.8` runtime | End of support October 14, 2024. New function creation is blocked from February 1, 2027 | [Section 3.4](#34-supported-runtimes) · [Section 6.17](#617-creating-a-lambda-function-aws-cli) |
| `-–role` notation | Contains an en dash, so the shell won't recognize it if you copy it verbatim | [Section 6.17](#617-creating-a-lambda-function-aws-cli) |
| `--payload` | AWS CLI v2 requires `--cli-binary-format raw-in-base64-out` | [Section 7.5](#75-example-invoking-a-function) |
| Environment variable overwrite | `update-function-configuration` **replaces the entire** `Variables` structure | [Section 6.12](#612-environment-variables) |
| `boto3.resource` | An interface that receives no new features, but it keeps working, so the lab is fine | [Section 6.10](#610-example-lambda-function-python-lab-code) |
| Invoke permission | `lambda:InvokeFunction` is required even in the same account | [Section 5.2](#52-the-no-explicit-permission-needed-in-the-same-account-claim) |
| Provisioned concurrency | Cannot be applied to `$LATEST` | [Section 4.7](#47-concurrency) |
| Timeout | The default is 3 seconds. Heavy initialization combined with the 10-second `Init` limit can cause consecutive timeouts | [Section 4.5](#45-execution-environment-lifecycle) · [Section 7.6](#76-error-handling) |

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 10. Changes from the Courseware

These are items in the courseware (instructor deck) that differ from current behavior. Learners have the official courseware in hand, so we keep a record of what changed and why.

This module has the largest delta in the course. The quota table on courseware slide 50 is explicitly labeled **"as of September 2021"**, the runtime list has changed substantially since then, and many features added after the courseware — SnapStart, function URLs, response streaming, recursive loop detection — did not exist yet.

### 10.1 Where the Courseware Differs from Fact

| Item | Courseware | Verified content | Source |
|---|---|---|---|
| Invoke permission in the same account (slide 20 notes) | "If your custom application and the Lambda function it invokes belong to the same AWS account, you don't need to grant explicit permissions" | The caller needs the **`lambda:InvokeFunction` permission** regardless of the account relationship. When a user accesses a Lambda resource, Lambda evaluates **both** identity-based and resource-based policies; when an AWS service invokes, it evaluates only the resource-based policy. Without the permission you get an "is not authorized to perform: lambda:InvokeFunction" error, and this requirement also applies to Lambda functions and other compute resources that invoke functions | [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html) |
| Context "time remaining" default (slide 27 notes) | Python `(default = 3 seconds)`, Java and .NET `(default = 15 minutes)` | All three context documents say only that it **"returns the number of milliseconds left before the execution times out"** and do not state a default. The value is calculated against the function's configured timeout, so there is no per-language default. Since the function timeout defaults to 3 seconds with a maximum of 900 seconds, the Python figure is the default and the Java and .NET figure the maximum — an **internal inconsistency in the courseware** | [Python context object](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html) |
| Python context list (slide 27 notes) | Only the 7 properties from `function_name` to `log_stream_name` | Current documentation includes **`identity` (mobile apps) and `client_context` (mobile apps)** for Python as well. `identity` contains `cognito_identity_id` and `cognito_identity_pool_id`; `client_context` contains `client.installation_id`, `app_title`, `app_version_name`, `app_version_code`, `app_package_name`, `custom`, and `env` | [Python context object](https://docs.aws.amazon.com/lambda/latest/dg/python-context.html) |
| The `-–role` CLI flag (slide 34) | A single hyphen plus an en dash (`–`) | The shell won't recognize it. Every other flag on the same slide uses two hyphens. The output JSON in the same code block also contains a truncated fragment, `"State": "Active", -n:dictate-function",`. This is a typesetting error in the courseware, so we corrected only the notation without citing AWS documentation | — (see [Section 10.5](#105-items-we-could-not-verify)) |
| Duplicate titles on slides 16 and 17 | Both read "Minimizing cold starts 1/2" | Slide 16 covers scheduled triggers and provisioned concurrency while slide 17 covers Lambda SnapStart, so slide 17 should be **"2/2."** This document splits the two sections as 1/2 and 2/2 | — (see [Section 10.5](#105-items-we-could-not-verify)) |

### 10.2 Changed Behavior or Defaults

| Item | Courseware | Current | Source |
|---|---|---|---|
| Supported runtime list (slide 10 notes) | "Node.js, Java, Python, .NET Core, Go, Ruby" | The supported runtimes table lists Node.js (22, 24, 26 preview), Python (3.10–3.15 preview), Java (8, 11, 17, 21, 25), **.NET (8, 9, 10)**, Ruby (3.3, 3.4, 4.0), and the OS-only runtime (`provided.al2023`). The `.NET Core` family and `go1.x` reached end of support, and Go and Rust run on the OS-only runtime. The Fargate vs. Lambda decision guide also includes **PowerShell** among natively supported languages | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| Asynchronous invocation payload (slide 50) | 256 KB | **1 MB.** Synchronous 6 MB matches the courseware, and streamed response 200 MB plus 1 MB for combined request line and header values were added | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| `/tmp` storage (slide 50) | 10 GB (presented as a fixed value) | A setting you configure **between 512 MB and 10,240 MB in 1-MB increments.** No additional cost up to 512 MB; beyond that billed per GB-second. SnapStart does not support more than 512 MB | [Configure ephemeral storage](https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html) |
| Deployment package "console inline editing 3 MB" (slide 50) | 3 MB | **This item is not in the current quota table.** The table lists 50 MB zipped through the Lambda API or SDKs, **50 MB through the console**, and 250 MB unzipped. The code editor conditions are **an interpreted language runtime (Python, Node.js, Ruby) plus a package smaller than 50 MB unzipped**, and container image functions can't be edited in the console | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| "Burst concurrency" (slide 50) | The item name | The number (1,000 execution environments every 10 seconds per function per Region) is the same and **the name changed.** It is now the **concurrency scaling rate**, and the concurrency scaling limit in the quota table. Unused portions do not accrue | [Lambda scaling behavior](https://docs.aws.amazon.com/lambda/latest/dg/scaling-behavior.html) |
| Concurrent execution limit of 1,000 (slide 45) | Presented as a fixed limit | An **increasable default quota** (to tens of thousands). **New AWS accounts start with reduced concurrency and memory quotas** that AWS raises automatically based on usage | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| SnapStart supported runtimes (slide 17) | "The Java 11 and Java 17 managed runtimes" | **Java 11 and later, Python 3.12 and later, .NET 8 and later.** Other managed runtimes, OS-only runtimes, and container images are not supported | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| SnapStart "at no additional cost" (slide 17 notes) | Free without qualification | **No additional cost for Java managed runtimes only.** Otherwise, snapshot caching charges (**minimum 3 hours**) and restoration charges apply, both depending on the memory you allocate | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| SnapStart "up to 10x" (slide 17) | A multiplier | Current documentation uses **"as low as sub-second startup performance"** rather than a multiplier. It also notes that SnapStart works best at scale and that infrequently invoked functions might not see the same improvement. We found no basis to declare 10x wrong; we only confirmed that **the current documentation does not use that phrasing** | [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html) |
| Asynchronous invocation record destinations (slide 12 notes) | AWS Lambda, SNS, SQS, EventBridge — four | Those four **plus an Amazon S3 bucket (on failure only)**, five total. Each requires `sqs:SendMessage`, `sns:Publish`, `s3:PutObject` + `s3:ListBucket`, `lambda:InvokeFunction`, or `events:PutEvents` in the execution role | [Capturing records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html) |
| Asynchronous retry configuration (slide 12 notes) | "The number of retries and the retry interval are configurable" | What is configurable is the **number of retries (`MaximumRetryAttempts`, 0–2) and the maximum event age (`MaximumEventAgeInSeconds`, up to 6 hours)**; there is no parameter for the retry interval itself. The default intervals are one minute between the first two attempts and two minutes between the second and third | [Configuring error handling settings](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-configuring.html) |
| Runtime-included SDK (slide 24 notes) | "The runtimes for Python and Node.js include the SDK, so you don't need to bundle them" | The inclusion is correct and **Ruby is included too**, but the conclusion is reversed. Current documentation recommends **always including SDK modules in your deployment package or a layer** for dependency control and backward compatibility during automatic runtime updates, and using the included SDK only when you can't add packages, such as the console code editor or CloudFormation inline code | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| Code storage location (slide 14 notes) | "AWS Lambda stores your code in Amazon S3 and encrypts the data at rest" | Encryption at rest is correct. The storage location defaults to **Lambda-managed storage** (300 GB unzipped per account per Region) with **self-managed S3 code storage** using your own bucket as an option. With self-managed storage, Lambda does not store a copy of your source code | [Data encryption at rest](https://docs.aws.amazon.com/lambda/latest/dg/security-encryption-at-rest.html) |
| Recursive code response (slide 25 notes) | "Immediately set the function concurrent execution limit to 0" | Lambda now **detects recursive loops and stops them automatically** (approximately 16 invocations in the same chain of requests, on by default and free). However, detection covers only loops between your functions and SQS, S3, and SNS, plus loops of Lambda functions alone, so **loops involving DynamoDB are not detected** and the courseware's manual measure is still valid | [Recursive loop detection](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html) |
| `invoke --payload` (slide 44) | Passes a JSON string directly | AWS CLI **version 2 requires `--cli-binary-format raw-in-base64-out`.** You can make it the default with `aws configure set cli-binary-format raw-in-base64-out` | [Invoking a function asynchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html) |
| Event source list (slide 9) | Includes Amazon Alexa, AWS CloudTrail, Amazon CloudWatch | **Amazon Alexa and AWS CloudTrail are not in** the current "Services that can invoke Lambda functions" table (28 entries). Absence from the table does not mean invocation is impossible, so we do not assert that. "Amazon CloudWatch" became **Amazon CloudWatch Logs**. The courseware qualified its list with "including but not limited to," so the list itself is not wrong | [Invoking Lambda with events from other AWS services](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html) |
| The `.NET Core` column name (slide 48) | ".NET Core" | Current runtime names are `.NET 8`, `.NET 9` (container only), and `.NET 10`. All `.NET Core` family runtimes reached end of support | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| `$Latest` notation (slide 36) | `$Latest` | Documentation writes **`$LATEST`** | [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html) |
| Old documentation paths (slides 20, 21, 41 notes) | `limits.html`, `intro-permission-model.html`, `dg/API_AddPermission.html`, `dg/API_CreateEventSourceMapping.html` | All are **alive via redirects.** `limits.html`→`gettingstarted-limits.html`, `intro-permission-model.html`→`lambda-permissions.html`, and `dg/API_*.html`→`api/API_*.html`. Since the API Reference was separated from the Developer Guide, citing the new paths directly is more accurate | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| How to grant invocation permission (slides 19, 20) | Only the `AddPermission` API | Current documentation presents the **full JSON policy (`PutResourcePolicy`) as the recommended path** and positions `AddPermission` for adding individual `Allow` statements. A full JSON policy can use the complete range of IAM global condition keys and explicit `Deny`, up to 20 KB. `put-resource-policy` **overwrites** the entire existing policy | [Working with resource-based policies](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html) |
| DLQ as the asynchronous best practice (slide 12 notes) | "The best practice for asynchronous invocation is to create and use a DLQ" | Current documentation presents the DLQ as an **alternative to an on-failure destination.** On-failure destinations support more target types, include details about the function's response, and can be configured on a function, version, or alias. A DLQ is function-level only and sends only the event content. The DLQ itself is still supported | [Capturing records of asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html) |
| Serverless compute classification (slides 5, 6) | Only Lambda in the serverless column; Fargate only in the instructor notes | The current decision guide **classifies Fargate as serverless compute alongside Lambda.** It also presents other compute options such as AWS Batch, Elastic Beanstalk, ECS/EKS Anywhere, and Lightsail | [Choosing an AWS compute service](https://docs.aws.amazon.com/decision-guides/latest/compute-on-aws-how-to-choose/choosing-aws-compute-service.html) |
| Development tools (slide 23, slide 54 notes) | Third-party plugins (Eclipse, PyCharm, Visual Studio) | The current development tools document presents **AWS Toolkit for VS Code** as the local development tool and does not mention the Eclipse toolkit. The PyCharm toolkit is part of the **AWS Toolkit for JetBrains**. It also presents IaC (SAM, CDK, CloudFormation), GitHub Actions, and Powertools for AWS Lambda | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |

### 10.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| `python3.8` runtime (slide 34) | **End of support October 14, 2024.** Function create blocked February 1, 2027; function update blocked March 3, 2027 | A Python runtime from the current supported table (`python3.12`, `python3.13`, `python3.14`, and so on). The projected deprecation dates are for planning, so check the table again before adopting | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| `.NET Core` runtimes (slides 10, 48) | Entire family end of support: `dotnetcore3.1` 2023-04-03, `dotnetcore2.1` 2022-01-05, `dotnetcore1.0` 2019-06-27, `dotnetcore2.0` 2019-05-30 | `.NET 8` (`dotnet8`), `.NET 10` (`dotnet10`). For containers only, `dotnet9` | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| Go 1.x runtime ("Go" in slide 10 notes) | **End of support January 8, 2024**, function create blocked February 8, 2024. Lambda continues to support the Go language itself | Deploy a Go executable on the OS-only runtime (`provided.al2023`). For containers, use an AWS OS-only base image | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS Toolkit for Eclipse User Guide link (slide 23 notes) | The cited URL returns **HTTP 404**. `/toolkit-for-eclipse/v1/user-guide/` redirects to the AWS Toolkit for JetBrains User Guide, and the current development tools document does not include the Eclipse toolkit. Relatedly, AWS SDK for Java 1.x reached end of support on December 31, 2025 | AWS Toolkit for VS Code. For JetBrains IDEs, the AWS Toolkit for JetBrains; for Visual Studio, the AWS Toolkit for Visual Studio | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |
| `csharp-package-toolkit.html` (slide 23 notes) | No longer exists as its own page; redirects to the Developer Guide root (status 200 but the destination is not the original topic) | The Lambda development tools document or the AWS Toolkit for Visual Studio User Guide | [Development tools for Lambda](https://docs.aws.amazon.com/lambda/latest/dg/tools-to-develop-deploy-manage.html) |
| boto3 resources interface (slide 31) | Discouraged. The AWS Python SDK team **does not intend to add new features**, and newer service features are available only through the client interface. Existing interfaces continue to operate during boto3's lifecycle | `boto3.client('dynamodb')`. Resource instances are not thread safe, so create a new one per thread | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

### 10.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| Runtime deprecation policy and timeline | At least 180 days' notice → deprecation date (console create and update blocked, CLI/SAM/CFN still work) → at least 30 days later, create blocked → at least 60 days later, update blocked. Invocation remains possible indefinitely after deprecation. **Deprecation notifications are not available** for container image functions | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| Function URLs | A dedicated HTTP(S) endpoint at `https://<url-id>.lambda-url.<region>.on.aws`. Resource-based policies and CORS, auth type `AWS_IAM` or `NONE`. Applies only to aliases or `$LATEST`. Public internet only (no PrivateLink) | [Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) |
| Response streaming | Up to 200 MB through function URLs, `InvokeWithResponseStream`, or the API Gateway proxy integration. Uncapped for the first 6 MB, then 2 MBps. Node.js only among managed runtimes. Always shows as buffered in console tests | [Response streaming](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html) |
| Recursive loop detection | Tracks chains of requests using X-Ray tracing headers. Stops the next invocation at approximately 16 in the same chain. On by default and free. Detection covers your functions, SQS, S3, and SNS. Requires a minimum SDK version | [Recursive loop detection](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html) |
| arm64 (Graviton2) | All supported runtimes support both x86_64 and arm64. Price and performance benefits. Requires checking arm64 compatibility of dependencies, layers, and extensions. Default is `x86_64` when `Architectures` is omitted | [Instruction set architecture](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html) |
| Weighted alias canary deployments | One alias splits traffic across up to two versions. Both versions must share the execution role and DLQ configuration and both must be published. Confirm with the `x-amz-executed-version` header and the `START` log. Rolling deployments with CodeDeploy and SAM (`AutoPublishAlias`, `DeploymentPreference`) | [Weighted alias canary deployments](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html) |
| The precise meaning of reserved concurrency | A control that sets **both the maximum and the minimum.** Also used to prevent overwhelming downstream resources. **No additional charge.** Provisioned concurrency is billed, can't be used on `$LATEST`, and is capped at unreserved concurrency minus 100 | [Understanding Lambda function scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html) |
| The 10-second `Init` limit | The `Init` phase is limited to 10 seconds. If exceeded, Lambda retries at the first invocation using the configured timeout (suppressed init). Provisioned concurrency, SnapStart, and Managed Instances get 130 seconds or the configured timeout, whichever is higher (up to 900 seconds) | [Execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| Cold start statistics | Under **1% of invocations**, from under 100 ms to over 1 second. More common in infrequently invoked development and test functions | [Execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| ESM batching and provisioned mode | Invocation on whichever comes first: batching window (0–300 seconds; default 0 for Kinesis, DynamoDB, and SQS, 500 ms for Kafka, MQ, and DocumentDB), batch size, or a 6 MB payload. At-least-once processing makes idempotency essential. Provisioned mode sets minimum and maximum pollers for MSK, Kafka, and SQS | [Event source mappings](https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html) |
| DynamoDB ESM details | The 4-times-per-second polling is a **base rate**. `ParallelizationFactor` 1–10 (default 1) for concurrency per shard, with item-level ordering preserved. `TRIM_HORIZON` is recommended as the starting position. Up to 2 functions per shard for single-Region tables, 1 recommended for global tables | [Using Lambda with DynamoDB](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html) |
| Shareable test events | Private (10 per function) and shareable. Shareable events are stored in the `lambda-testevent-schemas` EventBridge schema registry and require all the relevant API permissions. Also invokable with `sam remote test-event` | [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html) |
| `sam local` subcommands | `generate-event`, `invoke`, `start-api`, `start-lambda` | [Testing with sam local](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local.html) |
| Environment variable limits and cautions | 4 KB total, version-specific configuration, keys must start with a letter and be at least 2 characters using only letters, numbers, and `_`. **`update-function-configuration` replaces the entire structure.** Secrets Manager recommended for sensitive data. Default AWS managed key (free) or a customer managed key, plus helpers for encryption in transit | [Environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) |
| Layer details | Extracted into the `/opt` directory. **Available only for .zip functions.** Useful for locking an embedded SDK version. Not recommended for Go and Rust | [Lambda layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html) |
| Three kinds of container base image | AWS base images (including the runtime interface emulator), AWS OS-only base images, and non-AWS base images. **The package type (.zip ↔ image) can't be changed for an existing function.** Multi-architecture images are not supported. AL2023 transition | [Container images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)  |
| The list of changes that qualify for version publication | Code, environment variables, runtime, handler, layers, memory, timeout, VPC, DLQ, IAM role, description, architecture, ephemeral storage, package type, code storage mode, logging, file system, SnapStart, tracing. **Reserved concurrency does not qualify.** Version numbers are never reused | [Manage function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html) |
| X-Ray details | `Active` and `PassThrough` modes. Sampling of 1 request per second plus 5 percent (not configurable). Two segments per trace (`AWS::Lambda`, `AWS::Lambda::Function`). Not supported for MSK, Kafka, MQ, or DocumentDB ESMs | [Visualize invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| Lambda API request quotas | Synchronous invocation is 10 requests per second per instance (total limit = concurrency × 10). `GetFunction` 100 per second, `GetPolicy` 15 per second, and the remainder of control plane APIs 15 per second across all APIs (none increasable) | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| Other new quotas | Environment variables 4 KB, resource-based policy 20 KB, streaming bandwidth 2 MBps, network bandwidth per execution environment 625 Mbps, container image settings 16 KB, test events 10, file descriptors and threads 1,024, Lambda-managed code storage 300 GB, ENIs per VPC 500 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) |
| More granular pricing structure | Separate x86 and Arm price tables with GB-second tiers, a free tier of 1 million requests and 400,000 GB-seconds per month, ephemeral storage billed above 512 MB, provisioned concurrency and SnapStart billed separately, and Lambda MicroVMs billed per instance-second | [AWS Lambda pricing](https://aws.amazon.com/lambda/pricing/) |
| Lambda durable functions | Workflows that run for **up to 1 year** using checkpoint-and-replay execution. No compute charges during wait periods. SDKs for JavaScript, TypeScript, Python, Java, and C# (.NET) | [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html) |
| Lambda Managed Instances and MicroVMs | Managed Instances run functions on a wide range of EC2 instance types while retaining Lambda's operational simplicity. MicroVMs are session-based isolated sandboxes for running untrusted code, a distinct compute primitive | [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html) |
| ABAC for function access control | Attach tags to a function and specify the same tags on API requests or IAM principals, then use them in the condition element of an IAM policy to control function access | [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html) |

### 10.5 Items We Could Not Verify

Recorded honestly. Check these before stating them definitively in class.

| Item | Status |
|---|---|
| The SnapStart "up to 10x" figure | We confirmed only that **the current SnapStart documentation does not contain that phrasing**; it says "as low as sub-second." **Whether 10x was accurate in the past or holds under specific conditions today could not be determined from documentation.** If you cite a multiplier in class, make clear that the source is the courseware |
| The specific names of AWS managed layers | The shapes on courseware slide 38 present "AWS managed layers" and "partner or third-party layers" without naming any. We verified the layer documentation's overview, versioning, and packaging topics, but **did not fetch a page that names or exemplifies the managed layers AWS provides.** We did not guess names |
| Whether Amazon Alexa can still invoke Lambda | We confirmed only that **Amazon Alexa and AWS CloudTrail are absent** from the "Services that can invoke Lambda functions" table (28 entries). Absence from the table does not mean invocation is impossible. The `AddPermission` API documentation still has an `EventSourceToken` parameter "for Alexa Smart Home functions," which suggests support remains, but **we did not fetch the Alexa Skills Kit documentation** |
| The official support status of the AWS Toolkit for Eclipse | We confirmed three things: the URL the courseware cites returns 404, `/toolkit-for-eclipse/v1/user-guide/` redirects to the JetBrains toolkit guide, and the current Lambda development tools document does not include the Eclipse toolkit. **We did not find a statement declaring that the AWS Toolkit for Eclipse has reached end of support.** Documentation disappearing and an end-of-support declaration are different things, so we did not assert it |
| The `-–role` typesetting error on slide 34 | A notation error the shell can't parse. This is not the kind of fact you verify against AWS documentation but a typesetting problem in the courseware, so we corrected only the notation without citing a source. The same applies to the `"State": "Active", -n:dictate-function",` fragment in the same code block |
| Duplicate titles on slides 16 and 17 | Not a documentation matter for the same reason. We split the two sections as 1/2 and 2/2 |
| The remaining fields in the courseware slide 34 response JSON | Whether fields such as `LastUpdateStatus`, `RevisionId`, `State`, and `PackageType` still appear in the current `CreateFunction` **response** was checked only as far as the `CreateFunction` **request** documentation; **we did not fetch the full list of response elements.** We did confirm that `State`, `StateReason`, and `StateReasonCode` appear in the `GetFunctionConfiguration` response |
| Detailed behavior of Lambda MicroVMs and durable functions | We confirmed that both features exist and that they are billed per instance-second and run for up to 1 year respectively, from the quota documentation and the decision guide. **We did not fetch their dedicated guides (`lambda-microvms-guide.html`, `durable-functions.html`).** They are outside this module's scope, so we recorded only their existence and location |
| Actual Lambda unit prices | We confirmed the **billing structure** on the pricing page (requests + GB-seconds, separate x86 and Arm tables, tier boundaries, and a free tier of 1 million requests and 400,000 GB-seconds). **The specific dollar amounts could not be retrieved because the page renders them dynamically through a Region selector and the values are not in the source HTML.** If you need unit prices, select your Region on the pricing page and read them directly |
| The detailed procedure for Lab 4 | Courseware slides 55–56 contain only an architecture diagram and the objectives, with no procedural text. With no source text to summarize, this document covers only the objectives and the cautions in [Section 9.3](#93-where-the-lab-can-trip-you-up) |

---

## 11. Knowledge Check and Summary

### Knowledge Check (True/False)

The questions from courseware slide 54, with the instructor notes' answers, reproduced as-is.

**Question 1**: The AWS Lambda service handles server, capacity, and deployment requirements on your behalf.

- ✅ **Answer: True**

**Question 2**: An AWS Lambda function needs invocation permission to access other AWS resources in your account.

- ❌ **Answer: False** — An AWS Lambda function needs **execution permission** to access other AWS resources in your account.

**Question 3**: Developing and creating Lambda functions is only possible through the AWS Lambda console.

- ❌ **Answer: False** — In addition to the AWS Lambda console you can use the AWS CLI. You can also interact with custom code using the AWS SDKs. Both the Eclipse and Visual Studio toolkits support Lambda function development.
- 🔄 **Supplementary note**: The conclusion (other paths exist) is correct, but the tools cited are out of date. The current development tools document presents **AWS Toolkit for VS Code** as the local development tool and does not mention the Eclipse toolkit, and the Eclipse toolkit documentation URL the courseware cites returns 404 (see [Section 6.1](#61-development-options)).

**Question 4**: When you enable DynamoDB Streams on a table, you can associate the stream ARN with a Lambda function that you write.

- ✅ **Answer: True**

**Question 5**: Each Lambda function runs in its own isolated environment with its own resources and file system view.

- ✅ **Answer: True**

**Question 6**: The AWS Lambda programming model is stateless, but you can still access stateful data.

- ✅ **Answer: True** — Your code can access stateful data by calling other web services such as Amazon S3 or Amazon DynamoDB.

> — Source: [Managing permissions in AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-permissions.html)

### 🆕 Supplementary Questions (Checking the Updated Material)

**Question 7**: You can create a new Lambda function with `--runtime python3.8`.

- ❌ **Answer: False** — `python3.8` **reached end of support on October 14, 2024.** Function create is blocked from February 1, 2027 and function update from March 3, 2027, so creation through the CLI, SAM, or CloudFormation works until then, but **you can't create or update it in the console from the deprecation date.** Security patches and technical support have also stopped. (See [Section 3.4](#34-supported-runtimes))

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**Question 8**: Lambda SnapStart is available only for Java managed runtimes.

- ❌ **Answer: False** — SnapStart now supports **Java 11 and later, Python 3.12 and later, and .NET 8 and later.** Other managed runtimes (`nodejs24.x`, `ruby4.0`, and so on), OS-only runtimes, and container images are not supported. (See [Section 4.9](#49-minimizing-cold-starts-22-lambda-snapstart))

> — Source: [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

**Question 9**: SnapStart has no additional cost on any runtime.

- ❌ **Answer: False** — There is no additional cost **for Java managed runtimes only.** Otherwise, each function version you publish with SnapStart enabled incurs a snapshot **caching charge (billed for a minimum of 3 hours)** and a **restoration charge** each time an instance is restored from a snapshot, both depending on the memory you allocate. (See [Section 4.9](#49-minimizing-cold-starts-22-lambda-snapstart))

> — Source: [Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html)

**Question 10**: The maximum payload size for asynchronous invocation is 256 KB.

- ❌ **Answer: False** — Asynchronous is **1 MB.** Synchronous is 6 MB each for request and response, and with response streaming you can go up to 200 MB. The quota table on courseware slide 50 shows values "as of September 2021." (See [Section 8.4](#84-lambda-function-quotas))

> — Source: [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

**Question 11**: `/tmp` directory storage is fixed at 10 GB.

- ❌ **Answer: False** — It is a setting you configure **between 512 MB and 10,240 MB in 1-MB increments.** There is no additional cost up to 512 MB, and beyond that it is billed per GB-second. SnapStart does not support ephemeral storage greater than 512 MB. (See [Section 8.4](#84-lambda-function-quotas))

> — Source: [Configure ephemeral storage for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html)

**Question 12**: If your application and the Lambda function are in the same AWS account, no separate permission is needed to invoke it.

- ❌ **Answer: False** — The caller needs the **`lambda:InvokeFunction` permission** regardless of the account relationship. Documentation states that "your user, or the role that you assume, must have permission to invoke a function," and that "this requirement also applies to Lambda functions and other compute resources that invoke functions." What is accurate is that in the same account you may not need to add a separate **resource-based policy.** (See [Section 5.2](#52-the-no-explicit-permission-needed-in-the-same-account-claim))

> — Source: [Troubleshoot invocation issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html)

**Question 13**: If an error occurs in your function code, the `Invoke` response HTTP status code is in the 400 or 500 series.

- ❌ **Answer: False** — When function code or the runtime returns an error, the response status code is **200 OK.** The presence of an error is indicated by the **`X-Amz-Function-Error` header**, with details in the response payload. The 400 and 500 series are reserved for **invocation errors** (permissions, quotas, malformed requests, and so on). (See [Section 7.6](#76-error-handling))

> — Source: [Troubleshoot execution issues in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/python-exceptions.html)

**Question 14**: You can configure provisioned concurrency on the `$LATEST` version.

- ❌ **Answer: False** — Provisioned concurrency can be configured **only on published versions or aliases that point to versions**, not on `$LATEST`. If your function has an event source, that event source must point to the alias or version; otherwise the function won't use the provisioned environments. The maximum you can configure is unreserved account concurrency **minus 100**. (See [Section 4.7](#47-concurrency))

> — Source: [Configuring provisioned concurrency for a function](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

**Question 15**: Reserved concurrency guarantees only a **lower bound** on the concurrency a function can use.

- ❌ **Answer: False** — Reserved concurrency sets **both the maximum and the minimum.** Reserved concurrency cannot be used by any other function, which makes it a floor, and it also acts as a ceiling that prevents the function from scaling beyond that limit. It is also used to prevent overwhelming downstream resources such as database connections. Configuring it incurs **no additional charge.** (See [Section 4.7](#47-concurrency))

> — Source: [Understanding Lambda function scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html)

**Question 16**: There are four destinations you can send asynchronous invocation records to: Lambda, SNS, SQS, and EventBridge.

- ❌ **Answer: False** — There are **five**, including an **Amazon S3 bucket (on failure only)**. Each requires `sqs:SendMessage`, `sns:Publish`, `s3:PutObject` + `s3:ListBucket`, `lambda:InvokeFunction`, or `events:PutEvents` in the execution role. (See [Section 4.4](#44-invocation-record-destinations-and-the-dlq))

> — Source: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

**Question 17**: The current recommended way to retain failed asynchronous events is a DLQ.

- ❌ **Answer: False** — Current documentation presents the **on-failure destination** as the primary path and positions the DLQ as its **alternative.** On-failure destinations support more target types, include **details about the function's response** in the invocation record, and can be configured on a function, version, or alias. A DLQ is configured only at the function level and sends only the event content. The DLQ itself is still supported. (See [Section 4.4](#44-invocation-record-destinations-and-the-dlq))

> — Source: [Capturing records of Lambda asynchronous invocations](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-retain-records.html)

**Question 18**: If recursive code creates an infinite loop, the only response is for a developer to notice it and drop concurrency to zero.

- ❌ **Answer: False** — Lambda **detects recursive loops and stops them automatically.** It tracks chains of requests using X-Ray tracing headers, and when your function is invoked approximately **16 times** in the same chain it stops the next invocation and notifies you through the Health Dashboard and email. It is on by default and free. However, detection covers only loops between your functions and **SQS, S3, and SNS** plus loops of Lambda functions alone, so **loops involving DynamoDB are not detected** and the courseware's manual measure is still needed. (See [Section 6.7](#67-recursive-loop-detection))

> — Source: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

**Question 19**: Running `aws lambda update-function-configuration --environment "Variables={A=1}"` leaves an existing environment variable `B` in place.

- ❌ **Answer: False** — Applying environment variables with `update-function-configuration` **replaces the entire `Variables` structure**, so `B` disappears. To retain existing values you must include them all in the request. Reading the current values and `RevisionId` with `get-function-configuration` and passing them along also prevents changes between the read and the update. (See [Section 6.12](#612-environment-variables))

> — Source: [Working with Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)

**Question 20**: The Lambda console code editor can be used only when the deployment package is smaller than 3 MB.

- ❌ **Answer: False** — The current conditions are two: the function must use an **interpreted language runtime** (Python, Node.js, or Ruby), and the deployment package must be smaller than **50 MB unzipped.** Function code for functions with container image deployment packages cannot be edited directly in the console. There is no 3 MB item in the quota table. (See [Section 6.2](#62-the-lambda-console-code-editor))

> — Source: [Creating and updating Python Lambda functions using .zip files](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

**Question 21**: A single Lambda alias can point to only one function version.

- ❌ **Answer: False** — An alias can point to **up to two** function versions and split traffic between them by weight (a **canary deployment**). Both versions must share the execution role, have the same DLQ configuration or none, and both must be published (`$LATEST` is not allowed). Determine the invoked version from the `x-amz-executed-version` header and the `START` log entry in CloudWatch Logs. (See [Section 6.20](#620-weighted-aliases-and-canary-deployments))

> — Source: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

**Question 22**: You need Amazon API Gateway to invoke a Lambda function over HTTP.

- ❌ **Answer: False** — A **function URL** gives you a dedicated HTTP(S) endpoint for your Lambda function. The format is `https://<url-id>.lambda-url.<region>.on.aws`, access is controlled with resource-based policies and CORS, and the auth type is `AWS_IAM` or `NONE`. It applies only to function aliases or `$LATEST` and is accessible only through the public internet. (See [Section 6.14](#614-function-urls))

> — Source: [Creating and managing Lambda function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)

**Question 23**: A Lambda function response is capped at 6 MB, so you can't return more data than that.

- ❌ **Answer: False** — With **response streaming** you can return up to **200 MB.** The paths are function URLs, the `InvokeWithResponseStream` API, and the API Gateway proxy integration. The first 6 MB is uncapped and the remainder is capped at 2 MBps. Among managed runtimes, **Node.js only** is supported, and console tests always show buffered responses. (See [Section 6.15](#615-response-streaming))

> — Source: [Response streaming for Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)

**Question 24**: Lambda layers can be used with functions deployed as container images.

- ❌ **Answer: False** — Layers work **only with functions deployed as a .zip file archive.** For functions defined as a container image you package the runtime and all dependencies in the image (the same point as slide 49's "container images do not use layers"). The limit is 5 layers per function, and layer contents are extracted into the execution environment's `/opt` directory. (See [Section 6.11](#611-layers))

> — Source: [Managing Lambda dependencies with layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)

**Question 25**: Because the Python and Node.js runtimes include the SDK, the recommendation is not to include the SDK in your deployment package.

- ❌ **Answer: False** — The inclusion is correct (Ruby too). But current documentation recommends **always including the SDK modules your code uses and their dependencies in your deployment package or a Lambda layer**, to maintain full control of dependencies and **maximize backward compatibility during automatic runtime updates.** Use the included SDK only when you can't add packages, such as the console code editor or CloudFormation inline code. (See [Section 3.6](#36-the-aws-sdk-included-in-the-runtime))

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**Question 26**: You can't change any setting on a published function version.

- ❌ **Answer: False** — Code, runtime, architecture, memory, layers, and most configuration settings are immutable, but **triggers, destinations, provisioned concurrency, asynchronous invocation settings, and database connections and proxies** can be configured on a published version. Version numbers also increase monotonically and are **never reused**, even after you delete and recreate a function. (See [Section 6.19](#619-versions-and-aliases))

> — Source: [Manage Lambda function versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

**Question 27**: A deprecated Lambda runtime has no effect on invoking existing functions, so you can leave it as-is.

- ❌ **Answer: False (only half right)** — You **can invoke your functions indefinitely** after deprecation. But security patches and technical support stop, new function creation is blocked from **at least 30 days** after deprecation, and code and configuration updates for existing functions are blocked from **at least 60 days**. Functions may also stop working properly for reasons such as certificate expiry. Once updates are blocked, rolling back to the deprecated runtime may also be blocked, so documentation recommends **using versions and aliases to enable safe deployment with rollback** and upgrading ahead of time. (See [Section 3.5](#35-runtime-deprecation-policy-and-timeline))

> — Source: [Lambda runtimes — Runtime use after deprecation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

**Question 28**: AWS Fargate is a container service, so it is not serverless.

- ❌ **Answer: False** — Current documentation **classifies Fargate and Lambda together as serverless compute.** Fargate is a serverless compute engine for containers and works with both Amazon ECS and Amazon EKS. The two share the benefits of reduced operational overhead, pay-per-use pricing, faster deployment, and built-in high availability, and diverge on execution time limit (Fargate has no hard limit; Lambda is 15 minutes per invocation) and state management. (See [Section 2.2](#22-how-current-documentation-classifies-compute-services) and [Section 2.4](#24-fargate-compared-with-lambda))

> — Source: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

**Question 29**: Lambda functions can run for at most 15 minutes, so they can't be used for longer workflows.

- ❌ **Answer: False** — The 15-minute maximum **per invocation** is correct. But with **durable functions** you can build workflows that run for **up to 1 year** using checkpoint-and-replay execution, and you incur no compute charges during wait periods. They suit workflows that spend most of their time waiting, such as human approvals, scheduled delays, or external API callbacks; Fargate is more appropriate when continuous compute is required. (See [Section 2.4](#24-fargate-compared-with-lambda))

> — Source: [AWS Fargate or AWS Lambda?](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

**Question 30**: Console test events can be used only by the person who created them.

- ❌ **Answer: False** — Private test events are available only to the creator and you can save up to 10 per function, but **shareable test events** can be shared with other users in the same AWS account, who can also edit them. Shareable events are stored in an EventBridge schema registry named `lambda-testevent-schemas`, so you need permissions for all the relevant API operations. (See [Section 7.3](#73-ways-to-test-a-lambda-function))

> — Source: [Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)

### Module Objectives Check

After completing this module, you should be able to do the following:

- ✅ Understand how AWS Lambda works
- ✅ Develop AWS Lambda functions using the SDKs
- ✅ Configure triggers and permissions for Lambda functions
- ✅ Test, deploy, and monitor Lambda functions

### One-Page Summary

| Topic | What to remember |
|---|---|
| Choosing compute | Abstraction goes EC2 (hardware) → ECS/EKS (operating system) → Lambda (runtime). Current documentation classifies **Fargate and Lambda together as serverless.** Lambda is 15 minutes per invocation, up to 1 year with durable functions |
| Runtimes | `.NET Core` and `go1.x` are end of support. Current managed runtimes are Node.js, Python, Java, .NET, and Ruby, plus the OS-only `provided.al2023`. All support x86_64 and arm64. **AL2 reaches EOL on 2026-06-30** |
| Deprecation timeline | 180 days' notice → deprecation date (console blocked) → +30 days create blocked → +60 days update blocked. Invocation still works after deprecation. Container images get **no notifications** |
| Invocation models | Synchronous (default, no retries, 200) / asynchronous (queued, 2 retries at 1 and 2 minutes, 202) / ESM (polling, at-least-once, 6 MB batch). The asynchronous payload limit is **1 MB, not 256 KB** |
| Retries and destinations | Configurable: 0–2 retries and a maximum event age of 6 hours. **Five** destinations (S3 on failure only). **On-failure destinations are preferred over the DLQ** |
| Concurrency | 1,000 by default (increasable; new accounts start lower). The scaling rate is 1,000 per 10 seconds per function and does not accrue. **Reserved** sets max and min and is free; **provisioned** pre-initializes, is billed, and can't use `$LATEST` |
| Cold starts | Under 1% of invocations, 100 ms to over 1 second. `Init` is limited to 10 seconds. Mitigations are scheduled triggers, provisioned concurrency, and **SnapStart (Java 11+, Python 3.12+, .NET 8+; free for Java only)** |
| Permissions | Execution role (trusts `lambda.amazonaws.com`, `AWSLambdaBasicExecutionRole`) plus invocation permission. **`lambda:InvokeFunction` is required even in the same account.** `PutResourcePolicy` (20 KB, supports `Deny`) is the recommended path for resource policies; `AddPermission` adds individual statements |
| Development and testing | The console code editor requires **an interpreted runtime and under 50 MB unzipped** (not 3 MB). Test events are 10 private plus shareable. `sam local invoke`, `start-api`, `start-lambda`, `generate-event` |
| Errors | **Function errors return status code 200 with the `X-Amz-Function-Error` header.** The 400 and 500 series are invocation errors. Code must be idempotent if you rely on retries. Recursive loops stop automatically at about 16 (SQS, S3, SNS only) |
| Deployment | .zip (50 MB zipped, 250 MB unzipped, over 50 MB goes through S3) and container images (10 GB, no layers, package type can't be changed). Layers are 5 per function, extracted to `/opt`, .zip only |
| Versions and aliases | Publishing makes code and most configuration immutable (triggers, destinations, provisioned concurrency, and asynchronous settings are exceptions). An alias can **split traffic across two versions** by weight (canary) |
| Environment variables | 4 KB total, version-specific configuration, always encrypted at rest (default AWS managed key, free). **`update-function-configuration` replaces the entire structure.** Use Secrets Manager for sensitive data |
| Memory and CPU | 128 MB to 10,240 MB in 1-MB increments, **1,769 MB = 1 vCPU.** Default 128 MB. `/tmp` is **512 MB to 10,240 MB** |
