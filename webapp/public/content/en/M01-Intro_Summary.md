# Module 1: Course Overview

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Recommended Prerequisites](#2-recommended-prerequisites)
3. [The Application You Build: Pollynotes](#3-the-application-you-build-pollynotes)
4. [Three-Day Agenda](#4-three-day-agenda)
5. [Classroom Logistics](#5-classroom-logistics)
6. [Accessing the Labs and Guides](#6-accessing-the-labs-and-guides)
7. [Lab Requirements](#7-lab-requirements)
8. [Changes from the Courseware](#8-changes-from-the-courseware)
9. [Knowledge Check and Summary](#9-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Items where the courseware contradicts itself are not something AWS documentation can settle. Those are flagged in the body without 🆕 or 🔄 and collected in [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts).
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

This module is not a technical module. It is a **course administration module**. It covers what you will learn (course objectives), what you should already know (recommended prerequisites), how the three days are sequenced (the agenda), and how to reach the lab environment and the guides. This document is therefore short. A module like this has very few verifiable facts to begin with.

### Course Objectives

The three items from courseware slide 4, carried over as written.

| # | Objective |
|---|---|
| 1 | Configure IAM permissions to support a development environment |
| 2 | Design, diagram, build, and deploy a cloud-native application using the AWS SDKs |
| 3 | Monitor and maintain an application using AWS resources |

This module has **no separate module objectives slide.** Unlike the other module decks, the *course* objectives on slide 4 play that role.

### Where the Module Title Comes From

Slide 1 carries only `Developing on AWS (Korean)` and no module title. The module title comes from the **subtitle on slide 2**, `Module 1: Course Overview`. The agenda instructor notes on slide 7 call the same module `Module 1 - Course Introduction`, so the name appears two ways inside the courseware. This document follows slide 2 (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### How This Document Is Organized

| Slides | Content | In this document |
|---|---|---|
| 4 | Course objectives | Section 1 |
| 5 | Recommended prerequisites | [Section 2](#2-recommended-prerequisites) |
| 6 | Course overview — the Pollynotes architecture | [Section 3](#3-the-application-you-build-pollynotes) |
| 7–12 | Day 1–3 agenda (morning and afternoon) | [Section 4](#4-three-day-agenda) |
| 13–15 | Logistics, virtual classroom logistics, introductions | [Section 5](#5-classroom-logistics) |
| 16–19 | How to access the course labs and guides | [Section 6](#6-accessing-the-labs-and-guides) |
| 20 | Lab requirements | [Section 7](#7-lab-requirements) |
| 1–3, 21 | Title, instructor intro, thank you | (layout only. Nothing to carry over) |

### What This Deck Does Not Have

| Item | Detail |
|---|---|
| Knowledge check questions | Unlike the other module decks, there is no true/false question slide. [Section 9](#9-knowledge-check-and-summary) therefore carries only supplementary questions about the updated content, not courseware questions |
| Code | There is not a single line of source text to move into a code block. This document has no code either |
| Module objectives slide | As noted above, the course objectives on slide 4 play that role |

---

## 2. Recommended Prerequisites

The content of slide 5. There are no instructor notes.

| Category | Content |
|---|---|
| Prerequisite course | Complete AWS Cloud Practitioner Essentials |
| Prerequisite course | Complete AWS Technical Essentials |
| Languages | Working knowledge of a top-tier programming language — Python, .NET, Java |

The introductions question on slide 15 asks the same thing as `Java, Python, C#`. `.NET` is a platform name and `C#` is a language on that platform, so the two lists are drawn on different axes. Because this feeds directly into the lab IDE and SDK choice, it is worth settling which axis you ask about at the start of class (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### 2.1 Where the Two Prerequisite Courses Are Now 🔄

Both courses still exist under those names. What changed is **how you reach them** and **the structure of AWS Cloud Practitioner Essentials**.

| Course | What we verified |
|---|---|
| AWS Cloud Practitioner Essentials | Recently updated and now organized as **13 modules** centered on cloud concepts (Module 1 Introduction to the Cloud through Module 13 Well-Architected Solutions). New lessons cover AI, machine learning, and data analytics, and the update added instructor demos in the AWS Management Console plus "Cloud in Real Life" segments. It is taken on AWS Skill Builder and is also available on Coursera and edX |
| AWS Technical Essentials | Covers the fundamental concepts of compute, database, storage, networking, monitoring, and security. The classroom course is one day and includes six labs in a live AWS environment; the self-paced digital course is four hours. Note that the blog post we verified this from was **published in June 2021**, so it does not guarantee the course structure as of today |

> — Source: [Step into the cloud: The new AWS Cloud Practitioner Essentials is here!](https://aws.amazon.com/blogs/training-and-certification/new-aws-cloud-practitioner-essentials/)

> — Source: [Propel your technical career with AWS Technical Essentials course](https://aws.amazon.com/blogs/training-and-certification/propel-your-technical-career-with-aws-technical-essentials-course/)

**Where the course pages live.** The classroom course pages on `aws.amazon.com` now **move you to AWS Skill Builder.** [AWS Cloud Practitioner Essentials](https://aws.amazon.com/training/classroom/aws-cloud-practitioner-essentials/) · [AWS Technical Essentials](https://aws.amazon.com/training/classroom/aws-technical-essentials/) · [Developing on AWS](https://aws.amazon.com/training/classroom/developing-on-aws/) all answer with HTTP 200, but the request is redirected to the course page on Skill Builder. We verified the response code and the redirect target, and no further: these pages are client-rendered, so we could not read their body (see [Section 8.5](#85-items-we-could-not-verify)).

---

## 3. The Application You Build: Pollynotes

### 3.1 Application Overview

Summarized from the instructor notes on slide 6.

| Item | Content |
|---|---|
| Name | **Pollynotes** |
| Nature | A fully working web application. It uses many AWS services so that **authenticated users** can create, store, and manage text notes |
| Signature feature | Plays back a **spoken version** of a selected note in a selected voice mode |
| How you build it | As a developer, you build it with the **AWS SDKs in an integrated development environment (IDE)** |
| What you learn | Hosting a static website, implementing business logic, managing APIs, controlling access to the application, and storing and processing user data |

### 3.2 Elements in the Diagram

Slides 6 and 12 use the same architecture drawing. These are the elements pulled from the text boxes in that drawing.

| Category | Elements |
|---|---|
| Actor | End user |
| Paths | Website hosting / MP3 hosting / Application API calls |
| Note operations | List / Search / Delete / Create/Update |
| Voice | Dictate |
| Boundary | AWS Cloud |
| Service labels | DynamoDB, AWS Identity and Access Management (IAM), Amazon Cognito, Amazon APIGateway, Amazon Polly, AWS X-Ray, AWS Serverless Application Model (AWS SAM), Amazon CloudWatch |

Among the service labels, `Amazon APIGateway` is missing a space. The correct name is `Amazon API Gateway`, and the diagrams on slides 10 and 11 of the same courseware spell it correctly (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### 3.3 Current Naming of the Services in the Architecture 🆕

We checked every service that appears in the courseware diagrams (slides 6, 7, and 12) against current official documentation, one at a time. **No service has been renamed, and none has reached end of support.** Three of them have moved in the documentation (see [Section 3.4](#34-three-things-that-changed-since-the-courseware)).

| Service | What the current documentation says | Source |
|---|---|---|
| Amazon Simple Storage Service (Amazon S3) | Object storage service offering scalability, data availability, security, and performance. Provides storage classes for different use cases | [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| Amazon DynamoDB | A **serverless, fully managed, distributed NoSQL** database with single-digit millisecond performance at any scale | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| AWS Identity and Access Management (IAM) | A web service that helps you securely control access to AWS resources. The documented abbreviation is `IAM` | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| AWS Security Token Service (AWS STS) | Creates a new session with **temporary security credentials** that include an access key pair and a session token. Session permissions are the intersection of the role's policies and the session policies | [Request temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html) |
| Amazon Cognito | An **identity platform** for web and mobile apps. Made up of user pools (authentication and authorization) and identity pools (temporary credentials for AWS resource access); each works independently of the other | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| Amazon API Gateway | A service for creating, publishing, maintaining, monitoring, and securing **REST, HTTP, and WebSocket APIs** at any scale | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| AWS Lambda | A serverless compute service that runs code without provisioning or managing servers. The documentation presents two compute primitives, **Lambda Functions** and **Lambda MicroVMs** | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| Amazon Polly | A cloud service that converts text into lifelike speech. You pay only for the text you synthesize, and caching and replaying generated speech costs nothing extra | [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html) |
| AWS X-Ray | Request tracing. The console is either the **Amazon CloudWatch console** or the X-Ray console, and the documentation states that AWS is no longer developing the X-Ray console | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Amazon CloudWatch | Monitors AWS resources and applications in real time. Metrics, alarms, and dashboards, APM, infrastructure monitoring, logs, and OpenTelemetry support | [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html) |
| AWS Serverless Application Model (AWS SAM) | An **open-source framework** for building serverless applications with infrastructure as code. Made up of the AWS SAM CLI and the AWS SAM template, an extension of CloudFormation | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| AWS CloudFormation | Models and provisions AWS resources from templates. The documentation body uses `CloudFormation` without the prefix | [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |
| AWS Command Line Interface (AWS CLI) | An **open source tool** for interacting with AWS services from a command-line shell. Version 2 is the most recent major version, and some of its features are not backported to version 1 | [What is the AWS Command Line Interface?](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) |

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.4 Three Things That Changed Since the Courseware 🔄

| Item | Courseware | Current | Source |
|---|---|---|---|
| Voice mode | The slide 6 instructor notes say only "a selected voice mode" and offer no choices | Amazon Polly has four voice engines: **Generative, Long-form, Neural, and Standard.** Generative and Long-form were added after the courseware. You select an engine and a speech synthesis API operation, then provide input text and an audio output format | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |
| The AWS X-Ray console | Slides 6 and 12 present X-Ray and CloudWatch as separate services sitting side by side | The documentation states that **"AWS is no longer developing the X-Ray console."** The X-Ray Service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map** inside the CloudWatch console, and X-Ray Insights is included under Insights in the CloudWatch console. CloudWatch **Application Signals** was added for service-level observability. X-Ray itself has not been discontinued: **the screen path changed** | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| The scope of AWS Lambda | Slides 9–11 treat Lambda purely as the concept of a function | The documentation presents two compute primitives for different workload patterns: **Lambda Functions** (run in response to events or API calls, each invocation independent) and **Lambda MicroVMs** (near-instant startup, state retained for up to 8 hours). The labs in this course use the Lambda Functions path | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |

> — Source: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

---

## 4. Three-Day Agenda

Slides 7 through 12. Each slide puts the module and lab boxes on the left and the piece of the architecture covered in that half day on the right. The **learning objective** column below comes from the instructor notes on the same slide.

### 4.1 Day 1 Morning (Slide 7)

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Module 1 | Course Overview | Course introduction |
| Module 2 | Building Web Applications on AWS | Review the details of the AWS architecture used to create a complete cloud-native application |
| Module 3 | Getting Started with Development on AWS | Explore the benefits of the AWS software development kits (AWS SDKs) when building applications |
| Module 4 | Getting Started with Permissions | Configure a development environment that supports AWS Identity and Access Management (IAM) permissions |
| Lab 1 | Configure a Development Environment | Configure and test IAM permissions in a development environment |

Diagram fragment: you → EC2 instance contents inside the AWS Cloud (integrated development environment (IDE), AWS tools and SDKs, AWS Command Line Interface (AWS CLI)), Amazon Simple Storage Service (Amazon S3), IAM, IAM role, AWS Security Token Service (AWS STS), AWS CloudFormation.

**Lab connectivity and the IDE.** The instructor notes say there are **three IDEs** in the labs and that learners can choose one based on preference or programming language (the IDE names are not given). The connection method is inconsistent between the slide box and the instructor notes: the box says `Guacamole or Remote Desktop` (two options) and the notes say `Guacamole, Remote Desktop, or a browser-based option` (three options). Apache Guacamole is not covered by documentation on an AWS-operated domain, and lab connectivity is a course-operations matter, so this document cannot settle it (see [Section 8.5](#85-items-we-could-not-verify)).

Also, the instructor notes on this slide are in Korean except for **one line, the lab 1 description**, which is in English (`실습 1 – Configure and test IAM permissions in a development environment.`). The table above carries it in the document language (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### 4.2 Day 1 Afternoon (Slide 8)

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Module 5 | Getting Started with Storage | Compare the feature sets and use cases of the available AWS storage solutions |
| Module 6 | Processing Your Storage Operations | Deploy a static website to Amazon Simple Storage Service (Amazon S3) |
| Lab 2 | Developing Solutions with Amazon S3 | (The notes say "Identify the AWS solutions that fit a big data application workload," which does not match the box title) |

Diagram fragment: developer → AWS software development kit (AWS SDK) → Amazon S3 (two, Notes) inside the AWS Cloud.

Lab 2 is the only lab whose box title and instructor note point at different labs. The diagram on the same slide draws developer → AWS SDK → Amazon S3, which lines up with **the box title** as the lab for this half day. The other labs (3, 4, and 6) have matching titles and notes (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### 4.3 Day 2 Morning (Slide 9)

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Module 7 | Getting Started with Databases | Compare the feature sets and use cases of the available AWS database options, and configure an Amazon DynamoDB database to store data for the web application |
| Module 8 | Processing Your Database Operations | Perform create, read, update, and delete (CRUD) operations with the DynamoDB SDK, and explore database caching options |
| Lab 3 | Developing Solutions with Amazon DynamoDB | Configure a DynamoDB database to store data for the web application |
| Module 9 | Processing Your Application Logic | Compare the feature sets and use cases of the available AWS compute solutions. Build an AWS Lambda function to store the web application's data in DynamoDB |

Diagram fragment: DynamoDB inside the AWS Cloud — Notes table and global secondary index, data query and access.

### 4.4 Day 2 Afternoon (Slide 10)

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Lab 4 | Developing Solutions with AWS Lambda | Build an AWS Lambda function to store the web application's data in DynamoDB |
| Module 10 | Managing the APIs | Explore the ways Amazon API Gateway can be used to connect to AWS resources |
| Lab 5 | Developing Solutions with Amazon API Gateway | Use Amazon API Gateway to connect to Lambda and DynamoDB |

Diagram fragment: developer → Amazon Polly, Amazon S3 (two) / developer → API Gateway → AWS Lambda → DynamoDB table.

### 4.5 Day 3 Morning (Slide 11)

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Module 11 | Building Modern Applications | Evaluate the benefits of building a web application with a serverless approach |
| Module 12 | Granting Access to Your Application Users | Review how Amazon Cognito controls user access to AWS resources |
| Lab 6 | Capstone: Complete the Application Build | Create an Amazon Cognito solution that gives users access to the web application |
| Module 13 | Deploying Your Application | Deploy the application |

Diagram fragment: users → Amazon Cognito → API Gateway inside the AWS Cloud → Lambda function → DynamoDB, S3 bucket, developer.

**The module titles differ from the individual decks.** The agenda box reads `현대적 애플리케이션 구축` while the M11 deck title page reads `모던 애플리케이션(Modern Application) 구축`, and the box reads `애플리케이션 사용자에게 액세스 권한 부여` while the M12 deck title page reads `내 애플리케이션의 사용자에게 액세스 권한 부여하기`. Learners notice this the moment they compare the agenda with a module title page (see [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts)).

### 4.6 Day 3 Afternoon (Slide 12) 🔄

| Item | Title | Learning objective from the instructor notes |
|---|---|---|
| Module 14 | Observing Your Application | Identify the AWS services that support monitoring a web application |
| Lab 7 | Observing Your Application with AWS X-Ray | Deploy, monitor, and maintain the web application using AWS resources |
| Module 15 | Course Wrap-Up | Course summary |

Diagram fragment: the same set of labels as the full Pollynotes architecture on slide 6.

**The screen path for lab 7 may differ from the courseware.** The documentation states that AWS is no longer developing the X-Ray console, and that the X-Ray Service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map in the Amazon CloudWatch console**. You open it from the CloudWatch console's left navigation pane under `X-Ray traces` → `Trace Map`. Details are in [Section 3.4](#34-three-things-that-changed-since-the-courseware).

> — Source: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 5. Classroom Logistics

Slides 13 through 15. This is about running the class, so there are no facts here to verify against AWS documentation. Carried over as written.

### 5.1 In-Person Logistics (Slide 13)

| Category | Item |
|---|---|
| Facility | Emergency exits / fire alarm protocol / security |
| Schedule | Breaks and lunch |
| Other | Food / mobile phones |

### 5.2 Virtual Classroom Logistics (Slide 14)

| Category | Item |
|---|---|
| Schedule | Breaks and lunch |
| Communication | Chat / mute and unmute / camera |

### 5.3 Introductions (Slide 15)

Instructor notes: introductions help you understand each learner's proficiency level and what each of them wants to get out of the class.

| # | Question |
|---|---|
| 1 | Your name |
| 2 | What do you do? |
| 3 | What do you want to get out of this class? |
| 4 | What is your AWS proficiency? |
| 5 | Which language would you choose: Java, Python, or C#? |
| 6 | What was your most recent purchase on Amazon.com? |

The language list in question 5 is drawn on a different axis than slide 5 (`Python / .NET / Java`) — see [Section 2](#2-recommended-prerequisites).

---

## 6. Accessing the Labs and Guides

Slides 16 through 19. Slide 16 is a section divider (`How to access the course labs and guides` with the subtitle `AWS Builder Labs instructions`).

### 6.1 Registration (Slide 17)

The slide body is two lines. **You must register for AWS Builder Labs, and the registration information is in the welcome email.**

Summarizing the learner-facing instructor notes, the procedure is this.

| Step | Content |
|---|---|
| 1 | Check your inbox for the **welcome email** from your instructor |
| 2 | Find the **unique learner registration URL** for this class in that email |
| 3 | Use that URL to create an account or sign in to an existing AWS Builder Labs account |
| 4 | Access the lab environment, the lab guide, and the learner guide in AWS Builder Labs |

The instructor-facing notes add the following.

| Item | Content |
|---|---|
| Welcome email | The instructor must send a welcome email before class starts and include the unique learner registration URL that AWS Builder Labs generated for the class |
| Recommended account creation | If learners create their AWS Builder Labs account with an **Amazon Retail or Partner Central sign-in**, the license code is applied automatically. This method is strongly recommended |
| License code | If learners reach their Bookshelf account through the AWS Builder Labs dashboard using the unique learner registration link, there is **no need to purchase a license code from Gilmore** |
| FAQ and concurrent lab limits | The notes point to the FAQ and Resources section of the `Instructor Enablement: AWS Builder Labs` guide on AWS Skill Builder. The address printed in the courseware is `https://explore.skillbuilder.aws/learn/course/internal/view/elearning/12814/instructor-enablement-aws-builder-labs` |

That Skill Builder address in the courseware is an **instructor-only internal path**. We could not verify its contents for this document (see [Section 8.5](#85-items-we-could-not-verify)).

### 6.2 Where the Guides Live (Slide 18)

The slide has no body text, only graphics. Summarized from the instructor notes.

| Item | Content |
|---|---|
| Instructor demo | Sign in to the **instructor management view** on the AWS Builder Labs class details page, then switch to **Student View** to demonstrate how to reach the guides |
| Preloading | If the learner labs are **not preloaded, the labs show as unavailable** |
| Button location | The lab guide and learner guide buttons are in the **upper right** of the AWS Builder Labs dashboard, and they are greyed out and disabled before the class starts |
| Guide store | The guides live in **eVantage Bookshelf (VitalSource)**. Clicking the link prompts learners to sign in to an existing account or choose `Create an account` |
| How to use them | The guides can be accessed online or downloaded |

### 6.3 Guide Distribution (Slide 19)

| Item | Content |
|---|---|
| Distribution path | The course participant guides are provided through the **eVantage Bookshelf (VitalSource)** application |
| Procedure | Go to eVantage Bookshelf (VitalSource) → create an account or sign in to an existing one → use the code your instructor provided to reach the guides for the class |
| Address | The slide lists `https://evantage.gilmoreglobal.com/` as the participant guide address, with "get the code from your instructor" |
| Guide composition | A class without labs has only the learner guide; a class with labs has both the learner guide and the lab guide |

An **important note** from the instructor-facing notes: the content of this slide applies only to a class without labs, or when learners sign in to an existing eVantage Bookshelf (VitalSource) account rather than going through the unique URL in the AWS Builder Labs portal first. **For courses that include labs, direct learners to the registration URL in the welcome email.** The instructor purchases license codes through Gilmore and sends learners a download code.

eVantage Bookshelf (VitalSource) and Gilmore Global are not AWS-operated domains, so they are not on this document's list of citable sources. The content above is therefore carried over **exactly as the courseware states it**, with no source attached (see [Section 8.5](#85-items-we-could-not-verify)).

### 6.4 Where AWS Builder Labs Sits Now 🔄

The path to the class labs (unique registration URL in the welcome email → AWS Builder Labs dashboard) is the same as in the courseware. What changed is **where AWS presents AWS Builder Labs**.

| Item | What we verified |
|---|---|
| Where it is presented | AWS Builder Labs is presented as one of the **immersive learning** experiences in AWS Skill Builder. Requesting `aws.amazon.com/training/digital/aws-builder-labs/` takes you to the immersive learning page |
| Scale | More than **200** guided, interactive labs in AWS Console environments with step-by-step instructions for learning AWS services |
| Not in the courseware | An **AI-powered Learning Assistant** that answers queries and explains code within the lab's context |
| Other experiences on the same page | AWS Cloud Quest, AWS SimuLearn, AWS Industry Quest, Lab Maker, AWS Jam, Microcredentials |
| Free learning plan | The `Introduction to AWS Cloud – AWS Builder Labs` learning plan offers 10 foundational labs for free (Amazon VPC, Amazon S3, Amazon EC2, AWS IAM, AWS KMS, a basic environment audit, Amazon DynamoDB, Amazon CloudFront, AWS Lambda, Amazon API Gateway) |

> — Source: [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/)

> — Source: [Begin your AWS journey with new free AWS Builder Labs learning plan on AWS Skill Builder](https://aws.amazon.com/blogs/training-and-certification/begin-your-aws-journey-with-new-free-aws-builder-labs-learning-plan-on-aws-skill-builder/)

---

## 7. Lab Requirements

Slide 20. There are no instructor notes.

| Category | Requirement |
|---|---|
| Operating system | Windows / macOS / Linux: Ubuntu, SUSE, or Red Hat |
| Recommended web browsers | Google Chrome / Mozilla Firefox / Microsoft Edge |
| Network | A reliable internet connection able to browse the internet over HTTPS |
| AWS Builder Labs registration | Disable ad and script blocking |

This list is **course-operations logistics.** It is not a supported-operating-system or supported-browser requirement for a particular AWS service; it is a condition for reaching the lab environment, so it is not the kind of fact AWS official documentation verifies. It is carried over as written, with no source attached (see [Section 8.5](#85-items-we-could-not-verify)).

---

## 8. Changes from the Courseware

Items in the courseware (the instructor deck) that differ from current reality. Learners have the official courseware in front of them, so we leave a record of what we changed and why.

M01 is a course administration module, so this section is thin. We found **no end-of-support items in this module.** What we did find are six places where the courseware contradicts itself. Those are not something AWS documentation can settle, so their source column is empty and they are carried into [Section 8.5](#85-items-we-could-not-verify).

### 8.1 Courseware Statements That Do Not Match the Facts

| Item | What the courseware says | What we verified | Source |
|---|---|---|---|
| `Amazon APIGateway` (slide 6 and 12 diagrams) | Written as one word, with no space | The documented name is **`Amazon API Gateway`.** The slide 10 and 11 diagrams and the instructor notes of the same courseware spell it correctly, so the courseware is inconsistent with itself | [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| The IAM abbreviation (slide 7 instructor notes) | `AWS Identity and Access Management (AWS IAM)` | The documented abbreviation is **`IAM`.** The slide 6 and 7 diagrams write `(IAM)` correctly; only the slide 7 instructor notes write `(AWS IAM)` | [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) |
| The module name | Slide 2 subtitle `Module 1: Course Overview` vs slide 7 instructor notes `Module 1 - Course Introduction` | Which one is right is not something documentation can settle; it is an internal courseware inconsistency. This document follows slide 2 | — (see [Section 8.5](#85-items-we-could-not-verify)) |
| The lab 1 description (slide 7 instructor notes) | Only this one line is in English within otherwise Korean notes (`Configure and test IAM permissions in a development environment.`) | This looks like a missed translation. The table in [Section 4.1](#41-day-1-morning-slide-7) carries it in the document language | — (see [Section 8.5](#85-items-we-could-not-verify)) |
| Lab 2 (slide 8) | The box title is `Developing Solutions with Amazon S3`; the instructor notes on the same slide say `Identify the AWS solutions that fit a big data application workload` | The two point at different labs. The diagram on the same slide draws developer → AWS SDK → Amazon S3, which matches **the box title.** The other labs (3, 4, and 6) have matching titles and notes | — (see [Section 8.5](#85-items-we-could-not-verify)) |
| Agenda module titles (slide 11) | `현대적 애플리케이션 구축` / `애플리케이션 사용자에게 액세스 권한 부여` | The individual deck title pages read `모던 애플리케이션(Modern Application) 구축` / `내 애플리케이션의 사용자에게 액세스 권한 부여하기`. It is an internal courseware inconsistency that surfaces when you compare the agenda with a module title page | — (see [Section 8.5](#85-items-we-could-not-verify)) |
| Lab connectivity (slide 7) | The box says `Guacamole or Remote Desktop` (two); the instructor notes say `Guacamole, Remote Desktop, or a browser-based option` (three) | The count differs within a single slide. This is a lab-operations matter, and Guacamole is not covered by documentation on an AWS-operated domain, so we cannot establish which is current | — (see [Section 8.5](#85-items-we-could-not-verify)) |
| The language list | Slide 5 says `Python / .NET / Java`; slide 15 says `Java, Python, C#` | `.NET` is a platform and `C#` is a language on it, so the lists are drawn on different axes. This feeds directly into the lab IDE and SDK choice | — (see [Section 8.5](#85-items-we-could-not-verify)) |

### 8.2 Changed Behavior and Defaults

| Item | What the courseware says | Current | Source |
|---|---|---|---|
| Voice mode | "Plays back a spoken version of a selected note in a selected voice mode" (no choices given) | Amazon Polly has four voice engines: **Generative, Long-form, Neural, and Standard.** Generative and Long-form were added after the courseware | [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html) |
| The scope of AWS Lambda | Presents Lambda as the concept of a function | The documentation presents two compute primitives, **Lambda Functions** and **Lambda MicroVMs.** The labs in this course use the Lambda Functions path | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| Where the prerequisite course pages live | Gives course names only | `aws.amazon.com/training/classroom/<course>/` answers with HTTP 200 but **redirects to AWS Skill Builder.** AWS Cloud Practitioner Essentials has been reorganized into **13 modules** and is offered on AWS Skill Builder, Coursera, and edX | [Step into the cloud: The new AWS Cloud Practitioner Essentials is here!](https://aws.amazon.com/blogs/training-and-certification/new-aws-cloud-practitioner-essentials/) |
| Where AWS Builder Labs is presented | Presents it purely as the class lab portal | It is presented as one of the **immersive learning** experiences in AWS Skill Builder, alongside more than 200 labs and an **AI-powered Learning Assistant.** The path to the class labs itself is unchanged | [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/) |
| The AWS CloudFormation name | `AWS CloudFormation` | The current documentation title and body use **`CloudFormation`** without the prefix. Both forms are in circulation, but this is what the documentation body uses | [What is CloudFormation?](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) |

### 8.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The AWS X-Ray console (slide 6 and 12 diagrams, lab 7) | **Discouraged.** The documentation states that "AWS is no longer developing the X-Ray console." The X-Ray service itself has not been discontinued | The **Amazon CloudWatch console**, under `X-Ray traces` → `Trace Map`. For service-level observability, CloudWatch **Application Signals**. X-Ray Insights is also included under Insights in the CloudWatch console | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |

There are no **end-of-support** items in this module.

### 8.4 Added After the Courseware

| Item | Summary | Source |
|---|---|---|
| Amazon Polly Generative and Long-form engines | The choices behind the courseware's "voice mode" have grown to four (Generative, Long-form, Neural, Standard). Neural TTS also supports a Newscaster speaking style for news narration | [What Is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html) |
| CloudWatch Application Signals | Discovers and monitors application services, clients, Synthetics canaries, and service dependencies, and lets you drill from SLO-based health metrics down to correlated X-Ray traces | [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Lambda MicroVMs | Isolated compute environments with near-instant startup that retain state for up to 8 hours, for workloads that need a dedicated compute environment per user or job | [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) |
| AWS SAM connectors and `sam sync` | Connectors that define permissions between resources in an AWS SAM template, `sam sync` for continuously syncing local changes to the cloud, and support for Terraform serverless applications | [What is the AWS Serverless Application Model (AWS SAM)?](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) |
| The AWS Builder Labs Learning Assistant | An AI-powered assistant that answers queries and explains code within the lab's context. The same page also presents Lab Maker, AWS SimuLearn, AWS Jam, and Microcredentials | [Immersive learning (AWS Skill Builder)](https://aws.amazon.com/training/digital/immersive-learning/) |
| The free AWS Builder Labs learning plan | The `Introduction to AWS Cloud – AWS Builder Labs` learning plan offers 10 foundational labs for free. A subscription unlocks the full catalog of 200 Builder Labs, 200 SimuLearns, and 17 Jam Journeys | [Begin your AWS journey with new free AWS Builder Labs learning plan on AWS Skill Builder](https://aws.amazon.com/blogs/training-and-certification/begin-your-aws-journey-with-new-free-aws-builder-labs-learning-plan-on-aws-skill-builder/) |

### 8.5 Items We Could Not Verify

Left here honestly. Check these before stating them as fact in class.

| Item | Status |
|---|---|
| The body content of the classroom course pages | We confirmed that all three course pages (`developing-on-aws`, `aws-technical-essentials`, `aws-cloud-practitioner-essentials`) answer with HTTP 200 and redirect to AWS Skill Builder. **The page bodies are client-rendered and this project's fetch tools could not read them.** We therefore did not cite values from inside those pages, such as course length, module structure, or the current prerequisite list |
| The current structure of AWS Technical Essentials | The one-day classroom course, six labs, and four-hour digital course are values from a **June 2021 blog post.** We could not confirm whether the structure changed after that. We separately confirmed only that the course page is still live |
| The `explore.skillbuilder.aws` instructor guide (slide 17 instructor notes) | The address printed in the courseware is an **instructor-only internal path.** A request does get a response, but Skill Builder reports that it could not find the path and hands off to a search page. On top of that, the Skill Builder domain is not on this project's list of citable domains, so it **cannot be used as a source.** Instructors must check the FAQ and concurrent lab limits themselves |
| eVantage Bookshelf (VitalSource) and Gilmore Global (slides 18–19) | The guides are distributed by a third party, not AWS. These are not citable domains, so the content is carried over **exactly as the courseware states it**, and we could not confirm whether the procedure and address are still the same |
| Apache Guacamole, Remote Desktop, and browser-based access (slide 7) | Lab connectivity is a course-operations matter, and Guacamole is not covered by documentation on an AWS-operated domain. **We could not determine** whether to resolve the difference between the slide box (two options) and the instructor notes (three options) in favor of either |
| The three IDEs offered in the labs (slide 7 instructor notes) | The notes say only that "there are three IDEs in the labs and learners can choose an IDE based on preference or programming language" and **do not name them.** We did not guess names that are absent from the source |
| The operating system and browser list in the lab requirements (slide 20) | This is not a supported list for a particular AWS service; it is a **condition for reaching the lab environment.** It is not the kind of fact AWS official documentation verifies, so it is carried over as written |
| The six internal courseware inconsistencies | The module name, the one English line in the lab 1 description, the lab 2 title versus description, the agenda module titles, the number of connection methods, and the axis of the language list. All of them are **internal courseware problems that external documentation cannot verify.** We only state which side we followed, in [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts) |
| The actual procedures for labs 1 through 7 | This deck carries only lab titles and one-line objectives. The procedures are in the lab guide and are out of scope for this document |

---

## 9. Knowledge Check and Summary

### Knowledge Check

**This deck has no knowledge check slide.** Unlike the other module decks, it carries no true/false questions, so there are no courseware questions to reproduce. Instead, we include only supplementary questions covering the updates above.

### 🆕 Supplementary Questions (Checking the Updated Content)

**Question 1**: Amazon Polly offers two voice engines to choose from, Neural and Standard.

- ❌ **Answer: False** — There are four: **Generative, Long-form, Neural, and Standard.** Generative and Long-form were added after the courseware. (See [Section 3.4](#34-three-things-that-changed-since-the-courseware))

> — Source: [Amazon Polly voice engines](https://docs.aws.amazon.com/polly/latest/dg/voice-engines-polly.html)

**Question 2**: To view application traces in lab 7 you must use the X-Ray console, and AWS continues to improve that console.

- ❌ **Answer: False** — The documentation states that **"AWS is no longer developing the X-Ray console."** The X-Ray Service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map in the Amazon CloudWatch console.** The X-Ray service has not been discontinued; the screen path changed. (See [Section 8.3](#83-discouraged-and-end-of-support-items))

> — Source: [Use a console (X-Ray)](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

**Question 3**: The prerequisite course AWS Cloud Practitioner Essentials has been renamed and no longer exists.

- ❌ **Answer: False** — It exists under the same name and has been reorganized into **13 modules** centered on cloud concepts. It is taken on AWS Skill Builder and is also offered on Coursera and edX. The classroom course address on `aws.amazon.com` moves you to Skill Builder. (See [Section 2.1](#21-where-the-two-prerequisite-courses-are-now))

> — Source: [Step into the cloud: The new AWS Cloud Practitioner Essentials is here!](https://aws.amazon.com/blogs/training-and-certification/new-aws-cloud-practitioner-essentials/)

### Summary

| # | Key point |
|---|---|
| 1 | There are three course objectives: **configure IAM permissions / design, build, and deploy a cloud-native application with the AWS SDKs / monitor and maintain it using AWS resources** |
| 2 | Over three days you build one application, **Pollynotes**, from start to finish. Each module attaches one piece of that application, and the same drawing on slides 6 and 12 ties the beginning to the end |
| 3 | **Not one** of the 13 services in the architecture has been renamed. What changed is where they sit: the X-Ray console is no longer being developed and moves into CloudWatch, Polly's voice engines have grown to four, and Lambda's documentation is now organized around two compute primitives |
| 4 | The lab environment and the guides start from the **unique learner registration URL in the welcome email.** That path is unchanged from the courseware. Going through it means there is no separate license code to purchase from Gilmore |
| 5 | There are six places where the courseware contradicts itself (the module name, the lab 1 description, the lab 2 title, the agenda module titles, the number of connection methods, and the language list). All are collected in [Section 8.1](#81-courseware-statements-that-do-not-match-the-facts). These are the points learners will ask about while comparing against the courseware |
