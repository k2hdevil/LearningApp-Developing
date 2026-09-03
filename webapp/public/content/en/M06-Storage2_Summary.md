# Module 6: Processing Your Storage Operations

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Bucket Operations](#2-bucket-operations)
3. [Object Operations](#3-object-operations)
4. [Granting Temporary Access to Objects](#4-granting-temporary-access-to-objects)
5. [Bulk Operations](#5-bulk-operations)
6. [Static Website Hosting and CORS](#6-static-website-hosting-and-cors)
7. [Changes from the Courseware](#7-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 7](#7-changes-from-the-courseware) for what changed and how.
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Perform key bucket and object operations
- Describe how to handle large files and large numbers of files
- Create an Amazon Simple Storage Service (Amazon S3) bucket for static website hosting
- Describe how to grant temporary access to objects

### Where This Module Sits

| Item | Content |
|---|---|
| Module 5 | Getting started with storage — Amazon S3 core concepts, configuring the SDKs and AWS CLI |
| **Module 6** | **Processing your storage operations** — Bucket and object operations programmatically, bulk operations, presigned URLs, static website hosting |
| Lab 2 | Developing a solution with Amazon S3 |

### What This Module Covers

In the previous module you learned how to configure an SDK and create a service client to access Amazon S3. This module focuses on working with the data.

- Create buckets programmatically and perform CRUD (create, read, update, delete) operations on S3 objects
- Batch operations for managing S3 objects at scale
- Provide temporary access to objects with presigned URLs
- Configure a bucket to host a website
- Set up cross-origin resource sharing (CORS) to selectively allow cross-origin access to Amazon S3 resources

Elements that appear in the Lab 2 diagram: AWS Identity and Access Management (IAM), AWS Cloud, SDK, Amazon S3 operations, granting permissions, Notes bucket, developer, user, website endpoint.

---

## 2. Bucket Operations

### 2.1 Bucket Operations and What You Can Configure 🔄

Once the AWS SDK or the AWS Command Line Interface (AWS CLI) is configured, your application is ready to work with Amazon S3. With the appropriate permissions you can **create, list, and delete** buckets and **update their configuration**.

Configuration targets: encryption, lifecycle, CORS, versioning, website, notifications, policy, replication, tagging, and more.

| Type | Content |
|---|---|
| Permissions | Manage access permissions and object ownership. **Bucket policies and IAM policies are the primary mechanisms, and ACLs are disabled by default on new buckets** 🔄 |
| Properties | Specify how the bucket operates and manages objects. Enable versioning, configure event notifications, logs, website hosting, and so on |
| Management | Manage objects. Replication rules for automatic asynchronous copying between buckets, and lifecycle rules for storage class transitions, archiving, and deletion after a set period |

The courseware describes permissions configuration as spanning "from ACLs to bucket policies to Amazon S3 access points," which presents ACLs as the first mechanism. Today the default for S3 Object Ownership is **Bucket owner enforced**, and that setting disables all ACLs. New buckets have ACLs disabled by default, and AWS recommends keeping ACLs disabled unless you specifically need per-object access control.

| Object Ownership setting | ACLs |
|---|---|
| Bucket owner enforced (default) | Disabled |
| Bucket owner preferred | Enabled |
| Object writer | Enabled |

In a bucket with ACLs disabled, only PUT requests that specify no ACL, or that specify the `bucket-owner-full-control` ACL, are allowed. Any other PUT that includes an ACL fails with **HTTP 400 and the error code `AccessControlListNotSupported`**. Requests to read ACLs are still supported.

> — Source: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

### 2.2 Creating a Bucket and the Per-Account Bucket Quota 🔄

You need a bucket to store and work with objects. The AWS account that creates a bucket owns it, and **you cannot change a bucket's name or Region after you create it.**

The courseware states that "by default you can create up to 100 buckets, but you can request a service limit increase up to 1,000 buckets." The current values are different.

| Item | Current value |
|---|---|
| Default per-account general purpose bucket quota | **10,000** |
| Quota increase | Request in the Service Quotas console |
| Where the quota is viewed and managed | Commercial Regions: US East (N. Virginia) only. AWS GovCloud (US): AWS GovCloud (US-West) only |
| Maximum bucket size | No limit |
| Maximum number of objects in a bucket | No limit |
| Changing a bucket name or Region | Not possible after creation |

> — Source: [Bucket quotas, limitations, and restrictions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html)

The three steps to create a bucket (courseware slide 6):

| Step | Content |
|---|---|
| 1 | Decide the bucket name and AWS Region |
| 2 | Check whether the bucket exists with `HeadBucket`, then create it |
| 3 | Retrieve the bucket information to confirm creation |

The `LocationConstraint` in `CreateBucket` specifies the Region to create the bucket in. If you do not specify a Region, the bucket is created in the **US East (N. Virginia) Region (`us-east-1`)**, and `us-east-1` is not included in the list of valid values for `LocationConstraint`. The value `EU` creates the bucket in `eu-west-1`. `LocationConstraint` is not supported for directory buckets. 🆕 You can specify tags at bucket creation with `Tags` in `CreateBucketConfiguration`, which requires the `s3:TagResource` permission.

This supports the courseware instructor note: "To create a bucket in `us-east-1`, do not include the location constraint attribute."

> — Source: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

#### Bucket Naming Rules 🔄

The bucket name `notes_bucket` in the courseware .NET example contains an underscore, which violates the current naming rules.

| Rule | Content |
|---|---|
| Length | 3 to 63 characters |
| Allowed characters | Lowercase letters, numbers, periods (`.`), hyphens (`-`). **Underscores (`_`) are not allowed** |
| Start and end | Must begin and end with a letter or number |
| Historical exception | Before March 1, 2018, names in US East (N. Virginia) could be up to 255 characters and include uppercase letters and underscores. New buckets created after that date follow the same rules as all other Regions |
| Recommendation on periods | Avoid periods except for buckets used exclusively for static website hosting (with a period you cannot use HTTPS virtual-hosted-style addressing) |

> — Source: [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)

### 2.3 The HeadBucket API Operation 🔄

`HeadBucket` determines whether a bucket exists and whether you have permission to access it. It is an HTTP HEAD request against the bucket and returns the headers that an HTTP GET returns.

| Response | Meaning |
|---|---|
| 200 OK | The bucket exists and you have access permission |
| 400 Bad Request / 403 Forbidden / 404 Not Found | The bucket does not exist or you do not have permission. **There is no message body, so you cannot determine any exception beyond these HTTP response codes** |

The instructor notes on courseware slide 7 mention only 404 and 403 and omit 400, and the Java example on slide 8 treats 400 as "attempted to access a bucket from a Region other than where it exists." The API documentation describes 400 as one of the general codes (400 / 403 / 404) returned when a bucket does not exist or access is denied, and further states that **you can call `HeadBucket` with any bucket name in any Region within the partition and receive a response header containing the correct bucket location, regardless of the bucket policy.**

For general purpose buckets, `HeadBucket` requires the `s3:ListBucket` permission. Response headers include `x-amz-bucket-region`, `x-amz-bucket-arn`, and `x-amz-access-point-alias`. 🆕

> — Source: [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html)

Request and response syntax as recorded on courseware slide 7 (Java):

```text
Request syntax
HeadBucketRequest(String bucketName)

Response syntax
default HeadBucketResponse headBucket(HeadBucketRequest headBucketRequest)
throws NoSuchBucketException,
AwsServiceException,
SdkClientException,
S3Exception
```

### 2.4 Example: HeadBucket (Java) 🔄

Two problems in the courseware slide 8 example are corrected here. One is the incorrect interpretation of the `case 400` branch (see [Section 2.3](#23-the-headbucket-api-operation)); the other is the missing `break` in the `switch` statement, which makes a 404 response print all three messages. The second one is Java language behavior, so the code is fixed without citing AWS documentation for it.

```java
public void bucketExisting(S3Client s3, String bucketName) {
    try {
        // Build a HeadBucket request to check whether the bucket exists and is accessible
        HeadBucketRequest request = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();
        HeadBucketResponse result = s3.headBucket(request);
        if (result.sdkHttpResponse().statusCode() == 200) {
            System.out.println("Bucket existing!");
        }
    }
    catch (AwsServiceException awsEx) {
        // There is no response body, so only the status code distinguishes cases.
        // 400, 403, and 404 can all mean "does not exist or access denied".
        switch (awsEx.statusCode()) {
        case 404:
            System.out.println("No such bucket existing.");
            break;
        case 403:
            System.out.println("Permission errors in accessing bucket...");
            break;
        case 400:
            System.out.println("Bad request. The bucket may not exist or access may be denied.");
            break;
        default:
            System.out.println("Unhandled status: " + awsEx.statusCode());
        }
    }
}
```

Courseware slide annotations: `HeadBucketRequest` is built from the bucket name / capture the result / examine the exception / exception 404 indicates the bucket does not exist, so you can create it.

> — Source: [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html)

### 2.5 Example: HeadBucket (Python)

```python
def verifyBucketName(s3Client, bucket):
    try:
        # Check whether the bucket already exists in AWS
        s3Client.head_bucket(Bucket=bucket)
        # If the previous command succeeded, the bucket exists and you have permission to manage it
        raise SystemExit('This bucket has already been created')
    except botocore.exceptions.ClientError as e:
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            # A 404 error code means no bucket with this name
            # exists anywhere in AWS
            print('Existing Bucket Not Found, please proceed')
        if error_code == 403:
            # A 403 error code means a bucket with this name
            # exists in another AWS account
            raise SystemExit('This bucket exists and you do not have permission to head it')
```

### 2.6 Example: HeadBucket (.NET)

`AmazonS3Util.DoesS3BucketExistV2Async` is still a valid method. In AWS SDK for .NET version 4 the deprecated `DoesS3BucketExist` and `DoesS3BucketExistAsync` methods were removed because they always used HTTP, and `DoesS3BucketExistV2` / `DoesS3BucketExistV2Async` replace them.

```csharp
async Task VerifyBucketName(IAmazonS3 s3Client, string bucketName)
{
    bool exists = false;
    // Check whether the bucket already exists in AWS
    exists = await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName);
    if (exists)
    {
        // Returns true when the bucket exists. That does not
        // mean the bucket belongs to your account.
        Console.WriteLine("This bucket already exists in your, or someone else's, account.");
        Environment.Exit(0);
    }
    else
    {   Console.WriteLine("The bucket does not exist."); }
}
```

Other S3 changes in version 4 confirmed in the same document: 🆕

- Deprecated AWS Region identifiers were removed from the `S3Region` enumeration.
- The SDK always signs requests with SigV4, and the `AWSConfigsS3.UseSignatureVersion4` and `ClientConfig.SignatureVersion` properties were removed.
- An S3 service client configured for `us-east-1` can no longer access buckets in other Regions.
- The `GetACL` and `PutACL` methods on `AmazonS3Client` are marked deprecated; use `GetBucketACL`, `PutBucketACL`, `GetObjectACL`, and `PutObjectACL` instead.

> — Source: [What's new in AWS SDK for .NET version 4 — Changes specific to S3](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-v4.html)

### 2.7 Creating a Bucket 🔄

Python (same as the courseware):

```python
s3_client = boto3.client('s3', region_name=region)
location = {'LocationConstraint': region}
s3_client.create_bucket(Bucket=bucket_name, CreateBucketConfiguration=location)
```

Java — the courseware example uses `doesBucketExistV2`, `new CreateBucketRequest(...)`, and `new GetBucketLocationRequest(...)`, which is **AWS SDK for Java 1.x syntax**. Version 1.x reached end-of-support on December 31, 2025, so this is rewritten in 2.x syntax.

```java
// AWS SDK for Java 2.x. Request objects are created with builders.
CreateBucketRequest createRequest = CreateBucketRequest.builder()
        .bucket(bucketName)
        .build();
s3Client.createBucket(createRequest);

GetBucketLocationRequest locationRequest = GetBucketLocationRequest.builder()
        .bucket(bucketName)
        .build();
System.out.println("Bucket location: "
        + s3Client.getBucketLocation(locationRequest).locationConstraintAsString());
```

> — Source: [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html), [S3Client (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html)

.NET — four things in the courseware example need fixing.

| Courseware | Problem | Correction |
|---|---|---|
| `BucketName = "notes_bucket"` | Underscores cannot be used in bucket names | `notes-bucket` |
| `BucketRegion = S3Region.EU` | The `S3Region` field list in SDK for .NET V4 has no field consisting of the string `EU`. It only has fields corresponding to Region codes, such as `EUCentral1` and `EUWest1` | An explicit Region field such as `S3Region.EUWest1` |
| `CannedACL = S3CannedACL.PublicRead` | New buckets have ACLs disabled by default. A PUT that specifies a public ACL fails | Create without an ACL and grant access with bucket and IAM policies |
| `client.PutBucket(request)` | Only asynchronous calls are supported when targeting .NET Core or .NET Standard | `PutBucketAsync` |

At the S3 API level the `LocationConstraint` value `EU` is still valid and creates the bucket in `eu-west-1`. What changed is the .NET SDK enumeration field.

```csharp
AmazonS3Client client = new AmazonS3Client();
PutBucketRequest request = new PutBucketRequest
{
    BucketName = "notes-bucket",        // Hyphen instead of underscore
    BucketRegion = S3Region.EUWest1     // Explicit Region field
    // Do not specify an ACL. Grant access with a bucket policy.
};
PutBucketResponse response = await client.PutBucketAsync(request);
```

> — Source: [Amazon.S3.S3Region fields](https://docs.aws.amazon.com/sdkfornet/v4/apidocs/items/S3/TS3Region.html), [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 2.8 Waiting Until the Bucket Exists 🔄

You can call `HeadBucket` repeatedly until the bucket is created, or you can use a waiter. The courseware instructor note says "a waiter that waits until the bucket is **terminated**," but the `bucket_exists` and `waitUntilBucketExists` waiters used in the example wait **until the bucket exists**. This is a translation error that also contradicts the slide title ("Waiting until the bucket is created").

The Boto3 `S3.Waiter.BucketExists` waiter is obtained with `client.get_waiter('bucket_exists')`.

| `WaiterConfig` | Default |
|---|---|
| `Delay` (polling interval) | 5 seconds |
| `MaxAttempts` | 20 |

It polls `head_bucket()` every 5 seconds until it reaches a successful state, and raises an error after 20 failed attempts.

> — Source: [S3.Waiter.BucketExists (Boto3)](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/waiter/BucketExists.html)

Python:

```python
waiter = s3Client.get_waiter('bucket_exists')
waiter.wait(Bucket=bucket)
```

Java:

```java
S3Waiter s3Waiter = s3Client.waiter();
HeadBucketRequest bucketRequestWait = HeadBucketRequest.builder().bucket(bucketName).build();
WaiterResponse<HeadBucketResponse> waiterResponse = s3Waiter.waitUntilBucketExists(bucketRequestWait);
```

.NET:

```csharp
exists = await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName);
```

🆕 Note: Boto3 resources also have waiters, so you can poll state in the form `bucket.wait_until_exists()`. However, resource instances are not thread safe, so do not share them across threads or processes; create a new one per thread.

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 2.9 Updating Bucket Versioning 🔄

You can change a bucket's configuration after you create it. The courseware example enables versioning.

```console
>> aws s3api get-bucket-versioning --bucket notes-bucket --generate-cli-skeleton output
>> aws s3api put-bucket-versioning --bucket notes-bucket --versioning-configuration Status=Enabled
>> aws s3api get-bucket-versioning --bucket notes-bucket
{
    "Status": "Enabled"
}
```

The courseware skeleton output shows `"Status": "Disabled"` and `"MFADelete": "Disabled"`. Three things there differ from the facts.

| Courseware states | Verified content |
|---|---|
| `"Status": "Disabled"` | `PutBucketVersioning` accepts only **`Enabled` and `Suspended`**. If a bucket has never had a versioning state set, it has no versioning state and a `GetBucketVersioning` request **does not return a versioning state value** |
| `"MFADelete"` | The field name is **`MfaDelete`** |
| A skeleton output with values filled in | `--generate-cli-skeleton` generates and displays an **empty template** containing the parameters the command supports |

| Versioning state | Behavior |
|---|---|
| `Enabled` | Assigns a unique version ID to every object added to the bucket |
| `Suspended` | Disables versioning. Objects added afterward receive the version ID `null` |

To enable MFA Delete you must be the **bucket owner** and send both the `Status` and `MfaDelete` request elements along with the `x-amz-mfa` header. When you enable versioning on a bucket for the first time, propagation takes time, so AWS recommends **waiting 15 minutes** before writing objects (PUT and DELETE).

> — Source: [PutBucketVersioning API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketVersioning.html)

#### Conditions for Using `--generate-cli-skeleton` 🆕

| Value | Content |
|---|---|
| `input` (default) | JSON input parameter template |
| `yaml-input` | YAML input parameter template |
| `output` | JSON output parameter template. **Cannot be requested as YAML** |

Custom AWS CLI commands such as `aws s3` do not support `--generate-cli-skeleton`, `--cli-input-json`, or `--cli-input-yaml`. The courseware example uses an `aws s3api` command, so it is valid. Skeletons use the underlying API parameter names rather than the CLI parameter names.

> — Source: [About AWS CLI skeletons and input files](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-skeleton.html)

---

## 3. Object Operations

### 3.1 Types of Object Operations

| Category | Operations |
|---|---|
| Single operations | Upload, list, download, copy, move, rename, delete |
| Bulk operations | Copy, sync, batch |

Object operations can run one at a time or in batches. Be mindful of **bucket properties** such as encryption, versioning, and lifecycle, because those properties require additional headers or subresource information. For example, a GET operation returns the current version of an object by default; to return a different version you use the versioned subresource.

### 3.2 Uploading Objects: PUT 🔄

What you can do with object uploads and copies:

- Create a copy of an object
- Rename an object by creating a copy and deleting the original
- Move objects across multiple Amazon S3 locations
- Update object metadata

Amazon S3 provides **strong read-after-write consistency**. After you successfully write a new object or overwrite an existing one, any subsequent read request immediately receives the latest version of the object. List operations are strongly consistent as well.

The courseware records the size boundaries per upload path as "single upload < 5 GB / multipart upload < 5 TB / multipart recommended above 100 MB." The 5 GB single PUT limit and the 100 MB threshold are still correct, but **the multipart ceiling is larger than the courseware states.**

| Path | Current limit |
|---|---|
| Single PUT operation | One object of up to **5 GB** |
| Amazon S3 console upload | A single object of up to **160 GB** 🆕 |
| Multipart upload API | A single large object of up to **50 TB**; usable for objects from 5 MB to 50 TB |
| Files larger than 5 TB | Use the **S3 Transfer Manager** from the Java v1/v2, Python, or AWS CLI SDKs 🆕 |
| Multipart recommendation threshold | Consider multipart upload instead of a single-operation upload once an object reaches **100 MB** |

🆕 When you upload an object, it is **automatically encrypted with SSE-S3** by default.

> — Source: [Uploading objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)

The benefits of multipart upload (courseware slide 17) and their basis:

| Benefit | Content |
|---|---|
| Improved throughput | Upload parts in parallel |
| Quick recovery | Retransmit only the part affected by a network issue |
| Pause and resume | Interrupt an object upload and continue later |
| Start without knowing the size | Begin an upload without knowing the final object size |

Points to watch:

- Once you initiate a multipart upload, **there is no expiration.** You must explicitly complete or stop it, and part storage charges continue until you do.
- You must **record the part number and `ETag` value yourself** for each part upload and include them in the completion request. The documentation explicitly says not to use the `list-parts` result for the completion request, but to use the list you maintained. 🔄
- When a multipart upload completes, the parts are consolidated into a single `ETag` (a checksum of checksums).

> — Source: [Uploading and copying objects using multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)

The lifecycle rule for cleaning up incomplete multipart uploads:

| Item | Content |
|---|---|
| Action | `AbortIncompleteMultipartUpload` |
| Condition | Uploads not completed within the number of days set in `DaysAfterInitiation` become eligible to be stopped |
| Behavior | Amazon S3 stops the upload and deletes the associated parts |
| Scope | **Both existing multipart uploads and uploads created later** 🆕 |
| Exception | Does not apply to uploads completed within the specified number of days |
| Charges | Does not delete objects, and this cleanup **incurs no S3 Lifecycle early delete fee** 🆕 |

> — Source: [Configuring a bucket lifecycle configuration to delete incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html)

### 3.3 Multipart Upload Limits 🆕

The courseware does not cover part size or part count limits. These are the values you need when implementing multipart upload directly with low-level commands.

| Item | Value |
|---|---|
| Maximum object size | 48.8 TiB |
| Maximum number of parts per upload | 10,000 |
| Part numbers | 1 to 10,000 (inclusive) |
| Part size | 5 MiB to 5 GiB. **There is no minimum size for the last part** |
| Maximum parts returned in a `list parts` request | 1,000 |
| Maximum multipart uploads returned in a `list multipart uploads` request | 1,000 |
| Recommended threshold for switching to multipart | Object size of 100 MB |

> — Source: [Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html)

Step 1 on courseware slide 17, "split the file into pieces of 5 GB or less," matches the 5 GiB part size ceiling but **omits the 5 MiB minimum.**

Two official pages give different values for the maximum object size: the multipart upload limits page says 48.8 TiB and the object upload page says up to 50 TB. Which one is authoritative could not be determined from the documentation, so both values are presented with their respective sources (see [Section 7.5](#75-items-that-could-not-be-verified)). What is certain is that **the courseware's 5 TB differs from current documentation.**

### 3.4 Multipart Upload with Low-Level Commands

The procedure from courseware slide 17.

| Step | Content |
|---|---|
| 1 | Split the file into parts (5 MiB to 5 GiB per part; no minimum for the last part) 🔄 |
| 2 | Initiate the upload with `create-multipart-upload` and retrieve the `UploadID` |
| 3 | Upload each part with `upload-part` and receive an `ETag` value |
| 4 | Check the uploaded parts with `list-parts` (use your own recorded list for the completion request) 🔄 |
| 5 | Compile the part numbers and `ETag` values into a single file |
| 6 | Complete the upload with `complete-multipart-upload` |

The `ETag` file format for step 5:

```json
{ "Parts": [{ "ETag": "123..", "PartNumber": 1 },
            { "ETag": "321..", "PartNumber": 2 }
] }
```

A successful response:

```json
{
  "ETag": "\"anEtagForCompletedUpload\"",
  "Bucket": "notes-bucket",
  "Location": "https://notes-bucket.s3.amazonaws.com/large_file",
  "Key": "large_file"
}
```

The multipart upload knowledge center article cited in the courseware instructor notes still responds: [Amazon S3 multipart upload with the AWS CLI](https://aws.amazon.com/premiumsupport/knowledge-center/s3-multipart-upload-cli/). Only URL reachability was checked; the content was not verified.

### 3.5 High-Level Transfers: S3 Transfer Manager 🆕

The courseware presents only `aws s3 cp` as a high-level transfer mechanism and does not cover the high-level transfer APIs in the SDKs. The **Amazon S3 Transfer Manager** is an open source high-level file transfer utility in the AWS SDK for Java 2.x, used to transfer files and directories to Amazon S3.

| Item | Content |
|---|---|
| Built on | The AWS CRT-based S3 client, or the standard Java-based S3 asynchronous client with multipart enabled |
| What you gain | Performance improvements such as the multipart upload API and byte-range fetches |
| Features | Monitor transfer progress in real time, and pause a transfer to run later |
| Dependency | `software.amazon.awssdk:s3-transfer-manager` (add `software.amazon.awssdk.crt:aws-crt` to use CRT) |
| Creation | Creating it with `S3TransferManager.create()` enables multipart support automatically |

> — Source: [Transfer files and directories with the Amazon S3 Transfer Manager](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html)

### 3.6 Retrieving Data: GET and HEAD

| Purpose | API |
|---|---|
| Get an object and its metadata | `GetObject` (can also return a byte range) |
| Get only object metadata | `HeadObject`, `GetObjectAcl`, `GetObjectTagging` |

A single GET request can return the complete object, or you can specify a byte range to retrieve only part of it. This is useful when the network connection is poor or when your application only needs to process a subset of the object data. A HEAD request returns the metadata headers the same way a GET does, but does not return the object body.

Request parameters for `GetObject`:

| Parameter | Content |
|---|---|
| `response-cache-control`, `response-content-disposition`, `response-content-encoding`, `response-content-language`, `response-content-type`, `response-expires` | Override response headers |
| `Range` | Download the specified byte range. **Retrieving multiple ranges in a single GET request is not supported** 🆕 |
| `partNumber` | A positive integer between 1 and 10,000. Performs a ranged GET for that part 🆕 |
| `versionId` | The current version is returned by default, so use this subresource to get a different version. Including it in the header **requires the `s3:GetObjectVersion` permission** 🆕 |
| `If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since` | Conditional reads. Return 412 Precondition Failed or 304 Not Modified respectively 🆕 |

> — Source: [GetObject API — URI Request Parameters](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html)

### 3.7 Example: Getting an Object (.NET) 🔄

You retrieve an object from a bucket with the `GetObject` method and then process the data stream with one of the `GetObjectResponse` methods. The object is streamed, so the network connection stays open until all the data is read or the input stream is closed.

The courseware example uses the synchronous `client.GetObject(request)`. **When targeting .NET Core (.NET Core 3.1, .NET 5, .NET 6, and so on) or .NET Standard, AWS service clients support only the asynchronous call pattern**, so you must use `GetObjectAsync`. Only builds targeting .NET Framework 4.7.2 support both synchronous and asynchronous patterns; Portable Class Library and Xamarin also support asynchronous only. High-level abstractions such as `TransferUtility` likewise support asynchronous calls only on .NET Core.

```csharp
GetObjectRequest request = new GetObjectRequest
{  BucketName = "SampleBucket",
   Key = "Item1" };
// Only asynchronous methods are supported on .NET Core / .NET Standard
using (GetObjectResponse response = await client.GetObjectAsync(request))
{   // Save the object to a local file
    await response.WriteResponseStreamToFileAsync("Item1.txt", false, default);  }
```

> — Source: [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 3.8 Example: Getting an Object (Python) 🔄

The courseware example uses the Boto3 **resources interface** (`s3.Object(...)`), and while the function takes a `bucket` argument, the body mixes an undefined `bucketname` with `bucket.name`. The first is an interface choice; the second is an error in the courseware code itself.

The AWS Python SDK team has **no plans to add new features to the Boto3 resources interface.** Existing interfaces continue to operate for the lifecycle of Boto3, but the latest service features are available through the client interface. Write new code against `boto3.client('s3')`.

```python
def get_object(s3_client, bucket, object_key):
    try:
        # Get the object through the client interface
        response = s3_client.get_object(Bucket=bucket, Key=object_key)
        body = response['Body'].read()
        logger.info("Got object '%s' from bucket '%s'.", object_key, bucket)
    except ClientError:
        logger.exception("Couldn't get object '%s' from bucket '%s'.",
                         object_key, bucket)
        raise
    else:
        return body
```

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 3.9 Example: Overriding Response Headers (Java) 🔄

When you get an object you can override some aspects of the response headers. For example, you can dynamically change the `Content-Disposition` header of a single object so that it appears with a different file name for each caller.

The courseware example uses the `ResponseHeaderOverrides` class and `new GetObjectRequest(bucketName, key).withResponseHeaders(...)`, which is **AWS SDK for Java 1.x syntax**. In 2.x, `GetObjectRequest.Builder` provides response header overrides as **methods on the request builder** rather than a separate class: `responseCacheControl`, `responseContentDisposition`, `responseContentEncoding`, `responseContentLanguage`, `responseContentType`, `responseExpires`, plus `range`, `versionId`, `ifMatch`, `ifNoneMatch`, `ifModifiedSince`, `ifUnmodifiedSince`, `partNumber`, and `checksumMode`.

```java
// AWS SDK for Java 2.x. Response header overrides are set on the request builder.
GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .responseCacheControl("No-cache")
        .responseContentDisposition("attachment; filename=example.txt")
        .build();
ResponseInputStream<GetObjectResponse> objectStream = s3Client.getObject(getObjectRequest);
displayTextInputStream(objectStream);
```

> — Source: [GetObjectRequest.Builder (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/model/GetObjectRequest.Builder.html)

### 3.10 Getting Only Metadata: HeadObject

The `HeadObject` operation retrieves metadata from an object without returning the object itself.

```console
>> aws s3api head-object --bucket notes-bucket --key index.html
{
"AcceptRanges": "bytes",
"ContentType": "text/html",
"LastModified": "Thu, 16 Apr 2021 18:19:14 GMT",
"ContentLength": 77,
"VersionId": "null",
"ETag": "\"30a6ec7e1a9ad79c203d05a589c8b400\"",
"Metadata": {}
}
```

Courseware slide annotation: if the request generates an error, it returns a 404 Not Found or 403 Forbidden code.

### 3.11 Amazon S3 Object Lambda 🔄

With S3 Object Lambda you can add your own code to Amazon S3 **GET, LIST, and HEAD** requests to modify and process the data returned to your application. The courseware slide body mentions only "S3 GET requests," but the instructor note's "GET, HEAD, and LIST" matches the documentation.

| Request | What you can do |
|---|---|
| GET | Filter rows, resize or watermark images dynamically, redact confidential data |
| LIST | Modify the output to create a custom view of the objects in a bucket |
| HEAD | Modify metadata such as object name and size |

You configure a Lambda function and then attach it to an **Object Lambda Access Point**, which reaches the data through a supporting access point. Object Lambda Access Points are not supported for directory buckets.

> — Source: [Transforming objects with S3 Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html)

#### Availability Change 🔄

The courseware introduces S3 Object Lambda as a general feature available to anyone. **Since November 7, 2025 that is no longer the case.**

| Item | Content |
|---|---|
| Who can use it | **Existing customers** already using the service, and a select group of AWS Partner Network (APN) partners |
| Existing customers | Can continue to use it. Customers using or deploying APN partner solutions can also continue |
| Roadmap | Security and availability improvements are prioritized, but **no new features are planned** |
| Alternatives | The Dynamic Image Transformation for Amazon CloudFront solution / invoking AWS Lambda through CloudFront, API Gateway, or function URLs / processing data in the client application |
| Data migration | Not required, because every alternative continues to use Amazon S3 as the underlying storage |

In other words, it is still worth covering to understand the concept, but **do not present it as the recommended path for new designs.**

> — Source: [Amazon S3 Object Lambda availability change](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html)

### 3.12 Example: S3 Object Lambda (Python) 🔄

The courseware example declares the variables `route` and `token` and then calls `write_get_object_response` with `RequestRoute=request_route` and `RequestToken=request_token`. Those names are undefined, so the code raises a `NameError` at runtime. The variable names are made consistent here.

```python
import boto3
import requests

def lambda_handler(event, context):
    print(event)
    get_context = event["getObjectContext"]
    route = get_context["outputRoute"]
    token = get_context["outputToken"]
    s3_url = get_context["inputS3Url"]
    # Get the object from S3
    response = requests.get(s3_url)
    original_object = response.content.decode('utf-8')
    # Transform the object
    transformed_object = original_object.upper()
    # Write the object back to S3 Object Lambda (using the variables as declared)
    s3 = boto3.client('s3')
    s3.write_get_object_response(
        Body=transformed_object,
        RequestRoute=route,
        RequestToken=token)
    return {'status_code': 200}
```

The launch blog post cited in the courseware instructor notes still responds: [Introducing Amazon S3 Object Lambda](https://aws.amazon.com/blogs/aws/introducing-amazon-s3-object-lambda-use-your-code-to-process-data-as-it-is-being-retrieved-from-s3/). Only URL reachability was checked.

> — Source: [Transforming objects with S3 Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html)

---

## 4. Granting Temporary Access to Objects

### 4.1 Presigned URLs 🔄

All objects and buckets are private by default. Presigned URLs are useful when you want someone without AWS credentials or permissions to retrieve (GET) a specific object or upload (PUT) to a bucket. They grant time-limited access to an object **without changing the bucket policy.**

The flow from courseware slide 26:

| Step | Content |
|---|---|
| 1 | The client requests a link to upload or download |
| 2 | The Amazon EC2 instance running the application generates a presigned URL |
| 3 | The presigned URL is returned — grants PUT or GET access, specifies an expiration, applies to a single object |
| 4 | The client GETs or PUTs the object |

What you specify when creating the URL:

| Item | Content |
|---|---|
| Credentials | An IAM user, an IAM instance profile, or AWS Security Token Service (AWS STS) |
| Bucket name | The target bucket |
| Object key | A single object |
| HTTP method | GET to download, PUT to upload, HEAD to read metadata, and so on |
| Expiration time interval | See [Section 4.2](#42-expiration-and-credential-types) |

There is one important property the courseware does not cover. **The credentials a presigned URL uses belong to the IAM principal that created it.** Anyone with valid credentials can create a presigned URL, but for the access to actually succeed, it must be created by someone who has permission to perform the operation the URL is based on. In other words, a presigned URL's capability is **limited to the permissions of the user who created it.**

- A presigned URL can be used **multiple times** until it expires, and S3 checks the expiration at the time of the HTTP request.
- You can restrict signature use with the `s3:signatureAge` condition key. 🆕
- Do not share your AWS credentials (secret access key ID) with others.

> — Source: [Sharing objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

### 4.2 Expiration and Credential Types 🆕

The courseware mentions only an "expiration date and time" and does not cover the caps or the early expiration that depends on the credential type.

| Creation path | Expiration you can set |
|---|---|
| Amazon S3 console | 1 minute to 12 hours |
| AWS CLI and SDKs | Up to 7 days |

| Credential type | Effective validity |
|---|---|
| IAM user credentials (SigV4) | Up to 7 days |
| Temporary security credentials | **The URL expires when those credentials expire** |
| STS `AssumeRole` session | 1 hour by default |
| EC2 instance profile metadata credentials | Up to about 6 hours |

So even if you pass 7 days to `--expires-in`, a URL signed with an instance profile becomes unusable well before that.

> — Source: [Sharing objects with presigned URLs — Expiration time for presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

### 4.3 Creating a Presigned URL with the AWS CLI 🔄

```console
>> aws s3 presign s3://notes-bucket/readme.txt --expires-in 3600
```

| Item | Content |
|---|---|
| Behavior | Generates a presigned URL for an S3 object. Anyone who receives the URL can retrieve the object **with an HTTP GET request** |
| Region | All presigned URLs now use SigV4, so **the Region must be configured explicitly** 🔄 |
| `--expires-in` default | 3,600 seconds |
| `--expires-in` maximum | 604,800 seconds (7 days) |

The example URL in the courseware instructor notes uses the `AWSAccessKeyId`, `Signature`, and `Expires` query parameters, which is the **Signature Version 2 form**. The query parameters in URLs the current CLI generates are as follows.

```text
https://notes-bucket.s3.us-west-2.amazonaws.com/readme.txt
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=...
  &X-Amz-Date=...
  &X-Amz-Expires=3600
  &X-Amz-SignedHeaders=host
  &X-Amz-Signature=...
```

One more thing to note: **`aws s3 presign` generates GET URLs only.** The courseware explains that presigned URLs are also used for PUT, but a PUT upload URL has to be created with an SDK rather than the CLI (for example, Boto3's `generate_presigned_url(ClientMethod='put_object')`).

> — Source: [aws s3 presign](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/presign.html)

### 4.4 Example: Creating a Presigned URL (Java)

There are three steps: (1) build a `GetObjectRequest` with the target bucket and object key, (2) create a `GetObjectPresignRequest` that specifies the signature duration and references the object request, and (3) generate the presigned URL with `S3Presigner`.

```java
// The S3 object request to presign for GET
GetObjectRequest objectRequest = GetObjectRequest.builder()
        .bucket("notes-bucket")
        .key(keyName)
        .build();
// The presign request object
GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(duration))
        .getObjectRequest(objectRequest)
        .build();
// The presigned GET object request URL
S3Presigner presigner = S3Presigner.create();
PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
URL url = presignedRequest.url();
```

The [AWS SDK for Java presigned URL example](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3-presign.html) cited in the courseware instructor notes still responds. Only URL reachability was checked; the content was not verified.

### 4.5 Example: Creating a Presigned URL (.NET, Python)

.NET:

```csharp
GetPreSignedUrlRequest request1 = new GetPreSignedUrlRequest
{
    BucketName = "notes-bucket",
    Key = objectKey,
    Expires = DateTime.UtcNow.AddHours(duration)
};
urlString = s3Client.GetPreSignedURL(request1);
```

Python:

```python
import boto3
url = boto3.client('s3').generate_presigned_url(
    ClientMethod='get_object',
    Params={'Bucket': 'notes-bucket', 'Key': 'OBJECT_KEY'},
    ExpiresIn=3600)
```

### 4.6 Product Demo

The demo items from courseware slide 30.

- Using the SDKs for CRUD operations
- Using the AWS CLI for presigned URLs and continuation tokens

---

## 5. Bulk Operations

### 5.1 Copy and Sync 🔄

The high-level `aws s3` commands automatically handle multipart uploads and clean up incomplete uploads.

```console
>> aws s3 cp ./aFile.txt s3://notes-bucket/docs/
>> aws s3 sync s3://notes-bucket s3://other-bucket --exclude "*another/*"
```

Uses for copy operations: copy a local or S3 object to another location / create a copy of an object / rename an object / move an object to another S3 location / update an object's metadata.

| Command | Note |
|---|---|
| `aws s3 cp ./aFile.txt s3://notes-bucket/docs/` | The trailing `/` is **required**. Without it the file is renamed to `docs` |
| Copying multiple files | Requires the `--recursive` parameter |

```console
>> aws s3 cp ./ s3://notes-bucket/ --recursive --exclude "*" --include "*.jpg" --include "*.txt"
```

This command includes all files by default, so to copy only a subset you exclude everything with `--exclude "*"` and then bring items back with `--include`.

How `aws s3 sync` behaves:

| Item | Content |
|---|---|
| Default behavior | Syncs a directory and an S3 prefix, **recursively** copying new and updated files from the source directory to the destination |
| Folder creation | Creates a folder in the destination only when it contains at least one file |
| How download candidates are determined | When the S3 object size differs from the local file, when the S3 object's last modified time is newer than the local file, or when the object is not in the local directory |
| `--exclude` / `--include` | `--exclude` excludes all files and objects matching the pattern, and `--include` brings matching items back from exclusion |
| `--delete` | Deletes files that are in the destination but not in the source 🆕 |
| `--storage-class` default | `STANDARD` |

> — Source: [aws s3 sync](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/sync.html)

#### The Storage Class Transition Example 🔄

The courseware instructor notes present "changing an object's storage class from Standard to Reduced Redundancy or the other way around" as the representative use of a copy operation. **AWS does not recommend using Reduced Redundancy Storage (RRS) today.**

| Item | Content |
|---|---|
| RRS (`REDUCED_REDUNDANCY`) | A class for noncritical, reproducible data stored with less redundancy than S3 Standard |
| AWS position | Not recommended. **S3 Standard is more cost-effective** |
| Durability | Designed for an expected annual average loss of 0.01% of objects |
| Requesting a lost object | Requesting a lost RRS object returns a **405 error** |
| Upload without a storage class | S3 Standard is applied |

The `/AmazonS3/latest/dev/ChgStoClsOfObj.html` path cited in the courseware is an older developer guide path, and it has since been consolidated into the user guide page below.

> — Source: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

### 5.2 Listing Buckets 🔄

`ListBuckets` returns a list of all buckets owned by the authenticated sender of the request and requires the `s3:ListAllMyBuckets` policy action. The courseware describes it as returning the whole list at once and provides only an example that iterates over the result, but **pagination exists today and its use is strongly recommended.**

| Item | Content |
|---|---|
| Recommendation | **Use only paginated `ListBuckets` requests** |
| Unpaginated requests | Supported only on AWS accounts set to the default general purpose bucket quota of 10,000. On accounts with an approved quota above 10,000, every unpaginated request is **rejected** |
| Request parameters | `bucket-region`, `continuation-token`, `max-buckets`, `prefix` |
| `max-buckets` valid range | 1 to 10000 |
| Default page size | If you specify `bucket-region`, `prefix`, or `continuation-token` without `max-buckets`, a page size of 10,000 applies and a continuation token is provided when more buckets exist |
| `Bucket` element in the response | `BucketArn`, `BucketRegion`, `CreationDate`, `Name` 🆕 |
| Directory buckets | Not supported |

> — Source: [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html)

The courseware Java example, `List<Bucket> buckets = s3.listBuckets();` with `b.getName()`, is SDK for Java 1.x syntax. In 2.x you use `buckets()` on the `listBuckets()` response, or `listBucketsPaginator()`. The 2.x `S3Client` provides `listBuckets`, `listBucketsPaginator`, `listObjectsV2`, `listObjectsV2Paginator`, `listObjectVersions`, `listObjectVersionsPaginator`, `listMultipartUploads`, `listMultipartUploadsPaginator`, `listParts`, `listPartsPaginator`, `headBucket`, and `headObject`. In other words, **there are paginator variants for both bucket listing and object listing.**

```java
// AWS SDK for Java 2.x. Paginated bucket listing.
ListBucketsRequest listRequest = ListBucketsRequest.builder()
        .maxBuckets(100)
        .build();
s3.listBucketsPaginator(listRequest).stream()
        .flatMap(page -> page.buckets().stream())
        .forEach(bucket -> System.out.println("* " + bucket.name()));
```

> — Source: [S3Client (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html)

.NET (the courseware example uses the synchronous `client.ListBuckets()`, corrected here to the asynchronous form):

```csharp
// Only asynchronous methods are supported on .NET Core / .NET Standard
ListBucketsResponse response = await client.ListBucketsAsync();
Console.WriteLine("Buckets owner - {0}", response.Owner.DisplayName);
foreach (S3Bucket bucket in response.Buckets)
{ Console.WriteLine("Bucket {0}, Created on {1}", bucket.BucketName, bucket.CreationDate);}
```

Python (same as the courseware):

```python
# Retrieve the list of existing buckets
response = s3.list_buckets()
# Print the bucket names
print('Existing buckets:')
for bucket in response['Buckets']:
    print(f'  {bucket["Name"]}')
```

> — Source: [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 5.3 Iterating Over Bucket Objects

Some AWS operations return results in a paginated form. A continuation token lets you process the next set of results. Listing the contents of an S3 bucket returns at most 1,000 objects at a time. With 1,001 objects you get a page listing the first 1,000, and you send a follow-up request with the continuation token to retrieve the next page.

An example `ListObjectsV2` response:

```http
HTTP/1.1 200 OK
x-amz-id-2: gyB+3jRPnr…
x-amz-request-id: 3B3C7C725673C630
Date: Sat, 30 Apr 2021 23:29:37 GMT
Content-Type: application/xml
Content-Length: length
Connection: close
Server: AmazonS3

<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<Name>bucket</Name>
<Prefix></Prefix>
<NextContinuationToken>1ueG…=</NextContinuationToken>
<KeyCount>1000</KeyCount>
<MaxKeys>1000</MaxKeys>
<IsTruncated>true</IsTruncated>
<Contents>
<Key>afile.mp3</Key>
...
```

A follow-up request using the continuation token:

```http
GET /?list-type=2 HTTP/1.1
GET /?list-type=2&continuation-token=1ueG...= HTTP/1.1
Host: bucket.s3.<Region>.amazonaws.com
Date: Mon, 02 May 2016 23:17:07 GMT
Authorization: authorization string
```

Values to watch in the response:

| Value | Meaning |
|---|---|
| `IsTruncated` | `true` indicates the response is incomplete and was truncated at the number of objects specified by `MaxKeys` |
| `ContinuationToken` | Included in the response when it was sent with the request |
| `NextContinuationToken` | Sent when `IsTruncated` is `true`. Use its value as the new continuation token in the next list request |

The request parameters for `ListObjectsV2` are `list-type=2`, `continuation-token`, `delimiter`, `encoding-type`, `fetch-owner`, `max-keys`, `prefix`, and `start-after`.

| Item | Content |
|---|---|
| `max-keys` | Sets the maximum number of keys returned in the response. Returns up to 1,000 by default and **never more** |
| `ContinuationToken` | An **obfuscated value**, not an actual key. Used for paginating list results 🆕 |
| `start-after` | Starts lexicographically after this string |
| Ordering | General purpose buckets return objects in **lexicographical order** by key name (directory buckets are not lexicographical) 🆕 |
| Exclusions | General purpose buckets do not return prefixes that relate only to in-progress multipart uploads 🆕 |

AWS recommends using this revised API (`ListObjectsV2`) for application development and continues to support the earlier `ListObjects` for backward compatibility. `ListObjects` uses `marker` instead of `continuation-token` for pagination and is not supported for directory buckets.

> — Source: [ListObjectsV2 API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html), [ListObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html)

### 5.4 Using a Paginator: Listing Objects 🔄

To retrieve all the data from a paginated response you could write a loop that makes multiple requests. With a paginator no extra loop is needed, because the AWS SDK abstracts the iteration over the full result set of a truncated API operation.

| What a paginator can access | Content |
|---|---|
| Response | Iterates over the full AWS response for the operation. All properties in the response are accessible |
| Key results | Unique to each operation. The properties most likely to be truncated because of length. For the `ListObjectsV2` paginator these are `S3Objects` and `CommonPrefixes` |

Java (same as the courseware):

```java
ListObjectsV2Request listReq = ListObjectsV2Request.builder()
        .bucket(bucketName).maxKeys(1).build();
ListObjectsV2Iterable listRes = s3.listObjectsV2Paginator(listReq);
// Process the response pages
listRes.stream()
        .flatMap(r -> r.contents().stream())
        .forEach(content -> System.out.println(" Key: " + content.key()));
```

.NET (same as the courseware):

```csharp
var listObjectsV2Paginator = client.Paginators.ListObjectsV2(new ListObjectsV2Request
{  BucketName = "lab2-notes-bucket" });
foreach (var s3Object in listObjectsV2Paginator.S3Objects)
{  Console.WriteLine(s3Object.Key); }
```

Python — the courseware example uses `client.get_paginator('list_objects')`, the **paginator for the v1 operation**. The Java and .NET examples on the same slide already use `ListObjectsV2`, so this is also an inconsistency across languages. Boto3 has `S3.Paginator.ListObjectsV2`, obtained with `client.get_paginator('list_objects_v2')`.

```python
# Use the list_objects_v2 paginator rather than v1
paginator = client.get_paginator('list_objects_v2')
page_iterator = paginator.paginate(Bucket='notes-bucket',
                                   PaginationConfig={'MaxItems': 10})
for page in page_iterator:
    print(page['Contents'])
```

`paginate()` accepts `Bucket`, `Delimiter`, `Prefix`, `FetchOwner`, `StartAfter`, and `PaginationConfig` (`MaxItems`, `PageSize`, `StartingToken`), among others. `MaxKeys` in the response returns up to 1,000 keys by default. `CommonPrefixes` is included in the response only when a delimiter is specified, and a group of keys rolled up under a common prefix **counts as one** toward the number returned. 🆕

> — Source: [S3.Paginator.ListObjectsV2 (Boto3)](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/paginator/ListObjectsV2.html)

### 5.5 Deleting Multiple Objects at Once: DeleteObjects 🆕

The courseware does not cover multi-object deletion or its limits. This is the API to know when you handle bulk cleanup without going as far as Batch Operations.

| Item | Content |
|---|---|
| Behavior | Deletes multiple objects from a bucket in a single HTTP request |
| Maximum keys per request | **1,000** |
| Input | Provide object key names in XML. To delete a specific version in a versioning-enabled bucket, provide the version ID as well |
| Response | Includes the deletion result (success or failure) for each key |
| Objects that do not exist | If an object specified in the request does not exist, S3 returns a result **as if it were deleted** |
| Response modes | `verbose` (default) and `quiet`. `quiet` returns only the keys that produced errors |
| MFA Delete | To delete a versioned object in a bucket with MFA Delete enabled you must include an MFA token; if it is missing or invalid, **the entire request fails** |

> — Source: [DeleteObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html)

### 5.6 S3 Batch Operations 🔄

S3 Batch Operations performs large-scale operations on Amazon S3 objects. A single job performs a **single operation** on a list of objects you specify, and one job can process **billions of objects containing exabytes of data**. You can use it from the console, the AWS CLI, the AWS SDKs, and the Amazon S3 REST API, and you can apply labels and control access.

The three stages on courseware slide 36:

| Stage | Content |
|---|---|
| Select objects | Specify the target objects with a manifest |
| Select the operation | Modify metadata and properties, copy between buckets, restore, replace tag sets, invoke a Lambda function, and so on |
| Track progress | Object-level progress / job notifications / completion report |

#### The Eleven Supported Operations 🔄

The courseware lists only seven (PUT object copy, initiate object restore, PUT object ACL, PUT object tagging, manage Object Lock retention date, manage Object Lock legal hold, invoke a custom Lambda operation). The current documentation lists eleven.

| Operation | In the courseware |
|---|---|
| Copy objects | Yes |
| Restore objects | Yes |
| Replace access control list (ACL) | Yes |
| Replace all object tags | Yes |
| S3 Object Lock retention | Yes |
| S3 Object Lock legal hold | Yes |
| Invoke AWS Lambda function | Yes |
| **Compute checksums** | No 🆕 |
| **Delete all object tags** | No 🆕 |
| **Update object encryption** | No 🆕 |
| **Replicate existing objects (Batch Replication)** | No 🆕 |

> — Source: [Operations supported by S3 Batch Operations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-operations.html)

#### The Four Ways to Specify a Manifest 🔄

The courseware offers only two: an Amazon S3 Inventory report or a custom CSV file. There are four today.

| Method | Content |
|---|---|
| Use an existing manifest | An inventory report or another manifest you already have |
| Create a new manifest file yourself | CSV. Each row contains the bucket name, object key, and optionally the object version. Object keys must be URL encoded |
| **Generate from metadata** | Batch Operations generates the object list based on the metadata you specify and saves it as a manifest file 🆕 |
| **Generate from a replication configuration** | The object list is generated automatically from an existing replication configuration 🆕 |

| Constraint | Content |
|---|---|
| Where the manifest is stored | Must be stored in a **general purpose bucket**. Batch Operations cannot read or store manifests in directory buckets (the objects described in the manifest may reside in a directory bucket) |
| Version IDs | If the manifest includes a version ID field, you must provide a version ID for **every** object |
| Job request elements | `Operation`, `Manifest`, `Priority`, `RoleArn`, and `Report` are required; `Tags` is optional |
| Completion report | Must be stored in a general purpose bucket and is **always encrypted with SSE-S3** 🆕 |

> — Source: [Creating an S3 Batch Operations job](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-create-job.html)

---

## 6. Static Website Hosting and CORS

### 6.1 Static Website Hosting 🔄

You can configure an S3 bucket as a static website. A static website contains static resources such as HTML and images but **no server-side processing or scripting.** Once configured, the site is available at the bucket's AWS Region-specific website endpoint.

The courseware presents this only as "website hosting plus public read access." The recommended path in the current documentation is different.

| Approach | Where the current documentation places it |
|---|---|
| **AWS Amplify Hosting** | The **first recommendation** for hosting static website content stored in S3. A fully managed service that deploys the site to a global CDN built on Amazon CloudFront; you select the object location in a general purpose bucket, it deploys to the managed CDN, and it **generates a public HTTPS URL** |
| CloudFront + OAC | **Required when the bucket is encrypted with SSE-KMS**, because SSE-KMS does not support anonymous users. Use **OAC (origin access control)** rather than OAI to protect the origin |
| S3 website endpoint | The approach the courseware presents. Does not support HTTPS or access points (see [Section 6.2](#62-website-endpoints)) |

The courseware instructor notes offer only CloudFront as the HTTPS alternative and do not cover the SSE-KMS bucket condition.

> — Source: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

The knowledge center article on [serving a static website with CloudFront](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/) cited in the courseware instructor notes still responds. Only URL reachability was checked.

### 6.2 Website Endpoints 🔄

The table on courseware slide 38 shows the endpoint as `https://[bucketname].s3-website-[Region].amazonaws.com`, but **the instructor notes on the same slide state that HTTPS is not supported, and slide 39 shows `http://`.** The courseware contradicts itself. The scheme in the official documentation is `http`, and there are two forms depending on the Region.

| Form | Example |
|---|---|
| Hyphen | `http://bucket-name.s3-website-Region.amazonaws.com` |
| Dot | `http://bucket-name.s3-website.Region.amazonaws.com` |

A website endpoint is **different** from the endpoint you send REST API requests to. The differences are as follows.

| Item | Website endpoint |
|---|---|
| HTTPS | **Not supported** |
| Access points | **Not supported** |
| Supported content | Publicly readable content only |
| Supported methods | **GET and HEAD requests on objects only** 🆕 |
| Error responses | Returned as HTML documents |
| Redirects | Supports object-level and bucket-level redirects |
| SSL connections | Not supported |
| Requester Pays buckets | Do not allow access through the website endpoint and return **403 Access Denied** 🆕 |

🆕 For added security, S3 website endpoint domains are registered on the Public Suffix List. If you need to set sensitive cookies, AWS recommends using `__Host-` prefixed cookies to defend against CSRF.

> — Source: [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)

### 6.3 How This Interacts with Block Public Access 🆕

Courseware slide 38 only states that "for the website to be publicly accessible, the bucket must allow public read access," and does not cover the defaults on new buckets or how they interact. **By default, new buckets, access points, and objects do not allow public access.**

| Setting | Effect |
|---|---|
| `BlockPublicAcls` | `PutBucketAcl`, `PutObjectAcl`, and `PutObject` requests that specify a public ACL fail. When applied at the account level, `PUT Bucket` requests that include a public ACL also fail |
| `IgnorePublicAcls` | Ignores public ACLs on buckets and objects |
| `BlockPublicPolicy` | Blocks bucket policies that allow public access |
| `RestrictPublicBuckets` | Restricts access to buckets that have a public policy |

| Item | Content |
|---|---|
| Levels it applies to | Organization, account, bucket, and access point |
| When settings differ across levels | **The most restrictive combination** applies |
| AWS recommendation | Enable **all four settings** on the account and on every bucket (AWS Security Hub foundational security best practice S3.8) |
| When public access is required, as with static website hosting | Adjust the individual settings |

In short, the courseware's "public read access" only holds if you deliberately turn off the defaults. To get HTTPS without turning them off, use the Amplify Hosting or CloudFront + OAC path in [Section 6.1](#61-static-website-hosting).

> — Source: [Blocking public access to your Amazon S3 storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)

### 6.4 Enabling Website Hosting 🔄

```console
>> aws s3 website s3://notes-bucket/ --index-document index.html --error-document error.html
```

The first sentence of the courseware instructor notes describes this as "the API-level `s3api` command," but **`website` belongs to the `aws s3` command set (high level).** The example command itself is correct. Note that custom commands such as `aws s3` do not support `--generate-cli-skeleton`, which illustrates the difference in nature between the two command sets.

| Item | Content |
|---|---|
| Syntax | `aws s3 website <S3Uri> [--index-document <value>] [--error-document <value>]` |
| `--index-document` | The suffix appended to a directory request at the website endpoint. **Must not be empty and cannot contain a slash** |
| `--error-document` | The object key name to use when a 4XX class error occurs |
| The resulting address in the documentation example | `http://amzn-s3-demo-bucket.s3-website-us-west-2.amazonaws.com` |
| Caution | Every file exposed on the static site **must be configured separately** so that visitors can open it |

> — Source: [aws s3 website](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/website.html)

### 6.5 Cross-Origin Resource Sharing CORS 🔄

CORS defines a way for client web applications loaded in one domain to interact with resources in another domain. Amazon S3 supports CORS, so you can build rich client-side web applications with S3 and **selectively** allow cross-origin access to your S3 resources.

The courseware example: when you host web fonts in an S3 bucket and a web page in an alternate domain wants to use them, the browser performs a CORS check before loading the page. If JavaScript on a page in one domain (`http://www.example.com`) tries to use resources in an S3 bucket through the `website.s3.amazonaws.com` endpoint, the browser allows that cross-domain access only if CORS is enabled on the bucket.

Two aspects of the behavior the courseware does not cover: 🆕

- When S3 receives a preflight request from a browser, it evaluates the bucket's CORS configuration and uses the **first `CORSRule`** that matches the incoming request to allow the cross-origin request. A rule matches when the request's `Origin` header matches `AllowedOrigins`, `Access-Control-Request-Method` matches `AllowedMethods`, and the headers in `Access-Control-Request-Headers` match `AllowedHeaders`.
- Enabling CORS on a bucket does not change the fact that **ACLs and policies still apply.**

S3 Object Lambda always adds the `"AllowedOrigins":"*"` header field to requests that come from a browser or that include an `Origin` header.

> — Source: [Using cross-origin resource sharing (CORS)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

#### Configuration Format: From XML to JSON 🔄

The courseware instructs you to "create a CORS configuration XML file" and provides only an XML example.

As recorded in the courseware (XML):

```text
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
  </CORSRule>
</CORSConfiguration>
```

Today, **configuring CORS in the S3 console requires JSON, and the new console supports only JSON CORS configurations.** Both JSON and XML examples are provided for the REST API and SDK paths. The same rule in JSON looks like this.

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"]
  }
]
```

| Element | Value |
|---|---|
| Maximum rules per configuration | **100** (matches the courseware). Added as the bucket's `cors` subresource |
| `AllowedMethods` | `GET`, `PUT`, `POST`, `DELETE`, `HEAD` |
| `AllowedOrigins` | An origin string can contain at most **one** wildcard `*` (for example, `http://*.example.com`). A single `*` allows all origins |
| `AllowedHeaders` | Can also contain at most one wildcard (for example, `x-amz-*`) |
| `ExposeHeaders` (optional) | Response headers to expose so the application can access them |
| `MaxAgeSeconds` (optional) | How many seconds the browser caches the preflight response |

The `/AmazonS3/latest/dev/cors.html` and `/AmazonS3/latest/dev/ManageCorsUsing.html` paths cited in the courseware are older developer guide paths and now redirect to the user guide paths.

> — Source: [Elements of a CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

### 6.6 Event Notification Triggers 🆕

The answer explanation for knowledge check 5 in the courseware describes event notifications only as a "response to Amazon S3 operations such as PUT, POST, COPY, or DELETE." The supported triggers today include **events that are not API calls.**

| Item | Content |
|---|---|
| Publishing destinations | Amazon SNS topic, Amazon SQS queue, AWS Lambda, Amazon EventBridge |
| Constraint | A single event notification can specify **only one destination type** |

Event types you can publish to SQS, SNS, and Lambda destinations:

| Event type | Trigger |
|---|---|
| `s3:TestEvent` | Configuration verification |
| `s3:ObjectCreated:*` | Put / Post / Copy / CompleteMultipartUpload |
| `s3:ObjectRemoved:*` | Delete / DeleteMarkerCreated |
| `s3:ObjectRestore:*` | Post / Completed / Delete |
| `s3:ReducedRedundancyLostObject` | Loss of an RRS object |
| `s3:Replication:*` | OperationFailedReplication / OperationMissedThreshold / OperationReplicatedAfterThreshold / OperationNotTracked |
| `s3:LifecycleExpiration:*` | Delete / DeleteMarkerCreated |
| `s3:LifecycleTransition` | Storage class transition |
| `s3:IntelligentTiering` | Tier movement |

Points to watch:

- **`ObjectRemoved` event notifications do not notify you about automatic deletions from a lifecycle configuration or about failed operations.** To catch lifecycle deletions, use `s3:LifecycleExpiration:*`.
- SNS FIFO and SQS FIFO queues are **not supported** as S3 event notification destinations. To send to an SQS FIFO queue, use EventBridge.
- Event notification messages can be up to 64 KB, so AWS recommends setting an SQS queue's `MaximumMessageSize` to at least 64 KB.
- EventBridge can only be enabled or disabled per bucket, and when enabled **all events are sent.**

> — Source: [Supported event destinations and event types](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html)

---

## 7. Changes from the Courseware

The following items in the courseware (instructor deck) differ from current behavior. Learners typically have the official courseware alongside this material, so what changed and why is recorded here.

### 7.1 Where the Courseware Is Factually Incorrect

| Item | Courseware states | Verified content | Source |
|---|---|---|---|
| Per-account bucket quota (slide 6) | "up to 100 by default, with an increase request up to 1,000" | The default quota is **10,000 general purpose buckets**, and anything beyond that is requested in the Service Quotas console. Commercial Region quotas are viewed and managed only in US East (N. Virginia) | [Bucket quotas and limitations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html) |
| Interpretation of HeadBucket 400 (slide 8) | Treats `case 400` as "attempted to access a bucket from a Region other than where it exists" | 400 is one of the general codes (400 / 403 / 404) returned when a bucket does not exist or access is denied. In fact, calling with a bucket name from another Region in the partition still returns the correct location header. The notes on slide 7 omit 400 entirely | [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html) |
| The bucket name `notes_bucket` (slide 11) | An underscore in `BucketName` in the .NET example | General purpose bucket names can use only lowercase letters, numbers, periods, and hyphens; **underscores are not allowed**. Buckets created after March 1, 2018 follow the same rules in all Regions | [Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| Versioning status "Disabled" (slide 13) | The skeleton output shows `"Status": "Disabled"` and `"MFADelete": "Disabled"` | The status values are only **`Enabled` and `Suspended`**. A bucket that has never been configured returns no status value. The field name is **`MfaDelete`**. `--generate-cli-skeleton output` produces an **empty template**, not a filled-in result | [PutBucketVersioning API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketVersioning.html) |
| "A waiter that waits until the bucket is terminated" (slide 12) | The instructor note wording | `bucket_exists` and `waitUntilBucketExists` wait **until the bucket exists**. The Boto3 `BucketExists` waiter polls `head_bucket` every 5 seconds and errors after 20 failed attempts. A translation error that also contradicts the slide title | [S3.Waiter.BucketExists](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/waiter/BucketExists.html) |
| Website endpoint scheme (slide 38) | The table shows `https://...s3-website-[Region]...` | The scheme in the official documentation is **`http`**. The notes on the same slide say HTTPS is not supported and slide 39 shows `http://`, so the courseware contradicts itself. There are two forms, hyphen and dot, depending on the Region | [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |
| "The API-level `s3api` command `website`" (slide 39) | The first sentence of the instructor notes | `website` belongs to the **`aws s3` command set (high level)**. The example command itself is correct | [aws s3 website](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/website.html) |
| Missing `break` in the `switch` statement (slide 8) | No `break` in `case 404` / `400` / `403` | A fall-through that prints all three messages on a 404 response. This is Java language behavior, so the code is corrected without citing AWS documentation | — (see [Section 7.5](#75-items-that-could-not-be-verified)) |
| Variable mismatch in the Python example (slide 20) | The argument is `bucket`, but the body passes an undefined `bucketname` and also mixes in `bucket.name` | An error in the courseware code itself. Rewritten against the client interface with consistent argument names | — (see [Section 7.5](#75-items-that-could-not-be-verified)) |
| Variable mismatch in the Object Lambda example (slide 24) | Declares `route` and `token`, then uses `request_route` and `request_token` | References undefined names, so it raises a `NameError` at runtime. Corrected to `RequestRoute=route` and `RequestToken=token` | — (see [Section 7.5](#75-items-that-could-not-be-verified)) |

### 7.2 Where Behavior or Defaults Changed

| Item | Courseware states | Current | Source |
|---|---|---|---|
| Maximum multipart object size | "< 5 TB" | The multipart upload limits page says **48.8 TiB**; the object upload page says **up to 50 TB** and "5 MB to 50 TB." The 5 GB single PUT limit still holds. For files above 5 TB the documentation points to the S3 Transfer Manager | [Multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) |
| `S3Region.EU` | `BucketRegion` in the .NET example | The `S3Region` field list in SDK for .NET V4 has no field consisting of the string `EU`; only Region-code fields such as `EUCentral1` and `EUWest1` exist. At the API level the `LocationConstraint` value `EU` is still valid (`eu-west-1`) | [Amazon.S3.S3Region fields](https://docs.aws.amazon.com/sdkfornet/v4/apidocs/items/S3/TS3Region.html) |
| `CannedACL = S3CannedACL.PublicRead` | Specifies a public-read canned ACL at bucket creation | Object Ownership defaults to Bucket owner enforced, so ACLs are disabled. A public ACL PUT fails with **400 `AccessControlListNotSupported`**. With account-level `BlockPublicAcls` enabled, the `PUT Bucket` request also fails | [Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html) |
| .NET synchronous methods | `client.PutBucket`, `GetObject`, `ListBuckets` | Targeting .NET Core or .NET Standard supports **asynchronous calls only**. Only builds targeting .NET Framework 4.7.2 support both | [.NET SDK supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html) |
| The static website hosting path | "Website hosting plus public read access" | New buckets block public access by default and AWS recommends enabling all four settings. The first recommended path is **AWS Amplify Hosting**, and SSE-KMS buckets **require CloudFront + OAC** | [Static website hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| CORS configuration format | "Create a CORS configuration XML file" | The console **requires JSON** (the new console supports JSON only). The REST API and SDK paths accept both JSON and XML. The 100-rule limit matches the courseware | [Elements of a CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html) |
| How `ListBuckets` returns results | Described as returning the whole list at once | It has `continuation-token`, `max-buckets` (1 to 10000), `bucket-region`, and `prefix` parameters, and AWS **strongly recommends using only paginated requests**. On accounts with a quota above 10,000, unpaginated requests are all rejected | [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html) |
| Supported Batch Operations | Seven | **Eleven.** Compute checksums, delete all object tags, update object encryption, and Batch Replication were added. Manifest specification also grew from two methods to **four** | [Operations supported by S3 Batch Operations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-operations.html) |
| Presigned URL query parameters | `AWSAccessKeyId`, `Signature`, `Expires` (the Signature Version 2 form) | All presigned URLs use **SigV4**. The parameters are `X-Amz-Algorithm`, `X-Amz-Credential`, `X-Amz-Date`, `X-Amz-Expires`, `X-Amz-SignedHeaders`, and `X-Amz-Signature`. `--expires-in` defaults to 3,600 seconds with a maximum of 604,800 | [aws s3 presign](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/presign.html) |
| Documentation link paths | `/AmazonS3/latest/dev/ChgStoClsOfObj.html`, `/dev/cors.html`, `/dev/ManageCorsUsing.html` | All redirect to user guide (`/userguide/`) paths. `ChgStoClsOfObj.html` is no longer a separate page; it was consolidated into `storage-class-intro.html` | [Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| Scope in the knowledge check 5 explanation | "In response to operations such as PUT, POST, COPY, or DELETE" | There are also **triggers that are not API calls**, including lifecycle expiration and transition, Intelligent-Tiering, replication, and restore. Conversely, lifecycle deletions do not raise `ObjectRemoved`, so `s3:LifecycleExpiration:*` is needed | [Event types and destinations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html) |

### 7.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| AWS SDK for Java 1.x (examples on slides 11, 21, 33) | **Reached end-of-support on December 31, 2025** | AWS SDK for Java 2.x (`software.amazon.awssdk`). Response header overrides become `GetObjectRequest.builder().responseContentDisposition(...)` | [Java SDK 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| S3 Object Lambda (slides 23, 24) | Since November 7, 2025, **available only to existing customers and a select group of APN partners**. No new features planned | The Dynamic Image Transformation for Amazon CloudFront solution / invoking Lambda through CloudFront, API Gateway, or function URLs / processing in the client | [Object Lambda availability change](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html) |
| Boto3 resources interface `s3.Object(...)` (slide 20) | No new features planned. Existing interfaces continue to operate | `boto3.client('s3').get_object(Bucket=..., Key=...)` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| `get_paginator('list_objects')` (slide 35) | The paginator for the v1 operation. The documentation recommends `ListObjectsV2` | `client.get_paginator('list_objects_v2')` | [ListObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html) |
| The Standard ↔ Reduced Redundancy transition example (slide 32) | RRS is not recommended. Designed for 0.01% expected annual loss, and requesting a lost object returns 405 | Stay on S3 Standard, or transition to Standard-IA or the Glacier classes | [Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 7.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| Multipart part limits | Part size 5 MiB to 5 GiB (no minimum for the last part), up to 10,000 parts per upload, 1,000 results each for `list parts` and `list multipart uploads` | [Multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) |
| Console upload ceiling | A single object of up to 160 GB through the Amazon S3 console | [Uploading objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) |
| S3 Transfer Manager | The high-level file and directory transfer utility in Java 2.x. Supports progress monitoring and pausing | [S3 Transfer Manager](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html) |
| Scope of `AbortIncompleteMultipartUpload` | Applies to both existing and new multipart uploads, and the cleanup incurs no early delete fee | [Deleting incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) |
| `GetObject` conditional reads and `partNumber` | `If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since` (412 / 304), ranged GET by part number, and the per-version permission `s3:GetObjectVersion` | [GetObject API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) |
| Java 2.x response header overrides | Set through `GetObjectRequest.Builder` methods such as `responseCacheControl` and `responseContentDisposition`, with no separate class | [GetObjectRequest.Builder](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/model/GetObjectRequest.Builder.html) |
| `DeleteObjects` | Deletes up to 1,000 keys in a single request. Supports `quiet` mode, and objects that do not exist are reported as deleted | [DeleteObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html) |
| Presigned URL expiration caps and permission inheritance | Console 1 minute to 12 hours, CLI and SDKs up to 7 days. A URL made with temporary credentials expires with them. Capability is **limited to the signer's permissions**. The `s3:signatureAge` condition key | [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) |
| Tagging a bucket at creation | `Tags` in `CreateBucketConfiguration`. Requires the `s3:TagResource` permission | [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) |
| `HeadBucket` response headers | `x-amz-bucket-region`, `x-amz-bucket-arn`, `x-amz-access-point-alias`, and others | [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html) |
| Batch Operations manifest generation | Generation from metadata and from a replication configuration. Manifests and completion reports are stored in general purpose buckets, and reports are always encrypted with SSE-S3 | [Creating a Batch Operations job](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-create-job.html) |
| Website endpoint constraints | GET and HEAD requests only, 403 for Requester Pays buckets, and the domain is registered on the Public Suffix List | [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |
| The four Block Public Access settings | `BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`. When levels differ, the most restrictive combination applies | [Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) |
| How CORS rules are evaluated | Only the **first** matching `CORSRule` applies, and enabling CORS does not stop ACLs and policies from applying | [CORS overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html) |
| `aws s3 sync --delete` | Deletes files present in the destination but not in the source. `--storage-class` defaults to `STANDARD` | [aws s3 sync](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/sync.html) |
| Scope of `--generate-cli-skeleton` | Three values: `input`, `yaml-input`, `output`. `output` cannot be YAML. Custom commands such as `aws s3` do not support it | [CLI skeletons](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-skeleton.html) |
| S3 changes in SDK for .NET V4 | `DoesS3BucketExist(Async)` removed, always SigV4 signing, a `us-east-1` client can no longer reach buckets in other Regions, `GetACL` and `PutACL` deprecated | [What's new in SDK for .NET V4](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-v4.html) |
| The Java 2.x paginator list | Paginator variants exist for both bucket listing and object listing (`listBucketsPaginator`, `listObjectsV2Paginator`, and others) | [S3Client (Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html) |
| Thread safety of Boto3 resources | Resource instances are not thread safe and must be created per thread. Waiters are available in the form `wait_until_exists()` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| `ListObjectsV2` behavior details | The continuation token is an obfuscated value, not an actual key. General purpose buckets return keys in lexicographical order | [ListObjectsV2 API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) |
| Scope of Object Lambda requests | LIST and HEAD can be transformed in addition to GET. Object Lambda Access Points are not supported for directory buckets | [Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html) |

### 7.5 Items That Could Not Be Verified

Recorded honestly. Confirm these before stating them definitively in class.

| Item | Status |
|---|---|
| Maximum object size (48.8 TiB vs 50 TB) | Two official pages state different units and values. The multipart upload limits page says 48.8 TiB; the object upload page says up to 50 TB and "5 MB to 50 TB." Which one is authoritative could not be determined from the documentation, so both values appear in the body with their respective sources. The only settled point is that the courseware's 5 TB differs from current documentation |
| The Java `switch` fall-through on slide 8 | The missing `break` makes the 404 branch fall through into the 400 and 403 branches. This is Java language behavior, not a fact to verify against AWS documentation. The body example adds `break` and carries no citation for it |
| Variable mismatch in the Python example on slide 20 | The function takes a `bucket` argument but the body mixes an undefined `bucketname` with `bucket.name`. This is an inconsistency in the courseware code itself, not something to verify against external documentation |
| Variable mismatch in the Object Lambda example on slide 24 | Declares `route` and `token`, then references `request_route` and `request_token`. Not a documentation matter for the same reason; only the variable names were made consistent |
| `get-bucket-location` returning `null` for `us-east-1` | That `us-east-1` is absent from the valid `LocationConstraint` values and that a bucket is created in `us-east-1` when it is unspecified were confirmed in the CreateBucket API documentation. The `null` return behavior itself was not confirmed in documentation (same as in M05). This needs runtime verification |
| The exact protection scope of MFA Delete | Two things were confirmed: enabling MFA Delete requires bucket owner permission and the `x-amz-mfa` header (PutBucketVersioning documentation), and deleting a versioned object in an MFA Delete bucket requires an MFA token (DeleteObjects documentation). The full protection scope behind the instructor note's "protect the bucket with MFA to prevent object deletion" was not separately confirmed against a dedicated page |
