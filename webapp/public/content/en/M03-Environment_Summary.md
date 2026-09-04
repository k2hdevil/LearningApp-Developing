# Module 3: Getting Started with Development on AWS

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Accessing AWS Services Programmatically](#2-accessing-aws-services-programmatically)
3. [The AWS SDKs](#3-the-aws-sdks)
4. [The AWS Command Line Interface](#4-the-aws-command-line-interface)
5. [AWS SDK Programming Patterns](#5-aws-sdk-programming-patterns)
6. [Integrated Development Environments](#6-integrated-development-environments)
7. [Setting Up Your Development Environment](#7-setting-up-your-development-environment)
8. [Changes from the Courseware](#8-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Verified on: August 25, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

This module covers the foundations you need to start developing with AWS resources. It runs from the four ways to access AWS services programmatically, through the AWS SDKs and the AWS CLI that you use most in practice, to setting up your development environment (the IDE).

### What This Module Lets You Do

- Explain how to access AWS services programmatically
- List the programming patterns within the AWS SDKs

In the labs you connect to an IDE on an EC2 instance and, from that IDE, use AWS IAM and Amazon S3 to configure your development environment.

---

## 2. Accessing AWS Services Programmatically

### 2.1 The AWS REST API and Service Endpoints

Every AWS service exposes its capabilities through a dedicated application program interface (API). To connect to an AWS service programmatically, you use an **AWS service endpoint**. An endpoint is the entry-point URL for an AWS product or service, where the API is served.

```text
client application  ──── request ────▶  AWS REST API  ──▶  run an instance
                    ◀─── response ───                  ──▶  upload an S3 file / create a bucket
                                                        ──▶  update a database item
       transport layer: HTTP(S) · SigV4 · IAM access keys (ID, secret)
```

### 2.2 Signing Requests and SigV4 🔄

For security, most AWS requests must be signed. **Signature Version 4 (SigV4)** is the process of adding authentication information to an AWS request sent over HTTP, and it is currently the default signing method for most AWS service operations.

What signing does:

| Purpose | Behavior |
|---|---|
| Verify the requester's identity | Generates a signature with access keys (access key ID, secret access key). 🆕 When you use **temporary credentials**, the signature calculation also needs a **security token** |
| Protect data in transit | Computes a hash (digest) over parts of the request and includes it. The service recomputes the hash from the same information and rejects the request if the values differ |
| Defend against replay attacks | Uses a timestamp. In **most cases the request must reach AWS within 5 minutes of the timestamp in the request**, or AWS rejects it |

- SigV4 can be expressed in the **HTTP `Authorization` header** or the **URL query string**.
- When you write your own code to send API requests, you must include the signing code. Using the AWS SDKs and the AWS CLI **authenticates the request automatically** with the access keys you provide.
- 🆕 **SigV4a** is an ECDSA-based asymmetric signature required for multi-Region API requests (for example, Amazon S3 multi-Region access points). SDKs use it automatically for global endpoint calls. AWS stores only the public key, and the public key cannot sign requests.

> — Source: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 2.3 HTTP Request/Response Structure (S3 API Example)

An API provides a standard communication method. Request and response messages have a similar structure. Each has a **start line** and optional **header** and **body** sections.

A CreateBucket request for a bucket named `pollynotes` in the default AWS Region:

```http
PUT / HTTP/1.1
Host: pollynotes.s3.<Region>.amazonaws.com
Content-Length: 0
Date: Wed, 01 Mar 2006 12:00:00 GMT
Authorization: authorization string
```

The response to that request:

```http
HTTP/1.1 200 OK
x-amz-id-2: yyyyy/xxxxxxx
x-amz-request-id: 236A8905248E5A01
Date: Wed, 01 Mar 2006 12:00:00 GMT
Location: /pollynotes
Content-Length: 0
Connection: close
Server: AmazonS3
```

#### The start line

| Message | What the start line indicates |
|---|---|
| Request | The **action** to perform on the server and the **path to the resource** on the web server. The resource path must have a value; if none is specified, it is shown as a slash (`/`) for the server root |
| Response | Whether the request **succeeded or failed** |

#### Headers

Headers carry metadata attached to the API request and response. Some, such as `Host` for the server's domain, are well-defined, and headers can also be custom. The headers are followed by a **blank line** that marks the end of the header fields. The format is `<header-field> ":" <field-value>`.

| Header type | Applies to | Example |
|---|---|---|
| General | Both request and response | `Date: Wed, 01 Mar 2006 12:00:00 GMT` |
| Client request | The request message | `Host: pollynotes.s3.<Region>.amazonaws.com` |
| Server response | The response message | `x-amz-request-id: 236A8905248E5A01` |
| Resource | Metadata about the resource in the body or identified in the request | `Content-Type: text/plain` |

The **body**, also called the payload, holds the content to be transferred between the server and the client.

> — Source: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

### 2.4 HTTP Status Codes

When a service responds to a request, the **start line (status line) of the response** contains the status code and status message. Note that the status code is on the response's start line, not in the request headers.

| Class | Name | Meaning |
|---|---|---|
| 1xx | Informational | An informational response indicating everything is fine so far |
| 2xx | Success | The server successfully received and processed the request |
| 3xx | Redirection | Further action is needed to complete the request |
| 4xx | Client error | A client error. Bad syntax or another user error preventing fulfillment |
| 5xx | Server error | A server error that prevented an apparently valid request from being fulfilled |

Example DynamoDB query response:

```http
HTTP/1.1 200 OK
x-amzn-RequestId: <RequestId>
x-amz-crc32: <Checksum>
Content-Type: application/x-amz-json-1.0
Content-Length: <PayloadSizeBytes>
Date: <Date>

{
  "Count": 2,
  "ScannedCount": 2
}
```

> — Source: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 2.5 The Four Ways to Access AWS Services

You can access AWS services and features in several ways. **All four are based on the AWS services' REST APIs**, and **all access modes are interchangeable.**

| Method | Description |
|---|---|
| **API** | Every AWS service supports a dedicated API for its capabilities, and you can use it directly. But formatting requests, interpreting them, and handling responses directly has service-specific detail and can be substantial work |
| **SDK** | Simplifies programmatic API use. Requests made through an SDK are signed automatically and retries and errors are handled, so you do not write that logic yourself |
| **AWS Management Console** | Provides a rich graphical interface to most of what AWS offers. Still, working programmatically is often more efficient than the console |
| **AWS CLI** | Manages AWS services directly from a command program on Linux/macOS or Windows. You can script it consistently and run it when needed |

The Management Console and the AWS CLI are both built on top of the SDKs. The AWS CLI uses a Python library called **Botocore** that Boto3 is built on, and it uses Boto3's retry methodology and logging.

> — Source: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 2.6 Common Patterns You Handle with SDKs and Service APIs

When you use AWS APIs, you meet common usage patterns.

- Granting access to your application
- Adjusting account limits caused by constrained bandwidth
- Integrating multiple services

Frequently seen patterns: authenticating users / checking that a bucket exists / adjusting throttling / pagination / checking the status of an asynchronous call / following the data / integrating services. **The AWS SDKs cover and simplify some of these patterns.**

---

## 3. The AWS SDKs

The AWS SDKs let your application use AWS services in your preferred programming language. For example, if a music-sharing application needs to upload a user's music files to an S3 bucket, you can upload them programmatically with an AWS SDK.

### 3.1 Why Use an AWS SDK

| Benefit | Description |
|---|---|
| Language bindings | Call AWS APIs with the classes and methods of a familiar language |
| HTTP request signing | Computes the signature automatically |
| Built-in resilience | Retry, error, and timeout logic |
| Pagination support | Use a paginator in a single line. You do not write the continuation-token, loop, and multiple-API-call logic yourself |

In short: **familiar tools + efficiency + consistency.**

### 3.2 The AWS SDKs by Language and Their Support Status 🔄

SDKs are provided per language, and each major version has a different support status. Below is the current status as listed in the AWS SDKs and Tools lifecycle documentation.

| SDK | Supported major versions | End-of-support major versions |
|---|---|---|
| SDK for C++ | 1.x | — |
| SDK for Go | V2 1.x | 🔄 1.x |
| SDK for Java | 2.x | 🔄 1.x |
| SDK for JavaScript | 3.x | 🔄 1.x, 2.x |
| SDK for Kotlin | 1.x | — |
| SDK for .NET | 4.x | 🔄 1.x, 2.x, 3.x |
| SDK for PHP | 3.x | 2.x |
| SDK for Python (Boto3 / Botocore) | 1.x | Boto2 1.x |
| SDK for Ruby | 3.x | 1.x, 2.x |
| SDK for Rust | 1.x | — |
| SDK for Swift | 1.x | — |
| AWS CLI | 2.x | 🔄 1.x is in Maintenance Announcement ([Section 4.2](#42-aws-cli-v1-and-v2)) |
| Tools for PowerShell | 5.x | 2.x, 3.x, 4.x |

Worth knowing:

- **Node.js is not a separate SDK; it is supported through the JavaScript SDK.** Android and iOS (Mobile SDK) are out of scope of this lifecycle documentation.
- Java, Go, JavaScript, and .NET have end-of-support versions, so start new code on a supported major version from the table above ([Section 8.3](#83-discouraged-and-end-of-support-items)).

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html), [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html), [Migrate to v3 of the AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html), [What is the AWS SDK for Go](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html)

#### Currently Valid SDK Documentation Links 🔄

The currently valid documentation path per language:

| Language | Current documentation |
|---|---|
| Python (Boto3) | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) |
| .NET | [Install AWSSDK packages with NuGet (v4)](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) |
| Java | [AWS SDK for Java 2.x Developer Guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/) · [API Reference](https://docs.aws.amazon.com/java/api/latest/) |
| JavaScript | [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html) |
| Go | [AWS SDK for Go V2](https://docs.aws.amazon.com/sdk-for-go/v2/developer-guide/welcome.html) |
| PHP | [AWS SDK for PHP v3](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/welcome.html) |
| AWS CLI Command Reference | [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/) |

> — Source: [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/), [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html)

### 3.3 The SDK Major Version Lifecycle 🆕

A major version of an AWS SDK or tool goes through five phases. It is the basis for deciding which SDK version to choose.

| Phase | Name | Support level | Duration |
|---|---|---|---|
| Phase 0 | Developer Preview | Not supported. Not for production. For early access and feedback | — |
| Phase 1 | General Availability (GA) | Fully supported. Regular releases of new services, existing-service API updates, and bug and security fixes | **At least 24 months** |
| Phase 2 | Maintenance Announcement | Publicly announces entry into maintenance **at least 6 months in advance**. Fully supported during this period | — |
| Phase 3 | Maintenance | Critical bug fixes and security issues only. No new/existing service API updates and no new Regions | **12 months by default** |
| Phase 4 | End-of-Support | Updates and releases stop. Existing releases remain in package managers and the code stays on GitHub, though the repository may be archived | — |

Dependencies (OS, language runtimes, third-party libraries) are supported for **at least 6 months** after the community or vendor ends support. AWS reserves the right to drop dependency support without a major version bump.

> — Source: [AWS SDKs and Tools maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html)

### 3.4 Low-Level and High-Level APIs 🔄

| Category | Characteristics | Name in Python |
|---|---|---|
| **Low-level API** | One method per service operation. A direct mapping of the AWS service API. Full control over the request and strict control over call behavior and performance | Service client API (`boto3.client`) |
| **High-level API** | One class per conceptual resource. Defines service resources and individual resources. A higher abstraction than low-level calls | Resource API (`boto3.resource`) |

High-level API classes provide methods to retrieve data about a resource, invoke actions on it, and retrieve links to other related resources. For example, when uploading a file to an S3 bucket, the high-level API looks at the file size and decides whether to upload in a single operation or in multiple parts.

> **🔄 Important**: The high-level resource API is easy to reach for out of simplicity, but **the AWS Python SDK team has no plans to add new features to the boto3 resource interface.** The existing interface keeps working for the boto3 lifecycle, but the latest service features are delivered through the **client interface**. Write new code against the client interface.
>
> 🆕 An additional constraint: **resource instances are not thread-safe.** Do not share them across threads or processes; create a new session and resource per thread.
>
> — Source: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.5 Example: Connecting to a Service with an API (Python)

Low-level API (recommended) — list the objects in a bucket

```python
# The return type is a dict. Retrieving the objects themselves needs additional API calls.
def listClient():
    s3client = boto3.client('s3')
    response = s3client.list_objects_v2(Bucket='mybucket')
    for content in response['Contents']:
        print(content['Key'], content['LastModified'])
```

High-level API — list the objects in a bucket 🔄

```python
# A resource represents an object-oriented interface to AWS. It provides a higher
# level of abstraction than the raw, low-level calls a service client makes.
# Note: no new features are added to the resource interface. See Section 3.4.
def listResource():
    s3resource = boto3.resource('s3')
    bucket = s3resource.Bucket('mybucket')
    for object in bucket.objects.all():
        print(object.key, object.last_modified)
```

> — Source: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.6 API Version Locking

AWS services have versioned APIs, and you can lock them at the SDK level or the service level. Because APIs can change, if your code depends on a specific API version, it is best to pin the service to the version number you use. You can also pin by SDK version, but to optimize the application, pull in only the components you need instead of the whole SDK.

Boto3's configuration lookup order is **Config object → environment variables → `~/.aws/config`**, and the `Config` object's `signature_version` defaults to Signature Version 4.

```python
import boto3
from botocore.config import Config

# Pass per-client configuration through a Config object. It takes precedence over environment variables and the config file.
my_config = Config(
    region_name='us-west-2',
    signature_version='v4',
    retries={
        'max_attempts': 10,
        'mode': 'standard'
    }
)

client = boto3.client('kinesis', config=my_config)
```

> — Source: [Boto3 Configuration](https://docs.aws.amazon.com/boto3/latest/guide/configuration.html)

---

## 4. The AWS Command Line Interface

### 4.1 Where the AWS CLI Runs

You run the AWS CLI in a terminal program to use AWS services. The AWS CLI works on Linux, Windows, and macOS, and can be installed on Linux and Windows EC2 instances.

| Category | Where it runs | Description |
|---|---|---|
| Local | Linux shell | Common shells such as bash, zsh, and tcsh on Linux or macOS |
| Local | Windows command line | Windows Command Prompt or PowerShell |
| Local | macOS | Terminal |
| Remote | EC2 over SSH/PuTTY | A remote terminal program such as PuTTY or SSH on an EC2 instance |
| Remote | AWS CloudShell | 🆕 A browser-based **pre-authenticated** shell. Launches straight from the AWS Management Console and is recommended as an alternative to long-term access keys |
| Remote | AWS Systems Manager session | Run commands using Systems Manager |

You can download the AWS CLI from the [AWS Command Line Interface web page](https://aws.amazon.com/cli/).

> — Source: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 4.2 AWS CLI v1 and v2 🆕

Which version you install matters.

| Item | AWS CLI v1 | AWS CLI v2 |
|---|---|---|
| Lifecycle phase | **Maintenance Announcement** | General Availability (February 10, 2020) |
| Enters maintenance mode | **July 15, 2026** | — |
| End of support | **July 15, 2027** | — |
| Python | Requires system Python | **Python bundled.** Does not require or interact with a global system Python |
| Default retry mode | `legacy` | `standard` |
| IAM Identity Center authentication | — | Supported |
| Interactive features | — | Wizards, auto-prompt, server-side command completion |
| Output | — | Client-side pager on by default, `yaml` and `yaml-stream` formats |
| Credential management | — | `aws login`, `aws configure import`, `aws configure list-profiles` |
| Other v2-only | — | Docker image, high-level DynamoDB `ddb put`/`ddb select`, `aws logs tail`, `--copy-props` for `s3` commands, SDK-compatible `AWS_REGION` environment variable |

During maintenance mode (2026-07-15 to 2027-07-14), only **critical bug fixes and security updates** are provided. Changes to AWS CLI v1 itself, new services, existing-service API updates, and Region/endpoint expansion are not added.

v2 features not backported to v1: high-level DynamoDB commands, EC2 Instance Connect using an SSH client, and CloudWatch Logs Live Tail interactive mode.

> — Source: [CLI v1 Maintenance Mode Announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/), [New features and changes in the AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html)

### 4.3 Command Structure

An AWS CLI command specifies a multi-part structure **in this exact order**.

```bash
aws <command> <subcommand> [options and parameters]
```

| Order | Component | Description |
|---|---|---|
| 1 | Base call | The `aws` program |
| 2 | **command** | The top-level command, generally corresponding to an AWS service the CLI supports (for example `s3`, `ec2`, `cloudwatch`) |
| 3 | **subcommand** | The operation to perform (for example `ls`, `cp`, `run-instances`, `put-metric-data`) |
| 4 | **options and parameters** | General AWS CLI options or parameters the operation needs. The order is free, and if an exclusive parameter is given more than once the **last value** applies. Argument names are prefixed with two dashes (`--`) |

For example, `aws s3 ls s3://mybucket --recursive` breaks down like this.

| Part | Value |
|---|---|
| Base call | `aws` |
| command (service) | `s3` |
| subcommand | `ls` |
| parameters | `s3://mybucket`, `--recursive` |

```bash
# List all contents of the bucket recursively
aws s3 ls s3://mybucket --recursive

# Copy a local file to the bucket
aws s3 cp myFile.txt s3://mybucket

# See help at several levels
aws help
aws s3 help
aws s3 ls help
```

🆕 The `wait` command has one more part. Not every service supports a `wait` command.

```bash
aws <command> wait <subcommand> [options and parameters]
```

Check the list of supported services in the [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/).

> — Source: [Command structure in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html)

### 4.4 aws configure and Credentials 🔄

To set defaults for all AWS CLI commands, run `aws configure` on the machine hosting the AWS CLI. You can also set the default AWS Region.

Credentials have a **recommended order**, and IAM user long-term credentials are **not recommended.**

| Rank | Authentication type | Use |
|---|---|---|
| 1 | **AWS Management Console credentials** (recommended) | Sign in to the AWS CLI with console credentials to use short-term credentials. Recommended for accessing the account as the root user, an IAM user, or IAM federation |
| 2 | IAM Identity Center workforce user short-term credentials | Short-term credentials plus a user directory (the built-in IAM Identity Center directory or Active Directory). Using it with AWS Organizations is a security best practice |
| 3 | IAM user short-term credentials | Safer than long-term credentials. Even if leaked, usable time is limited until expiry |
| 4 | EC2 instance metadata | Retrieves temporary credentials for the role assigned to the instance |
| 5 | Assuming a role | Paired with another credential method to gain different permissions temporarily |
| 6 | IAM user **long-term** credentials | **(Not recommended)** No expiry |
| 7 | External storage | **(Not recommended)** Dependent on the security level of the external location |

🆕 Precedence of credential and configuration settings (the first value found wins):

1. Command line options (`--region`, `--output`, `--profile`)
2. Environment variables
3. Assume role
4. Assume role with web identity
5. AWS IAM Identity Center
6. The `credentials` file
7. Custom process
8. The `config` file
9. Container credentials (Amazon ECS task IAM role)
10. Amazon EC2 instance profile credentials

🆕 You can tell the credential type from the access key ID prefix.

| Prefix | Meaning |
|---|---|
| `AKIA` | A **long-term** access key of an IAM user or the root user |
| `ASIA` | A **temporary** credential access key created by an AWS STS operation. Includes a security token that indicates expiry |

> — Source: [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

#### 🆕 The aws configure family of commands

It is not just `aws configure`; there are several subcommands.

| Command | Use |
|---|---|
| `aws configure` | Interactively set the access keys, Region, and output format |
| `aws configure set` | Set an individual setting value (`aws configure set region us-west-2 --profile integ`) |
| `aws configure get` | Retrieve an individual setting value |
| `aws configure list` | Show the profile, access key, and Region with the **source (TYPE, LOCATION)** of each value |
| `aws configure list-profiles` | List all profile names |
| `aws configure import` | Import CSV credentials created in the IAM web console. Not for IAM Identity Center |
| `aws configure mfa-login` | Create a temporary credential profile with MFA and IAM user credentials |
| `aws configure sso` | Configure an IAM Identity Center profile |
| `aws configure sso-session` | Configure only the `sso-session` section |
| `aws configure export-credentials` | Export the currently configured credentials in a given format (default `process`) |

#### Configuration file structure and cache

The `config` and `credentials` files consist of three section types.

| Section type | Format | Use |
|---|---|---|
| `profile` | config file `[default]`/`[profile user1]` / credentials file `[default]`/`[user1]` | Credentials, Region, output format. **The credentials file does not use the `profile` keyword** |
| 🆕 `sso-session` | `[sso-session my-sso]` | IAM Identity Center start URL, Region, registration scopes |
| 🆕 `services` | `[services my-services]` | Per-service custom endpoints |

```ini
[default]
region = us-east-2
output = json

[profile dev]
services = my-services

[sso-session my-sso]
sso_region = us-east-1
sso_start_url = https://my-sso-portal.awsapps.com/start
sso_registration_scopes = sso:account:access

[services my-services]
dynamodb =
  endpoint_url = http://localhost:8000
```

- If a shared profile specifies an IAM role, the AWS CLI calls AWS STS `AssumeRole` to get temporary credentials, caches them in `~/.aws/cli/cache`, and **refreshes them automatically** on expiry.
- IAM Identity Center authentication tokens are cached in `~/.aws/sso/cache`.
- File locations can be changed with the `AWS_CONFIG_FILE` and `AWS_SHARED_CREDENTIALS_FILE` environment variables.

> — Source: [Configuration and credential file settings in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

### 4.5 Example: Creating a Lambda Function with the AWS CLI 🔄

When you create a Lambda function, you specify a runtime identifier. Creating a function is blocked for end-of-support runtimes (for example `nodejs12.x`), so use a currently supported runtime.

```bash
# Create a function with a currently supported Node.js runtime
aws lambda create-function --function-name ProcessDynamoDBRecords \
  --zip-file fileb://function.zip --handler index.handler --runtime nodejs22.x \
  --role arn:aws:iam::123456789012:role/lambda-dynamodb-role
```

| Node.js runtime | Identifier | Status |
|---|---|---|
| Node.js 26 | `nodejs26.x` | Supported. No deprecation scheduled |
| Node.js 24 | `nodejs24.x` | Supported. Deprecation scheduled April 30, 2028 |
| Node.js 22 | `nodejs22.x` | Supported. Deprecation scheduled April 30, 2027 |
| Node.js 20 | `nodejs20.x` | Deprecated April 30, 2026 |
| Node.js 18 | `nodejs18.x` | Deprecated September 1, 2025 |
| **Node.js 12** | **`nodejs12.x`** | **Deprecated March 31, 2023. Function creation blocked the same day, updates blocked April 30** |

AWS deprecates a runtime when a major component reaches end of community long-term support and can no longer receive security updates. The `lambda-dynamodb-role` in the example is broad, so narrow it to least privilege in practice.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

---

## 5. AWS SDK Programming Patterns

### 5.1 Synchronous and Asynchronous Operations

| Category | Behavior |
|---|---|
| **Synchronous / Blocking** | The client makes a request and waits for the command to complete. It blocks program progress until it receives a response from the service |
| **Asynchronous / Non-Blocking** | The client makes a request but does not wait for completion. It returns control before the service returns a response, which is effective for long-latency operations |

In an asynchronous call, the application receives a response indicating the **request was received**, and does not know right away whether it will succeed. So you need a way to retrieve the response when it is ready or to check for failure, and it assumes error and retry resilience is built into the client side.

| Service/operation | Call style |
|---|---|
| AWS Lambda | Synchronous or asynchronous |
| Amazon S3 → Lambda | Amazon S3 invokes the function **asynchronously** with an event containing the object details. You configure a notification on the bucket and grant S3 invoke permission in the function's resource-based policy |
| DynamoDB `CreateTable` | An **asynchronous operation.** On receiving the request it immediately returns a response with `TableStatus` set to `CREATING`, and sets it to `ACTIVE` when creation finishes. Reads and writes work only in the `ACTIVE` state, and you check status with `DescribeTable` |

> 🆕 Note: If a Lambda function uploads an object to the very bucket that triggers it, a loop can occur. Use two buckets or apply the trigger only to a prefix for incoming objects.
>
> 🆕 A table with secondary indexes can be in `CREATING` state only one at a time, so create several of them sequentially.

Example DynamoDB `create-table` response:

```bash
aws dynamodb create-table --table-name Notes ...
```

```json
{
  "TableDescription": {
    "AttributeDefinitions": [],
    "TableName": "Notes",
    "KeySchema": [],
    "TableStatus": "CREATING",
    "CreationDateTime": "2021-05-19T02:24:56.545000-04:00",
    "ProvisionedThroughput": {},
    "TableSizeBytes": 0,
    "ItemCount": 0,
    "TableArn": "arn:aws:dynamodb:us-east-2:xxx:table/Music",
    "TableId": "dd4d6498-37b3-4d6c-9383-9781196a933b"
  }
}
```

> — Source: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html), [Process Amazon S3 event notifications with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)

### 5.2 Polling State with a Waiter

A **waiter** is an abstraction for polling a resource until it reaches a desired state or an error indicates that state cannot be reached.

In asynchronous programming, you sometimes need to confirm that infrastructure is ready before using it. The waiter utility provides an API that handles the polling task, so you do not write the polling logic, the specific polling API, and the success state for each resource yourself. You can configure a waiter with a maximum number of attempts and a backoff strategy between attempts.

| Pattern | Command |
|---|---|
| Poll to get status | `aws dynamodb describe-table --table-name Notes --query "Table.TableStatus"` |
| Wait until ACTIVE | `aws dynamodb wait table-exists --table-name Notes` |
| Cancel | `aws cloudformation cancel-update-stack --stack-name myteststack` |

### 5.3 Example: Checking Table Status (.NET)

A `CreateTable` response includes a `TableDescription` property with initial table information. You can also call the client's `DescribeTable` method any time to get the latest table information. The example below polls until DynamoDB sets the table status to `ACTIVE`.

```csharp
// Create the table using 'request' information such as the table name
var response = client.CreateTable(request);
var tableDescription = response.TableDescription;

// The table's initial status
var status = tableDescription.TableStatus;

while (status != "ACTIVE")
{
    // After the table is created, its status is set to ACTIVE
    System.Threading.Thread.Sleep(5000); // Wait for 5 seconds.

    // Get the latest table information
    var describeResponse = client.DescribeTable(new DescribeTableRequest
    {
        TableName = tableName
    });
    Console.WriteLine("Table name: {0}, status: {1}",
        describeResponse.Table.TableName, describeResponse.Table.TableStatus);
    status = describeResponse.Table.TableStatus;
}
```

> — Source: [Code examples for DynamoDB using AWS SDKs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html)

### 5.4 Example: Waiter (Python)

```python
# Create the table and wait until it is ready
# Get the service resource (see Section 3.4 for constraints on the resource interface)
dynamodb = boto3.resource('dynamodb')

# Create the DynamoDB table
table = dynamodb.create_table(
    TableName='Notes',
    # ...
)

# Wait until the table exists
table.meta.client.get_waiter('table_exists').wait(TableName='Notes')

# Print some data about the table
print(table.item_count)
```

> — Source: [Boto3 Amazon DynamoDB guide](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html)

### 5.5 Example: Polling with a Waiter (Java 2.x)

The synchronous waiter syntax for the AWS SDK for Java 2.x. (It is `client.waiter()`, not the 1.x `client.waiters()`.)

```java
// AWS SDK for Java 2.x — synchronous waiter
DynamoDbClient client = DynamoDbClient.create();
DynamoDbWaiter waiter = client.waiter();

// Wait until the table exists. Specify the request with a lambda (consumer builder).
WaiterResponse<DescribeTableResponse> waiterResponse =
        waiter.waitUntilTableExists(r -> r.tableName("myTable"));

waiterResponse.matched().response()
        .ifPresent(System.out::println);
```

```java
// Polling configuration — maximum attempts and a fixed-delay backoff
FixedDelayBackoffStrategy fixedDelayBackoffStrategy =
        FixedDelayBackoffStrategy.create(Duration.ofSeconds(3));

waiter.waitUntilTableExists(r -> r.tableName(tableName),
        c -> c.maxAttempts(10)
              .backoffStrategy(fixedDelayBackoffStrategy));
```

The v1-to-v2 correspondence:

| Item | v1 (end of support) | v2 |
|---|---|---|
| Package | `com.amazonaws.services.dynamodbv2.waiters` | `software.amazon.awssdk.services.dynamodb.waiters` |
| Class | `AmazonDynamoDBWaiters` | Synchronous `DynamoDbWaiter`, asynchronous `DynamoDbAsyncWaiter` |
| Creation | `client.waiters()` | `client.waiter()` (async is `asyncClient.waiter()`) |
| Waiting | `waiter.tableExists().run(new WaiterParameters<>(new DescribeTableRequest(tableName)))` | `waiter.waitUntilTableExists(r -> r.tableName("myTable"))` |
| Polling config | `PollingStrategy(MaxAttemptsRetryStrategy, FixedDelayStrategy)` | `c -> c.maxAttempts(10).backoffStrategy(...)` |

The waiter classes are included in the same Maven artifact as the service, so no separate dependency is needed.

> — Source: [Changes in Waiters from version 1 to version 2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html), [Using waiters in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/waiters.html)

### 5.6 Exceptions and Error Handling 🔄

When an error occurs, the AWS service returns an **error code** you can use to decide how to handle it.

| Error class | Response |
|---|---|
| 400 series | **Your application handles the error.** For example, if the bucket you are accessing does not exist, Amazon S3 returns 404, so the application creates the bucket first and then performs the operation |
| 500 series | **Retry the operation.** Indicates an internal server error |

#### AWS SDK for Java exceptions (2.x)

| 2.x exception | Meaning | Information provided |
|---|---|---|
| `AwsServiceException` (subclass of `SdkServiceException`) | The request was delivered to the service successfully but was not processed and an error response was returned | The returned HTTP status code, the AWS error code, the detailed error message in `AwsErrorDetails`, and the AWS request ID of the failed request |
| Service-specific subclasses (`S3Exception`, `DynamoDbException`, `SqsException`, and so on) | In most cases these subclasses are thrown, so a catch block can handle them granularly | Look up the error code from the service API reference with `AwsErrorDetails#errorCode()` |
| `SdkClientException` | A problem inside the Java client code while sending the request or parsing the response, such as no network connection | Generally more serious than `SdkServiceException`, indicating a problem that prevents the service call itself |

The `com.amazonaws.*` family (`AmazonServiceException`, `AmazonClientException`) is the end-of-support 1.x package. 2.x uses the `software.amazon.awssdk` layer above. The Java SDK uses **runtime (unchecked) exceptions** instead of checked exceptions, so developers can handle just the errors they want granularly.

> — Source: [Handling errors in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html)

#### AWS SDK for .NET exceptions

The .NET AWS SDK, like Java, throws `Amazon.Runtime.AmazonServiceException` and `Amazon.Runtime.AmazonClientException`.

#### Boto3 exceptions 🆕

Exceptions you meet in Boto3 come from two places.

| Source | Description |
|---|---|
| **botocore** | Exceptions defined statically in the botocore package. Related to client-side behavior, configuration, and validation problems. For example `ClientError`, `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, `WaiterError` |
| **AWS services** | Caught with the underlying botocore exception **`ClientError`**. After catching it, parse the response to find details including service-specific exceptions |

Know that beyond `ClientError`, **botocore's own exceptions exist separately** for credentials and parameter validation.

> — Source: [Boto3 Error handling](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html)

### 5.7 Automatic Retry Behavior 🆕

AWS SDKs implement automatic retry logic. In practice there are **three retry modes**, and the default differs by version.

| Mode | Default in | Max attempts | Retry targets | Backoff |
|---|---|---|---|---|
| **`standard`** | AWS CLI v2 | 2 retries = **3 total calls** | Transport errors (`RequestTimeout`, `ConnectionError`, `HTTPClientError`, and so on), service-side throttling/limit exceptions (`ThrottlingException`, `ProvisionedThroughputExceededException`, `SlowDown`, and so on), HTTP 500/502/503/504 | Exponential backoff with base factor 2, **up to 20 seconds** |
| **`legacy`** | AWS CLI v1 | 4 retries = 5 total calls. **DynamoDB is 9 retries = 10 total** | A **limited list** of socket/connection errors and throttling exceptions. HTTP 429/500/502/503/504/509 | Exponential backoff with base factor 2 |
| **`adaptive`** | (not a default) | Same as standard | Same as standard | All of standard plus **token-bucket-based client-side rate limiting**. Dynamically updates the rate-limiting variables based on responses |

> ⚠️ `adaptive` is an **experimental mode** and its features and behavior may change.

How to configure:

```ini
# ~/.aws/config
[default]
retry_mode = standard
max_attempts = 6
```

```bash
# You can also set it with environment variables.
export AWS_RETRY_MODE=standard
export AWS_MAX_ATTEMPTS=6
```

The `--debug` option shows retry logs. In `legacy` mode `botocore.retryhandler` generates the messages, and in `standard` and `adaptive` mode `botocore.retries.standard` does.

> — Source: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 5.8 Understanding Your Application (Observability)

Make your system observable. You can enable metrics and logs from the SDK or the service.

| Category | Detail |
|---|---|
| SDK built-in metrics | 4xx/5xx errors, API request count, retries, throttling, duration, latency |
| Logging framework support | Log4j, NLog, Log4net |
| Amazon CloudWatch | Dashboards, logs, metrics, alarms, events. Collects, aggregates, and summarizes compute utilization such as CPU, memory, disk, and network data, plus diagnostic information |
| AWS X-Ray | Traces, analysis, service map. Provides an end-to-end, cross-service view of requests sent to your application. Aggregates data collected from individual services into a single unit called a **trace** (the path a request takes through each service and layer) and generates a service map |

🔄 Enabling metrics in the AWS SDK for Java is done by choosing a **`MetricPublisher` implementation**, not through system properties.

- `CloudWatchMetricPublisher` sends metrics directly to CloudWatch. Because of possible data loss, it is **not suitable for short-lived Lambda functions.**
- Metrics can be enabled **per specific request** or **per specific service client**, and require the `cloudwatch-metric-publisher` artifact dependency.
- There is also a logging publisher that prints metrics to the console.

> — Source: [Monitor application performance with SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html)

---

## 6. Integrated Development Environments

### 6.1 Why Use an IDE

An integrated development environment (IDE) lets you write, run, and debug the code for your application. Having the developer tools you need within a single application improves productivity. Syntax highlighting and autocomplete/hints improve readability, and a compiler or interpreter plus debugging features deepen your understanding of the code.

An IDE can be installed locally or be cloud-based. Benefits of a cloud-based IDE:

- Access it through a web browser from any computer or OS.
- Backed by more compute power than a local machine.
- Quickly spin up a preconfigured development environment.
- Collaborate with multiple developers on the same code at once.
- Use platform-specific SDKs.

### 6.2 AWS IDE Toolkits 🔄

The AWS Toolkit is available for several IDEs and makes it easier to create, debug, and deploy applications using AWS. The official "additional AWS IDE toolkits" guidance lists three.

| Toolkit | Target |
|---|---|
| AWS Toolkit for JetBrains | The JetBrains IDE family (install from the JetBrains Marketplace) |
| AWS Toolkit for Visual Studio Code | Visual Studio Code. An open-source extension for developing, locally debugging, and deploying serverless applications |
| Toolkit for Visual Studio | Visual Studio |

🆕 The individual toolkits the JetBrains toolkit covers:

| IDE | Target language/use |
|---|---|
| CLion | C · C++ |
| GoLand | Go |
| IntelliJ | Java |
| WebStorm | Node.js |
| Rider | .NET |
| PhpStorm | PHP |
| PyCharm | Python |
| RubyMine | Ruby |
| DataGrip | Database management |

With a toolkit you can work with AWS Lambda functions, AWS CloudFormation stacks, and Amazon ECS clusters, and it provides AWS credential and Region management.

> We could not confirm the current status of the Eclipse and Azure DevOps toolkits ([Section 8.5](#85-items-we-could-not-verify)).
>
> — Source: [Additional IDE Toolkits from AWS](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/downloads.html), [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html), [AWS Toolkit for Visual Studio Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)

### 6.3 AWS Cloud9 🔄

**AWS Cloud9 is no longer available to new customers.** Existing AWS Cloud9 customers can continue to use the service normally.

| Category | Status |
|---|---|
| Existing customers | Can continue using it. Lab environments already deployed in training accounts may work |
| New customers | **Cannot use it.** You cannot create a new Cloud9 environment in your own account |
| Alternatives | The AWS IDE toolkits ([Section 6.2](#62-aws-ide-toolkits)) or **AWS CloudShell** |

Know that a lab environment may have Cloud9 deployed, but you cannot create it anew in your own account.

> — Source: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)

### 6.4 Amazon Q Developer and the End of Support for IDE Plugins 🆕

**AWS will end support for the Amazon Q Developer IDE plugins on April 30, 2027.** For similar capabilities (the latest models and features, including agentic coding, chat, and MCP support), it directs you to Kiro. If you have been using Amazon Q Developer in an IDE, the features you rely on now, such as inline suggestions, chat, and code generation, are all available in Kiro.

The IDEs and features Amazon Q Developer supports until end of support:

| Feature | VS Code | JetBrains | Eclipse | Visual Studio |
|---|---|---|---|---|
| Chat | O | O | O | O |
| Agentic coding | O | O | O | O |
| MCP servers | O | O | O | O |
| Chat context | O | O | O | O |
| Workspace context | O | O | O | O |
| Inline suggestions | O | O | O | O |
| Inline chat | O | O | O | **X** |
| Transformations | O | O | **X** | O |

> — Source: [Amazon Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html), [Using Amazon Q Developer in the IDE](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html)

### 6.5 Kiro: An AI-Powered IDE with Spec-Driven Development

Kiro is **AWS's agentic development system**, designed to accelerate software development. It manages intent, completes long-running tasks across large codebases, and verifies code correctness with advanced agents that learn from every session. Its goal is to bridge the gap for developers and teams moving from AI coding to engineering.

🆕 Kiro comes in **three forms.**

| Form | Description |
|---|---|
| IDE | An AI-powered integrated development environment built on Code OSS |
| CLI | A command-line interface |
| Autonomous web agent | An autonomous web agent |

> — Source: [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html)

#### Spec-driven development

It connects conceptual product requirements with technical implementation details. Three files form the layered understanding that lets an AI agent work intelligently.

| File | Question it answers | Role |
|---|---|---|
| `requirements.md` | The target and the **Why** | Clarifies business goals and success criteria with structured syntax |
| `design.md` | The **How** | A technical architecture blueprint the AI agent follows systematically to make implementation decisions |
| `tasks.md` | **When, in what order** | A clear implementation path that prevents inefficient or contradictory approaches |

🆕 The AWS Well-Architected Agentic AI Lens recommends such spec-driven development tools and explains why:

- A specification **separates an agent's behavior from its author.** Even if the original developer leaves, the next person understands the system through the specification rather than reverse engineering.
- When the specification is the **starting point** rather than an afterthought, documentation is produced as a by-product of development.
- The upfront investment in writing the specification is **recovered during code review, testing, and later evolution**, because every subsequent change is made against a clear baseline.

> — Source: [AGENTSUS03-BP03 (AWS Well-Architected Agentic AI Lens)](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html)

#### Core features

| Feature | Description |
|---|---|
| Agent steering | Creates project-specific intelligence with configuration files that guide behavior and decisions, customizing the AI agent to a domain |
| Dual operating modes | **Autopilot** — the AI agent completes an entire feature on its own / **Supervised** — a human controls the important decisions |
| Model Context Protocol (MCP) | Extends capabilities through specialized modules |
| Multimodal context handling | Handles context across files, terminal output, and documents for a richer understanding of the codebase |

#### Model Context Protocol (MCP) 🔄

MCP is an open protocol for securely connecting AI models to external data sources, tools, and systems. Worth knowing:

- MCP is an **open protocol introduced by Anthropic.** It is not an AWS-created standard.
- It integrates LLM applications with external data sources and tools to give access to real-time information.

🆕 The three core primitives of MCP:

| Primitive | Role |
|---|---|
| Resources | Exposes data and content such as files, databases, and APIs to AI applications |
| Tools | Lets an LLM perform actions such as creating tickets, running queries, and calling APIs |
| Prompts | Reusable prompt templates that carry dynamic context |

🆕 Benefits of MCP: standardization (no custom integration per connection), discoverability (automatically discover available capabilities without manual configuration), security (centralized authentication and authorization at the protocol level), maintainability (update the integration logic once and every connected AI application benefits), and scalability (add new data sources and tools without modifying the AI application).

> — Source: [What is the Model Context Protocol (MCP)?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html)

---

## 7. Setting Up Your Development Environment

### 7.1 Getting Started with the AWS SDKs

The steps to set up your development environment so you can use the AWS SDKs.

| Step | Detail |
|---|---|
| 1 | Install the development environment (Java, Python (Boto3), .NET, and so on) |
| 2 | Install the AWS SDK for your language |
| 3 | Set up your AWS credentials |

To access AWS with an AWS SDK, you need an AWS account and AWS credentials.

### 7.2 Setting Up Credentials 🔄

An IAM user is better than the root user. And the current recommendation is **short-term (temporary) credentials**, not an IAM user's **long-term access keys**. The AWS documentation classifies IAM user long-term credentials as "not recommended."

| Method | Recommendation |
|---|---|
| Console credentials used as temporary credentials | **Recommended** |
| Temporary credentials from IAM Identity Center workforce credentials | Recommended |
| IAM temporary credentials (AWS STS) | Recommended |
| IAM user long-term credentials | **Not recommended** |

🆕 Alternatives to long-term access keys:

| Alternative | Description |
|---|---|
| A secrets management solution such as AWS Secrets Manager | Do not put long-term keys in code or repositories; retrieve secrets when needed |
| Issuing temporary credentials with an IAM role | Whenever possible, use a mechanism that issues temporary credentials. They are generated dynamically on request and have a limited lifetime, so they need no management or rotation |
| AWS IAM Roles Anywhere | For machines running outside AWS |
| `aws login` (AWS CLI v2) | Create short-term credentials from console credentials to run CLI commands |
| AWS CloudShell | A browser-based **pre-authenticated** shell. Launches straight from the AWS Management Console |

Environment variables: credentials are `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, and the Region is `AWS_REGION` (🆕 added as an SDK-compatible variable in AWS CLI v2, overriding the AWS CLI-only `AWS_DEFAULT_REGION`).

> — Source: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)

---

## 8. Changes from the Courseware

Since learners may have the official courseware in front of them, this section gathers in one place where this material diverges from it. The evidence behind every item marked new or corrected in the sections above is here.

### 8.1 Differences from the Courseware

| Item | What the courseware says | What is confirmed now | Source |
|---|---|---|---|
| Location of the status code | The status and status message are in the request headers | The status code and status message are on the **start line (status line) of the response.** The courseware even states it correctly on another slide, so it contradicts itself, and the example code has `HTTP/1.1 200 OK` on the first line | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| CLI command structure | Labels `s3://mybucket` as a "subcommand" in `aws s3 ls s3://mybucket --recursive` | The structure is `aws <command> <subcommand> [options and parameters]`, the subcommand is just `ls`, and `s3://mybucket` is a parameter | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| SDK supported language list | The instructor notes (including Android, iOS, Node.js) and the graphic list disagree | Node.js is not a separate SDK; it is supported through the JavaScript SDK, and Android/iOS (Mobile SDK) are out of scope of the SDK lifecycle documentation | [SDK lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| The library the CLI uses | One place says "uses the Python SDK," another says "uses Botocore" | It is precisely **Botocore.** The AWS CLI uses Boto3's retry methodology and logging | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| Java exception class names and cited link | Uses `com.amazonaws.AmazonServiceException` and `com.amazonaws.AmazonClientException` (the 1.x package) while linking the 2.x guide | The 2.x layer is `AwsServiceException` (a subclass of `SdkServiceException`) and `SdkClientException` | [Java 2.x error handling](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html) |
| .NET example code | Declares `var response` twice in the same block | It does not compile as-is. We renamed the second to `describeResponse` and added the `status` declaration | [DynamoDB code examples](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html) |
| Java waiter example code | End-of-support 1.x syntax, and missing a closing parenthesis | Corrected to 2.x syntax (`client.waiter()` and `waitUntilTableExists`) | [Waiters v1→v2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html) |
| Broken documentation links | The .NET V3 install path and a locale-pinned CLI index path | Both URLs return **HTTP 404.** Replaced with valid paths | [CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/), [.NET v4 install](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) |
| Citing a non-AWS domain | Cites `boto3.readthedocs.org` for the Boto3 quickstart | The Boto3 documentation moved to `docs.aws.amazon.com/boto3/latest/` | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) |

### 8.2 Changed Behavior and Defaults

| Item | What the courseware says | Current | Source |
|---|---|---|---|
| Replay-attack defense criterion | "Expires events that take too long to arrive" | In most cases the request must reach AWS within **5 minutes of the timestamp.** With temporary credentials, the signature calculation also needs a security token | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| Automatic retry behavior | "Implements automatic retry logic" plus "with exponential backoff" | There are three retry modes: `standard`, `legacy`, and `adaptive`. AWS CLI v2 defaults to `standard` (3 total calls, up to 20-second backoff); v1 defaults to `legacy` (5 total, 10 for DynamoDB) | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| How credentials are provided | "It is best to use an IAM user" | The recommended order is console-credential short-term credentials → IAM Identity Center → IAM short-term credentials → EC2 instance metadata → assuming a role. **IAM user long-term credentials are "not recommended"** | [CLI authentication](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| `aws configure` | Introduced only as a single command | It has `set`, `get`, `import`, `list`, `list-profiles`, `mfa-login`, `sso`, `sso-session`, and `export-credentials` subcommands, and the configuration file added `sso-session` and `services` section types | [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| Enabling Java SDK metrics | Guides toward a system-property approach | The enablement method changed to choosing a `MetricPublisher` implementation (such as `CloudWatchMetricPublisher`) | [SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html) |
| Documentation path relocations | The old paths for Boto3, DynamoDB error handling, and .NET low-level table work | They redirect to `docs.aws.amazon.com/boto3/latest/`, `Programming.Errors.html`, and `service_code_examples.html` respectively | [Boto3 DynamoDB](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html), [DynamoDB error handling](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) |
| The forms Kiro comes in | "An AI-powered IDE built on Code OSS" | It is AWS's agentic development system and comes in **three forms: IDE, CLI, and autonomous web agent** | [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html) |
| The origin of MCP | "An open-source standard" | It is an **open protocol introduced by Anthropic**, made of three primitives (Resources, Tools, Prompts) | [What is MCP?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |

### 8.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS SDK for Java 1.x | **End of support December 31, 2025** | AWS SDK for Java 2.x (`software.amazon.awssdk`) | [Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html) |
| AWS SDK for JavaScript v2 | **End of support** (both 1.x and 2.x) | AWS SDK for JavaScript v3 | [v3 migration](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html) |
| AWS SDK for Go V1 | **End of support** | AWS SDK for Go V2 | [Go V1 end-of-support](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html) |
| AWS SDK for .NET 3.x | **End of support** (1.x, 2.x, 3.x). 4.x reached GA April 28, 2025 | AWS SDK for .NET 4.x | [SDK lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Lambda runtime `nodejs12.x` | **Deprecated March 31, 2023.** Function creation blocked the same day, updates blocked April 30, 2023 | `nodejs22.x` / `nodejs24.x` / `nodejs26.x` | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS CLI v1 | In Maintenance Announcement. **Maintenance mode July 15, 2026, end of support July 15, 2027** | AWS CLI v2 | [CLI v1 Maintenance Mode Announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/) |
| AWS Cloud9 | **No longer available to new customers.** Existing customers can continue | The AWS IDE toolkits or AWS CloudShell | [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| boto3 resource interface (`boto3.resource`) | No plans to add new features. The existing interface keeps working. Not thread-safe | The client interface (`boto3.client`) | [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html) |
| Amazon Q Developer IDE plugins | **End of support scheduled April 30, 2027** | Kiro | [Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html) |
| IAM user long-term access keys | Not recommended | Console-credential short-term credentials (`aws login`), IAM Identity Center, IAM roles/instance profiles, IAM Roles Anywhere, AWS CloudShell | [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |

### 8.4 What This Material Adds

Each item was added because it is needed to understand the development foundations at a practical level.

| Added item | Why it was added | Source |
|---|---|---|
| The five-phase SDK major version lifecycle | You need to know the support phases to decide which SDK version to start on. Developer Preview → GA (at least 24 months) → Maintenance Announcement (announced at least 6 months ahead) → Maintenance (12 months by default) → End-of-Support | [SDK maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html) |
| SigV4a | Added because it is the signing method you meet with multi-Region API requests. An ECDSA-based asymmetric signature that SDKs use automatically for global endpoint calls | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| AWS CLI v2-only features | Which version you install shapes the lab experience, so we added it. Bundled Python, wizards, auto-prompt, IAM Identity Center authentication, `ddb`, `logs tail`, and so on | [CLI v2 new features](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html) |
| Access key prefix distinction | Practical knowledge for telling at a glance whether a credential is long-term or temporary. `AKIA` is long-term, `ASIA` is STS temporary | [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| The `aws wait` command structure | The standard way to wait on an asynchronous operation from the CLI | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| Credential cache locations | To understand the automatic refresh of assume-role and SSO credentials, you need to know the cache locations. `~/.aws/cli/cache` and `~/.aws/sso/cache` | [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| The list of individual JetBrains toolkit IDEs | Added so you can decide which toolkit to install for which IDE. CLion, GoLand, IntelliJ, WebStorm, Rider, PhpStorm, PyCharm, RubyMine, DataGrip | [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| The Amazon Q Developer supported-IDE matrix | You need the per-IDE feature differences of a tool approaching end of support. Inline chat is unsupported on Visual Studio, transformations on Eclipse | [Amazon Q Developer in the IDE](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html) |
| The rationale for spec-driven development | Added to explain why Kiro's approach is valid: a specification separates agent behavior from its author, documentation is produced as a by-product, and the upfront investment is recovered later | [Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html) |
| MCP primitives and benefits | Added so MCP is understood as an actual structure, not a one-line concept. The three primitives Resources, Tools, and Prompts, plus standardization, discoverability, security, maintainability, and scalability | [What is MCP?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |
| botocore's own exceptions | Understanding Boto3 error handling as only `ClientError` misses credential and validation errors, so we added them. `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, `WaiterError`, and so on | [Boto3 error handling](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html) |
| DynamoDB `CreateTable` constraints and the S3→Lambda loop caution | Pitfalls you hit when actually using asynchronous patterns. Tables with secondary indexes are created sequentially, and a self-triggering bucket causes a loop | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html), [Process S3 event notifications](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html) |

### 8.5 Items We Could Not Verify

We leave these here honestly. Confirm them before stating anything definitive in class.

| Item | Status |
|---|---|
| The `api_versions` shared configuration setting | We **could not find** the courseware's `api_versions` entry (the `ec2 = 2015-03-01` form) in the current Boto3 configuration guide or the AWS CLI configuration and credential file settings documentation. The API version locking document found in the search was the end-of-support AWS SDK for JavaScript v2 page. We did not include it in this document |
| The status of the Eclipse and Azure DevOps toolkits | The official "additional AWS IDE toolkits" guidance lists only JetBrains, VS Code, and Visual Studio, but we could not find an explicit end-of-support announcement for the Eclipse or Azure DevOps toolkits. We did confirm that Eclipse is on the Amazon Q Developer supported-IDE list |
| The CreateBucket HTTP request example | We could not confirm whether the example's `Date` header and `Authorization: authorization string` form match the current request example in the Amazon S3 API reference. We read the CreateBucket API reference but did not find a comparable example block, so we kept it as-is |
| The DynamoDB query response example | We could not compare the response example (`x-amzn-RequestId`, `x-amz-crc32`, `Content-Type: application/x-amz-json-1.0`) against official documentation. We kept it as-is |
