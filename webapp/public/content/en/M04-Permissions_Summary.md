# Module 4: Getting Started with Permissions

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [IAM Review](#2-iam-review)
3. [Policies and Permissions](#3-policies-and-permissions)
4. [IAM Roles and Temporary Credentials](#4-iam-roles-and-temporary-credentials)
5. [IAM Policy Evaluation Logic](#5-iam-policy-evaluation-logic)
6. [Testing Permissions](#6-testing-permissions)
7. [Development Environment and IDE Configuration](#7-development-environment-and-ide-configuration)
8. [Changes from the Courseware](#8-changes-from-the-courseware)
9. [Knowledge Check and Summary](#9-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Example access key IDs have **characters 5 through 8 replaced with `#`**, as in `AKIA####ODNN7EXAMPLE`. This keeps credential scanners from mistaking them for real keys; the original example values in the AWS documentation have alphanumeric characters in those positions. The four-character prefix (`AKIA`, `ASIA`) is left intact because the distinction between them is part of the material.
> - Verified on: August 25, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Identify the features and components of AWS Identity and Access Management (AWS IAM)
- Configure permissions to support a development environment
- Demonstrate how to test IAM permissions
- Configure an IDE and SDK to support a development environment
- Demonstrate access to AWS services using an SDK

### Where This Module Sits

| Item | Content |
|---|---|
| Module 1 | Course overview — introduction |
| Module 2 | Building a web application on AWS — explore the AWS architecture used to develop the full application |
| Module 3 | Getting started with development on AWS — review the benefits of the AWS SDKs when building an application |
| **Module 4** | **Getting started with permissions** — configure a development environment that supports AWS IAM permissions |
| Lab 1 | Configuring the developer environment — configure and test IAM permissions in a development environment |

This module has two halves. The first (Sections 2 through 6) reviews the IAM authentication and authorization model and shows how permissions are actually evaluated. The second (Section 7) connects those permissions to a development environment: credential configuration and IDE and SDK setup.

The Lab 1 workflow uses these components. You connect from your local machine to a sandbox with Guacamole, SSH, or Remote Desktop; an EC2 instance in the AWS Cloud runs the IDE, the AWS tools and SDKs, and the AWS CLI; AWS CloudFormation provisions the environment; and AWS IAM (IAM roles, AWS STS) governs Amazon S3 access.

---

## 2. IAM Review

### 2.1 What IAM Is

AWS Identity and Access Management (IAM) is a web service that securely controls user access to AWS resources.

| Purpose | Detail |
|---|---|
| Authentication | Controls **who** can use AWS resources |
| Authorization | Controls **how** users can use AWS resources |

- Your application needs permissions for users, for the developer's environment, and for AWS resources.
- Granting yourself access grants access not only to you, but to other team members who need development or administrative access to the application.
- With IAM you can configure a development environment for efficient access to multiple AWS accounts.
- IAM credentials also give resources access to other resources in your AWS account or in other AWS accounts.

### 2.2 IAM Terms and Concepts

Decide who and what needs access to your application first, then decide how to configure IAM.

| Term | Description | Courseware example |
|---|---|---|
| User | An entity that you create in AWS to represent the person or application that uses access to interact with AWS | Mary, Mateo |
| User group | A collection of IAM users, often organized by job function. Groups let you specify permissions for multiple users at once | Admins, Developers, DevOps |
| Policy and permissions | Defines permissions for an action regardless of the method you use to perform it. You attach customer managed policies or AWS managed policies | AdministratorAccess, DatabaseAdministrator, Billing |
| Role | Like an IAM user, a trusted entity with a permissions policy. **No long-term credentials are associated with it.** An IAM user can assume a role with temporary credentials for a role session | AWS service roles, EC2 instances, external users |

Policies divide further by how they are managed. 🆕 The courseware does not make this distinction.

| Type | Description |
|---|---|
| AWS managed policy | A managed policy created and managed by AWS |
| Customer managed policy | A managed policy you create and manage in your AWS account. More precise control than an AWS managed policy |
| Inline policy | A policy you add directly to a single user, group, or role. A strict one-to-one relationship between the policy and the identity; deleting the identity deletes the policy |

Resource-based policies are **inline only.** There are no managed resource-based policies.

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 2.3 How IAM Works

IAM provides the infrastructure needed to control authentication and authorization for a service. The courseware diagram shows this flow.

| Step | Element | Detail |
|---|---|---|
| 1 | Principal → authentication | The person or application that signs in as the AWS account root user, an IAM user, a role, or a federated user, and makes a request to AWS |
| 2 | Request | What a principal sends to AWS when it tries to use the AWS Management Console, the AWS API, or the AWS CLI |
| 3 | Authorization | AWS uses the values in the request context to find the policies that apply, then decides to allow or deny. Step 3a is cross-account access through a resource-based policy |
| 4b | Action (console) / operation (API, CLI) | After the request is authenticated and authorized, AWS approves the action or operation. For example, Amazon S3 `CreateBucket` and `DeleteBucket` |
| 5 | Resource | AWS performs the approved action on the related resource in the account. A resource is an object that exists within a service. For example, an S3 bucket |

Information included in a request:

| Item | Detail |
|---|---|
| Actions/operations | The action or operation the principal wants to perform |
| Resources | The AWS resource object on which the action is performed |
| Principal | The person or application that sent the request using an entity (user or role) |
| Environment data | Information such as IP address, user agent, SSL enabled status, and time of day |
| Resource data | Data related to the resource being requested |

AWS gathers this into the **request context** and then evaluates it.

🆕 The authentication step is not always necessary. Services such as Amazon S3 that allow some requests from anonymous users skip it.

> — Source: [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 2.4 IAM Users and Long-Term Access Keys 🔄

The courseware presents "attach an identity-based policy directly when you create an IAM user" and "to authenticate with the API you must supply an access key and a secret key" as the default path. As a conceptual explanation this still holds, but **IAM users and long-term access keys are no longer the default path AWS recommends.**

| Who | Current recommendation |
|---|---|
| Human users (including developers) | Use temporary credentials through **federation** with an identity provider. For centralized access management, **AWS IAM Identity Center** is recommended |
| Workloads (applications and backend processes) | Use temporary credentials with **IAM roles.** On AWS compute such as EC2 and Lambda, AWS delivers the role's temporary credentials to the resource, so there is no need to distribute long-lived credentials |
| Workloads running outside AWS | IAM Roles Anywhere (X.509 certificate), `AssumeRoleWithSAML`, `AssumeRoleWithWebIdentity`, mTLS with AWS IoT Core |
| Scenarios that genuinely need an IAM user or the root user | **Require MFA.** Use phishing-resistant MFA such as passkeys and security keys wherever possible |

Some use cases still need long-term access keys: workloads that cannot use IAM roles (for example, WordPress plugins), third-party AWS clients that do not support IAM Identity Center, CodeCommit access, and Amazon Keyspaces access. In those cases AWS recommends using **last used information** to update and remove access keys safely.

🆕 The access key ID prefix tells you which kind of key you have.

| Prefix | Meaning |
|---|---|
| `AKIA` | A **long-term** access key for an IAM user or the AWS account root user |
| `ASIA` | The access key of **temporary** credentials created with AWS STS operations |

The secret access key is **available for download only when you create it.** If you lose it, you must create a new one.

🆕 Alternatives for local development:

- **`aws login`** — With AWS CLI version 2, generate short-term credentials from your console credentials and run AWS CLI commands with them.
- **AWS CloudShell** — A browser-based, **pre-authenticated** shell you launch directly from the console. The AWS credentials you used to sign in to the console are automatically available in a new shell session, so you do not need to configure credentials when interacting with AWS services using AWS CLI version 2. You get 1 GB of persistent storage per Region in your home directory.

> — Source: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)

### 2.5 🆕 Root User MFA Requirement

The courseware mentions the root user only in the list of principals and in a role example diagram, and does not cover how to protect it. The following applies today.

| Item | Detail |
|---|---|
| MFA configuration | **All AWS account types (standalone, management, and member accounts) require MFA to be configured for their root user.** If MFA is not already enabled, users must register MFA **within 35 days** of their first sign-in attempt to access the AWS Management Console |
| Number of MFA devices | You can register up to **eight** MFA devices, in any combination of the supported types, with the root user. AWS recommends enabling multiple devices for resiliency |
| MFA types | FIDO Certified hardware security keys, hardware TOTP tokens, and virtual MFA applications |
| Root access keys | **Strongly discouraged.** The root user has full access to all AWS services and resources in the account, including billing information. For programmatic access, use `aws login` with your root credentials instead |
| Member accounts | For multiple AWS accounts managed through AWS Organizations, AWS recommends **removing root user credentials from member accounts.** You can remove the root password, access keys, and signing certificates, and deactivate and delete MFA. Member accounts then cannot sign in to their root user or perform password recovery for it |

> — Source: [Root user best practices for your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### 2.6 Making Authentication and Authorization Decisions

Access management starts with setting up users and groups to protect resources. It also means connecting to other identity services to grant external users access to AWS resources. Ask these questions when designing secure application access.

- Which users or services need access to build, manage, or interact with the application?
- What level of access (policies and permissions) does the application environment need?
- Which roles are a good fit for the application?
- Do all users always need full access to all services? How will you manage IAM principals?

Job functions the courseware uses as examples: developers, support, DB administrators, quality assurance, DevOps

---

## 3. Policies and Permissions

### 3.1 Policy Types 🔄

The courseware says "the two most common policy types are identity-based policies and resource-based policies" and treats permissions boundaries as a separate advanced feature. AWS currently supports **nine** policy types, listed here from most to least frequently used.

| Policy type | Attached to | Grants permissions? | Role |
|---|---|---|---|
| Identity-based policy | IAM users, groups, roles | ✅ Grants | Defines what an identity can do. Managed or inline |
| Resource-based policy | A resource (S3 bucket, IAM role trust policy, and so on) | ✅ Grants | Grants permissions to the principal specified in the policy. Inline only |
| 🆕 VPC endpoint policy | A VPC endpoint | ❌ Limits | Controls which principals can use the endpoint and which resources can be reached through it. An additional access boundary scoped to traffic that traverses the endpoint |
| Permissions boundary | An IAM entity (user or role) | ❌ Limits | Sets the **maximum permissions** an identity-based policy can grant to the entity |
| 🆕 Service control policy (SCP) | AWS Organizations root, OU, account | ❌ Limits | Defines the maximum permissions for **IAM users and roles** within accounts in the organization |
| 🆕 Resource control policy (RCP) | AWS Organizations root, OU, account | ❌ Limits | Defines the maximum permissions for **resources** within accounts in the organization |
| Access control list (ACL) | A resource (S3, AWS WAF, Amazon VPC, and so on) | ✅ Grants | Grants access to principals in other accounts. **The only policy type that does not use the JSON policy document structure.** Cannot control access for a principal within the same account |
| 🆕 AWS RAM resource share | Shared resources | ✅ Grants | Shares resources across accounts, OUs, or an entire organization without writing a resource-based policy per resource |
| 🆕 Session policy | A role session or federated user session | ❌ Limits | Passed when assuming a role or federating. Limits the permissions of that session |

In short, the policies that **grant** permissions are identity-based, resource-based, ACLs, and RAM shares. The rest **reduce the ceiling** on permissions already granted. Attaching only a ceiling policy and expecting permissions to appear does not work.

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

### 3.2 Identity-Based Policies

- You can grant an IAM user access to AWS services through the AWS Management Console or by using the AWS CLI or the AWS SDKs.
- When you create an IAM user, you attach an identity-based policy directly to grant permissions.
- Or you make the IAM user a member of a **user group that has the appropriate permissions policy attached (the courseware's recommendation).**

Access paths the courseware lists: AWS Management Console, AWS tools and SDKs, AWS CLI, AWS CloudShell

The following example allows read and write access to the objects in a specific S3 bucket.

```json
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Sid": "ListObjectsInBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::notes"
    },
    {
      "Sid": "AllObjectActions",
      "Effect": "Allow",
      "Action": "s3:*Object",
      "Resource": ["arn:aws:s3:::notes/*"]
    }
  ]
}
```

It is worth pointing out why the two statements are separate. `s3:ListBucket` is a **bucket** operation, so the resource is `arn:aws:s3:::notes`, while `s3:*Object` is an **object** operation, so the resource is `arn:aws:s3:::notes/*`. Combining them into a single ARN does not work.

### 3.3 Resource-Based Policies

- Resource-based policies are attached to an AWS resource such as an Amazon S3 bucket.
- They **grant the specified principal** permission to perform specific actions on that resource and define the conditions under which those permissions apply.

The following example denies permission to perform Amazon S3 actions on objects in the specified S3 bucket unless the request originates from the specified IP address range.

```json
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Sid": "IPAllow",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::notes",
        "arn:aws:s3:::notes/*"
      ],
      "Condition": {
        "NotIpAddress": {"aws:SourceIp": "54.240.143.0/24"}
      }
    }
  ]
}
```

🆕 The IAM service supports exactly one kind of resource-based policy: the **role trust policy.** An IAM role is both an identity and a resource that supports resource-based policies, so you must attach **both a trust policy and an identity-based policy** to a role. The trust policy defines which principals can assume the role.

🆕 A terminology distinction: **resource-based** policies and **resource-level** permissions are different. The former is a policy you attach directly to a resource; the latter is the ability to specify individual resources in a policy by ARN.

> — Source: [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 3.4 Permissions Boundaries

A permissions boundary is an advanced IAM feature.

- It sets the **maximum permissions** an identity-based policy can grant to an IAM entity such as a user or role.
- The entity can perform only the actions allowed by **both its identity-based policies and its permissions boundary.** The effective permissions are the **intersection** of the two.
- A permissions boundary **does not grant permissions on its own.** You must attach a permissions policy separately.
- You can use an AWS managed policy or a customer managed policy as the boundary.

The courseware example:

| Person | Group | Attached policies | Result |
|---|---|---|---|
| Martha | Developers | `PowerUserAccess` on the group | Access to the services in the diagram (DynamoDB, API Gateway, Amazon Polly, CloudWatch, S3 for website and MP3 hosting) |
| Mateo | Developers (new member) | `PowerUserAccess` + a permissions boundary that allows only CloudWatch | **Cannot** perform operations in Amazon S3, because that is outside his permissions boundary |

Mateo's permissions boundary:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

🆕 Practical use: AWS recommends permissions boundaries as a way to **delegate permissions management within an account.** For example, you can let developers create and manage roles for their own workloads while pinning the ceiling on what you delegate.

🆕 Caution: do not use resource-based policy statements that combine a `NotPrincipal` element with a `Deny` effect for IAM users or roles that have a permissions boundary attached. **Every IAM principal with a permissions boundary attached will be denied**, regardless of the values in `NotPrincipal`. Use the `ArnNotEquals` condition operator with the `aws:PrincipalArn` context key instead.

> — Source: [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### 3.5 The PowerUserAccess Managed Policy 🔄

The courseware describes `PowerUserAccess` as using "the `NotAction` element to allow all actions on all AWS services and all resources **except IAM and AWS Organizations**", and says "only the IAM permission to create service-linked roles is granted." The current definition has expanded both the exclusion list and the allowed exceptions.

| Item | Courseware | Current (default version v12) |
|---|---|---|
| `NotAction` exclusions | `iam:*`, `organizations:*` | `iam:*`, `organizations:*`, **`account:*`** |
| Explicitly allowed exceptions | Service-linked role creation only | `iam:CreateServiceLinkedRole`, `iam:DeleteServiceLinkedRole`, `iam:ListRoles`, `organizations:DescribeEffectivePolicy`, `organizations:DescribeOrganization`, `account:GetAccountInformation`, `account:GetGovCloudAccountInformation`, `account:GetPrimaryEmail`, `account:ListRegions` |
| Description | — | "Provides full access to AWS services and resources, but does not allow management of Users and groups" |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "account:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "account:GetAccountInformation",
        "account:GetGovCloudAccountInformation",
        "account:GetPrimaryEmail",
        "account:ListRegions",
        "iam:CreateServiceLinkedRole",
        "iam:DeleteServiceLinkedRole",
        "iam:ListRoles",
        "organizations:DescribeEffectivePolicy",
        "organizations:DescribeOrganization"
      ],
      "Resource": "*"
    }
  ]
}
```

Among the AWS managed policies for job functions, `PowerUserAccess` corresponds to the **Developer power user** job function, matching the courseware's wording.

> AWS managed policies are built for use by all AWS customers, so they **do not grant least-privilege permissions.** The recommended path is to start with them, learn which permissions are actually used, and then narrow to a customer managed policy.

> — Source: [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html), [AWS managed policies for job functions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html)

### 3.6 🆕 Service Control Policies and Resource Control Policies

The courseware covers only permissions boundaries as a way to limit maximum permissions. When you manage multiple accounts with AWS Organizations, there are two more organization-level guardrails.

| Item | Service control policy (SCP) | Resource control policy (RCP) |
|---|---|---|
| Limits | **Principals** (IAM users and roles) within an account | **Resources** within an account |
| Attach point | Organization root, OU, account | Organization root, OU, account |
| Grants permissions | ❌ No | ❌ No |
| Root user | Limits every request made by a principal in a member account, **including each AWS account root user** | Affects the effective permissions for resources in member accounts and can impact identities **including the root user**, regardless of whether they belong to your organization |
| Prerequisite | All features enabled in the organization | All features enabled in the organization |

AWS recommendation: separate workloads across multiple accounts, use SCPs as principal guardrails and RCPs as resource guardrails. **SCPs and RCPs alone grant no permissions.** To grant permissions you must attach identity-based or resource-based policies.

🆕 When RCPs are enabled, an AWS managed policy called `RCPFullAWSAccess` is automatically created and attached to every entity in the organization (the root, each OU, and each account), and it **cannot be detached.** So the RCP layer always contains one `Allow` statement.

> — Source: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## 4. IAM Roles and Temporary Credentials

### 4.1 Do You Always Need an IAM User Account?

The questions the courseware poses:

- What if an existing IAM user temporarily needs special permissions?
- What if the identity exists outside AWS, in a corporate user directory or a web identity provider?
- Can you assign temporary access to a user or an application?
- Does every user need permanent credentials in IAM?

→ **Use roles.**

You often need to temporarily delegate access to users or services that do not have access to AWS resources. A user in one AWS account might need to access resources in another account, or a mobile app might use AWS resources. But **storing AWS keys in an application is unattractive, because they are hard to rotate and users could extract them.**

### 4.2 Role Example 1 — Assuming a Role Within the Same Account

- A user can assume a role and **temporarily** take on the different permissions attached to that role.
- **A role has no associated credentials (password or access keys).**
- A role is not uniquely tied to one person. It is built so that anyone who needs it can assume it.
- Courseware example: a user in the Developers group (Mary, Diego, Mateo, Martha) assumes a database administrator role to gain DynamoDB table write permissions that are not in the group policy.

🆕 There are two ways to let a user assume a role in the same account, and **you only need one of them.**

| Method | Detail |
|---|---|
| Identity-based policy | Attach a policy to the user that allows calling `sts:AssumeRole` (as long as the role's trust policy trusts the account) |
| Role trust policy | Add the user as a principal directly in the role's trust policy |

Either works because the role's trust policy acts as an IAM resource-based policy. When a resource-based policy grants access to a principal in the **same account**, no additional identity-based policy is required.

> — Source: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.3 Role Example 2 — Cross-Account Access

IAM roles also allow cross-account access.

- Your organization might have multiple AWS accounts to isolate development from production.
- A user attached to a group is granted permission to switch roles within the development account and request access to a role attached to the production account.
- The user switches roles (console) or assumes the role (AWS CLI), gets temporary credentials, and changes the production environment.

The courseware flow (developer Diego → `UpdateApp` role in the production account):

| Step | Detail |
|---|---|
| 1 | User credentials |
| 2 | Request access to the role |
| 3 | Temporary credentials are granted and returned |
| 4 | The developer updates the S3 bucket with the role credentials |

🆕 Cross-account access is **not one-sided.** The courseware says only that "resource-based policies are widely used to grant cross-account access," but the actual requirement is:

| Account | Role | What is required |
|---|---|---|
| Trusted Account A — where the principal lives | Requester | An **identity-based policy** must allow the request to the resource in Account B |
| Trusting Account B — where the resource lives | Resource owner | A **resource-based policy** must allow the requester in Account A by naming the principal |

AWS performs **two evaluations** for a cross-account request and allows it **only if both return `Allow`.**

Using a role differs from other resource-based policies. A principal that assumes a role can use the resulting temporary credentials to access **multiple resources** in that account, and the scope is defined by the role's identity-based permissions policy.

> — Source: [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)

### 4.4 Role Example 3 — Service Roles

- A service such as an AWS Lambda function can assume a role to perform operations on a DynamoDB table on your behalf.
- This is called a **service role.**
- Courseware slide note: you can customize the session duration.

### 4.5 Temporary Credentials and AWS STS

Use **AWS Security Token Service (AWS STS)** to request **temporary credentials with limited permissions** for an IAM user or a user authenticated through identity federation.

| Characteristic | Detail |
|---|---|
| Short-lived | You can specify the expiration interval. Service requests made with expired credentials fail, so you must request a new set |
| The basis of roles | Temporary credentials are the basis of roles |
| Not stored with the requester | They are not stored with the user. They are generated dynamically and provided on request |
| Not reusable | They cannot be used again after they expire |
| Federation support | Can be issued to users who signed in through an external identity provider |

Benefits of temporary credentials:

- You do not have to distribute or embed long-term AWS credentials in an application.
- You can provide access to AWS resources without defining an AWS identity for the user.
- Because they cannot be reused after expiring, you do not have to **rotate them or explicitly revoke them.**

🆕 What a set of temporary credentials contains:

| Field | Detail |
|---|---|
| `AccessKeyId` | The access key ID. Temporary credentials start with `ASIA` |
| `SecretAccessKey` | The secret access key |
| `SessionToken` | The session token. **Its size is not fixed.** It is typically under 4,096 bytes, but the documentation states explicitly that you should make no assumptions about the maximum size |
| `Expiration` | The expiration time |

Besides `Credentials`, an `AssumeRole` response includes `AssumedRoleUser` (the ARN and ID of the assumed role session), `PackedPolicySize`, and `SourceIdentity`.

🆕 You can send AWS STS API calls to **either a global endpoint or a Regional endpoint.** Choosing an endpoint closer to you reduces latency, and you can direct calls to an alternative Regional endpoint if you can no longer communicate with the original one. With an AWS SDK you use the SDK method to specify a Region; if you construct HTTP requests manually, you must direct them to the correct endpoint yourself.

> — Source: [Request temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html), [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.6 🆕 Role Session Duration

The courseware only says "you can customize the session duration" without giving numbers. The actual values are:

| Item | Value |
|---|---|
| `DurationSeconds` valid range | 900 seconds (15 minutes) to 43200 seconds (12 hours) |
| Default | **3600 seconds (1 hour)** |
| Maximum session duration setting for the role | Set by an administrator, from 1 hour to 12 hours |
| If the value exceeds the limit | The operation **fails.** For example, requesting 12 hours when the administrator set 6 hours fails |
| Role chaining | Limits an AWS CLI or AWS API role session to **a maximum of one hour.** Providing a `DurationSeconds` greater than one hour while role chaining causes the operation to fail |

🆕 You can narrow session permissions with session policies. You can pass a single inline session policy or up to 10 managed policy ARNs, and in both cases the plaintext cannot exceed 2,048 characters. The resulting session's permissions are the **intersection of the role's identity-based policy and the session policies**, and you **cannot use session policies to grant more permissions than the role allows.**

🆕 You cannot call the AWS STS `GetFederationToken` or `GetSessionToken` operations with temporary credentials created by `AssumeRole`.

> — Source: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.7 Web Identity Federation 🔄

The courseware names specific social providers: "AWS STS web identity federation supports sign-in through Amazon, Facebook, Google, and OpenID Connect (OIDC)-compatible providers." Current documentation calls this feature **OIDC federation** and describes **OIDC-compatible IdPs in general** rather than naming specific social providers.

| Item | Detail |
|---|---|
| Name | OIDC federation |
| Supported | OIDC-compatible IdPs in general, such as GitHub Actions |
| How it works | Authenticate with the IdP, receive a JSON Web Token (JWT), and exchange it for temporary AWS credentials. The credentials map to an IAM role that has only the permissions the task requires |
| Supported scenarios | Both machine-to-machine authentication (CI/CD pipelines, automated scripts, serverless applications) and human user authentication |
| Recommendation for human users | If you need to manage user sign-up, sign-in, and user profiles, consider **Amazon Cognito as an identity broker** |
| Clock skew allowance | IAM provides a **five-minute** window beyond the expiration time in the JWT `exp` claim to account for clock skew |

The courseware's point — that you use an external IdP instead of writing custom sign-in code or managing your own user identities — still holds. What changed is the name and the providers AWS uses as examples.

> — Source: [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html)

---

## 5. IAM Policy Evaluation Logic

### 5.1 Best Practices

The courseware slide:

- Apply policies to groups.
- Use the principle of least privilege.

Additional points from the instructor notes:

- Use policies to fine-tune the permissions granted to IAM users, groups, and roles.
- Policies are **in JSON format, so you can use them in a version control system.**
- Define minimal access for each user, group, or role, then use authorization policies to customize access to specific resources.

### 5.2 Evaluation Rules

| # | Rule |
|---|---|
| 1 | By default, all requests are denied (an implicit deny) |
| 2 | An explicit allow overrides this default |
| 3 | An explicit deny overrides any allow |

### 5.3 The Evaluation Logic Diagram

```text
Evaluate all applicable policies.
        │
        ▼
  Explicit deny? ──── Yes ──▶ Deny (explicit deny)
        │
        No
        │
        ▼
  Explicit allow? ─── Yes ──▶ Allow
        │
        No
        │
        ▼
       Deny
```

From the instructor notes:

- All policies applied to the IAM entity are evaluated.
- **The order in which policies are evaluated does not affect the outcome.**
- If there is an explicit deny statement, the final decision is to deny.
- If there is an allow statement, the final decision is to allow.
- If there is no allow statement, the final decision is to deny.
- Any action not explicitly allowed is denied, and any action explicitly denied is always denied.

> 🔄 The courseware phrases this as "if there is a conflict, **the most restrictive policy** applies." The outcome is correct, but the precise rule is "**an explicit deny takes precedence.**" AWS does not compare the scope of two allow policies and pick the narrower one. If a `Deny` exists at any layer, the final decision is fixed as deny at that point. See [Section 5.4](#54-how-the-aws-enforcement-code-evaluates-a-request) for the full order.

### 5.4 🆕 How the AWS Enforcement Code Evaluates a Request

The courseware's two-step diagram summarizes the conclusion accurately, but the actual enforcement code follows a defined order by policy type. The order itself affects the outcome.

| Step | Layer | Condition to continue | If it fails |
|---|---|---|---|
| 0 | Default | — | All requests are **implicitly denied**, with the exception of the **AWS account root user, which has full access** |
| 1 | Deny evaluation | Look for a `Deny` statement across all applicable policies (SCPs, RCPs, resource-based, identity-based, permissions boundaries, session policies) | If **even one** applicable `Deny` is found, the decision is immediately **Deny** |
| 2 | AWS Organizations RCPs | There must be an applicable `Allow` statement in the RCPs | Otherwise **Deny** |
| 3 | AWS Organizations SCPs | There must be an applicable `Allow` statement in the SCPs | Otherwise **Deny** |
| 4 | Resource-based policies | Depends on the principal type. For most resources you only need an explicit `Allow` in **either** an identity-based or a resource-based policy | Continue |
| 5 | Identity-based policies | There must be a statement allowing the requested action | Otherwise implicit deny → **Deny** |
| 6 | Permissions boundaries | The boundary policy must allow the requested action | Otherwise implicit deny → **Deny** |
| 7 | Session policies | If the principal is not a session principal, the decision is **Allow**. If it is a session principal and no session policy was passed, a default session policy is created and the decision is **Allow** | If a session policy is present and does not allow the action, **Deny** |

Exceptions to watch for:

- **IAM role trust policies and AWS KMS key policies are exceptions.** They must **explicitly allow access** for the principal. Resource-based policies for services other than IAM and AWS KMS may also require an explicit `Allow` within the same account, so check the documentation for the service you are working with.
- Within the same account, a resource-based policy that grants permissions directly to an **IAM user ARN** or to a **session principal** (a role session or an AWS STS federated user) is **not limited by an implicit deny** in an identity-based policy, a permissions boundary, or a session policy.
- By contrast, a resource-based policy that grants permissions to a **role ARN** (`arn:aws:iam::111122223333:role/examplerole`) is limited by an implicit deny in a permissions boundary or session policy. When you assume a role and make a request, the principal is the **role session ARN** (`arn:aws:sts::111122223333:assumed-role/examplerole/examplerolesessionname`), not the ARN of the role itself.

Summarizing how the layers combine:

| Combination | Result |
|---|---|
| Identity-based + resource-based (same account) | **Union.** If either allows, the action is allowed |
| Identity-based + permissions boundary | **Intersection** |
| Identity-based + SCP/RCP (resource with no resource-based policy) | **All three policy types must allow** |
| Any combination | An **explicit deny in any of them overrides the allow** |

> — Source: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 5.5 Is the Root User Always Allowed? 🔄

The courseware instructor notes say "(generally, requests for resources in an account made with the account or root credentials are **always** allowed.)" From a single-account perspective that is correct. Current documentation also states that the **AWS account root user has full access** as the exception to the default implicit deny.

**Inside AWS Organizations, however, it is not.**

| Policy | Effect on the root user |
|---|---|
| Service control policy (SCP) | Limits permissions for principals in member accounts, **including each AWS account root user** |
| Resource control policy (RCP) | Affects the effective permissions for resources in member accounts and can impact identities **including the AWS account root user**, regardless of whether they belong to your organization |

You can also remove the root credentials themselves from member accounts managed through AWS Organizations. Once removed, the member account cannot sign in to its root user or recover the root password (see [Section 2.5](#25-root-user-mfa-requirement)).

If you read this sentence verbatim in class, it can be misheard as "not even an SCP can stop the root user." It is safer to split it: **true in a single account, false inside an organization.**

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html)

---

## 6. Testing Permissions

### 6.1 Demo — Testing a Permissions Boundary with the AWS CLI

This demo shows how a permissions boundary cuts down group permissions, using the CLI. `userwithpermissionboundary` is a member of the Developers group, and that group allows creating S3 buckets through `PowerUserAccess`. But the user has a permissions boundary attached whose maximum access does not support Amazon S3.

Prerequisite — the AWS CLI must be set up with several different profiles.

| Item | Value |
|---|---|
| Users | `userwithpermissionboundary`, `userwithiamaccess` |
| Group: Developers | Permissions policy = `PowerUserAccess` / member = `userwithpermissionboundary` |
| Group: Admins | Permissions policy = `AdministratorAccess` / member = `userwithiamaccess` |
| Permissions boundary | `userwithpermissionboundary` = `S3restricted` |

`S3elevated` (a boundary that includes S3 access):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudwatch:*",
        "ec2:*"
      ],
      "Resource": "*"
    }
  ]
}
```

`S3restricted` (a boundary without S3 access):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*",
        "ec2:*"
      ],
      "Resource": "*"
    }
  ]
}
```

The demo steps:

```bash
# 1) Try to create a bucket with this profile. It fails.
#    The group policy allows it, but the permissions boundary does not allow s3.
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary

# 2) Check which permissions boundary is attached to the user.
#    → arn:aws:iam::111122223333:policy/S3restricted
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 3) Check the maximum access level that boundary allows.
aws iam get-policy-version \
  --policy-arn arn:aws:iam::111122223333:policy/S3restricted \
  --version-id v1

# 4) Using another user with elevated permissions, replace the boundary with S3elevated.
aws iam put-user-permissions-boundary \
  --permissions-boundary arn:aws:iam::111122223333:policy/S3elevated \
  --user-name userwithpermissionboundary \
  --profile userwithiamaccess

# 5) Verify that the boundary changed.
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 6) Retry the bucket creation as the same user. It succeeds.
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary
```

🆕 The `PutUserPermissionsBoundary` API takes `PermissionsBoundary` (the managed policy ARN, 20 to 2048 characters) and `UserName` (the friendly name, not the ARN, 1 to 64 characters), and **both are required.** That API documentation also states that "policies that are used as permissions boundaries do not provide permissions. You must **also attach a permissions policy** to the user." In this demo, `PowerUserAccess` on the group plays that role.

🔄 The account IDs in the courseware instructor notes are inconsistent. Within the same demo you see `111122223333`, `1234567891011` (13 digits, while an AWS account ID is 12), and `111722413196`. The code above uses the documentation example account `111122223333` throughout.

> — Source: [PutUserPermissionsBoundary](https://docs.aws.amazon.com/IAM/latest/APIReference/API_PutUserPermissionsBoundary.html), [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html)

### 6.2 Demo — Testing Role Assumption in the AWS Management Console 🔄

This demo signs in to the console as a contractor user who has only AWS CloudShell access, and shows the difference in results before and after assuming a role. It illustrates the use of roles within the same organization.

| Item | Value |
|---|---|
| User | Contractor / attached policies = none |
| Group | Contractors / attached policy = `ContractorAccess` |
| Role | Attached policy = `ContractorS3access` |

`ContractorAccess` (the group policy):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "cloudshell:*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::111122223333:role/S3access"
    }
  ]
}
```

`ContractorS3access` (the role's permissions policy):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

The demo steps:

```bash
# 1) Sign in to the console as Contractor, launch CloudShell, and try to create a bucket. It fails.
#    CloudShell is pre-authenticated, so no credential configuration is needed.
aws s3 mb s3://devonawstest-bucket

# 2) Check which credentials the call is being made with.
#    This works even without permissions.
aws sts get-caller-identity

# 3) Assume the role to get temporary credentials.
aws sts assume-role \
  --role-arn "arn:aws:iam::111122223333:role/S3access" \
  --role-session-name DevOnAWS

# 4) Export the Credentials values from the response as environment variables.
#    A temporary access key ID starts with ASIA.
export AWS_ACCESS_KEY_ID=ASIA####ODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=<SessionToken>

# 5) Verify that the role was assumed.
#    Arn changes to arn:aws:sts::111122223333:assumed-role/S3access/DevOnAWS.
aws sts get-caller-identity

# 6) Retry the bucket creation with the assumed role. It succeeds.
aws s3 mb s3://devonawstest-bucket
```

What was corrected relative to the courseware:

| Item | Courseware | Why it was corrected |
|---|---|---|
| Bucket name | `s3://DevonAWStest_bucket` | General purpose bucket names can consist only of **lowercase letters, numbers, periods (`.`), and hyphens (`-`)**. The uppercase letters and underscore make this fail regardless of permissions. Changed to `devonawstest-bucket` |
| Role name | `ContractorAccess` / `Contractors3access` / `S3access` used interchangeably | Standardized on `role/S3access`, which is what the policy's `Resource` points to |
| Temporary access key example | `AKIA####ODNN7EXAMPLE` | `AKIA` is the long-term access key prefix. Temporary keys returned by `assume-role` start with `ASIA` |
| Account ID | `112233445566` (policy) / `111722413196` (command) | The policy's `Resource` and the command's `--role-arn` point to different accounts, so the `sts:AssumeRole` allow does not match. Standardized on the documentation example account `111122223333` |

🆕 **No permissions are required to perform `GetCallerIdentity`.** Even if an administrator attaches a policy that explicitly denies `sts:GetCallerIdentity`, you can still perform the operation, because the same information is returned when access is denied. The response has three fields.

| Field | Detail |
|---|---|
| `Account` | The AWS account ID of the account that owns or contains the calling entity |
| `Arn` | The AWS ARN associated with the calling entity. For an IAM user, `arn:aws:iam::111122223333:user/Alice`; for an assumed role, `arn:aws:sts::111122223333:assumed-role/my-role-name/my-role-session-name` |
| `UserId` | The unique identifier of the calling entity |

That is why this is a good first command when debugging a permissions problem. It runs even without permissions, and the shape of `Arn` tells you immediately whether the role assumption worked.

> — Source: [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html), [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 6.3 🆕 Validating Permissions Without Making a Call

Both courseware demos call the real API, observe the failure, and work backward to the cause. In production it is safer to validate without calling.

#### IAM policy simulator

The policy simulator tests identity-based policies, IAM permissions boundaries, service control policies (SCPs), and resource-based policies that you provide. It simulates how AWS would evaluate a request **without sending a real request to any AWS service.** Each simulation returns a binary outcome per action and resource, and when the result is an allow or an explicit deny it also shows you **which policy produced that outcome.**

| Mode | Use |
|---|---|
| Principal mode | Test the policies **already attached** to an existing IAM user, role, or group. You can include or exclude custom identity policies or permissions boundaries in the simulation only; your account is unchanged |
| Custom mode | Test policies you write or paste in that are not yet attached. They are not saved to your account |

Know the limits before you rely on it:

- Simulator results **can differ from your live AWS environment.** AWS recommends checking your policies against the live environment after testing.
- It does not use real context key values from production, and because the actions are not actually run there is no service response.
- You can simulate **only one permissions boundary at a time.**
- For SCPs the simulator tells you whether an action is allowed or denied, but for security reasons it does **not surface the matched statements** the way it does for other policy types.
- Except in the console, it does not retrieve a resource's policy for you. To include a resource-based policy you must supply it along with the resource.

#### IAM Access Analyzer

| Capability | Detail |
|---|---|
| External access analyzers | Identify resources in your organization and accounts that are shared with an external entity. Resource-based policies are analyzed with logic-based reasoning and a finding is generated per instance |
| Internal access analyzers | Identify internal access to selected resources |
| Unused access analyzers | Identify unused access in your organization and accounts |
| Policy validation | Validate IAM policies against policy grammar and AWS best practices. Provides **more than 100 policy checks** and actionable recommendations, shown as you author or edit policies in the console |
| Custom policy checks | Validate policies against your specified security standards |
| Policy generation | Generate fine-grained policies based on access activity logged in AWS CloudTrail |

Operational characteristics:

- When you enable an analyzer you choose an organization or account as the **zone of trust.** Access by principals within the zone of trust is considered trusted.
- A new or updated policy is analyzed within about **30 minutes.** If a notification is missed, it is analyzed during the next periodic scan (within 24 hours).
- **For external access, only policies applied to resources in the Region where the analyzer is enabled are analyzed.** To monitor all resources you must create an external access analyzer in each Region you use. Unused access findings do not change by Region, so a per-Region analyzer is not required.

#### Last accessed information

Use this to find and remove permissions granted beyond what is needed. You can view it for identities and policies that exist in IAM or AWS Organizations.

| Item | Detail |
|---|---|
| Information types | Allowed **AWS service** information and allowed **action** information, including the date and time of the attempt to access an AWS API |
| Console latency | Recent activity appears in the IAM console within **four hours** |
| Tracking period | At least **400 days** for service information. Action information tracking began April 12, 2020 for Amazon S3; April 7, 2021 for Amazon EC2, IAM, and Lambda; and May 23, 2023 for all other services |
| Attempts reported | **All attempts, not just successful ones.** This includes the console, the SDKs, and the command line tools. An unexpected entry does not mean your account was compromised (the request might have been denied). CloudTrail logs are the authoritative source for success or denial |
| Exclusions | `iam:PassRole` is not tracked. Action information is not available for data plane events |
| AWS Organizations | Signing in with management account credentials lets you view information about services allowed by an SCP for the organization root, OUs, and accounts |

You can **continuously monitor** this information with unused access analyzers.

> — Source: [IAM policy testing with the IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html), [Using AWS Identity and Access Management Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html), [Refine permissions in AWS using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html)

---

## 7. Development Environment and IDE Configuration

### 7.1 Setting Up the Development Environment

Developers performing application development tasks must configure their tools to fit their requirements. The courseware covers this in the following order.

1. Credentials (precedence order)
2. Profiles
3. Environment variables
4. Temporary credentials

A **named profile** is a collection of settings and credentials that you can apply to an AWS CLI command. When you specify a profile to run a command, its settings and credentials are used for that command.

### 7.2 Configuring Credentials 🔄

The procedure the courseware presents:

1. Run `aws configure` in a terminal window.
2. Paste in your AWS access key ID, then your AWS secret access key.
3. Enter the default Region name.
4. Choose the default output format.

```bash
$ aws configure
AWS Access Key ID [None]: AKIA####ODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json

$ aws configure --profile user1
AWS Access Key ID [None]: AKIA####H8DHBEXAMPLE
AWS Secret Access Key [None]: PsdaswtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

The resulting files:

```ini
# ~/.aws/config
[default]
region=us-west-2
output=json

[profile user1]
region=us-east-1
output=json
```

```ini
# ~/.aws/credentials
[default]
aws_access_key_id=AKIA####ODNN7EXAMPLE
aws_secret_access_key=…PxRfiCYEXAMPLEKEY

[user1]
aws_access_key_id=AKIA####H8DHBEXAMPLE
aws_secret_access_key=…Co8nbEXAMPLEKEY
```

File locations:

| Platform | Credentials | Config |
|---|---|---|
| Linux, macOS, Unix | `~/.aws/credentials` | `~/.aws/config` |
| Windows | `%USERPROFILE%\.aws\credentials` | `%USERPROFILE%\.aws\config` |

#### Output formats 🔄

The courseware says "the options include json, yaml, and text." The AWS CLI currently supports **six** formats.

| Format | Detail |
|---|---|
| `json` | A JSON string. **The AWS CLI default** |
| `yaml` | A YAML string |
| 🆕 `yaml-stream` | Streamed YAML output. Faster handling of large data types |
| `text` | Multiple lines of tab-separated values. Good for piping to `grep`, `sed`, or `awk` |
| 🆕 `table` | A table using `+|-` characters for cell borders. Easier for humans to read but less useful programmatically |
| 🆕 `off` | Suppresses all command output to stdout. Useful in automation scripts and CI/CD pipelines where you only need the exit code |

There are three ways to select the format, each overriding the one before it: the `output` option in a named profile in the `config` file, the `AWS_DEFAULT_OUTPUT` environment variable, and the `--output` option on the command line.

🆕 The output format changes how `--query` behaves. With `--output text`, output is paginated **before** `--query` is applied and the query runs once per page, so the first matching element on each page is included and you can get unexpected extra output. With `json`, `yaml`, or `yaml-stream`, the output is processed as a single structure and the query runs **only once.**

> Storing long-term access keys with `aws configure` is the standard procedure as of the courseware. For the current recommended path see [Section 2.4](#24-iam-users-and-long-term-access-keys). For local development, consider `aws login` or IAM Identity Center first.

> — Source: [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html)

### 7.3 Switching Accounts with Named Profiles

- With the AWS CLI you can configure multiple named profiles as collections of settings and credentials.
- Named profiles let you switch between **accounts, users, roles, and Regions.**
- IDEs such as VS Code, Eclipse, Visual Studio, and JetBrains support named profiles.
- The AWS CLI and IDEs use the default user unless the profile is changed to a different user or role.
- To add a profile, run `aws configure --profile <name>`.

The courseware example: creating an S3 bucket in two accounts.

```bash
# Account 111122223333 (default profile)
aws s3 mb s3://mybucket

# Account 444455556666 (user1 profile)
aws s3 mb s3://mybucket --profile user1
```

### 7.4 Switching Profiles in an IDE 🔄

Profile switching is also supported in an IDE when paired with an AWS Toolkit. In the courseware example, a developer switches profiles inside the IDE to deploy Lambda functions to multiple accounts (111122223333 and 444455556666).

One sentence in the courseware needs correction.

| Courseware | What was verified |
|---|---|
| "The AWS Toolkit for JetBrains streamlines the process through the **Eclipse Preferences window**" | This mixes two different IDEs. The current credential setup path for the JetBrains toolkit is **AWS Connection Settings → Set up authentication → Authenticate with IAM → the AWS Toolkit: Setup Authentication dialog**, where you enter a profile name, access key ID, and secret access key to add the profile to your config file and connect |

🆕 Cautions stated in the JetBrains toolkit documentation:

- If you already set IAM credentials through another AWS service such as the AWS CLI, the toolkit **automatically detects** and makes them available.
- AWS **recommends IAM Identity Center authentication.**
- To avoid security risks, **do not use IAM users for authentication** when developing purpose-built software or working with real data. Use federation with an identity provider such as IAM Identity Center instead.

🔄 Of the four toolkits the courseware lists, **the AWS Toolkit for Eclipse no longer has its own documentation.** The entire `toolkit-for-eclipse/v1/user-guide/` path the courseware cites now redirects to the JetBrains toolkit documentation.

| IDE | Current documentation |
|---|---|
| JetBrains | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| Visual Studio | [Credentials — Toolkit for Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/keys-profiles-credentials.html) |
| Visual Studio Code | [Setup credentials — Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/setup-credentials.html) |
| Eclipse | No separate documentation. The courseware link redirects to the JetBrains toolkit documentation |

> — Source: [AWS IAM credentials — AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html)

### 7.5 Settings and Environment Variables

Courseware slide items: global settings, environment variables, service-specific settings, precedence order

- The config and credentials files contain additional settings that can be stored in the operating system's environment variables.
- Only one set of environment variables applies at a time, but environment variables are modified dynamically as the program runs and requirements change.
- **Global settings affect all services.** Environment variables affect only the AWS SDKs and tools.
- You can also store Amazon S3-specific settings in the config file.

```ini
# ~/.aws/config
[default]
region=us-west-2
output=json

[profile dev]
region=us-east-1
output=json
retry_mode=standard
max_attempts=4
s3 =
    max_concurrent_requests = 20
    max_queue_size = 10000
    multipart_threshold = 64MB
api_versions =
    ec2 = 2015-03-01
    cloudfront = 2015-09-17
```

🆕 `retry_mode` and `max_attempts` are still valid shared `config` file keys. The corresponding environment variables are `AWS_RETRY_MODE` and `AWS_MAX_ATTEMPTS`, with defaults of `standard` and `3`. `max_attempts` is the **total number of attempts including the initial request**, so `3` means one initial request plus up to two retries, and `1` disables retries. The courseware's `4` is a valid value.

> — Source: [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.6 Credential Precedence and the Credential Provider Chain 🔄

The courseware presents two different precedence orders on two slides.

| Courseware slide 27 (credential order) | Courseware slide 28 (precedence order) |
|---|---|
| 1. Command-specific parameters<br>2. Environment variables<br>3. Shared credentials file<br>4. Shared config file<br>5. Instance profile | 1. Specified in code or the CLI<br>2. Environment variables<br>3. The default credentials profile in the credentials file<br>4. Instance profile |

Current documentation separates these into **two different concepts.**

#### Precedence of settings

The order in which global setting values are looked up. Higher entries win.

| Rank | Source |
|---|---|
| 1 | Any value set **explicitly in code or on a service client.** For the CLI and PowerShell, per-operation parameters on the command line |
| 2 | 🆕 **Java and Kotlin only**: the JVM system property for the setting |
| 3 | The environment variable |
| 4 | The shared `credentials` file |
| 5 | The shared `config` file. `AWS_PROFILE` or the `aws.profile` JVM system property specifies which profile to load |
| 6 | 🆕 Any **default value** provided by the SDK source code |

Putting "instance profile" at the end of this list mixes categories. An instance profile is not a settings source; it is a **credential provider.**

#### Credential provider chain

The sources an SDK checks in order to find valid credentials. **The search stops once valid credentials are found.** The chain varies by SDK but most often includes the following.

| Credential provider | Description |
|---|---|
| AWS access keys | An IAM user's `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` |
| Federate with web identity or OpenID Connect | Sign in with an external IdP and assume an IAM role using a JWT from AWS STS |
| 🆕 Login credentials provider | Get credentials for a new or existing console session that you are logged in to |
| 🆕 IAM Identity Center credential provider | Get credentials from AWS IAM Identity Center |
| Assume role credential provider | Retrieve and use temporary credentials for an IAM role |
| 🆕 Container credential provider | Credentials for containerized applications on Amazon ECS and Amazon EKS |
| Process credential provider | Get credentials from an external source or process, including IAM Roles Anywhere |
| IMDS credential provider | **Amazon EC2 instance profile.** Temporary credentials for the role are delivered through the instance metadata service |

🆕 When you use one of the standardized credential providers, **the SDKs always attempt to renew credentials automatically when they expire.** No additional code is required. This is the SDK handling what the courseware describes under temporary credentials as "requests made with expired credentials fail, so you must request a new set."

The environment variables the courseware lists are still valid: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

🔄 Two of the language-specific credential documents the courseware cites have moved.

| Language | Courseware link | Current |
|---|---|---|
| Java | `sdk-for-java/v1/developer-guide/credentials.html` | v1 reached end-of-support. [AWS SDK for Java 2.x credential provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html) |
| .NET | `sdk-for-net/v3/developer-guide/net-dg-config-creds.html` | Redirects to [AWS SDK for .NET credential assignment](https://docs.aws.amazon.com/sdk-for-net/latest/developer-guide/creds-assign.html) |
| Boto3 | `boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html` | Redirects to [Boto3 credentials](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html) |

> — Source: [AWS SDKs and tools settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html), [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html)

### 7.7 Signing Requests with SigV4

**AWS Signature Version 4 (SigV4)** is the AWS signing protocol for adding authentication information to AWS API requests. An access key consists of an access key ID and a secret access key.

#### Why requests are signed

| Purpose | Detail |
|---|---|
| Verify the identity of the requester | Confirms that the request was issued by someone with a valid access key ID and secret access key. If you use temporary credentials, the signature calculations **also require a security token** |
| Protect data in transit | Some request elements are used to calculate a hash (digest) that is included in the request. AWS recalculates the hash from the same information and compares. If the values do not match, AWS denies the request |
| Protect against replay attacks | 🔄 The courseware says "n minutes from the request timestamp, and the exact expiration period varies by service." Current documentation states that **in most cases a request must reach AWS within five minutes** of the timestamp in the request |

#### How requests are signed

Courseware items:

- Use the HTTP Authorization header
- Add query string values to the request
- **The SDK signs every request automatically** with the credentials you created

🆕 The SigV4 signing process has three steps.

1. Create a **canonical request** based on the request details.
2. Calculate a **signature** using your AWS credentials.
3. Add that signature to the request as an `Authorization` header.

**You do not use your secret access key directly to sign API requests.** You use the SigV4 signing process.

#### 🆕 SigV4a — asymmetric signing

Symmetric SigV4 requires deriving a key scoped to **a single AWS service, a single AWS Region, and a particular day.** That makes the signature different per Region and means you must know the Region the signature is destined for.

**Asymmetric Signature Version 4 (SigV4a)** is an extension that generates signatures **verifiable in more than one AWS Region.**

| Item | Detail |
|---|---|
| Algorithm | Public-private key cryptography. An ECDSA key pair is derived from your existing AWS secret access key |
| Key derivation | Uses **the same key to sign all requests** instead of deriving a distinct signing key per date, service, and Region |
| Verification | AWS stores **only your public keys** to verify signatures. Public keys are not secret and cannot be used to sign requests |
| When required | Asymmetric signatures are **required** for multi-Region API requests, such as with Amazon S3 Multi-Region Access Points |
| Switching | When you use an AWS SDK or the AWS CLI to invoke functionality that requires multi-Region signing, the signature type **changes to SigV4a automatically** without additional configuration |

For additional security, send requests over HTTPS. **When you use an AWS SDK, the AWS CLI, or a service-specific CLI, you do not need to sign requests explicitly.** You write signing code yourself only when you work with a language that has no AWS SDK, or you need complete control over how requests are sent.

🔄 Both URLs the courseware cites (`general/latest/gr/signature-version-4.html` and `general/latest/gr/signing_aws_api_requests.html`) now redirect to the SigV4 page in the IAM User Guide.

> — Source: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 7.8 IDE Considerations 🔄

Courseware slide items: JVM TTL settings, environment variables (the instructor notes add error retries and exponential backoff)

#### JVM TTL settings (Java) 🔄

The JVM caches DNS name lookups. When it resolves a hostname to an IP address, it caches that IP for a specified time to live (TTL). AWS resources use DNS name entries that occasionally change, so the TTL must be kept short.

| Item | Courseware | Current (AWS SDK for Java 2.x) |
|---|---|---|
| Recommended TTL | 60 seconds or less | **5 seconds** |
| What you set | Not specified | The `networkaddress.cache.ttl` **security property.** It is not a system property, so it cannot be set with the `-D` command-line flag |

On some Java configurations the JVM default TTL is set so that it **never refreshes DNS entries until the JVM is restarted.** In that state, if the IP address for an AWS resource changes, your application cannot use that resource until you manually restart the JVM.

Three ways to set it:

```java
// Option 1: Set it programmatically in your application (recommended).
// Call it early in startup, before any SDK clients are created and before any network requests.
import java.security.Security;

public class MyApplication {
    public static void main(String[] args) {
        Security.setProperty("networkaddress.cache.ttl", "5");

        // ... create SDK clients and run the application
    }
}
```

```ini
# Option 2: Set it in the java.security file.
# Java 8:  $JAVA_HOME/jre/lib/security/java.security
# Java 11+: $JAVA_HOME/conf/security/java.security
# Any negative value: cache forever. Any positive value: seconds to cache. Zero: do not cache.
networkaddress.cache.ttl=5
```

```bash
# Option 3: JDK system properties fallback, applied only when no security property is defined.
# These are JDK-internal properties documented as "may not be supported in future releases".
# Use Options 1-2 when possible.
java -Dsun.net.inetaddr.ttl=5 -Dsun.net.inetaddr.negative.ttl=1 -jar myapp.jar
```

#### Environment variables

Environment variables are another way to specify configuration options and credentials. They can be useful for scripting or setting a named profile as the default temporarily.

#### Error retries and exponential backoff 🔄

Numerous components on a network, such as DNS servers, switches, and load balancers, can generate errors anywhere in the life of a given request. One technique for dealing with these error responses is to implement retries in the client application, and each AWS SDK implements an **exponential backoff** algorithm for better flow control. The idea is to progressively increase the wait time between retries for consecutive error responses.

🆕 Retry behavior is now standardized into three modes.

| Item | Standard | Adaptive | Legacy |
|---|---|---|---|
| Retry quota | ✅ | ✅ | Varies by SDK |
| Can delay the initial request | ❌ | ✅ | ❌ |
| Error-type-specific backoff | ✅ | ✅ | Varies by SDK |
| Standardized across SDKs | ✅ | ✅ | ❌ |
| Recommendation | **Default for all workloads** | Single-resource, throttling-heavy, latency-tolerant | Backward compatibility only |

- **Standard mode** (the default) retries with exponential backoff plus jitter, using shorter delays for transient errors such as network timeouts and longer delays for throttling errors such as `ThrottlingException`. The **retry quota** is a token bucket that deducts a token per retry and replenishes on success. When tokens are exhausted, the SDK returns the error without retrying so the application fails fast. The quota affects only retries and never delays or blocks the initial request.
- **Adaptive mode** adds a **client-side rate limiter** on top of standard. It tracks throttling responses and adjusts the request rate, and unlike standard it can delay or block the *initial* request. The rate limiter operates per SDK client instance, so it is not recommended for clients that serve multiple resources or tenants.
- **Legacy mode** is the behavior each SDK used before standard mode, with no standardized retry quota, and the retry count, backoff timing, and retryable error sets differ by language. It is available in Java, Python, Ruby, PHP, C++, and the CLI, and not available in .NET, Go, Kotlin, Rust, Swift, or JavaScript. If you currently use legacy mode, AWS recommends switching to standard.

🆕 The behavior described in the documentation **requires opting in** until it becomes the default. Set `AWS_NEW_RETRIES_2026=true` in your environment. Without it, your SDK uses pre-2026 retry behavior, which differs in backoff timing, retry quota costs, and service-specific defaults.

🔄 The URL the courseware cites (`general/latest/gr/api-retries.html`) now redirects to the retry behavior page in the SDK reference guide.

> — Source: [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html), [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.9 Lab Instructions and Lab 1 🔄

#### How lab instructions are structured

- Each lab contains a series of tasks that make up the overall process.
- A task can include a multiple-choice question designed to check understanding.
- Tasks come at two levels. **High-level instructions** give hints without detailed steps, and **detailed instructions** walk through each step.

The example task 2, "Verify the configuration," from the courseware slide:

- Verify that Visual Studio and the AWS CLI are installed.
- Verify that the sample source folders and files are stored in `C:\temp\dotNET` and `C:\temp\dotNET\Solutions`.
- Use `aws configure` to verify that the Region value is set correctly.
- List the available application profiles.

#### The Lab 1 workflow

You connect to a sandbox environment, then verify that the appropriate tools are installed and configured to access AWS services. You review a specific IDE, learn how the AWS Toolkit works, and understand how permissions work with AWS IAM.

#### The AWS Cloud9 dependency 🔄

The courseware presents AWS Cloud9 as the development environment in three places.

| Location | Statement |
|---|---|
| Slide 2 instructor notes | "Lab 1: use AWS Cloud9 to configure and test IAM permissions in a development environment" |
| Slide 32 instructor notes | "Whether you use a third-party IDE or AWS Cloud9 as your development tool …" |
| Slide 38 instructor note | "In the current lab version, the Python lab is still deployed on Cloud9" |

What was verified: **AWS Cloud9 is no longer available to new customers.** Existing AWS Cloud9 customers can continue to use the service as normal. AWS points to **AWS IDE Toolkits or AWS CloudShell** as the migration path.

Practical implications:

- In an account that does not already use Cloud9, you cannot follow the courseware's Cloud9-based procedure as written. Confirm whether the lab environment is provided through an existing-customer account.
- If a lab only needs the CLI, AWS CloudShell can replace it. It runs directly from the console and is pre-authenticated, so the credential configuration step disappears (see [Section 2.4](#24-iam-users-and-long-term-access-keys)).
- If you need an IDE experience, installing the AWS Toolkit for VS Code, JetBrains, or Visual Studio locally remains an option (see [Section 7.4](#74-switching-profiles-in-an-ide)).

> — Source: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html), [How to migrate from AWS Cloud9 to AWS IDE Toolkits or AWS CloudShell](https://aws.amazon.com/blogs/devops/how-to-migrate-from-aws-cloud9-to-aws-ide-toolkits-or-aws-cloudshell/)

---

## 8. Changes from the Courseware

Items in the courseware (the instructor deck) that differ from current behavior. Students have the official courseware in front of them, so we keep a record of what changed and why.

### 8.1 Where the Courseware Is Factually Incorrect

| Item | Courseware | What was verified | Source |
|---|---|---|---|
| Demo bucket name | `aws s3 mb s3://DevonAWStest_bucket` | General purpose bucket names can consist only of lowercase letters, numbers, periods, and hyphens. The uppercase letters and underscore make this fail regardless of permissions | [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| Demo role name | `ContractorAccess`, `Contractors3access`, and `S3access` used interchangeably in the same demo | Must be standardized on `role/S3access`, which the policy's `Resource` points to, for the `sts:AssumeRole` allow to match | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| Demo account IDs | `111122223333`, `1234567891011` (13 digits), `111722413196`, and `112233445566` mixed. The policy's account and the command's `--role-arn` account do not match | Must be standardized on 12-digit documentation example accounts for the policy and command to line up | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| Temporary access key example | `export AWS_ACCESS_KEY_ID=AKIA####ODNN7EXAMPLE` | `AKIA` is the long-term access key prefix. Temporary keys returned by `assume-role` start with `ASIA` | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| JetBrains toolkit setup path | "The AWS Toolkit for JetBrains streamlines the process through the Eclipse Preferences window" | This mixes two different IDEs. The current path is AWS Connection Settings → Set up authentication → Authenticate with IAM | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| Instance profile in the precedence list | Lists "instance profile" as the last entry in the settings precedence order | An instance profile is not a settings source; it is a **credential provider.** The two concepts are documented separately | [Settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html) |
| "The most restrictive policy applies" | States that on conflict the most restrictive policy applies | The outcome is the same, but the precise rule is "an explicit deny takes precedence." AWS does not compare policy scopes; if a `Deny` exists at any layer, deny is fixed at that point | [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| SigV4 replay protection window | "n minutes from the request timestamp, and the exact expiration period varies by service" | In most cases a request must reach AWS within **five minutes** of the timestamp | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |

### 8.2 Where Behavior or Defaults Changed

| Item | Courseware | Current | Source |
|---|---|---|---|
| Number of policy types | "The two most common policy types are identity-based and resource-based" | **Nine**: identity-based, resource-based, VPC endpoint policies, permissions boundaries, SCPs, RCPs, ACLs, AWS RAM resource shares, and session policies | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| Evaluation logic | A two-step decision: explicit deny → explicit allow → deny | A defined order by layer: deny evaluation → RCPs → SCPs → resource-based → identity-based → permissions boundaries → session policies | [How AWS enforcement code logic evaluates requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| Root user requests | "Requests for resources in an account made with root credentials are always allowed" | True in a single account, but AWS Organizations SCPs and RCPs limit permissions **including each member account root user** | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| Creating IAM users | Creating an IAM user and attaching a policy is the default path | Human users should federate with an identity provider (IAM Identity Center recommended); workloads should use IAM roles. IAM users and long-term keys are limited to exceptional use cases | [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) |
| `PowerUserAccess` definition | `NotAction` excludes IAM and Organizations; only service-linked role creation is allowed as an exception | In default version v12, `account:*` was added to the exclusions and the allowed exceptions grew to nine actions | [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html) |
| Web identity federation | "Amazon, Facebook, Google, and OIDC-compatible providers" | Renamed **OIDC federation**, describing OIDC-compatible IdPs in general rather than specific social providers. For human user scenarios, consider Amazon Cognito as a broker | [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html) |
| AWS CLI output formats | json, yaml, text | **Six**: json (default), yaml, yaml-stream, text, table, off | [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html) |
| Credential providers | Command-specific parameters → environment variables → shared files → instance profile | The settings precedence (six levels, including JVM system properties for Java and Kotlin) and the credential provider chain (IAM Identity Center, container, IMDS, and others) are separate | [Standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) |
| Recommended JVM DNS TTL | 60 seconds or less | **5 seconds.** `networkaddress.cache.ttl` is a security property, so it cannot be set with the `-D` flag | [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html) |
| Retry behavior | Only the concept that each SDK implements exponential backoff | Standardized into standard (default), adaptive, and legacy modes. `max_attempts` defaults to 3 including the initial request. The 2026 behavior requires opting in with `AWS_NEW_RETRIES_2026=true` | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS Cloud9 (Lab 1, slide 32, slide 38) | **No longer available to new customers.** Existing customers can continue using it | AWS IDE Toolkits or AWS CloudShell | [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| AWS Toolkit for Eclipse (slide 26 link) | No separate documentation. The entire `toolkit-for-eclipse/v1/user-guide/` path the courseware cites redirects to the JetBrains toolkit documentation | AWS Toolkit for JetBrains, Visual Studio, or VS Code | [AWS Toolkit for JetBrains User Guide](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| AWS SDK for Java 1.x (slide 28 and 32 links) | **End-of-support on December 31, 2025** | AWS SDK for Java 2.x | [AWS SDK for Java 1.x getting started](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| Using IAM user long-term access keys as the default development path | Works but discouraged. Limited to exceptional use cases | IAM Identity Center, IAM roles, `aws login`, AWS CloudShell | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| Creating access keys for the root user | Strongly discouraged | Perform root tasks in the console. For programmatic access, use `aws login` with root credentials | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| SDK retry legacy mode | Backward compatibility only. Behavior is inconsistent across SDKs and there is no standardized retry quota | Standard mode | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| Service control policies (SCPs) and resource control policies (RCPs) | Set maximum permissions for principals and resources at the organization level. They grant no permissions and also apply to member account root users | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| VPC endpoint policies, session policies, AWS RAM resource shares | Policy types that participate in evaluation. Session policies are passed at role assumption time to narrow session permissions | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| Role session duration values | 900 to 43200 seconds, default 3600. Role chaining caps sessions at one hour | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| Cross-account dual evaluation | Evaluated separately in the trusted and trusting accounts, allowed only when **both return Allow** | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| Root user MFA requirement | All account types must configure root MFA, registered within 35 days of the first console sign-in attempt. Up to eight devices | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| IAM policy simulator | Evaluates identity-based policies, permissions boundaries, SCPs, and resource-based policies you provide, without sending a real request. Principal and Custom modes | [IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html) |
| IAM Access Analyzer | External, internal, and unused access analysis, policy validation (over 100 checks), custom policy checks, and CloudTrail-based policy generation | [Using IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html) |
| Last accessed information | Identifies unused permissions by service and action. Four-hour console latency, at least 400 days of service information tracking | [Refine permissions using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html) |
| SigV4a asymmetric signing | Signatures verifiable in multiple Regions. Required for S3 Multi-Region Access Points, with automatic switching by the SDKs and CLI | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| `aws login` | Generates short-term credentials from console credentials in AWS CLI version 2 | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| AWS CloudShell pre-authentication | Console sign-in credentials are used automatically in a new shell session. 1 GB of persistent storage per Region | [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html) |
| Access key prefix distinction | `AKIA` for long-term, `ASIA` for AWS STS temporary credentials | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| Permissions boundaries and `NotPrincipal` caution | For principals with a permissions boundary, `NotPrincipal` + `Deny` always denies. Use `ArnNotEquals` with `aws:PrincipalArn` | [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) |

### 8.5 Items That Could Not Be Verified

Left here honestly. Confirm these before stating them definitively in class.

| Item | Status |
|---|---|
| Whether the courseware demos actually reproduce | Each command and policy format in the demo procedures was confirmed against API documentation, but the demos were not executed to confirm that running them in the stated order produces the same success and failure results. Even after fixing the account ID and role name mismatches, prerequisites not described in the courseware (such as role trust policy setup) may be required |
| The current deployment form of Lab 1 | The slide 38 instructor note says "in the current lab version (as of September 24, 2026), the Python lab is still deployed on Cloud9." That Cloud9 is closed to new customers was confirmed, but which account the lab environment is provided through and whether Cloud9 actually opens could not be verified. Check the lab environment directly before teaching |
| The lab components in the courseware agenda | The slide 2 and 38 diagrams assume Guacamole, SSH, and Remote Desktop connections and CloudFormation provisioning. This lab infrastructure is not covered by official AWS documentation, so it is carried over as the courseware states it |
| The `api_versions` setting | The `api_versions` entries in the courseware `~/.aws/config` example (`ec2 = 2015-03-01`, `cloudfront = 2015-09-17`) could not be confirmed in current documentation. The `retry_mode`, `max_attempts`, and `s3` sub-settings in the same example were confirmed |
| The relationship between Amazon Q Developer and the IDE toolkits | The composition and naming of the AWS IDE toolkit family may be in flux. This document verified only the current validity of the toolkit documentation URLs the courseware cites, and did not treat product strategy changes as in scope |

---

## 9. Knowledge Check and Summary

### Knowledge Check (True/False)

The courseware questions and answers, carried over verbatim.

**Question 1**: A permissions boundary is used to set the **minimum** permissions that an identity-based policy can grant to an IAM entity such as a user or role.

- ❌ **Answer: False** — A permissions boundary sets the **maximum** permissions that an identity-based policy can grant to an IAM entity.

**Question 2**: IAM roles generally delegate temporary access to users or services that do not have access to AWS resources.

- ✅ **Answer: True**

**Question 3**: An identity-based policy grants a specified principal permission to perform specific actions on a resource and defines the conditions under which those permissions apply.

- ❌ **Answer: False** — A **resource-based policy** grants a specified principal permission to perform specific actions on that resource and defines the conditions under which those permissions apply.

**Question 4**: The AWS CLI supports multiple profiles for interacting with AWS resources.

- ✅ **Answer: True**

**Question 5**: Temporary credentials do not need to be rotated or explicitly revoked after they expire.

- ✅ **Answer: True**

**Question 6**: The config and credentials files contain additional settings that can be stored in the operating system's environment variables.

- ✅ **Answer: True**

### 🆕 Supplementary Questions (Checking the Updated Material)

**Question 7**: You can determine whether a request will be allowed by looking only at identity-based policies and permissions boundaries.

- ❌ **Answer: False** — Up to nine policy types participate in evaluation. AWS Organizations SCPs and RCPs, resource-based policies, session policies, and VPC endpoint policies can all change the outcome. An explicit deny at any layer fixes the decision as deny. (See [Section 3.1](#31-policy-types) and [Section 5.4](#54-how-the-aws-enforcement-code-evaluates-a-request))

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

**Question 8**: For a user in Account A to access an S3 bucket in Account B, the bucket policy in Account B only needs to allow Account A.

- ❌ **Answer: False** — A cross-account request is evaluated in both accounts and is allowed only when **both return `Allow`.** The identity-based policy in Account A must also allow the request to that resource. (See [Section 4.3](#43-role-example-2-cross-account-access))

> — Source: [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)

**Question 9**: Even inside AWS Organizations, a member account's root user can always access resources in that account.

- ❌ **Answer: False** — SCPs limit permissions for principals in member accounts **including each AWS account root user**, and RCPs also affect the effective permissions for identities including the root user. You can also remove the root credentials from a member account entirely. (See [Section 5.5](#55-is-the-root-user-always-allowed))

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

**Question 10**: Attaching only a permissions boundary lets a user perform the actions that boundary allows.

- ❌ **Answer: False** — A permissions boundary **does not grant permissions.** You must attach a permissions policy separately, and the effective permissions are the intersection of the two. (See [Section 3.4](#34-permissions-boundaries))

> — Source: [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html)

**Question 11**: Calling `sts:GetCallerIdentity` requires a permission that allows that action.

- ❌ **Answer: False** — **No permissions are required** for this operation. You can perform it even if an administrator explicitly denies it, because the same information is returned when access is denied. (See [Section 6.2](#62-demo-testing-role-assumption-in-the-aws-management-console))

> — Source: [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html)

**Question 12**: A session obtained with `aws sts assume-role` is valid for 12 hours by default.

- ❌ **Answer: False** — The **default for `DurationSeconds` is 3600 seconds (1 hour).** The valid range is 900 to 43200 seconds, and exceeding the role's maximum session duration setting (1 to 12 hours) causes the operation to fail. Role chaining caps it at one hour. (See [Section 4.6](#46-role-session-duration))

> — Source: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

**Question 13**: Storing an IAM user's access keys with `aws configure` is the currently recommended way to access AWS from a development environment.

- ❌ **Answer: False** — Human users are recommended to use temporary credentials through federation with an identity provider, and AWS IAM Identity Center is recommended for centralized management. For local development, `aws login` and AWS CloudShell are also alternatives. (See [Section 2.4](#24-iam-users-and-long-term-access-keys))

> — Source: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

**Question 14**: To validate a policy before applying it to a live environment, you must send a request to the target service and observe the result.

- ❌ **Answer: False** — The IAM policy simulator returns the evaluation result **without sending a real request.** Because results can differ from the live environment, AWS recommends confirming there after testing. IAM Access Analyzer policy validation can be used alongside it. (See [Section 6.3](#63-validating-permissions-without-making-a-call))

> — Source: [IAM policy testing with the IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html)

### Confirming the Module Objectives

After completing this module, you should be able to do the following:

- ✅ Review the features and components of AWS Identity and Access Management (AWS IAM)
- ✅ Configure permissions to support a development environment
- ✅ Demonstrate how to test IAM permissions
- ✅ Configure an IDE and SDK to support a development environment
- ✅ Demonstrate access to AWS services using an SDK
