# Module 15: Course Wrap-up

## Developing on AWS

---

## Contents

1. [Course Objectives](#1-course-objectives)
2. [What This Course Covered](#2-what-this-course-covered)
3. [Additional Resources](#3-additional-resources)
4. [AWS Skill Builder](#4-aws-skill-builder)
5. [AWS Certification](#5-aws-certification)
6. [The Certification That Matches This Course](#6-the-certification-that-matches-this-course)
7. [The Four Exam Prep Steps](#7-the-four-exam-prep-steps)
8. [Registering and Sitting the Exam](#8-registering-and-sitting-the-exam)
9. [Changes from the Courseware](#9-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Chapter 9](#9-changes-from-the-courseware) for what changed and how.
> - Verified on: August 25, 2026. Training and certification programs change more often than technical documentation. **Before registering for an exam, always re-check the schedule at the linked original.**
> - This module is not technical content but a **guide to the training program**. That is why most of its sourcing lives on `aws.amazon.com` rather than `docs.aws.amazon.com`. This project only cites domains AWS operates directly.
> - **One fact goes first.** The certification exam that matches this course, **AWS Certified Developer – Associate, is being revised to DVA-C03.** The last day to take the current version, DVA-C02, is **November 30, 2026**, and DVA-C03 is delivered from December 1, 2026 ([Section 6.3](#63-the-exam-revision-schedule)).
> - Several URLs related to this course now redirect or have moved. Which one went where is tabulated in [Section 9.2](#92-changed-urls-and-names).

---

## 1. Course Objectives

### What You Learned in This Course

The three objectives of this course.

- Configure IAM permissions to support a development environment
- Design, diagram, build, and deploy cloud-native applications using AWS SDKs
- Monitor and maintain applications using AWS resources

### Three Lines Are Not Enough

Three lines are too short to represent 14 modules and 7 labs. A map you can use when you need to
explain "so what am I now able to do" is attached in
[Chapter 2](#2-what-this-course-covered).

---

## 2. What This Course Covered

This unfolds the course's three objectives at module granularity. The detail for each module
is in that module's document on this site.

### Fundamentals and Environment (Modules 1–3)

| Module | What you can now do |
|---|---|
| 1. Course Overview | Understand the scope of the course and the structure of the lab application |
| 2. Building a Web Application on AWS | Explain the components of a cloud-native application and the request flow |
| 3. Getting Started with Development | Install the SDKs and developer tools and set up credentials safely |

### Permissions (Module 4)

| Module | What you can now do |
|---|---|
| 4. Getting Started with Permissions | Read and write IAM policies and roles, and configure a development environment with least privilege |

This maps to course objective 1 (configure IAM permissions to support a development environment).

### Storage and Databases (Modules 5–8)

| Module | What you can now do |
|---|---|
| 5. Getting Started with Storage | Work with the Amazon S3 bucket and object model and its basic operations |
| 6. Processing Your Storage Application | Use the SDK against S3 and apply presigned URLs, encryption, and lifecycle rules |
| 7. Getting Started with Databases | Work with Amazon DynamoDB key design and its basic operations |
| 8. Processing Your Database Application | Use the SDK against DynamoDB and apply queries, scans, indexes, and transactions |

### Compute and APIs (Modules 9–11)

| Module | What you can now do |
|---|---|
| 9. Processing Your Compute Service | Create AWS Lambda functions and handle events, permissions, and configuration |
| 10. Refactoring with API Gateway | Create a REST API, wire it to Lambda, and manage stages |
| 11. Microservice Architecture | Separate services and reduce coupling with asynchronous, event-driven patterns |

### Access, Deployment, and Observability (Modules 12–14)

| Module | What you can now do |
|---|---|
| 12. Granting Access to Your Users | Configure authentication and authorization with Amazon Cognito and validate tokens |
| 13. Deploying Your Application | Write AWS SAM templates and apply build, deploy, and deployment strategies |
| 14. Observing Your Application | Collect metrics, logs, and traces with CloudWatch and X-Ray and find problems |

Module 13 maps to the "deploy" part of objective 2, and module 14 to objective 3 (monitor and
maintain).

### And What This Material Added

Every module document on this site has a **`N. Changes from the Courseware`** chapter. Because
the original training material is based on 2023, each module has 20 to 40 items that now differ,
collected so you can compare them while reading the official courseware alongside.

---

## 3. Additional Resources

### To Read

| Resource | Link |
|---|---|
| Serverless Architectures with AWS Lambda (whitepaper) | [PDF](https://d1.awsstatic.com/whitepapers/serverless-architectures-with-aws-lambda.pdf) |
| How AWS Pricing Works (whitepaper) 🔄 | [Document](https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/) |
| Back to Basics (video series) | [Page](https://aws.amazon.com/architecture/back-to-basics/) |
| AWS Support | [Page](https://aws.amazon.com/premiumsupport/) |
| AWS Ramp-Up Guides | [Page](https://aws.amazon.com/training/ramp-up-guides/) |
| Tech Talks 🔄 | [Page](https://aws.amazon.com/events/online-tech-talks/) |

The pricing whitepaper's older URL ends in `welcome.html`, which now redirects to the
directory path. Tech Talks now lives at the parent path rather than `/on-demand`
([Section 9.2](#92-changed-urls-and-names)).

> — Source: [How AWS Pricing Works](https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/)

> — Source: [Back to Basics](https://aws.amazon.com/architecture/back-to-basics/)

### Next Steps (Follow-on Courses)

Four follow-on courses after this one. Every registration path has moved to AWS Skill Builder
([Section 9.2](#92-changed-urls-and-names)).

| Course | Format | Current path |
|---|---|---|
| Advanced Developing on AWS | Classroom | [aws.amazon.com/training/classroom/advanced-developing-on-aws](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/) |
| Developing Serverless Solutions on AWS | Classroom | [aws.amazon.com/training/classroom/developing-serverless-solutions-on-aws](https://aws.amazon.com/training/classroom/developing-serverless-solutions-on-aws/) |
| Getting Started with DevOps on AWS | Digital | The earlier path is `www.aws.training/Details/eLearning?id=66768` |
| AWS Cloud Development Kit Primer | Digital | The earlier path is `www.aws.training/Details/Curriculum?id=64511` |

The earlier `www.aws.training/SessionSearch?...` URLs for the two classroom courses
are superseded by the paths above, and those paths in turn redirect to Skill Builder. The two
digital courses still respond at their `www.aws.training` paths, but that domain is not in this
project's sourcing allowlist, so it appears only as code. The surest way to find their current
location is to search by course name on
[AWS Skill Builder](https://aws.amazon.com/training/digital/).

> — Source: [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/)

### A New Follow-on Course 🆕

There is a new branch for a developer who has finished this course.

| Course | Content |
|---|---|
| Advanced Generative AI Development on AWS | Foundation model implementation, retrieval augmentation with Amazon Bedrock Knowledge Bases, agentic AI development with Bedrock AgentCore, and enterprise integration patterns. **Three-day hands-on format** |

This course pairs with the `AWS Certified Generative AI Developer – Professional` certification
covered later ([Section 5.4](#54-certifications-added-since)).

> — Source: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

---

## 4. AWS Skill Builder

### 4.1 What It Is

AWS's online learning center. It used to be described as "600-plus digital courses"; the scale is
different now.

| Item | Earlier value | Verified current value |
|---|---|---|
| Free self-paced digital courses | 600+ | **Over 900** |
| Free learning resources overall | (not mentioned) | **Over 1,000** |

> — Source: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

### 4.2 Three Ways to Learn 🔄

It used to be two branches, "free digital training" and "classroom training"; there are three now.

| Mode | Content | Availability |
|---|---|---|
| Digital Courses (self-paced) | Over 900 free self-paced courses covering every AWS service and skill level, with knowledge assessments | Free |
| Digital Classroom (self-paced) | Instructor-delivered videos, hands-on labs, comprehension checks, and course assessments for focused topic areas | **Individual Annual or Team subscription** |
| AWS Classroom Training (live) | AWS-accredited instructors teaching through presentations, discussions, and hands-on labs. Ask questions, work through solutions in real time, and get personalized feedback. In person or virtual, public or private sessions | Paid |

To access the full suite of immersive learning experiences you have to upgrade to a **Skill
Builder Individual or Team subscription**.

> — Source: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

### 4.3 Hands-on Practice and Showing Achievements 🆕

| Feature | Content |
|---|---|
| Practice environments | Practice in hands-on labs and immersive environments that mirror actual AWS scenarios |
| Skills Profile | Display your certifications, badges, and hands-on accomplishments in one professional profile. Amplify it on LinkedIn |

The page for **AWS Builder Labs** now redirects to
`aws.amazon.com/training/digital/immersive-learning/`
([Section 9.2](#92-changed-urls-and-names)).

> — Source: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

> — Source: [Immersive learning](https://aws.amazon.com/training/digital/immersive-learning/)

---

## 5. AWS Certification

### 5.1 The Four Levels

The four levels of AWS Certification.

| Level | Nature | Recommended experience |
|---|---|---|
| Foundational | Knowledge-based. AWS Cloud fundamentals | 6 months of foundational AWS Cloud experience and industry knowledge. **No prior experience is required** |
| Associate | Role-based. Demonstrates your knowledge and skills | 1 year of solving problems and implementing solutions with the AWS Cloud |
| Professional | Job-based. Validates advanced skills and knowledge | 2 years of designing, operating, and troubleshooting solutions with the AWS Cloud |
| Specialty | Focused on a specific topic | Technical experience in the domains specified in the exam guide. Recommended level varies |

Compared against verified values, these level descriptions hold up.

| Certification | Verified recommended experience |
|---|---|
| AWS Certified Cloud Practitioner (Foundational) | Assumes **up to 6 months** of exposure to the AWS Cloud, **but this is not required**. Aimed at newcomers who may not have an IT background and at line-of-business roles such as sales, marketing, product, and project management |
| AWS Certified Developer – Associate | **One or more years** of hands-on experience developing and maintaining applications using AWS services |
| AWS Certified DevOps Engineer – Professional | **2 or more years** of provisioning, operating, and managing AWS environments. Software development lifecycle and programming or scripting experience are also recommended |

> — Source: [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/)

> — Source: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

> — Source: [AWS Certified DevOps Engineer – Professional](https://aws.amazon.com/certification/certified-devops-engineer-professional/)

### 5.2 How to Determine an Exam's Scope

AWS states an important principle.

> AWS does not publish a list of every service or feature covered on a certification exam.
> However, each exam's exam guide lists the current topic areas and objectives covered on the exam.

So **the exam guide is the only official scope document.** The answer to "will this service be on
the exam" is the domains and task statements in the exam guide.

AWS also cautions:

> Exams are updated frequently, and details about which exams are offered and the test items on
> each exam are subject to change.

**That is exactly what happened.** The certification lineup has changed several times since
([Section 5.3](#53-certifications-retired-since),
[Section 5.4](#54-certifications-added-since)).

### 5.3 Certifications Retired Since 🔄

That earlier list is no longer current.

| Certification | Last day to take it | Replacement path |
|---|---|---|
| AWS Certified Data Analytics – Specialty | April 8, 2024 | AWS Certified Data Engineer – Associate |
| AWS Certified Database – Specialty | April 29, 2024 | — |
| AWS Certified: SAP on AWS – Specialty | April 29, 2024 | — |
| AWS Certified Machine Learning – Specialty | **March 31, 2026** | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional |

The reason AWS gave is **reducing the number of specialty certifications and enhancing the
offerings at the foundational, associate, and professional levels.**

Three things you have to know.

- **A certification you already earned stays.** It remains active for three years from the date you
  earned it and you can still display your Credly digital badge.
- **You cannot recertify.** The exams are no longer offered after the retirement dates.
- **The exam prep materials retired too.** That includes Official Practice Question Sets, Official
  Practice Exams, and the Exam Prep courses.

> — Source: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

> — Source: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

### 5.4 Certifications Added Since 🆕

| Certification | Level | Content |
|---|---|---|
| AWS Certified Data Engineer – Associate | Associate | Available to schedule and take from March 12, 2024. Validates skills and knowledge in core data-related AWS services |
| AWS Certified AI Practitioner | Foundational | Named as a replacement path in the ML Specialty retirement notice |
| AWS Certified Machine Learning Engineer – Associate | Associate | Validates technical ability in implementing and operationalizing ML workloads in production. **Being revised to MLA-C02** |
| AWS Certified Generative AI Developer – Professional | Professional | **The most direct next step for a developer.** Validates the ability to integrate foundation models into applications and business workflows |

Exam information for **AWS Certified Generative AI Developer – Professional**.

| Item | Value |
|---|---|
| Category | Professional |
| Exam duration | 180 minutes |
| Format | 75 questions, multiple choice or multiple response |
| Cost | 300 USD |
| Testing options | Pearson VUE testing center or online proctored exam |
| Languages offered | English, Japanese, **Korean**, Simplified Chinese |

Recommended experience is 2 or more years building production-grade applications on AWS or with
open-source technologies, general AI/ML or data engineering experience, and 1 year of hands-on
experience implementing generative AI solutions. The last day for the beta version was
March 31, 2026, and registration for the standard version is open.

> — Source: [AWS Certified Generative AI Developer – Professional](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)

> — Source: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

> — Source: [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/)

### 5.5 Microcredentials 🆕

Validation used to be certification only; there is one more now.

| Type | What it validates |
|---|---|
| Certification | Broad **technical knowledge and understanding** |
| Microcredential | The ability to **identify, troubleshoot, and implement** AWS solutions in AWS environments |

Microcredentials validate hands-on skills through **real-time assessment in a live AWS
environment**. Current topics are serverless, agentic AI, application networking, and incident
response, with more coming. **No AWS Skill Builder subscription is required.**

Earning both validates what you know and what you can do.

The one most relevant to developers is the **AWS Agentic AI Demonstrated** microcredential. In a
provisioned AWS environment it assesses your ability to:

- Implement AI solutions using AWS services
- Identify and troubleshoot issues in real-world scenarios
- Deploy and manage AI workloads in production environments

> — Source: [AWS Certification](https://aws.amazon.com/certification/)

> — Source: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

---

## 6. The Certification That Matches This Course

Knowing only the certification levels does not tell you **which exam to take**. It is the first
question students ask, so this chapter answers it.

### 6.1 AWS Certified Developer – Associate 🆕

This is the certification that matches this course.

| Item | Content |
|---|---|
| Recommended experience | Per the exam guide, **one or more years** of hands-on experience developing and maintaining applications using AWS services |
| Who is it for | An **ideal starting point on the AWS Certification journey** for people in IT or cloud developer job roles |
| If you have no IT experience | Earning AWS Certified Cloud Practitioner first to get foundational knowledge is beneficial |
| What you get | Increased credibility with technical colleagues and customers through an industry-recognized certification, and a strong start toward additional certifications in the Professional and Specialty categories |

**Certifications others have earned as a next step.**

| Certification | Which role it leads toward |
|---|---|
| AWS Certified SysOps Administrator – Associate | Cloud DevOps engineer, software development engineer |
| AWS Certified DevOps Engineer – Professional | The same direction. **Earning it automatically recertifies Developer – Associate** |
| AWS Certified Data Engineer – Associate | Toward machine learning engineer |

> — Source: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

### 6.2 Validity and Recertification 🆕

**The most important thing after you earn it.** Not knowing it means letting it expire.

| Item | Content |
|---|---|
| Validity | **3 years** |
| Renewal option 1 | Pass the latest version of the exam |
| Renewal option 2 | **Earn AWS Certified DevOps Engineer – Professional** and this Associate certification is recertified automatically |

Recertification splits into two forms and **the extension differs.**

| Form | Extension | Measured from |
|---|---|---|
| Renewal | **3 years** | The date you completed the exam |
| Maintenance | **1 year** | The date you completed the maintenance activities |

To use maintenance you need an **active certification within 90 days of expiration** and an
**active AWS Skill Builder subscription** (Monthly, Annual, or Team).

For reference, Cloud Practitioner has one more path. Completing the `AWS Cloud Quest: Recertify
Cloud Practitioner` game-based learning works. You become eligible within 6 months of expiration
and completing it extends validity by 3 years.

> — Source: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

> — Source: [AWS Recertification](https://aws.amazon.com/certification/recertification/)

> — Source: [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/)

### 6.3 The Exam Revision Schedule 🆕

**Exams are revised by code.** You need the schedule so that what you prepared for and what you sit
do not diverge.

| Date | What happens |
|---|---|
| October 27, 2026 | DVA-C03 **registration opens** (all languages) |
| November 30, 2026 | DVA-C02 **last day to take it** |
| December 1, 2026 | DVA-C03 **GA delivery begins** |

**DVA-C03 exam information.**

| Item | Value |
|---|---|
| Duration | 130 minutes |
| Questions | 65 (50 scored, **15 unscored**) |
| Cost | 150 USD |
| Passing score | **720** out of 1,000 |
| Languages | All currently supported languages at launch |
| Delivery | Pearson VUE (test center or online proctoring) |

**How to decide which one to take.**

| Choice | When |
|---|---|
| DVA-C02 (through November 30, 2026) | You are already prepared and want the certification now. Your credential remains active through its original expiration date |
| DVA-C03 (registration from October 27, 2026) | You want your certification to validate AI-assisted development skills and modern security practices for AI services |

> — Source: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

### 6.4 What Changes in DVA-C03 🆕

Particularly relevant if you have just finished this course. **The domain structure stays the
same** and what goes inside it changes.

| Domain | Weight |
|---|---|
| Development with AWS Services | 30% |
| Security | 26% |
| Testing and Deployment | 22% |
| Troubleshooting and Optimization | 22% |

**What is added.**

| Item | Content |
|---|---|
| New Task 2.3 — AI security (5 skills) | Access management for AI services, data privacy controls (VPC endpoints, ensuring inputs and outputs are not used to train AI models), content filtering and prompt injection protection, AI agent interaction security (tool-use authorization, session isolation, human-in-the-loop approval flows), and protecting sensitive content in monitoring logs |
| AI-assisted development (all domains) | Code generation and automated review (Domain 1), test automation and regression testing (Domain 3), CI/CD workflow support including automated deployment approvals (Domain 3), error analysis and troubleshooting suggestions (Domain 4), and performance optimization recommendations (Domain 4) |
| Container management | Building and managing container images with Amazon ECR and deploying containerized applications with Amazon ECS, Amazon EKS, and AWS Fargate |
| New in-scope services | Amazon Bedrock, Amazon Bedrock AgentCore, Amazon Q, Kiro, Amazon Data Firehose, AWS PrivateLink |

AWS puts it plainly. **AI-assisted development is now a core competency, not an optional add-on.**

**What is consolidated.** Topics from this course are in here.

| Topic | Consolidation |
|---|---|
| DynamoDB | 4 skills → **1** |
| Security (encryption and sensitive data) | 13 skills across 2 tasks → **7** in 1 task |
| Testing | 11 skills across 2 tasks → **5** in 1 task |
| Observability | 8 → **5** |
| Optimization | 9 → **6** |

**What is out of scope** is stated too: prompt engineering, RAG design, AI model selection,
Amazon SageMaker AI, and AI governance framework design. AI entering the exam does not mean it asks
you to design AI itself.

**Recommended experience** changes as well.

- 1 or more years of hands-on experience developing and maintaining applications using AWS services
- Proficiency in at least one high-level programming language
- **Experience using AI-assisted development tools and workflows**
- Understanding of application lifecycle management and CI/CD pipelines

> — Source: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

### 6.5 Exam Fee Discount 🆕

**Once you earn one AWS Certification you get a 50% discount on your next AWS Certification exam.**
You access the discount in your AWS Certification Account.

> — Source: [AWS Certified Developer – Associate](https://aws.amazon.com/certification/certified-developer-associate/)

---

## 7. The Four Exam Prep Steps

### 7.1 The Four Steps

| Step | Content |
|---|---|
| Step 1 | Learn about the exam and the style of its questions |
| Step 2 | Learn about the exam topics on AWS Skill Builder |
| Step 3 | Study with exam prep materials on AWS Skill Builder |
| Step 4 | Confirm your readiness with the official practice exam |

The detail of each step.

**Step 1 — Get familiar with the exam's focus areas and question style.**

| # | Content |
|---|---|
| 1 | Review the exam guide |
| 2 | Sign up for AWS Skill Builder |
| 3 | Enroll in and work through the AWS Certification Official Practice Question Set |

The questions in the practice set are created **by the same process** as the questions that can
appear on the real exam, and they come with detailed feedback and recommended resources.

**Step 2 — Use AWS Skill Builder training.**

| # | Content |
|---|---|
| 1 | Identify where your knowledge of the exam topics falls short |
| 2 | Enroll in the self-paced digital courses you need |
| 3 | Access AWS Builder Lab and apply skills in the AWS Management Console |

**Step 3 — Study with exam prep materials on Skill Builder.**

| # | Content |
|---|---|
| 1 | Skill Builder offers courses across every domain |
| 2 | AWS Builder Lab contains hundreds of self-paced labs (SPLs) |
| 3 | Prepare with game-based learning in AWS Cloud Quest |

**Step 4 — Confirm your readiness.** Characteristics of the official practice exam.

| Item | Content |
|---|---|
| Number of questions | **The same number** as the real exam |
| Difficulty | The same question style, difficulty, and level of rigor as the certification exam |
| Scoring | Exam-style scoring with a pass or fail result |
| Feedback | Feedback on the answer choices for each question, with recommended resources |
| How to sit it | A timed mock where answers are revealed only at the end, an untimed run, or a run where the answer is revealed as you submit each question |

Some materials **require an AWS Skill Builder subscription.**

### 7.2 The Current Exam Prep Plan 🔄

There are still four steps, but **the step names and the tools have changed.**

| Step | Current content | What changed |
|---|---|---|
| 1 | Get to know the exam with exam-style questions | The same |
| 2 | Enroll in digital courses where you have gaps and practice with **AWS Builder Labs, AWS Cloud Quest, and AWS Jam** | **AWS Jam is new** |
| 3 | Review the exam scope and each domain's topics, follow instructors walking through exam-style questions and test-taking strategies, and keep practicing with **AWS SimuLearn** | **AWS SimuLearn is new** |
| 4 | Assess readiness with the **AWS Certification Official Pretest** | Formerly the "official practice exam" |

The whole Official Exam Prep offering is broader too: **question sets, pretests, exam prep courses,
Escape Room, SimuLearn, and practice exams.** Formerly there were only the official practice
question set and the official practice exam.

> — Source: [AWS Certified Generative AI Developer – Professional](https://aws.amazon.com/certification/certified-generative-ai-developer-professional/)

> — Source: [AWS Skill Builder](https://aws.amazon.com/training/digital/)

---

## 8. Registering and Sitting the Exam

How to register for and sit the exam.

### 8.1 Online Proctored Exams 🆕

| Item | Content |
|---|---|
| What it is | You take the exam from **a private space** such as your home or office, on your own computer |
| How it is proctored | A proctor monitors remotely via a **screen-sharing application and your webcam** |
| When it is available | Most exam appointments are available **24 hours a day, seven days a week** |
| Delivery provider | **Pearson VUE.** Available for all AWS Certification exams |
| Requirement | **Communication with the proctor** is required to complete the appointment |

### 8.2 Proctoring Languages and Hours 🆕

| Language | Hours |
|---|---|
| English | 24/7 |
| Japanese | Monday–Saturday, 9 a.m.–4 p.m. Local Time/JST |
| Spanish (Latin America) | Monday–Friday, 10:00 a.m.–5:45 p.m. EST |
| Mandarin (for customers in Mainland China) | Monday–Friday, 8:00 a.m.–5:00 p.m. Local Time/CST |

**You can read the questions in English even on a localized exam.** Candidates who sign up for a
localized exam can view questions in English during the exam using the toggle feature. If a
translated term is confusing, use it to check the original wording.

> — Source: [Schedule an AWS Certification Exam](https://aws.amazon.com/certification/certification-prep/testing/)

### 8.3 Course Feedback

The procedure for leaving course feedback.

| Step | Content |
|---|---|
| 1 | Sign in at `https://www.aws.training` |
| 2 | Choose My Account, then Transcript |
| 3 | Choose the Archived tab |
| 4 | Select the course you completed and choose Evaluate |

> **Error in the original material.** Step 4 in the original says "select the completed
> **Architecting on AWS** course". This course is **Developing on AWS**, yet the original points to
> Architecting on AWS, so it looks like it was carried over from another course's material. The
> course name is omitted from the table above
> ([Section 9.1](#91-items-where-the-courseware-differs-from-fact)).

This procedure applies only to AWS internal and freelance instructors, and AWS Training Partners
replace it with information appropriate to their own learning management system. **So your feedback path depends on where you took this course.** If you took it
through a training partner, follow that partner's instructions.

---

## 9. Changes from the Courseware

Because this module is a guide to the training program rather than technical content, most of the
changes are **URLs and program structure**. There are 24 items in total: 7 courseware errors, 12
changes, 1 discouraged item, and 4 end-of-delivery items.

### 9.1 Items Where the Courseware Differs from Fact

| Courseware says | Verified | Source |
|---|---|---|
| "600-plus digital courses" and "over 600 on-demand digital courses" | Over 900 free self-paced digital courses now, and over 1,000 free learning resources across the online learning center | [AWS Skill Builder](https://aws.amazon.com/training/digital/) |
| The listed "AWS Certifications currently offered" | Four Specialty certifications have ended and four have been added since ([Section 5.3](#53-certifications-retired-since), [Section 5.4](#54-certifications-added-since)) | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |

Items where the courseware contradicts itself. These are not disagreements with external
documentation, so they carry no 🆕 or 🔄 marker.

| Where it conflicts | Content | How this document handles it |
|---|---|---|
| Course name | Step 4 of the course feedback procedure says "select the completed **Architecting on AWS** course". This course is Developing on AWS | Dropped the course name and kept the procedure ([Section 8.3](#83-course-feedback)) |
| Missing title | The level overview screen has an empty title field, with "AWS Certification levels" only in a body text box | Used that phrase as the section title ([Section 5.1](#51-the-four-levels)) |
| Duplicated sentence | The original note repeats "Exams are updated frequently …" **twice**, joined by "however" | Included it once ([Section 5.2](#52-how-to-determine-an-exams-scope)) |
| Duplicated caution | The original note states the subscription requirement **twice** with different wording | Included it once ([Section 7.1](#71-the-four-steps)) |
| Missing link label | In the follow-on course notes, two URLs follow `Advanced Developing on AWS` and the second (`courseId=53785`) has no course name | Matched it against the body list, judged it to be `Developing Serverless Solutions on AWS`, and labeled it accordingly ([Chapter 3](#3-additional-resources)) |

### 9.2 Changed URLs and Names

Several of the courseware's URLs have moved. They still resolve because they redirect, but they are
easy to mistype when copying from printed material.

| Target | Courseware URL | Current location |
|---|---|---|
| Exam list page | `aws.amazon.com/certification/exams` | `aws.amazon.com/certification/` (there is no separate list page) |
| AWS Builder Labs | `aws.amazon.com/training/digital/aws-builder-labs` | `aws.amazon.com/training/digital/immersive-learning/` |
| Tech Talks | `aws.amazon.com/events/online-tech-talks/on-demand` | `aws.amazon.com/events/online-tech-talks/` |
| Pricing whitepaper | `docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/welcome.html` | The same path as a directory (without `welcome.html`) |
| Skill Builder learn page | `explore.skillbuilder.aws/learn` | Redirects to the Skill Builder root domain. The AWS-owned entry point is `aws.amazon.com/training/digital/` |
| AWS Workshops | `workshops.aws` | Redirects to the workshops path on AWS Builder Center |
| Follow-on course registration | `www.aws.training/SessionSearch?...&courseId=...` | `aws.amazon.com/training/classroom/<course-name>/` (which redirects again to Skill Builder) |

> — Source: [AWS Certification](https://aws.amazon.com/certification/)

> — Source: [Immersive learning](https://aws.amazon.com/training/digital/immersive-learning/)

> — Source: [Online Tech Talks](https://aws.amazon.com/events/online-tech-talks/)

Items where the program structure changed.

| Item | Courseware | Verified current content |
|---|---|---|
| Skill Builder learning modes | Two branches: free digital training and classroom training | Three branches: self-paced Digital Courses, self-paced Digital Classroom, and live AWS Classroom Training ([Section 4.2](#42-three-ways-to-learn)) |
| The four exam prep steps | Step 4 is the "official practice exam" | Step 4 is the **AWS Certification Official Pretest** ([Section 7.2](#72-the-current-exam-prep-plan)) |
| Exam prep tools | Official practice question set, self-paced digital courses, AWS Builder Lab, AWS Cloud Quest, official practice exam | **AWS Jam** and **AWS SimuLearn** added, and Official Exam Prep broadened to question sets, pretests, exam prep courses, Escape Room, SimuLearn, and practice exams |
| Developer – Associate exam | No exam codes or revision schedules | **Being revised to DVA-C03.** DVA-C02's last day is November 30, 2026 ([Section 6.3](#63-the-exam-revision-schedule)) |
| Security – Specialty | Named only | **Revised to SCS-C03.** Dedicated coverage of generative AI and ML security, with Detection and Incident Response restructured into distinct sections. SCS-C02's deadline was December 1, 2025 |

> — Source: [Certification updates from AWS Training and Certification: September 2026](https://aws.amazon.com/blogs/training-and-certification/september-2026-new-offerings/)

> — Source: [AWS expands AI certification portfolio and updates security certification](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/)

### 9.3 Discouraged and End-of-Delivery Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The `www.aws.training` portal | Discouraged — the current learning entry point AWS points to is AWS Skill Builder, and the classroom course paths this course's material gives redirect to Skill Builder. `www.aws.training` itself still responds but is not in this project's sourcing allowlist, so it is not cited | [AWS Skill Builder](https://aws.amazon.com/training/digital/) | [AWS Classroom Training](https://aws.amazon.com/training/classroom/advanced-developing-on-aws/) |
| AWS Certified Machine Learning – Specialty | **No longer delivered** — last day March 31, 2026 | AI Practitioner, Machine Learning Engineer – Associate, Data Engineer – Associate, Generative AI Developer – Professional | [AWS expands AI certification portfolio](https://aws.amazon.com/blogs/training-and-certification/big-news-aws-expands-ai-certification-portfolio-and-updates-security-certification/) |
| AWS Certified Data Analytics – Specialty | **No longer delivered** — last day April 8, 2024 | AWS Certified Data Engineer – Associate | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |
| AWS Certified Database – Specialty | **No longer delivered** — last day April 29, 2024 | — | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |
| AWS Certified: SAP on AWS – Specialty | **No longer delivered** — last day April 29, 2024 | — | [AWS Certification retirements and launches](https://aws.amazon.com/blogs/training-and-certification/aws-certification-retirements-and-launches/) |

Three points about retired certifications, again. **A certification you hold stays valid for three
years and the Credly badge still displays. But you cannot recertify, and the Skill Builder exam prep
materials retired along with the exams.**

### 9.4 Items Added Since the Courseware

| Item | Where in this document |
|---|---|
| Which certification matches this course | [Section 6.1](#61-aws-certified-developer-associate) |
| 3-year validity and the two recertification forms (renewal 3 years / maintenance 1 year) | [Section 6.2](#62-validity-and-recertification) |
| The DVA-C03 revision schedule, exam information, and what changes | [Section 6.3](#63-the-exam-revision-schedule) and [Section 6.4](#64-what-changes-in-dva-c03) |
| The 50% discount on your next exam after earning one certification | [Section 6.5](#65-exam-fee-discount) |
| Microcredentials and AWS Agentic AI Demonstrated | [Section 5.5](#55-microcredentials) |
| The four certifications added since | [Section 5.4](#54-certifications-added-since) |
| The actual conditions of online proctoring and the language hours | [Section 8.1](#81-online-proctored-exams) and [Section 8.2](#82-proctoring-languages-and-hours) |
| The toggle that shows questions in English on a localized exam | [Section 8.2](#82-proctoring-languages-and-hours) |
| Skills Profile | [Section 4.3](#43-hands-on-practice-and-showing-achievements) |
| The Advanced Generative AI Development on AWS course | [Chapter 3](#3-additional-resources) |
| A map of this course's 14 modules | [Chapter 2](#2-what-this-course-covered) |

### 9.5 Items We Could Not Verify

| Item | Why we could not verify it |
|---|---|
| Whether the three course objectives match the objectives on the current course description page | The Developing on AWS course page redirects to Skill Builder, which is not in this project's sourcing allowlist, so we cannot cite the objective wording. We relayed the courseware wording |
| The current location of Getting Started with DevOps on AWS and AWS Cloud Development Kit Primer | The `www.aws.training` paths the courseware gives respond but are outside the allowlist, and we could not confirm the corresponding `aws.amazon.com` paths. We recommend searching by course name on Skill Builder ([Chapter 3](#3-additional-resources)) |
| The **full** list of AWS Certifications currently offered | The certification page renders dynamically and we could not retrieve the complete list. We included only what we confirmed from individual certification pages and the AWS Training and Certification blog ([Section 5.3](#53-certifications-retired-since) and [Section 5.4](#54-certifications-added-since)) |
| DVA-C02's current duration, question count, and cost | We could not retrieve the exam overview table from the individual certification page. The DVA-C03 values were confirmed from the September 2026 blog post ([Section 6.3](#63-the-exam-revision-schedule)) |
| The conditions for sitting the exam at a test center | The documentation we verified describes online proctoring. We could not confirm the test center conditions ([Section 8.1](#81-online-proctored-exams)) |
| The detailed makeup of AWS Jam, AWS SimuLearn, and Escape Room individually | We confirmed their names and roles in the Exam Prep Plan description but not the detail of each tool ([Section 7.2](#72-the-current-exam-prep-plan)) |

---

Well done.
