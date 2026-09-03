# Module 10: Managing the APIs

## Developing on AWS (English)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [What Is Amazon API Gateway?](#2-what-is-amazon-api-gateway)
3. [Working with API Gateway](#3-working-with-api-gateway)
4. [Request and Response Handling](#4-request-and-response-handling)
5. [API Design as Code](#5-api-design-as-code)
6. [Testing the API](#6-testing-the-api)
7. [Deploying the API](#7-deploying-the-api)
8. [Observability: Logging, Metrics, Tracing](#8-observability-logging-metrics-tracing)
9. [Changes from the Courseware](#9-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content that differs from the original instructor deck and has been corrected. What changed and how is collected in [Chapter 9](#9-changes-from-the-courseware).
> - Items where the courseware contradicts itself from slide to slide cannot be settled with external documentation, so they carry no marker. They are flagged in the body and collected in [Chapter 9](#9-changes-from-the-courseware).
> - Verified on August 30, 2026. Documentation may be updated after this date, so check the linked originals before relying on this for an exam or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Describe the key components of Amazon API Gateway
- Develop API Gateway resources to integrate with AWS services
- Configure API request and response calls for application endpoints
- Test API resources and deploy application API endpoints
- Demonstrate creating API Gateway resources to interact with the application API

### Where This Module Fits

| Item | Content |
|---|---|
| Lab 4 | Developing solutions with AWS Lambda (developer, Amazon Polly, Amazon API Gateway) |
| **Module 10** | **Managing the APIs** — API Gateway components, integrations, request and response handling, API design as code, testing, deployment |
| Lab 5 | Developing solutions with Amazon API Gateway (user, Amazon API Gateway, DynamoDB table) |

Earlier modules built the backend database storage system and configured compute processing. Now you configure how users reach those services over the internet. The courseware sums up this role as "Amazon API Gateway connects all the services in the application together."

### What This Module Covers

The courseware deck has ten sections. This document follows the same order.

| Courseware section | Slides | This document |
|---|---|---|
| What is Amazon API Gateway? | 5–10 | [Chapter 2](#2-what-is-amazon-api-gateway) |
| Working with API Gateway | 11–14 | [Chapter 3](#3-working-with-api-gateway) |
| Request and response handling | 15–20 | [Chapter 4](#4-request-and-response-handling) |
| API design as code | 21–22 | [Chapter 5](#5-api-design-as-code) |
| Testing the API | 23–28 | [Chapter 6](#6-testing-the-api) |
| Deploying the API | 29–37 | [Chapter 7](#7-deploying-the-api) |
| Demo / knowledge check / Lab 5 / summary | 37–45 | [Section 7.7](#77-demo-topics) |

Observability (logging, metrics, tracing), which the courseware does not cover, is collected in [Chapter 8](#8-observability-logging-metrics-tracing). The courseware diagrams show Amazon CloudWatch and AWS X-Ray as application components but never explain them in the body.

The example application's API resources and methods are as follows (courseware slide 9).

| Resource | Method | Function |
|---|---|---|
| `/notes` | `GET` | List |
| `/notes` | `POST` | Create |
| `/notes/search` | `GET` | Search |
| `/notes/(id)` | `DELETE` | Delete |
| `/notes/(id)` | `POST` | Update |

---

## 2. What Is Amazon API Gateway?

### 2.1 Accessing Backend Services

Amazon API Gateway is an AWS service for creating, publishing, maintaining, monitoring, and securing APIs that access AWS or other third-party services. The documentation describes API Gateway as the **'front door'** through which applications access data, business logic, or functionality from backend services. Typical backends are workloads running on Amazon EC2, code running on AWS Lambda, web applications, and real-time communication applications.

API Gateway handles all the tasks involved in accepting and processing thousands of concurrent API calls. These tasks include traffic management, authorization and access control, monitoring, and API version management.

> — Source: [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### 2.2 API Gateway Creates Three Kinds of API 🔄

The diagram on courseware slide 6 reads "REST, HTTP, or WebSocket API" and the instructor notes list all three. This part matches the current documentation. Module 2 needed a correction because its diagram labeled only `REST API`; Module 10 presents all three from the start.

| API type | How the documentation characterizes it |
|---|---|
| REST | Stateless. HTTP based, implements standard HTTP methods such as `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` |
| HTTP | Stateless. A RESTful API product **designed with minimal features so that it can be offered at a lower price** |
| WebSocket | **Stateful.** Follows the WebSocket protocol to enable two-way communication and routes incoming messages based on message content |

🔄 The part that needs correcting is the slide 7 instructor notes. The courseware says "Use HTTP APIs to create RESTful APIs with **lower latency** and lower cost than REST APIs." The axes the current comparison document presents are **feature count and price**; latency does not appear as a comparison item. The lower-cost statement matches the documentation ("HTTP APIs are designed with minimal features so that they can be offered at a lower price"). The latency comparison could not be verified in that document, so it is recorded in [Section 9.5](#95-items-we-could-not-verify).

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 2.3 Choosing Between REST APIs and HTTP APIs 🆕

The slide 7 instructor notes end with "The application uses a REST API" and never address the choice. The documentation **does not recommend one over the other**; it tells you to choose based on which features you need.

| Features needed | Choice |
|---|---|
| API keys, per-client throttling, request validation, AWS WAF integration, private API endpoints | **REST API** |
| None of the above | **HTTP API** (cheaper) |

Here is the main feature comparison. It is worth noting that most of the features this module covers are REST API only.

| Category | Feature | REST API | HTTP API |
|---|---|---|---|
| Endpoint type | Edge-optimized / private | Yes | No |
| Endpoint type | Regional | Yes | Yes |
| Security | Mutual TLS authentication | Yes | Yes |
| Security | Certificates for backend authentication, AWS WAF | Yes | No |
| Authorization | IAM, Lambda authorizers | Yes | Yes |
| Authorization | Resource policies | Yes | No |
| Authorization | Amazon Cognito | Directly | Through a JWT authorizer |
| Authorization | JWT authorizer | No (validate JWTs with a Lambda authorizer) | Yes |
| API management | API keys, per-client rate limiting, per-client usage throttling, developer portal | Yes | No |
| API management | Custom domains | Yes | Yes |
| Development | Test invocations, caching, custom gateway responses, canary release deployments, request validation, request body transformation | Yes | No |
| Development | Automatic deployments | No | Yes |
| Development | CORS configuration, user-controlled deployments, request parameter transformation | Yes | Yes |
| Monitoring | CloudWatch metrics, access logs to CloudWatch Logs | Yes | Yes |
| Monitoring | Execution logs, access logs to Amazon Data Firehose, AWS X-Ray tracing | Yes | No |
| Integrations | Public HTTP endpoints, AWS services, Lambda functions, NLB and ALB private integrations | Yes | Yes |
| Integrations | Mock integrations, response streaming | Yes | No |
| Integrations | AWS Cloud Map private integrations | No | Yes |

**This course's use of a REST API is not a wrong choice.** Request validation, mapping templates, caching, canary releases, and usage plans — most of what this module covers — exist only on REST APIs.

> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 2.4 Working with WebSocket APIs 🔄

A WebSocket API is a **stateful frontend** for AWS services (such as Lambda or DynamoDB) or for an HTTP endpoint. Because it is two-way, the service can push data to the client without the client explicitly requesting it. The courseware cites chat applications, collaboration platforms, multiplayer games, and financial trading platforms as examples.

Incoming JSON messages are directed to backend integrations based on the routes you configure, and **non-JSON messages are directed to the `$default` route** you configure. A route includes a **route key**, which is the value expected once the route selection expression is evaluated. `routeSelectionExpression` is **an attribute defined at the API level** and specifies a JSON property expected to be present in the message payload.

| Route | When it is called |
|---|---|
| `$connect` | When a persistent connection between the client and the WebSocket API is being initiated |
| `$disconnect` | When the client or the server disconnects from the API |
| Custom route | After the route selection expression is evaluated against the message and a matching route is found. The match determines which integration is invoked |
| `$default` | When the route selection expression cannot be evaluated against the message, or no matching route is found |

The service uses the route whose `routeKey` **exactly matches** the evaluated value. If none match and a `$default` route exists, that route is selected; if there is no `$default` route, the service returns an error. For WebSocket-based APIs the expression should be of the form `$request.body.{path_to_body_element}`.

🆕 Constraints the courseware does not cover.

| Item | Documentation content |
|---|---|
| Custom route keys | You cannot use the `$` prefix. `$` is reserved for predefined routes |
| Where authorization goes | Because a WebSocket connection is stateful, authorization can be configured **on the `$connect` route only**, and authentication and authorization are performed only at connection time |
| Authorization values | `NONE`, `AWS_IAM`, `CUSTOM`. This setting applies to **the entire API**, not just the `$connect` route |
| `$connect` failure | The connection is not established and the client receives a `401` or `403`. Setting up a `$connect` integration is itself optional |
| `$disconnect` reliability | It executes after the connection is closed, so it is a **best-effort event** and API Gateway cannot guarantee delivery |

> — Source: [Create routes for WebSocket APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html)
> — Source: [Manage connected users and client apps: $connect and $disconnect routes](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html)

### 2.5 API Gateway and the Application

A REST API is a collection of HTTP resources and methods integrated with backend HTTP endpoints, Lambda functions, or other AWS services, and you can **deploy that collection in one or more stages**. Typically API resources are organized in a resource tree according to application logic, and each resource exposes one or more methods with unique HTTP verbs supported by API Gateway.

The courseware explains that in the example application `GET`, `POST`, and `DELETE` are used to validate requests and transform the responses returned from Lambda functions.

> — Source: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 2.6 API Gateway Developer Features

Courseware slide 10 presents eight developer features. Here they are with pointers to where this document covers each in detail.

| Courseware feature | Summary | Detail |
|---|---|---|
| Hosting multiple versions | A stage is a named reference to a deployment, which is a snapshot of the API. Stage settings enable caching, customize request throttling, configure logging, define stage variables, and attach a canary release for testing | [Section 7.1](#71-api-gateway-stages) |
| Configuring API keys | Configuring usage plans and API keys lets customers access APIs based on agreed request rates and quotas | [Section 7.6](#76-throttling-and-usage-plans) |
| Throttle limits | Prevents the API from being overwhelmed by too many requests | [Section 7.6](#76-throttling-and-usage-plans) |
| Access control and management | Standard IAM roles and policies, resource policies, CORS, Lambda authorizers | [Section 3.4](#34-valid-method-authorization-values) |
| Data transformation | A method request can select from several payload types in the corresponding integration request depending on backend needs, and the backend can return an integration response payload different from what the frontend expects | [Chapter 4](#4-request-and-response-handling) |
| SDK generation | Supported languages are Java, JavaScript, Java for Android, Objective-C or Swift for iOS, and Ruby. **This matches the current documentation exactly** | [Section 5.3](#53-importing-and-exporting-api-definitions) |
| Mock integrations | Generates responses directly from API Gateway without an integration backend | [Section 6.3](#63-mock-integrations) |
| Response caching | Reduces the number of calls made to the endpoint and improves request latency | [Section 7.5](#75-response-caching) |

For access control the courseware lists only four items. 🆕 The current documentation's list is broader.

| Purpose | Mechanism |
|---|---|
| Authentication and authorization | Resource policies, standard AWS IAM roles and policies, IAM tags, endpoint policies for interface VPC endpoints, **Lambda authorizers**, **Amazon Cognito user pools** |
| Other access-control tasks | CORS, client-side SSL certificates, **AWS WAF** |
| Tracking and limiting granted access | **Usage plans** (track and limit stage and method usage per API key) |

> — Source: [Control and manage access to REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html)
> — Source: [Generate SDKs for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html)

### 2.7 Private REST APIs and AWS WAF 🆕

The slide 10 instructor notes mention private REST APIs and VPC endpoint policies under security, and AWS WAF integration under control, one sentence each. Both statements match the current documentation, and the following is added.

**Private REST APIs.** You access them through an interface VPC endpoint, an endpoint network interface you create in your VPC, and interface endpoints are powered by **AWS PrivateLink**. You can also use Direct Connect to establish a connection from an on-premises network to the Amazon VPC and reach the private API over it. In all cases traffic is isolated from the public internet and does not leave the Amazon network.

| Item | Content |
|---|---|
| Best practices | Use a single VPC endpoint for multiple private APIs / associate the VPC endpoint with the API (a Route 53 alias DNS record is created) / turn on private DNS for your VPC (invoke without the `Host` or `x-apigw-api-id` header) / add `aws:SourceVpc` or `aws:SourceVpce` conditions to the resource policy |
| Caution | If you turn on private DNS you **cannot access the default endpoint for public APIs** |
| Considerations | Only REST APIs are supported / a private API cannot be converted to edge-optimized / **only TLS 1.2 is supported** / HTTP/2 requests are enforced to HTTP/1.1 / only dualstack IP address type |

**AWS WAF.** A web access control list (web ACL) blocks attacks such as SQL injection and cross-site scripting. You can create rules matching a string or regular expression pattern in HTTP headers, method, query string, URI, and the request body (**limited to the first 64 KB**), and rate-based rules that specify how many web requests each client IP is allowed in a trailing, continuously updated five-minute period.

🆕 An important ordering rule: **when AWS WAF is enabled on an API, AWS WAF rules are evaluated before resource policies, IAM policies, Lambda authorizers, and Amazon Cognito authorizers.** If AWS WAF blocks a CIDR block that a resource policy allows, AWS WAF takes precedence and the resource policy is not evaluated. The web ACL is associated with **an API stage**.

Security is a **shared responsibility** between AWS and you. The shared responsibility model divides this into 'security of the cloud' (AWS) and 'security in the cloud' (the customer).

> — Source: [Private REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html)
> — Source: [Use AWS WAF to protect your REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html)
> — Source: [Security in Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html)

---

## 3. Working with API Gateway

### 3.1 How API Gateway Works in the Application

This is the flow on courseware slide 12. On the request side API Gateway performs **authorization, configuration, instrumentation, transformation, and mapping**; on the response side it performs **configuration, transformation, and mapping**. The slide note is blunt: "Note: configuration is the developer's responsibility."

When you create an API method you must integrate the method with an endpoint in the backend. The backend endpoint is also called the **integration endpoint** and can be a Lambda function, an HTTP webpage, or an AWS service action.

| Setting | Tasks involved |
|---|---|
| Integration request setup | Verifying messages for any authorization / configuring how the client-submitted method request is forwarded to the backend / configuring how request data is transformed into integration request data if needed / specifying which Lambda function to invoke / specifying the HTTP server to forward the incoming request to, or the AWS service action to invoke |
| Integration response setup (**non-proxy integrations only**) | Configuring how the result returned from the backend is passed to a method response of a given status code / configuring how specified integration response parameters are transformed into preconfigured method response parameters / configuring how the integration response body is mapped to the method response body according to a body mapping template |

The courseware statement that integration response setup applies only to non-proxy integrations matches the current documentation. With a proxy integration you set neither the integration request nor the integration response.

> — Source: [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html)

### 3.2 Core Components of a REST API

A REST API consists of resources and methods. A **resource** is a logical entity that an application can access through a resource path, and a **method** is the client-side interface a client uses to call the API to access backend resources.

An **API endpoint** is the hostname of an API deployed to a specific Region, of the form `{api-id}.execute-api.{region}.amazonaws.com`. This matches courseware slide 13 exactly.

```http
GET https://{api-id}.execute-api.{region}.amazonaws.com/notes
```

The hierarchy is API endpoint → resource → method → resource configuration (request, response, integration). Typical methods are `GET`, `POST`, `HEAD`, and `DELETE`, and you can choose others including `ANY`.

The slide 13 instructor notes say "In this example the API resources are listed as `/notes`, `/notes/search`, and **`/notes/list`**," but the diagram on the same slide has only `/notes` and `/notes/search`, and the method list on slide 9 has no `/notes/list` either. This is **a statement the courseware contradicts internally**, and AWS documentation cannot settle which is the correct design for this application. This document uses the two resources from the diagram and slide 9 ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

> — Source: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 3.3 Endpoint Types and the Default 🔄

The courseware's names and characteristics for the three endpoint types match the current documentation.

| Type | Content |
|---|---|
| Edge-optimized | Typically routes requests to the nearest CloudFront Point of Presence, which helps when clients are geographically distributed. Capitalizes HTTP header names (for example `Cookie`), and CloudFront sorts cookies by name before forwarding to the origin. A custom domain name applies across all Regions |
| Regional | Intended for clients in the same Region. When a client running on an EC2 instance calls an API in the same Region, or when the API serves a small number of clients with high demands, it reduces connection overhead. A custom domain name is specific to the Region where the API is deployed and can be used with Route 53 for latency-based routing. Passes header names through as-is |
| Private | Accessible only from your Amazon VPC through an interface VPC endpoint (ENI) created in your VPC. Passes header names through as-is |

🔄 What needs correcting is the default. The slide 13 instructor notes state "In endpoint type, **the Regional API endpoint is selected by default**." The current documentation, describing edge-optimized endpoints, states **"This is the default endpoint type for API Gateway REST APIs,"** and the concepts page also defines an edge-optimized API endpoint as "the default hostname of an API Gateway API." If most of your clients are in the same Region, select the Regional type explicitly.

> — Source: [API endpoint types for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html)

### 3.4 Valid Method Authorization Values 🔄

The slide 13 note reads "You control method access through authorization. The default is set to none or AWS_IAM," and the instructor notes list only two valid values. 🔄 In the `PutMethod` API reference, `authorizationType` is a **required parameter** and there are four valid values.

| Value | Meaning |
|---|---|
| `NONE` | Open access. No client authentication is performed |
| `AWS_IAM` | API Gateway uses IAM permissions to control client access. The client must sign requests with an AccessKey and SecretKey and must support **Signature Version 4 (SigV4)** |
| `CUSTOM` | A custom authorizer, that is, a **Lambda authorizer** |
| `COGNITO_USER_POOLS` | An **Amazon Cognito user pool** authorizer |

`authorizerId` specifies the `Authorizer` to use when the type is `CUSTOM` or `COGNITO_USER_POOLS`. `apiKeyRequired` is a Boolean, matching the courseware guidance "To require an API key to call the method, set API Key Required to true."

**Lambda authorizers.** 🆕 The documentation states that this feature was **formerly known as a custom authorizer**. You will meet that name in older material. There are two types.

| Type | Identity source | Characteristics |
|---|---|---|
| `REQUEST` (**recommended by the documentation**) | A combination of headers, query string parameters, `stageVariables`, and `$context` variables | Lets you create fine-grained policies from multiple identity sources and separate cache keys. With caching on, if a specified identity source is missing, `null`, or empty, API Gateway returns `401 Unauthorized` without calling the function |
| `TOKEN` | A bearer token such as a JWT or OAuth token | With caching on, the header name in the token source becomes the cache key. You can pre-validate the token with an `IdentityValidationExpression` regular expression (TOKEN only) |

The authorizer takes the caller's identity as input and returns **an IAM policy and a principal identifier**. If it does not return them, the call fails. If access is denied API Gateway returns a status code such as `403 ACCESS_DENIED`; if allowed, it invokes the method.

**Amazon Cognito user pool authorizers.** You create an authorizer of the `COGNITO_USER_POOLS` type and configure the method to use it. The client signs the user in to the user pool, obtains an identity or access token, and calls the method with that token, typically in the `Authorization` header. The identity token authorizes based on identity claims of the signed-in user; the access token authorizes based on custom scopes of access-protected resources. Cognito is covered in detail in Module 12.

> — Source: [PutMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethod.html)
> — Source: [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
> — Source: [Control access to REST APIs using Amazon Cognito user pools as an authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)

### 3.5 Integration Types 🔄

You choose an integration type according to the type of integration endpoint you work with and how data passes to and from it. Programmatically you set the `type` property on the `Integration` resource.

| Category | Initial setup | Request and response configuration | Passthrough | `type` value |
|---|---|---|---|---|
| Proxy | Flexible, versatile, streamlined integration setup | You set neither the integration request nor the integration response | There is no option to modify passthrough behavior | `AWS_PROXY`, `HTTP_PROXY` |
| Non-proxy | Data mapping is your responsibility | You must configure both the integration request and the integration response | You can choose the passthrough behavior | `AWS`, `HTTP` |
| Mock | Useful for API testing | Returns a response without sending the request to a backend | Not applicable (no backend is called) | `MOCK` |

The table on courseware slide 14 puts `MOCK` in both the Passthrough column and the integration type column for the Mock row, which breaks the meaning of the column. The table above corrects that cell ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

Definitions by type.

| `type` | Definition |
|---|---|
| `AWS` | The API exposes AWS service actions. You must configure both the integration request and integration response and set up the necessary data mappings. When the action is the Lambda function-invoking action this is called the **Lambda custom integration**, a special case of the `AWS` integration |
| `AWS_PROXY` | **Lambda proxy integration.** Relies on direct interactions between the client and the integrated Lambda function. You set neither the integration request nor the integration response; API Gateway passes the incoming request as the function input. **It is not applicable to any other AWS service action, including Lambda actions other than function invocation** |
| `HTTP` | **HTTP custom integration.** Exposes backend HTTP endpoints; you must configure both the integration request and the integration response |
| `HTTP_PROXY` | **HTTP proxy integration.** Lets a client access backend HTTP endpoints with a single API method. You set neither the integration request nor the integration response; requests and responses pass through |
| `MOCK` | API Gateway returns a response without sending the request to a backend. Lets you test the integration setup without incurring backend charges and enables collaborative development |

🔄 Three places where the courseware differs.

| Item | Courseware | Current documentation |
|---|---|---|
| Lambda integration recommendation | Lists Lambda proxy and Lambda custom as equals | **Lambda proxy is "the preferred integration type to call a Lambda function through API Gateway."** The setup is simple and can evolve with the backend without tearing down the existing setup. Lambda custom integration is for reusing mapping templates across endpoints with similar input and output format requirements and is recommended for more advanced scenarios |
| `HTTP` and `HTTP_PROXY` definitions | "Integrates with HTTP endpoints, including private HTTP endpoints in a VPC" | Both types are **backend HTTP endpoint** integrations. Private integrations are a **separate setup**: `HTTP_PROXY` + `connectionType=VPC_LINK` + a VPC link V2. VPC link V2 can target both an NLB and an ALB, and `connectionId` can be supplied through a stage variable |
| Purpose of Mock integrations | Testing | Beyond testing and collaborative development, they are also used to **return CORS-related headers**. The API Gateway console integrates the `OPTIONS` method with a mock integration to support CORS, and gateway responses are another example of mock integrations |

**Integrations that HTTP APIs support.** 🔄 The slide 14 instructor notes list "Lambda proxy / AWS services / private resources in a VPC / **Mock** and HTTP proxy integrations." The integrations table in the REST versus HTTP comparison document marks **Mock integrations as REST API only**. The remaining items are correct.

> — Source: [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html)
> — Source: [Set up a private integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html)
> — Source: [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html)

### 3.6 Lambda Proxy Integration Input and Output Formats 🆕

The courseware describes `AWS_PROXY` only as "integrates the API method request with the Lambda function-invoking action using the client request as-is." In practice there are **fixed input and output formats**, and not honoring them makes the call fail.

The request data passed includes request headers, query string parameters, URL path variables, the payload, and API configuration data (current deployment stage name, stage variables, user identity, authorization context). **The order of the request parameters is not preserved.**

```json
{
  "resource": "/my/path",
  "path": "/my/path",
  "httpMethod": "GET",
  "headers": { "header1": "value1" },
  "multiValueHeaders": { "header2": ["value1", "value2"] },
  "queryStringParameters": { "parameter1": "value1" },
  "multiValueQueryStringParameters": { "parameter2": ["value1", "value2"] },
  "requestContext": { "accountId": "123456789012", "stage": "prod" },
  "pathParameters": null,
  "stageVariables": null,
  "body": "Hello from Lambda!",
  "isBase64Encoded": false
}
```

The function must return the following format. If the output is of a different format, API Gateway returns **`502 Bad Gateway`**.

```json
{
  "isBase64Encoded": false,
  "statusCode": 200,
  "headers": { "Access-Control-Allow-Origin": "*" },
  "multiValueHeaders": { "Set-Cookie": ["a=1", "b=2"] },
  "body": "..."
}
```

| Item | Content |
|---|---|
| `headers` vs `multiValueHeaders` | `headers` can only contain single-value headers; `multiValueHeaders` can contain both multi-value and single-value headers. If you specify both they are merged, and if the same key-value pair appears in both, only the `multiValueHeaders` values remain |
| CORS | Add `Access-Control-Allow-Origin` to the output `headers` |
| Binary data | If `body` is a binary blob, set `isBase64Encoded` to `true` and configure `*/*` as a binary media type |
| Authorization context | `AWS_IAM` passes `$context.identity.*`; `COGNITO_USER_POOLS` passes `$context.identity.cognito*` and `$context.authorizer.claims.*`; `CUSTOM` passes `$context.authorizer.principalId` and other applicable `$context.authorizer.*` properties |
| Proxy resource | Combine the `{proxy+}` templated path variable with the catch-all `ANY` method to accept an entire path hierarchy through a single method. `{proxy+}` can refer to any resource along a path hierarchy, while `{custom}` refers to a particular path segment only |

Proxy integration requires the client to know more about backend requirements, so the backend developer must communicate those requirements clearly and provide a robust error feedback mechanism when they are not met.

🆕 **Payload format version for HTTP APIs.** When you create a Lambda proxy integration for an HTTP API you specify `payloadFormatVersion`. The console defaults to the latest version, but **when you use the AWS CLI, CloudFormation, or an SDK you must specify it**. The supported values are `1.0` and `2.0`.

| Difference | `1.0` | `2.0` |
|---|---|---|
| Multi-value fields | Has `multiValueHeaders` and `multiValueQueryStringParameters` | Does not. Duplicate headers and query strings are combined with commas into `headers` and `queryStringParameters` |
| Path | `path` | Adds `rawPath`. To access the API mapping value for a custom domain name, use `1.0` and `path` |
| Cookies | Handled as headers | Adds a `cookies` field. In the response each cookie becomes a `set-cookie` header |
| Response inference | None. You must return `isBase64Encoded`, `statusCode`, `headers`, `multiValueHeaders`, and `body` | If the function returns valid JSON without a `statusCode`, API Gateway assumes `isBase64Encoded=false`, `statusCode=200`, `content-type=application/json`, and `body=` the function's response |

> — Source: [Lambda proxy integrations in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html)
> — Source: [Create AWS Lambda proxy integrations for HTTP APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html)

### 3.7 Integration Passthrough Behavior 🔄

If a method request has a payload and there is no mapping template defined for the `Content-Type` header, the client-supplied payload can pass through to the backend without transformation. This process is known as **integration passthrough**.

🔄 The slide 14 instructor notes describe this as "two conditions." The current documentation describes it as **a setting with three options** and marks the recommended value.

| Console label | `passthroughBehavior` | Behavior |
|---|---|---|
| When no template matches the request Content-Type header | `WHEN_NO_MATCH` | Passes the body through untransformed when the method request content type does not match any content type associated with the mapping templates (courseware condition ①) |
| When there are no templates defined (**recommended**) | `WHEN_NO_TEMPLATES` | Passes the body through untransformed only when no mapping template is defined in the integration request. If a template is defined and the content type does not match, the request is rejected with **`415 Unsupported Media Type`** (courseware condition ②) |
| Never | `NEVER` | Does not pass through even when no mapping template is defined, and rejects unmapped content types with `415` |

When there is no `Content-Type` header, API Gateway defaults to `application/json`. The courseware statement that API Gateway passes the entire request to the backend for proxy integrations and that passthrough behavior cannot be modified is correct.

> — Source: [Method request behavior for payloads without mapping templates for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/integration-passthrough-behaviors.html)

### 3.8 REST API Quotas 🆕

The courseware does not cover quotas. These are the values you run into during design.

| Item | Default quota | Increase |
|---|---|---|
| **Integration timeout** (all endpoint types, all integration types) | **50 milliseconds – 29 seconds** | Regional and private APIs can be raised above 29 seconds, but this might require reducing the Region-level throttle quota for your account. Edge-optimized cannot be raised. You cannot set it below 50 milliseconds |
| **Payload size** | **10 MB** | No |
| Idle connection timeout | 310 seconds | No |
| Resources per API | 300 | Yes (use `{proxy+}` paths to reduce the number of resources) |
| Stages per API | 10 | Yes (you can also split the API into multiple APIs) |
| Authorizers per API (Lambda and Cognito) | 10 | Yes (reuse authorizers across API methods) |
| Model size per API | 400 KB | No |
| Regional APIs / edge-optimized APIs / private APIs | 600 per Region / 120 per Region / 600 per account per Region | No |
| API keys per account per Region | 10,000 | No |
| Usage plans per API key | 10 | Yes |

The management operations themselves also have quotas, none of which can be increased. These matter when you write automation scripts.

| Operation | Quota |
|---|---|
| `CreateDeployment` | 1 request every 5 seconds per account |
| `CreateRestApi` / `ImportRestApi` (Regional, private) | 1 request every 3 seconds per account |
| `CreateRestApi` / `ImportRestApi` / `DeleteRestApi` (edge-optimized) | 1 request every 30 seconds per account |
| `CreateApiKey` / `CreateResource` / `DeleteApiKey` / `DeleteResource` | 5 requests per second per account |
| `PutRestApi` | 1 request per second per account |
| `GetResources` | 5 requests every 2 seconds per account |
| `UpdateUsagePlan` | 1 request every 20 seconds per account |

> — Source: [Quotas for configuring and running a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html)
> — Source: [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html)

---

## 4. Request and Response Handling

### 4.1 Request and Response Handling Flow

This is the flow on courseware slide 16.

| Direction | Steps |
|---|---|
| Request processing | Client → method request payload → **request validation · request model · request mapping** → integration request → backend service |
| Response processing | Backend service → integration response → **response mapping template · response model** → method response payload → client |

The two directions a mapping template maps are **method request → the corresponding integration request** and **integration response → the corresponding method response**. The concepts page also defines a mapping template as "a script in VTL that transforms a request body from the frontend data format to the backend data format, or that transforms a response body from the backend data format to the frontend data format," notes that it can be specified in the integration request or the integration response, and states that it can reference data made available at runtime as context and stage variables.

> — Source: [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html)

### 4.2 Three Choices for Data Transformation 🆕

The courseware explains request and response handling across five slides, all centered on mapping templates. Mapping templates still work exactly as described and the courseware is not wrong, but **the recommended order in the current documentation is different.**

| Rank | Method | What the documentation says |
|---|---|---|
| 1 | **Proxy integration** | Both the data transformations page and the mapping templates page recommend "when possible, use a proxy integration to transform your data." A proxy integration has a streamlined setup and can evolve with the backend without tearing down the existing setup |
| 2 | **Parameter mapping** | Modifies integration request URL path parameters, URL query string parameters, and HTTP header values. **It cannot modify the integration request payload.** It can also modify HTTP response header values. Use it to create static header values for CORS. **It requires no VTL scripting.** Available in the integration request for both proxy and non-proxy integrations, but for an integration response you need a non-proxy integration |
| 3 | **Mapping template transformations** | Use these when you need to change the body, or perform conditional overrides and status code overrides, and you cannot use a proxy integration |

API Gateway performs a mapping template transformation **only when a mapping template is defined for that `Content-Type`**. If you do not define one, the body passes through by default, and you change that behavior with the passthrough setting in [Section 3.7](#37-integration-passthrough-behavior).

> — Source: [Data transformations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html)
> — Source: [Mapping template transformations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings.html)

### 4.3 Example: Request Model

A model defines the data structure of a payload and is expressed using **JSON schema draft 4**. Here are the request payload and model from courseware slide 17.

```json
{
  "UserId": "StudentA",
  "Notes": [
    {
      "Note": "Hello World!",
      "NoteId": 11
    }
  ]
}
```

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "NotesInputModel",
  "type": "object",
  "required": ["UserId"],
  "properties": {
    "UserId": { "type": "string" },
    "Notes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["NoteId", "Note"],
        "properties": {
          "Note": { "type": "string" },
          "NoteId": { "type": "integer" }
        }
      }
    }
  }
}
```

The three uses of a model in the courseware instructor notes match the current documentation.

| Use | Content |
|---|---|
| Basic request validation | The `required` keyword specifies mandatory properties and the payload is validated against them |
| Creating mapping templates | Convenient for generating a sample mapping template to start from. Note, however, that **a model is not required to create a mapping template** |
| Generating a strongly typed SDK | In strongly typed languages such as Java, Objective-C, or Swift the model corresponds to a **user-defined data type (UDT)**. If no model is provided, API Gateway uses the empty model to create a default UDT |

🆕 Capabilities the courseware does not cover. You can restrict allowed values with `enum` and constrain numeric ranges with `minimum` and `maximum`. Long models can use the reference primitive (`$ref`) to point at reusable definitions in `definitions`, and can reference a model in another API through the `apigateway.amazonaws.com` model path. The model size limit per API is 400 KB.

> — Source: [Data models for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings-models.html)

### 4.4 Request Validation 🔄

You can configure API Gateway to perform basic validation of an API request **before proceeding with the integration request**. When validation fails, API Gateway immediately fails the request, returns a **`400` error response** to the caller, and publishes the validation results in CloudWatch Logs. This reduces unnecessary calls to the backend.

| What is validated | Documentation content |
|---|---|
| Request parameters | Checks that required request parameters in the URI, query string, and headers are included and not blank. 🆕 **API Gateway only checks the existence of a parameter and does not check the type or format** |
| Request payload | Checks that the applicable payload adheres to the configured JSON schema for the given content type. If no matching content type is found, request validation is not performed. To use the same model regardless of content type, set the data model's content type to `$default` |

Here is the request validator configuration from courseware slide 18. 🔄 The courseware writes the two values as the strings `"false"` and `"true"`, but in the `RequestValidator` API reference both fields are **Boolean**, so they go without quotes. The string `"false"` can be treated as truthy in JSON and behave contrary to intent.

```json
{
  "name": "params-only",
  "validateRequestBody": false,
  "validateRequestParameters": true
}
```

The request on courseware slide 18 is an example where the required parameter `q1` must be set and non-blank.

```http
GET /testStage/validation?q1=StudentA HTTP/1.1
Host: abcdef123.execute-api.us-east-1.amazonaws.com
Content-Type: application/json
Accept: application/json
```

The method request payload on the same slide writes the array element key as **`Notes`** rather than `Note`. Because `NotesInputModel` on slide 17 requires `Note` in each array element, validating this payload against that model fails with `400`. This is **a statement the courseware contradicts internally**, so this document follows the slide 17 model and uses `Note` ([Section 9.1](#91-courseware-statements-that-do-not-match-the-facts)).

```json
{
  "UserId": "StudentA",
  "Notes": [
    {
      "Note": "Hello World!",
      "NoteId": 11
    }
  ]
}
```

> — Source: [Request validation for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html)
> — Source: [RequestValidator](https://docs.aws.amazon.com/apigateway/latest/api/API_RequestValidator.html)

### 4.5 Mapping Templates: Request Direction 🔄

A mapping template is a script expressed in **Velocity Template Language (VTL)** and applied to a payload using **JSONPath** based on the `Content-Type` header. Directives begin with the `#` symbol.

What a mapping template does (courseware slide 19 instructor notes) matches the current documentation.

- Matches the payload to an API-specified format
- Maps parameters one to one
- Maps a family of integration response status codes matched by a regular expression to a single response status code

The last item is realized by using a regular expression such as `2\d{2}` as a key in the `responses` object of `x-amazon-apigateway-integration`. In the low-level API, `selectionPattern` on the integration response plays the same role.

🔄 The template on courseware slide 19 will not fill in values if you run it as-is. It declares `$inputRoot` with `#set` but never uses it, and it references `$elem` **without an iteration directive**. In the official examples, collection iteration always begins with `#foreach` and closes with `#end`.

The courseware original (run as-is, the `Notes` values come out empty):

```text
#set($inputRoot = $input.path('$'))
{
  "Environment": "$stageVariables.environment",
  "Notes": [{
    "NoteId": "$elem.NoteId",
    "Note": "$elem.Note"  }]
}
```

The corrected form (iterate `$inputRoot.Notes` with `#foreach` and insert commas with `$foreach.hasNext`):

```text
## Take the root of the request body into $inputRoot
#set($inputRoot = $input.path('$'))
{
  "Environment": "$stageVariables.environment",
  "Notes": [
    ## Iterate the Notes array. $elem is defined by this loop
    #foreach($elem in $inputRoot.Notes)
    {
      "NoteId": "$elem.NoteId",
      "Note": "$util.escapeJavaScript($elem.Note)"
    }#if($foreach.hasNext),#end
    #end
  ]
}
```

The same template produces different payloads depending on the value of the `environment` stage variable.

```json
{
  "Environment": "prod",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

```json
{
  "Environment": "dev",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

> — Source: [Examples using variables for mapping template transformations for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-variable-examples.html)
> — Source: [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html)

### 4.6 Mapping Templates: Response Direction

Courseware slide 20 is an example of transforming a JSON payload into XML in the response direction and stripping environment information the response does not need. The backend payload is as follows.

```json
{
  "Environment": "prod",
  "Notes": [{ "NoteId": "11", "Note": "Hello World!" }]
}
```

The courseware template leaves `$elem` undefined for the same reason as in [Section 4.5](#45-mapping-templates-request-direction). Here is the corrected form.

```text
## Take the root of the integration response body into $inputRoot
#set($inputRoot = $input.path('$'))
#foreach($elem in $inputRoot.Notes)
<Notes>
<NoteId>$elem.NoteId</NoteId>
<Note>$elem.Note</Note>
</Notes>
#end
```

`Environment` disappears from the method response payload.

```text
<Notes>
<NoteId>11</NoteId>
<Note>Hello World!</Note>
</Notes>
```

### 4.7 Variables Available in Mapping Templates 🆕

The courseware uses only `$input.path('$')` and `$stageVariables.environment`. There are four families of variables available.

**`$input` — method request payload and parameters**

| Variable and function | Description |
|---|---|
| `$input.body` | Returns the raw request payload as a string. Useful for preserving entire floating point numbers such as `10.00` |
| `$input.json(x)` | Evaluates a JSONPath expression and returns the result as a **JSON string** |
| `$input.path(x)` | Takes a JSONPath expression string and returns a **JSON object representation** of the result. Lets you access and manipulate payload elements natively in VTL, and calling `.size()` on a list returns the element count |
| `$input.params()` | Returns a map of all request parameters. The documentation recommends sanitizing the result with `$util.escapeJavaScript` to avoid a potential injection attack |
| `$input.params(x)` | Returns a method request parameter value, searching **path, then query string, then header** |

**`$context` — request context** (case sensitive, 52 entries in the table)

| Variable | Description |
|---|---|
| `$context.accountId` | The API owner's AWS account ID |
| `$context.apiId` | The identifier API Gateway assigns to your API |
| `$context.authorizer.claims.property` | A property of the claims returned from the Cognito user pool. **Calling `$context.authorizer.claims` itself returns null** |
| `$context.authorizer.principalId` | The principal user identification returned from a Lambda authorizer |
| `$context.authorizer.property` | The **stringified** value of the specified key-value pair of the `context` map returned from a Lambda authorizer function. The only supported special character in the property name is the underscore |

**`$stageVariables` — stage variables.** Written as `$stageVariables.variable_name`, `$stageVariables['variable_name']`, or `${stageVariables['variable_name']}`.

**`$util` — utility functions** (default character set UTF-8)

| Function | Description |
|---|---|
| `$util.escapeJavaScript()` | Escapes characters using JavaScript string rules. Single quotes become `\'`, which is not valid in JSON, so you must turn them back when the output is used in a JSON property |
| `$util.parseJson()` | Takes stringified JSON and returns an object representation |
| `$util.urlEncode()` / `$util.urlDecode()` | Converts to and from `application/x-www-form-urlencoded` format |
| `$util.base64Encode()` / `$util.base64Decode()` | Base64 encoding and decoding |

If the JSON input contains unescaped characters that JavaScript cannot parse, API Gateway might return `400`, so the documentation advises applying `$util.escapeJavaScript()`.

> — Source: [Variables for data transformations for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

---

## 5. API Design as Code

### 5.1 From Swagger to OpenAPI 🔄

Courseware slide 22 is titled "Designing APIs with Swagger," its YAML begins with `swagger: "2.0"`, and the instructor notes list "Swagger features." 🔄 The current documentation calls this **"Develop REST APIs using OpenAPI in API Gateway"** and states support for **OpenAPI v2.0** (equivalent to Swagger 2.0) and **OpenAPI v3.0**. The extensions page is titled "OpenAPI extensions for API Gateway" (the URL path still contains `swagger-extensions`).

The features the courseware lists changed only in name; the content is the same.

| Courseware feature | Current documentation |
|---|---|
| API definition as code / portable API definition | You can import a REST API from and export it to an external definition file |
| JSON / YAML | On export, set the `Accept` header to `application/json` or `application/yaml` |
| API import / export | Import can overwrite with a new definition or merge with an existing API, selected with the `mode` query parameter |
| API Gateway extensions | The `x-amazon-apigateway-*` extensions. There are now more than 20 |
| Standalone or as part of an AWS CloudFormation template | Still valid |

Rewriting the courseware YAML excerpt in OpenAPI 3.0 form gives the following.

```yaml
openapi: "3.0.1"
info:
  title: "PollyNotesAPI"
paths:
  /notes/search:
    get:
      security:
        - PollyNotesPool: []
      x-amazon-apigateway-integration:
        # Always specify the integration type. Lambda proxy is aws_proxy
        type: "aws_proxy"
        # For Lambda function invocation, httpMethod must be POST
        httpMethod: "POST"
        uri: "arn:aws:apigateway:[AWS_Region]:lambda:path/2015-03-31/functions/arn:aws:lambda:[AWS_Region]:[AWS_AccountId]:function:searchFunction/invocations"
        payloadFormatVersion: "1.0"
        responses:
          default:
            statusCode: "200"
```

The courseware excerpt has no `type` property to establish the integration type. The excerpt does contain `...`, so it may simply be elided, but in a real definition `type` determines the nature of the integration and must always be specified.

> — Source: [Develop REST APIs using OpenAPI in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-import-api.html)
> — Source: [OpenAPI extensions for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions.html)

### 5.2 The x-amazon-apigateway-integration Extension 🆕

The courseware presents extensions as a single bullet. `x-amazon-apigateway-integration` is an extended property of the OpenAPI Operation object, and the result is an API Gateway `Integration` object. Here are the main properties.

| Property | Content |
|---|---|
| `type` | `http`, `http_proxy`, `aws_proxy`, `aws`, `mock` (**lowercase**) |
| `uri` | The endpoint URI of the backend. An ARN value for the `aws` type; a URL including the `https` or `http` scheme for HTTP integrations |
| `httpMethod` | The HTTP method used in the integration request. **For Lambda function invocations the value must be `POST`** |
| `credentials` | The ARN of an IAM role for role-based credentials. If unspecified, credentials default to resource-based permissions that must be added manually |
| `connectionType` / `connectionId` | `VPC_LINK` for private integrations or `INTERNET` otherwise / the VPC link ID |
| `passthroughBehavior` | `when_no_templates`, `when_no_match`, `never` ([Section 3.7](#37-integration-passthrough-behavior)) |
| `payloadFormatVersion` | The format of the payload sent to an integration. **Required for HTTP APIs**; Lambda proxy supports `1.0` and `2.0`, all other integrations support `1.0` only |
| `requestTemplates` / `requestParameters` | Mapping templates for request payloads of specified MIME types / parameter mappings |
| `responses` | The method's responses and the integration response to method response mapping. Keys can be a regular expression such as `2\d{2}`, a status code such as `302`, or `default` |
| `timeoutInMillis` | Integration timeout. **50 ms to 29,000 ms** |
| `contentHandling` | `CONVERT_TO_TEXT` or `CONVERT_TO_BINARY` |
| `responseTransferMode` 🆕 | `BUFFERED` waits to receive the complete response; `STREAM` sends partial responses to the client as they become available |
| `cacheNamespace` / `cacheKeyParameters` | An API-specific tag group of related cached parameters / a list of request parameters whose values are to be cached |
| `integrationSubtype` / `integrationTarget` | The AWS service integration subtype for HTTP APIs / the ALB or NLB listener for VPC link V2 private integrations |

Double quotes in the JSON strings inside mapping templates must be string-escaped (`\"`).

> — Source: [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html)

### 5.3 Importing and Exporting API Definitions 🆕

**Importing.** OpenAPI v2.0 and v3.0 definition files are supported, with exceptions listed in the REST API important notes document. The `mode` query parameter selects overwrite or merge.

**Exporting.** You export through the API Gateway Export API and must sign your API requests.

| Item | Content |
|---|---|
| Request path | `exports/oas30` under the stage path for OpenAPI 3.0, `exports/swagger` for OpenAPI 2.0 |
| Including extensions | `extensions` query string with `integration` (API Gateway extensions) or `postman` (Postman extensions) |
| Format | `Accept` header set to `application/json` or `application/yaml` |
| Console | Stages pane → Stage actions → Export, specifying API specification type, format, and extensions |
| Constraints | You cannot export an API whose payloads are not of the `application/json` type. If you define models, their content type must be `application/json`, and models must contain properties or be defined as a particular JSONSchema type |

To include the request validator extension when exporting with the CLI you must add `--parameters extensions='apigateway'`.

```bash
# Export as OpenAPI 2.0 (swagger) including the request validator extension
aws apigateway get-export \
    --parameters extensions='apigateway' \
    --rest-api-id abcdefg123 \
    --stage-name dev \
    --export-type swagger \
    latestswagger2.json
```

**SDK generation.** The supported language list on courseware slide 10 (Java, JavaScript, Java for Android, Objective-C or Swift for iOS, Ruby) **matches the current documentation exactly.** You generate the SDK after creating, testing, and deploying the API to a stage, and it must be deployed at least once. The AWS CLI can also generate SDKs.

Matching the courseware's "rich third-party resources when using tooling," the export documentation supports Postman extensions. Postman itself is a third-party tool that AWS does not operate, at `www.postman.com`.

> — Source: [Export a REST API from API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-export-api.html)
> — Source: [Generate SDKs for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-generate-sdk.html)

---

## 6. Testing the API

### 6.1 Calling a REST API

Start with the note on slide 24: **"Note: to call the API URL you must first deploy it to API Gateway."** When calling a deployed API, the client submits requests to the URL of the API Gateway component service for API execution, named **`execute-api`**.

```text
https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
```

| Part | Meaning |
|---|---|
| `{restapi_id}` | The API identifier |
| `{region}` | The AWS Region |
| `{stage_name}` | The name of the API deployment stage |

You can test a REST API with the invoke URL, the API Gateway console, or a third-party tool such as Postman. If the API allows anonymous access you can call any `GET` method by pasting the invoke URL into a browser address bar.

### 6.2 Testing with the API Gateway Console 🔄

🔄 The slide 25 instructor notes say "To call a REST API in the API Gateway console, choose TEST in the Client box of the Method Execution pane." The Method Execution pane and the Client box belong to the previous console UI. Here is the current procedure.

1. Sign in to the API Gateway console
2. Choose a REST API
3. In the **Resources** pane, choose the method you want to test
4. Choose the **Test** tab (you might need to choose the right arrow button to show the tab)
5. Enter values in the Query strings, Headers, and Request body boxes. The console includes these values in the method request in default `application/json` form
6. Choose **Test**

The results shown are Request (the resource path that was called), Status (the response HTTP status code), Latency (ms) (the time between receipt of the request and the returned response), Response body, Response headers, and Logs. Depending on the mapping, the status code, response body, and response headers might differ from what the Lambda function or HTTP proxy sent.

The caution on courseware slide 26 matches the current documentation's Important paragraph sentence for sentence. **Testing a method with the console is the same as calling the method outside of the console.** For example, if you use the console to call a method that deletes an API's resources and the call succeeds, those resources really are deleted. Changes may be impossible to undo.

🆕 One thing to add is the logs. The Logs in the test result are **simulated** CloudWatch Logs entries that would have been written if the method were called outside the console. The logs are simulated, but **the results of the method call are real.**

> — Source: [Use the API Gateway console to test a REST API method](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-test-method.html)

### 6.3 Mock Integrations

Mock integrations generate API responses directly from API Gateway without an integration backend. The three benefits the courseware lists (testing without a completed backend / testing various scenarios before production deployment / speeding up API development) match the current documentation, and the documentation adds provisioning a **landing page** that gives an overview of and navigation to your API.

The API developer decides how API Gateway responds to a mock integration request. You configure the method's integration request and integration response to associate a response with a given status code.

```text
## Integration request mapping template: return a 200 response
{"statusCode": 200}
```

```text
## Integration request mapping template: return a 500 error response
{"statusCode": 500}
```

You can also return different status codes conditionally.

```text
## Return 200 if the scope query parameter is internal, otherwise 500
{
  #if( $input.params('scope') == "internal" )
    "statusCode": 200
  #else
    "statusCode": 500
  #end
}
```

You can also have the method return the **default integration response** (the one with an undefined HTTP status regex) without defining an integration request mapping template. In that case make sure appropriate passthrough behaviors are set.

🆕 A caution from the documentation: mock integrations **are not intended to support large response templates.** For that use case, consider a Lambda integration instead.

This is why the answer to courseware knowledge check question 3 ("Mock integrations only respond with a 200 status code for API methods") is false.

> — Source: [Mock integrations for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html)

### 6.4 Calling a REST API with the CLI

The console's Test feature calls the `TestInvokeMethod` API. This API **simulates** the invocation of a method with headers, parameters, and an incoming request body, bypassing the deployed stage's invoke URL. From the CLI you use `test-invoke-method`.

```bash
# You can simulate a method invocation even before deployment
aws apigateway test-invoke-method \
    --rest-api-id 81jpgj2f0j \
    --resource-id Prq5yc5aq6 \
    --http-method GET \
    --path-with-query-string '/'
```

Among the request parameters, `--rest-api-id`, `--resource-id`, and `--http-method` are required. Use `--path-with-query-string` to specify path and query string parameters, and `--body`, `--headers`, and `--stage-variables` to simulate the body, headers, and stage variables.

The response fields match the output on courseware slide 28 exactly.

| Field | Type | Content |
|---|---|---|
| `status` | Integer | The HTTP status code |
| `body` | String | The body of the HTTP response |
| `headers` | Map | The response headers |
| `multiValueHeaders` | Map | The response headers as lists of values |
| `log` | String | The API Gateway execution log |
| `latency` | Long | The execution latency of the test invoke request, in ms |

The errors are `BadRequestException` (400), `UnauthorizedException` (401), `NotFoundException` (404), and `TooManyRequestsException` (429).

> — Source: [TestInvokeMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_TestInvokeMethod.html)

---

## 7. Deploying the API

### 7.1 API Gateway Stages

**A stage is a named reference to a deployment, which is a snapshot of the API.** This definition matches the courseware and the current documentation sentence for sentence. To deploy an API you must **create an API deployment and associate it with a stage.**

| Concept | Definition |
|---|---|
| API deployment | A **point-in-time snapshot** of your API Gateway API. To be available for clients to use, it must be associated with one or more stages |
| API stage | A **logical reference** to a lifecycle state of your API (for example `dev`, `prod`, `beta`, `v2`). Stages are identified by API ID and stage name |

The five things you can do with stage settings also match the courseware.

- Enable caching ([Section 7.5](#75-response-caching))
- Customize request throttling ([Section 7.6](#76-throttling-and-usage-plans))
- Configure logging ([Section 8.1](#81-execution-logging-and-access-logging))
- Define stage variables ([Section 7.2](#72-using-stage-variables))
- Attach a canary release for testing ([Section 7.3](#73-canary-releases))

🔄 The courseware says "When the deployment process finishes, the **Stage Editor pane** appears," and that you use Stage Editor for four settings. In the current console, stage settings live in the **Stages** pane, and after choosing a stage they are split across two places.

| Location | Settings |
|---|---|
| Stage details → Edit | Cache settings (Provision API cache, Default method-level caching, Cache capacity, Encrypt cache data, Cache TTL), throttling settings (Rate, Burst), firewall and certificate settings (Web ACL, Client certificate) |
| Logs and tracing → Edit | CloudWatch Logs logging level, Data tracing, Detailed metrics, Custom access logging, X-Ray tracing |

The invoke URL appears in the **Invoke URL** field of the stage details. Stage names can only contain alphanumeric characters, hyphens, and underscores, with a maximum length of 128 characters. 🆕 After changing stage settings you must **redeploy the API** for the new settings to take effect. Log and stage variable updates, however, do not require a redeployment.

> — Source: [Set up a stage for a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html)

### 7.2 Using Stage Variables 🔄

Stage variables are **name-value pairs** you define as configuration attributes associated with a deployment stage of a REST API. They **act like environment variables** and can be used **in your API setup and mapping templates**. Everything courseware slide 31 states matches the current documentation.

| Use case | Content |
|---|---|
| Specify a different backend endpoint | Callers of your production endpoint can reach `example.com` while callers of the beta stage reach a different host such as `beta.example.com`. You can also specify a different Lambda function name per stage |
| Pass information using mapping templates | You can reuse the same Lambda function across stages while reading from a different DynamoDB table depending on the stage |

Here is where stage variables can be used.

| Location | Notation |
|---|---|
| Parameter mapping expressions | `stageVariables.variable_name` (**without** `$` and braces, no partial substitution) |
| Mapping templates | `$stageVariables.variable_name` or `${stageVariables.variable_name}` |
| HTTP integration URIs | `http://${stageVariables.variable_name}`, also as a subdomain, path, or query string component |
| AWS integration URIs | `arn:aws:apigateway:<region>:<service>:${stageVariables.variable_name}` |
| Lambda function name | `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account_id>:function:${stageVariables.function_variable_name}/invocations` |
| Lambda version or alias | `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<region>:<account_id>:function:<function_name>:${stageVariables.version_variable_name}/invocations` |
| Cognito user pool (`COGNITO_USER_POOLS`) | `arn:aws:cognito-idp:<region>:<account_id>:userpool/${stageVariables.variable_name}` |
| AWS integration credentials | `arn:aws:iam::<account_id>:${stageVariables.variable_name}` |

The diagram on courseware slide 31 shows `/notes` calling either `list_function:PROD` or `list_function:DEV`. That is the pattern of using a stage variable in the Lambda **alias** position.

🔄 The courseware instructor notes write this as `list_function:{$stageVariables.environment}`. The documented notation is `function:<function_name>:${stageVariables.<version_variable_name>}`, so the braces must come **after** the dollar sign.

```text
## Courseware notation (braces in the wrong place)
list_function:{$stageVariables.environment}

## Documented notation
list_function:${stageVariables.environment}
```

🆕 Constraints the courseware does not cover.

| Item | Content |
|---|---|
| Same-account constraint | To use a stage variable for a Lambda function, the function must be **in the same account as the API.** Stage variables do not support cross-account Lambda functions |
| Permission configuration | When specifying a Lambda function name as a stage variable value, you must **configure the permissions on the Lambda function manually** |
| Cannot change integration type | You cannot use a stage variable to change the **kind** of integration endpoint (for example an HTTP proxy integration in one stage and a Lambda proxy integration in another) |
| Sensitive data | Stage variables are **not intended to be used for sensitive data such as credentials.** To pass sensitive data to integrations, use the output of a Lambda authorizer |
| Value format | Variable names can have alphanumeric and underscore characters, and values must match `[A-Za-z0-9-._~:/?#&=,]+` |

```bash
# Grant invoke permission on the Lambda function named by the stage variable value
aws lambda add-permission \
    --function-name "arn:aws:lambda:us-east-2:123456789012:function:my-function" \
    --source-arn "arn:aws:execute-api:us-east-2:123456789012:api_id/*/HTTP_METHOD/resource" \
    --principal apigateway.amazonaws.com \
    --statement-id apigateway-access \
    --action lambda:InvokeFunction
```

> — Source: [Use stage variables for a REST API in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)
> — Source: [API Gateway stage variables reference for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html)

### 7.3 Canary Releases 🔄

A canary release is a software development strategy in which a new version of an API is deployed for testing purposes while the base version remains deployed as the production release for normal operations **on the same stage**. Total API traffic is separated **at random** into the production release and the canary release with a pre-configured ratio.

| Courseware item | Content |
|---|---|
| Reduced deployment risk | Because canary traffic is kept small and the selection is random, most users are not adversely affected by potential bugs in the new version, and no single user is adversely affected all the time |
| Test performance | You can adjust the canary traffic percentage to optimize test coverage or performance |
| Parallel development | The updated API features are only visible to API traffic through the canary |

As in the example architecture on courseware slide 32, the **canary version receives 10%** of traffic and the remaining **90% is routed to the stable version.**

**Structure.** 🔄 In API Gateway, a canary release deployment means **attaching `canarySettings` to the stage** where the production release is deployed. The stage is associated with the initial deployment and the canary with subsequent deployments; at the beginning both point to the same API version.

| `canarySettings` field | Type | Content |
|---|---|---|
| `deploymentId` | String | The ID of the canary deployment. Initially identical to the ID of the base version deployment set on the stage |
| `percentTraffic` | **Double** | The percentage of API traffic diverted to the canary release. **0.0 to 100.0** |
| `stageVariableOverrides` | Map | Stage variables overridden for the canary release, including new stage variables introduced in the canary |
| `useStageCache` | **Boolean** | Whether the canary deployment uses the stage cache |

Once a canary release is enabled, the deployment stage **cannot be associated with another non-canary release deployment** until the canary is disabled and the canary settings are removed.

🆕 Logging is also separated. When you enable API execution logging, the canary release generates its own logs and metrics for all canary requests and reports them to both the production stage log group and a canary-specific log group. The canary log group name carries a `/Canary` suffix. Access logging behaves the same way. These separate logs help when validating new API changes and deciding whether to promote.

**Promotion.** 🔄 Courseware slides 33 and 36 state only the outcome: "you can promote the canary version and send 100% of traffic to this API version." The actual mechanism has three steps.

1. Reset the stage's `deploymentId` with the canary's `deploymentId`. This updates the stage's API snapshot with the canary's, making the test version the production release
2. Update stage variables with the canary stage variables, if any. Without this, the new API version may produce unexpected results
3. Set the percentage of canary traffic to **0.0%**

**Promotion alone does not disable the canary.** To return to a regular production release deployment you must remove `canarySettings`.

```bash
# Promote the canary: copy the deployment ID and stage variables, set canary traffic to 0.0
aws apigateway update-stage \
    --rest-api-id a1b2c3d4e5 \
    --stage-name 'prod' \
    --patch-operations '[
      {"op": "replace", "value": "0.0", "path": "/canarySettings/percentTraffic"},
      {"op": "copy", "from": "/canarySettings/stageVariableOverrides", "path": "/variables"},
      {"op": "copy", "from": "/canarySettings/deploymentId", "path": "/deploymentId"}
    ]'
```

> — Source: [Set up an API Gateway canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)
> — Source: [Promote a canary release](https://docs.aws.amazon.com/apigateway/latest/developerguide/promote-canary-deployment.html)
> — Source: [CanarySettings](https://docs.aws.amazon.com/apigateway/latest/api/API_CanarySettings.html)

### 7.4 Canary Release Steps 🔄

🔄 The steps on courseware slides 34 through 36 describe creating the canary on a **new stage**, and the diagrams draw a "stable stage" and a "new canary stage" as separate stages. In the documentation the canary is not a separate stage but **`canarySettings` on the same stage.** The slide 32 instructor notes say "on the same stage," so the courseware contradicts itself here as well. Here are the steps aligned with the documentation.

| Step | Courseware statement | Aligned with the documentation |
|---|---|---|
| 1/3 | Make functional changes / **deploy to a new stage** / if needed enable caching, set stage variables, enable logging with CloudWatch / **enable canary on the new stage** | Make functional changes / add `canarySettings` **to the existing stage** to enable the canary / if needed set `useStageCache` and `stageVariableOverrides`, and enable execution and access logging |
| 2/3 | Set the percentage of requests for the canary / **redeploy the API to the canary-enabled stage** | Set the percentage with `percentTraffic` (for example 10) / create a new deployment and associate it with the canary. The canary then points at the new deployment while the stage points at the existing one |
| 3/3 | **Promote the canary** | Copy the deployment ID and stage variables to the stage and set `percentTraffic` to 0.0. To turn the canary off completely, remove `canarySettings` |

The code example in the slide 34 instructor notes has three notation problems. It writes `percentTraffic` as `"10"`, `useStageCache` as `"False“`, and `metricsEnabled` as `"true"` — **all as strings** — the closing quote on the `useStageCache` value is a left double quotation mark, and the last line has no closing brace. 🔄 `percentTraffic` is a Double, and `useStageCache` and `metricsEnabled` are Booleans.

```json
{
  "methodSettings": {
    "*/*": {
      "metricsEnabled": true,
      "loggingLevel": "INFO",
      "throttlingRateLimit": 100,
      "throttlingBurstLimit": 50
    }
  },
  "variables": {
    "environment": "PROD"
  },
  "canarySettings": {
    "percentTraffic": 10,
    "deploymentId": "A1b2C3",
    "useStageCache": false
  }
}
```

Keys in `methodSettings` are `{resource_path}/{http_method}` for an individual method override and `*/*` for overriding all methods in the stage. In `MethodSetting`, `cacheDataEncrypted`, `cachingEnabled`, `dataTraceEnabled`, `metricsEnabled`, and `requireAuthorizationForCacheControl` are Booleans; `cacheTtlInSeconds`, `throttlingBurstLimit`, and `throttlingRateLimit` are numbers; `loggingLevel` and `unauthorizedCacheControlHeaderStrategy` are strings.

> — Source: [CreateStage](https://docs.aws.amazon.com/apigateway/latest/api/API_CreateStage.html)
> — Source: [Set up an API Gateway canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)

### 7.5 Response Caching 🆕

The courseware presents caching only as one bullet in the developer feature list ("reduces the number of calls made to the endpoint and improves request latency"). That statement is correct, and the values you actually configure follow. Caching is a **REST API only** feature and is enabled **per stage**.

| Item | Value |
|---|---|
| Default TTL | **300 seconds** |
| Maximum TTL | **3600 seconds** |
| Disabling caching | `TTL=0` |
| Maximum cacheable response size | **1,048,576 bytes.** Cache data encryption may increase the size of the response when it is cached |
| Cache capacity (`cacheClusterSize`, GB) | `0.5`, `1.6`, `6.1`, `13.5`, `28.4`, `58.2`, `118`, `237` |
| Methods cached by default | **`GET` methods only.** This is the default for API safety and availability; you can enable caching for other methods by overriding method settings |
| Cache instance creation and deletion time | About 4 minutes |
| Billing | Charged **by the hour** based on the cache size you select. Not eligible for the AWS Free Tier |
| Status values (`cacheClusterStatus`) | `CREATE_IN_PROGRESS`, `AVAILABLE`, `DELETE_IN_PROGRESS`, `NOT_AVAILABLE`, `FLUSH_IN_PROGRESS` |

**Things to watch.** Changing the cache capacity makes API Gateway remove the existing cache instance and create a new one, so **all existing cached data is deleted.** Cache capacity affects the CPU, memory, and network bandwidth of the cache instance, so the documentation recommends a 10-minute load test to verify the capacity and monitoring the latency, 4xx, 5xx, cache hit, and cache miss metrics.

**Cache keys.** You can use method or integration parameters (custom headers, URL paths, query strings) as cache keys, and **cache keys are required when setting up caching on a resource.** API Gateway caches the responses from each key value separately.

**Invalidation and flushing.**

| Action | How |
|---|---|
| Flush the whole stage cache | Console Stage actions → Flush stage cache, or `aws apigateway flush-stage-cache` |
| Invalidate an individual entry | The client sends a request containing the **`Cache-Control: max-age=0`** header. Provided the client is authorized, it receives the response directly from the integration endpoint instead of the cache, and that response replaces the existing cache entry. **Cross-account cache invalidation is not supported** |

Caching is best-effort; use the CloudWatch `CacheHitCount` and `CacheMissCount` metrics to check it. Do not use the `X-Cache` header from the CloudFront response to determine whether a request was served from the API Gateway cache instance.

```bash
# Provision a 0.5 GB cache for the stage and enable caching for all GET methods
aws apigateway update-stage \
    --rest-api-id a1b2c3 \
    --stage-name 'prod' \
    --patch-operations '[
      {"op": "replace", "path": "/cacheClusterEnabled", "value": "true"},
      {"op": "replace", "path": "/cacheClusterSize", "value": "0.5"},
      {"op": "replace", "path": "/*/*/caching/enabled", "value": "true"}
    ]'
```

> — Source: [Cache settings for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html)
> — Source: [CreateStage](https://docs.aws.amazon.com/apigateway/latest/api/API_CreateStage.html)

### 7.6 Throttling and Usage Plans 🔄

**Both throttles and quotas are applied on a best-effort basis and should be thought of as targets rather than guaranteed request ceilings.** API Gateway throttles requests using the **token bucket algorithm**, where a token counts for a request. When submissions exceed the steady-state request rate and burst limits, clients may receive **`429 Too Many Requests`**.

🔄 The slide 10 instructor notes present throttling as "two basic types of settings" (server-side throttling limits, per-client throttling limits). The current documentation presents **four** and specifies the order in which they apply.

| Type | Scope | Increase |
|---|---|---|
| AWS throttling limits | **All accounts and clients** in a Region | Set by AWS and cannot be changed by a customer |
| Per-account limits | **All APIs** in an account in a specified Region | Can be increased upon request. Cannot be higher than the AWS throttling limits |
| Per-API, per-stage limits | Applied at the **API method level** for a stage. You can configure the same settings for all methods or different settings per method | Cannot be higher than the AWS throttling limits |
| Per-client limits | Clients that use **API keys** associated with your usage plan as client identifier | Cannot be higher than the per-account limits |

The order of application is **per-client and per-method limits in a usage plan → per-method limits set for an API stage → account-level throttling per Region → AWS Regional throttling.**

🆕 Default account-level throttle quotas per Region.

| Item | Value |
|---|---|
| Throttle quota per account, per Region (across HTTP APIs, REST APIs, WebSocket APIs, and WebSocket callback APIs) | **10,000 requests per second (RPS)**, maximum bucket capacity **5,000 requests** |
| Default in some Regions | **2,500 RPS / 1,250 burst** (Africa (Cape Town), Europe (Milan), Asia Pacific (Jakarta), Middle East (UAE), Asia Pacific (Hyderabad), Asia Pacific (Melbourne), Europe (Spain), Europe (Zurich), Israel (Tel Aviv), Canada West (Calgary), Asia Pacific (Malaysia), Asia Pacific (Thailand), Mexico (Central)) |
| Adjusting the burst quota | **Not possible.** The API Gateway service team determines it based on the overall RPS quota for the account in the Region |

**Usage plans and API keys.** A usage plan specifies who can access one or more deployed API stages and methods and optionally sets the target request rate at which throttling starts. API keys identify the clients.

| Item | Content |
|---|---|
| API key format | The name cannot exceed 1,024 characters; the value is an alphanumeric string **between 20 and 128 characters** |
| Value uniqueness | API key values must be unique. Two keys with different names and the same value are **considered the same API key** |
| Association rules | An API key can be associated with more than one usage plan, and a usage plan with more than one stage. However, a given API key can only be associated with **one usage plan for each stage** of your API |
| Throttling limit / quota limit | The target point at which request throttling should start / the target maximum number of requests with a given API key within a specified time interval |
| Aggregation scope | Applied to requests for individual API keys **aggregated across all API stages** within a usage plan |
| Propagation time | After you add an API key to a usage plan, the update might take a few minutes to complete |

🆕 Two warnings the documentation states explicitly are absent from the courseware.

| Warning | Content |
|---|---|
| **Don't use API keys for authentication or authorization** | If you have multiple APIs in a usage plan, a user with a valid API key for one API in that plan can access **all APIs in that plan.** To control access, use an IAM role, a Lambda authorizer, or an Amazon Cognito user pool. Also, do not include confidential information in API keys (clients typically transmit them in headers that can be logged) and use API keys that API Gateway generates |
| **Don't rely on them to control costs** | Usage plan throttling and quotas are not hard limits and are applied on a best-effort basis, so clients can exceed them. Consider **AWS Budgets** to monitor costs and **AWS WAF** to manage API requests. The stage-level throttling settings carry the same warning |

> — Source: [Throttle requests to your REST APIs for better throughput in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html)
> — Source: [Usage plans and API keys for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html)
> — Source: [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html)

### 7.7 Demo Topics

Courseware slide 37 tells you to use your own demo or borrow the one from Lab 5, and lists the console properties to cover.

| Demo item | This document |
|---|---|
| Creating resources | [Section 3.2](#32-core-components-of-a-rest-api) |
| Integrations | [Section 3.5](#35-integration-types) |
| Validating requests | [Section 4.4](#44-request-validation) |
| Mapping templates | [Section 4.5](#45-mapping-templates-request-direction) · [Section 4.6](#46-mapping-templates-response-direction) |
| Models | [Section 4.3](#43-example-request-model) |
| Testing | [Section 6.2](#62-testing-with-the-api-gateway-console) |
| Deployment | [Section 7.1](#71-api-gateway-stages) |
| Invocation | [Section 6.1](#61-calling-a-rest-api) |
| Bonus: stage variables | [Section 7.2](#72-using-stage-variables) |
| Bonus: canary releases | [Section 7.3](#73-canary-releases) · [Section 7.4](#74-canary-release-steps) |

---

## 8. Observability: Logging, Metrics, Tracing 🆕

The courseware diagrams (slides 3 and 9) show Amazon CloudWatch and AWS X-Ray as application components, and slide 34 says to "enable logging with CloudWatch" during the canary step. Since the body never explains these features, they are collected in this chapter. Everything here is **REST API only** or more broadly supported on REST APIs ([Section 2.3](#23-choosing-between-rest-apis-and-http-apis)).

### 8.1 Execution Logging and Access Logging 🆕

There are two types of API logging in CloudWatch, and **they can be enabled independently of each other.**

| Aspect | Execution logging | Access logging |
|---|---|---|
| Managed by | **API Gateway** creates the log groups and log streams and reports requests and responses | **The API developer** creates a log group or chooses an existing one |
| Purpose | Debugging request execution issues | Recording who accessed the API and how |
| What is logged | Errors or execution traces (request or response parameter values or payloads), data used by Lambda authorizers, whether API keys are required, whether usage plans are enabled | Items you select with `$context` variables |
| Log group name | `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}` | You specify it. The destination is a CloudWatch Logs log group or a Firehose stream |
| HTTP API support | Not supported | Supported |

API Gateway **redacts** authorization headers, API key values, and similar sensitive request parameters from the logged data. To improve your security posture, the documentation recommends using execution logging at the **`ERROR` or `INFO` level.**

The console offers three logging levels.

| Level | Meaning |
|---|---|
| Off | Logging is not turned on for this stage |
| Errors only | Logging is enabled for errors only |
| Errors and info logs | Logging is enabled for all events |

🆕 **Data tracing** can be useful to troubleshoot APIs but can result in logging sensitive data, so the documentation recommends **not using it for production APIs.**

The access log format must include at least `$context.requestId` or `$context.extendedRequestId`, and as a best practice you include **both.**

| Variable | Content |
|---|---|
| `$context.requestId` | Logs the value in the `x-amzn-RequestId` header. Clients can override it with a UUID-format value; overridden request IDs that are not in UUID format are replaced with `UUID_REPLACED_INVALID_REQUEST_ID` in your access logs |
| `$context.extendedRequestId` | A unique ID that API Gateway generates, returned in the `x-amz-apigw-id` response header. An API caller cannot provide or override it, and you might need to provide this value to AWS Support |

CLF (Common Log Format), JSON, XML, and CSV format examples appear in the console and the documentation. Here is the JSON format example.

```text
{ "requestId":"$context.requestId", "extendedRequestId":"$context.extendedRequestId","ip": "$context.identity.sourceIp", "caller":"$context.identity.caller", "user":"$context.identity.user", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod", "resourcePath":"$context.resourcePath", "status":"$context.status", "protocol":"$context.protocol", "responseLength":"$context.responseLength" }
```

**Permissions.** To enable CloudWatch Logs you create an IAM role with `apigateway.amazonaws.com` as its trusted entity, attach the `AmazonAPIGatewayPushToCloudWatchLogs` policy, and set the role ARN on the Account's `cloudWatchRoleArn`. You must set this property **separately for each Region** in which you want to enable CloudWatch Logs.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": { "Service": "apigateway.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

> — Source: [Set up CloudWatch logging for REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

### 8.2 CloudWatch Metrics 🆕

API Gateway sends metric data to CloudWatch **every minute.** These are the metrics in the `AWS/ApiGateway` namespace.

| Metric | Content | Unit |
|---|---|---|
| `4XXError` | The number of client-side errors. Modified gateway response status codes are counted here | Count |
| `5XXError` | The number of server-side errors | Count |
| `CacheHitCount` | The number of requests served from the API cache | Count |
| `CacheMissCount` | The number of requests served from the backend when API caching is enabled | Count |
| `Count` | The total number of API requests. The `SampleCount` statistic represents this metric | Count |
| `IntegrationLatency` | The time between when API Gateway relays a request to the backend and when it receives a response from the backend | Millisecond |
| `Latency` | The time between when API Gateway receives a request from a client and when it returns a response. **Includes the integration latency and other API Gateway overhead** | Millisecond |

For the error and cache metrics, the `Sum` statistic is the total count and the `Average` statistic is the **rate** — the total count divided by the total number of requests during the period. The denominator is the `Count` metric.

The dimensions are `ApiName`, `ApiName, Method, Resource, Stage`, and `ApiName, Stage`. 🆕 **Metrics for the method-level dimension (`ApiName, Method, Resource, Stage`) are not sent unless you explicitly enable detailed CloudWatch metrics, and enabling them incurs additional charges to your account.** API-level and stage-level metrics are not charged.

Comparing `IntegrationLatency` with `Latency` tells you whether the latency comes from the backend or from the API Gateway layer.

> — Source: [Amazon API Gateway dimensions and metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html)

### 8.3 AWS X-Ray Tracing 🆕

With AWS X-Ray you can trace and analyze user requests as they travel through your REST APIs to the underlying services.

| Item | Content |
|---|---|
| Coverage | **All REST API endpoint types** (Regional, edge-optimized, private). All AWS Regions where X-Ray is available |
| Benefit | Gives an end-to-end view of an entire request so you can analyze latencies in your APIs and their backend services. A service map shows the latency of the whole request and of downstream services integrated with X-Ray |
| Sampling | Sampling rules tell X-Ray which requests to record and at what sampling rates |
| Trace pass-through | **If you call an API Gateway API from a service that is already being traced, API Gateway passes the trace through even if X-Ray tracing is not enabled on the API** |
| Enabling | Enabled **per API stage** through the console (Logs and tracing → X-Ray tracing), the API, or the CLI (`tracingEnabled`) |

> — Source: [Trace user requests to REST APIs using X-Ray in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html)

### 8.4 Enhanced Observability Variables 🆕

This is the content of the AWS Compute Blog post that the slide 10 instructor notes cite under latency. API Gateway divides requests into **phases**, which appear in the following order depending on the features configured for the application.

| Phase | When it appears | What it does |
|---|---|---|
| WAF | When an AWS WAF web ACL is configured | Evaluates WAF rules and decides whether to continue or cancel the request |
| Authenticate | When IAM authorizers are used | Verifies the credentials of the signed request |
| Authorizer | When a Lambda, JWT, or Amazon Cognito authorizer is used | Processes the authorizer logic |
| Authorize | When a Lambda or IAM authorizer is used | Evaluates and applies the results of the previous two phases |
| Integration | Always | The backend integration processes the request |

Each phase can add latency, return a status, or raise an error. Variable names follow the phase they occur in, using the structure `$context.phase.property`. For example WAF latency is `$context.waf.latency`. Some existing variables also received aliases matching this naming scheme (for example the alias of `$context.integrationErrorMessage` is `$context.integration.error`).

The authorizer and integration phases have additional `$context.phase.requestId` and `$context.phase.integrationStatus` variables. When using a Lambda function as the integration you must distinguish two status codes.

| Variable | Meaning |
|---|---|
| `$context.integration.integrationStatus` | The status of the **Lambda service itself.** Usually 200 unless there is a service or permissions error |
| `$context.integration.status` | The status of the **Lambda function code** — success or failure |

> — Source: [Troubleshooting Amazon API Gateway with enhanced observability variables](https://aws.amazon.com/blogs/compute/troubleshooting-amazon-api-gateway-with-enhanced-observability-variables/)

---

## 9. Changes from the Courseware

These are items in the courseware (the instructor deck) that differ from current fact. Because learners have the official courseware in hand, we leave a record of what was changed and why.

### 9.1 Courseware Statements That Do Not Match the Facts

| Item | Courseware statement | What was verified | Source |
|---|---|---|---|
| Default endpoint type (slide 13) | "In endpoint type, the Regional API endpoint is selected by default" | The endpoint types page, describing edge-optimized endpoints, states **"This is the default endpoint type for API Gateway REST APIs,"** and the concepts page defines edge-optimized as "the default hostname of an API Gateway API." The names and characteristics of the three types are correct | [API endpoint types](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html) |
| Valid method authorization values (slide 13) | Valid values `NONE` and `AWS_IAM`. "The default is set to none or AWS_IAM" | `authorizationType` is a **required parameter** and there are **four** valid values: `NONE`, `AWS_IAM`, `CUSTOM` (Lambda authorizer), and `COGNITO_USER_POOLS`. The documentation never says one of the two is a default | [PutMethod](https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethod.html) |
| Mock integrations on HTTP APIs (slide 14) | HTTP APIs support "Mock and HTTP proxy integrations" | The integrations table in the comparison document marks **Mock integrations as REST API only.** The remaining items (Lambda proxy, AWS services, private resources in a VPC, HTTP proxy) are correct | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| Request validator value types (slide 18) | `"validateRequestBody": "false"`, `"validateRequestParameters": "true"` | Both fields are **Boolean** flags. The string `"false"` can be treated as truthy in JSON and behave contrary to intent | [RequestValidator](https://docs.aws.amazon.com/apigateway/latest/api/API_RequestValidator.html) |
| `$elem` in mapping templates (slides 19, 20) | Declares `$inputRoot` with `#set` but never uses it, and references `$elem` without an iteration directive | In the official examples, collection iteration is always expressed with **`#foreach` ... `#end`** and commas are inserted with `$foreach.hasNext`. Pasting the courseware template as-is leaves the values unfilled. Note, however, that the mapping template concepts page in the AWS documentation contains the same notation, so no sentence in the documentation declares this pattern an error ([Section 9.5](#95-items-we-could-not-verify)) | [Mapping template examples](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-variable-examples.html) |
| canary and methodSettings value types (slide 34) | `"percentTraffic": "10"`, `"useStageCache": "False“`, `"metricsEnabled": "true"` | `percentTraffic` is a **Double** (0.0–100.0); `useStageCache` and `metricsEnabled` are **Booleans.** The courseware code also has a left double quotation mark as a closing quote and no closing brace on the last line | [CanarySettings](https://docs.aws.amazon.com/apigateway/latest/api/API_CanarySettings.html) |
| Creating the canary on a new stage (slides 34–36) | "Deploy to a new stage," "enable Canary on the new stage." The diagrams also separate a "stable stage" from a "new canary stage" | The canary is not a separate stage but **`canarySettings` on the same stage.** Once enabled, the stage cannot be associated with another non-canary deployment until the canary is disabled and the settings removed. This also contradicts the slide 32 note ("on the same stage") | [Canary release deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html) |
| Lambda alias notation for a stage variable (slide 31) | `list_function:{$stageVariables.environment}` | The documented notation is `function:<function_name>:${stageVariables.<version_variable_name>}`, so the braces must come **after** the dollar sign. The correct form is `list_function:${stageVariables.environment}` | [Stage variables reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html) |
| `/notes/list` in the resource list (slide 13) | The instructor notes list three: `/notes`, `/notes/search`, `/notes/list` | The diagram on the same slide has only `/notes` and `/notes/search`, and the method list on slide 9 has no `/notes/list`. This is an internal contradiction in the courseware, and AWS documentation cannot settle which is correct. This document follows the diagram | — ([Section 9.5](#95-items-we-could-not-verify)) |
| Mock row of the slide 14 table | `MOCK` appears in both the Passthrough column and the integration type column | The same column for the proxy and non-proxy rows contains passthrough behavior statements, so the column meaning is broken. This is a notation error in the courseware itself | — ([Section 9.5](#95-items-we-could-not-verify)) |
| Payload key on slide 18 | The array element key is `Notes` rather than `Note` | `NotesInputModel` on slide 17 requires `Note` in each array element, so this payload fails validation with `400`. This is an internal contradiction in the courseware | — ([Section 9.5](#95-items-we-could-not-verify)) |
| URLs cited in the instructor notes | Spaces in the middle of URLs, as in `https://docs.aws.amazon.com/ko_kr/ apigateway/...` | Several citations have a space between `ko_kr/` and `apigateway`, so they cannot be opened as copied. With the spaces removed, all 11 links point to pages that are still valid today | — ([Section 9.5](#95-items-we-could-not-verify)) |

### 9.2 Changed Behavior and Defaults

| Item | Courseware statement | Current | Source |
|---|---|---|---|
| Specification name | "Designing APIs with Swagger," `swagger: "2.0"`, "Swagger features" | The documentation calls it **"Develop REST APIs using OpenAPI in API Gateway"** and supports **OpenAPI v2.0 and v3.0.** The extensions page is titled "OpenAPI extensions for API Gateway." The export paths split into `exports/oas30` and `exports/swagger` | [Develop REST APIs using OpenAPI](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-import-api.html) |
| Authorizer naming | "Lambda authorizer" (the current name, so correct) | The documentation writes **"Lambda authorizer (formerly known as a custom authorizer)."** The courseware does not cover the two types (`REQUEST` and `TOKEN`), the documentation's preference for `REQUEST`, or the `CUSTOM` method authorization value | [Use API Gateway Lambda authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html) |
| Number of throttling setting types | "**Two** basic types of throttling-related settings" | **Four**: AWS throttling limits / per-account limits / per-API, per-stage limits / per-client limits. The order of application is specified, and throttles and quotas are best-effort targets rather than hard limits | [Throttle requests to your REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html) |
| Integration passthrough | "Two conditions" | A **setting** with three options: `WHEN_NO_MATCH` / `WHEN_NO_TEMPLATES` (**recommended**) / `NEVER`. The latter two reject unmapped content types with `415 Unsupported Media Type` | [Method request behavior for payloads without mapping templates](https://docs.aws.amazon.com/apigateway/latest/developerguide/integration-passthrough-behaviors.html) |
| Console test path | "Choose TEST in the Client box of the Method Execution pane" | **Resources pane → choose the method → Test tab → Test.** The Method Execution pane and Client box belong to the previous console UI | [Use the API Gateway console to test a REST API method](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-test-method.html) |
| Stage settings UI | "Stage Editor pane" | Split across **Stages → the stage → Stage details / Logs and tracing** Edit. The definition of a stage as a named reference to a deployment and the five settings are unchanged. After changing settings you must redeploy the API | [Set up a stage for a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html) |
| Canary promotion | "Promote the canary version and send 100% of traffic to this API version" (outcome only) | The mechanism is copying the deployment ID, copying the stage variables, and setting `percentTraffic` to **0.0.** **Promotion alone does not disable the canary**; to return to a regular deployment you must remove `canarySettings` | [Promote a canary release](https://docs.aws.amazon.com/apigateway/latest/developerguide/promote-canary-deployment.html) |
| `HTTP` and `HTTP_PROXY` definitions | "Integrates with HTTP endpoints, including private HTTP endpoints in a VPC" | Both types are **backend HTTP endpoint** integrations. Private integrations are a separate setup: `HTTP_PROXY` + `connectionType=VPC_LINK` + a **VPC link V2**, which can target both an NLB and an ALB | [Set up a private integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html) |

### 9.3 Discouraged and End-of-Support Items

**No item in this module has reached end of support.** The following still work but are no longer the recommended path.

| Item | Status | Replacement | Source |
|---|---|---|---|
| Using mapping templates as the main path for data transformation (slides 16–20) | Discouraged | The documented order is **① proxy integration → ② parameter mapping (no VTL) → ③ mapping template transformations.** Use mapping templates when you need to change the body or perform conditional overrides and cannot use a proxy integration | [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html) |
| Using API keys to control API access (slides 10, 13) | Discouraged | Use **IAM roles, Lambda authorizers, and Amazon Cognito user pools** for access control, because one API key in a usage plan grants access to every API in that plan. Use API keys only to identify clients and associate them with usage plans | [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html) |
| Using usage plan quotas to control cost and access (slide 10) | Discouraged | Throttles and quotas are best-effort targets, not hard limits. Use **AWS Budgets** to monitor costs and **AWS WAF** to block requests | [Usage plans and API keys](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html) |
| Passing sensitive configuration through stage variables (slide 31) | Discouraged | Stage variables are not for sensitive data such as credentials. Pass sensitive data to integrations through the **output of a Lambda authorizer.** Passing non-sensitive configuration is still a legitimate use | [Use stage variables for a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html) |
| Enabling Data tracing on a production stage (slide 34) | Discouraged | Use execution logging at the **Errors only or Errors and info logs** level and turn Data tracing on only temporarily while troubleshooting. It can log sensitive data | [Set up CloudWatch logging for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) |

### 9.4 Added After the Courseware

| Item | Summary | Source |
|---|---|---|
| REST API vs HTTP API selection criteria | Choose based on feature count and price. Request validation, mapping templates, caching, canary releases, usage plans, test invocations, execution logs, and X-Ray — most of what this module covers — are **REST API only.** HTTP API only features are automatic deployments, JWT authorizers, and AWS Cloud Map private integrations | [Choose between REST APIs and HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) |
| Lambda proxy integration recommendation | The documentation highly recommends Lambda proxy as "the preferred integration type to call a Lambda function through API Gateway." Lambda custom integration is for the advanced scenario of reusing mapping templates across endpoints | [Choose an API Gateway API integration type](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-integration-types.html) |
| Lambda proxy input and output formats | Input event keys (`resource`, `path`, `httpMethod`, `headers`, `multiValueHeaders`, `queryStringParameters`, `requestContext`, `body`, `isBase64Encoded`, and so on) and the output format (`isBase64Encoded`, `statusCode`, `headers`, `multiValueHeaders`, `body`). A different format returns **`502 Bad Gateway`**. The `{proxy+}` + `ANY` combination | [Lambda proxy integrations](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html) |
| HTTP API payload format versions | `1.0` and `2.0`. The console defaults to the latest version, but the CLI, CloudFormation, and SDKs **require** it. `2.0` has no `multiValueHeaders`, adds `rawPath` and `cookies`, and infers a response from valid JSON without a `statusCode` | [Create AWS Lambda proxy integrations for HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) |
| Parameter mapping | Modifies path, query string, and header values in the integration request and response **without VTL.** It cannot modify the body. Used for static CORS header values | [Data transformations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html) |
| The full set of mapping template variables | `$input` (`body`, `json`, `path`, `params`), `$context` (52 entries), `$stageVariables` (three notations), `$util` (`escapeJavaScript`, `parseJson`, `urlEncode`, `urlDecode`, `base64Encode`, `base64Decode`) | [Variables for data transformations](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html) |
| Scope of request validation | Parameters are checked for **existence only**, not type or format. Failure returns `400` and publishes results to CloudWatch Logs. Use `$default` to apply one model regardless of content type | [Request validation for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html) |
| Model capabilities | `enum` to restrict allowed values, `minimum` and `maximum` to constrain ranges, the reference primitive to point at `definitions` or external models. Model size per API is 400 KB | [Data models for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/models-mappings-models.html) |
| WebSocket API constraints | No `$` prefix in custom route keys, authorization on `$connect` only (values `NONE`, `AWS_IAM`, `CUSTOM`, applied API-wide), `401`/`403` when `$connect` fails, `$disconnect` is best-effort with no delivery guarantee | [Create routes for WebSocket APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-develop-routes.html) |
| Caching details | Default TTL 300 seconds / maximum 3600 / `TTL=0` disables, maximum cacheable response 1,048,576 bytes, eight capacity choices (0.5–237 GB), **only `GET` cached by default**, cache keys required, invalidation with `Cache-Control: max-age=0` (no cross-account), hourly billing | [Cache settings for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html) |
| REST API quotas | Integration timeout **50 ms–29 seconds**, payload **10 MB**, idle connection 310 seconds, per API 300 resources / 10 stages / 10 authorizers / 400 KB model size, 600 Regional APIs / 120 edge-optimized | [Quotas for configuring and running a REST API](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html) |
| Account-level throttle quotas | **10,000 RPS** per account per Region, maximum bucket capacity **5,000 requests.** Thirteen Regions default to 2,500 RPS / 1,250 burst. The burst quota cannot be adjusted by customers | [Amazon API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html) |
| The distinction between execution and access logging | Execution logging is managed by API Gateway with log group name `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}`. Access logging has the developer choose the log group and format (CLF, JSON, XML, CSV) and must include `$context.requestId` or `$context.extendedRequestId`. The two are enabled independently | [Set up CloudWatch logging for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) |
| CloudWatch metrics | Seven metrics — `4XXError`, `5XXError`, `CacheHitCount`, `CacheMissCount`, `Count`, `IntegrationLatency`, `Latency` — sent every minute. Method-level dimensions require detailed metrics and incur **additional charges** | [Amazon API Gateway dimensions and metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html) |
| X-Ray tracing | Supported on all REST API endpoint types, enabled per stage, sampling rules, and **trace pass-through** when called from a service already being traced | [Trace user requests to REST APIs using X-Ray](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html) |
| Enhanced observability variables | `$context.phase.property` variables for the WAF → Authenticate → Authorizer → Authorize → Integration phases. For Lambda integrations, `integrationStatus` (service status) versus `status` (function code status) | [Troubleshooting Amazon API Gateway with enhanced observability variables](https://aws.amazon.com/blogs/compute/troubleshooting-amazon-api-gateway-with-enhanced-observability-variables/) |
| AWS WAF evaluation precedence | AWS WAF rules are evaluated **before** resource policies, IAM policies, Lambda authorizers, and Cognito authorizers. Request body inspection is limited to the first 64 KB and the web ACL is associated with an API stage | [Use AWS WAF to protect your REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html) |
| Private API details | Powered by AWS PrivateLink, reachable over Direct Connect, turning on private DNS blocks access to the default endpoint for public APIs, **only TLS 1.2**, HTTP/2 requests enforced to HTTP/1.1 | [Private REST APIs in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-apis.html) |
| `x-amazon-apigateway-integration` properties | `type` (lowercase, such as `aws_proxy`), `payloadFormatVersion`, `timeoutInMillis` (50–29,000 ms), `responseTransferMode` (`BUFFERED`, `STREAM`), `connectionType`, `passthroughBehavior`, `contentHandling`, and others | [x-amazon-apigateway-integration object](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html) |
| Other uses of Mock integrations | Provisioning a landing page, returning CORS headers (the console configures the `OPTIONS` method as a mock integration), and gateway responses. **Not suited to large response templates**, for which you use a Lambda integration | [Mock integrations for REST APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-mock-integration.html) |
| Developer portal and Quick create | The developer portal (an application where API providers share APIs and documentation with consumers, grouping APIs into products; REST API only) and Quick create (creates an HTTP API with a Lambda or HTTP integration, a default catch-all route, and an auto-deploying default stage) | [Amazon API Gateway concepts](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-basic-concept.html) |

### 9.5 Items We Could Not Verify

We leave these honestly. Confirm them before stating anything definitively in class.

| Item | Status |
|---|---|
| "HTTP APIs have lower latency than REST APIs" (slide 7) | The axes the official comparison document presents are **feature count and price**; latency does not appear as a comparison item. The lower-cost statement was verified ("designed with minimal features so that they can be offered at a lower price"). **No sentence supporting the lower-latency claim was found in that document.** We do not declare the courseware wrong, only that we could not verify it |
| What the console preselects as the endpoint type | What the documentation confirms is that **edge-optimized is the default endpoint type for REST APIs.** The courseware talks about the console UI, saying Regional is selected by default in the endpoint type control. **Which item the current console preselects could not be confirmed from the documentation.** In practice, choose the endpoint type explicitly |
| The `$elem` notation in mapping templates (slides 19, 20) | We confirmed that collection iteration in the official examples is expressed with `#foreach` ... `#end`. However, **the mapping template concepts page in the AWS documentation also contains a `$elem` reference without `#foreach`**, so no sentence in the documentation declares this pattern an error. This document corrects it to a working form, but there is no basis for saying "the documentation forbids it" |
| The separator in the execution log group name | The logging setup page writes `API-Gateway-Execution-Logs_{rest-api-id}/{stage_name}` (underscore) while the canary page writes `API-Gateway-Execution-Logs/{rest-api-id}/{stage-name}` (slash), so **the two pages disagree.** Which is the actual name cannot be settled from the documentation, so the body uses the logging setup page's notation. Check the actual log group name in the console |
| `/notes/list` in the slide 13 resource list | Inside the courseware, the instructor notes disagree with the diagram and slide 9. **AWS documentation cannot settle** which is the correct design for this application. This document followed the majority evidence of the diagram and slide 9 |
| The Passthrough cell of the Mock row in the slide 14 table | A notation error that breaks the column meaning. This is not the kind of fact AWS documentation verifies but an error in the courseware itself, so we corrected only the cell and attached no source citation |
| The `Notes` key in the slide 18 payload | An internal contradiction in the courseware for the same reason. Corrected to `Note` to match the slide 17 model |
| The broken quotation mark and missing brace in the slide 34 code example | The value types (Double, Boolean) were confirmed from the API reference, but the broken quotation character and the missing brace are not subjects of documentation verification — they are notation errors in the courseware |
| The broken Korean translation in the slide 8 WebSocket instructor notes | Sentences are duplicated and garbled. **This is a translation quality problem, not a factual error**, so we summarized only within the range where the meaning is clear |
| Lab 5 workflow (slides 41–42) | The original deck has only diagram elements (Amazon API Gateway, AWS Cloud, user, DynamoDB table) with no explanatory text. With no source text to summarize, this document does not cover it |
| The console screenshots on slides 25–26 | The original deck has only images with no text. The console procedure was rewritten from the current official documentation ([Section 6.2](#62-testing-with-the-api-gateway-console)) |
| Performance and pricing figures per cache capacity | The eight capacity choices, hourly billing, and Free Tier exclusion were confirmed from the documentation. **Specific performance and pricing per capacity are pointed to the pricing page by the documentation and were not retrieved for this document** |
