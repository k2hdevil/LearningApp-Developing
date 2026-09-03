# Module 13: Deploying Your Application

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [DevOps](#2-devops)
3. [Infrastructure as Code and Deployment Tools](#3-infrastructure-as-code-and-deployment-tools)
4. [AWS SAM](#4-aws-sam)
5. [The SAM Template](#5-the-sam-template)
6. [SAM Resource Types and Connectors](#6-sam-resource-types-and-connectors)
7. [API Access Control](#7-api-access-control)
8. [Installing the SAM CLI and Local Testing](#8-installing-the-sam-cli-and-local-testing)
9. [Building and Deploying](#9-building-and-deploying)
10. [Deployment Strategies](#10-deployment-strategies)
11. [Changes from the Courseware](#11-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 11](#11-changes-from-the-courseware) for what changed and how.
> - Verified on: September 1, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.
> - Terminology has been standardized. This document writes out **continuous integration**, **continuous delivery**, and **continuous deployment**, and uses only one abbreviation, **CI**. It also uses **infrastructure as code**, **change set**, and **deployment configuration** consistently. The courseware words the module objectives differently on slide 3 and slide 32, and the process counts on slide 7 and slide 9 do not match ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).
> - Where courseware templates and CLI examples appear in this document, **broken notation and deprecated runtimes have been corrected.** Each section includes a table stating exactly what was changed.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Identify risks associated with traditional software development practices
- Explain how DevOps addresses the risks associated with traditional software development practices
- Construct an AWS Serverless Application Model (AWS SAM) template to deploy a serverless application
- Describe the various AWS SAM deployment strategies

The courseware carries these four items on slide 3 (Module objectives) and slide 32 (Module summary), but **the wording is not identical.** Item 2 splits between "DevOps **does**  … development **practices**" and "**in** DevOps … development **methods**," and item 3 differs in how the abbreviation is written. This document standardizes on the slide 3 wording ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

And **the deck contains nothing that corresponds to the fourth objective.** The objective is "Describe the various **AWS SAM** deployment strategies," yet the body of the deployment strategies section (slides 25–26) is three words — `Canary`, `Linear`, `All-at-once` — and the entire instructor note is about AWS CodeDeploy. **Nowhere in the deck is there any mention of how to declare a deployment strategy in a SAM template.** This document fills that gap in [Section 10](#10-deployment-strategies) from official documentation. It is the largest gap in this module.

### Where This Module Sits

The courseware places this module last on day 3. It is where the serverless application built in module 11 and the user authentication attached in module 12 **actually get deployed.**

| Item | Content |
|---|---|
| Module 11 | Building modern applications — evaluating the benefits of building web applications the serverless way |
| Module 12 | Granting access to application users — reviewing how Amazon Cognito controls user access to AWS resources |
| **Module 13** | **Deploying your application** — identifying the AWS services and features used to deploy a web application |
| Lab 6 | Capstone - completing the application build |

Slide 2 (Agenda) labels module 12 as "Granting access to application users," while the subtitle on the M12 deck cover is "Granting Access to Your Application Users." The same module carries different names across the two decks ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

### What This Module Covers

The courseware divides 33 slides into seven sections. This document follows the same order.

| Courseware section | Slides | This document |
|---|---|---|
| Cover · Agenda · Module objectives | 1–3 | [Section 1](#1-module-overview) |
| Deployment planning and approaches | 4–10 | [Section 2](#2-devops) · [Section 3](#3-infrastructure-as-code-and-deployment-tools) |
| AWS Serverless Application Model (AWS SAM) | 11–17 | [Section 4](#4-aws-sam) · [Section 5](#5-the-sam-template) · [Section 6](#6-sam-resource-types-and-connectors) · [Section 7](#7-api-access-control) |
| Deploying with AWS SAM | 18–24 | [Section 8](#8-installing-the-sam-cli-and-local-testing) · [Section 9](#9-building-and-deploying) |
| Deployment strategies | 25–26 | [Section 10](#10-deployment-strategies) |
| Demonstration: AWS SAM | 27–28 | [Section 9.9](#99-the-demonstration-procedure) |
| Checkpoint | 29–30 | (not covered in this document) |
| Summary | 31–33 | [Section 1.2](#12-terminology) |

**The first and second halves of this deck are very different in character.** Slides 4–10 cover DevOps concepts, with diagram labels backed by long instructor notes. Slides 11–26 cover AWS SAM in practice, with YAML templates and CLI commands. Code and CLI appear on seven slides — 14, 15, 20, 21, 22, 23, and 24 — and there is exactly **one table** in the whole deck (slide 17, comparing access control mechanisms).

This module has no lab. There is only a demonstration (slides 27–28), and **slide 28 has no instructor notes at all.** This document fills that gap with a command-level procedure in [Section 9.9](#99-the-demonstration-procedure).

### 1.1 The Biggest Changes in This Module 🆕

A lot has been added to and changed in AWS SAM since the courseware was written. Here are the nine you will hit first in class. The evidence for each is in the relevant section.

| What changed | Courseware | Current |
|---|---|---|
| SAM deployment strategies | Required by module objective 4, but **AWS SAM never appears in the deployment strategies section** | Declared with **`AutoPublishAlias` + `DeploymentPreference`**(`Type` · `Alarms` · `Hooks`) on `AWS::Serverless::Function`. There are nine predefined `Type` values, and the SAM spelling is **`AllAtOnce`**, not `All-at-once` ([Section 10.4](#104-declaring-deployment-strategy-in-a-sam-template)) |
| `Transform` value | `AWS::serverless-2016-10-31` — **lowercase `s`** | **`AWS::Serverless-2016-10-31`**(capital `S`). This declaration is **required** in an AWS SAM template file and is what identifies a CloudFormation template as an AWS SAM template ([Section 5.2](#52-the-transform-declaration)) |
| `Globals` section | "Sets the **global variables** to be used within the AWS SAM template" | It is the section where you declare **properties that several resources have in common** once and let them inherit. The section that parameterizes values is **`Parameters`** ([Section 5.3](#53-the-globals-section)) |
| `sam build --use-container` | Instructor note: "Some languages (for example .NET or Python) cannot use this option" | **The current `sam build` reference contains no statement that any language or runtime cannot use it.** On the contrary, the `--build-image` description gives a Python build image used together with `--use-container` as its example. The only stated restriction is **incompatibility with `--build-in-source`** ([Section 9.2](#92-sam-build-and-container-builds)) |
| `sam package` | Presents `sam build && sam package --s3-bucket <bucket_name>` as a pre-deployment step | Documentation states in a Note that **`sam deploy` now implicitly performs the functionality of `sam package`.** The bucket can be created automatically with **`--resolve-s3`** ([Section 9.3](#93-sam-package-is-no-longer-a-separate-step)) |
| Configuration file | `sam deploy --template-file deploy.yml` with the comment "# Deploy using a configuration file" | `--template-file` specifies the **template**. The configuration file is **`--config-file`**(default `samconfig.toml`) and is the output of `sam deploy --guided` ([Section 9.4](#94-sam-deploy-and-samconfigtoml)) |
| SAM resource types | **6** | **13.** Since the courseware, `Application` · `CapacityProvider` · **`Connector`** · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector` have been added ([Section 6.1](#61-thirteen-resource-types)) |
| SAM CLI commands | **7** | **24.** These include `validate` · `sync` · `delete` · `list` · `logs` · `traces` · `publish` · `pipeline` · `remote invoke`, and `sam local` has **6** subcommands rather than 3 ([Section 8.3](#83-twenty-four-cli-commands)) |
| Lambda runtimes | Slides 14 · 15 · 22 use `python3.8`; slide 21 uses `python3.9` | **Both are deprecated.** `python3.8` on October 14, 2024 and `python3.9` on December 15, 2025 ([Section 11.3](#113-discouraged-and-unsupported-items)) |

> — Source: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — Source: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — Source: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 1.2 Terminology 🆕

**This deck has no terminology slide.** M12 had term definitions on slide 36, but M13 goes straight from the module summary to "Thank you." There is no place that defines DevOps, continuous integration, infrastructure as code, change set, or deployment configuration, so this terminology section was built from official documentation definitions.

| Term | Definition |
|---|---|
| Continuous integration (CI) | A software development practice where team members use a version control system to frequently integrate their work into the same location, such as a `main` branch. Each change is built and verified in order to detect integration errors as quickly as possible. It **focuses on automatically building and testing code** |
| Continuous delivery | A software development methodology where the release process is automated. Every software change is automatically built, tested, and deployed to production, and before the final push to production, **a person, an automated test, or a business rule** determines when that final push happens. Unlike continuous integration, it **automates the entire release process all the way to production** |
| Infrastructure as code (IaC) | The practice of provisioning and managing infrastructure using code and software development techniques such as version control and continuous integration. The AWS SAM documentation describes AWS SAM itself as "an open-source framework for building serverless applications with infrastructure as code" |
| Stack | The collection of resources provisioned by a CloudFormation template. Deleting a stack deletes all of its resources, so **a collection of resources is managed as a single unit** |
| Change set | A preview of how proposed changes to a stack would affect running resources. CloudFormation changes the stack **only when you decide to execute the change set** |
| Deployment configuration | A set of rules and success and failure conditions used by CodeDeploy during a deployment. It differs depending on whether you deploy to EC2/on-premises, AWS Lambda, or Amazon ECS |
| Deployment type | In-place deployment and blue/green deployment. **All AWS Lambda and Amazon ECS deployments are blue/green** and cannot use in-place deployment |
| AWS SAM project | The directory `sam init` creates. It holds the AWS SAM template, application code, and other configuration files |

> — Source: [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html)

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

> — Source: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

> — Source: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

> — Source: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

> — Source: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

---

## 2. DevOps

### 2.1 Problems with Traditional Software Deployment

Slide 5 presents six problems with traditional deployment. This list is the starting point for the whole module, and each of the tools and strategies covered later targets one of these problems. The last column points to where this document addresses it.

| # | Problem in the courseware | Instructor note | Where this document addresses it |
|---|---|---|---|
| 1 | Inconsistent packaging | If software is not built consistently using the same system, packaging will not be consistent either. That is especially true when it is built on a developer laptop | [Section 9.2](#92-sam-build-and-container-builds) container builds |
| 2 | Inconsistent software deployment | A weak official deployment mechanism creates consistency problems too | [Section 9.4](#94-sam-deploy-and-samconfigtoml) configuration-file-based deployment |
| 3 | Difficult to upgrade | The two factors above make upgrades difficult and awkward | [Section 5](#5-the-sam-template) declaring with templates |
| 4 | No rollback plan | The two factors above also make rollback difficult | [Section 9.5](#95-change-sets-and-rollback) · [Section 10.8](#108-rollback-paths-in-one-place) |
| 5 | Potential for human error | Any process that a person must run manually is prone to error | [Section 9.5](#95-change-sets-and-rollback) reviewing change sets |
| 6 | Manual approvals | Non-automated approval processes can slow deployment down | [Section 2.3](#23-the-three-devops-processes) continuous delivery |

The courseware raises these six problems and looks to DevOps for answers. However, **nothing anywhere in the deck addresses item 4, "no rollback plan."** How to configure rollback never appears. This document fills that gap with the CloudFormation rollback options in [Section 9.5](#95-change-sets-and-rollback) and the alarm-based automatic rollback in [Section 10.8](#108-rollback-paths-in-one-place).

### 2.2 DevOps Culture

Slide 6 presents DevOps culture as eight items. **The slide body labels and the instructor note headings differ in three places** (for example, body "Focus on customer needs" versus note "Customer-needs focused"), so this document standardizes on **the body labels** ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

| # | Item | Instructor note |
|---|---|---|
| 1 | Focus on customer needs | Aligns people, processes, and tools, and drives development that puts the customer above all else. **Feedback loops** keep teams in constant contact with customers so they can adjust |
| 2 | Build a highly collaborative environment | Integrates development and operations to **remove silos**, align goals, and reach shared objectives |
| 3 | Continuous experimentation and learning | Continuously applies the latest best practices |
| 4 | Apply security everywhere | Integrates security **from the very start** of the development process |
| 5 | Automate wherever possible | Automates repetitive tasks so the team can focus on innovation |
| 6 | Develop in small increments | Designs application architecture as **small, loosely coupled components** |
| 7 | Release frequently | Gains the **agility** to respond quickly to customer needs and business goals |
| 8 | Continuous improvement | Carefully defined **metrics** help the team monitor progress and evaluate processes and tools |

The AWS product page "What is DevOps?" that the instructor note cites as a reference **still responds**, and its title is `What is DevOps?`. What its `DevOps Cultural Philosophy` section describes points in the same direction as several of the eight items.

| Documentation statement | Corresponding courseware item |
|---|---|
| Removes the barriers between two traditionally siloed teams, development and operations. The two teams work together to optimize both developer productivity and operational reliability | Item 2, build a highly collaborative environment |
| They communicate frequently, increase efficiency, and work to improve the quality of the services they deliver to customers | Item 1, focus on customer needs |
| They take **full ownership** of a service, often beyond the traditional scope of their role or title. Quality assurance and security teams may also become tightly integrated | Item 4, apply security everywhere |
| Organizations using a DevOps model see the **entire development and infrastructure lifecycle** as part of their own responsibilities, regardless of organizational structure | Item 8, continuous improvement |
| One fundamental practice is to **perform very frequent but small updates**, which lowers the risk of each deployment and helps resolve bugs faster because the team can identify the last deployment that caused an error | Item 6, develop in small increments · Item 7, release frequently |

> — Source: [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/)

### 2.3 The Three DevOps Processes 🔄

Slide 7 presents continuous integration, continuous delivery, and continuous deployment, and the instructor note defines each in one line. **Two items were corrected.**

| Process | Courseware instructor note | Verified content |
|---|---|---|
| Continuous integration (CI) | Builds the software and then deploys it to a non-production environment for automated testing | Points in the same direction. Documentation describes team members using a version control system to frequently integrate their work into the same location, with each change built and verified to **detect integration errors as quickly as possible**, and states that it **focuses on automatically building and testing code** |
| Continuous delivery | **Must go through a manual approval step** before deploying to production | 🔄 **A manual approval is not a required condition.** Documentation states that before the final push to production, **a person, an automated test, or a business rule** determines when that final push happens. It also states that while every successful change can be released to production immediately, **not every change has to be released right away** |
| Continuous deployment (CD) | A fully automated pipeline from build to production deployment | 🔄 **This statement could not be verified.** The CodePipeline documentation we consulted defines continuous integration and continuous delivery but does not define continuous deployment ([Section 11.5](#115-items-we-could-not-verify)) |

**The abbreviations also cause a problem inside the courseware itself.** The instructor note assigns `CI` to continuous integration and `CD` to continuous deployment, and gives continuous delivery no abbreviation. Since both `continuous delivery` and `continuous deployment` are abbreviated `CD` in English, that assignment invites confusion. **This document uses only the abbreviation `CI` and writes the other two out in full.**

Also, slide 7 presents three processes, while the six DevOps practices on slide 9 (see [Section 2.5](#25-devops-practices)) **do not include continuous deployment.** Two slides covering the same family of concepts have different item counts ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

The difference between the two concepts, as a table:

| Aspect | Continuous integration | Continuous delivery |
|---|---|---|
| Focus | Automatically building and testing code | Automating the **entire** release process to production |
| What happens frequently | Team members integrate work into the same location (such as a `main` branch) | Every software change is automatically built, tested, and deployed to production |
| Purpose | Detect integration errors as quickly as possible | Keep every successful change releasable |
| Who decides the final push | Not applicable | A person, an automated test, or a business rule |

> — Source: [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html)

### 2.4 Why Adopt DevOps

Slide 8 presents six benefits of DevOps. **We could not secure evidence for these six items in this verification pass.** The reference URL responded, but the body we retrieved did not include the benefits section. The table below is therefore **the courseware wording as-is**, not verified against official documentation ([Section 11.5](#115-items-we-could-not-verify)).

| # | Benefit | Courseware instructor note |
|---|---|---|
| 1 | Speed | Innovate faster for customers and adapt better to market changes. For example, **microservices and continuous delivery** let teams own their services and release updates more quickly |
| 2 | Rapid delivery | Improve the frequency and pace of releases. **Continuous integration and continuous delivery are practices that automate the software release process from build to deployment** |
| 3 | Reliability | Ensure the quality of application updates and infrastructure changes. Practices such as continuous integration and continuous delivery **test that each change works and is safe**, and **monitoring and logging** provide real-time performance information |
| 4 | Scale | Operate and manage infrastructure and development processes at scale. For example, **infrastructure as code** lets you manage development, test, and production environments in a repeatable and efficient way |
| 5 | Improved collaboration | Build more effective teams under a DevOps cultural model that emphasizes values such as **ownership and accountability**. For example, reduce the **handover period** between development and operations teams, or write code with the environment it runs in in mind |
| 6 | Security | Move quickly while retaining control and preserving compliance. **Automated compliance policies, fine-grained controls, and configuration management techniques** let you adopt a DevOps model without giving up security. For example, **infrastructure as code and policy as code** let you define and track compliance at scale |

Of the six, the practices named in items 3 (monitoring and logging), 4 (infrastructure as code), and 6 (configuration management) come back in [Section 2.5](#25-devops-practices). In other words slide 8 is the "why" and slide 9 is the "with what."

### 2.5 DevOps Practices 🔄

Slide 9 presents six DevOps practices. In the original text boxes, **the space before the conjunction is missing** in the Korean labels for "Monitoring and logging" and "Communication and collaboration," and "Infrastructure as code" is split across two lines. This document renders them normally ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

| # | Practice | Definition in the instructor note |
|---|---|---|
| 1 | Continuous integration | A practice where developers regularly **merge code changes into a central repository** after automated builds and tests run. The goals are ① find and resolve bugs faster ② improve software quality ③ shorten the time to validate and release new updates |
| 2 | Continuous delivery | A practice where code changes for release to production are **automatically built, tested, and prepared**. It extends continuous integration by deploying all code changes to a test or production environment after the build stage. Implemented properly, you always have a **build artifact** that has passed a standardized test process and can be deployed immediately |
| 3 | Microservices | A design approach that builds a single application as **a set of small services**. Each service runs in its own process and typically communicates over a lightweight mechanism such as an **HTTP-based API**, and each service's scope is determined by a **single purpose** |
| 4 | Infrastructure as code | A practice that provisions and manages infrastructure using **code and software development techniques such as version control and continuous integration**. The cloud's **API-driven model** lets you interact with infrastructure programmatically and at scale |
| 5 | Monitoring and logging | Monitor metrics and logs to see how application and infrastructure performance affects the end-user experience. Gain **insight into root causes**, and because services must run around the clock, **active monitoring** matters |
| 6 | Communication and collaboration | One of the **key cultural aspects** of DevOps. Tooling and automation bring development and operations workflows and responsibilities together so that collaboration happens. Teams use chat applications, issue tracking systems, project tracking systems, and wikis |

🔄 **The documentation presents one more.** The `What is DevOps?` page presents **configuration management** alongside infrastructure as code as an infrastructure automation practice, and states that these two practices help keep compute resources **elastic**. The six-item list in the courseware does not include configuration management.

Separating what the documentation confirms from what it does not:

| Courseware item | Confirmed in documentation |
|---|---|
| Continuous integration | Confirmed |
| Continuous delivery | Confirmed |
| Microservices | Confirmed. The documentation describes breaking large, complex systems into simple, independent projects, with each service's scope set by a **single purpose or function** |
| Infrastructure as code | Confirmed, but **we did not consult a standalone IaC definition page** — only the mention on the `What is DevOps?` page ([Section 11.5](#115-items-we-could-not-verify)) |
| Monitoring and logging | Confirmed. The documentation describes it as helping engineers track application and infrastructure performance so they can respond to problems quickly |
| Communication and collaboration | Corresponds to the cultural philosophy section's statements about removing silos and communicating frequently |
| — | 🆕 **Configuration management** — presented by the documentation but absent from the courseware list |

The documentation also states that **the combination of microservices and increased release frequency** greatly increases the number of deployments and creates operational challenges, and that DevOps practices such as continuous integration and continuous delivery address them. The courseware lists the six practices side by side without explaining this causal link.

> — Source: [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/)

---

## 3. Infrastructure as Code and Deployment Tools

### 3.1 Infrastructure as Code

The courseware explains infrastructure as code as one of the six practices on slide 9, and confirms it again in knowledge check question 2 on slide 30 ("Infrastructure as code is an important DevOps practice" — true). But **the courseware explains IaC only as a concept and never connects it to tools.** CloudFormation appears only as a name in the tool list on slide 10, and nowhere in the deck does it say that AWS SAM is an IaC tool.

Per the documentation, the IaC connections for this module are as follows.

| Concept | Documentation statement |
|---|---|
| What infrastructure as code is | The practice of provisioning and managing infrastructure using code and software development techniques such as version control and continuous integration |
| CloudFormation's role | You create a **template** that describes all the AWS resources you want, and CloudFormation provisions and configures them. You do not have to create and configure each resource individually or **work out what depends on what** |
| Why it connects to version control | Because templates are text files, you can **track infrastructure changes with a version control system** the way you manage revisions of source code, and if you need to reverse an infrastructure change you can use **a previous version of the template** |
| Where AWS SAM sits | AWS SAM is an **open-source framework for building serverless applications with infrastructure as code** |

That third row is the first answer to problem 4 ("no rollback plan") from [Section 2.1](#21-problems-with-traditional-software-deployment). The courseware instructor note introduces CloudFormation without covering this point.

> — Source: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 3.2 AWS Tools for DevOps

Slide 10 lists nine tools and the instructor note describes eight of them in one line each (the ninth is "and many more"). The table separates what we verified from what we did not.

| Service | Courseware instructor note | Verification status |
|---|---|---|
| AWS CodeBuild | Builds and tests code with continuous scaling on a pay-as-you-go model | **Verified.** Documentation describes CodeBuild as a **fully managed build service in the cloud** that compiles source code, runs unit tests, and produces artifacts ready to deploy, and states that you **pay only for the build minutes you consume** |
| AWS CodeArtifact | Secure, scalable, and cost-effective software artifact management | **Not verified** ([Section 11.5](#115-items-we-could-not-verify)) |
| AWS CodeDeploy | Automates code deployments | **Verified.** [Section 10](#10-deployment-strategies) covers deployment types, compute platforms, and deployment configurations in detail |
| AWS CodePipeline | Automates continuous delivery pipelines | **Verified.** Documentation describes CodePipeline as a **continuous delivery service** used to **model, visualize, and automate** the steps required to release software |
| AWS Config | Measures, audits, and evaluates the configuration of AWS resources | **Not verified** ([Section 11.5](#115-items-we-could-not-verify)) |
| AWS CloudFormation | Gives developers and businesses a way to create a collection of related AWS and third-party resources and provision and manage them in an orderly and predictable fashion | **Verified.** It matches the documentation's description of templates, stacks, and automatic dependency handling. Note that the current documentation title and body refer to the service without a prefix, as **`CloudFormation`** |
| Amazon CloudWatch | Collects data from all AWS resources, and provides access to and correlation of that data | **Not verified** ([Section 11.5](#115-items-we-could-not-verify)) |
| AWS X-Ray | Analyzes and debugs production or distributed applications | **Not verified** ([Section 11.5](#115-items-we-could-not-verify)) |
| And many more | (no description) | — |

The courseware's CloudFormation sentence repeats an adverb of the same meaning ("easily … easily create"). The table above cleans that up ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

The `DevOps pipeline example` in the CodePipeline documentation shows how these three services actually fit together. It is the evidence behind knowledge check question 3 on slide 30 ("AWS CodePipeline can orchestrate AWS CodeBuild and AWS CodeDeploy" — true).

| Stage | Action | Documentation statement |
|---|---|---|
| Source | GitHub source action | When a developer pushes a commit, CodePipeline detects the change and a pipeline execution starts. The source action's **output artifact** becomes the **input artifact** of the next stage's action |
| Prod (1) | Build action | A build project created in CodeBuild |
| Prod (2) | Test action | A unit test project created in CodeBuild |
| Prod (3) | Deploy action | Deploys the application to the production environment |
| Prod (4) | Test action | An integration test project created in CodeBuild |

The documentation states that CodeBuild can be **added to a CodePipeline pipeline's build or test stage as a build action or test action.** CodeBuild can be run from the CodeBuild console or the CodePipeline console, and automated with the AWS CLI or AWS SDKs.

> — Source: [What is AWS CodeBuild?](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html)

> — Source: [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)

> — Source: [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

### 3.3 Comparing IaC Tools 🆕

The courseware explains the relationship between AWS SAM and CloudFormation only as "it transforms" ([Section 4.3](#43-how-it-works-transformation)) and never mentions the AWS CDK. The documentation offers **guidance on when to use which**.

| Situation | Documentation guidance |
|---|---|
| You want to **simplify defining serverless resources** while keeping template compatibility | **AWS SAM** instead of CloudFormation |
| You want to describe infrastructure **declaratively** rather than programmatically | **AWS SAM** instead of the AWS CDK |
| You are already building an application with the CDK | You can **use both together.** Complement your CDK application with the AWS SAM CLI's local testing features |

The relationship among the three tools:

| Tool | What it is | Its role in this module |
|---|---|---|
| CloudFormation | A service that models and provisions AWS resources from templates. A collection of resources is managed as a single unit called a **stack** | The side that **actually executes** the template AWS SAM transforms. Change sets and rollback live here ([Section 9.5](#95-change-sets-and-rollback)) |
| AWS SAM | An open-source framework for building serverless applications with infrastructure as code. **An extension of CloudFormation** that provides shorthand syntax | The subject of this module |
| AWS CDK | (Presented by the documentation as a comparison) Describes infrastructure **programmatically** | Can be complemented by the SAM CLI's local testing |

The documentation presents five AWS SAM use scenarios.

| Scenario | Content |
|---|---|
| Serverless applications | Define Lambda functions, Lambda durable functions, API Gateway APIs, DynamoDB tables, and more with minimal code |
| Augmenting CloudFormation | Add serverless components to an existing CloudFormation template. **SAM resources and standard CloudFormation resources work together in the same template** |
| Local development and testing | [Section 8](#8-installing-the-sam-cli-and-local-testing) |
| Serverless CI/CD | The `sam pipeline` family of commands corresponds to this ([Section 8.3](#83-twenty-four-cli-commands)) |
| Migration | Move resources created in the console to infrastructure as code |

The second and fifth scenarios are absent from the courseware.

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 3.4 No Source Repository in the List 🆕

Slide 9 defines continuous integration as "regularly merging code changes into a **central repository**." Yet **there is not a single source repository service in the tool list on slide 10.** The deck never answers what that central repository should be.

The `DevOps pipeline example` in the CodePipeline documentation we consulted configures the source stage as a **GitHub repository** with a GitHub source action. In other words, the central repository in the current documentation's example is GitHub.

| Item | Status |
|---|---|
| Source in the documentation example | A GitHub repository plus a GitHub source action. A commit push is detected and a pipeline execution starts |
| AWS CodeCommit | **Not verified.** We tried the developer guide, the FAQ, and documentation search, but found no notice that it is closed to new customers. We did not fill this in by guessing ([Section 11.5](#115-items-we-could-not-verify)). Note that CodeCommit **does not appear** in the tool list on slide 10 |

> — Source: [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)

---

## 4. AWS SAM

### 4.1 What AWS SAM Is

The body of slide 12 is one line: "AWS SAM is an open-source framework used to deploy serverless applications." The documentation narrows that slightly.

| Item | Documentation statement |
|---|---|
| What it is | **An open-source framework for building serverless applications with infrastructure as code (IaC)** |
| How it works | You declare CloudFormation resources and special serverless resources with AWS SAM's **shorthand syntax**, and they are transformed into infrastructure **during deployment** |
| What the SAM template is | **An extension of CloudFormation** that provides simplified syntax for defining serverless resources |
| What a project is | The directory `sam init` creates. It holds the AWS SAM template, application code, and other configuration files |

The documentation's "**building** with infrastructure as code" is broader than the courseware's "used to deploy." SAM is not only a deployment tool; it covers the whole cycle of authoring, building, deploying, testing, and monitoring ([Section 8.3](#83-twenty-four-cli-commands)).

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 4.2 The Two Components

Slide 12 splits AWS SAM into two components. The documentation presents the same two.

| Component | Courseware instructor note | Documentation statement |
|---|---|---|
| AWS SAM template specification | Provides efficient syntax for describing the **functions, APIs, permissions, configuration, and events** that make up a serverless application. Treats it as a deployable, versioned **single entity** | **An extension of CloudFormation** that provides simplified syntax for defining serverless resources |
| AWS SAM CLI | A tool for building the serverless application defined in an AWS SAM template | A command line tool that helps with the **development, local testing, and deployment** of serverless applications |

The instructor note lists four things the CLI can do. **The command name for the first is nowhere in the deck.**

| # | Courseware instructor note | Corresponding command |
|---|---|---|
| 1 | Verify that the AWS SAM template file is written to specification | 🆕 **`sam validate`**. The courseware never gives this command name ([Section 8.5](#85-sam-validate)) |
| 2 | Invoke Lambda functions locally | `sam local invoke` ([Section 8.7](#87-sam-local-invoke-and-docker)) |
| 3 | Step-debug Lambda functions | The `sam local` family ([Section 8.6](#86-six-sam-local-subcommands)) |
| 4 | Package and deploy serverless applications to the AWS Cloud | `sam deploy`. **Packaging is now part of `sam deploy`** ([Section 9.3](#93-sam-package-is-no-longer-a-separate-step)) |

Of the five **key features** the documentation presents, the last three are absent from the courseware.

| Key feature | In the courseware? |
|---|---|
| Define infrastructure code quickly with less code | Yes |
| Manage the entire lifecycle — author, build, deploy, test, monitor — with the AWS SAM CLI | Partly (monitoring is missing) |
| 🆕 Quickly provision permissions between resources with **AWS SAM connectors** | No ([Section 6.3](#63-connectors)) |
| 🆕 Continuously sync local changes to the cloud during development with **`sam sync`** | No ([Section 9.6](#96-reducing-the-development-loop-with-sam-sync)) |
| 🆕 Locally debug and test Lambda functions and layers of **Terraform** serverless applications with the AWS SAM CLI | No |

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

> — Source: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

### 4.3 How It Works: Transformation

Slide 13 shows the transformation flow in a single diagram. **This statement matches the current documentation.**

| Courseware slide 13 | Documentation verification |
|---|---|
| AWS SAM **transforms** the resources in its own template (**YAML or JSON**) into the corresponding AWS CloudFormation template | Matches. The documentation lists **Transformational** as one of the specification's characteristics and states that AWS SAM performs the complex work of transforming the template into the code needed to provision infrastructure through CloudFormation |
| It then applies the CloudFormation template to create and update AWS resources | Matches |
| Diagram order: AWS SAM template → AWS CloudFormation template → AWS resources | Matches |

The four characteristics of the template specification that the documentation presents:

| Characteristic | Content |
|---|---|
| Built on AWS CloudFormation | You can use **CloudFormation syntax directly** in an AWS SAM template |
| An extension of CloudFormation | You can use **CloudFormation syntax and AWS SAM syntax together** in the same template |
| An abstract, short-hand syntax | Describes the same infrastructure in fewer lines |
| Transformational | AWS SAM expands the shorthand syntax into CloudFormation syntax |

The second item is the evidence behind knowledge check question 4 on slide 30 ("An AWS SAM template is an extension of an AWS CloudFormation template" — true).

🆕 **The documentation also states how much the transformation grows.** Its example is a **23-line** AWS SAM template with one Lambda function, one HTTP API, one `SimpleTable`, and one connector, and it states that during deployment those 23 lines are transformed into **over 200 lines** of CloudFormation syntax. It also names what each expands into.

| AWS SAM resource | Transformed CloudFormation resources |
|---|---|
| `AWS::Serverless::Function` | `AWS::Lambda::Function` + `AWS::IAM::Role`(with `arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole` in `ManagedPolicyArns`) + `AWS::Lambda::Permission` |
| `HttpApi` event | `AWS::ApiGatewayV2::Api`(logical ID `ServerlessHttpApi`) + `AWS::ApiGatewayV2::Stage`(`$default` stage, `AutoDeploy` `true`) |
| `AWS::Serverless::SimpleTable` | `AWS::DynamoDB::Table`(a string attribute with `id` as the `HASH` key, `BillingMode` `PAY_PER_REQUEST`) |

Resources SAM creates carry `SamResourceId` in `Metadata` and a `lambda:createdBy=SAM` tag.

🔄 **The courseware does not make clear "when" the transformation happens.** The documentation states that it is performed **during deployment**, which is why the `Transform` declaration in [Section 5.2](#52-the-transform-declaration) is needed. When the template is deployed to CloudFormation, CloudFormation reads that declaration and applies the serverless transform.

> — Source: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

### 4.4 When to Use AWS SAM 🆕

The courseware does not summarize when to use SAM. Read together with the comparison in [Section 3.3](#33-comparing-iac-tools), the decision criteria come out as follows.

| Decision point | Choice |
|---|---|
| You want to define serverless resources with minimal code | AWS SAM |
| You already have a CloudFormation template and only want to add serverless components | AWS SAM. **The two syntaxes work together in the same template** |
| You want to invoke and debug Lambda functions locally | The AWS SAM CLI ([Section 8.7](#87-sam-local-invoke-and-docker)) |
| You want to build a serverless CI/CD pipeline | AWS SAM (`sam pipeline`) |
| You want to move console-created resources to infrastructure as code | AWS SAM |
| You want to describe infrastructure in a programming language | The AWS CDK, though you can still complement it with the SAM CLI's local testing |
| You are building serverless applications with Terraform | The AWS SAM CLI can locally debug and test Lambda functions and layers |

> — Source: [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

### 4.5 AWS Serverless Application Repository 🆕

The courseware does not cover this service at all. It is the path for sharing SAM applications, and both the `sam publish` command ([Section 8.3](#83-twenty-four-cli-commands)) and the `AWS::Serverless::Application` resource type ([Section 6.1](#61-thirteen-resource-types)) connect to it, so it is worth noting in a module about SAM.

| Item | Documentation statement |
|---|---|
| What it is | A service that lets developers and enterprises **quickly find, deploy, and publish** serverless applications in the AWS Cloud |
| Sharing scope | Share **publicly** with the whole community, or **privately** within a team or organization |
| How to publish | Upload code with the AWS Management Console, the AWS SAM CLI, or the AWS SDKs, uploading a **manifest file (an AWS SAM template)** along with the code |
| Integration | **Deeply integrated with the AWS Lambda console** |
| How to browse | Browse by category keyword (web, mobile backend, data processing applications, chatbots, and so on) or search by **name, publisher, or event source** |
| Availability | **Generally available at the time we checked.** The page carries no notice that it is closed to new customers |

It also connects to [Section 5.7](#57-sam-policy-templates). The documentation states that **AWS SAM applications in the AWS Serverless Application Repository that use policy templates do not require special customer acknowledgment when deployed.**

> — Source: [What Is the AWS Serverless Application Repository?](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html)

> — Source: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

---

## 5. The SAM Template

### 5.1 Template Sections 🔄

Slide 14 shows a full SAM template for the first time and annotates three lines (`Transform`, `Globals`, `Resources`). **The courseware does not distinguish which sections are required.** The documentation does.

| Section | Required? | Content |
|---|---|---|
| `Transform` | **Required** | This declaration **identifies** a CloudFormation template file as an AWS SAM template file ([Section 5.2](#52-the-transform-declaration)) |
| `Globals` | Optional | AWS SAM-specific section. Declares properties common to several resources once ([Section 5.3](#53-the-globals-section)) |
| `Description` | Optional | Corresponds to the same section in a CloudFormation template |
| `Metadata` | Optional | Same |
| `Parameters` | Optional | Same. Objects declared here make `sam deploy --guided` **display additional prompts** |
| `Mappings` | Optional | Same |
| `Conditions` | Optional | Same |
| `Resources` | **Required** | **CloudFormation resources and AWS SAM resources can be mixed here** |
| `Outputs` | Optional | Same |

The documentation states that **only the Transform and Resources sections are required.** Everything else is optional, and every other section corresponds to the CloudFormation template section of the same name.

There are exactly three differences between a SAM template and a CloudFormation template.

| Difference | Content |
|---|---|
| `Transform` declaration | Required in an AWS SAM template. Not needed in a CloudFormation template |
| `Globals` section | AWS SAM-specific. **CloudFormation templates have no equivalent section** |
| `Resources` section | An AWS SAM template's `Resources` can hold both kinds of resource |

There are also rules about section order and precedence.

| Rule | Content |
|---|---|
| Section order | Sections can appear in any order. However, when using language extensions, **`AWS::LanguageExtensions` must come before the serverless transform (`AWS::Serverless-2016-10-31`)** |
| Parameter value precedence | Values passed with `sam deploy`'s **`--parameter-overrides`** and entries in the **configuration file** take **precedence** over entries in the AWS SAM template file |

The first line of the slide 14 template, `AWSTemplateFormatVersion: '2010-09-09'`, is not in the documentation's list of SAM template sections. However, that line appears as-is in template examples on other SAM documentation pages, so **the courseware notation is not wrong.**

The URL `sam-specification-template-anatomy.html` that the slide 16 instructor note cites as a reference **is still valid**, and the page title is `AWS SAM template anatomy`.

> — Source: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

### 5.2 The Transform Declaration 🔄

The second line of the slide 14 template reads as follows.

```yaml
# Courseware slide 14 notation - the first letter of serverless is lowercase
Transform: AWS::serverless-2016-10-31
```

The value the documentation specifies uses a **capital `S`**.

```yaml
# The value the documentation specifies - capital S, and this declaration is required
Transform: AWS::Serverless-2016-10-31
```

| Item | Courseware | Verified content |
|---|---|---|
| Value | `AWS::serverless-2016-10-31` | **`AWS::Serverless-2016-10-31`** |
| Required? | Not mentioned | **Required** |
| Role | "Tells AWS CloudFormation that this is an AWS SAM template" | Same direction. The documentation states that this declaration **identifies a CloudFormation template file as an AWS SAM template file** |

**The notation also splits inside the courseware.** The resource type in the same code block is `Type: AWS::Serverless::Function`, with a capital `S`. The same word is capitalized differently within one block ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

Why this typo is dangerous in practice is clear. If the transform declaration is not recognized, `AWS::Serverless::*` resources are not expanded, which leaves CloudFormation facing an unknown resource type. **If a student copies the courseware template verbatim, the deployment fails.**

> — Source: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

### 5.3 The Globals Section 🔄

The annotation box on slide 14 describes `Globals:` this way: "Sets the **global variables** to be used within the AWS SAM template."

🔄 **`Globals` is not a section for declaring variables.** The documentation describes it as the section where you declare **properties that several resources have in common** once and let them inherit. For example, if several `AWS::Serverless::Function` resources have the same `Runtime`, `Memory`, `VPCConfig`, `Environment`, and `Cors` configuration, you declare it once in `Globals` and let the resources inherit it instead of duplicating the information on every resource.

| Aspect | `Globals` | `Parameters` |
|---|---|---|
| What it does | Declares **properties** common to several resources once for inheritance | **Parameterizes values** in the template |
| Behavior at deployment | Inherited as resource properties | `sam deploy --guided` displays additional prompts; overridden with `--parameter-overrides` |
| CloudFormation equivalent | **None**(AWS SAM-specific) | Exists |

What the courseware put inside `Globals` is not a variable either. It is `MethodSettings` on `Api`, so it is **a common value for a resource property.** That example itself is valid: `MethodSettings` is on the list of properties supported for `Api` in `Globals`.

```yaml
# The Globals block from courseware slide 14 - the example itself is valid.
# Every Api resource in this template inherits the MethodSettings below
Globals:
  Api:
    MethodSettings:
      - LoggingLevel: INFO
```

🆕 **Eight resource types inherit from `Globals`.** The courseware provides no list.

| # | Resource type | On courseware slide 16? |
|---|---|---|
| 1 | `AWS::Serverless::Api` | Yes |
| 2 | `AWS::Serverless::CapacityProvider` | **No** |
| 3 | `AWS::Serverless::Function` | Yes |
| 4 | `AWS::Serverless::HttpApi` | Yes |
| 5 | `AWS::Serverless::SimpleTable` | Yes |
| 6 | `AWS::Serverless::StateMachine` | Yes |
| 7 | `AWS::Serverless::MicrovmImage` | **No** |
| 8 | `AWS::Serverless::NetworkConnector` | **No** |

Resources and properties not on the list are not supported. The documentation gives two reasons: ① they could open potential security issues, or ② they would make the template harder to understand.

The properties supported for `Api` in `Globals` are as follows.

| Properties |
|---|
| `AccessLogSetting` · `Auth` · `BinaryMediaTypes` · `CacheClusterEnabled` · `CacheClusterSize` |
| `CanarySetting` · `Cors` · `DefinitionUri` · `Domain` · `EndpointConfiguration` |
| `EndpointAccessMode` · `GatewayResponses` · `MethodSettings` · `MinimumCompressionSize` · `Name` |
| `OpenApiVersion` · `PropagateTags` · `SecurityPolicy` · `TracingEnabled` · `Variables` |

🆕 **The override rules differ by data type.** This is absent from the courseware and is a frequent stumbling block in practice.

| Data type | Override behavior |
|---|---|
| Primitive types (string · number · boolean) | The value in the `Resources` section **replaces** the value in `Globals` |
| Maps | **Merged**, with the `Resources` entry winning on duplicate keys |
| Lists | Items from `Globals` are **prepended** to the `Resources` list (additive) |

The most important restriction is this: **a resource can give a new value to a property declared in `Globals`, but it cannot remove that property.** So do not declare in `Globals` a property that only some resources use.

AWS SAM also creates an **implicit API** when you declare an API in the `Events` section, and `Globals` can override all properties of that implicit API.

> — Source: [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html)

### 5.4 Correcting the Slide 14 Template 🔄

Here is the slide 14 template as written. **The slide's text box has no indentation, so each line arrives as a separate paragraph.** The order is preserved and only the indentation was restored so it reads as YAML. The original carries no hierarchy information.

```yaml
# Courseware slide 14 as written (indentation restored only). Before correction
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

The instructor note describes the template this way: it defines a list function in AWS Lambda, specifies the runtime, the location of the function code, and the handler, attaches the `AmazonDynamoDBReadOnlyAccess` IAM policy so the function can query Amazon DynamoDB, and finally connects the function to `/notes` on an Amazon API Gateway endpoint.

**Here is exactly what was changed.**

| # | Courseware notation | Correction | Reason |
|---|---|---|---|
| 1 | `Transform: AWS::serverless-2016-10-31` | `Transform: AWS::Serverless-2016-10-31` | The documented value uses a capital `S` ([Section 5.2](#52-the-transform-declaration)) |
| 2 | `Runtime: python3.8` | `Runtime: python3.12` | The `python3.8` runtime **reached end of support on October 14, 2024** ([Section 11.3](#113-discouraged-and-unsupported-items)) |
| 3 | `Policies: AmazonDynamoDBReadOnlyAccess` | `Policies: - DynamoDBReadPolicy: TableName: !Ref pollyNotesTable` | The managed policy grants read access to **every table in the account.** A policy template narrows it to the target table ([Section 5.7](#57-sam-policy-templates)) |
| 4 | (absent) | Added the `pollyNotesTable` resource definition | Slide 15 uses `!Ref pollyNotesTable` but the deck contains no definition |

The corrected template:

```yaml
# Corrected. Transform capitalization, runtime, and permission style were fixed
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

# Declare properties that several Api resources share exactly once
Globals:
  Api:
    MethodSettings:
      - LoggingLevel: INFO

Resources:
  # The table that holds the notes. Added because the courseware template
  # references it without defining it
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/          # A relative path resolved against the template location
      Handler: app.lambda_handler
      Runtime: python3.12              # Corrected to a supported runtime
      Policies:
        # Use a policy template instead of a managed policy name so the
        # permission is narrowed to this one table
        - DynamoDBReadPolicy:
            TableName: !Ref pollyNotesTable
      Events:
        listNotes:
          Type: Api                    # Without an explicit API resource, an implicit API is created
          Properties:
            Path: /notes
            Method: get
```

The translation in annotation box 3 was also cleaned up. The courseware renders it as "creates an AWS Lambda function using the referenced managed IAM policy, runtime, and code-defined handler," which is structurally unclear. Split into three items:

| Courseware's compressed phrasing | Split notation |
|---|---|
| Referenced managed IAM policy | The IAM policy it references (`Policies`) |
| Runtime | The runtime (`Runtime`) |
| Code-defined handler | The handler defined in the code (`Handler`) |

For `Type: Api` under `Events`, the courseware annotation says only "creates an Amazon API Gateway and handles the necessary mappings and permissions." Per the documentation, what gets created here is an **implicit API**, and with an `HttpApi` event you get `AWS::ApiGatewayV2::Api`(logical ID `ServerlessHttpApi`) and a `$default` stage ([Section 4.3](#43-how-it-works-transformation)). To reference an explicit API resource, use `RestApiId` ([Section 7.3](#73-declaring-it-with-the-auth-property)).

> — Source: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — Source: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 5.5 Correcting the Slide 15 Template 🔄

Slide 15 shows a template fragment defining a Delete function. **This slide has the highest concentration of problems.**

```yaml
# Courseware slide 15 as written (indentation restored only). Before correction
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

The instructor note describes it this way: "The section on the right shows an AWS SAM template defining a **Delete function** in AWS Lambda. It sets the runtime, the location of the function code, and the handler. The code location depends on the `template.yml` file that contains the AWS SAM template. In this example the code is in a folder called **`deleteFunction`**."

**Here is exactly what was changed.**

| # | Courseware notation | Correction | Reason |
|---|---|---|---|
| 1 | `Role: ... DynamoDBReadRole` | `Policies: - DynamoDBCrudPolicy: TableName: !Ref pollyNotesTable` | **Deleting requires write permission.** A read role cannot delete an item |
| 2 | `Runtime: python3.8` | `Runtime: python3.12` | The `python3.8` runtime is deprecated |
| 3 | `Events: listNotes:` | `Events: deleteNote:` | This is a Delete function, yet the event name matches `listNotes` from slide 14. A copy-paste artifact |
| 4 | Instructor note "a folder called `deleteFunction`" | The logical ID is `deleteFunction`; the code folder is `delete-function/` | `deleteFunction` is not a folder name but a **logical resource ID** |
| 5 | `Properties: ...` (truncated) | Filled in `Path` and `Method` | The original is cut off with an ellipsis |
| 6 | `!Ref pollyNotesTable`(no definition) | Included the table resource | The reference target is absent from the deck |
| 7 | Label "SAM template" | "AWS SAM template" | Every other slide says "AWS SAM template" |

The corrected template:

```yaml
# Corrected. The permission became a write-capable policy template and the
# event name now matches the function's purpose
Resources:
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  deleteFunction:                      # Logical resource ID (not a folder name)
    Type: AWS::Serverless::Function
    Properties:
      Description: Delete function
      CodeUri: delete-function/        # The actual code folder
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        # Deleting requires write permission. Crud covers create, read, update, delete
        - DynamoDBCrudPolicy:
            TableName: !Ref pollyNotesTable
      Environment:
        Variables:
          TABLE_NAME: !Ref pollyNotesTable
      Events:
        deleteNote:                    # Renamed to match the function's purpose
          Type: Api
          Properties:
            Path: /notes/{id}
            Method: delete
```

**The deck never explains why the permission style differs from slide 14.** Slide 14 uses `Policies`, slide 15 uses `Role`. The relationship between the two properties is covered in [Section 5.6](#56-function-permissions-policies-and-role). The short version: **if you set `Role`, `Policies` is ignored.**

> — Source: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

> — Source: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

### 5.6 Function Permissions Policies and Role 🔄

The courseware grants function permissions two different ways on two slides without explaining the difference or the precedence, so here it is.

| Property | Documentation statement |
|---|---|
| `Policies` | Permission policies for this function, **appended to the function's default IAM execution role.** Accepts a single value or a list of values |
| `Role` | The ARN of an IAM role to use as this function's execution role. **Required in CloudFormation but not required in AWS SAM** |
| If you set both | 🔄 The documentation is explicit: **if you set the Role property, this property (`Policies`) is ignored** |
| If you set neither | A role with the logical ID **`<function-logical-id>Role`** is created automatically |

Setting `Role` directly makes some properties unusable.

| Property | Condition |
|---|---|
| `RolePath` | Used **only when the role is created automatically.** Not used when you specify `Role` |
| `PermissionsBoundary` | Also works **only when the role is created automatically** |
| `Tracing` | If set to `Active` or `PassThrough` and **`Role` is not set**, AWS SAM adds the `arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess` policy to the execution role it creates |

🆕 **`Policies` accepts four kinds of value.** The courseware gives only a managed policy name.

| # | Kind of value | Example |
|---|---|---|
| 1 | **AWS SAM policy templates** | `DynamoDBReadPolicy` with `TableName` ([Section 5.7](#57-sam-policy-templates)) |
| 2 | The **ARN** of an AWS managed or customer managed policy | `arn:aws:iam::aws:policy/...` |
| 3 | The **name** of an AWS managed policy from a defined list | The courseware's `AmazonDynamoDBReadOnlyAccess` |
| 4 | An **inline IAM policy** written as a YAML map | Written directly in the template |

```yaml
# A comparison of the three approaches. This does not mean using all three
# on the same function
Resources:
  # (1) Recommended - narrow the permission to the target resource with a policy template
  functionA:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-a/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref pollyNotesTable

  # (2) The courseware slide 14 approach - a managed policy name.
  #     This opens up every table in the account
  functionB:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-b/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies: AmazonDynamoDBReadOnlyAccess

  # (3) The courseware slide 15 approach - an existing role ARN.
  #     Setting Role makes Policies ignored, so do not use both properties together
  functionC:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn-c/
      Handler: app.lambda_handler
      Runtime: python3.12
      Role: !Sub arn:aws:iam::${AWS::AccountId}:role/MyExistingExecutionRole
```

Other `AWS::Serverless::Function` defaults are absent from the courseware too.

| Property | Default or rule |
|---|---|
| `Timeout` | **3 seconds** |
| `Architectures` | `x86_64` |
| `PackageType` | `Zip`. With `Zip`, either `CodeUri` or `InlineCode` is **required** |
| `CodeUri` | Accepts the function's Amazon S3 URI, a **local path** (for example `hello_world/`), or a `FunctionCode` object |
| `Runtime` | Required only when `PackageType` is `Zip`, and the value is **passed directly** to the `Runtime` property of `AWS::Lambda::Function` |
| `PackageType: Image` | A function packaged as a container image. In that case **only `ImageUri` applies and `Runtime`, `CodeUri`, and `InlineCode` are ignored** |

Specifying `DeploymentPreference` and `AutoPublishAlias` makes SAM create resources automatically, which is covered in [Section 10.4](#104-declaring-deployment-strategy-in-a-sam-template).

> — Source: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 5.7 SAM Policy Templates 🆕

The courseware gives only one value for `Policies`, the AWS managed policy name `AmazonDynamoDBReadOnlyAccess`, and never covers policy templates. Policy templates are **the approach SAM recommends.**

| Item | Documentation statement |
|---|---|
| What they are | A list of predefined policies AWS SAM provides so you can **scope the permissions of Lambda functions and AWS Step Functions state machines to the resources your application uses** |
| How many | **79 rows** in the policy template table |
| Side effect | AWS Serverless Application Repository applications that use policy templates **do not require special customer acknowledgment** when deployed |

**There is one syntax rule, and missing it breaks the build.**

| Rule | Content |
|---|---|
| Templates that need placeholders | Must be given an **object** holding the placeholder values |
| Templates that need no placeholders | Must be given an **empty object (`{}`)** |
| If you omit it | Running `sam build` fails with `Must specify valid parameter values for policy template '<policy-template-name>'` |
| Regular IAM and managed policies | Passed straight through to CloudFormation, so they are used **without an empty object** |
| Mixing | A single `Policies` list can hold **both** managed policies and policy templates |

```yaml
# The syntax rule for policy templates
Resources:
  myFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: fn/
      Handler: app.lambda_handler
      Runtime: python3.12
      Policies:
        # A managed policy name is used as-is
        - AmazonSQSFullAccess
        # A policy template with a placeholder takes an object of values
        - DynamoDBCrudPolicy:
            TableName: !Ref pollyNotesTable
        # A policy template with no placeholder still needs an empty object.
        # Omitting it makes sam build fail
        - CloudWatchPutMetricPolicy: {}
```

There are seven DynamoDB-related policy templates.

| Policy template | Permission |
|---|---|
| `DynamoDBReadPolicy` | **Read-only** permission to a DynamoDB table |
| `DynamoDBWritePolicy` | **Write-only** permission to a table |
| `DynamoDBCrudPolicy` | **Create, read, update, and delete** permission to a table |
| `DynamoDBStreamReadPolicy` | Permission to describe and read DynamoDB streams and records |
| `DynamoDBReconfigurePolicy` | Permission to reconfigure a table |
| `DynamoDBBackupFullAccessPolicy` | Read and write permission to on-demand backups of a table |
| `DynamoDBRestoreFromBackupPolicy` | Permission to restore a table from a backup |

The right choices for the courseware's two functions:

| Courseware function | Permission the courseware gives | The right policy template |
|---|---|---|
| Slide 14 `listFunction` | `AmazonDynamoDBReadOnlyAccess`(every table in the account) | `DynamoDBReadPolicy` with `TableName` |
| Slide 15 `deleteFunction` | `DynamoDBReadRole`(a read role) | `DynamoDBCrudPolicy` or `DynamoDBWritePolicy` |

To request a new policy template, submit a pull request to the `policy_templates.json` source file on the `develop` branch of the AWS SAM GitHub project, along with an issue containing your reasoning and links.

> — Source: [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)

### 5.8 Template File Names and Relative Paths 🔄

The slide 15 instructor note writes the SAM template file name as `template.yml`.

| Item | Courseware | Verified content |
|---|---|---|
| Template file name | Only `template.yml` | The default for `sam build`'s `--template-file`(`--template`, `-t`) is **`template.yaml` or `template.yml`** — that is, **both** are allowed. The `sam validate` documentation states that the option is not needed if a template named **`template.yaml`, `template.yml`, or `template.json`** is in the current working directory |
| The file name `sam init` creates | — | **Not verified.** We confirmed only the default names the CLI looks for ([Section 11.5](#115-items-we-could-not-verify)) |
| What `CodeUri` relative paths resolve against | "The code location depends on the `template.yml` file that contains the AWS SAM template" | Same intent. The documentation states that by default relative paths to source code folders are **resolved with respect to the AWS SAM template's location** |

`--base-dir`(`-s`) changes that basis, and the option applies to five properties.

| Resource | Property |
|---|---|
| `AWS::Serverless::Function` | `CodeUri` |
| `AWS::Serverless::Function` | The `DockerContext` entry of the `Metadata` resource attribute |
| `AWS::Serverless::LayerVersion` | `ContentUri` |
| `AWS::Lambda::Function` | `Code` |
| `AWS::Lambda::LayerVersion` | `Content` |

Other defaults the `sam build` documentation states:

| Item | Default |
|---|---|
| `--template-file` | `template.yaml` or `template.yml` |
| `--config-file` | **`samconfig.toml`** at the project directory root |
| `--config-env` | `default` |
| The cache directory for `--cached` | `.aws-sam/cache` |
| Build artifacts | `.aws-sam/build`. The built template is `.aws-sam/build/template.yaml` |

The slide 13 instructor note's "its own template (**YAML or JSON**)" is also supported by the `sam validate` `--template-file` description accepting `template.yaml`, `template.yml`, and `template.json`.

> — Source: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

> — Source: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

---

## 6. SAM Resource Types and Connectors

### 6.1 Thirteen Resource Types 🔄

Slide 16 presents six `AWS::Serverless::*` resource types. **The current documentation lists thirteen.**

| # | Resource type | In the courseware? | What it is |
|---|---|---|---|
| 1 | `AWS::Serverless::Api` | Yes | API Gateway REST API |
| 2 | `AWS::Serverless::Application` | **No** 🆕 | A nested serverless application |
| 3 | `AWS::Serverless::CapacityProvider` | **No** 🆕 | — |
| 4 | `AWS::Serverless::Connector` | **No** 🆕 | **Configures permissions between two resources** ([Section 6.3](#63-connectors)) |
| 5 | `AWS::Serverless::Function` | Yes | AWS Lambda function |
| 6 | `AWS::Serverless::GraphQLApi` | **No** 🆕 | AWS AppSync family |
| 7 | `AWS::Serverless::HttpApi` | Yes | API Gateway HTTP API |
| 8 | `AWS::Serverless::WebSocketApi` | **No** 🆕 | — |
| 9 | `AWS::Serverless::LayerVersion` | Yes | Lambda layer |
| 10 | `AWS::Serverless::MicrovmImage` | **No** 🆕 | — |
| 11 | `AWS::Serverless::NetworkConnector` | **No** 🆕 | — |
| 12 | `AWS::Serverless::SimpleTable` | Yes | DynamoDB table |
| 13 | `AWS::Serverless::StateMachine` | Yes | AWS Step Functions state machine |

**All six from the courseware are still valid.** Nothing was removed; seven were added. The ones that directly affect serverless application design are `Connector`(permissions between resources), `GraphQLApi`, `WebSocketApi`, and `Application`(nested serverless applications).

We also verified the last sentence of the slide 16 instructor note: "In addition to these resources, an AWS SAM template can define **any AWS CloudFormation resource.**" The documentation states the same with `AWS SAM also supports CloudFormation resource and property types`. These resources and properties are defined with AWS SAM's **shorthand syntax**.

> — Source: [AWS SAM resources and properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-resources-and-properties.html)

### 6.2 Mapping Resources to AWS Services 🔄

The slide 16 instructor note gives a mapping table, but **it covers only four of the six types.**

| Mapping in the courseware instructor note | AWS service |
|---|---|
| Serverless API | Amazon API Gateway |
| Serverless Function | AWS Lambda |
| Serverless SimpleTable | Amazon DynamoDB |
| Serverless StateMachine | AWS Step Functions |

🔄 **There is no corresponding service for `AWS::Serverless::HttpApi` or `AWS::Serverless::LayerVersion`.** In particular the note collapses `Api` and `HttpApi` into a single "Serverless API." As [Section 7](#7-api-access-control) shows, **those two types support different access control mechanisms**, so they must be distinguished. Here is the table with all six filled in.

| SAM resource type | Maps to |
|---|---|
| `AWS::Serverless::Api` | Amazon API Gateway REST API |
| `AWS::Serverless::HttpApi` | Amazon API Gateway **HTTP API**. Transformation produces `AWS::ApiGatewayV2::Api` and `AWS::ApiGatewayV2::Stage` |
| `AWS::Serverless::Function` | AWS Lambda function. Transformation produces `AWS::Lambda::Function` + `AWS::IAM::Role` + `AWS::Lambda::Permission` |
| `AWS::Serverless::LayerVersion` | AWS **Lambda layer**. It has a `ContentUri` property |
| `AWS::Serverless::SimpleTable` | Amazon DynamoDB table. Transformation produces `AWS::DynamoDB::Table` |
| `AWS::Serverless::StateMachine` | AWS Step Functions state machine |

🔄 **The reference links do not match the slide either.** The slide 16 instructor note gives two links, and the second is "Control access to a REST API with API Gateway resource policies." That is **the subject of slide 17 (Controlling access with AWS SAM)**, while slide 16 is about the resource type list.

| Courseware reference link | Status | The right place |
|---|---|---|
| AWS SAM template anatomy (`sam-specification-template-anatomy.html`) | **Valid.** The page title is `AWS SAM template anatomy` | Slides 14 · 16 |
| API Gateway resource policies (`apigateway-resource-policies.html`) | **Valid.** The page title is `Control access to a REST API with API Gateway resource policies` | **Slide 17** |

We also checked the content of that second page. An API Gateway resource policy is a **JSON policy document** attached to an API that controls whether specified principals (typically IAM roles or groups) can invoke it, and it can be used to allow the API to be invoked securely from users of a specific AWS account, from specified source IP address ranges or CIDR blocks, or from specified VPCs or VPC endpoints. It can be attached to any API Gateway endpoint type, and for private APIs resource policies are used together with VPC endpoint policies. Resource policies differ from IAM identity-based policies, and the two can be used together.

> — Source: [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html)

> — Source: [Control access to a REST API with API Gateway resource policies](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-resource-policies.html)

### 6.3 Connectors 🆕

The courseware offers only two ways to grant a function permissions: `Policies`(slide 14) and `Role`(slide 15). **`AWS::Serverless::Connector` is a third path added after the courseware, and it is the tool that reduces mistakes like the permission mismatch on slide 15.**

| Item | Documentation statement |
|---|---|
| What it does | **Configures permissions between two resources** |
| Two syntaxes | The **embedded connector syntax**(a `Connectors` block inside the source resource) and the **`AWS::Serverless::Connector` resource syntax**(declared as a standalone resource) |
| The documentation's recommendation | The **embedded connector syntax** for most use cases. It sits inside the source resource, so it is easier to read and maintain |
| When to use the standalone resource syntax | When referencing a source resource that is not in the same AWS SAM template, such as **a resource in a nested stack or a shared resource** |

There are three properties, and **all are AWS SAM-specific with no CloudFormation equivalent.**

| Property | Required? | Value |
|---|---|---|
| `Destination` | **Required** | The resource being connected to |
| `Permissions` | **Required** | Only **`Read`** or **`Write`** |
| `Source` | Required when using the `AWS::Serverless::Connector` syntax | The resource the connection originates from |
| `SourceReference` | — | Specifies the source in more detail in the embedded syntax |

The meaning of the two `Permissions` values:

| Value | Meaning |
|---|---|
| `Read` | Includes IAM actions that allow **reading data from** the resource |
| `Write` | Includes IAM actions that allow **initiating or writing data to** the resource |

```yaml
# Embedded connector syntax - what the documentation recommends for most use cases
Resources:
  pollyNotesTable:
    Type: AWS::Serverless::SimpleTable

  deleteFunction:
    Type: AWS::Serverless::Function
    Connectors:
      # Declare only the intent - "this function writes to this table" -
      # and AWS SAM creates the IAM permissions it needs
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
# AWS::Serverless::Connector resource syntax - used when the source is not in
# the same template, such as a nested stack resource or a shared resource
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

Placing all four permission approaches side by side:

| Approach | What you write | Permission scope | In the courseware? |
|---|---|---|---|
| Managed policy name | `Policies: AmazonDynamoDBReadOnlyAccess` | **Every DynamoDB table in the account** | Slide 14 |
| Existing role ARN | `Role: !Sub arn:aws:iam::${AWS::AccountId}:role/...` | Whatever the role's policies allow. **`Policies` is ignored** | Slide 15 |
| Policy template | `Policies: - DynamoDBReadPolicy: TableName: ...` | Limited to the **specified table** | No 🆕 |
| Connector | `Connectors:` block with `Destination` + `Permissions` | Declared as **intent (Read/Write)** between two resources | No 🆕 |

> — Source: [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html)

### 6.4 What SimpleTable Creates 🆕

The courseware maps `AWS::Serverless::SimpleTable` with the single line "Serverless SimpleTable = Amazon DynamoDB." It never covers what the resource actually creates.

| Item | Transformation result |
|---|---|
| Resource created | `AWS::DynamoDB::Table` |
| Key | **A string attribute with `id` as the `HASH` key** |
| Billing mode | **`BillingMode` `PAY_PER_REQUEST`**(on-demand) |
| Metadata attached | `SamResourceId` in `Metadata`, and a `lambda:createdBy=SAM` tag |

In other words `SimpleTable` is exactly what its name says: **a simple key-value table.** If you need a composite key or secondary indexes, declare `AWS::DynamoDB::Table` directly in the same template (see the `Resources` section rule in [Section 5.1](#51-template-sections)).

> — Source: [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html)

---

## 7. API Access Control

### 7.1 The Six Mechanisms

Slide 17 is **the only table in this deck.** **And all six rows match the current documentation table exactly.** Saying so in class is useful.

| Access control mechanism | `AWS::Serverless::HttpApi` | `AWS::Serverless::Api` |
|---|---|---|
| Lambda authorizers | Supported | Supported |
| IAM permissions | **Not supported** | Supported |
| Amazon Cognito user pools | Supported (asterisk) | Supported |
| API keys | **Not supported** | Supported |
| Resource policies | **Not supported** | Supported |
| OAuth 2.0/JWT authorizers | Supported | **Not supported** |

The asterisk means the same as the courseware footnote: **you can use Amazon Cognito as a JSON Web Token (JWT) issuer for the `AWS::Serverless::HttpApi` resource type.**

The empty "IAM permissions" cell for `HttpApi` in the courseware table also matches the documentation. **HTTP APIs do not support IAM authorization; only `AWS::Serverless::Api` does.**

Filling in the definitions of the mechanisms the courseware presents in a table and moves past:

| Mechanism | Documentation definition |
|---|---|
| Lambda authorizers | Previously called **custom authorizers.** When the API is called, the authorizer is invoked with the request context or authorization token the client application provides and responds with whether the caller is authorized to perform the requested action |
| IAM permissions | The API caller must be **authenticated with IAM credentials**, and the call succeeds only when **an IAM policy is attached** to the IAM user representing the caller, to an IAM group containing that user, or to an IAM role the user assumes |
| Resource policies | A JSON policy document attached to an API that controls whether specified principals can invoke it ([Section 6.2](#62-mapping-resources-to-aws-services)) |

The URL `serverless-controlling-access-to-apis.html` that the instructor note cites **is still valid**, and the page title is `Control API access with your AWS SAM template`. The instructor note has a missing space where it refers to the `AWS::Serverless::Api` resource type ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

> — Source: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

### 7.2 Choosing a Mechanism 🆕

The courseware only lays the six mechanisms out in a table and **never covers which to choose when.** The documentation offers guidance.

| Situation | Documentation guidance |
|---|---|
| A **greenfield project** with no authorization or access control | **Amazon Cognito user pools** may be best, because setting up a user pool sets up **both authentication and access control** |
| The application **already has authentication** configured | A **Lambda authorizer** may be best |
| You need **custom authentication or access control logic** that user pools do not support | Same. A Lambda authorizer |

This guidance connects directly to the Amazon Cognito material in module 12. Module 12 covered "who the users are"; this section is where that result gets **attached to an API in a SAM template.**

> — Source: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

### 7.3 Declaring It with the Auth Property 🆕

The slide 17 instructor note says only "you must enable authorization in the AWS SAM template" and **gives no property name at all.** The actual property is `Auth`, and its data type name is `ApiAuth`.

| Location | Property |
|---|---|
| The `Properties` of `AWS::Serverless::Api` | **`Auth`**(data type `ApiAuth`) |
| Under `Auth` | **`DefaultAuthorizer`** — the name of the default authorizer |
| Under `Auth` | **`Authorizers`** — the map of authorizer definitions |
| The function's `Api` event | **`RestApiId`** — references an explicit API resource |

```yaml
# Controlling API access with an Amazon Cognito user pool
Resources:
  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Auth:
        # The default authorizer name must match a key under Authorizers below
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
            # RestApiId references the explicit API declared above.
            # Without this property a separate implicit API is created
            RestApiId: !Ref MyApi
            Path: /notes
            Method: get
```

🔄 **The templates on courseware slides 14 and 15 create implicit APIs without `RestApiId`.** In other words the courseware templates have no API resource to attach authorization to. To actually apply access control you must declare an explicit API resource and reference it from the function event.

> — Source: [Amazon Cognito user pool example for AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-cognito-user-pool.html)

### 7.4 Customizing Error Responses 🆕

Absent from the courseware. The documentation states that AWS SAM can **customize the content of some API Gateway error responses.**

| Item | Content |
|---|---|
| What you can do | Customize the content of some API Gateway error responses |
| Supported resource type | **Only `AWS::Serverless::Api`.** `AWS::Serverless::HttpApi` does not support it |

That is one more reason the table in [Section 7.1](#71-the-six-mechanisms) separates `Api` from `HttpApi`. The two types differ not only in access control mechanisms but also in error response customization.

> — Source: [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html)

---

## 8. Installing the SAM CLI and Local Testing

### 8.1 Prerequisites 🔄

Slide 19 presents three setup steps in the body and the instructor note counts four. **The body and the note disagree on the step count** ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

| Courseware body (3 steps) | Courseware instructor note (4 steps) |
|---|---|
| — | 1. Create an AWS account |
| 1. Configure AWS credentials | 2. Configure IAM permissions and AWS credentials |
| 2. Install Docker (**optional**) | 3. If you plan to test your application locally, install Docker |
| 3. Download and install the AWS SAM CLI | 4. Download and install the AWS SAM CLI |

🔄 **The current prerequisites page is structured differently.**

| Step | Documentation |
|---|---|
| Preparation | Sign up for an AWS account |
| Step 1 | **Install the AWS CLI** |
| Step 2 | Use the AWS CLI to configure AWS credentials (`aws configure`, or the IAM Identity Center `aws configure sso` wizard) |
| Step 3 | **(Optional) Install AWS Toolkit for VS Code** |

It also states exactly what is required.

| Item | Documentation statement | Courseware |
|---|---|---|
| An AWS account | Required | Present |
| IAM credentials and an IAM **access key pair** | Required | "IAM permissions and AWS credentials" |
| **AWS Command Line Interface (AWS CLI)** | Required. Used to configure AWS credentials | 🔄 **Absent from the courseware** |
| Docker | 🔄 **This page does not list Docker as a prerequisite** | Listed as "optional" |
| AWS Toolkit for VS Code | (Optional) step 3 | Absent 🆕 |

**So when is Docker needed?** As [Section 8.7](#87-sam-local-invoke-and-docker) shows, the `sam local invoke` documentation states that the AWS SAM CLI **uses Docker to build your function in a local container and then invoke it.** In other words Docker is not on the prerequisites list but is **effectively required for local testing.** The courseware body saying only "optional" while the note adds "if you plan to test locally" conveys half of that situation.

The details on AWS Toolkit for VS Code in step 3:

| Item | Content |
|---|---|
| Who it is for | Developers who prefer an integrated development environment |
| What it provides | **Visual debugging, CodeLens integration, and a streamlined deployment workflow** |
| Prerequisites | **Visual Studio Code 1.73.0 or later** and the **YAML language support extension** |

This item connects to the explanation for knowledge check question 5 on slide 30. That explanation says "there are various AWS toolkits that work with a variety of IDE and runtime combinations," yet **the deck has no slide covering toolkits** ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)). Note that this document verified **only AWS Toolkit for VS Code** and did not consult a full list of AWS toolkits for IDEs ([Section 11.5](#115-items-we-could-not-verify)).

```bash
# Verify the installation
sam --version
```

> — Source: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

> — Source: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

### 8.2 Changes in the Installation Path 🔄

The courseware does not cover installation details and gives only a reference URL. **That URL is still valid.**

| Item | Status |
|---|---|
| The courseware reference URL (`serverless-sam-cli-install.html`) | **Valid.** It serves the `Install the AWS SAM CLI` page |
| The canonical path inside current documentation | `install-sam-cli.html`. The prerequisites page and the `sam deploy` and `sam local` pages all link to this one |

🔄 **Two constraints have appeared in the installation path that are absent from the courseware.**

| Change | Content |
|---|---|
| Homebrew | **Since September 2023** AWS **no longer maintains the AWS-managed Homebrew installer** (`aws/tap/aws-sam-cli`). Use the first-party installation method for your operating system |
| macOS version | The AWS SAM CLI **does not support versions older than macOS 13.x** |

The documentation also describes the per-operating-system installation methods.

| Operating system | Method |
|---|---|
| Linux x86_64 · arm64 | Command line installer |
| macOS | Package installer |

> — Source: [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

> — Source: [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)

### 8.3 Twenty-Four CLI Commands 🔄

The courseware covers **seven** commands: `sam init`, `sam build`, `sam local invoke`, `sam local start-api`, `sam local generate-event`, `sam package`, and `sam deploy`. **The current command reference page lists twenty-four.**

| Command | In the courseware? | What it does |
|---|---|---|
| `sam build` | Yes | Prepares the application for the next step (local testing or deployment) ([Section 9.2](#92-sam-build-and-container-builds)) |
| `sam delete` | **No** 🆕 | Deletes the stack, artifacts, and template file ([Section 9.8](#98-cleaning-up)) |
| `sam deploy` | Yes | Deploys the application with CloudFormation ([Section 9.4](#94-sam-deploy-and-samconfigtoml)) |
| `sam init` | Yes | Initializes a new serverless application ([Section 8.4](#84-sam-init)) |
| `sam list` | **No** 🆕 | Shows resources, endpoints, and stack outputs ([Section 9.7](#97-verifying-deployment-results)) |
| `sam local callback` | **No** 🆕 | — |
| `sam local execution` | **No** 🆕 | — |
| `sam local generate-event` | Yes | Generates sample events ([Section 8.8](#88-sam-local-generate-event)) |
| `sam local invoke` | Yes | Invokes a function locally **once** ([Section 8.7](#87-sam-local-invoke-and-docker)) |
| `sam local start-api` | Yes | Runs functions behind a **local HTTP server** |
| `sam local start-lambda` | **No** 🆕 | A local HTTP server **for use with the AWS CLI and SDKs** |
| `sam logs` | **No** 🆕 | — |
| `sam package` | Yes | Packages artifacts ([Section 9.3](#93-sam-package-is-no-longer-a-separate-step)) |
| `sam pipeline bootstrap` | **No** 🆕 | Prepares a CI/CD pipeline |
| `sam pipeline init` | **No** 🆕 | Initializes a CI/CD pipeline |
| `sam publish` | **No** 🆕 | Publishes to the AWS Serverless Application Repository ([Section 4.5](#45-aws-serverless-application-repository)) |
| `sam remote callback` | **No** 🆕 | — |
| `sam remote execution` | **No** 🆕 | — |
| `sam remote invoke` | **No** 🆕 | Invokes a resource deployed in the cloud directly ([Section 8.9](#89-invoking-cloud-resources-directly)) |
| `sam remote test-event` | **No** 🆕 | — |
| `sam sync` | **No** 🆕 | Syncs local changes to the cloud ([Section 9.6](#96-reducing-the-development-loop-with-sam-sync)) |
| `sam traces` | **No** 🆕 | — |
| `sam validate` | **No** 🆕 | Validates the template ([Section 8.5](#85-sam-validate)) |

Five of the courseware's gaps are worth calling out.

| Command | Why it matters |
|---|---|
| `sam validate` | This is the capability the slide 12 instructor note cites — "verify that the template file is written to specification" — **without naming the command** |
| `sam sync` | A separate path that shortens the development loop |
| `sam delete` | The demonstration (slide 28) creates resources and stops, so **a cleanup step** is needed |
| `sam remote invoke` | The courseware covers **local testing only** |
| `sam list` | The CLI path for the demo item "show the resources created" |

> — Source: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

### 8.4 sam init 🔄

Slide 22 gives five `sam init` examples and covers three options (`--runtime`, `--app-template`, `--location`). **All three still exist.**

```bash
# Courseware slide 22 as written. python3.8 is a deprecated runtime
# Start a new SAM project using the Python 3.8 runtime
$ sam init --runtime python3.8
# Start a new SAM project using a built-in app template
$ sam init --runtime python3.8 --app-template hello-world
# Start a new SAM project using a custom template in a zip file
$ sam init --location /path/to/template.zip
$ sam init --location https://example.com/path/to/template.zip
# Start a new SAM project using a custom template at a local path
$ sam init --location /path/to/template/folder
```

**The same examples with only the runtime corrected:**

```bash
# Corrected. The runtime was changed to a supported version
# Start a new SAM project with a supported Python runtime
sam init --runtime python3.12
# Specify a built-in app template
sam init --runtime python3.12 --app-template hello-world
# A function packaged as a container image (not in the courseware)
sam init --runtime python3.12 --package-type Image
# The arm64 architecture (not in the courseware)
sam init --runtime python3.12 --architecture arm64
# Custom template locations - .zip files, HTTP/HTTPS, local paths, Git, Mercurial
sam init --location /path/to/template.zip
```

| # | Courseware notation | Correction | Reason |
|---|---|---|---|
| 1 | `--runtime python3.8` | `--runtime python3.12` | `python3.8` is deprecated. **The `--runtime` allowed-value list still includes `python3.8`**, but a function created with it uses a deprecated runtime |
| 2 | The `$` prompt | Removed | The prompt character was dropped to make copy-paste easier. The courseware uses `>>` on slide 21 and `$` on slides 22–24 ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)) |

The full list of values `--runtime` accepts. It applies only when `--package-type` is `Zip`.

| Family | Allowed values |
|---|---|
| .NET | `dotnet8` · `dotnet6` |
| Java | `java25` · `java21` · `java17` · `java17.al2023` · `java11` · `java11.al2023` · `java8.al2023` |
| Node.js | `nodejs24.x` · `nodejs22.x` · `nodejs20.x` · `nodejs18.x` · `nodejs16.x` |
| Python | `python3.14` · `python3.13` · `python3.12` · `python3.11` · `python3.10` · `python3.9` · `python3.8` |
| Ruby | `ruby4.0` · `ruby3.4` · `ruby3.3` · `ruby3.2` |

🆕 **Many options are absent from the courseware.**

| Option | Content |
|---|---|
| `--app-template` | The identifier of the managed application template to use. If you are not sure, the documentation advises calling `sam init` **with no options to use the interactive workflow.** This parameter is **required** when you specify `--no-interactive` and do not give `--location` |
| `--location`(`-l`) | The template or application location. Accepts **Git, Mercurial, HTTP/HTTPS, a .zip file, or a path.** Git repositories must use the **repository root location**, and local paths must be **a .zip file or Cookiecutter format** |
| `--package-type` | **`Zip`**(a .zip file archive) or **`Image`**(a container image) |
| `--architecture`(`-a`) | `x86_64` or `arm64` |
| `--dependency-manager`(`-d`) | `gradle` · `mod` · `maven` · `bundler` · `npm` · `cli-package` · `pip` |
| `--base-image` | Only when `--package-type` is `Image`. Values such as `amazon/python3.14-base` or `amazon/nodejs24.x-base` |
| `--name`(`-n`) | The name of the directory to create |
| `--output-dir`(`-o`) | The output directory |
| `--tracing` / `--no-tracing` | Enables AWS X-Ray tracing |
| `--application-insights` / `--no-application-insights` | The default is **`--no-application-insights`** |
| Also | `--no-interactive` · `--no-input` · `--extra-content` · `--config-env` · `--config-file` · `--save-params` · `--debug` |

**The interactive flow is longer than the courseware shows too.** Slide 21 stops at the first prompt.

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

The first prompt the courseware shows ("Which template source would you like to use? / 1 - AWS Quick Start Templates / 2 - Custom Template Location") **matches the current documentation example.** The demo item "quick templates" on slide 28 also refers to these `AWS Quick Start Templates` (the two slides use different wording).

🆕 **The creation summary includes `samconfig.toml`.** That file is entirely absent from the courseware ([Section 9.4](#94-sam-deploy-and-samconfigtoml)).

| Summary item | Value |
|---|---|
| Name | The project name |
| Base Image | When using the container image type |
| Architectures | `x86_64` |
| Dependency Manager | `pip` |
| Output Directory | The output directory |
| **Configuration file** | **`sam-app/samconfig.toml`** |

The documentation notes that next steps are in `sam-app/README.md`.

The project structure diagram on slide 21 also has notation problems.

| Courseware notation | Correction | Reason |
|---|---|---|
| `_init_.py` | `__init__.py` | A Python package initialization file has **two** underscores on each side |
| `Tests` | `tests` | `events` and `hello_world` are lowercase while only `Tests` is capitalized |

**That said, we could not verify the directory structure `sam init` actually creates.** We verified only the creation summary ([Section 11.5](#115-items-we-could-not-verify)). The two items above point out notation problems inside the courseware; they are not assertions about the folder names in the generated output.

The Init item in the slide 21 instructor note is also not a grammatical sentence: "You can select built-in applications a template or a custom template" appears to be a typo for "You can select a built-in application **template** or a custom template" ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

> — Source: [sam init](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-init.html)

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 8.5 sam validate 🆕

The slide 12 instructor note lists "verify that the AWS SAM template file is written to specification" as the first thing the CLI can do. **The command name for that is nowhere in the deck.** It is `sam validate`.

| Item | Content |
|---|---|
| What it does | **Verifies whether an AWS SAM template file is valid** |
| `--lint` | Performs linting validation on the template with **`cfn-lint`.** Additional parameters are specified in a `cfnlintrc` configuration file |
| `--template-file`(`--template`, `-t`) | Defaults to `template.yaml` or `template.yml`. **The option is not needed** if the template is in the current working directory and named `template.yaml`, `template.yml`, or `template.json`, and it is not needed if you have just run `sam build` |
| `--config-file` | Defaults to `samconfig.toml` at the project root |

```bash
# With the template at the project root, run it with no options
sam validate

# Also perform cfn-lint linting
sam validate --lint

# When specifying the template location directly
sam validate --template-file ./template.yaml
```

`sam validate` is also the first entry in the list of next commands that a successful `sam build` prints ([Section 9.2](#92-sam-build-and-container-builds)).

> — Source: [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html)

### 8.6 Six sam local Subcommands 🔄

Slide 20 presents three `sam local` subcommands. **There are now six.**

| Subcommand | In the courseware? | What it does |
|---|---|---|
| `sam local generate-event` | Yes | Generates AWS service events for local testing |
| `sam local invoke` | Yes | Invokes a Lambda function locally **once** |
| `sam local start-api` | Yes | Runs Lambda functions behind a **local HTTP server** |
| `sam local start-lambda` | **No** 🆕 | Runs Lambda functions behind a local HTTP server **for use with the AWS CLI and SDKs** |
| `sam local callback` | **No** 🆕 | — |
| `sam local execution` | **No** 🆕 | — |

The descriptions of the three commands the courseware presents match the documentation.

| Command | Courseware description | Verification |
|---|---|---|
| `sam local invoke` | Runs an AWS Lambda function locally in a Docker container | Matches |
| `sam local start-api` | Replicates an Amazon API Gateway endpoint locally | Matches. The documentation describes it as running Lambda functions behind a local HTTP server |
| `sam local generate-event` | Generates sample payloads from various event sources | Matches |

The difference between `start-api` and `start-lambda` matters in practice. `start-api` is **a local HTTP server that mimics an API Gateway endpoint**, while `start-lambda` is **a local HTTP server the AWS CLI and SDKs can call as if it were the Lambda service.** So if your application code invokes functions through an SDK, `start-lambda` is the right one.

> — Source: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

> — Source: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

### 8.7 sam local invoke and Docker 🔄

The documentation describes how `sam local invoke` behaves, step by step.

| Step | Content |
|---|---|
| Finding the template | It assumes the current working directory is the project root and looks first for `template.yaml` or `template.yml` in the **`.aws-sam` subfolder**, then in the **current working directory** |
| Specifying the function | If the application has more than one function, give the function's **logical ID** |
| Build and invoke | 🔄 **The AWS SAM CLI builds your function in a local container using Docker**, then invokes the function and prints the response |
| Output separation | Lambda function runtime output (logs) goes to **stderr**, and the function result goes to **stdout** |

```bash
# With a single function you can run it without a name
sam local invoke

# With more than one function, give the logical ID
sam local invoke HelloWorldFunction

# Pass an event. Events can be created with sam local generate-event
sam local invoke --event events/s3.json S3JsonLoggerFunction

# Pass environment variables
sam local invoke --env-vars env.json HelloWorldFunction
```

The courseware's slide 21 example, `sam local invoke "HelloWorldFunction" -e event.json`, also matches current usage of **a function logical ID plus an event file.**

The documentation's output example shows a runtime image such as `public.ecr.aws/lambda/python:3.9-rapid-x86_64` **being pulled** and `.aws-sam/build/<function>` being mounted at `/var/task` inside the container. In other words the `.aws-sam/build` directory from [Section 5.8](#58-template-file-names-and-relative-paths) is used for local invocation as well.

🆕 **The documentation carries one caution absent from the courseware.** It **advises against using the SAM CLI's local invocation features with untrusted code** and directs you to run it in the Lambda service itself if you need complete isolation.

> — Source: [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html)

### 8.8 sam local generate-event 🔄

Slide 20 gives only three supported services: "the representative services are Amazon S3, API Gateway, and Amazon SNS." 🔄 **The actual list is far longer.**

| Item | Content |
|---|---|
| What it does | Generates **sample event payloads** for supported AWS services. You can modify the generated event and pass it to local resources for testing |
| The shape of the events | Formatted with **the same structure** as the events the real AWS services produce |
| Seeing the supported list | Run `sam local generate-event` with no arguments |
| Services shown in the documentation example | `alb` · `alexa-skills-kit` · `alexa-smart-home` · `apigateway` · `appsync` · `batch` · `cloudformation` — and the list continues past that |

The documentation's output example is cut off with an ellipsis, so **we could not verify the full list** ([Section 11.5](#115-items-we-could-not-verify)). Even so, the alphabetical beginning alone contains six more than the three the courseware names.

🆕 **Passing arguments in two stages is also absent from the courseware.**

```bash
# (1) See the list of supported services
sam local generate-event

# (2) Give a service name to see the event types it can generate
sam local generate-event s3
```

```text
Commands:
  batch-invocation
  delete
  put
```

```bash
# (3) Give a service and an event type to print a sample event
sam local generate-event s3 put

# Modify placeholder values from the command line
sam local generate-event s3 put --bucket my-test-bucket --key sample-key

# Save it to a file and pass it to sam local invoke
sam local generate-event s3 put > events/s3.json
sam local invoke --event events/s3.json S3JsonLoggerFunction
```

Sample events carry **placeholder values** that can be modified with options such as `--region`, `--partition`, `--bucket`, and `--key`.

> — Source: [Introduction to testing with sam local generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-generate-event.html)

### 8.9 Invoking Cloud Resources Directly 🆕

The courseware covers **local testing only.** The current CLI has a path for invoking resources deployed in the cloud directly.

| Command | What it does |
|---|---|
| `sam remote invoke` | Invokes a resource deployed in the cloud directly |
| `sam remote test-event` | Manages remote test events |
| `sam remote callback` | — |
| `sam remote execution` | — |

```bash
# Invoke a resource deployed in the cloud directly
sam remote invoke
```

Separating the uses of local testing and remote invocation:

| Situation | Command |
|---|---|
| Check function logic without deploying | `sam local invoke` |
| Check API endpoint behavior locally | `sam local start-api` |
| Check the SDK invocation path locally | `sam local start-lambda` |
| **Check that a deployed function works in the real environment** | `sam remote invoke` |

> — Source: [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)

---

## 9. Building and Deploying

### 9.1 The Standard Workflow

Slide 21 presents the workflow in four steps. **As a production path those four steps are still valid.**

| Step | Command | Courseware instructor note |
|---|---|---|
| Init | `sam init` | Initializes a new AWS SAM project |
| Build | `sam build` | Builds the AWS SAM application. You can run the build inside a container |
| Test | `sam local invoke` | Runs the application locally for testing |
| Deploy | `sam deploy` | Deploys the application |

```bash
# The four-step workflow the courseware presents (with prompt characters removed)
sam init
sam build
sam local invoke
sam deploy --guided
```

🆕 **A successful `sam build` prints the commands to use next, and that list is broader than the courseware's four steps.**

| Command suggested | This document |
|---|---|
| `sam validate` | [Section 8.5](#85-sam-validate) |
| `sam local invoke` | [Section 8.7](#87-sam-local-invoke-and-docker) |
| `sam sync --stack-name {{stack-name}} --watch` | [Section 9.6](#96-reducing-the-development-loop-with-sam-sync) |
| `sam deploy --guided` | [Section 9.4](#94-sam-deploy-and-samconfigtoml) |

The tail of the slide 21 diagram (AWS SAM template → AWS CloudFormation → stack → AWS Cloud) also matches the documentation. However, **the diagram omits the change set between CloudFormation and the stack** ([Section 9.5](#95-change-sets-and-rollback)).

The Deploy item in the slide 21 instructor note has its causality inverted: "To deploy through interactive prompts when using a configuration file, run the `sam deploy` command." **Interactive deployment (`--guided`) and configuration-file-based deployment are different paths**, and slide 24 presents them as separate examples ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.2 sam build and Container Builds 🔄

**This is the most important correction in the module.** The slide 23 instructor note states:

> Note: Some languages (for example .NET or Python) cannot use the `-use-container` option.

🔄 **The current `sam build` reference contains no statement that any language or runtime cannot use `--use-container`.** On the contrary, the `--build-image` option description gives these two forms as examples of **using a Python build image together with `--use-container`.**

```bash
# The two examples the documentation gives in the --build-image description.
# Both use a Python build image together with --use-container
sam build --use-container --build-image amazon/aws-sam-cli-build-image-python3.8
sam build --use-container --build-image Function1=amazon/aws-sam-cli-build-image-python3.8
```

The documentation states **exactly one** restriction related to `--use-container`.

| Item | Documentation statement |
|---|---|
| What `--use-container`(`-u`) is | The option that builds your function inside a **Lambda-like Docker container** when the function depends on packages with **natively compiled dependencies** |
| The only stated incompatibility | **Not compatible with `--build-in-source`** |
| Options usable **only with** `--use-container` | `--build-image` · `--container-env-var` · `--container-env-var-file`. Using them without `--use-container` produces **an error** |
| `--no-use-container` | Runs the build **on the local machine** instead of a Docker container |
| Restrictions by language or runtime | **No such statement** |

The restrictions live on the `--build-in-source` side.

| Item | Content |
|---|---|
| Supported runtimes | **All Node.js runtimes** that `sam init --runtime` supports |
| Supported build methods | **Makefile** and **esbuild** |
| Incompatible with | `--use-container` |

**The notation also splits inside the courseware.** The slide body correctly writes `--use-container`(two hyphens) while the instructor note writes `-use-container`(one hyphen). The correct spelling is **`--use-container`**, with the short form **`-u`** ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

```bash
# Courseware slide 23 as written
# Default build command
$ sam build
# Run the build process inside a Docker container like AWS Lambda
$ sam build --use-container
# Build and run the function locally
$ sam build && sam local invoke
```

```bash
# Corrected. The option spelling is consistent and the short form is shown
# Default build
sam build

# Build inside a Lambda-like Docker container.
# Use this when there are natively compiled dependencies. Short form is -u
sam build --use-container

# Build on the local machine (no container)
sam build --no-use-container

# Build and then invoke locally
sam build && sam local invoke
```

Other `sam build` options:

| Option | Content |
|---|---|
| `--use-container`(`-u`) | Build in a Lambda-like Docker container |
| `--no-use-container` | Build on the local machine |
| `--build-image` | The build image to use. **Only with `--use-container`** |
| `--container-env-var` / `--container-env-var-file` | Container environment variables. **Only with `--use-container`** |
| `--build-in-source` | Build in the source location. **Incompatible with `--use-container`** |
| `--parallel` | Parallel builds |
| `--cached` | Use the cache. The cache directory defaults to `.aws-sam/cache` |
| `--exclude`(`-x`) | Exclude specific resources |
| `--base-dir`(`-s`) | Change the basis for resolving relative paths ([Section 5.8](#58-template-file-names-and-relative-paths)) |
| `--build-dir`(`-b`) | The build output directory |
| `--manifest`(`-m`) | Specify the manifest file |
| `--hook-name` | The allowed value is **`terraform`** |
| Also | `--skip-pull-image` · `--use-buildkit` · `--mount-symlinks` · `--save-params` · `--parameter-overrides` · `--template-file` · `--config-file` |

The location of the build output is absent from the courseware too.

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

`sam deploy` deploys **the build artifacts in the `.aws-sam` directory.** That is why the documentation advises running `sam build` to refresh that directory before deploying if you have changed source files. The courseware's `sam build && sam local invoke` on slide 23 also relies on this relationship, which the courseware never explains.

> — Source: [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html)

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.3 sam package Is No Longer a Separate Step 🔄

Slide 24's first example is `sam build && sam package --s3-bucket <bucket_name>`, and the instructor note likewise requires both commands: "use the `sam package` and `sam deploy` commands."

🔄 **The documentation states this in a Note:** `sam deploy` now **implicitly performs** the functionality of `sam package`. You can use the `sam deploy` command directly to package and deploy your application.

| Item | Courseware | Current |
|---|---|---|
| The packaging step | Run `sam package --s3-bucket <bucket_name>` before deploying | `sam deploy` **performs it implicitly** |
| The S3 bucket | Pass the name directly | Create one automatically with **`--resolve-s3`.** It appears in the output as `Managed S3 bucket` |
| `--s3-bucket` with `--resolve-s3` | — | **Specifying both produces an error** |
| Container images | Not covered | Uploaded to Amazon ECR, **creating a repository if needed** |

`sam package` itself has not been retired. It still has a place.

| `sam package` behavior | Content |
|---|---|
| What it does | Creates a **.zip file** of your code and dependencies, uploads it to Amazon S3, and returns a **copy of the AWS SAM template** with local artifact references replaced by the uploaded Amazon S3 locations |
| Encryption | AWS SAM **enables encryption for all files it stores in Amazon S3** |
| Template lookup order | It assumes the current working directory is the project root, looks first for `template.yaml` in the **`.aws-sam` subfolder**, and then for `template.yaml` or `template.yml` in the current working directory |
| With `--template` | Overrides the default behavior and packages **only that template and the local resources it points to** |
| `--output-template-file` | Where to write the packaged template. Without it, the template is written to **standard output** |
| Size condition | If the artifact is larger than **51,200 bytes**, either `--s3-bucket` or `--resolve-s3` is required |

```bash
# Courseware slide 24 as written
# Build and package for deployment
$ sam build && sam package --s3-bucket <bucket_name>
# Deploy using interactive prompts
$ sam deploy --guided
# Deploy using a configuration file
$ sam deploy --template-file deploy.yml
```

```bash
# Corrected. Packaging is part of sam deploy, and the configuration file option
# is --config-file
# First deployment - build the settings interactively and save them to samconfig.toml
sam build && sam deploy --guided

# Later deployments - deploy with the values in samconfig.toml
sam deploy

# Have an S3 bucket for packaging created automatically
# (an error if combined with --s3-bucket)
sam deploy --resolve-s3

# To specify the configuration file directly, use --config-file (not --template-file)
sam deploy --config-file samconfig.toml --config-env default

# Use sam package only when you need the packaged template as a file
sam package --resolve-s3 --output-template-file packaged.yaml
```

| # | Courseware notation | Correction | Reason |
|---|---|---|---|
| 1 | Presents `sam package --s3-bucket <bucket_name>` as a required pre-deployment step | `sam deploy`(with `--resolve-s3` if needed) | The documentation Note states that `sam deploy` performs packaging implicitly |
| 2 | `# Deploy using a configuration file` plus `--template-file deploy.yml` | `--config-file`(default `samconfig.toml`) | `--template-file` is the **template** option ([Section 9.4](#94-sam-deploy-and-samconfigtoml)) |
| 3 | The `$` prompt | Removed | Copy-paste convenience |

> — Source: [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html)

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.4 sam deploy and samconfig.toml 🆕

**The courseware never mentions `samconfig.toml`.** This file is the output of `sam deploy --guided` and the basis for every later deployment, so it is central in practice.

| Item | Documentation statement |
|---|---|
| What `sam deploy` does | **Deploys an application to the AWS Cloud using AWS CloudFormation** |
| `--stack-name` | **Required.** Giving an existing stack name **updates** the stack; giving a new name **creates** one |
| `--guided`(`-g`) | Has the AWS SAM CLI **guide the deployment with prompts** |
| `--config-file` | Defaults to **`samconfig.toml`** at the project directory root |
| `--config-env` | Defaults to **`default`** |

🔄 **The courseware mixes up `--template-file` and `--config-file`.**

| Option | What it specifies | Default |
|---|---|---|
| `--template-file`(`--template`, `-t`) | The path and name of the AWS SAM **template** | `template.yaml` or `template.yml` |
| `--config-file` | The path and name of the **configuration file** | `samconfig.toml` |
| `--config-env` | The **environment name** inside the configuration file | `default` |

The documentation also states where the `sam deploy --guided` interactive flow gets its defaults.

| Source | Content |
|---|---|
| `~/.aws/config` | General AWS account settings |
| `~/.aws/credentials` | Account credentials |
| `<project>/samconfig.toml` | The project configuration file |

Square brackets (`[ ]`) indicate the default, and **leaving an answer blank selects the default.**

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

The AWS SAM CLI records these answers in the project's `samconfig.toml`, and **on later deployments running just `sam deploy` uses those values.** To reconfigure them, run `sam deploy --guided` again or edit the configuration file directly. The configuration file is a TOML file, and `--config-env`(default `default`) selects the environment.

Deployment has four main steps.

| Step | Content |
|---|---|
| 1 | Lambda functions packaged as **.zip file archives** are zipped by the AWS SAM CLI and uploaded to an Amazon S3 bucket, **creating a new bucket if needed**(shown in the output as `Managed S3 bucket`) |
| 2 | Functions packaged as **container images** are uploaded to Amazon ECR, **creating a new repository if needed** |
| 3 | The AWS SAM CLI creates an **AWS CloudFormation change set** and deploys the application as a CloudFormation stack |
| 4 | The `CodeUri` values of Lambda functions in the deployed AWS SAM template are updated to their new values |

The documentation presents two **best practices**.

| Best practice | Content |
|---|---|
| Build first | Because `sam deploy` deploys **the build artifacts in the `.aws-sam` directory**, run `sam build` to refresh that directory after changing source files |
| First versus later deployments | Use **`sam deploy --guided`** for the first deployment and **`sam deploy`** afterward |

`--capabilities` is also required knowledge absent from the courseware.

| Value | When it is needed |
|---|---|
| `CAPABILITY_IAM` | When creating IAM resources |
| `CAPABILITY_NAMED_IAM` | When IAM resources have **custom names.** Without it, an **`InsufficientCapabilities` error** is returned |
| `CAPABILITY_AUTO_EXPAND` | When deploying an application that contains **nested applications** |

Other options:

| Option | Content |
|---|---|
| `--parameter-overrides` | Overrides template parameter values. Takes **precedence** over template entries |
| `--tags` | Stack tags |
| `--notification-arns` | Notification ARNs |
| `--kms-key-id` | Encryption key |
| `--image-repository`(`-ies`) · `--resolve-image-repos` | Container image repositories |
| `--signing-profiles` | Code signing profiles |
| `--fail-on-empty-changeset` | Treat an empty change set as a failure |
| `--force-upload` · `--save-params` · `--use-json` · `--express` | — |
| `--role-arn` | The ARN of the IAM role CloudFormation assumes when applying the change set |
| Template size | If the template is larger than **51,200 bytes**, either `--s3-bucket` or `--resolve-s3` is required |
| The `SAM_CLI_POLL_DELAY` environment variable | Adjusts the **polling interval** for CloudFormation stack status |

> — Source: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

### 9.5 Change Sets and Rollback 🆕

**The courseware does not cover change sets at all.** The slide 21 diagram goes straight from `AWS CloudFormation` to `stack`, and slide 24 shows only that running `sam deploy` deploys. But as [Section 9.4](#94-sam-deploy-and-samconfigtoml) showed, **deployment goes through a change set.** And that is the answer to problems 4 (no rollback plan) and 5 (human error) from [Section 2.1](#21-problems-with-traditional-software-deployment).

| Item | Documentation statement |
|---|---|
| What a change set is | It lets you **preview how proposed changes to a stack will affect running resources**, including the impact on resource properties and attributes |
| When the stack actually changes | Regardless of whether the change deletes or replaces critical resources, CloudFormation changes the stack **only when you decide to execute the change set** |
| What you can see | The resources that will be **added, modified, and deleted**, and **before-and-after comparisons** of properties and attributes such as tags |
| Pre-deployment validation | During change set creation it performs **pre-deployment validation** for common failure causes such as **property syntax errors, resource name conflicts, and service quota limits** |
| What it does not guarantee | A change set **does not guarantee that the stack update will succeed.** Failures caused by **runtime conditions** such as custom resource logic or service-specific constraints can still occur during execution |
| After execution | CloudFormation **removes all change sets** associated with that stack, because they cannot be applied to the updated stack |

The change set procedure has four steps.

| Step | Content |
|---|---|
| 1 | Create a change set by submitting the changes for the stack you want to update. You can submit a modified template or modified input parameter values, and **the stack is not changed at this point** |
| 2 | View the change set to see **which stack settings and resources will change** |
| 3 | (Optional) Create **additional change sets** to consider other changes |
| 4 | **Execute** the change set containing the changes you want to apply, and CloudFormation updates the stack |

The change set options on `sam deploy`:

| Option | Content |
|---|---|
| `--confirm-changeset` / `--no-confirm-changeset` | Displays a **prompt to confirm** whether to deploy the computed change set. The `Confirm changes before deploy` prompt in `sam deploy --guided` is exactly this choice |
| `--no-execute-changeset` | Creates the change set and **exits without applying it.** You can view the stack changes before applying them |

**The rollback options are absent from the courseware too.**

| Option | Behavior |
|---|---|
| (default) | If an error occurs during deployment, the CloudFormation stack is **rolled back to the last stable state** |
| `--disable-rollback` | Resources created or updated before the error are **not rolled back** |
| `--on-failure ROLLBACK` | Roll back to the previous good state. **The default behavior** |
| `--on-failure DELETE` | Roll back if a previous good state exists; otherwise **delete the stack** |
| `--on-failure DO_NOTHING` | The same effect as `--disable-rollback` |
| Restriction | **`--disable-rollback` and `--on-failure` cannot be used together** |

```bash
# Create the change set without applying it. See what will change first
sam deploy --no-execute-changeset

# Display a change set confirmation prompt before deploying
sam deploy --confirm-changeset

# Specify the behavior on failure. The default behavior is ROLLBACK
sam deploy --on-failure DELETE

# Leave failed resources in place for debugging.
# Cannot be used together with --on-failure
sam deploy --disable-rollback
```

Matched against the problem list in [Section 2.1](#21-problems-with-traditional-software-deployment):

| Problem the courseware raises | The answer here |
|---|---|
| No rollback plan | The default behavior is a **rollback to the last stable state.** Controlled with `--on-failure` |
| Potential for human error | Change sets allow **review before execution.** `--no-execute-changeset` lets you look without applying |
| Manual approvals | Automate with `--no-confirm-changeset` |

> — Source: [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

> — Source: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

### 9.6 Reducing the Development Loop with sam sync 🆕

The courseware's workflow has four steps and no `sam sync`. That command is part of **AWS SAM Accelerate.**

| Item | Documentation statement |
|---|---|
| What it does | **Quickly syncs** local application changes to the AWS Cloud |
| Three uses | ① automatically detect and sync local changes to the cloud ② customize what gets synced ③ prepare the application in the cloud for testing and validation |
| What AWS SAM Accelerate is | A set of tools that **speeds up the experience of developing and testing** serverless applications in the AWS Cloud |
| ⚠️ Where to use it | The documentation **recommends `sam sync` for development environments** and **recommends `sam deploy` or a CI/CD pipeline configuration for production environments** |
| Confirmation prompt | Running it produces a confirmation prompt stating that **the command should be used only on development stacks** |

With `--watch` it operates in four steps.

| Step | Content |
|---|---|
| 1 | **Builds** the application (similar to `sam build`) |
| 2 | Deploys to CloudFormation using credentials and general configuration from the `.aws` user folder and **the deployment settings in `samconfig.toml`** |
| 3 | **Keeps running and watches for local changes** |
| 4 | When it detects a change, syncs it **by the fastest method available** |

The documentation also spells out what "the fastest method" means. If the updated resource supports an **AWS service API**, it uses that for a fast update; if not, it **performs a CloudFormation deployment to update the whole application.**

```bash
# Watch for local changes and keep syncing. For development stacks only
sam sync --stack-name my-dev-stack --watch

# Sync only code changes such as Lambda function code
sam sync --stack-name my-dev-stack --code

# Target specific functions or layers
sam sync --stack-name my-dev-stack --code --resource-id HelloWorldFunction

# Turn off automatic syncing and perform a one-off deployment
# that combines sam build and sam deploy
sam sync --stack-name my-dev-stack --no-watch

# Compare the local template with the deployed one and skip the initial
# deployment if nothing changed
sam sync --stack-name my-dev-stack --skip-deploy-sync

# Specify files and folders that should not trigger a sync
sam sync --stack-name my-dev-stack --watch --watch-exclude node_modules
```

The details of each option:

| Option | Content |
|---|---|
| `--watch` | Watch for local changes and keep syncing |
| `--code` | Sync **code changes only** |
| `--resource-id` | Target specific functions or layers. Nested stack resources use the **`nestedStackId/resourceId`** form |
| `--no-watch` | Turn off automatic syncing and perform a **one-off CloudFormation deployment** combining `sam build` and `sam deploy` |
| `--skip-deploy-sync` | Compare the local template with the deployed template and skip the initial deployment if nothing changed. However, **even with no changes it deploys if more than 7 days have passed since the last deployment or if there are many Lambda code changes** |
| `--stack-name` | The stack to update |
| `--watch-exclude` | Files and folders that should not trigger a sync |

**Do not confuse the two paths.**

| Purpose | Command |
|---|---|
| Fast iteration during development | `sam sync --watch` (development stacks only) |
| Production deployment | `sam deploy` or a CI/CD pipeline |

In other words, the courseware's four-step workflow is still correct **as a production path.** `sam sync` does not replace it; it adds a separate path for the development loop.

> — Source: [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html)

### 9.7 Verifying Deployment Results 🆕

The demo item "show the resources created" on slide 28 appears to assume console work. The current CLI has a path to the same information.

| Subcommand | What it shows |
|---|---|
| `sam list endpoints` | The list of **cloud and local endpoints** for a CloudFormation stack |
| `sam list resources` | The **resources in the AWS SAM template** that will be created in AWS CloudFormation at deployment |
| `sam list stack-outputs` | The **outputs of the CloudFormation stack** created from an AWS SAM or CloudFormation template |

The documentation describes `sam list` as printing important information about a serverless application's resources and application state, and states that it is used **both before and after deployment** to aid local and cloud development. So `resources` can be viewed before deploying too.

```bash
# Before deployment - see what this template will create
sam list resources

# After deployment - check the API endpoints
sam list endpoints

# After deployment - check the stack outputs
sam list stack-outputs --stack-name my-stack
```

> — Source: [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html)

### 9.8 Cleaning Up 🆕

**The courseware never covers how to clean up deployed resources.** The demonstration ends after deploying and testing the application, so a cleanup step is needed.

| Item | Documentation statement |
|---|---|
| What it deletes | The **CloudFormation stack**, the **artifacts** packaged and deployed to Amazon S3 and Amazon ECR, and the **AWS SAM template file** |
| Companion stack | It checks whether an Amazon ECR companion stack is deployed and, if so, **asks the user whether to delete that stack and the Amazon ECR repository** |
| `--no-prompts` | Non-interactive mode. In this mode the **companion stack and Amazon ECR repository are deleted by default**, and you **must provide** the stack name through the `--stack-name` option or a configuration TOML file |
| `--stack-name` | The name of the CloudFormation stack to delete |
| `--s3-bucket` · `--s3-prefix` | The S3 path to delete |

```bash
# Delete the stack and artifacts interactively
sam delete --stack-name my-stack

# Non-interactive. Note that the companion stack and ECR repository
# are deleted by default
sam delete --stack-name my-stack --no-prompts
```

This connects to the stack definition in [Section 1.2](#12-terminology). Deleting a stack deletes all of its resources, so a single `sam delete` cleans up after a demonstration or lab.

> — Source: [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html)

### 9.9 The Demonstration Procedure 🆕

Slide 28 lists demo items and **has no instructor notes at all.** There is nothing about what to demonstrate in what order or what constitutes success, and no reference URL. The courseware items are filled in as commands below.

| Courseware demo item | Sub-item | Command | What to check |
|---|---|---|---|
| Initialize the AWS SAM environment | Available runtimes · quick templates | `sam init` | In the interactive flow: `AWS Quick Start Templates` → `Hello World Example` → runtime → package type → project name. **The creation summary includes `samconfig.toml`** |
| Build the AWS SAM application | Folder structure · build options (container versus local) | `sam validate` → `sam build` | Check `Built Artifacts : .aws-sam/build` in the successful build output. Container builds use `sam build --use-container`; local builds use `--no-use-container` |
| Invoke AWS SAM resources | Local testing | `sam local generate-event` → `sam local invoke` | Create an event, save it to a file, and pass it to the function. Logs go to stderr and results to stdout |
| Deploy the AWS SAM application | Show the resources created · test the application | `sam list resources` → `sam deploy --guided` → `sam list endpoints` | The resource list before deployment, the change set confirmation prompt during deployment, and the endpoints afterward |
| (Not in the courseware) 🆕 | Clean up | `sam delete` | Deletes the stack and artifacts |

```bash
# The full demonstration procedure
# 1. Initialize - create the project through the interactive flow
sam init

# 2. Validate and build
sam validate --lint
sam build

# 3. Local testing - create an event and pass it to the function
sam local generate-event apigateway aws-proxy > events/event.json
sam local invoke HelloWorldFunction --event events/event.json

# 4. Before deploying - see what this template creates
sam list resources

# 5. First deployment - build samconfig.toml through the interactive flow
sam deploy --guided

# 6. Verify the deployment
sam list endpoints
sam list stack-outputs --stack-name sam-app

# 7. Clean up - a step that is not in the courseware
sam delete --stack-name sam-app
```

The demo's first item, "**available runtimes**," appears to refer to the runtime list `sam init` presents. The allowed values for `sam init --runtime` are in [Section 8.4](#84-sam-init). Note, however, that **we could not verify the runtime list the interactive flow itself displays** ([Section 11.5](#115-items-we-could-not-verify)).

> — Source: [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html)

> — Source: [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html)

> — Source: [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html)

---

## 10. Deployment Strategies

The courseware's deployment strategies section (slides 25–26) has only three words in the body — `Canary`, `Linear`, `All-at-once` — and its entire instructor note is about AWS CodeDeploy. **Module objective 4 asks students to "describe the various AWS SAM deployment strategies," yet AWS SAM never appears in this section.** This chapter first covers the CodeDeploy side the courseware does address ([Section 10.1](#101-the-two-deployment-types) through [Section 10.3](#103-predefined-deployment-configurations)), then fills in how to declare it in a SAM template ([Section 10.4](#104-declaring-deployment-strategy-in-a-sam-template) through [Section 10.8](#108-rollback-paths-in-one-place)).

### 10.1 The Two Deployment Types 🔄

The slide 26 instructor note presents two CodeDeploy deployment options. **The statement about in-place deployment matches the documentation.**

| Deployment type | Courseware instructor note | Verification |
|---|---|---|
| In-place deployment | The application on each instance in the deployment group is stopped. The latest application revision is installed, and the new version of the application is started and validated. **In-place deployments can be used only for deployments that use the EC2/on-premises compute product and services** | **Matches.** The documentation states that "only deployments that use the EC2/On-Premises compute platform can use in-place deployments" |
| Blue/green deployment | Traffic moves from the current compute environment to a new one with the updated application revision | **Matches** |

🔄 **However, the courseware places two different layers side by side and never says which type Lambda deployments are.** The three words in the slide body are **deployment configurations** for the Lambda compute platform, while the in-place and blue/green types the instructor note describes are **deployment types.** The documentation states the relationship explicitly.

| Documentation statement | Meaning |
|---|---|
| **AWS Lambda and Amazon ECS deployments cannot use an in-place deployment type** | Lambda deployments have no in-place option |
| **All AWS Lambda and Amazon ECS deployments are blue/green** | Lambda deployments are always blue/green |
| EC2/on-premises deployments can be in-place **or** blue/green | EC2/on-premises is the only side with a choice |

So `Canary`, `Linear`, and `All-at-once` are **deployment configurations that shift traffic within a Lambda blue/green deployment.**

What moves to what also differs per platform.

| Platform | What traffic moves between |
|---|---|
| AWS Lambda | From one Lambda function version to **a new version of the same function** |
| Amazon ECS | From a service's task set to **an updated replacement task set** |
| EC2/on-premises | From the set of instances in the original environment to **a replacement set of instances** |

The documentation also gives the steps for an EC2/on-premises blue/green deployment.

| Step | Content |
|---|---|
| 1 | Provision the replacement environment |
| 2 | Install the latest revision |
| 3 | An **optional wait** for application testing and system validation |
| 4 | **Register the replacement environment instances with an Elastic Load Balancing load balancer** to reroute traffic and deregister the original environment instances |

Blue/green deployments on the EC2/on-premises platform work **only with Amazon EC2 instances.** Also, in blue/green deployments through CloudFormation, traffic shifts as part of a CloudFormation stack update, and **only ECS blue/green deployments are currently supported.**

🆕 **The advantages blue/green deployments have over in-place deployments** are absent from the courseware too. The second item in particular ties directly to problem 4 (no rollback plan) from [Section 2.1](#21-problems-with-traditional-software-deployment).

| Advantage | Content |
|---|---|
| Pre-validation | You can **install and test** the application in the new replacement environment and deploy to production by rerouting traffic only |
| Rollback | On EC2/on-premises, if the original instances have not been terminated you can roll back to the latest version **simply by rerouting traffic**, which is faster and more reliable. **In-place deployments must redeploy the previous version to roll back** |
| Traffic control | On the AWS Lambda platform you can **control how traffic shifts** from the original function version to the new one |

🆕 The components in-place deployment requires are absent from the courseware as well. An **AppSpec file (application specification file)** defines the deployment actions CodeDeploy runs, an **application revision** bundling the deployable content and the AppSpec file is uploaded to an Amazon S3 bucket or GitHub repository, and the **CodeDeploy agent** on each instance polls CodeDeploy for the target revision and deploys it.

> — Source: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

> — Source: [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

### 10.2 The Three Compute Platforms 🔄

🔄 **The courseware describes only two compute platforms, EC2/on-premises and AWS Lambda.** The documentation lists **three**.

| Platform | What it describes | How traffic is managed |
|---|---|---|
| **EC2/On-Premises** | **Physical server instances** that can be Amazon EC2 cloud instances, on-premises servers, or both | In-place **or** blue/green deployment type |
| **AWS Lambda** | An application composed of **updated versions** of Lambda functions | Choose among canary, linear, and all-at-once configurations |
| **Amazon ECS** | Deploys containerized applications as **task sets** | CodeDeploy installs the updated version as a **new replacement task set** for a blue/green deployment |

The reason the courseware's omission of Amazon ECS matters in practice is that the same three deployment configurations (canary, linear, all-at-once) **also exist on the ECS platform.** This concept is not Lambda-only.

The documentation also covers how to create a custom deployment configuration.

| Item | Content |
|---|---|
| How to create it | The **CodeDeploy console, the AWS CLI, the CodeDeploy API, or a CloudFormation template** |
| What you choose in the console | A compute platform: **EC2/On-premises, AWS Lambda, or Amazon ECS** |
| Zonal configuration | Supported **only for in-place deployments to Amazon EC2 instances**, and **cannot be used with predefined deployment configurations**, so you must create a custom one |

Both URLs the instructor note cites as references **are still valid.**

| Courseware reference URL | Status |
|---|---|
| `deployment-configurations-create.html` | **Valid.** The page title is `Create a deployment configuration with CodeDeploy` |
| `deployment-configurations.html#deployment-configuration-lambda` | **Valid.** The page title is `Working with deployment configurations in CodeDeploy` |

> — Source: [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

> — Source: [Create a deployment configuration with CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations-create.html)

### 10.3 Predefined Deployment Configurations 🔄

Slide 26 gives only the three words `Canary`, `Linear`, and `All-at-once`, and **never names a single predefined configuration.** The documentation provides a list of fixed names.

First, verifying the courseware's instructor note descriptions:

| Configuration | Courseware instructor note | Verification |
|---|---|---|
| Canary | **"Traffic is shifted in 2 increments at a time."** You can select a predefined canary option that specifies the percentage of traffic shifted to the updated Lambda function version in the first increment, and you can also choose the interval in minutes. This shift completes before the remaining traffic moves in the second increment | 🔄 **The first sentence is a mistranslation.** The original means traffic is shifted **in two increments** (shifted in two increments); "2 increments at a time" reads as if the increment size were 2. The documentation describes shifting a percentage in the first increment and deploying the remainder N minutes later. The **later sentence in the same note correctly assumes two increments**, so it conflicts inside the courseware |
| Linear | Traffic is shifted in equal increments with an equal number of minutes between each increment | **Matches** |
| All-at-once | All traffic shifts from the existing Lambda function to the updated Lambda function version **at once** | **Matches** |
| Custom | You can also create your own custom canary or linear deployment configuration | **Matches** |

**There are nine predefined deployment configurations for the Lambda compute platform.**

| # | Deployment configuration name | Behavior |
|---|---|---|
| 1 | `CodeDeployDefault.LambdaCanary10Percent5Minutes` | Shifts **10%** of traffic in the first increment and deploys the remaining **90%** **5 minutes** later |
| 2 | `CodeDeployDefault.LambdaCanary10Percent10Minutes` | The remaining 90% **10 minutes** later |
| 3 | `CodeDeployDefault.LambdaCanary10Percent15Minutes` | The remaining 90% **15 minutes** later |
| 4 | `CodeDeployDefault.LambdaCanary10Percent30Minutes` | The remaining 90% **30 minutes** later |
| 5 | `CodeDeployDefault.LambdaLinear10PercentEvery1Minute` | Shifts **10% every minute** until all traffic has moved |
| 6 | `CodeDeployDefault.LambdaLinear10PercentEvery2Minutes` | **10% every 2 minutes** |
| 7 | `CodeDeployDefault.LambdaLinear10PercentEvery3Minutes` | **10% every 3 minutes** |
| 8 | `CodeDeployDefault.LambdaLinear10PercentEvery10Minutes` | **10% every 10 minutes** |
| 9 | `CodeDeployDefault.LambdaAllAtOnce` | Shifts all traffic to the updated Lambda function **at once** |

**The EC2/on-premises platform has three predefined configurations and a default.**

| Deployment configuration name | Note |
|---|---|
| `CodeDeployDefault.AllAtOnce` | — |
| `CodeDeployDefault.HalfAtATime` | — |
| `CodeDeployDefault.OneAtATime` | 🆕 **CodeDeploy uses this one if you do not specify a deployment configuration.** The courseware does not cover this default |

What an EC2/on-premises deployment configuration specifies. This is what the courseware instructor note's "if you need a minimum of 50% of instances, you can specify that in the deployment configuration" refers to.

| Value | Content |
|---|---|
| minimum healthy hosts | The **number or percentage of instances that must remain available** at any point during the deployment |
| minimum healthy hosts per zone | An optional value. The minimum healthy hosts per zone |

> — Source: [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

### 10.4 Declaring Deployment Strategy in a SAM Template 🆕

**This is the largest gap in the courseware.** What module objective 4 asks for — "AWS SAM deployment strategies" — comes down to two properties on `AWS::Serverless::Function`.

| Property | What it does |
|---|---|
| **`AutoPublishAlias`** | When you give an alias name, AWS SAM **detects a new code deployment based on the change to the Lambda function's Amazon S3 URI**, **creates and publishes an updated version** of the function with the latest code, and **creates the alias** with the name you gave (or uses the existing one) pointing at the updated version |
| **`DeploymentPreference`** | Specifies how traffic shifts (`Type`), the automatic rollback condition (`Alarms`), and validation functions (`Hooks`) |

The documentation states that AWS SAM **has CodeDeploy built in** to provide gradual AWS Lambda deployments, and that **with only a few lines of configuration** it does four things.

| # | What a few lines of configuration gives you |
|---|---|
| 1 | **Deploys a new version** of your Lambda function and **automatically creates an alias** pointing at the new version |
| 2 | **Gradually shifts customer traffic** until you are satisfied the update behaves as expected. If it does not, you can **roll back** the change |
| 3 | Defines **pre-traffic and post-traffic test functions** that verify the newly deployed code is correctly configured and the application behaves as expected |
| 4 | **Automatically rolls back the deployment if CloudWatch alarms are triggered** |

Enabling gradual deployment in an AWS SAM template **creates CodeDeploy resources automatically, and you can view them directly in the AWS Management Console.** The documentation also names what gets created.

| Property you specified | Resources AWS SAM creates |
|---|---|
| `AutoPublishAlias` | `AWS::Lambda::Version` · `AWS::Lambda::Alias` |
| `DeploymentPreference` | `AWS::CodeDeploy::Application`(one per stack, named **`ServerlessDeploymentApplication`**) · `AWS::CodeDeploy::DeploymentGroup`(named **`<function-logical-id>DeploymentGroup`**) · `AWS::IAM::Role`(named **`CodeDeployServiceRole`**) |

```yaml
# What "AWS SAM deployment strategies" in module objective 4 actually means
Resources:
  listFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: list-function/
      Handler: app.lambda_handler
      Runtime: python3.12

      # When the code changes, a new version is published and an alias with
      # this name points at that version
      AutoPublishAlias: live

      DeploymentPreference:
        # One of the nine predefined values. Watch the spelling
        Type: Canary10Percent10Minutes
```

⚠️ **There is a condition on the invocation side too.** The documentation states that function invocations must **use the alias qualifier** to get this benefit. In other words, even after a new version is published and the alias moves, callers that do not go through the alias are not subject to the gradual shift.

> — Source: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — Source: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 10.5 DeploymentPreference Fields 🆕

`DeploymentPreference` has three fields.

| Field | Content |
|---|---|
| `Type` | How traffic shifts. Three families: **`Canary`**(traffic shifted in **two increments**) · **`Linear`**(equally sized increments with an equal number of minutes between them) · **`AllAtOnce`**(all traffic at once) |
| `Alarms` | A list of **CloudWatch alarms** triggered by errors the deployment causes. If triggered, the deployment is **rolled back automatically** |
| `Hooks` | Validation functions run **before traffic shifting to the new version starts (`PreTraffic`)** and **after the shift completes (`PostTraffic`)** |

**There are nine predefined `Type` values.** Their spelling differs from the CodeDeploy names in [Section 10.3](#103-predefined-deployment-configurations).

| # | SAM `Type` value | Corresponding CodeDeploy deployment configuration |
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

🔄 **Watch the spelling.** Slide 26 writes `All-at-once` with hyphens, but **the value you put in a SAM template is `AllAtOnce`**, one word with no hyphens. Copying the courseware notation produces an invalid template.

The documentation also gives the rules for `Hooks`.

| Item | Content |
|---|---|
| When they run | `PreTraffic` runs **before traffic shifting starts**, `PostTraffic` **after the shift completes** |
| What they must do | **Both functions must call back to CodeDeploy with success or failure** |
| On failure | The deployment **stops and reports failure to CloudFormation** |

```yaml
# Alarms and Hooks used together
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
        # If this alarm is triggered, the deployment rolls back automatically
        Alarms:
          - !Ref AliasErrorMetricGreaterThanZeroAlarm
        # Both hook functions must call back to CodeDeploy with success or failure.
        # On failure the deployment stops and is reported to CloudFormation as failed
        Hooks:
          PreTraffic: !Ref PreTrafficHookFunction
          PostTraffic: !Ref PostTrafficHookFunction
```

`Alarms` and `Hooks` are the answer to problem 4 ("no rollback plan") from [Section 2.1](#21-problems-with-traditional-software-deployment). **The courseware covers neither.**

> — Source: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

### 10.6 The First Gradual Deployment Takes Two Steps 🆕

A constraint absent from the courseware that you will certainly hit in practice. **Gradual deployment requires a previous version for CodeDeploy to shift traffic from, so the first deployment must be done in two steps.**

| Step | What to include | Result |
|---|---|---|
| Step 1 | **`AutoPublishAlias` only** | The alias is created |
| Step 2 | **Add `DeploymentPreference`** | Gradual deployment is performed |

```yaml
# Step 1 - deploy once with AutoPublishAlias only, to create the alias
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
# Step 2 - add DeploymentPreference to perform the gradual deployment
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

Without knowing this constraint it is hard to understand why no gradual shift happens on the first deployment. There is no previous version to shift from.

> — Source: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

### 10.7 Weighted Alias Routing 🆕

The courseware explains `Canary`, `Linear`, and `All-at-once` only as CodeDeploy deployment configurations and never covers **what those configurations actually manipulate.** The documentation states that **weighted alias routing configuration is the underlying feature that implements rolling deployments.**

| Item | Documentation statement |
|---|---|
| What it is | A **weighted alias** splits traffic between two different versions of the same function |
| What you can do with it | Test a new version with a small amount of traffic and **roll back quickly** if needed. This is called a **canary deployment** |
| How it differs from blue/green | A canary deployment exposes the new version **to only a fraction of requests** rather than switching all traffic at once |

⚠️ **There are several restrictions, and they are absent from the courseware.**

| Restriction | Content |
|---|---|
| Number of versions | An alias can point to **at most two** function versions |
| Execution role | The two versions must **have the same execution role** |
| Dead-letter queue | Their configuration must be **the same or absent** |
| Publication state | Both must be **published versions.** **`$LATEST` is not allowed** |
| At low traffic | Because Lambda uses a **simple probabilistic model** to distribute traffic between the two versions, at low traffic the actual ratio **can deviate substantially** from the configured one |

```bash
# Specify the routing configuration when creating the alias. Send 3% to version 2
aws lambda create-alias \
  --function-name listFunction \
  --name live \
  --function-version 1 \
  --routing-config AdditionalVersionWeights={"2"=0.03}

# Send all traffic to version 2.
# Change function-version to 2 and reset the routing configuration
aws lambda update-alias \
  --function-name listFunction \
  --name live \
  --function-version 2 \
  --routing-config AdditionalVersionWeights={}
```

In the console, when you assign a weight (%) to the additional version, **the first version automatically receives the remaining weight.**

How to determine which version was invoked is also absent from the courseware.

| Path | Content |
|---|---|
| CloudWatch Logs | `Version: 2` in the **`START` log entry** |
| Synchronous invocation response | The **`x-amz-executed-version` header** |
| Metrics | Filter alias invocation metrics by the **`ExecutedVersion` dimension** |

The documentation's rolling deployment section lists four things AWS SAM does. It is the same story as the automatic resource creation in [Section 10.4](#104-declaring-deployment-strategy-in-a-sam-template), told from another angle.

| # | What AWS SAM does |
|---|---|
| 1 | Configures the Lambda function and **creates an alias.** Weighted alias routing configuration is the underlying feature that implements rolling deployments |
| 2 | Creates a **CodeDeploy application and deployment group.** The deployment group manages the rolling deployment and rollback if needed |
| 3 | **Detects the creation of a new function version** |
| 4 | **Triggers CodeDeploy to start deploying the new version** |

The documentation's example SAM template also uses `AutoPublishAlias` and `DeploymentPreference`(`Type: Linear10PercentEvery2Minutes`).

> — Source: [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html)

### 10.8 Rollback Paths in One Place 🆕

Slide 5 presents "no rollback plan" as a problem with traditional deployment, but **nowhere in the deck does it say how to configure rollback.** Here are all the rollback paths verified in this document, gathered in one place.

| Layer | What performs the rollback | Where it was covered |
|---|---|---|
| CloudFormation stack | The default behavior is a **rollback to the last stable state.** Controlled with `--on-failure`(`ROLLBACK` / `DELETE` / `DO_NOTHING`) and `--disable-rollback` | [Section 9.5](#95-change-sets-and-rollback) |
| Pre-deployment review | Change sets let you see the resources that will be added, modified, and deleted **before applying.** `--no-execute-changeset` | [Section 9.5](#95-change-sets-and-rollback) |
| Template version control | Because templates are text files, you can revert to **a previous version of the template** | [Section 3.1](#31-infrastructure-as-code) |
| Lambda traffic | **`Alarms`** on `DeploymentPreference` **roll the deployment back automatically** when triggered | [Section 10.5](#105-deploymentpreference-fields) |
| Lambda validation | If `Hooks`(`PreTraffic` / `PostTraffic`) fail, the deployment **stops and reports failure to CloudFormation** | [Section 10.5](#105-deploymentpreference-fields) |
| Lambda alias | A weighted alias exposes only a small share of traffic, allowing a **quick rollback** | [Section 10.7](#107-weighted-alias-routing) |
| Blue/green (EC2) | If the original instances have not been terminated, roll back **simply by rerouting traffic** | [Section 10.1](#101-the-two-deployment-types) |
| In-place (EC2) | **Must redeploy the previous version** to roll back | [Section 10.1](#101-the-two-deployment-types) |

One more wording problem in the slide 26 instructor note is worth noting. It opens a list with "To customize the deployment of your application, **you must do the following**" and lists three items — use AWS DevOps tools, use third-party deployment tools, implement your own solution — but **those three are alternatives.** Bundled under "you must," they read as if all three were required. "Choose one of the following" would be correct ([Section 11.1](#111-courseware-statements-that-do-not-match-the-facts)).

> — Source: [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

> — Source: [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html)

> — Source: [Overview of CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)

---

## 11. Changes from the Courseware

Items in the courseware (the instructor deck) that differ from current behavior. Students are following the official courseware alongside this document, so we record what was changed and why.

### 11.1 Courseware Statements That Do Not Match the Facts

The first seven items were **verified against external documentation.** The following nineteen are **internal inconsistencies** — places where the courseware body and instructor note disagree, or where notation broke during extraction — and are therefore not something external documentation can verify. Those carry `—` in the evidence column.

| Item | What the courseware says | Verified content | Evidence |
|---|---|---|---|
| Capitalization of the `Transform` value (slide 14) | `Transform: AWS::serverless-2016-10-31` — **lowercase `s`** | The documented value is **`AWS::Serverless-2016-10-31`**(capital `S`), and the declaration is **required** in an AWS SAM template file. The `Type: AWS::Serverless::Function` in the same code block uses a capital `S`, so the notation splits inside the courseware. The documentation also gives an ordering rule: when using language extensions, `AWS::LanguageExtensions` must come before the serverless transform ([Section 5.2](#52-the-transform-declaration)) | [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html) |
| `Globals` described as "global variables" (slide 14) | Annotation box: "Sets the **global variables** to be used within the AWS SAM template" | `Globals` is not a section for declaring variables. It is where you **declare properties several resources have in common once and let them inherit.** The section that parameterizes values is **`Parameters`.** Eight resource types inherit, override rules differ by data type (primitives replace, maps merge, lists prepend), and **a declared property cannot be removed by a resource.** The `MethodSettings` on `Api` the courseware puts inside `Globals` is also a common resource property value, not a variable ([Section 5.3](#53-the-globals-section)) | [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html) |
| Languages that cannot use `--use-container` (slide 23) | Instructor note: "Some languages (for example .NET or Python) cannot use the `-use-container` option" | **The current `sam build` reference contains no such statement.** On the contrary, the `--build-image` description gives `sam build --use-container --build-image amazon/aws-sam-cli-build-image-python3.8` as an example. The only restriction the documentation states is **incompatibility with `--build-in-source`**, and `--build-image`, `--container-env-var`, and `--container-env-var-file` conversely error out **without** `--use-container`. The instructor note also writes the option with one hyphen, while the correct spelling is **`--use-container`**(short form `-u`) ([Section 9.2](#92-sam-build-and-container-builds)) | [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) |
| "Configuration file" attached to `--template-file` (slides 24 · 21) | The comment "# Deploy using a configuration file" above `sam deploy --template-file deploy.yml` | `--template-file`(`--template`, `-t`) specifies the path and name of the **AWS SAM template**, defaulting to `template.yaml` or `template.yml`. SAM's configuration file is specified with **`--config-file`**, defaults to **`samconfig.toml`** at the project root, and the environment name is chosen with `--config-env`(default `default`). The slide 21 instructor note's "to deploy through interactive prompts when using a configuration file" has the same confusion, and interactive deployment (`--guided`) and configuration-file-based deployment are **different paths** ([Section 9.4](#94-sam-deploy-and-samconfigtoml)) | [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) |
| A read role on the Delete function (slide 15) | `Role: !Sub arn:aws:iam::${AWS::AccountId}:role/DynamoDBReadRole` | **Deleting a DynamoDB item requires write permission**, so the name and the purpose disagree. The documentation also states that **setting `Role` makes `Policies` ignored**, and that without `Role` a role with the logical ID `<function-logical-id>Role` is created automatically. `Policies` accepts policy templates, managed policy ARNs, managed policy names, and inline policies, and the right choice for a Delete function is `DynamoDBCrudPolicy` or `DynamoDBWritePolicy` ([Section 5.5](#55-correcting-the-slide-15-template) · [Section 5.6](#56-function-permissions-policies-and-role)) | [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) |
| Mistranslation of the Canary description (slide 26) | Instructor note: "Canary - traffic is shifted in **2 increments at a time**" | The original means traffic is shifted **in two increments** (shifted in two increments). "2 increments at a time" reads as if the increment size were 2. The documentation describes shifting a percentage in the first increment and deploying the remainder N minutes later — for example `CodeDeployDefault.LambdaCanary10Percent10Minutes` shifts 10% in the first increment and deploys the remaining 90% 10 minutes later. **The later sentence in the same note correctly assumes two increments**, so it conflicts inside the courseware ([Section 10.3](#103-predefined-deployment-configurations)) | [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html) |
| Asserting manual approval is required for continuous delivery (slide 7) | Instructor note: "Continuous delivery **must go through a manual approval step** before deploying to production" | The documentation describes continuous delivery as a methodology where the release process is automated, and states that before the final push to production **a person, an automated test, or a business rule** determines when that push happens. Since the decision maker may be a person but may also be an automated test or a business rule, **manual approval is not required** ([Section 2.3](#23-the-three-devops-processes)) | [Continuous delivery and continuous integration](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-continuous-delivery-integration.html) |
| Code folder name mismatch (slide 15) | Instructor note: "the code is in a folder called **`deleteFunction`**" versus the template's `CodeUri: delete-function/` | `deleteFunction` is not a folder name but a **logical resource ID.** This document distinguishes the logical ID from the `CodeUri` path ([Section 5.5](#55-correcting-the-slide-15-template)) | — |
| The Delete function's event is named `listNotes` (slide 15) | The item under `Events:` is named `listNotes`, matching the `listFunction` event name on slide 14 | This looks like a copy-paste artifact from slide 14. The same template references `!Ref pollyNotesTable` but **that table resource is not defined in the slide**, with the preceding content cut off by an ellipsis. The slide 15 label also reads "SAM template" while every other slide says "AWS SAM template." This document renamed the event to `deleteNote` and included the table resource ([Section 5.5](#55-correcting-the-slide-15-template)) | — |
| Four notation errors in the terminal examples (slide 21) | The `>>` prompt, `_init_.py`, a smart quote, and only `Tests` capitalized | ① The shell prompt is `>>` while slides 22, 23, and 24 all use `$`. ② `_init_.py` is a typo for **`__init__.py`**(two underscores on each side). ③ The closing quote in the `functions` list of the `sam build` output is a **right single quotation mark** rather than a straight apostrophe. ④ The folder names `events` and `hello_world` are lowercase while **only `Tests` is capitalized** ([Section 8.4](#84-sam-init)) | — |
| Instructor note sentences that do not parse (slide 21) | Init: "You can select built-in applications a template or a custom template" · Deploy: "To deploy through interactive prompts when using a configuration file" | The Init item appears to be a typo for "You can select a built-in application **template** or a custom template." The Deploy item has its causality inverted. **Interactive deployment and configuration-file-based deployment are different paths**, and slide 24 presents them as separate examples ([Section 8.4](#84-sam-init) · [Section 9.1](#91-the-standard-workflow)) | — |
| Abbreviation assignment and item count mismatch for CI/CD (slides 7 · 9) | The instructor note assigns `CI` to continuous integration and `CD` to continuous deployment, and **gives continuous delivery no abbreviation** | Since both `continuous delivery` and `continuous deployment` are abbreviated `CD` in English, that assignment invites confusion. Also, slide 7 presents three processes while **the six DevOps practices on slide 9 do not include continuous deployment.** This document uses **only the abbreviation `CI`** and writes the others out ([Section 2.3](#23-the-three-devops-processes) · [Section 2.5](#25-devops-practices)) | — |
| Body labels disagree with instructor note headings (slide 6) | Three of the eight items are named differently | Body "Focus on customer needs" versus note "Customer-needs focused," body "Build a highly collaborative environment" versus note "Highly collaborative environment," body "Automate wherever possible" versus note "Automate where applicable." This document standardizes on **the body labels** ([Section 2.2](#22-devops-culture)) | — |
| Missing spaces in diagrams and instructor notes (slides 9 · 17) | The Korean labels for "Monitoring and logging" and "Communication and collaboration" lose the space before the conjunction, "Infrastructure as code" is split across two lines, and the note runs `AWS::Serverless::Api` into the following word | This looks like the result of line breaks or separate text fragments being joined during extraction. The correct forms are **Monitoring and logging · Communication and collaboration · Infrastructure as code · the `AWS::Serverless::Api` resource type.** The same kind of run-together text was found in M12 ([Section 2.5](#25-devops-practices) · [Section 7.1](#71-the-six-mechanisms)) | — |
| Only four of six resources mapped, and a reference link for another slide's topic (slide 16) | The mapping table has four rows and the second reference link is the API Gateway resource policies page | The slide body presents six resource types, but the mapping table **has no corresponding service for `AWS::Serverless::HttpApi` or `AWS::Serverless::LayerVersion`.** In particular it collapses `Api` and `HttpApi` into a single "Serverless API." The second reference link's topic is **slide 17 (controlling access with AWS SAM).** The link itself is valid ([Section 6.2](#62-mapping-resources-to-aws-services)) | — |
| No SAM content corresponding to module objective 4 (slides 3 · 32 · 25–26) | Both the objectives and the summary state "Describe the various **AWS SAM** deployment strategies" | **AWS SAM never appears in the deployment strategies section.** The slide 26 body is three words and the entire instructor note is about CodeDeploy, and the body (Lambda-only deployment configurations) and the note (EC2/on-premises-centric in-place and blue/green, plus the "minimum 50% of instances" example) **mix two different layers.** This document fills that gap with `AutoPublishAlias` and `DeploymentPreference` ([Section 10](#10-deployment-strategies)) | — |
| Alternatives stated as requirements (slide 26) | Instructor note: "To customize the deployment of your application, **you must do the following**" plus three items | Use AWS DevOps tools, use third-party deployment tools, and implement your own solution are **alternatives**, but bundled under "you must" they read as if all three were required. "Choose one of the following" would be correct ([Section 10.8](#108-rollback-paths-in-one-place)) | — |
| Three steps in the body versus four in the note (slide 19) | The body gives three steps; the note counts creating an AWS account separately, for four | The body also says only "optional" about Docker while the note adds the condition "if you plan to test your application locally." **The points where Docker is actually needed** are local testing and container builds ([Section 8.1](#81-prerequisites)) | — |
| All knowledge check answer boxes are empty (slide 30) | All six answer text boxes for the six true/false questions are empty | The check marks are present only as animations or images, so **the extracted text cannot tell which answer is correct and it can only be determined from the instructor notes.** This is the same structure as M12 slide 29 | — |
| Knowledge check 5's explanation cites content absent from the deck (slide 30) | Explanation: "there are various AWS toolkits that build and debug code locally across a variety of IDE and runtime combinations" | **This deck has no slide covering AWS toolkits.** Slide 19 also covers only CLI installation. The toolkit the current AWS SAM prerequisites page presents as (optional) step 3 is **AWS Toolkit for VS Code** ([Section 8.1](#81-prerequisites)) | — |
| The demonstration slide has no instructor notes (slide 28) | Only items are listed, with no instructor note and no reference URL | There is nothing about what to demonstrate in what order or what constitutes success. M12 slide 27 also lacked instructor notes but at least provided one reference URL. Also, the item "quick templates" appears to render the `AWS Quick Start Templates` from slide 21, so the two slides use different wording. This document fills the demonstration in as a command-level procedure ([Section 9.9](#99-the-demonstration-procedure)) | — |
| No command name for the template validation capability (slide 12) | The instructor note lists "verify that the AWS SAM template file is written to specification" as a CLI capability without naming the command | It is also absent from the command list on slides 20–24. The command is **`sam validate`**, and `--lint` additionally performs `cfn-lint` linting ([Section 8.5](#85-sam-validate)) | — |
| Module objectives and module summary worded differently (slides 3 · 32) | Two of the four items are worded differently | Item 2 splits between "DevOps **does** … development **practices**"(slide 3) and "**in** DevOps … development **methods**"(slide 32). Item 3 differs only in how the abbreviation is written. This document standardizes on **the slide 3 wording** ([Module Objectives](#module-objectives)) | — |
| The agenda's module 12 name differs from the M12 deck (slide 2) | "Granting access to application users" | The subtitle on M12 deck slide 1 is "Granting Access to Your Application Users." The same module carries different names across the two decks ([Where This Module Sits](#where-this-module-sits)) | — |
| No terminology slide (slides 31–33) | The deck goes straight from the module summary to "Thank you" | M12 had term definitions on slide 36. There is no place that organizes the terms newly introduced in this module — DevOps, continuous integration, infrastructure as code, stack, change set, deployment configuration. This document adds a terminology section with a source for each definition ([Section 1.2](#12-terminology)) | — |
| Double spaces and redundant adverbs in instructor notes (slides 5 · 12 · 10) | Two instructor notes contain double spaces between words, and the slide 10 CloudFormation description repeats an adverb of the same meaning | This document normalized the spacing to a single space and removed the redundant adverb ([Section 2.1](#21-problems-with-traditional-software-deployment) · [Section 3.2](#32-aws-tools-for-devops)) | — |

### 11.2 Changed Behavior and Defaults

| Item | What the courseware says | Current | Evidence |
|---|---|---|---|
| The SAM resource type list | Slide 16 presents **6**(`Api` · `HttpApi` · `Function` · `LayerVersion` · `SimpleTable` · `StateMachine`) | **13.** All six from the courseware are still valid and seven were added — `Application`(nested serverless applications) · `CapacityProvider` · **`Connector`**(permissions between resources) · `GraphQLApi` · `WebSocketApi` · `MicrovmImage` · `NetworkConnector`. These resources and properties are defined with AWS SAM shorthand syntax, and SAM also supports CloudFormation resource and property types ([Section 6.1](#61-thirteen-resource-types)) | [AWS SAM resources and properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-resources-and-properties.html) |
| Ways to grant permissions between resources | **Only two** — `Policies`(a managed policy name) on slide 14 and `Role`(an existing role ARN) on slide 15 | **`AWS::Serverless::Connector`** was added after the courseware. There are two syntaxes — an **embedded connector syntax** with a `Connectors` block inside the source resource, and a standalone resource declaration — and the documentation recommends the embedded syntax for most use cases, advising the standalone syntax when referencing a source that is not in the same template, such as **a nested stack resource or a shared resource.** The valid `Permissions` values are **`Read` and `Write`**, and SAM turns that declared intent into the IAM permissions needed ([Section 6.3](#63-connectors)) | [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html) |
| The SAM CLI command list | Slides 20–24 present **7** | **24.** Among the commands absent from the courseware, the most important are **`sam validate`**(the capability slide 12 mentions without naming) · **`sam sync`** · **`sam delete`** · **`sam remote invoke`** · `sam list` · `sam logs` · `sam traces` · `sam publish` · `sam pipeline`(bootstrap · init). `sam local` also has **six** subcommands rather than three (`callback` · `execution` · `generate-event` · `invoke` · `start-api` · `start-lambda`) ([Section 8.3](#83-twenty-four-cli-commands) · [Section 8.6](#86-six-sam-local-subcommands)) | [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html) |
| Workflow steps | Slide 21 gives **four steps**: `sam init` → `sam build` → `sam local invoke` → `sam deploy` | **`sam sync`** was added after the courseware and is part of **AWS SAM Accelerate.** With `--watch` it builds, deploys to CloudFormation, then keeps running and watching for local changes, using an AWS service API for a fast update when the updated resource supports one and performing a CloudFormation deployment when it does not. `--code` syncs only code changes and `--resource-id` targets specific functions or layers. **The documentation recommends `sam sync` for development environments and `sam deploy` or a CI/CD pipeline for production**, so the courseware's four-step workflow remains valid as a production path ([Section 9.6](#96-reducing-the-development-loop-with-sam-sync)) | [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) |
| AWS SAM deployment strategies | Slides 25–26 are entirely about CodeDeploy and **contain no way to declare it in a SAM template** | Declared with **`AutoPublishAlias`**(automatic alias creation and version publishing) and **`DeploymentPreference`**(`Type` · `Alarms` · `Hooks`) on `AWS::Serverless::Function`. There are nine predefined `Type` values, and **the SAM spelling is `AllAtOnce`, not `All-at-once`.** Specifying `DeploymentPreference` makes SAM create a CodeDeploy application (`ServerlessDeploymentApplication`, one per stack), a per-function deployment group, and a `CodeDeployServiceRole` role. **The first gradual deployment must be done in two steps** ([Section 10.4](#104-declaring-deployment-strategy-in-a-sam-template) through [Section 10.6](#106-the-first-gradual-deployment-takes-two-steps)) | [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html) |
| Deployment configuration names | Slide 26 gives **only three words**: `Canary` · `Linear` · `All-at-once` | There are **nine** predefined deployment configurations for the Lambda compute platform, with fixed names (four in the `CodeDeployDefault.LambdaCanary10Percent5Minutes` family, four in the `CodeDeployDefault.LambdaLinear10PercentEvery1Minute` family, and `CodeDeployDefault.LambdaAllAtOnce`). EC2/on-premises has three, and **if you do not specify a deployment configuration, `CodeDeployDefault.OneAtATime` is used.** The courseware also describes only two compute platforms, omitting **Amazon ECS** ([Section 10.2](#102-the-three-compute-platforms) · [Section 10.3](#103-predefined-deployment-configurations)) | [Working with deployment configurations in CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html) |
| The deployment settings configuration file | The courseware **never mentions `samconfig.toml`** | `sam deploy --guided` records the interactive flow's answers in the project's **`samconfig.toml`**, and on later deployments running just `sam deploy` uses those values. The interactive flow's defaults come from `~/.aws/config`, `~/.aws/credentials`, and the project's `samconfig.toml`, and **square brackets indicate the default.** This file is read as the `--config-file` default by `sam build`, `sam deploy`, `sam package`, `sam validate`, `sam delete`, `sam init`, and others, with the environment name chosen by `--config-env`(default `default`). It is also included in the project `sam init` creates ([Section 8.4](#84-sam-init) · [Section 9.4](#94-sam-deploy-and-samconfigtoml)) | [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html) |
| That deployment goes through a change set | Slide 24 and the slide 21 diagram go straight from `sam deploy` to the stack | `sam deploy` creates a **CloudFormation change set** and deploys it. `--confirm-changeset` requires confirmation before execution, and `--no-execute-changeset` creates the change set and exits. The `Confirm changes before deploy` prompt in `sam deploy --guided` is that choice. The documentation states that a change set previews the impact of proposed changes, that CloudFormation changes the stack **only when you decide to execute it**, and that during creation it performs **pre-deployment validation** for causes such as property syntax errors, resource name conflicts, and service quota limits. The rollback options are absent from the courseware too — the default is a rollback to the last stable state, changed with `--disable-rollback` or `--on-failure`(`ROLLBACK` / `DELETE` / `DO_NOTHING`) ([Section 9.5](#95-change-sets-and-rollback)) | [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html) |
| Installation prerequisites | Slide 19 presents an AWS account, IAM permissions and credentials, **Docker (optional)**, and SAM CLI installation | The current prerequisites page states that an AWS account, IAM credentials, an access key pair, and **the AWS CLI** to configure credentials are required, and presents the steps as sign up for an AWS account → **install the AWS CLI** → configure credentials with `aws configure` → **(optional) install AWS Toolkit for VS Code**. **This page has no Docker item.** Docker is needed for local testing, and the `sam local invoke` documentation states that it uses Docker to build and invoke the function in a local container. The installation path also changed: **since September 2023 AWS no longer maintains the AWS-managed Homebrew installer**, and versions older than macOS 13.x are not supported ([Section 8.1](#81-prerequisites) · [Section 8.2](#82-changes-in-the-installation-path)) | [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) |
| Values `Policies` accepts | Slide 14 presents **only one**, an AWS managed policy name | The documentation presents four — **AWS SAM policy templates**, the **ARN** of an AWS managed or customer managed policy, the **name** of a managed policy from a defined list, and an **inline IAM policy** written as a YAML map. Policy templates are predefined policies that scope the permissions of Lambda functions and Step Functions state machines to the resources the application uses, and the table has **79 rows.** Templates that need placeholders take an object, and **templates that need none must be given an empty object (`{}`)** or `sam build` fails. There are seven DynamoDB-related templates ([Section 5.7](#57-sam-policy-templates)) | [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html) |

### 11.3 Discouraged and Unsupported Items

Of the four items below, the `python3.8` and `python3.9` runtimes are **deprecated**. Reproducing the examples on courseware slides 14, 15, 21, and 22 verbatim means using a deprecated runtime, so the templates and CLI examples in this document were corrected to supported runtimes.

| Item | Status | Replacement | Evidence |
|---|---|---|---|
| Running `sam package` as a separate step | **Discouraged.** The documentation states in a Note that "sam deploy now implicitly performs the functionality of sam package" | **`sam deploy`.** Create the bucket automatically with `--resolve-s3`; specifying it together with `--s3-bucket` produces an error. `sam deploy` zips .zip artifacts and uploads them to S3, creating a bucket if needed (shown as `Managed S3 bucket`), and uploads container images to Amazon ECR, creating a repository if needed. **`sam package` itself has not been retired**, so it remains useful when you need the packaged template as a file (`--output-template-file`) ([Section 9.3](#93-sam-package-is-no-longer-a-separate-step)) | [sam package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html) |
| Granting a function the `AmazonDynamoDBReadOnlyAccess` managed policy | **Discouraged.** It is far from least privilege | **The `DynamoDBReadPolicy` policy template**(with `TableName`) or **`AWS::Serverless::Connector`.** Policies specified in `Policies` are appended to the function's default IAM execution role, so a managed policy attaches permission to read **every DynamoDB table in the account.** A policy template narrows the permission to the target table through a placeholder, and a connector lets you declare only the `Read` or `Write` intent between the function and the table while SAM creates the permissions. It works for labs and demonstrations ([Section 5.7](#57-sam-policy-templates) · [Section 6.3](#63-connectors)) | [AWS SAM policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html) |
| The `python3.8` runtime (slides 14 · 15 · 22) | **Deprecated.** The Deprecated runtimes table lists a deprecation date of **October 14, 2024**, block function create on February 1, 2027, and block function update on March 3, 2027 | **A supported Python runtime**(`python3.12` or later recommended; `python3.13` and `python3.14` have a scheduled deprecation date of 2029-06-30 and `python3.12` of 2028-10-31). `sam init --runtime` still lists this value as allowed, but functions created with it use a deprecated runtime. The currently supported Python runtimes are `python3.15`(no deprecation scheduled) · `python3.14` · `python3.13` · `python3.12` · `python3.11` · `python3.10` ([Section 5.4](#54-correcting-the-slide-14-template) · [Section 8.4](#84-sam-init)) | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| The `python3.9` runtime (slide 21) | **Deprecated.** The Deprecated runtimes table lists a deprecation date of **December 15, 2025**, block function create on February 1, 2027, and block function update on March 3, 2027 | The same. The `sam build` output example on slide 21 shows this value as the runtime. **Slides 14, 15, and 22 in the same deck use a different runtime, so the runtime notation splits inside the courseware** ([Section 8.4](#84-sam-init)) | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |

### 11.4 Items Added After the Courseware

| Item | Summary | Evidence |
|---|---|---|
| `AWS::Serverless::Connector` | Configures permissions between two resources. An embedded `Connectors` block (recommended) or a standalone resource syntax. `Permissions` takes `Read` or `Write`. All three properties are AWS SAM-specific with no CloudFormation equivalent | [AWS::Serverless::Connector](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-connector.html) |
| `AutoPublishAlias` and `DeploymentPreference` | Gradual Lambda deployment. Nine predefined `Type` values, `Alarms` for alarm-based automatic rollback, `Hooks` for `PreTraffic` and `PostTraffic` validation. Specifying them creates a CodeDeploy application, deployment group, and service role automatically. **The first deployment takes two steps**, and invocations need the **alias qualifier** | [Deploying serverless applications gradually with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html) |
| `sam sync --watch`(AWS SAM Accelerate) | Watches local changes and syncs by the fastest method. `--code` · `--resource-id` · `--no-watch` · `--skip-deploy-sync`(deploys anyway if more than 7 days have passed since the last deployment) · `--watch-exclude`. **For development environments only**, with a confirmation prompt on execution | [Introduction to using sam sync to sync to AWS Cloud](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/accelerate.html) |
| `samconfig.toml` | The output of `sam deploy --guided` and the basis for later deployments. The `--config-file` default, with the environment chosen by `--config-env`(default `default`). Included in the `sam init` creation summary | [Introduction to deploying with AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-deploy.html) |
| CloudFormation change sets | Preview impact before execution, see added, modified, and deleted resources with before-and-after property comparisons, and pre-deployment validation (property syntax errors, resource name conflicts, service quota limits). All change sets for that stack are removed after execution. **Does not guarantee success** | [Update CloudFormation stacks using change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html) |
| `sam deploy` rollback and capability options | `--on-failure`(`ROLLBACK` default / `DELETE` / `DO_NOTHING`), `--disable-rollback`(cannot be combined with the former), `--capabilities`(`CAPABILITY_IAM` · `CAPABILITY_NAMED_IAM` · `CAPABILITY_AUTO_EXPAND` for nested applications), `--stack-name` required, `--s3-bucket` or `--resolve-s3` required when the template exceeds 51,200 bytes, and the `SAM_CLI_POLL_DELAY` environment variable | [sam deploy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html) |
| `sam validate` | Validates the template. `--lint` runs `cfn-lint` linting (parameters via `cfnlintrc`). `--template-file` is unnecessary if the template is in the current directory under a standard name or you have just run `sam build` | [sam validate](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html) |
| `sam list` | `endpoints`(cloud and local endpoints) · `resources`(resources that will be created at deployment) · `stack-outputs`(stack outputs). Used **both before and after** deployment | [sam list](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-list.html) |
| `sam delete` | Deletes the stack, the S3 and ECR artifacts, and the template file. Asks whether to delete an ECR companion stack. `--no-prompts` **deletes the companion stack and ECR repository by default** and requires `--stack-name` or a configuration TOML file | [sam delete](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-delete.html) |
| `sam local start-lambda` and `sam remote invoke` | `start-lambda` is a local HTTP server **for use with the AWS CLI and SDKs.** `sam remote invoke` **invokes a resource deployed in the cloud directly.** The courseware covers local testing only | [AWS SAM CLI command reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html) |
| Additional `sam init` options | `--package-type Zip` / `Image`, `--architecture x86_64` / `arm64`, `--dependency-manager`, `--base-image`, `--name`, `--output-dir`, `--no-interactive`, `--tracing`, `--application-insights`(off by default), `--extra-content`. `--location` accepts Git · Mercurial · HTTP/HTTPS · .zip · paths, and **Git requires the repository root** | [sam init](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-init.html) |
| Two-stage arguments for `sam local generate-event` | A service name alone lists the event types; a service plus a type prints a sample event. `--region` · `--partition` · `--bucket` · `--key` modify placeholder values | [Introduction to testing with sam local generate-event](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-generate-event.html) |
| The `Auth` property (data type `ApiAuth`) | `Auth` → `DefaultAuthorizer` + `Authorizers` inside the `Properties` of `AWS::Serverless::Api`. The function's `Api` event references an explicit API with **`RestApiId`.** The courseware templates create implicit APIs without `RestApiId` | [Amazon Cognito user pool example for AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis-cognito-user-pool.html) |
| Mechanism selection guidance and error response customization | **Amazon Cognito user pools** for greenfield projects, and a **Lambda authorizer**(formerly custom authorizer) when authentication already exists or custom logic is needed. API Gateway error response customization is supported by **`AWS::Serverless::Api` only** | [Control API access with your AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-controlling-access-to-apis.html) |
| `Globals` inheriting resources and override rules | Eight inheriting resource types, 20 supported `Api` properties, override rules (primitives replace / maps merge / lists prepend), **declared properties cannot be removed**, and implicit API property overrides | [Globals section of the AWS SAM template](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html) |
| The concrete shape of the transformation | A 23-line SAM template expands into over 200 lines of CloudFormation. `Function` → `AWS::Lambda::Function` + `AWS::IAM::Role` + `AWS::Lambda::Permission`, `HttpApi` → `AWS::ApiGatewayV2::Api` + `Stage`, `SimpleTable` → `AWS::DynamoDB::Table`(`id` hash key, `PAY_PER_REQUEST`). Plus `SamResourceId` metadata and a `lambda:createdBy=SAM` tag | [How AWS SAM works](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam-overview.html) |
| Restrictions on Lambda weighted alias routing | An alias points to **at most two versions**, the two versions must share an execution role and dead-letter queue configuration, **`$LATEST` is not allowed**, and at low traffic **the actual ratio can deviate.** The invoked version is determined from the `Version` in the `START` log, the `x-amz-executed-version` header, or the `ExecutedVersion` dimension | [Implement Lambda canary deployments using a weighted alias](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html) |
| AWS Serverless Application Repository | Find, deploy, and publish serverless applications. Public and private sharing, uploading a manifest file (an AWS SAM template), and **deep integration with the AWS Lambda console.** `sam publish` and `AWS::Serverless::Application` connect to it. Generally available at the time we checked | [What Is the AWS Serverless Application Repository?](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html) |
| AWS Toolkit for VS Code | (Optional) step 3 of the SAM prerequisites. Visual debugging · CodeLens integration · a streamlined deployment workflow. Requires **Visual Studio Code 1.73.0 or later** and the YAML language support extension | [AWS SAM prerequisites](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) |
| Three compute platforms and the nature of Lambda deployments | The platforms are EC2/On-Premises · AWS Lambda · **Amazon ECS.** **Lambda and ECS deployments cannot use in-place deployment and are all blue/green.** Plus the rollback advantage of blue/green, the AppSpec file and CodeDeploy agent, and zonal configuration being exclusive to EC2 in-place deployments | [CodeDeploy primary components](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html) |
| Local invocation cautions and the Docker dependency | `sam local invoke` **builds and invokes the function in a local container using Docker.** Logs go to stderr and results to stdout. It mounts `.aws-sam/build/<function>` at `/var/task` in the container. The documentation **advises against using it with untrusted code** | [Introduction to testing with sam local invoke](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html) |
| Configuration management as a DevOps practice | The `What is DevOps?` page presents **configuration management** alongside infrastructure as code as an infrastructure automation practice. It is absent from the six-item list on courseware slide 9 | [What is DevOps?](https://aws.amazon.com/devops/what-is-devops/) |
| IaC tool comparison and SAM use scenarios | SAM instead of CloudFormation (template compatibility plus serverless simplification), SAM instead of the AWS CDK (declarative), and **using both together**(complementing the CDK with SAM CLI local testing). Scenarios are serverless applications · **augmenting CloudFormation** · local development and testing · serverless CI/CD · **migration** | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| Required and optional template sections plus parameter precedence | **Only `Transform` and `Resources` are required.** Section order is free, but `AWS::LanguageExtensions` must precede the serverless transform. `--parameter-overrides` and configuration file entries **take precedence over template entries** | [AWS SAM template anatomy](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html) |
| `AWS::Serverless::Function` defaults and container images | `Timeout` 3 seconds, `Architectures` `x86_64`, `PackageType` `Zip`(requiring `CodeUri` or `InlineCode`). With `PackageType: Image`, **only `ImageUri` applies** and `Runtime`, `CodeUri`, and `InlineCode` are ignored. Setting `Runtime` to `provided` builds a custom runtime | [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) |
| `sam build` options and output locations | `--build-in-source`(Node.js runtimes plus Makefile and esbuild, incompatible with `--use-container`) · `--parallel` · `--cached`(`.aws-sam/cache`) · `--exclude` · `--hook-name terraform` and others. Output goes to `.aws-sam/build` and the built template to `.aws-sam/build/template.yaml`. **`sam deploy` deploys that directory** | [sam build](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html) |

### 11.5 Items We Could Not Verify

Recorded honestly. Check these before stating them definitively in class.

| Item | Status |
|---|---|
| Whether AWS CodeCommit is closed to new customers | We tried the developer guide, the FAQ, and documentation search, but **found no notice that it is closed to new customers.** We did not fill this in by guessing. Note that CodeCommit **does not appear** in the tool list on courseware slide 10 ([Section 3.4](#34-no-source-repository-in-the-list)) |
| Current definitions of AWS CodeArtifact · AWS Config · AWS X-Ray · Amazon CloudWatch | **We did not consult the documentation for each service** to compare against the one-line descriptions on slide 10. In the table in [Section 3.2](#32-aws-tools-for-devops) these four appear as courseware wording only |
| The six DevOps benefits on slide 8 | The reference page responded, but **the body we retrieved did not include the benefits section**, so we did not use it as evidence. The table in [Section 2.4](#24-why-adopt-devops) is the courseware wording as-is |
| A standalone definition page for infrastructure as code (IaC) | We verified only the mention on the `What is DevOps?` page. **We did not consult a page that defines IaC on its own** ([Section 3.1](#31-infrastructure-as-code)) |
| The exact default name of the template file `sam init` creates | We verified only the default names the CLI **looks for** — `template.yaml`, `template.yml`, `template.json`. The name `sam init` **creates** could not be verified ([Section 5.8](#58-template-file-names-and-relative-paths)) |
| The `sam init` project directory structure | We could not verify the **directory structure of the generated output** against the `events` / `hello_world` / `Tests` tree on slide 21. We verified only the creation **summary**(Name · Architectures · Dependency Manager · Configuration file and so on) ([Section 8.4](#84-sam-init)) |
| The minimum list of IAM permissions the SAM CLI needs | We verified only that the prerequisites are **"IAM credentials and an IAM access key pair."** Which permissions which operations need was not consulted ([Section 8.1](#81-prerequisites)) |
| The full list of services `sam local generate-event` supports | The documentation example is **cut off with an ellipsis**, so we could not verify the full list. We verified `alb` · `alexa-skills-kit` · `alexa-smart-home` · `apigateway` · `appsync` · `batch` · `cloudformation` ([Section 8.8](#88-sam-local-generate-event)) |
| CloudFormation `DeletionPolicy` and stack policies | We verified change sets and rollback options but **did not consult these two.** If you need resource-level protection, check them directly ([Section 9.5](#95-change-sets-and-rollback)) |
| AWS SAM and CloudFormation service quotas | **Not consulted.** The only figure verified in this document is the 51,200-byte condition for templates and artifacts |
| The official AWS definition of continuous deployment | The CodePipeline documentation we consulted **defines only continuous integration and continuous delivery**, so we could not verify slide 7's statement that "continuous deployment (CD) is a fully automated pipeline from build to production deployment" ([Section 2.3](#23-the-three-devops-processes)) |
| The full list of AWS toolkits for IDEs | We verified **only AWS Toolkit for VS Code** from the SAM prerequisites. The explanation for knowledge check question 5 on slide 30 cites "various AWS toolkits," but we could not verify that list ([Section 8.1](#81-prerequisites)) |
