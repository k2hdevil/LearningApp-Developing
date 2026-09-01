# Module 7: Getting Started with Databases

## Developing on AWS

---

## Contents

1. [Module Overview](#1-module-overview)
2. [AWS Database Options](#2-aws-database-options)
3. [DynamoDB Core Concepts](#3-dynamodb-core-concepts)
4. [DynamoDB Access Options for Developers](#4-dynamodb-access-options-for-developers)
5. [Programming with DynamoDB](#5-programming-with-dynamodb)
6. [DynamoDB Dependencies](#6-dynamodb-dependencies)
7. [DynamoDB Service References](#7-dynamodb-service-references)
8. [Requests and Responses](#8-requests-and-responses)
9. [Changes from the Courseware](#9-changes-from-the-courseware)
10. [Knowledge Check and Summary](#10-knowledge-check-and-summary)

> **Notation**
>
> - 🆕 Content that is not in the original instructor deck. Verified against official AWS documentation.
> - 🔄 Content where the original instructor deck differs from current behavior and has been corrected. See [Section 9](#9-changes-from-the-courseware) for what changed and how.
> - Verified on: August 30, 2026. Documentation may change after this date, so check the linked sources before relying on this for exams or production work.

---

## 1. Module Overview

### Module Objectives

After completing this module, you should be able to do the following:

- Describe the core components of DynamoDB
- Explore the different ways to connect to DynamoDB
- Define the SDK dependencies and configuration in your code
- Use request and response objects

### Where This Module Sits

| Item | Content |
|---|---|
| **Module 7** | **Getting started with databases** — Compare AWS database options, learn DynamoDB core concepts, access methods, SDK dependencies, and requests and responses |
| Module 8 | Processing your database operations |
| Lab 3 | Developing a solution with Amazon DynamoDB |
| Module 9 | Processing your application logic |

The diagram on courseware slide 2 labels the scope of this module as AWS Cloud / Amazon DynamoDB / Notes table and global secondary index / Querying and accessing data.

### What Day 1 Covered

| Area | Related modules |
|---|---|
| The application | Modules 1–2 |
| Developer tools (IDE, SDKs, APIs) | Module 3 |
| Permissions | Module 4 |
| Storing and hosting the application | Modules 5–6 |

From this module on, the focus is the application's data tier. Application users read, add, update, and delete notes several times a day. DynamoDB provides a viable solution for storing those interactions.

---

## 2. AWS Database Options

### 2.1 Comparing AWS Database Services 🔄

The table on courseware slide 6 has four rows, and the table itself carries a footnote: "This table is not a complete list of AWS database services."

| Database type | Use cases | AWS services as listed in the courseware |
|---|---|---|
| Relational | Traditional applications, ERP, CRM, ecommerce | Amazon RDS, Amazon Redshift |
| Key-value | High-traffic web applications, ecommerce systems, gaming applications | Amazon DynamoDB |
| Graph | Data analytics, fraud detection, social networking, recommendation engines | Amazon Neptune |
| In-memory caching | Caching, session management, gaming leaderboards | Amazon ElastiCache |

The current AWS database decision guide presents **more than 15 database options** and classifies the data models as relational, key-value, document, in-memory, graph, time series, vector, and wide column. Three things differ from the courseware table.

| Category | Data model | Services |
|---|---|---|
| Relational (OLTP) | Relational | The Aurora family (Aurora PostgreSQL-Compatible Edition, Aurora MySQL-Compatible Edition, Aurora DSQL) plus 6 Amazon RDS engines (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, Db2) = **9 engines** |
| Non-relational | Key-value | Amazon DynamoDB |
| Non-relational | Document | Amazon DocumentDB (with MongoDB compatibility) |
| Non-relational | Caching / in-memory | Amazon ElastiCache, Amazon MemoryDB |
| Non-relational | Graph | Amazon Neptune |
| Non-relational | Time series | Amazon Timestream |
| Non-relational | Wide column | Amazon Keyspaces (for Apache Cassandra) |

- **Amazon Aurora is classified as its own family, not as one of the engines RDS supports.** The courseware instructor notes place Aurora in the RDS engine list.
- **Db2** has been added to the RDS engine list. It is not in the courseware.
- **Amazon Redshift is an OLAP (data warehousing) service** and is not included in this OLTP table. The courseware places Redshift in the relational row alongside RDS.
- Amazon MemoryDB, Aurora DSQL, Aurora PostgreSQL Limitless Database, and the vector data model are not in the courseware.

This decision guide was updated on June 2, 2026.

#### ElastiCache Supported Engines 🔄

| Item | Content |
|---|---|
| Courseware states | A fully managed in-memory data cache supporting the **Redis or Memcached** engines |
| Current | Supports three engines: **Valkey, Memcached, and Redis OSS**. Offers serverless and node-based deployment options |
| Performance | Optimized as an ephemeral cache with microsecond reads and sub-millisecond writes |
| Dividing line | If you need full data durability together with sub-millisecond reads, use **Amazon MemoryDB** |

> — Source: [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html)

### 2.2 Relational and Non-Relational Databases 🔄

The comparison table from courseware slide 7.

| Aspect | Relational | NoSQL (non-relational) |
|---|---|---|
| Data storage | Rows and columns | Key-value, document, wide column, graph |
| Schema | Fixed | Dynamic |
| Querying | Uses SQL | Focuses on collection of documents |
| Scalability | Vertical | Horizontal |
| Transactions | Supported | Support varies |
| Consistency | Strong | Eventual and strong |

| Characteristic | Relational | NoSQL (non-relational) |
|---|---|---|
| Data relationships | Tables related through primary key/foreign key relationships. Supports complex queries and joins | No fixed schema. Different records can have different attributes |
| Schema changes | The schema is defined up front. Changing it generally requires migrating data from the old schema to the new one | Not constrained by a predefined schema |
| Scaling | Vertical. Improve the performance of a single server | Horizontal. Partition and distribute data across multiple lower-cost servers |
| Transactions | Supports ACID (atomicity, consistency, isolation, durability) | Varies by database |
| Consistency | Strong consistency automatically, because of the ACID properties | Generally eventual consistency. Can be configured for strong consistency when needed |

An example of horizontal scaling: when storing information for 100,000 users in one table, split it into subsets of 10,000 users and store each subset on a separate server.

#### How DynamoDB Differs from a Relational Database 🆕

DynamoDB **does not support the JOIN operator.** For that reason, the official documentation recommends **denormalizing your data model**, which is the opposite of relational design. This is what the courseware table's "Querying — focuses on collection of documents" row means in practice.

> — Source: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

#### ACID Support in DynamoDB 🆕

The courseware instructor notes only mention that "DynamoDB supports ACID through DynamoDB transactions." The verified content is as follows.

| Item | Content |
|---|---|
| Scope of the guarantee | Coordinated, all-or-nothing changes within and across multiple tables. ACID guaranteed |
| `TransactWriteItems` | Groups up to **100** write operations into a single all-or-nothing operation |
| `TransactGetItems` | Groups up to **100** get operations |
| Size limit | The aggregate size of the items in a single transaction cannot exceed **4 MB** |
| Cost | No additional cost to enable transactions. You pay only for reads and writes, but DynamoDB performs **two** underlying reads or writes per item — one to prepare and one to commit |
| Constraint | Transactions **cannot be performed against indexes** |

> — Source: [Managing complex workflows with DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html)

### 2.3 Representing the Same Data in SQL and NoSQL

Courseware slide 8 shows the same Notes data side by side as rows and columns and as JSON documents.

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | HelloWorld! | No |
| StudentB | 23 | Amazon DynamoDB… | Yes |
| StudentC | 12 | Thanks for all… | No |

```json
{ "UserId": "StudentA", "NoteId": "11", "Note": "HelloWorld!" }
{ "UserId": "StudentB", "NoteId": "23", "Note": "Amazon DynamoDB…", "Favorite": "Yes" }
{ "UserId": "StudentC", "NoteId": "12", "Note": "Thanks for all…" }
```

In the relational representation the `Favorite` column exists on every row and is filled with `No` when there is no value. In the NoSQL representation the **`Favorite` attribute exists only on the items that need it.** That is what a "dynamic schema" looks like in practice.

### 2.4 Where DynamoDB Sits in the Application Architecture

The diagram on courseware slide 9 arranges the components of the lab application as follows.

| Layer | Components |
|---|---|
| Client | End users, website hosting, MP3 hosting |
| API | Amazon API Gateway, application API calls (List / Search / Delete / Create and Update) |
| Authentication and authorization | AWS Identity and Access Management (IAM), Amazon Cognito |
| Data | **Amazon DynamoDB** |
| Additional services | Amazon Polly, Dictate |
| Operations | AWS X-Ray, Amazon CloudWatch, AWS SAM |

### 2.5 Why Choose DynamoDB for Application Development 🔄

Courseware slide 10 presents the benefits as six labels: performance at scale / serverless / enterprise ready / fully managed / low-latency queries / fine-grained access control.

| Benefit | Content |
|---|---|
| Performance at scale | A fully managed NoSQL database service that delivers fast, predictable performance with seamless scalability. Meets the changing capacity requirements of your application |
| Serverless | No software to install or maintain |
| Enterprise ready | A fully managed cloud database that supports both document and key-value store models |
| Fully managed | Create a table, set a target utilization for auto scaling, and the service handles the rest: hardware and software provisioning, setup, patching, orchestrating the distributed cluster, and partitioning data |
| Low-latency queries | 🔄 **Single-digit millisecond** performance at any scale |
| Fine-grained access control | Integrates with IAM for fine-grained control over access by users in your organization. Assigns unique security credentials per user |
| Flexibility | Supports storing, querying, and updating documents. With the AWS SDKs you can store JSON documents directly in a table, which reduces the amount of code you write |

#### Latency Wording 🔄

| Item | Wording |
|---|---|
| Courseware states | "**less than 10 milliseconds** of latency at any scale", "average service-side latency is typically under 10 milliseconds" |
| Current official wording | **Single-digit millisecond** performance at any scale |

Whether the courseware figure of "under 10 milliseconds" was once the official wording could not be verified (see [Section 9.5](#95-items-that-could-not-be-verified)). Using the current wording in class is the safer choice.

#### Resilience and Backups 🆕

The courseware only states, under the fully managed benefit, that DynamoDB "provides point-in-time recovery, backup, and restore for all tables." The verified content is as follows.

| Item | Content |
|---|---|
| Replication | Data is automatically replicated across **three Availability Zones** by default |
| Availability SLA | **99.99%**. Global tables provide **99.999%** |
| Continuous backups | **Second-level** granularity |
| Point-in-time recovery (PITR) | Restore a table to any point in time (to the second) within the last **35 days**. The recovery window is configurable from **1 to 35 days** |
| Performance impact | Continuous backups and point-in-time restore do not consume provisioned capacity and have no effect on application performance or availability |
| On-demand backup | Full backups for long-term retention and archival. Integrates with **AWS Backup** |

> — Source: [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)

---

## 3. DynamoDB Core Concepts

### 3.1 Tables, Items, and Attributes

| DynamoDB term | Corresponding relational database concept |
|---|---|
| Table | Table |
| Item | Row or tuple |
| Attribute | Column |

The Notes table example from courseware slide 12. `UserId` is the partition key (required) and `NoteId` is the sort key (optional).

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | Hello… | |
| StudentB | 23 | Amazon… | yes |
| StudentC | 12 | Thanks… | |
| StudentD | 33 | Test… | |
| StudentD | 42 | Run… | yes |

There is **no limit on the number of items** you can store in a table.

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html), [Working with tables and data in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithTables.html)

### 3.2 Partitions and Data Distribution 🆕

DynamoDB stores data in **partitions** and divides a table's items across multiple partitions based on the partition key value.

| Item | Content |
|---|---|
| What a partition is | **An allocation of storage for a table, backed by SSDs** |
| Replication | **Automatically replicated across multiple Availability Zones** within one AWS Region |
| Who manages it | DynamoDB, entirely. You never manage partitions yourself |
| At table creation | The initial status is `CREATING`. During this phase DynamoDB allocates enough partitions to handle the provisioned throughput requirements. Reads and writes are possible once the status becomes `ACTIVE` |
| When more partitions are allocated | When you increase provisioned throughput beyond what the existing partitions can support, or when an existing partition fills up |
| Global secondary indexes | GSIs are also composed of partitions, and **index data is stored separately from the base table** |

Courseware slide 10 states that DynamoDB "uses automatic partitioning and SSD technologies to meet your throughput needs as data volumes and performance requirements grow." The conditions the documentation actually describes for allocating additional partitions are the two in the table above.

> — Source: [Partitions and data distribution in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html)

#### Hash Attributes and Range Attributes 🆕

| Alternative name | Applies to | Origin |
|---|---|---|
| Hash attribute | Partition key | Derives from the way DynamoDB uses an **internal hash function** to distribute data items evenly across partitions based on the partition key value |
| Range attribute | Sort key | Derives from the way items with the same partition key are stored **physically close together, in sorted order by sort key value** |

Primary key attributes carry the following constraints, none of which are in the courseware.

- Every primary key attribute must be **scalar**, and the only permitted data types are **String, Number, and Binary**.
- Non-key attributes have no such restriction.
- DynamoDB supports nested attributes up to **32 levels** deep.

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.3 Items and Attribute Types 🔄

An item is a collection of attributes. Each attribute has a name, a data type, and a value. DynamoDB is not constrained by a predefined schema.

The JSON example from courseware slide 13. The original has no comma after `"Tags"`, which makes it invalid JSON, so the comma has been added here (see [Section 9.1](#91-where-the-courseware-is-factually-incorrect)).

```json
{
  "UserId": "StudentA",
  "NoteId": 13,
  "Note": "Hello everyone",
  "Favorite": "yes",
  "Active": true,
  "Tags": ["DynamoDB", "NoSQL"],
  "Meta": { "color": "green", "pinned": true }
}
```

The types in that example: string (`Note`, `Favorite`) / Boolean (`Active`) / list (`Tags`) / map (`Meta`).

#### The Three Data Type Categories 🔄

| Category | Types | Notes |
|---|---|---|
| Scalar types | Number, string, binary, Boolean, null | A single value |
| Document types | List, map | Represent complex structures with nested attributes up to **32 levels** deep. Maps are well suited to storing JSON-formatted documents |
| **Set types** | String set, number set, binary set | All elements of a set must be **the same type**, values must be **unique**, and **order is not preserved** |

🔄 The courseware calls the third category "multi-valued types." The category name in the official documentation is **Set Types**.

#### Data Type Descriptors 🆕

The low-level API protocol requires data type descriptors. Here is the full list.

| Descriptor | Type | Descriptor | Type |
|---|---|---|---|
| `S` | String | `M` | Map |
| `N` | Number | `L` | List |
| `B` | Binary | `SS` | String set |
| `BOOL` | Boolean | `NS` | Number set |
| `NULL` | Null | `BS` | Binary set |

- **Numbers are sent across the network as strings to preserve precision.** That is why the request example in [Section 8.2](#82-request-format-getitem) shows a numeric value inside quotation marks, as `"NoteId": {"N": "1"}`.
- **Empty sets are not allowed, but empty lists and empty maps are.**

> — Source: [Supported data types and naming rules in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html)

### 3.4 Size and Naming Constraints 🆕

The courseware states that "item size is determined by adding the length of the attribute names and the length of the values, and the maximum item size is 400 KB." Here is the full set of verified constraints.

| Subject | Constraint |
|---|---|
| Maximum item size | **400 KB**, including both the **binary length of the attribute names (UTF-8)** and the **binary length of the attribute values** |
| Number of values in a list, map, or set | No limit, as long as the item fits within the 400 KB limit |
| Size units | All size measurements use binary units. **1 KB = 1024 bytes** |
| Table size | No practical limit |
| Attribute names | At least 1 character and no more than **64 KB** |
| Key and projected attribute names on secondary indexes | The partition key name, the sort key name, and any user-specified projected attribute names (LSIs only) cannot exceed **255 characters**, and the total UTF-8 encoded size of each name cannot exceed **255 bytes** |
| Table and secondary index names | Between 3 and 255 characters, using only `A-Z`, `a-z`, `0-9`, underscore (`_`), hyphen (`-`), and period (`.`) |
| Encoding | All names are UTF-8 encoded and **case sensitive** |
| Partition key values | Minimum 1 byte, maximum **2048 bytes** |
| Sort key values | Minimum 1 byte, maximum **1024 bytes** |
| Number of distinct key values | No practical limit on the number of distinct partition key values for a table or secondary index. Generally no practical limit on the number of distinct sort key values per partition key value either |

A size calculation example: an item with two attributes, one named `shirt-color` with value `R` and one named `shirt-size` with value `M`, has a total size of **23 bytes**.

Attribute names count toward read request unit consumption and toward storage and throughput measurement, so **keeping them short is a best practice**.

> — Source: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.5 Primary Keys

Every table has a primary key that uniquely identifies each item. There are two types.

| Type | Composition | How uniqueness is determined | Index creation as described in the courseware |
|---|---|---|---|
| Partition key (simple primary key) | 1 partition key attribute | Uniquely identified by the partition key value. No two items can have the same partition key value | An **unordered index** on the partition key attribute |
| Partition key and sort key (composite primary key) | Partition key plus sort key | Uniquely identified by the **combination** of the two values. Multiple items can share a partition key value, but their sort key values must differ | An unordered index on the partition key attribute and an **ordered index** on the sort key attribute |

- In a table with only a partition key, DynamoDB uses the partition key value as **input to an internal hash function** to determine the partition an item is stored in.
- In a composite primary key table, all items with the same partition key value are **stored together, ordered by sort key value**.

The example on courseware slide 14 is a Notes table with `UserId` as the partition key and `NoteId` as the sort key. Each `UserId` can have multiple notes, which makes it possible to **query all notes belonging to a particular user**.

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentA | 11 | Hello… | |
| StudentB | 23 | Amazon… | Yes |
| StudentC | 12 | Thanks… | |
| StudentD | 42 | Test… | |
| StudentD | 33 | Run… | Yes |

You can use DynamoDB as both a key-value store and a document store. **The primary key value (the partition key and the sort key, if present) is the key, and the remaining attributes make up the value.**

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 3.6 Read and Write Capacity Units 🆕

Courseware slide 15 explains the on-demand units (RRUs and WRUs) and slide 16 the provisioned units (RCUs and WCUs). All four definitions in one table:

| Mode | Unit | Definition |
|---|---|---|
| Provisioned | 1 RCU | **One strongly consistent read per second** for an item up to 4 KB, or **two eventually consistent reads per second** |
| Provisioned | 1 WCU | **One write per second** for an item up to 1 KB |
| On-demand | 1 RRU | **One strongly consistent read per second** for an item up to 4 KB, or **two eventually consistent reads per second** |
| On-demand | 1 WRU | **One write per second** for an item up to 1 KB |

The courseware statement on slide 15 that "an eventually consistent read requires 0.5 RRU" says the same thing as "two reads for one unit" above.

Transactional requests consume **double the units**. This is not in the courseware.

| Request | Units consumed |
|---|---|
| Transactional read | **2 units** to perform one read per second for an item up to 4 KB |
| Transactional write | **2 units** to perform one write per second for an item up to 1 KB |

> — Source: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.7 Capacity Modes (Pricing Options) 🔄

The comparison from courseware slide 16.

| On-demand | Provisioned |
|---|---|
| Auto scaling | Specify reads and writes per second |
| Pay per request | Pay for provisioned capacity |
| No capacity management | Predictable cost |
| RRU / WRU | RCU / WCU |

#### On-Demand Capacity Mode 🆕

**On-demand mode is the default and the recommended throughput option.** The courseware gets that much right. The verified scaling behavior is as follows.

| Item | Content |
|---|---|
| Scaling range | Start small and scale up to **millions of requests per second** |
| Initial throughput for a new table | Sustains up to **4,000 writes per second** and **12,000 reads per second** |
| Instant accommodation | Instantly accommodates up to **double the table's previous peak traffic** |
| Throttling condition | Throttling can occur if you exceed double the previous peak **within 30 minutes** |
| Billing | Pay per request. **No throughput charges when there is no traffic** |
| Quality | The same single-digit millisecond latency, SLA, and security as provisioned mode |

> — Source: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

#### Provisioned Capacity Mode and Auto Scaling 🆕

| Item | Content |
|---|---|
| Billing basis | The read and write capacity you **provision per hour**, not what you actually consume |
| Auto scaling implementation | Uses the scaling policies of **Application Auto Scaling** |
| What you configure | Minimum and maximum read and write capacity, plus a **target utilization** |
| Behavior | Application Auto Scaling creates and manages CloudWatch alarms. Scaling is triggered when consumed capacity exceeds the target utilization for **two consecutive minutes** |
| Enabled by default | Creating a table or GSI with the AWS Management Console enables auto scaling **by default** |
| Recommended value | AWS recommends setting target utilization to **70%** |

> — Source: [DynamoDB provisioned capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html)

#### Default Throughput Quotas and Mode Switching 🆕

| Item | Value |
|---|---|
| Per on-demand table | 40,000 RRUs, 40,000 WRUs (adjustable) |
| Per provisioned table | 40,000 RCUs, 40,000 WCUs (adjustable) |
| Account-level quota | **Applies to provisioned mode only.** 80,000 RCUs, 80,000 WCUs. Account-level throughput quotas do not apply to on-demand tables |
| Minimum provisioned throughput | 1 RCU and 1 WCU per table or GSI |
| Provisioned capacity decreases | Starts at 4 per day plus 1 additional per hour (up to 4 held concurrently), for a maximum of **27** in 24 hours |
| Tables per account per Region | Default of **2,500** |
| Provisioned to on-demand switch | **Up to 4 times** in a 24-hour rolling window |
| On-demand to provisioned switch | **At any time** |

> — Source: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

#### One Contradiction Inside the Courseware 🔄

The last sentence of the instructor notes on courseware slide 16 reads: "The important difference is that RRUs and WRUs in on-demand mode represent capacity used, whereas **RCUs and WCUs in on-demand mode** represent reserved capacity." RCUs and WCUs are the units of provisioned capacity mode, so the second "on-demand" is a typo for "provisioned." Earlier in the same notes the courseware correctly states that "throughput in provisioned mode is specified in RCUs and WCUs."

| Item | Correct statement |
|---|---|
| RRUs and WRUs in on-demand mode | Capacity **used** |
| RCUs and WCUs in provisioned capacity mode | **Reserved (provisioned)** capacity |

The on-demand pricing link cited in the courseware, `https://aws.amazon.com/dynamodb/pricing/on-demand/`, now redirects to the consolidated pricing page.

> — Source: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html), [Amazon DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/)

### 3.8 Maximum Throughput for On-Demand Tables 🆕

A capability that is not in the courseware. On an on-demand table you can **optionally specify a maximum read and write throughput per second for an individual table and its associated GSIs.** It is a safeguard against unexpected traffic spikes driving up cost.

| Item | Content |
|---|---|
| Default state | **No maximum throughput setting is applied.** Only the 40,000 table-level read and write throughput service quota, which applies to all tables in the account, constrains the table |
| On exceeding | Requests are throttled and a **`ThrottlingException`** is returned |
| Minimum you can set | **1 request unit** per second |
| Maximum you can set | Must be **less than** the default throughput quota available to that table or GSI |
| How it is enforced | On a **best-effort** basis. Burst capacity can cause it to be exceeded temporarily |
| Monitoring | The CloudWatch metrics `OnDemandMaxReadRequestUnits` and `OnDemandMaxWriteRequestUnits` |

> — Source: [DynamoDB maximum throughput for on-demand tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode-max-throughput.html)

### 3.9 Read Consistency 🆕

The courseware comparison table describes NoSQL consistency only as "eventual and strong." The actual rules in DynamoDB are as follows.

| Subject | Supported consistency |
|---|---|
| Tables | Choice of eventual or strong consistency |
| Local secondary indexes (LSIs) | Choice of eventual or strong consistency |
| Global secondary indexes (GSIs) | **Eventual consistency only** |
| DynamoDB Streams | **Eventual consistency only** |

- **Eventual consistency is the default for all read operations.**
- `GetItem`, `Query`, and `Scan` provide an optional `ConsistentRead` parameter. Setting it to `true` makes the read strongly consistent.
- Strongly consistent reads are **not supported** on GSIs or Streams.
- An eventually consistent read costs **half** as much as a strongly consistent read (see [Section 3.6](#36-read-and-write-capacity-units)).
- DynamoDB provides **read-committed isolation**, so read operations always return a committed value.

> — Source: [DynamoDB read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)

### 3.10 Secondary Indexes

A structure that lets you query data based on non-primary key attributes.

| Component | Required? |
|---|---|
| Alternate key attributes (partition key, sort key) | Required |
| Primary key attributes | DynamoDB projects at least the base table's key attributes into the index |
| Other base table attributes (projected attributes) | Optional. You specify which attributes to copy, or project, when you create the index |

Why secondary indexes exist: handling an access pattern that queries on a non-key attribute would otherwise require scanning the entire table. Defining a secondary index on a non-key attribute keeps that query from consuming a large amount of provisioned read throughput.

DynamoDB automatically creates an index based on the table's primary key and automatically updates all indexes whenever the table changes.

#### Index Quotas 🆕

| Item | Value |
|---|---|
| Local secondary indexes per table | Up to **5** |
| Global secondary indexes per table | Default quota of **20** |
| Total projected attributes | Up to **100** user-specified projected attributes across all of a table's LSIs and GSIs combined. This quota applies only when `ProjectionType` is `INCLUDE`, not for `KEYS_ONLY` or `ALL`. Projecting the same attribute name into two indexes counts as two |

🔄 The quota documentation cited in the courseware, `Limits.html`, now redirects to `ServiceQuotas.html`, and the documentation has been split into two pages. Adjustable service quotas are in **ServiceQuotas.html**, while fixed constraints such as item sizes, key lengths, and data types are in **Constraints.html**.

> — Source: [Quotas in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.11 Local Secondary Index Example 🔄

Courseware slide 18 shows a `NotesByFavorites` local secondary index on the Notes table. The slide label reads: "Read and write capacity units are inherited from the base table."

Base table:

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentC | 11 | Thanks… | Yes |
| StudentD | 23 | Test… | |
| StudentD | 12 | Run… | Yes |

The `NotesByFavorites` local secondary index:

| UserId | Favorite | Note |
|---|---|---|
| StudentC | Yes | Thanks… |
| StudentD | Yes | Run… |

A local secondary index is "local" because **the index sits in the same table partition as the items with the given partition key value.** As a result, you can query only the data in the **single partition** specified by the partition key value in the query.

#### Sort Key Constraints 🔄

| Item | Content |
|---|---|
| Courseware states | "This sort key can be a **scalar attribute**" |
| Verified content | The sort key of an LSI must be a **non-key base table attribute of type String, Number, or Binary** |
| Additional constraint | The primary key of an LSI **must be composite** (partition key plus sort key) |
| Additional constraint | Every attribute in an index key schema must be a **top-level attribute**, and **document and set types are not allowed** |

#### The 10 GB Item Collection Limit 🔄

An item collection is the set of items that share the same partition key attribute value. The courseware states unconditionally that "the total size of an item collection cannot exceed 10 GB," but this constraint applies **only to tables that have one or more local secondary indexes.**

| Condition | Behavior |
|---|---|
| A table with one or more LSIs | The item collection **cannot exceed 10 GB**, counting all base table items with the same partition key value plus the projected LSI views. 10 GB is the maximum size of a partition |
| A table with no LSIs | DynamoDB **automatically splits the item collection across as many partitions as needed** |
| On exceeding the limit | `ItemCollectionSizeLimitExceededException` (HTTP 400, retryable) is returned |
| The 400 KB per-item limit | On a table with LSIs, the 400 KB limit applies to the **sum of the table item's data size and the size of that item's entries in all LSIs**, including key values and projected attributes |

The reason this constraint exists only for LSIs is locality. A GSI's item collections are independent of the base table, but an LSI's indexed view is **colocated in the same partition** as the table items and shares the same partition key attribute. So once a table has even one LSI, its item collections cannot be spread across partitions.

> — Source: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html), [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

### 3.12 Global Secondary Index Example

Courseware slide 19 shows a `NotesByUserId` global secondary index on the Notes table. The base table and the index are shown with **separate RCUs and WCUs**.

Base table:

| UserId | NoteId | Note | Favorite |
|---|---|---|---|
| StudentC | 12 | Thanks… | Yes |
| StudentD | 42 | Test… | |
| StudentD | 33 | Run… | Yes |

The `NotesByUserId` global secondary index:

| NoteId | UserId | Note |
|---|---|---|
| 12 | StudentC | Thanks… |
| 42 | StudentD | Test… |
| 33 | StudentD | Run… |

A global secondary index is "global" because queries on the index **can span all of the table's data across all partitions.** Key values do not need to be unique. If eventual consistency is suitable for your application, using a global secondary index is a good choice.

### 3.13 Comparing LSIs and GSIs 🆕

The courseware lists seven characteristics for each index on slides 18 and 19. Organized by the comparison categories in the official documentation:

| Comparison | Global secondary index (GSI) | Local secondary index (LSI) |
|---|---|---|
| Key schema | Either simple (partition key) or composite (partition key plus sort key) | **Must be composite** |
| Key attributes | The index partition key and sort key can be **any** base table attribute of type String, Number, or Binary | The partition key is **the same attribute** as the base table's partition key. The sort key must be a **non-key** base table attribute of type String, Number, or Binary |
| Size restriction per partition key value | None | The total size of all indexed items per partition key value must be **10 GB or less** |
| Online index operations | Created with the table, **can be added to an existing table**, and **can be deleted** | **Created only at table creation.** Cannot be added or deleted |
| Query scope | The **entire table**, across all partitions | The **single partition** specified by the partition key value in the query |
| Read consistency | **Eventual consistency only** | Choice of eventual or strong consistency |
| Provisioned throughput | Has **its own** read and write throughput settings. Queries and scans consume the index's capacity units | Queries and scans consume the **base table's** read capacity units. Writes to the table that update the LSI also consume the base table's write capacity units |
| Projected attributes | Can request **only attributes projected** into the index. DynamoDB does not fetch attributes from the table | Can request attributes that are not projected. DynamoDB **fetches them from the table automatically** |

Points that apply to both:

- Every attribute in an index key schema must be a **top-level attribute of type String, Number, or Binary**. Document and set types are not allowed.
- Each secondary index uses the **same table class and capacity mode** as its base table.
- Deleting a table deletes **all of its indexes** as well.
- When creating multiple tables with secondary indexes, create them **sequentially**. Creating them concurrently returns a `LimitExceededException`.

> — Source: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

### 3.14 Vector Indexes 🆕

An index family that is not in the courseware. DynamoDB currently supports two families of indexes.

| Family | Purpose | Read operation |
|---|---|---|
| Secondary indexes | Query on an **alternate key** other than the base table primary key | `Query`, `Scan` |
| Vector indexes | **Similarity search over vector embeddings** stored in items. Not an alternate key | **`SearchVectors`** |

| Vector index quota | Value |
|---|---|
| Vector indexes per table | 5 (adjustable) |
| Maximum dimensions per vector index | 4,096 |
| Maximum TopK per `SearchVectors` request | 100 |
| Maximum partition keys (`HASH`) per vector index | 1 |
| Vector search rate per partition key | 1 GBps |
| Vector index write rate per partition key | 10 MBps |

> — Source: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

---

## 4. DynamoDB Access Options for Developers

### 4.1 Ways to Access DynamoDB

The access paths listed on courseware slide 21.

| Path | Purpose |
|---|---|
| AWS Management Console | Work with tables and items directly in the console |
| NoSQL Workbench | Design, visualize, and develop queries against data models ([Section 4.2](#42-nosql-workbench)) |
| DynamoDB local | Develop and test locally without the web service ([Section 4.3](#43-dynamodb-local)) |
| PartiQL | SQL-compatible queries ([Section 4.4](#44-partiql)) |
| AWS CLI | Command line and script automation ([Section 4.5](#45-aws-cli)) |
| SDKs | Low-level interface / document interface / higher-level interface ([Section 5.2](#52-comparing-the-programming-interfaces)) |

### 4.2 NoSQL Workbench 🔄

| Item | Content |
|---|---|
| Form | A cross-platform, **client-side GUI application**. Available for Windows, macOS, and Linux |
| Supported databases | Amazon DynamoDB, Amazon Keyspaces (for Apache Cassandra) |
| Capabilities | Design DynamoDB data models, define access patterns as real DynamoDB operations, validate them with sample data, and organize data models into projects |
| 🆕 DynamoDB local included | NoSQL Workbench **includes DynamoDB local**, so you can test tables and indexes before committing a data model to the cloud |
| PartiQL | Supported |

#### Tool Composition 🔄

| Item | Tools |
|---|---|
| Courseware states | Data modeler / **visualizer** / operation builder — **three** |
| Current DynamoDB documentation | Data modeler / operation builder — **two** |

The current documentation does not treat visualization as a separate tool. The data modeler handles sample data composition and access pattern validation as well.

| Tool | Role |
|---|---|
| Data modeler | Design tables and global secondary indexes, define attributes, and compose sample data. Visualize and run access patterns as real DynamoDB operations such as `PutItem`, `UpdateItem`, and `Query` to validate them, then commit the model to DynamoDB local or to an AWS account. Data models can be imported and exported |
| Operation builder | View, explore, and query live datasets. Supports projection expressions and condition expressions, and generates sample code in several languages |

You can **clone tables directly** between AWS accounts in different Regions, or between DynamoDB local and an AWS account.

The Amazon Keyspaces documentation still has a visualizer entry. For Keyspaces you can build a new data model by defining keyspaces, tables, and columns, or import and modify an existing model, and you can commit a data model to Amazon Keyspaces or Apache Cassandra to create the keyspaces and tables automatically. You can visualize a data model to confirm that it supports your application's queries and access patterns.

> — Source: [NoSQL Workbench for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html), [Using NoSQL Workbench with Amazon Keyspaces](https://docs.aws.amazon.com/keyspaces/latest/devguide/workbench.html)

#### What to Note in the Release History 🆕

| Version | Date | Content |
|---|---|---|
| 3.20.2 | April 6, 2026 | Improved error handling when DynamoDB local fails to start or is canceled, and fixes to the data modeler for DynamoDB access patterns |
| 3.20.1 | February 17, 2026 | Maintenance release |
| 3.20.0 | February 16, 2026 | Refreshed data modeler user experience for DynamoDB, with **support for access patterns** |
| 3.13.5 | February 24, 2025 | The capacity mode in the default table settings **changed to on-demand**. Creating a table with the default settings now produces an on-demand capacity mode table rather than a provisioned capacity mode table |
| 3.13.0 | April 24, 2024 | Native dark mode support and operation builder improvements |

The default change in 3.13.5 is immediately visible in the lab: unlike older screenshots, a table created with the default settings ends up in on-demand mode.

> — Source: [Release history for NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkbenchDocumentHistory.html)

### 4.3 DynamoDB Local 🆕

| Item | Content |
|---|---|
| Purpose | Develop and test an application without accessing the DynamoDB web service. The database is **self-contained** on your computer |
| Savings | Saves on throughput, data storage, and data transfer charges, and requires no internet connection during development |
| Moving to production | Remove the local endpoint from your code and the application points at the DynamoDB web service |
| Distribution forms | **Download (requires a JRE)**, an **Apache Maven dependency**, and a **Docker image** |
| SDK support | Supports both AWS SDK for Java 1.x and 2.x |
| Intended use | **Development and testing purposes only** |

#### Specifying the Local Endpoint

The AWS SDKs and tools use the DynamoDB web service endpoint by default. To use DynamoDB local you have to specify the local endpoint `http://localhost:8000`.

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

```json
{ "TableNames": ["Notes"] }
```

- **The AWS CLI cannot use DynamoDB local as its default endpoint, so every command must specify `--endpoint-url`.**
- The default port is 8000 and can be changed with the `-port` option.

| Key command line option | Role |
|---|---|
| `-sharedDb` | Use a single database file |
| `-inMemory` | Keep data in memory only, writing no file |
| `-dbPath` | Specify the database file path |
| `-cors` | Configure allowed CORS origins |
| `-delayTransientStatuses` | Introduce delays in transient status transitions to better mirror the real service |
| `-disableTelemetry` | Disable telemetry |

#### Differences from the Web Service 🆕

The courseware covers only the local endpoint and the cost savings. The differences below are not in the courseware.

| Item | Behavior in DynamoDB local |
|---|---|
| Point-in-time recovery (PITR) | **Not supported** |
| `billingModeSummary` | Always returns `null` |
| Provisioned throughput settings | **Ignored** |
| Parallel scans | Not supported |
| Read consistency | Reads are eventually consistent, but they mostly appear strongly consistent because of the speed |
| Item collection metrics and sizes | Not tracked |

> — Source: [Setting up DynamoDB local (downloadable version)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html), [Usage notes for DynamoDB local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html)

### 4.4 PartiQL 🔄

PartiQL is a **SQL-compatible query language** used to select, insert, update, and delete data in DynamoDB. You can run ad hoc queries with it.

| Where you can use it | Note |
|---|---|
| AWS Management Console | Matches the courseware |
| NoSQL Workbench | Matches the courseware |
| AWS Command Line Interface | Matches the courseware |
| The DynamoDB API for PartiQL | The courseware says "DynamoDB API" |

PartiQL operations provide **the same availability, latency, and performance** as the other DynamoDB data plane operations.

The Python example from courseware slide 24.

```python
import boto3

dynamodb = boto3.client("dynamodb")
# Runs a parameterized PartiQL statement. The Parameters values fill the ? placeholders in order.
resp = dynamodb.execute_statement(
    Statement="SELECT * FROM Books WHERE Author = ? AND Title = ?",
    Parameters=[{"S": "John Grisham"}, {"S": "The Rainmaker"}],
)
print(resp["Items"])
```

#### Constraints Not in the Courseware 🆕

- DynamoDB supports only a **subset** of the PartiQL query language.
- **The Amazon Ion data format and Ion literals are not supported.**

The courseware instructor notes also cite the PartiQL project site `https://partiql.org/`. The factual basis in this material is the official AWS documentation.

> — Source: [PartiQL - a SQL-compatible query language for Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ql-reference.html)

### 4.5 AWS CLI

Interacting with DynamoDB through the AWS CLI lets you automate work from the command line with scripts. Use it for ad hoc tasks such as creating a table or adding a new item.

The command from courseware slide 25. Because it exposes the low-level API directly, it is a good place to see that **every attribute in an item carries a data type descriptor.**

```bash
aws dynamodb put-item --table-name Notes --item '{"UserId":{"S":"StudentA"},"NoteId":{"N":"11"},"Note":{"S":"HelloWorld!"}}'
```

🔄 The table on slide 25 that shows the result of this command has the header `UserId \| NoteId \| Notes \| Favorite`. Every other slide in the deck (8, 12, 13, 14, 18, 19) and the item JSON in the `put-item` command above all use `Note` as the attribute name. `Notes` is a **typo confusing the attribute name with the table name.**

This material keeps the `put-item` command exactly as the courseware presents it. The command itself was not verified against the AWS CLI documentation (see [Section 9.5](#95-items-that-could-not-be-verified)). The CLI usage pattern that was verified is the `list-tables` example in [Section 4.3](#43-dynamodb-local).

> — Source: [Core components of Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)

### 4.6 Demo: NoSQL Workbench

Courseware slides 26–27 are the NoSQL Workbench demonstration segment. In class you walk through the two tools from [Section 4.2](#42-nosql-workbench) — the data modeler and the operation builder — on screen. Since the default capacity mode became on-demand in 3.13.5, the live screens may differ from older screenshots.

---

## 5. Programming with DynamoDB

### 5.1 How the AWS SDKs Process a Request

The diagram on courseware slides 29–30 shows requests and responses flowing in both directions through application → AWS SDK (object persistence interface / document interface / low-level interface) → DynamoDB AWS REST API → DynamoDB in the AWS Cloud.

| Step | Content |
|---|---|
| 1 | You write your application using the AWS SDK for your programming language |
| 2 | Each AWS SDK provides one or more programmatic interfaces for working with DynamoDB. The available interfaces depend on the language and the SDK. The options are the low-level interface, the document interface, the object persistence interface, and higher-level interfaces |
| 3 | The AWS SDK **constructs an HTTP(S) request** for the low-level DynamoDB API |
| 4 | The AWS SDK **sends the request to the DynamoDB endpoint** |
| 5 | DynamoDB executes the request. On success it returns an **HTTP 200 response code (OK)**; on failure it returns an HTTP error code and an error message |
| 6 | The AWS SDK processes the response and propagates it back to your application |

Work each AWS SDK performs on your behalf, so that **you do not have to write code for it**:

- Formatting HTTP(S) requests and serializing request parameters
- Generating a cryptographic signature for each request
- Forwarding requests to the DynamoDB endpoint and receiving responses
- Extracting the results from responses
- Implementing basic retry logic in case of errors

> — Source: [Overview of AWS SDK support for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html)

### 5.2 Comparing the Programming Interfaces 🔄

The table from courseware slide 31.

| Interface | Data type descriptors | Supported languages as listed in the courseware | Characteristics |
|---|---|---|---|
| Object persistence interface | Mapped data types | Java, .NET | Object-centric code |
| Document interface | Data type descriptors are implied | Java, .NET, Node.js, **AWS SDK for JavaScript in the Browser** | Built-in JSON utilities |
| Low-level interface | Data type descriptors must be identified | All AWS SDKs | — |

The verified content:

| Interface | Behavior | SDKs that provide it |
|---|---|---|
| Low-level interface | Has methods that **closely resemble** low-level DynamoDB API requests. In some cases you must identify an attribute's data type with a descriptor such as `S` (string) or `N` (number) | **All** language-specific AWS SDKs |
| Document interface | Performs data plane operations (create, read, update, delete) on tables and indexes. You do not specify data type descriptors, because the data types are implied by the semantics of the data itself. Also provides ways to convert JSON documents to and from native DynamoDB data types | Java, .NET, Node.js, **JavaScript SDK** |
| Object persistence interface | Does not perform data plane operations directly. Instead you **create objects that represent items** in tables and indexes and work only with those objects, which lets you write **object-centric code** rather than database-centric code | Java, .NET |

🔄 The courseware lists the document interface as supported by "AWS SDK for JavaScript in the Browser." The current documentation says **JavaScript SDK** and points to the AWS SDK for JavaScript v3 documentation.

#### What the Higher-Level Interfaces Actually Are 🔄

| Language | Higher-level interface |
|---|---|
| Java 1.x | `DynamoDBMapper` |
| **Java 2.x** | **DynamoDB Enhanced Client** |
| .NET | Document model, object persistence model |

With a higher-level interface you define the relationship between your program's objects and the database tables that store their data, and then simple object method calls such as `save`, `load`, and `delete` run the low-level DynamoDB operations automatically.

> — Source: [Programmatic interfaces that work with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKs.Interfaces.html), [Higher-level programming interfaces for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HigherLevelInterfaces.html)

### 5.3 Account-Based Endpoints 🆕

A change that is not in the courseware. AWS is rolling out SDK support for **AWS account-based endpoints** for DynamoDB, starting with the AWS SDK for Java V1 on **September 4, 2024**.

| Item | Content |
|---|---|
| Endpoint format | `https://(account-id).ddb.(region).amazonaws.com` |
| Adoption | Updated SDKs use the new endpoint **automatically** |
| Caveat | Sending requests to many accounts from a single SDK client instance **reduces connection reuse opportunities**. Reducing the number of accounts a single SDK client instance connects to is recommended |
| Alternative | Continue using Regional endpoints via the `ACCOUNT_ID_ENDPOINT_MODE` setting |

> — Source: [Overview of AWS SDK support for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html)

---

## 6. DynamoDB Dependencies

### 6.1 The Courseware SDK Dependency Table 🔄

The table exactly as it appears on courseware slide 33.

| API | Python | .NET | Java |
|---|---|---|---|
| Low-level | `boto3.dynamodb.conditions`<br>`boto3.dynamodb.types` | `Amazon.DynamoDBv2.Model` | `com.amazonaws.services.dynamodbv2.AmazonDynamoDB` |
| Higher-level | *(empty)* | `Amazon.DynamoDBv2.DataModel` | `com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper` |

There are three things in this table that needed verification, and all three differ from current documentation. The sections below cover them language by language.

### 6.2 Java Dependencies 🔄

Both Java entries in the courseware table are **AWS SDK for Java 1.x namespaces** (`com.amazonaws.services.dynamodbv2.*`), and 1.x **reached end-of-support on December 31, 2025**. AWS recommends **migrating to the AWS SDK for Java 2.x** to keep receiving new features, availability improvements, and security updates.

| Layer | 2.x namespace |
|---|---|
| Low-level client | `software.amazon.awssdk.services.dynamodb.DynamoDbClient` |
| Low-level model | `software.amazon.awssdk.services.dynamodb.model.GetItemRequest`<br>`software.amazon.awssdk.services.dynamodb.model.AttributeValue`<br>`software.amazon.awssdk.services.dynamodb.model.DynamoDbException` |
| Region | `software.amazon.awssdk.regions.Region` |
| Higher-level (object persistence) | `software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient`<br>`software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable`<br>`software.amazon.awssdk.enhanced.dynamodb.Key`<br>`software.amazon.awssdk.enhanced.dynamodb.TableSchema`<br>`software.amazon.awssdk.enhanced.dynamodb.model.GetItemEnhancedRequest` |

The Enhanced Client wraps the low-level client.

```java
// Build the low-level client first, then hand it to the Enhanced Client.
DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
    .dynamoDbClient(ddb)
    .build();
```

The official examples note that **using the Enhanced Client is the better approach** when getting an item.

It is also worth pointing out that SDK generations are mixed within the courseware itself. The dependency table on slide 33 uses 1.x namespaces, while the example code on slide 35, covered in [Section 7.1](#71-java-example-creating-a-service-client), already uses the 2.x `DynamoDbClient.builder()` syntax.

> — Source: [Programmatic interfaces that work with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKs.Interfaces.html), [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

### 6.3 Python (boto3) Dependencies 🔄

The higher-level cell for Python is empty in the courseware table, and `boto3.dynamodb.conditions` and `boto3.dynamodb.types` are placed in the low-level cell. The official documentation describes those two modules as **DynamoDB customizations used with the `Table` resource (`dynamodb.Table`).**

| Module or class | Purpose |
|---|---|
| `boto3.dynamodb.types.Binary` | A class that represents DynamoDB's Binary (`B`) type |
| `boto3.dynamodb.conditions.Key` | Conditions on an item's **key**. Passed to `KeyConditionExpression` on `Table.query()` |
| `boto3.dynamodb.conditions.Attr` | Conditions on an item's **attributes**. Passed to `FilterExpression` on `Table.scan()` |

```python
# Key and Attr come from the conditions module.
from boto3.dynamodb.conditions import Key, Attr

# Chain conditions with logical operators: & is and, | is or, ~ is not.
response = table.query(
    KeyConditionExpression=Key("UserId").eq("StudentA") & Key("NoteId").gt(10),
    FilterExpression=Attr("Favorite").eq("yes"),
)
```

The mapping between Python types and DynamoDB types:

| Python type | DynamoDB type |
|---|---|
| `string` | `S` |
| `integer`, `decimal.Decimal` | `N` |
| `boto3.dynamodb.types.Binary` | `B` |
| `boolean` | `BOOL` |
| `None` | `NULL` |
| string set | `SS` |
| `integer` / `decimal.Decimal` set | `NS` |
| `Binary` set | `BS` |
| `list` | `L` |
| `dict` | `M` |

#### Why the Higher-Level Cell Is Empty 🔄

In boto3 the higher-level equivalent is the **resources interface** (`boto3.resource('dynamodb')` and `dynamodb.Table`). The AWS Python SDK team, however, has **no plans to add new features to it.**

| Item | Content |
|---|---|
| Status | No new features planned. Existing interfaces **continue to operate for the lifecycle of boto3** |
| Path to newer features | The **client** interface |
| What resources are | An **object-oriented interface** that provides a higher-level abstraction than the raw, low-level calls of a service client. Used by passing a service name to a `Session`'s `resource()` method |
| Thread safety | Resource instances are **not thread safe**. Do not share them between threads or processes; create a new one per thread or process |

> — Source: [Boto3 DynamoDB customizations](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/customizations/dynamodb.html), [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 6.4 .NET Dependencies 🔄

The courseware table lists .NET in only two rows and **omits the namespace that corresponds to the document interface.**

| Layer | Namespace | Key elements |
|---|---|---|
| Low-level | `Amazon.DynamoDBv2`<br>`Amazon.DynamoDBv2.Model` | An `AmazonDynamoDBClient` instance and request objects such as `PutItemRequest` and `GetItemRequest` |
| 🆕 Document model | `Amazon.DynamoDBv2.DocumentModel` | `Table` and `Document`. Cannot create, update, or delete tables, but supports most common data operations |
| Higher-level (object persistence) | `Amazon.DynamoDBv2.DataModel` | Maps client-side classes to tables |

```csharp
// Each layer requires a different namespace.
using Amazon.DynamoDBv2;                // Low-level client
using Amazon.DynamoDBv2.Model;          // Low-level request and response models
using Amazon.DynamoDBv2.DocumentModel;  // Document model (Table, Document)
using Amazon.DynamoDBv2.DataModel;      // Object persistence model
```

#### The Object Persistence Model and `DynamoDBContext`

The courseware correctly states that `DynamoDBContext` is the entry point to DynamoDB.

| Item | Content |
|---|---|
| Unit of mapping | **Each object instance maps to an item** in the corresponding table |
| `DynamoDBContext` | The **entry point** to DynamoDB. Provides the connection so you can access tables, perform CRUD operations, and run queries |
| 🆕 Constraint | The object persistence model **provides no API for creating, updating, or deleting tables.** It offers only data operations, so table creation, updates, and deletion require the .NET low-level API |
| Required attributes | Only two: `DynamoDBTable` and `DynamoDBHashKey` |
| Concurrency | Supports **optimistic locking** |

> — Source: [Working with the .NET document model in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html), [Working with the .NET object persistence model and DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKHighLevel.html)

---

## 7. DynamoDB Service References

### 7.1 Java Example: Creating a Service Client

Before you can send requests to an AWS service you have to **create a service client object.** You instantiate it with the static factory method `builder()`.

The "get the client builder" example from courseware slide 35.

```java
DynamoDbClient client = DynamoDbClient.builder()
    .region(Region.US_WEST_2)
    .credentialsProvider(ProfileCredentialsProvider.builder()
        .profileName("myProfile")
        .build())
    .build();
```

The "get the client builder for a local installation" example. This is how you specify the local endpoint from [Section 4.3](#43-dynamodb-local) in code.

```java
DynamoDbClient client = DynamoDbClient.builder()
    .endpointOverride(URI.create("http://localhost:8000"))
    // The Region is meaningless for local DynamoDB but is required by client builder validation.
    .region(Region.US_EAST_1)
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create("dummy-key", "dummy-secret")))
    .build();
```

The "create the default client" example.

```java
DynamoDbClient client = DynamoDbClient.create();
```

#### The Difference Between `builder()` and `create()`

| Method | Behavior |
|---|---|
| `builder()` | Returns a **builder object** you can use to customize the client. The fluent setter methods return the builder object, so calls can be chained. After configuring the properties you want, call `build()` |
| `create()` | Creates a client with the **default configuration**, loading credentials from the default provider chain and the Region from the default AWS Region provider chain. **The call fails** if credentials or a Region cannot be determined from the environment |

#### Managing the Client Lifecycle 🆕

Not in the courseware, but immediately relevant in production.

| Item | Content |
|---|---|
| Thread safety | SDK service clients are **thread safe** and should be treated as **long-lived objects** for performance |
| Connection pool | Each client holds **its own connection pool resources**, which are released when it is garbage collected |
| Immutability | Service client objects are **immutable**. You need a new client for each service you call, or to use a different configuration for the same service |
| Specifying a Region | Not mandatory for every AWS service, but setting the Region in your application is a **best practice** |
| Cleanup | When you no longer need a client, call `close()` to release resources. Service clients implement `Autoclosable`, so they are closed automatically in a **try-with-resources** statement |

#### The Courseware Warning About Plaintext Keys

Courseware slide 35 attaches a warning to the `StaticCredentialsProvider` example. The original wording contains a typo; the meaning is that you should generally not use this type of code in an application, and if you must include it, take appropriate care that plaintext keys are not exposed in your code, on the network, or even in computer memory.

#### Documentation Path 🔄

| Item | Content |
|---|---|
| URL cited in the courseware | `sdk-for-java/latest/developer-guide/using.html` — now the **chapter table of contents page** for "Using the AWS SDK for Java 2.x" |
| Where the content actually lives | The "Create a service client" section of the child page `work-witih-clients.html` |

> — Source: [Making AWS service requests using the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/work-witih-clients.html), [Using the AWS SDK for Java 2.x](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/using.html)

### 7.2 Python Example: Creating a Service Client 🔄

The code from courseware slide 36. The original comment above `boto3.client('dynamodb')` reads "get the service resource," but in boto3 `client()` and `resource()` are **separate interfaces**, so that comment is wrong. The comment has been corrected here.

```python
import boto3

# Create the low-level client (the resource interface is boto3.resource('dynamodb'))
dynamodb = boto3.client('dynamodb')

# Create a DynamoDB table
table = dynamodb.create_table(
    TableName='Notes',
    KeySchema=[...],
    AttributeDefinitions=[...],
    BillingMode='PAY_PER_REQUEST'
)
```

| Interface | How it is created | Note |
|---|---|---|
| Client | `boto3.client('dynamodb')` | Low-level. Newer service features arrive here |
| Resource | `boto3.resource('dynamodb')` | Higher-level abstraction. No new features planned (see [Section 6.3](#63-python-boto3-dependencies)) |

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### 7.3 `BillingMode` in `create_table` 🆕

The `BillingMode='PAY_PER_REQUEST'` used in the courseware example is still valid and is the **recommended value.**

| Value | Meaning | Recommended for |
|---|---|---|
| `PAY_PER_REQUEST` | **On-demand capacity mode.** AWS recommends this value for most DynamoDB workloads | Most workloads |
| `PROVISIONED` | **Provisioned capacity mode** | Steady workloads whose capacity requirements can be forecast reliably |

- `BillingMode` controls how read and write throughput is charged and how capacity is managed, and it **can be changed later** (see the switching limits in [Section 3.7](#37-capacity-modes-pricing-options)).
- If you set `PROVISIONED` you **must** specify `ProvisionedThroughput`; if you set `PAY_PER_REQUEST` you **cannot** specify it.

#### What to Note in the `CreateTable` Parameters 🆕

| Item | Content |
|---|---|
| Required parameter | **`TableName` only** |
| `KeyType` in `KeySchema` | `HASH` (partition key) or `RANGE` (sort key) |
| Simple primary key | **One** `HASH` element |
| Composite primary key | **Exactly two** elements, `HASH` followed by `RANGE` |
| Asynchronous behavior | `CreateTable` is asynchronous. It immediately returns a `TableStatus` of **`CREATING`** and becomes **`ACTIVE`** once creation completes. Reads and writes are possible only on an `ACTIVE` table |
| Name uniqueness | Within an AWS account, table names must be **unique per Region**. You can have two tables with the same name in different Regions |
| Indexes | Up to 20 GSIs and up to 5 LSIs can be defined at creation. Each global secondary index supports up to 4 partition keys and up to 4 sort keys |
| Parameters not in the courseware | `DeletionProtectionEnabled`, `OnDemandThroughput` (`MaxReadRequestUnits` and `MaxWriteRequestUnits`), `WarmThroughput`, `ResourcePolicy`, `SSESpecification`, `StreamSpecification`, `TableClass`, `Tags`, `VectorIndexes` |

`OnDemandThroughput` is the maximum throughput setting from [Section 3.8](#38-maximum-throughput-for-on-demand-tables), and `VectorIndexes` is the vector index feature from [Section 3.14](#314-vector-indexes).

> — Source: [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html)

---

## 8. Requests and Responses

### 8.1 The Low-Level API

The Amazon DynamoDB low-level API is DynamoDB's **protocol-level interface.** At this level every HTTP(S) request must be correctly formatted and must carry a **valid digital signature.** The AWS SDKs construct low-level requests and process responses on your behalf, which lets you focus on application logic.

| Item | Content |
|---|---|
| HTTP method | The low-level API accepts **HTTP(S) POST requests only** as input |
| Wire protocol | **JSON** |
| Storage format | DynamoDB uses JSON **only as a transport protocol**, not as a storage format |

> — Source: [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.2 Request Format: GetItem

The request example from courseware slide 39.

```http
POST / HTTP/1.1
Host: dynamodb.<region>.<domain>;
Accept-Encoding: identity
Content-Length: <PayloadSizeBytes>
User-Agent: <UserAgentString>
Content-Type: application/x-amz-json-1.0
Authorization: AWS4-HMAC-SHA256 Credential=<Credential>, SignedHeaders=<Headers>, Signature=<Signature>
X-Amz-Date: <Date>
X-Amz-Target: DynamoDB_20120810.GetItem

{
  "TableName": "Notes",
  "Key": {
    "UserId": {"S": "StudentA"},
    "NoteId": {"N": "1"}
  }
}
```

| Element | Role |
|---|---|
| `Authorization` | The information DynamoDB needs to **authenticate** the request |
| `X-Amz-Target` | The DynamoDB **operation name** (`GetItem`) and the low-level **API version** (`20120810`) |
| `Content-Type` | `application/x-amz-json-1.0` |
| Payload (body) | The operation's parameters in JSON. For `GetItem` they are `TableName` and `Key` |

The reason a numeric value is wrapped as `{"N": "1"}` is the data type descriptor rule from [Section 3.3](#33-items-and-attribute-types).

#### What to Note About the GetItem Operation 🆕

| Item | Content |
|---|---|
| Return value | The set of attributes for the item with the given primary key. If there is no matching item, no data is returned and **there is no `Item` element in the response** |
| Default consistency | 🆕 **Eventually consistent read by default.** Set `ConsistentRead` to `true` if you need strong consistency. A strongly consistent read might take more time but always returns the last updated value |
| Required parameters | `Key` and `TableName` |
| How to supply the primary key | All attributes must be provided: the partition key value for a simple primary key, and both the partition key and sort key values for a composite primary key |
| Legacy parameter | `AttributesToGet` is legacy. Use **`ProjectionExpression`** |
| `ReturnConsumedCapacity` | Valid values are `INDEXES`, `TOTAL`, and `NONE` |

> — Source: [GetItem API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html), [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.3 Response Format

The response example from courseware slide 40.

```http
HTTP/1.1 200 OK
x-amzn-RequestId: <RequestId>
x-amz-crc32: <Checksum>
Content-Type: application/x-amz-json-1.0
Content-Length: <PayloadSizeBytes>
Date: <Date>

{
  "Item": {
    "UserId": {"S": "StudentA"},
    "NoteId": {"N": "1"},
    "Note": {"S": "HelloWorld!"}
  }
}
```

| Element | Role |
|---|---|
| Status line | `HTTP/1.1 200 OK` — the operation succeeded |
| `x-amzn-RequestId` | The request ID. Provide it to AWS Support when troubleshooting |
| `x-amz-crc32` | A checksum of the payload |
| Payload | The operation's result in JSON |

If DynamoDB cannot process a request it returns an HTTP error code and a message, and **the AWS SDK propagates it to your application as an exception.**

> — Source: [Working with the low-level DynamoDB API](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html)

### 8.4 DescribeTable Requests and Responses 🆕

The courseware uses only `GetItem` as an example. `DescribeTable` is included here to show that the same format applies to other operations, with only the operation name in `X-Amz-Target` changing.

```http
POST / HTTP/1.1
Content-Type: application/x-amz-json-1.0
X-Amz-Target: DynamoDB_20120810.DescribeTable

{"TableName":"Thread"}
```

| Item | Content |
|---|---|
| Return value | Information about **the table's current status, when it was created, its primary key schema, and any indexes on it** |
| Required parameter | `TableName` only |
| Response structure | `HTTP/1.1 200 OK` with the `x-amzn-RequestId`, `x-amz-crc32`, and `Content-Type: application/x-amz-json-1.0` headers, plus a `Table` element containing a `TableDescription` object |
| Response fields | `AttributeDefinitions`, `BillingModeSummary`, `CreationDateTime`, `DeletionProtectionEnabled`, `GlobalSecondaryIndexes`, `ItemCount`, `KeySchema`, `LocalSecondaryIndexes`, `OnDemandThroughput`, `ProvisionedThroughput`, `Replicas`, `SSEDescription`, `StreamSpecification`, `TableArn`, `TableClassSummary`, `TableId`, `TableName`, `TableSizeBytes`, `TableStatus`, `VectorIndexes`, `WarmThroughput`, and others |
| Errors | `InternalServerError` (HTTP 500) and `ResourceNotFoundException` (HTTP 400) |

There are two traps here.

- **Calling `DescribeTable` immediately after `CreateTable` can return a `ResourceNotFoundException`.** `DescribeTable` uses an eventually consistent query, so the table metadata may not be available at that moment. Wait a few seconds and try again.
- The **storage size and item count** `DescribeTable` returns for each secondary index are not updated in real time; they are **refreshed roughly every six hours.**

> — Source: [DescribeTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html)

### 8.5 Response Error Codes 🔄

When a request fails, DynamoDB responds with three components.

| Component | Example |
|---|---|
| HTTP status code | `400` |
| Exception name | `ResourceNotFoundException` |
| Error message | `Requested resource not found: Table: tablename not found` |

The response example from courseware slide 41.

```http
HTTP/1.1 400 Bad Request
x-amzn-RequestId: LDM6CJP8RMQ1FHKSC1RBVJFPNVV4KQNSO5AEMF66Q9ASUAAJG
Content-Type: application/x-amz-json-1.0
Content-Length: 240
Date: Thu, 15 Mar 2012 23:56:23 GMT

{
  "__type": "com.amazonaws.dynamodb.v20120810#ResourceNotFoundException",
  "message": "Requested resource not found: Table: UserNote not found"
}
```

🔄 The courseware example message `Table: UserNote not found` appears in the official documentation example as `Table: tablename not found`. It is the same error, with a different table name.

The AWS SDK propagates errors to your application, so you can **handle them with try-catch logic.**

#### HTTP 400 — Request Problems

Indicates a problem with the request, such as an authentication failure, a missing required parameter, or exceeding a table's provisioned throughput. **You have to correct the problem in your application before resubmitting the request.** Here is the full exception list, which is not in the courseware.

| Exception |
|---|
| `AccessDeniedException` |
| `ConditionalCheckFailedException` |
| `IncompleteSignatureException` |
| `ItemCollectionSizeLimitExceededException` |
| `LimitExceededException` |
| `MissingAuthenticationTokenException` |
| `ProvisionedThroughputExceededException` |
| `ReplicatedWriteConflictException` |
| `RequestLimitExceeded` |
| `ResourceInUseException` |
| `ResourceNotFoundException` |
| `ThrottlingException` |
| `UnrecognizedClientException` |
| `ValidationException` |

**Whether each exception can be retried differs.** `ResourceNotFoundException` **cannot** be retried; examples are a requested table that does not exist or one that is still in the `CREATING` state.

#### HTTP 5xx — Problems on the AWS Side

Indicates a problem that AWS needs to resolve. It may be a transient error, so you can **retry the request until it succeeds.**

| Exception | Code | Retryable |
|---|---|---|
| `InternalServerError` | HTTP 500 | Yes |
| `ServiceUnavailable` (`DynamoDB is currently unavailable`) | HTTP 503 | Yes |

#### Retry Strategy 🆕

| Item | Content |
|---|---|
| With an AWS SDK | Each AWS SDK **automatically implements retry logic and an exponential backoff algorithm** |
| Without an AWS SDK | Retry server errors (5xx). For client errors (4xx), except `ThrottlingException` and `ProvisionedThroughputExceededException`, you have to **correct the request itself** |
| Identifying the throttling cause | `ProvisionedThroughputExceededException`, `RequestLimitExceeded`, and `ThrottlingException` include a list of **`ThrottlingReason`** fields that indicate why throttling occurred |
| Request ID | The response includes a **Request ID** you can provide to AWS Support when diagnosing a problem |

> — Source: [Error handling with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html)

---

## 9. Changes from the Courseware

The following items in the courseware (instructor deck) differ from current behavior. Learners typically have the official courseware alongside this material, so what changed and why is recorded here.

### 9.1 Where the Courseware Is Factually Incorrect

| Item | Courseware states | Verified content | Source |
|---|---|---|---|
| Which mode RCUs and WCUs belong to (slide 16 instructor notes, last paragraph) | "RRUs and WRUs in on-demand mode represent capacity used, whereas **RCUs and WCUs in on-demand mode** represent reserved capacity" | RCUs and WCUs are units of **provisioned capacity mode**. The second "on-demand" is a typo for "provisioned," and it contradicts both the earlier part of the same notes and the slide body | [DynamoDB constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| The 10 GB item collection limit (slide 18) | "The total size of an item collection cannot exceed 10 GB" — stated unconditionally | The constraint applies **only to tables with one or more LSIs**. Without an LSI, DynamoDB splits item collections across multiple partitions automatically. 10 GB is the maximum size of a partition | [DynamoDB constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| LSI sort key constraints (slide 18) | "This sort key can be a scalar attribute" | It must be a **non-key, top-level base table attribute of type String, Number, or Binary**. An LSI primary key must be composite, and document and set types cannot be used in an index key schema | [Secondary indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html) |
| The comment in the Python example (slide 36) | The comment "get the service resource" sits directly above `dynamodb = boto3.client('dynamodb')` | In boto3, `client()` and `resource()` are **separate interfaces**. A resource is obtained with `boto3.resource('dynamodb')` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |
| The column name in the result table (slide 25) | The header reads `UserId \| NoteId \| Notes \| Favorite` | The attribute name is `Note`. Slides 8, 12, 13, 14, 18, and 19 of the same deck and the item JSON in the `put-item` command all use `Note`. `Notes` is a **typo confusing the attribute name with the table name** | [DynamoDB core components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html) |
| JSON example syntax (slide 13) | There is no comma after `"Tags": ["DynamoDB", "NoSQL"]`, so it does not connect to the following `"Meta"` entry. As written it is not valid JSON | This material adds the comma to make it valid JSON ([Section 3.3](#33-items-and-attribute-types)) | [Data types and naming rules](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html) |

### 9.2 Where Behavior or Defaults Changed

| Item | Courseware states | Current | Source |
|---|---|---|---|
| Latency wording | "less than 10 milliseconds of latency at any scale", "average service-side latency is typically under 10 milliseconds" | **Single-digit millisecond** performance at any scale | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| ElastiCache supported engines | "fully managed Redis or Memcached engines" | Three engines: **Valkey, Memcached, and Redis OSS**, with serverless and node-based deployment options | [AWS database decision guide](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html) |
| The AWS database service comparison table | Puts RDS and Redshift together in the relational row and lists Aurora as one of the engines RDS supports | Relational OLTP is the **Aurora family plus 6 RDS engines = 9 engines**, with Aurora as its own family. **Db2** has been added, and **Redshift is separated out as OLAP**. MemoryDB, Aurora DSQL, Aurora PostgreSQL Limitless Database, and the vector data model are not in the courseware | [AWS database decision guide](https://docs.aws.amazon.com/decision-guides/latest/databases-on-aws-how-to-choose/databases-on-aws-how-to-choose.html) |
| NoSQL Workbench tool composition | Data modeler / visualizer / operation builder — **three** | The DynamoDB documentation lists only **two: the data modeler and the operation builder**, with no separate visualizer. The data modeler handles sample data composition and access pattern validation, and NoSQL Workbench now **includes DynamoDB local**. The Amazon Keyspaces documentation still has a visualizer entry | [NoSQL Workbench](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html) |
| Quota documentation path | Slide 17 cites `developerguide/Limits.html` | It redirects to `ServiceQuotas.html`, and the documentation has been split in two. Adjustable quotas are in **ServiceQuotas.html**; fixed constraints such as item sizes, key lengths, and data types are in **Constraints.html** | [DynamoDB quotas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| Java SDK documentation path | Slide 35 cites `sdk-for-java/latest/developer-guide/using.html` directly for "Create a service client" | That URL is the **chapter table of contents page**. The content is in the "Create a service client" section of the child page `work-witih-clients.html` | [Making AWS service requests with the Java SDK](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/work-witih-clients.html) |
| On-demand pricing page path | Slide 15 cites `aws.amazon.com/dynamodb/pricing/on-demand/` | It redirects to the consolidated pricing page `aws.amazon.com/dynamodb/pricing/` | [Amazon DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/) |

### 9.3 Discouraged or End-of-Support Items

| Item | Status | Replacement | Source |
|---|---|---|---|
| The `com.amazonaws.services.dynamodbv2.*` namespaces in the Java column of slide 33 (AWS SDK for Java 1.x) | **Reached end-of-support on December 31, 2025** | For the low level, `software.amazon.awssdk.services.dynamodb.DynamoDbClient` and `software.amazon.awssdk.services.dynamodb.model.*`; for the higher level, `software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient` (DynamoDB Enhanced Client) | [Java SDK 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html) |
| The boto3 resources interface (`boto3.resource('dynamodb')`, `dynamodb.Table`) | No new features planned. Existing interfaces continue to operate for the lifecycle of boto3 | The client interface `boto3.client('dynamodb')` | [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html) |

When explaining why the Python higher-level cell on courseware slide 33 is empty, mention the second item too. The resources interface is exactly what corresponds to the higher level in boto3.

### 9.4 Added Since the Courseware

| Item | Summary | Source |
|---|---|---|
| Maximum throughput for on-demand tables | Specify a maximum read and write throughput per second for an individual table and its GSIs. Exceeding it returns `ThrottlingException`. Not applied by default | [On-demand maximum throughput](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode-max-throughput.html) |
| Vector indexes | An index family for similarity search over vector embeddings. Read with `SearchVectors` rather than `Query` or `Scan`. 5 per table (adjustable), up to 4,096 dimensions | [Secondary indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html) |
| Capacity mode switching rules | Provisioned to on-demand up to 4 times in a 24-hour rolling window; on-demand to provisioned at any time | [DynamoDB constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html) |
| AWS account-based endpoints | `https://(account-id).ddb.(region).amazonaws.com`. Rollout began with Java V1 on September 4, 2024. Updated SDKs use it automatically | [SDK support overview](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.SDKOverview.html) |
| Java 2.x DynamoDB Enhanced Client | The higher-level interface in 2.x, replacing `DynamoDBMapper` from 1.x | [Higher-level programming interfaces](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HigherLevelInterfaces.html) |
| The .NET document model namespace | `Amazon.DynamoDBv2.DocumentModel` (`Table`, `Document`), which the courseware omits | [.NET document model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DotNetSDKMidLevel.html) |
| New `CreateTable` parameters | `DeletionProtectionEnabled`, `OnDemandThroughput`, `WarmThroughput`, `ResourcePolicy`, `TableClass`, `Tags`, `VectorIndexes`. GSIs support multiple partition keys and sort keys | [CreateTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) |
| Transaction limits in detail | Up to 100 operations each for `TransactWriteItems` and `TransactGetItems`, 4 MB aggregate item size per transaction, two reads or writes consumed per item for prepare and commit, and no transactions against indexes | [DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html) |
| PITR retention window | Restore to any point in time (to the second) within the last 35 days, with a configurable 1-to-35-day recovery window. Three-AZ replication and a 99.99% availability SLA (99.999% for global tables) | [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) |
| Total projected attribute quota | 100 user-specified projected attributes across all of a table's LSIs and GSIs combined, applying only when `ProjectionType` is `INCLUDE` | [DynamoDB quotas](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html) |
| The list of DynamoDB local limitations | No PITR, `billingModeSummary` always `null`, provisioned throughput settings ignored, no parallel scans, and item collection metrics and sizes not tracked | [DynamoDB local usage notes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html) |
| NoSQL Workbench default capacity mode change | Since 3.13.5 (February 24, 2025) the capacity mode in default table settings is on-demand, so the default settings produce an on-demand table | [NoSQL Workbench release history](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkbenchDocumentHistory.html) |
| The eventual consistency trap in `DescribeTable` | Calling it right after `CreateTable` can return `ResourceNotFoundException`. Index sizes and item counts refresh roughly every six hours | [DescribeTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html) |
| The `ThrottlingReason` field | Throttling-related exceptions include a list of fields indicating the cause | [Error handling](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html) |

### 9.5 Items That Could Not Be Verified

Recorded honestly. Confirm these before stating them definitively in class.

| Item | Status |
|---|---|
| The sub-product composition of Amazon Timestream | The AWS database decision guide refers to the time series service as "Amazon Timestream" but writes "Amazon Timestream for LiveAnalytics" in its serverless list. The sub-product composition (LiveAnalytics / InfluxDB) and the current status of each could not be confirmed directly in the Timestream documentation. This material keeps only the service name and the data model (time series) |
| The courseware figure of "under 10 milliseconds" | Whether this figure was once the official wording could not be verified. Only that the current official wording is "single-digit millisecond" was confirmed. For that reason this material does not claim that "under 10 milliseconds was correct in the past" |
| When the visualizer was merged in | That the current DynamoDB NoSQL Workbench documentation presents only two tools was confirmed. However, **which release** merged the visualizer into the data modeler could not be pinned down, because only part of the release history was reviewed |
| The causal claim that "automatic partitioning meets throughput needs as data volumes and performance requirements grow" | That partitions are SSD-backed and that DynamoDB manages and allocates them automatically was confirmed. However, no documentation wording was found that supports the courseware's causal phrasing as stated, so the body includes only the allocation conditions the documentation actually describes ([Section 3.2](#32-partitions-and-data-distribution)) |
| The `put-item` command on slide 25 | This command itself was not verified against the AWS CLI documentation. It is kept with a note that it comes from the courseware; the CLI usage pattern that was verified is the `list-tables` example in the DynamoDB local documentation ([Section 4.5](#45-aws-cli)) |

---

## 10. Knowledge Check and Summary

### Knowledge Check (True/False)

The questions and answers from courseware slides 42–43, kept as they are.

**Question 1**: Relational databases have no fixed schema. Different records can have different attributes.

- ❌ **Answer: False** — It is **non-relational** databases that have no fixed schema. A relational database defines its schema up front.

**Question 2**: Amazon DynamoDB stores data in rows and divides a table's items across multiple partitions based on the partition key value.

- ❌ **Answer: False** — DynamoDB stores data in **partitions** and divides a table's items across multiple partitions based on the partition key value.

**Question 3**: Each DynamoDB attribute has a name, a data type, and a value. An item whose total size is under 400 KB can have an unlimited number of attributes.

- ✅ **Answer: True**

**Question 4**: A read capacity unit (RCU) is the number of strongly consistent reads per second you can perform for an object of up to 4 KB.

- ✅ **Answer: True**

**Question 5**: To develop with Amazon DynamoDB you must access the DynamoDB web service to test your application.

- ❌ **Answer: False** — With the downloadable version (DynamoDB local) you can develop and test without accessing the DynamoDB web service.

**Question 6**: With the AWS SDK document interface for DynamoDB, you do not need to specify data type descriptors.

- ✅ **Answer: True** — The data types are implied by the semantics of the data itself.

### 🆕 Supplementary Questions (Covering the Updated Content)

**Question 7**: Calling `GetItem` on a newly created DynamoDB table performs a strongly consistent read by default.

- ❌ **Answer: False** — **Eventual consistency is the default for all read operations.** Set `ConsistentRead` to `true` when you need strong consistency. Strongly consistent reads are not available on global secondary indexes or Streams. (See [Section 3.9](#39-read-consistency))

> — Source: [DynamoDB read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)

**Question 8**: In any DynamoDB table, the total size of the items sharing a partition key value cannot exceed 10 GB.

- ❌ **Answer: False** — That constraint applies **only to tables with one or more local secondary indexes**. Without an LSI, DynamoDB splits the item collection across multiple partitions automatically. (See [Section 3.11](#311-local-secondary-index-example))

> — Source: [Constraints in Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html)

**Question 9**: A global secondary index can be added or deleted after the table is created, whereas a local secondary index can only be created when the table is created.

- ✅ **Answer: True** — GSIs can be added to and deleted from an existing table; LSIs can only be created at table creation and cannot be added or deleted. (See [Section 3.13](#313-comparing-lsis-and-gsis))

> — Source: [Improving data access with secondary indexes in DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

**Question 10**: A newly created on-demand table handles millions of requests per second immediately as traffic grows.

- ❌ **Answer: False** — A new on-demand table sustains up to **4,000 writes and 12,000 reads per second**, and beyond that it instantly accommodates up to **double the table's previous peak traffic**. Throttling can occur if you exceed double the previous peak within 30 minutes. (See [Section 3.7](#37-capacity-modes-pricing-options))

> — Source: [DynamoDB on-demand capacity mode](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html)

**Question 11**: You can use the Java dependencies on courseware slide 33 (`com.amazonaws.services.dynamodbv2.*`) as they are.

- ❌ **Answer: False** — Those namespaces belong to AWS SDK for Java 1.x, which **reached end-of-support on December 31, 2025**. Use the 2.x `software.amazon.awssdk.*` namespaces, with the DynamoDB Enhanced Client for the higher level. (See [Section 6.2](#62-java-dependencies))

> — Source: [AWS SDK for Java 1.x end-of-support](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/getting-started.html)

**Question 12**: `boto3.client('dynamodb')` and `boto3.resource('dynamodb')` return the same interface.

- ❌ **Answer: False** — They are **different interfaces**. The resources interface receives no new features, and newer service features arrive through the client interface. Resource instances are not thread safe. (See [Section 6.3](#63-python-boto3-dependencies), [Section 7.2](#72-python-example-creating-a-service-client)) The comment on courseware slide 36 conflates the two.

> — Source: [Boto3 Resources](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/resources.html)

### Key Takeaways

The "Module summary" items from courseware slide 45. They differ from the module objectives on slide 3 (four items), so both are shown together.

| Module objectives (slide 3) | Module summary (slide 45) |
|---|---|
| Describe the core components of DynamoDB | Describe the core components of DynamoDB |
| Explore the different ways to connect to DynamoDB | Describe how to connect to DynamoDB |
| Define the SDK dependencies and configuration in your code | Define the SDK dependencies in your code |
| Use request and response objects | Describe how to define a request object / Describe how to read a response object |
| — | Describe how to perform key table operations |
| — | List troubleshooting for the most common exceptions |

### Module Objectives Check

After completing this module, you should be able to do the following:

- ✅ Describe the core components of DynamoDB — tables, items, and attributes, partitions, primary keys, secondary indexes, and capacity units
- ✅ Explore the different ways to connect to DynamoDB — the console, NoSQL Workbench, DynamoDB local, PartiQL, the AWS CLI, and the SDKs
- ✅ Define the SDK dependencies and configuration in your code — Java 2.x, Python (boto3), and .NET namespaces and client creation
- ✅ Use request and response objects — the request and response formats of the low-level API and the three components of an error
