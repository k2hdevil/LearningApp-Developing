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
14. [Knowledge Check and Summary](#14-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against AWS official documentation.
> - 🔄 Content where the original instructor deck differs from current fact and has been corrected. What changed and how is recorded in [Chapter 13](#13-changes-from-the-courseware).
> - Verified on: August 25, 2026. Documentation may be updated after this date, so check the linked original before applying anything to an exam or to production.
> - **This module has changed more since the courseware than any other.** The X-Ray SDKs and daemon entered maintenance mode on February 25, 2026, the X-Ray console is no longer being developed, and the service map has been folded into the trace map in the CloudWatch console. Following the deck's instrumentation code teaches a path that is no longer recommended ([Section 13.3](#133-discouraged-and-end-of-support-items)).
> - Terminology is used consistently. We write **observability**, **metric**, **dimension**, **alarm**, **trace**, **segment**, **subsegment**, **sampling**, and **span**. Where the courseware calls the same thing by different names, that is recorded in [Section 13.1](#131-items-where-the-courseware-differs-from-fact).
> - **The deck's CLI example and C# example contain errors that make them unusable as printed, so they are corrected here.** What was corrected is listed in the correction table in each section.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following.

- Differentiate between monitoring and observability
- Evaluate why observability is needed for modern development and its key components
- Understand the role of Amazon CloudWatch in an observability configuration
- Describe application monitoring with CloudWatch Application Insights
- Describe application debugging with AWS X-Ray

Slide 3 (Module objectives) and slide 42 (Module summary) carry the same five items with
different spacing in the first one. This document follows slide 3
([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

### What the Deck Does Not Cover

The second objective says "**modern** development", yet the deck names only two tools,
CloudWatch and X-Ray, and covers a narrow slice of each. Questions that always come up in class
have no answer in the deck.

| Missing from the deck | Why it matters | Where this document covers it |
|---|---|---|
| How to **query and analyze** logs | The deck stops at shipping logs to CloudWatch. Collecting logs you cannot read is not observability | [Section 7.4](#74-cloudwatch-logs-insights) |
| Log **retention** | It says log groups "share the same retention" but never states the default. The default is indefinite, so an unattended log group bills forever | [Section 7.3](#73-retention-and-log-classes) |
| X-Ray **sampling** | This governs tracing cost and overhead, and the deck does not mention it once | [Section 11.4](#114-sampling) |
| The **settings** that turn tracing on | The deck shows only SDK code and never covers enabling tracing on Lambda or API Gateway | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| How to **publish** custom metrics | Slide 12 shows "custom data" as an arrow but never mentions `PutMetricData` | [Section 5.4](#54-publishing-custom-metrics) |
| **Dashboards** | Slide 20's notes mention "automatically creates CloudWatch dashboards" and that is all | [Section 4.3](#43-dashboards-and-cross-account-observability) |
| The **currently recommended** instrumentation | The deck presents the X-Ray SDK as the only path. OpenTelemetry is the recommended path now | [Section 12.3](#123-the-move-to-opentelemetry) |

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

This is the one sentence the courseware stresses most in this module.

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

Collect → Monitor → Analyze → Act is the order the instructor notes narrate. The layout on the
slide itself swaps Act and Analyze.

### 2.3 The Observability Plan

The courseware lists four elements to include in a plan. Slides 6 and 7 repeat the same body
text, so they are merged into one section here
([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

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

> **Caution.** This "knowledge cycle" diagram is specific to the courseware. We could not find
> the same diagram in AWS official documentation, so this document relays the courseware content
> and does not present it as though it came from official documentation
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

> **Internal inconsistency in the courseware.** Slides 8 and 9 give the three pillars as
> `logging / metrics / tracing`, while the same diagram on slide 25 (What is AWS X-Ray?) gives
> `logging / monitoring / tracing`. The answer explanation for knowledge check question 2 on
> slide 38 states "metrics, traces, and logs", so slide 25 is the one that is wrong
> ([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

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

The courseware's one-line definition is **"CloudWatch is a repository of data points."** It
receives and stores metrics, then computes statistics from what it stored and hands them to
consumers.

| Part | Content |
|---|---|
| Producers | AWS resources that use CloudWatch, plus custom data |
| Storage | The metric repository |
| Consumers | AWS Management Console (graphs), CloudWatch alarms → Auto Scaling and SNS email notification |

AWS services such as Amazon EC2 store metrics in the repository, and you retrieve statistics
based on those metrics. Store custom metrics and you retrieve statistics about them the same way.

### 4.2 What an Alarm Can Do 🔄

The courseware lists the targets as stopping, starting, and terminating EC2 instances, EC2 Auto
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
hardware after a hardware failure. That is not what the courseware means by "start".

> — Source: [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html)

### 4.3 Dashboards and Cross-Account Observability 🆕

The courseware mentions dashboards once, in the context of Application Insights creating them
automatically, and moves on. Dashboards are a feature in their own right.

| Feature | Content |
|---|---|
| Automatic dashboards | CloudWatch ships pre-built dashboards |
| Custom dashboards | Create them from the console, the AWS CLI, or the `PutDashboard` API |
| Multiple Regions | View resources spread across different Regions in a single view |
| Permissions needed | `cloudwatch:GetDashboard` and `ListDashboards` to view, `PutDashboard` to create or modify, `DeleteDashboards` to delete |

The courseware stops at "metrics exist only in the Region in which they are created". There is a
way past that constraint.

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

Not in the deck, and the first thing you hit in practice. Metric retention **varies by period.**

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
each namespace. The courseware uses the example of DynamoDB metrics split into `Table Metrics`
and `GlobalSecondaryIndex`.

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

Slide 12 shows "custom data" as an arrow, but the deck never covers how to publish it.

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
traditional CloudWatch metrics.** The courseware does not cover this model.

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

### 6.1 The Courseware's Alarm Scenario

The courseware illustrates an alarm with a threshold of 3 and a minimum of 3 breaching periods.

| Period | Value | State |
|---|---|---|
| 1–2 | Within threshold | `OK` |
| 3–5 | Three consecutive periods breaching | `ALARM` — action invoked |
| 6 | Falls back below threshold | `OK` |
| 9 | Breaches again but only one period | Stays `OK` |

In the slide's own labels: "Only one period exceeded the threshold. The action is not invoked."
and "Three periods exceeded the threshold, so the action was invoked."

### 6.2 The Real Evaluation Is M out of N 🔄

The courseware only says "three **consecutive** periods". The real behavior is more flexible, and
missing this difference leads to badly designed alarms.

| Parameter | Meaning |
|---|---|
| Evaluation Periods (N) | The number of periods over which data is compared to the threshold |
| Datapoints to Alarm (M) | The number of data points that must be breaching to trigger the alarm |

When M is smaller than N you get an **"M out of N" alarm**, and the alarm fires even when the
breaches are not consecutive. The courseware's scenario is just the special case where M and N are
both 3.

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

**The default behavior is `missing`.** The courseware's CLI example spells out
`--treat-missing-data missing`, which is the default, so omitting it changes nothing.

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

The courseware says an alarm watches "a **single metric** over a specified period" (slide 13 and
knowledge check question 5 on slide 38). There are now four kinds.

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

> **The courseware's reference link is broken.** Slide 15's instructor notes give
> `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html`, but the current path is
> `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html`
> ([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

### 6.5 Creating an Alarm from the CLI 🔄

The `put-metric-alarm` example on slides 17–19 **cannot be run as printed.** This document gives a
corrected command and records what was corrected below.

First, the command as the courseware prints it (verbatim, do not run this).

```text
>> aws cloudwatch put-metric-alarm --alarm-name NotesWriteCapacityUnitsLimit
   --metric-name ConsumedReadCapacityUnits --namespace AWS/DynamoDB --statistic Sum
   --period 60 --treat-missing-data missing --datapoints-to-alarm 5
   --alarm-actions arn:aws:cloudwatch:us-east-2:111122223333:alarm:Notes-WriteCapacityUnitsLimit-BasicAlarm
--dimensions "Name=InstanceId,Value=i-12345678"
```

| # | Courseware | Verified |
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

**Both structured and unstructured logs are supported.** Here are the courseware's examples.

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

> **Terminology correction.** Slide 16 lists log4net, Log4j, NLog, and Serilog as "supported
> logging **protocols**". These are logging frameworks and libraries, not protocols
> ([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

### 7.3 Retention and Log Classes 🆕

The courseware only says log groups "share the same retention" and never states the default. **The
default is indefinite (Never Expire).** Left alone, logs accumulate and keep billing. It is the
most common cost leak in a lab account.

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

**This is the biggest gap in the deck.** The courseware stops at shipping logs to CloudWatch and
never covers a single way to query or analyze what it collected. Not being able to read your logs
leaves one of the three pillars empty.

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

The courseware shows a structured JSON log example but never covers **how to turn that log into a
metric.** The CloudWatch **embedded metric format (EMF)** does that job.

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

These are the NuGet packages from slide 16's instructor notes. They batch queued logging messages
and send them to CloudWatch Logs on a background thread.

| Package | Purpose |
|---|---|
| `AWSSDK.CloudWatchLogs` | CloudWatch Logs SDK |
| `AWS.Logger.Core` | Shared core |
| `AWS.Logger.NLog` | NLog integration |
| `AWS.Logger.Log4net` | log4net integration |
| `AWS.Logger.SeriLog` | Serilog integration |
| `AWS.Logger.AspNetCore` | ASP.NET Core integration |
| `Amazon.Lambda.Logging.AspNetCore` | For Lambda |

> **Do not use background-thread logging in Lambda.** The courseware's warning has a documented
> basis. Lambda **freezes** the execution environment when the runtime and each extension have
> completed and there are no pending events. The background thread freezes with it, so queued logs
> are not delivered. If no further event arrives for a while, the freeze may not lift. The
> courseware recommends `ILambdaContext.Logger.LogLine` or `Amazon.Lambda.Logging.AspNetCore`.
>
> — Source: [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html)

### 7.7 Lambda Logging Is Now a Setting 🔄

The courseware treats structured logs as something the application has to produce itself. Now you
can set the format and level **in the function configuration.**

| Setting | Values |
|---|---|
| Log format | Plain text or **structured JSON** |
| Log level | For JSON structured logs: `FATAL`, `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` |
| Log group | Choose the CloudWatch log group the function sends logs to |

**The destinations grew too.** The courseware assumes CloudWatch Logs alone.

| Destination | When to use it |
|---|---|
| CloudWatch Logs (default) | Real-time viewing, processing, and alerting. Logs Insights and Live Tail integrate natively |
| Amazon S3 | The most economical option for long-term storage. Analyze with tools like Athena. Latency is typically higher |
| Firehose | Simplifies streaming to OpenSearch Service, the Redshift Data API, or third-party platforms such as Datadog, New Relic, and Splunk via pre-built integrations. Also streams to custom HTTP endpoints |

Firehose costs include both the streaming service and the cost of whatever you stream to.

> — Source: [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html)

---

## 8. Instrumenting Your Application

Slides 17, 18, and 19 split the same content across three animated slides and carry no instructor
notes. They are merged into one section here
([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

### 8.1 Instrumentation Paths

| Path | Target |
|---|---|
| SDK | Called directly from application code |
| CloudWatch agent | Installed on servers and containers |
| AWS CLI | Called from a terminal or a script |

The courseware lists nine SDKs: Python (Boto3), .NET, Ruby, JavaScript, Go, Java, Node.js, C++,
and PHP.

### 8.2 The CloudWatch Agent 🔄

The courseware lists the agent's targets as Amazon EC2 and on-premises servers and limits its
purpose to metrics and logs. The scope is broader now.

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

### 9.2 The List of Common Problems Differs from the Courseware 🔄

Slide 21 lists four items as common fault patterns with no explanation.

| What the courseware lists |
|---|
| Infinite loop |
| Downstream slowdown |
| Wrong API version |
| Trigger verification |

The problems the documentation names as ones it provides "additional insights that point to a
possible root cause and steps for resolution" for are the following. **They do not overlap with the
courseware's list.**

| Verified item | Stack |
|---|---|
| Application latency | .NET and SQL |
| SQL Server failed backups | SQL |
| Memory leaks | .NET |
| Large HTTP requests | .NET |
| Canceled I/O operations | .NET |

> — Source: [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html)

### 9.3 Lambda Now Stops Infinite Loops for You 🆕

The diagram on slide 21 draws an S3 bucket triggering an image-resize Lambda that uploads a log
back into the same bucket, triggering itself again. The courseware presents this as a "common fault
pattern" and does not cover any defense. **Lambda has a built-in defense now.**

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

From slide 23's demo notes.

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

The use cases the courseware lists.

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

The path the courseware draws is `client → X-Ray daemon → X-Ray API → X-Ray console`, with the
`AWS CLI` and `SDK` also feeding the API. Here is what the documentation adds.

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

The courseware consistently calls this diagram the **service map**. Current documentation uses
**trace map**. And it is not only the name that changed. **The location changed.**

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

The courseware gives four colors.

| Color | The courseware's label |
|---|---|
| Green | Successful calls |
| Red | Server failure (500 series errors) |
| Yellow | Client error (400 series errors) |
| Purple | Throttling error (429 too many requests) |

The X-Ray documentation's error classification is as follows. The courseware's color mapping matches
this classification.

| Category | Content |
|---|---|
| `Error` | Client errors (400 series) |
| `Fault` | Server faults (500 series) |
| `Throttle` | Throttling errors (429 Too Many Requests) |

When an exception occurs, the X-Ray SDK records details about it, including the stack trace.

> — Source: [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)

> **Typographical error.** Slide 30's instructor notes say "the ratio of successful calls to errors
> and **combinations**". In context this is a typo for **faults**
> ([Section 13.1](#131-items-where-the-courseware-differs-from-fact)).

### 10.5 The X-Ray Console Is No Longer Being Developed 🔄

This is the most important change in the module. The courseware presents the X-Ray console as the
place to look at traces, on slide 26 and slide 36.

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

The courseware's tool list is CloudWatch and X-Ray, full stop. Since module objective 2 speaks of
"modern development", here is what exists in this space as far as we verified.

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

The courseware uses a trace of `listFunction` to show the structure.

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

The courseware's diagram has a DynamoDB `Notes table` node. But **DynamoDB does not send its own
segments.** The courseware never explains where that node comes from.

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

The courseware's examples.

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

**X-Ray indexes up to 50 annotations per trace.** The courseware's figure is still correct.

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

**Not one line in the deck, yet it governs tracing cost and overhead.**

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

Slide 27 writes the Lambda cold start as `code-start container download → runtime bootstrap → run
code`. `code-start` is a **typo for cold start**, and the phase breakdown also differs from the
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
the courseware's three steps.

| Phase | Content |
|---|---|
| `Init` | Three tasks: start all extensions (`Extension init`), bootstrap the runtime (`Runtime init`), and run the function's static code (`Function init`) |
| `Invoke` | Invoke the function handler |
| `Shutdown` | Cleanup |

The `Init` phase is **limited to 10 seconds**. If all three tasks do not complete within 10 seconds,
Lambda retries the `Init` phase at the time of the first function invocation with the configured
function timeout. The 10-second limit does not apply to functions using provisioned concurrency,
SnapStart, or Lambda Managed Instances.

**The courseware's "container download" is not among the three tasks of the `Init` phase.**
Downloading function code and layers is part of the execution environment preparation covered by the
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

Slide 29 has no body text and introduces the following only in the instructor notes.

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

Slides 33 and 34 show only SDK code and never cover **the settings that enable tracing on Lambda and
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

The courseware does not cover tracing modes, so this change is invisible from the deck. **It is the
single most common reason traces do not appear in the lab.**

| When | Behavior |
|---|---|
| Previously | Lambda **sent traces automatically** when an upstream service such as Amazon API Gateway added a tracing header |
| Now | It does **not.** Control was handed to you so you trace the functions that matter to you |

If your solution depends on this passive tracing behavior, switch to `Active` tracing.

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

### 12.3 The Move to OpenTelemetry 🔄

**This is the largest change in the module.** Slides 33 and 34 present only instrumentation with the
X-Ray SDK. That path is no longer recommended.

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

### 12.4 The Courseware's Per-Language X-Ray SDK Configuration

Here is what slide 33 gives. **Read the maintenance-mode notice in Section 12.3 first.** This is
still needed to understand existing code.

| Language | Courseware content |
|---|---|
| .NET | Before creating clients, call `AWSSDKHandler.RegisterXRayForAllServices()` to configure all AWS SDK for .NET clients. To target a specific service, `AWSSDKHandler.RegisterXRay<IAmazonDynamoDB>()` |
| Java | Configure the DynamoDB client and pass the Trace Handler to `AmazonDynamoDBClientBuilder` |
| Python | The X-Ray SDK for Python has a class named `xray_recorder` that provides the global recorder |

> **A caution on the Java item.** The `AmazonDynamoDBClientBuilder` the courseware names is an
> **AWS SDK for Java 1.x** API. As covered in other modules, AWS SDK for Java 1.x has reached end of
> support. We could not verify the equivalent X-Ray instrumentation approach in 2.x, so this document
> does not assert one ([Section 13.5](#135-items-we-could-not-verify)). For new applications, use the
> OpenTelemetry path in Section 12.3.

### 12.5 The Courseware's C# Example 🔄

The code on slide 34 contains a part that **will not compile.** It is corrected here with the
corrections recorded.

| # | Courseware | Verified |
|---|---|---|
| 1 | `await` used inside `public void RunSqlQuery(...)` | You cannot use `await` in a `void` method. It has to be declared `async Task` to compile |
| 2 | `IHostingEnvironment env` | An older interface name. The replacement belongs to ASP.NET Core documentation and cannot be confirmed within AWS official documentation, so we do not assert it ([Section 13.5](#135-items-we-could-not-verify)) |

Here is the corrected code. The `env` parameter is in the courseware original and unused in the body,
so it is left as is.

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

The labels on the slide indicating which part of the code each one points to.

| Label | Corresponding code |
|---|---|
| Capture AWS service calls | `AWSSDKHandler.RegisterXRayForAllServices();` |
| Capture incoming API calls | `app.UseXRay("SampleApp");` |
| Capture SQL queries | `TraceableSqlCommand` |

### 12.6 What the Demo Shows

From slide 36's demo notes.

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

The title is "Observing Your Application with AWS X-Ray". Slide 40 carries only the same application
architecture diagram as the agenda, with no body text and no instructor notes.

If no traces appear in the lab, check in this order. The deck has no such checklist.

| Order | What to check | Reference |
|---|---|---|
| 1 | Is the Lambda function's `Tracing` set to `Active` | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 2 | Does the execution role have `xray:PutTraceSegments` and `xray:PutTelemetryRecords` | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 3 | Is tracing enabled on the API Gateway **stage** | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| 4 | Was it filtered out by sampling (the default is 1 per second plus 5%) | [Section 11.4](#114-sampling) |
| 5 | Are you looking at the Trace Map in the CloudWatch console rather than the X-Ray console | [Section 10.5](#105-the-x-ray-console-is-no-longer-being-developed) |

---

## 13. Changes from the Courseware

This chapter exists so that when a student has the courseware and this document side by side, you can
answer "but the book says this". There are 37 items in total: 21 courseware errors, 12 behavior or
name changes, 3 discouraged items, and 1 end-of-support item.

### 13.1 Items Where the Courseware Differs from Fact

#### Wrong reference target

| Courseware says | Verified | Source |
|---|---|---|
| Slide 15's notes give `/AmazonCloudWatch/latest/DeveloperGuide/AlarmThatSendsEmail.html` | The current path is `/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html`. The `DeveloperGuide` path is not valid | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |

#### Errors in the CLI example (slides 17, 18, 19)

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
| Slide 15 notes: "the alarm invokes the action only when the threshold has been breached for **three consecutive periods**" | The real behavior is M out of N. When M is smaller than N the alarm fires even without consecutive breaches. The evaluation range is also wider than N, so when data is missing older data points are pulled in | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| Slide 13 and knowledge check question 5 on slide 38: "an alarm watches a **single metric** over a specified period" | A metric alarm watches a single metric **or the result of a metric math expression**. Beyond that there are PromQL alarms, log alarms, and composite alarms over other alarms' states | [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) |
| Slide 16: "supported logging **protocols** — Apache log4net, Apache Log4j, Nlog, Serilog" | These are logging frameworks and libraries, not protocols. What the documentation names as ways to send logs are the CloudWatch agent, the `put-log-events` CLI command, and the `PutLogEvents` API | [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html) |
| Slide 21: common fault patterns given as "infinite loop / downstream slowdown / wrong API version / trigger verification" | The Application Insights documentation's list is application latency, SQL Server failed backups, memory leaks, large HTTP requests, and canceled I/O operations in .NET and SQL stacks. It does not overlap with the courseware's list | [Detect common application problems with CloudWatch Application Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch-application-insights.html) |

#### Typographical errors

| Courseware says | Verified | Source |
|---|---|---|
| Slide 27 diagram: `code-start container download` | A typo for `cold start`. The three tasks of the `Init` phase are starting extensions, bootstrapping the runtime, and running the function's static code; code and layer download is covered by the `AWS::Lambda` segment | [Understanding the Lambda execution environment lifecycle](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) |
| Slide 30 notes: "the ratio of successful calls to errors and **combinations**" | In context this is a typo for **faults**. X-Ray classifies errors as `Error` (400), `Fault` (500), and `Throttle` (429) | [AWS X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html) |

#### Places where the courseware contradicts itself

These are not disagreements with external documentation but **internal contradictions in the
courseware**, so they carry no 🆕 or 🔄 marker.

| Where it conflicts | Content | How this document handles it |
|---|---|---|
| The three pillars | Slides 8 and 9 say `logging / metrics / tracing`, slide 25 says `logging / monitoring / tracing`. The answer explanation for knowledge check question 2 on slide 38 states "metrics, traces, and logs" | Treats slide 25 as the wrong one and standardizes on `metrics / logs / traces` |
| CloudWatch's role | Slide 11's notes list "metrics collection and **tracing**" as CloudWatch capabilities, while slide 9 assigns tracing to X-Ray | Notes that the two slides disagree and lays out the actual structure (X-Ray traces viewed in the CloudWatch console) in [Section 10.5](#105-the-x-ray-console-is-no-longer-being-developed) |
| Module objective wording | Slide 3 has no space in the first item, slide 42 has one | Standardizes on slide 3 |
| Slides 6 and 7 | Identical body text with the diagram built up in stages, yet each set of notes contains a sentence the other lacks | Merged into [Section 2.3](#23-the-observability-plan) with both notes reflected |
| Slides 17, 18, 19 | Body text and terminal example identical. None of the three has instructor notes | Merged into [Chapter 8](#8-instrumenting-your-application) |
| Slide 29 notes | Repeats slide 27's trace ID and trace definition verbatim before introducing the operational acronyms | Keeps only the unique content (the acronyms and the availability formula) in [Section 11.7](#117-operational-metric-acronyms) |
| Slide 34 code | `await` used inside `public void RunSqlQuery(...)`. You cannot use `await` in a `void` method | Corrected to `async Task` and recorded in [Section 12.5](#125-the-coursewares-c-example) |
| Slide 34 code | `IHostingEnvironment` is an older interface name | States only that it is an older name and does not assert the replacement ([Section 13.5](#135-items-we-could-not-verify)) |

### 13.2 Items Whose Behavior or Defaults Changed

| Item | Courseware says | Verified | Source |
|---|---|---|---|
| Where the X-Ray console sits | Slides 26 and 36 present the X-Ray console as the place to look at traces | **AWS is no longer developing the X-Ray console.** The CloudWatch console has redesigned X-Ray functionality and contains all of the X-Ray console's functionality | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| Service map → trace map | Slides 26, 30, 31, and 36 say "service map" | The X-Ray service map and the CloudWatch ServiceLens map have been combined into the **X-Ray trace map** in the CloudWatch console | [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html) |
| The name CloudWatch Events | Slide 20 notes: "creates CloudWatch Events to notify you of future events" | EventBridge was formerly called CloudWatch Events. The API is the same and existing rules still appear, but **new features added to EventBridge are not added to CloudWatch Events** | [EventBridge is the evolution of Amazon CloudWatch Events](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) |
| Lambda sending traces automatically | Tracing modes are not covered, so API Gateway → Lambda traces are assumed to be collected naturally | Previously Lambda sent traces automatically when an upstream added a tracing header. **It does not now, and `Active` tracing has to be turned on explicitly.** Without it the default is `PassThrough` | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| Lambda X-Ray segment structure | Slide 27 draws an `initialization / invocation` subsegment structure | The old format had `Initialization`, `Invocation`, and `Overhead`. The new format has no `Invocation` segment; only `Init` remains and customer subsegments attach to the function segment. AWS is mid-transition, so both formats may appear in one account | [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html) |
| The CloudWatch agent's scope | Slides 17–19 limit the targets to EC2 and on-premises servers and the purpose to metrics and logs | The agent collects metrics, logs, and **traces** from EC2, on-premises servers, and **containerized applications**. Version 1.300025.0 and later sends traces to X-Ray so a separate daemon is not needed | [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html) |
| The CloudWatch metric model | Slides 13 and 14 explain only namespaces and dimensions | CloudWatch supports OpenTelemetry metrics sent over OTLP. They use metric names and labels (up to 150), are queried with PromQL, and are handled in Query Studio | [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html) |
| Recommended way to publish custom metrics | Slide 12 shows "custom data" as an arrow only | **For new implementations, OpenTelemetry is recommended** | [Publish custom metrics (PutMetricData / EMF)](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html) |
| Lambda log destinations | Slide 16 assumes CloudWatch Logs alone | CloudWatch Logs is the default and you can configure Amazon S3 or Firehose as destinations | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| Lambda log format | Slide 16 presents structured logs as something the application produces itself | Advanced logging controls set the log format (text or JSON), the log level (`FATAL` through `TRACE`), and the destination log group **in the function configuration** | [Working with Lambda function logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-logs.html) |
| The nature of a log group | Slide 13's notes describe it only as the unit that shares retention, monitoring, and access control settings | There are two log group classes, Standard and Infrequent Access, and you can also enable deletion protection | [Amazon CloudWatch Logs concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html) |
| Alarm evaluation window | Slide 15 explains only via a fixed-boundary diagram | You can choose a sliding window (default) or a wall clock window. The wall clock window aligns to fixed boundaries and does not query additional older data | [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html) |
| Alarm action targets | Slide 12's notes give stopping, **starting**, and terminating EC2, EC2 Auto Scaling, and SNS | The current list is EC2 actions (stop, terminate, reboot, recover), Auto Scaling policies, **Lambda functions**, SNS topics, Systems Manager OpsItem and response plans, and **Amazon Q Developer investigations**. "Starting" is not among the EC2 actions | [PutMetricAlarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html) |

### 13.3 Discouraged and End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| **General availability of the X-Ray SDKs and daemon** | **Ended** — GA ended on February 25, 2026 and maintenance mode began the same day. Only security-fix releases are provided and there are no new feature enhancements. No end-of-support date has been announced, so they have not stopped working | OpenTelemetry-based instrumentation (ADOT or CloudWatch Application Signals) | [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html) |
| The **X-Ray SDK** as an instrumentation method | Discouraged — X-Ray is transitioning its primary instrumentation standard to OpenTelemetry, and AWS recommends adopting OpenTelemetry | AWS Distro for OpenTelemetry, CloudWatch Application Signals, CloudWatch OTel endpoint | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| The **X-Ray daemon** | Discouraged — it follows the same maintenance timeline as the SDKs and the documentation guides migration | The CloudWatch agent or the OpenTelemetry Collector | [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html) |
| **Local JSON sampling rules** shipped with your code | Discouraged — each instance samples independently so the overall rate rises, and changing a rule requires a redeploy | Sampling rules defined in the X-Ray service (CloudWatch console → Settings → X-Ray traces → Sampling rules) | [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html) |

> **This table is the most important thing in the module.** Slides 26, 33, and 34 present the X-Ray
> SDK and daemon as the only instrumentation path. Following it verbatim teaches a method that is no
> longer recommended. You still need it to read existing code, but for anything new use the
> OpenTelemetry path in [Section 12.3](#123-the-move-to-opentelemetry).

> — Source: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

> — Source: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

> — Source: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 13.4 Items Added Since the Courseware

Items absent from the courseware that this document filled in from official documentation.

| Item | Where in this document |
|---|---|
| That metric retention varies by period and older data is aggregated so the original resolution disappears | [Section 5.2](#52-retention-and-resolution) |
| Metric time stamp constraints (two weeks past, two hours future) and the alarm misbehavior they cause | [Section 5.1](#51-metrics) |
| How to publish custom metrics with `PutMetricData`, statistic set aggregation, and publishing zero | [Section 5.4](#54-publishing-custom-metrics) |
| CloudWatch's OpenTelemetry metric model | [Section 5.5](#55-opentelemetry-metrics) |
| The four missing-data options and the `missing` default | [Section 6.3](#63-treating-missing-data) |
| M out of N evaluation, the evaluation range, and the premature-alarm logic | [Section 6.2](#62-the-real-evaluation-is-m-out-of-n) |
| Composite alarms, PromQL alarms, and log alarms | [Section 6.4](#64-kinds-of-alarm) |
| That the default log retention is indefinite, and the 72-hour deletion delay | [Section 7.3](#73-retention-and-log-classes) |
| CloudWatch Logs Insights in full (three query languages, field indexes, limits, scan-volume charging) | [Section 7.4](#74-cloudwatch-logs-insights) |
| The embedded metric format (EMF) and its cardinality trap | [Section 7.5](#75-turning-logs-into-metrics-emf) |
| Dashboards and cross-account observability | [Section 4.3](#43-dashboards-and-cross-account-observability) |
| Lambda recursive loop detection (about 16 invocations, on by default, detection limits) | [Section 9.3](#93-lambda-now-stops-infinite-loops-for-you) |
| Inferred segments and which side's information the edge uses | [Section 11.2](#112-inferred-segments) |
| X-Ray sampling in full (reservoir and rate, the parent-based property, where rules live) | [Section 11.4](#114-sampling) |
| The tracing header structure and defending against forgery | [Section 11.5](#115-the-tracing-header) |
| How to actually turn tracing on (console path, the SAM `Tracing` property, required permissions) | [Section 12.1](#121-the-settings-that-turn-tracing-on) |
| The OpenTelemetry transition (concept mapping, the three paths, sampling strategies, annotation handling) | [Section 12.3](#123-the-move-to-opentelemetry) |
| CloudWatch Application Signals and Transaction Search | [Section 10.6](#106-observability-capabilities-that-grew-into-cloudwatch) |
| The 64 kB segment document limit and 30-day retention for traces and service graphs | [Section 11.1](#111-trace-segment-subsegment) and [Section 10.3](#103-the-trace-map) |
| What to check when no traces appear in the lab | [Section 12.7](#127-lab-7) |

### 13.5 Items We Could Not Verify

What we could not confirm in documentation is written down as unconfirmed. We do not assert it.

| Item | Why we could not verify it |
|---|---|
| The courseware's "knowledge cycle" diagram (people → data → information → knowledge → insight → action) | We could not find the same diagram in AWS official documentation. It appears to be specific to the courseware. This document only relays it ([Section 2.3](#23-the-observability-plan)) |
| The definitions of MTTD, MTTI, MTBF and the formula `Availability = MTBF / (MTBF + MTTR)` | We could not confirm these definitions and this formula in AWS official documentation. Only MTTR was confirmed as used, in the Application Insights documentation ([Section 11.7](#117-operational-metric-acronyms)) |
| The replacement interface name for `IHostingEnvironment` | It belongs to ASP.NET Core documentation, which is not an AWS-owned domain, so this project's sourcing rules do not allow citing it. We recorded only that the name is older ([Section 12.5](#125-the-coursewares-c-example)) |
| X-Ray instrumentation with AWS SDK for Java 2.x | The `AmazonDynamoDBClientBuilder` the courseware names is a 1.x API. We did not verify the 2.x equivalent within this verification pass. Use the OpenTelemetry path for new applications ([Section 12.4](#124-the-coursewares-per-language-x-ray-sdk-configuration)) |
| The current maintenance status of the `AWS.Logger.*` NuGet packages the courseware lists | The package registry is not an AWS-owned domain and cannot be cited, and we could not find this list in AWS official documentation. We relayed the courseware's list ([Section 7.6](#76-net-packages-for-shipping-application-logs)) |
| The full list of application types CloudWatch Application Insights supports | The overview documentation confirms SQL Server backends, IIS / web tiers, and the existence of SAP (ASE, HANA, NetWeaver) tutorials, but not the full list ([Section 9.1](#91-what-it-does)) |
| Whether HTTP APIs (API Gateway v2) support X-Ray | The documentation we verified covers **REST APIs**. We could not confirm support for HTTP APIs, so this document describes only the REST API scope ([Section 12.1](#121-the-settings-that-turn-tracing-on)) |

---

## 14. Knowledge Check and Summary

### 14.1 Courseware Questions

These are the questions from slide 38, unchanged. Answer true or false.

| # | Question |
|---|---|
| 1 | Use CloudWatch Logs to centralize the logs from all your systems, applications, and AWS services |
| 2 | The three pillars of observability are logs, traces, and availability |
| 3 | A trace displays only a single subsegment generated by a request |
| 4 | A trace is numerical data used to analyze the overall performance and behavior of a system |
| 5 | An alarm watches a single metric over a specified period and performs one or more specified actions based on the value of the metric relative to a threshold over time |
| 6 | Subsegments provide more granular timing information and details about downstream calls that your application made to fulfill the original request |

Answers and explanations.

| # | Answer | Explanation |
|---|---|---|
| 1 | **True** | — |
| 2 | **False** | The three pillars are **metrics, traces, and logs**. Availability is not one of them |
| 3 | **False** | A trace collects **all the segments** generated by a single request |
| 4 | **False** | Numerical data is a **metric**, not a trace |
| 5 | **True** (but only partly, now) | True for metric alarms, but there are now alarms that watch metric math expression results, plus composite, PromQL, and log alarms ([Section 6.4](#64-kinds-of-alarm)) |
| 6 | **True** | — |

### 14.2 Supplementary Questions 🆕

Questions that check the updated content. These are not in the courseware.

**1. You added X-Ray SDK instrumentation to a Lambda function and deployed it, but no traces appear
at all. What do you check first?**

Whether the function's tracing mode is `Active`. If you have not turned it on the default is
`PassThrough`, and in that mode Lambda does not send traces automatically even when the tracing
header contains a decision to sample. It used to send them automatically when an upstream such as API
Gateway added the header, but it does not now.

> — Source: [Visualize Lambda function invocations using AWS X-Ray](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html)

**2. You are building a new application and want X-Ray tracing. Is using the X-Ray SDK
appropriate?**

No. The X-Ray SDKs and daemon have been in maintenance mode since February 25, 2026 and receive only
security-fix releases. X-Ray is transitioning its primary instrumentation standard to OpenTelemetry
and AWS recommends adopting it. Your options are AWS Distro for OpenTelemetry, CloudWatch Application
Signals, and the CloudWatch OTel endpoint.

> — Source: [X-Ray SDK and Daemon Support timeline](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-daemon-timeline.html)

> — Source: [Migrating from X-Ray instrumentation to OpenTelemetry instrumentation](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

**3. Following the courseware, you go looking for the service map in the X-Ray console. Where is it
now?**

In the CloudWatch console, under **Trace Map** beneath **X-Ray traces** in the left navigation pane.
The X-Ray service map and the CloudWatch ServiceLens map have been combined into the X-Ray trace map
in the CloudWatch console. The X-Ray console still works, but AWS is no longer developing it.

> — Source: [Use a console](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray-interface-console.html)

**4. How does an alarm with `Datapoints to Alarm` set to 2 and `Evaluation Periods` set to 3
behave?**

It is a "2 out of 3" alarm. If 2 of the most recent 3 periods are breaching it goes to `ALARM`, and
**the breaches do not have to be consecutive.** The "three consecutive periods" the courseware
describes is the special case where M and N are both 3.

> — Source: [Configuring how CloudWatch alarms treat missing data](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html)

**5. You created a log group in a lab account and configured nothing. When are the logs deleted?**

They are not. The default retention setting is **indefinite (Never Expire)**. You have to set a
retention period per log group. Even after you set one, deletion is not immediate and typically takes
up to 72 hours.

> — Source: [Working with log groups and log streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)

**6. You want to create a custom metric from a Lambda function. What is the difference between
calling `PutMetricData` directly and using EMF?**

EMF generates metrics **asynchronously** in the form of logs written to CloudWatch Logs, and
CloudWatch extracts them automatically. The only permission needed is `logs:PutLogEvents`;
`cloudwatch:PutMetricData` is not required. It lets you create metrics from ephemeral resources such
as Lambda and containers without maintaining separate instrumentation code, and you can query the
detailed logs associated with the extracted metrics through Logs Insights. But it creates one metric
per unique dimension combination, so a high-cardinality field like `requestId` must not go into a
dimension.

> — Source: [Embedding metrics within logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format.html)

**7. In a structure where Service A calls Service B, you set a strict sampling rule on Service B
only. What happens?**

It almost never applies. X-Ray sampling is **parent-based**, so the sampling decision is made once by
the root service (A) that first handles the request, and B honors A's decision even when its own rule
matches. To change the sampling for this workflow you have to put the rule on the **root service A**.

> — Source: [Configuring sampling rules](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

**8. You built a structure where a Lambda function triggered by an S3 event writes its result back
into the same bucket. Will an infinite loop keep running and accumulating charges?**

Lambda stops it. After roughly 16 invocations in the same chain of requests it automatically stops the
next invocation and notifies you. It is on by default for all customers, there is no charge, and X-Ray
active tracing does not need to be enabled. But detection covers only loops among Lambda, SQS, S3, and
SNS, and **it cannot detect a loop that includes another service such as DynamoDB.** That is why
CloudWatch alarms on concurrency and invocation spikes are recommended alongside it.

> — Source: [Use Lambda recursive loop detection to prevent infinite loops](https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html)

**9. You collect a metric with a 1-minute period. Can you view data from six months ago at 1-minute
resolution?**

No. Data points with a 1-minute period stay at that resolution for 15 days only. After that they are
aggregated to 5-minute resolution through 63 days, then to 1-hour resolution through 455 days (15
months). **The original resolution is not retained indefinitely.**

> — Source: [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

**10. The courseware describes the CloudWatch agent as collecting metrics and logs on EC2 and
on-premises servers. What else is there now?**

Containerized applications are also targets, and beyond metrics and logs it collects **traces**.
Version 1.300025.0 and later sends traces from OpenTelemetry or X-Ray client SDKs to X-Ray, so **a
separate trace collection daemon (the X-Ray daemon) is not needed.** It can also send metrics to
Amazon Managed Service for Prometheus.

> — Source: [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)

### 14.3 Summary

After completing this module you should be able to do the following.

- Differentiate between monitoring and observability
- Evaluate why observability is needed for modern development and its key components
- Understand the role of Amazon CloudWatch in an observability configuration
- Describe application monitoring with CloudWatch Application Insights
- Describe application debugging with AWS X-Ray

Compressed to one line each.

| Topic | Key point |
|---|---|
| Observability versus monitoring | Monitoring tells you a problem **exists**; observability tells you **why** |
| Three pillars | Metrics, logs, traces. CloudWatch metrics, CloudWatch Logs, and X-Ray own them respectively, but they now overlap |
| Metrics | Unique by name + namespace + dimensions (up to 30). Region-scoped, with retention that varies by period |
| Alarms | M out of N evaluation. The missing-data default is `missing`. The kinds are metric, PromQL, log, and composite |
| Logs | The log group is the unit of retention settings and **the default retention is indefinite**. Query with Logs Insights, convert to metrics with EMF |
| Traces | A trace collects segments, and a segment breaks down into subsegments. Annotations are indexed, metadata is not |
| Sampling | 1 per second plus 5% by default. Parent-based, so put the rule on the **root service** |
| Instrumentation | The X-Ray SDK is in maintenance mode. Use **OpenTelemetry** for anything new |
| Console | The X-Ray console is no longer developed. Use the **Trace Map in the CloudWatch console** |

One practical piece of advice to close on. **If you turned tracing on and see no traces, follow the
checklist in [Section 12.7](#127-lab-7).** It is where people get stuck most often in this module, and
three of the five causes have no explanation in the courseware.
