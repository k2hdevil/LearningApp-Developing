# Module 4: Getting Started with Permissions

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [IAM Refresher](#2-iam-refresher)
3. [Policies and Permissions](#3-policies-and-permissions)
4. [IAM Roles and Temporary Security Credentials](#4-iam-roles-and-temporary-security-credentials)
5. [IAM Policy Evaluation Logic](#5-iam-policy-evaluation-logic)
6. [Testing Permissions](#6-testing-permissions)
7. [Configuring the Development Environment and IDE](#7-configuring-the-development-environment-and-ide)
8. [Changes from the Courseware](#8-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Example access key IDs have **characters 5-8 masked with `#`**, as in `AKIA####ODNN7EXAMPLE`, to keep credential scanners from mistaking them for real keys. The four-character prefixes (`AKIA`, `ASIA`) are kept because the distinction is part of the material.
> - Verified on: August 25, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

This module covers how to configure AWS permissions to support your development environment. It has two parts. The first (Sections 2-6) walks through IAM's authentication and authorization model and confirms how permissions are actually evaluated. The second (Section 7) covers connecting those permissions to your development environment, that is, configuring credentials and setting up the IDE and SDKs.

### What This Module Lets You Do

- Identify the characteristics and components of AWS Identity and Access Management (AWS IAM)
- Configure permissions to support a development environment
- Demonstrate how to test IAM permissions
- Configure the IDE and SDKs to support a development environment
- Demonstrate accessing AWS services using an SDK

In the labs you configure the development environment where the IDE, AWS tools and SDKs, and the AWS CLI run on an EC2 instance, AWS CloudFormation provisions the environment, and AWS IAM (IAM roles, AWS STS) governs Amazon S3 access.

---

## 2. IAM Refresher

### 2.1 What IAM Is

AWS Identity and Access Management (IAM) is a web service that securely controls users' access to AWS resources.

| Use | Detail |
|---|---|
| Authentication | Controls **who** can use AWS resources |
| Authorization | Controls **how** a user can use AWS resources |

- An application needs permissions for users, the users' development environment, and AWS resources.
- Granting yourself access grants it not only to you but also to other team members who need development and management access to the application.
- With IAM you can configure a development environment to access multiple AWS accounts efficiently.
- IAM credentials give a resource access to resources in your AWS account or another AWS account.

### 2.2 IAM Terms and Concepts

First sort out **who and what** the application needs access for, then decide the IAM configuration.

| Term | Description | Example |
|---|---|---|
| User | An entity you create in AWS to represent a person or application that uses access to interact with AWS | Mary, Mateo |
| Group | A collection of IAM users, often organized by job function. Lets you specify permissions for several users at once | Administrators, Developers, DevOps |
| Policy | Defines permissions for an action regardless of how it is performed. You attach customer managed or AWS managed policies | AdministratorAccess, DatabaseAdministrator, Billing |
| Role | A trusted entity with a permissions policy, similar to an IAM user, but **with no long-term credentials attached.** An IAM user assumes a role with temporary credentials for a role session | AWS service roles, EC2 instances, external users |

Policies are further divided by how they are managed.

| Category | Description |
|---|---|
| AWS managed policy | A managed policy that AWS creates and manages |
| Customer managed policy | A managed policy you create and manage in your AWS account. Allows finer control than AWS managed policies |
| Inline policy | A policy added directly to a single user, group, or role. The policy and identity are bound 1:1, and deleting the identity deletes the policy with it |

Resource-based policies **exist only as inline policies.** There are no managed resource-based policies.

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 2.3 How IAM Works

IAM provides the infrastructure needed to control authentication and authorization for a service. A request goes through these steps.

```text
  Principal ── sign in ──▶ Authentication ──▶ Request ──▶ Authorization
   root/IAM user/role/                                     │  check applicable policies for allow/deny
   federated user                                          │  (3a: cross-account via resource-based policy)
                                                            ▼
                                          Approve action/operation ──▶ Perform on resource
                                          (e.g. s3:CreateBucket)          (e.g. an S3 bucket)
```

Information included in the request:

| Item | Detail |
|---|---|
| Action/operation | The action/operation the principal is trying to perform |
| Resource | The AWS resource object the action/operation is performed on |
| Principal | The person or application that sent the request using an entity (user or role) |
| Environment data | IP address, user agent, whether SSL is enabled, time of day |
| Resource data | Data related to the requested resource |

AWS gathers this information into the **request context** and then evaluates it.

🆕 The authentication step is not always required. For services that allow some anonymous requests, such as Amazon S3, the authentication step is skipped.

> — Source: [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 2.4 IAM Users and Long-Term Access Keys 🔄

Attaching an identity-based policy to an IAM user and authenticating to the API with an access key and secret key is a conceptually valid path. But **the default path AWS currently recommends is not IAM users and long-term access keys.**

| Target | Current recommendation |
|---|---|
| Human users (including developers) | **Federation** with an identity provider for temporary credentials. **AWS IAM Identity Center** is recommended for centralized access management |
| Workloads (applications, back ends) | Temporary credentials from an **IAM role.** On AWS compute such as EC2 and Lambda, AWS delivers the role's temporary credentials to the resource, so there is no need to distribute long-term credentials |
| Workloads running outside AWS | IAM Roles Anywhere (X.509 certificates), `AssumeRoleWithSAML`, `AssumeRoleWithWebIdentity`, mTLS in AWS IoT Core |
| When an IAM user or root user is truly required | **Require MFA.** Use phishing-resistant MFA such as passkeys or security keys where possible |

Use cases that still need long-term access keys do exist: workloads that cannot use IAM roles (for example a WordPress plugin), third-party AWS clients that do not support IAM Identity Center, CodeCommit access, Amazon Keyspaces access, and so on. In those cases the recommendation is to rotate and delete keys safely based on **last used information.**

🆕 You can tell the credential type from the access key ID prefix.

| Prefix | Meaning |
|---|---|
| `AKIA` | A **long-term** access key of an IAM user or the AWS account root user |
| `ASIA` | An access key of **temporary** credentials created by an AWS STS operation |

The secret access key **can only be downloaded at creation time.** If you lose it, you must create a new one.

🆕 Alternatives for local development:

- **`aws login`** — In AWS CLI version 2, get short-term credentials from console credentials to run CLI commands.
- **AWS CloudShell** — A browser-based **pre-authenticated** shell that launches straight from the console. The AWS credentials you used to sign in to the console are used automatically in the new shell session, so you do not need to configure credentials to work with AWS services using AWS CLI version 2. It provides 1 GB of persistent storage per Region in your home directory.

> — Source: [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)

### 2.5 Mandatory Root User MFA 🆕

The root user needs protection. The following now applies.

| Item | Detail |
|---|---|
| MFA configuration | **Every AWS account type (standalone, management, member) must configure MFA on the root user.** If MFA is not already enabled, the user must register MFA **within 35 days of the first attempt to access the AWS Management Console** |
| Number of MFA devices | You can register up to **8** MFA devices in combination on the root user. AWS recommends registering several for resilience |
| MFA types | FIDO-certified hardware security keys, hardware TOTP tokens, virtual MFA applications |
| Root access keys | **Strongly recommended not to create them.** The root user has full access to all services and resources in the account, including billing. If programmatic access is needed, use `aws login` with root credentials |
| Member accounts | For multiple accounts managed with AWS Organizations, it is recommended to **remove member accounts' root credentials.** You can remove the root password, access keys, and signing certificates and disable and delete MFA, after which the member account cannot sign in as root or recover the root password |

> — Source: [Root user best practices for your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### 2.6 Deciding on Authentication and Authorization

Access management starts with setting up users and groups to protect resources. It also includes connecting to other identity services to grant external users access to AWS resources. Questions to ask when designing secure application access:

- Which users or services need access to build, manage, or interact with the application?
- What level of access (policies and permissions) does the application environment need?
- Which roles are a good fit for the application?
- Does every user always need full access to every service? How will you manage IAM principals?

Example job functions: developer, support, DB administrator, quality control, DevOps.

---

## 3. Policies and Permissions

### 3.1 Policy Types 🔄

AWS supports **nine** policy types. In order of how often they are used:

| Policy type | Attached to | Grants permissions | Role |
|---|---|---|---|
| Identity-based policy | IAM users, groups, roles | ✅ Grants | Defines what an identity can do. Managed or inline |
| Resource-based policy | Resources (S3 buckets, IAM role trust policies, and so on) | ✅ Grants | Grants permissions to the principals named in the policy. Inline only |
| 🆕 VPC endpoint policy | VPC endpoints | ❌ Restricts | Controls which principals can use the endpoint and which resources they can reach. An extra boundary that applies only to traffic through the endpoint |
| Permissions boundary | IAM entities (users, roles) | ❌ Restricts | Sets the **maximum permissions** an identity-based policy can grant the entity |
| 🆕 Service control policy (SCP) | AWS Organizations root, OU, account | ❌ Restricts | Defines the maximum permissions for the **IAM users and roles** in the organization's accounts |
| 🆕 Resource control policy (RCP) | AWS Organizations root, OU, account | ❌ Restricts | Defines the maximum permissions for the **resources** in the organization's accounts |
| Access control list (ACL) | Resources (S3, AWS WAF, Amazon VPC, and so on) | ✅ Grants | Grants access to principals in other accounts. **The only policy type that does not use JSON.** Cannot be used to control principals within the same account |
| 🆕 AWS RAM resource share | Shared resources | ✅ Grants | Shares resources by account, OU, or organization without writing a resource-based policy per resource |
| 🆕 Session policy | Role sessions, federated user sessions | ❌ Restricts | Passed at the moment of assuming a role or federating. Restricts the permissions of that session |

In summary, the policies that **grant permissions** are identity-based, resource-based, ACL, and RAM share, and the rest are policies that **cut down the ceiling of already-granted permissions.** Do not attach only a ceiling policy and expect permissions to appear.

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

### 3.2 Identity-Based Policies

To grant an IAM user access to AWS services, you either attach an identity-based policy directly when creating the IAM user, or make them a member of a **user group** that has an appropriate permissions policy attached. Making them a group member keeps permissions managed in one place.

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

The reason the two statements are separate is worth noting. `s3:ListBucket` is a **bucket** action, so its resource is `arn:aws:s3:::notes`, while `s3:*Object` is an **object** action, so its resource is `arn:aws:s3:::notes/*`. Merging the ARNs into one does not work.

### 3.3 Resource-Based Policies

A resource-based policy is attached to an AWS resource such as an Amazon S3 bucket. It **grants the named principals** permission to perform specific actions on that resource and defines the conditions under which those permissions apply.

The following example denies permission to perform Amazon S3 actions on the objects in the specified S3 bucket unless the request originates from the specified IP address range.

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

🆕 The only resource-based policy the IAM service supports is the **role trust policy.** Because an IAM role is both an identity and a resource that supports a resource-based policy, a role must have **both a trust policy and an identity-based policy** attached. The trust policy defines which principals can assume the role.

🆕 A terminology distinction: a **resource-based policy** and **resource-level permissions** are different. The former is a policy attached directly to a resource, and the latter is the ability to specify individual resources by ARN in a policy.

> — Source: [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)

### 3.4 Permissions Boundaries

A permissions boundary is an advanced IAM feature.

- It sets the **maximum permissions** an identity-based policy can grant an IAM entity such as a user or role.
- An entity can perform **only the actions allowed by both its identity-based policy and its permissions boundary.** The **intersection** of the two is the effective permission.
- A permissions boundary **does not grant permissions on its own.** You must attach a permissions policy separately.
- You can use an AWS managed or customer managed policy as the boundary.

For example, granting `PowerUserAccess` to a developer group lets its members access several services, but attaching a permissions boundary that allows only CloudWatch to a new member means that user **cannot perform** actions in Amazon S3, because it is outside the permissions boundary. That boundary is as follows.

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

🆕 Practical use: AWS recommends permissions boundaries as a means of **delegating permissions management within an account.** For example, you let developers create and manage their own workload roles while capping the permissions you delegate with a boundary.

🆕 Caution: For an IAM user or role that has a permissions boundary attached, do not use the `NotPrincipal` + `Deny` combination in a resource-based policy. Regardless of what you put in the `NotPrincipal` value, **every IAM principal that has a permissions boundary attached is denied.** Use the `ArnNotEquals` condition operator with the `aws:PrincipalArn` context key instead.

> — Source: [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### 3.5 The PowerUserAccess Managed Policy 🔄

`PowerUserAccess` is an AWS managed policy that uses a `NotAction` element to allow actions on all AWS services and resources except a few. Its current definition (default version v12) has the following exclusions and exception allow list.

| Item | Current (default version v12) |
|---|---|
| `NotAction` exclusions | `iam:*`, `organizations:*`, `account:*` |
| Actions allowed as exceptions | `iam:CreateServiceLinkedRole`, `iam:DeleteServiceLinkedRole`, `iam:ListRoles`, `organizations:DescribeEffectivePolicy`, `organizations:DescribeOrganization`, `account:GetAccountInformation`, `account:GetGovCloudAccountInformation`, `account:GetPrimaryEmail`, `account:ListRegions` |
| Description | "Provides full access to AWS services and resources, but does not allow management of users and groups" |

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

`PowerUserAccess` corresponds to the **Developer power user** job function among the job-function AWS managed policies.

> AWS managed policies are built for all customers, so they **do not grant least privilege.** The recommended path is to use them as a starting point, then narrow to a customer managed policy once you understand the permissions actually used.

> — Source: [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html), [AWS managed policies for job functions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html)

### 3.6 Service Control Policies and Resource Control Policies 🆕

When you manage multiple accounts with AWS Organizations, there are two kinds of organization-wide guardrails. Unlike a permissions boundary, which sets a ceiling within an account, these operate at the organization level.

| Category | Service control policy (SCP) | Resource control policy (RCP) |
|---|---|---|
| Restricts | **Principals** in an account (IAM users and roles) | **Resources** in an account |
| Attachment points | Organization root, OU, account | Organization root, OU, account |
| Grants permissions | ❌ Does not | ❌ Does not |
| Root user | Restricts the requests of all principals **including a member account's root user** | Affects the effective permissions on resources, including identities **including the root user**, regardless of organization membership |
| Prerequisite | All features enabled in the organization | All features enabled in the organization |

AWS recommendation: separate workloads across multiple accounts, and set principal guardrails with SCPs and resource guardrails with RCPs. **But SCPs and RCPs alone do not grant permissions.** To grant permissions, you must attach an identity-based or resource-based policy.

🆕 When you enable RCPs, an AWS managed policy named `RCPFullAWSAccess` is automatically created and attached to every entity in the organization (the root, each OU, each account) and **cannot be detached.** So there is always one `Allow` statement in the RCP layer.

> — Source: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## 4. IAM Roles and Temporary Security Credentials

### 4.1 Do You Always Need an IAM User Account?

You **use a role** in these situations:

- An existing IAM user temporarily needs special permissions?
- The identity exists outside AWS (a corporate user directory or a web identity provider)?
- You need to assign temporary access to a user or application?
- Not every user really needs permanent IAM credentials?

There are cases where you must temporarily delegate access to a user or service that has no access to AWS resources. A user in one AWS account may need to access resources in another account, or a mobile app may use AWS resources. But **it is a bad idea to store AWS keys in an application when they are hard to rotate and users may be able to extract them.**

### 4.2 Role Example 1: Assuming a Role Within the Same Account

- A user can assume a role and **temporarily** hold the different permissions attached to that role.
- **A role has no credentials (password or access key) attached.**
- Instead of being uniquely tied to one person, a role is built so that **anyone who needs it can assume it.**
- Example: a user in the developer group assumes a database administrator role to get DynamoDB table write permission that the group policy does not have.

🆕 There are two ways to let a user assume a role within the same account, and **you only need one of them.**

| Method | Detail |
|---|---|
| Identity-based policy | Attach a policy to the user that allows the `sts:AssumeRole` call (as long as the role's trust policy trusts that account) |
| Role trust policy | Add the user directly as a principal in the role's trust policy |

This is because the role trust policy acts as an IAM resource-based policy. When a resource-based policy grants access to a principal in the **same account**, no additional identity-based policy is needed.

> — Source: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.3 Role Example 2: Cross-Account Access

IAM roles also allow cross-account access.

- An organization may have multiple AWS accounts to isolate development and production environments.
- A user attached to a group is granted permission to switch roles within the development account to request access to a role in the production account.
- The user **switches (console)** or **assumes (AWS CLI)** the role, gets temporary credentials, and changes the production environment.

The flow (a development account user → a role in the production account):

```text
  1) user credentials
  2) request access to the role
  3) temporary credentials are granted and returned
  4) update the S3 bucket in the production account with the role credentials
```

🆕 With cross-account, **allowing on one side alone is not enough.** The actual requirements are as follows.

| Account | Role | What is needed |
|---|---|---|
| Trusted account A — where the principal is | Requester | The **identity-based policy** must allow the request to the resource in account B |
| Trusting account B — where the resource is | Resource owner | The **resource-based policy** must name the principal in account A and allow access |

AWS evaluates a cross-account request **twice** and allows it **only when both evaluations are `Allow`.**

Using a role differs from other resource-based policies. A principal that has assumed a role can access **multiple resources** in that account with the resulting temporary credentials, and the scope is determined by the role's identity-based permissions policy.

> — Source: [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)

### 4.4 Role Example 3: Service Roles

- A service such as an AWS Lambda function can assume a role that lets it perform operations on a DynamoDB table on your behalf.
- This is called a **service role.**
- You can customize the session duration ([Section 4.6](#46-role-session-duration)).

### 4.5 Temporary Security Credentials and AWS STS

To request **limited-permission temporary security credentials** for an IAM user or a user authenticated through identity federation, use **AWS Security Token Service (AWS STS).**

| Characteristic | Detail |
|---|---|
| Used for a short time | You can specify the expiration interval. A service request sent with expired credentials fails, so you must request a new set |
| The basis for roles | Temporary credentials are the basis for roles |
| Not stored on the requester side | Not stored with the user; generated dynamically only on request and provided |
| Not reusable | Cannot be used again after expiry |
| Federation support | Can be issued to a user signed in through an external identity provider |

Benefits of temporary credentials:

- No need to distribute or embed long-term AWS credentials in the application.
- You can provide AWS resource access without defining the user's AWS credentials.
- Because they cannot be reused after expiry, there is **no need to rotate them or revoke them explicitly.**

🆕 The components of a temporary credential set:

| Field | Detail |
|---|---|
| `AccessKeyId` | The access key ID. Temporary credentials start with `ASIA` |
| `SecretAccessKey` | The secret access key |
| `SessionToken` | The session token. **Its size is not fixed.** It is usually under 4,096 bytes, but the documentation says not to assume a maximum size |
| `Expiration` | The expiration time |

Besides these `Credentials`, an `AssumeRole` response also includes `AssumedRoleUser` (the ARN and ID of the assumed role session), `PackedPolicySize`, and `SourceIdentity`.

🆕 The AWS STS API can be called on a **global endpoint or a Regional endpoint.** Choosing a nearby endpoint reduces latency, and when you cannot communicate with the original endpoint you can route the call to another Regional endpoint. With an AWS SDK you follow the SDK's Region specification; if you build the HTTP request yourself, you must send it to the correct endpoint directly.

> — Source: [Request temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_request.html), [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.6 Role Session Duration 🆕

You set the duration of a role session as follows.

| Item | Value |
|---|---|
| `DurationSeconds` valid range | 900 seconds (15 minutes) to 43200 seconds (12 hours) |
| Default | **3600 seconds (1 hour)** |
| The role's maximum session duration setting | Set by an administrator between 1 hour and 12 hours |
| If the value requested exceeds the ceiling | The operation **fails.** For example, requesting 12 hours when the administrator set 6 hours fails |
| Role chaining | AWS CLI and AWS API role sessions are limited to **a maximum of 1 hour.** In a role-chaining state, a `DurationSeconds` over 1 hour makes the operation fail |

🆕 You can narrow the session permissions further with session policies. You can pass one inline session policy or up to 10 managed policy ARNs, and in both cases the plaintext length cannot exceed 2,048 characters. The resulting session's permissions are the **intersection of the role's identity-based policy and the session policy**, and **a session policy cannot grant more permissions than the role allows.**

🆕 With temporary credentials created by `AssumeRole`, you cannot call AWS STS `GetFederationToken` and `GetSessionToken`.

> — Source: [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

### 4.7 OIDC Federation 🔄

The feature for authenticating with an external identity provider is now called **OIDC federation**, and instead of listing specific social providers it is described in terms of **OIDC-compatible IdPs in general.**

| Item | Detail |
|---|---|
| Name | OIDC federation |
| Supported targets | OIDC-compatible IdPs in general, such as GitHub Actions |
| Behavior | Authenticate with the IdP to get a JSON Web Token (JWT) and exchange it for AWS temporary security credentials. The identity is mapped to an IAM role that can perform only the necessary actions |
| Supported scenarios | Both machine-to-machine authentication (CI/CD pipelines, automation scripts, serverless applications) and human user authentication |
| Recommendation for human user scenarios | If you need to manage sign-up, sign-in, and user profiles, consider using **Amazon Cognito as an identity broker** |
| Clock-skew tolerance | Even after the `exp` claim expiry time in the JWT, IAM allows a **5-minute** window to account for clock skew |

The intent, authenticating with an external IdP without writing custom login code or managing your own user credentials, still holds.

> — Source: [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html)

---

## 5. IAM Policy Evaluation Logic

### 5.1 Best Practices

- Apply policies to groups.
- Use the principle of least privilege.
- Policies are in **JSON, so you can use them in a version control system.**
- Define the minimum access for each user, group, and role, then customize access to specific resources with authorization policies.

### 5.2 Evaluation Rules

| # | Rule |
|---|---|
| 1 | By default, all requests are denied (implicit deny) |
| 2 | An explicit allow overrides this default |
| 3 | An explicit deny overrides any allow |

### 5.3 Evaluation Logic Diagram

```text
Evaluate all applicable policies.
        │
        ▼
  Explicit deny? ──── yes ──▶ Deny (explicit deny)
        │
        no
        │
        ▼
  Explicit allow? ─── yes ──▶ Allow
        │
        no
        │
        ▼
      Deny (implicit deny)
```

- All policies applied to an IAM entity are evaluated.
- **The order in which policies are evaluated does not affect the result.**
- If there is an explicit deny statement, the final decision is deny.
- If there is an allow statement, the final decision is allow.
- If there is no allow statement, the final decision is deny.
- Any action not explicitly allowed is denied, and any action explicitly denied is always denied.

> 🔄 This is sometimes summarized as "when there is a conflict, the most restrictive policy applies," but the precise rule is "**an explicit deny wins.**" It is not a matter of comparing the scope of two allow policies and choosing the narrower one; if there is even one `Deny` at any layer, the final decision is fixed as deny at that point. For the detailed order, see [Section 5.4](#54-the-evaluation-order-of-the-aws-enforcement-code).

### 5.4 The Evaluation Order of the AWS Enforcement Code 🆕

The two-step diagram above accurately summarizes the conclusion, but the actual enforcement code follows a set order by policy type. The order itself affects the result.

| Step | Layer | Condition to pass | If it does not pass |
|---|---|---|---|
| 0 | Default | — | All requests are **implicitly denied.** The one exception is that the **AWS account root user has full access** |
| 1 | Deny evaluation | Look for a `Deny` statement in all applicable policies (SCP, RCP, resource-based, identity-based, permissions boundary, session policy) | If **even one** `Deny` applies, **Deny** is fixed immediately |
| 2 | AWS Organizations RCP | An RCP must have an applicable `Allow` statement | If none, **Deny** |
| 3 | AWS Organizations SCP | An SCP must have an applicable `Allow` statement | If none, **Deny** |
| 4 | Resource-based policy | Depends on the principal type. For most resources, an explicit `Allow` in **either** the identity-based or the resource-based policy is enough | Continue |
| 5 | Identity-based policy | There must be a statement allowing the requested action | If none, implicit deny → **Deny** |
| 6 | Permissions boundary | The boundary policy must allow the requested action | If it does not allow it, implicit deny → **Deny** |
| 7 | Session policy | If the principal is not a session principal, **Allow** here. If it is a session principal and there is no session policy, a default session policy is created and **Allow** | If a session policy exists and does not allow the action, **Deny** |

Exceptions to watch for:

- **IAM role trust policies and AWS KMS key policies are exceptions.** They must **explicitly allow** access to the principal. Services other than IAM and AWS KMS may also require an explicit `Allow` within the same account, so check that service's documentation.
- In the same account, when a resource-based policy grants permission directly to an **IAM user ARN** or a **session principal** (a role session, an AWS STS federated user), it is **not restricted by the implicit deny** of identity-based policies, permissions boundaries, or session policies.
- By contrast, when a resource-based policy grants permission to a **role ARN** (`arn:aws:iam::111122223333:role/examplerole`), it is restricted by the implicit deny of permissions boundaries and session policies. When you assume a role and make a request, the actual principal is not the role itself but the **role session ARN** (`arn:aws:sts::111122223333:assumed-role/examplerole/examplerolesessionname`).

The results of combining layers:

| Combination | Result |
|---|---|
| Identity-based + resource-based (same account) | **Union.** If either allows, it is allowed |
| Identity-based + permissions boundary | **Intersection** |
| Identity-based + SCP/RCP (a resource with no resource-based policy) | **All three policy types must allow** it |
| Any combination | An **explicit deny at either side overrides an allow** |

> — Source: [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

### 5.5 Is the Root User Always Allowed? 🔄

From a single-account perspective, a request with root credentials to that account's resources is always allowed. The current documentation also states, as the exception to the default implicit deny, that "**the AWS account root user has full access.**"

But **within AWS Organizations this is not so.**

| Policy | Effect on the root user |
|---|---|
| Service control policy (SCP) | Restricts permissions for principals in member accounts, **including each AWS account root user** |
| Resource control policy (RCP) | Restricts permissions on member-account resources and can affect the effective permissions of identities **including the root user**, regardless of organization membership |

Also, in member accounts managed with AWS Organizations you can remove the root credentials themselves. Once removed, that member account cannot sign in as root or recover the root password ([Section 2.5](#25-mandatory-root-user-mfa)).

In short, the root user's full access is **true in a single account, false within an organization.**

> — Source: [Policies and permissions in AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [How AWS enforcement code logic evaluates requests to allow or deny access](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html)

---

## 6. Testing Permissions

### 6.1 Demo: Testing a Permissions Boundary (AWS CLI)

This demo confirms with the CLI how a permissions boundary cuts down a group policy. `userwithpermissionboundary` is a member of the developer group, and the group allows S3 bucket creation through `PowerUserAccess`. But this user has a permissions boundary attached that does not support Amazon S3 access.

Prerequisite — the AWS CLI must be configured with multiple profiles.

| Category | Value |
|---|---|
| Users | `userwithpermissionboundary`, `userwithiamaccess` |
| Group: developers | Permissions policy = `PowerUserAccess` / member = `userwithpermissionboundary` |
| Group: administrators | Permissions policy = `AdministratorAccess` / member = `userwithiamaccess` |
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

Demo procedure:

```bash
# 1) Try to create a bucket with the userwithpermissionboundary profile → fails
#    The group policy allows it, but the permissions boundary does not allow s3.
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary

# 2) Check the permissions boundary attached to the user
#    → arn:aws:iam::111122223333:policy/S3restricted
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 3) Check the maximum access level that boundary allows
aws iam get-policy-version \
  --policy-arn arn:aws:iam::111122223333:policy/S3restricted \
  --version-id v1

# 4) With another user that has elevated permissions, swap the boundary to S3elevated
aws iam put-user-permissions-boundary \
  --permissions-boundary arn:aws:iam::111122223333:policy/S3elevated \
  --user-name userwithpermissionboundary \
  --profile userwithiamaccess

# 5) Confirm the boundary changed
aws iam get-user --user-name userwithpermissionboundary --profile userwithiamaccess

# 6) Retry creating the bucket as the same user → succeeds
aws s3 mb s3://bucketfordevonawsdemo05122021 --profile userwithpermissionboundary
```

🆕 The `PutUserPermissionsBoundary` API parameters are `PermissionsBoundary` (a managed policy ARN, 20-2048 characters) and `UserName` (a friendly name, not an ARN, 1-64 characters), and **both are required.** This API documentation also states that "a policy used as a permissions boundary provides no permissions, so **you must attach a permissions policy separately.**" In the demo, `PowerUserAccess` attached to the group plays that permissions-policy role.

> The account IDs in the demo are unified to the documentation example `111122223333`. AWS account IDs are 12 digits.

> — Source: [PutUserPermissionsBoundary](https://docs.aws.amazon.com/IAM/latest/APIReference/API_PutUserPermissionsBoundary.html), [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html)

### 6.2 Demo: Testing Role Assumption (AWS Management Console) 🔄

This demo signs in to the console as a contractor user granted only AWS CloudShell access and shows the difference in results before and after assuming a role. It is an example of using a role within the same organization.

| Category | Value |
|---|---|
| User | Contractor / attached policy = none |
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

Demo procedure:

```bash
# 1) Sign in to the console as Contractor, launch CloudShell, and try to create a bucket → fails
#    CloudShell is pre-authenticated, so you do not configure credentials separately.
aws s3 mb s3://devonawstest-bucket

# 2) Check which credentials the call is currently made with
#    You can call this even without permissions.
aws sts get-caller-identity

# 3) Assume the role to receive temporary security credentials.
aws sts assume-role \
  --role-arn "arn:aws:iam::111122223333:role/S3access" \
  --role-session-name DevOnAWS

# 4) Export the Credentials values from the response as environment variables.
#    The temporary access key ID starts with ASIA.
export AWS_ACCESS_KEY_ID=ASIA####ODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=<SessionToken>

# 5) Confirm the role was assumed
#    The Arn changes to arn:aws:sts::111122223333:assumed-role/S3access/DevOnAWS.
aws sts get-caller-identity

# 6) Retry creating the bucket with the assumed role → succeeds
aws s3 mb s3://devonawstest-bucket
```

Values adjusted so this demo can actually run:

| Item | Adjusted value | Reason |
|---|---|---|
| Bucket name | `devonawstest-bucket` | General purpose bucket names can use only **lowercase letters, numbers, periods (`.`), and hyphens (`-`).** Uppercase letters and underscores fail regardless of permissions |
| Role name | `S3access` | Aligned the role name the policy's `Resource` points to with the command's `--role-arn` |
| Temporary access key | `ASIA` prefix | The temporary key returned by `assume-role` starts with `ASIA` (`AKIA` is a long-term key) |
| Account ID | `111122223333` | The policy's `Resource` and the command's `--role-arn` must point to the same account for the `sts:AssumeRole` allow to match |

🆕 `GetCallerIdentity` **requires no permissions.** Even if an administrator attaches a policy that explicitly denies `sts:GetCallerIdentity`, you can still perform this action, because the same information is returned even when access is denied. The response has three fields.

| Field | Detail |
|---|---|
| `Account` | The AWS account ID that owns or contains the calling entity |
| `Arn` | The ARN of the calling entity. An IAM user is `arn:aws:iam::111122223333:user/Alice`, an assumed role is `arn:aws:sts::111122223333:assumed-role/my-role-name/my-role-session-name` |
| `UserId` | The unique identifier of the calling entity |

That is why it is a good first command when debugging a permissions problem. It runs even without permissions, and you can immediately confirm whether the role was assumed from the shape of the `Arn`.

> — Source: [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html), [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 6.3 Tools That Validate Permissions Without a Call 🆕

Instead of calling a real API, seeing the failure, and tracing back the cause, it is safer in production to validate without calling.

#### The IAM policy simulator

The policy simulator tests identity-based policies, IAM permissions boundaries, service control policies (SCPs), and resource-based policies you provide. It simulates how AWS would evaluate the request **without sending an actual request to any AWS service.** For each action and resource it returns a binary allowed-or-denied result, and for an allow or an explicit deny it even shows **which policy produced that result.**

| Mode | Use |
|---|---|
| Principal mode | Tests the policies **already attached** to an existing IAM user, role, or group. You can include or exclude custom identity policies or permissions boundaries in the simulation only, and the account is not changed |
| Custom mode | Tests policies you write or paste that are not yet attached. Not stored in the account |

Know the limitations before using it.

- The simulator results **may differ from the real AWS environment.** AWS recommends confirming in the real environment after testing with the simulator.
- It does not use the real context key values from production and does not actually run the action, so there is no service response.
- Only one permissions boundary can be simulated **at a time.**
- SCPs report allow or deny, but for security they **do not reveal the matched statement** the way other policy types do.
- Except in the console, it does not fetch a resource's policy for you. To include a resource-based policy, you must provide it along with the resource.

#### IAM Access Analyzer

| Feature | Detail |
|---|---|
| External access analyzer | Identifies whether an organization's or account's resources are shared with external entities. Analyzes resource-based policies with logic-based reasoning and generates a finding per instance |
| Internal access analyzer | Identifies internal access to selected resources |
| Unused access analyzer | Identifies unused access in an organization or account |
| Policy validation | Validates IAM policies against policy grammar and AWS best practices. Provides **more than 100 policy checks** and actionable recommendations, shown as you author or edit a policy in the console |
| Custom policy checks | Validates policies against a security standard you specify |
| Policy generation | Generates fine-grained policies based on access activity recorded in AWS CloudTrail logs |

Operational characteristics:

- When you turn on an analyzer, you designate the organization or account as the **zone of trust.** Access by principals within the zone of trust is considered trusted.
- When you add or change a policy, it is analyzed within about **30 minutes.** If a notification is missed, it is analyzed in the next periodic scan (within 24 hours).
- **External access analyzes only resources in the Region where the analyzer is turned on.** To see all resources, you must create an external access analyzer per Region you use. Unused access is Region-independent, so it does not need one per Region.

#### Last accessed information

Used to find and remove over-granted permissions. You can query it for identities and policies that exist in IAM or AWS Organizations.

| Item | Detail |
|---|---|
| Information type | Allowed **AWS service** information and allowed **action** information. Includes the date and time of AWS API access attempts |
| Console reflection time | Recent activity appears in the IAM console within **4 hours** |
| Tracking period | Service information for **at least 400 days.** Action-information tracking start dates are Amazon S3 April 12, 2020, Amazon EC2/IAM/Lambda April 7, 2021, and all other services May 23, 2023 |
| Attempts recorded | Includes **all attempts, not only successful ones.** All of the console, SDK, and CLI paths apply. Seeing an unexpected entry does not mean the account was compromised (the request may have been denied). The authoritative source for success or denial is CloudTrail logs |
| Exclusions | `iam:PassRole` is not tracked. Action information for data-plane events is not provided either |
| AWS Organizations | Signing in with management-account credentials lets you see information about the services SCPs allow, by organization root, OU, and account |

You can **continuously monitor** this information with the unused access analyzer.

> — Source: [IAM policy testing with the IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html), [Using AWS Identity and Access Management Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html), [Refine permissions in AWS using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html)

---

## 7. Configuring the Development Environment and IDE

### 7.1 Setting Up the Development Environment

A developer performing application development tasks must configure their tools to fit the requirements. Configuration is covered in the order of credentials (in order of precedence), profiles, environment variables, and temporary credentials.

A **named profile** is a collection of settings and credentials you can apply to an AWS CLI command. When you specify the profile to run a command under, that command uses those settings and credentials.

### 7.2 Setting Up Credentials 🔄

The basic procedure is as follows.

1. Run `aws configure` in the terminal.
2. Paste the AWS access key ID, then paste the AWS secret access key.
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

The AWS CLI now supports **six** formats.

| Format | Detail |
|---|---|
| `json` | A JSON string. **The AWS CLI default** |
| `yaml` | A YAML string |
| 🆕 `yaml-stream` | Streams YAML output. Processes large data faster |
| `text` | Tab-delimited multiple lines. Good for piping to `grep`, `sed`, `awk` |
| 🆕 `table` | A table with cell borders made from `+|-` characters. Easy for humans to read but unsuitable for program processing |
| 🆕 `off` | Suppresses all stdout output. Useful for automation scripts and CI/CD pipelines that only need the exit code |

There are three ways to set the format, and lower items win: the `output` key in the `config` file → the `AWS_DEFAULT_OUTPUT` environment variable → the command-line `--output` option.

🆕 The output format changes `--query` behavior. `--output text` paginates **before** applying `--query` and runs the query per page, so the first matching element of each page is all included, which can produce more output than expected. `json`, `yaml`, and `yaml-stream` process the whole thing as one structure and then run the query **only once.**

> Storing long-term access keys in a file with `aws configure` is the basic procedure, but for the current recommended path see [Section 2.4](#24-iam-users-and-long-term-access-keys). For local development, consider `aws login` or IAM Identity Center first.

> — Source: [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html)

### 7.3 Switching Between Multiple Accounts with Named Profiles

- With the AWS CLI you can configure multiple named profiles as collections of settings and credentials.
- Named profiles let you **switch between accounts, users, roles, and Regions.**
- IDEs such as VS Code, Eclipse, Visual Studio, and JetBrains support named profiles.
- The AWS CLI and the IDE use the default user unless you switch the profile.
- To add a profile, run `aws configure --profile <name>`.

An example of creating S3 buckets in two accounts:

```bash
# Account 111122223333 (default profile)
aws s3 mb s3://mybucket

# Account 444455556666 (user1 profile)
aws s3 mb s3://mybucket --profile user1
```

### 7.4 Switching Profiles in the IDE 🔄

Profile switching is also supported in the IDE with the AWS Toolkit. A developer can switch profiles within the IDE to deploy a Lambda function to multiple accounts.

The current credential-setup path for the JetBrains toolkit is **AWS Connection Settings → Set up authentication → Authenticate with IAM → the AWS Toolkit: Setup Authentication dialog.** Entering the profile name, access key ID, and secret access key there adds and connects the profile in the config file.

🆕 Cautions the JetBrains toolkit documentation states:

- If you already set up IAM credentials by another path such as the AWS CLI, the toolkit **detects them automatically** and uses them.
- AWS **recommends IAM Identity Center authentication.**
- To avoid security risks, when developing purposeful software or handling real data, **do not authenticate as an IAM user;** use federation with an identity provider such as IAM Identity Center.

🔄 **The AWS Toolkit for Eclipse no longer has separate documentation.** The entire `toolkit-for-eclipse/v1/user-guide/` path now redirects to the JetBrains toolkit documentation.

| IDE | Current documentation |
|---|---|
| JetBrains | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| Visual Studio | [Credentials — Toolkit for Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/keys-profiles-credentials.html) |
| Visual Studio Code | [Setup credentials — Toolkit for VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/setup-credentials.html) |
| Eclipse | No separate documentation. The link redirects to the JetBrains toolkit documentation |

> — Source: [AWS IAM credentials — AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html)

### 7.5 Settings and Environment Variables

- The config and credentials files include additional settings that can be stored in the operating system's environment variables.
- Only one set of environment variables can apply at a time, but environment variables are modified dynamically as the program runs and requirements change.
- **Global settings affect all services.** Environment variables affect only the AWS SDKs and tools.
- You can also store Amazon S3-related settings in the config file.

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
```

🆕 `retry_mode` and `max_attempts` are still-valid shared `config` file keys. Their environment variables are `AWS_RETRY_MODE` and `AWS_MAX_ATTEMPTS`, with defaults `standard` and `3`. `max_attempts` is the **total number of attempts including the initial request**, so `3` means 1 initial request + 2 retries, and setting it to `1` disables retries.

> — Source: [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.6 Credential Precedence and the Credential Provider Chain 🔄

Where settings values are read from (the precedence of settings) and where credentials are found (the credential provider chain) are **two different concepts.**

#### Precedence of settings

The order in which global setting values are read. Higher items win.

| Rank | Source |
|---|---|
| 1 | A value **set explicitly** in code or on the service client. In the CLI and PowerShell, the per-operation parameters on the command line |
| 2 | 🆕 **Java and Kotlin only**: the JVM system property for that setting |
| 3 | Environment variables |
| 4 | The shared `credentials` file |
| 5 | The shared `config` file. Specify the profile to load with the `AWS_PROFILE` environment variable or the `aws.profile` JVM system property |
| 6 | 🆕 A **default** built into the SDK source code |

An instance profile is not on this list. It is not a settings-value source but a **credential provider.**

#### The credential provider chain

The sources an SDK checks in order to find valid credentials. **When it finds valid credentials, it stops searching.** The chain differs by SDK but generally includes the following.

| Provider | Description |
|---|---|
| AWS access keys | An IAM user's `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Web identity / OpenID Connect federation | Sign in with an external IdP and assume an IAM role with a JWT from AWS STS |
| 🆕 Login credential provider | Uses the credentials of the signed-in console session (new or existing) |
| 🆕 IAM Identity Center credential provider | Obtains credentials from AWS IAM Identity Center |
| Assume-role credential provider | Receives and uses the temporary credentials of an IAM role |
| 🆕 Container credential provider | Credentials for Amazon ECS and Amazon EKS container applications |
| Process credential provider | Obtains credentials from an external source or process. Includes IAM Roles Anywhere |
| IMDS credential provider | **The EC2 instance profile.** Delivers the role's temporary credentials through the instance metadata service |

🆕 With standardized credential providers, **the SDK refreshes credentials automatically on expiry.** No extra code is needed. It means the SDK handles for you the part where a new set must be requested when temporary credentials expire.

For the detailed behavior of the credential provider chain per language, see each SDK's documentation.

| Language | Documentation |
|---|---|
| Java | [AWS SDK for Java 2.x credential provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html) |
| .NET | [AWS SDK for .NET credential assignment](https://docs.aws.amazon.com/sdk-for-net/latest/developer-guide/creds-assign.html) |
| Python (Boto3) | [Boto3 credentials](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html) |

> — Source: [AWS SDKs and tools settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html), [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html)

### 7.7 Request Signing with SigV4

**Signature Version 4 (SigV4)** is the AWS signing protocol that adds authentication information to an AWS API request. An access key consists of an access key ID and a secret access key.

#### Why sign

| Purpose | Detail |
|---|---|
| Verify the requester's credentials | Confirms that a principal with a valid access key ID and secret access key issued the request. With temporary credentials, the signature calculation also **needs a security token** |
| Protect data in transit | Computes a hash (digest) over some request elements and includes it, and AWS recomputes the hash from the same information and compares. If the values differ, it rejects the request |
| Defend against replay attacks | **In most cases the request must reach AWS within 5 minutes of the timestamp.** 🔄 |

#### How to sign

🆕 The SigV4 signing process has three steps.

1. Build a **canonical request** based on the request details.
2. Compute a **signature** with AWS credentials.
3. Add this signature to the request as the `Authorization` header. (It can also be added as a query string.)

**You do not use the secret access key directly to sign the request.** It goes through the SigV4 signing process. With credentials you created, **the SDK signs every request automatically.**

#### 🆕 SigV4a — Asymmetric Signing

Symmetric SigV4 derives a key scoped to **one service, one Region, one specific day.** So the signature differs by Region, and you must know the Region you are signing for.

**Asymmetric Signature Version 4 (SigV4a)** is an extension that produces a **signature verifiable in more than one AWS Region.**

| Item | Detail |
|---|---|
| Algorithm | Public/private key cryptography. Derives an ECDSA key pair from the existing AWS secret access key |
| Key derivation | Signs all requests with **the same key** instead of deriving a separate signing key per date, service, and Region |
| Verification | AWS stores **only the public key** of the key pair to verify the signature. The public key is not secret and cannot be used to sign |
| When required | Asymmetric signing is **required** for multi-Region API requests such as Amazon S3 multi-Region access points |
| Transition | Calling a feature that needs multi-Region signing with the AWS SDK or AWS CLI **switches to SigV4a automatically with no extra configuration** |

For additional security, send requests over HTTPS. **When using an AWS SDK, the AWS CLI, or a service-specific CLI, you do not need to sign requests explicitly.** You need to write signing code yourself only when using a language without an AWS SDK or when you need full control of request transmission.

> — Source: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 7.8 IDE Considerations 🔄

#### JVM TTL setting (Java) 🔄

The JVM caches DNS name lookups. When it resolves a host name to an IP address, it caches that IP for a period (TTL). AWS resources use DNS name entries that change from time to time, so you should keep the TTL short.

| Item | Current (AWS SDK for Java 2.x) |
|---|---|
| Recommended TTL | **5 seconds** |
| What to set | The `networkaddress.cache.ttl` **security property.** It is not a system property, so it cannot be set with a `-D` flag |

In some Java configurations the JVM default TTL is set to **never refresh DNS entries until the JVM restarts.** In that state, if an AWS resource's IP changes, the application cannot use that resource until you restart the JVM manually.

Three ways to set it:

```java
// Option 1: set programmatically in the application (recommended)
// Call it early at application startup, before creating an SDK client and before any network request.
import java.security.Security;

public class MyApplication {
    public static void main(String[] args) {
        Security.setProperty("networkaddress.cache.ttl", "5");

        // ... then create SDK clients and run the application
    }
}
```

```ini
# Option 2: set in the java.security file
# Java 8:  $JAVA_HOME/jre/lib/security/java.security
# Java 11+: $JAVA_HOME/conf/security/java.security
# A negative value caches forever, a positive value is seconds to cache, 0 means do not cache
networkaddress.cache.ttl=5
```

```bash
# Option 3: the JDK system property fallback (applies only when the security property is absent)
# It is a JDK-internal property documented as "may not be supported in a future release."
# Use options 1-2 where possible.
java -Dsun.net.inetaddr.ttl=5 -Dsun.net.inetaddr.negative.ttl=1 -jar myapp.jar
```

#### Error retries and exponential backoff 🔄

Network components such as DNS servers, switches, and load balancers can produce errors anywhere in a request's lifetime. The way to handle them is to implement retries in the client application, and each AWS SDK implements an **exponential backoff** algorithm for flow control. It progressively increases the wait between retries for consecutive error responses.

🆕 Retries are now standardized into three modes.

| Item | Standard | Adaptive | Legacy |
|---|---|---|---|
| Retry quota | ✅ | ✅ | Varies by SDK |
| Can delay the initial request | ❌ | ✅ | ❌ |
| Backoff by error type | ✅ | ✅ | Varies by SDK |
| Standardized across SDKs | ✅ | ✅ | ❌ |
| Recommended use | **The default for all workloads** | A single-resource target where throttling is frequent and latency is tolerable | Backward compatibility only |

- **Standard mode** (the default) retries with exponential backoff including jitter, using a short delay for transient errors (network timeouts) and a longer delay for throttling errors (`ThrottlingException`). The **retry quota** is a token bucket that debits a token per retry and refills it when a request succeeds. When tokens are exhausted, it returns an error without retrying, so the application fails fast.
- **Adaptive mode** adds a **client-side rate limiter** to Standard. It tracks throttling responses to regulate the request rate and can delay or block even the initial request. Because the rate limiter operates per SDK client instance, it is not recommended for clients that serve multiple resources or multiple tenants.
- **Legacy mode** is each SDK's behavior before Standard was introduced, with retry counts, backoff timing, and retried error types that differ by language. If you are on Legacy, switching to Standard is recommended.

🆕 The retry behavior described in the documentation **requires opt-in** until it becomes the default. Set `AWS_NEW_RETRIES_2026=true` in the environment. Without it, the pre-2026 behavior applies, with different backoff timing, retry-quota costs, and per-service defaults.

> — Source: [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html), [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html)

### 7.9 The Lab Environment and AWS Cloud9 🔄

The lab starts by connecting to a sandbox environment and confirming that the right tools are installed and configured to access AWS services. You examine a specific IDE, learn how the AWS Toolkit works, and understand how permissions work with AWS IAM.

The lab environment may use AWS Cloud9 as the development environment, and there is something to know. **AWS Cloud9 is no longer available to new customers.** Existing AWS Cloud9 customers can continue to use the service normally, and AWS points to **the AWS IDE toolkits or AWS CloudShell** as the migration path.

Practical implications:

- In an account that does not use Cloud9, you cannot follow the Cloud9-based procedure as-is. You need to confirm whether the lab environment is provided through an existing-customer account.
- For labs that need only the CLI, you can substitute AWS CloudShell. It runs straight from the console and is pre-authenticated, so the credential-configuration step disappears ([Section 2.4](#24-iam-users-and-long-term-access-keys)).
- If you need an IDE experience, the path of installing the AWS Toolkit for VS Code, JetBrains, or Visual Studio locally remains ([Section 7.4](#74-switching-profiles-in-the-ide)).

> — Source: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html), [How to migrate from AWS Cloud9 to AWS IDE Toolkits or AWS CloudShell](https://aws.amazon.com/blogs/devops/how-to-migrate-from-aws-cloud9-to-aws-ide-toolkits-or-aws-cloudshell/)

---

## 8. Changes from the Courseware

Since learners may have the official courseware in front of them, this section gathers in one place where this material diverges from it. The evidence behind every item marked new or corrected in the sections above is here.

### 8.1 Differences from the Courseware

| Item | What the courseware says | What is confirmed now | Source |
|---|---|---|---|
| Demo bucket name | `aws s3 mb s3://DevonAWStest_bucket` | General purpose bucket names can use only lowercase letters, numbers, periods, and hyphens. Uppercase letters and underscores fail regardless of permissions | [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| Demo role name | Mixes `ContractorAccess`, `Contractors3access`, and `S3access` in the same demo | Must be unified to `role/S3access`, which the policy's `Resource` points to, for the `sts:AssumeRole` allow to match | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| Demo account IDs | Mixes `111122223333`, `1234567891011` (13 digits), `444455556666`, `112233445566`. The policy's account and the command's `--role-arn` account disagree | Must be unified to a 12-digit example account ID for the policy and command to match | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| Temporary access key example | `export AWS_ACCESS_KEY_ID=AKIA####ODNN7EXAMPLE` | `AKIA` is a long-term access key prefix. The temporary key returned by `assume-role` starts with `ASIA` | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| JetBrains toolkit setup path | "The AWS Toolkit for JetBrains simplifies the process through the Eclipse Preferences window" | It mixes different IDEs. The current path is AWS Connection Settings → Set up authentication → Authenticate with IAM | [AWS IAM credentials — Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/setup-credentials.html) |
| Instance profile in the precedence list | Lists "instance profile" as the last item in the settings-value precedence list | An instance profile is not a settings-value source but a **credential provider.** The two concepts are separated | [Settings reference](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html) |
| "The most restrictive policy applies" | States that on a conflict the most restrictive policy applies | The result is the same, but the precise rule is "an explicit deny wins." It is not about comparing policy scope; if there is a `Deny` at any layer, deny is fixed at that point | [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| SigV4 replay-defense window | "n minutes from the request timestamp, and the exact period varies by service" | In most cases the request must reach AWS within **5 minutes** of the timestamp | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |

### 8.2 Changed Behavior and Defaults

| Item | What the courseware says | Current | Source |
|---|---|---|---|
| Number of policy types | "The two most common policy types are identity-based and resource-based" | **Nine**: identity-based, resource-based, VPC endpoint policy, permissions boundary, SCP, RCP, ACL, AWS RAM resource share, session policy | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| Evaluation logic | A two-step decision of explicit deny → explicit allow → deny | There is a set order by layer: deny evaluation → RCP → SCP → resource-based → identity-based → permissions boundary → session policy | [How AWS enforcement code logic evaluates requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html) |
| Root user requests | "A request with root credentials to that account's resources is always allowed" | True in a single account, but AWS Organizations SCPs and RCPs restrict permissions **including a member account's root user** | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| IAM user creation path | Creating an IAM user and attaching a policy is the default path | Human users should use identity-provider federation (IAM Identity Center recommended), and workloads should use IAM roles. IAM users and long-term keys are limited to exceptional use cases | [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) |
| `PowerUserAccess` definition | `NotAction` excludes IAM and Organizations, with service-linked role creation the only exception | In default version v12, `account:*` was added to the exclusions and the exception allow list grew to nine actions | [PowerUserAccess](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/PowerUserAccess.html) |
| Web identity federation | "Amazon, Facebook, Google, and OIDC-compatible providers" | Renamed to **OIDC federation**, described in terms of OIDC-compatible IdPs in general rather than specific social providers. For human user scenarios, consider Amazon Cognito as a broker | [OIDC federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_oidc.html) |
| AWS CLI output formats | json, yaml, text | **Six**: json (default), yaml, yaml-stream, text, table, off | [Setting the output format in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html) |
| Credential providers | Per-operation parameters → environment variables → shared files → instance profile | The settings-value precedence (six levels, with JVM system properties for Java and Kotlin) and the credential provider chain (IAM Identity Center, container, IMDS, and so on) are separated | [Standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) |
| JVM DNS TTL recommendation | 60 seconds or less | **5 seconds.** `networkaddress.cache.ttl` is a security property, so it cannot be set with a `-D` flag | [Set the JVM TTL for DNS name lookups](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/jvm-ttl-dns.html) |
| Retry behavior | Only the concept that exponential backoff is implemented | Standardized into three modes, standard (default), adaptive, and legacy. `max_attempts` defaults to 3 (including the initial request). The 2026 behavior requires opting in with `AWS_NEW_RETRIES_2026=true` | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS Cloud9 | **No longer available to new customers.** Existing customers can continue | The AWS IDE toolkits or AWS CloudShell | [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| AWS Toolkit for Eclipse | Has no separate documentation. The entire `toolkit-for-eclipse/v1/user-guide/` path redirects to the JetBrains toolkit documentation | The AWS Toolkit for JetBrains, Visual Studio, VS Code | [AWS Toolkit for JetBrains User Guide](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| AWS SDK for Java 1.x | **End of support December 31, 2025** | AWS SDK for Java 2.x | [AWS SDK for Java 1.x getting started](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| Using IAM user long-term access keys as the default development path | Works but discouraged. Limited to exceptional use cases | IAM Identity Center, IAM roles, `aws login`, AWS CloudShell | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| Creating root user access keys | Strongly discouraged | Perform root actions in the console. For programmatic access, use `aws login` with root credentials | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| SDK retry legacy mode | Backward compatibility only. Behavior is inconsistent across SDKs and it has no standard retry quota | standard mode | [Retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html) |

### 8.4 What This Material Adds

Each item was added because it is needed to understand IAM permissions at a practical level.

| Added item | Why it was added | Source |
|---|---|---|
| Service control policies (SCPs) and resource control policies (RCPs) | A permissions boundary alone cannot explain the guardrails of a multi-account environment, so we added them. They set the maximum permissions for principals and resources at the organization level, do not grant permissions, and apply even to member-account root | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| VPC endpoint policies, session policies, AWS RAM resource shares | Knowing only two policy types makes the actual evaluation result unpredictable, so we added these. A session policy is passed at role assumption to narrow the session permissions | [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) |
| Role session duration figures | "You can customize it" alone does not let you set a value in practice, so we added it. 900-43200 seconds, default 3600 seconds, and up to 1 hour with role chaining | [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) |
| Cross-account double evaluation | Added to explain why cross-account access fails with a policy on only one side. It is allowed only when both sides are Allow | [Cross-account policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html) |
| Mandatory root user MFA | Added because root protection is now mandatory and affects lab accounts too. Registration within 35 days of the first console sign-in attempt, up to 8 devices | [Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html) |
| The IAM policy simulator | A safer validation method than calling for real, seeing the failure, and tracing back, so we added it. It evaluates policies without sending an actual request | [IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html) |
| IAM Access Analyzer | A practical tool for continuously checking whether granted permissions are actually safe, so we added it. External, internal, and unused access analysis and 100+ policy checks | [Using IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html) |
| Last accessed information | The evidence data for finding excessive permissions and narrowing to least privilege, so we added it. Console reflection in 4 hours, service-information tracking for at least 400 days | [Refine permissions using last accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html) |
| SigV4a asymmetric signing | The signing method you meet with multi-Region requests, so we added it. Required for S3 multi-Region access points and switched automatically by SDKs and the CLI | [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| `aws login` and AWS CloudShell pre-authentication | The current recommended local development path that does not store long-term keys in a file, so we added it. CloudShell uses the console sign-in credentials automatically and provides 1 GB of storage per Region | [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html) |
| Access key prefix distinction | Practical knowledge for telling at a glance whether a credential is long-term or temporary, so we added it. `AKIA` is long-term, `ASIA` is AWS STS temporary | [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| The permissions boundary and `NotPrincipal` caution | A pitfall commonly hit in practice, so we added it. For a principal with a permissions boundary, `NotPrincipal` + `Deny` always acts as a deny, so use `ArnNotEquals` + `aws:PrincipalArn` | [Permissions boundaries for IAM entities](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) |

### 8.5 Items We Could Not Verify

We leave these here honestly. Confirm them before stating anything definitive in class.

| Item | Status |
|---|---|
| Whether the demos are actually reproducible | We confirmed each command and policy format in the demo procedures against API documentation, but we did not run them in order to verify the same success or failure results. Even after fixing the account-ID and role-name mismatches, prerequisites not described in the courseware, such as trust policy setup, may be needed |
| The current deployment form of lab 1 | We could not confirm whether Python labs are still deployed on Cloud9 in the lab environment. We confirmed that Cloud9 is not available to new customers, but check directly in the lab environment before class which account it is provided through and whether Cloud9 actually opens |
| The lab infrastructure setup | The Guacamole/SSH/Remote Desktop connections and CloudFormation provisioning the agenda diagram assumes are not something AWS official documentation verifies, so we carried them over as written |
| The `api_versions` setting | The `api_versions` entry in the `~/.aws/config` example (`ec2 = 2015-03-01`, `cloudfront = 2015-09-17`) could not be confirmed in the current documentation. The `retry_mode`, `max_attempts`, and `s3` sub-settings were confirmed |
| Changes to the AWS IDE toolkit family | The composition and naming of the toolkit family may be changing. This document confirmed only the current validity of the toolkit documentation URLs cited, and did not include product-strategy changes in its verification scope |
