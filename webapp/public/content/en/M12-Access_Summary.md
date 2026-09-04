# Module 12: Granting Access to Your Application Users

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Authentication and Authorization](#2-authentication-and-authorization)
3. [Amazon Cognito](#3-amazon-cognito)
4. [Creating a User Pool](#4-creating-a-user-pool)
5. [Attributes, Groups, and Scopes](#5-attributes-groups-and-scopes)
6. [Tokens](#6-tokens)
7. [Identity Pools](#7-identity-pools)
8. [Securing API Access](#8-securing-api-access)
9. [Implementation Best Practices](#9-implementation-best-practices)
10. [The Application and Lab 6](#10-the-application-and-lab-6)
11. [Changes from the Courseware](#11-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Section 11](#11-changes-from-the-courseware) for what changed and how.
> - Verified on: September 1, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.
> - Terminology has been standardized. The same thing is sometimes called by several names, and when tokens are listed this document always uses the order **ID → Access → Refresh** ([Section 11.1](#111-differences-from-the-courseware)).

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Explore the authentication process using Amazon Cognito
- Manage user access and authorize serverless APIs
- Observe Amazon Cognito implementation best practices
- Demonstrate Amazon Cognito integration and review JWT tokens

The third item, **implementation best practices**, is only named and has no corresponding explanation in the original class material. This document fills that gap in [Section 9](#9-implementation-best-practices) with best practices verified against official documentation.

### Where This Module Sits

This module is the second module on day 3. It is where users are attached to the API and application built in the previous modules, and it leads directly into Lab 6 (the capstone).

| Item | Content |
|---|---|
| Module 11 | Building a modern application — microservices and the serverless operating model |
| **Module 12** | **Granting access to application users** — Review how Amazon Cognito controls access to AWS resources |
| Module 13 | Deploying your application |
| Lab 6 | Capstone - Completing the application build (authenticating users with Amazon Cognito) |

### What This Module Covers

This module is divided into ten topics. This document follows the same order.

| Topic | In this document |
|---|---|
| Title · agenda · module objectives | [Section 1](#1-module-overview) |
| The complexity of authentication and authorization | [Section 2](#2-authentication-and-authorization) |
| Amazon Cognito | [Section 3](#3-amazon-cognito) |
| Managing user access | [Section 4](#4-creating-a-user-pool) · [Section 5](#5-attributes-groups-and-scopes) |
| Granting access to your application through user pools | [Section 6](#6-tokens) |
| Granting access to your application through identity pools | [Section 7](#7-identity-pools) |
| Securing API access | [Section 8](#8-securing-api-access) |
| Demonstration | [Section 10.4](#104-demonstration-notes) |
| Lab 6: Capstone - Completing the application build | [Section 10](#10-the-application-and-lab-6) |
| Summary | [Section 2.4](#24-terminology) |

The original material for this module is **diagram driven**, with almost no code examples. This document fills in the areas it does not address at all (authentication flow names, feature plans, token revocation, JWT verification, quotas) from official documentation.

### 1.1 The Biggest Changes in This Module 🆕

A great deal has been added to or changed in Amazon Cognito since the class. Six things you will run into first are listed up front. The source for each item is in the corresponding section.

| What changed | Previously | Current |
|---|---|---|
| Feature plans | The concept does not exist | Each user pool has a **Lite · Essentials · Plus** plan and the default for a new user pool is **Essentials**. Passkeys, email MFA, password history, threat protection, and access token customization all depend on the plan ([Section 3.5](#35-feature-plans-lite-essentials-plus)) |
| Name of the sign-in page | "hosted UI" | Two branding versions: **managed login** (current) and **hosted UI (classic)** (the predecessor) ([Section 3.4](#34-sign-in-pages-managed-login-and-hosted-ui-classic)) |
| Advanced security features | "Protect your users with advanced security features" | Renamed **threat protection** and available only on the **Plus plan** ([Section 3.8](#38-threat-protection)) |
| Authentication flows | One line, "supports authentication flows." No flow name is given | You must choose the permitted flows through the app client's `ExplicitAuthFlows`, and the later **choice-based sign-in (`USER_AUTH`)** is the only entry point for passwordless sign-in and passkeys ([Section 4.7](#47-authentication-flows)) |
| JWT payload | "encrypted information" | The payload of an ID or access token is **not encrypted. It is base64url encoded and signed.** What is encrypted is the refresh token ([Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example)) |
| Identity pool flow | `GetOpenIdToken` + `AssumeRoleWithWebIdentity` | Those two APIs are the **basic (classic) flow**. The documentation recommends the **enhanced flow** (`GetId` → `GetCredentialsForIdentity`) as the most secure choice with the least developer effort ([Section 7.4](#74-the-enhanced-flow-and-the-basic-classic-flow)) |

> — Source: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

> — Source: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

> — Source: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

---

## 2. Authentication and Authorization

### 2.1 Authentication Versus Authorization

The two concepts sit side by side.

| Concept | What it does | Means |
|---|---|---|
| Authentication | Confirms the user's identity | HTTP authentication / login prompt / custom methods |
| Authorization | Confirms that the user may perform the requested action | Access control / permission tools / protecting data and operations |

Example authorized actions are posting a note, editing a note, and deleting a note. Those three actions become the Pollynotes API in [Section 10](#10-the-application-and-lab-6). In short, users must prove their credentials before they can perform the action they want, and user credentials are integrated into the application.

The official documentation's definitions run the same direction. Authentication is the process of establishing genuine credentials for the purpose of accessing an information system, and authorization is the process of granting permissions to a resource.

> — Source: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

### 2.2 Three Things a Modern Application Must Handle

There are three areas developers have to take on themselves, and each turns back into a question you answer at design time.

| Area | What to handle | Design question |
|---|---|---|
| User identities | Limited to my application / users / guests | Are users created locally in the application, or federated from another source? How does the application handle guest access? |
| Authentication schemes | Single sign-on (SSO) / integrating multiple providers / 2FA and MFA / federated users | Select and configure the appropriate service that can support your application |
| Frameworks | SAML 2.0 / OAuth 2.0 / OpenID Connect (OIDC) / tokens (for example JWT) | Which protocols and methods must the service use to implement your user security solution? |

These three areas are the security responsibilities and challenges developers face when implementing a solution, and Amazon Cognito is the solution that addresses this authentication and authorization for your application.

Here is where each of the three areas leads in this document.

| Area | In this document |
|---|---|
| User identities | [Section 4](#4-creating-a-user-pool) (local users) · [Section 4.12](#412-third-party-idp-federation) (federation) · [Section 7.3](#73-guest-access) (guests) |
| Authentication schemes | [Section 4.5](#45-multi-factor-authentication-mfa) · [Section 4.7](#47-authentication-flows) · [Section 4.8](#48-passwordless-sign-in-and-passkeys) |
| Frameworks | [Section 2.3](#23-the-role-amazon-cognito-plays-in-each-standard) · [Section 5.5](#55-the-three-oauth-20-grants) · [Section 6](#6-tokens) |

### 2.3 The Role Amazon Cognito Plays in Each Standard 🆕

Listing SAML 2.0, OAuth 2.0, and OIDC by name alone does not distinguish what user pools and identity pools do in each standard. The official documentation states the roles explicitly. Missing this distinction leaves "why does a user pool issue tokens while an identity pool issues credentials" permanently blurred.

| Component | Role in the standards | What it receives and what it issues |
|---|---|---|
| User pool | A **service provider (SP) / relying party (RP)** toward external IdPs, and an **OIDC identity provider and OAuth 2.0 authorization server** toward your app | Receives SAML assertions / OIDC ID tokens / social provider tokens, and issues its own ID, Access, and Refresh tokens |
| Identity pool | A **token exchange layer** in front of AWS STS | Receives trusted claims from SAML 2.0 assertions, OIDC ID tokens, and OAuth 2.0 social providers, and issues temporary AWS credentials |

The five roles in the user pool features table are as follows.

| Role | Content |
|---|---|
| OIDC identity provider | Issues ID tokens to authenticate users |
| Authorization server | Issues access tokens to authorize API access |
| SAML 2.0 service provider | Converts SAML assertions into ID and Access tokens |
| OIDC relying party | Converts OIDC tokens into ID and Access tokens |
| Social provider relying party | Converts ID tokens from Apple, Facebook, Amazon, and Google into its own ID and Access tokens |

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 2.4 Terminology 🔄

Three terms defined against the official documentation: OAuth 2.0, OIDC, and JWT. Two places that differ from some source material have been corrected.

| Term | Definition |
|---|---|
| OAuth 2.0 | The spelling is **OAuth 2.0**. Lets a website or application access information through another website or application without sharing passwords. An OAuth 2.0 (social) provider is an IdP that provides JWT access and refresh tokens |
| OpenID Connect (OIDC) | An identity layer on top of OAuth that enables SSO scenarios and uses ID, access, and refresh tokens. An OIDC provider is an IdP that **extends the OAuth specification to provide ID tokens** |
| JSON web token (JWT) | **A JSON-formatted document containing claims about an authenticated user.** The ID token authenticates the user, the access token authorizes the user, and the refresh token renews credentials |

Some source material defines a JWT as "a JSON object for **uniqueness** of security information," which appears to be a typo for "a JSON object for **sharing** secret information." A description of claims as "a payload with encrypted user information" also appears, and that statement is corrected in [Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example).

Other terms used often in this module, with the documentation's definitions:

| Term | Definition |
|---|---|
| Authorization server | An OAuth or OIDC system that generates JWTs |
| Service provider (SP) / relying party (RP) | An application that relies on an IdP asserting that a user can be trusted. Amazon Cognito acts as an SP toward external IdPs and as an IdP toward app-based SPs |
| UUID | A 128-bit label applied to an object. Amazon Cognito UUIDs are unique per user pool or identity pool, but they **do not follow any particular UUID format (including RFC UUID), so you must not validate the format strictly** |
| Identity | A UUID that links an app user and that user's credentials to a profile in an external user directory that has a trust relationship with the identity pool |

> — Source: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

---

## 3. Amazon Cognito

### 3.1 What Amazon Cognito Is 🔄

Amazon Cognito is often summarized as "provides authentication, authorization, and user management for your web and mobile apps." More precisely, it is an **identity platform** for web and mobile apps: a user directory, an authentication server, and an authorization service for OAuth 2.0 access tokens and AWS credentials.

| Item | Content |
|---|---|
| What it is | An identity platform for web and mobile apps. User directory + authentication server + authorization service |
| Who it authenticates | Users in the built-in user directory, users in enterprise directories, and users from consumer identity providers such as Google and Facebook |
| Components | User pools and identity pools. They **operate independently or in tandem** depending on your user access needs |

The three headline features commonly cited are below. The items themselves run the same direction as the current documentation; only the compliance list and the name "advanced security features" need correcting ([Section 3.7](#37-compliance) · [Section 3.8](#38-threat-protection)).

| Feature | Description |
|---|---|
| Identity store | An identity store for all your apps and users. Sign-in with social identity providers and SAML 2.0 enterprise identity providers |
| Access control | With identity pools you can create methods to grant users access to AWS resources |
| Compliance | Supports several compliance programs. Protect your users with advanced security features |

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.2 Two Components: User Pools and Identity Pools 🔄

The two components can be separated with a question, and that approach still holds.

| Question | Component | Role |
|---|---|---|
| Do you need to verify the user's identity? | **User pool** | Authentication: sign-up and sign-in |
| Do you need to issue **temporary AWS credentials** to the user? | **Identity pool** | Authorization: grant the user access to other AWS services |

> Some source material writes the second question as "do you need to grant the user **AWS access keys**?" What the documentation describes is **temporary AWS credentials**. "Access keys" can be confused with an IAM user's long-term access keys, so this document changed the wording.

The features of the two components, following the documentation's comparison table. The rows where the check mark moves are exactly the design decision points.

| Feature | User pool | Identity pool |
|---|---|---|
| User directory — store user profiles for authentication | ✅ | — |
| OIDC identity provider | ✅ | — |
| Authorize API access | ✅ | — |
| Customize tokens | ✅ | — |
| IAM web identity authorization | — | ✅ |
| Unauthenticated (guest) access | — | ✅ |
| Role-based access control (RBAC) | — | ✅ |
| Attribute-based access control (ABAC) | — | ✅ |

Summarizing each component with three characteristics maps to the documentation as follows.

| Component | Summary | Read against the documentation |
|---|---|---|
| User pool | Manage a user directory / hosted UI / standard tokens | A directory holding profiles for local and federated users / **managed login or hosted UI (classic)** ([Section 3.4](#34-sign-in-pages-managed-login-and-hosted-ui-classic)) / **ID, Access, and Refresh tokens** issued on the basis of the OIDC standard ([Section 6.2](#62-comparing-the-three-tokens)) |
| Identity pool | AWS credentials / federated identities / unauthenticated guests | Temporary credentials from AWS STS / a store of user identifiers linked to external IdPs / guest access ([Section 7.3](#73-guest-access)) |

There is one important caveat. **A user pool does not require integration with an identity pool, and an identity pool does not require integration with a user pool.** A user pool alone can issue the JWTs your app, web server, or API needs. If you do not need to call AWS services directly from the client, you do not have to create an identity pool at all.

> — Source: [Amazon Cognito user pools and identity pools comparison](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.3 Using Both Together 🆕

In the flow for using both together, **which token goes to which API is often missing.** Filled in from the documentation, it is three steps.

| Step | Content |
|---|---|
| 1 | The app user signs in with the user pool and receives OAuth 2.0 tokens (ID, Access, Refresh) |
| 2 | The app presents the **user pool ID token** to the identity pool to exchange it for temporary AWS credentials. In the enhanced flow, `GetId` returns an identity ID, and the app sends that identity ID combined with the same ID token to `GetCredentialsForIdentity` |
| 3 | The app assigns that credential session to the user to provide authorized access to AWS services such as Amazon S3 and Amazon DynamoDB. These credentials are **valid for one hour** |

The same flow as a diagram:

```text
User
  │  (1) sign in
  v
User pool ---- issues ID / Access / Refresh tokens
  │
  │  (2) present ID token  (GetId -> GetCredentialsForIdentity)
  v
Identity pool ---- issues temporary AWS credentials (valid 1 hour)
  │
  │  (3) call with credentials
  v
AWS services  (Amazon S3 / Amazon DynamoDB, etc.)
```

The authentication artifact the identity pool receives differs per provider. What comes from a user pool is the **ID token, not the access token.**

| Provider | What the identity pool receives |
|---|---|
| Amazon Cognito user pool | ID token |
| OIDC provider | ID token |
| SAML 2.0 provider | SAML assertion |
| Social provider | Access token |

> — Source: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

### 3.4 Sign-in Pages: managed login and hosted UI classic 🔄

The user pool sign-in page is commonly known as the "hosted UI," but there are now **two** branding versions.

| Item | managed login | hosted UI (classic) |
|---|---|---|
| Position | The current version | A thinner, less customizable predecessor to managed login |
| Scope of support | Sign-up, sign-in, and password management (including completing MFA and registering WebAuthn authenticators) | Same |
| User self-service profile management | **Not supported.** Attribute changes and MFA preferences must be implemented in application code | Same |
| TLS requirement | Requires **TLS 1.2 for both custom domains and prefix domains** | Does not require TLS 1.2 for custom domains |
| CORS | Custom CORS origin policies are not supported. Implement in the front end | Same |
| Branding style creation | Assigned automatically when you create an app client in the console. If you create one with `CreateUserPoolClient`, **you cannot use managed login until you send a `CreateManagedLoginBranding` request** | Not applicable |

Three behaviors are worth knowing.

- When a user signs in through the sign-in page or a third-party provider, Amazon Cognito **sets a cookie in the browser and the user can sign in again with the same authentication method for one hour.** Signing in again with the cookie does not extend the cookie by another hour. That is why setting access and ID token durations shorter than one hour has little effect ([Section 6.6](#66-token-validity)).
- Switching the branding version between managed login and hosted UI (classic) **does not preserve user sessions.** Users have to sign in again through the new interface.
- managed login **cancels authentication requests that are not completed within five minutes.**

To use a social IdP or federated sign-in you must **select a domain and set up a managed login page** for the user pool. Without a domain you cannot use social, OIDC, or SAML sign-in ([Section 4.12](#412-third-party-idp-federation)).

> — Source: [Things to know about managed login and the hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)

### 3.5 Feature Plans Lite Essentials Plus 🆕

**Several of the features covered in this module depend on the plan.** It is a choice you need to know about before creating a user pool.

| Plan | What it includes |
|---|---|
| Lite | Sign-in features and the classic hosted UI. Does not include newer features such as access token customization or passkey authentication |
| **Essentials** (default for new user pools) | The full set of current user pool authentication features, including advanced authentication features such as choice-based sign-in and email MFA |
| Plus | Everything in Essentials plus **threat protection** |

The plan applies **per user pool** and cannot differ per app client within a user pool. You set it with the `UserPoolTier` parameter of `CreateUserPool` and `UpdateUserPool`, and if you do not specify a value the default is Essentials. In the AWS CLI the argument is `--user-pool-tier`.

```bash
# Raise the user pool's feature plan to Plus. Threat protection requires Plus.
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_example \
  --user-pool-tier PLUS

# Specify the plan when creating a new user pool. Omitting it defaults to ESSENTIALS.
aws cognito-idp create-user-pool \
  --pool-name pollynotes-users \
  --user-pool-tier ESSENTIALS
```

The plan-dependent items in this module, collected:

| Feature | Plan required | In this document |
|---|---|---|
| Passkey (WebAuthn) authentication | All plans **except Lite** | [Section 4.8](#48-passwordless-sign-in-and-passkeys) |
| Email MFA · email OTP | Essentials or higher | [Section 4.5](#45-multi-factor-authentication-mfa) · [Section 4.10](#410-sms-and-email-delivery) |
| Password history (`PasswordHistorySize`) | Essentials or higher | [Section 4.4](#44-password-policy) |
| Access token customization | A plan other than Lite + trigger event version 2 | [Section 6.10](#610-customizing-tokens) |
| Threat protection | **Plus** | [Section 3.8](#38-threat-protection) |
| Adding scopes to an access token at runtime | Essentials or Plus | [Section 6.10](#610-customizing-tokens) |

The documentation notes that some user pool features were previously part of the `advanced security features` pricing structure and that those features are now folded into the Essentials or Plus plans. That is where the older phrase "advanced security features" comes from.

> — Source: [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)

### 3.6 Encryption at Rest and in Transit 🔄

Data is encrypted at rest and in transit, and all data is encrypted server-side. What is commonly missing is **the key types and the TLS requirements.**

| Target | Encryption at rest |
|---|---|
| Identity pools | Encrypted with **AWS owned keys.** This behavior cannot be changed |
| User pools | AWS owned keys by default. Can be configured to encrypt with a **customer managed key.** Even with no encryption settings at all, all customer data is encrypted at rest |

The constraints when using a customer managed key with a user pool:

| Constraint | Content |
|---|---|
| Key type | Only a **symmetric KMS key in the same Region** as the user pool. Asymmetric keys cannot be configured |
| How to specify | Only by **KMS key ARN.** An alias cannot be used |

The documentation states that Amazon Cognito supports the confidentiality, integrity, and availability of PII in user attribute search through **searchable encryption.** It computes an HMAC value with the KMS key that encrypts the user pool to map plaintext to ciphertext for the `sub`, `email`, `phone_number`, `given_name`, `family_name`, `name`, `username`, `preferred_username`, and `cognito:user_status` attributes.

The requirements for encryption in transit:

| Item | Content |
|---|---|
| TLS | **TLS 1.2 required, TLS 1.3 recommended.** AWS service endpoints require a minimum of TLS 1.2 |
| Cipher suites | Requires cipher suites with **perfect forward secrecy (PFS)** such as DHE or ECDHE |
| API namespaces | `cognito-idp` for user pools, `cognito-identity` for identity pools |
| Sign-in pages | managed login and the classic hosted UI are hosted on web domains served from a service-owned Amazon CloudFront distribution, and Amazon Cognito manages the encryption-in-transit settings |

> — Source: [Data protection in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html)

### 3.7 Compliance 🔄

Some material lists the compliance standards as `PCI DSS / SOC / ISO 9001 / standards-based authentication (OAuth 2.0, SAML 2.0, OIDC) / MFA`. Two things need correcting.

| Item | Verified content |
|---|---|
| ISO 9001 | The ISO standard the Amazon Cognito documentation names is **ISO 27001** (information security management systems). ISO 9001 is quality management and does not appear in the Cognito documentation |
| Standards-based authentication and MFA included in a compliance list | These are **service features**, not compliance programs. Two different categories are mixed into one list |

Organized by the shared responsibility model. **There is one item where "security of the cloud" and "security in the cloud" diverge.**

| Category | Compliance scope |
|---|---|
| Security **of** the cloud (AWS's obligation) | Compliant with SOC 1-3, PCI DSS, and ISO 27001, and **HIPAA-BAA eligible** |
| Security **in** the cloud (you design) | Can be designed to comply with SOC 1-3, ISO 27001, and HIPAA-BAA, **but not PCI DSS** |

The compliance validation page lists **SOC, PCI, FedRAMP, HIPAA, and others.** For the list of services in scope for a particular program, check the `AWS services in scope by compliance program` page, and download third-party audit reports from AWS Artifact. This document did not retrieve that services-in-scope page, so **whether Cognito falls within ISO 9001 scope was not determined** ([Section 11.5](#115-items-we-could-not-verify)).

> — Source: [Compliance validation for Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/compliance-validation.html)

> — Source: [What is Amazon Cognito? (shared responsibility model)](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 3.8 Threat Protection 🔄

What was often introduced as "protect your users with advanced security features" refers to this feature. The documentation calls it **threat protection** and states that it was **formerly called advanced security features.** It is **exclusive to the Plus feature plan.**

| Component | Content |
|---|---|
| Compromised credentials | Gathers publicly leaked username and password data and compares it against user credentials, and also checks for commonly guessed passwords. You choose to **block or allow sign-in** for sign-in, sign-up, and password change events |
| Adaptive authentication | Reviews the location and device information of a sign-in request to assign a **risk score**, and lets you specify an automatic response of requiring MFA, blocking sign-in, or recording the activity. Can automatically send an email notifying the user of suspicious activity |
| IP address allow and deny lists | In Full function mode, creates Always block and Always allow exceptions in **CIDR notation** |
| Log export | Exports session metadata such as threat evaluations, user information, location, and device to **Amazon S3, CloudWatch Logs, or Amazon Data Firehose** |

There are two modes. **Audit mode** applies no security mitigations and only publishes detected risk indicators to CloudWatch, while **Full function mode** actually applies the automatic responses you configured.

Three constraints, and these are the ones you hit in a lab.

| Constraint | Content |
|---|---|
| Authentication flow | `USER_PASSWORD_AUTH` and `ADMIN_USER_PASSWORD_AUTH` support **both** adaptive authentication and compromised credentials detection, but with `USER_SRP_AUTH` you can enable **only adaptive authentication** |
| Federation | **Threat protection cannot be used with federated sign-in** |
| Rate limiting | Threat protection does not apply request rate limits, so you must pair it with an **AWS WAF web ACL** to defend against high-volume traffic attacks |

> — Source: [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html)

### 3.9 Service Quotas and Billing Unit 🆕

Amazon Cognito is often described as scaling "to millions of users." Here are the actual figures and whether they can be adjusted. Quotas apply **per account and Region.**

| Quota | Default | Adjustable |
|---|---|---|
| Users per user pool | 40,000,000 | Adjustable. Contact your account team for more |
| User pools per Region | 1,000 | Up to 10,000 |
| App clients per user pool | 1,000 | Up to 10,000 |
| Identity providers per user pool | 300 | Up to 1,000 |
| Resource servers per user pool | 25 | Up to 300 |
| Custom attributes per user pool | 50 | **Not adjustable** |
| Groups per user pool | 10,000 | **Not adjustable** |
| managed login branding styles per user pool | 20 | **Not adjustable** |
| Amazon Cognito user pool providers per identity pool | 50 | Up to 1,000 |
| Email messages sent daily per AWS account | 50 | **Not adjustable** ([Section 4.10](#410-sms-and-email-delivery)) |

API request rate quotas apply on a different basis in the two components.

| Component | Basis |
|---|---|
| User pools | Applied **grouped by use case category** such as `UserAuthentication` and `UserCreation`. For example the `UserCreation` category is a combined 50 RPS across `SignUp`, `ConfirmSignUp`, `AdminCreateUser`, and `AdminConfirmSignUp`. `RespondToAuthChallenge` and `AdminRespondToAuthChallenge` have a separate quota that is **3 times** the `UserAuthentication` category limit |
| Identity pools | Applied **per operation** |

The billing unit is **monthly active users (MAU).** If there is an identity operation involving a user within a month, that user counts as an MAU.

| Operations that contribute to MAU | Operations that do not |
|---|---|
| Sign-up and admin creation / account and attribute confirmation / sign-in and challenge responses / sign-out and token revocation / self-service password reset and admin password set / attribute and group membership changes / retrieving detailed user attributes as an administrator (`AdminGetUser`) | CSV user import / `AdminResetUserPassword` |

For a month in which you change the feature plan, billing assigns each user the **highest price tier** at which they were active and sums Lite, Essentials, and Plus MAU. This document did not retrieve the pricing page, so **no unit prices are given** ([Section 11.5](#115-items-we-could-not-verify)).

> — Source: [Quotas in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html)

### 3.10 Amazon Cognito Sync 🆕

This does not appear in the original material for this module. But the Identity browser tab and dataset features still exist in the identity pool console, and older material introduces this service alongside identity pools, so its status is recorded here.

| Item | Content |
|---|---|
| Status | **No longer open to new customers** |
| Existing customers | No disruption to workloads and can continue to use it, but there is **no new feature development** |
| Recommended alternatives | **AWS AppSync** (real-time data synchronization across devices with a GraphQL API) or **Amazon DynamoDB** (simple key-value user data storage for profiles, preferences, and settings) |
| Migration | Requires updating the data schema, moving data from the existing store to the alternative service, and changing the APIs in client applications |

**It cannot be used in new projects.** If a lab needs to store per-user data, use DynamoDB.

> — Source: [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html)

---

## 4. Creating a User Pool

### 4.1 User Flow and Security Requirements

What you decide when creating a user pool falls into two groups.

| Define the user flow | Specify security requirements |
|---|---|
| Registration / email and phone number verification / secure sign-in / forgotten password / password change / sign-out | Secure password handling / multi-factor authentication / password policy enforcement / server-side encryption of all data / support for authentication flows / scales to millions of users |

Of the six items in the right column, **three are named but their content is not obvious from the name.** This document fills them in the sections below.

| Item | Where it is filled in |
|---|---|
| Password policy enforcement | [Section 4.4](#44-password-policy) — defaults, ranges, and what requires Essentials or higher |
| Multi-factor authentication | [Section 4.5](#45-multi-factor-authentication-mfa) — the three second factors |
| Support for authentication flows | [Section 4.7](#47-authentication-flows) — `ExplicitAuthFlows` values and choice-based sign-in |
| Server-side encryption of all data | [Section 3.6](#36-encryption-at-rest-and-in-transit) |
| Scales to millions of users | [Section 3.9](#39-service-quotas-and-billing-unit) — 40 million per user pool |

### 4.2 Nine Things a User Pool Can Do

The nine things a user pool can do, with the corresponding section of this document on the right.

| # | Content | In this document |
|---|---|---|
| 1 | Choose how users sign in (for example verifying email, phone number, or username) | [Section 5.2](#52-required-and-verifiable-attributes) |
| 2 | Require the attributes needed for sign-up and user profile creation, such as user profile email, birthdate, picture, and custom attributes | [Section 5.1](#51-attributes) |
| 3 | Specify policies (password strength, requiring administrator sign-up, setting temporary password expiration, and so on) | [Section 4.4](#44-password-policy) |
| 4 | Enable multi-factor authentication (MFA) and remembering user devices | [Section 4.5](#45-multi-factor-authentication-mfa) · [Section 4.6](#46-remembered-devices) |
| 5 | Set user account recovery options | [Section 4.5](#45-multi-factor-authentication-mfa) — MFA and account recovery channels cannot overlap |
| 6 | Set short message service (SMS) and custom email delivery options | [Section 4.10](#410-sms-and-email-delivery) |
| 7 | Add tags so you can categorize and manage the user pool | As stated in the original |
| 8 | Specify the application clients that can access the user pool. An app client receives a unique ID and an optional secret key for accessing the user pool | [Section 4.9](#49-app-clients-public-and-confidential) |
| 9 | Set up custom workflows using triggers. You can choose an AWS Lambda function to run with specific events (pre sign-up, post authentication, and so on) | [Section 4.11](#411-lambda-triggers) |

### 4.3 The Console Creation Flow 🔄

A demonstration that assumes "creating the user pool and app client ID" is done through console operations is now out of date. The current console's user pool creation has changed to an **application-centric flow.**

| Step | Content |
|---|---|
| 1 | In the console's User pools menu, choose **Create user pool** or `Get started for free in less than five minutes` |
| 2 | **Define your application** — choose the **Application type** that matches the scenario you are building |
| 3 | **Name your application** — enter a name |
| 4 | **Configure options** — the default choices that **cannot be changed after the user pool is created**: `Options for sign-in identifiers` (username, email address, phone number, or a combination) and `Required attributes for sign-up` |
| 5 | **Add a return URL** — enter the redirect path after authentication completes |
| 6 | Choose **Create your application** |

Amazon Cognito creates **both the user pool and an app client** with the defaults for the application type. Additional options such as external identity providers and MFA are configured after the resources are created. The `AmazonCognitoPowerUser` policy is sufficient for creating a user pool.

This process establishes **default configuration that cannot be reversed.** The documentation presents three such items in a table.

| Item | To change it |
|---|---|
| Client secret | You must **create a new app client** with the `Traditional web application` or `Machine-to-machine application` profile |
| `preferred_username` alias not allowed | Requires programmatic creation with an SDK |
| Username case insensitivity | Requires programmatic creation with an SDK |

The two choices in step 4 (sign-in identifiers and required sign-up attributes) also **cannot be changed after the user pool is created** ([Section 5.2](#52-required-and-verifiable-attributes)). The documentation recommends building a test environment through the console and then deploying the finished design to production with **automation tools such as AWS CloudFormation and the AWS CDK.**

> The creation steps in the current quick-start documentation contain **no point at which you choose a feature plan.** The plan is set after the user pool is created, through `Settings → Feature plans` or the API's `UserPoolTier`. What this document confirmed reaches only "it is not in the creation steps" ([Section 11.5](#115-items-we-could-not-verify)).

> — Source: [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html)

### 4.4 Password Policy 🆕

Password policy is often introduced only as "specify policies (password strength, requiring administrator sign-up, setting temporary password expiration, and so on)," with **no concrete values.** You configure this in the console's `Authentication methods` menu under `Password policy`, and the mode is either `Cognito defaults` (which applies the recommended minimum settings) or `Custom`.

| Parameter | Default | Valid range | Notes |
|---|---|---|---|
| `MinimumLength` | — | **6–99** | Cannot be less than 6. Users can set passwords up to 256 characters |
| `RequireLowercase` · `RequireNumbers` · `RequireSymbols` · `RequireUppercase` | — | Boolean | Choose the character types to require from numbers, special characters, uppercase, and lowercase |
| `TemporaryPasswordValidityDays` | **7 days** | 0–365 | Submitting 0 makes Amazon Cognito treat it as null and set the default |
| `PasswordHistorySize` | Not applied | 0–24 | The number of previous passwords that cannot be reused. Requires the **Essentials plan or higher.** If 0 or not provided it is not applied and does not appear in the `DescribeUserPool` response |

The permitted special characters are `^ $ * . [ ] { } ( ) ? " ! @ # % & / \ , > < ' : ; | _ ~ ` = + -` and **spaces that are not leading or trailing.** The documentation describes a complex password as at least 8 characters mixing uppercase, numbers, and special characters.

```bash
# Set the user pool's password policy. PasswordHistorySize only works on Essentials or higher.
aws cognito-idp update-user-pool \
  --user-pool-id us-east-1_example \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 12,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true,
      "TemporaryPasswordValidityDays": 3,
      "PasswordHistorySize": 5
    }
  }'
```

Two behaviors are worth knowing.

- **Passwords for local users in an Amazon Cognito user pool do not expire automatically.** As a best practice the documentation advises recording password reset times, dates, and metadata in an external system and having the application or a Lambda trigger query the password age and require a reset after a certain period. If you need an expiration policy you must **implement it yourself.**
- Once the temporary password expiration period passes, a new user cannot sign in to set a new password. Recovery options are to send a new temporary password with `MessageAction=RESEND` on `AdminCreateUser`, delete and recreate the user profile, or generate a new confirmation code with `AdminResetUserPassword`.

> You may encounter `UnusedAccountValidityDays` in older templates. Once you set `TemporaryPasswordValidityDays` on a user pool, you **can no longer set a value for the legacy `UnusedAccountValidityDays` parameter** in that user pool ([Section 11.3](#113-discouraged-and-unsupported-items)).

> — Source: [Adding user pool password requirements](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-users-passwords.html)

> — Source: [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html)

### 4.5 Multi-Factor Authentication MFA 🔄

MFA is often introduced only as "enable multi-factor authentication (MFA) and remembering user devices," which **does not distinguish the kinds of second factor.** MFA adds a "something you have" factor to the initial "something you know" factor, which is usually a username and password.

| Second factor | Notes |
|---|---|
| SMS text message | Requires a phone number. If you enable SMS MFA, users must provide a phone number |
| Email message | Requires the **Essentials plan or higher plus an Amazon SES email configuration** |
| Time-based one-time password (TOTP) | An authenticator app |

Six things are worth knowing, and they affect lab design directly.

| Item | Content |
|---|---|
| Federated users | Because Amazon Cognito **delegates the entire authentication process to the IdP**, it does not provide an additional authentication factor for federated users |
| Setting MFA to required | Every user must complete MFA at sign-in and each user must configure at least one MFA factor, so you must **include MFA setup in user onboarding** |
| managed login | Guides users through MFA setup **only when MFA is required.** When it is optional there is no guidance, so you have to build the interface in your app |
| First sign-in | When a new user signs in to the app for the first time, Amazon Cognito issues OAuth 2.0 tokens even if the user pool requires MFA. The second factor for the first sign-in is **confirming the confirmation message Amazon Cognito sent** |
| Exclusivity with passwordless sign-in | A user pool with MFA required **cannot support OTP sign-in**, and you cannot add `EMAIL_OTP` or `SMS_OTP` to `AllowedFirstAuthFactors`. WebAuthn can be added when `FactorConfiguration` is `MULTI_FACTOR_WITH_USER_VERIFICATION` |
| Account recovery channel | Users **cannot receive MFA and password reset codes at the same email address or phone number.** If you use email OTP for MFA, account recovery must go over SMS; if you use SMS OTP for MFA, recovery must go over email |

Presenting an MFA code incorrectly **five times** starts an exponential backoff lockout process. **Adaptive authentication**, which requires an additional factor as the risk level rises, requires configuring threat protection ([Section 3.8](#38-threat-protection)).

> — Source: [Adding MFA to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)

### 4.6 Remembered Devices 🔄

"Remembering user devices" is named but its behavior is not obvious from the name. You configure it in the console's `Sign-in` menu under `Device tracking`, and there are **three** options.

| Option | Behavior |
|---|---|
| Don't remember | Does not prompt about remembering the device at sign-in |
| Always remember | Always remembers the device once the app confirms it, and **does not return an MFA challenge on subsequent successful sign-ins from that device** |
| User opt-in | Confirming the device does not automatically suppress the MFA challenge, so **you have to ask the user whether to remember it** |

If you choose `Always remember` or `User opt-in`, Amazon Cognito generates a device identifier key and secret each time a user signs in from an unidentified device. The device key format is `Region_UUID`, and Amazon Cognito includes the device key in sign-in responses that carry no device information.

Three constraints are worth knowing.

| Constraint | Content |
|---|---|
| Condition for replacing MFA | A remembered device can replace MFA **only in a user pool where MFA is enabled** |
| Additional device authentication | Signing in with a remembered device requires performing additional device authentication in the authentication flow, which needs the **device key, an SRP library, and a user pool that permits device authentication** |
| Trust period expiration | Amazon Cognito does not manage this. When the trust period ends, **the application must change the device status to `not remembered`** and have the user sign in with MFA again; the expiration date is implemented yourself, for example by storing it in a custom attribute |

The related APIs are `ListDevices` / `AdminListDevices`, `GetDevice` / `AdminGetDevice`, `UpdateDeviceStatus` / `AdminUpdateDeviceStatus`, and `ForgetDevice` / `AdminForgetDevice`, and the API configuration is the `DeviceConfiguration` property of `CreateUserPool` and `UpdateUserPool`. Linking per-device activity logs connects to threat protection.

> — Source: [Working with user devices in your user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html)

### 4.7 Authentication Flows 🆕

Listing "supports authentication flows" as a security requirement **gives no flow name at all.** In practice you must explicitly choose the flows to permit on the app client.

User pool authentication is a flow in which the user makes an initial choice, submits credentials, and responds to additional challenges. With managed login Amazon Cognito manages the flow of prompts and challenges; if you implement the flow in a backend with an AWS SDK you build the request logic and respond to challenges yourself.

The sign-in methods the documentation presents:

| Sign-in method | Content |
|---|---|
| Third-party IdP sign-in (federated sign-in) | Sign-in through social, OIDC, and SAML IdPs |
| Sign-in with persistent passwords | Username and password |
| Sign-in with persistent passwords and secure payload (SRP) | Sends **only proof of knowing the password** through a password hash and salt, so the request contains no readable secret |
| Passwordless sign-in with one-time passwords (OTP) | [Section 4.8](#48-passwordless-sign-in-and-passkeys) |
| Passwordless sign-in with WebAuthn passkeys | [Section 4.8](#48-passwordless-sign-in-and-passkeys) |
| MFA after sign-in | [Section 4.5](#45-multi-factor-authentication-mfa) |
| Refresh tokens | [Section 6.7](#67-refresh-token-rotation) |
| Custom authentication | `CUSTOM_AUTH`. Controlled by three Lambda triggers |
| User migration authentication flow | The `Migrate user` trigger |

There are four values you specify in the app client's `ExplicitAuthFlows`.

| `ExplicitAuthFlows` value | Meaning |
|---|---|
| `ALLOW_USER_PASSWORD_AUTH` | Sign in with username and password |
| `ALLOW_ADMIN_USER_PASSWORD_AUTH` | Sign in with server-side administrative credentials |
| `ALLOW_USER_SRP_AUTH` | Sign in with SRP |
| `ALLOW_USER_AUTH` | **Choice-based sign-in.** A later addition |

For the `AuthFlow` value of `InitiateAuth` and `AdminInitiateAuth` you use `USER_AUTH` (choice-based), `USER_SRP_AUTH`, `CUSTOM_AUTH`, and `REFRESH_TOKEN_AUTH`.

```bash
# Specify the authentication flows the app client permits.
# Allow only SRP and choice-based sign-in; do not enable the plaintext password flow.
aws cognito-idp update-user-pool-client \
  --user-pool-id us-east-1_example \
  --client-id xxxxxxxxxxxxexample \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_USER_AUTH ALLOW_REFRESH_TOKEN_AUTH
```

How **choice-based sign-in (`USER_AUTH`)** works:

| Item | Content |
|---|---|
| Configuring first factors | Specify `PASSWORD`, `EMAIL_OTP`, `SMS_OTP`, and `WEB_AUTHN` in the user pool's `SignInPolicy.AllowedFirstAuthFactors` |
| How it proceeds | Include `PREFERRED_CHALLENGE` in the request, or omit it to receive an `AvailableChallenges` list and then proceed with `SELECT_CHALLENGE` |
| Scope of the `PASSWORD` value | **Includes both the plaintext password and SRP variants** |

`CUSTOM_AUTH` controls challenges and response verification through three Lambda triggers: `DefineAuthChallenge`, `CreateAuthChallenge`, and `VerifyAuthChallengeResponse`. For user migration you use `USER_PASSWORD_AUTH`, but the documentation advises **switching to the more secure SRP flow, which does not send the password over the network, once migration is complete.**

> — Source: [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html)

### 4.8 Passwordless Sign-in and Passkeys 🆕

The security requirements are often listed only as "secure password handling / multi-factor authentication / password policy enforcement," omitting these two features. Both were added later and can be used **only through the choice-based sign-in (`USER_AUTH`) flow.**

**One-time password (OTP) sign-in**

| Item | Content |
|---|---|
| Behavior | The application has the user enter a username, email address, or phone number, and Amazon Cognito generates an OTP for the user to confirm |
| Side effect | When the user correctly enters the code received by SMS or email, authentication also **marks unverified email address and phone number attributes as verified** and changes the user status from `UNCONFIRMED` to `CONFIRMED` |
| Constraint | **Not compatible with a user pool where MFA is required** |

**Passkey (WebAuthn) authentication**

| Item | Content |
|---|---|
| Standards | Based on the **WebAuthn and CTAP2** standards drafted by the W3C and the FIDO Alliance. The authenticator creates a public-private key pair and the application backend verifies signatures with the stored public key |
| Feature plan | An **opt-in** feature available on **all feature plans except Lite** |
| Entry flow | Available only in the choice-based authentication flow (`USER_AUTH`) |
| Algorithms | Recognizes passkeys created with the two asymmetric algorithms **ES256 (-7)** and **RS256 (-257)**. **Enforcing attestation is not currently supported** |
| User verification | Configured as `preferred` or `required`. The default for API requests that omit the value, and in the console, is **`preferred`** |
| Registration limit | Up to **20** per user. Can be registered **only after the user has signed in to the user pool at least once** |
| Relying party (RP) ID | Must be a domain **not on the public suffix list (PSL).** Changing the RP ID requires users to register again with the new RP ID, so **deciding the value before launch is a best practice** |
| Relationship to MFA | Setting `FactorConfiguration` to `MULTI_FACTOR_WITH_USER_VERIFICATION` makes passkey authentication with user verification satisfy the MFA requirement. **A passkey cannot be used as a second factor for password sign-in** |

> — Source: [Passwordless sign-in with WebAuthn passkeys](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html)

### 4.9 App Clients Public and Confidential 🔄

The statement that "an app client receives a unique ID and an **optional secret key** for accessing the user pool" matches the documentation's client ID plus optional client secret. What is missing is the **client type distinction.**

| Type | Where it runs | Client secret |
|---|---|---|
| Public client | A browser or mobile device. No trusted server-side resource | **Does not have one** |
| Confidential client | A daemon or shell script on a backend server, and similar. Has a server-side resource to hold the secret | Has one |

How the client secret behaves:

| Item | Content |
|---|---|
| Purpose | A **fixed string that must be used on every API request** the app sends with that app client |
| Requirement | To perform the `client_credentials` grant the app client **must have** a client secret |
| Count | Each app client can have **up to two** at a time, so you can rotate them without downtime |
| Changing | You **cannot change** a secret after creating the app. Add a second secret with `AddUserPoolClientSecret` and delete one with `DeleteUserPoolClientSecret`. **An app client's only secret cannot be deleted** |
| How to create | Choosing `Traditional web application` or `Machine-to-machine application` in the console creates an app client with a secret. Programmatically, set `GenerateSecret` to `true` on `CreateUserPoolClient` |

The documentation names two **security best practices for public client apps.**

- **Enable only the authorization code grant OAuth flow** ([Section 5.5](#55-the-three-oauth-20-grants)).
- **Implement PKCE** to restrict token exchange ([Section 5.6](#56-pkce)).

There is a pitfall in attribute permissions too. If you create an app client and do not customize attribute read and write permissions, **read and write permissions are granted for every user pool attribute.** Limiting to the minimum set you need is a best practice, and you cannot grant app client write permission for `email_verified` or `phone_number_verified`.

> — Source: [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)

### 4.10 SMS and Email Delivery 🔄

Behind the brief "set SMS and custom email delivery options," there is a limit you hit as soon as you create several users in a lab.

**Email**

| Configuration | Content |
|---|---|
| Amazon Cognito default email configuration | Amazon Cognito limits the number of emails sent per user pool per day. **50 per AWS account per day (not adjustable).** The documentation states that in a typical production environment the default limit is lower than the volume you need |
| Your own Amazon SES configuration | Use this when you need more volume. You can change the delivery option after creating the user pool |

There is one more caution with the default configuration. Because it uses AWS-managed Amazon SES resources, **an email address that hard bounces is added to an account-level or global suppression list, and while you use the default configuration you cannot remove that address from the suppression list, so it can remain indefinitely.**

| Item | Value |
|---|---|
| Default FROM address | `no-reply@verificationemail.com` or a custom address verified with Amazon SES |
| Email subject | Up to 140 characters |
| Email body | Up to 20,000 characters |
| Email MFA messages | **5 to 20 per hour** to one email address per requester IP address |

The events that generate email are forgotten password (`ForgotPassword` / `AdminResetUserPassword`), invitation (`AdminCreateUser`), self-registration (`SignUp` / `ResendConfirmationCode`), email and phone number verification, MFA, and one-time password authentication. **Email MFA and email OTP require the Essentials feature plan or higher plus an Amazon SES email configuration.**

**SMS**

The documentation states that **in November 2024 AWS replaced Amazon SNS SMS messaging with AWS End User Messaging SMS.** There are now two paths and they are **mutually exclusive.** Configuring one clears the other.

| Path | How it is called | Permission required |
|---|---|---|
| Amazon SNS path | Amazon Cognito calls Amazon SNS, which routes to AWS End User Messaging SMS | `sns:Publish` |
| AWS End User Messaging SMS direct path | Amazon Cognito calls `SendTextMessage` directly | `sms-voice:SendTextMessage` |

When you first send a text message, AWS End User Messaging SMS places your account in a **sandbox environment**, so you can only send to verified destination phone numbers.

> — Source: [SMS message settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html)

> — Source: [Email settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)

### 4.11 Lambda Triggers 🔄

Triggers are often illustrated with only two examples: "**pre sign-up, post authentication**." The actual list is far longer. You can configure a user pool to invoke Lambda functions automatically before initial sign-up, after authentication completes, and at several stages in between.

| Flow | Trigger | Purpose |
|---|---|---|
| Custom authentication | Define Auth Challenge | Decide the next challenge |
| Custom authentication | Create Auth Challenge | Create the challenge |
| Custom authentication | Verify Auth Challenge Response | Judge whether the response is correct |
| Authentication events | Pre authentication | Custom validation to accept or deny a sign-in request |
| Authentication events | Post authentication | Log events for custom analytics |
| Authentication events · token generation | **Pre token generation** | Enrich or suppress token claims. Add or remove attributes in ID and access tokens |
| Federation | Inbound federation | Transform federated user attributes before creating or updating the user in the user pool |
| Sign-up | **Pre sign-up** | Validate whether to accept or deny a sign-up request (also called "pre sign-up") |
| Sign-up | Post confirmation | Welcome messages and event logging |
| Sign-up | Migrate user | Migrate users from an existing user directory into the user pool |
| Messages | Custom message | Advanced customization and localization of messages |
| Third-party email and SMS providers | Custom sender | Send SMS and email through a third-party provider |

> The commonly cited "post authentication" example is `Post authentication` in the table above.

Four constraints are worth knowing.

| Constraint | Content |
|---|---|
| Synchronous invocation and 5 seconds | Except for the `Custom sender` trigger, Amazon Cognito invokes Lambda functions **synchronously and the function must respond within 5 seconds, and this 5-second timeout cannot be changed** |
| Access token customization | To customize the access token in the `Pre token generation` trigger, the user pool feature plan must **not be Lite** and the trigger configuration must be updated to **event version 2** |
| Function version | You cannot declare a function version in the Lambda trigger configuration, so the latest version is invoked by default. You can attach a function version to an alias and point the trigger `LambdaArn` at the alias ARN, but **this option is not in the console** |
| Failure handling | If the Lambda function does not return the request and response parameters, or returns an error, **the authentication event does not succeed** |

The `custom SMS` and `custom email sender` triggers are not in the console and are set only through the `LambdaConfig` property of `CreateUserPool` and `UpdateUserPool`.

> — Source: [Customizing user pool workflows with Lambda triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)

### 4.12 Third-Party IdP Federation 🆕

The statement that "the user pool manages the work of processing tokens returned from social sign-up through Facebook, Google, Login with Amazon, and Sign in with Apple" and "also manages processing tokens sent by OIDC and SAML IdPs" matches the documentation. What is easy to miss is **what results from it.**

| Step | Content |
|---|---|
| 1 | The IdP passes an OIDC ID token or SAML assertion to Amazon Cognito |
| 2 | Amazon Cognito reads the user claims from that token or assertion and **maps them to a new user profile** in the user pool directory |
| 3 | Amazon Cognito **creates a profile for the federated user** in its own directory and adds attributes based on the IdP's claims and, for OIDC and social IdPs, the public `userinfo` endpoint the IdP operates |
| 4 | Amazon Cognito switches roles and presents itself as the IdP to your app (now the SP), issuing ID, Access, and Refresh tokens as an IdP that is **both OIDC and OAuth 2.0** |

When mapped IdP attributes change, the user pool's user attributes change too. Your backend systems can **standardize on one set of user pool tokens.**

Four things are worth knowing.

| Item | Content |
|---|---|
| Domain required | To let users sign in with a federation provider you must **select a domain and set up a managed login page** |
| No API sign-in | You **cannot sign in a federated user** with API operations such as `InitiateAuth` or `AdminInitiateAuth`. Sign-in works only through the Login or Authorize endpoints |
| username format | The `username` of a federated user profile is a combination of a fixed identifier and the IdP name (for example `MyIDP_bob@example.com`) |
| Automatic IdP groups | For each OIDC, SAML, and social IdP you add to the user pool, a user group named **`[user pool ID]_[IdP name]`** is created, and the automatically created IdP user profiles are added to that group |

A federated user's identity information is recorded in an **attribute named `identities` and in the ID token claims**, and that attribute cannot be changed directly.

Using a social IdP needs one more preparation step. **Before creating the social IdP you must register an application with that social IdP to get a client ID and client secret.** The provider names the documentation uses are `Facebook`, `Login with Amazon`, `Google`, and `Sign in with Apple`.

> Some source material writes this provider as "Login **for** Amazon." The official name is **Login with Amazon** ([Section 11.1](#111-differences-from-the-courseware)).

The identity provider quota is 300 per user pool (up to 1,000) ([Section 3.9](#39-service-quotas-and-billing-unit)).

> — Source: [User pool sign-in with third party identity providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html)

> — Source: [Using social identity providers with a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html)

---

## 5. Attributes, Groups, and Scopes

Some source material orders these three as "attributes, scopes, and groups" in a title, while the body and description both use attributes → groups → scopes. This document follows the body order, organizing it as **attributes → groups → scopes** ([Section 11.1](#111-differences-from-the-courseware)).

Distinguishing what each of the three does in one line:

| Target | What it determines | Where it appears |
|---|---|---|
| Attributes | **What you store** about a user | ID token claims |
| Groups | **How you bundle users and which IAM role they get** | The `cognito:groups`, `cognito:roles`, and `cognito:preferred_role` claims |
| Scopes | **Which APIs an access token can call** | The `scope` claim of the access token |

### 5.1 Attributes

On the basis of the OpenID Connect specification, Amazon Cognito assigns a set of **standard attributes** to every user. By default standard and custom attribute values are strings of up to **2048 characters**, and some attributes have format restrictions.

There are **18** standard attributes.

| Category | Attributes |
|---|---|
| Name | `name` · `family_name` · `given_name` · `middle_name` · `nickname` · `preferred_username` |
| Profile | `profile` · `picture` · `website` · `gender` · `birthdate` · `zoneinfo` · `locale` · `updated_at` |
| Contact | `address` · `email` · `phone_number` |
| Identifier | `sub` |

🔄 **What is often given as examples of custom attributes are actually standard attributes.** Some material splits attributes as `standard attributes (email, name) / custom (nickname, picture)`. But `nickname` and `picture` are among the 18 standard attributes above, so they are not custom attributes ([Section 11.1](#111-differences-from-the-courseware)).

The constraints on custom attributes matter because they create decisions in a lab that cannot be reversed.

| Item | Content |
|---|---|
| Count | Up to **50** per user pool. This limit **cannot be adjusted** ([Section 3.9](#39-service-quotas-and-billing-unit)) |
| Length | Cannot exceed **2048 characters** |
| Name | Carries a **`custom:` prefix** to distinguish it from standard attributes in code and in role-based access control rules |
| Type | Can be defined as `string`, `number`, `boolean`, or `DateTime`, but is **always recorded as a string in the ID token** regardless of type |
| Console limitation | The console can add only `string` and `number`. `boolean` and `DateTime` are defined only through the `SchemaAttributes` of `CreateUserPool` and `UpdateUserPool` |
| Required | A custom attribute **cannot require the user to provide a value** |
| Changing | Once added to a user pool it **cannot be removed or changed** |
| Mutability | Can be created `mutable` or `immutable`; an `immutable` attribute can only be written **when the user is created** |

`username` is a **separate attribute** from `name`. It must be unique within the user pool and its value cannot be changed after the user is created.

> — Source: [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

🔄 **Narrowing per-app-client attribute permissions is a best practice.** When you create a new app client, **read and write permissions are granted for all standard and custom attributes** by default, so you should limit them to the minimum set you need. You cannot grant app client write permission for `email_verified` or `phone_number_verified` ([Section 9](#9-implementation-best-practices)).

🔄 **Developer attributes with the `dev:` prefix are a legacy feature.** Attributes are commonly divided into standard and custom only. The documentation notes that you can also add `dev:` attributes through the `SchemaAttributes` of `CreateUserPool`, but that this is a **legacy feature replaced by app client read and write permissions.** Developer attributes can be modified only with AWS credentials ([Section 11.3](#113-discouraged-and-unsupported-items)).

### 5.2 Required and Verifiable Attributes

Behind the brief "you can define which attributes are required and need verification" are **three decisions that cannot be reversed after the user pool is created.**

| Decision | Content | Change after creation |
|---|---|---|
| Required attributes | Selecting the `Required` checkbox next to a standard attribute means users cannot register without providing a value | **Not possible** |
| Username attributes | Use an email address or phone number as the username | **Not possible** |
| Alias attributes | Let users choose among username, preferred username, email address, and phone number | **Not possible** |

The difference between the two approaches is the verification requirement. **An alias attribute requires the user to verify the email address or phone number before signing in with it, while a username attribute does not.** Alias values must be unique within the user pool and the verified state can exist in only one account.

The attributes that can be verified are **`email` and `phone_number` only.** An administrator with appropriate permissions can change a user's email or phone number with the `AdminUpdateUserAttributes` API or the `admin-update-user-attributes` CLI command and set `email_verified` or `phone_number_verified` to `true` to mark it verified.

If SMS multi-factor authentication is enabled, users must provide a phone number ([Section 4.5](#45-multi-factor-authentication-mfa)).

Some attributes have format restrictions.

| Attribute | Format |
|---|---|
| `birthdate` | A valid **10-character** date in `YYYY-MM-DD` format |
| `phone_number` | Must **start with a plus sign (`+`) followed immediately by the country code** and can contain only `+` and digits (for example `+14325551212`) |

> — Source: [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)

### 5.3 Groups

The basic description of groups matches the current documentation. You can create collections of users with groups to manage permissions or represent different types of users, and you can **assign an IAM role to a group to define the permissions of its members.**

A user can belong to multiple groups, and the following claims appear in tokens.

| Claim | Content | Tokens it appears in |
|---|---|---|
| `cognito:groups` | **All groups** the user belongs to | Access token · ID token |
| `cognito:roles` | The **roles** corresponding to those groups | Access token · ID token |
| `cognito:preferred_role` | The **single IAM role** of the highest-priority group | ID token |

Precedence is a **non-negative number** specifying the relative priority of a group compared with the other groups the user belongs to in the user pool.

| Rule | Content |
|---|---|
| Direction | **Zero is the top precedence value.** A group with a lower value takes precedence over one with a higher value or null |
| Selection | If a user belongs to more than one group, the **IAM role of the group with the lowest precedence value** is applied to the ID token's `cognito:preferred_role` |
| Ties | Two groups can have the same precedence value, and in that case neither takes precedence |
| Tie + same role | If two groups with the same precedence have the **same role ARN**, that role is used in `cognito:preferred_role` |
| Tie + different roles | If the role ARNs differ, **the `cognito:preferred_role` claim is not set** |

The last two rows are often overlooked. Setting equal precedence can make a role disappear silently, so it is worth calling out.

🆕 **A group is created automatically for each IdP.** Amazon Cognito creates a user group for each OIDC, SAML, and social IdP you add to the user pool, with the name format **`[user pool ID]_[IdP name]`**. The automatically created IdP user profiles are added to that group ([Section 4.12](#412-third-party-idp-federation)).

🆕 The **limitations on groups** are also rarely covered.

| Limitation |
|---|
| The number of groups is limited by service quota (**10,000** per user pool, not adjustable) |
| Groups **cannot be nested** |
| You **cannot search for users within a group** |
| You **cannot search for a group by name** (listing is possible) |

There is **no additional charge** for using groups within a user pool.

> — Source: [Adding groups to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)

### 5.4 Resource Servers and Scopes

"You can create your own OAuth 2.0 resource server and define custom scopes on it" is correct, but **one prerequisite and one constraint are easy to miss.**

First the prerequisite. **You must configure a domain on the user pool** for Amazon Cognito to provision the OAuth 2.0 authorization server and the sign-up and sign-in pages. Without a domain you cannot create a resource server ([Section 3.4](#34-sign-in-pages-managed-login-and-hosted-ui-classic)).

A **resource server** is an OAuth 2.0 API server. To protect access-protected resources it verifies that the user pool access token contains a scope that authorizes the requested method and path. Verification rests on three things.

| With what | What it confirms |
|---|---|
| The token signature | The issuer |
| The expiration time | Validity |
| The scope in the token claims | The level of access |

🆕 A user pool issues **three kinds** of scope. Only custom scopes are commonly covered.

| Kind | Value | What it authorizes |
|---|---|---|
| User pool reserved API scope | `aws.cognito.signin.user.admin` | **Self-service operations** for the current user (`GetUser`, `UpdateUserAttributes`, and so on) |
| Custom scope | `identifier/scopeName` | Requests to **external APIs** protected by a resource server |
| OIDC scopes | `openid` · `profile` · `email` · `phone` | Permission to read user information from the **userInfo endpoint** |

The recommended scope format is **`resourceServerIdentifier/scopeName`**. For example you request `scope=solar-system-data/asteroids.add`.

🆕 **This is where a constraint bites in the lab.** An access token obtained through Amazon Cognito user pool API sign-in (`InitiateAuth` or `AdminInitiateAuth`) contains **only the `aws.cognito.signin.user.admin` scope**, because those two operations are for human-interactive authentication. So **a token from API sign-in cannot be used for custom-scope-based API authorization.** If you need an access token carrying custom scopes you must use an OAuth flow that goes through the token endpoint. This is the constraint you hit directly when adding scopes to an API Gateway authorizer ([Section 8](#8-securing-api-access)).

Two more things about managing scopes:

| Item | Content |
|---|---|
| Deletion | Deleting a scope from a resource server does not delete all client associations; it is marked **inactive.** Inactive scopes are not added to access tokens |
| Requesting an unassociated scope | Requesting a scope that is not associated with the app client **fails authentication** |

In the console you create resource servers under `Branding` → `Domain`, and you enable custom scopes in the app client's `Login pages`. The resource server quota is 25 per user pool (up to 300) ([Section 3.9](#39-service-quotas-and-billing-unit)).

> — Source: [Scopes, M2M, and resource servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html)

### 5.5 The Three OAuth 2.0 Grants 🔄

The flows in which scopes can be requested are commonly presented as "the OAuth 2.0 authorization code grant flow, the implicit flow, and the client credentials flow" with **no ranking whatsoever.** The current documentation does not treat these three as equals.

| Grant | `response_type` | Tokens issued | The documentation's assessment |
|---|---|---|---|
| **Authorization code** | `code` | ID, Access, and Refresh — **all three** | **The most secure form of authorization grant** |
| **Implicit** | `token` | ID and Access — **only two** | **A legacy authorization grant** |
| **Client credentials** | — | Access | **Authorization only**, for machine-to-machine access |

The authorization code grant exchanges the code for tokens at the token endpoint, so it **does not show the token contents directly to the user.** The documentation states that this grant is the **only way in Amazon Cognito to receive all three token types from the authorization server.**

The implicit grant returns `access_token` and `id_token` appended to the callback URL and has no further interaction with the token endpoint. The documentation marks it legacy and advises that, **because a user can intercept and inspect the tokens unlike with the authorization code grant, you should configure the app client to support only the authorization code grant to prevent token delivery through the implicit grant** ([Section 11.3](#113-discouraged-and-unsupported-items)).

The client credentials grant carries three constraints.

| Constraint |
|---|
| The app client **must have a client secret** ([Section 4.9](#49-app-clients-public-and-confidential)) |
| It must support **only the client credentials grant.** It **cannot be enabled on the same app client** as the implicit or authorization code grant |
| It **adds cost** to your AWS bill |

> — Source: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

### 5.6 PKCE 🆕

**PKCE (Proof Key for Code Exchange)** is an extension of the OAuth 2.0 authorization code grant for public clients that **prevents an intercepted authorization code from being exchanged for tokens.** It is the standard reinforcement when using the authorization code grant from a browser or mobile app.

It works in four steps.

| Step | Content |
|---|---|
| 1 | The application generates a unique string, the **`code_verifier`** |
| 2 | It applies a **SHA256 hash** to that string, **base64 encodes** the result, and passes it as the **`code_challenge`** parameter on the Authorize endpoint request (`code_challenge_method=S256`) |
| 3 | When exchanging the authorization code for tokens, it sends the `code_verifier` string in **plaintext** in the `code_verifier` parameter to the Token endpoint |
| 4 | Amazon Cognito **performs the same hash and encoding** and returns the ID, Access, and Refresh tokens only if the result matches the `code_challenge` from the authorization request |

Implementation requires a **domain** and a **public app client** on the user pool.

> — Source: [Using PKCE in authorization code grants](https://docs.aws.amazon.com/cognito/latest/developerguide/using-pkce-in-authorization-code.html)

---

## 6. Tokens

This is the core of the module, and also where **the largest number of corrections are concentrated.**

### 6.1 The User Pool Sign-in Flow

User pool sign-in proceeds in four steps.

| Step | Content |
|---|---|
| 1 | Create a user pool and register an app client. Define which attributes are required and need verification ([Section 5.2](#52-required-and-verifiable-attributes)) |
| 2 | The user submits sign-in information to the app |
| 3 | Amazon Cognito verifies the sign-in information |
| 4 | On success it **creates a session** and returns **ID, Access, and Refresh tokens** for the authenticated user |

After step 4 the app can do one of two things, and this divides the remaining half of the module.

| Path | Content | In this document |
|---|---|---|
| Use the tokens as they are | Authorize access to downstream resources and APIs such as Amazon API Gateway | [Section 8](#8-securing-api-access) |
| Exchange the tokens | Exchange them for **temporary AWS credentials** to access other AWS services | [Section 7](#7-identity-pools) |

The documentation presents the same two branches. User pool tokens are **evidence of OIDC authentication and a means of requesting resource access**, and **the claims in the token are the user information.**

> — Source: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.2 Comparing the Three Tokens

| Item | ID token | Access token | Refresh token |
|---|---|---|---|
| What it carries | Claims about the user's **identity** (name, family name, email address) | Claims about the authenticated user, plus the **group list and scope list** | Opaque |
| What it is for | **Authenticates** the user. Also used to authenticate the user to a resource server or server application | **Authorizes** API operations | Obtains new tokens or **revokes** existing ones |
| Format | JWT. **Can be decoded from base64url into plaintext JSON** | JWT. Can be decoded | **Encrypted.** Only the user pool can read it; opaque to users and administrators |
| `token_use` value | `id` | `access` | — |
| Validity | 5 minutes to 1 day | 5 minutes to 1 day | 30 days by default (60 minutes to 10 years) |
| Signing key | RSA key pair A | **RSA key pair B** (different from the ID token) | — |

Two things must be remembered together.

- The `cognito:groups` claim appears in **both the access token and the ID token.** Some material presents this claim as access-token-only, which is inaccurate ([Section 11.1](#111-differences-from-the-courseware)).
- **The name of the username claim differs between the two tokens.** The ID token uses `cognito:username` and the access token uses `username`.

> — Source: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.3 JWT Structure and Corrections to the Courseware Example 🔄

A JWT is three sections separated by periods (`.`): **header, payload, and signature.** A commonly used ID token example has **five things to correct.**

| What was corrected | Original | This document |
|---|---|---|
| Closing quotation mark in the header | `"1234example=“` — the closing mark is a **left double quotation mark** (`“`) rather than a straight quote (`"`) | Corrected to a straight quote |
| Commas in the header | The comma at the end of the `kid` line is not visible and there is a **trailing comma** after the last `alg` line, so it is not valid JSON | Corrected to parseable JSON |
| Signature algorithm | The header says `alg: RS256` but the signature line says **`HMACSHA256(..., {secret})`** | Standardized on `RS256` (RSA + SHA-256) |
| Claim name casing | `Sub`, `Aud`, `Jti`, and `Scope` written with **initial capitals** | All lowercase |
| `token_use` value notation | The values written as `ID` and `access` in prose | `id` and `access` (lowercase strings) |

The corrected header:

```json
{
  "kid": "1234example=",
  "alg": "RS256"
}
```

`kid` points to the key used to secure the token's JSON Web Signature (JWS) and is a **truncated reference to a 2048-bit RSA private signing key.** You can see the user pool's signing key IDs at the `jwks_uri` endpoint ([Section 6.8](#68-verifying-a-jwt)).

🔄 **The signature algorithm is `RS256`.** User pools use an **RSA signature with SHA-256.** `HMACSHA256` is a **symmetric HMAC** using a shared secret key while `RS256` is an **asymmetric signature**. Some source material mixes two algorithms within a single example. Verification uses the user pool's **public JWKS**, not a shared secret ([Section 11.1](#111-differences-from-the-courseware)).

> — Source: [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html)

The payload example is still valid. Only values that look like real accounts were replaced with documentation example forms.

```json
{
  "sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "aud": "xxxxxxxxxxxxexample",
  "email_verified": true,
  "token_use": "id",
  "auth_time": 1500009400,
  "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example",
  "cognito:username": "StudentA",
  "exp": 1500013000,
  "given_name": "StudentA",
  "iat": 1500009400,
  "email": "StudentA@example.com",
  "jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "origin_jti": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
}
```

🔄 **The payload is not encrypted.** This is the most important correction in this module.

Some source material describes the payload as encrypted information in several places, with phrasing such as "**encrypted** information about the claims of the key" and "claims: a payload with **encrypted** user information."

Here is what the documentation says.

| Target | Reality |
|---|---|
| ID token · Access token | Amazon Cognito issues them as **base64url encoded strings**, and they **can be decoded from base64url into plaintext JSON** |
| Refresh token | **Encrypted**, opaque to user pool users and administrators, and **readable only by the user pool** |

The payload example above is itself plaintext JSON, so **the original material contradicts its own example.** What this difference means in practice is clear.

- **Do not put secrets in the payload.** Anyone can decode and read it.
- Integrity is guaranteed by **signature verification**, not encryption ([Section 6.8](#68-verifying-a-jwt)).
- The documentation presents **protecting all tokens in transit and in storage** as a best practice, because tokens can carry personally identifiable information and security model information.

Accordingly, the claim that this payload is "encrypted" is false.

> — Source: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

### 6.4 ID Token Claims

The default payload claims of the ID token, marked with what the original material covers and what it does not.

| Claim | Content | Original |
|---|---|---|
| `sub` | The **unique identifier (UUID)** of the authenticated user | Present |
| `aud` | The **user pool app client** that authenticated the user. Amazon Cognito puts the **same value** in the access token's `client_id` | Present |
| `iss` | The user pool that generated the token. The format is `https://cognito-idp.<Region>.amazonaws.com/<user pool ID>` | Present |
| `token_use` | The token's intended purpose. In an ID token the value is **`id`** | Present |
| `auth_time` | The Unix time at which the user **completed authentication** | Present |
| `exp` · `iat` | Expiration time · issued-at time | Partial |
| `jti` | The unique identifier of the JWT | Present |
| `origin_jti` | The **token revocation identifier**, linked to the refresh token | 🔄 Described only as "a JWT identifier marking where authentication occurred" |
| `cognito:username` | The username within the user pool | Present |
| `email` · `email_verified` | Email address and whether it is verified | Present |
| `cognito:groups` | The **list of groups** the user belongs to | 🆕 Absent (presented as access-token-only) |
| `cognito:roles` | The set of **permitted role ARNs** | 🆕 Absent |
| `cognito:preferred_role` | The **role ARN** of the highest-priority group | 🆕 Absent |
| `identities` | Identity information for a **federated user** | 🆕 Absent |
| `nonce` · `event_id` · `middle_name` | — | 🆕 Absent |

There is a caution when handling `sub`. **Because usernames may not be unique within a user pool, `sub` is the best way to identify a user.** However, Amazon Cognito generates `sub` in its own format that does not follow any particular UUID format (including RFC UUID), so **you must not validate the format strictly.**

Applications must **verify that the `iss` value matches the expected issuer URL.**

An ID token can contain OIDC standard claims and the custom attributes defined on the user pool. Custom attribute values are **always recorded as strings** regardless of the attribute type, and their names always carry the **`custom:` prefix** ([Section 5.1](#51-attributes)).

> — Source: [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html)

### 6.5 Access Token Claims

The access token's header structure is the same as the ID token's. **But the signing key differs.**

🆕 **Amazon Cognito creates two RSA key pairs per user pool and signs the access token and the ID token with different private keys.** As a result the **`kid` values do not match between the two tokens of the same user session, and your app code must verify the two tokens independently.** This fact is easy to overlook.

| Claim | Content | Original |
|---|---|---|
| `sub` | The unique identifier (UUID) of the authenticated user | Present |
| `client_id` | The **user pool app client** that authenticated the user. The **same value** as the ID token's `aud` | 🆕 Absent |
| `aud` | The **URL of the API** the access token is meant to authorize. Present **only when** the application requested a resource binding from the authorization server | 🆕 Absent |
| `token_use` | The value is **`access`** | Present |
| `scope` | The **list of OAuth 2.0 scopes** issued to the signed-in user | Present |
| `cognito:groups` | The list of groups the user belongs to | Present |
| `username` | The username within the user pool | Present |
| `iss` · `auth_time` · `origin_jti` · `jti` | Same meaning as in the ID token | Present |
| `device_key` · `version` · `event_id` · `exp` · `iat` | — | 🆕 Absent |

The constraint on scopes is the same as in [Section 5.4](#54-resource-servers-and-scopes). A token from the token endpoint can carry any scope the app client supports, but **a token from Amazon Cognito API sign-in carries only the `aws.cognito.signin.user.admin` scope.**

🔄 **The purpose of the access token must be read broadly.** It is commonly narrowed to "authorizes API operations for users in the user pool." The documentation presents both user pool self-service operations (adding, changing, and deleting attributes) and **external API authorization**, and states that Amazon API Gateway supports authorization with Amazon Cognito access tokens ([Section 8](#8-securing-api-access)).

On the Essentials or Plus feature plan you can **add scopes to an access token at runtime with a pre token generation Lambda trigger** ([Section 6.10](#610-customizing-tokens)).

> — Source: [Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html)

### 6.6 Token Validity

The token validity ranges **match the current documentation.**

| Token | Default | Configurable range | Configured per |
|---|---|---|---|
| ID token | — | **5 minutes to 1 day** | App client |
| Access token | — | **5 minutes to 1 day** | App client |
| Refresh token | **30 days** | **60 minutes to 10 years** | App client |

🔄 **One reference point is commonly misstated.** Some material writes the refresh token default expiration as "30 days after the application user **signs up** for the user pool." The documentation's wording is "30 days after the user **signs into your user pool**," so the reference point is sign-in, not sign-up ([Section 11.1](#111-differences-from-the-courseware)).

🆕 **With managed login, setting durations under one hour is meaningless.** The documentation advises against specifying a minimum duration shorter than one hour for access and ID tokens when using managed login, because **managed login sets a cookie in the browser that is valid for one hour.** Setting token durations under one hour does not affect the cookie's validity or the one hour during which the user can reauthenticate without additional credentials ([Section 3.4](#34-sign-in-pages-managed-login-and-hosted-ui-classic)).

> — Source: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 6.7 Refresh Token Rotation 🆕

The refresh token is often described only as something you can use to "retrieve new ID and Access tokens." The documentation **recommends refresh token rotation as a security best practice.**

| Item | Rotation on | Rotation off |
|---|---|---|
| The original token on refresh | **Invalidated**, and a new refresh token is issued | Remains valid |
| The refresh response | Returns ID, Access, **and Refresh** tokens | Returns only Access and ID tokens |
| Duration of the new token | The **remaining duration** of the original refresh token | — |
| Grace period | **Up to 60 seconds** on the original token for retries | — |
| JWT size | `origin_jti` and `jti` are added to access and ID tokens, so they **grow** | — |

🆕 **There is a trap here.** Rotation is **not compatible with the `REFRESH_TOKEN_AUTH` authentication flow.** You must disable that flow on the app client and design the application to send refresh requests through the **`GetTokensFromRefreshToken`** API operation ([Section 4.7](#47-authentication-flows)).

There are three token refresh paths.

| Path | Compatibility with rotation |
|---|---|
| The `GetTokensFromRefreshToken` API | Compatible |
| The `REFRESH_TOKEN_AUTH` flow of `InitiateAuth` / `AdminInitiateAuth` | **Not compatible** |
| The `refresh_token` grant on the OAuth token endpoint | — |

> — Source: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 6.8 Verifying a JWT 🆕

The verification procedure is not covered in the original material. Something like "the signature is calculated from the token's header and payload and confirms the key source and whether it has been tampered with" is the whole of its treatment of signatures.

The documentation is explicit about why verification is needed. **JWTs can easily be decoded, read, and modified.**

| If this is modified | The risk |
|---|---|
| Access token | **Privilege escalation** |
| ID token | **Identity impersonation** |

That is why **an application that processes JWTs from OIDC authentication must perform verification on every sign-in.** The procedure is three steps.

| Step | Content |
|---|---|
| 1. Decode the token | If the base64url encoded JWT is not in the form `[JSON header].[JSON payload].[signature]`, **it is not a valid Amazon Cognito token and can be discarded** |
| 2. Compare `kid` | **Download and store the user pool's public JWKs** and compare the local `kid` with the public `kid` |
| 3. Verify the claims | Check `exp`, `aud` (or `client_id`), `iss`, and `token_use` |

The `jwks_uri` format and the JWK fields:

```text
https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json
```

The JWK fields are `kid`, `alg`, `kty`, `e`, `n`, and `use`.

The claims to check in step 3:

| Claim | What to confirm |
|---|---|
| `exp` | That it has not expired |
| `aud` (ID token) / `client_id` (access token) | That it **matches the app client ID** created in the user pool |
| `iss` | That it matches the user pool (`https://cognito-idp.<Region>.amazonaws.com/<userpoolID>`) |
| `token_use` | `access` if you only accept access tokens, `id` if you only use ID tokens, either if you use both |

🆕 **Be prepared for key rotation.** Because Amazon Cognito can rotate the user pool's signing keys, the best practice is to **cache the public keys in your app using `kid` as the cache key and refresh them periodically.** If you receive a token whose **issuer matches but whose `kid` differs**, the signing key may have been rotated, so refresh the cache from `jwks_uri`.

For Node.js apps AWS recommends the **`aws-jwt-verify`** library.

```javascript
// Verify an access token with aws-jwt-verify.
// Specifying tokenUse makes the library check the token_use claim as well.
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-1_example',
  clientId: 'xxxxxxxxxxxxexample',
  tokenUse: 'access', // use 'id' when verifying an ID token
});

try {
  // On success it returns the decoded payload.
  // The library fetches and caches the public keys from jwks_uri and handles kid rotation.
  const payload = await verifier.verify(accessToken);
  console.log('Verification succeeded. User:', payload.sub);
} catch (err) {
  // Signature mismatch, expiration, aud mismatch, and token_use mismatch all land here.
  console.error('The token is not valid:', err);
}
```

> — Source: [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

### 6.9 Token Revocation 🆕

Token revocation is not covered in the original material, and `origin_jti` is often described only as "a JWT identifier marking where authentication occurred." **`origin_jti` is the token revocation identifier.**

Revoking a refresh token invalidates **all access tokens that refresh token previously issued**, and **other refresh tokens issued to the user are unaffected.** When Amazon Cognito revokes a token it treats access and ID tokens with the same `origin_jti` value as invalid.

There are four ways to revoke.

| Method | What it revokes | Who calls it |
|---|---|---|
| `RevokeToken` | All access tokens for the given refresh token, including the initial access token of an interactive sign-in | The app |
| The Revoke endpoint (`/oauth2/revoke`) | The given refresh token and all ID and access tokens it generated. Available **after you add a domain** to the user pool | The app |
| `GlobalSignOut` | **All** refresh, ID, and access tokens for the requesting user | A self-service operation the user authorizes with **their own access token** |
| `AdminUserGlobalSignOut` | **All** refresh, ID, and access tokens for the target user | A server-side operation an administrator authorizes with **IAM credentials** |

🆕 **This is the point that affects API authorization design directly.** A user pool JWT is a **self-contained token** carrying the signature and expiration time assigned at creation. Therefore **a revoked token cannot be used for Amazon Cognito API calls that require a token, but it still appears valid when verified with a JWT library that only checks the signature and expiration.**

In other words, "signing out means that token can no longer be used" does not hold automatically. Turning revocation into actual access denial requires additional checks on the verifying side.

Three things about configuration:

| Item | Content |
|---|---|
| Default | Creating a new user pool client **enables token revocation by default** (console, CLI, and API alike) |
| JWT size | Enabling revocation adds the `origin_jti` and `jti` claims to access and ID tokens, so **token size grows** |
| Reverting | Disabling revocation on an app client that had it enabled **does not reactivate already revoked tokens** |

> — Source: [Ending user sessions with token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)

### 6.10 Customizing Tokens 🆕

ID and access token claims are often presented only as a **fixed list.** In practice you can customize the tokens delivered to your app.

| Item | Content |
|---|---|
| Where | The **pre token generation Lambda trigger** ([Section 4.11](#411-lambda-triggers)) |
| What | **Add, modify, or suppress** token claims |
| What the trigger receives | The **default set of claims**, including OAuth 2.0 scopes, user pool group membership, and user attributes |
| What the trigger does | Returns the modified claims to Amazon Cognito at runtime |
| Plan requirement | **Access token** customization requires a plan **other than Lite** and the trigger configuration updated to **event version 2** ([Section 3.5](#35-feature-plans-lite-essentials-plus)) |
| Cost | Access token customization using version 2 events **incurs additional cost** |

> — Source: [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)

---

## 7. Identity Pools

If a user pool is where "who they are" is handled, an identity pool is where **"what they can do with AWS resources"** is handled.

### 7.1 What an Identity Pool Does

An identity pool is a collection of **unique identifiers (identities)** you assign to users or guests to authorize them to receive **temporary AWS credentials.** The documentation presents four things it does.

| What it does | Content |
|---|---|
| Issues credentials | **Issues AWS credentials** so your app can serve resources to users |
| Authenticates users | Authenticates users with **trusted identity providers** such as a user pool or a SAML 2.0 service |
| Guests | **Optionally** issues credentials for guest users as well |
| Manages permissions | Manages permissions with **role-based** and **attribute-based** access control |

🔄 **"AWS access keys" are temporary AWS credentials.** Some material writes the question for choosing an identity pool as "do you need to grant the user **AWS access keys**?" The documentation states that identity pools issue **temporary AWS credentials**. "Access keys" can be confused with an IAM user's **long-term access keys** ([Section 11.1](#111-differences-from-the-courseware)).

An identity pool **does not require integration with a user pool.** A user pool can also issue authenticated JWTs directly to apps, web servers, and APIs without an identity pool. The three-step flow for using both together is in [Section 3.3](#33-using-both-together).

> — Source: [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)

### 7.2 It Does Not Store User Profiles

The statement "identity pools do not store any user profiles" is **correct.** In the documentation's comparison table, `User directory — Store user profiles for authentication` is checked **only for user pools** and not for identity pools.

What an identity pool stores is an **identity**. An identity is a **UUID that links an app user and that user's credentials to a profile in an external user directory that has a trust relationship with the identity pool.**

A related characteristic also matches the documentation: if you use two different identity pools for two applications, the same end user has a different unique identifier in each identity pool. In the documentation's wording, **Amazon Cognito UUIDs are unique per user pool or identity pool.**

🆕 Three cautions are rarely covered.

| Item | Content |
|---|---|
| Format validation | Amazon Cognito UUIDs **do not follow any particular UUID format (including RFC UUID), so you must not validate the format strictly.** The documentation's example identity ID is of the form `us-east-1:12345678-1234-1234-1234-123456790ab`, a Region prefix and a UUID joined by a colon |
| Different from the IdP's `sub` | The UUID used by the `cognito-identity.amazonaws.com:sub` condition key in a trust policy is the **identity pool's identity ID, not the original identity provider's `sub` value** ([Section 7.6](#76-trust-policy-condition-keys)) |
| Deletion | Deleting an identity removes the identifying information Amazon Cognito stored, and when the user requests credentials again they receive a **new identity ID** if the identity pool still trusts that IdP |

> — Source: [Common Amazon Cognito terms and concepts](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-terms.html)

### 7.3 Guest Access

The statements that "for unauthenticated users the default IAM role and policy apply" and that there are "unauthenticated guests" are correct. That identity pools can provide AWS credentials to unauthenticated users also matches the documentation.

An identity pool supports **two types of identity.**

| Type | Who | Role |
|---|---|---|
| Authenticated identities | Users authenticated by a **supported identity provider** | The default role for authenticated users |
| Unauthenticated identities | Usually **guest users** | A limited-permission role for guests |

When a request arrives Amazon Cognito **determines the identity type and responds with the role assigned to that type and the policies attached to the role.**

🆕 **Guest access must be enabled separately.** This choice is rarely covered.

| Item | Content |
|---|---|
| Default state | In an identity pool that does not support guest access, the console's `Guest access` status is **`Inactive`** |
| Condition to enable | You must **specify a default IAM role** for guest users |
| Console choice | When creating an identity pool you select `Authenticated access`, `Guest access`, or **both** |
| Using an existing role | The role trust policy must include **`cognito-identity.amazonaws.com`** ([Section 7.6](#76-trust-policy-condition-keys)) |
| Obtaining an identity ID | When guest access is enabled a user can **request a new identity ID at any time with the `GetId` API**, and the application is **expected to cache that identity ID** for subsequent calls |

> — Source: [Identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)

### 7.4 The Enhanced Flow and the Basic classic Flow 🆕

This distinction is rarely covered. Yet the APIs older material commonly presents are **the discouraged one of the two.**

An identity pool provides **two flows** for public provider authentication. The call sequence of each flow as a diagram:

```text
Enhanced (simplified) flow:
  GetId  ->  GetCredentialsForIdentity  ->  temporary AWS credentials (1 hour)

Basic (classic) flow:
  GetId  ->  GetOpenIdToken  ->  AssumeRoleWithWebIdentity  ->  temporary AWS credentials
```

| Item | Enhanced (simplified) flow | Basic (classic) flow |
|---|---|---|
| Operation sequence | `GetId` → **`GetCredentialsForIdentity`** (2 steps) | `GetId` → **`GetOpenIdToken`** → **`AssumeRoleWithWebIdentity`** (3 steps) |
| Who chooses the role | The **identity pool configuration** manages IAM role selection and credential retrieval logic | The **application** directly selects the IAM role the user assumes |
| Who returns the credentials | The identity pool | **AWS STS** |
| Credential validity | **One hour** | You can request a custom role session duration |
| Role mapping | You can configure default role selection, ABAC, and RBAC | Role selection logic is implemented in the client |
| Account boundary | The IAM role must be in the **same AWS account** as the identity pool | The application can request a role in a **different account** |
| The documentation's assessment | **The most secure choice with the least developer effort** | Finer control over the credentials you distribute |

`GetCredentialsForIdentity` is **functionally equivalent to calling `GetOpenIdToken` followed by `AssumeRoleWithWebIdentity`.**

The **authentication artifact** the identity pool receives differs per provider.

| Provider | Artifact |
|---|---|
| Amazon Cognito user pool | **ID token** |
| OIDC | ID token |
| SAML 2.0 | **SAML assertion** |
| Social providers | **Access token** |

🔄 **Some older material describes a flow that does not match the document it references.** It states that the user issues `GetOpenIdToken` and `AssumeRoleWithWebIdentity` requests, while the reference link points to the [Understanding Amazon Cognito Authentication Part 4: Enhanced Flow](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-authentication-part-4-enhanced-flow/) blog post. Those two APIs are the **basic (classic) flow**, so the flow being described and the document being referenced are different flows. The reference URL itself is live, but this document verified the facts about the flows in the developer guide ([Section 11.1](#111-differences-from-the-courseware)).

🔄 **The basic flow is discouraged.** The documentation presents **not enabling basic (classic) authentication by default when creating a new identity pool** as a best practice. To use the basic flow you must first evaluate the trust relationships of your IAM roles for web identities, **implement the role selection logic in the client, and then protect that client from being tampered with by users** ([Section 11.3](#113-discouraged-and-unsupported-items)).

There is also a point where the two flows conflict. **Attempting `GetOpenIdToken` on an identity pool that has role mappings (`RoleMappings`) produces an error.**

```text
Basic (classic) flow is not supported with RoleMappings, please use enhanced flow.
```

In the basic flow, what `GetOpenIdToken` returns is a **new OAuth 2.0 token issued by the identity pool.** The app presents that token as the **`WebIdentityToken`** parameter of the `AssumeRoleWithWebIdentity` request. The documentation advises **validating the OpenID token in your app before submitting it** and notes that you can use the SDK's OIDC library or a library such as `aws-jwt-verify` ([Section 6.8](#68-verifying-a-jwt)).

The difference in permission scope between the two flows is also worth knowing. **A basic flow `AssumeRoleWithWebIdentity` request gives the app the greater ability to request credentials for any IAM role with a sufficient trust policy configured, whereas an enhanced flow `GetCredentialsForIdentity` request requests a role based on the token contents.**

> — Source: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

### 7.5 Four Ways a Role Is Chosen 🆕

Identity pool role selection is commonly described only as "for authenticated users, authorize through the user pool or third-party federation; for unauthenticated users, the default IAM role and policy apply." In practice there are **four ways.**

| Approach | Based on | Where it is configured |
|---|---|---|
| Default role | The identity type (authenticated or guest) | Identity pool settings |
| Token based | The ID token's **`cognito:preferred_role`** and **`cognito:roles`** claims | The IAM role on the user pool group ([Section 5.3](#53-groups)) |
| Rule-based mapping | **Claims** in the IdP token | The identity pool's role mapping |
| Attribute based (ABAC) | Attributes from the token or assertion mapped to **principal tags** | Attributes for access control |

When there are multiple roles, the **order** in which the identity pool chooses is fixed.

| Rank | Condition | Result |
|---|---|---|
| 1 | The **`CustomRoleArn`** parameter of `GetCredentialsForIdentity` is set and **matches** a role in the `cognito:roles` claim | Uses that role |
| 1 | `CustomRoleArn` is set but **does not match** | **Denies access** |
| 2 | The **`cognito:preferred_role`** claim is set | Uses that role |
| 3 | There is no `preferred_role`, only `cognito:roles`, and no `CustomRoleArn` | Determined by the console's `Role resolution` setting or the API's **`AmbiguousRoleResolution`** field |

**Rule-based mapping** maps claims in the IdP token to IAM roles. Each rule specifies a **token claim, a match type, a value, and an IAM role.**

| Item | Content |
|---|---|
| Match types | `Equals` · `NotEqual` · `StartsWith` · `Contains` |
| Evaluation order | Rules are **evaluated in order** and the role of the **first matching rule** is used |
| Custom attributes | Rule settings need the **`custom:` prefix** to distinguish custom attributes from standard ones |
| No match | Depending on the `Role resolution` setting, either the default authenticated role is used or the request is **denied** |

🆕 **There is a case where `iam:PassRole` is required.** To let someone configure an identity pool with a role carrying permissions beyond their own, you must grant **`iam:PassRole`** permission.

> — Source: [Using role-based access control](https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html)

🆕 **Attribute-based access control (ABAC)** is called "attributes for access control" in identity pools. It maps attributes inside access and ID tokens or SAML assertions from social and enterprise identity providers to **tags you can reference in IAM permission policies.**

| Item | Content |
|---|---|
| Mapping | The console's `Attribute names` map to `Tag key for principal`. The `Claim` set as the data source determines the value of the selected tag key |
| Using it in a policy | IAM policies evaluate access with the **`${aws:PrincipalTag/tagkey}`** condition |
| Permissions needed | The role trust policy must allow `AssumeRoleWithWebIdentity`, and you must also grant permission to **apply principal tags to the user session** |
| Console options | Per IdP, configure `Inactive`, `Use default mappings` (based on the `sub` and `aud` claims), or `Use custom mappings` |
| Benefit | You can manage permissions with **a single base policy that uses user attributes** instead of building many job-specific policies, and you do not have to update policies each time you add or remove resources or users |

> — Source: [Using attributes for access control](https://docs.aws.amazon.com/cognito/latest/developerguide/attributes-for-access-control.html)

### 7.6 Trust Policy Condition Keys 🆕

"An identity pool returns AWS credentials combined with an IAM role" does not address **what trust policy that role must have.** There is a **required condition here that IAM refuses to save without.**

The token presented to AWS STS is generated by the identity pool, converted from a user pool, social, or OIDC provider token or a SAML assertion into the identity pool's own token. **The `aud` claim of that token is the identity pool ID.**

When the trust policy's `Principal` is an identity pool service principal such as `cognito-identity.amazonaws.com`, **you cannot make it so that any identity pool can assume the role.** There must be a `Condition` requiring that only your identity pool can perform `AssumeRoleWithWebIdentity`, and **the `aud` condition is required. If you try to save a role trust policy without a condition of this type, IAM returns an error.**

There are **three** OIDC federation condition keys available.

| Condition key | What it restricts | Required |
|---|---|---|
| `cognito-identity.amazonaws.com:aud` | Restricts the role to operations from **one or more identity pools** | **Required** |
| `cognito-identity.amazonaws.com:amr` | Restricts the role to **`authenticated`** or **`unauthenticated`** (guest) users | Optional |
| `cognito-identity.amazonaws.com:sub` | Restricts the role to **one or more users (UUIDs)** | Optional |

`amr` also carries provider information. When Amazon Cognito creates the token it sets `amr` to `unauthenticated` or `authenticated`, and **if it is `authenticated` the provider used for authentication is also included in the token.** So you can set an `amr` condition such as `graph.facebook.com` to create a role that **trusts only users who signed in with a specific provider.**

The shape of a trust policy for authenticated users:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "cognito-identity.amazonaws.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "us-east-1:12345678-1234-1234-1234-123456790ab"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

🆕 **Do not put `aws:SourceIp` in an enhanced flow role.** Because the enhanced flow generates the `AssumeRoleWithWebIdentity` request **on behalf of the application**, the source IP of the request is not the application client's IP, so **the condition can never be satisfied** ([Section 7.4](#74-the-enhanced-flow-and-the-basic-classic-flow)).

A misconfigured trust relationship produces this exception:

```text
AccessDenied -- Not authorized to perform sts:AssumeRoleWithWebIdentity
```

> — Source: [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html)

### 7.7 Developer-Authenticated Identities 🆕

Identity pool federation is commonly covered only through social, SAML, and OIDC IdPs. There is a separate path for **using your own backend authentication system while still issuing AWS credentials through an identity pool.**

| Item | Content |
|---|---|
| What you can do | **Register and authenticate users with your existing authentication process** while still synchronizing user data with Amazon Cognito and accessing AWS resources |
| Starting API | **`GetOpenIdTokenForDeveloperIdentity`**. It starts developer authentication for **both** the enhanced and basic flows and **authenticates the request with administrative credentials** |
| The `Logins` map | A pair of a **developer provider name** such as `login.mydevprovider` and a custom identifier |
| Enhanced combination | `GetOpenIdTokenForDeveloperIdentity` → `GetCredentialsForIdentity` |
| Basic combination | `GetOpenIdTokenForDeveloperIdentity` → `AssumeRoleWithWebIdentity` |
| Console | You add a `Custom developer provider`. **The developer provider name cannot be changed or deleted after it is added** |

There is a caution in the enhanced flow. You call `GetCredentialsForIdentity` with a `Logins` map whose **key is the issuer of the token returned by `GetOpenIdTokenForDeveloperIdentity` and whose value is the token itself**, and **the `Logins` map key must exactly match the token's `iss` claim; a mismatch raises `NotAuthorizedException`.** A `GetCredentialsForIdentity` call made this way returns temporary credentials for the identity pool's **default authenticated role.**

The warning the documentation attaches, carried over: **developer authentication is a shortcut that bypasses identity provider authentication validation, and because Amazon Cognito trusts the AWS credentials that authorize the request without additionally validating the request contents, you must protect the secret that authorizes developer authentication from user access.**

> — Source: [Developer-authenticated identities](https://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html)

---

## 8. Securing API Access

This is where the tokens and credentials from the previous sections are **actually placed in front of an API.**

### 8.1 REST API User Pool Authorizer

The five steps of REST API integration match the current documentation.

| Step | Content |
|---|---|
| 1 | Create a user pool |
| 2 | Obtain the **user pool ID, client ID**, and if applicable the **client secret** |
| 3 | Integrate the REST API with the user pool. Create an authorizer of type **`COGNITO_USER_POOLS`** |
| 4 | Configure the API method to use that authorizer |
| 5 | Deploy the API and test calls with a token |

Here is what happens at call time. The client signs the user in to the user pool to obtain an ID token or access token and calls the API method with that token, usually in the request's **HTTP `Authorization` header.** **The call succeeds only when the required token is supplied and valid.**

🔄 **The header name is easily blurred in translation.** Some material renders it as "using authorization from the token source as the header name," but the header the documentation names is **`Authorization`.**

🔄 **The ID token and the access token serve different purposes.** They are commonly lumped together as "identity or access token." The documentation distinguishes them.

| Token | What it authorizes against |
|---|---|
| ID token | The **identity claims** of the signed-in user |
| Access token | The **custom scopes** of access-protected resources ([Section 5.4](#54-resource-servers-and-scopes)) |

You can also use a **user pool owned by a different AWS account.** The API developer must provide the client developer with the user pool ID, client ID, and if applicable the client secret.

To sign in with Amazon Cognito identities and also obtain **temporary credentials that use IAM role permissions**, use an identity pool and set each method's authorization type to **`AWS_IAM`** ([Section 8.3](#83-iam-authorization) · [Section 7](#7-identity-pools)).

> — Source: [Control access to REST APIs using Amazon Cognito user pools as an authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)

### 8.2 HTTP API JWT Authorizer 🆕

Often **only the REST API integration** is presented. For HTTP APIs you use Amazon Cognito through a **JWT authorizer**, not a `COGNITO_USER_POOLS` authorizer. This is the implementation-level basis for the statement verified in modules 2 and 10 that "REST supports Cognito directly and HTTP uses it through a JWT authorizer."

The authorization workflow is four steps.

| Step | Content |
|---|---|
| 1. Locate the token | Look for the token in `identitySource` (either the token alone or a token with the **`Bearer` prefix**) |
| 2. Decode | Decode the token |
| 3. Verify the signature | Verify the algorithm and signature with the public key fetched from the issuer's `jwks_uri`. **Only RSA-based algorithms are currently supported** |
| 4. Validate the claims | Check the claims in the table below |

Step 3 carries an operationally important point. **Because API Gateway may cache the public key for two hours, the best practice is to allow a grace period in which both the old and new keys are valid when rotating keys.**

| Claim | What to confirm |
|---|---|
| `kid` | Must match a key at `jwks_uri` |
| `iss` | Must match the `issuer` configured on the authorizer |
| `aud` or `client_id` | Must match one of the configured `audience` values. **`client_id` is validated only when `aud` is absent; if both are present `aud` is evaluated** |
| `exp` | Must be **after** the current UTC time |
| `nbf` · `iat` | Must be **before** the current UTC time |
| `scope` or `scp` | Must include **at least one** of the route's `authorizationScopes` |

If any step fails, API Gateway rejects the request. After verification API Gateway passes the token's claims to the route's integration, and a Lambda integration accesses them at this path:

```text
$event.requestContext.authorizer.jwt.claims.<claim>
```

The `IssuerUrl` format when using Amazon Cognito as the identity provider:

```text
https://cognito-idp.<Region>.amazonaws.com/<user pool ID>
```

🆕 **Requiring scopes is recommended.** **Because there is no standard mechanism to distinguish a JWT access token from other JWTs such as an OIDC ID token**, if your API authorization does not require an ID token it is recommended to configure the route to require authorization scopes. This is where you meet the constraint in [Section 5.4](#54-resource-servers-and-scopes): an access token from `InitiateAuth` carries only the `aws.cognito.signin.user.admin` scope, so it will not pass a route requiring a custom scope.

> — Source: [Control access to HTTP APIs with JWT authorizers in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html)

### 8.3 IAM Authorization 🆕

The "authentication workflow for IAM identity-based policies" is often summarized only as "API Gateway evaluates the identity management policies for the requested resource and allows or denies the request." **There is a setting here that, if omitted, leaves your API open.**

When IAM authorization is enabled the client must sign requests with AWS credentials, using **Signature Version 4 (SigV4)** or **SigV4a.**

The shape of the policy:

| Element | Format |
|---|---|
| `Action` | `execute-api:<action>`. The values are `*` (all actions), **`Invoke`** (call the API with a client request), and `InvalidateCache` (invalidate the API cache) |
| `Resource` | `arn:aws:execute-api:<region>:<account-id>:<api-id>/<stage-name>/<HTTP-VERB>/<resource-path-specifier>` |
| `HTTP-VERB` | One of `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "execute-api:Invoke",
      "Resource": "arn:aws:execute-api:us-east-1:123456789012:abcd1234ex/prod/GET/notes"
    }
  ]
}
```

🆕 **This is the one line that matters most.** For the IAM policy to take effect you must **enable IAM authentication by setting the API method's `authorizationType` property to `AWS_IAM`. If you do not, that API method becomes publicly accessible.** Writing the policy and forgetting the method setting leaves the API open with the policy doing nothing.

For private APIs you combine **API Gateway resource policies and VPC endpoint policies.**

> — Source: [Control access for invoking an API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html)

### 8.4 Lambda Authorizers 🔄

The five-step Lambda authorizer workflow **matches the documentation exactly.**

| Step | Content |
|---|---|
| 1 | The client calls the method passing a **bearer token or request parameters** |
| 2 | API Gateway checks whether a Lambda authorizer is configured for the method request and invokes the function if it is |
| 3 | The function authenticates the caller (by calling an OAuth provider, obtaining a SAML assertion, generating an IAM policy from request parameters, or looking up credentials in a database) |
| 4 | The function returns an **IAM policy and a principal identifier.** **If it does not, the call fails** |
| 5 | API Gateway evaluates the IAM policy and returns a status code such as **`403 ACCESS_DENIED`** on deny, or invokes the method on allow |

Enabling authorization caching caches the policy so the authorizer function is not invoked again.

🔄 **The type names and the recommendation need correcting.** The two types are commonly called "token based (token authorizer)" and "request parameter based (request authorizer)" **without saying which is recommended.**

| Type | Identity source | Caching behavior |
|---|---|---|
| **`REQUEST`** (recommended) | A **combination** of headers, query string parameters, `stageVariables`, and `$context` variables | Checks that all specified identity sources are present and, if any is missing, null, or empty, **returns `401 Unauthorized` without invoking the function** |
| `TOKEN` | A **bearer token** such as a JWT or OAuth token | The header name specified as the token source becomes the **cache key.** You can pre-validate the token with a regular expression (`IdentityValidationExpression`, `TOKEN` only) |

The documentation **recommends the `REQUEST` authorizer because it can use multiple identity sources and separate cache keys.** The fact that the previous name for a Lambda authorizer was a **custom authorizer** is also rarely covered ([Section 11.3](#113-discouraged-and-unsupported-items)).

> — Source: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

### 8.5 Comparing the Four Approaches

There are four choices for what you can put in front of an API.

| Approach | API type | What the client sends | What it authorizes against | Where it is configured |
|---|---|---|---|---|
| User pool authorizer | **REST** | ID or access token (`Authorization` header) | Identity claims or custom scopes | A `COGNITO_USER_POOLS` authorizer |
| JWT authorizer | **HTTP** | A JWT (the `Bearer` prefix is allowed) | `issuer`, `audience`, and per-route `authorizationScopes` | A JWT authorizer |
| `AWS_IAM` | REST · HTTP | A **request signed with SigV4** | `execute-api:Invoke` in an IAM policy | The method's `authorizationType` |
| Lambda authorizer | REST · HTTP | A bearer token or request parameters | **The IAM policy the function returns** | A `REQUEST` or `TOKEN` authorizer |

Integrating Amazon Cognito into an application is commonly pointed at SDK usage, with [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html) as the reference. That link is still valid, and the documentation explains that an Amazon Cognito implementation is a **combination of console and SDK management tools with SDK libraries in your application.** It states that the integration with the least effort is **managed login**, in which you send users to the hosted sign-in page with an OIDC library ([Section 10.3](#103-how-to-integrate-with-an-application)).

> — Source: [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html)

---

## 9. Implementation Best Practices 🆕

The third module objective is **"observe Amazon Cognito implementation best practices."** Yet **the original material has no content that corresponds to that objective.** There is no section titled after best practices and no passage that enumerates them ([Section 11.1](#111-differences-from-the-courseware)).

This section fills that gap with only the items the official documentation **explicitly describes as best practices or recommendations.** The details of each are in the referenced section.

### 9.1 Authentication and Token Issuance

| Best practice | Content | Section |
|---|---|---|
| Public clients: **authorization code grant only** | The documentation marks the implicit grant **legacy** and advises configuring the app client to support only the authorization code grant to prevent token delivery through the implicit grant | [Section 5.5](#55-the-three-oauth-20-grants) |
| Implement **PKCE** | The documentation names this a security best practice for public client apps. It prevents an intercepted authorization code from being exchanged for tokens | [Section 5.6](#56-pkce) |
| **No client secret** on public clients | A client that runs in a browser or mobile device with no trusted server-side resource does not have a secret | [Section 4.9](#49-app-clients-public-and-confidential) |
| Use the **SRP flow** | SRP sends only proof of knowing the password through a hash and salt, so the request contains no readable secret. For user migration use `USER_PASSWORD_AUTH`, but the documentation advises **switching to the SRP flow, which does not send the password over the network, once migration is complete** | [Section 4.7](#47-authentication-flows) |
| Enable **refresh token rotation** | The documentation recommends this as a security best practice. It is not compatible with `REFRESH_TOKEN_AUTH`, so design for `GetTokensFromRefreshToken` | [Section 6.7](#67-refresh-token-rotation) |

> — Source: [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html)

> — Source: [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)

> — Source: [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html)

### 9.2 Handling Tokens

| Best practice | Content | Section |
|---|---|---|
| **Verify JWTs on every sign-in** | JWTs can easily be decoded, read, and modified. An application that processes JWTs from OIDC authentication must verify them on every sign-in | [Section 6.8](#68-verifying-a-jwt) |
| **Cache public keys by `kid`** and refresh periodically | The documentation presents this as a best practice because Amazon Cognito can rotate signing keys | [Section 6.8](#68-verifying-a-jwt) |
| **Verify the two tokens independently** | The access token and the ID token are signed with different RSA keys, so their `kid` values differ | [Section 6.5](#65-access-token-claims) |
| **Protect tokens in transit and in storage** | The documentation presents this as a best practice because tokens can carry personally identifiable information and security model information | [Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example) |
| **Do not put secrets in the payload** | The payload of an ID or access token is not encrypted and anyone can decode and read it | [Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example) |

> — Source: [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)

### 9.3 Authorization and IAM

| Best practice | Content | Section |
|---|---|---|
| Identity pools: the **enhanced flow** | The documentation names it the most secure choice with the least developer effort and advises not enabling basic (classic) authentication by default on new pools | [Section 7.4](#74-the-enhanced-flow-and-the-basic-classic-flow) |
| The **`aud` condition is required** in trust policies | Attempting to save a role trust policy without this condition makes IAM return an error | [Section 7.6](#76-trust-policy-condition-keys) |
| **No `aws:SourceIp`** on enhanced flow roles | The enhanced flow generates the request on behalf of the application, so the condition can never be satisfied | [Section 7.6](#76-trust-policy-condition-keys) |
| **Minimum attribute permissions** on app clients | A new app client has read and write permission for every attribute by default. Limiting to the minimum set you need is a best practice | [Section 5.1](#51-attributes) |
| **Always set `authorizationType`** | If IAM authentication is not enabled on an API Gateway method, the IAM policy has no effect and **the method is publicly open** | [Section 8.3](#83-iam-authorization) |
| Lambda authorizers: the **`REQUEST` type** | The documentation recommends it because it can use multiple identity sources and separate cache keys | [Section 8.4](#84-lambda-authorizers) |
| **Require scopes** on HTTP API routes | Because there is no standard that distinguishes ID tokens from access tokens, requiring scopes is recommended when API authorization does not need an ID token | [Section 8.2](#82-http-api-jwt-authorizer) |

> — Source: [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html)

> — Source: [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html)

### 9.4 Operations

| Best practice | Content | Section |
|---|---|---|
| Use an **Amazon SES configuration** for production email | The default email configuration is 50 per AWS account per day (not adjustable), and the documentation states that in a typical production environment the default is lower than the volume you need | [Section 4.10](#410-sms-and-email-delivery) |
| Test in the console, **deploy with IaC** | The documentation recommends building a test environment through the console and deploying the finished design to production with **AWS CloudFormation or the AWS CDK** | [Section 4.3](#43-the-console-creation-flow) |
| Use **AWS WAF** against high-volume traffic | Threat protection does not apply request rate limits, so you must pair it with an AWS WAF web ACL | [Section 3.8](#38-threat-protection) |
| **Implement password expiration yourself** | Passwords for local users in an Amazon Cognito user pool do not expire automatically. The documentation advises recording password reset metadata externally and having the application or a Lambda trigger query the age and require a reset | [Section 4.4](#44-password-policy) |
| **Implement device trust expiration yourself** | When the trust period ends the application must set the device status to `not remembered` and have the user sign in with MFA again | [Section 4.6](#46-remembered-devices) |
| **Fix the passkey RP ID before launch** | Changing the RP ID requires users to register again, so the documentation presents deciding the value before launch as a best practice | [Section 4.8](#48-passwordless-sign-in-and-passkeys) |

> — Source: [Email settings for Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)

> — Source: [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html)

> — Source: [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html)

---

## 10. The Application and Lab 6

This is where this module fits the last piece of the whole course into place, and it leads straight into the capstone lab.

### 10.1 Application Architecture

The application's request path:

| Order | Component | Role |
|---|---|---|
| 1 | User | Signs in to the web application |
| 2 | **Amazon Cognito** | Authenticates the user and issues tokens |
| 3 | **Amazon API Gateway** | Routes the request after verifying the token |
| 4 | **AWS Lambda** | Note processing logic |
| 5 | **Amazon DynamoDB** | The notes table |

The API path table:

| Function | Method | Path |
|---|---|---|
| List | `GET` | `/notes` |
| Search | `GET` | `/notes/search` |
| Create·Update | `POST` | `/notes` |
| Delete | `DELETE` | **`/notes/{id}`** |

🔄 **A common path parameter notation error.** Some material writes the delete and update paths as **`/notes/(id)`** with **parentheses.** API Gateway path parameters are written with **braces.** In the documentation's PetStore sample API the individual resource path is `/pets/{petId}` and the `pathPart` in the `get-resources` response is also `{petId}` ([Section 11.1](#111-differences-from-the-courseware)).

> — Source: [Set up a method request in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-settings-method-request.html)

🔄 **The same position is labeled differently across materials.** The data store is labeled `DynamoDB` in one place and **"notes"** for the same position in another. The API path tables are identical. This document labels them separately: **the service name is Amazon DynamoDB and the target within it is the notes table** ([Section 11.1](#111-differences-from-the-courseware)).

### 10.2 Lab 6: The Capstone

Lab 6 completes the application build by attaching **user authentication with Amazon Cognito.**

🔄 **The capstone topic list is sometimes incomplete.** It is the capstone, yet it may list only five topics from the preceding modules.

| Commonly listed | What is missing |
|---|---|
| IDE setup / application hosting / database solutions / compute with Lambda / Amazon API Gateway | **Amazon Cognito, the subject of this module**, and **module 11 (building a modern application)** |

This is not something external documentation can verify ([Section 11.1](#111-differences-from-the-courseware)). When summarizing what the lab covered you need to include both items for the list to match what the capstone actually spans.

The feature plan Lab 6 assumes was not verified. The lab guide is not part of this material ([Section 11.5](#115-items-we-could-not-verify)).

### 10.3 How to Integrate with an Application

Integrating the Amazon Cognito API into an application is commonly advised as "integrate it directly using the AWS SDK for your chosen programming language." The documentation presents three choices.

| Method | Content | Effort |
|---|---|---|
| **managed login** | Send users to the sign-in page Amazon Cognito hosts. Requires an OIDC library | **Least** |
| **AWS Amplify** | An AWS service for building full-stack applications with Amazon Cognito authentication in the backend. Provides connected UI components such as **`Authenticator`** | Moderate |
| **AWS SDK** | Add the SDK to your app, build the authentication interface yourself, and call the API operations | Most |

🆕 **AWS Amplify is absent from the original material.** The phrase "call the deployed API Gateway API using a client-specific framework" is vague about what it refers to; the documentation names Amplify and the AWS SDK in that place.

Two constraints are also worth knowing.

| Constraint | Content |
|---|---|
| Identity pools | **There is no managed authentication option equivalent to the one for user pools.** To obtain AWS credentials in your application you must implement identity pool operations yourself with imported SDK modules |
| API-only settings | Some components can be configured **only through the API.** For example the user pool's custom SMS and email sender Lambda triggers are set only through the `LambdaConfig` property of `CreateUserPool` and `UpdateUserPool` ([Section 4.11](#411-lambda-triggers)) |

> — Source: [Integrating Amazon Cognito authentication and authorization with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html)

### 10.4 Demonstration Notes

These are the items shown in the console demonstration.

| Demonstration item | Where it is covered in this document |
|---|---|
| Explaining the Cognito UI — showing user pools and identity pools | [Section 3.2](#32-two-components-user-pools-and-identity-pools) |
| Creating the user pool and app client ID | [Section 4.3](#43-the-console-creation-flow) · [Section 4.9](#49-app-clients-public-and-confidential) |
| Reviewing JWT tokens | [Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example) through [Section 6.5](#65-access-token-claims) |

🔄 **The console screens the demonstration assumes differ from the current ones.** The current console's user pool creation has changed to an **application-centric flow**, and default configuration that cannot be reversed is established during creation ([Section 4.3](#43-the-console-creation-flow)). In addition, **there is no feature plan selection in the creation wizard.** The plan is set after creation through `Settings → Feature plans` or the API's `UserPoolTier` ([Section 11.5](#115-items-we-could-not-verify)).

The demonstration notes point to [Amazon Cognito developer resources](https://aws.amazon.com/cognito/dev-resources/) for a sample app. That link is still valid.

---

## 11. Changes from the Courseware

Since learners may have the official courseware in front of them, this section gathers in one place where this material diverges from it. The evidence behind every item marked new or corrected in the sections above is here.

### 11.1 Differences from the Courseware

The first ten items were verified against external documentation. The last ten are **internal inconsistencies where the courseware body and a note in the original material disagree, or where the notation broke during extraction**, so they are not the kind of thing external documentation can verify. Those rows have `—` in the source column.

| Item | Courseware statement | Verified content | Source |
|---|---|---|---|
| JWT signature algorithm | The header says `alg: RS256` while the signature line says `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), {secret})` | `HMACSHA256` is a **symmetric HMAC** using a shared secret key and `RS256` is an **RSA asymmetric signature** using SHA-256. Two algorithms are mixed within one example. The documentation states that user pools use **`RS256`**, and Amazon Cognito creates **two** RSA key pairs per user pool, signing the access token and the ID token with different private keys. Verification uses the **public JWKS**, not a shared secret ([Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example)) | [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html) |
| Describing the JWT payload as "encrypted information" | The original states in several places "encrypted information about the claims of the key" and "claims: a payload with encrypted user information" | Amazon Cognito issues tokens as **base64url encoded strings**, and ID and access tokens **can be decoded into plaintext JSON.** What is encrypted is the **refresh token**, readable only by the user pool. The original's own payload example is plaintext JSON, so the original contradicts itself ([Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example)) | [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) |
| Compliance standards | `PCI DSS / SOC / ISO 9001 / standards-based authentication (OAuth 2.0, SAML 2.0, OIDC) / multi-factor authentication (MFA)` | The ISO standard the Amazon Cognito documentation names is **ISO 27001** (information security management systems), not ISO 9001 (quality management). Security **of** the cloud is compliant with SOC 1-3, PCI DSS, and ISO 27001 and is HIPAA-BAA eligible, while security **in** the cloud can be designed to comply with SOC 1-3, ISO 27001, and HIPAA-BAA **but not PCI DSS.** Standards-based authentication and MFA are **service features**, not compliance programs, so the courseware mixes two categories in one list ([Section 3.7](#37-compliance)) | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| Social IdP name | `Login for Amazon` | The official name is **`Login with Amazon`**. The same courseware writes it correctly elsewhere, so the spelling is inconsistent within the courseware ([Section 4.12](#412-third-party-idp-federation)) | [Using social identity providers with a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-social-idp.html) |
| API path parameter notation | `/notes/(id)` — **parentheses** | API Gateway path parameters use **braces.** In the documentation's PetStore sample API the individual resource path is `/pets/{petId}` and the `pathPart` in the `get-resources` response is `{petId}` ([Section 10.1](#101-application-architecture)) | [Set up a method request in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-settings-method-request.html) |
| Claim name casing | The original writes `Sub`, `Aud`, `Jti`, and `Scope` with **initial capitals** | JWT claim names are **case sensitive** and the documentation writes them all in lowercase (`sub`, `aud`, `jti`, `scope`). Other lines of the original and its body code example use lowercase, so the casing is inconsistent within the courseware ([Section 6.4](#64-id-token-claims)) | [Understanding the identity (ID) token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-id-token.html) |
| Reference point for refresh token default expiration | "Expires 30 days after the application user **signs up** for the user pool" | The documentation's wording is "30 days after the user **signs into your user pool**," so the reference point is sign-in, not sign-up. The configurable range of 60 minutes to 10 years matches the courseware ([Section 6.6](#66-token-validity)) | [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html) |
| Examples of custom attributes | `standard attributes (email, name) / custom (nickname, picture)` | `nickname` and `picture` are among the **18 standard attributes** based on the OpenID Connect specification, so they are not custom attributes. Real custom attributes carry a **`custom:` prefix**, are limited to **50** per user pool, and cannot be removed or changed after being added ([Section 5.1](#51-attributes)) | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| Mismatch between the identity pool flow and the referenced document | The original presents `GetOpenIdToken` + `AssumeRoleWithWebIdentity` as step 3 while the reference link points to the **Enhanced Flow** blog post | Those two APIs are the **basic (classic) flow**, and the enhanced flow is `GetId` → `GetCredentialsForIdentity`, two steps. The flow being described and the document being referenced are different flows. The reference URL itself is live, but this document verified the facts about the flows in the developer guide ([Section 7.4](#74-the-enhanced-flow-and-the-basic-classic-flow)) | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| What an identity pool issues | "Do you need to grant the user **AWS access keys**?" | The documentation states that identity pools issue **temporary AWS credentials**, and a note in the same materialthe original material also say "temporary credentials." "Access keys" can be confused with an IAM user's **long-term access keys** ([Section 7.1](#71-what-an-identity-pool-does)) | [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html) |
| Closing quotation mark in the ID token header | `{ "kid" : "1234example=“, "alg" : "RS256" }` — the closing mark is a **left double quotation mark** (`“`) | As written it does not parse as JSON. The header code block in the slide body also lacks a visible comma at the end of the `kid` line and has a trailing comma after the last `alg` line, so it is not valid JSON. This document **corrected it to parseable JSON** ([Section 6.3](#63-jwt-structure-and-corrections-to-the-courseware-example)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| Two adjacent screens have identical bodies | The body text of the two screens is identical character for character, with only a "can be used together" box added on the second | It appears an animation step was split across two screens. This document **merged them into one section** and treats the "used together" part separately ([Section 3.2](#32-two-components-user-pools-and-identity-pools) · [Section 3.3](#33-using-both-together)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| A title and body ordering disagree | The title orders them attributes, **scopes**, **groups** while the body column layout and a note in the original material both use attributes → **groups** → **scopes** | This document follows the body and notes in the original material, organizing it as **attributes → groups → scopes**, and matches the section title to that order ([Section 5](#5-attributes-groups-and-scopes)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| Typo in the JWT definition | "Defines a JSON object for **uniqueness** of security information" | A note in the original material describes the same thing as "a JSON object for **sharing** secret information," so "uniqueness" appears to be a typo. The same material also splits the OAuth spelling between `OAuth2` and `OAuth 2.0`. This document replaced the JWT definition with the documentation's wording and standardized on `OAuth 2.0` ([Section 2.4](#24-terminology)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| No content corresponds to module objective 3 | The objective "observe Amazon Cognito implementation best practices" appears in the objectives | There is no section titled after best practices in the original material and no passage in the notes that enumerates them. One objectives recap simply repeats the four items. This document filled that gap with **only items the official documentation explicitly describes as best practices or recommendations** ([Section 9](#9-implementation-best-practices)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| The capstone objectives list is incomplete | IDE setup / application hosting / database solutions / compute with Lambda / Amazon API Gateway — **only five** | It is the capstone material, yet **Amazon Cognito, the subject of this module, and module 11 (building a modern application)** are missing ([Section 10.2](#102-lab-6-the-capstone)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| Terminology translation splits | One Korean title renders `authorization` one way while the body and later sections render it another | The same kind of split appears throughout the original material. One diagram and several screens use two different renderings of "identity pool." One screen's body says tokens are "issued" one way while a note uses another word. The order in which the three tokens are listed also flips between two places ("ID, Access, and Refresh" versus "Refresh, Access, and ID"). This document standardized the terminology and fixed the token order as **ID → Access → Refresh** | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| Missing spaces in diagram labels | Labels such as `Amazon Cognitouser pool`, `Amazon Cognitotokens`, `Amazon APIGateway`, `applicationAPI call`, `server-sideresources`, and `OpenID Connect(OIDC)user's` | This appears to result from line breaks or separate text fragments in the original material being merged. The correct service names are **Amazon Cognito user pool** and **Amazon API Gateway** | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| `token_use` value notation | A note writes the values as `ID` (ID token) and `access` (access token) in prose | The code block in the same body correctly writes `"token_use": "id"`. `token_use` is a claim whose **string value is compared case sensitively**, so writing the value in prose or with capitals risks learners copying it into code. The values are **`id`** and **`access`** ([Section 6.2](#62-comparing-the-three-tokens)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |
| The same data store labeled differently | One place says `DynamoDB` while another labels the same position `notes` | The API path tables in the two places are identical. This document labels them separately: **the service name is Amazon DynamoDB and the target within it is the notes table** ([Section 10.1](#101-application-architecture)) | — (see [Section 11.5](#115-items-we-could-not-verify)) |

### 11.2 Changed Behavior and Defaults

| Item | Courseware statement | Current | Source |
|---|---|---|---|
| Advanced security features | A note in the original materialsay "protect your users with **advanced security features**" | Renamed **threat protection**, and the documentation states it was "formerly called advanced security features." It is available on the **Plus feature plan** and its components are compromised credentials detection, adaptive authentication, IP allow and deny lists, and log export. The features that were in the old advanced security features pricing structure are now **folded into Essentials or Plus.** With `USER_SRP_AUTH` you can enable only adaptive authentication, and **it cannot be used with federated sign-in** ([Section 3.8](#38-threat-protection)) | [Advanced security with threat protection](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-threat-protection.html) |
| The sign-in page | two screens say "**hosted UI**" | There are two branding versions, **managed login** and **hosted UI (classic)**, and the documentation describes classic as a "thinner, less customizable predecessor" to managed login. **managed login does not support self-service profile management**, so that part is implemented in app code. Neither version supports custom CORS origin policies, and managed login requires **TLS 1.2** for both custom and prefix domains. Switching branding versions does not preserve user sessions ([Section 3.4](#34-sign-in-pages-managed-login-and-hosted-ui-classic)) | [Managed login and the hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html) |
| Feature plans | several screens introduce Amazon Cognito **only as two components, user pools and identity pools**, with no notion of plans | User pools have **Lite, Essentials, and Plus** feature plans and the default for a new user pool is **Essentials.** The plan applies **per user pool** and cannot differ per app client. You set it with the **`UserPoolTier`** parameter of `CreateUserPool` and `UpdateUserPool` (`--user-pool-tier` in the CLI), and setting `AdvancedSecurityMode` to `AUDIT` or `ENFORCED` requires the `PLUS` plan. Several features depend on the plan: passkeys (not Lite), email MFA and email OTP and password history (Essentials or higher), threat protection (Plus), and access token customization (a plan other than Lite plus event version 2) ([Section 3.5](#35-feature-plans-lite-essentials-plus)) | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| SMS delivery path | Item 6 in a note in the original material"set short message service (SMS) and custom email delivery options" | The documentation states that **in November 2024 AWS replaced Amazon SNS SMS messaging with AWS End User Messaging SMS** and that there are now **two** configuration paths. The Amazon SNS path needs `sns:Publish` permission and the AWS End User Messaging SMS direct path needs `sms-voice:SendTextMessage`. **The two configurations are mutually exclusive** and setting one clears the other. When you first send a text message your account is placed in a **sandbox environment** ([Section 4.10](#410-sms-and-email-delivery)) | [SMS message settings](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html) |
| The console user pool creation flow | The demonstration in the original material, "explaining the Cognito UI" and "creating the user pool and app client ID," assumes console operations | The console is now an **application-centric flow**: `Define your application` (choose an application type) → enter a name → `Configure options` (sign-in identifiers and required sign-up attributes) → enter a return URL → `Create your application`, and Amazon Cognito creates **both the user pool and an app client** with the defaults for that type. External IdPs and MFA are configured after creation. Three items of **default configuration cannot be reversed**: the client secret, `preferred_username` alias not allowed, and username case insensitivity ([Section 4.3](#43-the-console-creation-flow)) | [Create a new application in the Amazon Cognito console](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools-application.html) |
| Authentication flows | One line in the security requirements in the original material, "**supports authentication flows.**" No flow name is given | You must explicitly choose the flows to permit in the app client's **`ExplicitAuthFlows`**, with the values `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_ADMIN_USER_PASSWORD_AUTH`, `ALLOW_USER_SRP_AUTH`, and **`ALLOW_USER_AUTH`**. The **choice-based sign-in (`USER_AUTH`)** added after the courseware specifies `PASSWORD`, `EMAIL_OTP`, `SMS_OTP`, and `WEB_AUTHN` in the user pool's `SignInPolicy.AllowedFirstAuthFactors` to let users choose how they sign in, and **passwordless sign-in (OTP) and passkeys (WebAuthn) are available only through this flow** ([Section 4.7](#47-authentication-flows) · [Section 4.8](#48-passwordless-sign-in-and-passkeys)) | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |

### 11.3 Discouraged and Unsupported Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The implicit grant | **Discouraged.** The documentation calls it "a legacy authorization grant" | **The authorization code grant plus PKCE.** Because a user can intercept and inspect the tokens, the documentation advises configuring the app client to support only the authorization code grant. The implicit grant does not issue a refresh token and is not compatible with PKCE ([Section 5.5](#55-the-three-oauth-20-grants) · [Section 5.6](#56-pkce)) | [OAuth 2.0 grants](https://docs.aws.amazon.com/cognito/latest/developerguide/federation-endpoints-oauth-grants.html) |
| The identity pool basic (classic) flow | **Discouraged.** The documentation advises not enabling it by default on new identity pools | **The enhanced flow** (`GetId` → `GetCredentialsForIdentity`). The credentials are valid for one hour. To use the basic flow you must evaluate the IAM role trust relationships, implement role selection logic in the client, and then **protect that client from tampering.** With `RoleMappings` present, `GetOpenIdToken` returns an error ([Section 7.4](#74-the-enhanced-flow-and-the-basic-classic-flow)) | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| `UnusedAccountValidityDays` | **A legacy parameter** | **`TemporaryPasswordValidityDays`** (default 7 days, valid range 0–365). The documentation states that once you set `TemporaryPasswordValidityDays` on a user pool you **can no longer set a value for `UnusedAccountValidityDays`** in that pool. If you meet it in an older template you must switch to the new parameter ([Section 4.4](#44-password-policy)) | [PasswordPolicyType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_PasswordPolicyType.html) |
| Developer attributes (`dev:` prefix) | **A legacy feature** | **Per-app-client attribute read and write permissions** (`ReadAttributes` / `WriteAttributes`). Developer attributes can be modified only with AWS credentials ([Section 5.1](#51-attributes)) | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| The Lambda authorizer `TOKEN` type | **Discouraged.** The documentation recommends `REQUEST` | **The `REQUEST` authorizer.** It can use multiple identity sources and separate cache keys. Limit `TOKEN` to cases that use a single bearer token. The previous name for a Lambda authorizer was a **custom authorizer** ([Section 8.4](#84-lambda-authorizers)) | [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) |
| Amazon Cognito Sync | **Unsupported.** No longer open to new customers | **AWS AppSync** (real-time synchronization with GraphQL) or **Amazon DynamoDB** (simple key-value user data). Existing customers see no disruption and can continue to use it, but there is **no new feature development.** It does not appear in courseware M12, but the `Identity browser` tab and dataset features still exist in the identity pool console and older material introduces it alongside identity pools, so its status is recorded here. It cannot be used in new projects ([Section 3.10](#310-amazon-cognito-sync)) | [Amazon Cognito Sync availability change](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sync-availability-change.html) |

### 11.4 What This Material Adds

| Item | Summary | Why it was added | Source |
|---|---|---|
| Feature plans | Lite, Essentials (the new default), and Plus. Set with the `UserPoolTier` parameter. Applies per user pool and cannot differ per app client | Which features you can use is tied to the plan, so you must pick a plan before designing | [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html) |
| Choice-based sign-in (`USER_AUTH`) | Specify `PASSWORD`, `EMAIL_OTP`, `SMS_OTP`, and `WEB_AUTHN` in `SignInPolicy.AllowedFirstAuthFactors`. Include `PREFERRED_CHALLENGE` or omit it to receive an `AvailableChallenges` list and proceed with `SELECT_CHALLENGE`. The `PASSWORD` value includes both the plaintext password and SRP variants | It is the modern sign-in flow that combines factors beyond passwords, seen on the first lab screen | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |
| Passwordless sign-in and passkeys | OTP sign-in marks email and phone number attributes verified at authentication and moves the user from `UNCONFIRMED` to `CONFIRMED`. **Mutually exclusive with MFA required.** Passkeys are based on WebAuthn and CTAP2 from the W3C and FIDO Alliance, available on all plans except Lite, recognize `ES256` (-7) and `RS256` (-257), do not support enforcing attestation, allow up to 20 per user, and require an RP ID not on the public suffix list, with re-registration required if it changes | OTP and passkeys were added after the class, and constraints like mutual exclusivity with required MFA bite in practice | [Authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html) |
| Token revocation | `RevokeToken` / `/oauth2/revoke` / `GlobalSignOut` / `AdminUserGlobalSignOut` — four methods. `origin_jti` is the revocation identifier. **Enabled by default** on new app clients. **A revoked token still appears valid to a library that only checks the signature and expiration** | You need to know what sign-out actually invalidates and what a verification library can miss | [Ending user sessions with token revocation](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html) |
| Refresh token rotation | Recommended by the documentation as a security best practice. Each refresh invalidates the original token, the new token is valid for the original's remaining duration, and the grace period is up to 60 seconds. **Not compatible with `REFRESH_TOKEN_AUTH`**, so use `GetTokensFromRefreshToken` | It is a recommended security practice but is incompatible with the old auth flow, requiring a separate API | [Refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html) |
| JWKS-based JWT verification | `jwks_uri` is `https://cognito-idp.<Region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`. The JWK fields are `kid`, `alg`, `kty`, `e`, `n`, and `use`. Check `exp`, `aud`/`client_id`, `iss`, and `token_use`. Cache and refresh public keys using `kid` as the cache key. For Node.js the documentation recommends `aws-jwt-verify` | Actually verifying a token in your backend requires knowing the JWKS lookup and the checks | [Verifying a JSON web token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html) |
| Access and ID tokens use different signing keys | Two RSA key pairs per user pool, each signing one token type with a different private key. The `kid` values do not match between the two tokens of the same session, so they must be **verified independently** | Verifying both tokens with one key is a common failure | [Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html) |
| Token claim customization | Add, modify, or suppress claims with the pre token generation Lambda trigger. Access token customization requires a plan other than Lite plus event version 2 and **incurs additional cost** | Changing claims requires knowing the Lambda trigger and the plan and cost conditions | [Understanding user pool JSON web tokens (JWTs)](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) |
| PKCE | `code_verifier` → SHA256 → base64 → `code_challenge` (`code_challenge_method=S256`). The `code_verifier` is sent in plaintext at token exchange. Requires a domain and a public app client | It is the current standard for preventing authorization-code interception by public clients | [Using PKCE in authorization code grants](https://docs.aws.amazon.com/cognito/latest/developerguide/using-pkce-in-authorization-code.html) |
| Public versus confidential clients | A public client **does not have a client secret.** Up to two secrets per app client for zero-downtime rotation (`AddUserPoolClientSecret` / `DeleteUserPoolClientSecret`), and an app client's only secret cannot be deleted | The client type changes whether there is a secret and which flow applies | [App client types](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) |
| Concrete password policy values | Minimum length 6–99 (users can set up to 256 characters), `TemporaryPasswordValidityDays` default 7 days with range 0–365, `PasswordHistorySize` 0–24 (**Essentials or higher**). Passwords for Amazon Cognito local users **do not expire automatically** | Actually configuring a password policy needs the concrete length, history, and expiry values | [Adding user pool password requirements](https://docs.aws.amazon.com/cognito/latest/developerguide/managing-users-passwords.html) |
| Three MFA second factors | SMS, **email**, and TOTP. **Not provided for federated users**, where it is delegated to the IdP. Five incorrect MFA codes start an exponential backoff lockout. MFA and account recovery cannot use the same channel | Email MFA was added after the class and there are constraints such as exclusion of federated users | [Adding MFA to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html) |
| Three remembered-device options | `Don't remember` / `Always remember` / `User opt-in`. A remembered device can replace MFA **only in a user pool where MFA is enabled.** The device key format is `Region_UUID`. **Trust period expiration is implemented by the application** | You need the conditions under which a remembered device replaces MFA and who implements trust expiry | [Working with user devices in your user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html) |
| The full Lambda trigger list | Three custom authentication triggers (Define/Create/Verify Auth Challenge), three authentication event triggers (Pre/Post authentication, Pre token generation), inbound federation, three sign-up triggers (Pre sign-up, Post confirmation, Migrate user), Custom message, and Custom sender. **Except for Custom sender the invocation is synchronous and the function must respond within 5 seconds, and this value cannot be changed** | You need to know where you can insert logic and the 5-second synchronous response constraint | [Customizing user pool workflows with Lambda triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html) |
| The 18 standard attributes and custom attribute constraints | 18 standard attributes, of which only `email` and `phone_number` can be verified. Custom attributes are limited to 50, up to 2048 characters, cannot be changed after being added, cannot be required, carry the `custom:` prefix, and are recorded as strings in the ID token. Required attributes and the alias and username attribute choices **cannot be changed after the user pool is created** | Many attributes cannot be changed after creation, so you must know them at design time | [Working with user attributes](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html) |
| Group precedence ties and limitations | With equal precedence and different role ARNs, **`cognito:preferred_role` is not set.** Automatic per-IdP groups named `[user pool ID]_[IdP name]`. No nesting, no searching users within a group, no searching groups by name. No additional charge | The tie case where no role is chosen and the group-search limits bite in practice | [Adding groups to a user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html) |
| Three scope kinds and resource servers | The reserved `aws.cognito.signin.user.admin`, custom scopes (`identifier/scopeName`), and OIDC scopes (`openid`, `profile`, `email`, `phone`). A resource server **requires a domain.** **An access token from `InitiateAuth` carries only the reserved scope, so it cannot be used for custom-scope-based API authorization.** Deleted scopes remain as inactive | You may try custom-scope API authorization but hit the trap that InitiateAuth tokens omit them | [Scopes, M2M, and resource servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html) |
| The enhanced versus basic flow distinction | Enhanced is `GetId` → `GetCredentialsForIdentity` (credentials valid one hour); basic is `GetId` → `GetOpenIdToken` → `AssumeRoleWithWebIdentity`. Per-provider artifacts (ID token for user pools and OIDC, an assertion for SAML, an access token for social). Enhanced allows only same-account roles while basic can request cross-account roles | The two identity-pool flows differ in the APIs called and whether cross-account roles are possible | [Identity pools authentication flow](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flow.html) |
| Four ways an identity pool role is chosen | Default role / token based (`cognito:preferred_role`, `cognito:roles`) / rule-based mapping (`Equals`, `NotEqual`, `StartsWith`, `Contains`, first matching rule applies) / ABAC. The **`CustomRoleArn`** of `GetCredentialsForIdentity` takes priority and access is denied if it does not match `cognito:roles`. `iam:PassRole` is required in some cases | Without the precedence, you cannot find the cause of an access-denied error | [Using role-based access control](https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html) |
| Attribute-based access control (ABAC) | Maps attributes from tokens and assertions to principal tags and evaluates them in IAM policies with the `${aws:PrincipalTag/tagkey}` condition. Console options are `Inactive` / `Use default mappings` (`sub`, `aud`) / `Use custom mappings` | It grants fine-grained permissions from token attributes, so you need the mapping options | [Using attributes for access control](https://docs.aws.amazon.com/cognito/latest/developerguide/attributes-for-access-control.html) |
| Trust policy condition keys | `cognito-identity.amazonaws.com:aud` is **required** (IAM refuses to save without it), `amr` distinguishes `authenticated`/`unauthenticated` and the provider, and `sub` is the identity ID (not the IdP's `sub`). **`aws:SourceIp` on an enhanced flow role can never be satisfied** | To avoid common mistakes like a rejected save when `aud` is missing or the SourceIp trap in the enhanced flow | [Role trust and permissions](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html) |
| Developer-authenticated identities | Started with `GetOpenIdTokenForDeveloperIdentity`, which authenticates the request with administrative credentials. The `Logins` map key must exactly match the token's `iss`, and a mismatch raises `NotAuthorizedException`. **The developer provider name cannot be changed or deleted after it is added** | It is the path to connect your own auth system, with a provider-name-immutable constraint | [Developer-authenticated identities](https://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html) |
| Enabling guest access | If guest access is not supported the console status is `Inactive`. Enabling it requires **specifying a default IAM role** for guests, and using an existing role requires `cognito-identity.amazonaws.com` in the trust policy. The application is expected to cache the identity ID from `GetId` | You need the setting that grants credentials to unauthenticated users and the required role and trust policy | [Identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html) |
| The HTTP API JWT authorizer | **Only RSA-based algorithms are supported**, the public key may be cached for two hours (a grace period is recommended when rotating keys), `aud` takes priority (`client_id` only when `aud` is absent), `nbf` and `iat` must be before the current UTC time, and scopes are set per route with `authorizationScopes`. A Lambda integration accesses claims at `$event.requestContext.authorizer.jwt.claims.<claim>` | It is the real path to protect an API with Cognito tokens, with RSA-only and cache constraints | [Control access to HTTP APIs with JWT authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html) |
| API Gateway `AWS_IAM` authorization | SigV4 and SigV4a signing. `Action` is `execute-api:Invoke` (also `*` and `InvalidateCache`) and `Resource` is an `execute-api` ARN in the form `api-id/stage/HTTP-verb/path`. **If `authorizationType` is not set to `AWS_IAM` the method is publicly open** | It is the SigV4 path to protect an API, and skipping the setting opens the method publicly | [Control access for invoking an API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html) |
| Service quotas and the billing unit | **40,000,000** users per user pool (adjustable), 1,000 user pools per Region (up to 10,000), 1,000 app clients (up to 10,000), 300 identity providers (up to 1,000), 25 resource servers (up to 300), **50 custom attributes (not adjustable)**, **10,000 groups (not adjustable)**. Default email is **50 per AWS account per day (not adjustable)**. Billing is by **MAU**, and `AdminGetUser` contributes to MAU while CSV import and `AdminResetUserPassword` do not | MAU billing and non-adjustable quotas directly affect design and cost decisions | [Quotas in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html) |
| Encryption details at rest and in transit | Identity pools are **fixed to AWS owned keys** (not changeable) while user pools default to AWS owned keys with an optional **customer managed key** (symmetric KMS key in the same Region only, configured by ARN only). Searchable encryption maps plaintext to ciphertext for `sub`, `email`, `phone_number`, and other attributes. **TLS 1.2 required, 1.3 recommended**, with PFS cipher suites required | You must know that identity pools cannot change the key while only user pools allow a customer-managed key | [Data protection in Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html) |
| The AWS Amplify integration path | An AWS service for building full-stack applications with Amazon Cognito authentication in the backend. Provides connected UI components such as **`Authenticator`**. Identity pools have no managed authentication option equivalent to user pools, so they must be implemented with the SDK | It is the managed path to add Cognito auth to a frontend, reducing implementation effort | [Integrating Amazon Cognito with web and mobile apps](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html) |
| Federated user profile creation | A profile for the federated user is **actually created** in the user pool directory, with attributes populated from the IdP claims and the public userinfo endpoint. When mapped IdP attributes change the user attributes change too. The `username` takes the form `MyIDP_bob@example.com`. **`InitiateAuth` cannot sign in a federated user**; only the Login and Authorize endpoints can | You must know that federated users get real profiles and cannot sign in via InitiateAuth | [User pool sign-in with third party identity providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html) |

### 11.5 Items We Could Not Verify

We record these honestly. Confirm them before stating them definitively in class.

| Item | Status |
|---|---|
| Where a feature plan is chosen in the console user pool creation wizard | The current console quick-start documentation contains **no feature plan selection step.** The plan is set after creation through the `Settings → Feature plans` tab or the API's `UserPoolTier`. So we confirmed only "it is not in the creation steps"; whether some other console path allows choosing during creation was not confirmed |
| Whether Amazon Cognito falls **within ISO 9001 scope at all** | Determining that requires retrieving the `AWS services in scope by compliance program` page, which we **did not retrieve.** What we confirmed is that the ISO standard the Amazon Cognito documentation names is **ISO 27001** and that the compliance validation page lists SOC, PCI, FedRAMP, and HIPAA. Whether the courseware's ISO 9001 statement rests on some other basis was not determined |
| Pricing figures | We confirmed that the billing unit is **monthly active users (MAU)** and which operations contribute to MAU. **The MAU unit price and the unit prices for M2M app clients and token requests were not retrieved.** If you need figures, check the Amazon Cognito pricing page directly |
| The feature plan Lab 6 (the capstone) assumes | **The lab guide is not part of this material.** We could not confirm whether the lab uses features that depend on the plan, such as passkeys, email MFA, or threat protection |
| Whether the `iss` example value in the original material conforms to the user pool ID format rules | The courseware example is `us-east-1_example` and the documentation examples are of the form `us-west-2_example` and `us-east-1_EXAMPLE`. **We could not find a page that specifies the format of a user pool ID itself.** For `sub` there is guidance not to validate the format strictly, but the user pool ID rules remain unverified |
| Ten courseware notation errors | The left double quotation mark and the `token_use` value notation, the duplicated bodies of two screens, the title ordering in the original material, the JWT definition typo in the original material, the absence of a section for module objective 3, the incomplete list in the original material, the terminology translation splits, the missing spaces in diagram labels, and the data store label on two screens are all cases where **the original body and notes disagree, or the notation broke during extraction.** They are not the kind of fact AWS documentation can verify, so we corrected only the notation without attaching a source citation |
