# Module 14: Observing Your Application

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [Observability and Monitoring](#2-observability-and-monitoring)
3. [The Three Pillars of Observability](#3-the-three-pillars-of-observability)
4. [Amazon CloudWatch](#4-amazon-cloudwatch)
5. [Metrics and Dimensions](#5-metrics-and-dimensions)
6. [Alarms](#6-alarms)
7. [CloudWatch Logs](#7-cloudwatch-logs)
8. [Instrumenting Your Application](#8-instrumenting-your-application)
9. [CloudWatch Application Insights](#9-cloudwatch-application-insights)
10. [AWS X-Ray](#10-aws-x-ray)
11. [X-Ray Core Concepts](#11-x-ray-core-concepts)
12. [Enabling Tracing](#12-enabling-tracing)
13. [Changes from the Courseware](#13-changes-from-the-courseware)

> **Notation**
>
> - 🆕 Material the class did not cover, added after verifying it against official AWS documentation.
> - 🔄 Material that has changed since the class and has been corrected here. See [Section 13](#13-changes-from-the-courseware) for what changed and how.
> - Verified on: August 25, 2026. Documentation may be updated after this date, so check the linked original before applying anything to an exam or to production.
> - **This is the area that has changed most in this course.** The X-Ray SDKs and daemon entered maintenance mode on February 25, 2026, the X-Ray console is no longer being developed, and the service map has been folded into the trace map in the CloudWatch console. Following the older instrumentation code teaches a path that is no longer recommended ([Section 13.3](#133-discouraged-and-end-of-support-items)).
> - Terminology is used consistently. We write **observability**, **metric**, **dimension**, **alarm**, **trace**, **segment**, **subsegment**, **sampling**, and **span**. Items that cannot be settled with external documentation carry no marker; they are pointed out in the body and gathered in [Section 13](#13-changes-from-the-courseware).
> - **The CLI example and C# example contain errors that make them unusable as printed, so they are corrected here.** What was corrected is listed in the correction table in each section.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following.

- Differentiate between monitoring and observability
- Evaluate why observability is needed for modern development and its key components
- Understand the role of Amazon CloudWatch in an observability configuration
- Describe application monitoring with CloudWatch Application Insights
- Describe application debugging with AWS X-Ray

The module objectives and the module summary carry the same five items with different spacing in
the first one. This document follows the module-objectives wording
([Section 13.1](#131-differences-from-the-courseware)).

### What This Topic Broadens Into

The second objective says "**modern** development", yet the core tools are just two, CloudWatch and
X-Ray, and it is easy to cover only a narrow slice of each. The questions that always come up in
class sit outside that narrow slice.

| Beyond the narrow slice | Why it matters | Where this document covers it |
|---|---|---|
| How to **query and analyze** logs | Shipping logs to CloudWatch is not enough. Collecting logs you cannot read is not observability | [Section 7.4](#74-cloudwatch-logs-insights) |
| Log **retention** | Log groups share the same retention, and the default is indefinite, so an unattended log group bills forever | [Section 7.3](#73-retention-and-log-classes) |
| X-Ray **sampling** | This governs tracing cost and overhead | [Section 11.4](#114-sampling) |
| The **settings** that turn tracing on | Instrumented code alone is not enough; you also have to enable tracing on Lambda and API Gateway | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| How to **publish** custom metrics | Seeing "custom data" as an arrow leaves out how you actually publish it with `PutMetricData` | [Section 5.4](#54-publishing-custom-metrics) |
| **Dashboards** | A mention that CloudWatch dashboards are "created automatically" is not enough to understand dashboards themselves | [Section 4.3](#43-dashboards-and-cross-account-observability) |
| The **currently recommended** instrumentation | It is easy to learn the X-Ray SDK as the only path. OpenTelemetry is the recommended path now | [Section 12.3](#123-the-move-to-opentelemetry) |

### Where This Module Sits

The agenda runs Module 14 → Lab 7 → Module 15.

| Item | Content |
|---|---|
| Module 14 | Identify the AWS services that support monitoring a web application |
| Lab 7 | Use AWS resources to deploy, monitor, and maintain a web application |
| Module 15 | Course summary |

The lab application is the same one as in earlier modules. Amazon S3 (website hosting, MP3
hosting), Amazon API Gateway, AWS Lambda (List / Search / Delete / Create-Update / Dictate),
Amazon DynamoDB, Amazon Cognito, IAM, Amazon Polly, and AWS SAM, with Amazon CloudWatch and
AWS X-Ray added in this module.

---

## 2. Observability and Monitoring

### 2.1 What Is the Difference

This is the one sentence stressed most in this module.

> Monitoring tells you that a problem **exists**.
> Observability tells you **why** the problem happened.

| Concept | Definition |
|---|---|
| Observability | The **ability** to observe, understand, and use data |
| Monitoring | The **act** of displaying data so it can be observed in real time |

So monitoring is one of the activities that make up observability. How you set monitoring up
determines whether you end up with an observable environment. Uptime reports alone cannot track
every service in a modern application.

### 2.2 Four Activities

| Activity | Description |
|---|---|
| Collect | Collect metrics and logs from all AWS resources, applications, and services |
| Monitor | Display data so it can be observed in real time |
| Analyze | Understand system state and provide context that helps monitoring |
| Act | Automate the response to operational changes |

The narrated order is Collect → Monitor → Analyze → Act. Some source material swaps Act and
Analyze in its layout, but in the flow of activities analysis comes before action.

### 2.3 The Observability Plan

There are four elements to include in a plan. Some source material repeats the same body text
across two places, so they are merged into one section here
([Section 13.1](#131-differences-from-the-courseware)).

| Element | Description |
|---|---|
| Visibility | Visibility into how your applications and resources are performing their work |
| Real-time troubleshooting | Metrics that give insight into what a code deployment is doing. Verify the effect of a change and resolve problems in real time |
| Customer experience | Find and debug problems before they affect customers |
| Performance | Application performance and uptime tie directly to business revenue |

It then draws the planning cycle as a "knowledge cycle".

| Input | Output |
|---|---|
| People (requirements) | Data |
| System architecture (background) | Information |
| Telemetry | Knowledge |
| Insight | Insight |
| Action | Action |

Decide what to monitor and how based on information, capture actions and insights in the
monitoring plan, and iterate.

> **Caution.** We could not find this "knowledge cycle" diagram in the same form in AWS official
> documentation, so this document only introduces the concept and does not present it as though it
> came from official documentation
> ([Section 13.5](#135-items-we-could-not-verify)).

### 2.4 Why Observability Is Needed

With a well-defined monitoring and observability strategy you can do the following.

- Respond to performance changes across the system
- Optimize resource utilization
- Obtain a consolidated view of operational health

In an observable environment risk goes down while agility and customer experience improve.

---

## 3. The Three Pillars of Observability

### 3.1 The Three Pillars and Who Handles Them

| Pillar | Definition | Handled by |
|---|---|---|
| Metrics | Numerical data used to analyze the overall performance and behavior of a system | CloudWatch metrics |
| Logs | A record of events inside an application | CloudWatch Logs |
| Traces | Following the path of a request to identify bottlenecks and improve performance | AWS X-Ray |

Observability does not come from collecting the three separately. It requires **correlating**
them. When a metric spikes you have to be able to move straight to the logs and traces from the
same moment, or you will not find the cause.

```text
     Metrics ──┐   CloudWatch metrics
     Logs    ──┼──▶  Observability  ──▶  See that a problem exists and why
     Traces  ──┘   CloudWatch Logs / AWS X-Ray
```

> **A difference in wording within the source material.** Some source material gives the three
> pillars as `logging / metrics / tracing`, and elsewhere in the same diagram as
> `logging / monitoring / tracing`. The answer explanation states "metrics, traces, and logs", so
> the correct three pillars are **metrics / logs / traces**
> ([Section 13.1](#131-differences-from-the-courseware)).

### 3.2 How the Three Pillars Actually Connect 🆕

The courseware assigns each pillar to one service and stops there. The current structure is not
that cleanly divided. Below are the connection points we verified.

| Connection | What links to what |
|---|---|
| Logs → metrics | Embed metrics in logs with the embedded metric format (EMF) and CloudWatch extracts them automatically. Metric filters can also pull metrics out of logs |
| Logs → alarms | A log alarm compares the results of a scheduled Logs Insights query against a threshold. You can alarm on logs without creating a metric filter |
| Traces → logs | Enable Transaction Search and spans sent to X-Ray land in the `aws/spans` log group as structured logs |
| Traces → metrics | A metric for the number of traces matching an X-Ray group's filter expression is published to CloudWatch every minute |
| All three → one screen | The CloudWatch console shows X-Ray traces alongside CloudWatch logs and metrics |

> — Source: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

> — Source: [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

> — Source: [Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search.html)

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

---

## 4. Amazon CloudWatch

### 4.1 What CloudWatch Is

In one line, **"CloudWatch is a repository of data points."** It receives and stores metrics, then
computes statistics from what it stored and hands them to consumers.

| Part | Content |
|---|---|
| Producers | AWS resources that use CloudWatch, plus custom data |
| Storage | The metric repository |
| Consumers | AWS Management Console (graphs), CloudWatch alarms → Auto Scaling and SNS email notification |

AWS services such as Amazon EC2 store metrics in the repository, and you retrieve statistics
based on those metrics. Store custom metrics and you retrieve statistics about them the same way.

### 4.2 What an Alarm Can Do 🔄

The targets are often known as stopping, starting, and terminating EC2 instances, EC2 Auto
Scaling, and Amazon SNS. The current list is broader, and **"start" is not on it.**

| Target | ARN form |
|---|---|
| EC2 actions | `arn:aws:automate:region:ec2:stop` · `:terminate` · `:reboot` · `:recover` |
| Auto Scaling | Scaling policy ARN |
| Lambda | Function ARN (latest version, a specific version, or an alias) |
| SNS notification | Topic ARN |
| Systems Manager | OpsItem ARN or response plan ARN |
| Amazon Q Developer | Investigation group ARN |

An alarm action array holds at most 5 items. **Starting an EC2 instance is not a valid value.**
The action that brings an instance back is `recover`, which moves the same instance to new
hardware after a hardware failure. That is not the same as "start".

> — Source: [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html)

### 4.3 Dashboards and Cross-Account Observability 🆕

Dashboards are easy to overlook when they come up only in the context of Application Insights
creating them automatically. They are a feature in their own right.

| Feature | Content |
|---|---|
| Automatic dashboards | CloudWatch ships pre-built dashboards |
| Custom dashboards | Create them from the console, the AWS CLI, or the `PutDashboard` API |
| Multiple Regions | View resources spread across different Regions in a single view |
| Permissions needed | `cloudwatch:GetDashboard` and `ListDashboards` to view, `PutDashboard` to create or modify, `DeleteDashboards` to delete |

Metrics exist only in the Region in which they are created, but there is a way past that
constraint.

Set up **cross-account observability** and, from a monitoring account, you can do the following.

- Search, view, and graph metrics that live in source accounts. A single graph can include
  metrics from multiple accounts
- Create alarms in the monitoring account that watch metrics in source accounts
- View log events from log groups in source accounts and run Logs Insights queries against them.
  One query can span multiple log groups in multiple accounts at once
- View nodes from source accounts in the X-Ray trace map

When you are signed in to a monitoring account, a blue **Monitoring account** badge appears at
the top right of every page that supports this functionality.

> — Source: [Using Amazon CloudWatch dashboards](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html)

---

## 5. Metrics and Dimensions

### 5.1 Metrics

| Item | Content |
|---|---|
| Definition | A time-ordered set of data points published to CloudWatch |
| Uniquely identified by | Name + namespace + zero or more dimensions |
| Region scope | Metrics exist **only in the Region** in which they are created |
| Deletion | Metrics cannot be deleted. They expire automatically after 15 months if no new data is published |
| Data points | Each data point has a time stamp, and a unit of measure is optional |

Think of a metric as the variable to monitor and the data points as the values of that variable
over time.

**Time stamp constraints** 🆕 — A data point's time stamp can be up to two weeks in the past and
up to two hours into the future. Omit it and CloudWatch stamps it with the time of receipt.
Alarms check metrics against the current time in UTC, so custom metrics sent with time stamps
other than current UTC can leave an alarm showing `INSUFFICIENT_DATA` or make it fire late.

> — Source: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.2 Retention and Resolution 🆕

The first thing you hit in practice. Metric retention **varies by period.**

| Data point period | Retention |
|---|---|
| Less than 60 seconds (high-resolution custom metrics) | 3 hours |
| 60 seconds (1 minute) | 15 days |
| 300 seconds (5 minutes) | 63 days |
| 3600 seconds (1 hour) | 455 days (15 months) |

Data collected at a shorter period is aggregated for long-term storage. Data gathered at
1-minute resolution stays available at that resolution for 15 days, after which it is only
retrievable at 5-minute resolution, and after 63 days at 1-hour resolution. **The original
resolution does not stay around forever.**

| Resolution | Granularity | Note |
|---|---|---|
| Standard | 1 minute | The default for AWS service metrics |
| High | 1 second | Chosen per custom metric. Every `PutMetricData` call is charged, so cost goes up |

Set an alarm on a high-resolution metric and you can specify a period of 10 or 30 seconds, which
carries a higher charge.

Valid values for period are 1, 5, 10, 30, or any multiple of 60, and the default is 60 seconds.

> — Source: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.3 Namespaces and Dimensions

Metrics are grouped **first by namespace**, then by the various **dimension combinations** within
each namespace. For example, DynamoDB metrics split into `Table Metrics` and
`GlobalSecondaryIndex`.

| Item | Content |
|---|---|
| Namespace | A container for CloudWatch metrics. Metrics in different namespaces are isolated from each other |
| Default | **There is none.** You must specify one for every data point you publish |
| Naming rules | Valid ASCII characters, 255 or fewer. Alphanumerics plus `.` `-` `_` `/` `#` `:` and space |
| AWS convention | `AWS/service`. Amazon EC2 uses `AWS/EC2`, DynamoDB uses `AWS/DynamoDB` |
| Dimensions | Name/value pairs that are part of a metric's identity. **Up to 30 per metric** |

**A dimension combination is a separate metric.** CloudWatch treats each unique combination of
dimensions as a different metric even when the metric name is the same. So when you retrieve
statistics you have to specify **the same combination you published with.**

For example, if you publish `ServerStats` in the `DataCenterMetric` namespace with these four
combinations,

```text
Server=Prod, Domain=Frankfurt
Server=Beta, Domain=Frankfurt
Server=Prod, Domain=Rio
Server=Beta, Domain=Rio
```

then you can only retrieve statistics for those four. You cannot retrieve for `Server=Prod`
alone, for `Domain=Rio` alone, or with no dimensions at all. The metric math `SEARCH` function is
the exception.

For metrics from certain AWS services such as Amazon EC2, CloudWatch aggregates data across
dimensions for you. **It does not do that aggregation for your custom metrics.**

> — Source: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

### 5.4 Publishing Custom Metrics 🆕

"Custom data" is easy to see as just an arrow on a diagram. Here is how you actually publish it.

```bash
# Publish a single data point
aws cloudwatch put-metric-data \
  --metric-name PageViewCount \
  --namespace MyService \
  --value 2 \
  --timestamp 2026-08-25T12:00:00.000Z

# Publish with dimensions (put-metric-data uses the Name=Value form)
aws cloudwatch put-metric-data \
  --metric-name Buffers \
  --namespace MyNameSpace \
  --unit Bytes \
  --value 231434333 \
  --dimensions InstanceId=1-23456789,InstanceType=m1.small
```

**The dimension syntax differs per command.** Miss this and you will get caught by it once.

| Command | Form | With several |
|---|---|---|
| `put-metric-data` | `Name=Value` | Separated by commas |
| `get-metric-statistics` and `put-metric-alarm` | `Name=MyName,Value=MyValue` | Separated by spaces |

```bash
# get-metric-statistics uses Name=...,Value=... and separates dimensions with spaces
aws cloudwatch get-metric-statistics \
  --metric-name Buffers \
  --namespace MyNameSpace \
  --dimensions Name=InstanceId,Value=1-23456789 Name=InstanceType,Value=m1.small \
  --start-time 2026-08-24T04:00:00Z \
  --end-time 2026-08-25T07:00:00Z \
  --statistics Average \
  --period 60
```

**Aggregate into a statistic set to cut the number of calls.** If three data points arrive within
three seconds, send them once instead of three times.

```bash
# Publish an aggregated statistic set
aws cloudwatch put-metric-data \
  --metric-name PageViewCount \
  --namespace MyService \
  --statistic-values Sum=11,Minimum=2,Maximum=5,SampleCount=3 \
  --timestamp 2026-08-25T12:00:00.000Z
```

Publishing as a statistic set means **you cannot retrieve percentile statistics**, because
CloudWatch needs raw data points to compute percentiles. The exceptions are when `SampleCount`
is 1 and when `Minimum` equals `Maximum`.

There are delays worth knowing about.

| Action | Delay |
|---|---|
| Statistics retrievable with `get-metric-statistics` | Up to 2 minutes |
| Appears in the `list-metrics` listing | Up to 15 minutes |

Whether to publish `0` for periods with no data or nothing at all is your choice. If you use
periodic `PutMetricData` calls to monitor application health, **publishing zero is the better
option**, because then you can set an alarm that notifies you when the application fails to
publish metrics every five minutes.

> — Source: [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)

### 5.5 OpenTelemetry Metrics 🆕

CloudWatch supports OpenTelemetry metrics sent over OTLP. **The data model differs from
traditional CloudWatch metrics.** This data model needs to be understood separately.

| Concept | Traditional CloudWatch metrics | OpenTelemetry metrics |
|---|---|---|
| Identity | Namespace + metric name + up to 30 dimensions | Metric name + up to 150 labels |
| Metric types | Single values, statistic sets | gauge, sum, histogram, exponential histogram |
| Ingestion | `PutMetricData` API or AWS CLI | OpenTelemetry Protocol (OTLP) |
| Query | `GetMetricStatistics`, Metrics Insights | Prometheus Query Language (PromQL) |
| Alarms | Standard CloudWatch alarms | PromQL-based CloudWatch alarms |
| Console | CloudWatch Metrics console | CloudWatch Query Studio |
| Retention | Up to 15 months with automatic rollup | Up to 15 months |

**For new implementations, OpenTelemetry is recommended for publishing custom metrics.** The
`PutMetricData` documentation says so directly.

> — Source: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

> — Source: [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)

---

## 6. Alarms

### 6.1 A Basic Alarm Scenario

Take an alarm with a threshold of 3 and a minimum of 3 breaching periods. It behaves like this.

| Period | Value | State |
|---|---|---|
| 1–2 | Within threshold | `OK` |
| 3–5 | Three consecutive periods breaching | `ALARM` — action invoked |
| 6 | Falls back below threshold | `OK` |
| 9 | Breaches again but only one period | Stays `OK` |

Put simply: "only one period exceeds the threshold, so the action is not invoked", and "three
periods exceed the threshold, so the action is invoked."

### 6.2 The Real Evaluation Is M out of N 🔄

It is easy to read this as "three **consecutive** periods". The real behavior is more flexible, and
missing this difference leads to badly designed alarms.

| Parameter | Meaning |
|---|---|
| Evaluation Periods (N) | The number of periods over which data is compared to the threshold |
| Datapoints to Alarm (M) | The number of data points that must be breaching to trigger the alarm |

When M is smaller than N you get an **"M out of N" alarm**, and the alarm fires even when the
breaches are not consecutive. The scenario in Section 6.1 is just the special case where M and N
are both 3.

Two more things sit on top of this.

**First, the evaluation range is wider than N.** When an alarm evaluates whether to change state,
CloudWatch attempts to retrieve more data points than N. That window is the **evaluation range**.
It exists to have extra data on hand when points are missing. If enough real data points are
retrieved to reach N, **the missing-data setting is ignored.**

**Second, there is logic that avoids premature alarms.** If the most recent data is
`- - - - X` (four missing then one breaching), the alarm does not go straight to `ALARM`, because
the next point may be non-breaching. Conversely, with `- - X - -`, the alarm **does** go to
`ALARM` even with fewer real data points than M, because alarms are designed to fire when the
oldest available breaching data point within the evaluation periods is at least as old as the
Datapoints to Alarm value and everything more recent is breaching or missing.

> — Source: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

### 6.3 Treating Missing Data 🆕

An alarm is always in one of three states: `OK`, `ALARM`, or `INSUFFICIENT_DATA`. Each data point
falls into one of three categories: within the threshold, breaching, or missing.

| Option | How missing data is treated |
|---|---|
| `notBreaching` | As good, within the threshold |
| `breaching` | As bad, breaching the threshold |
| `ignore` | The current alarm state is maintained |
| `missing` | If all data points in the evaluation range are missing, the alarm goes to `INSUFFICIENT_DATA` |

**The default behavior is `missing`.** A CLI example may spell out `--treat-missing-data missing`,
which is the default, so omitting it changes nothing.

Choose based on the nature of the metric.

- A rollback alarm on a metric that reports data continuously → missing is a bad sign, so
  `breaching`
- A metric that only produces data points when an error occurs (for example DynamoDB
  `ThrottledRequests`) → `notBreaching`

Two exceptions are worth memorizing.

- Alarms that evaluate metrics in the **`AWS/DynamoDB`** namespace default to `ignore` for missing
  data. You can override that with a different choice.
- **Alarms on EC2 metrics** can rarely enter `INSUFFICIENT_DATA` even when the instance is healthy,
  if metric reporting is interrupted. For EC2 alarms configured to take stop, terminate, reboot, or
  recover actions, the recommendation is to treat missing data as `missing` and to trigger only in
  the `ALARM` state.

> — Source: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

### 6.4 Kinds of Alarm 🔄

It is easy to think of an alarm as watching "a **single metric** over a specified period". There
are now four kinds.

| Kind | What it watches |
|---|---|
| Metric alarm | A single CloudWatch metric **or the result of a metric math expression** |
| PromQL alarm | A PromQL instant query on metrics ingested through the CloudWatch OTLP endpoint |
| Log alarm | The results of a CloudWatch Logs Insights query that runs on a schedule |
| Composite alarm | A rule expression over the alarm states of other alarms |

**Composite alarms** are for reducing alarm noise. Create several metric alarms, attach
notification to only the composite alarm, and a human is paged only when every underlying alarm is
in `ALARM`. Note that composite alarms **cannot perform EC2 actions or Auto Scaling actions.** SNS
notifications, creating investigations, and creating Systems Manager OpsItems or incidents all work.

**Log alarms** catch patterns, errors, or threshold breaches directly in log data without creating
a metric filter. They apply M-out-of-N evaluation to recent query executions.

A few operational facts are worth knowing too.

| Item | Content |
|---|---|
| Number of alarms | There is **no limit** to how many alarms you can create in an account |
| Alarm history | Preserved for 30 days |
| When actions fire | An alarm invokes actions **only when it changes state.** The exception is Auto Scaling actions, which continue to be invoked once per minute while the alarm stays in the new state |
| Maximum evaluation period | 7 days for alarms with a period of at least 1 hour (3600 seconds), 1 day for shorter periods |
| Evaluation window | Choose a sliding window (default) or a wall clock window |

**Sliding versus wall clock window** 🆕 — A sliding window advances each time the alarm is
evaluated, forming a rolling time window. A wall clock window aligns to fixed clock boundaries such
as the top of the hour or the start of the day, and does not query additional data points from
farther back (so the wider evaluation range from Section 6.2 does not apply).

> — Source: [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

> **A note on a reference link path.** Some source material gives
> `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html`, which is no longer valid; the
> current path is `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html`
> ([Section 13.1](#131-differences-from-the-courseware)).

### 6.5 Creating an Alarm from the CLI 🔄

A widely cited `put-metric-alarm` example **cannot be run as printed.** This document gives a
corrected command and records what was corrected below.

First, the command as the original material prints it (verbatim, do not run this).

```text
>> aws cloudwatch put-metric-alarm --alarm-name NotesWriteCapacityUnitsLimit
   --metric-name ConsumedReadCapacityUnits --namespace AWS/DynamoDB --statistic Sum
   --period 60 --treat-missing-data missing --datapoints-to-alarm 5
   --alarm-actions arn:aws:cloudwatch:us-east-2:111122223333:alarm:Notes-WriteCapacityUnitsLimit-BasicAlarm
--dimensions "Name=InstanceId,Value=i-12345678"
```

| # | Original material | Verified |
|---|---|---|
| 1 | The alarm name says `WriteCapacityUnits` but the metric is `ConsumedReadCapacityUnits` (read) | A write capacity alarm needs `ConsumedWriteCapacityUnits`. The two metrics exist separately |
| 2 | Namespace is `AWS/DynamoDB` but the dimension is `Name=InstanceId,...` | DynamoDB dimensions are `TableName`, `GlobalSecondaryIndexName`, `Operation`, `OperationType`, `Verb`, `ReceivingRegion`, `Source`, `StreamLabel`, and `DelegatedOperation`. There is no `InstanceId` |
| 3 | `--alarm-actions` is given a CloudWatch **alarm** ARN | Valid values are EC2 actions, an Auto Scaling policy, a Lambda function, an SNS topic, Systems Manager OpsItem or response plan, and an Amazon Q Developer investigation ARN. An alarm ARN is not a valid value |
| 4 | `--datapoints-to-alarm 5` with no `--evaluation-periods` | `DatapointsToAlarm` is the M of an M-out-of-N alarm and `EvaluationPeriods` is the N. Supplying M without N leaves the evaluation behavior undefined |
| 5 | No `--threshold` and no `--comparison-operator` | Nothing defines what counts as a breach |
| 6 | The `--dimensions` clause sits on a separate line with no line-continuation character | Pasted as is, it runs as two commands and the dimensions are lost |

Here is the corrected command.

```bash
# Notify an SNS topic when write capacity consumption on the Notes table
# exceeds the threshold for five consecutive minutes.
# --datapoints-to-alarm (M) equals --evaluation-periods (N), so the condition
# is five consecutive breaching periods.
aws cloudwatch put-metric-alarm \
  --alarm-name Notes-WriteCapacityUnitsLimit \
  --alarm-description "Notes table write capacity consumption exceeded threshold" \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=Notes \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 5 \
  --datapoints-to-alarm 5 \
  --threshold 240 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:us-east-2:111122223333:notes-ops-alerts
```

`--threshold 240` is an example value. The real value has to match the provisioned write capacity
units and the `--period`. With the `Sum` statistic and a 60-second period, the threshold means
"total write capacity units consumed in 60 seconds".

`--treat-missing-data` was changed to `notBreaching` for the reason in Section 6.3. `AWS/DynamoDB`
metrics may produce no data at all when there is no traffic, so missing must not be read as a
breach.

| Parameter | Required per the API spec |
|---|---|
| `AlarmName` | **Required** |
| `MetricName` / a `Metrics` array / `EvaluationCriteria` | **One of the three must** be specified |
| `ComparisonOperator`, `EvaluationPeriods`, `Threshold`, `DatapointsToAlarm` | `Required: No` in the spec, but effectively necessary to make a meaningful metric alarm |

Valid values for `ComparisonOperator` are `GreaterThanOrEqualToThreshold`,
`GreaterThanThreshold`, `LessThanThreshold`, and `LessThanOrEqualToThreshold`, plus
`LessThanLowerOrGreaterThanUpperThreshold`, `LessThanLowerThreshold`, and
`GreaterThanUpperThreshold` for alarms based on anomaly detection models.

Creating an alarm sets its state immediately to `INSUFFICIENT_DATA` (`OK` for PromQL alarms),
after which it is evaluated and the state settles. **Updating an existing alarm leaves the state
unchanged but completely overwrites the previous configuration.** It is not a partial update.

> — Source: [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html)

> — Source: [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html)

---

## 7. CloudWatch Logs

### 7.1 Core Concepts

| Concept | Content |
|---|---|
| Log event | A record of activity recorded by the application or resource being monitored. It has two properties, the time stamp of when the event occurred and the raw message. Messages must be UTF-8 encoded |
| Log stream | A sequence of log events that share the same source, generally one application instance or one resource |
| Log group | A group of log streams that share the same **retention, monitoring, and access control settings** |
| Metric filter | Extracts metric observations from ingested events and turns them into data points in a CloudWatch metric. Assigned to a log group and applied to all of its streams |

Each log stream **has to belong to one log group.** You might group the per-host Apache access log
streams into a single log group called `MyWebsite.com/Apache/access_log`. **There is no limit on the
number of log streams that can belong to one log group.**

> — Source: [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

### 7.2 How to Send Logs

| Method | Content |
|---|---|
| Automatic | CloudWatch Logs automatically receives log events from several AWS services |
| CloudWatch agent | The unified agent sends both metrics and logs |
| AWS CLI | `aws logs put-log-events` uploads batches of log events |
| API | The `PutLogEvents` API uploads batches programmatically |

**Both structured and unstructured logs are supported.** Here are examples.

Unstructured:

```text
ERROR 2026-08-25 05:40:16 - Error processing notification
```

Structured (JSON):

```json
{
  "level": "Error",
  "message": "Error processing notification",
  "timestamp": "1591940416",
  "context": {
    "userId": "StudentA",
    "type": "Lambda.Handler",
    "env": "dev",
    "component": "api",
    "correlationId": "41e556-9e5-4c37-856e-3b623be",
    "threadId": 16,
    "member": "ProcessNotification",
    "sourceFile": "Lambda/Handler.cs",
    "exception": "<exception details>"
  }
}
```

**There is a concrete reason to use structured logs.** CloudWatch Logs Insights automatically
discovers log fields in any application or custom log that emits log events as JSON. Unstructured
logs do not get that benefit. Include a field such as `correlationId` and you can later pull
together every log line tied to one request.

> — Source: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

> — Source: [Analyzing log data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

> **Terminology correction.** log4net, Log4j, NLog, and Serilog are sometimes called "supported
> logging **protocols**". These are logging frameworks and libraries, not protocols
> ([Section 13.1](#131-differences-from-the-courseware)).

### 7.3 Retention and Log Classes 🆕

Log groups share the same retention, and **the default is indefinite (Never Expire).** Left alone,
logs accumulate and keep billing. It is the most common cost leak in a lab account.

| Item | Content |
|---|---|
| Default retention | Indefinite. Configured per log group and changeable at any time |
| Deletion delay | Log events are not deleted the moment they reach the retention setting. It typically takes **up to 72 hours**, and rarely longer |
| Marked for deletion | Events that reach the retention setting are marked for deletion and stop adding to archival storage cost from that point. They are also excluded from `storedBytes` |

There is one trap when you **increase** retention. If a log group contains events that are past
their expiration date but not yet actually deleted, and you lengthen the retention setting, those
events take **up to another 72 hours after the new retention date is reached** to be deleted. To be
sure data is permanently gone, keep the log group at the lower retention setting until 72 hours
have passed after the end of the previous retention period, or confirm the older events are gone.

There are two **log classes**.

| Class | Use |
|---|---|
| Standard | Logs that need real-time monitoring or that you access frequently. Full-featured |
| Infrequent Access | Logs you access less often. Lower cost but supports only **a subset** of Standard capabilities |

You can also enable **deletion protection**. With it on, all deletion operations on the log group
are blocked until it is explicitly disabled. It is not enabled by default. Use it on log groups you
cannot afford to lose, such as audit data and production application logs.

> — Source: [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

> — Source: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

### 7.4 CloudWatch Logs Insights 🆕

**This is the part most often left empty.** Stopping at shipping logs to CloudWatch leaves out how
to query or analyze what was collected. Not being able to read your logs leaves one of the three
pillars empty.

**There are three query languages.**

| Language | Characteristics |
|---|---|
| Logs Insights QL | A purpose-built language with few but powerful commands |
| OpenSearch Service PPL | Commands chained with pipes (`\|`). Supports filtering and aggregation plus math, string, date, and conditional functions |
| OpenSearch Service SQL | `SELECT` / `FROM` / `WHERE` / `GROUP BY` / `HAVING` and more. Supports `JOIN` across log groups and sub-queries for correlation |

With SQL or PPL, enclose fields containing non-alphanumeric characters in backticks. `@message`,
`Operation.Export`, and `Test::Field` need them; purely alphabetical names do not.

Here are the **main features**.

| Feature | Content |
|---|---|
| Automatic field discovery | Recognizes fields in AWS service logs from Route 53, Lambda, CloudTrail, and VPC, and in any log that emits events as JSON |
| Field indexes | Indexing commonly used fields lets queries skip events that lack the field, reducing scanned data and cost. The `filterIndex` command is Logs Insights QL only |
| Pattern analysis | Finds recurring text structures and shows them on the **Patterns** tab |
| Natural language query generation | Describe what you are looking for and it generates a query with a line-by-line explanation |
| Surrounding logs | View 5, 10, 20, 50, or 100 lines before and after a specific record and search for keywords within them |
| Saved queries and history | Save, re-run, and use parameterized saved queries |
| Add to dashboard | Attach queries to dashboards |
| Result encryption | Encrypt query results with AWS KMS |
| Comparison queries | Compare against log events from a previous time period. Logs Insights QL only |

You need to know the **limits**.

| Item | Value |
|---|---|
| Concurrent queries (Logs Insights QL) | 100 per account, including queries added to dashboards |
| Concurrent queries (OpenSearch PPL / SQL) | 15 |
| Query timeout | 60 minutes |
| Result availability | 7 days |
| Searchable from | Data sent to CloudWatch Logs on November 5, 2018 or later |
| Log group creation time | Events with time stamps that pre-date the log group's creation time cannot be accessed |
| Charging | Based on the amount of **uncompressed log data scanned**, regardless of query language |

The fact that charging is by scan volume matters. Field indexes and a narrow time range reduce
cost directly.

In an environment where web sockets are blocked you cannot reach the Logs Insights portion of the
console. Use the `StartQuery` API for the same capability.

> — Source: [Analyzing log data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

### 7.5 Turning Logs into Metrics: EMF 🆕

Beyond producing a structured JSON log, there is a way to **turn that log into a metric.** The
CloudWatch **embedded metric format (EMF)** does that job.

| Item | Content |
|---|---|
| What it does | Generates custom metrics **asynchronously** in the form of logs written to CloudWatch Logs. CloudWatch extracts them automatically so you can visualize and alarm on them |
| Why it is useful | Lets you create custom metrics from **ephemeral resources** such as Lambda functions and containers without instrumenting or maintaining separate code |
| Setup | None required. Either structure your logs per the EMF specification or generate them with the client libraries and send them via `PutLogEvents` or the CloudWatch agent |
| Permissions needed | Only `logs:PutLogEvents`. `cloudwatch:PutMetricData` is **not** required |
| Bonus | Query the detailed log events associated with the extracted metrics through Logs Insights to get at root causes |
| Charging | Charges are incurred for log ingestion and archival plus the custom metrics generated |
| Delivery guarantee | At-least-once delivery. Duplicate metric values may occasionally occur |

**You must know the cardinality trap.** By design EMF creates **one custom metric per unique
dimension combination.** Put a field like `requestId`, whose value is nearly always different, into
a dimension and you generate as many metrics as you have requests, and the bill explodes. Only
fields with a limited set of values belong in dimensions.

> — Source: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

### 7.6 .NET Packages for Shipping Application Logs

These are the NuGet packages used to ship application logs to CloudWatch Logs. They batch queued
logging messages and send them to CloudWatch Logs on a background thread.

| Package | Purpose |
|---|---|
| `AWSSDK.CloudWatchLogs` | CloudWatch Logs SDK |
| `AWS.Logger.Core` | Shared core |
| `AWS.Logger.NLog` | NLog integration |
| `AWS.Logger.Log4net` | log4net integration |
| `AWS.Logger.SeriLog` | Serilog integration |
| `AWS.Logger.AspNetCore` | ASP.NET Core integration |
| `Amazon.Lambda.Logging.AspNetCore` | For Lambda |

> **Do not use background-thread logging in Lambda.** This warning has a documented basis. Lambda
> **freezes** the execution environment when the runtime and each extension have completed and there
> are no pending events. The background thread freezes with it, so queued logs are not delivered. If
> no further event arrives for a while, the freeze may not lift. The recommended approach is
> `ILambdaContext.Logger.LogLine` or `Amazon.Lambda.Logging.AspNetCore`.
>
> — Source: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 7.7 Lambda Logging Is Now a Setting 🔄

It is easy to treat structured logs as something the application has to produce itself. Now you
can set the format and level **in the function configuration.**

| Setting | Values |
|---|---|
| Log format | Plain text or **structured JSON** |
| Log level | For JSON structured logs: `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` |
| Log group | Choose the CloudWatch log group the function sends logs to |

**The destinations grew too.** It is easy to assume CloudWatch Logs alone, but there are more
options.

| Destination | When to use it |
|---|---|
| CloudWatch Logs (default) | Real-time viewing, processing, and alerting. Logs Insights and Live Tail integrate natively |
| Amazon S3 | The most economical option for long-term storage. Analyze with tools like Athena. Latency is typically higher |
| Firehose | Simplifies streaming to OpenSearch Service, the Redshift Data API, or third-party platforms such as Datadog, New Relic, and Splunk via pre-built integrations. Also streams to custom HTTP endpoints |

Firehose costs include both the streaming service and the cost of whatever you stream to.

> — Source: [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html)

---

## 8. Instrumenting Your Application

Some source material splits the same content across several slides. It is merged into one section
here ([Section 13.1](#131-differences-from-the-courseware)).

### 8.1 Instrumentation Paths

| Path | Target |
|---|---|
| SDK | Called directly from application code |
| CloudWatch agent | Installed on servers and containers |
| AWS CLI | Called from a terminal or a script |

There are nine SDKs: Python (Boto3), .NET, Ruby, JavaScript, Go, Java, Node.js, C++, and PHP.

### 8.2 The CloudWatch Agent 🔄

The agent's targets are often taken to be Amazon EC2 and on-premises servers, and its purpose
limited to metrics and logs. The scope is broader now.

| Item | Content |
|---|---|
| What it collects | Metrics, logs, and **traces** |
| Where it runs | Amazon EC2 instances, on-premises servers, and **containerized applications** |
| OS-level metrics | Collects in-guest metrics from EC2 instances in addition to instance metrics |
| Custom metrics | Retrieves them via the `StatsD` (Linux and Windows Server) and `collectd` (Linux only) protocols |
| Default namespace | `CWAgent`. You can specify a different one |
| Charging | Metrics collected by the agent are billed as **custom metrics** |
| Metric destinations | CloudWatch, Amazon Managed Service for Prometheus, or both. Set `cloudwatch`, `amp`, or both in the `metrics_destinations` parameter of the configuration file |
| License | Open source under the MIT license |

**Trace collection is the important change.** Version 1.300025.0 and later collects traces from
OpenTelemetry or X-Ray client SDKs and sends them to X-Ray. **You no longer need to run a separate
trace collection daemon**, which reduces the number of agents you run and manage. In other words
the CloudWatch agent takes over the X-Ray daemon's role
([Section 12.3](#123-the-move-to-opentelemetry)).

Version 1.300031.0 and later can be used to enable CloudWatch Application Signals.

The install flow has four steps.

1. Create IAM roles or users that let the agent collect metrics from the server and optionally
   integrate with AWS Systems Manager
2. Download the agent package
3. Modify the configuration file and specify the metrics you want to collect
4. Install and start the agent on your servers

> — Source: [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)

---

## 9. CloudWatch Application Insights

### 9.1 What It Does

| Feature | Content |
|---|---|
| Application discovery | Adding an application makes it **scan** the resources inside |
| Intelligent problem detection | Analyzes metric patterns using historical data to detect anomalies, and continuously detects errors and exceptions from application, operating system, and infrastructure logs |
| Notifications and actions | Correlates the observations to build **automatic dashboards** showing relevant observations and problem severity |

After the scan it **recommends and configures** CloudWatch metrics and logs for the application's
components. The documentation names SQL Server backend databases and Microsoft IIS / web tiers as
example components.

It correlates observations using a combination of classification algorithms and built-in rules, and
is powered by SageMaker and other AWS technologies.

**Reducing MTTR is the point.** The documentation states this directly: the enhanced visibility
into application health that Application Insights provides helps reduce **mean time to repair
(MTTR)** when troubleshooting application issues.

Built-in integration with AWS Systems Manager OpsCenter lets you resolve detected issues by running
the relevant Systems Manager Automation document.

> — Source: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

### 9.2 The List of Common Problems 🔄

Four items are sometimes given as common fault patterns with no explanation.

| Frequently listed item |
|---|
| Infinite loop |
| Downstream slowdown |
| Wrong API version |
| Trigger verification |

The problems the documentation names as ones it provides "additional insights that point to a
possible root cause and steps for resolution" for are the following. **They do not overlap with the
frequently listed set above.**

| Verified item | Stack |
|---|---|
| Application latency | .NET and SQL |
| SQL Server failed backups | SQL |
| Memory leaks | .NET |
| Large HTTP requests | .NET |
| Canceled I/O operations | .NET |

> — Source: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

### 9.3 Lambda Now Stops Infinite Loops for You 🆕

An S3 bucket triggering an image-resize Lambda that uploads a log back into the same bucket,
triggering itself again, is presented as a "common fault pattern", often without any defense.
**Lambda has a built-in defense now.**

| Item | Content |
|---|---|
| Default behavior | When Lambda detects a recursive loop it **stops your function being invoked and notifies you** |
| Detection threshold | Roughly **16** invocations in the same chain of requests, then the next invocation is stopped |
| How to turn it on | It is **on by default for all customers and there is no charge** |
| Does it need X-Ray | **No.** X-Ray active tracing does not have to be enabled |
| How it works | It uses X-Ray **tracing headers**. When a supported service sends an event to Lambda the event is automatically annotated with metadata, and that metadata is updated when your function writes the event to another supported service using a supported SDK version. The metadata carries a count of how many times the event has invoked the function |

**Detection has limits.** What is detected is loops between Lambda functions, Amazon SQS, Amazon
S3, and Amazon SNS, plus loops made up only of Lambda functions. **When another service such as
DynamoDB forms part of the loop, Lambda cannot detect it.** That is why the documentation
recommends configuring CloudWatch alarms for unusual usage patterns such as spikes in Lambda
concurrency or invocations, together with a billing alarm or AWS Cost Anomaly Detection.

If your design intentionally uses recursive patterns you can change the behavior. In a SAM template
you use the function's `RecursiveLoop` property.

```yaml
Resources:
  ResizeImageFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: python3.13
      # Terminate: stop invocations and notify when a recursive loop is detected (default)
      # Allow: take no action even when a loop is detected. Only for intentional recursion
      RecursiveLoop: Terminate
```

> — Source: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

> — Source: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

### 9.4 What the Demo Shows

The order the demo runs in.

| Step | Content |
|---|---|
| Prepare | Get a sample application from AWS Docs |
| 1 | Group the resources of the services related to the application |
| 2 | Run CloudWatch Application Insights |
| 3 | Induce some errors |
| 4 | Show dashboards, alarms, metrics, and insights in CloudWatch |

---

## 10. AWS X-Ray

### 10.1 What X-Ray Is

| Capability | Content |
|---|---|
| Collects request data | Collects data about the requests your application serves |
| Provides viewing and filtering tools | View, filter, and gain insights into that data to identify issues and opportunities for optimization |
| Traces requests | For any traced request, see request and response details plus details about the calls your application makes to downstream AWS resources, microservices, databases, and web APIs |

The main use cases.

- Analyze and debug distributed applications
- Identify and resolve the root cause of performance issues and errors
- Start and stop application tracing
- Third-party or external services

X-Ray receives traces from your application as well as from AWS services your application uses that
are already integrated with X-Ray. Most instrumentation scenarios require **only configuration
changes**. For example, you can instrument all incoming HTTP requests and downstream calls to AWS
services that your Java application makes.

> — Source: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

### 10.2 How It Works

The basic path is `client → X-Ray daemon → X-Ray API → X-Ray console`, with the `AWS CLI` and
`SDK` also feeding the API. Here is what the documentation adds.

| Step | Content |
|---|---|
| SDK → daemon | Instead of sending to X-Ray directly, each client SDK sends JSON segment documents to a **daemon process listening for UDP traffic** |
| Daemon → X-Ray | The daemon **buffers** segments in a queue and uploads them **in batches** |
| Daemon availability | Available for Linux, Windows, and macOS, and included on the AWS Elastic Beanstalk and AWS Lambda platforms |
| Integrated services | AWS services integrated with X-Ray can add tracing headers to incoming requests, send trace data to X-Ray, or run the X-Ray daemon |

> — Source: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

> **The X-Ray daemon is not the recommended path now.** The daemon follows the same maintenance
> timeline as the SDKs, and the documentation guides you toward migrating to the CloudWatch agent or
> the OpenTelemetry Collector ([Section 12.3](#123-the-move-to-opentelemetry)).

### 10.3 The Trace Map 🔄

This diagram was long called the **service map**. Current documentation uses **trace map**. And it
is not only the name that changed. **The location changed.**

| Item | Verified |
|---|---|
| Name | The X-Ray overview documentation calls this diagram a trace map |
| Consolidation | The X-Ray service map and the CloudWatch ServiceLens map have been **combined into the X-Ray trace map within the Amazon CloudWatch console** |
| How to open it | In the CloudWatch console, choose **Trace Map** under **X-Ray traces** in the left navigation pane |

The trace map shows the client, your front-end service, and the backend services that your
front-end service calls to process requests and persist data. To improve performance, use the map to
identify bottlenecks, latency spikes, and other issues.

**The relationship between service graph and service map** is this. A service graph is a **JSON
document** containing information about the services and resources that make up your application,
and the map is the console's visualization of it. Service graph data is retained for **30 days**.

For a distributed application, X-Ray combines nodes from all services that process requests with the
same trace ID into a single service graph.

> — Source: [What is AWS X-Ray?](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 10.4 Node Colors and Error Classification

There are four node colors.

| Color | Meaning |
|---|---|
| Green | Successful calls |
| Red | Server failure (500 series errors) |
| Yellow | Client error (400 series errors) |
| Purple | Throttling error (429 too many requests) |

The X-Ray documentation's error classification is as follows. The color mapping above matches this
classification.

| Category | Content |
|---|---|
| `Error` | Client errors (400 series) |
| `Fault` | Server faults (500 series) |
| `Throttle` | Throttling errors (429 Too Many Requests) |

When an exception occurs, the X-Ray SDK records details about it, including the stack trace.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> **Typographical error.** Some source material says "the ratio of successful calls to errors and
> **combinations**". In context this is a typo for **faults**
> ([Section 13.1](#131-differences-from-the-courseware)).

### 10.5 The X-Ray Console Is No Longer Being Developed 🔄

This is the most important change in the module. The X-Ray console has long been presented as the
place to look at traces.

The documentation is unambiguous. **AWS is no longer developing the X-Ray console.** The CloudWatch
console includes new X-Ray functionality redesigned from the X-Ray console, and it contains **all of
the functionality** of the X-Ray console.

| Console | Status and characteristics |
|---|---|
| Amazon CloudWatch console | Redesigned X-Ray functionality, plus X-Ray traces alongside CloudWatch logs and metrics **on one screen**. Includes network and infrastructure monitoring and all X-Ray console functionality |
| X-Ray console | Still usable if you want a simpler console experience or do not want to update application code. **But it is no longer being developed** |

X-Ray Insights (which automatically detects anomalies in application performance and finds the
underlying causes) is included in the CloudWatch console under **Insights**.

CloudWatch also now includes **Application Signals**, which discovers and monitors your services,
clients, Synthetics canaries, and service dependencies. You can view health metrics based on service
level objectives (SLOs) and drill down to correlated X-Ray traces.

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

### 10.6 Observability Capabilities That Grew into CloudWatch 🆕

The core tools are CloudWatch and X-Ray. Since module objective 2 speaks of "modern development",
here is what exists in this space as far as we verified.

**Application Signals**

| Item | Content |
|---|---|
| What it does | Automatically collects metrics and traces from applications running on services such as EC2, ECS, and Lambda, and displays key metrics such as call volume, availability, latency, faults, and errors **without writing custom code or creating dashboards** |
| SLO / SLI | Create service level objectives (SLOs) and track service level indicator (SLI) status in a services list and topology map. Create alarms to track SLOs |
| Application map | Visualizes the application topology it discovers automatically, showing applications, dependencies, and their connectivity |
| Supported languages | Java, Python, Node.js, .NET |
| Supported platforms | Supported and tested on Amazon EKS, Amazon ECS, and Amazon EC2. On EKS clusters it discovers service and cluster names automatically; on other architectures you supply the names |
| Supported Regions | Every commercial Region except Canada West (Calgary) |
| Integrations | CloudWatch RUM, CloudWatch Synthetics canaries, AWS Service Catalog AppRegistry, Amazon EC2 Auto Scaling |

**Transaction Search**

| Item | Content |
|---|---|
| What it does | An interactive analytics experience that gives complete visibility of your application transaction **spans** |
| What a span is | The fundamental unit of a distributed trace. It records start and end times, duration, and metadata that can include business attributes such as customer IDs and order IDs. Spans are arranged in a parent-child hierarchy that forms a complete trace |
| Captures 100% of spans | Ingests all spans as structured logs in CloudWatch, which prevents broken traces and lets you view large traces containing up to **10,000** spans |
| Where they are stored | Spans sent to X-Ray are ingested into a log group called `aws/spans`. X-Ray traces are automatically converted to the semantic convention format before storage |
| Indexing | A percentage of spans is indexed as **trace summaries** in X-Ray to unlock end-to-end trace search and analytics |
| Uses CloudWatch Logs features | Metric filters to extract custom metrics, subscription filters to forward data, and data masking to protect personally identifiable information |

When you enable Transaction Search, CloudWatch uses those spans to generate an application
performance monitoring (APM) experience in Application Signals. If you already send traces to X-Ray
you enable it in the console or with the API; if you do not, Application Signals provides a
pre-packaged OpenTelemetry setup with ADOT or the CloudWatch agent, or you can use OpenTelemetry
directly.

> — Source: [Application Signals](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Monitoring-Sections.html)

> — Source: [Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search.html)

---

## 11. X-Ray Core Concepts

### 11.1 Trace, Segment, Subsegment

A trace of `listFunction` shows the structure.

```text
End user
  └─ API/PROD                     segment     (Stage: Prod  GET  invoke: listFunction)
       └─ AWS::Lambda
            └─ listFunction       segment     (initialization / invocation)
                 └─ List          subsegment
                      └─ Notes table   query: Notes
```

| Concept | Definition |
|---|---|
| Trace | Collects **all the segments** generated by a single request. That request is typically an HTTP GET or POST request travelling through a load balancer |
| Segment | What the compute resources running your application logic send about their work. It provides the resource's name, details about the request, and details about the work done |
| Subsegment | More granular timing information and details about the **downstream calls** your application made to fulfill the original request |

Here is the data a segment can record.

| Item | Content |
|---|---|
| The host | Hostname, alias, or IP address |
| The request | Method, client address, path, user agent |
| The response | Status, content |
| The work done | Start and end times, subsegments |
| Issues that occur | Errors, faults, and exceptions, including automatic capture of exception stacks |

A subsegment can contain details about a call to an AWS service, an external HTTP API, or a SQL
database, and you can define **arbitrary subsegments** to instrument specific functions or lines of
code.

**Segment documents can be up to 64 kB.** 🆕 Trace data is retained for **30 days**.

**Client IP on forwarded requests** 🆕 — If a load balancer or other intermediary forwards a
request, X-Ray takes the client IP from the `X-Forwarded-For` header rather than the source IP in the
IP packet. That value **can be forged, so it should not be trusted.**

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.2 Inferred Segments 🆕

The trace structure above has a DynamoDB `Notes table` node. But **DynamoDB does not send its own
segments.** It is worth spelling out where that node comes from.

| Situation | What gets created |
|---|---|
| The downstream does not support tracing (for example DynamoDB) | X-Ray uses the upstream's subsegment to generate an **inferred segment** and a downstream node on the trace map |
| The downstream is also instrumented | The segment that service sends **replaces** the inferred segment |

The node always uses information from the service's own segment when available, while the **edge**
between two nodes uses the upstream service's subsegment. Both viewpoints are useful. The downstream
service records precisely when it started and ended work on the request, and the upstream service
records the round trip latency, including the time the request spent travelling between the two.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.3 Annotations and Metadata

Examples.

```json
{
  "annotations": {
    "UserId": "student"
  }
}
```

```json
{
  "metadata": {
    "default": {
      "extended_request_id": "FZplbGUGiYcFvyA=",
      "request_id": "49ab-45ad-40cd-acd-1b5526"
    }
  }
}
```

| Item | Indexed | Purpose |
|---|---|---|
| Annotations | **Yes** | Used with filter expressions. Record data you want to use to group traces in the console or when calling the `GetTraceSummaries` API |
| Metadata | No | Can hold values of any type, including objects and lists. Record data you want stored in the trace but **do not need for searching** |

**X-Ray indexes up to 50 annotations per trace.** This figure is still correct.

Annotations and metadata are aggregated at the trace level and can be added to any segment or
subsegment. You view them in the segment or subsegment details window on the trace details page in
**the CloudWatch console**.

**Filter expressions and groups** 🆕 — Even with sampling, a complex application generates a lot of
data. Filter expressions find traces related to specific paths or users. Define a **group** with a
filter expression and you can generate a per-group service graph, trace summaries, and CloudWatch
metrics, with a metric for the number of traces matching each criteria published to CloudWatch
**every minute**.

Groups come with two cautions.

- Updating a group's filter expression **does not change data already recorded.** It applies only to
  subsequent traces, which can produce a merged graph of the new and old expressions. To avoid that,
  delete the group and create a fresh one.
- Groups are billed by the number of **retrieved traces** that match the filter expression.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.4 Sampling 🆕

**This governs tracing cost and overhead.**

The X-Ray SDK applies a sampling algorithm to determine which requests get traced. The defaults are
as follows.

| Item | Default | Meaning |
|---|---|---|
| Reservoir | 1 per second | The **number of matching requests to instrument per second** before the fixed rate applies. It ensures at least one trace is recorded each second as long as the service is serving requests |
| Rate | 5% | The percentage of matching requests instrumented after the reservoir is exhausted |

The default sampling rate is deliberately conservative so you do not incur charges while getting
started. You can modify the default rule and add rules that sample based on properties of the service
or request. For example, disable sampling and trace all requests for calls that modify state or
handle users and transactions, and sample high-volume read-only calls such as background polling,
health checks, and connection maintenance at a low rate.

Here are the **rule options**. String values can use the wildcards `?` (a single character) and `*`
(zero or more).

| Option | Content |
|---|---|
| Rule name | A unique name |
| Priority | 1–9999. Services evaluate rules in **ascending** order of priority and make the sampling decision with **the first rule that matches** |
| Reservoir | A non-negative integer. It applies **collectively** to all services using the rule |
| Rate | A percentage from 0 to 100 in the console, or a value from 0 to 1 in a client SDK JSON document |
| Service name | The name of the instrumented service as it appears in the trace map. For API Gateway, `api-name/stage` |
| Service type | `AWS::EC2::Instance`, `AWS::ECS::Container`, `AWS::EKS::Container`, `AWS::ElasticBeanstalk::Environment`, `AWS::APIGateway::Stage`, `AWS::AppSync::GraphQLAPI`, `AWS::StepFunctions::StateMachine`, and others |

**Sampling is parent-based.** Without knowing this property you cannot work out why a rule you wrote
has no effect.

- The sampling decision is made **once**, typically by the first X-Ray-enabled service that handles
  the request (the root service)
- A downstream service that receives a request carrying a decision from an upstream parent honors
  that decision **regardless of its own matching rules**
- So your rules only take effect on services where no sampling decision has been made yet. That is
  usually the entry point of your application (an API Gateway, a load balancer, or the first
  instrumented microservice) or an asynchronous process or worker that starts a brand new trace
- **The common pitfall**: create a strict rule for "Service B" and it will almost never apply if
  Service B is always called by Service A. It simply follows A's decision. To change the sampling for
  this workflow you must configure the rule on the **root service (A)**

**Where you put the rules matters.**

| Location | Drawback or benefit |
|---|---|
| A JSON document included with your code (local) | Each service instance samples **independently**. The per-instance reservoirs add together and the overall sampled percentage rises. Changing a rule requires a **redeploy** |
| Defined in the X-Ray service | The service manages the reservoir for each rule and **distributes quotas evenly** based on the number of instances running. You manage rules without deploying |

Sampling rules can also be configured **from the CloudWatch console**: Settings under Setup →
Sampling rules within the X-Ray traces section → View settings.

The targets you can configure sampling for are API Gateway entry points, AWS AppSync, AWS Step
Functions, and applications instrumented with ADOT or the X-Ray SDK on compute platforms such as
EC2, ECS, and Elastic Beanstalk.

X-Ray uses a best-effort approach in applying sampling rules, so the effective rate may not exactly
match what you configured. Over time the number of sampled requests should come close to the
configured percentage.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> — Source: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 11.5 The Tracing Header 🆕

The sampling decision and trace ID are propagated in HTTP requests in the `X-Amzn-Trace-Id` header.
The first X-Ray-integrated service the request hits adds it.

```http
X-Amzn-Trace-Id: Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1
```

| Field | Meaning |
|---|---|
| `Root` | The trace ID |
| `Parent` | The parent segment ID. Present if the request came from an instrumented application |
| `Sampled` | The sampling decision |
| `Lineage` | May be appended by Lambda and other AWS services as part of their processing. **Do not use it directly** |

**There is a security consideration.** A tracing header can originate from the X-Ray SDK, an AWS
service, or **the client request**. To avoid issues caused by users adding trace IDs or sampling
decisions to their requests, your application can remove `X-Amzn-Trace-Id` from incoming requests.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

### 11.6 Lambda's Segment Structure 🔄

Some material writes the Lambda cold start as `code-start container download → runtime bootstrap →
run code`. `code-start` is a **typo for cold start**, and the phase breakdown also differs from the
documentation.

**Lambda records 2 segments per trace.**

| Segment | What it covers |
|---|---|
| `AWS::Lambda` | The whole process of preparing the execution environment: scheduling the MicroVM, creating or **unfreezing** an execution environment, and **downloading your function code and all layers** |
| `AWS::Lambda::Function` | The work done by the function |

**Which side the error is on tells you who is responsible.** A trace shows two segments with the same
name but different `origin` values. An error on the `AWS::Lambda` segment means the **Lambda service**
had an issue; an error on the `AWS::Lambda::Function` segment means **your function** had an issue.

**The subsegment structure is in transition.** AWS is implementing changes to the Lambda service, so
you may see both formats in the same account.

| Format | Subsegments |
|---|---|
| Old | `Initialization`, `Invocation`, `Overhead` (plus `Restore` for SnapStart) |
| New | **There is no `Invocation` segment.** Only the `Init` subsegment remains, and customer subsegments attach directly to the `AWS::Lambda::Function` segment |

What each subsegment in the old format means.

| Subsegment | Phase |
|---|---|
| `Initialization` | The Init phase of the execution environment lifecycle: initializing extensions, initializing the runtime, and running the function's initialization code |
| `Invocation` | The Invoke phase where Lambda invokes the function handler. It begins with runtime and extension registration and ends when the runtime is ready to send the response |
| `Overhead` | The phase between the runtime sending the response and the signal for the next invoke, while the runtime finishes invoke-related tasks and prepares to freeze the sandbox |
| `Restore` | (SnapStart only) The time to restore a snapshot, load the runtime, and run after-restore runtime hooks |

In the new format, the `AWS::Lambda::Function` segment carries the following metrics **as
annotations**.

| Annotation | Meaning |
|---|---|
| `aws.responseLatency` | The time taken for the function to run |
| `aws.responseDuration` | The time taken to transfer the response to the customer |
| `aws.runtimeOverhead` | The additional time the runtime needed to finish |
| `aws.extensionOverhead` | The additional time the extensions needed to finish |

Here is the **Lambda execution environment lifecycle** as the documentation gives it. Compare it with
the three steps mentioned earlier.

| Phase | Content |
|---|---|
| `Init` | Three tasks: start all extensions (`Extension init`), bootstrap the runtime (`Runtime init`), and run the function's static code (`Function init`) |
| `Invoke` | Invoke the function handler |
| `Shutdown` | Cleanup |

The `Init` phase is **limited to 10 seconds**. If all three tasks do not complete within 10 seconds,
Lambda retries the `Init` phase at the time of the first function invocation with the configured
function timeout. The 10-second limit does not apply to functions using provisioned concurrency,
SnapStart, or Lambda Managed Instances.

**The "container download" step is not among the three tasks of the `Init` phase.** Downloading
function code and layers is part of the execution environment preparation covered by the
`AWS::Lambda` segment.

**There is a limit to what the X-Ray SDK can extend.** You can extend the `Invocation` subsegment
with additional subsegments for downstream calls, annotations, and metadata, but **you cannot access
the function segment directly or record work done outside the handler invocation scope.**

You may also see a large gap between the initialization and invocation phases. With provisioned
concurrency, Lambda initializes instances well in advance of invocation, and even with on-demand
concurrency Lambda might proactively initialize an instance with no invocation pending.

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

> — Source: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 11.7 Operational Metric Acronyms

The operational metric acronyms are as follows.

| Acronym | Expansion |
|---|---|
| MTTD | Mean Time to Detect |
| MTTI | Mean Time to Identification |
| MTTR | Mean Time to Repair |
| MTBF | Mean Time Between Failure |

Plus one formula.

```text
Availability = MTBF / (MTBF + MTTR)
```

How observability affects these is simple. Faster detection and identification (MTTD, MTTI) means
faster repair (MTTR), which shrinks the denominator of the availability formula and raises
availability.

MTTR does appear in AWS documentation. The Application Insights documentation states that the
visibility into application health it provides helps reduce the **mean time to repair (MTTR)** when
troubleshooting.

> — Source: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

> **What we could not confirm.** We could not confirm whether MTTD, MTTI, MTBF, and the availability
> formula are defined in this form in AWS official documentation. This section relays the courseware
> content; only MTTR was confirmed as used in official documentation
> ([Section 13.5](#135-items-we-could-not-verify)).

---

## 12. Enabling Tracing

### 12.1 The Settings That Turn Tracing On 🆕

SDK code alone is not enough; you also need **the settings that enable tracing on Lambda and
API Gateway.** No amount of instrumented code produces traces if these are off.

**Lambda's tracing modes**

| Mode | Behavior |
|---|---|
| `Active` | Lambda **automatically creates trace segments for function invocations and sends them to X-Ray** |
| `PassThrough` | Propagates the tracing context to downstream services only. Traces are not sent automatically |

**If you do not turn on `Active`, the default is `PassThrough`.** In `PassThrough` mode Lambda does
not send traces automatically even when the tracing header contains a decision to sample. If the
upstream service does not provide a header, Lambda generates one and makes the decision not to
sample. You can still send your own traces by calling tracing libraries from function code.

The console path is as follows.

1. Choose your function on the **Functions** page of the Lambda console
2. **Configuration** → **Monitoring and operations tools**
3. **Edit** under **Additional monitoring tools**
4. Under **CloudWatch Application Signals and AWS X-Ray**, choose **Enable** for **Lambda service
   traces**
5. **Save**

**Here is how to turn it on from a SAM template.** The lab application deploys with SAM, so this is
the path actually used.

```yaml
Resources:
  ListFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.list_handler
      Runtime: python3.13
      # Active: activates X-Ray tracing
      # Disabled: deactivates X-Ray
      # PassThrough: activates tracing but delegates the sampling decision downstream
      Tracing: Active
      Events:
        ListApi:
          Type: Api
          Properties:
            Path: /notes
            Method: get
```

If you specify `Tracing` as `Active` or `PassThrough` and do not set the `Role` property, AWS SAM
adds the `arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess` policy to the execution role it creates
for you.

You sometimes have to handle **permissions** yourself. Your function needs permission to upload
trace data to X-Ray. Activating tracing in the console makes Lambda add the required permissions;
otherwise add the `AWSXRayDaemonWriteAccess` policy to the execution role. The APIs needed are
`xray:PutTraceSegments` and `xray:PutTelemetryRecords`.

**Lambda's sampling rate is fixed.** It is 1 request per second plus 5 percent of additional
requests, and **you cannot configure it.** The sampling rules from Section 11.4 do not apply to the
Lambda function itself.

**Some combinations are unsupported.** X-Ray tracing is not supported for Lambda functions with
Amazon MSK, self-managed Apache Kafka, Amazon MQ with ActiveMQ or RabbitMQ, or Amazon DocumentDB
event source mappings.

**API Gateway tracing**

| Item | Content |
|---|---|
| Supported scope | **All** REST API endpoint types (Regional, edge-optimized, and private) |
| Regions | All AWS Regions where X-Ray is available |
| Enabled per | **API stage**. Use the console, the API, or the CLI |
| Pass-through behavior | If you call an API Gateway API from a service that is already being traced, API Gateway passes the trace through **even if tracing is not enabled on the API** |

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

> — Source: [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html)

> — Source: [Trace user requests to REST APIs using X-Ray in API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-xray.html)

### 12.2 Lambda No Longer Sends Traces Automatically 🔄

If tracing modes are overlooked, this change is easy to miss. **It is the single most common reason
traces do not appear in the lab.**

| When | Behavior |
|---|---|
| Previously | Lambda **sent traces automatically** when an upstream service such as Amazon API Gateway added a tracing header |
| Now | It does **not.** Control was handed to you so you trace the functions that matter to you |

If your solution depends on this passive tracing behavior, switch to `Active` tracing.

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

### 12.3 The Move to OpenTelemetry 🔄

**This is the largest change in the module.** It is easy to see only instrumentation with the
X-Ray SDK, but that path is no longer recommended.

**Support timeline**

| Phase | Period | Support provided |
|---|---|---|
| General availability | through February 25, 2026 | The X-Ray SDKs and daemon were fully supported, with regular releases including bug and security fixes |
| Maintenance mode | February 25, 2026 onward | **Only releases that address security issues.** No new feature enhancements |

No end-of-support date has been announced, so **the SDKs have not stopped working.** They just do not
receive new capabilities.

**Why OpenTelemetry**

X-Ray is transitioning to OpenTelemetry as its primary instrumentation standard for application
tracing and observability. OpenTelemetry's wide adoption enables tracing of requests across diverse
systems, including those outside AWS that may not integrate directly with X-Ray.

What migrating gets you.

- Enhanced framework and library instrumentation support
- Support for additional programming languages
- Automatic instrumentation capabilities
- Flexible sampling configuration options
- Unified collection of metrics, logs, and traces

**Three paths AWS provides**

| Path | Content |
|---|---|
| AWS Distro for OpenTelemetry (ADOT) | Exports OpenTelemetry traces as segments to X-Ray |
| CloudWatch Application Signals | Exports customized OpenTelemetry traces and metrics to monitor application health |
| CloudWatch OTel endpoint | Exports OpenTelemetry traces to X-Ray using the HTTP OTel endpoint with native OpenTelemetry instrumentation |

Here is the **concept mapping**, needed to carry what you learned about X-Ray over to
OpenTelemetry.

| X-Ray concept | OpenTelemetry concept |
|---|---|
| X-Ray Recorder | Tracer Provider and Tracers |
| Segment | (Server) Span |
| Subsegment | (non-Server) Span |
| Annotations / metadata | Attributes |
| Service Plugins | Resource Detector |
| X-Ray sampling rules | OpenTelemetry Sampling (customizable) |
| X-Ray Emitter | Span Exporter (customizable) |
| X-Ray Trace Context | Span Context |
| X-Ray trace context propagation | W3C Trace Context propagation |
| X-Ray daemon | OpenTelemetry Collector |
| (none) | Span Processing |
| (none) | Baggage |

**The console experience stays the same.** When you migrate to OpenTelemetry your spans are
**automatically converted** to X-Ray segments or subsegments, so your existing CloudWatch console
experience does not change.

**Annotations need separate handling.** By default OpenTelemetry span attributes are converted to
**metadata** in X-Ray raw data. To convert specific attributes to **annotations** instead, add their
keys to the `aws.xray.annotations` attributes list. Indexing differs between the two, so any
attribute you intend to search with filter expressions has to go in that list.

**Daemon migration** goes to the CloudWatch agent or the OpenTelemetry Collector. The Collector
provides more options for data collection formats and export destinations than the X-Ray daemon.

**Sampling strategies expand.**

| Strategy | Content |
|---|---|
| Parent-based Sampling | Respects the parent span's sampling decision before applying additional strategies |
| Trace ID Ratio Based Sampling | Randomly samples a specified percentage of spans |
| Tail sampling | Applies sampling rules to **complete traces** in the OpenTelemetry Collector |
| Custom samplers | Implement your own logic using the sampling interface |
| X-Ray Remote Sampler | Use X-Ray sampling rules with OpenTelemetry in some SDK languages |

**Context propagation format** is also a choice. OpenTelemetry supports W3C Trace Context (the
default), the X-Ray trace header, and other custom formats, and you can use more than one at a time.
To propagate context to AWS services that support X-Ray tracing, such as API Gateway endpoints,
configure the **X-Ray Propagator**.

> — Source: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — Source: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

### 12.4 Per-Language X-Ray SDK Configuration

Here is the older approach. **Read the maintenance-mode notice in Section 12.3 first.** This is
still needed to understand existing code.

| Language | Content |
|---|---|
| .NET | Before creating clients, call `AWSSDKHandler.RegisterXRayForAllServices()` to configure all AWS SDK for .NET clients. To target a specific service, `AWSSDKHandler.RegisterXRay<IAmazonDynamoDB>()` |
| Java | Configure the DynamoDB client and pass the Trace Handler to `AmazonDynamoDBClientBuilder` |
| Python | The X-Ray SDK for Python has a class named `xray_recorder` that provides the global recorder |

> **A caution on the Java item.** The `AmazonDynamoDBClientBuilder` named above is an
> **AWS SDK for Java 1.x** API. As covered in other modules, AWS SDK for Java 1.x has reached end of
> support. We could not verify the equivalent X-Ray instrumentation approach in 2.x, so this document
> does not assert one ([Section 13.5](#135-items-we-could-not-verify)). For new applications, use the
> OpenTelemetry path in Section 12.3.

### 12.5 The C# Example 🔄

A widely cited C# example contains a part that **will not compile.** It is corrected here with the
corrections recorded.

| # | Original material | Verified |
|---|---|---|
| 1 | `await` used inside `public void RunSqlQuery(...)` | You cannot use `await` in a `void` method. It has to be declared `async Task` to compile |
| 2 | `IHostingEnvironment env` | An older interface name. The replacement belongs to ASP.NET Core documentation and cannot be confirmed within AWS official documentation, so we do not assert it ([Section 13.5](#135-items-we-could-not-verify)) |

Here is the corrected code. The `env` parameter is in the original and unused in the body, so it is
left as is.

```csharp
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.SqlServer;

public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // Capture AWS service calls: register every AWS SDK for .NET client with X-Ray
    AWSSDKHandler.RegisterXRayForAllServices();

    // Capture incoming API calls: specify the app name used as the segment name
    app.UseXRay("SampleApp");

    // Rest of the app configuration
}

// Correction: changed from void to async Task, because the body uses await.
public async Task RunSqlQueryAsync(string connectionString)
{
    using (var connection = new SqlConnection(connectionString))
    {
        var query = "SELECT * FROM Products FOR XML AUTO, ELEMENTS";

        // Capture SQL queries: use TraceableSqlCommand instead of SqlCommand
        var command = new TraceableSqlCommand(query, connection);
        command.Connection.Open();
        await command.ExecuteXmlReaderAsync();
    }
}
```

The labels indicating which part of the code each one points to.

| Label | Corresponding code |
|---|---|
| Capture AWS service calls | `AWSSDKHandler.RegisterXRayForAllServices();` |
| Capture incoming API calls | `app.UseXRay("SampleApp");` |
| Capture SQL queries | `TraceableSqlCommand` |

### 12.6 What the Demo Shows

The order the demo runs in.

| Item | Content |
|---|---|
| Target | Lab 7 or a lab of your choice |
| 1 | How to enable Lambda / API Gateway for logging |
| 2 | The X-Ray console |
| 3 | The service map |
| 4 | Traces and errors |

> **Translated to current terms.** Item 2 is the **CloudWatch console** and item 3 is the **trace
> map** on the current path
> ([Section 10.5](#105-the-x-ray-console-is-no-longer-being-developed)).

### 12.7 Lab 7

The title is "Observing Your Application with AWS X-Ray". The lab uses the same application
architecture as the agenda.

If no traces appear in the lab, check in this order.

| Order | What to check | Reference |
|---|---|---|
| 1 | Is the Lambda function's `Tracing` set to `Active` | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 2 | Does the execution role have `xray:PutTraceSegments` and `xray:PutTelemetryRecords` | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 3 | Is tracing enabled on the API Gateway **stage** | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 4 | Was it filtered out by sampling (the default is 1 per second plus 5%) | [Section 11.4](#114-sampling) |
| 5 | Are you looking at the Trace Map in the CloudWatch console rather than the X-Ray console | [Section 10.5](#105-the-x-ray-console-is-no-longer-being-developed) |

---

## 13. Changes from the Courseware

Since learners may have the official courseware in front of them, this section gathers in one place
where this material diverges from it. The evidence behind every item marked new or corrected in the
sections above is here.

### 13.1 Differences from the Courseware

#### Wrong reference target

| Courseware says | Verified | Source |
|---|---|---|
| The original material gives `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` | The current path is `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html`. The `DeveloperGuide` path is not valid | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |

#### Errors in the CLI example

The corrected command is in [Section 6.5](#65-creating-an-alarm-from-the-cli).

| # | Courseware says | Verified | Source |
|---|---|---|---|
| 1 | `--alarm-name NotesWriteCapacityUnitsLimit` with `--metric-name ConsumedReadCapacityUnits` | A write capacity alarm needs `ConsumedWriteCapacityUnits` | [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html) |
| 2 | `--namespace AWS/DynamoDB` together with `--dimensions "Name=InstanceId,Value=i-12345678"` | DynamoDB dimensions do not include `InstanceId`. They are `TableName`, `GlobalSecondaryIndexName`, `Operation`, `OperationType`, `Verb`, `ReceivingRegion`, `Source`, `StreamLabel`, and `DelegatedOperation` | [DynamoDB Metrics and dimensions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html) |
| 3 | A CloudWatch **alarm** ARN given to `--alarm-actions` | Valid values are EC2 actions, an Auto Scaling policy, a Lambda function, an SNS topic, Systems Manager OpsItem or response plan, and an Amazon Q Developer investigation ARN | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 4 | `--datapoints-to-alarm 5` with no `--evaluation-periods` | `DatapointsToAlarm` is the M of M out of N and `EvaluationPeriods` is the N. M without N leaves the evaluation undefined | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 5 | No `--threshold` and no `--comparison-operator` | Nothing defines what counts as a breach | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |
| 6 | The `--dimensions` clause on a separate line with no line-continuation character | Pasted as is it runs as two commands and the dimensions are lost | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |

#### Imprecise conceptual explanations

| Courseware says | Verified | Source |
|---|---|---|
| The original material: "the alarm invokes the action only when the threshold has been breached for **three consecutive periods**" | The real behavior is M out of N. When M is smaller than N the alarm fires even without consecutive breaches. The evaluation range is also wider than N, so when data is missing older data points are pulled in | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| The original material: "an alarm watches a **single metric** over a specified period" | A metric alarm watches a single metric **or the result of a metric math expression**. Beyond that there are PromQL alarms, log alarms, and composite alarms over other alarms' states | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |
| The original material: "supported logging **protocols** — Apache log4net, Apache Log4j, Nlog, Serilog" | These are logging frameworks and libraries, not protocols. What the documentation names as ways to send logs are the CloudWatch agent, the `put-log-events` CLI command, and the `PutLogEvents` API | [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html) |
| The original material: common fault patterns given as "infinite loop / downstream slowdown / wrong API version / trigger verification" | The Application Insights documentation's list is application latency, SQL Server failed backups, memory leaks, large HTTP requests, and canceled I/O operations in .NET and SQL stacks. It does not overlap with that list | [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html) |

#### Typographical errors

| Courseware says | Verified | Source |
|---|---|---|
| The original material: `code-start container download` | A typo for `cold start`. The three tasks of the `Init` phase are starting extensions, bootstrapping the runtime, and running the function's static code; code and layer download is covered by the `AWS::Lambda` segment | [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| The original material: "the ratio of successful calls to errors and **combinations**" | In context this is a typo for **faults**. X-Ray classifies errors as `Error` (400), `Fault` (500), and `Throttle` (429) | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |

#### Places where the courseware contradicts itself

These are not disagreements with external documentation but **internal contradictions in the
courseware**, so they carry no 🆕 or 🔄 marker.

| Where it conflicts | Content | How this document handles it |
|---|---|---|
| The three pillars | One place gives `logging / metrics / tracing` and another gives `logging / monitoring / tracing`. The answer explanation states "metrics, traces, and logs" | Treats the `logging / monitoring / tracing` version as the wrong one and standardizes on `metrics / logs / traces` |
| CloudWatch's role | One place lists "metrics collection and **tracing**" as CloudWatch capabilities, while another assigns tracing to X-Ray | Notes that the two accounts disagree and lays out the actual structure (X-Ray traces viewed in the CloudWatch console) in [Section 10.5](#105-the-x-ray-console-is-no-longer-being-developed) |
| Module objective wording | One place has no space in the first item, another has one | Standardizes on the module-objectives wording |
| Repeated plan content | Identical body text with the diagram built up in stages, yet each set of notes contains a sentence the other lacks | Merged into [Section 2.3](#23-the-observability-plan) with both notes reflected |
| Repeated instrumentation content | Body text and terminal example identical across the repeated pages. None of them has separate notes | Merged into [Chapter 8](#8-instrumenting-your-application) |
| Repeated trace definition | The operational-acronyms material repeats the earlier trace ID and trace definition verbatim before introducing the acronyms | Keeps only the unique content (the acronyms and the availability formula) in [Section 11.7](#117-operational-metric-acronyms) |
| The original code | `await` used inside `public void RunSqlQuery(...)`. You cannot use `await` in a `void` method | Corrected to `async Task` and recorded in [Section 12.5](#125-the-c-example) |
| The original code | `IHostingEnvironment` is an older interface name | States only that it is an older name and does not assert the replacement ([Section 13.5](#135-items-we-could-not-verify)) |

### 13.2 Items Whose Behavior or Defaults Changed

| Item | Courseware says | Verified | Source |
|---|---|---|---|
| Where the X-Ray console sits | The original material presents the X-Ray console as the place to look at traces | **AWS is no longer developing the X-Ray console.** The CloudWatch console has redesigned X-Ray functionality and contains all of the X-Ray console's functionality | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Service map → trace map | The original material says "service map" | The X-Ray service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map** in the CloudWatch console | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| The name CloudWatch Events | The original material: "creates CloudWatch Events to notify you of future events" | EventBridge was formerly called CloudWatch Events. The API is the same and existing rules still appear, but **new features added to EventBridge are not added to CloudWatch Events** | [EventBridge is the evolution of Amazon CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) |
| Lambda sending traces automatically | Tracing modes are not covered, so API Gateway → Lambda traces are assumed to be collected naturally | Previously Lambda sent traces automatically when an upstream added a tracing header. **It does not now, and `Active` tracing has to be turned on explicitly.** Without it the default is `PassThrough` | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| Lambda X-Ray segment structure | The original material draws an `initialization / invocation` subsegment structure | The old format had `Initialization`, `Invocation`, and `Overhead`. The new format has no `Invocation` segment; only `Init` remains and customer subsegments attach to the function segment. AWS is mid-transition, so both formats may appear in one account | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| The CloudWatch agent's scope | The original material limits the targets to EC2 and on-premises servers and the purpose to metrics and logs | The agent collects metrics, logs, and **traces** from EC2, on-premises servers, and **containerized applications**. Version 1.300025.0 and later sends traces to X-Ray so a separate daemon is not needed | [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) |
| The CloudWatch metric model | The original material explains only namespaces and dimensions | CloudWatch supports OpenTelemetry metrics sent over OTLP. They use metric names and labels (up to 150), are queried with PromQL, and are handled in Query Studio | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| Recommended way to publish custom metrics | The original material shows "custom data" as an arrow only | **For new implementations, OpenTelemetry is recommended** | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |
| Lambda log destinations | The original material assumes CloudWatch Logs alone | CloudWatch Logs is the default and you can configure Amazon S3 or Firehose as destinations | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| Lambda log format | The original material presents structured logs as something the application produces itself | Advanced logging controls set the log format (text or JSON), the log level (`FATAL` through `TRACE`), and the destination log group **in the function configuration** | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| The nature of a log group | The original material describes it only as the unit that shares retention, monitoring, and access control settings | There are two log group classes, Standard and Infrequent Access, and you can also enable deletion protection | [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) |
| Alarm evaluation window | The original material explains only via a fixed-boundary diagram | You can choose a sliding window (default) or a wall clock window. The wall clock window aligns to fixed boundaries and does not query additional older data | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| Alarm action targets | The original material gives stopping, **starting**, and terminating EC2, EC2 Auto Scaling, and SNS | The current list is EC2 actions (stop, terminate, reboot, recover), Auto Scaling policies, **Lambda functions**, SNS topics, Systems Manager OpsItem and response plans, and **Amazon Q Developer investigations**. "Starting" is not among the EC2 actions | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |

### 13.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| **General availability of the X-Ray SDKs and daemon** | **Ended** — GA ended on February 25, 2026 and maintenance mode began the same day. Only security-fix releases are provided and there are no new feature enhancements. No end-of-support date has been announced, so they have not stopped working | OpenTelemetry-based instrumentation (ADOT or CloudWatch Application Signals) | [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html) |
| The **X-Ray SDK** as an instrumentation method | Discouraged — X-Ray is transitioning its primary instrumentation standard to OpenTelemetry, and AWS recommends adopting OpenTelemetry | AWS Distro for OpenTelemetry, CloudWatch Application Signals, CloudWatch OTel endpoint | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| The **X-Ray daemon** | Discouraged — it follows the same maintenance timeline as the SDKs and the documentation guides migration | The CloudWatch agent or the OpenTelemetry Collector | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| **Local JSON sampling rules** shipped with your code | Discouraged — each instance samples independently so the overall rate rises, and changing a rule requires a redeploy | Sampling rules defined in the X-Ray service (CloudWatch console → Settings → X-Ray traces → Sampling rules) | [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html) |

> **This table is the most important thing in the module.** The original material presents the X-Ray
> SDK and daemon as the only instrumentation path. Following it verbatim teaches a method that is no
> longer recommended. You still need it to read existing code, but for anything new use the
> OpenTelemetry path in [Section 12.3](#123-the-move-to-opentelemetry).

> — Source: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

> — Source: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — Source: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 13.4 What This Material Adds

Items the class did not cover that this document filled in from official documentation.

| Item | Where in this document | Why it was added | Source |
|---|---|---|---|
| That metric retention varies by period and older data is aggregated so the original resolution disappears | [Section 5.2](#52-retention-and-resolution) | It is the practical trap you hit trying to read old metrics at their original resolution | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| Metric time stamp constraints (two weeks past, two hours future) and the alarm misbehavior they cause | [Section 5.1](#51-metrics) | A wrong time stamp is what drives an alarm into `INSUFFICIENT_DATA` | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| How to publish custom metrics with `PutMetricData`, statistic set aggregation, and publishing zero | [Section 5.4](#54-publishing-custom-metrics) | An arrow labeled "custom data" does not show how to publish it | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |
| CloudWatch's OpenTelemetry metric model | [Section 5.5](#55-opentelemetry-metrics) | It is the recommended model for new implementations and its data model differs | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| The four missing-data options and the `missing` default | [Section 6.3](#63-treating-missing-data) | Picking the wrong option for the metric's nature makes an alarm misbehave | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| M out of N evaluation, the evaluation range, and the premature-alarm logic | [Section 6.2](#62-the-real-evaluation-is-m-out-of-n) | The "three consecutive" reading diverges from the real evaluation behavior | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| Composite alarms, PromQL alarms, and log alarms | [Section 6.4](#64-kinds-of-alarm) | Knowing only single-metric alarms cannot design noise reduction or log-based alarms | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |
| That the default log retention is indefinite, and the 72-hour deletion delay | [Section 7.3](#73-retention-and-log-classes) | It is the most common cost leak in a lab account when left alone | [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) |
| CloudWatch Logs Insights in full (three query languages, field indexes, limits, scan-volume charging) | [Section 7.4](#74-cloudwatch-logs-insights) | Without querying and analyzing logs, one pillar of observability is empty | [Analyzing log data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html) |
| The embedded metric format (EMF) and its cardinality trap | [Section 7.5](#75-turning-logs-into-metrics-emf) | It turns structured logs into metrics, and the trap is what prevents a bill explosion | [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html) |
| Dashboards and cross-account observability | [Section 4.3](#43-dashboards-and-cross-account-observability) | Dashboards are a feature in their own right and crossing Region/account boundaries is needed | [Using Amazon CloudWatch dashboards](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html) |
| Lambda recursive loop detection (about 16 invocations, on by default, detection limits) | [Section 9.3](#93-lambda-now-stops-infinite-loops-for-you) | The "common fault pattern" now has a built-in defense | [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html) |
| Inferred segments and which side's information the edge uses | [Section 11.2](#112-inferred-segments) | The explanation of how the DynamoDB node on the trace map appears is missing | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |
| X-Ray sampling in full (reservoir and rate, the parent-based property, where rules live) | [Section 11.4](#114-sampling) | It governs tracing cost and overhead yet is missing entirely | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |
| The tracing header structure and defending against forgery | [Section 11.5](#115-the-tracing-header) | It is how the sampling decision propagates and a security point against user forgery | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |
| How to actually turn tracing on (console path, the SAM `Tracing` property, required permissions) | [Section 12.1](#121-the-settings-that-turn-tracing-on) | Instrumented code alone produces no traces | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| The OpenTelemetry transition (concept mapping, the three paths, sampling strategies, annotation handling) | [Section 12.3](#123-the-move-to-opentelemetry) | The X-Ray SDK became discouraged, so the migration path has to be known | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| CloudWatch Application Signals and Transaction Search | [Section 10.6](#106-observability-capabilities-that-grew-into-cloudwatch) | The current capabilities that match the "modern development" objective sit outside the tool list | [Application Signals](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Monitoring-Sections.html) |
| The 64 kB segment document limit and 30-day retention for traces and service graphs | [Section 11.1](#111-trace-segment-subsegment) and [Section 10.3](#103-the-trace-map) | The size and retention limits of trace data affect design | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |
| What to check when no traces appear in the lab | [Section 12.7](#127-lab-7) | It gives an ordered way to diagnose the "no traces" lab situation | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |

### 13.5 Items We Could Not Verify

What we could not confirm in documentation is written down as unconfirmed. We do not assert it.

| Item | Why we could not verify it |
|---|---|
| The courseware's "knowledge cycle" diagram (people → data → information → knowledge → insight → action) | We could not find the same diagram in AWS official documentation. It appears to be specific to the courseware. This document only relays it ([Section 2.3](#23-the-observability-plan)) |
| The definitions of MTTD, MTTI, MTBF and the formula `Availability = MTBF / (MTBF + MTTR)` | We could not confirm these definitions and this formula in AWS official documentation. Only MTTR was confirmed as used, in the Application Insights documentation ([Section 11.7](#117-operational-metric-acronyms)) |
| The replacement interface name for `IHostingEnvironment` | It belongs to ASP.NET Core documentation, which is not an AWS-owned domain, so this project's sourcing rules do not allow citing it. We recorded only that the name is older ([Section 12.5](#125-the-c-example)) |
| X-Ray instrumentation with AWS SDK for Java 2.x | The `AmazonDynamoDBClientBuilder` covered above is a 1.x API. We did not verify the 2.x equivalent within this verification pass. Use the OpenTelemetry path for new applications ([Section 12.4](#124-per-language-x-ray-sdk-configuration)) |
| The current maintenance status of the `AWS.Logger.*` NuGet packages the courseware lists | The package registry is not an AWS-owned domain and cannot be cited, and we could not find this list in AWS official documentation. We relayed the courseware's list ([Section 7.6](#76-net-packages-for-shipping-application-logs)) |
| The full list of application types CloudWatch Application Insights supports | The overview documentation confirms SQL Server backends, IIS / web tiers, and the existence of SAP (ASE, HANA, NetWeaver) tutorials, but not the full list ([Section 9.1](#91-what-it-does)) |
| Whether HTTP APIs (API Gateway v2) support X-Ray | The documentation we verified covers **REST APIs**. We could not confirm support for HTTP APIs, so this document describes only the REST API scope ([Section 12.1](#121-the-settings-that-turn-tracing-on)) |
