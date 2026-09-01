# Module 5: Getting Started with Storage

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Storage Types in the AWS Cloud](#2-storage-types-in-the-aws-cloud)
3. [Amazon S3 Core Concepts](#3-amazon-s3-core-concepts)
4. [Data Protection and Access Control](#4-data-protection-and-access-control)
5. [S3 Service Endpoints](#5-s3-service-endpoints)
6. [Using Amazon S3 with the AWS CLI](#6-using-amazon-s3-with-the-aws-cli)
7. [Using Amazon S3 with the AWS SDKs](#7-using-amazon-s3-with-the-aws-sdks)
8. [Changes from the Courseware](#8-changes-from-the-courseware)
9. [Knowledge Check and Summary](#9-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 8](#8-changes-from-the-courseware) for what changed and how.
> - Example access key IDs have **characters 5 through 8 replaced with `#`**, as in `AKIA####ODNN7EXAMPLE`. This keeps credential scanners from mistaking them for real keys; the original example values in the AWS documentation have alphanumeric characters in those positions.
> - Verified on: August 25, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Describe the core concepts of Amazon Simple Storage Service (Amazon S3)
- List the options for protecting data with Amazon S3
- Define the SDK dependencies in your code
- Describe how to connect to the Amazon S3 service
- Describe request and response objects

### Where This Module Sits

| Item | Content |
|---|---|
| Module 4 | Getting started with permissions |
| **Module 5** | **Getting started with storage** — Compare the feature sets and use cases of available AWS storage solutions, and learn the core concepts of Amazon S3 |
| Module 6 | Processing your storage operations — Use Amazon S3 programmatically and deploy a static website |
| Lab 2 | Developing a solution with Amazon S3 |

This module covers Amazon S3 and its core building blocks. You review Amazon S3 use cases and see how the application you are developing is supported by them. You then learn how to configure a development environment for working with Amazon S3 using the AWS SDKs and the AWS CLI.

---

## 2. Storage Types in the AWS Cloud

AWS storage solutions consist of a portfolio of services for storing, accessing, managing, and analyzing data.

| Type | How data is organized | Access | Representative service |
|---|---|---|---|
| **Block storage** | Raw storage. An array of unrelated blocks. The host file system places data on the disk | Block device | Amazon EBS |
| **File storage** | A file system manages the data blocks. The native file system places data on the disk | File system mount | Amazon EFS, Amazon FSx |
| **Object storage** | Virtual containers that encapsulate data, data attributes, metadata, and an object ID | API | Amazon S3 |

- Block storage analogues: hard disks, storage area networks (SAN), storage arrays
- File storage analogues: network attached storage (NAS) appliances, Windows file servers
- Object storage analogues: Ceph, OpenStack Swift

Amazon EBS volume types: general purpose SSD, provisioned IOPS SSD, throughput optimized HDD, cold HDD

### 2.1 Amazon S3 Storage Classes 🔄

Every object has a storage class associated with it. If you do not specify one, **S3 Standard** is applied. All classes are designed for the same durability (99.999999999%), but **availability and the number of Availability Zones differ by class.**

| Storage class | Designed for | Availability (designed for) | AZs | Min storage duration | Min billable size |
|---|---|---|---|---|---|
| S3 Standard (`STANDARD`) | Frequently accessed data (more than once a month), millisecond access | 99.99% | ≥3 | None | None |
| S3 Intelligent-Tiering (`INTELLIGENT_TIERING`) | Unknown, changing, or unpredictable access patterns | 99.9% | ≥3 | None | None |
| S3 Standard-IA (`STANDARD_IA`) | Long-lived, infrequently accessed data (once a month), millisecond access | 99.9% | ≥3 | 30 days | 128 KB |
| S3 One Zone-IA (`ONEZONE_IA`) | Recreatable, infrequently accessed data | 99.5% | 1 | 30 days | 128 KB |
| 🆕 S3 Express One Zone (`EXPRESS_ONEZONE`) | Latency-sensitive applications, single-digit millisecond access within one AZ | 99.95% | 1 | None | None |
| 🆕 S3 Glacier Instant Retrieval (`GLACIER_IR`) | Archive data accessed once a quarter, millisecond access | 99.9% | ≥3 | 90 days | 128 KB |
| S3 Glacier Flexible Retrieval (`GLACIER`) | Archive data accessed once a year, retrieval in minutes to hours | 99.99% (after restore) | ≥3 | 90 days | — |
| S3 Glacier Deep Archive (`DEEP_ARCHIVE`) | Archive data accessed less than once a year, retrieval in hours | 99.99% (after restore) | ≥3 | 180 days | — |

- S3 Express One Zone is a storage class used exclusively by **directory buckets**.
- Reduced Redundancy Storage (`REDUCED_REDUNDANCY`) also exists, but AWS **recommends not using it**. S3 Standard is more cost-effective.
- S3 Standard-IA and S3 One Zone-IA charge for 128 KB even for smaller objects, and deleting or transitioning before 30 days incurs a pro-rated charge for the remainder.
- S3 Intelligent-Tiering does not monitor objects smaller than 128 KB; they always stay in the Frequent Access tier.

> — Source: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

---

## 3. Amazon S3 Core Concepts

### 3.1 Amazon S3 Overview

Amazon S3 provides developers and IT teams with secure, durable, and scalable object storage.

| Characteristic | Detail |
|---|---|
| Durability | Designed for 99.999999999% |
| Availability | Varies by storage class (see [Section 2.1](#21-amazon-s3-storage-classes)) 🔄 |
| Scalability | Unlimited storage, batch operations |
| Performance | Parallel requests, transfer acceleration, multipart upload, **strong read-after-write consistency** 🔄 |
| Manageability | REST API, AWS SDKs, prefixes and tags, event notifications, storage classes, lifecycle management |
| Security | Block Public Access, **default encryption (SSE-S3 applied automatically)** 🔄, fine-grained control, compliance, protection at rest and in transit |

Use cases: content storage and distribution, static website hosting, backup and archiving, big data analytics, disaster recovery

### 3.2 Data Consistency Model 🔄

The courseware lists only "read-after-write consistency" under performance, but the guarantee Amazon S3 provides today is stronger.

| Target | Consistency |
|---|---|
| Object `PUT` (new objects and overwrites), `DELETE` | **Strong read-after-write consistency** (all AWS Regions) |
| Reads of S3 Select, ACLs, object tags, object metadata (`HEAD`) | Strongly consistent |
| Updates to a single key | Atomic. A concurrent `PUT` and `GET` returns either the old or the new data, never partial or corrupt data |
| Bucket configuration | **Eventually consistent** |

What strong consistency means in practice:

- A process writes a new object and immediately lists keys in the bucket. The new object appears in the list.
- A process replaces an existing object and immediately reads it. Amazon S3 returns the new data.
- A process deletes an object and immediately reads it. No data is returned, and the object does not appear in a listing.

Things to watch out for:

- S3 **does not support object locking for concurrent writers.** If two `PUT` requests target the same key simultaneously, the request with the latest timestamp wins (last-writer-wins). If that is a problem, you must build a locking mechanism into your application, or use [conditional requests](#38-conditional-requests).
- Updates are key-based. There is no way to make atomic updates across keys.
- If you delete a bucket and immediately list all buckets, the deleted bucket might still appear.
- When you enable versioning on a bucket for the first time, propagation takes some time. AWS recommends waiting **15 minutes** before issuing write operations on objects in the bucket.

> — Source: [Amazon S3 data consistency model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### 3.3 Amazon S3 Components

#### Object elements

| Element | Description |
|---|---|
| Key | A unique identifier, similar to a combination of path and file name. One way to reference an object |
| Data | The stored file. Any format: text, video, images, binary |
| Metadata | System metadata such as creation date, version ID, and size, or user-defined metadata |

#### S3 buckets

- A Regional resource, though bucket names live in a global namespace.
- A **flat structure** for storing data (no directory hierarchy)
- Objects are stored with unique key values
- After you create a bucket, you **cannot change its name or Region.**

When hosting a website in a bucket, it is a good idea to name the bucket the same as your domain name. You can then use DNS resolution through your domain provider (for example, Amazon Route 53) to map an alias to the actual bucket name.

#### Scope of bucket name uniqueness 🔄

The courseware says names must be unique "across all of Amazon S3", but more precisely the scope is a **partition**. A bucket name must be unique across all AWS accounts in all Regions within a partition. AWS currently has four partitions.

| Partition | Scope |
|---|---|
| `aws` | Standard Regions |
| `aws-cn` | China Regions |
| `aws-us-gov` | AWS GovCloud (US) |
| 🆕 `aws-eusc` | European Sovereign Cloud |

When you delete a bucket from the global namespace, that name might become available again. At that point **another AWS account in the same partition can create a bucket with the same name and could therefore receive requests intended for the deleted bucket.** To prevent this, do not delete the bucket. Empty it of objects and keep it instead.

#### 🆕 Account regional namespace

The account regional namespace is a reserved subdivision of the global bucket namespace that **only your account** can create general purpose buckets in. Use it when you want bucket name ownership pinned to your account. AWS recommends creating buckets in this namespace.

- Names end with the `-an` suffix. For example: `amzn-s3-demo-bucket-012345678910-us-west-2-an`
- In the REST API you specify it with the `x-amz-bucket-namespace: account-regional` header.

> — Source: [Namespaces for general purpose buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html), [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

#### Bucket naming rules 🔄

The courseware says "lowercase letters, numbers, and hyphens (-) only", but **periods (.) are also allowed.** The full current rules for general purpose buckets are:

- Between 3 and 63 characters long
- Only lowercase letters, numbers, periods (`.`), and hyphens (`-`)
- Must begin and end with a letter or number
- Must not contain two adjacent periods (`..`)
- Must not be formatted as an IP address (for example, `192.168.5.4`)
- Prohibited prefixes: `xn--`, `sthree-`, `amzn-s3-demo-`
- Reserved suffixes: `-s3alias` (access point aliases), `--ol-s3` (Object Lambda Access Points), `.mrap` (Multi-Region Access Points), `--x-s3` (directory buckets), `--table-s3` (S3 Tables buckets), `-an` (account regional namespace)
- Buckets used with Transfer Acceleration cannot have periods in their names
- Do not include sensitive information in the bucket name (it is visible in URLs that point to objects)

Practical recommendation: even though periods are allowed, **avoid them.** An SSL wildcard certificate does not match bucket names containing periods, which can cause authentication errors over HTTPS, and such buckets cannot be used with Transfer Acceleration.

> — Source: [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)

#### Virtual-hosted-style URL structure

```text
https://notes-bucket.s3.us-west-2.amazonaws.com/awsservice/notes.txt
        └─────┬─────┘                          └────┬────┘ └───┬───┘
        S3 bucket name                           prefix      name
                                                 └──────┬──────┘
                                                       key
```

### 3.4 Organizing and Finding Objects with Prefixes and Delimiters

An S3 bucket is object storage, so it has no directory structure. To create a logical structure, use prefixes and delimiters.

- A **prefix** is similar to a directory name. You can group objects by prefix.
- A **delimiter** is a string such as `/` or `_` that gives you additional control when navigating the object hierarchy.

Organizing keys with prefixes and delimiters lets you retrieve a subset of keys matching specific criteria. This is one of the mechanisms an application uses to categorize and index data, and prefixes and delimiters are also used to fine-tune security settings.

#### Example: bucket `notes-bucket`

All keys stored in the bucket:

```text
dev/awsservice/dynamodb/notes.txt
dev/awsservice/polly/sam.mp3
dev/awsservice/polly/john.mp3
dev/awsservice/summary.txt
readMe.txt
```

| Query | Result |
|---|---|
| Prefix `dev/` | `dev/awsservice/summary.txt`<br>`dev/awsservice/dynamodb/notes.txt`<br>`dev/awsservice/polly/sam.mp3`<br>`dev/awsservice/polly/john.mp3` |
| Prefix `dev/awsservice/` + delimiter `/` | `dev/awsservice/summary.txt`<br>`dev/awsservice/dynamodb/` (common prefix)<br>`dev/awsservice/polly/` (common prefix) |

In the second case, `dev/awsservice/summary.txt` is returned as a key because it contains the prefix `dev/awsservice/` and does not contain the delimiter `/` after that prefix. The rest are grouped and returned as a list of common prefixes.

> — Source: [Organizing objects using prefixes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-prefixes.html)

### 3.5 Amazon S3 Event Notifications 🔄

You can receive notifications when specific events occur in an S3 bucket. The publishing destinations are:

| Destination | Behavior |
|---|---|
| Amazon SNS topic | Publishes a message |
| Amazon SQS queue | Publishes a message |
| AWS Lambda function | Invokes the function |
| Amazon EventBridge | Sends the event to an event bus |

The courseware presents four event types (object created, removed, restored, replicated), but many more can be published to SQS, SNS, and Lambda.

| Event type | Description |
|---|---|
| `s3:TestEvent` | Published when a notification is enabled, to confirm the destination exists and the bucket owner has permission to publish to it |
| `s3:ObjectCreated:*`<br>`:Put` `:Post` `:Copy` `:CompleteMultipartUpload` | Object creation. You can be notified only for a specific API, or use `*` for all |
| `s3:ObjectRemoved:*`<br>`:Delete` `:DeleteMarkerCreated` | Object removal. Deletion or permanent deletion of a versioned object (`:Delete`), or delete marker creation (`:DeleteMarkerCreated`) |
| `s3:ObjectRestore:*`<br>`:Post` `:Completed` `:Delete` | Restore initiation and completion from Glacier classes and Intelligent-Tiering archive tiers, plus expiration of the restored copy |
| `s3:ReducedRedundancyLostObject` | Amazon S3 detected the loss of an RRS class object |
| `s3:Replication:*` (4 types) | Replication failure, exceeding the 15-minute S3 RTC threshold, replication after the threshold, and replication metrics no longer tracked |
| 🆕 `s3:LifecycleExpiration:*`<br>`:Delete` `:DeleteMarkerCreated` | Object deletion by an S3 Lifecycle configuration |
| 🆕 `s3:LifecycleTransition` | Storage class transition by an S3 Lifecycle configuration |
| 🆕 `s3:IntelligentTiering` | An Intelligent-Tiering object moved to the Archive Access or Deep Archive Access tier |
| 🆕 `s3:ObjectTagging:*`<br>`:Put` `:Delete` | Object tag added, updated, or removed |
| 🆕 `s3:ObjectAnnotation:*`<br>`:Put` `:Delete` | Object annotation created, updated, or deleted |
| 🆕 `s3:ObjectAcl:Put` | An object ACL was PUT or an existing ACL changed (no event if the request results in no change) |

Note: `ObjectRemoved` events **do not alert you for automatic deletes from lifecycle configurations or from failed operations.** If you need to detect lifecycle deletions, use `s3:LifecycleExpiration:*`.

> — Source: [Supported event types for SQS, SNS, and Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html)

### 3.6 Object Tags

Tags are key-value pairs attached as metadata to AWS resources. You can create, update, delete, copy, or replace tags at any point in an object's lifetime.

| Use case | Description |
|---|---|
| Object grouping | Tag resources with business, compliance, or project identifiers |
| Cost allocation | Use cost-center-specific tags for billing, then generate AWS tag-based reports to see actual cost per cost center |
| Automation | Mark resources for specific automated procedures such as backup or replication |
| Access control | Restrict access using tags as conditions |
| Operational support and monitoring | Identify critical systems |

🆕 You can also apply tags to a bucket at creation time. General purpose buckets require the `s3:TagResource` permission, and tag-based conditions (`aws:ResourceTag`, `s3:BucketTag`) apply only after ABAC is enabled on the bucket.

> — Source: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html), [AWS tagging best practices](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-best-practices.html)

### 3.7 Default Encryption 🔄

The courseware lists "default encryption" as a security characteristic, but today it is **applied automatically.**

- Amazon S3 applies server-side encryption with Amazon S3 managed keys (SSE-S3) as the base level of encryption for every bucket.
- **Starting January 5, 2023**, all new object uploads to Amazon S3 are automatically encrypted at no additional cost and with no impact on performance.
- The algorithm is 256-bit AES (AES-256).
- It is applied automatically to all new buckets and to any existing bucket that does not already have default encryption configured.
- There is no change to existing buckets that already have SSE-S3 or SSE-KMS configured.
- **Note**: objects that were already in an existing unencrypted bucket are not automatically encrypted.

You can view encryption status in CloudTrail logs (`"SSEApplied":"Default_SSE_S3"`), S3 Inventory, S3 Storage Lens, the Amazon S3 console, and as a response header in the AWS CLI and SDKs.

> — Source: [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)

### 3.8 🆕 Conditional Requests

You can add preconditions to S3 operations so that the operation fails if the condition is not met. This addresses the last-writer-wins problem from [Section 3.2](#32-data-consistency-model) without writing application-level locking.

| Category | APIs | Purpose |
|---|---|---|
| Conditional reads | `GET`, `HEAD`, `COPY` | Return or copy an object based on its ETag or last modified date. Limit an operation to objects updated since a date, or to a specific ETag |
| Conditional writes | `PutObject`, `CompleteMultipartUpload`, `CopyObject` | Ensure no existing object has the same key name (preventing overwrites), or check that an object's ETag is unchanged before updating it |
| Conditional deletes | `DeleteObject`, `DeleteObjects` | Evaluate whether the object exists or is unchanged before deleting. Supported for both general purpose and directory buckets |

There is **no additional charge** for conditional reads, writes, or deletes. You are charged existing rates for the applicable requests, including failed requests.

> — Source: [Add preconditions to S3 operations with conditional requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html)

---

## 4. Data Protection and Access Control

### 4.1 Object Versioning

- An object's version ID is part of the system-defined metadata.
- Versioning is **disabled by default** on an S3 bucket.
- In a bucket with versioning disabled, an object's version ID is `null`.
- When versioning is enabled, each version of an object has a unique version ID.
- Example version ID: `3/L4kqtJlcpXroDTDmJ+rmSpXd3dIbrHY+MTRCxf3vjVBH40Nr8X8gdRQBpUMLUo`
- To prevent data from being changed, overwritten, or deleted, configure **Amazon S3 Object Lock**.

After enabling versioning for the first time, propagation takes time, so AWS recommends waiting 15 minutes before issuing object write operations (see [Section 3.2](#32-data-consistency-model)).

### 4.2 Deleting Object Versions

| Request | Behavior |
|---|---|
| `DELETE` | Inserts a **delete marker** in the bucket and sets it as the current version of the object. Previous versions remain |
| `DELETE Object versionId` | **Permanently deletes** the specified object version |

```http
DELETE /photo.gif?versionId=121212 HTTP/1.1
Host: bucket.s3.amazonaws.com
Date: Wed, 26 Oct 2021 17:50:00 GMT
Authorization: AWS AKIA####ODNN7EXAMPLE:xQE0diMbLRepdf3YB+FIEXAMPLE=
Content-Type: text/plain
Content-Length: 0
```

### 4.3 Access Control

By default, S3 bucket settings block public access to the bucket and its objects, meaning only the resource owner can access them. **Block Public Access settings override bucket policies and object permissions.**

Amazon S3 supports both identity-based and resource-based access control.

| Mechanism | Type | Attached to | Description |
|---|---|---|---|
| IAM policy | Identity-based | IAM users, groups, roles | Defines the access an identity has to buckets and objects |
| Bucket policy | Resource-based | S3 bucket (one per bucket) | Specifies access to the bucket and its contents. Supports cross-account access and condition-based allow/deny |
| ACL | Resource-based (legacy) | S3 bucket or object | Defines the access type granted to AWS accounts or groups. **Disabled by default on new buckets** 🔄 |

Recommendation: manage access control with **IAM policies and S3 bucket policies**.

### 4.4 S3 Object Ownership and ACLs Disabled by Default 🔄

The courseware labels ACLs only as "legacy", but today the default setting turns them off entirely.

S3 Object Ownership is a **bucket-level setting** that controls ownership of uploaded objects and enables or disables ACLs.

| Setting | ACLs | Applies to | Object ownership |
|---|---|---|---|
| **Bucket owner enforced — default** | Disabled | All new and existing objects | The bucket owner owns every object and has full control. Access is evaluated by policies only |
| Bucket owner preferred | Enabled | — | The bucket owner owns new objects that other accounts write with the `bucket-owner-full-control` canned ACL |
| Object writer | Enabled | — | The AWS account that uploads an object owns it and can grant others access through ACLs |

Behavior after ACLs are disabled:

- Requests to set or update ACLs **fail**. Requests to read ACLs are supported.
- Only `PUT` requests that do not specify an ACL, or that specify the `bucket-owner-full-control` canned ACL, are accepted.
- `PUT` requests containing other ACLs (for example, custom grants to specific accounts) fail with **HTTP 400 `AccessControlListNotSupported`**.
- For existing buckets you can re-enable ACLs at any time after disabling them, and the preexisting ACLs are restored.

AWS recommendation: **keep ACLs disabled except where you must control access for each object individually.** A majority of modern S3 use cases no longer require ACLs.

> — Source: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

### 4.5 Example: S3 Bucket Policy

A bucket policy that grants read-only permission to anonymous users.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::notes-bucket/*",
      "Principal": "*"
    }
  ]
}
```

> **Caution**: this policy exposes the bucket contents to the internet. Before applying it, confirm how it interacts with your Block Public Access settings. For static website hosting, using CloudFront with Origin Access Control (OAC) or AWS Amplify Hosting is safer than making the bucket public (see [Section 5.3](#53-website-endpoints)).

Key elements of a bucket policy:

| Element | Description |
|---|---|
| `Version` | The IAM policy language version the policy conforms to. Changing it can break the policy, so keep `2012-10-17` |
| `Resource` | The ARN of the resource to allow or deny permissions on |
| `Action` | The actions allowed or denied on each resource |
| `Effect` | `Allow` or `Deny` |
| `Condition` | (Optional) Conditions that must be true for the policy to apply |
| `Principal` | Who the policy applies to |

You can add a policy to a bucket to grant another AWS account or IAM user access to that bucket and the objects in it. Object permissions apply only to the objects that the bucket owner creates.

### 4.6 Amazon S3 Access Points 🔄

Amazon S3 access points are named network endpoints that are **attached to** a data source.

> The first paragraph of the courseware's instructor notes states that access points are "not attached to a bucket", but the same notes later, and the answer to knowledge check question 6 (True), say they are attached. Per the official documentation, they **are attached.**

🆕 The set of things an access point can attach to is no longer limited to buckets.

| Attachment target |
|---|
| Amazon S3 bucket |
| Amazon FSx for NetApp ONTAP volume |
| Amazon FSx for OpenZFS volume |
| Amazon S3 recovery point in AWS Backup (bucket contents at a point in time) |

How they work:

- Each access point has distinct permissions and network controls that S3 applies to any request made through it.
- The access point policy controls use by resource, user, or other conditions. When attached to a bucket, it **works in conjunction with the underlying bucket policy.**
- You can configure an access point to accept requests only from a VPC, restricting data access to a private network.
- You can configure custom Block Public Access settings per access point.

🆕 Limitation: you can only use access points to perform **object operations** such as `GetObject` and `PutObject`. You cannot use them for other S3 operations such as deleting buckets or creating S3 Replication configurations.

| Use case | Description |
|---|---|
| Distributed teams | Each group gets its own access point with tailored permissions |
| Data lakes | Fine-grained control for teams accessing the data lake |
| Cross-account data exchange | Grant object access to external users or users in other accounts |
| Centralized control | Manage storage with a single set of policies even with many access points |

Configuration example:

| Access point | Accessible data |
|---|---|
| `support` | `/support/object1`, `/support/object2`, … |
| `developers` | `/developers/object1`, `/developers/object2`, … |
| `qa` | `/qa/object1`, `/qa/object2`, … |

> — Source: [Managing access to shared datasets with access points](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html)

---

## 5. S3 Service Endpoints

A service endpoint is the URL of the entry point for an AWS service. You use it when connecting to Amazon S3 programmatically.

### 5.1 Virtual-Hosted-Style URLs (Recommended)

```text
https://bucket-name.s3.region-code.amazonaws.com/key-name
```

For example: `https://amzn-s3-demo-bucket1.s3.us-west-2.amazonaws.com/puppy.png`

The bucket name becomes part of the domain name. By naming your bucket after your registered domain name and making that name a DNS alias, you can fully customize the URL, for example `http://my.bucket-name.com/`. You can also publish to the "root directory" of the bucket, which matters for applications that expect files such as `favicon.ico`, `robots.txt`, and `crossdomain.xml` in that standard location.

> **Caution**: when using SSL, the SSL wildcard certificate matches **only bucket names that do not contain periods (.)**.

### 5.2 Path-Style URLs 🔄

```text
https://s3.region-code.amazonaws.com/bucket-name/key-name
```

These still work in all AWS Regions, but **path-style URLs will be discontinued in the future.** An update on September 23, 2020 delayed the deprecation.

When hosting website content that will be accessed from a web browser, avoid path-style URLs because they might interfere with the browser same-origin security model. Use S3 website endpoints or a CloudFront distribution instead.

The courseware's `~/.aws/config` example includes `addressing_style = path`. For new code, use the SDK default (virtual-hosted style).

> — Source: [Virtual hosting of general purpose buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

### 5.3 Website Endpoints 🔄

When you configure a bucket as a static website, the site is served from the Region-specific website endpoint. This endpoint is **different from the endpoint you send REST API requests to.**

The courseware shows only the hyphen form, but depending on your Region the endpoint follows one of two formats.

| Format | Notation |
|---|---|
| `s3-website` dash (-) Region | `http://bucket-name.s3-website-Region.amazonaws.com` |
| `s3-website` dot (.) Region | `http://bucket-name.s3-website.Region.amazonaws.com` |

🆕 Important limitations:

- S3 website endpoints **do not support HTTPS and do not support access points.** If you need HTTPS, use one of the following:
  - (Recommended) **AWS Amplify Hosting** — a fully managed service that deploys static content stored in S3 to a CloudFront-powered CDN and generates a public HTTPS URL
  - **Amazon CloudFront** — serves a static website hosted on Amazon S3. For HTTPS with a custom domain, configure it with Route 53
- To make the website public, your content must be publicly readable.
- **Requester Pays buckets do not allow access through a website endpoint** and return 403 Access Denied.
- For added security, S3 website endpoint domains are registered in the [Public Suffix List](https://publicsuffix.org/). If you ever need to set sensitive cookies, use cookies with a `__Host-` prefix to help defend against CSRF.

> — Source: [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)

### 5.4 Additional Endpoint Formats (As Documented in the Courseware)

| Type | Notation |
|---|---|
| S3 dual-stack endpoint (IPv4 and IPv6) | `https://bucket-name.s3.dualstack.Region.amazonaws.com` |
| S3 access point | `https://AccessPointName-AccountId.s3-accesspoint.Region.amazonaws.com` |

The AWS SDKs and AWS CLI automatically determine the default endpoint based on the selected service and specified Region. You can also specify an alternate endpoint, such as an endpoint inside an Amazon VPC.

Some tools use a different syntax to address a bucket, for example `s3://bucket-name/key`.

---

## 6. Using Amazon S3 with the AWS CLI

The AWS CLI has two sets of commands for Amazon S3.

| Aspect | High-level (`aws s3`) | Low-level (`aws s3api`) |
|---|---|---|
| Nature | A user-friendly interface | Maps one-to-one to the Amazon S3 API |
| Characteristics | Simplifies common operations with an intuitive command structure. Abstracts underlying API calls and provides convenient defaults | Fine-grained control of API parameters at a lower level |
| Trade-off | May generate multiple `s3api` calls internally. Faster but with fewer controls | Performs specific API calls precisely. More flexible for advanced use cases |
| Example commands | `cp`, `sync`, `ls`, `mb` | `copy-object`, `create-multipart-upload`, `complete-multipart-upload`, `abort-multipart-upload`, `list-buckets`, `get-bucket-location` |

The two sets can be used interchangeably. To upload a set of files from a local location to a bucket, prefer `aws s3 cp` or `aws s3 sync`; they handle copying large files and synchronizing source and destination directories.

### Example: Terminal Session

```console
$ aws configure get region
us-east-2

$ aws s3 ls
2021-04-20 10:41:08 notes-bucket

$ aws s3 mb s3://lab-bucket --region us-west-1
make_bucket: lab-bucket

$ aws s3api list-buckets --query 'Buckets[].Name'
[
    "lab-bucket",
    "notes-bucket"
]

$ aws s3api get-bucket-location --bucket lab-bucket
{  "LocationConstraint": "us-west-1"  }

$ aws s3api get-bucket-location --bucket notes-bucket
{  "LocationConstraint": null  }
```

What this example shows:

1. Checking the Region setting — `us-east-2`
2. Listing all buckets — one bucket
3. Creating a bucket in `us-west-1`
4. Using `s3api` to list bucket names — the output format follows the configured format (json, yaml, text)
5. Retrieving each bucket's location

If you do not specify a Region when creating a bucket, it is created in the default Region. **If you do not specify `LocationConstraint`, the bucket is created in the US East (N. Virginia) Region (`us-east-1`).** The `null` value for `notes-bucket` above is the basis for the courseware describing it as `us-east-1`.

> — Source: [CreateBucket API – LocationConstraint](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

---

## 7. Using Amazon S3 with the AWS SDKs

Working with Amazon S3 through an AWS SDK takes five steps.

1. Configure the Amazon S3 settings for the SDK.
2. Define the dependencies.
3. Create an S3 client (service reference) to make service requests.
4. Perform operations.
5. Close the S3 client connection.

> Terminology: in AWS documentation, an Amazon S3 service reference is generally called a **service client**.

### 7.1 Step 1: Configure the Service

For the SDK and CLI to resolve endpoints and interact with the API, they need two kinds of information.

| Category | Contents |
|---|---|
| Configuration details | API version used, default Region for requests, response format, service-specific settings |
| Credentials | Sensitive information such as access keys and secret keys used to sign requests |

#### Credential provider chain 🔄

The courseware presents four steps (operation parameters → environment variables → shared credentials file → config file), but that is closer to the **precedence of ways to specify settings.** The actual credential provider chain is broader.

Every SDK checks a series of sources in order to find valid credentials and stops once it finds them. The chain varies by SDK but most often includes the following.

| Provider | Description |
|---|---|
| AWS access keys | `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for an IAM user |
| Web identity / OpenID Connect federation | Sign in with an external IdP and assume an IAM role using a JWT from AWS STS |
| Login credentials provider | Use credentials for a console session you are logged in to |
| 🆕 IAM Identity Center credentials provider | Get credentials from AWS IAM Identity Center |
| Assume role credentials provider | Retrieve and use temporary credentials for an IAM role |
| 🆕 Container credentials provider | Credentials for containerized applications on Amazon ECS and Amazon EKS |
| Process credentials provider | Get credentials from an external source or process, including IAM Roles Anywhere |
| 🆕 IMDS credentials provider | Amazon EC2 instance profile. Temporary credentials delivered through the instance metadata service |

Precedence for specifying setting values: **values specified in code always take precedence**, followed by environment variables and the shared `config` and `credentials` files.

When you use the standardized credential providers, **the SDK automatically renews credentials when they expire.** No additional code is required.

Environment variables as documented in the courseware:

- Credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (recommended)
- Region: `AWS_REGION`

> Practical recommendation: instead of long-term access keys, use IAM Identity Center for local development or IAM roles for EC2, ECS, EKS, and Lambda. Keeping access keys in code or environment variables risks exposure.

> — Source: [AWS SDKs and Tools standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html)

#### File locations

| File | Linux · macOS · Unix | Windows |
|---|---|---|
| Credentials (sensitive) | `~/.aws/credentials` | `C:\Users\USERNAME\.aws\credentials` |
| Config (profile settings such as Region) | `~/.aws/config` | `C:\Users\USERNAME\.aws\config` |

#### Example: `~/.aws/config`

```ini
[default]
region = us-east-2
output = json

[profile Beta]
region = us-west-2
output = json
s3 =
    max_concurrent_requests = 20
    max_queue_size = 10000
    multipart_threshold = 64MB
    multipart_chunksize = 16MB
    max_bandwidth = 50MB/s
```

With a large number of objects, you can speed up the copy process by increasing the number of threads (`max_concurrent_requests`), the chunk size (`multipart_chunksize`), or both.

> 🔄 The courseware example includes `addressing_style = path`, which is omitted here for the reasons in [Section 5.2](#52-path-style-urls). Use the SDK default of virtual-hosted style.

### 7.2 Step 2: Define the Dependencies

Each AWS service has a service interface with a method for each operation in the service API.

- Python: import Boto3, which covers all services.
- Java and .NET: import only the specific service packages your application needs (avoiding dependency overload).

#### Java packages (AWS SDK for Java 2.x)

| Package | Purpose |
|---|---|
| `software.amazon.awssdk.services.s3` | API for creating an S3 client and performing bucket and object operations |
| `software.amazon.awssdk.services.s3.model` | Classes for building requests and handling responses |
| `software.amazon.awssdk.services.s3.S3Client` | Synchronous S3 client |
| `software.amazon.awssdk.services.s3.S3AsyncClient` | Asynchronous S3 client |

#### .NET namespaces

| Namespace | Purpose |
|---|---|
| `Amazon.S3` | Low-level implementation of the S3 REST API |
| `Amazon.S3.Model` | Classes for building and handling requests |
| `Amazon.S3.Transfer` | High-level API for transferring data |
| `Amazon.S3.Encryption` | Encryption client |

#### Python packages

| Package | Purpose |
|---|---|
| `boto3.s3` | Low-level client representation of Amazon S3. Defines both the client API and the resource API |
| `boto3.s3.transfer` | File transfers |

### 7.3 Step 3: Create an S3 Client

To call the service through the API, you first create a client that references the S3 API. You can configure the client before creating it, but **once created it cannot be changed (it is immutable).**

#### Python (Boto3) 🔄

Boto3 provides a low-level **client** API and a high-level **resource** API.

> **Important**: the AWS Python SDK team **does not intend to add new features to the resources interface.** Existing interfaces continue to operate during boto3's lifecycle, but newer service features are available through the client interface. Write new code against the **client interface.**
>
> — Source: [Boto3 – Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

```python
import boto3

# Recommended: the client interface
s3client = boto3.client('s3')

# The resource interface still works, but receives no new features
s3resource = boto3.resource('s3')
```

Creating a bucket with the client returns a dictionary; creating one with the resource API returns a bucket instance.

#### Example: Profile-Based Configuration and Bucket Creation (Python, client interface) 🔄

```python
import boto3

# --- Step 1: Create a profile-based session ---
# A session holds configuration state. Using one avoids hardcoding the Region
# and instead reads it from the profile.
session = boto3.session.Session(profile_name='staging')

# --- Step 2: Read the Region from the session ---
# The Region configured in the profile, used for CreateBucketConfiguration.
current_region = session.region_name

# --- Step 3: Create the S3 client from the session ---
# The client is immutable once created.
s3client = session.client('s3')

# --- Step 4: Create the bucket ---
# Without LocationConstraint the bucket is created in us-east-1,
# so it must be specified for any other Region.
s3client.create_bucket(
    Bucket='notes-bucket',
    CreateBucketConfiguration={
        'LocationConstraint': current_region
    }
)
```

#### Example: Configuring a Client and Creating a Bucket (Java 2.x) 🔄

> The courseware example mixes v1 and v2 syntax and has a variable naming error. It has been corrected to v2 syntax here. See [Section 8](#8-changes-from-the-courseware) for details.

```java
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;

// Configure the Region
Region region = Region.US_WEST_2;

// Configure and build the S3 client with the builder.
// The credentials provider is based on an AWS configuration profile.
S3Client s3Client = S3Client.builder()
        .region(region)
        .credentialsProvider(ProfileCredentialsProvider.create("profile_name"))
        .build();

// Create the bucket - in v2 the request object is also built with a builder.
s3Client.createBucket(CreateBucketRequest.builder()
        .bucket(bucketName)
        .build());
```

#### Example: Configuring a Client and Listing Buckets (.NET)

```csharp
CredentialProfile basicProfile;
AWSCredentials awsCredentials;
var sharedFile = new SharedCredentialsFile();

if (sharedFile.TryGetProfile("basic_profile", out basicProfile) &&
    AWSCredentialsFactory.TryGetAWSCredentials(basicProfile, sharedFile, out awsCredentials))
{
    // Create an S3 client with credentials read from the profile,
    // then count and list the buckets.
    using (var client = new AmazonS3Client(awsCredentials, basicProfile.Region))
    {
        var response = await client.ListBucketsAsync();
        Console.WriteLine($"Number of buckets: {response.Buckets.Count}");
    }
}
```

> **Security note**: passing access keys and secret keys as parameters in code is a security risk and is not recommended. The example above reads credentials from a shared profile, but in production use IAM roles or IAM Identity Center.

### 7.4 Step 4: Perform Operations

The SDKs hide most of the detail of API calls, but it is important to understand the kind of information requests and responses carry. Headers associate metadata with API requests and responses.

#### Request: PutObject storing `my-image.jpg` in `notes-bucket`

```http
PUT /my-image.jpg HTTP/1.1
Host: notes-bucket.s3.<Region>.amazonaws.com
Date: Wed, 12 Oct 2020 17:50:00 GMT
Authorization: authorization string
Content-Type: text/plain
Content-Length: 11434
x-amz-meta-author: Janet
Expect: 100-continue

[11434 bytes of object data]
```

- Operation: `PUT` / resource path: `/my-image.jpg`
- `Host`: the virtual-hosted-style URL
- `x-amz-meta-author`: user-defined metadata
- `Expect: 100-continue`: do not send the request body until the server acknowledges

#### Response: PutObject response for a versioning-enabled bucket

```http
HTTP/1.1 100 Continue
HTTP/1.1 200 OK
x-amz-id-2: LriYPLdmOdA...
x-amz-request-id: 0A49CE4060975EAC
x-amz-version-id: 43jfkodU8...
Date: Wed, 12 Oct 2020 17:50:00 GMT
ETag: "fbac..."
Content-Length: 0
Connection: close
Server: AmazonS3
```

#### Key response headers

| Header | Purpose |
|---|---|
| `ETag` | Verify that the uploaded object's checksum matches the original file. To complete a multipart upload you must include each part number and ETag in the final request, which is a separate API call from the part uploads |
| `x-amz-request-id`, `x-amz-id-2` | Generated for every request Amazon S3 processes. Useful when troubleshooting with AWS Support |
| `x-amz-version-id` | The version ID of an object uploaded to a versioning-enabled bucket |
| `Connection` | Whether the connection is closed |

> — Source: [Common Request Headers](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonRequestHeaders.html), [Common Response Headers](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html)

### 7.5 Step 5: Close the S3 Client Connection

`close()` closes the client object and releases all connection pool resources. Following it is a good practice.

That said, in most cases the SDK automatically cleans up, closes, and removes clients from the connection pool, so an explicit `close()` is not strictly required.

---

## 8. Changes from the Courseware

The following items in the courseware (instructor deck) differ from current behavior. Learners typically have the official courseware alongside this material, so what changed and why is recorded here.

### 8.1 Where the Courseware Is Factually Incorrect

| Item | Courseware states | Verified content | Source |
|---|---|---|---|
| Allowed characters in bucket names | "must use only lowercase letters, numbers, and hyphens (-)" | Periods (`.`) are also allowed. In practice, avoid them because of SSL wildcard certificate matching and Transfer Acceleration constraints | [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| Access point attachment | Instructor notes, first paragraph: "not attached to a bucket" (contradicting the same notes later and the answer to knowledge check 6) | Access points **are attached** to a data source | [Access points](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html) |
| Java example code | Declares `S3Client s3 = S3Client.builder()...` then calls `s3Client.createBucket(new CreateBucketRequest(bucketName))`. The variable name does not match, and v2 builder syntax is mixed with v1 request construction | Corrected to v2 syntax, with the request object also built by a builder (`CreateBucketRequest.builder().bucket(...).build()`) | [Java SDK 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| Documentation link path | `/AmazonS3/latest/dev/BucketRestrictions.html` (older path) | The current path is `/AmazonS3/latest/userguide/` | [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| Availability figure | Presents "99.99% availability" as a single value for all of S3 | Varies by storage class (99.5% to 99.99%). Only durability is common at 99.999999999% | [Comparing storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 8.2 Where Behavior or Defaults Changed

| Item | Courseware states | Current | Source |
|---|---|---|---|
| Consistency model | "read-after-write consistency" | **Strong read-after-write consistency** for object `PUT` and `DELETE` in all Regions. Bucket configuration is eventually consistent | [Consistency model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| ACLs | "legacy resource-based policy" | S3 Object Ownership defaults to **Bucket owner enforced**, with **all ACLs disabled** on new buckets. Requests to set ACLs fail | [Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html) |
| Default encryption | Lists "default encryption" as a security characteristic | Since January 5, 2023, **SSE-S3 (AES-256) is applied automatically to all new objects**, at no additional cost and with no performance impact | [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html) |
| Bucket name uniqueness | "unique across all of Amazon S3" | Unique **per partition**. There are four partitions: `aws`, `aws-cn`, `aws-us-gov`, `aws-eusc` | [General purpose bucket namespaces](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html) |
| Providing credentials | Presents only a four-step precedence | The credential provider chain also includes IAM Identity Center, container credentials (ECS/EKS), and IMDS (EC2 instance profile) | [Standardized credential providers](https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html) |
| Website endpoints | Shows only the hyphen form | Two forms depending on Region (hyphen and dot). **HTTPS and access points are not supported** | [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |

### 8.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS SDK for Java 1.x | **Reached end-of-support on December 31, 2025** | AWS SDK for Java 2.x (`software.amazon.awssdk`) | [Java SDK 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| Boto3 resources interface (`boto3.resource`) | No new features planned. Existing interfaces continue to operate | Client interface (`boto3.client`) | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| Path-style URLs (`addressing_style = path`) | Still work but will be discontinued. Avoid for web content | Virtual-hosted style (the SDK default) | [Virtual hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html) |
| Reduced Redundancy Storage | Not recommended | S3 Standard (more cost-effective) | [Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 8.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| S3 Glacier Instant Retrieval | Archive class for data accessed once a quarter with millisecond retrieval | [Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| S3 Express One Zone | Single AZ, single-digit millisecond latency. Directory buckets only | [Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| Account regional namespace | A reserved namespace only your account can create buckets in. `-an` suffix | [General purpose bucket namespaces](https://docs.aws.amazon.com/AmazonS3/latest/userguide/gpbucketnamespaces.html) |
| Conditional requests | Conditional reads, writes, and deletes to control overwrites and contention. No additional charge | [Conditional requests](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-requests.html) |
| Expanded event notification types | Added lifecycle, Intelligent-Tiering, object tagging, annotation, and ACL events | [Event types](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html) |
| Expanded access point targets | Beyond buckets: FSx for NetApp ONTAP and OpenZFS volumes, and Amazon S3 recovery points in AWS Backup | [Access points](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-points.html) |
| Tagging a bucket at creation | `Tags` in `CreateBucketConfiguration`. Requires `s3:TagResource`, and tag conditions apply after ABAC is enabled | [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) |

### 8.5 Items That Could Not Be Verified

Recorded honestly. Confirm these before stating them definitively in class.

| Item | Status |
|---|---|
| Detailed file storage list | The list on courseware slide 5 (EFS Standard, EFS Infrequent Access, FSx for Lustre, FSx for NetApp ONTAP, FSx for OpenZFS) does not match the diagram labels on the same slide (EFS, FSx for Windows File Server, FSx for Lustre). This document keeps only the service names and omits the detailed class list. Separate verification against the EFS and FSx documentation is needed |
| `get-bucket-location` returning `null` for `us-east-1` | That a bucket is created in `us-east-1` when `LocationConstraint` is not specified was confirmed in the CreateBucket API documentation. However, the `get-bucket-location` response returning `null` was not confirmed in documentation. This needs runtime verification |

---

## 9. Knowledge Check and Summary

### Knowledge Check (True/False)

**Question 1**: Data is stored as objects in an S3 bucket. Any kind of file can be an object, including text, video, images, and other binary formats.

- ✅ **Answer: True**

**Question 2**: S3 buckets are created globally and have no dependency on a single AWS Region.

- ❌ **Answer: False** — A bucket **name** is managed in a global (more precisely, per-partition) namespace, but the bucket itself is created in a specific AWS Region. The Region cannot be changed after creation.

**Question 3**: The AWS SDKs map to APIs for Amazon S3 that correspond to the underlying AWS REST API operations.

- ✅ **Answer: True**

**Question 4**: Enabling an S3 bucket for website hosting changes the existing endpoint.

- ❌ **Answer: False** — A website endpoint is **added**; the existing REST API endpoint does not change. The two endpoints serve different purposes.

**Question 5**: All objects and buckets are private by default.

- ✅ **Answer: True** — The default settings block public access, and Block Public Access overrides bucket policies and object permissions.

**Question 6**: An Amazon S3 access point is a unique hostname that is attached to an S3 bucket and configured with a use-case-specific access policy.

- ✅ **Answer: True** — 🆕 Access points can now also be attached to FSx for NetApp ONTAP and OpenZFS volumes and to Amazon S3 recovery points in AWS Backup.

### 🆕 Supplementary Questions (Covering the Updated Content)

**Question 7**: When you upload an object to a newly created S3 bucket without configuring encryption, the object is stored unencrypted.

- ❌ **Answer: False** — Since January 5, 2023, SSE-S3 (AES-256) is automatically applied to all new object uploads. (See [Section 3.7](#37-default-encryption))

> — Source: [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)

**Question 8**: Setting an object ACL on a newly created S3 bucket succeeds.

- ❌ **Answer: False** — Object Ownership defaults to Bucket owner enforced, so ACLs are disabled. Requests to set an ACL fail with HTTP 400 `AccessControlListNotSupported`. (See [Section 4.4](#44-s3-object-ownership-and-acls-disabled-by-default))

> — Source: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

**Question 9**: If two clients send a `PUT` to the same key at the same time, S3 automatically locks the object and makes one of them wait.

- ❌ **Answer: False** — S3 does not support object locking for concurrent writers; the request with the latest timestamp wins (last-writer-wins). Use conditional writes or implement locking in your application. (See [Section 3.2](#32-data-consistency-model), [Section 3.8](#38-conditional-requests))

> — Source: [Amazon S3 data consistency model](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

### Module Objectives Check

After completing this module, you should be able to do the following:

- ✅ Describe the core concepts of Amazon Simple Storage Service (Amazon S3)
- ✅ List the options for protecting data with Amazon S3
- ✅ Define the SDK dependencies in your code
- ✅ Describe how to connect to the Amazon S3 service
- ✅ Describe request and response objects
