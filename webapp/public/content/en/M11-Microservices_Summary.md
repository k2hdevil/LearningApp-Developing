# Module 11: Building a Modern Application

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Modern Applications](#2-modern-applications)
3. [From Monolith to Microservices](#3-from-monolith-to-microservices)
4. [The Serverless Operating Model](#4-the-serverless-operating-model)
5. [Building the Application](#5-building-the-application)
6. [AWS Step Functions](#6-aws-step-functions)
7. [State Types and Data Flow](#7-state-types-and-data-flow)
8. [Service Integrations](#8-service-integrations)
9. [Testing and Operations](#9-testing-and-operations)
10. [Changes from the Courseware](#10-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 10](#10-changes-from-the-courseware) for what changed and how.
> - Verified on: August 31, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Describe the challenges of legacy architectures
- Describe microservices architecture and its benefits
- Describe the different ways to design a microservices application
- Describe the steps involved in decoupling a monolithic application
- Describe how to coordinate Lambda functions using AWS Step Functions

### Where This Module Sits

The courseware places this module first on day 3. It is where the pieces built in the previous two modules come together as one application.

| Item | Content |
|---|---|
| Module 10 | API management — Configure Amazon API Gateway so that all the services in the application can be connected |
| **Module 11** | **Building a modern application** — Evaluate the benefits of building a web application using a serverless approach |
| Module 12 | Granting access to application users — Review how Amazon Cognito controls user access to AWS resources |
| Lab 6 | Authenticating users with Amazon Cognito |

Days 1 and 2 covered the following. This module revisits those pieces from an architectural point of view.

| Day | Items covered |
|---|---|
| Day 1 | Application / developer tools (IDE, SDKs, APIs) / permissions / storing and hosting the application |
| Day 2 | Databases / compute and storage / API management |

### What This Module Covers

The courseware divides 36 slides into seven sections. This document follows the same order.

| Courseware section | Slides | In this document |
|---|---|---|
| Modern applications | 5–14 | [Section 2](#2-modern-applications) · [Section 3](#3-from-monolith-to-microservices) |
| Operating model - serverless | 15–18 | [Section 4](#4-the-serverless-operating-model) |
| The application | 19–20 | [Section 5](#5-building-the-application) |
| Orchestration with AWS Step Functions | 21–28 | [Section 6](#6-aws-step-functions) · [Section 7](#7-state-types-and-data-flow) · [Section 8](#8-service-integrations) |
| Demonstration | 29–30 | [Section 9](#9-testing-and-operations) |
| Checking your knowledge | 31–32 | (not covered in this document) |
| Summary | 33–36 | [Section 8.3](#83-example-from-dynamodb-getitem-to-lambda-invoke) |

The courseware instructor notes scope the module this way: "We look at the benefits of modern application development with a focus on microservices, plus additional considerations including orchestration. Other modules focus on the development agility and observability of modern applications."

### 1.1 The Biggest Changes in This Module 🆕

A great deal has been added to Step Functions since the courseware was written. Five things you will run into first in class are listed up front. The source for each item is in the corresponding section.

| What changed | Courseware | Current |
|---|---|---|
| Workflow type | Not mentioned | You **must choose** Standard or Express when you create a state machine, and you cannot change it afterward ([Section 6.4](#64-workflow-types-standard-and-express)) |
| Query language | JSONPath and `$` notation only | JSONata has been added and **JSONata is recommended for new state machines** ([Section 7.4](#74-jsonata-and-variables)) |
| Integration targets | 9 services + "and many more" | Optimized integrations + **AWS SDK integrations (over 200 services)** + HTTP Task ([Section 8.2](#82-optimized-integrations-and-aws-sdk-integrations)) |
| Map state | No processing modes | Inline (up to 40 concurrent iterations) and **Distributed** (large-scale parallel) ([Section 7.6](#76-the-map-state-inline-and-distributed)) |
| Deployment and recovery units | Not mentioned | State machine **versions and aliases**, and **redrive** for failed executions ([Section 9.3](#93-versions-and-aliases) · [Section 9.4](#94-restarting-a-failed-execution-with-redrive)) |

> — Source: [Choosing workflow type in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html)

---

## 2. Modern Applications

### 2.1 The Three Pillars of a Modern Application

The courseware presents the AWS definition of a modern application as follows.

> AWS defines a modern application as a cloud-native application developed from a combination of modern technology, architecture, software delivery practices, and operational processes. Modern applications are built with a microservices architecture pattern, a serverless operating model, and an automated software delivery process.

The three pillars are shown below. This module covers the first two; the development agility and observability of the third pillar are covered in other modules.

| Pillar | Courseware content | In this document |
|---|---|---|
| Architecture pattern | Microservices (completely independent) | [Section 3](#3-from-monolith-to-microservices) |
| Operating model | Serverless | [Section 4](#4-the-serverless-operating-model) |
| Software delivery | DevOps — plan → code → build → test → release → deploy → operate → monitor | [Section 3.9](#39-software-delivery-devops) |

### 2.2 The Four Goals of a Modern Application

These are the four characteristics presented in the instructor notes for courseware slide 6.

| Characteristic | Content |
|---|---|
| Speed | You can update quickly to match customer and market needs |
| Scalability | You can scale quickly for millions of users, process petabytes of data, and operate worldwide |
| Resilience | Resilience applies across the whole lifecycle and through deployment. Because resilience is built into the application by default, the application can respond quickly and recover after a failure |
| Security | Because security is set per service, security is maintained at both the application and lifecycle level |

The AWS whitepaper `Implementing Microservices on AWS` (published July 31, 2023) describes the same direction. Microservices rely on small, loosely coupled services that communicate through well-defined APIs and are managed by autonomous teams, and the benefits are improved scalability, resilience, and flexibility along with faster development cycles. The whitepaper explains that a microservices architecture combines concepts from several disciplines — agile software development, service-oriented architecture, API-first design, and CI/CD — and often includes the Twelve-Factor App design pattern.

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

### 2.3 What Is a Microservice

Courseware slide 7 contrasts monoliths and microservices in one line each.

| Item | Courseware slide body |
|---|---|
| Monolith | Performs every function |
| Microservice | Performs one function / completely independent / API |

The instructor notes define each as follows:

- **A monolithic application**: A tightly coupled service in which the user interface and the data are combined into a single program on a single platform. It is a self-contained and independent application, separate from other computing applications.
- **Characteristics of microservices application services**: Strictly scoped / strongly encapsulated / loosely coupled / independently deployable / scalable

These five characteristics match the whitepaper. The whitepaper summarizes microservices as "small, loosely coupled services that communicate through well-defined APIs and are managed by autonomous teams," and on the organizational side describes teams as small enough to be commonly called "two-pizza teams," with each team taking full responsibility for its service from creation through deployment and maintenance.

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

### 2.4 Microservices Are Not Always the Answer 🆕

The courseware lists only the benefits of microservices. The whitepaper adds a caveat. While microservices offer many benefits, you **must evaluate the requirements and cost of each use case, and in some cases a monolithic architecture or another approach may be more appropriate, so the decision must be made case by case with the scale, complexity, and specific use case in mind.**

There are two reasons to state this caveat in class.

| Reason | Content |
|---|---|
| The cost of decomposition is real | The instructor notes for courseware slide 9 acknowledge it too: "Creating microservices or refactoring an existing monolithic application is not easy" |
| Distributed transactions get harder | Once you split into a database per service you can no longer use two-phase commit (2PC) as in a relational database. You have to design compensating transactions yourself ([Section 3.8](#38-distributed-transactions-and-the-saga-orchestration-pattern)) |

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

---

## 3. From Monolith to Microservices

### 3.1 Monolithic Applications

Courseware slide 8 presents nine characteristics of a monolith. The left column is the courseware item; the right column is how the instructor notes describe the way it shows up in development.

| Characteristic in the courseware | What makes it a problem |
|---|---|
| Performs every function | One program holds presentation, logic, and data together |
| Tightly coupled functions | High coupling means high dependency, which increases development and test complexity |
| State exists per runtime instance | If an instance holds state, horizontal scaling is hard |
| Single technology stack | You cannot pick a more suitable language or runtime per function |
| Limited data options | One data store has to serve every access pattern |
| Organized around technical layers | Teams are split by technical domain — UI, middleware, DB — rather than by business function |
| Deployment complexity | You can only deploy at the speed of the slowest component |
| Rigid deployment schedule | Several teams are tied to a single deployment schedule |
| Operational overhead | The whole thing has to be operated together |

The structure the courseware uses as its example is the classic three-tier architecture, with "process note · search note · read note" all sitting together in the logic layer.

| Layer | Instructor notes description |
|---|---|
| Presentation | Manages HTTP requests and responds with HTML or JSON/XML (web service API) |
| Business logic | The application server |
| Data | Contains the data access objects that access the database server |

The conclusion the instructor notes draw: "While this architecture is functional, if the business changes and grows quickly you cannot launch or update the application as fast as you would like."

### 3.2 Microservices Architecture

Placing the seven characteristics from courseware slide 9 next to the monolith items from slide 8 makes it clear what is being changed.

| Item | Monolith (slide 8) | Microservices (slide 9) |
|---|---|---|
| Functional scope | Performs every function | Minimal function services |
| Coupling | Tightly coupled functions | Deployed individually but interact with each other |
| State | State exists per runtime instance | State is stored externally |
| Technology choice | Single technology stack | Technology chosen per microservice |
| Data | Limited data options | Suited to purpose-built data options |
| Organizing principle | Organized around technical layers | Organized around business capabilities |
| Operations | Operational overhead | Serverless and automated operating model |

The instructor notes point out something the table can hide.

> A modern application consists of many of the same components found in a monolithic application, such as the data, logic, and presentation layers. But there are also some key differences. Each microservice is clearly distinct from the others, and each has its own persistence mechanism.

In other words the layers do not disappear. Instead of cutting horizontally across the layers, you **cut vertically by business capability, and each slice owns its own data store.**

The characteristic "state is stored externally" ties directly to serverless compute. The AWS decision guide states that a Fargate container can maintain in-memory state during execution, while **Lambda is stateless by design and requires external storage.**

> — Source: [AWS Fargate or AWS Lambda](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

### 3.3 Benefits of a Microservices Architecture

Courseware slide 10 presents six benefits. The sub-items from the instructor notes are included.

| Benefit | Sub-items from the instructor notes |
|---|---|
| Development agility | The code is readable / the technology stack is easy to change / collaboration between small teams increases / changes apply independently of other services |
| Fast, independent deployment | Microservices deploy independently / deployment times are shorter / the deployment process is easy to automate |
| Improved security | Every service is secure |
| Independent scaling | Microservices can be scaled independently |
| Improved availability and resilience | Fault isolation is improved |
| Organization around business capability | Services from other applications can be reused |

The opening line of the instructor notes gives the basis for the list: "Because microservices are small, independent units, they provide the following benefits."

### 3.4 Service Boundaries and Domain-Driven Design 🆕

Courseware slide 11 presents the following as ways to start new development:

- Build a culture of accountability so you can experiment
- Use microservices to compose the application into individual pieces — well-defined interfaces through APIs / each microservice optimized for a single function / each service separate from the others
- For example: domain-driven design — a microservice's function lives inside a domain context / define the integration points with other domains

The courseware presents domain-driven design only as a one-line example. AWS Well-Architected reliability pillar **REL03-BP02** turns it into actionable guidance. Microservices use domain models and **bounded contexts** to draw service boundaries along business context boundaries. A bounded context isolates and encapsulates business logic so teams can better judge how to handle failures.

The anti-patterns the documentation lists overlap exactly with "organized around technical layers" from courseware slide 8.

| Category | Content |
|---|---|
| Anti-pattern | Organizing **teams around technical domains** such as UI, middleware, and databases |
| Anti-pattern | An application that **spans multiple domain responsibilities** |
| Anti-pattern | **Sharing domain dependencies across services**, such as a domain entity library |
| Implementation step | Run an event storming workshop to identify events, commands, aggregates, and domains |
| Implementation step | Divide domains into services using bounded contexts |
| Implementation step | For an existing monolith, apply tactical techniques such as a bubble context or an anti-corruption layer |

For decomposing a monolith, the **decompose by business capability, by subdomain, and by transaction** patterns align well with a domain-driven approach.

> — Source: [REL03-BP02 Build services focused on specific business domains and functionality](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_service_architecture_business_domains.html)

### 3.5 Integration Patterns: API Driven and Event Driven

Courseware slide 12 divides integration into two categories.

| Category | Processing | Courseware slide body |
|---|---|---|
| API driven | Synchronous | Applications and services connect and communicate through APIs (AWS services provide service APIs) / HTTP and HTTPS communication protocols |
| Event driven | Asynchronous | A message signaling that something happened (AWS resources can generate events on state change) / consumers subscribe to events / providers produce events |

The four considerations in the instructor notes are worth carrying over verbatim.

- Modern applications use both types of integration.
- Are you communicating within a service or between services? Services are generally wrapped in APIs but use messages and events internally.
- Event-driven communication is nearly infinitely scalable and can also scale to zero, which gives a cost benefit.
- Event-driven applications enable decoupling between services and between the teams that built them. That decoupling improves team agility.

The AWS Serverless Developer Guide presents event-driven architecture (EDA) as the **first step of the serverless learning path** and states that understanding how services interact through events is essential to successful serverless development. An event represents a change or update in state (an item added to a cart, a file uploaded to storage, an order ready to ship). An event can carry state such as quantity, price, and currency, or it can carry only identifiers such as `customerId` and `orderId` that are used to look up the related information.

The way the same document contrasts the request/response cycle with an event-driven implementation is useful in class.

| Category | What the application handles itself |
|---|---|
| Traditional request/response | Accept the inbound request · route it · create global data and utility services · implement web hooks · process the request · serialize the response · add metadata · send the response — eight steps |
| Event driven | API Gateway extracts the inbound URL, parameters, query strings, and headers to create an event, and Lambda processes that event. DynamoDB is also serverless and is built to respond with low latency, so **no connection pool is needed** |

Event-driven applications communicate with events that other services and systems can also observe, and because **event producers do not know which consumers are listening**, it is easier to extend without disrupting existing workflows.

> — Source: [Transitioning to event-driven architecture](https://docs.aws.amazon.com/serverless/latest/devguide/serverless-transition.html)

🆕 The whitepaper adds a third pattern here. Unlike the courseware, which presents two categories (API driven and event driven), the whitepaper covers three microservices patterns: **API driven, event driven, and data streaming.**

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

### 3.6 Services That Implement Event-Driven Integration 🆕

Courseware slide 18 lists only the names Amazon EventBridge, Amazon SQS, and Amazon SNS in the application integration layer. Because choosing among them is a design decision, two points are expanded here.

#### The Three Ways EventBridge Processes Events

EventBridge is a serverless service that uses events to connect application components. The documentation defines event-driven architecture as a way of building loosely coupled software systems that emit and respond to events and work together.

| Way | Form | When to use it |
|---|---|---|
| Event buses | A router that receives events and delivers them to **zero or more targets** | Routing from many sources to many targets. Events can optionally be transformed before delivery |
| Pipes (EventBridge Pipes) | **Point-to-point** integration. Each pipe receives events from a single source, processes them, and delivers to a single target | One-to-one connections that need advanced transformation and enrichment |
| Scheduler (EventBridge Scheduler) | Creates recurring schedules with cron and rate expressions, or configures one-time invocations | You can set a flexible time window for delivery, a retry limit, and the maximum retention time for a failed API invocation |

Pipes and event buses are often used together. For example, a pipe whose source is a DynamoDB stream can have an event bus as its target.

> — Source: [What Is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)

🔄 There is no need to be confused if you run into **Amazon CloudWatch Events** in older material or existing code. Amazon EventBridge was previously called Amazon CloudWatch Events. The default event bus and the rules created in CloudWatch Events also appear in the EventBridge console, and because EventBridge **uses the same CloudWatch Events API**, code that uses the CloudWatch Events API continues to work. However, new features added to EventBridge (partner events, the schema registry, EventBridge Pipes, and so on) are not added to CloudWatch Events.

> — Source: [EventBridge is the evolution of Amazon CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html)

#### Choosing an SQS Queue Type

When you place a queue between microservices you have to choose one of two types. This is the real decision point.

| Item | Standard queue | FIFO queue |
|---|---|---|
| Throughput | **Nearly unlimited** API calls per second per action | Up to **3,000 messages** per second per API method with batching (300 API calls per second × batches of 10). Without batching, up to **300 API calls** per second per API method |
| High throughput mode | — | Scales to up to **30,000 transactions** per second by relaxing ordering within a message group |
| Delivery guarantee | **At-least-once delivery.** A message can be delivered more than once, so the application must be designed to handle duplicates with **idempotent operations** | **Exactly-once processing.** Each message is delivered once and kept until it is processed and deleted |
| Deduplication | — | `MessageDeduplicationId` or content-based deduplication |
| Ordering | **Best-effort ordering.** Order is not guaranteed | Messages are received **in the order they were sent** within each message group. Distributing messages across multiple groups lets you process them in parallel while preserving order within a group |

> — Source: [Amazon SQS queue types](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-types.html)

### 3.7 Decoupling a Monolith and the Strangler Fig Pattern

The guidance on courseware slide 13:

- Start small with a small service that is a good candidate for separation
- Minimize dependencies on the monolith
- Separate complex dependencies early
- Separate functionality that changes frequently
- For example: the strangler fig design pattern — a phased approach / progressively replace existing functionality with microservices

The premise the instructor notes emphasize: "Decoupling a monolithic application requires a careful, incremental process."

The link the courseware provides is still valid. The documentation describes the strangler fig pattern as a way, introduced by Martin Fowler, of **managing risk** when modernizing or rewriting a large monolithic system. The procedure is as follows.

| Step | Content |
|---|---|
| 1 | Place a **proxy** at the point where other systems have a dependency on the web service |
| 2 | Initially the proxy performs **pass-through** behavior and the existing monolithic application service fills in the implementation |
| 3 | Create a **new service** separate from the monolith and hand the proxy's implementation over to that new service |
| 4 | Repeat steps 2–3 until all functionality of the legacy system has moved to new services. At that point the **legacy system can be retired** |

The best practices the documentation gives overlap with the guidance on courseware slide 13 and add one more.

| Best practice | Relationship to the courseware |
|---|---|
| Choose components with good test coverage and low technical debt | 🆕 This criterion is not in the courseware |
| Start with components that have scalability requirements | Aligns with "start small with a small service that is a good candidate for separation" |
| Choose components whose business requirements change often and that are deployed often | The same as "separate functionality that changes frequently" |

> — Source: [The strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-aspnet-web-services/fig-pattern.html)

The courseware points to `Advanced Developing on AWS` as the course that covers this topic in more depth.

### 3.8 Distributed Transactions and the Saga Orchestration Pattern 🆕

The "publish note workflow" on courseware slide 22 shows only the success path and the good/bad branches. It does not address **how to roll back changes that were already committed when a transaction spanning several services fails partway through.** The saga orchestration pattern fills that gap.

| Item | Content |
|---|---|
| Problem | A relational database maintains transactional consistency with **two-phase commit (2PC)**, but 2PC cannot be used in a distributed system that follows a database-per-service design |
| Solution | A central coordinator (the **orchestrator**) coordinates a distributed transaction across several services to maintain data integrity |
| On failure | If a step fails, the orchestrator runs a **compensatory transaction** to return the data to its initial state |
| Implementation | When the transaction is distributed across several databases you can implement saga orchestration with **AWS Step Functions**; the sample solution uses a Standard workflow |

It is not free. The considerations the documentation lists are as follows.

| Consideration | Content |
|---|---|
| Complexity | Compensatory transactions and retries complicate the application code |
| Eventual consistency | Transactions are not immediately consistent |
| Idempotency | Saga participants must be **idempotent** |
| Lack of transaction isolation | Concurrent orchestrations can produce stale data, so **semantic locks** are recommended |
| Observability · latency · single point of failure | The orchestrator can become a single point of failure. Using Step Functions mitigates this through built-in fault tolerance and service capacity maintained across multiple Availability Zones within each AWS Region |

> — Source: [Saga orchestration pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html)

### 3.9 Software Delivery: DevOps

Courseware slide 14 contrasts the single pipeline of a monolith with the independent per-service pipelines of microservices.

| Category | Pipeline |
|---|---|
| Monolith | A **single** deployment pipeline shared by several teams (build → test → release → monitor) |
| Microservices | An **independent** pipeline per service |

The instructor notes, carried over verbatim:

> Legacy applications have a single deployment pipeline shared by several teams. That process mostly creates a bottleneck. Teams that are empowered to move fast can deploy new features continuously, in most cases several times a day.
> Operating an application that deploys several times a day is different from running an application that deploys once or twice a year. In a DevOps model, the development and operations teams share service ownership and joint responsibility.

The whitepaper describes the same direction. Moving from a monolith to microservices also affects how the organization works, **promoting agile development in fast cycles**, with each team taking full responsibility for its service from creation through deployment and maintenance.

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

---

## 4. The Serverless Operating Model

### 4.1 What Is Serverless Computing

The instructor notes for courseware slide 16 give the definition.

> With serverless computing you can build and run applications and services without thinking about servers. In a serverless application you do not need to provision, scale, or manage servers. You can build services for nearly any type of application or backend service. Everything required to run and scale your application with high availability is handled automatically.

The AWS serverless product page cites the same three characteristics of serverless technologies: **automatic scaling, built-in high availability, and a pay-for-use billing model.** It states that these technologies remove infrastructure management tasks such as capacity provisioning and patching so you can focus on writing code that serves your customers. The link to this page provided on courseware slide 18 is still valid.

> — Source: [Serverless on AWS](https://aws.amazon.com/serverless/)

The whitepaper characterizes serverless with five principles.

| Principle | Content |
|---|---|
| No infrastructure management | There is no infrastructure to provision or manage |
| Automatic scaling | Scaling happens automatically by unit of consumption |
| Billing | A `Pay for value` billing model |
| Availability | Built-in availability and fault tolerance |
| Architecture | Event-driven architecture (EDA) |

> — Source: [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)

### 4.2 What Goes Away with Serverless 🔄

Courseware slide 16 places two lists side by side: "traditional deployment and operations" and "serverless deployment and operations." However, **in the extracted text the seven items in both lists are identical.** The original slide appears to have used strikethrough on the serverless side to show which tasks go away, but that cannot be distinguished from the text alone.

The table below separates the two lists based on the instructor notes ("in a serverless application you do not need to provision, scale, or manage servers"). Because this is a courseware notation issue, no external documentation source is attached ([Section 10.1](#101-courseware-statements-that-do-not-match-the-facts)).

| What you used to do in traditional deployment and operations | With serverless |
|---|---|
| Provisioning instances | Goes away |
| OS updates | Goes away |
| Installing the application platform | Goes away |
| Building and deploying the application | **Stays.** You still write and deploy code |
| Configuring Auto Scaling and load balancing | Goes away. Scaling is built into the services |
| Continuous server patching, security, and monitoring | Server patching goes away. Application security and monitoring stay |
| Application monitoring and maintenance | **Stays.** The scope narrows from servers to the application |

The result the instructor notes emphasize: "With that overhead reduced, developers can invest more time and effort in building scalable, reliable products."

### 4.3 Benefits of Serverless Computing

The four items in the body of courseware slide 17 and the five items in the instructor notes, side by side.

| Slide body | Corresponding item in the instructor notes |
|---|---|
| No servers to provision or manage | No infrastructure to provision, monitor, or manage |
| Scales with usage | Scalability and fault tolerance are built in |
| Never pay for idle servers | You do not pay for idle; a request-based pricing model |
| High availability and fault tolerance built in | Easy to write, deploy, and secure |
| — | Enables best practices (events, stateless functions) |

The scaling portion of the supplementary instructor notes is especially important.

> You can scale your application automatically. Or you can scale your application by adjusting capacity — turning units of consumption (for example throughput, memory) on and off — rather than by individual server units.
> Serverless applications have availability and fault tolerance built in. You do not need to design these capabilities, because the services running your application provide them by default.

### 4.4 The Serverless Application Stack 🔄

Courseware slide 18 places services into nine layers.

| Layer | Services listed in the courseware |
|---|---|
| Compute | AWS Lambda, AWS Fargate |
| API proxy | Amazon API Gateway, AWS AppSync |
| Application integration | Amazon EventBridge, Amazon SQS, Amazon SNS |
| Orchestration | AWS Step Functions |
| Database | Amazon DynamoDB, Amazon Aurora |
| Storage | Amazon S3, Amazon EFS |
| Analytics | Amazon Kinesis, Amazon Athena |
| Developer tools | AWS tools and SDKs |
| Observability | Amazon CloudWatch, AWS X-Ray |

🔄 There is an internal courseware inconsistency here. The instructor notes say **"the three layers of your stack"** and then list only compute, application integration, and data storage. The slide body presents nine layers. The instructor notes also place AWS Step Functions under "application integration," while the slide body gives it its own "orchestration" layer. This document organizes the material around the nine layers in the slide body and treats the three layers from the instructor notes as the core three pillars among them. Because this is a courseware inconsistency, no external documentation source is attached ([Section 10.1](#101-courseware-statements-that-do-not-match-the-facts)).

| The three layers in the instructor notes | Services listed in the instructor notes | Corresponding layers in the slide body |
|---|---|---|
| Compute | AWS Lambda, AWS Fargate | Compute |
| Application integration | Amazon EventBridge, AWS Step Functions, Amazon SQS, Amazon SNS | Application integration + orchestration |
| Data storage | Amazon S3, Amazon DynamoDB, Amazon EFS, Amazon Aurora | Database + storage |

The instructor notes add Amazon CloudWatch and AWS X-Ray as services that support the post-production lifecycle.

The relationship in which Step Functions invokes Lambda in this stack is also confirmed on the Lambda side. In the "services that can invoke Lambda functions" table, **AWS Step Functions is classified as synchronous or asynchronous invocation**, and Amazon EventBridge is classified as asynchronous for event buses and rules and synchronous or asynchronous for pipes. A function can have multiple triggers, each trigger behaves like an independent client, and each event Lambda passes to the function contains data from only one trigger. Triggers are **stored and managed by the service that generates the events**, not by Lambda.

> — Source: [Invoking Lambda with events from other AWS services](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html)

### 4.5 Automatic Scaling Has Limits Too 🆕

Courseware slide 17 states "scales with usage" and "you can scale your application automatically." It does not say within what limits that automatic scaling happens. The Lambda concurrency concepts verified in module 9 are reused here.

| Item | Content |
|---|---|
| What concurrency is | The number of **in-flight requests a Lambda function is handling at the same time.** Lambda provisions a separate execution environment instance for each concurrent request |
| Account limit | The total concurrency limit is **1,000 by default** per Region and can be raised on request |
| Formula | Concurrency = (average requests per second) × (average request processing time in seconds) |
| Reserved concurrency | Reserves a portion of the account concurrency for that function alone. **There is no additional charge for the configuration itself** |
| Provisioned concurrency | A number of pre-initialized execution environment instances. It reduces cold start latency and **incurs an additional charge** |

So it is not "grows automatically without limit" but "grows automatically within the account limit." You also need to know that the independent scaling per microservice presented as a benefit on courseware slide 10 shares that same account limit.

> — Source: [Understanding Lambda function scaling](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html)

### 4.6 Choosing Between Lambda and Fargate 🆕

Courseware slide 18 only places Lambda and Fargate side by side in the compute layer. The AWS decision guide lays out the differences. The two services **share** these benefits: reduced operational burden, usage-based billing, fast deployment, built-in high availability, simplified compliance, and focus on code.

| Item | AWS Fargate | AWS Lambda |
|---|---|---|
| What it is | A serverless compute engine **for containers**, used mainly with Amazon ECS | Runs code as **functions** in response to events |
| Suitable workloads | Long-running applications, microservices, batch processing | Event-driven processing |
| Execution time limit | **No hard limit** | **15 minutes** per invocation |
| State management | A container can **maintain in-memory state** during execution | **Stateless** by design, so external storage is required |
| Concurrency limit | Based on cluster capacity | 1,000 by default (can be raised) |

The Serverless Developer Guide offers the same criterion. If a microservice is used mainly for **batch data processing**, deploying it as a container application on Fargate may be more appropriate, while for applications that need **on-demand data processing**, deploying and maintaining a Lambda function is far simpler.

> — Source: [AWS Fargate or AWS Lambda](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html)

---

## 5. Building the Application

### 5.1 The Application Built in This Course

Courseware slide 20 gathers the application built throughout the course onto one page. The instructor notes summarize it as: "Think about the application you built in this course. It is a modern application that is cloud native and serverless."

| Element | Content |
|---|---|
| End users | Website hosting / MP3 hosting / calling the application API |
| Application functions | List / Search / Delete / Create·Update / Dictate |
| AWS services | Amazon API Gateway, Amazon Cognito, IAM, DynamoDB, Amazon Polly, AWS X-Ray, AWS SAM, Amazon CloudWatch |

The list of what is absent, from the instructor notes, shows the character of this application best: **because it is serverless, there is no load balancer and no server.**

API Gateway, the entry point for this application, was covered in module 10. API Gateway provides both REST APIs and HTTP APIs, which differ in features and pricing, and the documentation compares the features of the two types side by side. Which type you choose is the entry point design for this application.

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 5.2 Modern Application Characteristics in This Application

Courseware slide 20 asks "which modern application characteristics apply to the application?" and presents six items. Attaching where each one shows up in this application makes the slide much easier to read.

| Characteristic | In this application |
|---|---|
| API driven | End users call the application API through API Gateway |
| Standalone functions | List / Search / Delete / Create·Update / Dictate are each independent functions |
| Decoupled components | A Lambda function is separated per function |
| Technology agnostic | The runtime can be chosen per function |
| Independent deployment | Functions can be deployed individually |
| Serverless | There is no load balancer and no server |

The instructor notes leave the topic open with "what else could you do?" Step Functions in the next section is one answer. As functions multiply, something has to manage the ordering, branching, parallelism, and retries between them, and building that as a workflow instead of writing it as code is orchestration.

---

## 6. AWS Step Functions

### 6.1 Orchestrating Complex Distributed Workflows

The one-line summary on courseware slide 22: "Manage the state of distributed tasks while reducing application code and improving resilience."

The instructor notes present the problem first.

> Modern cloud applications are typically composed of many services and components. As an application grows, you have to write more and more code to coordinate the interactions of all those components.

The example the courseware uses is a "publish note workflow." The flow is as follows.

| Step | Content |
|---|---|
| Entry | A client calls API Gateway with POST, and API Gateway starts the workflow |
| Parallel | Writing a custom log entry and sentiment detection (Amazon Comprehend) run **at the same time** |
| Branch | Decide "good or bad?" It could be an error, or flagged inappropriate language |
| Good | Record the transaction |
| Bad | Notify an administrator (Amazon SES) |

The last sentence of the instructor notes is the theme of this section: "AWS Step Functions provides serverless orchestration of these interactions."

The API Gateway that receives the client POST in this diagram is the same service covered in module 10. API Gateway is also an optimized integration target for Step Functions, and it can serve as the entry point that invokes a synchronous Express workflow ([Section 6.4](#64-workflow-types-standard-and-express) · [Section 8.2](#82-optimized-integrations-and-aws-sdk-integrations)).

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 6.2 Business Logic Orchestration Patterns

Courseware slide 23 presents six patterns. The state type or field that actually implements each is added on the right.

| Pattern | Courseware notation | State or field that implements it |
|---|---|---|
| Sequential | Sequential tasks (A → B) | The `Next` field of a `Task` state |
| Choice | Task choice based on data (A → ? → B / C) | The `Choice` state ([Section 7.5](#75-the-choice-state)) |
| Retry | Retry a failed task (A) | The `Retry` field ([Section 7.8](#78-error-handling-retry-and-catch)) |
| Parallel | Parallel tasks (A · B · C) | The `Parallel` state, or the `Map` state for array iteration ([Section 7.6](#76-the-map-state-inline-and-distributed)) |
| Wait | Wait for a duration, a timestamp, or dynamically (A) | The `Wait` state |
| Exception handling | Try/Catch/Finally (A) | The `Catch` field ([Section 7.8](#78-error-handling-retry-and-catch)) |

The criterion in the instructor notes: "Instead of writing code through a Lambda function that handles business logic, retries, and timeouts, you can use Step Functions." That choice has a cost, so read it together with the billing model in [Section 6.6](#66-pricing-model).

### 6.3 The Definition of Step Functions

The instructor notes for courseware slide 24 and the official documentation agree. Distinguishing the terms precisely is the most important thing in this module.

| Term | Definition |
|---|---|
| State machine | In Step Functions a state machine is called a **workflow** and is a sequence of event-driven steps |
| State | **Each step** of a workflow is called a state |
| Task | A **task state** represents a unit of work performed by another AWS service |
| Execution | A **running instance of a workflow** is called an execution |
| Activities | The work of a state machine task can also be performed by a worker that exists **outside Step Functions** ([Section 8.5](#85-activity-workers)) |

The documentation states that you use Step Functions to create workflows to build distributed applications, automate processes, orchestrate microservices, and create data and machine learning pipelines. In the console you can visualize, edit, and debug workflows and inspect the status of each step.

The five "workflow management" items on courseware slide 24 are also the basis for the answer to knowledge check question 6 on slide 32.

| What the workflow manages |
|---|
| Failures |
| Retries |
| Parallelization |
| Service integrations |
| Observability |

> — Source: [What is Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)

### 6.4 Workflow Types: Standard and Express 🆕

The courseware does not mention workflow types at all. Yet when you create a state machine you **must choose Standard (the default) or Express, and that type cannot be changed after creation.** It is the choice on the first screen in the lab, so the courseware alone cannot answer it.

| Item | Standard | Express |
|---|---|---|
| Maximum execution duration | **1 year** | **5 minutes** |
| Execution model | **Exactly-once** | **At-least-once** for asynchronous, **at-most-once** for synchronous |
| Execution history | Full history available through the Step Functions API for up to **90 days** after the execution completes (can be reduced to 30 days by quota request) | Not stored by Step Functions, so you **must enable CloudWatch Logs logging** |
| Billing | **Number of state transitions** | **Number of executions · execution duration · memory consumption** |
| Service integrations | All integrations, all integration patterns | All service integrations, but **the `.sync` (Run a Job) and `.waitForTaskToken` (Callback) patterns are not supported** |
| Distributed Map | Supported | **Not supported** |
| Activities | Supported | **Not supported** |
| redrive | Supported (14 days) | **Not supported** |

The criterion for choosing is the execution model.

| Workload | Choice | Why |
|---|---|---|
| **Non-idempotent** work such as starting an EMR cluster or processing a payment | Standard | Exactly-once means no duplicate execution |
| **Idempotent** work such as a DynamoDB `PUT`, and high-frequency event processing | Express | With at-least-once, a duplicate produces the same result |

Express has two kinds of execution: synchronous (`StartSyncExecution`) and asynchronous (`StartExecution`). In the console a `StartSyncExecution` request **expires after 60 seconds**, so for a synchronous execution that can run up to 5 minutes you have to use the SDK or the CLI.

> — Source: [Choosing workflow type in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html)

### 6.5 How to Define a Workflow 🔄

Courseware slide 25 presents three steps.

| Step | Courseware notation |
|---|---|
| Define | JSON - Amazon States language |
| Visualize | State Function Workflow Studio |
| Run and monitor | — |

🔄 Two corrections.

**First, the tool name.** The slide body says "State Function Workflow Studio" while the instructor notes on the same slide say "Workflow Studio." The official name is **Workflow Studio**. The courseware also presents it as console-only, but it is now available in **AWS Infrastructure Composer** and through the **AWS Toolkit for VS Code** in addition to the Step Functions console, and in VS Code you can also test individual states.

| Workflow Studio | Content |
|---|---|
| What it is | The **visual tool** used to edit workflows in the Step Functions console. You build a workflow by dragging states onto a canvas |
| What it does | Add, edit, and configure states; set input and output filters; transform results; configure error handling |
| Definition generation | When you modify a state, Workflow Studio **validates and automatically generates** the state machine definition |
| Three modes | **Design · Code · Config** |
| States browser — Actions tab | A list of **task states** that connect to third-party HTTP endpoints and AWS APIs |
| States browser — Flow tab | The `Choice` · `Parallel` · `Map` · `Pass` · `Wait` · `Success` · `Fail` **flow states** |
| States browser — Patterns tab | **Reusable building blocks** that are ready to use |

> — Source: [Developing workflows in Step Functions Workflow Studio](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-studio.html)

**Second, the ASL reference documentation.** The courseware gives only `states-language.net`, which is not an AWS domain, as the ASL link. There is an ASL page in the official AWS documentation as well, and that page references both the Amazon States Language Specification and `Statelint`, a tool that validates ASL code.

| Amazon States Language | Content |
|---|---|
| What it is | A **JSON-based structured language** for defining state machines |
| File extension | If you define a state machine **outside** the Step Functions console, the definition file must be saved with the **`.asl.json`** extension |
| The current documentation example | Sets `QueryLanguage` to **JSONata** and uses a JSONata expression in the `Condition` field of a `Choice` state |

> — Source: [Using Amazon States Language to define Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html)

The run-and-monitor path in the instructor notes matches the documentation: "In the AWS Management Console you can visualize a running workflow. You can also log and monitor workflows using Amazon CloudWatch metrics, CloudWatch Logs, AWS X-Ray, and other tools." What those "other tools" are is in [Section 9.2](#92-logging-and-monitoring).

### 6.6 Pricing Model 🆕

The courseware does not cover the Step Functions billing model. Yet because slide 23 recommends using Step Functions "instead of writing code through a Lambda function that handles business logic, retries, and timeouts," you need to know **what retries are billed as** in order to make that design decision.

| Item | Standard | Express |
|---|---|---|
| Billing basis | Number of **state transitions** | **Number of requests + duration** |
| What a state transition is | Each time a step of your workflow is executed counts as one. Billing is based on the total number of state transitions across all state machines, **including retries** | — |
| Effect of retries | If you add retry error handling to any step of a workflow, **each retry is billed as an additional state transition** | — |
| Duration calculation | — | From when the workflow starts executing until it completes or terminates, **rounded up to the nearest 100 ms** |
| Memory billing | — | In **64 MB increments**. Memory consumption depends on the size of the workflow definition, the use of `Map` and `Parallel` states, and the size of the execution (payload) data |
| Console testing | — | Testing in the console also **counts as a request** |
| Free tier | **4,000** free state transitions per month. It does not expire automatically when the 12-month AWS Free Tier period ends and is offered indefinitely to both existing and new customers | — |

Billing for the `Map` state depends on the mode. **Distributed Map is billed one state transition per iteration, while Inline Map has no state transition for the start of each iteration.** If your workflow uses other AWS services or transfers data, those service charges apply separately.

> — Source: [AWS Step Functions Pricing](https://aws.amazon.com/step-functions/pricing/)

### 6.7 Service Quotas 🆕

The courseware presents no Step Functions quotas. These are the values you hit as soon as you apply the iteration pattern from courseware slide 27 in production, so they are collected here.

| Category | Item | Value |
|---|---|---|
| Names | State machine, execution, and activity task names | **80 characters** or fewer. Unique within an account and Region |
| Account | Registered state machines | 100,000 (up to 150,000 with an increase) |
| Account | Registered activities | 100,000 (up to 150,000 with an increase) |
| Account | Maximum open executions | 1,000,000 per account and Region (**does not apply to Express**) |
| Account | Open Map Runs | Up to 1,000 (hard) |
| Size | Maximum state machine definition size | **1 MB** (hard) |
| Size | Maximum request size per request | 1 MB (hard) |
| Size | Maximum input/output size for a task, state, or execution | **256 KiB as a UTF-8 encoded string** |
| Execution | Maximum execution duration | Standard **1 year** / Express **5 minutes**. Exceeding it fails with a `States.Timeout` error |
| Execution | Maximum execution history size | Standard **25,000 events** (the execution fails if exceeded) / Express unlimited |
| Execution | Execution history retention | Standard 90 days (can be reduced to 30 days on request) |
| Execution | redrive-eligible period | **14 days**. Express does not support redrive |
| Deployment | Published state machine versions | 1,000 per state machine |
| Deployment | Aliases | 100 |
| HTTP Task | Duration | **60 seconds** (hard) |

New AWS accounts start with a reduced state transition quota that is raised automatically based on usage. If a lab or demo feels slow at first, this may be why.

> — Source: [Quotas for Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/service-quotas.html)

---

## 7. State Types and Data Flow

### 7.1 The Eight State Types 🔄

The instructor notes for courseware slide 26 present seven items and **group Succeed and Fail into one.** The official workflow state reference list has **eight**, and Workflow Studio classifies the seven other than `Task` as Flow states. The description of each state itself matches between the courseware and the documentation.

| State | Instructor notes description | Workflow Studio category |
|---|---|---|
| `Task` | A single unit of work performed by the state machine | Actions |
| `Choice` | Chooses the appropriate branch of the flow | Flow |
| `Parallel` | Starts parallel branches within the flow | Flow |
| `Map` | Runs the same steps for multiple items of an array in the state input | Flow |
| `Pass` | Passes its input to its output as is, or combined with some modified data | Flow |
| `Wait` | Delays the flow for a specified duration | Flow |
| `Succeed` | The courseware groups this with Fail as "stops the flow based on pass/fail" | Flow |
| `Fail` | Same | Flow |

Rules that apply to every state:

| Rule | Content |
|---|---|
| `Type` | Every state has a `Type` field indicating the state type |
| `Comment` | Every state can have an optional `Comment` field |
| `Next` | Every state other than `Succeed` and `Fail` needs a `Next` field specifying the next state |
| Exception to `Next` | A `Choice` state can have multiple `Next` fields, one inside each Choice Rule |
| `End` | Setting `End` to `true` makes it a **terminal state** |
| State names | Strings that must be **unique across the entire state machine** |

The difference between `Map` and `Parallel` is easy to confuse. `Parallel` runs different branches at the same time, while `Map` runs **the same steps for multiple items of an array in the state input.**

> — Source: [Discovering workflow states](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-states.html)

### 7.2 Inside a Task State

The subtitle of courseware slide 26 is "how JSON information moves through a task state." The diagram presents three things a state can invoke.

| Invocation target | In this document |
|---|---|
| AWS services | [Section 8.2](#82-optimized-integrations-and-aws-sdk-integrations) |
| Lambda functions | [Section 8.4](#84-the-optimized-lambda-integration) |
| Activity workers | [Section 8.5](#85-activity-workers) |

The instructor notes summarize the data flow in a single passage.

> In a state machine, all work is performed through tasks. AWS Step Functions lets you coordinate work across multiple tasks. Input information is passed in through InputPath. The relevant parameters are resolved and the state is set. Then the code is invoked. ResultPath determines what happens with the output data.

That passage connects directly to knowledge check question 3 in this module. **In a state machine all work is performed by tasks, and a task may invoke a Lambda function or may invoke another service.** It is not "all work is performed by Lambda functions."

> — Source: [What is Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)

### 7.3 The Five JSONPath Data Flow Fields 🔄

There is an internal courseware inconsistency on slide 26. **The diagram shows four fields and the instructor notes on the same slide list three manipulation fields, and the two lists disagree.**

| Field | Slide diagram | Instructor notes |
|---|---|---|
| `InputPath` | Present | Present |
| `Parameters` | Present | Present |
| `ResultSelector` | **Absent** | Present |
| `ResultPath` | Present | **Absent** |
| `OutputPath` | Present | **Absent** |

The accurate list has **five** fields, and **they are applied in the order below.**

| Order | Field | What it does | Courseware slide description |
|---|---|---|---|
| 1 | `InputPath` | Selects the part of the JSON input to pass to the task | "Determines the part of the JSON input to pass to the task" |
| 2 | `Parameters` | Adjusts the data to send to the action | "Passes information to the API action of the connected resource" |
| 3 | (resource invocation) | The task actually runs | — |
| 4 | `ResultSelector` | Selects the part of the action result to carry forward | Absent from the diagram |
| 5 | `ResultPath` | Passes the combination of the state input and the task result to the output | "Determines the information to pass to the output" |
| 6 | `OutputPath` | Filters the output JSON to limit the information passed to the next state | "Filters the data that is passed on" |

There is one more constraint to know. **By default, state output is passed only to the immediately following state.** The documentation advises considering storing data in a variable when later steps need it ([Section 7.4](#74-jsonata-and-variables)).

> — Source: [Processing input and output in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-input-output-filtering.html)

### 7.4 JSONata and Variables 🆕

Courseware slides 26, 27, and 36 cover only JSONPath-based fields and `$` notation. Step Functions now supports **JSONata** as a query and transformation language, and **JSONata is recommended for new state machines.** The reason the courseware examples still work is that a state machine that does not specify a query language **defaults to JSONPath for backward compatibility.**

#### JSONata

| Item | Content |
|---|---|
| Supported specification | Implements the JSONata **2.0.6** specification and supports all built-in functions and operators in that specification, except that `$eval` is not provided and `$parse` is used instead |
| Opt in | You must **opt in** to use JSONata in an existing workflow. When creating a new workflow in the console, selecting JSONata as the top-level state machine `QueryLanguage` is recommended |
| Fewer fields | Selecting JSONata reduces the five JSONPath fields (`InputPath`, `Parameters`, `ResultSelector`, `ResultPath`, `OutputPath`) to **just `Arguments` and `Output`**, and you no longer use `.$` in JSON object key names |
| Expression syntax | `"{% <JSONata expression> %}"`. **Leading or trailing whitespace causes a validation error** |
| Incremental adoption | The `QueryLanguage` field can be specified **both at the state machine top level and on individual states**, so you can adopt it incrementally in an existing state machine. Omitting it at the top level defaults to JSONPath |
| Reserved variable | One reserved variable, `$states`, holding `input`, `result`, `errorOutput`, and `context` |

#### Variables

| Item | Content |
|---|---|
| Why you need them | State output can only be used as input to **the immediately following step**, whereas a variable can be referenced from **any later step** |
| Size | Up to **256 KiB** per state |
| States that support `Assign` | `Pass`, `Task`, `Map`, `Parallel`, `Choice`, `Wait` |
| How to reference | Prefix the name with a dollar sign (`$`) |
| Name rules | Follows Unicode Identifier rules, maximum length **80 characters** |
| Scope | **Workflow-local scope.** The inside of a `Parallel` or `Map` state is a separate scope that can read outer-scope variables but maintains its own variables |
| Scope constraints | An inner scope **cannot assign to a variable with the same name as one in the outer scope**, and a Distributed Map state currently cannot reference outer-scope variables. However, `Assign` in a `Catch` can assign values to outer-scope variables where `Parallel` and `Map` exist |

The `Assign` and `Output` steps are **performed in parallel**, so data transformed while assigning a variable must be transformed again in the `Output` step.

> — Source: [Transforming data with JSONata in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/transforming-data.html)

> — Source: [Passing data between states with variables](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-variables.html)

### 7.5 The Choice State 🆕

The courseware describes the `Choice` state only as "chooses the appropriate branch of the flow." This is the spot that breaks state machines in practice, so it deserves a closer look.

| Field | Required | Content |
|---|---|---|
| `Choices` | **Required** | An array of Choice Rules that determine the next state. You must define **at least one rule** |
| `Default` | Optional (**recommended**) | The name of the state to transition to when no Choice Rule evaluates to `true` |
| `End` | **Not supported** | A `Choice` state does not support the `End` field, and `Next` is used only inside the `Choices` field |

The most important pitfall: **if no `Choices` evaluates to `true` and there is no `Default`, the state cannot be exited and the state machine throws an error.** The example on courseware slide 27 specifying `Default: Done` matches the documentation's recommendation.

The form of a Choice Rule depends on the query language.

| Query language | Choice Rule composition |
|---|---|
| JSONPath | A **comparison** (`Variable` plus a comparison operator field) plus `Next`. Operators include `NumericEquals`, `StringEquals`, `StringGreaterThan`, `IsNull`, `IsPresent`, `StringMatches`, and `TimestampEquals`, and **appending `Path`** to an operator name lets you compare against another value in the state input |
| JSONata | A **`Condition`** field holding a JSONata expression that evaluates to `true`/`false`, plus `Next`. A per-rule **`Assign` block** lets you set different variables depending on which path was taken |

> — Source: [Choice workflow state](https://docs.aws.amazon.com/step-functions/latest/dg/state-choice.html)

### 7.6 The Map State: Inline and Distributed 🆕

The courseware's `Map` description does not distinguish processing modes. The `Map` state now has **two processing modes**, and which one you use changes concurrency, input source, and billing.

| Item | Inline mode (default) | Distributed mode |
|---|---|---|
| Input | **JSON array only** | Also large-scale data sources in Amazon S3 (a single JSON or CSV file, or a set of S3 objects) |
| Execution unit | Each iteration runs **in the context of the workflow that contains the Map state** | Each iteration runs as a **child workflow execution with its own execution history** |
| Execution history | Iteration history is **added to the parent workflow execution history** | Each iteration has its own history |
| Concurrent iterations | Up to **40** | **10,000** parallel child workflow executions if not specified |
| Workflow type | Standard · Express | **Standard only** |
| Failure propagation | If any single iteration fails, **the Map state fails and all iterations stop** | Managed through a `Map Run` resource |
| Billing | There is **no** state transition for the start of each iteration | **One state transition per iteration** is billed |

You should use Distributed mode if any one of these conditions applies.

| Condition |
|---|
| The dataset size **exceeds 256 KiB** |
| The workflow execution event history **exceeds 25,000 entries** |
| You need **more than 40 concurrent iterations** |

When you run in Distributed mode, Step Functions creates a **`Map Run`** resource, assigns it an ARN, and lets you query it with the `DescribeMapRun` API. The main fields are `ItemReader`, `ItemProcessor` (with `Mode=DISTRIBUTED` and `ExecutionType` in `ProcessorConfig`), `Label`, and `ResultWriter`, and the state machine role needs the **`states:StartExecution` and `states:DescribeExecution` permissions.**

#### Two Deprecated Map Fields

| Old field | Replacement | Status |
|---|---|---|
| `Iterator` | **`ItemProcessor`** | Deprecated. The documentation **strongly recommends** changing it |
| `Parameters` inside `Map` | **`ItemSelector`** | Deprecated |

Note: the `Iterator` on courseware slide 27 is **the name of a Task state, not a field of the Map state**, so it is unrelated to this deprecation. `MaxConcurrency` sets an upper bound on the number of parallel iterations, and once the input array has more than 40 items concurrent iterations are more likely to be limited.

> — Source: [Using Map state in Distributed mode](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html)

> — Source: [Using Map state in Inline mode](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-inline.html)

### 7.7 Example: Iterating a Loop with Lambda 🔄

The ASL definition from courseware slide 27. Two things have been corrected from the courseware original.

| What was corrected | Courseware | This document |
|---|---|---|
| Closing quotation marks | In `"Next": "Iterator“` and similar, the closing mark is a **left double quotation mark** rather than a straight quote, so it does not parse as JSON | Corrected to straight quotes |
| Account ID | `arn:aws:lambda:us-east-1:12342:function:Iterate` — the account ID field has only **five digits** | The 12-digit example value `123456789012` |

The general ARN format is `arn:partition:service:region:account-id:resource-id`, and `account-id` is the AWS account ID that owns the resource, written **without hyphens as 12 digits** (the documentation example is `123456789012`). The supported partitions are `aws` (AWS Regions), `aws-cn` (China Regions), and `aws-us-gov` (AWS GovCloud (US) Regions). The ARNs of some resources omit the Region, the account ID, or both.

> — Source: [Amazon Resource Names (ARNs)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html)

```json
{
  "Comment": "Iterator State Machine Example",
  "StartAt": "ConfigureCount",
  "States": {
    "ConfigureCount": {
      "Type": "Pass",
      "Result": { "count": 10, "index": 0, "step": 1 },
      "ResultPath": "$.iterator",
      "Next": "Iterator"
    },
    "Iterator": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:Iterate",
      "ResultPath": "$.iterator",
      "Next": "IsCountReached"
    },
    "IsCountReached": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.iterator.continue",
          "BooleanEquals": true,
          "Next": "ExampleWork"
        }
      ],
      "Default": "Done"
    },
    "ExampleWork": {
      "Comment": "Your application logic, to run a specific number of times",
      "Type": "Pass",
      "Result": { "success": true },
      "ResultPath": "$.result",
      "Next": "Iterator"
    },
    "Done": {
      "Type": "Pass",
      "End": true
    }
  }
}
```

The role of each state matches both the courseware instructor notes and the official tutorial.

| State | Role |
|---|---|
| `ConfigureCount` | Sets the default values for the count (`count`), index (`index`), and step (`step`) |
| `Iterator` | Type `Task`. A resource with a specific ARN (here, Lambda) performs the work, and the values configured in `ConfigureCount` are passed to it. The Lambda function receives `count`, `index`, and `step`, increases `index` by `step`, and returns them along with a Boolean `continue` that is `index < count` |
| `IsCountReached` | A `Choice` state that either runs `ExampleWork` again or moves to `Done` based on the Boolean returned by `Iterator` |
| `ExampleWork` | A **stub** for the work you want to perform during the execution. In this example it is a `Pass` state; **in a real implementation it would be a `Task` state** |
| `Done` | The final state of the execution |

The tutorial URL the courseware provides is still valid. The documentation also explains when to use this pattern. It is used **when you need to track the number of loops in a state machine**, and it helps break a large task or a long-running execution into smaller pieces, or end an execution after a certain number of events. A similar implementation can periodically end and restart a long-running execution to **avoid exceeding service quotas** for Step Functions, Lambda, and other AWS services. The Lambda runtime selected in the current documentation is Node.js.

> — Source: [Iterate a loop with a Lambda function in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-create-iterate-pattern-section.html)

Here is the role of the Lambda function that the `Iterator` state invokes, in code. It expresses only the input/output contract the documentation describes (receive `count`, `index`, and `step`, increase `index`, and return `continue`).

```javascript
// The Lambda handler invoked by the Iterator state.
// It receives count (total iterations), index (current position), and step (increment).
exports.handler = async function (event) {
  let index = event.index;
  const step = event.step;
  const count = event.count;

  // Increase the index by the step
  index = index + step;

  return {
    index,
    step,
    count,
    // Return true to indicate the loop should continue while the index is less than the count
    continue: index < count,
  };
};
```

### 7.8 Error Handling: Retry and Catch 🆕

`Retry` and `Catch` appear in the definition on courseware slide 36, but the courseware shows them only as an example and does not explain the fields' default values or constraints.

| Default behavior | Content |
|---|---|
| Where errors occur | **Every state except `Pass` and `Wait`** can encounter a runtime error |
| Default handling | When a state reports an error, Step Functions by default **fails the entire state machine execution** |
| States that support a `Catcher` | `Task`, `Parallel`, `Map`. **A catcher cannot be used for a top-level state machine execution failure** |
| Error names | **Case-sensitive strings.** Every error defined by ASL begins with the **`States.`** prefix |

#### Constraints on `States.ALL`

`States.ALL` is a wildcard that matches every known error name, but it has three constraints.

| Constraint |
|---|
| It must appear **alone** in a catcher |
| It **cannot catch** the `States.DataLimitExceeded` terminal error |
| It **cannot catch** `States.Runtime` errors |

The other built-in errors are as follows.

| Built-in errors |
|---|
| `States.DataLimitExceeded` · `States.ExceedToleratedFailureThreshold` · `States.HeartbeatTimeout` · `States.Http.Socket` · `States.ItemReaderFailed` · `States.Permissions` · `States.ResultWriterFailed` · `States.Runtime` · `States.TaskFailed` · `States.Timeout` |

#### Default Values of the `Retry` Field

`Task`, `Parallel`, and `Map` states can have a `Retry` field, which is an array of retrier objects.

| Field | Required | Default | Range |
|---|---|---|---|
| `ErrorEquals` | **Required** | — | An array of error names to catch |
| `IntervalSeconds` | Optional | **1** | Up to 99,999,999 |
| `MaxAttempts` | Optional | **3** | Up to 99,999,999. **0 means no retry** |
| `BackoffRate` | Optional | **2.0** | — |
| `MaxDelaySeconds` | Optional | — | Greater than 0 and less than 31622401 |
| `JitterStrategy` | Optional | — | — |

The documentation explicitly states that **production code must handle Lambda service exceptions such as `Lambda.ServiceException` and `Lambda.SdkClientException`.** The `Retry` block on courseware slide 36 is exactly that form ([Section 8.3](#83-example-from-dynamodb-getitem-to-lambda-invoke)).

Retries are not free. In a Standard workflow **each retry is billed as an additional state transition** ([Section 6.6](#66-pricing-model)).

> — Source: [Handling errors in Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)

---

## 8. Service Integrations

### 8.1 The Three Integration Patterns 🆕

The instructor notes for courseware slide 28 describe the three integration patterns but **do not give their official names or their ASL notation.** In the lab you need those names the moment you add a suffix to a resource URI.

| Official pattern name | Instructor notes description | ASL resource URI notation | Standard | Express |
|---|---|---|---|---|
| **Request Response** (default) | Call a service and let Step Functions move to the next state as soon as it gets an HTTP response | **No** suffix | Supported | Supported |
| **Run a Job** | Call a service and have Step Functions wait until the job completes | **`.sync`** | Supported | **Not supported** |
| **Wait for a Callback with Task Token** | Call a service with a task token and have Step Functions wait until that token is returned with a payload | **`.waitForTaskToken`** | Supported | **Not supported** |

Each pattern is controlled by the **`Resource` field URI** of the task definition. The callback pattern resumes on a `SendTaskSuccess` or `SendTaskFailure` call and can **wait until the execution reaches the one-year service quota.** The task token must be delivered by a **principal in the same AWS account.**

#### Do Not Misread the ARN in a `Resource` Value

An ASL `Resource` value is a unique name that follows the ARN format, but **it often does not point at an actual account resource.**

| Part | Meaning |
|---|---|
| `arn:aws:states:` | The **namespace** for Step Functions integrations |
| `:::` | Means the Region and account fields are **empty**. They are inferred from the Region and account where the workflow runs |
| Exception | **Only the legacy integration with Lambda** has a `Resource` value that specifies an actual Lambda function resource (the example in [Section 7.7](#77-example-iterating-a-loop-with-lambda) is that form) |

> — Source: [Discover service integration patterns in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)

### 8.2 Optimized Integrations and AWS SDK Integrations 🆕

Courseware slide 28 presents integration targets only as nine services (AWS Lambda, AWS Batch, AWS Fargate, Amazon ECS, Amazon DynamoDB, Amazon SNS, Amazon SQS, AWS Glue, Amazon SageMaker) plus "and many more." There are now **two distinct integration types.**

| Item | Optimized integrations | AWS SDK integrations |
|---|---|---|
| What it is | Provides **customized options** for using specific services in a state machine | Calls **almost any AWS service API action** directly from a state machine |
| Scale | The integration table lists **21 services** (API Gateway, Athena, AWS Batch, Bedrock, Bedrock AgentCore, and others) | Gives access to **thousands of API actions**, and the table records "Over two hundred services" (**over 200 services**) |
| `Resource` syntax | A per-service URI (for example `arn:aws:states:::dynamodb:getItem`) | `arn:aws:states:::aws-sdk:serviceName:apiAction.[serviceIntegrationPattern]` |
| Example | `arn:aws:states:::lambda:invoke` | `arn:aws:states:::aws-sdk:ec2:describeInstances` |
| Parameter notation | Per service | Step Functions uses **PascalCase** even when the original service API uses camelCase |
| Error names | Per service | The **`ServiceName.ErrorName`** format. Step Functions always appends the `Exception` suffix even when the service does not use it (for example `S3.BucketAlreadyExistsException`) |
| IAM policies | Generated automatically | **Not generated automatically.** You must configure the role policy yourself after creating the state machine |

That last row is where labs get stuck most often. With an AWS SDK integration the state machine is created, but the execution fails with a permissions error.

```json
{
  "Comment": "An AWS SDK integration example that calls EC2 DescribeInstances directly",
  "StartAt": "DescribeInstances",
  "States": {
    "DescribeInstances": {
      "Type": "Task",
      "Resource": "arn:aws:states:::aws-sdk:ec2:describeInstances",
      "Parameters": {},
      "End": true
    }
  }
}
```

> — Source: [Learning to use AWS service SDK integrations](https://docs.aws.amazon.com/step-functions/latest/dg/supported-services-awssdk.html)

### 8.3 Example: From DynamoDB GetItem to Lambda Invoke 🔄

The second ASL definition, from courseware slide 36. Several internal courseware problems overlap on this slide, so it needs cleanup.

| The courseware problem | How this document handles it |
|---|---|
| The slide title is the same as slide 27, "Example: Iterating a loop with Lamda," but the content is not loop iteration — it is a **sequential workflow** of DynamoDB `GetItem` → Lambda `invoke`. The title appears to have been copied from slide 27 | Changed to a title that matches the content |
| The `Comment` value is `"Example of the Amazon States Language using a Pass state"`, but **there is no `Pass` state** in this definition | The `Comment` was corrected to match the content |
| The instructor notes write the state name as `DynamoDBGetItem` (no space), while the state name in the code is `DynamoDB GetItem` (with a space) | Standardized **on the code** |
| The instructor notes write the parameter name as `tableName` (lowercase t), while the code uses `TableName` | Standardized **on the code** |
| The `Next` target of `Catch` is `"Fail"`, but the text is truncated so we cannot confirm that state was defined | The `Fail` state has been **included** in the definition |
| The `FunctionName` ARN contains a 12-digit number that looks like a real account | Replaced with the example value `123456789012` |

The courseware original is truncated after `MaxAttempts`. The definition below fills in `BackoffRate` with the default of **2.0** stated in the documentation ([Section 7.8](#78-error-handling-retry-and-catch)).

```json
{
  "Comment": "DynamoDB GetItem to Lambda Invoke sequential workflow",
  "StartAt": "DynamoDB GetItem",
  "States": {
    "DynamoDB GetItem": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:getItem",
      "Parameters": {
        "TableName": "NoteInventory",
        "Key": { "NoteName": { "S.$": "$.note" } }
      },
      "ResultPath": "$.DynamoDB",
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "Next": "Fail"
        }
      ],
      "Next": "Lambda Invoke"
    },
    "Lambda Invoke": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "OutputPath": "$.Payload",
      "Parameters": {
        "Payload.$": "$",
        "FunctionName": "arn:aws:lambda:us-east-2:123456789012:function:ProcessDynamoDBRecords2:$LATEST"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "End": true
    },
    "Fail": {
      "Type": "Fail"
    }
  }
}
```

The courseware instructor notes, carried over verbatim:

> The state machine starts at the DynamoDBGetItem state. (…) This task is performed by a resource using an Amazon Resource Name (ARN). The tableName: NoteInventory parameter and the key parameter use the '$' notation to pull values from the input. ResultPath is updated with the retrieved value of the item. If an error occurs, the error is caught and the flow is sent to the fail state. On success, the flow continues to the Lambda Invoke state.
> In the Lambda Invoke state, note the retry statement.

Verified against the documentation, the courseware's `Retry` block (`Lambda.ServiceException`, `Lambda.AWSLambdaException`, `Lambda.SdkClientException`, `IntervalSeconds` 2, `MaxAttempts` 6) and `Catch` block (`ErrorEquals: States.ALL`) **match the actual field structure.** In other words the courseware chose this example well.

> — Source: [Handling errors in Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html)

### 8.4 The Optimized Lambda Integration 🆕

If you understand why `OutputPath` is `$.Payload` in the example above, you understand this integration.

| Item | Content |
|---|---|
| Optimized API | **`Invoke`** |
| Key feature 1 | The `Payload` field of the response is **parsed from escaped JSON into JSON** |
| Key feature 2 | If an **exception occurs inside the Lambda function, the Task fails** |
| Shape of the task result | The function output is **nested** inside a metadata dictionary containing `ExecutedVersion`, `Payload`, `SdkHttpMetadata`, `SdkResponseMetadata`, and `StatusCode` |
| Therefore | To pass only the function output to the next state, extract **`$.Payload`** with `OutputPath` |
| Callback pattern | Adding `.waitForTaskToken` implements the callback pattern, and you **put the `TaskToken` in the payload** |
| Asynchronous invocation | The `InvocationType` parameter allows asynchronous invocation, and with an asynchronous invocation the **heartbeat timeout starts immediately** |

There is also an **alternative** of specifying the function ARN directly in the `Resource` field (the form on courseware slide 27). That has two differences.

| Alternative (function ARN specified directly) | Content |
|---|---|
| Constraint | **`.waitForTaskToken` cannot be used** |
| Result | The task result contains **only the function output** (no metadata nesting) |

If you use the `Qualifier` parameter or specify a version or alias in `FunctionName`, you must **include the qualifier in the IAM policy resource ARN** as well. Use `:*` to allow all versions and aliases.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-2:123456789012:function:ProcessDynamoDBRecords2:*"
    }
  ]
}
```

> — Source: [Invoke an AWS Lambda function with Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/connect-lambda.html)

### 8.5 Activity Workers 🆕

The diagram on courseware slide 26 includes "activity worker" as something a state can invoke but never explains it. That is **Activities** — a way to have the task of a state machine performed by **a worker that runs outside Step Functions.**

| Item | Content |
|---|---|
| What can be a worker | An EC2 instance, Amazon ECS, a mobile device — **any application that can make an HTTP connection** |
| How to create one | Creating an activity through the console or a **`CreateActivity`** call gives you an ARN to use in a task state |
| Behavior | When Step Functions reaches an activity task state, the workflow **waits until an activity worker polls for the task** |
| Polling | The activity worker polls with **`GetActivityTask`** and receives `input` and `taskToken` in the response |
| Reporting | When the work is done it reports the result with **`SendTaskSuccess`** or **`SendTaskFailure`** |
| Related APIs | `CreateActivity`, `GetActivityTask`, `ListActivities`, `SendTaskFailure`, `SendTaskHeartbeat`, `SendTaskSuccess` |
| Versioning | Activities are **not versioned and backward compatibility is expected**, so if you need a backward-incompatible change, create **a new activity with a unique name** |
| Long-running work | Setting a long `TimeoutSeconds` and sending `SendTaskHeartbeat` periodically lets an activity wait **up to one year** for completion |
| Timeout | When a task times out, Step Functions invalidates the task token, and API calls using an expired token fail with a **`TaskTimedOut`** exception |

Remember one constraint: **Activities are supported only in Standard workflows** ([Section 6.4](#64-workflow-types-standard-and-express)).

> — Source: [Learn about Activities in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-activities.html)

### 8.6 HTTP Task 🆕

Courseware slide 28 presents integration targets only as AWS services and does not cover **how to call an HTTPS endpoint outside AWS.** That is the HTTP Task.

| Item | Content |
|---|---|
| What it is | A **kind of `Task` state that calls an HTTPS API** from a workflow |
| Call targets | The **public APIs** of third-party SaaS applications such as Stripe and Salesforce, and **HTTPS-based private APIs** inside an Amazon VPC |
| Authentication and connectivity | An **EventBridge connection** is required. A connection supports **Basic, OAuth, and API Key** authentication schemes |
| Secrets | EventBridge creates an **encrypted secret in AWS Secrets Manager** to store the authentication parameters, so you do not have to hardcode secrets in the state machine definition |
| `Resource` | **`arn:aws:states:::http:invoke`** |
| Required parameters | **`ApiEndpoint`**, **`Method`**, and the connection ARN through `Authentication` or `InvocationConfig` |
| Optional parameters | `Headers`, `QueryParameters` |
| Timeout | A request **times out after 60 seconds**, and this is a **hard quota**. On timeout a **`States.Http.Socket`** error occurs |
| Not supported | **mTLS (mutual TLS) is not supported** |
| Throughput limit | Limited by a token bucket with a bucket size of **300** and a refill rate of **300** per second |
| IAM | If you build a state machine containing an HTTP Task with Workflow Studio, an execution role including the HTTP Task IAM policy is **generated automatically** |

```json
{
  "Comment": "An HTTP Task example that calls an external HTTPS API",
  "StartAt": "Call third party API",
  "States": {
    "Call third party API": {
      "Type": "Task",
      "Resource": "arn:aws:states:::http:invoke",
      "Parameters": {
        "ApiEndpoint": "https://api.example.com/v1/notes",
        "Method": "POST",
        "Authentication": {
          "ConnectionArn": "arn:aws:events:us-east-1:123456789012:connection/example-connection/00000000-0000-0000-0000-000000000000"
        },
        "Headers": {
          "Content-Type": "application/json"
        }
      },
      "End": true
    }
  }
}
```

> — Source: [Call HTTPS APIs in Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/call-https-apis.html)

---

## 9. Testing and Operations

The demonstration on courseware slides 29–30 shows six items.

| Demonstration item | Where it is covered in this document |
|---|---|
| Visual development options | [Section 6.5](#65-how-to-define-a-workflow) Workflow Studio |
| Tasks - parallel/sequential | [Section 6.2](#62-business-logic-orchestration-patterns) · [Section 7.1](#71-the-eight-state-types) |
| Branching | [Section 7.5](#75-the-choice-state) |
| Choice | [Section 7.5](#75-the-choice-state) |
| Running | This section |
| Integrations | [Section 8](#8-service-integrations) |

What the demonstration does not cover is **testing.** Because the slides make no mention of it, this section fills the gap.

### 9.1 Testing an Individual State 🆕

There is a way to check a single state without running the whole state machine.

| Method | Content |
|---|---|
| **Test State** in the console | Provide a state definition and an input, and Step Functions runs that state and shows you the output. **You do not have to create a state machine** |
| The **`TestState`** API | Tests an individual state. `inspectionLevel` is **`INFO` (default), `DEBUG`, or `TRACE`.** `TRACE` is available **only for HTTP Task** and shows the raw HTTP request and response |
| AWS Toolkit for VS Code | Inside Workflow Studio you can visualize and build workflows and **test individual states** ([Section 6.5](#65-how-to-define-a-workflow)) |

#### Two Unsupported Tools

The two tools you run into first when looking for a local testing approach are **explicitly marked unsupported** in the current documentation. The courseware does not mention them, but they are worth knowing about.

| Tool | Status | Content |
|---|---|---|
| **Data flow simulator** | Not supported | A console tool built for testing JSONPath syntax |
| **AWS Step Functions Local** | Not supported | The downloadable version. It **does not provide feature parity** and does not support optimized service integrations, cross-account access, or Distributed Map |

The documentation directs you to **unit test state machine logic before deployment with the `TestState` API** instead of Step Functions Local.

> — Source: [Testing and debugging Step Functions state machines](https://docs.aws.amazon.com/step-functions/latest/dg/test-and-debug.html)

### 9.2 Logging and Monitoring 🆕

The instructor notes for courseware slide 25 say "Amazon CloudWatch metrics, CloudWatch Logs, AWS X-Ray, and other tools." Filling in those "other tools" gives six.

| Tool | What you see |
|---|---|
| CloudWatch **metrics** | Workflow execution metrics |
| **Automate event delivery** | Delivers state change events through the EventBridge integration |
| **CloudTrail** | API call auditing |
| CloudWatch **Logs** | Execution logs. **Required for Express workflows** ([Section 6.4](#64-workflow-types-standard-and-express)) |
| **X-Ray** | Tracing data |
| **User Notifications** | Event notifications |

What the courseware lumps into "other tools" is CloudTrail (API call auditing), EventBridge event delivery, and User Notifications.

> — Source: [Logging and monitoring AWS Step Functions service performance](https://docs.aws.amazon.com/step-functions/latest/dg/monitoring-logging.html)

### 9.3 Versions and Aliases 🆕

The courseware does not cover state machine versions and aliases. They are the **Step Functions deployment unit** corresponding to Lambda versions and aliases in module 9 and API Gateway stages in module 10, so this is a gap in the course flow.

| Item | Content |
|---|---|
| What a version is | A **numbered, immutable snapshot** of a state machine |
| How to publish | You publish a version from the **most recent revision** of the state machine |
| ARN format | The state machine ARN plus the version number joined by a colon (`arn:partition:states:region:account-id:stateMachine:myStateMachine:1`) |
| Execution | After publishing a version you can call **`StartExecution` with the version ARN** |
| Editing | Versions **cannot be edited.** You update the state machine and publish a new version |
| Numbering | Starts at 1 and **increases monotonically**, and numbers are **never reused** (if you delete version 10 and publish again, it becomes 11) |
| Shared across versions | All versions share the **same type** (Standard or Express), and the name and creation date cannot change between versions. Tags apply to the state machine **globally** |
| Can differ per version | The state machine **definition**, the **IAM role**, the **tracing configuration**, and the **logging configuration** |
| Limit | Up to **1,000** versions per state machine (a soft limit) |

> — Source: [State machine versions in Step Functions workflows](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-state-machine-version.html)

### 9.4 Restarting a Failed Execution with redrive 🆕

Courseware slides 23 and 24 emphasize "retry a failed task" and "manages failures and retries." `Retry` is recovery at the **state level.** redrive, which is recovery at the **execution level**, is missing from the courseware.

| Item | Content |
|---|---|
| What it is | Restarts a **Standard** workflow execution that did not complete successfully (failed, aborted, or timed out) within the last **14 days** |
| Where it resumes | Continues the execution **from the failed step with the same input.** The results and execution history of successful steps are **preserved and not run again** |
| Definition and ARN | Uses the **same state machine definition and the same execution ARN** as the original attempt. If you updated the state machine definition you **must start a new execution** |
| Billing | redrive **counts as state transitions** and therefore affects billing ([Section 6.6](#66-pricing-model)) |
| Retry counts | Retry counts defined on `Task`, `Parallel`, and Inline `Map` states are **reset to 0** on redrive, so the maximum attempts are available again |
| Express | **Not supported** |

Eligibility requires all of the following.

| redrive eligibility |
|---|
| The execution started **on or after November 15, 2023** |
| The status is **not** `SUCCEEDED` |
| The redrive-eligible period of **14 days** has not been exceeded |
| The maximum open time of **1 year** has not been exceeded |
| The execution event history count is **fewer than 24,999** |

> — Source: [Restarting state machine executions with redrive](https://docs.aws.amazon.com/step-functions/latest/dg/redrive-executions.html)

---

## 10. Changes from the Courseware

These are items in the courseware (the instructor deck) that differ from current behavior. Because learners have the official courseware in hand, we record what changed and why.

### 10.1 Courseware Statements That Do Not Match the Facts

The first four items were verified against external documentation. The last four are **internal inconsistencies where the courseware body and the instructor notes disagree**, so they are not the kind of thing external documentation can verify. Those rows have `—` in the source column.

| Item | Courseware statement | Verified content | Source |
|---|---|---|---|
| Name of the visualization tool (slide 25) | The body says `State Function Workflow Studio`; the instructor notes on the same slide say `Workflow Studio` | The official name is **Workflow Studio**. It is the visual tool for editing workflows in the Step Functions console and offers the Design, Code, and Config modes. In addition to the console it is available in **AWS Infrastructure Composer** and the **AWS Toolkit for VS Code** | [Workflow Studio](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-studio.html) |
| Account ID in a `Resource` ARN (slide 27) | `arn:aws:lambda:us-east-1:12342:function:Iterate` — the account ID field has only **five digits** | The general ARN format is `arn:partition:service:region:account-id:resource-id`, and `account-id` is a **12-digit** AWS account ID without hyphens (documentation example `123456789012`). The courseware value is not a valid ARN. Conversely, the `FunctionName` ARN on slide 36 contains a 12-digit number that looks like a real account, so this document replaced both with example values | [Amazon Resource Names (ARNs)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html) |
| Number of state types (slide 26) | The instructor notes group `Succeed or Fail` into one item and present **7** | The official workflow state reference list has **8**: `Task`, `Choice`, `Parallel`, `Map`, `Pass`, `Wait`, `Succeed`, `Fail`. Workflow Studio classifies the 7 other than `Task` (Actions) as Flow states. The description of each state itself matches the documentation | [Discovering workflow states](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-states.html) |
| Input/output processing fields (slide 26) | The diagram shows **4** (`InputPath`, `Parameters`, `ResultPath`, `OutputPath`) and the instructor notes on the same slide list **3** (`InputPath`, `Parameters`, `ResultSelector`) — **they disagree** | The accurate list for a state machine using JSONPath has **5** fields, applied in the order `InputPath` → `Parameters` → `ResultSelector` → `ResultPath` → `OutputPath` | [Processing input and output](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-input-output-filtering.html) |
| Lost strikethrough in the serverless list (slide 16) | The seven items in the "traditional deployment and operations" and "serverless deployment and operations" lists were **extracted as identical text** | The original slide appears to have used strikethrough on the serverless side to show which tasks go away, but that cannot be distinguished from the text alone. This document separated what goes away in a table, based on the instructor notes ([Section 4.2](#42-what-goes-away-with-serverless)) | — (see [Section 10.5](#105-items-we-could-not-verify)) |
| "Three layers" versus nine layers (slide 18) | The instructor notes say "the three layers of your stack" and list compute, application integration, and data storage. The slide body presents **nine layers** | The instructor notes also place Step Functions under "application integration" while the slide body gives it its own "orchestration" layer. This document organizes around the nine layers in the body and marks the three layers from the notes as the core three pillars among them ([Section 4.4](#44-the-serverless-application-stack)) | — (see [Section 10.5](#105-items-we-could-not-verify)) |
| Title and `Comment` on slide 36 | The title is the same as slide 27, "Example: Iterating a loop with Lamda," but the content is a DynamoDB `GetItem` → Lambda `invoke` sequential workflow. The `Comment` value is `"...using a Pass state"` while the definition has no `Pass` state | The instructor notes write the state name as `DynamoDBGetItem` (no space) and the parameter as `tableName` (lowercase t), while the code uses `DynamoDB GetItem` and `TableName`. The title on slide 27 also misspells "Lamda." This document corrected the title and `Comment` to match the content and standardized the names on the code ([Section 8.3](#83-example-from-dynamodb-getitem-to-lambda-invoke)) | — (see [Section 10.5](#105-items-we-could-not-verify)) |
| Closing quotation marks in the ASL definition (slide 27) | In `"Next": "Iterator“` and similar, the closing mark is a **left double quotation mark** (`“`) rather than a straight quote (`"`) | As written it does not parse as JSON. We also cannot confirm whether a state named `Fail` — the `Catch` target on slide 36 — was defined, because the text is truncated. This document corrected the quotes to produce parseable JSON and included the `Fail` state in the definition | — (see [Section 10.5](#105-items-we-could-not-verify)) |

### 10.2 Changed Behavior and Defaults

| Item | Courseware statement | Current | Source |
|---|---|---|---|
| Workflow type selection | Slides 24 and 25 introduce Step Functions and present the define-visualize-run flow but **never mention workflow types** | You **must choose Standard (the default) or Express** when you create a state machine, and you cannot change it after creation. Standard is up to 1 year, exactly-once, and billed by state transitions; Express is up to 5 minutes, at-least-once (asynchronous) or at-most-once (synchronous), and billed by number of executions and duration. Express does not support the `.sync` or `.waitForTaskToken` patterns, Distributed Map, Activities, or redrive | [Choosing workflow type](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html) |
| How data is passed and transformed | All of slide 26 and the ASL definitions on slides 27 and 36 explain it **only with JSONPath-based fields and `$` notation** | **JSONata** has been added as a query and transformation language, and **JSONata is recommended for new state machines.** Selecting JSONata reduces the five JSONPath fields to just `Arguments` and `Output`, and `.$` is not used in JSON key names. In addition, the `Assign` field of **variables** lets you reference data stored in one step from any later step. A state machine that does not specify a query language defaults to JSONPath for backward compatibility, so **the courseware examples still work** | [Transforming data with JSONata](https://docs.aws.amazon.com/step-functions/latest/dg/transforming-data.html) |
| Scope of integration targets | Slide 28 presents nine services plus "and many more" | There are now two integration types. **Optimized integrations** provide customized options for specific services and the table lists 21 services, while **AWS SDK integrations** call the API actions of over 200 services directly in the form `arn:aws:states:::aws-sdk:service:API`. In addition, an **HTTP Task** using the `arn:aws:states:::http:invoke` resource can call HTTPS APIs outside AWS | [AWS SDK service integrations](https://docs.aws.amazon.com/step-functions/latest/dg/supported-services-awssdk.html) |
| Processing modes of the `Map` state | The instructor notes for slide 26 describe it only as "runs the same steps for multiple items of an array in the state input," so **processing modes are not distinguished** | **Inline** (the default) takes only a JSON array as input, supports up to **40** concurrent iterations, and adds iteration history to the parent execution history. **Distributed** runs each iteration as a child workflow execution with its own execution history (**10,000 parallel** if not specified), can read input from large-scale data sources in Amazon S3, and is **Standard only** | [Map state in Distributed mode](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html) |
| Amazon CloudWatch Events | Slide 18 lists only the EventBridge name and **does not cover the former name** | Amazon EventBridge was previously called **Amazon CloudWatch Events**. The default event bus and the rules created in CloudWatch Events also appear in the EventBridge console, and because it **uses the same API, existing code continues to work.** However, new features added to EventBridge (partner events, the schema registry, EventBridge Pipes, and so on) are not added to CloudWatch Events | [EventBridge is the evolution of CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) |

### 10.3 Discouraged and Unsupported Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The `Iterator` field of the `Map` state and the `Parameters` field inside `Map` | **Deprecated.** Existing definitions continue to work, but the documentation strongly recommends changing them | `Iterator` → **`ItemProcessor`**, `Parameters` inside `Map` → **`ItemSelector`**. The `Iterator` on courseware slide 27 is **the name of a Task state**, not a field of the Map state, so it is unrelated to this deprecation | [Map state in Inline mode](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-inline.html) |
| **AWS Step Functions Local** and the data flow simulator | **Unsupported.** Step Functions Local does not provide feature parity and does not support optimized service integrations, cross-account access, or Distributed Map | Test individual states with **Test State** in the console or the **`TestState` API**. You can also test individual states inside Workflow Studio in the AWS Toolkit for VS Code | [Testing and debugging state machines](https://docs.aws.amazon.com/step-functions/latest/dg/test-and-debug.html) |

The courseware does not mention either tool. They are left here because they are the first path learners take when looking for a local testing method.

### 10.4 Items Added After the Courseware

| Item | Summary | Source |
|---|---|---|
| Standard and Express workflow types | Maximum execution duration 1 year/5 minutes, exactly-once/at-least-once and at-most-once, execution history 90 days/not stored, billing by state transitions/by executions, duration, and memory. Express does not support `.sync`, `.waitForTaskToken`, Distributed Map, Activities, or redrive. A synchronous Express execution expires after 60 seconds in the console | [Choosing workflow type](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html) |
| The JSONata query language | Implements the JSONata 2.0.6 specification (no `$eval`, uses `$parse`). The `QueryLanguage` field can be set at the state machine top level and on individual states. Expression syntax `"{% ... %}"`, and leading or trailing whitespace is a validation error. Reserved variable `$states` (`input`, `result`, `errorOutput`, `context`) | [Transforming data with JSONata](https://docs.aws.amazon.com/step-functions/latest/dg/transforming-data.html) |
| Workflow variables | Declared and assigned with `Assign`. Up to 256 KiB per state, names up to 80 characters, Unicode Identifier rules. Available on `Pass`, `Task`, `Map`, `Parallel`, `Choice`, and `Wait`. Workflow-local scope, with the inside of `Parallel` and `Map` states forming a separate scope | [Passing data between states with variables](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-variables.html) |
| Official names and ASL notation of the three integration patterns | **Request Response** (no suffix) / **Run a Job** (`.sync`) / **Wait for a Callback with Task Token** (`.waitForTaskToken`). A callback resumes with `SendTaskSuccess` or `SendTaskFailure` and can wait up to the one-year quota. The `arn:aws:states:` prefix is the integration namespace and `:::` means the Region and account are empty | [Service integration patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html) |
| AWS SDK integrations | Call the API actions of over 200 services in the form `arn:aws:states:::aws-sdk:serviceName:apiAction`. Parameters are PascalCase, and error names are `ServiceName.ErrorName` always with the `Exception` suffix. **IAM policies are not generated automatically**, so the role policy must be configured manually | [AWS SDK service integrations](https://docs.aws.amazon.com/step-functions/latest/dg/supported-services-awssdk.html) |
| HTTP Task | `arn:aws:states:::http:invoke`. Calls third-party SaaS public APIs and private APIs inside a VPC. EventBridge connection (Basic, OAuth, API Key) and a Secrets Manager secret. `ApiEndpoint` and `Method` required. 60-second hard timeout, `States.Http.Socket` error, no mTLS, token bucket 300/300 | [Call HTTPS APIs](https://docs.aws.amazon.com/step-functions/latest/dg/call-https-apis.html) |
| Distributed Map and `Map Run` | A child workflow execution per iteration. 10,000 parallel if not specified. Input from a single JSON or CSV file or a set of objects in S3. The `Map Run` resource and the `DescribeMapRun` API. The `ItemReader`, `ItemProcessor`, `Label`, and `ResultWriter` fields, and the `states:StartExecution` and `states:DescribeExecution` permissions | [Map state in Distributed mode](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html) |
| Constraints of the `Choice` state | `Choices` is required (at least one rule) and `Default` is recommended. **If there is no `Default` and no rule evaluates to `true`, the state machine throws an error.** `Choice` does not support `End`. A JSONPath rule uses `Variable` plus an operator (with a `Path` suffix on the operator to compare against another value); a JSONata rule uses `Condition` plus a per-rule `Assign` | [Choice workflow state](https://docs.aws.amazon.com/step-functions/latest/dg/state-choice.html) |
| Default values and constraints of the error handling fields | Every state except `Pass` and `Wait` can raise an error. A catcher is available only on `Task`, `Parallel`, and `Map`. `States.ALL` must appear alone and cannot catch `States.DataLimitExceeded` or `States.Runtime`. Retrier defaults are `IntervalSeconds` 1, `MaxAttempts` 3, and `BackoffRate` 2.0, with `MaxDelaySeconds` and `JitterStrategy` supported | [Handling errors](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html) |
| The Activities behavior model | `CreateActivity` → `GetActivityTask` polling → `SendTaskSuccess`/`SendTaskFailure`. `SendTaskHeartbeat` allows waiting up to one year. On timeout the token is invalidated and `TaskTimedOut` is raised. Activities are not versioned, so a backward-incompatible change requires a new activity. **Standard only** | [Activities in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-activities.html) |
| State machine versions and aliases | A numbered, immutable snapshot. The ARN is the state machine ARN plus `:number`. `StartExecution` can be called with a version ARN. Numbers are never reused. Only the definition, IAM role, tracing, and logging configuration can differ between versions. 1,000 versions per state machine | [State machine versions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-state-machine-version.html) |
| Execution redrive | Resumes a failed, aborted, or timed-out Standard execution from within the last 14 days, starting at the failed step. Successful steps are not run again. Same definition, same execution ARN. Billed as state transitions. Retry counts reset to 0. Eligibility requires a start on or after 2023-11-15, a status other than `SUCCEEDED`, within 14 days, within 1 year, and an event history of fewer than 24,999 | [Restarting executions with redrive](https://docs.aws.amazon.com/step-functions/latest/dg/redrive-executions.html) |
| Testing an individual state with `TestState` | Test State in the console and the `TestState` API. `inspectionLevel` is `INFO` (default), `DEBUG`, or `TRACE` (`TRACE` is HTTP Task only and shows the raw HTTP request and response). The documentation points to this as the pre-deployment unit test path | [Testing and debugging state machines](https://docs.aws.amazon.com/step-functions/latest/dg/test-and-debug.html) |
| The current form of Workflow Studio | The Design, Code, and Config modes. The Actions, Flow, and Patterns tabs of the States browser. Validates and generates the definition when a state is modified. Available in AWS Infrastructure Composer and the AWS Toolkit for VS Code in addition to the console | [Workflow Studio](https://docs.aws.amazon.com/step-functions/latest/dg/workflow-studio.html) |
| The official ASL documentation and `.asl.json` | There is an ASL page in the AWS documentation, and it references both the Amazon States Language Specification and the `Statelint` validation tool. **When saving a definition outside the console, use the `.asl.json` extension** | [Amazon States Language](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html) |
| Details of the optimized Lambda integration | The response `Payload` is parsed from escaped JSON into JSON. An exception inside the function fails the Task. The task result is nested with `ExecutedVersion`, `Payload`, `SdkHttpMetadata`, `SdkResponseMetadata`, and `StatusCode`. Specifying the function ARN directly disallows `.waitForTaskToken` and returns only the output. Using `Qualifier` requires the qualifier in the IAM resource ARN as well | [Invoke Lambda with Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/connect-lambda.html) |
| Step Functions service quotas | Names 80 characters, definition 1 MB, input/output 256 KiB, Standard execution history 25,000 events, maximum open executions 1,000,000 (excluding Express), open Map Runs 1,000, redrive 14 days, versions 1,000 and aliases 100, HTTP Task 60 seconds. New accounts start with a reduced state transition quota | [Quotas for Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/service-quotas.html) |
| The Step Functions pricing model | Standard is billed by number of state transitions (including retries); Express by number of requests and duration (rounded up to 100 ms) and memory (in 64 MB increments). The free tier of 4,000 state transitions per month is indefinite. Express console testing also counts as a request. Distributed Map is billed one state transition per iteration; Inline Map is not | [AWS Step Functions Pricing](https://aws.amazon.com/step-functions/pricing/) |
| Six logging and monitoring tools | CloudWatch metrics, EventBridge event delivery, CloudTrail API calls, CloudWatch Logs, X-Ray tracing, User Notifications | [Logging and monitoring](https://docs.aws.amazon.com/step-functions/latest/dg/monitoring-logging.html) |
| The saga orchestration pattern | When 2PC cannot be used in a distributed system, a central orchestrator and compensatory transactions maintain data integrity. Considerations are complexity, eventual consistency, idempotency, lack of transaction isolation (semantic locks), observability, latency, and single point of failure. Implemented with a Step Functions Standard workflow | [Saga orchestration pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html) |
| Bounded contexts and domain-driven design | REL03-BP02. Set service boundaries with domain models and bounded contexts. Anti-patterns are organizing teams around technical domains, applications spanning multiple domain responsibilities, and sharing domain dependencies. Event storming, bubble context, anti-corruption layer. Monolith decomposition by business capability, by subdomain, and by transaction | [REL03-BP02](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_service_architecture_business_domains.html) |
| Three microservices patterns and a caveat | The whitepaper presents API driven, event driven, and **data streaming**. It also adds the caveat to "consider the scale, complexity, and specific use case and decide case by case, because in some cases a monolithic architecture or another approach may be more appropriate" | [Implementing Microservices on AWS](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html) |
| The three ways EventBridge processes events | **Event buses** (many sources to many targets with optional transformation before delivery), **Pipes** (point-to-point from a single source to a single target with advanced transformation and enrichment), and **Scheduler** (recurring cron and rate schedules, one-time invocations, flexible delivery time windows, retry limits, and maximum retention time) | [What Is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html) |
| SQS standard and FIFO queues | Standard offers nearly unlimited API calls per second, at-least-once delivery, and best-effort ordering. FIFO offers 3,000 messages per second with batching (30,000 transactions in high throughput mode), exactly-once processing, ordering within a message group, and `MessageDeduplicationId` | [Amazon SQS queue types](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-queue-types.html) |
| The Lambda concurrency limit | Concurrency = average requests per second × average processing time in seconds. 1,000 by default per Region (can be raised). Reserved concurrency has no additional charge; provisioned concurrency does | [Lambda concurrency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html) |
| Criteria for choosing between Fargate and Lambda | Execution time: no hard limit on Fargate / 15 minutes per invocation on Lambda. State: Fargate can hold memory state / Lambda is stateless. Concurrency: Fargate by cluster capacity / Lambda 1,000 by default. Long-running and batch work suits Fargate; event-driven work suits Lambda | [AWS Fargate or AWS Lambda](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/fargate-or-lambda.html) |
| Transitioning to event-driven architecture | The first step of the serverless learning path. An event represents a change or update in state and can carry state or only identifiers. The eight request/response steps are divided among API Gateway, Lambda, and DynamoDB. Producers do not know their consumers, which makes extension easier | [Transitioning to event-driven architecture](https://docs.aws.amazon.com/serverless/latest/devguide/serverless-transition.html) |
| The strangler fig pattern procedure and best practices | Proxy → pass-through → move the implementation to a new service → repeat → retire the legacy system. Best practices are components with good test coverage and low technical debt, components with scalability requirements, and components that change and deploy often | [The strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-aspnet-web-services/fig-pattern.html) |
| The purpose of the loop iteration tutorial | For tracking the number of loops in a state machine. Breaks a large task or long-running execution into smaller pieces, or ends an execution after a certain number of events. Also used to periodically end and restart a long-running execution to avoid exceeding service quotas. The runtime selected in the current documentation is Node.js | [Iterate a loop with a Lambda function](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-create-iterate-pattern-section.html) |

### 10.5 Items We Could Not Verify

We record these honestly. Confirm them before stating them definitively in class.

| Item | Status |
|---|---|
| An AWS documentation definition of "modern application" | **We could not find an AWS documentation page carrying the same wording** as the definition in the instructor notes for courseware slide 6 (a cloud-native application developed from a combination of modern technology, architecture, software delivery practices, and operational processes). What we did confirm is that the `Implementing Microservices on AWS` whitepaper describes microservices, serverless, and event-driven architecture in the same direction. This document carries the courseware definition over **explicitly attributed to the courseware** |
| The full list of services with optimized integrations | We confirmed that integrations are divided into optimized integrations and AWS SDK integrations, that the optimized integration table **lists 21 services**, and that AWS SDK integrations support over 200 services. **We did not retrieve the full list of names of those 21 services.** This document lists only the five the documentation gives as examples: API Gateway, Athena, AWS Batch, Bedrock, and Bedrock AgentCore. If you need to know whether a specific service has an optimized integration for a lab, check the integration table directly |
| Whether the current documentation recommends replacing the loop iteration pattern with the `Map` state | We confirmed that the tutorial referenced on courseware slide 27 is still valid and that the documentation explains the purpose of the pattern. **We did not find a statement that the documentation recommends using the `Map` state instead of this pattern.** Because the two features solve different problems (tracking loop counts versus processing array items in parallel), we did not state it definitively |
| Whether the `Fail` state that `Catch` targets on slide 36 was defined in the courseware original | The extracted text is truncated after `MaxAttempts`, so **we cannot confirm it.** This document added a `Fail` state to produce a parseable definition. For the same reason we cannot know the courseware original's `BackoffRate` value and filled it in with the documented default of 2.0 |
| Four courseware notation errors | The lost strikethrough on slide 16, the "three layers" on slide 18, the title and `Comment` mismatch on slide 36, and the left double quotation marks on slide 27 are all cases where **the courseware body and the instructor notes disagree, or the notation broke during extraction.** They are not the kind of fact AWS documentation can verify, so we corrected only the notation without attaching a source citation |
| Amazon SNS FIFO topics | Because courseware slide 18 lists Amazon SNS, we intended to cover SNS FIFO topics symmetrically with SQS, but **we did not retrieve the SNS documentation.** What we verified in this document is only the SQS standard and FIFO queues |
| AWS App Runner and other serverless services outside the courseware list | We intended to check whether services have been added to the serverless stack on courseware slide 18 since, but what we confirmed reaches only **EventBridge Pipes and Scheduler**. The current position of App Runner and other container and compute options was **not retrieved** |
| Lambda SnapStart · function URLs · response streaming | These were candidates for updating the serverless operating model section, but this module covers only **the concurrency limit** using the module 9 source. The other three features were not retrieved in this module, so they are not covered |
| The circuit breaker pattern | We intended to cover it alongside saga orchestration as a microservices resilience pattern, but **we did not retrieve that documentation.** The only distributed transaction pattern this document covers is saga orchestration |
| Monolith decomposition patterns related to splitting databases | We confirmed that REL03-BP02 mentions the **decompose by business capability, by subdomain, and by transaction** patterns for decomposing a monolith. Documentation describing each pattern individually, or a pattern dedicated to splitting databases, was **not retrieved** |
| Event stores | For the components of an event-driven architecture we verified event buses and pipes from the EventBridge documentation. **Documentation on event stores and event sourcing was not retrieved** |
| How Amazon Comprehend and Amazon SES are used on slide 22 | The courseware diagram indicates Amazon Comprehend for sentiment detection and Amazon SES for notifying an administrator. **We did not retrieve the documentation for either service**, and this document carries the courseware diagram's description over as is |
| The Lab 6 workflow | Courseware slide 2 previews Lab 6 (authenticating users with Amazon Cognito), but this module contains no lab content. It is in the scope of module 12 |
