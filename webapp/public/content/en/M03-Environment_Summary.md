# Module 3: Getting Started with Development on AWS

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Programmatic Access to AWS Services](#2-programmatic-access-to-aws-services)
3. [AWS SDKs](#3-aws-sdks)
4. [AWS Command Line Interface](#4-aws-command-line-interface)
5. [AWS SDK Programming Patterns](#5-aws-sdk-programming-patterns)
6. [Integrated Development Environments](#6-integrated-development-environments)
7. [Setting Up Your Development Environment](#7-setting-up-your-development-environment)
8. [Changes from the Courseware](#8-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Verified on: August 25, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Describe how to access AWS services programmatically
- List the programming patterns in the AWS SDKs

### Where This Module Sits

| Item | Content |
|---|---|
| Module 2 | Building a web application on AWS |
| **Module 3** | **Getting started with development on AWS** — the foundational knowledge you need to start developing with AWS resources. Includes a brief AWS CLI demonstration |
| Lab 1 | Configuring the developer environment |
| Module 4 | Getting started with permissions |

Lab environment (from the day 1 agenda diagram): you connect through Guacamole, SSH, or remote desktop to an IDE on an EC2 instance in the AWS Cloud, and from that IDE you work with AWS IAM and Amazon S3.

### Module Sections

| Courseware slides | Section | Chapter in this document |
|---|---|---|
| 4–17 | Accessing AWS services programmatically | Chapters 2 and 3 |
| 18–21 | AWS Command Line Interface (AWS CLI) | Chapter 4 |
| 22–23 | Demo | Chapter 4 |
| 24–31 | AWS SDKs and programming patterns | Chapter 5 |
| 32–37 | Integrated development environments (IDEs) | Chapter 6 |
| 38–39 | Checkpoint | Chapter 9 |
| 40–43 | Summary | Chapters 7 and 9 |

---

## 2. Programmatic Access to AWS Services

### 2.1 The AWS REST API and Service Endpoints

Every AWS service supports a dedicated application programming interface (API) that exposes its functionality. To connect to an AWS service programmatically, you use an **AWS service endpoint**. An endpoint is the entry point URL for an AWS product or service, and it is where the API is served.

```text
Client application  ──── request ────▶  AWS REST API  ──▶  Run an instance
                    ◀─── response ───                  ──▶  Upload a file / create a bucket in S3
                                                       ──▶  Update an item in a database
       Transport: HTTP(S) · SigV4 · IAM access keys (ID, secret)
```

### 2.2 Request Signing and SigV4 🔄

For security, most AWS requests must be signed. AWS supports **Signature Version 4 (SigV4)** as the process for adding authentication information to AWS requests sent over HTTP, and SigV4 is the current default for most AWS service operations.

What the signature does:

| Purpose | Behavior |
|---|---|
| Verify the identity of the requester | You create the signature with your access keys (access key ID, secret access key). 🆕 If you use **temporary security credentials**, the signature calculations also require a **security token**. |
| Protect data in transit | Some request elements are used to calculate a hash (digest) of the request, and the hash is included in the request. The service recomputes it with the same information and denies the request if the values do not match. |
| Protect against potential replay attacks | Uses a time stamp. 🔄 The criterion is that in most cases **a request must reach AWS within five minutes of the time stamp in the request.** Otherwise, AWS denies the request. |

- SigV4 can be expressed in the **HTTP `Authorization` header** or as a **query string in the URL**.
- When you write custom code that sends API requests to AWS, you must include code that signs the requests. AWS SDKs and the AWS CLI **authenticate your requests for you** using the access keys you provide.
- 🆕 **SigV4a** uses asymmetric ECDSA signatures and is required for multi-Region API requests, such as with Amazon S3 Multi-Region Access Points. The SDK uses it automatically for global endpoint calls. AWS only needs to store your public keys, and public keys cannot be used to sign requests.

> — Source: [AWS Signature Version 4 for API requests](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

### 2.3 Example: HTTP Request and Response (Amazon S3 API)

An API provides a standard method of communication. Request and response messages have a similar structure. Each has a **start line**, plus optional **header** and **body** sections.

Request — a CreateBucket request for a bucket named `pollynotes` in the default AWS Region (as documented in the courseware)

```http
PUT / HTTP/1.1
Host: pollynotes.s3.<Region>.amazonaws.com
Content-Length: 0
Date: Wed, 01 Mar 2006 12:00:00 GMT
Authorization: authorization string
```

Response — the response to the CreateBucket request

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
| Request | The **operation** to be performed on the server and the **path to the resource** on the web server. The resource path must have a value; if none is specified, it is shown as a slash (`/`) representing the server root |
| Response | Whether the request **succeeded or failed** |

#### Headers

Headers carry metadata associated with API requests and responses. Some headers are well defined, such as `Host` which indicates the domain of the server, and headers can also be custom. The headers are followed by a **blank line** marking the end of the header fields. The format is `<header field> ":" <field-value>`.

| Header type | Applies to | Example |
|---|---|---|
| General | Both requests and responses | `Date: Wed, 01 Mar 2006 12:00:00 GMT` |
| Client request | Request messages | `Host: pollynotes.s3.<Region>.amazonaws.com` |
| Server response | Response messages | `x-amz-request-id: 236A8905248E5A01` |
| Resource | Contains metadata about the body or the resource identified in the request | `Content-Type: text/plain` |

The **body**, also called the payload, contains the content to be transferred between server and client.

> — Source: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

### 2.4 HTTP Status Codes 🔄

When a service responds to a request, the status code and status message are included in the **start line of the response**.

> 🔄 The courseware instructor notes state that "when the service responds to the request, the status and status message are included in the **request header**." Status codes appear in the start line of the response, not in a request header. The notes for slide 6 in the same deck state this correctly ("the start line of the response indicates whether the request succeeded or failed"), so the deck contradicts itself. The example on slide 7 also begins with `HTTP/1.1 200 OK`, which is a response start line.

| Class | Name | Meaning |
|---|---|---|
| 1xx | Informational | Informational response indicating that everything is fine so far |
| 2xx | Success | The server received and processed the request successfully |
| 3xx | Redirection | Further action is needed to complete the request |
| 4xx | Client error | A client error, which may indicate bad syntax or another user error that prevents fulfilling the request |
| 5xx | Server error | A server error that prevented fulfilling an apparently valid request |

Example DynamoDB query response (as documented in the courseware):

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

### 2.5 Four Ways to Access AWS Services

You can access AWS services and features in several ways. **All four are based on the REST API of the AWS service**, and **all access modes are interchangeable.**

| Method | Description |
|---|---|
| **API** | Every AWS service supports a dedicated API that exposes its functionality, and you can use those APIs directly. However, formatting requests, interpreting them, and responding directly can be substantial work because each service has its own specifics |
| **SDK** | AWS created the SDKs to simplify programmatic API use. Requests made through an SDK are signed automatically, and retries and errors are handled, so you do not have to program that logic manually |
| **AWS Management Console** | Provides a rich graphical interface for most of the functionality AWS offers. That said, working with AWS services programmatically is often more efficient than using the console |
| **AWS CLI** | Manage AWS services directly from the command program on Linux/macOS or Windows. You can create scripts consistently and run them as needed |

Both the management console and the AWS CLI are built on top of the SDKs (the direction of the arrows in the diagram on courseware slide 11).

> 🔄 The courseware says "the AWS CLI uses the Python SDK" on slide 11 and "the AWS CLI uses a Python library called Botocore. The AWS Python SDK Boto3 library is based on Botocore" on slide 20. The latter is more accurate. The AWS CLI uses Boto3's retry methodology and logging.

> — Source: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 2.6 Common Patterns Handled by the SDKs and Service APIs

When you use AWS APIs, you encounter the following common usage patterns:

- Granting access to your application
- Adjusting account limits because of restricted bandwidth
- Integrating multiple services

Pattern labels shown in the diagram on courseware slide 12: authenticate the user / check for an existing bucket / adjust throttling / pagination / check the status of an asynchronous call / follow the data / service integration

**The AWS SDKs cover and simplify some of these patterns.**

Services shown in the diagram: Amazon API Gateway, DynamoDB, Amazon Polly, AWS X-Ray, AWS SAM, Amazon CloudWatch, IAM, Amazon Cognito

---

## 3. AWS SDKs

The AWS SDKs let your application use AWS services in your preferred programming language. For example, if a music sharing application needs to upload a user's music files to an S3 bucket, it can use an AWS SDK to upload them programmatically.

### 3.1 Why Use an AWS SDK

| Benefit | Description |
|---|---|
| Language bindings | Call AWS APIs with classes and methods in a familiar language |
| HTTP request signing | The signature is calculated automatically |
| Built-in resiliency | Retry, error, and timeout logic |
| Pagination support | Use a paginator in one line of code. You do not have to write logic for continuation tokens, loops, and multiple API calls |

In short: **familiar tools + efficiency + consistency.** You do not need to write request parsing logic or the same retry logic you would write when using the API directly.

### 3.2 AWS SDKs by Language and Their Support Status 🔄

The courseware lists supported SDK languages differently in two places and does not cover per-version support status. Below is the current status recorded in the AWS SDKs and Tools version lifecycle documentation.

| SDK | Supported major versions | Major versions at end-of-support |
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
| AWS CLI | 2.x | 🔄 1.x is in the Maintenance Announcement phase ([Section 4.2](#42-aws-cli-v1-and-v2)) |
| Tools for PowerShell | 5.x | 2.x, 3.x, 4.x |

Differences from the courseware list:

- The instructor notes list `Android`, `iOS`, and `Node.js` as SDK languages. **Node.js is not a separate SDK; it is supported by the JavaScript SDK**, and Android and iOS are outside the scope of this lifecycle document (Mobile SDKs are excluded).
- The slide graphic list (Python, .NET, Java, C++, Ruby, JavaScript, Go, Node.js, PHP, Rust, Kotlin, Swift) does not match the instructor notes list.
- For Java, Go, JavaScript, and .NET, the courseware cites **documentation for versions that have reached end-of-support** (see [Section 8.3](#83-discouraged-or-end-of-support-items)).

> — Source: [AWS SDKs and Tools version lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html), [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html), [Migrate to v3 of the AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html), [What is the AWS SDK for Go](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html)

#### Current SDK documentation links 🔄

Some links in the courseware instructor notes are broken or point to versions at end-of-support. These are the verified current paths.

| Language | Current documentation | Status of the courseware link |
|---|---|---|
| Python (Boto3) | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) | 🔄 Redirected from `boto3.readthedocs.org` (not an AWS-owned domain) |
| .NET | [Install AWSSDK packages with NuGet (v4)](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) | 🔄 The courseware V3 path returns **HTTP 404** |
| Java | [AWS SDK for Java 2.x Developer Guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/) · [API Reference](https://docs.aws.amazon.com/java/api/latest/) | 🔄 The courseware API reference is the 1.x javadoc |
| JavaScript | [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html) | 🔄 The courseware cites the v2 API reference |
| Go | [AWS SDK for Go V2](https://docs.aws.amazon.com/sdk-for-go/v2/developer-guide/welcome.html) | 🔄 The courseware cites the V1 guide |
| PHP | [AWS SDK for PHP v3](https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/welcome.html) | Valid |
| AWS CLI command reference | [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/) | 🔄 The courseware path with the `pt_br` locale pinned returns **HTTP 404** |

> — Source: [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/), [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html)

### 3.3 SDK Major Version Lifecycle 🆕

The courseware does not cover version support. Major versions of AWS SDKs and Tools go through five phases. This is the basis for deciding which SDK version to pick.

| Phase | Name | Level of support | Duration |
|---|---|---|---|
| Phase 0 | Developer Preview | Not supported. Must not be used in production. Intended for early access and feedback | — |
| Phase 1 | General Availability (GA) | Fully supported. Regular releases with support for new services, API updates for existing services, and bug and security fixes | **At least 24 months** |
| Phase 2 | Maintenance Announcement | AWS makes a public announcement **at least 6 months** before an SDK enters maintenance mode. Fully supported during this period | — |
| Phase 3 | Maintenance | Critical bug fixes and security issues only. No API updates for new or existing services and no new Region support | **Default of 12 months** |
| Phase 4 | End-of-Support | No more updates or releases. Previously published releases remain available via public package managers and the code remains on GitHub, though the repository may be archived | — |

Dependencies (operating systems, language runtimes, third-party libraries) are supported for **at least 6 months** after the community or vendor ends support. AWS reserves the right to stop support for an underlying dependency without increasing the major SDK version.

> — Source: [AWS SDKs and Tools maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html)

### 3.4 Low-Level and High-Level APIs 🔄

| Type | Characteristics | Name in Python |
|---|---|---|
| **Low-level API** | One method per service operation. A direct mapping of the AWS service API. Complete control over requests and tight control over the behavior and performance of calls | Service client API (`boto3.client`) |
| **High-level API** | One class per conceptual resource. Defines service resources and individual resources. A higher level of abstraction than low-level calls | Resource API (`boto3.resource`) |

High-level API classes provide methods to retrieve data about a resource, invoke actions that can be performed on the resource, and retrieve links to other related resources. For example, when uploading a file to an S3 bucket, the high-level API uses the file size to decide whether to upload it in a single operation or in multiple parts.

> **🔄 Important**: the courseware recommends that "generally, if the high-level API provides the methods needed to perform your task, use it for simplicity", and its examples use the resource API. However, **the AWS Python SDK team does not intend to add new features to the resources interface in boto3.** Existing interfaces will continue to operate during boto3's lifecycle, but newer service features are available through the **client interface**. Write new code against the client interface.
>
> 🆕 An additional constraint: **resource instances are not thread safe.** They should not be shared across threads or processes; create a new session and resource for each thread.
>
> — Source: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.5 Example: Connecting to a Service with the API (Python)

Low-level API (recommended) — list the objects in a bucket

```python
# Return type is a dict. Fetching the objects themselves needs extra API calls.
def listClient():
    s3client = boto3.client('s3')
    response = s3client.list_objects_v2(Bucket='mybucket')
    for content in response['Contents']:
        print(content['Key'], content['LastModified'])
```

High-level API — list the objects in a bucket 🔄

```python
# Resources represent an object-oriented interface to AWS. They provide a higher
# level of abstraction than the raw, low-level calls made by service clients.
# Note: the resource interface receives no new features. See Section 3.4.
def listResource():
    s3resource = boto3.resource('s3')
    bucket = s3resource.Bucket('mybucket')
    for object in bucket.objects.all():
        print(object.key, object.last_modified)
```

> — Source: [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html)

### 3.6 Locking API Versions

AWS services have versioned APIs, and you can lock at the SDK level or the service level. APIs can change, so if your code depends on a specific API version, it is a good idea to pin the service to the version number you are using. You can also pin by SDK version, but to optimize your application, pull in only the components you need instead of the entire SDK.

The configuration example from the courseware (as documented in the courseware):

```ini
[profile development]
aws_access_key_id=foo
aws_secret_access_key=bar
api_versions =
    ec2 = 2015-03-01
    cloudfront = 2015-09-17
```

Courseware note: this slide is hidden in the instructor deck because it does not apply to .NET or Java.

> **Verification status**: the `api_versions` setting above **could not be confirmed** in the current Boto3 configuration guide or the AWS CLI configuration and credential file settings documentation (see [Section 8.5](#85-items-that-could-not-be-verified)). What was confirmed is that Boto3's configuration lookup order is **`Config` object → environment variables → `~/.aws/config`**, and that the default `signature_version` on the `Config` object is Signature Version 4.

```python
import boto3
from botocore.config import Config

# Client-specific configuration goes in a Config object, which takes precedence
# over environment variables and the config file.
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

## 4. AWS Command Line Interface

### 4.1 Where the AWS CLI Runs

You can run the AWS CLI in a terminal program to work with AWS services. The AWS CLI is available on Linux, Windows, and macOS, and it can also be installed on Linux and Windows EC2 instances.

| Type | Location | Description |
|---|---|---|
| Local | Linux shell | Common shell programs such as bash, zsh, and tcsh on Linux or macOS |
| Local | Windows command line | Windows command prompt or PowerShell |
| Local | macOS | Terminal |
| Remote | EC2 through SSH/PuTTY | Remote terminal programs such as PuTTY or SSH on an EC2 instance |
| Remote | AWS CloudShell | 🆕 A browser-based, **pre-authenticated** shell that you launch directly from the AWS Management Console. Recommended as an alternative to long-term access keys |
| Remote | AWS Systems Manager session | Run commands using Systems Manager |

You can download the AWS CLI from the [AWS Command Line Interface web page](https://aws.amazon.com/cli/).

> — Source: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

### 4.2 AWS CLI v1 and v2 🆕

The courseware treats the AWS CLI as a single product and does not distinguish versions. **Which version you install matters.**

| Item | AWS CLI v1 | AWS CLI v2 |
|---|---|---|
| Lifecycle phase | **Maintenance Announcement** | General Availability (February 10, 2020) |
| Enters maintenance mode | **July 15, 2026** | — |
| End-of-support | **July 15, 2027** | — |
| Python | Requires a system Python | **Embedded Python.** Does not require, or interact with, your system-wide Python |
| Default retry mode | `legacy` | `standard` |
| IAM Identity Center authentication | — | Supported |
| Interactive features | — | Wizards, auto-prompt, server-side command completion |
| Output | — | Client-side pager on by default, `yaml` and `yaml-stream` formats |
| Credential management | — | `aws login`, `aws configure import`, `aws configure list-profiles` |
| Other v2-only features | — | Docker image, high-level DynamoDB `ddb put` and `ddb select`, `aws logs tail`, `--copy-props` on `s3` commands, SDK-compatible `AWS_REGION` environment variable |

During maintenance mode (2026-07-15 to 2027-07-14), only **critical bug fixes and security updates** are released. No changes to AWS CLI v1 itself, no new AWS services, no API updates for existing services, and no expansions of Regions and endpoints.

Features not backported to v1: high-level DynamoDB commands, EC2 Instance Connect with an SSH client, and the interactive mode for CloudWatch Logs Live Tail.

> — Source: [CLI v1 Maintenance Mode Announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/), [New features and changes in the AWS CLI version 2](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html)

### 4.3 Command Structure 🔄

AWS CLI commands use a multipart structure that **must be specified in this order**.

```bash
aws <command> <subcommand> [options and parameters]
```

| Order | Part | Description |
|---|---|---|
| 1 | Base call | The `aws` program |
| 2 | **command** | The top-level command, which typically corresponds to an AWS service supported by the AWS CLI (for example `s3`, `ec2`, `cloudwatch`) |
| 3 | **subcommand** | The operation to perform (for example `ls`, `cp`, `run-instances`, `put-metric-data`) |
| 4 | **options and parameters** | General AWS CLI options or parameters required by the operation. You can specify these in any order as long as they follow the first three parts, and if an exclusive parameter is specified multiple times, only the **last value** applies. Argument names are prefixed with two dashes (`--`) |

🔄 Courseware slide 20 also labels `s3://mybucket` as a "subcommand" in `aws s3 ls s3://mybucket --recursive`, and the instructor notes say "the subcommand is `ls`, whose target is `s3://mybuket`". The correct breakdown is:

| Part | Value |
|---|---|
| Base call | `aws` |
| command (service) | `s3` |
| subcommand | `ls` |
| Parameters | `s3://mybucket`, `--recursive` |

```bash
# List all contents of the bucket recursively
aws s3 ls s3://mybucket --recursive

# Copy a local file to the bucket
aws s3 cp myFile.txt s3://mybucket

# Get help at several levels
aws help
aws s3 help
aws s3 ls help
```

🆕 The `wait` command has one more part. Not every AWS service supports `wait` commands.

```bash
aws <command> wait <subcommand> [options and parameters]
```

Check the [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/) for the list of supported services.

> — Source: [Command structure in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html)

### 4.4 aws configure and Credentials 🔄

To set defaults for all AWS CLI commands, run the `aws configure` command on the machine hosting the AWS CLI. You can also specify a default AWS Region.

🔄 The courseware only explains that "by default, the access key ID and secret access key are associated with the IAM account that you use to access AWS resources." The current AWS CLI documentation presents credential methods **in order of recommendation**, and IAM user long-term credentials are **not recommended**.

| Rank | Authentication type | Purpose |
|---|---|---|
| 1 | **AWS Management Console credentials** (recommended) | Use short-term credentials by logging into the AWS CLI with your console credentials. Recommended if you use root, IAM users, or federation with IAM for AWS account access |
| 2 | IAM Identity Center workforce users short-term credentials | Short-term credentials combined with a user directory (the built-in IAM Identity Center directory or Active Directory). Using AWS Organizations with IAM Identity Center is a security best practice |
| 3 | IAM user short-term credentials | More secure than long-term credentials. If compromised, there is a limited time they can be used before they expire |
| 4 | EC2 instance metadata | Query for temporary credentials using the role assigned to the Amazon EC2 instance |
| 5 | Assume roles for permissions | Pair another credential method and assume a role for temporary access |
| 6 | IAM user **long-term** credentials | **(Not recommended)** No expiration |
| 7 | External storage | **(Not recommended)** Only as secure as the external location |

🆕 Precedence of credentials and configuration settings (the first one found wins):

1. Command line options (`--region`, `--output`, `--profile`)
2. Environment variables
3. Assume role
4. Assume role with web identity
5. AWS IAM Identity Center
6. Credentials file
7. Custom process
8. Configuration file
9. Container credentials (Amazon ECS task IAM roles)
10. Amazon EC2 instance profile credentials

🆕 The access key ID prefix tells you what kind of key it is.

| Prefix | Meaning |
|---|---|
| `AKIA` | **Long-term** access key for an IAM user or an AWS account root user |
| `ASIA` | **Temporary** credentials access key created using AWS STS operations. Includes a security token that indicates when the credentials expire |

> — Source: [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html)

#### 🆕 The aws configure command family

The courseware introduces only `aws configure`. There are in fact several subcommands.

| Command | Purpose |
|---|---|
| `aws configure` | Interactively set access keys, Region, and output format |
| `aws configure set` | Set an individual value (`aws configure set region us-west-2 --profile integ`) |
| `aws configure get` | Retrieve an individual value |
| `aws configure list` | Show the profile, access key, secret key, and Region along with the **TYPE and LOCATION** each value came from |
| `aws configure list-profiles` | List all configured profile names |
| `aws configure import` | Import CSV credentials generated from the IAM web console. Not for IAM Identity Center |
| `aws configure mfa-login` | Create a temporary credentials profile using MFA and IAM user credentials |
| `aws configure sso` | Configure an IAM Identity Center profile |
| `aws configure sso-session` | Configure only the `sso-session` section |
| `aws configure export-credentials` | Export the currently set credentials in a specified format (default `process`) |

#### Configuration file structure and caching

The `config` and `credentials` files are organized into three section types.

| Section type | Format | Purpose |
|---|---|---|
| `profile` | config file `[default]`, `[profile user1]` / credentials file `[default]`, `[user1]` | Credentials, Region, output format. **Do not use the word `profile` in the credentials file** |
| 🆕 `sso-session` | `[sso-session my-sso]` | IAM Identity Center start URL, Region, registration scopes |
| 🆕 `services` | `[services my-services]` | Service-specific custom endpoints |

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

- When a shared profile specifies an IAM role, the AWS CLI calls the AWS STS `AssumeRole` operation to retrieve temporary credentials, caches them in `~/.aws/cli/cache`, and **refreshes them automatically** when they expire.
- IAM Identity Center authentication tokens are cached in `~/.aws/sso/cache`.
- You can change the file locations with the `AWS_CONFIG_FILE` and `AWS_SHARED_CREDENTIALS_FILE` environment variables.

> — Source: [Configuration and credential file settings in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

### 4.5 Example: Creating a Lambda Function with the AWS CLI 🔄

The courseware example uses `--runtime nodejs12.x`. That runtime was **deprecated on March 31, 2023, and function creation was blocked the same day**, so running the example as written fails.

```bash
# The courseware example, corrected to a currently supported Node.js runtime.
aws lambda create-function --function-name ProcessDynamoDBRecords \
  --zip-file fileb://function.zip --handler index.handler --runtime nodejs22.x \
  --role arn:aws:iam::123456789012:role/lambda-dynamodb-role
```

| Node.js runtime | Identifier | Status |
|---|---|---|
| Node.js 26 | `nodejs26.x` | Supported. No deprecation scheduled |
| Node.js 24 | `nodejs24.x` | Supported. Deprecation date April 30, 2028 |
| Node.js 22 | `nodejs22.x` | Supported. Deprecation date April 30, 2027 |
| Node.js 20 | `nodejs20.x` | Deprecated April 30, 2026 |
| Node.js 18 | `nodejs18.x` | Deprecated September 1, 2025 |
| **Node.js 12** | **`nodejs12.x`** | **Deprecated March 31, 2023. Function create blocked March 31, 2023; function update blocked April 30, 2023** |

AWS deprecates a runtime when its major components reach end of community long-term support and security updates are no longer available. The courseware's advice to "note the use of headers and security" still applies. The example's `lambda-dynamodb-role` is broad, so narrow it to least privilege in real work.

> — Source: [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)

### 4.6 Demonstration: AWS CLI

Interact with AWS services from the command line interface. Instructor note: use a local terminal, AWS CloudShell, or an IDE. For the lab environment, see [Section 6.3](#63-aws-cloud9).

---

## 5. AWS SDK Programming Patterns

### 5.1 Synchronous and Asynchronous Operations

| Type | Behavior |
|---|---|
| **Synchronous / blocking** | The client makes a request and waits for the command to complete. It blocks and prevents the client from continuing until it receives a response from the service |
| **Asynchronous / non-blocking** | The client makes a request but does not wait for the command to complete. Control returns to the client before the service returns a response, which makes it effective for invoking high-latency operations |

With an asynchronous call, the application receives a response indicating that the **request was received** and does not immediately know whether the request will succeed. You therefore need a way to retrieve the response when it is ready or check whether the request failed. It also assumes some resiliency for handling errors and retries is built into the client side.

Examples given in the courseware:

| Service or operation | Invocation type |
|---|---|
| AWS Lambda | Synchronous or asynchronous |
| Amazon S3 → Lambda | 🆕 Confirmed. Amazon S3 invokes your function **asynchronously** with an event that contains details about the object. You configure notification settings on the bucket and grant Amazon S3 permission to invoke the function in the function's resource-based policy |
| DynamoDB `CreateTable` | 🆕 Confirmed. This is an **asynchronous operation**. Upon receiving the request, DynamoDB immediately returns a response with a `TableStatus` of `CREATING`, then sets it to `ACTIVE` once the table is created. You can perform read and write operations only on an `ACTIVE` table, and you check status with `DescribeTable` |

> 🆕 Caution: if a Lambda function uploads an object to the same bucket that triggers it, the function can run in a loop. Use two buckets, or configure the trigger to apply only to a prefix used for incoming objects.
>
> 🆕 Only one table with secondary indexes can be in the `CREATING` state at any given time, so create such tables sequentially.

Request and response example (DynamoDB `create-table`):

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

### 5.2 Polling for State with Waiters

A **waiter** is an abstraction for polling a resource until it reaches a desired state or an error indicates that the state cannot be reached.

Asynchronous programming sometimes requires polling to check service state, because you must confirm a resource is ready before using it. The waiter utility provides an API that handles the polling task, so you do not have to write the polling logic, the specific polling API, and the success state for each AWS resource you use. You can configure a waiter with a maximum number of attempts and a backoff strategy between attempts.

| Pattern | Command |
|---|---|
| Poll to get the status | `aws dynamodb describe-table --table-name Notes --query "Table.TableStatus"` |
| Wait until ACTIVE | `aws dynamodb wait table-exists --table-name Notes` |
| Cancel | `aws cloudformation cancel-update-stack --stack-name myteststack` |

### 5.3 Example: Checking Table Status (.NET)

The `CreateTable` response includes a `TableDescription` property that provides initial table information. You can also call the client's `DescribeTable` method at any time to get the latest table information. The example below polls DynamoDB until it sets the table status to `ACTIVE`.

```csharp
// Create the table using "request" information such as the table name
var response = client.CreateTable(request);
var tableDescription = response.TableDescription;

// The initial state of the table
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

> 🔄 The courseware example declares `var response` twice in the same block, so it does not compile. The code above renames the second variable to `describeResponse` and adds the `status` declaration. The logic is the same as the courseware.
>
> The courseware cites the DynamoDB Developer Guide topic "Working with DynamoDB tables in .NET" as the source, but that page now redirects to the [DynamoDB code examples collection](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html).
>
> — Source: [Code examples for DynamoDB using AWS SDKs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html)

### 5.4 Example: Waiter (Python)

```python
# Create a table and wait until it is ready
# Get the service resource (see Section 3.4 for the resource interface caveats)
dynamodb = boto3.resource('dynamodb')

# Create the DynamoDB table
table = dynamodb.create_table(
    TableName='Notes',
    # ...
)

# Wait until the table exists
table.meta.client.get_waiter('table_exists').wait(TableName='Notes')

# Print out some data about the table
print(table.item_count)
```

The Boto3 DynamoDB guide the courseware cites is now at [docs.aws.amazon.com/boto3/latest/guide/dynamodb.html](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html).

> — Source: [Boto3 Amazon DynamoDB guide](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html)

### 5.5 Example: Polling with a Waiter (Java) 🔄

The courseware example uses AWS SDK for Java **1.x syntax**. Version 1.x reached end-of-support on December 31, 2025. Here is the 2.x equivalent.

```java
// AWS SDK for Java 2.x - synchronous waiter
// Note it is client.waiter(), not client.waiters() as in 1.x.
DynamoDbClient client = DynamoDbClient.create();
DynamoDbWaiter waiter = client.waiter();

// Wait until the table exists. The request is specified with a consumer builder.
WaiterResponse<DescribeTableResponse> waiterResponse =
        waiter.waitUntilTableExists(r -> r.tableName("myTable"));

waiterResponse.matched().response()
        .ifPresent(System.out::println);
```

```java
// Polling configuration - maximum attempts and a fixed delay backoff
FixedDelayBackoffStrategy fixedDelayBackoffStrategy =
        FixedDelayBackoffStrategy.create(Duration.ofSeconds(3));

waiter.waitUntilTableExists(r -> r.tableName(tableName),
        c -> c.maxAttempts(10)
              .backoffStrategy(fixedDelayBackoffStrategy));
```

How v1 maps to v2:

| Item | v1 (end-of-support) | v2 |
|---|---|---|
| Package | `com.amazonaws.services.dynamodbv2.waiters` | `software.amazon.awssdk.services.dynamodb.waiters` |
| Class | `AmazonDynamoDBWaiters` | Synchronous `DynamoDbWaiter`, asynchronous `DynamoDbAsyncWaiter` |
| Create | `client.waiters()` | `client.waiter()` (asynchronous: `asyncClient.waiter()`) |
| Wait | `waiter.tableExists().run(new WaiterParameters<>(new DescribeTableRequest(tableName)))` | `waiter.waitUntilTableExists(r -> r.tableName("myTable"))` |
| Polling config | `PollingStrategy(MaxAttemptsRetryStrategy, FixedDelayStrategy)` | `c -> c.maxAttempts(10).backoffStrategy(...)` |

Waiter classes are in the same Maven artifact as the service, so no separate dependency is required.

> 🔄 The courseware line `waiter.run(new WaiterParameters<>(new DescribeTableRequest(tableName));` is also missing a closing parenthesis.
>
> — Source: [Changes in Waiters from version 1 to version 2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html), [Using waiters in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/waiters.html)

### 5.6 Exceptions and Error Handling 🔄

When an error occurs, the AWS service returns an **error code** that you can use to decide how to handle the error.

| Error class | Response |
|---|---|
| 400 series | **Your application handles the error.** For example, if the bucket you want to access does not exist, Amazon S3 returns a 404, so the application creates the bucket first and then performs the operation |
| 500 series | **Retry the operation.** Indicates an internal server error |

#### AWS SDK for Java exceptions 🔄

The courseware lists the exception class names as `com.amazonaws.AmazonServiceException` and `com.amazonaws.AmazonClientException` while citing the **2.x developer guide**, which is self-contradictory. `com.amazonaws.*` is the 1.x package, which is at end-of-support.

| 2.x exception | Meaning | Information provided |
|---|---|---|
| `AwsServiceException` (a subclass of `SdkServiceException`) | The request was sent successfully to the service but could not be processed, and an error response was returned | Returned HTTP status code, returned AWS error code, detailed error message in the `AwsErrorDetails` class, AWS request ID for the failed request |
| Service-specific subclasses (`S3Exception`, `DynamoDbException`, `SqsException`, and so on) | In most cases one of these is thrown, allowing fine-grained handling in catch blocks | Use `AwsErrorDetails#errorCode()` to look up the error code list in the service API reference |
| `SdkClientException` | A problem occurred inside the Java client code while trying to send a request or parse a response, for example when no network connection is available | Generally more severe than an `SdkServiceException` and indicates a problem preventing service calls altogether |

The Java SDK uses runtime (**unchecked**) exceptions instead of checked exceptions. This gives developers fine-grained control over the errors they want to handle and avoids the scalability issues inherent with checked exceptions in large applications.

> — Source: [Handling errors in the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html)

#### AWS SDK for .NET exceptions

Similar to the Java SDK, the .NET SDK throws `Amazon.Runtime.AmazonServiceException` and `Amazon.Runtime.AmazonClientException` (as documented in the courseware).

#### Boto3 exceptions 🆕

Exceptions in Boto3 come from one of two sources.

| Source | Description |
|---|---|
| **botocore** | Exceptions statically defined in the botocore package. They relate to client-side behaviors, configurations, or validations. Examples: `ClientError`, `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, `WaiterError` |
| **AWS services** | Caught with the underlying botocore exception **`ClientError`**. After catching it, you parse the response for specifics including the service-specific exception |

The courseware only states that "the Boto3 SDK throws `botocore.exceptions.ClientError` when an error occurs." It omits that **botocore has its own exceptions** for things like credentials and parameter validation.

The DynamoDB error handling document the courseware cites is now at [Error handling with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html).

> — Source: [Boto3 Error handling](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html)

### 5.7 Automatic Retry Behavior 🆕

The courseware only states that "each AWS SDK implements automatic retry logic. You can configure the maximum number of retries", plus "with exponential backoff" in the answer to knowledge check 3. In fact there are **three retry modes** and the default differs by version.

| Mode | Default in | Maximum attempts | What is retried | Backoff |
|---|---|---|---|---|
| **`standard`** | AWS CLI v2 | 2 retries = **3 total call attempts** | Transient errors (`RequestTimeout`, `ConnectionError`, `HTTPClientError`, and others), service-side throttling and limit exceptions (`ThrottlingException`, `ProvisionedThroughputExceededException`, `SlowDown`, and others), HTTP 500, 502, 503, 504 | Exponential backoff with a base factor of 2, **maximum 20 seconds** |
| **`legacy`** | AWS CLI v1 | 4 retries = 5 total attempts. **DynamoDB: 9 retries = 10 total attempts** | A **limited list** of socket/connection errors and throttling exceptions. HTTP 429, 500, 502, 503, 504, 509 | Exponential backoff with a base factor of 2 |
| **`adaptive`** | (not a default) | Same as standard | Same as standard | All standard features plus **client-side rate limiting through a token bucket**. Rate-limit variables are updated dynamically based on the response |

> ⚠️ `adaptive` is an **experimental mode** and is subject to change in both features and behavior.

How to configure it:

```ini
# ~/.aws/config
[default]
retry_mode = standard
max_attempts = 6
```

```bash
# You can also set these with environment variables.
export AWS_RETRY_MODE=standard
export AWS_MAX_ATTEMPTS=6
```

Use the `--debug` option to see retry logs. In `legacy` mode the messages come from `botocore.retryhandler`; in `standard` and `adaptive` modes they come from `botocore.retries.standard`.

> — Source: [AWS CLI retries in the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html)

### 5.8 Understanding Your Application (Observability)

Make your system observable. You can enable metrics and logs from the SDK or the service.

| Item | Content |
|---|---|
| Built-in SDK metrics | 4xx/5xx errors, API request count, retries, throttling, duration, latency |
| Logging framework support | Log4j, NLog, Log4net |
| Amazon CloudWatch | Dashboards, logs, metrics, alarms, events. Collects, aggregates, and summarizes compute utilization information such as CPU, memory, disk, and network data, along with diagnostic information |
| AWS X-Ray | Traces, analytics, service maps. Provides an end-to-end, cross-service view of requests made to your application. Aggregates data collected from individual services into a single unit called a **trace** (the path of a request through each service or tier), generates a service map, and lets you drill into the data for analysis |

🔄 How SDK metrics are enabled in the AWS SDK for Java has changed. The link the courseware cites now serves **2.x content**, and metrics are enabled by choosing a **`MetricPublisher` implementation** rather than by setting a system property.

- `CloudWatchMetricPublisher` sends metrics directly to CloudWatch. It is **not suitable for short-lived Lambda functions** because of potential data loss.
- Metrics can be enabled **per request** or **per service client**, and require the `cloudwatch-metric-publisher` artifact dependency.
- There is also a logging publisher that outputs metrics to the console.

The '.NET advanced configuration' link the courseware cites is still a [v3 path](https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/net-dg-advanced-config.html). The .NET SDK 3.x is at end-of-support, so check the v4 guide as well.

> — Source: [Monitor application performance with SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html)

---

## 6. Integrated Development Environments

### 6.1 Why Use an IDE

An integrated development environment (IDE) lets you write, run, and debug code for your application. Because you can access the developer tools you need inside a single application, an IDE improves productivity. Syntax highlighting and syntax auto-completion or hints improve code readability, and compilers or interpreters plus debugging features help you understand your code better.

An IDE can be installed locally or be cloud based. Benefits of a cloud-based IDE:

- You can access the IDE through a web browser from any computer or OS.
- The IDE is backed by more compute power than your local machine.
- You can quickly get a pre-configured development environment for a new project or for a new developer to learn in.
- Code collaboration is possible by working on the same code with multiple developers simultaneously, breaking down silos.
- It uses platform-specific SDKs.

### 6.2 AWS IDE Toolkits 🔄

An AWS Toolkit is available for multiple IDEs and makes it easier to create, debug, and deploy applications that use AWS.

🔄 The graphic on courseware slide 33 shows labels for Eclipse, Rider, WebStorm, Visual Studio, PyCharm, IntelliJ, Visual Studio Code, and Azure DevOps. The official "Additional IDE Toolkits from AWS" note lists **three**.

| Toolkit | Target |
|---|---|
| AWS Toolkit for JetBrains | JetBrains IDEs (installed from the JetBrains Marketplace) |
| AWS Toolkit for Visual Studio Code | Visual Studio Code. An open-source extension for developing, debugging locally, and deploying serverless applications that use AWS |
| Toolkit for Visual Studio | Visual Studio |

🆕 The JetBrains toolkit includes the following specific toolkits. The courseware graphic shows only three of them (Rider, WebStorm, PyCharm) plus IntelliJ.

| IDE | Language or purpose |
|---|---|
| CLion | C and C++ |
| GoLand | Go |
| IntelliJ | Java |
| WebStorm | Node.js |
| Rider | .NET |
| PhpStorm | PHP |
| PyCharm | Python |
| RubyMine | Ruby |
| DataGrip | Database management |

With a toolkit you can work with AWS Lambda functions, AWS CloudFormation stacks, and Amazon ECS clusters, and you get AWS credentials management and AWS Region management.

> The current status of the Eclipse and Azure DevOps toolkits could not be verified (see [Section 8.5](#85-items-that-could-not-be-verified)).
>
> — Source: [Additional IDE Toolkits from AWS](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/downloads.html), [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html), [AWS Toolkit for Visual Studio Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)

### 6.3 AWS Cloud9 🔄

The instructor notes on courseware slide 23 state that "in the current lab version (as of September 24, 2026), the Python lab is still deployed on Cloud9." There is something you need to know before presenting that as-is.

**AWS Cloud9 is no longer available to new customers.** Existing AWS Cloud9 customers can continue to use the service as normal.

| Audience | Status |
|---|---|
| Existing customers | Can continue to use it. A lab environment already deployed in a training account may work |
| New customers | **Cannot use it.** Learners cannot create a new Cloud9 environment in their own account |
| AWS-recommended alternatives | AWS IDE toolkits ([Section 6.2](#62-aws-ide-toolkits)) or **AWS CloudShell** |

In class, the accurate framing is: "the lab environment uses Cloud9, but you cannot create one in your own account."

> — Source: [What is AWS Cloud9?](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)

### 6.4 Amazon Q Developer and IDE Plugin End of Support 🆕

The instructor notes on courseware slide 34 only mention that "you can see traces of the previous AI assistant in the naming of APIs and extensions." Clarifying what that previous AI assistant is and where it stands now lets you answer learner questions.

**On April 30, 2027, AWS will discontinue support for Amazon Q Developer IDE plugins.** For capabilities similar to Amazon Q Developer IDE plugins (the latest models and features, including agentic coding, chat, and MCP support), AWS points customers to Kiro. If you have been using Amazon Q Developer in your IDE, everything you rely on today (inline suggestions, chat, and code generation) is available in Kiro.

IDEs and features Amazon Q Developer supports until end of support:

| Feature | VS Code | JetBrains | Eclipse | Visual Studio |
|---|---|---|---|---|
| Chat | Yes | Yes | Yes | Yes |
| Agentic coding | Yes | Yes | Yes | Yes |
| MCP servers | Yes | Yes | Yes | Yes |
| Context in chat | Yes | Yes | Yes | Yes |
| Workspace context in chat | Yes | Yes | Yes | Yes |
| Inline suggestions | Yes | Yes | Yes | Yes |
| Inline chat | Yes | Yes | Yes | **No** |
| Transformations | Yes | Yes | **No** | Yes |

> — Source: [Amazon Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html), [Using Amazon Q Developer in the IDE](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html)

### 6.5 Kiro: An AI-Powered IDE with Spec-Driven Development 🔄

This section covers Kiro, an agentic IDE designed to accelerate software development. Kiro brings intelligent assistance directly into your development workflow, enabling faster, smarter, and more efficient coding.

#### From coding assistant to development orchestrator

The definition on courseware slide 35:

- An AI-powered integrated development environment built on Code OSS
- A spec-driven development methodology
- Complete project orchestration, not just code generation

Unlike traditional coding assistants that react to individual prompts, Kiro proactively orchestrates entire software development projects. It manages the full project lifecycle from requirements gathering through deployment.

🔄 The official AWS definition is broader in scope. Kiro is **an agentic development system from AWS** which helps developers and teams bridge the gap from AI coding to engineering by managing intent, completing long-running tasks across large codebases, and validating code correctness with advanced agents that continuously learn from every session.

🆕 The courseware presents only the IDE form, but Kiro is available in **three forms**.

| Form | Description |
|---|---|
| IDE | The form the courseware covers |
| 🆕 CLI | Command line interface |
| 🆕 Autonomous web agent | Runs autonomously as a web agent |

> — Source: [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html)

#### Spec-driven development

Spec-driven development bridges conceptual product requirements and technical implementation details. The three-file foundation forms the layered understanding that lets an AI agent work intelligently rather than reactively.

| File | Question it answers | Role |
|---|---|---|
| `requirements.md` | The target and the **why** | Captures business goals and success criteria using structured syntax |
| `design.md` | The **how** | The technical architecture blueprint an AI agent follows systematically to make implementation decisions |
| `tasks.md` | **When and in what order** | A clear implementation path that keeps the agent from taking inefficient or contradictory approaches |

This structure reflects a core principle of agentic AI: autonomous systems need a clear framework and comprehensive context to make intelligent decisions. The "living documentation" quality shows how modern AI can keep planning and implementation consistent.

🆕 The AWS Well-Architected Agentic AI Lens recommends spec-driven development tools like Kiro and explains why:

- A specification **decouples the agent's behavior from its author.** When the original developer moves on, the next maintainer picks up the system through the specification rather than through reverse engineering.
- When specifications are the **starting point** rather than an afterthought, documentation is produced as a byproduct of development.
- The upfront investment in writing the specification is **recovered during code review, testing, and ongoing evolution**, because every subsequent change happens against a clear baseline.

> — Source: [AGENTSUS03-BP03 (AWS Well-Architected Agentic AI Lens)](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html)

#### Key features

| Feature | Description |
|---|---|
| Agent steering | Creates project-specific intelligence through configuration files that guide behavior and decision-making, customizing the AI agent for a specific domain. It reflects the idea that agentic AI must adapt to different contexts and requirements rather than operate with fixed behavior |
| Dual operating modes | **Autopilot** — the AI agent completes entire features on its own / **Supervised** — humans retain control over critical decisions. Shows the balance agentic AI must maintain between autonomy and human oversight |
| Model Context Protocol (MCP) | Extends capabilities through specialized modules |
| Multimodal context processing | Context spanning files, terminal output, and documentation gives a richer, more complete view of the codebase |

#### Model Context Protocol (MCP) 🔄

The courseware describes MCP as "an open-source standard that provides a universal plug-and-play way to securely connect AI models to external data sources, tools, and systems." The direction is right, but the following is missing:

- MCP is **an open protocol introduced by Anthropic.** It is not an AWS-created standard.
- It enables integration between LLM applications and external data sources and tools to access real-time information.

🆕 MCP's three core primitives:

| Primitive | Role |
|---|---|
| Resources | Expose data and content such as files, databases, and APIs to AI applications |
| Tools | Enable LLMs to run actions like creating tickets, running queries, or calling APIs |
| Prompts | Provide reusable prompt templates with dynamic context |

🆕 MCP benefits: standardization (no custom integration per connection), discoverability (capabilities are discovered automatically without manual configuration), security (centralized authentication and authorization at the protocol level), maintainability (update integration logic once and all connected AI applications benefit), and extensibility (add new data sources and tools without modifying AI applications).

> — Source: [What is the Model Context Protocol (MCP)?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html)

---

## 7. Setting Up Your Development Environment

### 7.1 Getting Started with the AWS SDKs

The steps required to set up a development environment so you can use an AWS SDK.

| Step | Content |
|---|---|
| 1 | Install the development environment (Java, Python (Boto3), .NET, and so on) |
| 2 | Install the AWS SDK for your language |
| 3 | Set up AWS credentials |

To access AWS with an AWS SDK, you need an AWS account and AWS credentials.

### 7.2 Configuring Credentials 🔄

The courseware states: "To improve the security of your AWS account, we recommend that you use an IAM user to provide access credentials. Use an IAM user instead of your AWS account root user credentials."

**The part about an IAM user being better than the root user is correct.** But the current recommendation is **short-term (temporary) credentials**, not an IAM user's **long-term** access keys. AWS documentation classifies IAM user long-term credentials as "not recommended."

| Approach | Recommendation |
|---|---|
| Use console credentials as temporary credentials | **Recommended** |
| Temporary credentials for IAM Identity Center workforce identities | Recommended |
| IAM temporary credentials (AWS STS) | Recommended |
| IAM user long-term credentials | **Not recommended** |

🆕 Alternatives to long-term access keys:

| Alternative | Description |
|---|---|
| AWS Secrets Manager or another secrets management solution | Do not embed long-term access keys and secret access keys in application code or a code repository. Retrieve secrets when needed instead |
| IAM roles to generate temporary security credentials | Always use mechanisms that issue temporary security credentials when possible. Temporary credentials are more secure because they are not stored with the user but generated dynamically on request, and their limited lifetime means you do not have to manage or update them |
| AWS IAM Roles Anywhere | For machines that run outside of AWS |
| `aws login` (AWS CLI v2) | Generate short-term credentials from your console credentials to run AWS CLI commands |
| AWS CloudShell | A browser-based, **pre-authenticated** shell that you launch directly from the AWS Management Console |

The environment variables listed in the courseware still apply: credentials use `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, and the Region uses `AWS_REGION` (🆕 added in AWS CLI v2 as an SDK-compatible variable, and it overrides the AWS CLI-only `AWS_DEFAULT_REGION`).

> — Source: [Programmatic access with AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html), [Authentication and access credentials for the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)

---

## 8. Changes from the Courseware

The following items in the courseware (instructor deck) differ from current behavior. Learners typically have the official courseware alongside this material, so what changed and why is recorded here.

### 8.1 Where the Courseware Is Factually Incorrect

| Item | Courseware states | Verified content | Source |
|---|---|---|---|
| Where the status code appears | Slide 7 instructor notes: "when the service responds to the request, the status and status message are included in the **request header**" | The status code and status message appear in the **start line of the response**. The notes for slide 6 in the same deck state it correctly, so the deck contradicts itself, and the slide 7 example begins with `HTTP/1.1 200 OK` | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| CLI command structure labels | `s3://mybucket` is also labeled a "subcommand" in `aws s3 ls s3://mybucket --recursive`. The notes say "the subcommand is `ls`, whose target is `s3://mybuket`" | The structure is `aws <command> <subcommand> [options and parameters]`. The subcommand is just `ls`, and `s3://mybucket` is a parameter | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| SDK language list | The instructor notes (Android, iOS, Go, Java, JavaScript, .NET, Node.js, PHP, Python, Ruby) do not match the slide graphic (Python, .NET, Java, C++, Ruby, JavaScript, Go, Node.js, PHP, Rust, Kotlin, Swift) | Node.js is not a separate SDK; it is supported by the JavaScript SDK. Android and iOS are outside the scope of the SDK lifecycle document (Mobile SDKs excluded) | [SDK lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Which library the CLI uses | Slide 11: "the AWS CLI uses the Python SDK" / slide 20: "the AWS CLI uses a Python library called Botocore" (inconsistent) | The latter is accurate. The AWS CLI uses Boto3's retry methodology and logging | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| Java exception class names versus the cited link | Slide 30 lists `com.amazonaws.AmazonServiceException` and `com.amazonaws.AmazonClientException` (1.x package) while linking to the 2.x developer guide | The 2.x hierarchy is `AwsServiceException` (a subclass of `SdkServiceException`) and `SdkClientException` | [Java 2.x error handling](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/handling-exceptions.html) |
| .NET example code | Slide 27 declares `var response` twice in the same block | It does not compile. Corrected by renaming the second to `describeResponse` and adding the `status` declaration | [DynamoDB code examples](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples.html) |
| Java waiter example code | Slide 29: `waiter.run(new WaiterParameters<>(new DescribeTableRequest(tableName));` | A closing parenthesis is missing, and the whole example is 1.x syntax at end-of-support | [Waiters v1 to v2](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-waiters.html) |
| Broken documentation links | `AWSSdkDocsNET/latest/V3/DeveloperGuide/net-dg-install-assemblies.html`, `docs.aws.amazon.com/pt_br/cli/latest/index.html` | Both URLs return **HTTP 404**. The latter has the locale pinned to `pt_br` | [CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/), [.NET v4 install](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-install-assemblies.html) |
| Citing a non-AWS domain | Cites `boto3.readthedocs.org` for the Boto3 quickstart | The Boto3 documentation has moved to `docs.aws.amazon.com/boto3/latest/` | [Boto3 Quickstart](https://docs.aws.amazon.com/boto3/latest/guide/quickstart.html) |

### 8.2 Where Behavior or Defaults Changed

| Item | Courseware states | Current | Source |
|---|---|---|---|
| Replay attack protection criterion | "Expires events that take too long to arrive by using a time stamp" | In most cases a request must reach AWS **within five minutes** of the time stamp in the request. With temporary credentials, the signature calculations also require a security token | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| Automatic retry behavior | "Each AWS SDK implements automatic retry logic" plus "with exponential backoff" | Three retry modes: `standard`, `legacy`, `adaptive`. AWS CLI v2 defaults to `standard` (3 total attempts, 20-second maximum backoff); v1 defaults to `legacy` (5 total attempts, 10 for DynamoDB) | [AWS CLI retries](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-retries.html) |
| How to provide credentials | "We recommend that you use an IAM user to provide access credentials" | The recommended order is console credentials as short-term credentials → IAM Identity Center → IAM short-term credentials → EC2 instance metadata → assume role. **IAM user long-term credentials are "not recommended"** | [CLI authentication](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html), [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| `aws configure` | Introduced as a single command | There are `set`, `get`, `import`, `list`, `list-profiles`, `mfa-login`, `sso`, `sso-session`, and `export-credentials` subcommands, and the configuration files gained the `sso-session` and `services` section types | [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| Enabling Java SDK metrics | Points to a link on slide 31 | The link is valid but now serves 2.x content, and enabling metrics changed to choosing a `MetricPublisher` implementation such as `CloudWatchMetricPublisher` | [SDK metrics](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/metrics.html) |
| Documentation paths moved | `boto3.amazonaws.com/v1/documentation/api/latest/...`, `ErrorHandling.html#APIRetries`, `LowLevelDotNetWorkingWithTables.html` | These redirect to `docs.aws.amazon.com/boto3/latest/`, `Programming.Errors.html`, and `service_code_examples.html` respectively | [Boto3 DynamoDB](https://docs.aws.amazon.com/boto3/latest/guide/dynamodb.html), [DynamoDB error handling](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) |
| The forms Kiro is available in | "An AI-powered integrated development environment built on Code OSS" | An agentic development system from AWS available as an **IDE, a CLI, and an autonomous web agent** | [Kiro](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html) |
| Where MCP came from | "An open-source standard" | **An open protocol introduced by Anthropic.** It is built on three primitives (Resources, Tools, Prompts) | [What is MCP?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |

### 8.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS SDK for Java 1.x | **Reached end-of-support on December 31, 2025** | AWS SDK for Java 2.x (`software.amazon.awssdk`) | [Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/welcome.html) |
| AWS SDK for JavaScript v2 | **End-of-support** (both 1.x and 2.x) | AWS SDK for JavaScript v3 | [Migrate to v3](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/migrate.html) |
| AWS SDK for Go V1 | **End-of-support** | AWS SDK for Go V2 | [Go V1 end-of-support](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/welcome.html) |
| AWS SDK for .NET 3.x | **End-of-support** (1.x, 2.x, and 3.x). 4.x reached GA on April 28, 2025 | AWS SDK for .NET 4.x | [SDK lifecycle](https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html) |
| Lambda runtime `nodejs12.x` | **Deprecated March 31, 2023.** Function create blocked the same day; function update blocked April 30, 2023 | `nodejs22.x` / `nodejs24.x` / `nodejs26.x` | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) |
| AWS CLI v1 | Maintenance Announcement phase. **Maintenance mode July 15, 2026; end-of-support July 15, 2027** | AWS CLI v2 | [CLI v1 maintenance mode announcement](https://aws.amazon.com/blogs/developer/cli-v1-maintenance-mode-announcement/) |
| AWS Cloud9 | **No longer available to new customers.** Existing customers can continue to use it | AWS IDE toolkits or AWS CloudShell | [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html) |
| Boto3 resources interface (`boto3.resource`) | No new features planned. Existing interfaces continue to operate. Not thread safe | Client interface (`boto3.client`) | [Boto3 Resources](https://docs.aws.amazon.com/boto3/latest/guide/resources.html) |
| Amazon Q Developer IDE plugins | **Support will be discontinued on April 30, 2027** | Kiro | [Q Developer IDE plugins end of support](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-developer-ide-end-of-support.html) |
| IAM user long-term access keys | Not recommended | Console-credential-based short-term credentials (`aws login`), IAM Identity Center, IAM roles and instance profiles, IAM Roles Anywhere, AWS CloudShell | [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |

### 8.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| The five-phase SDK major version lifecycle | Developer Preview → GA (at least 24 months) → Maintenance Announcement (announced at least 6 months ahead) → Maintenance (default 12 months) → End-of-Support. Dependencies are supported for at least 6 months after vendor support ends | [SDK maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html) |
| SigV4a | Asymmetric ECDSA-based signatures. Required for multi-Region API requests such as S3 Multi-Region Access Points, and used automatically by the SDK for global endpoint calls | [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) |
| AWS CLI v2-only features | Embedded Python, wizards, auto-prompt, IAM Identity Center authentication, client-side pager, `yaml` and `yaml-stream` output, `ddb put` and `ddb select`, `aws logs tail`, `--copy-props`, SDK-compatible `AWS_REGION` | [CLI v2 new features](https://docs.aws.amazon.com/cli/latest/userguide/cliv2-migration-changes.html) |
| Access key prefixes | `AKIA` is a long-term access key; `ASIA` is a temporary credentials access key created with STS | [Programmatic access](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds-programmatic-access.html) |
| The `aws wait` command structure | `aws <command> wait <subcommand> [options and parameters]`. Not every service supports it | [Command structure](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-commandstructure.html) |
| Credential cache locations | Assumed-role temporary credentials in `~/.aws/cli/cache`, IAM Identity Center tokens in `~/.aws/sso/cache`. Refreshed automatically on expiry | [Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) |
| The individual IDEs in the JetBrains toolkit | CLion, GoLand, IntelliJ, WebStorm, Rider, PhpStorm, PyCharm, RubyMine, DataGrip | [AWS Toolkit for JetBrains](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html) |
| The Amazon Q Developer supported IDE matrix | VS Code, JetBrains, Eclipse, Visual Studio. Inline chat is not supported in Visual Studio; transformations are not supported in Eclipse | [Amazon Q Developer in the IDE](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html) |
| The rationale for spec-driven development | A specification decouples agent behavior from its author, documentation becomes a byproduct of development, and the upfront investment is recovered during code review, testing, and evolution | [Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html) |
| MCP primitives and benefits | Resources, Tools, and Prompts. Standardization, discoverability, security, maintainability, extensibility | [What is MCP?](https://docs.aws.amazon.com/prescriptive-guidance/latest/mcp-deployment-patterns-on-aws/what-is-the-model-context-protocol-mcp.html) |
| botocore's own exceptions | Beyond `ClientError`, client-side exceptions such as `NoCredentialsError`, `ParamValidationError`, `ProfileNotFound`, and `WaiterError` are statically defined | [Boto3 error handling](https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html) |
| A DynamoDB `CreateTable` constraint | Only one table with secondary indexes can be in the `CREATING` state at a time, so create them sequentially | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| The S3-to-Lambda loop caution | If the function uploads an object to the bucket that triggers it, it can run in a loop. Use two buckets or restrict the trigger to a prefix | [Process S3 event notifications](https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html) |

### 8.5 Items That Could Not Be Verified

Recorded honestly. Confirm these before stating them definitively in class.

| Item | Status |
|---|---|
| The `api_versions` shared configuration setting | The `api_versions` entry on courseware slide 17 (in the form `ec2 = 2015-03-01`) **could not be found** in the current Boto3 configuration guide or the AWS CLI configuration and credential file settings documentation. The API version locking documentation that turned up in search was for AWS SDK for JavaScript v2, which is at end-of-support. It is presented in the body only as courseware content |
| The status of the Eclipse and Azure DevOps toolkits | The status of the Eclipse and Azure DevOps toolkits in the graphic on courseware slide 33 could not be verified. The official "Additional IDE Toolkits from AWS" note lists only JetBrains, VS Code, and Visual Studio, but no explicit end-of-support announcement for the Eclipse or Azure DevOps toolkits was found. It was confirmed that Eclipse is in the Amazon Q Developer supported IDE list |
| The CreateBucket HTTP request example | Whether the example on courseware slide 6 (a `Date` header and `Authorization: authorization string`) matches the current request example in the Amazon S3 API reference could not be verified. The CreateBucket API reference was read, but no example block in the same form was found to compare against. The courseware example is kept as-is |
| The DynamoDB query response example | The response example on courseware slide 7 (`x-amzn-RequestId`, `x-amz-crc32`, `Content-Type: application/x-amz-json-1.0`) could not be checked against official documentation. The courseware example is kept as-is |
