# 모듈 6: 스토리지 작업 처리

## Developing on AWS (한국어)

---

## 목차

1. [모듈 개요](#1-모듈-개요)
2. [버킷 작업](#2-버킷-작업)
3. [객체 작업](#3-객체-작업)
4. [객체에 대한 임시 액세스 권한 부여](#4-객체에-대한-임시-액세스-권한-부여)
5. [대량 작업](#5-대량-작업)
6. [정적 웹 사이트 호스팅과 CORS](#6-정적-웹-사이트-호스팅과-cors)
7. [교재 대비 변경 사항](#7-교재-대비-변경-사항)

> **표기 설명**
>
> - 🆕 강의에서 다루지 않은 내용. AWS 공식 문서로 확인해 더한 항목입니다.
> - 🔄 강의 당시와 달라져 교정한 항목입니다. 무엇이 어떻게 달라졌는지는 [7장](#7-교재-대비-변경-사항)에 모아 두었습니다.
> - 검증일: 2026년 8월 30일. 이후 문서가 갱신될 수 있으니 시험·실무 적용 전에는 링크된 원문을 확인하세요.

---

## 1. 모듈 개요

### 모듈 목표

이 모듈을 마치면 다음을 수행할 수 있게 됩니다.

- 주요 버킷 및 객체 작업 수행
- 대용량 파일 및 대량 파일을 처리하는 방법 설명
- 정적 웹 사이트 호스팅을 위한 Amazon Simple Storage Service(Amazon S3) 버킷 생성
- 객체에 대한 임시 액세스 권한을 부여하는 방법 설명

### 이 모듈의 위치

| 구분 | 내용 |
|---|---|
| 모듈 5 | 스토리지 시작하기 — Amazon S3 기본 개념, SDK·AWS CLI 구성 |
| **모듈 6** | **스토리지 작업 처리** — 프로그래밍 방식으로 버킷·객체 작업, 대량 작업, 미리 서명된 URL, 정적 웹 사이트 호스팅 |
| 실습 2 | Amazon S3를 사용한 솔루션 개발 |

### 이 모듈에서 다루는 것

이전 모듈에서는 Amazon S3에 액세스하기 위해 SDK를 구성하고 서비스 클라이언트를 생성하는 방법을 배웠습니다. 이 모듈은 데이터 작업에 중점을 둡니다.

- 프로그래밍 방식으로 버킷을 생성하고 S3 객체에 대해 CRUD(create, read, update, delete) 작업 수행
- 대규모로 S3 객체를 관리하기 위한 배치 작업
- 미리 서명된 URL로 객체에 대한 임시 액세스 권한 제공
- 웹 사이트를 호스트하기 위한 버킷 구성
- Amazon S3 리소스에 대한 선택적 교차 오리진 액세스를 허용하도록 교차 오리진 리소스 공유(CORS) 설정

이 모듈에서 함께 등장하는 구성 요소로는 AWS Identity and Access Management(IAM), SDK, Amazon S3 작업과 권한 부여, 객체를 담는 버킷, 개발자와 사용자, 웹 사이트 엔드포인트가 있습니다.

---

## 2. 버킷 작업

### 2.1 버킷 작업의 종류와 구성 대상 🔄

AWS SDK 또는 AWS Command Line Interface(AWS CLI)가 구성되면 애플리케이션을 통해 Amazon S3에서 작업할 준비가 된 것입니다. 적절한 권한이 있으면 버킷을 **생성(Create), 나열(List), 삭제(Delete), 구성 업데이트**할 수 있습니다.

구성 대상: 암호화, 수명 주기, CORS, 버전 관리, 웹 사이트, 알림, 정책, 복제, 태그 지정 등.

| 유형 | 내용 |
|---|---|
| 권한 | 액세스 권한과 객체 소유권을 관리. **버킷 정책과 IAM 정책이 주 수단이고, ACL은 신규 버킷에서 기본 비활성화** 🔄 |
| 속성 | 버킷이 작동하고 객체를 관리하는 방식을 지정. 버전 관리 활성화, 이벤트 알림 설정, 로그, 웹 사이트 호스팅 등 |
| 관리 | 객체를 관리. 객체 복제 규칙으로 버킷 간 자동·비동기 복사, 수명 주기 규칙으로 스토리지 클래스 전환·아카이빙·지정 기간 후 삭제 |

권한 구성의 주 수단은 버킷 정책과 IAM 정책입니다. S3 Object Ownership의 기본값은 **버킷 소유자 적용(Bucket owner enforced)** 이고, 이 설정에서는 모든 ACL이 비활성화됩니다. 신규 생성 버킷은 ACL이 기본 비활성화이며, AWS는 개별 객체 단위 액세스 제어가 반드시 필요한 경우를 제외하면 ACL을 비활성화 상태로 유지하도록 권장합니다.

| Object Ownership 설정 | ACL |
|---|---|
| Bucket owner enforced (기본값) | 비활성화 |
| Bucket owner preferred | 활성화 |
| Object writer | 활성화 |

ACL이 비활성화된 버킷에서는 ACL을 지정하지 않은 PUT 또는 `bucket-owner-full-control` ACL을 지정한 PUT만 허용됩니다. 그 외 ACL을 포함한 PUT은 **HTTP 400 오류와 오류 코드 `AccessControlListNotSupported`** 로 실패합니다. ACL 읽기 요청은 계속 지원됩니다.

> — 출처: [Controlling ownership of objects and disabling ACLs for your bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)

### 2.2 버킷 생성과 계정당 버킷 한도 🔄

객체를 저장하고 사용하려면 버킷이 필요합니다. 버킷을 생성한 AWS 계정이 해당 버킷을 소유하며, **버킷을 만든 후에는 이름과 리전을 변경할 수 없습니다.**

버킷 개수에는 계정당 한도가 있고, 그 이상이 필요하면 증가를 요청합니다.

| 항목 | 현재 값 |
|---|---|
| 계정당 범용 버킷 기본 한도 | **10,000개** |
| 한도 증가 | Service Quotas 콘솔에서 요청 |
| 할당량 조회·관리 리전 | 상업 리전은 US East(N. Virginia)에서만, AWS GovCloud(US)는 AWS GovCloud(US-West)에서만 |
| 버킷 크기 상한 | 없음 |
| 버킷 내 객체 수 상한 | 없음 |
| 버킷 이름·리전 변경 | 생성 후 불가 |

> — 출처: [Bucket quotas, limitations, and restrictions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html)

버킷 생성은 세 단계로 진행합니다.

| 단계 | 내용 |
|---|---|
| 1 | 버킷 이름 및 AWS 리전을 결정 |
| 2 | `HeadBucket`으로 존재 여부를 확인한 뒤 버킷 생성 |
| 3 | 버킷 정보를 검색하여 버킷 생성을 확인 |

`CreateBucket`의 `LocationConstraint`는 버킷을 만들 리전을 지정합니다. 리전을 지정하지 않으면 버킷은 **US East(N. Virginia) 리전(`us-east-1`)** 에 생성되며, `LocationConstraint`의 유효값 목록에 `us-east-1`은 포함되어 있지 않습니다. 값 `EU`를 쓰면 `eu-west-1`에 생성됩니다. `LocationConstraint`는 디렉터리 버킷에서는 지원되지 않습니다. 🆕 `CreateBucketConfiguration`의 `Tags`로 버킷 생성 시 태그를 지정할 수 있고 이때 `s3:TagResource` 권한이 필요합니다.

따라서 `us-east-1`에 버킷을 만들 때는 `LocationConstraint`(위치 제약) 속성을 포함하지 않습니다.

> — 출처: [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html)

#### 버킷 이름 규칙 🔄

버킷 이름은 정해진 명명 규칙을 따라야 합니다. 예를 들어 `notes_bucket`처럼 밑줄이 들어간 이름은 허용되지 않습니다.

| 규칙 | 내용 |
|---|---|
| 길이 | 3~63자 |
| 사용 가능 문자 | 소문자, 숫자, 마침표(`.`), 하이픈(`-`). **밑줄(`_`)은 불가** |
| 시작·종료 | 문자 또는 숫자 |
| 과거 예외 | 2018년 3월 1일 이전 US East(N. Virginia)에서는 최대 255자·대문자·밑줄이 허용됨. 그 이후 신규 버킷은 다른 모든 리전과 같은 규칙 |
| 마침표 권장 사항 | 정적 웹 사이트 호스팅 전용 버킷을 제외하면 회피 권장(마침표가 있으면 HTTPS 가상 호스팅 스타일 주소 지정을 쓸 수 없음) |

> — 출처: [General purpose bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)

### 2.3 HeadBucket API 작업 🔄

`HeadBucket`은 버킷이 존재하는지, 그 버킷에 액세스할 권한이 있는지 확인합니다. 버킷에 대한 HTTP HEAD 요청이며 HTTP GET이 반환하는 헤더를 반환합니다.

| 응답 | 의미 |
|---|---|
| 200 OK | 버킷이 존재하고 액세스 권한이 있음 |
| 400 Bad Request / 403 Forbidden / 404 Not Found | 버킷이 없거나 권한이 없음. **메시지 본문이 없으므로 이 HTTP 응답 코드 외의 예외는 판별할 수 없음** |

400은 400·403·404 세 코드와 함께 버킷이 없거나 권한이 없을 때 반환되는 일반 코드 중 하나입니다. 400을 "다른 리전에서 버킷에 액세스하려 했음"으로만 해석해서는 안 됩니다. 오히려 **파티션 내 어떤 리전의 어떤 버킷 이름으로도 `HeadBucket`을 호출할 수 있으며, 버킷 정책과 무관하게 올바른 버킷 위치를 담은 응답 헤더를 받습니다.**

범용 버킷에서 `HeadBucket`은 `s3:ListBucket` 권한을 요구합니다. 응답 헤더에는 `x-amz-bucket-region`, `x-amz-bucket-arn`, `x-amz-access-point-alias` 등이 포함됩니다. 🆕

> — 출처: [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html)

Java의 `HeadBucket` 요청·응답 구문:

```text
요청 구문
HeadBucketRequest(String bucketName)

응답 구문
default HeadBucketResponse headBucket(HeadBucketRequest headBucketRequest)
throws NoSuchBucketException,
AwsServiceException,
SdkClientException,
S3Exception
```

### 2.4 예제: HeadBucket (Java) 🔄

아래 예제에서 두 가지에 주의합니다. 하나는 `case 400` 분기를 올바르게 해석하는 것이고([2.3절](#23-headbucket-api-작업)), 다른 하나는 `switch` 문의 각 `case`에 `break`를 넣어 404 응답에서 세 메시지가 모두 출력되는 fall-through를 막는 것입니다.

```java
public void bucketExisting(S3Client s3, String bucketName) {
    try {
        // 버킷이 존재하고 액세스 권한이 있는지 확인하기 위해 HeadBucket 요청 생성
        HeadBucketRequest request = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();
        HeadBucketResponse result = s3.headBucket(request);
        if (result.sdkHttpResponse().statusCode() == 200) {
            System.out.println("Bucket existing!");
        }
    }
    catch (AwsServiceException awsEx) {
        // 응답에 본문이 없으므로 상태 코드로만 구분한다.
        // 400·403·404 는 모두 "버킷이 없거나 권한이 없음" 을 뜻할 수 있다.
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

흐름은 이렇습니다. `HeadBucketRequest`를 버킷 이름으로 구축하고 → 결과를 캡처하고 → 예외를 검토합니다. 404 예외는 버킷이 존재하지 않음을 나타내므로, 그 경우 버킷을 생성할 수 있습니다.

> — 출처: [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html)

### 2.5 예제: HeadBucket (Python)

```python
def verifyBucketName(s3Client, bucket):
    try:
        # 버킷이 AWS에 이미 존재하는지 확인
        s3Client.head_bucket(Bucket=bucket)
        # 이전 명령이 성공하면 버킷이 존재하며 이를 관리할 권한이 있다
        raise SystemExit('This bucket has already been created')
    except botocore.exceptions.ClientError as e:
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            # 404 오류 코드를 받으면 해당 이름의 버킷이
            # AWS 내 어디에도 존재하지 않는다
            print('Existing Bucket Not Found, please proceed')
        if error_code == 403:
            # 403 오류 코드를 받으면 해당 이름의 버킷이
            # 다른 AWS 계정에 존재한다
            raise SystemExit('This bucket exists and you do not have permission to head it')
```

### 2.6 예제: HeadBucket (.NET)

`AmazonS3Util.DoesS3BucketExistV2Async`는 현재도 유효한 메서드입니다. AWS SDK for .NET 버전 4에서 항상 HTTP를 사용했던 `DoesS3BucketExist`와 `DoesS3BucketExistAsync`가 제거되었고, 그 대체가 `DoesS3BucketExistV2`·`DoesS3BucketExistV2Async`입니다.

```csharp
async Task VerifyBucketName(IAmazonS3 s3Client, string bucketName)
{
    bool exists = false;
    // AWS에 버킷이 이미 존재하는지 확인한다
    exists = await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, bucketName);
    if (exists)
    {
        // 버킷이 존재하면 true 를 반환한다. 다만
        // 그 버킷이 내 계정에 속한다는 의미는 아니다.
        Console.WriteLine("This bucket already exists in your, or someone else's, account.");
        Environment.Exit(0);
    }
    else
    {   Console.WriteLine("The bucket does not exist."); }
}
```

같은 문서에서 확인한 버전 4의 그 밖의 S3 변경 사항: 🆕

- `S3Region` 열거형에서 사용되지 않는 AWS 리전 식별자가 제거되었습니다.
- SDK가 항상 SigV4로 요청에 서명하며 `AWSConfigsS3.UseSignatureVersion4`와 `ClientConfig.SignatureVersion` 속성이 제거되었습니다.
- `us-east-1` 리전으로 구성된 S3 서비스 클라이언트는 더 이상 다른 리전의 버킷에 액세스할 수 없습니다.
- `AmazonS3Client`의 `GetACL`·`PutACL`이 사용되지 않음으로 표시되었고 `GetBucketACL`·`PutBucketACL`·`GetObjectACL`·`PutObjectACL`을 대신 사용합니다.

> — 출처: [What's new in AWS SDK for .NET version 4 — Changes specific to S3](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-v4.html)

### 2.7 버킷 생성 예제 🔄

Python:

```python
s3_client = boto3.client('s3', region_name=region)
location = {'LocationConstraint': region}
s3_client.create_bucket(Bucket=bucket_name, CreateBucketConfiguration=location)
```

Java — `doesBucketExistV2`, `new CreateBucketRequest(...)`, `new GetBucketLocationRequest(...)` 는 **AWS SDK for Java 1.x 문법**입니다. 1.x는 2025년 12월 31일 지원이 종료되었으므로 아래는 2.x 문법으로 작성합니다.

```java
// AWS SDK for Java 2.x. 요청 객체는 빌더로 만든다.
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

> — 출처: [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html), [S3Client (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html)

.NET — 버킷 생성 코드에서 흔히 마주치는 네 가지 문제와 그 해결입니다.

| 흔한 코드 | 문제 | 올바른 방식 |
|---|---|---|
| `BucketName = "notes_bucket"` | 밑줄은 버킷 이름에 쓸 수 없음 | `notes-bucket` |
| `BucketRegion = S3Region.EU` | SDK for .NET V4의 `S3Region` 필드 목록에 문자열 `EU` 하나로 된 필드가 없음. `EUCentral1`·`EUWest1` 처럼 리전 코드에 대응하는 필드만 있음 | `S3Region.EUWest1` 등 명시적 리전 필드 |
| `CannedACL = S3CannedACL.PublicRead` | 신규 버킷은 ACL이 기본 비활성화. 퍼블릭 ACL을 지정한 PUT은 실패 | ACL 없이 만들고 필요한 액세스는 버킷 정책·IAM 정책으로 부여 |
| `client.PutBucket(request)` | .NET Core·.NET Standard 대상에서는 비동기 호출만 지원 | `PutBucketAsync` |

S3 API 수준에서 `LocationConstraint` 값 `EU`는 여전히 유효하며 `eu-west-1`에 버킷을 만듭니다. 달라진 것은 .NET SDK의 열거형 필드입니다.

```csharp
AmazonS3Client client = new AmazonS3Client();
PutBucketRequest request = new PutBucketRequest
{
    BucketName = "notes-bucket",        // 밑줄 대신 하이픈
    BucketRegion = S3Region.EUWest1     // 명시적 리전 필드
    // ACL 은 지정하지 않는다. 액세스는 버킷 정책으로 부여한다.
};
PutBucketResponse response = await client.PutBucketAsync(request);
```

> — 출처: [Amazon.S3.S3Region fields](https://docs.aws.amazon.com/sdkfornet/v4/apidocs/items/S3/TS3Region.html), [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 2.8 버킷이 생성될 때까지 대기 🔄

버킷이 생성될 때까지 `HeadBucket`을 반복 호출할 수도 있고, waiter를 쓸 수도 있습니다. `bucket_exists`·`waitUntilBucketExists` waiter는 이름 그대로 **버킷이 존재할 때까지** 기다립니다.

boto3의 `S3.Waiter.BucketExists`는 `client.get_waiter('bucket_exists')`로 얻습니다.

| `WaiterConfig` | 기본값 |
|---|---|
| `Delay` (폴링 간격) | 5초 |
| `MaxAttempts` (최대 시도) | 20회 |

성공 상태에 도달할 때까지 `head_bucket()`을 5초마다 폴링하고, 20번 실패하면 오류를 발생시킵니다.

> — 출처: [S3.Waiter.BucketExists (Boto3)](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/waiter/BucketExists.html)

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

🆕 참고: boto3 리소스에도 waiter가 있어 `bucket.wait_until_exists()` 형태로 상태를 폴링할 수 있습니다. 다만 리소스 인스턴스는 스레드 안전하지 않으므로 스레드·프로세스 간에 공유하지 말고 각 스레드마다 새로 만들어야 합니다.

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 2.9 버킷 버전 관리 업데이트 🔄

버킷 구성은 버킷을 만든 뒤에도 변경할 수 있습니다. 아래는 버전 관리를 활성화하는 예제입니다.

```console
>> aws s3api get-bucket-versioning --bucket notes-bucket --generate-cli-skeleton output
>> aws s3api put-bucket-versioning --bucket notes-bucket --versioning-configuration Status=Enabled
>> aws s3api get-bucket-versioning --bucket notes-bucket
{
    "Status": "Enabled"
}
```

버전 관리 스켈레톤 출력을 `"Status": "Disabled"`, `"MFADelete": "Disabled"`로 오해하기 쉽지만, 다음 세 가지에 유의합니다.

| 흔한 오해 | 실제 동작 |
|---|---|
| `"Status": "Disabled"` | `PutBucketVersioning`이 받는 상태 값은 **`Enabled`와 `Suspended` 두 가지뿐**입니다. 버킷에 버전 관리 상태를 한 번도 설정하지 않았다면 상태가 없으며, `GetBucketVersioning` 요청은 **버전 관리 상태 값을 반환하지 않습니다** |
| `"MFADelete"` | 필드 이름은 **`MfaDelete`** 입니다 |
| 값이 채워진 스켈레톤 출력 | `--generate-cli-skeleton`은 명령이 지원하는 파라미터가 포함된 **빈 템플릿**을 생성해 표시합니다 |

| 버전 관리 상태 | 동작 |
|---|---|
| `Enabled` | 버킷에 추가되는 모든 객체에 고유한 버전 ID를 부여 |
| `Suspended` | 버전 관리를 비활성화. 이후 추가되는 객체는 버전 ID `null`을 받음 |

MFA Delete를 활성화하려면 **버킷 소유자여야 하고** `x-amz-mfa` 헤더와 함께 `Status`·`MfaDelete` 요청 요소를 모두 보내야 합니다. 버킷에 버전 관리를 처음 활성화하면 전파에 시간이 걸리므로 **15분 대기 후** 객체 쓰기(PUT·DELETE)를 하도록 권장합니다.

> — 출처: [PutBucketVersioning API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketVersioning.html)

#### `--generate-cli-skeleton` 사용 조건 🆕

| 값 | 내용 |
|---|---|
| `input` (기본값) | JSON 입력 파라미터 템플릿 |
| `yaml-input` | YAML 입력 파라미터 템플릿 |
| `output` | JSON 출력 파라미터 템플릿. **YAML로는 요청할 수 없음** |

`aws s3` 같은 사용자 지정(custom) AWS CLI 명령은 `--generate-cli-skeleton`과 `--cli-input-json`·`--cli-input-yaml`을 지원하지 않습니다. 위 버전 관리 예제처럼 `aws s3api` 명령에서는 사용할 수 있습니다. 스켈레톤은 CLI 파라미터 이름이 아니라 기반 API 파라미터 이름을 사용합니다.

> — 출처: [About AWS CLI skeletons and input files](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-skeleton.html)

---

## 3. 객체 작업

### 3.1 객체 작업의 종류

| 구분 | 작업 |
|---|---|
| 단일 작업 | 업로드, 나열, 다운로드, 복사, 이동, 이름 바꾸기, 삭제 |
| 대량 작업 | 복사, 동기화, 배치 |

객체 작업은 한 번에 하나씩 또는 배치로 실행할 수 있습니다. 암호화, 버전 관리, 수명 주기 같은 **버킷 속성에 유의**해야 합니다. 이러한 속성에는 추가 헤더 또는 하위 리소스 정보가 필요합니다. 예를 들어 기본적으로 GET 작업은 객체의 현재 버전을 반환하며, 다른 버전을 반환하려면 버전이 지정된 하위 리소스를 사용합니다.

### 3.2 객체 업로드: PUT 🔄

객체 업로드와 복사로 할 수 있는 일:

- 객체의 사본 생성
- 사본을 생성하고 원래 객체를 삭제하여 객체 이름 재지정
- 여러 Amazon S3 위치에 걸쳐 객체 이동
- 객체 메타데이터 업데이트

Amazon S3는 **강력한 쓰기 후 읽기 일관성**을 제공합니다. 새 객체를 성공적으로 쓴 후 또는 기존 객체를 덮어쓴 후, 후속 읽기 요청은 즉시 객체의 최신 버전을 수신합니다. 나열 작업에도 강력한 일관성을 제공합니다.

업로드 경로별 크기 상한은 다음과 같습니다.

| 경로 | 현재 상한 |
|---|---|
| 단일 PUT 작업 | 최대 **5GB** 객체 하나 |
| Amazon S3 콘솔 업로드 | 단일 객체 최대 **160GB** 🆕 |
| 멀티파트 업로드 API | 단일 대용량 객체 최대 **50TB**, 5MB~50TB 범위에 사용 |
| 5TB보다 큰 파일 | Java v1/v2, Python 또는 AWS CLI SDK의 **S3 Transfer Manager** 사용 🆕 |
| 멀티파트 권장 기준 | 객체 크기가 **100MB**에 도달하면 단일 작업 업로드 대신 멀티파트 업로드를 고려 |

🆕 객체를 업로드하면 기본적으로 **SSE-S3로 자동 암호화**됩니다.

> — 출처: [Uploading objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)

멀티파트 업로드의 이점과 그 근거는 다음과 같습니다.

| 이점 | 내용 |
|---|---|
| 처리량 개선 | 파트를 병렬로 업로드 |
| 신속한 복구 | 네트워크 문제가 생긴 파트만 재전송 |
| 일시 중지·재개 | 객체 업로드를 중단했다가 이어서 진행 |
| 크기를 몰라도 시작 | 객체의 최종 크기를 모르는 상태에서 업로드 시작 |

주의할 점:

- 멀티파트 업로드를 시작하면 **만료 시점이 없습니다.** 명시적으로 완료하거나 중지해야 하며, 그때까지 파트 스토리지 요금이 계속 발생합니다.
- 각 파트 업로드마다 **파트 번호와 `ETag` 값을 직접 기록**해 완료 요청에 포함해야 합니다. 문서는 `list-parts` 결과를 완료 요청에 사용하지 말고 직접 관리한 목록을 사용하라고 명시합니다. 🔄
- 멀티파트 업로드가 완료되면 파트가 하나의 `ETag`(체크섬의 체크섬)로 통합됩니다.

> — 출처: [Uploading and copying objects using multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)

불완전한 멀티파트 업로드를 정리하는 수명 주기 규칙:

| 항목 | 내용 |
|---|---|
| 작업 | `AbortIncompleteMultipartUpload` |
| 조건 | `DaysAfterInitiation`에 지정한 일수 내에 완료되지 않은 업로드가 중지 대상 |
| 동작 | Amazon S3가 업로드를 중지하고 관련 파트를 삭제 |
| 적용 범위 | **기존 멀티파트 업로드와 이후 생성되는 업로드 모두** 🆕 |
| 예외 | 규칙에 지정한 일수 내에 완료된 업로드에는 적용되지 않음 |
| 요금 | 객체를 삭제하지 않으며, 이 정리에는 **S3 Lifecycle 조기 삭제 요금이 발생하지 않음** 🆕 |

> — 출처: [Configuring a bucket lifecycle configuration to delete incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html)

### 3.3 멀티파트 업로드 한도 🆕

하위 수준 명령으로 직접 멀티파트 업로드를 구현할 때는 파트 크기와 파트 개수 한도를 알아야 합니다.

| 항목 | 값 |
|---|---|
| 최대 객체 크기 | 48.8TiB |
| 업로드당 최대 파트 수 | 10,000개 |
| 파트 번호 | 1~10,000 (포함) |
| 파트 크기 | 5MiB~5GiB. **마지막 파트에는 최소 크기 제한이 없음** |
| `list parts` 요청이 반환하는 최대 파트 수 | 1,000개 |
| `list multipart uploads` 요청이 반환하는 최대 업로드 수 | 1,000개 |
| 멀티파트 전환 권장 기준 | 객체 크기 100MB |

> — 출처: [Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html)

파트로 분할할 때 각 파트는 상한 5GiB뿐 아니라 **최소 5MiB** 조건도 지켜야 합니다(마지막 파트는 예외).

최대 객체 크기는 두 공식 페이지가 서로 다른 값을 제시합니다. 멀티파트 업로드 한도 페이지는 48.8TiB, 객체 업로드 페이지는 최대 50TB입니다. 어느 쪽이 정본인지는 문서로 판별하지 못했으므로 두 값을 각각의 출처와 함께 제시합니다([7.5절](#75-검증하지-못한-항목)).

### 3.4 하위 수준 명령을 사용한 멀티파트 업로드

하위 수준 명령으로 멀티파트 업로드를 수행하는 절차입니다.

| 단계 | 내용 |
|---|---|
| 1 | 파일을 파트로 분할 (파트 크기 5MiB~5GiB, 마지막 파트는 최소 제한 없음) 🔄 |
| 2 | `create-multipart-upload` 명령으로 업로드를 시작하고 `UploadID` 검색 |
| 3 | `upload-part` 명령으로 각 파트를 업로드하고 `ETag` 값을 받음 |
| 4 | `list-parts`로 업로드된 파트를 확인 (완료 요청에는 직접 기록한 목록을 사용) 🔄 |
| 5 | 파트 번호와 `ETag`를 단일 파일로 컴파일 |
| 6 | `complete-multipart-upload` 명령으로 업로드 완료 |

5단계의 `ETag` 파일 형식:

```json
{ "Parts": [{ "ETag": "123..", "PartNumber": 1 },
            { "ETag": "321..", "PartNumber": 2 }
] }
```

성공 응답:

```json
{
  "ETag": "\"anEtagForCompletedUpload\"",
  "Bucket": "notes-bucket",
  "Location": "https://notes-bucket.s3.amazonaws.com/large_file",
  "Key": "large_file"
}
```

AWS CLI로 멀티파트 업로드를 수행하는 지식 센터 문서도 참고할 수 있습니다: [Amazon S3 멀티파트 업로드(AWS CLI)](https://aws.amazon.com/premiumsupport/knowledge-center/s3-multipart-upload-cli/). URL 생존만 확인했고 내용은 검증하지 않았습니다.

### 3.5 상위 수준 전송: S3 Transfer Manager 🆕

상위 수준 전송 수단은 `aws s3 cp` 같은 CLI 명령뿐 아니라 SDK에도 있습니다. **Amazon S3 Transfer Manager**는 AWS SDK for Java 2.x의 오픈 소스 상위 수준 파일 전송 유틸리티로, 파일과 디렉터리를 Amazon S3로 전송하는 데 사용합니다.

| 항목 | 내용 |
|---|---|
| 기반 | AWS CRT 기반 S3 클라이언트 또는 멀티파트를 활성화한 표준 Java 기반 S3 비동기 클라이언트 |
| 얻는 것 | 멀티파트 업로드 API와 바이트 범위 페치 같은 성능 개선 |
| 기능 | 전송 진행 상황 실시간 모니터링, 나중에 실행하도록 일시 중지 |
| 의존성 | `software.amazon.awssdk:s3-transfer-manager` (CRT를 쓰려면 `software.amazon.awssdk.crt:aws-crt` 추가) |
| 생성 | `S3TransferManager.create()` 로 만들면 멀티파트 지원이 자동 활성화 |

> — 출처: [Transfer files and directories with the Amazon S3 Transfer Manager](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html)

### 3.6 데이터 검색: GET 및 HEAD

| 목적 | API |
|---|---|
| 객체 및 메타데이터 가져오기 | `GetObject` (바이트 범위를 반환하는 데에도 사용 가능) |
| 객체 메타데이터만 가져오기 | `HeadObject`, `GetObjectAcl`, `GetObjectTagging` |

단일 GET 요청으로 완전한 객체를 받을 수 있고, 필요한 바이트 범위만 지정해 일부분만 검색할 수도 있습니다. 네트워크 연결 상태가 좋지 않거나 애플리케이션이 객체 데이터의 하위 집합만 처리해야 하는 경우에 유용합니다. HEAD 요청은 GET과 동일한 방식으로 메타데이터 헤더를 반환하지만 객체 본문은 반환하지 않습니다.

`GetObject`의 요청 파라미터:

| 파라미터 | 내용 |
|---|---|
| `response-cache-control`, `response-content-disposition`, `response-content-encoding`, `response-content-language`, `response-content-type`, `response-expires` | 응답 헤더를 재정의 |
| `Range` | 지정한 바이트 범위를 다운로드. **한 GET 요청에서 여러 범위를 동시에 가져오는 것은 지원되지 않음** 🆕 |
| `partNumber` | 1~10,000의 양의 정수. 해당 파트에 대한 범위 GET 🆕 |
| `versionId` | 기본적으로 현재 버전을 반환하므로 다른 버전을 받으려면 이 하위 리소스를 사용. 헤더에 포함하면 **`s3:GetObjectVersion` 권한 필요** 🆕 |
| `If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since` | 조건부 읽기. 각각 412 Precondition Failed 또는 304 Not Modified 반환 🆕 |

> — 출처: [GetObject API — URI Request Parameters](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html)

### 3.7 예제: 객체 가져오기 (.NET) 🔄

`GetObject` 메서드로 버킷의 객체를 가져온 다음 `GetObjectResponse` 메서드 중 하나로 데이터 스트림을 처리합니다. 객체는 스트리밍되므로 네트워크 연결은 모든 데이터를 읽을 때까지 또는 입력 스트림을 닫을 때까지 계속 열려 있습니다.

동기 `client.GetObject(request)` 대신 비동기 메서드를 씁니다. **.NET Core(.NET Core 3.1, .NET 5, .NET 6 등)와 .NET Standard를 대상으로 하면 AWS 서비스 클라이언트가 비동기 호출 패턴만 지원**하므로 `GetObjectAsync`를 써야 합니다. 동기·비동기를 모두 지원하는 것은 .NET Framework 4.7.2 대상 빌드뿐이며, Portable Class Library와 Xamarin도 비동기만 지원합니다. `TransferUtility` 같은 상위 수준 추상화도 .NET Core 환경에서는 비동기만 지원합니다.

```csharp
GetObjectRequest request = new GetObjectRequest
{  BucketName = "SampleBucket",
   Key = "Item1" };
// .NET Core / .NET Standard 대상에서는 비동기 메서드만 지원한다
using (GetObjectResponse response = await client.GetObjectAsync(request))
{   // 객체를 로컬 파일에 저장
    await response.WriteResponseStreamToFileAsync("Item1.txt", false, default);  }
```

> — 출처: [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 3.8 예제: 객체 가져오기 (Python) 🔄

객체를 가져올 때 boto3의 **리소스 인터페이스**(`s3.Object(...)`) 대신 클라이언트 인터페이스를 씁니다. AWS Python SDK 팀은 boto3 리소스 인터페이스에 **새 기능을 추가할 계획이 없습니다.** 기존 인터페이스는 boto3 수명 주기 동안 계속 동작하지만 최신 서비스 기능은 클라이언트 인터페이스를 통해 제공됩니다. 신규 코드는 `boto3.client('s3')` 기준으로 작성합니다.

```python
def get_object(s3_client, bucket, object_key):
    try:
        # 클라이언트 인터페이스로 객체를 가져온다
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

> — 출처: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 3.9 예제: 응답 헤더 재정의 (Java) 🔄

객체를 가져올 때 응답 헤더의 몇몇 측면을 재정의할 수 있습니다. 예를 들어 단일 객체의 `Content-Disposition` 헤더를 호출자마다 다른 파일 이름으로 보이도록 동적으로 변경할 수 있습니다.

`ResponseHeaderOverrides` 클래스와 `new GetObjectRequest(bucketName, key).withResponseHeaders(...)` 는 **AWS SDK for Java 1.x 문법**입니다. 2.x의 `GetObjectRequest.Builder`는 응답 헤더 재정의를 별도 클래스가 아니라 **요청 빌더의 메서드**로 제공합니다: `responseCacheControl`, `responseContentDisposition`, `responseContentEncoding`, `responseContentLanguage`, `responseContentType`, `responseExpires`, 그리고 `range`, `versionId`, `ifMatch`, `ifNoneMatch`, `ifModifiedSince`, `ifUnmodifiedSince`, `partNumber`, `checksumMode`.

```java
// AWS SDK for Java 2.x. 응답 헤더 재정의는 요청 빌더의 메서드로 지정한다.
GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .responseCacheControl("No-cache")
        .responseContentDisposition("attachment; filename=example.txt")
        .build();
ResponseInputStream<GetObjectResponse> objectStream = s3Client.getObject(getObjectRequest);
displayTextInputStream(objectStream);
```

> — 출처: [GetObjectRequest.Builder (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/model/GetObjectRequest.Builder.html)

### 3.10 객체 메타데이터만 가져오기: HeadObject

`HeadObject` 작업은 객체에서 메타데이터를 검색하되 객체 자체는 반환하지 않습니다.

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

요청이 오류를 생성하는 경우 404 Not Found 또는 403 Forbidden 코드를 반환합니다.

### 3.11 Amazon S3 Object Lambda 🔄

S3 Object Lambda로 Amazon S3 **GET, LIST, HEAD** 요청에 자체 코드를 추가해 애플리케이션에 반환되는 데이터를 수정·처리할 수 있습니다. 세 가지 요청 유형 모두에 적용됩니다.

| 요청 | 할 수 있는 일 |
|---|---|
| GET | 행 필터링, 동적 이미지 크기 조정·워터마킹, 대외비 데이터 교정 |
| LIST | 출력을 수정해 버킷 객체의 커스텀 뷰 생성 |
| HEAD | 객체 이름·크기 같은 메타데이터 수정 |

Lambda 함수를 구성한 뒤 **Object Lambda Access Point**에 연결하며, 이 액세스 포인트는 지원 액세스 포인트(supporting access point)를 통해 데이터에 접근합니다. Object Lambda Access Point는 디렉터리 버킷에서 지원되지 않습니다.

> — 출처: [Transforming objects with S3 Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html)

#### 가용성 변경 🔄

S3 Object Lambda는 **2025년 11월 7일부터 신규 고객에게는 열려 있지 않습니다.**

| 항목 | 내용 |
|---|---|
| 사용 가능 대상 | 현재 이 서비스를 사용 중인 **기존 고객**과 일부 선정된 AWS Partner Network(APN) 파트너 |
| 기존 고객 | 계속 사용할 수 있음. APN 파트너 솔루션을 사용·배포하는 고객도 계속 사용 가능 |
| 로드맵 | 보안·가용성 개선은 우선 처리하지만 **새 기능 도입 계획 없음** |
| 대안 | Dynamic Image Transformation for Amazon CloudFront 솔루션 / CloudFront·API Gateway·함수 URL 등으로 AWS Lambda 호출 / 클라이언트 애플리케이션에서 데이터 처리 |
| 데이터 마이그레이션 | 모든 대안이 계속 Amazon S3를 기반 스토리지로 사용하므로 필요하지 않음 |

즉 개념 이해를 위해서는 계속 다룰 가치가 있지만, **신규 설계의 권장 경로로 제시하면 안 됩니다.**

> — 출처: [Amazon S3 Object Lambda availability change](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html)

### 3.12 예제: S3 Object Lambda (Python) 🔄

아래 예제에서 주의할 점은 변수 이름 일치입니다. `route`·`token`으로 선언한 변수를 `write_get_object_response` 호출에서 그대로 `RequestRoute=route`, `RequestToken=token`으로 넘겨야 합니다. 선언한 이름과 다른 이름(`request_route` 등)을 참조하면 실행 시 `NameError`가 발생합니다.

```python
import boto3
import requests

def lambda_handler(event, context):
    print(event)
    get_context = event["getObjectContext"]
    route = get_context["outputRoute"]
    token = get_context["outputToken"]
    s3_url = get_context["inputS3Url"]
    # S3에서 객체 가져오기
    response = requests.get(s3_url)
    original_object = response.content.decode('utf-8')
    # 객체 변환
    transformed_object = original_object.upper()
    # S3 Object Lambda에 객체 다시 쓰기 (선언한 변수 이름을 그대로 사용)
    s3 = boto3.client('s3')
    s3.write_get_object_response(
        Body=transformed_object,
        RequestRoute=route,
        RequestToken=token)
    return {'status_code': 200}
```

S3 Object Lambda 발표 블로그도 참고할 수 있습니다: [Introducing Amazon S3 Object Lambda](https://aws.amazon.com/blogs/aws/introducing-amazon-s3-object-lambda-use-your-code-to-process-data-as-it-is-being-retrieved-from-s3/). URL 생존만 확인했습니다.

> — 출처: [Transforming objects with S3 Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html)

---

## 4. 객체에 대한 임시 액세스 권한 부여

### 4.1 미리 서명된 URL 🔄

모든 객체와 버킷은 기본적으로 프라이빗입니다. AWS 보안 인증이나 권한이 없는 사용자가 특정 객체를 검색(GET)하거나 버킷에 업로드(PUT)할 수 있게 하려면 미리 서명된 URL이 유용합니다. **버킷 정책을 변경하지 않고** 객체에 시간 제한 액세스를 부여합니다.

미리 서명된 URL의 발급·사용 흐름입니다.

```text
                    ① 링크 요청
   ┌──────────┐  ────────────────▶  ┌────────────────────────┐
   │  클라이언트  │                     │  애플리케이션 (EC2 등)      │
   │          │  ◀────────────────  │  IAM 자격 증명으로          │
   └────┬─────┘   ③ 미리 서명된 URL 반환 │  미리 서명된 URL 생성 ②     │
        │         (PUT/GET, 만기,       └────────────────────────┘
        │          단일 객체)
        │  ④ 미리 서명된 URL로 직접 GET/PUT
        └────────────────────────────────────▶  ┌──────────────┐
                                                 │  Amazon S3    │
                                                 │  대상 객체     │
                                                 └──────────────┘
```

URL을 만들 때 지정하는 것:

| 항목 | 내용 |
|---|---|
| 보안 인증정보 | IAM 사용자, IAM 인스턴스 프로파일, AWS Security Token Service(AWS STS) |
| 버킷 이름 | 대상 버킷 |
| 객체 키 | 단일 객체 |
| HTTP 메서드 | 다운로드는 GET, 업로드는 PUT, 메타데이터 읽기는 HEAD 등 |
| 만료 시간 간격 | 아래 [4.2절](#42-만료-기간과-자격-증명-유형) 참조 |

여기에 중요한 성질이 하나 있습니다. **미리 서명된 URL이 사용하는 보안 인증은 그 URL을 생성한 IAM 주체의 것입니다.** 유효한 보안 인증을 가진 누구나 미리 서명된 URL을 만들 수 있지만, 실제로 액세스가 성공하려면 그 URL이 기반한 작업을 수행할 권한이 있는 사람이 만들어야 합니다. 즉 미리 서명된 URL의 기능은 **그것을 만든 사용자의 권한으로 제한됩니다.**

- 미리 서명된 URL은 만료 전까지 **여러 번 사용할 수 있고**, S3는 HTTP 요청 시점에 만료 시각을 확인합니다.
- `s3:signatureAge` 조건 키로 서명 사용을 제한할 수 있습니다. 🆕
- 다른 사용자와 AWS 보안 인증정보(비밀 액세스 키 ID)를 공유하지 마십시오.

> — 출처: [Sharing objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

### 4.2 만료 기간과 자격 증명 유형 🆕

만료 기간에는 생성 경로별 상한이 있고, 서명에 쓴 자격 증명 유형에 따라 URL이 더 일찍 만료될 수 있습니다.

| 생성 경로 | 설정 가능한 만료 기간 |
|---|---|
| Amazon S3 콘솔 | 1분 ~ 12시간 |
| AWS CLI·SDK | 최대 7일 |

| 자격 증명 유형 | 실제 유효 기간 |
|---|---|
| IAM 사용자 자격 증명 (SigV4) | 최대 7일 |
| 임시 보안 인증 | **그 자격 증명이 만료될 때 URL도 함께 만료됨** |
| STS `AssumeRole` 세션 | 기본 1시간 |
| EC2 인스턴스 프로파일 메타데이터 자격 증명 | 최대 약 6시간 |

즉 `--expires-in`에 7일을 넣어도, 인스턴스 프로파일로 서명했다면 URL은 그보다 훨씬 먼저 쓸 수 없게 됩니다.

> — 출처: [Sharing objects with presigned URLs — Expiration time for presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

### 4.3 AWS CLI로 미리 서명된 URL 생성 🔄

```console
>> aws s3 presign s3://notes-bucket/readme.txt --expires-in 3600
```

| 항목 | 내용 |
|---|---|
| 동작 | S3 객체에 대한 미리 서명된 URL을 생성. 이 URL을 받은 누구나 **HTTP GET 요청으로** 객체를 가져올 수 있음 |
| 리전 | 모든 미리 서명된 URL이 SigV4를 사용하므로 **리전을 명시적으로 구성해야 함** 🔄 |
| `--expires-in` 기본값 | 3600초 |
| `--expires-in` 최대값 | 604800초(7일) |

`AWSAccessKeyId`, `Signature`, `Expires` 쿼리 파라미터를 사용하는 것은 **서명 버전 2 형태**입니다. 현재 CLI가 만드는 URL은 SigV4를 사용하며 쿼리 파라미터가 다음과 같습니다.

```text
https://notes-bucket.s3.us-west-2.amazonaws.com/readme.txt
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  &X-Amz-Credential=...
  &X-Amz-Date=...
  &X-Amz-Expires=3600
  &X-Amz-SignedHeaders=host
  &X-Amz-Signature=...
```

또 하나 주의할 점은 **`aws s3 presign`은 GET용 URL만 생성한다**는 것입니다. 미리 서명된 URL은 PUT에도 쓰이지만, PUT 업로드 URL은 CLI가 아니라 SDK로 만들어야 합니다(예: boto3의 `generate_presigned_url(ClientMethod='put_object')`).

> — 출처: [aws s3 presign](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/presign.html)

### 4.4 예제: 미리 서명된 URL 생성 (Java)

세 단계로 만듭니다. ① 대상 버킷과 객체 키로 `GetObjectRequest` 빌드 ② 서명 기간을 지정하고 객체 요청을 참조하는 `GetObjectPresignRequest` 생성 ③ `S3Presigner`로 미리 서명된 URL 생성.

```java
// GET을 위해 미리 서명할 S3 객체 요청
GetObjectRequest objectRequest = GetObjectRequest.builder()
        .bucket("notes-bucket")
        .key(keyName)
        .build();
// 사전 서명 요청 객체
GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(duration))
        .getObjectRequest(objectRequest)
        .build();
// 미리 서명된 GET 객체 요청 URL
S3Presigner presigner = S3Presigner.create();
PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
URL url = presignedRequest.url();
```

더 많은 예제는 [AWS SDK for Java 미리 서명된 URL 예제](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3-presign.html) 문서를 참고할 수 있습니다. URL 생존만 확인했고 내용은 검증하지 않았습니다.

### 4.5 예제: 미리 서명된 URL 생성 (.NET, Python)

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

### 4.6 실습으로 확인하기

이 모듈의 내용은 다음 두 갈래로 직접 다뤄 보면 이해가 굳어집니다.

- CRUD 작업에 SDK 사용
- 미리 서명된 URL 및 연속 토큰에 AWS CLI 사용

---

## 5. 대량 작업

### 5.1 복사와 동기화 🔄

상위 수준 `aws s3` 명령은 멀티파트 업로드와 완료되지 않은 업로드 정리를 자동으로 처리합니다.

```console
>> aws s3 cp ./aFile.txt s3://notes-bucket/docs/
>> aws s3 sync s3://notes-bucket s3://other-bucket --exclude "*another/*"
```

복사 작업의 용도: 로컬 객체 또는 S3 객체를 다른 위치에 복사 / 객체의 사본 생성 / 객체 이름 바꾸기 / 객체를 다른 S3 위치로 이동 / 객체의 메타데이터 업데이트.

| 명령 | 유의 사항 |
|---|---|
| `aws s3 cp ./aFile.txt s3://notes-bucket/docs/` | 마지막 `/`는 **필수**입니다. 누락되면 파일 이름이 `docs`로 바뀝니다 |
| 여러 파일 복사 | `--recursive` 파라미터가 필요합니다 |

```console
>> aws s3 cp ./ s3://notes-bucket/ --recursive --exclude "*" --include "*.jpg" --include "*.txt"
```

이 명령은 기본적으로 모든 파일을 포함하므로, 하위 집합만 복사하려면 `--exclude "*"`로 전부 제외한 다음 `--include`로 되돌립니다.

`aws s3 sync`의 동작:

| 항목 | 내용 |
|---|---|
| 기본 동작 | 디렉터리와 S3 접두사를 동기화. 소스 디렉터리의 새 파일과 갱신된 파일을 대상으로 **재귀적으로** 복사 |
| 폴더 생성 | 대상에 하나 이상의 파일이 포함된 경우에만 폴더를 만듦 |
| 다운로드 대상 판단 | S3 객체 크기가 로컬 파일과 다르거나, S3 객체의 마지막 수정 시각이 로컬 파일보다 최신이거나, 로컬 디렉터리에 객체가 없을 때 |
| `--exclude` / `--include` | `--exclude`는 패턴과 일치하는 파일·객체를 제외하고, `--include`는 일치하는 항목을 제외 대상에서 되돌림 |
| `--delete` | 대상에만 있고 소스에 없는 파일을 삭제 🆕 |
| `--storage-class` 기본값 | `STANDARD` |

> — 출처: [aws s3 sync](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/sync.html)

#### 스토리지 클래스 전환 예시 🔄

복사 작업의 대표 활용으로 스토리지 클래스 전환을 꼽지만, 그 대상으로 Reduced Redundancy Storage(RRS)를 쓰는 것은 권장되지 않습니다. **현재 AWS는 RRS 사용을 권장하지 않습니다.**

| 항목 | 내용 |
|---|---|
| RRS(`REDUCED_REDUNDANCY`) | S3 Standard보다 낮은 중복성으로 저장하는 비중요·재생성 가능 데이터용 클래스 |
| AWS 입장 | 사용하지 않도록 권장. **S3 Standard가 더 비용 효율적** |
| 내구성 | 연간 평균 객체 0.01% 손실 예상 |
| 손실 후 요청 | 손실된 RRS 객체를 요청하면 **405 오류** 반환 |
| 스토리지 클래스 미지정 업로드 | S3 Standard가 적용됨 |

스토리지 클래스 관련 내용은 아래 사용자 안내서 페이지로 통합되어 있습니다.

> — 출처: [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)

### 5.2 버킷 나열 🔄

`ListBuckets`는 요청을 보낸 인증된 발신자가 소유한 모든 버킷의 목록을 반환하며 `s3:ListAllMyBuckets` 정책 작업이 필요합니다. 전체 목록을 한 번에 반환한다고 여기기 쉽지만, **`ListBuckets`에는 페이지 매김이 있고 그 사용이 강력히 권장됩니다.**

| 항목 | 내용 |
|---|---|
| 권장 사항 | **페이지 매김된 `ListBuckets` 요청만 사용** |
| 페이지 매김 없는 요청 | 범용 버킷 기본 할당량 10,000으로 설정된 계정에서만 지원. 승인된 할당량이 10,000을 초과하는 계정에서는 **모두 거부됨** |
| 요청 파라미터 | `bucket-region`, `continuation-token`, `max-buckets`, `prefix` |
| `max-buckets` 유효 범위 | 1~10000 |
| 기본 페이지 크기 | `bucket-region`·`prefix`·`continuation-token`을 `max-buckets` 없이 지정하면 10,000이 적용되고, 버킷이 더 있으면 연속 토큰을 제공 |
| 응답의 `Bucket` 요소 | `BucketArn`, `BucketRegion`, `CreationDate`, `Name` 🆕 |
| 디렉터리 버킷 | 지원되지 않음 |

> — 출처: [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html)

`List<Bucket> buckets = s3.listBuckets();` 와 `b.getName()` 은 SDK for Java 1.x 문법입니다. 2.x에서는 `listBuckets()` 응답의 `buckets()` 를 사용하거나 `listBucketsPaginator()` 를 사용합니다. 2.x의 `S3Client`는 `listBuckets`·`listBucketsPaginator`·`listObjectsV2`·`listObjectsV2Paginator`·`listObjectVersions`·`listObjectVersionsPaginator`·`listMultipartUploads`·`listMultipartUploadsPaginator`·`listParts`·`listPartsPaginator`·`headBucket`·`headObject` 를 제공합니다. 즉 **버킷 나열과 객체 나열 모두에 paginator 변형이 있습니다.**

```java
// AWS SDK for Java 2.x. 페이지 매김된 버킷 나열
ListBucketsRequest listRequest = ListBucketsRequest.builder()
        .maxBuckets(100)
        .build();
s3.listBucketsPaginator(listRequest).stream()
        .flatMap(page -> page.buckets().stream())
        .forEach(bucket -> System.out.println("* " + bucket.name()));
```

> — 출처: [S3Client (AWS SDK for Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html)

.NET(동기 `client.ListBuckets()` 대신 비동기 메서드 사용):

```csharp
// .NET Core / .NET Standard 대상에서는 비동기 메서드만 지원한다
ListBucketsResponse response = await client.ListBucketsAsync();
Console.WriteLine("Buckets owner - {0}", response.Owner.DisplayName);
foreach (S3Bucket bucket in response.Buckets)
{ Console.WriteLine("Bucket {0}, Created on {1}", bucket.BucketName, bucket.CreationDate);}
```

Python:

```python
# 기존 버킷의 목록을 검색
response = s3.list_buckets()
# 버킷 이름을 출력
print('Existing buckets:')
for bucket in response['Buckets']:
    print(f'  {bucket["Name"]}')
```

> — 출처: [AWS SDK for .NET supported platforms](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html)

### 5.3 버킷 객체에 대한 반복 요청

일부 AWS 작업은 결과를 페이지 매김 형식으로 반환합니다. 연속 토큰을 사용하면 다음 결과 집합을 처리할 수 있습니다. S3 버킷의 콘텐츠를 나열하면 한 번에 최대 1,000개의 객체가 반환됩니다. 객체가 1,001개면 처음 1,000개가 나열된 페이지를 얻고, 다음 페이지를 검색하려면 연속 토큰으로 후속 요청을 전송합니다.

`ListObjectsV2` 응답 예:

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

연속 토큰을 사용한 후속 요청:

```http
GET /?list-type=2 HTTP/1.1
GET /?list-type=2&continuation-token=1ueG...= HTTP/1.1
Host: bucket.s3.<Region>.amazonaws.com
Date: Mon, 02 May 2016 23:17:07 GMT
Authorization: authorization string
```

응답에서 주의할 값:

| 값 | 의미 |
|---|---|
| `IsTruncated` | `true`면 응답이 불완전하고 `MaxKeys`에 지정된 객체 수로 잘렸음을 나타냄 |
| `ContinuationToken` | 요청과 함께 전송된 경우 응답에 포함됨 |
| `NextContinuationToken` | `IsTruncated`가 `true`인 경우 전송됨. 다음 나열 요청에서 새 연속 토큰의 값으로 사용 |

`ListObjectsV2`의 요청 파라미터는 `list-type=2`, `continuation-token`, `delimiter`, `encoding-type`, `fetch-owner`, `max-keys`, `prefix`, `start-after` 입니다.

| 항목 | 내용 |
|---|---|
| `max-keys` | 응답에 반환되는 최대 키 수. 기본적으로 최대 1,000개를 반환하고 **그보다 많이 반환하지 않음** |
| `ContinuationToken` | **난독화된 값**이며 실제 키가 아님. 목록 결과의 페이지 매김에 사용 🆕 |
| `start-after` | 이 문자열 다음에 사전순으로 시작 |
| 정렬 | 범용 버킷에서는 키 이름 기준 **사전순**(디렉터리 버킷은 사전순이 아님) 🆕 |
| 제외 항목 | 범용 버킷에서는 진행 중인 멀티파트 업로드에만 관련된 접두사를 반환하지 않음 🆕 |

AWS는 애플리케이션 개발에 이 개정된 API(`ListObjectsV2`)를 사용할 것을 권장하며, 이전 버전 `ListObjects`는 하위 호환을 위해 계속 지원합니다. `ListObjects`는 페이지 매김에 `continuation-token` 대신 `marker`를 사용하고, 디렉터리 버킷에서는 지원되지 않습니다.

> — 출처: [ListObjectsV2 API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html), [ListObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html)

### 5.4 Paginator 사용: 객체 나열 🔄

페이지를 배열한 응답의 모든 데이터를 검색하려면 여러 요청을 수행하는 루프를 만들 수 있습니다. 그러나 paginator를 사용하면 추가 루프가 필요하지 않습니다. AWS SDK가 잘린 API 작업의 전체 결과 집합에서 반복 프로세스를 추상화합니다.

| Paginator 접근 대상 | 내용 |
|---|---|
| 응답 | 작업에 대한 AWS의 전체 응답을 반복. 응답에 포함된 모든 속성에 액세스 가능 |
| 주요 결과 | 각 작업마다 고유하며, 응답에서 길이 때문에 잘릴 가능성이 가장 높은 속성. `ListObjectsV2` paginator에서는 `S3Objects`와 `CommonPrefixes` |

Java:

```java
ListObjectsV2Request listReq = ListObjectsV2Request.builder()
        .bucket(bucketName).maxKeys(1).build();
ListObjectsV2Iterable listRes = s3.listObjectsV2Paginator(listReq);
// 응답 페이지 처리
listRes.stream()
        .flatMap(r -> r.contents().stream())
        .forEach(content -> System.out.println(" Key: " + content.key()));
```

.NET:

```csharp
var listObjectsV2Paginator = client.Paginators.ListObjectsV2(new ListObjectsV2Request
{  BucketName = "lab2-notes-bucket" });
foreach (var s3Object in listObjectsV2Paginator.S3Objects)
{  Console.WriteLine(s3Object.Key); }
```

Python — `client.get_paginator('list_objects')` 는 **v1 작업의 paginator**입니다. boto3에는 `S3.Paginator.ListObjectsV2`가 있으므로 `client.get_paginator('list_objects_v2')` 로 얻어 씁니다.

```python
# v1 이 아니라 list_objects_v2 paginator 를 사용한다
paginator = client.get_paginator('list_objects_v2')
page_iterator = paginator.paginate(Bucket='notes-bucket',
                                   PaginationConfig={'MaxItems': 10})
for page in page_iterator:
    print(page['Contents'])
```

`paginate()`는 `Bucket`, `Delimiter`, `Prefix`, `FetchOwner`, `StartAfter`, `PaginationConfig`(`MaxItems`, `PageSize`, `StartingToken`) 등을 받습니다. 응답의 `MaxKeys`는 기본적으로 최대 1,000개 키를 반환합니다. `CommonPrefixes`는 `delimiter`를 지정한 경우에만 응답에 포함되고, 공통 접두사로 묶인 키 그룹은 **반환 수 계산에서 하나로 계산됩니다.** 🆕

> — 출처: [S3.Paginator.ListObjectsV2 (Boto3)](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/paginator/ListObjectsV2.html)

### 5.5 여러 객체 한 번에 삭제: DeleteObjects 🆕

대량 정리 작업을 배치 작업까지 쓰지 않고 처리할 때는 다중 객체 삭제 API와 그 한도를 알아 두면 유용합니다.

| 항목 | 내용 |
|---|---|
| 동작 | 단일 HTTP 요청으로 버킷에서 여러 객체를 삭제 |
| 한 요청당 키 상한 | **최대 1,000개** |
| 입력 | XML로 객체 키 이름 제공. 버전 관리가 활성화된 버킷에서 특정 버전을 삭제하려면 버전 ID를 함께 제공 |
| 응답 | 각 키마다 삭제 결과(성공 또는 실패) 포함 |
| 없는 객체 | 요청에 지정한 객체가 없으면 **삭제된 것으로** 결과를 반환 |
| 응답 모드 | `verbose`(기본)와 `quiet`. `quiet`는 오류가 발생한 키만 반환 |
| MFA Delete | 활성화된 버킷에서 버전 관리된 객체를 삭제하려면 MFA 토큰을 포함해야 하고, 없거나 잘못되면 **요청 전체가 실패** |

> — 출처: [DeleteObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html)

### 5.6 S3 배치 작업 🔄

S3 배치 작업은 Amazon S3 객체에 대해 대규모 작업을 수행합니다. 단일 작업(job)은 지정한 객체 목록에 **단일 작업**을 수행하며, 하나의 작업으로 **엑사바이트 규모 데이터의 수십억 개 객체**를 처리할 수 있습니다. 콘솔, AWS CLI, AWS SDK, Amazon S3 REST API로 사용할 수 있고, 레이블을 지정하고 액세스를 제어할 수 있습니다.

배치 작업은 세 부분으로 구성합니다.

| 단계 | 내용 |
|---|---|
| 객체 선택 | 매니페스트로 대상 객체 지정 |
| 작업 선택 | 메타데이터·속성 수정, 버킷 간 복사, 복원, 태그 교체, Lambda 함수 실행 등 |
| 진행 상황 보기 | 객체 수준 진행 상황 / 작업 알림 / 완료 보고서 |

#### 지원 작업 11가지 🔄

배치 작업이 지원하는 작업은 다음 11가지입니다.

| 작업 | 자주 소개되는 7가지에 포함 |
|---|---|
| 객체 복사(Copy objects) | 있음 |
| 객체 복원(Restore objects) | 있음 |
| 액세스 제어 목록(ACL) 교체 | 있음 |
| 모든 객체 태그 교체 | 있음 |
| S3 Object Lock 보존(retention) | 있음 |
| S3 Object Lock 법적 보존(legal hold) | 있음 |
| AWS Lambda 함수 호출 | 있음 |
| **체크섬 계산(Compute checksums)** | 없음 🆕 |
| **모든 객체 태그 삭제** | 없음 🆕 |
| **객체 암호화 업데이트** | 없음 🆕 |
| **기존 객체 복제(Batch Replication)** | 없음 🆕 |

> — 출처: [Operations supported by S3 Batch Operations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-operations.html)

#### 매니페스트 지정 4가지 방법 🔄

매니페스트는 다음 네 가지 방법으로 지정합니다.

| 방법 | 내용 |
|---|---|
| 기존 매니페스트 사용 | 인벤토리 보고서 등 이미 있는 매니페스트 |
| 새 매니페스트 파일 직접 작성 | CSV. 각 행에 버킷 이름, 객체 키, 선택 사항인 객체 버전. 객체 키는 URL 인코딩 |
| **메타데이터 기준 자동 생성** | 지정한 메타데이터를 기준으로 배치 작업이 객체 목록을 생성해 매니페스트 파일로 저장 🆕 |
| **복제 구성 기준 자동 생성** | 기존 복제 구성을 기준으로 객체 목록을 자동 생성 🆕 |

| 제약 | 내용 |
|---|---|
| 매니페스트 저장 위치 | **범용 버킷**에 저장해야 함. 배치 작업은 디렉터리 버킷에서 매니페스트를 가져오거나 저장할 수 없음(매니페스트에 기술된 객체는 디렉터리 버킷에 있어도 됨) |
| 버전 ID | 매니페스트에 버전 ID 필드를 포함하면 **모든 객체에** 버전 ID를 제공해야 함 |
| 작업 생성 요소 | `Operation`, `Manifest`, `Priority`, `RoleArn`, `Report` 가 필요하고 `Tags` 는 선택 |
| 완료 보고서 | 범용 버킷에 저장해야 하며 **항상 SSE-S3로 암호화됨** 🆕 |

> — 출처: [Creating an S3 Batch Operations job](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-create-job.html)

---

## 6. 정적 웹 사이트 호스팅과 CORS

### 6.1 정적 웹 사이트 호스팅 🔄

S3 버킷을 정적 웹 사이트로 구성할 수 있습니다. 정적 웹 사이트에는 HTML이나 이미지 같은 정적 리소스가 포함되지만 **서버 측 처리 또는 스크립팅은 포함되지 않습니다.** 구성하면 버킷의 AWS 리전별 웹 사이트 엔드포인트에서 사이트를 사용할 수 있습니다.

정적 웹 사이트 콘텐츠를 호스팅하는 경로에는 여러 선택지가 있고, 현재 문서가 권장하는 순서는 다음과 같습니다.

| 방식 | 현재 문서의 위치 |
|---|---|
| **AWS Amplify Hosting** | S3에 저장된 정적 웹 사이트 콘텐츠 호스팅의 **1순위 권장.** Amazon CloudFront 기반 전역 CDN에 배포하는 완전 관리형 서비스로, 범용 버킷 내 객체 위치를 선택해 관리형 CDN에 배포하고 **공개 HTTPS URL을 생성** |
| CloudFront + OAC | 버킷이 **SSE-KMS로 암호화된 경우 필수**(SSE-KMS는 익명 사용자를 지원하지 않음). 오리진 보호에는 OAI가 아니라 **OAC(origin access control)** 를 사용 |
| S3 웹 사이트 엔드포인트 | 가장 단순한 방식. HTTPS와 액세스 포인트를 지원하지 않음([6.2절](#62-웹-사이트-엔드포인트)) |

HTTPS가 필요하면 CloudFront가 대안이 되며, 버킷이 SSE-KMS로 암호화된 경우에는 CloudFront + OAC 경로가 필수입니다.

> — 출처: [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

CloudFront로 정적 웹 사이트를 제공하는 방법은 [CloudFront로 정적 웹 사이트 제공](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/) 지식 센터 문서를 참고할 수 있습니다. URL 생존만 확인했습니다.

### 6.2 웹 사이트 엔드포인트 🔄

웹 사이트 엔드포인트의 스킴은 `http` 입니다(웹 사이트 엔드포인트는 HTTPS를 지원하지 않습니다). 형식은 리전에 따라 두 가지입니다.

| 형식 | 예 |
|---|---|
| 하이픈 | `http://bucket-name.s3-website-Region.amazonaws.com` |
| 마침표 | `http://bucket-name.s3-website.Region.amazonaws.com` |

웹 사이트 엔드포인트는 REST API 요청을 보내는 엔드포인트와 **다릅니다.** 두 엔드포인트의 차이는 다음과 같습니다.

| 항목 | 웹 사이트 엔드포인트 |
|---|---|
| HTTPS | **지원하지 않음** |
| 액세스 포인트 | **지원하지 않음** |
| 지원 콘텐츠 | 퍼블릭으로 읽을 수 있는 콘텐츠만 |
| 지원 메서드 | 객체에 대한 **GET·HEAD 요청만** 🆕 |
| 오류 응답 | HTML 문서로 반환 |
| 리디렉션 | 객체·버킷 수준 리디렉션 지원 |
| SSL 연결 | 지원하지 않음 |
| Requester Pays 버킷 | 웹 사이트 엔드포인트를 통한 액세스를 허용하지 않고 **403 Access Denied** 반환 🆕 |

🆕 보안 강화를 위해 S3 웹 사이트 엔드포인트 도메인은 Public Suffix List에 등록되어 있습니다. 민감한 쿠키를 설정해야 하면 `__Host-` 접두사 쿠키를 사용해 CSRF를 방어하도록 권장합니다.

> — 출처: [Website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)

### 6.3 퍼블릭 액세스 차단과의 관계 🆕

웹 사이트에 공개적으로 액세스하려면 버킷에 퍼블릭 읽기 액세스가 허용되어야 합니다. 이때 신규 버킷의 기본값과 그 상호작용을 이해해야 합니다. **기본적으로 신규 버킷, 액세스 포인트, 객체는 퍼블릭 액세스를 허용하지 않습니다.**

| 설정 | 효과 |
|---|---|
| `BlockPublicAcls` | 퍼블릭 ACL을 지정한 `PutBucketAcl`·`PutObjectAcl`·`PutObject`가 실패. 계정 수준에 적용된 경우 퍼블릭 ACL을 포함한 `PUT Bucket` 요청도 실패 |
| `IgnorePublicAcls` | 버킷·객체의 퍼블릭 ACL을 무시 |
| `BlockPublicPolicy` | 퍼블릭 액세스를 허용하는 버킷 정책을 차단 |
| `RestrictPublicBuckets` | 퍼블릭 정책을 가진 버킷에 대한 액세스를 제한 |

| 항목 | 내용 |
|---|---|
| 적용 수준 | 조직·계정·버킷·액세스 포인트 |
| 수준별 설정이 다를 때 | **가장 제한적인 조합**이 적용됨 |
| AWS 권장 | 계정과 각 버킷에 **네 설정을 모두 켜기**(AWS Security Hub 기본 보안 모범 사례 S3.8) |
| 정적 웹 사이트 호스팅처럼 퍼블릭 액세스가 필요하면 | 개별 설정을 조정 |

정리하면, "퍼블릭 읽기 액세스"는 기본 차단 설정을 의도적으로 해제해야 성립합니다. 그 해제 없이 HTTPS까지 얻으려면 [6.1절](#61-정적-웹-사이트-호스팅)의 Amplify Hosting 또는 CloudFront + OAC 경로를 씁니다.

> — 출처: [Blocking public access to your Amazon S3 storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)

### 6.4 웹 사이트 호스팅 활성화 🔄

```console
>> aws s3 website s3://notes-bucket/ --index-document index.html --error-document error.html
```

`website`는 `aws s3api`가 아니라 **`aws s3` 명령 집합(상위 수준)에 속합니다.** 참고로 `aws s3` 같은 사용자 지정 명령은 `--generate-cli-skeleton`을 지원하지 않는데, 이것이 두 명령 집합의 성격 차이를 보여 줍니다.

| 항목 | 내용 |
|---|---|
| 구문 | `aws s3 website <S3Uri> [--index-document <value>] [--error-document <value>]` |
| `--index-document` | 웹 사이트 엔드포인트에서 디렉터리 요청에 덧붙여지는 접미사. **비어 있으면 안 되고 슬래시를 포함할 수 없음** |
| `--error-document` | 4XX 계열 오류 발생 시 사용할 객체 키 이름 |
| 문서의 예제 결과 주소 | `http://amzn-s3-demo-bucket.s3-website-us-west-2.amazonaws.com` |
| 주의 | 정적 사이트에 노출되는 모든 파일은 방문자가 열 수 있도록 **별도로 구성해야 함** |

> — 출처: [aws s3 website](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/website.html)

### 6.5 교차 오리진 리소스 공유 CORS 🔄

CORS는 한 도메인에서 로드된 클라이언트 웹 애플리케이션이 다른 도메인의 리소스와 상호 작용하는 방법을 정의합니다. Amazon S3는 CORS를 지원하므로 S3로 리치 클라이언트 측 웹 애플리케이션을 만들고 S3 리소스에 대한 교차 오리진 액세스를 **선택적으로** 허용할 수 있습니다.

예를 들어 S3 버킷에 웹 글꼴을 호스트하고 대체 도메인의 웹 페이지가 이 웹 글꼴을 사용하려 할 때, 브라우저는 페이지를 로드하기 전에 CORS 검사를 수행합니다. 한 도메인 웹 페이지(`http://www.example.com`)의 JavaScript가 `website.s3.amazonaws.com` 엔드포인트로 S3 버킷의 리소스를 사용하려 하면, 브라우저는 버킷에 CORS가 활성화된 경우에만 이러한 교차 도메인 액세스를 허용합니다.

동작 방식에서 특히 주의할 두 가지: 🆕

- 브라우저에서 사전 요청(preflight)을 받으면 S3는 버킷의 CORS 구성을 평가하고, 들어온 요청과 일치하는 **첫 번째 `CORSRule`** 을 사용해 교차 오리진 요청을 허용합니다. 일치 조건은 요청의 `Origin` 헤더가 `AllowedOrigins`와 일치하고, `Access-Control-Request-Method`가 `AllowedMethods`와 일치하며, `Access-Control-Request-Headers`의 헤더가 `AllowedHeaders`와 일치하는 것입니다.
- 버킷에 CORS를 활성화해도 **ACL과 정책은 계속 적용됩니다.**

S3 Object Lambda는 브라우저에서 온 요청이거나 `Origin` 헤더가 포함된 요청에 항상 `"AllowedOrigins":"*"` 헤더 필드를 추가합니다.

> — 출처: [Using cross-origin resource sharing (CORS)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

#### 구성 형식: XML에서 JSON으로 🔄

CORS 구성은 과거 XML 형식으로 작성했습니다. XML 예제는 다음과 같습니다.

```text
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
  </CORSRule>
</CORSConfiguration>
```

현재 **S3 콘솔에서 CORS를 구성하려면 JSON을 사용해야 하며, 새 콘솔은 JSON CORS 구성만 지원합니다.** REST API·SDK용으로는 JSON과 XML 예제가 모두 제공됩니다. 같은 규칙을 JSON으로 쓰면 다음과 같습니다.

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"]
  }
]
```

| 요소 | 값 |
|---|---|
| 구성당 최대 규칙 수 | **100개.** 버킷의 `cors` 하위 리소스로 추가 |
| `AllowedMethods` | `GET`, `PUT`, `POST`, `DELETE`, `HEAD` |
| `AllowedOrigins` | 오리진 문자열에 와일드카드 `*` 를 **하나만** 넣을 수 있음(예: `http://*.example.com`). `*` 하나로 모든 오리진 허용 가능 |
| `AllowedHeaders` | 와일드카드를 최대 하나 포함 가능(예: `x-amz-*`) |
| `ExposeHeaders` (선택) | 애플리케이션에서 접근 가능하게 노출할 응답 헤더 |
| `MaxAgeSeconds` (선택) | 브라우저가 사전 요청 응답을 캐시하는 초 |

CORS 관련 내용은 아래 사용자 안내서 페이지에 있습니다.

> — 출처: [Elements of a CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

### 6.6 이벤트 알림 트리거 🆕

이벤트 알림은 PUT, POST, COPY, DELETE 같은 Amazon S3 작업에 대한 응답으로 발생한다고 흔히 요약되지만, 실제 지원 트리거에는 **API 호출이 아닌 것도 있습니다.**

| 대상 | 내용 |
|---|---|
| 게시 대상 | Amazon SNS 주제, Amazon SQS 대기열, AWS Lambda, Amazon EventBridge |
| 제약 | 이벤트 알림 하나에는 **대상 유형 하나만** 지정 가능 |

SQS·SNS·Lambda 대상으로 게시할 수 있는 이벤트 유형:

| 이벤트 유형 | 트리거 |
|---|---|
| `s3:TestEvent` | 구성 확인용 |
| `s3:ObjectCreated:*` | Put / Post / Copy / CompleteMultipartUpload |
| `s3:ObjectRemoved:*` | Delete / DeleteMarkerCreated |
| `s3:ObjectRestore:*` | Post / Completed / Delete |
| `s3:ReducedRedundancyLostObject` | RRS 객체 손실 |
| `s3:Replication:*` | OperationFailedReplication / OperationMissedThreshold / OperationReplicatedAfterThreshold / OperationNotTracked |
| `s3:LifecycleExpiration:*` | Delete / DeleteMarkerCreated |
| `s3:LifecycleTransition` | 스토리지 클래스 전환 |
| `s3:IntelligentTiering` | 계층 이동 |

주의할 점:

- **수명 주기 구성에 의한 자동 삭제나 실패한 작업은 `ObjectRemoved` 이벤트로 알림이 오지 않습니다.** 수명 주기 삭제를 잡으려면 `s3:LifecycleExpiration:*` 을 씁니다.
- SNS FIFO와 SQS FIFO 대기열은 S3 이벤트 알림 대상으로 **지원되지 않습니다.** SQS FIFO로 보내려면 EventBridge를 사용합니다.
- 이벤트 알림 메시지는 최대 64KB이므로 SQS 대기열의 `MaximumMessageSize`를 최소 64KB로 설정하도록 권장합니다.
- EventBridge는 버킷 단위로 활성화·비활성화만 가능하고, 활성화하면 **모든 이벤트가 전송됩니다.**

> — 출처: [Supported event destinations and event types](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html)

---

## 7. 교재 대비 변경 사항

수강생이 공식 교재를 함께 볼 수 있으므로, 이 자료가 교재와 어디서 갈라지는지 한곳에 모았습니다. 앞 장에서 신규·교정으로 표시한 항목의 근거가 여기 있습니다.

### 7.1 교재와 다른 점

| 항목 | 교재의 서술 | 확인된 내용 | 근거 |
|---|---|---|---|
| 계정당 버킷 한도 | "기본값으로 최대 100개, 최대 1,000개로 증가 요청" | 기본 한도는 **범용 버킷 10,000개**이며 그 이상은 Service Quotas 콘솔에서 요청. 상업 리전 할당량은 US East(N. Virginia)에서만 조회·관리 | [버킷 할당량과 제한](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html) |
| HeadBucket 400 해석 | `case 400` 을 "다른 리전에서 버킷에 액세스하려고 했음"으로 처리 | 400은 버킷이 없거나 권한이 없을 때 반환되는 일반 코드(400·403·404) 중 하나. 오히려 파티션 내 다른 리전 이름으로 호출해도 올바른 위치 헤더를 받음 | [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html) |
| 버킷 이름 `notes_bucket` | .NET 예제의 `BucketName` 에 밑줄 사용 | 범용 버킷 이름에는 소문자·숫자·마침표·하이픈만 사용 가능하고 **밑줄은 불가**. 2018년 3월 1일 이후 생성 버킷은 전 리전 동일 규칙 | [버킷 명명 규칙](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) |
| 버전 관리 상태 "Disabled" | 스켈레톤 출력이 `"Status": "Disabled"`, `"MFADelete": "Disabled"` | 상태 값은 **`Enabled`·`Suspended`** 두 가지뿐. 미설정 버킷은 상태 값이 반환되지 않음. 필드 이름은 **`MfaDelete`**. `--generate-cli-skeleton output` 은 값이 채워진 결과가 아니라 **빈 템플릿** | [PutBucketVersioning API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketVersioning.html) |
| "버킷이 종료될 때까지 기다리는 waiter" | 강사 노트의 서술 | `bucket_exists`·`waitUntilBucketExists` 는 **버킷이 존재할 때까지** 기다림. boto3 `BucketExists` 는 `head_bucket` 을 5초마다 폴링하고 20회 실패 시 오류 | [S3.Waiter.BucketExists](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/waiter/BucketExists.html) |
| 웹 사이트 엔드포인트 스킴 | 표는 `https://...s3-website-[Region]...` | 공식 문서 기준 스킴은 **`http`**(웹 사이트 엔드포인트는 HTTPS 미지원). 리전에 따라 하이픈·마침표 두 형식 | [웹 사이트 엔드포인트](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |
| "API 수준 `s3api` 명령 `website`" | 강사 노트의 서술 | `website` 는 **`aws s3` 명령 집합(상위 수준)** 에 속함. 예제 명령 자체는 맞음 | [aws s3 website](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/website.html) |
| `switch` 문 `break` 누락 | `case 404`/`400`/`403` 에 `break` 없음 | 404 응답에서 세 메시지가 모두 출력되는 fall-through. Java 언어 동작이므로 AWS 문서 근거 없이 코드만 교정 | — ([7.5절](#75-검증하지-못한-항목)) |
| Python 예제 변수 불일치 | 인자는 `bucket` 인데 본문은 정의되지 않은 `bucketname` 을 넘기고 `bucket.name` 도 혼용 | 교재 코드 자체의 오류. 클라이언트 인터페이스로 재작성하고 인자 이름을 일치시킴 | — ([7.5절](#75-검증하지-못한-항목)) |
| Object Lambda 예제 변수 불일치 | `route`·`token` 선언 후 `request_route`·`request_token` 사용 | 정의되지 않은 이름을 참조하므로 실행 시 `NameError`. `RequestRoute=route`, `RequestToken=token` 으로 교정 | — ([7.5절](#75-검증하지-못한-항목)) |

### 7.2 동작·기본값이 변경된 항목

| 항목 | 교재 기재 | 현재 | 근거 |
|---|---|---|---|
| 멀티파트 최대 객체 크기 | "< 5 TB" | 멀티파트 한도 페이지는 **48.8TiB**, 객체 업로드 페이지는 **최대 50TB**·"5MB~50TB 범위". 단일 PUT 5GB는 그대로 유효. 5TB 초과 파일에는 S3 Transfer Manager 안내 | [멀티파트 업로드 한도](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) |
| `S3Region.EU` | .NET 예제의 `BucketRegion` | SDK for .NET V4의 `S3Region` 필드 목록에 문자열 `EU` 필드가 없음. `EUCentral1`·`EUWest1` 처럼 리전 코드 대응 필드만 존재. API 수준 `LocationConstraint` 값 `EU`는 여전히 유효(`eu-west-1`) | [Amazon.S3.S3Region 필드](https://docs.aws.amazon.com/sdkfornet/v4/apidocs/items/S3/TS3Region.html) |
| `CannedACL = S3CannedACL.PublicRead` | 버킷 생성 시 퍼블릭 읽기 canned ACL 지정 | Object Ownership 기본값이 '버킷 소유자 적용'이라 ACL 비활성화. 퍼블릭 ACL PUT은 **400 `AccessControlListNotSupported`** 로 실패. 계정 수준 `BlockPublicAcls` 가 켜져 있으면 `PUT Bucket` 요청도 실패 | [Object Ownership](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html) |
| .NET 동기 메서드 | `client.PutBucket`·`GetObject`·`ListBuckets` | .NET Core·.NET Standard 대상에서는 **비동기 호출만 지원**. 동기·비동기 모두 지원은 .NET Framework 4.7.2 대상 빌드뿐 | [.NET SDK 지원 플랫폼](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-supported-platforms.html) |
| 정적 웹 사이트 호스팅 경로 | "웹 사이트 호스팅 + 퍼블릭 읽기 액세스" | 신규 버킷은 퍼블릭 액세스 기본 차단이고 AWS는 네 설정 모두 켜기를 권장. 1순위 권장 경로는 **AWS Amplify Hosting**, SSE-KMS 버킷은 **CloudFront + OAC 필수** | [정적 웹 사이트 호스팅](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) |
| CORS 구성 형식 | "CORS 구성 XML 파일을 생성하십시오" | 콘솔은 **JSON 필수**(새 콘솔은 JSON만 지원). REST API·SDK 경로에서는 JSON·XML 모두 가능. 규칙 100개 상한은 교재와 일치 | [CORS 구성 요소](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html) |
| `ListBuckets` 반환 방식 | 전체 목록을 한 번에 반환하는 것처럼 서술 | `continuation-token`·`max-buckets`(1~10000)·`bucket-region`·`prefix` 파라미터가 있고 **페이지 매김된 요청만 사용하도록 강력히 권장**. 할당량이 10,000을 넘는 계정에서는 페이지 매김 없는 요청이 모두 거부 | [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html) |
| 배치 작업 지원 작업 | 7가지 | **11가지.** 체크섬 계산, 모든 객체 태그 삭제, 객체 암호화 업데이트, Batch Replication 추가. 매니페스트 지정도 2가지에서 **4가지**로 확대 | [배치 작업 지원 작업](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-operations.html) |
| 미리 서명된 URL 쿼리 파라미터 | `AWSAccessKeyId`·`Signature`·`Expires` (서명 버전 2 형태) | 모든 미리 서명된 URL이 **SigV4** 사용. 파라미터는 `X-Amz-Algorithm`·`X-Amz-Credential`·`X-Amz-Date`·`X-Amz-Expires`·`X-Amz-SignedHeaders`·`X-Amz-Signature`. `--expires-in` 기본 3600초·최대 604800초 | [aws s3 presign](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/presign.html) |
| 문서 링크 경로 | `/AmazonS3/latest/dev/ChgStoClsOfObj.html`·`/dev/cors.html`·`/dev/ManageCorsUsing.html` | 모두 사용자 안내서(`/userguide/`) 경로로 리다이렉트. `ChgStoClsOfObj.html` 은 별도 페이지가 아니라 `storage-class-intro.html` 로 통합 | [스토리지 클래스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |
| 지식 확인 5번 해설 범위 | "PUT, POST, COPY 또는 DELETE와 같은 작업에 대한 응답" | 수명 주기 만료·전환, Intelligent-Tiering, 복제, 복원 등 **API 호출이 아닌 트리거**도 있음. 반대로 수명 주기 삭제는 `ObjectRemoved` 로 알림이 오지 않아 `s3:LifecycleExpiration:*` 필요 | [이벤트 유형과 대상](https://docs.aws.amazon.com/AmazonS3/latest/userguide/notification-how-to-event-types-and-destinations.html) |

### 7.3 비권장·지원 종료된 항목

| 항목 | 상태 | 대체 | 근거 |
|---|---|---|---|
| AWS SDK for Java 1.x 예제 | **2025년 12월 31일 지원 종료** | AWS SDK for Java 2.x(`software.amazon.awssdk`). 응답 헤더 재정의는 `GetObjectRequest.builder().responseContentDisposition(...)` | [Java SDK 1.x 지원 종료](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| S3 Object Lambda | 2025년 11월 7일부터 **기존 고객과 일부 APN 파트너에게만 제공**. 새 기능 도입 계획 없음 | Dynamic Image Transformation for Amazon CloudFront 솔루션 / CloudFront·API Gateway·함수 URL로 Lambda 호출 / 클라이언트에서 처리 | [Object Lambda 가용성 변경](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html) |
| boto3 리소스 인터페이스 `s3.Object(...)` | 신규 기능 추가 계획 없음. 기존 인터페이스는 계속 동작 | `boto3.client('s3').get_object(Bucket=..., Key=...)` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| `get_paginator('list_objects')` | v1 작업의 paginator. 문서는 `ListObjectsV2` 사용을 권장 | `client.get_paginator('list_objects_v2')` | [ListObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html) |
| Standard ↔ Reduced Redundancy 전환 예시 | RRS 사용 비권장. 연간 평균 0.01% 손실 설계, 손실 객체 요청 시 405 오류 | S3 Standard 유지, 또는 Standard-IA·Glacier 계열로 전환 | [스토리지 클래스](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html) |

### 7.4 이 자료에서 더한 점

| 항목 | 왜 더했는가 | 요약 | 근거 |
|---|---|---|---|
| 멀티파트 파트 한도 | 하위 수준 명령으로 직접 멀티파트 업로드를 구현하려면 파트 크기·개수 한도가 필요한데 교재는 다루지 않음 | 파트 크기 5MiB~5GiB(마지막 파트 최소 제한 없음), 업로드당 최대 10,000 파트, `list parts`·`list multipart uploads` 각 1,000개 | [멀티파트 업로드 한도](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) |
| 콘솔 업로드 상한 | 단일 PUT 5GB와 별개로 콘솔 업로드 상한을 알아야 실무에서 경로를 고를 수 있음 | Amazon S3 콘솔로 단일 객체 최대 160GB 업로드 | [객체 업로드](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) |
| S3 Transfer Manager | 교재는 상위 수준 전송으로 `aws s3 cp`만 제시해 SDK 쪽 상위 수준 API가 비어 있음 | Java 2.x의 상위 수준 파일·디렉터리 전송 유틸리티. 진행 상황 모니터링·일시 중지 지원 | [S3 Transfer Manager](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/transfer-manager.html) |
| `AbortIncompleteMultipartUpload` 적용 범위 | 멀티파트 업로드는 명시적으로 완료·중지하지 않으면 파트 요금이 계속 발생하므로 정리 규칙의 범위·요금을 짚어야 함 | 기존·신규 멀티파트 업로드 모두에 적용되고, 이 정리에는 조기 삭제 요금이 없음 | [불완전한 멀티파트 업로드 삭제](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) |
| `GetObject` 조건부 읽기·`partNumber` | 부분 검색·조건부 읽기·버전 접근은 실무에서 자주 쓰지만 교재의 GET 설명에는 없음 | `If-Match`·`If-None-Match`·`If-Modified-Since`·`If-Unmodified-Since`(412/304), 파트 번호 범위 GET, 버전별 권한 `s3:GetObjectVersion` | [GetObject API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) |
| Java 2.x 응답 헤더 재정의 | 교재 예제가 1.x 문법이라 2.x에서 같은 일을 하는 방법을 보여야 함 | 별도 클래스 없이 `GetObjectRequest.Builder` 의 `responseCacheControl`·`responseContentDisposition` 등으로 지정 | [GetObjectRequest.Builder](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/model/GetObjectRequest.Builder.html) |
| `DeleteObjects` | 대량 정리를 배치 작업까지 가지 않고 처리하는 흔한 수단인데 교재에 없음 | 단일 요청으로 최대 1,000개 키 삭제. `quiet` 모드, 없는 객체는 삭제된 것으로 응답 | [DeleteObjects API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObjects.html) |
| 미리 서명된 URL 만료 상한과 권한 상속 | 교재는 "만료 날짜"만 언급해, 실제 유효 기간이 자격 증명 유형에 좌우된다는 함정을 놓침 | 콘솔 1분~12시간, CLI·SDK 최대 7일. 임시 자격 증명으로 만든 URL은 자격 증명과 함께 만료. 기능은 **서명자의 권한으로 제한**. `s3:signatureAge` 조건 키 | [미리 서명된 URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) |
| 버킷 생성 시 태그 지정 | 생성 시점 태깅은 거버넌스에 유용하나 교재의 생성 예제에 없음 | `CreateBucketConfiguration` 의 `Tags`. `s3:TagResource` 권한 필요 | [CreateBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) |
| `HeadBucket` 응답 헤더 | 존재 확인 외에 위치·ARN 등 유용한 정보가 헤더로 오는데 교재는 언급하지 않음 | `x-amz-bucket-region`·`x-amz-bucket-arn`·`x-amz-access-point-alias` 등 | [HeadBucket API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadBucket.html) |
| 배치 작업 매니페스트 자동 생성 | 매니페스트를 수작업 CSV·인벤토리로만 아는 상태에서 자동 생성 경로를 알면 운영이 쉬워짐 | 메타데이터 기준 생성, 복제 구성 기준 생성. 매니페스트·완료 보고서는 범용 버킷에 저장하며 보고서는 항상 SSE-S3 암호화 | [배치 작업 생성](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops-create-job.html) |
| 웹 사이트 엔드포인트 제약 | 웹 사이트 엔드포인트를 REST 엔드포인트와 혼동하지 않으려면 지원 범위·제약을 명시해야 함 | GET·HEAD 요청만 지원, Requester Pays 버킷은 403, 도메인이 Public Suffix List에 등재 | [웹 사이트 엔드포인트](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html) |
| 퍼블릭 액세스 차단 네 설정 | 퍼블릭 읽기 액세스가 기본 차단과 어떻게 상호작용하는지 알아야 정적 호스팅을 안전하게 구성함 | `BlockPublicAcls`·`IgnorePublicAcls`·`BlockPublicPolicy`·`RestrictPublicBuckets`. 수준별 설정이 다르면 가장 제한적인 조합 적용 | [퍼블릭 액세스 차단](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) |
| CORS 규칙 평가 방식 | 규칙이 여러 개일 때 어느 것이 적용되는지, CORS와 ACL·정책의 관계를 짚어야 오작동을 피함 | 일치하는 **첫 번째** `CORSRule` 만 적용되고, CORS를 켜도 ACL·정책은 계속 적용 | [CORS 개요](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html) |
| `aws s3 sync --delete` | 동기화의 삭제 동작과 기본 스토리지 클래스는 실무에서 자주 필요하나 교재에 없음 | 대상에만 있고 소스에 없는 파일 삭제. `--storage-class` 기본값 `STANDARD` | [aws s3 sync](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/sync.html) |
| `--generate-cli-skeleton` 지원 범위 | 교재 예제가 이 옵션을 쓰는데 지원 값·명령 집합별 제약을 모르면 오해하기 쉬움 | `input`·`yaml-input`·`output` 세 값. `output` 은 YAML 불가. `aws s3` 같은 사용자 지정 명령은 미지원 | [CLI 스켈레톤](https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-skeleton.html) |
| SDK for .NET V4의 S3 변경 | 교재 .NET 예제를 최신 SDK에서 돌리려면 제거·변경된 API를 알아야 함 | `DoesS3BucketExist(Async)` 제거, 항상 SigV4 서명, `us-east-1` 클라이언트로 타 리전 버킷 액세스 불가, `GetACL`·`PutACL` 사용 중단 | [.NET SDK V4 변경 사항](https://docs.aws.amazon.com/sdk-for-net/v4/developer-guide/net-dg-v4.html) |
| Java 2.x paginator 목록 | 나열 작업마다 paginator 변형이 있다는 점을 알면 수동 루프를 피할 수 있음 | 버킷 나열과 객체 나열 모두에 paginator 변형 존재(`listBucketsPaginator`·`listObjectsV2Paginator` 등) | [S3Client (Java 2.x)](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/services/s3/S3Client.html) |
| boto3 리소스 스레드 안전성 | 리소스 인터페이스를 계속 쓰는 경우 스레드 안전성 함정을 반드시 알아야 함 | 리소스 인스턴스는 스레드 안전하지 않아 스레드마다 새로 생성해야 함. `wait_until_exists()` 형태의 waiter 제공 | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| `ListObjectsV2` 세부 동작 | 연속 토큰과 정렬 동작을 잘못 이해하면 페이지 매김 로직이 어긋남 | 연속 토큰은 난독화된 값이며 실제 키가 아님. 범용 버킷은 키 사전순 반환 | [ListObjectsV2 API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) |
| Object Lambda 지원 요청 범위 | GET만 변환한다고 오해하기 쉬워 지원 범위와 디렉터리 버킷 제약을 명시함 | GET뿐 아니라 LIST·HEAD도 변환 가능. Object Lambda Access Point는 디렉터리 버킷 미지원 | [Object Lambda](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transforming-objects.html) |

### 7.5 검증하지 못한 항목

정직하게 남겨 둡니다. 강의에서 단정적으로 말하기 전에 확인하세요.

| 항목 | 상태 |
|---|---|
| 최대 객체 크기 (48.8TiB vs 50TB) | 두 공식 페이지가 서로 다른 단위·값으로 기재합니다. 멀티파트 업로드 한도 페이지는 48.8TiB, 객체 업로드 페이지는 최대 50TB와 "5MB~50TB 범위"입니다. 어느 쪽이 정본인지는 문서로 판별하지 못했으므로 본문에 두 값을 각각의 출처와 함께 제시했습니다. 확정한 것은 교재의 5TB가 현재와 다르다는 점뿐입니다 |
| Java `switch` fall-through | `break` 누락으로 404 분기에서 400·403 분기까지 연달아 실행됩니다. Java 언어 동작이므로 AWS 공식 문서로 확인할 성질의 사실이 아닙니다. 본문 예제에는 `break` 를 넣어 교정했고 근거 인용은 붙이지 않았습니다 |
| Python 예제 변수 불일치 | 함수 인자 `bucket` 을 받으면서 본문에서 `bucketname`(정의되지 않음)과 `bucket.name` 을 혼용합니다. 교재 코드 자체의 불일치이므로 외부 문서로 검증할 대상이 아닙니다 |
| Object Lambda 예제 변수 불일치 | `route`·`token` 선언 후 `request_route`·`request_token` 을 참조합니다. 같은 이유로 문서 검증 대상이 아니며 변수 이름만 일치시켰습니다 |
| `get-bucket-location` 이 `us-east-1` 에서 `null` 을 반환하는 동작 | `LocationConstraint` 유효값에 `us-east-1` 이 없고 미지정 시 `us-east-1` 에 생성된다는 점은 CreateBucket API 문서로 확인했습니다. 다만 `null` 반환 동작 자체는 문서로 확인하지 못했습니다(M05와 동일). 실행 검증이 필요합니다 |
| MFA Delete의 정확한 보호 범위 | 확인한 것은 두 가지입니다. MFA Delete 활성화에는 버킷 소유자 권한과 `x-amz-mfa` 헤더가 필요하다는 점(PutBucketVersioning 문서), MFA Delete 버킷에서 버전 객체를 삭제할 때 MFA 토큰이 필요하다는 점(DeleteObjects 문서). 교재 강사 노트의 "MFA로 버킷을 보호해 객체 삭제를 방지한다"는 서술 중 보호 범위 전체는 전용 문서로 따로 확인하지 않았습니다 |
